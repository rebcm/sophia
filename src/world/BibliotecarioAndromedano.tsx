import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Bibliotecário-de-Andrômeda — Anjo Arcanjo Arquivista
   ---------------------------------------------------------
   Figura andrógina alta, manto feito de papel-cósmico — vários
   planos pequenos brancos com glifos pulsando ao redor das
   vestes, como se folhas de pergaminho-luz orbitassem o corpo.
   Aura prata-luminescente. Mãos abertas, palma para cima
   (oferecendo um livro invisível). Halo discreto sobre a cabeça.
   Os Andromedanos são Arcanjos: mensageiros maiores e
   guardiões do registro Akáshico de todas as Eras.
   Ver docs/22-civilizacoes-expandidas.md §3.4
   ========================================================= */

interface BibliotecarioAndromedanoProps {
  position: [number, number, number];
  awakened?: boolean;
  playerRef?: React.RefObject<THREE.Group | null>;
}

const PAPER_COUNT = 14;

export function BibliotecarioAndromedano({
  position,
  awakened = false,
  playerRef,
}: BibliotecarioAndromedanoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mantoRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const haloDiscRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const papersRef = useRef<THREE.Group>(null);

  const selfPos = useRef(new THREE.Vector3(...position));

  // Distribuir N planos-papel em órbita helicoidal ao redor do corpo
  const papers = useMemo(() => {
    const out: {
      baseAngle: number;
      radius: number;
      yBase: number;
      ySpeed: number;
      rotSpeed: number;
      phase: number;
      size: [number, number];
    }[] = [];
    for (let i = 0; i < PAPER_COUNT; i++) {
      out.push({
        baseAngle: (i / PAPER_COUNT) * Math.PI * 2,
        radius: 0.7 + ((i % 3) * 0.18),
        yBase: 0.55 + (i % 5) * 0.32,
        ySpeed: 0.18 + (i % 4) * 0.05,
        rotSpeed: 0.4 + (i % 5) * 0.12,
        phase: (i * 0.37) % (Math.PI * 2),
        size: [0.16 + (i % 3) * 0.04, 0.22 + (i % 4) * 0.05],
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Quase imóvel — flutuação muito leve
    groupRef.current.position.y = position[1] + Math.sin(t * 0.34) * 0.04;

    // Proximidade do jogador
    let proximity = 0;
    if (playerRef?.current) {
      const dist = playerRef.current.position.distanceTo(selfPos.current);
      proximity = Math.min(1, Math.max(0, (dist - 2.5) / 10));
    } else {
      proximity = 0.6;
    }
    const closeness = 1 - proximity;

    // Manto — pulso prata-violeta
    if (mantoRef.current) {
      const m = mantoRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.6 : 0.42) + Math.sin(t * 0.42) * 0.08;
    }

    // Aura grande
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = awakened ? 0.22 : 0.3;
      m.opacity = base + closeness * 0.2 + Math.sin(t * 0.65) * 0.05;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.4) * 0.04 + closeness * 0.08,
      );
    }

    // Halo
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        0.1 + closeness * 0.1 + Math.sin(t * 0.32 + 1.2) * 0.025;
    }
    if (haloDiscRef.current) {
      const m = haloDiscRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + Math.sin(t * 0.55) * 0.12;
    }

    // Cabeça — leve oscilação meditativa
    if (headRef.current) {
      const target = awakened ? -0.04 : 0.04;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.015,
      );
    }

    // Selo no peito — pulsa
    if (chestRef.current) {
      const m = chestRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.85 : 0.55) + Math.sin(t * 0.58 + 0.3) * 0.12;
    }

    // Papéis-cósmicos — órbita helicoidal ao redor, glifo pulsa
    if (papersRef.current) {
      papersRef.current.children.forEach((child, i) => {
        const p = papers[i];
        const a = p.baseAngle + t * p.rotSpeed * 0.3;
        const y = p.yBase + Math.sin(t * p.ySpeed + p.phase) * 0.32;
        child.position.x = Math.cos(a) * p.radius;
        child.position.y = y;
        child.position.z = Math.sin(a) * p.radius;
        // Sempre mostrar a "face" ligeiramente para o eixo Y
        child.rotation.y = a + Math.PI / 2 + Math.sin(t * 0.6 + p.phase) * 0.2;
        child.rotation.z = Math.sin(t * 0.4 + p.phase) * 0.18;
        const mesh = child as THREE.Mesh;
        const m = mesh.material as THREE.MeshStandardMaterial;
        // Pulso de emissive — "glifo cintila"
        m.emissiveIntensity =
          0.55 + Math.sin(t * 1.1 + p.phase) * 0.35;
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base — anel discreto sob a figura */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.94, 32]} />
        <meshBasicMaterial
          color="#c8c0ec"
          transparent
          opacity={0.32}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Manto longo prata — cilindro alongado */}
      <mesh ref={mantoRef} position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.62, 2.3, 16]} />
        <meshStandardMaterial
          color="#e0dcf2"
          emissive="#7a78b0"
          emissiveIntensity={0.45}
          roughness={0.45}
          metalness={0.35}
        />
      </mesh>

      {/* Gola prata clara */}
      <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.04, 8, 24]} />
        <meshStandardMaterial
          color="#f2eefa"
          emissive="#a8a4d8"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>

      {/* Pescoço */}
      <mesh position={[0, 2.48, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.18, 10]} />
        <meshStandardMaterial
          color="#ece4f4"
          emissive="#7068a8"
          emissiveIntensity={0.28}
          roughness={0.55}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 2.78, 0]} castShadow>
        <sphereGeometry args={[0.28, 18, 14]} />
        <meshStandardMaterial
          color="#e8e0f0"
          emissive="#5a4878"
          emissiveIntensity={0.2}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Selo no peito — círculo prata-violeta */}
      <mesh ref={chestRef} position={[0, 1.78, 0.46]}>
        <circleGeometry args={[0.16, 24]} />
        <meshStandardMaterial
          color="#f2eaff"
          emissive="#c8a8ff"
          emissiveIntensity={0.7}
          roughness={0.4}
          metalness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mãos abertas — palma para cima (oferecendo livro invisível) */}
      {[-0.46, 0.46].map((dx, i) => (
        <mesh
          key={`hand-${i}`}
          position={[dx, 1.18, 0.34]}
          rotation={[Math.PI / 8, 0, 0]}
          castShadow
        >
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial
            color="#f0e8f6"
            emissive="#a88cd8"
            emissiveIntensity={0.45}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* Papéis-cósmicos orbitando — manto vivo de glifos */}
      <group ref={papersRef} position={[0, 0, 0]}>
        {papers.map((p, i) => (
          <mesh key={`paper-${i}`}>
            <planeGeometry args={p.size} />
            <meshStandardMaterial
              color="#f8f4ff"
              emissive="#a8a0e8"
              emissiveIntensity={0.6}
              roughness={0.45}
              metalness={0.2}
              transparent
              opacity={0.86}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Aura prata-luminescente */}
      <mesh ref={auraRef} position={[0, 1.55, 0]}>
        <sphereGeometry args={[2.05, 26, 22]} />
        <meshBasicMaterial
          color="#d8d0f4"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo */}
      <mesh ref={haloRef} position={[0, 1.55, 0]}>
        <sphereGeometry args={[3.1, 20, 18]} />
        <meshBasicMaterial
          color="#b8b0e8"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Disco-halo sobre a cabeça */}
      <mesh
        ref={haloDiscRef}
        position={[0, 3.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.32, 0.46, 32]} />
        <meshBasicMaterial
          color="#e8e0ff"
          transparent
          opacity={0.55}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Luz pessoal — prata-luminescente */}
      <pointLight
        position={[0, 2.0, 0]}
        intensity={awakened ? 1.7 : 1.1}
        distance={11}
        color={awakened ? "#e8e0ff" : "#c0b8e8"}
        decay={2}
      />
    </group>
  );
}
