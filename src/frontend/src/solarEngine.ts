/**
 * Solar Physics Calculation Engine
 * Implements standard solar geometry formulas for PV system modeling
 */

import type {
  AnnualForecast,
  DailyForecastPoint,
  HourlyForecastPoint,
  MonthlyForecastPoint,
  SolarPosition,
  SunTimes,
  SystemConfig,
  SystemLosses,
} from "./types";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// Day of year (1-365)
export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Solar declination angle in degrees
export function solarDeclination(doy: number): number {
  return 23.45 * Math.sin((360 / 365) * (284 + doy) * DEG2RAD);
}

// Equation of time in minutes
export function equationOfTime(doy: number): number {
  const B = ((2 * Math.PI) / 364) * (doy - 81);
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

// Solar hour angle in degrees
export function solarHourAngle(longitude: number, dateUTC: Date): number {
  const doy = dayOfYear(dateUTC);
  const eot = equationOfTime(doy);
  const utcHours =
    dateUTC.getUTCHours() +
    dateUTC.getUTCMinutes() / 60 +
    dateUTC.getUTCSeconds() / 3600;
  const solarTimeHours = utcHours + longitude / 15 + eot / 60;
  return 15 * (solarTimeHours - 12);
}

// Solar altitude angle in degrees
export function solarAltitude(
  latDeg: number,
  declinationDeg: number,
  hourAngleDeg: number,
): number {
  const lat = latDeg * DEG2RAD;
  const dec = declinationDeg * DEG2RAD;
  const h = hourAngleDeg * DEG2RAD;
  const sinAlt =
    Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(h);
  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG;
}

// Solar azimuth angle in degrees (clockwise from North)
export function solarAzimuth(
  latDeg: number,
  declinationDeg: number,
  hourAngleDeg: number,
  altitudeDeg: number,
): number {
  const lat = latDeg * DEG2RAD;
  const dec = declinationDeg * DEG2RAD;
  const alt = altitudeDeg * DEG2RAD;

  if (Math.abs(Math.cos(alt)) < 1e-10) return 180;

  const cosAz =
    (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) /
    (Math.cos(alt) * Math.cos(lat));

  const az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD2DEG;
  return hourAngleDeg < 0 ? az : 360 - az;
}

// Get full solar position
export function getSolarPosition(
  latDeg: number,
  lonDeg: number,
  date: Date,
): SolarPosition {
  const doy = dayOfYear(date);
  const dec = solarDeclination(doy);
  const h = solarHourAngle(lonDeg, date);
  const alt = solarAltitude(latDeg, dec, h);
  const az = solarAzimuth(latDeg, dec, h, alt);
  return { altitude: alt, azimuth: az, hourAngle: h, declination: dec };
}

// Clear sky GHI (W/m²) using simplified Kasten/Young model
export function clearSkyIrradiance(altitudeDeg: number, doy: number): number {
  if (altitudeDeg <= 0) return 0;

  const altRad = altitudeDeg * DEG2RAD;
  // Extraterrestrial radiation
  const et = 1367 * (1 + 0.033 * Math.cos((2 * Math.PI * doy) / 365));

  // Air mass correction (Kasten/Young formula)
  const am =
    1 / (Math.sin(altRad) + 0.50572 * (altitudeDeg + 6.07995) ** -1.6364);

  // Atmospheric transmittance
  const clearness = 0.7;
  const tau = clearness * am ** -0.678;

  return et * Math.sin(altRad) * tau;
}

// Panel-level POA (Plane of Array) irradiance
export function panelIrradiance(
  ghiWm2: number,
  tiltDeg: number,
  panelAzimuthDeg: number,
  solarAltDeg: number,
  solarAzDeg: number,
): number {
  if (solarAltDeg <= 0) return 0;

  const tilt = tiltDeg * DEG2RAD;
  const panelAz = panelAzimuthDeg * DEG2RAD;
  const solarAlt = solarAltDeg * DEG2RAD;
  const solarAz = solarAzDeg * DEG2RAD;

  // Angle of incidence
  const cosTheta =
    Math.sin(solarAlt) * Math.cos(tilt) +
    Math.cos(solarAlt) * Math.sin(tilt) * Math.cos(solarAz - panelAz);

  const directComponent = ghiWm2 * Math.max(0, cosTheta);
  // Diffuse and reflected components (simplified isotropic model)
  const diffuse = (ghiWm2 * 0.1 * (1 + Math.cos(tilt))) / 2;
  const reflected = (ghiWm2 * 0.02 * (1 - Math.cos(tilt))) / 2;

  return Math.max(0, directComponent + diffuse + reflected);
}

// Optimal tilt angle for a given date (degrees)
export function optimalTiltAngle(latDeg: number, doy: number): number {
  const dec = solarDeclination(doy);
  const optimal = latDeg - dec;
  return Math.max(0, Math.min(90, optimal));
}

// Annual optimal tilt angle (degrees)
export function annualOptimalTilt(latDeg: number): number {
  return Math.abs(latDeg) * 0.87;
}

// Location-based soiling factor for India (returns value 0.80-0.95)
// Based on climate zone: desert = high dust = low soiling factor; heavy rain = clean panels = high soiling factor
export function locationSoilingFactor(lat: number, lon: number): number {
  // Rajasthan desert (Jaisalmer, Bikaner, Barmer, Jodhpur)
  if (lat >= 24 && lat <= 30 && lon >= 69 && lon <= 76) return 0.82;
  // Gujarat arid/semi-arid
  if (lat >= 20 && lat < 24.5 && lon >= 68 && lon <= 74) return 0.84;
  // Ladakh / extreme high altitude (dry but harsh UV)
  if (lat >= 32) return 0.88;
  // North India plains (IGP dusty belt: Punjab, Haryana, UP, Delhi)
  if (lat >= 25 && lon >= 75 && lon <= 88) return 0.86;
  // NE India (Assam, Meghalaya – very high rainfall, panels stay clean)
  if (lon >= 88 && lat >= 22 && lat <= 28) return 0.93;
  // Eastern India (West Bengal, Odisha – humid monsoon)
  if (lon >= 84 && lat <= 25) return 0.91;
  // Kerala / extreme south-west (heaviest monsoon rainfall)
  if (lat <= 12 && lon < 76) return 0.94;
  // South India coastal (rain-washed, Tamil Nadu, AP coast)
  if (lat <= 15 && lon >= 76) return 0.92;
  // Southern Deccan (Karnataka, Andhra, Telangana)
  if (lat <= 18 && lon >= 74 && lon <= 84) return 0.9;
  // Central India (MP, Chhattisgarh, Vidarbha)
  if (lat >= 18 && lat <= 25 && lon >= 74 && lon <= 82) return 0.87;
  // Default moderate
  return 0.89;
}

// Location-based shading loss for India (returns fraction 0.01-0.06)
// Based on terrain and density: flat desert = minimal shading; mountains/urban = higher
export function locationShadingLoss(lat: number, lon: number): number {
  // Ladakh / Himachal / Uttarakhand mountains (valley shading, hillsides)
  if (lat >= 30 && lon <= 82) return 0.055;
  // NE hilly terrain
  if (lon >= 90 && lat >= 22) return 0.05;
  // Open flat desert (Rajasthan, Gujarat Rann) — minimal shading
  if (lat >= 24 && lat <= 30 && lon >= 69 && lon <= 76) return 0.01;
  // Dense metro areas (check within ~0.5 degree radius of major cities)
  const metros = [
    { lat: 19.076, lon: 72.877 }, // Mumbai
    { lat: 28.61, lon: 77.21 }, // Delhi
    { lat: 22.57, lon: 88.36 }, // Kolkata
    { lat: 13.08, lon: 80.27 }, // Chennai
    { lat: 17.38, lon: 78.49 }, // Hyderabad
    { lat: 12.97, lon: 77.59 }, // Bengaluru
    { lat: 18.52, lon: 73.86 }, // Pune
    { lat: 23.02, lon: 72.57 }, // Ahmedabad
  ];
  for (const m of metros) {
    if (Math.sqrt((lat - m.lat) ** 2 + (lon - m.lon) ** 2) < 0.6) return 0.045;
  }
  // Coastal vegetation belt (western ghats coast, eastern coast)
  if (lon >= 74 && lon <= 77 && lat <= 20) return 0.035;
  if (lon >= 79 && lon <= 82 && lat <= 15) return 0.035;
  // Default open semi-rural
  return 0.03;
}

// System power output in kW accounting for all losses
export function systemPowerOutput(
  config: SystemConfig,
  irradianceWm2: number,
  tempC: number,
): number {
  const { arrays, calibration } = config;
  let totalPowerW = 0;

  for (const arr of arrays) {
    if (!arr.enabled) continue;
    const stcPowerW = Number(arr.panelCount) * Number(arr.panelWattage);
    const irradianceFactor = irradianceWm2 / 1000;

    // Temperature derate
    const tempDerate = 1 + calibration.temperatureCoefficient * (tempC - 25);

    const powerW =
      stcPowerW *
      irradianceFactor *
      calibration.efficiencyMultiplier *
      calibration.soilingFactor *
      Math.max(0.5, tempDerate);

    totalPowerW += powerW;
  }

  return totalPowerW / 1000; // kW
}

// Sunrise time (Date object in UTC)
export function sunriseTime(latDeg: number, lonDeg: number, date: Date): Date {
  const doy = dayOfYear(date);
  const dec = solarDeclination(doy);
  const lat = latDeg * DEG2RAD;
  const decRad = dec * DEG2RAD;

  const cosHa =
    (-Math.sin(lat) * Math.sin(decRad)) / (Math.cos(lat) * Math.cos(decRad));

  if (cosHa > 1) {
    // Polar night
    const d = new Date(date);
    d.setUTCHours(12, 0, 0, 0);
    return d;
  }
  if (cosHa < -1) {
    // Midnight sun
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  const haRad = Math.acos(cosHa);
  const haDeg = haRad * RAD2DEG;
  const eot = equationOfTime(doy);
  const sunriseHours = 12 - haDeg / 15 - lonDeg / 15 - eot / 60;

  const d = new Date(date);
  const h = Math.floor(sunriseHours);
  const m = Math.floor((sunriseHours - h) * 60);
  const s = Math.floor(((sunriseHours - h) * 60 - m) * 60);
  d.setUTCHours(h, m, s, 0);
  return d;
}

// Sunset time
export function sunsetTime(latDeg: number, lonDeg: number, date: Date): Date {
  const doy = dayOfYear(date);
  const dec = solarDeclination(doy);
  const lat = latDeg * DEG2RAD;
  const decRad = dec * DEG2RAD;

  const cosHa =
    (-Math.sin(lat) * Math.sin(decRad)) / (Math.cos(lat) * Math.cos(decRad));

  if (cosHa > 1) {
    const d = new Date(date);
    d.setUTCHours(12, 0, 0, 0);
    return d;
  }
  if (cosHa < -1) {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 0);
    return d;
  }

  const haRad = Math.acos(cosHa);
  const haDeg = haRad * RAD2DEG;
  const eot = equationOfTime(doy);
  const sunsetHours = 12 + haDeg / 15 - lonDeg / 15 - eot / 60;

  const d = new Date(date);
  const h = Math.floor(sunsetHours);
  const m = Math.floor((sunsetHours - h) * 60);
  const s = Math.floor(((sunsetHours - h) * 60 - m) * 60);
  d.setUTCHours(h, m, s, 0);
  return d;
}

// Solar noon
export function solarNoon(lonDeg: number, date: Date): Date {
  const doy = dayOfYear(date);
  const eot = equationOfTime(doy);
  const solarNoonHours = 12 - lonDeg / 15 - eot / 60;

  const d = new Date(date);
  const h = Math.floor(solarNoonHours);
  const m = Math.floor((solarNoonHours - h) * 60);
  const s = Math.floor(((solarNoonHours - h) * 60 - m) * 60);
  d.setUTCHours(h, m, s, 0);
  return d;
}

// Simple seeded random (for deterministic weather)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// India-specific monthly cloud cover lookup (for solar calculations)
function indiaCloudBase(doy: number, lat: number): number {
  const month = Math.min(12, Math.ceil(doy / 30.4));

  // Northern India (lat > 25): Strong monsoon Jun-Sep, dry rest of year
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
  // Central India (lat 15-25)
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
  // Southern India (lat < 15)
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

// Cloud cover factor (0-1 = clear to overcast)
function getCloudCover(
  doy: number,
  hour: number,
  lat: number,
  rng: () => number,
): number {
  // India-accurate seasonal cloud cover based on monsoon patterns
  const seasonalBase = indiaCloudBase(doy, lat);
  // Afternoon slightly cloudier (convective clouds)
  const hourFactor = 1 + 0.08 * Math.sin((Math.PI * (hour - 8)) / 12);
  const noise = (rng() - 0.5) * 0.12;
  return Math.max(0, Math.min(1, seasonalBase * hourFactor + noise));
}

// India-specific monthly mean temperature lookup (mirrors weatherEngine)
function indiaMeanTempSolar(doy: number, lat: number): number {
  const month = Math.min(12, Math.ceil(doy / 30.4));
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

// Temperature simulation — India-accurate
function simulateTemperature(
  lat: number,
  doy: number,
  hour: number,
  rng: () => number,
): number {
  const meanTemp = indiaMeanTempSolar(doy, lat);
  // Diurnal range: drier north has larger swing (~10°C), south smaller (~7°C)
  const diurnalAmp = lat > 25 ? 10 : 7;
  const diurnal = diurnalAmp * Math.sin((Math.PI * (hour - 5)) / 18);
  const noise = (rng() - 0.5) * 2.5;
  return meanTemp + diurnal + noise;
}

// Generate hourly forecast data points
export function generateHourlyForecast(
  config: SystemConfig,
  hours = 360,
): HourlyForecastPoint[] {
  const { location } = config;
  const now = new Date();
  const result: HourlyForecastPoint[] = [];

  for (let i = 0; i < hours; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    const doy = dayOfYear(time);
    const hour = time.getUTCHours();
    const seed = Math.floor(location.latitude * 100) + doy * 24 + hour;
    const rng = seededRandom(seed);

    const solarPos = getSolarPosition(
      location.latitude,
      location.longitude,
      time,
    );
    const clearSky = clearSkyIrradiance(solarPos.altitude, doy);
    const cloudCover = getCloudCover(doy, hour, location.latitude, rng);
    const irradiance = clearSky * (1 - cloudCover * 0.85);
    const temperature = simulateTemperature(location.latitude, doy, hour, rng);
    const humidity = 40 + cloudCover * 30 + (rng() - 0.5) * 10;
    const windSpeed = 3 + rng() * 8 + Math.abs(location.latitude) / 20;
    const pressure = 1013 + (rng() - 0.5) * 20;

    // Compute POA for each array
    let totalIrradiance = 0;
    let arrayCount = 0;
    for (const arr of config.arrays) {
      if (!arr.enabled) continue;
      const poa = panelIrradiance(
        irradiance,
        arr.tiltAngle,
        arr.azimuthAngle,
        solarPos.altitude,
        solarPos.azimuth,
      );
      totalIrradiance += poa;
      arrayCount++;
    }
    const avgIrradiance = arrayCount > 0 ? totalIrradiance / arrayCount : 0;

    const powerKw = systemPowerOutput(config, avgIrradiance, temperature);

    result.push({
      time,
      powerKw: Math.max(0, powerKw),
      irradiance: Math.max(0, avgIrradiance),
      temperature,
      cloudCover,
      humidity: Math.max(20, Math.min(100, humidity)),
      windSpeed: Math.max(0, windSpeed),
      pressure,
    });
  }

  return result;
}

// Generate daily forecast
export function generateDailyForecast(
  config: SystemConfig,
  days = 15,
): DailyForecastPoint[] {
  const result: DailyForecastPoint[] = [];
  const { location } = config;
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  for (let d = 0; d < days; d++) {
    const date = new Date(now.getTime() + d * 86400000);
    const doy = dayOfYear(date);

    let energyKwh = 0;
    let peakPowerKw = 0;
    let sumTemp = 0;
    let sumCloud = 0;
    const hourCount = 24;

    for (let h = 0; h < hourCount; h++) {
      const t = new Date(date.getTime() + h * 3600000);
      const seed = Math.floor(location.latitude * 100) + doy * 24 + h;
      const rng = seededRandom(seed);
      const solarPos = getSolarPosition(
        location.latitude,
        location.longitude,
        t,
      );
      const clearSky = clearSkyIrradiance(solarPos.altitude, doy);
      const cloudCover = getCloudCover(doy, h, location.latitude, rng);
      const irradiance = clearSky * (1 - cloudCover * 0.85);
      const temp = simulateTemperature(location.latitude, doy, h, rng);

      let avgIrr = 0;
      let arrCount = 0;
      for (const arr of config.arrays) {
        if (!arr.enabled) continue;
        avgIrr += panelIrradiance(
          irradiance,
          arr.tiltAngle,
          arr.azimuthAngle,
          solarPos.altitude,
          solarPos.azimuth,
        );
        arrCount++;
      }
      if (arrCount > 0) avgIrr /= arrCount;

      const power = Math.max(0, systemPowerOutput(config, avgIrr, temp));
      energyKwh += power; // 1 hour intervals = kWh
      if (power > peakPowerKw) peakPowerKw = power;
      sumTemp += temp;
      sumCloud += cloudCover;
    }

    const earnings = energyKwh * config.electricityPrice;
    const co2AvoidedKg = energyKwh * config.co2EmissionFactor;

    result.push({
      date,
      energyKwh: Math.max(0, energyKwh),
      peakPowerKw,
      earnings,
      co2AvoidedKg,
      avgTemperature: sumTemp / hourCount,
      avgCloudCover: sumCloud / hourCount,
      sunrise: sunriseTime(location.latitude, location.longitude, date),
      sunset: sunsetTime(location.latitude, location.longitude, date),
    });
  }

  return result;
}

const MONTH_NAMES = [
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

// Generate monthly forecast
export function generateMonthlyForecast(
  config: SystemConfig,
): MonthlyForecastPoint[] {
  const { location } = config;
  const result: MonthlyForecastPoint[] = [];
  const year = new Date().getFullYear();

  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    let monthEnergy = 0;
    let peakPowerKw = 0;
    let sumCloud = 0;
    let dataPoints = 0;

    for (let d = 1; d <= daysInMonth; d += 2) {
      // Sample every 2 days for performance
      const date = new Date(year, m, d);
      const doy = dayOfYear(date);

      for (let h = 0; h < 24; h++) {
        const t = new Date(date.getTime() + h * 3600000);
        const seed = Math.floor(location.latitude * 100) + doy * 24 + h;
        const rng = seededRandom(seed);
        const solarPos = getSolarPosition(
          location.latitude,
          location.longitude,
          t,
        );
        const clearSky = clearSkyIrradiance(solarPos.altitude, doy);
        const cloudCover = getCloudCover(doy, h, location.latitude, rng);
        const irr = clearSky * (1 - cloudCover * 0.85);
        const temp = simulateTemperature(location.latitude, doy, h, rng);

        let avgIrr = 0;
        let arrCount = 0;
        for (const arr of config.arrays) {
          if (!arr.enabled) continue;
          avgIrr += panelIrradiance(
            irr,
            arr.tiltAngle,
            arr.azimuthAngle,
            solarPos.altitude,
            solarPos.azimuth,
          );
          arrCount++;
        }
        if (arrCount > 0) avgIrr /= arrCount;

        const power = Math.max(0, systemPowerOutput(config, avgIrr, temp));
        monthEnergy += power;
        if (power > peakPowerKw) peakPowerKw = power;
        sumCloud += cloudCover;
        dataPoints++;
      }
    }

    // Scale up sampled days
    const scaleFactor = daysInMonth / Math.ceil(daysInMonth / 2);
    monthEnergy *= scaleFactor;

    result.push({
      month: m + 1,
      monthName: MONTH_NAMES[m],
      energyKwh: Math.max(0, monthEnergy),
      earnings: monthEnergy * config.electricityPrice,
      co2AvoidedKg: monthEnergy * config.co2EmissionFactor,
      peakPowerKw,
      avgCloudCover: dataPoints > 0 ? sumCloud / dataPoints : 0.3,
    });
  }

  return result;
}

// Generate annual forecast summary
export function generateAnnualForecast(
  config: SystemConfig,
  monthlyData: MonthlyForecastPoint[],
): AnnualForecast {
  const totalEnergyKwh = monthlyData.reduce((s, m) => s + m.energyKwh, 0);
  const totalEarnings = monthlyData.reduce((s, m) => s + m.earnings, 0);
  const totalCo2 = monthlyData.reduce((s, m) => s + m.co2AvoidedKg, 0);
  const peakPowerKw = Math.max(...monthlyData.map((m) => m.peakPowerKw));

  const capacityKwp = config.arrays.reduce(
    (s, a) =>
      s +
      (a.enabled ? (Number(a.panelCount) * Number(a.panelWattage)) / 1000 : 0),
    0,
  );

  const specificYield = capacityKwp > 0 ? totalEnergyKwh / capacityKwp : 0;
  const performanceRatio = specificYield > 0 ? specificYield / 1000 : 0.78;

  return {
    totalEnergyKwh,
    totalEarnings,
    totalCo2AvoidedKg: totalCo2,
    peakPowerKw,
    capacityKwp,
    specificYield,
    performanceRatio: Math.min(1, Math.max(0.5, performanceRatio)),
  };
}

// Calculate system losses
export function calculateSystemLosses(
  config: SystemConfig,
  currentTempC: number,
): SystemLosses {
  const tempLoss =
    config.calibration.temperatureCoefficient * Math.max(0, currentTempC - 25);
  const soilingLoss = 1 - config.calibration.soilingFactor;
  const shadingLoss = locationShadingLoss(
    config.location.latitude,
    config.location.longitude,
  );

  return {
    temperatureLoss: Math.abs(tempLoss),
    shadingLoss,
    wiringLoss: 0.02,
    inverterEfficiency: 0.97,
    soilingLoss,
    mismatchLoss: 0.01,
    iamLoss: 0.015,
    totalEfficiency:
      (1 - Math.abs(tempLoss)) *
      (1 - shadingLoss) *
      0.98 *
      0.97 *
      config.calibration.soilingFactor *
      0.99 *
      0.985 *
      config.calibration.efficiencyMultiplier,
  };
}

// System total capacity in kWp
export function systemCapacityKwp(config: SystemConfig): number {
  return config.arrays.reduce(
    (s, a) =>
      s +
      (a.enabled ? (Number(a.panelCount) * Number(a.panelWattage)) / 1000 : 0),
    0,
  );
}

// Today's energy generation (forecast)
export function todayEnergyKwh(
  hourlyForecast: HourlyForecastPoint[],
  now: Date,
): number {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  return hourlyForecast
    .filter((p) => p.time >= todayStart && p.time <= todayEnd)
    .reduce((sum, p) => sum + p.powerKw, 0);
}
