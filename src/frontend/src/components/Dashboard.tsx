import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Droplets,
  Eye,
  Leaf,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dayOfYear, getSolarPosition, optimalTiltAngle } from "../solarEngine";
import type { HourlyForecastPoint, SystemConfig } from "../types";
import type { WeatherConditions } from "../types";
import { LiveSimulation } from "./LiveSimulation";
import { LossesBreakdown } from "./LossesBreakdown";

interface DashboardProps {
  config: SystemConfig;
  hourlyForecast: HourlyForecastPoint[];
  weather: WeatherConditions;
  isMetric: boolean;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

export function Dashboard({
  config,
  hourlyForecast,
  weather,
  isMetric,
}: DashboardProps) {
  const now = new Date();

  // biome-ignore lint/correctness/useExhaustiveDependencies: solar position calculated once on render
  const solarPos = useMemo(
    () =>
      getSolarPosition(
        config.location.latitude,
        config.location.longitude,
        now,
      ),
    // intentionally only run on mount - now is a constant
    [],
  );

  const todayHourly = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return hourlyForecast
      .filter((p) => p.time >= todayStart && p.time <= todayEnd)
      .map((p) => ({
        hour: `${p.time.getHours().toString().padStart(2, "0")}:00`,
        power: Number(p.powerKw.toFixed(2)),
        irradiance: Math.round(p.irradiance),
      }));
  }, [hourlyForecast]);

  const currentHour = useMemo(() => {
    const h = now.getHours();
    return (
      todayHourly.find(
        (d) => d.hour === `${h.toString().padStart(2, "0")}:00`,
      ) ??
      todayHourly[h] ?? { power: 0, irradiance: 0 }
    );
  }, [todayHourly, now]);

  const todayEnergy = useMemo(
    () => todayHourly.reduce((s, d) => s + d.power, 0),
    [todayHourly],
  );

  const todayEarnings = todayEnergy * config.electricityPrice;
  const todayCo2 = todayEnergy * config.co2EmissionFactor;

  const optTilt = optimalTiltAngle(config.location.latitude, dayOfYear(now));

  const tempDisplay = isMetric
    ? `${weather.temperature.toFixed(1)}°C`
    : `${((weather.temperature * 9) / 5 + 32).toFixed(1)}°F`;

  const windDisplay = isMetric
    ? `${weather.windSpeed.toFixed(1)} km/h`
    : `${(weather.windSpeed * 0.621371).toFixed(1)} mph`;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold text-foreground font-display">
          {config.systemName}
        </h1>
        <p className="text-muted-foreground text-sm">
          {config.location.cityName} ·{" "}
          {now.toLocaleString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </motion.div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: "dashboard.current_power.card",
            label: "Current Power",
            value: `${currentHour.power.toFixed(2)} kW`,
            icon: Zap,
            sub: `${currentHour.irradiance} W/m²`,
            color: "text-solar-gold",
            bg: "from-yellow-500/10 to-amber-500/5",
          },
          {
            id: "dashboard.today_energy.card",
            label: "Today's Energy",
            value: `${todayEnergy.toFixed(1)} kWh`,
            icon: Sun,
            sub: "Total for today",
            color: "text-orange-400",
            bg: "from-orange-500/10 to-amber-500/5",
          },
          {
            id: "dashboard.earnings.card",
            label: "Today's Earnings",
            value: `₹${todayEarnings.toFixed(2)}`,
            icon: DollarSign,
            sub: `@ ₹${config.electricityPrice}/kWh`,
            color: "text-solar-green",
            bg: "from-green-500/10 to-emerald-500/5",
          },
          {
            id: "dashboard.co2.card",
            label: "CO₂ Avoided",
            value: `${todayCo2.toFixed(2)} kg`,
            icon: Leaf,
            sub: `${config.co2EmissionFactor} kg/kWh factor`,
            color: "text-solar-teal",
            bg: "from-teal-500/10 to-cyan-500/5",
          },
        ].map(({ id, label, value, icon: Icon, sub, color, bg }, i) => (
          <motion.div
            key={id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Card
              data-ocid={id}
              className={`stat-card bg-gradient-to-br ${bg} border-border`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className={`text-2xl font-bold font-display ${color}`}>
                  {value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weather + Sun Position Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="card-solar h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Current Weather
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold font-display text-solar-gold">
                  {tempDisplay}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {weather.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Feels like{" "}
                    {isMetric
                      ? `${weather.feelsLike.toFixed(1)}°C`
                      : `${((weather.feelsLike * 9) / 5 + 32).toFixed(1)}°F`}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Droplets,
                    label: "Humidity",
                    value: `${weather.humidity.toFixed(0)}%`,
                  },
                  { icon: Wind, label: "Wind", value: windDisplay },
                  {
                    icon: Eye,
                    label: "Visibility",
                    value: `${weather.visibility.toFixed(0)} km`,
                  },
                  {
                    icon: Thermometer,
                    label: "Pressure",
                    value: `${weather.pressure.toFixed(0)} hPa`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 bg-muted/30 rounded-lg p-2"
                  >
                    <Icon className="w-3.5 h-3.5 text-solar-teal" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {label}
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div
                    className="bg-solar-teal rounded-full h-1.5 transition-all"
                    style={{ width: `${weather.cloudCover * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {(weather.cloudCover * 100).toFixed(0)}% cloud
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="card-solar h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Solar Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Altitude",
                    value: `${solarPos.altitude.toFixed(1)}°`,
                    color: "text-solar-gold",
                  },
                  {
                    label: "Azimuth",
                    value: `${solarPos.azimuth.toFixed(1)}°`,
                    color: "text-orange-400",
                  },
                  {
                    label: "Hour Angle",
                    value: `${solarPos.hourAngle.toFixed(1)}°`,
                    color: "text-solar-teal",
                  },
                  {
                    label: "Declination",
                    value: `${solarPos.declination.toFixed(1)}°`,
                    color: "text-solar-green",
                  },
                  {
                    label: "Opt. Tilt Now",
                    value: `${optTilt.toFixed(1)}°`,
                    color: "text-purple-400",
                  },
                  {
                    label: "UV Index",
                    value: `${weather.uvIndex}`,
                    color: "text-orange-400",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-muted/30 rounded-lg p-2.5 text-center"
                  >
                    <div className={`text-lg font-bold font-display ${color}`}>
                      {value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Power Chart */}
      <motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="card-solar">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Today's Power Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={todayHourly}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="powerGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#d4aa30" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4aa30" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.28 0.025 240)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                  tickLine={false}
                  axisLine={false}
                  unit=" kW"
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a2035",
                    border: "1px solid #3a4a6a",
                    borderRadius: "8px",
                    color: "#f0f4ff",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#a0b4d0", fontWeight: 600 }}
                  itemStyle={{ color: "#f0f4ff" }}
                  formatter={(v: number) => [`${v.toFixed(2)} kW`, "Power"]}
                />
                <Area
                  type="monotone"
                  dataKey="power"
                  stroke="#d4aa30"
                  strokeWidth={2}
                  fill="url(#powerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Simulation */}
      <motion.div
        custom={7}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <LiveSimulation
          config={config}
          solarPosition={solarPos}
          irradiance={currentHour.irradiance}
        />
      </motion.div>

      {/* System Losses */}
      <motion.div
        custom={8}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <LossesBreakdown config={config} currentTemp={weather.temperature} />
      </motion.div>
    </div>
  );
}
