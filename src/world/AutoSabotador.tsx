import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   AutoSabotador — a sombra do próprio jogador
   ---------------------------------------------------------
   Figura cinzenta de mesma silhueta que o avatar. Mira no
   jogador, mas não ataca. Sua "violência" é mimicar.

   Ver docs/03f-mapa-do-reino-humano.md §Luta 1
   Arma do jogador: silêncio + abraço de 5 segundos
   ========================================================= */

interface AutoSabotadorProps {
  position: [number, number, number];
  /** Quando true, a sombra "se entrega" — escurece e implode. */
  defeated?: boolean;
  /** Progresso do abraço (0..1) — aumenta brilho conforme se aproxima. */
  hugProgress?: number;
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function AutoSabotador({
  position,
  defeated = false,
  hugProgress = 0,
  playerRef,
}: AutoSabotadorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Olhar fixo no jogador (yaw)
    if (playerRef?.current) {
      const dx = playerRef.current.position.x - groupRef.current.position.x;
      const dz = playerRef.current.position.z - groupRef.current.position.z;
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    // Respiração discreta — sombra pulsa muito devagar
    const breath = 1 + Math.sin(t * 0.6) * 0.02;
    if (torsoRef.current) torsoRef.current.scale.y = breath;

    // Aura cinzenta → dourada conforme abraço progride
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const golden = THREE.MathUtils.lerp(0.15, 0.7, hugProgress);
      m.opacity = defeated ? 0 : golden;
      const color = new THREE.Color().lerpColors(
        new THREE.Color("#3a3a3a"),
        new THREE.Color("#ffd45a"),
        hugProgress,
      );
      m.color.copy(color);
    }

    // Quando derrotado: cabeça baixa, corpo se dissolve
    if (defeated && groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.04);
      if (headRef.current) {
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0.5,
          0.05,
        );
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Aura externa — vira dourada conforme o abraço */}
      <mesh ref={auraRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[1.3, 24, 24]} />
        <meshBasicMaterial
          color="#3a3a3a"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Corpo — cilindro alongado cinza-fumo */}
      <mesh ref={torsoRef} castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 1.6, 12]} />
        <meshStandardMaterial
          color="#2a2a30"
          roughness={0.9}
          metalness={0.0}
          emissive="#1a1a20"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cabeça — esfera levemente alongada */}
      <mesh ref={headRef} castShadow position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.32, 18, 14]} />
        <meshStandardMaterial
          color="#1c1c22"
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>

      {/* Olhos — dois pontos vazios (apenas vazio cinza) */}
      <mesh position={[0.1, 2.1, 0.27]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[-0.1, 2.1, 0.27]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
}
