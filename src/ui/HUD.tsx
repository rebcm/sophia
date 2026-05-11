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
  const toggleCodex = useGameStore((s) => s.toggleCodex);
  const olharLucidoActive = useGameStore((s) => s.olharLucidoActive);
  const toggleOlharLucido = useGameStore((s) => s.toggleOlharLucido);
  const dailyPractice = useGameStore((s) => s.dailyPractice);

  const light = useSoulStore((s) => s.light);
  const centelhasCount = useSoulStore((s) => s.centelhas.size);
  const alignment = useSoulStore((s) => s.alignment);

  // Light percent: 0..9 → 4..100
  const pct = Math.min(100, 4 + (light / 9) * 96);

  const centelhaPhase = computeCentelhaPhase({ light, centelhasCount });
  const centelhaLabel = phaseToHudLabel(centelhaPhase);

  // Dominant alignment for HUD chip
  const dominantAlignment = pickDominantAlignment(alignment);
  const practiceLabel = dailyPracticeLabel(dailyPractice);

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
          {centelhasCount > 0 && (
            <span className="centelha-count">
              {" "}· {centelhasCount} centelha{centelhasCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="bar" />
      </div>

      {dominantAlignment && (
        <div className={`alignment-chip alignment-${dominantAlignment.key}`}>
          <span className="alignment-label">{dominantAlignment.label}</span>
          <span className="alignment-value">
            {alignment[dominantAlignment.key]}
          </span>
        </div>
      )}

      {practiceLabel && (
        <div className="practice-chip">
          <span className="practice-marker">◇</span>
          <span className="practice-name">{practiceLabel}</span>
        </div>
      )}

      {hint && <div className="hint">{hint}</div>}

      <div className="hud-toggles">
        <button
          className={`olhar-trigger ${olharLucidoActive ? "active" : ""}`}
          onClick={toggleOlharLucido}
          aria-label="Olhar Lúcido (V)"
          title="Olhar Lúcido · V"
        >
          {olharLucidoActive ? "Olhar Lúcido ●" : "Olhar Lúcido"}
          <kbd>V</kbd>
        </button>
        <button
          className="codex-trigger"
          onClick={toggleCodex}
          aria-label="Abrir Codex (C)"
          title="Codex · C"
        >
          Codex <kbd>C</kbd>
        </button>
      </div>

      {toast && (
        <div className="awakened-toast" key={toast.name}>
          {toast.title}
          <span className="name">{toast.name}</span>
        </div>
      )}
    </div>
  );
}

type AlignmentKey = "light" | "shadow" | "balance";

function pickDominantAlignment(a: {
  light: number;
  shadow: number;
  balance: number;
}): { key: AlignmentKey; label: string } | null {
  const max = Math.max(a.light, a.shadow, a.balance);
  if (max < 5) return null; // não exibe até alcançar algum peso
  if (a.light === max) return { key: "light", label: "Luz" };
  if (a.balance === max) return { key: "balance", label: "Equilíbrio" };
  return { key: "shadow", label: "Sombra" };
}

const PRACTICE_LABELS: Record<string, string> = {
  "silencio-matinal": "Silêncio Matinal",
  "respiracao-quadrada": "Respiração Quadrada",
  "leitura-sagrada": "Leitura Sagrada",
  "caminhada-consciente": "Caminhada Consciente",
  "gratidao-dos-tres": "Gratidão dos Três",
  "contemplacao-do-corpo": "Contemplação do Corpo",
  "mantra-pessoal": "Mantra Pessoal",
  "diario-de-sombras": "Diário de Sombras",
  "perdao-de-quatro-direcoes": "Perdão das Quatro Direções",
  "oferta-aos-ancestrais": "Oferta aos Ancestrais",
  "presenca-com-natureza": "Presença com a Natureza",
  "saudacao-do-pleroma": "Saudação ao Pleroma",
};

function dailyPracticeLabel(id: string | null): string | null {
  if (!id) return null;
  return PRACTICE_LABELS[id] ?? null;
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
