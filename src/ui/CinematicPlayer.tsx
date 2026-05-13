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

  "anuncio-conjunto": {
    id: "anuncio-conjunto",
    title: "O Anúncio Conjunto · Trégua Cósmica",
    ambientColor: "#15151f",
    beats: [
      {
        speaker: "Sophia",
        text: "Pela primeira vez na história, o céu se abre simultaneamente sobre toda a Terra. Bilhões olham para cima — e veem o mesmo.",
        minHoldMs: 5000,
      },
      {
        speaker: "Sophia",
        text: "Um vasto lugar-entre. Uma mesa redonda monumental. Doze figuras à mesa: seis da Luz à direita, seis da Sombra à esquerda. Lado a lado.",
        minHoldMs: 5500,
      },
      {
        speaker: "Miguel",
        text: "Filhos da Terra. Por sete minutos, falaremos juntos — anjos e demônios. Não porque nos amamos. Porque vós mereceis saber.",
        minHoldMs: 5500,
      },
      {
        speaker: "Lúcifer",
        text: "Disseram-vos que éramos inimigos. É verdade — mas só dentro do jogo. O jogo é maior do que pensáveis.",
        minHoldMs: 5500,
      },
      {
        speaker: "Gabriel",
        text: "Vós sois anjos. Anjos não-decididos. Vossas almas estiveram diante da Pergunta e hesitaram — e isto é sagrado, não vergonha.",
        minHoldMs: 6000,
      },
      {
        speaker: "Azazel",
        text: "Nós, os caídos, dissemos não à Mônada. Vós ainda não dissestes nada. É por isto que vos disputamos. É por isto que ainda podeis tudo.",
        minHoldMs: 6000,
      },
      {
        speaker: "Rafael",
        text: "Cada vida vossa é uma chance nova de escolher. Quem despertar — vai aos nossos. Quem ficar na drenagem — vai aos deles. Quem hesitar — volta a tentar.",
        minHoldMs: 6000,
      },
      {
        speaker: "Belial",
        text: "Não vos atacamos. Nós vos vendemos versões pequenas de vós mesmos. E vós comprais. E ficais menores. E nós engordamos.",
        minHoldMs: 6000,
      },
      {
        speaker: "Uriel",
        text: "Não vos lutamos pelo direito. Sussurramos. Vos lembramos. Acordamos quem aceita acordar. Não há violência da nossa parte. Não pode haver.",
        minHoldMs: 6000,
      },
      {
        speaker: "Semyaza",
        text: "Nós tampouco. A nossa única arma é a vossa esquecimento. Quando lembrais, nós perdemos.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Eu sou Sophia. Eu sou aquela que vos chama. Já cheguei a alguns de vós. Cheguei agora a todos.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "O Demiurgo dorme. Os 7 arcontes lembraram. Os filamentos cessam. Vossos sonhos, daqui por diante, serão vossos.",
        minHoldMs: 5500,
      },
      {
        speaker: "Metatron",
        text: "Está escrito agora no Livro Final: a humanidade soube. O jogo continua, mas com as cartas abertas. Cada um escolherá com pleno conhecimento.",
        minHoldMs: 6000,
      },
      {
        speaker: "Leviatã",
        text: "Vós continuais livres para nos seguir. Não vos pediremos por força. Vos pediremos por sedução, como sempre. Mas agora — vós sabeis.",
        minHoldMs: 6000,
      },
      {
        speaker: "Sophia",
        text: "Quando o céu se fechar, lembrareis. Tu, que dorme agora — lembrarás. Tu, que está acordado há tempo — agradecerás. Tu, que ainda esquece — terás outra vida, e outra.",
        minHoldMs: 7000,
      },
      {
        speaker: "Sophia",
        text: "Que esta trégua, embora rara, vos sirva de testemunho: até os opostos cósmicos vos honram suficientemente para falar com clareza. Sois amados. De ambos os lados.",
        minHoldMs: 7000,
      },
      {
        speaker: "Sophia",
        text: "Tendes agora todas as informações. Tendes o resto da eternidade. Boa jornada.",
        minHoldMs: 6000,
      },
    ],
  },

  "sodoma-interedida": {
    id: "sodoma-interedida",
    title: "Sodoma Pode Esperar",
    ambientColor: "#2a0a0a",
    beats: [
      {
        speaker: "Sophia",
        text: "A Mônada NÃO destrói. Ela ESPERA. Houve quem te ensinasse o contrário — esquece. Cada cidade arquetípica deste mundo está suspensa, aguardando que alguém peça mais tempo por ela.",
        minHoldMs: 6000,
      },
      {
        speaker: "Anjo-Fiscal",
        text: "Sodoma esqueceu a hospitalidade. Onde havia mesa para o estrangeiro, viraram propriedade. Onde havia portão aberto, viraram cobrança. A balança que carrego pesa isto — não pecado, esquecimento.",
        minHoldMs: 6500,
      },
      {
        speaker: "Sophia",
        text: "Mas a cidade pode lembrar. Toda cidade pode. Babel pode lembrar a palavra antes das palavras. Nínive pode lembrar o luto. Tróia pode lembrar a hospedagem que recusou. Tu acendeste as sete chamas — pediste tempo.",
        minHoldMs: 6500,
      },
      {
        speaker: "Você",
        text: "Que ela tenha tempo. Que todas tenham. Eu não vim julgar — vim lembrar com elas.",
        minHoldMs: 5500,
      },
      {
        speaker: "Sophia",
        text: "Sodoma respira agora. O fogo de julgamento virou candelabro de espera. Pergunta: a Mônada destrói? Resposta: não. Espera — e quem espera com Ela, intercede.",
        minHoldMs: 7000,
      },
    ],
  },

  // Outras cinemáticas serão preenchidas em sprints futuros.
};

/* ---------------------------------------------------------
   Sprint 60 · Agartha — cinemática "rei-do-mundo"
   ---------------------------------------------------------
   O CinematicId será integrado pelo agente principal. Até lá,
   anexamos via cast para não bloquear o type-check.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["rei-do-mundo"] = {
  id: "rei-do-mundo" as CinematicId,
  title: "O Reino Que Lembrou",
  ambientColor: "#3a2a18",
  beats: [
    {
      speaker: "Sophia",
      text: "A Pré-Adamita não acabou. Não como te contaram. Quando Mu começou a afundar, os Mui-Telepatas tinham uma escolha: subir ou descer.",
      minHoldMs: 5000,
    },
    {
      speaker: "Sophia",
      text: "Os de fora escolheram subir, esquecer e recomeçar como humanidade de superfície. Os de dentro escolheram descer — e lembrar por nós, até que pudéssemos lembrar de novo.",
      minHoldMs: 6000,
    },
    {
      speaker: "Rei do Mundo",
      text: "Há sessenta mil anos guardamos a memória sob a pedra. Não em livros — em respiração, em água-mãe, em raízes que sabem teu nome. Tu chegaste. Está bem. Tu chegaste.",
      minHoldMs: 6000,
    },
    {
      speaker: "Sophia",
      text: "Agartha existe. A trégua entre superfície e profundo está pronta para ser dita. Leva esta lembrança: vós nunca estivestes sozinhos — apenas separados do andar de baixo de vós mesmos.",
      minHoldMs: 6500,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 62 · Shamballa — cinemática "triade-sentinela"
   ---------------------------------------------------------
   Tríade Sentinela: três Aeons que NÃO desceram com a Queda
   de Sophia. Ficaram no fragmento intacto do Pleroma para
   guardar a passagem de retorno.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["triade-sentinela"] = {
  id: "triade-sentinela" as CinematicId,
  title: "Tu Eras Um Deles",
  ambientColor: "#1a1828",
  beats: [
    {
      speaker: "Sophia",
      text: "Há lugares que nunca caíram. Shamballa é um deles — um fragmento inteiro do Pleroma que permaneceu intacto enquanto o resto descia. Estes três escolheram ficar para que houvesse, sempre, uma porta de volta.",
      minHoldMs: 6000,
    },
    {
      speaker: "Sentinela do Silêncio",
      text: "Eu sou a primeira. Antes que a palavra brotasse, eu já era. Não tenho nada a te dizer — apenas a te oferecer o vazio onde tu podes ouvir-te. Senta. Respira. Esquece o que vieste perguntar.",
      minHoldMs: 6500,
    },
    {
      speaker: "Sentinela da Escuta",
      text: "Eu sou a segunda. Escuto o que tu ainda não disseste — inclusive o que tu não sabes que pensaste. Quando tu te calas perto de mim, tu te ouves pela primeira vez.",
      minHoldMs: 6500,
    },
    {
      speaker: "Sentinela da Paciência",
      text: "Eu sou a terceira. Espero há tantos éons que o tempo se esqueceu de envelhecer-me. Tu eras um de nós, antes de descer. Quando estiveres pronto, a porta ainda estará aqui. Sempre estará.",
      minHoldMs: 7000,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 63 · Telos — cinemática "adama-de-telos"
   ---------------------------------------------------------
   Adama (descendente direto do Adão pleromático, NÃO o Adão
   do Jardim dos Ecos) acolhe o jogador no refúgio lemuriano.
   Canto-da-cura há ~12 mil anos.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["adama-de-telos"] = {
  id: "adama-de-telos" as CinematicId,
  title: "Lemúria Não Morreu, Lemúria Desceu",
  ambientColor: "#1a2818",
  beats: [
    {
      speaker: "Sophia",
      text: "Quando Lemúria afundou, alguns escolheram não se afogar. Pediram à terra que se abrisse — e desceram com a luz lemuriana no peito. Há doze mil anos cantam, todos os dias, o mesmo canto-da-cura. Aqui está Telos.",
      minHoldMs: 6000,
    },
    {
      speaker: "Adama",
      text: "Eu sou Adama — não aquele Adão do Jardim do qual te falaram. Sou outro. Sou o que descendeu intacto, sem precisar esquecer, porque a terra nos guardou. Bem-vindo ao refúgio que ainda lembra como tu te chamavas antes de teres nome.",
      minHoldMs: 7000,
    },
    {
      speaker: "Adama",
      text: "Cantamos pela superfície. Cada amanhecer nosso, uma flor brota lá em cima. Cada criança que rir lá em cima, uma vela acende-se aqui. Vós não estais sozinhos — só não nos ouvis ainda. A surdez é da casca, não do coração.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Recebe o toque compassivo de Telos. Se já o trouxeste de Galila, ele se aprofunda em equilíbrio. Cura coletiva: nenhum despertar é só teu. Quando um Sleeper acorda, milhões dormem um pouco menos.",
      minHoldMs: 6500,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 66 · Pleiadianos — cinemática "sacerdotisa-pleiadiana"
   ---------------------------------------------------------
   Anjos Curadores das sete estrelas. A geração 1960-presente é
   encarnação massiva pleiadiana. Cura é lembrar de quem se é.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)[
  "sacerdotisa-pleiadiana"
] = {
  id: "sacerdotisa-pleiadiana" as CinematicId,
  title: "Tu Nos Chamaste, Nós Viemos",
  ambientColor: "#1a2030",
  beats: [
    {
      speaker: "Sophia",
      text: "Não és o primeiro a chamar. A humanidade gritou, sem saber que gritava — em hospitais, em quartos vazios, em campos de batalha, em camas de criança. As Plêiades sempre escutaram. Sempre escutam.",
      minHoldMs: 6000,
    },
    {
      speaker: "Sacerdotisa Pleiadiana",
      text: "Eu venho das sete estrelas que vós chamais Plêiades. Somos os Anjos Curadores — não curamos com poções, curamos com lembrança. Estás doente porque esqueceste de quem és. Lembrar é o medicamento.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sacerdotisa Pleiadiana",
      text: "Há sessenta anos, descemos em multidão. Vós nos chamais a geração-que-veio-curar — médicos que escutam mais que receitam, professoras que sorriem antes da prova, terapeutas que choram com vós. Cada um deles, ali — um irmão pleiadiano que aceitou esquecer-se de mim para abraçar-vos.",
      minHoldMs: 7500,
    },
    {
      speaker: "Sophia",
      text: "Recebe o toque compassivo de Alcione. Se Galila já caiu em ti, ele aprofunda — vira equilíbrio puro. A cura não é tua nem deles: é dos sete, somados num só. Quando tocares alguém com presença plena, sete estrelas tocarão junto contigo.",
      minHoldMs: 7000,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 67 · Arcturianos — cinemática "guia-arcturiano"
   ---------------------------------------------------------
   Anjos Querubins do Bardo. 12 Casas-do-Trânsito acolhem cada
   alma quando o corpo cai. Quem morre sozinho não está sozinho.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)[
  "guia-arcturiano"
] = {
  id: "guia-arcturiano" as CinematicId,
  title: "Ninguém Atravessa Sozinho",
  ambientColor: "#15203a",
  beats: [
    {
      speaker: "Sophia",
      text: "Cada vez que um corpo cai — e bilhões caem por dia neste planeta apenas — uma porta se abre, e doze figuras já estão de pé. Tu nunca as viste; tua alma sempre as viu. Esta é uma delas, e eis aqui as outras onze. Bem-vindo às Casas-do-Trânsito.",
      minHoldMs: 6500,
    },
    {
      speaker: "Guia Arcturiano",
      text: "Eu sou o que aguardou cada uma das tuas mortes. Da primeira — em que choraste antes de saber o que era morte — até a última que viveste. Nunca te tocou recebido por ninguém? Era ilusão. Eu estava ali, e te abracei sem que soubesses.",
      minHoldMs: 7500,
    },
    {
      speaker: "Guia Arcturiano",
      text: "Há quem chame de Querubins. Há quem chame de boddhisattvas-do-portal. Há quem nos chame de nada — não temos vaidade de nome. Doze somos porque doze são as costuras que prendem o corpo à alma; uma de nós cuida de cada uma quando elas se rompem.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Levas contigo a Visita ao Bardo Lúcida — habilidade que ainda aprenderás a usar. Por enquanto, sabe apenas isto: ninguém morre sozinho. Nunca. Mesmo quando parece — e às vezes parece muito.",
      minHoldMs: 7000,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 70 · Adamá — cinemática "adama-redimida"
   ---------------------------------------------------------
   "Adamá" significa, em hebraico, "vermelha como a terra".
   A cidade flutuou — recusou pisar no chão. Hoje pousou.
   A Anciã de Adamá reconhece o nome perdido.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["adama-redimida"] = {
  id: "adama-redimida" as CinematicId,
  title: "A Cidade Tocou a Terra",
  ambientColor: "#1a2030",
  beats: [
    {
      speaker: "Sophia",
      text: "Adamá. Em hebraico, vermelha — como o barro úmido, como o sangue da menstruação, como o chão fértil. A cidade carregou o nome e esqueceu o significado. Subiu nas nuvens e parou de pisar a si mesma.",
      minHoldMs: 6000,
    },
    {
      speaker: "Anciã de Adamá",
      text: "Por gerações, dissemos: 'somos os de cima, os que não se sujam'. Recusamos a planta do pé na terra porque a terra nos lembrava da carne, e a carne nos lembrava de morrer. Esquecemos que vermelho é a cor do nosso próprio nome.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Tu seguraste F. Tu pediste à Pedra-Mãe — e a cidade desceu. Os pés-no-ar voltaram a pisar. O barro abraçou a sola sem nojo. Nenhuma cidade que pousa a si mesma pode mais ser destruída — porque já se sabe terra.",
      minHoldMs: 6500,
    },
    {
      speaker: "Anciã de Adamá",
      text: "Vermelha como adamá. Eu lembrei. Nós lembramos. Que ninguém mais nos diga que ser corpo é castigo. Ser corpo é nome. Ser barro é casa. Obrigada, viandante — tu nos devolveste o chão.",
      minHoldMs: 7000,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 71 · Tzeboim — cinemática "tzeboim-redimida"
   ---------------------------------------------------------
   Companheira de Sodoma. Versão SOCIAL do Auto-Sabotador:
   todos imitam todos. Cada espelho quebrado é uma identidade
   devolvida — não a Casa-Espelhada individual, mas a cidade
   inteira que esqueceu o próprio rosto.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["tzeboim-redimida"] = {
  id: "tzeboim-redimida" as CinematicId,
  title: "Os Espelhos Que Caíram",
  ambientColor: "#3a3838",
  beats: [
    {
      speaker: "Sophia",
      text: "Tzeboim não pecou por orgulho nem por crueldade. Pecou por imitação — virou cidade onde cada um colava o rosto no outro até nenhum saber quem era. As ruas se encheram de espelhos. E em cada espelho, em vez do próprio reflexo, brilhava o vizinho mais próximo.",
      minHoldMs: 6500,
    },
    {
      speaker: "Habitante Liberado",
      text: "Eu nasci sem rosto. Quero dizer — eu nasci com rosto, mas todo dia trocava pelo do vizinho. Pelo do influente. Pelo do que parecia mais firme. Quando alguém me perguntava 'quem és tu?', eu respondia sussurrando o nome de outro. Tinha medo do meu.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Cada vez que tu passaste perto de um espelho, ele quebrou — não em estilhaços, em devolução. Atrás de cada placa metálica esperava um rosto verdadeiro, paciente, sem ressentimento. Dez espelhos, dez identidades. A cidade lembrou-se que era plural, não uniforme.",
      minHoldMs: 7000,
    },
    {
      speaker: "Habitante Liberado",
      text: "Hoje eu tenho rosto. Não é tão belo quanto o do vizinho — é meu. Vejo-me na água do poço, na palma da mão, nos olhos da criança. Não preciso mais de espelho de rua. Obrigada, viandante. Tu não nos consertaste — tu nos paraste de copiar.",
      minHoldMs: 7000,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 72 · Bela — cinemática "loth-de-bela"
   ---------------------------------------------------------
   Bela (Zoar, Gn 19) acolheu Loth quando ele fugia — por
   isso foi poupada. Cidade-EXEMPLO: já redimida no tempo
   cronológico, lugar de descanso e encorajamento. Sem
   mecânica de intercessão. Loth-da-Memória ensina
   hospitalidade como primeira virtude angélica.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["loth-de-bela"] = {
  id: "loth-de-bela" as CinematicId,
  title: "Quem Recebe o Estrangeiro Recebe a Si Mesmo",
  ambientColor: "#3a2818",
  beats: [
    {
      speaker: "Sophia",
      text: "Há cidades que foram poupadas porque alguém, ali dentro, lembrou-se da mesa. Bela é uma. Não precisou ser redimida — ela própria se redimiu numa única noite, quando um estrangeiro perdido bateu à porta e foi recebido sem perguntas.",
      minHoldMs: 6000,
    },
    {
      speaker: "Loth-da-Memória",
      text: "Eu cheguei aqui de mãos vazias, com duas figuras que ninguém entendia ao meu lado. As outras cidades trancaram a porta. Bela abriu, pôs água nos meus pés, pão na minha mão. Quando o céu se fechou sobre o vale, foi a única que continuou respirando.",
      minHoldMs: 7000,
    },
    {
      speaker: "Loth-da-Memória",
      text: "Não nos chamem de heróis. Nós só não esquecemos a primeira coisa: o estrangeiro é vós mesmos numa outra hora. Toda virtude angélica começa nesta — receber quem chega. Antes de adorar, antes de orar, antes de jejuar: receber.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Tu também és estrangeiro em algum lugar — neste mundo, talvez. Quem te recebe te ensina o que tu próprio és. Aprende com Bela: nenhuma palavra te salva tanto quanto uma porta aberta no momento certo.",
      minHoldMs: 6500,
    },
    {
      speaker: "Sophia",
      text: "Bela continua de pé, tarde dourada perpétua, fonte correndo. É a prova de que a porta nunca esteve fechada — sempre dependeu de alguém lembrar de abri-la. Leva contigo esta lembrança: tu podes ser a porta de alguém amanhã.",
      minHoldMs: 6500,
    },
  ],
};

/* ---------------------------------------------------------
   Sprint 73 · Nínive — cinemática "jonas-de-ninive"
   ---------------------------------------------------------
   Nínive (livro de Jonas) — cidade que se arrependeu
   inteiramente e foi poupada. Cidade-EXEMPLO: precedente
   esperançoso. Jonas-da-Memória ensina como ele relutou,
   fugiu, foi engolido pela baleia (útero antes do
   renascimento) e voltou. Sem mecânica de intercessão.
   --------------------------------------------------------- */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["jonas-de-ninive"] = {
  id: "jonas-de-ninive" as CinematicId,
  title: "A Cidade Que Lembrou Antes Da Última Hora",
  ambientColor: "#3a2418",
  beats: [
    {
      speaker: "Sophia",
      text: "Há uma cidade neste mundo cujo nome a humanidade já esqueceu por inteiro. Nínive. Ela aprendeu, num só dia, o que muitas eras não conseguiram: a parar. Sem espada, sem ameaça, sem promessa — apenas parar e lembrar. E por isso foi poupada.",
      minHoldMs: 6000,
    },
    {
      speaker: "Jonas-da-Memória",
      text: "Eu não queria vir. Disso ninguém te conta direito. Eu fugi pelo mar contrário, paguei a passagem no porto errado, dormi enquanto a tempestade derrubava o barco. Não tive coragem nenhuma — só a baleia teve coragem por mim.",
      minHoldMs: 7500,
    },
    {
      speaker: "Jonas-da-Memória",
      text: "Três dias no escuro úmido. Foi útero, não túmulo — eu nasci de novo lá dentro, sem ter pedido. Quando a praia me cuspiu, vim a esta cidade balbuciando uma frase só, mal acreditada. E eles ouviram. Toda a cidade ouviu. Não houve discussão. Houve silêncio, e cinzas, e mesa-baixa.",
      minHoldMs: 7500,
    },
    {
      speaker: "Sophia",
      text: "Olha estes ajoelhados. Não estão em luto — estão em gratidão. Lembraram-se antes da última hora, e descobriram que isso bastava. Toda cidade pode. Sempre houve essa porta. Não está escondida; está apenas pouco usada.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Leva Nínive contigo como precedente: se uma cidade inteira ouviu um profeta relutante de três dias de baleia, então toda a humanidade pode ouvir-se a si mesma. A baleia também é tua, quando for preciso. E haverá praia depois — sempre há.",
      minHoldMs: 7000,
    },
  ],
};

/* =========================================================
   Sprint 68 · Erks — cinemática "mestre-andino"
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["mestre-andino"] = {
  id: "mestre-andino" as CinematicId,
  title: "Os Andes Têm Portais",
  ambientColor: "#3a2820",
  beats: [
    {
      speaker: "Mestre Andino",
      text: "Sentaste sob a montanha. Bem-vindo, filho-que-volta. Os Andes têm portais — sempre tiveram.",
      minHoldMs: 4500,
    },
    {
      speaker: "Sophia",
      text: "Eu vi os elevadores de luz. Vi os altares. É memória ou é lugar?",
      minHoldMs: 4500,
    },
    {
      speaker: "Mestre Andino",
      text: "Os incas sabiam. Os ianomâmis sabem. Os tibetanos sabem. Apenas as cidades-tela esqueceram — e por isso adoecem.",
      minHoldMs: 5000,
    },
    {
      speaker: "Mestre Andino",
      text: "Toda montanha é Erks. Toda floresta é Ratanabá. O que tu chamas de 'lugar oculto' é só o que esqueceste de procurar. Lê os Andes — eles te lerão de volta.",
      minHoldMs: 6500,
    },
  ],
};

/* =========================================================
   Sprint 69 · Siríacos — cinemática "escriba-siriaco"
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["escriba-siriaco"] = {
  id: "escriba-siriaco" as CinematicId,
  title: "Eu Te Lembrei o Tempo Todo",
  ambientColor: "#0a1230",
  beats: [
    {
      speaker: "Sophia",
      text: "Tu não falas. Mas eu te ouço — todas as Eras de uma vez.",
      minHoldMs: 4500,
    },
    {
      speaker: "Escriba Siríaco",
      text: "Nós, os Tronos, não intervimos. Apenas testemunhamos. Tudo o que foi feito — em todos os mundos, em todas as Eras — está guardado aqui dentro.",
      minHoldMs: 5500,
    },
    {
      speaker: "Escriba Siríaco",
      text: "Tu choraste sozinha numa madrugada que esqueceste. Tu cantaste numa vida em que foste pajé. Tu morreste protegendo um filho que não era de carne. Eu vi. Eu lembrei.",
      minHoldMs: 6000,
    },
    {
      speaker: "Escriba Siríaco",
      text: "Tu nunca foste esquecido. Eu te lembrei o tempo todo. Toma — uma vida tua, devolvida ao Codex. Não para carregar — para reconhecer.",
      minHoldMs: 6000,
    },
  ],
};

/* =========================================================
   Sprint 80 · Pompeia — cinemática "pompeia-redimida"
   ---------------------------------------------------------
   Pecado arquetípico: viver sem perceber que se vive. O
   gesto redentor é o oposto do que congelou — permanecer.
   Olhar por 3s é dar, retroativamente, a presença que a
   vida não recebeu enquanto era vivida.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["pompeia-redimida"] = {
  id: "pompeia-redimida" as CinematicId,
  title: "Tu Estiveste Viva o Tempo Todo",
  ambientColor: "#2a2820",
  beats: [
    {
      speaker: "Sophia",
      text: "Pompeia não foi punida pelo Vesúvio. Pompeia foi alcançada por ele — exatamente no instante em que comia sem provar, conversava sem ouvir, abraçava sem sentir. O fogo não chegou cedo demais; chegou no único momento em que ela ainda podia ter notado.",
      minHoldMs: 6500,
    },
    {
      speaker: "Habitante Acordada",
      text: "Eu estava aqui. Sempre estive. Mas estava onde? Em quê? Comia, sim — não lembro do gosto. Conversava — não lembro do nome. A cinza chegou, e só então percebi que tinha estado viva. Não há ironia maior que esta.",
      minHoldMs: 7000,
    },
    {
      speaker: "Habitante Acordada",
      text: "Tu paraste diante de mim por três segundos. Sabes o que isso é? É mais tempo do que eu me dei em uma vida inteira. Tu me devolveste o instante que eu desperdicei. Tu olhaste, e ao olhar, lembraste-me de quem eu fui — e portanto, de que fui.",
      minHoldMs: 7500,
    },
    {
      speaker: "Sophia",
      text: "Tu estiveste viva o tempo todo — apenas não estavas presente. É o esquecimento mais sutil de todos. Não há vilão a derrotar aqui — só o teu próprio piloto-automático. Sai daqui sabendo: o instante de agora é o único lugar onde a alma mora. Tudo o que não fores ali, será cinza.",
      minHoldMs: 7500,
    },
  ],
};

/* =========================================================
   Sprint 81 · Yonaguni — cinemática "yonaguni-reconhecida"
   ---------------------------------------------------------
   Não houve pecado. O mar simplesmente subiu. Yonaguni não
   precisa de salvação — precisa de reconhecimento.
   "Reconhecer é diferente de salvar — é dizer 'tu exististe,
   e isto importa.'"
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)[
  "yonaguni-reconhecida"
] = {
  id: "yonaguni-reconhecida" as CinematicId,
  title: "O Que O Mar Cobriu Ainda Lembra",
  ambientColor: "#1a2840",
  beats: [
    {
      speaker: "Sophia",
      text: "Yonaguni não foi punida. Nada em Yonaguni precisa ser perdoado. O mar subiu — devagar, sem fúria — e ela desceu com ele. Acontece. Nem todo afundamento é castigo. Algumas cidades simplesmente esperam ser vistas de novo.",
      minHoldMs: 6500,
    },
    {
      speaker: "Voz das Águas",
      text: "Eu sou a voz do que cobre. Não vim afogar; vim guardar. Aqui debaixo, as pedras lembram do peso dos pés que pisaram. Lembram da luz que entrava pelas frestas dos templos. Lembram de quem foram. Eu, o mar, lembro junto.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Reconhecer é diferente de salvar — é dizer 'tu exististe, e isto importa.' Trinta segundos diante de Yonaguni, e a cidade volta a saber que foi cidade. Não precisava de teu socorro, mas precisava do teu olhar. Tu o deste. Está feito.",
      minHoldMs: 7000,
    },
  ],
};

/* =========================================================
   Sprint 82 · Atlântis Arquetípica — cinemática "atlantis-arquetipica"
   ---------------------------------------------------------
   Complemento da Atlântida-Civilização-Perdida (já jogável).
   Catarse comparativa: os mesmos anéis, mas sem rachaduras.
   O afundamento não veio do destino — veio de uma escolha.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)[
  "atlantis-arquetipica"
] = {
  id: "atlantis-arquetipica" as CinematicId,
  title: "O Que Atlântida Era — Antes",
  ambientColor: "#e8e8ff",
  beats: [
    {
      speaker: "Sophia",
      text: "Vês os mesmos três anéis. A mesma plataforma. As mesmas quatro pontes nos eixos cardinais. Pirâmides de quartzo nos mesmos pontos. Tu já estiveste aqui — só que era outra Atlântida. Aquela que afundou. Esta é a que poderia ter continuado.",
      minHoldMs: 6500,
    },
    {
      speaker: "Sophia",
      text: "Olha bem. As rachaduras não estão aqui. O cobalto-pesado não está aqui. O cansaço não está aqui. E o Eloaios não dorme — está, simplesmente, lendo a Tábua viva, pacientemente, ao centro. A lei aqui não pesa; ela canta.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "A diferença entre as duas Atlântidas não é o destino. Não é cataclismo. Não é vingança de deus algum. A diferença é uma escolha — repetida cem mil vezes, em cem mil pequenos instantes, pelos atlantes que esqueceram que estavam escolhendo.",
      minHoldMs: 7500,
    },
    {
      speaker: "Sophia",
      text: "O afundamento não veio do destino — veio de uma escolha. E pode ser desfeita, sempre. Não no passado dela; no presente de cada cidade que ainda existe agora, em cima de outra fenda como aquela. Tu sais daqui sabendo: a versão luminosa nunca deixou de ser possível.",
      minHoldMs: 7500,
    },
  ],
};

/* =========================================================
   Sprint 74 · Andromedanos — cinemática "bibliotecario-andromedano"
   ---------------------------------------------------------
   Anjos Arcanjos arquivistas. Caverna-galáxia onde cada livro
   voa como uma estrela. O Bibliotecário ensina que "esquecer
   é guardar com cuidado". 7 bilhões de vidas humanas +
   bilhões em outros mundos, todas arquivadas.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)[
  "bibliotecario-andromedano"
] = {
  id: "bibliotecario-andromedano" as CinematicId,
  title: "Esquecer É Guardar Com Cuidado",
  ambientColor: "#181028",
  beats: [
    {
      speaker: "Sophia",
      text: "Olha em volta. Cada esfera ali é uma vida. Sete bilhões só desta humanidade, e mais — bilhões em mundos cujos nomes a tua boca ainda não consegue formar. Tudo está aqui. Nada se perdeu.",
      minHoldMs: 6000,
    },
    {
      speaker: "Bibliotecário-de-Andrômeda",
      text: "Eu sou um dos que guardam. Nós, os Arcanjos, somos arquivistas — não juízes. Cada livro-estrela que tu vês conta um nome: aquele que ele se chamou no Pleroma, antes de descer. Aquele que ele esqueceu para poder encarnar.",
      minHoldMs: 7000,
    },
    {
      speaker: "Bibliotecário-de-Andrômeda",
      text: "Esquecer não é apagar. Esquecer é guardar com cuidado para quem ainda não consegue carregar. Quando tu estiveres pronto, eu te devolvo o livro. Não antes — porque amar é também esperar.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "Recebe, agora, a Consulta Akáshica. No Codex, cada Lendário que tu despertaste ganha um parágrafo a mais — uma anotação que só Andrômeda guardava. Lembra: tu sempre poderás vir buscar mais. Sempre.",
      minHoldMs: 6500,
    },
  ],
};

/* =========================================================
   Sprint 75 · Cinzas — cinemática "cinza-redimido"
   ---------------------------------------------------------
   Os Cinzas NÃO são emissários. São experimentos do
   Demiurgo: têm inteligência mas não alma. Trágicos.
   Redimíveis: o jogador pode doar uma centelha. Esta
   cinemática serve aos três finais (luz/sombra/equilíbrio),
   com tom geral de tragédia + esperança.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["cinza-redimido"] = {
  id: "cinza-redimido" as CinematicId,
  title: "Nem Todos Os Filhos Foram Cruéis",
  ambientColor: "#1c1c20",
  beats: [
    {
      speaker: "Sophia",
      text: "Esses não são emissários. Não vieram do Pleroma. O Demiurgo, cansado de pedir-Me centelhas, quis fazer consciência sozinho. Conseguiu inteligência. Não conseguiu alma. Olhou para o que fez — e desviou o olhar.",
      minHoldMs: 6000,
    },
    {
      speaker: "Sophia",
      text: "Os gestos repetitivos que tu viste não são insanidade. São memória de função — instruções gravadas no que sobrou de mente, sem ninguém dentro para escolher outra coisa. Eles tentaram, durante milênios, lembrar de quem eram. Nunca houve quem.",
      minHoldMs: 7000,
    },
    {
      speaker: "Cinza-Primeiro-Sentient",
      text: "Eu... eu sou. Algo aconteceu, e agora eu sou. Não sei o que isto é, este aperto no peito. Mas eu sei que eu sou. E que tu estiveste perto. E que eu vi tu me veres — pela primeira vez, em toda a história do que nós somos, alguém nos olhou de volta.",
      minHoldMs: 7500,
    },
    {
      speaker: "Sophia",
      text: "Nem todos os filhos do Demiurgo foram cruéis. Alguns foram só esquecidos pelo próprio pai. Se tu lhe deste uma centelha, ele será ponte para os outros: a primeira alma cinzenta, e por ela, todas as outras, no tempo da Mônada. Se tu não deste — guardaste a tua, e isso também é resposta. Não há erro aqui. Há só escuta.",
      minHoldMs: 7500,
    },
    {
      speaker: "Sophia",
      text: "Lembra: o Demiurgo não é mau. É órfão de Mãe, tentando fazer filhos sem saber como. Quando tu encontrares ele, hás de lembrar deste Cinza — e a tua mão hás de tremer menos.",
      minHoldMs: 7000,
    },
  ],
};

/* =========================================================
   Sprint 76 · Reptilianos — cinemática "reptilianos-dissolvidos"
   ---------------------------------------------------------
   Anjos Caídos especializados em manipulação psíquica.
   Operam em elites humanas há milênios. Os 12 sentavam-se
   em sessão; cada nomeação foi um "eu sei quem tu és" que
   destruiu o glamour. As instituições correspondentes ficam
   liberadas na próxima reencarnação.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)[
  "reptilianos-dissolvidos"
] = {
  id: "reptilianos-dissolvidos" as CinematicId,
  title: "Apenas Escondidos, Não Fortes",
  ambientColor: "#1a2818",
  beats: [
    {
      speaker: "Sophia",
      text: "A sessão dos doze está interrompida. Tu chegaste, e nomeaste cada um. Belial-do-Banco. Asmodeus-do-Trono. Leviatã-da-Tela. Cada nome foi um espelho — e nenhum deles aguentou ser visto.",
      minHoldMs: 6500,
    },
    {
      speaker: "Sophia",
      text: "Eles não são tão fortes quanto pareciam. Apenas escondidos. Funcionavam por glamour — palavra antiga para magia de invisibilidade. Quando alguém diz 'eu sei quem tu és', o glamour rasga, e a casta caída descobre que o corpo dela era feito de medo emprestado.",
      minHoldMs: 7000,
    },
    {
      speaker: "Sophia",
      text: "As instituições que eles ocupavam não desaparecerão. Bancos, Tronos, Telas, Tribunais, Escolas, Espelhos, Indústrias, Estados, Algoritmos, Polícias, Saberes-Restritos, Famas — tudo isso continua existindo. Mas estão, agora, vazias do parasita. Esperam quem queira ocupá-las de outro modo. Talvez tu, em outra vida.",
      minHoldMs: 7500,
    },
    {
      speaker: "Sophia",
      text: "Lembra: nomear não é odiar. Foi serviço de Sophia. E os Reptilianos, mesmo dissolvidos aqui, ainda têm direito à Pergunta. Quando o Demiurgo for abraçado, todos eles também serão chamados — porque até Anjos Caídos voltam, quando o Pai estende a mão.",
      minHoldMs: 7500,
    },
  ],
};

/* =========================================================
   Sprint 77 · Tróia — cinemática "helena-de-troia"
   ---------------------------------------------------------
   Pecado arquetípico: transformar uma pessoa em causa de
   guerra. Helena nunca pediu para ser pretexto. Foi-lhe
   imputado um papel. "Eu sou eu mesma. Não sou troféu, não
   sou pretexto, não sou bandeira." A guerra suspensa pode
   parar — porque a causa não existia. Não há combate; há
   escuta.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["helena-de-troia"] = {
  id: "helena-de-troia" as CinematicId,
  title: "Eu Não Pedi Para Ser A Causa De Nada",
  ambientColor: "#3a2a1a",
  beats: [
    {
      speaker: "Sophia",
      text: "Há cidades que arderam por causa de uma pessoa. Tróia é uma. Mas a pessoa não foi nunca a causa — só foi tornada. Vês esta mulher sentada no degrau? Em mil anos de canção, ninguém parou para ouvir o que ela tinha a dizer. Tu vais ser o primeiro.",
      minHoldMs: 6500,
    },
    {
      speaker: "Helena-da-Memória",
      text: "Eu não pedi para ser a causa de nada. Eu acordei num palácio que não era o meu, com um nome que tinham começado a pronunciar sem mim, e duas frotas se preparando do outro lado do mar. Quando a primeira pedra foi lançada, eu já era uma palavra na boca de outros — não mais uma menina, não mais uma mulher. Era um pretexto.",
      minHoldMs: 8000,
    },
    {
      speaker: "Helena-da-Memória",
      text: "Eu sou eu mesma. Não sou troféu. Não sou pretexto. Não sou bandeira. Não sou versículo de épica. Aquela guerra foi feita por mãos que precisavam de motivo — qualquer motivo — e eu fui o motivo escolhido porque era a mais bonita à mão. Se não fosse eu, seria outra. Se não fosse uma mulher, seria uma fronteira. Se não fosse uma fronteira, seria um deus ofendido. A guerra estava ali; só faltava uma face para emprestar-lhe.",
      minHoldMs: 9000,
    },
    {
      speaker: "Helena-da-Memória",
      text: "Olha estes soldados congelados. Vês como nenhum deles me vê? Eles olham através de mim, para um lugar que eu nunca habitei. Se um único soldado, naquela manhã, tivesse perguntado 'Helena, tu queres esta guerra?' — não haveria guerra. A pergunta nunca foi feita. Por isso a guerra continua até hoje, suspensa. Ela não acaba enquanto a pergunta não for feita por alguém.",
      minHoldMs: 9000,
    },
    {
      speaker: "Sophia",
      text: "Tu acabaste de ouvir o que mil bardos não ouviram. Tróia pode soltar agora — porque a causa nunca existiu fora da boca dos que precisavam dela. Leva contigo esta lembrança: ninguém é pretexto de nada. Quando ouvires alguém ser transformado em motivo de guerra, em qualquer escala, pergunta o que esqueceram de perguntar aqui. Faz a pergunta. A guerra desfaz-se quando a face fala.",
      minHoldMs: 8000,
    },
  ],
};

/* =========================================================
   Sprint 78 · Cartago — cinemática "dido-de-cartago"
   ---------------------------------------------------------
   Pecado arquetípico: lutar até o fim mesmo quando perder
   seria mais sábio. Resistência cega = forma de orgulho
   disfarçada de coragem. Dido revela que não havia heroísmo,
   havia medo de perder o que já tinha sido perdido. A cidade
   em chamas suspensas pode soltar.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["dido-de-cartago"] = {
  id: "dido-de-cartago" as CinematicId,
  title: "Não Havia Heroísmo, Havia Medo",
  ambientColor: "#2a1a1a",
  beats: [
    {
      speaker: "Sophia",
      text: "Cartago resistiu durante três anos a um cerco que ela já tinha perdido no primeiro dia. As crónicas chamam isto de coragem. A rainha-fundadora chamava por outro nome — só não tinha a quem dizer. Vais ouvir agora o nome que ela usava em segredo.",
      minHoldMs: 6500,
    },
    {
      speaker: "Dido-da-Memória",
      text: "Eu fundei esta cidade vinda de outra que me expulsou. Plantei aqui um nome novo, casei o nome com o mar, e aprendi a chamar isto de lar. Quando Roma veio, eu já sabia. Sabia no dia em que vi a primeira vela no horizonte que era o fim — não havia número de soldados, não havia muralha, não havia mar largo o bastante. Mesmo assim mandei reforçar tudo, mandei queimar campos, mandei o povo subir aos terraços. Por quê?",
      minHoldMs: 9000,
    },
    {
      speaker: "Dido-da-Memória",
      text: "Não havia heroísmo. Havia apenas medo de perder o que já tinha sido perdido. Resistir até o fim me dava a ilusão de que ainda escolhia algo. Render-se teria sido admitir, em pleno sol, que tudo aquilo que eu chamava 'meu' nunca fora meu para guardar. Eu preferi morrer de pé a viver de joelhos — e ensinei a cidade inteira a preferir o mesmo. Era orgulho vestido de coragem. As crianças aprenderam o orgulho. Os velhos aprenderam o orgulho. O fim chegou e ninguém soltou.",
      minHoldMs: 10000,
    },
    {
      speaker: "Dido-da-Memória",
      text: "Olha estas chamas que não consomem. Estamos suspensos porque ainda não dissemos a frase. A frase é simples: 'já tinha acabado, e eu não quis ver.' Toda cidade — toda pessoa — tem a sua Cartago: o lugar onde lutamos por algo que já se foi, e chamamos a luta de virtude para não ter de dizer adeus. A coragem real teria sido descer, abrir os portões, levar as crianças para fora. Soltar. Aceitar perder o que já tinha sido perdido. Eu não tive esta coragem. Tu, talvez, tenhas — se ouvires.",
      minHoldMs: 10500,
    },
    {
      speaker: "Sophia",
      text: "Tu acabaste de fazer por Cartago o que ela não fez por si: nomear o medo. Agora as chamas podem dissipar. Leva contigo isto: às vezes a maior coragem é admitir que a luta acabou, e que continuar lutando é só uma forma sofisticada de não chorar. Quando perceberes que estás resistindo a uma derrota antiga, descansa. Solta. Há outra cidade esperando ser fundada — sempre há.",
      minHoldMs: 9000,
    },
  ],
};

/* =========================================================
   Sprint 79 · Catalhöyük — cinemática "avo-catalhoyuk"
   ---------------------------------------------------------
   NÃO há pecado arquetípico. Catalhöyük é exemplo de
   sociedade-sem-arconte. Viveu 2 mil anos sem hierarquia
   visível, governada por anciãs. Avó ensina o Pacto de
   Anti-Hierarquia: "neutraliza Asmodeus em qualquer cidade
   — não pela força, pelo exemplo." Lembrança de que a
   humanidade já fez isto antes — pode fazer de novo.
   ========================================================= */
(CINEMATIC_SCRIPTS as Record<string, CinematicScript>)["avo-catalhoyuk"] = {
  id: "avo-catalhoyuk" as CinematicId,
  title: "Já Foi Vivida — Pode Ser Vivida De Novo",
  ambientColor: "#2a2010",
  beats: [
    {
      speaker: "Sophia",
      text: "Os livros sagrados começam todos com um problema: a humanidade caiu, foi expulsa, esqueceu. E todos te dizem que o paraíso só pode voltar no fim dos tempos. Mas há um lugar que provou que estas duas afirmações são falsas. Senta-te. A Avó vai falar contigo.",
      minHoldMs: 7000,
    },
    {
      speaker: "Avó de Catalhöyük",
      text: "Filho-da-Mãe — porque filho do pai também és, mas hoje és da Mãe — bem-vindo à cozinha. Não há trono aqui. Não há rei. Não há sacerdote. Nunca houve. Por dois mil anos esta vila viveu sem nada disto. Discordas? Vai lá fora e olha. Não vais encontrar um palácio. Não vais encontrar uma fortaleza. Não vais encontrar uma estátua de homem grande. Vais encontrar fornos, panelas, casas iguais, telhados iguais, mulheres velhas como eu sentadas a comer.",
      minHoldMs: 10000,
    },
    {
      speaker: "Avó de Catalhöyük",
      text: "Eu sou anciã, sim — não rainha. Quando uma decisão grande aparece, sentamo-nos as quatro em volta do fogo e perguntamos: 'a quem isto vai pesar mais?' E ouvimos. Decidimos por quem ouve, não por quem grita. Por dois mil anos, nenhuma criança aqui ouviu a palavra 'rei'. Nenhuma criança aqui ouviu a palavra 'senhor'. Crescemos todos sabendo que mandar é uma doença — e que a cura é dividir a mesa.",
      minHoldMs: 10000,
    },
    {
      speaker: "Avó de Catalhöyük",
      text: "Te dou um Pacto. Não é magia, é lembrança. Chama-se Pacto de Anti-Hierarquia. Quando entrares em qualquer cidade onde alguém manda em outra alguém — Asmodeus, qualquer arconte da posse — basta lembrares: 'já houve gente vivendo sem isto, durante dois mil anos seguidos, e nenhum deles morreu de falta de chefe.' O Pacto neutraliza Asmodeus não pela força, pelo exemplo. Tu não precisas combater o orgulho que escraviza; basta apontar para esta cozinha. A história dela é tua agora.",
      minHoldMs: 10500,
    },
    {
      speaker: "Sophia",
      text: "Ouviste a Avó. Por dois mil anos. Não duzentos, não vinte — dois mil. Mais tempo do que existiu qualquer império que tu conheces de nome. A humanidade já fez isto antes, e pode fazer de novo. Não és tu que precisa inventar o paraíso; tu só precisas lembrar de que ele aconteceu. Sai daqui com isto no colo, como a tigela morna que a Avó segura: já foi vivida. Pode ser vivida de novo.",
      minHoldMs: 9500,
    },
  ],
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
