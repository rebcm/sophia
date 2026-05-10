import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================
   Garden — chão + grama prateada estilizada do Jardim
   dos Ecos. Ondulação suave, brilho na ponta, fog que se
   funde com a Pleroma Sky.
   ========================================================= */

/* ---------- Chão (plano com shader gradiente + ondulação) ---------- */

const GROUND_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vRise;

  void main() {
    vUv = uv;
    vec3 p = position;

    // ondulação muito sutil
    float wave = sin(p.x * 0.05 + uTime * 0.3) * 0.6
               + cos(p.y * 0.07 + uTime * 0.25) * 0.4;
    p.z += wave;
    vRise = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const GROUND_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uPlayerPos;
  varying vec2 vUv;
  varying float vRise;

  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;

    // base: violeta-prateado
    vec3 base = mix(vec3(0.10, 0.07, 0.18), vec3(0.45, 0.42, 0.55), smoothstep(0.0, 1.0, vRise * 0.5 + 0.5));

    // veias de luz fraca
    float vein = abs(sin(vUv.x * 90.0 + uTime * 0.2)) * abs(sin(vUv.y * 90.0 - uTime * 0.13));
    vein = smoothstep(0.92, 1.0, vein);
    base += vec3(0.7, 0.65, 0.9) * vein * 0.25;

    // vinheta suave do horizonte
    float horizon = smoothstep(0.6, 1.0, r);
    base = mix(base, vec3(0.04, 0.02, 0.10), horizon);

    gl_FragColor = vec4(base, 1.0);
  }
`;

export function Ground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPlayerPos: { value: new THREE.Vector3(0, 0, 0) },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      (matRef.current.uniforms.uTime.value as number) += delta;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 60, 60]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={GROUND_VERT}
        fragmentShader={GROUND_FRAG}
      />
    </mesh>
  );
}

/* ---------- Grama de cristal (instâncias de planos) ---------- */

const GRASS_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vTip;

  void main() {
    vUv = uv;
    // a grama é um plano vertical, dobramos a ponta com vento
    vec3 p = position;
    float wind = sin(uTime * 1.2 + instanceMatrix[3].x * 0.5 + instanceMatrix[3].z * 0.3) * 0.15;
    p.x += wind * uv.y;
    vTip = uv.y;

    vec4 worldP = instanceMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * worldP;
  }
`;

const GRASS_FRAG = /* glsl */ `
  varying vec2 vUv;
  varying float vTip;
  void main() {
    // gradiente verde-prata na base → cyan-branco na ponta
    vec3 base = vec3(0.45, 0.55, 0.55);
    vec3 tip = vec3(0.85, 0.95, 1.0);
    vec3 col = mix(base, tip, vTip);
    // alpha fade lateral pra parecer folha fina
    float a = 1.0 - smoothstep(0.45, 0.5, abs(vUv.x - 0.5));
    a *= mix(0.4, 1.0, vTip);
    gl_FragColor = vec4(col, a);
  }
`;

export function CrystalGrass({ count = 1500, radius = 60 }: { count?: number; radius?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    const arr: { x: number; z: number; rot: number; scale: number }[] = [];
    for (let i = 0; i < count; i++) {
      // distribuição ringless com bias
      const r = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      arr.push({
        x: Math.cos(theta) * r,
        z: Math.sin(theta) * r,
        rot: Math.random() * Math.PI,
        scale: 0.7 + Math.random() * 0.8,
      });
    }
    return arr;
  }, [count, radius]);

  // monta as transformações na primeira renderização
  useMemo(() => {
    if (!meshRef.current) return;
    positions.forEach((p, i) => {
      dummy.position.set(p.x, 0, p.z);
      dummy.rotation.y = p.rot;
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (matRef.current) {
      (matRef.current.uniforms.uTime.value as number) += delta;
    }
    // monta as transformações se ainda não foi
    if (meshRef.current && meshRef.current.count !== positions.length) {
      positions.forEach((p, i) => {
        dummy.position.set(p.x, 0, p.z);
        dummy.rotation.y = p.rot;
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.18, 1.2, 1, 4]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={GRASS_VERT}
        fragmentShader={GRASS_FRAG}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* ---------- Vagalumes-memória (sparkles) ---------- */

const FIRE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.6 + aPhase * 6.28) * 0.4;
    p.x += cos(uTime * 0.4 + aPhase * 6.28) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase * 6.28);
    vAlpha = pulse;
    gl_PointSize = aSize * (200.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FIRE_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    a += smoothstep(0.5, 0.1, d) * 0.4 * vAlpha;
    gl_FragColor = vec4(vec3(1.0, 0.85, 0.55), a);
  }
`;

export function MemoryFireflies({ count = 80, radius = 25 }: { count?: number; radius?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * radius;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = 0.3 + Math.random() * 2.5;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      sizes[i] = 1.5 + Math.random() * 2;
      phases[i] = Math.random();
    }
    return { positions, sizes, phases };
  }, [count, radius]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (matRef.current) {
      (matRef.current.uniforms.uTime.value as number) += delta;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={FIRE_VERT}
        fragmentShader={FIRE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------- Árvore antiga (silhueta estilizada simples) ---------- */

export function AncientTree({ position = [12, 0, -8] as [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* tronco */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 4, 8]} />
        <meshStandardMaterial color="#3a2840" roughness={0.9} />
      </mesh>
      {/* copa — esferas suaves para silhueta */}
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[2.5, 12, 10]} />
        <meshStandardMaterial
          color="#2a3540"
          emissive="#5570a0"
          emissiveIntensity={0.15}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[1.5, 5.5, 0.5]} castShadow>
        <sphereGeometry args={[1.6, 12, 10]} />
        <meshStandardMaterial
          color="#2a3540"
          emissive="#5570a0"
          emissiveIntensity={0.18}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[-1.4, 5.2, -0.4]} castShadow>
        <sphereGeometry args={[1.4, 12, 10]} />
        <meshStandardMaterial
          color="#2a3540"
          emissive="#5570a0"
          emissiveIntensity={0.12}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}
