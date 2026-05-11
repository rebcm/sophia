/* =========================================================
   CentelhaController — lógica das 8 Fases da Centelha
   ---------------------------------------------------------
   Centelha cresce com Luz Interior + vitórias maiores.
   Ver docs/18-cinematicas-revelacao-progressiva.md §2
   ========================================================= */

export type CentelhaPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface CentelhaVisualConfig {
  /** Diâmetro em metros no mundo 3D. */
  diameter: number;
  /** Cor base (hex). */
  baseColor: string;
  /** Cor de borda/halo (hex). */
  haloColor: string;
  /** Intensidade emissiva (0..3). */
  emissiveIntensity: number;
  /** Frequência de pulso (Hz). */
  pulseHz: number;
  /** Raio de aura/luz ambiente em metros. */
  auraRadius: number;
  /** Asas visíveis no avatar do jogador. */
  wingsVisible: "none" | "tenue" | "semi" | "plenas" | "vivas";
  /** Coroa visível. */
  crownVisible: boolean;
  /** Nome dramático da fase. */
  label: string;
  /** Frase descritiva. */
  description: string;
}

const PHASE_CONFIGS: Record<CentelhaPhase, CentelhaVisualConfig> = {
  1: {
    diameter: 0.01,
    baseColor: "#FFE9D0",
    haloColor: "#FFE9D0",
    emissiveIntensity: 0.4,
    pulseHz: 0.4,
    auraRadius: 0.3,
    wingsVisible: "none",
    crownVisible: false,
    label: "Faísca",
    description: "Quase invisível. Frágil. Tímida.",
  },
  2: {
    diameter: 0.03,
    baseColor: "#FFD7A8",
    haloColor: "#FFC380",
    emissiveIntensity: 0.8,
    pulseHz: 0.6,
    auraRadius: 1.0,
    wingsVisible: "none",
    crownVisible: false,
    label: "Brasa",
    description: "Dourado quente. Ritmo de coração calmo.",
  },
  3: {
    diameter: 0.06,
    baseColor: "#FFC766",
    haloColor: "#FFB14A",
    emissiveIntensity: 1.2,
    pulseHz: 0.8,
    auraRadius: 3.0,
    wingsVisible: "tenue",
    crownVisible: false,
    label: "Chama",
    description: "Dourado intenso. Asas tênues começam a aparecer.",
  },
  4: {
    diameter: 0.1,
    baseColor: "#FFB840",
    haloColor: "#FFA020",
    emissiveIntensity: 1.6,
    pulseHz: 1.0,
    auraRadius: 5.0,
    wingsVisible: "semi",
    crownVisible: false,
    label: "Fogueira-Pessoal",
    description: "Dourado + faíscas. Asas semi-visíveis quando para.",
  },
  5: {
    diameter: 0.15,
    baseColor: "#FFA820",
    haloColor: "#FF8C00",
    emissiveIntensity: 2.0,
    pulseHz: 1.2,
    auraRadius: 10.0,
    wingsVisible: "plenas",
    crownVisible: false,
    label: "Lanterna-Luminosa",
    description: "Dourado puro com bordas azul-pleroma. Asas plenas visíveis.",
  },
  6: {
    diameter: 0.2,
    baseColor: "#FFFFFF",
    haloColor: "#FFD060",
    emissiveIntensity: 2.4,
    pulseHz: 1.4,
    auraRadius: 20.0,
    wingsVisible: "plenas",
    crownVisible: false,
    label: "Sol-Interior",
    description: "Branca-dourada radiante. Asas vivas.",
  },
  7: {
    diameter: 0.3,
    baseColor: "#FFFFFF",
    haloColor: "#FFE48A",
    emissiveIntensity: 2.8,
    pulseHz: 1.5,
    auraRadius: 50.0,
    wingsVisible: "vivas",
    crownVisible: true,
    label: "Estrela-Que-Caminha",
    description: "Branco-pleroma com raios. Coroa de luz visível.",
  },
  8: {
    diameter: 0.0, // sem orbe — o corpo É a centelha
    baseColor: "#FFFFFF",
    haloColor: "#FFFFFF",
    emissiveIntensity: 3.0,
    pulseHz: 1.0,
    auraRadius: Number.POSITIVE_INFINITY,
    wingsVisible: "vivas",
    crownVisible: true,
    label: "Plenitude Angélica",
    description: "Corpo é luz. Pura vibração consciente.",
  },
};

/**
 * Calcula a fase atual da Centelha baseado em:
 * - Luz Interior (principal)
 * - Centelhas conquistadas (modificador)
 * - Demiurgo abraçado? (forçar fase 7)
 * - Atravessou Véu? (forçar fase 8)
 */
export function computeCentelhaPhase(args: {
  light: number; // 0..9
  centelhasCount: number; // 0..9
  demiurgoDefeated?: boolean;
  veuCrossed?: boolean;
}): CentelhaPhase {
  if (args.veuCrossed) return 8;
  if (args.demiurgoDefeated) return 7;

  const { light, centelhasCount } = args;

  // Combo light + centelhas; centelhas ancoram fase mínima
  if (centelhasCount >= 7) return 7;
  if (centelhasCount >= 5) return 6;
  if (centelhasCount >= 3) return 5;
  if (centelhasCount >= 1 && light >= 2.0) return 4;
  if (centelhasCount >= 1) return 3;

  if (light >= 1.5) return 3;
  if (light >= 0.8) return 2;
  return 1;
}

export function getCentelhaVisual(
  phase: CentelhaPhase,
): CentelhaVisualConfig {
  return PHASE_CONFIGS[phase];
}

/** Lista de todas as fases (para debug / UI de codex). */
export const ALL_PHASES: CentelhaPhase[] = [1, 2, 3, 4, 5, 6, 7, 8];

/** Helper: descrição completa da fase atual para HUD. */
export function phaseToHudLabel(phase: CentelhaPhase): string {
  const v = PHASE_CONFIGS[phase];
  return `Fase ${phase} · ${v.label}`;
}
