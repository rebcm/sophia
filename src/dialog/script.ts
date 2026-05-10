/* =========================================================
   script.ts — falas do MVP
   ---------------------------------------------------------
   Estrutura simples: cada beat tem id, fala, e a fase
   narrativa que ele dispara/finaliza.
   ========================================================= */

import type { DialogLine } from "../state/gameStore";

export const introDialog: DialogLine[] = [
  {
    speaker: "Sussurrante",
    text: "Você acordou. Eu esperei tanto por isso.",
  },
  {
    speaker: "Sussurrante",
    text: "Não, não responda ainda. Sua voz vai voltar quando você se lembrar dela.",
  },
  {
    speaker: "Sussurrante",
    text: "Olhe ao redor. Este lugar tem nome — Jardim dos Ecos. É a borda do mundo de quem dorme.",
  },
  {
    speaker: "Sussurrante",
    text: "Você é o primeiro a abrir os olhos. Mas não o último. Há outro logo ali, debaixo da árvore antiga.",
    hint: "Use WASD para mover, mouse para olhar. Caminhe até a árvore.",
  },
];

export const approachElderDialog: DialogLine[] = [
  {
    speaker: "Sussurrante",
    text: "Veja — ele dorme em pé, contemplando um fruto que nunca cai.",
  },
  {
    speaker: "Sussurrante",
    text: "Ele não te ouvirá. Ele não está aqui. Está sonhando que existe.",
  },
  {
    speaker: "Sussurrante",
    text: "Toque o peito dele — não com a mão. Com a luz. Ela está em você desde sempre.",
    hint: "Segure F no ritmo da pulsação dourada para sincronizar com a centelha dele.",
  },
];

export const elderAwakeDialog: DialogLine[] = [
  {
    speaker: "Velho do Jardim",
    text: "Eu... estava sonhando?",
  },
  {
    speaker: "Velho do Jardim",
    text: "Mas que bom que você veio. Eu havia esquecido por que vim.",
  },
  {
    speaker: "Sussurrante",
    text: "O nome verdadeiro dele é Aquele-que-procurou. Ele permanecerá aqui agora, desperto.",
  },
  {
    speaker: "Sussurrante",
    text: "Sentiu a sua luz crescer? Cada um que você desperta acende um pouco mais de você.",
  },
  {
    speaker: "Sussurrante",
    text: "Há sete céus além deste jardim. Sete tronos. Sete centelhas dela perdidas. O caminho é longo — mas você não está sozinho.",
    hint: "Você desbloqueou a Luz Interior. Continue explorando.",
  },
];
