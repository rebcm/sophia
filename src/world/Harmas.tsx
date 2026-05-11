import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Harmas — A Palavra Roubada (6º Arconte adormecido)
   ---------------------------------------------------------
   Forma de cristal flutuante — sem corpo definido. Em Mu,
   manifesta-se como hieroglifo vivo num plano triangular.
   Quando desperta, os hieróglifos se reorganizam em estrelas.
   ========================================================= */

interface HarmasProps {
  position: [number, number, number];
  awakened?: boolean;
}

export function Harmas({ position, awakened = false }: HarmasProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.15;
    groupRef.current.rotation.y = t * 0.15;

    if (innerRef.current) {
      const m = innerRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = awakened
        ? 0.6 + Math.sin(t * 1.2) * 0.2
        : 0.4 + Math.sin(t * 2.0) * 0.15;
    }
    if (ring1.current) ring1.current.rotation.z = t * 0.6;
    if (ring2.current) ring2.current.rotation.x = t * 0.5;
  });

  const accent = awakened ? "#fff5d8" : "#d8a0ff";

  return (
    <group ref={groupRef} position={position}>
      {/* Tetraedro central */}
      <mesh ref={innerRef}>
        <tetrahedronGeometry args={[0.7]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Núcleo brilhante */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={awakened ? 2.5 : 1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Anéis orbitais (hieróglifos cinéticos) */}
      <mesh ref={ring1}>
        <torusGeometry args={[1.0, 0.04, 8, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1.3, 0.03, 8, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        color={accent}
        intensity={awakened ? 2.0 : 1.4}
        distance={8}
        decay={2}
      />
    </group>
  );
}
