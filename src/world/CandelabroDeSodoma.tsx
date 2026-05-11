import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   CandelabroDeSodoma — sete chamas suspensas sobre Sodoma
   ---------------------------------------------------------
   Sete chamas em fila num candelabro horizontal. Enquanto
   estão "apagadas" são vermelho-fumegante (o fogo de
   julgamento). Ao serem acesas pela intercessão do jogador,
   viram âmbar-dourado vivo — a luz da Mônada que ESPERA
   em vez de destruir.

   Inspirado em Gn 18:23-32. O jogador, como Abraão, intercede.
   Tratamento arquetípico, sem julgamento moral.

   Ver docs/02b-civilizacoes-do-julgamento.md (planejado)
   ========================================================= */

interface CandelabroDeSodomaProps {
  position: [number, number, number];
  /** Quantas chamas estão acesas (0..7). */
  litCount: number;
  /** Ref do jogador — para pequenos efeitos de proximidade. */
  playerRef?: React.MutableRefObject<THREE.Group | null>;
}

const FLAME_COUNT = 7;
const FLAME_SPACING = 0.55;

export function CandelabroDeSodoma({
  position,
  litCount,
  playerRef,
}: CandelabroDeSodomaProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Posições X das 7 chamas (fila simétrica, centro em 0)
  const flamePositions = useMemo(() => {
    return Array.from({ length: FLAME_COUNT }, (_, i) => {
      const offset = i - (FLAME_COUNT - 1) / 2;
      return offset * FLAME_SPACING;
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Respiração lenta — o candelabro "ouve"
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.4) * 0.015;

    // Aproximação suave do jogador: o candelabro vira um pouco
    if (playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const targetRotY = Math.atan2(dx, dz) * 0.06;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.02,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pedestal — pedra escura com cantos esverdeados de cinza antiga */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.7, 0.8, 12]} />
        <meshStandardMaterial
          color="#2a1a1a"
          roughness={0.92}
          metalness={0.1}
          emissive="#180808"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Capitel do pedestal */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.5, 0.12, 12]} />
        <meshStandardMaterial
          color="#3a2a1a"
          roughness={0.65}
          metalness={0.3}
          emissive="#1a0c04"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Haste vertical do candelabro */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.0, 10]} />
        <meshStandardMaterial
          color="#8a6a2a"
          emissive="#503010"
          emissiveIntensity={0.35}
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>

      {/* Barra horizontal — a "menorá" sustentando as 7 chamas */}
      <mesh position={[0, 1.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, FLAME_SPACING * FLAME_COUNT, 8]} />
        <meshStandardMaterial
          color="#a08040"
          emissive="#604018"
          emissiveIntensity={0.4}
          metalness={1.0}
          roughness={0.3}
        />
      </mesh>

      {/* Hastes curtas suportando cada chama */}
      {flamePositions.map((x, i) => (
        <mesh key={`stem-${i}`} position={[x, 2.05, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.18, 8]} />
          <meshStandardMaterial
            color="#a08040"
            emissive="#604018"
            emissiveIntensity={0.35}
            metalness={1.0}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* As 7 chamas */}
      {flamePositions.map((x, i) => (
        <Flame
          key={`flame-${i}`}
          position={[x, 2.22, 0]}
          phase={i * 0.7}
          lit={i < litCount}
        />
      ))}

      {/* Luz ambiente do candelabro acompanha quantas chamas estão acesas */}
      <pointLight
        position={[0, 2.4, 0]}
        intensity={0.25 + litCount * 0.5}
        distance={6 + litCount}
        color={litCount > 0 ? "#ffd070" : "#902010"}
        decay={2}
      />
    </group>
  );
}

/* ---------------- Flame ---------------- */

interface FlameProps {
  position: [number, number, number];
  /** Fase para dessincronizar pulsos entre chamas. */
  phase: number;
  /** True: acesa (âmbar-dourado). False: apagada (vermelho-escuro fumegante). */
  lit: boolean;
}

function Flame({ position, phase, lit }: FlameProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const tipRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Group>(null);

  // 4 partículas de fumaça (somente visíveis quando apagada)
  const smokeOffsets = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        x: (Math.random() - 0.5) * 0.08,
        z: (Math.random() - 0.5) * 0.08,
        speed: 0.25 + Math.random() * 0.2,
        offset: i * 0.6,
      })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Núcleo da chama — pulsa
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      const target = lit
        ? 1.4 + Math.sin(t * 3.2 + phase) * 0.35
        : 0.35 + Math.sin(t * 1.2 + phase) * 0.05;
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        target,
        0.12,
      );
      // Escala respira
      const s = lit
        ? 1 + Math.sin(t * 4 + phase) * 0.08
        : 0.7 + Math.sin(t * 1.5 + phase) * 0.04;
      coreRef.current.scale.set(s, s * (lit ? 1.2 : 0.9), s);
    }

    // Ponta superior (cone)
    if (tipRef.current) {
      const mat = tipRef.current.material as THREE.MeshStandardMaterial;
      const target = lit
        ? 1.8 + Math.sin(t * 4 + phase) * 0.4
        : 0.2;
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        target,
        0.12,
      );
      const stretch = lit
        ? 1 + Math.sin(t * 3.5 + phase) * 0.12
        : 0.55;
      tipRef.current.scale.y = stretch;
    }

    // Aura ao redor
    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      const target = lit ? 0.32 + Math.sin(t * 2 + phase) * 0.06 : 0.08;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.08);
    }

    // Fumaça — partículas subindo (só quando apagada)
    if (smokeRef.current) {
      smokeRef.current.visible = !lit;
      if (!lit) {
        smokeRef.current.children.forEach((child, i) => {
          const o = smokeOffsets[i];
          if (!o) return;
          const cycle = ((t * o.speed + o.offset) % 2) / 2; // 0..1
          child.position.y = cycle * 1.2;
          child.position.x = o.x + Math.sin(t + o.offset) * 0.04;
          child.position.z = o.z + Math.cos(t + o.offset) * 0.04;
          const m = (child as THREE.Mesh)
            .material as THREE.MeshBasicMaterial;
          m.opacity = (1 - cycle) * 0.35;
          const s = 0.04 + cycle * 0.12;
          child.scale.set(s, s, s);
        });
      }
    }
  });

  // Cores: acesa = âmbar dourado; apagada = vermelho-escuro fumegante
  const coreColor = lit ? "#ffd070" : "#5a1408";
  const coreEmissive = lit ? "#ffa028" : "#3a0a04";
  const tipColor = lit ? "#fff0c0" : "#3a0a04";
  const tipEmissive = lit ? "#ffd060" : "#200402";
  const auraColor = lit ? "#ffb840" : "#7a1a08";

  return (
    <group position={position}>
      {/* Núcleo da chama */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreEmissive}
          emissiveIntensity={lit ? 1.4 : 0.35}
          roughness={0.4}
          metalness={0.0}
          toneMapped={false}
        />
      </mesh>

      {/* Ponta superior — cone */}
      <mesh ref={tipRef} position={[0, 0.14, 0]}>
        <coneGeometry args={[0.07, 0.22, 10]} />
        <meshStandardMaterial
          color={tipColor}
          emissive={tipEmissive}
          emissiveIntensity={lit ? 1.8 : 0.2}
          roughness={0.4}
          metalness={0.0}
          toneMapped={false}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshBasicMaterial
          color={auraColor}
          transparent
          opacity={lit ? 0.32 : 0.08}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Fumaça subindo (apagada) */}
      <group ref={smokeRef} position={[0, 0.18, 0]}>
        {smokeOffsets.map((_, i) => (
          <mesh key={`smoke-${i}`}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial
              color="#3a2218"
              transparent
              opacity={0.3}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
