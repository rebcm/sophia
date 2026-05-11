import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   <AnjoCaidoShrine /> — pequeno altar para cada Anjo Caído
   ---------------------------------------------------------
   Cada um dos seis manifesta-se diferente. Compartilham
   estrutura: pedestal hexagonal + prop simbólico + aura.
   Quando redimido (`redeemed=true`), a aura inverte para
   dourada e o prop suaviza/dissipa.
   Ver docs/03e-anjos-caidos-religioes.md
   ========================================================= */

export type CaidoId =
  | "asmodeus"
  | "lucifer"
  | "belial"
  | "azazel"
  | "semyaza"
  | "leviata";

interface AnjoCaidoShrineProps {
  id: CaidoId;
  position: [number, number, number];
  redeemed?: boolean;
}

interface CaidoVisual {
  label: string;
  color: string;
  emissive: string;
  /** Prop visual no centro do pedestal. */
  prop: "trono" | "espelho" | "moeda" | "livro" | "piramide" | "onda";
}

const VISUALS: Record<CaidoId, CaidoVisual> = {
  asmodeus: {
    label: "Asmodeus",
    color: "#c83a3a",
    emissive: "#ffd45a",
    prop: "trono",
  },
  lucifer: {
    label: "Lúcifer",
    color: "#a8a8c8",
    emissive: "#dddde8",
    prop: "espelho",
  },
  belial: {
    label: "Belial",
    color: "#3a8a4a",
    emissive: "#a8d870",
    prop: "moeda",
  },
  azazel: {
    label: "Azazel",
    color: "#5a3818",
    emissive: "#d8784a",
    prop: "livro",
  },
  semyaza: {
    label: "Semyaza",
    color: "#a07840",
    emissive: "#ffe0a0",
    prop: "piramide",
  },
  leviata: {
    label: "Leviatã",
    color: "#1a2840",
    emissive: "#5a78c8",
    prop: "onda",
  },
};

export function AnjoCaidoShrine({
  id,
  position,
  redeemed = false,
}: AnjoCaidoShrineProps) {
  const groupRef = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const v = VISUALS[id];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    if (propRef.current) {
      propRef.current.rotation.y = t * 0.3;
      propRef.current.position.y =
        1.0 + Math.sin(t * 0.6) * (redeemed ? 0.04 : 0.1);
    }
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = redeemed
        ? 0.25 + Math.sin(t * 0.4) * 0.05
        : 0.55 + Math.sin(t * 1.5) * 0.15;
      // Cor inverte ao redimir
      const c = redeemed ? "#ffd45a" : v.emissive;
      m.color.set(c);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pedestal hexagonal */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.8, 6]} />
        <meshStandardMaterial
          color={redeemed ? "#5a4828" : v.color}
          emissive={redeemed ? "#ffd45a" : v.emissive}
          emissiveIntensity={redeemed ? 0.35 : 0.25}
          roughness={0.65}
          metalness={0.25}
        />
      </mesh>

      {/* Prop simbólico flutuante */}
      <group ref={propRef}>
        <ShrineProp prop={v.prop} color={v.emissive} redeemed={redeemed} />
      </group>

      {/* Aura ao redor */}
      <mesh ref={auraRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.6, 20, 20]} />
        <meshBasicMaterial
          color={v.emissive}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pontual */}
      <pointLight
        position={[0, 1.4, 0]}
        intensity={redeemed ? 1.2 : 1.6}
        distance={5}
        color={redeemed ? "#ffd45a" : v.emissive}
        decay={2}
      />
    </group>
  );
}

function ShrineProp({
  prop,
  color,
  redeemed,
}: {
  prop: CaidoVisual["prop"];
  color: string;
  redeemed: boolean;
}) {
  const matColor = redeemed ? "#ffd45a" : color;
  const emissive = redeemed ? "#fff5d8" : color;
  switch (prop) {
    case "trono":
      return (
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.5, 0.4]} />
          <meshStandardMaterial
            color={matColor}
            emissive={emissive}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      );
    case "espelho":
      return (
        <mesh castShadow rotation={[0, 0, 0]}>
          <planeGeometry args={[0.55, 0.85]} />
          <meshStandardMaterial
            color={matColor}
            emissive={emissive}
            emissiveIntensity={0.45}
            metalness={1.0}
            roughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    case "moeda":
      return (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 24]} />
          <meshStandardMaterial
            color={matColor}
            emissive={emissive}
            emissiveIntensity={0.5}
            metalness={1.0}
            roughness={0.2}
          />
        </mesh>
      );
    case "livro":
      return (
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.5, 0.15]} />
          <meshStandardMaterial
            color={matColor}
            emissive={emissive}
            emissiveIntensity={0.4}
            roughness={0.7}
          />
        </mesh>
      );
    case "piramide":
      return (
        <mesh castShadow>
          <coneGeometry args={[0.45, 0.85, 4]} />
          <meshStandardMaterial
            color={matColor}
            emissive={emissive}
            emissiveIntensity={0.45}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      );
    case "onda":
    default:
      return (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.1, 12, 24]} />
          <meshStandardMaterial
            color={matColor}
            emissive={emissive}
            emissiveIntensity={0.45}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
      );
  }
}
