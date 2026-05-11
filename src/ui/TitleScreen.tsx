import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { useSoulStore } from "../state/soulStore";
import { useCinematicStore } from "../state/cinematicStore";
import { hasSave, load, lastSavedAt } from "../systems/SaveSystem";

/* =========================================================
   <TitleScreen /> — abertura do jogo
   ---------------------------------------------------------
   Substitui IntroOverlay. Tem:
   - Título grande
   - Continuar (se há save)
   - Novo Jogo (vai para character creation)
   - Frase guia
   - Indicação sutil da Lei Divina
   ========================================================= */

interface TitleScreenProps {
  onNewGame: () => void;
  onContinue: () => void;
}

export function TitleScreen({ onNewGame, onContinue }: TitleScreenProps) {
  const enableAudio = useGameStore((s) => s.enableAudio);
  const [saveExists, setSaveExists] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setSaveExists(hasSave());
    setSavedAt(lastSavedAt());
  }, []);

  const handleContinue = () => {
    enableAudio();
    if (load()) {
      onContinue();
    } else {
      // Save corrompido ou inexistente — começar novo
      onNewGame();
    }
  };

  const handleNew = () => {
    enableAudio();
    onNewGame();
  };

  const lastPlayed = savedAt
    ? new Date(savedAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="title-screen">
      <div className="title-bg" />

      <div className="title-content">
        <h1 className="title-name">Sophia</h1>
        <p className="title-sub">A Jornada do Despertar</p>

        <div className="title-quote">
          <em>"Você acordou. Eu esperei tanto por isso."</em>
        </div>

        <div className="title-actions">
          {saveExists && (
            <button className="title-btn primary" onClick={handleContinue}>
              Continuar
              {lastPlayed && (
                <span className="last-played">Última vez · {lastPlayed}</span>
              )}
            </button>
          )}
          <button className="title-btn" onClick={handleNew}>
            {saveExists ? "Nova Vida" : "Começar"}
          </button>
        </div>

        <div className="title-divine-law">
          <em>De graça dái, pois, de graça recebei.</em>
        </div>
      </div>
    </div>
  );
}

/** Helper: usado pelo App para inicializar uma nova alma quando o
 *  jogador clica em "Nova Vida" — limpa soul e cinematics. */
export function startFreshSession() {
  useSoulStore.getState().resetSoul();
  useCinematicStore.getState().resetCinematics();
}
