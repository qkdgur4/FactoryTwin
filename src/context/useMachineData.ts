import { useContext } from 'react';
import { MachineDataContext } from './machineDataContextValue';

export function useMachineData() {
  const context = useContext(MachineDataContext);

  if (!context) {
    throw new Error('useMachineData must be used inside MachineDataProvider');
  }

  return context;
}
