import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

/* =========================================================
   BardoScene — espaço liminar entre vidas
   ---------------------------------------------------------
   Sem chão. Sem teto. Apenas luz dourada central + espelhos
   das eras flutuando ao redor. Ver
   docs/02-mundo.md §3 (-2 · O BARDO) e
   docs/04b-samsara-reencarnacao.md §2
   ========================================================= */

interface BardoSceneProps {
  /** Mostra os espelhos das eras (após Voz da Luz aparecer). */
  showMirrors?: boolean;
}

export function BardoScene({ showMirrors = false }: BardoSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 0, 8] }}
    >
      {/* Fundo negro absoluto translúcido (bem escuro) */}
      <color attach="background" args={["#06050a"]} />
      <fog attach="fog" args={["#000000", 12, 35]} />

      {/* Iluminação ambiente extremamente baixa */}
      <ambientLight color="#3a3050" intensity={0.2} />

      {/* Luz dourada central — a "Voz da Luz" */}
      <CentralLight />

      {/* Estrelas distantes para evitar plano de fundo "morto" */}
      <DistantStars />

      {/* Espelhos das eras (visíveis após recusar a Voz) */}
      {showMirrors && <MirrorsOfTheAges />}

      {/* Pós-processamento — bloom forte para a luz central */}
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.4} mipmapBlur />
        <Vignette eskil={false} darkness={0.85} offset={0.25} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function CentralLight() {
  const orbRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const halo2Ref = useRef<THREE.Mesh>(null);

  const goldColor = useMemo(() => new THREE.Color("#c8a24a"), []);
  const haloColor = useMemo(() => new THREE.Color("#e8d8b0"), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      const scale = 1 + Math.sin(t * 0.6) * 0.05;
      orbRef.current.scale.setScalar(scale);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.1;
      const scale = 1 + Math.sin(t * 0.4) * 0.04;
      haloRef.current.scale.setScalar(scale);
    }
    if (halo2Ref.current) {
      halo2Ref.current.rotation.z = -t * 0.07;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Orbe central */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={goldColor}
          emissive={goldColor}
          emissiveIntensity={2.5}
          roughness={0.0}
          toneMapped={false}
        />
      </mesh>

      {/* Halo grande */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 2.2, 64]} />
        <meshBasicMaterial
          color={haloColor}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Halo médio (rotação inversa) */}
      <mesh ref={halo2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.3, 64]} />
        <meshBasicMaterial
          color={haloColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Luz pontual emitindo da Voz */}
      <pointLight
        color={goldColor}
        intensity={3.5}
        distance={20}
        decay={1.5}
      />
    </group>
  );
}

function DistantStars() {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 60; i++) {
      const r = 30 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pts.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.7,
        r * Math.sin(phi) * Math.sin(theta),
      ]);
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.005;
  });

  return (
    <group ref={groupRef}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#a8b8e8" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function MirrorsOfTheAges() {
  // 6 espelhos flutuando ao redor da luz central
  const mirrors = useMemo(
    () => [
      { era: "Ratanabá", angle: 0, color: "#7a9c5a" },
      { era: "El Dorado", angle: 60, color: "#d4a830" },
      { era: "Hiperbórea", angle: 120, color: "#b8d4e8" },
      { era: "Atlântida", angle: 180, color: "#3a78b8" },
      { era: "Lemúria", angle: 240, color: "#e8a8b8" },
      { era: "Mu", angle: 300, color: "#d4a8e8" },
    ],
    [],
  );

  return (
    <group>
      {mirrors.map((m, i) => {
        const rad = (m.angle * Math.PI) / 180;
        const x = Math.cos(rad) * 5;
        const z = Math.sin(rad) * 5;
        return (
          <FloatingMirror
            key={i}
            position={[x, Math.sin(i * 1.3) * 0.5, z]}
            color={m.color}
            era={m.era}
            phase={i}
          />
        );
      })}
    </group>
  );
}

interface FloatingMirrorProps {
  position: [number, number, number];
  color: string;
  era: string;
  phase: number;
}

function FloatingMirror({ position, color, phase }: FloatingMirrorProps) {
  const ref = useRef<THREE.Mesh>(null);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + phase) * 0.2;
    ref.current.rotation.y = Math.sin(t * 0.3 + phase) * 0.3;
  });

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[1.4, 2.2]} />
      <meshStandardMaterial
        color={colorObj}
        emissive={colorObj}
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.7}
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </mesh>
  );
}

/* =========================================================
   <BardoOverlayHint /> — pequena dica diegética flutuante
   (usada em conjunto com o overlay da Voz da Luz)
   ========================================================= */

interface BardoOverlayHintProps {
  show: boolean;
  text: string;
}

export function BardoOverlayHint({ show, text }: BardoOverlayHintProps) {
  // Effect for accessibility (focus management) — placeholder
  useEffect(() => {
    if (show) {
      // Could announce to screen readers here
    }
  }, [show]);

  if (!show) return null;
  return <div className="bardo-hint">{text}</div>;
}
