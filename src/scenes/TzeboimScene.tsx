import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { Portal } from "../world/Portal";
import { EspelhoTzeboim } from "../world/EspelhoTzeboim";

/* =========================================================
   TzeboimScene — A Cidade-Espelho Social
   ---------------------------------------------------------
   Gn 14:2. Companheira de Sodoma. Pecado arquetípico: todos
   imitam todos. Ninguém sabe quem é.

   Diferente da Casa-Espelhada (individual, Auto-Sabotador),
   Tzeboim é COLETIVA — cidade inteira de espelhos. Cada um
   reflete o vizinho, não a si mesma.

   Geografia: ruas longas em forma de "X" cruzando-se no
   centro. 10 espelhos altos dispostos nos braços (5 por
   diagonal). Paredes laterais com superfícies mais largas
   refletivas (sugeridas).

   Mecânica: o jogador anda pelas ruas. < 1.5m de cada
   espelho → ele quebra suavemente (orquestrador faz isso
   via prop `broken[i]`). 10 quebrados = redimida; paleta
   vira âmbar.

   Sem horror. Shards rotativos lentos. Contemplativo.
   ========================================================= */

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

/** Posições e rotações dos 10 espelhos — exportada p/ orquestrador. */
export const MIRROR_POSITIONS: {
  pos: [number, number, number];
  rotY: number;
}[] = (() => {
  // X = duas diagonais cruzando no centro
  // Diagonal 1: NW (-x,-z) → SE (+x,+z)  · rotY = -PI/4
  // Diagonal 2: NE (+x,-z) → SW (-x,+z)  · rotY = +PI/4
  // 5 espelhos em cada braço, distribuídos a r = 3, 6, 9, 12, 15
  // Os espelhos olham PERPENDICULAR à rua (para quem anda VÊ neles).
  const out: { pos: [number, number, number]; rotY: number }[] = [];
  const distances = [-12, -7, -3, 3, 8];

  // Diagonal NW-SE: vetor (cos -PI/4, sin -PI/4) = (0.707, -0.707)
  // — rotação da posição
  // Espelho perpendicular: rotY = -PI/4 + PI/2 = PI/4 (face vira para o braço)
  for (let i = 0; i < 5; i++) {
    const d = distances[i];
    // Direção do braço NW→SE
    const dirX = Math.SQRT1_2;
    const dirZ = Math.SQRT1_2;
    // Offset lateral suave alternado (espelhos ladeando a rua)
    const side = i % 2 === 0 ? 1.6 : -1.6;
    const perpX = -dirZ;
    const perpZ = dirX;
    out.push({
      pos: [dirX * d + perpX * side, 0, dirZ * d + perpZ * side],
      rotY: -Math.PI / 4 + Math.PI / 2,
    });
  }

  // Diagonal NE-SW: vetor (cos PI/4, sin PI/4 inverso) = (0.707, 0.707)
  // Mas a outra rua começa em NE, vai para SW.
  for (let i = 0; i < 5; i++) {
    const d = distances[i];
    const dirX = Math.SQRT1_2;
    const dirZ = -Math.SQRT1_2;
    const side = i % 2 === 0 ? 1.6 : -1.6;
    const perpX = -dirZ;
    const perpZ = dirX;
    out.push({
      pos: [dirX * d + perpX * side, 0, dirZ * d + perpZ * side],
      rotY: Math.PI / 4 + Math.PI / 2,
    });
  }
  return out;
})();

interface TzeboimSceneProps {
  /** 10 flags — quais espelhos já foram quebrados. */
  broken: boolean[];
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function TzeboimScene({
  broken,
  onReturnToMar,
  onPlayerRef,
}: TzeboimSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  const brokenCount = broken.filter(Boolean).length;
  const allBroken = brokenCount >= 10;
  const progress = Math.min(1, brokenCount / 10);

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
      camera={{ fov: 60, near: 0.1, far: 300, position: [0, 5, 14] }}
    >
      {/* Skybox cinza-prata frio; quando redimida, abre para âmbar quente */}
      <color
        attach="background"
        args={[allBroken ? "#3a2a18" : "#2a2c30"]}
      />
      {/* Fog espesso cinza — depois âmbar quando redimida */}
      <fog
        attach="fog"
        args={[allBroken ? "#4a3420" : "#3a3a3e", 14, 64]}
      />

      <ambientLight color={allBroken ? "#a48868" : "#a8acb8"} intensity={0.55} />

      {/* Direcional cinza-prata — luz fria de manhã enevoada */}
      <directionalLight
        position={[6, 16, 4]}
        intensity={allBroken ? 0.65 : 0.55}
        color={allBroken ? "#ffd890" : "#c8ccd4"}
      />

      {/* Luz quente central — cresce com a redenção */}
      <pointLight
        position={[0, 3, 0]}
        intensity={0.3 + progress * 1.6}
        distance={18}
        color="#ffb070"
        decay={2}
      />

      <TzeboimFloor allBroken={allBroken} />
      <RuasEmX progress={progress} />
      <WallsLaterais allBroken={allBroken} />
      <FogHaze />

      {/* Os 10 espelhos */}
      {MIRROR_POSITIONS.map((m, i) => (
        <EspelhoTzeboim
          key={i}
          position={m.pos}
          rotY={m.rotY}
          broken={broken[i] ?? false}
        />
      ))}

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={allBroken ? "(Tzeboim respira)" : "(voltar)"}
          color="#c5d7e0"
          playerRef={playerRef}
          onProximityChange={(near) => {
            if (!near) return;
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
        <Bloom intensity={0.7} luminanceThreshold={0.45} mipmapBlur />
        <Vignette eskil={false} darkness={0.7} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Chão de pedra cinza-fosca; ganha verniz âmbar quando redimida. */
function TzeboimFloor({ allBroken }: { allBroken: boolean }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial
          color={allBroken ? "#4a3a26" : "#2c2e34"}
          emissive={allBroken ? "#2a1c0c" : "#0e1014"}
          emissiveIntensity={0.22}
          roughness={0.96}
          metalness={0.1}
        />
      </mesh>
      {/* Cinta inferior */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[20, 19.4, 1.1, 48]} />
        <meshStandardMaterial
          color="#1c1e22"
          roughness={0.96}
          metalness={0.1}
          emissive="#08090c"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

/** Linhas das ruas em X — gravura emissiva sutil. */
function RuasEmX({ progress }: { progress: number }) {
  const lineColor = useMemo(() => {
    const c = new THREE.Color("#5a5e68");
    c.lerp(new THREE.Color("#ffb060"), progress);
    return c;
  }, [progress]);

  const ruaWidth = 3.4;
  const ruaLength = 30;

  return (
    <group>
      {/* Rua diagonal NW-SE */}
      <mesh
        rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
        position={[0, 0.01, 0]}
      >
        <planeGeometry args={[ruaWidth, ruaLength]} />
        <meshStandardMaterial
          color={lineColor}
          emissive={lineColor}
          emissiveIntensity={0.18 + progress * 0.35}
          roughness={0.88}
          metalness={0.18}
          transparent
          opacity={0.55 + progress * 0.25}
        />
      </mesh>
      {/* Rua diagonal NE-SW */}
      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        position={[0, 0.01, 0]}
      >
        <planeGeometry args={[ruaWidth, ruaLength]} />
        <meshStandardMaterial
          color={lineColor}
          emissive={lineColor}
          emissiveIntensity={0.18 + progress * 0.35}
          roughness={0.88}
          metalness={0.18}
          transparent
          opacity={0.55 + progress * 0.25}
        />
      </mesh>
      {/* Pequeno disco central — encruzilhada */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
      >
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial
          color={lineColor}
          transparent
          opacity={0.35 + progress * 0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Paredes laterais nos finais das ruas — silhuetas refletivas de fundo. */
function WallsLaterais({ allBroken }: { allBroken: boolean }) {
  const walls = useMemo(() => {
    // 4 paredes finais — uma em cada extremidade das duas ruas
    const positions: { x: number; z: number; rotY: number }[] = [
      // NW
      {
        x: -Math.SQRT1_2 * 15,
        z: Math.SQRT1_2 * 15,
        rotY: Math.PI / 4 + Math.PI / 2,
      },
      // SE
      {
        x: Math.SQRT1_2 * 15,
        z: -Math.SQRT1_2 * 15,
        rotY: Math.PI / 4 + Math.PI / 2,
      },
      // NE
      {
        x: Math.SQRT1_2 * 15,
        z: Math.SQRT1_2 * 15,
        rotY: -Math.PI / 4 + Math.PI / 2,
      },
      // SW
      {
        x: -Math.SQRT1_2 * 15,
        z: -Math.SQRT1_2 * 15,
        rotY: -Math.PI / 4 + Math.PI / 2,
      },
    ];
    return positions;
  }, []);

  const wallColor = allBroken ? "#5a4836" : "#3a3c44";
  const wallEmissive = allBroken ? "#2a1c0c" : "#10121a";

  return (
    <group>
      {walls.map((w, i) => (
        <group key={i} position={[w.x, 0, w.z]} rotation={[0, w.rotY, 0]}>
          {/* Parede principal */}
          <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[6, 4.4, 0.4]} />
            <meshStandardMaterial
              color={wallColor}
              emissive={wallEmissive}
              emissiveIntensity={0.18}
              roughness={0.88}
              metalness={0.18}
            />
          </mesh>
          {/* Frieze metálica refletiva no topo */}
          <mesh position={[0, 4.55, 0]} castShadow>
            <boxGeometry args={[6.2, 0.3, 0.5]} />
            <meshStandardMaterial
              color={allBroken ? "#a08868" : "#7a7c84"}
              metalness={0.92}
              roughness={0.25}
              emissive="#181820"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Névoa cinza baixa — espessa, urbana, fria. */
function FogHaze() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.16 + Math.sin(t * 0.3) * 0.04;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.08, 0]}
    >
      <circleGeometry args={[19, 48]} />
      <meshBasicMaterial
        color="#8a8e98"
        transparent
        opacity={0.16}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
