import { ExpressTrainOption } from '../types';

export interface RouteInfo {
  originCity: string;
  destinationCity: string;
  originStationCode: string;
  destStationCode: string;
  distanceKm: number;
  isShortDistance: boolean;
  flightTime: string;
  trainTime: string;
  roadTime: string;
  flightCostRoundTrip: number;
  trainCostRoundTrip: number;
  busCostRoundTrip: number;
  departureHubTip: string;
  arrivalHubTip: string;
  recommendedTrains: ExpressTrainOption[];
}

interface StationCoord {
  lat: number;
  lng: number;
  code: string;
  name: string;
  defaultHub: string;
  state?: string;
  isStation?: boolean;
}

// Extensive Indian Railway Stations, Towns, and Cities Database
const CITY_COORDINATES: Record<string, StationCoord> = {
  // --- West Bengal Regional Hubs & Stations ---
  'kharagpur': {
    lat: 22.3400,
    lng: 87.3200,
    code: 'KGP',
    name: 'Kharagpur',
    defaultHub: 'Kharagpur Junction (KGP) - Platform 1-12',
    state: 'West Bengal',
    isStation: true
  },
  'medinipur': {
    lat: 22.4250,
    lng: 87.3200,
    code: 'MDN',
    name: 'Medinipur',
    defaultHub: 'Medinipur Railway Station (MDN)',
    state: 'West Bengal',
    isStation: true
  },
  'midnapore': {
    lat: 22.4250,
    lng: 87.3200,
    code: 'MDN',
    name: 'Medinipur',
    defaultHub: 'Medinipur Railway Station (MDN)',
    state: 'West Bengal',
    isStation: true
  },
  'jhargram': {
    lat: 22.4500,
    lng: 86.9800,
    code: 'JGM',
    name: 'Jhargram',
    defaultHub: 'Jhargram Station (JGM)',
    state: 'West Bengal',
    isStation: true
  },
  'ghatal': {
    lat: 22.6700,
    lng: 87.7200,
    code: 'GHT',
    name: 'Ghatal',
    defaultHub: 'Ghatal Bus Terminus / Medinipur Rail',
    state: 'West Bengal'
  },
  'tamluk': {
    lat: 22.3000,
    lng: 87.9200,
    code: 'TMZ',
    name: 'Tamluk',
    defaultHub: 'Tamluk Junction (TMZ)',
    state: 'West Bengal',
    isStation: true
  },
  'digha': {
    lat: 21.6266,
    lng: 87.5074,
    code: 'DGHA',
    name: 'Digha',
    defaultHub: 'Digha Flag Station (DGHA)',
    state: 'West Bengal',
    isStation: true
  },
  'haldia': {
    lat: 22.0667,
    lng: 88.0698,
    code: 'HLZ',
    name: 'Haldia',
    defaultHub: 'Haldia Station (HLZ)',
    state: 'West Bengal',
    isStation: true
  },
  'bankura': {
    lat: 23.2324,
    lng: 87.0715,
    code: 'BQA',
    name: 'Bankura',
    defaultHub: 'Bankura Junction (BQA)',
    state: 'West Bengal',
    isStation: true
  },
  'bishnupur': {
    lat: 23.0754,
    lng: 87.3197,
    code: 'VSU',
    name: 'Bishnupur',
    defaultHub: 'Bishnupur Station (VSU)',
    state: 'West Bengal',
    isStation: true
  },
  'purulia': {
    lat: 23.3321,
    lng: 86.3652,
    code: 'PRR',
    name: 'Purulia',
    defaultHub: 'Purulia Junction (PRR)',
    state: 'West Bengal',
    isStation: true
  },
  'asansol': {
    lat: 23.6889,
    lng: 86.9661,
    code: 'ASN',
    name: 'Asansol',
    defaultHub: 'Asansol Junction (ASN)',
    state: 'West Bengal',
    isStation: true
  },
  'durgapur': {
    lat: 23.5204,
    lng: 87.3119,
    code: 'DGR',
    name: 'Durgapur',
    defaultHub: 'Durgapur Station (DGR)',
    state: 'West Bengal',
    isStation: true
  },
  'bardhaman': {
    lat: 23.2425,
    lng: 87.8634,
    code: 'BWN',
    name: 'Bardhaman',
    defaultHub: 'Barddhaman Junction (BWN)',
    state: 'West Bengal',
    isStation: true
  },
  'burdwan': {
    lat: 23.2425,
    lng: 87.8634,
    code: 'BWN',
    name: 'Bardhaman',
    defaultHub: 'Barddhaman Junction (BWN)',
    state: 'West Bengal',
    isStation: true
  },
  'bolpur': {
    lat: 23.6693,
    lng: 87.6897,
    code: 'BHP',
    name: 'Bolpur Shantiniketan',
    defaultHub: 'Bolpur Shantiniketan Station (BHP)',
    state: 'West Bengal',
    isStation: true
  },
  'shantiniketan': {
    lat: 23.6693,
    lng: 87.6897,
    code: 'BHP',
    name: 'Bolpur Shantiniketan',
    defaultHub: 'Bolpur Shantiniketan Station (BHP)',
    state: 'West Bengal',
    isStation: true
  },
  'howrah': {
    lat: 22.5855,
    lng: 88.3426,
    code: 'HWH',
    name: 'Howrah',
    defaultHub: 'Howrah Junction (HWH) - Terminal 1 & 2',
    state: 'West Bengal',
    isStation: true
  },
  'sealdah': {
    lat: 22.5675,
    lng: 88.3712,
    code: 'SDAH',
    name: 'Sealdah',
    defaultHub: 'Sealdah Station (SDAH)',
    state: 'West Bengal',
    isStation: true
  },
  'kolkata': {
    lat: 22.5726,
    lng: 88.3639,
    code: 'CCU',
    name: 'Kolkata',
    defaultHub: 'Howrah (HWH) / Sealdah (SDAH) / CCU Airport',
    state: 'West Bengal'
  },
  'malda': {
    lat: 25.0108,
    lng: 88.1411,
    code: 'MLDT',
    name: 'Malda Town',
    defaultHub: 'Malda Town Station (MLDT)',
    state: 'West Bengal',
    isStation: true
  },
  'siliguri': {
    lat: 26.7271,
    lng: 88.3953,
    code: 'SGUJ',
    name: 'Siliguri',
    defaultHub: 'Siliguri Junction (SGUJ) / Bagdogra (IXB)',
    state: 'West Bengal',
    isStation: true
  },
  'new jalpaiguri': {
    lat: 26.6858,
    lng: 88.4419,
    code: 'NJP',
    name: 'New Jalpaiguri',
    defaultHub: 'New Jalpaiguri Junction (NJP)',
    state: 'West Bengal',
    isStation: true
  },
  'darjeeling': {
    lat: 27.0410,
    lng: 88.2663,
    code: 'DJ',
    name: 'Darjeeling',
    defaultHub: 'Darjeeling Himalayan Toy Train / NJP Rail',
    state: 'West Bengal'
  },

  // --- Major National Hubs & Metro Junctions ---
  'delhi': {
    lat: 28.6139,
    lng: 77.2090,
    code: 'NDLS',
    name: 'New Delhi',
    defaultHub: 'New Delhi Railway Station (NDLS) / IGI Airport',
    state: 'Delhi',
    isStation: true
  },
  'new delhi': {
    lat: 28.6139,
    lng: 77.2090,
    code: 'NDLS',
    name: 'New Delhi',
    defaultHub: 'New Delhi Railway Station (NDLS) / IGI Airport',
    state: 'Delhi',
    isStation: true
  },
  'mumbai': {
    lat: 19.0760,
    lng: 72.8777,
    code: 'CSMT',
    name: 'Mumbai',
    defaultHub: 'Chhatrapati Shivaji Maharaj Terminus (CSMT) / BOM',
    state: 'Maharashtra',
    isStation: true
  },
  'bengaluru': {
    lat: 12.9716,
    lng: 77.5946,
    code: 'SBC',
    name: 'Bengaluru',
    defaultHub: 'KSR Bengaluru City (SBC) / BLR Intl',
    state: 'Karnataka',
    isStation: true
  },
  'bangalore': {
    lat: 12.9716,
    lng: 77.5946,
    code: 'SBC',
    name: 'Bengaluru',
    defaultHub: 'KSR Bengaluru City (SBC) / BLR Intl',
    state: 'Karnataka',
    isStation: true
  },
  'chennai': {
    lat: 13.0827,
    lng: 80.2707,
    code: 'MAS',
    name: 'Chennai',
    defaultHub: 'Chennai Central (MAS) / MAA Airport',
    state: 'Tamil Nadu',
    isStation: true
  },
  'hyderabad': {
    lat: 17.3850,
    lng: 78.4867,
    code: 'SC',
    name: 'Hyderabad',
    defaultHub: 'Secunderabad Junction (SC) / HYD Intl',
    state: 'Telangana',
    isStation: true
  },
  'pune': {
    lat: 18.5204,
    lng: 73.8567,
    code: 'PUNE',
    name: 'Pune',
    defaultHub: 'Pune Junction (PUNE) / PNQ Airport',
    state: 'Maharashtra',
    isStation: true
  },
  'varanasi': {
    lat: 25.3176,
    lng: 82.9739,
    code: 'BSB',
    name: 'Varanasi',
    defaultHub: 'Varanasi Junction (BSB) / Cantt',
    state: 'Uttar Pradesh',
    isStation: true
  },
  'jaipur': {
    lat: 26.9124,
    lng: 75.7873,
    code: 'JP',
    name: 'Jaipur',
    defaultHub: 'Jaipur Junction (JP) / JAI Airport',
    state: 'Rajasthan',
    isStation: true
  },
  'goa': {
    lat: 15.2993,
    lng: 74.1240,
    code: 'MAO',
    name: 'Goa',
    defaultHub: 'Madgaon Junction (MAO) / Dabolim (GOI)',
    state: 'Goa',
    isStation: true
  },
  'patna': {
    lat: 25.5941,
    lng: 85.1376,
    code: 'PNBE',
    name: 'Patna',
    defaultHub: 'Patna Junction (PNBE)',
    state: 'Bihar',
    isStation: true
  },
  'gaya': {
    lat: 24.7914,
    lng: 85.0002,
    code: 'GAYA',
    name: 'Gaya',
    defaultHub: 'Gaya Junction (GAYA)',
    state: 'Bihar',
    isStation: true
  },
  'ranchi': {
    lat: 23.3441,
    lng: 85.3096,
    code: 'RNC',
    name: 'Ranchi',
    defaultHub: 'Ranchi Junction (RNC) / Hatia',
    state: 'Jharkhand',
    isStation: true
  },
  'jamshedpur': {
    lat: 22.7719,
    lng: 86.2029,
    code: 'TATA',
    name: 'Jamshedpur / Tatanagar',
    defaultHub: 'Tatanagar Junction (TATA)',
    state: 'Jharkhand',
    isStation: true
  },
  'tatanagar': {
    lat: 22.7719,
    lng: 86.2029,
    code: 'TATA',
    name: 'Tatanagar',
    defaultHub: 'Tatanagar Junction (TATA)',
    state: 'Jharkhand',
    isStation: true
  },
  'dhanbad': {
    lat: 23.7957,
    lng: 86.4304,
    code: 'DHN',
    name: 'Dhanbad',
    defaultHub: 'Dhanbad Junction (DHN)',
    state: 'Jharkhand',
    isStation: true
  },
  'bhubaneswar': {
    lat: 20.2961,
    lng: 85.8245,
    code: 'BBS',
    name: 'Bhubaneswar',
    defaultHub: 'Bhubaneswar Station (BBS)',
    state: 'Odisha',
    isStation: true
  },
  'cuttack': {
    lat: 20.4625,
    lng: 85.8828,
    code: 'CTC',
    name: 'Cuttack',
    defaultHub: 'Cuttack Junction (CTC)',
    state: 'Odisha',
    isStation: true
  },
  'puri': {
    lat: 19.8135,
    lng: 85.8312,
    code: 'PURI',
    name: 'Puri',
    defaultHub: 'Puri Railway Station (PURI)',
    state: 'Odisha',
    isStation: true
  },
  'balasore': {
    lat: 21.4934,
    lng: 86.9135,
    code: 'BLS',
    name: 'Balasore',
    defaultHub: 'Baleshwar Railway Station (BLS)',
    state: 'Odisha',
    isStation: true
  },
  'rourkela': {
    lat: 22.2604,
    lng: 84.8536,
    code: 'ROU',
    name: 'Rourkela',
    defaultHub: 'Rourkela Junction (ROU)',
    state: 'Odisha',
    isStation: true
  },
  'lucknow': {
    lat: 26.8467,
    lng: 80.9462,
    code: 'LKO',
    name: 'Lucknow',
    defaultHub: 'Lucknow Charbagh (LKO) / LJN',
    state: 'Uttar Pradesh',
    isStation: true
  },
  'kanpur': {
    lat: 26.4499,
    lng: 80.3319,
    code: 'CNB',
    name: 'Kanpur',
    defaultHub: 'Kanpur Central (CNB)',
    state: 'Uttar Pradesh',
    isStation: true
  },
  'prayagraj': {
    lat: 25.4358,
    lng: 81.8463,
    code: 'PRYJ',
    name: 'Prayagraj',
    defaultHub: 'Prayagraj Junction (PRYJ)',
    state: 'Uttar Pradesh',
    isStation: true
  },
  'ayodhya': {
    lat: 26.7922,
    lng: 82.1998,
    code: 'AY',
    name: 'Ayodhya',
    defaultHub: 'Ayodhya Dham Junction (AY)',
    state: 'Uttar Pradesh',
    isStation: true
  },
  'agra': {
    lat: 27.1767,
    lng: 78.0081,
    code: 'AGC',
    name: 'Agra',
    defaultHub: 'Agra Cantt (AGC)',
    state: 'Uttar Pradesh',
    isStation: true
  },
  'mathura': {
    lat: 27.4924,
    lng: 77.6737,
    code: 'MTJ',
    name: 'Mathura',
    defaultHub: 'Mathura Junction (MTJ)',
    state: 'Uttar Pradesh',
    isStation: true
  },
  'haridwar': {
    lat: 29.9457,
    lng: 78.1642,
    code: 'HW',
    name: 'Haridwar',
    defaultHub: 'Haridwar Junction (HW)',
    state: 'Uttarakhand',
    isStation: true
  },
  'dehradun': {
    lat: 30.3165,
    lng: 78.0322,
    code: 'DDN',
    name: 'Dehradun',
    defaultHub: 'Dehradun Railway Station (DDN)',
    state: 'Uttarakhand',
    isStation: true
  },
  'rishikesh': {
    lat: 30.0869,
    lng: 78.2676,
    code: 'YNRK',
    name: 'Rishikesh',
    defaultHub: 'Yog Nagari Rishikesh (YNRK)',
    state: 'Uttarakhand',
    isStation: true
  },
  'chandigarh': {
    lat: 30.7333,
    lng: 76.7794,
    code: 'CDG',
    name: 'Chandigarh',
    defaultHub: 'Chandigarh Junction (CDG)',
    state: 'Punjab / Haryana',
    isStation: true
  },
  'amritsar': {
    lat: 31.6340,
    lng: 74.8723,
    code: 'ASR',
    name: 'Amritsar',
    defaultHub: 'Amritsar Junction (ASR)',
    state: 'Punjab',
    isStation: true
  },
  'manali': {
    lat: 32.2396,
    lng: 77.1887,
    code: 'MNL',
    name: 'Manali',
    defaultHub: 'Manali Mall Road Bus Terminal / Bhuntar',
    state: 'Himachal Pradesh'
  },
  'shimla': {
    lat: 31.1048,
    lng: 77.1734,
    code: 'SML',
    name: 'Shimla',
    defaultHub: 'Shimla Station (SML) / Kalka Toy Train',
    state: 'Himachal Pradesh',
    isStation: true
  },
  'leh': {
    lat: 34.1526,
    lng: 77.5771,
    code: 'IXL',
    name: 'Leh Ladakh',
    defaultHub: 'Kushok Bakula Rimpochee Airport (IXL)',
    state: 'Ladakh'
  },
  'ladakh': {
    lat: 34.1526,
    lng: 77.5771,
    code: 'IXL',
    name: 'Leh Ladakh',
    defaultHub: 'Kushok Bakula Rimpochee Airport (IXL)',
    state: 'Ladakh'
  },
  'ahmedabad': {
    lat: 23.0225,
    lng: 72.5714,
    code: 'ADI',
    name: 'Ahmedabad',
    defaultHub: 'Ahmedabad Junction (ADI)',
    state: 'Gujarat',
    isStation: true
  },
  'surat': {
    lat: 21.1702,
    lng: 72.8311,
    code: 'ST',
    name: 'Surat',
    defaultHub: 'Surat Station (ST)',
    state: 'Gujarat',
    isStation: true
  },
  'kochi': {
    lat: 9.9312,
    lng: 76.2673,
    code: 'ERS',
    name: 'Kochi',
    defaultHub: 'Ernakulam Junction (ERS) / COK Airport',
    state: 'Kerala',
    isStation: true
  },
  'kerala': {
    lat: 9.9312,
    lng: 76.2673,
    code: 'ERS',
    name: 'Kochi',
    defaultHub: 'Ernakulam Junction (ERS) / COK Airport',
    state: 'Kerala',
    isStation: true
  },
  'guwahati': {
    lat: 26.1445,
    lng: 91.7362,
    code: 'GHY',
    name: 'Guwahati',
    defaultHub: 'Guwahati Junction (GHY)',
    state: 'Assam',
    isStation: true
  }
};

/**
 * Clean & match station or town name, removing suffixes like "station", "jn", "junction", "railway", etc.
 */
function normalizePlaceName(input: string): { key: string; rawClean: string; code?: string } {
  if (!input) return { key: 'delhi', rawClean: 'New Delhi', code: 'NDLS' };

  // Check if station code is enclosed in brackets e.g. "Kharagpur (KGP)"
  const codeMatch = input.match(/\(([A-Z]{2,5})\)/i);
  const explicitCode = codeMatch ? codeMatch[1].toUpperCase() : undefined;

  // Clean the input
  let cleaned = input
    .replace(/\(.*?\)/g, '')
    .toLowerCase()
    .replace(/\b(station|stn|junction|jn|cantt|central|terminal|airport|railway|rly|village|town|city)\b/gi, '')
    .trim();

  // If first part has comma, take first chunk
  const firstChunk = cleaned.split(',')[0].trim();

  // Check code directly
  if (explicitCode) {
    for (const [key, val] of Object.entries(CITY_COORDINATES)) {
      if (val.code === explicitCode) {
        return { key, rawClean: val.name, code: val.code };
      }
    }
  }

  // Check direct matches or includes in dictionary
  for (const [key, val] of Object.entries(CITY_COORDINATES)) {
    if (firstChunk === key || key.includes(firstChunk) || firstChunk.includes(key)) {
      return { key, rawClean: val.name, code: val.code };
    }
  }

  // Fallback if not found: clean capitalize title
  const rawDisplay = input
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(',')[0]
    .trim();

  return {
    key: firstChunk || 'custom',
    rawClean: rawDisplay || 'Custom Location',
    code: explicitCode || (rawDisplay ? rawDisplay.slice(0, 3).toUpperCase() : 'STN')
  };
}

/**
 * Great-circle distance between two points in kilometers
 */
function calculateGreatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate intelligent express train recommendations for any corridor
 */
function getRecommendedTrainsForCorridor(
  originKey: string,
  destKey: string,
  originName: string,
  destName: string,
  distanceKm: number,
  originCode: string,
  destCode: string
): ExpressTrainOption[] {
  // Case 1: Kharagpur to Medinipur / Midnapore (or reverse)
  const isKgpMdn =
    (originKey.includes('kharagpur') && (destKey.includes('medinipur') || destKey.includes('midnapore'))) ||
    ((originKey.includes('medinipur') || originKey.includes('midnapore')) && destKey.includes('kharagpur'));

  if (isKgpMdn) {
    return [
      {
        name: 'Rupashi Bangla Express',
        number: '12883 / 12884',
        type: 'Superfast Express',
        departureTime: '08:32 AM / 04:15 PM',
        arrivalTime: '08:50 AM / 04:33 PM',
        duration: '18 mins',
        fareEstimate: '₹45 (2S) / ₹115 (CC)',
        frequency: 'Daily',
        originStation: 'Kharagpur Junction (KGP)',
        destStation: 'Medinipur (MDN)',
        tips: 'Fastest connection over Kangsabati bridge with reserved chair car seats.'
      },
      {
        name: 'Aranyak Express',
        number: '12885 / 12886',
        type: 'Superfast Express',
        departureTime: '09:40 AM / 06:20 PM',
        arrivalTime: '09:58 AM / 06:38 PM',
        duration: '18 mins',
        fareEstimate: '₹45 (2S) / ₹115 (CC)',
        frequency: 'Daily',
        originStation: 'Kharagpur Junction (KGP)',
        destStation: 'Medinipur (MDN)',
        tips: 'Punctual superfast link between KGP and Midnapore.'
      },
      {
        name: 'Howrah - Medinipur Fast EMU Local',
        number: '38811 / 38815',
        type: 'Express',
        departureTime: 'Frequent (Every 30-45 mins)',
        arrivalTime: '~20 mins after departure',
        duration: '20 mins',
        fareEstimate: '₹10 - ₹15',
        frequency: '18+ trains daily',
        originStation: 'Kharagpur Jn Platform 7/8',
        destStation: 'Medinipur Station',
        tips: 'Most frequent option. No reservation required, tickets available at UTS counters.'
      },
      {
        name: 'Kharagpur - Medinipur MEMU Passenger',
        number: '68001 / 68003',
        type: 'MEMU / Passenger',
        departureTime: '06:15 AM, 11:20 AM, 02:40 PM, 07:15 PM',
        arrivalTime: '~15-20 mins later',
        duration: '15 mins',
        fareEstimate: '₹10',
        frequency: 'Multiple daily',
        originStation: 'Kharagpur Jn',
        destStation: 'Medinipur',
        tips: 'Direct dedicated corridor shuttle across the river.'
      },
      {
        name: 'Howrah - Purulia Express',
        number: '12827',
        type: 'Express',
        departureTime: '06:55 PM',
        arrivalTime: '07:14 PM',
        duration: '19 mins',
        fareEstimate: '₹45 (2S)',
        frequency: 'Daily',
        originStation: 'Kharagpur Junction (KGP)',
        destStation: 'Medinipur (MDN)',
        tips: 'Evening connection with smooth transit.'
      }
    ];
  }

  // Case 2: Short distance corridor (< 60 km)
  if (distanceKm <= 60) {
    return [
      {
        name: `${originName} - ${destName} Intercity Express`,
        number: '12801',
        type: 'Superfast Express',
        departureTime: '07:30 AM / 05:45 PM',
        duration: `${Math.round(distanceKm * 0.9)} mins`,
        fareEstimate: '₹35 - ₹75',
        frequency: 'Daily',
        originStation: `${originName} (${originCode})`,
        destStation: `${destName} (${destCode})`,
        tips: 'Fast express rail connection across the district corridor.'
      },
      {
        name: `${originName} - ${destName} MEMU Local`,
        number: '68012',
        type: 'MEMU / Passenger',
        departureTime: 'Hourly service',
        duration: `${Math.round(distanceKm * 1.1 + 5)} mins`,
        fareEstimate: '₹10 - ₹25',
        frequency: 'Frequent',
        originStation: `${originName} (${originCode})`,
        destStation: `${destName} (${destCode})`,
        tips: 'Direct regional commuter service, affordable and frequent.'
      }
    ];
  }

  // Case 3: Medium distance (60 - 300 km)
  if (distanceKm <= 300) {
    return [
      {
        name: `${originName} - ${destName} Vande Bharat / Superfast Express`,
        number: '20815',
        type: 'Vande Bharat',
        departureTime: '06:40 AM',
        duration: `${Math.floor(distanceKm / 75)}h ${Math.round((distanceKm % 75) * 0.7)}m`,
        fareEstimate: '₹380 - ₹850',
        frequency: '6 days a week',
        originStation: `${originName} (${originCode})`,
        destStation: `${destName} (${destCode})`,
        tips: 'Fastest semi-high-speed transit with onboard catering.'
      },
      {
        name: `${originName} - ${destName} Intercity Express`,
        number: '12871',
        type: 'Superfast Express',
        departureTime: '08:15 AM / 03:30 PM',
        duration: `${Math.floor(distanceKm / 65)}h ${Math.round((distanceKm % 65) * 0.8)}m`,
        fareEstimate: '₹95 (2S) / ₹340 (CC)',
        frequency: 'Daily',
        originStation: `${originName} (${originCode})`,
        destStation: `${destName} (${destCode})`,
        tips: 'Comfortable day express with scenic countryside views.'
      }
    ];
  }

  // Case 4: Long Distance (> 300 km)
  return [
    {
      name: `${originName} - ${destName} Rajdhani / Vande Bharat Express`,
      number: '12952',
      type: 'Superfast Express',
      departureTime: '04:55 PM',
      duration: `${Math.floor(distanceKm / 80)}h ${Math.round((distanceKm % 80) * 0.6)}m`,
      fareEstimate: '₹1,450 (3AC) / ₹2,350 (2AC)',
      frequency: 'Daily',
      originStation: `${originName} (${originCode})`,
      destStation: `${destName} (${destCode})`,
      tips: 'Premier long-distance express with complimentary meals and clean berths.'
    },
    {
      name: `${originName} - ${destName} Superfast Mail`,
      number: '12810',
      type: 'Mail / Express',
      departureTime: '08:20 PM (Overnight)',
      duration: `${Math.floor(distanceKm / 70 + 1)}h`,
      fareEstimate: '₹420 (SL) / ₹1,150 (3AC)',
      frequency: 'Daily',
      originStation: `${originName} (${originCode})`,
      destStation: `${destName} (${destCode})`,
      tips: 'Convenient overnight journey arriving fresh in the morning.'
    }
  ];
}

/**
 * Compute route details, distances, travel times, fares, and express train recommendations
 */
export function getRouteDetails(originInput: string, destinationInput: string): RouteInfo {
  const normOrigin = normalizePlaceName(originInput);
  const normDest = normalizePlaceName(destinationInput);

  const originEntry = CITY_COORDINATES[normOrigin.key];
  const destEntry = CITY_COORDINATES[normDest.key];

  let distanceKm = 0;
  let originCode = normOrigin.code || 'ORG';
  let destCode = normDest.code || 'DST';
  let departureHub = `${normOrigin.rawClean} Railway Station / Junction`;
  let arrivalHub = `${normDest.rawClean} Railway Station / Junction`;

  // Specific Check: Kharagpur to Medinipur / Midnapore
  const isKgpMdn =
    (normOrigin.key.includes('kharagpur') && (normDest.key.includes('medinipur') || normDest.key.includes('midnapore'))) ||
    ((normOrigin.key.includes('medinipur') || normOrigin.key.includes('midnapore')) && normDest.key.includes('kharagpur'));

  if (isKgpMdn) {
    distanceKm = 14; // Exactly ~13.8 km between KGP Junction and Medinipur Station via Kangsabati bridge
    originCode = normOrigin.key.includes('kharagpur') ? 'KGP' : 'MDN';
    destCode = normDest.key.includes('medinipur') || normDest.key.includes('midnapore') ? 'MDN' : 'KGP';
    departureHub = originCode === 'KGP' ? 'Kharagpur Junction (KGP)' : 'Medinipur Station (MDN)';
    arrivalHub = destCode === 'MDN' ? 'Medinipur Station (MDN)' : 'Kharagpur Junction (KGP)';
  } else if (originEntry && destEntry) {
    const rawKm = calculateGreatCircleKm(originEntry.lat, originEntry.lng, destEntry.lat, destEntry.lng);
    // Road/rail winding factor
    distanceKm = Math.max(12, Math.round(rawKm * 1.2));
    originCode = originEntry.code;
    destCode = destEntry.code;
    departureHub = originEntry.defaultHub;
    arrivalHub = destEntry.defaultHub;
  } else if (originEntry && !destEntry) {
    // Known origin, custom village/town destination
    // If user mentions "station" or same area, realistic regional estimate
    distanceKm = 48;
    originCode = originEntry.code;
    departureHub = originEntry.defaultHub;
    arrivalHub = `${normDest.rawClean} Station / Bus Stop`;
  } else if (!originEntry && destEntry) {
    // Custom village origin, known destination
    distanceKm = 48;
    destCode = destEntry.code;
    departureHub = `${normOrigin.rawClean} Local Station / Town Hub`;
    arrivalHub = destEntry.defaultHub;
  } else {
    // Both are custom stations/villages
    distanceKm = 35; // Default regional station-to-town corridor
    departureHub = `${normOrigin.rawClean} Railway Station / Local Hub`;
    arrivalHub = `${normDest.rawClean} Railway Station / Local Hub`;
  }

  const isShortDistance = distanceKm <= 75;

  // Transit metrics
  let flightTime: string;
  let flightCostRoundTrip: number;

  if (isShortDistance) {
    flightTime = 'N/A - Direct Express Rail / Road Corridor';
    flightCostRoundTrip = 0;
  } else if (distanceKm < 250) {
    flightTime = 'Direct Highway / Express Train Preferred';
    flightCostRoundTrip = 1800;
  } else {
    const flightHours = Math.max(0.9, distanceKm / 600 + 0.6);
    const fH = Math.floor(flightHours);
    const fM = Math.round((flightHours - fH) * 60);
    flightTime = `${fH}h ${fM > 0 ? fM + 'm' : ''} Direct Flight`;
    flightCostRoundTrip = Math.round(2600 + distanceKm * 1.7);
  }

  // Train calculations
  let trainTime: string;
  let trainCostRoundTrip: number;

  if (isKgpMdn) {
    trainTime = '15 - 20 mins (Rupashi Bangla / MEMU / EMU)';
    trainCostRoundTrip = 30; // ₹15 each way
  } else if (distanceKm <= 50) {
    trainTime = `${Math.max(15, Math.round(distanceKm * 0.9))} mins (MEMU / Express)`;
    trainCostRoundTrip = Math.round(Math.max(20, distanceKm * 0.8));
  } else {
    const trainHours = Math.max(1.2, distanceKm / 75 + 0.5);
    const tH = Math.floor(trainHours);
    const tM = Math.round((trainHours - tH) * 60);
    trainTime = `${tH}h ${tM > 0 ? tM + 'm' : ''} Express Rail`;
    trainCostRoundTrip = Math.round(350 + distanceKm * 0.85);
  }

  // Road calculations
  let roadTime: string;
  let busCostRoundTrip: number;

  if (isKgpMdn) {
    roadTime = '25 mins drive / Auto via Kangsabati bridge';
    busCostRoundTrip = 60;
  } else if (distanceKm <= 50) {
    roadTime = `${Math.max(20, Math.round(distanceKm * 1.1))} mins drive`;
    busCostRoundTrip = Math.round(Math.max(40, distanceKm * 1.4));
  } else {
    const roadHours = Math.max(1.0, distanceKm / 55 + 0.5);
    const rH = Math.floor(roadHours);
    roadTime = `${rH}h drive`;
    busCostRoundTrip = Math.round(250 + distanceKm * 0.75);
  }

  const recommendedTrains = getRecommendedTrainsForCorridor(
    normOrigin.key,
    normDest.key,
    normOrigin.rawClean,
    normDest.rawClean,
    distanceKm,
    originCode,
    destCode
  );

  return {
    originCity: normOrigin.rawClean,
    destinationCity: normDest.rawClean,
    originStationCode: originCode,
    destStationCode: destCode,
    distanceKm,
    isShortDistance,
    flightTime,
    trainTime,
    roadTime,
    flightCostRoundTrip,
    trainCostRoundTrip,
    busCostRoundTrip,
    departureHubTip: departureHub,
    arrivalHubTip: arrivalHub,
    recommendedTrains
  };
}
