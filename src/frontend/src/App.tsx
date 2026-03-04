import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  CloudSun,
  LayoutDashboard,
  MapPin,
  Search,
  Settings,
  Sun,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  generateAnnualForecast,
  generateDailyForecast,
  generateHourlyForecast,
  generateMonthlyForecast,
  getSolarPosition,
} from "./solarEngine";
import type {
  AnnualForecast,
  DailyForecastPoint,
  HourlyForecastPoint,
  MonthlyForecastPoint,
  SystemConfig,
  TabName,
} from "./types";
import type { WeatherConditions } from "./types";
import { getCurrentWeather } from "./weatherEngine";

import { Analytics } from "./components/Analytics";
import { Dashboard } from "./components/Dashboard";
import { Forecast } from "./components/Forecast";
import { IndiaSolarPlants } from "./components/IndiaSolarPlants";
import { LocationAnalytics } from "./components/LocationAnalytics";
import { SystemConfigTab } from "./components/SystemConfig";
import { WeatherTab } from "./components/WeatherTab";
import { useSaveSystemConfig, useSystemConfig } from "./hooks/useQueries";

const DEFAULT_CONFIG: SystemConfig = {
  systemName: "My Solar System",
  location: {
    latitude: 28.6139,
    longitude: 77.209,
    cityName: "New Delhi, India",
  },
  arrays: [
    {
      name: "Array 1",
      panelCount: 10,
      panelWattage: 400,
      tiltAngle: 28,
      azimuthAngle: 180,
      enabled: true,
    },
  ],
  calibration: {
    efficiencyMultiplier: 1.0,
    soilingFactor: 0.95,
    temperatureCoefficient: -0.004,
  },
  electricityPrice: 0.085, // ~₹7/kWh average India retail tariff
  co2EmissionFactor: 0.71, // India grid emission factor kg CO2/kWh (CEA 2023)
  unitPreference: "metric",
};

const NAV_TABS: {
  id: TabName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "weather", label: "Weather", icon: CloudSun },
  { id: "config", label: "System Config", icon: Settings },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "solarplants", label: "Solar Plants", icon: MapPin },
  { id: "locanalytics", label: "Location Analytics", icon: Search },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isComputingForecast, setIsComputingForecast] = useState(false);

  // Backend integration
  const { data: savedConfig } = useSystemConfig();
  const { mutate: saveConfig, isPending: isSaving } = useSaveSystemConfig();

  // Load saved config from backend
  useEffect(() => {
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, [savedConfig]);

  // Compute forecasts lazily
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastPoint[]>(
    [],
  );
  const [dailyForecast, setDailyForecast] = useState<DailyForecastPoint[]>([]);
  const [monthlyForecast, setMonthlyForecast] = useState<
    MonthlyForecastPoint[]
  >([]);
  const [annualForecast, setAnnualForecast] = useState<AnnualForecast>({
    totalEnergyKwh: 0,
    totalEarnings: 0,
    totalCo2AvoidedKg: 0,
    peakPowerKw: 0,
    capacityKwp: 0,
    specificYield: 0,
    performanceRatio: 0.78,
  });

  // Compute forecasts when config changes (debounced)
  const computeForecasts = useCallback((cfg: SystemConfig) => {
    setIsComputingForecast(true);
    // Use setTimeout to allow render to happen first
    setTimeout(() => {
      try {
        const hourly = generateHourlyForecast(cfg, 360);
        const daily = generateDailyForecast(cfg, 15);
        const monthly = generateMonthlyForecast(cfg);
        const annual = generateAnnualForecast(cfg, monthly);

        setHourlyForecast(hourly);
        setDailyForecast(daily);
        setMonthlyForecast(monthly);
        setAnnualForecast(annual);
      } catch (e) {
        console.error("Forecast computation error:", e);
      } finally {
        setIsComputingForecast(false);
      }
    }, 50);
  }, []);

  // Initial computation - run once on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    computeForecasts(config);
  }, []);

  // Recompute when config changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => computeForecasts(config), 500);
    return () => clearTimeout(timer);
  }, [config, computeForecasts]);

  const weather: WeatherConditions = useMemo(() => {
    const solarPos = getSolarPosition(
      config.location.latitude,
      config.location.longitude,
      new Date(),
    );
    return getCurrentWeather(
      config.location.latitude,
      config.location.longitude,
      solarPos.altitude,
    );
  }, [config.location]);

  const isMetric = config.unitPreference === "metric";

  const handleConfigChange = useCallback((newConfig: SystemConfig) => {
    setConfig(newConfig);
  }, []);

  // handleSaveConfig is used in SystemConfigTab via onSave prop in future; kept for backend integration
  const _handleSaveConfig = useCallback(() => {
    saveConfig(config, {
      onSuccess: () => toast.success("Configuration saved to cloud!"),
      onError: () => toast.error("Failed to save. Changes kept locally."),
    });
  }, [config, saveConfig]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* App Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Sun className="w-7 h-7 text-solar-gold animate-sun-spin" />
                <div className="absolute inset-0 rounded-full bg-solar-gold/20 blur-sm" />
              </div>
              <div>
                <span className="text-xl font-bold font-display text-foreground">
                  PV{" "}
                </span>
                <span className="text-xl font-bold font-display text-solar-gold">
                  SolCast
                </span>
              </div>
              <span className="hidden md:inline-block text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5 ml-1">
                Solar Intelligence
              </span>
            </div>

            {/* Right side info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                {config.location.cityName}
              </span>
              {isComputingForecast && (
                <span className="text-solar-gold animate-pulse">
                  Computing...
                </span>
              )}
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex gap-0.5 -mb-px overflow-x-auto scrollbar-none">
            {NAV_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                data-ocid={`nav.${id}.tab`}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors duration-150
                  ${
                    activeTab === id
                      ? "border-solar-gold text-solar-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && hourlyForecast.length > 0 && (
              <Dashboard
                config={config}
                hourlyForecast={hourlyForecast}
                weather={weather}
                isMetric={isMetric}
              />
            )}
            {activeTab === "forecast" && hourlyForecast.length > 0 && (
              <Forecast
                hourlyForecast={hourlyForecast}
                dailyForecast={dailyForecast}
                monthlyForecast={monthlyForecast}
                annualForecast={annualForecast}
                config={config}
                isMetric={isMetric}
              />
            )}
            {activeTab === "weather" && hourlyForecast.length > 0 && (
              <WeatherTab
                config={config}
                weather={weather}
                hourlyForecast={hourlyForecast}
                isMetric={isMetric}
              />
            )}
            {activeTab === "config" && (
              <SystemConfigTab
                config={config}
                onConfigChange={handleConfigChange}
                isSaving={isSaving}
              />
            )}
            {activeTab === "analytics" && monthlyForecast.length > 0 && (
              <Analytics
                config={config}
                monthlyForecast={monthlyForecast}
                annualForecast={annualForecast}
                currentTemp={weather.temperature}
              />
            )}
            {activeTab === "solarplants" && (
              <IndiaSolarPlants
                onSelectLocation={(lat, lon, cityName) =>
                  setConfig((prev) => ({
                    ...prev,
                    location: { latitude: lat, longitude: lon, cityName },
                  }))
                }
                currentLat={config.location.latitude}
                currentLon={config.location.longitude}
              />
            )}
            {activeTab === "locanalytics" && <LocationAnalytics />}
            {isComputingForecast && activeTab !== "config" && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-3">
                  <Sun className="w-10 h-10 text-solar-gold animate-spin mx-auto" />
                  <p className="text-muted-foreground text-sm">
                    Computing solar forecast...
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              PV SolCast — Solar Intelligence Platform
            </span>
            <a
              href="https://sites.google.com/view/pvfterms/home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-solar-teal hover:text-solar-gold transition-colors underline-offset-2 hover:underline"
            >
              Terms & Conditions
            </a>
            <div className="flex items-center gap-3">
              <a
                href="mailto:support@pvsolcast.com"
                className="text-solar-gold hover:underline"
              >
                support@pvsolcast.com
              </a>
              <span>|</span>
              <a
                href="https://www.pvsolcast.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-solar-gold hover:underline"
              >
                www.pvsolcast.com
              </a>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground/60 mt-2">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "pvsolcast")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.018 250)",
            border: "1px solid oklch(0.28 0.025 240)",
            color: "oklch(0.96 0.01 220)",
          },
        }}
      />
    </div>
  );
}
