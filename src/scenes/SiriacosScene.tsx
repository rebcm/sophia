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
import { EscribaSiriaco } from "../world/EscribaSiriaco";
import { Portal } from "../world/Portal";

/* =========================================================
   SiriacosScene — A Câmara da Memória Cósmica
   ---------------------------------------------------------
   Câmara escura ovalada, fog espesso azul-noturno. No centro,
   o Cristal-Memória: octaedro azul-cobalto grande girando
   lentamente, com glow forte (Bloom). 12 linhas-luz-eco
   emanam do cristal em direções aleatórias — cilindros finos
   que pulsam de opacidade ("ouvir todos os sons já feitos
   por todos os seres em todas as Eras").
   O Escriba Siríaco está sentado em frente ao cristal.
   200 estrelas distantes ao fundo.
   Ver docs/22-civilizacoes-expandidas.md §3.2
   ========================================================= */

const ESCRIBA_POS: [number, number, number] = [0, 0.4, 4.5];
const CRISTAL_POS: [number, number, number] = [0, 2.6, 0];
const RETURN_PORTAL_POS: [number, number, number] = [0, 0.4, 14];

interface SiriacosSceneProps {
  escribaAwakened: boolean;
  onReturnToMar?: () => void;
  onPlayerRef?: (ref: React.RefObject<THREE.Group | null>) => void;
}

export function SiriacosScene({
  escribaAwakened,
  onReturnToMar,
  onPlayerRef,
}: SiriacosSceneProps) {
  const playerRef = useRef<THREE.Group | null>(null);
  if (onPlayerRef) onPlayerRef(playerRef);

  const escribaTarget = useMemo(
    () => new THREE.Vector3(ESCRIBA_POS[0], 0, ESCRIBA_POS[2]),
    [],
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
      camera={{ fov: 60, near: 0.1, far: 800, position: [0, 4, 12] }}
    >
      {/* Câmara quase preta — só o cristal manda luz */}
      <color attach="background" args={["#02030c"]} />
      {/* Fog espesso azul-noturno — sentido de "câmara fechada profunda" */}
      <fog attach="fog" args={["#080a1c", 12, 60]} />

      {/* Ambiente: cobalto bem fraco — quase nada vem dos lados */}
      <ambientLight color="#0e1430" intensity={0.42} />

      {/* Luz central — emana do cristal */}
      <pointLight
        position={CRISTAL_POS}
        intensity={escribaAwakened ? 2.6 : 2.0}
        distance={22}
        color="#a8c8ff"
        decay={2}
      />

      <DistantStars />
      <ChamberFloor />
      <CrystalMemory escribaAwakened={escribaAwakened} />
      <EcoLines />

      {/* Escriba Siríaco — em frente ao cristal */}
      <EscribaSiriaco
        position={ESCRIBA_POS}
        awakened={escribaAwakened}
        playerRef={playerRef}
      />

      {/* Player */}
      <Player
        externalRef={playerRef}
        awakenTarget={escribaTarget}
        awakenDistance={3.2}
      />

      {/* Sussurrante */}
      <Whisperer playerRef={playerRef} />

      {/* Portal de retorno ao Mar de Cristal */}
      {onReturnToMar && (
        <Portal
          position={RETURN_PORTAL_POS}
          label="Mar de Cristal"
          subLabel={
            escribaAwakened
              ? "(eu te lembrei o tempo todo)"
              : "(voltar)"
          }
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
        <Bloom intensity={1.5} luminanceThreshold={0.2} mipmapBlur />
        <Vignette eskil={false} darkness={0.92} offset={0.2} />
      </EffectComposer>
    </Canvas>
  );
}

/* ---------------- Componentes de Mundo ---------------- */

/** Chão da câmara — disco escuro com leve reflexo cobalto */
function ChamberFloor() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.02, 0]}
      >
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial
          color="#08091a"
          emissive="#0a1230"
          emissiveIntensity={0.16}
          roughness={0.55}
          metalness={0.45}
        />
      </mesh>
      {/* Anel concêntrico sutil em torno do cristal — marca a "câmara" */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.0, 0]}
      >
        <ringGeometry args={[7.5, 8.2, 64]} />
        <meshStandardMaterial
          color="#3a5cb0"
          emissive="#1a2c70"
          emissiveIntensity={0.32}
          roughness={0.5}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Cristal-Memória — octaedro grande girando, glow forte */
function CrystalMemory({ escribaAwakened }: { escribaAwakened: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const facetRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      // Giro lento sobre Y, leve oscilação em X — "respira"
      coreRef.current.rotation.y = t * 0.18;
      coreRef.current.rotation.x = Math.sin(t * 0.22) * 0.12;
      const m = coreRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        (escribaAwakened ? 1.4 : 1.0) + Math.sin(t * 0.55) * 0.18;
    }
    if (facetRef.current) {
      facetRef.current.rotation.y = -t * 0.12;
      facetRef.current.rotation.z = Math.sin(t * 0.18) * 0.08;
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.22 + Math.sin(t * 0.45) * 0.07;
      haloRef.current.scale.setScalar(1 + Math.sin(t * 0.35) * 0.05);
    }
  });

  return (
    <group position={CRISTAL_POS}>
      {/* Octaedro principal — raio ~2m */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[2.0, 0]} />
        <meshStandardMaterial
          color="#3a5cd8"
          emissive="#5078ff"
          emissiveIntensity={1.0}
          roughness={0.22}
          metalness={0.7}
          transparent
          opacity={0.92}
          flatShading
        />
      </mesh>
      {/* Octaedro interno menor — gira em sentido contrário (camada interna) */}
      <mesh ref={facetRef}>
        <octahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial
          color="#a8c0ff"
          emissive="#78b0ff"
          emissiveIntensity={1.3}
          roughness={0.2}
          metalness={0.85}
          flatShading
          transparent
          opacity={0.78}
        />
      </mesh>
      {/* Núcleo: ponto branco-azul puro */}
      <mesh>
        <sphereGeometry args={[0.34, 18, 14]} />
        <meshBasicMaterial color="#e0eaff" toneMapped={false} />
      </mesh>
      {/* Halo translúcido cobalto envolvendo o cristal */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[2.9, 24, 18]} />
        <meshBasicMaterial
          color="#5078d8"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      {/* Halo externo — bem suave */}
      <mesh>
        <sphereGeometry args={[4.2, 18, 14]} />
        <meshBasicMaterial
          color="#3858a8"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** 12 linhas-luz-eco — cilindros finos emanando do cristal em direções
    aleatórias estáveis. Cada cilindro pulsa de opacidade — "ouvir todos
    os sons já feitos por todos os seres em todas as Eras". */
function EcoLines() {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const out: {
      dir: THREE.Vector3;
      len: number;
      speed: number;
      phase: number;
      tilt: THREE.Euler;
      offset: THREE.Vector3;
    }[] = [];
    const COUNT = 12;
    for (let i = 0; i < COUNT; i++) {
      // Direção aleatória esférica, mas com viés para o plano (mais horizontal)
      const theta = (i / COUNT) * Math.PI * 2 + Math.random() * 0.4;
      // phi em [PI/3, 2*PI/3] → mais perto do equador (não puramente vertical)
      const phi = Math.PI / 3 + Math.random() * (Math.PI / 3);
      const dir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi) * 0.7,
        Math.sin(phi) * Math.sin(theta),
      ).normalize();
      const len = 9 + Math.random() * 6; // 9..15m
      // Calcular rotação que alinha um cilindro (Y-up) à direção `dir`
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      const euler = new THREE.Euler().setFromQuaternion(quat);
      const offset = dir.clone().multiplyScalar(len / 2);
      out.push({
        dir,
        len,
        speed: 0.7 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        tilt: euler,
        offset,
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const l = lines[i];
      if (!l) return;
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      // Pulso individual: opacidade entre ~0.05 e ~0.45 (eco que aparece e some)
      m.opacity = 0.06 + Math.max(0, Math.sin(t * l.speed + l.phase)) * 0.42;
    });
  });

  return (
    <group ref={groupRef} position={CRISTAL_POS}>
      {lines.map((l, i) => (
        <mesh
          key={`eco-${i}`}
          position={l.offset.toArray()}
          rotation={l.tilt}
        >
          <cylinderGeometry args={[0.06, 0.025, l.len, 8, 1, true]} />
          <meshBasicMaterial
            color="#a8c4ff"
            transparent
            opacity={0.2}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 200 estrelas distantes — câmara isolada no espaço-profundo */
function DistantStars() {
  const positions = useMemo(() => {
    return Array.from({ length: 200 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const R = 100 + Math.random() * 60;
      return {
        x: R * Math.sin(phi) * Math.cos(theta),
        y: R * Math.cos(phi) * 0.6 + 4,
        z: R * Math.sin(phi) * Math.sin(theta),
        size: 0.1 + Math.random() * 0.32,
      };
    });
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={`star-${i}`} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color="#dce8ff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
