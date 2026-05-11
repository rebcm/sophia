# Sprint Board

> **Sprints curtos (~1-2 semanas)**, focados, sem big-bangs.
> Cada sprint termina com **build verde + push**.

## Sprint 1 · Fundação Estrutural (ATUAL)

**Meta**: dar fundação para tudo o que vem. Estado modular,
save, customização, centelha visual, cinemática placeholder.

### Tarefas

- [x] T1.1 — Production docs (00, 01, 02)
- [x] T1.2 — Split state em 4 stores tipados
- [x] T1.3 — `CentelhaController` + helpers de fase
- [x] T1.4 — Componente 3D `<Centelha />` no peito do Player
- [x] T1.5 — `SaveSystem` (localStorage v1, schema versionado,
      auto-save por evento)
- [x] T1.6 — `<TitleScreen />` (substitui IntroOverlay)
- [x] T1.7 — `<CharacterCreation />` (4 perguntas diegéticas)
- [x] T1.8 — `<CinematicPlayer />` placeholder text-based
- [x] T1.9 — `<App />` com novo flow Title → Character →
      Prólogo → Garden
- [x] T1.10 — `bun run typecheck` passa + commit + push

**Saída esperada**: jogador inicia, customiza, vê prólogo
narrativo, joga Jardim, save persiste entre reloads, **build
verde**.

---

## Sprint 2 · Hub Mar de Cristal + Portais

**Meta**: tirar o jogador do Jardim. Construir o Mar de Cristal
mínimo com **portais não-jogáveis** mostrando o que vem.

### Tarefas previstas

- [ ] T2.1 — Cena `MarDeCristalScene` (plataforma central +
      mar reflexivo)
- [ ] T2.2 — 9 portais como gateways visuais
- [ ] T2.3 — Transição Jardim → Mar pelo Portal de Espelho
- [ ] T2.4 — Sussurrante em **forma orbital** persistente no Mar
- [ ] T2.5 — Save de **localização** ao trocar de cena
- [ ] T2.6 — Cinemática 1 (Prólogo) — versão text-based polida
      com Sophia falando sobre as 3 hostes angélicas
- [ ] T2.7 — Codex básico (menu lateral) com aba "Vozes"
- [ ] T2.8 — Métricas internas: tempo na cena, escolhas feitas

---

## Sprint 3 · Bardo + Reencarnação Básica

**Meta**: implementar morte sem game-over. Tela do Bardo
funcional.

### Tarefas previstas

- [ ] T3.1 — `BardoScene` (espaço liminar dourado)
- [ ] T3.2 — Voz da Luz oferecendo "descansa"
- [ ] T3.3 — Escolha entre **aceitar** ou **recusar**
- [ ] T3.4 — Cena curta de **escolha de novo corpo** (reset
      `characterStore`, manter `soulStore`)
- [ ] T3.5 — Persistir vida atual em `soulStore.vidas[]`
- [ ] T3.6 — UI da Árvore Genealógica de Almas (esqueleto)
- [ ] T3.7 — Trigger de morte cinemática primeira (Cap 14 — só
      a estrutura, sem cena polida)

---

## Sprint 4 · Sistema de Aliados Acordados

**Meta**: Sleepers acordados viram NPCs permanentes.

### Tarefas previstas

- [ ] T4.1 — Persistir lista de Aliados no `soulStore`
- [ ] T4.2 — Cada Aliado tem entrada no Codex
- [ ] T4.3 — Aliados que apareceram em vidas anteriores
      reconhecem o jogador novamente
- [ ] T4.4 — Primeiro Lendário: o Velho do Jardim revelado
      como **Aquele-que-procurou**
- [ ] T4.5 — Sistema de Vibração de Almas (cores de aura)

---

## Sprint 5 · Identidade Oculta + Primeiro Lendário

**Meta**: primeiro encontro com Sleeper de identidade oculta.

### Tarefas previstas

- [ ] T5.1 — Sistema de Aura visível com Olhar Lúcido toggle
- [ ] T5.2 — Pré-cena: jogador vê Sleeper com **vibração
      dourada-forte** mas sem nome
- [ ] T5.3 — Mini-game de despertar com mecânicas variadas
- [ ] T5.4 — Revelação cinematográfica: o Sleeper é Adão
      (placeholder — primeiro Lendário)
- [ ] T5.5 — Adão como Aliado persistente
- [ ] T5.6 — Dom de Adão (Nome Original) integrado ao gameplay

---

## Backlog de Sprints (visão de 6 meses)

| Sprint | Foco |
|--------|------|
| 6 | Ratanabá: floresta, Mãe-D'Água, Pajé-do-Cipó |
| 7 | Athoth (1º Arconte) cai + Centelha do Olhar Lúcido |
| 8 | Cinemática 2 polida (placeholder de pré-render) |
| 9 | Sistema de Vozes (anjo/demônio/jinn/Sophia) + primeira
     escolha-chave |
| 10 | Alinhamento Luz/Sombra/Equilíbrio funcional |
| 11 | Casa-Espelhada + Auto-Sabotador (sombra interna) |
| 12 | El Dorado básico |

---

## Definições Operacionais

### "Feito"

Uma tarefa está **feita** quando:
1. Funciona no jogo (gameplay verificado manualmente)
2. `bun run typecheck` passa sem warnings novos
3. Save/Load funciona com o novo state (se aplicável)
4. Commit feito com mensagem descritiva
5. Push para origin/main

### Commits

Padrão: `<categoria>: <descrição breve>`

Categorias:
- `feat:` — feature nova
- `fix:` — bug fix
- `refactor:` — refatoração sem mudança de comportamento
- `docs:` — apenas documentação
- `style:` — formatação/CSS
- `chore:` — manutenção (deps, configs)

### Quando estender a Bíblia

Se durante o sprint surgir necessidade de algo **não
documentado na bíblia**, **atualizar a bíblia primeiro**, depois
implementar. Bíblia é viva.

---

> *"Sprints curtos. Saúde longa."*
