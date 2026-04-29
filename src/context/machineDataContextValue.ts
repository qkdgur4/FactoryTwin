import { createContext } from 'react';
import type {
  MachineId,
  MachineLog,
  MachineStateMap,
  TemperatureHistoryPoint,
} from '../types/machine';

export interface MachineDataContextValue {
  machines: MachineStateMap;
  history: TemperatureHistoryPoint[];
  logs: MachineLog[];
  warningMachines: MachineId[];
  toggleMachine: (machineId: MachineId) => void;
}

export const MachineDataContext = createContext<
  MachineDataContextValue | undefined
>(undefined);
