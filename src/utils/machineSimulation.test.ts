import { describe, expect, it } from 'vitest';
import {
  buildInitialMachineStates,
  createInitialHistory,
  createMachineLog,
  getNextMachineState,
  trimHistory,
  trimLogs,
} from './machineSimulation';

describe('machine simulation', () => {
  it('creates three initial machine states with expected ids', () => {
    const states = buildInitialMachineStates();

    expect(Object.keys(states)).toEqual(['id-1', 'id-2', 'id-3']);
    expect(states['id-1'].operatingRate).toBeGreaterThan(0);
    expect(states['id-1'].isWarning).toBe(false);
  });

  it('marks a running machine as warning when temperature rises above threshold', () => {
    const next = getNextMachineState(
      {
        id: 'id-1',
        name: 'Press Line Alpha',
        status: 'running',
        temp: 81,
        vibration: 2.1,
        operatingRate: 88,
        isWarning: false,
      },
      () => 0.5,
    );

    expect(next.isWarning).toBe(true);
    expect(next.status).toBe('warning');
  });

  it('calms sensor values when a machine is stopped', () => {
    const next = getNextMachineState(
      {
        id: 'id-2',
        name: 'CNC Cell Beta',
        status: 'stopped',
        temp: 70,
        vibration: 4,
        operatingRate: 60,
        isWarning: false,
      },
      () => 0.5,
    );

    expect(next.operatingRate).toBeLessThan(60);
    expect(next.vibration).toBeLessThan(4);
    expect(next.temp).toBeLessThan(70);
    expect(next.status).toBe('stopped');
  });

  it('keeps history and logs bounded', () => {
    const states = buildInitialMachineStates();
    const history = createInitialHistory(states);
    const longHistory = [...history, ...history, ...history, ...history];
    const logs = Array.from({ length: 60 }, (_, index) =>
      createMachineLog('id-1', `message-${index}`, 'info'),
    );

    expect(trimHistory(longHistory)).toHaveLength(20);
    expect(trimLogs(logs)).toHaveLength(50);
    expect(trimLogs(logs)[0].message).toBe('message-59');
  });
});
