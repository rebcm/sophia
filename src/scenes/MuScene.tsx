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
import { Harmas } from "../world/Harmas";
import { Portal } from "../world/Portal";
import { Filament } from "../world/Filament";

/* =========================================================
   MuScene — 6ª Civilização Perdida
   ---------------------------------------------------------
   Plataformas flutuantes em geometria impossível. Pirâmides
   de luz pura projetando holografia simbólica. Sem matéria —
   tudo é canto e geometria. Harmas no centro como tetraedro
   vivo.
   Ver docs/02d-civilizacoes-perdidas.md §8
   ========================================================= */

const HARMAS_POS: [number, number, number] = [0, 2.2, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface MuSceneProps {
  harmasAwakened: boolean;
  onReturnToMar?: () => void;
}

export function MuScene({ harmasAwakened, onReturnToMar }: MuSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const harmasTarget = useMemo(
    () => new THREE.Vector3(HARMAS_POS[0], 0, HARMAS_POS[2]),
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
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 5, 14] }}
    >
      <color attach="background" args={["#1a1230"]} />
      <fog attach="fog" args={["#2a1a48", 18, 80]} />

      <ambientLight color="#a8a0d8" intensity={0.65} />
      <pointLight
        position={[0, 8, 0]}
        intensity={1.8}
        distance={28}
        color={harmasAwakened ? "#fff5d8" : "#d8a0ff"}
        decay={2}
      />

      <FloatingPlatforms />
      <LightPyramids awakened={harmasAwakened} />
      <SymbolicHolograms />

      <Harmas position={HARMAS_POS} awakened={harmasAwakened} />

      <Filament
        base={[HARMAS_POS[0], HARMAS_POS[1] + 1, HARMAS_POS[2]]}
        tint="violeta"
        height={14}
        ruptured={harmasAwakened}
      />

      <Player
        externalRef={playerRef}
        awakenTarget={harmasTarget}
        awakenDistance={3.8}
      />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={harmasAwakened ? "(a palavra voltou)" : "(voltar)"}
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
        <Bloom intensity={1.1} luminanceThreshold={0.3} mipmapBlur />
        <Vignette eskil={false} darkness={0.55} offset={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

/** Plataformas flutuantes em concentrações — sem matéria real */
function FloatingPlatforms() {
  const groupRef = useRef<THREE.Group>(null);
  const platforms = useMemo(() => {
    const out: { pos: [number, number, number]; size: number }[] = [];
    out.push({ pos: [0, 0, 0], size: 6 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = 10 + Math.random() * 5;
      const y = Math.sin(i) * 2;
      out.push({
        pos: [Math.cos(a) * r, y, Math.sin(a) * r],
        size: 2 + Math.random() * 2,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      child.position.y =
        platforms[i].pos[1] + Math.sin(t * 0.3 + i) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {platforms.map((p, i) => (
        <mesh
          key={i}
          position={p.pos}
          receiveShadow
          rotation={[-Math.PI / 2, 0, i * 0.4]}
        >
          <circleGeometry args={[p.size, 6]} />
          <meshStandardMaterial
            color="#dde2f8"
            emissive="#8870c8"
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.4}
            transparent
            opacity={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Pirâmides de luz pura — sem matéria, só cor */
function LightPyramids({ awakened }: { awakened: boolean }) {
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const r = 7;
      out.push([Math.cos(a) * r, 1.0, Math.sin(a) * r]);
    }
    return out;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, i * 0.5, 0]}>
          <coneGeometry args={[1.0, 2.6, 4]} />
          <meshBasicMaterial
            color={awakened ? "#fff5d8" : "#d8a0ff"}
            transparent
            opacity={0.45}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Holografia simbólica — anéis suspensos com glifos */
function SymbolicHolograms() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 12;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const a = (i / COUNT) * Math.PI * 2;
      const r = 4 + Math.random() * 3;
      return {
        x: Math.cos(a) * r,
        y: 3 + Math.random() * 4,
        z: Math.sin(a) * r,
        rotPhase: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.y = t * 0.4 + data[i].rotPhase;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh
          key={i}
          position={[d.x, d.y, d.z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.25, 0.32, 6]} />
          <meshBasicMaterial
            color="#fff0d8"
            transparent
            opacity={0.5}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
