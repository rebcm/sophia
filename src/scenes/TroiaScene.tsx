import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { Portal } from "../world/Portal";
import { HelenaDaMemoria } from "../world/HelenaDaMemoria";

/* =========================================================
   TroiaScene — A Cidade Do Desejo Destrutivo (suspensa)
   ---------------------------------------------------------
   Muralhas altas semicirculares com a brecha do cavalo de
   madeira aberta ao norte. Dentro: ruas com silhuetas-soldados
   congeladas em posturas de combate (15-20 figuras), preparando
   uma guerra que nunca acontece. Tarde-fim-de-dia sépia, fog
   de poeira de batalha cinza-amarelado. Skybox sépia-quente.

   Sem mecânica de combate. Apenas exploração. Encontro opcional
   com Helena-da-Memória sentada num degrau de pedra à entrada
   do pequeno templo-palácio central. Aproximação + F → cinemática
   "helena-de-troia".

   Geografia:
     - Praça pavimentada de pedras-areia
     - Muralhas em torus quebrado (semicírculo norte) + brecha
     - Cavalo de madeira low-poly dentro da brecha
     - 18 silhuetas-soldados congeladas espalhadas
     - Pequeno templo-palácio central (cubo grande estilizado)
     - Helena sentada num degrau frontal do palácio
     - Skybox sépia-quente, fog poeira cinza-amarelado

   Ver docs/22-civilizacoes-expandidas.md §4.8 (Tróia).
   ========================================================= */

const HELENA_POS: [number, number, number] = [0.6, 0.36, 1.6];
const PALACE_POS: [number, number, number] = [0, 0, -3];
const HORSE_POS: [number, number, number] = [0, 0, -14];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface TroiaSceneProps {
  helenaMet: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function TroiaScene({
  helenaMet,
  onReturnToMar,
  onPlayerRef,
}: TroiaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 60, near: 0.1, far: 320, position: [0, 4, 13] }}
    >
      {/* Skybox sépia-quente — fim de tarde de batalha suspensa */}
      <color attach="background" args={["#9a7858"]} />
      <fog attach="fog" args={["#a89070", 18, 90]} />

      <ambientLight color="#d8b888" intensity={0.65} />

      {/* Sol baixo dourado-sépia — luz lateral oblíqua */}
      <directionalLight
        position={[12, 7, 6]}
        intensity={0.95}
        color="#e8b878"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Luz quente do palácio ao fundo */}
      <pointLight
        position={[PALACE_POS[0], 4, PALACE_POS[2]]}
        intensity={1.0}
        distance={14}
        color="#f4c878"
        decay={2}
      />

      {/* Luz sobre Helena (mais discreta após encontro) */}
      <pointLight
        position={[HELENA_POS[0], 2.6, HELENA_POS[2]]}
        intensity={helenaMet ? 0.6 : 0.95}
        distance={6.5}
        color="#f8d0b0"
        decay={2}
      />

      <SandyPavement />
      <CityWalls />
      <WallBreach />
      <WoodenHorse position={HORSE_POS} />
      <FrozenSoldiers />
      <PalaceTemple position={PALACE_POS} />
      <BattleDust />

      <HelenaDaMemoria
        position={HELENA_POS}
        metByPlayer={helenaMet}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={helenaMet ? "(Tróia pode soltar)" : "(voltar)"}
          color="#f4c878"
          playerRef={playerRef}
          onProximityChange={(near) => {
            if (!near) return;
            const handler = (e: KeyboardEvent) => {
              if (
                e.code === "Space" ||
                e.code === "Enter" ||
                e.code === "KeyF"
              ) {
                window.removeEventListener("keydown", handler);
                onReturnToMar();
              }
            };
            window.addEventListener("keydown", handler);
          }}
        />
      )}

      <EffectComposer>
        <Bloom intensity={0.72} luminanceThreshold={0.6} mipmapBlur />
        <Vignette eskil={false} darkness={0.5} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Chão pavimentado de pedras-areia. */
function SandyPavement() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[36, 64]} />
        <meshStandardMaterial
          color="#b89868"
          emissive="#6a4828"
          emissiveIntensity={0.14}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>
      {/* Estrada central até o palácio */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, 0.0, -3]}
      >
        <planeGeometry args={[2.6, 20]} />
        <meshStandardMaterial
          color="#a88858"
          emissive="#5a3818"
          emissiveIntensity={0.18}
          roughness={0.94}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}

/** Muralhas altas semicirculares — segmentos de torus em arco. */
function CityWalls() {
  // 14 segmentos em semi-arco fechado, deixando a brecha no norte (z negativo)
  const segments = useMemo(() => {
    const out: { x: number; z: number; rotY: number; height: number }[] = [];
    const COUNT = 18;
    const radius = 16;
    // Cobre 360° menos a brecha (~50° centrada no norte = z negativo)
    const gapStart = -Math.PI / 2 - 0.45;
    const gapEnd = -Math.PI / 2 + 0.45;
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2;
      // Pula a brecha
      if (a > gapStart + Math.PI * 2 && a < gapEnd + Math.PI * 2) continue;
      if (a > gapStart && a < gapEnd) continue;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const rotY = a + Math.PI / 2;
      const height = 4.8 + (i % 3) * 0.4;
      out.push({ x, z, rotY, height });
    }
    return out;
  }, []);

  return (
    <group>
      {segments.map((s, i) => (
        <group
          key={`wall-${i}`}
          position={[s.x, 0, s.z]}
          rotation={[0, s.rotY, 0]}
        >
          {/* Bloco de muralha — caixa alta de pedra clara */}
          <mesh position={[0, s.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.6, s.height, 1.2]} />
            <meshStandardMaterial
              color="#c8a878"
              emissive="#7a5028"
              emissiveIntensity={0.16}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
          {/* Ameias no topo — 3 cubinhos */}
          {[-1.8, 0, 1.8].map((dx, j) => (
            <mesh
              key={`battlement-${i}-${j}`}
              position={[dx, s.height + 0.25, 0]}
              castShadow
            >
              <boxGeometry args={[1.0, 0.5, 1.2]} />
              <meshStandardMaterial
                color="#b89868"
                emissive="#6a4828"
                emissiveIntensity={0.18}
                roughness={0.88}
                metalness={0.05}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Brecha — pedras quebradas no chão à beira da abertura ao norte. */
function WallBreach() {
  const rubble = useMemo(() => {
    const out: { x: number; z: number; rotY: number; scale: number }[] = [];
    // Pedaços de pedra caída perto da brecha (z=-16)
    const positions: [number, number][] = [
      [-3.2, -14.5],
      [-1.6, -15.2],
      [1.4, -15.0],
      [2.8, -14.4],
      [-2.2, -13.8],
      [2.0, -13.4],
    ];
    positions.forEach(([x, z], i) => {
      out.push({ x, z, rotY: (i * 1.3) % Math.PI, scale: 0.55 + (i % 3) * 0.18 });
    });
    return out;
  }, []);

  return (
    <group>
      {rubble.map((r, i) => (
        <mesh
          key={`rubble-${i}`}
          position={[r.x, 0.25 * r.scale, r.z]}
          rotation={[0, r.rotY, 0.15]}
          scale={r.scale}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.2, 0.8, 0.9]} />
          <meshStandardMaterial
            color="#a88858"
            emissive="#5a3818"
            emissiveIntensity={0.16}
            roughness={0.92}
            metalness={0.04}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Cavalo de madeira — silhueta low-poly mas reconhecível. */
function WoodenHorse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 4 pernas — cubos verticais */}
      {[
        [-0.7, 0.8, -0.6],
        [0.7, 0.8, -0.6],
        [-0.7, 0.8, 0.6],
        [0.7, 0.8, 0.6],
      ].map(([px, py, pz], i) => (
        <mesh
          key={`leg-${i}`}
          position={[px, py, pz]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.36, 1.6, 0.36]} />
          <meshStandardMaterial
            color="#6a4624"
            emissive="#3a2410"
            emissiveIntensity={0.16}
            roughness={0.88}
            metalness={0.06}
          />
        </mesh>
      ))}

      {/* Corpo — cilindro horizontal */}
      <mesh
        position={[0, 2.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.85, 0.85, 2.4, 14]} />
        <meshStandardMaterial
          color="#7a5230"
          emissive="#3a2410"
          emissiveIntensity={0.18}
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>

      {/* Pescoço — cubo inclinado para cima e frente */}
      <mesh
        position={[0, 2.8, 1.0]}
        rotation={[-0.4, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.5, 1.2, 0.55]} />
        <meshStandardMaterial
          color="#6a4624"
          emissive="#3a2410"
          emissiveIntensity={0.16}
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* Cabeça — cubo */}
      <mesh position={[0, 3.55, 1.4]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.85]} />
        <meshStandardMaterial
          color="#7a5230"
          emissive="#3a2410"
          emissiveIntensity={0.18}
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>

      {/* Cauda — pequeno cubo atrás */}
      <mesh
        position={[0, 2.4, -1.3]}
        rotation={[0.5, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.18, 0.18, 0.55]} />
        <meshStandardMaterial
          color="#5a3818"
          emissive="#2a1808"
          emissiveIntensity={0.16}
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* Rodas grandes embaixo (referência à máquina-cavalo) — 4 toros */}
      {[
        [-0.7, 0.0, -0.6],
        [0.7, 0.0, -0.6],
        [-0.7, 0.0, 0.6],
        [0.7, 0.0, 0.6],
      ].map(([px, py, pz], i) => (
        <mesh
          key={`wheel-${i}`}
          position={[px, py + 0.06, pz]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[0.18, 0.05, 6, 14]} />
          <meshStandardMaterial
            color="#3a2410"
            emissive="#1a0c04"
            emissiveIntensity={0.16}
            roughness={0.86}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 18 silhuetas-soldados congeladas em posturas de combate.
 *  Cilindro corpo + cubo armadura + braços levantados em ângulo.
 *  Família 10-99: SEM sangue, SEM armas detalhadas — apenas postura. */
function FrozenSoldiers() {
  const soldiers = useMemo(() => {
    const out: {
      x: number;
      z: number;
      rotY: number;
      armAngle: number;
      armSide: 1 | -1;
    }[] = [];
    // Espalha entre a brecha (z=-14) e a praça (z=4), evita centro e palácio
    const placements: [number, number][] = [
      [-5.2, -11.0],
      [-3.8, -9.4],
      [3.6, -10.2],
      [5.6, -8.8],
      [-6.4, -7.0],
      [6.2, -6.4],
      [-4.0, -5.0],
      [4.4, -4.6],
      [-7.0, -1.6],
      [6.8, -0.4],
      [-5.6, 1.6],
      [5.4, 2.0],
      [-3.4, 3.8],
      [3.6, 4.0],
      [-7.8, 5.6],
      [7.2, 5.2],
      [-2.4, -7.4],
      [2.6, -7.0],
    ];
    placements.forEach(([x, z], i) => {
      out.push({
        x,
        z,
        rotY: (i * 0.61) % (Math.PI * 2),
        armAngle: 0.55 + (i % 3) * 0.18,
        armSide: i % 2 === 0 ? 1 : -1,
      });
    });
    return out;
  }, []);

  return (
    <group>
      {soldiers.map((s, i) => (
        <group
          key={`sld-${i}`}
          position={[s.x, 0, s.z]}
          rotation={[0, s.rotY, 0]}
        >
          {/* Corpo — cilindro alongado bronze-fosco */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.3, 1.5, 10]} />
            <meshStandardMaterial
              color="#7a6840"
              emissive="#3a3018"
              emissiveIntensity={0.2}
              roughness={0.82}
              metalness={0.18}
            />
          </mesh>
          {/* Armadura (peitoral) — cubo */}
          <mesh position={[0, 1.1, 0.0]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.34]} />
            <meshStandardMaterial
              color="#a89868"
              emissive="#5a4818"
              emissiveIntensity={0.22}
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>
          {/* Capacete — cone curto bronze */}
          <mesh position={[0, 1.85, 0]} castShadow>
            <coneGeometry args={[0.18, 0.36, 8]} />
            <meshStandardMaterial
              color="#b89868"
              emissive="#6a4820"
              emissiveIntensity={0.25}
              roughness={0.5}
              metalness={0.5}
            />
          </mesh>
          {/* Cabeça sob o capacete */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <sphereGeometry args={[0.16, 12, 10]} />
            <meshStandardMaterial
              color="#dcb890"
              emissive="#8a5838"
              emissiveIntensity={0.16}
              roughness={0.78}
              metalness={0.04}
            />
          </mesh>
          {/* Braço levantado em ângulo (posto de combate, sem arma detalhada) */}
          <mesh
            position={[s.armSide * 0.32, 1.0, 0.18]}
            rotation={[0, 0, s.armSide * -s.armAngle]}
            castShadow
          >
            <cylinderGeometry args={[0.08, 0.08, 0.85, 8]} />
            <meshStandardMaterial
              color="#7a6840"
              emissive="#3a3018"
              emissiveIntensity={0.2}
              roughness={0.78}
              metalness={0.2}
            />
          </mesh>
          {/* Outro braço caído ao lado */}
          <mesh
            position={[s.armSide * -0.32, 0.92, 0]}
            rotation={[0, 0, s.armSide * 0.18]}
            castShadow
          >
            <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
            <meshStandardMaterial
              color="#7a6840"
              emissive="#3a3018"
              emissiveIntensity={0.2}
              roughness={0.78}
              metalness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Pequeno templo-palácio central — cubo grande estilizado com colunas. */
function PalaceTemple({ position }: { position: [number, number, number] }) {
  const roofRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!roofRef.current) return;
    const t = state.clock.elapsedTime;
    const m = roofRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.3 + Math.sin(t * 0.4) * 0.06;
  });

  return (
    <group position={position}>
      {/* Plataforma de pedra clara */}
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <boxGeometry args={[7.0, 0.6, 5.0]} />
        <meshStandardMaterial
          color="#c8a878"
          emissive="#6a4828"
          emissiveIntensity={0.15}
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* Degrau frontal (onde Helena se senta) */}
      <mesh position={[0, 0.18, 2.7]} receiveShadow>
        <boxGeometry args={[5.4, 0.36, 0.6]} />
        <meshStandardMaterial
          color="#d8b888"
          emissive="#7a5028"
          emissiveIntensity={0.15}
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>

      {/* Corpo principal — caixa cinza-pedra */}
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 3.4, 3.6]} />
        <meshStandardMaterial
          color="#a89878"
          emissive="#4a4028"
          emissiveIntensity={0.16}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* 4 colunas frontais — cilindros brancos */}
      {[-2.2, -0.74, 0.74, 2.2].map((cx, i) => (
        <mesh
          key={`col-${i}`}
          position={[cx, 1.95, 1.95]}
          castShadow
        >
          <cylinderGeometry args={[0.22, 0.24, 3.6, 12]} />
          <meshStandardMaterial
            color="#ece0c8"
            emissive="#a89878"
            emissiveIntensity={0.2}
            roughness={0.74}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Frontão triangular (telhado dourado-sépia) */}
      <mesh ref={roofRef} position={[0, 4.3, 0]} castShadow>
        <coneGeometry args={[4.2, 1.6, 4]} />
        <meshStandardMaterial
          color="#d8a868"
          emissive="#9a6838"
          emissiveIntensity={0.3}
          roughness={0.55}
          metalness={0.5}
        />
      </mesh>

      {/* Portal escuro central */}
      <mesh position={[0, 1.6, 1.81]}>
        <planeGeometry args={[1.6, 2.6]} />
        <meshBasicMaterial
          color="#3a2410"
          transparent
          opacity={0.85}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Poeira de batalha — partículas cinza-amareladas suspensas. */
function BattleDust() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 110;

  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 30,
      baseY: 0.3 + Math.random() * 5.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.09 + Math.random() * 0.22,
      size: 0.04 + Math.random() * 0.06,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      if (!d) return;
      const mesh = child as THREE.Mesh;
      mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.5;
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 0.28 + Math.sin(t * d.speed + d.phase) * 0.18;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={`dust-${i}`} position={[d.x, d.baseY, d.z]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshBasicMaterial
            color="#d8c898"
            transparent
            opacity={0.42}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
