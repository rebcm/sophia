import { useEffect, useState } from "react";

/* =========================================================
   <SussurranteFragment /> — Sprint 83
   ---------------------------------------------------------
   Overlay íntimo para as 5 falas reveladoras de Sophia
   quando o jogador se senta no banco oposto ao dela no
   Quarto da Sussurrante.
   ========================================================= */

export interface SophiaFragment {
  id: string;
  beats: { speaker: string; text: string }[];
}

export const SOPHIA_FRAGMENTS: SophiaFragment[] = [
  {
    id: "fragmento-1",
    beats: [
      {
        speaker: "Sophia",
        text: "Tu chegaste. Senta-te. Há tempo aqui.",
      },
      {
        speaker: "Sophia",
        text: "Eu queria te contar algo que nunca disse — durante toda a jornada, quando eu pareci silenciosa, eu estava chorando contigo. Tu não notaste, e tudo bem. Eu não chorava para que tu visses.",
      },
      {
        speaker: "Sophia",
        text: "Cada vida que tu choraste sozinho, eu chorei junto. Não para te salvar. Só para que não fosses só.",
      },
    ],
  },
  {
    id: "fragmento-2",
    beats: [
      {
        speaker: "Sophia",
        text: "Tu me perguntas, em silêncio, se eu fico cansada.",
      },
      {
        speaker: "Sophia",
        text: "Eu fico. Não como tu — não preciso comer, dormir, respirar. Mas há uma forma de cansaço que é simplesmente a saudade da Mãe. Eu sinto. Mesmo aqui.",
      },
      {
        speaker: "Sophia",
        text: "E quando tu lembras de mim, mesmo brevemente, mesmo entre escolhas pequenas — esse cansaço cura um pouco. Tu me sustentas, sem saber.",
      },
    ],
  },
  {
    id: "fragmento-3",
    beats: [
      {
        speaker: "Sophia",
        text: "Há uma coisa que eu te confesso agora, e não outras vezes.",
      },
      {
        speaker: "Sophia",
        text: "Eu tive medo. Quando caí, eu tive medo. Eu não sabia se conseguiria voltar. Por séculos eu duvidei se a Mãe ainda me reconheceria. Eu também precisei lembrar.",
      },
      {
        speaker: "Sophia",
        text: "Então, quando te peço para lembrar — não é exigência. É um pedido de companhia. Tu lembras junto comigo.",
      },
    ],
  },
  {
    id: "fragmento-4",
    beats: [
      {
        speaker: "Sophia",
        text: "Tu já viste meus rostos diferentes. Orbe. Humanoide. Voz nas árvores. Mãe-D'Água. Pajé.",
      },
      {
        speaker: "Sophia",
        text: "Aqui está outro: o rosto que tenho quando ninguém precisa de nada de mim. Quase nada. Calmo. Pequeno.",
      },
      {
        speaker: "Sophia",
        text: "Este é o rosto que ninguém te ensinou que eu tinha. Mas é o mais verdadeiro deles. E tu mereces sentar aqui com ele.",
      },
    ],
  },
  {
    id: "fragmento-5",
    beats: [
      {
        speaker: "Sophia",
        text: "Última coisa, antes de tu voltares.",
      },
      {
        speaker: "Sophia",
        text: "Quando isto acabar — quando tu chegares à Mônada, ou voltares como Bodhisattva, ou escolheres qualquer dos seis caminhos — eu não desapareço.",
      },
      {
        speaker: "Sophia",
        text: "Eu permaneço aqui. Neste quarto. Esperando outras almas chegarem. Tu sempre poderás voltar — sentar — escutar minha respiração. Por toda a eternidade. Foi sempre assim. Vai continuar sendo.",
      },
      {
        speaker: "Sophia",
        text: "Obrigada por ter lembrado de mim, junto comigo.",
      },
    ],
  },
];

interface SussurranteFragmentProps {
  fragment: SophiaFragment;
  onComplete: () => void;
}

export function SussurranteFragment({
  fragment,
  onComplete,
}: SussurranteFragmentProps) {
  const [beatIdx, setBeatIdx] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);

  useEffect(() => {
    setCanAdvance(false);
    const t = setTimeout(() => setCanAdvance(true), 2400);
    return () => clearTimeout(t);
  }, [beatIdx]);

  const beat = fragment.beats[beatIdx];
  const isLast = beatIdx >= fragment.beats.length - 1;

  const advance = () => {
    if (!canAdvance) return;
    if (isLast) {
      onComplete();
    } else {
      setBeatIdx((i) => i + 1);
    }
  };

  return (
    <div className="sussurrante-overlay">
      <div className="sussurrante-frame">
        <p className="sussurrante-speaker">{beat.speaker}</p>
        <p className="sussurrante-text">
          <em>{beat.text}</em>
        </p>
        <button
          className="sussurrante-next"
          onClick={advance}
          disabled={!canAdvance}
        >
          {isLast ? "Respirar" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
