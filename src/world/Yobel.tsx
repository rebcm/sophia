import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Yobel — o Inca-Solitário (2º Arconte adormecido)
   ---------------------------------------------------------
   Figura coberta de ouro num trono baixo. Esquecera que o
   trono era para servir, e passou a cobiçar ser visto.
   Adormece com aura dourada-falsa que escoa para os Sleepers
   que carregam barras invisíveis ao seu redor.
   Ver docs/02d-civilizacoes-perdidas.md §4
   ========================================================= */

interface YobelProps {
  position: [number, number, number];
  /** True quando despertado — ouro escoa de volta para os Sleepers. */
  awakened?: boolean;
}

export function Yobel({ position, awakened = false }: YobelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const goldShellRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Respiração pesada — o ouro abafa o corpo
    const breath = 1 + Math.sin(t * 0.4) * 0.015;
    if (goldShellRef.current) goldShellRef.current.scale.y = breath;

    // Aura dourada-falsa pulsa enquanto dorme; some quando desperta
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      if (awakened) {
        m.opacity = THREE.MathUtils.lerp(m.opacity, 0, 0.04);
      } else {
        m.opacity = 0.35 + Math.sin(t * 0.7) * 0.1;
      }
    }

    // Cabeça pende ao despertar (lembrou — perdão)
    if (headRef.current) {
      const targetX = awakened ? 0.6 : 0.15;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        targetX,
        0.03,
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Trono baixo — pedra com lascas de ouro */}
      <mesh position={[0, 0.3, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.6, 1.2]} />
        <meshStandardMaterial
          color="#3a2818"
          roughness={0.85}
          metalness={0.15}
          emissive="#1a0e08"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Casca de ouro do corpo (cilindro alongado coberto) */}
      <mesh ref={goldShellRef} position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.48, 1.8, 16]} />
        <meshStandardMaterial
          color={awakened ? "#a07840" : "#ffd45a"}
          emissive={awakened ? "#2a1c08" : "#c88a18"}
          emissiveIntensity={awakened ? 0.1 : 0.6}
          roughness={0.25}
          metalness={0.95}
        />
      </mesh>

      {/* Cabeça com coroa */}
      <mesh ref={headRef} position={[0, 2.45, 0]} castShadow>
        <sphereGeometry args={[0.32, 18, 14]} />
        <meshStandardMaterial
          color={awakened ? "#b08868" : "#ffe0a0"}
          emissive={awakened ? "#1a0e08" : "#c88a18"}
          emissiveIntensity={awakened ? 0.05 : 0.4}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Coroa — anel dourado */}
      <mesh position={[0, 2.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.06, 10, 24]} />
        <meshStandardMaterial
          color="#ffe9a0"
          emissive="#ffd45a"
          emissiveIntensity={awakened ? 0.15 : 0.7}
          roughness={0.2}
          metalness={1.0}
        />
      </mesh>

      {/* Pontas da coroa */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.34, 2.95, Math.sin(a) * 0.34]}
          >
            <coneGeometry args={[0.05, 0.22, 6]} />
            <meshStandardMaterial
              color="#ffe9a0"
              emissive="#ffd45a"
              emissiveIntensity={awakened ? 0.15 : 0.7}
              metalness={1.0}
              roughness={0.2}
            />
          </mesh>
        );
      })}

      {/* Aura dourada-falsa em volta — some ao despertar */}
      <mesh ref={auraRef} position={[0, 1.4, 0]}>
        <sphereGeometry args={[1.8, 24, 24]} />
        <meshBasicMaterial
          color="#ffd45a"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pontual para realçar quando dormindo */}
      {!awakened && (
        <pointLight
          position={[0, 1.8, 0]}
          intensity={0.8}
          distance={6}
          color="#ffd45a"
          decay={2}
        />
      )}
    </group>
  );
}
