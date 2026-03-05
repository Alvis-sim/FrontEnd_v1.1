type ThemeMode = "light" | "dark";

export type AntigravityParticleOptions = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  theme?: ThemeMode;
  interactive?: boolean;
  pixelRatio?: number;
  particlesScale?: number;
  density?: number;
  ringWidth?: number;
  ringWidth2?: number;
  ringDisplacement?: number;
};

type NeuralNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  radius: number;
  activation: number;
};

class NeuralNetworkScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly container: HTMLElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly theme: ThemeMode;
  private readonly interactive: boolean;
  private readonly pixelRatio: number;
  private readonly particlesScale: number;
  private readonly density: number;
  private readonly nodes: NeuralNode[] = [];
  private isPaused = false;
  private width = 0;
  private height = 0;
  private pointerX = 0;
  private pointerY = 0;
  private pointerInside = false;
  private time = 0;
  private readonly onResize = () => {
    this.resize();
    this.seedNodes();
  };
  private readonly onPointerMove = (event: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerX = event.clientX - rect.left;
    this.pointerY = event.clientY - rect.top;
    this.pointerInside = true;
  };
  private readonly onPointerLeave = () => {
    this.pointerInside = false;
  };

  constructor(options: AntigravityParticleOptions) {
    this.canvas = options.canvas;
    this.container = options.container;
    this.theme = options.theme ?? "light";
    this.interactive = options.interactive ?? true;
    this.pixelRatio = Math.min(options.pixelRatio ?? window.devicePixelRatio ?? 1, 2);
    this.particlesScale = options.particlesScale ?? 0.6;
    this.density = options.density ?? 220;

    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("2D context unavailable for neural network scene.");
    }
    this.ctx = context;

    this.resize();
    this.seedNodes();

    window.addEventListener("resize", this.onResize);
    this.canvas.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    this.isPaused = true;
  }

  render(deltaSeconds: number): void {
    if (this.isPaused) {
      return;
    }

    this.time += deltaSeconds;
    this.updateNodes(deltaSeconds);
    this.drawBackground();
    this.drawEdges();
    this.drawNodes();
  }

  kill(): void {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.nodes.length = 0;
  }

  private resize(): void {
    this.width = Math.max(1, this.container.clientWidth || window.innerWidth || 1);
    this.height = Math.max(1, this.container.clientHeight || window.innerHeight || 1);
    this.canvas.width = Math.max(1, Math.floor(this.width * this.pixelRatio));
    this.canvas.height = Math.max(1, Math.floor(this.height * this.pixelRatio));
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  private seedNodes(): void {
    this.nodes.length = 0;
    const viewportScale = Math.max(0.75, Math.min(1.25, (this.width * this.height) / (1920 * 1080)));
    const densityScale = Math.max(0.55, Math.min(1.45, this.density / 220));
    const desiredCount = Math.max(90, Math.floor(165 * viewportScale * densityScale * this.particlesScale));

    for (let i = 0; i < desiredCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 14;
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        phase: Math.random() * Math.PI * 2,
        radius: 1 + Math.random() * 2.1,
        activation: Math.random() * 0.3
      });
    }
  }

  private updateNodes(deltaSeconds: number): void {
    const repulseRadius = 190;
    const repulseRadiusSq = repulseRadius * repulseRadius;
    const pulse = 0.5 + Math.sin(this.time * 0.55) * 0.5;
    const activationChancePerSecond = 0.08 + pulse * 0.04;

    for (let i = 0; i < this.nodes.length; i += 1) {
      const node = this.nodes[i];
      node.activation = Math.max(0, node.activation - deltaSeconds * 1.25);
      if (Math.random() < activationChancePerSecond * deltaSeconds) {
        node.activation = 0.65 + Math.random() * 0.35;
      }

      const swirlX = Math.sin(this.time * 0.8 + node.phase) * 4.5;
      const swirlY = Math.cos(this.time * 0.7 + node.phase * 0.87) * 4.5;

      node.x += (node.vx + swirlX) * deltaSeconds;
      node.y += (node.vy + swirlY) * deltaSeconds;

      if (this.interactive && this.pointerInside) {
        const dx = node.x - this.pointerX;
        const dy = node.y - this.pointerY;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq < repulseRadiusSq) {
          const distance = Math.max(1, Math.sqrt(distanceSq));
          const force = (1 - distance / repulseRadius) * (55 + pulse * 40);
          node.x += (dx / distance) * force * deltaSeconds;
          node.y += (dy / distance) * force * deltaSeconds;
          node.activation = Math.min(1, node.activation + force * 0.0045);
        }
      }

      if (node.x < 0 || node.x > this.width) {
        node.vx *= -1;
        node.x = Math.max(0, Math.min(this.width, node.x));
        node.activation = Math.min(1, node.activation + 0.12);
      }
      if (node.y < 0 || node.y > this.height) {
        node.vy *= -1;
        node.y = Math.max(0, Math.min(this.height, node.y));
        node.activation = Math.min(1, node.activation + 0.12);
      }
    }
  }

  private drawBackground(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const base = this.ctx.createLinearGradient(0, 0, 0, this.height);
    if (this.theme === "dark") {
      base.addColorStop(0, "rgba(6, 10, 18, 1)");
      base.addColorStop(1, "rgba(10, 14, 24, 1)");
    } else {
      base.addColorStop(0, "rgba(251, 253, 255, 1)");
      base.addColorStop(1, "rgba(243, 248, 255, 1)");
    }
    this.ctx.fillStyle = base;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const gradient = this.ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.58,
      this.width * 0.05,
      this.width * 0.5,
      this.height * 0.58,
      this.width * 0.55
    );

    if (this.theme === "dark") {
      gradient.addColorStop(0, "rgba(77, 145, 255, 0.2)");
      gradient.addColorStop(0.45, "rgba(23, 52, 96, 0.1)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else {
      gradient.addColorStop(0, "rgba(57, 118, 244, 0.18)");
      gradient.addColorStop(0.42, "rgba(91, 153, 255, 0.07)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.01)");
    }

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawEdges(): void {
    const maxDistance = Math.min(200, Math.max(140, this.width * 0.13));
    const maxDistanceSq = maxDistance * maxDistance;
    const baseAlpha = this.theme === "dark" ? 0.36 : 0.26;

    for (let i = 0; i < this.nodes.length; i += 1) {
      const a = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j += 1) {
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistanceSq) {
          continue;
        }

        const dist = Math.sqrt(distSq);
        const linkStrength = 1 - dist / maxDistance;
        const flicker = 0.7 + 0.3 * Math.sin(this.time * 2.1 + (a.phase + b.phase));
        const activity = Math.max(a.activation, b.activation);
        const alpha = baseAlpha * (0.45 + activity * 0.9) * linkStrength * linkStrength * flicker;

        this.ctx.strokeStyle =
          this.theme === "dark"
            ? `rgba(146, 201, 255, ${alpha.toFixed(3)})`
            : `rgba(43, 111, 240, ${alpha.toFixed(3)})`;
        this.ctx.lineWidth = 0.55 + linkStrength * 1.35 + activity * 0.7;
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }
  }

  private drawNodes(): void {
    for (let i = 0; i < this.nodes.length; i += 1) {
      const node = this.nodes[i];
      const pulse = 0.7 + 0.3 * Math.sin(this.time * 2.4 + node.phase);
      const activatedScale = 1 + node.activation * 0.55;
      const radius = node.radius * pulse * activatedScale;
      const coreAlpha = 0.72 + node.activation * 0.28;
      const glowAlpha = 0.16 + node.activation * 0.38;

      this.ctx.fillStyle =
        this.theme === "dark"
          ? `rgba(186, 226, 255, ${coreAlpha.toFixed(3)})`
          : `rgba(32, 106, 232, ${coreAlpha.toFixed(3)})`;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle =
        this.theme === "dark"
          ? `rgba(198, 234, 255, ${glowAlpha.toFixed(3)})`
          : `rgba(88, 152, 255, ${glowAlpha.toFixed(3)})`;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius * (2.2 + node.activation * 1.2), 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = this.theme === "dark" ? "rgba(232, 246, 255, 0.45)" : "rgba(214, 232, 255, 0.42)";
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius * 0.42, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}

export class AntigravityParticleController {
  private readonly scene: NeuralNetworkScene;
  private frameId: number | null = null;
  private lastTimestamp = 0;

  constructor(scene: NeuralNetworkScene) {
    this.scene = scene;
  }

  start(): void {
    this.scene.resume();
    this.loop(performance.now());
  }

  destroy(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.scene.kill();
  }

  private loop = (timestamp: number): void => {
    const delta = this.lastTimestamp === 0 ? 1 / 60 : Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;
    this.scene.render(delta);
    this.frameId = requestAnimationFrame(this.loop);
  };
}

export const createAntigravityParticles = (options: AntigravityParticleOptions): AntigravityParticleController => {
  const scene = new NeuralNetworkScene(options);
  const controller = new AntigravityParticleController(scene);
  controller.start();
  return controller;
};
