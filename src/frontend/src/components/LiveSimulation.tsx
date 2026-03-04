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
  const animFrameRef = useRef<number>(0);

  const drawScene = (
    canvas: HTMLCanvasElement,
    altitude: number,
    azimuth: number,
    irr: number,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const sunRise = altitude > 0;

    // ─── Sky gradient background ───────────────────────────────────
    let skyGrad: CanvasGradient;
    if (!sunRise) {
      // Night sky
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#040a1a");
      skyGrad.addColorStop(1, "#0a1535");
    } else if (altitude < 10) {
      // Dawn / dusk
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#1a2a6c");
      skyGrad.addColorStop(0.4, "#b21f1f");
      skyGrad.addColorStop(0.7, "#f7941d");
      skyGrad.addColorStop(1, "#1a2f50");
    } else if (altitude < 30) {
      // Morning
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#1a3a6c");
      skyGrad.addColorStop(0.5, "#2e6fad");
      skyGrad.addColorStop(1, "#1a2f50");
    } else {
      // Midday
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

    // ─── Stars (night only) ──────────────────────────────────────────
    if (!sunRise || altitude < 5) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let s = 0; s < 60; s++) {
        const sx = (s * 137.5) % W;
        const sy = (s * 73.3) % (groundY * 0.8);
        const size = s % 3 === 0 ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ─── Clouds ──────────────────────────────────────────────────────
    ctx.fillStyle = "rgba(200,220,255,0.12)";
    for (let c = 0; c < 3; c++) {
      const cx = W * 0.2 + c * W * 0.3;
      const cy = H * 0.2 + c * H * 0.05;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 60 + c * 20, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ─── Sun position ────────────────────────────────────────────────
    if (altitude > -5) {
      // Map azimuth to X position (S=center, E=left, W=right)
      const azNorm = ((azimuth - 90 + 360) % 360) / 360;
      const sunX = W * (0.1 + azNorm * 0.8);
      // Map altitude to Y position
      const altNorm = Math.max(0, altitude) / 90;
      const sunY = groundY - altNorm * groundY * 0.9;
      const sunR = 22;

      if (sunRise) {
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

        // Sun rays
        const rayCount = 8;
        const irrFactor = Math.min(1, irr / 800);
        for (let r = 0; r < rayCount; r++) {
          const angle = (r / rayCount) * Math.PI * 2;
          const rayLen = 30 + irrFactor * 20;
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

    // ─── Power output indicator ───────────────────────────────────────
    const powerKw = enabledArrays.reduce((s, arr) => {
      return (
        s +
        (Number(arr.panelCount) * Number(arr.panelWattage) * irrFactor) / 1000
      );
    }, 0);

    // Panel on right side
    const piX = W - 130;
    const piY = 20;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.roundRect(piX, piY, 120, 70, 8);
    ctx.fill();

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: drawScene is defined inside component but not memoized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let start: number;
    let elapsed = 0;

    const animate = (ts: number) => {
      if (!start) start = ts;
      elapsed = ts - start;

      // Slightly animate the sun rays with time
      const animAltitude = solarPosition.altitude;
      const animAzimuth = solarPosition.azimuth;
      drawScene(
        canvas,
        animAltitude,
        animAzimuth,
        irradiance * (0.95 + 0.05 * Math.sin(elapsed / 1500)),
      );

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
        <canvas
          ref={canvasRef}
          data-ocid="simulation.canvas_target"
          width={800}
          height={400}
          className="w-full rounded-lg"
          style={{ height: "400px", objectFit: "cover" }}
        />
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
