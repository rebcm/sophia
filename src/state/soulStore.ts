import { create } from "zustand";

/* =========================================================
   soulStore — estado da ALMA do jogador
   ---------------------------------------------------------
   Persiste entre vidas (entre reencarnações de corpo).
   Persiste entre sessões (localStorage via SaveSystem).

   Princípio gnóstico: o corpo morre, a alma transmigra.
   (Ver docs/05c-customizacao-e-permadeath.md)
   ========================================================= */

/** Centelha conquistada de cada esfera/eixo. */
export type CentelhaId =
  | "olhar-lucido" // Selene / Ratanabá
  | "fala-raiz" // Hermes / Mu
  | "toque-compassivo" // Aphros / Lemúria
  | "chama-interior" // Helios / El Dorado
  | "coracao-firme" // Ares / Hiperbórea
  | "palavra-de-nomeacao" // Zeus / Atlântida
  | "memoria-do-pleroma" // Kronos / Pré-Adamita
  | "lembranca-profunda" // Eras
  | "discernimento"; // Sistemas

/** Alinhamento entre Luz, Sombra e Equilíbrio. */
export interface Alignment {
  light: number; // 0-100
  shadow: number; // 0-100
  balance: number; // 0-100
}

/** Registro de uma vida vivida. */
export interface PastLife {
  id: string;
  era: string;
  characterName: string;
  story: string; // 2-4 frases narrativas
  sleepersAwakened: number;
  causeOfDeath?: string;
  startedAt: number;
  endedAt?: number;
}

/** Sleeper despertado (registrado pela alma). */
export interface AwakenedSleeper {
  id: string;
  name: string;
  trueName?: string;
  isLegendary: boolean;
  awakenedAt: number;
  awakenedInLife: number; // índice em pastLives
}

interface SoulState {
  // Centelhas conquistadas
  centelhas: Set<CentelhaId>;
  addCentelha: (c: CentelhaId) => void;
  hasCentelha: (c: CentelhaId) => boolean;

  // Luz Interior — 0..9 (era 0..7, ampliado conforme bíblia)
  light: number;
  addLight: (amount: number) => void;
  setLight: (value: number) => void;

  // Alinhamento Luz/Sombra/Equilíbrio
  alignment: Alignment;
  addToAlignment: (key: keyof Alignment, amount: number) => void;

  // Sleepers despertados (acumulados entre vidas)
  awakenedSleepers: AwakenedSleeper[];
  recordAwakened: (s: AwakenedSleeper) => void;
  hasAwakened: (id: string) => boolean;

  // Vidas anteriores
  pastLives: PastLife[];
  beginNewLife: (life: PastLife) => void;
  endCurrentLife: (cause?: string) => void;
  currentLifeIndex: number;

  // Reset (para test/debug, não usar em prod)
  resetSoul: () => void;

  // Hidratação (vinda do SaveSystem)
  hydrate: (data: Partial<SoulState>) => void;
}

const initialAlignment: Alignment = {
  light: 50,
  shadow: 0,
  balance: 0,
};

export const useSoulStore = create<SoulState>((set, get) => ({
  centelhas: new Set<CentelhaId>(),
  addCentelha: (c) =>
    set((s) => {
      if (s.centelhas.has(c)) return s;
      const next = new Set(s.centelhas);
      next.add(c);
      return { centelhas: next };
    }),
  hasCentelha: (c) => get().centelhas.has(c),

  light: 0.4,
  addLight: (amount) =>
    set((s) => ({ light: Math.min(9, Math.max(0, s.light + amount)) })),
  setLight: (value) => set({ light: Math.min(9, Math.max(0, value)) }),

  alignment: { ...initialAlignment },
  addToAlignment: (key, amount) =>
    set((s) => ({
      alignment: {
        ...s.alignment,
        [key]: Math.min(100, Math.max(0, s.alignment[key] + amount)),
      },
    })),

  awakenedSleepers: [],
  recordAwakened: (sleeper) =>
    set((s) => {
      if (s.awakenedSleepers.some((a) => a.id === sleeper.id)) return s;
      return { awakenedSleepers: [...s.awakenedSleepers, sleeper] };
    }),
  hasAwakened: (id) => get().awakenedSleepers.some((a) => a.id === id),

  pastLives: [],
  currentLifeIndex: -1,
  beginNewLife: (life) =>
    set((s) => ({
      pastLives: [...s.pastLives, life],
      currentLifeIndex: s.pastLives.length,
    })),
  endCurrentLife: (cause) =>
    set((s) => {
      if (s.currentLifeIndex < 0) return s;
      const lives = [...s.pastLives];
      const idx = s.currentLifeIndex;
      lives[idx] = {
        ...lives[idx],
        endedAt: Date.now(),
        causeOfDeath: cause,
      };
      return { pastLives: lives };
    }),

  resetSoul: () =>
    set({
      centelhas: new Set<CentelhaId>(),
      light: 0.4,
      alignment: { ...initialAlignment },
      awakenedSleepers: [],
      pastLives: [],
      currentLifeIndex: -1,
    }),

  hydrate: (data) =>
    set((s) => ({
      ...s,
      ...data,
      // Set precisa ser reconstruído (não vem do JSON)
      centelhas: data.centelhas
        ? new Set(Array.from(data.centelhas as unknown as CentelhaId[]))
        : s.centelhas,
    })),
}));
