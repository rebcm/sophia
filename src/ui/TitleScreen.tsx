import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { useSoulStore } from "../state/soulStore";
import { useCinematicStore } from "../state/cinematicStore";
import { hasSave, load, lastSavedAt } from "../systems/SaveSystem";

interface SaveStats {
  centelhas: number;
  lendarios: number;
  vidas: number;
  cinematicas: number;
  light: number;
}

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
  const [stats, setStats] = useState<SaveStats | null>(null);

  useEffect(() => {
    setSaveExists(hasSave());
    setSavedAt(lastSavedAt());
    setStats(readSaveStats());
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

          {saveExists && stats && (
            <div className="title-stats">
              <div className="title-stat">
                <span className="title-stat-value">{stats.centelhas}</span>
                <span className="title-stat-label">centelhas</span>
              </div>
              <div className="title-stat">
                <span className="title-stat-value">{stats.lendarios}</span>
                <span className="title-stat-label">lendários</span>
              </div>
              <div className="title-stat">
                <span className="title-stat-value">{stats.vidas}</span>
                <span className="title-stat-label">vidas</span>
              </div>
              <div className="title-stat">
                <span className="title-stat-value">{stats.cinematicas}</span>
                <span className="title-stat-label">cinemáticas</span>
              </div>
              <div className="title-stat">
                <span className="title-stat-value">
                  {stats.light.toFixed(1)}
                </span>
                <span className="title-stat-label">luz</span>
              </div>
            </div>
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

/** Lê stats da alma direto do localStorage sem disparar load() —
 *  para mostrar contagens na TitleScreen sem hidratar os stores. */
function readSaveStats(): SaveStats | null {
  try {
    const raw = localStorage.getItem("sophia.save.v1");
    if (!raw) return null;
    const data = JSON.parse(raw);
    const soul = data.soul ?? {};
    const cine = data.cinematic ?? {};
    const watched = cine.watched ?? {};
    const cinematicasCount = Object.values(watched).filter(
      (e) => (e as { watched?: boolean }).watched,
    ).length;
    const centelhasArr = Array.isArray(soul.centelhas) ? soul.centelhas : [];
    const sleepersArr = Array.isArray(soul.awakenedSleepers)
      ? soul.awakenedSleepers
      : [];
    const lendariosCount = sleepersArr.filter(
      (s: { isLegendary?: boolean }) => s.isLegendary,
    ).length;
    const vidasCount = Array.isArray(soul.pastLives) ? soul.pastLives.length : 0;
    const light = typeof soul.light === "number" ? soul.light : 0;
    return {
      centelhas: centelhasArr.length,
      lendarios: lendariosCount,
      vidas: vidasCount,
      cinematicas: cinematicasCount,
      light,
    };
  } catch {
    return null;
  }
}
