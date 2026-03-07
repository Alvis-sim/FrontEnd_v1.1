"use client";

import { useEffect, useRef, useState } from "react";
import { AGENFIC_BANNER_IFRAME_SRCDOC } from "./agenfic-hero";
import styles from "./constructing-page.module.css";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  size: number;
};

const TARGET_TEXT = "Page under construction";

export default function ConstructingPage() {
  const pageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bannerMounted, setBannerMounted] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    setBannerMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.location.href = "/";
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const pointer = {
      x: Number.POSITIVE_INFINITY,
      y: Number.POSITIVE_INFINITY,
      active: false
    };

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let dpr = 1;

    const clamp = (value: number, min: number, max: number): number => {
      return Math.max(min, Math.min(max, value));
    };

    const splitLines = (text: string, maxWidth: number, font: string): string[] => {
      const words = text.split(" ");
      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) {
        return [text];
      }
      probe.font = font;

      const lines: string[] = [];
      let current = "";

      for (let i = 0; i < words.length; i += 1) {
        const next = current ? `${current} ${words[i]}` : words[i];
        if (probe.measureText(next).width <= maxWidth || current === "") {
          current = next;
        } else {
          lines.push(current);
          current = words[i];
        }
      }

      if (current) {
        lines.push(current);
      }

      return lines;
    };

    const buildParticles = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) {
        return;
      }

      const fontSize = clamp(width * 0.085, 36, 112);
      const font = `700 ${fontSize}px "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif`;
      const lines = splitLines(TARGET_TEXT, width * 0.84, font);
      const lineHeight = fontSize * 1.08;
      const headerHeight = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue("--header-height")
      ) || 84;
      const centerY = headerHeight + (height - headerHeight) / 2;
      const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
      const textBlockHeight = lineHeight * (lines.length - 1) + fontSize;
      const redirectTop = centerY + textBlockHeight * 0.5 + clamp(width * 0.03, 20, 40);
      pageRef.current?.style.setProperty("--constructing-redirect-top", `${redirectTop}px`);

      offCtx.clearRect(0, 0, width, height);
      offCtx.fillStyle = "#181818";
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.font = font;

      for (let i = 0; i < lines.length; i += 1) {
        offCtx.fillText(lines[i], width / 2, startY + i * lineHeight);
      }

      const imageData = offCtx.getImageData(0, 0, width, height).data;
      const gap = width < 640 ? 5 : 6;
      const targets: Array<{ x: number; y: number }> = [];

      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          const alpha = imageData[(y * width + x) * 4 + 3];
          if (alpha > 130) {
            targets.push({ x, y });
          }
        }
      }

      const cap = width < 640 ? 2600 : 3600;
      const targetCount = Math.min(cap, targets.length);

      if (targetCount === 0) {
        particles = [];
        return;
      }

      const next: Particle[] = new Array(targetCount);
      for (let i = 0; i < targetCount; i += 1) {
        const target = targets[(i * targets.length) / targetCount | 0];
        const previous = particles[i];
        next[i] = {
          x: previous ? previous.x : width * (0.3 + Math.random() * 0.4),
          y: previous ? previous.y : height * (0.3 + Math.random() * 0.4),
          vx: previous ? previous.vx : (Math.random() - 0.5) * 2,
          vy: previous ? previous.vy : (Math.random() - 0.5) * 2,
          tx: target.x,
          ty: target.y,
          size: width < 640 ? 1.8 : 2.2
        };
      }

      particles = next;
    };

    const animate = () => {
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        const dx = particle.tx - particle.x;
        const dy = particle.ty - particle.y;
        particle.vx = particle.vx * 0.86 + dx * 0.032;
        particle.vy = particle.vy * 0.86 + dy * 0.032;

        if (pointer.active) {
          const rx = particle.x - pointer.x;
          const ry = particle.y - pointer.y;
          const distSq = rx * rx + ry * ry;
          const influence = 95 * 95;
          if (distSq > 0.0001 && distSq < influence) {
            const force = (1 - distSq / influence) * 2.2;
            const inv = 1 / Math.sqrt(distSq);
            particle.vx += rx * inv * force;
            particle.vy += ry * inv * force;
          }
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        context.beginPath();
        context.fillStyle = "#181818";
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const onResize = () => {
      buildParticles();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = Number.POSITIVE_INFINITY;
      pointer.y = Number.POSITIVE_INFINITY;
    };

    buildParticles();
    animate();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <main className={styles.page} ref={pageRef}>
      {bannerMounted ? (
        <header className="header">
          <div className="agenfic-banner-frame-wrap">
            <iframe
              title="Agenfic Banner"
              className="agenfic-banner-frame"
              srcDoc={AGENFIC_BANNER_IFRAME_SRCDOC}
              scrolling="no"
            />
          </div>
        </header>
      ) : null}
      <canvas ref={canvasRef} className={styles.particlesCanvas} data-engine="canvas-2d" />
      <p className={styles.redirectNotice}>
        redirecting back to home page in <span>{countdown}</span>s
      </p>
    </main>
  );
}
