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
import {
  EstatuaDePosse,
  type EstatuaVariant,
} from "../world/EstatuaDePosse";

/* =========================================================
   GomorraScene — A Cidade Que Não Soltava
   ---------------------------------------------------------
   Companheira de Sodoma (Gn 14:2, 19:24). Aqui o pecado
   arquetípico é a POSSE: amar virou ter, cuidar virou
   controlar. Sem julgamento moral — tratamento contemplativo.

   Cinco estátuas humanas paralisadas em gestos de "segurar",
   dispostas num pentágono regular ao redor da praça central.
   Cada estátua é um arquétipo: Casal, Mãe-Cobertora, Tirano,
   Escravo, Propriedade.

   Mecânica: aproximar < 3m de cada estátua + pressionar F →
   a estátua relaxa (dedos abrem, aura âmbar nasce). 5
   estátuas relaxadas = cidade redimida.

   Atmosfera: "tempo congelado" — paleta cinza-pedra com
   sépia. Pilares quebrados ao fundo. Fog espesso amarelado.
   Quando todas libertadas, a paleta abre para âmbar.
   ========================================================= */

/** Raio do pentágono onde ficam as 5 estátuas. */
const STATUE_RING_RADIUS = 6.5;

/** Posições do pentágono regular (5 estátuas). */
export const STATUE_POSITIONS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  for (let i = 0; i < 5; i++) {
    // -PI/2 para deixar o topo do pentágono apontado para -Z (frente)
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    out.push([
      Math.cos(a) * STATUE_RING_RADIUS,
      0,
      Math.sin(a) * STATUE_RING_RADIUS,
    ]);
  }
  return out;
})();

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 13];

interface GomorraSceneProps {
  released: [boolean, boolean, boolean, boolean, boolean];
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function GomorraScene({
  released,
  onReturnToMar,
  onPlayerRef,
}: GomorraSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  const allReleased = released.every(Boolean);
  const releasedCount = released.filter(Boolean).length;
  const progress = releasedCount / 5;

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
      camera={{ fov: 60, near: 0.1, far: 300, position: [0, 5, 13] }}
    >
      {/* Skybox cinza-sépia; abre para âmbar quando libertada */}
      <color
        attach="background"
        args={[allReleased ? "#3a2818" : "#2a2418"]}
      />
      {/* Fog espesso amarelado — tempo congelado */}
      <fog
        attach="fog"
        args={[allReleased ? "#4a3420" : "#3a3020", 14, 60]}
      />

      <ambientLight color="#5a4830" intensity={0.55} />

      {/* Luz "tempo congelado" — alta, cinza-âmbar fria */}
      <pointLight
        position={[0, 14, 0]}
        intensity={allReleased ? 1.6 : 1.2}
        distance={40}
        color={allReleased ? "#ffd890" : "#a89060"}
        decay={2}
      />

      {/* Calor central — cresce conforme estátuas relaxam */}
      <pointLight
        position={[0, 2, 0]}
        intensity={0.4 + progress * 1.8}
        distance={18}
        color="#ffb070"
        decay={2}
      />

      {/* Direcional sépia para sombras suaves */}
      <directionalLight
        position={[6, 16, 4]}
        intensity={0.35}
        color="#d8b878"
      />

      <GomorraFloor allReleased={allReleased} />
      <PentagonInlay progress={progress} />
      <BrokenPillars allReleased={allReleased} />
      <DustHaze />

      {/* As 5 estátuas — uma por vértice do pentágono */}
      {STATUE_POSITIONS.map((pos, i) => {
        // Cada estátua olha "para fora" do centro do pentágono
        const rotY = Math.atan2(pos[0], pos[2]) + Math.PI;
        return (
          <EstatuaDePosse
            key={i}
            position={pos}
            rotY={rotY}
            released={released[i] ?? false}
            variant={i as EstatuaVariant}
          />
        );
      })}

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={allReleased ? "(Gomorra respira)" : "(voltar)"}
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
        <Bloom intensity={0.78} luminanceThreshold={0.4} mipmapBlur />
        <Vignette eskil={false} darkness={0.72} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Plataforma circular ampla de pedra cinza-sépia. */
function GomorraFloor({ allReleased }: { allReleased: boolean }) {
  return (
    <group>
      {/* Disco superior */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial
          color={allReleased ? "#4a3a26" : "#2e261c"}
          emissive={allReleased ? "#3a2812" : "#181208"}
          emissiveIntensity={0.22}
          roughness={0.94}
          metalness={0.08}
        />
      </mesh>
      {/* Cinta lateral abaixo (sugestão de plataforma suspensa) */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[16, 15.4, 1.15, 48]} />
        <meshStandardMaterial
          color="#1f1810"
          roughness={0.96}
          metalness={0.08}
          emissive="#0a0604"
          emissiveIntensity={0.18}
        />
      </mesh>
    </group>
  );
}

/** Desenho do pentágono no chão — linha emissiva sutil */
function PentagonInlay({ progress }: { progress: number }) {
  const points = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      out.push(
        new THREE.Vector3(
          Math.cos(a) * STATUE_RING_RADIUS,
          0.04,
          Math.sin(a) * STATUE_RING_RADIUS,
        ),
      );
    }
    return out;
  }, []);

  const lineRef = useRef<THREE.BufferGeometry>(null);
  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.setFromPoints(points);
    }
  }, [points]);

  // Cor do pentágono: cresce de sépia a âmbar conforme libertação
  const lineColor = useMemo(() => {
    const c = new THREE.Color("#6a4a2a");
    c.lerp(new THREE.Color("#ffb060"), progress);
    return c;
  }, [progress]);

  return (
    <group>
      <line>
        <bufferGeometry ref={lineRef} />
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={0.55 + progress * 0.35}
          toneMapped={false}
        />
      </line>
      {/* Pequeno disco no centro da praça */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
      >
        <ringGeometry args={[1.6, 1.85, 48]} />
        <meshBasicMaterial
          color={lineColor}
          transparent
          opacity={0.4 + progress * 0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Pilares quebrados ao fundo — silhuetas da cidade que parou. */
function BrokenPillars({ allReleased }: { allReleased: boolean }) {
  const pillars = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.15;
      const r = 18 + (i % 4) * 1.6;
      const h = 3.5 + (i % 5) * 1.3;
      const broken = i % 3 === 0 ? 0.65 : 1.0; // alguns quebrados no topo
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rotY: a + Math.PI / 7,
        rotZ: (i % 2 === 0 ? 1 : -1) * 0.06,
        h: h * broken,
        kind: i % 3,
      };
    });
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Movimento quase imóvel — Gomorra é "tempo congelado"
    groupRef.current.children.forEach((child, i) => {
      child.position.y += Math.sin(t * 0.12 + i * 0.5) * 0.0008;
    });
  });

  const stoneColor = allReleased ? "#5a4a36" : "#3a2e22";
  const stoneEmissive = allReleased ? "#2a1c0c" : "#180e08";

  return (
    <group ref={groupRef}>
      {pillars.map((p, i) => (
        <group
          key={i}
          position={[p.x, p.h / 2, p.z]}
          rotation={[0, p.rotY, p.rotZ]}
        >
          {p.kind === 0 && (
            <mesh castShadow>
              <cylinderGeometry args={[0.45, 0.55, p.h, 10]} />
              <meshStandardMaterial
                color={stoneColor}
                emissive={stoneEmissive}
                emissiveIntensity={0.18}
                roughness={0.93}
                metalness={0.08}
              />
            </mesh>
          )}
          {p.kind === 1 && (
            <>
              <mesh castShadow>
                <boxGeometry args={[0.8, p.h, 0.8]} />
                <meshStandardMaterial
                  color={stoneColor}
                  emissive={stoneEmissive}
                  emissiveIntensity={0.16}
                  roughness={0.92}
                  metalness={0.08}
                />
              </mesh>
              {/* Capitel */}
              <mesh position={[0, p.h / 2 + 0.18, 0]} castShadow>
                <boxGeometry args={[1.0, 0.18, 1.0]} />
                <meshStandardMaterial
                  color={stoneColor}
                  emissive={stoneEmissive}
                  emissiveIntensity={0.2}
                  roughness={0.85}
                  metalness={0.1}
                />
              </mesh>
            </>
          )}
          {p.kind === 2 && (
            <>
              <mesh castShadow>
                <cylinderGeometry args={[0.4, 0.5, p.h, 10]} />
                <meshStandardMaterial
                  color={stoneColor}
                  emissive={stoneEmissive}
                  emissiveIntensity={0.18}
                  roughness={0.92}
                  metalness={0.08}
                />
              </mesh>
              {/* Fragmento quebrado caído ao lado */}
              <mesh
                position={[0.7, -p.h / 2 + 0.25, 0]}
                rotation={[0, 0.4, 0.8]}
                castShadow
              >
                <cylinderGeometry args={[0.36, 0.4, 0.7, 10]} />
                <meshStandardMaterial
                  color={stoneColor}
                  emissive={stoneEmissive}
                  emissiveIntensity={0.15}
                  roughness={0.95}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

/** Névoa baixa sépia — sugestão de "ar parado". */
function DustHaze() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.12 + Math.sin(t * 0.3) * 0.03;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.06, 0]}
    >
      <circleGeometry args={[15.5, 48]} />
      <meshBasicMaterial
        color="#8a7048"
        transparent
        opacity={0.12}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
