export type ScreenType =
  | 'dashboard'
  | 'host-dashboard'
  | 'guider-dashboard'
  | 'planner'
  | 'trips'
  | 'journal'
  | 'explore'
  | 'community'
  | 'map'
  | 'achievements'
  | 'goals'
  | 'profile';

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
  livingState?: string;
  currency: string;
  travelStyle: 'budget' | 'balanced' | 'luxury' | 'adventure';
  pace: 'relaxed' | 'moderate' | 'fast';
  dietary: 'all' | 'veg' | 'vegan' | 'halal' | 'jain';
  notificationsEnabled: boolean;
  verificationStatus?: VerificationStatusType;
  verifiedAt?: string;
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

export type VerificationStatusType = 'unverified' | 'pending' | 'verified' | 'rejected';

export type GovernmentIdType =
  | 'aadhaar'
  | 'passport'
  | 'voter_id'
  | 'driving_license'
  | 'national_id';

export interface VerificationApplication {
  id: string;
  userId: string;
  userName: string;
  legalName: string;
  idType: GovernmentIdType;
  maskedIdNumber: string; // Sensitive full ID is never stored insecurely or displayed publicly
  documentFrontUrl?: string;
  documentBackUrl?: string;
  livingState: string;
  livingCity: string;
  submittedAt: string;
  reviewedAt?: string;
  status: VerificationStatusType;
  adminNotes?: string;
  verifiedBadgeTitle: string; // e.g. "Govt ID Verified Host & Explorer"
}

export interface HostingOffer {
  canHost: boolean;
  livingState: string;
  livingCity: string;
  homeType: string;
  maxGuests: number;
  houseRules: string[];
  canGuideWalks: boolean; // Meet for chai & local heritage walk
  canHelpRailways: boolean; // Station & train connection assistance
  languages: string[];
  bioIntro: string;
  trustNote: string;
}

export interface TravelerVouch {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorLocation: string;
  date: string;
  relationship: 'hosted_me' | 'traveled_together' | 'local_meetup' | 'station_guide';
  comment: string;
  verifiedTrip?: string;
  rating: number;
  aspects?: string[];
  hostReply?: string;
  hostReplyDate?: string;
  helpfulCount?: number;
}

export interface FullUserProfile extends UserPreferences {
  id: string;
  bio: string;
  verificationStatus: VerificationStatusType;
  verifiedAt?: string;
  verifiedBadgeTitle?: string;
  verifiedIdType?: GovernmentIdType;
  maskedIdPreview?: string;
  livingState: string;
  livingCity: string;
  hosting: HostingOffer;
  trustScore: number; // e.g. 98%
  journeysCount: number;
  peopleHelpedCount: number;
  guidesPublishedCount: number;
  vouches: TravelerVouch[];
  isAdmin?: boolean;
}

export type UserRole = 'admin' | 'user' | 'guider';

export interface GuiderTour {
  id: string;
  title: string;
  category: string;
  duration: string;
  meetingPoint: string;
  pricePerPerson: number;
  maxGroupSize: number;
  bookedCount: number;
  languages: string[];
  scheduleTime: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  highlights: string[];
  registeredTravelers: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    partySize: number;
    specialRequest?: string;
  }[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  homeCity: string;
  livingState?: string;
  bio?: string;
  verificationStatus: VerificationStatusType;
  verifiedBadgeTitle?: string;
  isAdmin: boolean;
  isGuider?: boolean;
  guiderBadge?: string;
  guiderSpecialty?: string;
  guiderRating?: number;
  guiderToursCount?: number;
  guiderLanguages?: string[];
  travelStyle?: string;
  pace?: string;
  currency?: string;
  tripsCount?: number;
  travelLevel?: string;
}

export type HostServiceType = 'homestay' | 'guided_walk' | 'bengal_meals' | 'station_transfer';

export interface HostTripRequest {
  id: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar: string;
  travelerCity: string;
  travelerEmail: string;
  isVerified: boolean;
  verifiedBadgeTitle?: string;
  checkInDate: string;
  checkOutDate: string;
  durationNights: number;
  guestsCount: number;
  purpose: string;
  servicesRequested: HostServiceType[];
  nightlyRate: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requestNote: string;
  submittedAt: string;
  hostResponseNote?: string;
  paymentStatus: 'escrow' | 'paid' | 'pending' | 'refunded';
}

export interface HostEarningsSummary {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  pendingPayout: number;
  completedPayoutsCount: number;
  averageBookingValue: number;
  currency: string;
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
    icon: string;
  }[];
  monthlyData: {
    month: string;
    amount: number;
    bookings: number;
  }[];
  recentTransactions: {
    id: string;
    date: string;
    guestName: string;
    service: string;
    amount: number;
    status: 'payout_completed' | 'processing' | 'escrow';
    payoutMethod: string;
  }[];
}

// ---------------------------------------------------------------------------
// Community Pillar 1 & 2: Social Photo/Food Posts & Public User Directory
// ---------------------------------------------------------------------------

export type CommunityCategory = 'all' | 'food' | 'scenic' | 'heritage' | 'tips';

export interface SocialPhotoPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorBadge?: string;
  isVerified: boolean;
  groupAffiliation: string; // e.g. 'Jharkhand Explorer Group', 'West Bengal Corridors'
  stateTag: string; // 'Jharkhand' | 'West Bengal' | 'Himachal Pradesh' | 'Rajasthan' | etc.
  photoUrl: string;
  caption: string;
  foodOrDishName?: string;
  location: string;
  type: 'food' | 'scenic' | 'heritage' | 'tips';
  likesCount: number;
  liked: boolean;
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    timeAgo: string;
  }[];
  timestamp: string;
  tags: string[];
}

export interface CommunityDirectoryUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location: string;
  state: string; // e.g. 'Jharkhand', 'West Bengal', 'Himachal Pradesh'
  groups: string[]; // e.g. ['Jharkhand Explorer Group', 'Chotanagpur Heritage Club']
  isVerified: boolean;
  verificationBadge: string; // e.g. 'Govt ID Verified Local', 'Jharkhand Certified Host'
  trustScore: number; // e.g. 98
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  photosCount: number;
  specialties: string[];
  role: 'traveler' | 'local_resident' | 'guider' | 'host';
  friendInfoTip?: string; // Information shared when they accept a friend request
}

export interface PlanningCard {
  id: string;
  title: string;
  corridor: string;
  state: string;
  durationDays: number;
  budget: string;
  highlights: string[];
  transitMode: string;
  notes: string;
}

export interface PlanningCardShareRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCity: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientGroup: string;
  recipientBadge: string;
  planningCard: PlanningCard;
  requestMessage: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  friendInformationReply?: {
    acceptedAt: string;
    tips: string[];
    localContactPhone?: string;
    secretSpot: string;
    foodRecommendation: string;
    transitGuidance: string;
  };
}

export interface AiTravelCard {
  id: string;
  title: string;
  category: 'journal_summary' | 'profile_passport' | 'foodie_badge' | 'regional_vibe';
  targetSection: 'journal' | 'profile' | 'community';
  authorName: string;
  authorRole: string;
  destination: string;
  regionOrGroup: string;
  vibeQuote: string;
  highlights: string[];
  favoriteFood: string;
  verifiedStamp: boolean;
  badgeText: string;
  createdAt: string;
  isSharedToFeed: boolean;
}



