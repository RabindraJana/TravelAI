import React, { useState, useEffect } from 'react';
import { ScreenType, TravelerVouch, AuthUser, FullUserProfile, SocialPhotoPost, CommunityDirectoryUser, PlanningCard, AiTravelCard } from '../types';
import { VerificationStatus } from './VerificationStatus';
import { VerificationModal } from './VerificationModal';
import { AdminVerificationModal } from './AdminVerificationModal';
import { TravelerReviews } from './TravelerReviews';
import { EditHostModal } from './EditHostModal';
import { AiTravelCardModal } from './AiTravelCardModal';
import { SharePlanningCardModal } from './SharePlanningCardModal';
import {
  getStoredUserProfile,
  saveStoredUserProfile,
  getVerificationApplications,
  addTravelerReview,
} from '../utils/profileStorage';
import { getStoredJournalEntries } from '../utils/journalStorage';
import { getStoredAuthUser, saveStoredAuthUser, updateAuthUserProfile, ADMIN_EMAIL } from '../utils/authStorage';
import {
  getStoredSocialPosts,
  getStoredAiCards,
  getStoredCommunityUsers,
  getStoredPlanningRequests,
  addSocialPost,
  DEFAULT_PLANNING_CARDS,
} from '../utils/communityStorage';

interface UserProfileProps {
  onNavigate: (screen: ScreenType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  currentUser?: AuthUser;
  onOpenAuthModal?: (initialTab?: 'user' | 'guider' | 'admin') => void;
  onQuickSwitchRole?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  onNavigate,
  onPlanTripTo,
  onShowToast,
  currentUser: propUser,
  onOpenAuthModal,
  onQuickSwitchRole,
}) => {
  // Current active user (prop or local storage)
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => propUser || getStoredAuthUser());
  const [profile, setProfile] = useState<FullUserProfile>(() => getStoredUserProfile());

  // Modals
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isEditHostModalOpen, setIsEditHostModalOpen] = useState(false);
  const [isEditTravelerModalOpen, setIsEditTravelerModalOpen] = useState(false);

  // Admin tabs
  const [adminTab, setAdminTab] = useState<'overview' | 'hosting' | 'guides' | 'vouches' | 'badges'>('overview');

  // Traveler tabs - default to Instagram-like photo and food posts
  const [travelerTab, setTravelerTab] = useState<
    'posts' | 'ai_cards' | 'planning' | 'friends' | 'host_spotlight' | 'verification' | 'profile' | 'trips'
  >('posts');

  // Community, Instagram Feed & AI Card states
  const [socialPosts, setSocialPosts] = useState<SocialPhotoPost[]>(() => getStoredSocialPosts());
  const [aiCards, setAiCards] = useState<AiTravelCard[]>(() => getStoredAiCards());
  const [communityUsers, setCommunityUsers] = useState<CommunityDirectoryUser[]>(() => getStoredCommunityUsers());
  const [isAiCardModalOpen, setIsAiCardModalOpen] = useState(false);
  const [isSharePlanningModalOpen, setIsSharePlanningModalOpen] = useState(false);
  const [selectedShareUser, setSelectedShareUser] = useState<CommunityDirectoryUser | null>(null);
  const [isNewPhotoModalOpen, setIsNewPhotoModalOpen] = useState(false);

  // New photo form state
  const [userPhotoCaption, setUserPhotoCaption] = useState('');
  const [userDishName, setUserDishName] = useState('');
  const [userPhotoLocation, setUserPhotoLocation] = useState('Ranchi, Jharkhand');
  const [userPhotoUrl, setUserPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
  );
  const [userPhotoType, setUserPhotoType] = useState<'food' | 'scenic' | 'heritage'>('food');

  // Traveler contact/inquiry state
  const [connectSubject, setConnectSubject] = useState<'homestay' | 'chai' | 'transit_help' | 'general'>('homestay');
  const [connectMessage, setConnectMessage] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [travelDates, setTravelDates] = useState('');

  // Traveler local preference state
  const [travelerBio, setTravelerBio] = useState(
    'Passionate backpacker exploring the cultural heritage and railway corridors of India. Seeking authentic local living states and regional stories.'
  );
  const [travelerPace, setTravelerPace] = useState<'Moderate & Cultural' | 'Slow & Relaxed' | 'Fast & Active'>('Moderate & Cultural');
  const [travelerDiet, setTravelerDiet] = useState('Vegetarian / Local Regional Thalis');
  const [travelerHomeCity, setTravelerHomeCity] = useState('New Delhi, India');

  // Sync with propUser when it updates
  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    }
  }, [propUser]);

  // Refresh profile from storage
  const refreshProfile = () => {
    setProfile(getStoredUserProfile());
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const isAdmin = currentUser.role === 'admin';
  const journalEntries = getStoredJournalEntries();
  const pendingApps = getVerificationApplications().filter((a) => a.status === 'pending');

  const handleSendConnectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectMessage.trim()) {
      onShowToast('Please enter a message', 'Let the host know what you need help with.', 'warning');
      return;
    }

    onShowToast(
      'Message Sent to Host',
      `Your inquiry was delivered to Rabindra Jana. He will respond with warm Bengali hospitality!`,
      'success'
    );
    setConnectMessage('');
    setIsConnectModalOpen(false);
  };

  const handleSaveTravelerPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditTravelerModalOpen(false);
    onShowToast(
      'Preferences Saved',
      'Your explorer profile and journey preferences were updated.',
      'success'
    );
  };

  const handleToggleInstantVerify = () => {
    if (currentUser.verificationStatus === 'verified') {
      const updated = updateAuthUserProfile({
        verificationStatus: 'unverified',
        verifiedBadgeTitle: 'Community Explorer',
      });
      setCurrentUser(updated);
      onShowToast('Verification Reset', 'Profile returned to Unverified Explorer for demonstration.', 'info');
    } else {
      const updated = updateAuthUserProfile({
        verificationStatus: 'verified',
        verifiedBadgeTitle: 'Govt ID Verified Traveler',
      });
      setCurrentUser(updated);
      onShowToast('Verified Badge Awarded! 🛡️', 'Your profile is now verified with Government ID (100% Trust Rating).', 'success');
    }
  };

  // --------------------------------------------------------------------------
  // ONE UNIFIED TRAVELER INTERFACE FOR ALL USERS (One Account Motto)
  // --------------------------------------------------------------------------
  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Friendly Explorer Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#eaedff] bg-gradient-to-r from-[#1e1b4b] via-[#1e293b] to-[#0f172a] shadow-sm text-white">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={
                  currentUser.avatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white/20 shadow-xl"
              />
              <div
                className="absolute -bottom-1 -right-1 bg-[#006947] text-white p-1.5 rounded-xl shadow-lg ring-2 ring-white flex items-center justify-center"
                title="Active Traveler Member"
              >
                <span className="material-symbols-outlined text-[20px]">backpack</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-white/15 text-white/95 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-white/20">
                  <span className="material-symbols-outlined text-[13px] text-[#ffdbca]">mail</span>
                  <span>{currentUser.email}</span>
                </span>
                {currentUser.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 bg-[#e2fced] text-[#006947] px-2.5 py-0.5 rounded-full text-[12px] font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    <span>Govt ID Verified Traveler</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="inline-flex items-center gap-1 bg-[#ff9900]/25 hover:bg-[#ff9900]/35 text-[#ffd599] border border-[#ff9900]/40 px-2.5 py-0.5 rounded-full text-[12px] font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">shield_person</span>
                    <span>Upgrade via Govt ID (Unverified)</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate('community')}
                  className="bg-[#00685f]/40 hover:bg-[#00685f] text-[#a4f2cb] hover:text-white transition-colors text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#a4f2cb]/30 cursor-pointer"
                  title="View Jharkhand Group & Community"
                >
                  <span className="material-symbols-outlined text-[14px]">forest</span>
                  <span>Jharkhand Explorer Group Member</span>
                </button>
              </div>

              {/* Instagram-Style Stat Row */}
              <div className="flex items-center gap-5 text-white/90 text-[13px] pt-1 flex-wrap">
                <div>
                  <strong className="text-white text-base font-extrabold mr-1">{socialPosts.length}</strong>
                  <span className="text-white/70">Posts</span>
                </div>
                <div>
                  <strong className="text-white text-base font-extrabold mr-1">1,420</strong>
                  <span className="text-white/70">Followers</span>
                </div>
                <div>
                  <strong className="text-white text-base font-extrabold mr-1">312</strong>
                  <span className="text-white/70">Following</span>
                </div>
                <div className="flex items-center gap-1 text-[#a4f2cb]">
                  <span className="material-symbols-outlined text-[16px]">shield</span>
                  <span className="font-bold">
                    {currentUser.verificationStatus === 'verified' ? '100% Trust Verified' : '90% Peer Trust'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white/80 text-[12px] flex-wrap pt-0.5">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[15px] text-[#ffdbca]">home_pin</span>
                  Home: {travelerHomeCity}
                </span>
                <span className="hidden sm:inline opacity-40">•</span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[15px] text-[#a4f2cb]">speed</span>
                  Pace: {travelerPace}
                </span>
                <span className="hidden sm:inline opacity-40">•</span>
                <span className="flex items-center gap-1 font-medium text-[#ffdbca]">
                  <span className="material-symbols-outlined text-[15px]">restaurant</span>
                  {travelerDiet}
                </span>
              </div>

              <p className="text-[12.5px] text-white/90 max-w-2xl leading-relaxed pt-1 font-normal italic">
                "{travelerBio}"
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start md:self-end">
            <button
              onClick={() => setIsAiCardModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#00a896] to-[#00685f] hover:from-[#008378] hover:to-[#00524a] text-white text-[12px] font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 ring-2 ring-[#a4f2cb]/40"
            >
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>AI Travel Card</span>
            </button>

            <button
              onClick={() => setIsNewPhotoModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white text-[#1e1b4b] hover:bg-[#faf8ff] text-[12px] font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">photo_camera</span>
              <span>Post Photo/Food</span>
            </button>

            <button
              onClick={() => {
                setSelectedShareUser(communityUsers[0] || null);
                setIsSharePlanningModalOpen(true);
              }}
              className="px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[17px]">send</span>
              <span>Share Plan</span>
            </button>

            {currentUser.verificationStatus !== 'verified' && (
              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-[#006947] hover:bg-[#005237] text-white text-[12px] font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 ring-2 ring-[#a4f2cb]/30"
              >
                <span className="material-symbols-outlined text-[17px]">verified_user</span>
                <span>Upgrade ID</span>
              </button>
            )}

            {(currentUser.role === 'admin' || currentUser.email === ADMIN_EMAIL) && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="relative px-3.5 py-2.5 rounded-xl bg-[#fd761a] hover:bg-[#e06310] text-white text-[12px] font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                title="Admin Verification Desk"
              >
                <span className="material-symbols-outlined text-[17px]">admin_panel_settings</span>
                <span>Admin Desk</span>
                {pendingApps.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-[#fd761a] text-[10px] font-bold flex items-center justify-center -mr-1">
                    {pendingApps.length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsEditTravelerModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center"
              title="Edit Profile Preferences"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>
        </div>

        {/* ONE-ACCOUNT MEDIATOR PLATFORM MOTTO */}
        <div className="bg-gradient-to-r from-[#00685f]/10 via-[#00685f]/5 to-transparent border border-[#00685f]/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">handshake</span>
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-[#00685f]">
                  Travelers Helping Travelers — Mediated by Travel AI
                </span>
                <span className="text-[10px] bg-[#00685f]/15 text-[#00685f] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  One Unified Account
                </span>
              </div>
              <p className="text-[12px] text-[#3d4947] mt-0.5">
                No commercial tour guides. Everyone logs in via Gmail as a traveler, upgrades with Government ID for mutual trust, and helps each other with routes, food, and station transfers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {currentUser.verificationStatus !== 'verified' ? (
              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#006947] hover:bg-[#005237] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>Upgrade via Govt ID</span>
              </button>
            ) : (
              <span className="px-3 py-1 bg-[#e2fced] text-[#006947] text-xs font-bold rounded-xl flex items-center gap-1 border border-[#a4f2cb]">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span>Verified Trust Active</span>
              </span>
            )}
            <button
              onClick={handleToggleInstantVerify}
              className="px-3 py-1.5 bg-white hover:bg-[#f2f3ff] text-[#3d4947] text-xs font-semibold rounded-xl border border-[#eaedff] cursor-pointer shadow-xs flex items-center gap-1 transition-all"
              title="Instant switch for demonstration/testing"
            >
              <span className="material-symbols-outlined text-[15px] text-[#00685f]">bolt</span>
              <span>{currentUser.verificationStatus === 'verified' ? 'Test Unverified' : 'Test Verify'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explorer Navigation Tabs (Instagram-style) */}
      <div className="flex items-center gap-1 border-b border-[#eaedff] overflow-x-auto pb-1 bg-white p-1 rounded-2xl shadow-xs">
        {[
          { key: 'posts', label: `📸 My Photos & Food (${socialPosts.length})`, icon: 'grid_view' },
          { key: 'ai_cards', label: `✨ AI Passports & Cards (${aiCards.length})`, icon: 'auto_awesome' },
          { key: 'planning', label: `🗺️ My Planning Cards (${DEFAULT_PLANNING_CARDS.length})`, icon: 'map' },
          {
            key: 'friends',
            label: `👥 Following & Friends (${communityUsers.filter((u) => u.isFollowing).length})`,
            icon: 'group',
          },
          { key: 'host_spotlight', label: '🏡 Living State Hosts', icon: 'cottage' },
          { key: 'verification', label: '🛡️ Identity & Badge', icon: 'verified' },
          { key: 'profile', label: '⚙️ Preferences', icon: 'settings' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTravelerTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
              travelerTab === tab.key
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'text-[#3d4947] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* TAB 1: INSTAGRAM-STYLE PHOTO & FOOD GRID                          */}
      {/* ================================================================= */}
      {travelerTab === 'posts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f]">photo_library</span>
                <span>Photo &amp; Food Feed Grid</span>
              </h3>
              <p className="text-xs text-[#5f6368]">
                Your captured regional delicacies, train corridors, and cultural moments.
              </p>
            </div>
            <button
              onClick={() => setIsNewPhotoModalOpen(true)}
              className="px-3.5 py-2 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
              <span>Post New Photo / Food</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {socialPosts.map((post) => (
              <div
                key={post.id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-[#eaedff] shadow-xs cursor-pointer"
              >
                <img
                  src={post.photoUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Food Tag Pill if present */}
                {post.foodOrDishName && (
                  <div className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-amber-300">restaurant</span>
                    <span className="truncate max-w-[120px]">{post.foodOrDishName}</span>
                  </div>
                )}

                {/* Hover Overlay with Likes, Comments, and Caption */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 text-white">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-rose-400">favorite</span>
                      <span>{post.likesCount}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                      <span>{post.comments.length}</span>
                    </span>
                  </div>

                  <p className="text-[11px] line-clamp-3 text-white/90 italic">
                    "{post.caption}"
                  </p>

                  <div className="text-[10px] text-white/70 flex items-center justify-between">
                    <span>{post.location}</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: AI TRAVEL PASSPORTS & CARDS                                */}
      {/* ================================================================= */}
      {travelerTab === 'ai_cards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f]">auto_awesome</span>
                <span>My AI Travel Passports &amp; Verified Cards</span>
              </h3>
              <p className="text-xs text-[#5f6368]">
                Synthesized by Gemini AI highlighting your regional journeys, verified badges, and food tastes.
              </p>
            </div>
            <button
              onClick={() => setIsAiCardModalOpen(true)}
              className="px-3.5 py-2 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Generate New Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {aiCards.map((card) => (
              <div
                key={card.id}
                className="rounded-3xl p-5 bg-gradient-to-br from-[#004d46] via-[#00685f] to-[#0d3b36] text-white shadow-xl relative overflow-hidden space-y-3.5 border border-white/20"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-amber-300">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#a4f2cb] block">
                        {card.regionOrGroup}
                      </span>
                      <span className="text-xs font-bold text-white">{card.badgeText}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white border border-white/20">
                    {card.createdAt}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white">{card.title}</h4>
                  <p className="text-xs text-white/90 italic bg-black/25 p-2.5 rounded-xl border border-white/10">
                    "{card.vibeQuote}"
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {card.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-medium text-white"
                      >
                        • {h}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-amber-200 pt-1">
                    <span className="material-symbols-outlined text-[15px]">restaurant</span>
                    <span>Fav Dish: {card.favoriteFood}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px]">
                  <span className="text-white/70">Verified ID: EXP-2026-JH</span>
                  <button
                    onClick={() => {
                      onShowToast('Passport Card Exported 📲', 'Formatted for Instagram and social shares.', 'success');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold transition-colors cursor-pointer"
                  >
                    Share Card
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: MY PLANNING CARDS (READY TO SHARE WITH VERIFIED MEMBERS)    */}
      {/* ================================================================= */}
      {travelerTab === 'planning' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f]">map</span>
                <span>My Active Planning Cards</span>
              </h3>
              <p className="text-xs text-[#5f6368]">
                Share these planning charts with verified local friends to receive insider travel advice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_PLANNING_CARDS.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-3xl p-5 border border-[#eaedff] shadow-xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#e2fced] text-[#006947] text-[10px] font-bold">
                      {card.state}
                    </span>
                    <span className="font-bold text-xs text-[#006947]">{card.budget}</span>
                  </div>

                  <h4 className="font-bold text-sm text-[#131b2e]">{card.title}</h4>
                  <div className="text-xs text-[#5f6368] flex items-center gap-2">
                    <span>{card.corridor}</span>
                    <span>•</span>
                    <span>{card.durationDays} Days</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {card.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#faf8ff] text-[#00685f] text-[10px] font-medium border border-[#eaedff]"
                      >
                        • {h}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-[#3d4947] bg-[#faf8ff] p-2.5 rounded-xl border border-[#eaedff] italic">
                    "{card.notes}"
                  </p>
                </div>

                <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Mode: {card.transitMode}</span>
                  <button
                    onClick={() => {
                      setSelectedShareUser(communityUsers[0] || null);
                      setIsSharePlanningModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    <span>Share with Verified Friend</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: FOLLOWING & VERIFIED FRIENDS                               */}
      {/* ================================================================= */}
      {travelerTab === 'friends' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f]">group</span>
                <span>Following &amp; Verified Local Friends</span>
              </h3>
              <p className="text-xs text-[#5f6368]">
                Verified locals, certified guides, and hosts in your network.
              </p>
            </div>
            <button
              onClick={() => onNavigate('community')}
              className="px-3 py-1.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-xs font-bold text-[#00685f] hover:bg-[#00685f] hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Explore Public Directory</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityUsers
              .filter((u) => u.isFollowing || u.state === 'Jharkhand' || u.role === 'host')
              .map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl p-4 border border-[#eaedff] shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#00685f]/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-[#131b2e]">{u.name}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-[#e2fced] text-[#006947] text-[9px] font-bold">
                          {u.verificationBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5f6368] mt-0.5">{u.location} • {u.groups[0]}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedShareUser(u);
                      setIsSharePlanningModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">send</span>
                    <span>Share Plan</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}


      {/* TAB 1: SPOTLIGHT ON VERIFIED LOCAL HOST: RABINDRA JANA */}
      {travelerTab === 'host_spotlight' && (
        <div className="space-y-6">
          {/* Welcome note for traveler */}
          <div className="p-5 rounded-3xl bg-[#e2fced]/40 border border-[#a4f2cb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#006947] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">handshake</span>
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-[#131b2e]">
                  Connect with Verified Living State Hosts Across India
                </h3>
                <p className="text-[12px] text-[#3d4947]">
                  Travel AI verifies authentic local residents who provide safe guest homestays, station transfer advice, and local tea sessions with no commercial markup.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#00685f] text-white text-[12px] font-bold hover:bg-[#00534c] transition-colors cursor-pointer shrink-0"
            >
              Contact Featured Host
            </button>
          </div>

          {/* Featured Host Card: Rabindra Jana */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedff] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-[#eaedff] gap-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#00685f]/30"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-[#006947] text-white p-1 rounded-lg text-[14px]">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-[#131b2e]">{profile.name}</h2>
                    <span className="bg-[#e2fced] text-[#006947] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>Govt ID Verified Host</span>
                    </span>
                    <span className="bg-[#ffdbca] text-[#9d4300] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      West Bengal
                    </span>
                  </div>

                  <p className="text-[12px] text-[#3d4947] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#00685f]">location_on</span>
                    <span>Living in {profile.livingCity}, {profile.livingState}</span>
                    <span className="opacity-40">•</span>
                    <span className="font-semibold text-[#006947]">5.0 ★ ({profile.vouches.length} Verified Reviews)</span>
                  </p>

                  <p className="text-[13px] text-[#3d4947] max-w-xl leading-relaxed pt-1">
                    "{profile.bio}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <button
                  onClick={() => setIsConnectModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[13px] font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">bed</span>
                  <span>Request to Stay with Host</span>
                </button>
                <span className="text-[11px] text-[#717b79]">
                  {profile.hosting.canHost ? '● Available to Host Guests' : '○ On Request'}
                </span>
              </div>
            </div>

            {/* What Host Rabindra Offers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                <div className="flex items-center gap-2 text-[#00685f]">
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  <h4 className="font-bold text-[14px] text-[#131b2e]">Homestay Living Space</h4>
                </div>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  {profile.hosting.homeType}. Accommodates up to {profile.hosting.maxGuests} travelers. Quiet study corner, clean bed, and home meals.
                </p>
                <div className="text-[11px] font-semibold text-[#00685f]">
                  Free traveler hospitality (₹0 commercial fee)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                <div className="flex items-center gap-2 text-[#9d4300]">
                  <span className="material-symbols-outlined text-[20px]">train</span>
                  <h4 className="font-bold text-[14px] text-[#131b2e]">Railway Transit Guide</h4>
                </div>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  Assistance with platform navigation and connecting train transfers at Kharagpur Junction (the longest platform corridor) and Howrah.
                </p>
                <div className="text-[11px] font-semibold text-[#9d4300]">
                  Station meetup &amp; PNR advice
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                <div className="flex items-center gap-2 text-[#006947]">
                  <span className="material-symbols-outlined text-[20px]">local_cafe</span>
                  <h4 className="font-bold text-[14px] text-[#131b2e]">Chai &amp; Heritage Walks</h4>
                </div>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  Morning cup of Bengal milk tea, strolls along ancient terracotta temple routes in Midnapore, and authentic sweet recommendations.
                </p>
                <div className="text-[11px] font-semibold text-[#006947]">
                  Terracotta routes &amp; local fish curry
                </div>
              </div>
            </div>

            {/* House Guidelines Preview */}
            <div className="p-5 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] space-y-3">
              <h4 className="font-bold text-[14px] text-[#131b2e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#00685f]">rule</span>
                <span>House Guidelines &amp; Community Atmosphere</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[#3d4947]">
                {profile.hosting.houseRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px] text-[#006947]">check_circle</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traveler Reviews for Host Rabindra */}
            <div className="pt-2">
              <TravelerReviews
                profileId={profile.id}
                profileName={profile.name}
                livingState={profile.livingState}
                livingCity={profile.livingCity}
                vouches={profile.vouches}
                onAddReview={(newReview) => {
                  const updated = addTravelerReview(newReview);
                  setProfile(updated);
                }}
                onShowToast={onShowToast}
                onNavigateToTrip={(dest) => {
                  if (onPlanTripTo) {
                    onPlanTripTo('New Delhi', dest);
                  } else {
                    onNavigate('journal');
                  }
                }}
                isAdmin={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY TRAVEL PREFERENCES */}
      {travelerTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedff] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eaedff] gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wider block">
                Travel Identity
              </span>
              <h2 className="text-xl font-bold text-[#131b2e]">My Journey Preferences</h2>
              <p className="text-[12px] text-[#3d4947] mt-0.5">
                These settings personalize your itinerary recommendations and railway transit guides.
              </p>
            </div>
            <button
              onClick={() => setIsEditTravelerModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Preferences</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
              <span className="text-[11px] font-bold text-[#717b79] uppercase">Travel Philosophy &amp; Bio</span>
              <p className="text-[13px] text-[#131b2e] leading-relaxed">{travelerBio}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-3">
              <span className="text-[11px] font-bold text-[#717b79] uppercase">Pace &amp; Dining Style</span>
              <div className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#3d4947]">Exploration Pace</span>
                  <span className="font-semibold text-[#131b2e]">{travelerPace}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#3d4947]">Dietary Preference</span>
                  <span className="font-semibold text-[#131b2e]">{travelerDiet}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#3d4947]">Preferred Rail Class</span>
                  <span className="font-semibold text-[#131b2e]">2AC / 3AC / Executive Chair</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#3d4947]">Budget Philosophy</span>
                  <span className="font-semibold text-[#00685f]">Authentic &amp; Mindful (₹ INR)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY IDENTITY BADGE & VERIFICATION */}
      {travelerTab === 'verification' && (
        <div className="space-y-6">
          {/* Main Status & Action Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedff] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eaedff] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wider">
                    Trust &amp; Identity System
                  </span>
                  <span className="text-[10px] bg-[#00685f]/10 text-[#00685f] font-bold px-2 py-0.5 rounded-full">
                    One Account Model
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#131b2e] mt-1">
                  Government ID Verification &amp; Trust Badges
                </h2>
                <p className="text-[12px] text-[#3d4947] mt-0.5">
                  Upgrade your Gmail traveler account with any official Government ID card to establish mutual trust and unlock planning card sharing.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentUser.verificationStatus !== 'verified' ? (
                  <button
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#006947] hover:bg-[#005237] text-white text-[13px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Upgrade via Govt ID</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-[#e2fced] text-[#006947] border border-[#a4f2cb] text-[13px] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Verified Badge Active</span>
                  </div>
                )}

                <button
                  onClick={handleToggleInstantVerify}
                  className="px-3.5 py-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#00685f] text-[12px] font-bold transition-all border border-[#eaedff] cursor-pointer flex items-center gap-1"
                  title="Toggle verified status immediately for demonstration"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>{currentUser.verificationStatus === 'verified' ? 'Reset to Unverified' : 'Instant Verify'}</span>
                </button>
              </div>
            </div>

            {/* Current Status Showcase */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                currentUser.verificationStatus === 'verified'
                  ? 'bg-[#e2fced]/40 border-[#a4f2cb]'
                  : currentUser.verificationStatus === 'pending'
                  ? 'bg-[#fff8e6] border-[#ffe082]'
                  : 'bg-[#faf8ff] border-[#eaedff]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    currentUser.verificationStatus === 'verified'
                      ? 'bg-[#006947] text-white'
                      : currentUser.verificationStatus === 'pending'
                      ? 'bg-[#ff9900] text-white'
                      : 'bg-[#717b79] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {currentUser.verificationStatus === 'verified'
                      ? 'verified'
                      : currentUser.verificationStatus === 'pending'
                      ? 'hourglass_top'
                      : 'shield_person'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#131b2e]">
                      {currentUser.verificationStatus === 'verified'
                        ? 'Govt ID Verified Traveler Badge Active'
                        : currentUser.verificationStatus === 'pending'
                        ? 'Government ID Submitted (Under Review)'
                        : 'Unverified Explorer Account'}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        currentUser.verificationStatus === 'verified'
                          ? 'bg-[#006947] text-white'
                          : currentUser.verificationStatus === 'pending'
                          ? 'bg-[#ff9900] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {currentUser.verificationStatus === 'verified'
                        ? '100% Trust Rating'
                        : currentUser.verificationStatus === 'pending'
                        ? 'Pending Review'
                        : 'Action Required'}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#3d4947] mt-1">
                    {currentUser.verificationStatus === 'verified'
                      ? 'You are an authenticated community member. Fellow travelers can confidently send you planning requests and trade regional corridor advice as trusted friends.'
                      : currentUser.verificationStatus === 'pending'
                      ? 'Your government ID documents are queued at the Admin Verification Desk (askrabindrajana@gmail.com). You will receive your badge shortly.'
                      : 'Upload an Aadhaar Card, Passport, Voter ID, or Driving License. Once verified by Rabindra Jana, your profile displays the verified badge for all travelers.'}
                  </p>
                </div>
              </div>

              {currentUser.verificationStatus !== 'verified' && (
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="px-4 py-2 bg-[#00685f] hover:bg-[#00524a] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap self-end sm:self-auto shrink-0"
                >
                  Submit Government ID
                </button>
              )}
            </div>

            {/* Acceptable Govt ID Types */}
            <div>
              <h4 className="text-[13px] font-bold text-[#131b2e] mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#00685f]">badge</span>
                <span>Supported Government ID Documents for Verification</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    name: 'Aadhaar Card',
                    badge: 'UIDAI Masked',
                    icon: 'fingerprint',
                    desc: 'Front and back photo with first 8 digits masked for safety.',
                  },
                  {
                    name: 'Indian Passport',
                    badge: 'Ministry of Ext Affairs',
                    icon: 'menu_book',
                    desc: 'Photo page with clear name and passport authority stamp.',
                  },
                  {
                    name: 'Voter ID Card',
                    badge: 'Election Commission',
                    icon: 'how_to_vote',
                    desc: 'EPIC number with permanent state address details.',
                  },
                  {
                    name: 'Driving License',
                    badge: 'State Transport Auth',
                    icon: 'directions_car',
                    desc: 'Valid motor vehicle license issued by any Indian state.',
                  },
                ].map((idDoc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#faf8ff] border border-[#eaedff] hover:border-[#00685f]/40 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="material-symbols-outlined text-[22px] text-[#00685f]">
                          {idDoc.icon}
                        </span>
                        <span className="text-[10px] font-bold bg-[#00685f]/10 text-[#00685f] px-2 py-0.5 rounded">
                          {idDoc.badge}
                        </span>
                      </div>
                      <h5 className="font-bold text-[13px] text-[#131b2e]">{idDoc.name}</h5>
                      <p className="text-[11px] text-[#717b79] mt-1 leading-relaxed">{idDoc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Pillars of Mediation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#e2fced]/30 border border-[#a4f2cb] space-y-2">
                <span className="material-symbols-outlined text-[26px] text-[#006947]">handshake</span>
                <h4 className="font-bold text-[14px] text-[#131b2e]">Mediated Friend Assistance</h4>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  No paid agents or tours. The app mediates direct connections so verified travelers help each other with railway transfers and hidden eateries.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                <span className="material-symbols-outlined text-[26px] text-[#00685f]">share_location</span>
                <h4 className="font-bold text-[14px] text-[#131b2e]">Shared Planning Cards</h4>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  Verified travelers can share day-by-day transit charts, meal locations, and train timings with friends for feedback.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
                <span className="material-symbols-outlined text-[26px] text-[#fd761a]">security</span>
                <h4 className="font-bold text-[14px] text-[#131b2e]">Admin Oversight by Rabindra</h4>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  Every government ID is authenticated manually by Rabindra Jana (askrabindrajana@gmail.com) before verified status is granted.
                </p>
              </div>
            </div>
          </div>

          {/* ADMIN VERIFICATION DESK CARD (Available when logged in as admin) */}
          {(currentUser.role === 'admin' || currentUser.email === ADMIN_EMAIL) && (
            <div className="bg-gradient-to-br from-[#00685f]/10 via-[#faf8ff] to-[#f2f3ff] rounded-3xl p-6 sm:p-8 border-2 border-[#00685f]/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-[26px]">admin_panel_settings</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#131b2e]">
                        Admin Verification Desk
                      </h3>
                      <span className="text-[11px] font-bold bg-[#00685f] text-white px-2 py-0.5 rounded-full">
                        Administrator Authority
                      </span>
                    </div>
                    <p className="text-[12px] text-[#3d4947]">
                      As Rabindra Jana ({ADMIN_EMAIL}), you review traveler government ID applications and grant official verified badges.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[13px] font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Review Submissions &amp; Issue Badges</span>
                  {pendingApps.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#fd761a] text-white text-[11px] font-extrabold">
                      {pendingApps.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY SAVED EXPEDITIONS */}
      {travelerTab === 'trips' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedff] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eaedff] gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wider block">
                Itineraries
              </span>
              <h2 className="text-xl font-bold text-[#131b2e]">My Saved Expeditions &amp; Routes</h2>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
              <span>Plan New Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#eaedff] overflow-hidden bg-[#faf8ff] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#00685f] uppercase">Northern Expedition</span>
                <span className="text-[10px] bg-[#e2fced] text-[#006947] px-2 py-0.5 rounded-full font-bold">Planned</span>
              </div>
              <h3 className="font-bold text-[15px] text-[#131b2e]">Varanasi Ghats &amp; Ganga Aarti</h3>
              <p className="text-[12px] text-[#3d4947]">Vande Bharat Express route from Delhi, heritage silk weavers, evening boat ride.</p>
              <button
                onClick={() => onNavigate('journal')}
                className="w-full py-2 rounded-xl bg-white border border-[#eaedff] text-[#00685f] text-[12px] font-bold hover:bg-[#f2f3ff] transition-colors cursor-pointer"
              >
                View Itinerary
              </button>
            </div>

            <div className="rounded-2xl border border-[#eaedff] overflow-hidden bg-[#faf8ff] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#9d4300] uppercase">Living State Homestay</span>
                <span className="text-[10px] bg-[#ffdbca] text-[#9d4300] px-2 py-0.5 rounded-full font-bold">Corridor</span>
              </div>
              <h3 className="font-bold text-[15px] text-[#131b2e]">Bengal Terracotta &amp; Kharagpur</h3>
              <p className="text-[12px] text-[#3d4947]">Medinipur homestay with Host Rabindra Jana, morning chai, and river walk.</p>
              <button
                onClick={() => setTravelerTab('host_spotlight')}
                className="w-full py-2 rounded-xl bg-white border border-[#eaedff] text-[#00685f] text-[12px] font-bold hover:bg-[#f2f3ff] transition-colors cursor-pointer"
              >
                View Host Details
              </button>
            </div>

            <div className="rounded-2xl border border-[#eaedff] overflow-hidden bg-[#faf8ff] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#4338ca] uppercase">2027 Milestone</span>
                <span className="text-[10px] bg-[#eaedff] text-[#4338ca] px-2 py-0.5 rounded-full font-bold">Goal</span>
              </div>
              <h3 className="font-bold text-[15px] text-[#131b2e]">Spiti Valley Winter Circuit</h3>
              <p className="text-[12px] text-[#3d4947]">Fund savings target 70% reached. Preparing acclimatization gear &amp; packing list.</p>
              <button
                onClick={() => onNavigate('goals')}
                className="w-full py-2 rounded-xl bg-white border border-[#eaedff] text-[#00685f] text-[12px] font-bold hover:bg-[#f2f3ff] transition-colors cursor-pointer"
              >
                View Goal Fund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Traveler Preferences Modal */}
      {isEditTravelerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <h3 className="font-bold text-[16px] text-[#131b2e]">Edit Explorer Preferences</h3>
                <p className="text-[12px] text-[#3d4947]">Personalize your travel bio and rhythm</p>
              </div>
              <button
                onClick={() => setIsEditTravelerModalOpen(false)}
                className="p-1 rounded-lg text-[#3d4947] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTravelerPreferences} className="space-y-3.5">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Home Base City</label>
                <input
                  type="text"
                  value={travelerHomeCity}
                  onChange={(e) => setTravelerHomeCity(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Explorer Bio</label>
                <textarea
                  rows={3}
                  value={travelerBio}
                  onChange={(e) => setTravelerBio(e.target.value)}
                  className="w-full p-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Travel Pace</label>
                  <select
                    value={travelerPace}
                    onChange={(e) => setTravelerPace(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none cursor-pointer"
                  >
                    <option value="Moderate & Cultural">Moderate &amp; Cultural</option>
                    <option value="Slow & Relaxed">Slow &amp; Relaxed</option>
                    <option value="Fast & Active">Fast &amp; Active</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Diet Preference</label>
                  <input
                    type="text"
                    value={travelerDiet}
                    onChange={(e) => setTravelerDiet(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsEditTravelerModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#3d4947]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[13px] font-bold shadow-sm cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Submission Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        userId={currentUser.id}
        userName={currentUser.name}
        defaultLivingState="Delhi"
        defaultLivingCity="New Delhi"
        onSubmitted={() => {
          onShowToast(
            'Verification Submitted',
            'Your ID has been submitted to Admin Rabindra Jana for verification review.',
            'success'
          );
        }}
        onShowToast={onShowToast}
      />

      {/* Connect / Stay Inquiry Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <h3 className="font-bold text-[16px] text-[#131b2e]">
                  Connect with {profile.name} (Local Host)
                </h3>
                <p className="text-[12px] text-[#3d4947]">
                  Living in {profile.livingCity}, {profile.livingState}
                </p>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1 rounded-lg text-[#3d4947] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendConnectMessage} className="space-y-3.5">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  What is your travel need?
                </label>
                <select
                  value={connectSubject}
                  onChange={(e) => setConnectSubject(e.target.value as any)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40 cursor-pointer"
                >
                  <option value="homestay">🏡 Request Homestay / Overnight Stay in Medinipur</option>
                  <option value="chai">☕ Meet for Chai &amp; Local Heritage Walk</option>
                  <option value="transit_help">🚆 Kharagpur / Bengal Railway &amp; Station Transit Help</option>
                  <option value="general">💬 General Travel Advice for Bengal</option>
                </select>
              </div>

              {connectSubject === 'homestay' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Number of Travelers</label>
                    <input
                      type="number"
                      min={1}
                      max={profile.hosting.maxGuests}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Approx. Dates</label>
                    <input
                      type="text"
                      placeholder="e.g. Nov 12 - 14"
                      value={travelDates}
                      onChange={(e) => setTravelDates(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Introduce Yourself &amp; Travel Purpose
                </label>
                <textarea
                  rows={4}
                  required
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Share a little bit about yourself, your planned journey through Bengal, and how he can assist you..."
                  className="w-full p-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#e2fced]/60 text-[11px] text-[#006947] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>You are contacting a Government ID Verified Host. Free hospitality, no commercial charges.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#3d4947]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[13px] font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Send Travel Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PHOTO / FOOD POST MODAL */}
      {isNewPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f]">photo_camera</span>
                <h3 className="font-extrabold text-base text-[#131b2e]">Post Photo / Food Moment</h3>
              </div>
              <button
                onClick={() => setIsNewPhotoModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!userPhotoUrl.trim() || !userPhotoCaption.trim()) {
                  onShowToast('Missing Fields', 'Please provide a photo URL and caption.', 'warning');
                  return;
                }

                addSocialPost({
                  id: `post-user-${Date.now()}`,
                  authorId: currentUser.id,
                  authorName: currentUser.name,
                  authorHandle: '@explorer_india',
                  authorAvatar:
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                  isVerified: true,
                  authorBadge: 'Govt ID Verified Explorer',
                  groupAffiliation: 'Jharkhand Explorer Group',
                  stateTag: 'Jharkhand',
                  photoUrl: userPhotoUrl,
                  caption: userPhotoCaption,
                  foodOrDishName: userDishName.trim() || undefined,
                  location: userPhotoLocation,
                  type: userPhotoType,
                  likesCount: 1,
                  liked: false,
                  comments: [
                    {
                      id: `c_${Date.now()}`,
                      author: 'Subhashish Roy',
                      avatar:
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                      text: 'Great capture! Let me know if you explore the nearby corridor too.',
                      timeAgo: 'Just now',
                    },
                  ],
                  timestamp: 'Just now',
                  tags: [userPhotoType, 'Jharkhand', 'Explorer'],
                });

                setSocialPosts(getStoredSocialPosts());
                setUserPhotoCaption('');
                setUserDishName('');
                setIsNewPhotoModalOpen(false);
                onShowToast(
                  'Photo & Food Post Published! 📸',
                  'Your post is now live on your profile and main community feed.',
                  'success'
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-[#131b2e] block mb-1">Post Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'food', label: '🥘 Food / Dish' },
                    { id: 'scenic', label: '🌄 Landscape' },
                    { id: 'heritage', label: '🏛️ Heritage' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setUserPhotoType(t.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        userPhotoType === t.id
                          ? 'bg-[#00685f] text-white shadow-xs'
                          : 'bg-[#faf8ff] text-[#3d4947] border border-[#eaedff]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#131b2e] block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  required
                  value={userPhotoUrl}
                  onChange={(e) => setUserPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 bg-[#faf8ff] rounded-xl text-xs text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
                <div className="flex gap-2 mt-2">
                  {[
                    {
                      name: 'Dhuska Plate',
                      url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Litti Chokha',
                      url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
                    },
                    {
                      name: 'Netarhat Hills',
                      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
                    },
                  ].map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => {
                        setUserPhotoUrl(sample.url);
                        if (sample.name.includes('Dhuska') || sample.name.includes('Litti')) {
                          setUserDishName(sample.name);
                        }
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#3d4947] cursor-pointer"
                    >
                      + {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {userPhotoType === 'food' && (
                <div>
                  <label className="text-xs font-bold text-[#131b2e] block mb-1">Dish / Delicacy Name</label>
                  <input
                    type="text"
                    value={userDishName}
                    onChange={(e) => setUserDishName(e.target.value)}
                    placeholder="e.g. Authentic Dhuska & Chana Ghugni"
                    className="w-full h-10 px-3 bg-[#faf8ff] rounded-xl text-xs text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#131b2e] block mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={userPhotoLocation}
                  onChange={(e) => setUserPhotoLocation(e.target.value)}
                  placeholder="e.g. Ranchi, Jharkhand"
                  className="w-full h-10 px-3 bg-[#faf8ff] rounded-xl text-xs text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#131b2e] block mb-1">Caption &amp; Taste Notes</label>
                <textarea
                  rows={3}
                  required
                  value={userPhotoCaption}
                  onChange={(e) => setUserPhotoCaption(e.target.value)}
                  placeholder="Write your story or review of this dish/view..."
                  className="w-full p-3 bg-[#faf8ff] rounded-xl text-xs text-[#131b2e] outline-none border border-[#eaedff] focus:border-[#00685f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewPhotoModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Share to Feed &amp; Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI TRAVEL CARD MODAL */}
      <AiTravelCardModal
        isOpen={isAiCardModalOpen}
        onClose={() => {
          setIsAiCardModalOpen(false);
          setAiCards(getStoredAiCards());
        }}
        targetSection="profile"
        onShowToast={onShowToast}
      />

      {/* SHARE PLANNING CARD MODAL */}
      <SharePlanningCardModal
        isOpen={isSharePlanningModalOpen}
        onClose={() => setIsSharePlanningModalOpen(false)}
        recipient={selectedShareUser}
        onShowToast={onShowToast}
      />

      {/* GOVERNMENT ID VERIFICATION APPLICATION MODAL */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        userId={currentUser.id}
        userName={currentUser.name}
        defaultLivingState={currentUser.livingState || 'Jharkhand'}
        defaultLivingCity={currentUser.homeCity || 'Ranchi'}
        onSubmitted={() => {
          refreshProfile();
          const updated = updateAuthUserProfile({
            verificationStatus: 'pending',
            verifiedBadgeTitle: 'Govt ID Submitted (Pending Review)',
          });
          setCurrentUser(updated);
          onShowToast(
            'Government ID Application Queued',
            'Your identity card was submitted for verification by Rabindra Jana.',
            'info'
          );
        }}
        onShowToast={onShowToast}
      />

      {/* ADMIN VERIFICATION REVIEW DESK MODAL */}
      <AdminVerificationModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onUpdated={() => {
          refreshProfile();
          setCurrentUser(getStoredAuthUser());
        }}
        onShowToast={onShowToast}
      />

    </div>
  );
};
