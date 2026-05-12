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
import { SacerdotisaPleiadiana } from "../world/SacerdotisaPleiadiana";
import { Portal } from "../world/Portal";

/* =========================================================
   PleiadianosScene — A Sala dos Sete Pilares
   ---------------------------------------------------------
   Sala-de-cristal flutuante no espaço escuro. Sete pilares
   finos dispostos em círculo correspondem às sete estrelas
   das Plêiades (Alcione como pilar dominante). Cada pilar
   irradia uma cor de cura — o arco-íris dos chakras: raiz,
   sacro, plexo, coração, garganta, frontal, coronário.
   No centro, sobre uma plataforma cristalina, a Sacerdotisa
   Pleiadiana — Anjo-Curador de cabelo prata-azulado, vestes
   de plasma estelar.
   Ver docs/22-civilizacoes-expandidas.md §3.1
   ========================================================= */

const SACERDOTISA_POS: [number, number, number] = [0, 0.5, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

/** Sete cores de cura — espectro arco-íris dos chakras (raiz → coronário) */
const PILAR_HEALING = [
  { color: "#e84a48", emissive: "#a02020", name: "raiz" },      // vermelho
  { color: "#ff9028", emissive: "#a85010", name: "sacro" },     // laranja
  { color: "#ffd838", emissive: "#a08000", name: "plexo" },     // amarelo
  { color: "#48d870", emissive: "#1a8048", name: "coração" },   // verde
  { color: "#48b8e8", emissive: "#1860a0", name: "garganta" },  // azul
  { color: "#5860d0", emissive: "#283088", name: "frontal" },   // índigo
  { color: "#b078e0", emissive: "#683098", name: "coronário" }, // violeta
];

interface PleiadianosSceneProps {
  sacerdotisaAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function PleiadianosScene({
  sacerdotisaAwakened,
  onReturnToMar,
  onPlayerRef,
}: PleiadianosSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const sacerdotisaTarget = useMemo(
    () => new THREE.Vector3(SACERDOTISA_POS[0], 0, SACERDOTISA_POS[2]),
    [],
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
      camera={{ fov: 60, near: 0.1, far: 800, position: [0, 4, 14] }}
    >
      {/* Espaço escuro */}
      <color attach="background" args={["#02020c"]} />
      <fog attach="fog" args={["#070718", 22, 90]} />

      {/* Ambiente quase neutro — a cor vem dos pilares */}
      <ambientLight color="#1a1e2c" intensity={0.45} />

      {/* "Centro" de luz prateada sobre a Sacerdotisa */}
      <pointLight
        position={[0, 10, 0]}
        intensity={sacerdotisaAwakened ? 1.6 : 1.2}
        distance={20}
        color="#e0d8ff"
        decay={2}
      />

      <DistantStars />
      <CentralPlatform />
      <SevenPillars />

      {/* Sacerdotisa Pleiadiana — no centro */}
      <SacerdotisaPleiadiana
        position={SACERDOTISA_POS}
        awakened={sacerdotisaAwakened}
        playerRef={playerRef}
      />

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={sacerdotisaTarget}
        awakenDistance={3.2}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de retorno ao Mar de Cristal */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            sacerdotisaAwakened
              ? "(tu nos chamaste, nós viemos)"
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
        <Bloom intensity={1.3} luminanceThreshold={0.22} mipmapBlur />
        <Vignette eskil={false} darkness={0.82} offset={0.26} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

/** Plataforma cristalina central — onde a Sacerdotisa está */
function CentralPlatform() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    const m = ringRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.35 + Math.sin(t * 0.4) * 0.08;
  });
  return (
    <group>
      {/* Disco central — chão de cristal */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, 0, 0]}
      >
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial
          color="#c4ccea"
          emissive="#5a6498"
          emissiveIntensity={0.3}
          roughness={0.25}
          metalness={0.55}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Anel emissivo na borda — pulsa */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <ringGeometry args={[3.0, 3.32, 64]} />
        <meshStandardMaterial
          color="#e0e0ff"
          emissive="#a8b0ff"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Halo achatado sobre a plataforma */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[3.4, 24, 12]} />
        <meshBasicMaterial
          color="#a0aae8"
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Sete pilares finos em círculo — cada um com sua cor de cura */
function SevenPillars() {
  const groupRef = useRef<THREE.Group>(null);

  const pillars = useMemo(() => {
    const out: {
      x: number;
      z: number;
      angle: number;
      color: string;
      emissive: string;
    }[] = [];
    const COUNT = 7;
    const radius = 8;
    for (let i = 0; i < COUNT; i++) {
      // Pequeno offset para Alcione (índice 3, "coração") ficar de frente
      const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
      const heal = PILAR_HEALING[i];
      out.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        angle,
        color: heal.color,
        emissive: heal.emissive,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const phase = (i / 7) * Math.PI * 2;
      // Pulso fora-de-fase para cada pilar
      const pulse = 0.5 + Math.sin(t * 0.7 + phase) * 0.18;
      // Aura externa (último mesh do grupo de cada pilar)
      const aura = (child as THREE.Group).children.find(
        (c) => (c as THREE.Mesh).name === "pillar-aura",
      ) as THREE.Mesh | undefined;
      if (aura) {
        const m = aura.material as THREE.MeshBasicMaterial;
        m.opacity = 0.16 + pulse * 0.14;
      }
      // Corpo do pilar (primeiro mesh)
      const body = (child as THREE.Group).children.find(
        (c) => (c as THREE.Mesh).name === "pillar-body",
      ) as THREE.Mesh | undefined;
      if (body) {
        const m = body.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = 0.5 + pulse * 0.25;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {pillars.map((p, i) => (
        <group key={`pillar-${i}`} position={[p.x, 0, p.z]}>
          {/* Base do pilar — pequena */}
          <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[0.42, 0.55, 0.24, 14]} />
            <meshStandardMaterial
              color="#8088b0"
              emissive="#3a4068"
              emissiveIntensity={0.25}
              roughness={0.5}
              metalness={0.4}
            />
          </mesh>

          {/* Corpo do pilar — fino, alto, cor de cura */}
          <mesh
            name="pillar-body"
            position={[0, 3.0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.22, 0.28, 5.6, 14]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.emissive}
              emissiveIntensity={0.55}
              roughness={0.35}
              metalness={0.6}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Topo cônico cintilante */}
          <mesh position={[0, 6.0, 0]}>
            <coneGeometry args={[0.28, 0.6, 10]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.emissive}
              emissiveIntensity={0.85}
              roughness={0.25}
              metalness={0.7}
            />
          </mesh>

          {/* Aura ao redor do pilar — coluna de luz vertical sutil */}
          <mesh name="pillar-aura" position={[0, 3.0, 0]}>
            <cylinderGeometry args={[0.7, 0.85, 6.0, 14, 1, true]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={0.22}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Luz pessoal — irradia para o centro */}
          <pointLight
            position={[0, 3.0, 0]}
            intensity={0.85}
            distance={9}
            color={p.color}
            decay={2}
          />

          {/* Estrela acima do pilar — representa a estrela das Plêiades */}
          <mesh position={[0, 6.9, 0]}>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshBasicMaterial color={p.color} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 200 estrelas distantes ao redor — espaço aberto */
function DistantStars() {
  const positions = useMemo(() => {
    return Array.from({ length: 200 }, () => {
      // Distribuir em casca esférica grande ao redor da cena
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const R = 90 + Math.random() * 60;
      return {
        x: R * Math.sin(phi) * Math.cos(theta),
        y: R * Math.cos(phi) * 0.6 + 6,
        z: R * Math.sin(phi) * Math.sin(theta),
        size: 0.12 + Math.random() * 0.4,
      };
    });
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={`star-${i}`} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color="#fff4d8" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
