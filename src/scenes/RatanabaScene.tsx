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
import { MaeDagua } from "../world/MaeDagua";
import { Paje } from "../world/Paje";
import { Portal } from "../world/Portal";

/* =========================================================
   RatanabaScene — floresta amazônica luminosa
   ---------------------------------------------------------
   Cidade-mãe submersa em raízes (1ª Civilização Perdida).
   Geografia: floresta densa, rio luminoso, clareira central
   onde a Mãe-D'Água (Athoth) dorme. Pajé-do-Cipó próxima.
   Ver docs/02d-civilizacoes-perdidas.md §3
   ========================================================= */

const MAE_POS: [number, number, number] = [0, 0, 0];
const PAJE_POS: [number, number, number] = [-6, 0, 4];
const RETURN_PORTAL_POS: [number, number, number] = [12, 0.4, 8];

interface RatanabaSceneProps {
  onReturnToMar?: () => void;
}

export function RatanabaScene({ onReturnToMar }: RatanabaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const maeProximityTarget = useMemo(
    () => new THREE.Vector3(...MAE_POS),
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
      {/* Cor de fundo: violeta-mata noturna */}
      <color attach="background" args={["#0c1810"]} />
      <fog attach="fog" args={["#1a2a18", 14, 65]} />

      {/* Iluminação ambiente verde-terra */}
      <ambientLight color="#3a5840" intensity={0.45} />

      {/* Luz "lua amazônica" suave */}
      <directionalLight
        position={[8, 15, 4]}
        intensity={0.4}
        color="#88b8a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Luz quente do centro (rio luminoso) */}
      <pointLight
        position={[0, 4, 0]}
        intensity={1.5}
        distance={20}
        color="#e0b870"
        decay={2}
      />

      <ForestFloor />
      <RioLuminoso />
      <ForestTrees />
      <CanopyFireflies />

      <MaeDagua position={MAE_POS} />
      <Paje position={PAJE_POS} />

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={maeProximityTarget}
        awakenDistance={3.2}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de volta para o Mar */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel="voltar"
          color="#c5d7e0"
          playerRef={playerRef}
          onProximityChange={(near) => {
            if (near) {
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
            }
          }}
        />
      )}

      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.45} mipmapBlur />
        <Vignette eskil={false} darkness={0.7} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

function ForestFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <planeGeometry args={[200, 200, 1, 1]} />
      <meshStandardMaterial
        color="#1a2818"
        emissive="#0a1408"
        emissiveIntensity={0.05}
        roughness={0.9}
      />
    </mesh>
  );
}

/** Rio luminoso passando pela clareira — uma faixa horizontal de luz */
function RioLuminoso() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 4]}
    >
      <planeGeometry args={[28, 4]} />
      <meshStandardMaterial
        color="#e0b870"
        emissive="#e0b870"
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.3}
        transparent
        opacity={0.65}
      />
    </mesh>
  );
}

/** Árvores estilizadas — cilindros + cones verde-musgo */
function ForestTrees() {
  const positions = useMemo(() => {
    const pts: { x: number; z: number; scale: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 12 + Math.random() * 30;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      // evitar muito perto do rio central
      if (Math.abs(z - 4) < 4 && Math.abs(x) < 18) continue;
      pts.push({ x, z, scale: 0.8 + Math.random() * 0.8 });
    }
    return pts;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} scale={[p.scale, p.scale, p.scale]}>
          {/* tronco */}
          <mesh castShadow position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.25, 0.35, 3, 6]} />
            <meshStandardMaterial color="#3a2818" roughness={0.9} />
          </mesh>
          {/* copa (cone) */}
          <mesh castShadow position={[0, 4.5, 0]}>
            <coneGeometry args={[1.8, 4, 8]} />
            <meshStandardMaterial
              color="#2a4828"
              emissive="#1a3018"
              emissiveIntensity={0.15}
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Fireflies/vagalumes-memória (pontos voadores) */
function CanopyFireflies() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 80;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 50,
      y: 1 + Math.random() * 6,
      z: (Math.random() - 0.5) * 50,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      child.position.y = d.y + Math.sin(t * d.speed + d.phase) * 0.3;
      child.position.x = d.x + Math.cos(t * d.speed * 0.5 + d.phase) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#ffd870" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
