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
import { Portal } from "../world/Portal";
import { Principado, type PrincipadoId } from "../world/Principado";

/* =========================================================
   GaleriaPrincipadosScene — Sprint 27 (lean MVP)
   ---------------------------------------------------------
   Galeria longa e fria onde 12 Principados — leis vivas
   arquetípicas — guardam o caminho. Não são bosses: são
   funções reificadas. A "arma" do jogador é contemplá-los
   (segurar F por ~4s) até a aura ceder e o nome ser dito.
   Cada Principado carrega uma questão sem resposta fácil;
   o overlay (gerenciado fora) mostra a questão e a barra de
   contemplação. Ver docs/03b §5–§6 e docs/03f §Luta 3.
   ========================================================= */

export const PRINCIPADOS_ORDER: PrincipadoId[] = [
  "sentinela-espelho",
  "capataz-cinto",
  "vigia-vela",
  "censor-boca",
  "coletor-imposto",
  "porta-trancada",
  "lei-viva",
  "estatua-vigia",
  "boca-grande",
  "boneca-corda",
  "saco-vazio",
  "mascara-cega",
];

export const PRINCIPADO_QUESTOES: Record<PrincipadoId, string> = {
  "sentinela-espelho":
    "O que tu vês quando eu te mostro o que devias ser?",
  "capataz-cinto":
    "Quantas portas tu fechaste atrás de ti sem perceber que eras tu fechando?",
  "vigia-vela":
    "Se eu apagar este olho de fogo, que parte de ti deixa de se esconder?",
  "censor-boca":
    "Que palavra tua eu calei sem que tu percebesses?",
  "coletor-imposto":
    "Quanto vale tua centelha em moeda — e quem te ensinou a pagar?",
  "porta-trancada":
    "Tu queres entrar, ou queres apenas continuar batendo?",
  "lei-viva":
    "Que regra tu obedeces porque ela é certa — e qual obedeces porque é antiga?",
  "estatua-vigia":
    "Há quanto tempo tu não te moves diante de mim, esperando que eu pisque primeiro?",
  "boca-grande":
    "Tu falas tanto. Tu já te ouviste falar?",
  "boneca-corda":
    "Quem puxa o fio de cima, se tu mesmo não estás puxando?",
  "saco-vazio":
    "Tu carregas o que não há. Quem te disse que precisavas carregar?",
  "mascara-cega":
    "Se eu cair, tu reconheces o rosto que estava por baixo?",
};

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 22];

/* Layout em zigue-zague ao longo de um corredor longo (eixo Z),
   alternando lados a cada Principado. */
export const PRINCIPADO_POSITIONS: Record<PrincipadoId, [number, number, number]> =
  PRINCIPADOS_ORDER.reduce(
    (acc, id, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -18 + i * 3.4;
      const x = side * 4.2;
      acc[id] = [x, 0, z];
      return acc;
    },
    {} as Record<PrincipadoId, [number, number, number]>,
  );

interface GaleriaPrincipadosSceneProps {
  contemplated: Record<PrincipadoId, boolean>;
  contemplationTarget: PrincipadoId | null;
  contemplationProgress: number;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function GaleriaPrincipadosScene({
  contemplated,
  contemplationTarget,
  contemplationProgress,
  onReturnToMar,
  onPlayerRef,
}: GaleriaPrincipadosSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const allContemplated = useMemo(
    () => PRINCIPADOS_ORDER.every((id) => contemplated[id]),
    [contemplated],
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
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 5, 16] }}
    >
      <color attach="background" args={["#0a0814"]} />
      <fog attach="fog" args={["#180e22", 14, 70]} />

      <ambientLight color="#4a4060" intensity={0.45} />
      <directionalLight
        position={[6, 12, 8]}
        intensity={allContemplated ? 0.9 : 0.45}
        color={allContemplated ? "#d8c8e8" : "#8878a8"}
      />

      <GalleryFloor />
      <GalleryWalls />
      <GalleryCeilingLamps />

      {PRINCIPADOS_ORDER.map((id) => {
        const isTarget = contemplationTarget === id;
        return (
          <Principado
            key={id}
            id={id}
            position={PRINCIPADO_POSITIONS[id]}
            contemplated={contemplated[id]}
            contemplationProgress={isTarget ? contemplationProgress : 0}
          />
        );
      })}

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={allContemplated ? "(as leis cederam)" : "(voltar)"}
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
        <Bloom intensity={0.75} luminanceThreshold={0.5} mipmapBlur />
        <Vignette eskil={false} darkness={0.78} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function GalleryFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 2]}
    >
      <planeGeometry args={[14, 60]} />
      <meshStandardMaterial
        color="#15101e"
        emissive="#241838"
        emissiveIntensity={0.14}
        roughness={0.55}
        metalness={0.3}
      />
    </mesh>
  );
}

function GalleryWalls() {
  return (
    <group>
      <mesh position={[-7, 4, 2]}>
        <boxGeometry args={[0.3, 8, 60]} />
        <meshStandardMaterial
          color="#160c20"
          emissive="#2c1a40"
          emissiveIntensity={0.16}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[7, 4, 2]}>
        <boxGeometry args={[0.3, 8, 60]} />
        <meshStandardMaterial
          color="#160c20"
          emissive="#2c1a40"
          emissiveIntensity={0.16}
          roughness={0.75}
        />
      </mesh>
    </group>
  );
}

/* Pequenas lâmpadas frias ao longo do teto — pulsam de leve. */
function GalleryCeilingLamps() {
  const groupRef = useRef<THREE.Group | null>(null);
  const lamps = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const z = -18 + i * 3.4;
        const side = i % 2 === 0 ? 1 : -1;
        return { z, side };
      }),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const m = mesh.material as THREE.MeshBasicMaterial;
      if (m) {
        const phase = i * 0.4;
        m.opacity = 0.45 + Math.sin(t * 0.6 + phase) * 0.18;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 7.6, 0]}>
      {lamps.map(({ z, side }, i) => (
        <mesh key={i} position={[side * 3, 0, z]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshBasicMaterial
            color="#a890d8"
            transparent
            opacity={0.55}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
