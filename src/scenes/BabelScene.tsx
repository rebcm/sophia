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
import { PovoBabelico } from "../world/PovoBabelico";

/* =========================================================
   BabelScene — A Cidade da Palavra Fragmentada
   ---------------------------------------------------------
   Gn 11:1-9. A torre que tentou alcançar o céu por orgulho.
   Pecado arquetípico: a palavra usada para SUBIR, não para
   CONECTAR.

   Geografia:
   - Torre central piramidal-zigurate de 5 níveis (cada nível
     menor que o anterior; alturas de 0 a 16m). O topo é
     incompleto — uma lasca quebrada inacabada.
   - 4 povos ao redor do centro (em 4 direções cardeais).
   - Linhas de luz aparecem entre dois povos quando uma
     tradução acontece (uma "ponte de fala-raiz").
   - Skybox marrom-poeira. Fog âmbar-poeira.

   Mecânica (orquestrada em App.tsx):
   - Se o jogador tem a Centelha "fala-raiz", pode aproximar
     de um par de povos + F para traduzir uma mensagem entre
     eles. 4 traduções concluídas = cidade redimida.
   - Se NÃO tem a Centelha, o orquestrador mostra mensagem
     pedindo retornar mais tarde.
   ========================================================= */

const POVO_RING_RADIUS = 7.5;

/** Posições dos 4 povos — 4 direções cardeais. */
export const POVO_POSITIONS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    out.push([
      Math.cos(a) * POVO_RING_RADIUS,
      0,
      Math.sin(a) * POVO_RING_RADIUS,
    ]);
  }
  return out;
})();

/** Cores das 4 tribos — paleta poeira/terra/cobre/oliva. */
const TRIBE_COLORS = ["#d89260", "#a87838", "#7a8848", "#c06848"];

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface BabelSceneProps {
  bridges: [boolean, boolean, boolean, boolean];
  /** Posição da próxima ponte sugerida (efeito visual opcional). */
  bridgePosition?: [number, number, number];
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function BabelScene({
  bridges,
  bridgePosition,
  onReturnToMar,
  onPlayerRef,
}: BabelSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  const litCount = bridges.filter(Boolean).length;
  const allBridged = litCount >= 4;
  const progress = litCount / 4;

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
      camera={{ fov: 60, near: 0.1, far: 320, position: [0, 6, 16] }}
    >
      {/* Skybox marrom-poeira. Quando todas as pontes acesas,
          a poeira clareia para âmbar-pôr-do-sol. */}
      <color
        attach="background"
        args={[allBridged ? "#3a2818" : "#2a1c10"]}
      />
      <fog
        attach="fog"
        args={[allBridged ? "#4a3420" : "#3a2418", 16, 80]}
      />

      <ambientLight color="#7a5028" intensity={0.5} />

      {/* "Sol" de poeira — alto, ocre */}
      <pointLight
        position={[0, 22, 0]}
        intensity={allBridged ? 1.8 : 1.3}
        distance={60}
        color={allBridged ? "#ffc878" : "#c08848"}
        decay={2}
      />

      {/* Calor central crescendo com as pontes */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.4 + progress * 1.8}
        distance={20}
        color="#ffb060"
        decay={2}
      />

      <directionalLight
        position={[8, 18, 5]}
        intensity={0.4}
        color="#e0a868"
      />

      <BabelFloor allBridged={allBridged} />
      <DustHaze />
      <ZigguratTower progress={progress} allBridged={allBridged} />

      {/* 4 povos ao redor */}
      {POVO_POSITIONS.map((pos, i) => (
        <PovoBabelico
          key={i}
          position={pos}
          tribeColor={TRIBE_COLORS[i] ?? "#d89260"}
          bridgeLit={bridges[i] ?? false}
        />
      ))}

      {/* Linhas de luz entre povos consecutivos quando ponte acesa */}
      <BridgeLines bridges={bridges} />

      {/* Sinal visual no ponto de tradução sugerido pelo orquestrador */}
      {bridgePosition && <BridgeBeacon position={bridgePosition} />}

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={allBridged ? "(Babel ouve)" : "(voltar)"}
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
        <Bloom intensity={0.82} luminanceThreshold={0.38} mipmapBlur />
        <Vignette eskil={false} darkness={0.7} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Chão amplo de areia/poeira compactada. */
function BabelFloor({ allBridged }: { allBridged: boolean }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial
          color={allBridged ? "#5a3e22" : "#3a2818"}
          emissive={allBridged ? "#2a1a08" : "#180c04"}
          emissiveIntensity={0.18}
          roughness={0.96}
          metalness={0.05}
        />
      </mesh>
      {/* Anel concêntrico no chão ao redor da torre */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[5.8, 6.2, 64]} />
        <meshBasicMaterial
          color="#7a4a28"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Névoa baixa de poeira. */
function DustHaze() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.16 + Math.sin(t * 0.35) * 0.04;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.08, 0]}
    >
      <circleGeometry args={[28, 48]} />
      <meshBasicMaterial
        color="#a07840"
        transparent
        opacity={0.16}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Torre piramidal-zigurate de 5 níveis. Topo incompleto. */
function ZigguratTower({
  progress,
  allBridged,
}: {
  progress: number;
  allBridged: boolean;
}) {
  // Cada nível: { radius, height, y }. Topos vão diminuindo.
  // Empilhados de y=0 a y≈16m.
  const tiers = useMemo(() => {
    const out: { r: number; h: number; y: number }[] = [];
    const baseR = 4.0;
    const baseH = 3.5;
    let y = 0;
    for (let i = 0; i < 5; i++) {
      const r = baseR * (1 - i * 0.16);
      const h = baseH * (1 - i * 0.12);
      out.push({ r, h, y: y + h / 2 });
      y += h;
    }
    return out;
  }, []);

  // Cor da pedra — quente quando reconciliada
  const stoneColor = allBridged ? "#a07050" : "#6a4a30";
  const stoneEmissive = allBridged ? "#5a3818" : "#2a1808";

  return (
    <group>
      {tiers.map((t, i) => (
        <group key={i} position={[0, t.y, 0]}>
          {/* Bloco do nível */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[t.r * 2, t.h, t.r * 2]} />
            <meshStandardMaterial
              color={stoneColor}
              emissive={stoneEmissive}
              emissiveIntensity={0.22 + progress * 0.15}
              roughness={0.92}
              metalness={0.08}
            />
          </mesh>
          {/* Faixa horizontal no topo do nível — detalhe arquitetônico */}
          <mesh position={[0, t.h / 2 + 0.04, 0]}>
            <boxGeometry args={[t.r * 2 + 0.15, 0.08, t.r * 2 + 0.15]} />
            <meshStandardMaterial
              color={allBridged ? "#c89058" : "#7a5230"}
              emissive={allBridged ? "#6a4018" : "#1a1004"}
              emissiveIntensity={0.4}
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>
          {/* Pequenas "janelas" emissivas — pontos de luz nos níveis */}
          {[-1, 1].map((s) =>
            [-1, 1].map((d) => (
              <mesh
                key={`win-${s}-${d}`}
                position={[s * (t.r - 0.05), 0, d * (t.r - 0.05)]}
              >
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial
                  color={progress > 0 ? "#ffd078" : "#7a4a18"}
                  toneMapped={false}
                />
              </mesh>
            )),
          )}
        </group>
      ))}

      {/* Topo incompleto — lasca quebrada apontando para o céu */}
      <group position={[0, tiers[tiers.length - 1]!.y + tiers[tiers.length - 1]!.h / 2, 0]}>
        <mesh
          rotation={[0, 0, 0.18]}
          position={[0.25, 0.6, 0]}
          castShadow
        >
          <boxGeometry args={[0.6, 1.4, 0.6]} />
          <meshStandardMaterial
            color={stoneColor}
            emissive={stoneEmissive}
            emissiveIntensity={0.18}
            roughness={0.95}
          />
        </mesh>
        <mesh
          rotation={[0.1, 0.4, -0.25]}
          position={[-0.35, 0.4, 0.2]}
          castShadow
        >
          <boxGeometry args={[0.5, 1.0, 0.5]} />
          <meshStandardMaterial
            color={stoneColor}
            emissive={stoneEmissive}
            emissiveIntensity={0.18}
            roughness={0.95}
          />
        </mesh>
        {/* "Glifo do topo" — aviso/cicatriz da palavra interrompida */}
        <pointLight
          position={[0, 1.5, 0]}
          intensity={allBridged ? 0.4 : 0.9}
          distance={6}
          color={allBridged ? "#ffd070" : "#c84028"}
          decay={2}
        />
      </group>
    </group>
  );
}

/** Linhas de luz entre os 4 povos quando uma ponte está acesa. */
function BridgeLines({
  bridges,
}: {
  bridges: [boolean, boolean, boolean, boolean];
}) {
  // Cada bridge i conecta o povo i ao povo (i+1)%4
  const segments = useMemo(() => {
    const out: { a: THREE.Vector3; b: THREE.Vector3; idx: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const ai = POVO_POSITIONS[i];
      const bi = POVO_POSITIONS[(i + 1) % 4];
      if (!ai || !bi) continue;
      out.push({
        a: new THREE.Vector3(ai[0], 2.6, ai[2]),
        b: new THREE.Vector3(bi[0], 2.6, bi[2]),
        idx: i,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {segments.map((s) => (
        <BridgeLine
          key={s.idx}
          a={s.a}
          b={s.b}
          lit={bridges[s.idx] ?? false}
        />
      ))}
    </group>
  );
}

function BridgeLine({
  a,
  b,
  lit,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  lit: boolean;
}) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  // Curva levemente arqueada entre os dois povos
  const points = useMemo(() => {
    const SEGMENTS = 24;
    const out: THREE.Vector3[] = [];
    const mid = new THREE.Vector3()
      .addVectors(a, b)
      .multiplyScalar(0.5);
    mid.y += 2.0; // arco para cima
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    for (let i = 0; i <= SEGMENTS; i++) {
      out.push(curve.getPoint(i / SEGMENTS));
    }
    return out;
  }, [a, b]);

  useEffect(() => {
    if (geomRef.current) geomRef.current.setFromPoints(points);
  }, [points]);

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.elapsedTime;
    const target = lit ? 0.85 + Math.sin(t * 2) * 0.08 : 0;
    matRef.current.opacity = THREE.MathUtils.lerp(
      matRef.current.opacity,
      target,
      0.06,
    );
  });

  return (
    <line>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial
        ref={matRef}
        color="#ffd070"
        transparent
        opacity={0}
        toneMapped={false}
      />
    </line>
  );
}

/** Sinal visual no ponto onde a próxima tradução está prestes a acontecer. */
function BridgeBeacon({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const s = 1 + Math.sin(t * 2.4) * 0.15;
    ref.current.scale.set(s, s, s);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.4 + Math.sin(t * 2.4) * 0.15;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.5, 18, 14]} />
      <meshBasicMaterial
        color="#ffd070"
        transparent
        opacity={0.5}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
