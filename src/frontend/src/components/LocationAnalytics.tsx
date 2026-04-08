import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  Leaf,
  Loader2,
  LocateFixed,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  annualOptimalTilt,
  generateAnnualForecast,
  generateMonthlyForecast,
  getSolarPosition,
  sunriseTime,
  sunsetTime,
} from "../solarEngine";
import type {
  AnnualForecast,
  MonthlyForecastPoint,
  SystemConfig,
  WeatherConditions,
} from "../types";
import { getCurrentWeather } from "../weatherEngine";

// ─── India city database ────────────────────────────────────────────────────

const INDIA_CITIES = [
  { name: "New Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Surat", lat: 21.1702, lon: 72.8311 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Thane", lat: 19.2183, lon: 72.9781 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Pimpri-Chinchwad", lat: 18.6279, lon: 73.7998 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
  { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
  { name: "Ludhiana", lat: 30.901, lon: 75.8573 },
  { name: "Agra", lat: 27.1767, lon: 78.0081 },
  { name: "Nashik", lat: 19.9975, lon: 73.7898 },
  { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
  { name: "Meerut", lat: 28.9845, lon: 77.7064 },
  { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
  { name: "Kalyan", lat: 19.2437, lon: 73.1355 },
  { name: "Vasai-Virar", lat: 19.4207, lon: 72.821 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { name: "Aurangabad", lat: 19.8762, lon: 75.3433 },
  { name: "Dhanbad", lat: 23.7957, lon: 86.4304 },
  { name: "Amritsar", lat: 31.634, lon: 74.8723 },
  { name: "Navi Mumbai", lat: 19.033, lon: 73.0297 },
  { name: "Allahabad", lat: 25.4358, lon: 81.8463 },
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { name: "Howrah", lat: 22.5958, lon: 88.2636 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Jabalpur", lat: 23.1815, lon: 79.9864 },
  { name: "Gwalior", lat: 26.2183, lon: 78.1828 },
  { name: "Vijayawada", lat: 16.5062, lon: 80.648 },
  { name: "Jodhpur", lat: 26.2389, lon: 73.0243 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Raipur", lat: 21.2514, lon: 81.6296 },
  { name: "Kota", lat: 25.2138, lon: 75.8648 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { name: "Solapur", lat: 17.6805, lon: 75.9064 },
  { name: "Hubli-Dharwad", lat: 15.3647, lon: 75.124 },
  { name: "Bareilly", lat: 28.367, lon: 79.4304 },
  { name: "Mysore", lat: 12.2958, lon: 76.6394 },
  { name: "Moradabad", lat: 28.8389, lon: 78.7768 },
  { name: "Bhadla", lat: 27.5393, lon: 71.9157 },
  { name: "Bikaner", lat: 28.0229, lon: 73.3119 },
  { name: "Jaisalmer", lat: 26.9157, lon: 70.9083 },
  { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Shimla", lat: 31.1048, lon: 77.1734 },
  { name: "Leh", lat: 34.1526, lon: 77.5771 },
  { name: "Gangtok", lat: 27.3389, lon: 88.6065 },
  { name: "Agartala", lat: 23.8315, lon: 91.2868 },
  { name: "Imphal", lat: 24.817, lon: 93.9368 },
  { name: "Aizawl", lat: 23.7307, lon: 92.7173 },
  { name: "Kohima", lat: 25.6751, lon: 94.1086 },
  { name: "Dispur", lat: 26.1433, lon: 91.7898 },
  { name: "Itanagar", lat: 27.0844, lon: 93.6053 },
  { name: "Panaji", lat: 15.4909, lon: 73.8278 },
  { name: "Kurnool", lat: 15.8281, lon: 78.0373 },
  { name: "Tirunelveli", lat: 8.7139, lon: 77.7567 },
  { name: "Mangalore", lat: 12.9141, lon: 74.856 },
  // Maharashtra cities
  { name: "Amravati", lat: 20.9374, lon: 77.7796 },
  { name: "Solapur", lat: 17.6805, lon: 75.9064 },
  { name: "Kolhapur", lat: 16.705, lon: 74.2433 },
  { name: "Akola", lat: 20.7002, lon: 77.0082 },
  { name: "Latur", lat: 18.4088, lon: 76.5604 },
  { name: "Nanded", lat: 19.1383, lon: 77.321 },
  { name: "Jalgaon", lat: 21.0077, lon: 75.5626 },
  { name: "Dhule", lat: 20.9042, lon: 74.7749 },
  { name: "Ahmadnagar", lat: 19.0952, lon: 74.748 },
  { name: "Chandrapur", lat: 19.9615, lon: 79.2961 },
  // Other important cities
  { name: "Gorakhpur", lat: 26.7606, lon: 83.3732 },
  { name: "Aligarh", lat: 27.8974, lon: 78.088 },
  { name: "Ajmer", lat: 26.4499, lon: 74.6399 },
  { name: "Udaipur", lat: 24.5854, lon: 73.7125 },
  { name: "Sikar", lat: 27.6094, lon: 75.1399 },
  { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047 },
  { name: "Salem", lat: 11.6643, lon: 78.146 },
  { name: "Warangal", lat: 17.9784, lon: 79.5941 },
  { name: "Rajahmundry", lat: 17.0005, lon: 81.804 },
  { name: "Guntur", lat: 16.3067, lon: 80.4365 },
  { name: "Nellore", lat: 14.4426, lon: 79.9865 },
  { name: "Cuttack", lat: 20.4625, lon: 85.8828 },
  { name: "Puri", lat: 19.8135, lon: 85.8312 },
  { name: "Sambalpur", lat: 21.4669, lon: 83.9756 },
  { name: "Gaya", lat: 24.7914, lon: 85.0002 },
  { name: "Muzaffarpur", lat: 26.1209, lon: 85.3647 },
  { name: "Bhagalpur", lat: 25.244, lon: 86.9718 },
  { name: "Durgapur", lat: 23.5204, lon: 87.3119 },
  { name: "Siliguri", lat: 26.7271, lon: 88.3953 },
  { name: "Asansol", lat: 23.6739, lon: 86.9524 },
  { name: "Jamshedpur", lat: 22.8046, lon: 86.2029 },
  { name: "Bokaro", lat: 23.6693, lon: 86.1511 },
  { name: "Kozhikode", lat: 11.2588, lon: 75.7804 },
  { name: "Thrissur", lat: 10.5276, lon: 76.2144 },
  { name: "Kannur", lat: 11.8745, lon: 75.3704 },
  { name: "Shillong", lat: 25.5788, lon: 91.8933 },
  { name: "Dimapur", lat: 25.9066, lon: 93.7265 },
  { name: "Silchar", lat: 24.8333, lon: 92.7789 },
  { name: "Bilaspur", lat: 22.0797, lon: 82.1409 },
  { name: "Korba", lat: 22.3595, lon: 82.7501 },
  { name: "Ujjain", lat: 23.1765, lon: 75.7885 },
  { name: "Sagar", lat: 23.8388, lon: 78.7378 },
  { name: "Satna", lat: 24.5868, lon: 80.8322 },
  { name: "Rohtak", lat: 28.8955, lon: 76.6066 },
  { name: "Hisar", lat: 29.1492, lon: 75.7217 },
  { name: "Karnal", lat: 29.6857, lon: 76.9905 },
  { name: "Panipat", lat: 29.3909, lon: 76.9635 },
  { name: "Ambala", lat: 30.3752, lon: 76.7821 },
  { name: "Jammu", lat: 32.7266, lon: 74.857 },
  { name: "Puducherry", lat: 11.9416, lon: 79.8083 },
  { name: "Gandhinagar", lat: 23.2156, lon: 72.6369 },
  { name: "Bhavnagar", lat: 21.7645, lon: 72.1519 },
  { name: "Jamnagar", lat: 22.4707, lon: 70.0577 },
  { name: "Junagadh", lat: 21.5222, lon: 70.4579 },
  { name: "Anand", lat: 22.5645, lon: 72.9289 },
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface MonthlyClimate {
  month: string;
  avgTemp: number;
  cloudCover: number;
  peakSunHours: number;
}

interface LocationResult {
  lat: number;
  weather: WeatherConditions;
  monthly: MonthlyForecastPoint[];
  annual: AnnualForecast;
  monthlyClimate: MonthlyClimate[];
  capacityFactor: number;
  bestMonthObj: MonthlyForecastPoint;
  co2_25yr_tonnes: number;
  annualOptTilt: number;
  sunrise: string;
  sunset: string;
  capacityKwp: number;
  tariffPerKwh: number;
  panelW: number;
  numPanels: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CHART_STYLE = {
  background: "#1a2035",
  border: "1px solid #3a4a6a",
  borderRadius: "8px",
  color: "#f0f4ff",
  fontSize: "12px",
};

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
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// India-specific cloud cover model (same logic as solarEngine / weatherEngine)
function indiaCloudBase(month: number, lat: number): number {
  const northCloud: Record<number, number> = {
    1: 0.18,
    2: 0.15,
    3: 0.12,
    4: 0.18,
    5: 0.22,
    6: 0.68,
    7: 0.8,
    8: 0.76,
    9: 0.58,
    10: 0.28,
    11: 0.16,
    12: 0.15,
  };
  const centralCloud: Record<number, number> = {
    1: 0.2,
    2: 0.17,
    3: 0.14,
    4: 0.2,
    5: 0.28,
    6: 0.72,
    7: 0.82,
    8: 0.78,
    9: 0.6,
    10: 0.32,
    11: 0.22,
    12: 0.18,
  };
  const southCloud: Record<number, number> = {
    1: 0.22,
    2: 0.18,
    3: 0.16,
    4: 0.24,
    5: 0.34,
    6: 0.75,
    7: 0.8,
    8: 0.75,
    9: 0.65,
    10: 0.55,
    11: 0.48,
    12: 0.38,
  };
  if (lat > 25) return northCloud[month] ?? 0.28;
  if (lat > 15) return centralCloud[month] ?? 0.32;
  return southCloud[month] ?? 0.38;
}

function indiaMeanTemp(month: number, lat: number): number {
  const northMean: Record<number, number> = {
    1: 14,
    2: 17,
    3: 23,
    4: 30,
    5: 36,
    6: 35,
    7: 31,
    8: 30,
    9: 29,
    10: 25,
    11: 19,
    12: 15,
  };
  const centralMean: Record<number, number> = {
    1: 19,
    2: 22,
    3: 28,
    4: 33,
    5: 37,
    6: 33,
    7: 28,
    8: 27,
    9: 28,
    10: 27,
    11: 23,
    12: 19,
  };
  const southMean: Record<number, number> = {
    1: 22,
    2: 24,
    3: 28,
    4: 31,
    5: 32,
    6: 29,
    7: 27,
    8: 27,
    9: 27,
    10: 26,
    11: 24,
    12: 22,
  };
  if (lat > 25) return northMean[month] ?? 26;
  if (lat > 15) return centralMean[month] ?? 27;
  return southMean[month] ?? 26;
}

// Build monthly climate data from lat
function buildMonthlyClimate(lat: number): MonthlyClimate[] {
  // Midpoint DOYs for each month: Jan=15, Feb=46, ...
  const midDoys = [15, 46, 75, 106, 136, 167, 197, 228, 258, 289, 319, 350];

  return midDoys.map((doy, idx) => {
    const month = idx + 1;
    const avgTemp = indiaMeanTemp(month, lat);
    const cloudCover = indiaCloudBase(month, lat);

    // Peak sun hours = integrate irradiance potential for a day at given doy/lat
    // Simplified: use daylight hours × clearness fraction
    const dec = 23.45 * Math.sin(((360 / 365) * (284 + doy) * Math.PI) / 180);
    const latRad = (lat * Math.PI) / 180;
    const decRad = (dec * Math.PI) / 180;
    const cosHa = -(Math.tan(latRad) * Math.tan(decRad));
    const daylightHours =
      cosHa >= 1
        ? 0
        : cosHa <= -1
          ? 24
          : (2 * Math.acos(cosHa) * 180) / Math.PI / 15;
    const clearnessFraction = 1 - cloudCover * 0.85;
    const peakSunHours =
      Math.round(daylightHours * clearnessFraction * 0.45 * 10) / 10;

    return {
      month: MONTH_NAMES_SHORT[idx],
      avgTemp,
      cloudCover: Math.round(cloudCover * 100),
      peakSunHours,
    };
  });
}

// Count approximate clear days per year for given lat
function estimateClearDays(lat: number): number {
  let clearDays = 0;
  for (let m = 1; m <= 12; m++) {
    const cloud = indiaCloudBase(m, lat);
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
    clearDays += daysInMonth * (1 - cloud);
  }
  return Math.round(clearDays);
}

// Determine best solar months
function bestSolarMonths(lat: number): string {
  const scores = MONTH_NAMES_SHORT.map((name, idx) => {
    const month = idx + 1;
    const cloud = indiaCloudBase(month, lat);
    return { name, score: 1 - cloud };
  });
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  return sorted
    .slice(0, 3)
    .map((s) => s.name)
    .join(", ");
}

// ─── Main compute function ───────────────────────────────────────────────────

function computeLocationData(
  lat: number,
  lon: number,
  locationName: string,
  capacityKwp = 1000,
  tariffPerKwh = 7,
  panelW = 400,
): LocationResult {
  const optTilt = Math.max(10, annualOptimalTilt(lat));
  const numPanels = Math.round((capacityKwp * 1000) / panelW);

  const refConfig: SystemConfig = {
    systemName: `${locationName} Solar Plant`,
    location: { latitude: lat, longitude: lon, cityName: locationName },
    arrays: [
      {
        name: "Array 1",
        panelCount: numPanels,
        panelWattage: panelW,
        tiltAngle: optTilt,
        azimuthAngle: 180,
        enabled: true,
      },
    ],
    calibration: {
      efficiencyMultiplier: 1.0,
      soilingFactor: 0.95,
      temperatureCoefficient: -0.004,
    },
    electricityPrice: tariffPerKwh,
    co2EmissionFactor: 0.71,
    unitPreference: "metric",
  };

  const monthly = generateMonthlyForecast(refConfig);
  const annual = generateAnnualForecast(refConfig, monthly);

  const capacityFactor = (annual.totalEnergyKwh / (capacityKwp * 8760)) * 100;
  const bestMonthObj = monthly.reduce((a, b) =>
    b.energyKwh > a.energyKwh ? b : a,
  );

  let totalCo2_25yr = 0;
  for (let y = 0; y < 25; y++) {
    const degradation = (1 - 0.008) ** y;
    totalCo2_25yr += annual.totalCo2AvoidedKg * degradation;
  }
  const co2_25yr_tonnes = totalCo2_25yr / 1000;

  const solarPos = getSolarPosition(lat, lon, new Date());
  const weather = getCurrentWeather(lat, lon, solarPos.altitude);

  const today = new Date();
  const sunrise = formatTime(sunriseTime(lat, lon, today));
  const sunset = formatTime(sunsetTime(lat, lon, today));

  const monthlyClimate = buildMonthlyClimate(lat);

  return {
    lat,
    weather,
    monthly,
    annual,
    monthlyClimate,
    capacityFactor,
    bestMonthObj,
    co2_25yr_tonnes,
    annualOptTilt: optTilt,
    sunrise,
    sunset,
    capacityKwp,
    tariffPerKwh,
    panelW,
    numPanels,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: "gold" | "teal" | "green" | "amber";
  delay?: number;
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent = "gold",
  delay = 0,
}: KpiCardProps) {
  const accentClasses = {
    gold: "text-solar-gold border-solar-gold/20 bg-solar-gold/5",
    teal: "text-solar-teal border-solar-teal/20 bg-solar-teal/5",
    green: "text-solar-green border-solar-green/20 bg-solar-green/5",
    amber: "text-solar-amber border-solar-amber/20 bg-solar-amber/5",
  };
  const iconClasses = {
    gold: "text-solar-gold",
    teal: "text-solar-teal",
    green: "text-solar-green",
    amber: "text-solar-amber",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className={`border ${accentClasses[accent]} h-full`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider truncate">
                {label}
              </p>
              <p
                className={`text-lg font-bold font-display leading-tight ${iconClasses[accent]}`}
              >
                {value}
              </p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {sub}
                </p>
              )}
            </div>
            <div className={`shrink-0 ${iconClasses[accent]} opacity-70`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Custom tooltip for recharts ─────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={CHART_STYLE} className="px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold mb-1" style={{ color: "#a0b4d0" }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LocationAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [isComputing, setIsComputing] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [result, setResult] = useState<LocationResult | null>(null);
  const [inputMode, setInputMode] = useState<"search" | "manual">("search");
  const inputRef = useRef<HTMLInputElement>(null);

  // MWp Calculator state
  const [calcMwp, setCalcMwp] = useState("1000");
  const [calcTariff, setCalcTariff] = useState("7.0");
  const [calcPanelW, setCalcPanelW] = useState("400");

  // Filter cities by search query
  const suggestions =
    searchQuery.length >= 2
      ? INDIA_CITIES.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ).slice(0, 8)
      : [];

  function handleSelectCity(city: (typeof INDIA_CITIES)[number]) {
    setSelectedLat(city.lat);
    setSelectedLon(city.lon);
    setLocationName(city.name);
    setSearchQuery(city.name);
    setShowSuggestions(false);
  }

  function handleAnalyse() {
    let lat: number;
    let lon: number;
    let name: string;

    if (inputMode === "manual") {
      lat = Number.parseFloat(manualLat);
      lon = Number.parseFloat(manualLon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return;
      if (lat < 6 || lat > 38 || lon < 68 || lon > 98) {
        // Out of India bounds — clamp to India
        lat = Math.max(6, Math.min(38, lat));
        lon = Math.max(68, Math.min(98, lon));
      }
      name = `Custom (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;
    } else {
      if (selectedLat === null || selectedLon === null) return;
      lat = selectedLat;
      lon = selectedLon;
      name = locationName;
    }

    setIsComputing(true);
    setTimeout(() => {
      try {
        const data = computeLocationData(
          lat,
          lon,
          name,
          Number.parseFloat(calcMwp),
          Number.parseFloat(calcTariff),
          Number.parseFloat(calcPanelW),
        );
        setResult(data);
      } catch (e) {
        console.error("Location analytics error:", e);
      } finally {
        setIsComputing(false);
      }
    }, 60);
  }

  function handleRecalculate() {
    if (!result || selectedLat === null || selectedLon === null) return;
    const name =
      locationName ||
      `Custom (${selectedLat.toFixed(4)}°N, ${selectedLon.toFixed(4)}°E)`;
    setIsComputing(true);
    setTimeout(() => {
      try {
        const data = computeLocationData(
          selectedLat,
          selectedLon,
          name,
          Number.parseFloat(calcMwp),
          Number.parseFloat(calcTariff),
          Number.parseFloat(calcPanelW),
        );
        setResult(data);
      } catch (e) {
        console.error("Recalculate error:", e);
      } finally {
        setIsComputing(false);
      }
    }, 40);
  }

  function handleGpsLocate() {
    if (!navigator.geolocation) {
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const clampedLat = Math.max(6, Math.min(38, lat));
        const clampedLon = Math.max(68, Math.min(98, lon));
        setManualLat(clampedLat.toFixed(4));
        setManualLon(clampedLon.toFixed(4));
        setInputMode("manual");
        setIsGpsLoading(false);
      },
      (_error) => {
        setIsGpsLoading(false);
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true },
    );
  }

  // Monthly chart data
  const monthlyChartData = result
    ? result.monthly.map((m) => ({
        month: m.monthName,
        production: Math.round(m.energyKwh / 1000), // MWh
        earnings: Math.round(
          (m.energyKwh * (result?.tariffPerKwh ?? 7)) / 100000,
        ), // ₹ Lakhs
        co2: Math.round(m.co2AvoidedKg / 1000), // tonnes
      }))
    : [];

  // Monthly climate chart data
  const climateChartData = result
    ? result.monthlyClimate.map((c) => ({
        month: c.month,
        temp: c.avgTemp,
        cloud: c.cloudCover,
        psh: c.peakSunHours,
      }))
    : [];

  const canAnalyse =
    inputMode === "search"
      ? selectedLat !== null && selectedLon !== null
      : manualLat !== "" && manualLon !== "";

  return (
    <div className="space-y-6 pb-8">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-solar-teal" />
          Location Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter any location in India to see complete weather analytics and
          solar plant projections.
        </p>
      </motion.div>

      {/* ── Search / Input Section ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-solar-gold" />
              Select Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputMode("search")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  inputMode === "search"
                    ? "bg-solar-gold/20 text-solar-gold border border-solar-gold/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                🔍 City Search
              </button>
              <button
                type="button"
                onClick={() => setInputMode("manual")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  inputMode === "manual"
                    ? "bg-solar-teal/20 text-solar-teal border border-solar-teal/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                📍 Manual Coordinates
              </button>
              <button
                type="button"
                onClick={handleGpsLocate}
                disabled={isGpsLoading}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-muted-foreground hover:text-foreground border border-transparent flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGpsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5 text-solar-green" />
                )}
                Use My GPS
              </button>
            </div>

            {inputMode === "search" ? (
              <div className="relative">
                <Label
                  htmlFor="loc-search"
                  className="text-xs text-muted-foreground mb-1.5 block"
                >
                  Search Indian city
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="loc-search"
                    ref={inputRef}
                    data-ocid="locanalytics.search_input"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                      setSelectedLat(null);
                      setSelectedLon(null);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 150)
                    }
                    placeholder="e.g. Jaipur, Bhadla, Chennai..."
                    className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    autoComplete="off"
                  />
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-card overflow-hidden"
                      data-ocid="locanalytics.search_input"
                    >
                      {suggestions.map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          onMouseDown={() => handleSelectCity(city)}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 flex items-center gap-2 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-solar-teal shrink-0" />
                          <span className="text-foreground">{city.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {city.lat.toFixed(2)}°N, {city.lon.toFixed(2)}°E
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedLat !== null && (
                  <p className="text-xs text-solar-teal mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedLat.toFixed(4)}°N, {selectedLon?.toFixed(4)}°E
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="lat-input"
                    className="text-xs text-muted-foreground mb-1.5 block"
                  >
                    Latitude (6°N – 38°N)
                  </Label>
                  <Input
                    id="lat-input"
                    type="number"
                    step="0.0001"
                    min="6"
                    max="38"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g. 26.9124"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lon-input"
                    className="text-xs text-muted-foreground mb-1.5 block"
                  >
                    Longitude (68°E – 98°E)
                  </Label>
                  <Input
                    id="lon-input"
                    type="number"
                    step="0.0001"
                    min="68"
                    max="98"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="e.g. 75.7873"
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>
            )}

            <Button
              data-ocid="locanalytics.search_button"
              onClick={handleAnalyse}
              disabled={!canAnalyse || isComputing}
              className="bg-solar-gold text-solar-navy font-semibold hover:bg-solar-amber transition-colors w-full sm:w-auto"
            >
              {isComputing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analysing location...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyse Location
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Loading State ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isComputing && (
          <motion.div
            data-ocid="locanalytics.loading_state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="relative">
              <Sun className="w-12 h-12 text-solar-gold animate-spin" />
              <div className="absolute inset-0 rounded-full bg-solar-gold/10 blur-md" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Analysing location...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty State ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isComputing && !result && (
          <motion.div
            data-ocid="locanalytics.empty_state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-solar-gold/10 border border-solar-gold/20 flex items-center justify-center">
                <MapPin className="w-9 h-9 text-solar-gold/60" />
              </div>
              <Sun className="w-6 h-6 text-solar-teal absolute -top-1 -right-1" />
            </div>
            <div className="text-center max-w-sm">
              <h3 className="text-lg font-semibold font-display text-foreground mb-2">
                Ready to analyse any India location
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter any location in India to see complete weather analytics of
                that place, plus full solar plant projections for a 1,000 KWp
                reference plant.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["Jaisalmer", "Bhadla", "Kochi", "Leh", "Chennai", "Pune"].map(
                (city) => {
                  const found = INDIA_CITIES.find((c) => c.name === city);
                  return (
                    <Badge
                      key={city}
                      variant="outline"
                      className="cursor-pointer border-border text-muted-foreground hover:border-solar-gold/50 hover:text-solar-gold transition-colors"
                      onClick={() => {
                        if (found) {
                          setInputMode("search");
                          handleSelectCity(found);
                          setResult(null);
                        }
                      }}
                    >
                      {city}
                    </Badge>
                  );
                },
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {!isComputing && result && (
        <>
          {/* ═══ KWp Calculator Card ════════════════════════════════════ */}
          <motion.div
            data-ocid="locanalytics.calculator.card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.02 }}
          >
            <Card className="border-solar-gold/30 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-solar-gold" />
                      KWp Calculator &amp; Reference Values
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adjust system size, tariff, and panel specs to get custom
                      production estimates
                    </p>
                  </div>
                  <Button
                    data-ocid="locanalytics.calculator.submit_button"
                    onClick={handleRecalculate}
                    disabled={isComputing || !result}
                    size="sm"
                    className="bg-solar-gold text-solar-navy font-semibold hover:bg-solar-amber transition-colors shrink-0"
                  >
                    {isComputing ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Recalculate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="calc-mwp"
                      className="text-xs text-muted-foreground mb-1.5 block"
                    >
                      System Capacity (KWp)
                    </Label>
                    <Input
                      id="calc-mwp"
                      data-ocid="locanalytics.calculator.input"
                      type="number"
                      step="1"
                      min="1"
                      max="1000000"
                      value={calcMwp}
                      onChange={(e) => setCalcMwp(e.target.value)}
                      placeholder="e.g. 1000"
                      className="bg-input border-solar-gold/20 text-foreground focus-visible:ring-solar-gold/40"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="calc-tariff"
                      className="text-xs text-muted-foreground mb-1.5 block"
                    >
                      Tariff (₹/kWh)
                    </Label>
                    <Input
                      id="calc-tariff"
                      data-ocid="locanalytics.calculator.input"
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="20"
                      value={calcTariff}
                      onChange={(e) => setCalcTariff(e.target.value)}
                      placeholder="e.g. 7.0"
                      className="bg-input border-solar-gold/20 text-foreground focus-visible:ring-solar-gold/40"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="calc-panelw"
                      className="text-xs text-muted-foreground mb-1.5 block"
                    >
                      Panel Wattage (W)
                    </Label>
                    <Input
                      id="calc-panelw"
                      data-ocid="locanalytics.calculator.input"
                      type="number"
                      step="5"
                      min="100"
                      max="800"
                      value={calcPanelW}
                      onChange={(e) => setCalcPanelW(e.target.value)}
                      placeholder="e.g. 400"
                      className="bg-input border-solar-gold/20 text-foreground focus-visible:ring-solar-gold/40"
                    />
                  </div>
                </div>

                {/* Derived info row */}
                {(() => {
                  const mwpVal = Number.parseFloat(calcMwp) || 0;
                  const panelWVal = Number.parseFloat(calcPanelW) || 400;
                  const panels =
                    panelWVal > 0 ? Math.round((mwpVal * 1000) / panelWVal) : 0;
                  const costCr = ((mwpVal / 1000) * 4.5).toFixed(2);
                  const areaM2 = Math.round(panels * 2.0);
                  return (
                    <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-solar-gold/5 border border-solar-gold/15">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="text-solar-gold font-semibold">
                          ⚡ Panels required:
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          {panels.toLocaleString()}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        ·
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="text-solar-teal font-semibold">
                          ₹ Est. system cost:
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          ₹{costCr} Cr
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        ·
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="text-solar-green font-semibold">
                          📐 Panel area:
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          ~{areaM2.toLocaleString()} m²
                        </span>
                      </span>
                    </div>
                  );
                })()}

                <p className="text-xs text-muted-foreground/70 italic flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 shrink-0" />
                  Results below update based on your input values after clicking
                  Recalculate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══ SECTION A: Weather Analytics ═══════════════════════════ */}
          <motion.section
            data-ocid="locanalytics.weather.section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-solar-teal" />
                  Weather Analytics
                  <span className="text-solar-teal">
                    — {locationName || searchQuery}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current conditions & monthly climate profile
                </p>
              </div>
            </div>

            {/* Current conditions grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              <KpiCard
                icon={<Thermometer className="w-5 h-5" />}
                label="Temperature"
                value={`${result.weather.temperature.toFixed(1)}°C`}
                sub={`Feels like ${result.weather.feelsLike.toFixed(1)}°C`}
                accent="amber"
                delay={0}
              />
              <KpiCard
                icon={<Droplets className="w-5 h-5" />}
                label="Humidity"
                value={`${result.weather.humidity.toFixed(0)}%`}
                sub={result.weather.description}
                accent="teal"
                delay={0.05}
              />
              <KpiCard
                icon={<Wind className="w-5 h-5" />}
                label="Wind Speed"
                value={`${result.weather.windSpeed.toFixed(1)} km/h`}
                sub={`Dir: ${result.weather.windDirection.toFixed(0)}°`}
                accent="teal"
                delay={0.1}
              />
              <KpiCard
                icon={<Sun className="w-5 h-5" />}
                label="UV Index"
                value={`${result.weather.uvIndex}`}
                sub={
                  result.weather.uvIndex >= 8
                    ? "Very High"
                    : result.weather.uvIndex >= 5
                      ? "Moderate"
                      : "Low"
                }
                accent="gold"
                delay={0.15}
              />
              <KpiCard
                icon={<Eye className="w-5 h-5" />}
                label="Visibility"
                value={`${result.weather.visibility.toFixed(1)} km`}
                sub={`Cloud: ${(result.weather.cloudCover * 100).toFixed(0)}%`}
                accent="green"
                delay={0.2}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <KpiCard
                icon={<Gauge className="w-5 h-5" />}
                label="Pressure"
                value={`${result.weather.pressure.toFixed(0)} hPa`}
                accent="teal"
                delay={0.22}
              />
              <KpiCard
                icon={
                  <span className="text-xl">
                    {weatherIcon(result.weather.weatherCode)}
                  </span>
                }
                label="Condition"
                value={result.weather.description}
                sub={`Cloud cover ${(result.weather.cloudCover * 100).toFixed(0)}%`}
                accent="amber"
                delay={0.24}
              />
              <KpiCard
                icon={<Sunrise className="w-5 h-5" />}
                label="Sunrise"
                value={result.sunrise}
                sub="Today (IST)"
                accent="gold"
                delay={0.26}
              />
              <KpiCard
                icon={<Sunset className="w-5 h-5" />}
                label="Sunset"
                value={result.sunset}
                sub="Today (IST)"
                accent="amber"
                delay={0.28}
              />
            </div>

            {/* Seasonal insight badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge className="bg-solar-gold/15 text-solar-gold border-solar-gold/30 border text-xs px-2 py-0.5">
                ☀️ Best Solar: {bestSolarMonths(result.lat)}
              </Badge>
              <Badge className="bg-solar-teal/15 text-solar-teal border-solar-teal/30 border text-xs px-2 py-0.5">
                🌧️ Monsoon: Jun – Sep
              </Badge>
              <Badge className="bg-solar-green/15 text-solar-green border-solar-green/30 border text-xs px-2 py-0.5">
                🌤️ Annual Clear Days: ~{estimateClearDays(result.lat)}
              </Badge>
            </div>

            {/* Monthly Climate Chart */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Monthly Climate Profile — Temperature & Cloud Cover
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart
                    data={climateChartData}
                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0.025 240)"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "oklch(0.6 0.015 230)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.28 0.025 240)" }}
                    />
                    <YAxis
                      yAxisId="temp"
                      orientation="left"
                      tick={{ fill: "oklch(0.6 0.015 230)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.28 0.025 240)" }}
                      label={{
                        value: "Temp (°C)",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "oklch(0.6 0.015 230)", fontSize: 10 },
                      }}
                    />
                    <YAxis
                      yAxisId="cloud"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fill: "oklch(0.6 0.015 230)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.28 0.025 240)" }}
                      label={{
                        value: "Cloud (%)",
                        angle: 90,
                        position: "insideRight",
                        style: { fill: "oklch(0.6 0.015 230)", fontSize: 10 },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: "oklch(0.6 0.015 230)",
                      }}
                    />
                    <Bar
                      yAxisId="temp"
                      dataKey="temp"
                      name="Avg Temp (°C)"
                      fill="oklch(0.75 0.16 55 / 0.7)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Line
                      yAxisId="cloud"
                      dataKey="cloud"
                      name="Cloud Cover (%)"
                      stroke="oklch(0.72 0.15 195)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "oklch(0.72 0.15 195)" }}
                      type="monotone"
                    />
                    <Line
                      yAxisId="temp"
                      dataKey="psh"
                      name="Peak Sun Hrs"
                      stroke="oklch(0.82 0.18 75)"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      dot={false}
                      type="monotone"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.section>

          {/* ═══ SECTION B: Solar Plant Analytics ═══════════════════════ */}
          <motion.section
            data-ocid="locanalytics.solar.section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Section header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-solar-gold" />
                Solar Plant Analytics
                <span className="text-solar-gold">
                  — {`${result.capacityKwp.toLocaleString()} KWp`} Plant
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on {result.numPanels.toLocaleString()} panels ×{" "}
                {result.panelW} W at optimal tilt (
                {result.annualOptTilt.toFixed(1)}°) · ₹{result.tariffPerKwh}/kWh
                tariff
              </p>
            </div>

            {/* 8 KPI Cards 4×2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <KpiCard
                icon={<Zap className="w-5 h-5" />}
                label="Annual Production"
                value={`${(result.annual.totalEnergyKwh / 1000).toFixed(1)} MWh/yr`}
                sub={`${result.annual.totalEnergyKwh.toFixed(0)} kWh/yr`}
                accent="gold"
                delay={0}
              />
              <KpiCard
                icon={<Sun className="w-5 h-5" />}
                label="System Capacity"
                value={`${result.capacityKwp.toLocaleString()} KWp`}
                sub={`${result.numPanels.toLocaleString()} × ${result.panelW} W`}
                accent="amber"
                delay={0.05}
              />
              <KpiCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Performance Ratio"
                value={`${(result.annual.performanceRatio * 100).toFixed(1)}%`}
                sub="System efficiency vs STC"
                accent="teal"
                delay={0.1}
              />
              <KpiCard
                icon={<BarChartIcon className="w-5 h-5" />}
                label="Specific Yield"
                value={`${result.annual.specificYield.toFixed(0)} kWh/kWp`}
                sub="Energy output per kWp"
                accent="green"
                delay={0.15}
              />
              <KpiCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Capacity Factor"
                value={`${result.capacityFactor.toFixed(1)}%`}
                sub="Actual vs max possible"
                accent="teal"
                delay={0.2}
              />
              <KpiCard
                icon={<Sun className="w-5 h-5" />}
                label="Best Month"
                value={result.bestMonthObj.monthName}
                sub={`${(result.bestMonthObj.energyKwh / 1000).toFixed(1)} MWh`}
                accent="gold"
                delay={0.25}
              />
              <KpiCard
                icon={<Leaf className="w-5 h-5" />}
                label="25yr CO₂ Offset"
                value={`${result.co2_25yr_tonnes.toFixed(0)} t`}
                sub="Lifetime CO₂ avoided"
                accent="green"
                delay={0.3}
              />
              <KpiCard
                icon={<Sun className="w-5 h-5" />}
                label="Annual Optimal Tilt"
                value={`${result.annualOptTilt.toFixed(1)}°`}
                sub="From horizontal"
                accent="amber"
                delay={0.35}
              />
            </div>

            {/* Monthly Production & Earnings Chart */}
            <Card className="border-border bg-card mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Monthly Production (MWh) & Earnings (₹ Lakhs)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-ocid="locanalytics.monthly.chart_point">
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart
                      data={monthlyChartData}
                      margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.28 0.025 240)"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "oklch(0.6 0.015 230)", fontSize: 11 }}
                        axisLine={{ stroke: "oklch(0.28 0.025 240)" }}
                      />
                      <YAxis
                        yAxisId="prod"
                        orientation="left"
                        tick={{ fill: "oklch(0.6 0.015 230)", fontSize: 11 }}
                        axisLine={{ stroke: "oklch(0.28 0.025 240)" }}
                        label={{
                          value: "MWh",
                          angle: -90,
                          position: "insideLeft",
                          style: { fill: "oklch(0.6 0.015 230)", fontSize: 10 },
                        }}
                      />
                      <YAxis
                        yAxisId="earn"
                        orientation="right"
                        tick={{ fill: "oklch(0.6 0.015 230)", fontSize: 11 }}
                        axisLine={{ stroke: "oklch(0.28 0.025 240)" }}
                        label={{
                          value: "₹L",
                          angle: 90,
                          position: "insideRight",
                          style: { fill: "oklch(0.6 0.015 230)", fontSize: 10 },
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: 11,
                          color: "oklch(0.6 0.015 230)",
                        }}
                      />
                      <Bar
                        yAxisId="prod"
                        dataKey="production"
                        name="Production (MWh)"
                        fill="oklch(0.82 0.18 75 / 0.8)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="earn"
                        dataKey="earnings"
                        name="Earnings (₹ Lakhs)"
                        stroke="oklch(0.72 0.15 195)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "oklch(0.72 0.15 195)" }}
                        type="monotone"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Production & Earnings Table */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Monthly Production & Earnings Table
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase">
                          Month
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase text-right">
                          Production (MWh)
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase text-right">
                          Earnings (₹ Lakhs)
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase text-right">
                          CO₂ Avoided (tonnes)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.monthly.map((m, idx) => {
                        const isBest =
                          m.monthName === result.bestMonthObj.monthName;
                        return (
                          <TableRow
                            key={m.month}
                            data-ocid={`locanalytics.monthly.row.${idx + 1}`}
                            className={`border-border transition-colors ${
                              isBest
                                ? "bg-solar-gold/5 hover:bg-solar-gold/10"
                                : "hover:bg-muted/30"
                            }`}
                          >
                            <TableCell className="font-medium text-sm py-2">
                              <span
                                className={
                                  isBest
                                    ? "text-solar-gold font-bold"
                                    : "text-foreground"
                                }
                              >
                                {isBest ? "⭐ " : ""}
                                {m.monthName}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm py-2 text-solar-amber">
                              {(m.energyKwh / 1000).toFixed(1)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm py-2 text-solar-teal">
                              ₹
                              {(
                                (m.energyKwh * result.tariffPerKwh) /
                                100000
                              ).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm py-2 text-solar-green">
                              {(m.co2AvoidedKg / 1000).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {/* Annual totals row */}
                      <TableRow className="border-t-2 border-solar-gold/30 bg-solar-gold/5 hover:bg-solar-gold/10 font-bold">
                        <TableCell className="text-solar-gold font-bold text-sm py-2.5">
                          Annual Total
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-solar-amber py-2.5">
                          {(result.annual.totalEnergyKwh / 1000).toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-solar-teal py-2.5">
                          ₹
                          {(
                            (result.annual.totalEnergyKwh *
                              result.tariffPerKwh) /
                            100000
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-solar-green py-2.5">
                          {(result.annual.totalCo2AvoidedKg / 1000).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </>
      )}
    </div>
  );
}

// Inline BarChart icon (lucide doesn't export BarChart3 with className support in all envs)
function BarChartIcon({ className }: { className?: string }) {
  return <TrendingUp className={className} />;
}
