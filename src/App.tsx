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
import { HUD } from "./ui/HUD";
import { DialogBox } from "./ui/DialogBox";
import { AwakeningRing } from "./ui/AwakeningRing";
import { Cursor } from "./ui/Cursor";
import { TitleScreen, startFreshSession } from "./ui/TitleScreen";
import { CharacterCreation } from "./ui/CharacterCreation";
import { CinematicPlayer } from "./ui/CinematicPlayer";

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
  return <GameOrchestrator />;
}

/* =========================================================
   GameOrchestrator — orquestrador do gameplay 3D
   ---------------------------------------------------------
   Roteia entre cenas baseado em characterStore.currentScene.
   ========================================================= */

function GameOrchestrator() {
  const currentScene = useCharacterStore((s) => s.currentScene);
  if (currentScene === "mar-de-cristal") return <MarDeCristalOrchestrator />;
  return <JardimOrchestrator />;
}

/* =========================================================
   MarDeCristalOrchestrator
   ========================================================= */

function MarDeCristalOrchestrator() {
  const setCurrentScene = useCharacterStore((s) => s.setCurrentScene);
  const setPlace = useGameStore((s) => s.setPlace);

  useEffect(() => {
    setPlace("Mar de Cristal");
  }, [setPlace]);

  const handlePortalEnter = (destino: MarDestino) => {
    if (destino === "jardim-dos-ecos") {
      setCurrentScene("jardim-dos-ecos");
    } else if (destino === "ratanaba") {
      // Ratanabá ainda não implementada — placeholder
      // Por enquanto não faz nada (portal está enabled=false)
    }
  };

  return (
    <>
      <MarDeCristalScene onPortalEnter={handlePortalEnter} />
      <HUD />
      <Cursor />
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

  /* ---- Cleanup ---- */
  useEffect(() => {
    return () => {
      if (awakeningRaf.current !== null)
        cancelAnimationFrame(awakeningRaf.current);
    };
  }, []);

  const goToMar = () => setCurrentScene("mar-de-cristal");

  return (
    <>
      <GardenScene
        elderPos={ELDER_POS}
        onApproachElder={handleApproach}
        showExitPortal={phase === "free-roam"}
        onExitToMar={goToMar}
      />
      <HUD />
      <DialogBox onAdvance={handleAdvance} />
      <AwakeningRing
        hits={awakeningState.hits}
        required={awakeningState.required}
      />
      <Cursor />
    </>
  );
}
