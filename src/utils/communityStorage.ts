/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SocialPhotoPost,
  CommunityDirectoryUser,
  PlanningCard,
  PlanningCardShareRequest,
  AiTravelCard,
} from '../types';

const STORAGE_KEYS = {
  POSTS: 'travel_ai_social_posts',
  USERS: 'travel_ai_community_users',
  FOLLOWS: 'travel_ai_follow_data',
  REQUESTS: 'travel_ai_planning_requests',
  AI_CARDS: 'travel_ai_generated_cards',
};

// ---------------------------------------------------------------------------
// Pre-seeded Public Community Users (with Verified Badges & State/Group Affiliations)
// ---------------------------------------------------------------------------

export const INITIAL_COMMUNITY_USERS: CommunityDirectoryUser[] = [
  {
    id: 'user-jharkhand-1',
    name: 'Priya Kumari',
    handle: '@priya_ranchi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Proud Ranchi resident & food explorer. Sharing authentic Chotanagpur cuisine, hidden falls (Dassam, Hundru), and local village homestays.',
    location: 'Ranchi, Jharkhand',
    state: 'Jharkhand',
    groups: ['Jharkhand Explorer Group', 'Chotanagpur Food & Heritage'],
    isVerified: true,
    verificationBadge: 'Govt ID Verified Local',
    trustScore: 99,
    followersCount: 1420,
    followingCount: 312,
    isFollowing: false,
    photosCount: 48,
    specialties: ['Dhuska & Rugra Curry', 'Ranchi Waterfalls', 'Local Tribal Haat', 'Vande Bharat Transit'],
    role: 'local_resident',
    friendInfoTip:
      'Private Friend Insider: In Ranchi, visit Lalpur Chowk before 10 AM for the freshest steaming Dhuska. For Dassam falls, hire driver Ramesh (Toto: +91 98351-XXXXX) for safe transit.',
  },
  {
    id: 'user-jharkhand-2',
    name: 'Birsa Soren',
    handle: '@birsa_travels',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Netarhat and Betla forest explorer. Passionate about tribal folklore, sal forest trails, star-gazing, and helping fellow travelers.',
    location: 'Netarhat / Latehar, Jharkhand',
    state: 'Jharkhand',
    groups: ['Jharkhand Explorer Group', 'Betla & Sal Forest Trekkers'],
    isVerified: true,
    verificationBadge: 'Govt ID Verified Traveler',
    trustScore: 98,
    followersCount: 2850,
    followingCount: 190,
    isFollowing: true,
    photosCount: 64,
    specialties: ['Netarhat Magnolia Sunset', 'Betla Tiger Safari', 'Lodh Falls', 'Chotanagpur Plateau'],
    role: 'traveler',
    friendInfoTip:
      'Private Friend Insider: Book the Forest Rest House in Netarhat directly via Latehar DFO. Sunrise is best viewed at Koel View Point at 5:15 AM before tourists wake up.',
  },
  {
    id: 'user-jharkhand-3',
    name: 'Ankit Mahato',
    handle: '@ankit_jamshedpur',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Steel City wanderer & tribal craft advocate. Documenting Dokra brass art, Dalma elephant reserve, and sacred groves across Kolhan.',
    location: 'Jamshedpur, Jharkhand',
    state: 'Jharkhand',
    groups: ['Jharkhand Explorer Group', 'Dalma Eco-Trail Guild'],
    isVerified: true,
    verificationBadge: 'Govt ID Verified Traveler',
    trustScore: 96,
    followersCount: 940,
    followingCount: 420,
    isFollowing: false,
    photosCount: 32,
    specialties: ['Dokra Metal Artisans', 'Dalma Hill Trek', 'Dimna Lake Sunsets', 'Traditional Litti Chokha'],
    role: 'traveler',
    friendInfoTip:
      'Private Friend Insider: To visit Dokra brass artisans in Ghatshila, take the morning Barabhum MEMU. Local artisans sell directly without city showroom markups.',
  },
  {
    id: 'user-bengal-1',
    name: 'Rabindra Jana',
    handle: '@rabindra_jana',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Traveler & App Admin. Welcoming travelers and rail buffs to Kharagpur-Medinipur twin towns across Kangsabati River.',
    location: 'Medinipur, West Bengal',
    state: 'West Bengal',
    groups: ['West Bengal Corridors', 'Railway Heritage Guild'],
    isVerified: true,
    verificationBadge: 'Govt ID Verified Traveler & Admin',
    trustScore: 99,
    followersCount: 3410,
    followingCount: 154,
    isFollowing: true,
    photosCount: 78,
    specialties: ['Kangsabati Rail Crossings', 'Medinipur Chhana-boda', 'Gopegarh Eco-Park', 'Homestay Suites'],
    role: 'traveler',
    friendInfoTip:
      'Private Friend Insider: Board Rupashi Bangla (12883) from Kharagpur Platform 7 at 8:30 AM. My homestay is 10 mins from station, hot chai and Chhana-boda waiting for you!',
  },
  {
    id: 'user-bengal-2',
    name: 'Subhashish Roy',
    handle: '@subhashish_travels',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    bio: 'Bengal heritage explorer. Documenting Midnapore Collegiate, Karnagarh temples, and terracotta corridors for fellow travelers.',
    location: 'Kharagpur, West Bengal',
    state: 'West Bengal',
    groups: ['West Bengal Corridors', 'Midnapore Heritage Circle'],
    isVerified: true,
    verificationBadge: 'Govt ID Verified Traveler',
    trustScore: 99,
    followersCount: 1890,
    followingCount: 210,
    isFollowing: false,
    photosCount: 52,
    specialties: ['Revolutionary Sites', 'Karnagarh Chuar Ruins', 'Kharagpur Rail Museum'],
    role: 'traveler',
    friendInfoTip:
      'Private Friend Insider: When visiting Karnagarh, hire a toto rickshaw from Battala. Mention my name at Mahamaya temple for access to the antique bell archive.',
  },
  {
    id: 'user-himachal-1',
    name: 'Sonam Tsering',
    handle: '@sonam_ladakh',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'High-pass trekker and local homestay coordinator in Ladakh & Spiti. Encouraging zero-waste mountain travel.',
    location: 'Leh, Ladakh',
    state: 'Himachal / Ladakh',
    groups: ['Himalayan High-Pass Club', 'Spiti & Zanskar Trekkers'],
    isVerified: true,
    verificationBadge: 'Govt ID Verified Guider',
    trustScore: 97,
    followersCount: 4120,
    followingCount: 390,
    isFollowing: false,
    photosCount: 88,
    specialties: ['Khardung La Passes', 'Thiksey Monastery Dawn', 'Butter Tea & Thukpa', 'Acclimatization'],
    role: 'guider',
    friendInfoTip:
      'Private Friend Insider: Never rush to Khardung La on Day 1. Drink Seabuckthorn juice available in Leh main bazaar for rapid altitude acclimatization.',
  },
  {
    id: 'user-rajasthan-1',
    name: 'Meera Rathore',
    handle: '@meera_jaipur',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Jaipur cultural archivist and culinary enthusiast. Exploring walled-city stepwells, block-printing ateliers, and royal recipes.',
    location: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    groups: ['Rajasthan Heritage Club', 'Royal Culinary Circle'],
    isVerified: true,
    verificationBadge: 'Govt ID Verified Local',
    trustScore: 98,
    followersCount: 2150,
    followingCount: 280,
    isFollowing: false,
    photosCount: 60,
    specialties: ['Dal Baati Churma', 'Amber Fort Secret Stairs', 'Bagru Handblock Printing'],
    role: 'local_resident',
    friendInfoTip:
      'Private Friend Insider: For authentic Pyaaz Kachori, skip the tourist chain near Sindhi Camp and go to Rawat near the old gate at 7:00 AM.',
  },
];

// ---------------------------------------------------------------------------
// Pre-seeded Social Photo & Food Feed (Instagram-Style)
// ---------------------------------------------------------------------------

export const INITIAL_SOCIAL_POSTS: SocialPhotoPost[] = [
  {
    id: 'post-food-1',
    authorId: 'user-jharkhand-1',
    authorName: 'Priya Kumari',
    authorHandle: '@priya_ranchi',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorBadge: 'Govt ID Verified Local',
    isVerified: true,
    groupAffiliation: 'Jharkhand Explorer Group',
    stateTag: 'Jharkhand',
    photoUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    caption:
      'Nothing beats waking up in Ranchi to sizzling hot Dhuska! Made with rice and chana dal batter, fried till golden and puffy, served with spicy desi chana ghugni and tangy tomato-garlic chutney. Cost: ₹25 for two huge pieces at Upper Bazaar. Must try if visiting Jharkhand! 🌿',
    foodOrDishName: 'Crispy Jharkhand Dhuska & Desi Chana Ghugni',
    location: 'Upper Bazaar, Ranchi, Jharkhand',
    type: 'food',
    likesCount: 184,
    liked: false,
    comments: [
      {
        id: 'c1',
        author: 'Ankit Mahato',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        text: 'The absolute king of morning breakfasts in Jharkhand! Best with green chilli chutney.',
        timeAgo: '2h ago',
      },
      {
        id: 'c2',
        author: 'Rabindra Jana',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Looks mouthwatering Priya! When I come on the Ranchi Vande Bharat, this is our first stop.',
        timeAgo: '1h ago',
      },
    ],
    timestamp: '3 hours ago',
    tags: ['JharkhandFood', 'Dhuska', 'RanchiEats', 'StreetFood', 'AuthenticFlavors'],
  },
  {
    id: 'post-scenic-1',
    authorId: 'user-jharkhand-2',
    authorName: 'Birsa Soren',
    authorHandle: '@birsa_travels',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    authorBadge: 'Govt ID Verified Traveler',
    isVerified: true,
    groupAffiliation: 'Jharkhand Explorer Group',
    stateTag: 'Jharkhand',
    photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    caption:
      'Misty morning over the Queen of Chotanagpur. Watching dawn break over Koel river valley from Netarhat. The sal forest mist smells of fresh rain and pine. If you are traveling here and want friend tips or rest house guidance, send me a verified planning request! ⛰️',
    location: 'Koel View Point, Netarhat, Jharkhand',
    type: 'scenic',
    likesCount: 246,
    liked: true,
    comments: [
      {
        id: 'c3',
        author: 'Priya Kumari',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Netarhat in monsoon and autumn is pure heaven! Great capture Birsa.',
        timeAgo: '4h ago',
      },
    ],
    timestamp: '5 hours ago',
    tags: ['JharkhandTourism', 'Netarhat', 'Chotanagpur', 'ScenicVista', 'NatureWalk'],
  },
  {
    id: 'post-food-2',
    authorId: 'user-jharkhand-3',
    authorName: 'Ankit Mahato',
    authorHandle: '@ankit_jamshedpur',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    authorBadge: 'Govt ID Verified Explorer',
    isVerified: true,
    groupAffiliation: 'Jharkhand Explorer Group',
    stateTag: 'Jharkhand',
    photoUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    caption:
      'Smoky rustic Litti Chokha roasted over slow wood charcoal on the road between Ranchi and Deoghar! Stuffed with roasted gram sattu, crushed garlic, mustard oil, and served with flame-charred baingan-aloo chokha dipped in pure ghee. ₹60 per plate! 🌶️🔥',
    foodOrDishName: 'Charcoal-Fired Litti Chokha with Desi Ghee',
    location: 'Deoghar Highway, Jharkhand',
    type: 'food',
    likesCount: 312,
    liked: false,
    comments: [],
    timestamp: '1 day ago',
    tags: ['LittiChokha', 'JharkhandFlavors', 'RoadTripEats', 'DesiFood'],
  },
  {
    id: 'post-food-3',
    authorId: 'user-bengal-1',
    authorName: 'Rabindra Jana',
    authorHandle: '@rabindra_host',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorBadge: 'Govt ID Verified Host & Admin',
    isVerified: true,
    groupAffiliation: 'West Bengal Corridors',
    stateTag: 'West Bengal',
    photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    caption:
      'The crown jewel of Medinipur confectionery: Chhana-boda! Burnt caramelized crust on the outside, succulent juicy cottage cheese inside that melts in your mouth. Prepared for over 150 years in Battala bazaar. Treat yourself when visiting my homestay! 🍮',
    foodOrDishName: 'Authentic Medinipur Chhana-boda',
    location: 'Battala, Medinipur, West Bengal',
    type: 'food',
    likesCount: 289,
    liked: true,
    comments: [
      {
        id: 'c4',
        author: 'Subhashish Roy',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
        text: 'The best sweet in all of Bengal! Even better than rosogolla.',
        timeAgo: '1d ago',
      },
    ],
    timestamp: '1 day ago',
    tags: ['MedinipurSweets', 'ChhanaBoda', 'BengalHeritage', 'SweetTooth'],
  },
  {
    id: 'post-scenic-2',
    authorId: 'user-bengal-2',
    authorName: 'Subhashish Roy',
    authorHandle: '@subhashish_guider',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    authorBadge: 'Certified Heritage Guider',
    isVerified: true,
    groupAffiliation: 'West Bengal Corridors',
    stateTag: 'West Bengal',
    photoUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    caption:
      'Cross-Kangsabati rail bridge at golden hour. Train 12883 Rupashi Bangla passing over the waters between Kharagpur and Medinipur. 18-minute scenic crossing connecting both twin towns. 🚆✨',
    location: 'Kangsabati Rail Bridge, Kharagpur',
    type: 'scenic',
    likesCount: 198,
    liked: false,
    comments: [],
    timestamp: '2 days ago',
    tags: ['RailCorridor', 'Kharagpur', 'Medinipur', 'GoldenHour'],
  },
];

// ---------------------------------------------------------------------------
// Pre-seeded Planning Cards (Available for sharing with verified members)
// ---------------------------------------------------------------------------

export const DEFAULT_PLANNING_CARDS: PlanningCard[] = [
  {
    id: 'plan-card-jharkhand-1',
    title: 'Ranchi to Netarhat 3-Day Waterfalls & Sal Forest Trail',
    corridor: 'Ranchi Jn ➔ Dassam Falls ➔ Netarhat Sunset',
    state: 'Jharkhand',
    durationDays: 3,
    budget: '₹6,800',
    transitMode: 'Train & Forest Cab',
    highlights: ['Dassam & Hundru Falls', 'Magnolia Sunset Point', 'Dhuska at Lalpur', 'Koel View Sunrise'],
    notes: 'Looking for a verified local friend to advise on road conditions and safe homestays near Netarhat.',
  },
  {
    id: 'plan-card-bengal-1',
    title: 'Kharagpur to Medinipur Heritage & Freedom Trail',
    corridor: 'KGP Junction ➔ Kangsabati River ➔ Battala Bazaar',
    state: 'West Bengal',
    durationDays: 2,
    budget: '₹2,800',
    transitMode: 'Express Train (12883) & Toto',
    highlights: ['Gopegarh Heritage Eco-Park', 'Chhana-boda Sweet Trail', 'Vidyasagar Memorial', 'Karnagarh Temple'],
    notes: 'Sharing with host Rabindra Jana to arrange homestay check-in and heritage walking map.',
  },
  {
    id: 'plan-card-jharkhand-2',
    title: 'Deoghar Pilgrimage & Tribal Craft Expedition',
    corridor: 'Jasidih Jn ➔ Baidyanath Dham ➔ Dokra Village',
    state: 'Jharkhand',
    durationDays: 2,
    budget: '₹4,500',
    transitMode: 'Express Rail & Local Auto',
    highlights: ['Baidyanath Jyotirlinga', 'Trikut Pahar Ropeway', 'Fresh Litti Chokha', 'Dokra Artisan Haat'],
    notes: 'Would love insider tips from verified members on queue timings and reliable local cab drivers.',
  },
];

// ---------------------------------------------------------------------------
// Pre-seeded Friend / Planning Card Share Requests
// ---------------------------------------------------------------------------

export const INITIAL_PLANNING_REQUESTS: PlanningCardShareRequest[] = [
  {
    id: 'req-demo-1',
    senderId: 'current-user',
    senderName: 'Explorer (You)',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    senderCity: 'Kolkata, WB',
    recipientId: 'user-jharkhand-1',
    recipientName: 'Priya Kumari',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recipientGroup: 'Jharkhand Explorer Group',
    recipientBadge: 'Govt ID Verified Local',
    planningCard: DEFAULT_PLANNING_CARDS[0],
    requestMessage:
      "Hi Priya! I saw your verified badge in the Jharkhand Explorer Group. I'm taking the Ranchi Vande Bharat next week with this 3-day waterfall plan. Could you review my planning chart and give me tips on where to eat the best Dhuska and which toto drivers to trust?",
    status: 'accepted',
    createdAt: 'Yesterday, 4:30 PM',
    friendInformationReply: {
      acceptedAt: 'Yesterday, 5:15 PM',
      tips: [
        'Dhuska is best at Ramu Dhuska Stall near Lalpur Chowk before 10 AM (₹25/plate).',
        'Avoid visiting Dassam Falls after 4 PM as rural roads get deserted. Stick to morning hours.',
        'Call my trusted family driver Ramesh (+91 98351-44210) for reasonable whole-day rates.',
      ],
      localContactPhone: '+91 98351-44210 (Driver Ramesh)',
      secretSpot: 'Koel View Point at 5:15 AM before gate opens for public tourists.',
      foodRecommendation: 'Try fresh warm Rugra (indigenous mushroom curry) if visiting in monsoon/early winter.',
      transitGuidance: 'Take the early morning state express bus from Khadgarha terminal directly to Netarhat.',
    },
  },
  {
    id: 'req-demo-2',
    senderId: 'user-jharkhand-3',
    senderName: 'Ankit Mahato',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    senderCity: 'Jamshedpur, Jharkhand',
    recipientId: 'current-user',
    recipientName: 'Explorer (You)',
    recipientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    recipientGroup: 'Jharkhand Explorer Group',
    recipientBadge: 'Verified Explorer Member',
    planningCard: DEFAULT_PLANNING_CARDS[2],
    requestMessage:
      'Hello fellow traveler! I am planning a weekend train trip connecting Jamshedpur to Medinipur and Kharagpur. Can we connect as verified friends and share local food & transit tips?',
    status: 'pending',
    createdAt: 'Today, 8:45 AM',
  },
];

// ---------------------------------------------------------------------------
// Pre-seeded AI Generated Travel Cards (Shared between Journal & Profile)
// ---------------------------------------------------------------------------

export const INITIAL_AI_CARDS: AiTravelCard[] = [
  {
    id: 'ai-card-1',
    title: 'Jharkhand Heritage & Sal Forest Passport',
    category: 'profile_passport',
    targetSection: 'profile',
    authorName: 'Explorer (You)',
    authorRole: 'Verified Explorer Member',
    destination: 'Ranchi & Netarhat Plateau',
    regionOrGroup: 'Jharkhand Explorer Group',
    vibeQuote: 'Across the sal forests and roaring cascades of Chotanagpur, authentic hospitality welcomes the curious traveler.',
    highlights: ['Koel Sunrise Point', 'Dassam & Hundru Falls', 'Upper Bazaar Dhuska', 'Tribal Haat Arts'],
    favoriteFood: 'Crispy Dhuska with spicy Chana Ghugni & Rugra Curry',
    verifiedStamp: true,
    badgeText: 'Jharkhand Verified Explorer Badge',
    createdAt: 'Sep 2026',
    isSharedToFeed: true,
  },
  {
    id: 'ai-card-2',
    title: 'Cross-Kangsabati Rail & Sweet Corridor Summary',
    category: 'journal_summary',
    targetSection: 'journal',
    authorName: 'Rabindra Jana',
    authorRole: 'Host & Admin',
    destination: 'Kharagpur & Medinipur',
    regionOrGroup: 'West Bengal Corridors',
    vibeQuote: 'An 18-minute scenic rail crossing where history, revolutionary heritage, and warm Bengali sweets meet.',
    highlights: ['Gopegarh Ecopark Fort', 'Kangsabati River Sunset', 'Battala Chhana-boda', 'Rupashi Bangla Express'],
    favoriteFood: 'Caramelized Medinipur Chhana-boda',
    verifiedStamp: true,
    badgeText: 'Govt ID Verified Host Badge',
    createdAt: 'Sep 2026',
    isSharedToFeed: true,
  },
];

// ---------------------------------------------------------------------------
// Storage Accessors & Persistent Helpers
// ---------------------------------------------------------------------------

export function getStoredCommunityUsers(): CommunityDirectoryUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveStoredCommunityUsers(INITIAL_COMMUNITY_USERS);
      return INITIAL_COMMUNITY_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMUNITY_USERS;
  }
}

export function saveStoredCommunityUsers(users: CommunityDirectoryUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.warn('saveStoredCommunityUsers error:', err);
  }
}

export function toggleFollowUser(userId: string): { users: CommunityDirectoryUser[]; isFollowing: boolean } {
  const users = getStoredCommunityUsers();
  let updatedStatus = false;
  const updatedUsers = users.map((u) => {
    if (u.id === userId) {
      const nextFollow = !u.isFollowing;
      updatedStatus = nextFollow;
      return {
        ...u,
        isFollowing: nextFollow,
        followersCount: nextFollow ? u.followersCount + 1 : Math.max(0, u.followersCount - 1),
      };
    }
    return u;
  });
  saveStoredCommunityUsers(updatedUsers);
  return { users: updatedUsers, isFollowing: updatedStatus };
}

// ---------------------------------------------------------------------------
// Social Posts Helpers
// ---------------------------------------------------------------------------

export function getStoredSocialPosts(): SocialPhotoPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) {
      saveStoredSocialPosts(INITIAL_SOCIAL_POSTS);
      return INITIAL_SOCIAL_POSTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SOCIAL_POSTS;
  }
}

export function saveStoredSocialPosts(posts: SocialPhotoPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  } catch (err) {
    console.warn('saveStoredSocialPosts error:', err);
  }
}

export function addSocialPost(post: Omit<SocialPhotoPost, 'id'> & { id?: string }): SocialPhotoPost[] {
  const posts = getStoredSocialPosts();
  const newPost: SocialPhotoPost = {
    ...post,
    id: post.id || `post-${Date.now()}`,
  };
  const next = [newPost, ...posts];
  saveStoredSocialPosts(next);
  return next;
}

export function toggleLikeSocialPost(postId: string): SocialPhotoPost[] {
  const posts = getStoredSocialPosts();
  const next = posts.map((p) => {
    if (p.id === postId) {
      const nextLiked = !p.liked;
      return {
        ...p,
        liked: nextLiked,
        likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
      };
    }
    return p;
  });
  saveStoredSocialPosts(next);
  return next;
}

export function addCommentToSocialPost(postId: string, commentText: string, authorName = 'Explorer (You)'): SocialPhotoPost[] {
  const posts = getStoredSocialPosts();
  const next = posts.map((p) => {
    if (p.id === postId) {
      const newComment = {
        id: `c-${Date.now()}`,
        author: authorName,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: commentText,
        timeAgo: 'Just now',
      };
      return {
        ...p,
        comments: [...p.comments, newComment],
      };
    }
    return p;
  });
  saveStoredSocialPosts(next);
  return next;
}

// ---------------------------------------------------------------------------
// Planning Card Share Requests Helpers
// ---------------------------------------------------------------------------

export function getStoredPlanningRequests(): PlanningCardShareRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) {
      saveStoredPlanningRequests(INITIAL_PLANNING_REQUESTS);
      return INITIAL_PLANNING_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PLANNING_REQUESTS;
  }
}

export function saveStoredPlanningRequests(requests: PlanningCardShareRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.warn('saveStoredPlanningRequests error:', err);
  }
}

export function sendPlanningCardRequest(request: PlanningCardShareRequest): PlanningCardShareRequest[] {
  const requests = getStoredPlanningRequests();
  const next = [request, ...requests];
  saveStoredPlanningRequests(next);
  return next;
}

export function respondToPlanningRequest(
  requestId: string,
  newStatus: 'accepted' | 'declined',
  friendInfoReply?: PlanningCardShareRequest['friendInformationReply']
): PlanningCardShareRequest[] {
  const requests = getStoredPlanningRequests();
  const next = requests.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: newStatus,
        friendInformationReply: friendInfoReply || r.friendInformationReply,
      };
    }
    return r;
  });
  saveStoredPlanningRequests(next);
  return next;
}

// ---------------------------------------------------------------------------
// AI Travel Cards Helpers (Journal & Profile)
// ---------------------------------------------------------------------------

export function getStoredAiCards(): AiTravelCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CARDS);
    if (!raw) {
      saveStoredAiCards(INITIAL_AI_CARDS);
      return INITIAL_AI_CARDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AI_CARDS;
  }
}

export function saveStoredAiCards(cards: AiTravelCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_CARDS, JSON.stringify(cards));
  } catch (err) {
    console.warn('saveStoredAiCards error:', err);
  }
}

export function addAiTravelCard(card: AiTravelCard): AiTravelCard[] {
  const cards = getStoredAiCards();
  const next = [card, ...cards];
  saveStoredAiCards(next);

  // If card is flagged to share to social feed, automatically post it to the Instagram-style feed!
  if (card.isSharedToFeed) {
    const newSocialPost: SocialPhotoPost = {
      id: `post-ai-${Date.now()}`,
      authorId: 'current-user',
      authorName: card.authorName,
      authorHandle: '@explorer',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      authorBadge: card.badgeText,
      isVerified: card.verifiedStamp,
      groupAffiliation: card.regionOrGroup,
      stateTag: card.destination.includes('Jharkhand') || card.regionOrGroup.includes('Jharkhand') ? 'Jharkhand' : 'West Bengal',
      photoUrl: card.destination.includes('Jharkhand')
        ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
      caption: `✨ [AI Travel Card] "${card.vibeQuote}"\n\n📍 ${card.destination} (${card.regionOrGroup})\n🍽️ Favorite Food: ${card.favoriteFood}\n⭐ Key Highlights: ${card.highlights.join(' • ')}`,
      foodOrDishName: card.favoriteFood,
      location: card.destination,
      type: 'heritage',
      likesCount: 1,
      liked: true,
      comments: [],
      timestamp: 'Just now',
      tags: ['AITravelCard', card.regionOrGroup.replace(/\s+/g, ''), 'VerifiedTraveler'],
    };
    addSocialPost(newSocialPost);
  }

  return next;
}
