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
import { CandelabroDeSodoma } from "../world/CandelabroDeSodoma";

/* =========================================================
   SodomaScene — A Cidade do Julgamento Suspenso
   ---------------------------------------------------------
   Ruínas barrocas em chamas que NÃO consomem, suspensas no
   ar. Anjos-fiscais dourados flutuando, segurando balanças
   invisíveis. Ao centro: a Praça e o Candelabro de Sodoma.

   Princípio: a Mônada NÃO destrói — ESPERA. O jogador, como
   Abraão (Gn 18:23-32), intercede pelo arquétipo: a cidade
   que esqueceu hospitalidade.

   Mecânica: aproximar < 3m do candelabro + segurar F por 6s.
   A cada segundo uma chama do candelabro se acende.
   Ao completar: Sodoma é redimida.

   Sem julgamento ético sobre o que Sodoma "fez". Tratamento
   arquetípico, contemplativo, sem violência gráfica.
   ========================================================= */

const CANDELABRO_POS: [number, number, number] = [0, 0, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface SodomaSceneProps {
  interceded: boolean;
  interceedingProgress: number; // 0..1
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function SodomaScene({
  interceded,
  interceedingProgress,
  onReturnToMar,
  onPlayerRef,
}: SodomaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  // Quantas das 7 chamas acesas, baseado no progresso
  const litCount = Math.min(7, Math.floor(interceedingProgress * 7 + 0.0001));
  const allLit = interceded || litCount >= 7;

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
      camera={{ fov: 60, near: 0.1, far: 300, position: [0, 4, 12] }}
    >
      {/* Skybox vermelho-fumegante; se redimida, abre um pouco para âmbar */}
      <color
        attach="background"
        args={[allLit ? "#2a1810" : "#2a0a0a"]}
      />
      <fog
        attach="fog"
        args={[allLit ? "#3a1c10" : "#2a0a0a", 14, 60]}
      />

      <ambientLight color="#5a1a14" intensity={0.45} />

      {/* Luz dourada que cresce com a intercessão — esperança vinda do centro */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.4 + interceedingProgress * 2.0}
        distance={22}
        color="#ffd070"
        decay={2}
      />

      {/* Brasa avermelhada alta — o "fogo de julgamento" ainda paira */}
      <pointLight
        position={[0, 14, 0]}
        intensity={allLit ? 0.4 : 1.4}
        distance={40}
        color="#c8401c"
        decay={2}
      />

      <SuspendedPlatform />
      <BarocaRuins interceedingProgress={interceedingProgress} allLit={allLit} />
      <AnjosFiscais allLit={allLit} />
      <CinderFloor />

      <CandelabroDeSodoma
        position={CANDELABRO_POS}
        litCount={allLit ? 7 : litCount}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={allLit ? "(Sodoma respira)" : "(voltar)"}
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
        <Bloom intensity={0.85} luminanceThreshold={0.35} mipmapBlur />
        <Vignette eskil={false} darkness={0.7} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Plataforma circular central — a "praça" de Sodoma, suspensa no ar */
function SuspendedPlatform() {
  return (
    <group>
      {/* Topo — pedra escura calcinada */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial
          color="#2a160e"
          emissive="#1a0804"
          emissiveIntensity={0.25}
          roughness={0.92}
          metalness={0.1}
        />
      </mesh>
      {/* Cinta de pedra abaixo da praça (laterais da plataforma) */}
      <mesh position={[0, -0.55, 0]} receiveShadow>
        <cylinderGeometry args={[10, 9.4, 1.1, 48]} />
        <meshStandardMaterial
          color="#1a0a06"
          roughness={0.95}
          metalness={0.1}
          emissive="#0c0402"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Anel rachado no chão (gravura concêntrica) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <ringGeometry args={[5.8, 6.0, 64]} />
        <meshBasicMaterial
          color="#6a2818"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Fragmentos de arquitetura barroca quebrada suspensos no ar */
function BarocaRuins({
  interceedingProgress,
  allLit,
}: {
  interceedingProgress: number;
  allLit: boolean;
}) {
  const fragments = useMemo(() => {
    // 7 fragmentos posicionados em anel exterior
    return Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const r = 12 + (i % 3) * 1.6;
      const y = 3 + (i % 4) * 1.2;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        y,
        rotY: a + Math.PI / 6,
        rotZ: (i % 2 === 0 ? 1 : -1) * 0.25,
        scale: 0.9 + (i % 3) * 0.35,
        kind: i % 3, // 0=bloco, 1=coluna torcida, 2=fragmento maciço
      };
    });
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Rotação lenta + flutuação suspensa
    groupRef.current.children.forEach((child, i) => {
      const phase = i * 0.7;
      child.rotation.y += 0.0015 + (i % 2) * 0.0008;
      child.position.y += Math.sin(t * 0.4 + phase) * 0.002;
    });
  });

  // Cor dos fragmentos: vermelho-quente sutil quando há fogo; quando redimida, mais cinza neutro
  const fragColor = allLit ? "#4a3024" : "#3a1c10";
  const fragEmissive = allLit ? "#1a0a06" : "#4a1408";
  const emIntensity = allLit ? 0.18 : 0.4 + interceedingProgress * 0.2;

  return (
    <group ref={groupRef}>
      {fragments.map((f, i) => (
        <group
          key={i}
          position={[f.x, f.y, f.z]}
          rotation={[0, f.rotY, f.rotZ]}
          scale={f.scale}
        >
          {f.kind === 0 && (
            <mesh castShadow>
              <boxGeometry args={[2.5, 1.4, 1.8]} />
              <meshStandardMaterial
                color={fragColor}
                emissive={fragEmissive}
                emissiveIntensity={emIntensity}
                roughness={0.95}
                metalness={0.08}
              />
            </mesh>
          )}
          {f.kind === 1 && (
            <ColunaTorcida
              color={fragColor}
              emissive={fragEmissive}
              intensity={emIntensity}
            />
          )}
          {f.kind === 2 && (
            <>
              <mesh castShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.8, 2.2, 1.4]} />
                <meshStandardMaterial
                  color={fragColor}
                  emissive={fragEmissive}
                  emissiveIntensity={emIntensity}
                  roughness={0.92}
                  metalness={0.1}
                />
              </mesh>
              <mesh castShadow position={[0.8, 1.2, 0.2]} rotation={[0, 0, 0.4]}>
                <boxGeometry args={[0.6, 1.2, 0.6]} />
                <meshStandardMaterial
                  color={fragColor}
                  emissive={fragEmissive}
                  emissiveIntensity={emIntensity}
                  roughness={0.92}
                  metalness={0.1}
                />
              </mesh>
            </>
          )}

          {/* Chamas estilizadas em volta do fragmento — não consomem */}
          {!allLit && <FragmentFlames seed={i} />}
        </group>
      ))}
    </group>
  );
}

/** Coluna torcida — espiral de cilindros empilhados */
function ColunaTorcida({
  color,
  emissive,
  intensity,
}: {
  color: string;
  emissive: string;
  intensity: number;
}) {
  const segments = 6;
  return (
    <group>
      {Array.from({ length: segments }, (_, i) => {
        const y = i * 0.5 - segments * 0.25;
        const rot = i * 0.35;
        return (
          <mesh
            key={i}
            position={[0, y, 0]}
            rotation={[0, rot, 0.06 * (i % 2 === 0 ? 1 : -1)]}
            castShadow
          >
            <cylinderGeometry args={[0.4, 0.4, 0.55, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={intensity}
              roughness={0.88}
              metalness={0.12}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Chamas estilizadas pequenas em torno de um fragmento (não consomem). */
function FragmentFlames({ seed }: { seed: number }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const flames = useMemo(() => {
    const rng = (n: number) => {
      const x = Math.sin((seed + 1) * 99.31 + n * 17.13) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 4 }, (_, i) => ({
      x: (rng(i) - 0.5) * 2.0,
      y: (rng(i + 10) - 0.5) * 1.4,
      z: (rng(i + 20) - 0.5) * 1.2,
      phase: rng(i + 30) * Math.PI * 2,
    }));
  }, [seed]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const f = flames[i];
      const s = 1 + Math.sin(t * 3 + f.phase) * 0.18;
      m.scale.set(s, s * 1.4, s);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 4 + f.phase) * 0.15;
    });
  });

  return (
    <group>
      {flames.map((f, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={[f.x, f.y, f.z]}
        >
          <coneGeometry args={[0.14, 0.4, 6]} />
          <meshBasicMaterial
            color="#ff6028"
            transparent
            opacity={0.6}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Anjos-fiscais — figuras douradas estáticas flutuando alto */
function AnjosFiscais({ allLit }: { allLit: boolean }) {
  const positions = useMemo(
    () => [
      { x: -10, y: 11, z: -6, rotY: 0.3 },
      { x: 12, y: 12, z: -4, rotY: -0.4 },
      { x: -8, y: 10, z: 10, rotY: 1.1 },
      { x: 9, y: 11.5, z: 9, rotY: -1.0 },
      { x: 0, y: 13.5, z: -12, rotY: 0 },
      { x: 0, y: 13, z: 13, rotY: Math.PI },
    ],
    [],
  );

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      // Flutuação muito leve — anjos quase imóveis (estáticos no julgamento)
      const phase = i * 1.1;
      const base = positions[i];
      if (base) {
        child.position.y = base.y + Math.sin(t * 0.25 + phase) * 0.08;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <group
          key={i}
          position={[p.x, p.y, p.z]}
          rotation={[0, p.rotY, 0]}
        >
          <AnjoFiscal allLit={allLit} />
        </group>
      ))}
    </group>
  );
}

function AnjoFiscal({ allLit }: { allLit: boolean }) {
  // Figura humanoide simples + halo + "balança invisível"
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!haloRef.current) return;
    const t = state.clock.elapsedTime;
    haloRef.current.rotation.y = t * 0.15;
    const mat = haloRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.6 + Math.sin(t * 0.8) * 0.1;
  });

  // Cor: dourado solene; quando redimida, dourado mais quente (suspiraram)
  const goldColor = allLit ? "#ffdc80" : "#d8a838";
  const goldEmissive = allLit ? "#a06820" : "#603810";

  return (
    <group>
      {/* Corpo — manto longo (cone invertido) */}
      <mesh>
        <coneGeometry args={[0.6, 2.2, 10]} />
        <meshStandardMaterial
          color={goldColor}
          emissive={goldEmissive}
          emissiveIntensity={0.55}
          metalness={0.85}
          roughness={0.4}
        />
      </mesh>
      {/* Cabeça */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshStandardMaterial
          color={goldColor}
          emissive={goldEmissive}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.35}
        />
      </mesh>
      {/* Halo */}
      <mesh
        ref={haloRef}
        position={[0, 1.65, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.4, 0.04, 8, 32]} />
        <meshBasicMaterial
          color="#ffe080"
          transparent
          opacity={0.7}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Braço-balança esquerdo */}
      <mesh position={[-0.5, 0.6, 0]} rotation={[0, 0, -Math.PI / 2.2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
        <meshStandardMaterial
          color={goldColor}
          emissive={goldEmissive}
          emissiveIntensity={0.45}
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>
      {/* Braço-balança direito */}
      <mesh position={[0.5, 0.6, 0]} rotation={[0, 0, Math.PI / 2.2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
        <meshStandardMaterial
          color={goldColor}
          emissive={goldEmissive}
          emissiveIntensity={0.45}
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>
      {/* Pontas da balança (pratos invisíveis sugeridos por pequenos discos) */}
      <mesh position={[-0.85, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 16]} />
        <meshBasicMaterial
          color="#ffe080"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.85, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 16]} />
        <meshBasicMaterial
          color="#ffe080"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Cinzas no chão da praça — sugestão de fumaça baixa */
function CinderFloor() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.18 + Math.sin(t * 0.5) * 0.04;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.05, 0]}
    >
      <circleGeometry args={[9.5, 48]} />
      <meshBasicMaterial
        color="#5a2008"
        transparent
        opacity={0.2}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
