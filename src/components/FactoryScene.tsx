import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useMachineData } from '../context/useMachineData';
import type { MachineId, MachineStateMap } from '../types/machine';
import { MACHINE_IDS } from '../utils/machineSimulation';
import { Machine } from './Machine';

interface FactorySceneProps {
  selectedMachineId: MachineId | null;
  onSelectMachine: (machineId: MachineId) => void;
}

interface CameraRigProps {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  machines: MachineStateMap;
  selectedMachineId: MachineId | null;
}

function CameraRig({ controlsRef, machines, selectedMachineId }: CameraRigProps) {
  const { camera } = useThree();
  const selectedMachine = selectedMachineId ? machines[selectedMachineId] : null;

  const target = useMemo(() => {
    if (!selectedMachine?.position) {
      return new Vector3(0, 0.7, 0);
    }

    const [x, , z] = selectedMachine.position;
    return new Vector3(x, 1.05, z);
  }, [selectedMachine]);

  const cameraGoal = useMemo(() => {
    if (!selectedMachine?.position) {
      return new Vector3(6.4, 5.6, 8.4);
    }

    const [x, , z] = selectedMachine.position;
    return new Vector3(x + 2.8, 2.7, z + 3.1);
  }, [selectedMachine]);

  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-delta * 2.4);
    camera.position.lerp(cameraGoal, ease);
    controlsRef.current?.target.lerp(target, ease);
    controlsRef.current?.update();
  });

  return null;
}

function FactoryFloor() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 7]} />
        <meshStandardMaterial color="#08111f" metalness={0.18} roughness={0.72} />
      </mesh>
      <gridHelper
        args={[11, 22, '#0ea5e9', '#1e293b']}
        position={[0, 0.015, 0]}
      />
      <mesh position={[0, 0.02, -3.5]} receiveShadow>
        <boxGeometry args={[11, 0.04, 0.08]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export function FactoryScene({
  selectedMachineId,
  onSelectMachine,
}: FactorySceneProps) {
  const { machines } = useMachineData();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      camera={{ fov: 50, position: [6.4, 5.6, 8.4] }}
      className="h-full w-full"
      dpr={[1, 1.8]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      shadows
    >
      <color args={['#05070d']} attach="background" />
      <fog args={['#05070d', 8, 18]} attach="fog" />
      <ambientLight intensity={0.75} />
      <directionalLight
        castShadow
        intensity={2.2}
        position={[4, 8, 5]}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <pointLight color="#22d3ee" intensity={1.2} position={[-4, 3, -2]} />
      <FactoryFloor />
      {MACHINE_IDS.map((machineId) => (
        <Machine
          key={machineId}
          machine={machines[machineId]}
          onSelect={() => onSelectMachine(machineId)}
          selected={selectedMachineId === machineId}
        />
      ))}
      <CameraRig
        controlsRef={controlsRef}
        machines={machines}
        selectedMachineId={selectedMachineId}
      />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        makeDefault
        dampingFactor={0.08}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.08}
        minDistance={3.2}
      />
    </Canvas>
  );
}
