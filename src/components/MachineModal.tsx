import { Power, X } from 'lucide-react';
import type { MachineState, MachineStatus } from '../types/machine';

interface MachineModalProps {
  machine: MachineState | null;
  onClose: () => void;
  onToggle: () => void;
}

const statusText: Record<MachineStatus, string> = {
  running: '가동 중',
  stopped: '정지',
  warning: '경고',
};

export function MachineModal({ machine, onClose, onToggle }: MachineModalProps) {
  if (!machine) {
    return null;
  }

  const isStopped = machine.status === 'stopped';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <section
        aria-labelledby="machine-detail-title"
        aria-modal="true"
        className="w-full max-w-md rounded border border-cyan-400/25 bg-slate-950 text-slate-100 shadow-[0_0_40px_rgba(34,211,238,0.16)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Machine Detail
            </p>
            <h2
              className="mt-2 truncate text-xl font-semibold"
              id="machine-detail-title"
            >
              {machine.name}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-400">{machine.role}</p>
          </div>
          <button
            aria-label="닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-slate-700 text-slate-300 transition hover:border-cyan-400/45 hover:text-cyan-100"
            type="button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          <div className="min-w-0 rounded border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Machine ID</p>
            <p className="mt-1 truncate font-semibold">{machine.id}</p>
          </div>
          <div className="min-w-0 rounded border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Status</p>
            <p className="mt-1 truncate font-semibold">{statusText[machine.status]}</p>
          </div>
          <div className="min-w-0 rounded border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Temperature</p>
            <p className="mt-1 truncate font-semibold">{machine.temp.toFixed(1)}C</p>
          </div>
          <div className="min-w-0 rounded border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Vibration</p>
            <p className="mt-1 truncate font-semibold">
              {machine.vibration.toFixed(1)}mm/s
            </p>
          </div>
          <div className="min-w-0 rounded border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Operating Rate</p>
            <p className="mt-1 truncate font-semibold">
              {machine.operatingRate.toFixed(0)}%
            </p>
          </div>
          <div className="min-w-0 rounded border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs text-slate-400">Spec</p>
            <p className="mt-1 truncate font-semibold">Simulated v1</p>
          </div>
        </div>

        <div className="border-t border-slate-800 p-5">
          <button
            className={`flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-sm font-semibold transition ${
              isStopped
                ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                : 'bg-red-500 text-white hover:bg-red-400'
            }`}
            type="button"
            onClick={onToggle}
          >
            <Power className="h-4 w-4" />
            {isStopped ? '가동 재시작' : '가동 중지'}
          </button>
        </div>
      </section>
    </div>
  );
}
