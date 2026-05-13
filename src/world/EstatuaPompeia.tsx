import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   EstatuaPompeia — figura humanoide congelada em pose cotidiana
   ---------------------------------------------------------
   Pompeia foi soterrada por cinzas em 79 d.C. — moldes humanos
   captaram pessoas no exato instante em que viviam sem perceber
   que viviam. Comendo. Conversando. Abraçando. Varrendo.

   Antes do "olhar contemplativo": figura cinza-rocha cor-cinzas,
   parcialmente opaca, totalmente parada — como se a vida tivesse
   sido roubada antes que a percepção dela chegasse.

   Depois (awakened): a cabeça vira lentamente em direção ao
   jogador (lerp em rotation.y do head mesh) + leve brilho dourado
   na pele e nos olhos. Não há som, não há fala — apenas: "tu
   estiveste aqui o tempo todo".

   5 variantes de pose cotidiana:
     0 — comer (braço dobrado, segurando algo invisível à boca)
     1 — conversar com alguém invisível (braços abertos)
     2 — abraçar alguém invisível (ambos braços fechados à frente)
     3 — varrer (inclinada para a frente, braços segurando cabo)
     4 — sentar lendo (sentada, braços segurando livro invisível)

   Ver docs/22-civilizacoes-expandidas.md §4.10
   ========================================================= */

interface EstatuaPompeiaProps {
  position: [number, number, number];
  rotY?: number;
  variant: 0 | 1 | 2 | 3 | 4;
  /** true quando contemplada por 3s — vira a cabeça e brilha leve. */
  awakened: boolean;
}

export function EstatuaPompeia({
  position,
  rotY = 0,
  variant,
  awakened,
}: EstatuaPompeiaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Direção alvo da cabeça quando despertada: olhar levemente para
  // o jogador (na coordenada global). Mantemos um offset estático
  // para que a "virada" pareça suave e consistente entre variantes.
  const wakeOffsetY = useMemo(() => {
    // Cada variante vira a cabeça para um ângulo levemente diferente
    // — algumas miram mais para a "câmera ideal" (frente da rua),
    // outras desviam um pouco como se acabassem de notar algo.
    const map: Record<number, number> = {
      0: 0.55,
      1: -0.3,
      2: 0.0,
      3: 0.7,
      4: -0.45,
    };
    return map[variant] ?? 0;
  }, [variant]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Cabeça: antes, totalmente parada (rotação 0). Depois, rotaciona
    // suavemente para wakeOffsetY usando lerp.
    if (headRef.current) {
      const target = awakened ? wakeOffsetY : 0;
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        target,
        0.025,
      );
      // Após despertada, respiração mínima
      if (awakened) {
        headRef.current.position.y =
          headOffsetY(variant) + Math.sin(t * 0.7) * 0.01;
      }
    }

    // Aura dourada cresce sutil ao despertar
    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      const targetOp = awakened ? 0.22 + Math.sin(t * 0.8) * 0.04 : 0;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOp, 0.04);
      const targetScale = awakened ? 1 + Math.sin(t * 0.9) * 0.03 : 0.85;
      auraRef.current.scale.setScalar(targetScale);
    }

    // Luz pontual suavíssima
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        awakened ? 0.55 : 0,
        0.04,
      );
    }
  });

  // Cor da pedra-cinzas: tom levemente quente quando despertada.
  const stone = awakened ? "#8a7a64" : "#5a544c";
  const stoneEmissive = awakened ? "#3a2a14" : "#000000";
  const stoneEmissiveIntensity = awakened ? 0.32 : 0;

  return (
    <group ref={groupRef} position={position} rotation={[0, rotY, 0]}>
      {/* Aura dourada — só aparece despertada */}
      <mesh ref={auraRef} position={[0, 1.05, 0]}>
        <sphereGeometry args={[1.25, 18, 14]} />
        <meshBasicMaterial
          color="#ffd070"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 1.4, 0]}
        intensity={0}
        distance={4.5}
        color="#ffd078"
        decay={2}
      />

      {/* Corpo da estátua — varia conforme variant */}
      <BodyByVariant
        variant={variant}
        stone={stone}
        stoneEmissive={stoneEmissive}
        stoneEmissiveIntensity={stoneEmissiveIntensity}
      />

      {/* Cabeça — referência separada para girar */}
      <mesh
        ref={headRef}
        position={[0, headOffsetY(variant), headOffsetZ(variant)]}
        castShadow
      >
        <sphereGeometry args={[0.18, 16, 14]} />
        <meshStandardMaterial
          color={stone}
          emissive={awakened ? "#5a3a14" : "#000000"}
          emissiveIntensity={awakened ? 0.45 : 0}
          roughness={0.95}
          metalness={0.04}
          transparent={!awakened}
          opacity={awakened ? 1 : 0.92}
        />
      </mesh>

      {/* "Olhos" — minúsculas escleras quase invisíveis que ganham
          um brilho âmbar quando desperta. Posicionados no head local
          (independem da rotação do head — ficam relativos ao mesh). */}
      {awakened && (
        <group
          position={[0, headOffsetY(variant), headOffsetZ(variant) + 0.16]}
        >
          <mesh position={[-0.05, 0.02, 0]}>
            <sphereGeometry args={[0.02, 8, 6]} />
            <meshBasicMaterial color="#ffd070" toneMapped={false} />
          </mesh>
          <mesh position={[0.05, 0.02, 0]}>
            <sphereGeometry args={[0.02, 8, 6]} />
            <meshBasicMaterial color="#ffd070" toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ---------------- Body geometry por variante ---------------- */

interface BodyProps {
  variant: 0 | 1 | 2 | 3 | 4;
  stone: string;
  stoneEmissive: string;
  stoneEmissiveIntensity: number;
}

function BodyByVariant({
  variant,
  stone,
  stoneEmissive,
  stoneEmissiveIntensity,
}: BodyProps) {
  const matProps = {
    color: stone,
    emissive: stoneEmissive,
    emissiveIntensity: stoneEmissiveIntensity,
    roughness: 0.96,
    metalness: 0.04,
  } as const;

  switch (variant) {
    case 0:
      // Comer — torso ereto, braço direito dobrado segurando algo à boca
      return (
        <group>
          <mesh castShadow position={[0, 0.55, 0]}>
            <coneGeometry args={[0.32, 1.1, 10]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Braço esquerdo solto */}
          <mesh
            castShadow
            position={[-0.22, 0.7, 0.05]}
            rotation={[0.1, 0, 0.15]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Braço direito dobrado para boca */}
          <mesh
            castShadow
            position={[0.18, 0.82, 0.15]}
            rotation={[0.6, 0, -1.1]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* "Algo" invisível à boca — mantemos um cubinho minúsculo para silhueta */}
          <mesh position={[0.06, 1.05, 0.18]}>
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );

    case 1:
      // Conversar — torso ereto, ambos braços abertos em gesto
      return (
        <group>
          <mesh castShadow position={[0, 0.55, 0]}>
            <coneGeometry args={[0.32, 1.1, 10]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh
            castShadow
            position={[-0.3, 0.78, 0.05]}
            rotation={[0, 0, 0.9]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh
            castShadow
            position={[0.3, 0.78, 0.05]}
            rotation={[0, 0, -0.9]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );

    case 2:
      // Abraçar — torso ereto, braços fechando à frente
      return (
        <group>
          <mesh castShadow position={[0, 0.55, 0]}>
            <coneGeometry args={[0.32, 1.1, 10]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh
            castShadow
            position={[-0.16, 0.75, 0.22]}
            rotation={[0.7, 0, 0.4]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh
            castShadow
            position={[0.16, 0.75, 0.22]}
            rotation={[0.7, 0, -0.4]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );

    case 3:
      // Varrer — torso inclinado para frente, braços segurando cabo
      return (
        <group rotation={[0.35, 0, 0]}>
          <mesh castShadow position={[0, 0.52, 0]}>
            <coneGeometry args={[0.32, 1.1, 10]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh
            castShadow
            position={[-0.12, 0.7, 0.32]}
            rotation={[1.0, 0, 0.1]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh
            castShadow
            position={[0.12, 0.7, 0.32]}
            rotation={[1.0, 0, -0.1]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Cabo da vassoura */}
          <mesh
            castShadow
            position={[0, 0.45, 0.55]}
            rotation={[0.7, 0, 0]}
          >
            <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );

    case 4:
    default:
      // Sentar lendo — torso curto sentado, braços segurando livro
      return (
        <group>
          {/* Banco de pedra discreto */}
          <mesh castShadow receiveShadow position={[0, 0.16, -0.05]}>
            <boxGeometry args={[0.7, 0.32, 0.5]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Torso sentado */}
          <mesh castShadow position={[0, 0.55, 0]}>
            <coneGeometry args={[0.28, 0.7, 10]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Braços segurando livro à frente */}
          <mesh
            castShadow
            position={[-0.18, 0.7, 0.22]}
            rotation={[0.9, 0, 0.3]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh
            castShadow
            position={[0.18, 0.7, 0.22]}
            rotation={[0.9, 0, -0.3]}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          {/* Livro */}
          <mesh
            castShadow
            position={[0, 0.62, 0.42]}
            rotation={[1.0, 0, 0]}
          >
            <boxGeometry args={[0.32, 0.04, 0.24]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
  }
}

/* ---------------- Helpers de offset da cabeça por variante ---------------- */

function headOffsetY(variant: 0 | 1 | 2 | 3 | 4): number {
  // Varrer está inclinada — cabeça mais baixa.
  // Sentar — cabeça mais baixa também.
  switch (variant) {
    case 3:
      return 1.0;
    case 4:
      return 0.9;
    default:
      return 1.2;
  }
}

function headOffsetZ(variant: 0 | 1 | 2 | 3 | 4): number {
  // Varrer inclina o pescoço para frente.
  switch (variant) {
    case 3:
      return 0.2;
    case 4:
      return 0.05;
    default:
      return 0;
  }
}
