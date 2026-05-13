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
import { BibliotecarioAndromedano } from "../world/BibliotecarioAndromedano";
import { Portal } from "../world/Portal";

/* =========================================================
   AndromedanosScene — A Biblioteca da Origem
   ---------------------------------------------------------
   Caverna-galáxia: skybox quase preto com nebulosa-galáxia
   sutil ao fundo (gradiente violeta-azul). 300 "livros-estrela"
   voando lentamente em órbitas elípticas como esferinhas
   brancas. No centro, um pedestal cristalino octogonal sobre
   o qual está o Bibliotecário-de-Andrômeda. Ao redor dele,
   8 grandes "tomos" (planos quadrados brancos com texto-
   glifo emissivo) flutuando em órbita média. Bloom forte
   para que as estrelas-livro pareçam luz pura.
   Ver docs/22-civilizacoes-expandidas.md §3.4
   ========================================================= */

const BIBLIOTECARIO_POS: [number, number, number] = [0, 0.85, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 16];

interface AndromedanosSceneProps {
  bibliotecarioAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function AndromedanosScene({
  bibliotecarioAwakened,
  onReturnToMar,
  onPlayerRef,
}: AndromedanosSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const bibTarget = useMemo(
    () => new THREE.Vector3(BIBLIOTECARIO_POS[0], 0, BIBLIOTECARIO_POS[2]),
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
      camera={{ fov: 60, near: 0.1, far: 900, position: [0, 4.2, 16] }}
    >
      {/* Skybox quase-preto */}
      <color attach="background" args={["#040218"]} />
      <fog attach="fog" args={["#080424", 24, 110]} />

      {/* Ambiente bem fraco — a cor vem dos tomos e estrelas */}
      <ambientLight color="#1c1430" intensity={0.4} />

      {/* Luz central sobre o pedestal */}
      <pointLight
        position={[0, 8, 0]}
        intensity={bibliotecarioAwakened ? 1.7 : 1.2}
        distance={22}
        color="#e0d8ff"
        decay={2}
      />

      <NebulaBackdrop />
      <BookStars />
      <OctagonalPedestal />
      <FloatingTomes awakened={bibliotecarioAwakened} />

      {/* Bibliotecário no centro, sobre o pedestal */}
      <BibliotecarioAndromedano
        position={BIBLIOTECARIO_POS}
        awakened={bibliotecarioAwakened}
        playerRef={playerRef}
      />

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={bibTarget}
        awakenDistance={3.4}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de retorno ao Mar de Cristal */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            bibliotecarioAwakened
              ? "(esquecer é guardar com cuidado)"
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
        <Bloom intensity={1.6} luminanceThreshold={0.18} mipmapBlur />
        <Vignette eskil={false} darkness={0.86} offset={0.22} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

/** Nebulosa-galáxia ao fundo — duas esferas grandes translúcidas
 *  cruzadas em violeta-azul, com leve rotação lentíssima.   */
function NebulaBackdrop() {
  const refA = useRef<THREE.Mesh>(null);
  const refB = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (refA.current) refA.current.rotation.y = t * 0.012;
    if (refB.current) refB.current.rotation.y = -t * 0.008;
  });
  return (
    <group>
      {/* Camada A — violeta profundo */}
      <mesh ref={refA} position={[0, 6, -40]}>
        <sphereGeometry args={[60, 24, 18]} />
        <meshBasicMaterial
          color="#3a1c70"
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Camada B — azul-índigo */}
      <mesh ref={refB} position={[6, 4, -36]}>
        <sphereGeometry args={[52, 22, 16]} />
        <meshBasicMaterial
          color="#1a2c80"
          transparent
          opacity={0.1}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Halo cintilante atrás do pedestal — "núcleo da galáxia" */}
      <mesh position={[0, 4, -22]}>
        <sphereGeometry args={[7, 18, 14]} />
        <meshBasicMaterial
          color="#9080e0"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Pedestal cristalino octogonal sob o Bibliotecário */
function OctagonalPedestal() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    const m = ringRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.4 + Math.sin(t * 0.42) * 0.1;
  });
  return (
    <group>
      {/* Base octogonal — cilindro de 8 lados */}
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.7, 1.95, 0.8, 8]} />
        <meshStandardMaterial
          color="#a8a0e0"
          emissive="#4a3878"
          emissiveIntensity={0.32}
          roughness={0.4}
          metalness={0.6}
          flatShading
        />
      </mesh>
      {/* Topo do pedestal — disco mais claro */}
      <mesh position={[0, 0.82, 0]} receiveShadow>
        <cylinderGeometry args={[1.65, 1.7, 0.05, 8]} />
        <meshStandardMaterial
          color="#e0d8f4"
          emissive="#a09cdc"
          emissiveIntensity={0.45}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* Anel emissivo na borda — pulsa */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.86, 0]}
      >
        <ringGeometry args={[1.66, 1.95, 8]} />
        <meshStandardMaterial
          color="#e8e0ff"
          emissive="#b8a8ff"
          emissiveIntensity={0.45}
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** 8 grandes "tomos" maiores flutuando em órbita média ao redor
 *  do Bibliotecário. Planos quadrados brancos com texto-glifo
 *  emissivo (simulado pelo emissive da material). */
function FloatingTomes({ awakened }: { awakened: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const TOME_COUNT = 8;
  const tomes = useMemo(() => {
    const out: {
      baseAngle: number;
      radius: number;
      yBase: number;
      ySpeed: number;
      rotSpeed: number;
      phase: number;
    }[] = [];
    for (let i = 0; i < TOME_COUNT; i++) {
      out.push({
        baseAngle: (i / TOME_COUNT) * Math.PI * 2,
        radius: 3.6,
        yBase: 2.2 + (i % 3) * 0.65,
        ySpeed: 0.12 + (i % 3) * 0.05,
        rotSpeed: 0.06 + (i % 4) * 0.02,
        phase: (i * 0.61) % (Math.PI * 2),
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const o = tomes[i];
      const a = o.baseAngle + t * o.rotSpeed;
      child.position.x = Math.cos(a) * o.radius;
      child.position.y = o.yBase + Math.sin(t * o.ySpeed + o.phase) * 0.45;
      child.position.z = Math.sin(a) * o.radius;
      // Tomos giram suavemente, sempre mostrando uma face inclinada
      child.rotation.y = a + Math.PI / 2;
      child.rotation.z = Math.sin(t * 0.4 + o.phase) * 0.16;
      const mesh = child as THREE.Mesh;
      const m = mesh.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.9 : 0.65) + Math.sin(t * 0.8 + o.phase) * 0.25;
    });
  });

  return (
    <group ref={groupRef}>
      {tomes.map((_, i) => (
        <mesh key={`tome-${i}`} castShadow>
          <planeGeometry args={[0.8, 1.05]} />
          <meshStandardMaterial
            color="#f8f4ff"
            emissive="#a098e8"
            emissiveIntensity={0.7}
            roughness={0.4}
            metalness={0.25}
            transparent
            opacity={0.92}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 300 "livros-estrela" — esferinhas brancas pequenas em órbitas
 *  elípticas lentas. Bilhões em lore, 300 no que cabe na cena. */
function BookStars() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 300;

  const stars = useMemo(() => {
    const out: {
      a: number; // semi-eixo maior da elipse
      b: number; // semi-eixo menor
      yBase: number;
      ySpeed: number;
      yPhase: number;
      orbitAngle: number; // ângulo da elipse no plano horizontal
      orbitTilt: number; // inclinação do plano da órbita
      angularSpeed: number;
      phase: number;
      size: number;
      hueWarm: number; // 0..1: quanto puxa para amarelo
    }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const a = 6 + Math.random() * 28;
      const b = a * (0.6 + Math.random() * 0.4);
      out.push({
        a,
        b,
        yBase: 0.6 + Math.random() * 9,
        ySpeed: 0.05 + Math.random() * 0.18,
        yPhase: Math.random() * Math.PI * 2,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitTilt: (Math.random() - 0.5) * 0.4,
        angularSpeed:
          (0.04 + Math.random() * 0.1) * (Math.random() < 0.5 ? -1 : 1),
        phase: Math.random() * Math.PI * 2,
        size: 0.05 + Math.random() * 0.11,
        hueWarm: Math.random(),
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = stars[i];
      const theta = s.phase + t * s.angularSpeed;
      // Posição na elipse no plano local da órbita
      const lx = Math.cos(theta) * s.a;
      const lz = Math.sin(theta) * s.b;
      // Rotacionar pelo orbitAngle no plano horizontal
      const cs = Math.cos(s.orbitAngle);
      const sn = Math.sin(s.orbitAngle);
      const x = lx * cs - lz * sn;
      const z = lx * sn + lz * cs;
      // Inclinar levemente o plano da órbita (tilt)
      const y =
        s.yBase + lz * s.orbitTilt + Math.sin(t * s.ySpeed + s.yPhase) * 0.4;
      child.position.set(x, y, z);
    });
  });

  return (
    <group ref={groupRef}>
      {stars.map((s, i) => (
        <mesh key={`star-${i}`}>
          <sphereGeometry args={[s.size, 6, 6]} />
          <meshBasicMaterial
            color={s.hueWarm > 0.6 ? "#fff4d8" : "#e8e4ff"}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
