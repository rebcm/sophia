import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";

/* =========================================================
   <SleeperAura /> — halo colorido sobre um Sleeper
   ---------------------------------------------------------
   Visível apenas com Olhar Lúcido ativo (V).
   Cores conforme docs/03f-mapa-do-reino-humano.md §2 (castas)
   ========================================================= */

export type AuraColor =
  | "branco-tenue" // Sleeper comum, sem vínculos
  | "dourado-tenue" // ressonância suave
  | "dourado-forte" // alma grande / Lendário
  | "cinza-azul" // sleeper profundo
  | "cinza-vermelho" // conflito antigo
  | "roxo-pulsante"; // Par Sizígico (raríssimo)

interface SleeperAuraProps {
  /** Posição base (geralmente acima da cabeça do Sleeper). */
  position?: [number, number, number];
  auraColor: AuraColor;
  /** Indica que esta alma é grande (Lendária). Faz pulsar mais. */
  isLegendary?: boolean;
}

const COLOR_MAP: Record<AuraColor, { color: string; intensity: number }> = {
  "branco-tenue": { color: "#dde0d8", intensity: 0.6 },
  "dourado-tenue": { color: "#ffd8a0", intensity: 1.0 },
  "dourado-forte": { color: "#ffd45a", intensity: 1.8 },
  "cinza-azul": { color: "#6a7898", intensity: 0.7 },
  "cinza-vermelho": { color: "#8c5a5a", intensity: 0.9 },
  "roxo-pulsante": { color: "#c89aff", intensity: 1.5 },
};

export function SleeperAura({
  position = [0, 1.4, 0],
  auraColor,
  isLegendary = false,
}: SleeperAuraProps) {
  const olharLucidoActive = useGameStore((s) => s.olharLucidoActive);
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const { color, intensity } = COLOR_MAP[auraColor];
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!olharLucidoActive) return;
    const t = state.clock.elapsedTime;

    if (orbRef.current) {
      const pulseFreq = isLegendary ? 1.4 : 0.8;
      const pulseAmp = isLegendary ? 0.18 : 0.08;
      orbRef.current.scale.setScalar(1 + Math.sin(t * pulseFreq) * pulseAmp);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * (isLegendary ? 0.6 : 0.3);
    }
  });

  if (!olharLucidoActive) return null;

  return (
    <group position={position}>
      {/* Orbe de aura (esfera translúcida) */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={colorObj}
          transparent
          opacity={0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Halo emissivo central (núcleo brilhante) */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={colorObj}
          emissive={colorObj}
          emissiveIntensity={intensity * 2}
          roughness={0.0}
          toneMapped={false}
        />
      </mesh>

      {/* Anel rotativo (mais visível para Lendários) */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.42, 24]} />
        <meshBasicMaterial
          color={colorObj}
          transparent
          opacity={isLegendary ? 0.7 : 0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Luz pontual extra para Lendários */}
      {isLegendary && (
        <pointLight color={colorObj} intensity={1.2} distance={3} decay={2} />
      )}
    </group>
  );
}
