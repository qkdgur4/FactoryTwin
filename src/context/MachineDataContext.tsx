import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  MachineId,
  MachineLog,
  MachineStateMap,
  TemperatureHistoryPoint,
} from '../types/machine';
import {
  buildInitialMachineStates,
  createHistoryPoint,
  createInitialHistory,
  createMachineLog,
  getNextMachineState,
  MACHINE_IDS,
  trimHistory,
  trimLogs,
  WARNING_TEMP,
} from '../utils/machineSimulation';
import {
  MachineDataContext,
  type MachineDataContextValue,
} from './machineDataContextValue';

const initialMachines = buildInitialMachineStates();

const initialLogs: MachineLog[] = [
  createMachineLog('id-1', 'FactoryTwin telemetry stream initialized', 'system'),
];

function buildTickLogs(previous: MachineStateMap, next: MachineStateMap): MachineLog[] {
  const logs: MachineLog[] = [];
  const hottestMachine = MACHINE_IDS.reduce((hottest, machineId) =>
    next[machineId].temp > next[hottest].temp ? machineId : hottest,
  );

  logs.push(
    createMachineLog(
      hottestMachine,
      `${next[hottestMachine].name} temp ${next[hottestMachine].temp.toFixed(1)}C, vibration ${next[
        hottestMachine
      ].vibration.toFixed(1)}mm/s`,
      next[hottestMachine].isWarning ? 'warning' : 'info',
    ),
  );

  MACHINE_IDS.forEach((machineId) => {
    if (!previous[machineId].isWarning && next[machineId].isWarning) {
      logs.push(
        createMachineLog(
          machineId,
          `${next[machineId].name} exceeded ${WARNING_TEMP}C threshold`,
          'warning',
        ),
      );
    }
  });

  return logs;
}

export function MachineDataProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<MachineStateMap>(initialMachines);
  const [history, setHistory] = useState<TemperatureHistoryPoint[]>(
    createInitialHistory(initialMachines),
  );
  const [logs, setLogs] = useState<MachineLog[]>(initialLogs);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMachines((current) => {
        const next = MACHINE_IDS.reduce((accumulator, machineId) => {
          accumulator[machineId] = getNextMachineState(current[machineId]);
          return accumulator;
        }, {} as MachineStateMap);

        setHistory((currentHistory) =>
          trimHistory([...currentHistory, createHistoryPoint(next)]),
        );
        setLogs((currentLogs) =>
          trimLogs([...currentLogs, ...buildTickLogs(current, next)]),
        );

        return next;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const toggleMachine = useCallback((machineId: MachineId) => {
    setMachines((current) => {
      const machine = current[machineId];
      const shouldStop = machine.status !== 'stopped';
      const updatedMachine = shouldStop
        ? {
            ...machine,
            status: 'stopped' as const,
            operatingRate: 0,
            isWarning: machine.temp > WARNING_TEMP,
          }
        : {
            ...machine,
            status: machine.temp > WARNING_TEMP ? ('warning' as const) : ('running' as const),
            operatingRate: Math.max(machine.operatingRate, 64),
            isWarning: machine.temp > WARNING_TEMP,
          };

      setLogs((currentLogs) =>
        trimLogs([
          ...currentLogs,
          createMachineLog(
            machineId,
            `${machine.name} ${shouldStop ? 'manual stop command accepted' : 'restart command accepted'}`,
            'system',
          ),
        ]),
      );

      return {
        ...current,
        [machineId]: updatedMachine,
      };
    });
  }, []);

  const value = useMemo<MachineDataContextValue>(() => {
    const warningMachines = MACHINE_IDS.filter(
      (machineId) => machines[machineId].isWarning,
    );

    return {
      machines,
      history,
      logs,
      warningMachines,
      toggleMachine,
    };
  }, [history, logs, machines, toggleMachine]);

  return (
    <MachineDataContext.Provider value={value}>
      {children}
    </MachineDataContext.Provider>
  );
}
