import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";
import { useSoulStore } from "../state/soulStore";

/* =========================================================
   Whisperer — A Sussurrante de Sophia
   ---------------------------------------------------------
   Orbe de luz com núcleo pulsante e três anéis orbitais.
   Segue o jogador a uma distância gentil. Aparece pela
   primeira vez na fase "whisper-arrives".
   ========================================================= */

interface WhispererProps {
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function Whisperer({ playerRef }: WhispererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3(0, 1.6, 4));

  const phase = useGameStore((s) => s.phase);
  // Forma humanoide após derrotar o Auto-Sabotador
  const humanoid = useSoulStore((s) => s.hasAwakened("auto-sabotador"));

  /* posição inicial fora do mundo */
  const startPos = useMemo(() => new THREE.Vector3(20, 8, -15), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    /* === movimento === */
    if (phase === "intro" || phase === "awaken") {
      // ainda não chegou
      groupRef.current.position.copy(startPos);
    } else if (phase === "whisper-arrives") {
      // entra suavemente, fica perto do jogador
      const target = playerRef?.current
        ? new THREE.Vector3(
            playerRef.current.position.x + 1.0,
            playerRef.current.position.y + 1.4,
            playerRef.current.position.z + 1.4,
          )
        : new THREE.Vector3(1.0, 1.6, 6 + 1.4);
      groupRef.current.position.lerp(target, delta * 1.0);
    } else {
      // a partir daí, segue o jogador com leveza
      if (playerRef?.current) {
        const offsetX = Math.cos(t * 0.4) * 1.2;
        const offsetZ = Math.sin(t * 0.4) * 1.0;
        targetPos.current.set(
          playerRef.current.position.x + offsetX,
          playerRef.current.position.y + 1.4 + Math.sin(t * 1.2) * 0.15,
          playerRef.current.position.z + offsetZ,
        );
        groupRef.current.position.lerp(targetPos.current, delta * 2.0);
      }
    }

    /* === núcleo pulsa === */
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 1.6) * 0.08;
      coreRef.current.scale.setScalar(pulse);
      const m = coreRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.85 + Math.sin(t * 1.6) * 0.15;
    }

    /* === anéis orbitam === */
    if (ring1.current) ring1.current.rotation.z = t * 0.6;
    if (ring2.current) {
      ring2.current.rotation.x = Math.PI / 3;
      ring2.current.rotation.z = -t * 0.8;
    }
    if (ring3.current) {
      ring3.current.rotation.x = -Math.PI / 4;
      ring3.current.rotation.y = Math.PI / 5;
      ring3.current.rotation.z = t * 0.4;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 1.3 + Math.sin(t * 2.0) * 0.25;
    }

    // Quando humanoide, o torso pulsa suavemente
    if (humanoid && torsoRef.current) {
      const breath = 1 + Math.sin(t * 0.8) * 0.04;
      torsoRef.current.scale.y = breath;
    }
    if (humanoid && headRef.current) {
      headRef.current.position.y = 0.55 + Math.sin(t * 0.8) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={startPos}>
      {/* Núcleo */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshBasicMaterial color="#fff5d8" transparent opacity={0.95} />
      </mesh>
      {/* Glow externo */}
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial
          color="#ffd4a8"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      {/* Anel 1 */}
      <mesh ref={ring1}>
        <ringGeometry args={[0.45, 0.5, 64]} />
        <meshBasicMaterial
          color="#ffe9d0"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Anel 2 */}
      <mesh ref={ring2}>
        <ringGeometry args={[0.55, 0.58, 64]} />
        <meshBasicMaterial
          color="#ffc28a"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Anel 3 */}
      <mesh ref={ring3}>
        <ringGeometry args={[0.7, 0.72, 64]} />
        <meshBasicMaterial
          color="#ffb3cc"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Luz */}
      <pointLight
        ref={lightRef}
        color="#ffe9d0"
        intensity={1.4}
        distance={6}
        decay={2}
      />

      {/* Forma humanoide etérica — só após despertar o Auto-Sabotador */}
      {humanoid && (
        <group position={[0, -0.6, 0]}>
          {/* Torso translúcido */}
          <mesh ref={torsoRef} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 0.9, 12]} />
            <meshBasicMaterial
              color="#ffe9d0"
              transparent
              opacity={0.28}
              depthWrite={false}
            />
          </mesh>
          {/* Cabeça */}
          <mesh ref={headRef} position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <meshBasicMaterial
              color="#fff5d8"
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
          {/* Braços — duas tiras finas */}
          <mesh position={[0.28, 0.1, 0]} rotation={[0, 0, 0.4]}>
            <cylinderGeometry args={[0.05, 0.06, 0.7, 8]} />
            <meshBasicMaterial
              color="#ffd4a8"
              transparent
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-0.28, 0.1, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.05, 0.06, 0.7, 8]} />
            <meshBasicMaterial
              color="#ffd4a8"
              transparent
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
