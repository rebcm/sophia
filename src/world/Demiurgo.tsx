import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Demiurgo — o filho cego de Sophia, criador deste mundo
   ---------------------------------------------------------
   Não é vilão. É criança cósmica que não soube. Figura
   colossal sentada num trono fragmentado, com fios soltando
   filamentos para todas as direções (drenagem de Sleepers).
   Quando abraçado, dissolve em luz.
   Ver docs/04-enredo.md + docs/04f-a-grande-revelacao.md
   ========================================================= */

interface DemiurgoProps {
  position: [number, number, number];
  /** Quando true, abraçado pelo jogador — dissolve em luz. */
  embraced?: boolean;
}

export function Demiurgo({ position, embraced = false }: DemiurgoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Respiração lenta e pesada
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 0.3) * 0.02;
    }

    // Dissolução ao ser abraçado
    if (embraced) {
      groupRef.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.015);
      if (auraRef.current) {
        const m = auraRef.current.material as THREE.MeshBasicMaterial;
        m.opacity = Math.max(0, m.opacity - 0.005);
      }
    } else {
      // Aura sombria pulsante
      if (auraRef.current) {
        const m = auraRef.current.material as THREE.MeshBasicMaterial;
        m.opacity = 0.45 + Math.sin(t * 0.6) * 0.1;
      }
    }

    // Cabeça inclina-se ao ouvir o jogador chegar
    if (headRef.current) {
      const target = embraced ? 0.5 : 0.18;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.02,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Trono fragmentado */}
      <mesh position={[0, 1.5, -1.2]} castShadow>
        <boxGeometry args={[7, 3, 2.2]} />
        <meshStandardMaterial
          color="#2a2030"
          emissive="#1a0e22"
          emissiveIntensity={0.3}
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      {/* Corpo colossal sentado */}
      <mesh ref={bodyRef} castShadow position={[0, 4, 0]}>
        <cylinderGeometry args={[1.4, 2.0, 5.0, 20]} />
        <meshStandardMaterial
          color="#3a2840"
          emissive="#5a3a78"
          emissiveIntensity={0.4}
          roughness={0.75}
          metalness={0.3}
        />
      </mesh>

      {/* Cabeça massiva */}
      <mesh ref={headRef} castShadow position={[0, 7.2, 0]}>
        <sphereGeometry args={[1.3, 24, 18]} />
        <meshStandardMaterial
          color="#42305a"
          emissive="#6a4a8a"
          emissiveIntensity={0.5}
          roughness={0.65}
          metalness={0.25}
        />
      </mesh>

      {/* Olhos (dois pontos de luz fraca) */}
      <mesh position={[0.45, 7.4, 1.15]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial
          color={embraced ? "#ffd45a" : "#8870a0"}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.45, 7.4, 1.15]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial
          color={embraced ? "#ffd45a" : "#8870a0"}
          toneMapped={false}
        />
      </mesh>

      {/* Coroa rachada */}
      <mesh position={[0, 8.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.15, 10, 24, Math.PI * 1.6]} />
        <meshStandardMaterial
          color="#8a4a30"
          emissive="#5a2818"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>

      {/* Aura sombria envolvendo o trono */}
      <mesh ref={auraRef} position={[0, 4, 0]}>
        <sphereGeometry args={[5.5, 24, 24]} />
        <meshBasicMaterial
          color="#5a3aa0"
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>

      {/* Luz forte interna */}
      {!embraced && (
        <pointLight
          position={[0, 5, 0]}
          intensity={2.5}
          distance={20}
          color="#a878d8"
          decay={2}
        />
      )}
      {embraced && (
        <pointLight
          position={[0, 5, 0]}
          intensity={4.5}
          distance={30}
          color="#fff5d8"
          decay={2}
        />
      )}
    </group>
  );
}
