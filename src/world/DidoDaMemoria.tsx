import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   DidoDaMemoria — Lendária de Cartago
   ---------------------------------------------------------
   Rainha-fundadora de Cartago em pé apoiada num pilar quebrado,
   no centro da praça. Vestes púrpura-vinho com bordados
   dourados (manto longo púrpura sobre túnica vinho), coroa
   fina dourada (diadema sobre a testa, não tiara monumental),
   postura régia mas cansada — ombros levemente caídos,
   peso apoiado no pilar.

   Dido não é heroína da resistência cega — é a memória de que
   lutar até o fim parecia heroico, mas era medo disfarçado.
   "Não havia heroísmo. Havia apenas medo de perder o que já
   tinha sido perdido."

   Aura âmbar-cor-de-vinho muito sutil (entre âmbar-quente e
   vinho-profundo). Sem mecânica de despertar; F dispara
   cinemática "dido-de-cartago" via scene.

   Ver docs/22-civilizacoes-expandidas.md §4.9 (Cartago).
   ========================================================= */

interface DidoDaMemoriaProps {
  position: [number, number, number];
  metByPlayer?: boolean;
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function DidoDaMemoria({
  position,
  metByPlayer = false,
  playerRef,
}: DidoDaMemoriaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const mantleRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);

  const selfPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    let proximity = 0.7;
    if (playerRef?.current) {
      const dist = playerRef.current.position.distanceTo(selfPos.current);
      proximity = Math.min(1, Math.max(0, (dist - 2.4) / 9));
    }
    const closeness = 1 - proximity;

    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = metByPlayer ? 0.18 : 0.14;
      m.opacity = base + closeness * 0.14 + Math.sin(t * 0.38) * 0.04;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.28) * 0.022 + closeness * 0.05,
      );
    }

    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.05 + closeness * 0.06 + Math.sin(t * 0.2) * 0.012;
    }

    // Cabeça segue o jogador — peso na nuca, olhar firme
    if (headRef.current && playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const targetY = Math.atan2(dx, dz) * 0.4;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetY,
        0.04,
      );
    }

    // Manto púrpura respira — leve oscilação de tecido pesado
    if (mantleRef.current) {
      mantleRef.current.rotation.z = Math.sin(t * 0.42) * 0.012;
    }

    // Coroa pulsa em dourado — sutil mas constante (memória de poder)
    if (crownRef.current) {
      const m = crownRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.42 + Math.sin(t * 0.55) * 0.1;
    }
  });

  // Dido está EM PÉ — anatomia parte do chão (y=0), apoiada no pilar
  // Postura régia mas inclinada — ombros leves para o lado direito
  // (lado do pilar, que é renderizado pela cena).

  return (
    <group ref={groupRef} position={position}>
      {/* Túnica vinho — base alongada (mais escura, sob o manto) */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.5, 1.78, 14]} />
        <meshStandardMaterial
          color="#5a1818"
          emissive="#2a0808"
          emissiveIntensity={0.16}
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* Manto púrpura por cima — peça aberta lateralmente */}
      <mesh
        ref={mantleRef}
        position={[0, 1.18, 0]}
        rotation={[0, 0, 0.04]}
        castShadow
      >
        <cylinderGeometry args={[0.36, 0.58, 1.3, 14, 1, true]} />
        <meshStandardMaterial
          color="#6a2848"
          emissive="#3a0c20"
          emissiveIntensity={0.2}
          roughness={0.72}
          metalness={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bordado dourado na barra inferior do manto */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.035, 8, 26]} />
        <meshStandardMaterial
          color="#e8c878"
          emissive="#c88838"
          emissiveIntensity={0.38}
          roughness={0.42}
          metalness={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Bordado dourado vertical (clavus) — placa frontal */}
      <mesh position={[0, 1.2, 0.34]}>
        <planeGeometry args={[0.14, 0.7]} />
        <meshStandardMaterial
          color="#f4d488"
          emissive="#c88838"
          emissiveIntensity={0.42}
          roughness={0.4}
          metalness={0.6}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Fíbula (broche) no ombro — círculo dourado */}
      <mesh position={[-0.28, 1.74, 0.16]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial
          color="#f4c878"
          emissive="#c88838"
          emissiveIntensity={0.45}
          roughness={0.35}
          metalness={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* Mão esquerda apoiada no pilar (sugestão, à frente-direita) */}
      <mesh position={[0.42, 1.18, 0.18]} castShadow>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial
          color="#dab28a"
          emissive="#8a5838"
          emissiveIntensity={0.16}
          roughness={0.74}
        />
      </mesh>

      {/* Mão direita caída ao lado do corpo — peso */}
      <mesh position={[-0.34, 1.0, 0.04]} castShadow>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial
          color="#dab28a"
          emissive="#8a5838"
          emissiveIntensity={0.16}
          roughness={0.74}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 1.95, 0]} castShadow>
        <sphereGeometry args={[0.24, 18, 14]} />
        <meshStandardMaterial
          color="#e8c8a0"
          emissive="#9a6c44"
          emissiveIntensity={0.16}
          roughness={0.76}
          metalness={0.04}
        />
      </mesh>

      {/* Cabelo preto-castanho preso atrás — calota */}
      <mesh position={[0, 2.04, -0.02]} castShadow>
        <sphereGeometry
          args={[0.265, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.4]}
        />
        <meshStandardMaterial
          color="#2a1808"
          emissive="#1a0c04"
          emissiveIntensity={0.18}
          roughness={0.72}
          metalness={0.1}
        />
      </mesh>

      {/* Coroa fina dourada — diadema sobre a testa */}
      <mesh
        ref={crownRef}
        position={[0, 2.12, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.24, 0.022, 6, 22]} />
        <meshStandardMaterial
          color="#f4d488"
          emissive="#c88838"
          emissiveIntensity={0.45}
          roughness={0.38}
          metalness={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* Pequena pedra rubi central na coroa */}
      <mesh position={[0, 2.16, 0.24]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshBasicMaterial color="#c8284c" toneMapped={false} />
      </mesh>

      {/* Olhos âmbar-escuro */}
      <mesh position={[-0.08, 1.94, 0.22]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#5a2818" toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 1.94, 0.22]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#5a2818" toneMapped={false} />
      </mesh>

      {/* Aura âmbar-cor-de-vinho */}
      <mesh ref={auraRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[1.45, 24, 24]} />
        <meshBasicMaterial
          color="#c87078"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — vinho-profundo difuso */}
      <mesh ref={haloRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[2.2, 18, 18]} />
        <meshBasicMaterial
          color="#883858"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal âmbar-vinho */}
      <pointLight
        position={[0, 2.0, 0]}
        intensity={metByPlayer ? 0.95 : 0.7}
        distance={6.5}
        color="#dc8888"
        decay={2}
      />
    </group>
  );
}
