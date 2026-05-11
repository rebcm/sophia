import { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

import { Player } from "../world/Player";
import { Whisperer } from "../world/Whisperer";
import { AnjoCaidoShrine, type CaidoId } from "../world/AnjoCaidoShrine";
import { Portal } from "../world/Portal";

/* =========================================================
   TabernaculoDosCaidosScene — Sprint 23
   ---------------------------------------------------------
   Câmara hexagonal subterrânea. Seis altares dispostos em
   círculo, um para cada Anjo Caído. O jogador caminha entre
   eles. Ao se aproximar e pressionar F: cinemática-redenção
   correspondente é disparada.
   ========================================================= */

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 10];

export const CAIDOS_ORDER: CaidoId[] = [
  "asmodeus",
  "lucifer",
  "belial",
  "azazel",
  "semyaza",
  "leviata",
];

export const SHRINE_POSITIONS: Record<CaidoId, [number, number, number]> =
  CAIDOS_ORDER.reduce(
    (acc, id, i) => {
      const a = (i / CAIDOS_ORDER.length) * Math.PI * 2 + Math.PI / 6;
      const r = 6.5;
      acc[id] = [Math.cos(a) * r, 0, Math.sin(a) * r];
      return acc;
    },
    {} as Record<CaidoId, [number, number, number]>,
  );

interface TabernaculoSceneProps {
  redeemed: Record<CaidoId, boolean>;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function TabernaculoDosCaidosScene({
  redeemed,
  onReturnToMar,
  onPlayerRef,
}: TabernaculoSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const allRedeemed = useMemo(
    () => CAIDOS_ORDER.every((id) => redeemed[id]),
    [redeemed],
  );

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
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 5, 14] }}
    >
      <color attach="background" args={["#0a0814"]} />
      <fog attach="fog" args={["#1a0e22", 14, 60]} />

      <ambientLight color="#5a4878" intensity={0.5} />
      <pointLight
        position={[0, 8, 0]}
        intensity={allRedeemed ? 1.8 : 0.8}
        distance={20}
        color={allRedeemed ? "#ffe9a0" : "#a878d8"}
        decay={2}
      />

      <Floor />
      <CentralAltar allRedeemed={allRedeemed} />
      <HexagonalCeiling />

      {CAIDOS_ORDER.map((id) => (
        <AnjoCaidoShrine
          key={id}
          id={id}
          position={SHRINE_POSITIONS[id]}
          redeemed={redeemed[id]}
        />
      ))}

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={allRedeemed ? "(os seis lembraram)" : "(voltar)"}
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
        <Bloom intensity={0.8} luminanceThreshold={0.4} mipmapBlur />
        <Vignette eskil={false} darkness={0.7} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}

function Floor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <circleGeometry args={[14, 6]} />
      <meshStandardMaterial
        color="#181020"
        emissive="#2a1838"
        emissiveIntensity={0.15}
        roughness={0.6}
        metalness={0.25}
      />
    </mesh>
  );
}

/** Altar central — pequeno disco brilhante. Quando todos os 6
 *  forem redimidos, irradia luz dourada. */
function CentralAltar({ allRedeemed }: { allRedeemed: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 32]} />
        <meshBasicMaterial
          color={allRedeemed ? "#ffd45a" : "#5a3aa0"}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={allRedeemed ? "#fff5d8" : "#a878d8"}
          emissive={allRedeemed ? "#fff5d8" : "#a878d8"}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Teto hexagonal sugerido — 6 vigas escuras irradiando do centro. */
function HexagonalCeiling() {
  return (
    <group position={[0, 9, 0]}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 7;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * (r / 2), 0, Math.sin(a) * (r / 2)]}
            rotation={[0, -a + Math.PI / 2, 0]}
          >
            <boxGeometry args={[r, 0.15, 0.25]} />
            <meshStandardMaterial
              color="#1a0e28"
              emissive="#5a3aa0"
              emissiveIntensity={0.18}
              roughness={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}
