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
import { Cinza, type CinzaGestureType } from "../world/Cinza";
import { Portal } from "../world/Portal";
import type { KeyChoice } from "../ui/VozesEscolha";

/* =========================================================
   CinzasScene — Sala dos Que Não Tiveram Alma
   ---------------------------------------------------------
   Sala metálica retangular, fria, sem janelas, sem vida
   natural. Luz fluorescente fria do teto. 5 Cinzas em
   fileira no fundo da sala fazendo gestos repetitivos
   sem propósito. O Cinza central (índice 2) é o "que pode
   ser redimido" — proximidade + F dispara a escolha-chave.
   Ver docs/22-civilizacoes-expandidas.md §3.5
   Família 10-99: sinistro mas NÃO assustador.
   ========================================================= */

const ROOM_WIDTH = 14;
const ROOM_DEPTH = 18;
const ROOM_HEIGHT = 4.4;

const CINZA_LINE_Z = -5.5;
const CINZA_SPACING = 1.7;
const CINZA_CENTRAL_INDEX = 2;

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 7.5];

/** Padrão de gestos dos 5 Cinzas (índice 2 = central, gesto "sem-gesto-em-pé"
 *  até ser despertado). */
const GESTURES: CinzaGestureType[] = [0, 2, 4, 1, 3];

interface CinzasSceneProps {
  centralAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function CinzasScene({
  centralAwakened,
  onReturnToMar,
  onPlayerRef,
}: CinzasSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  // Posições dos 5 Cinzas em fileira reta
  const cinzas = useMemo(() => {
    const out: { pos: [number, number, number]; gesture: CinzaGestureType }[] =
      [];
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * CINZA_SPACING;
      out.push({ pos: [x, 0, CINZA_LINE_Z], gesture: GESTURES[i] });
    }
    return out;
  }, []);

  const cinzaCentralTarget = useMemo(
    () =>
      new THREE.Vector3(
        cinzas[CINZA_CENTRAL_INDEX].pos[0],
        0,
        cinzas[CINZA_CENTRAL_INDEX].pos[2],
      ),
    [cinzas],
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
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 3.6, 9] }}
    >
      {/* Fundo metálico cinza-azulado (visível através de qualquer abertura) */}
      <color attach="background" args={["#1a1e26"]} />
      <fog attach="fog" args={["#1c2028", 12, 38]} />

      {/* Ambiente frio */}
      <ambientLight color="#aab4c4" intensity={0.55} />

      {/* "Fluorescente" frio do teto — 3 luzes em fileira */}
      {[-4, 0, 4].map((x, i) => (
        <pointLight
          key={`fluor-${i}`}
          position={[x, ROOM_HEIGHT - 0.3, -2]}
          intensity={1.05}
          distance={14}
          color="#cad8e8"
          decay={2}
        />
      ))}
      {/* Luz fria adicional sobre o central — destaca quando despertado */}
      <pointLight
        position={[0, 3.6, CINZA_LINE_Z + 0.5]}
        intensity={centralAwakened ? 1.2 : 0.5}
        distance={8}
        color={centralAwakened ? "#f4e0a8" : "#bcc8d8"}
        decay={2}
      />

      <Room />
      <FluorescentTubes />

      {/* 5 Cinzas em fileira */}
      {cinzas.map((c, i) => (
        <Cinza
          key={`cinza-${i}`}
          position={c.pos}
          gestureType={c.gesture}
          awakened={i === CINZA_CENTRAL_INDEX && centralAwakened}
        />
      ))}

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={cinzaCentralTarget}
        awakenDistance={3.2}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de retorno ao Mar de Cristal */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            centralAwakened
              ? "(nem todos foram cruéis)"
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
        <Bloom intensity={0.85} luminanceThreshold={0.55} mipmapBlur />
        <Vignette eskil={false} darkness={0.78} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* =========================================================
   Escolha-chave dos Cinzas — exportada para uso no
   orquestrador (App.tsx). 4 vozes + 3 opções (luz/sombra/equilíbrio).
   ========================================================= */
export const CINZA_CHOICE: KeyChoice = {
  id: "cinza-doacao",
  context:
    "O Cinza central te encara. Os olhos pretos não pedem — mas há algo neles que parece quase pedir. Ele tem inteligência, mas não tem alma. O Demiurgo o fez e o esqueceu.",
  voices: {
    angel:
      "doa-lhe uma centelha. Tu tens muitas; ele não tem nenhuma. Custará a ti, mas custar é o nome do amor.",
    demon:
      "não. Ele não é vivo. Foi fabricado. Tu não deves às criaturas do Demiurgo o que a Mônada te deu.",
    jinn:
      "se queres, pode ser pacto: dás-lhe uma centelha, e ele te servirá em outra vida. Tudo se equilibra.",
    sophia:
      "fica perto dele. Mesmo sem dar nada. Ouvir o silêncio de quem foi esquecido já é refazer parte do mundo.",
  },
  options: [
    {
      label: "Doar a centelha (custo: -1 luz permanente)",
      alignment: "light",
      amount: 8,
      immediateEffect:
        "Uma luz tua passa para o peito dele. Os gestos param. O olhar acende-se. Pela primeira vez em milhões de anos, um Cinza vê. E reconhece. E chora — sem boca, sem som, mas chora.",
    },
    {
      label: "Negar — eles não são vivos",
      alignment: "shadow",
      amount: 6,
      immediateEffect:
        "Tu te afastas. O Cinza permanece fazendo o gesto que sempre fez. Talvez tu estivesses certo. Talvez não houvesse nada lá. Ou talvez houvesse — e tu não quiseste descobrir.",
    },
    {
      label: "Oferecer presença, sem centelha",
      alignment: "balance",
      amount: 7,
      immediateEffect:
        "Tu te sentas perto. Em silêncio. Não acendes nada — apenas ficas. Algo no Cinza se aquieta um instante. Não acordou. Mas soube, por um momento, que existiu para alguém.",
    },
  ],
};

/* ---------------- Componentes de Mundo ---------------- */

/** Sala retangular metálica fria — chão, paredes, teto */
function Room() {
  return (
    <group>
      {/* Chão */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial
          color="#5a6068"
          emissive="#1a1c22"
          emissiveIntensity={0.12}
          roughness={0.35}
          metalness={0.78}
        />
      </mesh>
      {/* Teto */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, ROOM_HEIGHT, 0]}
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial
          color="#3a4048"
          emissive="#0a0c10"
          emissiveIntensity={0.1}
          roughness={0.5}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Parede do fundo (atrás dos Cinzas) */}
      <mesh
        position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial
          color="#48505a"
          emissive="#0e1014"
          emissiveIntensity={0.1}
          roughness={0.4}
          metalness={0.72}
        />
      </mesh>
      {/* Parede da frente (atrás do jogador) */}
      <mesh
        rotation={[0, Math.PI, 0]}
        position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial
          color="#3e454e"
          emissive="#0a0c10"
          emissiveIntensity={0.1}
          roughness={0.5}
          metalness={0.68}
        />
      </mesh>
      {/* Parede esquerda */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial
          color="#444a52"
          emissive="#0e1014"
          emissiveIntensity={0.1}
          roughness={0.45}
          metalness={0.7}
        />
      </mesh>
      {/* Parede direita */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial
          color="#444a52"
          emissive="#0e1014"
          emissiveIntensity={0.1}
          roughness={0.45}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

/** Tubos fluorescentes no teto — 3 barras emissivas, leve cintilação */
function FluorescentTubes() {
  const tubesRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!tubesRef.current) return;
    const t = state.clock.elapsedTime;
    tubesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const m = mesh.material as THREE.MeshStandardMaterial;
      // Pequena cintilação de fluorescente — quase constante, com falhas raras
      const flicker = Math.sin(t * 12 + i * 3.7);
      m.emissiveIntensity =
        1.05 + flicker * 0.04 + (Math.sin(t * 0.7 + i) > 0.96 ? -0.4 : 0);
    });
  });
  return (
    <group ref={tubesRef}>
      {[-4, 0, 4].map((x, i) => (
        <mesh
          key={`tube-${i}`}
          position={[x, ROOM_HEIGHT - 0.18, -1]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.12, 0.12, 4.5, 10]} />
          <meshStandardMaterial
            color="#e8eef6"
            emissive="#bcd0e8"
            emissiveIntensity={1.05}
            roughness={0.3}
            metalness={0.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
