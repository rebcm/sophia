import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSoulStore } from "../state/soulStore";
import {
  computeCentelhaPhase,
  getCentelhaVisual,
  type CentelhaPhase,
} from "../systems/CentelhaController";

/* =========================================================
   <Centelha /> — orbe luminoso no peito do jogador
   ---------------------------------------------------------
   Cresce em 8 fases conforme Luz Interior + Centelhas
   conquistadas. Assinatura visual do despertar.

   Posicionamento: oferta localPosition; o Player tem
   tipicamente y=0.6 e a Centelha fica ~0.05 acima.
   ========================================================= */

interface CentelhaProps {
  /** Posição local relativa ao parent (Player). */
  localPosition?: [number, number, number];
  /** Overrides de fase (útil para debug/cinemáticas). */
  forcedPhase?: CentelhaPhase;
  /** Se false, esconde o orbe (mas mantém o componente). */
  visible?: boolean;
}

export function Centelha({
  localPosition = [0, 0.05, 0.36],
  forcedPhase,
  visible = true,
}: CentelhaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const light = useSoulStore((s) => s.light);
  const centelhasCount = useSoulStore((s) => s.centelhas.size);

  const phase = useMemo<CentelhaPhase>(() => {
    if (forcedPhase) return forcedPhase;
    return computeCentelhaPhase({ light, centelhasCount });
  }, [forcedPhase, light, centelhasCount]);

  const visual = useMemo(() => getCentelhaVisual(phase), [phase]);

  const baseColor = useMemo(
    () => new THREE.Color(visual.baseColor),
    [visual.baseColor],
  );
  const haloColor = useMemo(
    () => new THREE.Color(visual.haloColor),
    [visual.haloColor],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Pulsação
    const pulse = 1 + 0.12 * Math.sin(t * visual.pulseHz * 2 * Math.PI);

    if (orbRef.current) {
      orbRef.current.scale.setScalar(pulse);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.4;
      const haloPulse = 1 + 0.08 * Math.sin(t * visual.pulseHz * 1.5);
      haloRef.current.scale.setScalar(haloPulse);
    }
  });

  // Fase 8: corpo é luz — Centelha some, virou tudo
  if (!visible || visual.diameter === 0) {
    return null;
  }

  const radius = visual.diameter / 2;
  const haloRadius = radius * 2.2;

  return (
    <group ref={groupRef} position={localPosition}>
      {/* Orbe central */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={visual.emissiveIntensity}
          roughness={0.0}
          metalness={0.0}
          toneMapped={false}
        />
      </mesh>

      {/* Halo translúcido */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.4, haloRadius, 32]} />
        <meshBasicMaterial
          color={haloColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Luz pontual */}
      <pointLight
        color={baseColor}
        intensity={visual.emissiveIntensity * 0.6}
        distance={Math.min(20, visual.auraRadius)}
        decay={2}
      />
    </group>
  );
}
