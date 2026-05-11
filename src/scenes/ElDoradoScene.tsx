import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { Yobel } from "../world/Yobel";
import { Portal } from "../world/Portal";
import { Filament } from "../world/Filament";

/* =========================================================
   ElDoradoScene — 2ª Civilização Perdida
   ---------------------------------------------------------
   Ruínas de uma cidade dourada. Templo-pirâmide ao fundo,
   degraus de pedra, lago raso onde a luz reflete. No centro
   do pátio, Yobel adormecido no seu trono de ouro.
   Atmosfera: crepúsculo dourado, ar quente, paz tensa.
   Ver docs/02d-civilizacoes-perdidas.md §4
   ========================================================= */

const YOBEL_POS: [number, number, number] = [0, 0, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 12];

interface ElDoradoSceneProps {
  yobelAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function ElDoradoScene({
  yobelAwakened,
  onReturnToMar,
  onPlayerRef,
}: ElDoradoSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const yobelTarget = useMemo(() => new THREE.Vector3(...YOBEL_POS), []);

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
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 4, 14] }}
    >
      {/* Céu crepuscular dourado */}
      <color attach="background" args={["#2a1c10"]} />
      <fog attach="fog" args={["#3a2818", 18, 80]} />

      <ambientLight color="#a07040" intensity={0.55} />

      {/* Sol baixo no horizonte */}
      <directionalLight
        position={[18, 6, 12]}
        intensity={1.2}
        color="#ffd07a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Luz central que muda quando Yobel desperta */}
      <pointLight
        position={[0, 6, 0]}
        intensity={yobelAwakened ? 0.6 : 1.5}
        distance={28}
        color={yobelAwakened ? "#ffe0b0" : "#ffd45a"}
        decay={2}
      />

      <GroundPlaza />
      <PyramidTemple />
      <GoldDustParticles awakened={yobelAwakened} />
      <SleeperBearers awakened={yobelAwakened} />

      <Yobel position={YOBEL_POS} awakened={yobelAwakened} />

      {/* Filamento principal do Yobel + filamentos dos 8 portadores */}
      <Filament
        base={[YOBEL_POS[0], 3.0, YOBEL_POS[2]]}
        tint="dourado"
        height={16}
        ruptured={yobelAwakened}
      />
      <BearerFilaments awakened={yobelAwakened} />

      <Player
        externalRef={playerRef}
        awakenTarget={yobelTarget}
        awakenDistance={3.5}
      />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={yobelAwakened ? "(o sol respira)" : "(voltar)"}
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
        <Bloom intensity={0.75} luminanceThreshold={0.5} mipmapBlur />
        <Vignette eskil={false} darkness={0.55} offset={0.35} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Sub-componentes ---------------- */

function GroundPlaza() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <planeGeometry args={[200, 200, 1, 1]} />
      <meshStandardMaterial
        color="#5a4028"
        emissive="#3a2818"
        emissiveIntensity={0.15}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Pirâmide-templo escalonada ao fundo */
function PyramidTemple() {
  return (
    <group position={[0, 0, -22]}>
      {[0, 1, 2, 3].map((i) => {
        const w = 14 - i * 3;
        const h = 1.8;
        return (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[0, 0.9 + i * h, 0]}
          >
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial
              color="#7a5a38"
              emissive="#3a2818"
              emissiveIntensity={0.1}
              roughness={0.75}
              metalness={0.15}
            />
          </mesh>
        );
      })}
      {/* Pináculo dourado */}
      <mesh position={[0, 9, 0]} castShadow>
        <coneGeometry args={[1.0, 2.2, 8]} />
        <meshStandardMaterial
          color="#ffd45a"
          emissive="#c88a18"
          emissiveIntensity={0.5}
          metalness={0.95}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

/** Poeira dourada flutuante — densa enquanto dorme, dissipa ao despertar */
function GoldDustParticles({ awakened }: { awakened: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 60;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: 0.5 + Math.random() * 5,
      z: (Math.random() - 0.5) * 40,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.4,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      child.position.y = d.y + Math.sin(t * d.speed + d.phase) * 0.4;
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = awakened ? Math.max(0, m.opacity - 0.003) : 0.7;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial
            color="#ffd45a"
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Sleepers de joelhos carregando barras invisíveis — quando Yobel
 *  desperta, eles soltam o ouro e olham uns para os outros. */
function SleeperBearers({ awakened }: { awakened: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 8;
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const a = (i / COUNT) * Math.PI * 2;
      const r = 5.5;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        rotY: -a + Math.PI / 2,
      };
    });
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      const targetX = awakened ? 0 : 0.3; // ergue ao despertar
      child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, targetX, 0.03);
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <group key={i} position={[d.x, 0, d.z]} rotation={[0.3, d.rotY, 0]}>
          {/* Torso curvado */}
          <mesh castShadow position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.22, 0.3, 1.2, 10]} />
            <meshStandardMaterial
              color={awakened ? "#a08070" : "#4a3828"}
              emissive={awakened ? "#1a1008" : "#0a0604"}
              emissiveIntensity={0.15}
              roughness={0.85}
            />
          </mesh>
          {/* Cabeça */}
          <mesh castShadow position={[0, 1.55, 0]}>
            <sphereGeometry args={[0.22, 14, 12]} />
            <meshStandardMaterial
              color={awakened ? "#b08868" : "#3a2818"}
              roughness={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Filamentos finos saindo dos 8 Sleepers-portadores ao redor de Yobel.
 *  Rompem-se juntos quando o Inca-Solitário se lembra. */
function BearerFilaments({ awakened }: { awakened: boolean }) {
  const positions: [number, number, number][] = Array.from(
    { length: 8 },
    (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const r = 5.5;
      return [Math.cos(a) * r, 1.6, Math.sin(a) * r];
    },
  );
  return (
    <>
      {positions.map((p, i) => (
        <Filament
          key={i}
          base={p}
          tint="dourado"
          height={10}
          ruptured={awakened}
        />
      ))}
    </>
  );
}
