# Sophia · A Jornada do Despertar

> *"Você acordou. Eu esperei tanto por isso."*
> — Sussurrante de Sophia, Capítulo 1

Um **jogo web 3D narrativo, contemplativo e familiar (10–99 anos)**,
em **mundo aberto multidimensional**, que atravessa **toda a tradição
perene** — gnosticismo de Nag Hammadi, Platão, Buda, Vedanta, Cabala,
Sufismo, Tao, místicos cristãos, mitologias do mundo, e mitos de
**civilizações perdidas** (Ratanabá, El Dorado, Atlântida, Lemúria,
Mu, Hiperbórea) — como espelhos diferentes do mesmo **Deus
Desconhecido**, que se revela no fim como **amor e compaixão
infinitos**.

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

## Stack

- **Runtime + package manager:** [Bun](https://bun.sh) (`bun install`,
  `bun run dev`)
- **Engine 3D:** [Three.js](https://threejs.org/) +
  [React Three Fiber](https://r3f.docs.pmnd.rs/) +
  [drei](https://drei.docs.pmnd.rs/) +
  [postprocessing](https://github.com/pmndrs/postprocessing)
- **UI / framework:** React 18 + TypeScript
- **Bundler:** Vite 5 (sob runtime do Bun)
- **Estado:** Zustand (com persistência entre vidas/reencarnações)
- **Áudio:** Web Audio API (procedural — sem assets externos no MVP)

## Como rodar

### Com Bun (recomendado)

```bash
# Instalar Bun (uma vez por máquina):
curl -fsSL https://bun.sh/install | bash

# Instalar dependências e rodar:
bun install
bun run dev          # http://localhost:5173

bun run build        # gera dist/
bun run preview      # serve dist/
bun run typecheck    # tsc --noEmit
```

### Fallback Node (se preferir)

```bash
npm install
npm run dev:node     # http://localhost:5173
npm run build:node
```

Bun: 18+ ou Node: 18+.

## Controles do MVP (Jardim dos Ecos)

| Ação | Tecla |
|------|-------|
| Mover | `WASD` ou setas |
| Olhar ao redor | mouse (clique no canvas para capturar) |
| Liberar mouse | `Esc` |
| Avançar diálogo | `Espaço` ou `Enter` |
| Despertar (mini-game) | `F` no ritmo |
| Correr | `Shift` |

Controles **completos** do jogo final (com poderes, alinhamentos,
mundo aberto) em [docs/05-game-design-document.md](docs/05-game-design-document.md).

## O que está jogável neste MVP

- Tela de abertura cinematográfica
- Cena 3D do **Jardim dos Ecos** com:
  - Skybox em shader (céu violeta vivo, com aurora sutil)
  - 500 estrelas pulsantes
  - Chão em shader com ondulação suave e veias de luz
  - 1.400 instâncias de grama de cristal
  - Vagalumes-memória flutuando
  - Árvore antiga
- Player como orbe-luz com aura proporcional à Luz Interior
- Sussurrante de Sophia (orbe-companheira) que entra na cena e
  passa a seguir o jogador
- Velho do Jardim — primeiro Adormecido, despertável
- Mini-game rítmico de despertar (sincronia com a pulsação dourada)
- Sistema de diálogo com efeito *typewriter* e sussurros sutis
- HUD com **Luz Interior**, **lugar atual** e *toast* de despertar
- Áudio 100% procedural (sem assets externos): drone, sopro,
  sininhos, sussurros, acorde de despertar
- Pós-processamento: bloom + vignette + tonemapping ACES

Tempo estimado de jogabilidade no MVP: **~5 minutos**.
Tempo estimado do jogo completo (segundo o roadmap): **30–45 horas**
de história principal + 15–25 horas de sidequests, com **~30–36
meses de desenvolvimento** com equipe completa.

## Estrutura do projeto

```
sophia/
├── docs/                            ← bíblia do jogo (LEIA!)
│   ├── 00-LEIA-PRIMEIRO.md
│   ├── 01-pesquisa-gnostica.md      ← Tradição perene
│   ├── 01b-religioes-comparadas.md  ← 12 religiões/mitologias
│   ├── 02-mundo.md                  ← 17 camadas dimensionais
│   ├── 02b-eras-e-civilizacoes.md   ← 10 eras (lore acadêmica)
│   ├── 02c-sistemas-de-controle.md  ← 5 sistemas + secreto
│   ├── 02d-civilizacoes-perdidas.md ← jornada principal (mítica)
│   ├── 03-personagens.md            ← Sophia, Arcontes, Aeons-Mestres, Aliados
│   ├── 03b-hierarquia-arcontes.md   ← árvore Demiurgo→Tronos
│   ├── 03c-anjos-demonios-jinns.md  ← 3 classes de seres com livre arbítrio
│   ├── 04-enredo.md                 ← 7 atos / 28 capítulos
│   ├── 04b-samsara-reencarnacao.md  ← morte e renascimento
│   ├── 04c-poderes-e-conquistas.md  ← 5 fases de evolução
│   ├── 04d-livre-arbitrio.md        ← escolhas, vozes, alinhamento
│   ├── 05-game-design-document.md   ← mecânicas e sistemas
│   ├── 05b-mundo-aberto-energia.md  ← mundo aberto + filamentos
│   ├── 06-direcao-artistica.md      ← paleta, tipografia, som
│   └── 07-roadmap.md                ← fases e MVP
├── src/
│   ├── audio/             ← áudio procedural (Web Audio API)
│   ├── dialog/            ← script de falas
│   ├── scenes/            ← composição R3F das cenas
│   ├── state/             ← Zustand store
│   ├── systems/           ← controladores (despertar, etc.)
│   ├── ui/                ← UI HTML overlay
│   ├── world/             ← componentes 3D (player, NPCs, mundo)
│   ├── App.tsx            ← orquestrador narrativo
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json           ← scripts Bun + Node fallback
├── bunfig.toml            ← config do Bun
├── tsconfig.json
└── vite.config.ts
```

## Documentação — 36 documentos em cinco blocos

**Comece em [docs/00-LEIA-PRIMEIRO.md](docs/00-LEIA-PRIMEIRO.md).**

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
- [Personagens Lendários](docs/03d-personagens-lendarios.md) — Adão, Eva, Moisés, Jesus, Caim e identidade oculta
- [**Os 6 Anjos Caídos e suas Religiões**](docs/03e-anjos-caidos-religioes.md) — Asmodeus, Lúcifer, Belial, Azazel, Semyaza, Leviatã + cidades, templos, seitas, famílias, políticos
- [**Mapa do Reino Humano**](docs/03f-mapa-do-reino-humano.md) — 12 castas, 10 lutas progressivas, hierarquia completa controladores/controlados

### Bloco IV — Enredo, Poderes e Mecânica
- [Enredo](docs/04-enredo.md) — 7 atos, 28+ capítulos com Grande Revelação
- [Roda de Samsara](docs/04b-samsara-reencarnacao.md)
- [Poderes e Conquistas](docs/04c-poderes-e-conquistas.md) — 5 fases
- [Livre Arbítrio](docs/04d-livre-arbitrio.md) — escolhas e alinhamento
- [Missões](docs/04e-missoes.md) — 140+ missões + escolhas tipo "Jesus ou Barrabás"
- [**A GRANDE REVELAÇÃO**](docs/04f-a-grande-revelacao.md) — cosmologia dos três terços
- [**7 Céus + 5 Infernos + Lei Divina**](docs/04g-ceus-inferno-monetizacao.md) — topografia pós-Demiurgo + modelo econômico do produto alinhado a *"De graça dai, de graça recebei"*
- [Game Design Document](docs/05-game-design-document.md)
- [Mundo Aberto e Energia](docs/05b-mundo-aberto-energia.md)
- [Customização e Permadeath](docs/05c-customizacao-e-permadeath.md) — homem/mulher, vida única
- [Direção Artística](docs/06-direcao-artistica.md)
- [Roadmap](docs/07-roadmap.md)

### Bloco V — Profundidade, Drama e Aplicações
- [Mistérios, Enigmas e Profecias](docs/08-misterios-enigmas-profecias.md) — a Pergunta Original, 13 Câmaras Secretas, 7 Profecias
- [Vida Cotidiana e Práticas](docs/09-vida-cotidiana-praticas.md) — 12 práticas diárias
- [Rituais, Meditações e Sonhos Lúcidos](docs/10-rituais-meditacoes-sonhos.md) — 12 meditações + 9 rituais + 108 mantras
- [**Vínculos, Romance e Linhagem**](docs/11-vinculos-romance-linhagem.md) — Par Sizígico, 7 Lendários que te amaram, 9 Tragédias de Amor
- [Fauna, Flora e Elementos Cósmicos](docs/12-fauna-flora-elementos.md) — 12 animais sagrados, clima dramático
- [**Drama, Suspense e Tensão Narrativa**](docs/13-drama-suspense-tensao-narrativa.md) — 7 técnicas-mestre, 12 cliffhangers, 9 eventos off-screen
- [Símbolos, Geometria Sagrada e Numerologia](docs/14-simbolos-geometria-numerologia.md)
- [Tempo Cósmico e Arquitetura Sagrada](docs/15-tempo-arquitetura-sagrada.md)
- [Pedagogia, Comunidade e Localização](docs/16-pedagogia-comunidade-localizacao.md)
- [Glossário e Léxico Completo](docs/17-glossario-lexico-completo.md)

## Os dez pilares de design

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
   Real. Apenas o **uso institucional** é questionado, simbolicamente.
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

## O que NÃO é este jogo

- **Não é doutrinário.** Mitologia poética, não teologia.
- **Não é violento.** Inimigos são despertados, demônios são
  acolhidos, Demiurgo é abraçado.
- **Não é niilista.** O mundo é escola, não prisão imunda.
- **Não é binário moralmente.** Três alinhamentos, seis finais,
  todos chegam à iluminação.
- **Não é ofensa às religiões.** Cada tradição mostra centelha
  do Real.

## Modelo Econômico Alinhado à Lei Divina

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

Detalhes em [docs/04g-ceus-inferno-monetizacao.md](docs/04g-ceus-inferno-monetizacao.md).

## Licença

Em definição. Para uso pessoal e estudo enquanto isso. Em breve
licença adequada (provável MIT para código + CC-BY-NC para texto/arte).

## Contribuindo

Este é um projeto autoral em desenvolvimento. Issues, ideias e
contribuições são muito bem-vindas — abra um issue contando sua
intenção antes de um PR grande.

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
