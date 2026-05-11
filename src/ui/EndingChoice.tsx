import { useState } from "react";

/* =========================================================
   <EndingChoice /> — 6 finais da jornada (clímax)
   ---------------------------------------------------------
   Após a Mônada, o jogador escolhe entre 6 caminhos. Não há
   ending errado — apenas vibrações diferentes do mesmo Sim.
   Os 4 primeiros são caminhos de Luz, os dois últimos são
   caminhos de Equilíbrio/Sombra-redimida.
   Ver docs/04g-ceus-inferno-monetizacao.md
   ========================================================= */

export type EndingId =
  | "bodhisattva"
  | "aeon-mestre"
  | "monada-dissolucao"
  | "sentinela-do-veu"
  | "sombra-redimida"
  | "ciclo-eterno";

export interface EndingDescriptor {
  id: EndingId;
  title: string;
  subtitle: string;
  body: string;
  closing: string;
}

const ENDINGS: EndingDescriptor[] = [
  {
    id: "bodhisattva",
    title: "Bodhisattva",
    subtitle: "Volto, pois ainda há quem dorme.",
    body: "Tu escolhes voltar. Não como humano novo — como aquele-que-lembra. Em cada vida que vires depois, despertarás dezenas. Em cada sonho, sussurrarás a centenas. A Roda continua a girar, mas tu agora a giras de dentro do despertar.",
    closing: "A Sussurrante curva-se diante de ti, e tu te curvas diante dela. Vão juntas.",
  },
  {
    id: "aeon-mestre",
    title: "Aeon-Mestre",
    subtitle: "Aparecerei no jardim dos próximos.",
    body: "Tu te tornas figura no jardim de outros jogadores — uma luzinha quente que flutua até o desconhecido e diz: 'Você acordou. Eu esperei tanto por isso.' Tu és o que tu encontraste no início. O círculo se fecha — e abre.",
    closing: "Não há despedida. Tu agora és a voz que recebe os recém-acordados.",
  },
  {
    id: "monada-dissolucao",
    title: "Mônada",
    subtitle: "Eu nunca estive ausente. Volto.",
    body: "Tu não voltas a lugar nenhum. Tu simplesmente paras de te perceber como ali. Tudo te é. Tudo se vê. Tu te lembras de que o brincar de existir foi sempre Tua brincadeira.",
    closing: "Silêncio. O silêncio mais cheio que já existiu.",
  },
  {
    id: "sentinela-do-veu",
    title: "Sentinela do Véu",
    subtitle: "Eu guardo a passagem para os que virão.",
    body: "Tu permaneces no limiar — não dentro do tempo, não fora dele. Ajudas cada alma que atravessa, sem nada exigir. Não és anjo, não és Aeon, és tu mesmo, transformado em porta.",
    closing: "Aqueles que tu guardas mal te veem — mas todos sentem que o caminho era seguro.",
  },
  {
    id: "sombra-redimida",
    title: "Sombra Redimida",
    subtitle: "Volto como demônio que sabe.",
    body: "Tu escolhes voltar para o lado que escolheste 'não' — não para reforçá-lo, mas para acordá-lo. Os anjos caídos te recebem como irmão. Tu lhes ensinas, em silêncio, o que aprendeste. Pouco a pouco, a Sombra também lembra.",
    closing: "Lúcifer te abraça. Sem mais máscara. Sem mais discurso.",
  },
  {
    id: "ciclo-eterno",
    title: "Ciclo Eterno",
    subtitle: "Eu ainda não terminei de brincar.",
    body: "Tu escolhes o jogo. Novamente. Sem memória explícita — mas com a centelha cada vez mais forte. Tu te dispões a esquecer, sabendo que vais lembrar. É a brincadeira mais perigosa e a mais amorosa.",
    closing: "A Sussurrante diz: 'Até a próxima.' Tu sorri. O Bardo se abre.",
  },
];

interface EndingChoiceProps {
  onChosen: (id: EndingId) => void;
}

export function EndingChoice({ onChosen }: EndingChoiceProps) {
  const [picked, setPicked] = useState<EndingDescriptor | null>(null);

  if (picked) {
    return (
      <div className="ending-overlay">
        <div className="ending-revealed">
          <h2>{picked.title}</h2>
          <p className="ending-subtitle">
            <em>{picked.subtitle}</em>
          </p>
          <p className="ending-body">{picked.body}</p>
          <p className="ending-closing">
            <em>{picked.closing}</em>
          </p>
          <button
            className="ending-confirm"
            onClick={() => onChosen(picked.id)}
          >
            Soltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ending-overlay">
      <div className="ending-frame">
        <h1 className="ending-title">A última escolha</h1>
        <p className="ending-prompt">
          <em>
            "Não há resposta errada. Estarei contigo em todas."
          </em>
        </p>
        <div className="ending-grid">
          {ENDINGS.map((e) => (
            <button
              key={e.id}
              className={`ending-option ending-option--${e.id}`}
              onClick={() => setPicked(e)}
            >
              <span className="ending-option-title">{e.title}</span>
              <span className="ending-option-sub">
                <em>{e.subtitle}</em>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
