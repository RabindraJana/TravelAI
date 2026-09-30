/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType, TransitionType, UserPreferences, AuthUser } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TravelerDashboard } from './components/TravelerDashboard';
import { TripPlanner } from './components/TripPlanner';
import { MyTrips } from './components/MyTrips';
import { TravelJournal } from './components/TravelJournal';
import { ExploreDestinations } from './components/ExploreDestinations';
import { Community } from './components/Community';
import { TravelMap } from './components/TravelMap';
import { Achievements } from './components/Achievements';
import { Goals2027 } from './components/Goals2027';
import { UserProfile } from './components/UserProfile';
import { HostDashboard } from './components/HostDashboard';
import { GuiderDashboard } from './components/GuiderDashboard';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  getStoredAuthUser,
  switchUserRole,
  onAuthChange,
  isUserLoggedIn,
  setUserLoggedIn,
  logoutAuthUser,
  onAuthStatusChange,
} from './utils/authStorage';

const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Rabindra Jana',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  homeCity: 'Medinipur, West Bengal',
  currency: '₹ INR',
  travelStyle: 'balanced',
  pace: 'moderate',
  dietary: 'all',
  notificationsEnabled: true,
  verificationStatus: 'verified',
  verifiedAt: 'Oct 12, 2026',
  livingState: 'West Bengal',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [prefilledAiPrompt, setPrefilledAiPrompt] = useState<string | undefined>(undefined);
  const [plannerOrigin, setPlannerOrigin] = useState<string | undefined>(undefined);
  const [plannerDestination, setPlannerDestination] = useState<string | undefined>(undefined);
  const [sharedEntryId, setSharedEntryId] = useState<string | null>(null);

  // Deep-link query parameters parsing (e.g., ?screen=journal&entry=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const screenParam = searchParams.get('screen') as ScreenType | null;
        const entryParam = searchParams.get('entry');
        if (screenParam === 'journal' || entryParam) {
          setCurrentScreen('journal');
          if (entryParam) {
            setSharedEntryId(entryParam);
          }
        }
      } catch (err) {
        console.warn('URLSearchParams read error:', err);
      }
    }
  }, []);

  // Mobile navigation drawer & settings modal
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User Authentication State (Traveler vs Admin/Host)
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => getStoredAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'user' | 'guider' | 'admin'>('user');
  const [adminDashboardView, setAdminDashboardView] = useState<'host' | 'traveler'>('host');

  // Gated Access: Landing Page opens first on initial visit; logging in unlocks the application
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('view') === 'landing') return false;
        if (searchParams.get('guest') === 'true') return true;
      } catch (err) {
        console.warn('URLSearchParams read error:', err);
      }
    }
    return isUserLoggedIn();
  });

  // Listen to auth state and status changes across windows/components
  useEffect(() => {
    const unsubscribeUser = onAuthChange((user) => {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setAdminDashboardView('host');
      }
    });
    const unsubscribeStatus = onAuthStatusChange((loggedIn) => {
      setIsAuthenticated(loggedIn);
    });
    return () => {
      unsubscribeUser();
      unsubscribeStatus();
    };
  }, []);

  const handleLogout = () => {
    logoutAuthUser();
    setIsAuthenticated(false);
    showToast(
      'Signed Out 👋',
      'You have been logged out. App access is locked until you sign in again.',
      'info'
    );
  };

  const handleViewLandingPage = () => {
    setIsAuthenticated(false);
  };

  const handleQuickSwitchRole = () => {
    const targetRole = currentUser.role === 'admin' ? 'user' : currentUser.role === 'guider' ? 'user' : 'admin';
    const updated = switchUserRole(targetRole);
    setCurrentUser(updated);
    if (targetRole === 'admin') {
      setAdminDashboardView('host');
    }
    showToast(
      targetRole === 'admin' ? 'Host & Admin Mode Active' : 'Traveler Mode Active',
      targetRole === 'admin'
        ? 'Logged in as Rabindra Jana (askrabindrajana@gmail.com). You can edit host details and house rules.'
        : 'Viewing as a regular traveler (Explorer). Host homestays appear in the curated local host section.',
      'info'
    );
  };

  const handleOpenAuthModal = (initialTab: 'user' | 'guider' | 'admin' = 'user') => {
    setAuthModalInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  // User preferences with localStorage persistence
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('travel_ai_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSavePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    try {
      localStorage.setItem('travel_ai_preferences', JSON.stringify(updated));
    } catch {
      // Ignored
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const updated = { ...preferences, currency: newCurrency };
    handleSavePreferences(updated);
    showToast('Currency Updated', `Switched display currency to ${newCurrency}.`, 'info');
  };

  const handleNavigate = (screen: ScreenType, transition: TransitionType = 'none') => {
    setTransitionType(transition);
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handlePlanTripTo = (origin: string, destination: string) => {
    setPlannerOrigin(origin);
    setPlannerDestination(destination);
    handleNavigate('planner', 'none');
  };

  const handleAskAI = (prompt: string) => {
    setPrefilledAiPrompt(prompt);
    if (currentScreen !== 'dashboard') {
      handleNavigate('dashboard', 'none');
    }
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'host-dashboard':
      case 'guider-dashboard':
      case 'dashboard':
        return (
          <TravelerDashboard
            onNavigate={handleNavigate}
            aiPrompt={prefilledAiPrompt}
            onShowToast={showToast}
          />
        );
      case 'planner':
        return (
          <TripPlanner
            onNavigate={handleNavigate}
            initialOrigin={plannerOrigin || preferences.homeCity}
            initialDestination={plannerDestination}
            onShowToast={showToast}
          />
        );
      case 'trips':
        return (
          <MyTrips
            onNavigate={handleNavigate}
            onPlanTripTo={handlePlanTripTo}
            onShowToast={showToast}
          />
        );
      case 'journal':
        return (
          <TravelJournal
            onNavigate={handleNavigate}
            onPlanTripTo={handlePlanTripTo}
            onShowToast={showToast}
            initialEntryId={sharedEntryId}
          />
        );
      case 'explore':
        return <ExploreDestinations onNavigate={handleNavigate} onPlanTripTo={handlePlanTripTo} />;
      case 'community':
        return <Community onNavigate={handleNavigate} onPlanTripTo={handlePlanTripTo} onShowToast={showToast} />;
      case 'map':
        return <TravelMap onNavigate={handleNavigate} onPlanTripTo={handlePlanTripTo} />;
      case 'achievements':
        return <Achievements onNavigate={handleNavigate} />;
      case 'goals':
        return <Goals2027 onNavigate={handleNavigate} onPlanTripTo={handlePlanTripTo} onShowToast={showToast} />;
      case 'profile':
        return (
          <UserProfile
            onNavigate={handleNavigate}
            onPlanTripTo={handlePlanTripTo}
            onShowToast={showToast}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
            onQuickSwitchRole={handleQuickSwitchRole}
          />
        );
      default:
        return <TravelerDashboard onNavigate={handleNavigate} aiPrompt={prefilledAiPrompt} onShowToast={showToast} />;
    }
  };

  // If not authenticated, render the Landing Page first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
        <LandingPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setUserLoggedIn(true);
            if (user.role === 'admin') {
              setAdminDashboardView('host');
            }
          }}
          onExploreAsGuest={() => {
            setIsAuthenticated(true);
            showToast(
              'Guest Preview Active 🚀',
              'You are exploring Travel AI as a guest. Sign in anytime to sync your plans and unlock peer mediation.',
              'info'
            );
          }}
          onShowToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      {/* Persistent Left Sidebar with Drawer functionality on small screens */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onQuickSwitchRole={handleQuickSwitchRole}
        onViewLandingPage={handleViewLandingPage}
        onLogout={handleLogout}
      />

      {/* Main Content Area: Responsive left padding (pl-0 on mobile, pl-72 on desktop) */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen transition-all">
        <Header
          onAskAI={handleAskAI}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNavigate={handleNavigate}
          currency={preferences.currency}
          onCurrencyChange={handleCurrencyChange}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onQuickSwitchRole={handleQuickSwitchRole}
          onViewLandingPage={handleViewLandingPage}
          onLogout={handleLogout}
        />

        {transitionType === 'push' ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ x: 40, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex-1"
            >
              {renderActiveScreen()}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div key={currentScreen} className="w-full flex-1">
            {renderActiveScreen()}
          </div>
        )}
      </div>

      {/* Global Traveler Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        onShowToast={showToast}
      />

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalInitialTab}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setUserLoggedIn(true);
          if (user.role === 'admin') {
            setAdminDashboardView('host');
            setCurrentScreen('host-dashboard');
          } else if (user.role === 'guider') {
            setCurrentScreen('guider-dashboard');
          } else {
            setCurrentScreen('dashboard');
          }
          showToast(
            user.role === 'admin'
              ? 'Admin Access Granted 🌟'
              : user.role === 'guider'
              ? 'Guider Console Active 🚩'
              : 'Welcome, Explorer! 🎒',
            user.role === 'admin'
              ? `Confirmed admin session as ${user.name} (${user.email}). Host Suite and controls unlocked.`
              : user.role === 'guider'
              ? `Welcome, ${user.name}! Guided expeditions, walking tours, and tourist groups ready.`
              : `Welcome, ${user.name}! Enjoy exploring authentic routes and homestays.`,
            'success'
          );
        }}
        onShowToast={showToast}
      />

      {/* Global Toast Feedback Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

