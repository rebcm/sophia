import { useSoulStore } from "../state/soulStore";
import { useCharacterStore } from "../state/characterStore";
import { useCinematicStore } from "../state/cinematicStore";

/* =========================================================
   SaveSystem — persistência via localStorage
   ---------------------------------------------------------
   Schema v1.
   Persiste apenas o que pertence à ALMA + corpo atual.
   Sessão (gameStore) zera a cada reload.
   ========================================================= */

const STORAGE_KEY = "sophia.save.v1";
const SCHEMA_VERSION = 1;

interface SaveFile {
  version: number;
  savedAt: number;
  soul: ReturnType<typeof serializeSoul>;
  character: ReturnType<typeof serializeCharacter>;
  cinematic: ReturnType<typeof serializeCinematic>;
}

function serializeSoul() {
  const s = useSoulStore.getState();
  return {
    centelhas: Array.from(s.centelhas),
    light: s.light,
    alignment: s.alignment,
    awakenedSleepers: s.awakenedSleepers,
    pastLives: s.pastLives,
    currentLifeIndex: s.currentLifeIndex,
  };
}

function serializeCharacter() {
  const c = useCharacterStore.getState();
  return {
    body: c.body,
    origin: c.origin,
    disposition: c.disposition,
    displayName: c.displayName,
    trueName: c.trueName,
    currentScene: c.currentScene,
    ageInGame: c.ageInGame,
  };
}

function serializeCinematic() {
  const c = useCinematicStore.getState();
  return {
    watched: c.watched,
  };
}

/** Salva tudo no localStorage. */
/** Custom event emitido a cada save bem-sucedido (Sprint 47). */
export const SAVE_EVENT = "sophia:save-success";

export function save(): boolean {
  try {
    const data: SaveFile = {
      version: SCHEMA_VERSION,
      savedAt: Date.now(),
      soul: serializeSoul(),
      character: serializeCharacter(),
      cinematic: serializeCinematic(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Sprint 47: notifica UI via CustomEvent global
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SAVE_EVENT));
    }
    return true;
  } catch (e) {
    console.error("[SaveSystem] save failed", e);
    return false;
  }
}

/** Carrega do localStorage. Retorna `true` se havia save válido. */
export function load(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw) as SaveFile;

    if (parsed.version !== SCHEMA_VERSION) {
      console.warn(
        `[SaveSystem] save version mismatch (${parsed.version} vs ${SCHEMA_VERSION}) — running migrations`,
      );
      // Futuro: implementar migrations aqui
    }

    // Hidrata stores. Soul precisa converter array para Set.
    useSoulStore.getState().hydrate({
      ...parsed.soul,
      centelhas: parsed.soul.centelhas as unknown as Set<
        import("../state/soulStore").CentelhaId
      >,
    });
    useCharacterStore.getState().hydrate(parsed.character);
    useCinematicStore.getState().hydrate(parsed.cinematic);

    return true;
  } catch (e) {
    console.error("[SaveSystem] load failed", e);
    return false;
  }
}

/** Apaga o save (cuidado!). */
export function wipe(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Verifica se existe save persistido. */
export function hasSave(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

/** Retorna timestamp do último save (ou null). */
export function lastSavedAt(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveFile;
    return parsed.savedAt;
  } catch {
    return null;
  }
}

/** Setup auto-save quando stores mudam. Chama uma única vez. */
export function setupAutoSave(): () => void {
  // Auto-save quando soul mudar (mas com debounce)
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      save();
      saveTimer = null;
    }, 1000);
  };

  const unsubSoul = useSoulStore.subscribe(scheduleSave);
  const unsubChar = useCharacterStore.subscribe(scheduleSave);
  const unsubCine = useCinematicStore.subscribe(scheduleSave);

  return () => {
    unsubSoul();
    unsubChar();
    unsubCine();
    if (saveTimer) clearTimeout(saveTimer);
  };
}
