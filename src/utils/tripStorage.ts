import { TripItem } from '../types';

export const TRIPS_STORAGE_KEY = 'travel_ai_trips_data';

export const DEFAULT_TRIPS: TripItem[] = [
  {
    id: 'trip-1',
    title: 'Varanasi Spiritual & Ghats Solo Expedition',
    origin: 'New Delhi (DEL)',
    destination: 'Varanasi (BSB)',
    startDate: 'Oct 14, 2026',
    endDate: 'Oct 18, 2026',
    durationDays: 4,
    status: 'upcoming',
    transitMode: 'train',
    bookingRef: 'IRCTC-PNR 241984210',
    budgetTotal: 8500,
    budgetSpent: 3200,
    coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    tags: ['Solo', 'Spiritual', 'Heritage', 'Photography'],
    waypoints: ['Assi Ghat', 'Dashashwamedh Aarti', 'Kashi Vishwanath', 'Sarnath Stupa', 'Manikarnika Ghat'],
    checklistDone: 6,
    checklistTotal: 8,
    primaryDestination: 'Varanasi (BSB)',
    customSummary: 'Deep sunrise boat rides along Manikarnika Ghat, ancient silk weaving quarters, evening Ganga Aarti ceremonies, and heritage culinary tastings.',
  },
  {
    id: 'trip-2',
    title: 'Kolkata Colonial Architecture & Cultural Trail',
    origin: 'New Delhi (DEL)',
    destination: 'Kolkata (CCU)',
    startDate: 'Nov 04, 2026',
    endDate: 'Nov 08, 2026',
    durationDays: 4,
    status: 'upcoming',
    transitMode: 'flight',
    bookingRef: '6E-482 / AI-701',
    budgetTotal: 14000,
    budgetSpent: 5600,
    coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    tags: ['Culture', 'Culinary', 'Architecture', 'Art'],
    waypoints: ['Victoria Memorial', 'Howrah Bridge', 'College Street Boi Para', 'Prinsep Ghat sunset', 'Flurys Park St'],
    checklistDone: 4,
    checklistTotal: 7,
    primaryDestination: 'Kolkata (CCU)',
    customSummary: 'Immersive exploration of colonial landmarks, college book street coffee house, and evening tram journeys.',
  },
  {
    id: 'trip-3',
    title: 'Leh Ladakh High Passes & Pangong Lake',
    origin: 'Mumbai (BOM)',
    destination: 'Leh Ladakh (IXL)',
    startDate: 'Jul 10, 2026',
    endDate: 'Jul 18, 2026',
    durationDays: 8,
    status: 'completed',
    transitMode: 'flight',
    bookingRef: 'G8-192 (Completed)',
    budgetTotal: 38000,
    budgetSpent: 36400,
    coverImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80',
    tags: ['High Altitude', 'Trek', 'Lakes', 'Monasteries'],
    waypoints: ['Shanti Stupa', 'Khardung La (5,359m)', 'Nubra Valley', 'Pangong Tso', 'Hemis Monastery'],
    checklistDone: 12,
    checklistTotal: 12,
    primaryDestination: 'Leh Ladakh (IXL)',
    customSummary: 'High-altitude passes traversal, scenic Pangong lake expedition, and mountain monastery circuits.',
  },
  {
    id: 'trip-4',
    title: 'Goa Coastal Backroads & Portuguese Quarters',
    origin: 'Bengaluru (BLR)',
    destination: 'North & South Goa (GOI)',
    startDate: 'Jan 15, 2026',
    endDate: 'Jan 20, 2026',
    durationDays: 5,
    status: 'completed',
    transitMode: 'train',
    bookingRef: 'Vande Bharat 20641',
    budgetTotal: 16500,
    budgetSpent: 15800,
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    tags: ['Beach', 'Cafes', 'Scooter Trail', 'Churches'],
    waypoints: ['Fontainhas Latin Quarter', 'Aguada Fort', 'Palolem Beach', 'Divar Island ferry', 'Anjuna Flea Market'],
    checklistDone: 9,
    checklistTotal: 9,
    primaryDestination: 'Goa Coast (GOI)',
    customSummary: 'Scooter rides across quiet mangrove ferries, historic Fontainhas Latin quarters, and sunset shores.',
  },
  {
    id: 'trip-kolkata-recent',
    title: 'Kolkata Heritage Trail',
    origin: 'New Delhi (DEL)',
    destination: 'Kolkata (CCU)',
    startDate: 'Sep 12, 2026',
    endDate: 'Sep 15, 2026',
    durationDays: 3,
    status: 'completed',
    transitMode: 'flight',
    bookingRef: '6E-512 (Completed)',
    budgetTotal: 6500,
    budgetSpent: 5550,
    coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop&q=80',
    tags: ['Street Photography', 'Colonial', 'Street Food'],
    waypoints: ['Victoria Memorial', 'Howrah Bridge', 'Kumartuli Potters Colony', 'College Street Coffee House'],
    checklistDone: 6,
    checklistTotal: 6,
    primaryDestination: 'Kolkata, West Bengal',
    customSummary: 'Colonial architecture walking trail, clay idol workshops in Kumartuli, and vintage tram rides.',
  },
  {
    id: 'trip-manali-recent',
    title: 'Manali High Pass Trek',
    origin: 'Chandigarh (IXC)',
    destination: 'Manali, Himachal Pradesh',
    startDate: 'Jul 20, 2026',
    endDate: 'Jul 25, 2026',
    durationDays: 5,
    status: 'completed',
    transitMode: 'road',
    bookingRef: 'HPTDC-Bus 8821',
    budgetTotal: 15000,
    budgetSpent: 14200,
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
    tags: ['Trek', 'Camping', 'Alpine', 'Mountains'],
    waypoints: ['Rohtang Pass', 'Solang Valley', 'Beas Kund Trail', 'Old Manali Cafes'],
    checklistDone: 8,
    checklistTotal: 8,
    primaryDestination: 'Manali, Himachal Pradesh',
    customSummary: 'Alpine ridge trekking, high-altitude camping near Beas Kund, and scenic pine forest expeditions.',
  },
  {
    id: 'trip-jaipur-recent',
    title: 'Jaipur Royal Palace Tour',
    origin: 'New Delhi (NDLS)',
    destination: 'Jaipur, Rajasthan',
    startDate: 'May 05, 2026',
    endDate: 'May 09, 2026',
    durationDays: 4,
    status: 'completed',
    transitMode: 'train',
    bookingRef: 'Shatabdi 12015',
    budgetTotal: 9500,
    budgetSpent: 8900,
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80',
    tags: ['Royal Forts', 'Architecture', 'Culinary'],
    waypoints: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Johari Bazaar'],
    checklistDone: 7,
    checklistTotal: 7,
    primaryDestination: 'Jaipur, Rajasthan',
    customSummary: 'Exploration of Mughal-Rajput palaces, artisan block-printing workshops in Sanganer, and royal heritage dining.',
  },
  {
    id: 'trip-5',
    title: 'Jaipur Pink City & Amber Fortress Walk',
    origin: 'New Delhi (NDLS)',
    destination: 'Jaipur (JP)',
    startDate: 'Dec 02, 2026',
    endDate: 'Dec 05, 2026',
    durationDays: 3,
    status: 'draft',
    transitMode: 'road',
    bookingRef: 'Self-Drive Express Highway',
    budgetTotal: 9500,
    budgetSpent: 0,
    coverImage: 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?w=800&auto=format&fit=crop&q=80',
    tags: ['Road Trip', 'Royal Forts', 'Bazaars'],
    waypoints: ['Hawa Mahal dawn', 'Amber Fort elephant path', 'Nahargarh sunset', 'Johari Bazaar'],
    checklistDone: 1,
    checklistTotal: 6,
    primaryDestination: 'Jaipur (JP)',
    customSummary: 'Weekend road-trip through the Pink City walls, sunset views from Nahargarh, and traditional thali dinners.',
  },
];

export function getStoredTrips(): TripItem[] {
  if (typeof window === 'undefined') return DEFAULT_TRIPS;
  try {
    const raw = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(DEFAULT_TRIPS));
      return DEFAULT_TRIPS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TRIPS;
  } catch (err) {
    console.error('Failed to load trips from storage:', err);
    return DEFAULT_TRIPS;
  }
}

export function saveStoredTrips(trips: TripItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    window.dispatchEvent(new CustomEvent('trips-updated', { detail: { trips } }));
  } catch (err) {
    console.error('Failed to save trips to storage:', err);
  }
}

export function toggleTripCompletionStatus(tripId: string): TripItem[] {
  const trips = getStoredTrips();
  const updated = trips.map((t) => {
    if (t.id === tripId) {
      const nextStatus: 'upcoming' | 'completed' | 'draft' =
        t.status === 'completed' ? 'upcoming' : 'completed';
      return {
        ...t,
        status: nextStatus,
      };
    }
    return t;
  });
  saveStoredTrips(updated);
  return updated;
}

export function getCompletedTripsCount(trips: TripItem[] = getStoredTrips()): number {
  return trips.filter((t) => t.status === 'completed').length;
}
