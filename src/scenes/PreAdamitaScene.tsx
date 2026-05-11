import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { Iaoth } from "../world/Iaoth";
import { Portal } from "../world/Portal";
import { Filament } from "../world/Filament";

/* =========================================================
   PreAdamitaScene — 7ª e última Civilização Perdida
   ---------------------------------------------------------
   Antes da queda. Espaço puro com poucas estrelas distantes
   e a presença de Iaoth (esfera negra com anel de Saturno).
   Não há "chão" — flutuamos. Aqui está a memória nua: o que
   o jogador foi antes do tempo.
   Ver docs/02d-civilizacoes-perdidas.md §9
   ========================================================= */

const IAOTH_POS: [number, number, number] = [0, 3, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface PreAdamitaSceneProps {
  iaothAwakened: boolean;
  onReturnToMar?: () => void;
}

export function PreAdamitaScene({
  iaothAwakened,
  onReturnToMar,
}: PreAdamitaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const iaothTarget = useMemo(
    () => new THREE.Vector3(IAOTH_POS[0], 0, IAOTH_POS[2]),
    [],
  );

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 60, near: 0.1, far: 800, position: [0, 4, 14] }}
    >
      <color attach="background" args={["#02020a"]} />
      <fog attach="fog" args={["#08081a", 20, 90]} />

      <ambientLight color="#202840" intensity={0.4} />

      <pointLight
        position={[0, 12, 0]}
        intensity={iaothAwakened ? 1.4 : 0.5}
        distance={40}
        color={iaothAwakened ? "#fff5d8" : "#5a3aa0"}
        decay={2}
      />

      <PrimordialField />
      <DistantStars />
      <FaintPlatform />

      <Iaoth position={IAOTH_POS} awakened={iaothAwakened} />

      <Filament
        base={[IAOTH_POS[0], IAOTH_POS[1] + 2, IAOTH_POS[2]]}
        tint="violeta"
        height={18}
        ruptured={iaothAwakened}
      />

      <Player
        externalRef={playerRef}
        awakenTarget={iaothTarget}
        awakenDistance={4.0}
      />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            iaothAwakened
              ? "(tu eras antes do tempo)"
              : "(voltar)"
          }
          color="#c5d7e0"
          playerRef={playerRef}
          onProximityChange={(near) => {
            if (!near) return;
            const handler = (e: KeyboardEvent) => {
              if (
                e.code === "Space" ||
                e.code === "Enter" ||
                e.code === "KeyF"
              ) {
                window.removeEventListener("keydown", handler);
                onReturnToMar();
              }
            };
            window.addEventListener("keydown", handler);
          }}
        />
      )}

      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.25} mipmapBlur />
        <Vignette eskil={false} darkness={0.85} offset={0.25} />
      </EffectComposer>
    </Canvas>
  );
}

/** Campo primordial — partículas muito tênues */
function PrimordialField() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 200;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 60,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.3 + Math.sin(t * 0.2 + d.phase) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial
            color="#dde2f8"
            transparent
            opacity={0.3}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Estrelas distantes em fundo profundo */
function DistantStars() {
  const positions = useMemo(() => {
    return Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 90,
      z: -60 - Math.random() * 80,
      size: 0.1 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color="#ffeac8" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Plataforma muito sutil — quase invisível, só para orientação */
function FaintPlatform() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.05, 0]}
    >
      <circleGeometry args={[18, 48]} />
      <meshStandardMaterial
        color="#0a0814"
        emissive="#1a0e30"
        emissiveIntensity={0.12}
        roughness={0.8}
        metalness={0.1}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}
