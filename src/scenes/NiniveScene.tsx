import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { Portal } from "../world/Portal";
import { JonasDaMemoria } from "../world/JonasDaMemoria";

/* =========================================================
   NiniveScene — A Cidade Que Se Lembrou
   ---------------------------------------------------------
   Cidade ao entardecer claro, ainda mais em paz que Bela.
   Habitantes ajoelhados em silêncio em uma praça central —
   não em luto, em GRATIDÃO. Lembrança coletiva. Nínive
   ouviu Jonas (livro de Jonas) e foi poupada. NO JOGO ela é
   precedente esperançoso — toda cidade pode lembrar.

   Sem mecânica de intercessão. Encontro opcional com Jonas-
   da-Memória. Aproximação + F → cinemática "jonas-de-ninive".

   Geografia:
     - Praça central com ~30 silhuetas-habitantes ajoelhadas
     - Templo simples ao fundo (paredes cinzas, telhado dourado)
     - Pequenos jarros de cinzas espalhados (Jonas 3:6)
     - Sol baixo dourado no horizonte
     - Skybox laranja-sépia-final-de-tarde

   Ver docs/22-civilizacoes-expandidas.md §4.7 (Nínive).
   ========================================================= */

const JONAS_POS: [number, number, number] = [-5.2, 0, 1.4];
const TEMPLE_POS: [number, number, number] = [0, 0, -10];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface NiniveSceneProps {
  jonasMet: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function NiniveScene({
  jonasMet,
  onReturnToMar,
  onPlayerRef,
}: NiniveSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

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
      camera={{ fov: 60, near: 0.1, far: 320, position: [0, 4, 13] }}
    >
      {/* Skybox laranja-sépia-final-de-tarde — mais quente que Bela */}
      <color attach="background" args={["#d88858"]} />
      <fog attach="fog" args={["#c47848", 18, 90]} />

      <ambientLight color="#e8a878" intensity={0.7} />

      {/* Sol baixo dourado no horizonte — luz forte de lateral */}
      <directionalLight
        position={[-14, 5, -2]}
        intensity={1.1}
        color="#ffb878"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Luz quente do templo ao fundo */}
      <pointLight
        position={[TEMPLE_POS[0], 4, TEMPLE_POS[2]]}
        intensity={1.4}
        distance={18}
        color="#ffc880"
        decay={2}
      />

      {/* Luz sobre Jonas (mais discreta após encontro) */}
      <pointLight
        position={[JONAS_POS[0], 2.8, JONAS_POS[2]]}
        intensity={jonasMet ? 0.6 : 0.9}
        distance={6}
        color="#dca878"
        decay={2}
      />

      <SandyGround />
      <KneelingInhabitants />
      <AshJars />
      <SimpleTemple position={TEMPLE_POS} />
      <SunOnHorizon />
      <DustHaze />

      <JonasDaMemoria
        position={JONAS_POS}
        metByPlayer={jonasMet}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={jonasMet ? "(Nínive lembra)" : "(voltar)"}
          color="#ffb878"
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
        <Bloom intensity={0.8} luminanceThreshold={0.55} mipmapBlur />
        <Vignette eskil={false} darkness={0.5} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Chão de terra batida com leve emissivo sépia. */
function SandyGround() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[36, 64]} />
        <meshStandardMaterial
          color="#c89868"
          emissive="#7a5028"
          emissiveIntensity={0.14}
          roughness={0.94}
          metalness={0.05}
        />
      </mesh>
      {/* Círculo central da praça — pedras um pouco mais escuras */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, 0.0, 0]}
      >
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial
          color="#a87848"
          emissive="#5a3818"
          emissiveIntensity={0.18}
          roughness={0.92}
          metalness={0.06}
        />
      </mesh>
    </group>
  );
}

/** 30 silhuetas-cilindros ajoelhadas em silêncio — não luto, gratidão.
 *  Disposição em anéis concêntricos voltados para o templo. */
function KneelingInhabitants() {
  const inhabitants = useMemo(() => {
    const out: {
      x: number;
      z: number;
      rotY: number;
      tone: number;
    }[] = [];

    // Três anéis concêntricos voltados para o templo (norte, z negativo)
    const rings = [
      { radius: 2.6, count: 8 },
      { radius: 4.2, count: 11 },
      { radius: 5.6, count: 11 },
    ];

    rings.forEach((ring, ringIdx) => {
      for (let i = 0; i < ring.count; i++) {
        // Distribui no semicírculo voltado para o templo
        const baseAngle = -Math.PI / 2; // -z = templo
        const spread = Math.PI * 1.35; // semicírculo amplo
        const a = baseAngle - spread / 2 + (i / (ring.count - 1)) * spread;
        const x = Math.cos(a) * ring.radius;
        const z = Math.sin(a) * ring.radius;
        // Rotação Y: virado para o templo (origem dos anéis está em [0,0])
        const rotY = Math.atan2(-x, TEMPLE_POS[2] - z);
        out.push({
          x,
          z,
          rotY,
          tone: (ringIdx + i) % 3,
        });
      }
    });

    return out;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      // Respiração coletiva muito sutil — não andam (estão ajoelhados)
      const phase = i * 0.13;
      child.position.y = Math.sin(t * 0.35 + phase) * 0.02;
    });
  });

  // 3 tons de manto: sépia-claro, terra, marrom-cinza
  const tones = [
    { color: "#d8b088", emissive: "#7a5430" },
    { color: "#b88860", emissive: "#5a3a18" },
    { color: "#a47858", emissive: "#4a2c14" },
  ];

  return (
    <group ref={groupRef}>
      {inhabitants.map((inh, i) => {
        const tone = tones[inh.tone];
        return (
          <group
            key={`k-${i}`}
            position={[inh.x, 0, inh.z]}
            rotation={[0, inh.rotY, 0]}
          >
            {/* Corpo ajoelhado: cilindro baixo (vestes dobradas no chão) */}
            <mesh position={[0, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.42, 0.62, 10]} />
              <meshStandardMaterial
                color={tone.color}
                emissive={tone.emissive}
                emissiveIntensity={0.22}
                roughness={0.85}
                metalness={0.05}
              />
            </mesh>
            {/* Tronco curto inclinado para frente — outro cilindro mais estreito */}
            <mesh
              position={[0, 0.78, 0.08]}
              rotation={[0.35, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.22, 0.3, 0.55, 10]} />
              <meshStandardMaterial
                color={tone.color}
                emissive={tone.emissive}
                emissiveIntensity={0.22}
                roughness={0.85}
                metalness={0.05}
              />
            </mesh>
            {/* Cabeça baixa — esfera */}
            <mesh
              position={[0, 1.02, 0.22]}
              castShadow
            >
              <sphereGeometry args={[0.18, 12, 10]} />
              <meshStandardMaterial
                color="#dcb890"
                emissive="#8a5838"
                emissiveIntensity={0.18}
                roughness={0.78}
                metalness={0.04}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Pequenos jarros de cinzas espalhados sutilmente — referência a
 *  Jonas 3:6 (rei vestido de saco, sentado em cinzas). */
function AshJars() {
  const jars = useMemo(() => {
    const out: { x: number; z: number; scale: number }[] = [];
    // Espalha jarros em torno da praça (mas não dentro dos anéis ajoelhados)
    const positions: [number, number][] = [
      [-7.0, -0.4],
      [-6.6, 3.0],
      [-3.4, 6.4],
      [2.8, 6.2],
      [6.4, 3.4],
      [7.0, -1.2],
      [-1.6, -4.8],
      [3.8, -4.4],
    ];
    positions.forEach(([x, z], i) => {
      out.push({ x, z, scale: 0.5 + (i % 3) * 0.1 });
    });
    return out;
  }, []);

  return (
    <group>
      {jars.map((j, i) => (
        <group key={`jar-${i}`} position={[j.x, 0, j.z]} scale={j.scale}>
          <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.28, 0.65, 12]} />
            <meshStandardMaterial
              color="#5a3a22"
              emissive="#2a180a"
              emissiveIntensity={0.15}
              roughness={0.88}
              metalness={0.06}
            />
          </mesh>
          <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.03, 6, 14]} />
            <meshStandardMaterial
              color="#3a2410"
              emissive="#1a0c04"
              emissiveIntensity={0.15}
              roughness={0.82}
              metalness={0.1}
            />
          </mesh>
          {/* Pequeno disco de cinzas dentro */}
          <mesh position={[0, 0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.17, 18]} />
            <meshStandardMaterial
              color="#b8b0a4"
              emissive="#88847c"
              emissiveIntensity={0.28}
              roughness={0.95}
              metalness={0.0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Templo simples — paredes cinzas low-poly, telhado dourado. */
function SimpleTemple({ position }: { position: [number, number, number] }) {
  const roofRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!roofRef.current) return;
    const t = state.clock.elapsedTime;
    const m = roofRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.35 + Math.sin(t * 0.45) * 0.08;
  });

  return (
    <group position={position}>
      {/* Plataforma */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <boxGeometry args={[8.0, 0.5, 6.0]} />
        <meshStandardMaterial
          color="#88806c"
          emissive="#3a3428"
          emissiveIntensity={0.15}
          roughness={0.88}
          metalness={0.08}
        />
      </mesh>

      {/* Paredes — caixa cinza */}
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 3.2, 4.5]} />
        <meshStandardMaterial
          color="#9a9080"
          emissive="#4a4438"
          emissiveIntensity={0.16}
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>

      {/* Colunas frontais — 4 cilindros */}
      {[-2.6, -0.85, 0.85, 2.6].map((cx, i) => (
        <mesh
          key={`col-${i}`}
          position={[cx, 1.85, 2.4]}
          castShadow
        >
          <cylinderGeometry args={[0.22, 0.24, 3.4, 12]} />
          <meshStandardMaterial
            color="#ada288"
            emissive="#5a5040"
            emissiveIntensity={0.2}
            roughness={0.78}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Telhado — pirâmide dourada */}
      <mesh ref={roofRef} position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[5.0, 2.4, 4]} />
        <meshStandardMaterial
          color="#e8b870"
          emissive="#a87838"
          emissiveIntensity={0.35}
          roughness={0.5}
          metalness={0.55}
        />
      </mesh>

      {/* Portal central — retângulo escuro emissivo dourado interno */}
      <mesh position={[0, 1.6, 2.276]}>
        <planeGeometry args={[1.6, 2.6]} />
        <meshBasicMaterial
          color="#ffc878"
          transparent
          opacity={0.55}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Sol baixo no horizonte — disco dourado emissivo + halo grande. */
function SunOnHorizon() {
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!haloRef.current) return;
    const t = state.clock.elapsedTime;
    const m = haloRef.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.32 + Math.sin(t * 0.3) * 0.06;
  });

  return (
    <group position={[-18, 5, -22]}>
      {/* Disco do sol */}
      <mesh>
        <sphereGeometry args={[2.2, 24, 16]} />
        <meshBasicMaterial
          color="#ffd078"
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>
      {/* Halo difuso ao redor */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[3.6, 18, 14]} />
        <meshBasicMaterial
          color="#ffa860"
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Bruma de poeira no ar — partículas sépia. */
function DustHaze() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 90;

  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 28,
      z: (Math.random() - 0.5) * 28,
      baseY: 0.3 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.1 + Math.random() * 0.22,
      size: 0.04 + Math.random() * 0.05,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const mesh = child as THREE.Mesh;
      mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.45;
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 0.3 + Math.sin(t * d.speed + d.phase) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={`haze-${i}`} position={[d.x, d.baseY, d.z]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial
            color="#f4c890"
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
