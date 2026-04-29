import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { FactoryScene } from './components/FactoryScene';
import { MachineModal } from './components/MachineModal';
import { MachineDataProvider } from './context/MachineDataContext';
import { useMachineData } from './context/useMachineData';
import type { MachineId } from './types/machine';

function DashboardShell() {
  const [selectedMachineId, setSelectedMachineId] = useState<MachineId | null>(
    null,
  );
  const { machines, toggleMachine } = useMachineData();
  const selectedMachine = selectedMachineId ? machines[selectedMachineId] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-screen lg:min-h-0">
        <header className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              FactoryTwin
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50">
              Digital Twin Control Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
            Simulated live stream
          </div>
        </header>

        <main className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_430px] lg:overflow-hidden">
          <section className="relative h-[46vh] min-h-[430px] overflow-hidden border-b border-slate-800 bg-slate-950 lg:h-auto lg:min-h-0 lg:border-b-0">
            <div className="absolute left-4 top-4 z-10 rounded border border-cyan-400/25 bg-slate-950/72 px-3 py-2 text-xs text-slate-300 backdrop-blur">
              Factory Floor A · Live Twin
            </div>
            <FactoryScene
              onSelectMachine={setSelectedMachineId}
              selectedMachineId={selectedMachineId}
            />
          </section>

          <Dashboard
            onSelectMachine={setSelectedMachineId}
            selectedMachineId={selectedMachineId}
          />
        </main>
      </div>

      <MachineModal
        machine={selectedMachine}
        onClose={() => setSelectedMachineId(null)}
        onToggle={() => selectedMachineId && toggleMachine(selectedMachineId)}
      />
    </div>
  );
}

export default function App() {
  return (
    <MachineDataProvider>
      <DashboardShell />
    </MachineDataProvider>
  );
}
