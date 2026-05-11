import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useGameStore } from "./state/gameStore";
import { useSoulStore } from "./state/soulStore";
import { useCharacterStore } from "./state/characterStore";
import { useCinematicStore } from "./state/cinematicStore";
import { sophiaAudio } from "./audio/SophiaAudio";
import { setupAutoSave, save as saveGame } from "./systems/SaveSystem";

import { GardenScene } from "./scenes/GardenScene";
import { MarDeCristalScene, type MarDestino } from "./scenes/MarDeCristalScene";
import { BardoScene } from "./scenes/BardoScene";
import { RatanabaScene } from "./scenes/RatanabaScene";
import { CasaEspelhadaScene } from "./scenes/CasaEspelhadaScene";
import { ElDoradoScene } from "./scenes/ElDoradoScene";
import { HiperboreaScene } from "./scenes/HiperboreaScene";
import { AtlantidaScene } from "./scenes/AtlantidaScene";
import { LemuriaScene } from "./scenes/LemuriaScene";
import { MuScene } from "./scenes/MuScene";
import { PreAdamitaScene } from "./scenes/PreAdamitaScene";
import { HUD } from "./ui/HUD";
import { DialogBox } from "./ui/DialogBox";
import { AwakeningRing } from "./ui/AwakeningRing";
import { Cursor } from "./ui/Cursor";
import { TitleScreen, startFreshSession } from "./ui/TitleScreen";
import { CharacterCreation } from "./ui/CharacterCreation";
import { CinematicPlayer } from "./ui/CinematicPlayer";
import { VozDaLuz } from "./ui/VozDaLuz";
import { PedraConfirmation } from "./ui/PedraConfirmation";
import { Codex } from "./ui/Codex";
import { LegendaryReveal } from "./ui/LegendaryReveal";
import {
  VozesEscolha,
  type ChoiceOption,
  type KeyChoice,
} from "./ui/VozesEscolha";

import {
  introDialog,
  approachElderDialog,
  elderAwakeDialog,
} from "./dialog/script";
import { createAwakening } from "./systems/AwakeningController";

/* =========================================================
   App — orquestra: tela → criação → cinemática → jogo
   ---------------------------------------------------------
   Meta-flow (gameStore.metaPhase):
     "title" → "character-creation" → "cinematic" → "game"
   Dentro de "game" (phase):
     intro → awaken → whisper-arrives → ... → free-roam
   ========================================================= */

const ELDER_POS = new THREE.Vector3(12, 0, -6);

export default function App() {
  // Meta-flow
  const metaPhase = useGameStore((s) => s.metaPhase);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);
  const codexOpen = useGameStore((s) => s.codexOpen);
  const setCodexOpen = useGameStore((s) => s.setCodexOpen);
  const toggleCodex = useGameStore((s) => s.toggleCodex);

  // Cinematic
  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const hasPrologoBeenWatched = useCinematicStore((s) =>
    s.watched.prologo.watched,
  );

  // Setup auto-save uma única vez
  useEffect(() => {
    const cleanup = setupAutoSave();
    return cleanup;
  }, []);

  // Salva ao fechar a janela
  useEffect(() => {
    const handler = () => saveGame();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Atalho global: C abre/fecha Codex (apenas em metaPhase=game)
  // Atalho global: V toggle Olhar Lúcido (apenas em metaPhase=game)
  const toggleOlharLucido = useGameStore((s) => s.toggleOlharLucido);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (metaPhase !== "game") return;
      if (e.code === "KeyC") toggleCodex();
      if (e.code === "KeyV") toggleOlharLucido();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [metaPhase, toggleCodex, toggleOlharLucido]);

  // -- Fluxos do meta-flow --

  const handleNewGame = () => {
    startFreshSession();
    setMetaPhase("character-creation");
  };

  const handleContinue = () => {
    // Save já carregado pelo TitleScreen
    setMetaPhase("game");
  };

  const handleCharacterCreationDone = () => {
    // Após customização, vai para a cinemática Prólogo (se não viu)
    if (!hasPrologoBeenWatched) {
      playCinematic("prologo");
      setMetaPhase("cinematic");
    } else {
      setMetaPhase("game");
    }
  };

  const handleCinematicFinish = () => {
    // Cinemáticas pós-Arconte devolvem o jogador ao Mar de Cristal
    const lastWatched = useCinematicStore.getState().currentCinematic;
    if (
      lastWatched === "athoth-cai" ||
      lastWatched === "yobel-cai" ||
      lastWatched === "adonaios-cai" ||
      lastWatched === "eloaios-cai" ||
      lastWatched === "galila-cai" ||
      lastWatched === "harmas-cai" ||
      lastWatched === "iaoth-cai"
    ) {
      useCharacterStore.getState().setCurrentScene("mar-de-cristal");
    }
    setMetaPhase("game");
  };

  // Renderização do meta-flow
  if (metaPhase === "title") {
    return (
      <TitleScreen
        onNewGame={handleNewGame}
        onContinue={handleContinue}
      />
    );
  }

  if (metaPhase === "character-creation") {
    return <CharacterCreation onComplete={handleCharacterCreationDone} />;
  }

  if (metaPhase === "cinematic") {
    return <CinematicPlayer onFinish={handleCinematicFinish} />;
  }

  // metaPhase === "game"
  return (
    <>
      <GameOrchestrator />
      <Codex open={codexOpen} onClose={() => setCodexOpen(false)} />
    </>
  );
}

/* =========================================================
   GameOrchestrator — orquestrador do gameplay 3D
   ---------------------------------------------------------
   Roteia entre cenas baseado em characterStore.currentScene.
   ========================================================= */

function GameOrchestrator() {
  const currentScene = useCharacterStore((s) => s.currentScene);
  if (currentScene === "bardo") return <BardoOrchestrator />;
  if (currentScene === "mar-de-cristal") return <MarDeCristalOrchestrator />;
  if (currentScene === "ratanaba") return <RatanabaOrchestrator />;
  if (currentScene === "casa-espelhada") return <CasaEspelhadaOrchestrator />;
  if (currentScene === "el-dorado") return <ElDoradoOrchestrator />;
  if (currentScene === "hiperborea") return <HiperboreaOrchestrator />;
  if (currentScene === "atlantida") return <AtlantidaOrchestrator />;
  if (currentScene === "lemuria") return <LemuriaOrchestrator />;
  if (currentScene === "mu") return <MuOrchestrator />;
  if (currentScene === "pre-adamita") return <PreAdamitaOrchestrator />;
  return <JardimOrchestrator />;
}

/* =========================================================
   MarDeCristalOrchestrator
   ========================================================= */

function MarDeCristalOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const [showPedraConfirm, setShowPedraConfirm] = useState(false);

  useEffect(() => {
    setPlace("Mar de Cristal");
  }, [setPlace]);

  const handlePortalEnter = (destino: MarDestino) => {
    if (destino === "jardim-dos-ecos") {
      setCurrentScene("jardim-dos-ecos");
    } else if (destino === "ratanaba") {
      setCurrentScene("ratanaba");
    } else if (destino === "casa-espelhada") {
      setCurrentScene("casa-espelhada");
    } else if (destino === "el-dorado") {
      setCurrentScene("el-dorado");
    } else if (destino === "hiperborea") {
      setCurrentScene("hiperborea");
    } else if (destino === "atlantida") {
      setCurrentScene("atlantida");
    } else if (destino === "lemuria") {
      setCurrentScene("lemuria");
    } else if (destino === "mu") {
      setCurrentScene("mu");
    } else if (destino === "pre-adamita") {
      setCurrentScene("pre-adamita");
    }
  };

  const handlePedraActivate = () => {
    setShowPedraConfirm(true);
  };

  const handleConfirmDeath = () => {
    setShowPedraConfirm(false);
    // Marca fim da vida atual e vai ao Bardo
    useSoulStore.getState().endCurrentLife("morte voluntária na Pedra das Vidas");
    setCurrentScene("bardo");
  };

  const handleCancelDeath = () => {
    setShowPedraConfirm(false);
  };

  return (
    <>
      <MarDeCristalScene
        onPortalEnter={handlePortalEnter}
        onPedraActivate={handlePedraActivate}
      />
      <HUD />
      <Cursor />
      {showPedraConfirm && (
        <PedraConfirmation
          onConfirm={handleConfirmDeath}
          onCancel={handleCancelDeath}
        />
      )}
    </>
  );
}

/* =========================================================
   RatanabaOrchestrator — 1ª Civilização Perdida
   ---------------------------------------------------------
   Floresta amazônica. Boss: Mãe-D'Água (Athoth, 1º Arconte).
   Despertar Athoth = ganha Centelha do Olhar Lúcido + cinemática.
   ========================================================= */

const ATHOTH_CHOICE: KeyChoice = {
  id: "athoth-confronto",
  context:
    "A Mãe-D'Água dorme. Os filamentos sobem em direção ao céu. Tu te aproximas. Algo decide agora.",
  voices: {
    angel:
      "Canta com ela o canto-da-manhã. Toca-lhe sem palavras. Ela acordará por reconhecimento.",
    demon:
      "Quebra o sono dela à força. Tu mereces a Centelha. Não esperes que ela te dê — toma.",
    jinn: "Posso te oferecer um atalho — eu acordo por ti, em troca de uma promessa minha.",
    sophia: "Tu sabes o que fazer. Eu apenas guardo o silêncio.",
  },
  options: [
    {
      label: "Cantar com ela em silêncio (sentar e respirar 3 vezes)",
      alignment: "light",
      immediateEffect:
        "Ela abre os olhos por reconhecimento. Os filamentos rompem-se sem ruído.",
      amount: 8,
    },
    {
      label: "Forçar o despertar (gritar o nome dela)",
      alignment: "shadow",
      immediateEffect:
        "Ela acorda em choque. A Centelha vem — mas algo nela ficará receoso.",
      amount: 6,
    },
    {
      label: "Tocar-lhe sem palavras (mão sobre as águas)",
      alignment: "balance",
      immediateEffect:
        "Ela respira. Tu respiras. O rio brilha mais. Há equilíbrio aqui.",
      amount: 7,
    },
  ],
};

function RatanabaOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addCentelha = useSoulStore((s) => s.addCentelha);
  const hasCentelha = useSoulStore((s) => s.hasCentelha);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  useEffect(() => {
    setPlace("Ratanabá · Floresta-Mãe");
  }, [setPlace]);

  const maeAwakened = hasAwakened("athoth-mae-dagua");
  const [showChoice, setShowChoice] = useState(false);

  // Tecla F abre a escolha quando perto
  useEffect(() => {
    if (maeAwakened || showChoice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      setShowChoice(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maeAwakened, showChoice]);

  const handleChoiceResolved = (_opt: ChoiceOption) => {
    setShowChoice(false);
    // Despertar Athoth + Centelha + cinemática (independente da opção;
    // o alinhamento já foi modificado)
    recordAwakened({
      id: "athoth-mae-dagua",
      name: "Mãe-D'Água",
      trueName: "Athoth · Vigia Lunar Restaurada",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.5);
    if (!hasCentelha("olhar-lucido")) {
      addCentelha("olhar-lucido");
    }
    if (audioEnabled) sophiaAudio.awakenChord();
    setTimeout(() => {
      playCinematic("athoth-cai");
      setMetaPhase("cinematic");
    }, 1500);
  };

  return (
    <>
      <RatanabaScene onReturnToMar={() => setCurrentScene("mar-de-cristal")} />
      <HUD />
      <Cursor />
      {showChoice && (
        <VozesEscolha
          choice={ATHOTH_CHOICE}
          onResolved={handleChoiceResolved}
        />
      )}
    </>
  );
}

/* =========================================================
   BardoOrchestrator — fluxo do Bardo
   ---------------------------------------------------------
   1. Cena aparece com luz central
   2. Voz da Luz fala
   3. Jogador escolhe: aceitar (ending placeholder) ou recusar
   4. Se recusar: re-customização breve + nova vida no Mar
   ========================================================= */

function BardoOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const pastLives = useSoulStore((s) => s.pastLives);
  const beginNewLife = useSoulStore((s) => s.beginNewLife);

  const [acceptedLight, setAcceptedLight] = useState(false);
  const [reincarnating, setReincarnating] = useState(false);

  useEffect(() => {
    setPlace("Bardo");
  }, [setPlace]);

  const handleAccept = () => {
    setAcceptedLight(true);
    // Placeholder ending E: voltar ao TitleScreen após 6s
    setTimeout(() => {
      setMetaPhase("title");
    }, 6000);
  };

  const handleRefuse = () => {
    setReincarnating(true);
  };

  const handleNewBodyDone = () => {
    // Registra nova vida na alma
    const body = useCharacterStore.getState().body;
    const origin = useCharacterStore.getState().origin;
    beginNewLife({
      id: `life-${Date.now()}`,
      era: "Era da Informação",
      characterName: "Você",
      story: `Renascido após ${pastLives.length} vida(s). Origem: ${origin}, ${body.sex}.`,
      sleepersAwakened: 0,
      startedAt: Date.now(),
    });
    // Volta para o Mar de Cristal com novo corpo
    setCurrentScene("mar-de-cristal");
  };

  return (
    <>
      <BardoScene showMirrors={reincarnating} />
      {!acceptedLight && !reincarnating && (
        <VozDaLuz
          pastLivesCount={pastLives.length}
          onAccept={handleAccept}
          onRefuse={handleRefuse}
        />
      )}
      {acceptedLight && (
        <div className="bardo-ending">
          <p className="bardo-fala">
            <em>
              "Tu chegaste. Repousa. Tu sempre estiveste em casa."
            </em>
          </p>
          <p className="bardo-ending-sub">
            (Ending placeholder · Bardo Direto · retornando ao Título)
          </p>
        </div>
      )}
      {reincarnating && (
        <CharacterCreation onComplete={handleNewBodyDone} />
      )}
    </>
  );
}

/* =========================================================
   CasaEspelhadaOrchestrator — Sprint 11
   ---------------------------------------------------------
   Câmara hexagonal. O Auto-Sabotador (sombra do jogador)
   aguarda no centro. Mecânica: aproximar-se a < 1.6m e
   segurar F por 5 segundos. Largar reseta o progresso.
   Vitória: addCentelha "discernimento", recordAwakened
   "auto-sabotador" (Legendary), Sussurrante humanoide.
   ========================================================= */

const HUG_DURATION_S = 5.0;
const HUG_RANGE = 1.8;
const SABOTADOR_WORLD = new THREE.Vector3(0, 0, 0);

function CasaEspelhadaOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addCentelha = useSoulStore((s) => s.addCentelha);
  const hasCentelha = useSoulStore((s) => s.hasCentelha);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const alreadyDefeated = hasAwakened("auto-sabotador");
  const [defeated, setDefeated] = useState(alreadyDefeated);
  const [hugSeconds, setHugSeconds] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const fKeyDownRef = useRef(false);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    setPlace("Casa-Espelhada · Torre Secreta");
  }, [setPlace]);

  // Listener de F (down/up)
  useEffect(() => {
    if (defeated) return;
    const down = (e: KeyboardEvent) => {
      if (e.code === "KeyF") fKeyDownRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "KeyF") fKeyDownRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [defeated]);

  // Loop de progresso do abraço — só acumula se F segurado E perto da sombra
  useEffect(() => {
    if (defeated) return;
    let raf = 0;
    const tick = (now: number) => {
      const last = lastTickRef.current ?? now;
      const dt = Math.min(0.1, (now - last) / 1000);
      lastTickRef.current = now;

      const player = playerRefHolder.current?.current;
      let inRange = false;
      if (player) {
        const dx = player.position.x - SABOTADOR_WORLD.x;
        const dz = player.position.z - SABOTADOR_WORLD.z;
        inRange = Math.hypot(dx, dz) < HUG_RANGE;
      }

      if (fKeyDownRef.current && inRange) {
        setHugSeconds((s) => {
          const next = Math.min(HUG_DURATION_S, s + dt);
          if (next >= HUG_DURATION_S) {
            finishHug();
          }
          return next;
        });
      } else if (!fKeyDownRef.current || !inRange) {
        // Esquecimento gradual quando solta ou se afasta
        setHugSeconds((s) => Math.max(0, s - dt * 0.6));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defeated]);

  const finishHug = () => {
    setDefeated(true);
    setHugSeconds(HUG_DURATION_S);

    recordAwakened({
      id: "auto-sabotador",
      name: "O Auto-Sabotador",
      trueName: "O Carcereiro Era Eu",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.0);
    addToAlignment("balance", 10);
    if (!hasCentelha("discernimento")) {
      addCentelha("discernimento");
    }
    if (audioEnabled) sophiaAudio.awakenChord();
    setTimeout(() => setShowReveal(true), 1500);
  };

  const hugProgress = hugSeconds / HUG_DURATION_S;

  return (
    <>
      <CasaEspelhadaScene
        defeated={defeated}
        hugProgress={hugProgress}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!defeated && (
        <div className="casa-espelhada-hint">
          <p>
            <em>
              Aproxima-te. Segura <strong>F</strong> em silêncio. Por cinco
              respirações.
            </em>
          </p>
          <div className="hug-bar">
            <div
              className="hug-fill"
              style={{ width: `${hugProgress * 100}%` }}
            />
          </div>
          <p className="hug-time">
            {hugSeconds.toFixed(1)}s / {HUG_DURATION_S.toFixed(0)}s
          </p>
        </div>
      )}
      {showReveal && (
        <LegendaryReveal
          legendaryName="O Auto-Sabotador"
          epithet="O Carcereiro Era Eu"
          firstWords="Eu era a voz que dizia 'não és'. Eu era a porta que se trancava de dentro. Tu me abraçaste — e eu pude finalmente descansar."
          gift="Centelha do Discernimento — vê através das próprias mentiras. A Sussurrante toma forma humanoide."
          onComplete={() => setShowReveal(false)}
        />
      )}
    </>
  );
}

/* =========================================================
   ElDoradoOrchestrator — Sprint 12+13
   ---------------------------------------------------------
   Ruínas de cidade dourada. Yobel adormecido no trono.
   F perto dele abre escolha-chave (4 vozes / 3 opções).
   Despertar Yobel = Centelha "chama-interior" + cinemática
   "yobel-cai" + Yobel registrado como Lendário.
   ========================================================= */

const YOBEL_CHOICE: KeyChoice = {
  id: "yobel-confronto",
  context:
    "Yobel está coberto de ouro pesado. Os Sleepers ao redor carregam barras invisíveis nos ombros. Algo precisa quebrar este sono.",
  voices: {
    angel:
      "Não tomes o ouro. Tu não vieste por isso. Lembra-o de quem ele era antes da coroa.",
    demon:
      "Toma uma barra. Tu mereces. Quem se sacrificou foste tu — não eles.",
    jinn: "Posso fazer o ouro virar luz num só piscar — em troca, prometes-me três coisas depois.",
    sophia: "O brilho cega. O que se dá ilumina. Tu sabes a diferença.",
  },
  options: [
    {
      label: "Ajoelhar-se ao lado dos Sleepers e oferecer-lhes a luz da Centelha",
      alignment: "light",
      immediateEffect:
        "Eles erguem a cabeça. Pela primeira vez em séculos, vêem-se uns aos outros.",
      amount: 8,
    },
    {
      label: "Confrontar Yobel: gritar-lhe o nome verdadeiro",
      alignment: "shadow",
      immediateEffect:
        "Ele acorda em choque. A coroa cai — mas o canto demora a vir.",
      amount: 6,
    },
    {
      label: "Sentar-se em silêncio até que ele se lembre por si",
      alignment: "balance",
      immediateEffect:
        "Hora a hora, o ouro escorre como água. Ele lembra. O sol respira.",
      amount: 7,
    },
  ],
};

function ElDoradoOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addCentelha = useSoulStore((s) => s.addCentelha);
  const hasCentelha = useSoulStore((s) => s.hasCentelha);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  useEffect(() => {
    setPlace("El Dorado · Ruínas de Ouro");
  }, [setPlace]);

  const yobelAwakened = hasAwakened("yobel-inca-solitario");
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    if (yobelAwakened || showChoice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      setShowChoice(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [yobelAwakened, showChoice]);

  const handleChoiceResolved = (_opt: ChoiceOption) => {
    setShowChoice(false);
    recordAwakened({
      id: "yobel-inca-solitario",
      name: "Inca-Solitário",
      trueName: "Yobel · Urso Coroado Restaurado",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.5);
    if (!hasCentelha("chama-interior")) {
      addCentelha("chama-interior");
    }
    if (audioEnabled) sophiaAudio.awakenChord();
    setTimeout(() => {
      playCinematic("yobel-cai");
      setMetaPhase("cinematic");
    }, 1500);
  };

  return (
    <>
      <ElDoradoScene
        yobelAwakened={yobelAwakened}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
      />
      <HUD />
      <Cursor />
      {showChoice && (
        <VozesEscolha choice={YOBEL_CHOICE} onResolved={handleChoiceResolved} />
      )}
    </>
  );
}

/* =========================================================
   HiperboreaOrchestrator — Sprint 17
   ---------------------------------------------------------
   Tundra de cristal eterno. Adonaios (Guardião-Solar) com a
   coragem acorrentada. F perto dele abre escolha-chave.
   Despertar Adonaios = Centelha "coracao-firme" + cinemática
   "adonaios-cai" + Adonaios registrado como Lendário.
   ========================================================= */

const ADONAIOS_CHOICE: KeyChoice = {
  id: "adonaios-confronto",
  context:
    "Adonaios guarda o portão. Atrás dele, nas masmorras, a Raiva chora acorrentada. Ele acredita estar protegendo o povo — mas é o povo que está dócil demais para se defender.",
  voices: {
    angel:
      "Mostra-lhe que a coragem não é golpe. É segurar firme o que se ama, respirando.",
    demon:
      "Quebra-lhe a armadura. Liberta a Raiva com violência. Ele só entende força.",
    jinn: "Posso enganar o Guardião — basta dizermos que somos do mesmo lado. Ele dorme se a língua for boa.",
    sophia: "Pergunta-lhe quem ele jurou proteger. E para quem o juramento foi roubado.",
  },
  options: [
    {
      label: "Mostrar-lhe que a Raiva é energia sagrada para defender o pequeno",
      alignment: "light",
      immediateEffect:
        "Adonaios solta a chave. A Raiva sai, não para queimar — para guardar.",
      amount: 8,
    },
    {
      label: "Romper as correntes da Raiva à força — sem pedir licença",
      alignment: "shadow",
      immediateEffect:
        "A Raiva sai em fúria. Acorda — mas com cicatriz. Aprende a vingar antes de aprender a guardar.",
      amount: 6,
    },
    {
      label: "Sentar-se ao lado dele em silêncio até que se reconheça",
      alignment: "balance",
      immediateEffect:
        "Hora a hora, o elmo vergonha. Ele lembra quem jurou proteger. Solta a chave por si.",
      amount: 7,
    },
  ],
};

function HiperboreaOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addCentelha = useSoulStore((s) => s.addCentelha);
  const hasCentelha = useSoulStore((s) => s.hasCentelha);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  useEffect(() => {
    setPlace("Hiperbórea · Tundra Eterna");
  }, [setPlace]);

  const adonaiosAwakened = hasAwakened("adonaios-guardiao-solar");
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    if (adonaiosAwakened || showChoice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      setShowChoice(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adonaiosAwakened, showChoice]);

  const handleChoiceResolved = (_opt: ChoiceOption) => {
    setShowChoice(false);
    recordAwakened({
      id: "adonaios-guardiao-solar",
      name: "Guardião-Solar",
      trueName: "Adonaios · Marte Restaurado",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.5);
    if (!hasCentelha("coracao-firme")) {
      addCentelha("coracao-firme");
    }
    if (audioEnabled) sophiaAudio.awakenChord();
    setTimeout(() => {
      playCinematic("adonaios-cai");
      setMetaPhase("cinematic");
    }, 1500);
  };

  return (
    <>
      <HiperboreaScene
        adonaiosAwakened={adonaiosAwakened}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
      />
      <HUD />
      <Cursor />
      {showChoice && (
        <VozesEscolha
          choice={ADONAIOS_CHOICE}
          onResolved={handleChoiceResolved}
        />
      )}
    </>
  );
}

/* =========================================================
   Atlântida / Lemúria / Mu / Pré-Adamita — Sprints 18-21
   ---------------------------------------------------------
   Padrão comum: cada cena tem um Arconte adormecido. F perto
   abre escolha-chave. Resolução: addCentelha, addLight + 1.5,
   recordAwakened, cinemática correspondente.
   Após a cinemática, volta ao Mar de Cristal automaticamente.
   ========================================================= */

const ELOAIOS_CHOICE: KeyChoice = {
  id: "eloaios-confronto",
  context:
    "Eloaios segura a Tábua da Lei. A ilha afunda mais a cada gota que cai dela. A Lei era para servir — virou prisão para todos, inclusive para ele.",
  voices: {
    angel:
      "Lembra-lhe a primeira frase escrita na Tábua. Era amor — não condição.",
    demon:
      "Quebra a Tábua. Sem lei nenhuma, todos serão livres. Que afunde tudo.",
    jinn: "Posso reescrever a Tábua a teu favor. Diz-me três leis que queres a tua medida.",
    sophia: "Pergunta a ele a quem a lei jurou servir. Espera a resposta.",
  },
  options: [
    {
      label: "Tocar a Tábua e dizer-lhe: 'Lê com os olhos da criança que escreveu'",
      alignment: "light",
      immediateEffect: "A Tábua amolece. Vira água. Eloaios bebe. A ilha para de afundar.",
      amount: 8,
    },
    {
      label: "Quebrar a Tábua para libertar o povo",
      alignment: "shadow",
      immediateEffect: "Cristal estilhaça. Liberdade vem em ondas de pânico. Aprenderão a ter lei viva — depois.",
      amount: 6,
    },
    {
      label: "Sentar-se ao lado dele em silêncio até que ele leia a Tábua sozinho",
      alignment: "balance",
      immediateEffect: "Hora a hora, a Tábua suaviza. Ele lembra. A lei volta a ser água.",
      amount: 7,
    },
  ],
};

const GALILA_CHOICE: KeyChoice = {
  id: "galila-confronto",
  context:
    "Galila canta com voz que ofusca. Os Sleepers pares ao redor ouvem e se sentem pequenos. A beleza dela calcula admiração — esqueceu de ressoar.",
  voices: {
    angel: "Canta com ela uma nota só — não a tua melhor. Mostra-lhe que beleza é ressonância.",
    demon: "Brilha mais do que ela. Mostra-lhe que perdeu o trono. Tu tens o que ela teme.",
    jinn: "Posso fazer-te invisível para a inveja dela. Mas pagarás com a tua próxima beleza.",
    sophia: "Pergunta-lhe quando foi a última vez que outro cantou e ela sentiu-se bela ouvindo.",
  },
  options: [
    {
      label: "Cantar com ela uma nota única — humilde, no mesmo tom",
      alignment: "light",
      immediateEffect: "Ela escuta. Pela primeira vez. O lótus floresce em respiração coletiva.",
      amount: 8,
    },
    {
      label: "Apagar a luz dela com a tua própria — mostrar quem brilha mais",
      alignment: "shadow",
      immediateEffect: "Ela cala. Acorda em vergonha — não em alegria. Mas acorda.",
      amount: 6,
    },
    {
      label: "Esperar em silêncio até que alguém cante perto dela",
      alignment: "balance",
      immediateEffect: "Um Sleeper canta. Galila escuta. Lembra. A beleza retorna por ressonância.",
      amount: 7,
    },
  ],
};

const HARMAS_CHOICE: KeyChoice = {
  id: "harmas-confronto",
  context:
    "Harmas é cristal fragmentado. Não fala — vibra. Os hieróglifos ao redor não traduzem entre si. Tu precisas dizer algo que vibre antes da língua.",
  voices: {
    angel: "Não fales. Apenas pensa-lhe o que queres dizer com toda a verdade.",
    demon: "Toma um fragmento. Tu mereces uma palavra que ninguém mais entenda.",
    jinn: "Posso te ensinar uma língua que dobra os outros. Caro, mas eficaz.",
    sophia: "A palavra que vibra sem ser dita está dentro de ti — pergunta a ela.",
  },
  options: [
    {
      label: "Pensar uma frase verdadeira sem dizê-la — deixar a vibração tocá-lo",
      alignment: "light",
      immediateEffect: "Os hieróglifos giram. Reorganizam-se em estrelas. Harmas vê tu por dentro.",
      amount: 8,
    },
    {
      label: "Quebrar um fragmento e levar para te entender melhor",
      alignment: "shadow",
      immediateEffect: "A peça canta solitária na tua mão. Ela cala perto dos outros.",
      amount: 6,
    },
    {
      label: "Ficar parado, sem pensar nada — só ouvir o silêncio entre os hieróglifos",
      alignment: "balance",
      immediateEffect: "O tetraedro tece um anel novo. Tu já sabes a língua antes das línguas.",
      amount: 7,
    },
  ],
};

const IAOTH_CHOICE: KeyChoice = {
  id: "iaoth-confronto",
  context:
    "Iaoth é esfera negra com anel de Saturno. Sem face. Sem voz. Apenas presença antiga. Não há perguntas a fazer — só lembrança a aceitar ou recusar.",
  voices: {
    angel: "Aceita a memória. Doerá. Mas tu eras antes do tempo.",
    demon: "Não olhes para dentro. Há coisas tuas que tu não queres lembrar.",
    jinn: "Posso filtrar a memória — só o doce te chega. Por um preço.",
    sophia: "Olha. Tudo. Não temas. Eu fico contigo.",
  },
  options: [
    {
      label: "Aceitar a memória inteira — doce, doloroso, brincalhão, perdido",
      alignment: "light",
      immediateEffect: "A esfera abre. Dentro: a tua estrela recém-nascida. Tu lembras quem foste.",
      amount: 8,
    },
    {
      label: "Recusar — algumas coisas é melhor esquecer",
      alignment: "shadow",
      immediateEffect: "A esfera mantém-se fechada. Iaoth desperta — mas tu carregas um véu novo.",
      amount: 6,
    },
    {
      label: "Pedir só o que ele te ofereça agora, sem exigir o resto",
      alignment: "balance",
      immediateEffect: "O anel de Saturno gira. Uma única lembrança vem — a primeira risada.",
      amount: 7,
    },
  ],
};

function makeArconteOrchestrator(config: {
  placeName: string;
  awakenedId: string;
  npcName: string;
  trueName: string;
  centelhaId: Parameters<ReturnType<typeof useSoulStore.getState>["addCentelha"]>[0];
  cinematicId: Parameters<ReturnType<typeof useCinematicStore.getState>["playCinematic"]>[0];
  choice: KeyChoice;
  Scene: React.ComponentType<{
    [k: string]: unknown;
    onReturnToMar?: () => void;
  }>;
  awakenedPropName: string;
}) {
  return function ArconteOrchestrator() {
    const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
    const setPlace = useGameStore((s) => s.setPlace);
    const audioEnabled = useGameStore((s) => s.audioEnabled);

    const recordAwakened = useSoulStore((s) => s.recordAwakened);
    const addLight = useSoulStore((s) => s.addLight);
    const addCentelha = useSoulStore((s) => s.addCentelha);
    const hasCentelha = useSoulStore((s) => s.hasCentelha);
    const hasAwakened = useSoulStore((s) => s.hasAwakened);
    const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

    const playCinematic = useCinematicStore((s) => s.playCinematic);
    const setMetaPhase = useGameStore((s) => s.setMetaPhase);

    useEffect(() => {
      setPlace(config.placeName);
    }, [setPlace]);

    const awakened = hasAwakened(config.awakenedId);
    const [showChoice, setShowChoice] = useState(false);

    useEffect(() => {
      if (awakened || showChoice) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.code !== "KeyF") return;
        setShowChoice(true);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [awakened, showChoice]);

    const handleChoiceResolved = (_opt: ChoiceOption) => {
      setShowChoice(false);
      recordAwakened({
        id: config.awakenedId,
        name: config.npcName,
        trueName: config.trueName,
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(1.5);
      if (!hasCentelha(config.centelhaId)) {
        addCentelha(config.centelhaId);
      }
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic(config.cinematicId);
        setMetaPhase("cinematic");
      }, 1500);
    };

    const sceneProps = {
      [config.awakenedPropName]: awakened,
      onReturnToMar: () => setCurrentScene("mar-de-cristal"),
    };

    return (
      <>
        <config.Scene {...sceneProps} />
        <HUD />
        <Cursor />
        {showChoice && (
          <VozesEscolha
            choice={config.choice}
            onResolved={handleChoiceResolved}
          />
        )}
      </>
    );
  };
}

const AtlantidaOrchestrator = makeArconteOrchestrator({
  placeName: "Atlântida · Cidade Concêntrica",
  awakenedId: "eloaios-lei-cristalina",
  npcName: "O Jurista de Cristal",
  trueName: "Eloaios · Júpiter Restaurado",
  centelhaId: "palavra-de-nomeacao",
  cinematicId: "eloaios-cai",
  choice: ELOAIOS_CHOICE,
  Scene: AtlantidaScene as unknown as React.ComponentType<{
    [k: string]: unknown;
    onReturnToMar?: () => void;
  }>,
  awakenedPropName: "eloaiosAwakened",
});

const LemuriaOrchestrator = makeArconteOrchestrator({
  placeName: "Lemúria · Continente do Canto",
  awakenedId: "galila-beleza-viva",
  npcName: "A Senhora do Lótus",
  trueName: "Galila · Vênus Restaurada",
  centelhaId: "toque-compassivo",
  cinematicId: "galila-cai",
  choice: GALILA_CHOICE,
  Scene: LemuriaScene as unknown as React.ComponentType<{
    [k: string]: unknown;
    onReturnToMar?: () => void;
  }>,
  awakenedPropName: "galilaAwakened",
});

const MuOrchestrator = makeArconteOrchestrator({
  placeName: "Mu · Plataformas Flutuantes",
  awakenedId: "harmas-palavra-raiz",
  npcName: "O Hieroglifo Vivo",
  trueName: "Harmas · Mercúrio Restaurado",
  centelhaId: "fala-raiz",
  cinematicId: "harmas-cai",
  choice: HARMAS_CHOICE,
  Scene: MuScene as unknown as React.ComponentType<{
    [k: string]: unknown;
    onReturnToMar?: () => void;
  }>,
  awakenedPropName: "harmasAwakened",
});

const PreAdamitaOrchestrator = makeArconteOrchestrator({
  placeName: "Pré-Adamita · Antes do Tempo",
  awakenedId: "iaoth-memoria-pleroma",
  npcName: "A Esfera Saturnal",
  trueName: "Iaoth · Saturno Restaurado",
  centelhaId: "memoria-do-pleroma",
  cinematicId: "iaoth-cai",
  choice: IAOTH_CHOICE,
  Scene: PreAdamitaScene as unknown as React.ComponentType<{
    [k: string]: unknown;
    onReturnToMar?: () => void;
  }>,
  awakenedPropName: "iaothAwakened",
});

/* =========================================================
   JardimOrchestrator (anterior conteúdo do GameOrchestrator)
   ========================================================= */

function JardimOrchestrator() {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const setDialog = useGameStore((s) => s.setDialog);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);

  useEffect(() => {
    setPlace("Jardim dos Ecos");
  }, [setPlace]);

  // Soul: addLight + recordAwakened
  const addLight = useSoulStore((s) => s.addLight);
  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);

  // Estado para o segundo Sleeper — O Estranho (Adão)
  const elderAwakened = hasAwakened("velho-do-jardim");
  const adamAwakened = hasAwakened("adao-estranho");
  const showEstranho = elderAwakened; // aparece após despertar Velho
  const [nearEstranho, setNearEstranho] = useState(false);
  const [estranhoAwakenLoop, setEstranhoAwakenLoop] = useState(false);
  const [estranhoAwakenState, setEstranhoAwakenState] = useState({
    hits: 0,
    required: 5,
  });
  const [showAdamReveal, setShowAdamReveal] = useState(false);
  const estranhoCtrl = useMemo(
    () => createAwakening({ required: 5, period: 1.4 }),
    [],
  );
  const estranhoRaf = useRef<number | null>(null);

  // dialog index local para cada beat
  const [dialogIdx, setDialogIdx] = useState(0);

  /* ---- Awakening mini-game ---- */
  const awakeningCtrl = useMemo(
    () => createAwakening({ required: 4, period: 1.5 }),
    [],
  );
  const [awakeningState, setAwakeningState] = useState({
    hits: 0,
    required: 4,
  });
  const awakeningRaf = useRef<number | null>(null);
  const elderName = "Velho do Jardim";

  // Garante phase inicial correta ao entrar no gameplay
  useEffect(() => {
    if (phase === "intro") {
      // Se já passamos pela cinemática, começamos diretamente em "awaken"
      setPhase("awaken");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Após intro: pequena espera silenciosa, depois Sussurrante chega
  useEffect(() => {
    if (phase === "awaken") {
      const t = setTimeout(() => {
        setPhase("whisper-arrives");
        setDialogIdx(0);
        setDialog(introDialog[0]);
        if (audioEnabled) sophiaAudio.chime(76, 1.8, 0.25);
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase, setDialog, audioEnabled]);

  // Avançar diálogo de "whisper-arrives"
  const advanceWhisperDialog = () => {
    const next = dialogIdx + 1;
    if (next < introDialog.length) {
      setDialog(introDialog[next]);
      setDialogIdx(next);
      if (audioEnabled) sophiaAudio.whisperBlip();
    } else {
      setDialog(null);
      setDialogIdx(0);
      setPhase("explore");
      if (audioEnabled) sophiaAudio.setMood("approach");
    }
  };

  const advanceApproachDialog = () => {
    const next = dialogIdx + 1;
    if (next < approachElderDialog.length) {
      setDialog(approachElderDialog[next]);
      setDialogIdx(next);
      if (audioEnabled) sophiaAudio.whisperBlip();
    } else {
      setDialog(null);
      setDialogIdx(0);
      setPhase("awakening");
      if (audioEnabled) sophiaAudio.setMood("awakening");
      awakeningCtrl.start(performance.now() / 1000);
      startAwakeningLoop();
    }
  };

  const advanceElderAwakeDialog = () => {
    const next = dialogIdx + 1;
    if (next < elderAwakeDialog.length) {
      setDialog(elderAwakeDialog[next]);
      setDialogIdx(next);
      if (audioEnabled) sophiaAudio.whisperBlip();
    } else {
      setDialog(null);
      setDialogIdx(0);
      setPhase("free-roam");
      if (audioEnabled) sophiaAudio.setMood("after");
    }
  };

  /* ---- Approach detection ---- */
  const handleApproach = (near: boolean) => {
    if (phase === "explore" && near) {
      setPhase("approach-elder");
      setDialogIdx(0);
      setDialog(approachElderDialog[0]);
      if (audioEnabled) sophiaAudio.chime(74, 1.2, 0.2);
    }
  };

  /* ---- Awakening loop ---- */
  const startAwakeningLoop = () => {
    const tick = () => {
      const now = performance.now() / 1000;
      const st = awakeningCtrl.update(now);
      setAwakeningState({ hits: st.hits, required: st.required });
      if (st.done) {
        finishAwakening();
        return;
      }
      awakeningRaf.current = requestAnimationFrame(tick);
    };
    awakeningRaf.current = requestAnimationFrame(tick);
  };

  const finishAwakening = () => {
    if (awakeningRaf.current !== null)
      cancelAnimationFrame(awakeningRaf.current);
    awakeningRaf.current = null;

    // Registra na alma — Velho do Jardim acordado
    recordAwakened({
      id: "velho-do-jardim",
      name: elderName,
      trueName: "Aquele-que-procurou",
      isLegendary: false,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(0.8);

    // Toast continua no gameStore (sessão)
    useGameStore.getState().showToast("Despertou", elderName);

    if (audioEnabled) sophiaAudio.awakenChord();
    setTimeout(() => {
      setPhase("elder-awake");
      setDialogIdx(0);
      setDialog(elderAwakeDialog[0]);
    }, 1800);
  };

  /* ---- Tecla F durante mini-game ---- */
  useEffect(() => {
    if (phase !== "awakening") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const now = performance.now() / 1000;
      const hit = awakeningCtrl.press(now);
      if (hit) {
        if (audioEnabled) sophiaAudio.pulse();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, audioEnabled, awakeningCtrl]);

  /* ---- Dispatcher único de "espaço" ---- */
  const handleAdvance = () => {
    switch (phase) {
      case "whisper-arrives":
        advanceWhisperDialog();
        break;
      case "approach-elder":
        advanceApproachDialog();
        break;
      case "elder-awake":
        advanceElderAwakeDialog();
        break;
    }
  };

  /* ---- ESC libera o cursor (caso pointer-locked) ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" && document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---- Despertar do Estranho (Adão) ---- */
  const handleApproachEstranho = (near: boolean) => {
    setNearEstranho(near);
    if (near && !adamAwakened && !estranhoAwakenLoop) {
      // Inicia automaticamente o mini-game quando se aproxima
      setEstranhoAwakenLoop(true);
      estranhoCtrl.start(performance.now() / 1000);
      const tick = () => {
        const now = performance.now() / 1000;
        const st = estranhoCtrl.update(now);
        setEstranhoAwakenState({ hits: st.hits, required: st.required });
        if (st.done) {
          finishEstranhoAwakening();
          return;
        }
        estranhoRaf.current = requestAnimationFrame(tick);
      };
      estranhoRaf.current = requestAnimationFrame(tick);
    }
  };

  const finishEstranhoAwakening = () => {
    if (estranhoRaf.current !== null)
      cancelAnimationFrame(estranhoRaf.current);
    estranhoRaf.current = null;
    setEstranhoAwakenLoop(false);

    // Registra Adão como Lendário
    recordAwakened({
      id: "adao-estranho",
      name: "Adão",
      trueName: "O Primeiro",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.2);

    if (audioEnabled) sophiaAudio.awakenChord();
    // Mostra revelação cinematográfica
    setTimeout(() => setShowAdamReveal(true), 1500);
  };

  // Tecla F durante mini-game do Estranho
  useEffect(() => {
    if (!estranhoAwakenLoop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const now = performance.now() / 1000;
      const hit = estranhoCtrl.press(now);
      if (hit && audioEnabled) sophiaAudio.pulse();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [estranhoAwakenLoop, audioEnabled, estranhoCtrl]);

  /* ---- Cleanup ---- */
  useEffect(() => {
    return () => {
      if (awakeningRaf.current !== null)
        cancelAnimationFrame(awakeningRaf.current);
      if (estranhoRaf.current !== null)
        cancelAnimationFrame(estranhoRaf.current);
    };
  }, []);

  const goToMar = () => setCurrentScene("mar-de-cristal");

  // Posição do Estranho (oposta ao Velho — pelo outro lado do Jardim)
  const ESTRANHO_POS = useMemo(() => new THREE.Vector3(-9, 0, 8), []);

  // Mostrar AwakeningRing para qualquer mini-game ativo
  const isEstranhoMiniGame = estranhoAwakenLoop;
  const ringHits = isEstranhoMiniGame
    ? estranhoAwakenState.hits
    : awakeningState.hits;
  const ringRequired = isEstranhoMiniGame
    ? estranhoAwakenState.required
    : awakeningState.required;

  return (
    <>
      <GardenScene
        elderPos={ELDER_POS}
        onApproachElder={handleApproach}
        showExitPortal={phase === "free-roam"}
        onExitToMar={goToMar}
        showEstranho={showEstranho && !adamAwakened}
        estranhoPos={ESTRANHO_POS}
        onApproachEstranho={handleApproachEstranho}
      />
      <HUD />
      <DialogBox onAdvance={handleAdvance} />
      <AwakeningRing hits={ringHits} required={ringRequired} />
      <Cursor />
      {showAdamReveal && (
        <LegendaryReveal
          legendaryName="Adão"
          epithet="O Primeiro"
          firstWords="Eu nomeei os animais. Mas a primeira coisa que nomeei foi a saudade — antes mesmo de tê-la."
          gift="Nome Original — pode dar o Nome Verdadeiro a qualquer ser, acalmando Potestades hostis."
          onComplete={() => setShowAdamReveal(false)}
        />
      )}
    </>
  );
}
