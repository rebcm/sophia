import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Tríade Sentinela — Os Aeons Que Não Caíram
   ---------------------------------------------------------
   Três figuras estáticas em triângulo equilátero no centro
   da ilha-fragmento de Shamballa. Não são guardiãs por dever,
   são guardiãs por escolha — optaram por permanecer no único
   fragmento do Pleroma que NÃO caiu, para que houvesse uma
   passagem de retorno para quem se lembrasse.

   A primeira ensina silêncio (cabeça baixa, mãos cruzadas).
   A segunda ensina escuta (cabeça levemente inclinada).
   A terceira ensina paciência (cabeça erguida, olhar longe).

   Sem combate. Sem confronto. A mecânica é contemplação tripla
   em sequência. Quando o jogador foca em uma sentinela ela
   intensifica seu brilho — sinal de que está sendo "vista".

   Ver docs/22-civilizacoes-expandidas.md §2.2 (Shamballa).
   ========================================================= */

interface TriadeSentinelaProps {
  position: [number, number, number];
  contemplated: [boolean, boolean, boolean];
  focusedIndex: 0 | 1 | 2 | null;
}

const TRIANGLE_RADIUS = 1.9;

export function TriadeSentinela({
  position,
  contemplated,
  focusedIndex,
}: TriadeSentinelaProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position}>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * TRIANGLE_RADIUS;
        const z = Math.sin(angle) * TRIANGLE_RADIUS;
        const facing = Math.atan2(-x, -z);
        return (
          <Sentinela
            key={`sent-${i}`}
            kind={i as 0 | 1 | 2}
            position={[x, 0, z]}
            rotationY={facing}
            contemplated={contemplated[i]}
            focused={focusedIndex === i}
          />
        );
      })}

      {/* Glifo central — anel-de-luz no chão entre as três sentinelas */}
      <CenterGlyph contemplated={contemplated} />
    </group>
  );
}

interface SentinelaProps {
  kind: 0 | 1 | 2;
  position: [number, number, number];
  rotationY: number;
  contemplated: boolean;
  focused: boolean;
}

function Sentinela({
  kind,
  position,
  rotationY,
  contemplated,
  focused,
}: SentinelaProps) {
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const focusBoost = focused ? 0.32 : 0;
    const lembrada = contemplated ? 0.18 : 0;

    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        0.22 + lembrada + focusBoost + Math.sin(t * 0.5 + kind) * 0.05;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.35 + kind) * 0.03 + focusBoost * 0.3,
      );
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        0.06 + focusBoost * 0.25 + lembrada * 0.4 + Math.sin(t * 0.25) * 0.02;
    }
    if (innerRef.current) {
      const m = innerRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        0.55 + focusBoost + lembrada + Math.sin(t * 0.6 + kind) * 0.08;
    }

    // Postura específica de cada sentinela — quase imperceptível
    if (headRef.current) {
      let target = 0;
      if (kind === 0) target = 0.32; // silêncio: cabeça baixa
      else if (kind === 1) target = -0.05; // escuta: levemente inclinada
      else target = -0.18; // paciência: olhar longo, leve subida
      const breathe = Math.sin(t * 0.4 + kind) * 0.015;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target + breathe,
        0.04,
      );
      if (kind === 1) {
        headRef.current.rotation.z = Math.sin(t * 0.2) * 0.07;
      }
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Manto longo branco-luminoso (cilindro alongado) */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.58, 1.9, 14]} />
        <meshStandardMaterial
          color="#f4f0e2"
          emissive="#d8d0b8"
          emissiveIntensity={0.42}
          roughness={0.6}
          metalness={0.08}
        />
      </mesh>

      {/* Borda inferior do manto — anel branco prata */}
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.04, 8, 22]} />
        <meshStandardMaterial
          color="#e8e0c8"
          emissive="#a8a088"
          emissiveIntensity={0.4}
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>

      {/* Selo no peito — círculo emissivo (símbolo do silêncio/escuta/paciência) */}
      <mesh ref={innerRef} position={[0, 1.45, 0.38]}>
        <circleGeometry args={[0.16, 18]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={
            kind === 0 ? "#c8d8ff" : kind === 1 ? "#e8e0c8" : "#d8c8ff"
          }
          emissiveIntensity={0.7}
          roughness={0.4}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mãos cruzadas (silêncio) — duas pequenas esferas à frente do manto */}
      {kind === 0 && (
        <>
          <mesh position={[-0.1, 1.18, 0.36]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial
              color="#f4ecd6"
              emissive="#a89c70"
              emissiveIntensity={0.25}
              roughness={0.7}
            />
          </mesh>
          <mesh position={[0.1, 1.16, 0.36]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial
              color="#f4ecd6"
              emissive="#a89c70"
              emissiveIntensity={0.25}
              roughness={0.7}
            />
          </mesh>
        </>
      )}

      {/* Cabeça */}
      <mesh ref={headRef} position={[0, 2.18, 0]} castShadow>
        <sphereGeometry args={[0.27, 18, 14]} />
        <meshStandardMaterial
          color="#e8dec0"
          emissive="#807458"
          emissiveIntensity={0.22}
          roughness={0.72}
          metalness={0.05}
        />
      </mesh>

      {/* Auréola sutil — anel finíssimo sobre a cabeça */}
      <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.018, 6, 24]} />
        <meshBasicMaterial
          color="#fffce8"
          transparent
          opacity={contemplated ? 0.85 : 0.45}
          toneMapped={false}
        />
      </mesh>

      {/* Aura branca interna — pulsa lenta */}
      <mesh ref={auraRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial
          color="#fff8e8"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — quase invisível, é mais sentido que visto */}
      <mesh ref={haloRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[2.4, 18, 18]} />
        <meshBasicMaterial
          color="#e8e0ff"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal — branco-azulado, fragmento do Pleroma */}
      <pointLight
        position={[0, 1.8, 0]}
        intensity={contemplated ? 1.2 : 0.75}
        distance={7}
        color={contemplated ? "#ffffff" : "#ece8d8"}
        decay={2}
      />
    </group>
  );
}

interface CenterGlyphProps {
  contemplated: [boolean, boolean, boolean];
}

function CenterGlyph({ contemplated }: CenterGlyphProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const completedCount = contemplated.filter(Boolean).length;

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    const m = ringRef.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.35 + completedCount * 0.18 + Math.sin(t * 0.5) * 0.06;
    ringRef.current.rotation.z = t * 0.05;
  });

  return (
    <group>
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
      >
        <ringGeometry args={[0.7, 0.92, 36]} />
        <meshBasicMaterial
          color="#fff8e8"
          transparent
          opacity={0.4}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Três pontinhos no anel — acendem ao completar cada contemplação */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const r = 0.81;
        return (
          <mesh
            key={`dot-${i}`}
            position={[Math.cos(a) * r, 0.08, Math.sin(a) * r]}
          >
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial
              color={contemplated[i] ? "#ffffff" : "#5a5040"}
              transparent
              opacity={contemplated[i] ? 1 : 0.55}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
