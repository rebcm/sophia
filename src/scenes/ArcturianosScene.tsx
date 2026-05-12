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
import { GuiaArcturiano } from "../world/GuiaArcturiano";
import { Portal } from "../world/Portal";

/* =========================================================
   ArcturianosScene — As Doze Casas-do-Trânsito
   ---------------------------------------------------------
   Versão "alta" do Bardo — espaço-de-luz, claro-azulado.
   12 Guias Arcturianos (Anjos Querubins) em círculo, cada
   um responsável por uma Casa-do-Trânsito (estrutura cris-
   talina pequena atrás). 3-4 silhuetas etéreas (almas em
   trânsito, sem rosto) flutuam entre as Casas.
   O Líder (posição 0) é o aproximável.

   Restrição: só acessível após pelo menos 1 reencarnação.
   Se !canEnter, escurece a cena e flutua um aviso ao centro.
   Ver docs/22-civilizacoes-expandidas.md §3.3
   ========================================================= */

const GUIDE_COUNT = 12;
const GUIDE_RADIUS = 10;
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 15];

interface ArcturianosSceneProps {
  guiaAwakened: boolean;
  canEnter: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function ArcturianosScene({
  guiaAwakened,
  canEnter,
  onReturnToMar,
  onPlayerRef,
}: ArcturianosSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  // Posições dos 12 guias em círculo. Líder (índice 0) à frente
  const guides = useMemo(() => {
    const out: { pos: [number, number, number]; angle: number }[] = [];
    for (let i = 0; i < GUIDE_COUNT; i++) {
      const angle = (i / GUIDE_COUNT) * Math.PI * 2 - Math.PI / 2;
      out.push({
        pos: [
          Math.cos(angle) * GUIDE_RADIUS,
          0.1,
          Math.sin(angle) * GUIDE_RADIUS,
        ],
        angle,
      });
    }
    return out;
  }, []);

  const leaderTarget = useMemo(
    () => new THREE.Vector3(guides[0].pos[0], 0, guides[0].pos[2]),
    [guides],
  );

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
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 4, 16] }}
    >
      {/* Skybox azul-prata claro — mais claro que o Bardo padrão */}
      <color
        attach="background"
        args={[canEnter ? "#c4d8ec" : "#1a2438"]}
      />
      <fog
        attach="fog"
        args={[canEnter ? "#d8e8f4" : "#0e1828", 18, 80]}
      />

      <ambientLight
        color={canEnter ? "#e8f0ff" : "#3a4868"}
        intensity={canEnter ? 0.85 : 0.4}
      />

      {/* "Sol" alto — azul-turquesa */}
      <pointLight
        position={[0, 20, 0]}
        intensity={canEnter ? 1.8 : 0.6}
        distance={50}
        color={canEnter ? "#e0f0ff" : "#5070a0"}
        decay={2}
      />

      <directionalLight
        position={[6, 18, 4]}
        intensity={canEnter ? 0.7 : 0.2}
        color="#d8e8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      <LuminousFloor canEnter={canEnter} />
      <CentralRing />

      {/* 12 guias arcturianos + 12 casas-do-trânsito */}
      {guides.map((g, i) => (
        <group key={`guide-${i}`} position={g.pos} rotation={[0, -g.angle + Math.PI / 2, 0]}>
          {/* Cada guia */}
          <GuiaArcturiano
            position={[0, 0, 0]}
            isLeader={i === 0}
            playerRef={playerRef}
            awakened={i === 0 && guiaAwakened}
          />
          {/* Casa-do-Trânsito atrás do guia — estrutura cristalina low-poly */}
          <CasaDoTransito leader={i === 0} />
        </group>
      ))}

      {/* Almas em trânsito flutuando entre os guias */}
      <AlmasEmTransito />

      {/* Player — só faz sentido se canEnter, mas mantemos para o portal */}
      <Player
        externalRef={playerRef}
        awakenTarget={leaderTarget}
        awakenDistance={3.4}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Aviso 3D se não pode entrar — escurecimento + mensagem flutuante */}
      {!canEnter && <NotYetVeil />}

      {/* Portal de retorno ao Mar de Cristal */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            guiaAwakened
              ? "(ninguém atravessa sozinho)"
              : "(voltar)"
          }
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
        <Bloom intensity={1.4} luminanceThreshold={0.3} mipmapBlur />
        <Vignette eskil={false} darkness={0.6} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

/** Chão luminoso — quase translúcido, azul-prata claro */
function LuminousFloor({ canEnter }: { canEnter: boolean }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[40, 64]} />
      <meshStandardMaterial
        color={canEnter ? "#c0d8f0" : "#1a2840"}
        emissive={canEnter ? "#8aa8d8" : "#0a1428"}
        emissiveIntensity={canEnter ? 0.3 : 0.1}
        roughness={0.5}
        metalness={0.6}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

/** Anel central — onde as almas dançam */
function CentralRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    const m = ringRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.4 + Math.sin(t * 0.5) * 0.1;
  });
  return (
    <mesh
      ref={ringRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.02, 0]}
    >
      <ringGeometry args={[1.6, 2.0, 64]} />
      <meshStandardMaterial
        color="#e0f0ff"
        emissive="#90c0e8"
        emissiveIntensity={0.45}
        roughness={0.25}
        metalness={0.85}
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Casa-do-Trânsito — estrutura cristalina low-poly atrás do guia */
function CasaDoTransito({ leader }: { leader: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.06;
  });
  return (
    <group position={[0, 0, -2.6]}>
      {/* Base — pequeno disco */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.85, 1.0, 0.12, 12]} />
        <meshStandardMaterial
          color={leader ? "#7090c0" : "#3a5880"}
          emissive={leader ? "#1a4878" : "#0a2848"}
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.45}
        />
      </mesh>
      {/* Cristal central — octaedro alongado, rotaciona */}
      <mesh ref={meshRef} position={[0, 1.3, 0]} castShadow>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color={leader ? "#a8e0ff" : "#5080b0"}
          emissive={leader ? "#3a90c8" : "#1a4878"}
          emissiveIntensity={leader ? 0.65 : 0.4}
          roughness={0.25}
          metalness={0.85}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* Quatro pequenos pilares ao redor — paredes simbólicas */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh
            key={`wall-${i}`}
            position={[Math.cos(a) * 0.7, 0.6, Math.sin(a) * 0.7]}
            castShadow
          >
            <cylinderGeometry args={[0.06, 0.06, 1.2, 6]} />
            <meshStandardMaterial
              color={leader ? "#9ac8e8" : "#4a7090"}
              emissive={leader ? "#3878a8" : "#1a4868"}
              emissiveIntensity={0.4}
              roughness={0.4}
              metalness={0.75}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Almas em trânsito — 4 silhuetas etéreas sem rosto, flutuam entre os guias */
function AlmasEmTransito() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 4;
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        baseAngle: (i / COUNT) * Math.PI * 2,
        radius: 5.5 + (i % 2) * 1.2,
        ySeed: i * 0.7,
        speed: 0.12 + (i % 3) * 0.04,
      })),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      const angle = s.baseAngle + t * s.speed;
      child.position.x = Math.cos(angle) * s.radius;
      child.position.z = Math.sin(angle) * s.radius;
      child.position.y = 1.2 + Math.sin(t * 0.6 + s.ySeed) * 0.4;
      // Opacidade pulsante — etérea
      const body = (child as THREE.Group).children[0] as
        | THREE.Mesh
        | undefined;
      if (body) {
        const m = body.material as THREE.MeshBasicMaterial;
        m.opacity = 0.32 + Math.sin(t * 0.8 + s.ySeed) * 0.1;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {seeds.map((_, i) => (
        <group key={`alma-${i}`}>
          {/* Corpo — cápsula alongada, sem rosto */}
          <mesh>
            <capsuleGeometry args={[0.16, 0.7, 6, 12]} />
            <meshBasicMaterial
              color="#e0eaff"
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
          {/* Halo ao redor */}
          <mesh>
            <sphereGeometry args={[0.45, 12, 10]} />
            <meshBasicMaterial
              color="#a8c8e8"
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Véu de "ainda não" — escurece quando o jogador chega sem ter morrido */
function NotYetVeil() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.55 + Math.sin(t * 0.4) * 0.06;
  });
  return (
    <group position={[0, 3.2, 0]}>
      {/* Esfera escurecedora central */}
      <mesh ref={ref}>
        <sphereGeometry args={[1.8, 24, 18]} />
        <meshBasicMaterial
          color="#08101c"
          transparent
          opacity={0.6}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Pequenas estrelas-aviso pulsando — substitui texto 3D */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={`warn-${i}`}
            position={[Math.cos(a) * 1.0, Math.sin(a) * 0.4, 0]}
          >
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#aac4f0" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}
