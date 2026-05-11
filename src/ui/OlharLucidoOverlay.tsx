import { useGameStore } from "../state/gameStore";

/* =========================================================
   <OlharLucidoOverlay /> — Sprint 51
   ---------------------------------------------------------
   Vinheta violeta sutil que reveste a tela quando o Olhar
   Lúcido está ativo (tecla V). Sinaliza visualmente que a
   percepção mudou — auras + filamentos visíveis.
   ========================================================= */

export function OlharLucidoOverlay() {
  const olharLucidoActive = useGameStore((s) => s.olharLucidoActive);
  const metaPhase = useGameStore((s) => s.metaPhase);

  if (!olharLucidoActive || metaPhase !== "game") return null;

  return (
    <div className="olhar-lucido-overlay" aria-hidden>
      <div className="olhar-lucido-edge" />
      <div className="olhar-lucido-corner olhar-lucido-corner-tl" />
      <div className="olhar-lucido-corner olhar-lucido-corner-tr" />
      <div className="olhar-lucido-corner olhar-lucido-corner-bl" />
      <div className="olhar-lucido-corner olhar-lucido-corner-br" />
      <div className="olhar-lucido-label">
        <span className="olhar-lucido-dot" />
        Olhar Lúcido
      </div>
    </div>
  );
}
