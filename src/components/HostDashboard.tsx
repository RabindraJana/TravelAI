import React, { useState, useEffect } from 'react';
import { AuthUser, ScreenType, UserRole, FullUserProfile } from '../types';
import { HostTripRequestsWidget } from './host/HostTripRequestsWidget';
import { HostHouseRulesWidget } from './host/HostHouseRulesWidget';
import { HostEarningsWidget } from './host/HostEarningsWidget';
import { EditHostModal } from './EditHostModal';
import {
  getHostTripRequests,
  updateTripRequestStatus,
  addNewTripRequest,
} from '../utils/hostStorage';
import { getStoredUserProfile, saveStoredUserProfile } from '../utils/profileStorage';

export interface HostDashboardProps {
  currentUser?: AuthUser;
  onNavigate: (screen: ScreenType) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenAuthModal?: (initialTab?: 'user' | 'admin') => void;
  onQuickSwitchRole?: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  currentUser,
  onNavigate,
  onShowToast,
  onOpenAuthModal,
  onQuickSwitchRole,
}) => {
  // CRITICAL CHECK: Component strictly renders only when currentUser.role === 'admin'
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-[#eaedff] shadow-sm p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[40px]">admin_panel_settings</span>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Host Access Restricted</span>
            </div>
            <h2 className="text-2xl font-bold text-[#131b2e]">Host Dashboard (Admin Only)</h2>
            <p className="text-sm text-[#717b79] leading-relaxed">
              This management console is reserved for verified host administrators (Rabindra Nath Jana). You are currently browsing in traveler explorer mode.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onQuickSwitchRole?.()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Switch to Host Admin (Rabindra Jana)</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3d4947] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Return to Traveler Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active view section tab
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'rules' | 'earnings'>('all');
  const [requests, setRequests] = useState(() => getHostTripRequests());
  const [profile, setProfile] = useState<FullUserProfile>(() => getStoredUserProfile());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAcceptingInquiries, setIsAcceptingInquiries] = useState(true);

  // Sync requests on external events
  useEffect(() => {
    const handleRequestsChange = () => {
      setRequests(getHostTripRequests());
    };
    window.addEventListener('host-requests-changed', handleRequestsChange);
    return () => window.removeEventListener('host-requests-changed', handleRequestsChange);
  }, []);

  const handleUpdateRequestStatus = (
    requestId: string,
    status: 'accepted' | 'declined' | 'completed',
    note?: string
  ) => {
    const updated = updateTripRequestStatus(requestId, status, note);
    setRequests(updated);
  };

  const handleAddNewRequest = (req: Parameters<typeof addNewTripRequest>[0]) => {
    addNewTripRequest(req);
    setRequests(getHostTripRequests());
  };

  const handleSaveProfile = (updatedProfile: FullUserProfile) => {
    saveStoredUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditModalOpen(false);
    onShowToast('Host Profile Updated ✨', 'Your living state and hosting offer details are saved.', 'success');
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Breadcrumb & Persona Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#eaedff] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#00685f] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <span className="material-symbols-outlined text-[18px]">villa</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#131b2e]">Host Command Dashboard</span>
              <span className="px-2 py-0.5 rounded-full bg-[#00685f]/10 text-[#00685f] text-[10px] font-bold uppercase tracking-wider">
                Admin Mode Active
              </span>
            </div>
            <p className="text-[11px] text-[#717b79]">
              Managing homestay &amp; experiences in Medinipur / Kharagpur, West Bengal
            </p>
          </div>
        </div>

        {/* Action Switchers */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#00685f] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-[#eaedff]"
            title="Preview how travelers experience the app"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Traveler Preview View</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] text-[#3d4947] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Edit Hosting Info</span>
          </button>
        </div>
      </div>

      {/* Hero Host Profile & Living State Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00685f] via-[#00534c] to-[#003833] text-white p-6 sm:p-8 shadow-md">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]">home_work</span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Host Identity & Living Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar || profile.avatar}
                alt={currentUser.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
              />
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#fd761a] text-white flex items-center justify-center shadow-xs"
                title="Verified Superhost"
              >
                <span className="material-symbols-outlined text-[14px]">stars</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold text-white border border-white/20">
                  <span className="material-symbols-outlined text-[13px] text-[#e2fced]">verified</span>
                  <span>Govt ID Verified Host &amp; Admin</span>
                </span>
              </div>

              <p className="text-xs text-white/80 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#ffdbca]">location_on</span>
                <span>{profile.hosting.livingCity || 'Medinipur / Kharagpur, West Bengal'}</span>
                <span>•</span>
                <span>Home: {profile.hosting.homeType || 'Private Guest Room & Study'}</span>
              </p>

              <p className="text-xs text-white/70 max-w-2xl line-clamp-2 leading-relaxed">
                "{profile.hosting.bioIntro || profile.bio}"
              </p>
            </div>
          </div>

          {/* Quick Metrics & Availability Toggle */}
          <div className="flex flex-row lg:flex-col justify-between items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
            {/* Availability Pill */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15">
              <span className={`w-2.5 h-2.5 rounded-full ${isAcceptingInquiries ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-white">
                {isAcceptingInquiries ? 'Accepting Inquiries' : 'Calendar Paused'}
              </span>
              <button
                onClick={() => {
                  setIsAcceptingInquiries(!isAcceptingInquiries);
                  onShowToast(
                    !isAcceptingInquiries ? 'Inquiries Open 🟢' : 'Inquiries Paused ⏸️',
                    !isAcceptingInquiries ? 'Travelers can now send new booking requests.' : 'New stay requests temporarily paused.',
                    'info'
                  );
                }}
                className="text-[11px] underline text-white/80 hover:text-white cursor-pointer ml-1"
              >
                Toggle
              </button>
            </div>

            {/* Quick Stats Pill Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-white/10">
                <div className="font-bold text-white">14</div>
                <div className="text-[10px] text-white/70">Stays</div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/10">
                <div className="font-bold text-white">98%</div>
                <div className="text-[10px] text-white/70">Acceptance</div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/10">
                <div className="font-bold text-[#ffdbca]">5.0 ★</div>
                <div className="text-[10px] text-white/70">5 Vouches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#eaedff]">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'all'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Unified Host View</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'requests'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inbox</span>
          <span>Trip Requests</span>
          {pendingRequestsCount > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              activeTab === 'requests' ? 'bg-[#fd761a] text-white' : 'bg-[#fd761a] text-white'
            }`}>
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'rules'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">gavel</span>
          <span>House Rules</span>
          <span className="text-[10px] text-[#717b79] px-1.5 py-0.2 rounded bg-[#f2f3ff]">
            {profile.hosting.houseRules?.length || 4}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'earnings'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">payments</span>
          <span>Earnings &amp; Payouts</span>
        </button>
      </div>

      {/* Render Widgets based on Active Tab */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'requests') && (
          <section id="section-trip-requests">
            <HostTripRequestsWidget
              requests={requests}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onAddNewRequest={handleAddNewRequest}
              onShowToast={onShowToast}
            />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'rules') && (
          <section id="section-house-rules">
            <HostHouseRulesWidget onShowToast={onShowToast} />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'earnings') && (
          <section id="section-earnings">
            <HostEarningsWidget onShowToast={onShowToast} />
          </section>
        )}
      </div>

      {/* Edit Host Modal */}
      {isEditModalOpen && (
        <EditHostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
