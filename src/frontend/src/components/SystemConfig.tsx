import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { CityOption, PVArrayConfig, SystemConfig } from "../types";

const CITIES: CityOption[] = [
  // North India
  { name: "New Delhi", latitude: 28.6139, longitude: 77.209, country: "IN" },
  { name: "Noida, UP", latitude: 28.5355, longitude: 77.391, country: "IN" },
  {
    name: "Gurgaon, Haryana",
    latitude: 28.4595,
    longitude: 77.0266,
    country: "IN",
  },
  { name: "Chandigarh", latitude: 30.7333, longitude: 76.7794, country: "IN" },
  {
    name: "Amritsar, Punjab",
    latitude: 31.634,
    longitude: 74.8723,
    country: "IN",
  },
  {
    name: "Ludhiana, Punjab",
    latitude: 30.901,
    longitude: 75.8573,
    country: "IN",
  },
  {
    name: "Jaipur, Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    country: "IN",
  },
  {
    name: "Jodhpur, Rajasthan",
    latitude: 26.2389,
    longitude: 73.0243,
    country: "IN",
  },
  {
    name: "Bikaner, Rajasthan",
    latitude: 28.0229,
    longitude: 73.3119,
    country: "IN",
  },
  {
    name: "Kota, Rajasthan",
    latitude: 25.2138,
    longitude: 75.8648,
    country: "IN",
  },
  {
    name: "Udaipur, Rajasthan",
    latitude: 24.5854,
    longitude: 73.7125,
    country: "IN",
  },
  { name: "Agra, UP", latitude: 27.1767, longitude: 78.0081, country: "IN" },
  { name: "Lucknow, UP", latitude: 26.8467, longitude: 80.9462, country: "IN" },
  {
    name: "Varanasi, UP",
    latitude: 25.3176,
    longitude: 82.9739,
    country: "IN",
  },
  { name: "Kanpur, UP", latitude: 26.4499, longitude: 80.3319, country: "IN" },
  {
    name: "Dehradun, Uttarakhand",
    latitude: 30.3165,
    longitude: 78.0322,
    country: "IN",
  },
  // West India
  {
    name: "Mumbai, Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    country: "IN",
  },
  {
    name: "Pune, Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    country: "IN",
  },
  {
    name: "Nagpur, Maharashtra",
    latitude: 21.1458,
    longitude: 79.0882,
    country: "IN",
  },
  {
    name: "Nashik, Maharashtra",
    latitude: 19.9975,
    longitude: 73.7898,
    country: "IN",
  },
  {
    name: "Aurangabad, Maharashtra",
    latitude: 19.8762,
    longitude: 75.3433,
    country: "IN",
  },
  {
    name: "Ahmedabad, Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
    country: "IN",
  },
  {
    name: "Surat, Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
    country: "IN",
  },
  {
    name: "Vadodara, Gujarat",
    latitude: 22.3072,
    longitude: 73.1812,
    country: "IN",
  },
  {
    name: "Rajkot, Gujarat",
    latitude: 22.3039,
    longitude: 70.8022,
    country: "IN",
  },
  {
    name: "Gandhinagar, Gujarat",
    latitude: 23.2156,
    longitude: 72.6369,
    country: "IN",
  },
  // South India
  {
    name: "Bengaluru, Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    country: "IN",
  },
  {
    name: "Mysuru, Karnataka",
    latitude: 12.2958,
    longitude: 76.6394,
    country: "IN",
  },
  {
    name: "Hubli, Karnataka",
    latitude: 15.3647,
    longitude: 75.124,
    country: "IN",
  },
  {
    name: "Chennai, Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    country: "IN",
  },
  {
    name: "Coimbatore, Tamil Nadu",
    latitude: 11.0168,
    longitude: 76.9558,
    country: "IN",
  },
  {
    name: "Madurai, Tamil Nadu",
    latitude: 9.9252,
    longitude: 78.1198,
    country: "IN",
  },
  {
    name: "Tiruchirappalli, TN",
    latitude: 10.7905,
    longitude: 78.7047,
    country: "IN",
  },
  {
    name: "Hyderabad, Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    country: "IN",
  },
  {
    name: "Warangal, Telangana",
    latitude: 17.9784,
    longitude: 79.5941,
    country: "IN",
  },
  {
    name: "Visakhapatnam, AP",
    latitude: 17.6868,
    longitude: 83.2185,
    country: "IN",
  },
  {
    name: "Vijayawada, AP",
    latitude: 16.5062,
    longitude: 80.648,
    country: "IN",
  },
  {
    name: "Thiruvananthapuram, Kerala",
    latitude: 8.5241,
    longitude: 76.9366,
    country: "IN",
  },
  {
    name: "Kochi, Kerala",
    latitude: 9.9312,
    longitude: 76.2673,
    country: "IN",
  },
  {
    name: "Kozhikode, Kerala",
    latitude: 11.2588,
    longitude: 75.7804,
    country: "IN",
  },
  // East India
  {
    name: "Kolkata, West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    country: "IN",
  },
  {
    name: "Howrah, West Bengal",
    latitude: 22.5958,
    longitude: 88.2636,
    country: "IN",
  },
  {
    name: "Bhubaneswar, Odisha",
    latitude: 20.2961,
    longitude: 85.8245,
    country: "IN",
  },
  {
    name: "Cuttack, Odisha",
    latitude: 20.4625,
    longitude: 85.8828,
    country: "IN",
  },
  {
    name: "Patna, Bihar",
    latitude: 25.5941,
    longitude: 85.1376,
    country: "IN",
  },
  {
    name: "Guwahati, Assam",
    latitude: 26.1445,
    longitude: 91.7362,
    country: "IN",
  },
  {
    name: "Ranchi, Jharkhand",
    latitude: 23.3441,
    longitude: 85.3096,
    country: "IN",
  },
  // Central India
  {
    name: "Bhopal, Madhya Pradesh",
    latitude: 23.2599,
    longitude: 77.4126,
    country: "IN",
  },
  {
    name: "Indore, Madhya Pradesh",
    latitude: 22.7196,
    longitude: 75.8577,
    country: "IN",
  },
  {
    name: "Gwalior, Madhya Pradesh",
    latitude: 26.2183,
    longitude: 78.1828,
    country: "IN",
  },
  {
    name: "Jabalpur, Madhya Pradesh",
    latitude: 23.1815,
    longitude: 79.9864,
    country: "IN",
  },
  {
    name: "Raipur, Chhattisgarh",
    latitude: 21.2514,
    longitude: 81.6296,
    country: "IN",
  },
];

const MAX_ARRAYS = 5;

interface SystemConfigTabProps {
  config: SystemConfig;
  onConfigChange: (config: SystemConfig) => void;
  isSaving: boolean;
}

const DEFAULT_ARRAY: PVArrayConfig = {
  name: "New Array",
  panelCount: 10,
  panelWattage: 400,
  tiltAngle: 30,
  azimuthAngle: 180,
  enabled: true,
};

export function SystemConfigTab({
  config,
  onConfigChange,
  isSaving,
}: SystemConfigTabProps) {
  const [citySearch, setCitySearch] = useState("");
  const [showCityResults, setShowCityResults] = useState(false);
  const [expandedArrays, setExpandedArrays] = useState<Set<number>>(
    new Set([0]),
  );
  // presetName reserved for future preset save feature
  const [_presetName, _setPresetName] = useState("");

  const filteredCities =
    citySearch.length > 1
      ? CITIES.filter(
          (c) =>
            c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
            c.country.toLowerCase().includes(citySearch.toLowerCase()),
        ).slice(0, 8)
      : [];

  const update = useCallback(
    (partial: Partial<SystemConfig>) =>
      onConfigChange({ ...config, ...partial }),
    [config, onConfigChange],
  );

  const updateArray = (idx: number, partial: Partial<PVArrayConfig>) => {
    const arrays = config.arrays.map((a, i) =>
      i === idx ? { ...a, ...partial } : a,
    );
    update({ arrays });
  };

  const addArray = () => {
    if (config.arrays.length >= MAX_ARRAYS) {
      toast.error(`Maximum ${MAX_ARRAYS} arrays allowed`);
      return;
    }
    const idx = config.arrays.length;
    update({
      arrays: [
        ...config.arrays,
        { ...DEFAULT_ARRAY, name: `Array ${idx + 1}` },
      ],
    });
    setExpandedArrays((s) => new Set([...s, idx]));
  };

  const removeArray = (idx: number) => {
    if (config.arrays.length <= 1) {
      toast.error("At least one array is required");
      return;
    }
    update({ arrays: config.arrays.filter((_, i) => i !== idx) });
    setExpandedArrays((s) => {
      const ns = new Set(s);
      ns.delete(idx);
      return ns;
    });
  };

  const toggleArrayExpand = (idx: number) => {
    setExpandedArrays((s) => {
      const ns = new Set(s);
      if (ns.has(idx)) ns.delete(idx);
      else ns.add(idx);
      return ns;
    });
  };

  const handleCitySelect = (city: CityOption) => {
    update({
      location: {
        latitude: city.latitude,
        longitude: city.longitude,
        cityName: city.name,
      },
    });
    setCitySearch(city.name);
    setShowCityResults(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground">
          System Configuration
        </h2>
        <Button
          data-ocid="config.save.button"
          onClick={() => {
            toast.success("Configuration saved!");
          }}
          disabled={isSaving}
          className="gradient-solar text-primary-foreground font-semibold"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Config
        </Button>
      </div>

      {/* System Info */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">
              System Name
            </Label>
            <Input
              data-ocid="config.system_name.input"
              value={config.systemName}
              onChange={(e) => update({ systemName: e.target.value })}
              className="bg-secondary border-border"
              placeholder="My Solar System"
            />
          </div>

          {/* Unit Toggle */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Unit System
            </Label>
            <div className="flex gap-2">
              <Button
                data-ocid="config.unit_metric.toggle"
                variant={
                  config.unitPreference === "metric" ? "default" : "outline"
                }
                size="sm"
                onClick={() => update({ unitPreference: "metric" })}
                className={
                  config.unitPreference === "metric"
                    ? "gradient-solar text-primary-foreground"
                    : "border-border text-muted-foreground"
                }
              >
                Metric (°C, km/h)
              </Button>
              <Button
                data-ocid="config.unit_imperial.toggle"
                variant={
                  config.unitPreference === "imperial" ? "default" : "outline"
                }
                size="sm"
                onClick={() => update({ unitPreference: "imperial" })}
                className={
                  config.unitPreference === "imperial"
                    ? "gradient-solar text-primary-foreground"
                    : "border-border text-muted-foreground"
                }
              >
                Imperial (°F, mph)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-solar-gold" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* City search */}
          <div className="relative">
            <Label className="text-sm text-muted-foreground mb-1.5 block">
              City Search
            </Label>
            <Input
              data-ocid="config.location.input"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityResults(true);
              }}
              onFocus={() => setShowCityResults(true)}
              onBlur={() => setTimeout(() => setShowCityResults(false), 200)}
              className="bg-secondary border-border"
              placeholder="Search city..."
            />
            {showCityResults && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-card overflow-hidden">
                {filteredCities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-foreground"
                    onClick={() => handleCitySelect(city)}
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {city.country}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Latitude
              </Label>
              <Input
                data-ocid="config.latitude.input"
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={config.location.latitude}
                onChange={(e) => {
                  const lat = Number.parseFloat(e.target.value) || 0;
                  const lon = config.location.longitude;
                  const latDir = lat >= 0 ? "N" : "S";
                  const lonDir = lon >= 0 ? "E" : "W";
                  const customName = `Custom Location (${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir})`;
                  setCitySearch(customName);
                  update({
                    location: {
                      ...config.location,
                      latitude: lat,
                      cityName: customName,
                    },
                  });
                }}
                className="bg-secondary border-border font-mono"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Longitude
              </Label>
              <Input
                data-ocid="config.longitude.input"
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={config.location.longitude}
                onChange={(e) => {
                  const lon = Number.parseFloat(e.target.value) || 0;
                  const lat = config.location.latitude;
                  const latDir = lat >= 0 ? "N" : "S";
                  const lonDir = lon >= 0 ? "E" : "W";
                  const customName = `Custom Location (${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir})`;
                  setCitySearch(customName);
                  update({
                    location: {
                      ...config.location,
                      longitude: lon,
                      cityName: customName,
                    },
                  });
                }}
                className="bg-secondary border-border font-mono"
              />
            </div>
          </div>

          <div className="bg-muted/20 rounded-lg p-3 text-sm text-muted-foreground">
            📍 {config.location.cityName} —{" "}
            {config.location.latitude.toFixed(4)}°,{" "}
            {config.location.longitude.toFixed(4)}°
          </div>
        </CardContent>
      </Card>

      {/* PV Arrays */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              PV Arrays ({config.arrays.length}/{MAX_ARRAYS})
            </CardTitle>
            <Button
              data-ocid="config.add_array.button"
              variant="outline"
              size="sm"
              onClick={addArray}
              disabled={config.arrays.length >= MAX_ARRAYS}
              className="border-solar-gold text-solar-gold hover:bg-solar-gold/10"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Array
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {config.arrays.map((arr, idx) => (
              <motion.div
                key={arr.name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="border border-border rounded-xl overflow-hidden">
                  {/* Array header */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors text-left"
                    onClick={() => toggleArrayExpand(idx)}
                  >
                    <Switch
                      checked={arr.enabled}
                      onCheckedChange={(v) => updateArray(idx, { enabled: v })}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-solar-gold"
                    />
                    <span className="font-medium text-foreground flex-1">
                      {arr.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {Number(arr.panelCount)} × {Number(arr.panelWattage)}W
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {(
                        (Number(arr.panelCount) * Number(arr.panelWattage)) /
                        1000
                      ).toFixed(1)}{" "}
                      kWp
                    </Badge>
                    {expandedArrays.has(idx) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Array body */}
                  <AnimatePresence>
                    {expandedArrays.has(idx) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 pt-2 space-y-4 border-t border-border bg-muted/10"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">
                              Array Name
                            </Label>
                            <Input
                              value={arr.name}
                              onChange={(e) =>
                                updateArray(idx, { name: e.target.value })
                              }
                              className="bg-secondary border-border text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">
                              Panel Count
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="500"
                              value={Number(arr.panelCount)}
                              onChange={(e) =>
                                updateArray(idx, {
                                  panelCount:
                                    Number.parseInt(e.target.value) || 1,
                                })
                              }
                              className="bg-secondary border-border text-sm font-mono"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">
                              Panel Wattage (W)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              max="700"
                              value={Number(arr.panelWattage)}
                              onChange={(e) =>
                                updateArray(idx, {
                                  panelWattage:
                                    Number.parseInt(e.target.value) || 400,
                                })
                              }
                              className="bg-secondary border-border text-sm font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Tilt Angle:{" "}
                            <span className="text-solar-gold font-mono">
                              {arr.tiltAngle}°
                            </span>
                          </Label>
                          <Slider
                            min={0}
                            max={90}
                            step={1}
                            value={[arr.tiltAngle]}
                            onValueChange={([v]) =>
                              updateArray(idx, { tiltAngle: v })
                            }
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0° (flat)</span>
                            <span>45°</span>
                            <span>90° (vertical)</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Azimuth (Orientation):{" "}
                            <span className="text-solar-gold font-mono">
                              {arr.azimuthAngle}°
                            </span>
                            <span className="ml-1 text-muted-foreground">
                              (
                              {arr.azimuthAngle < 45 || arr.azimuthAngle > 315
                                ? "North"
                                : arr.azimuthAngle < 135
                                  ? "East"
                                  : arr.azimuthAngle < 225
                                    ? "South"
                                    : "West"}
                              )
                            </span>
                          </Label>
                          <Slider
                            min={0}
                            max={360}
                            step={5}
                            value={[arr.azimuthAngle]}
                            onValueChange={([v]) =>
                              updateArray(idx, { azimuthAngle: v })
                            }
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0° N</span>
                            <span>90° E</span>
                            <span>180° S</span>
                            <span>270° W</span>
                            <span>360° N</span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            data-ocid={`config.array.delete_button.${idx + 1}`}
                            variant="destructive"
                            size="sm"
                            onClick={() => removeArray(idx)}
                            disabled={config.arrays.length <= 1}
                            className="gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Array
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Calibration */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Calibration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Efficiency Multiplier:{" "}
              <span className="text-solar-gold font-mono">
                {config.calibration.efficiencyMultiplier.toFixed(2)}
              </span>
            </Label>
            <Slider
              min={0.5}
              max={1.2}
              step={0.01}
              value={[config.calibration.efficiencyMultiplier]}
              onValueChange={([v]) =>
                update({
                  calibration: {
                    ...config.calibration,
                    efficiencyMultiplier: v,
                  },
                })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.5 (degraded)</span>
              <span>1.0 (nominal)</span>
              <span>1.2 (optimized)</span>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Soiling Factor:{" "}
              <span className="text-solar-gold font-mono">
                {config.calibration.soilingFactor.toFixed(2)}
              </span>
            </Label>
            <Slider
              min={0.8}
              max={1.0}
              step={0.01}
              value={[config.calibration.soilingFactor]}
              onValueChange={([v]) =>
                update({
                  calibration: { ...config.calibration, soilingFactor: v },
                })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.8 (dirty)</span>
              <span>0.9</span>
              <span>1.0 (clean)</span>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">
              Temperature Coefficient (%/°C)
            </Label>
            <Input
              type="number"
              step="0.001"
              min="-0.01"
              max="0"
              value={config.calibration.temperatureCoefficient}
              onChange={(e) =>
                update({
                  calibration: {
                    ...config.calibration,
                    temperatureCoefficient:
                      Number.parseFloat(e.target.value) || -0.004,
                  },
                })
              }
              className="bg-secondary border-border font-mono w-40"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Typical: -0.004 to -0.003 /°C
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Economics */}
      <Card className="card-solar">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Economics & Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">
              Electricity Price (₹/kWh)
            </Label>
            <Input
              data-ocid="config.electricity_price.input"
              type="number"
              step="0.01"
              min="0"
              value={config.electricityPrice}
              onChange={(e) =>
                update({
                  electricityPrice: Number.parseFloat(e.target.value) || 0.085,
                })
              }
              className="bg-secondary border-border font-mono"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">
              CO₂ Factor (kg/kWh)
            </Label>
            <Input
              data-ocid="config.co2_factor.input"
              type="number"
              step="0.01"
              min="0"
              value={config.co2EmissionFactor}
              onChange={(e) =>
                update({
                  co2EmissionFactor: Number.parseFloat(e.target.value) || 0.42,
                })
              }
              className="bg-secondary border-border font-mono"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          data-ocid="config.save.button"
          onClick={() => toast.success("Configuration saved!")}
          disabled={isSaving}
          className="gradient-solar text-primary-foreground font-semibold px-8"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Configuration
        </Button>
      </div>
    </motion.div>
  );
}
