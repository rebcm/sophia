import { useEffect, useState } from "react";
import { useSoulStore } from "../state/soulStore";

/* =========================================================
   <VozesEscolha /> — overlay de escolha-chave com 4 Vozes
   ---------------------------------------------------------
   Mecânica central do Livre Arbítrio. Cada escolha-chave:
     - 3 a 4 opções (Luz, Sombra, Equilíbrio, [Pacto-Jinn])
     - Vozes sussurram antes de o jogador clicar
     - Cada opção modifica alinhamento (luz/shadow/balance)
   Ver docs/04d-livre-arbitrio.md
   ========================================================= */

export type AlignmentKey = "light" | "shadow" | "balance";

export interface ChoiceOption {
  label: string;
  alignment: AlignmentKey;
  /** Efeito imediato exibido após escolher. */
  immediateEffect: string;
  /** Quanto adicionar ao alinhamento (default 5). */
  amount?: number;
}

export interface KeyChoice {
  /** ID único da escolha (para tracking futuro). */
  id: string;
  /** Contexto narrativo. */
  context: string;
  /** Vozes que sussurram. */
  voices: {
    angel?: string;
    demon?: string;
    jinn?: string;
    sophia?: string;
  };
  /** Opções disponíveis. */
  options: ChoiceOption[];
}

interface VozesEscolhaProps {
  choice: KeyChoice;
  onResolved: (option: ChoiceOption) => void;
}

type Fase = "voices" | "options" | "resolved";

export function VozesEscolha({ choice, onResolved }: VozesEscolhaProps) {
  const [fase, setFase] = useState<Fase>("voices");
  const [chosen, setChosen] = useState<ChoiceOption | null>(null);
  const addToAlignment = useSoulStore((s) => s.addToAlignment);

  // voices → options após 5s
  useEffect(() => {
    if (fase === "voices") {
      const t = setTimeout(() => setFase("options"), 5500);
      return () => clearTimeout(t);
    }
  }, [fase]);

  const handleChoose = (opt: ChoiceOption) => {
    addToAlignment(opt.alignment, opt.amount ?? 5);
    setChosen(opt);
    setFase("resolved");
    setTimeout(() => onResolved(opt), 3500);
  };

  return (
    <div className="vozes-overlay">
      <div className="vozes-frame">
        <p className="vozes-context">
          <em>{choice.context}</em>
        </p>

        {fase === "voices" && (
          <div className="vozes-list">
            {choice.voices.angel && (
              <p className="voice voice-angel">
                <span className="voice-tag">anjo</span>
                {choice.voices.angel}
              </p>
            )}
            {choice.voices.demon && (
              <p className="voice voice-demon">
                <span className="voice-tag">demônio</span>
                {choice.voices.demon}
              </p>
            )}
            {choice.voices.jinn && (
              <p className="voice voice-jinn">
                <span className="voice-tag">jinn</span>
                {choice.voices.jinn}
              </p>
            )}
            {choice.voices.sophia && (
              <p className="voice voice-sophia">
                <span className="voice-tag">sophia</span>
                {choice.voices.sophia}
              </p>
            )}
          </div>
        )}

        {fase === "options" && (
          <div className="vozes-options">
            {choice.options.map((opt, i) => (
              <button
                key={i}
                className={`voz-option voz-${opt.alignment}`}
                onClick={() => handleChoose(opt)}
              >
                <span className="voz-option-label">{opt.label}</span>
                <span className={`voz-option-tag voz-${opt.alignment}`}>
                  {alignmentLabel(opt.alignment)}
                </span>
              </button>
            ))}
          </div>
        )}

        {fase === "resolved" && chosen && (
          <div className="voz-resolved">
            <p className="voz-resolved-effect">
              <em>{chosen.immediateEffect}</em>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function alignmentLabel(k: AlignmentKey): string {
  if (k === "light") return "Luz";
  if (k === "shadow") return "Sombra";
  return "Equilíbrio";
}
