# Sprint Board

> **Sprints curtos (~1-2 semanas)**, focados, sem big-bangs.
> Cada sprint termina com **build verde + push**.
> Autoria integral: **Rebeca Alves Moreira**.

## Status global · pós-Sprint 11

| Sprint   | Tema                                                  | Commit       | Status |
| -------- | ----------------------------------------------------- | ------------ | ------ |
| 1        | Fundação · Title→Character→Cinematic→Game             | `38ab6a2`    | ✅ |
| 2        | Mar de Cristal hub + roteamento entre cenas           | `1da68a0`    | ✅ |
| 3        | Bardo + morte voluntária + reencarnação básica        | `df60ad7`    | ✅ |
| 4        | Codex completo (4 abas)                               | `6c00d90`    | ✅ |
| 5        | Identidade Oculta + Auras + 1º Lendário (Adão)        | `b4bf5cf`    | ✅ |
| 6+7+8    | Ratanabá + Athoth + Cinemática 2                      | `2508da6`    | ✅ |
| 9+10     | Sistema de Vozes (4 falantes) + Alinhamento ativo     | `290170c`    | ✅ |
| 11       | Casa-Espelhada + Auto-Sabotador + Sussurrante humanoide | `c0d51ff`  | ✅ |
| 12       | El Dorado básico (próximo)                            | –            | 🔜 |
| 13       | Yobel (2º Arconte) cai + Cinemática 3                 | –            | 🔜 |
| 14       | Sistema de Filamentos (visão de drenagem)             | –            | 🔜 |
| 15       | Sleepers de Casta 6/7 + ritmos de despertar avançados | –            | 🔜 |

Sprints já marcados como **✅** estão consolidados no `main`.

---

## Sprint 1 · Fundação Estrutural (CONCLUÍDO)

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

## Sprints 6+7+8 · Ratanabá + Athoth + Cinemática 2 (CONCLUÍDO)

**Commit:** `2508da6`. Entregou:

- `RatanabaScene.tsx` (floresta, 70 árvores, 80 vagalumes,
  rio luminoso)
- `MaeDagua.tsx` (Athoth submersa com cipós)
- `Paje.tsx` (Pajé-do-Cipó)
- Cinemática "athoth-cai" com 9 *beats*
- Portal Ratanabá no Mar destrava após Velho do Jardim
- Centelha do Olhar Lúcido como reward

---

## Sprints 9+10 · Sistema de Vozes + Alinhamento (CONCLUÍDO)

**Commit:** `290170c`. Entregou:

- `VozesEscolha.tsx` overlay com fase voices → options → resolved
- 4 vozes (anjo / demônio / jinn / Sophia) com cores distintas
- 3 opções de alinhamento (luz / sombra / equilíbrio) feedando
  `soulStore.addToAlignment()`
- `ATHOTH_CHOICE` integrado em `RatanabaOrchestrator` — pressionar
  F agora abre escolha-chave antes do despertar de Athoth

---

## Sprint 11 · Casa-Espelhada + Auto-Sabotador (CONCLUÍDO)

**Commit:** `c0d51ff`. Entregou:

- `CasaEspelhadaScene.tsx` (câmara hexagonal violeta com 6
  painéis-espelho)
- `AutoSabotador.tsx` (sombra cinzenta com aura que vira dourada)
- Mecânica do abraço: F segurado por 5s em proximidade < 1.8m
- HUD overlay com barra de progresso do abraço
- Soltar ou afastar-se decai o progresso gradualmente
- Vitória: Centelha do Discernimento, +1.0 luz, +10 equilíbrio,
  Auto-Sabotador registrado como Lendário "O Carcereiro Era Eu"
- `Whisperer.tsx` agora ganha torso/cabeça/braços etéricos após
  despertar o Auto-Sabotador (forma humanoide)
- Portal Casa-Espelhada destrava no Mar de Cristal após Athoth

---

## Backlog de Sprints (visão atualizada 6 meses)

| Sprint | Foco |
|--------|------|
| 12 | El Dorado básico (cena + Yobel adormecido) |
| 13 | Yobel (2º Arconte) cai + Cinemática 3 ("Ouro Era Sombra") + Centelha da Fala-Raiz |
| 14 | Sistema de Filamentos (visão de drenagem dos Sleepers) |
| 15 | Sleepers Casta 6/7 + variações de mini-game de despertar |
| 16 | Feira dos Sistemas (5 distritos) — cidade-arquetipo |
| 17 | Hiperbórea (3ª Civilização) + Adonaios cai |
| 18 | Sistema de Profissões / Caminhos (12 práticas diárias) |
| 19 | Vínculos / Par Sizígico — primeiro encontro romântico |
| 20 | Eloaios (4º Arconte) + Cinemática 5 + Labirinto das Eras (esqueleto) |

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
