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

/* =========================================================
   AtlantisArquetipicaScene — Sprint 82 · A Versão Original
   ---------------------------------------------------------
   Complemento à AtlantidaScene (Civilização Perdida já
   jogável). Esta é a versão "platônica pura" de Platão
   (Timeu/Crítias), antes da corrupção e do afundamento.
   Não há Eloaios aqui — não há habitantes visíveis. É uma
   memória idealizada, quase um diagrama vivo.

   Geografia (mesma estrutura da AtlantidaScene, mas):
   - Três anéis concêntricos PERFEITOS, sem rachaduras
   - Sem afundamento parcial
   - Pirâmides de quartzo intactas e brilhantes
   - Paleta branco-prata-quase-pleromático em vez de azul-cobalto
   - Sky claro-luminoso (#dde2ff)
   - 30 esferas de luz suaves flutuando como "memórias intactas"

   Mecânica:
   - Se !canEnter: tela mais escura + hint (orquestrador mostra
     QuestHint "espera ter visitado a Atlântida atual")
   - Se canEnter: jogador pode caminhar livremente. Ao se
     aproximar do centro (< ~3m), App.tsx dispara a cinemática
     "atlantis-arquetipica" automaticamente (a primeira vez).

   Ver docs/22-civilizacoes-expandidas.md §4.12
   ========================================================= */

const CENTER_POS: [number, number, number] = [0, 0.5, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface AtlantisArquetipicaSceneProps {
  /** Liberado após visitar a Atlântida atual (Eloaios despertado). */
  canEnter: boolean;
  /** true se já viu a cinemática catarse-comparativa. */
  visited: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function AtlantisArquetipicaScene({
  canEnter,
  visited,
  onReturnToMar,
  onPlayerRef,
}: AtlantisArquetipicaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  // Quando o jogador ainda não desbloqueou, tudo fica mais escuro/dessaturado.
  const bgColor = canEnter ? "#dde2ff" : "#3a3e58";
  const fogColor = canEnter ? "#e8eeff" : "#2a2e44";
  const ambientColor = canEnter ? "#d8e0ff" : "#7080a0";

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
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 5, 14] }}
    >
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, 18, 90]} />

      <ambientLight color={ambientColor} intensity={canEnter ? 0.85 : 0.4} />
      <directionalLight
        position={[12, 22, 8]}
        intensity={canEnter ? 1.0 : 0.5}
        color={canEnter ? "#ffffff" : "#a8b0c8"}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* Luz central — coração da Atlântida arquetípica */}
      <pointLight
        position={[0, 7, 0]}
        intensity={canEnter ? (visited ? 1.8 : 1.3) : 0.5}
        distance={36}
        color={canEnter ? "#f8f5ff" : "#7088b0"}
        decay={2}
      />

      <PerfectOcean canEnter={canEnter} />
      <PerfectRings canEnter={canEnter} />
      <PerfectBridges canEnter={canEnter} />
      <PerfectPyramids canEnter={canEnter} visited={visited} />
      <MemorySpheres canEnter={canEnter} />
      <CentralBeacon position={CENTER_POS} canEnter={canEnter} visited={visited} />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            !canEnter
              ? "(espera ter visitado a Atlântida atual)"
              : visited
                ? "(viste o que ela era)"
                : "(voltar)"
          }
          color="#dde2ff"
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
        <Bloom intensity={canEnter ? 1.15 : 0.55} luminanceThreshold={0.42} mipmapBlur />
        <Vignette eskil={false} darkness={canEnter ? 0.35 : 0.7} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Oceano calmo, claro, sem afundamento — espelho pleromático. */
function PerfectOcean({ canEnter }: { canEnter: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity =
      (canEnter ? 0.22 : 0.1) + Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.5, 0]}
    >
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial
        color={canEnter ? "#c8d0f0" : "#404a68"}
        emissive={canEnter ? "#e0e6ff" : "#2a3252"}
        emissiveIntensity={0.22}
        roughness={0.08}
        metalness={0.95}
      />
    </mesh>
  );
}

/** Três anéis concêntricos perfeitos + plataforma central — sem rachaduras. */
function PerfectRings({ canEnter }: { canEnter: boolean }) {
  const rings = [3.5, 6.5, 9.5];
  const ringColor = canEnter ? "#f4f4ff" : "#5a607a";
  const ringEmissive = canEnter ? "#c8d0ff" : "#1a2038";
  return (
    <group>
      {rings.map((r, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, 0]}
          receiveShadow
        >
          <ringGeometry args={[r, r + 1.2, 64]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringEmissive}
            emissiveIntensity={0.28}
            roughness={0.55}
            metalness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Plataforma central — luminescente, sem rachaduras */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[2.5, 48]} />
        <meshStandardMaterial
          color={canEnter ? "#fafaff" : "#6a7090"}
          emissive={canEnter ? "#dde2ff" : "#1a2240"}
          emissiveIntensity={0.42}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

/** 4 pontes de cristal nos eixos cardinais — todas intactas. */
function PerfectBridges({ canEnter }: { canEnter: boolean }) {
  return (
    <group>
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[6, 0.2, 0]} castShadow>
            <boxGeometry args={[10, 0.1, 0.6]} />
            <meshStandardMaterial
              color={canEnter ? "#f8f8ff" : "#5a607a"}
              emissive={canEnter ? "#c8d0ff" : "#1a2038"}
              emissiveIntensity={canEnter ? 0.55 : 0.2}
              roughness={0.08}
              metalness={0.55}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Pirâmides de quartzo intactas — distribuídas pelos 3 anéis. */
function PerfectPyramids({
  canEnter,
  visited,
}: {
  canEnter: boolean;
  visited: boolean;
}) {
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let r = 0; r < 3; r++) {
      const ringR = 4.5 + r * 3;
      const count = 6 + r * 2;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + r * 0.3;
        out.push([Math.cos(a) * ringR, 0, Math.sin(a) * ringR]);
      }
    }
    return out;
  }, []);

  const color = canEnter ? "#f4f4ff" : "#606a88";
  const emissive = canEnter ? "#c8d0ff" : "#1a2038";
  const intensity = canEnter ? (visited ? 0.65 : 0.45) : 0.18;

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[p[0], 0.8, p[2]]}
          castShadow
          rotation={[0, i * 0.7, 0]}
        >
          <coneGeometry args={[0.5, 1.6, 4]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={intensity}
            roughness={0.08}
            metalness={0.55}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 30 esferas de luz flutuantes — "memórias intactas" da
    Atlântida-que-poderia-ter-sido. */
function MemorySpheres({ canEnter }: { canEnter: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 30;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 24,
      yBase: 2.5 + Math.random() * 5,
      z: (Math.random() - 0.5) * 24,
      phase: Math.random() * Math.PI * 2,
      size: 0.08 + Math.random() * 0.12,
      speed: 0.2 + Math.random() * 0.3,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      child.position.y = d.yBase + Math.sin(t * d.speed + d.phase) * 0.4;
      child.position.x = d.x + Math.cos(t * d.speed * 0.7 + d.phase) * 0.25;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const baseOp = canEnter ? 0.85 : 0.35;
      mat.opacity = baseOp + Math.sin(t * 1.2 + d.phase) * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.yBase, d.z]}>
          <sphereGeometry args={[d.size, 10, 8]} />
          <meshBasicMaterial
            color={canEnter ? "#ffffff" : "#a8b4d0"}
            transparent
            opacity={0.85}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Pilar luminoso no centro — onde Eloaios estaria, mas não está.
    No lugar dele: uma coluna de luz pura, viva, sem corpo. */
function CentralBeacon({
  position,
  canEnter,
  visited,
}: {
  position: [number, number, number];
  canEnter: boolean;
  visited: boolean;
}) {
  const beaconRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (beaconRef.current) {
      beaconRef.current.position.y = position[1] + 2 + Math.sin(t * 0.5) * 0.08;
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      const base = canEnter ? (visited ? 0.95 : 0.7) : 0.25;
      mat.opacity = base + Math.sin(t * 0.9) * 0.08;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.18;
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      const base = canEnter ? 0.55 : 0.15;
      mat.opacity = base + Math.sin(t * 0.7) * 0.08;
    }
  });

  return (
    <group position={position}>
      {/* Pilar luminoso vertical fino */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 4.5, 16, 1, true]} />
        <meshBasicMaterial
          color={canEnter ? "#ffffff" : "#a8b4d0"}
          transparent
          opacity={canEnter ? 0.7 : 0.25}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Esfera-coroa flutuante */}
      <mesh ref={beaconRef} position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.45, 18, 14]} />
        <meshBasicMaterial
          color={canEnter ? "#ffffff" : "#a8b4d0"}
          transparent
          opacity={canEnter ? 0.85 : 0.25}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Halo rotativo */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 4.5, 0]}>
        <ringGeometry args={[0.7, 0.95, 32]} />
        <meshBasicMaterial
          color={canEnter ? "#dde2ff" : "#7080a0"}
          transparent
          opacity={canEnter ? 0.55 : 0.15}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Luz pontual no topo */}
      <pointLight
        position={[0, 4.5, 0]}
        intensity={canEnter ? (visited ? 1.4 : 1.0) : 0.3}
        distance={14}
        color={canEnter ? "#f8f8ff" : "#7088b0"}
        decay={2}
      />
    </group>
  );
}
