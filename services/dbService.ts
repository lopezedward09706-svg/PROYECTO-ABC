
import { SavedSimulation } from '../types';

const DB_KEY = 'abc_validation_history';

export const saveSimulation = (sim: SavedSimulation) => {
  const current = getSavedSimulations();
  const updated = [sim, ...current].slice(0, 50);
  localStorage.setItem(DB_KEY, JSON.stringify(updated));
};

export const getSavedSimulations = (): SavedSimulation[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearHistory = () => {
  localStorage.removeItem(DB_KEY);
};
