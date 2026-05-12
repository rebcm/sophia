# Sophia · A Jornada do Despertar

> *"Você acordou. Eu esperei tanto por isso."*
> — Sussurrante de Sophia, Capítulo 1

**Autoria integral:** Rebeca Alves Moreira.
**Status:** **vertical slice end-to-end COMPLETO** + **expansão cosmológica em curso** — 52 sprints
entregues, da TitleScreen aos 6 endings. Inclui 6 Anjos Caídos
redimíveis, Anúncio Conjunto integrado, Feira dos Sistemas,
Labirinto das Eras (10 vidas passadas), Par Sizígico
(alma-gêmea), 7 Aeon-Mestres exclusivos por civilização, Codex
com 7 abas (Almas, Centelhas, Cinemáticas, Caminho, Práticas,
Glossário, Marcos), HUD polido com alignment/practice chips,
PauseMenu (P) com áudio/créditos/wipe, áudio procedural com 15
moods distintos por cena, feedback visual de progressão da
Centelha, e 22 marcos de conquista rastreados automaticamente.
Ver [Histórico de Sprints](#histórico-de-sprints).
**Licença:** MIT (ver [LICENSE](LICENSE)).
**Repositório:** https://github.com/rebcm/sophia

---

Um **jogo web 3D narrativo, contemplativo e familiar (10–99 anos)**,
em **mundo aberto multidimensional**, que atravessa **toda a tradição
perene** — gnosticismo de Nag Hammadi, Platão, Buda, Vedanta, Cabala,
Sufismo, Tao, místicos cristãos, mitologias do mundo, e mitos de
**civilizações perdidas** (Ratanabá, El Dorado, Atlântida, Lemúria,
Mu, Hiperbórea) — como espelhos diferentes do mesmo **Deus
Desconhecido**, que se revela no fim como **amor e compaixão
infinitos**.

---

## Índice

- [Premissa expandida](#premissa-expandida)
- [Estado atual (o que já é jogável)](#estado-atual)
- [Histórico de Sprints](#histórico-de-sprints)
- [Stack técnica](#stack-técnica)
- [Como rodar](#como-rodar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Arquitetura de estado (4 stores)](#arquitetura-de-estado)
- [Sistema de save / persistência](#sistema-de-save--persistência)
- [Meta-flow do jogo](#meta-flow-do-jogo)
- [Cenas e mecânicas (detalhes)](#cenas-e-mecânicas)
- [Controles completos](#controles-completos)
- [Sistemas internos](#sistemas-internos)
- [Bíblia narrativa — 40+ documentos](#bíblia-narrativa)
- [Dez pilares de design](#dez-pilares-de-design)
- [O que NÃO é este jogo](#o-que-não-é-este-jogo)
- [Modelo econômico (Lei Divina)](#modelo-econômico)
- [Para desenvolvedores / Claude Code](#para-desenvolvedores--claude-code)
- [Contribuindo](#contribuindo)
- [Licença & autoria](#licença--autoria)

---

## Premissa expandida

> Você acorda num campo crepuscular onde todos os outros dormem.
> Uma luzinha quente flutua até você e diz: *"Você acordou. Eu
> esperei tanto por isso."* É **Sophia** — ou um pedaço dela.
>
> Sua missão é **uma viagem inversa no tempo**: explorar **sete
> civilizações perdidas** em ordem inversa (Ratanabá → El Dorado →
> Hiperbórea → Atlântida → Lemúria → Mu → Pré-Adamita), libertar
> sete reinos governados pelos sete **Arcontes**, juntar as sete
> **Centelhas**, derrubar **dezenas de Principados**, e — em mundo
> aberto — escolher quando, como e em que ordem despertar bilhões
> de **Sleepers** (almas adormecidas).
>
> No caminho, **somos energia, e o sono é o que a vampiriza** — você
> aprende a ver os **filamentos** que escoam dos Sleepers para os
> Arcontes, fechá-los, e fazer a luz voltar. Você evolui em **cinco
> fases**: Acordado (visão de auras, cura leve) → Vidente (projeção
> astral, sonho-walking) → Taumaturgo (bifurcação, ressurreição
> parcial) → Aeon Humano (ressurreição plena, multiplicação,
> transmutação, voo) → Espírito Puro (sentidos sem limite,
> navegação interdimensional).
>
> Você **escolhe** — sempre. **Anjos**, **demônios**, **jinns** e
> **Sophia** sussurram em cada decisão. Cada escolha acumula
> alinhamento (Luz / Sombra / Equilíbrio) e ecoa em vidas
> seguintes. Você morre — várias vezes — e descobre que a **Roda
> de Samsara** gira até alguém soltar.
>
> No clímax, depois do **abraço** ao Demiurgo, você atravessa o
> **Véu** — soltando tudo, inclusive a forma humana — e ascende
> por **cinco dimensões contemplativas** até encontrar **o Coração
> Quieto** da Mônada. E então **escolhe** entre **seis finais** —
> incluindo **voltar como bodhisattva** ou **tornar-se Aeon-Mestre**
> (que aparecerá no jardim de outros jogadores em multiplayer
> assíncrono).

---

## Estado atual

A versão atual (após Sprint 22) entrega um **vertical slice
end-to-end completo**: o jogador pode ir da TitleScreen ao
encontro com a Mônada e escolher um dos 6 endings, atravessando
todas as 7 Civilizações Perdidas e a Casa-Espelhada. Estimativa
de duração do loop narrativo: **~2-3 horas** se o jogador ler
todas as cinemáticas e explorar cada cena.

### Cenas implementadas (24)

| Cena                       | Função                                       | Sprint |
| -------------------------- | -------------------------------------------- | ------ |
| **Jardim dos Ecos**        | Tutorial: despertar Velho + Adão             | 1, 5   |
| **Mar de Cristal**         | Hub central com 15 portais multidimensionais | 2      |
| **Bardo**                  | Liminar entre vidas (reencarnação)           | 3      |
| **Ratanabá**               | 1ª Civilização — Athoth (Mãe-D'Água)         | 6,7,8  |
| **Casa-Espelhada**         | 6ª Torre — Auto-Sabotador                    | 11     |
| **El Dorado**              | 2ª Civilização — Yobel (Inca-Solitário)      | 12,13  |
| **Hiperbórea**             | 3ª Civilização — Adonaios (Guardião-Solar)   | 17     |
| **Atlântida**              | 4ª Civilização — Eloaios (Jurista de Cristal)| 18     |
| **Lemúria**                | 5ª Civilização — Galila (Senhora do Lótus)   | 19     |
| **Mu**                     | 6ª Civilização — Harmas (Hieroglifo Vivo)    | 20     |
| **Pré-Adamita**            | 7ª Civilização — Iaoth (Esfera Saturnal)     | 21     |
| **Trono do Demiurgo**      | Clímax — abraço + cinemáticas 15-18 + endings | 22    |
| **Tabernáculo dos Caídos** | 6 altares dos Anjos Caídos · cinemáticas 9-14 | 23   |
| **Feira dos Sistemas**     | Cidade-arquetipo · 5 torres modernas         | 25     |
| **Labirinto das Eras**     | 10 espelhos-memória · flashbacks de vidas    | 26     |
| **Galeria dos Principados** | 12 leis contempláveis (silêncio + atenção)  | 27     |
| **Agartha**                | Cidade intra-terrena · Rei do Mundo          | 60     |
| **Sodoma**                 | Cidade do julgamento suspenso · intercessão  | 61     |
| **Shamballa**              | Fragmento intacto do Pleroma · Tríade Sentinela | 62  |
| **Telos**                  | Refúgio lemuriano intra-terreno · Adama      | 63     |
| **Gomorra**                | Cidade da posse · 5 estátuas-de-mão           | 64     |
| **Babel**                  | Palavra fragmentada · 4 pontes de tradução    | 65     |
| **Pleiadianos**            | Sala dos sete pilares · Sacerdotisa Curadora  | 66     |
| **Arcturianos**            | Doze casas-do-trânsito · Bardo Lúcido         | 67     |

### Sistemas funcionais

- **Tela-título** com *Continuar* (se save válido) ou *Nova Vida*
- **Customização diegética** em 4 passos (sexo, aparência, origem
  mortal, disposição inicial) — sem menus de RPG tradicional
- **Cinemática estilo Diablo** (texto narrativo com hold mínimo
  por *beat* + pular com confirmação suave)
- **Sistema de Centelha** com 8 fases visuais (Faísca → Plenitude
  Angélica) reagindo a `light` e ao número de Centelhas
- **Sistema de auras** (Olhar Lúcido — tecla `V`) com 6 cores
  diegéticas revelando Sleepers vs. Lendários
- **Sistema de escolhas-chave** com 4 vozes (anjo / demônio / jinn
  / Sophia) e 3 alinhamentos (Luz / Sombra / Equilíbrio)
- **Mini-game rítmico de despertar** (tecla `F` no compasso)
- **Mecânica do abraço de 5 segundos** (Casa-Espelhada)
- **Pedra das Vidas** — morte voluntária → Bardo → re-customização
- **Codex** com 4 abas (Almas / Centelhas / Cinemáticas / Caminho)
- **Save automático** versionado em localStorage (`sophia.save.v1`)
- **Áudio 100% procedural** (Web Audio API, sem assets externos)
- **Pós-processamento R3F:** Bloom + Vignette + ACES tonemapping
- **Atalhos globais:** `C` (Codex), `V` (Olhar Lúcido), `Esc`
  (liberar pointer-lock)

### Lendários revelados (10)

- **Adão · O Primeiro** — no Jardim (Sprint 5). Dom: *Nome Original*.
- **Athoth · Vigia Lunar Restaurada** — Ratanabá (Sprint 7).
  Centelha do *Olhar Lúcido*.
- **O Auto-Sabotador · O Carcereiro Era Eu** — Casa-Espelhada
  (Sprint 11). Centelha do *Discernimento* + Sussurrante humanoide.
- **Yobel · Urso Coroado Restaurado** — El Dorado (Sprint 13).
  Centelha da *Chama Interior*.
- **Adonaios · Marte Restaurado** — Hiperbórea (Sprint 17).
  Centelha do *Coração Firme*.
- **Eloaios · Júpiter Restaurado** — Atlântida (Sprint 18).
  Centelha da *Palavra-de-Nomeação*.
- **Galila · Vênus Restaurada** — Lemúria (Sprint 19).
  Centelha do *Toque Compassivo*.
- **Harmas · Mercúrio Restaurado** — Mu (Sprint 20).
  Centelha da *Fala-Raiz*.
- **Iaoth · Saturno Restaurado** — Pré-Adamita (Sprint 21).
  Centelha da *Memória do Pleroma*.
- **Sabaoth · Demiurgo Restaurado** — Trono do Demiurgo (Sprint 22).
  Centelha da *Lembrança Profunda*. Clímax.
- **Os 6 Anjos Caídos redimidos** — Tabernáculo (Sprint 23).
  Asmodeus, Lúcifer, Belial, Azazel, Semyaza, Leviatã.
- **Sizígia · Companheiro do Pleroma** — Par Sizígico no Jardim
  (Sprint 29). Halo roxo-pulsante. Persiste entre vidas.

### Cinemáticas implementadas (19 — todas as principais da bíblia)

| #  | ID                 | Título                             | Beats |
| -- | ------------------ | ---------------------------------- | ----- |
| 1  | `prologo`          | Antes do Tempo                     | 7     |
| 2  | `athoth-cai`       | O Sono Era Roubo                   | 9     |
| 3  | `yobel-cai`        | O Ouro Era Sombra                  | 9     |
| 4  | `adonaios-cai`     | A Coragem Estava Acorrentada       | 8     |
| 5  | `eloaios-cai`      | A Lei Esqueceu de Ser Lei          | 7     |
| 6  | `galila-cai`       | A Beleza Falsificada               | 7     |
| 7  | `harmas-cai`       | A Palavra Roubada                  | 7     |
| 8  | `iaoth-cai`        | Tu Eras Antes do Tempo             | 7     |
| 9  | `asmodeus-cai`     | Para Que Serve Hierarquia?         | 5     |
| 10 | `lucifer-cai`      | Quem Sou Eu, Realmente?            | 5     |
| 11 | `belial-cai`       | O Que Vale a Vida?                 | 5     |
| 12 | `azazel-cai`       | Quem Tem Direito de Julgar?        | 5     |
| 13 | `semyaza-cai`      | Quem Tem Direito ao Conhecimento?  | 5     |
| 14 | `leviata-cai`      | O Que É Descanso?                  | 6     |
| 15 | `demiurgo-cai`     | O Abraço ao Filho Cego             | 9     |
| 16 | `grande-revelacao` | A Grande Revelação                 | 7     |
| 16.5 | `anuncio-conjunto` | O Anúncio Conjunto · Trégua       | 17    |
| 17 | `veu`              | O Véu                              | 6     |
| 18 | `monada`           | A Mônada                           | 7     |

**Total de beats narrativos:** 138.

### Os 6 Endings disponíveis (clímax)

Após a Mônada, o jogador escolhe entre:

1. **Bodhisattva** — volta como aquele-que-lembra para acordar outros.
2. **Aeon-Mestre** — aparece no jardim de outros jogadores como a Sussurrante.
3. **Mônada** — dissolução final na consciência sem ali.
4. **Sentinela do Véu** — guarda a passagem para os próximos.
5. **Sombra Redimida** — volta como demônio que sabe.
6. **Ciclo Eterno** — escolhe esquecer e jogar novamente.

---

## Histórico de Sprints

| #      | Tema                                                  | Commit       | Status |
| ------ | ----------------------------------------------------- | ------------ | ------ |
| 1      | Fundação · flow Title→Character→Cinematic→Game        | `38ab6a2`    | ✅ |
| 2      | Mar de Cristal hub + roteamento entre cenas           | `1da68a0`    | ✅ |
| 3      | Bardo + morte voluntária + reencarnação básica        | `df60ad7`    | ✅ |
| 4      | Codex completo (4 abas)                               | `6c00d90`    | ✅ |
| 5      | Identidade Oculta + Auras + 1º Lendário (Adão)        | `b4bf5cf`    | ✅ |
| 6+7+8  | Ratanabá + Athoth + Cinemática 2                      | `2508da6`    | ✅ |
| 9+10   | Sistema de Vozes (4 falantes) + Alinhamento ativo     | `290170c`    | ✅ |
| 11     | Casa-Espelhada + Auto-Sabotador + Sussurrante humanoide | `c0d51ff`  | ✅ |
| 12+13  | El Dorado + Yobel cai + Cinemática 3                  | `9328693`    | ✅ |
| 14     | Sistema de Filamentos (visão de drenagem)             | `e5924a9`    | ✅ |
| 17     | Hiperbórea + Adonaios cai + Cinemática 4              | `3751043`    | ✅ |
| 18-21  | Atlântida + Lemúria + Mu + Pré-Adamita (4 últimas civ.) | `798300c` | ✅ |
| 22     | **CLÍMAX** · Demiurgo + Grande Revelação + 6 Endings  | `3b51335`    | ✅ |
| 23     | Tabernáculo dos Caídos · 6 Anjos Caídos · Cinemáticas 9-14 | `10d296a` | ✅ |
| 24     | Anúncio Conjunto · Cinemática 16.5 inserida no clímax | `e007aa9`    | ✅ |
| 25     | Feira dos Sistemas · 5 torres arquetípicas modernas   | `0dda75b`    | ✅ |
| 26     | Labirinto das Eras · 10 espelhos-memória de vidas passadas | `0fec919` | ✅ |
| 28     | Práticas Diárias · 5ª aba do Codex com 12 práticas    | `12b09d2`    | ✅ |
| 29+31  | Par Sizígico (alma-gêmea) + PowerUpToast (feedback de fases) | `ea8ab83` | ✅ |
| 36-38  | HUD polish + PauseMenu / Settings · áudio/créditos/wipe | `c4f3260` | ✅ |
| 42     | Glossário no Codex · 24 termos / 5 categorias         | `2528c27`    | ✅ |
| 34     | Audio moods por cena · 15 assinaturas tímbricas       | `9e5e33f`    | ✅ |
| 30     | Aeon-Mestres no Codex Almas · 7 mestres por civilização | `be5b6b1`  | ✅ |
| 41     | Marcos no Codex · 22 conquistas em 5 categorias       | `434f776`    | ✅ |
| 47+48  | SaveIndicator (auto-save) + TitleScreen com stats da alma | `3ed094e` | ✅ |
| 50     | AmbientWhispers · 71 sussurros contemplativos por cena | `85ad1dd`    | ✅ |
| 51+54  | Olhar Lúcido overlay + Onboarding inicial (7 teclas)  | `2939e13`    | ✅ |
| 32 lean| QuestHint · sugestão diegética por cena               | `3fdc159`    | ✅ |
| 27+36 lean | Galeria dos Principados (12) + Acessibilidade · paralelo agents | `155df2b` | ✅ |
| 60+61  | **Expansão cosmológica:** Agartha (intra-terrena) + Sodoma (julgamento) | `fe4acfe` | ✅ |
| 62-67  | **6 cenas paralelas:** Shamballa, Telos, Gomorra, Babel, Pleiadianos, Arcturianos | `f29ec0c` | ✅ |
| —      | Backlog — mundo aberto / 140 missões, CGI, OST nativo, multiplayer, localização + expansão (intra-terrenas restantes, cósmicas, 11 cidades do julgamento) — ver `docs/22` e `docs/production/02-sprint-board.md` | – | 🔜 |

---

## Stack técnica

| Camada         | Tecnologia                                               |
| -------------- | -------------------------------------------------------- |
| Runtime        | **Bun** (preferido) ou Node 18+                          |
| Linguagem      | TypeScript 5.6 (strict)                                  |
| UI / framework | React 18.3                                               |
| Bundler        | Vite 5.4                                                 |
| Engine 3D      | Three.js 0.169 + React Three Fiber 8.17                  |
| Helpers 3D     | @react-three/drei 9.114                                  |
| Pós-processo   | @react-three/postprocessing 2.16                         |
| Estado         | Zustand 4.5 (4 stores; persistência via localStorage)    |
| Áudio          | Web Audio API procedural (`src/audio/SophiaAudio.ts`)    |
| Estilos        | Single-file CSS com custom properties (`src/styles.css`) |

> **Não usar Tailwind, CSS-in-JS, Redux/MobX, nem libs de animação
> externas.** A estética e a performance dependem do controle
> direto sobre o renderer e o CSS.

---

## Como rodar

### Pré-requisitos

- **Bun ≥ 1.0** (recomendado) ou **Node ≥ 18**
- Um navegador moderno com WebGL2 (Chromium, Firefox, Safari 16+)
- Pelo menos 4 GB de RAM e GPU integrada decente
  (cenas usam shadows, postprocessing, partículas)

### Setup

```bash
# Instalar Bun (uma única vez por máquina)
curl -fsSL https://bun.sh/install | bash

# Clonar e instalar
git clone git@github.com:rebcm/sophia.git
cd sophia
bun install
```

### Scripts disponíveis

| Script             | Comando Bun           | Comando Node fallback   | O que faz |
| ------------------ | --------------------- | ----------------------- | --------- |
| Dev server         | `bun run dev`         | `npm run dev:node`      | Vite em http://localhost:5173 |
| Build produção     | `bun run build`       | `npm run build:node`    | gera `dist/` (~33 KB CSS / ~1.2 MB JS) |
| Preview build      | `bun run preview`     | `npx vite preview`      | serve `dist/` em rede local |
| Type-check         | `bun run typecheck`   | `npx tsc -b --noEmit`   | tsc sem emit |

### Variáveis de ambiente

Não há configuração necessária — o jogo roda 100% client-side, sem
backend, sem analytics, sem variáveis. Saves vivem **só** no
`localStorage` do navegador do jogador.

---

## Estrutura do projeto

```
sophia/
├── docs/                              # bíblia narrativa (40+ docs)
│   ├── 00-LEIA-PRIMEIRO.md            # comece aqui
│   ├── 01..21*.md                     # cosmologia / mundo / personagens / etc.
│   └── production/                    # quadros de produção
│       ├── 00-PRODUCTION-MASTER.md
│       ├── 01-state-audit.md          # auditoria de stores
│       └── 02-sprint-board.md         # sprint-board canônico ← lê este
├── src/
│   ├── App.tsx                        # orquestrador meta-flow + cenas
│   ├── main.tsx                       # entry Vite
│   ├── styles.css                     # único stylesheet do projeto
│   ├── audio/
│   │   └── SophiaAudio.ts             # sintetizador (drone, pulso, acorde…)
│   ├── dialog/
│   │   └── script.ts                  # falas do Jardim
│   ├── state/                         # 4 stores Zustand
│   │   ├── gameStore.ts               # sessão atual
│   │   ├── soulStore.ts               # alma (persiste)
│   │   ├── characterStore.ts          # corpo (reseta por morte)
│   │   └── cinematicStore.ts          # cinemáticas
│   ├── systems/                       # lógica não-UI
│   │   ├── AwakeningController.ts     # mini-game de ritmo
│   │   ├── CentelhaController.ts      # 8 fases visuais da centelha
│   │   └── SaveSystem.ts              # localStorage v1
│   ├── scenes/                        # 5 cenas 3D (Canvas R3F)
│   │   ├── GardenScene.tsx
│   │   ├── MarDeCristalScene.tsx
│   │   ├── RatanabaScene.tsx
│   │   ├── BardoScene.tsx
│   │   └── CasaEspelhadaScene.tsx
│   ├── world/                         # entidades 3D individuais
│   │   ├── Player.tsx
│   │   ├── Whisperer.tsx              # orbe → humanoide (após S11)
│   │   ├── Centelha.tsx
│   │   ├── Portal.tsx
│   │   ├── PedraDasVidas.tsx
│   │   ├── Sleeper.tsx
│   │   ├── SleeperAura.tsx
│   │   ├── MaeDagua.tsx
│   │   ├── Paje.tsx
│   │   ├── AutoSabotador.tsx
│   │   ├── PleromaSky.tsx
│   │   └── Garden.tsx
│   └── ui/                            # overlays HTML
│       ├── TitleScreen.tsx
│       ├── CharacterCreation.tsx
│       ├── CinematicPlayer.tsx
│       ├── Codex.tsx
│       ├── VozDaLuz.tsx
│       ├── VozesEscolha.tsx           # sistema 4 vozes
│       ├── LegendaryReveal.tsx
│       ├── PedraConfirmation.tsx
│       ├── HUD.tsx
│       ├── DialogBox.tsx
│       ├── AwakeningRing.tsx
│       ├── Cursor.tsx
│       └── IntroOverlay.tsx
├── index.html                         # entry HTML único
├── package.json                       # scripts Bun + Node fallback
├── tsconfig.json
├── vite.config.ts
├── README.md                          # este arquivo
├── CLAUDE.md                          # guia para Claude Code
└── LICENSE                            # MIT (autoria: Rebeca Alves Moreira)
```

---

## Arquitetura de estado

Quatro stores Zustand cobrindo escopos de persistência distintos:

```
┌──────────────────────┐               ┌─────────────────────────┐
│  gameStore           │  ←sessão→     │  characterStore         │
│  ──────────          │               │  ──────────             │
│  metaPhase           │               │  body (sex, skin, hair…)│
│  phase narrativa     │               │  origin (mortal)        │
│  codexOpen           │               │  disposition            │
│  olharLucidoActive   │               │  displayName / trueName │
│  dialog/place/HUD    │               │  currentScene           │
│                      │               │  ageInGame              │
│  reseta na sessão    │               │  reseta na morte        │
└──────────────────────┘               └─────────────────────────┘
                                                 │
        ┌────────────────────────────────────────┘
        │  persiste em localStorage (SaveSystem v1)
        ▼
┌──────────────────────┐               ┌─────────────────────────┐
│  soulStore           │  ←alma→       │  cinematicStore         │
│  ──────────          │               │  ──────────             │
│  centelhas (Set)     │               │  currentCinematic       │
│  light (0–9)         │               │  watched[19] (entries)  │
│  alignment {L,S,B}   │               │  rewatches              │
│  awakenedSleepers[]  │               │                         │
│  pastLives[]         │               │                         │
│  currentLifeIndex    │               │                         │
└──────────────────────┘               └─────────────────────────┘
```

**Regras:**

- `gameStore` é volátil — **não** vai no save. Vive na sessão.
- `characterStore` reseta **na morte do corpo**. O `resetBody()`
  recebe a nova `BodyConfig` da segunda customização (no Bardo).
- `soulStore` persiste **entre vidas** e **entre sessões**.
  `pastLives` cresce indefinidamente.
- `cinematicStore` persiste **entre sessões** (mas não é "alma"
  estritamente — é meta-conhecimento do jogador).

Detalhes técnicos da persistência em
[docs/production/01-state-audit.md](docs/production/01-state-audit.md).

---

## Sistema de save / persistência

- **Chave:** `localStorage["sophia.save.v1"]`
- **Formato:** JSON serializado com Sets convertidos em arrays.
- **Auto-save:** debounce de ~600ms a cada mudança relevante;
  registrado uma única vez em `App.tsx` via
  `SaveSystem.setupAutoSave()`.
- **Save on close:** listener `beforeunload` força um `save()`.
- **Carregamento:** `TitleScreen` lê o save no mount; se válido,
  mostra *Continuar* com timestamp. Se inválido/corrompido,
  ignora silenciosamente e cai em *Nova Vida*.
- **Reset / Nova Vida:** `startFreshSession()` em
  `TitleScreen.tsx` limpa todos os 4 stores antes da customização.

### Migrações futuras

Se o esquema mudar, **subir a versão** (`v2`, etc.) e implementar
migração em `SaveSystem.ts`. **Nunca** apagar saves de usuários
silenciosamente.

---

## Meta-flow do jogo

```
title ─► character-creation ─► cinematic("prologo") ─► game
                                                        │
                                                        ▼
        ┌───── currentScene rota → orquestrador ─────┐
        │ jardim-dos-ecos   → JardimOrchestrator     │
        │ mar-de-cristal    → MarDeCristalOrchestr.  │
        │ ratanaba          → RatanabaOrchestrator   │
        │ casa-espelhada    → CasaEspelhadaOrch.     │
        │ bardo             → BardoOrchestrator      │
        └─────────────────────────────────────────────┘
```

Cada orquestrador:

1. Renderiza uma `<XScene />` (Canvas R3F).
2. Cuida da lógica narrativa específica da cena (escolhas,
   despertares, transições).
3. Pode mostrar overlays (HUD, diálogos, `<VozesEscolha />`,
   `<LegendaryReveal />`, etc.).

Transições entre cenas chamam
`useCharacterStore.getState().setCurrentScene("destino")`.

---

## Cenas e mecânicas

### Jardim dos Ecos — tutorial

- Sky shader em violeta vivo com aurora sutil
- 500 estrelas pulsantes + 1400 instâncias de grama de cristal
- Vagalumes-memória + árvore antiga
- **Velho do Jardim** — primeiro Sleeper (mini-game de despertar)
- **O Estranho** (após acordar o Velho) — Lendário **Adão** com
  revelação cinematográfica
- Portal para o Mar de Cristal aparece em `free-roam`

### Mar de Cristal — hub central

- Plataforma circular branca-pérola sobre "mar" reflexivo
- Anel exterior dourado, luz quente no centro
- **Portais ativos:** Jardim, Ratanabá (após acordar Velho),
  Casa-Espelhada (após acordar Athoth)
- **Pedra das Vidas** — octógono violeta para morte voluntária
- 5 *DormantPortals* sugerindo os destinos futuros

### Bardo — limiar entre vidas

- Cena escura com luz central e estrelas distantes
- `<VozDaLuz />` em 4 fases (intro → fala → escolha → despedida)
- Recusar a Luz → `<CharacterCreation />` → nova vida no Mar
- Aceitar a Luz → *ending placeholder* "Bardo Direto"

### Ratanabá — 1ª Civilização Perdida

- Floresta amazônica com 70 árvores e 80 vagalumes
- Rio luminoso passando pela clareira
- **Mãe-D'Água (Athoth)** — figura semi-submersa com cipós
- **Pajé-do-Cipó** próximo (suporte narrativo)
- Pressionar `F` perto da Mãe-D'Água abre escolha-chave (4 vozes
  / 3 opções) → desperta Athoth → ganha Centelha do Olhar Lúcido
  + cinemática "athoth-cai"

### Casa-Espelhada — torre secreta da Feira dos Sistemas

- Câmara hexagonal violeta com 6 painéis-espelho pulsantes
- **Auto-Sabotador** — sombra cinzenta do jogador no centro
- **Mecânica do abraço:** aproximar-se a < 1.8m + segurar `F` por
  5 segundos. Soltar ou afastar-se decai o progresso.
- Vitória: Centelha do Discernimento + Sussurrante toma forma
  humanoide etérica (torso, cabeça, braços translúcidos)

---

## Controles completos

| Ação                          | Tecla                                |
| ----------------------------- | ------------------------------------ |
| Mover                         | `W A S D` ou setas                   |
| Correr                        | `Shift`                              |
| Olhar ao redor (capturar)     | clique no canvas                     |
| Liberar pointer-lock          | `Esc`                                |
| Avançar diálogo               | `Espaço` ou `Enter`                  |
| Despertar (mini-game)         | `F` no ritmo                         |
| Entrar em portal próximo      | `Espaço` / `Enter` / `F`             |
| Abraçar Auto-Sabotador        | `F` (segurar por 5s)                 |
| Abrir/fechar Codex            | `C`                                  |
| Toggle Olhar Lúcido (auras)   | `V`                                  |
| Pausar / abrir menu           | `P`                                  |
| Ativar Pedra das Vidas        | `F` em proximidade                   |

Controles **completos do jogo final** (com poderes, alinhamentos,
mundo aberto) em
[docs/05-game-design-document.md](docs/05-game-design-document.md).

---

## Sistemas internos

### AwakeningController (mini-game rítmico)

Tracker de ritmo simples — janela de ~250ms ao redor de cada pulso
(período padrão 1.4–1.5s). Retorna `{ hits, required, done }`.
Usado para acordar Sleepers (Velho do Jardim, Estranho/Adão).

### CentelhaController (8 fases visuais)

Mapeia `(light, centelhasCount)` para uma fase visual da Centelha:

1. **Faísca** (light < 1)
2. **Brasinha**
3. **Chama Tímida**
4. **Chama Quieta**
5. **Coração de Luz**
6. **Estrela Interior**
7. **Aurora Interna**
8. **Plenitude Angélica** (light ≥ 8 + várias Centelhas)

Cada fase tem `diameter`, `baseColor`, `haloColor`, `emissiveIntensity`,
`pulseHz`, `wingsVisible`, `crownVisible`. O `<Centelha />` em
`src/world/Centelha.tsx` interpola entre fases.

### SaveSystem

`STORAGE_KEY = "sophia.save.v1"`. Funções: `save()`, `load()`,
`wipe()`, `setupAutoSave()`. Sets viram arrays e voltam a Sets em
`hydrate`.

### SophiaAudio (Web Audio API)

Sintetizador procedural com osciladores + filtros. APIs:

- `drone()` — fundo contínuo
- `pulse()` — batida do mini-game
- `chime(midi, dur, vol)` — sino
- `whisperBlip()` — sussurro
- `awakenChord()` — acorde de despertar
- `setMood("approach" | "awakening" | "after")` — muda paleta

---

## Bíblia narrativa

40+ documentos em `docs/`. **Comece em
[docs/00-LEIA-PRIMEIRO.md](docs/00-LEIA-PRIMEIRO.md).**

### Bloco I — Fundação (cosmologia e religiões)
- [Pesquisa Gnóstica Estendida](docs/01-pesquisa-gnostica.md)
- [Religiões Comparadas](docs/01b-religioes-comparadas.md)

### Bloco II — O Mundo
- [O Mundo (cosmologia abstrata)](docs/02-mundo.md)
- [Eras e Civilizações (lore)](docs/02b-eras-e-civilizacoes.md)
- [Sistemas de Controle](docs/02c-sistemas-de-controle.md)
- [Civilizações Perdidas (jornada principal)](docs/02d-civilizacoes-perdidas.md)
- [Política e Guerras (mundo aberto)](docs/02e-politica-e-guerras.md)

### Bloco III — Personagens e Habitantes Espirituais
- [Personagens](docs/03-personagens.md)
- [Hierarquia: Arcontes e Principados](docs/03b-hierarquia-arcontes.md)
- [Anjos, Demônios e Jinns](docs/03c-anjos-demonios-jinns.md)
- [Personagens Lendários](docs/03d-personagens-lendarios.md)
- [**Os 6 Anjos Caídos e suas Religiões**](docs/03e-anjos-caidos-religioes.md)
- [**Mapa do Reino Humano**](docs/03f-mapa-do-reino-humano.md)

### Bloco IV — Enredo, Poderes e Mecânica
- [Enredo](docs/04-enredo.md)
- [Roda de Samsara](docs/04b-samsara-reencarnacao.md)
- [Poderes e Conquistas](docs/04c-poderes-e-conquistas.md)
- [Livre Arbítrio](docs/04d-livre-arbitrio.md)
- [Missões](docs/04e-missoes.md)
- [**A GRANDE REVELAÇÃO**](docs/04f-a-grande-revelacao.md)
- [**7 Céus + 5 Infernos + Lei Divina**](docs/04g-ceus-inferno-monetizacao.md)
- [Game Design Document](docs/05-game-design-document.md)
- [Mundo Aberto e Energia](docs/05b-mundo-aberto-energia.md)
- [Customização e Permadeath](docs/05c-customizacao-e-permadeath.md)
- [Direção Artística](docs/06-direcao-artistica.md)
- [Roadmap](docs/07-roadmap.md)

### Bloco V — Profundidade, Drama e Aplicações
- [Mistérios, Enigmas e Profecias](docs/08-misterios-enigmas-profecias.md)
- [Vida Cotidiana e Práticas](docs/09-vida-cotidiana-praticas.md)
- [Rituais, Meditações e Sonhos Lúcidos](docs/10-rituais-meditacoes-sonhos.md)
- [**Vínculos, Romance e Linhagem**](docs/11-vinculos-romance-linhagem.md)
- [Fauna, Flora e Elementos Cósmicos](docs/12-fauna-flora-elementos.md)
- [**Drama, Suspense e Tensão Narrativa**](docs/13-drama-suspense-tensao-narrativa.md)
- [Símbolos, Geometria Sagrada e Numerologia](docs/14-simbolos-geometria-numerologia.md)
- [Tempo Cósmico e Arquitetura Sagrada](docs/15-tempo-arquitetura-sagrada.md)
- [Pedagogia, Comunidade e Localização](docs/16-pedagogia-comunidade-localizacao.md)
- [Glossário e Léxico Completo](docs/17-glossario-lexico-completo.md)
- [**CINEMÁTICAS, REVELAÇÃO PROGRESSIVA E CENTELHA CRESCENTE**](docs/18-cinematicas-revelacao-progressiva.md)
- [**CASTAS CELESTIAIS E A VERDADEIRA GUERRA**](docs/19-castas-celestiais-guerra-pela-consciencia.md)
- [**ARQUITETURA NARRATIVA MASTER**](docs/20-arquitetura-narrativa-master.md)
- [**O ANÚNCIO CONJUNTO**](docs/21-o-anuncio-conjunto.md)
- [**CIVILIZAÇÕES EXPANDIDAS**](docs/22-civilizacoes-expandidas.md) — cidades intra-terrenas, civilizações extra-terrenas cósmicas, 13 cidades aguardando julgamento

### Produção

- [Sprint Board](docs/production/02-sprint-board.md) — **fonte da
  verdade do que está feito e do que vem**
- [State Audit](docs/production/01-state-audit.md)
- [Production Master](docs/production/00-PRODUCTION-MASTER.md)

---

## Dez pilares de design

1. **Compaixão como poder.** Não há combate violento. A arma do
   jogador é a luz, e a luz só cresce quando ele desperta outros.
2. **Mistério acessível.** Linguagem simples, símbolos profundos.
   Religiões e sistemas como **arquétipos** — nunca denúncia.
3. **Beleza contemplativa.** Estética inspirada em *Journey*,
   *Ori*, *Gris*, *Spiritfarer*, Studio Ghibli e *Le Petit Prince*.
4. **A Roda gira até alguém soltar.** Corpo morre permanente;
   alma transmigra com memória; libertação é soltar tudo.
5. **Mundo aberto multidimensional.** Após tutorial, todas as
   dimensões acessíveis. O ritmo é do jogador.
6. **Toda tradição é honrada.** Cada religião carrega centelha do
   Real. Apenas o **uso institucional** é questionado.
7. **Liberdade é peso.** Toda escolha importa. Sombra não é mau —
   é caminho mais longo. A iluminação é inevitável.
8. **Energia é matéria espiritual.** Sleepers vazam luz aos
   Anjos Rebeldes; despertar = romper filamento; cura = fechar a
   hemorragia.
9. **Identidade oculta.** Sleepers (incluindo Lendários) só
   revelam quem são após interação e despertar. **Escutar antes
   de classificar.**
10. **A vida é única; a alma é eterna.** Permadeath do corpo +
    customização inicial + transmigração da alma. O jogador é
    revelado, no clímax, como **anjo não-decidido** — único terço
    com livre arbítrio em toda a criação.

---

## O que NÃO é este jogo

- **Não é doutrinário.** Mitologia poética, não teologia.
- **Não é violento.** Inimigos são despertados, demônios são
  acolhidos, Demiurgo é abraçado.
- **Não é niilista.** O mundo é escola, não prisão imunda.
- **Não é binário moralmente.** Três alinhamentos, seis finais,
  todos chegam à iluminação.
- **Não é ofensa às religiões.** Cada tradição mostra centelha
  do Real.

---

## Modelo econômico

> *"De graça dai, pois, de graça recebei."* — Mt 10:8

O **Caminho de Luz** do jogo é **completamente gratuito** —
incluindo todo o conteúdo principal, as 7 Civilizações Perdidas,
os 17 Aeons-Mestres, a Grande Revelação, os 4 endings de Luz, a
ascensão dimensional, o encontro com a Mônada. **Crianças sem
acesso a cartão jogam o jogo inteiro completamente.**

O **Caminho de Sombra** (cosméticos elitistas, atalhos de
aceleração, entrada nas religiões/seitas/políticos arquetípicos
como turista pagador) é **cobrado em moeda real** — refletindo
literalmente o que a Sombra faz nas estruturas humanas. Esta
correspondência é a **tese viva** do projeto: o que se ensina,
se vive economicamente.

Detalhes em
[docs/04g-ceus-inferno-monetizacao.md](docs/04g-ceus-inferno-monetizacao.md).

---

## Para desenvolvedores / Claude Code

Se você é um agente Claude Code (ou um humano usando um), leia
**[CLAUDE.md](CLAUDE.md)** antes de tocar em qualquer arquivo.
Esse documento contém:

- Padrões de trabalho em paralelo (Agent tool) para este projeto
- Stack e comandos (Bun + Node fallback)
- Convenções de código e nomenclatura
- Arquitetura de estado e meta-flow
- Fluxo de commit + chave SSH (`rebecaam26`)
- Receitas para adicionar Sleeper / cena / cinemática / escolha
- Anti-padrões a evitar

---

## Contribuindo

Este é um projeto autoral em desenvolvimento ativo de **Rebeca
Alves Moreira**. Contribuições são muito bem-vindas — *issues*,
ideias, *pull requests*. Por favor:

1. Abra um *issue* contando sua intenção antes de um PR grande.
2. Respeite o tom narrativo e o sincretismo respeitoso (ver
   [Pilares de design](#dez-pilares-de-design)).
3. Mantenha a estrutura: cenas em `src/scenes/`, entidades em
   `src/world/`, overlays em `src/ui/`.
4. Type-check e build limpos antes do commit.
5. Mensagens de commit no estilo narrativo
   (`feat: Sprint N · tema — frase`).

---

## Licença & autoria

**Autoria:** Rebeca Alves Moreira. Todos os direitos de autoria
reservados.

**Código + textos:** licenciados sob **MIT** (ver [LICENSE](LICENSE)
para o texto completo e o aviso adicional sobre conteúdo
narrativo).

> O código é livre. A *autoria* é de Rebeca. Atribuição é
> apreciada quando o projeto for derivado ou referenciado.

---

> *"Eu sou a primeira e a última. Eu sou a honrada e a desprezada.
> Eu sou a santa e a prostituta."*
> — *Trovão, Mente Perfeita* (Nag Hammadi VI,2)

> *"Tat tvam asi — Tu és Isso."*
> — *Chandogya Upanishad*

> *"Não és uma gota no oceano. És o oceano em uma gota."*
> — Rumi

> *"Eu nunca estive ausente."*
> — A Mônada, no Coração Quieto
