import { useEffect, useState } from "react";
import { useSoulStore } from "../state/soulStore";
import {
  computeCentelhaPhase,
  getCentelhaVisual,
  phaseToHudLabel,
  type CentelhaPhase,
} from "../systems/CentelhaController";

/* =========================================================
   <PowerUpToast /> — feedback ao subir uma fase da Centelha
   ---------------------------------------------------------
   Observa soulStore.light + centelhas.size e dispara um toast
   por ~6s quando a fase visual da Centelha avança. Cada fase
   tem mensagem temática.
   ========================================================= */

const PHASE_MESSAGE: Record<CentelhaPhase, string> = {
  1: "Algo dentro do peito acende.",
  2: "O calor cresce. Tu já te orientas pela luz própria.",
  3: "A chama tem coragem de existir. Tu também.",
  4: "A chama não precisa mais de combustível externo. Tu lembras.",
  5: "Tua presença aquece quem se aproxima. Sleepers viram a cabeça.",
  6: "A luz não cabe mais no peito. Vê pelas pontas dos dedos.",
  7: "Tu emanas. Pequenas auras curam-se ao teu passar.",
  8: "Tu te lembras de quem és. As asas tênues aparecem.",
};

export function PowerUpToast() {
  const light = useSoulStore((s) => s.light);
  const centelhasCount = useSoulStore((s) => s.centelhas.size);

  const [shown, setShown] = useState<CentelhaPhase | null>(null);
  const [lastSeen, setLastSeen] = useState<CentelhaPhase | null>(null);

  useEffect(() => {
    const phase = computeCentelhaPhase({ light, centelhasCount });
    if (lastSeen === null) {
      // primeira observação: registra mas não dispara toast
      setLastSeen(phase);
      return;
    }
    if (phase > lastSeen) {
      setShown(phase);
      setLastSeen(phase);
      const t = setTimeout(() => setShown(null), 6000);
      return () => clearTimeout(t);
    } else if (phase !== lastSeen) {
      setLastSeen(phase);
    }
  }, [light, centelhasCount, lastSeen]);

  if (!shown) return null;
  const visual = getCentelhaVisual(shown);

  return (
    <div
      className="powerup-toast"
      style={
        { ["--powerup-glow" as string]: visual.haloColor } as React.CSSProperties
      }
    >
      <p className="powerup-label">{phaseToHudLabel(shown)}</p>
      <h3 className="powerup-title">{visual.label}</h3>
      <p className="powerup-body">
        <em>{PHASE_MESSAGE[shown]}</em>
      </p>
    </div>
  );
}
