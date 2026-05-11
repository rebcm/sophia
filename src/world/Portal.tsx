import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

/* =========================================================
   <Portal /> — gateway visual entre cenas
   ---------------------------------------------------------
   Visual: torus vertical de luz + flutuação vertical + halo
   externo + label flutuante.

   Detecta aproximação do jogador (via player ref). Quando
   próximo, brilha mais e o label fica mais legível.
   ========================================================= */

interface PortalProps {
  position: [number, number, number];
  label: string;
  /** Texto adicional menor (ex: "Já visitado"). */
  subLabel?: string;
  /** Cor primária do portal. */
  color?: string;
  /** Ref do player para distância. */
  playerRef?: React.MutableRefObject<THREE.Group | null>;
  /** Distância a partir da qual considera-se "perto". */
  proximityDistance?: number;
  /** Callback quando o jogador entra/sai do raio. */
  onProximityChange?: (near: boolean) => void;
  /** Se desabilitado, fica acinzentado. */
  enabled?: boolean;
}

export function Portal({
  position,
  label,
  subLabel,
  color = "#87E1FF",
  playerRef,
  proximityDistance = 3.5,
  onProximityChange,
  enabled = true,
}: PortalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const lastNear = useRef(false);

  const [near, setNear] = useState(false);

  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const dimColor = useMemo(() => new THREE.Color("#444a5a"), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Flutuação vertical
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.12;

    // Rotação suave do torus
    if (torusRef.current) {
      torusRef.current.rotation.y = t * 0.25;
    }

    // Halo gira mais devagar em sentido oposto
    if (haloRef.current) {
      haloRef.current.rotation.y = -t * 0.15;
    }

    // Detectar proximidade do jogador
    if (playerRef?.current) {
      const dx = playerRef.current.position.x - position[0];
      const dz = playerRef.current.position.z - position[2];
      const dist = Math.hypot(dx, dz);
      const isNear = dist < proximityDistance;
      if (isNear !== lastNear.current) {
        lastNear.current = isNear;
        setNear(isNear);
        onProximityChange?.(isNear);
      }
    }
  });

  const intensity = enabled ? (near ? 2.2 : 1.4) : 0.5;
  const opacity = enabled ? (near ? 0.85 : 0.6) : 0.3;
  const activeColor = enabled ? baseColor : dimColor;

  return (
    <group ref={groupRef} position={position}>
      {/* Torus principal (anel vertical) */}
      <mesh ref={torusRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.12, 16, 64]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={intensity}
          roughness={0.2}
          metalness={0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Halo externo (anel grande translúcido) */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.04, 12, 48]} />
        <meshBasicMaterial
          color={activeColor}
          transparent
          opacity={opacity * 0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Disco interno (membrana do portal) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 48]} />
        <meshBasicMaterial
          color={activeColor}
          transparent
          opacity={opacity * 0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Luz pontual */}
      <pointLight
        color={activeColor}
        intensity={enabled ? (near ? 3.0 : 1.5) : 0.4}
        distance={6}
        decay={2}
      />

      {/* Label flutuante */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.28}
        color={enabled ? "#ffe9d0" : "#888"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#000"
        outlineOpacity={0.6}
      >
        {label}
      </Text>

      {subLabel && (
        <Text
          position={[0, 1.85, 0]}
          fontSize={0.18}
          color={enabled ? "#c9b0ff" : "#666"}
          anchorX="center"
          anchorY="middle"
          fontStyle="italic"
          outlineWidth={0.008}
          outlineColor="#000"
          outlineOpacity={0.5}
        >
          {subLabel}
        </Text>
      )}
    </group>
  );
}
