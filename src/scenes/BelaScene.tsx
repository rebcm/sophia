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
import { LothDaMemoria } from "../world/LothDaMemoria";

/* =========================================================
   BelaScene — A Cidade Que Pôde Ser Salva (Já Foi)
   ---------------------------------------------------------
   Cidade pequena, viva, em paz. Habitantes acordados. Tarde
   dourada perpétua. Bela aceitou Loth quando ele fugiu (Gn 19),
   por isso sobreviveu. NO JOGO ela é lugar de descanso e
   encorajamento — exemplo de que dá para ser poupada.

   Sem mecânica de intercessão. Apenas exploração. Encontro
   opcional com Loth-da-Memória, sentado no degrau de uma das
   casas. Aproximação + F → cinemática "loth-de-bela".

   Geografia:
     - Praça circular pequena com fonte central de água viva
     - 5-6 casas pequenas de pedra branca em redor
     - 3-4 árvores ornamentais de fruto dourado
     - Tarde dourada (skybox #e8a878, fog âmbar-quente)
     - Loth sentado no degrau da casa à direita-frente

   Ver docs/22-civilizacoes-expandidas.md §4.5 (Bela).
   ========================================================= */

const LOTH_POS: [number, number, number] = [4.6, 0.36, 1.6];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface BelaSceneProps {
  lothMet: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function BelaScene({
  lothMet,
  onReturnToMar,
  onPlayerRef,
}: BelaSceneProps) {
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
      camera={{ fov: 60, near: 0.1, far: 280, position: [0, 4, 12] }}
    >
      {/* Skybox âmbar-quente — tarde dourada constante */}
      <color attach="background" args={["#e8a878"]} />
      <fog attach="fog" args={["#dca070", 18, 80]} />

      <ambientLight color="#f4cca0" intensity={0.85} />

      {/* Sol-baixo dourado lateral — direcional para sombras longas */}
      <directionalLight
        position={[14, 9, 8]}
        intensity={1.05}
        color="#ffd098"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Luz do centro da praça — fonte de água viva */}
      <pointLight
        position={[0, 2.4, 0]}
        intensity={0.85}
        distance={12}
        color="#ffe0a8"
        decay={2}
      />

      {/* Luz de acolhida sobre Loth — discreta quando já encontrado */}
      <pointLight
        position={[LOTH_POS[0], 2.6, LOTH_POS[2]]}
        intensity={lothMet ? 0.7 : 1.0}
        distance={7}
        color="#ffc878"
        decay={2}
      />

      <CobblePlaza />
      <CentralFountain />
      <StoneHouses />
      <GoldenFruitTrees />
      <DustMotes />
      <DistantBelaInhabitants />

      <LothDaMemoria
        position={LOTH_POS}
        metByPlayer={lothMet}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={lothMet ? "(Bela continua acolhendo)" : "(voltar)"}
          color="#ffd098"
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
        <Bloom intensity={0.75} luminanceThreshold={0.6} mipmapBlur />
        <Vignette eskil={false} darkness={0.42} offset={0.34} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Praça circular de pedras-claras com leve emissivo dourado. */
function CobblePlaza() {
  return (
    <group>
      {/* Disco principal — pedra clara areia */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial
          color="#d8b888"
          emissive="#8a6038"
          emissiveIntensity={0.14}
          roughness={0.92}
          metalness={0.06}
        />
      </mesh>
      {/* Anel decorativo no entorno da fonte */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <ringGeometry args={[1.9, 2.05, 48]} />
        <meshBasicMaterial
          color="#ffd078"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Caminho ligeiro até o portal de retorno (cor mais clara) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 6.5]}
      >
        <planeGeometry args={[2.2, 9.0]} />
        <meshBasicMaterial
          color="#e8c898"
          transparent
          opacity={0.42}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Fonte central de água viva — base de pedra + jato suave + halo. */
function CentralFountain() {
  const waterRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (waterRef.current) {
      const m = waterRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.45 + Math.sin(t * 0.9) * 0.12;
      waterRef.current.scale.y = 1 + Math.sin(t * 1.3) * 0.06;
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.22 + Math.sin(t * 0.7) * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pedestal hexagonal */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.2, 0.8, 6]} />
        <meshStandardMaterial
          color="#ece0c8"
          emissive="#a89868"
          emissiveIntensity={0.16}
          roughness={0.78}
          metalness={0.1}
        />
      </mesh>
      {/* Bacia superior — disco com bordas */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <cylinderGeometry args={[1.05, 0.95, 0.16, 18]} />
        <meshStandardMaterial
          color="#f4e8c8"
          emissive="#c8a868"
          emissiveIntensity={0.2}
          roughness={0.68}
          metalness={0.18}
        />
      </mesh>
      {/* Jato d'água — cilindro fino azul-cristal */}
      <mesh ref={waterRef} position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.06, 0.12, 1.1, 10]} />
        <meshStandardMaterial
          color="#cae8f0"
          emissive="#80c8e0"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.78}
        />
      </mesh>
      {/* Coroa da água — esfera achatada no topo do jato */}
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.18, 14, 10]} />
        <meshStandardMaterial
          color="#e0f4f8"
          emissive="#a0d8e8"
          emissiveIntensity={0.55}
          roughness={0.3}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Halo difuso âmbar-quente envolvendo a fonte */}
      <mesh ref={haloRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[1.9, 18, 14]} />
        <meshBasicMaterial
          color="#ffd098"
          transparent
          opacity={0.22}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** 6 casas pequenas de pedra branca em anel ao redor da praça.
 *  A da posição [4.6, ?, 1.6] tem um degrau onde Loth se senta. */
function StoneHouses() {
  const houses = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.42;
      const r = 6.4;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rot: a + Math.PI,
        roof: i % 2 === 0 ? "pyramid" : "rounded",
      };
    });
  }, []);

  return (
    <group>
      {houses.map((h, i) => (
        <group key={`house-${i}`} position={[h.x, 0, h.z]} rotation={[0, h.rot, 0]}>
          {/* Corpo da casa — caixa de pedra clara */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 2.4, 2.0]} />
            <meshStandardMaterial
              color="#f0e4ce"
              emissive="#a08a68"
              emissiveIntensity={0.16}
              roughness={0.85}
              metalness={0.06}
            />
          </mesh>
          {/* Telhado */}
          {h.roof === "pyramid" ? (
            <mesh position={[0, 2.85, 0]} castShadow>
              <coneGeometry args={[1.8, 1.0, 4]} />
              <meshStandardMaterial
                color="#c89868"
                emissive="#7a5430"
                emissiveIntensity={0.22}
                roughness={0.78}
                metalness={0.1}
              />
            </mesh>
          ) : (
            <mesh position={[0, 2.6, 0]} castShadow>
              <sphereGeometry
                args={[1.42, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshStandardMaterial
                color="#c89868"
                emissive="#7a5430"
                emissiveIntensity={0.22}
                roughness={0.78}
                metalness={0.1}
              />
            </mesh>
          )}
          {/* Porta — retângulo escuro de madeira */}
          <mesh position={[0, 0.7, 1.005]}>
            <planeGeometry args={[0.7, 1.4]} />
            <meshStandardMaterial
              color="#5a3a1c"
              emissive="#2a1808"
              emissiveIntensity={0.18}
              roughness={0.85}
              metalness={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Janela 1 — pequeno quadrado dourado-emissivo */}
          <mesh position={[-0.78, 1.5, 1.005]}>
            <planeGeometry args={[0.45, 0.45]} />
            <meshBasicMaterial
              color="#ffd478"
              transparent
              opacity={0.78}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Janela 2 */}
          <mesh position={[0.78, 1.5, 1.005]}>
            <planeGeometry args={[0.45, 0.45]} />
            <meshBasicMaterial
              color="#ffd478"
              transparent
              opacity={0.78}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Degrau diante da porta — bloco baixo (onde Loth se senta na frontal) */}
          <mesh position={[0, 0.18, 1.18]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.36, 0.5]} />
            <meshStandardMaterial
              color="#dccab0"
              emissive="#8a7458"
              emissiveIntensity={0.14}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 4 árvores ornamentais de fruto dourado — tronco escuro, copa verde,
 *  pequenos frutos pendurados que brilham. */
function GoldenFruitTrees() {
  const trees = useMemo(() => {
    const positions: { x: number; z: number; angle: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.1;
      const r = 4.2;
      positions.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        angle: a,
      });
    }
    return positions;
  }, []);

  const fruitRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    fruitRefs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.45 + Math.sin(t * 0.6 + i * 0.4) * 0.12;
      m.position.y = m.userData.baseY + Math.sin(t * 0.5 + i) * 0.04;
    });
  });

  return (
    <group>
      {trees.map((t, i) => (
        <group key={`tree-${i}`} position={[t.x, 0, t.z]}>
          {/* Tronco — cilindro escuro */}
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 2.2, 10]} />
            <meshStandardMaterial
              color="#5a3818"
              emissive="#2a1808"
              emissiveIntensity={0.15}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
          {/* Copa — esfera verde-oliva */}
          <mesh position={[0, 2.7, 0]} castShadow>
            <sphereGeometry args={[1.05, 18, 14]} />
            <meshStandardMaterial
              color="#88a868"
              emissive="#3a5028"
              emissiveIntensity={0.2}
              roughness={0.78}
              metalness={0.05}
            />
          </mesh>
          {/* 5 frutos dourados pendurados */}
          {Array.from({ length: 5 }, (_, j) => {
            const ang = (j / 5) * Math.PI * 2;
            const fr = 0.85;
            const fx = Math.cos(ang) * fr;
            const fz = Math.sin(ang) * fr;
            const fy = 2.4 + (j % 2) * 0.2;
            const idx = i * 5 + j;
            return (
              <mesh
                key={`fruit-${i}-${j}`}
                ref={(el) => {
                  if (el) {
                    el.userData.baseY = fy;
                    fruitRefs.current[idx] = el;
                  }
                }}
                position={[fx, fy, fz]}
              >
                <sphereGeometry args={[0.13, 12, 10]} />
                <meshStandardMaterial
                  color="#ffd078"
                  emissive="#c88830"
                  emissiveIntensity={0.45}
                  roughness={0.42}
                  metalness={0.3}
                  toneMapped={false}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/** Poeira-luz suspensa — partículas pequenas douradas no ar. */
function DustMotes() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 80;

  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 22,
      z: (Math.random() - 0.5) * 22,
      baseY: 0.4 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.12 + Math.random() * 0.25,
      size: 0.03 + Math.random() * 0.05,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const mesh = child as THREE.Mesh;
      mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.5;
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + Math.sin(t * d.speed + d.phase) * 0.25;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={`mote-${i}`} position={[d.x, d.baseY, d.z]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial
            color="#ffe0a8"
            transparent
            opacity={0.5}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Silhuetas distantes de habitantes de Bela — andam de leve, vivos. */
function DistantBelaInhabitants() {
  const positions = useMemo(() => {
    const out: { x: number; z: number; phase: number }[] = [];
    const COUNT = 7;
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2 + 0.5;
      const r = 11 + (i % 3) * 2;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        phase: i * 0.6,
      });
    }
    return out;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = positions[i];
      if (!d) return;
      // Movimento de ir-e-vir suave — caminhar visto de longe
      child.position.x = d.x + Math.sin(t * 0.18 + d.phase) * 0.8;
      child.position.z = d.z + Math.cos(t * 0.18 + d.phase) * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <group key={`inh-${i}`} position={[p.x, 0, p.z]}>
          {/* Corpo — cilindro alongado em tom sépia-claro */}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.18, 0.28, 1.6, 8]} />
            <meshStandardMaterial
              color="#e8c8a0"
              emissive="#8a6840"
              emissiveIntensity={0.28}
              roughness={0.78}
              metalness={0.08}
              transparent
              opacity={0.78}
            />
          </mesh>
          {/* Cabeça */}
          <mesh position={[0, 1.85, 0]}>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshStandardMaterial
              color="#e0b888"
              emissive="#8a6038"
              emissiveIntensity={0.24}
              roughness={0.78}
              metalness={0.05}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
