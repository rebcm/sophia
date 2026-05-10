import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { sophiaAudio } from "../audio/SophiaAudio";

/* =========================================================
   DialogBox — caixa de diálogo com efeito typewriter
   ---------------------------------------------------------
   Aparece quando state.dialog não é null. Espaço/Enter
   acelera ou avança.
   ========================================================= */

interface DialogBoxProps {
  /** Chamado quando o jogador pressiona Espaço para avançar. */
  onAdvance?: () => void;
}

export function DialogBox({ onAdvance }: DialogBoxProps) {
  const dialog = useGameStore((s) => s.dialog);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const [shown, setShown] = useState("");
  const charIdx = useRef(0);

  useEffect(() => {
    if (!dialog) {
      setShown("");
      charIdx.current = 0;
      return;
    }
    setShown("");
    charIdx.current = 0;
    let lastChime = 0;
    const interval = setInterval(() => {
      charIdx.current += 1;
      const next = dialog.text.slice(0, charIdx.current);
      setShown(next);

      // bip sutil a cada 3-4 caracteres
      if (audioEnabled && charIdx.current - lastChime >= 4) {
        sophiaAudio.whisperBlip();
        lastChime = charIdx.current;
      }

      if (charIdx.current >= dialog.text.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [dialog, audioEnabled]);

  // Espaço/Enter para avançar
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        // Se ainda não mostrou tudo, completa
        if (charIdx.current < dialog.text.length) {
          setShown(dialog.text);
          charIdx.current = dialog.text.length;
          return;
        }
        onAdvance?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, onAdvance]);

  if (!dialog) return null;

  const complete = shown.length >= dialog.text.length;

  return (
    <div className="dialog">
      <div className="speaker">{dialog.speaker}</div>
      <div className="text">{shown}</div>
      {complete && (
        <div className="next">
          {dialog.hint ?? "espaço para continuar"}
        </div>
      )}
    </div>
  );
}
