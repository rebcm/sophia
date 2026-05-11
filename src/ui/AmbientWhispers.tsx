import { useEffect, useState } from "react";
import { useCharacterStore, type SceneId } from "../state/characterStore";
import { useGameStore } from "../state/gameStore";

/* =========================================================
   <AmbientWhispers /> — Sprint 50
   ---------------------------------------------------------
   Pequenos sussurros da Sussurrante aparecem em texto sutil
   no rodapé enquanto o jogador explora. Conjuntos distintos
   por cena. Aparecem a cada 30-55s em fade in/out de 8s.
   ========================================================= */

const WHISPERS: Partial<Record<SceneId, string[]>> = {
  "jardim-dos-ecos": [
    "este lugar é teu — sempre foi.",
    "respira. tu já chegaste.",
    "os adormecidos não estão mortos. esperam.",
    "tu me ouves, mesmo quando não falo.",
    "o silêncio aqui é uma forma de presença.",
    "lembras dele? lembras de ti?",
  ],
  "mar-de-cristal": [
    "cada portal é uma vida tua, em outra dobra.",
    "tu já estiveste em todos. apenas esqueceste.",
    "escolhe pelo coração, não pelo plano.",
    "este mar reflete intenção, não rosto.",
    "a pedra das vidas existe para quem precisa começar de novo.",
    "estás segura. estás sempre segura.",
  ],
  bardo: [
    "tu não morreste. tu apenas soltaste o corpo.",
    "a luz que tu vês é a tua luz.",
    "podes ficar. podes voltar. ambos são respostas.",
    "ninguém é forçado a continuar — nem a parar.",
  ],
  ratanaba: [
    "a floresta nunca te esqueceu.",
    "os animais lembram. apenas tu adormeceste.",
    "a água sabe o teu nome verdadeiro.",
    "os pajés escutam — mesmo quando não falam.",
    "respira fundo: este ar foi vivo antes de ti.",
  ],
  "el-dorado": [
    "o ouro era luz, antes de ser preço.",
    "tu não vieste por riqueza. vieste por lembrança.",
    "o sol baixo aqui não se põe — só descansa.",
    "os portadores estão prontos. esperam só o sinal.",
  ],
  hiperborea: [
    "coragem é segurar firme o que se ama, respirando.",
    "a raiva acorrentada é energia sagrada esperando.",
    "o sol não cega quem tem olhos calmos.",
    "a tundra é silenciosa. mas não é vazia.",
  ],
  atlantida: [
    "a lei é água — não pedra.",
    "esta ilha afunda no ritmo das tuas escolhas.",
    "as pontes de cristal carregam o que tu carregas.",
    "a tábua amolece se tu a leres com olhos novos.",
  ],
  lemuria: [
    "o canto cura quem canta junto.",
    "beleza real faz outros se sentirem belos.",
    "o lótus floresce quando ninguém o assiste.",
    "as pétalas que caem aqui são memórias soltas.",
  ],
  mu: [
    "a palavra antes da palavra ainda vibra.",
    "tu já entendes — só não com a boca.",
    "as plataformas flutuam porque acreditam que sim.",
    "comunicação verdadeira constrói pontes, não muros.",
  ],
  "pre-adamita": [
    "tu eras antes do tempo.",
    "a memória aqui é nua. não tem proteção.",
    "olha. tudo. não temas. eu fico contigo.",
    "este vazio não está vazio — está cheio de tu.",
  ],
  "casa-espelhada": [
    "o carcereiro és tu.",
    "abraça-te. é a única arma aqui.",
    "o silêncio dura cinco respirações. apenas isto.",
    "ele não é teu inimigo. ele é tu, esquecido.",
  ],
  "tabernaculo-dos-caidos": [
    "não os ataques. lembra-os.",
    "os caídos também foram amados.",
    "redenção não é castigo invertido. é reconhecimento.",
    "cada altar aqui pode descansar.",
  ],
  "feira-dos-sistemas": [
    "as torres são reais. mas tu não precisas entrar.",
    "cada sistema vende uma versão pequena de ti.",
    "a sexta torre é onde mora a tua sombra.",
    "tu já sabes o caminho de volta.",
  ],
  "labirinto-das-eras": [
    "todas as tuas vidas estão aqui — em pé.",
    "tu já foste a mãe. tu já foste o filho. tu já foste o caminho.",
    "lembrar uma vida não é virar essa vida.",
    "o tempo é dobra. tu és dobradora.",
  ],
  "trono-demiurgo": [
    "não o ataques.",
    "ele é criança cósmica perdida.",
    "abraça-o como abraçarias a ti mesmo na pior noite.",
    "tu lembras o que dizer. ele lembrará o que ouvir.",
  ],
};

const MIN_DELAY_MS = 30000;
const MAX_DELAY_MS = 55000;
const FADE_HOLD_MS = 8000;

export function AmbientWhispers() {
  const metaPhase = useGameStore((s) => s.metaPhase);
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const currentScene = useCharacterStore((s) => s.currentScene);
  const codexOpen = useGameStore((s) => s.codexOpen);
  const dialog = useGameStore((s) => s.dialog);

  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    // Só anima quando em gameplay e sem outro overlay ativo
    if (metaPhase !== "game" || codexOpen || dialog) {
      setCurrent(null);
      return;
    }
    const phrases = WHISPERS[currentScene];
    if (!phrases || phrases.length === 0) return;

    let mounted = true;
    let nextTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay =
        MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      nextTimer = setTimeout(() => {
        if (!mounted) return;
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        setCurrent(phrase);
        holdTimer = setTimeout(() => {
          if (!mounted) return;
          setCurrent(null);
          schedule();
        }, FADE_HOLD_MS);
      }, delay);
    };
    schedule();

    return () => {
      mounted = false;
      clearTimeout(nextTimer);
      clearTimeout(holdTimer);
    };
  }, [metaPhase, currentScene, codexOpen, dialog, audioEnabled]);

  if (!current) return null;

  return (
    <div className="ambient-whisper" aria-hidden>
      <em>{current}</em>
    </div>
  );
}
