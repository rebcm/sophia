import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSoulStore } from "../state/soulStore";
import { SleeperAura } from "./SleeperAura";

/* =========================================================
   <MaeDagua /> — Athoth como figura adormecida no rio
   ---------------------------------------------------------
   Sleeper especial: forma feminina translúcida deitada,
   semi-submersa, com cabelos como cipós. Aura azul-prata.
   Boss de Ratanabá. Despertar = derrota o 1º Arconte.
   ========================================================= */

interface MaeDaguaProps {
  position?: [number, number, number];
}

const ID = "athoth-mae-dagua";

export function MaeDagua({ position = [0, 0, 0] }: MaeDaguaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const awakened = useSoulStore((s) => s.hasAwakened(ID));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!groupRef.current) return;

    if (!awakened) {
      // adormecida: respiração mui-lenta
      groupRef.current.position.y = position[1] + Math.sin(t * 0.25) * 0.04;
    } else {
      // acordada: ergue-se mais
      groupRef.current.position.y = position[1] + 0.6 + Math.sin(t * 1.0) * 0.08;
    }

    if (bodyRef.current) {
      const m = bodyRef.current.material as THREE.MeshStandardMaterial;
      const targetEmis = awakened ? 1.6 : 0.4;
      m.emissiveIntensity = THREE.MathUtils.lerp(
        m.emissiveIntensity,
        targetEmis,
        0.04,
      );
    }

    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        awakened ? 2.5 : 0.6,
        0.04,
      );
    }
  });

  return (
    <group ref={groupRef} position={position} userData={{ id: ID }}>
      {/* corpo principal — elipsóide alongado (deitada) */}
      <mesh ref={bodyRef} rotation={[0, 0, 0]} scale={[1.2, 0.5, 2.4]}>
        <sphereGeometry args={[0.7, 32, 16]} />
        <meshStandardMaterial
          color={awakened ? "#d8e6ff" : "#6a7898"}
          emissive={awakened ? "#a8c5ff" : "#3a4868"}
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* "cabelos-cipós" — várias hastes finas estilizadas */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.1, -1.6 + Math.sin(i * 0.7) * 0.2]}
          rotation={[0, 0, Math.PI / 2 + i * 0.05]}
        >
          <cylinderGeometry args={[0.04, 0.06, 1.2, 6]} />
          <meshStandardMaterial
            color="#3a5060"
            emissive="#2a4050"
            emissiveIntensity={0.2}
            roughness={0.6}
          />
        </mesh>
      ))}

      {/* luz própria */}
      <pointLight
        ref={lightRef}
        color="#a8c5ff"
        intensity={0.6}
        distance={12}
        decay={2}
        position={[0, 1.5, 0]}
      />

      {/* Aura visível apenas com Olhar Lúcido — se não acordou */}
      {!awakened && (
        <SleeperAura
          position={[0, 2.2, 0]}
          auraColor="cinza-azul"
          isLegendary
        />
      )}
    </group>
  );
}
