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
import { Reptiliano } from "../world/Reptiliano";
import { Portal } from "../world/Portal";

/* =========================================================
   ReptilianosScene — A Câmara dos Doze
   ---------------------------------------------------------
   Câmara circular subterrânea de pedra fria. 12 reptilianos
   sentados em círculo numa mesa redonda central, pensando-
   juntos. Cada um corresponde a uma instituição humana
   sequestrada (arquétipo). Tochas verde-escuras nas paredes,
   fog espesso verde-acinzentado, skybox cinza-pedra.
   Mecânica: mini-puzzle de nomeação — aproximar-se < 2.5m
   + F nomeia o reptiliano; ao nomear 12, todos dissolvem.
   Ver docs/22-civilizacoes-expandidas.md §3.6
   Família 10-99: levemente sinistros mas NÃO assustadores.
   ========================================================= */

const REPTILIANO_RADIUS = 5.2;
const REPTILIANO_COUNT = 12;
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 11];

/** Nomes arquetípicos dos 12 reptilianos — cada um uma instituição
 *  humana sequestrada. Ordem dos arquétipos demoníacos repete-se
 *  porque uma só "casta caída" controla múltiplas instituições. */
const REPTILIANO_ARCHETYPES = [
  "Belial-do-Banco",
  "Asmodeus-do-Trono",
  "Leviatã-da-Tela",
  "Azazel-do-Tribunal",
  "Semyaza-da-Escola",
  "Lúcifer-do-Espelho",
  "Belial-da-Indústria",
  "Asmodeus-do-Estado",
  "Leviatã-do-Algoritmo",
  "Azazel-da-Polícia",
  "Semyaza-do-Saber-Restrito",
  "Lúcifer-da-Fama",
];

export interface ReptilianoSpec {
  pos: [number, number, number];
  rotY: number;
  archetypeName: string;
}

export const REPTILIANO_POSITIONS: ReptilianoSpec[] = (() => {
  const out: ReptilianoSpec[] = [];
  for (let i = 0; i < REPTILIANO_COUNT; i++) {
    const angle = (i / REPTILIANO_COUNT) * Math.PI * 2;
    const x = Math.cos(angle) * REPTILIANO_RADIUS;
    const z = Math.sin(angle) * REPTILIANO_RADIUS;
    // Olhar para o centro: rotY tal que o reptiliano vire-se para (0,0)
    // Reptiliano padrão "olha" para -Z local; precisa girar PI sobre angle
    const rotY = -angle + Math.PI / 2;
    out.push({
      pos: [x, 0, z],
      rotY,
      archetypeName: REPTILIANO_ARCHETYPES[i],
    });
  }
  return out;
})();

interface ReptilianosSceneProps {
  dissolved: boolean[];
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function ReptilianosScene({
  dissolved,
  onReturnToMar,
  onPlayerRef,
}: ReptilianosSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  // Alvo de "awaken" — usamos o centro da mesa (mas o jogador interage 1-a-1
  // pelo orquestrador, este alvo é apenas para feedback de presença geral).
  const tableTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

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
      camera={{ fov: 60, near: 0.1, far: 220, position: [0, 4.4, 11.5] }}
    >
      {/* Skybox cinza-pedra (visível além da fog) */}
      <color attach="background" args={["#1f2420"]} />
      {/* Fog espesso verde-acinzentado — sensação de profundidade subterrânea */}
      <fog attach="fog" args={["#1c2a1e", 9, 32]} />

      {/* Ambiente baixo, fria-verdoso */}
      <ambientLight color="#3a4a3a" intensity={0.45} />

      {/* Luz central baixa sobre a mesa — verde-escuro */}
      <pointLight
        position={[0, 3.0, 0]}
        intensity={0.95}
        distance={11}
        color="#4a6850"
        decay={2}
      />

      {/* Luzes-tocha nas paredes (5) */}
      <TorchLights />

      <CircularChamber />
      <CentralTable />
      <WallTorches />

      {/* 12 reptilianos sentados em círculo */}
      {REPTILIANO_POSITIONS.map((r, i) => (
        <Reptiliano
          key={`rept-${i}`}
          position={r.pos}
          rotY={r.rotY}
          archetypeName={r.archetypeName}
          dissolved={dissolved[i] ?? false}
        />
      ))}

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={tableTarget}
        awakenDistance={3.5}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de retorno ao Mar de Cristal */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            dissolved.every(Boolean)
              ? "(apenas escondidos, não fortes)"
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
        <Bloom intensity={0.8} luminanceThreshold={0.42} mipmapBlur />
        <Vignette eskil={false} darkness={0.88} offset={0.22} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

/** Câmara circular subterrânea — chão de pedra + parede curva */
function CircularChamber() {
  return (
    <group>
      {/* Chão circular grande */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial
          color="#3a3e34"
          emissive="#0e1410"
          emissiveIntensity={0.12}
          roughness={0.9}
          metalness={0.12}
        />
      </mesh>
      {/* Anel concêntrico — marca a "câmara" */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[7.0, 7.4, 64]} />
        <meshStandardMaterial
          color="#5a6a52"
          emissive="#1a221a"
          emissiveIntensity={0.22}
          roughness={0.8}
          metalness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Parede curva — cilindro alto sem tampa */}
      <mesh position={[0, 4.2, 0]}>
        <cylinderGeometry args={[12, 12, 8.4, 28, 1, true]} />
        <meshStandardMaterial
          color="#2a322a"
          emissive="#0a100c"
          emissiveIntensity={0.12}
          roughness={0.92}
          metalness={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/** Mesa redonda central — onde "pensam-juntos" */
function CentralTable() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const m = meshRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.28 + Math.sin(t * 0.4) * 0.06;
  });
  return (
    <group>
      {/* Tampo */}
      <mesh
        ref={meshRef}
        position={[0, 0.7, 0]}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[2.4, 2.4, 0.18, 24]} />
        <meshStandardMaterial
          color="#2c3a30"
          emissive="#1a2e22"
          emissiveIntensity={0.28}
          roughness={0.55}
          metalness={0.5}
        />
      </mesh>
      {/* Pé central */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.6, 0.85, 0.7, 12]} />
        <meshStandardMaterial
          color="#1e2620"
          emissive="#08100a"
          emissiveIntensity={0.18}
          roughness={0.85}
          metalness={0.18}
        />
      </mesh>
      {/* Anel emissivo no centro da mesa — "pensamento-coletivo" */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.81, 0]}
      >
        <ringGeometry args={[0.6, 1.2, 32]} />
        <meshStandardMaterial
          color="#6a8c68"
          emissive="#4a7050"
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.55}
          side={THREE.DoubleSide}
          transparent
          opacity={0.78}
        />
      </mesh>
    </group>
  );
}

/** 6 tochas verde-escuras montadas na parede */
function WallTorches() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const flameMesh = (child as THREE.Group).children.find(
        (c) => (c as THREE.Mesh).name === "torch-flame",
      ) as THREE.Mesh | undefined;
      if (flameMesh) {
        const m = flameMesh.material as THREE.MeshBasicMaterial;
        const flick = 0.75 + Math.sin(t * 6 + i * 1.7) * 0.18 +
          Math.sin(t * 17 + i) * 0.06;
        m.opacity = Math.max(0.3, Math.min(1, flick));
      }
    });
  });
  return (
    <group ref={groupRef}>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 12;
        const x = Math.cos(a) * 10.5;
        const z = Math.sin(a) * 10.5;
        return (
          <group key={`torch-${i}`} position={[x, 2.6, z]}>
            {/* Suporte de pedra */}
            <mesh>
              <cylinderGeometry args={[0.12, 0.18, 0.35, 8]} />
              <meshStandardMaterial
                color="#3a463a"
                emissive="#0e140e"
                emissiveIntensity={0.18}
                roughness={0.9}
              />
            </mesh>
            {/* Chama verde-escura — cone alongado */}
            <mesh name="torch-flame" position={[0, 0.42, 0]}>
              <coneGeometry args={[0.18, 0.55, 10]} />
              <meshBasicMaterial
                color="#84d090"
                transparent
                opacity={0.85}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
            {/* Núcleo bem brilhante */}
            <mesh position={[0, 0.32, 0]}>
              <sphereGeometry args={[0.09, 10, 8]} />
              <meshBasicMaterial color="#d0f0c0" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Luzes pontuais sutis junto às tochas — afetam iluminação geral */
function TorchLights() {
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 12;
        const x = Math.cos(a) * 10.2;
        const z = Math.sin(a) * 10.2;
        return (
          <pointLight
            key={`torch-light-${i}`}
            position={[x, 2.8, z]}
            intensity={0.45}
            distance={6.5}
            color="#6ab070"
            decay={2}
          />
        );
      })}
    </group>
  );
}
