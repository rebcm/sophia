import { useEffect, useState } from "react";
import { useSoulStore } from "../state/soulStore";
import { useCharacterStore } from "../state/characterStore";
import { useGameStore } from "../state/gameStore";

/* =========================================================
   <QuestHint /> — Sprint 32 (lean)
   ---------------------------------------------------------
   Cartão pequeno no canto superior-esquerdo abaixo do compass
   mostrando o próximo passo natural. Diegético — não é "missão",
   é "sugestão da Sussurrante". Aparece após 3s sem outro
   overlay e fade-in suave.
   ========================================================= */

interface Hint {
  text: string;
  priority: number;
}

/** Calcula o hint mais relevante baseado no estado da alma + cena.
 *  Lista de hints ordenada por prioridade — primeiro match vence. */
function pickHint(
  scene: string,
  awakenedIds: Set<string>,
  centelhasCount: number,
): Hint | null {
  // Hints específicos por cena (mais prioritários)
  if (scene === "jardim-dos-ecos") {
    if (!awakenedIds.has("velho-do-jardim")) {
      return {
        text: "Caminha até a árvore antiga. O Velho dorme ali.",
        priority: 10,
      };
    }
    if (
      awakenedIds.has("velho-do-jardim") &&
      !awakenedIds.has("adao-estranho")
    ) {
      return {
        text:
          "Algo se moveu do outro lado do Jardim. Outro Sleeper aguarda.",
        priority: 9,
      };
    }
    if (
      awakenedIds.has("velho-do-jardim") &&
      awakenedIds.has("adao-estranho")
    ) {
      return {
        text:
          "O Portal de Espelho está aberto. O Mar de Cristal te chama.",
        priority: 5,
      };
    }
  }

  if (scene === "mar-de-cristal") {
    if (!awakenedIds.has("athoth-mae-dagua")) {
      return {
        text: "Atravessa o portal de Ratanabá. A floresta sabe.",
        priority: 10,
      };
    }
    if (!awakenedIds.has("auto-sabotador")) {
      return {
        text:
          "A Casa-Espelhada se abriu. Há uma sombra que precisa ser abraçada.",
        priority: 9,
      };
    }
    if (
      awakenedIds.has("athoth-mae-dagua") &&
      !awakenedIds.has("yobel-inca-solitario")
    ) {
      return {
        text: "El Dorado destravou. O Inca-Solitário aguarda.",
        priority: 8,
      };
    }
    const arcontes = [
      "athoth-mae-dagua",
      "yobel-inca-solitario",
      "adonaios-guardiao-solar",
      "eloaios-lei-cristalina",
      "galila-beleza-viva",
      "harmas-palavra-raiz",
      "iaoth-memoria-pleroma",
    ];
    const remaining = arcontes.filter((id) => !awakenedIds.has(id)).length;
    if (remaining > 0 && remaining < 7) {
      return {
        text: `${7 - remaining} dos 7 Arcontes restaurados. Os outros aguardam.`,
        priority: 6,
      };
    }
    if (remaining === 0 && !awakenedIds.has("demiurgo")) {
      return {
        text: "Os sete Arcontes lembraram. O Trono do Demiurgo se abriu.",
        priority: 10,
      };
    }
  }

  if (scene === "ratanaba" && !awakenedIds.has("athoth-mae-dagua")) {
    return {
      text:
        "Aproxima-te da Mãe-D'Água. Pressiona F quando estiveres perto.",
      priority: 10,
    };
  }
  if (scene === "el-dorado" && !awakenedIds.has("yobel-inca-solitario")) {
    return {
      text: "O Inca-Solitário no centro. F abre a escolha das vozes.",
      priority: 10,
    };
  }
  if (scene === "hiperborea" && !awakenedIds.has("adonaios-guardiao-solar")) {
    return {
      text: "O Guardião-Solar guarda a Raiva. F para começar.",
      priority: 10,
    };
  }
  if (scene === "atlantida" && !awakenedIds.has("eloaios-lei-cristalina")) {
    return {
      text: "A ilha afunda. O Jurista de Cristal espera ser ouvido. F.",
      priority: 10,
    };
  }
  if (scene === "lemuria" && !awakenedIds.has("galila-beleza-viva")) {
    return {
      text:
        "A Senhora do Lótus canta para si. F quando estiveres pronto.",
      priority: 10,
    };
  }
  if (scene === "mu" && !awakenedIds.has("harmas-palavra-raiz")) {
    return {
      text: "O Hieroglifo Vivo no centro. F para vibrar com ele.",
      priority: 10,
    };
  }
  if (scene === "pre-adamita" && !awakenedIds.has("iaoth-memoria-pleroma")) {
    return {
      text: "A Esfera Saturnal. F para aceitar a memória nua.",
      priority: 10,
    };
  }
  if (scene === "casa-espelhada" && !awakenedIds.has("auto-sabotador")) {
    return {
      text: "Aproxima-te da sombra. Segura F por 5 respirações.",
      priority: 10,
    };
  }
  if (scene === "tabernaculo-dos-caidos") {
    const caidos = [
      "caido-asmodeus",
      "caido-lucifer",
      "caido-belial",
      "caido-azazel",
      "caido-semyaza",
      "caido-leviata",
    ];
    const done = caidos.filter((id) => awakenedIds.has(id)).length;
    if (done < 6) {
      return {
        text: `${done} de 6 caídos lembraram. Aproxima-te dos altares restantes. F.`,
        priority: 8,
      };
    }
  }
  if (scene === "labirinto-das-eras") {
    const eras = [
      "era-mito",
      "era-atlantida",
      "era-mesopotamia",
      "era-egito",
      "era-grecia",
      "era-roma",
      "era-idade-media",
      "era-renascimento",
      "era-vapor-aco",
      "era-informacao",
    ];
    const done = eras.filter((id) => awakenedIds.has(id)).length;
    if (done < 10) {
      return {
        text: `${done} de 10 eras lembradas. Os espelhos ainda esperam.`,
        priority: 8,
      };
    }
  }
  if (scene === "trono-demiurgo") {
    return {
      text:
        "Caminha até o trono. F quando estiveres perto. Não o ataques.",
      priority: 10,
    };
  }
  if (scene === "bardo") {
    return {
      text: "A Voz da Luz fala. Aceitar é descansar; recusar é voltar.",
      priority: 10,
    };
  }

  // Hint genérico — Par Sizígico aparece com 3 Centelhas
  if (centelhasCount >= 3 && scene === "jardim-dos-ecos") {
    return {
      text:
        "Algo roxo-pulsante apareceu no Jardim. F quando estiveres perto.",
      priority: 7,
    };
  }

  return null;
}

export function QuestHint() {
  const metaPhase = useGameStore((s) => s.metaPhase);
  const codexOpen = useGameStore((s) => s.codexOpen);
  const dialog = useGameStore((s) => s.dialog);
  const currentScene = useCharacterStore((s) => s.currentScene);
  const sleepers = useSoulStore((s) => s.awakenedSleepers);
  const centelhasCount = useSoulStore((s) => s.centelhas.size);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (metaPhase !== "game" || codexOpen || dialog) {
      setVisible(false);
      return;
    }
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, [metaPhase, codexOpen, dialog, currentScene]);

  const awakenedIds = new Set(sleepers.map((s) => s.id));
  const hint = pickHint(currentScene, awakenedIds, centelhasCount);

  if (!visible || !hint) return null;

  return (
    <div className="quest-hint" aria-hidden>
      <span className="quest-hint-marker">▸</span>
      <span className="quest-hint-text">{hint.text}</span>
    </div>
  );
}
