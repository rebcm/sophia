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
import { Galila } from "../world/Galila";
import { Portal } from "../world/Portal";
import { Filament } from "../world/Filament";

/* =========================================================
   LemuriaScene — 5ª Civilização Perdida
   ---------------------------------------------------------
   Continente do Pacífico governado por canto e harmonia
   feminina. Atmosfera rosa-violeta. Templos abertos com
   colunas finas, jardins suspensos, lago central. Galila
   senta no lótus do lago. Sleepers em pares (eco do Par
   Sizígico) dispersos em meditação.
   Ver docs/02d-civilizacoes-perdidas.md §7
   ========================================================= */

const GALILA_POS: [number, number, number] = [0, 0.4, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface LemuriaSceneProps {
  galilaAwakened: boolean;
  onReturnToMar?: () => void;
}

export function LemuriaScene({
  galilaAwakened,
  onReturnToMar,
}: LemuriaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const galilaTarget = useMemo(
    () => new THREE.Vector3(GALILA_POS[0], 0, GALILA_POS[2]),
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
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 4, 14] }}
    >
      <color attach="background" args={["#3a1830"]} />
      <fog attach="fog" args={["#5a3050", 18, 75]} />

      <ambientLight color="#d8a0c8" intensity={0.6} />
      <directionalLight
        position={[12, 16, 8]}
        intensity={0.8}
        color="#ffc0d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[0, 5, 0]}
        intensity={1.2}
        distance={22}
        color={galilaAwakened ? "#fff0e8" : "#ffb0c8"}
        decay={2}
      />

      <LotusLake />
      <PinkPetals />
      <RoseColumns />
      <SleeperPairs />

      <Galila position={GALILA_POS} awakened={galilaAwakened} />

      <Filament
        base={[GALILA_POS[0], 2.2, GALILA_POS[2]]}
        tint="violeta"
        height={14}
        ruptured={galilaAwakened}
      />

      <Player
        externalRef={playerRef}
        awakenTarget={galilaTarget}
        awakenDistance={3.5}
      />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={galilaAwakened ? "(o canto retornou)" : "(voltar)"}
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
        <Bloom intensity={0.85} luminanceThreshold={0.5} mipmapBlur />
        <Vignette eskil={false} darkness={0.55} offset={0.35} />
      </EffectComposer>
    </Canvas>
  );
}

function LotusLake() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[14, 64]} />
      <meshStandardMaterial
        color="#5a2848"
        emissive="#a86090"
        emissiveIntensity={0.25}
        roughness={0.15}
        metalness={0.6}
      />
    </mesh>
  );
}

/** Pétalas rosadas flutuantes pelo ar */
function PinkPetals() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 60;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: 1 + Math.random() * 8,
      z: (Math.random() - 0.5) * 40,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.4,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      child.position.y = d.y + Math.sin(t * d.speed + d.phase) * 0.5;
      child.rotation.z = t * d.speed * 0.5 + d.phase;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <planeGeometry args={[0.18, 0.12]} />
          <meshBasicMaterial
            color="#ffc0d8"
            transparent
            opacity={0.7}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Colunas rosadas em círculo ao redor do lago */
function RoseColumns() {
  const positions = useMemo(() => {
    const r = 11;
    return Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number];
    });
  }, []);
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], 2.5, p[2]]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 5, 12]} />
          <meshStandardMaterial
            color="#f8c8d8"
            emissive="#d878a8"
            emissiveIntensity={0.2}
            roughness={0.5}
            metalness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Pares de Sleepers sentados em meditação ao redor do lago */
function SleeperPairs() {
  const pairs = useMemo(() => {
    const r = 6;
    return Array.from({ length: 4 }, (_, i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
      return {
        center: [Math.cos(a) * r, 0, Math.sin(a) * r] as [
          number,
          number,
          number,
        ],
        rotY: a + Math.PI / 2,
      };
    });
  }, []);

  return (
    <group>
      {pairs.map((pair, i) => (
        <group
          key={i}
          position={pair.center}
          rotation={[0, pair.rotY, 0]}
        >
          {[-0.4, 0.4].map((offX) => (
            <group key={offX} position={[offX, 0, 0]}>
              <mesh castShadow position={[0, 0.55, 0]}>
                <cylinderGeometry args={[0.18, 0.25, 0.9, 10]} />
                <meshStandardMaterial
                  color="#e8b8c8"
                  roughness={0.7}
                />
              </mesh>
              <mesh castShadow position={[0, 1.15, 0]}>
                <sphereGeometry args={[0.18, 14, 12]} />
                <meshStandardMaterial color="#f0c8d8" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
