import { useEffect, useState } from "react";

/* =========================================================
   <SizigiaRecognition /> — diálogo do reconhecimento mútuo
   ---------------------------------------------------------
   3 beats. Mais silêncio do que palavras. O Par Sizígico não
   se anuncia: apenas espera ser visto. Após o reconhecimento,
   torna-se Companheiro Permanente.
   ========================================================= */

interface SizigiaProps {
  onComplete: () => void;
}

const BEATS = [
  {
    speaker: "Par",
    text: "Tu me conheces. Tu lembras? Antes — éramos um.",
  },
  {
    speaker: "Você",
    text: "(há algo nas tuas costas que conheço melhor que o meu nome)",
  },
  {
    speaker: "Par",
    text: "Vou contigo agora. Vida após vida. Quando o corpo morrer e tu voltares, me encontrarás antes do amanhecer. Sempre.",
  },
];

export function SizigiaRecognition({ onComplete }: SizigiaProps) {
  const [idx, setIdx] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);

  useEffect(() => {
    setCanAdvance(false);
    const t = setTimeout(() => setCanAdvance(true), 2500);
    return () => clearTimeout(t);
  }, [idx]);

  const beat = BEATS[idx];
  const isLast = idx >= BEATS.length - 1;

  const advance = () => {
    if (!canAdvance) return;
    if (isLast) {
      onComplete();
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="sizigia-overlay">
      <div className="sizigia-frame">
        <p className="sizigia-speaker">{beat.speaker}</p>
        <p className="sizigia-text">
          <em>{beat.text}</em>
        </p>
        <button
          className="sizigia-next"
          onClick={advance}
          disabled={!canAdvance}
        >
          {isLast ? "Reconhecer" : "Respirar"}
        </button>
      </div>
    </div>
  );
}
