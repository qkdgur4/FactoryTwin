import type {
  LogLevel,
  MachineId,
  MachineLog,
  MachineState,
  MachineStateMap,
  TemperatureHistoryPoint,
} from '../types/machine';

export const MACHINE_IDS: MachineId[] = ['id-1', 'id-2', 'id-3'];

export const WARNING_TEMP = 80;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

const machineSeed: MachineStateMap = {
  'id-1': {
    id: 'id-1',
    name: 'Press Line Alpha',
    role: 'Hydraulic press station',
    position: [-2.55, 0, -0.85],
    baseColor: '#0f766e',
    accentColor: '#67e8f9',
    status: 'running',
    temp: 62,
    vibration: 2.4,
    operatingRate: 86,
    isWarning: false,
  },
  'id-2': {
    id: 'id-2',
    name: 'CNC Cell Beta',
    role: 'Precision milling cell',
    position: [0, 0, 1.15],
    baseColor: '#1d4ed8',
    accentColor: '#93c5fd',
    status: 'running',
    temp: 68,
    vibration: 3.1,
    operatingRate: 78,
    isWarning: false,
  },
  'id-3': {
    id: 'id-3',
    name: 'Assembly Arm Gamma',
    role: 'Robotic assembly station',
    position: [2.55, 0, -0.85],
    baseColor: '#7c3aed',
    accentColor: '#c4b5fd',
    status: 'running',
    temp: 58,
    vibration: 1.8,
    operatingRate: 91,
    isWarning: false,
  },
};

export function buildInitialMachineStates(): MachineStateMap {
  return {
    'id-1': { ...machineSeed['id-1'] },
    'id-2': { ...machineSeed['id-2'] },
    'id-3': { ...machineSeed['id-3'] },
  };
}

export function getNextMachineState(
  current: MachineState,
  random: () => number = Math.random,
): MachineState {
  if (current.status === 'stopped') {
    const temp = round(current.temp + (34 - current.temp) * 0.14);
    const vibration = round(Math.max(0.2, current.vibration * 0.72));
    const operatingRate = round(Math.max(0, current.operatingRate - 16 - random() * 4));

    return {
      ...current,
      status: 'stopped',
      temp,
      vibration,
      operatingRate,
      isWarning: temp > WARNING_TEMP,
    };
  }

  const heatBias = current.temp > 76 ? 0.8 : random() > 0.86 ? 2.6 : 0;
  const tempDelta = (random() - 0.46) * 3.2 + heatBias;
  const temp = round(clamp(current.temp + tempDelta, 34, 96));
  const vibration = round(clamp(current.vibration + (random() - 0.5) * 0.7, 0.4, 8));
  const operatingRate = round(
    clamp(current.operatingRate + (random() - 0.46) * 5, 42, 100),
  );
  const isWarning = temp > WARNING_TEMP;

  return {
    ...current,
    status: isWarning ? 'warning' : 'running',
    temp,
    vibration,
    operatingRate,
    isWarning,
  };
}

export function createHistoryPoint(
  states: MachineStateMap,
  timestamp = Date.now(),
): TemperatureHistoryPoint {
  const time = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(timestamp);

  return {
    time,
    timestamp,
    'id-1': states['id-1'].temp,
    'id-2': states['id-2'].temp,
    'id-3': states['id-3'].temp,
  };
}

export function createInitialHistory(states: MachineStateMap): TemperatureHistoryPoint[] {
  const now = Date.now();

  return Array.from({ length: 8 }, (_, index) =>
    createHistoryPoint(states, now - (7 - index) * 1000),
  );
}

export function trimHistory(
  history: TemperatureHistoryPoint[],
): TemperatureHistoryPoint[] {
  return history.slice(-20);
}

export function createMachineLog(
  machineId: MachineId,
  message: string,
  level: LogLevel,
): MachineLog {
  return {
    id: `${Date.now()}-${machineId}-${Math.random().toString(16).slice(2)}`,
    machineId,
    level,
    message,
    timestamp: Date.now(),
  };
}

export function trimLogs(logs: MachineLog[]): MachineLog[] {
  return logs
    .map((log, index) => ({ log, index }))
    .sort(
      (left, right) =>
        right.log.timestamp - left.log.timestamp || right.index - left.index,
    )
    .slice(0, 50)
    .map(({ log }) => log);
}
