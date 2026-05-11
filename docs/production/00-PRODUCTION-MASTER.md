# Production Master — Visão do Diretor

> *"A bíblia é mapa. O código é território. **O diretor é quem
> faz o mapa virar caminho**."*

## Quem sou eu (Diretor) e o que faço

**Função**: traduzir a bíblia em produto jogável, mantendo a alma
intacta e o cronograma vivo. Decisões finais sobre o quê é feito,
quando, e em que ordem.

**Princípio operacional**: **a bíblia é a Constituição**, **o código
é a interpretação dela**. Tudo o que se constrói deve poder ser
referenciado a um documento da bíblia (40 docs em [docs/](../)).

---

## Estado de Partida (verificado)

| Item | Status |
|------|--------|
| Bíblia documental | ✅ 40 documentos, ~28.500 linhas |
| Stack | ✅ Bun + Vite + R3F + TypeScript + Zustand |
| MVP jogável | ✅ Jardim dos Ecos com Velho despertável (~5 min) |
| Repositório GitHub | ✅ `github.com/rebcm/sophia`, branch main, 5 commits |
| SSH push configurado | ✅ chave `rebecaam26` em core.sshCommand local |
| State management | 🟡 Mínimo (gameStore só) — precisa modularizar |
| Save/Load | ❌ Não existe |
| Customização inicial | ❌ Não existe |
| Cinemáticas | ❌ Nenhuma implementada |
| Centelha visual crescente | ❌ Não existe |
| Mais de 1 cena | ❌ Só Jardim |

---

## Visão de Produção em 3 Eixos

### Eixo 1 · Arquitetura de Código

**Princípio**: **arquitetura serve à narrativa, não o contrário**.

Cada sistema documentado na bíblia tem **um lar canônico no
código**:

```
src/
├── state/                  ← stores Zustand modulares
│   ├── gameStore.ts        ← fase narrativa atual, sessão
│   ├── soulStore.ts        ← ALMA: persistente entre vidas
│   ├── characterStore.ts   ← CORPO: customização atual
│   └── cinematicStore.ts   ← cinemáticas vistas/puláveis
│
├── systems/                ← lógica de jogo pura (sem React)
│   ├── AwakeningController.ts
│   ├── CentelhaController.ts     ← 8 fases visuais
│   ├── CinematicController.ts    ← player narrativo
│   ├── SaveSystem.ts             ← localStorage + IndexedDB
│   ├── AlignmentController.ts    ← Luz/Sombra/Equilíbrio
│   └── AlmaController.ts         ← reencarnação, transmigração
│
├── scenes/                 ← cenas R3F por dimensão
│   ├── GardenScene.tsx     ← Jardim dos Ecos (existente)
│   ├── BardoScene.tsx      ← (futuro) Bardo após morte
│   ├── MarDeCristalScene.tsx     ← (futuro) Hub
│   └── ...
│
├── world/                  ← componentes 3D reutilizáveis
│   ├── Player.tsx
│   ├── Centelha.tsx        ← NOVO: orbe no peito, 8 fases
│   ├── Whisperer.tsx
│   ├── Sleeper.tsx
│   └── ...
│
├── ui/                     ← overlays HTML
│   ├── TitleScreen.tsx     ← NOVO: abertura
│   ├── CharacterCreation.tsx  ← NOVO: customização
│   ├── CinematicPlayer.tsx ← NOVO: player de cinemática
│   ├── HUD.tsx
│   ├── DialogBox.tsx
│   ├── Codex.tsx           ← (futuro) menu de coleções
│   └── ...
│
├── dialog/                 ← scripts de fala
├── audio/                  ← Web Audio procedural
├── App.tsx                 ← orquestrador
├── main.tsx
└── styles.css
```

### Eixo 2 · Pipeline de Produção

Inspirado em [docs/20-arquitetura-narrativa-master.md](../20-arquitetura-narrativa-master.md)
seção 5, em fases incrementais:

| Fase | Duração | Conteúdo Principal | Status |
|------|---------|--------------------|--------|
| **0 · Bíblia** | ✅ | 40 docs | ✅ COMPLETA |
| **1 · Fundação Estrutural** | 2-3 semanas | State modular, Centelha, Save, Title, Customização | 🔄 ATUAL |
| **2 · Vertical Slice** | 4-6 semanas | Jardim polido + Mar de Cristal + Cinemática 1 + 3 Sleepers | ⏳ PRÓXIMA |
| **3 · Primeira Civilização** | 8-12 semanas | Ratanabá completa + Cinemática 2 + Bardo | ⏳ |
| **4 · Demo Pública** | +2 semanas | Polimento + métricas | ⏳ |
| **5+** | 24+ meses | Resto do jogo | ⏳ |

### Eixo 3 · Métricas de Saúde do Projeto

**Métricas técnicas**:
- Build verde (`bun run typecheck` sempre passa)
- 60fps mínimo em laptop mid-range
- Save funciona entre sessões
- Sem warnings de React strict mode

**Métricas narrativas**:
- A cena do Jardim emociona em 5 min?
- A customização sente-se diegética (parte da história)?
- A centelha visual é visível e cresce?
- O save preserva soul state corretamente?

---

## Sprint Atual: SPRINT 1 · Fundação Estrutural

**Objetivo**: preparar a base para tudo o que vem. **Sem mexer
demais no que já funciona**. **Adicionar camadas estruturais**
que sustentam expansão futura.

### Tarefas Sprint 1

1. ✅ **Production master** (este doc)
2. ⏳ **State refactor**: split em `gameStore` + `soulStore` +
   `characterStore` + `cinematicStore`
3. ⏳ **CentelhaController**: 8 fases visuais, lógica pura
4. ⏳ **Componente Centelha** (3D, orbe no peito do player)
5. ⏳ **SaveSystem**: localStorage v1, schema versionado
6. ⏳ **TitleScreen**: abertura cinematográfica
7. ⏳ **CharacterCreation**: customização inicial (sexo,
   aparência, origem, disposição)
8. ⏳ **CinematicPlayer**: placeholder text-based (até CGI
   real)
9. ⏳ **App.tsx atualizado**: novo flow Title → Character →
   Prólogo → Jardim
10. ⏳ **Typecheck** e **push**

**Critério de saída do Sprint 1**: o jogador inicia, customiza
personagem, vê prólogo (texto), aparece no Jardim com Centelha
Fase 1 visível, joga o tutorial atual, fecha o jogo, abre de
novo, **continua de onde parou**.

### Próximos Sprints (preview)

- **Sprint 2**: Cena Mar de Cristal hub básico (esqueleto de
  cena 3D + portais para Jardim e Ratanabá-placeholder)
- **Sprint 3**: Bardo (tela de morte com Voz da Luz +
  reencarnação básica)
- **Sprint 4**: Sistema de Aliados Acordados (NPC permanente
  após despertar)
- **Sprint 5**: Sistema de identidade oculta + primeiro
  Lendário (Velho do Jardim revelado como Sleeper-Lendário
  ambíguo)

---

## Princípios do Diretor (não negociáveis)

1. **Não quebrar o que funciona**: o Jardim atual joga? **Continua
   jogando** após cada commit.
2. **Pequeno e incremental**: cada PR mental cobre **uma feature
   coerente**. Sem "big bangs".
3. **Documentar enquanto se constrói**: cada sistema novo merece
   uma seção neste production/ ou em algum doc da bíblia.
4. **Type-safety primeiro**: `bun run typecheck` deve passar
   antes de qualquer push.
5. **Acessibilidade desde o início**: alt text, keyboard nav,
   screen reader friendly por padrão.
6. **Bíblia é viva**: se uma decisão de código sugerir mudança
   na bíblia, **atualizar a bíblia**.

---

## A Decisão Diretiva Para Agora

**O usuário pediu**: *"estruture bem o conteúdo e comece a
desenvolver"*.

**Decisão do diretor**: **NÃO** começar com a cena nova (Mar de
Cristal) porque **falta fundação**. Sprint 1 é **fundação**.
**Sprint 2** entra em cenas novas.

**Resultado deste turno**: production docs criados, **Sprint 1
implementado em parte significativa**, **build verde**, **push**.

---

## Documentos de Produção Próximos

- [`01-state-audit.md`](01-state-audit.md) — auditoria detalhada
  do código atual
- [`02-sprint-board.md`](02-sprint-board.md) — sprints definidos
  e tracking
- [`03-conventions.md`](03-conventions.md) — convenções de
  código, naming, commits

---

> **A bíblia disse o que. O diretor diz quando, como, e em que
> ordem. **O código diz é assim***.*
