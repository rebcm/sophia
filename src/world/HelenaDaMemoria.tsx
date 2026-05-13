import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   HelenaDaMemoria — Lendária de Tróia
   ---------------------------------------------------------
   Figura feminina helênica jovem-anciã sentada num degrau
   de pedra branca, à entrada do palácio. Vestes brancas
   com bordados dourados nas barras (peplos longo), cabelo
   trançado caindo sobre o ombro, mãos apoiadas nos joelhos.
   Olhar castanho profundo, calmo — mas profundamente cansado
   de ter sido transformada em causa.

   Helena nunca pediu para ser pretexto de guerra. Aqui ela
   NÃO é troféu — é a memória viva de que ninguém é causa
   de nada. "Eu sou eu mesma."

   Aura âmbar-com-toque-rosa muito sutil (entre amarelo-pálido
   e rosa-amanhecer). Sem mecânica de despertar; F dispara
   cinemática "helena-de-troia" via scene.

   Ver docs/22-civilizacoes-expandidas.md §4.8 (Tróia).
   ========================================================= */

interface HelenaDaMemoriaProps {
  position: [number, number, number];
  metByPlayer?: boolean;
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function HelenaDaMemoria({
  position,
  metByPlayer = false,
  playerRef,
}: HelenaDaMemoriaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const braidRef = useRef<THREE.Mesh>(null);
  const hemRef = useRef<THREE.Mesh>(null);

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
      const base = metByPlayer ? 0.2 : 0.16;
      m.opacity = base + closeness * 0.16 + Math.sin(t * 0.4) * 0.04;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.3) * 0.025 + closeness * 0.06,
      );
    }

    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.06 + closeness * 0.07 + Math.sin(t * 0.22) * 0.014;
    }

    // Cabeça segue o jogador discretamente — olhar cansado mas atento
    if (headRef.current && playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const targetY = Math.atan2(dx, dz) * 0.5;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetY,
        0.045,
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        0.06 - closeness * 0.03,
        0.025,
      );
    }

    // Trança balança levemente — vento mítico
    if (braidRef.current) {
      braidRef.current.rotation.z = Math.sin(t * 0.7) * 0.05;
    }

    // Barra do vestido (hem) respira sutilmente — bordado dourado pulsa
    if (hemRef.current) {
      const m = hemRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.32 + Math.sin(t * 0.55) * 0.08;
    }
  });

  // Helena está SENTADA — anatomia parte do degrau (y=0)

  return (
    <group ref={groupRef} position={position}>
      {/* Peplos longo (vestido branco) — cilindro cobrindo pernas dobradas */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.68, 0.84, 16]} />
        <meshStandardMaterial
          color="#f4eee0"
          emissive="#c8b888"
          emissiveIntensity={0.22}
          roughness={0.78}
          metalness={0.06}
        />
      </mesh>

      {/* Barra inferior do peplos — bordado dourado */}
      <mesh
        ref={hemRef}
        position={[0, 0.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.66, 0.04, 8, 26]} />
        <meshStandardMaterial
          color="#e8c878"
          emissive="#c88838"
          emissiveIntensity={0.4}
          roughness={0.42}
          metalness={0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Tronco — segunda peça do peplos (mais clara) */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.48, 0.74, 14]} />
        <meshStandardMaterial
          color="#fcf6e8"
          emissive="#d8c898"
          emissiveIntensity={0.2}
          roughness={0.74}
          metalness={0.05}
        />
      </mesh>

      {/* Cinto dourado fino (faixa no peito) */}
      <mesh position={[0, 1.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.025, 8, 22]} />
        <meshStandardMaterial
          color="#e8c878"
          emissive="#c88838"
          emissiveIntensity={0.38}
          roughness={0.42}
          metalness={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Bordado vertical no peito — pequena placa dourada */}
      <mesh position={[0, 1.32, 0.32]}>
        <planeGeometry args={[0.12, 0.36]} />
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

      {/* Mãos apoiadas nos joelhos */}
      <mesh position={[-0.32, 0.78, 0.42]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial
          color="#eccfaa"
          emissive="#a07c58"
          emissiveIntensity={0.16}
          roughness={0.72}
        />
      </mesh>
      <mesh position={[0.32, 0.78, 0.42]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial
          color="#eccfaa"
          emissive="#a07c58"
          emissiveIntensity={0.16}
          roughness={0.72}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.23, 18, 14]} />
        <meshStandardMaterial
          color="#ecd0aa"
          emissive="#a07c58"
          emissiveIntensity={0.16}
          roughness={0.76}
          metalness={0.04}
        />
      </mesh>

      {/* Cabelo (calota castanho-escuro com leve reflexo dourado) */}
      <mesh position={[0, 1.7, -0.02]} castShadow>
        <sphereGeometry
          args={[0.255, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial
          color="#5a3818"
          emissive="#3a2410"
          emissiveIntensity={0.18}
          roughness={0.7}
          metalness={0.12}
        />
      </mesh>

      {/* Trança caindo sobre o ombro direito — cilindro inclinado */}
      <mesh
        ref={braidRef}
        position={[0.18, 1.35, 0.06]}
        rotation={[0.15, 0, -0.25]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.07, 0.65, 8]} />
        <meshStandardMaterial
          color="#5a3818"
          emissive="#3a2410"
          emissiveIntensity={0.18}
          roughness={0.74}
          metalness={0.1}
        />
      </mesh>

      {/* Diadema simples — anel dourado sobre a cabeça */}
      <mesh position={[0, 1.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.018, 6, 18]} />
        <meshStandardMaterial
          color="#e8c878"
          emissive="#c88838"
          emissiveIntensity={0.4}
          roughness={0.42}
          metalness={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Olhos castanhos — duas faíscas âmbar-quente profundas */}
      <mesh position={[-0.075, 1.62, 0.21]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#6a3a18" toneMapped={false} />
      </mesh>
      <mesh position={[0.075, 1.62, 0.21]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#6a3a18" toneMapped={false} />
      </mesh>

      {/* Aura âmbar-com-toque-rosa muito sutil */}
      <mesh ref={auraRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[1.45, 24, 24]} />
        <meshBasicMaterial
          color="#f8c8b0"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — rosa-amanhecer pálido */}
      <mesh ref={haloRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[2.25, 18, 18]} />
        <meshBasicMaterial
          color="#f4b098"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal âmbar-rosa */}
      <pointLight
        position={[0, 1.7, 0]}
        intensity={metByPlayer ? 1.0 : 0.75}
        distance={7}
        color="#f8d0b0"
        decay={2}
      />
    </group>
  );
}
