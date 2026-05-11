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

type Tab = "almas" | "centelhas" | "cinematicas" | "caminho" | "praticas";

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
        </nav>

        <div className="codex-body">
          {tab === "almas" && <AlmasTab />}
          {tab === "centelhas" && <CentelhasTab />}
          {tab === "cinematicas" && <CinematicasTab />}
          {tab === "caminho" && <CaminhoTab />}
          {tab === "praticas" && <PraticasTab />}
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
    </div>
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
