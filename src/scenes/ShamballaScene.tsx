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
import { TriadeSentinela } from "../world/TriadeSentinela";
import { Portal } from "../world/Portal";

/* =========================================================
   ShamballaScene — O Fragmento do Pleroma
   ---------------------------------------------------------
   Ilha flutuante dentro de uma caverna maior. A caverna não
   tem sol, lua ou estalactite — a luz vem da própria cidade.
   Ao redor: escuridão quase total + fog para sugerir o tamanho
   da caverna sem precisar modelar suas paredes.

   No centro da ilha, em triângulo equilátero, as três
   sentinelas-Aeon que escolheram NÃO descer com a Queda.

   Ver docs/22-civilizacoes-expandidas.md §2.2 (Shamballa).
   ========================================================= */

const TRIADE_POS: [number, number, number] = [0, 0.4, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface ShamballaSceneProps {
  contemplated: [boolean, boolean, boolean];
  focusedIndex: 0 | 1 | 2 | null;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function ShamballaScene({
  contemplated,
  focusedIndex,
  onReturnToMar,
  onPlayerRef,
}: ShamballaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const triadeTarget = useMemo(() => new THREE.Vector3(...TRIADE_POS), []);
  const allDone = contemplated.every(Boolean);

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
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 4, 12] }}
    >
      {/* Caverna escura ao redor: quase preta, com leve roxo-noite */}
      <color attach="background" args={["#05050a"]} />
      <fog attach="fog" args={["#080814", 14, 60]} />

      {/* Ambiente mínimo — a luz tem que parecer brotar da cidade */}
      <ambientLight color="#2a2a3a" intensity={0.18} />

      {/* Núcleo luminoso da ilha — luz que a cidade emana */}
      <pointLight
        position={[0, 1.0, 0]}
        intensity={allDone ? 3.4 : 2.6}
        distance={26}
        color="#fff4e0"
        decay={2}
      />

      {/* Halo alto — para iluminar as figuras de cima sem ser direcional */}
      <pointLight
        position={[0, 10, 0]}
        intensity={1.2}
        distance={28}
        color="#e8e8ff"
        decay={2}
      />

      {/* Direcional suave para sombras das sentinelas */}
      <directionalLight
        position={[4, 14, 4]}
        intensity={0.22}
        color="#f0f0ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />

      <FloatingIsland />
      <IslandEmissiveRim />
      <EthericParticles />
      <DistantVoid />

      {/* Tríade Sentinela — no centro da ilha */}
      <TriadeSentinela
        position={TRIADE_POS}
        contemplated={contemplated}
        focusedIndex={focusedIndex}
      />

      <Player
        externalRef={playerRef}
        awakenTarget={triadeTarget}
        awakenDistance={3.8}
      />

      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={allDone ? "(o fragmento lembra)" : "(voltar)"}
          color="#ece8ff"
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
        <Bloom intensity={1.25} luminanceThreshold={0.32} mipmapBlur />
        <Vignette eskil={false} darkness={0.85} offset={0.22} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de mundo ---------------- */

/** Plataforma luminosa que emana a luz da cena — discos sobrepostos
 *  com material emissivo branco-quente. Não é "iluminada", ela
 *  ilumina. */
function FloatingIsland() {
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!innerRef.current) return;
    const t = state.clock.elapsedTime;
    const m = innerRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.95 + Math.sin(t * 0.3) * 0.12;
  });

  return (
    <group>
      {/* Disco principal — emissivo branco-quente */}
      <mesh
        ref={innerRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[7.5, 64]} />
        <meshStandardMaterial
          color="#fff4e0"
          emissive="#fff0d4"
          emissiveIntensity={0.95}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>
      {/* Camada externa difusa — borda suavizando para o vazio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[7.5, 9.8, 64]} />
        <meshBasicMaterial
          color="#fff0d8"
          transparent
          opacity={0.42}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Halo difuso embaixo — sugere que a ilha flutua */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <circleGeometry args={[10.6, 48]} />
        <meshBasicMaterial
          color="#fff0c8"
          transparent
          opacity={0.12}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Anéis luminosos sobre a borda da ilha — emanação visual contínua */
function IslandEmissiveRim() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    const m = ringRef.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.55 + Math.sin(t * 0.4) * 0.12;
  });

  return (
    <group>
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
      >
        <ringGeometry args={[7.2, 7.55, 96]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
      >
        <ringGeometry args={[6.6, 6.78, 96]} />
        <meshBasicMaterial
          color="#fff4e0"
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Partículas etéreas suspensas no ar — pequenas esferas que sobem
 *  e descem lentamente, sugerindo a respiração do Pleroma. */
function EthericParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 90;

  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 7.0;
      return {
        baseX: Math.cos(angle) * r,
        baseZ: Math.sin(angle) * r,
        baseY: 0.4 + Math.random() * 5.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.18 + Math.random() * 0.4,
        size: 0.04 + Math.random() * 0.09,
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const mesh = child as THREE.Mesh;
      mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.45;
      mesh.position.x = d.baseX + Math.cos(t * d.speed * 0.5 + d.phase) * 0.08;
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 0.4 + Math.sin(t * d.speed * 0.8 + d.phase) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={`p-${i}`} position={[d.baseX, d.baseY, d.baseZ]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial
            color="#fff8ec"
            transparent
            opacity={0.6}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Massa escura distante — sugestão da caverna sem modelá-la.
 *  Esferas amplas, opacas, ao redor, fora do alcance da luz da ilha. */
function DistantVoid() {
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r = 38;
      out.push([Math.cos(a) * r, 6, Math.sin(a) * r]);
    }
    return out;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={`void-${i}`} position={p}>
          <sphereGeometry args={[14, 18, 14]} />
          <meshBasicMaterial color="#03030a" depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
