import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   PovoBabelico — grupo de 3-4 silhuetas humanoides em pé
   conversando, com glifos flutuantes circulando acima.
   ---------------------------------------------------------
   Habitantes da Cidade da Palavra Fragmentada (Gn 11:1-9).
   Falam línguas que não se entendem. Os "glifos" são planos
   emissivos coloridos que flutuam em órbita acima do grupo
   — visualização da fala incompreensível.

   Quando `bridgeLit` vira true (uma tradução foi completa com
   este povo), os glifos diminuem a opacidade e uma aura
   quente nasce — o povo ouviu e foi ouvido.
   ========================================================= */

interface PovoBabelicoProps {
  position: [number, number, number];
  /** Cor da tribo — para diferenciação visual dos 4 povos. */
  tribeColor: string;
  /** True quando este povo está conectado a outro via tradução. */
  bridgeLit: boolean;
}

const FIGURE_COUNT = 4;

export function PovoBabelico({
  position,
  tribeColor,
  bridgeLit,
}: PovoBabelicoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glyphsRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  // Posições das 4 silhuetas em pequeno círculo (conversa de pé)
  const figures = useMemo(() => {
    return Array.from({ length: FIGURE_COUNT }, (_, i) => {
      const a = (i / FIGURE_COUNT) * Math.PI * 2;
      const r = 0.85;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        // Cada silhueta olha para o centro da roda
        rotY: a + Math.PI,
        // Pequena variação de altura — gente real não é igual
        h: 1.9 + (i % 3) * 0.18,
        seed: i,
      };
    });
  }, []);

  // 3 glifos flutuantes — caracteres "impronunciáveis"
  const glyphs = useMemo(() => {
    const symbols = ["§", "Ϟ", "Ѫ"];
    return symbols.map((sym, i) => {
      const a = (i / 3) * Math.PI * 2;
      return {
        baseAngle: a,
        radius: 1.6,
        height: 2.6 + i * 0.18,
        symbol: sym,
        speed: 0.4 + i * 0.12,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Glifos orbitam acima do grupo
    if (glyphsRef.current) {
      glyphsRef.current.children.forEach((child, i) => {
        const g = glyphs[i];
        if (!g) return;
        const angle = g.baseAngle + t * g.speed;
        child.position.x = Math.cos(angle) * g.radius;
        child.position.z = Math.sin(angle) * g.radius;
        child.position.y = g.height + Math.sin(t * 0.8 + i) * 0.12;
        // Sempre olha para a câmera-ish (apenas eixo Y)
        child.rotation.y = -angle + Math.PI / 2;

        // Quando bridge acesa, glifos desbotam (a confusão cede)
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const target = bridgeLit ? 0.18 : 0.78;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.05);
      });
    }

    // Aura quente quando o povo é conectado
    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        bridgeLit ? 0.32 + Math.sin(t * 0.8) * 0.06 : 0,
        0.06,
      );
      const scale =
        1 + (bridgeLit ? 0.25 + Math.sin(t * 0.8) * 0.05 : 0);
      auraRef.current.scale.setScalar(scale);
    }

    // Pequena oscilação corporal — gente conversando
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (i >= FIGURE_COUNT) return;
        const phase = i * 0.7;
        child.position.y = Math.sin(t * 0.6 + phase) * 0.04;
        child.rotation.y =
          (figures[i]?.rotY ?? 0) + Math.sin(t * 0.4 + phase) * 0.08;
      });
    }
  });

  // Quando libertado, silhuetas ganham um leve emissivo da cor da tribo
  const skin = bridgeLit ? "#d8b890" : "#3a322a";
  const skinEmissive = bridgeLit ? tribeColor : "#0a0806";
  const skinEmissiveIntensity = bridgeLit ? 0.5 : 0.15;
  const clothColor = bridgeLit ? tribeColor : darken(tribeColor, 0.55);

  return (
    <group position={position}>
      {/* Aura quente abaixo (visível só quando bridgeLit) */}
      <mesh ref={auraRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[2.4, 18, 14]} />
        <meshBasicMaterial
          color={tribeColor}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Luz pontual quando conectado */}
      {bridgeLit && (
        <pointLight
          position={[0, 2.2, 0]}
          intensity={1.0}
          distance={7}
          color={tribeColor}
          decay={2}
        />
      )}

      {/* Grupo das figuras (referenciado para oscilação) */}
      <group ref={groupRef}>
        {figures.map((f, i) => (
          <Figura
            key={i}
            x={f.x}
            z={f.z}
            h={f.h}
            rotY={f.rotY}
            skin={skin}
            skinEmissive={skinEmissive}
            skinEmissiveIntensity={skinEmissiveIntensity}
            clothColor={clothColor}
            seed={f.seed}
          />
        ))}
      </group>

      {/* Glifos flutuantes — fala incompreensível */}
      <group ref={glyphsRef}>
        {glyphs.map((g, i) => (
          <GlyphPlane key={i} color={tribeColor} symbol={g.symbol} />
        ))}
      </group>
    </group>
  );
}

/* ---------------- Figura humanoide ---------------- */

interface FiguraProps {
  x: number;
  z: number;
  h: number;
  rotY: number;
  skin: string;
  skinEmissive: string;
  skinEmissiveIntensity: number;
  clothColor: string;
  seed: number;
}

function Figura({
  x,
  z,
  h,
  rotY,
  skin,
  skinEmissive,
  skinEmissiveIntensity,
  clothColor,
  seed,
}: FiguraProps) {
  const headRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!headRef.current) return;
    const t = state.clock.elapsedTime;
    // Cabeças balançam de leve enquanto "falam"
    headRef.current.rotation.x = Math.sin(t * 1.2 + seed) * 0.08;
    headRef.current.rotation.y = Math.sin(t * 0.9 + seed * 0.7) * 0.12;
  });

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Manto (cone invertido) — cor da tribo */}
      <mesh castShadow position={[0, h * 0.4, 0]}>
        <coneGeometry args={[0.35, h * 0.85, 10]} />
        <meshStandardMaterial
          color={clothColor}
          emissive={darken(clothColor, 0.35)}
          emissiveIntensity={0.22}
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>
      {/* Cabeça */}
      <mesh ref={headRef} castShadow position={[0, h * 0.88, 0]}>
        <sphereGeometry args={[0.2, 14, 12]} />
        <meshStandardMaterial
          color={skin}
          emissive={skinEmissive}
          emissiveIntensity={skinEmissiveIntensity}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      {/* Braços levantados (gesto de quem fala) */}
      <mesh
        position={[-0.24, h * 0.55, 0.06]}
        rotation={[0.2, 0, 0.7]}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial
          color={clothColor}
          emissive={darken(clothColor, 0.5)}
          emissiveIntensity={0.18}
          roughness={0.85}
        />
      </mesh>
      <mesh
        position={[0.24, h * 0.55, 0.06]}
        rotation={[0.2, 0, -0.7]}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial
          color={clothColor}
          emissive={darken(clothColor, 0.5)}
          emissiveIntensity={0.18}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
}

/* ---------------- Glyph (plano emissivo com símbolo) ---------------- */

function GlyphPlane({ color, symbol }: { color: string; symbol: string }) {
  // Em vez de um Text drei (que carrega fontes), usamos um plano
  // com CanvasTexture do símbolo — leve e contornado.
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 88px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, 64, 70);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [symbol]);

  return (
    <mesh>
      <planeGeometry args={[0.34, 0.34]} />
      <meshBasicMaterial
        color={color}
        map={texture}
        transparent
        opacity={0.78}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ---------------- helpers ---------------- */

/** Escurece um hex `#rrggbb` por um fator (0..1). */
function darken(hex: string, factor: number): string {
  const c = new THREE.Color(hex);
  c.r *= 1 - factor;
  c.g *= 1 - factor;
  c.b *= 1 - factor;
  return `#${c.getHexString()}`;
}
