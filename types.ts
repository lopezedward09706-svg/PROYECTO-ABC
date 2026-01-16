
export interface ABCNode {
  type: 'a' | 'b' | 'c' | 'A' | 'B' | 'C';
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  radius: number;
  clockPhase: number; // 0 to 2π for a->b->c cycle
  mass: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ia1' | 'ia2' | 'ia3' | 'ia4' | 'ia5' | 'ia6' | 'ia7';
  icon?: string;
}

export interface IAConfig {
  id: number;
  name: string;
  color: string;
  icon: string;
  function: string;
  description: string;
  confidence: number;
  status: string;
}

export interface ParticleDef {
  name: string;
  combination: string[];
  charge: number;
  mass: number;
  description: string;
}

export interface ValidationResult {
  source: string;
  prediction: string;
  data: string;
  status: 'matched' | 'deviated' | 'pending';
  confidence: number;
}

export interface SavedSimulation {
  id: string;
  name: string;
  timestamp: string;
  params: {
    speed: number;
    density: number;
    distance: number;
    force: number;
  };
  globalScore: number;
}

export interface PublicationMetadata {
  title: string;
  abstract: string;
  authors: string;
  orcid: string;
  keywords: string;
}

export interface PublicationStatus {
  zenodo: 'idle' | 'uploading' | 'published' | 'error';
  arxiv: 'idle' | 'uploading' | 'pending_harvest' | 'error';
  github: 'idle' | 'uploading' | 'synced' | 'error';
  cern: 'idle' | 'waiting_harvest' | 'archived';
}
