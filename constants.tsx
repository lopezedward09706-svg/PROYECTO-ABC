
import { IAConfig, ParticleDef } from './types';

export const COLORS = {
  ia1: '#FF6B6B', // Experimental
  ia2: '#4ECDC4', // Theoretical
  ia3: '#FFD166', // Independent
  ia4: '#06D6A0', // NASA
  ia5: '#118AB2', // SpaceX
  ia6: '#073B4C', // Telescopes
  ia7: '#7209B7', // Predictive
};

export const IA_DEFS: IAConfig[] = [
  { id: 1, name: 'IA Experimental', color: COLORS.ia1, icon: 'flask', function: 'Validación empírica', description: 'Analiza retardos de rayos gamma y patrones del CMB.', confidence: 85, status: 'Esperando datos...' },
  { id: 2, name: 'IA Teórica', color: COLORS.ia2, icon: 'atom', function: 'Consistencia matemática', description: 'Verifica constantes físicas como G y la estructura de red.', confidence: 92, status: 'Analizando geometría...' },
  { id: 3, name: 'IA Independiente', color: COLORS.ia3, icon: 'balance-scale', function: 'Consenso final', description: 'Evaluación imparcial y mitigación de sesgos.', confidence: 78, status: 'Monitoreando...' },
  { id: 4, name: 'IA NASA Data', color: COLORS.ia4, icon: 'satellite', function: 'Datos reales NASA', description: 'Compara predicciones con datasets de Fermi y Planck.', confidence: 65, status: 'Inactiva' },
  { id: 5, name: 'IA SpaceX', color: COLORS.ia5, icon: 'rocket', function: 'Datos telemetría', description: 'Analiza trayectorias y anomalías espaciales.', confidence: 60, status: 'Esperando telemetría...' },
  { id: 6, name: 'IA Telescopios', color: COLORS.ia6, icon: 'telescope', function: 'Red observatorios', description: 'Integración de datos de Hubble, JWST y LIGO.', confidence: 72, status: 'Escaneando...' },
  { id: 7, name: 'IA Predictiva', color: COLORS.ia7, icon: 'chart-line', function: 'Análisis predictivo', description: 'Genera predicciones falsificables para el futuro.', confidence: 80, status: 'Generando...' },
];

export const ABC_NODES_DEF = {
  a: { charge: 1/3, color: '#FF4444', label: 'Alfa', description: 'Nodo de expansión positiva' },
  b: { charge: -2/9, color: '#4444FF', label: 'Beta', description: 'Nodo de contracción leptónica' },
  c: { charge: -1/9, color: '#44FF44', label: 'Gamma', description: 'Nodo de estabilidad bariónica' },
  A: { charge: 1/3, color: '#FF0000', label: 'Alfa-Fuerte', description: 'Nodo masivo de alta energía' },
  B: { charge: -2/9, color: '#0000FF', label: 'Beta-Fuerte', description: 'Nodo leptónico masivo' },
  C: { charge: -1/9, color: '#00FF00', label: 'Gamma-Fuerte', description: 'Nodo bariónico masivo' }
};

export const EMERGENT_PARTICLES: Record<string, ParticleDef> = {
  'quark-up': { 
    name: 'Quark Up', 
    combination: ['a', 'c', 'c'], 
    charge: 2/3, 
    mass: 2.2e-30,
    description: 'Surge de la resonancia de un nodo Alfa con dos nodos Gamma.'
  },
  'quark-down': { 
    name: 'Quark Down', 
    combination: ['c', 'c', 'c'], 
    charge: -1/3, 
    mass: 4.7e-30,
    description: 'Formado puramente por nodos Gamma.'
  },
  'electron': { 
    name: 'Electron', 
    combination: ['b', 'b', 'b'], 
    charge: -1, 
    mass: 9.1e-31,
    description: 'Tríada de nodos Beta genera un campo de torsión electromagnético.'
  },
  'proton': {
    name: 'Protón',
    combination: ['a', 'c', 'c', 'a', 'c', 'c', 'c', 'c', 'c'],
    charge: 1,
    mass: 1.67e-27,
    description: 'Súper-estructura de 9 nodos (triplete de tripletes).'
  },
  'neutron': {
    name: 'Neutrón',
    combination: ['a', 'c', 'c', 'c', 'c', 'c', 'c', 'c', 'c'],
    charge: 0,
    mass: 1.674e-27,
    description: 'Estructura neutra bariónica masiva.'
  },
  'higgs': {
    name: 'Bosón de Higgs',
    combination: ['a', 'b', 'c'],
    charge: 0,
    mass: 2.25e-25,
    description: 'Mediador de la inercia en la red ABC.'
  }
};
