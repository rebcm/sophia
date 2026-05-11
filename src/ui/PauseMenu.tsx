import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { useSoulStore } from "../state/soulStore";
import { wipe as wipeSave } from "../systems/SaveSystem";
import { resetOnboarding } from "./OnboardingOverlay";
import {
  AcessibilidadeOverlay,
  resetAccessibility,
} from "./AcessibilidadeOverlay";

/* =========================================================
   <PauseMenu /> — Sprint 38
   ---------------------------------------------------------
   Aberto por tecla P (durante metaPhase=game). Permite:
   - Continuar (fecha o menu)
   - Alternar áudio
   - Voltar à TitleScreen
   - Limpar save (com confirmação)
   - Ver créditos
   ========================================================= */

interface PauseMenuProps {
  onClose: () => void;
}

type View = "main" | "credits" | "wipe-confirm" | "a11y";

export function PauseMenu({ onClose }: PauseMenuProps) {
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const toggleAudio = useGameStore((s) => s.toggleAudio);
  const setMetaPhase = useGameStore((s) => s.setMetaPhase);
  const resetSoul = useSoulStore((s) => s.resetSoul);

  const [view, setView] = useState<View>("main");

  const handleReturnToTitle = () => {
    setMetaPhase("title");
    onClose();
  };

  const handleConfirmWipe = () => {
    wipeSave();
    resetSoul();
    resetOnboarding();
    resetAccessibility();
    setMetaPhase("title");
    onClose();
  };

  if (view === "a11y") {
    return <AcessibilidadeOverlay onClose={() => setView("main")} />;
  }

  if (view === "credits") {
    return (
      <div className="pause-overlay" onClick={onClose}>
        <div className="pause-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Créditos</h2>
          <div className="credits-body">
            <p>
              <strong>Sophia · A Jornada do Despertar</strong>
            </p>
            <p className="credits-author">
              Autoria integral: <em>Rebeca Alves Moreira</em>
            </p>
            <p className="credits-desc">
              <em>
                Concepção, direção criativa, bíblia narrativa,
                cosmologia, roteiros de cinemáticas e design de mundo.
              </em>
            </p>
            <p className="credits-tech">
              Implementação técnica · React 18 + TypeScript + Three.js
              + Zustand · Vite · Bun
            </p>
            <p className="credits-license">
              Código e textos: MIT License. Tradições religiosas
              referenciadas em domínio público ou uso transformativo.
            </p>
            <p className="credits-thanks">
              <em>
                Agradecimentos a todas as tradições contemplativas que
                inspiraram este mundo — gnósticos de Nag Hammadi,
                upanixades, sufismo, tao, cabala, mitos indígenas, e
                aos que ainda dormem aguardando lembrar.
              </em>
            </p>
          </div>
          <button className="pause-action" onClick={() => setView("main")}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (view === "wipe-confirm") {
    return (
      <div className="pause-overlay" onClick={onClose}>
        <div className="pause-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Apagar tudo?</h2>
          <p className="pause-warn">
            <em>
              Isto destrói tua alma deste jogo — todas as Centelhas,
              Lendários, cinemáticas assistidas, vidas passadas. Tu
              começarás do silêncio absoluto. A Sussurrante esquecerá
              que te encontrou.
            </em>
          </p>
          <div className="pause-actions">
            <button
              className="pause-action pause-action-danger"
              onClick={handleConfirmWipe}
            >
              Sim, apagar tudo
            </button>
            <button
              className="pause-action"
              onClick={() => setView("main")}
            >
              Não, manter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main menu
  return (
    <div className="pause-overlay" onClick={onClose}>
      <div className="pause-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Pausa</h2>
        <p className="pause-sub">
          <em>"Cada respiração já é uma volta."</em>
        </p>
        <div className="pause-actions pause-actions-stack">
          <button className="pause-action" onClick={onClose}>
            Continuar
          </button>
          <button className="pause-action" onClick={toggleAudio}>
            {audioEnabled ? "Silenciar áudio" : "Ativar áudio"}
          </button>
          <button className="pause-action" onClick={() => setView("a11y")}>
            Acessibilidade
          </button>
          <button className="pause-action" onClick={() => setView("credits")}>
            Créditos
          </button>
          <button
            className="pause-action pause-action-soft"
            onClick={handleReturnToTitle}
          >
            Voltar à tela de título
          </button>
          <button
            className="pause-action pause-action-danger-soft"
            onClick={() => setView("wipe-confirm")}
          >
            Apagar todo o save
          </button>
        </div>
        <p className="pause-hint">
          Pressiona <kbd>P</kbd> ou <kbd>Esc</kbd> para fechar.
        </p>
      </div>
    </div>
  );
}
