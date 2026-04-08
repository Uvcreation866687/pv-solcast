import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  CloudSun,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  Mail,
  MapPin,
  Moon,
  Search,
  Settings,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ThemeProvider, useTheme } from "./hooks/useTheme";

import {
  generateAnnualForecast,
  generateDailyForecast,
  generateHourlyForecast,
  generateMonthlyForecast,
  getSolarPosition,
  locationSoilingFactor,
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
import { SupportTab } from "./components/SupportTab";
import { SystemConfigTab } from "./components/SystemConfig";
import { WeatherTab } from "./components/WeatherTab";
import { useSaveSystemConfig, useSystemConfig } from "./hooks/useQueries";

const DEFAULT_CONFIG: SystemConfig = {
  systemName: "My Solar System",
  location: {
    latitude: 19.076,
    longitude: 72.8777,
    cityName: "Mumbai, Maharashtra",
  },
  arrays: [
    {
      name: "Array 1",
      panelCount: 10,
      panelWattage: 400,
      tiltAngle: 19,
      azimuthAngle: 180,
      enabled: true,
    },
  ],
  calibration: {
    efficiencyMultiplier: 1.0,
    soilingFactor: 0.9,
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
  { id: "support", label: "Support & FAQ", icon: HelpCircle },
];

function AppInner() {
  const { theme, toggleTheme } = useTheme();
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

  const handleConfigChange = useCallback(
    (incomingConfig: SystemConfig) => {
      // Auto-update soiling factor whenever location changes
      let newConfig = incomingConfig;
      if (
        newConfig.location.latitude !== config.location.latitude ||
        newConfig.location.longitude !== config.location.longitude
      ) {
        const autoSoiling = locationSoilingFactor(
          newConfig.location.latitude,
          newConfig.location.longitude,
        );
        newConfig = {
          ...newConfig,
          calibration: {
            ...newConfig.calibration,
            soilingFactor: autoSoiling,
          },
        };
      }
      setConfig(newConfig);
    },
    [config.location.latitude, config.location.longitude],
  );

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
              <button
                type="button"
                data-ocid="header.theme.toggle"
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
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
                    calibration: {
                      ...prev.calibration,
                      soilingFactor: locationSoilingFactor(lat, lon),
                    },
                  }))
                }
                currentLat={config.location.latitude}
                currentLon={config.location.longitude}
              />
            )}
            {activeTab === "locanalytics" && <LocationAnalytics />}
            {activeTab === "support" && <SupportTab />}
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
      <footer
        className="mt-12 border-t border-border"
        style={{ background: "oklch(var(--footer-bg))" }}
      >
        {/* Top accent line */}
        <div
          className="h-0.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.82 0.18 75 / 0.6), oklch(0.72 0.15 195 / 0.6), transparent)",
          }}
        />

        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1 — Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-glow bg-primary/10 border border-primary/30">
                  <Sun className="w-4 h-4 text-solar-gold" />
                </div>
                <span className="font-display font-bold text-lg text-foreground tracking-tight">
                  PV SolCast
                </span>
              </div>
              <p className="text-xs font-medium text-solar-gold tracking-wider uppercase">
                🇮🇳 India's Solar Intelligence Platform
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced solar forecasting &amp; analytics for Indian solar
                plants. Powered by real solar geometry calculations.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-secondary border border-border">
                  <Zap className="w-3.5 h-3.5 text-solar-teal" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-secondary border border-border">
                  <Sun className="w-3.5 h-3.5 text-solar-gold" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-secondary border border-border">
                  <MapPin className="w-3.5 h-3.5 text-solar-green" />
                </div>
              </div>
            </div>

            {/* Column 2 — Quick Links */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-solar-gold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-solar-gold inline-block" />
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Dashboard", tab: "dashboard" as const },
                  { label: "Forecast", tab: "forecast" as const },
                  { label: "Weather", tab: "weather" as const },
                  { label: "Solar Plants", tab: "solarplants" as const },
                  { label: "Location Analytics", tab: "locanalytics" as const },
                  { label: "System Config", tab: "config" as const },
                ].map(({ label, tab }) => (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      data-ocid={`footer.${tab}.link`}
                      className="text-sm text-muted-foreground hover:text-solar-gold transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-solar-teal opacity-0 group-hover:opacity-100 transition-opacity" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-solar-teal flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-solar-teal inline-block" />
                Resources
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://sites.google.com/view/pvfterms/home"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid="footer.terms.link"
                    className="text-sm text-muted-foreground hover:text-solar-gold transition-colors flex items-center gap-1.5 group"
                  >
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-solar-gold" />
                    Terms &amp; Conditions
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab("support")}
                    data-ocid="footer.support.link"
                    className="text-sm text-muted-foreground hover:text-solar-teal transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-solar-teal opacity-0 group-hover:opacity-100 transition-opacity" />
                    Support &amp; FAQ
                  </button>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    About PV SolCast
                  </span>
                </li>
                <li>
                  <a
                    href="mailto:support@pvsolcast.com"
                    data-ocid="footer.contact.link"
                    className="text-sm text-muted-foreground hover:text-solar-gold transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-solar-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-solar-gold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-solar-gold inline-block" />
                Contact
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:support@pvsolcast.com"
                  data-ocid="footer.email.link"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-solar-gold transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/25">
                    <Mail className="w-3.5 h-3.5 text-solar-gold" />
                  </div>
                  <span className="truncate">support@pvsolcast.com</span>
                </a>
                <a
                  href="https://www.pvsolcast.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.website.link"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-solar-teal transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-accent/10 border border-accent/25">
                    <ExternalLink className="w-3.5 h-3.5 text-solar-teal" />
                  </div>
                  <span>www.pvsolcast.com</span>
                </a>
              </div>
              <div className="pt-2 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-solar-green border border-solar-green/30 bg-solar-green/10">
                  <Zap className="w-3 h-3" />
                  India Solar Data Platform
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Made for India</span>
                  <span>🇮🇳</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-border/60" />
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/70">
            <span>
              © {new Date().getFullYear()} PV SolCast. All rights reserved.
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-muted-foreground/50">
              <Zap className="w-3 h-3 text-solar-teal/60" />
              Powered by real solar geometry calculations
            </span>
          </div>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
            color: "oklch(var(--foreground))",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
