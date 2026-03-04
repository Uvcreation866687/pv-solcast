import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  annualOptimalTilt,
  calculateSystemLosses,
  optimalTiltAngle,
  systemCapacityKwp,
} from "../solarEngine";
import type {
  AnnualForecast,
  MonthlyForecastPoint,
  SystemConfig,
} from "../types";

interface AnalyticsProps {
  config: SystemConfig;
  monthlyForecast: MonthlyForecastPoint[];
  annualForecast: AnnualForecast;
  currentTemp: number;
}

const CHART_STYLE = {
  background: "oklch(0.16 0.018 250)",
  border: "1px solid oklch(0.28 0.025 240)",
  borderRadius: "8px",
  color: "oklch(0.96 0.01 220)",
  fontSize: "12px",
};

const LOSS_COLORS = [
  "#d4aa30",
  "#40c0d0",
  "#50c878",
  "#e07030",
  "#9060d0",
  "#c04060",
  "#408060",
];

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function Analytics({
  config,
  monthlyForecast,
  annualForecast,
  currentTemp,
}: AnalyticsProps) {
  const [systemCostUsd, setSystemCostUsd] = useState(350000);

  const capacityKwp = systemCapacityKwp(config);
  const annualOptTilt = annualOptimalTilt(config.location.latitude);

  // === FIXED: Dynamic system losses from solarEngine ===
  const lossData = useMemo(() => {
    const losses = calculateSystemLosses(config, currentTemp);
    return [
      {
        name: "Temperature",
        value: losses.temperatureLoss * 100,
        color: LOSS_COLORS[0],
      },
      {
        name: "Shading",
        value: losses.shadingLoss * 100,
        color: LOSS_COLORS[3],
      },
      { name: "Wiring", value: losses.wiringLoss * 100, color: LOSS_COLORS[2] },
      {
        name: "Inverter",
        value: (1 - losses.inverterEfficiency) * 100,
        color: LOSS_COLORS[1],
      },
      {
        name: "Soiling",
        value: losses.soilingLoss * 100,
        color: LOSS_COLORS[4],
      },
      {
        name: "Mismatch",
        value: losses.mismatchLoss * 100,
        color: LOSS_COLORS[5],
      },
      {
        name: "IAM / Reflection",
        value: losses.iamLoss * 100,
        color: LOSS_COLORS[6],
      },
    ].filter((d) => d.value > 0.01);
  }, [config, currentTemp]);

  // Performance Ratio by month
  const prData = useMemo(
    () =>
      monthlyForecast.map((m) => {
        const theoretical = capacityKwp * 1000 * 30 * 5;
        const pr =
          theoretical > 0
            ? Math.min(
                0.95,
                Math.max(0.5, (m.energyKwh / (theoretical / 1000)) * 0.75),
              )
            : 0.78;
        return {
          month: m.monthName,
          pr: Number.parseFloat((pr * 100).toFixed(1)),
          energy: Number.parseFloat(m.energyKwh.toFixed(0)),
          earnings: Number.parseFloat(m.earnings.toFixed(0)),
        };
      }),
    [monthlyForecast, capacityKwp],
  );

  // Optimal tilt by month
  const tiltData = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 15);
      const doy = Math.floor(
        (date.getTime() - new Date(year, 0, 0).getTime()) / 86400000,
      );
      return {
        month: monthlyForecast[i]?.monthName ?? `M${i + 1}`,
        optTilt: Number.parseFloat(
          optimalTiltAngle(config.location.latitude, doy).toFixed(1),
        ),
        installedTilt: config.arrays[0]?.tiltAngle ?? 35,
      };
    });
  }, [config, monthlyForecast]);

  // === NEW: Capacity Factor ===
  const capacityFactor = useMemo(() => {
    if (capacityKwp <= 0 || annualForecast.totalEnergyKwh <= 0) return 0;
    return (annualForecast.totalEnergyKwh / (capacityKwp * 8760)) * 100;
  }, [annualForecast.totalEnergyKwh, capacityKwp]);

  // === NEW: Best & Worst Month ===
  const { bestMonth, worstMonth } = useMemo(() => {
    if (monthlyForecast.length === 0)
      return { bestMonth: null, worstMonth: null };
    const sorted = [...monthlyForecast].sort(
      (a, b) => b.energyKwh - a.energyKwh,
    );
    return { bestMonth: sorted[0], worstMonth: sorted[sorted.length - 1] };
  }, [monthlyForecast]);

  // === NEW: Irradiance vs Output Correlation ===
  const correlationData = useMemo(
    () =>
      monthlyForecast.map((m) => ({
        month: m.monthName,
        energy: Number.parseFloat(m.energyKwh.toFixed(0)),
        clearness: Number.parseFloat(((1 - m.avgCloudCover) * 100).toFixed(1)),
      })),
    [monthlyForecast],
  );

  // === NEW: 25-Year Degradation ===
  const degradationData = useMemo(() => {
    const initial = annualForecast.totalEnergyKwh;
    const threshold80 = initial * 0.8;
    return Array.from({ length: 26 }, (_, yr) => ({
      year: yr,
      output: Number.parseFloat((initial * 0.995 ** yr).toFixed(0)),
      threshold: Number.parseFloat(threshold80.toFixed(0)),
    }));
  }, [annualForecast.totalEnergyKwh]);

  // === NEW: Monthly Peak Sun Hours ===
  const peakSunHoursData = useMemo(
    () =>
      monthlyForecast.map((m) => {
        const peakHours = capacityKwp > 0 ? m.energyKwh / (capacityKwp * 6) : 0;
        return {
          month: m.monthName,
          peakHours: Number.parseFloat(peakHours.toFixed(1)),
        };
      }),
    [monthlyForecast, capacityKwp],
  );

  // Payback period
  const annualSavings = annualForecast.totalEarnings;
  const paybackYears = annualSavings > 0 ? systemCostUsd / annualSavings : 0;
  const co2_25yr = annualForecast.totalCo2AvoidedKg * 25;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-8"
    >
      <h2 className="text-xl font-bold font-display text-foreground">
        System Analytics
      </h2>

      {/* KPI Row — extended with Capacity Factor & Best Month */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Annual Production",
            value: `${(annualForecast.totalEnergyKwh / 1000).toFixed(2)} MWh`,
            sub: `${annualForecast.totalEnergyKwh.toFixed(0)} kWh/year`,
            color: "text-solar-gold",
          },
          {
            label: "System Capacity",
            value: `${capacityKwp.toFixed(2)} kWp`,
            sub: `${config.arrays.filter((a) => a.enabled).length} array(s) active`,
            color: "text-orange-400",
          },
          {
            label: "Performance Ratio",
            value: `${(annualForecast.performanceRatio * 100).toFixed(1)}%`,
            sub: "System vs theoretical",
            color: "text-solar-teal",
          },
          {
            label: "Specific Yield",
            value: `${annualForecast.specificYield.toFixed(0)} kWh/kWp`,
            sub: "Per kWp installed",
            color: "text-solar-green",
          },
          {
            label: "Capacity Factor",
            value: `${capacityFactor.toFixed(1)}%`,
            sub: "Energy / max theoretical",
            color: "text-yellow-400",
          },
          {
            label: "Best Month",
            value: bestMonth ? bestMonth.monthName : "—",
            sub: bestMonth
              ? `${bestMonth.energyKwh.toFixed(0)} kWh`
              : "No data",
            color: "text-solar-gold",
          },
          {
            label: "25yr CO₂ Offset",
            value: `${(co2_25yr / 1000).toFixed(1)} t`,
            sub: `${co2_25yr.toFixed(0)} kg over 25 years`,
            color: "text-purple-400",
          },
          {
            label: "Annual Optimal Tilt",
            value: `${annualOptTilt.toFixed(1)}°`,
            sub: `For ${config.location.cityName}`,
            color: "text-rose-400",
          },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="card-solar">
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {label}
              </div>
              <div className={`text-2xl font-bold font-display ${color}`}>
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Best & Worst Month Side-by-Side */}
      {bestMonth && worstMonth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Best Month",
              month: bestMonth,
              accent: "text-solar-gold",
              border: "border-solar-gold/30",
              icon: "☀️",
            },
            {
              label: "Worst Month",
              month: worstMonth,
              accent: "text-solar-teal",
              border: "border-solar-teal/30",
              icon: "🌧️",
            },
          ].map(({ label, month, accent, border, icon }) => (
            <Card key={label} className={`card-solar border ${border}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <span>{icon}</span>
                  {label} — {MONTH_NAMES_FULL[month.month - 1]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "Energy", val: `${month.energyKwh.toFixed(0)} kWh` },
                    { key: "Earnings", val: `₹${month.earnings.toFixed(0)}` },
                    {
                      key: "CO₂ Avoided",
                      val: `${month.co2AvoidedKg.toFixed(0)} kg`,
                    },
                    {
                      key: "Avg Cloud Cover",
                      val: `${(month.avgCloudCover * 100).toFixed(0)}%`,
                    },
                  ].map(({ key, val }) => (
                    <div key={key} className="bg-muted/20 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">{key}</div>
                      <div
                        className={`text-base font-bold font-mono ${accent}`}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payback Period */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Investment Payback Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="space-y-3 md:w-64">
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">
                  System Cost (₹)
                </Label>
                <Input
                  type="number"
                  value={systemCostUsd}
                  onChange={(e) =>
                    setSystemCostUsd(Number.parseFloat(e.target.value) || 0)
                  }
                  className="bg-secondary border-border font-mono"
                />
              </div>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual Savings</span>
                  <span className="font-mono text-solar-green">
                    ₹{annualSavings.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payback Period</span>
                  <span className="font-mono text-solar-gold font-bold">
                    {paybackYears > 0
                      ? `${paybackYears.toFixed(1)} years`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    25yr Net Savings
                  </span>
                  <span className="font-mono text-solar-teal">
                    ₹{(annualSavings * 25 - systemCostUsd).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* 25yr cumulative savings chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={Array.from({ length: 26 }, (_, yr) => ({
                    year: yr,
                    savings: Number.parseFloat(
                      (annualSavings * yr - systemCostUsd).toFixed(0),
                    ),
                    cumulative: Number.parseFloat(
                      (annualSavings * yr).toFixed(0),
                    ),
                  }))}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.025 240)"
                    strokeOpacity={0.4}
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                    tickLine={false}
                    label={{
                      value: "Years",
                      position: "insideBottomRight",
                      offset: -5,
                      fill: "oklch(0.6 0.015 230)",
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={CHART_STYLE}
                    formatter={(v: number) => [`₹${v.toFixed(0)}`, ""]}
                  />
                  <Legend
                    wrapperStyle={{
                      color: "oklch(0.6 0.015 230)",
                      fontSize: "12px",
                    }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="oklch(0.45 0.02 230)"
                    strokeDasharray="4 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#d4aa30"
                    strokeWidth={2}
                    dot={false}
                    name="Net Savings (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Production */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Monthly Production & Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={prData}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.025 240)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="energy"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="earn"
                orientation="right"
                tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={CHART_STYLE} />
              <Legend
                wrapperStyle={{
                  color: "oklch(0.6 0.015 230)",
                  fontSize: "12px",
                }}
              />
              <Bar
                yAxisId="energy"
                dataKey="energy"
                name="Energy (kWh)"
                fill="#d4aa30"
                opacity={0.85}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                yAxisId="earn"
                dataKey="earnings"
                name="Earnings (₹)"
                fill="#50c878"
                opacity={0.8}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* === NEW: Energy Production vs Solar Clearness === */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Energy Production vs Solar Clearness by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={correlationData}
              margin={{ top: 5, right: 30, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.025 240)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="energy"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
                label={{
                  value: "kWh",
                  angle: -90,
                  position: "insideLeft",
                  offset: 12,
                  fill: "oklch(0.6 0.015 230)",
                  fontSize: 10,
                }}
              />
              <YAxis
                yAxisId="clearness"
                orientation="right"
                tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
                unit="%"
                domain={[0, 100]}
                label={{
                  value: "Clearness%",
                  angle: 90,
                  position: "insideRight",
                  offset: 5,
                  fill: "oklch(0.6 0.015 230)",
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={CHART_STYLE}
                formatter={(v: number, name: string) =>
                  name === "Clearness (%)"
                    ? [`${v.toFixed(1)}%`, name]
                    : [`${v.toFixed(0)} kWh`, name]
                }
              />
              <Legend
                wrapperStyle={{
                  color: "oklch(0.6 0.015 230)",
                  fontSize: "12px",
                }}
              />
              <Line
                yAxisId="energy"
                type="monotone"
                dataKey="energy"
                stroke="#d4aa30"
                strokeWidth={2.5}
                dot={{ fill: "#d4aa30", r: 4 }}
                name="Energy (kWh)"
              />
              <Line
                yAxisId="clearness"
                type="monotone"
                dataKey="clearness"
                stroke="#40c0d0"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ fill: "#40c0d0", r: 3 }}
                name="Clearness (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Ratio by Month */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Performance Ratio by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={prData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.025 240)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
                unit="%"
                domain={[50, 100]}
              />
              <Tooltip
                contentStyle={CHART_STYLE}
                formatter={(v: number) => [`${v}%`, "PR"]}
              />
              <Line
                type="monotone"
                dataKey="pr"
                stroke="#40c0d0"
                strokeWidth={2.5}
                dot={{ fill: "#40c0d0", r: 4 }}
                name="Performance Ratio (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Optimal Tilt by Month */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Optimal Tilt Angle by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={tiltData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.025 240)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
                unit="°"
              />
              <Tooltip
                contentStyle={CHART_STYLE}
                formatter={(v: number) => [`${v}°`, ""]}
              />
              <Legend
                wrapperStyle={{
                  color: "oklch(0.6 0.015 230)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="optTilt"
                stroke="#d4aa30"
                strokeWidth={2}
                dot={false}
                name="Optimal Tilt (°)"
              />
              <Line
                type="monotone"
                dataKey="installedTilt"
                stroke="#50c878"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                name="Installed Tilt (°)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* === NEW: 25-Year Degradation Projection === */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            25-Year Output Degradation Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-3">
            Assumes 0.5%/year panel degradation. Dashed line = 80% end-of-life
            threshold.
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={degradationData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.025 240)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                label={{
                  value: "Year",
                  position: "insideBottomRight",
                  offset: -5,
                  fill: "oklch(0.6 0.015 230)",
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                label={{
                  value: "kWh/yr",
                  angle: -90,
                  position: "insideLeft",
                  offset: 12,
                  fill: "oklch(0.6 0.015 230)",
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={CHART_STYLE}
                formatter={(v: number, name: string) =>
                  name === "80% Threshold"
                    ? [`${v.toFixed(0)} kWh`, name]
                    : [`${v.toFixed(0)} kWh/yr`, name]
                }
              />
              <Legend
                wrapperStyle={{
                  color: "oklch(0.6 0.015 230)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="output"
                stroke="#d4aa30"
                strokeWidth={2.5}
                dot={false}
                name="Annual Output (kWh)"
              />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#c04060"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                name="80% Threshold"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* === NEW: Monthly Peak Sun Hours === */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Monthly Peak Sun Hours (Equivalent)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-3">
            Equivalent peak sun hours = monthly energy ÷ (capacity × 6h/day).
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={peakSunHoursData}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.025 240)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "hrs",
                  angle: -90,
                  position: "insideLeft",
                  offset: 12,
                  fill: "oklch(0.6 0.015 230)",
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={CHART_STYLE}
                formatter={(v: number) => [
                  `${v.toFixed(1)} hrs`,
                  "Peak Sun Hrs",
                ]}
              />
              <Bar
                dataKey="peakHours"
                name="Peak Sun Hours"
                radius={[4, 4, 0, 0]}
                opacity={0.9}
              >
                {peakSunHoursData.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill={
                      entry.peakHours ===
                      Math.max(...peakSunHoursData.map((d) => d.peakHours))
                        ? "#d4aa30"
                        : entry.peakHours ===
                            Math.min(
                              ...peakSunHoursData.map((d) => d.peakHours),
                            )
                          ? "#c04060"
                          : "#50c878"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Losses Pie — FIXED with dynamic data */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            System Losses Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-3">
            Live losses calculated from your current config & temperature (
            {currentTemp.toFixed(1)}°C).
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="h-52 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lossData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {lossData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_STYLE}
                    formatter={(value: number, name: string) => [
                      `${Number(value).toFixed(2)}%`,
                      name,
                    ]}
                    labelFormatter={(label) => `Loss Type: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {lossData.map((l) => (
                <div key={l.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: l.color }}
                  />
                  <span className="text-sm text-muted-foreground flex-1">
                    {l.name}
                  </span>
                  <span className="text-sm font-mono text-solar-gold">
                    {l.value.toFixed(2)}%
                  </span>
                </div>
              ))}
              <div className="col-span-2 border-t border-border pt-2 mt-1 flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">
                  Total Losses
                </span>
                <span className="text-lg font-bold font-display text-destructive">
                  {lossData.reduce((s, l) => s + l.value, 0).toFixed(2)}%
                </span>
              </div>
              <div className="col-span-2 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  System Efficiency
                </span>
                <span className="text-lg font-bold font-display text-solar-green">
                  {(100 - lossData.reduce((s, l) => s + l.value, 0)).toFixed(2)}
                  %
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
