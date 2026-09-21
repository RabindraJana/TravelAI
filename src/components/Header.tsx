import React, { useState } from 'react';

interface HeaderProps {
  onAskAI?: (prompt: string) => void;
  onToggleMobileMenu?: () => void;
  onOpenSettings?: () => void;
  currency?: string;
  onCurrencyChange?: (curr: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAskAI,
  onToggleMobileMenu,
  onOpenSettings,
  currency = '₹ INR',
  onCurrencyChange,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

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

        {/* Avatar with Settings Trigger */}
        <button
          onClick={onOpenSettings}
          title="Open Settings & Preferences"
          className="p-0.5 rounded-full hover:ring-2 hover:ring-[#00685f] transition-all cursor-pointer"
        >
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#00685f]/30"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          />
        </button>
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
