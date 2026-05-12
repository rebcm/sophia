import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Adama — Sacerdote-Líder de Telos
   ---------------------------------------------------------
   NÃO confundir com o Adão do Jardim dos Ecos. Este Adama é
   um descendente direto preservado em Telos por ~12 mil anos
   desde o afundamento de Lemúria. Ensina ao jogador a Cura
   Coletiva — o canto que ressoa por todo o refúgio.

   Vestes brancas longas, cabelo prata-azulado curto, olhos
   verdes calmos. Aura caloroso-rosada — o coração lemuriano
   ainda batendo.

   Ver docs/22-civilizacoes-expandidas.md §2.3 (Telos).
   ========================================================= */

interface AdamaProps {
  position: [number, number, number];
  awakened?: boolean;
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function Adama({
  position,
  awakened = false,
  playerRef,
}: AdamaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const handsRef = useRef<THREE.Group>(null);

  const selfPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    let proximity = 0.6;
    if (playerRef?.current) {
      const dist = playerRef.current.position.distanceTo(selfPos.current);
      proximity = Math.min(1, Math.max(0, (dist - 2.5) / 10));
    }
    const closeness = 1 - proximity;

    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = awakened ? 0.2 : 0.24;
      m.opacity =
        base + closeness * 0.2 + Math.sin(t * 0.5) * 0.06;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.35) * 0.03 + closeness * 0.08,
      );
    }

    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        0.08 + closeness * 0.08 + Math.sin(t * 0.25) * 0.02;
    }

    if (chestRef.current) {
      const m = chestRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.6 : 0.4) + Math.sin(t * 0.6) * 0.1;
    }

    if (headRef.current) {
      const target = awakened ? -0.05 : 0.06;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.02,
      );
      headRef.current.rotation.y = Math.sin(t * 0.18) * 0.08;
    }

    // Mãos sobem suavemente quando desperto (gesto de bênção lemuriana)
    if (handsRef.current) {
      const targetY = awakened ? 1.7 : 1.35;
      handsRef.current.position.y = THREE.MathUtils.lerp(
        handsRef.current.position.y,
        targetY + Math.sin(t * 0.3) * 0.03,
        0.03,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Vestes brancas longas — cilindro até o chão */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.6, 2.0, 14]} />
        <meshStandardMaterial
          color="#f8f4ec"
          emissive="#d8c8b8"
          emissiveIntensity={0.28}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Faixa rosada na cintura — pulso do coração lemuriano */}
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.045, 8, 22]} />
        <meshStandardMaterial
          color="#f4c8c0"
          emissive="#c87878"
          emissiveIntensity={0.5}
          roughness={0.55}
          metalness={0.2}
        />
      </mesh>

      {/* Selo no peito — cristal rosado, símbolo da cura coletiva */}
      <mesh ref={chestRef} position={[0, 1.55, 0.42]}>
        <circleGeometry args={[0.17, 18]} />
        <meshStandardMaterial
          color="#ffd8d0"
          emissive="#e88878"
          emissiveIntensity={0.55}
          roughness={0.45}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mãos (gesto de bênção/cura) — duas esferas pequenas */}
      <group ref={handsRef} position={[0, 1.35, 0]}>
        <mesh position={[-0.32, 0, 0.32]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial
            color="#f4d8c8"
            emissive="#c88878"
            emissiveIntensity={0.35}
            roughness={0.65}
          />
        </mesh>
        <mesh position={[0.32, 0, 0.32]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial
            color="#f4d8c8"
            emissive="#c88878"
            emissiveIntensity={0.35}
            roughness={0.65}
          />
        </mesh>
      </group>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 2.22, 0]} castShadow>
        <sphereGeometry args={[0.28, 18, 14]} />
        <meshStandardMaterial
          color="#f0d8c4"
          emissive="#8a6a58"
          emissiveIntensity={0.18}
          roughness={0.72}
          metalness={0.05}
        />
      </mesh>

      {/* Cabelo prata-azulado curto — calota sobre a cabeça */}
      <mesh position={[0, 2.32, 0]} castShadow>
        <sphereGeometry
          args={[0.3, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.1]}
        />
        <meshStandardMaterial
          color="#c8d8e8"
          emissive="#6a8090"
          emissiveIntensity={0.32}
          roughness={0.55}
          metalness={0.4}
        />
      </mesh>

      {/* Olhos verdes calmos — duas faíscas verdes finas */}
      <mesh position={[-0.09, 2.24, 0.26]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#80c878" toneMapped={false} />
      </mesh>
      <mesh position={[0.09, 2.24, 0.26]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#80c878" toneMapped={false} />
      </mesh>

      {/* Aura caloroso-rosada interna */}
      <mesh ref={auraRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[1.55, 24, 24]} />
        <meshBasicMaterial
          color="#ffc8c0"
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — sentido, não visto */}
      <mesh ref={haloRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[2.5, 18, 18]} />
        <meshBasicMaterial
          color="#e8a098"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal — rosa-quente, coração da Lemúria que canta */}
      <pointLight
        position={[0, 1.9, 0]}
        intensity={awakened ? 1.5 : 1.0}
        distance={9}
        color={awakened ? "#ffc8b8" : "#f8b0a8"}
        decay={2}
      />
    </group>
  );
}
