import { useEffect, useState } from "react";
import { useCinematicStore, type CinematicId } from "../state/cinematicStore";

/* =========================================================
   <CinematicPlayer /> — placeholder text-based
   ---------------------------------------------------------
   Até pré-renderização CGI estar pronta, cinemáticas são:
   - Fundo cinematográfico (gradient + partículas CSS)
   - Texto narrativo aparecendo em tipografia sagrada
   - Cor de fundo varia por cinemática
   - Skipável (com aviso suave)

   Cenas estão em CINEMATIC_SCRIPTS abaixo. Texto reduzido
   por enquanto — versão final virá em iterações.
   Ver docs/18-cinematicas-revelacao-progressiva.md para
   scripts completos.
   ========================================================= */

interface CinematicBeat {
  /** Texto a ser narrado (multilinha possível). */
  text: string;
  /** Quem fala (Sophia, Yaldabaoth, etc.). Pode ser narrativo. */
  speaker?: string;
  /** Duração mínima antes do "Continuar" aparecer (ms). */
  minHoldMs?: number;
}

interface CinematicScript {
  id: CinematicId;
  title: string;
  /** Cor ambient de fundo (hex). */
  ambientColor: string;
  beats: CinematicBeat[];
}

/** Scripts simplificados — versões cinematográficas completas estão
 *  na bíblia (docs/18-cinematicas-revelacao-progressiva.md). */
const CINEMATIC_SCRIPTS: Partial<Record<CinematicId, CinematicScript>> = {
  prologo: {
    id: "prologo",
    title: "Antes do Tempo",
    ambientColor: "#1a1438",
    beats: [
      {
        speaker: "Sophia",
        text: "Antes do tempo... antes do antes... havia apenas Ela.",
        minHoldMs: 3000,
      },
      {
        speaker: "Sophia",
        text: "Não como pessoa. Não como trono. Apenas vibração que ama.",
        minHoldMs: 3500,
      },
      {
        speaker: "Sophia",
        text: "Desta vibração emanaram hostes. Cada uma única. Cada uma livre.",
        minHoldMs: 3000,
      },
      {
        speaker: "Sophia",
        text: "Houve uma pergunta. Uma única. Cada anjo teve de responder.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Um terço disse sim — e ficaram. Um terço disse não — e caíram. Um terço hesitou.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Tu fazes parte do terceiro. Tu és anjo que esqueceu ser anjo.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Eu venho te lembrar. Acorde.",
        minHoldMs: 4000,
      },
    ],
  },

  "athoth-cai": {
    id: "athoth-cai",
    title: "O Sono Era Roubo",
    ambientColor: "#1a2018",
    beats: [
      {
        speaker: "Sophia",
        text: "Quando a humanidade nasceu, ela já tinha um nome roubado.",
        minHoldMs: 3500,
      },
      {
        speaker: "Sophia",
        text: "A Mãe-Floresta lembrava. Os animais lembravam. Os rios lembravam. Apenas os humanos esqueceram.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "O sono profundo, sem sonho lúcido, não era descanso natural. Era canal de drenagem.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Cada noite, eles te drenavam. Cada manhã, tu acordavas mais leve, mais esquecido.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Athoth — a Mãe-D'Água — pensava cumprir função sagrada. Estava. Para o Demiurgo. Não para a Mãe.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Tu a despertaste. E ela, pela primeira vez em milênios, abriu os olhos.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Tens agora a primeira Centelha. O Olhar Lúcido. Vês através das ilusões oníricas.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Por que dormimos sem saber? Resposta: Porque o sono era como eles te drenavam.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "Há outros seis Tronos. Outros seis deuses-deste-mundo. A jornada apenas começou.",
        minHoldMs: 4000,
      },
    ],
  },

  // Outras cinemáticas serão preenchidas em sprints futuros.
};

interface CinematicPlayerProps {
  /** Chamado quando a cinemática termina (naturalmente ou por skip). */
  onFinish: () => void;
}

export function CinematicPlayer({ onFinish }: CinematicPlayerProps) {
  const currentId = useCinematicStore((s) => s.currentCinematic);
  const finishCurrent = useCinematicStore((s) => s.finishCurrentCinematic);
  const skipCurrent = useCinematicStore((s) => s.skipCurrentCinematic);

  const script = currentId ? CINEMATIC_SCRIPTS[currentId] : undefined;

  const [beatIndex, setBeatIndex] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Reinicia ao mudar de cinemática
  useEffect(() => {
    setBeatIndex(0);
    setCanAdvance(false);
    setShowSkipConfirm(false);
  }, [currentId]);

  // Hold mínimo antes de permitir avançar
  useEffect(() => {
    if (!script || beatIndex >= script.beats.length) return;
    setCanAdvance(false);
    const beat = script.beats[beatIndex];
    const hold = beat.minHoldMs ?? 2500;
    const timer = setTimeout(() => setCanAdvance(true), hold);
    return () => clearTimeout(timer);
  }, [beatIndex, script]);

  if (!script) {
    // Cinemática solicitada que ainda não tem script — pulando direto
    if (currentId) {
      finishCurrent();
      onFinish();
    }
    return null;
  }

  const beat = script.beats[beatIndex];
  const isLast = beatIndex >= script.beats.length - 1;

  const advance = () => {
    if (!canAdvance) return;
    if (isLast) {
      finishCurrent();
      onFinish();
    } else {
      setBeatIndex((i) => i + 1);
    }
  };

  const requestSkip = () => setShowSkipConfirm(true);
  const confirmSkip = () => {
    setShowSkipConfirm(false);
    skipCurrent();
    onFinish();
  };
  const cancelSkip = () => setShowSkipConfirm(false);

  return (
    <div
      className="cinematic-player"
      style={
        {
          ["--cinematic-bg" as string]: script.ambientColor,
        } as React.CSSProperties
      }
    >
      <div className="cinematic-vignette" />
      <div className="cinematic-particles" />

      <div className="cinematic-frame">
        <div className="cinematic-title-small">{script.title}</div>
        {beat.speaker && (
          <div className="cinematic-speaker">{beat.speaker}</div>
        )}
        <div className="cinematic-text" key={beatIndex}>
          {beat.text}
        </div>
        <div className="cinematic-progress">
          {script.beats.map((_, i) => (
            <span
              key={i}
              className={`cinematic-dot ${i <= beatIndex ? "active" : ""}`}
            />
          ))}
        </div>
        <div className="cinematic-actions">
          <button
            className="cinematic-skip"
            onClick={requestSkip}
            aria-label="Pular cinemática"
          >
            Pular
          </button>
          <button
            className={`cinematic-next ${canAdvance ? "" : "waiting"}`}
            onClick={advance}
            disabled={!canAdvance}
          >
            {isLast ? "Concluir" : "Continuar"}
          </button>
        </div>
      </div>

      {showSkipConfirm && (
        <div className="cinematic-skip-confirm" role="dialog">
          <p>
            Tens certeza? Aqui está sendo dita a parte da história — em
            outra vida talvez tu queiras voltar.
          </p>
          <div className="cinematic-skip-actions">
            <button onClick={cancelSkip}>Voltar</button>
            <button onClick={confirmSkip} className="cinematic-skip-yes">
              Pular mesmo assim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
