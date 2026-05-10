import { useGameStore } from "../state/gameStore";
import { sophiaAudio } from "../audio/SophiaAudio";

/* =========================================================
   IntroOverlay — tela de abertura
   ---------------------------------------------------------
   O clique aqui é fundamental: ele permite ativar o áudio
   (política do navegador exige gesto do usuário).
   ========================================================= */

export function IntroOverlay() {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const enableAudio = useGameStore((s) => s.enableAudio);

  if (phase !== "intro") return null;

  const begin = () => {
    sophiaAudio.init();
    sophiaAudio.startDrone();
    enableAudio();
    setPhase("awaken");
  };

  return (
    <div className="intro" onClick={begin}>
      <h1>SOPHIA</h1>
      <h2>A JORNADA DO DESPERTAR</h2>
      <blockquote>
        Você acorda num campo crepuscular onde todos os outros dormem.
        Uma luzinha quente flutua até você e diz, com a voz de uma
        mulher cansada: <em>“Você acordou. Eu esperei tanto por isso.”</em>
        <cite>— Capítulo 1</cite>
      </blockquote>
      <div className="pulse">Clique para acordar</div>
    </div>
  );
}
