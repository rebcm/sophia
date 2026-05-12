import { create } from "zustand";

/* =========================================================
   characterStore — estado do CORPO atual
   ---------------------------------------------------------
   Zera a cada reencarnação (morte do corpo).
   Persiste apenas durante a vida atual.

   Ver docs/05c-customizacao-e-permadeath.md
   ========================================================= */

export type Sex = "homem" | "mulher" | "androgino";

export type SkinTone =
  | "muito-clara"
  | "clara"
  | "media-clara"
  | "media"
  | "media-escura"
  | "escura"
  | "muito-escura";

export type HairColor =
  | "castanho"
  | "loiro"
  | "preto"
  | "ruivo"
  | "cinza"
  | "branco-luminoso"
  | "sem-cabelo";

export type BodyHeight = "baixo" | "medio" | "alto";
export type BodyType = "esguio" | "medio" | "robusto";

/** Origem mortal — vida humana antes do despertar. */
export type MortalOrigin =
  | "citadino-contemporaneo" // Era da Informação
  | "aldeao-simples" // Reino-Refúgio
  | "refugiado-de-guerra" // Reino-Conflito
  | "eremita-viajante"
  | "filho-de-familia-rica";

/** Disposição inicial — tom emocional de chegada. */
export type Disposition =
  | "contemplativo"
  | "curioso"
  | "corajoso"
  | "compassivo";

/** Cenas/dimensões disponíveis. */
export type SceneId =
  | "jardim-dos-ecos"
  | "mar-de-cristal"
  | "ratanaba" // 1ª Civilização Perdida (Sprint 6+)
  | "casa-espelhada" // Sprint 11 — Auto-Sabotador
  | "el-dorado" // 2ª Civilização Perdida (Sprint 12+13)
  | "hiperborea" // 3ª Civilização Perdida (Sprint 17)
  | "atlantida" // 4ª Civilização Perdida (Sprint 18)
  | "lemuria" // 5ª Civilização Perdida (Sprint 19)
  | "mu" // 6ª Civilização Perdida (Sprint 20)
  | "pre-adamita" // 7ª Civilização Perdida (Sprint 21)
  | "trono-demiurgo" // Sprint 22 — clímax: Grande Revelação + 6 endings
  | "tabernaculo-dos-caidos" // Sprint 23 — 6 Anjos Caídos opcionais
  | "feira-dos-sistemas" // Sprint 25 — 5 distritos modernos arquetípicos
  | "labirinto-das-eras" // Sprint 26 — 10 eras / flashbacks de vidas passadas
  | "galeria-dos-principados" // Sprint 27 — 12 Principados contempláveis
  | "agartha" // Sprint 60 — cidade intra-terrena
  | "sodoma" // Sprint 61 — cidade aguardando julgamento
  | "shamballa" // Sprint 62 — fragmento do Pleroma
  | "telos" // Sprint 63 — refúgio lemuriano
  | "gomorra" // Sprint 64 — cidade da posse
  | "babel" // Sprint 65 — palavra fragmentada
  | "pleiadianos" // Sprint 66 — sala dos sete pilares
  | "arcturianos" // Sprint 67 — doze casas-do-trânsito
  | "bardo";

export interface BodyConfig {
  sex: Sex;
  skinTone: SkinTone;
  hairColor: HairColor;
  height: BodyHeight;
  bodyType: BodyType;
}

export interface CharacterState {
  // Configuração diegética (resultado da customização inicial)
  body: BodyConfig;
  origin: MortalOrigin;
  disposition: Disposition;

  // Nome — começa como "Você"; evolui para Nome Verdadeiro
  // gerado a partir das escolhas (ver docs/08).
  displayName: string;
  trueName: string | null;

  // Localização atual no mundo
  currentScene: SceneId;

  // Idade in-game (para futura mecânica de envelhecimento natural)
  ageInGame: number;

  // Actions
  setBody: (config: Partial<BodyConfig>) => void;
  setOrigin: (origin: MortalOrigin) => void;
  setDisposition: (d: Disposition) => void;
  setDisplayName: (name: string) => void;
  revealTrueName: (name: string) => void;
  setCurrentScene: (scene: SceneId) => void;
  ageOne: () => void;

  // Reset (chamado pela mecânica de reencarnação)
  resetBody: (newConfig: NewBodyConfig) => void;

  // Hidratação
  hydrate: (data: Partial<CharacterState>) => void;
}

export interface NewBodyConfig {
  body: BodyConfig;
  origin: MortalOrigin;
  disposition: Disposition;
}

const DEFAULT_BODY: BodyConfig = {
  sex: "androgino",
  skinTone: "media",
  hairColor: "castanho",
  height: "medio",
  bodyType: "medio",
};

export const useCharacterStore = create<CharacterState>((set) => ({
  body: { ...DEFAULT_BODY },
  origin: "citadino-contemporaneo",
  disposition: "contemplativo",
  displayName: "Você",
  trueName: null,
  currentScene: "jardim-dos-ecos",
  ageInGame: 0,

  setBody: (config) =>
    set((s) => ({ body: { ...s.body, ...config } })),
  setOrigin: (origin) => set({ origin }),
  setDisposition: (d) => set({ disposition: d }),
  setDisplayName: (name) => set({ displayName: name }),
  revealTrueName: (name) => set({ trueName: name }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  ageOne: () => set((s) => ({ ageInGame: s.ageInGame + 1 })),

  resetBody: (newConfig) =>
    set({
      body: { ...newConfig.body },
      origin: newConfig.origin,
      disposition: newConfig.disposition,
      displayName: "Você",
      trueName: null,
      currentScene: "bardo",
      ageInGame: 0,
    }),

  hydrate: (data) => set((s) => ({ ...s, ...data })),
}));
