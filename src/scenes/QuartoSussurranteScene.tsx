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
import { Portal } from "../world/Portal";

/* =========================================================
   QuartoSussurranteScene — Sprint 83
   ---------------------------------------------------------
   Pequeno quarto íntimo. Não é "lugar" no sentido cósmico —
   é o espaço onde Sophia mora entre as visitas. Apenas dois
   bancos de pedra branca, um pequeno jardim de flores-pleroma
   e o teto-aberto-para-o-Pleroma.

   A Sussurrante (já humanoide após Casa-Espelhada) está ali,
   sentada num dos bancos. Quem se senta no outro pode ouvi-la
   falar de coisas que ela nunca disse durante a jornada.
   ========================================================= */

const SOPHIA_POS: [number, number, number] = [-1.5, 0, 0];
const PLAYER_BENCH_POS: [number, number, number] = [1.5, 0, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 10];

interface QuartoSussurranteSceneProps {
  /** Quantos dos 5 fragmentos de revelação já foram ouvidos. */
  fragmentsHeard: number;
  /** Player sentado no banco oposto a Sophia (proximidade < 1.5m). */
  playerSeated: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function QuartoSussurranteScene({
  fragmentsHeard,
  playerSeated,
  onReturnToMar,
  onPlayerRef,
}: QuartoSussurranteSceneProps) {
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
      camera={{ fov: 55, near: 0.1, far: 60, position: [0, 3, 6] }}
    >
      <color attach="background" args={["#1a1838"]} />
      <fog attach="fog" args={["#2a2848", 8, 30]} />

      <ambientLight color="#c8b8e0" intensity={0.7} />
      <directionalLight
        position={[2, 8, 2]}
        intensity={0.55}
        color="#ffd45a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Luz central do teto-aberto-para-o-Pleroma */}
      <pointLight
        position={[0, 5, 0]}
        intensity={1.4 + fragmentsHeard * 0.2}
        distance={10}
        color="#fff5d8"
        decay={2}
      />

      <FloorPedraBranca />
      <PleromaCeiling fragmentsHeard={fragmentsHeard} />
      <TwoBenches />
      <JardimFloresPleroma fragmentsHeard={fragmentsHeard} />
      <SophiaSeated
        position={SOPHIA_POS}
        playerSeated={playerSeated}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel="(voltar)"
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
        <Bloom intensity={0.85} luminanceThreshold={0.55} mipmapBlur />
        <Vignette eskil={false} darkness={0.45} offset={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function FloorPedraBranca() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[8, 64]} />
      <meshStandardMaterial
        color="#f5f0e8"
        emissive="#ddc8b8"
        emissiveIntensity={0.12}
        roughness={0.45}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Teto aberto para o Pleroma — esferas de luz suaves descem
 *  com mais intensidade conforme fragmentos são ouvidos. */
function PleromaCeiling({ fragmentsHeard }: { fragmentsHeard: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 60;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 14,
      y: 5 + Math.random() * 6,
      z: (Math.random() - 0.5) * 14,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const baseOpacity = 0.25 + fragmentsHeard * 0.12;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      child.position.y = d.y + Math.sin(t * d.speed + d.phase) * 0.3;
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = baseOpacity + Math.sin(t * 0.6 + d.phase) * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial
            color="#fff5d8"
            transparent
            opacity={0.3}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function TwoBenches() {
  return (
    <group>
      {/* Banco de Sophia */}
      <mesh castShadow receiveShadow position={[SOPHIA_POS[0], 0.3, SOPHIA_POS[2]]}>
        <boxGeometry args={[1.4, 0.6, 0.7]} />
        <meshStandardMaterial
          color="#f8f4ec"
          emissive="#e8d8b8"
          emissiveIntensity={0.18}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Banco do jogador */}
      <mesh castShadow receiveShadow position={[PLAYER_BENCH_POS[0], 0.3, PLAYER_BENCH_POS[2]]}>
        <boxGeometry args={[1.4, 0.6, 0.7]} />
        <meshStandardMaterial
          color="#f8f4ec"
          emissive="#e8d8b8"
          emissiveIntensity={0.18}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

/** Pequeno canteiro de flores-pleroma entre os dois bancos. */
function JardimFloresPleroma({ fragmentsHeard }: { fragmentsHeard: number }) {
  const positions = useMemo(() => {
    const out: { x: number; z: number; tint: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
      const r = 0.4 + Math.random() * 0.5;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        tint: Math.random(),
      });
    }
    return out;
  }, []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      // Caule pulsa suave
      child.rotation.z = Math.sin(t * 0.4 + i) * 0.05;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {positions.map((p, i) => {
        const color =
          p.tint < 0.33 ? "#ffd45a" : p.tint < 0.66 ? "#c89aff" : "#88e8c8";
        return (
          <group key={i} position={[p.x, 0, p.z]}>
            {/* Caule */}
            <mesh castShadow position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.02, 0.025, 0.3, 6]} />
              <meshStandardMaterial color="#4a684a" roughness={0.9} />
            </mesh>
            {/* Flor */}
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.08, 10, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.3 + fragmentsHeard * 0.1}
                roughness={0.45}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Sophia humanoide sentada no banco esquerdo. Inclina a cabeça
 *  ligeiramente em direção ao banco do jogador quando ele se senta. */
function SophiaSeated({
  position,
  playerSeated,
}: {
  position: [number, number, number];
  playerSeated: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Respiração calma
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(t * 0.4) * 0.015;
    }

    // Cabeça inclina-se em direção ao banco do jogador quando ele se senta
    if (headRef.current) {
      const target = playerSeated ? 0.25 : 0;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        target,
        0.04,
      );
    }

    // Aura intensifica quando o jogador se senta
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const targetOp = playerSeated ? 0.55 : 0.32;
      m.opacity = THREE.MathUtils.lerp(m.opacity, targetOp, 0.04);
      m.opacity += Math.sin(t * 0.6) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Torso sentado (cilindro) */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.9, 12]} />
        <meshStandardMaterial
          color="#fff5d8"
          emissive="#ffd4a8"
          emissiveIntensity={0.45}
          roughness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Cabeça */}
      <mesh ref={headRef} castShadow position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.22, 18, 14]} />
        <meshStandardMaterial
          color="#fff5d8"
          emissive="#ffd4a8"
          emissiveIntensity={0.4}
          roughness={0.4}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Aura grande */}
      <mesh ref={auraRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[1.1, 24, 24]} />
        <meshBasicMaterial
          color="#ffe9d0"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      {/* Núcleo dourado */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial
          color="#ffd45a"
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
