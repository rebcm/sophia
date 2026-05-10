import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";

/* =========================================================
   Sleeper — Adormecido genérico
   ---------------------------------------------------------
   Antes de despertar: silhueta cinza-translúcida, baixa
   intensidade, halo apagado.
   Depois de despertar: forma definida, brilho âmbar, halo
   ativo, leve animação de respiração mais viva.
   ========================================================= */

interface SleeperProps {
  id: string;
  name: string;
  position?: [number, number, number];
  /** Intensidade do "sono" — quanto maior, mais apagado. */
  sleepIntensity?: number;
}

export function Sleeper({
  id,
  name,
  position = [12, 0, -8],
  sleepIntensity = 1.0,
}: SleeperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const awakened = useGameStore((s) => s.awakened.has(id));

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (!awakened) {
      // adormecido: respiração muito lenta
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.05;
    } else {
      // desperto: respiração mais natural, leve hover
      groupRef.current.position.y = position[1] + 0.4 + Math.sin(t * 1.2) * 0.08;
    }

    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const target = awakened ? 0.35 : 0.05;
      m.opacity = THREE.MathUtils.lerp(m.opacity, target, 0.05);
      const scale = awakened
        ? 1 + Math.sin(t * 1.4) * 0.04
        : 0.7 + Math.sin(t * 0.4) * 0.02;
      auraRef.current.scale.setScalar(scale);
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = THREE.MathUtils.lerp(m.opacity, awakened ? 0.4 : 0.0, 0.05);
      haloRef.current.rotation.z = t * 0.18;
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        awakened ? 0.9 : 0.0,
        0.04,
      );
    }
  });

  return (
    <group ref={groupRef} position={position} userData={{ id, name }}>
      {/* corpo */}
      <mesh castShadow>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial
          color={awakened ? "#fff0d2" : "#5b5570"}
          emissive={awakened ? "#ffc88a" : "#000000"}
          emissiveIntensity={awakened ? 1.4 : 0}
          roughness={0.4}
          opacity={awakened ? 1.0 : 0.7 / sleepIntensity}
          transparent={!awakened}
        />
      </mesh>
      {/* aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.85, 24, 24]} />
        <meshBasicMaterial
          color="#ffd4a8"
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
      {/* halo */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial
          color="#ffd45a"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* luz */}
      <pointLight
        ref={lightRef}
        color="#ffd4a8"
        intensity={0}
        distance={6}
        decay={2}
      />
    </group>
  );
}
