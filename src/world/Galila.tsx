import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Galila — A Beleza Falsificada (5º Arconte adormecido)
   ---------------------------------------------------------
   Figura feminina sentada num lótus de pétalas rosadas.
   Antes dormente, irradia beleza performática que ofusca.
   Ao despertar, baixa os olhos e a beleza real vem — a que
   faz outros se sentirem belos.
   Ver docs/02d-civilizacoes-perdidas.md §7
   ========================================================= */

interface GalilaProps {
  position: [number, number, number];
  awakened?: boolean;
}

export function Galila({ position, awakened = false }: GalilaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.06;

    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = awakened
        ? Math.max(0.15, m.opacity - 0.004)
        : 0.5 + Math.sin(t * 1.2) * 0.1;
    }
    if (headRef.current) {
      const target = awakened ? 0.3 : -0.05;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.03,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Lótus base */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55]}
            rotation={[Math.PI / 3, 0, -a]}
            castShadow
          >
            <coneGeometry args={[0.35, 0.7, 6]} />
            <meshStandardMaterial
              color="#ffc0d8"
              emissive="#d878a8"
              emissiveIntensity={0.35}
              roughness={0.5}
            />
          </mesh>
        );
      })}

      {/* Corpo sentado */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.0, 14]} />
        <meshStandardMaterial
          color="#f8d8e8"
          emissive="#c88aa8"
          emissiveIntensity={0.25}
          roughness={0.55}
        />
      </mesh>

      {/* Braços abertos para os lados */}
      <mesh position={[0.45, 1.2, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#f8d8e8" roughness={0.5} />
      </mesh>
      <mesh position={[-0.45, 1.2, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="#f8d8e8" roughness={0.5} />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} castShadow position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.26, 18, 14]} />
        <meshStandardMaterial
          color="#fce0e8"
          emissive="#d878a8"
          emissiveIntensity={0.15}
          roughness={0.5}
        />
      </mesh>

      {/* Aura performática */}
      <mesh ref={auraRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[1.6, 24, 24]} />
        <meshBasicMaterial
          color="#ffb0c8"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {!awakened && (
        <pointLight
          position={[0, 1.6, 0]}
          intensity={1.1}
          distance={6}
          color="#ffb0c8"
          decay={2}
        />
      )}
    </group>
  );
}
