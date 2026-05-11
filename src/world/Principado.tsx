import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   <Principado /> — silhueta arquetípica de uma "lei viva"
   ---------------------------------------------------------
   Principados não são bosses nem humanóides — são funções
   reificadas. Cada um manifesta-se como uma silhueta cinzenta
   abstrata (geometria expressiva, não-orgânica), com prop
   simbólico e aura cinza-violácea pulsante.
   Quando contemplado (`contemplated=true`) a aura desbota e
   a silhueta amansa: a "lei" foi nomeada e perdeu vigor.
   `contemplationProgress` (0..1) suaviza a transição enquanto
   o jogador segura F (gerenciado pelo orquestrador).
   Ver docs/03b-hierarquia-arcontes.md §5–§6 e
   docs/03f-mapa-do-reino-humano.md §Luta 3.
   ========================================================= */

export type PrincipadoId =
  | "sentinela-espelho"
  | "capataz-cinto"
  | "vigia-vela"
  | "censor-boca"
  | "coletor-imposto"
  | "porta-trancada"
  | "lei-viva"
  | "estatua-vigia"
  | "boca-grande"
  | "boneca-corda"
  | "saco-vazio"
  | "mascara-cega";

interface PrincipadoProps {
  id: PrincipadoId;
  position: [number, number, number];
  contemplated?: boolean;
  contemplationProgress?: number;
}

interface PrincipadoVisual {
  /** Eixo de variação de silhueta. */
  shape:
    | "alongado"
    | "achatado"
    | "torcido"
    | "espelho"
    | "boca"
    | "balanca"
    | "porta"
    | "anel"
    | "estatua"
    | "marioneta"
    | "saco"
    | "mascara";
  /** Tinta cinzenta com sutil deriva violácea/fria. */
  base: string;
  /** Emissivo da aura quando ativo. */
  emissive: string;
}

const VISUALS: Record<PrincipadoId, PrincipadoVisual> = {
  "sentinela-espelho": { shape: "espelho", base: "#3a3848", emissive: "#9a8ac8" },
  "capataz-cinto": { shape: "torcido", base: "#3c3440", emissive: "#a88ac8" },
  "vigia-vela": { shape: "alongado", base: "#383848", emissive: "#c8a878" },
  "censor-boca": { shape: "boca", base: "#352c3c", emissive: "#a878b8" },
  "coletor-imposto": { shape: "balanca", base: "#34303c", emissive: "#a098c8" },
  "porta-trancada": { shape: "porta", base: "#2c2838", emissive: "#8878a8" },
  "lei-viva": { shape: "anel", base: "#383040", emissive: "#9888c8" },
  "estatua-vigia": { shape: "estatua", base: "#3a3a44", emissive: "#a890c0" },
  "boca-grande": { shape: "boca", base: "#3c2c3c", emissive: "#b878b0" },
  "boneca-corda": { shape: "marioneta", base: "#403448", emissive: "#a888c0" },
  "saco-vazio": { shape: "saco", base: "#322c38", emissive: "#9078a8" },
  "mascara-cega": { shape: "mascara", base: "#3a3444", emissive: "#a08ac8" },
};

export function Principado({
  id,
  position,
  contemplated = false,
  contemplationProgress = 0,
}: PrincipadoProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const bodyRef = useRef<THREE.Group | null>(null);
  const auraRef = useRef<THREE.Mesh | null>(null);
  const haloRef = useRef<THREE.Mesh | null>(null);
  const v = VISUALS[id];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const fade = contemplated ? 1 : Math.min(1, Math.max(0, contemplationProgress));

    if (bodyRef.current) {
      const wobble = contemplated ? 0.02 : 0.08 - fade * 0.06;
      bodyRef.current.rotation.y = Math.sin(t * 0.5) * wobble;
      bodyRef.current.position.y = Math.sin(t * 0.7) * (contemplated ? 0.02 : 0.06);
    }

    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const active = 0.55 + Math.sin(t * 1.6) * 0.18;
      const calm = 0.12 + Math.sin(t * 0.4) * 0.04;
      m.opacity = contemplated ? calm : active * (1 - fade * 0.7);
      const tone = new THREE.Color(v.emissive).lerp(
        new THREE.Color("#5a5468"),
        contemplated ? 0.85 : fade * 0.6,
      );
      m.color.copy(tone);
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = t * (contemplated ? 0.05 : 0.25);
      const hm = haloRef.current.material as THREE.MeshBasicMaterial;
      hm.opacity = contemplated ? 0.08 : 0.32 - fade * 0.18;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base baixa — um pequeno disco fosco no chão */}
      <mesh receiveShadow position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1.05, 24]} />
        <meshStandardMaterial
          color="#1a1620"
          emissive={contemplated ? "#3a3450" : "#2a2238"}
          emissiveIntensity={0.18}
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Silhueta — varia por id */}
      <group ref={bodyRef} position={[0, 1.2, 0]}>
        <PrincipadoSilhouette
          shape={v.shape}
          base={v.base}
          emissive={v.emissive}
          contemplated={contemplated}
        />
      </group>

      {/* Aura — esfera translúcida */}
      <mesh ref={auraRef} position={[0, 1.3, 0]}>
        <sphereGeometry args={[1.4, 18, 18]} />
        <meshBasicMaterial
          color={v.emissive}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Halo plano — anel rotativo no chão */}
      <mesh ref={haloRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshBasicMaterial
          color={v.emissive}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        position={[0, 1.6, 0]}
        intensity={contemplated ? 0.4 : 1.0}
        distance={4.5}
        color={contemplated ? "#7a7090" : v.emissive}
        decay={2}
      />
    </group>
  );
}

function PrincipadoSilhouette({
  shape,
  base,
  emissive,
  contemplated,
}: {
  shape: PrincipadoVisual["shape"];
  base: string;
  emissive: string;
  contemplated: boolean;
}) {
  const matColor = contemplated ? "#5a5468" : base;
  const matEmissive = contemplated ? "#3a3450" : emissive;
  const intensity = contemplated ? 0.15 : 0.35;

  switch (shape) {
    case "alongado":
      return (
        <mesh castShadow>
          <capsuleGeometry args={[0.32, 1.6, 6, 12]} />
          <meshStandardMaterial
            color={matColor}
            emissive={matEmissive}
            emissiveIntensity={intensity}
            roughness={0.85}
            metalness={0.15}
          />
        </mesh>
      );
    case "achatado":
      return (
        <mesh castShadow scale={[1.3, 0.55, 1.3]}>
          <sphereGeometry args={[0.7, 18, 14]} />
          <meshStandardMaterial
            color={matColor}
            emissive={matEmissive}
            emissiveIntensity={intensity}
            roughness={0.8}
          />
        </mesh>
      );
    case "torcido":
      return (
        <group>
          <mesh castShadow rotation={[0, 0, Math.PI / 8]}>
            <coneGeometry args={[0.5, 1.4, 5]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity}
              roughness={0.7}
            />
          </mesh>
          {/* Cinto de chaves abstrato */}
          <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.06, 8, 18]} />
            <meshStandardMaterial
              color="#5a4838"
              emissive={contemplated ? "#3a3450" : "#a88a4a"}
              emissiveIntensity={0.35}
              metalness={0.9}
              roughness={0.35}
            />
          </mesh>
        </group>
      );
    case "espelho":
      return (
        <group>
          {/* Corpo cinzento esguio */}
          <mesh castShadow position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.28, 0.9, 6, 10]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity * 0.7}
              roughness={0.85}
            />
          </mesh>
          {/* "Cabeça-espelho" côncava */}
          <mesh castShadow position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.42, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity + 0.2}
              metalness={1.0}
              roughness={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      );
    case "boca":
      return (
        <group>
          <mesh castShadow scale={[1, 1.35, 1]}>
            <sphereGeometry args={[0.55, 18, 14]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity}
              roughness={0.85}
            />
          </mesh>
          {/* Fenda da boca enorme */}
          <mesh position={[0, -0.05, 0.5]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.32, 0.07, 6, 16, Math.PI]} />
            <meshStandardMaterial
              color="#100810"
              emissive={contemplated ? "#3a3450" : "#5a1838"}
              emissiveIntensity={0.6}
              roughness={0.5}
            />
          </mesh>
        </group>
      );
    case "balanca":
      return (
        <group>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.26, 1.1, 6, 10]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity}
              roughness={0.85}
            />
          </mesh>
          {/* Travessa horizontal */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.1, 0.05, 0.05]} />
            <meshStandardMaterial
              color="#3a3848"
              emissive={matEmissive}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Pratos */}
          <mesh position={[-0.5, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#5a5060" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0.5, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#5a5060" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      );
    case "porta":
      return (
        <mesh castShadow>
          <boxGeometry args={[1.1, 1.9, 0.18]} />
          <meshStandardMaterial
            color={matColor}
            emissive={matEmissive}
            emissiveIntensity={intensity}
            roughness={0.78}
          />
        </mesh>
      );
    case "anel":
      return (
        <group>
          <mesh castShadow rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.7, 0.12, 12, 32]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity + 0.1}
              roughness={0.4}
              metalness={0.65}
            />
          </mesh>
          <mesh castShadow rotation={[Math.PI / 2.4, Math.PI / 2, 0]}>
            <torusGeometry args={[0.4, 0.08, 10, 24]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity}
              roughness={0.5}
              metalness={0.5}
            />
          </mesh>
        </group>
      );
    case "estatua":
      return (
        <group>
          {/* Bloco vertical, vagamente humano */}
          <mesh castShadow position={[0, -0.15, 0]}>
            <boxGeometry args={[0.7, 1.5, 0.55]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity}
              roughness={0.9}
            />
          </mesh>
          {/* Olho fixo */}
          <mesh position={[0, 0.45, 0.31]}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <meshStandardMaterial
              color="#dadbe6"
              emissive={contemplated ? "#3a3450" : "#fff5d8"}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      );
    case "marioneta":
      return (
        <group>
          {/* Tronco fininho */}
          <mesh castShadow position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.22, 0.9, 6, 10]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity}
              roughness={0.85}
            />
          </mesh>
          {/* Braços pendurados em ângulo torto */}
          <mesh castShadow position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 3]}>
            <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
            <meshStandardMaterial color={matColor} emissive={matEmissive} emissiveIntensity={intensity} />
          </mesh>
          <mesh castShadow position={[0.35, 0, 0]} rotation={[0, 0, -Math.PI / 3]}>
            <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
            <meshStandardMaterial color={matColor} emissive={matEmissive} emissiveIntensity={intensity} />
          </mesh>
          {/* Corda invisível indicada por fio acima */}
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.55, 6]} />
            <meshBasicMaterial color={contemplated ? "#5a5468" : "#a88ac8"} transparent opacity={0.55} />
          </mesh>
        </group>
      );
    case "saco":
      return (
        <mesh castShadow scale={[1.05, 1.2, 1.05]}>
          <sphereGeometry args={[0.6, 16, 14]} />
          <meshStandardMaterial
            color={matColor}
            emissive={matEmissive}
            emissiveIntensity={intensity * 0.7}
            roughness={0.95}
          />
        </mesh>
      );
    case "mascara":
      return (
        <group>
          <mesh castShadow position={[0, -0.25, 0]}>
            <capsuleGeometry args={[0.28, 0.7, 6, 10]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity}
              roughness={0.85}
            />
          </mesh>
          {/* Máscara oval na frente */}
          <mesh castShadow position={[0, 0.4, 0.15]} scale={[1, 1.35, 0.35]}>
            <sphereGeometry args={[0.42, 18, 14]} />
            <meshStandardMaterial
              color={matColor}
              emissive={matEmissive}
              emissiveIntensity={intensity + 0.15}
              metalness={0.4}
              roughness={0.55}
            />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}
