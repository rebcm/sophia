/* =========================================================
   SophiaAudio — paisagem sonora procedural
   ---------------------------------------------------------
   Constrói uma paisagem viva, sem usar samples externos.
   Tudo Web Audio API: drones, sininhos, sussurros, chimes.
   ========================================================= */

type Mood =
  | "garden"
  | "approach"
  | "awakening"
  | "after"
  // Sprint 34 — moods por cena
  | "mar-de-cristal"
  | "ratanaba"
  | "el-dorado"
  | "hiperborea"
  | "atlantida"
  | "lemuria"
  | "mu"
  | "pre-adamita"
  | "casa-espelhada"
  | "tabernaculo"
  | "feira"
  | "labirinto"
  | "trono"
  | "bardo"
  // Sprint 60-67 · expansão (intra-terrenas + julgamento + cósmicas)
  | "agartha"
  | "sodoma"
  | "shamballa"
  | "telos"
  | "gomorra"
  | "babel"
  | "pleiadianos"
  | "arcturianos"
  | "erks"
  | "siriacos"
  | "adama"
  | "tzeboim"
  | "bela"
  | "ninive"
  | "andromedanos"
  | "cinzas"
  | "reptilianos"
  | "troia"
  | "cartago"
  | "catalhoyuk"
  | "pompeia"
  | "yonaguni"
  | "atlantis-arquetipica";

class SophiaAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private droneNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private mood: Mood = "garden";
  private droneStarted = false;
  private breathInterval: number | null = null;

  /** Inicia o contexto. Chamar dentro de um gesto do usuário (clique). */
  init() {
    if (this.ctx) return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    // sweep para volume confortável em 1.5s
    const t = this.ctx.currentTime;
    this.master.gain.linearRampToValueAtTime(0.55, t + 1.5);
  }

  /** Inicia o drone base do Jardim. */
  startDrone() {
    if (!this.ctx || !this.master || this.droneStarted) return;
    this.droneStarted = true;
    const ctx = this.ctx;

    // Camadas: fundamental + 5ª justa + oitava + harmônico colorido
    const freqs = [55, 82.4, 110, 165]; // Lá1, Mi2, Lá2, Mi3
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;

      // LFO para bater levemente em cada nota
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.07 + i * 0.02;
      lfoGain.gain.value = 0.4 + i * 0.1;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      // filtro passa-baixa para suavizar
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 800 + i * 200;
      filt.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      const target = 0.18 - i * 0.02;
      gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 4);

      osc.connect(filt);
      filt.connect(gain);
      gain.connect(this.master!);
      osc.start();

      this.droneNodes.push({ osc, gain });
    });

    // sopro respiratório
    this.startBreathLoop();
  }

  /** Sopro de fundo — uma respiração suave que dá vida. */
  private startBreathLoop() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;

    // ruído branco filtrado para parecer vento/sopro
    const bufSize = ctx.sampleRate * 4;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 600;
    filt.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0.0;

    noise.connect(filt);
    filt.connect(gain);
    gain.connect(this.master);
    noise.start();

    // respiração 4s in / 5s out
    let phase = 0;
    this.breathInterval = window.setInterval(() => {
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      if (phase === 0) {
        gain.gain.linearRampToValueAtTime(0.06, t + 4);
        phase = 1;
      } else {
        gain.gain.linearRampToValueAtTime(0.0, t + 5);
        phase = 0;
      }
    }, 4500);
  }

  /** Sininho cristalino para momentos pontuais (despertar etc.) */
  chime(midi: number = 76, duration = 1.6, vol = 0.18) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    [1, 2.001, 3.012, 4.04].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const gain = ctx.createGain();
      const peak = vol / (i + 1);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(this.master!);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    });
  }

  /** Acorde de despertar — sucessão de notas suaves. */
  awakenChord() {
    // arpejo Mi maior — Mi, Sol#, Si, Mi alto
    [76, 80, 83, 88].forEach((m, i) => {
      setTimeout(() => this.chime(m, 2.2, 0.22), i * 220);
    });
  }

  /** Pulso curto — usado a cada batida do mini-game. */
  pulse() {
    this.chime(72, 0.6, 0.14);
  }

  /** Sussurro — ruído rosa modulado, para a Sussurrante falar. */
  whisperBlip() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    const bufSize = ctx.sampleRate * 0.15;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.sin((i / bufSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * 0.3 * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 1200 + Math.random() * 1200;
    filt.Q.value = 4;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.master);
    src.start(t);
  }

  /** Mood do drone — muda timbre conforme o jogador progride. */
  setMood(mood: Mood) {
    if (this.mood === mood || !this.ctx) return;
    this.mood = mood;
    const ctx = this.ctx;
    // Cada mood é uma assinatura tímbrica: pesos das 4 camadas
    // de drone (fundamental, 5ª, oitava, harmônico colorido).
    const targetVols: Record<Mood, number[]> = {
      // Originais (legado do Jardim)
      garden: [0.18, 0.12, 0.16, 0.08],
      approach: [0.16, 0.14, 0.18, 0.12],
      awakening: [0.1, 0.1, 0.14, 0.18],
      after: [0.14, 0.18, 0.18, 0.1],

      // Hub — luminoso e equilibrado
      "mar-de-cristal": [0.16, 0.16, 0.18, 0.12],

      // 7 Civilizações Perdidas
      ratanaba: [0.2, 0.1, 0.14, 0.14], // floresta — grave + sopro
      "el-dorado": [0.12, 0.18, 0.22, 0.16], // dourado — brilhante
      hiperborea: [0.1, 0.08, 0.16, 0.22], // cristal — agudo
      atlantida: [0.14, 0.18, 0.16, 0.14], // estrutural — equilibrado
      lemuria: [0.16, 0.2, 0.14, 0.12], // canto — caloroso
      mu: [0.08, 0.12, 0.2, 0.22], // geometria — etéreo agudo
      "pre-adamita": [0.22, 0.06, 0.1, 0.14], // vazio — grave puro

      // Lugares simbólicos
      "casa-espelhada": [0.14, 0.2, 0.1, 0.18], // sombra — denso
      tabernaculo: [0.18, 0.18, 0.12, 0.12], // altares — solene
      feira: [0.1, 0.14, 0.16, 0.18], // cidade — eletrônico
      labirinto: [0.16, 0.16, 0.18, 0.14], // memória — flutuante
      trono: [0.24, 0.2, 0.18, 0.12], // clímax — pesado
      bardo: [0.18, 0.14, 0.18, 0.14], // limiar — neutro

      // Expansão (Sprint 60-67)
      agartha: [0.22, 0.12, 0.14, 0.12], // intra-terreno — grave + cavernoso
      sodoma: [0.24, 0.18, 0.14, 0.1], // julgamento suspenso — pesado solene
      shamballa: [0.08, 0.1, 0.16, 0.22], // fragmento pleromático — agudo etéreo
      telos: [0.16, 0.18, 0.14, 0.14], // refúgio lemuriano — caloroso médio
      gomorra: [0.22, 0.16, 0.14, 0.1], // posse — denso terroso
      babel: [0.18, 0.14, 0.18, 0.14], // palavra fragmentada — neutro
      pleiadianos: [0.1, 0.14, 0.18, 0.22], // sete estrelas — cintilante etéreo
      arcturianos: [0.14, 0.14, 0.2, 0.18], // bardo claro — neutro luminoso
      erks: [0.2, 0.14, 0.16, 0.16], // intra-terreno andino — terroso médio
      siriacos: [0.16, 0.1, 0.12, 0.22], // memória cósmica — cobalto agudo
      adama: [0.18, 0.16, 0.14, 0.12], // cidade-nuvem — leve descendente
      tzeboim: [0.14, 0.18, 0.16, 0.14], // espelhos sociais — meio-frio
      bela: [0.14, 0.18, 0.2, 0.12], // tarde dourada — caloroso
      ninive: [0.18, 0.16, 0.18, 0.12], // gratidão entardecer — neutro caloroso
      andromedanos: [0.1, 0.12, 0.16, 0.24], // biblioteca cósmica — cintilante alto
      cinzas: [0.16, 0.12, 0.16, 0.08], // sala metálica — frio neutro
      reptilianos: [0.22, 0.16, 0.12, 0.1], // câmara conspirativa — denso baixo
      troia: [0.2, 0.16, 0.14, 0.12], // poeira de batalha — terroso médio
      cartago: [0.22, 0.18, 0.14, 0.1], // resistência cega — pesado baixo
      catalhoyuk: [0.16, 0.18, 0.16, 0.12], // vila-mãe — caloroso neutro
      pompeia: [0.18, 0.14, 0.14, 0.12], // cinzas suspensas — neutro empoeirado
      yonaguni: [0.18, 0.12, 0.14, 0.16], // submarino — médio com aguda
      "atlantis-arquetipica": [0.1, 0.14, 0.2, 0.22], // ideal pleromático — luminoso alto
    };
    const vols = targetVols[mood];
    this.droneNodes.forEach(({ gain }, i) => {
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.linearRampToValueAtTime(vols[i] ?? 0.1, t + 3);
    });
  }

  dispose() {
    if (this.breathInterval !== null) clearInterval(this.breathInterval);
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    }
    setTimeout(() => {
      this.ctx?.close();
      this.ctx = null;
    }, 1200);
  }
}

export const sophiaAudio = new SophiaAudio();

export type AudioMood = Mood;

/** Mapeia um SceneId do characterStore ao mood de áudio correspondente.
 *  Cada orquestrador chama sophiaAudio.setMood(moodForScene(sceneId)). */
export function moodForScene(scene: string): Mood {
  switch (scene) {
    case "jardim-dos-ecos":
      return "garden";
    case "mar-de-cristal":
      return "mar-de-cristal";
    case "ratanaba":
      return "ratanaba";
    case "el-dorado":
      return "el-dorado";
    case "hiperborea":
      return "hiperborea";
    case "atlantida":
      return "atlantida";
    case "lemuria":
      return "lemuria";
    case "mu":
      return "mu";
    case "pre-adamita":
      return "pre-adamita";
    case "casa-espelhada":
      return "casa-espelhada";
    case "tabernaculo-dos-caidos":
      return "tabernaculo";
    case "feira-dos-sistemas":
      return "feira";
    case "labirinto-das-eras":
      return "labirinto";
    case "galeria-dos-principados":
      // Compartilha o mood denso da Casa-Espelhada (Principados são leis sombrias)
      return "casa-espelhada";
    case "agartha":
      return "agartha";
    case "sodoma":
      return "sodoma";
    case "shamballa":
      return "shamballa";
    case "telos":
      return "telos";
    case "gomorra":
      return "gomorra";
    case "babel":
      return "babel";
    case "pleiadianos":
      return "pleiadianos";
    case "arcturianos":
      return "arcturianos";
    case "erks":
      return "erks";
    case "siriacos":
      return "siriacos";
    case "adama":
      return "adama";
    case "tzeboim":
      return "tzeboim";
    case "bela":
      return "bela";
    case "ninive":
      return "ninive";
    case "andromedanos":
      return "andromedanos";
    case "cinzas":
      return "cinzas";
    case "reptilianos":
      return "reptilianos";
    case "troia":
      return "troia";
    case "cartago":
      return "cartago";
    case "catalhoyuk":
      return "catalhoyuk";
    case "pompeia":
      return "pompeia";
    case "yonaguni":
      return "yonaguni";
    case "atlantis-arquetipica":
      return "atlantis-arquetipica";
    case "trono-demiurgo":
      return "trono";
    case "bardo":
      return "bardo";
    default:
      return "garden";
  }
}
