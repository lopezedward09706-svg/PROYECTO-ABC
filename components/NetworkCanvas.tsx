
import React, { useRef, useEffect, useCallback } from 'react';
import { ABCNode } from '../types';
import { ABC_NODES_DEF } from '../constants';

interface Props {
  isSimulating: boolean;
  viewMode: '2d' | '3d' | 'network';
  speed: number;
  density: number;
  interactionDistance: number;
  interactionForce: number;
  showConnections: boolean;
  isForceEnabled: boolean;
  rotationX?: number;
  rotationY?: number;
  zoom?: number;
}

const NetworkCanvas: React.FC<Props> = ({ 
  isSimulating, 
  viewMode, 
  speed, 
  density, 
  interactionDistance,
  interactionForce,
  showConnections,
  isForceEnabled,
  rotationX = 0,
  rotationY = 0,
  zoom = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<ABCNode[]>([]);
  const requestRef = useRef<number>(0);

  const createNodes = useCallback((width: number, height: number) => {
    const newNodes: ABCNode[] = [];
    const size = 400;
    for (let i = 0; i < density; i++) {
      const isStrong = Math.random() > 0.92;
      const baseType = ['a', 'b', 'c'][Math.floor(Math.random() * 3)] as 'a' | 'b' | 'c';
      const type = isStrong ? baseType.toUpperCase() as 'A' | 'B' | 'C' : baseType;
      
      newNodes.push({
        type,
        x: (Math.random() - 0.5) * size,
        y: (Math.random() - 0.5) * size,
        z: (Math.random() - 0.5) * size,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
        dz: (Math.random() - 0.5) * 1.5,
        radius: isStrong ? 14 : 5,
        clockPhase: Math.random() * Math.PI * 2,
        mass: isStrong ? 25 : 1
      });
    }
    nodesRef.current = newNodes;
  }, [density]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#050a0f';
    ctx.fillRect(0, 0, width, height);

    const nodes = nodesRef.current;
    const is3D = viewMode === '3d';
    const strongNodes = nodes.filter(n => n.mass > 1);

    if (isSimulating) {
      // Constantes de red simplificadas (G=1, c=15)
      const c = 15;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        
        // 1. Cálculo de Potencial Gravitatorio Local (Phi)
        let localPhi = 0;
        strongNodes.forEach(sn => {
          if (sn !== n1) {
            const dx = sn.x - n1.x;
            const dy = sn.y - n1.y;
            const dz = sn.z - n1.z;
            const d = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
            localPhi += (1 * sn.mass) / (d * 1); // phi = GM/r
          }
        });

        // 2. Dilatación Temporal Combinada (Métrica ABC)
        // factor = gamma * (1 + phi)
        const v = Math.sqrt(n1.dx**2 + n1.dy**2 + n1.dz**2) * speed;
        const gamma = 1 / Math.sqrt(Math.max(0.01, 1 - (v * v) / (c * c)));
        const timeFactor = gamma * (1 + localPhi);
        
        // El reloj corre más lento si el factor es alto
        n1.clockPhase = (n1.clockPhase + (0.08 / timeFactor)) % (Math.PI * 2);

        // 3. Física de Interacción
        if (isForceEnabled) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dz = is3D ? (n2.z - n1.z) : 0;
            const distSq = dx * dx + dy * dy + dz * dz;
            const dist = Math.sqrt(distSq);

            if (dist < interactionDistance && dist > 2) {
              const force = (interactionDistance - dist) / interactionDistance * interactionForce * 0.1;
              const massFactor = (n1.mass * n2.mass);
              const fx = (dx / dist) * force * massFactor;
              const fy = (dy / dist) * force * massFactor;
              const fz = is3D ? (dz / dist) * force * massFactor : 0;

              n1.dx -= fx / n1.mass; n1.dy -= fy / n1.mass; n1.dz -= fz / n1.mass;
              n2.dx += fx / n2.mass; n2.dy += fy / n2.mass; n2.dz += fz / n2.mass;
            }
          }
        }

        n1.x += n1.dx * speed * 0.4;
        n1.y += n1.dy * speed * 0.4;
        if (is3D) n1.z += n1.dz * speed * 0.4;

        n1.dx *= 0.99; n1.dy *= 0.99; if (is3D) n1.dz *= 0.99;

        const boundary = is3D ? 250 : Math.max(width, height) / 2;
        if (Math.abs(n1.x) > boundary) { n1.x = Math.sign(n1.x) * boundary; n1.dx *= -0.7; }
        if (Math.abs(n1.y) > boundary) { n1.y = Math.sign(n1.y) * boundary; n1.dy *= -0.7; }
        if (is3D && Math.abs(n1.z) > boundary) { n1.z = Math.sign(n1.z) * boundary; n1.dz *= -0.7; }
      }
    }

    const radX = (rotationX || 0) * (Math.PI / 180);
    const radY = (rotationY || 0) * (Math.PI / 180);
    
    const projectedNodes = nodes.map(node => {
      let x = node.x; let y = node.y; let z = node.z;
      if (is3D) {
        let nx = x * Math.cos(radY) - z * Math.sin(radY);
        let nz = x * Math.sin(radY) + z * Math.cos(radY);
        x = nx; z = nz;
        let ny = y * Math.cos(radX) - z * Math.sin(radX);
        nz = y * Math.sin(radX) + z * Math.cos(radX);
        y = ny; z = nz;
      }
      const focalLength = 600;
      const zEff = z * zoom;
      const distToCamera = focalLength + zEff;
      const perspective = (is3D && distToCamera > 20) ? focalLength / distToCamera : (is3D ? 0 : 1);
      return { ...node, px: x * perspective * zoom + width / 2, py: y * perspective * zoom + height / 2, pz: z, pScale: perspective };
    }).filter(n => n.pScale > 0);

    projectedNodes.sort((a, b) => b.pz - a.pz);

    if (showConnections) {
      ctx.lineWidth = 1;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i]; const n2 = projectedNodes[j];
          const distSq = Math.pow(n1.px - n2.px, 2) + Math.pow(n1.py - n2.py, 2);
          const drawDist = interactionDistance * n1.pScale;
          if (distSq < drawDist * drawDist) {
            const alpha = Math.max(0, 0.15 * (1 - Math.sqrt(distSq) / drawDist));
            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.beginPath(); ctx.moveTo(n1.px, n1.py); ctx.lineTo(n2.px, n2.py); ctx.stroke();
          }
        }
      }
    }

    projectedNodes.forEach(node => {
      const config = ABC_NODES_DEF[node.type as keyof typeof ABC_NODES_DEF] || ABC_NODES_DEF['a'];
      const visualRadius = Math.max(0.5, node.radius * node.pScale);
      
      const pulse = Math.sin(node.clockPhase) * 0.4 + 0.6;
      ctx.globalAlpha = is3D ? Math.max(0.2, Math.min(1, node.pScale)) * pulse : pulse;

      // Glow de deformación
      const glowRadius = visualRadius * 4;
      const gradient = ctx.createRadialGradient(node.px, node.py, 0, node.px, node.py, glowRadius);
      gradient.addColorStop(0, config.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(node.px, node.py, glowRadius, 0, Math.PI * 2); ctx.fill();

      // Centro del Nodo
      ctx.beginPath(); ctx.arc(node.px, node.py, visualRadius, 0, Math.PI * 2);
      ctx.fillStyle = config.color;
      ctx.fill();
      
      if (node.mass > 1) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 * node.pScale;
        ctx.stroke();
        // Aura de masa
        ctx.beginPath();
        ctx.arc(node.px, node.py, visualRadius * 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
    });

    requestRef.current = requestAnimationFrame(() => draw(ctx));
  }, [isSimulating, viewMode, speed, interactionDistance, interactionForce, showConnections, isForceEnabled, rotationX, rotationY, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      createNodes(canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();
    draw(ctx);
    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [createNodes, draw]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden cursor-crosshair">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default NetworkCanvas;
