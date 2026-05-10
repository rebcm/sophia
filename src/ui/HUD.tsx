import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";

/* =========================================================
   HUD — interface mínima do jogo
   ---------------------------------------------------------
   Compass (lugar) · Light meter · Hint contextual · Toast
   ========================================================= */

export function HUD() {
  const phase = useGameStore((s) => s.phase);
  const light = useGameStore((s) => s.light);
  const place = useGameStore((s) => s.place);
  const toast = useGameStore((s) => s.toast);
  const hideToast = useGameStore((s) => s.hideToast);

  // Light percent: 0..7 → 4..100
  const pct = Math.min(100, 4 + (light / 7) * 96);

  // Auto-hide do toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => hideToast(), 4200);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  // Hint contextual
  const hint = useHint(phase);

  if (phase === "intro") return null;

  return (
    <div className="hud">
      <div className="compass">
        Você está em
        <div className="place">{place}</div>
      </div>

      <div
        className="light-meter"
        style={{ ["--light-pct" as string]: `${pct}%` }}
      >
        <div className="label">Luz Interior · {light.toFixed(1)}</div>
        <div className="bar" />
      </div>

      {hint && <div className="hint">{hint}</div>}

      {toast && (
        <div className="awakened-toast" key={toast.name}>
          {toast.title}
          <span className="name">{toast.name}</span>
        </div>
      )}
    </div>
  );
}

function useHint(phase: string) {
  const [hint, setHint] = useState<React.ReactNode | null>(null);
  useEffect(() => {
    const h: Record<string, React.ReactNode> = {
      "explore": (
        <>
          Caminhe até a árvore antiga · <kbd>WASD</kbd> para mover · <kbd>mouse</kbd> para olhar
        </>
      ),
      "approach-elder": (
        <>
          Aproxime-se mais · <kbd>F</kbd> para tocar com a luz
        </>
      ),
      "free-roam": (
        <>
          Continue explorando o Jardim · <kbd>WASD</kbd> mover · <kbd>Esc</kbd> liberar mouse
        </>
      ),
    };
    setHint(h[phase] ?? null);
  }, [phase]);
  return hint;
}
