import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   PleromaSky
   ---------------------------------------------------------
   Skydome interno com gradiente vivo. Estrelas que respiram
   lentamente. Não é "céu noturno realista" — é o céu do
   Jardim dos Ecos: violeta-profundo com lilás distante.
   ========================================================= */

const SKY_VERT = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SKY_FRAG = /* glsl */ `
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform vec3 uTopColor;
  uniform vec3 uMidColor;
  uniform vec3 uHorizonColor;

  void main() {
    vec3 dir = normalize(vWorldPos);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    // mistura tripla
    vec3 col = mix(uHorizonColor, uMidColor, smoothstep(0.0, 0.5, h));
    col = mix(col, uTopColor, smoothstep(0.5, 1.0, h));

    // breath: pequena pulsação
    float breath = 0.95 + 0.05 * sin(uTime * 0.3);
    col *= breath;

    // suave aurora
    float aurora = 0.5 + 0.5 * sin(uTime * 0.2 + dir.x * 4.0 + dir.z * 2.0);
    aurora *= smoothstep(0.3, 0.9, h) * 0.08;
    col += vec3(0.4, 0.2, 0.7) * aurora;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function PleromaSky() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTopColor: { value: new THREE.Color("#0a0420") }, // night
      uMidColor: { value: new THREE.Color("#2b1b4a") }, // violet deep
      uHorizonColor: { value: new THREE.Color("#5c3a80") }, // dawn lilac
    }),
    [],
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      (matRef.current.uniforms.uTime.value as number) += delta;
    }
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      {/* invertendo escala para olhar para o lado interno */}
      <sphereGeometry args={[300, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   Stars — pontos estelares que pulsam levemente
   ========================================================= */

const STARS_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.6 + aPhase * 6.28);
    vAlpha = mix(0.4, 1.0, pulse);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const STARS_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    // halo sutil
    a += smoothstep(0.5, 0.2, d) * 0.2 * vAlpha;
    gl_FragColor = vec4(vec3(1.0, 0.95, 0.85), a);
  }
`;

export function Stars({ count = 400 }: { count?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // posicionar nas hemisférica superior
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9 + 0.05);
      const r = 200 + Math.random() * 30;
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.6 + Math.random() * 2.4;
      phases[i] = Math.random();
    }
    return { positions, sizes, phases };
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (matRef.current) {
      (matRef.current.uniforms.uTime.value as number) += delta;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={STARS_VERT}
        fragmentShader={STARS_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
