import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { useSoulStore } from "../state/soulStore";
import {
  computeCentelhaPhase,
  phaseToHudLabel,
} from "../systems/CentelhaController";

/* =========================================================
   HUD — interface mínima do jogo
   ---------------------------------------------------------
   Compass (lugar) · Light meter · Hint contextual · Toast
   + indicador da fase atual da Centelha
   ========================================================= */

export function HUD() {
  const phase = useGameStore((s) => s.phase);
  const metaPhase = useGameStore((s) => s.metaPhase);
  const place = useGameStore((s) => s.place);
  const toast = useGameStore((s) => s.toast);
  const hideToast = useGameStore((s) => s.hideToast);

  const light = useSoulStore((s) => s.light);
  const centelhasCount = useSoulStore((s) => s.centelhas.size);

  // Light percent: 0..9 → 4..100
  const pct = Math.min(100, 4 + (light / 9) * 96);

  const centelhaPhase = computeCentelhaPhase({ light, centelhasCount });
  const centelhaLabel = phaseToHudLabel(centelhaPhase);

  // Auto-hide do toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => hideToast(), 4200);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  // Hint contextual
  const hint = useHint(phase);

  // Esconde HUD se não está em gameplay
  if (metaPhase !== "game" || phase === "intro") return null;

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
        <div className="label">
          Luz Interior · {light.toFixed(1)} · {centelhaLabel}
        </div>
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
