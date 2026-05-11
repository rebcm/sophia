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
import { Demiurgo } from "../world/Demiurgo";

/* =========================================================
   TronoDemiurgoScene — clímax do jogo
   ---------------------------------------------------------
   Câmara absoluta. Pilares quebrados. Filamentos vindos das
   7 civilizações convergem aqui, ainda que rompidos.
   O Demiurgo sentado, gigante, com aura roxa. O jogador
   aproxima-se. Pressionar F = abraçar (não atacar).
   Pós-abraço: cinemáticas 15-18 + 6 endings.
   ========================================================= */

const DEMIURGO_POS: [number, number, number] = [0, 0, -4];

interface TronoDemiurgoSceneProps {
  embraced: boolean;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function TronoDemiurgoScene({
  embraced,
  onPlayerRef,
}: TronoDemiurgoSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);
  const demiurgoTarget = useMemo(
    () => new THREE.Vector3(DEMIURGO_POS[0], 0, DEMIURGO_POS[2]),
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
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 5, 16] }}
    >
      <color attach="background" args={["#0a0418"]} />
      <fog attach="fog" args={["#1a0828", 22, 120]} />

      <ambientLight color="#2a1840" intensity={0.6} />

      <directionalLight
        position={[10, 18, 8]}
        intensity={0.5}
        color={embraced ? "#fff0e0" : "#7a4ab8"}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Floor embraced={embraced} />
      <BrokenPillars />
      <ConvergingFilaments embraced={embraced} />

      <Demiurgo position={DEMIURGO_POS} embraced={embraced} />

      <Player
        externalRef={playerRef}
        awakenTarget={demiurgoTarget}
        awakenDistance={5.5}
      />
      <Whisperer playerRef={playerRef} />

      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.35} mipmapBlur />
        <Vignette eskil={false} darkness={0.85} offset={0.25} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function Floor({ embraced }: { embraced: boolean }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial
        color="#10081a"
        emissive={embraced ? "#fff5d8" : "#5a3aa0"}
        emissiveIntensity={embraced ? 0.35 : 0.18}
        roughness={0.5}
        metalness={0.4}
      />
    </mesh>
  );
}

function BrokenPillars() {
  const positions = useMemo(() => {
    const r = 14;
    return Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 4 + Math.random() * 4,
        rotZ: (Math.random() - 0.5) * 0.3,
      };
    });
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, p.h / 2, p.z]}
          rotation={[0, 0, p.rotZ]}
          castShadow
        >
          <cylinderGeometry args={[0.6, 0.7, p.h, 12]} />
          <meshStandardMaterial
            color="#2a1830"
            emissive="#1a0a28"
            emissiveIntensity={0.3}
            roughness={0.85}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Filamentos espessos convergindo do "alto" para o trono — fonte da drenagem
 *  do mundo inteiro. Quando o Demiurgo é abraçado, dissipam-se. */
function ConvergingFilaments({ embraced }: { embraced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 12;
  const positions = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const a = (i / COUNT) * Math.PI * 2;
      const r = 12 + Math.random() * 6;
      return {
        from: [Math.cos(a) * r, 16, Math.sin(a) * r] as [
          number,
          number,
          number,
        ],
      };
    });
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const m = mesh.material as THREE.MeshBasicMaterial;
      if (embraced) {
        m.opacity = Math.max(0, m.opacity - 0.01);
      } else {
        m.opacity = 0.55;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => {
        // Cilindro do ponto alto até o trono — orientação computada
        const mid = new THREE.Vector3(
          (p.from[0] + DEMIURGO_POS[0]) / 2,
          (p.from[1] + 4) / 2,
          (p.from[2] + DEMIURGO_POS[2]) / 2,
        );
        const dir = new THREE.Vector3(
          p.from[0] - DEMIURGO_POS[0],
          p.from[1] - 4,
          p.from[2] - DEMIURGO_POS[2],
        );
        const length = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize(),
        );
        return (
          <mesh
            key={i}
            position={mid.toArray() as [number, number, number]}
            quaternion={quat}
          >
            <cylinderGeometry args={[0.05, 0.05, length, 6]} />
            <meshBasicMaterial
              color="#a878d8"
              transparent
              opacity={0.55}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
