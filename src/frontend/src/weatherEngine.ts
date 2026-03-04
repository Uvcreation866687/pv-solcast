/**
 * Simulated Weather Engine
 * Generates realistic weather data based on location, season, and time
 */

import { dayOfYear, solarDeclination } from "./solarEngine";
import type { HourlyForecastPoint, WeatherConditions } from "./types";

// Seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed % 233280;
  if (s < 0) s += 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// India-specific monsoon cloud cover model
// India climate zones: monsoon Jun-Sep (heavy), pre-monsoon Mar-May (hot/dry),
// post-monsoon Oct-Nov (moderate), winter Dec-Feb (dry/clear)
function indiaMonthlyCloudBase(doy: number, lat: number): number {
  // Convert doy to approximate month (1-12)
  const month = Math.min(12, Math.ceil(doy / 30.4));

  // Base cloud cover by month for typical Indian plains/peninsula
  // Northern India has stronger monsoon seasonality
  const northernBase: Record<number, number> = {
    1: 0.2, // Jan - dry, mostly clear
    2: 0.18, // Feb - dry, clear
    3: 0.15, // Mar - hot, dry, mostly clear
    4: 0.2, // Apr - hot, some haze
    5: 0.25, // May - pre-monsoon, some convective clouds
    6: 0.7, // Jun - monsoon onset
    7: 0.82, // Jul - peak monsoon
    8: 0.78, // Aug - monsoon
    9: 0.6, // Sep - retreating monsoon
    10: 0.3, // Oct - post-monsoon, cleaner
    11: 0.18, // Nov - dry season starts
    12: 0.15, // Dec - dry, clear
  };

  // Southern India (Kerala/Tamil Nadu) has different monsoon timing
  // South-West monsoon hits Kerala in Jun, retreats later
  // North-East monsoon brings rain Oct-Dec to Tamil Nadu/AP
  const southernBase: Record<number, number> = {
    1: 0.25,
    2: 0.2,
    3: 0.18,
    4: 0.25,
    5: 0.35,
    6: 0.75,
    7: 0.8,
    8: 0.75,
    9: 0.65,
    10: 0.55,
    11: 0.5, // NE monsoon
    12: 0.4,
  };

  const base =
    lat > 15 ? (northernBase[month] ?? 0.3) : (southernBase[month] ?? 0.4);
  return base;
}

// Persistent cloud state (to avoid rapid changes)
function cloudCoverWithPersistence(
  lat: number,
  lon: number,
  doy: number,
  hour: number,
): number {
  // Use a slowly varying seed to create temporal persistence
  const slowHour = Math.floor(hour / 3); // Change every 3 hours
  const seed =
    Math.floor(lat * 100) + Math.floor(lon * 10) + doy * 8 + slowHour;
  const rng = seededRandom(seed);
  const noise = seededRandom(seed + 1);

  // India-accurate monsoon seasonal cloud cover
  const base = indiaMonthlyCloudBase(doy, lat);
  const hourNoise = (noise() - 0.5) * 0.12;
  const randomVariation = (rng() - 0.5) * 0.1;
  return Math.max(0, Math.min(1, base + hourNoise + randomVariation));
}

// India-specific monthly mean temperature lookup
// Values represent typical mean daily temperature for Indian latitude bands
function indiaMeanTemp(doy: number, lat: number): number {
  const month = Math.min(12, Math.ceil(doy / 30.4));

  // Northern India (lat > 25): Delhi-like climate
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
  // Central India (lat 15-25): Nagpur/Bhopal-like
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
  // Southern India (lat < 15): Bangalore/Chennai-like
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

// Temperature from solar/seasonal/diurnal model — India-accurate
function simulateTemp(
  lat: number,
  doy: number,
  hour: number,
  rng: () => number,
): number {
  const meanTemp = indiaMeanTemp(doy, lat);

  // Diurnal range: India has ~8-12°C day-night variation
  // Peak at ~14:00-15:00, minimum at ~05:00-06:00
  const diurnalAmp = lat > 25 ? 10 : 7; // Drier north = larger swing
  const diurnal = diurnalAmp * Math.sin((Math.PI * (hour - 5)) / 18);

  return meanTemp + diurnal + (rng() - 0.5) * 2.5;
}

// Wind speed for India — moderate, stronger during monsoon
function simulateWind(_lat: number, doy: number, rng: () => number): number {
  const month = Math.min(12, Math.ceil(doy / 30.4));
  // Monsoon months (Jun-Sep) are windier in India
  const isMonsoon = month >= 6 && month <= 9;
  const isPreMonsoon = month >= 3 && month <= 5;
  let base = 3.5;
  if (isMonsoon)
    base = 6.5; // Strong monsoon winds
  else if (isPreMonsoon)
    base = 4.5; // Pre-monsoon gusty
  else base = 2.5; // Calm dry season

  return Math.max(0.5, base + rng() * 4);
}

// Wind direction simulation — India context
function simulateWindDirection(
  _lat: number,
  rng: () => number,
  doy: number,
): number {
  const month = Math.min(12, Math.ceil(doy / 30.4));
  const isMonsoon = month >= 6 && month <= 9;
  // During monsoon: south-westerly (from Arabian Sea) ~225°
  // During winter: north-easterly ~45°
  const base = isMonsoon ? 225 : 45;
  return (base + (rng() - 0.5) * 60 + 360) % 360;
}

// Pressure simulation
function simulatePressure(lat: number, doy: number, rng: () => number): number {
  // Slightly lower pressure in tropics, higher at poles
  const latEffect = Math.abs(lat) * 0.05;
  const seasonal = 3 * Math.cos((2 * Math.PI * (doy - 355)) / 365);
  return 1013 + latEffect + seasonal + (rng() - 0.5) * 8;
}

// Weather code from cloud cover
function weatherCode(cloudCover: number, rng: () => number): number {
  if (cloudCover < 0.2) return 0; // Clear
  if (cloudCover < 0.4) return 1; // Partly cloudy
  if (cloudCover < 0.65) return 2; // Cloudy
  if (cloudCover < 0.8) return rng() > 0.5 ? 3 : 2; // Overcast
  return rng() > 0.3 ? 4 : 3; // Rain likely
}

function weatherDescription(code: number): string {
  switch (code) {
    case 0:
      return "Clear Sky";
    case 1:
      return "Partly Cloudy";
    case 2:
      return "Mostly Cloudy";
    case 3:
      return "Overcast";
    case 4:
      return "Light Rain";
    default:
      return "Clear Sky";
  }
}

// UV index from solar altitude and cloud cover
function uvIndex(solarAltDeg: number, cloudCover: number): number {
  if (solarAltDeg <= 0) return 0;
  // India is tropical — UV can reach 11-12 at peak sun
  const baseUV = (solarAltDeg / 90) * 13;
  return Math.max(0, Math.round(baseUV * (1 - cloudCover * 0.75)));
}

// Visibility in km
function simulateVisibility(
  cloudCover: number,
  humidity: number,
  rng: () => number,
): number {
  const base = 20 - cloudCover * 8 - humidity * 0.05;
  return Math.max(2, Math.min(25, base + (rng() - 0.5) * 3));
}

// Get current weather conditions
export function getCurrentWeather(
  lat: number,
  lon: number,
  solarAltDeg: number,
): WeatherConditions {
  const now = new Date();
  const doy = dayOfYear(now);
  const hour = now.getUTCHours() + lon / 15;
  const seed = Math.floor(lat * 100) + Math.floor(lon * 10) + doy;
  const rng = seededRandom(seed);

  const cloudCover = cloudCoverWithPersistence(lat, lon, doy, Math.floor(hour));
  const temperature = simulateTemp(lat, doy, Math.floor(hour), rng);
  const humidity = Math.max(
    20,
    Math.min(98, 50 + cloudCover * 30 + (rng() - 0.5) * 15),
  );
  const windSpeed = simulateWind(lat, doy, rng);
  const windDir = simulateWindDirection(lat, rng, doy);
  const pressure = simulatePressure(lat, doy, rng);
  const code = weatherCode(cloudCover, rng);
  const visibility = simulateVisibility(cloudCover, humidity, rng);

  // Feels like temperature (simplified wind chill / heat index)
  const windChillEffect = windSpeed > 5 ? (-1.5 * (windSpeed - 5)) / 10 : 0;
  const humidityEffect = humidity > 60 ? (humidity - 60) * 0.05 : 0;
  const feelsLike = temperature + windChillEffect + humidityEffect;

  return {
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    windDirection: windDir,
    pressure,
    cloudCover,
    visibility,
    uvIndex: uvIndex(solarAltDeg, cloudCover),
    weatherCode: code,
    description: weatherDescription(code),
  };
}

// Get 48-hour hourly weather forecast
export function getHourlyWeatherForecast(
  lat: number,
  lon: number,
  hourlyForecast: HourlyForecastPoint[],
): Array<{
  time: Date;
  temperature: number;
  cloudCover: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  weatherCode: number;
  description: string;
}> {
  return hourlyForecast.slice(0, 48).map((h) => {
    const doy = dayOfYear(h.time);
    const hour = h.time.getUTCHours();
    const seed =
      Math.floor(lat * 100) + Math.floor(lon * 10) + doy * 24 + hour + 7777;
    const rng = seededRandom(seed);
    const code = weatherCode(h.cloudCover, rng);

    return {
      time: h.time,
      temperature: h.temperature,
      cloudCover: h.cloudCover,
      windSpeed: h.windSpeed,
      humidity: h.humidity,
      pressure: h.pressure,
      weatherCode: code,
      description: weatherDescription(code),
    };
  });
}

// Get 10-day daily weather forecast
export function getDailyWeatherForecast(
  lat: number,
  lon: number,
): Array<{
  date: Date;
  highTemp: number;
  lowTemp: number;
  avgCloudCover: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  description: string;
}> {
  const result: Array<{
    date: Date;
    highTemp: number;
    lowTemp: number;
    avgCloudCover: number;
    windSpeed: number;
    humidity: number;
    weatherCode: number;
    description: string;
  }> = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let d = 0; d < 10; d++) {
    const date = new Date(now.getTime() + d * 86400000);
    const doy = dayOfYear(date);
    const seed = Math.floor(lat * 100) + Math.floor(lon * 10) + doy;
    const rng = seededRandom(seed);

    const noonTemp = simulateTemp(lat, doy, 14, rng);
    const nightTemp = simulateTemp(lat, doy, 4, rng);
    const cloudCover = cloudCoverWithPersistence(lat, lon, doy, 12);
    const windSpeed = simulateWind(lat, doy, rng);
    const humidity = Math.max(
      20,
      Math.min(98, 55 + cloudCover * 25 + (rng() - 0.5) * 12),
    );
    const code = weatherCode(cloudCover, rng);

    result.push({
      date,
      highTemp: Math.max(noonTemp, nightTemp),
      lowTemp: Math.min(noonTemp, nightTemp),
      avgCloudCover: cloudCover,
      windSpeed,
      humidity,
      weatherCode: code,
      description: weatherDescription(code),
    });
  }

  return result;
}

export { weatherDescription };
