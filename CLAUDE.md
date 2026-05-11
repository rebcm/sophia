# CLAUDE.md — Guia operacional para Claude Code neste projeto

> Projeto: **Sophia · A Jornada do Despertar**
> Autoria integral: **Rebeca Alves Moreira**
> Stack: Vite + React 18 + TypeScript + Three.js (R3F) + Zustand
> Runtime preferido: **Bun**; fallback **Node**.
>
> Este arquivo NÃO é documentação para usuários — é direção para
> qualquer agente Claude Code (ou colaborador humano com agente)
> que entre neste repositório. Leia-o antes de tocar em código.

---

## 1. Princípios não-negociáveis

1. **A autoria é de Rebeca Alves Moreira.** Toda contribuição é
   serviço à visão dela. Não reescreva tom, lore ou estética sem
   sinalização explícita; sugira, não imponha.
2. **Diegese acima de UI plana.** Quase tudo — customização, morte,
   despertar, escolhas — acontece *dentro do mundo*. Antes de criar
   um menu, pergunte-se se existe um objeto/voz/lugar que possa
   carregar a mesma função.
3. **Família 10–99 anos.** Sem violência gratuita, sem horror
   gráfico, sem sexualização. Sombra existe, mas é redimível.
4. **Sincretismo respeitoso.** Gnosticismo, Vedanta, Cabala, Tao,
   Sufismo, mitos indígenas — tudo são espelhos do mesmo Mistério.
   Nunca hierarquize tradições; nunca caricature.
5. **Commits e PRs descrevem o porquê, não só o quê.** Veja
   `git log` para o padrão de mensagens (formato `feat: Sprint N ·
   <subsistema> — frase narrativa`).

---

## 2. Mapa do repositório (cole na memória)

```
sophia/
├── docs/                          # 40+ docs da bíblia narrativa
│   ├── 00-LEIA-PRIMEIRO.md        # entrada — sempre comece por aqui
│   ├── 01-pesquisa-gnostica.md
│   ├── 02-mundo.md ... 02e        # mundo / civilizações / política
│   ├── 03-personagens.md ... 03f  # personagens / hierarquia / mapa
│   ├── 04-enredo.md ... 04g       # enredo / samsara / livre-arbítrio
│   ├── 05-game-design-document.md
│   ├── 18-cinematicas-revelacao-progressiva.md
│   ├── 19-castas-celestiais-guerra-pela-consciencia.md
│   ├── 20-arquitetura-narrativa-master.md
│   ├── 21-o-anuncio-conjunto.md
│   └── production/                # quadros de produção
│       ├── 00-PRODUCTION-MASTER.md
│       ├── 01-state-audit.md
│       └── 02-sprint-board.md     # ← sprint-board canônico
│
├── src/
│   ├── App.tsx                    # orquestrador de meta-flow + cenas
│   ├── main.tsx                   # entry Vite
│   ├── audio/SophiaAudio.ts       # sintetizador procedural
│   ├── dialog/script.ts           # diálogos do Jardim
│   ├── state/
│   │   ├── gameStore.ts           # sessão (não persiste)
│   │   ├── soulStore.ts           # alma (persiste entre vidas)
│   │   ├── characterStore.ts      # corpo (reseta na reencarnação)
│   │   └── cinematicStore.ts      # cinemáticas (persiste)
│   ├── systems/
│   │   ├── AwakeningController.ts # mini-game de ritmo
│   │   ├── CentelhaController.ts  # 8 fases visuais da centelha
│   │   └── SaveSystem.ts          # localStorage v1
│   ├── scenes/                    # 5 cenas 3D (Canvas R3F)
│   │   ├── GardenScene.tsx
│   │   ├── MarDeCristalScene.tsx
│   │   ├── RatanabaScene.tsx
│   │   ├── BardoScene.tsx
│   │   └── CasaEspelhadaScene.tsx
│   ├── world/                     # entidades 3D individuais
│   │   ├── Player.tsx
│   │   ├── Whisperer.tsx          # orbe → humanoide (Sprint 11+)
│   │   ├── Centelha.tsx           # 8 fases
│   │   ├── Portal.tsx
│   │   ├── PedraDasVidas.tsx
│   │   ├── Sleeper.tsx / SleeperAura.tsx
│   │   ├── MaeDagua.tsx / Paje.tsx
│   │   ├── AutoSabotador.tsx
│   │   ├── PleromaSky.tsx / Garden.tsx
│   └── ui/                        # overlays HTML (sobre o Canvas)
│       ├── TitleScreen.tsx / CharacterCreation.tsx
│       ├── CinematicPlayer.tsx / Codex.tsx
│       ├── VozDaLuz.tsx / VozesEscolha.tsx
│       ├── LegendaryReveal.tsx / PedraConfirmation.tsx
│       ├── HUD.tsx / DialogBox.tsx / AwakeningRing.tsx / Cursor.tsx
│       └── IntroOverlay.tsx
│
├── README.md
├── LICENSE                        # MIT — autoria Rebeca Alves Moreira
├── CLAUDE.md                      # este arquivo
├── package.json / vite.config.ts / tsconfig.json
└── index.html
```

**Regra de ouro:** uma cena nova → arquivo novo em `src/scenes/`.
Uma entidade 3D nova → arquivo novo em `src/world/`. Um overlay
narrativo novo → arquivo novo em `src/ui/`. **Não inflar `App.tsx`
além do necessário para orquestração.**

---

## 3. Stack e comandos

| Operação                    | Bun (preferido)            | Node fallback           |
| --------------------------- | -------------------------- | ----------------------- |
| Instalar dependências       | `bun install`              | `npm install`           |
| Dev server                  | `bun run dev`              | `npm run dev:node`      |
| Typecheck (sem emit)        | `bun run typecheck`        | `npx tsc -b --noEmit`   |
| Build produção              | `bun run build`            | `npm run build:node`    |
| Preview build               | `bun run preview`          | `npx vite preview`      |

> **Se `bun` não estiver instalado** no sandbox da sessão, use
> `npx tsc -b --noEmit` para typecheck e `npx vite build` para
> build. **Nunca pule typecheck antes de commit.**

### Stack travada

- React 18.3 · TypeScript 5.6 · Vite 5.4
- Three.js 0.169 · @react-three/fiber 8.17 · @react-three/drei 9.114
- @react-three/postprocessing 2.16
- Zustand 4.5 (estado) — não introduza Redux/MobX/etc.
- **Nada de Tailwind nem CSS-in-JS.** O projeto usa um único
  `src/styles.css` com variáveis CSS (`--c-amber`, `--font-body`...).

### Convenções de código

- `interface` para forma de objetos, `type` para uniões/aliases.
- Componentes 3D: `<ComponentName />` no PascalCase; pastas em
  kebab/lowercase quando agruparem (não temos hoje).
- Hooks de loop de animação: `useFrame` (R3F). Limpe RAF em
  `useEffect` cleanup.
- `useRef<THREE.Group | null>(null)` para referências 3D.
- Selectors do Zustand: `useXStore((s) => s.field)` por campo —
  não pegue o store inteiro num componente que só lê um campo.

---

## 4. Arquitetura de estado (4 stores Zustand)

```
┌───────────────────┐  não persiste     ┌────────────────────┐
│  gameStore        │  (sessão)         │ characterStore     │
│  metaPhase        │                   │ body, origin,      │
│  phase narrativa  │                   │ disposition,       │
│  codexOpen        │                   │ currentScene,      │
│  olharLucidoActive│                   │ ageInGame          │
│  dialog/place/HUD │   reseta na       │ (zera por morte)   │
└───────────────────┘   reencarnação    └────────────────────┘
                                                 │
       ┌─────────────────────────────────────────┘
       │ persiste em localStorage via SaveSystem v1
       ▼
┌───────────────────┐                    ┌───────────────────┐
│  soulStore        │  persiste          │ cinematicStore    │
│  centelhas (Set)  │  entre vidas       │ currentCinematic  │
│  light (0–9)      │  e entre sessões   │ watched[19]       │
│  alignment 3-axis │                    │ rewatches         │
│  awakenedSleepers │                    └───────────────────┘
│  pastLives        │
└───────────────────┘
```

- **Toda regra de "novo estado conhecido pela alma" → soulStore.**
- **Toda customização visível do corpo → characterStore.**
- **Toda UI temporária da sessão atual → gameStore.**
- **Cinemáticas (assistido / pular / rewatch) → cinematicStore.**

### Hidratação / persistência

- `SaveSystem.setupAutoSave()` é chamado **uma vez** em `App.tsx`
  e debounces o `save()`.
- Sets (`centelhas`) viram array no JSON e são reconstruídos no
  `hydrate`.
- Esquema versionado: `STORAGE_KEY = "sophia.save.v1"`. Se mudar
  formato, suba para `v2` e implemente migração em `SaveSystem.ts`.

---

## 5. Meta-flow do jogo (entender antes de mexer em `App.tsx`)

```
title → character-creation → cinematic("prologo") → game
                                                     │
                                                     ▼
        ┌────────────── currentScene rota → orquestrador ──┐
        │ jardim-dos-ecos   → JardimOrchestrator           │
        │ mar-de-cristal    → MarDeCristalOrchestrator     │
        │ ratanaba          → RatanabaOrchestrator         │
        │ casa-espelhada    → CasaEspelhadaOrchestrator    │
        │ bardo             → BardoOrchestrator            │
        └──────────────────────────────────────────────────┘
```

- Cada orquestrador renderiza uma `<XScene />` (Canvas R3F) +
  overlays HTML específicos da cena.
- Transições entre cenas usam `useCharacterStore.getState().setCurrentScene(...)`.
- Cinemáticas: `useCinematicStore.getState().playCinematic("id")`
  + `setMetaPhase("cinematic")`. O `<CinematicPlayer />` cuida do
  resto e chama `onFinish`, devolvendo a `metaPhase = "game"`.

---

## 6. Trabalho em paralelo — como dividir trabalho neste projeto

Este é o coração deste arquivo. **Use Agent tool sempre que houver
duas ou mais frentes independentes.** Princípios:

### 6.1 Frentes naturalmente paralelizáveis

| Frente                  | Toca em                                     | Conflita com    |
| ----------------------- | ------------------------------------------- | --------------- |
| **Nova cena 3D**        | `scenes/X.tsx` + `world/*.tsx` novos        | App.tsx (rota)  |
| **Novo overlay UI**     | `ui/X.tsx` + `styles.css` (append)          | App.tsx (uso)   |
| **Novo Sleeper**        | `world/X.tsx` + entrada na cena             | nada            |
| **Documentação**        | `docs/*.md`                                 | nada            |
| **Sintetizador áudio**  | `audio/SophiaAudio.ts`                      | nada            |
| **Sistema (Zustand)**   | `state/*.ts` + `SaveSystem.ts`              | qualquer leitor |
| **Cinemática nova**     | `CinematicPlayer.tsx` (script) + `cinematicStore` | nada      |

Spawne agents em paralelo para frentes que **só tocam arquivos
diferentes**. Quando duas frentes precisam editar `App.tsx`, faça
sequencial — o orquestrador é serial.

### 6.2 Padrão recomendado para sprints

Quando o usuário pede "implementar Sprint N+M em paralelo":

1. **Leia primeiro:** `docs/production/02-sprint-board.md` para
   saber o que cada sprint exige.
2. **Particione:** cada sprint ≈ uma cena + entidades + overlay.
   Spawne 1 agent por sprint **se forem disjuntos**.
3. **Sincronize no fim:** apenas você (o agente principal) edita
   `App.tsx` para fiar tudo. Os sub-agents devolvem o código
   pronto + nome dos arquivos criados.
4. **Verificação:** rode `npx tsc -b --noEmit` UMA vez após
   integrar tudo, depois `npx vite build`.

### 6.3 Padrão de prompt para sub-agents

Quando delegar a um Agent (subagent_type: general-purpose ou
Explore), inclua:

- Caminho exato dos arquivos a criar/modificar (não deixe à
  imaginação).
- Trecho da bíblia relevante (cite `docs/...md` + linha).
- Interface TypeScript esperada se aplicável.
- Restrição: "não toque em src/App.tsx, eu integro".
- Restrição: "anexe CSS no fim de src/styles.css; não reescreva
  o arquivo".

### 6.4 Anti-padrões a evitar

- Não delegue "implemente o Sprint X" sem antes ler o sprint-board.
- Não rode 4 agents que todos editam `App.tsx`. Eles vão sobrepor.
- Não delegue "limpe o código" sem alvo — vira refactor especulativo.
- Não pergunte a um Agent para fazer Git operations; commit é
  sempre do agente principal (mantém atomicidade).

---

## 7. Fluxo de commit (padrão estabelecido)

1. `git status` + `git diff` para conferir.
2. `npx tsc -b --noEmit` deve passar **sem warnings**.
3. `npx vite build` deve passar.
4. `git add src/ docs/ <novos>` — nunca `git add -A` cego.
5. Commit com HEREDOC:
   ```
   git commit -m "$(cat <<'EOF'
   feat: Sprint N · Subsistema — frase narrativa

   Descrição curta dos arquivos novos / mudança principal.
   Por que (motivo narrativo, não técnico).

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
6. Push:
   ```
   GIT_SSH_COMMAND='ssh -i /home/lemoreira/.ssh/rebecaam26 -o IdentitiesOnly=yes' \
     git push origin main
   ```

> **A chave SSH é específica deste projeto.** Não tente HTTPS,
> não tente outra chave. Se o push falhar, peça à Rebeca antes
> de improvisar.

### Tom dos commits

Curto, narrativo, presente. Veja `git log --oneline` para o estilo.
Exemplos válidos:

- `feat: Sprint 11 · Casa-Espelhada + Auto-Sabotador + Sussurrante humanoide`
- `expand: o Anúncio Conjunto — trégua cósmica e revelação pública`
- `revise: eixo gnóstico profundo + 18 cinemáticas estilo Diablo`

---

## 8. Casos que aparecem com frequência

### "Adicionar um novo Sleeper / Lendário"

1. Criar `src/world/<Nome>.tsx` (visual 3D).
2. Se Lendário: também `src/ui/<Nome>Reveal.tsx` ou usar
   `<LegendaryReveal />` genérico.
3. Adicionar na cena: import + `<Nome position={...} />`.
4. Lógica no orquestrador da cena em `App.tsx`:
   - `recordAwakened({ id, name, trueName, isLegendary, awakenedAt, awakenedInLife })`
   - `addLight(0.8..1.5)`
   - opcional: `addCentelha("...")` e/ou `playCinematic(...)`.

### "Adicionar uma escolha-chave (3-4 opções, 4 vozes)"

1. Definir constante `KeyChoice` no orquestrador da cena.
2. Estado local `showChoice`, gatilho (proximidade + tecla).
3. `<VozesEscolha choice={...} onResolved={(opt) => ...} />`.
4. `addToAlignment(opt.alignment, opt.amount)` já é feito internamente.

### "Adicionar uma cinemática"

1. Adicionar `CinematicId` em `state/cinematicStore.ts`.
2. Adicionar entrada em `CINEMATIC_SCRIPTS` em
   `src/ui/CinematicPlayer.tsx` com `title`, `ambientColor`,
   `beats[]`.
3. Chamar via `playCinematic("id")` + `setMetaPhase("cinematic")`.
4. Se a cinemática deve devolver a uma cena diferente, ajustar
   `handleCinematicFinish` em `App.tsx`.

### "Adicionar uma cena nova"

1. Adicionar à união `SceneId` em `state/characterStore.ts`.
2. Criar `src/scenes/<Nome>Scene.tsx`.
3. Criar orquestrador em `App.tsx` (função
   `<Nome>Orchestrator`).
4. Adicionar branch em `GameOrchestrator`.
5. Adicionar portal correspondente no hub (MarDeCristalScene)
   ou no caminho narrativo.
6. Adicionar `MarDestino` se for portal saindo do Mar.

---

## 9. Coisas que SEMPRE quebram se não cuidar

- **Sets em localStorage:** `centelhas` é `Set<CentelhaId>` em
  memória, mas vira `Array` no JSON. O `hydrate` reconstrói.
  Se criar outro Set no soulStore, **replicar esse padrão**.
- **R3F + PostProcessing:** `ChromaticAberration` requer
  `radialModulation` e `modulationOffset` — não use sem isso.
- **Múltiplos `keydown` listeners:** vários componentes ouvem
  `KeyF`. Sempre limpe no cleanup do `useEffect`.
- **`metaPhase === "game"` é gate:** atalhos `C` (Codex) e `V`
  (Olhar Lúcido) só funcionam dentro do gameplay; respeite.
- **Não importe `useGameStore.getState()` dentro de render:**
  use selector `useXStore((s) => s.field)`.

---

## 10. Memória e contexto

- `docs/production/02-sprint-board.md` é a fonte da verdade do
  que foi feito vs. pendente.
- `docs/production/01-state-audit.md` reflete a arquitetura de
  estado mais recente — atualize quando criar campo novo em
  stores.
- `git log --oneline` mostra os checkpoints. Para entender o
  estado atual: combine git log + sprint-board.

---

## 11. Quando NÃO automatizar

- Push para `main` que muda esquema de save (sempre alinhar com
  Rebeca antes — pode invalidar saves de usuários).
- Mudanças no LICENSE ou na linha de autoria.
- Reescrita de cinemáticas já assistidas/aprovadas (são
  literatura, não código).
- Renomear arquivos da bíblia (docs/) — quebra referências
  cruzadas internas.

---

## 12. Resumo de 30 segundos

1. Leia `docs/00-LEIA-PRIMEIRO.md` se você é novo.
2. Veja `docs/production/02-sprint-board.md` para o que falta.
3. Para Sprint N: cena em `scenes/`, entidades em `world/`,
   overlays em `ui/`, costura em `App.tsx`.
4. Use Agent tool em paralelo para frentes disjuntas.
5. `npx tsc -b --noEmit` + `npx vite build` antes de commit.
6. Commit narrativo + push com a chave SSH `rebecaam26`.
7. Atribua sempre a autoria a **Rebeca Alves Moreira**.

Tudo o que você precisa não-óbvio está aqui. Quando hesitar,
prefira pequenas iterações verificáveis a grandes refactors.
A Sussurrante é paciente; o repositório também é.
