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
import { Portal } from "../world/Portal";

/* =========================================================
   FeiraDosSistemasScene — 5 distritos arquetípicos modernos
   ---------------------------------------------------------
   Cidade-arquetipo da Era da Informação. Cinco edifícios
   diferentes em torno de uma praça central. Cada um
   representa uma forma de drenagem institucional. Player
   pode andar entre eles.

   - Catedral-Trono (Asmodeus)
   - Escola-Espelho (Lúcifer)
   - Templo-Mercado (Belial)
   - Tribunal-Livro (Azazel)
   - Torre-Algoritmo (Semyaza)

   Ver docs/03f-mapa-do-reino-humano.md
   A 6ª torre "Casa-Espelhada" já existe como cena separada (Sprint 11).
   ========================================================= */

const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface FeiraSceneProps {
  onReturnToMar?: () => void;
}

export function FeiraDosSistemasScene({ onReturnToMar }: FeiraSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);

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
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 5, 16] }}
    >
      <color attach="background" args={["#1a1c28"]} />
      <fog attach="fog" args={["#2a2e3c", 16, 75]} />

      <ambientLight color="#8090a8" intensity={0.65} />
      <directionalLight
        position={[14, 18, 8]}
        intensity={0.7}
        color="#dde2ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <CityPlaza />
      <NeonHaze />
      <BillboardScreens />

      {/* 5 edifícios em pentágono ao redor da praça */}
      <CatedralTrono position={[-10, 0, -8]} />
      <EscolaEspelho position={[10, 0, -8]} />
      <TemploMercado position={[12, 0, 6]} />
      <TribunalLivro position={[-12, 0, 6]} />
      <TorreAlgoritmo position={[0, 0, -14]} />

      <Player externalRef={playerRef} />
      <Whisperer playerRef={playerRef} />

      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel="(sair desta cidade)"
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
        <Bloom intensity={0.7} luminanceThreshold={0.55} mipmapBlur />
        <Vignette eskil={false} darkness={0.55} offset={0.35} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Praça central + atmosfera urbana ---------------- */

function CityPlaza() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[0, -0.02, 0]}
    >
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial
        color="#1a1c24"
        emissive="#3a3e4c"
        emissiveIntensity={0.12}
        roughness={0.65}
        metalness={0.35}
      />
    </mesh>
  );
}

function NeonHaze() {
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 80;
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 50,
        y: 1.5 + Math.random() * 12,
        z: (Math.random() - 0.5) * 50,
        phase: Math.random() * Math.PI * 2,
        color: ["#d878a8", "#88c0e8", "#d8c870"][Math.floor(Math.random() * 3)],
      })),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.4 + Math.sin(t * 0.5 + d.phase) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial
            color={d.color}
            transparent
            opacity={0.5}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Telas-anúncio flutuantes no ar — sugerindo a Praça-Tela */
function BillboardScreens() {
  return (
    <group>
      {[-22, 0, 22].map((x, i) => (
        <mesh key={i} position={[x, 9, -18]}>
          <planeGeometry args={[5, 3]} />
          <meshBasicMaterial
            color={["#d878a8", "#88c0e8", "#a8d870"][i]}
            transparent
            opacity={0.6}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Edifícios (cada um arquetípico) ---------------- */

function CatedralTrono({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Base larga */}
      <mesh castShadow receiveShadow position={[0, 3, 0]}>
        <boxGeometry args={[6, 6, 6]} />
        <meshStandardMaterial
          color="#8a6a48"
          emissive="#3a2818"
          emissiveIntensity={0.15}
          roughness={0.75}
        />
      </mesh>
      {/* Torre alta */}
      <mesh castShadow position={[0, 9, 0]}>
        <boxGeometry args={[3, 6, 3]} />
        <meshStandardMaterial color="#7a5a38" roughness={0.7} />
      </mesh>
      {/* Cruz no topo */}
      <mesh position={[0, 13.5, 0]}>
        <boxGeometry args={[0.4, 2, 0.4]} />
        <meshStandardMaterial
          color="#ffd45a"
          emissive="#ffd45a"
          emissiveIntensity={0.7}
          metalness={1.0}
        />
      </mesh>
      <mesh position={[0, 13, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.4]} />
        <meshStandardMaterial
          color="#ffd45a"
          emissive="#ffd45a"
          emissiveIntensity={0.7}
          metalness={1.0}
        />
      </mesh>
      <BuildingLabel text="Catedral-Trono" y={15.5} />
    </group>
  );
}

function EscolaEspelho({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
        <boxGeometry args={[7, 5, 5]} />
        <meshStandardMaterial
          color="#a8b8c8"
          emissive="#88a0c0"
          emissiveIntensity={0.2}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>
      {/* Janelas-espelho */}
      {[-2, 0, 2].map((dx) => (
        <mesh key={dx} position={[dx, 3, 2.55]}>
          <planeGeometry args={[1.4, 2.2]} />
          <meshStandardMaterial
            color="#dde2ea"
            emissive="#dde2ea"
            emissiveIntensity={0.5}
            metalness={1.0}
            roughness={0.05}
          />
        </mesh>
      ))}
      <BuildingLabel text="Escola-Espelho" y={6.5} />
    </group>
  );
}

function TemploMercado({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base achatada */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[8, 3, 6]} />
        <meshStandardMaterial
          color="#5a8a4a"
          emissive="#1a3a18"
          emissiveIntensity={0.15}
          roughness={0.65}
        />
      </mesh>
      {/* Cúpula dourada */}
      <mesh castShadow position={[0, 4.5, 0]}>
        <sphereGeometry args={[2.2, 16, 12]} />
        <meshStandardMaterial
          color="#a8c870"
          emissive="#ffd45a"
          emissiveIntensity={0.4}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Letreiro $ */}
      <mesh position={[0, 7.5, 0]}>
        <torusGeometry args={[0.5, 0.12, 8, 16]} />
        <meshStandardMaterial
          color="#ffe9a0"
          emissive="#ffd45a"
          emissiveIntensity={0.85}
          metalness={1.0}
        />
      </mesh>
      <BuildingLabel text="Templo-Mercado" y={9} />
    </group>
  );
}

function TribunalLivro({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 2, 0]}>
        <boxGeometry args={[7, 4, 5]} />
        <meshStandardMaterial
          color="#3a3038"
          emissive="#5a382a"
          emissiveIntensity={0.18}
          roughness={0.75}
        />
      </mesh>
      {/* Colunas frontais */}
      {[-2.6, -0.85, 0.85, 2.6].map((dx) => (
        <mesh key={dx} castShadow position={[dx, 2, 2.7]}>
          <cylinderGeometry args={[0.25, 0.25, 4, 12]} />
          <meshStandardMaterial
            color="#dddae0"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
      ))}
      {/* Livro vermelho no telhado */}
      <mesh position={[0, 4.8, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[2.2, 0.4, 1.4]} />
        <meshStandardMaterial
          color="#a83040"
          emissive="#601820"
          emissiveIntensity={0.4}
        />
      </mesh>
      <BuildingLabel text="Tribunal-Livro" y={6.5} />
    </group>
  );
}

function TorreAlgoritmo({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Pilha de cubos finos verticais */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} castShadow position={[0, 1 + i * 1.7, 0]}>
          <boxGeometry args={[2.2 - i * 0.18, 1.5, 2.2 - i * 0.18]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#2a3848" : "#3a4858"}
            emissive="#5a78c8"
            emissiveIntensity={0.18}
            roughness={0.55}
            metalness={0.55}
          />
        </mesh>
      ))}
      {/* Pulso de algoritmo no topo */}
      <mesh position={[0, 13, 0]}>
        <sphereGeometry args={[0.4, 14, 12]} />
        <meshStandardMaterial
          color="#88c8ff"
          emissive="#88c8ff"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <BuildingLabel text="Torre-Algoritmo" y={14.5} />
    </group>
  );
}

/** Rótulo etéreo flutuando sobre o edifício */
function BuildingLabel({ text, y }: { text: string; y: number }) {
  // Texto via plane — sem typography 3D para manter o bundle leve
  return (
    <mesh position={[0, y, 0]}>
      <planeGeometry args={[Math.max(text.length * 0.35, 3.5), 0.7]} />
      <meshBasicMaterial
        color="#1a1830"
        transparent
        opacity={0.7}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
