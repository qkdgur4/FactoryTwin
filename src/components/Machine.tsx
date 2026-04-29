import { Edges, Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import type { MachineState, MachineStatus } from '../types/machine';

interface MachineProps {
  machine: MachineState;
  selected: boolean;
  onSelect: () => void;
}

const statusText: Record<MachineStatus, string> = {
  running: '가동 중',
  stopped: '정지',
  warning: '경고',
};

const statusClassName: Record<MachineStatus, string> = {
  running: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100',
  stopped: 'border-slate-400/40 bg-slate-500/25 text-slate-100',
  warning: 'border-red-400/60 bg-red-500/25 text-red-100',
};

export function Machine({ machine, selected, onSelect }: MachineProps) {
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!machine.isWarning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setFlash((current) => !current);
    }, 320);

    return () => window.clearInterval(intervalId);
  }, [machine.isWarning]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const activeFlash = machine.isWarning && flash;
  const color =
    activeFlash
      ? '#ef4444'
      : hovered || selected
        ? machine.accentColor
        : machine.baseColor;
  const edgeColor = machine.isWarning ? '#fecaca' : machine.accentColor;
  const labelClassName = statusClassName[machine.status];

  return (
    <group
      position={machine.position ?? [0, 0, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOut={handlePointerOut}
      onPointerOver={handlePointerOver}
      scale={selected ? 1.06 : 1}
    >
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.7, 0.7, 1.35]} />
        <meshStandardMaterial
          color={color}
          emissive={machine.isWarning ? '#7f1d1d' : '#021b2d'}
          emissiveIntensity={activeFlash ? 0.75 : 0.12}
          metalness={0.45}
          roughness={0.36}
        />
        <Edges
          color={edgeColor}
          scale={selected || hovered || machine.isWarning ? 1.04 : 1.01}
          visible={selected || hovered || machine.isWarning}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.92, -0.08]}>
        <boxGeometry args={[1.05, 0.45, 0.9]} />
        <meshStandardMaterial
          color={color}
          emissive={machine.isWarning ? '#991b1b' : '#0e1726'}
          emissiveIntensity={activeFlash ? 0.8 : 0.08}
          metalness={0.55}
          roughness={0.32}
        />
        <Edges
          color={edgeColor}
          scale={1.04}
          visible={selected || hovered || machine.isWarning}
        />
      </mesh>

      <mesh castShadow position={[0.72, 1.1, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.95, 24]} />
        <meshStandardMaterial
          color={activeFlash ? '#f87171' : machine.accentColor}
          emissive={machine.accentColor}
          emissiveIntensity={hovered || selected ? 0.45 : 0.18}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      <mesh castShadow position={[-0.62, 1.1, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.95, 24]} />
        <meshStandardMaterial
          color={activeFlash ? '#f87171' : machine.accentColor}
          emissive={machine.accentColor}
          emissiveIntensity={hovered || selected ? 0.45 : 0.18}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 1.42, 0.02]}>
        <boxGeometry args={[0.75, 0.18, 0.55]} />
        <meshStandardMaterial
          color={machine.status === 'stopped' ? '#475569' : machine.accentColor}
          emissive={machine.accentColor}
          emissiveIntensity={machine.status === 'stopped' ? 0.05 : 0.35}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {machine.isWarning ? (
        <pointLight
          color="#ef4444"
          distance={4.2}
          intensity={activeFlash ? 4.2 : 1.2}
          position={[0, 1.5, 0]}
        />
      ) : null}

      <Html center distanceFactor={8} position={[0, 2.0, 0]}>
        <button
          className={`whitespace-nowrap rounded border px-2.5 py-1 text-[11px] font-semibold shadow-lg backdrop-blur transition hover:brightness-125 ${labelClassName}`}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          {machine.id} · {statusText[machine.status]}
        </button>
      </Html>
    </group>
  );
}
