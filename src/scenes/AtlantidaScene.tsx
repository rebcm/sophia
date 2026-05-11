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
import { Eloaios } from "../world/Eloaios";
import { Portal } from "../world/Portal";
import { Filament } from "../world/Filament";

/* =========================================================
   AtlantidaScene — 4ª Civilização Perdida
   ---------------------------------------------------------
   Cidade circular concêntrica sobre o oceano. Três anéis de
   água + três de terra. Pontes de cristal. Templos brancos
   com pirâmides de quartzo. Eloaios no centro com a Tábua
   da Lei. A ilha afunda lentamente — pequenos pedaços já
   submersos.
   Ver docs/02d-civilizacoes-perdidas.md §6
   ========================================================= */

const ELOAIOS_POS: [number, number, number] = [0, 0.5, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface AtlantidaSceneProps {
  eloaiosAwakened: boolean;
  onReturnToMar?: () => void;
}

export function AtlantidaScene({
  eloaiosAwakened,
  onReturnToMar,
}: AtlantidaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const eloaiosTarget = useMemo(
    () => new THREE.Vector3(ELOAIOS_POS[0], 0, ELOAIOS_POS[2]),
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
      <color attach="background" args={["#0a1a2a"]} />
      <fog attach="fog" args={["#1a3050", 16, 80]} />

      <ambientLight color="#6890b8" intensity={0.5} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={0.7}
        color="#a8d0e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[0, 7, 0]}
        intensity={eloaiosAwakened ? 1.5 : 0.9}
        distance={28}
        color={eloaiosAwakened ? "#dde8f8" : "#88c0e8"}
        decay={2}
      />

      <Ocean />
      <ConcentricRings />
      <CrystalBridges />
      <CrystalPyramids />

      <Eloaios position={ELOAIOS_POS} awakened={eloaiosAwakened} />

      <Filament
        base={[ELOAIOS_POS[0], 3.2, ELOAIOS_POS[2]]}
        tint="violeta"
        height={16}
        ruptured={eloaiosAwakened}
      />

      <Player
        externalRef={playerRef}
        awakenTarget={eloaiosTarget}
        awakenDistance={3.5}
      />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={eloaiosAwakened ? "(a lei tornou-se viva)" : "(voltar)"}
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

/* ---------------- Sub-componentes ---------------- */

function Ocean() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity =
      0.15 + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.5, 0]}
    >
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial
        color="#0c2440"
        emissive="#1a3868"
        emissiveIntensity={0.15}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

/** 3 anéis de terra concêntricos com 3 anéis de água entre eles */
function ConcentricRings() {
  const rings = [3.5, 6.5, 9.5];
  return (
    <group>
      {rings.map((r, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, 0]}
          receiveShadow
        >
          <ringGeometry args={[r, r + 1.2, 48]} />
          <meshStandardMaterial
            color="#d8d0c0"
            emissive="#6890a0"
            emissiveIntensity={0.1}
            roughness={0.7}
            metalness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Plataforma central onde Eloaios senta */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial
          color="#e8e0d0"
          emissive="#88c0e8"
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

/** 4 pontes de cristal conectando os anéis nos eixos cardinais */
function CrystalBridges() {
  return (
    <group>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[6, 0.2, 0]} castShadow>
            <boxGeometry args={[10, 0.1, 0.6]} />
            <meshStandardMaterial
              color="#dde8f8"
              emissive="#88c0e8"
              emissiveIntensity={0.4}
              roughness={0.1}
              metalness={0.5}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Pirâmides de quartzo distribuídas pelos anéis externos */
function CrystalPyramids() {
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let r = 0; r < 3; r++) {
      const ringR = 4.5 + r * 3;
      const count = 4 + r * 2;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + r * 0.3;
        out.push([Math.cos(a) * ringR, 0, Math.sin(a) * ringR]);
      }
    }
    return out;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[p[0], 0.7, p[2]]}
          castShadow
          rotation={[0, i * 0.7, 0]}
        >
          <coneGeometry args={[0.45, 1.4, 4]} />
          <meshStandardMaterial
            color="#dde8f8"
            emissive="#88c0e8"
            emissiveIntensity={0.3}
            roughness={0.1}
            metalness={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}
