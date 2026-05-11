import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Adonaios — o Guardião-Solar (3º Arconte adormecido)
   ---------------------------------------------------------
   Figura alta vestida de armadura branca, mão direita feita
   de luz solar viva. Em Hiperbórea, prende a Raiva (coragem
   sagrada) nas masmorras sob o templo. Acorda quando alguém
   o ensina que defender o frágil não é o mesmo que conquistar
   outros.
   Ver docs/02d-civilizacoes-perdidas.md §5
   ========================================================= */

interface AdonaiosProps {
  position: [number, number, number];
  awakened?: boolean;
}

export function Adonaios({ position, awakened = false }: AdonaiosProps) {
  const groupRef = useRef<THREE.Group>(null);
  const handRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const helmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Mão solar pulsa — intensa antes; suave depois
    if (handRef.current) {
      const m = handRef.current.material as THREE.MeshBasicMaterial;
      const base = awakened ? 0.4 : 0.85;
      m.opacity = base + Math.sin(t * 0.9) * 0.15;
    }

    // Peito (selo solar) brilha
    if (chestRef.current) {
      const m = chestRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = awakened
        ? 0.2 + Math.sin(t * 0.6) * 0.05
        : 0.7 + Math.sin(t * 1.0) * 0.15;
    }

    // Elmo se inclina suavemente ao despertar (lembrou)
    if (helmRef.current) {
      const target = awakened ? 0.25 : 0;
      helmRef.current.rotation.x = THREE.MathUtils.lerp(
        helmRef.current.rotation.x,
        target,
        0.03,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pernas */}
      <mesh castShadow position={[0.18, 0.7, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 1.4, 10]} />
        <meshStandardMaterial
          color="#dde2ea"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>
      <mesh castShadow position={[-0.18, 0.7, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 1.4, 10]} />
        <meshStandardMaterial
          color="#dde2ea"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Tronco / armadura */}
      <mesh ref={chestRef} castShadow position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 1.2, 12]} />
        <meshStandardMaterial
          color="#f0f4fa"
          emissive="#ffd45a"
          emissiveIntensity={0.7}
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>

      {/* Capa atrás (curta) */}
      <mesh position={[0, 1.85, -0.42]}>
        <planeGeometry args={[0.95, 1.1]} />
        <meshStandardMaterial
          color="#fff5d8"
          emissive="#ffd45a"
          emissiveIntensity={0.25}
          roughness={0.5}
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Braço esquerdo (humano-armadura) */}
      <mesh castShadow position={[0.55, 1.9, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.1, 0.12, 1.0, 10]} />
        <meshStandardMaterial
          color="#dde2ea"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Braço direito + MÃO SOLAR (esfera de luz) */}
      <mesh castShadow position={[-0.55, 1.9, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.1, 0.12, 1.0, 10]} />
        <meshStandardMaterial
          color="#dde2ea"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>
      <mesh ref={handRef} position={[-0.7, 1.35, 0]}>
        <sphereGeometry args={[0.22, 18, 14]} />
        <meshBasicMaterial
          color="#ffd45a"
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      {/* Raios curtos saindo da mão solar */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              -0.7 + Math.cos(a) * 0.32,
              1.35 + Math.sin(a) * 0.32,
              0,
            ]}
          >
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial
              color="#fff5d8"
              transparent
              opacity={awakened ? 0.4 : 0.8}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Cabeça com elmo */}
      <mesh ref={helmRef} castShadow position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.3, 18, 14]} />
        <meshStandardMaterial
          color="#e8edf2"
          roughness={0.3}
          metalness={0.85}
          emissive="#ffd45a"
          emissiveIntensity={awakened ? 0.1 : 0.3}
        />
      </mesh>

      {/* Crista do elmo */}
      <mesh position={[0, 3.18, 0]}>
        <coneGeometry args={[0.08, 0.32, 6]} />
        <meshStandardMaterial
          color="#ffd45a"
          emissive="#ffd45a"
          emissiveIntensity={awakened ? 0.3 : 0.8}
          metalness={1.0}
        />
      </mesh>

      {/* Luz pessoal (forte enquanto dorme) */}
      {!awakened && (
        <pointLight
          position={[0, 2, 0]}
          intensity={1.4}
          distance={6}
          color="#ffd45a"
          decay={2}
        />
      )}
    </group>
  );
}
