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
import { Adama } from "../world/Adama";
import { Portal } from "../world/Portal";

/* =========================================================
   TelosScene — O Último Refúgio Lemuriano
   ---------------------------------------------------------
   Caverna clara como dia eterno. Floresta intra-terrena com
   árvores invertidas (tronco no chão da caverna, copa apontando
   para baixo na verdade — porque a caverna foi modelada como
   "céu invertido"). Cidade orgânica de madeira-cristal entre
   as árvores. Adama no centro num pavilhão maior. Silhuetas
   distantes de outros telosianos.

   Ver docs/22-civilizacoes-expandidas.md §2.3 (Telos).
   ========================================================= */

const ADAMA_POS: [number, number, number] = [0, 0.4, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface TelosSceneProps {
  adamaAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function TelosScene({
  adamaAwakened,
  onReturnToMar,
  onPlayerRef,
}: TelosSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const adamaTarget = useMemo(() => new THREE.Vector3(...ADAMA_POS), []);

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
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 4, 14] }}
    >
      {/* Skybox claro-verde — dia eterno sob a montanha */}
      <color attach="background" args={["#cae8c4"]} />
      <fog attach="fog" args={["#b8dcb0", 22, 95]} />

      <ambientLight color="#dceac8" intensity={0.85} />

      {/* Luz "do alto" da caverna — verde-clara, suave, generosa */}
      <pointLight
        position={[0, 24, 0]}
        intensity={adamaAwakened ? 1.8 : 1.4}
        distance={72}
        color="#e8f4d0"
        decay={2}
      />

      {/* Luz quente do centro — pavilhão de Adama */}
      <pointLight
        position={[0, 2.2, 0]}
        intensity={1.4}
        distance={16}
        color="#ffd8c8"
        decay={2}
      />

      <directionalLight
        position={[10, 20, 6]}
        intensity={0.55}
        color="#f4ecd8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={70}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />

      <ForestFloor />
      <InvertedTrees />
      <CrystalPavilions />
      <CentralPavilion />
      <PollenParticles />
      <DistantTelosians />

      <Adama
        position={ADAMA_POS}
        awakened={adamaAwakened}
        playerRef={playerRef}
      />

      <Player
        externalRef={playerRef}
        awakenTarget={adamaTarget}
        awakenDistance={3.4}
      />

      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={adamaAwakened ? "(Lemúria ainda canta)" : "(voltar)"}
          color="#d8f4c8"
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
        <Bloom intensity={0.7} luminanceThreshold={0.55} mipmapBlur />
        <Vignette eskil={false} darkness={0.42} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de mundo ---------------- */

/** Chão verde-suave da floresta — musgo claro com leve emissivo. */
function ForestFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[70, 64]} />
      <meshStandardMaterial
        color="#aed09a"
        emissive="#5a7848"
        emissiveIntensity={0.12}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  );
}

/** 20 árvores invertidas — tronco partindo do chão, copa apontando para
 *  baixo na verdade não, espera: a fala diz "que crescem para baixo, copas
 *  em direção ao chão da caverna". Em Telos a caverna é alta, e o "céu"
 *  é o teto — algumas árvores cresceram do TETO para baixo. Aqui
 *  modelamos: tronco pendurado do alto, copa próxima ao chão da caverna. */
function InvertedTrees() {
  const trees = useMemo(() => {
    const out: { x: number; z: number; h: number; r: number; tilt: number }[] =
      [];
    const COUNT = 20;
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2;
      const radius = 14 + (i % 4) * 4;
      out.push({
        x: Math.cos(a) * radius,
        z: Math.sin(a) * radius,
        h: 7 + (i % 3) * 1.4,
        r: 0.45 + (i % 2) * 0.12,
        tilt: ((i % 5) - 2) * 0.04,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {trees.map((t, i) => (
        <group
          key={`tree-${i}`}
          position={[t.x, 0, t.z]}
          rotation={[t.tilt, i * 0.31, 0]}
        >
          {/* Tronco — cone INVERTIDO: base grossa no teto, fino próximo ao chão */}
          <mesh position={[0, t.h / 2 + 1.3, 0]} castShadow>
            <coneGeometry args={[t.r, t.h, 12]} />
            <meshStandardMaterial
              color="#6a4a30"
              emissive="#3a2818"
              emissiveIntensity={0.1}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
          {/* "Copa virada" — cone apontando para baixo + 3 esferas folhagem
              perto do chão, lado verde-claro */}
          <mesh position={[0, 1.0, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[t.r * 2.6, 1.6, 14]} />
            <meshStandardMaterial
              color="#8ec480"
              emissive="#3a5828"
              emissiveIntensity={0.18}
              roughness={0.72}
              metalness={0.05}
            />
          </mesh>
          {[0, 1, 2].map((j) => {
            const a = (j / 3) * Math.PI * 2;
            return (
              <mesh
                key={`leaf-${i}-${j}`}
                position={[
                  Math.cos(a) * t.r * 1.8,
                  0.55 + j * 0.18,
                  Math.sin(a) * t.r * 1.8,
                ]}
                castShadow
              >
                <sphereGeometry args={[t.r * 1.3, 12, 10]} />
                <meshStandardMaterial
                  color="#9ed094"
                  emissive="#3a5a28"
                  emissiveIntensity={0.22}
                  roughness={0.7}
                  metalness={0.05}
                />
              </mesh>
            );
          })}
          {/* Pontinho de seiva-cristal na base da copa virada */}
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshBasicMaterial
              color="#f8f0c8"
              transparent
              opacity={0.78}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 6 pavilhões orgânicos de madeira-cristal entre as árvores —
 *  pequenas estruturas hexagonais low-poly. */
function CrystalPavilions() {
  const pavilions = useMemo(() => {
    const out: { x: number; z: number; angle: number }[] = [];
    const COUNT = 6;
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2 + 0.3;
      const r = 9;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        angle: a,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {pavilions.map((p, i) => (
        <group
          key={`pav-${i}`}
          position={[p.x, 0, p.z]}
          rotation={[0, p.angle + Math.PI, 0]}
        >
          {/* Base hexagonal de madeira clara */}
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.95, 1.1, 0.7, 6]} />
            <meshStandardMaterial
              color="#c8a878"
              emissive="#6a4a28"
              emissiveIntensity={0.14}
              roughness={0.82}
              metalness={0.08}
            />
          </mesh>
          {/* Telhado cônico — cristal claro */}
          <mesh position={[0, 1.1, 0]} castShadow>
            <coneGeometry args={[1.1, 1.0, 6]} />
            <meshStandardMaterial
              color="#e8e0c8"
              emissive="#a89878"
              emissiveIntensity={0.25}
              roughness={0.55}
              metalness={0.3}
              transparent
              opacity={0.92}
            />
          </mesh>
          {/* Pequena luz interna — pavilhão habitado */}
          <pointLight
            position={[0, 0.7, 0]}
            intensity={0.45}
            distance={4}
            color="#ffd8b0"
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}

/** Pavilhão central maior — onde Adama acolhe. */
function CentralPavilion() {
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!crystalRef.current) return;
    const t = state.clock.elapsedTime;
    const m = crystalRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.45 + Math.sin(t * 0.4) * 0.1;
    crystalRef.current.rotation.y = t * 0.06;
  });

  return (
    <group>
      {/* Base ampla octogonal de madeira clara */}
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[3.0, 3.2, 0.36, 8]} />
        <meshStandardMaterial
          color="#d8b88a"
          emissive="#8a6840"
          emissiveIntensity={0.18}
          roughness={0.78}
          metalness={0.08}
        />
      </mesh>
      {/* Anel rosado contornando a base — coração lemuriano */}
      <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.05, 0.05, 8, 32]} />
        <meshStandardMaterial
          color="#f4c4b8"
          emissive="#c87878"
          emissiveIntensity={0.4}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {/* Cristal flutuante acima — símbolo da cura coletiva */}
      <mesh ref={crystalRef} position={[0, 4.6, 0]}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color="#f4e0c8"
          emissive="#ffb098"
          emissiveIntensity={0.45}
          roughness={0.35}
          metalness={0.4}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Halo difuso do cristal central */}
      <mesh position={[0, 4.6, 0]}>
        <sphereGeometry args={[0.9, 16, 12]} />
        <meshBasicMaterial
          color="#ffd0b8"
          transparent
          opacity={0.15}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Pólen-luminoso: partículas douradas pequenas dispersas no ar. */
function PollenParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 120;

  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => {
      return {
        x: (Math.random() - 0.5) * 36,
        z: (Math.random() - 0.5) * 36,
        baseY: 0.4 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.3,
        size: 0.04 + Math.random() * 0.06,
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const mesh = child as THREE.Mesh;
      mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.6;
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 0.4 + Math.sin(t * d.speed + d.phase) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={`pol-${i}`} position={[d.x, d.baseY, d.z]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial
            color="#fff4c0"
            transparent
            opacity={0.6}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Silhuetas distantes — outros telosianos, percebidos mais que vistos. */
function DistantTelosians() {
  const positions = useMemo(() => {
    const out: { x: number; z: number; h: number; phase: number }[] = [];
    const COUNT = 10;
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2 + 0.18;
      const r = 22 + (i % 3) * 4;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 1.7,
        phase: i * 0.7,
      });
    }
    return out;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = positions[i];
      if (!d) return;
      child.position.y = Math.sin(t * 0.25 + d.phase) * 0.05;
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <mesh key={`tel-${i}`} position={[p.x, p.h / 2, p.z]}>
          <cylinderGeometry args={[0.18, 0.32, p.h, 8]} />
          <meshStandardMaterial
            color="#f4ecdc"
            emissive="#a89888"
            emissiveIntensity={0.32}
            roughness={0.7}
            metalness={0.1}
            transparent
            opacity={0.62}
          />
        </mesh>
      ))}
    </group>
  );
}
