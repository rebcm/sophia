import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

/* =========================================================
   <PedraDasVidas /> — pedra de morte voluntária no Mar
   ---------------------------------------------------------
   Tocá-la inicia a transição para o Bardo. Diegética:
   o jogador escolhe morrer conscientemente (ver
   docs/04b-samsara-reencarnacao.md §4).
   ========================================================= */

interface PedraDasVidasProps {
  position: [number, number, number];
  playerRef?: React.MutableRefObject<THREE.Group | null>;
  proximityDistance?: number;
  onActivate?: () => void;
}

export function PedraDasVidas({
  position,
  playerRef,
  proximityDistance = 2.5,
  onActivate,
}: PedraDasVidasProps) {
  const groupRef = useRef<THREE.Group>(null);
  const stoneRef = useRef<THREE.Mesh>(null);
  const [near, setNear] = useState(false);
  const lastNear = useRef(false);

  const stoneColor = useMemo(() => new THREE.Color("#5a4068"), []);
  const glowColor = useMemo(() => new THREE.Color("#c89aff"), []);

  // Tecla F para ativar quando perto
  useEffect(() => {
    if (!near) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "KeyF") {
        onActivate?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [near, onActivate]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Pulso interno da pedra
    if (stoneRef.current) {
      const m = stoneRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.4 + Math.sin(t * 0.8) * 0.15;
    }

    // Detectar proximidade
    if (playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const dist = Math.hypot(dx, dz);
      const isNear = dist < proximityDistance;
      if (isNear !== lastNear.current) {
        lastNear.current = isNear;
        setNear(isNear);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pedra principal (octogonal) */}
      <mesh ref={stoneRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.7, 8]} />
        <meshStandardMaterial
          color={stoneColor}
          emissive={glowColor}
          emissiveIntensity={0.4}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Brasão/inscrição no topo */}
      <mesh position={[0, 0.37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.7} />
      </mesh>

      {/* Luz pontual sutil */}
      <pointLight
        color={glowColor}
        intensity={near ? 1.5 : 0.6}
        distance={4}
        decay={2}
      />

      {/* Label visível apenas quando próximo */}
      {near && (
        <Text
          position={[0, 1.4, 0]}
          fontSize={0.2}
          color="#ffe9d0"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#000"
          outlineOpacity={0.7}
          maxWidth={6}
          textAlign="center"
        >
          {"Pedra das Vidas\npressione F para soltar este corpo"}
        </Text>
      )}
    </group>
  );
}
