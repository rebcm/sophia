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
  | "el-dorado"
  | "hiperborea"
  | "atlantida"
  | "lemuria"
  | "mu"
  | "pre-adamita"
  | "trono-demiurgo"
  | "tabernaculo-dos-caidos"
  | "feira-dos-sistemas"
  | "labirinto-das-eras"
  | "galeria-dos-principados"
  | "agartha"
  | "sodoma"
  | "shamballa"
  | "telos"
  | "gomorra"
  | "babel"
  | "pleiadianos"
  | "arcturianos"
  | "erks"
  | "siriacos"
  | "adama"
  | "tzeboim"
  | "bela"
  | "ninive";

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
  // Hiperbórea destrava quando El Dorado é desbloqueada (caminho aberto)
  const hiperboreaEnabled = elDoradoEnabled;
  const adonaiosDefeated = useSoulStore((s) =>
    s.hasAwakened("adonaios-guardiao-solar"),
  );

  // Atlântida/Lemúria/Mu/Pré-Adamita destravam após Hiperbórea
  // (mapa estelar mostra todos os caminhos restantes).
  const deepCivsEnabled = hiperboreaEnabled;
  const eloaiosDefeated = useSoulStore((s) =>
    s.hasAwakened("eloaios-lei-cristalina"),
  );
  const galilaDefeated = useSoulStore((s) =>
    s.hasAwakened("galila-beleza-viva"),
  );
  const harmasDefeated = useSoulStore((s) =>
    s.hasAwakened("harmas-palavra-raiz"),
  );
  const iaothDefeated = useSoulStore((s) =>
    s.hasAwakened("iaoth-memoria-pleroma"),
  );

  // Portal do Trono do Demiurgo: destrava após os 7 Arcontes
  // (clímax do jogo).
  const tronoEnabled =
    useSoulStore((s) => s.hasAwakened("athoth-mae-dagua")) &&
    useSoulStore((s) => s.hasAwakened("yobel-inca-solitario")) &&
    useSoulStore((s) => s.hasAwakened("adonaios-guardiao-solar")) &&
    useSoulStore((s) => s.hasAwakened("eloaios-lei-cristalina")) &&
    useSoulStore((s) => s.hasAwakened("galila-beleza-viva")) &&
    useSoulStore((s) => s.hasAwakened("harmas-palavra-raiz")) &&
    useSoulStore((s) => s.hasAwakened("iaoth-memoria-pleroma"));

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

      {/* Hiperbórea — 3ª Civilização Perdida */}
      {hiperboreaEnabled && (
        <Portal
          position={[-14, 0.4, 2]}
          label="Hiperbórea"
          subLabel={
            adonaiosDefeated
              ? "(a coragem foi solta)"
              : "(a tundra eterna te chama)"
          }
          color="#dde2ea"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "hiperborea" : null)
          }
        />
      )}

      {/* Atlântida — 4ª Civilização Perdida */}
      {deepCivsEnabled && (
        <Portal
          position={[10, 0.4, 8]}
          label="Atlântida"
          subLabel={
            eloaiosDefeated ? "(a lei tornou-se viva)" : "(a ilha afunda)"
          }
          color="#88c0e8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "atlantida" : null)
          }
        />
      )}

      {/* Lemúria — 5ª Civilização Perdida */}
      {deepCivsEnabled && (
        <Portal
          position={[-10, 0.4, 8]}
          label="Lemúria"
          subLabel={
            galilaDefeated ? "(o canto retornou)" : "(o lótus espera)"
          }
          color="#ffb0c8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "lemuria" : null)
          }
        />
      )}

      {/* Mu — 6ª Civilização Perdida */}
      {deepCivsEnabled && (
        <Portal
          position={[8, 0.4, -10]}
          label="Mu"
          subLabel={
            harmasDefeated
              ? "(a palavra voltou)"
              : "(as plataformas flutuam)"
          }
          color="#d8a0ff"
          playerRef={playerRef}
          onProximityChange={(near) => setNearPortal(near ? "mu" : null)}
        />
      )}

      {/* Pré-Adamita — 7ª e mais profunda Civilização Perdida */}
      {deepCivsEnabled && (
        <Portal
          position={[-8, 0.4, -10]}
          label="Pré-Adamita"
          subLabel={
            iaothDefeated
              ? "(tu eras antes do tempo)"
              : "(a memória dorme)"
          }
          color="#a878d8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "pre-adamita" : null)
          }
        />
      )}

      {/* Trono do Demiurgo — clímax do jogo (após os 7 Arcontes) */}
      {tronoEnabled && (
        <Portal
          position={[0, 0.4, 14]}
          label="Trono do Demiurgo"
          subLabel="(há um filho cego que precisa ser abraçado)"
          color="#a878d8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "trono-demiurgo" : null)
          }
        />
      )}

      {/* Tabernáculo dos Caídos — opcional, destrava com Hiperbórea */}
      {hiperboreaEnabled && (
        <Portal
          position={[14, 0.4, -8]}
          label="Tabernáculo dos Caídos"
          subLabel="(seis tronos sombrios podem lembrar)"
          color="#a83a3a"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "tabernaculo-dos-caidos" : null)
          }
        />
      )}

      {/* Feira dos Sistemas — disponível desde Casa-Espelhada */}
      {casaEspelhadaEnabled && (
        <Portal
          position={[-14, 0.4, -8]}
          label="Feira dos Sistemas"
          subLabel="(cinco torres da Era da Informação)"
          color="#88c0e8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "feira-dos-sistemas" : null)
          }
        />
      )}

      {/* Labirinto das Eras — opcional, disponível desde Ratanabá */}
      {ratanabaEnabled && (
        <Portal
          position={[0, 0.4, 4.5]}
          label="Labirinto das Eras"
          subLabel="(dez espelhos lembram tuas vidas)"
          color="#a878d8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "labirinto-das-eras" : null)
          }
        />
      )}

      {/* Galeria dos Principados — opcional, destrava após Casa-Espelhada */}
      {casaEspelhadaEnabled && (
        <Portal
          position={[0, 0.4, -4.5]}
          label="Galeria dos Principados"
          subLabel="(doze leis aguardam contemplação)"
          color="#a890d8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "galeria-dos-principados" : null)
          }
        />
      )}

      {/* Agartha — cidade intra-terrena (destrava após Harmas/Mu) */}
      {harmasDefeated && (
        <Portal
          position={[6, 0.4, 4.5]}
          label="Agartha"
          subLabel="(o reino que lembrou)"
          color="#ffd890"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "agartha" : null)
          }
        />
      )}

      {/* Sodoma — cidade do julgamento (destrava após Demiurgo abraçado) */}
      {tronoEnabled && (
        <Portal
          position={[-6, 0.4, 4.5]}
          label="Sodoma"
          subLabel="(uma cidade aguarda intercessão)"
          color="#d87858"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "sodoma" : null)
          }
        />
      )}

      {/* Shamballa — fragmento do Pleroma (destrava após Iaoth/Pré-Adamita) */}
      {iaothDefeated && (
        <Portal
          position={[8, 0.4, -4.5]}
          label="Shamballa"
          subLabel="(o fragmento intacto)"
          color="#fff5d8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "shamballa" : null)
          }
        />
      )}

      {/* Telos — refúgio lemuriano (destrava após Galila/Lemúria) */}
      {galilaDefeated && (
        <Portal
          position={[-8, 0.4, -4.5]}
          label="Telos"
          subLabel="(Lemúria não morreu)"
          color="#88d8a0"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "telos" : null)
          }
        />
      )}

      {/* Gomorra — cidade da posse (após Demiurgo) */}
      {tronoEnabled && (
        <Portal
          position={[-4, 0.4, 8]}
          label="Gomorra"
          subLabel="(cinco mãos esperam abrir-se)"
          color="#a89878"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "gomorra" : null)
          }
        />
      )}

      {/* Babel — palavra fragmentada (após Demiurgo) */}
      {tronoEnabled && (
        <Portal
          position={[4, 0.4, 8]}
          label="Babel"
          subLabel="(quatro pontes esperam ser ditas)"
          color="#c89858"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "babel" : null)
          }
        />
      )}

      {/* Pleiadianos — cósmicos (5+ Centelhas) */}
      {casaEspelhadaEnabled && (
        <Portal
          position={[12, 0.4, -4.5]}
          label="Pleiadianos"
          subLabel="(as sete estrelas chamam)"
          color="#d8a0ff"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "pleiadianos" : null)
          }
        />
      )}

      {/* Arcturianos — cósmicos (após primeira reencarnação) */}
      {casaEspelhadaEnabled && (
        <Portal
          position={[-12, 0.4, -4.5]}
          label="Arcturianos"
          subLabel="(doze guias para quem atravessou)"
          color="#88c8e8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "arcturianos" : null)
          }
        />
      )}

      {/* Erks — cidade andina (destrava após Adonaios/Hiperbórea) */}
      {adonaiosDefeated && (
        <Portal
          position={[6, 0.4, -6]}
          label="Erks"
          subLabel="(os Andes têm portais)"
          color="#c8a868"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "erks" : null)
          }
        />
      )}

      {/* Siríacos — câmara da memória (após Casa-Espelhada) */}
      {casaEspelhadaEnabled && (
        <Portal
          position={[-6, 0.4, -6]}
          label="Siríacos"
          subLabel="(eu te lembrei o tempo todo)"
          color="#5a78d8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "siriacos" : null)
          }
        />
      )}

      {/* Adamá — cidade que esqueceu a terra (após Demiurgo) */}
      {tronoEnabled && (
        <Portal
          position={[10, 0.4, 0]}
          label="Adamá"
          subLabel="(uma cidade flutua, querendo descer)"
          color="#b85838"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "adama" : null)
          }
        />
      )}

      {/* Tzeboim — cidade-espelho social (após Demiurgo) */}
      {tronoEnabled && (
        <Portal
          position={[-10, 0.4, 0]}
          label="Tzeboim"
          subLabel="(dez espelhos esperam cair)"
          color="#a8a8c8"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "tzeboim" : null)
          }
        />
      )}

      {/* Bela — cidade-exemplo (após Demiurgo) */}
      {tronoEnabled && (
        <Portal
          position={[0, 0.4, -8]}
          label="Bela"
          subLabel="(a que foi salva — descansa aqui)"
          color="#e8a878"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "bela" : null)
          }
        />
      )}

      {/* Nínive — cidade-exemplo (após Demiurgo) */}
      {tronoEnabled && (
        <Portal
          position={[0, 0.4, 12]}
          label="Nínive"
          subLabel="(a que se lembrou — precedente)"
          color="#d88858"
          playerRef={playerRef}
          onProximityChange={(near) =>
            setNearPortal(near ? "ninive" : null)
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
      {!hiperboreaEnabled && <DormantPortal position={[-14, 0.4, 2]} />}
      {!deepCivsEnabled && <DormantPortal position={[10, 0.4, 8]} />}
      {!deepCivsEnabled && <DormantPortal position={[-10, 0.4, 8]} />}
      {!deepCivsEnabled && <DormantPortal position={[8, 0.4, -10]} />}
      {!deepCivsEnabled && <DormantPortal position={[-8, 0.4, -10]} />}

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
