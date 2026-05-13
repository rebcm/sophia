import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   JonasDaMemoria — Lendário de Nínive
   ---------------------------------------------------------
   Figura masculina madura, em pé encostada num jarro de
   cinzas (referência a Jonas 3:6 — rei vestido de saco). Manto
   longo com capuz, tons sépia; vestes ainda úmidas como se
   houvesse chegado de algum lugar (a baleia é o útero antes
   do renascimento, Jonas 2). Sandálias simples.

   Jonas fugiu, foi engolido, voltou, pregou — e Nínive
   lembrou. Aqui ele NÃO carrega vergonha; carrega memória
   de uma cidade que ouviu antes da última hora.

   Aura mais discreta âmbar-baço. Sem mecânica de despertar.
   F dispara cinemática "jonas-de-ninive" via scene.

   Ver docs/22-civilizacoes-expandidas.md §4.7 (Nínive).
   ========================================================= */

interface JonasDaMemoriaProps {
  position: [number, number, number];
  metByPlayer?: boolean;
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function JonasDaMemoria({
  position,
  metByPlayer = false,
  playerRef,
}: JonasDaMemoriaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const hoodRef = useRef<THREE.Group>(null);
  const wetSheenRef = useRef<THREE.Mesh>(null);

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

    // Capuz inclina-se lentamente como se ouvisse
    if (hoodRef.current && playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const targetY = Math.atan2(dx, dz) * 0.35;
      hoodRef.current.rotation.y = THREE.MathUtils.lerp(
        hoodRef.current.rotation.y,
        targetY,
        0.035,
      );
    }

    // Vestes molhadas — brilho sutil pulsante (luz refletida)
    if (wetSheenRef.current) {
      const m = wetSheenRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.16 + Math.sin(t * 0.6) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Manto longo — cilindro alongado em sépia (em pé) */}
      <mesh
        ref={wetSheenRef}
        position={[0, 0.95, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.34, 0.55, 1.85, 14]} />
        <meshStandardMaterial
          color="#8a6a48"
          emissive="#3a2818"
          emissiveIntensity={0.18}
          roughness={0.62}
          metalness={0.22}
        />
      </mesh>

      {/* Faixa-corda na cintura — corda escura */}
      <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.035, 6, 18]} />
        <meshStandardMaterial
          color="#2a1808"
          emissive="#180c04"
          emissiveIntensity={0.14}
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* Sandálias — duas placas baixas */}
      <mesh position={[-0.15, 0.04, 0.18]}>
        <boxGeometry args={[0.18, 0.05, 0.32]} />
        <meshStandardMaterial
          color="#3a2410"
          emissive="#1a0c04"
          emissiveIntensity={0.12}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0.15, 0.04, 0.18]}>
        <boxGeometry args={[0.18, 0.05, 0.32]} />
        <meshStandardMaterial
          color="#3a2410"
          emissive="#1a0c04"
          emissiveIntensity={0.12}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Conjunto capuz + cabeça */}
      <group ref={hoodRef} position={[0, 1.9, 0]}>
        {/* Cabeça */}
        <mesh castShadow>
          <sphereGeometry args={[0.24, 18, 14]} />
          <meshStandardMaterial
            color="#d8b890"
            emissive="#7a5838"
            emissiveIntensity={0.16}
            roughness={0.78}
            metalness={0.04}
          />
        </mesh>

        {/* Capuz — meia-esfera maior ao redor da cabeça, mais para trás */}
        <mesh position={[0, 0.04, -0.04]} castShadow>
          <sphereGeometry
            args={[0.34, 18, 14, 0, Math.PI * 2, 0, Math.PI / 1.6]}
          />
          <meshStandardMaterial
            color="#6a4824"
            emissive="#2a1808"
            emissiveIntensity={0.14}
            roughness={0.7}
            metalness={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Olhos — duas faíscas sépia profundas, sob a sombra do capuz */}
        <mesh position={[-0.08, 0.0, 0.21]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#6a3818" toneMapped={false} />
        </mesh>
        <mesh position={[0.08, 0.0, 0.21]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#6a3818" toneMapped={false} />
        </mesh>

        {/* Barba curta escura — esfera achatada no queixo */}
        <mesh position={[0, -0.18, 0.13]}>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial
            color="#3a2418"
            emissive="#1a0c04"
            emissiveIntensity={0.18}
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Mão direita apoiada no jarro (sugestão — esfera) */}
      <mesh position={[0.36, 0.78, 0.18]} castShadow>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial
          color="#d8b890"
          emissive="#7a5838"
          emissiveIntensity={0.16}
          roughness={0.78}
        />
      </mesh>

      {/* Jarro de cinzas ao lado direito — referência a Jonas 3:6 */}
      <group position={[0.7, 0, 0.18]}>
        {/* Corpo do jarro */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.36, 0.9, 16]} />
          <meshStandardMaterial
            color="#5a3a22"
            emissive="#2a180a"
            emissiveIntensity={0.16}
            roughness={0.88}
            metalness={0.08}
          />
        </mesh>
        {/* Boca do jarro — anel */}
        <mesh position={[0, 0.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.04, 8, 18]} />
          <meshStandardMaterial
            color="#3a2410"
            emissive="#1a0c04"
            emissiveIntensity={0.18}
            roughness={0.82}
            metalness={0.1}
          />
        </mesh>
        {/* Cinzas — disco cinza-claro dentro do jarro */}
        <mesh
          position={[0, 0.88, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.24, 24]} />
          <meshStandardMaterial
            color="#b8b0a4"
            emissive="#88847c"
            emissiveIntensity={0.32}
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Aura âmbar-baço interna (mais discreta que Loth) */}
      <mesh ref={auraRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[1.35, 24, 24]} />
        <meshBasicMaterial
          color="#d8a868"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo */}
      <mesh ref={haloRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[2.1, 18, 18]} />
        <meshBasicMaterial
          color="#c89868"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal âmbar-baço */}
      <pointLight
        position={[0, 1.8, 0]}
        intensity={metByPlayer ? 0.95 : 0.7}
        distance={6}
        color="#dca878"
        decay={2}
      />
    </group>
  );
}
