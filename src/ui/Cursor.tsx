import { useEffect, useRef } from "react";

/* =========================================================
   Cursor — cursor customizado tipo "ponto-de-luz"
   ---------------------------------------------------------
   Some quando ponteiro é capturado (pointer lock).
   ========================================================= */

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    };
    const onLockChange = () => {
      if (!ref.current) return;
      ref.current.style.opacity = document.pointerLockElement
        ? "0"
        : "1";
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerlockchange", onLockChange);
    };
  }, []);

  return <div className="cursor" ref={ref} />;
}
