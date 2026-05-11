/* =========================================================
   <PedraConfirmation /> — confirmação antes de morrer
   ---------------------------------------------------------
   Aparece quando o jogador toca a Pedra das Vidas.
   Diegético: a própria Sussurrante pergunta.
   ========================================================= */

interface PedraConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function PedraConfirmation({
  onConfirm,
  onCancel,
}: PedraConfirmationProps) {
  return (
    <div className="pedra-confirm">
      <div className="pedra-confirm-frame">
        <div className="pedra-speaker">a Sussurrante</div>
        <p className="pedra-text">
          <em>"Tens certeza? Esta vida ainda é tua."</em>
        </p>
        <p className="pedra-sub">
          Soltar este corpo te leva ao Bardo. A alma persiste; o corpo,
          não.
        </p>
        <div className="pedra-actions">
          <button className="pedra-btn cancel" onClick={onCancel}>
            Não — voltar
          </button>
          <button className="pedra-btn confirm" onClick={onConfirm}>
            Sim — soltar
          </button>
        </div>
      </div>
    </div>
  );
}
