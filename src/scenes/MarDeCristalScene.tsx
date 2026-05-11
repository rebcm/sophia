import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Stars } from "../world/PleromaSky";
import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { Portal } from "../world/Portal";
import { PedraDasVidas } from "../world/PedraDasVidas";
import { useSoulStore } from "../state/soulStore";

/* =========================================================
   MarDeCristalScene — Hub central entre dimensões
   ---------------------------------------------------------
   Plataforma circular branco-pérola flutuando sobre um
   "mar" reflexivo. Portais visíveis ao redor.

   No Sprint 2, apenas:
     - Jardim dos Ecos (de volta)
     - Ratanabá (próxima — placeholder, não jogável ainda)

   Sprints futuros adicionam os outros 7+ portais.
   ========================================================= */

export type MarDestino =
  | "jardim-dos-ecos"
  | "ratanaba"
  | "casa-espelhada"
  | "el-dorado";

interface MarDeCristalSceneProps {
  /** Chamado quando o jogador "entra" num portal (proximidade + ação). */
  onPortalEnter: (destino: MarDestino) => void;
  /** Chamado quando o jogador ativa a Pedra das Vidas. */
  onPedraActivate?: () => void;
}

export function MarDeCristalScene({
  onPortalEnter,
  onPedraActivate,
}: MarDeCristalSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const [nearPortal, setNearPortal] = useState<MarDestino | null>(null);

  // Ratanabá fica disponível após despertar o Velho do Jardim
  const ratanabaEnabled = useSoulStore((s) => s.hasAwakened("velho-do-jardim"));
  // Casa-Espelhada fica disponível após despertar Athoth (Mãe-D'Água)
  const casaEspelhadaEnabled = useSoulStore((s) =>
    s.hasAwakened("athoth-mae-dagua"),
  );
  const autoSabotadorDefeated = useSoulStore((s) =>
    s.hasAwakened("auto-sabotador"),
  );
  // El Dorado fica disponível após despertar Athoth (Mãe-D'Água mostra
  // o caminho na caverna de mapas estelares).
  const elDoradoEnabled = casaEspelhadaEnabled;
  const yobelDefeated = useSoulStore((s) =>
    s.hasAwakened("yobel-inca-solitario"),
  );

  // Tecla Espaço/Enter para entrar no portal próximo
  useKeyToEnter(nearPortal, onPortalEnter);

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
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 4, 14] }}
    >
      <color attach="background" args={["#0c1622"]} />
      <fog attach="fog" args={["#1a2438", 20, 90]} />

      {/* Iluminação ambiente fria e suave */}
      <ambientLight color="#7a8aa8" intensity={0.5} />
      <directionalLight
        position={[8, 18, 6]}
        intensity={0.5}
        color="#c5d7e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
      />
      {/* Luz quente do centro */}
      <pointLight
        position={[0, 5, 0]}
        intensity={1.2}
        distance={30}
        color="#ffe9d0"
        decay={2}
      />

      {/* Estrelas no céu */}
      <Stars />

      {/* Mar de Cristal (chão reflexivo) */}
      <CrystalSea />

      {/* Plataforma central */}
      <CentralPlatform />

      {/* Player */}
      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {/* Portais — apenas 2 ativos no Sprint 2 */}
      <Portal
        position={[12, 0.4, -6]}
        label="Jardim dos Ecos"
        subLabel="(já visitado)"
        color="#e0b6ff"
        playerRef={playerRef}
        onProximityChange={(near) =>
          setNearPortal(near ? "jardim-dos-ecos" : null)
        }
      />

      <Portal
        position={[-12, 0.4, -6]}
        label="Ratanabá"
        subLabel={ratanabaEnabled ? "(a floresta espera)" : "(despertar primeiro)"}
        color="#87E1FF"
        playerRef={playerRef}
        onProximityChange={(near) =>
          setNearPortal(near && ratanabaEnabled ? "ratanaba" : null)
        }
        enabled={ratanabaEnabled}
      />

      {/* Casa-Espelhada — torre secreta da Feira dos Sistemas */}
      {casaEspelhadaEnabled && (
        <Portal
          position={[0, 0.4, -14]}
          label="Casa-Espelhada"
          subLabel={
            autoSabotadorDefeated
              ? "(o espelho está quebrado)"
              : "(uma sombra te chama)"
          }
          color="#a878d8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "casa-espelhada" : null)
          }
        />
      )}

      {/* El Dorado — 2ª Civilização Perdida */}
      {elDoradoEnabled && (
        <Portal
          position={[14, 0.4, 2]}
          label="El Dorado"
          subLabel={
            yobelDefeated ? "(o sol respira)" : "(o ouro espera ser luz)"
          }
          color="#ffd45a"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "el-dorado" : null)
          }
        />
      )}

      {/* Pedra das Vidas — morte voluntária (acessível após primeira reencarnação desbloqueada via gameplay) */}
      {onPedraActivate && (
        <PedraDasVidas
          position={[0, 0.35, 4]}
          playerRef={playerRef}
          onActivate={onPedraActivate}
        />
      )}

      {/* Portais futuros (silhuetas distantes para sugerir o resto do hub) */}
      <DormantPortal position={[10, 0.4, 8]} />
      <DormantPortal position={[-10, 0.4, 8]} />
      {!casaEspelhadaEnabled && <DormantPortal position={[0, 0.4, -14]} />}
      {!elDoradoEnabled && <DormantPortal position={[14, 0.4, 2]} />}
      <DormantPortal position={[-14, 0.4, 2]} />

      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.7} mipmapBlur />
        <Vignette eskil={false} darkness={0.45} offset={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function CrystalSea() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
      <planeGeometry args={[200, 200, 1, 1]} />
      <meshStandardMaterial
        color="#1c2a3c"
        emissive="#3a4a6a"
        emissiveIntensity={0.18}
        roughness={0.0}
        metalness={0.9}
      />
    </mesh>
  );
}

function CentralPlatform() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    const t = state.clock.elapsedTime;
    m.emissiveIntensity = 0.25 + Math.sin(t * 0.6) * 0.05;
  });
  return (
    <group>
      {/* Plataforma central de "água sólida" */}
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial
          color="#f5f2eb"
          emissive="#ffd45a"
          emissiveIntensity={0.25}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      {/* Anel exterior dourado */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[6, 6.3, 64]} />
        <meshBasicMaterial color="#ffd45a" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/** Portal-fantasma para sugerir os outros destinos do hub
 *  sem realmente serem clicáveis ainda. */
function DormantPortal({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.06, 12, 48]} />
        <meshBasicMaterial color="#3a4858" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/* ---------------- Hook de entrada por tecla ---------------- */

import { useEffect } from "react";

function useKeyToEnter(
  near: MarDestino | null,
  onPortalEnter: (d: MarDestino) => void,
) {
  useEffect(() => {
    if (!near) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter" || e.code === "KeyF") {
        onPortalEnter(near);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [near, onPortalEnter]);
}
