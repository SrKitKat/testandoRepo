import { useEffect, useRef } from "react";

export default function AuthEnergy() {
  const canvas = useRef(null);

  useEffect(() => {
    const node = canvas.current;
    const scene = node.parentElement;
    const context = node.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 760px) and (pointer: fine)");
    let width, height, particles, frame, next, bolts = [];

    function resize() {
      const density = Math.min(devicePixelRatio, 1.5);
      width = node.clientWidth;
      height = node.clientHeight;
      node.width = width * density;
      node.height = height * density;
      context.setTransform(density, 0, 0, density, 0, 0);
      particles = Array.from({ length: width < 760 ? 18 : 42 }, () => ({
        x: Math.random(), y: Math.random(), size: 0.7 + Math.random() * 1.5,
        phase: Math.random() * 7, speed: 0.000012 + Math.random() * 0.000025,
      }));
      bolts = [];
    }

    function makeBolt(time, side) {
      const mobile = width < 760;
      const start = width * (side === 1 ? 0.02 : 0.98);
      let x = start;
      let y = height * (0.13 + Math.random() * 0.55);
      const points = [[x, y]];
      for (let i = 0; i < 9; i++) {
        x += side * width * (0.004 + Math.random() * (mobile ? 0.009 : 0.029));
        y += (mobile ? 9 : 18) + (Math.random() - 0.5) * 48;
        points.push([x, y]);
      }
      const [branchX, branchY] = points[4];
      return {
        time, points, color: Math.random() < 0.6 ? "#60ddff" : "#ffdb48",
        branches: [
          [[branchX, branchY], [branchX - side * 19, branchY + 28], [branchX - side * 9, branchY + 46]],
          [points[6], [points[6][0] + side * 17, points[6][1] - 12], [points[6][0] + side * 29, points[6][1] + 5]],
        ],
      };
    }

    function animate(time) {
      context.clearRect(0, 0, width, height);
      for (const point of particles) {
        const x = width * (point.x < 0.5 ? point.x * 0.53 : 0.47 + point.x * 0.53);
        const y = height * ((point.y - time * point.speed % 1 + 1) % 1);
        context.globalAlpha = 0.2 + 0.4 * (0.5 + 0.5 * Math.sin(time / 470 + point.phase));
        context.fillStyle = point.x < 0.5 ? "#ffda55" : "#8eeaff";
        context.beginPath();
        context.arc(x, y, point.size, 0, Math.PI * 2);
        context.fill();
      }
      if (time > next) {
        const side = Math.random() < 0.5 ? 1 : -1;
        bolts = [makeBolt(time, side)];
        if (width >= 760 && Math.random() < 0.7) bolts.push(makeBolt(time + 120, -side));
        next = time + (width < 760 ? 2900 : 1550) + Math.random() * 1700;
      }
      for (const bolt of bolts) {
        const age = time - bolt.time;
        if (age < 0 || age > 540) continue;
        const fade = (1 - age / 540) * Math.min(1, age / 65);
        context.globalAlpha = fade * 0.83;
        context.shadowBlur = 15;
        context.shadowColor = bolt.color;
        context.strokeStyle = bolt.color;
        for (const [i, points] of [bolt.points, ...bolt.branches].entries()) {
          context.lineWidth = i ? 1.15 : 2.5;
          context.beginPath();
          points.forEach(([x, y], j) => j ? context.lineTo(x, y) : context.moveTo(x, y));
          context.stroke();
          if (!i) {
            context.lineWidth = 0.95;
            context.strokeStyle = "#f6fbff";
            context.stroke();
            context.strokeStyle = bolt.color;
          }
        }
        context.shadowBlur = 0;
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(animate);
    }

    function sync() {
      cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
      bolts = [];
      if (!document.hidden && !reduced.matches) {
        next = performance.now() + 1400 + Math.random() * 2300;
        frame = requestAnimationFrame(animate);
      }
    }

    function move(event) {
      if (!desktop.matches || reduced.matches) return;
      scene.style.setProperty("--scene-x", ((event.clientX / window.innerWidth - 0.5) * -15) + "px");
      scene.style.setProperty("--scene-y", ((event.clientY / window.innerHeight - 0.5) * -10) + "px");
    }

    function reset() {
      scene.style.removeProperty("--scene-x");
      scene.style.removeProperty("--scene-y");
    }

    if (!context) return;
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    resize();
    sync();
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    scene.addEventListener("pointermove", move);
    scene.addEventListener("pointerleave", reset);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      scene.removeEventListener("pointermove", move);
      scene.removeEventListener("pointerleave", reset);
      reset();
    };
  }, []);

  return <canvas ref={canvas} className="arena-energy" aria-hidden="true" />;
}
