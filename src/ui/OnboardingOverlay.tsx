import { useEffect, useState } from "react";

/* =========================================================
   <OnboardingOverlay /> — Sprint 54
   ---------------------------------------------------------
   Mostrado uma única vez (controlado por localStorage flag).
   Aparece após o prólogo, antes da primeira ação no Jardim.
   Apresenta as 6 teclas-chave em formato calmo, não-bloqueante.
   ========================================================= */

const ONBOARDED_KEY = "sophia.onboarded.v1";

interface OnboardingProps {
  onClose: () => void;
}

export function OnboardingOverlay({ onClose }: OnboardingProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDED_KEY) !== "1") {
        // Atrasa um pouco para não competir com o fade da cinemática
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage indisponível — mostra mesmo assim
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-frame">
        <p className="onboarding-greeting">
          <em>
            "Tu acabaste de chegar. Antes que tu camines —
            algumas chaves que eu posso te dar:"
          </em>
        </p>
        <ul className="onboarding-keys">
          <li>
            <kbd>W A S D</kbd>
            <span>caminhar pelo mundo</span>
          </li>
          <li>
            <kbd>Mouse</kbd>
            <span>clicar no mundo para olhar ao redor · Esc libera</span>
          </li>
          <li>
            <kbd>F</kbd>
            <span>tocar, despertar, escolher</span>
          </li>
          <li>
            <kbd>Espaço</kbd>
            <span>avançar diálogo</span>
          </li>
          <li>
            <kbd>V</kbd>
            <span>Olhar Lúcido · ver auras e filamentos</span>
          </li>
          <li>
            <kbd>C</kbd>
            <span>Codex da Alma · tua memória através das vidas</span>
          </li>
          <li>
            <kbd>P</kbd>
            <span>Pausa · áudio, créditos, soltar tudo</span>
          </li>
        </ul>
        <p className="onboarding-closing">
          <em>
            Não há pressa. Não há prêmio por velocidade. Respira.
          </em>
        </p>
        <button className="onboarding-dismiss" onClick={handleDismiss}>
          Já lembro
        </button>
      </div>
    </div>
  );
}

/** Helper externo para apagar a flag (usado pelo wipe save). */
export function resetOnboarding() {
  try {
    localStorage.removeItem(ONBOARDED_KEY);
  } catch {
    /* ignore */
  }
}
