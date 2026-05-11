import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { AutoSabotador } from "../world/AutoSabotador";
import { Portal } from "../world/Portal";

/* =========================================================
   CasaEspelhadaScene — sexta torre da Feira dos Sistemas
   ---------------------------------------------------------
   Câmara hexagonal. Seis espelhos enormes nas paredes.
   No centro, o Auto-Sabotador (sombra do jogador).
   Luz violácea e baixa. Apenas reflexos.

   Mecânica: silêncio + abraço de 5 segundos.
   Vitória: a sombra se entrega, Sussurrante toma forma humanoide.
   Ver docs/03f-mapa-do-reino-humano.md §Luta 1
   ========================================================= */

const SABOTADOR_POS: [number, number, number] = [0, 0, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 9];

interface CasaEspelhadaSceneProps {
  /** Posição da sombra (espelhada com a do jogador). */
  defeated: boolean;
  hugProgress: number;
  onReturnToMar?: () => void;
  /** Recebe a referência do player para olhar/abraçar. */
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function CasaEspelhadaScene({
  defeated,
  hugProgress,
  onReturnToMar,
  onPlayerRef,
}: CasaEspelhadaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

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
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 4, 12] }}
    >
      <color attach="background" args={["#1a0f1c"]} />
      <fog attach="fog" args={["#1a0f1c", 10, 35]} />

      <ambientLight color="#604a78" intensity={0.4} />

      {/* Luz violácea suspensa do teto */}
      <pointLight
        position={[0, 8, 0]}
        intensity={1.0}
        distance={20}
        color="#a878d8"
        decay={2}
      />
      {/* Luz dourada baixa que cresce com o progresso do abraço */}
      <pointLight
        position={[0, 1.2, 0]}
        intensity={0.4 + hugProgress * 1.6}
        distance={10}
        color="#ffd45a"
        decay={2}
      />

      <MirroredFloor />
      <HexagonalWalls />
      <MirrorPanels hugProgress={hugProgress} />

      <AutoSabotador
        position={SABOTADOR_POS}
        defeated={defeated}
        hugProgress={hugProgress}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={defeated ? "(voltar)" : "(o espelho ainda olha)"}
          color="#c5d7e0"
          playerRef={playerRef}
          enabled={defeated}
          onProximityChange={(near) => {
            if (!near || !defeated) return;
            const handler = (e: KeyboardEvent) => {
              if (
                e.code === "Space" ||
                e.code === "Enter" ||
                e.code === "KeyF"
              ) {
                window.removeEventListener("keydown", handler);
                onReturnToMar();
              }
            };
            window.addEventListener("keydown", handler);
          }}
        />
      )}

      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.4} mipmapBlur />
        <Vignette eskil={false} darkness={0.7} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function MirroredFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[14, 64]} />
      <meshStandardMaterial
        color="#241828"
        emissive="#3a2848"
        emissiveIntensity={0.15}
        roughness={0.05}
        metalness={0.95}
      />
    </mesh>
  );
}

/** Paredes hexagonais altas — apenas silhuetas escuras */
function HexagonalWalls() {
  const positions = useMemo(() => {
    const r = 10;
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rotY: -a + Math.PI / 2,
      };
    });
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 4, p.z]}
          rotation={[0, p.rotY, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[10, 8, 0.4]} />
          <meshStandardMaterial
            color="#150820"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Painéis de espelho montados nas paredes — pulsam conforme o abraço */
function MirrorPanels({ hugProgress }: { hugProgress: number }) {
  const refs = useRef<THREE.Mesh[]>([]);

  const positions = useMemo(() => {
    const r = 9.7;
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rotY: -a + Math.PI / 2,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      const phase = i * 0.6;
      const base = 0.1 + hugProgress * 0.6;
      mat.emissiveIntensity = base + Math.sin(t * 0.8 + phase) * 0.1;
    });
  });

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={[p.x, 3.5, p.z]}
          rotation={[0, p.rotY, 0]}
        >
          <planeGeometry args={[3.5, 5.5]} />
          <meshStandardMaterial
            color="#5a3a78"
            emissive="#a878d8"
            emissiveIntensity={0.15}
            roughness={0.05}
            metalness={1.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
