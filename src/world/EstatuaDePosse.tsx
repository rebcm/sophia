import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   EstatuaDePosse — figura humanoide cinza-pedra em pose de
   "segurar". Habitante de Gomorra · A Cidade Que Não Soltava.
   ---------------------------------------------------------
   Cada estátua é um arquétipo de posse:
     0  Casal           — duas figuras, mãos enlaçadas e fechadas
     1  Mãe-Cobertora   — uma figura curvada sobre uma menor
     2  Trono           — figura sentada em trono, mãos no
                          encosto e na coroa
     3  Escravo         — figura encolhida arrastando uma corrente
                          presa ao pulso
     4  Propriedade     — figura ereta com punhos cerrados sobre
                          uma esfera (objeto-genérico)
   ---------------------------------------------------------
   Quando `released` vira true:
     - cilindros dos dedos encolhem para 0.5x (mão "abre")
     - cor da pedra clareia (gris → âmbar pálido)
     - uma aura âmbar quente nasce em torno da estátua
     - dependendo da variante, o "objeto da posse" relaxa também
       (a corrente cai, a esfera flutua um pouco, o trono brilha)
   Sem violência gráfica. Pose contemplativa.
   ========================================================= */

export type EstatuaVariant = 0 | 1 | 2 | 3 | 4;

interface EstatuaDePosseProps {
  position: [number, number, number];
  rotY?: number;
  released: boolean;
  variant: EstatuaVariant;
}

export function EstatuaDePosse({
  position,
  rotY = 0,
  released,
  variant,
}: EstatuaDePosseProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const handsRef = useRef<THREE.Group>(null);

  // animação suave: lerp do "abrir mãos" e do "respirar"
  const animState = useRef({ open: 0 }); // 0 fechada, 1 aberta

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Lerp do "abrir" — quando released vira true, vai para 1
    const target = released ? 1 : 0;
    animState.current.open = THREE.MathUtils.lerp(
      animState.current.open,
      target,
      Math.min(1, delta * 1.6),
    );
    const open = animState.current.open;

    // Mãos: dedos relaxam (escala dos cilindros vai para 0.5)
    if (handsRef.current) {
      // Quando aberta, dedos escalam para 0.5 — isso codifica
      // visualmente o "soltar"
      const s = THREE.MathUtils.lerp(1.0, 0.5, open);
      handsRef.current.children.forEach((child) => {
        child.scale.y = s;
      });
    }

    // Aura âmbar
    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        released ? 0.32 + Math.sin(t * 0.9) * 0.06 : 0,
        0.08,
      );
      const scale =
        1 + open * 0.4 + (released ? Math.sin(t * 0.9) * 0.04 : 0);
      auraRef.current.scale.setScalar(scale);
    }

    // Respiração leve quando libertada — antes, congelada
    if (groupRef.current) {
      const breathe = released ? Math.sin(t * 0.6) * 0.02 : 0;
      groupRef.current.position.y = position[1] + breathe;
    }
  });

  // Paleta — cinza-pedra severa quando congelada; cinza claro com
  // emissivo âmbar quando liberta
  const stoneColor = useMemo(
    () => (released ? "#9a8a7a" : "#5a5048"),
    [released],
  );
  const stoneEmissive = useMemo(
    () => (released ? "#7a4a20" : "#1a1410"),
    [released],
  );
  const stoneEmissiveIntensity = released ? 0.45 : 0.12;

  const stoneMat = (
    <meshStandardMaterial
      color={stoneColor}
      emissive={stoneEmissive}
      emissiveIntensity={stoneEmissiveIntensity}
      roughness={0.92}
      metalness={0.08}
    />
  );

  return (
    <group ref={groupRef} position={position} rotation={[0, rotY, 0]}>
      {/* Pedestal — pequeno disco de pedra sob cada estátua */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.1, 16]} />
        <meshStandardMaterial
          color="#3a322c"
          roughness={0.95}
          metalness={0.05}
          emissive="#0a0806"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Aura âmbar (visível só quando released) */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[1.6, 18, 14]} />
        <meshBasicMaterial
          color="#ffb060"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Pequena luz pontual quando libertada — calor da redenção */}
      {released && (
        <pointLight
          position={[0, 1.6, 0]}
          intensity={0.85}
          distance={6}
          color="#ffb060"
          decay={2}
        />
      )}

      {/* Grupo de mãos — referenciado para animação dos "dedos" */}
      <group ref={handsRef}>
        {variant === 0 && <CasalHands stoneMat={stoneMat} />}
        {variant === 1 && <MaeCobertoraHands stoneMat={stoneMat} />}
        {variant === 2 && <TronoHands stoneMat={stoneMat} />}
        {variant === 3 && <EscravoHands stoneMat={stoneMat} />}
        {variant === 4 && <PropriedadeHands stoneMat={stoneMat} />}
      </group>

      {/* Corpo principal da variante */}
      {variant === 0 && <CasalBody stoneMat={stoneMat} />}
      {variant === 1 && <MaeCobertoraBody stoneMat={stoneMat} />}
      {variant === 2 && <TronoBody stoneMat={stoneMat} released={released} />}
      {variant === 3 && <EscravoBody stoneMat={stoneMat} released={released} />}
      {variant === 4 && (
        <PropriedadeBody stoneMat={stoneMat} released={released} />
      )}
    </group>
  );
}

/* ---------------- Variante 0 · Casal ---------------- */

function CasalBody({ stoneMat }: { stoneMat: React.ReactNode }) {
  return (
    <group>
      {/* Figura A — esquerda */}
      <FiguraHumanoide x={-0.32} stoneMat={stoneMat} />
      {/* Figura B — direita */}
      <FiguraHumanoide x={0.32} stoneMat={stoneMat} />
    </group>
  );
}

function CasalHands({ stoneMat }: { stoneMat: React.ReactNode }) {
  // Mãos enlaçadas entre as duas figuras (4 cilindros — "dedos")
  return (
    <group position={[0, 0.95, 0.05]}>
      {[-0.06, -0.02, 0.02, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.16, 6]} />
          {stoneMat}
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Variante 1 · Mãe-Cobertora ---------------- */

function MaeCobertoraBody({ stoneMat }: { stoneMat: React.ReactNode }) {
  return (
    <group>
      {/* Mãe — figura curvada (cone com inclinação) */}
      <group rotation={[0.35, 0, 0]}>
        <FiguraHumanoide x={0} y={0.05} stoneMat={stoneMat} />
      </group>
      {/* Criança — figura menor sob a mãe */}
      <group position={[0, 0, 0.35]} scale={0.55}>
        <FiguraHumanoide x={0} stoneMat={stoneMat} />
      </group>
    </group>
  );
}

function MaeCobertoraHands({ stoneMat }: { stoneMat: React.ReactNode }) {
  // Mãos sobre a cabeça da criança (4 cilindros descendo)
  return (
    <group position={[0, 0.7, 0.32]}>
      {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.18, 6]} />
          {stoneMat}
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Variante 2 · Trono ---------------- */

function TronoBody({
  stoneMat,
  released,
}: {
  stoneMat: React.ReactNode;
  released: boolean;
}) {
  return (
    <group>
      {/* Trono — bloco com encosto alto */}
      <mesh position={[0, 0.55, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.0, 0.6]} />
        {stoneMat}
      </mesh>
      {/* Encosto */}
      <mesh position={[0, 1.35, -0.4]} castShadow>
        <boxGeometry args={[1.0, 1.6, 0.12]} />
        {stoneMat}
      </mesh>
      {/* Tirano sentado — figura central */}
      <group position={[0, 0.9, 0]}>
        <FiguraHumanoide x={0} y={0} stoneMat={stoneMat} small />
      </group>
      {/* Coroa — sobre a cabeça; quando libertada, brilha morno */}
      <mesh position={[0, 2.18, 0]}>
        <torusGeometry args={[0.18, 0.05, 8, 18]} />
        <meshStandardMaterial
          color={released ? "#ffd070" : "#7a6240"}
          emissive={released ? "#c08040" : "#2a1808"}
          emissiveIntensity={released ? 0.6 : 0.15}
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function TronoHands({ stoneMat }: { stoneMat: React.ReactNode }) {
  // Uma mão na coroa (alta), outra no encosto (baixa)
  return (
    <group>
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={`crown-${i}`} position={[x, 2.0, 0.06]}>
          <cylinderGeometry args={[0.022, 0.022, 0.14, 6]} />
          {stoneMat}
        </mesh>
      ))}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={`arm-${i}`} position={[0.48 + x * 0.05, 1.0, 0.0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.14, 6]} />
          {stoneMat}
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Variante 3 · Escravo ---------------- */

function EscravoBody({
  stoneMat,
  released,
}: {
  stoneMat: React.ReactNode;
  released: boolean;
}) {
  return (
    <group>
      {/* Figura encolhida — corpo levemente curvado */}
      <group rotation={[0.4, 0, 0]} position={[0, 0, 0]}>
        <FiguraHumanoide x={0} stoneMat={stoneMat} />
      </group>
      {/* Corrente — elos pequenos saindo do "pulso" da figura */}
      {[0, 1, 2, 3, 4].map((i) => {
        const y = released ? 0.18 - i * 0.04 : 0.7 - i * 0.13;
        const x = released ? 0.4 + i * 0.18 : 0.45 + i * 0.05;
        return (
          <mesh
            key={`chain-${i}`}
            position={[x, y, 0.2]}
            rotation={[0, 0, released ? -0.3 : 0.4]}
          >
            <torusGeometry args={[0.06, 0.018, 6, 10]} />
            <meshStandardMaterial
              color={released ? "#6a6258" : "#3a342c"}
              emissive={released ? "#1a1408" : "#0a0804"}
              emissiveIntensity={0.15}
              metalness={0.7}
              roughness={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function EscravoHands({ stoneMat }: { stoneMat: React.ReactNode }) {
  // Punho fechado no pulso preso pela corrente
  return (
    <group position={[0.4, 0.85, 0.18]}>
      {[-0.04, 0, 0.04].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.14, 6]} />
          {stoneMat}
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Variante 4 · Propriedade Genérica ---------------- */

function PropriedadeBody({
  stoneMat,
  released,
}: {
  stoneMat: React.ReactNode;
  released: boolean;
}) {
  const objRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!objRef.current || !released) return;
    const t = state.clock.elapsedTime;
    // Quando solta, o objeto flutua um pouco (já não há posse)
    objRef.current.position.y = 1.25 + Math.sin(t * 1.0) * 0.05;
  });
  return (
    <group>
      <FiguraHumanoide x={0} stoneMat={stoneMat} />
      {/* Objeto "propriedade" — esfera abstrata entre as mãos */}
      <mesh ref={objRef} position={[0, 1.2, 0.32]}>
        <sphereGeometry args={[0.14, 14, 12]} />
        <meshStandardMaterial
          color={released ? "#ffd890" : "#6a5848"}
          emissive={released ? "#c08040" : "#2a1c12"}
          emissiveIntensity={released ? 0.55 : 0.18}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

function PropriedadeHands({ stoneMat }: { stoneMat: React.ReactNode }) {
  // Punhos cerrados sobre a esfera
  return (
    <group position={[0, 1.25, 0.25]}>
      {[-0.16, -0.12, 0.12, 0.16].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.16, 6]} />
          {stoneMat}
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Figura humanoide base ---------------- */

interface FiguraHumanoideProps {
  x: number;
  y?: number;
  stoneMat: React.ReactNode;
  small?: boolean;
}

function FiguraHumanoide({ x, y = 0, stoneMat, small }: FiguraHumanoideProps) {
  const scale = small ? 0.8 : 1;
  return (
    <group position={[x, y, 0]} scale={scale}>
      {/* Tronco — cone invertido (manto) */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <coneGeometry args={[0.32, 1.2, 10]} />
        {stoneMat}
      </mesh>
      {/* Cabeça */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.18, 14, 12]} />
        {stoneMat}
      </mesh>
      {/* Braço esquerdo */}
      <mesh position={[-0.22, 0.95, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
        {stoneMat}
      </mesh>
      {/* Braço direito */}
      <mesh position={[0.22, 0.95, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.55, 8]} />
        {stoneMat}
      </mesh>
    </group>
  );
}
