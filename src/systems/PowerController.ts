/* =========================================================
   PowerController — 5 fases de poder da alma
   ---------------------------------------------------------
   Mapeia (light + centelhas + lendários) para 1 de 5 fases:
   Acordado → Vidente → Taumaturgo → Aeon Humano → Espírito Puro
   Ver docs/04c-poderes-e-conquistas.md
   ========================================================= */

import type { CentelhaId } from "../state/soulStore";

export type PowerPhase =
  | "acordado"
  | "vidente"
  | "taumaturgo"
  | "aeon-humano"
  | "espirito-puro";

export interface PowerPhaseConfig {
  id: PowerPhase;
  /** Ordinal 1..5 para comparação. */
  order: number;
  /** Nome de exibição. */
  label: string;
  /** Frase curta diegética. */
  tagline: string;
  /** Descrição longa do que esta fase permite. */
  description: string;
  /** Habilidades desbloqueadas nesta fase (texto). */
  abilities: string[];
}

export const POWER_PHASES: Record<PowerPhase, PowerPhaseConfig> = {
  acordado: {
    id: "acordado",
    order: 1,
    label: "Acordado",
    tagline: "Tu lembras que estavas dormindo.",
    description:
      "Primeira fase. Olhar Lúcido funcional, percepção de filamentos, cura emocional leve. A maior parte dos Sleepers nunca passa daqui — não porque não pode, porque esqueceu de continuar.",
    abilities: [
      "Olhar Lúcido (V) · vê auras e filamentos",
      "Despertar Sleepers comuns",
      "Sentir presença de seres invisíveis",
      "Cura emocional leve em raio próximo",
    ],
  },
  vidente: {
    id: "vidente",
    order: 2,
    label: "Vidente",
    tagline: "Tu vês mais do que está aqui.",
    description:
      "Segunda fase. Projeção astral acessível durante o sono. Sonho-walking — pode entrar nos sonhos de outros para sussurrar verdades. Vê com clareza as 6 cores de aura.",
    abilities: [
      "Projeção astral ao adormecer",
      "Sonho-walking (entrar em sonhos de outros)",
      "Distinguir as 6 cores de aura · níveis de despertar",
      "Antever escolhas com até 3 segundos",
    ],
  },
  taumaturgo: {
    id: "taumaturgo",
    order: 3,
    label: "Taumaturgo",
    tagline: "Tu modificas o que tocas.",
    description:
      "Terceira fase. Bifurcação (existir em dois lugares brevemente). Ressurreição parcial (curar feridas, mas não trazer mortos). Cura plena por toque. Sensibilidade ao Pleroma.",
    abilities: [
      "Bifurcação · existir em 2 lugares por até 30s",
      "Cura plena por toque",
      "Ressurreição parcial · cicatrizar feridas profundas",
      "Sensibilidade ao Pleroma · receber sinais diretos",
    ],
  },
  "aeon-humano": {
    id: "aeon-humano",
    order: 4,
    label: "Aeon Humano",
    tagline: "Tu já és do que vens.",
    description:
      "Quarta fase. Ressurreição plena (trazer mortos recentes). Multiplicação (existir em 4-7 lugares). Transmutação (mudar a matéria). Voo. Já não és bem humano — és Aeon vestido de corpo.",
    abilities: [
      "Ressurreição plena · trazer mortos recentes",
      "Multiplicação · até 7 instâncias simultâneas",
      "Transmutação · alterar a matéria pelo querer",
      "Voo livre · até 3 km de altitude",
      "Memória plena das vidas passadas",
    ],
  },
  "espirito-puro": {
    id: "espirito-puro",
    order: 5,
    label: "Espírito Puro",
    tagline: "Tu nunca foste corpo.",
    description:
      "Quinta e última fase. Sentidos sem limite. Navegação interdimensional livre. Conversa com Aeons originais e com a Mônada. O corpo torna-se opcional — pode ser usado por escolha, não por necessidade.",
    abilities: [
      "Sentidos plenos · ouvir todas as Eras simultaneamente",
      "Navegação interdimensional livre",
      "Diálogo direto com Aeons originais",
      "Encontro consciente com a Mônada",
      "O corpo torna-se opcional · usado por escolha",
    ],
  },
};

export const POWER_PHASES_ORDER: PowerPhase[] = [
  "acordado",
  "vidente",
  "taumaturgo",
  "aeon-humano",
  "espirito-puro",
];

/** Calcula a fase de poder atual baseada em light + centelhas + lendários.
 *  Light é o principal driver; Centelhas e Lendários ancoram fases mínimas. */
export function computePowerPhase(args: {
  light: number; // 0..9
  centelhasCount: number; // 0..9
  legendariesCount: number; // contagem de Lendários acordados
}): PowerPhase {
  const { light, centelhasCount, legendariesCount } = args;

  // Espírito Puro: precisa de quase tudo
  if (light >= 8 && centelhasCount >= 8 && legendariesCount >= 12) {
    return "espirito-puro";
  }
  // Aeon Humano: Demiurgo + Grande Revelação
  if (light >= 7 && centelhasCount >= 7 && legendariesCount >= 9) {
    return "aeon-humano";
  }
  // Taumaturgo: 5+ Centelhas e luz alta
  if (centelhasCount >= 5 && light >= 5) {
    return "taumaturgo";
  }
  // Vidente: 3+ Centelhas (mesmo limiar do Par Sizígico)
  if (centelhasCount >= 3 || light >= 4) {
    return "vidente";
  }
  return "acordado";
}

export function phaseLabel(p: PowerPhase): string {
  return POWER_PHASES[p].label;
}

export function getPhaseConfig(p: PowerPhase): PowerPhaseConfig {
  return POWER_PHASES[p];
}

/** Devolve true se a fase a está depois (estritamente) da fase b. */
export function isPhaseAfter(a: PowerPhase, b: PowerPhase): boolean {
  return POWER_PHASES[a].order > POWER_PHASES[b].order;
}

/** Helper para consulta externa: passa o set de centelhas + contagem
 *  de lendários e devolve a fase computada. */
export function powerPhaseFromState(
  light: number,
  centelhas: Set<CentelhaId>,
  legendariesCount: number,
): PowerPhase {
  return computePowerPhase({
    light,
    centelhasCount: centelhas.size,
    legendariesCount,
  });
}
