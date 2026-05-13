import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Cinza — Os Que Não Tiveram Alma
   ---------------------------------------------------------
   Figura magra cinza-clara com olhos pretos grandes, sem
   boca visível. Faz um gesto específico em loop, sem
   propósito aparente. NÃO são emissários — são experimentos
   do Demiurgo: têm inteligência mas não alma. Trágicos.
   Quando "awakened" (uma centelha foi doada), vira o
   primeiro Cinza sentient — torna-se levemente dourado e
   para os gestos repetitivos, ficando em pé sereno.
   Ver docs/22-civilizacoes-expandidas.md §3.5
   Família 10-99 anos: sinistros mas NÃO assustadores.
   ========================================================= */

export type CinzaGestureType = 0 | 1 | 2 | 3 | 4;
/* 0: acenar (mão sobe-desce)
   1: mão-aberta (mão pra cima, dedos abrem-fecham via scale)
   2: virar-cabeça (cabeça gira lentamente esq-dir)
   3: abrir-fechar-olhos (escala dos olhos pulsa)
   4: sem-gesto-só-em-pé (respiração quase imóvel) */

interface CinzaProps {
  position: [number, number, number];
  awakened?: boolean;
  gestureType: CinzaGestureType;
}

export function Cinza({
  position,
  awakened = false,
  gestureType,
}: CinzaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Group>(null);
  const handRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // Quando "awakened", animar transição de cinza → dourado leve
  const goldenT = useRef(0);

  const greyColor = useRef(new THREE.Color("#b8bcc4"));
  const greyEmissive = useRef(new THREE.Color("#3a3e48"));
  const goldenColor = useRef(new THREE.Color("#e8d4a4"));
  const goldenEmissive = useRef(new THREE.Color("#a88848"));
  const cTemp = useRef(new THREE.Color());
  const eTemp = useRef(new THREE.Color());

  useEffect(() => {
    // reseta a transição quando awakened muda — útil para hot-reload
    if (!awakened) goldenT.current = 0;
  }, [awakened]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Transição cinza → dourado (suave, ~3s)
    if (awakened && goldenT.current < 1) {
      goldenT.current = Math.min(1, goldenT.current + 0.005);
    }
    const g = goldenT.current;

    if (bodyRef.current) {
      const m = bodyRef.current.material as THREE.MeshStandardMaterial;
      cTemp.current.copy(greyColor.current).lerp(goldenColor.current, g);
      eTemp.current.copy(greyEmissive.current).lerp(goldenEmissive.current, g);
      m.color.copy(cTemp.current);
      m.emissive.copy(eTemp.current);
      m.emissiveIntensity = awakened
        ? 0.32 + Math.sin(t * 0.7) * 0.06
        : 0.18 + Math.sin(t * 0.5) * 0.03;
    }

    // Respiração — leve subida/descida do corpo todo
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.6 + position[0] * 0.5) * 0.025;

    // Halo dourado quando awakened
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = awakened
        ? 0.35 * g + Math.sin(t * 0.8) * 0.06
        : 0;
    }

    // Se awakened, gestos param (loop fica congelado em posição neutra)
    if (awakened) {
      if (headRef.current) {
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          0,
          0.04,
        );
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0,
          0.04,
        );
      }
      if (armRef.current) {
        armRef.current.rotation.x = THREE.MathUtils.lerp(
          armRef.current.rotation.x,
          0,
          0.04,
        );
      }
      if (handRef.current) {
        handRef.current.scale.setScalar(
          THREE.MathUtils.lerp(handRef.current.scale.x, 1, 0.06),
        );
      }
      if (eyeLeftRef.current && eyeRightRef.current) {
        // Olhos abrem suavemente quando vira sentient
        [eyeLeftRef.current, eyeRightRef.current].forEach((m) => {
          m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, 1, 0.05));
        });
      }
      return;
    }

    // ---- Gestos repetitivos ---- (apenas se !awakened)
    switch (gestureType) {
      case 0: {
        // acenar: braço sobe e desce em arco contínuo (~0.5Hz)
        if (armRef.current) {
          armRef.current.rotation.x = Math.sin(t * 1.4) * 0.9 - 0.2;
        }
        break;
      }
      case 1: {
        // mão-aberta: braço para cima, mão escala (abrir-fechar)
        if (armRef.current) {
          armRef.current.rotation.x = -1.3;
        }
        if (handRef.current) {
          const s = 0.9 + Math.sin(t * 1.8) * 0.5;
          handRef.current.scale.setScalar(Math.max(0.4, s));
        }
        break;
      }
      case 2: {
        // virar cabeça: rotação Y lenta esq-dir
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 0.6) * 0.9;
        }
        break;
      }
      case 3: {
        // abrir-fechar olhos: escala vertical dos olhos pulsa
        if (eyeLeftRef.current && eyeRightRef.current) {
          const s = 0.55 + Math.abs(Math.sin(t * 1.2)) * 0.5;
          eyeLeftRef.current.scale.y = s;
          eyeRightRef.current.scale.y = s;
        }
        break;
      }
      case 4:
      default: {
        // sem gesto — só respiração leve, já aplicada acima
        break;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pés — disco achatado escuro */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.06, 10]} />
        <meshStandardMaterial
          color="#5a5e68"
          emissive="#1a1c22"
          emissiveIntensity={0.2}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Pernas finas */}
      <mesh position={[-0.1, 0.45, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.78, 8]} />
        <meshStandardMaterial
          color="#a8acb6"
          emissive="#2a2c34"
          emissiveIntensity={0.15}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0.1, 0.45, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.78, 8]} />
        <meshStandardMaterial
          color="#a8acb6"
          emissive="#2a2c34"
          emissiveIntensity={0.15}
          roughness={0.7}
        />
      </mesh>

      {/* Corpo magro — cilindro alto cinza-claro */}
      <mesh ref={bodyRef} position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.85, 12]} />
        <meshStandardMaterial
          color="#b8bcc4"
          emissive="#3a3e48"
          emissiveIntensity={0.18}
          roughness={0.7}
          metalness={0.18}
        />
      </mesh>

      {/* Braço passivo (esquerdo) — pendurado ao lado */}
      <mesh position={[-0.28, 1.25, 0]} rotation={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.045, 0.055, 0.72, 8]} />
        <meshStandardMaterial
          color="#b0b4bc"
          emissive="#2a2c34"
          emissiveIntensity={0.16}
          roughness={0.7}
        />
      </mesh>

      {/* Braço ativo (direito) — group que rotaciona pelo "ombro" */}
      <group ref={armRef} position={[0.28, 1.6, 0]}>
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.72, 8]} />
          <meshStandardMaterial
            color="#b0b4bc"
            emissive="#2a2c34"
            emissiveIntensity={0.16}
            roughness={0.7}
          />
        </mesh>
        {/* Mão — pequena esfera achatada que escala em gesto 1 */}
        <mesh ref={handRef} position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial
            color="#c0c4cc"
            emissive="#3a3e48"
            emissiveIntensity={0.2}
            roughness={0.7}
          />
        </mesh>
      </group>

      {/* Cabeça — ovalada grande, leve achatamento, agrupada para girar */}
      <group ref={headRef} position={[0, 2.05, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.34, 18, 14]} />
          <meshStandardMaterial
            color="#cacdd4"
            emissive="#2a2e36"
            emissiveIntensity={0.18}
            roughness={0.72}
            metalness={0.1}
          />
        </mesh>
        {/* Olhos pretos grandes — duas elipses achatadas */}
        <mesh
          ref={eyeLeftRef}
          position={[-0.14, 0.02, 0.28]}
          scale={[1.2, 1, 0.6]}
        >
          <sphereGeometry args={[0.075, 14, 10]} />
          <meshBasicMaterial
            color="#050608"
            toneMapped={false}
          />
        </mesh>
        <mesh
          ref={eyeRightRef}
          position={[0.14, 0.02, 0.28]}
          scale={[1.2, 1, 0.6]}
        >
          <sphereGeometry args={[0.075, 14, 10]} />
          <meshBasicMaterial
            color="#050608"
            toneMapped={false}
          />
        </mesh>
        {/* (sem boca por desenho — a tristeza está no rosto) */}
      </group>

      {/* Halo dourado — só aparece quando awakened */}
      <mesh ref={haloRef} position={[0, 1.4, 0]}>
        <sphereGeometry args={[1.0, 18, 14]} />
        <meshBasicMaterial
          color="#f4d68c"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Pequena luz pessoal (muito fraca para não-awakened) */}
      <pointLight
        position={[0, 1.6, 0]}
        intensity={awakened ? 0.9 : 0.18}
        distance={awakened ? 6 : 2.4}
        color={awakened ? "#f4d68c" : "#8a8e98"}
        decay={2}
      />
    </group>
  );
}
