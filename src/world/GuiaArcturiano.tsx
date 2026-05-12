import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Guia Arcturiano — Anjo Querubim do Bardo
   ---------------------------------------------------------
   Figura humanoide alongada, alta, com manto azul-elétrico
   longo. Halo turquesa pálido sobre a cabeça. Estática:
   apenas a cabeça segue o jogador (lerp em rotation.y).
   Operam no Bardo: cuidam de quem morre antes de lembrar.
   12 deles formam um círculo de Casas-do-Trânsito; o
   "Líder" (posição 0) brilha um pouco mais — é o que pode
   ser despertado.
   Ver docs/22-civilizacoes-expandidas.md §3.3
   ========================================================= */

interface GuiaArcturianoProps {
  position: [number, number, number];
  /** Líder = posição 0, recebe brilho extra e é o aproximável. */
  isLeader: boolean;
  /** Necessário para o gaze tracking (a cabeça segue o jogador). */
  playerRef: React.RefObject<THREE.Group | null>;
  /** Quando o líder desperta, sobe um pouco a intensidade. */
  awakened?: boolean;
}

export function GuiaArcturiano({
  position,
  isLeader,
  playerRef,
  awakened = false,
}: GuiaArcturianoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const mantoRef = useRef<THREE.Mesh>(null);

  // Buffers para evitar alocar Vector3 por frame
  const worldSelf = useRef(new THREE.Vector3());
  const worldQuat = useRef(new THREE.Quaternion());
  const worldEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gaze tracking — só a cabeça gira no eixo Y, em coordenadas locais
    if (headRef.current && playerRef.current) {
      // Posição-mundo deste guia (independe de pai com rotação)
      groupRef.current.getWorldPosition(worldSelf.current);
      const dx = playerRef.current.position.x - worldSelf.current.x;
      const dz = playerRef.current.position.z - worldSelf.current.z;
      const worldAngle = Math.atan2(dx, dz);
      // Yaw acumulado do pai (cena pode embrulhar o guia num group rotacionado)
      groupRef.current.getWorldQuaternion(worldQuat.current);
      worldEuler.current.setFromQuaternion(worldQuat.current);
      const localAngle = worldAngle - worldEuler.current.y;
      const current = headRef.current.rotation.y;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        current,
        localAngle,
        0.04,
      );
    }

    // Aura — pulsa lentamente
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = isLeader ? (awakened ? 0.18 : 0.28) : 0.14;
      m.opacity = base + Math.sin(t * 0.5 + position[0]) * 0.05;
    }

    // Halo turquesa — cintila
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        (isLeader ? 0.7 : 0.45) + Math.sin(t * 0.8 + position[2]) * 0.08;
    }

    // Manto pulsa em emissiva, especialmente o líder
    if (mantoRef.current) {
      const m = mantoRef.current.material as THREE.MeshStandardMaterial;
      const base = isLeader ? (awakened ? 0.6 : 0.45) : 0.3;
      m.emissiveIntensity = base + Math.sin(t * 0.45 + position[0]) * 0.05;
    }
  });

  // Cores: líder mais brilhante
  const mantoColor = isLeader ? "#3a78e8" : "#2a4a8a";
  const mantoEmissive = isLeader ? "#1a48a8" : "#0a2858";
  const haloColor = isLeader ? "#8af0e0" : "#5ac0c8";
  const auraColor = isLeader ? "#4a90e8" : "#2a5090";

  return (
    <group ref={groupRef} position={position}>
      {/* Manto longo — alongado vertical, dá o efeito "alto" */}
      <mesh ref={mantoRef} position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.5, 2.7, 14]} />
        <meshStandardMaterial
          color={mantoColor}
          emissive={mantoEmissive}
          emissiveIntensity={isLeader ? 0.55 : 0.35}
          roughness={0.55}
          metalness={0.4}
        />
      </mesh>

      {/* Anel-cintura sutil */}
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.025, 6, 18]} />
        <meshStandardMaterial
          color={isLeader ? "#8af0ff" : "#5ac0d8"}
          emissive={isLeader ? "#4ab0e0" : "#2a7898"}
          emissiveIntensity={isLeader ? 0.7 : 0.45}
          roughness={0.4}
          metalness={0.85}
        />
      </mesh>

      {/* Gola */}
      <mesh position={[0, 2.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.04, 6, 20]} />
        <meshStandardMaterial
          color={isLeader ? "#a8e8ff" : "#6ab0d0"}
          emissive={isLeader ? "#3a90c8" : "#1a5878"}
          emissiveIntensity={isLeader ? 0.6 : 0.4}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Cabeça (segue o jogador) */}
      <group ref={headRef} position={[0, 3.05, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.24, 18, 14]} />
          <meshStandardMaterial
            color="#e8f0ff"
            emissive={isLeader ? "#5078a8" : "#304060"}
            emissiveIntensity={0.18}
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>
        {/* Pequenos "olhos" — duas elipses azuis */}
        {[-0.07, 0.07].map((dx, i) => (
          <mesh key={`eye-${i}`} position={[dx, 0.03, 0.22]}>
            <sphereGeometry args={[0.025, 8, 6]} />
            <meshBasicMaterial
              color={isLeader ? "#aaf0ff" : "#7ac8e0"}
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* Halo turquesa orbital sobre a cabeça */}
        <mesh
          ref={haloRef}
          position={[0, 0.32, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.26, 0.36, 32]} />
          <meshBasicMaterial
            color={haloColor}
            transparent
            opacity={0.55}
            toneMapped={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Aura ao redor — apenas leve, evita poluir o círculo dos 12 */}
      <mesh ref={auraRef} position={[0, 1.6, 0]}>
        <sphereGeometry args={[1.4, 20, 16]} />
        <meshBasicMaterial
          color={auraColor}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal só para o líder — os outros são silhuetas */}
      {isLeader && (
        <pointLight
          position={[0, 2.0, 0]}
          intensity={awakened ? 1.6 : 1.2}
          distance={9}
          color={awakened ? "#aaf0ff" : "#6ac0e8"}
          decay={2}
        />
      )}
    </group>
  );
}
