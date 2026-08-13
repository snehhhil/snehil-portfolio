"use client";

import { useEffect, useRef } from "react";

export function AmbientBackground() {
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = window.scrollY;
      background.style.setProperty("--ambient-scroll", `${offset}px`);
      background.style.setProperty("--ambient-shift", `${offset * 0.12}px`);
      background.style.setProperty("--ambient-shift-reverse", `${offset * -0.07}px`);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={backgroundRef} aria-hidden="true" className="ambient-background">
      <div className="ambient-aurora" />
      <div className="ambient-stars" />
      <div className="ambient-grid" />
      <div className="ambient-glow ambient-glow-cyan" />
      <div className="ambient-glow ambient-glow-purple" />
      <div className="ambient-glow ambient-glow-green" />
      <div className="ambient-scanlines" />
    </div>
  );
}
