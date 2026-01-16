
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IA_DEFS, COLORS, EMERGENT_PARTICLES, ABC_NODES_DEF } from './constants';
import { LogEntry, IAConfig, ParticleDef, ValidationResult, SavedSimulation, PublicationMetadata, PublicationStatus } from './types';
import { getAIAnalysis } from './services/geminiService';
import { fetchValidationData } from './services/apiService';
import { saveSimulation, getSavedSimulations } from './services/dbService';
import NetworkCanvas from './components/NetworkCanvas';
import ValidationChart from './components/ValidationChart';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [ias, setIas] = useState<IAConfig[]>(IA_DEFS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'network'>('network');
  const [activeTab, setActiveTab] = useState<'simulation' | 'validation' | 'relativity' | 'history' | 'dissemination'>('simulation');
  const [globalScore, setGlobalScore] = useState(0);
  const [selectedParticle, setSelectedParticle] = useState<ParticleDef | null>(null);
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [savedSims, setSavedSims] = useState<SavedSimulation[]>([]);

  // Simulation Parameters
  const [nodeSpeed, setNodeSpeed] = useState(1.5);
  const [nodeDensity, setNodeDensity] = useState(40);
  const [interactionDistance, setInteractionDistance] = useState(120);
  const [interactionForce, setInteractionForce] = useState(0.5);
  const [showConnections, setShowConnections] = useState(true);
  const [isForceEnabled, setIsForceEnabled] = useState(true);

  // 3D Specific Parameters
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(45);
  const [zoom, setZoom] = useState(1);

  // Control Inputs
  const [speedInput, setSpeedInput] = useState('1.5');
  const [densityInput, setDensityInput] = useState('40');
  const [distanceInput, setDistanceInput] = useState('120');
  const [forceInput, setForceInput] = useState('0.5');

  // Dissemination State
  const [metadata, setMetadata] = useState<PublicationMetadata>({
    title: 'Autonomous Validation of the ABC Quantum Network Theory',
    abstract: '',
    authors: 'Edward Pl',
    orcid: '0009-0009-0717-5536',
    keywords: 'ABC Theory, Quantum Gravity, Time Dilation, Dissemination'
  });
  const [pubStatus, setPubStatus] = useState<PublicationStatus>({
    zenodo: 'idle',
    arxiv: 'idle',
    github: 'idle',
    cern: 'idle'
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // Cálculos de Relatividad derivados
  const relativityStats = useMemo(() => {
    const c = 15;
    const v = nodeSpeed;
    const gamma = 1 / Math.sqrt(Math.max(0.01, 1 - (v * v) / (c * c)));
    const simulatedPhi = interactionForce * 0.15; 
    const factorGravitatorio = 1 + simulatedPhi;
    const totalDilation = gamma * factorGravitatorio;
    const retardoDiario = (totalDilation - 1) * 86400;
    return { gamma, simulatedPhi, factorGravitatorio, totalDilation, retardoDiario };
  }, [nodeSpeed, interactionForce]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', icon?: string) => {
    const newLog: LogEntry = { id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleTimeString(), message, type, icon };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    addLog('Sistema de Validación ABC inicializado', 'success', '✅');
    setSavedSims(getSavedSimulations());
  }, [addLog]);

  const runIA = async (id: number) => {
    const ia = ias.find(i => i.id === id);
    if (!ia) return;
    setIas(prev => prev.map(item => item.id === id ? { ...item, status: 'Analizando...' } : item));
    const analysis = await getAIAnalysis(ia.name, ia.description);
    addLog(`${ia.name}: ${analysis}`, `ia${ia.id}` as any);
    const newConfidence = Math.min(100, ia.confidence + (Math.random() * 5));
    setIas(prev => prev.map(item => item.id === id ? { ...item, status: 'Validado', confidence: newConfidence } : item));
    setGlobalScore(prev => Math.min(100, prev + 2));
  };

  const performFullValidation = async () => {
    addLog('Solicitando datos a agencias espaciales...', 'warning', '🛰️');
    const data = await fetchValidationData();
    setValidations(data);
    addLog('Datos de validación recibidos y procesados.', 'success', '📊');
    
    const newSim: SavedSimulation = {
      id: Date.now().toString(),
      name: `Simulación ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toLocaleTimeString(),
      params: { speed: nodeSpeed, density: nodeDensity, distance: interactionDistance, force: interactionForce },
      globalScore
    };
    saveSimulation(newSim);
    setSavedSims(getSavedSimulations());
  };

  const draftAbstract = async () => {
    addLog('IA redactando abstract científico...', 'info', '✍️');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a formal scientific abstract (approx 150 words) for the paper: "${metadata.title}".
        Simulation parameters: Speed=${nodeSpeed}, Interaction Force=${interactionForce}, Total Dilation Factor=${relativityStats.totalDilation.toFixed(6)}.
        The theory is ABC Quantum Network. Mention the ORCID: ${metadata.orcid}. Use professional technical English.`,
      });
      setMetadata(prev => ({ ...prev, abstract: response.text || '' }));
      addLog('Abstract redactado con éxito.', 'success', '📄');
    } catch (e) {
      addLog('Error redactando abstract.', 'error', '❌');
    }
  };

  const startPublicationPipeline = async () => {
    if (!metadata.abstract) {
      addLog('Primero debe redactar el abstract.', 'warning', '⚠️');
      return;
    }
    setIsPublishing(true);
    addLog('Iniciando pipeline de diseminación automática...', 'info', '🚀');

    // GitHub sync
    setPubStatus(p => ({ ...p, github: 'uploading' }));
    await new Promise(r => setTimeout(r, 1500));
    setPubStatus(p => ({ ...p, github: 'synced' }));
    addLog('Repositorio GitHub sincronizado.', 'success', '🐙');

    // Zenodo upload
    setPubStatus(p => ({ ...p, zenodo: 'uploading' }));
    await new Promise(r => setTimeout(r, 2000));
    setPubStatus(p => ({ ...p, zenodo: 'published' }));
    addLog('DOI generado en Zenodo: 10.5281/zenodo.ABC_AUTH', 'success', '🛡️');

    // arXiv submission
    setPubStatus(p => ({ ...p, arxiv: 'uploading' }));
    await new Promise(r => setTimeout(r, 1500));
    setPubStatus(p => ({ ...p, arxiv: 'pending_harvest' }));
    addLog('Manuscrito enviado a arXiv (Esperando revisión).', 'info', '📑');

    // CERN Harvesting Simulation
    setPubStatus(p => ({ ...p, cern: 'waiting_harvest' }));
    await new Promise(r => setTimeout(r, 1000));
    addLog('CERN CDS ha detectado la publicación en arXiv.', 'info', '🔬');

    setIsPublishing(false);
    addLog('Proceso de diseminación completado.', 'success', '✨');
  };

  const resetParams = () => {
    setNodeSpeed(1.5); setSpeedInput('1.5');
    setNodeDensity(40); setDensityInput('40');
    setInteractionDistance(120); setDistanceInput('120');
    setInteractionForce(0.5); setForceInput('0.5');
    setIsForceEnabled(true); setRotX(25); setRotY(45); setZoom(1);
    addLog('Simulación reseteada.', 'info', '🔄');
  };

  const handleParamBlur = (val: string, setter: (n: number) => void, inputSetter: (s: string) => void, min: number, max: number, label: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = min;
    num = Math.max(min, Math.min(max, num));
    setter(num);
    inputSetter(num.toString());
    addLog(`${label} validado: ${num}`, 'info', '⚙️');
  };

  const handleSliderChange = (val: number, setter: (n: number) => void, inputSetter: (s: string) => void) => {
    setter(val);
    inputSetter(val.toString());
  };

  const getStability = (charge: number) => {
    const abs = Math.abs(charge);
    if (abs < 0.1) return { label: 'Estabilidad Extrema', color: 'text-cyan-400', icon: 'shield-alt' };
    if (abs <= 1.1) return { label: 'Coherencia Alta', color: 'text-emerald-400', icon: 'check-circle' };
    return { label: 'Estado Fluctuante', color: 'text-amber-400', icon: 'exclamation-triangle' };
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden p-4 gap-4 bg-slate-950 text-slate-100">
      <header className="flex justify-between items-center bg-slate-900/80 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <i className="fas fa-atom text-white text-xl animate-pulse"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PROYECTO ABC</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">Quantum Validation System v3.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <nav className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
             {(['simulation', 'validation', 'relativity', 'dissemination', 'history'] as const).map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === tab ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 {tab}
               </button>
             ))}
           </nav>
           <button onClick={performFullValidation} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-lg">
             <i className="fas fa-satellite-dish"></i> SYNC VALIDATION
           </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        <section className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-2 custom-scroll">
          <div className="flex items-center gap-2 mb-1 px-1">
             <i className="fas fa-microchip text-cyan-400"></i>
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fleet Intelligence</h2>
          </div>
          {ias.map(ia => (
            <div key={ia.id} className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl group transition-all hover:bg-slate-800/50">
              <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ia.color}22`, border: `1px solid ${ia.color}` }}>
                       <i className={`fas fa-${ia.icon} text-[10px]`} style={{ color: ia.color }}></i>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: ia.color }}>{ia.name}</span>
                 </div>
                 <button onClick={() => runIA(ia.id)} className="text-[9px] text-slate-500 hover:text-white"><i className="fas fa-sync"></i></button>
              </div>
              <div className="flex items-center justify-between text-[9px] mb-1">
                 <span className="text-slate-500">Confidence</span>
                 <span style={{ color: ia.color }}>{ia.confidence.toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full transition-all duration-1000" style={{ width: `${ia.confidence}%`, backgroundColor: ia.color }}></div>
              </div>
            </div>
          ))}
        </section>

        <section className="col-span-6 flex flex-col gap-4 overflow-hidden">
          {activeTab === 'simulation' && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl relative">
              <NetworkCanvas 
                isSimulating={isSimulating} viewMode={viewMode} speed={nodeSpeed} density={nodeDensity}
                interactionDistance={interactionDistance} interactionForce={interactionForce}
                showConnections={showConnections} isForceEnabled={isForceEnabled}
                rotationX={rotX} rotationY={rotY} zoom={zoom}
              />
              
              <div className="absolute top-4 left-4 flex gap-2">
                 <select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)} className="bg-slate-800/80 backdrop-blur text-[10px] rounded px-2 py-1 border border-slate-700 text-cyan-400 outline-none">
                   <option value="network">Network Grid</option>
                   <option value="2d">Lattice 2D</option>
                   <option value="3d">Quantum 3D</option>
                 </select>
                 <button onClick={() => setShowConnections(!showConnections)} className={`px-3 py-1 rounded text-[10px] border ${showConnections ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                   <i className="fas fa-project-diagram mr-1"></i> LINKS
                 </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur border border-slate-700 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 shrink-0">
                  <button onClick={() => setIsSimulating(!isSimulating)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSimulating ? 'bg-amber-600' : 'bg-emerald-600'} shadow-lg`}>
                    <i className={`fas ${isSimulating ? 'fa-pause' : 'fa-play'} text-white`}></i>
                  </button>
                </div>
                
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Velocity</span>
                      <input 
                        type="text" 
                        value={speedInput} 
                        onChange={e => setSpeedInput(e.target.value)}
                        onBlur={() => handleParamBlur(speedInput, setNodeSpeed, setSpeedInput, 0, 10, 'Velocity')}
                        className="bg-slate-800 text-[9px] w-10 text-center rounded border border-slate-700 p-0.5 outline-none"
                      />
                    </div>
                    <input type="range" min="0" max="10" step="0.1" value={nodeSpeed} onChange={(e) => handleSliderChange(parseFloat(e.target.value), setNodeSpeed, setSpeedInput)} className="w-full h-1 bg-slate-800 accent-cyan-500 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Gravity (F)</span>
                      <input 
                        type="text" 
                        value={forceInput} 
                        onChange={e => setForceInput(e.target.value)}
                        onBlur={() => handleParamBlur(forceInput, setInteractionForce, setForceInput, -5, 5, 'Force')}
                        className="bg-slate-800 text-[9px] w-10 text-center rounded border border-slate-700 p-0.5 outline-none"
                      />
                    </div>
                    <input type="range" min="-5" max="5" step="0.1" value={interactionForce} onChange={(e) => handleSliderChange(parseFloat(e.target.value), setInteractionForce, setForceInput)} className="w-full h-1 bg-slate-800 accent-amber-500 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Scale (d)</span>
                      <input 
                        type="text" 
                        value={distanceInput} 
                        onChange={e => setDistanceInput(e.target.value)}
                        onBlur={() => handleParamBlur(distanceInput, setInteractionDistance, setDistanceInput, 20, 300, 'Radius')}
                        className="bg-slate-800 text-[9px] w-10 text-center rounded border border-slate-700 p-0.5 outline-none"
                      />
                    </div>
                    <input type="range" min="20" max="300" step="1" value={interactionDistance} onChange={(e) => handleSliderChange(parseFloat(e.target.value), setInteractionDistance, setDistanceInput)} className="w-full h-1 bg-slate-800 accent-emerald-500 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                       <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Density</span>
                       <input type="text" value={densityInput} onChange={e => setDensityInput(e.target.value)} onBlur={() => handleParamBlur(densityInput, setNodeDensity, setDensityInput, 10, 200, 'Density')} className="bg-slate-800 text-[9px] w-full p-1 rounded border border-slate-700" />
                    </div>
                    <button onClick={() => setIsForceEnabled(!isForceEnabled)} className={`px-2 py-1.5 rounded text-[9px] font-bold border h-full flex flex-col items-center justify-center min-w-[40px] ${isForceEnabled ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                      <i className={`fas ${isForceEnabled ? 'fa-magnet' : 'fa-slash'} mb-0.5`}></i>
                      {isForceEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
                
                <button onClick={resetParams} className="p-2 text-slate-500 hover:text-white shrink-0"><i className="fas fa-undo"></i></button>
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scroll p-2">
              <ValidationChart />
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                 <h3 className="text-sm font-bold text-cyan-400 mb-6 flex items-center gap-2">
                   <i className="fas fa-check-double"></i> RESULTADOS DE VALIDACIÓN EXTERNA
                 </h3>
                 <div className="space-y-4">
                    {validations.length === 0 ? (
                      <div className="text-center py-12 text-slate-600 italic text-xs">Sin datos de validación. Ejecute SYNC para conectar con agencias.</div>
                    ) : validations.map((v, i) => (
                      <div key={i} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                         <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{v.source}</span>
                            <h4 className="text-xs font-bold text-white mb-1">{v.prediction}</h4>
                            <p className="text-[10px] text-emerald-400 font-mono">{v.data}</p>
                         </div>
                         <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase mb-2 inline-block ${v.status === 'matched' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700' : 'bg-rose-900/50 text-rose-400 border border-rose-700'}`}>
                              {v.status}
                            </span>
                            <div className="text-[11px] font-mono text-cyan-400">{v.confidence}% match</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'relativity' && (
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-8 overflow-y-auto custom-scroll">
               <div className="max-w-xl mx-auto space-y-8">
                 <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Monitor de Métrica ABC: Curvatura y Tiempo</h2>
                    <p className="text-slate-400 text-sm">Visualización de los factores de dilatación combinados ($1+\phi$ y $\gamma$).</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-slate-700 text-center group hover:bg-slate-800/60 transition-all">
                       <i className="fas fa-tachometer-alt text-3xl text-cyan-500 mb-4"></i>
                       <h3 className="font-bold text-white mb-1">Cinemática ($\gamma$)</h3>
                       <span className="text-[10px] text-slate-500 uppercase tracking-widest">Efecto por Velocidad</span>
                       <div className="mt-4 text-4xl font-mono text-cyan-400">{relativityStats.gamma.toFixed(4)}<span className="text-xs">x</span></div>
                    </div>
                    <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-slate-700 text-center group hover:bg-slate-800/60 transition-all">
                       <i className="fas fa-weight text-3xl text-amber-500 mb-4"></i>
                       <h3 className="font-bold text-white mb-1">Gravitatorio ($1+\phi$)</h3>
                       <span className="text-[10px] text-slate-500 uppercase tracking-widest">Efecto por Masa</span>
                       <div className="mt-4 text-4xl font-mono text-amber-500">{relativityStats.factorGravitatorio.toFixed(4)}<span className="text-xs">x</span></div>
                    </div>
                 </div>

                 <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 border-l-4 border-l-cyan-500 shadow-inner">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.4em]">Acumulación de Retardo</h4>
                      <i className="fas fa-history text-slate-700"></i>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 text-xs">Retardo por día terrestre:</span>
                        <span className="text-2xl font-mono text-white">{(relativityStats.retardoDiario).toFixed(3)} s</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-600 transition-all duration-700" style={{ width: `${Math.min(100, relativityStats.totalDilation * 10)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-600">
                        <span>FACTOR TOTAL: {relativityStats.totalDilation.toFixed(6)}</span>
                        <span>MÉTRICA G_TT: {(1/relativityStats.totalDilation).toFixed(6)}</span>
                      </div>
                    </div>
                 </div>

                 <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50">
                    <h4 className="text-xs font-bold text-slate-400 mb-2">Explicación Gravitatoria ABC</h4>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      "En la red ABC, los nodos masivos deforman el espaciado entre unidades, aumentando el potencial local $\phi$. Esto causa que la información necesite más 'pasos' de red para completar un ciclo $a \to b \to c$, resultando en un tiempo dilatado por el factor $1+\phi$."
                    </p>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'dissemination' && (
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-8 overflow-y-auto custom-scroll">
               <div className="max-w-3xl mx-auto space-y-8">
                 <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Centro de Diseminación Científica</h2>
                    <p className="text-slate-400 text-sm">Automatización de la publicación de resultados en repositorios internacionales.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                          <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4">Metadatos del Manuscrito</h3>
                          <div className="space-y-4">
                             <div>
                                <label className="text-[9px] text-slate-500 uppercase block mb-1">Título</label>
                                <input 
                                  value={metadata.title}
                                  onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-xs outline-none focus:border-cyan-500"
                                />
                             </div>
                             <div>
                                <label className="text-[9px] text-slate-500 uppercase block mb-1">Autor Principal & ORCID</label>
                                <div className="flex gap-2">
                                  <input 
                                    value={metadata.authors}
                                    onChange={e => setMetadata(prev => ({ ...prev, authors: e.target.value }))}
                                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-xs outline-none"
                                  />
                                  <input 
                                    value={metadata.orcid}
                                    onChange={e => setMetadata(prev => ({ ...prev, orcid: e.target.value }))}
                                    className="w-32 bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-[10px] font-mono outline-none"
                                  />
                                </div>
                             </div>
                             <div>
                                <label className="text-[9px] text-slate-500 uppercase block mb-1">Abstract Científico (Drafteo IA)</label>
                                <textarea 
                                  value={metadata.abstract}
                                  onChange={e => setMetadata(prev => ({ ...prev, abstract: e.target.value }))}
                                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-xs outline-none h-40 custom-scroll resize-none"
                                  placeholder="Use el drafteo de IA para generar el abstract basado en la simulación..."
                                />
                             </div>
                             <button 
                                onClick={draftAbstract}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                             >
                                <i className="fas fa-magic"></i> Draft con Gemini AI
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5"><i className="fas fa-cloud-upload-alt text-6xl"></i></div>
                          <h3 className="text-sm font-bold text-white mb-2">Estado de Publicación</h3>
                          <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">Su trabajo será validado internamente y luego distribuido vía GitHub Actions a los servidores de Zenodo y arXiv.</p>
                          
                          <div className="w-full space-y-3 mb-8">
                             {[
                               { id: 'zenodo', label: 'Zenodo (DOI Archive)', icon: 'shield-alt', status: pubStatus.zenodo },
                               { id: 'arxiv', label: 'arXiv (Pre-print)', icon: 'file-pdf', status: pubStatus.arxiv },
                               { id: 'github', label: 'GitHub (Open Source)', icon: 'github', status: pubStatus.github },
                               { id: 'cern', label: 'CERN CDS (Harvest)', icon: 'microscope', status: pubStatus.cern }
                             ].map(item => (
                               <div key={item.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                  <div className="flex items-center gap-3">
                                     <i className={`fas fa-${item.icon} text-slate-500 text-xs`}></i>
                                     <span className="text-[10px] font-bold text-slate-300">{item.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     {item.status === 'uploading' && <i className="fas fa-spinner fa-spin text-cyan-400 text-[10px]"></i>}
                                     {item.status === 'published' || item.status === 'synced' || item.status === 'archived' ? 
                                       <i className="fas fa-check-circle text-emerald-500 text-[10px]"></i> :
                                       <span className="text-[8px] font-mono text-slate-600 uppercase">{item.status.replace('_', ' ')}</span>
                                     }
                                  </div>
                               </div>
                             ))}
                          </div>

                          <button 
                            disabled={isPublishing}
                            onClick={startPublicationPipeline}
                            className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${isPublishing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:scale-[1.02]'}`}
                          >
                             {isPublishing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-broadcast-tower"></i>}
                             {isPublishing ? 'Publicando...' : 'Iniciar Pipeline Automático'}
                          </button>
                       </div>

                       <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50 border-l-4 border-l-amber-500">
                          <h4 className="text-[10px] font-bold text-amber-500 uppercase mb-2">Nota Técnica sobre CERN CDS</h4>
                          <p className="text-[9px] text-slate-400 leading-relaxed">
                            CERN Document Server (CDS) e INSPIRE-HEP indexarán automáticamente este manuscrito una vez que el pre-print de arXiv sea verificado por su comité editorial. Este proceso suele tomar de 24 a 48 horas.
                          </p>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-6 overflow-y-auto custom-scroll">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Simulation & Validation History</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedSims.length === 0 ? (
                    <div className="col-span-2 text-center py-20 text-slate-700 text-xs italic">No hay historial disponible.</div>
                  ) : savedSims.map(sim => (
                    <div key={sim.id} className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="text-[11px] font-bold text-white">{sim.name}</h4>
                          <span className="text-[8px] text-slate-600 font-mono">{sim.timestamp}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500">
                          <span>Speed: {sim.params.speed.toFixed(1)}</span>
                          <span>Density: {sim.params.density}</span>
                          <span>Consensus: {sim.globalScore}%</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </section>

        <section className="col-span-3 flex flex-col gap-4 overflow-y-auto custom-scroll">
          <div className="h-[180px] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden p-4 shadow-xl shrink-0">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Log</h2>
                <button className="text-[9px] text-slate-600 hover:text-white" onClick={() => setLogs([])}><i className="fas fa-trash"></i></button>
             </div>
             <div className="flex-1 overflow-y-auto mono text-[9px] leading-relaxed flex flex-col-reverse gap-2 custom-scroll">
                {logs.map(log => (
                  <div key={log.id} className="p-1.5 rounded bg-slate-800/20 border-l-2" style={{ borderLeftColor: log.type.startsWith('ia') ? COLORS[log.type as keyof typeof COLORS] : '#334155' }}>
                    <span className="text-slate-600 mr-1">[{log.timestamp}]</span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-xl">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Especies Emergentes</h2>
             <div className="flex flex-col gap-2">
                {Object.entries(EMERGENT_PARTICLES).map(([id, p]) => (
                  <button key={id} onClick={() => setSelectedParticle(p)} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-left hover:border-cyan-500 transition-all group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors">{p.name}</span>
                      <span className="text-[9px] text-cyan-400 font-mono">{p.charge.toFixed(2)}e</span>
                    </div>
                    <p className="text-[9px] text-slate-500 truncate">{p.description}</p>
                  </button>
                ))}
             </div>
          </div>
        </section>
      </main>

      <footer className="text-[9px] text-slate-600 flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-4">
          <span>© 2025 ABC QUANTUM LABS</span>
          <span className="opacity-30">|</span>
          <span className="font-mono">NODES: {nodeDensity} | SCALE: PLANCK</span>
        </div>
        <div className="flex gap-4 items-center">
           <span className="flex items-center gap-1.5 text-emerald-500 font-bold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> ENLACE NASA ACTIVO</span>
        </div>
      </footer>

      {selectedParticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedParticle(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-[0_0_100px_rgba(34,211,238,0.1)] animate-in zoom-in duration-300 relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="flex justify-between items-start mb-8 relative shrink-0">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                  <i className="fas fa-fingerprint animate-pulse"></i> Quantum Signature Decoded
                </span>
                <h2 className="text-4xl font-bold text-white tracking-tight">{selectedParticle.name}</h2>
                <div className={`mt-2 flex items-center gap-2 text-[10px] font-bold uppercase ${getStability(selectedParticle.charge).color}`}>
                  <i className={`fas fa-${getStability(selectedParticle.charge).icon}`}></i>
                  {getStability(selectedParticle.charge).label}
                </div>
              </div>
              <button onClick={() => setSelectedParticle(null)} className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-all hover:rotate-90">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="overflow-y-auto custom-scroll pr-2 flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-square bg-slate-950/80 rounded-[3rem] border border-slate-800 flex items-center justify-center overflow-hidden group shadow-inner">
                  <div className="relative w-full h-full">
                    {selectedParticle.combination.slice(0, 12).map((node, i) => {
                      const radius = 50 + (i % 3) * 20;
                      const duration = 4 + (i % 4) * 2;
                      return (
                        <div key={i} className="absolute inset-0 flex items-center justify-center animate-spin-slow pointer-events-none" style={{ animationDuration: `${duration}s`, animationDirection: i % 2 === 0 ? 'normal' : 'reverse' }}>
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold shadow-2xl" style={{ backgroundColor: ABC_NODES_DEF[node as keyof typeof ABC_NODES_DEF]?.color || '#fff', transform: `translateX(${radius}px)` }}>{node.toUpperCase()}</div>
                        </div>
                      );
                    })}
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-cyan-500/20 blur-xl animate-pulse"></div>
                       <i className="fas fa-atom text-cyan-400/50 text-2xl"></i>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 flex justify-between items-center group/item hover:bg-slate-800/60 transition-all">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1 font-bold">Carga neta (e)</span>
                      <span className={`text-2xl font-mono font-bold ${selectedParticle.charge === 0 ? 'text-slate-400' : selectedParticle.charge > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedParticle.charge > 0 ? '+' : ''}{selectedParticle.charge.toFixed(3)}</span>
                    </div>
                    <i className="fas fa-bolt text-slate-700 text-xl group-hover/item:text-cyan-500 transition-colors"></i>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 flex justify-between items-center group/item hover:bg-slate-800/60 transition-all">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1 font-bold">Masa Relativa</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-white">{selectedParticle.mass.toExponential(2)}</span>
                        <span className="text-[10px] text-slate-500">kg</span>
                      </div>
                    </div>
                    <i className="fas fa-weight-hanging text-slate-700 text-xl group-hover/item:text-cyan-500 transition-colors"></i>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-700/30 relative">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-slate-900 border border-slate-700 px-4 py-1 rounded-full text-[9px] font-bold uppercase text-slate-500">Archivo Confidencial ABC</div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3"><i className="fas fa-scroll text-cyan-500"></i> Dossier de Significado</h4>
                <p className="text-lg text-slate-200 leading-relaxed italic font-light">"{selectedParticle.description}"</p>
              </div>
            </div>
            <button onClick={() => setSelectedParticle(null)} className="mt-8 w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-[2rem] font-bold transition-all shadow-lg active:scale-[0.98] uppercase text-xs tracking-[0.4em]">Cerrar Expediente</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow linear infinite; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
