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
import { AvoCatalhoyuk } from "../world/AvoCatalhoyuk";

/* =========================================================
   CatalhoyukScene — A Vila-Mãe da Humanidade
   ---------------------------------------------------------
   Vila circular de casas de barro pequenas interligadas no
   topo (entrada pelo teto — referência arqueológica). Cozinha
   comunitária central com fogueira pequena (cone laranja-
   amarelo + esferas amarelas pulsando) e 4 panelas grandes
   ao redor. 4-6 anciãs em círculo. Telhados formam uma
   "calçada superior". Manhã clara, sem fog.

   NÃO há pecado arquetípico. Catalhöyük é exemplo de socie-
   dade-sem-arconte possível. Já foi vivida. Pode ser vivida
   de novo.

   Encontro com A Avó (Lendária) → cinemática "avo-catalhoyuk"
   → Pacto Anti-Hierarquia (anotação no Codex).

   Geografia:
     - 14 casas de barro pequenas em anel ao redor da praça
     - Cozinha central: fogueira + 4 panelas + 4 anciãs
     - Avó sentada em destaque (frente da fogueira)
     - Telhados em altura única formando calçada
     - Skybox manhã clara #e8d8b0

   Ver docs/22-civilizacoes-expandidas.md §4.13 (Catalhöyük).
   ========================================================= */

const AVO_POS: [number, number, number] = [0, 0, 2.4];
const FIRE_POS: [number, number, number] = [0, 0, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 13];

interface CatalhoyukSceneProps {
  avoMet: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function CatalhoyukScene({
  avoMet,
  onReturnToMar,
  onPlayerRef,
}: CatalhoyukSceneProps) {
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
      camera={{ fov: 60, near: 0.1, far: 280, position: [0, 4, 13] }}
    >
      {/* Skybox manhã clara, sem fog (paz, claridade) */}
      <color attach="background" args={["#e8d8b0"]} />

      <ambientLight color="#f8e8c0" intensity={0.95} />

      {/* Sol alto — manhã clara */}
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.2}
        color="#fff0c8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Luz quente da fogueira central */}
      <pointLight
        position={[FIRE_POS[0], 1.2, FIRE_POS[2]]}
        intensity={1.4}
        distance={10}
        color="#ffa858"
        decay={2}
      />

      {/* Luz sobre Avó (acolhedora) */}
      <pointLight
        position={[AVO_POS[0], 2.2, AVO_POS[2]]}
        intensity={avoMet ? 0.8 : 1.05}
        distance={6.5}
        color="#f8c478"
        decay={2}
      />

      <EarthGround />
      <ClayHouses />
      <CommunityFire position={FIRE_POS} />
      <CookingPots />
      <SeatedElders />
      <RooftopWalkway />

      <AvoCatalhoyuk
        position={AVO_POS}
        metByPlayer={avoMet}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={avoMet ? "(o Pacto te acompanha)" : "(voltar)"}
          color="#f8c478"
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
        <Bloom intensity={0.6} luminanceThreshold={0.7} mipmapBlur />
        <Vignette eskil={false} darkness={0.32} offset={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Chão de terra batida cor-de-areia-clara. */
function EarthGround() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[36, 64]} />
        <meshStandardMaterial
          color="#dcc89c"
          emissive="#8a6c44"
          emissiveIntensity={0.15}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>
      {/* Praça central — um pouco mais escura */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, 0.0, 0]}
      >
        <circleGeometry args={[5.5, 48]} />
        <meshStandardMaterial
          color="#c8a878"
          emissive="#7a5028"
          emissiveIntensity={0.16}
          roughness={0.92}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}

/** 14 casas de barro pequenas interligadas em anel ao redor da praça.
 *  Cubos arredondados beges, sem porta visível (entrada pelo teto). */
function ClayHouses() {
  const houses = useMemo(() => {
    const COUNT = 14;
    const radius = 8.5;
    return Array.from({ length: COUNT }, (_, i) => {
      const a = (i / COUNT) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const rotY = a + Math.PI / 2;
      const variation = (i % 3) * 0.18;
      return { x, z, rotY, size: 2.2 + variation };
    });
  }, []);

  return (
    <group>
      {houses.map((h, i) => (
        <group
          key={`clay-${i}`}
          position={[h.x, 0, h.z]}
          rotation={[0, h.rotY, 0]}
        >
          {/* Corpo da casa — caixa de barro */}
          <mesh position={[0, h.size / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[h.size + 0.4, h.size, h.size]} />
            <meshStandardMaterial
              color="#d8b888"
              emissive="#7a5430"
              emissiveIntensity={0.18}
              roughness={0.92}
              metalness={0.04}
            />
          </mesh>
          {/* Cantos arredondados — esferas pequenas nos cantos superiores */}
          {[
            [-(h.size + 0.4) / 2, h.size, -h.size / 2],
            [(h.size + 0.4) / 2, h.size, -h.size / 2],
            [-(h.size + 0.4) / 2, h.size, h.size / 2],
            [(h.size + 0.4) / 2, h.size, h.size / 2],
          ].map(([cx, cy, cz], j) => (
            <mesh key={`corner-${i}-${j}`} position={[cx, cy, cz]}>
              <sphereGeometry args={[0.18, 8, 6]} />
              <meshStandardMaterial
                color="#cca878"
                emissive="#6a4828"
                emissiveIntensity={0.18}
                roughness={0.92}
                metalness={0.04}
              />
            </mesh>
          ))}
          {/* Telhado plano — entrada por escotilha (caixa baixa) */}
          <mesh
            position={[0, h.size + 0.06, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[h.size + 0.5, 0.12, h.size + 0.08]} />
            <meshStandardMaterial
              color="#b89868"
              emissive="#6a4828"
              emissiveIntensity={0.18}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
          {/* Escotilha (referência arqueológica) — pequeno quadrado escuro */}
          <mesh
            position={[0, h.size + 0.13, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.55, 0.55]} />
            <meshBasicMaterial
              color="#3a2410"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {/* Vaso pequeno de cerâmica na frente (decoração de cozinha) */}
          {i % 2 === 0 && (
            <mesh position={[0, 0.18, h.size / 2 + 0.45]} castShadow>
              <cylinderGeometry args={[0.14, 0.18, 0.36, 10]} />
              <meshStandardMaterial
                color="#8a5028"
                emissive="#4a2810"
                emissiveIntensity={0.18}
                roughness={0.88}
                metalness={0.06}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/** Fogueira comunitária central — cone laranja-amarelo + esferas pulsando. */
function CommunityFire({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (flameRef.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.12;
      flameRef.current.scale.set(pulse, pulse, pulse);
    }
    if (coreRef.current) {
      const m = coreRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.88 + Math.sin(t * 3.0) * 0.1;
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.32 + Math.sin(t * 1.4) * 0.07;
    }
  });

  return (
    <group position={position}>
      {/* Anel de pedras ao redor */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x = Math.cos(a) * 0.65;
        const z = Math.sin(a) * 0.65;
        return (
          <mesh
            key={`stone-${i}`}
            position={[x, 0.12, z]}
            rotation={[0, a * 0.5, 0.15]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.32, 0.24, 0.28]} />
            <meshStandardMaterial
              color="#6a5040"
              emissive="#2a1808"
              emissiveIntensity={0.16}
              roughness={0.9}
              metalness={0.06}
            />
          </mesh>
        );
      })}
      {/* Lenha — 3 cilindros cruzados */}
      {[0, Math.PI / 3, (Math.PI * 2) / 3].map((rot, i) => (
        <mesh
          key={`log-${i}`}
          position={[0, 0.18, 0]}
          rotation={[Math.PI / 2, 0, rot]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
          <meshStandardMaterial
            color="#3a2010"
            emissive="#1a0c04"
            emissiveIntensity={0.18}
            roughness={0.88}
            metalness={0.06}
          />
        </mesh>
      ))}
      {/* Núcleo amarelo brilhante */}
      <mesh ref={coreRef} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.18, 14, 10]} />
        <meshBasicMaterial
          color="#fff0a8"
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
      {/* Cone da chama (laranja-amarelo) */}
      <mesh ref={flameRef} position={[0, 0.65, 0]}>
        <coneGeometry args={[0.28, 0.7, 10]} />
        <meshBasicMaterial
          color="#ff9848"
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      {/* Esfera-faísca menor acima */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial
          color="#ffd078"
          transparent
          opacity={0.78}
          toneMapped={false}
        />
      </mesh>
      {/* Halo difuso âmbar-quente */}
      <mesh ref={haloRef} position={[0, 0.7, 0]}>
        <sphereGeometry args={[1.4, 18, 12]} />
        <meshBasicMaterial
          color="#ffa858"
          transparent
          opacity={0.34}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** 4 panelas grandes em redor da fogueira (cilindros de cerâmica). */
function CookingPots() {
  const pots = useMemo(() => {
    const out: { x: number; z: number; rotY: number }[] = [];
    const positions: [number, number][] = [
      [-1.8, -1.2],
      [1.8, -1.2],
      [-1.8, 1.2],
      [1.8, 1.2],
    ];
    positions.forEach(([x, z], i) => {
      out.push({ x, z, rotY: (i * 0.5) % Math.PI });
    });
    return out;
  }, []);

  return (
    <group>
      {pots.map((p, i) => (
        <group key={`pot-${i}`} position={[p.x, 0, p.z]} rotation={[0, p.rotY, 0]}>
          {/* Corpo da panela */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.46, 0.8, 18]} />
            <meshStandardMaterial
              color="#7a4828"
              emissive="#3a1808"
              emissiveIntensity={0.16}
              roughness={0.88}
              metalness={0.08}
            />
          </mesh>
          {/* Boca da panela */}
          <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.04, 8, 22]} />
            <meshStandardMaterial
              color="#5a3018"
              emissive="#2a1408"
              emissiveIntensity={0.18}
              roughness={0.85}
              metalness={0.1}
            />
          </mesh>
          {/* Conteúdo (caldo/grão) — disco emissivo dourado-pálido */}
          <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.34, 22]} />
            <meshStandardMaterial
              color="#e8c890"
              emissive="#c88848"
              emissiveIntensity={0.3}
              roughness={0.7}
              metalness={0.06}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 4 anciãs sentadas em círculo ao redor da fogueira (excetuando Avó-da-frente). */
function SeatedElders() {
  const elders = useMemo(() => {
    const out: { x: number; z: number; rotY: number; tone: number }[] = [];
    // Círculo de 4 anciãs nos cantos cardeais (deixa a frente livre para Avó/jogador)
    const positions: [number, number][] = [
      [-2.6, 0.2],
      [2.6, 0.2],
      [-1.4, -2.5],
      [1.4, -2.5],
    ];
    positions.forEach(([x, z], i) => {
      const rotY = Math.atan2(-x, -z); // virada para o fogo
      out.push({ x, z, rotY, tone: i % 3 });
    });
    return out;
  }, []);

  const tones = [
    { color: "#d4b888", emissive: "#7a5430" },
    { color: "#b88860", emissive: "#5a3a18" },
    { color: "#c8a878", emissive: "#6a4828" },
  ];

  return (
    <group>
      {elders.map((e, i) => {
        const tone = tones[e.tone];
        return (
          <group key={`eld-${i}`} position={[e.x, 0, e.z]} rotation={[0, e.rotY, 0]}>
            {/* Pernas cruzadas — disco baixo */}
            <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.62, 0.68, 0.36, 16]} />
              <meshStandardMaterial
                color={tone.color}
                emissive={tone.emissive}
                emissiveIntensity={0.2}
                roughness={0.88}
                metalness={0.04}
              />
            </mesh>
            {/* Tronco */}
            <mesh position={[0, 0.68, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.46, 0.6, 12]} />
              <meshStandardMaterial
                color={tone.color}
                emissive={tone.emissive}
                emissiveIntensity={0.2}
                roughness={0.86}
                metalness={0.04}
              />
            </mesh>
            {/* Cabeça */}
            <mesh position={[0, 1.06, 0]} castShadow>
              <sphereGeometry args={[0.2, 14, 10]} />
              <meshStandardMaterial
                color="#dcb898"
                emissive="#8a5838"
                emissiveIntensity={0.16}
                roughness={0.78}
                metalness={0.04}
              />
            </mesh>
            {/* Cabelo branco (calota) */}
            <mesh position={[0, 1.14, 0]}>
              <sphereGeometry
                args={[0.22, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.4]}
              />
              <meshStandardMaterial
                color="#ece4d4"
                emissive="#a89c84"
                emissiveIntensity={0.24}
                roughness={0.7}
                metalness={0.05}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Calçada superior — anel fino que conecta os telhados das casas. */
function RooftopWalkway() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 2.32, 0]}
      >
        <ringGeometry args={[7.5, 9.5, 64]} />
        <meshStandardMaterial
          color="#b89868"
          emissive="#6a4828"
          emissiveIntensity={0.18}
          roughness={0.88}
          metalness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
