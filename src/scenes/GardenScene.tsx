import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { PleromaSky, Stars } from "../world/PleromaSky";
import {
  Ground,
  CrystalGrass,
  MemoryFireflies,
  AncientTree,
} from "../world/Garden";
import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { Sleeper } from "../world/Sleeper";
import { Portal } from "../world/Portal";

/* =========================================================
   GardenScene — orquestra a cena 3D do Jardim dos Ecos
   ========================================================= */

interface GardenSceneProps {
  /** Posição do Velho do Jardim (alvo do jogador). */
  elderPos: THREE.Vector3;
  onApproachElder?: (near: boolean) => void;
  /** Mostra o Portal de Espelho (saída para Mar de Cristal). */
  showExitPortal?: boolean;
  /** Chamado quando o jogador entra no portal de saída. */
  onExitToMar?: () => void;
}

export function GardenScene({
  elderPos,
  onApproachElder,
  showExitPortal = false,
  onExitToMar,
}: GardenSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  const [nearPortal, setNearPortal] = useState(false);

  // Espaço/Enter/F para entrar no portal de saída quando perto
  useEffect(() => {
    if (!showExitPortal || !nearPortal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter" || e.code === "KeyF") {
        onExitToMar?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showExitPortal, nearPortal, onExitToMar]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 3, 14] }}
    >
      {/* Cor de fundo / fog (combina com o sky) */}
      <color attach="background" args={["#0a0420"]} />
      <fog attach="fog" args={["#1a0a30", 18, 80]} />

      {/* Iluminação ambiente */}
      <ambientLight color="#5d4a8a" intensity={0.45} />

      {/* Luz "lua" — direção fria de cima */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.6}
        color="#a8b8e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Skybox + estrelas */}
      <PleromaSky />
      <Stars count={500} />

      {/* Mundo */}
      <Ground />
      <CrystalGrass count={1400} radius={45} />
      <MemoryFireflies count={70} radius={28} />
      <AncientTree position={[elderPos.x, 0, elderPos.z - 1.5]} />

      {/* Adormecido */}
      <Sleeper
        id="velho-do-jardim"
        name="Velho do Jardim"
        position={[elderPos.x, 0, elderPos.z]}
      />

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={elderPos}
        awakenDistance={3.2}
        onApproachChange={onApproachElder}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de Espelho — saída para Mar de Cristal (após despertar Velho) */}
      {showExitPortal && (
        <Portal
          position={[-10, 0.4, -10]}
          label="Portal de Espelho"
          subLabel="Mar de Cristal · pressione Espaço"
          color="#c5d7e0"
          playerRef={playerRef}
          onProximityChange={setNearPortal}
        />
      )}

      {/* Pós-processamento */}
      <EffectComposer>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.3} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}

