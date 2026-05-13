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
import { MestreAndino } from "../world/MestreAndino";
import { Portal } from "../world/Portal";

/* =========================================================
   ErksScene — A Cidade dos Mestres Andinos
   ---------------------------------------------------------
   Interior de uma cavidade andina vertical, em zigue-zague.
   3 níveis empilhados (8m de altura cada) conectados por
   4 "elevadores de luz" — colunas verticais luminosas,
   cada uma de cor distinta (âmbar, prata, violeta, dourado).
   Cada nível tem 4 "altares-vivência": esferas grandes
   giratórias com glifos low-poly dentro — cada uma é uma
   biblioteca-vivência diferente.
   Mestre Andino sentado no nível médio (y=8).
   Fog âmbar-poeira, skybox cinza-andino escuro.
   Ver docs/22-civilizacoes-expandidas.md §2.4
   ========================================================= */

const MESTRE_POS: [number, number, number] = [0, 8.4, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

/** Altura entre níveis. Três níveis: y = 0, 8, 16. */
const LEVEL_HEIGHT = 8;
const LEVEL_YS = [0, LEVEL_HEIGHT, LEVEL_HEIGHT * 2]; // 0, 8, 16

/** Elevadores de luz — 4 colunas, cada uma com cor própria. */
const ELEVADORES = [
  { angle: 0, color: "#ffc878", emissive: "#a86830" },      // âmbar
  { angle: Math.PI * 0.5, color: "#d8dceb", emissive: "#7888a8" }, // prata
  { angle: Math.PI, color: "#b078e0", emissive: "#683098" }, // violeta
  { angle: Math.PI * 1.5, color: "#ffe080", emissive: "#a88030" }, // dourado
];
/** Raio do círculo onde estão os elevadores. */
const ELEVADOR_R = 9.5;

/** Glifos low-poly: códigos visuais (octaedros) dentro de cada altar. */
const GLYPH_SHAPES = ["octa", "tetra", "icosa", "dodeca"] as const;
type GlyphShape = (typeof GLYPH_SHAPES)[number];

interface ErksSceneProps {
  mestreAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function ErksScene({
  mestreAwakened,
  onReturnToMar,
  onPlayerRef,
}: ErksSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const mestreTarget = useMemo(
    () => new THREE.Vector3(MESTRE_POS[0], 0, MESTRE_POS[2]),
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
      {/* Cinza-andino escuro de fundo */}
      <color attach="background" args={["#181410"]} />
      {/* Fog âmbar-poeira: a poeira-mineral dos Andes filtra a luz */}
      <fog attach="fog" args={["#3a2820", 14, 70]} />

      {/* Ambiente terroso quente — claroescuro andino */}
      <ambientLight color="#5a4838" intensity={0.5} />

      {/* Luz principal: "sol embutido" no topo da cavidade — entra por
          uma fresta imaginária no teto da montanha. */}
      <pointLight
        position={[0, 26, 0]}
        intensity={mestreAwakened ? 1.6 : 1.1}
        distance={42}
        color="#ffd090"
        decay={2}
      />

      {/* Direcional leve para sombras de chão (cada nível) */}
      <directionalLight
        position={[8, 22, 6]}
        intensity={0.28}
        color="#ffd0a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={70}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      {/* Paredes da cavidade — fundo amplo */}
      <CavernWalls />

      {/* Os três níveis — discos de pedra */}
      {LEVEL_YS.map((y, i) => (
        <LevelDisc key={`lvl-${i}`} y={y} levelIndex={i} />
      ))}

      {/* Altares-vivência: 4 por nível × 3 níveis = 12 ao todo */}
      {LEVEL_YS.map((y, levelIndex) => (
        <AltaresVivencia key={`alt-${levelIndex}`} y={y + 1.2} levelIndex={levelIndex} />
      ))}

      {/* 4 Elevadores de luz — atravessam os 3 níveis */}
      <ElevadoresDeLuz />

      {/* Mestre Andino — sentado no nível médio */}
      <MestreAndino
        position={MESTRE_POS}
        awakened={mestreAwakened}
        playerRef={playerRef}
      />

      {/* Player — começa no nível térreo */}
      <Player
        externalRef={playerRef}
        awakenTarget={mestreTarget}
        awakenDistance={3.4}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de retorno ao Mar de Cristal (nível térreo) */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            mestreAwakened
              ? "(os Andes lembram)"
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
        <Bloom intensity={1.0} luminanceThreshold={0.38} mipmapBlur />
        <Vignette eskil={false} darkness={0.8} offset={0.28} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

/** Paredes da cavidade — cilindro grande aberto envolvendo a cena
    (lado interno visível) — sugere uma "câmara dentro da montanha". */
function CavernWalls() {
  return (
    <group>
      {/* Parede cilíndrica externa */}
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[24, 28, 32, 24, 1, true]} />
        <meshStandardMaterial
          color="#3a281a"
          emissive="#1a0e08"
          emissiveIntensity={0.18}
          roughness={0.95}
          metalness={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      {/* "Teto" cônico fechando a cavidade */}
      <mesh position={[0, 30, 0]}>
        <coneGeometry args={[24, 8, 22]} />
        <meshStandardMaterial
          color="#2a1a10"
          emissive="#1a0e04"
          emissiveIntensity={0.18}
          roughness={0.95}
          metalness={0.05}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Chão exterior — segue para fora dos discos */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[28, 64]} />
        <meshStandardMaterial
          color="#241810"
          emissive="#150a04"
          emissiveIntensity={0.15}
          roughness={0.95}
        />
      </mesh>
    </group>
  );
}

/** Disco de pedra de um nível — chão circular emissivo sutil.
    Nível 0 é o "chão" maior; níveis 1 e 2 são plataformas com furo central
    (toroide) — sugere o zigue-zague vertical visualmente. */
function LevelDisc({ y, levelIndex }: { y: number; levelIndex: number }) {
  // Nível térreo: disco cheio. Níveis superiores: anel com furo (passagem)
  if (levelIndex === 0) {
    return (
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, y + 0.01, 0]}
      >
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial
          color="#4a3220"
          emissive="#2a1808"
          emissiveIntensity={0.2}
          roughness={0.88}
          metalness={0.1}
        />
      </mesh>
    );
  }
  // Níveis superiores: plataforma-anel (visualmente flutuante)
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, y + 0.01, 0]}
      >
        <ringGeometry args={[4.5, 13, 48]} />
        <meshStandardMaterial
          color="#5a3a26"
          emissive="#2a1808"
          emissiveIntensity={0.22}
          roughness={0.85}
          metalness={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Borda interna iluminada — aviso visual do "buraco" central */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, y + 0.04, 0]}
      >
        <ringGeometry args={[4.5, 4.85, 48]} />
        <meshStandardMaterial
          color="#d89868"
          emissive="#c87838"
          emissiveIntensity={0.55}
          roughness={0.45}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Espessura do disco (cilíndro fininho por baixo) — dá volume */}
      <mesh position={[0, y - 0.18, 0]}>
        <cylinderGeometry args={[13, 13.1, 0.36, 48, 1, true]} />
        <meshStandardMaterial
          color="#3a2818"
          emissive="#1a0e04"
          emissiveIntensity={0.18}
          roughness={0.95}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** 4 altares-vivência por nível — esferas grandes giratórias com glifo dentro */
function AltaresVivencia({
  y,
  levelIndex,
}: {
  y: number;
  levelIndex: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Posições dos 4 altares no nível (em quincunce, fora dos elevadores)
  // Os elevadores estão em ângulos 0, 90, 180, 270 — colocamos altares
  // em 45, 135, 225, 315 a um raio menor (5.6) para não conflitar.
  const altares = useMemo(() => {
    const out: {
      x: number;
      z: number;
      shape: GlyphShape;
      hue: string;
      emissive: string;
      seed: number;
    }[] = [];
    const COUNT = 4;
    const radius = 6.0;
    // Cada nível tem uma "família de cor" distinta (terroso-frio-quente)
    const palettes = [
      // nível 0: âmbar (a porta de entrada)
      [
        { hue: "#ffd098", emissive: "#a85a18" },
        { hue: "#f8b078", emissive: "#a04020" },
        { hue: "#ffe0a8", emissive: "#a07028" },
        { hue: "#f0a060", emissive: "#90381c" },
      ],
      // nível 1: violeta/prata (nível do Mestre)
      [
        { hue: "#c4b0ee", emissive: "#6038a8" },
        { hue: "#dce0f0", emissive: "#7080b0" },
        { hue: "#a880e8", emissive: "#5028a0" },
        { hue: "#e0d8f8", emissive: "#7868b0" },
      ],
      // nível 2: dourado claro (nível mais alto, mais sutil)
      [
        { hue: "#ffe890", emissive: "#a87830" },
        { hue: "#f0d878", emissive: "#a07028" },
        { hue: "#fff0b0", emissive: "#a88830" },
        { hue: "#f8e0a0", emissive: "#a08030" },
      ],
    ];
    const palette = palettes[levelIndex] ?? palettes[0];
    for (let i = 0; i < COUNT; i++) {
      const angle = ((i + 0.5) / COUNT) * Math.PI * 2;
      const p = palette[i];
      out.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        shape: GLYPH_SHAPES[(levelIndex + i) % GLYPH_SHAPES.length],
        hue: p.hue,
        emissive: p.emissive,
        seed: i * 0.7 + levelIndex * 1.4,
      });
    }
    return out;
  }, [levelIndex]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Cada altar gira lentamente. Velocidade varia por nível (efeito coral).
    groupRef.current.children.forEach((child, i) => {
      const a = altares[i];
      if (!a) return;
      const speed = 0.18 + (levelIndex * 0.06) + (i % 2) * 0.04;
      child.rotation.y = t * speed + a.seed;
      child.rotation.x = Math.sin(t * 0.3 + a.seed) * 0.08;
    });
  });

  return (
    <group ref={groupRef}>
      {altares.map((a, i) => (
        <group key={`alt-${levelIndex}-${i}`} position={[a.x, y, a.z]}>
          {/* Esfera translúcida externa — "casca" da vivência */}
          <mesh>
            <sphereGeometry args={[0.9, 20, 16]} />
            <meshStandardMaterial
              color={a.hue}
              emissive={a.emissive}
              emissiveIntensity={0.5}
              roughness={0.45}
              metalness={0.4}
              transparent
              opacity={0.42}
              depthWrite={false}
            />
          </mesh>
          {/* Glifo interno low-poly */}
          <mesh>
            {a.shape === "octa" && <octahedronGeometry args={[0.42, 0]} />}
            {a.shape === "tetra" && <tetrahedronGeometry args={[0.46, 0]} />}
            {a.shape === "icosa" && <icosahedronGeometry args={[0.42, 0]} />}
            {a.shape === "dodeca" && <dodecahedronGeometry args={[0.4, 0]} />}
            <meshStandardMaterial
              color={a.hue}
              emissive={a.emissive}
              emissiveIntensity={0.85}
              roughness={0.35}
              metalness={0.65}
              flatShading
            />
          </mesh>
          {/* Faísca-base — anel emissivo no chão sob o altar */}
          <mesh
            position={[0, -1.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.6, 0.95, 28]} />
            <meshBasicMaterial
              color={a.hue}
              transparent
              opacity={0.4}
              toneMapped={false}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Elevadores de luz — 4 colunas verticais luminosas que atravessam
    os 3 níveis. Cada uma de cor distinta (âmbar, prata, violeta, dourado).
    Não há lógica de elevador (visual apenas — diegese de transporte). */
function ElevadoresDeLuz() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      // Cada coluna pulsa fora-de-fase
      const phase = (i / 4) * Math.PI * 2;
      const inner = (child as THREE.Group).children.find(
        (c) => (c as THREE.Mesh).name === "elev-core",
      ) as THREE.Mesh | undefined;
      const aura = (child as THREE.Group).children.find(
        (c) => (c as THREE.Mesh).name === "elev-aura",
      ) as THREE.Mesh | undefined;
      if (inner) {
        const m = inner.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = 0.6 + Math.sin(t * 0.9 + phase) * 0.22;
      }
      if (aura) {
        const m = aura.material as THREE.MeshBasicMaterial;
        m.opacity = 0.2 + Math.sin(t * 0.7 + phase) * 0.12;
      }
    });
  });

  // Os elevadores cobrem da y=-0.5 até y= (3 * 8) = 24, ou seja 24.5m total
  const TOTAL_H = LEVEL_HEIGHT * 3; // 24
  const Y_CENTER = TOTAL_H / 2;

  return (
    <group ref={groupRef}>
      {ELEVADORES.map((e, i) => (
        <group
          key={`elev-${i}`}
          position={[
            Math.cos(e.angle) * ELEVADOR_R,
            Y_CENTER,
            Math.sin(e.angle) * ELEVADOR_R,
          ]}
        >
          {/* Núcleo da coluna — cilindro emissivo */}
          <mesh name="elev-core">
            <cylinderGeometry args={[0.28, 0.28, TOTAL_H, 14]} />
            <meshStandardMaterial
              color={e.color}
              emissive={e.emissive}
              emissiveIntensity={0.6}
              roughness={0.3}
              metalness={0.7}
              transparent
              opacity={0.92}
            />
          </mesh>
          {/* Aura externa — coluna translúcida em volta */}
          <mesh name="elev-aura">
            <cylinderGeometry args={[0.7, 0.7, TOTAL_H, 14, 1, true]} />
            <meshBasicMaterial
              color={e.color}
              transparent
              opacity={0.22}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Topo/base brilhante para "ancorar" a coluna nos níveis */}
          {[-TOTAL_H / 2, 0, TOTAL_H / 2].map((dy, j) => (
            <mesh key={`anchor-${j}`} position={[0, dy, 0]}>
              <sphereGeometry args={[0.32, 14, 10]} />
              <meshBasicMaterial color={e.color} toneMapped={false} />
            </mesh>
          ))}
          {/* Pequena luz pessoal — projeta cor no nível */}
          <pointLight
            position={[0, 0, 0]}
            intensity={0.6}
            distance={7}
            color={e.color}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}
