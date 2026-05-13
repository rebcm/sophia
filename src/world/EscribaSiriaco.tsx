import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Escriba Siríaco — Anjo-Trono (Observador Cósmico)
   ---------------------------------------------------------
   Figura andrógina sentada de pernas cruzadas, mãos juntas
   no colo, manto azul-cobalto profundo. Olhos CERRADOS por
   padrão (esferinhas pretas pequenas indicando pálpebras).
   Quando despertado, os olhos abrem revelando luz azul (duas
   esferas azuis luminosas). Sutil halo prata-meio-transparente.
   Não fala palavras: mostra.
   Ver docs/22-civilizacoes-expandidas.md §3.2
   ========================================================= */

interface EscribaSiriacoProps {
  position: [number, number, number];
  awakened?: boolean;
  /** Opcional: ref do jogador, para intensificar a aura por proximidade. */
  playerRef?: React.RefObject<THREE.Group | null>;
}

export function EscribaSiriaco({
  position,
  awakened = false,
  playerRef,
}: EscribaSiriacoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mantoRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const haloDiscRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);

  const selfPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Quase imóvel — testemunha. Respiração lentíssima.
    groupRef.current.position.y = position[1] + Math.sin(t * 0.28) * 0.022;

    // Proximidade do jogador
    let proximity = 0;
    if (playerRef?.current) {
      const dist = playerRef.current.position.distanceTo(selfPos.current);
      proximity = Math.min(1, Math.max(0, (dist - 2.5) / 10));
    } else {
      proximity = 0.6;
    }
    const closeness = 1 - proximity;

    // Manto azul-cobalto — emissive lento profundo
    if (mantoRef.current) {
      const m = mantoRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.55 : 0.38) + Math.sin(t * 0.35) * 0.07;
    }

    // Aura — azul-noite quase imóvel
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = awakened ? 0.24 : 0.3;
      m.opacity =
        base + closeness * 0.2 + Math.sin(t * 0.45) * 0.04;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.32) * 0.035 + closeness * 0.07,
      );
    }

    // Halo prata — translúcido, baixa opacidade
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        0.1 + closeness * 0.1 + Math.sin(t * 0.3 + 1.2) * 0.025;
    }

    // Disco-halo sobre a cabeça — cintilação lenta
    if (haloDiscRef.current) {
      const m = haloDiscRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.45 + Math.sin(t * 0.5) * 0.12;
    }

    // Cabeça — leve oscilação meditativa
    if (headRef.current) {
      const target = awakened ? -0.04 : 0.06;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.014,
      );
    }

    // Olhos: quando despertado, "abrem" — escalam de quase 0 (pálpebra)
    // para luz azul plena. O efeito é controlado por scale + opacity.
    const eyeOpen = awakened ? 1 : 0.18;
    const eyeGlow = awakened ? 1 : 0;
    if (eyeLeftRef.current && eyeRightRef.current) {
      // Crescimento suave
      const targetScale = eyeOpen;
      [eyeLeftRef.current, eyeRightRef.current].forEach((mesh) => {
        const cur = mesh.scale.x;
        const next = THREE.MathUtils.lerp(cur, targetScale, 0.04);
        mesh.scale.setScalar(next);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        // Quando fechado (não desperto), olhos = preto opaco (pálpebra)
        // Quando aberto, olhos = azul luminoso
        const litAzul = new THREE.Color("#78b0ff");
        const fechado = new THREE.Color("#0a0a14");
        const c = new THREE.Color().copy(fechado).lerp(litAzul, eyeGlow);
        mat.color.copy(c);
        // Pulsa quando aberto
        mat.opacity =
          0.92 + (awakened ? Math.sin(t * 1.5) * 0.06 : 0);
      });
    }

    // Selo no peito — pulsa profundamente
    if (chestRef.current) {
      const m = chestRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.85 : 0.5) + Math.sin(t * 0.55) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base — anel discreto sob a figura sentada */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.95, 32]} />
        <meshBasicMaterial
          color="#a0b8e8"
          transparent
          opacity={0.3}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Pernas cruzadas — disco achatado escuro */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.76, 0.3, 18]} />
        <meshStandardMaterial
          color="#101428"
          emissive="#0a0e1c"
          emissiveIntensity={0.3}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Manto azul-cobalto — tronco recoberto, alto */}
      <mesh ref={mantoRef} position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.74, 1.6, 18]} />
        <meshStandardMaterial
          color="#1a2e6a"
          emissive="#284088"
          emissiveIntensity={0.42}
          roughness={0.5}
          metalness={0.45}
        />
      </mesh>

      {/* Gola prata escura — fina */}
      <mesh position={[0, 1.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.034, 8, 22]} />
        <meshStandardMaterial
          color="#a8b8e0"
          emissive="#3a4878"
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.85}
        />
      </mesh>

      {/* Selo siríaco no peito — círculo cobalto pulsante */}
      <mesh ref={chestRef} position={[0, 1.45, 0.6]}>
        <circleGeometry args={[0.14, 24]} />
        <meshStandardMaterial
          color="#3a5cb0"
          emissive="#78a0ff"
          emissiveIntensity={0.7}
          roughness={0.35}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mãos juntas no colo — duas esferinhas */}
      {[-0.16, 0.16].map((dx, i) => (
        <mesh key={`hand-${i}`} position={[dx, 0.42, 0.5]} castShadow>
          <sphereGeometry args={[0.085, 12, 10]} />
          <meshStandardMaterial
            color="#e8ecf8"
            emissive="#3848a0"
            emissiveIntensity={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Pescoço */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.16, 10]} />
        <meshStandardMaterial
          color="#dfe4f6"
          emissive="#3848a0"
          emissiveIntensity={0.22}
          roughness={0.55}
        />
      </mesh>

      {/* Cabeça — pele lunar, quase prata */}
      <mesh ref={headRef} position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[0.25, 18, 14]} />
        <meshStandardMaterial
          color="#e2e8f4"
          emissive="#5060a0"
          emissiveIntensity={0.2}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>

      {/* Olhos — pálpebras escuras (esferinhas pretas) que viram
          luz azul ao despertar. Escala anima de pálpebra para olho-luz. */}
      <mesh
        ref={eyeLeftRef}
        position={[-0.08, 2.12, 0.22]}
        scale={[0.18, 0.18, 0.18]}
      >
        <sphereGeometry args={[0.04, 12, 10]} />
        <meshBasicMaterial
          color="#0a0a14"
          transparent
          opacity={0.92}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={eyeRightRef}
        position={[0.08, 2.12, 0.22]}
        scale={[0.18, 0.18, 0.18]}
      >
        <sphereGeometry args={[0.04, 12, 10]} />
        <meshBasicMaterial
          color="#0a0a14"
          transparent
          opacity={0.92}
          toneMapped={false}
        />
      </mesh>

      {/* Disco-halo sobre a cabeça — prata meio-transparente */}
      <mesh
        ref={haloDiscRef}
        position={[0, 2.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.3, 0.44, 32]} />
        <meshBasicMaterial
          color="#dce4f4"
          transparent
          opacity={0.55}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Aura azul-noite — esfera translúcida grande */}
      <mesh ref={auraRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[1.95, 26, 22]} />
        <meshBasicMaterial
          color="#3a5aa8"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo prata — bem suave */}
      <mesh ref={haloRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[3.0, 20, 18]} />
        <meshBasicMaterial
          color="#c0c8f0"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal — azul-noite */}
      <pointLight
        position={[0, 1.6, 0]}
        intensity={awakened ? 1.5 : 1.0}
        distance={10}
        color={awakened ? "#a8c0ff" : "#5070b8"}
        decay={2}
      />
    </group>
  );
}
