// Shared types for PV SolCast application

export interface PVArrayConfig {
  name: string;
  panelCount: number;
  panelWattage: number;
  tiltAngle: number;
  azimuthAngle: number;
  enabled: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  cityName: string;
}

export interface CalibrationSettings {
  efficiencyMultiplier: number;
  soilingFactor: number;
  temperatureCoefficient: number;
}

export interface SystemConfig {
  systemName: string;
  location: Location;
  arrays: PVArrayConfig[];
  calibration: CalibrationSettings;
  electricityPrice: number;
  co2EmissionFactor: number;
  unitPreference: "metric" | "imperial";
}

// Solar calculation outputs
export interface SolarPosition {
  altitude: number; // degrees above horizon
  azimuth: number; // degrees from North
  hourAngle: number;
  declination: number;
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  daylightDuration: number; // hours
}

export interface HourlyForecastPoint {
  time: Date;
  powerKw: number;
  irradiance: number; // W/m²
  temperature: number; // °C
  cloudCover: number; // 0-1
  humidity: number;
  windSpeed: number;
  pressure: number;
}

export interface DailyForecastPoint {
  date: Date;
  energyKwh: number;
  peakPowerKw: number;
  earnings: number;
  co2AvoidedKg: number;
  avgTemperature: number;
  avgCloudCover: number;
  sunrise: Date;
  sunset: Date;
}

export interface MonthlyForecastPoint {
  month: number; // 1-12
  monthName: string;
  energyKwh: number;
  earnings: number;
  co2AvoidedKg: number;
  peakPowerKw: number;
  avgCloudCover: number;
}

export interface AnnualForecast {
  totalEnergyKwh: number;
  totalEarnings: number;
  totalCo2AvoidedKg: number;
  peakPowerKw: number;
  capacityKwp: number;
  specificYield: number; // kWh/kWp
  performanceRatio: number;
}

export interface SystemLosses {
  temperatureLoss: number;
  shadingLoss: number;
  wiringLoss: number;
  inverterEfficiency: number;
  soilingLoss: number;
  mismatchLoss: number;
  iamLoss: number;
  totalEfficiency: number;
}

export interface WeatherConditions {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
  weatherCode: number; // 0=clear, 1=partly cloudy, 2=cloudy, 3=overcast, 4=rain
  description: string;
}

export type TabName =
  | "dashboard"
  | "forecast"
  | "weather"
  | "config"
  | "analytics"
  | "solarplants"
  | "locanalytics";

export interface CityOption {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}
