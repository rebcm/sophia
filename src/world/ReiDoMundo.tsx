import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Rei do Mundo — Guardião da Memória Pré-Adamita
   ---------------------------------------------------------
   Não é tirano. É o último Mui-Telepata que escolheu descer
   em vez de afundar com Mu — e desde então guarda, sob a
   superfície, a lembrança do que a humanidade foi antes do
   esquecimento. Manto cor-da-terra (marrom-dourado), coroa
   de raízes vivas (galhos finos brotando do crânio, ainda
   verdes). Aura terrosa pulsante: intensifica quando o
   jogador se aproxima — a terra reconhece o filho que volta.
   Ver docs/02d-civilizacoes-perdidas.md (Pré-Adamita) e
   docs/02b/02c (cidades intra-terrenas / Mu-Telepatas).
   ========================================================= */

interface ReiDoMundoProps {
  position: [number, number, number];
  awakened?: boolean;
  /** Opcional: ref do jogador, para intensificar a aura por proximidade. */
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function ReiDoMundo({
  position,
  awakened = false,
  playerRef,
}: ReiDoMundoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const crownRootsRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  // Buffer para cálculo de proximidade — evita alocar Vector3 por frame
  const selfPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Distância ao jogador (0..1, 0 = perto, 1 = longe)
    let proximity = 0;
    if (playerRef?.current) {
      const dist = playerRef.current.position.distanceTo(selfPos.current);
      proximity = Math.min(1, Math.max(0, (dist - 2.5) / 10));
    } else {
      proximity = 0.6;
    }
    const closeness = 1 - proximity; // 0..1, 1 = pertinho

    // Aura terrosa: pulsa lenta, intensifica quando jogador se aproxima
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = awakened ? 0.18 : 0.26;
      const closeBoost = closeness * 0.22;
      m.opacity = base + closeBoost + Math.sin(t * 0.6) * 0.06;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.4) * 0.04 + closeness * 0.08,
      );
    }

    // Halo distante (camada externa, suave)
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.07 + closeness * 0.08 + Math.sin(t * 0.3) * 0.02;
    }

    // Coroa de raízes — galhos vivos balançam levemente
    if (crownRootsRef.current) {
      crownRootsRef.current.rotation.y = t * 0.05;
      crownRootsRef.current.children.forEach((child, i) => {
        const phase = i * 0.7;
        child.rotation.z = Math.sin(t * 0.5 + phase) * 0.08;
      });
    }

    // Peito (selo de terra) respira
    if (chestRef.current) {
      const m = chestRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.55 : 0.32) + Math.sin(t * 0.45) * 0.08;
    }

    // Cabeça: olhar quase imperceptível, ergue suavemente quando desperto
    if (headRef.current) {
      const target = awakened ? -0.08 : 0.18;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.02,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pedestal/raízes ao redor dos pés (não está num trono — está sentado
          numa cadeira de raízes vivas que cresceram para sustentá-lo) */}
      <mesh position={[0, 0.18, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.36, 1.0]} />
        <meshStandardMaterial
          color="#3a2614"
          roughness={0.95}
          metalness={0.05}
          emissive="#1a0e06"
          emissiveIntensity={0.12}
        />
      </mesh>
      {/* raízes finas brotando do pedestal */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={`base-root-${i}`}
            position={[Math.cos(a) * 0.85, 0.08, Math.sin(a) * 0.65 - 0.35]}
            rotation={[0, a, Math.PI / 2 + 0.1]}
            castShadow
          >
            <cylinderGeometry args={[0.04, 0.07, 0.5, 6]} />
            <meshStandardMaterial
              color="#2a1a0a"
              roughness={0.95}
            />
          </mesh>
        );
      })}

      {/* Manto cor-da-terra (cilindro alongado — caindo até quase o chão) */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.62, 2.0, 14]} />
        <meshStandardMaterial
          color="#6a4a22"
          emissive="#3a2410"
          emissiveIntensity={0.28}
          roughness={0.82}
          metalness={0.05}
        />
      </mesh>

      {/* Borda dourada da gola do manto */}
      <mesh position={[0, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.045, 8, 24]} />
        <meshStandardMaterial
          color="#c8a060"
          emissive="#8a6028"
          emissiveIntensity={0.45}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Peito — selo de terra brilhando suavemente */}
      <mesh ref={chestRef} position={[0, 1.55, 0.42]}>
        <circleGeometry args={[0.18, 18]} />
        <meshStandardMaterial
          color="#d8a868"
          emissive="#a06820"
          emissiveIntensity={0.5}
          roughness={0.5}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 2.32, 0]} castShadow>
        <sphereGeometry args={[0.3, 18, 14]} />
        <meshStandardMaterial
          color="#a07a52"
          emissive="#3a2410"
          emissiveIntensity={0.15}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Coroa de raízes vivas — anel-base */}
      <mesh position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 8, 18]} />
        <meshStandardMaterial
          color="#4a3018"
          emissive="#2a1a08"
          emissiveIntensity={0.3}
          roughness={0.9}
        />
      </mesh>

      {/* Coroa de raízes — galhos finos curvos brotando para cima/fora */}
      <group ref={crownRootsRef} position={[0, 2.6, 0]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2;
          const tilt = 0.22 + (i % 2) * 0.08;
          const len = 0.42 + (i % 3) * 0.08;
          return (
            <group key={`root-branch-${i}`} rotation={[0, a, 0]}>
              {/* base do galho */}
              <mesh
                position={[Math.cos(0) * 0.3, len / 2, 0]}
                rotation={[0, 0, tilt]}
                castShadow
              >
                <cylinderGeometry args={[0.025, 0.045, len, 6]} />
                <meshStandardMaterial
                  color="#3a2614"
                  roughness={0.95}
                />
              </mesh>
              {/* ponta verde — viva */}
              <mesh
                position={[
                  Math.sin(tilt) * len + 0.3,
                  len + 0.05,
                  0,
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial
                  color="#7aa848"
                  emissive="#3a5818"
                  emissiveIntensity={0.55}
                  roughness={0.6}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Aura terrosa interna — pulsante */}
      <mesh ref={auraRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[1.6, 24, 24]} />
        <meshBasicMaterial
          color="#c89060"
          transparent
          opacity={0.26}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — bem suave, sente-se mais do que vê-se */}
      <mesh ref={haloRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[2.6, 18, 18]} />
        <meshBasicMaterial
          color="#8a6028"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal — quente, terrosa */}
      <pointLight
        position={[0, 2.0, 0]}
        intensity={awakened ? 1.6 : 1.0}
        distance={9}
        color={awakened ? "#ffd896" : "#d89060"}
        decay={2}
      />
    </group>
  );
}
