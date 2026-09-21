export type ScreenType =
  | 'dashboard'
  | 'planner'
  | 'trips'
  | 'journal'
  | 'explore'
  | 'community'
  | 'map'
  | 'achievements'
  | 'goals';

export type TransitionType = 'none' | 'push';

export interface TripStat {
  label: string;
  value: string;
  badge?: string;
  detail: string;
  icon: string;
  iconColor: string;
}

export interface RecentTrip {
  id: string;
  title: string;
  rating: number;
  duration: string;
  category: string;
  cost: string;
  image: string;
  imageAlt: string;
  origin?: string;
  destination?: string;
  startDate?: string;
  status?: 'upcoming' | 'completed' | 'draft';
}

export interface Achievement {
  id: string;
  title: string;
  category: 'adventure' | 'culture' | 'transit' | 'food' | 'photography' | 'social';
  symbol: string;
  badgeColor: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  dateUnlocked?: string;
  progress: number; // 0 - 100
  currentCount?: number;
  targetCount?: number;
  unlocked: boolean;
  rewardXp: number;
}

export interface TravelGoal2027 {
  id: string;
  title: string;
  destination: string;
  origin: string;
  targetMonth: string;
  category: string;
  targetBudget: number;
  savedBudget: number;
  completed: boolean;
  coverImage: string;
  notes: string;
  milestones: { text: string; done: boolean }[];
  tags: string[];
}

export interface BucketListDestination {
  id: string;
  destination: string;
  country: string;
  category: string;
  bestSeason: string;
  estimatedBudget: number;
  coverImage: string;
  description: string;
  savedForLater: boolean;
  savedAt?: string;
  priority?: 'High' | 'Medium' | 'Someday';
  notes?: string;
  tags: string[];
}

export interface TripItem {
  id: string;
  title: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'upcoming' | 'completed' | 'draft';
  transitMode: 'flight' | 'train' | 'road';
  bookingRef: string;
  budgetTotal: number;
  budgetSpent: number;
  coverImage: string;
  tags: string[];
  waypoints: string[];
  checklistDone: number;
  checklistTotal: number;
  primaryDestination?: string;
  customSummary?: string;
}

export interface TripSummary {
  tripId: string;
  title: string;
  primaryDestination: string;
  destinationTagline: string;
  keyDates: string;
  departureDate: string;
  returnDate: string;
  durationText: string;
  relativeTimeText: string;
  conciseSummary: string;
  transitSummary: string;
  highlights: string[];
  readinessPercentage: number;
  budgetSummary: string;
  status: 'upcoming' | 'completed' | 'draft';
  coverImage: string;
  tags: string[];
}

export interface DayWeatherForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  weatherCode: number;
  precipitationProb: number;
  icon: string;
  iconColor: string;
}

export interface DestinationWeatherForecast {
  destination: string;
  cityName: string;
  latitude: number;
  longitude: number;
  currentTemp: number;
  currentCondition: string;
  currentIcon: string;
  daily: DayWeatherForecast[];
  isLive: boolean;
  advisory: string;
  lastUpdated: string;
}

export interface UserPreferences {
  name: string;
  avatar: string;
  homeCity: string;
  currency: string;
  travelStyle: 'budget' | 'balanced' | 'luxury' | 'adventure';
  pace: 'relaxed' | 'moderate' | 'fast';
  dietary: 'all' | 'veg' | 'vegan' | 'halal' | 'jain';
  notificationsEnabled: boolean;
}

export type TravelBadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TravelBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: TravelBadgeTier;
  requiredCompletedTrips: number;
  unlocked: boolean;
  unlockedAt?: string;
  perk: string;
  category: 'trips_count' | 'transit_mode' | 'distance' | 'special';
  criteria: string;
}

export interface TravelLevelInfo {
  level: number;
  title: string;
  badgeName: string;
  badgeIcon: string;
  completedTripsCount: number;
  currentLevelMinTrips: number;
  nextLevelMinTrips: number;
  progressPercent: number;
  tripsToNextLevel: number;
  allBadges: TravelBadge[];
  unlockedBadges: TravelBadge[];
  nextBadge?: TravelBadge;
  rankTitle: string;
}

export interface ExpressTrainOption {
  name: string;
  number?: string;
  type: string; // 'Express' | 'Superfast Express' | 'MEMU / Passenger' | 'Vande Bharat' | 'Mail / Express'
  departureTime?: string;
  arrivalTime?: string;
  duration: string;
  fareEstimate: string;
  frequency: string;
  originStation: string;
  destStation: string;
  tips?: string;
}

export interface ItineraryDayActivity {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  description: string;
  location: string;
  costEstimate?: string;
  tag?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  theme: string;
  activities: ItineraryDayActivity[];
  culinaryRecommendation?: string;
  transitTip?: string;
}

export interface GeneratedTripPlan {
  id: string;
  title: string;
  tagline: string;
  origin: string;
  destination: string;
  corridor: string;
  distanceKm: number;
  isShortDistance?: boolean;
  transitMode: 'flight' | 'train' | 'road';
  transitSummary?: string;
  recommendedTrains: ExpressTrainOption[];
  selectedTrain?: ExpressTrainOption;
  durationDays: number;
  totalBudget: number;
  dailySpend: number;
  partyType: string;
  interests: string[];
  stayStyle: string;
  days: ItineraryDay[];
  localFoodHighlights: string[];
  hiddenGems: string[];
  packingEssentials: string[];
  coverImage?: string;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface PackingItem {
  id: string;
  text: string;
  category: 'weather' | 'trip-type' | 'essentials';
  packed: boolean;
  reason?: string;
  icon?: string;
}

export interface TripPackingList {
  tripId: string;
  items: PackingItem[];
  weatherSummary: string;
  tripTypeSummary: string;
  totalItems: number;
  packedItems: number;
  percentage: number;
}

export type JournalPhase = 'past' | 'present' | 'future'; // Whenever was going, Whenever is going, Wherever wants to go
export type JournalVisibility = 'public' | 'private'; // Public Guider vs Personal Journal

export interface JournalEntry {
  id: string;
  title: string;
  destination: string;
  origin?: string;
  phase: JournalPhase;
  visibility: JournalVisibility;
  author: string;
  authorAvatar: string;
  date: string;
  story: string;
  transitInfo?: string;
  recommendedTrain?: string;
  mustVisitSpots: string[];
  localFoodRecommendations: string[];
  budgetSpentOrTarget?: number;
  coverImage: string;
  tags: string[];
  likesCount: number;
  isLiked: boolean;
  mottoQuote?: string; // "Life is just going on. Life is too short, make this trip happen!"
  practicalTips?: string[];
  rating?: number;

  // Quick Entry Pinned Fields
  isQuickEntry?: boolean;
  pinnedLocation?: string;
  pinnedTime?: string;
  pinnedMood?: string;
  currentTripId?: string;
  currentTripName?: string;
  coordinates?: { lat: number; lng: number };
}


