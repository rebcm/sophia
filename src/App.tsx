import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useGameStore } from "./state/gameStore";
import { sophiaAudio } from "./audio/SophiaAudio";

import { GardenScene } from "./scenes/GardenScene";
import { IntroOverlay } from "./ui/IntroOverlay";
import { HUD } from "./ui/HUD";
import { DialogBox } from "./ui/DialogBox";
import { AwakeningRing } from "./ui/AwakeningRing";
import { Cursor } from "./ui/Cursor";

import {
  introDialog,
  approachElderDialog,
  elderAwakeDialog,
} from "./dialog/script";
import { createAwakening } from "./systems/AwakeningController";

/* =========================================================
   App — orquestra: cena + UI + sequência narrativa do MVP
   ---------------------------------------------------------
   Fluxo:
     intro → awaken → whisper-arrives (introDialog)
       → explore → approach-elder (approachElderDialog)
       → awakening → elder-awake (elderAwakeDialog)
       → free-roam
   ========================================================= */

const ELDER_POS = new THREE.Vector3(12, 0, -6);

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const setDialog = useGameStore((s) => s.setDialog);
  const addLight = useGameStore((s) => s.addLight);
  const awaken = useGameStore((s) => s.awaken);
  const audioEnabled = useGameStore((s) => s.audioEnabled);

  // dialog index local para cada beat
  const [dialogIdx, setDialogIdx] = useState(0);

  /* ---- Awakening mini-game ---- */
  const awakeningCtrl = useMemo(() => createAwakening({ required: 4, period: 1.5 }), []);
  const [awakeningState, setAwakeningState] = useState({
    hits: 0,
    required: 4,
  });
  const awakeningRaf = useRef<number | null>(null);
  const elderName = "Velho do Jardim";

  /* ---------------------------------------------------------
     Sequência narrativa
     --------------------------------------------------------- */

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
      // fim do diálogo de chegada — libera exploração
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
      // libera o despertar
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
        // sucesso!
        finishAwakening();
        return;
      }
      awakeningRaf.current = requestAnimationFrame(tick);
    };
    awakeningRaf.current = requestAnimationFrame(tick);
  };

  const finishAwakening = () => {
    if (awakeningRaf.current !== null) cancelAnimationFrame(awakeningRaf.current);
    awakeningRaf.current = null;
    awaken("velho-do-jardim", elderName);
    addLight(0.8);
    if (audioEnabled) sophiaAudio.awakenChord();
    // pequena pausa, depois diálogo do Velho
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
      if (awakeningRaf.current !== null) cancelAnimationFrame(awakeningRaf.current);
    };
  }, []);

  return (
    <>
      <GardenScene elderPos={ELDER_POS} onApproachElder={handleApproach} />
      <HUD />
      <DialogBox onAdvance={handleAdvance} />
      <AwakeningRing
        hits={awakeningState.hits}
        required={awakeningState.required}
      />
      <IntroOverlay />
      <Cursor />
    </>
  );
}
