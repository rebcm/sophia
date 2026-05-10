# 05 · Game Design Document

> Documento de **mecânicas, sistemas, controles e progressão**.
> Escrito para programadores e designers de sistemas.

---

## Índice

1. [Identidade do jogo](#1-identidade)
2. [Pillars de design](#2-pillars-de-design)
3. [Loop de gameplay](#3-loop-de-gameplay)
4. [Controles](#4-controles)
5. [Câmera](#5-câmera)
6. [Sistema de Luz Interior](#6-sistema-de-luz-interior)
7. [Sistema de Despertar](#7-sistema-de-despertar)
8. [Sistema de Diálogo](#8-sistema-de-diálogo)
9. [Sistema de Sonhos](#9-sistema-de-sonhos)
10. [Sistema de Centelhas e Poderes](#10-sistema-de-centelhas-e-poderes)
11. [Reflexões Duelais (Bosses)](#11-reflexões-duelais)
12. [Sistema de Aliados Acordados](#12-sistema-de-aliados-acordados)
13. [Sistema de Encontros com Aeons-Mestres](#13-sistema-de-encontros-com-aeons-mestres)
14. [Sistema de Reencarnação (Roda de Samsara)](#14-sistema-de-reencarnação)
15. [Sistema de Colecionáveis (Cartas, Pedras, Sementes)](#15-colecionáveis)
16. [Progressão](#16-progressão)
17. [Múltiplos Finais](#17-múltiplos-finais)
18. [Acessibilidade](#18-acessibilidade)
19. [Salvamento](#19-salvamento)
20. [Performance e Targets](#20-performance)

---

## 1. Identidade

| Campo | Valor |
|-------|-------|
| **Nome** | Sophia · A Jornada do Despertar |
| **Gênero** | Aventura contemplativa em mundo aberto multidimensional, narrativa, com reencarnação não-violenta e livre arbítrio |
| **Plataforma** | Web (desktop + tablet); console-ready posteriormente |
| **Runtime + package manager** | **Bun** (`bun install`, `bun run dev`) — fallback Node ainda suportado |
| **Engine** | Three.js + React Three Fiber + drei + postprocessing |
| **Linguagem** | TypeScript |
| **Bundler** | Vite (sob runtime do Bun) |
| **Público** | 10–99 anos, família |
| **Duração** | 30–45 horas main story; 50–70 horas completionist (com Reino Invertido, todos Aeons-Mestres, todos pactos com Jinns, todas reencarnações voluntárias) |
| **Modo** | Single player + multiplayer assíncrono leve (Aeon-Mestres em jardins de outros jogadores no Ending D) |
| **Idiomas (MVP)** | Português · Inglês · Espanhol |
| **Acessibilidade** | Subtítulos, opção de slow-motion, daltonismo, teclado-only, screen-reader para diálogos |

### Por que Bun

- **Velocidade:** install ~5x mais rápido que npm; cold-start do dev
  server marcadamente menor.
- **Compatibilidade total** com Vite e package.json existente.
- **Runtime único** para scripts, ESM nativo, sem ts-node necessário.
- **TypeScript nativo:** Bun executa `.ts` diretamente, útil para
  ferramentas auxiliares (geração de assets, build de cenas, etc.).
- **Fallback simples:** todas as scripts mantém versão `:node` para
  ambientes legados.

### Comandos

```bash
bun install                # instalar dependências (super rápido)
bun run dev                # dev server (Vite + runtime Bun)
bun run build              # build de produção
bun run preview            # servir build local
bun run typecheck          # tsc --noEmit, valida tipos sem build

# Fallback Node:
bun run dev:node           # Vite com Node tradicional
bun run build:node         # build com Node
```

---

## 1.5 Documentos relacionados (leia antes deste)

Este GDD descreve a **espinha mecânica e operacional**. Quatro
documentos complementares aprofundam sistemas específicos:

- [04c-poderes-e-conquistas.md](04c-poderes-e-conquistas.md) —
  evolução em 5 fases (Acordado → Vidente → Taumaturgo → Aeon
  Humano → Espírito Puro), com poderes detalhados (cura, projeção
  astral, sonho-walking, bifurcação, ressurreição, milagres,
  voo, transmutação)
- [04d-livre-arbitrio.md](04d-livre-arbitrio.md) — sistema de
  escolhas com 4 vozes (anjo, demônio, jinn, Sophia), 3
  alinhamentos (Luz/Sombra/Equilíbrio), 20 escolhas-chave, ecos
  cumulativos
- [05b-mundo-aberto-energia.md](05b-mundo-aberto-energia.md) —
  navegação multidimensional, sistema de filamentos energéticos
  dos Sleepers, sono lúcido vs vampirização, Reino Invertido
- [03c-anjos-demonios-jinns.md](03c-anjos-demonios-jinns.md) —
  habitantes espirituais com livre arbítrio próprio

---

## 2. Pillars de design

Toda decisão de design deve servir a pelo menos **um** destes pilares:

### P1 — Compaixão é a única arma
Não há HP do jogador no sentido tradicional. Não há HP de inimigos.
Toda confrontação se resolve por **compreensão, reflexão ou nomeação**.
Se um sistema permitir vencer por força ou matar, está fora.

### P2 — A maravilha é mais importante que o desafio
O jogo deve fazer o jogador **parar para olhar**. Cada esfera tem
ao menos 3 momentos de "aware moment" — quando a câmera diminui,
o som se abre, e o jogador percebe que está num lugar especial.
Desafios existem mas servem à maravilha, não ao contrário.

### P3 — Acessível por fora, profundo por dentro
A linguagem é simples. Crianças entendem. Mas as **sete camadas
simbólicas** (que se desvelam com leituras adultas) estão sempre lá.
Ninguém é forçado a "ler nas entrelinhas" — quem quiser, encontra.

### P4 — Silêncio é design
Ausência é uma ferramenta. Diálogos curtos. Música que se cala.
Cenas sem música. **O silêncio é o segundo personagem mais importante
depois de Sophia.**

### P5 — A Roda gira até alguém soltar
Morrer não é fim. A reencarnação não é punição — é colheita.
Cada vida adiciona memória. A última lição é soltar também a
memória.

### P6 — Toda tradição é honrada
Religiões, eras, sistemas: nada é demonizado nem nominado como
inimigo. Aparecem como **arquétipos** com coração luminoso e casca
controladora. O jogador aprende a **ler ambos**.

### P7 — Liberdade é peso (livre arbítrio)
Toda escolha **importa** — molda o caminho, atrai/afasta anjos,
abre/fecha dimensões. Sombra **não é mau** — é caminho mais longo.
A iluminação é inevitável; o **timing** depende de cada gesto.

### P8 — Mundo aberto é destino
Após o tutorial, **toda a cosmologia** está acessível. O jogador
**escolhe** quando entrar em cada civilização perdida, era ou
sistema. **Tempo é macio** — ninguém cobra ritmo. **A jornada é
o objetivo**.

### P9 — Energia é matéria espiritual
Sleepers vazam luz como filamentos invisíveis para os Arcontes.
Despertar = romper filamento. Curar = fechar a hemorragia. **A
luz que volta é poder novo** — visualmente, mecanicamente, e
narrativamente.

---

## 3. Loop de gameplay

### Loop micro (30 segundos)
1. Olhar — câmera lenta, observar
2. Mover — flutuar/andar com leveza
3. Iluminar — emanar luz, ver mais

### Loop médio (5 minutos)
1. Explorar uma sala/área
2. Encontrar um Adormecido ou pista
3. **Despertar** ou **resolver** algo
4. Receber luz / fragmento / diálogo
5. Avançar

### Loop macro (1–2 horas, por reino)
1. Entrar num reino novo (esfera, era, ou sistema)
2. Encontrar o santuário onírico (sonho com Aeon)
3. Explorar e despertar 5+ Adormecidos
4. Confrontar o Principado(s) e/ou Arconte (Reflexão Duelal)
5. Receber Centelha → novo poder → volta ao Hub

### Loop expandido (10–15 horas, por bloco)
1. Completar 3 reinos paralelos
2. Encontrar Aeon-Mestre santuário escondido
3. Recolher Cartas, Pedras, Sementes
4. Possível morte/reencarnação opcional
5. Voltar ao Mar de Cristal e ver crescimento da rede de aliados

### Loop master (jogo inteiro)
- Acordar → 9 reinos paralelos completados → Sabaoth aparece →
  Quartel + Conselho → Trono → Véu → Ascensão Dimensional → Pleroma → escolha de final

---

## 4. Controles

### Teclado/Mouse (padrão)
| Ação | Tecla |
|------|-------|
| Mover | `WASD` ou setas |
| Olhar | Mouse |
| Brilhar / Emanar luz | `E` (segurar) |
| Despertar (perto de Adormecido) | `F` |
| Falar / Confirmar | `Espaço` |
| Câmera contemplativa (zoom out) | `Q` (segurar) |
| Sussurrante (chamar) | `Tab` |
| Inventário (Centelhas) | `I` |
| Diário | `J` |
| Sonhar (em santuário) | `Z` |
| Respiração-luz (regenera Luz) | `R` (segurar) |
| Habilidade de Aliado | `1`–`5` (configurável) |
| Centelhas | Shift + `1`–`7` |
| Pausa | `Esc` |
| Codex (Cartas, Pedras, Aliados) | `C` |

### Gamepad (Xbox layout)
| Ação | Botão |
|------|-------|
| Mover | Stick L |
| Olhar | Stick R |
| Brilhar | LT (segurar) |
| Despertar | A |
| Falar | A |
| Contemplar | LB (segurar) |
| Sussurrante | Y |
| Inventário | Pad ↑ |
| Diário | Pad → |
| Sonhar | X |
| Respiração-luz | Pad ↓ (segurar) |
| Habilidade de Aliado | RB + A/B/X/Y |
| Centelhas | Stick L (clicar) → menu radial |
| Pausa | Start |

### Touch (tablet)
- Dois dedos: stick virtual à esquerda (mover), à direita (olhar)
- Tap em alvo: ir até / interagir
- Tap longo: brilhar
- Botões flutuantes: Sussurrante, contemplar, respirar, codex

### Teclado-only / acessibilidade
- Modo "auto-câmera": câmera segue automaticamente, jogador só usa
  teclas de mover.
- Modo "caminho-de-luz": uma linha sutil aparece no chão indicando
  rota.

---

## 5. Câmera

### Tipo
**Terceira pessoa orbital + cinemática contextual.**

- Padrão: câmera atrás-acima do jogador, distância média (5m), pitch
  20°.
- Em momentos de awe: câmera afasta-se automaticamente para mostrar
  paisagem.
- Em diálogos: corte para câmera de ombro do interlocutor.
- Em despertares: câmera close-up no toque, depois pull-back amplo.
- Na Ascensão Dimensional (Atos VI–VII): câmera **flutua** sem
  controle do jogador, semi-cinemática.
- No Bardo: câmera fixa, o jogador é quem **se move** entre espelhos.

### Filosofia
**A câmera é narradora.** Ela respira. Jamais shake violento. Jamais
chicote. Pan e dolly suaves, com easing.

---

## 6. Sistema de Luz Interior

### Fundamento
A "luz interior" do jogador é **a única estatística** de progresso.
Tudo gira em torno dela.

### Atributos
- **Intensidade** (0.0 → 9.0, progressão lenta — antes era 7.0)
  - Começa em 0.4 (mal visível)
  - +0.5 por Adormecido despertado
  - +1.0 por Centelha conquistada (7 totais)
  - +0.3 por Aeon-Mestre encontrado (até +5.1)
  - +0.2 por Pedra com Inscrição lida (até +2.4)
  - Aumenta brilho do shader, raio de iluminação ambiente, alcance
    do despertar
- **Cor** (HSL de 50° âmbar → varia conforme Centelha)
- **Pulso** (frequência da pulsação, 0.6 Hz baseline)
  - Acelera em momentos de empatia, desacelera em silêncio

### Onde é visível
- Aura visual ao redor do personagem
- Iluminação do ambiente próximo (point light dinâmico)
- HUD: barra de "Luz" muito sutil no canto inferior

### Como ela é gasta
**Não é gasta!** A luz é **acumulativa**. Não há perda na maioria
das situações.
Excepcionalmente:
- Aceitar uma "tentação" de Arconte custa 0.5
- Reencarnar voluntariamente em era diferente custa 0.5 temporário
- Cair na Voz da Luz no Bardo cedo encerra o jogo (não custa luz)

### Respiração-luz (mecânica nova)

Inspirada em técnicas yogi e zen. O jogador para, segura `R` (ou
Pad ↓), e respira. A tela ganha um leve halo. Cada respiração
profunda regenera **0.05 de Luz**. Atinge no máximo o nível
máximo atual; não pode passar dele.

**Disponível desde o Capítulo 2.** Ensinada pelo Yogi do Rio em
Selene (versão expandida).

---

## 7. Sistema de Despertar

### A interação central do jogo. Deve ser **lindo**.

### Sequência
1. Jogador se aproxima de Adormecido. Sussurrante pulsa, dica visual:
   o Adormecido brilha sutilmente.
2. Jogador segura `F`. Câmera suaviza para close.
3. Surge **mini-game rítmico** sobre o Adormecido:
   - 3 a 7 ondas de luz (dependendo da profundidade do sono).
   - Cada onda tem uma frequência (visual: anel pulsante de tamanho
     variável, com ritmo).
   - O jogador deve **bater no ritmo** (botão único: `F` ou `A`).
   - Não há "fail" — só "calibrar com ele". Erros suavizam o ritmo,
     não punem.
4. Quando os ritmos sincronizam, **a luz do jogador encontra a
   centelha do Adormecido** — fade branco breve, sussurro coral.
5. O Adormecido abre os olhos. Senta. Olha o jogador. Diz uma única
   frase (seu Nome Verdadeiro ou um agradecimento).
6. Recompensa: +0.5 luz; o Adormecido permanece desperto pelo resto
   do jogo (visível em revisitas).

### Variações
- **Adormecido teimoso:** precisa que o jogador aplique poder de
  Centelha específica antes (ex.: Olhar Lúcido para ver o sono dele).
- **Adormecido com trauma:** o ritmo muda no meio (precisa adaptar).
- **Adormecido em par:** dois irmãos, devem ser despertados juntos.
- **Adormecido coletivo:** uma multidão (ex.: Multidão Imóvel da
  Praça-Tela). Despertar requer **ondas em cascata** — começar com
  um, ele "contagia" vizinhos lentamente.
- **Adormecido difícil (Sleeper raro):** exige condições prévias —
  ex.: Marco Aurélio (Imperador-Filósofo) só pode ser despertado
  com Centelha do Coração Firme + Centelha da Palavra de Nomeação.

### Acessibilidade
- Modo "ritmo lento": dobra duração das ondas.
- Modo "auto-rítmico": jogador segura `F` e o ritmo acerta sozinho
  no tempo.

---

## 8. Sistema de Diálogo

### Estrutura
**Diálogos breves, com escolha de "ressonância" (não de conteúdo).**

### Caixa de diálogo
- Aparece no terço inferior, semi-transparente, fonte Cormorant Garamond.
- Texto digita devagar (40 chars/seg), pode acelerar com `Espaço`.
- Subtítulos sempre visíveis.

### Escolhas
- **Sempre 2-3 opções**, e nenhuma é "errada".
- Cada opção tem uma **cor de ressonância**: âmbar (compaixão), azul
  (curiosidade), violeta (silêncio).
- A cor escolhida muda **levemente** o tom da Sussurrante e o
  desfecho de cena. **Não muda o fim do jogo.**
- Em diálogos com Sleepers difíceis, a escolha de ressonância pode
  determinar **se** ele acorda agora ou precisa de mais luz.

### Sussurrante
A Sussurrante intervém **sempre que o jogador para por mais de 30s
sem agir**. Frase breve, pertinente. **Não é tutorial em texto** — é
companhia.

A partir do Cap. 11.5, a Sussurrante tem **forma humanoide visível**.
Caminha junto. Pode ser interagida com `Tab`.

---

## 9. Sistema de Sonhos

### Como acessar
Em cada esfera/era/sistema há **um santuário onírico** (visualmente:
pequeno recinto de pedras circulares + flor luminosa central). O
jogador pressiona `Z` para **adormecer**.

### O que acontece
- Tela faz fade para branco.
- Cena onírica: o jogador, agora em forma luminosa pura, em um
  espaço **sem chão definido**, pinturas geométricas vivas.
- Aparece um **Aeon clássico** (Logos, Zoe, etc.) ou um
  **Aeon-Mestre** (Cristo Cósmico, Sufi-Roda, etc.).
- Cutscene curta (1–2 minutos): diálogo, ensinamento, gesto.
- O Aeon **dá um dom** — desbloqueia uma habilidade/leitura.
- Fade para o santuário; o jogador acorda; HUD mostra novo poder.

### Importância
Cada Aeon-encontro é **a memória central de cada esfera**. É o
momento em que o jogador entende **por que está ali**.

---

## 10. Sistema de Centelhas e Poderes

### As 7 Centelhas

| # | Esfera | Centelha | Poder gameplay |
|---|--------|----------|----------------|
| 1 | Selene | Olhar Lúcido | Toggle visão verdadeira (revela Adormecidos invisíveis, paths) |
| 2 | Hermes | Fala-Raiz | Pode "escutar" pensamentos de Adormecidos antes de despertar (revela Nome) |
| 3 | Aphros | Toque Compassivo | Pode tocar uma ilusão e revelar sua forma verdadeira |
| 4 | Helios | Chama Interior | Brilha mais forte em escuridão extrema; revela passagens ocultas |
| 5 | Ares | Coração Firme | Resiste a ilusões de medo sem agressão |
| 6 | Zeus | Palavra de Nomeação | Diz o Nome Verdadeiro de algo e o aquieta |
| 7 | Kronos | Memória do Pleroma | Lembra-se de uma vida anterior; vê a origem de qualquer coisa |

### Centelhas adicionais (eras e sistemas)

| # | Origem | Centelha | Poder |
|---|--------|----------|-------|
| 8 | Labirinto das Eras | Lembrança Profunda | Mostra Sleepers a "mesma cena em três eras" |
| 9 | Feira dos Sistemas | Discernimento | Visão "raio-X institucional" |

### Uso ergonômico
- Centelhas mapeadas a **atalhos numéricos** (Shift + `1`–`9`).
- Menu radial via Stick L (gamepad).
- A maioria é **toggle** ou **contextual** (apenas perto de alvo
  válido).

### Combinações
Algumas combinações destrancam segredos:
- **Olhar Lúcido + Toque Compassivo:** vê o passado de uma estátua e
  pode despertá-la.
- **Memória + Palavra:** chamar pelo Nome Verdadeiro alguém que viveu
  outra vida.
- **Discernimento + Lembrança Profunda:** visão atômica + temporal —
  vê todas as possibilidades de um Sleeper em todas as eras.

---

## 11. Reflexões Duelais

### O substituto não-violento de "boss fights".

Cada Arconte e Principado tem um **espaço ritual** (boss room ou
mini-boss room). Não há ataques. Há **três fases**:

1. **Confronto** — o Arconte/Principado fala/age sua natureza falsa.
   O jogador deve **observar e identificar** o padrão (mecânica de
   puzzle visual).
2. **Reflexão** — o jogador realiza um gesto-chave (escolha, posição,
   uso de Centelha) que **mostra ao Arconte sua verdade**.
3. **Liberação** — o Arconte/Principado, abalado, abre os olhos.
   Cena cinemática. O jogador recebe a Centelha (Arconte) ou uma
   recompensa menor (Principado).

### Diferença entre Arcontes e Principados

| Aspecto | Arconte | Principado |
|---------|---------|------------|
| Frequência | 7 (1 por esfera) | ~25 |
| Tempo do duelo | 5–10 min | 2–4 min |
| Recompensa principal | Centelha | Carta da Tradição + 0.3 Luz |
| Boss room | Grande, cinematográfica | Menor, ambientada |
| Música | Multiclimática (4 fases) | 2 fases |

### Princípios
- **Não há tempo para acabar** (não é cronômetro).
- **Não há GAME OVER** nas Reflexões — só "tente de novo, com mais
  calma".
- A **música** muda em cada fase: dissonante → harmônica → silêncio
  → coral.

### Exemplos resumidos

**Arcontes** (detalhes em [04-enredo.md](04-enredo.md)):
- **Athoth:** mini-game musical (ritmo de 4 notas).
- **Harmas:** oferecer presente vazio.
- **Galila:** encontrar o espelho verdadeiro.
- **Yobel:** **escolha de NÃO se ajoelhar**.
- **Adonaios:** descer ao calabouço.
- **Eloaios:** julgar leis.
- **Iaoth:** assistir vidas e agradecer.

**Principados** (gesto-padrão):
- Cada Principado recita uma **frase de captura**.
- O jogador apresenta **um símbolo, item ou pessoa específica**.
- O Principado deixa cair a frase como máscara.
- Diz a **frase de libertação**.
- Desaba em luz.

Exemplos:
- **Cardeal de Mármore:** apresentar criança que ele se recusou
  a abençoar.
- **Inspetor-da-Padronização:** apresentar caderno de criança
  com estrela fora da margem.
- **Apresentador-Sem-Cabeça:** trazer silêncio do Coração
  Quieto.
- **Auto-Sabotador:** abraçar a si mesmo (5 segundos).

---

## 12. Sistema de Aliados Acordados

### Conceito

A partir do Ato V (Quartel de Sabaoth), o jogador pode recrutar
até **15 Aliados Acordados** — personagens humanos e míticos que,
despertados, viram **parceiros ativos**.

### Recrutamento

Aliados não são "achados". São **despertados como Sleepers** em
condições especiais. Cada um exige:
- Uma cena específica de despertar.
- Uma Centelha mínima.
- Em alguns casos, presença de outro Aeon-Mestre.

(Lista completa em [03-personagens.md](03-personagens.md), seção
"O Conselho de Sabaoth".)

### Habilidades

Cada Aliado dá **duas coisas**:

1. **Habilidade ativa** (toggleable no menu, atalho `1`–`5`)
   - Exemplo: "Quebrar Algoritmo" (Programador Rebelde) — desabilita
     o Algoritmo-de-Mil-Olhos por uma esfera.
   - Cooldown: varia (5–30 minutos in-game). Não é "stamina",
     é **eco**.
2. **Vantagem passiva permanente** (sempre ativa)
   - Exemplo: "Cosmos Infinito" (Mártir-do-Infinito) — abre uma
     porta secreta no Pleroma.

### Limitação

O jogador pode ter **5 habilidades ativas mapeadas** simultaneamente
(slots `1`–`5`). As demais ficam disponíveis no menu, mas não nos
atalhos.

### Conexão emocional

Cada Aliado tem **uma cena de conexão** — diálogo de 1–2 minutos
no Quartel ou em campo. Ler todas dá **uma Pedra com Inscrição
extra** (a 13ª pedra, secreta).

---

## 13. Sistema de Encontros com Aeons-Mestres

### Conceito

Os **17 Aeons-Mestres** das tradições religiosas e místicas são
encontrados em **santuários ocultos** dispersos pelo mundo.

### Descoberta

Cada Aeon-Mestre tem **uma pista** dada por Sleepers acordados,
Sussurrante ou Sabaoth. A pista nunca é literal — é uma **dica
poética**:

> *"Onde a água canta antes do amanhecer, alguém te espera lendo o céu."*
> (Pista do Yogi do Rio em Selene.)

### Encontro

Cada encontro é uma **cena curta** (1–3 minutos):
- O Aeon-Mestre dá ao jogador **uma frase** (que vira Carta da
  Tradição).
- Ensina **uma técnica** (mini-mecânica que o jogador pode usar
  daí em diante — ex.: respiração-luz, gesto de soltar, gesto de
  oferecer).
- Em alguns casos, dá **um item simbólico** (semente, vela, cristal).

### Acumulação

Encontrar **7 Aeons-Mestres** é necessário para ending B (canônico).
Encontrar **todos os 17** é necessário para ending C (Apocatástase)
ou D (Aeon-Mestre).

### Visualização

No Codex (`C`), há uma **constelação dos Aeons-Mestres**: cada um
um ponto luminoso. Os já encontrados brilham; os pendentes têm
silhueta tênue. As pistas aparecem como linhas tracejadas.

---

## 14. Sistema de Reencarnação

### Estado técnico

Detalhado em [04b-samsara-reencarnacao.md](04b-samsara-reencarnacao.md).

### Implementação no Zustand store

```typescript
// src/state/gameStore.ts (a expandir)
interface GameState {
  // ... estado existente
  reincarnation: {
    livesLived: number;
    pastLives: PastLife[];
    currentBardo: boolean;
    voluntaryReincarnations: number;
    echoLog: EchoEvent[];
    bardoChoiceShown: boolean;
  };
}

interface PastLife {
  id: string;
  era: string;
  characterName: string;
  story: string;
  lessonGained: string;
  unlockedAt: number; // timestamp
}
```

### Cenas chave

1. **Tela do Bardo** — overlay completa, fundo dourado com luz central
2. **Espelhos das Eras** — 12 espelhos rotativos, cada um com
   preview cinemático da era
3. **Tela de Memória de Vida** — texto poético, fundo etéreo
4. **Tela de "Você ainda pode voltar"** (Esquecimento) — única tela
   negra do jogo

### Persistência

Estado de reencarnação **sempre persiste no localStorage**, mesmo
em mortes simples. (Ver tabela em
[04b-samsara-reencarnacao.md](04b-samsara-reencarnacao.md) seção 8.)

### UX

- O jogador é **avisado antes** de qualquer cena que pode levar
  à morte (ex.: "Sentir que vais morrer? Continuar..." com opção
  de voltar).
- A morte natural do Capítulo 14 é **inevitável** narrativa, mas
  precedida de aviso.
- Reencarnação voluntária é **iniciada apenas pelo jogador** (em
  Pedra das Vidas no Mar).

---

## 15. Colecionáveis

### As 12 Pedras com Inscrições

Uma por tradição religiosa. Encontradas em locais específicos
(detalhes em [01b-religioes-comparadas.md](01b-religioes-comparadas.md)
seção 13). Lê-las todas em ordem revela a frase secreta da Mônada.

**UI:** Codex → Aba "Pedras". Cada pedra mostra:
- Frase original (na língua de origem, fonte estilizada)
- Tradução em português
- Nome da tradição
- Local de descoberta

### As Cartas da Tradição

Múltiplas (~50). Cada Aeon-Mestre encontrado dá ao menos uma. Outros
Sleepers acordados também dão. Algumas estão escondidas em diários,
livros, vitrais.

**UI:** Codex → Aba "Cartas". Pode-se filtrar por tradição.

### As 10 Sementes-do-Éden

Uma por era. Plantadas no Mar de Cristal, formam um jardim
pré-Pleroma. Plantar todas desbloqueia uma cutscene rara onde o
jardim cresce em tempo real.

**UI:** Codex → Aba "Jardim". Mostra as sementes plantadas e
o estado do jardim.

### O Diário (Auto-gerado)

Texto curto que se atualiza após cada interação. Pode ser lido a
qualquer momento (`J`). Estilo: poético, em primeira pessoa.

> *"Hoje despertei a Pastora de Luas. Ela sorriu e disse seu nome
> verdadeiro. Eu não sabia que sonho podia ser tão pesado."*

### Memórias de Vidas Anteriores

Acumulam a cada morte. Mostradas em ordem cronológica reversa.
**UI:** Codex → Aba "Vidas".

---

## 16. Progressão

### Esquema completo

| Bloco | Capítulos | Estrutura |
|-------|-----------|-----------|
| Atos I + II (parte 1) | 1–9 | 7 esferas (Selene, Hermes, Aphros, Helios livres; Ares, Zeus, Kronos sequenciais) |
| Atos II (parte 2) | 10–11 | Labirinto das Eras + Feira dos Sistemas (eixos paralelos) |
| Ato II (parte 3) + Ato III | 12–18 | Kronos (sequencial após Eras+Sistemas), morte natural, primeira reencarnação |
| Ato IV | 19–21 | Sabaoth + Quartel + Conselho |
| Ato V | 22–24 | Trono do Demiurgo |
| Ato VI | 25–27 | Ascensão Dimensional (XII–XVI) |
| Ato VII | 28 | Escolha de Final |

### Sem grinding

**Sem XP. Sem level. Sem inventário pesado.** Apenas:
- 9 Centelhas (7 esferas + 2 eixos)
- Aliados Acordados (até 15)
- Aeons-Mestres encontrados (até 17)
- Pedras com Inscrições (12 + 1 secreta)
- Cartas da Tradição (~50)
- Sementes-do-Éden (10)
- Memórias de Vidas (acumulam)

### Recompensas

- Despertar Adormecido → frase + memória pessoal do jogador
- Coletar Carta → trecho de texto narrativo
- Coletar Pedra → frase em outra língua + sua tradução
- Encontrar Aeon-Mestre → habilidade nova + Carta
- Recrutar Aliado → habilidade ativa + vantagem passiva
- Centelha → poder
- Ending → escolha + replay value

---

## 17. Múltiplos Finais

### Ending A · Ascensão (raro, ~5%)

- **Como desbloquear:** simples, basta atravessar o Pleroma e
  escolher "ficar".
- **Cena:** silêncio, luz crescendo, créditos.
- **Replay:** jogo recomeça do zero.

### Ending B · O Retorno / Bodhisattva (canônico, ~70%)

- **Como desbloquear:** atravessar o Pleroma + ter despertado pelo
  menos 50 Sleepers + encontrado pelo menos 7 Aeons-Mestres.
- **Cena:** o jogador vira nova Sussurrante para outro jogador.
- **Replay:** jogo recomeça com **opção de modo Sussurrante**: o
  jogador joga ao lado de uma IA-jogador.

### Ending C · Apocatástase (raro, ~15%)

- **Como desbloquear:**
  - Despertar todos os 32 Sleepers icônicos
  - Despertar 18+ Sleepers opcionais (total 50+)
  - Encontrar todos os 17 Aeons-Mestres
  - Reunir todas as 12 Pedras com Inscrições
  - Reunir todas as 10 Sementes-do-Éden
  - Despertar 5 Aeons-Sistema-Luz
- **Cena:** o cosmos inteiro acorda. A roda de samsara para. Pleroma
  estendido. Sophia em forma de Trovão dança no centro.
- **Replay:** jogo recomeça com **modo Apocatástase**: nenhum Sleeper
  começa adormecido. O jogador pode pular direto para a Ascensão se
  quiser, ou apenas explorar o cosmos restaurado.

### Ending D · Aeon-Mestre (raríssimo, ~5%)

- **Como desbloquear:** todas as condições do Ending C **+** o
  jogador deve ter completado **3+ reencarnações voluntárias** **+**
  Aliados todos com cena de conexão lida.
- **Cena:** o jogador vira Aeon-Mestre permanente.
- **Replay:** **em jogo+, o jogador escolhido aparece como Aeon-Mestre
  no jardim de outros jogadores** (multiplayer assíncrono leve via
  cloud save opcional). Esta é a única forma de "compartilhar" o
  jogo.

### Ending E (secreto) · O Bardo Direto (raro, ~3%)

- **Como desbloquear:** aceitar a Voz da Luz na primeira morte (Cap. 14).
- **Cena:** atravessa o Pleroma cedo, conteúdo abreviado.
- **Replay:** jogo recomeça com aviso: *"Você terminou cedo. Da
  próxima vez, fique."*

### Ending F (catástrofe luminosa, ~2%)

- **Como desbloquear:** escolher o **Esquecimento** (-∞) na hora
  certa.
- **Cena:** tela negra com mensagem: *"Você ainda pode voltar."*
- Não há "fim do jogo" verdadeiro — clicar em qualquer botão
  retorna ao Bardo.

---

## 18. Acessibilidade

| Feature | Detalhe |
|---------|---------|
| Subtítulos | Sempre on, customizáveis (tamanho, fundo) |
| Daltonismo | 3 paletas alternativas (deuteranopia, protanopia, tritanopia) |
| Modo letras grandes | UI inteira escala 1.5x |
| Modo "tudo lento" | gameplay slowdown 0.7x |
| Modo auto-câmera | câmera assistida |
| Modo auto-ritmo | despertar acerta sozinho |
| Sem tremor | desabilita qualquer screen-shake |
| Triggers narrativos | aviso opcional antes de cenas emocionais (morte natural Cap.14, Iaoth Cap.12, Casa-Espelhada Cap.11.5) |
| Screen reader | diálogos lidos via Web Speech API |
| Teclado-only | toda interação possível sem mouse |
| Mouse-only | toda interação possível sem teclado (modo "click-to-move") |
| Modo "para crianças" | desativa cenas mais densas (queima de cátaros, fogueira medieval); substitui por versão poética abstrata |
| Modo "respirar comigo" | usa microfone (com permissão) para detectar respiração e sincronizar mecânicas como Respiração-luz |

---

## 19. Salvamento

### Quando
- Auto-save a cada **passagem por santuário**.
- Auto-save após cada **despertar**.
- Auto-save após cada **Reflexão Duelal**.
- Auto-save após cada **morte/reencarnação**.
- Auto-save após **cada encontro com Aeon-Mestre**.

### Onde
- LocalStorage no MVP.
- IndexedDB para versão final (suporta save de cenas e thumbnails).
- Cloud opcional via login leve (post-MVP) — necessário para
  Ending D multiplayer assíncrono.

### Slots
- 5 slots manuais + 1 auto.
- Cada slot mostra: capítulo, % de Sleepers despertos, % de
  Aeons-Mestres encontrados, % de Pedras, vidas vividas, tempo
  total, miniatura da última cena.

### Backup
- Export/import de save em arquivo JSON (para usuários avançados).
- Reset opcional separado por categoria (ex.: zerar reencarnações
  mas manter Centelhas).

---

## 20. Performance

### Targets
| Tier | Hardware | Target |
|------|----------|--------|
| Low | Notebook integrada (Intel UHD) | 30fps @ 720p |
| Mid | GTX 1060 / M1 | 60fps @ 1080p |
| High | RTX 3060+ / M2 Pro | 60fps @ 1440p, full effects |

### Estratégias
- LOD em modelos 3D
- Frustum culling agressivo
- Postprocessing toggleable por tier (bloom + chromatic + vignette
  no high; só vignette no low)
- Texturas 2K máx no MVP
- Streaming de áudio
- Lazy load por reino
- **A Ascensão Dimensional (Atos VI–VII) é especialmente leve** —
  poucas geometrias, muitos shaders/luz, ideal para low-end.

### Otimizações específicas

- **Reincarnação:** o estado do mundo (Sleepers acordados, etc.) é
  serializado uma vez no Bardo, e desserializado ao renascer. Não há
  recarregar de assets.
- **Aliados ativos:** apenas os 5 mapeados em hotkeys têm efeitos
  passivos calculados em tempo real. Os demais ficam suspensos.
- **Codex e Cartas:** lazy load. Só carrega quando aberto.

---

## Próximo

→ [06-direcao-artistica.md](06-direcao-artistica.md) — como vai
parecer e soar.
