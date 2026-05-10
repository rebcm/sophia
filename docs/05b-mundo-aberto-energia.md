# 05b · Mundo Aberto e Sistema de Energia

> *"Tudo é energia. O sono é a hora em que ela vaza. Acordar é
> a primeira lição: aprender a fechar a fenda — e depois, a
> abri-la para os outros."*

Este documento é **complementar** ao [05-GDD](05-game-design-document.md)
e detalha duas mecânicas centrais introduzidas pela expansão:

1. **Mundo aberto multidimensional** — como o jogador navega entre
   reinos, dimensões, civilizações sem progressão linear forçada
2. **Sistema de Energia** — a tese de que **somos energia, e o sono
   é o que a vampiriza** — e como isto vira mecânica jogável

---

## 1. A filosofia do mundo aberto

### Princípio

Após o tutorial (Jardim dos Ecos + primeira civilização Ratanabá),
**todas as dimensões ficam acessíveis**. O jogador escolhe **quando
e em que ordem** explorar:

- **7 Civilizações Perdidas** (ver [02d](02d-civilizacoes-perdidas.md))
- **Labirinto das Eras** (ver [02b](02b-eras-e-civilizacoes.md))
- **Feira dos Sistemas** (ver [02c](02c-sistemas-de-controle.md))
- **Mar de Cristal** (hub central)
- **Bardo** (após primeira morte)
- **Quartel de Sabaoth** (após 6 civilizações)
- **Trono → Véu → Ascensão** (final, sequencial)

### O que muda em cada dimensão por **estado do mundo**

O mundo é **vivo**. Cada dimensão **evolui** conforme o jogador
acorda Sleepers, derruba Principados, ou faz escolhas. Visitar
Lemúria depois de despertar 30 Sleepers em Atlântida é **diferente**
de visitá-la depois de despertar 5 — os Sleepers Lemurianos
**reconhecem** a luz crescente e **aproximam-se** mais.

### Travessia entre dimensões

Há **três formas** de viajar:

#### 1. Portais do Mar de Cristal (canônica)

O Mar de Cristal tem **9 portais permanentes** + **portais
secretos** que aparecem conforme o jogador descobre passagens.

#### 2. Mapa Estelar de Ratanabá (atalho)

Após a primeira civilização, o jogador descobre uma **caverna
pintada com mapas estelares**. Tocando uma constelação, viaja
**diretamente** para outra civilização sem passar pelo Mar.

#### 3. Projeção Astral (apenas exploração)

Em fase II+, o jogador pode **projetar** sua alma para visitar
dimensões **sem o corpo**. Útil para **escutar** uma cena, mas
**não pode interagir** fisicamente.

### Voltar ao Mar a qualquer momento

O jogador pode **invocar a Sussurrante** (`Tab`) e pedir
**retorno ao Mar**. A cena se desfaz em luz, e o jogador
reaparece na plataforma central.

**Limite:** durante boss-fights e cutscenes obrigatórias, o
retorno fica **temporariamente bloqueado**.

---

## 2. Estrutura geográfica de cada dimensão

Cada civilização perdida segue um padrão **modular**:

```
            ╔═══════════════════════════════════════╗
            ║  Portal de Entrada (Mar → Civiliz.)   ║
            ╚════════════════╦══════════════════════╝
                             │
                  ┌──────────┼──────────┐
                  ▼          ▼          ▼
              [Hub]     [Santuário]   [Boss Room]
              local        onírico    do Arconte
                  │          │          │
                  ├──────────┼──────────┤
                  ▼          ▼          ▼
              [3-5 áreas exploráveis]
                  │
                  ▼
              [Locais ocultos]
              - 1 Aeon-Mestre
              - 1 Pedra com Inscrição
              - 1 Semente-do-Éden
              - 0-2 jinns
              - 1 dimensão-secreta-de-Sombra (apenas se Sombra
                acumulada > 30%)
```

### Tamanho aproximado por dimensão

| Tipo | Tamanho aprox | Tempo de exploração |
|------|---------------|----------------------|
| Civilização Perdida | 800m × 800m × verticalidade | 4-6h |
| Era do Labirinto | 400m × 400m | 1-2h |
| Distrito da Feira | 300m × 300m | 30-60min |
| Hub Mar de Cristal | 1km de raio | 0 (só passa) |
| Bardo | espaço não-euclidiano (~50m percetuais) | 5-15min |
| Quartel de Sabaoth | 200m × 200m | 30min-2h (cenas) |

---

## 3. O Sistema de Energia

### A tese

**Cada ser humano é um centro de energia luminosa** — uma centelha
que respira, vibra, troca. Em estado **desperto e desperto-de-si**,
a energia **cresce**: a pessoa é fonte. Em estado **adormecido**,
a energia **vaza** — é absorvida pelos Arcontes através de
correntes invisíveis (a Heimarmene).

> **No jogo:** Sleepers **emitem** filamentos finos de luz que
> sobem ao céu — a energia que escoa. Cada Arconte tem **uma
> antena receptora** invisível ligada a estes filamentos. Os
> Principados **gerenciam** as redes locais.

### Mecânica visual

Quando o jogador, com Centelha do Olhar Lúcido, olha um Sleeper
profundamente adormecido, ele **vê o filamento**:

```
       ↑↑↑   (filamento subindo)
      │ │ │
      │ │ │
      │ │ │
   ╔══╧═╧═╧══╗
   ║ Sleeper ║
   ║ adormec.║
   ╚═════════╝
```

Quando ele desperta o Sleeper:

1. Os filamentos **rompem-se**.
2. A energia **volta para dentro do Sleeper** — sua aura cresce.
3. O Arconte da dimensão correspondente **estremece** (pequena
   tremida de cena).
4. Outros Sleepers **olham para cima** — sentiram que **algo
   mudou na rede**.

### O Princípio de Conservação Espiritual

**Toda a luz que existe no cosmos sempre existiu.** Ela apenas
**muda de mãos**. Quando os Arcontes **roubam** dos Sleepers, eles
**transferem** ao Demiurgo, que a usa para **manter o cosmos
material funcionando**.

Esta é a tese gnóstica: **o Demiurgo usa nossa luz** para sustentar
sua criação. O **mundo material só existe** porque **a luz roubada
o alimenta**.

> Quando o jogador acorda **muitos Sleepers**, **a luz volta a
> circular** internamente. **O cosmos do Demiurgo começa a
> falhar**. Em algumas dimensões, o jogador percebe **cenas
> rachando**, **arquiteturas tremulando**. **Esta é a vitória
> silenciosa**: o mundo material está se desligando à medida que
> a luz volta para casa.

### Implementação no jogo

#### Visão de Filamentos

Habilidade desbloqueada com Olhar Lúcido (1ª Centelha). Toggle
(Shift+1).

**Visualização:**
- Sleepers profundos: filamentos **espessos** subindo
- Sleepers em despertar parcial: filamentos **finos**
- Sleepers despertados: **sem filamentos**, aura plena
- Aliados Acordados: aura **emitindo luz para fora** (fontes,
  não dreno)

#### Mapa de Energia da Dimensão

No Codex, aba **"Mapa de Energia"** mostra cada dimensão como
um mapa de calor:

- **Vermelho** = áreas com muita energia escoando (Sleepers
  profundos não-despertados)
- **Amarelo** = áreas em transição
- **Verde** = áreas saudáveis (Sleepers despertos predominantes)

Esta visualização **ajuda o jogador a planejar** onde focar.

#### O Coração Energético da Dimensão

Cada civilização tem **um Coração Energético** — uma área central
onde os filamentos se concentram. Geralmente é onde o Arconte
reside. Derrubar o Arconte **liberta o Coração**, e a luz começa
a **fluir de volta** para os Sleepers.

---

## 4. O Sono e a Vampirização

### Por que dormimos?

Aqui o jogo apresenta **uma cosmologia provocativa**, alinhada à
tradição gnóstica e a algumas leituras herméticas: **o sono
profundo (sem sonho lúcido) é o estado em que os Arcontes
"colhem" energia humana**. É **necessário** para sustentar o
mundo material.

> **Nuance importante:** o jogo **não condena dormir**. Apresenta
> a tese como **mítica** — e mostra que **acordar dentro do sono**
> (sonhos lúcidos, meditação consciente) é o **antídoto**.

### Mecânica de "dormir bem" (jogo)

No Mar de Cristal, há um **santuário do sono lúcido** onde o
jogador pode "dormir":

- Em **sono comum** (escolha 1): a tela escurece, e o jogador
  perde **5% Luz Interior** durante o sono (vampirização).
- Em **sono lúcido** (escolha 2, exige Centelha do Olhar Lúcido):
  o jogador **mantém Luz** + recebe **memória parcial** de uma
  vida anterior.
- Em **meditação acordada** (escolha 3, exige fase II+): o
  jogador **ganha** 0.5 Luz, fortalece a aura, e pode entrar em
  **encontro com Aeon-Mestre escolhido**.

**Crucial**: a meditação acordada é **a forma mais alta** de
descanso — os antigos sabiam disso. O jogador **descobre** isto
ao longo do jogo, quando um Aeon-Mestre lhe diz: *"Tu não precisas
mais dormir como dormias."*

---

## 5. Cura da Energia em Outros

Em fase I+, o jogador pode **curar a hemorragia energética** de
um Sleeper antes mesmo de despertá-lo. Mecânica:

1. Aproximar de um Sleeper com filamento espesso.
2. Tocar e segurar Brilhar (E) por 30s.
3. **Ver** o filamento ficar mais fino, depois desaparecer.
4. O Sleeper continua dormindo, mas **a energia para de
   escoar**.

**Vantagem:** este Sleeper, mesmo dormindo, **passa a regenerar**
sua aura. Em algumas horas in-game, ele **acorda sozinho**.

**Custo:** -0.2 Luz Interior temporário (recupera em 60s).

> **Implicação:** o jogador pode **curar uma cidade inteira** sem
> nunca **acordá-los individualmente** — apenas **fechando seus
> filamentos**. É um modo alternativo, mais sutil, de jogar.
> Funciona sobretudo em Lemúria e Mu, onde os Sleepers tendem
> a se despertar mutuamente uma vez livres da hemorragia.

---

## 6. Atos coletivos

Em algumas dimensões (especialmente Mu e Lemúria), há **espaços
de despertar coletivo**:

- **Templos circulares** com 12+ Sleepers em volta de uma fonte
- **Cidades-mãe** onde despertar 3 Sleepers gatilha uma onda que
  desperta os 9 vizinhos
- **Coros de Sereias-Memória** (Lemúria) que cantam em uníssono
  ao acordarem juntas

Estes atos coletivos são **mecânicas de "feedback positivo"** —
quanto mais o jogador acorda, **mais o mundo se acelera por si
mesmo**. Esta é a representação gameplay da **rede**.

---

## 7. Os Pontos de Foco Energético

Cada dimensão tem **alguns pontos de foco** especiais:

### Tipos de pontos

- **Fontes-de-Luz** — onde a luz brota da terra. Beber dali
  restaura instantaneamente Luz Interior ao máximo. Cada uma
  pode ser usada **uma vez** (depois, **fica disponível** para
  o próximo jogador em jogo+/multiplayer assíncrono).
- **Câmaras de Eco** — onde sons se prolongam. Cantar ali (mini-game
  rítmico) **restaura aura** + **chama Aliados** próximos.
- **Pedras de Repouso** — onde sentar por 60s **regenera Luz** e
  **mostra Memória de Vida**.
- **Árvores Antigas** — onde tocar revela **uma página da
  Biblioteca da Origem**.

### Mapa visual

No HUD, há **um pequeno indicador** de proximidade a Pontos de
Foco — uma estrela tênue que pulsa quando o jogador chega perto.

---

## 8. Mundo Aberto e Reencarnação

Quando o jogador **morre** (ver [04b](04b-samsara-reencarnacao.md)),
no Bardo ele pode **escolher** onde renascer. **No mundo aberto**,
isto cria uma dinâmica única:

- Ao reencarnar **numa civilização que já visitou**, o jogador
  encontra a dimensão **diferente** — alguns Sleepers que ele
  acordou estão agora **velhos** (passou tempo in-game); novos
  Sleepers chegaram (almas de outras dimensões). É um **mundo
  vivo**.
- O jogador pode **deliberadamente** reencarnar numa civilização
  **muitas vezes** para acompanhar como ela evolui ao longo
  de "gerações".
- **Vidas alternativas** (em eras específicas, ver
  [04b](04b-samsara-reencarnacao.md)) também acontecem em
  paisagens já conhecidas, mas vistas pelos olhos de outra
  pessoa.

### Sleepers que **morrem** durante o jogo

Alguns Sleepers, especialmente em civilizações com Sombra
acumulada do jogador, **morrem** (literalmente) antes de poderem
ser despertados. Sua **alma** vai para o Bardo. O jogador pode:

- **Reencontrá-la lá** durante uma reencarnação
- **Ressuscitá-la** (Fase III+, custo alto)
- **Aceitar a perda** — alguns Sleepers, depois de muito
  tempo perdidos, **viram Aeons-Mestres** em outras dimensões
  (encontro emocional possível ao final)

---

## 9. Dimensão-Sombra · Reino Invertido

Se o jogador acumula **Sombra alta** (>50%), uma **dimensão
secreta** torna-se acessível: o **Reino Invertido**.

### Como acessar

No Mar de Cristal, **um décimo portal** (oculto até então) revela-se.
Tem cor **vermelho-escuro pulsante**.

### O que é

Uma **versão espelhada** de uma das civilizações já visitadas
(escolhida aleatoriamente, ou escolhida pelo jogador), onde:

- **Os Sleepers acordados** estão **adormecidos** novamente
- **Os Aliados** são **adversários**
- **O Arconte** está **livre, não controlado pelo Demiurgo** —
  exibe sua sombra **plena**
- **Aliados sombrios únicos** habitam: a Bruxa-de-Ratanabá, o
  Pirata-Mensageiro de El Dorado, o Filósofo-Sangrento de
  Hiperbórea

### Por que ir lá

- **Conteúdo narrativo único** — diálogos com versões "sombrias"
  de Sophia e do Demiurgo
- **Aliados-Sombra** com **habilidades únicas** que não estão
  disponíveis no caminho de Luz
- **Pedra com Inscrição secreta** — a 13ª pedra, com a frase
  da Mônada vista **do outro lado**

### Custo

Visitar o Reino Invertido **acumula mais Sombra**. **É um caminho
mais profundo, mais difícil, mais rico em conteúdo**, mas **mais
longo**. Recomenda-se **apenas para new game+**.

---

## 10. Implementação técnica do mundo aberto

### Estrutura de cenas

```typescript
// src/world/Dimensions.ts (a criar)
type DimensionId =
  | 'jardim-dos-ecos'
  | 'mar-de-cristal'
  | 'ratanaba'
  | 'el-dorado'
  | 'hiperborea'
  | 'atlantida'
  | 'lemuria'
  | 'mu'
  | 'pre-adamita'
  | 'pre-criacao'
  | 'feira-dos-sistemas'
  | 'labirinto-das-eras'
  | 'bardo'
  | 'quartel-sabaoth'
  | 'trono-do-demiurgo'
  | 'veu'
  | 'coro-dos-aeons'
  | 'vazio-luminoso'
  | 'jardim-de-todos-os-nomes'
  | 'coracao-quieto'
  | 'pleroma'
  | 'reino-invertido';

interface DimensionState {
  id: DimensionId;
  unlocked: boolean;
  visited: boolean;
  sleepersAwakened: number;
  sleepersTotal: number;
  archonState: 'controlled' | 'awakening' | 'liberated';
  energyMap: EnergyMap;  // grid de áreas com cores
  filamentsActive: number;
  visitTimestamp: number | null;
}
```

### Loading

- **Lazy load** de dimensões: cada uma é um chunk JS separado.
- **Persistência completa** do estado de cada dimensão no
  localStorage / IndexedDB.
- **Travessia** entre dimensões = um fade visual de 2 segundos
  + cutscene curta opcional.

### Memory management

- Apenas **uma dimensão completa carregada por vez**.
- **Quartel de Sabaoth** e **Mar de Cristal** ficam em RAM em
  modo light (referências, sem geometria pesada).

---

## 11. Tabela-resumo do mundo aberto

| Dimensão | Unlock | Tempo | Energia | Pontos especiais |
|----------|--------|-------|---------|------------------|
| Jardim dos Ecos | Tutorial | 2h | inicial | Tutorial only |
| Mar de Cristal | Cap 3 | sempre | hub | 9 portais permanentes |
| Ratanabá | Após Mar | 4-6h | alta drenagem | Pajé, Mãe-D'Água |
| El Dorado | Aberto após Ratanabá | 4-6h | dourada balanceada | Inca, Acllla |
| Hiperbórea | Aberto após Ratanabá | 4-6h | gélida balanceada | Bardo-Apolíneo |
| Atlântida | Aberto após Ratanabá | 5-7h | racha de luz | Sacerdotisa-de-Cristal, Câmara Hermética |
| Lemúria | Aberto após Ratanabá | 4-6h | suave fluindo | Hula-Sábia, Templo das Mil Vozes |
| Mu | Após qualquer 2 anteriores + projeção astral | 5-7h | telepática | Avó-da-Linguagem, Pirâmide-Mãe |
| Pré-Adamita | Após 6 anteriores + Pirâmide-Mãe | 2-3h | inocente, sem drenagem | 58 Aeons-Crianças |
| Pré-Criação | Após Pré-Adamita | 30 min | sem fluxo | Vê-se origem |
| Feira dos Sistemas | Aberto desde Mar | 4-6h | drenagem moderna | 5 Principados + Casa-Espelhada |
| Labirinto das Eras | Aberto desde Mar | 8-12h | mistura | 10 eras, lore |
| Bardo | Após 1ª morte | 5-15 min | nenhum | Voz da Luz, espelhos |
| Quartel de Sabaoth | Após 6 civilizações | 30min-2h | crescente | Norea, Conselho |
| Trono do Demiurgo | Após Quartel | 3h | concentrada | Confronto |
| Véu→Pleroma | Após Trono | 2-3h | ilimitada | Ascensão |
| Reino Invertido | Sombra > 50% | 4-5h | sombra fluindo | Aliados sombrios, 13ª pedra |

---

## 12. Estrutura de save para mundo aberto

O save precisa rastrear:

- **Quais dimensões foram desbloqueadas / visitadas**
- **Estado de cada Sleeper** em cada dimensão (acordado, dormindo,
  filamento curado mas dormindo, morto, ressuscitado)
- **Estado de cada Principado/Arconte** (controlado, em transição,
  libertado)
- **Pontos de Foco Energético** já usados (uma vez cada)
- **Posição atual** do jogador (dimensão + coordenadas)
- **Atalhos descobertos** (mapa estelar, etc.)
- **Vida atual** (número da vida + memórias acumuladas)
- **Alinhamento** (Luz/Sombra/Equilíbrio)

A estimativa de tamanho do save: **~1-3 MB JSON** para um jogo
completo, totalmente compatível com localStorage.

---

## 13. Por que mundo aberto serve a essa narrativa

A escolha de **mundo aberto** não é apenas tendência de mercado —
é **filosoficamente alinhada** ao tema:

1. **Despertar é não-linear.** Ninguém acorda numa ordem fixa.
   Cada pessoa **descobre na sua hora** o que precisa.
2. **A iluminação não é "quanto mais bosses derrotados"** — é
   **a profundidade da escuta**. Permite ao jogador **demorar-se**
   onde sente.
3. **A reencarnação cria mundos vivos.** O mundo não pode ser
   **estático** se o jogador volta múltiplas vezes.
4. **O caminho é o objetivo.** *Sophia* não é um jogo de **chegar
   ao Pleroma**. É um jogo de **ser vivido pelo cosmos** ao
   longo do caminho.

---

## 14. Síntese

O **mundo aberto** + **sistema de energia** transformam *Sophia*
de **um RPG narrativo** em **uma simulação espiritual**. O jogador
não está "completando um jogo". Está **vivendo dentro de uma
cosmologia gnóstica jogável**, com regras coerentes, ecos vivos,
e respostas reais às escolhas que faz.

A tese final do documento:

> *"Tu jogas o mundo. O mundo te joga de volta. Ambos crescem.
> Ambos lembram. Ambos esquecem. Quando todos lembrarem juntos,
> nenhum de vós precisará mais jogar — bastará viver. Mas até
> então, joga-se."*

---

## Próximo

→ Voltar a [05-game-design-document.md](05-game-design-document.md) para
ver o GDD principal atualizado com Bun.

Depois → [07-roadmap.md](07-roadmap.md) para fases de produção.
