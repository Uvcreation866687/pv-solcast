import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AnnualForecast,
  DailyForecastPoint,
  HourlyForecastPoint,
  MonthlyForecastPoint,
  SystemConfig,
} from "../types";

interface ForecastProps {
  hourlyForecast: HourlyForecastPoint[];
  dailyForecast: DailyForecastPoint[];
  monthlyForecast: MonthlyForecastPoint[];
  annualForecast: AnnualForecast;
  config: SystemConfig;
  isMetric: boolean;
}

const CHART_STYLE = {
  background: "oklch(0.16 0.018 250)",
  border: "1px solid oklch(0.28 0.025 240)",
  borderRadius: "8px",
  color: "oklch(0.96 0.01 220)",
  fontSize: "12px",
};

function formatTemp(c: number, isMetric: boolean) {
  return isMetric ? `${c.toFixed(1)}°C` : `${((c * 9) / 5 + 32).toFixed(1)}°F`;
}

export function Forecast({
  hourlyForecast,
  dailyForecast,
  monthlyForecast,
  annualForecast,
  config,
  isMetric,
}: ForecastProps) {
  const hourlyChartData = useMemo(
    () =>
      hourlyForecast.slice(0, 360).map((h) => ({
        time: `${h.time.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${h.time.getHours().toString().padStart(2, "0")}h`,
        power: Number.parseFloat(h.powerKw.toFixed(2)),
        irradiance: Math.round(h.irradiance),
        temp: isMetric
          ? Number.parseFloat(h.temperature.toFixed(1))
          : Number.parseFloat(((h.temperature * 9) / 5 + 32).toFixed(1)),
        cloud: Number.parseFloat((h.cloudCover * 100).toFixed(0)),
      })),
    [hourlyForecast, isMetric],
  );

  const dailyChartData = useMemo(
    () =>
      dailyForecast.map((d) => ({
        date: d.date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        energy: Number.parseFloat(d.energyKwh.toFixed(1)),
        peak: Number.parseFloat(d.peakPowerKw.toFixed(2)),
        earnings: Number.parseFloat(d.earnings.toFixed(2)),
        co2: Number.parseFloat(d.co2AvoidedKg.toFixed(2)),
      })),
    [dailyForecast],
  );

  const monthlyChartData = useMemo(
    () =>
      monthlyForecast.map((m) => ({
        month: m.monthName,
        energy: Number.parseFloat(m.energyKwh.toFixed(1)),
        earnings: Number.parseFloat(m.earnings.toFixed(2)),
        co2: Number.parseFloat(m.co2AvoidedKg.toFixed(1)),
      })),
    [monthlyForecast],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 pb-8"
    >
      <h2 className="text-xl font-bold font-display text-foreground">
        Production Forecast
      </h2>

      <Tabs defaultValue="hourly">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger data-ocid="forecast.hourly.tab" value="hourly">
            Hourly (360h)
          </TabsTrigger>
          <TabsTrigger data-ocid="forecast.daily.tab" value="daily">
            Daily (15d)
          </TabsTrigger>
          <TabsTrigger data-ocid="forecast.monthly.tab" value="monthly">
            Monthly (12mo)
          </TabsTrigger>
          <TabsTrigger data-ocid="forecast.annual.tab" value="annual">
            Annual
          </TabsTrigger>
        </TabsList>

        {/* ── HOURLY ── */}
        <TabsContent value="hourly" className="space-y-4 mt-4">
          <Card className="card-solar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Power Forecast — Next 360 Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={hourlyChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="hPowerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4aa30" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4aa30" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.025 240)"
                    strokeOpacity={0.4}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                    tickLine={false}
                    interval={23}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                    tickLine={false}
                    axisLine={false}
                    unit=" kW"
                  />
                  <Tooltip
                    contentStyle={CHART_STYLE}
                    formatter={(v: number) => [`${v} kW`, "Power"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#d4aa30"
                    strokeWidth={1.5}
                    fill="url(#hPowerGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-solar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Hourly Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-72">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      {[
                        "Date/Time",
                        "Power (kW)",
                        "Irrad. (W/m²)",
                        "Temp",
                        "Cloud",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hourlyForecast.slice(0, 360).map((h) => (
                      <tr
                        key={h.time.toISOString()}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                          {h.time.toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-2 font-mono text-solar-gold">
                          {h.powerKw.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 font-mono text-orange-400">
                          {Math.round(h.irradiance)}
                        </td>
                        <td className="px-4 py-2 font-mono text-solar-teal">
                          {formatTemp(h.temperature, isMetric)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 bg-muted/30 rounded-full h-1">
                              <div
                                className="h-1 rounded-full bg-blue-400"
                                style={{ width: `${h.cloudCover * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {(h.cloudCover * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DAILY ── */}
        <TabsContent value="daily" className="space-y-4 mt-4">
          <Card className="card-solar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Daily Energy — Next 15 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={dailyChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.025 240)"
                    strokeOpacity={0.4}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                    tickLine={false}
                    axisLine={false}
                    unit=" kWh"
                  />
                  <Tooltip
                    contentStyle={CHART_STYLE}
                    formatter={(v: number, n) => [`${v}`, n]}
                  />
                  <Legend
                    wrapperStyle={{
                      color: "oklch(0.6 0.015 230)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="energy"
                    name="Energy (kWh)"
                    fill="#d4aa30"
                    opacity={0.85}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="peak"
                    name="Peak (kW)"
                    fill="#40c0d0"
                    opacity={0.75}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-solar">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Date",
                      "Energy (kWh)",
                      "Peak (kW)",
                      "Earnings",
                      "CO₂ Avoided",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dailyForecast.map((d) => (
                    <tr
                      key={d.date.toISOString()}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {d.date.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-solar-gold">
                        {d.energyKwh.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-orange-400">
                        {d.peakPowerKw.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-solar-green">
                        ₹{d.earnings.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-solar-teal">
                        {d.co2AvoidedKg.toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MONTHLY ── */}
        <TabsContent value="monthly" className="space-y-4 mt-4">
          <Card className="card-solar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Monthly Production Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={monthlyChartData}
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
                    tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
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
                    dataKey="energy"
                    name="Energy (kWh)"
                    fill="#d4aa30"
                    opacity={0.85}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="co2"
                    name="CO₂ (kg)"
                    fill="#50c878"
                    opacity={0.8}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyForecast.map((m) => (
              <Card key={m.month} className="card-solar">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold font-display text-foreground">
                      {m.monthName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {(m.avgCloudCover * 100).toFixed(0)}% cloud
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Energy</span>
                      <span className="font-mono text-solar-gold">
                        {m.energyKwh.toFixed(0)} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Earnings</span>
                      <span className="font-mono text-solar-green">
                        ₹{m.earnings.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CO₂ Avoided</span>
                      <span className="font-mono text-solar-teal">
                        {m.co2AvoidedKg.toFixed(0)} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peak Power</span>
                      <span className="font-mono text-orange-400">
                        {m.peakPowerKw.toFixed(2)} kW
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── ANNUAL ── */}
        <TabsContent value="annual" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Annual Production",
                value: `${(annualForecast.totalEnergyKwh / 1000).toFixed(1)} MWh`,
                sub: `${annualForecast.totalEnergyKwh.toFixed(0)} kWh`,
                color: "text-solar-gold",
              },
              {
                label: "Annual Earnings",
                value: `₹${annualForecast.totalEarnings.toFixed(0)}`,
                sub: `@ ₹${config.electricityPrice}/kWh`,
                color: "text-solar-green",
              },
              {
                label: "CO₂ Avoided",
                value: `${(annualForecast.totalCo2AvoidedKg / 1000).toFixed(2)} t`,
                sub: `${annualForecast.totalCo2AvoidedKg.toFixed(0)} kg`,
                color: "text-solar-teal",
              },
              {
                label: "System Capacity",
                value: `${annualForecast.capacityKwp.toFixed(2)} kWp`,
                sub: "Peak capacity",
                color: "text-orange-400",
              },
              {
                label: "Specific Yield",
                value: `${annualForecast.specificYield.toFixed(0)} kWh/kWp`,
                sub: "Per kWp installed",
                color: "text-purple-400",
              },
              {
                label: "Performance Ratio",
                value: `${(annualForecast.performanceRatio * 100).toFixed(1)}%`,
                sub: "System efficiency",
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
                  <div className="text-xs text-muted-foreground mt-1">
                    {sub}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="card-solar">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Monthly Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={monthlyChartData}
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
                    tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
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
                    dataKey="energy"
                    name="Energy (kWh)"
                    fill="#d4aa30"
                    opacity={0.85}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="earnings"
                    name="Earnings ($)"
                    fill="#50c878"
                    opacity={0.8}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
