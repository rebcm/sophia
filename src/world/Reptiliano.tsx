import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Reptiliano — Anjo Caído da Manipulação Psíquica
   ---------------------------------------------------------
   Figura humanoide-reptilóide SENTADA num pequeno trono.
   Sem violência gráfica. Torso de cilindro, cabeça oval
   esverdeada, sutis traços de escama (anéis discretos).
   Olhos amarelados estreitos. Quando "dissolved" = true:
   fade-out gradual + partículas escuras subindo.
   Cada Reptiliano corresponde a uma instituição humana
   sequestrada (arquétipo). 12 deles sentam em círculo
   numa câmara subterrânea, pensando-juntos.
   Família 10-99: levemente sinistros mas NÃO assustadores.
   Ver docs/22-civilizacoes-expandidas.md §3.6
   ========================================================= */

interface ReptilianoProps {
  position: [number, number, number];
  /** Rotação Y para olhar para o centro (atribuída pelo orquestrador da cena). */
  rotY: number;
  archetypeName: string;
  dissolved: boolean;
}

const PARTICLE_COUNT = 8;

export function Reptiliano({
  position,
  rotY,
  dissolved,
}: ReptilianoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const throneRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  // Fade animation (0..1). 0 = inteiro/visível; 1 = totalmente dissolvido.
  const fadeT = useRef(0);

  useEffect(() => {
    if (!dissolved) fadeT.current = 0;
  }, [dissolved]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Avança a animação de fade quando dissolved
    if (dissolved && fadeT.current < 1) {
      fadeT.current = Math.min(1, fadeT.current + 0.008);
    }
    const ft = fadeT.current;
    const visible = 1 - ft;

    // Aplicar fade — opacidade dos materiais
    const applyOpacity = (
      m: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial | undefined,
      base = 1,
    ) => {
      if (!m) return;
      m.transparent = true;
      m.opacity = base * visible;
    };
    if (bodyRef.current) {
      applyOpacity(bodyRef.current.material as THREE.MeshStandardMaterial);
    }
    if (headRef.current) {
      applyOpacity(headRef.current.material as THREE.MeshStandardMaterial);
    }
    if (throneRef.current) {
      applyOpacity(throneRef.current.material as THREE.MeshStandardMaterial);
    }
    if (eyeLeftRef.current) {
      applyOpacity(eyeLeftRef.current.material as THREE.MeshBasicMaterial);
    }
    if (eyeRightRef.current) {
      applyOpacity(eyeRightRef.current.material as THREE.MeshBasicMaterial);
    }

    // Aura verde-acinzentada — diminui à medida que dissolve
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (0.16 + Math.sin(t * 0.6 + position[0]) * 0.03) * visible;
    }

    // "Pensando-juntos": cabeça oscila lentamente no eixo Z (assentindo)
    if (headRef.current && !dissolved) {
      headRef.current.rotation.z =
        Math.sin(t * 0.55 + position[0] * 0.4) * 0.06;
    }

    // Olhos pulsam — sutil (representam atividade psíquica)
    if (eyeLeftRef.current && eyeRightRef.current && !dissolved) {
      [eyeLeftRef.current, eyeRightRef.current].forEach((mesh) => {
        const m = mesh.material as THREE.MeshBasicMaterial;
        const intens = 0.85 + Math.sin(t * 1.4 + position[2] * 0.3) * 0.1;
        m.color.setRGB(0.85 * intens, 0.78 * intens, 0.32 * intens);
      });
    }

    // Partículas escuras subindo enquanto dissolve
    if (particlesRef.current) {
      particlesRef.current.visible = dissolved;
      if (dissolved) {
        particlesRef.current.children.forEach((child, i) => {
          const phase = (i / PARTICLE_COUNT) * Math.PI * 2;
          // Sobe e dispersa
          const localT = (t * 0.6 + phase + ft * 4) % (Math.PI * 2);
          const y = 0.5 + (localT / (Math.PI * 2)) * 2.6;
          child.position.set(
            Math.cos(phase + ft * 2) * (0.2 + ft * 0.4),
            y,
            Math.sin(phase + ft * 2) * (0.2 + ft * 0.4),
          );
          const mesh = child as THREE.Mesh;
          const m = mesh.material as THREE.MeshBasicMaterial;
          // Aparecem brevemente e somem
          m.opacity = Math.max(0, 0.45 * (1 - localT / (Math.PI * 2))) * ft;
        });
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotY, 0]}>
      {/* Pequeno trono — pedra escura baixa */}
      <mesh ref={throneRef} position={[0, 0.35, -0.42]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.7, 0.45]} />
        <meshStandardMaterial
          color="#2a3028"
          emissive="#08100a"
          emissiveIntensity={0.18}
          roughness={0.85}
          metalness={0.18}
        />
      </mesh>
      {/* Encosto alto do trono */}
      <mesh
        ref={undefined}
        position={[0, 1.1, -0.62]}
        castShadow
      >
        <boxGeometry args={[0.86, 1.6, 0.12]} />
        <meshStandardMaterial
          color="#262c24"
          emissive="#08100a"
          emissiveIntensity={0.16}
          roughness={0.86}
          metalness={0.2}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Torso — cilindro alto verde-acinzentado */}
      <mesh ref={bodyRef} position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.4, 1.05, 14]} />
        <meshStandardMaterial
          color="#3e5c40"
          emissive="#1a2e1c"
          emissiveIntensity={0.22}
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      {/* Anéis de "escama" sutis no torso — discretos */}
      {[0.85, 1.1, 1.35].map((y, i) => (
        <mesh
          key={`scale-${i}`}
          position={[0, y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.37, 0.02, 6, 16]} />
          <meshStandardMaterial
            color="#5a7050"
            emissive="#1a3018"
            emissiveIntensity={0.3}
            roughness={0.55}
            metalness={0.55}
          />
        </mesh>
      ))}

      {/* Pernas dobradas (sentado) — duas formas curtas */}
      {[-0.16, 0.16].map((dx, i) => (
        <mesh
          key={`leg-${i}`}
          position={[dx, 0.55, 0.18]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <cylinderGeometry args={[0.11, 0.13, 0.66, 8]} />
          <meshStandardMaterial
            color="#3a543c"
            emissive="#142a16"
            emissiveIntensity={0.22}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Braços apoiados no colo */}
      {[-0.34, 0.34].map((dx, i) => (
        <mesh
          key={`arm-${i}`}
          position={[dx, 0.95, 0.22]}
          rotation={[Math.PI / 4, 0, 0]}
        >
          <cylinderGeometry args={[0.08, 0.09, 0.62, 8]} />
          <meshStandardMaterial
            color="#3a543c"
            emissive="#142a16"
            emissiveIntensity={0.22}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Pescoço curto */}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.11, 0.14, 0.18, 10]} />
        <meshStandardMaterial
          color="#3a503c"
          emissive="#142a18"
          emissiveIntensity={0.22}
          roughness={0.7}
        />
      </mesh>

      {/* Cabeça oval esverdeada */}
      <mesh ref={headRef} position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.28, 18, 14]} />
        <meshStandardMaterial
          color="#4a6648"
          emissive="#1a3020"
          emissiveIntensity={0.22}
          roughness={0.65}
          metalness={0.18}
        />
      </mesh>

      {/* Olhos amarelados estreitos — duas elipses achatadas horizontais */}
      <mesh
        ref={eyeLeftRef}
        position={[-0.1, 1.95, 0.22]}
        scale={[1.2, 0.5, 0.5]}
      >
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshBasicMaterial
          color="#d8c850"
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={eyeRightRef}
        position={[0.1, 1.95, 0.22]}
        scale={[1.2, 0.5, 0.5]}
      >
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshBasicMaterial
          color="#d8c850"
          toneMapped={false}
        />
      </mesh>

      {/* Aura discreta verde-acinzentada ao redor — sutil presença psíquica */}
      <mesh ref={auraRef} position={[0, 1.1, -0.1]}>
        <sphereGeometry args={[1.05, 18, 14]} />
        <meshBasicMaterial
          color="#3e6440"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>

      {/* Partículas escuras que sobem ao dissolver */}
      <group ref={particlesRef} visible={false}>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <mesh key={`p-${i}`}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial
              color="#0a1208"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
