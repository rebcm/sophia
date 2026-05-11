import { create } from "zustand";

/* =========================================================
   cinematicStore — controle das 18+1 cinemáticas
   ---------------------------------------------------------
   Persiste entre vidas (parte do "saber do jogador").
   Ver docs/18-cinematicas-revelacao-progressiva.md
   e docs/21-o-anuncio-conjunto.md
   ========================================================= */

export type CinematicId =
  | "prologo" // 1 — Antes do Tempo
  | "athoth-cai" // 2 — Sono Era Roubo
  | "yobel-cai" // 3 — Ouro Era Sombra
  | "adonaios-cai" // 4 — Coragem Acorrentada
  | "eloaios-cai" // 5 — Lei Esqueceu de Ser Lei
  | "galila-cai" // 6 — Beleza Falsificada
  | "harmas-cai" // 7 — Palavras Roubadas
  | "iaoth-cai" // 8 — Tu Eras Antes do Tempo
  | "asmodeus-cai" // 9
  | "lucifer-cai" // 10
  | "belial-cai" // 11
  | "azazel-cai" // 12
  | "semyaza-cai" // 13
  | "leviata-cai" // 14
  | "demiurgo-cai" // 15
  | "grande-revelacao" // 16
  | "anuncio-conjunto" // 16.5 — trégua cósmica
  | "veu" // 17
  | "monada" // 18
  // Sprint 60-61 · expansão (intra-terrenas + julgamento)
  | "rei-do-mundo" // Agartha
  | "sodoma-interedida"; // Sodoma

interface CinematicEntry {
  id: CinematicId;
  watched: boolean;
  watchedAt: number | null;
  /** Vezes que o jogador rewatched no Codex. */
  rewatches: number;
}

interface CinematicState {
  /** Cinemática em curso (null se nenhuma). */
  currentCinematic: CinematicId | null;
  /** Histórico de cinemáticas assistidas. */
  watched: Record<CinematicId, CinematicEntry>;

  // Actions
  playCinematic: (id: CinematicId) => void;
  finishCurrentCinematic: () => void;
  skipCurrentCinematic: () => void;
  rewatchCinematic: (id: CinematicId) => void;

  // Helpers
  hasWatched: (id: CinematicId) => boolean;
  watchedCount: () => number;

  // Hidratação
  hydrate: (data: Partial<CinematicState>) => void;

  // Reset completo
  resetCinematics: () => void;
}

const ALL_IDS: CinematicId[] = [
  "prologo",
  "athoth-cai",
  "yobel-cai",
  "adonaios-cai",
  "eloaios-cai",
  "galila-cai",
  "harmas-cai",
  "iaoth-cai",
  "asmodeus-cai",
  "lucifer-cai",
  "belial-cai",
  "azazel-cai",
  "semyaza-cai",
  "leviata-cai",
  "demiurgo-cai",
  "grande-revelacao",
  "anuncio-conjunto",
  "veu",
  "monada",
];

function emptyEntry(id: CinematicId): CinematicEntry {
  return { id, watched: false, watchedAt: null, rewatches: 0 };
}

function initialWatched(): Record<CinematicId, CinematicEntry> {
  const obj = {} as Record<CinematicId, CinematicEntry>;
  for (const id of ALL_IDS) obj[id] = emptyEntry(id);
  return obj;
}

export const useCinematicStore = create<CinematicState>((set, get) => ({
  currentCinematic: null,
  watched: initialWatched(),

  playCinematic: (id) => set({ currentCinematic: id }),

  finishCurrentCinematic: () =>
    set((s) => {
      const id = s.currentCinematic;
      if (!id) return s;
      const entry = s.watched[id];
      const updated: CinematicEntry = {
        ...entry,
        watched: true,
        watchedAt: entry.watchedAt ?? Date.now(),
      };
      return {
        currentCinematic: null,
        watched: { ...s.watched, [id]: updated },
      };
    }),

  skipCurrentCinematic: () => set({ currentCinematic: null }),

  rewatchCinematic: (id) =>
    set((s) => ({
      currentCinematic: id,
      watched: {
        ...s.watched,
        [id]: { ...s.watched[id], rewatches: s.watched[id].rewatches + 1 },
      },
    })),

  hasWatched: (id) => get().watched[id]?.watched ?? false,
  watchedCount: () =>
    Object.values(get().watched).filter((e) => e.watched).length,

  hydrate: (data) =>
    set((s) => ({
      ...s,
      ...data,
      // Garantir que watched tenha todas as chaves
      watched: { ...initialWatched(), ...(data.watched ?? s.watched) },
    })),

  resetCinematics: () =>
    set({
      currentCinematic: null,
      watched: initialWatched(),
    }),
}));
