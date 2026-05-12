import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Sacerdotisa Pleiadiana — Anjo-Curador das Sete Estrelas
   ---------------------------------------------------------
   Figura feminina alta, cabelo prata-azulado longo, vestes
   que parecem feitas de plasma estelar — material cuja cor
   pulsa entre prata, azul e violeta. Não fala palavras
   audíveis: cura por presença. Os Pleiadianos (Anjos
   Curadores) encarnaram massivamente entre 1960 e o presente
   para auxiliar a humanidade a lembrar de si.
   Ver docs/22-civilizacoes-expandidas.md §3.1
   ========================================================= */

interface SacerdotisaPleiadianaProps {
  position: [number, number, number];
  awakened?: boolean;
  /** Opcional: ref do jogador, para intensificar a aura por proximidade. */
  playerRef?: React.RefObject<THREE.Group | null>;
}

/** 3 cores que o manto-plasma percorre: prata → azul → violeta. */
const MANTO_PALETTE = [
  new THREE.Color("#d8dcf0"), // prata
  new THREE.Color("#6a90d8"), // azul estelar
  new THREE.Color("#a880e8"), // violeta
];
const MANTO_EMISSIVE = [
  new THREE.Color("#8a90b8"),
  new THREE.Color("#3a5aa0"),
  new THREE.Color("#6a48b0"),
];

export function SacerdotisaPleiadiana({
  position,
  awakened = false,
  playerRef,
}: SacerdotisaPleiadianaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mantoRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);

  const selfPos = useRef(new THREE.Vector3(...position));
  const cTemp = useRef(new THREE.Color());
  const cTempE = useRef(new THREE.Color());

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Flutuação muito leve — anjo apoia, não pisa
    groupRef.current.position.y = position[1] + Math.sin(t * 0.45) * 0.05;

    // Proximidade do jogador
    let proximity = 0;
    if (playerRef?.current) {
      const dist = playerRef.current.position.distanceTo(selfPos.current);
      proximity = Math.min(1, Math.max(0, (dist - 2.5) / 10));
    } else {
      proximity = 0.6;
    }
    const closeness = 1 - proximity;

    // Manto-plasma — interpola entre as 3 cores ciclicamente
    if (mantoRef.current) {
      const cycle = (t * 0.18) % 1; // 0..1 muito lento
      const phase = cycle * MANTO_PALETTE.length;
      const i = Math.floor(phase) % MANTO_PALETTE.length;
      const j = (i + 1) % MANTO_PALETTE.length;
      const k = phase - Math.floor(phase);
      cTemp.current.copy(MANTO_PALETTE[i]).lerp(MANTO_PALETTE[j], k);
      cTempE.current.copy(MANTO_EMISSIVE[i]).lerp(MANTO_EMISSIVE[j], k);

      const m = mantoRef.current.material as THREE.MeshStandardMaterial;
      m.color.copy(cTemp.current);
      m.emissive.copy(cTempE.current);
      m.emissiveIntensity =
        (awakened ? 0.55 : 0.4) + Math.sin(t * 0.5) * 0.08;
    }

    // Aura grande, etérea, cintilante
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = awakened ? 0.2 : 0.28;
      m.opacity =
        base + closeness * 0.22 + Math.sin(t * 0.9) * 0.05;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.5) * 0.05 + closeness * 0.1,
      );
      // Cor da aura acompanha o manto, mais clarinho
      m.color.copy(cTemp.current).lerp(new THREE.Color("#ffffff"), 0.35);
    }

    // Halo externo
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        0.08 + closeness * 0.1 + Math.sin(t * 0.4 + 1.0) * 0.025;
    }

    // Cabeça quase imóvel — uma compaixão observando
    if (headRef.current) {
      const target = awakened ? -0.05 : 0.05;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.02,
      );
    }

    // Cabelo cintila levemente (emissive pulsando)
    if (hairRef.current) {
      const m = hairRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.32 + Math.sin(t * 0.7) * 0.08;
    }

    // Coração — selo curador respira
    if (chestRef.current) {
      const m = chestRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.7 : 0.5) + Math.sin(t * 0.6 + 0.5) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base — discreta vibração sob os pés */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.85, 32]} />
        <meshBasicMaterial
          color="#c0c8f0"
          transparent
          opacity={0.32}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Manto-plasma — alongado, cai até quase o chão. Cor pulsa */}
      <mesh ref={mantoRef} position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.58, 2.2, 16]} />
        <meshStandardMaterial
          color="#d8dcf0"
          emissive="#3a5aa0"
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.35}
        />
      </mesh>

      {/* Detalhe — gola e ombro, prata brilhante constante */}
      <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.045, 8, 24]} />
        <meshStandardMaterial
          color="#e0e4f5"
          emissive="#a8b4d8"
          emissiveIntensity={0.55}
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>

      {/* Pescoço/colar */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.18, 10]} />
        <meshStandardMaterial
          color="#e8eaf8"
          emissive="#7888b8"
          emissiveIntensity={0.3}
          roughness={0.55}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 2.7, 0]} castShadow>
        <sphereGeometry args={[0.28, 18, 14]} />
        <meshStandardMaterial
          color="#f4ecdc"
          emissive="#5a4830"
          emissiveIntensity={0.18}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Cabelo — cilindro pequeno prata-azulado caindo das costas */}
      <mesh
        ref={hairRef}
        position={[0, 2.35, -0.18]}
        castShadow
      >
        <cylinderGeometry args={[0.22, 0.18, 1.05, 12]} />
        <meshStandardMaterial
          color="#c8d0e8"
          emissive="#5a6ca0"
          emissiveIntensity={0.32}
          roughness={0.5}
          metalness={0.55}
        />
      </mesh>

      {/* Selo curador no peito — coração de luz */}
      <mesh ref={chestRef} position={[0, 1.7, 0.42]}>
        <circleGeometry args={[0.16, 24]} />
        <meshStandardMaterial
          color="#fff6e8"
          emissive="#ffc4d0"
          emissiveIntensity={0.7}
          roughness={0.4}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mãos abertas em gesto de oferta — duas pequenas esferas */}
      {[-0.5, 0.5].map((dx, i) => (
        <mesh
          key={`hand-${i}`}
          position={[dx, 1.05, 0.32]}
          castShadow
        >
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial
            color="#f0e6d4"
            emissive="#a888c8"
            emissiveIntensity={0.45}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* Aura grande — cintilante */}
      <mesh ref={auraRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[2.0, 28, 24]} />
        <meshBasicMaterial
          color="#c0c8f0"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — bem suave */}
      <mesh ref={haloRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[3.2, 20, 18]} />
        <meshBasicMaterial
          color="#a8b4f0"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Halo planar sobre a cabeça — sutil disco cintilante */}
      <mesh position={[0, 3.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.46, 32]} />
        <meshBasicMaterial
          color="#e8e0ff"
          transparent
          opacity={0.55}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Luz pessoal — prata-violeta */}
      <pointLight
        position={[0, 2.2, 0]}
        intensity={awakened ? 1.8 : 1.2}
        distance={11}
        color={awakened ? "#e0d8ff" : "#b8c4f0"}
        decay={2}
      />
    </group>
  );
}
