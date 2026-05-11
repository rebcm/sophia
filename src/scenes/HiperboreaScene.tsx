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
import { Adonaios } from "../world/Adonaios";
import { Portal } from "../world/Portal";
import { Filament } from "../world/Filament";

/* =========================================================
   HiperboreaScene — 3ª Civilização Perdida
   ---------------------------------------------------------
   Tundra de cristal eterno. Sol no horizonte que nunca se põe.
   Aurora boreal estática suspensa no céu. Templo apolíneo de
   colunas brancas. No centro, Adonaios — o Guardião-Solar.
   Filósofos sentados em círculos discutindo questões eternas.
   Atmosfera: silêncio frio + brilho dourado distante.
   Ver docs/02d-civilizacoes-perdidas.md §5
   ========================================================= */

const ADONAIOS_POS: [number, number, number] = [0, 0, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface HiperboreaSceneProps {
  adonaiosAwakened: boolean;
  onReturnToMar?: () => void;
}

export function HiperboreaScene({
  adonaiosAwakened,
  onReturnToMar,
}: HiperboreaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const adonaiosTarget = useMemo(
    () => new THREE.Vector3(...ADONAIOS_POS),
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
      {/* Céu pálido-luminoso */}
      <color attach="background" args={["#cad8e8"]} />
      <fog attach="fog" args={["#d8e0ea", 24, 110]} />

      <ambientLight color="#dae6f0" intensity={0.85} />

      {/* Sol baixo no horizonte (nunca se põe) */}
      <directionalLight
        position={[20, 4, -8]}
        intensity={1.3}
        color="#ffe0b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Brilho dourado central — calor desta luz fria */}
      <pointLight
        position={[0, 6, 0]}
        intensity={adonaiosAwakened ? 1.2 : 0.6}
        distance={28}
        color={adonaiosAwakened ? "#ffd45a" : "#fff5d8"}
        decay={2}
      />

      <IceGround />
      <CrystalShards />
      <ApollineTemple />
      <Aurora />
      <FilosofosSentados />

      <Adonaios position={ADONAIOS_POS} awakened={adonaiosAwakened} />

      <Filament
        base={[ADONAIOS_POS[0], 3.2, ADONAIOS_POS[2]]}
        tint="vermelho-quente"
        height={16}
        ruptured={adonaiosAwakened}
      />

      <Player
        externalRef={playerRef}
        awakenTarget={adonaiosTarget}
        awakenDistance={3.5}
      />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={adonaiosAwakened ? "(o sol não cega mais)" : "(voltar)"}
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
        <Bloom intensity={0.7} luminanceThreshold={0.6} mipmapBlur />
        <Vignette eskil={false} darkness={0.35} offset={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function IceGround() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <planeGeometry args={[200, 200, 1, 1]} />
      <meshStandardMaterial
        color="#d8e4ee"
        emissive="#a8b8c8"
        emissiveIntensity={0.18}
        roughness={0.2}
        metalness={0.4}
      />
    </mesh>
  );
}

/** Lascas de cristal espalhadas pela tundra */
function CrystalShards() {
  const positions = useMemo(() => {
    const pts: { x: number; z: number; rotY: number; scale: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 32;
      pts.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        rotY: Math.random() * Math.PI,
        scale: 0.5 + Math.random() * 1.2,
      });
    }
    return pts;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, p.scale * 0.6, p.z]}
          rotation={[0, p.rotY, Math.random() * 0.2]}
          scale={[p.scale, p.scale, p.scale]}
          castShadow
        >
          <coneGeometry args={[0.3, 1.6, 6]} />
          <meshStandardMaterial
            color="#e8f0f8"
            emissive="#bcd0e0"
            emissiveIntensity={0.25}
            roughness={0.1}
            metalness={0.25}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Templo apolíneo com colunas circulares atrás de Adonaios */
function ApollineTemple() {
  const columns = useMemo(() => {
    const r = 10;
    return Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number];
    });
  }, []);

  return (
    <group position={[0, 0, -6]}>
      {columns.map((p, i) => (
        <mesh key={i} position={[p[0], 2.5, p[2]]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 5, 16]} />
          <meshStandardMaterial
            color="#f0f4fa"
            roughness={0.55}
            metalness={0.2}
          />
        </mesh>
      ))}
      {/* Capitéis (esfera achatada em cima das colunas) */}
      {columns.map((p, i) => (
        <mesh key={`cap-${i}`} position={[p[0], 5.2, p[2]]}>
          <sphereGeometry args={[0.45, 12, 8]} />
          <meshStandardMaterial
            color="#fff5d8"
            roughness={0.45}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Aurora boreal estática — fitas onduladas no céu */
function Aurora() {
  const ribbonRef = useRef<THREE.Mesh>(null);
  const ribbon2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ribbonRef.current) {
      const m = ribbonRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.25 + Math.sin(t * 0.3) * 0.05;
    }
    if (ribbon2Ref.current) {
      const m = ribbon2Ref.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.2 + Math.sin(t * 0.25 + 1) * 0.05;
    }
  });

  return (
    <group position={[0, 18, -40]}>
      <mesh ref={ribbonRef} rotation={[0, 0, 0.15]}>
        <planeGeometry args={[60, 6]} />
        <meshBasicMaterial
          color="#88e8c8"
          transparent
          opacity={0.25}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ribbon2Ref} position={[5, -3, 0]} rotation={[0, 0, -0.1]}>
        <planeGeometry args={[55, 5]} />
        <meshBasicMaterial
          color="#a878d8"
          transparent
          opacity={0.2}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Filósofos sentados em pequenos círculos — Sleepers que discutem sem agir */
function FilosofosSentados() {
  const groups = useMemo(() => {
    const out: { center: [number, number, number]; count: number }[] = [];
    out.push({ center: [-8, 0, 6], count: 4 });
    out.push({ center: [9, 0, 6], count: 3 });
    out.push({ center: [-9, 0, -8], count: 4 });
    return out;
  }, []);

  return (
    <group>
      {groups.map((g, gi) =>
        Array.from({ length: g.count }).map((_, i) => {
          const a = (i / g.count) * Math.PI * 2;
          const r = 1.6;
          const x = g.center[0] + Math.cos(a) * r;
          const z = g.center[2] + Math.sin(a) * r;
          const rotY = Math.atan2(g.center[0] - x, g.center[2] - z);
          return (
            <group key={`${gi}-${i}`} position={[x, 0, z]} rotation={[0, rotY, 0]}>
              {/* Corpo sentado */}
              <mesh castShadow position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.22, 0.28, 1.0, 10]} />
                <meshStandardMaterial
                  color="#dae0e8"
                  roughness={0.85}
                />
              </mesh>
              {/* Cabeça inclinada (pensativo) */}
              <mesh castShadow position={[0, 1.4, 0.05]} rotation={[0.25, 0, 0]}>
                <sphereGeometry args={[0.2, 14, 12]} />
                <meshStandardMaterial color="#c8d0d8" roughness={0.85} />
              </mesh>
            </group>
          );
        }),
      )}
    </group>
  );
}
