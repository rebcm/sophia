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
import { PedraMaeAdama } from "../world/PedraMaeAdama";

/* =========================================================
   AdamaScene — A Cidade Que Esqueceu a Terra
   ---------------------------------------------------------
   Gn 14:2. "Adamá" significa, em hebraico, "vermelha como
   a terra". Mas a cidade flutuou — recusou pisar no chão.
   Habitantes (silhuetas) levitam entre os edifícios sem
   tocar o solo.

   No centro: a Pedra-Mãe-da-Cidade — uma rocha grande
   irregular vermelho-terra, fixa, paciente, esperando ser
   lembrada como lar.

   Mecânica: aproximar < 3m da Pedra-Mãe + segurar F por 5s.
   A cada segundo, a cidade desce 1m. Após 5s: a cidade pousa
   gentilmente sobre a terra. Habitantes pisam o chão. Cidade
   redimida.

   Sem julgamento ético sobre o que Adamá "fez". Tratamento
   arquetípico, contemplativo, sem violência gráfica.
   ========================================================= */

const PEDRA_MAE_POS: [number, number, number] = [0, 0, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

/** Altura inicial da cidade no céu (quando descentProgress = 0). */
const CITY_INITIAL_Y = 8;
/** Altura final (quando descentProgress = 1) — pousa sobre as nuvens. */
const CITY_FINAL_Y = 0.4;

interface AdamaSceneProps {
  /** True quando a cidade já foi redimida (pousou). */
  interceded: boolean;
  /** 0..1 — progresso da intercessão (cidade descendo). */
  descentProgress: number;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function AdamaScene({
  interceded,
  descentProgress,
  onReturnToMar,
  onPlayerRef,
}: AdamaSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (onPlayerRef) onPlayerRef(playerRef);
  }, [onPlayerRef]);

  // Quando redimida, força progresso máximo para o visual final
  const effectiveProgress = interceded ? 1 : Math.max(0, Math.min(1, descentProgress));
  const grounded = interceded || effectiveProgress >= 1;

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
      camera={{ fov: 60, near: 0.1, far: 300, position: [0, 4.5, 13] }}
    >
      {/* Skybox azul-celeste fumegante (não-vermelho). Quando pousada,
          abre para um azul mais quente, com âmbar do entardecer. */}
      <color
        attach="background"
        args={[grounded ? "#5a6a82" : "#3a4862"]}
      />
      <fog
        attach="fog"
        args={[grounded ? "#6a7894" : "#3e4c66", 16, 70]}
      />

      <ambientLight color="#7a8aa4" intensity={0.55} />

      {/* Luz alta — sol-velado, atrás das nuvens */}
      <directionalLight
        position={[6, 18, 4]}
        intensity={grounded ? 0.65 : 0.5}
        color="#e8d8b8"
      />

      {/* Luz quente vinda da Pedra-Mãe — cresce com a intercessão */}
      <pointLight
        position={[0, 1.6, 0]}
        intensity={0.4 + effectiveProgress * 2.0}
        distance={18}
        color="#ffa860"
        decay={2}
      />

      <NuvemPlatform progress={effectiveProgress} />
      <NuvemFloorBelow />
      <CidadeBarrocaAerea
        descentY={THREE.MathUtils.lerp(
          CITY_INITIAL_Y,
          CITY_FINAL_Y,
          effectiveProgress,
        )}
        grounded={grounded}
      />
      <HabitantesFlutuantes
        descentProgress={effectiveProgress}
        grounded={grounded}
      />

      <PedraMaeAdama
        position={PEDRA_MAE_POS}
        descentProgress={effectiveProgress}
        playerRef={playerRef}
      />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={grounded ? "(Adamá toca a terra)" : "(voltar)"}
          color="#c5d7e0"
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
        <Bloom intensity={0.7} luminanceThreshold={0.42} mipmapBlur />
        <Vignette eskil={false} darkness={0.6} offset={0.32} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

/** Tapete-nuvem central — o "chão" emissivo branco onde o jogador anda. */
function NuvemPlatform({ progress }: { progress: number }) {
  // Quando pousada, ganha um sopro âmbar-terroso ao redor da Pedra-Mãe
  const platformTint = useMemo(() => {
    const c = new THREE.Color("#f4f0e8");
    c.lerp(new THREE.Color("#f8d8a8"), progress * 0.6);
    return c;
  }, [progress]);

  return (
    <group>
      {/* Disco superior — nuvem densa */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial
          color={platformTint}
          emissive="#e0e0e8"
          emissiveIntensity={0.45}
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>
      {/* Anel exterior — borda mais densa de nuvem */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <ringGeometry args={[11.6, 12.0, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Vapor baixo difuso */}
      <NuvemHaze />
    </group>
  );
}

/** Planície de nuvens visível ABAIXO, em cota negativa — Adamá flutua. */
function NuvemFloorBelow() {
  const cloudsRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + (i % 5) * 0.2;
      const r = 14 + (i % 6) * 4.5;
      return {
        x: Math.cos(a) * r + ((i % 3) - 1) * 2,
        y: -6 - (i % 4) * 0.7,
        z: Math.sin(a) * r + ((i % 4) - 1.5) * 1.5,
        scale: 2.0 + (i % 5) * 0.8,
        phase: i * 0.7,
      };
    });
  }, []);

  useFrame((state) => {
    if (!cloudsRef.current) return;
    const t = state.clock.elapsedTime;
    cloudsRef.current.children.forEach((child, i) => {
      const c = clouds[i];
      if (!c) return;
      child.position.y = c.y + Math.sin(t * 0.18 + c.phase) * 0.15;
    });
  });

  return (
    <group ref={cloudsRef}>
      {clouds.map((c, i) => (
        <mesh
          key={i}
          position={[c.x, c.y, c.z]}
          scale={[c.scale, c.scale * 0.55, c.scale]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial
            color="#dfe5f0"
            transparent
            opacity={0.62}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Vapor difuso baixo sobre a plataforma. */
function NuvemHaze() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.16 + Math.sin(t * 0.4) * 0.04;
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.07, 0]}
    >
      <circleGeometry args={[11.4, 48]} />
      <meshBasicMaterial
        color="#f0f0ff"
        transparent
        opacity={0.16}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** A cidade barroca aérea — 6-8 edifícios pequenos que descem juntos. */
function CidadeBarrocaAerea({
  descentY,
  grounded,
}: {
  descentY: number;
  grounded: boolean;
}) {
  const buildings = useMemo(() => {
    // 7 edifícios em anel exterior + 1 maior atrás. Posições XZ fixas;
    // só o offset Y varia conforme descentY (a cidade inteira desce).
    return [
      { x: -6, z: -3, rotY: 0.4, h: 2.8, w: 1.4, d: 1.4, kind: 0 },
      { x: 6.5, z: -2.5, rotY: -0.5, h: 3.4, w: 1.5, d: 1.5, kind: 1 },
      { x: -3, z: 5.5, rotY: 1.0, h: 2.4, w: 1.2, d: 1.2, kind: 2 },
      { x: 4.5, z: 4.8, rotY: -0.9, h: 3.0, w: 1.3, d: 1.3, kind: 1 },
      { x: -7.5, z: 2.2, rotY: 0.7, h: 2.6, w: 1.3, d: 1.3, kind: 0 },
      { x: 7.8, z: 1.5, rotY: -0.3, h: 3.2, w: 1.4, d: 1.4, kind: 2 },
      { x: 0, z: -7, rotY: 0, h: 3.8, w: 1.8, d: 1.6, kind: 1 },
      { x: 0, z: 7.5, rotY: Math.PI, h: 3.2, w: 1.6, d: 1.6, kind: 0 },
    ] as const;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Quando não pousada, leve oscilação aérea — "respiração no céu"
    const drift = grounded ? 0 : Math.sin(t * 0.5) * 0.1;
    groupRef.current.position.y = descentY + drift;
  });

  const buildingColor = grounded ? "#c8b890" : "#a8a08c";
  const buildingEmissive = grounded ? "#604828" : "#3a3624";

  return (
    <group ref={groupRef}>
      {buildings.map((b, i) => (
        <group
          key={i}
          position={[b.x, b.h / 2, b.z]}
          rotation={[0, b.rotY, 0]}
        >
          {/* Corpo principal — cubo de pedra */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={buildingColor}
              emissive={buildingEmissive}
              emissiveIntensity={0.25}
              roughness={0.88}
              metalness={0.1}
            />
          </mesh>

          {/* Telhado pontudo (cone) */}
          <mesh position={[0, b.h / 2 + 0.32, 0]} castShadow>
            <coneGeometry args={[b.w * 0.78, 0.6, 6]} />
            <meshStandardMaterial
              color={grounded ? "#7a5638" : "#5a4434"}
              emissive="#2a1a10"
              emissiveIntensity={0.3}
              roughness={0.85}
              metalness={0.12}
            />
          </mesh>

          {/* Colunas decorativas — 4 nos cantos */}
          {([
            [-b.w / 2, 0, -b.d / 2],
            [b.w / 2, 0, -b.d / 2],
            [-b.w / 2, 0, b.d / 2],
            [b.w / 2, 0, b.d / 2],
          ] as Array<[number, number, number]>).map((p, j) => (
            <mesh key={j} position={p} castShadow>
              <cylinderGeometry args={[0.07, 0.07, b.h, 6]} />
              <meshStandardMaterial
                color={grounded ? "#d8c8a0" : "#b8b09c"}
                emissive="#3a3024"
                emissiveIntensity={0.28}
                roughness={0.7}
                metalness={0.25}
              />
            </mesh>
          ))}

          {/* Janelas — 2 pontos emissivos quentes (vida lá dentro) */}
          {b.kind !== 2 && (
            <mesh position={[0, 0, b.d / 2 + 0.001]}>
              <planeGeometry args={[0.18, 0.32]} />
              <meshBasicMaterial
                color="#ffd890"
                transparent
                opacity={grounded ? 0.85 : 0.55}
                toneMapped={false}
              />
            </mesh>
          )}
          {b.kind !== 0 && (
            <mesh position={[0, b.h * 0.18, b.d / 2 + 0.001]}>
              <planeGeometry args={[0.16, 0.22]} />
              <meshBasicMaterial
                color="#ffd890"
                transparent
                opacity={grounded ? 0.85 : 0.55}
                toneMapped={false}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/** Habitantes-silhueta que flutuam entre os edifícios. */
function HabitantesFlutuantes({
  descentProgress,
  grounded,
}: {
  descentProgress: number;
  grounded: boolean;
}) {
  // 12 silhuetas dispostas em anel — começam levitando, terminam pisando
  const figures = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + 0.15;
      const r = 4.5 + (i % 4) * 0.6;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rotY: a + Math.PI,
        phase: i * 0.6,
        // Altura "no ar" inicial — varia entre silhuetas (1.0–2.4m acima do chão)
        airY: 1.2 + (i % 4) * 0.35,
      };
    });
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const f = figures[i];
      if (!f) return;
      // Y interpola entre "no ar" e "no chão" conforme intercessão.
      // Pés-no-chão = 0; quando flutua, soma a oscilação respiratória.
      const groundedY = 0;
      const airY = f.airY + Math.sin(t * 0.6 + f.phase) * 0.12;
      const y = THREE.MathUtils.lerp(airY, groundedY, descentProgress);
      child.position.y = y;
    });
  });

  // Cor da silhueta — cinza-azulada (etérea) → âmbar (terra-na-pele)
  const silhouetteColor = grounded ? "#c89060" : "#7888a4";
  const silhouetteEmissive = grounded ? "#603018" : "#28344a";
  const auraColor = grounded ? "#ffb060" : "#a4b8d8";

  return (
    <group ref={groupRef}>
      {figures.map((f, i) => (
        <group
          key={i}
          position={[f.x, f.airY, f.z]}
          rotation={[0, f.rotY, 0]}
        >
          {/* Corpo — manto longo (cone invertido leve) */}
          <mesh>
            <coneGeometry args={[0.32, 1.4, 8]} />
            <meshStandardMaterial
              color={silhouetteColor}
              emissive={silhouetteEmissive}
              emissiveIntensity={0.4}
              roughness={0.85}
              metalness={0.12}
              transparent
              opacity={0.78}
            />
          </mesh>
          {/* Cabeça */}
          <mesh position={[0, 0.86, 0]}>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshStandardMaterial
              color={silhouetteColor}
              emissive={silhouetteEmissive}
              emissiveIntensity={0.35}
              roughness={0.8}
              metalness={0.1}
              transparent
              opacity={0.82}
            />
          </mesh>
          {/* Sombra-aura sutil — antes de pousar é fria; depois quente */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 12, 10]} />
            <meshBasicMaterial
              color={auraColor}
              transparent
              opacity={grounded ? 0.16 : 0.1 + descentProgress * 0.06}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
