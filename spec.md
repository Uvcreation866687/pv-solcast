# PV SolCast

## Current State
The app has 6 tabs: Dashboard, Forecast, Weather, System Config, Analytics, Solar Plants. It uses a solarEngine.ts and weatherEngine.ts for all calculations, entirely in-browser. The TabName type covers dashboard|forecast|weather|config|analytics|solarplants.

## Requested Changes (Diff)

### Add
- A new **"Location Analytics"** tab (tab id: `locanalytics`) added to the nav after "Solar Plants"
- `LocationAnalytics` component at `src/frontend/src/components/LocationAnalytics.tsx`
- The tab has two sub-sections:
  1. **Weather Analytics** for any India location entered by the user
  2. **Solar Plant Analytics** for that same location with full KPIs

### Modify
- `types.ts`: Add `"locanalytics"` to the `TabName` union
- `App.tsx`: Add the new tab to NAV_TABS and render `<LocationAnalytics>` when `activeTab === "locanalytics"`. Pass required engine functions and config defaults.

### Remove
- Nothing removed

## Implementation Plan

### LocationAnalytics component features

**Location Input section**
- Text input for city name (with autocomplete from the same 50+ India cities list used in SystemConfig) OR manual lat/lon inputs
- Search button that triggers recalculation
- Displays resolved location name + lat/lon

**Weather Analytics section** (computed via weatherEngine.ts + solarEngine.ts for the searched location)
- Current conditions card grid: Temperature, Feels Like, Humidity, Wind Speed, Wind Direction, Pressure, UV Index, Visibility, Cloud Cover, Weather Description
- Monthly climate overview: 12-month bar/line chart showing avg temperature and cloud cover per month (using monthly means from the weather engine logic)
- Seasonal summary: Best solar months, worst (monsoon) months, annual avg sunshine hours estimate
- Sunrise/Sunset times for today at that location

**Solar Plant Analytics section** (computed via solarEngine.ts for the searched location using a default 1 MWp system: 1000 kWp, tilt=lat×0.87, azimuth=180°)
- KPI cards (8 cards in a responsive grid):
  1. Annual Production (MWh/year)
  2. System Capacity (kWp — the default 1 MWp reference plant)
  3. Performance Ratio (%)
  4. Specific Yield (kWh/kWp)
  5. Capacity Factor (%)
  6. Best Month (name + MWh)
  7. 25yr CO₂ Offset (tonnes, assuming 0.8% annual degradation)
  8. Annual Optimal Tilt (degrees)
- Monthly Production & Earnings table/chart: 12 months, columns for Month, Energy (MWh), Earnings (₹ lakhs at ₹7/kWh), CO₂ Avoided (tonnes)
- Bar chart of Monthly Production (MWh) with earnings line overlay (dual-axis or tooltip)

### Calculations approach
- Use `generateMonthlyForecast` and `generateAnnualForecast` from solarEngine with a synthetic SystemConfig built from the searched location:
  - arrays: [{panelCount: 2500, panelWattage: 400, tiltAngle: lat×0.87, azimuthAngle: 180, enabled: true}] → ~1 MWp
  - calibration: {efficiencyMultiplier: 1.0, soilingFactor: 0.95, temperatureCoefficient: -0.004}
  - electricityPrice: 7 (₹/kWh = 0.085 USD equivalent)
  - co2EmissionFactor: 0.71
- Capacity Factor = annualEnergy / (capacityKwp × 8760) × 100
- 25yr CO₂ = sum of (annualCo2 × degradation_factor_year) for 25 years (0.8% annual degradation)
- Specific Yield = annualEnergy / capacityKwp
- Performance Ratio = specificYield / peakSunHoursAtLocation (estimate peak sun hours from annual irradiance)

### India cities list
Reuse the same city data already in SystemConfig.tsx (50+ cities). Export it or duplicate it in LocationAnalytics.

### data-ocid markers
- `locanalytics.search_input`
- `locanalytics.search_button`
- `locanalytics.weather.section`
- `locanalytics.solar.section`
- `locanalytics.monthly.chart_point`
- `nav.locanalytics.tab`
