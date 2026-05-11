import { create } from "zustand";

/* =========================================================
   gameStore — estado da SESSÃO atual
   ---------------------------------------------------------
   Não persistente. Reinicia a cada sessão de jogo.
   Para estado persistente, ver soulStore / characterStore.
   ========================================================= */

/** Fase macro do jogo (qual tela está ativa). */
export type MetaPhase =
  | "title" // tela de abertura
  | "character-creation" // customização inicial diegética
  | "cinematic" // assistindo cinemática
  | "game" // gameplay 3D ativo
  | "menu"; // pause/codex/options

/** Fase narrativa dentro do gameplay 3D (legado do MVP). */
export type Phase =
  | "intro" //  tela de abertura, esperando primeiro clique (legado)
  | "awaken" //  jogador caiu no Jardim, sem HUD ainda
  | "whisper-arrives" //  Sussurrante chega, primeiro diálogo
  | "explore" //  jogador explora, vê o Velho
  | "approach-elder" //  perto do Velho, prompt de despertar
  | "awakening" //  mini-game ativo
  | "elder-awake" //  pós-despertar, Velho fala
  | "free-roam"; //  fim do MVP — a Sussurrante incentiva a procurar mais

export interface DialogLine {
  speaker: string;
  text: string;
  /** Indício pós-fala (ex: "pressione espaço"). */
  hint?: string;
}

interface GameState {
  // Meta-fase (tela ativa)
  metaPhase: MetaPhase;
  setMetaPhase: (m: MetaPhase) => void;

  // Fase narrativa (dentro do gameplay)
  phase: Phase;
  setPhase: (p: Phase) => void;

  // Toast (notificação flutuante)
  toast: { title: string; name: string } | null;
  showToast: (title: string, name: string) => void;
  hideToast: () => void;

  // Diálogo atual
  dialog: DialogLine | null;
  setDialog: (d: DialogLine | null) => void;

  // Sistema de lugar (debug/HUD)
  place: string;
  setPlace: (p: string) => void;

  // Codex (sessão)
  codexOpen: boolean;
  setCodexOpen: (o: boolean) => void;
  toggleCodex: () => void;

  // Olhar Lúcido — visão de auras (sessão)
  olharLucidoActive: boolean;
  setOlharLucido: (active: boolean) => void;
  toggleOlharLucido: () => void;

  // Áudio
  audioEnabled: boolean;
  enableAudio: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  metaPhase: "title",
  setMetaPhase: (m) => set({ metaPhase: m }),

  phase: "intro",
  setPhase: (p) => set({ phase: p }),

  toast: null,
  showToast: (title, name) => set({ toast: { title, name } }),
  hideToast: () => set({ toast: null }),

  dialog: null,
  setDialog: (d) => set({ dialog: d }),

  place: "Jardim dos Ecos",
  setPlace: (p) => set({ place: p }),

  codexOpen: false,
  setCodexOpen: (o) => set({ codexOpen: o }),
  toggleCodex: () => set((s) => ({ codexOpen: !s.codexOpen })),

  olharLucidoActive: false,
  setOlharLucido: (active) => set({ olharLucidoActive: active }),
  toggleOlharLucido: () =>
    set((s) => ({ olharLucidoActive: !s.olharLucidoActive })),

  audioEnabled: false,
  enableAudio: () => set({ audioEnabled: true }),
}));
