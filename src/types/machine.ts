export type MachineId = 'id-1' | 'id-2' | 'id-3';

export type MachineStatus = 'running' | 'stopped' | 'warning';

export type LogLevel = 'info' | 'warning' | 'system';

export type Vector3Tuple = [number, number, number];

export interface MachineState {
  id: MachineId;
  name: string;
  role?: string;
  position?: Vector3Tuple;
  baseColor?: string;
  accentColor?: string;
  status: MachineStatus;
  temp: number;
  vibration: number;
  operatingRate: number;
  isWarning: boolean;
}

export type MachineStateMap = Record<MachineId, MachineState>;

export type TemperatureHistoryPoint = {
  time: string;
  timestamp: number;
} & Record<MachineId, number>;

export interface MachineLog {
  id: string;
  machineId: MachineId;
  level: LogLevel;
  message: string;
  timestamp: number;
}
