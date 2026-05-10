import { create } from "zustand";

/* =========================================================
   gameStore — estado global do jogo
   ---------------------------------------------------------
   Mantemos pequeno e narrativo. O resto vive no R3F.
   ========================================================= */

export type Phase =
  | "intro" //  tela de abertura, esperando primeiro clique
  | "awaken" //  jogador caiu no Jardim, sem HUD ainda
  | "whisper-arrives" //  Sussurrante chega, primeiro diálogo
  | "explore" //  jogador explora, vê o Velho
  | "approach-elder" //  perto do Velho, prompt de despertar
  | "awakening" //  mini-game ativo
  | "elder-awake" //  pós-despertar, Velho fala
  | "free-roam" //  fim do MVP — a Sussurrante incentiva a procurar mais
  ;

export interface DialogLine {
  speaker: string;
  text: string;
  /** Indício pós-fala (ex: "pressione espaço"). */
  hint?: string;
}

interface GameState {
  // Fase narrativa
  phase: Phase;
  setPhase: (p: Phase) => void;

  // Luz interior — 0..7
  light: number;
  addLight: (amount: number) => void;

  // Adormecidos despertados (ids)
  awakened: Set<string>;
  awaken: (id: string, name: string) => void;

  // Toast (notificação flutuante)
  toast: { title: string; name: string } | null;
  showToast: (title: string, name: string) => void;
  hideToast: () => void;

  // Diálogo atual
  dialog: DialogLine | null;
  setDialog: (d: DialogLine | null) => void;

  // Sistema de lugar (debug/HUD)
  place: string;

  // Áudio
  audioEnabled: boolean;
  enableAudio: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "intro",
  setPhase: (p) => set({ phase: p }),

  light: 0.4,
  addLight: (amount) =>
    set((s) => ({ light: Math.min(7, s.light + amount) })),

  awakened: new Set(),
  awaken: (id, name) =>
    set((s) => {
      if (s.awakened.has(id)) return s;
      const next = new Set(s.awakened);
      next.add(id);
      return {
        awakened: next,
        toast: { title: "Despertou", name },
      };
    }),

  toast: null,
  showToast: (title, name) => set({ toast: { title, name } }),
  hideToast: () => set({ toast: null }),

  dialog: null,
  setDialog: (d) => set({ dialog: d }),

  place: "Jardim dos Ecos",

  audioEnabled: false,
  enableAudio: () => set({ audioEnabled: true }),
}));
