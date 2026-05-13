import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   LothDaMemoria — Lendário de Bela
   ---------------------------------------------------------
   Figura idosa sentada no degrau de pedra de uma das casas
   pequenas. Vestes cor-da-terra simples (manto longo bege-
   sépia), barba branca longa, bastão de pastor pousado ao
   lado. Olhar calmo, voltado para o jogador quando ele se
   aproxima.

   Loth foi recebido por Bela quando fugia (Gn 19); por isso
   Bela foi poupada. Aqui ele NÃO é o juízo — é a memória
   viva da hospitalidade. Ensina que quem acolhe o estrangeiro
   acolhe a si mesmo.

   Aura suave âmbar-quente; sem mecânica de despertar — apenas
   presença. F dispara cinemática "loth-de-bela" via scene.

   Ver docs/22-civilizacoes-expandidas.md §4.5 (Bela).
   ========================================================= */

interface LothDaMemoriaProps {
  position: [number, number, number];
  metByPlayer?: boolean;
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function LothDaMemoria({
  position,
  metByPlayer = false,
  playerRef,
}: LothDaMemoriaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const beardRef = useRef<THREE.Mesh>(null);
  const staffRef = useRef<THREE.Group>(null);

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
      const base = metByPlayer ? 0.22 : 0.18;
      m.opacity = base + closeness * 0.18 + Math.sin(t * 0.42) * 0.05;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.3) * 0.025 + closeness * 0.07,
      );
    }

    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.06 + closeness * 0.07 + Math.sin(t * 0.22) * 0.015;
    }

    // Cabeça segue suavemente o jogador quando próximo
    if (headRef.current && playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const targetY = Math.atan2(dx, dz) * 0.45;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetY,
        0.04,
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        0.08 - closeness * 0.04,
        0.02,
      );
    }

    // Barba respira de leve com o tronco
    if (beardRef.current) {
      const s = 1 + Math.sin(t * 0.6) * 0.02;
      beardRef.current.scale.set(s, s, s);
    }

    // Bastão oscila um milímetro — encostado na pedra
    if (staffRef.current) {
      staffRef.current.rotation.z =
        Math.PI / 8 + Math.sin(t * 0.35) * 0.01;
    }
  });

  // Loth está SENTADO — toda a anatomia parte do degrau (y=0)
  // Tronco curto + cabeça baixa, dá a leitura de descanso e idade.

  return (
    <group ref={groupRef} position={position}>
      {/* Manto longo — cilindro cor-da-terra cobrindo as pernas dobradas */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.9, 14]} />
        <meshStandardMaterial
          color="#a07848"
          emissive="#5a3c20"
          emissiveIntensity={0.18}
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

      {/* Cinta de couro escuro */}
      <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.04, 8, 22]} />
        <meshStandardMaterial
          color="#3a2010"
          emissive="#1a0c04"
          emissiveIntensity={0.18}
          roughness={0.7}
          metalness={0.18}
        />
      </mesh>

      {/* Tronco — vestes de cima (cor-da-terra ligeiramente mais escura) */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.5, 0.7, 14]} />
        <meshStandardMaterial
          color="#8a6438"
          emissive="#4a2c14"
          emissiveIntensity={0.18}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Mãos descansadas no colo */}
      <mesh position={[-0.22, 0.85, 0.36]} castShadow>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial
          color="#dabba0"
          emissive="#8a6248"
          emissiveIntensity={0.18}
          roughness={0.72}
        />
      </mesh>
      <mesh position={[0.22, 0.85, 0.36]} castShadow>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial
          color="#dabba0"
          emissive="#8a6248"
          emissiveIntensity={0.18}
          roughness={0.72}
        />
      </mesh>

      {/* Cabeça (idosa, levemente inclinada para baixo) */}
      <mesh ref={headRef} position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.24, 18, 14]} />
        <meshStandardMaterial
          color="#e2c2a4"
          emissive="#8a6248"
          emissiveIntensity={0.16}
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>

      {/* Cabelos brancos esparsos — calota fina sobre o crânio */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry
          args={[0.26, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.6]}
        />
        <meshStandardMaterial
          color="#ece4d4"
          emissive="#a89c84"
          emissiveIntensity={0.25}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Olhos calmos — duas faíscas âmbar-escuras */}
      <mesh position={[-0.08, 1.55, 0.22]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#8a4818" toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 1.55, 0.22]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#8a4818" toneMapped={false} />
      </mesh>

      {/* Barba branca longa — esfera achatada partindo do queixo */}
      <mesh ref={beardRef} position={[0, 1.35, 0.16]}>
        <sphereGeometry args={[0.2, 14, 12]} />
        <meshStandardMaterial
          color="#f4ede0"
          emissive="#bcae98"
          emissiveIntensity={0.25}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Bastão de pastor — cilindro inclinado pousado à direita */}
      <group ref={staffRef} position={[0.6, 0.6, 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.04, 1.5, 8]} />
          <meshStandardMaterial
            color="#6a4624"
            emissive="#3a2410"
            emissiveIntensity={0.18}
            roughness={0.88}
            metalness={0.06}
          />
        </mesh>
        {/* Curvatura do cajado (pequeno torus no topo) */}
        <mesh position={[0.18, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.035, 6, 12, Math.PI]} />
          <meshStandardMaterial
            color="#6a4624"
            emissive="#3a2410"
            emissiveIntensity={0.18}
            roughness={0.85}
            metalness={0.06}
          />
        </mesh>
      </group>

      {/* Aura âmbar-quente interna */}
      <mesh ref={auraRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial
          color="#f4c078"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — sentido, não visto */}
      <mesh ref={haloRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[2.2, 18, 18]} />
        <meshBasicMaterial
          color="#e8a058"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal âmbar-quente */}
      <pointLight
        position={[0, 1.7, 0]}
        intensity={metByPlayer ? 1.1 : 0.85}
        distance={7}
        color="#f8c878"
        decay={2}
      />
    </group>
  );
}
