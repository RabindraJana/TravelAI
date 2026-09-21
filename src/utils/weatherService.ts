import { DestinationWeatherForecast, DayWeatherForecast } from '../types';

interface DestinationCoords {
  lat: number;
  lon: number;
  cleanName: string;
  defaultHigh: number;
  defaultLow: number;
  advisoryTip: string;
}

const KNOWN_DESTINATIONS: Record<string, DestinationCoords> = {
  varanasi: {
    lat: 25.3176,
    lon: 82.9739,
    cleanName: 'Varanasi',
    defaultHigh: 32,
    defaultLow: 21,
    advisoryTip: 'Pleasant mornings along the ghats; warm afternoons. Light cottons & sun protection recommended.',
  },
  kolkata: {
    lat: 22.5726,
    lon: 88.3639,
    cleanName: 'Kolkata',
    defaultHigh: 31,
    defaultLow: 23,
    advisoryTip: 'Warm and humid tropical breeze. Carry breathable fabrics and stay hydrated while exploring.',
  },
  leh: {
    lat: 34.1526,
    lon: 77.5771,
    cleanName: 'Leh Ladakh',
    defaultHigh: 14,
    defaultLow: 2,
    advisoryTip: 'Crisp high-altitude chill with cold nights. Heavy woolens, thermal layers, and UV protection essential.',
  },
  ladakh: {
    lat: 34.1526,
    lon: 77.5771,
    cleanName: 'Leh Ladakh',
    defaultHigh: 14,
    defaultLow: 2,
    advisoryTip: 'Crisp high-altitude chill with cold nights. Heavy woolens, thermal layers, and UV protection essential.',
  },
  goa: {
    lat: 15.2993,
    lon: 74.124,
    cleanName: 'Goa',
    defaultHigh: 31,
    defaultLow: 24,
    advisoryTip: 'Tropical coastal warmth with gentle sea breezes. Ideal for beach excursions; swimwear & sunglasses ready.',
  },
  jaipur: {
    lat: 26.9124,
    lon: 75.7873,
    cleanName: 'Jaipur',
    defaultHigh: 33,
    defaultLow: 20,
    advisoryTip: 'Clear desert sunshine during the day with cool evenings. Comfortable walking shoes and hats advised.',
  },
  mumbai: {
    lat: 19.076,
    lon: 72.8777,
    cleanName: 'Mumbai',
    defaultHigh: 32,
    defaultLow: 24,
    advisoryTip: 'Humid coastal weather. Carry a light windbreaker and comfortable footwear for city transit.',
  },
  delhi: {
    lat: 28.6139,
    lon: 77.209,
    cleanName: 'New Delhi',
    defaultHigh: 32,
    defaultLow: 19,
    advisoryTip: 'Moderate daytime warmth with dry air. Keep moisturiser and a reusable water flask handy.',
  },
  manali: {
    lat: 32.2432,
    lon: 77.1892,
    cleanName: 'Manali',
    defaultHigh: 18,
    defaultLow: 7,
    advisoryTip: 'Cool mountain climate. Fleece jackets and sturdy trail shoes recommended for valley trails.',
  },
  rishikesh: {
    lat: 30.0869,
    lon: 78.2676,
    cleanName: 'Rishikesh',
    defaultHigh: 27,
    defaultLow: 16,
    advisoryTip: 'Refreshing river breezes with mild evenings. Great weather for rafting and outdoor yoga sessions.',
  },
};

/**
 * Extracts a searchable city key from destination strings like "Varanasi (BSB)" or "Leh Ladakh, Himalayas"
 */
export function extractCityKey(destination: string): string {
  const normalized = destination.toLowerCase().trim();
  for (const key of Object.keys(KNOWN_DESTINATIONS)) {
    if (normalized.includes(key)) {
      return key;
    }
  }
  // Strip airport codes (XYZ) or commas
  return destination.replace(/\s*\([A-Z]{3}\)/i, '').split(',')[0].trim().toLowerCase();
}

/**
 * Maps WMO weather interpretation codes to user-facing labels, material symbols, and color tints
 */
export function decodeWmoWeatherCode(code: number): {
  condition: string;
  icon: string;
  iconColor: string;
} {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: 'wb_sunny', iconColor: 'text-[#d97706]' };
    case 1:
      return { condition: 'Mainly Clear', icon: 'wb_sunny', iconColor: 'text-[#d97706]' };
    case 2:
      return { condition: 'Partly Cloudy', icon: 'partly_cloudy_day', iconColor: 'text-[#0284c7]' };
    case 3:
      return { condition: 'Overcast', icon: 'cloud', iconColor: 'text-[#64748b]' };
    case 45:
    case 48:
      return { condition: 'Foggy / Hazy', icon: 'foggy', iconColor: 'text-[#94a3b8]' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', icon: 'rainy', iconColor: 'text-[#0284c7]' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain Showers', icon: 'rainy', iconColor: 'text-[#0369a1]' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: 'Snowfall', icon: 'ac_unit', iconColor: 'text-[#38bdf8]' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Heavy Showers', icon: 'rainy', iconColor: 'text-[#0284c7]' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', icon: 'thunderstorm', iconColor: 'text-[#7c3aed]' };
    default:
      return { condition: 'Fair Weather', icon: 'wb_sunny', iconColor: 'text-[#d97706]' };
  }
}

// In-memory forecast cache with 15-minute TTL
const forecastCache = new Map<string, { forecast: DestinationWeatherForecast; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Builds realistic seasonal fallback 7-day forecast
 */
function buildFallbackForecast(
  destination: string,
  cityKey: string
): DestinationWeatherForecast {
  const known = KNOWN_DESTINATIONS[cityKey] || {
    lat: 20.5937,
    lon: 78.9629,
    cleanName: destination.replace(/\s*\([A-Z]{3}\)/i, '').split(',')[0].trim(),
    defaultHigh: 28,
    defaultLow: 19,
    advisoryTip: 'Mild and pleasant conditions expected across the corridor. Pack versatile layering.',
  };

  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const conditionsList = [
    { code: 0, prob: 5 },
    { code: 1, prob: 10 },
    { code: 2, prob: 15 },
    { code: 0, prob: 5 },
    { code: 2, prob: 20 },
    { code: 1, prob: 10 },
    { code: 0, prob: 5 },
  ];

  const daily: DayWeatherForecast[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    // subtle variance across the 7 days
    const variance = (i % 3) - 1;
    const itemCondition = conditionsList[i % conditionsList.length];
    const decoded = decodeWmoWeatherCode(itemCondition.code);

    daily.push({
      date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
      tempMax: Math.round(known.defaultHigh + variance),
      tempMin: Math.round(known.defaultLow + (i % 2 === 0 ? 0 : -1)),
      condition: decoded.condition,
      weatherCode: itemCondition.code,
      precipitationProb: itemCondition.prob,
      icon: decoded.icon,
      iconColor: decoded.iconColor,
    });
  }

  const currentDecoded = decodeWmoWeatherCode(daily[0].weatherCode);

  return {
    destination,
    cityName: known.cleanName,
    latitude: known.lat,
    longitude: known.lon,
    currentTemp: Math.round((daily[0].tempMax + daily[0].tempMin) / 2),
    currentCondition: currentDecoded.condition,
    currentIcon: currentDecoded.icon,
    daily,
    isLive: false,
    advisory: known.advisoryTip,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Fetches 7-day weather forecast for a trip's primary destination
 */
export async function fetch7DayWeatherForecast(
  destination: string,
  primaryDestinationName?: string
): Promise<DestinationWeatherForecast> {
  const targetName = primaryDestinationName || destination;
  const cityKey = extractCityKey(targetName);
  const cacheKey = `${cityKey}_7day`;

  // Check valid cache
  const cached = forecastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.forecast;
  }

  // Determine latitude & longitude
  let lat: number | null = null;
  let lon: number | null = null;
  let resolvedCity = targetName.replace(/\s*\([A-Z]{3}\)/i, '').split(',')[0].trim();
  let advisoryTip = 'Great travel conditions forecast for exploring this week.';

  if (KNOWN_DESTINATIONS[cityKey]) {
    lat = KNOWN_DESTINATIONS[cityKey].lat;
    lon = KNOWN_DESTINATIONS[cityKey].lon;
    resolvedCity = KNOWN_DESTINATIONS[cityKey].cleanName;
    advisoryTip = KNOWN_DESTINATIONS[cityKey].advisoryTip;
  } else {
    // Attempt geocoding via Open-Meteo free geocoding API
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        resolvedCity
      )}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl, { headers: { Accept: 'application/json' } });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          resolvedCity = geoData.results[0].name;
        }
      }
    } catch {
      // Fallback below
    }
  }

  // If coordinates could not be resolved, return reliable fallback
  if (lat === null || lon === null) {
    const fallback = buildFallbackForecast(destination, cityKey);
    forecastCache.set(cacheKey, { forecast: fallback, timestamp: Date.now() });
    return fallback;
  }

  try {
    // Open-Meteo 7-day forecast API
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current=temperature_2m,weather_code&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(forecastUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const dailyData = data.daily;

    if (!dailyData || !dailyData.time || dailyData.time.length === 0) {
      throw new Error('Invalid daily data received from Open-Meteo');
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const count = Math.min(7, dailyData.time.length);
    const daily: DayWeatherForecast[] = [];

    for (let i = 0; i < count; i++) {
      const dateStr = dailyData.time[i];
      const d = new Date(dateStr + 'T12:00:00'); // avoid timezone shifts
      const wCode = dailyData.weather_code ? dailyData.weather_code[i] : 0;
      const decoded = decodeWmoWeatherCode(wCode);
      const tempMax = Math.round(dailyData.temperature_2m_max ? dailyData.temperature_2m_max[i] : 28);
      const tempMin = Math.round(dailyData.temperature_2m_min ? dailyData.temperature_2m_min[i] : 18);
      const precip = dailyData.precipitation_probability_max
        ? Math.round(dailyData.precipitation_probability_max[i] || 0)
        : 0;

      daily.push({
        date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        dayName: i === 0 ? 'Today' : dayNames[d.getDay()],
        tempMax,
        tempMin,
        condition: decoded.condition,
        weatherCode: wCode,
        precipitationProb: precip,
        icon: decoded.icon,
        iconColor: decoded.iconColor,
      });
    }

    // Current conditions
    const currentTemp = data.current ? Math.round(data.current.temperature_2m) : daily[0].tempMax;
    const currentCode = data.current ? data.current.weather_code : daily[0].weatherCode;
    const currentDecoded = decodeWmoWeatherCode(currentCode);

    // Dynamic travel advisory based on forecast
    const avgMax = daily.reduce((acc, d) => acc + d.tempMax, 0) / daily.length;
    const maxRainProb = Math.max(...daily.map((d) => d.precipitationProb));

    if (maxRainProb >= 50) {
      advisoryTip = 'Rain showers forecast on multiple days. Pack waterproof layers and quick-dry shoes.';
    } else if (avgMax >= 34) {
      advisoryTip = 'High daytime temperatures forecast. Schedule outdoor explorations for early mornings and late afternoons.';
    } else if (avgMax <= 15) {
      advisoryTip = 'Chilly weather expected throughout the week. Warm thermals, sweaters, and fleece jackets recommended.';
    }

    const forecast: DestinationWeatherForecast = {
      destination,
      cityName: resolvedCity,
      latitude: lat,
      longitude: lon,
      currentTemp,
      currentCondition: currentDecoded.condition,
      currentIcon: currentDecoded.icon,
      daily,
      isLive: true,
      advisory: advisoryTip,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    forecastCache.set(cacheKey, { forecast, timestamp: Date.now() });
    return forecast;
  } catch (err) {
    console.warn(`Live weather fetch failed for ${destination}, using destination-calibrated fallback:`, err);
    const fallback = buildFallbackForecast(destination, cityKey);
    forecastCache.set(cacheKey, { forecast: fallback, timestamp: Date.now() });
    return fallback;
  }
}
