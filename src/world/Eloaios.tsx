import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Eloaios — A Lei (4º Arconte adormecido)
   ---------------------------------------------------------
   Figura sentada num trono de cristal levitando sobre o
   afundamento. Veste robe azul-céu com símbolos geométricos.
   Segura uma tábua cristalina nas mãos — a Lei rígida.
   Quando desperta, a tábua amolece e vira água que flui.
   Ver docs/02d-civilizacoes-perdidas.md §6
   ========================================================= */

interface EloaiosProps {
  position: [number, number, number];
  awakened?: boolean;
}

export function Eloaios({ position, awakened = false }: EloaiosProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tabletRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Levita suavemente
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.08;

    // Tábua: rígida (cristal) → amolece após despertar
    if (tabletRef.current) {
      const m = tabletRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = awakened
        ? 0.2 + Math.sin(t * 0.7) * 0.05
        : 0.5 + Math.sin(t * 1.1) * 0.1;
      tabletRef.current.scale.y = awakened
        ? 0.7 + Math.sin(t * 0.6) * 0.05
        : 1.0;
    }

    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = awakened ? Math.max(0.1, m.opacity - 0.005) : 0.4;
    }

    if (headRef.current) {
      const targetY = awakened ? 0.4 : 0;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetY,
        0.03,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Trono de cristal */}
      <mesh castShadow position={[0, 0.5, -0.4]}>
        <boxGeometry args={[1.6, 1.0, 1.2]} />
        <meshStandardMaterial
          color="#c8e0f0"
          emissive="#88b8d8"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Robe (corpo sentado) */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.4, 0.55, 1.4, 16]} />
        <meshStandardMaterial
          color="#a8c8e8"
          emissive="#6890b8"
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Tábua da Lei */}
      <mesh ref={tabletRef} position={[0, 1.45, 0.55]}>
        <boxGeometry args={[0.7, 0.85, 0.08]} />
        <meshStandardMaterial
          color="#dde8f8"
          emissive="#88c0e8"
          emissiveIntensity={0.5}
          roughness={0.05}
          metalness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} castShadow position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.3, 18, 14]} />
        <meshStandardMaterial
          color="#dde8f8"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Coroa-anel geométrica */}
      <mesh position={[0, 2.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.04, 8, 24]} />
        <meshStandardMaterial
          color="#fff5d8"
          emissive="#ffd45a"
          emissiveIntensity={awakened ? 0.2 : 0.7}
          metalness={1.0}
          roughness={0.2}
        />
      </mesh>

      {/* Aura geométrica (octógono em chão) */}
      <mesh ref={auraRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.6, 8]} />
        <meshBasicMaterial
          color="#88c0e8"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {!awakened && (
        <pointLight
          position={[0, 1.8, 0]}
          intensity={1.0}
          distance={6}
          color="#88c0e8"
          decay={2}
        />
      )}
    </group>
  );
}
