import { useState } from "react";
import {
  useCharacterStore,
  type Sex,
  type SkinTone,
  type HairColor,
  type BodyHeight,
  type BodyType,
  type MortalOrigin,
  type Disposition,
} from "../state/characterStore";

/* =========================================================
   <CharacterCreation /> — customização inicial diegética
   ---------------------------------------------------------
   A Sussurrante "pergunta" enquanto o jogador se materializa.
   4 perguntas:
     1. Que forma tomarás?  (sexo)
     2. Que aparência tomarás?  (aparência detalhada)
     3. De onde vens?  (origem mortal)
     4. Que disposição trazes?  (disposição inicial)
   ========================================================= */

interface CharacterCreationProps {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4;

const SUSSURRO: Record<Step, string> = {
  1: "Ainda há tempo de escolher como aparecerás. A forma é véu — mas o véu importa, porque é por ele que outros te encontrarão.",
  2: "E como vais te apresentar? Cada detalhe é um espelho de algo que tu lembras vagamente.",
  3: "De onde vens, no mundo material? Antes de despertar aqui, onde tu dormias?",
  4: "E com que disposição chegas? Que tom o teu coração vai abrir agora?",
};

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [step, setStep] = useState<Step>(1);

  const setBody = useCharacterStore((s) => s.setBody);
  const setOrigin = useCharacterStore((s) => s.setOrigin);
  const setDisposition = useCharacterStore((s) => s.setDisposition);
  const body = useCharacterStore((s) => s.body);

  const next = () => {
    if (step < 4) setStep((step + 1) as Step);
    else onComplete();
  };

  return (
    <div className="character-creation">
      <div className="cc-bg" />

      <div className="cc-content">
        <p className="cc-whisper">
          <em>{SUSSURRO[step]}</em>
        </p>

        <div className="cc-step">
          {step === 1 && <SexStep value={body.sex} onChoose={(sex) => setBody({ sex })} />}
          {step === 2 && <AppearanceStep />}
          {step === 3 && <OriginStep onChoose={setOrigin} />}
          {step === 4 && <DispositionStep onChoose={setDisposition} />}
        </div>

        <div className="cc-actions">
          <button className="cc-btn" onClick={next}>
            {step < 4 ? "Continuar" : "Despertar"}
          </button>
        </div>

        <div className="cc-progress">
          {[1, 2, 3, 4].map((s) => (
            <span
              key={s}
              className={`cc-dot ${s <= step ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sub-passos ---------------- */

interface SexStepProps {
  value: Sex;
  onChoose: (sex: Sex) => void;
}

function SexStep({ value, onChoose }: SexStepProps) {
  const options: { value: Sex; label: string }[] = [
    { value: "homem", label: "Homem" },
    { value: "mulher", label: "Mulher" },
    { value: "androgino", label: "Andrógino" },
  ];
  return (
    <Choices value={value} options={options} onChoose={onChoose} />
  );
}

function AppearanceStep() {
  const body = useCharacterStore((s) => s.body);
  const setBody = useCharacterStore((s) => s.setBody);

  return (
    <div className="cc-appearance">
      <LabeledChoice<HairColor>
        label="Cor de cabelo"
        value={body.hairColor}
        onChoose={(hairColor) => setBody({ hairColor })}
        options={[
          { value: "castanho", label: "Castanho" },
          { value: "loiro", label: "Loiro" },
          { value: "preto", label: "Preto" },
          { value: "ruivo", label: "Ruivo" },
          { value: "cinza", label: "Cinza" },
          { value: "branco-luminoso", label: "Branco-luminoso" },
          { value: "sem-cabelo", label: "Sem cabelo" },
        ]}
      />
      <LabeledChoice<SkinTone>
        label="Tom de pele"
        value={body.skinTone}
        onChoose={(skinTone) => setBody({ skinTone })}
        options={[
          { value: "muito-clara", label: "Muito clara" },
          { value: "clara", label: "Clara" },
          { value: "media-clara", label: "Média clara" },
          { value: "media", label: "Média" },
          { value: "media-escura", label: "Média escura" },
          { value: "escura", label: "Escura" },
          { value: "muito-escura", label: "Muito escura" },
        ]}
      />
      <LabeledChoice<BodyHeight>
        label="Estatura"
        value={body.height}
        onChoose={(height) => setBody({ height })}
        options={[
          { value: "baixo", label: "Baixo" },
          { value: "medio", label: "Médio" },
          { value: "alto", label: "Alto" },
        ]}
      />
      <LabeledChoice<BodyType>
        label="Constituição"
        value={body.bodyType}
        onChoose={(bodyType) => setBody({ bodyType })}
        options={[
          { value: "esguio", label: "Esguio" },
          { value: "medio", label: "Médio" },
          { value: "robusto", label: "Robusto" },
        ]}
      />
    </div>
  );
}

interface OriginStepProps {
  onChoose: (origin: MortalOrigin) => void;
}

function OriginStep({ onChoose }: OriginStepProps) {
  const origin = useCharacterStore((s) => s.origin);
  return (
    <Choices<MortalOrigin>
      value={origin}
      onChoose={onChoose}
      options={[
        { value: "citadino-contemporaneo", label: "Citadino contemporâneo", hint: "Tu vivias entre telas e ruas tomadas de pressa." },
        { value: "aldeao-simples", label: "Aldeão simples", hint: "Tu vivias em comunidade pequena, cuidando do solo." },
        { value: "refugiado-de-guerra", label: "Refugiado de guerra", hint: "Tu vinhas de fronteiras quebradas, com pouco no peito além de fé." },
        { value: "eremita-viajante", label: "Eremita viajante", hint: "Tu vivias só, no caminho, escutando o vento." },
        { value: "filho-de-familia-rica", label: "Filho de família rica", hint: "Tu vivias rodeado de conforto, sem saber que era prisão." },
      ]}
    />
  );
}

interface DispositionStepProps {
  onChoose: (d: Disposition) => void;
}

function DispositionStep({ onChoose }: DispositionStepProps) {
  const disposition = useCharacterStore((s) => s.disposition);
  return (
    <Choices<Disposition>
      value={disposition}
      onChoose={onChoose}
      options={[
        { value: "contemplativo", label: "Contemplativo", hint: "Olho longo. Pergunta antes de agir." },
        { value: "curioso", label: "Curioso", hint: "Vou primeiro, entendo depois." },
        { value: "corajoso", label: "Corajoso", hint: "Onde há tremor, eu fico." },
        { value: "compassivo", label: "Compassivo", hint: "Sinto pelo outro antes de pensar em mim." },
      ]}
    />
  );
}

/* ---------------- Genéricos ---------------- */

interface ChoicesProps<T extends string> {
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChoose: (v: T) => void;
}

function Choices<T extends string>({ value, options, onChoose }: ChoicesProps<T>) {
  return (
    <div className="cc-choices">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`cc-choice ${value === opt.value ? "selected" : ""}`}
          onClick={() => onChoose(opt.value)}
        >
          <span className="cc-choice-label">{opt.label}</span>
          {opt.hint && <span className="cc-choice-hint">{opt.hint}</span>}
        </button>
      ))}
    </div>
  );
}

interface LabeledChoiceProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChoose: (v: T) => void;
}

function LabeledChoice<T extends string>({
  label,
  value,
  options,
  onChoose,
}: LabeledChoiceProps<T>) {
  return (
    <div className="cc-labeled">
      <span className="cc-label">{label}</span>
      <div className="cc-inline-choices">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`cc-inline-choice ${value === opt.value ? "selected" : ""}`}
            onClick={() => onChoose(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
