import { useEffect, useState } from "react";
import type { EraDescriptor } from "../scenes/LabirintoDasErasScene";

/* =========================================================
   <FlashbackOverlay /> — vinheta de vida passada
   ---------------------------------------------------------
   Cobre a tela com cor da era + título + vinheta narrativa.
   Após 3s mostra botão "lembrei". Sair: callback onClose.
   ========================================================= */

interface FlashbackOverlayProps {
  era: EraDescriptor;
  onClose: () => void;
}

export function FlashbackOverlay({ era, onClose }: FlashbackOverlayProps) {
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCanDismiss(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="flashback-overlay"
      style={
        {
          ["--flashback-tint" as string]: era.tint,
        } as React.CSSProperties
      }
    >
      <div className="flashback-frame">
        <p className="flashback-period">{era.period}</p>
        <h2 className="flashback-title">{era.title}</h2>
        <p className="flashback-vignette">
          <em>{era.vignette}</em>
        </p>
        <button
          className="flashback-close"
          disabled={!canDismiss}
          onClick={onClose}
        >
          {canDismiss ? "Lembrei" : "..."}
        </button>
      </div>
    </div>
  );
}
