import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Mestre Andino — Aeon-Mestre de Erks
   ---------------------------------------------------------
   Anciã indígena sentada, poncho cósmico longo (tecido com
   fios que parecem estrelas — pontos emissivos randômicos
   piscando dentro de um pano cor-da-terra-andina). Cabelo
   branco curto, olhos calmos cor-quartzo. Aura âmbar-andina.
   Ensina a Leitura dos Andes — conexões cósmicas entre povos
   indígenas e civilizações extra-terrenas.
   Ver docs/22-civilizacoes-expandidas.md §2.4
   ========================================================= */

interface MestreAndinoProps {
  position: [number, number, number];
  awakened?: boolean;
  /** Opcional: ref do jogador, para intensificar a aura por proximidade. */
  playerRef?: React.RefObject<THREE.Group | null>;
}

/** Quantas "estrelas" pulsando dentro do poncho. */
const PONCHO_STAR_COUNT = 22;

export function MestreAndino({
  position,
  awakened = false,
  playerRef,
}: MestreAndinoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const ponchoRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const ponchoStarsRef = useRef<THREE.Group>(null);

  const selfPos = useRef(new THREE.Vector3(...position));

  // Distribuição fixa das "estrelas do poncho" — pontos em duas faces
  // (frente e costas) do tronco, jitter aleatório mas estável por render.
  const ponchoStars = useMemo(() => {
    const out: {
      x: number;
      y: number;
      z: number;
      size: number;
      phase: number;
      speed: number;
      color: string;
    }[] = [];
    const palette = [
      "#ffe2a0",
      "#fff0c8",
      "#f8c878",
      "#ffd890",
      "#ffe6b8",
    ];
    for (let i = 0; i < PONCHO_STAR_COUNT; i++) {
      // x em [-0.55, 0.55], y em [0.5, 1.5], z = +/- 0.55 (frente/costas)
      const front = i % 2 === 0;
      out.push({
        x: (Math.random() - 0.5) * 1.05,
        y: 0.55 + Math.random() * 1.0,
        z: front ? 0.55 + Math.random() * 0.04 : -0.55 - Math.random() * 0.04,
        size: 0.038 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.2,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Anciã sentada — flutuação MUITO leve (quase imóvel, contemplativa)
    groupRef.current.position.y = position[1] + Math.sin(t * 0.32) * 0.025;

    // Proximidade do jogador
    let proximity = 0;
    if (playerRef?.current) {
      const dist = playerRef.current.position.distanceTo(selfPos.current);
      proximity = Math.min(1, Math.max(0, (dist - 2.5) / 10));
    } else {
      proximity = 0.6;
    }
    const closeness = 1 - proximity;

    // Aura âmbar — pulsa lenta, intensifica perto
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const base = awakened ? 0.22 : 0.28;
      m.opacity =
        base + closeness * 0.22 + Math.sin(t * 0.55) * 0.06;
      auraRef.current.scale.setScalar(
        1 + Math.sin(t * 0.4) * 0.04 + closeness * 0.08,
      );
    }

    // Halo externo
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity =
        0.09 + closeness * 0.1 + Math.sin(t * 0.35 + 0.8) * 0.025;
    }

    // Poncho — emissive baixo do pano de terra (não brilha, sustenta)
    if (ponchoRef.current) {
      const m = ponchoRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.28 : 0.2) + Math.sin(t * 0.45) * 0.04;
    }

    // Estrelas do poncho — opacidade piscando individualmente
    if (ponchoStarsRef.current) {
      ponchoStarsRef.current.children.forEach((child, i) => {
        const d = ponchoStars[i];
        if (!d) return;
        const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        // Pulso lento de cada "estrela": opacidade entre 0.25 e 1.0
        const base = awakened ? 0.7 : 0.55;
        m.opacity =
          base + Math.sin(t * d.speed + d.phase) * 0.4;
      });
    }

    // Cabeça quase imóvel — observa com calma
    if (headRef.current) {
      const target = awakened ? -0.06 : 0.04;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        target,
        0.018,
      );
    }

    // Peito — selo de quartzo respira lento
    if (chestRef.current) {
      const m = chestRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (awakened ? 0.7 : 0.5) + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base — ringinho discreto no chão sob a figura sentada */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 1.0, 32]} />
        <meshBasicMaterial
          color="#d89858"
          transparent
          opacity={0.34}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Pernas cruzadas (sumárias) — disco achatado sob o poncho */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.72, 0.78, 0.3, 18]} />
        <meshStandardMaterial
          color="#4a2a14"
          emissive="#2a1808"
          emissiveIntensity={0.2}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Poncho cósmico — tronco coberto por pano comprido. Cor-da-terra
          (marrom-andino-avermelhado). Sutil emissive âmbar. */}
      <mesh ref={ponchoRef} position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.78, 1.6, 18]} />
        <meshStandardMaterial
          color="#6a3a1c"
          emissive="#9a4a18"
          emissiveIntensity={0.22}
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>

      {/* Estrelas-fios dentro do poncho — pontos pulsantes em frente/costas */}
      <group ref={ponchoStarsRef}>
        {ponchoStars.map((s, i) => (
          <mesh key={`pstar-${i}`} position={[s.x, s.y, s.z]}>
            <sphereGeometry args={[s.size, 8, 6]} />
            <meshBasicMaterial
              color={s.color}
              transparent
              opacity={0.7}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Gola/colar — fina linha mais clara onde o poncho encontra o pescoço */}
      <mesh position={[0, 1.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.038, 8, 22]} />
        <meshStandardMaterial
          color="#d8a868"
          emissive="#a86830"
          emissiveIntensity={0.4}
          roughness={0.55}
          metalness={0.5}
        />
      </mesh>

      {/* Selo de quartzo no peito — pequena circle emissiva */}
      <mesh ref={chestRef} position={[0, 1.45, 0.62]}>
        <circleGeometry args={[0.12, 22]} />
        <meshStandardMaterial
          color="#fff0d4"
          emissive="#f0c890"
          emissiveIntensity={0.55}
          roughness={0.5}
          metalness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mãos juntas no colo — duas esferinhas pequenas */}
      {[-0.18, 0.18].map((dx, i) => (
        <mesh key={`hand-${i}`} position={[dx, 0.42, 0.52]} castShadow>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshStandardMaterial
            color="#c89868"
            emissive="#5a3010"
            emissiveIntensity={0.22}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Pescoço */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.16, 10]} />
        <meshStandardMaterial
          color="#c89868"
          emissive="#4a2810"
          emissiveIntensity={0.22}
          roughness={0.65}
        />
      </mesh>

      {/* Cabeça — pele cor-quartzo-bronze */}
      <mesh ref={headRef} position={[0, 2.1, 0]} castShadow>
        <sphereGeometry args={[0.26, 18, 14]} />
        <meshStandardMaterial
          color="#cba078"
          emissive="#5a3818"
          emissiveIntensity={0.16}
          roughness={0.7}
          metalness={0.04}
        />
      </mesh>

      {/* Cabelo branco curto — calota achatada sobre a cabeça */}
      <mesh position={[0, 2.22, 0]} castShadow>
        <sphereGeometry args={[0.265, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial
          color="#f4f0e2"
          emissive="#a89878"
          emissiveIntensity={0.16}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Olhos cor-quartzo — duas esferinhas pequenas claras */}
      {[-0.09, 0.09].map((dx, i) => (
        <mesh key={`eye-${i}`} position={[dx, 2.12, 0.23]}>
          <sphereGeometry args={[0.028, 10, 8]} />
          <meshBasicMaterial color="#f0e4d0" toneMapped={false} />
        </mesh>
      ))}

      {/* Aura âmbar-andina — esfera grande translúcida */}
      <mesh ref={auraRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[1.95, 26, 22]} />
        <meshBasicMaterial
          color="#f0b878"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* Halo externo — bem suave */}
      <mesh ref={haloRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[3.0, 20, 18]} />
        <meshBasicMaterial
          color="#e8a06c"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Luz pessoal — âmbar-andina */}
      <pointLight
        position={[0, 1.6, 0]}
        intensity={awakened ? 1.6 : 1.1}
        distance={10}
        color={awakened ? "#ffd890" : "#e8a060"}
        decay={2}
      />
    </group>
  );
}
