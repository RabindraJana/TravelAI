import { AuthUser, UserRole } from '../types';

export const ADMIN_EMAIL = 'askrabindrajana@gmail.com';
export const AUTH_USER_STORAGE_KEY = 'travel_ai_auth_user_session';
export const AUTH_LOGGED_IN_KEY = 'travel_ai_auth_logged_in';
export const REGISTERED_USERS_KEY = 'travel_ai_registered_users';

export interface RegisteredAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: string;
  homeCity: string;
  livingState: string;
  role: UserRole;
  isAdmin: boolean;
  isGuider?: boolean;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  verifiedBadgeTitle: string;
  createdAt: string;
}

export const SEED_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'user_rabindra_jana',
    email: 'askrabindrajana@gmail.com',
    password: 'password123',
    name: 'Rabindra Jana',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    homeCity: 'Medinipur, West Bengal',
    livingState: 'West Bengal',
    role: 'admin',
    isAdmin: true,
    verificationStatus: 'verified',
    verifiedBadgeTitle: 'Govt ID Verified Host & Administrator',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_priya_sharma',
    email: 'priya.traveler@gmail.com',
    password: 'password123',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    homeCity: 'New Delhi, Delhi',
    livingState: 'Delhi',
    role: 'user',
    isAdmin: false,
    verificationStatus: 'unverified',
    verifiedBadgeTitle: 'Explorer Community Member',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'user_subhashish_guider',
    email: 'subhashish.guider@travelai.in',
    password: 'password123',
    name: 'Subhashish Roy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    homeCity: 'Kharagpur, West Bengal',
    livingState: 'West Bengal',
    role: 'guider',
    isAdmin: false,
    isGuider: true,
    verificationStatus: 'verified',
    verifiedBadgeTitle: 'Govt Certified Heritage Guider',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return SEED_ACCOUNTS;
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    // Ensure the admin account exists in the accounts array
    const hasAdmin = parsed.some(
      (a: RegisteredAccount) => normalizeEmail(a.email) === normalizeEmail(ADMIN_EMAIL)
    );
    if (!hasAdmin) {
      const merged = [SEED_ACCOUNTS[0], ...parsed];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to load registered accounts from storage', err);
    return SEED_ACCOUNTS;
  }
}

export function saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Failed to save registered accounts', err);
  }
}

export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(AUTH_LOGGED_IN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setUserLoggedIn(isLoggedIn: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (isLoggedIn) {
      localStorage.setItem(AUTH_LOGGED_IN_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_LOGGED_IN_KEY);
    }
    window.dispatchEvent(new CustomEvent('auth-status-changed', { detail: { isLoggedIn } }));
  } catch (err) {
    console.warn('Failed to set login state', err);
  }
}

export const ADMIN_USER: AuthUser = {
  id: 'user_rabindra_jana',
  email: 'askrabindrajana@gmail.com',
  name: 'Rabindra Jana',
  role: 'admin',
  isAdmin: true,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  homeCity: 'Medinipur, West Bengal',
  livingState: 'West Bengal',
  bio: 'Passionate authentic explorer, railway enthusiast, and verified living state host in West Bengal. I believe traveling is not about vanity metrics—it is about real connections, heritage, and genuine human warmth. "Life is just going on. Life is too short, so make this trip happen!"',
  verificationStatus: 'verified',
  verifiedBadgeTitle: 'Govt ID Verified Host & Administrator',
  travelStyle: 'adventure',
  pace: 'moderate',
  currency: '₹ INR',
  tripsCount: 14,
  travelLevel: 'Level 8 Master Host',
};

export const DEFAULT_TRAVELER_USER: AuthUser = {
  id: 'user_priya_sharma',
  email: 'priya.traveler@gmail.com',
  name: 'Priya Sharma',
  role: 'user',
  isAdmin: false,
  isGuider: false,
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  homeCity: 'New Delhi, Delhi',
  livingState: 'Delhi',
  bio: 'Solo backpacker, temple architecture lover, and slow cultural heritage seeker. Traveling by Indian Railways to experience the true soul of every station.',
  verificationStatus: 'unverified',
  verifiedBadgeTitle: 'Community Explorer (Unverified)',
  travelStyle: 'culture',
  pace: 'moderate',
  currency: '₹ INR',
  tripsCount: 4,
  travelLevel: 'Level 4 Explorer',
};

export const DEFAULT_GUIDER_USER: AuthUser = {
  id: 'user_subhashish_guider',
  email: 'subhashish.guider@travelai.in',
  name: 'Subhashish Roy',
  role: 'guider',
  isAdmin: false,
  isGuider: true,
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  homeCity: 'Kharagpur, West Bengal',
  livingState: 'West Bengal',
  bio: 'Certified Indian Railways & Bengal Heritage Guider. Guiding historical walking trails across Medinipur terracotta temples, Kharagpur railway platforms, and Kasai river banks.',
  verificationStatus: 'verified',
  verifiedBadgeTitle: 'Govt Certified Heritage Guider',
  guiderBadge: 'Heritage Guider Level 5',
  guiderSpecialty: 'Railway Architecture & Medinipur Heritage',
  guiderRating: 4.9,
  guiderToursCount: 42,
  guiderLanguages: ['Bengali', 'Hindi', 'English'],
  travelStyle: 'culture',
  pace: 'moderate',
  currency: '₹ INR',
  tripsCount: 42,
  travelLevel: 'Master Guider (Level 5)',
};

export const ADMIN_SECRET_KEY = 'jana2026';

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function isAdminEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return (
    normalized === normalizeEmail(ADMIN_EMAIL) ||
    normalized === 'rabindrajana@gmail.com' ||
    normalized.includes('askrabindrajana')
  );
}

export function getStoredAuthUser(): AuthUser {
  if (typeof window === 'undefined') return DEFAULT_TRAVELER_USER;
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) {
      // By default, start with clean traveler mode so regular users see the new traveler interface
      return DEFAULT_TRAVELER_USER;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.warn('Failed to load auth user from storage', err);
    return DEFAULT_TRAVELER_USER;
  }
}

export function setStoredAuthUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    // Also sync standard travel_ai_preferences
    localStorage.setItem(
      'travel_ai_preferences',
      JSON.stringify({
        name: user.name,
        avatar: user.avatar,
        homeCity: user.homeCity,
        livingState: user.livingState || 'West Bengal',
        currency: user.currency || '₹ INR',
        travelStyle: user.travelStyle || 'balanced',
        pace: user.pace || 'moderate',
        dietary: 'all',
        notificationsEnabled: true,
        verificationStatus: user.verificationStatus,
      })
    );
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
  } catch (err) {
    console.warn('Failed to save auth user to storage', err);
  }
}

export function loginAsAdmin(email: string): { success: boolean; user: AuthUser; message?: string } {
  if (!isAdminEmail(email)) {
    return {
      success: false,
      user: DEFAULT_TRAVELER_USER,
      message: `Only the registered administrator Gmail (${ADMIN_EMAIL}) has host & admin privileges.`,
    };
  }

  const adminSession: AuthUser = {
    ...ADMIN_USER,
    email: normalizeEmail(email),
  };
  setStoredAuthUser(adminSession);
  setUserLoggedIn(true);
  return {
    success: true,
    user: adminSession,
    message: 'Welcome back, Rabindra Jana! Admin & Host privileges activated.',
  };
}

export function loginAsTraveler(details: {
  name: string;
  email: string;
  homeCity?: string;
  avatar?: string;
}): { success: boolean; user: AuthUser } {
  const normEmail = normalizeEmail(details.email);
  const isAdmin = isAdminEmail(normEmail);

  const travelerUser: AuthUser = {
    id: isAdmin ? 'user_rabindra_jana' : 'user_' + Date.now(),
    email: normEmail,
    name: details.name.trim() || (isAdmin ? 'Rabindra Jana' : 'Explorer Traveler'),
    role: isAdmin ? 'admin' : 'user',
    isAdmin: isAdmin,
    avatar:
      details.avatar ||
      (isAdmin ? ADMIN_USER.avatar : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
    homeCity: details.homeCity?.trim() || (isAdmin ? 'Medinipur, West Bengal' : 'New Delhi, India'),
    livingState: details.homeCity?.split(',')[1]?.trim() || (isAdmin ? 'West Bengal' : 'India'),
    bio: isAdmin
      ? ADMIN_USER.bio
      : 'Explorer seeking authentic cultural corridors, railway memories, and peer traveler mutual support.',
    verificationStatus: isAdmin ? 'verified' : 'unverified',
    verifiedBadgeTitle: isAdmin ? 'Govt ID Verified Host & Admin' : 'Explorer Community Member',
    travelStyle: 'balanced',
    pace: 'moderate',
    currency: '₹ INR',
    tripsCount: isAdmin ? 14 : 2,
    travelLevel: isAdmin ? 'Level 8 Master Explorer' : 'Level 2 Explorer',
  };

  setStoredAuthUser(travelerUser);
  setUserLoggedIn(true);
  return { success: true, user: travelerUser };
}

export function loginWithGmail(details: {
  email: string;
  name?: string;
  avatar?: string;
  homeCity?: string;
}): { success: boolean; user: AuthUser; message?: string } {
  return loginAsTraveler({
    email: details.email,
    name: details.name || details.email.split('@')[0].replace(/[._]/g, ' '),
    avatar: details.avatar,
    homeCity: details.homeCity,
  });
}

export function quickVerifyCurrentUser(badgeTitle = 'Govt ID Verified Traveler'): AuthUser {
  const current = getStoredAuthUser();
  const updated: AuthUser = {
    ...current,
    verificationStatus: 'verified',
    verifiedBadgeTitle: badgeTitle,
  };
  setStoredAuthUser(updated);
  return updated;
}

export function registerUserWithPassword(details: {
  name: string;
  email: string;
  password: string;
  homeCity?: string;
  livingState?: string;
}): { success: boolean; user?: AuthUser; message?: string } {
  const normEmail = normalizeEmail(details.email);
  const trimmedName = (details.name || '').trim();
  const password = details.password || '';

  if (!trimmedName) {
    return { success: false, message: 'Please enter your full name.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normEmail || !emailRegex.test(normEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => normalizeEmail(a.email) === normEmail);
  if (existing) {
    return {
      success: false,
      message: 'An account with this email already exists. Please log in using your password.',
    };
  }

  const isAdmin = isAdminEmail(normEmail);
  const newAccount: RegisteredAccount = {
    id: isAdmin ? 'user_rabindra_jana' : 'user_' + Date.now(),
    email: normEmail,
    password: password,
    name: trimmedName,
    avatar: isAdmin
      ? ADMIN_USER.avatar
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    homeCity: details.homeCity?.trim() || (isAdmin ? 'Medinipur, West Bengal' : 'New Delhi, India'),
    livingState:
      details.livingState?.trim() ||
      details.homeCity?.split(',')[1]?.trim() ||
      (isAdmin ? 'West Bengal' : 'Delhi'),
    role: isAdmin ? 'admin' : 'user',
    isAdmin: isAdmin,
    verificationStatus: isAdmin ? 'verified' : 'unverified',
    verifiedBadgeTitle: isAdmin
      ? 'Govt ID Verified Host & Administrator'
      : 'Explorer Community Member',
    createdAt: new Date().toISOString(),
  };

  const updatedAccounts = [...accounts, newAccount];
  saveRegisteredAccounts(updatedAccounts);

  const authUser: AuthUser = {
    id: newAccount.id,
    email: newAccount.email,
    name: newAccount.name,
    role: newAccount.role,
    isAdmin: newAccount.isAdmin,
    avatar: newAccount.avatar,
    homeCity: newAccount.homeCity,
    livingState: newAccount.livingState,
    bio: isAdmin
      ? ADMIN_USER.bio
      : 'Explorer seeking authentic cultural corridors, railway memories, and peer traveler mutual support.',
    verificationStatus: newAccount.verificationStatus,
    verifiedBadgeTitle: newAccount.verifiedBadgeTitle,
    travelStyle: 'balanced',
    pace: 'moderate',
    currency: '₹ INR',
    tripsCount: isAdmin ? 14 : 1,
    travelLevel: isAdmin ? 'Level 8 Master Explorer' : 'Level 1 Explorer',
  };

  setStoredAuthUser(authUser);
  setUserLoggedIn(true);

  return {
    success: true,
    user: authUser,
    message: isAdmin
      ? `Welcome, Administrator ${authUser.name}! Host desk and all platform tools unlocked.`
      : `Welcome to Travel AI, ${authUser.name}! Your explorer account is created.`,
  };
}

export function loginWithPassword(
  email: string,
  password: string
): { success: boolean; user?: AuthUser; message?: string } {
  const normEmail = normalizeEmail(email);
  const trimmedPassword = (password || '').trim();

  if (!normEmail) {
    return { success: false, message: 'Please enter your email address.' };
  }
  if (!trimmedPassword) {
    return { success: false, message: 'Please enter your password.' };
  }

  const accounts = getRegisteredAccounts();
  let account = accounts.find((a) => normalizeEmail(a.email) === normEmail);

  // Fallback for known admin or seed emails
  if (!account) {
    if (isAdminEmail(normEmail)) {
      account = SEED_ACCOUNTS[0];
    } else if (normEmail === 'priya.traveler@gmail.com') {
      account = SEED_ACCOUNTS[1];
    } else if (normEmail === 'subhashish.guider@travelai.in') {
      account = SEED_ACCOUNTS[2];
    }
  }

  if (!account) {
    return {
      success: false,
      message: 'No account found with this email. Please click "Sign Up" to create a new account.',
    };
  }

  // Check password - for admin, also accept 'jana2026' or 'admin123' or 'password123'
  const isMatch =
    account.password === trimmedPassword ||
    (account.isAdmin &&
      (trimmedPassword === 'jana2026' ||
        trimmedPassword === 'admin123' ||
        trimmedPassword === 'password123'));

  if (!isMatch) {
    return {
      success: false,
      message: 'Incorrect password. Please verify your password and try again.',
    };
  }

  const authUser: AuthUser = {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    isAdmin: account.isAdmin,
    isGuider: account.isGuider,
    avatar: account.avatar,
    homeCity: account.homeCity,
    livingState: account.livingState,
    bio: account.isAdmin ? ADMIN_USER.bio : 'Explorer seeking authentic cultural corridors.',
    verificationStatus: account.verificationStatus,
    verifiedBadgeTitle: account.verifiedBadgeTitle,
    travelStyle: 'balanced',
    pace: 'moderate',
    currency: '₹ INR',
    tripsCount: account.isAdmin ? 14 : 4,
    travelLevel: account.isAdmin ? 'Level 8 Master Explorer' : 'Level 3 Explorer',
  };

  setStoredAuthUser(authUser);
  setUserLoggedIn(true);

  return {
    success: true,
    user: authUser,
    message: account.isAdmin
      ? `Welcome back, Rabindra Jana! Admin & Host privileges activated.`
      : `Welcome back, ${authUser.name}!`,
  };
}

export function resetPassword(
  email: string,
  newPassword: string
): { success: boolean; message: string } {
  const normEmail = normalizeEmail(email);
  if (!normEmail) {
    return { success: false, message: 'Please provide an email address.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  const accounts = getRegisteredAccounts();
  const idx = accounts.findIndex((a) => normalizeEmail(a.email) === normEmail);
  if (idx === -1) {
    return { success: false, message: 'No registered account found with this email.' };
  }

  accounts[idx].password = newPassword;
  saveRegisteredAccounts(accounts);
  return {
    success: true,
    message: 'Password updated successfully. You can now log in with your new password.',
  };
}

export function loginAsGuider(details?: {
  name?: string;
  email?: string;
  specialty?: string;
  avatar?: string;
}): { success: boolean; user: AuthUser; message?: string } {
  const guiderUser: AuthUser = {
    ...DEFAULT_GUIDER_USER,
    name: details?.name?.trim() || DEFAULT_GUIDER_USER.name,
    email: details?.email?.trim() || DEFAULT_GUIDER_USER.email,
    avatar: details?.avatar || DEFAULT_GUIDER_USER.avatar,
    guiderSpecialty: details?.specialty || DEFAULT_GUIDER_USER.guiderSpecialty,
  };
  setStoredAuthUser(guiderUser);
  setUserLoggedIn(true);
  return {
    success: true,
    user: guiderUser,
    message: `Welcome, ${guiderUser.name}! Guider console and tour expeditions active.`,
  };
}

export function logoutAuthUser(): AuthUser {
  setUserLoggedIn(false);
  setStoredAuthUser(DEFAULT_TRAVELER_USER);
  return DEFAULT_TRAVELER_USER;
}

export function switchAuthRole(role: UserRole): AuthUser {
  if (role === 'admin') {
    setStoredAuthUser(ADMIN_USER);
    return ADMIN_USER;
  } else if (role === 'guider') {
    setStoredAuthUser(DEFAULT_GUIDER_USER);
    return DEFAULT_GUIDER_USER;
  } else {
    setStoredAuthUser(DEFAULT_TRAVELER_USER);
    return DEFAULT_TRAVELER_USER;
  }
}

export const switchUserRole = switchAuthRole;
export const saveStoredAuthUser = setStoredAuthUser;

export function onAuthChange(callback: (user: AuthUser) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<AuthUser>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredAuthUser());
    }
  };
  window.addEventListener('auth-changed', handler);
  return () => window.removeEventListener('auth-changed', handler);
}

export function updateAuthUserProfile(updates: Partial<AuthUser>): AuthUser {
  const current = getStoredAuthUser();
  const updated: AuthUser = {
    ...current,
    ...updates,
  };
  setStoredAuthUser(updated);
  return updated;
}

export function onAuthStatusChange(callback: (isLoggedIn: boolean) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<{ isLoggedIn: boolean }>;
    callback(custom.detail?.isLoggedIn ?? isUserLoggedIn());
  };
  window.addEventListener('auth-status-changed', handler);
  return () => window.removeEventListener('auth-status-changed', handler);
}

