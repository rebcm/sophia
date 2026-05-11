import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   ParSizigico — alma-gêmea original do Pleroma
   ---------------------------------------------------------
   Aparece com halo roxo-pulsante. Aparência humanoide
   ligeiramente luminosa, andrógina. Não fala muito — só está.
   Reconhecimento mútuo é a mecânica central.
   Ver docs/11-vinculos-romance-linhagem.md §3
   ========================================================= */

interface ParSizigicoProps {
  position: [number, number, number];
  /** Quando true, jogador já reconheceu o par — aura intensa. */
  recognized?: boolean;
  /** Faz a figura olhar levemente em direção ao jogador. */
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function ParSizigico({
  position,
  recognized = false,
  playerRef,
}: ParSizigicoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const innerHaloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Levita muito suavemente
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.06;

    // Olha em direção ao jogador (yaw)
    if (playerRef?.current) {
      const dx = playerRef.current.position.x - groupRef.current.position.x;
      const dz = playerRef.current.position.z - groupRef.current.position.z;
      const target = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        target,
        0.04,
      );
    }

    // Aura roxo-pulsante (assinatura inconfundível)
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = recognized
        ? 0.6 + Math.sin(t * 0.9) * 0.18
        : 0.4 + Math.sin(t * 1.4) * 0.15;
    }
    if (innerHaloRef.current) {
      const m = innerHaloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = recognized
        ? 0.85 + Math.sin(t * 0.8) * 0.1
        : 0.65 + Math.sin(t * 1.4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Corpo etérico */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.26, 0.34, 1.6, 14]} />
        <meshStandardMaterial
          color="#e0c8f0"
          emissive="#a878d8"
          emissiveIntensity={0.45}
          roughness={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Cabeça */}
      <mesh castShadow position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.28, 18, 14]} />
        <meshStandardMaterial
          color="#f0d8f8"
          emissive="#a878d8"
          emissiveIntensity={0.35}
          roughness={0.5}
        />
      </mesh>

      {/* Halo externo roxo-pulsante */}
      <mesh ref={haloRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial
          color="#c89aff"
          transparent
          opacity={0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Halo interno mais denso */}
      <mesh ref={innerHaloRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.8, 20, 20]} />
        <meshBasicMaterial
          color="#e8b8ff"
          transparent
          opacity={0.7}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Luz pessoal — sempre presente */}
      <pointLight
        color="#c89aff"
        intensity={recognized ? 2.0 : 1.3}
        distance={6}
        decay={2}
      />
    </group>
  );
}
