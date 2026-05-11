import { useEffect, useState } from "react";
import { SAVE_EVENT } from "../systems/SaveSystem";

/* =========================================================
   <SaveIndicator /> — Sprint 47
   ---------------------------------------------------------
   Pulso muito sutil no canto da tela quando o auto-save grava
   o estado. Aparece por 1.4s e desaparece.
   ========================================================= */

export function SaveIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      setVisible(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 1400);
    };
    window.addEventListener(SAVE_EVENT, handler);
    return () => {
      window.removeEventListener(SAVE_EVENT, handler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;
  return (
    <div className="save-indicator" aria-hidden>
      <span className="save-dot" />
      <span className="save-label">guardando</span>
    </div>
  );
}
