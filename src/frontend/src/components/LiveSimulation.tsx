import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import type { SolarPosition, SystemConfig } from "../types";

interface LiveSimulationProps {
  config: SystemConfig;
  solarPosition: SolarPosition;
  irradiance: number;
}

export function LiveSimulation({
  config,
  solarPosition,
  irradiance,
}: LiveSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const drawScene = (
    canvas: HTMLCanvasElement,
    altitude: number,
    azimuth: number,
    irr: number,
    elapsed: number,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Logical dimensions (CSS pixels) — canvas.width is physical, divide by DPR
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    // Ensure the transform is correct for this frame
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sunRise = altitude > 0;

    // ─── Sky gradient background ───────────────────────────────────
    let skyGrad: CanvasGradient;
    if (!sunRise) {
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#040a1a");
      skyGrad.addColorStop(1, "#0a1535");
    } else if (altitude < 10) {
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#1a2a6c");
      skyGrad.addColorStop(0.4, "#b21f1f");
      skyGrad.addColorStop(0.7, "#f7941d");
      skyGrad.addColorStop(1, "#1a2f50");
    } else if (altitude < 30) {
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#1a3a6c");
      skyGrad.addColorStop(0.5, "#2e6fad");
      skyGrad.addColorStop(1, "#1a2f50");
    } else {
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#0a1f4a");
      skyGrad.addColorStop(0.5, "#1557a0");
      skyGrad.addColorStop(1, "#0d2d5e");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // ─── Ground ─────────────────────────────────────────────────────
    const groundY = H * 0.72;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, "#1a2a1a");
    groundGrad.addColorStop(1, "#0d150d");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);

    // ─── Stars (night only) with twinkling ──────────────────────────
    if (!sunRise || altitude < 5) {
      for (let s = 0; s < 60; s++) {
        const sx = (s * 137.5) % W;
        const sy = (s * 73.3) % (groundY * 0.8);
        const size = s % 3 === 0 ? 1.5 : 0.8;
        // Each star twinkles at its own frequency
        const twinkle =
          0.3 + 0.7 * (0.5 + 0.5 * Math.sin(elapsed / 1000 + s * 0.7));
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ─── Clouds drifting left→right (wrap around ~60s cycle) ─────────
    const cloudOffset = ((elapsed / 60000) * W) % W;
    ctx.save();
    for (let c = 0; c < 3; c++) {
      const baseCx = W * 0.2 + c * W * 0.3;
      const cy = H * 0.2 + c * H * 0.05;
      const cx = ((baseCx + cloudOffset) % (W + 160)) - 80;
      ctx.fillStyle = "rgba(200,220,255,0.12)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 60 + c * 20, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ─── Sun position ────────────────────────────────────────────────
    const azNorm = ((azimuth - 90 + 360) % 360) / 360;
    const sunX = W * (0.1 + azNorm * 0.8);
    const altNorm = Math.max(0, altitude) / 90;
    const sunY = groundY - altNorm * groundY * 0.9;
    const sunR = 22;

    if (altitude > -5) {
      if (sunRise) {
        // ── Sun shimmer: secondary halo ring that expands + fades ──
        const shimmerT = (Math.sin(elapsed / 3000) + 1) / 2; // 0→1 cycle ~3s
        const shimmerR = sunR * (3 + shimmerT * 2); // sunR*3 to sunR*5
        const shimmerAlpha = 0.15 * (1 - shimmerT);
        const shimmerGrad = ctx.createRadialGradient(
          sunX,
          sunY,
          sunR * 2.5,
          sunX,
          sunY,
          shimmerR,
        );
        shimmerGrad.addColorStop(0, `rgba(255,220,80,${shimmerAlpha})`);
        shimmerGrad.addColorStop(1, "rgba(255,180,30,0)");
        ctx.fillStyle = shimmerGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, shimmerR, 0, Math.PI * 2);
        ctx.fill();

        // Sun glow halo
        const glowGrad = ctx.createRadialGradient(
          sunX,
          sunY,
          0,
          sunX,
          sunY,
          sunR * 4,
        );
        const glowAlpha = Math.min(0.5, altitude / 50);
        glowGrad.addColorStop(0, `rgba(255,200,50,${glowAlpha * 1.2})`);
        glowGrad.addColorStop(0.4, `rgba(255,160,20,${glowAlpha * 0.6})`);
        glowGrad.addColorStop(1, "rgba(255,120,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(sunX - sunR * 4, sunY - sunR * 4, sunR * 8, sunR * 8);

        // Sun disk
        const sunGrad = ctx.createRadialGradient(
          sunX - sunR * 0.3,
          sunY - sunR * 0.3,
          0,
          sunX,
          sunY,
          sunR,
        );
        sunGrad.addColorStop(0, "#fff5cc");
        sunGrad.addColorStop(0.5, "#ffd700");
        sunGrad.addColorStop(1, "#ff8c00");
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        // ── Rotating sun rays with pulsing length ──────────────────
        const rayCount = 8;
        const irrFactor = Math.min(1, irr / 800);
        const rayRotation = elapsed / 8000; // full rotation every ~50s
        for (let r = 0; r < rayCount; r++) {
          const angle = (r / rayCount) * Math.PI * 2 + rayRotation;
          // Each ray pulses at slightly different phase
          const pulse = Math.sin(elapsed / 700 + r * 0.9);
          const rayLen = 30 + irrFactor * 20 + pulse * 8;
          const x1 = sunX + Math.cos(angle) * (sunR + 5);
          const y1 = sunY + Math.sin(angle) * (sunR + 5);
          const x2 = sunX + Math.cos(angle) * (sunR + rayLen);
          const y2 = sunY + Math.sin(angle) * (sunR + rayLen);

          ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + irrFactor * 0.4})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        // Setting sun (just below horizon glow)
        const horizonGrad = ctx.createRadialGradient(
          sunX,
          groundY,
          0,
          sunX,
          groundY,
          100,
        );
        horizonGrad.addColorStop(0, "rgba(255,120,0,0.3)");
        horizonGrad.addColorStop(1, "rgba(255,80,0,0)");
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(sunX - 100, groundY - 60, 200, 80);
      }

      // ─── Sun beams to panels (when sun is up) ──────────────────────
      if (sunRise && irr > 50) {
        const beamAlpha = Math.min(0.6, irr / 1000);
        const enabledArrays = config.arrays.filter((a) => a.enabled);
        enabledArrays.forEach((_, idx) => {
          const panelCenterX = W * 0.35 + idx * (W * 0.12);
          const panelCenterY = groundY - 20;
          ctx.strokeStyle = `rgba(255, 215, 0, ${beamAlpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 8]);
          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.lineTo(panelCenterX, panelCenterY);
          ctx.stroke();
          ctx.setLineDash([]);

          // ── Energy flow dots travelling along each beam ────────────
          const beamOffset = idx * 0.33; // stagger between arrays
          for (let d = 0; d < 3; d++) {
            const frac = (elapsed / 1200 + beamOffset + d * 0.33) % 1;
            const dotX = sunX + (panelCenterX - sunX) * frac;
            const dotY = sunY + (panelCenterY - sunY) * frac;
            const dotGrad = ctx.createRadialGradient(
              dotX,
              dotY,
              0,
              dotX,
              dotY,
              4,
            );
            dotGrad.addColorStop(0, "rgba(255,230,80,0.95)");
            dotGrad.addColorStop(0.5, "rgba(255,180,30,0.6)");
            dotGrad.addColorStop(1, "rgba(255,140,0,0)");
            ctx.fillStyle = dotGrad;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    }

    // ─── Solar panels ────────────────────────────────────────────────
    const enabledArrays = config.arrays.filter((a) => a.enabled);
    const irrFactor = Math.min(1, irr / 900);

    enabledArrays.forEach((arr, idx) => {
      const baseX = W * 0.3 + idx * (W * 0.14);
      const baseY = groundY;
      const tiltRad = (arr.tiltAngle * Math.PI) / 180;

      // Panel shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(baseX + 10, baseY + 3, 30, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Panel mount (vertical post)
      ctx.strokeStyle = "#3a4a5a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(baseX, baseY - 25);
      ctx.stroke();

      // Panel body (tilted rectangle)
      const pW = 50;
      const pH = 30;
      ctx.save();
      ctx.translate(baseX, baseY - 25);
      ctx.rotate(-tiltRad);

      // Panel active glow
      const panelGlow = ctx.createLinearGradient(0, -pH / 2, 0, pH / 2);
      const glowColor = sunRise
        ? `rgba(${Math.round(100 + irrFactor * 100)}, ${Math.round(160 + irrFactor * 60)}, 255, ${0.5 + irrFactor * 0.4})`
        : "rgba(30, 40, 80, 0.8)";
      panelGlow.addColorStop(0, glowColor);
      panelGlow.addColorStop(1, "rgba(20, 30, 60, 0.9)");

      ctx.fillStyle = panelGlow;
      ctx.strokeStyle = "#4a6080";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 3);
      ctx.fill();
      ctx.stroke();

      // Grid lines on panel
      ctx.strokeStyle = "rgba(100, 140, 200, 0.3)";
      ctx.lineWidth = 0.5;
      for (let g = 1; g < 4; g++) {
        const gx = -pW / 2 + (pW / 4) * g;
        ctx.beginPath();
        ctx.moveTo(gx, -pH / 2);
        ctx.lineTo(gx, pH / 2);
        ctx.stroke();
      }
      for (let g = 1; g < 3; g++) {
        const gy = -pH / 2 + (pH / 3) * g;
        ctx.beginPath();
        ctx.moveTo(-pW / 2, gy);
        ctx.lineTo(pW / 2, gy);
        ctx.stroke();
      }

      ctx.restore();

      // Array label
      ctx.fillStyle = "rgba(160, 190, 255, 0.7)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(arr.name, baseX, baseY + 14);
    });

    // ─── Power output indicator with pulsing amber glow ───────────────
    const powerKw = enabledArrays.reduce((s, arr) => {
      return (
        s +
        (Number(arr.panelCount) * Number(arr.panelWattage) * irrFactor) / 1000
      );
    }, 0);

    const piX = W - 130;
    const piY = 20;

    // Pulsing shadow glow on the panel
    const glowPulse = (Math.sin(elapsed / 900) + 1) / 2; // 0→1
    ctx.save();
    ctx.shadowColor = sunRise
      ? `rgba(255, 180, 30, ${0.3 + glowPulse * 0.5})`
      : "rgba(100, 120, 255, 0.2)";
    ctx.shadowBlur = 8 + glowPulse * 16;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.roundRect(piX, piY, 120, 70, 8);
    ctx.fill();
    ctx.restore();

    // Amber border ring
    ctx.strokeStyle = sunRise
      ? `rgba(255, 200, 50, ${0.3 + glowPulse * 0.45})`
      : "rgba(80,100,200,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(piX, piY, 120, 70, 8);
    ctx.stroke();

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${powerKw.toFixed(2)} kW`, piX + 60, piY + 30);
    ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${Math.round(irr)} W/m²`, piX + 60, piY + 48);

    // Power bar
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.roundRect(piX + 10, piY + 55, 100, 8, 4);
    ctx.fill();
    ctx.fillStyle = sunRise
      ? `rgba(255, 215, 0, ${0.5 + irrFactor * 0.5})`
      : "rgba(80,80,120,0.6)";
    ctx.beginPath();
    ctx.roundRect(piX + 10, piY + 55, 100 * irrFactor, 8, 4);
    ctx.fill();
  };

  // ─── Responsive canvas: measure container + apply DPR ──────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: drawScene is defined inside component but not memoized
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    let start: number | undefined;
    let elapsed = 0;
    let rafId = 0;

    const applySize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = wrapper.getBoundingClientRect();
      const logicalW = Math.max(rect.width || wrapper.offsetWidth, 1);
      const logicalH = 280; // fixed logical height
      // Setting width/height resets transform, so we must re-scale afterwards
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
      canvas.style.width = `${logicalW}px`;
      canvas.style.height = `${logicalH}px`;
      // ctx.scale accumulates — reset by reassigning canvas dimensions, then scale once
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(() => {
      applySize();
    });
    ro.observe(wrapper);

    // Initial size
    applySize();

    const animate = (ts: number) => {
      if (start === undefined) start = ts;
      elapsed = ts - start;

      const irrAnim = irradiance * (0.95 + 0.05 * Math.sin(elapsed / 1500));
      drawScene(
        canvas,
        solarPosition.altitude,
        solarPosition.azimuth,
        irrAnim,
        elapsed,
      );

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    animFrameRef.current = rafId;

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [solarPosition, irradiance, config]);

  return (
    <Card className="card-solar">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Live System Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div
          ref={wrapperRef}
          style={{
            width: "100%",
            height: "280px",
            overflow: "hidden",
            borderRadius: "0.5rem",
          }}
        >
          <canvas
            ref={canvasRef}
            data-ocid="simulation.canvas_target"
            className="rounded-lg"
            style={{ display: "block" }}
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-3 px-1">
          <span className="text-xs text-muted-foreground">
            Sun:{" "}
            {solarPosition.altitude > 0
              ? "☀️ Above Horizon"
              : "🌙 Below Horizon"}
          </span>
          <span className="text-xs text-muted-foreground">
            Altitude: {solarPosition.altitude.toFixed(1)}°
          </span>
          <span className="text-xs text-muted-foreground">
            Azimuth: {solarPosition.azimuth.toFixed(1)}°
          </span>
          <span className="text-xs text-muted-foreground">
            Arrays: {config.arrays.filter((a) => a.enabled).length} active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
