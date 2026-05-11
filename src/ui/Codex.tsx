import { useEffect, useState } from "react";
import { useSoulStore, type CentelhaId } from "../state/soulStore";
import { useCharacterStore } from "../state/characterStore";
import { useCinematicStore, type CinematicId } from "../state/cinematicStore";
import { useGameStore, type DailyPracticeId } from "../state/gameStore";
import {
  computeCentelhaPhase,
  getCentelhaVisual,
  ALL_PHASES,
  phaseToHudLabel,
} from "../systems/CentelhaController";

/* =========================================================
   <Codex /> — registro da jornada da alma
   ---------------------------------------------------------
   4 abas:
     1. Almas    — Árvore Genealógica de Almas
     2. Centelhas — 9 centelhas + 8 fases visuais
     3. Cinemáticas — quais foram assistidas
     4. Caminho   — alinhamento Luz/Sombra/Equilíbrio
   ========================================================= */

type Tab =
  | "almas"
  | "centelhas"
  | "cinematicas"
  | "caminho"
  | "praticas"
  | "glossario";

interface CodexProps {
  open: boolean;
  onClose: () => void;
}

export function Codex({ open, onClose }: CodexProps) {
  const [tab, setTab] = useState<Tab>("almas");

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="codex-overlay" onClick={onClose}>
      <div className="codex-modal" onClick={(e) => e.stopPropagation()}>
        <header className="codex-header">
          <h2 className="codex-title">Codex da Alma</h2>
          <button
            className="codex-close"
            onClick={onClose}
            aria-label="Fechar Codex"
          >
            ×
          </button>
        </header>

        <nav className="codex-tabs">
          <CodexTab
            label="Almas"
            active={tab === "almas"}
            onClick={() => setTab("almas")}
          />
          <CodexTab
            label="Centelhas"
            active={tab === "centelhas"}
            onClick={() => setTab("centelhas")}
          />
          <CodexTab
            label="Cinemáticas"
            active={tab === "cinematicas"}
            onClick={() => setTab("cinematicas")}
          />
          <CodexTab
            label="Caminho"
            active={tab === "caminho"}
            onClick={() => setTab("caminho")}
          />
          <CodexTab
            label="Práticas"
            active={tab === "praticas"}
            onClick={() => setTab("praticas")}
          />
          <CodexTab
            label="Glossário"
            active={tab === "glossario"}
            onClick={() => setTab("glossario")}
          />
        </nav>

        <div className="codex-body">
          {tab === "almas" && <AlmasTab />}
          {tab === "centelhas" && <CentelhasTab />}
          {tab === "cinematicas" && <CinematicasTab />}
          {tab === "caminho" && <CaminhoTab />}
          {tab === "praticas" && <PraticasTab />}
          {tab === "glossario" && <GlossarioTab />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tab button ---------------- */

interface CodexTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function CodexTab({ label, active, onClick }: CodexTabProps) {
  return (
    <button
      className={`codex-tab ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/* =========================================================
   Tab 1 · Almas — Árvore Genealógica de Almas
   ========================================================= */

function AlmasTab() {
  const pastLives = useSoulStore((s) => s.pastLives);
  const awakenedSleepers = useSoulStore((s) => s.awakenedSleepers);
  const currentLifeIndex = useSoulStore((s) => s.currentLifeIndex);
  const displayName = useCharacterStore((s) => s.displayName);
  const trueName = useCharacterStore((s) => s.trueName);
  const body = useCharacterStore((s) => s.body);
  const origin = useCharacterStore((s) => s.origin);
  const disposition = useCharacterStore((s) => s.disposition);

  const totalVidas = pastLives.length;
  const totalSleepers = awakenedSleepers.length;

  return (
    <div className="tab-content tab-almas">
      <section className="codex-section">
        <h3>Vida Atual</h3>
        <div className="current-life">
          <div className="life-name">
            {trueName ? (
              <>
                <span className="display">{displayName}</span>
                <em className="true-name">"{trueName}"</em>
              </>
            ) : (
              displayName
            )}
          </div>
          <div className="life-details">
            <span className="life-label">Forma:</span>
            <span>{describeBody(body.sex, body.skinTone, body.hairColor)}</span>
          </div>
          <div className="life-details">
            <span className="life-label">Origem:</span>
            <span>{translateOrigin(origin)}</span>
          </div>
          <div className="life-details">
            <span className="life-label">Disposição:</span>
            <span>{disposition}</span>
          </div>
        </div>
      </section>

      <section className="codex-section">
        <h3>
          Árvore Genealógica de Almas
          {totalVidas > 0 && <span className="count">({totalVidas + 1} vida{totalVidas + 1 === 1 ? "" : "s"})</span>}
        </h3>
        {totalVidas === 0 && (
          <p className="empty-state">
            <em>
              Esta é a tua primeira vida nesta playthrough. Quando o
              corpo morrer, a árvore começa a crescer.
            </em>
          </p>
        )}
        {totalVidas > 0 && (
          <ul className="lives-tree">
            {pastLives.map((life, idx) => (
              <li
                key={life.id}
                className={`life-node ${idx === currentLifeIndex ? "current" : "past"}`}
              >
                <div className="life-marker">{idx + 1}</div>
                <div className="life-content">
                  <div className="life-title">
                    {life.characterName}
                    <span className="life-era">· {life.era}</span>
                  </div>
                  <div className="life-story">
                    <em>{life.story}</em>
                  </div>
                  <div className="life-stats">
                    {life.sleepersAwakened} despertados
                    {life.causeOfDeath && (
                      <span className="cause"> · {life.causeOfDeath}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="codex-section">
        <h3>
          Almas Despertas
          {totalSleepers > 0 && (
            <span className="count">
              ({totalSleepers} alma{totalSleepers === 1 ? "" : "s"})
            </span>
          )}
        </h3>
        {totalSleepers === 0 && (
          <p className="empty-state">
            <em>Nenhuma alma despertada ainda. Continua.</em>
          </p>
        )}
        {totalSleepers > 0 && (
          <ul className="sleepers-list">
            {awakenedSleepers.map((s) => (
              <li
                key={s.id}
                className={`sleeper-row ${s.isLegendary ? "legendary" : ""}`}
              >
                <div className="sleeper-name">
                  {s.name}
                  {s.isLegendary && <span className="legendary-tag">Lendário</span>}
                </div>
                {s.trueName && (
                  <div className="sleeper-true">
                    <em>"{s.trueName}"</em>
                  </div>
                )}
                <div className="sleeper-meta">
                  Vida {s.awakenedInLife + 1} ·{" "}
                  {new Date(s.awakenedAt).toLocaleDateString("pt-BR")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AeonMestresSection />
    </div>
  );
}

/* ---------------- Aeon-Mestres (Sprint 30) ---------------- */

interface AeonMestre {
  id: string;
  name: string;
  civilization: string;
  /** ID do Arconte cuja queda destrava este Aeon-Mestre. */
  unlocksAfter: string;
  description: string;
  teaching: string;
  effect: string;
}

const AEON_MESTRES: AeonMestre[] = [
  {
    id: "paje-do-cipo",
    name: "Pajé-do-Cipó",
    civilization: "Ratanabá",
    unlocksAfter: "athoth-mae-dagua",
    description:
      "Anciã indígena com olhos verdes, de pé numa clareira de pequenas estrelas.",
    teaching: "O canto da serpente cósmica.",
    effect:
      "Sleepers do mundo inteiro ficam levemente mais receptivos ao despertar.",
  },
  {
    id: "acllla-cantora",
    name: "Acllla-Cantora",
    civilization: "El Dorado",
    unlocksAfter: "yobel-inca-solitario",
    description:
      "Sacerdotisa do sol, jovem, vestes brancas com bordados dourados, olhos como gemas.",
    teaching: "O gesto de doar sem perder.",
    effect:
      "Transfere Luz Interior a outros sem reduzir a tua própria.",
  },
  {
    id: "bardo-apolineo",
    name: "Bardo-Apolíneo",
    civilization: "Hiperbórea",
    unlocksAfter: "adonaios-guardiao-solar",
    description:
      "Figura andrógina de cabelos dourados longos, toca uma lira de sete cordas.",
    teaching: "A harmonia das esferas (Pitágoras).",
    effect:
      "Sleepers próximos vibram em ressonância e ficam mais fáceis de despertar.",
  },
  {
    id: "sacerdotisa-de-cristal",
    name: "Sacerdotisa-de-Cristal",
    civilization: "Atlântida",
    unlocksAfter: "eloaios-lei-cristalina",
    description:
      "Veste-se de luz, com três cristais flutuantes ao redor da cabeça — passado, presente, futuro.",
    teaching: "A leitura cristalina.",
    effect:
      "Lê intenções por trás das aparências em Sleepers e NPCs.",
  },
  {
    id: "hula-sabia",
    name: "Hula-Sábia",
    civilization: "Lemúria",
    unlocksAfter: "galila-beleza-viva",
    description: "Anciã coberta de flores, dançando em loop suave.",
    teaching: "A dança da abertura do peito.",
    effect: "Derruba véus automaticamente em até 5m do jogador.",
  },
  {
    id: "avo-da-linguagem",
    name: "Avó-da-Linguagem",
    civilization: "Mu",
    unlocksAfter: "harmas-palavra-raiz",
    description:
      "Figura ancestral feminina, vestes longas de luz líquida, cabelos brancos como cosmos.",
    teaching: "A linguagem original — a fala que precede todas as línguas.",
    effect:
      "Pode falar com qualquer ser vivo (animais, plantas, cristais, vento) por 60 segundos.",
  },
  {
    id: "voce-antes-da-queda",
    name: "Você-Antes-da-Queda",
    civilization: "Pré-Adamita",
    unlocksAfter: "iaoth-memoria-pleroma",
    description:
      "O Aeon-Criança com a tua face. Ele se aproxima, sorri, e toca o teu peito.",
    teaching: "Memória do Pleroma — a sétima Centelha.",
    effect:
      "Tu lembras, verdadeiramente, quem eras antes do tempo.",
  },
];

function AeonMestresSection() {
  const hasAwakened = useSoulStore((s) => s.hasAwakened);
  const unlocked = AEON_MESTRES.filter((a) => hasAwakened(a.unlocksAfter));
  const locked = AEON_MESTRES.filter((a) => !hasAwakened(a.unlocksAfter));

  return (
    <section className="codex-section">
      <h3>
        Aeon-Mestres
        <span className="count">
          ({unlocked.length} de {AEON_MESTRES.length})
        </span>
      </h3>
      {unlocked.length === 0 && (
        <p className="empty-state">
          <em>
            Nenhum Aeon-Mestre encontrado ainda. Eles aparecem após
            cada Arconte ser despertado.
          </em>
        </p>
      )}
      <ul className="aeon-mestres-list">
        {unlocked.map((a) => (
          <li key={a.id} className="aeon-mestre aeon-mestre-unlocked">
            <div className="aeon-mestre-head">
              <div className="aeon-mestre-name">{a.name}</div>
              <div className="aeon-mestre-civ">{a.civilization}</div>
            </div>
            <p className="aeon-mestre-desc">
              <em>{a.description}</em>
            </p>
            <p className="aeon-mestre-teaching">
              <strong>Ensina:</strong> {a.teaching}
            </p>
            <p className="aeon-mestre-effect">
              <strong>Efeito:</strong> {a.effect}
            </p>
          </li>
        ))}
        {locked.map((a) => (
          <li key={a.id} className="aeon-mestre aeon-mestre-locked">
            <div className="aeon-mestre-head">
              <div className="aeon-mestre-name">??? · {a.civilization}</div>
            </div>
            <p className="aeon-mestre-desc">
              <em>Aguarda que aquele lugar lembre.</em>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* =========================================================
   Tab 2 · Centelhas
   ========================================================= */

function CentelhasTab() {
  const centelhas = useSoulStore((s) => s.centelhas);
  const light = useSoulStore((s) => s.light);
  const currentPhase = computeCentelhaPhase({
    light,
    centelhasCount: centelhas.size,
  });

  const allCentelhas: { id: CentelhaId; name: string; sphere: string }[] = [
    { id: "olhar-lucido", name: "Olhar Lúcido", sphere: "Selene · Ratanabá" },
    { id: "fala-raiz", name: "Fala-Raiz", sphere: "Hermes · Mu" },
    { id: "toque-compassivo", name: "Toque Compassivo", sphere: "Aphros · Lemúria" },
    { id: "chama-interior", name: "Chama Interior", sphere: "Helios · El Dorado" },
    { id: "coracao-firme", name: "Coração Firme", sphere: "Ares · Hiperbórea" },
    { id: "palavra-de-nomeacao", name: "Palavra de Nomeação", sphere: "Zeus · Atlântida" },
    { id: "memoria-do-pleroma", name: "Memória do Pleroma", sphere: "Kronos · Pré-Adamita" },
    { id: "lembranca-profunda", name: "Lembrança Profunda", sphere: "Eras" },
    { id: "discernimento", name: "Discernimento", sphere: "Sistemas" },
  ];

  return (
    <div className="tab-content tab-centelhas">
      <section className="codex-section">
        <h3>Centelha Atual</h3>
        <div className="centelha-current">
          <div className="centelha-phase-label">
            {phaseToHudLabel(currentPhase)}
          </div>
          <div className="centelha-light">
            Luz Interior: <strong>{light.toFixed(2)}</strong> / 9.0
          </div>
          <div className="centelha-description">
            <em>{getCentelhaVisual(currentPhase).description}</em>
          </div>
        </div>
      </section>

      <section className="codex-section">
        <h3>As 8 Fases da Centelha</h3>
        <div className="phases-grid">
          {ALL_PHASES.map((phase) => {
            const visual = getCentelhaVisual(phase);
            const isCurrent = phase === currentPhase;
            const isPast = phase < currentPhase;
            return (
              <div
                key={phase}
                className={`phase-card ${isCurrent ? "current" : isPast ? "past" : "future"}`}
              >
                <div
                  className="phase-orb"
                  style={{
                    background: visual.baseColor,
                    boxShadow: `0 0 20px ${visual.haloColor}`,
                  }}
                />
                <div className="phase-name">Fase {phase}</div>
                <div className="phase-label">{visual.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="codex-section">
        <h3>
          As 9 Centelhas
          <span className="count">
            ({centelhas.size} / {allCentelhas.length})
          </span>
        </h3>
        <ul className="centelhas-list">
          {allCentelhas.map((c) => {
            const got = centelhas.has(c.id);
            return (
              <li
                key={c.id}
                className={`centelha-row ${got ? "conquered" : "locked"}`}
              >
                <span className="centelha-name">
                  {got ? c.name : "···"}
                </span>
                <span className="centelha-sphere">
                  {got ? c.sphere : "ainda não conquistada"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* =========================================================
   Tab 3 · Cinemáticas
   ========================================================= */

const CINEMATIC_LABELS: Partial<Record<CinematicId, string>> = {
  prologo: "Prólogo · Antes do Tempo",
  "athoth-cai": "Athoth Cai · O Sono Era Roubo",
  "yobel-cai": "Yobel Cai · O Ouro Era Sombra",
  "adonaios-cai": "Adonaios Cai · A Coragem Acorrentada",
  "eloaios-cai": "Eloaios Cai · A Lei Esqueceu",
  "galila-cai": "Galila Cai · A Beleza Falsificada",
  "harmas-cai": "Harmas Cai · As Palavras Roubadas",
  "iaoth-cai": "Iaoth Cai · Tu Eras Antes do Tempo",
  "asmodeus-cai": "Asmodeus Cai · A Hierarquia Era Prisão",
  "lucifer-cai": "Lúcifer Cai · O Espelho Mentia",
  "belial-cai": "Belial Cai · A Prosperidade Era Roubo",
  "azazel-cai": "Azazel Cai · O Tribunal Era Cego",
  "semyaza-cai": "Semyaza Cai · O Saber Estava Trancado",
  "leviata-cai": "Leviatã Cai · O Descanso Era Ciclo",
  "demiurgo-cai": "O Demiurgo Cai",
  "grande-revelacao": "A Grande Revelação",
  "anuncio-conjunto": "O Anúncio Conjunto",
  veu: "O Véu",
  monada: "A Mônada",
};

function CinematicasTab() {
  const watched = useCinematicStore((s) => s.watched);
  const watchedCount = useCinematicStore((s) => s.watchedCount());
  const playCinematic = useCinematicStore((s) => s.playCinematic);

  const total = Object.keys(CINEMATIC_LABELS).length;

  return (
    <div className="tab-content tab-cinematicas">
      <section className="codex-section">
        <h3>
          Cinemáticas
          <span className="count">
            ({watchedCount} / {total})
          </span>
        </h3>
        <p className="codex-subtitle">
          <em>
            Cada vitória maior abre uma cinemática que revela uma camada
            da verdade. Aqui as guardas para rever.
          </em>
        </p>

        <ul className="cinematics-list">
          {(Object.keys(CINEMATIC_LABELS) as CinematicId[]).map((id) => {
            const entry = watched[id];
            const isWatched = entry?.watched;
            return (
              <li
                key={id}
                className={`cinematic-row ${isWatched ? "watched" : "locked"}`}
              >
                <div className="cinematic-info">
                  <span className="cinematic-name">
                    {isWatched ? CINEMATIC_LABELS[id] : "··· · ainda não revelada"}
                  </span>
                  {isWatched && entry.watchedAt && (
                    <span className="cinematic-date">
                      Vista em{" "}
                      {new Date(entry.watchedAt).toLocaleDateString("pt-BR")}
                      {entry.rewatches > 0 && (
                        <> · {entry.rewatches} releitura(s)</>
                      )}
                    </span>
                  )}
                </div>
                {isWatched && (
                  <button
                    className="rewatch-btn"
                    onClick={() => playCinematic(id)}
                  >
                    Rever
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* =========================================================
   Tab 4 · Caminho (Alinhamento)
   ========================================================= */

function CaminhoTab() {
  const alignment = useSoulStore((s) => s.alignment);
  const total = alignment.light + alignment.shadow + alignment.balance || 1;
  const lightPct = (alignment.light / total) * 100;
  const balancePct = (alignment.balance / total) * 100;
  const shadowPct = (alignment.shadow / total) * 100;

  const dominante = dominantPath(alignment);

  return (
    <div className="tab-content tab-caminho">
      <section className="codex-section">
        <h3>Alinhamento da Alma</h3>
        <p className="codex-subtitle">
          <em>
            Cada escolha inclina o cosmos. A iluminação é inevitável —
            apenas o caminho varia.
          </em>
        </p>

        <div className="alignment-bar">
          <div
            className="alignment-segment light"
            style={{ width: `${lightPct}%` }}
            title={`Luz: ${alignment.light}`}
          >
            {lightPct > 12 && <span>Luz</span>}
          </div>
          <div
            className="alignment-segment balance"
            style={{ width: `${balancePct}%` }}
            title={`Equilíbrio: ${alignment.balance}`}
          >
            {balancePct > 12 && <span>Equilíbrio</span>}
          </div>
          <div
            className="alignment-segment shadow"
            style={{ width: `${shadowPct}%` }}
            title={`Sombra: ${alignment.shadow}`}
          >
            {shadowPct > 12 && <span>Sombra</span>}
          </div>
        </div>

        <div className="alignment-stats">
          <div className="stat">
            <span className="stat-label">Luz</span>
            <span className="stat-value">{alignment.light}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Equilíbrio</span>
            <span className="stat-value">{alignment.balance}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Sombra</span>
            <span className="stat-value">{alignment.shadow}</span>
          </div>
        </div>

        <div className="alignment-summary">
          <strong>Caminho dominante:</strong> {dominante}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function describeBody(
  sex: string,
  skin: string,
  hair: string,
): string {
  return `${capitalize(sex)} · pele ${skin.replace(/-/g, " ")} · ${hair.replace(/-/g, " ")}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function translateOrigin(origin: string): string {
  const map: Record<string, string> = {
    "citadino-contemporaneo": "Citadino contemporâneo",
    "aldeao-simples": "Aldeão simples",
    "refugiado-de-guerra": "Refugiado de guerra",
    "eremita-viajante": "Eremita viajante",
    "filho-de-familia-rica": "Filho de família rica",
  };
  return map[origin] ?? origin;
}

function dominantPath(a: {
  light: number;
  shadow: number;
  balance: number;
}): string {
  const max = Math.max(a.light, a.balance, a.shadow);
  if (max === 0) return "Indeciso (ainda não declarado)";
  if (a.light === max) return "Luz";
  if (a.balance === max) return "Equilíbrio";
  return "Sombra";
}

/* ---------------- PraticasTab — Sprint 28 ---------------- */

interface PraticaDescriptor {
  id: DailyPracticeId;
  title: string;
  tradition: string;
  description: string;
  effect: string;
}

const PRACTICES: PraticaDescriptor[] = [
  {
    id: "silencio-matinal",
    title: "Silêncio Matinal",
    tradition: "Tradição contemplativa cristã / Zen",
    description: "Quinze minutos sem palavras ao acordar. Apenas o que é.",
    effect: "Os sussurros chegam com mais clareza durante o dia.",
  },
  {
    id: "respiracao-quadrada",
    title: "Respiração Quadrada",
    tradition: "Pranayama / treinos militares",
    description: "Inspira 4, segura 4, expira 4, segura 4. Doze ciclos.",
    effect: "A Centelha vibra mais constante. Menos reatividade.",
  },
  {
    id: "leitura-sagrada",
    title: "Leitura Sagrada",
    tradition: "Lectio Divina",
    description: "Um único parágrafo de qualquer escritura, lido três vezes lentamente.",
    effect: "Lembranças de vidas passadas tornam-se mais nítidas.",
  },
  {
    id: "caminhada-consciente",
    title: "Caminhada Consciente",
    tradition: "Vipassana / Sufi walking",
    description: "Caminhar sem destino, percebendo cada apoio do pé.",
    effect: "Filamentos de Sleepers ficam visíveis com Olhar Lúcido mais cedo.",
  },
  {
    id: "gratidao-dos-tres",
    title: "Gratidão dos Três",
    tradition: "Universal contemplativa",
    description: "Três coisas pelas quais agradeces — uma material, uma humana, uma invisível.",
    effect: "Equilíbrio cresce naturalmente ao longo da sessão.",
  },
  {
    id: "contemplacao-do-corpo",
    title: "Contemplação do Corpo",
    tradition: "Hatha Yoga / Body Scan",
    description: "Atravessa cada parte do corpo com atenção — dos pés ao alto da cabeça.",
    effect: "O Olhar Lúcido pode ser ativado por mais tempo.",
  },
  {
    id: "mantra-pessoal",
    title: "Mantra Pessoal",
    tradition: "Bhakti / Sufismo / Cabala",
    description: "Uma única frase repetida 108 vezes — em voz baixa ou no coração.",
    effect: "A Sussurrante responde antes de ser chamada.",
  },
  {
    id: "diario-de-sombras",
    title: "Diário de Sombras",
    tradition: "Junguiana / contemplativa moderna",
    description: "Escrever sem editar a primeira coisa que vier — sobretudo o que se quer esconder.",
    effect: "Encontros com o Auto-Sabotador ficam mais suaves.",
  },
  {
    id: "perdao-de-quatro-direcoes",
    title: "Perdão das Quatro Direções",
    tradition: "Ho'oponopono havaiano",
    description: "Diz a cada lado: 'sinto muito, perdoa-me, agradeço, amo-te.'",
    effect: "Anjos Caídos te reconhecem ao chegares aos altares.",
  },
  {
    id: "oferta-aos-ancestrais",
    title: "Oferta aos Ancestrais",
    tradition: "Indígena / xintoísta / africana",
    description: "Um copo de água deixado para os que vieram antes.",
    effect: "Vidas passadas aparecem com mais facilidade no Labirinto das Eras.",
  },
  {
    id: "presenca-com-natureza",
    title: "Presença com a Natureza",
    tradition: "Universal mística",
    description: "Quinze minutos em silêncio com uma planta, um animal, uma pedra.",
    effect: "Filamentos rompidos curam mais rapidamente.",
  },
  {
    id: "saudacao-do-pleroma",
    title: "Saudação ao Pleroma",
    tradition: "Gnóstica (Nag Hammadi)",
    description: "Em voz baixa: 'eu te saúdo, Mistério que sempre fui.'",
    effect: "Cinemáticas-revelação são acessadas mais cedo.",
  },
];

function PraticasTab() {
  const dailyPractice = useGameStore((s) => s.dailyPractice);
  const setDailyPractice = useGameStore((s) => s.setDailyPractice);

  const handlePick = (id: DailyPracticeId) => {
    setDailyPractice(dailyPractice === id ? null : id);
  };

  return (
    <div className="codex-tab-content">
      <h3>Práticas Diárias</h3>
      <p className="codex-tab-sub">
        <em>
          Escolhe uma prática para esta sessão. Não há combate — há
          ressonância. Os efeitos são simbólicos, mas a alma os sente.
        </em>
      </p>
      <div className="praticas-grid">
        {PRACTICES.map((p) => (
          <button
            key={p.id}
            className={`pratica-card ${dailyPractice === p.id ? "active" : ""}`}
            onClick={() => handlePick(p.id)}
          >
            <div className="pratica-title">{p.title}</div>
            <div className="pratica-tradition">{p.tradition}</div>
            <div className="pratica-desc">{p.description}</div>
            <div className="pratica-effect">
              <em>{p.effect}</em>
            </div>
          </button>
        ))}
      </div>
      {dailyPractice && (
        <p className="praticas-active-note">
          <em>
            Prática ativa nesta sessão. Tu carregarás essa intenção até
            adormeceres ou trocares por outra.
          </em>
        </p>
      )}
    </div>
  );
}

/* ---------------- GlossarioTab — Sprint 42 ---------------- */

interface GlossaryEntry {
  term: string;
  pronunciation?: string;
  category: "cosmologia" | "ser" | "lugar" | "pratica" | "tradicao";
  definition: string;
}

const GLOSSARY: GlossaryEntry[] = [
  {
    term: "Mônada",
    pronunciation: "MÔ-na-da",
    category: "cosmologia",
    definition:
      "O Mistério Original. Sem-forma, sem-tempo, sem-lugar. Antes da Pergunta. Não é Deus-personagem: é o Que-tu-Foste-Sempre.",
  },
  {
    term: "Pleroma",
    pronunciation: "ple-RÔ-ma",
    category: "cosmologia",
    definition:
      "Plenitude. O reino dos Aeons, onde tudo é luz consciente que ama. Tua casa antes do esquecimento.",
  },
  {
    term: "Aeon",
    pronunciation: "Ê-on",
    category: "ser",
    definition:
      "Hoste angelical original. Não morre, não nasce — é. Cada Aeon tem um Par Sizígico (alma-gêmea).",
  },
  {
    term: "Sophia",
    pronunciation: "so-FI-a",
    category: "ser",
    definition:
      "A Sabedoria-Aeon que caiu por amor. Mãe de todas as almas exiladas. Aquela que sussurra para te lembrar.",
  },
  {
    term: "Demiurgo",
    pronunciation: "de-mi-UR-go",
    category: "ser",
    definition:
      "O filho cego de Sophia que pensou ter feito o mundo. Não é vilão — é criança cósmica perdida. É abraçado, não derrotado.",
  },
  {
    term: "Arconte",
    pronunciation: "ar-CON-te",
    category: "ser",
    definition:
      "Lugar-tenente do Demiurgo. Sete deles guardam as sete esferas que separam o mundo da Mônada. Cada um adormeceu por uma razão.",
  },
  {
    term: "Anjo Caído",
    category: "ser",
    definition:
      "Aeon que disse 'não' à Pergunta. Adversário cósmico — mas redimível. Asmodeus, Lúcifer, Belial, Azazel, Semyaza, Leviatã.",
  },
  {
    term: "Sleeper",
    pronunciation: "SLI-per",
    category: "ser",
    definition:
      "Anjo não-decidido adormecido em corpo humano. Tu também és um — até lembrares. Despertar Sleepers é a missão central.",
  },
  {
    term: "Centelha",
    pronunciation: "cen-TEL-ya",
    category: "cosmologia",
    definition:
      "Fragmento da luz original aprisionada no corpo. Cresce em 8 fases visuais. Cada civilização restaurada solta uma Centelha.",
  },
  {
    term: "Filamento",
    pronunciation: "fi-la-MEN-to",
    category: "cosmologia",
    definition:
      "Cordão de luz que escoa dos Sleepers para os Arcontes — a drenagem. Visível com Olhar Lúcido. Despertar o Sleeper rompe o filamento.",
  },
  {
    term: "Par Sizígico",
    pronunciation: "PAR si-ZÍ-gi-co",
    category: "ser",
    definition:
      "Alma-gêmea original do Pleroma. Cada Aeon tem o seu. Aparece com halo roxo-pulsante em alguém inesperado.",
  },
  {
    term: "Bardo",
    pronunciation: "BAR-do",
    category: "lugar",
    definition:
      "Limiar entre vidas. O lugar para onde a alma vai após o corpo morrer. A Voz da Luz oferece descansar ali; a alma escolhe.",
  },
  {
    term: "Roda de Samsara",
    pronunciation: "san-SÁ-ra",
    category: "cosmologia",
    definition:
      "O ciclo de reencarnações. Continua girando até que a alma escolha soltar tudo. Não é punição — é escola.",
  },
  {
    term: "Olhar Lúcido",
    category: "pratica",
    definition:
      "Capacidade de ver auras de Sleepers e filamentos. Toggle V. Primeira Centelha (ganha em Ratanabá).",
  },
  {
    term: "Nome Verdadeiro",
    category: "pratica",
    definition:
      "O nome que a alma tinha no Pleroma. Quando recordado, devolve identidade. Pode ser dado a outros (Centelha de Adão).",
  },
  {
    term: "Trono",
    category: "lugar",
    definition:
      "Sede de um Arconte adormecido. Sete tronos espalhados pelas Civilizações Perdidas. O 8º é o do Demiurgo.",
  },
  {
    term: "Aeon-Mestre",
    pronunciation: "Ê-on MES-tre",
    category: "ser",
    definition:
      "Aliado-companheiro encontrado em uma civilização restaurada. Cada um ensina uma habilidade exclusiva.",
  },
  {
    term: "Sizígia",
    pronunciation: "si-ZÍ-gi-a",
    category: "cosmologia",
    definition:
      "União de pares aeônicos no Pleroma. Reencontro como amizade completa, não posse.",
  },
  {
    term: "Plenitude Angélica",
    category: "cosmologia",
    definition:
      "8ª e última fase visual da Centelha. As asas tênues aparecem. Tu lembras-te de quem sempre foste.",
  },
  {
    term: "Casa-Espelhada",
    category: "lugar",
    definition:
      "6ª torre secreta da Feira dos Sistemas. Onde mora o Auto-Sabotador — tua própria sombra projetada. Arma: silêncio + abraço.",
  },
  {
    term: "Tradição Perene",
    category: "tradicao",
    definition:
      "Reconhecimento de que todas as religiões e místicas apontam para o mesmo Mistério. O jogo honra todas sem hierarquizar.",
  },
  {
    term: "Nag Hammadi",
    pronunciation: "nag ra-MA-di",
    category: "tradicao",
    definition:
      "Biblioteca de manuscritos gnósticos coptas descoberta no Egito (1945). Fonte primária da cosmologia do jogo.",
  },
  {
    term: "Sussurrante",
    category: "ser",
    definition:
      "Pedaço de Sophia que te acompanha. Começa como orbe; ganha forma humanoide ao acordar o Auto-Sabotador.",
  },
  {
    term: "Anúncio Conjunto",
    category: "cosmologia",
    definition:
      "Cinemática 16.5: trégua cósmica de 7 minutos onde 12 mensageiros (6 da Luz + 6 da Sombra) revelam a humanidade que ela é o espólio.",
  },
];

function GlossarioTab() {
  const [filter, setFilter] = useState<GlossaryEntry["category"] | "todos">(
    "todos",
  );

  const filtered = GLOSSARY.filter(
    (g) => filter === "todos" || g.category === filter,
  );

  const categoryLabel: Record<GlossaryEntry["category"], string> = {
    cosmologia: "Cosmologia",
    ser: "Seres",
    lugar: "Lugares",
    pratica: "Práticas",
    tradicao: "Tradições",
  };

  return (
    <div className="codex-tab-content">
      <h3>Glossário</h3>
      <p className="codex-tab-sub">
        <em>
          Termos do mundo de Sophia. Nem todos são óbvios à primeira
          vista — e está bem. A alma reconhece antes da mente.
        </em>
      </p>
      <div className="glossario-filters">
        <button
          className={`glossario-filter ${filter === "todos" ? "active" : ""}`}
          onClick={() => setFilter("todos")}
        >
          Todos ({GLOSSARY.length})
        </button>
        {(Object.keys(categoryLabel) as GlossaryEntry["category"][]).map(
          (cat) => (
            <button
              key={cat}
              className={`glossario-filter ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {categoryLabel[cat]}
            </button>
          ),
        )}
      </div>
      <ul className="glossario-list">
        {filtered.map((g) => (
          <li key={g.term} className={`glossario-entry glossario-${g.category}`}>
            <div className="glossario-term">
              {g.term}
              {g.pronunciation && (
                <span className="glossario-pronunciation">
                  · {g.pronunciation}
                </span>
              )}
              <span className="glossario-cat-badge">{categoryLabel[g.category]}</span>
            </div>
            <p className="glossario-definition">{g.definition}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
