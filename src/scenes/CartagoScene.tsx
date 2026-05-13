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
import { DidoDaMemoria } from "../world/DidoDaMemoria";

/* =========================================================
   CartagoScene — A Cidade Da Resistência Cega (suspensa)
   ---------------------------------------------------------
   Praça circular de pedra clara fissurada, chamas estilizadas
   suspensas (esferas/cones emissivos vermelho-âmbar pulsando,
   SEM efeito de combustão real), habitantes congelados em
   posturas defensivas. Mar visível à distância. Edifícios
   fragmentados ao fundo. Pilar quebrado central onde Dido se
   apoia. Skybox vermelho-cinza-final-de-incêndio.

   Família 10-99: as chamas são ESTILIZADAS (esferas pulsando),
   soldados são silhuetas, sem sangue/feridas.

   Sem mecânica de combate. Encontro opcional com Dido-da-Memória.
   Aproximação + F → cinemática "dido-de-cartago".

   Geografia:
     - Praça circular de pedra clara fissurada
     - Pilar quebrado central (Dido apoia-se)
     - 11 silhuetas-soldados em postura defensiva
     - 12 chamas estilizadas suspensas
     - 5 edifícios fragmentados ao fundo
     - Mar à distância (plano azul-fumegante)
     - Skybox vermelho-cinza

   Ver docs/22-civilizacoes-expandidas.md §4.9 (Cartago).
   ========================================================= */

const DIDO_POS: [number, number, number] = [0, 0, 0.4];
const PILLAR_POS: [number, number, number] = [0.7, 0, 0.4];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface CartagoSceneProps {
  didoMet: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function CartagoScene({
  didoMet,
  onReturnToMar,
  onPlayerRef,
}: CartagoSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

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
      camera={{ fov: 60, near: 0.1, far: 340, position: [0, 4, 13] }}
    >
      {/* Skybox vermelho-cinza-final-de-incêndio */}
      <color attach="background" args={["#6a3030"]} />
      <fog attach="fog" args={["#7a3838", 18, 100]} />

      <ambientLight color="#c87858" intensity={0.6} />

      {/* Luz lateral fraca — sol velado por fumaça */}
      <directionalLight
        position={[-12, 7, 6]}
        intensity={0.85}
        color="#d88858"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Halo geral das chamas suspensas (vermelho-âmbar) */}
      <pointLight
        position={[0, 4, 0]}
        intensity={1.3}
        distance={22}
        color="#e88848"
        decay={2}
      />

      {/* Luz sobre Dido */}
      <pointLight
        position={[DIDO_POS[0], 3.0, DIDO_POS[2]]}
        intensity={didoMet ? 0.75 : 1.05}
        distance={7}
        color="#dc8888"
        decay={2}
      />

      <CrackedStone />
      <BrokenPillar position={PILLAR_POS} />
      <SuspendedFlames />
      <FrozenDefenders />
      <FragmentedBuildings />
      <DistantSea />
      <AshEmber />

      <DidoDaMemoria
        position={DIDO_POS}
        metByPlayer={didoMet}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={didoMet ? "(Cartago pode soltar)" : "(voltar)"}
          color="#e88858"
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
        <Bloom intensity={0.9} luminanceThreshold={0.5} mipmapBlur />
        <Vignette eskil={false} darkness={0.55} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Praça circular de pedra clara fissurada (textura sugerida por
 *  ringGeometry decorativos sobrepostos). */
function CrackedStone() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[36, 64]} />
        <meshStandardMaterial
          color="#c8a890"
          emissive="#6a4438"
          emissiveIntensity={0.16}
          roughness={0.94}
          metalness={0.04}
        />
      </mesh>
      {/* Praça central de pedra clara (mais escura, queimada de leve) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, 0.0, 0]}
      >
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial
          color="#a48070"
          emissive="#4a2818"
          emissiveIntensity={0.2}
          roughness={0.92}
          metalness={0.06}
        />
      </mesh>
      {/* Fissuras concêntricas decorativas */}
      {[3.2, 5.6, 7.0].map((r, i) => (
        <mesh
          key={`crack-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.005 + i * 0.001, 0]}
        >
          <ringGeometry args={[r, r + 0.06, 64]} />
          <meshBasicMaterial
            color="#3a1a14"
            transparent
            opacity={0.4 + i * 0.06}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Pilar quebrado central — base larga + coluna cortada. */
function BrokenPillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base quadrada */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.4, 0.85]} />
        <meshStandardMaterial
          color="#c8a888"
          emissive="#6a4838"
          emissiveIntensity={0.16}
          roughness={0.88}
          metalness={0.08}
        />
      </mesh>
      {/* Tambor de coluna inferior */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.9, 14]} />
        <meshStandardMaterial
          color="#e0c8a8"
          emissive="#8a6850"
          emissiveIntensity={0.18}
          roughness={0.82}
          metalness={0.1}
        />
      </mesh>
      {/* Tambor superior cortado em ângulo (cilindro com leve inclinação) */}
      <mesh
        position={[0.05, 1.55, 0.02]}
        rotation={[0.12, 0, -0.08]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.32, 0.65, 14]} />
        <meshStandardMaterial
          color="#dcc4a0"
          emissive="#8a6850"
          emissiveIntensity={0.2}
          roughness={0.82}
          metalness={0.1}
        />
      </mesh>
      {/* Topo quebrado — caixa pequena em ângulo */}
      <mesh
        position={[0.18, 1.95, 0.08]}
        rotation={[0.25, 0.1, -0.18]}
        castShadow
      >
        <boxGeometry args={[0.46, 0.36, 0.46]} />
        <meshStandardMaterial
          color="#c8a888"
          emissive="#6a4838"
          emissiveIntensity={0.16}
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>
      {/* Pedaços caídos no chão lateral */}
      <mesh
        position={[0.85, 0.18, -0.3]}
        rotation={[0.2, 0.35, 0.15]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.55, 0.36, 0.42]} />
        <meshStandardMaterial
          color="#b89880"
          emissive="#5a3828"
          emissiveIntensity={0.16}
          roughness={0.9}
          metalness={0.06}
        />
      </mesh>
    </group>
  );
}

/** 12 chamas estilizadas suspensas — esferas/cones emissivos pulsando.
 *  SEM efeito de combustão real. Família 10-99 — apenas presença simbólica. */
function SuspendedFlames() {
  const flames = useMemo(() => {
    const out: { x: number; y: number; z: number; phase: number }[] = [];
    // 4 chamas no anel interno (em torno de Dido), 8 espalhadas
    const inner: [number, number, number][] = [
      [-3.4, 2.0, -2.8],
      [3.6, 2.4, -2.6],
      [-3.0, 1.8, 3.2],
      [3.2, 2.2, 3.4],
    ];
    const outer: [number, number, number][] = [
      [-6.6, 3.4, -4.8],
      [6.4, 3.6, -5.0],
      [-7.2, 3.0, 1.6],
      [7.0, 3.2, 2.0],
      [-5.0, 2.6, 6.4],
      [5.4, 2.8, 6.2],
      [-1.6, 4.0, -6.4],
      [1.4, 4.2, -6.2],
    ];
    inner.forEach(([x, y, z], i) => {
      out.push({ x, y, z, phase: i * 0.7 });
    });
    outer.forEach(([x, y, z], i) => {
      out.push({ x, y, z, phase: i * 0.5 + 1.5 });
    });
    return out;
  }, []);

  const flameRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    flameRefs.current.forEach((g, i) => {
      if (!g) return;
      const f = flames[i];
      const pulse = 1 + Math.sin(t * 1.8 + f.phase) * 0.18;
      g.scale.set(pulse, pulse, pulse);
      g.position.y = f.y + Math.sin(t * 0.6 + f.phase) * 0.18;
      // Modula emissivo do core
      const core = g.children[0] as THREE.Mesh | undefined;
      if (core) {
        const m = core.material as THREE.MeshBasicMaterial;
        m.opacity = 0.85 + Math.sin(t * 2.2 + f.phase) * 0.12;
      }
    });
  });

  return (
    <group>
      {flames.map((f, i) => (
        <group
          key={`flame-${i}`}
          position={[f.x, f.y, f.z]}
          ref={(g) => {
            if (g) flameRefs.current[i] = g;
          }}
        >
          {/* Núcleo emissivo amarelo-âmbar */}
          <mesh>
            <sphereGeometry args={[0.32, 14, 10]} />
            <meshBasicMaterial
              color="#ffc878"
              transparent
              opacity={0.92}
              toneMapped={false}
            />
          </mesh>
          {/* Cone superior (forma de chama) */}
          <mesh position={[0, 0.32, 0]}>
            <coneGeometry args={[0.28, 0.6, 8]} />
            <meshBasicMaterial
              color="#ff8848"
              transparent
              opacity={0.78}
              toneMapped={false}
            />
          </mesh>
          {/* Halo difuso vermelho-âmbar */}
          <mesh>
            <sphereGeometry args={[0.65, 14, 10]} />
            <meshBasicMaterial
              color="#e85838"
              transparent
              opacity={0.28}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {/* Luz pontual da chama */}
          <pointLight
            color="#ffa868"
            intensity={1.1}
            distance={6}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}

/** 11 silhuetas-soldados em postura defensiva — escudos para frente. */
function FrozenDefenders() {
  const defenders = useMemo(() => {
    const out: { x: number; z: number; rotY: number }[] = [];
    // Anel defensivo voltado para FORA da praça
    const ring = [
      { r: 6.2, count: 7 },
      { r: 4.6, count: 4 },
    ];
    ring.forEach((r) => {
      for (let i = 0; i < r.count; i++) {
        const a = (i / r.count) * Math.PI * 2 + 0.3;
        const x = Math.cos(a) * r.r;
        const z = Math.sin(a) * r.r;
        const rotY = a; // virados para fora
        out.push({ x, z, rotY });
      }
    });
    return out;
  }, []);

  return (
    <group>
      {defenders.map((d, i) => (
        <group
          key={`def-${i}`}
          position={[d.x, 0, d.z]}
          rotation={[0, d.rotY, 0]}
        >
          {/* Corpo */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.3, 1.5, 10]} />
            <meshStandardMaterial
              color="#6a4838"
              emissive="#2a1808"
              emissiveIntensity={0.18}
              roughness={0.85}
              metalness={0.12}
            />
          </mesh>
          {/* Capacete cônico bronze */}
          <mesh position={[0, 1.85, 0]} castShadow>
            <coneGeometry args={[0.18, 0.35, 8]} />
            <meshStandardMaterial
              color="#a88858"
              emissive="#5a3818"
              emissiveIntensity={0.22}
              roughness={0.55}
              metalness={0.45}
            />
          </mesh>
          {/* Cabeça */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial
              color="#d8a888"
              emissive="#7a4828"
              emissiveIntensity={0.16}
              roughness={0.78}
              metalness={0.04}
            />
          </mesh>
          {/* Escudo redondo à frente — disco vinho com ferragem dourada */}
          <mesh
            position={[0, 1.05, 0.42]}
            rotation={[0, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.42, 0.42, 0.08, 18]} />
            <meshStandardMaterial
              color="#6a2828"
              emissive="#3a1010"
              emissiveIntensity={0.2}
              roughness={0.65}
              metalness={0.35}
            />
          </mesh>
          {/* Detalhe central do escudo — disco dourado */}
          <mesh position={[0, 1.05, 0.47]}>
            <circleGeometry args={[0.14, 16]} />
            <meshStandardMaterial
              color="#e8c878"
              emissive="#c88838"
              emissiveIntensity={0.38}
              roughness={0.4}
              metalness={0.65}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 5 edifícios fragmentados ao fundo — cubos quebrados com lascas. */
function FragmentedBuildings() {
  const buildings = useMemo(() => {
    const out: {
      x: number;
      z: number;
      rotY: number;
      width: number;
      height: number;
      tilt: number;
    }[] = [];
    const placements: [number, number, number, number][] = [
      [-12, -14, 2.8, 4.0],
      [-7, -16, 2.2, 5.0],
      [0, -18, 3.0, 4.6],
      [8, -16, 2.4, 5.2],
      [13, -13, 2.6, 4.2],
    ];
    placements.forEach(([x, z, w, h], i) => {
      out.push({
        x,
        z,
        rotY: (i * 0.4) % Math.PI,
        width: w,
        height: h,
        tilt: (i % 2 === 0 ? 1 : -1) * 0.08,
      });
    });
    return out;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={`bld-${i}`} position={[b.x, 0, b.z]} rotation={[0, b.rotY, 0]}>
          {/* Caixa principal */}
          <mesh
            position={[0, b.height / 2, 0]}
            rotation={[0, 0, b.tilt]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[b.width, b.height, b.width * 0.9]} />
            <meshStandardMaterial
              color="#9a7868"
              emissive="#3a2018"
              emissiveIntensity={0.16}
              roughness={0.9}
              metalness={0.06}
            />
          </mesh>
          {/* Topo lascado — caixa menor inclinada */}
          <mesh
            position={[b.width * 0.18, b.height + 0.3, 0]}
            rotation={[0.18, 0, 0.25 + b.tilt]}
            castShadow
          >
            <boxGeometry args={[b.width * 0.55, 0.7, b.width * 0.55]} />
            <meshStandardMaterial
              color="#8a6858"
              emissive="#2a1410"
              emissiveIntensity={0.14}
              roughness={0.9}
              metalness={0.06}
            />
          </mesh>
          {/* Janelas escuras */}
          {[1, 2, 3].map((j) => (
            <mesh
              key={`win-${i}-${j}`}
              position={[0, j * 1.0, b.width * 0.46]}
            >
              <planeGeometry args={[0.35, 0.5]} />
              <meshBasicMaterial
                color="#1a0808"
                transparent
                opacity={0.92}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Mar visível à distância — plano horizontal azul-fumegante. */
function DistantSea() {
  return (
    <group>
      {/* Plano do mar bem distante atrás dos edifícios */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.0, -32]}
      >
        <planeGeometry args={[120, 30]} />
        <meshStandardMaterial
          color="#385868"
          emissive="#1a3848"
          emissiveIntensity={0.18}
          roughness={0.4}
          metalness={0.35}
        />
      </mesh>
      {/* Horizonte — linha de bruma quente */}
      <mesh position={[0, 5, -34]}>
        <planeGeometry args={[120, 3]} />
        <meshBasicMaterial
          color="#a86848"
          transparent
          opacity={0.55}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Brasas-cinzas suspensas — partículas vermelho-âmbar. */
function AshEmber() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 130;

  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 30,
      baseY: 0.4 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.12 + Math.random() * 0.25,
      size: 0.04 + Math.random() * 0.05,
      isEmber: Math.random() > 0.6,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const mesh = child as THREE.Mesh;
      mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.6;
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 0.28 + Math.sin(t * d.speed + d.phase) * 0.22;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={`ash-${i}`} position={[d.x, d.baseY, d.z]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial
            color={d.isEmber ? "#ff8848" : "#a8a098"}
            transparent
            opacity={0.45}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
