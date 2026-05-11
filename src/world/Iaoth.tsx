import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Iaoth — A Memória Roubada (7º Arconte, o mais antigo)
   ---------------------------------------------------------
   Em Pré-Adamita, manifesta-se como anel de Saturno orbitando
   uma esfera negra. Não há figura — só presença. Quando
   desperta, a esfera abre e mostra dentro: uma estrela
   recém-nascida. "Tu eras antes do tempo."
   ========================================================= */

interface IaothProps {
  position: [number, number, number];
  awakened?: boolean;
}

export function Iaoth({ position, awakened = false }: IaothProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const innerStarRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    groupRef.current.position.y = position[1] + Math.sin(t * 0.25) * 0.1;
    groupRef.current.rotation.y = t * 0.08;

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
      ringRef.current.rotation.x = Math.PI / 6;
    }

    // Core: preto → revela estrela quando desperta
    if (coreRef.current) {
      const m = coreRef.current.material as THREE.MeshStandardMaterial;
      if (awakened) {
        m.opacity = Math.max(0.05, m.opacity - 0.005);
      } else {
        m.opacity = 1;
      }
    }
    if (innerStarRef.current) {
      const m = innerStarRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = awakened ? 0.95 : 0;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Estrela recém-nascida dentro (revelada ao despertar) */}
      <mesh ref={innerStarRef}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial
          color="#fff5d8"
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/* Esfera negra (memória escondida) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial
          color="#0a0814"
          emissive="#1a0a28"
          emissiveIntensity={0.3}
          roughness={0.95}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Anel de Saturno */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.4, 1.9, 48]} />
        <meshStandardMaterial
          color="#c8b890"
          emissive="#8a7050"
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0.3}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Halo distante */}
      <mesh>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshBasicMaterial
          color={awakened ? "#fff5d8" : "#6a3aa0"}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        color={awakened ? "#fff5d8" : "#a878d8"}
        intensity={awakened ? 2.5 : 1.0}
        distance={12}
        decay={2}
      />
    </group>
  );
}
