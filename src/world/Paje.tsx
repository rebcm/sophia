import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

/* =========================================================
   <Paje /> — Pajé-do-Cipó · Aeon-Mestre xamânica
   ---------------------------------------------------------
   NPC permanente sentada perto da clareira em Ratanabá.
   Não pode ser despertada (já está). Apenas oferece guia.
   Ver docs/02d-civilizacoes-perdidas.md §3 (Ratanabá)
   ========================================================= */

interface PajeProps {
  position?: [number, number, number];
  /** Se o jogador já tocou nela uma vez, mostra menos texto. */
  alreadyMet?: boolean;
}

export function Paje({ position = [0, 0, 0], alreadyMet = false }: PajeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // pulsação suave da figura toda
    groupRef.current.scale.setScalar(1 + Math.sin(t * 0.6) * 0.02);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* corpo (cilindro vertical estilizado — sentada) */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.55, 1.2, 12]} />
        <meshStandardMaterial
          color="#3a5028"
          emissive="#1a3010"
          emissiveIntensity={0.18}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* "cabeça" simples */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial
          color="#5c3a20"
          emissive="#3a2010"
          emissiveIntensity={0.1}
          roughness={0.5}
        />
      </mesh>

      {/* halo de cipós ao redor */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.7, 0.04, 8, 24]} />
        <meshStandardMaterial
          color="#6a8c3a"
          emissive="#3a5c20"
          emissiveIntensity={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* pequena luz quente */}
      <pointLight color="#ffc870" intensity={0.6} distance={5} decay={2} />

      {/* Label */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.22}
        color="#ffe9d0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#000"
        outlineOpacity={0.7}
      >
        {alreadyMet ? "Pajé-do-Cipó" : "A Anciã da Floresta"}
      </Text>
    </group>
  );
}
