import {
  Activity,
  AlertTriangle,
  Cpu,
  Gauge,
  Power,
  RadioTower,
  Thermometer,
  Waves,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMachineData } from '../context/useMachineData';
import type { MachineId, MachineState, MachineStatus } from '../types/machine';
import { MACHINE_IDS, WARNING_TEMP } from '../utils/machineSimulation';

interface DashboardProps {
  selectedMachineId: MachineId | null;
  onSelectMachine: (machineId: MachineId) => void;
}

const statusText: Record<MachineStatus, string> = {
  running: '가동 중',
  stopped: '정지',
  warning: '경고',
};

const statusClassName: Record<MachineStatus, string> = {
  running: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  stopped: 'border-slate-400/30 bg-slate-500/15 text-slate-200',
  warning: 'border-red-400/40 bg-red-500/15 text-red-200',
};

const lineColors: Record<MachineId, string> = {
  'id-1': '#67e8f9',
  'id-2': '#93c5fd',
  'id-3': '#c4b5fd',
};

function formatClock(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(timestamp);
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded border border-slate-700/80 bg-slate-950/45 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function MachineCard({
  machine,
  selected,
  onSelect,
}: {
  machine: MachineState;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`w-full rounded border p-3 text-left transition ${
        selected
          ? 'border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
          : 'border-slate-700/80 bg-slate-950/55 hover:border-cyan-400/45 hover:bg-slate-900/80'
      }`}
      type="button"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-50">
            {machine.name}
          </div>
          <div className="mt-1 truncate text-xs text-slate-400">{machine.role}</div>
        </div>
        <span
          className={`shrink-0 rounded border px-2 py-0.5 text-[11px] font-semibold ${statusClassName[machine.status]}`}
        >
          {statusText[machine.status]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="온도"
          value={`${machine.temp.toFixed(1)}C`}
        />
        <Metric
          icon={<Waves className="h-3.5 w-3.5" />}
          label="진동"
          value={`${machine.vibration.toFixed(1)}mm/s`}
        />
        <Metric
          icon={<Gauge className="h-3.5 w-3.5" />}
          label="가동률"
          value={`${machine.operatingRate.toFixed(0)}%`}
        />
      </div>
    </button>
  );
}

export function Dashboard({ selectedMachineId, onSelectMachine }: DashboardProps) {
  const { history, logs, machines, toggleMachine, warningMachines } = useMachineData();

  return (
    <aside className="flex min-h-0 flex-col border-t border-slate-800/90 bg-slate-950/80 lg:h-full lg:border-l lg:border-t-0">
      <div className="border-b border-slate-800/90 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Live Telemetry
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold text-slate-50">
              설비 관제
            </h2>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
            <RadioTower className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="rounded border border-slate-800 bg-slate-900/45 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-300" />
              <span className="truncate">임계치 알림</span>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{WARNING_TEMP}C 기준</span>
          </div>
          <div className="mt-3">
            {warningMachines.length > 0 ? (
              <div className="space-y-2">
                {warningMachines.map((machineId) => (
                  <button
                    key={machineId}
                    className="flex w-full items-center justify-between gap-3 rounded border border-red-400/35 bg-red-500/12 px-3 py-2 text-left text-sm text-red-100"
                    type="button"
                    onClick={() => onSelectMachine(machineId)}
                  >
                    <span className="min-w-0 truncate">{machines[machineId].name}</span>
                    <span className="shrink-0 font-semibold">
                      {machines[machineId].temp.toFixed(1)}C
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                모든 설비가 정상 범위에서 작동 중입니다.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          {MACHINE_IDS.map((machineId) => (
            <MachineCard
              key={machineId}
              machine={machines[machineId]}
              onSelect={() => onSelectMachine(machineId)}
              selected={selectedMachineId === machineId}
            />
          ))}
        </section>

        <section className="rounded border border-slate-800 bg-slate-900/45 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100">
              <Activity className="h-4 w-4 shrink-0 text-cyan-300" />
              <span className="truncate">최근 20초 온도</span>
            </div>
            <span className="shrink-0 text-xs text-slate-400">1s refresh</span>
          </div>
          <div className="mt-3 h-56">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={history} margin={{ bottom: 8, left: -20, right: 12, top: 8 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  minTickGap={28}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  domain={[30, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  unit="C"
                />
                <Tooltip
                  contentStyle={{
                    background: '#020617',
                    border: '1px solid rgba(148,163,184,0.35)',
                    borderRadius: 6,
                    color: '#e2e8f0',
                  }}
                  labelStyle={{ color: '#67e8f9' }}
                />
                {MACHINE_IDS.map((machineId) => (
                  <Line
                    key={machineId}
                    dataKey={machineId}
                    dot={false}
                    isAnimationActive={false}
                    name={machines[machineId].name}
                    stroke={lineColors[machineId]}
                    strokeWidth={2}
                    type="monotone"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded border border-slate-800 bg-slate-900/45 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100">
              <Cpu className="h-4 w-4 shrink-0 text-cyan-300" />
              <span className="truncate">실시간 로그 캐스터</span>
            </div>
            <span className="shrink-0 text-xs text-slate-400">latest 50</span>
          </div>
          <div className="max-h-64 space-y-2 overflow-hidden">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`rounded border px-3 py-2 text-xs ${
                  log.level === 'warning'
                    ? 'border-red-400/30 bg-red-500/10 text-red-100'
                    : log.level === 'system'
                      ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100'
                      : 'border-slate-700/70 bg-slate-950/45 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">{log.message}</span>
                  <span className="shrink-0 text-slate-500">
                    {formatClock(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-slate-800/90 p-4">
        <button
          className="flex w-full items-center justify-center gap-2 rounded border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/45 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedMachineId}
          type="button"
          onClick={() => selectedMachineId && toggleMachine(selectedMachineId)}
        >
          <Power className="h-4 w-4" />
          선택 설비 시작/정지
        </button>
      </div>
    </aside>
  );
}
