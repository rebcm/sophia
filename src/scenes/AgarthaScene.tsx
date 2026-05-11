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
import { ReiDoMundo } from "../world/ReiDoMundo";
import { Portal } from "../world/Portal";

/* =========================================================
   AgarthaScene — O Reino Que Lembrou
   ---------------------------------------------------------
   Cidade intra-terrena. Os descendentes da civilização
   Pré-Adamita que NÃO esqueceram. Vivem aqui há ~60 mil anos
   em paz, ao redor de um lago de água-mãe.

   Geografia:
   - Caverna gigantesca com céu-cristal próprio (estalactites
     brilhantes funcionando como estrelas íntimas).
   - Lago central de "água-mãe" — emissivo, âmbar-quente.
   - Cidade circular: 8 edifícios cilíndricos finos, como
     colunas habitáveis, ao redor do lago.
   - Estalactites gigantes descendo do teto ao fundo.
   - Fog âmbar-terroso-escuro: a luz aqui não brilha, brota.

   Lendário: Rei do Mundo na ponte sobre o lago.
   Ver docs/02d-civilizacoes-perdidas.md (Pré-Adamita) e
   docs/19 sobre Lendários intra-terrenos.
   ========================================================= */

const REI_POS: [number, number, number] = [0, 0.4, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface AgarthaSceneProps {
  reiAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function AgarthaScene({
  reiAwakened,
  onReturnToMar,
  onPlayerRef,
}: AgarthaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const reiTarget = useMemo(() => new THREE.Vector3(...REI_POS), []);

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
      {/* Cor de fundo: terra-âmbar quase preta */}
      <color attach="background" args={["#1a0e06"]} />
      <fog attach="fog" args={["#2a1a0c", 16, 80]} />

      {/* Ambiente terroso quente */}
      <ambientLight color="#6a4830" intensity={0.55} />

      {/* "Sol" do mundo de dentro: ponto alto, dourado-quente */}
      <pointLight
        position={[0, 22, 0]}
        intensity={reiAwakened ? 2.0 : 1.4}
        distance={60}
        color="#ffc878"
        decay={2}
      />

      {/* Luz quente vinda do lago central — reflexo subindo */}
      <pointLight
        position={[0, 1.2, 0]}
        intensity={2.0}
        distance={18}
        color="#ffa860"
        decay={2}
      />

      {/* Direcional suave para sombras de chão */}
      <directionalLight
        position={[6, 18, 4]}
        intensity={0.3}
        color="#ffd8a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      <CavernFloor />
      <AguaMaeLago />
      <CityRing />
      <CrystalSky />
      <GiantStalactites />

      {/* Rei do Mundo — guardião da memória pré-adamita */}
      <ReiDoMundo
        position={REI_POS}
        awakened={reiAwakened}
        playerRef={playerRef}
      />

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={reiTarget}
        awakenDistance={3.4}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de retorno ao Mar de Cristal */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={reiAwakened ? "(o reino lembra)" : "(voltar)"}
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
        <Bloom intensity={0.95} luminanceThreshold={0.4} mipmapBlur />
        <Vignette eskil={false} darkness={0.78} offset={0.28} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

/** Chão da caverna — terra-rocha escura com leve emissivo âmbar */
function CavernFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[60, 64]} />
      <meshStandardMaterial
        color="#2a1808"
        emissive="#1a0e04"
        emissiveIntensity={0.18}
        roughness={0.95}
        metalness={0.05}
      />
    </mesh>
  );
}

/** Lago central de água-mãe — emissivo, quase fluido visualmente */
function AguaMaeLago() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.7 + Math.sin(t * 0.4) * 0.18;
  });
  return (
    <group>
      {/* Espelho d'água principal */}
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <circleGeometry args={[4.2, 48]} />
        <meshStandardMaterial
          color="#ffb070"
          emissive="#ffa050"
          emissiveIntensity={0.7}
          roughness={0.25}
          metalness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Margem do lago — pedra escura */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <ringGeometry args={[4.2, 4.8, 48]} />
        <meshStandardMaterial
          color="#3a2410"
          roughness={0.9}
        />
      </mesh>
      {/* Vapor/névoa sobre o lago — leve halo */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[5.2, 18, 12]} />
        <meshBasicMaterial
          color="#ffa860"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Cidade circular — 8 colunas habitáveis ao redor do lago */
function CityRing() {
  const buildings = useMemo(() => {
    const out: { x: number; z: number; angle: number; h: number }[] = [];
    const COUNT = 8;
    const radius = 8.5;
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2;
      out.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        angle,
        h: 5.5 + (i % 3) * 1.2,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={`bldg-${i}`} position={[b.x, 0, b.z]}>
          {/* Coluna habitável principal */}
          <mesh castShadow receiveShadow position={[0, b.h / 2, 0]}>
            <cylinderGeometry args={[0.55, 0.7, b.h, 12]} />
            <meshStandardMaterial
              color="#6a4830"
              emissive="#3a2410"
              emissiveIntensity={0.18}
              roughness={0.85}
              metalness={0.1}
            />
          </mesh>
          {/* Topo cônico */}
          <mesh castShadow position={[0, b.h + 0.4, 0]}>
            <coneGeometry args={[0.7, 0.9, 10]} />
            <meshStandardMaterial
              color="#8a6228"
              emissive="#4a3010"
              emissiveIntensity={0.22}
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>
          {/* Pequenas "janelas" emissivas — pontos âmbar nas alturas */}
          {[0.35, 0.55, 0.75].map((rel, j) => (
            <mesh
              key={`win-${j}`}
              position={[0.56, b.h * rel, 0]}
              rotation={[0, b.angle + Math.PI, 0]}
            >
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshBasicMaterial
                color="#ffd078"
                toneMapped={false}
              />
            </mesh>
          ))}
          {/* Luz interna sutil, alternando entre prédios */}
          {i % 2 === 0 && (
            <pointLight
              position={[0, b.h * 0.55, 0]}
              intensity={0.45}
              distance={5}
              color="#ffc070"
              decay={2}
            />
          )}
        </group>
      ))}
    </group>
  );
}

/** Céu-cristal: 200 esferas brilhantes pequenas dispersas em cúpula no teto */
function CrystalSky() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 200;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => {
      // distribuir em meia-esfera acima — coordenadas esféricas
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      // phi em [0, PI/2.2] — só meia-cúpula superior
      const phi = (v * Math.PI) / 2.2;
      const R = 36 + Math.random() * 8;
      return {
        x: R * Math.sin(phi) * Math.cos(theta),
        y: 12 + R * Math.cos(phi) * 0.55,
        z: R * Math.sin(phi) * Math.sin(theta),
        size: 0.08 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.6,
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + Math.sin(t * d.speed + d.phase) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial
            color="#fff0c8"
            transparent
            opacity={0.7}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Estalactites gigantes — 5 cones invertidos descendo do teto ao fundo */
function GiantStalactites() {
  const stalacts = useMemo(() => {
    const out: { x: number; z: number; h: number; r: number }[] = [];
    const positions = [
      { x: -18, z: -22 },
      { x: -8, z: -26 },
      { x: 4, z: -28 },
      { x: 14, z: -24 },
      { x: 22, z: -20 },
    ];
    positions.forEach((p, i) => {
      out.push({
        x: p.x,
        z: p.z,
        h: 14 + (i % 2) * 4,
        r: 1.6 + (i % 3) * 0.4,
      });
    });
    return out;
  }, []);

  return (
    <group>
      {stalacts.map((s, i) => (
        <group key={`stalact-${i}`} position={[s.x, 22, s.z]}>
          {/* Cone invertido (ponta para baixo) */}
          <mesh castShadow position={[0, -s.h / 2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[s.r, s.h, 12]} />
            <meshStandardMaterial
              color="#5a3818"
              emissive="#2a1808"
              emissiveIntensity={0.2}
              roughness={0.85}
              metalness={0.1}
            />
          </mesh>
          {/* Brilho na ponta (cristal interno) */}
          <mesh position={[0, -s.h + 0.2, 0]}>
            <sphereGeometry args={[0.25, 10, 10]} />
            <meshBasicMaterial
              color="#ffd890"
              transparent
              opacity={0.85}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
