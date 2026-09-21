import { TravelBadge, TravelLevelInfo, TripItem } from '../types';

export const ALL_BADGES_DEFINITIONS: Omit<TravelBadge, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'badge-local-explorer',
    name: 'Local Explorer',
    description: 'Initiated regional exploration by completing your first stored expedition.',
    icon: 'explore',
    tier: 'bronze',
    requiredCompletedTrips: 1,
    perk: 'Offline PDF itinerary exports & local trail bookmarks',
    category: 'trips_count',
    criteria: 'Complete 1 trip',
  },
  {
    id: 'badge-weekend-pathfinder',
    name: 'Weekend Pathfinder',
    description: 'Mastered quick getaways with 2 completed multi-day journeys.',
    icon: 'signpost',
    tier: 'bronze',
    requiredCompletedTrips: 2,
    perk: 'Budget forecast alerts & route optimization',
    category: 'trips_count',
    criteria: 'Complete 2 trips',
  },
  {
    id: 'badge-frequent-flyer',
    name: 'Frequent Flyer',
    description: 'Skyward voyager and transit veteran with 3+ finished expeditions.',
    icon: 'flight_takeoff',
    tier: 'silver',
    requiredCompletedTrips: 3,
    perk: 'AI multi-leg corridor planner & flight weather tracking',
    category: 'trips_count',
    criteria: 'Complete 3 trips',
  },
  {
    id: 'badge-trail-blazer',
    name: 'Trail Blazer',
    description: 'Navigated 5 diverse terrains from alpine ridges to coastal corridors.',
    icon: 'terrain',
    tier: 'gold',
    requiredCompletedTrips: 5,
    perk: 'Bespoke packing intelligence & emergency offline passes',
    category: 'trips_count',
    criteria: 'Complete 5 trips',
  },
  {
    id: 'badge-globe-trotter',
    name: 'Globe Trotter',
    description: 'Seasoned trans-regional nomad with 8 verified completed journeys.',
    icon: 'travel_explore',
    tier: 'platinum',
    requiredCompletedTrips: 8,
    perk: 'VIP community verified status & custom route badges',
    category: 'trips_count',
    criteria: 'Complete 8 trips',
  },
  {
    id: 'badge-master-voyager',
    name: 'Master Voyager',
    description: 'Legendary explorer status — 12+ expeditions completed across the map.',
    icon: 'military_tech',
    tier: 'diamond',
    requiredCompletedTrips: 12,
    perk: 'All app features unlocked & golden voyager credential',
    category: 'trips_count',
    criteria: 'Complete 12 trips',
  },
];

export interface LevelTierConfig {
  level: number;
  title: string;
  rankTitle: string;
  minTrips: number;
  maxTrips: number;
  badgeName: string;
  badgeIcon: string;
}

export const LEVEL_TIERS: LevelTierConfig[] = [
  {
    level: 1,
    title: 'Novice Nomad',
    rankTitle: 'Explorer Cadet',
    minTrips: 0,
    maxTrips: 1,
    badgeName: 'First Steps',
    badgeIcon: 'footprint',
  },
  {
    level: 2,
    title: 'Local Explorer',
    rankTitle: 'Regional Pathfinder',
    minTrips: 2,
    maxTrips: 3,
    badgeName: 'Local Explorer',
    badgeIcon: 'explore',
  },
  {
    level: 3,
    title: 'Frequent Flyer',
    rankTitle: 'Transit Navigator',
    minTrips: 4,
    maxTrips: 6,
    badgeName: 'Frequent Flyer',
    badgeIcon: 'flight_takeoff',
  },
  {
    level: 4,
    title: 'Trail Blazer',
    rankTitle: 'Veteran Wayfarer',
    minTrips: 7,
    maxTrips: 10,
    badgeName: 'Trail Blazer',
    badgeIcon: 'terrain',
  },
  {
    level: 5,
    title: 'Globe Trotter',
    rankTitle: 'Elite Cosmopolitan',
    minTrips: 11,
    maxTrips: 15,
    badgeName: 'Globe Trotter',
    badgeIcon: 'travel_explore',
  },
  {
    level: 6,
    title: 'Master Voyager',
    rankTitle: 'Grandmaster Explorer',
    minTrips: 16,
    maxTrips: 999,
    badgeName: 'Master Voyager',
    badgeIcon: 'military_tech',
  },
];

export function calculateTravelLevelInfo(trips: TripItem[]): TravelLevelInfo {
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const count = completedTrips.length;

  // Find current level tier
  let currentTier = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (count >= tier.minTrips) {
      currentTier = tier;
    }
  }

  // Find next tier
  const currentTierIndex = LEVEL_TIERS.findIndex((t) => t.level === currentTier.level);
  const nextTier = LEVEL_TIERS[currentTierIndex + 1] || null;

  const currentLevelMinTrips = currentTier.minTrips;
  const nextLevelMinTrips = nextTier ? nextTier.minTrips : currentTier.maxTrips;

  // Calculate percentage between currentLevelMinTrips and nextLevelMinTrips
  let progressPercent = 100;
  let tripsToNextLevel = 0;

  if (nextTier) {
    const range = nextLevelMinTrips - currentLevelMinTrips;
    const progressIntoRange = count - currentLevelMinTrips;
    progressPercent = Math.min(100, Math.max(0, Math.round((progressIntoRange / range) * 100)));
    tripsToNextLevel = Math.max(0, nextLevelMinTrips - count);
  }

  // Map all badges with unlocked flag
  const allBadges: TravelBadge[] = ALL_BADGES_DEFINITIONS.map((badgeDef) => {
    const isUnlocked = count >= badgeDef.requiredCompletedTrips;
    return {
      ...badgeDef,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? 'Unlocked' : undefined,
    };
  });

  const unlockedBadges = allBadges.filter((b) => b.unlocked);
  const nextBadge = allBadges.find((b) => !b.unlocked);

  return {
    level: currentTier.level,
    title: currentTier.title,
    rankTitle: currentTier.rankTitle,
    badgeName: currentTier.badgeName,
    badgeIcon: currentTier.badgeIcon,
    completedTripsCount: count,
    currentLevelMinTrips,
    nextLevelMinTrips,
    progressPercent,
    tripsToNextLevel,
    allBadges,
    unlockedBadges,
    nextBadge,
  };
}
