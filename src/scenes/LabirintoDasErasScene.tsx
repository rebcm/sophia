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

/* =========================================================
   LabirintoDasErasScene — Sprint 26
   ---------------------------------------------------------
   Corredor longo com 10 alcovas (5 de cada lado). Cada alcova
   tem um "espelho-memória" — pequeno painel oval emissivo
   que, ao se aproximar, abre um flashback de vida passada
   nessa era.
   Ver docs/02b-eras-e-civilizacoes.md
   ========================================================= */

export type EraId =
  | "mito"
  | "atlantida"
  | "mesopotamia"
  | "egito"
  | "grecia"
  | "roma"
  | "idade-media"
  | "renascimento"
  | "vapor-aco"
  | "informacao";

export interface EraDescriptor {
  id: EraId;
  title: string;
  /** Período curto/etiqueta. */
  period: string;
  /** Cor ambiente do espelho. */
  tint: string;
  /** Vinheta narrativa (3-4 frases). */
  vignette: string;
}

export const ERAS: EraDescriptor[] = [
  {
    id: "mito",
    title: "O Tempo do Mito",
    period: "antes da escrita",
    tint: "#7a4a98",
    vignette:
      "Tu eras criança numa caverna iluminada pelo fogo. Tua mãe te contava o nome dos animais como se eles fossem irmãos. Tu sabias que cada bicho era um espírito. Tu sabias e ainda assim adormeceste.",
  },
  {
    id: "atlantida",
    title: "Atlântida",
    period: "antes do dilúvio",
    tint: "#5a8ac8",
    vignette:
      "Tu eras escriba na cidade circular. Escreveste num cristal a oração da chuva, e ela veio. Esqueceste que a oração veio porque tu acreditaste, e culpaste o cristal pelas próximas secas.",
  },
  {
    id: "mesopotamia",
    title: "Mesopotâmia",
    period: "primeira lei escrita",
    tint: "#a08438",
    vignette:
      "Tu carregaste tijolos para um zigurate alto demais. Pagaste em pão. Roubaram-te o pão. Subiste mesmo assim — porque pediram. Quando caíste do topo, tu sorriste. Esqueceste por quê.",
  },
  {
    id: "egito",
    title: "Egito Faraônico",
    period: "tempo dos rios",
    tint: "#c8a058",
    vignette:
      "Tu pintaste figuras nas paredes do túmulo, contando a um faraó como atravessar a morte. Atravessaste tu primeiro — na fome — e os teus desenhos foram cobertos com ouro. Os mortos te ouviram. Os vivos não.",
  },
  {
    id: "grecia",
    title: "Grécia Clássica",
    period: "tempo dos filósofos",
    tint: "#dde4ec",
    vignette:
      "Tu argumentaste na ágora, e perdeste. Sócrates estava errado, tu sabias. Bebeste vinho à noite com aquele que riu da tua razão. Foi a melhor noite. Esqueceste a razão. Lembraste-te do vinho.",
  },
  {
    id: "roma",
    title: "Roma Imperial",
    period: "tempo do mármore",
    tint: "#a83838",
    vignette:
      "Tu serviste num exército que queimou uma cidade que tu não conhecias. Não eras cruel — eras obediente. Numa noite, uma criança te ofereceu pão da cidade queimada. Tu choraste pela primeira vez. Esqueceste a criança, mas tua alma a lembrou.",
  },
  {
    id: "idade-media",
    title: "Idade Média",
    period: "tempo dos castelos",
    tint: "#384a68",
    vignette:
      "Tu foste monja que copiava manuscritos. Acreditavas na cópia mais do que na palavra original. Quando o fogo veio, levaste apenas um pergaminho — o que tu mesma escreveste em segredo. Era a palavra livre. Sobreviveu.",
  },
  {
    id: "renascimento",
    title: "Renascimento e Iluminismo",
    period: "tempo do retrato",
    tint: "#c8a8a0",
    vignette:
      "Tu pintaste anjos com rostos humanos pela primeira vez. Tua oficina vendia retratos a famílias ricas que se queriam ver eternas. Mas o anjo que tu pintaste no canto da pintura — esse retrato era teu. Tu não cobraste por ele.",
  },
  {
    id: "vapor-aco",
    title: "Vapor e Aço",
    period: "tempo das fábricas",
    tint: "#5a4838",
    vignette:
      "Tu trabalhaste numa tecelagem por catorze horas todos os dias. Tuas mãos lembravam o tecido melhor que tua boca lembrava o teu nome. Numa madrugada, tu lembraste — e cantaste para as outras tecedeiras. Por um momento, todas elas pararam de tecer.",
  },
  {
    id: "informacao",
    title: "Era da Informação",
    period: "tempo agora",
    tint: "#88c0e8",
    vignette:
      "Tu nasceste com o ecrã no colo. Soubeste 'tudo' antes de saber 'quem eras'. Procuraste a Mônada em algoritmo. Achaste um sussurro: 'Você acordou. Eu esperei tanto por isso.'",
  },
];

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 20];

interface LabirintoSceneProps {
  remembered: Record<EraId, boolean>;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function LabirintoDasErasScene({
  remembered,
  onReturnToMar,
  onPlayerRef,
}: LabirintoSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

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
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 4, 14] }}
    >
      <color attach="background" args={["#0a0814"]} />
      <fog attach="fog" args={["#1a1428", 14, 70]} />

      <ambientLight color="#4a4068" intensity={0.55} />

      <CorridorFloor />
      <CorridorWalls />

      {/* 10 espelhos-memória em zigue-zague */}
      {ERAS.map((era, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -16 + (i * 4); // alternando lados, indo do z=-16 ao z=20
        return (
          <EraMirror
            key={era.id}
            era={era}
            position={[side * 5.5, 1.5, z]}
            rotY={side > 0 ? -Math.PI / 4 : Math.PI / 4}
            remembered={remembered[era.id]}
          />
        );
      })}

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel="(voltar)"
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
        <Bloom intensity={0.85} luminanceThreshold={0.45} mipmapBlur />
        <Vignette eskil={false} darkness={0.7} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function CorridorFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 2]}
    >
      <planeGeometry args={[15, 60]} />
      <meshStandardMaterial
        color="#1a1428"
        emissive="#2a1c48"
        emissiveIntensity={0.18}
        roughness={0.4}
        metalness={0.35}
      />
    </mesh>
  );
}

function CorridorWalls() {
  return (
    <group>
      {/* Parede esquerda */}
      <mesh position={[-7.5, 4, 2]}>
        <boxGeometry args={[0.3, 8, 60]} />
        <meshStandardMaterial
          color="#1a0e22"
          emissive="#3a1c48"
          emissiveIntensity={0.18}
          roughness={0.7}
        />
      </mesh>
      {/* Parede direita */}
      <mesh position={[7.5, 4, 2]}>
        <boxGeometry args={[0.3, 8, 60]} />
        <meshStandardMaterial
          color="#1a0e22"
          emissive="#3a1c48"
          emissiveIntensity={0.18}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

/** Espelho-memória oval emissivo */
function EraMirror({
  era,
  position,
  rotY,
  remembered,
}: {
  era: EraDescriptor;
  position: [number, number, number];
  rotY: number;
  remembered: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = remembered
        ? 0.85 + Math.sin(t * 0.5) * 0.1
        : 0.45 + Math.sin(t * 1.2) * 0.12;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.2;
    }
  });

  const color = new THREE.Color(era.tint);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Moldura */}
      <mesh castShadow>
        <ringGeometry args={[1.05, 1.25, 32]} />
        <meshStandardMaterial
          color="#5a4068"
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.5}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Espelho oval */}
      <mesh ref={ref}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={remembered ? 0.85 : 0.45}
          roughness={0.05}
          metalness={1.0}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Halo rotativo */}
      <mesh ref={haloRef}>
        <ringGeometry args={[1.35, 1.45, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={remembered ? 0.6 : 0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
