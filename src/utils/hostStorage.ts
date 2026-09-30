import { HostTripRequest, HostEarningsSummary } from '../types';
import { getStoredUserProfile, saveStoredUserProfile } from './profileStorage';

export const HOST_REQUESTS_KEY = 'travel_ai_host_trip_requests';
export const HOST_PAYOUTS_KEY = 'travel_ai_host_payouts_ledger';

export const INITIAL_HOST_REQUESTS: HostTripRequest[] = [
  {
    id: 'req-elena-101',
    travelerId: 'traveler-elena',
    travelerName: 'Elena Rostova',
    travelerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    travelerCity: 'Prague / Solo Backpacker',
    travelerEmail: 'elena.rostova.travel@gmail.com',
    isVerified: true,
    verifiedBadgeTitle: 'Passport & Identity Verified',
    checkInDate: '2026-10-28',
    checkOutDate: '2026-10-31',
    durationNights: 3,
    guestsCount: 1,
    purpose: 'Midnapore terracotta temple photography & Kharagpur Junction midnight platform transfer',
    servicesRequested: ['homestay', 'bengal_meals', 'station_transfer'],
    nightlyRate: 1400,
    totalAmount: 4200,
    currency: '₹ INR',
    status: 'pending',
    requestNote:
      'Namaste Rabindra! I am returning through Eastern India on my way from Howrah to Puri. I loved reading your verified railway guides and vouches. I would be honored to stay in your guest room for 3 nights and learn about local Bengal history!',
    submittedAt: 'Oct 20, 2026, 04:30 PM',
    paymentStatus: 'escrow',
  },
  {
    id: 'req-anirban-102',
    travelerId: 'traveler-anirban',
    travelerName: 'Anirban & Maya Mukherjee',
    travelerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    travelerCity: 'Bengaluru, Karnataka',
    travelerEmail: 'anirban.arch@gmail.com',
    isVerified: true,
    verifiedBadgeTitle: 'Aadhaar Verified Explorer',
    checkInDate: '2026-11-05',
    checkOutDate: '2026-11-07',
    durationNights: 2,
    guestsCount: 2,
    purpose: 'Field research on 17th Century Bengal terracotta temples and Kansabati river heritage',
    servicesRequested: ['homestay', 'guided_walk', 'bengal_meals'],
    nightlyRate: 1800,
    totalAmount: 5600,
    currency: '₹ INR',
    status: 'pending',
    requestNote:
      'Namaskar Rabindra Da! We are two architectural researchers visiting from Bengaluru. We read your public guides on Bengal terracotta temples and Kansabati trail. We would be grateful to stay at your homestay and have your guided walking tour.',
    submittedAt: 'Oct 21, 2026, 10:15 AM',
    paymentStatus: 'escrow',
  },
  {
    id: 'req-sourav-103',
    travelerId: 'traveler-sourav',
    travelerName: 'Sourav Ganguly B.',
    travelerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    travelerCity: 'Kolkata, West Bengal',
    travelerEmail: 'sourav.ganguly.wb@gmail.com',
    isVerified: true,
    verifiedBadgeTitle: 'Govt ID Verified Host & Explorer',
    checkInDate: '2026-11-14',
    checkOutDate: '2026-11-16',
    durationNights: 2,
    guestsCount: 1,
    purpose: 'Jhargram sal forest cycling stopover and local train corridor ride',
    servicesRequested: ['homestay', 'bengal_meals'],
    nightlyRate: 1400,
    totalAmount: 2800,
    currency: '₹ INR',
    status: 'accepted',
    requestNote: 'Returning for another memorable stay! Excited for morning Bengal chai and train discussions.',
    submittedAt: 'Oct 18, 2026, 02:40 PM',
    hostResponseNote: 'Always a pleasure, Sourav! Your guest room is confirmed and freshly prepared.',
    paymentStatus: 'paid',
  },
  {
    id: 'req-marcus-104',
    travelerId: 'traveler-marcus',
    travelerName: 'Marcus Lindqvist',
    travelerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    travelerCity: 'Stockholm, Sweden',
    travelerEmail: 'marcus.lindqvist@gmail.com',
    isVerified: true,
    verifiedBadgeTitle: 'Passport Verified International Traveler',
    checkInDate: '2026-09-16',
    checkOutDate: '2026-09-18',
    durationNights: 2,
    guestsCount: 1,
    purpose: 'Eastern Railway corridor documentary & local village stay',
    servicesRequested: ['homestay', 'bengal_meals', 'guided_walk'],
    nightlyRate: 1600,
    totalAmount: 3200,
    currency: '₹ INR',
    status: 'completed',
    requestNote: 'Looking forward to meeting Rabindra and tasting traditional Bengali cuisine.',
    submittedAt: 'Sep 10, 2026, 11:00 AM',
    hostResponseNote: 'Marcus had a fantastic stay. 5-star review received!',
    paymentStatus: 'paid',
  },
  {
    id: 'req-priya-105',
    travelerId: 'traveler-priya',
    travelerName: 'Priya Sharma',
    travelerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    travelerCity: 'New Delhi, Delhi',
    travelerEmail: 'priya.traveler@gmail.com',
    isVerified: true,
    verifiedBadgeTitle: 'Aspiring Verified Explorer',
    checkInDate: '2026-08-20',
    checkOutDate: '2026-08-22',
    durationNights: 2,
    guestsCount: 1,
    purpose: 'Solo Indian Railways transit exploration',
    servicesRequested: ['homestay', 'station_transfer'],
    nightlyRate: 1200,
    totalAmount: 2400,
    currency: '₹ INR',
    status: 'completed',
    requestNote: 'Safe accommodation needed near Kharagpur Junction during midnight train transfer.',
    submittedAt: 'Aug 14, 2026, 03:15 PM',
    hostResponseNote: 'Safely escorted to platform and enjoyed great travel talk.',
    paymentStatus: 'paid',
  },
];

export const INITIAL_EARNINGS_SUMMARY: HostEarningsSummary = {
  totalRevenue: 48250,
  thisMonthRevenue: 14800,
  lastMonthRevenue: 12100,
  pendingPayout: 9800, // In escrow for upcoming stays
  completedPayoutsCount: 14,
  averageBookingValue: 3450,
  currency: '₹ INR',
  breakdown: [
    {
      category: 'Homestay Guest Room',
      amount: 29800,
      percentage: 62,
      color: '#00685f',
      icon: 'bed',
    },
    {
      category: 'Guided Heritage Walks',
      amount: 10600,
      percentage: 22,
      color: '#fd761a',
      icon: 'hiking',
    },
    {
      category: 'Authentic Bengal Home Meals',
      amount: 5450,
      percentage: 11,
      color: '#0284c7',
      icon: 'restaurant',
    },
    {
      category: 'KGP Station Railway Transit',
      amount: 2400,
      percentage: 5,
      color: '#8b5cf6',
      icon: 'train',
    },
  ],
  monthlyData: [
    { month: 'May 2026', amount: 5200, bookings: 2 },
    { month: 'Jun 2026', amount: 6800, bookings: 3 },
    { month: 'Jul 2026', amount: 4600, bookings: 2 },
    { month: 'Aug 2026', amount: 8900, bookings: 3 },
    { month: 'Sep 2026', amount: 12100, bookings: 4 },
    { month: 'Oct 2026', amount: 14800, bookings: 5 },
  ],
  recentTransactions: [
    {
      id: 'tx-oct-01',
      date: 'Oct 19, 2026',
      guestName: 'Elena Rostova',
      service: 'Homestay & Bengal Meals (3 Nights)',
      amount: 4200,
      status: 'escrow',
      payoutMethod: 'UPI: askrabindrajana@okaxis',
    },
    {
      id: 'tx-oct-02',
      date: 'Oct 21, 2026',
      guestName: 'Anirban & Maya Mukherjee',
      service: 'Homestay & Terracotta Guided Walk (2 Nights)',
      amount: 5600,
      status: 'escrow',
      payoutMethod: 'UPI: askrabindrajana@okaxis',
    },
    {
      id: 'tx-oct-03',
      date: 'Oct 15, 2026',
      guestName: 'Sourav Ganguly B.',
      service: 'Homestay & Home Meals',
      amount: 2800,
      status: 'payout_completed',
      payoutMethod: 'Bank Transfer (SBI Kharagpur)',
    },
    {
      id: 'tx-sep-04',
      date: 'Sep 19, 2026',
      guestName: 'Marcus Lindqvist',
      service: 'Homestay & Heritage Trail',
      amount: 3200,
      status: 'payout_completed',
      payoutMethod: 'UPI: askrabindrajana@okaxis',
    },
    {
      id: 'tx-sep-05',
      date: 'Sep 02, 2026',
      guestName: 'Priya Sharma',
      service: 'Homestay & Station Guide',
      amount: 2400,
      status: 'payout_completed',
      payoutMethod: 'UPI: askrabindrajana@okaxis',
    },
  ],
};

// ==========================================
// Trip Request Storage Functions
// ==========================================

export function getHostTripRequests(): HostTripRequest[] {
  if (typeof window === 'undefined') return INITIAL_HOST_REQUESTS;
  try {
    const raw = localStorage.getItem(HOST_REQUESTS_KEY);
    if (!raw) return INITIAL_HOST_REQUESTS;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load host trip requests from storage', err);
    return INITIAL_HOST_REQUESTS;
  }
}

export function saveHostTripRequests(requests: HostTripRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HOST_REQUESTS_KEY, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('host-requests-changed', { detail: requests }));
  } catch (err) {
    console.warn('Failed to save host trip requests', err);
  }
}

export function updateTripRequestStatus(
  requestId: string,
  newStatus: 'accepted' | 'declined' | 'completed',
  hostResponseNote?: string
): HostTripRequest[] {
  const current = getHostTripRequests();
  const updated = current.map((req) => {
    if (req.id === requestId) {
      return {
        ...req,
        status: newStatus,
        hostResponseNote: hostResponseNote || req.hostResponseNote,
        paymentStatus: newStatus === 'declined' ? ('refunded' as const) : newStatus === 'completed' ? ('paid' as const) : req.paymentStatus,
      };
    }
    return req;
  });
  saveHostTripRequests(updated);
  return updated;
}

export function addNewTripRequest(newReq: Partial<HostTripRequest>): HostTripRequest {
  const current = getHostTripRequests();
  const request: HostTripRequest = {
    id: 'req-' + Date.now(),
    travelerId: newReq.travelerId || 'traveler-' + Date.now(),
    travelerName: newReq.travelerName || 'Fellow Explorer',
    travelerAvatar: newReq.travelerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    travelerCity: newReq.travelerCity || 'Kolkata, WB',
    travelerEmail: newReq.travelerEmail || 'explorer@travelai.org',
    isVerified: newReq.isVerified ?? true,
    verifiedBadgeTitle: newReq.verifiedBadgeTitle || 'Verified Explorer',
    checkInDate: newReq.checkInDate || '2026-11-20',
    checkOutDate: newReq.checkOutDate || '2026-11-22',
    durationNights: newReq.durationNights || 2,
    guestsCount: newReq.guestsCount || 1,
    purpose: newReq.purpose || 'Heritage exploration and railway corridor travel in West Bengal',
    servicesRequested: newReq.servicesRequested || ['homestay', 'bengal_meals'],
    nightlyRate: newReq.nightlyRate || 1400,
    totalAmount: newReq.totalAmount || 2800,
    currency: newReq.currency || '₹ INR',
    status: 'pending',
    requestNote: newReq.requestNote || 'Excited to visit Midnapore and learn from your local travel stories!',
    submittedAt: 'Just now',
    paymentStatus: 'escrow',
  };

  const updated = [request, ...current];
  saveHostTripRequests(updated);
  return request;
}

export function deleteTripRequest(requestId: string): HostTripRequest[] {
  const current = getHostTripRequests();
  const updated = current.filter((r) => r.id !== requestId);
  saveHostTripRequests(updated);
  return updated;
}

// ==========================================
// Earnings & Payout Functions
// ==========================================

export function getHostEarningsData(): HostEarningsSummary {
  if (typeof window === 'undefined') return INITIAL_EARNINGS_SUMMARY;
  try {
    const raw = localStorage.getItem(HOST_PAYOUTS_KEY);
    if (!raw) return INITIAL_EARNINGS_SUMMARY;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load host earnings from storage', err);
    return INITIAL_EARNINGS_SUMMARY;
  }
}

export function saveHostEarningsData(data: HostEarningsSummary): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HOST_PAYOUTS_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('host-earnings-changed', { detail: data }));
  } catch (err) {
    console.warn('Failed to save host earnings data', err);
  }
}

export function requestHostPayout(amountToWithdraw?: number): {
  success: boolean;
  message: string;
  withdrawnAmount: number;
  newPending: number;
} {
  const earnings = getHostEarningsData();
  const pending = earnings.pendingPayout;
  if (pending <= 0) {
    return {
      success: false,
      message: 'No pending escrow balance is currently available for withdrawal.',
      withdrawnAmount: 0,
      newPending: 0,
    };
  }

  const withdrawAmount = amountToWithdraw && amountToWithdraw > 0 && amountToWithdraw <= pending ? amountToWithdraw : pending;

  const newPending = pending - withdrawAmount;
  const newTotal = earnings.totalRevenue; // Already earned

  const newTx = {
    id: 'payout-' + Date.now(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    guestName: 'Bank Withdrawal Payout',
    service: `Direct Escrow Release to UPI: askrabindrajana@okaxis`,
    amount: withdrawAmount,
    status: 'payout_completed' as const,
    payoutMethod: 'UPI: askrabindrajana@okaxis',
  };

  const updated: HostEarningsSummary = {
    ...earnings,
    pendingPayout: newPending,
    completedPayoutsCount: earnings.completedPayoutsCount + 1,
    recentTransactions: [newTx, ...earnings.recentTransactions],
  };

  saveHostEarningsData(updated);

  return {
    success: true,
    message: `₹${withdrawAmount.toLocaleString('en-IN')} successfully initiated to your registered account (askrabindrajana@okaxis).`,
    withdrawnAmount: withdrawAmount,
    newPending,
  };
}

// ==========================================
// House Rules Storage Functions (Syncs with Profile)
// ==========================================

export function getHostHouseRules(): string[] {
  const profile = getStoredUserProfile();
  return (
    profile.hosting?.houseRules || [
      'Respect local peace and neighborhood tranquility',
      'No loud late-night noise; pure traveler camaraderie',
      'Warm cup of Bengal morning chai included',
      'Travel stories and railway experiences shared over meals',
    ]
  );
}

export function saveHostHouseRules(rules: string[]): string[] {
  const profile = getStoredUserProfile();
  const updatedProfile = {
    ...profile,
    hosting: {
      ...profile.hosting,
      houseRules: rules,
    },
  };
  saveStoredUserProfile(updatedProfile);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('house-rules-changed', { detail: rules }));
  }
  return rules;
}

export function addHostHouseRule(newRule: string): string[] {
  const trimmed = newRule.trim();
  if (!trimmed) return getHostHouseRules();
  const current = getHostHouseRules();
  const updated = [...current, trimmed];
  return saveHostHouseRules(updated);
}

export function updateHostHouseRule(index: number, updatedText: string): string[] {
  const trimmed = updatedText.trim();
  if (!trimmed) return getHostHouseRules();
  const current = getHostHouseRules();
  if (index < 0 || index >= current.length) return current;
  const updated = [...current];
  updated[index] = trimmed;
  return saveHostHouseRules(updated);
}

export function deleteHostHouseRule(index: number): string[] {
  const current = getHostHouseRules();
  if (index < 0 || index >= current.length) return current;
  const updated = current.filter((_, i) => i !== index);
  return saveHostHouseRules(updated);
}

export function reorderHostHouseRules(fromIndex: number, toIndex: number): string[] {
  const current = getHostHouseRules();
  if (fromIndex < 0 || fromIndex >= current.length || toIndex < 0 || toIndex >= current.length) {
    return current;
  }
  const updated = [...current];
  const [removed] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, removed);
  return saveHostHouseRules(updated);
}
