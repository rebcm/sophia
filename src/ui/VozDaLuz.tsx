import { useEffect, useState } from "react";

/* =========================================================
   <VozDaLuz /> — overlay narrativo no Bardo
   ---------------------------------------------------------
   3 fases internas:
     1. "Vem comigo, e descansa para sempre."
     2. Pausa silenciosa.
     3. Escolha: aceitar luz ou recusar (renascer).
   ========================================================= */

type VozFase = "intro" | "fala" | "escolha" | "despedida";

interface VozDaLuzProps {
  /** Quantas vidas a alma já viveu (afeta tom). */
  pastLivesCount: number;
  /** Aceitar a luz (ending E — placeholder). */
  onAccept: () => void;
  /** Recusar e renascer. */
  onRefuse: () => void;
}

export function VozDaLuz({
  pastLivesCount,
  onAccept,
  onRefuse,
}: VozDaLuzProps) {
  const [fase, setFase] = useState<VozFase>("intro");

  // Auto-progresso: intro → fala após 1s
  useEffect(() => {
    if (fase === "intro") {
      const t = setTimeout(() => setFase("fala"), 1200);
      return () => clearTimeout(t);
    }
  }, [fase]);

  // fala → escolha após 6s
  useEffect(() => {
    if (fase === "fala") {
      const t = setTimeout(() => setFase("escolha"), 6500);
      return () => clearTimeout(t);
    }
  }, [fase]);

  const ehPrimeiraVida = pastLivesCount === 0;
  const falaPrincipal = ehPrimeiraVida
    ? "Vem comigo, e descansa para sempre. Tudo o que ganhaste, eu guardo. Tudo o que perdeste, eu também."
    : `Tu voltaste. ${pastLivesCount} vidas vividas. Estás cansado? Descansa aqui.`;

  return (
    <div className="bardo-overlay">
      <div className="bardo-frame">
        {fase === "intro" && (
          <p className="bardo-intro">
            <em>Tu estás entre vidas.</em>
          </p>
        )}

        {fase === "fala" && (
          <>
            <div className="bardo-speaker">a Voz da Luz</div>
            <p className="bardo-fala" key={fase}>
              {falaPrincipal}
            </p>
          </>
        )}

        {fase === "escolha" && (
          <>
            <p className="bardo-fala">
              <em>
                "A escolha é tua.
                {ehPrimeiraVida ? " Aprende ela bem." : " Como sempre foi."}
                "
              </em>
            </p>
            <div className="bardo-choices">
              <button
                className="bardo-choice accept"
                onClick={() => {
                  setFase("despedida");
                  setTimeout(onAccept, 1500);
                }}
              >
                <span className="choice-label">Aceitar a Luz</span>
                <span className="choice-hint">
                  Descansar agora. Soltar tudo.
                </span>
              </button>
              <button
                className="bardo-choice refuse"
                onClick={() => {
                  setFase("despedida");
                  setTimeout(onRefuse, 1500);
                }}
              >
                <span className="choice-label">Recusar — voltar</span>
                <span className="choice-hint">
                  Tens trabalho ainda. Escolher um novo corpo.
                </span>
              </button>
            </div>
          </>
        )}

        {fase === "despedida" && (
          <p className="bardo-fala">
            <em>"Vai, então."</em>
          </p>
        )}
      </div>
    </div>
  );
}
