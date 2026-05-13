import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   AvoCatalhoyuk — A Avó de Catalhöyük (Lendária)
   ---------------------------------------------------------
   Anciã matriarcal sentada de pernas cruzadas no chão, no
   círculo da cozinha comunitária. Vestes simples cor-da-
   terra-clara (linho ocre-pálido), cabelo branco trançado
   em duas tranças que caem sobre os ombros, mãos apoiadas
   no colo segurando uma pequena tigela de cerâmica.

   Catalhöyük viveu 2 mil anos sem hierarquia visível,
   governada por anciãs. NÃO é cidade-de-pecado — é EXEMPLO
   de que sociedade-sem-arconte é possível. Já foi vivida.
   Pode ser vivida de novo.

   Aura âmbar-quente-acolhedor (mais quente que Helena, mais
   íntima que Loth — fogo de cozinha, não de templo). Sem
   mecânica de despertar; F dispara cinemática "avo-catalhoyuk"
   via scene.

   Ver docs/22-civilizacoes-expandidas.md §4.13 (Catalhöyük).
   ========================================================= */

interface AvoCatalhoyukProps {
  position: [number, number, number];
  metByPlayer?: boolean;
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function AvoCatalhoyuk({
  position,
  metByPlayer = false,
  playerRef,
}: AvoCatalhoyukProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const bowlRef = useRef<THREE.Mesh>(null);
  const braidL = useRef<THREE.Mesh>(null);
  const braidR = useRef<THREE.Mesh>(null);

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
      const base = metByPlayer ? 0.24 : 0.2;
      m.opacity = base + closeness * 0.2 + Math.sin(t * 0.44) * 0.055;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.32) * 0.028 + closeness * 0.08,
      );
    }

    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.07 + closeness * 0.08 + Math.sin(t * 0.24) * 0.016;
    }

    // Cabeça segue o jogador suavemente — olhar materno
    if (headRef.current && playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const targetY = Math.atan2(dx, dz) * 0.55;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetY,
        0.05,
      );
    }

    // Tigela com leve vapor — emissivo pulsando
    if (bowlRef.current) {
      const m = bowlRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.18 + Math.sin(t * 0.7) * 0.06;
    }

    // Tranças balançam levemente (respiração da anciã)
    if (braidL.current) {
      braidL.current.rotation.z = -0.18 + Math.sin(t * 0.5) * 0.02;
    }
    if (braidR.current) {
      braidR.current.rotation.z = 0.18 + Math.sin(t * 0.5 + 0.4) * 0.02;
    }
  });

  // Avó está SENTADA de pernas cruzadas (lótus baixo) — anatomia
  // parte do chão (y=0). Volume baixo e largo (peso terreno).

  return (
    <group ref={groupRef} position={position}>
      {/* Pernas cruzadas — disco achatado largo (linho ocre-pálido) */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.36, 18]} />
        <meshStandardMaterial
          color="#d4b888"
          emissive="#8a6c48"
          emissiveIntensity={0.2}
          roughness={0.88}
          metalness={0.04}
        />
      </mesh>

      {/* Tronco — cilindro mais estreito */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.52, 0.65, 14]} />
        <meshStandardMaterial
          color="#d8bc8c"
          emissive="#8a6c48"
          emissiveIntensity={0.2}
          roughness={0.86}
          metalness={0.04}
        />
      </mesh>

      {/* Faixa têxtil simples na cintura (corda trançada) */}
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.028, 6, 22]} />
        <meshStandardMaterial
          color="#6a4824"
          emissive="#3a2410"
          emissiveIntensity={0.16}
          roughness={0.82}
          metalness={0.06}
        />
      </mesh>

      {/* Tigela de cerâmica nas mãos — sobre o colo */}
      <mesh ref={bowlRef} position={[0, 0.65, 0.32]} castShadow>
        <sphereGeometry
          args={[0.16, 14, 10, 0, Math.PI * 2, Math.PI / 2.4, Math.PI / 2.2]}
        />
        <meshStandardMaterial
          color="#a87848"
          emissive="#5a3818"
          emissiveIntensity={0.18}
          roughness={0.88}
          metalness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Conteúdo da tigela (caldo morno) */}
      <mesh position={[0, 0.66, 0.32]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 18]} />
        <meshStandardMaterial
          color="#e8c890"
          emissive="#c88848"
          emissiveIntensity={0.32}
          roughness={0.7}
          metalness={0.08}
          toneMapped={false}
        />
      </mesh>

      {/* Mãos cobrindo lateralmente a tigela */}
      <mesh position={[-0.18, 0.6, 0.3]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial
          color="#d8b890"
          emissive="#7a5838"
          emissiveIntensity={0.16}
          roughness={0.78}
        />
      </mesh>
      <mesh position={[0.18, 0.6, 0.3]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial
          color="#d8b890"
          emissive="#7a5838"
          emissiveIntensity={0.16}
          roughness={0.78}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.22, 18, 14]} />
        <meshStandardMaterial
          color="#e0c0a0"
          emissive="#8a6240"
          emissiveIntensity={0.16}
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>

      {/* Cabelo branco — calota fina sobre o crânio */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <sphereGeometry
          args={[0.245, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2.4]}
        />
        <meshStandardMaterial
          color="#ece4d4"
          emissive="#a89c84"
          emissiveIntensity={0.26}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Trança esquerda — caindo sobre o ombro */}
      <mesh
        ref={braidL}
        position={[-0.18, 0.92, 0.04]}
        rotation={[0.1, 0, -0.18]}
        castShadow
      >
        <cylinderGeometry args={[0.045, 0.06, 0.55, 8]} />
        <meshStandardMaterial
          color="#ece4d4"
          emissive="#a89c84"
          emissiveIntensity={0.26}
          roughness={0.74}
          metalness={0.05}
        />
      </mesh>

      {/* Trança direita */}
      <mesh
        ref={braidR}
        position={[0.18, 0.92, 0.04]}
        rotation={[0.1, 0, 0.18]}
        castShadow
      >
        <cylinderGeometry args={[0.045, 0.06, 0.55, 8]} />
        <meshStandardMaterial
          color="#ece4d4"
          emissive="#a89c84"
          emissiveIntensity={0.26}
          roughness={0.74}
          metalness={0.05}
        />
      </mesh>

      {/* Olhos calmos — duas faíscas âmbar-quente */}
      <mesh position={[-0.075, 1.16, 0.2]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#7a4818" toneMapped={false} />
      </mesh>
      <mesh position={[0.075, 1.16, 0.2]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#7a4818" toneMapped={false} />
      </mesh>

      {/* Aura âmbar-quente-acolhedor (mais intensa que outras lendárias) */}
      <mesh ref={auraRef} position={[0, 0.7, 0]}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial
          color="#f8c478"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — âmbar-cozinha */}
      <mesh ref={haloRef} position={[0, 0.7, 0]}>
        <sphereGeometry args={[2.3, 18, 18]} />
        <meshBasicMaterial
          color="#dc9848"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal âmbar-quente */}
      <pointLight
        position={[0, 1.3, 0]}
        intensity={metByPlayer ? 1.15 : 0.9}
        distance={7.5}
        color="#f8c478"
        decay={2}
      />
    </group>
  );
}
