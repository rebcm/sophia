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
import { RuinaYonaguni } from "../world/RuinaYonaguni";

/* =========================================================
   YonaguniScene — Sprint 81 · A Cidade Submersa do Pacífico
   ---------------------------------------------------------
   NÃO houve pecado em Yonaguni. O mar simplesmente subiu.
   A cidade está aqui aguardando reconhecimento — não salvação.

   O jogador NÃO entra. Permanece numa plataforma rochosa
   elevada que serve de mirante. Há uma silhueta-câmera
   indicando o ponto ideal de contemplação. Um timer corre
   automaticamente enquanto o jogador estiver perto desse
   ponto. Aos 30s: revelado (RuinaYonaguni passa a brilhar).

   Geografia:
   - Plataforma rochosa elevada (mirante) no nível +0.2y
   - Mar/oceano horizontal: plano grande azul-escuro
     parcialmente translúcido em y ≈ -0.1
   - Ruínas Yonaguni VISÍVEIS sob o plano-oceano (y ≈ -2.5)
   - 30-40 bolhas subindo do fundo
   - 5-6 peixes-luminescentes em silhueta
   - Skybox crepúsculo violeta-azul-mar

   Ver docs/22-civilizacoes-expandidas.md §4.11
   ========================================================= */

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface YonaguniSceneProps {
  /** true após 30s de contemplação — ruínas brilham. */
  revealed: boolean;
  /** Progresso da contemplação 0..1 (para HUD externo opcional). */
  contemplationProgress: number;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function YonaguniScene({
  revealed,
  contemplationProgress,
  onReturnToMar,
  onPlayerRef,
}: YonaguniSceneProps) {
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
      camera={{ fov: 60, near: 0.1, far: 320, position: [0, 4.5, 12] }}
    >
      {/* Crepúsculo violeta-azul-mar */}
      <color attach="background" args={[revealed ? "#1a2848" : "#101a30"]} />
      <fog
        attach="fog"
        args={[revealed ? "#1a2848" : "#101a30", 18, 80]}
      />

      <ambientLight color={revealed ? "#5070a8" : "#304060"} intensity={0.55} />

      {/* Luz crepuscular alta */}
      <directionalLight
        position={[8, 16, 6]}
        intensity={0.55}
        color={revealed ? "#a8a0e8" : "#7a80b0"}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* Brilho mar-fundo sutil */}
      <pointLight
        position={[0, -4, 0]}
        intensity={revealed ? 0.9 : 0.3}
        distance={30}
        color={revealed ? "#ffd078" : "#3050a0"}
        decay={2}
      />

      <MiranteRochoso />
      <Ocean />
      <RuinaYonaguni position={[0, -2.5, -8]} revealed={revealed} />
      <Bubbles />
      <LuminousFish />
      <ContemplationMarker
        position={[0, 1.4, -2]}
        progress={contemplationProgress}
        revealed={revealed}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            revealed
              ? "(o que o mar cobriu ainda lembra)"
              : "(voltar)"
          }
          color="#a0b8e0"
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
        <Bloom intensity={0.95} luminanceThreshold={0.35} mipmapBlur />
        <Vignette eskil={false} darkness={0.78} offset={0.28} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Plataforma rochosa elevada — mirante onde o jogador permanece.
    Forma irregular feita de blocos baixos para parecer rocha viva. */
function MiranteRochoso() {
  const blocks = useMemo(
    () => [
      { x: 0, z: 0, w: 8, d: 6, h: 0.5, y: 0.0 },
      { x: -3.5, z: -1.5, w: 3, d: 2.5, h: 0.7, y: 0.05 },
      { x: 3.2, z: 1.8, w: 2.8, d: 2.2, h: 0.65, y: 0.05 },
      { x: -1.8, z: 2.4, w: 2.5, d: 1.8, h: 0.4, y: 0.0 },
      { x: 2.4, z: -2.2, w: 2.2, d: 1.6, h: 0.5, y: 0.05 },
    ],
    [],
  );

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh
          key={i}
          position={[b.x, b.y, b.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color="#3a4458"
            emissive="#0c1422"
            emissiveIntensity={0.14}
            roughness={0.95}
            metalness={0.1}
          />
        </mesh>
      ))}
      {/* Borda emissiva sutil ao redor do mirante — guia visual */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.32, 0]}
      >
        <ringGeometry args={[3.8, 4.0, 48]} />
        <meshBasicMaterial
          color="#88a0d0"
          transparent
          opacity={0.22}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Mar/oceano — plano grande horizontal, levemente translúcido,
    com ondulação muito suave para sugerir profundidade.
    Posicionado em y = -0.1 para passar BAIXO do mirante e ALTO
    das ruínas (que estão em y ≈ -2.5..-3.5). */
function Ocean() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.12 + Math.sin(t * 0.3) * 0.04;
  });

  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, -10]}
    >
      <planeGeometry args={[80, 80, 24, 24]} />
      <meshStandardMaterial
        color="#0a1830"
        emissive="#1a3868"
        emissiveIntensity={0.12}
        roughness={0.2}
        metalness={0.7}
        transparent
        opacity={0.78}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** 35 bolhas subindo lentamente do fundo até a superfície.
    Reciclam ao chegar perto da superfície. */
function Bubbles() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 35;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: -8 + Math.random() * 16,
      y: -3.5 + Math.random() * 3,
      z: -14 + Math.random() * 10,
      speed: 0.15 + Math.random() * 0.25,
      size: 0.04 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      child.position.y += d.speed * 0.016;
      // Pequeno wobble horizontal
      child.position.x = d.x + Math.sin(t * 0.8 + d.phase) * 0.1;
      if (child.position.y > -0.3) {
        child.position.y = -3.5;
      }
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 2 + d.phase) * 0.18;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[d.size, 8, 6]} />
          <meshBasicMaterial
            color="#dde8ff"
            transparent
            opacity={0.6}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 6 peixes-luminescentes — pequenas esferas alongadas que viajam
    em trajetórias circulares lentas sob a água. */
function LuminousFish() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 6;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      radius: 4 + Math.random() * 3,
      yBase: -2.0 - Math.random() * 1.2,
      speed: 0.18 + Math.random() * 0.12,
      phase: i * (Math.PI * 2 / COUNT) + Math.random() * 0.4,
      tint: i % 2 === 0 ? "#a8d4ff" : "#d0b8ff",
      size: 0.1 + Math.random() * 0.08,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const angle = d.phase + t * d.speed;
      child.position.x = Math.cos(angle) * d.radius;
      child.position.z = -8 + Math.sin(angle) * d.radius;
      child.position.y = d.yBase + Math.sin(t * 0.6 + d.phase) * 0.18;
      // Aponta no sentido do movimento (eixo Y do mundo)
      child.rotation.y = -angle + Math.PI / 2;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[0, d.yBase, -8]}>
          <sphereGeometry args={[d.size, 8, 6]} />
          <meshBasicMaterial color={d.tint} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Marcador do ponto ideal de contemplação. Anel suspenso no ar
    com um pequeno preenchimento radial que avança com o progresso. */
function ContemplationMarker({
  position,
  progress,
  revealed,
}: {
  position: [number, number, number];
  progress: number;
  revealed: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const fillRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      const targetOp = revealed ? 0.4 : 0.55 + Math.sin(t * 1.5) * 0.1;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOp, 0.04);
      ringRef.current.rotation.z = t * 0.3;
    }
    if (fillRef.current) {
      // Scale do disco interno acompanha o progresso
      const s = THREE.MathUtils.clamp(progress, 0, 1);
      fillRef.current.scale.setScalar(0.05 + s * 0.95);
      const mat = fillRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = revealed ? 0.5 + Math.sin(t * 0.8) * 0.12 : 0.35 + s * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Anel guia */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.62, 36]} />
        <meshBasicMaterial
          color={revealed ? "#ffd078" : "#a8c0f0"}
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Disco interno que cresce com progresso */}
      <mesh ref={fillRef} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 30]} />
        <meshBasicMaterial
          color={revealed ? "#ffd078" : "#a8c0f0"}
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Luz quente discreta */}
      <pointLight
        intensity={revealed ? 0.6 : 0.25}
        distance={4}
        color={revealed ? "#ffd078" : "#a8c0f0"}
        decay={2}
      />
    </group>
  );
}
