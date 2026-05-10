import { useGameStore } from "../state/gameStore";

/* =========================================================
   AwakeningRing — overlay do mini-game de despertar
   ---------------------------------------------------------
   Mostrado apenas durante a fase "awakening". Visual de
   anel pulsante. Lê props (progresso) controladas pelo
   AwakeningController.
   ========================================================= */

interface AwakeningRingProps {
  hits: number;
  required: number;
}

export function AwakeningRing({ hits, required }: AwakeningRingProps) {
  const phase = useGameStore((s) => s.phase);
  if (phase !== "awakening") return null;

  return (
    <div className="awakening">
      <div className="ring">
        <div className="pulse-ring" />
        <div className="target" />
      </div>
      <div className="progress">
        {hits} / {required}
      </div>
      <div className="label">
        Aperte <kbd>F</kbd> no momento do brilho
      </div>
    </div>
  );
}
