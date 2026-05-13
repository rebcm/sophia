import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   PedraMaeAdama — rocha-mãe vermelha-da-terra
   ---------------------------------------------------------
   No centro de Adamá (Gn 14:2). "Adamá" significa, em hebraico,
   "vermelha como a terra" — mas a cidade flutuou e esqueceu
   esse nome. A Pedra-Mãe é o lembrete: a cor de barro úmido,
   irregular, baixa, paciente.

   Aproximar < 3m + segurar F por 5s faz a cidade descer.
   `descentProgress` cresce 0 → 1 e modula:
     - aura âmbar-terroso pulsante
     - micro-vibração da pedra (como se a terra suspirasse)
     - pontos de luz internos acendendo um a um (5)

   Sem violência. Pose contemplativa de "a terra te recebe".
   ========================================================= */

interface PedraMaeAdamaProps {
  position: [number, number, number];
  /** 0..1 — progresso da intercessão (segurando F). */
  descentProgress: number;
  /** Ref opcional do jogador — orientação suave da aura. */
  playerRef?: React.MutableRefObject<THREE.Group | null>;
}

export function PedraMaeAdama({
  position,
  descentProgress,
  playerRef,
}: PedraMaeAdamaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const innerLightsRef = useRef<THREE.Group>(null);

  // 5 lascas/blocos compondo a rocha — formas irregulares,
  // não regulares (uma rocha que recusa simetria).
  const fragments = useMemo(
    () => [
      // Base principal — grande, achatado, irregular
      {
        kind: "box" as const,
        position: [0, 0.7, 0] as [number, number, number],
        rotation: [0.12, 0.4, -0.08] as [number, number, number],
        scale: [2.6, 1.4, 2.2] as [number, number, number],
      },
      // Lasca esquerda — comprida, inclinada
      {
        kind: "box" as const,
        position: [-1.5, 0.9, 0.4] as [number, number, number],
        rotation: [-0.18, 0.9, 0.25] as [number, number, number],
        scale: [1.4, 0.9, 1.0] as [number, number, number],
      },
      // Lasca direita — alta
      {
        kind: "box" as const,
        position: [1.2, 1.3, -0.3] as [number, number, number],
        rotation: [0.1, -0.6, -0.18] as [number, number, number],
        scale: [1.0, 1.6, 1.1] as [number, number, number],
      },
      // Esfera deformada no topo — "cabeça" da pedra
      {
        kind: "sphere" as const,
        position: [0.1, 2.0, 0.1] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [0.95, 0.7, 0.85] as [number, number, number],
      },
      // Lasca pequena à frente — onde o jogador "pousa a mão"
      {
        kind: "sphere" as const,
        position: [0, 1.55, 1.05] as [number, number, number],
        rotation: [0, 0, 0.3] as [number, number, number],
        scale: [0.6, 0.5, 0.55] as [number, number, number],
      },
    ],
    [],
  );

  // 5 pontos de luz internos — acendem progressivamente
  const innerLightOffsets = useMemo(
    () => [
      [0, 0.6, 0.4],
      [-0.7, 1.0, -0.2],
      [0.6, 1.4, 0.2],
      [0.1, 1.8, 0.0],
      [0, 1.5, 0.9],
    ] as Array<[number, number, number]>,
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Micro-vibração com intercessão — a terra "responde"
    if (groupRef.current) {
      const baseY = position[1];
      const tremor =
        descentProgress > 0
          ? Math.sin(t * 14) * 0.006 * descentProgress
          : Math.sin(t * 0.35) * 0.01;
      groupRef.current.position.y = baseY + tremor;

      // Vira ligeiramente para o jogador
      if (playerRef?.current) {
        const dx = playerRef.current.position.x - position[0];
        const dz = playerRef.current.position.z - position[2];
        const targetRotY = Math.atan2(dx, dz) * 0.05;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotY,
          0.02,
        );
      }
    }

    // Aura âmbar-terroso pulsa
    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = 0.18 + descentProgress * 0.4;
      const pulse = Math.sin(t * 1.6) * 0.06;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, base + pulse, 0.1);
      const scale = 1 + descentProgress * 0.2 + Math.sin(t * 1.2) * 0.04;
      auraRef.current.scale.set(scale, scale * 0.7, scale);
    }

    // Pontos de luz internos — acendem um a um conforme progresso
    if (innerLightsRef.current) {
      const litCount = Math.min(
        5,
        Math.floor(descentProgress * 5 + 0.0001),
      );
      innerLightsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const target = i < litCount ? 0.85 + Math.sin(t * 2.5 + i) * 0.1 : 0;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.08);
        const s = i < litCount ? 1 + Math.sin(t * 2 + i * 0.7) * 0.12 : 0.4;
        mesh.scale.set(s, s, s);
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Aura âmbar-terroso pulsante no entorno */}
      <mesh ref={auraRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[2.6, 18, 14]} />
        <meshBasicMaterial
          color="#c87038"
          transparent
          opacity={0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Fragmentos da pedra — vermelho-terra irregular */}
      {fragments.map((f, i) => {
        const meshColor = "#7a3a1c";
        const emissive = "#3a1408";
        const intensity = 0.35 + descentProgress * 0.4;
        return (
          <mesh
            key={i}
            position={f.position}
            rotation={f.rotation}
            scale={f.scale}
            castShadow
            receiveShadow
          >
            {f.kind === "box" ? (
              <boxGeometry args={[1, 1, 1]} />
            ) : (
              <sphereGeometry args={[0.6, 14, 10]} />
            )}
            <meshStandardMaterial
              color={meshColor}
              emissive={emissive}
              emissiveIntensity={intensity}
              roughness={0.96}
              metalness={0.06}
            />
          </mesh>
        );
      })}

      {/* Pontos de luz internos — 5 brasas-vermelho-âmbar */}
      <group ref={innerLightsRef}>
        {innerLightOffsets.map((o, i) => (
          <mesh key={i} position={o}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshBasicMaterial
              color="#ffa450"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Luz pontual quente — cresce com a intercessão */}
      <pointLight
        position={[0, 1.6, 0]}
        intensity={0.4 + descentProgress * 1.8}
        distance={9 + descentProgress * 4}
        color="#ffa860"
        decay={2}
      />

      {/* Anel-aviso no chão (raio de intercessão visível ~3m) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[2.7, 2.95, 48]} />
        <meshBasicMaterial
          color="#c8703a"
          transparent
          opacity={0.32 + descentProgress * 0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
