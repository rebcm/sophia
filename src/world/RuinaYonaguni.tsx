import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   RuinaYonaguni — geometria estilizada das ruínas submarinas
   ---------------------------------------------------------
   Yonaguni-jima (Japão) tem formações de pedra subaquáticas
   com geometria desconcertantemente regular — pirâmide
   escalonada baixa + plataformas retangulares paralelas +
   escadarias laterais. Pesquisadores discutem se foi natural
   ou trabalho de uma civilização perdida do Pacífico.

   Aqui ela é uma cidade-irmã de Lemúria que não foi punida —
   o mar simplesmente subiu. Está "aguardando reconhecimento".

   Antes (revealed = false): pedras escuras submersas, contorno
   apenas. Depois (revealed = true): emissivo dourado sutil
   percorre as bordas — a cidade lembra que foi cidade.

   Ver docs/22-civilizacoes-expandidas.md §4.11
   ========================================================= */

interface RuinaYonaguniProps {
  position: [number, number, number];
  /** true após 30s de contemplação — bordas ganham emissivo dourado. */
  revealed: boolean;
}

export function RuinaYonaguni({ position, revealed }: RuinaYonaguniProps) {
  const groupRef = useRef<THREE.Group>(null);
  const edgesRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Plataformas paralelas levemente deslocadas — "ruas" submersas
  const platforms = useMemo(
    () => [
      { x: -4.5, z: -2.0, w: 3.0, d: 1.4, h: 0.5, y: -0.25 },
      { x: -1.0, z: -2.8, w: 3.5, d: 1.6, h: 0.7, y: -0.35 },
      { x: 3.0, z: -1.6, w: 2.8, d: 1.3, h: 0.5, y: -0.25 },
      { x: -3.0, z: 1.8, w: 3.2, d: 1.5, h: 0.6, y: -0.3 },
      { x: 2.0, z: 2.4, w: 3.0, d: 1.4, h: 0.5, y: -0.25 },
    ],
    [],
  );

  // Pirâmide escalonada central — 4 níveis decrescentes
  const tiers = useMemo(() => {
    const out: { y: number; r: number; h: number }[] = [];
    const baseR = 3.2;
    const baseH = 0.65;
    let y = -0.1;
    for (let i = 0; i < 4; i++) {
      const r = baseR * (1 - i * 0.2);
      const h = baseH * (1 - i * 0.08);
      out.push({ y: y + h / 2, r, h });
      y += h;
    }
    return out;
  }, []);

  // Escadarias laterais — caixas finas espalhadas como degraus
  const stairs = useMemo(() => {
    const out: { x: number; z: number; y: number; w: number; h: number; d: number }[] = [];
    for (let i = 0; i < 6; i++) {
      out.push({
        x: -5.8 + i * 0.12,
        z: 0 - i * 0.3,
        y: -0.4 + i * 0.18,
        w: 1.2,
        h: 0.18,
        d: 0.4,
      });
    }
    for (let i = 0; i < 5; i++) {
      out.push({
        x: 5.4 - i * 0.1,
        z: 0.5 + i * 0.28,
        y: -0.4 + i * 0.16,
        w: 1.0,
        h: 0.16,
        d: 0.4,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Bordas emissivas pulsam suavemente quando revelada
    if (edgesRef.current) {
      edgesRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (!mat) return;
        const target = revealed ? 0.55 + Math.sin(t * 0.6) * 0.1 : 0.0;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.03);
      });
    }

    // Luz quente de "reconhecimento" sob a água
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        revealed ? 0.8 + Math.sin(t * 0.5) * 0.12 : 0,
        0.03,
      );
    }
  });

  const stoneColor = revealed ? "#2a3848" : "#10202c";
  const stoneEmissive = revealed ? "#152838" : "#040810";
  const stoneEmissiveIntensity = revealed ? 0.35 : 0.12;

  return (
    <group ref={groupRef} position={position}>
      {/* Luz quente sob as ruínas — só visível ao revelar */}
      <pointLight
        ref={lightRef}
        position={[0, -0.5, 0]}
        intensity={0}
        distance={20}
        color="#ffd078"
        decay={2}
      />

      {/* Pirâmide escalonada central */}
      <group>
        {tiers.map((tier, i) => (
          <mesh key={`tier-${i}`} position={[0, tier.y, 0]} castShadow receiveShadow>
            <boxGeometry args={[tier.r * 2, tier.h, tier.r * 2]} />
            <meshStandardMaterial
              color={stoneColor}
              emissive={stoneEmissive}
              emissiveIntensity={stoneEmissiveIntensity}
              roughness={0.95}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Plataformas paralelas — "ruas" da cidade */}
      <group>
        {platforms.map((p, i) => (
          <mesh
            key={`plat-${i}`}
            position={[p.x, p.y, p.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[p.w, p.h, p.d]} />
            <meshStandardMaterial
              color={stoneColor}
              emissive={stoneEmissive}
              emissiveIntensity={stoneEmissiveIntensity}
              roughness={0.95}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Escadarias laterais */}
      <group>
        {stairs.map((s, i) => (
          <mesh
            key={`stair-${i}`}
            position={[s.x, s.y, s.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[s.w, s.h, s.d]} />
            <meshStandardMaterial
              color={stoneColor}
              emissive={stoneEmissive}
              emissiveIntensity={stoneEmissiveIntensity * 0.8}
              roughness={0.95}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Bordas emissivas — só aparecem quando revealed.
          Linhas finas sobre o topo da pirâmide e das plataformas. */}
      <group ref={edgesRef}>
        {/* Anel no topo da pirâmide (último tier) */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, tiers[tiers.length - 1]!.y + tiers[tiers.length - 1]!.h / 2 + 0.02, 0]}
        >
          <ringGeometry args={[
            tiers[tiers.length - 1]!.r * 0.8,
            tiers[tiers.length - 1]!.r * 0.95,
            32,
          ]} />
          <meshBasicMaterial
            color="#ffd078"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Anéis no topo das plataformas */}
        {platforms.map((p, i) => (
          <mesh
            key={`edge-plat-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[p.x, p.y + p.h / 2 + 0.02, p.z]}
          >
            <ringGeometry args={[
              Math.min(p.w, p.d) * 0.35,
              Math.min(p.w, p.d) * 0.48,
              24,
            ]} />
            <meshBasicMaterial
              color="#ffd078"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
