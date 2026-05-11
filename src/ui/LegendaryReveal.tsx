import { useEffect, useState } from "react";

/* =========================================================
   <LegendaryReveal /> — overlay cinematográfico quando um
   Lendário é despertado pela primeira vez
   ---------------------------------------------------------
   3 beats narrativos com hold mínimo + fade entre falas.
   Ver docs/03d-personagens-lendarios.md §1 (identidade oculta)
   ========================================================= */

interface LegendaryRevealProps {
  /** Nome lendário (ex: "Adão"). */
  legendaryName: string;
  /** Epíteto (ex: "O Primeiro"). */
  epithet: string;
  /** Frase única que o Lendário diz após despertar. */
  firstWords: string;
  /** Dom oferecido (descrição curta). */
  gift: string;
  onComplete: () => void;
}

type Beat = 0 | 1 | 2 | 3;

export function LegendaryReveal({
  legendaryName,
  epithet,
  firstWords,
  gift,
  onComplete,
}: LegendaryRevealProps) {
  const [beat, setBeat] = useState<Beat>(0);
  const [canAdvance, setCanAdvance] = useState(false);

  const beats = [
    "Tu o despertaste.",
    "Mas algo nele... era diferente.",
    "A forma muda. Os olhos se abrem. Vês finalmente.",
    null, // beat final: mostra o card do Lendário
  ];

  // Hold mínimo antes de poder avançar
  useEffect(() => {
    setCanAdvance(false);
    const hold = beat === 3 ? 4500 : 2800;
    const t = setTimeout(() => setCanAdvance(true), hold);
    return () => clearTimeout(t);
  }, [beat]);

  const advance = () => {
    if (!canAdvance) return;
    if (beat === 3) {
      onComplete();
    } else {
      setBeat((b) => (b + 1) as Beat);
    }
  };

  // Tecla Espaço/Enter avança
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        canAdvance &&
        (e.code === "Space" || e.code === "Enter")
      ) {
        advance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAdvance, beat]);

  return (
    <div className="legendary-reveal">
      <div className="legendary-bg" />
      <div className="legendary-particles" />

      <div className="legendary-frame">
        {beat < 3 ? (
          <p className="legendary-text" key={beat}>
            <em>{beats[beat]}</em>
          </p>
        ) : (
          <div className="legendary-card">
            <div className="legendary-marker">⊕</div>
            <div className="legendary-name">{legendaryName}</div>
            <div className="legendary-epithet">{epithet}</div>
            <div className="legendary-firstwords">
              <em>"{firstWords}"</em>
            </div>
            <div className="legendary-divider" />
            <div className="legendary-gift-label">Dom oferecido</div>
            <div className="legendary-gift">{gift}</div>
          </div>
        )}

        <button
          className={`legendary-next ${canAdvance ? "" : "waiting"}`}
          onClick={advance}
          disabled={!canAdvance}
        >
          {beat === 3 ? "Acolher" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
