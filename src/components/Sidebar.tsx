import React from 'react';
import { ScreenType, TransitionType } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  isOpen = false,
  onClose,
  onOpenSettings,
}) => {
  const handleNavClick = (screen: ScreenType) => {
    onNavigate(screen, 'none');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-[#ffffff] z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#eaedff] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Mobile Close */}
          <div className="h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00685f] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </div>
              <span className="font-bold text-[20px] text-[#00685f] tracking-tight">Travel AI</span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation items */}
          <nav className="px-4 py-2 space-y-1 flex-1">
            <a
              href="#dashboard"
              data-path="dashboard"
              aria-current={currentScreen === 'dashboard' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('dashboard');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 transition-all rounded-xl font-semibold text-[14px] ${
                currentScreen === 'dashboard'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              <span>Dashboard</span>
            </a>

            <a
              href="#planner"
              data-path="planner"
              aria-current={currentScreen === 'planner' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('planner');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 transition-all rounded-xl font-semibold text-[14px] ${
                currentScreen === 'planner'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              <span>AI Trip Planner</span>
            </a>

            <a
              href="#trips"
              data-path="trips"
              aria-current={currentScreen === 'trips' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('trips');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-[14px] ${
                currentScreen === 'trips'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
              <span>My Trips</span>
            </a>

            <a
              href="#journal"
              data-path="journal"
              aria-current={currentScreen === 'journal' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('journal');
              }}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all font-semibold text-[14px] ${
                currentScreen === 'journal'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                <span>Travel Journal</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentScreen === 'journal' ? 'bg-white/20 text-white' : 'bg-[#e2fced] text-[#006947]'
                }`}
              >
                Guider
              </span>
            </a>

            <a
              href="#explore"
              data-path="explore"
              aria-current={currentScreen === 'explore' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('explore');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-[14px] ${
                currentScreen === 'explore'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              <span>Explore Destinations</span>
            </a>

            <a
              href="#community"
              data-path="community"
              aria-current={currentScreen === 'community' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('community');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-[14px] ${
                currentScreen === 'community'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>Community</span>
            </a>

            <a
              href="#map"
              data-path="map"
              aria-current={currentScreen === 'map' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('map');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-[14px] ${
                currentScreen === 'map'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              <span>Travel Map</span>
            </a>

            <a
              href="#achievements"
              data-path="achievements"
              aria-current={currentScreen === 'achievements' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('achievements');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-[14px] ${
                currentScreen === 'achievements'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
              <span>Achievements</span>
            </a>

            <a
              href="#goals"
              data-path="goals"
              aria-current={currentScreen === 'goals' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('goals');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold text-[14px] ${
                currentScreen === 'goals'
                  ? 'bg-[#008378] text-white shadow-sm'
                  : 'text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">flag</span>
              <span>2027 Goals</span>
            </a>
          </nav>
        </div>

        {/* User profile & Settings */}
        <div className="p-4 space-y-2 bg-[#f2f3ff] border-t border-[#eaedff]">
          <div
            onClick={onOpenSettings}
            className="flex items-center justify-between p-2 rounded-xl bg-[#ffffff] shadow-xs cursor-pointer hover:ring-2 hover:ring-[#00685f]/30 transition-all"
          >
            <div className="flex items-center gap-2">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#00685f]/20"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[14px] text-[#131b2e]">Aarav Patel</span>
                  <span className="material-symbols-outlined text-[#00685f] text-[14px]">verified</span>
                </div>
                <span className="text-[12px] text-[#9d4300] font-semibold">4.9 ★</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#3d4947]">tune</span>
          </div>

          <div className="flex items-center justify-between px-2 pt-1">
            <button
              className="flex items-center gap-1 text-[#3d4947] hover:text-[#131b2e] text-[12px] font-medium transition-colors cursor-pointer"
              data-path="settings"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                if (onClose) onClose();
              }}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>Settings</span>
            </button>
            <button
              className="flex items-center gap-1 text-[#3d4947] hover:text-[#00685f] text-[12px] font-medium transition-colors cursor-pointer"
              data-path="pwa"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
              }}
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Preferences</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
