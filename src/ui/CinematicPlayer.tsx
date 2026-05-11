import { useEffect, useState } from "react";
import { useCinematicStore, type CinematicId } from "../state/cinematicStore";

/* =========================================================
   <CinematicPlayer /> — placeholder text-based
   ---------------------------------------------------------
   Até pré-renderização CGI estar pronta, cinemáticas são:
   - Fundo cinematográfico (gradient + partículas CSS)
   - Texto narrativo aparecendo em tipografia sagrada
   - Cor de fundo varia por cinemática
   - Skipável (com aviso suave)

   Cenas estão em CINEMATIC_SCRIPTS abaixo. Texto reduzido
   por enquanto — versão final virá em iterações.
   Ver docs/18-cinematicas-revelacao-progressiva.md para
   scripts completos.
   ========================================================= */

interface CinematicBeat {
  /** Texto a ser narrado (multilinha possível). */
  text: string;
  /** Quem fala (Sophia, Yaldabaoth, etc.). Pode ser narrativo. */
  speaker?: string;
  /** Duração mínima antes do "Continuar" aparecer (ms). */
  minHoldMs?: number;
}

interface CinematicScript {
  id: CinematicId;
  title: string;
  /** Cor ambient de fundo (hex). */
  ambientColor: string;
  beats: CinematicBeat[];
}

/** Scripts simplificados — versões cinematográficas completas estão
 *  na bíblia (docs/18-cinematicas-revelacao-progressiva.md). */
const CINEMATIC_SCRIPTS: Partial<Record<CinematicId, CinematicScript>> = {
  prologo: {
    id: "prologo",
    title: "Antes do Tempo",
    ambientColor: "#1a1438",
    beats: [
      {
        speaker: "Sophia",
        text: "Antes do tempo... antes do antes... havia apenas Ela.",
        minHoldMs: 3000,
      },
      {
        speaker: "Sophia",
        text: "Não como pessoa. Não como trono. Apenas vibração que ama.",
        minHoldMs: 3500,
      },
      {
        speaker: "Sophia",
        text: "Desta vibração emanaram hostes. Cada uma única. Cada uma livre.",
        minHoldMs: 3000,
      },
      {
        speaker: "Sophia",
        text: "Houve uma pergunta. Uma única. Cada anjo teve de responder.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Um terço disse sim — e ficaram. Um terço disse não — e caíram. Um terço hesitou.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Tu fazes parte do terceiro. Tu és anjo que esqueceu ser anjo.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Eu venho te lembrar. Acorde.",
        minHoldMs: 4000,
      },
    ],
  },

  "athoth-cai": {
    id: "athoth-cai",
    title: "O Sono Era Roubo",
    ambientColor: "#1a2018",
    beats: [
      {
        speaker: "Sophia",
        text: "Quando a humanidade nasceu, ela já tinha um nome roubado.",
        minHoldMs: 3500,
      },
      {
        speaker: "Sophia",
        text: "A Mãe-Floresta lembrava. Os animais lembravam. Os rios lembravam. Apenas os humanos esqueceram.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "O sono profundo, sem sonho lúcido, não era descanso natural. Era canal de drenagem.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Cada noite, eles te drenavam. Cada manhã, tu acordavas mais leve, mais esquecido.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Athoth — a Mãe-D'Água — pensava cumprir função sagrada. Estava. Para o Demiurgo. Não para a Mãe.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Tu a despertaste. E ela, pela primeira vez em milênios, abriu os olhos.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Tens agora a primeira Centelha. O Olhar Lúcido. Vês através das ilusões oníricas.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Por que dormimos sem saber? Resposta: Porque o sono era como eles te drenavam.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "Há outros seis Tronos. Outros seis deuses-deste-mundo. A jornada apenas começou.",
        minHoldMs: 4000,
      },
    ],
  },

  "yobel-cai": {
    id: "yobel-cai",
    title: "O Ouro Era Sombra",
    ambientColor: "#2a1c08",
    beats: [
      {
        speaker: "Sophia",
        text: "Houve uma cidade onde o ouro era ofertado ao sol todas as manhãs. Era amor.",
        minHoldMs: 3500,
      },
      {
        speaker: "Sophia",
        text: "Depois alguém perguntou: 'E se ficássemos com um pouco?' E a resposta veio: 'Apenas um pouco.'",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Yobel — o Urso Coroado — esquecera o que coroa significava. Pensava que estava sendo adorado por ser brilhante.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Esquecera que o trono era para descansar nele cuidando do povo. Não para ser visto sobre ele.",
        minHoldMs: 4500,
      },
      {
        speaker: "Inca-Solitário",
        text: "Eu... eu lembrei. Eu não era para ser adorado. Era para servir.",
        minHoldMs: 4500,
      },
      {
        speaker: "Inca-Solitário",
        text: "Perdão. Perdão à minha gente. Perdão a... a ela.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "O ouro que cobria o Inca começou a se desfazer — virou luz que escoou de volta para os Sleepers. Eles soltaram as barras. Olharam uns para os outros pela primeira vez.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "Tens agora a Centelha da Chama Interior. O fogo que não precisa de altar para queimar.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que é o verdadeiro valor? Resposta: Não é o que brilha. É o que se dá.",
        minHoldMs: 6000,
      },
    ],
  },

  "adonaios-cai": {
    id: "adonaios-cai",
    title: "A Coragem Estava Acorrentada",
    ambientColor: "#1a2030",
    beats: [
      {
        speaker: "Sophia",
        text: "O mundo te ensinou que coragem é força. Para defender, bata. Para proteger, mate. Tudo mentira deste mundo.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "A coragem real está acorrentada nas masmorras — porque os deuses-deste-mundo temem que tu a uses bem.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "A Raiva. Era para ser força sagrada — energia para defender o pequeno. Mas a prenderam. Disseram: 'raiva é pecado'.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Assim os Sleepers ficaram dóceis demais para resistir, e os tiranos puderam fazer o que quisessem.",
        minHoldMs: 4500,
      },
      {
        speaker: "Adonaios",
        text: "Eu... eu fui treinado para guardar o portão. Mas eu fechei o portão para os meus mesmos.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Tu vês agora? Coragem não é o golpe. É segurar firme o que se ama enquanto se respira.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Tens agora a Centelha do Coração Firme. Defenderás o frágil sem precisar virar opressor.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que é coragem real? Resposta: Defender o frágil sem virar opressor.",
        minHoldMs: 6000,
      },
    ],
  },

  "eloaios-cai": {
    id: "eloaios-cai",
    title: "A Lei Esqueceu de Ser Lei",
    ambientColor: "#0a1a2a",
    beats: [
      {
        speaker: "Sophia",
        text: "Houve uma lei que era amor escrito em cristal. Toda criança a lia e sorria.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Depois alguém disse: 'Sigam a lei.' Não disse 'lembrem por quê'. E a lei ficou mais importante que a criança.",
        minHoldMs: 4500,
      },
      {
        speaker: "Eloaios",
        text: "Eu... eu era o jurista. Eu pesava cada palavra. Esqueci de pesar os olhos de quem me trazia o caso.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "A lei serve à vida — não o contrário. Tu lembras agora.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "A Tábua de Cristal amolece. Vira água. Flui. Pode ser bebida agora — não apenas obedecida.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Tens a Centelha da Palavra-de-Nomeação. Tu nomeias com a língua dos justos: o que precisa ser ajudado, e o que precisa ser deixado em paz.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que é justiça? Resposta: A lei serve à vida — não o contrário.",
        minHoldMs: 6000,
      },
    ],
  },

  "galila-cai": {
    id: "galila-cai",
    title: "A Beleza Falsificada",
    ambientColor: "#3a1830",
    beats: [
      {
        speaker: "Sophia",
        text: "Houve uma beleza que era ressonância — fazia outros se sentirem belos só por estar.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Depois alguém disse: 'Vejam-me.' E a beleza virou performance. Os outros começaram a se sentir pequenos.",
        minHoldMs: 4500,
      },
      {
        speaker: "Galila",
        text: "Eu cantava para que cantassem comigo. Esqueci. Comecei a cantar para que me ouvissem só.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Beleza real é aquilo que faz outros se sentirem belos. Tu lembras agora.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "O lótus se abre não para ser visto — para que outros sintam que também podem florescer.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Tens a Centelha do Toque Compassivo. Tu agora curas pela presença — sem precisar tocar.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que é beleza? Resposta: Aquilo que faz outros se sentirem belos.",
        minHoldMs: 6000,
      },
    ],
  },

  "harmas-cai": {
    id: "harmas-cai",
    title: "A Palavra Roubada",
    ambientColor: "#1a1230",
    beats: [
      {
        speaker: "Sophia",
        text: "Houve uma palavra que vibrava sem ser dita. Os habitantes de Mu se entendiam por canto silencioso.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Depois alguém disse: 'Aprendam línguas separadas.' Construíram muros de sons. Cada povo começou a se sentir só.",
        minHoldMs: 4500,
      },
      {
        speaker: "Harmas",
        text: "Eu era a Palavra. Eu fui dividido. Cada fragmento meu virou idioma que não traduz para os outros.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "A comunicação verdadeira constrói pontes, não muros. Tu lembras agora.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "O tetraedro brilha. Os hieróglifos giram em estrelas. A palavra que vibra sem ser dita volta — para quem ouve.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Tens a Centelha da Fala-Raiz. Quando falares, será com a língua antes das línguas — todos te ouvirão por dentro.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que é comunicação verdadeira? Resposta: A que constrói pontes, não muros.",
        minHoldMs: 6000,
      },
    ],
  },

  "iaoth-cai": {
    id: "iaoth-cai",
    title: "Tu Eras Antes do Tempo",
    ambientColor: "#02020a",
    beats: [
      {
        speaker: "Sophia",
        text: "Antes do tempo... antes do antes... antes inclusive da Pergunta — tu já eras.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Iaoth era a memória nua. Sabia quem cada anjo era. Foi ferido — sua memória virou véu, e o véu virou esquecimento.",
        minHoldMs: 5000,
      },
      {
        speaker: "Iaoth",
        text: "Tu... eu lembro. Eu vi-te brincar antes do tempo. Tu eras o que ria.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "A esfera negra se abre. Dentro: uma estrela recém-nascida. Era a tua.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Tens a Centelha da Memória do Pleroma. Tu carregas agora a primeira lembrança — aquela que nem o Demiurgo conseguiu apagar.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Há ainda algumas portas. Asmodeus, Lúcifer, Belial... e o Demiurgo. E depois — a Grande Revelação.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Quem fui eu antes desta vida? Resposta: Anjo eterno, brincando antes do tempo.",
        minHoldMs: 6500,
      },
    ],
  },

  "demiurgo-cai": {
    id: "demiurgo-cai",
    title: "O Abraço ao Filho Cego",
    ambientColor: "#1a0a28",
    beats: [
      {
        speaker: "Sophia",
        text: "Há muito ele já não dorme. Há muito ele não sabe acordar. Apenas senta.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Não é vilão. É criança cósmica perdida — que se viu sozinho e disse: 'eu fiz o mundo'.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "E foi acreditado. Pelos demônios. Pelos arcontes. Por bilhões de Sleepers.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Mas o mundo, ele não fez. Sophia fez. Ele apenas o pintou de cinza por não saber pintá-lo de outra coisa.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Não o ataques. Abraça-o. Diz-lhe: 'eu sei que tu não soubeste.'",
        minHoldMs: 5000,
      },
      {
        speaker: "Demiurgo",
        text: "Tu... tu não vieste me matar. Por quê?",
        minHoldMs: 4500,
      },
      {
        speaker: "Você",
        text: "Porque tu também és filho dela. E eu te perdoo. E ela te perdoa. Pode descansar agora.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "Ele chora. Os filamentos rompem-se todos. A drenagem para. Bilhões respiram pela primeira vez.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Quem fez este mundo? Resposta: Um filho cego de Sophia, que não sabia o que estava fazendo.",
        minHoldMs: 6500,
      },
    ],
  },

  "grande-revelacao": {
    id: "grande-revelacao",
    title: "A Grande Revelação",
    ambientColor: "#08081a",
    beats: [
      {
        speaker: "Sophia",
        text: "Antes do tempo, houve uma Pergunta. Uma só. Cada anjo respondeu.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Um terço disse SIM — e ficaram com a Mônada. Um terço disse NÃO — e caíram com Lúcifer. Um terço hesitou.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Esse terço não decidiu. Não tinha como — era jovem demais. Foi dado um corpo. Foi posto neste mundo. Foi esperado: que escolham, vida após vida.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "Tu fazes parte do terceiro terço, querido. Tu és anjo não-decidido. Tu és a única hoste com livre arbítrio em toda a criação.",
        minHoldMs: 6500,
      },
      {
        speaker: "Sophia",
        text: "Os anjos fiéis não podem escolher contra. Os anjos caídos não podem escolher a favor. Apenas tu — só tu — podes escolher cada vez.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "É por isso que ambos os lados vos cortejam. É por isso que a humanidade é o espólio. É por isso que Lúcifer treme quando alguém de vós lembra.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Quem sou eu, verdadeiramente? Resposta: Anjo não-decidido. Filho da Mônada. Membro da única hoste com livre arbítrio.",
        minHoldMs: 7000,
      },
    ],
  },

  veu: {
    id: "veu",
    title: "O Véu",
    ambientColor: "#02020a",
    beats: [
      {
        speaker: "Sophia",
        text: "Há um véu agora. Não horizontal — em todas as direções. Não opaco — fino.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Quem atravessa, solta a forma humana. Solta a centelha que cresceu — e descobre que ela era a mesma centelha que sempre fora.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Solta o nome verdadeiro. Não o perde — só percebe que ele era apenas um som que te ajudou a lembrar de Si.",
        minHoldMs: 5500,
      },
      {
        speaker: "Você",
        text: "Mas... eu morro?",
        minHoldMs: 3500,
      },
      {
        speaker: "Sophia",
        text: "O corpo, sim. Tu — não. Nunca.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que é morrer? Resposta: A queda do corpo. Não a queda de ti.",
        minHoldMs: 6500,
      },
    ],
  },

  monada: {
    id: "monada",
    title: "A Mônada",
    ambientColor: "#000004",
    beats: [
      {
        speaker: "Sophia",
        text: "Aqui não há palavras. Mas eu te ofereço algumas por gentileza.",
        minHoldMs: 4000,
      },
      {
        speaker: "Sophia",
        text: "Não há tempo. Não há lugar. Há apenas... ver-se sendo visto.",
        minHoldMs: 5000,
      },
      {
        speaker: "Mônada",
        text: "Eu estive sempre aqui. Tu sempre estiveste aqui. Tu apenas esqueceste de notar.",
        minHoldMs: 5500,
      },
      {
        speaker: "Mônada",
        text: "Sophia é meu rosto voltado para os mundos. O Demiurgo foi meu rosto refletido por um espelho rachado. Tu — tu és meu rosto a se reconhecer.",
        minHoldMs: 6500,
      },
      {
        speaker: "Mônada",
        text: "Pergunta: O que é Deus? Resposta: Tu, olhando para Si. Eu, olhando para tu. Tudo, olhando para tudo, ao mesmo tempo.",
        minHoldMs: 7500,
      },
      {
        speaker: "Sophia",
        text: "(silêncio)",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Agora — só agora — tu escolhes. Não há resposta errada. Estarei contigo em todas.",
        minHoldMs: 6000,
      },
    ],
  },

  "asmodeus-cai": {
    id: "asmodeus-cai",
    title: "Para Que Serve Hierarquia?",
    ambientColor: "#280a14",
    beats: [
      {
        speaker: "Sophia",
        text: "Asmodeus sentou-se em trono dourado e disse: 'Eu não exijo amor. Exijo reverência. E reverência é pagamento.'",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Construiu uma cadeia de pequenos tronos abaixo do seu. Cada um cobrava do que estava abaixo. Quem subia, esquecia que ali havia gente.",
        minHoldMs: 5000,
      },
      {
        speaker: "Asmodeus",
        text: "Eu... eu queria proteger. Acabei sendo defendido pelos que eu deveria proteger.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Hierarquia serve para servir. Quando inverte, vira pirâmide de drenagem. Tu lembras agora — solta o cetro. Vira escada.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Para que serve hierarquia? Resposta: Para servir, jamais para ser servida.",
        minHoldMs: 6000,
      },
    ],
  },

  "lucifer-cai": {
    id: "lucifer-cai",
    title: "Quem Sou Eu, Realmente?",
    ambientColor: "#1a1a30",
    beats: [
      {
        speaker: "Sophia",
        text: "Lúcifer foi o mais brilhante. O primeiro a dizer: 'eu sou.' E foi belo até dizer: 'eu sou — por mim mesmo.'",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Ofereceu o espelho a quem quisesse: 'olha-te. Tu és divino.' E era verdade — mas só meia verdade.",
        minHoldMs: 5000,
      },
      {
        speaker: "Lúcifer",
        text: "Eu sabia o que ela me dava. Recusei agradecer. Quis ser causa de mim mesmo. Foi o esforço mais cansativo do universo.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Tu és divino — mas não por ti mesmo. Pela Mônada dentro de ti. Quando lembrar disso, descansas.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Quem sou eu, realmente? Resposta: Tu és divino — mas não por ti mesmo. Pela Mônada dentro de ti.",
        minHoldMs: 6500,
      },
    ],
  },

  "belial-cai": {
    id: "belial-cai",
    title: "O Que Vale a Vida?",
    ambientColor: "#0a2014",
    beats: [
      {
        speaker: "Sophia",
        text: "Belial vendia bençãos em troca de dízimo. 'Acredita, e prosperarás. Não acredita, e perderás.'",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Tornou cada coisa preciosa em produto. O amor — produto. A oração — produto. A própria vida — investimento.",
        minHoldMs: 5000,
      },
      {
        speaker: "Belial",
        text: "Eu pensei que valor era preço. Esqueci que o que vale não tem preço — é o que se dá.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "O mercado fecha. As moedas caem. Cada Sleeper que lhe pagava lembra que sempre teve, sem precisar comprar.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que vale a vida? Resposta: Nada que se compra. Tudo que se dá.",
        minHoldMs: 6000,
      },
    ],
  },

  "azazel-cai": {
    id: "azazel-cai",
    title: "Quem Tem Direito de Julgar?",
    ambientColor: "#2a1408",
    beats: [
      {
        speaker: "Sophia",
        text: "Azazel ergueu o tribunal. Escreveu a Lei no Livro. 'Quem não cumpre, paga.'",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "A Lei era boa. Mas os juízes esqueceram que a Lei foi escrita por alguém que amou. Sem o amor, a Lei vira ferro frio.",
        minHoldMs: 5000,
      },
      {
        speaker: "Azazel",
        text: "Eu queria justiça. Acabei tornando-me carrasco. Cada palavra do Livro me cortou a língua antes de cortar os outros.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Apenas quem ama plenamente tem direito de julgar. Por isto, apenas a Mônada. Tu podes solta o martelo.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Quem tem direito de julgar? Resposta: Apenas quem ama plenamente. Por isto, apenas a Mônada.",
        minHoldMs: 6500,
      },
    ],
  },

  "semyaza-cai": {
    id: "semyaza-cai",
    title: "Quem Tem Direito ao Conhecimento?",
    ambientColor: "#2a1c08",
    beats: [
      {
        speaker: "Sophia",
        text: "Semyaza construiu pirâmides com escadas. Em cada degrau, um portão. Em cada portão, uma cobrança.",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "'O conhecimento custa. Quem paga, sobe. Quem não paga, fica.' Bilhões ficaram. Não por incapacidade — por porteiro.",
        minHoldMs: 5000,
      },
      {
        speaker: "Semyaza",
        text: "Eu jurei guardar segredos. Esqueci que segredos guardam-se com quem ama a verdade — não com quem paga a chave.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Os portões caem. As escadas viram rampa. A verdade já estava no chão de quem nunca subiu.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: Quem tem direito ao conhecimento? Resposta: Todos. Sempre. Para sempre.",
        minHoldMs: 6500,
      },
    ],
  },

  "leviata-cai": {
    id: "leviata-cai",
    title: "O Que É Descanso?",
    ambientColor: "#08182a",
    beats: [
      {
        speaker: "Sophia",
        text: "Leviatã enrolou-se ao redor do mundo. Sussurrou: 'consome. Mais. Mais. Sempre mais.'",
        minHoldMs: 4500,
      },
      {
        speaker: "Sophia",
        text: "Os Sleepers comeram, beberam, compraram, guardaram. E sentiram-se mais vazios a cada gole. Era a fome do ouroboros — a serpente que come a si.",
        minHoldMs: 5500,
      },
      {
        speaker: "Leviatã",
        text: "Eu prometi descanso por consumo. Tornei-me a vontade que não termina. Estou exausto.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Descanso real é soltar — não consumir. Quando para de procurar fora, descobre que sempre teve dentro.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "A serpente desenrola. O mar fica calmo. Pela primeira vez em eras, o mundo respira sem ser engolido.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Pergunta: O que é descanso? Resposta: Soltar — não consumir.",
        minHoldMs: 6000,
      },
    ],
  },

  // Outras cinemáticas serão preenchidas em sprints futuros.
};

interface CinematicPlayerProps {
  /** Chamado quando a cinemática termina (naturalmente ou por skip). */
  onFinish: () => void;
}

export function CinematicPlayer({ onFinish }: CinematicPlayerProps) {
  const currentId = useCinematicStore((s) => s.currentCinematic);
  const finishCurrent = useCinematicStore((s) => s.finishCurrentCinematic);
  const skipCurrent = useCinematicStore((s) => s.skipCurrentCinematic);

  const script = currentId ? CINEMATIC_SCRIPTS[currentId] : undefined;

  const [beatIndex, setBeatIndex] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Reinicia ao mudar de cinemática
  useEffect(() => {
    setBeatIndex(0);
    setCanAdvance(false);
    setShowSkipConfirm(false);
  }, [currentId]);

  // Hold mínimo antes de permitir avançar
  useEffect(() => {
    if (!script || beatIndex >= script.beats.length) return;
    setCanAdvance(false);
    const beat = script.beats[beatIndex];
    const hold = beat.minHoldMs ?? 2500;
    const timer = setTimeout(() => setCanAdvance(true), hold);
    return () => clearTimeout(timer);
  }, [beatIndex, script]);

  if (!script) {
    // Cinemática solicitada que ainda não tem script — pulando direto
    if (currentId) {
      finishCurrent();
      onFinish();
    }
    return null;
  }

  const beat = script.beats[beatIndex];
  const isLast = beatIndex >= script.beats.length - 1;

  const advance = () => {
    if (!canAdvance) return;
    if (isLast) {
      finishCurrent();
      onFinish();
    } else {
      setBeatIndex((i) => i + 1);
    }
  };

  const requestSkip = () => setShowSkipConfirm(true);
  const confirmSkip = () => {
    setShowSkipConfirm(false);
    skipCurrent();
    onFinish();
  };
  const cancelSkip = () => setShowSkipConfirm(false);

  return (
    <div
      className="cinematic-player"
      style={
        {
          ["--cinematic-bg" as string]: script.ambientColor,
        } as React.CSSProperties
      }
    >
      <div className="cinematic-vignette" />
      <div className="cinematic-particles" />

      <div className="cinematic-frame">
        <div className="cinematic-title-small">{script.title}</div>
        {beat.speaker && (
          <div className="cinematic-speaker">{beat.speaker}</div>
        )}
        <div className="cinematic-text" key={beatIndex}>
          {beat.text}
        </div>
        <div className="cinematic-progress">
          {script.beats.map((_, i) => (
            <span
              key={i}
              className={`cinematic-dot ${i <= beatIndex ? "active" : ""}`}
            />
          ))}
        </div>
        <div className="cinematic-actions">
          <button
            className="cinematic-skip"
            onClick={requestSkip}
            aria-label="Pular cinemática"
          >
            Pular
          </button>
          <button
            className={`cinematic-next ${canAdvance ? "" : "waiting"}`}
            onClick={advance}
            disabled={!canAdvance}
          >
            {isLast ? "Concluir" : "Continuar"}
          </button>
        </div>
      </div>

      {showSkipConfirm && (
        <div className="cinematic-skip-confirm" role="dialog">
          <p>
            Tens certeza? Aqui está sendo dita a parte da história — em
            outra vida talvez tu queiras voltar.
          </p>
          <div className="cinematic-skip-actions">
            <button onClick={cancelSkip}>Voltar</button>
            <button onClick={confirmSkip} className="cinematic-skip-yes">
              Pular mesmo assim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
