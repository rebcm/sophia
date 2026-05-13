import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   EspelhoTzeboim — espelho metálico de rua, alto e estreito
   ---------------------------------------------------------
   Em Tzeboim, todos imitam todos. As ruas estão cobertas de
   espelhos onde cada habitante vê o reflexo do habitante mais
   próximo no lugar do próprio rosto — versão SOCIAL do
   Auto-Sabotador da Casa-Espelhada.

   Mecânica: quando o jogador passa < 1.5m, o espelho quebra
   suavemente:
     - placa principal vira translúcida (queda de opacidade)
     - 8 shards rotativos aparecem atrás
     - uma silhueta âmbar "rosto verdadeiro" pulsa por trás
       (a identidade devolvida do habitante)

   Sem horror — quebra contemplativa, shards lentos, sem
   estilhaços agressivos.
   ========================================================= */

interface EspelhoTzeboimProps {
  position: [number, number, number];
  /** Rotação em Y (orientação da face refletora). */
  rotY: number;
  /** True: espelho quebrado, mostra rosto verdadeiro. */
  broken: boolean;
}

export function EspelhoTzeboim({
  position,
  rotY,
  broken,
}: EspelhoTzeboimProps) {
  const groupRef = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.Mesh>(null);
  const shardsRef = useRef<THREE.Group>(null);
  const silhouetteRef = useRef<THREE.Group>(null);

  // 8 shards rotativos, posições semi-aleatórias estáveis
  const shards = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      // Hash determinístico por índice — sem dependência de seed externa
      const hash = (n: number) => {
        const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
        return x - Math.floor(x);
      };
      return {
        x: (hash(0) - 0.5) * 1.6,
        y: 1.2 + (hash(1) - 0.5) * 2.4,
        z: -0.12 - hash(2) * 0.4,
        rotX: hash(3) * Math.PI,
        rotY: hash(4) * Math.PI,
        rotZ: hash(5) * Math.PI,
        size: 0.18 + hash(6) * 0.18,
        spinSpeed: 0.3 + hash(7) * 0.4,
        spinAxis: hash(0) > 0.5 ? 1 : -1,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Placa principal — vai ficando translúcida quando quebra
    if (plateRef.current) {
      const mat = plateRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = broken ? 0.18 : 0.92;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.06);
      // Pequena vibração quando broken — "ainda assenta"
      if (broken) {
        plateRef.current.rotation.z = Math.sin(t * 2.5) * 0.005;
      }
    }

    // Shards: aparecem suavemente e giram lento
    if (shardsRef.current) {
      shardsRef.current.visible = broken;
      if (broken) {
        shardsRef.current.children.forEach((child, i) => {
          const s = shards[i];
          if (!s) return;
          child.rotation.x += 0.002 * s.spinAxis * s.spinSpeed;
          child.rotation.y += 0.0025 * s.spinSpeed;
          child.rotation.z += 0.0018 * s.spinAxis * s.spinSpeed;
          // Drift muito lento — flutuação contemplativa
          child.position.y = s.y + Math.sin(t * 0.6 + i * 0.5) * 0.08;
          // Material — pulsa opacidade suavemente
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.opacity = 0.55 + Math.sin(t * 1.2 + i) * 0.12;
        });
      }
    }

    // Silhueta âmbar — rosto verdadeiro do habitante por trás
    if (silhouetteRef.current) {
      silhouetteRef.current.visible = broken;
      if (broken) {
        // Pulsa um glow âmbar
        silhouetteRef.current.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          if (!mat.color) return;
          mat.opacity = 0.55 + Math.sin(t * 1.4) * 0.12;
        });
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotY, 0]}>
      {/* Pedestal/moldura inferior — bloco escuro */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.3, 0.35]} />
        <meshStandardMaterial
          color="#2a2a2e"
          roughness={0.85}
          metalness={0.3}
          emissive="#0a0a0c"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Moldura — borda metálica fina */}
      <mesh position={[0, 1.8, -0.04]} castShadow>
        <boxGeometry args={[1.6, 3.1, 0.06]} />
        <meshStandardMaterial
          color="#4a4a52"
          roughness={0.55}
          metalness={0.85}
          emissive="#181820"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Placa principal — espelho 1.5 x 3.0 (high-reflectivity) */}
      <mesh ref={plateRef} position={[0, 1.8, 0]}>
        <planeGeometry args={[1.5, 3.0]} />
        <meshStandardMaterial
          color={broken ? "#9aa4b4" : "#c8d0d8"}
          metalness={1.0}
          roughness={0.08}
          envMapIntensity={1.4}
          emissive="#1a2030"
          emissiveIntensity={0.18}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Silhueta âmbar — rosto verdadeiro do habitante atrás */}
      <group ref={silhouetteRef} position={[0, 1.6, -0.12]} visible={false}>
        {/* Corpo */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.42, 1.6, 10]} />
          <meshBasicMaterial
            color="#ffb060"
            transparent
            opacity={0.55}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        {/* Cabeça */}
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.22, 14, 12]} />
          <meshBasicMaterial
            color="#ffd890"
            transparent
            opacity={0.62}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        {/* Aura quente envolvente */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.9, 14, 12]} />
          <meshBasicMaterial
            color="#ffa848"
            transparent
            opacity={0.22}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* 8 shards rotativos — só visíveis quando quebrado */}
      <group ref={shardsRef} visible={false}>
        {shards.map((s, i) => (
          <mesh
            key={i}
            position={[s.x, s.y, s.z]}
            rotation={[s.rotX, s.rotY, s.rotZ]}
          >
            <planeGeometry args={[s.size, s.size * 1.6]} />
            <meshStandardMaterial
              color="#d8e0e8"
              metalness={1.0}
              roughness={0.1}
              emissive="#2a3040"
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Pequena luz quente atrás quando broken — vaza a verdade */}
      {broken && (
        <pointLight
          position={[0, 1.8, -0.25]}
          intensity={0.45}
          distance={3.6}
          color="#ffa860"
          decay={2}
        />
      )}
    </group>
  );
}
