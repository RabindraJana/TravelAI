import React, { useState } from 'react';
import { ScreenType, AuthUser } from '../types';

interface HeaderProps {
  onAskAI?: (prompt: string) => void;
  onToggleMobileMenu?: () => void;
  onOpenSettings?: () => void;
  onNavigate?: (screen: ScreenType) => void;
  currency?: string;
  onCurrencyChange?: (curr: string) => void;
  currentUser?: AuthUser;
  onOpenAuthModal?: (initialTab?: 'user' | 'guider' | 'admin') => void;
  onQuickSwitchRole?: () => void;
  onViewLandingPage?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAskAI,
  onToggleMobileMenu,
  onOpenSettings,
  onNavigate,
  currency = '₹ INR',
  onCurrencyChange,
  currentUser,
  onOpenAuthModal,
  onQuickSwitchRole,
  onViewLandingPage,
  onLogout,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isGuider = currentUser?.role === 'guider';

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-6 border-b border-[#eaedff] transition-all">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#f2f3ff] transition-colors cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px] block">menu</span>
        </button>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-[#f2f3ff] px-3.5 py-1.5 sm:py-2 rounded-xl w-36 sm:w-64 text-[#3d4947] focus-within:ring-2 focus-within:ring-[#00685f]/30 focus-within:bg-white transition-all">
          <span className="material-symbols-outlined text-[18px] shrink-0">search</span>
          <input
            type="text"
            placeholder="Search trips &amp; places..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-transparent text-[13px] sm:text-[14px] text-[#131b2e] placeholder-[#3d4947]/70 focus:outline-none"
          />
        </div>

        {/* Ask Travel AI chip */}
        <button
          onClick={() => {
            if (onAskAI) {
              onAskAI("Tell me top recommendations for my next trip");
            } else {
              setIsAiModalOpen(true);
            }
          }}
          className="hidden sm:flex items-center gap-1.5 bg-[#ffdbca]/60 hover:bg-[#ffdbca] px-3.5 py-1.5 rounded-full text-[#9d4300] cursor-pointer transition-colors text-[12px] font-semibold shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>✨ Ask Travel AI</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="flex items-center gap-1 bg-[#f2f3ff] px-2.5 sm:px-3 py-1.5 rounded-lg text-[#3d4947] text-[12px] font-semibold cursor-pointer hover:bg-[#e2e7ff] transition-colors"
          >
            <span>{currency.split(' ')[0]}</span>
            <span className="hidden sm:inline">{currency.split(' ')[1]}</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
          {currencyOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-[#eaedff] py-1 z-50">
              {['₹ INR', '$ USD', '€ EUR', '£ GBP'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    if (onCurrencyChange) onCurrencyChange(curr);
                    setCurrencyOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#f2f3ff] transition-colors cursor-pointer ${
                    currency === curr ? 'text-[#00685f] font-semibold bg-[#00685f]/5' : 'text-[#3d4947]'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setHasUnreadNotification(false);
            }}
            className="relative p-2 text-[#3d4947] hover:text-[#131b2e] hover:bg-[#f2f3ff] rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {hasUnreadNotification && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fd761a] ring-2 ring-white"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#eaedff] p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#eaedff] mb-3">
                <span className="font-bold text-[14px] text-[#131b2e]">Live Trip Alerts</span>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-[#00685f] hover:underline font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f2f3ff]">
                  <div className="w-8 h-8 rounded-full bg-[#00685f]/15 text-[#00685f] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">sailing</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#131b2e]">Varanasi Solo Expedition</p>
                    <p className="text-[12px] text-[#3d4947] mt-0.5">Evening Ganga Aarti boat ride scheduled for 6:30 PM.</p>
                    <span className="text-[10px] text-[#9d4300] font-semibold mt-1 block">Scheduled for Oct 14</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#00685f]/5 border border-[#00685f]/15">
                  <div className="w-8 h-8 rounded-full bg-[#00685f]/15 text-[#00685f] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">savings</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#131b2e]">2027 Goals Fund</p>
                    <p className="text-[12px] text-[#3d4947] mt-0.5">Spiti Valley fund reached 70% readiness goal!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic User Role Button & Indicator */}
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('host-dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold transition-all cursor-pointer shadow-xs"
              title="Open Host Dashboard"
            >
              <span className="material-symbols-outlined text-[16px]">villa</span>
              <span className="hidden sm:inline">Host Dashboard</span>
            </button>

            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal('admin');
                else if (onNavigate) onNavigate('profile');
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00685f]/10 hover:bg-[#00685f]/20 text-[#00685f] text-[12px] font-bold transition-all cursor-pointer border border-[#00685f]/20"
              title="Host Administrator (askrabindrajana@gmail.com)"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006947]">admin_panel_settings</span>
              <span>Rabindra Jana</span>
              <span className="text-[10px] bg-[#00685f] text-white px-1.5 py-0.5 rounded-full font-bold">
                Admin
              </span>
            </button>

            {onQuickSwitchRole && (
              <button
                onClick={onQuickSwitchRole}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3d4947] hover:text-[#131b2e] text-[11px] font-semibold transition-colors cursor-pointer border border-[#eaedff]"
                title="Preview Explorer view (what regular users see)"
              >
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                <span>Traveler View</span>
              </button>
            )}
          </div>
        ) : isGuider ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('guider-dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12px] font-bold transition-all cursor-pointer shadow-xs"
              title="Open Guider Console"
            >
              <span className="material-symbols-outlined text-[16px]">explore</span>
              <span className="hidden sm:inline">Guider Console</span>
            </button>

            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal('guider');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0284c7]/10 hover:bg-[#0284c7]/20 text-[#0284c7] text-[12px] font-bold transition-all cursor-pointer border border-[#0284c7]/20"
              title={`Certified Guider: ${currentUser?.name || 'Guider'}`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>{currentUser?.name || 'Guider'}</span>
              <span className="text-[10px] bg-[#0284c7] text-white px-1.5 py-0.5 rounded-full font-bold">
                Guider
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal('user');
                else if (onNavigate) onNavigate('profile');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2fced] hover:bg-[#cff5e0] text-[#006947] text-[12px] font-bold transition-all cursor-pointer border border-[#a4f2cb]"
              title={`Traveler Profile: ${currentUser?.name || 'Explorer'}`}
            >
              <span className="material-symbols-outlined text-[16px]">backpack</span>
              <span>{currentUser?.name || 'Explorer'}</span>
              <span className="text-[10px] bg-[#006947] text-white px-1.5 py-0.5 rounded-full font-bold">
                Explorer
              </span>
            </button>

            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal('user');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold shadow-xs transition-colors cursor-pointer"
              title="Sign in to your account"
            >
              <span className="material-symbols-outlined text-[15px]">login</span>
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Avatar with Account Menu Trigger */}
        <div className="relative">
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            title={isAdmin ? 'Rabindra Jana (Admin)' : isGuider ? `${currentUser?.name} (Guider)` : `${currentUser?.name || 'Traveler'} (Explorer)`}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-[#00685f] transition-all cursor-pointer relative"
          >
            <img
              alt="Profile"
              className={`w-8 h-8 rounded-full object-cover ring-1 ${
                isAdmin ? 'ring-[#00685f]' : isGuider ? 'ring-[#0284c7]' : 'ring-[#006947]/30'
              }`}
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
              }
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-white ring-1 ring-white ${
                isAdmin ? 'bg-[#00685f]' : isGuider ? 'bg-[#0284c7]' : 'bg-[#006947]'
              }`}
            >
              <span className="material-symbols-outlined text-[8px]">
                {isAdmin ? 'star' : isGuider ? 'flag' : 'check'}
              </span>
            </span>
          </button>

          {accountMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#eaedff] p-3 z-50 animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#eaedff] mb-2">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#eaedff]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#131b2e] truncate">
                    {currentUser?.name || 'Explorer'}
                  </div>
                  <div className="text-[11px] text-[#717b79] truncate">
                    {currentUser?.email || (isAdmin ? 'askrabindrajana@gmail.com' : 'traveler@gmail.com')}
                  </div>
                  <span
                    className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isAdmin
                        ? 'bg-[#00685f]/10 text-[#00685f]'
                        : isGuider
                        ? 'bg-[#0284c7]/10 text-[#0284c7]'
                        : 'bg-[#006947]/10 text-[#006947]'
                    }`}
                  >
                    {isAdmin ? '🌟 Host & Administrator' : isGuider ? '🚩 Certified Guider' : '🎒 Traveler Explorer'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      if (onNavigate) onNavigate('host-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold text-[#00685f] bg-[#00685f]/8 hover:bg-[#00685f]/15 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">villa</span>
                    <span>Host Dashboard</span>
                  </button>
                )}

                {isGuider && (
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      if (onNavigate) onNavigate('guider-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold text-[#0284c7] bg-[#0284c7]/8 hover:bg-[#0284c7]/15 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#0284c7]">explore</span>
                    <span>Guider Console</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    if (onNavigate) onNavigate('profile');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold text-[#131b2e] hover:bg-[#f2f3ff] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                    {isAdmin ? 'badge' : isGuider ? 'badge' : 'person'}
                  </span>
                  <span>{isAdmin ? 'Host Suite & Profile' : isGuider ? 'Guider Profile' : 'My Explorer Profile'}</span>
                </button>

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    if (onOpenAuthModal) onOpenAuthModal(isAdmin ? 'user' : isGuider ? 'user' : 'user');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold text-[#00685f] hover:bg-[#00685f]/5 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                  <span>
                    {isAdmin ? 'Switch to Traveler View' : isGuider ? 'Switch to Traveler View' : 'Sign In / Switch Account'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium text-[#3d4947] hover:bg-[#f2f3ff] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  <span>Settings &amp; Preferences</span>
                </button>

                {onViewLandingPage && (
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onViewLandingPage();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium text-[#00685f] hover:bg-[#00685f]/8 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">home</span>
                    <span>View Landing Page</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-[#eaedff] mt-1 pt-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-rose-600">logout</span>
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00685f]">
                <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                <h3 className="font-bold text-[18px]">Ask Travel AI Co-pilot</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-[#3d4947] hover:text-[#131b2e] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-[14px] text-[#3d4947]">
              Travel AI Co-pilot is synced to your profile, upcoming Varanasi trip, and 2027 goals. Ask for recommendations, packing lists, or budget tips.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsAiModalOpen(false);
                  if (onAskAI) onAskAI("Best Ghats in Varanasi for morning sunrise");
                }}
                className="w-full text-left p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[13px] text-[#131b2e] font-medium transition-colors"
              >
                ✨ "Best Ghats in Varanasi for morning sunrise"
              </button>
              <button
                onClick={() => {
                  setIsAiModalOpen(false);
                  if (onAskAI) onAskAI("What should I pack for October weather in Varanasi?");
                }}
                className="w-full text-left p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[13px] text-[#131b2e] font-medium transition-colors"
              >
                ✨ "What should I pack for October weather in Varanasi?"
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
