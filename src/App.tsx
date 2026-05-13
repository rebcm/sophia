import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useGameStore } from "./state/gameStore";
import { useSoulStore } from "./state/soulStore";
import { useCharacterStore } from "./state/characterStore";
import { useCinematicStore } from "./state/cinematicStore";
import { sophiaAudio, moodForScene } from "./audio/SophiaAudio";
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
import { TronoDemiurgoScene } from "./scenes/TronoDemiurgoScene";
import { EndingChoice, type EndingId } from "./ui/EndingChoice";
import {
  TabernaculoDosCaidosScene,
  CAIDOS_ORDER,
  SHRINE_POSITIONS,
} from "./scenes/TabernaculoDosCaidosScene";
import type { CaidoId } from "./world/AnjoCaidoShrine";
import { FeiraDosSistemasScene } from "./scenes/FeiraDosSistemasScene";
import {
  LabirintoDasErasScene,
  ERAS,
  type EraId,
  type EraDescriptor,
} from "./scenes/LabirintoDasErasScene";
import { FlashbackOverlay } from "./ui/FlashbackOverlay";
import {
  GaleriaPrincipadosScene,
  PRINCIPADOS_ORDER,
  PRINCIPADO_POSITIONS,
  PRINCIPADO_QUESTOES,
} from "./scenes/GaleriaPrincipadosScene";
import type { PrincipadoId } from "./world/Principado";
import { AgarthaScene } from "./scenes/AgarthaScene";
import { SodomaScene } from "./scenes/SodomaScene";
import { ShamballaScene } from "./scenes/ShamballaScene";
import { TelosScene } from "./scenes/TelosScene";
import {
  GomorraScene,
  STATUE_POSITIONS,
} from "./scenes/GomorraScene";
import { BabelScene, POVO_POSITIONS } from "./scenes/BabelScene";
import { PleiadianosScene } from "./scenes/PleiadianosScene";
import { ArcturianosScene } from "./scenes/ArcturianosScene";
import { ErksScene } from "./scenes/ErksScene";
import { SiriacosScene } from "./scenes/SiriacosScene";
import { AdamaScene } from "./scenes/AdamaScene";
import {
  TzeboimScene,
  MIRROR_POSITIONS,
} from "./scenes/TzeboimScene";
import { BelaScene } from "./scenes/BelaScene";
import { NiniveScene } from "./scenes/NiniveScene";
import { ParSizigico } from "./world/ParSizigico";
import { SizigiaRecognition } from "./ui/SizigiaRecognition";
import { PowerUpToast } from "./ui/PowerUpToast";
import { PauseMenu } from "./ui/PauseMenu";
import { SaveIndicator } from "./ui/SaveIndicator";
import { AmbientWhispers } from "./ui/AmbientWhispers";
import { OlharLucidoOverlay } from "./ui/OlharLucidoOverlay";
import { OnboardingOverlay } from "./ui/OnboardingOverlay";
import { QuestHint } from "./ui/QuestHint";
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
  // Atalho global: P abre/fecha Pause Menu (apenas em metaPhase=game)
  const toggleOlharLucido = useGameStore((s) => s.toggleOlharLucido);
  const [pauseOpen, setPauseOpen] = useState(false);
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
      if (e.code === "KeyP") setPauseOpen((o) => !o);
      if (e.code === "Escape" && pauseOpen) setPauseOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [metaPhase, toggleCodex, toggleOlharLucido, pauseOpen]);

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
      lastWatched === "iaoth-cai" ||
      lastWatched === "rei-do-mundo" ||
      lastWatched === "sodoma-interedida" ||
      lastWatched === "triade-sentinela" ||
      lastWatched === "adama-de-telos" ||
      lastWatched === "gomorra-redimida" ||
      lastWatched === "babel-redimida" ||
      lastWatched === "sacerdotisa-pleiadiana" ||
      lastWatched === "guia-arcturiano" ||
      lastWatched === "mestre-andino" ||
      lastWatched === "escriba-siriaco" ||
      lastWatched === "adama-redimida" ||
      lastWatched === "tzeboim-redimida" ||
      lastWatched === "loth-de-bela" ||
      lastWatched === "jonas-de-ninive"
    ) {
      useCharacterStore.getState().setCurrentScene("mar-de-cristal");
    }
    // Cinemáticas dos 6 Anjos Caídos voltam ao próprio tabernáculo
    if (
      lastWatched === "asmodeus-cai" ||
      lastWatched === "lucifer-cai" ||
      lastWatched === "belial-cai" ||
      lastWatched === "azazel-cai" ||
      lastWatched === "semyaza-cai" ||
      lastWatched === "leviata-cai"
    ) {
      useCharacterStore
        .getState()
        .setCurrentScene("tabernaculo-dos-caidos");
    }
    // Cinemáticas do clímax encadeiam sem trocar de cena —
    // TronoDemiurgoOrchestrator escuta cinematicStore.currentCinematic
    // e dispara a próxima após finishCurrentCinematic.
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
      <PowerUpToast />
      <SaveIndicator />
      <AmbientWhispers />
      <OlharLucidoOverlay />
      <QuestHint />
      <OnboardingOverlay onClose={() => {}} />
      {pauseOpen && <PauseMenu onClose={() => setPauseOpen(false)} />}
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
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  // Sprint 34 · Trocar mood do áudio ao mudar de cena
  useEffect(() => {
    if (!audioEnabled) return;
    sophiaAudio.setMood(moodForScene(currentScene));
  }, [currentScene, audioEnabled]);

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
  if (currentScene === "trono-demiurgo") return <TronoDemiurgoOrchestrator />;
  if (currentScene === "tabernaculo-dos-caidos")
    return <TabernaculoDosCaidosOrchestrator />;
  if (currentScene === "feira-dos-sistemas")
    return <FeiraDosSistemasOrchestrator />;
  if (currentScene === "labirinto-das-eras")
    return <LabirintoDasErasOrchestrator />;
  if (currentScene === "galeria-dos-principados")
    return <GaleriaPrincipadosOrchestrator />;
  if (currentScene === "agartha") return <AgarthaOrchestrator />;
  if (currentScene === "sodoma") return <SodomaOrchestrator />;
  if (currentScene === "shamballa") return <ShamballaOrchestrator />;
  if (currentScene === "telos") return <TelosOrchestrator />;
  if (currentScene === "gomorra") return <GomorraOrchestrator />;
  if (currentScene === "babel") return <BabelOrchestrator />;
  if (currentScene === "pleiadianos") return <PleiadianosOrchestrator />;
  if (currentScene === "arcturianos") return <ArcturianosOrchestrator />;
  if (currentScene === "erks") return <ErksOrchestrator />;
  if (currentScene === "siriacos") return <SiriacosOrchestrator />;
  if (currentScene === "adama") return <AdamaOrchestrator />;
  if (currentScene === "tzeboim") return <TzeboimOrchestrator />;
  if (currentScene === "bela") return <BelaOrchestrator />;
  if (currentScene === "ninive") return <NiniveOrchestrator />;
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
    } else if (destino === "trono-demiurgo") {
      setCurrentScene("trono-demiurgo");
    } else if (destino === "tabernaculo-dos-caidos") {
      setCurrentScene("tabernaculo-dos-caidos");
    } else if (destino === "feira-dos-sistemas") {
      setCurrentScene("feira-dos-sistemas");
    } else if (destino === "labirinto-das-eras") {
      setCurrentScene("labirinto-das-eras");
    } else if (destino === "galeria-dos-principados") {
      setCurrentScene("galeria-dos-principados");
    } else if (destino === "agartha") {
      setCurrentScene("agartha");
    } else if (destino === "sodoma") {
      setCurrentScene("sodoma");
    } else if (destino === "shamballa") {
      setCurrentScene("shamballa");
    } else if (destino === "telos") {
      setCurrentScene("telos");
    } else if (destino === "gomorra") {
      setCurrentScene("gomorra");
    } else if (destino === "babel") {
      setCurrentScene("babel");
    } else if (destino === "pleiadianos") {
      setCurrentScene("pleiadianos");
    } else if (destino === "arcturianos") {
      setCurrentScene("arcturianos");
    } else if (destino === "erks") {
      setCurrentScene("erks");
    } else if (destino === "siriacos") {
      setCurrentScene("siriacos");
    } else if (destino === "adama") {
      setCurrentScene("adama");
    } else if (destino === "tzeboim") {
      setCurrentScene("tzeboim");
    } else if (destino === "bela") {
      setCurrentScene("bela");
    } else if (destino === "ninive") {
      setCurrentScene("ninive");
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
   TronoDemiurgoOrchestrator — Sprint 22 (clímax)
   ---------------------------------------------------------
   Cena do Trono. Aproximação + F = abraçar o Demiurgo.
   Cinemáticas encadeadas: demiurgo-cai → grande-revelacao →
   veu → monada. Depois: <EndingChoice /> com 6 finais.
   ========================================================= */

type ClimaxStage =
  | "approach" // jogador vai até o trono
  | "embrace" // animação do abraço + auto-trigger cinemática 1
  | "cin-1" // demiurgo-cai
  | "cin-2" // grande-revelacao
  | "cin-2b" // anuncio-conjunto (Cinemática 16.5)
  | "cin-3" // veu
  | "cin-4" // monada
  | "ending-choice" // escolha dos 6 finais
  | "ending-played"; // ending escolhido e exibido

function TronoDemiurgoOrchestrator() {
  const setPlace = useGameStore((s) => s.setPlace);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const addLight = useSoulStore((s) => s.addLight);
  const addCentelha = useSoulStore((s) => s.addCentelha);
  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const playCinematic = useCinematicStore((s) => s.playCinematic);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const [stage, setStage] = useState<ClimaxStage>("approach");
  const [chosenEnding, setChosenEnding] = useState<EndingId | null>(null);

  useEffect(() => {
    setPlace("Trono do Demiurgo");
  }, [setPlace]);

  // Tecla F na aproximação dispara o abraço
  useEffect(() => {
    if (stage !== "approach") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      // Proximidade ao trono (z negativo, ~5m)
      const dx = player.position.x - 0;
      const dz = player.position.z - -4;
      if (Math.hypot(dx, dz) < 8) {
        setStage("embrace");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  // Encadeia cinemáticas 1→2→3→4 quando entra em "embrace"
  useEffect(() => {
    if (stage !== "embrace") return;
    if (audioEnabled) sophiaAudio.awakenChord();
    // Registra Demiurgo como Lendário
    recordAwakened({
      id: "demiurgo",
      name: "O Filho Cego",
      trueName: "Sabaoth · Demiurgo Restaurado",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(3.0);
    addCentelha("lembranca-profunda");

    const timer = setTimeout(() => {
      setStage("cin-1");
      playCinematic("demiurgo-cai");
      setMetaPhase("cinematic");
    }, 3500);
    return () => clearTimeout(timer);
  }, [
    stage,
    audioEnabled,
    addLight,
    addCentelha,
    recordAwakened,
    currentLifeIndex,
    playCinematic,
    setMetaPhase,
  ]);

  // Cinemáticas voltam ao game; aqui mudamos para a próxima etapa
  // ao detectar que a cinemática anterior terminou.
  const currentCinematic = useCinematicStore((s) => s.currentCinematic);
  useEffect(() => {
    if (currentCinematic !== null) return;
    // Cinemática terminou — avançar para próxima ou abrir endings
    if (stage === "cin-1") {
      setStage("cin-2");
      playCinematic("grande-revelacao");
      setMetaPhase("cinematic");
    } else if (stage === "cin-2") {
      setStage("cin-2b");
      playCinematic("anuncio-conjunto");
      setMetaPhase("cinematic");
    } else if (stage === "cin-2b") {
      setStage("cin-3");
      playCinematic("veu");
      setMetaPhase("cinematic");
    } else if (stage === "cin-3") {
      setStage("cin-4");
      playCinematic("monada");
      setMetaPhase("cinematic");
    } else if (stage === "cin-4") {
      setStage("ending-choice");
    }
  }, [currentCinematic, stage, playCinematic, setMetaPhase]);

  const handleEndingChosen = (id: EndingId) => {
    setChosenEnding(id);
    setStage("ending-played");
    // Após mostrar o ending, levar de volta ao título depois de alguns segundos
    setTimeout(() => {
      setMetaPhase("title");
    }, 8000);
  };

  const embraced = stage !== "approach";

  return (
    <>
      <TronoDemiurgoScene
        embraced={embraced}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {stage === "approach" && (
        <div className="trono-hint">
          <p>
            <em>
              "Não o ataques. Abraça-o. Diz-lhe: 'eu sei que tu não soubeste.'"
            </em>
          </p>
          <p className="trono-hint-keys">
            Pressiona <strong>F</strong> ao chegar perto do trono.
          </p>
        </div>
      )}
      {stage === "embrace" && (
        <div className="trono-embrace-overlay">
          <p>
            <em>Tu o abraças. Ele chora.</em>
          </p>
        </div>
      )}
      {stage === "ending-choice" && (
        <EndingChoice onChosen={handleEndingChosen} />
      )}
      {stage === "ending-played" && chosenEnding && (
        <div className="ending-played-overlay">
          <p className="ending-played-text">
            <em>
              "Tu escolheste — e fica bem assim. Eu nunca estive ausente."
            </em>
          </p>
          <p className="ending-played-credit">
            <em>
              Sophia · A Jornada do Despertar — autoria integral de Rebeca Alves Moreira
            </em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   TabernaculoDosCaidosOrchestrator — Sprint 23
   ---------------------------------------------------------
   Os 6 Anjos Caídos têm altares em círculo. Aproximação a
   menos de 2.5m + F dispara a cinemática-redenção daquele.
   Cada redenção: addLight(0.6) + addToAlignment(balance, 5).
   ========================================================= */

const CAIDO_TO_CINEMATIC: Record<CaidoId, Parameters<ReturnType<typeof useCinematicStore.getState>["playCinematic"]>[0]> = {
  asmodeus: "asmodeus-cai",
  lucifer: "lucifer-cai",
  belial: "belial-cai",
  azazel: "azazel-cai",
  semyaza: "semyaza-cai",
  leviata: "leviata-cai",
};

const CAIDO_TRUE_NAMES: Record<CaidoId, { name: string; trueName: string }> = {
  asmodeus: {
    name: "Asmodeus",
    trueName: "Asmodeus · Servo do Servir",
  },
  lucifer: {
    name: "Lúcifer",
    trueName: "Lúcifer · O Mais Brilhante que Lembrou",
  },
  belial: {
    name: "Belial",
    trueName: "Belial · A Gratidão Restaurada",
  },
  azazel: {
    name: "Azazel",
    trueName: "Azazel · Juiz Que Amou Primeiro",
  },
  semyaza: {
    name: "Semyaza",
    trueName: "Semyaza · Guardião da Verdade Aberta",
  },
  leviata: {
    name: "Leviatã",
    trueName: "Leviatã · A Serpente Desenrolada",
  },
};

function TabernaculoDosCaidosOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  // Snapshot de quais já foram redimidos (re-renderiza ao retornar)
  const redeemed: Record<CaidoId, boolean> = CAIDOS_ORDER.reduce(
    (acc, id) => {
      acc[id] = hasAwakened(`caido-${id}`);
      return acc;
    },
    {} as Record<CaidoId, boolean>,
  );

  useEffect(() => {
    setPlace("Tabernáculo dos Caídos");
  }, [setPlace]);

  // Tecla F: encontra o santuário mais próximo e dispara
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;

      let bestId: CaidoId | null = null;
      let bestDist = 2.8;
      for (const id of CAIDOS_ORDER) {
        if (hasAwakened(`caido-${id}`)) continue;
        const p = SHRINE_POSITIONS[id];
        const d = Math.hypot(
          player.position.x - p[0],
          player.position.z - p[2],
        );
        if (d < bestDist) {
          bestDist = d;
          bestId = id;
        }
      }
      if (!bestId) return;

      // Redime
      const info = CAIDO_TRUE_NAMES[bestId];
      recordAwakened({
        id: `caido-${bestId}`,
        name: info.name,
        trueName: info.trueName,
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(0.6);
      addToAlignment("balance", 5);
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic(CAIDO_TO_CINEMATIC[bestId!]);
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    hasAwakened,
    recordAwakened,
    addLight,
    addToAlignment,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  const remaining = CAIDOS_ORDER.filter((id) => !redeemed[id]).length;

  return (
    <>
      <TabernaculoDosCaidosScene
        redeemed={redeemed}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      <div className="caidos-hint">
        <p>
          <em>
            Aproxima-te de cada altar. Pressiona <strong>F</strong>. Não
            ataques — lembra-os.
          </em>
        </p>
        <p className="caidos-hint-count">
          {remaining > 0
            ? `${remaining} de 6 ainda dormem.`
            : "Os seis lembraram. Vai em paz."}
        </p>
      </div>
    </>
  );
}

/* =========================================================
   FeiraDosSistemasOrchestrator — Sprint 25
   ---------------------------------------------------------
   Cidade-arquetipo da Era da Informação. Por enquanto: cena
   explorável sem interação obrigatória (atmosfera + visão
   simbólica dos sistemas de drenagem modernos). Mecânicas
   futuras: confrontar "doppelgangers" dentro de cada edifício.
   ========================================================= */

function FeiraDosSistemasOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);

  useEffect(() => {
    setPlace("Feira dos Sistemas");
  }, [setPlace]);

  return (
    <>
      <FeiraDosSistemasScene
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
      />
      <HUD />
      <Cursor />
      <div className="feira-hint">
        <p>
          <em>
            Cinco torres em pentágono. Cada uma é uma forma de drenagem
            sem máscara. A sexta — a Casa-Espelhada — tu já conheceste.
          </em>
        </p>
      </div>
    </>
  );
}

/* =========================================================
   LabirintoDasErasOrchestrator — Sprint 26
   ---------------------------------------------------------
   10 espelhos-memória em corredor. Aproximação (< 2.5m) + F
   abre flashback overlay com a vinheta daquela era.
   Lembrar: +0.3 luz + addCentelha("lembranca-profunda") (1x).
   ========================================================= */

function LabirintoDasErasOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addCentelha = useSoulStore((s) => s.addCentelha);
  const hasCentelha = useSoulStore((s) => s.hasCentelha);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const [activeFlashback, setActiveFlashback] = useState<EraDescriptor | null>(
    null,
  );

  useEffect(() => {
    setPlace("Labirinto das Eras");
  }, [setPlace]);

  const remembered: Record<EraId, boolean> = ERAS.reduce(
    (acc, e) => {
      acc[e.id] = hasAwakened(`era-${e.id}`);
      return acc;
    },
    {} as Record<EraId, boolean>,
  );

  // Tecla F: encontra espelho mais próximo dentro do raio
  useEffect(() => {
    if (activeFlashback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;

      let best: EraDescriptor | null = null;
      let bestDist = 3.2;
      ERAS.forEach((era, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -16 + i * 4;
        const x = side * 5.5;
        const d = Math.hypot(player.position.x - x, player.position.z - z);
        if (d < bestDist) {
          bestDist = d;
          best = era;
        }
      });
      if (best) setActiveFlashback(best);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeFlashback]);

  const handleClose = () => {
    if (!activeFlashback) return;
    const era = activeFlashback;
    if (!hasAwakened(`era-${era.id}`)) {
      recordAwakened({
        id: `era-${era.id}`,
        name: era.title,
        trueName: undefined,
        isLegendary: false,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(0.3);
      if (!hasCentelha("lembranca-profunda")) {
        addCentelha("lembranca-profunda");
      }
      if (audioEnabled) sophiaAudio.chime(72, 1.4, 0.18);
    }
    setActiveFlashback(null);
  };

  const rememberedCount = Object.values(remembered).filter(Boolean).length;

  return (
    <>
      <LabirintoDasErasScene
        remembered={remembered}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      <div className="labirinto-hint">
        <p>
          <em>
            Aproxima-te de cada espelho. Pressiona <strong>F</strong>.
            Tua alma lembrará de uma das tuas vidas.
          </em>
        </p>
        <p className="labirinto-hint-count">
          {rememberedCount} de 10 lembradas.
        </p>
      </div>
      {activeFlashback && (
        <FlashbackOverlay era={activeFlashback} onClose={handleClose} />
      )}
    </>
  );
}

/* =========================================================
   GaleriaPrincipadosOrchestrator — Sprint 27
   ---------------------------------------------------------
   Corredor com 12 Principados. Aproximar-se a < 2.6m + segurar
   F por 4s contempla o Principado (silêncio + atenção). Soltar
   F ou afastar-se decai o progresso.
   Cada contemplação: +0.4 luz + +5 equilíbrio + registra Principado
   como "contemplado" via awakenedSleepers (id "principado-X").
   ========================================================= */

const CONTEMPLATION_DURATION_S = 4.0;
const CONTEMPLATION_RANGE = 2.6;

function GaleriaPrincipadosOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const contemplated: Record<PrincipadoId, boolean> = PRINCIPADOS_ORDER.reduce(
    (acc, id) => {
      acc[id] = hasAwakened(`principado-${id}`);
      return acc;
    },
    {} as Record<PrincipadoId, boolean>,
  );

  const [activeTarget, setActiveTarget] = useState<PrincipadoId | null>(null);
  const [progressSec, setProgressSec] = useState(0);
  const fKeyDownRef = useRef(false);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    setPlace("Galeria dos Principados");
  }, [setPlace]);

  // F-key down/up
  useEffect(() => {
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
  }, []);

  // Loop de contemplação
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const last = lastTickRef.current ?? now;
      const dt = Math.min(0.1, (now - last) / 1000);
      lastTickRef.current = now;

      const player = playerRefHolder.current?.current;
      if (!player) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Encontra Principado mais próximo (não contemplado ainda)
      let nearestId: PrincipadoId | null = null;
      let nearestDist = CONTEMPLATION_RANGE;
      for (const id of PRINCIPADOS_ORDER) {
        if (contemplated[id]) continue;
        const p = PRINCIPADO_POSITIONS[id];
        const d = Math.hypot(
          player.position.x - p[0],
          player.position.z - p[2],
        );
        if (d < nearestDist) {
          nearestDist = d;
          nearestId = id;
        }
      }

      if (fKeyDownRef.current && nearestId) {
        if (activeTarget !== nearestId) {
          setActiveTarget(nearestId);
          setProgressSec(0);
        } else {
          setProgressSec((s) => {
            const next = Math.min(CONTEMPLATION_DURATION_S, s + dt);
            if (next >= CONTEMPLATION_DURATION_S) {
              finishContemplation(nearestId!);
              return 0;
            }
            return next;
          });
        }
      } else {
        // Soltar F ou afastar → decay
        if (progressSec > 0) {
          setProgressSec((s) => Math.max(0, s - dt * 0.6));
        }
        if (!nearestId && activeTarget !== null) {
          setActiveTarget(null);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTarget, contemplated]);

  const finishContemplation = (id: PrincipadoId) => {
    recordAwakened({
      id: `principado-${id}`,
      name: principadoLabel(id),
      isLegendary: false,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(0.4);
    addToAlignment("balance", 5);
    if (audioEnabled) sophiaAudio.chime(70, 1.6, 0.18);
    setActiveTarget(null);
  };

  const progressNorm = progressSec / CONTEMPLATION_DURATION_S;
  const remaining = PRINCIPADOS_ORDER.filter(
    (id) => !contemplated[id],
  ).length;

  return (
    <>
      <GaleriaPrincipadosScene
        contemplated={contemplated}
        contemplationTarget={activeTarget}
        contemplationProgress={progressNorm}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {activeTarget && (
        <div className="principado-questao-overlay">
          <p className="principado-questao-text">
            <em>{PRINCIPADO_QUESTOES[activeTarget]}</em>
          </p>
          <div className="principado-progress-bar">
            <div
              className="principado-progress-fill"
              style={{ width: `${progressNorm * 100}%` }}
            />
          </div>
          <p className="principado-progress-time">
            {progressSec.toFixed(1)}s / {CONTEMPLATION_DURATION_S.toFixed(0)}s
            de silêncio
          </p>
        </div>
      )}
      {!activeTarget && remaining > 0 && (
        <div className="principado-hint">
          <p>
            <em>
              Aproxima-te de um Principado. Segura <strong>F</strong>{" "}
              em silêncio. A questão não pede resposta.
            </em>
          </p>
          <p className="principado-progress-time">
            {12 - remaining} de 12 contemplados.
          </p>
        </div>
      )}
    </>
  );
}

function principadoLabel(id: PrincipadoId): string {
  const map: Record<PrincipadoId, string> = {
    "sentinela-espelho": "Sentinela-Espelho",
    "capataz-cinto": "Capataz-Cinto",
    "vigia-vela": "Vigia-Vela",
    "censor-boca": "Censor-Boca",
    "coletor-imposto": "Coletor-Imposto",
    "porta-trancada": "Porta-Trancada",
    "lei-viva": "Lei-Viva",
    "estatua-vigia": "Estátua-Vigia",
    "boca-grande": "Boca-Grande",
    "boneca-corda": "Boneca-Corda",
    "saco-vazio": "Saco-Vazio",
    "mascara-cega": "Máscara-Cega",
  };
  return map[id];
}

/* =========================================================
   AgarthaOrchestrator — Sprint 60
   ---------------------------------------------------------
   Cidade intra-terrena. Rei do Mundo no centro. F perto dele
   abre cinemática "rei-do-mundo" e registra como Lendário.
   ========================================================= */

function AgarthaOrchestrator() {
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

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  useEffect(() => {
    setPlace("Agartha · O Reino Intra-Terreno");
  }, [setPlace]);

  const reiAwakened = hasAwakened("rei-do-mundo");

  useEffect(() => {
    if (reiAwakened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      // Rei está no centro (0,0,0) per cena
      const dist = Math.hypot(player.position.x, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "rei-do-mundo",
        name: "Rei do Mundo",
        trueName: "Guardião da Memória Pré-Adamita",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(1.2);
      if (!hasCentelha("fala-raiz")) {
        addCentelha("fala-raiz");
      }
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("rei-do-mundo");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    reiAwakened,
    recordAwakened,
    addLight,
    addCentelha,
    hasCentelha,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <AgarthaScene
        reiAwakened={reiAwakened}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!reiAwakened && (
        <div className="agartha-hint">
          <p>
            <em>
              Aproxima-te do Rei do Mundo. Pressiona <strong>F</strong>{" "}
              quando estiveres perto.
            </em>
          </p>
          <p className="agartha-sub">
            <em>"A trégua entre superfície e profundo está pronta para ser dita."</em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   SodomaOrchestrator — Sprint 61
   ---------------------------------------------------------
   Cidade do julgamento suspenso. Aproximação ao candelabro
   central + segurar F por 6s acende as 7 chamas e cancela
   o fogo de julgamento.
   ========================================================= */

const SODOMA_DURATION_S = 6.0;
const SODOMA_RANGE = 3.0;
const SODOMA_CANDELABRO = new THREE.Vector3(0, 0, 0);

function SodomaOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const alreadyInterceded = hasAwakened("sodoma-interedida");
  const [interceded, setInterceded] = useState(alreadyInterceded);
  const [progressSec, setProgressSec] = useState(0);
  const fKeyDownRef = useRef(false);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    setPlace("Sodoma · Cidade Suspensa");
  }, [setPlace]);

  useEffect(() => {
    if (interceded) return;
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
  }, [interceded]);

  useEffect(() => {
    if (interceded) return;
    let raf = 0;
    const tick = (now: number) => {
      const last = lastTickRef.current ?? now;
      const dt = Math.min(0.1, (now - last) / 1000);
      lastTickRef.current = now;

      const player = playerRefHolder.current?.current;
      let inRange = false;
      if (player) {
        const dx = player.position.x - SODOMA_CANDELABRO.x;
        const dz = player.position.z - SODOMA_CANDELABRO.z;
        inRange = Math.hypot(dx, dz) < SODOMA_RANGE;
      }

      if (fKeyDownRef.current && inRange) {
        setProgressSec((s) => {
          const next = Math.min(SODOMA_DURATION_S, s + dt);
          if (next >= SODOMA_DURATION_S) {
            finishIntercession();
          }
          return next;
        });
      } else if (!fKeyDownRef.current || !inRange) {
        setProgressSec((s) => Math.max(0, s - dt * 0.6));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interceded]);

  const finishIntercession = () => {
    setInterceded(true);
    setProgressSec(SODOMA_DURATION_S);

    recordAwakened({
      id: "sodoma-interedida",
      name: "Sodoma",
      trueName: "Cidade da Hospitalidade Restaurada",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.0);
    addToAlignment("balance", 12);
    if (audioEnabled) sophiaAudio.awakenChord();
    setTimeout(() => {
      playCinematic("sodoma-interedida");
      setMetaPhase("cinematic");
    }, 1500);
  };

  const progressNorm = progressSec / SODOMA_DURATION_S;
  const litCount = Math.floor(progressNorm * 7);

  return (
    <>
      <SodomaScene
        interceded={interceded}
        interceedingProgress={progressNorm}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!interceded && (
        <div className="sodoma-intercession-overlay">
          <p className="sodoma-intercession-text">
            <em>
              "Aproxima-te do candelabro de sete chamas. Segura{" "}
              <strong>F</strong> em silêncio. A Mônada espera quem
              espera com Ela."
            </em>
          </p>
          <div className="sodoma-progress-bar">
            <div
              className="sodoma-progress-fill"
              style={{ width: `${progressNorm * 100}%` }}
            />
          </div>
          <p className="sodoma-flame-count">
            {litCount} de 7 chamas acesas em luz.
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   ShamballaOrchestrator — Sprint 62
   ---------------------------------------------------------
   3 Sentinelas estáticas em triângulo. Aproximar < 2.2m de
   uma delas + F → marca aquela como contemplada. Após as 3,
   cinemática "triade-sentinela".
   ========================================================= */

const SHAMBALLA_RANGE = 2.3;

function ShamballaOrchestrator() {
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

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const alreadyDone = hasAwakened("triade-sentinela");
  const [contemplated, setContemplated] = useState<
    [boolean, boolean, boolean]
  >([alreadyDone, alreadyDone, alreadyDone]);
  const [focusedIndex, setFocusedIndex] = useState<0 | 1 | 2 | null>(null);

  useEffect(() => {
    setPlace("Shamballa · Fragmento do Pleroma");
  }, [setPlace]);

  // Posições da TríadeSentinela em triângulo de raio 1.9
  const POSITIONS: [number, number, number][] = [
    [0, 0, -1.9],
    [1.645, 0, 0.95],
    [-1.645, 0, 0.95],
  ];

  useEffect(() => {
    const tick = () => {
      const player = playerRefHolder.current?.current;
      if (!player) return;
      let best: 0 | 1 | 2 | null = null;
      let bestDist = SHAMBALLA_RANGE;
      for (let i = 0; i < 3; i++) {
        const p = POSITIONS[i];
        const d = Math.hypot(player.position.x - p[0], player.position.z - p[2]);
        if (d < bestDist) {
          bestDist = d;
          best = i as 0 | 1 | 2;
        }
      }
      setFocusedIndex(best);
    };
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (alreadyDone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      if (focusedIndex === null) return;
      if (contemplated[focusedIndex]) return;
      const next = [...contemplated] as [boolean, boolean, boolean];
      next[focusedIndex] = true;
      setContemplated(next);
      if (audioEnabled) sophiaAudio.chime(70, 1.4, 0.18);

      if (next.every(Boolean)) {
        recordAwakened({
          id: "triade-sentinela",
          name: "Tríade Sentinela",
          trueName: "Os Que Nunca Caíram",
          isLegendary: true,
          awakenedAt: Date.now(),
          awakenedInLife: currentLifeIndex,
        });
        addLight(1.5);
        if (!hasCentelha("memoria-do-pleroma")) {
          addCentelha("memoria-do-pleroma");
        }
        if (audioEnabled) sophiaAudio.awakenChord();
        setTimeout(() => {
          playCinematic("triade-sentinela");
          setMetaPhase("cinematic");
        }, 1500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    focusedIndex,
    contemplated,
    alreadyDone,
    audioEnabled,
    recordAwakened,
    addLight,
    addCentelha,
    hasCentelha,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  const doneCount = contemplated.filter(Boolean).length;

  return (
    <>
      <ShamballaScene
        contemplated={contemplated}
        focusedIndex={focusedIndex}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!alreadyDone && (
        <div className="shamballa-hint">
          <p>
            <em>
              Aproxima-te de cada Sentinela. Pressiona{" "}
              <strong>F</strong> em silêncio.
            </em>
          </p>
          <div className="shamballa-dots">
            {contemplated.map((c, i) => (
              <span
                key={i}
                className={`shamballa-dot ${c ? "lit" : ""}`}
              />
            ))}
          </div>
          <p className="shamballa-sub">{doneCount} de 3 contemplações.</p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   TelosOrchestrator — Sprint 63
   ========================================================= */

function TelosOrchestrator() {
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

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const adamaAwakened = hasAwakened("adama-de-telos");

  useEffect(() => {
    setPlace("Telos · Refúgio Lemuriano");
  }, [setPlace]);

  useEffect(() => {
    if (adamaAwakened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      const dist = Math.hypot(player.position.x, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "adama-de-telos",
        name: "Adama",
        trueName: "Sacerdote do Refúgio Lemuriano",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(1.2);
      if (!hasCentelha("toque-compassivo")) {
        addCentelha("toque-compassivo");
      } else {
        addToAlignment("balance", 8);
      }
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("adama-de-telos");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    adamaAwakened,
    recordAwakened,
    addLight,
    addCentelha,
    hasCentelha,
    addToAlignment,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <TelosScene
        adamaAwakened={adamaAwakened}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!adamaAwakened && (
        <div className="telos-hint">
          <p>
            <em>
              Aproxima-te de Adama. Pressiona <strong>F</strong>.
              Lemúria canta debaixo da terra.
            </em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   GomorraOrchestrator — Sprint 64
   ---------------------------------------------------------
   5 estátuas-de-posse em pentágono. Aproximação + F libera
   cada uma. Após as 5: cinemática "gomorra-redimida".
   ========================================================= */

const GOMORRA_RANGE = 2.8;

function GomorraOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const alreadyDone = hasAwakened("gomorra-maos-abertas");
  const [released, setReleased] = useState<
    [boolean, boolean, boolean, boolean, boolean]
  >([alreadyDone, alreadyDone, alreadyDone, alreadyDone, alreadyDone]);

  useEffect(() => {
    setPlace("Gomorra · Cidade Suspensa");
  }, [setPlace]);

  useEffect(() => {
    if (alreadyDone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      let bestIdx = -1;
      let bestDist = GOMORRA_RANGE;
      for (let i = 0; i < STATUE_POSITIONS.length; i++) {
        if (released[i]) continue;
        const p = STATUE_POSITIONS[i];
        const d = Math.hypot(
          player.position.x - p[0],
          player.position.z - p[2],
        );
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      if (bestIdx < 0) return;

      const next = [...released] as [boolean, boolean, boolean, boolean, boolean];
      next[bestIdx] = true;
      setReleased(next);
      if (audioEnabled) sophiaAudio.chime(68, 1.4, 0.18);

      if (next.every(Boolean)) {
        recordAwakened({
          id: "gomorra-maos-abertas",
          name: "Gomorra",
          trueName: "Cidade das Mãos Abertas",
          isLegendary: true,
          awakenedAt: Date.now(),
          awakenedInLife: currentLifeIndex,
        });
        addLight(1.2);
        addToAlignment("balance", 12);
        if (audioEnabled) sophiaAudio.awakenChord();
        setTimeout(() => {
          playCinematic("gomorra-redimida");
          setMetaPhase("cinematic");
        }, 1500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    alreadyDone,
    released,
    audioEnabled,
    recordAwakened,
    addLight,
    addToAlignment,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  const doneCount = released.filter(Boolean).length;

  return (
    <>
      <GomorraScene
        released={released}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!alreadyDone && (
        <div className="gomorra-hint">
          <p>
            <em>
              Aproxima-te de cada estátua. Pressiona{" "}
              <strong>F</strong> para abrir as mãos crispadas.
            </em>
          </p>
          <p className="gomorra-statue-count">
            {doneCount} de 5 mãos abertas.
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   BabelOrchestrator — Sprint 65
   ---------------------------------------------------------
   4 povos em volta da torre. Aproximação + F entre dois povos
   acende uma ponte. Após as 4 pontes: cinemática.
   Requisito: Centelha fala-raiz.
   ========================================================= */

const BABEL_RANGE = 4.0;

function BabelOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const hasCentelha = useSoulStore((s) => s.hasCentelha);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const alreadyDone = hasAwakened("babel-pontes-restauradas");
  const canTranslate = hasCentelha("fala-raiz");
  const [bridges, setBridges] = useState<
    [boolean, boolean, boolean, boolean]
  >([alreadyDone, alreadyDone, alreadyDone, alreadyDone]);

  useEffect(() => {
    setPlace("Babel · Torre Inacabada");
  }, [setPlace]);

  useEffect(() => {
    if (alreadyDone || !canTranslate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      // Encontra o par de povos mais próximo (entre povos consecutivos)
      let bestIdx = -1;
      let bestDist = BABEL_RANGE;
      for (let i = 0; i < POVO_POSITIONS.length; i++) {
        if (bridges[i]) continue;
        const a = POVO_POSITIONS[i];
        const b = POVO_POSITIONS[(i + 1) % POVO_POSITIONS.length];
        const midX = (a[0] + b[0]) / 2;
        const midZ = (a[2] + b[2]) / 2;
        const d = Math.hypot(player.position.x - midX, player.position.z - midZ);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      if (bestIdx < 0) return;

      const next = [...bridges] as [boolean, boolean, boolean, boolean];
      next[bestIdx] = true;
      setBridges(next);
      if (audioEnabled) sophiaAudio.chime(72, 1.4, 0.18);

      if (next.every(Boolean)) {
        recordAwakened({
          id: "babel-pontes-restauradas",
          name: "Babel",
          trueName: "Cidade das Pontes Restauradas",
          isLegendary: true,
          awakenedAt: Date.now(),
          awakenedInLife: currentLifeIndex,
        });
        addLight(1.2);
        addToAlignment("balance", 12);
        if (audioEnabled) sophiaAudio.awakenChord();
        setTimeout(() => {
          playCinematic("babel-redimida");
          setMetaPhase("cinematic");
        }, 1500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    alreadyDone,
    canTranslate,
    bridges,
    audioEnabled,
    recordAwakened,
    addLight,
    addToAlignment,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  const doneCount = bridges.filter(Boolean).length;

  return (
    <>
      <BabelScene
        bridges={bridges}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!alreadyDone && (
        <div className={`babel-hint ${!canTranslate ? "babel-locked" : ""}`}>
          <p>
            <em>
              {canTranslate
                ? "Caminha entre dois povos. Pressiona F para traduzir."
                : "A torre te chama, mas tu ainda não tens a Fala-Raiz. Volta após despertar Harmas em Mu — ou Agartha."}
            </em>
          </p>
          {canTranslate && (
            <p className="babel-bridge-count">
              {doneCount} de 4 pontes acesas.
            </p>
          )}
        </div>
      )}
    </>
  );
}

/* =========================================================
   PleiadianosOrchestrator — Sprint 66
   ========================================================= */

function PleiadianosOrchestrator() {
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

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const sacerdotisaAwakened = hasAwakened("sacerdotisa-pleiadiana");

  useEffect(() => {
    setPlace("Pleiadianos · Sala dos Sete Pilares");
  }, [setPlace]);

  useEffect(() => {
    if (sacerdotisaAwakened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      const dist = Math.hypot(player.position.x, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "sacerdotisa-pleiadiana",
        name: "Sacerdotisa Pleiadiana",
        trueName: "Anjo Curador de Alcione",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(1.3);
      if (!hasCentelha("toque-compassivo")) {
        addCentelha("toque-compassivo");
      } else {
        addToAlignment("balance", 10);
      }
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("sacerdotisa-pleiadiana");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    sacerdotisaAwakened,
    recordAwakened,
    addLight,
    addCentelha,
    hasCentelha,
    addToAlignment,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <PleiadianosScene
        sacerdotisaAwakened={sacerdotisaAwakened}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!sacerdotisaAwakened && (
        <div className="pleiadianos-hint">
          <p>
            <em>
              Aproxima-te da Sacerdotisa. Pressiona <strong>F</strong>.
              As sete estrelas escutaram.
            </em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   ArcturianosOrchestrator — Sprint 67
   ---------------------------------------------------------
   Acessível apenas após primeira reencarnação (pastLives >= 1).
   ========================================================= */

function ArcturianosOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const pastLives = useSoulStore((s) => s.pastLives);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);

  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );

  const guiaAwakened = hasAwakened("guia-arcturiano");
  const canEnter = pastLives.length >= 1;

  useEffect(() => {
    setPlace("Arcturianos · Bardo Lúcido");
  }, [setPlace]);

  useEffect(() => {
    if (guiaAwakened || !canEnter) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      // Líder está na posição (10*cos(0), 0, 10*sin(0)) = (10, 0, 0)
      const dist = Math.hypot(player.position.x - 10, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "guia-arcturiano",
        name: "Guia Arcturiano",
        trueName: "Querubim do Bardo Lúcido",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(1.0);
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("guia-arcturiano");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    guiaAwakened,
    canEnter,
    recordAwakened,
    addLight,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <ArcturianosScene
        guiaAwakened={guiaAwakened}
        canEnter={canEnter}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!guiaAwakened && (
        <div className={`arcturianos-hint ${!canEnter ? "locked" : ""}`}>
          <p>
            <em>
              {canEnter
                ? "Aproxima-te do Guia (o líder, à frente). Pressiona F."
                : "Ainda não atravessaste. Volta após a tua primeira morte na Pedra das Vidas."}
            </em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   ErksOrchestrator — Sprint 68
   ---------------------------------------------------------
   Mestre Andino no nível médio (y=8.4). Aproximar XZ < 4 + F.
   ========================================================= */

function ErksOrchestrator() {
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
  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );
  const mestreAwakened = hasAwakened("mestre-andino");

  useEffect(() => {
    setPlace("Erks · Cidade Andina");
  }, [setPlace]);

  useEffect(() => {
    if (mestreAwakened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      const dist = Math.hypot(player.position.x, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "mestre-andino",
        name: "Mestre Andino",
        trueName: "O Anciã do Portal Cordilheirano",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(1.2);
      if (!hasCentelha("lembranca-profunda")) {
        addCentelha("lembranca-profunda");
      } else {
        addToAlignment("balance", 8);
      }
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("mestre-andino");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    mestreAwakened,
    recordAwakened,
    addLight,
    addCentelha,
    hasCentelha,
    addToAlignment,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <ErksScene
        mestreAwakened={mestreAwakened}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!mestreAwakened && (
        <div className="erks-hint">
          <p>
            <em>
              Sobe ao nível médio. Aproxima-te do Mestre Andino.
              Pressiona <strong>F</strong>.
            </em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   SiriacosOrchestrator — Sprint 69
   ========================================================= */

function SiriacosOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );
  const escribaAwakened = hasAwakened("escriba-siriaco");

  useEffect(() => {
    setPlace("Siríacos · Câmara da Memória Cósmica");
  }, [setPlace]);

  useEffect(() => {
    if (escribaAwakened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      const dist = Math.hypot(player.position.x, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "escriba-siriaco",
        name: "Escriba Siríaco",
        trueName: "Anjo Trono · Memória de Todas as Eras",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(1.0);
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("escriba-siriaco");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    escribaAwakened,
    recordAwakened,
    addLight,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <SiriacosScene
        escribaAwakened={escribaAwakened}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!escribaAwakened && (
        <div className="siriacos-hint">
          <p>
            <em>
              Aproxima-te do Cristal-Memória. Pressiona{" "}
              <strong>F</strong>. O Escriba ouvirá com olhos cerrados.
            </em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   AdamaOrchestrator — Sprint 70
   ---------------------------------------------------------
   Intercessão pela Pedra-Mãe: segurar F por 5s na proximidade.
   ========================================================= */

const ADAMA_DURATION_S = 5.0;
const ADAMA_RANGE = 3.0;

function AdamaOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );
  const already = hasAwakened("adama-tocou-terra");
  const [interceded, setInterceded] = useState(already);
  const [progressSec, setProgressSec] = useState(0);
  const fKeyDownRef = useRef(false);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    setPlace("Adamá · Cidade Aérea");
  }, [setPlace]);

  useEffect(() => {
    if (interceded) return;
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
  }, [interceded]);

  useEffect(() => {
    if (interceded) return;
    let raf = 0;
    const tick = (now: number) => {
      const last = lastTickRef.current ?? now;
      const dt = Math.min(0.1, (now - last) / 1000);
      lastTickRef.current = now;
      const player = playerRefHolder.current?.current;
      let inRange = false;
      if (player) {
        const d = Math.hypot(player.position.x, player.position.z);
        inRange = d < ADAMA_RANGE;
      }
      if (fKeyDownRef.current && inRange) {
        setProgressSec((s) => {
          const next = Math.min(ADAMA_DURATION_S, s + dt);
          if (next >= ADAMA_DURATION_S) finish();
          return next;
        });
      } else {
        setProgressSec((s) => Math.max(0, s - dt * 0.6));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interceded]);

  const finish = () => {
    setInterceded(true);
    setProgressSec(ADAMA_DURATION_S);
    recordAwakened({
      id: "adama-tocou-terra",
      name: "Adamá",
      trueName: "Cidade Que Tocou a Terra",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.0);
    addToAlignment("balance", 12);
    if (audioEnabled) sophiaAudio.awakenChord();
    setTimeout(() => {
      playCinematic("adama-redimida");
      setMetaPhase("cinematic");
    }, 1500);
  };

  const progressNorm = progressSec / ADAMA_DURATION_S;

  return (
    <>
      <AdamaScene
        interceded={interceded}
        descentProgress={progressNorm}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!interceded && (
        <div className="adama-intercession-overlay">
          <p>
            <em>
              Aproxima-te da Pedra-Mãe. Segura <strong>F</strong> em
              silêncio. A cidade descerá.
            </em>
          </p>
          <div className="adama-progress-bar">
            <div
              className="adama-progress-fill"
              style={{ width: `${progressNorm * 100}%` }}
            />
          </div>
          <p className="adama-descent-count">
            {progressSec.toFixed(1)}s / {ADAMA_DURATION_S.toFixed(0)}s
            de toque na terra.
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   TzeboimOrchestrator — Sprint 71
   ---------------------------------------------------------
   10 espelhos quebram automaticamente ao passar perto (< 1.8m).
   ========================================================= */

const MIRROR_BREAK_RANGE = 1.8;

function TzeboimOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );
  const already = hasAwakened("tzeboim-rostos-devolvidos");
  const [broken, setBroken] = useState<boolean[]>(
    MIRROR_POSITIONS.map(() => already),
  );

  useEffect(() => {
    setPlace("Tzeboim · Cidade-Espelho");
  }, [setPlace]);

  useEffect(() => {
    if (already) return;
    let raf = 0;
    const tick = () => {
      const player = playerRefHolder.current?.current;
      if (player) {
        let changed = false;
        const next = [...broken];
        for (let i = 0; i < MIRROR_POSITIONS.length; i++) {
          if (next[i]) continue;
          const m = MIRROR_POSITIONS[i];
          const d = Math.hypot(
            player.position.x - m.pos[0],
            player.position.z - m.pos[2],
          );
          if (d < MIRROR_BREAK_RANGE) {
            next[i] = true;
            changed = true;
            if (audioEnabled) sophiaAudio.chime(68, 1.4, 0.16);
          }
        }
        if (changed) {
          setBroken(next);
          if (next.every(Boolean)) {
            recordAwakened({
              id: "tzeboim-rostos-devolvidos",
              name: "Tzeboim",
              trueName: "Cidade dos Rostos Devolvidos",
              isLegendary: true,
              awakenedAt: Date.now(),
              awakenedInLife: currentLifeIndex,
            });
            addLight(1.2);
            addToAlignment("balance", 12);
            if (audioEnabled) sophiaAudio.awakenChord();
            setTimeout(() => {
              playCinematic("tzeboim-redimida");
              setMetaPhase("cinematic");
            }, 1500);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [already, broken]);

  const doneCount = broken.filter(Boolean).length;

  return (
    <>
      <TzeboimScene
        broken={broken}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!already && (
        <div
          className={`tzeboim-hint ${broken.every(Boolean) ? "tzeboim-redeemed" : ""}`}
        >
          <p>
            <em>
              Caminha entre os espelhos. Eles quebram quando tu passas.
              Cada quebrar é um rosto devolvido.
            </em>
          </p>
          <p className="tzeboim-mirror-count">{doneCount} de 10 espelhos caídos.</p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   BelaOrchestrator — Sprint 72
   ---------------------------------------------------------
   Encontro com Loth-da-Memória. Sem intercessão.
   ========================================================= */

function BelaOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );
  const lothMet = hasAwakened("loth-da-memoria");

  useEffect(() => {
    setPlace("Bela · A Cidade Que Foi Salva");
  }, [setPlace]);

  useEffect(() => {
    if (lothMet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      const dist = Math.hypot(player.position.x, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "loth-da-memoria",
        name: "Loth-da-Memória",
        trueName: "O Que Recebeu o Estrangeiro",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(0.8);
      addToAlignment("balance", 8);
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("loth-de-bela");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    lothMet,
    recordAwakened,
    addLight,
    addToAlignment,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <BelaScene
        lothMet={lothMet}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!lothMet && (
        <div className="bela-hint">
          <p>
            <em>
              Aproxima-te de Loth-da-Memória, sentado no degrau.
              Pressiona <strong>F</strong>.
            </em>
          </p>
        </div>
      )}
    </>
  );
}

/* =========================================================
   NiniveOrchestrator — Sprint 73
   ========================================================= */

function NiniveOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  const recordAwakened = useSoulStore((s) => s.recordAwakened);
  const addLight = useSoulStore((s) => s.addLight);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const playCinematic = useCinematicStore((s) => s.playCinematic);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);

  const playerRefHolder = useRef<React.RefObject<THREE.Group | null> | null>(
    null,
  );
  const jonasMet = hasAwakened("jonas-da-memoria");

  useEffect(() => {
    setPlace("Nínive · A Cidade Que Se Lembrou");
  }, [setPlace]);

  useEffect(() => {
    if (jonasMet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      const player = playerRefHolder.current?.current;
      if (!player) return;
      const dist = Math.hypot(player.position.x, player.position.z);
      if (dist > 4) return;

      recordAwakened({
        id: "jonas-da-memoria",
        name: "Jonas-da-Memória",
        trueName: "O Que Relutou e Voltou",
        isLegendary: true,
        awakenedAt: Date.now(),
        awakenedInLife: currentLifeIndex,
      });
      addLight(0.8);
      addToAlignment("balance", 10);
      if (audioEnabled) sophiaAudio.awakenChord();
      setTimeout(() => {
        playCinematic("jonas-de-ninive");
        setMetaPhase("cinematic");
      }, 1200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    jonasMet,
    recordAwakened,
    addLight,
    addToAlignment,
    audioEnabled,
    playCinematic,
    setMetaPhase,
    currentLifeIndex,
  ]);

  return (
    <>
      <NiniveScene
        jonasMet={jonasMet}
        onReturnToMar={() => setCurrentScene("mar-de-cristal")}
        onPlayerRef={(ref) => {
          playerRefHolder.current = ref;
        }}
      />
      <HUD />
      <Cursor />
      {!jonasMet && (
        <div className="ninive-hint">
          <p>
            <em>
              Aproxima-te de Jonas-da-Memória. Pressiona{" "}
              <strong>F</strong>. Nínive lembrou primeiro.
            </em>
          </p>
        </div>
      )}
    </>
  );
}

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

  // Par Sizígico (Sprint 29): aparece com 3+ Centelhas
  const centelhasCount = useSoulStore((s) => s.centelhas.size);
  const parRecognized = hasAwakened("par-sizigico");
  const showPar = centelhasCount >= 3;
  const [showSizigia, setShowSizigia] = useState(false);
  const PAR_POS = useMemo(() => new THREE.Vector3(0, 0, -8), []);
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

  /* ---- Par Sizígico: F-key abre o reconhecimento ---- */
  useEffect(() => {
    if (!showPar || parRecognized || showSizigia) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyF") return;
      // Para evitar conflito com outros F-listeners da cena,
      // só responde se nenhum mini-game/diálogo estiver ativo
      if (
        phase === "awakening" ||
        estranhoAwakenLoop ||
        phase === "approach-elder" ||
        phase === "whisper-arrives" ||
        phase === "elder-awake"
      ) {
        return;
      }
      setShowSizigia(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPar, parRecognized, showSizigia, phase, estranhoAwakenLoop]);

  const handleSizigiaRecognized = () => {
    setShowSizigia(false);
    recordAwakened({
      id: "par-sizigico",
      name: "Par Sizígico",
      trueName: "Sizígia · Companheiro do Pleroma",
      isLegendary: true,
      awakenedAt: Date.now(),
      awakenedInLife: currentLifeIndex,
    });
    addLight(1.0);
    if (audioEnabled) sophiaAudio.awakenChord();
  };

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
        showPar={showPar}
        parPos={PAR_POS}
        parRecognized={parRecognized}
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
      {showSizigia && (
        <SizigiaRecognition onComplete={handleSizigiaRecognized} />
      )}
    </>
  );
}
