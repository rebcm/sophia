import { useEffect, useState } from "react";

/* =========================================================
   <AcessibilidadeOverlay /> — Sprint 36 (lean)
   ---------------------------------------------------------
   Aberto a partir do PauseMenu. Três ajustes persistentes:
   - Tamanho do texto (small / normal / large)
   - Reduzir movimento (suprime animações exageradas)
   - Alto contraste (intensifica UI para leitura)
   Aplica classes ao <body> imediatamente e grava em
   localStorage. O caminho é diegético: o despertar deve ser
   acessível a todos os corpos que vierem.
   ========================================================= */

type TextSize = "small" | "normal" | "large";

const KEY_TEXT = "sophia.a11y.textSize";
const KEY_MOTION = "sophia.a11y.reduceMotion";
const KEY_CONTRAST = "sophia.a11y.highContrast";

const TEXT_CLASSES: Record<TextSize, string> = {
  small: "a11y-text-small",
  normal: "a11y-text-normal",
  large: "a11y-text-large",
};

function readTextSize(): TextSize {
  try {
    const raw = localStorage.getItem(KEY_TEXT);
    if (raw === "small" || raw === "normal" || raw === "large") return raw;
  } catch {
    /* ignore */
  }
  return "normal";
}

function readBool(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeBool(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function applyTextSize(size: TextSize) {
  const body = document.body;
  body.classList.remove(
    TEXT_CLASSES.small,
    TEXT_CLASSES.normal,
    TEXT_CLASSES.large,
  );
  body.classList.add(TEXT_CLASSES[size]);
}

function applyReduceMotion(on: boolean) {
  document.body.classList.toggle("a11y-reduce-motion", on);
}

function applyHighContrast(on: boolean) {
  document.body.classList.toggle("a11y-high-contrast", on);
}

/** Hidrata e aplica os ajustes salvos. Chamar uma vez no boot. */
export function loadAccessibilitySettings(): void {
  applyTextSize(readTextSize());
  applyReduceMotion(readBool(KEY_MOTION));
  applyHighContrast(readBool(KEY_CONTRAST));
}

/** Restaura padrões e limpa o localStorage. Usado no wipe save. */
export function resetAccessibility(): void {
  try {
    localStorage.removeItem(KEY_TEXT);
    localStorage.removeItem(KEY_MOTION);
    localStorage.removeItem(KEY_CONTRAST);
  } catch {
    /* ignore */
  }
  applyTextSize("normal");
  applyReduceMotion(false);
  applyHighContrast(false);
}

interface AcessibilidadeOverlayProps {
  onClose: () => void;
}

export function AcessibilidadeOverlay({ onClose }: AcessibilidadeOverlayProps) {
  const [textSize, setTextSize] = useState<TextSize>(() => readTextSize());
  const [reduceMotion, setReduceMotion] = useState<boolean>(() =>
    readBool(KEY_MOTION),
  );
  const [highContrast, setHighContrast] = useState<boolean>(() =>
    readBool(KEY_CONTRAST),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleTextSize = (size: TextSize) => {
    setTextSize(size);
    try {
      localStorage.setItem(KEY_TEXT, size);
    } catch {
      /* ignore */
    }
    applyTextSize(size);
  };

  const handleReduceMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    writeBool(KEY_MOTION, next);
    applyReduceMotion(next);
  };

  const handleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    writeBool(KEY_CONTRAST, next);
    applyHighContrast(next);
  };

  return (
    <div className="a11y-overlay" onClick={onClose}>
      <div className="a11y-frame" onClick={(e) => e.stopPropagation()}>
        <h2>Acessibilidade</h2>
        <p className="a11y-sub">
          <em>"Que cada corpo encontre seu próprio ritmo de lembrar."</em>
        </p>

        <section className="a11y-section">
          <h3 className="a11y-section-title">Tamanho do texto</h3>
          <div className="a11y-radio-group" role="radiogroup">
            <label className="a11y-radio">
              <input
                type="radio"
                name="a11y-text-size"
                checked={textSize === "small"}
                onChange={() => handleTextSize("small")}
              />
              <span>Pequeno</span>
            </label>
            <label className="a11y-radio">
              <input
                type="radio"
                name="a11y-text-size"
                checked={textSize === "normal"}
                onChange={() => handleTextSize("normal")}
              />
              <span>Normal</span>
            </label>
            <label className="a11y-radio">
              <input
                type="radio"
                name="a11y-text-size"
                checked={textSize === "large"}
                onChange={() => handleTextSize("large")}
              />
              <span>Grande</span>
            </label>
          </div>
        </section>

        <section className="a11y-section">
          <h3 className="a11y-section-title">Reduzir movimento</h3>
          <label className="a11y-toggle">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={handleReduceMotion}
            />
            <span className="a11y-toggle-label">
              {reduceMotion ? "Ligado" : "Desligado"}
            </span>
            <span className="a11y-toggle-hint">
              Suaviza animações para quem prefere quietude visual.
            </span>
          </label>
        </section>

        <section className="a11y-section">
          <h3 className="a11y-section-title">Alto contraste</h3>
          <label className="a11y-toggle">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={handleHighContrast}
            />
            <span className="a11y-toggle-label">
              {highContrast ? "Ligado" : "Desligado"}
            </span>
            <span className="a11y-toggle-hint">
              Aumenta a separação entre texto e fundo.
            </span>
          </label>
        </section>

        <button className="a11y-back" onClick={onClose}>
          Voltar
        </button>
      </div>
    </div>
  );
}
