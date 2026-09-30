import { FullUserProfile, VerificationApplication, TravelerVouch, GovernmentIdType } from '../types';

export const PROFILE_STORAGE_KEY = 'travel_ai_user_profile_data';
export const VERIFICATION_QUEUE_KEY = 'travel_ai_verification_queue';

export const DEFAULT_PROFILE: FullUserProfile = {
  id: 'user_rabindra_jana',
  name: 'Rabindra Jana',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  homeCity: 'Medinipur, West Bengal',
  livingState: 'West Bengal',
  livingCity: 'Medinipur / Kharagpur',
  currency: '₹ INR',
  travelStyle: 'adventure',
  pace: 'moderate',
  dietary: 'all',
  notificationsEnabled: true,
  bio: 'Passionate authentic explorer, railway enthusiast, and local host. I believe traveling is not about social media filters or vanity metrics—it is about real connections, heritage, and genuine human warmth. "Life is just going on. Life is too short, so make this trip happen!"',
  verificationStatus: 'verified',
  verifiedAt: 'Oct 12, 2026',
  verifiedBadgeTitle: 'Govt ID Verified Host & Explorer',
  verifiedIdType: 'aadhaar',
  maskedIdPreview: 'XXXX-XXXX-4829',
  trustScore: 98,
  journeysCount: 14,
  peopleHelpedCount: 38,
  guidesPublishedCount: 6,
  isAdmin: true,
  hosting: {
    canHost: true,
    livingState: 'West Bengal',
    livingCity: 'Medinipur / Kharagpur (near IIT & historic Midnapore corridors)',
    homeType: 'Private Guest Room & Peaceful Study',
    maxGuests: 2,
    houseRules: [
      'Respect local peace and neighborhood tranquility',
      'No loud late-night noise; pure traveler camaraderie',
      'Warm cup of Bengal morning chai included',
      'Travel stories and railway experiences shared over meals',
    ],
    canGuideWalks: true,
    canHelpRailways: true,
    languages: ['Bengali (বাংলা)', 'Hindi (हिंदी)', 'English'],
    bioIntro: 'Welcome to my living state of West Bengal! Whether you need a warm, safe stay in Medinipur/Kharagpur, transit assistance changing trains at Kharagpur Junction (the iconic world-class railway corridor), or a heritage walk through ancient terracotta temples, you are always welcome.',
    trustNote: 'Identity and residential roots fully verified by government ID. Committed to verified safety and traveler hospitality.',
  },
  vouches: [
    {
      id: 'vouch-1',
      authorName: 'Sourav Ganguly B.',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      authorLocation: 'Kolkata, WB',
      date: 'Aug 24, 2026',
      relationship: 'hosted_me',
      comment: 'Stayed at his home in Medinipur on my way to Digha and Jhargram forests. Unmatched hospitality, hot traditional home-cooked meal, and guided me right to the morning MEMU train. 100% genuine and trustworthy host!',
      verifiedTrip: 'Medinipur - Digha Coastal Route',
      rating: 5,
      aspects: ['Clean Private Room', 'Authentic Bengal Meal', 'Morning Station Guide'],
      hostReply: 'It was a delight hosting you, Sourav! Hope your Digha coastal journey was memorable.',
      hostReplyDate: 'Aug 25, 2026',
      helpfulCount: 8,
    },
    {
      id: 'vouch-2',
      authorName: 'Elena Rostova',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      authorLocation: 'Prague / Solo Backpacker',
      date: 'Sep 02, 2026',
      relationship: 'station_guide',
      comment: 'I was totally lost transferring platforms at Kharagpur Junction during midnight delay. He immediately helped me find the right coach, spoke with the TTE, and stayed until my train safely departed. True angel for solo travelers!',
      verifiedTrip: 'Howrah-Varanasi Express Transit',
      rating: 5,
      aspects: ['Safe for Solo Travelers', 'Punctual Railway Help', 'TTE & Coach Navigation'],
      hostReply: 'Platform transfers at KGP at midnight can be intimidating. Always happy to ensure fellow explorers travel safely!',
      hostReplyDate: 'Sep 03, 2026',
      helpfulCount: 14,
    },
    {
      id: 'vouch-3',
      authorName: 'Marcus Lindqvist',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      authorLocation: 'Stockholm, Sweden',
      date: 'Sep 18, 2026',
      relationship: 'hosted_me',
      comment: 'Living state homestay in Medinipur was the highlight of my trip through Eastern India. Rabindra treated me like family, cooked fresh local fish curry, and explained the history of the legendary Kharagpur railway platform. Unbeatable living state hospitality.',
      verifiedTrip: 'Eastern Railway Circuit',
      rating: 5,
      aspects: ['Authentic Bengal Meal', 'Clean Private Room', 'Warm Host Hospitality', 'Safe for Solo Travelers'],
      hostReply: 'You are welcome back anytime, Marcus! Keep riding the rails with curiosity and respect.',
      hostReplyDate: 'Sep 19, 2026',
      helpfulCount: 11,
    },
    {
      id: 'vouch-4',
      authorName: 'Pooja Sengupta',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      authorLocation: 'Delhi / Heritage Researcher',
      date: 'Oct 01, 2026',
      relationship: 'local_meetup',
      comment: 'Met Rabindra for evening chai near Kansabati River and explored the 17th-century terracotta temples of Midnapore. His deep understanding of local Bengal history and transit connections made all the difference. Truly the heart of community travel!',
      verifiedTrip: 'Midnapore Heritage & Kansabati Trail',
      rating: 5,
      aspects: ['Terracotta & Heritage Knowledge', 'Local Chai Meetup', 'Cultural Depth'],
      helpfulCount: 9,
    },
    {
      id: 'vouch-5',
      authorName: 'Anand Verma',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      authorLocation: 'Varanasi, UP',
      date: 'Oct 04, 2026',
      relationship: 'traveled_together',
      comment: 'Met through Travel AI for the Varanasi Ghats sunrise trail. Deep knowledge of hidden alleys, boatmen ethics, and street food. You can trust him blindly with your travel plans.',
      verifiedTrip: 'Varanasi Ghats Heritage Trail',
      rating: 5,
      aspects: ['Ghats & Hidden Alleys', 'Authentic Street Food', 'Respectful Traveler'],
      helpfulCount: 6,
    },
  ],
};

export const INITIAL_VERIFICATION_APPLICATIONS: VerificationApplication[] = [
  {
    id: 'app-1',
    userId: 'user_rabindra_jana',
    userName: 'Rabindra Jana',
    legalName: 'Rabindra Nath Jana',
    idType: 'aadhaar',
    maskedIdNumber: 'XXXX-XXXX-4829',
    documentFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    livingState: 'West Bengal',
    livingCity: 'Medinipur',
    submittedAt: 'Oct 10, 2026, 11:20 AM',
    reviewedAt: 'Oct 12, 2026, 02:45 PM',
    status: 'verified',
    adminNotes: 'Government Aadhaar and address in West Bengal verified. Awarded Verified Host & Explorer badge.',
    verifiedBadgeTitle: 'Govt ID Verified Host & Explorer',
  },
  {
    id: 'app-2',
    userId: 'user_priya_sharma',
    userName: 'Priya Sharma',
    legalName: 'Priya Sharma',
    idType: 'passport',
    maskedIdNumber: 'TXXXX914',
    documentFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    livingState: 'Himachal Pradesh',
    livingCity: 'Manali / Spiti Valley',
    submittedAt: 'Oct 18, 2026, 09:15 AM',
    status: 'pending',
    verifiedBadgeTitle: 'Govt ID Verified Host & Explorer',
  },
];

export function getStoredUserProfile(): FullUserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load user profile from storage', err);
    return DEFAULT_PROFILE;
  }
}

export function saveStoredUserProfile(profile: FullUserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    // Also sync standard preferences key so Header and other widgets stay in sync
    localStorage.setItem(
      'travel_ai_preferences',
      JSON.stringify({
        name: profile.name,
        avatar: profile.avatar,
        homeCity: profile.homeCity,
        livingState: profile.livingState,
        currency: profile.currency,
        travelStyle: profile.travelStyle,
        pace: profile.pace,
        dietary: profile.dietary,
        notificationsEnabled: profile.notificationsEnabled,
        verificationStatus: profile.verificationStatus,
        verifiedAt: profile.verifiedAt,
      })
    );
  } catch (err) {
    console.warn('Failed to save user profile to storage', err);
  }
}

export function getVerificationApplications(): VerificationApplication[] {
  if (typeof window === 'undefined') return INITIAL_VERIFICATION_APPLICATIONS;
  try {
    const raw = localStorage.getItem(VERIFICATION_QUEUE_KEY);
    if (!raw) return INITIAL_VERIFICATION_APPLICATIONS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_VERIFICATION_APPLICATIONS;
  }
}

export function saveVerificationApplications(apps: VerificationApplication[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VERIFICATION_QUEUE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.warn('Failed to save verification queue', err);
  }
}

export function submitVerificationApplication(data: {
  userId: string;
  userName: string;
  legalName: string;
  idType: GovernmentIdType;
  rawIdNumber: string;
  livingState: string;
  livingCity: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
}): VerificationApplication {
  // Mask sensitive ID (e.g., keep only last 4 digits for privacy)
  const cleaned = data.rawIdNumber.replace(/\s+/g, '');
  const lastFour = cleaned.slice(-4) || 'XXXX';
  const maskedId = `XXXX-XXXX-${lastFour}`;

  const newApp: VerificationApplication = {
    id: 'app-' + Date.now(),
    userId: data.userId,
    userName: data.userName,
    legalName: data.legalName,
    idType: data.idType,
    maskedIdNumber: maskedId,
    documentFrontUrl: data.documentFrontUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    documentBackUrl: data.documentBackUrl,
    livingState: data.livingState,
    livingCity: data.livingCity,
    submittedAt: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'pending',
    verifiedBadgeTitle: 'Govt ID Verified Host & Explorer',
  };

  const current = getVerificationApplications();
  const updated = [newApp, ...current];
  saveVerificationApplications(updated);

  // Update current user status to pending
  const profile = getStoredUserProfile();
  if (profile.id === data.userId || profile.name === data.userName) {
    profile.verificationStatus = 'pending';
    profile.maskedIdPreview = maskedId;
    saveStoredUserProfile(profile);
  }

  try {
    const rawAuth = localStorage.getItem('travel_ai_auth_user_session');
    if (rawAuth) {
      const authUser = JSON.parse(rawAuth);
      if (authUser.id === data.userId || authUser.name === data.userName) {
        authUser.verificationStatus = 'pending';
        authUser.verifiedBadgeTitle = 'Govt ID Submitted (Pending Review)';
        localStorage.setItem('travel_ai_auth_user_session', JSON.stringify(authUser));
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: authUser }));
      }
    }
  } catch (e) {
    console.warn(e);
  }

  return newApp;
}

export function approveVerification(appId: string, adminNotes?: string): void {
  const apps = getVerificationApplications();
  const target = apps.find((a) => a.id === appId);
  if (!target) return;

  target.status = 'verified';
  target.reviewedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  target.adminNotes = adminNotes || 'Government ID and living address verified by Administrator. Verification badge granted.';
  saveVerificationApplications(apps);

  // Update user profile if this matches
  const profile = getStoredUserProfile();
  if (profile.id === target.userId || profile.name === target.userName) {
    profile.verificationStatus = 'verified';
    profile.verifiedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    profile.verifiedBadgeTitle = target.verifiedBadgeTitle || 'Govt ID Verified Traveler';
    profile.verifiedIdType = target.idType;
    profile.maskedIdPreview = target.maskedIdNumber;
    profile.trustScore = Math.max(profile.trustScore, 98);
    saveStoredUserProfile(profile);
  }

  // Also sync current AuthUser session
  try {
    const rawAuth = localStorage.getItem('travel_ai_auth_user_session');
    if (rawAuth) {
      const authUser = JSON.parse(rawAuth);
      if (authUser.id === target.userId || authUser.name === target.userName) {
        authUser.verificationStatus = 'verified';
        authUser.verifiedBadgeTitle = 'Govt ID Verified Traveler';
        localStorage.setItem('travel_ai_auth_user_session', JSON.stringify(authUser));
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: authUser }));
      }
    }
  } catch (e) {
    console.warn(e);
  }
}

export function rejectVerification(appId: string, reason: string): void {
  const apps = getVerificationApplications();
  const target = apps.find((a) => a.id === appId);
  if (!target) return;

  target.status = 'rejected';
  target.reviewedAt = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  target.adminNotes = reason || 'Document was unclear or details could not be authenticated.';
  saveVerificationApplications(apps);

  const profile = getStoredUserProfile();
  if (profile.id === target.userId || profile.name === target.userName) {
    profile.verificationStatus = 'rejected';
    saveStoredUserProfile(profile);
  }

  try {
    const rawAuth = localStorage.getItem('travel_ai_auth_user_session');
    if (rawAuth) {
      const authUser = JSON.parse(rawAuth);
      if (authUser.id === target.userId || authUser.name === target.userName) {
        authUser.verificationStatus = 'unverified';
        authUser.verifiedBadgeTitle = 'Community Explorer';
        localStorage.setItem('travel_ai_auth_user_session', JSON.stringify(authUser));
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: authUser }));
      }
    }
  } catch (e) {
    console.warn(e);
  }
}

export function resetVerificationForTesting(): void {
  const profile = getStoredUserProfile();
  profile.verificationStatus = 'unverified';
  profile.verifiedAt = undefined;
  saveStoredUserProfile(profile);

  try {
    const rawAuth = localStorage.getItem('travel_ai_auth_user_session');
    if (rawAuth) {
      const authUser = JSON.parse(rawAuth);
      authUser.verificationStatus = 'unverified';
      authUser.verifiedBadgeTitle = 'Community Explorer';
      localStorage.setItem('travel_ai_auth_user_session', JSON.stringify(authUser));
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: authUser }));
    }
  } catch (e) {
    console.warn(e);
  }
}

export function addTravelerReview(review: TravelerVouch): FullUserProfile {
  const profile = getStoredUserProfile();
  const updatedVouches = [review, ...(profile.vouches || [])];
  
  // Recalculate people helped and trust score
  const peopleHelped = profile.peopleHelpedCount + 1;
  const updatedProfile: FullUserProfile = {
    ...profile,
    vouches: updatedVouches,
    peopleHelpedCount: peopleHelped,
  };
  saveStoredUserProfile(updatedProfile);
  return updatedProfile;
}

export function toggleReviewHelpful(reviewId: string): FullUserProfile {
  const profile = getStoredUserProfile();
  const updatedVouches = (profile.vouches || []).map((v) => {
    if (v.id === reviewId) {
      return {
        ...v,
        helpfulCount: (v.helpfulCount || 0) + 1,
      };
    }
    return v;
  });

  const updatedProfile = {
    ...profile,
    vouches: updatedVouches,
  };
  saveStoredUserProfile(updatedProfile);
  return updatedProfile;
}

export function addHostReplyToReview(reviewId: string, replyText: string): FullUserProfile {
  const profile = getStoredUserProfile();
  const nowFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const updatedVouches = (profile.vouches || []).map((v) => {
    if (v.id === reviewId) {
      return {
        ...v,
        hostReply: replyText,
        hostReplyDate: nowFormatted,
      };
    }
    return v;
  });

  const updatedProfile = {
    ...profile,
    vouches: updatedVouches,
  };
  saveStoredUserProfile(updatedProfile);
  return updatedProfile;
}

