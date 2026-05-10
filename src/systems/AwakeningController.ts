/* =========================================================
   AwakeningController
   ---------------------------------------------------------
   Controla o mini-game de despertar:
   - Pulsações cíclicas (anel pulsa em ritmo)
   - Janela de "acerto" curta no pico
   - Retorno: progresso (hits / required) ou conclusão
   - Não pune o erro — só não conta como acerto

   API:
     const ctrl = createAwakening({ required: 4, period: 1.6 })
     ctrl.start(now)        // marca inicio
     ctrl.press(now)        // jogador pressiona F
     ctrl.update(now)       // chamado por loop, retorna estado
   ========================================================= */

export interface AwakeningState {
  hits: number;
  required: number;
  done: boolean;
  /** Fase normalizada da pulsação atual: 0..1 */
  pulsePhase: number;
}

export interface AwakeningController {
  start: (now: number) => void;
  press: (now: number) => boolean; // true se acertou
  update: (now: number) => AwakeningState;
  reset: () => void;
}

interface CreateOpts {
  required?: number;
  /** Período em segundos de cada pulsação. */
  period?: number;
  /** Janela de acerto em segundos em torno do pico. */
  window?: number;
}

export function createAwakening({
  required = 4,
  period = 1.6,
  window = 0.45,
}: CreateOpts = {}): AwakeningController {
  let started = 0;
  let hits = 0;
  let lastHitPulse = -1;

  return {
    start(now) {
      started = now;
      hits = 0;
      lastHitPulse = -1;
    },
    press(now) {
      const elapsed = now - started;
      const pulseIdx = Math.floor(elapsed / period);
      const phase = (elapsed % period) / period;
      // pico em phase = 0.5 (meio do período)
      const distToPeak = Math.abs(phase - 0.5);
      const peakWindow = window / period / 2;
      if (distToPeak < peakWindow && pulseIdx !== lastHitPulse) {
        hits += 1;
        lastHitPulse = pulseIdx;
        return true;
      }
      return false;
    },
    update(now) {
      const elapsed = now - started;
      const phase = (elapsed % period) / period;
      return {
        hits,
        required,
        done: hits >= required,
        pulsePhase: phase,
      };
    },
    reset() {
      hits = 0;
      lastHitPulse = -1;
    },
  };
}
