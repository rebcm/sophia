import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../state/gameStore";
import { useSoulStore } from "../state/soulStore";
import { Centelha } from "./Centelha";

/* =========================================================
   Player — orbe-personagem do MVP
   ---------------------------------------------------------
   No protótipo ainda não há rig humanóide. O jogador é
   uma silhueta luminosa (esfera + halos) que flutua sobre
   o chão, com aura proporcional à Luz Interior.
   ========================================================= */

const KEYS = {
  forward: ["ArrowUp", "KeyW"],
  back: ["ArrowDown", "KeyS"],
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  shine: ["KeyE"],
  awaken: ["KeyF"],
  next: ["Space", "Enter"],
};

interface PlayerProps {
  /** Quando o jogador estiver perto deste alvo, o controle de awake fica ativo. */
  awakenTarget?: THREE.Vector3;
  /** Distância máxima (m) para considerar “perto”. */
  awakenDistance?: number;
  /** Callback chamado quando jogador entra/sai do raio do alvo. */
  onApproachChange?: (near: boolean) => void;
  /** Ref externa para outros sistemas (ex.: Sussurrante seguir). */
  externalRef?: React.MutableRefObject<THREE.Group | null>;
}

export function Player({
  awakenTarget,
  awakenDistance = 3,
  onApproachChange,
  externalRef,
}: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);

  /* propaga a ref interna para a externa */
  useEffect(() => {
    if (externalRef) externalRef.current = groupRef.current;
  }, [externalRef]);
  const auraRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const phase = useGameStore((s) => s.phase);
  const light = useSoulStore((s) => s.light);

  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  // estado de movimento
  const keys = useRef<Set<string>>(new Set());
  const yaw = useRef<number>(Math.PI); // rotação horizontal câmera
  const pitch = useRef<number>(-0.25); // rotação vertical câmera
  const velocity = useRef(new THREE.Vector3());
  const tmpDir = useRef(new THREE.Vector3());

  const [pointerLocked, setPointerLocked] = useState(false);

  /* ---- Pointer lock para olhar ao redor ---- */
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => {
      if (phase === "intro") return;
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
      }
    };
    canvas.addEventListener("click", onClick);
    const onLockChange = () =>
      setPointerLocked(document.pointerLockElement === canvas);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
    };
  }, [gl, phase]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!pointerLocked) return;
      yaw.current -= e.movementX * 0.0025;
      pitch.current -= e.movementY * 0.002;
      pitch.current = Math.max(-0.9, Math.min(0.4, pitch.current));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [pointerLocked]);

  /* ---- Teclado ---- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code);
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* ---- Loop principal ---- */
  const lastApproach = useRef<boolean>(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // ------- mover -------
    if (phase === "explore" || phase === "approach-elder" || phase === "elder-awake" || phase === "free-roam") {
      const speed = (keys.current.has("ShiftLeft") ? 6 : 3.2) * delta;
      const fwd = pressed(KEYS.forward, keys.current) ? 1 : 0;
      const back = pressed(KEYS.back, keys.current) ? 1 : 0;
      const left = pressed(KEYS.left, keys.current) ? 1 : 0;
      const right = pressed(KEYS.right, keys.current) ? 1 : 0;

      const dz = back - fwd; // tela: invertido
      const dx = right - left;

      tmpDir.current.set(
        dx * Math.cos(yaw.current) - dz * Math.sin(yaw.current),
        0,
        dx * Math.sin(yaw.current) + dz * Math.cos(yaw.current),
      );
      if (tmpDir.current.lengthSq() > 0) tmpDir.current.normalize();

      velocity.current.lerp(tmpDir.current.multiplyScalar(speed * 60), 0.15);

      groupRef.current.position.x += velocity.current.x * delta;
      groupRef.current.position.z += velocity.current.z * delta;

      // limita a um raio (não cair do mundo)
      const r = Math.hypot(groupRef.current.position.x, groupRef.current.position.z);
      if (r > 50) {
        const ang = Math.atan2(groupRef.current.position.z, groupRef.current.position.x);
        groupRef.current.position.x = Math.cos(ang) * 50;
        groupRef.current.position.z = Math.sin(ang) * 50;
      }

      // hover suave
      groupRef.current.position.y = 0.6 + Math.sin(t * 1.4) * 0.08;
    } else {
      // intro/awaken: jogador deitado/parado
      groupRef.current.position.y = 0.25 + Math.sin(t * 1.2) * 0.04;
    }

    // ------- aura pulsa proporcional à luz -------
    if (auraRef.current) {
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      const intensity = 0.25 + light * 0.08 + Math.sin(t * 1.6) * 0.04;
      m.opacity = Math.min(0.55, intensity);
      const scale = 1 + light * 0.3 + Math.sin(t * 1.6) * 0.05;
      auraRef.current.scale.setScalar(scale);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.2;
      const scale = 1 + light * 0.25;
      haloRef.current.scale.setScalar(scale);
    }

    // ------- câmera 3ª pessoa orbital -------
    if (phase !== "intro" && phase !== "awakening") {
      const distance = phase === "awaken" || phase === "whisper-arrives" ? 4.2 : 5.5;
      const cy = Math.cos(pitch.current) * distance;
      const cz = Math.sin(pitch.current) * distance;
      camera.position.set(
        groupRef.current.position.x - Math.sin(yaw.current) * cy,
        groupRef.current.position.y + 1.6 - cz * 0.5,
        groupRef.current.position.z - Math.cos(yaw.current) * cy,
      );
      const lookAtY = groupRef.current.position.y + 0.6;
      camera.lookAt(
        groupRef.current.position.x,
        lookAtY,
        groupRef.current.position.z,
      );
    }

    // ------- detectar aproximação ao alvo -------
    if (awakenTarget) {
      const d = groupRef.current.position.distanceTo(awakenTarget);
      const near = d < awakenDistance;
      if (near !== lastApproach.current) {
        lastApproach.current = near;
        onApproachChange?.(near);
      }
    }
  });

  /* ---- Cor da luz ---- */
  const auraColor = useMemo(() => new THREE.Color("#ffe9d0"), []);
  const haloColor = useMemo(() => new THREE.Color("#ffd45a"), []);

  return (
    <group ref={groupRef} position={[0, 0.6, 6]}>
      {/* corpo (sphere translúcido) */}
      <mesh castShadow>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color="#fff5e6"
          emissive={auraColor}
          emissiveIntensity={1.2 + light * 0.4}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshBasicMaterial
          color={auraColor}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      {/* halo (anel) */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.55, 0.65, 32]} />
        <meshBasicMaterial
          color={haloColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* luz pontual */}
      <pointLight
        color={auraColor}
        intensity={1 + light * 0.7}
        distance={8 + light * 2}
        decay={2}
      />

      {/* Centelha no peito (8 fases conforme bíblia) */}
      <Centelha localPosition={[0, 0.05, 0.36]} />
    </group>
  );
}

function pressed(codes: string[], pressed: Set<string>) {
  return codes.some((c) => pressed.has(c));
}
