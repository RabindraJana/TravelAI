import { TripItem, PackingItem, TripPackingList } from '../types';

interface WeatherContext {
  climate: 'cold' | 'tropical' | 'warm' | 'temperate';
  label: string;
  icon: string;
}

/**
 * Detects destination climate based on destination name and tags
 */
export function detectDestinationClimate(destination: string, tags: string[] = []): WeatherContext {
  const destLower = destination.toLowerCase();
  const tagsLower = tags.map((t) => t.toLowerCase());

  // Cold / Alpine / Mountain
  if (
    destLower.includes('leh') ||
    destLower.includes('ladakh') ||
    destLower.includes('spiti') ||
    destLower.includes('manali') ||
    destLower.includes('shimla') ||
    destLower.includes('kashmir') ||
    destLower.includes('sikkim') ||
    destLower.includes('gulmarg') ||
    tagsLower.includes('high altitude') ||
    tagsLower.includes('trek')
  ) {
    return {
      climate: 'cold',
      label: 'Cold & High Altitude',
      icon: 'ac_unit',
    };
  }

  // Tropical / Coastal / Beach
  if (
    destLower.includes('goa') ||
    destLower.includes('kerala') ||
    destLower.includes('andaman') ||
    destLower.includes('pondicherry') ||
    destLower.includes('mumbai') ||
    destLower.includes('alappuzha') ||
    tagsLower.includes('beach') ||
    tagsLower.includes('coastal')
  ) {
    return {
      climate: 'tropical',
      label: 'Tropical & Humid Coastal',
      icon: 'wb_sunny',
    };
  }

  // Warm Plains / Riverbank
  if (
    destLower.includes('varanasi') ||
    destLower.includes('kolkata') ||
    destLower.includes('jaipur') ||
    destLower.includes('delhi') ||
    destLower.includes('agra') ||
    destLower.includes('rajasthan') ||
    destLower.includes('lucknow')
  ) {
    return {
      climate: 'warm',
      label: 'Warm Subtropical Plains',
      icon: 'partly_cloudy_day',
    };
  }

  return {
    climate: 'temperate',
    label: 'Mild & Temperate',
    icon: 'thermostat',
  };
}

/**
 * Detect primary trip type category from tags and title
 */
export function detectTripType(tags: string[] = [], title: string = ''): string {
  const combined = [...tags, title].map((s) => s.toLowerCase());

  if (combined.some((s) => s.includes('trek') || s.includes('high altitude') || s.includes('hike'))) {
    return 'Mountain Trek & Expedition';
  }
  if (combined.some((s) => s.includes('spiritual') || s.includes('ghats') || s.includes('temple'))) {
    return 'Spiritual & Heritage Pilgrimage';
  }
  if (combined.some((s) => s.includes('beach') || s.includes('coast') || s.includes('island'))) {
    return 'Coastal Beach & Leisure';
  }
  if (combined.some((s) => s.includes('culture') || s.includes('colonial') || s.includes('history'))) {
    return 'Cultural & Architecture Trail';
  }
  if (combined.some((s) => s.includes('photography') || s.includes('art'))) {
    return 'Photography & Street Exploration';
  }
  return 'General Solo Travel';
}

/**
 * Generates default smart packing checklist based on destination weather & trip type
 */
export function generateSmartPackingSuggestions(trip: TripItem): PackingItem[] {
  const climate = detectDestinationClimate(trip.destination, trip.tags);
  const tagsLower = trip.tags.map((t) => t.toLowerCase());
  const items: PackingItem[] = [];

  // --- 1. Weather-based items ---
  if (climate.climate === 'cold') {
    items.push(
      {
        id: `${trip.id}-w-1`,
        text: 'Thermal innerwear (merino wool base layers)',
        category: 'weather',
        packed: true,
        reason: 'Essential for sub-zero night temperatures',
        icon: 'ac_unit',
      },
      {
        id: `${trip.id}-w-2`,
        text: 'Down jacket / windproof parka (0°C to -10°C rating)',
        category: 'weather',
        packed: true,
        reason: 'High mountain windchill protection',
        icon: 'storm',
      },
      {
        id: `${trip.id}-w-3`,
        text: 'UV 400 polarized sunglasses & high SPF lip balm',
        category: 'weather',
        packed: false,
        reason: 'Intense high-altitude UV reflection',
        icon: 'sunny',
      },
      {
        id: `${trip.id}-w-4`,
        text: 'Woolen beanie & touchscreen thermal gloves',
        category: 'weather',
        packed: false,
        reason: 'Prevents heat loss on high passes',
        icon: 'snowshoeing',
      }
    );
  } else if (climate.climate === 'tropical') {
    items.push(
      {
        id: `${trip.id}-w-1`,
        text: 'Water-resistant mineral Sunscreen (SPF 50+ PA++++)',
        category: 'weather',
        packed: true,
        reason: 'Protects against tropical coastal UV',
        icon: 'wb_sunny',
      },
      {
        id: `${trip.id}-w-2`,
        text: 'Breathable linen shirts & quick-dry shorts',
        category: 'weather',
        packed: true,
        reason: 'Optimized for high humidity coastal breeze',
        icon: 'dry_cleaning',
      },
      {
        id: `${trip.id}-w-3`,
        text: 'Polarized sunglasses & wide-brim sun hat',
        category: 'weather',
        packed: false,
        reason: 'Shields eyes from sea glare',
        icon: 'sunglasses',
      },
      {
        id: `${trip.id}-w-4`,
        text: 'Waterproof dry pouch for electronics & phone',
        category: 'weather',
        packed: false,
        reason: 'Protects against sea spray and sand',
        icon: 'water_drop',
      }
    );
  } else {
    // Warm / Subtropical
    items.push(
      {
        id: `${trip.id}-w-1`,
        text: 'Lightweight breathable cotton clothing & shawl',
        category: 'weather',
        packed: true,
        reason: 'Comfortable for daytime temperatures and evening breeze',
        icon: 'air',
      },
      {
        id: `${trip.id}-w-2`,
        text: 'Compact umbrella / lightweight rain poncho',
        category: 'weather',
        packed: false,
        reason: 'Passing riverfront showers & harsh noon sun cover',
        icon: 'umbrella',
      },
      {
        id: `${trip.id}-w-3`,
        text: 'Mosquito & insect repellent spray (DEET/Odomos)',
        category: 'weather',
        packed: true,
        reason: 'Recommended for riverbanks & evening outdoor aartis',
        icon: 'pest_control',
      },
      {
        id: `${trip.id}-w-4`,
        text: 'Insulated refillable water bottle with electrolyte tablets',
        category: 'weather',
        packed: false,
        reason: 'Prevents dehydration during walking tours',
        icon: 'water_bottle',
      }
    );
  }

  // --- 2. Trip-Type Specific Items ---
  if (tagsLower.includes('spiritual') || tagsLower.includes('heritage') || tagsLower.includes('culture')) {
    items.push(
      {
        id: `${trip.id}-t-1`,
        text: 'Easy slip-on walking sandals / shoes (socks included)',
        category: 'trip-type',
        packed: true,
        reason: 'Frequent shoe removal at temples and ghats',
        icon: 'hiking',
      },
      {
        id: `${trip.id}-t-2`,
        text: 'Modest shoulder scarf / cotton stole (temple dress code)',
        category: 'trip-type',
        packed: false,
        reason: 'Required for sanctum entry and ancient shrines',
        icon: 'styler',
      },
      {
        id: `${trip.id}-t-3`,
        text: 'Small zippered tote / shoe carry bag for ghat visits',
        category: 'trip-type',
        packed: false,
        reason: 'Convenient when barefoot at river steps',
        icon: 'shopping_bag',
      }
    );
  }

  if (tagsLower.includes('high altitude') || tagsLower.includes('trek')) {
    items.push(
      {
        id: `${trip.id}-t-1`,
        text: 'Broken-in ankle support trekking boots & wool socks',
        category: 'trip-type',
        packed: true,
        reason: 'Trail grip on loose gravel & mountain terrain',
        icon: 'footprint',
      },
      {
        id: `${trip.id}-t-2`,
        text: 'Diamox (AMS medication) & blister prevention tape',
        category: 'trip-type',
        packed: true,
        reason: 'Altitude acclimation safety above 3,500m',
        icon: 'medical_services',
      },
      {
        id: `${trip.id}-t-3`,
        text: 'Telescopic trekking pole pair',
        category: 'trip-type',
        packed: false,
        reason: 'Reduces knee strain on rocky descents',
        icon: 'nordic_walking',
      }
    );
  }

  if (tagsLower.includes('photography') || tagsLower.includes('art')) {
    items.push(
      {
        id: `${trip.id}-t-4`,
        text: 'Spare camera batteries & 2x high-speed SD cards',
        category: 'trip-type',
        packed: false,
        reason: 'Cold depletes battery life; prevents missing golden hour',
        icon: 'photo_camera',
      },
      {
        id: `${trip.id}-t-5`,
        text: 'Lens microfiber cloth & dust rocket blower',
        category: 'trip-type',
        packed: true,
        reason: 'Removes river mist, ghat ash, or street dust',
        icon: 'clean_hands',
      }
    );
  }

  if (tagsLower.includes('beach') || tagsLower.includes('coastal')) {
    items.push(
      {
        id: `${trip.id}-t-1`,
        text: 'Quick-dry microfiber beach towel & flip-flops',
        category: 'trip-type',
        packed: true,
        reason: 'Dries in minutes without holding sand',
        icon: 'pool',
      },
      {
        id: `${trip.id}-t-2`,
        text: 'Waterproof action camera / phone case',
        category: 'trip-type',
        packed: false,
        reason: 'Captures ocean waves and water sports safely',
        icon: 'camera',
      }
    );
  }

  // --- 3. Core Universal Essentials ---
  items.push(
    {
      id: `${trip.id}-e-1`,
      text: 'Government Photo ID (Aadhaar / Passport) & printed PNR',
      category: 'essentials',
      packed: true,
      reason: 'Mandatory for hotel check-ins & transit boarding',
      icon: 'badge',
    },
    {
      id: `${trip.id}-e-2`,
      text: 'Fast charging Power Bank (10,000–20,000 mAh)',
      category: 'essentials',
      packed: true,
      reason: 'Keeps navigation & UPI payments active on long transit',
      icon: 'battery_charging_full',
    },
    {
      id: `${trip.id}-e-3`,
      text: 'Basic medical kit (Paracetamol, ORS, antiseptic band-aids)',
      category: 'essentials',
      packed: false,
      reason: 'Standard first response on unfamiliar routes',
      icon: 'medication',
    }
  );

  return items;
}

const STORAGE_PREFIX = 'voyage_packing_';

/**
 * Loads persisted packing checklist or generates fresh suggestions
 */
export function getTripPackingList(trip: TripItem): TripPackingList {
  const climate = detectDestinationClimate(trip.destination, trip.tags);
  const tripType = detectTripType(trip.tags, trip.title);

  let items: PackingItem[] = [];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${trip.id}`);
      if (stored) {
        items = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading packing checklist:', e);
    }
  }

  if (!items || items.length === 0) {
    items = generateSmartPackingSuggestions(trip);
    saveTripPackingList(trip.id, items);
  }

  const totalItems = items.length;
  const packedItems = items.filter((i) => i.packed).length;
  const percentage = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return {
    tripId: trip.id,
    items,
    weatherSummary: climate.label,
    tripTypeSummary: tripType,
    totalItems,
    packedItems,
    percentage,
  };
}

/**
 * Saves checklist items to local storage
 */
export function saveTripPackingList(tripId: string, items: PackingItem[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${tripId}`, JSON.stringify(items));
      // Dispatch event to sync any listening components
      window.dispatchEvent(
        new CustomEvent('packing-updated', {
          detail: { tripId, items },
        })
      );
    } catch (e) {
      console.error('Error saving packing list:', e);
    }
  }
}

/**
 * Toggle single item packed status
 */
export function toggleTripPackingItem(tripId: string, itemId: string): TripPackingList {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${tripId}`);
      if (stored) {
        const items: PackingItem[] = JSON.parse(stored);
        const updated = items.map((it) => (it.id === itemId ? { ...it, packed: !it.packed } : it));
        saveTripPackingList(tripId, updated);
      }
    } catch (e) {
      console.error('Error toggling packing item:', e);
    }
  }
  // Return updated state
  const tripPlaceholder: TripItem = {
    id: tripId,
    destination: '',
    title: '',
    origin: '',
    startDate: '',
    endDate: '',
    durationDays: 1,
    status: 'upcoming',
    transitMode: 'train',
    bookingRef: '',
    budgetTotal: 0,
    budgetSpent: 0,
    coverImage: '',
    tags: [],
    waypoints: [],
    checklistDone: 0,
    checklistTotal: 0,
  };
  return getTripPackingList(tripPlaceholder);
}
