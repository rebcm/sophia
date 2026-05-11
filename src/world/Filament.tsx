import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";

/* =========================================================
   <Filament /> — filamento de drenagem energética
   ---------------------------------------------------------
   Cordão de luz que escoa de um Sleeper adormecido para o
   "céu" (na verdade, para um Arconte distante). Visível
   apenas com Olhar Lúcido ativo (V).

   Princípio: somos energia, e o sono é o que a vampiriza.
   Despertar o Sleeper rompe o filamento — a hemorragia fecha.
   Ver docs/04b-samsara-reencarnacao.md + docs/05b-mundo-aberto.

   Visual: linha vertical com pulsos descendentes (a energia
   sobe, mas a "puxada" vem de cima). Cor depende da casta.
   ========================================================= */

export type FilamentTint =
  | "dourado" // Sleeper comum
  | "azul-frio" // Sleeper profundo
  | "vermelho-quente" // Sleeper em conflito antigo
  | "violeta"; // Par Sizígico / raro

interface FilamentProps {
  /** Posição da base — geralmente no topo da cabeça do Sleeper. */
  base: [number, number, number];
  /** Altura total do filamento (sobe ao céu). */
  height?: number;
  tint?: FilamentTint;
  /** Quando true, o filamento se rompe (animação de dissipação). */
  ruptured?: boolean;
}

const TINT_MAP: Record<FilamentTint, string> = {
  dourado: "#ffd45a",
  "azul-frio": "#7aa8c8",
  "vermelho-quente": "#d87858",
  violeta: "#c89aff",
};

export function Filament({
  base,
  height = 8,
  tint = "dourado",
  ruptured = false,
}: FilamentProps) {
  const olharLucidoActive = useGameStore((s) => s.olharLucidoActive);
  const strandRef = useRef<THREE.Mesh>(null);
  const pulseRefs = useRef<THREE.Mesh[]>([]);
  const ruptureOpacity = useRef(1);

  const color = useMemo(() => new THREE.Color(TINT_MAP[tint]), [tint]);

  // 4 pulsos posicionados ao longo do filamento, ciclando
  const pulses = useMemo(() => [0.15, 0.4, 0.65, 0.9], []);

  useFrame((state, delta) => {
    if (!olharLucidoActive) return;
    const t = state.clock.elapsedTime;

    // Fluxo dos pulsos (sobem)
    pulseRefs.current.forEach((m, i) => {
      if (!m) return;
      const phase = (t * 0.4 + pulses[i]) % 1;
      m.position.y = base[1] + phase * height;
      const mat = m.material as THREE.MeshBasicMaterial;
      const fade = Math.sin(phase * Math.PI); // intensidade no meio
      mat.opacity = ruptured ? 0 : fade * 0.85;
    });

    // Dissipação ao romper
    if (ruptured) {
      ruptureOpacity.current = Math.max(
        0,
        ruptureOpacity.current - delta * 1.0,
      );
      if (strandRef.current) {
        const mat = strandRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = ruptureOpacity.current * 0.55;
      }
    }
  });

  if (!olharLucidoActive) return null;

  return (
    <group>
      {/* Cordão fino vertical */}
      <mesh
        ref={strandRef}
        position={[base[0], base[1] + height / 2, base[2]]}
      >
        <cylinderGeometry args={[0.02, 0.02, height, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Halo na base (raiz do filamento) */}
      {!ruptured && (
        <mesh position={[base[0], base[1] + 0.05, base[2]]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.35}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Pulsos subindo */}
      {pulses.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) pulseRefs.current[i] = el;
          }}
          position={[base[0], base[1], base[2]]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
