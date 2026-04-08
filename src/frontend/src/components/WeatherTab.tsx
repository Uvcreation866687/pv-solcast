import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { solarNoon, sunriseTime, sunsetTime } from "../solarEngine";
import type { HourlyForecastPoint, SystemConfig } from "../types";
import type { WeatherConditions } from "../types";
import {
  getDailyWeatherForecast,
  getHourlyWeatherForecast,
} from "../weatherEngine";

interface WeatherTabProps {
  config: SystemConfig;
  weather: WeatherConditions;
  hourlyForecast: HourlyForecastPoint[];
  isMetric: boolean;
}

const CHART_STYLE = {
  background: "#1a2035",
  border: "1px solid #3a4a6a",
  borderRadius: "8px",
  color: "#f0f4ff",
  fontSize: "12px",
};

const TOOLTIP_LABEL_STYLE = { color: "#a0b4d0", fontWeight: 600 };
const TOOLTIP_ITEM_STYLE = { color: "#f0f4ff" };

function weatherIcon(code: number): string {
  switch (code) {
    case 0:
      return "☀️";
    case 1:
      return "⛅";
    case 2:
      return "🌥️";
    case 3:
      return "☁️";
    case 4:
      return "🌧️";
    default:
      return "🌤️";
  }
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTemp(c: number, isMetric: boolean): string {
  return isMetric ? `${c.toFixed(1)}°C` : `${((c * 9) / 5 + 32).toFixed(1)}°F`;
}

function formatWind(kmh: number, isMetric: boolean): string {
  return isMetric
    ? `${kmh.toFixed(1)} km/h`
    : `${(kmh * 0.621371).toFixed(1)} mph`;
}

function windDirLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function WeatherTab({
  config,
  weather,
  hourlyForecast,
  isMetric,
}: WeatherTabProps) {
  const { location } = config;
  const now = new Date();

  const sunrise = sunriseTime(location.latitude, location.longitude, now);
  const sunset = sunsetTime(location.latitude, location.longitude, now);
  const noon = solarNoon(location.longitude, now);
  const daylightHours = (sunset.getTime() - sunrise.getTime()) / 3600000;

  const hourlyWeather = useMemo(
    () =>
      getHourlyWeatherForecast(
        location.latitude,
        location.longitude,
        hourlyForecast,
      ),
    [location, hourlyForecast],
  );

  const dailyWeather = useMemo(
    () => getDailyWeatherForecast(location.latitude, location.longitude),
    [location],
  );

  const hourlyChartData = hourlyWeather.slice(0, 48).map((h) => ({
    time: `${h.time.getHours().toString().padStart(2, "0")}:00`,
    temp: isMetric
      ? Number.parseFloat(h.temperature.toFixed(1))
      : Number.parseFloat(((h.temperature * 9) / 5 + 32).toFixed(1)),
    cloud: Number.parseFloat((h.cloudCover * 100).toFixed(0)),
    wind: Number.parseFloat(h.windSpeed.toFixed(1)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pb-8"
    >
      <h2 className="text-xl font-bold font-display text-foreground">
        Weather Overview
      </h2>

      {/* Current Conditions Hero */}
      <Card className="card-solar">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-5">
              <div className="text-6xl">{weatherIcon(weather.weatherCode)}</div>
              <div>
                <div className="text-4xl font-bold font-display text-solar-gold">
                  {formatTemp(weather.temperature, isMetric)}
                </div>
                <div className="text-lg text-foreground">
                  {weather.description}
                </div>
                <div className="text-sm text-muted-foreground">
                  Feels like {formatTemp(weather.feelsLike, isMetric)} ·{" "}
                  {location.cityName}
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  icon: Droplets,
                  label: "Humidity",
                  value: `${weather.humidity.toFixed(0)}%`,
                  color: "text-solar-teal",
                },
                {
                  icon: Wind,
                  label: "Wind",
                  value: `${formatWind(weather.windSpeed, isMetric)} ${windDirLabel(weather.windDirection)}`,
                  color: "text-blue-400",
                },
                {
                  icon: Gauge,
                  label: "Pressure",
                  value: `${weather.pressure.toFixed(0)} hPa`,
                  color: "text-purple-400",
                },
                {
                  icon: Eye,
                  label: "Visibility",
                  value: `${weather.visibility.toFixed(0)} km`,
                  color: "text-orange-400",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-muted/30 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  </div>
                  <div className={`text-sm font-bold font-display ${color}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud cover bar */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20">
              Cloud Cover
            </span>
            <div className="flex-1 bg-muted/30 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-400 transition-all duration-1000"
                style={{ width: `${weather.cloudCover * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-solar-teal w-8">
              {(weather.cloudCover * 100).toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sun Times Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Sunrise,
            label: "Sunrise",
            value: formatTime(sunrise),
            color: "text-orange-400",
          },
          {
            icon: Sunset,
            label: "Sunset",
            value: formatTime(sunset),
            color: "text-rose-400",
          },
          {
            icon: Clock,
            label: "Solar Noon",
            value: formatTime(noon),
            color: "text-solar-gold",
          },
          {
            icon: Clock,
            label: "Daylight",
            value: `${Math.floor(daylightHours)}h ${Math.round((daylightHours % 1) * 60)}m`,
            color: "text-solar-teal",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="card-solar">
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className={`text-lg font-bold font-display ${color}`}>
                  {value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hourly 48h Chart */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Temperature & Cloud Cover — Next 48 Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={hourlyChartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.28 0.025 240)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                interval={5}
              />
              <YAxis
                yAxisId="temp"
                tick={{ fontSize: 11, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="cloud"
                orientation="right"
                tick={{ fontSize: 10, fill: "oklch(0.6 0.015 230)" }}
                tickLine={false}
                axisLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={CHART_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
              />
              <Legend
                wrapperStyle={{
                  color: "oklch(0.6 0.015 230)",
                  fontSize: "12px",
                }}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                stroke="#d4aa30"
                strokeWidth={2}
                dot={false}
                name={isMetric ? "Temp (°C)" : "Temp (°F)"}
              />
              <Line
                yAxisId="cloud"
                type="monotone"
                dataKey="cloud"
                stroke="#40c0d0"
                strokeWidth={1.5}
                dot={false}
                name="Cloud (%)"
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly table */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            48-Hour Detail
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Time",
                    "Condition",
                    "Temp",
                    "Wind",
                    "Humidity",
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
                {hourlyWeather.slice(0, 48).map((h) => (
                  <tr
                    key={h.time.toISOString()}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {h.time.toLocaleTimeString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {weatherIcon(h.weatherCode)} {h.description}
                    </td>
                    <td className="px-4 py-2 font-mono text-solar-gold">
                      {formatTemp(h.temperature, isMetric)}
                    </td>
                    <td className="px-4 py-2 font-mono text-blue-400">
                      {formatWind(h.windSpeed, isMetric)}
                    </td>
                    <td className="px-4 py-2 font-mono text-solar-teal">
                      {h.humidity.toFixed(0)}%
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-muted/30 rounded-full h-1">
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
          </div>
        </CardContent>
      </Card>

      {/* 10-Day Forecast */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            10-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {dailyWeather.map((d, idx) => (
              <div
                key={d.date.toISOString()}
                className="bg-muted/20 rounded-xl p-3 text-center"
              >
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  {idx === 0
                    ? "Today"
                    : d.date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                </div>
                <div className="text-3xl my-1">
                  {weatherIcon(d.weatherCode)}
                </div>
                <div className="text-xs text-foreground">{d.description}</div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-sm font-bold text-solar-gold">
                    {formatTemp(d.highTemp, isMetric)}
                  </span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTemp(d.lowTemp, isMetric)}
                  </span>
                </div>
                <div className="text-xs text-blue-400 mt-1">
                  {(d.avgCloudCover * 100).toFixed(0)}% cloud
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatWind(d.windSpeed, isMetric)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
