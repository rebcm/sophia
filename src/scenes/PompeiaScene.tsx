import { useEffect, useRef } from "react";
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
import { EstatuaPompeia } from "../world/EstatuaPompeia";

/* =========================================================
   PompeiaScene — Sprint 80 · A Cidade do Esquecimento Súbito
   ---------------------------------------------------------
   Pecado arquetípico: vivia sem perceber que vivia. A cidade
   foi soterrada por cinzas no exato instante de uma vida que
   passava sem ser notada. Aqui, o gesto que redime é o
   contrário do que congelou: PERMANECER. Olhar uma estátua
   por 3 segundos é dar-lhe, retroativamente, a presença que
   a vida não recebeu enquanto era vivida.

   Geografia: rua de pedras retangulares cinzas (chão
   fragmentado em quadrantes), 10 estátuas em duas fileiras
   de 5, casa baixa cinza ao fundo, skybox cinza-marrom com
   fog espesso cinza-poeira.

   Mecânica (orquestrada em App.tsx):
   - Cada estátua tem um contador 0..3000ms quando o jogador
     está a menos de ~2.2m. Ao completar, a estátua "vira a
     cabeça" (awakened=true).
   - Quando todas 10 contempladas: paleta da cena vira âmbar
     suave (allContemplated=true).

   Ver docs/22-civilizacoes-expandidas.md §4.10
   ========================================================= */

/** Layout fixo das 10 estátuas — duas fileiras de 5 ao longo da rua.
    O eixo Z é o comprimento da rua. As fileiras estão em x = ±2.6. */
export const STATUE_POS_POMPEIA: {
  pos: [number, number, number];
  rotY: number;
  variant: 0 | 1 | 2 | 3 | 4;
}[] = [
  // Fileira esquerda (x = -2.6), olhando para a rua (+x)
  { pos: [-2.6, 0, -5.5], rotY: Math.PI / 2, variant: 0 }, // comer
  { pos: [-2.6, 0, -2.5], rotY: Math.PI / 2, variant: 1 }, // conversar
  { pos: [-2.6, 0, 0.5], rotY: Math.PI / 2, variant: 2 }, // abraçar
  { pos: [-2.6, 0, 3.5], rotY: Math.PI / 2, variant: 3 }, // varrer
  { pos: [-2.6, 0, 6.5], rotY: Math.PI / 2, variant: 4 }, // sentar lendo
  // Fileira direita (x = +2.6), olhando para a rua (-x)
  { pos: [2.6, 0, -5.5], rotY: -Math.PI / 2, variant: 2 }, // abraçar
  { pos: [2.6, 0, -2.5], rotY: -Math.PI / 2, variant: 4 }, // sentar lendo
  { pos: [2.6, 0, 0.5], rotY: -Math.PI / 2, variant: 0 }, // comer
  { pos: [2.6, 0, 3.5], rotY: -Math.PI / 2, variant: 1 }, // conversar
  { pos: [2.6, 0, 6.5], rotY: -Math.PI / 2, variant: 3 }, // varrer
];

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface PompeiaSceneProps {
  /** Array de 10 booleanos — true quando a estátua foi contemplada. */
  contemplated: boolean[];
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function PompeiaScene({
  contemplated,
  onReturnToMar,
  onPlayerRef,
}: PompeiaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  const allContemplated =
    contemplated.length >= 10 &&
    contemplated.slice(0, 10).every((c) => c === true);

  // Paleta — cinza-poeira muda para âmbar suave quando todas contempladas
  const bgColor = allContemplated ? "#2a2418" : "#1c1a16";
  const fogColor = allContemplated ? "#3a3220" : "#2a2620";

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
      camera={{ fov: 60, near: 0.1, far: 280, position: [0, 5, 14] }}
    >
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, 12, 60]} />

      <ambientLight
        color={allContemplated ? "#c0a880" : "#8a8478"}
        intensity={0.55}
      />
      <directionalLight
        position={[6, 14, 8]}
        intensity={allContemplated ? 0.85 : 0.5}
        color={allContemplated ? "#ffd098" : "#9e958a"}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* Sol-poeira distante */}
      <pointLight
        position={[0, 18, -4]}
        intensity={allContemplated ? 1.1 : 0.6}
        distance={50}
        color={allContemplated ? "#ffc878" : "#8a7a5a"}
        decay={2}
      />

      <PompeiaFloor allContemplated={allContemplated} />
      <DustHaze />
      <BackgroundHouse allContemplated={allContemplated} />

      {/* 10 estátuas — cada uma com sua contemplação independente */}
      {STATUE_POS_POMPEIA.map((s, i) => (
        <EstatuaPompeia
          key={i}
          position={s.pos}
          rotY={s.rotY}
          variant={s.variant}
          awakened={contemplated[i] ?? false}
        />
      ))}

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            allContemplated
              ? "(tu estiveste viva o tempo todo)"
              : "(voltar)"
          }
          color="#c5b09a"
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
        <Bloom intensity={0.7} luminanceThreshold={0.45} mipmapBlur />
        <Vignette eskil={false} darkness={0.72} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Rua de pedras retangulares em quadrantes — chão fragmentado. */
function PompeiaFloor({ allContemplated }: { allContemplated: boolean }) {
  // Tiles em grade — 12 por lado, espaçamento 1.8
  const TILES_X = 8;
  const TILES_Z = 14;
  const tiles: { x: number; z: number; tone: number }[] = [];
  for (let i = 0; i < TILES_X; i++) {
    for (let j = 0; j < TILES_Z; j++) {
      // Pequena variação determinística de tom
      const seed = (i * 73 + j * 131) % 100;
      tiles.push({
        x: (i - (TILES_X - 1) / 2) * 1.8,
        z: (j - (TILES_Z - 1) / 2) * 1.8,
        tone: 0.55 + (seed % 40) / 200, // 0.55..0.75
      });
    }
  }

  const baseColor = (tone: number) => {
    const v = Math.round(tone * 255);
    if (allContemplated) {
      // Tom levemente quente
      return `rgb(${v + 18}, ${v + 8}, ${v - 8})`;
    }
    return `rgb(${v}, ${v - 4}, ${v - 12})`;
  };

  return (
    <group>
      {/* Chão geral por baixo, para preencher gaps */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.05, 0]}
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color={allContemplated ? "#3a3024" : "#221e18"}
          roughness={0.98}
          metalness={0.02}
        />
      </mesh>

      {/* Pedras retangulares com pequenas sombras entre elas */}
      {tiles.map((t, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[t.x, -0.02, t.z]}
          receiveShadow
        >
          <planeGeometry args={[1.62, 1.62]} />
          <meshStandardMaterial
            color={baseColor(t.tone)}
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Névoa baixa de poeira oscilando suavemente. */
function DustHaze() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.18 + Math.sin(t * 0.3) * 0.04;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.12, 0]}
    >
      <circleGeometry args={[26, 48]} />
      <meshBasicMaterial
        color="#8a8478"
        transparent
        opacity={0.18}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Casa baixa cinza ao fundo — silhueta de cidade antiga. */
function BackgroundHouse({ allContemplated }: { allContemplated: boolean }) {
  const wallColor = allContemplated ? "#4a4030" : "#2a2620";
  const wallEmissive = allContemplated ? "#2a1c08" : "#080604";
  const wallEmissiveIntensity = allContemplated ? 0.22 : 0.08;

  return (
    <group position={[0, 0, -14]}>
      {/* Bloco principal */}
      <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[10, 2.8, 3]} />
        <meshStandardMaterial
          color={wallColor}
          emissive={wallEmissive}
          emissiveIntensity={wallEmissiveIntensity}
          roughness={0.96}
          metalness={0.04}
        />
      </mesh>
      {/* Telhado plano levemente saliente */}
      <mesh castShadow position={[0, 2.95, 0]}>
        <boxGeometry args={[10.6, 0.3, 3.4]} />
        <meshStandardMaterial
          color={allContemplated ? "#3a3024" : "#1a1612"}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      {/* Anexo lateral menor */}
      <mesh castShadow receiveShadow position={[-6, 0.9, 0.5]}>
        <boxGeometry args={[3, 1.8, 2.4]} />
        <meshStandardMaterial
          color={wallColor}
          emissive={wallEmissive}
          emissiveIntensity={wallEmissiveIntensity}
          roughness={0.96}
          metalness={0.04}
        />
      </mesh>
      <mesh castShadow position={[-6, 1.85, 0.5]}>
        <boxGeometry args={[3.3, 0.2, 2.7]} />
        <meshStandardMaterial
          color={allContemplated ? "#3a3024" : "#1a1612"}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      {/* Vão de porta vazio (caixa preta) — sugere interior soterrado */}
      <mesh position={[0, 0.9, 1.52]}>
        <boxGeometry args={[1.2, 1.7, 0.05]} />
        <meshBasicMaterial color="#080604" />
      </mesh>
    </group>
  );
}
