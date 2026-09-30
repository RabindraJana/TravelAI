import React, { useState } from 'react';
import { AuthUser, ScreenType, UserRole, GuiderTour } from '../types';

export interface GuiderDashboardProps {
  currentUser?: AuthUser;
  onNavigate: (screen: ScreenType) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onQuickSwitchRole?: (targetRole: UserRole) => void;
}

const INITIAL_TOURS: GuiderTour[] = [
  {
    id: 'tour_kgp_rail_01',
    title: 'Kharagpur Railway Heritage & World Platform Walk',
    category: 'Railway & Industrial Heritage',
    duration: '2.5 Hours',
    meetingPoint: 'Kharagpur Jn. Platform 1 (Near Heritage Clock Tower)',
    pricePerPerson: 650,
    maxGroupSize: 8,
    bookedCount: 5,
    languages: ['Bengali', 'Hindi', 'English'],
    scheduleTime: 'Tomorrow • 07:30 AM IST',
    status: 'upcoming',
    highlights: [
      'Historical walk along the iconic Kharagpur railway platforms',
      'Behind-the-scenes visit to vintage steam locomotive archives',
      'Bengali station chai & railway canteen cutlets tasting',
      'Exclusive architectural stories of the Bengal Nagpur Railway (BNR)',
    ],
    registeredTravelers: [
      {
        id: 'trav_01',
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        phone: '+91 98112 43210',
        partySize: 2,
        specialRequest: 'Vegetarian snacks requested; enthusiastic about vintage train photos.',
      },
      {
        id: 'trav_02',
        name: 'Arjun Sen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        phone: '+91 98301 88721',
        partySize: 1,
        specialRequest: 'History student writing a thesis on South Eastern Railway history.',
      },
      {
        id: 'trav_03',
        name: 'Ananya Mukherjee',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '+91 97482 12900',
        partySize: 2,
        specialRequest: 'Needs moderate walking pace; traveling with family.',
      },
    ],
  },
  {
    id: 'tour_med_terracotta_02',
    title: 'Medinipur Ancient Terracotta & Kasai River Trail',
    category: 'Architecture & Folk Culture',
    duration: '3.5 Hours',
    meetingPoint: 'Gopegarh Eco Park Gate, Medinipur',
    pricePerPerson: 850,
    maxGroupSize: 10,
    bookedCount: 6,
    languages: ['Bengali', 'English'],
    scheduleTime: 'Oct 16, 2026 • 03:00 PM IST',
    status: 'upcoming',
    highlights: [
      '18th-century terracotta temples and rare brick carvings',
      'Walking along the sacred Kasai (Kangsabati) riverside',
      'Local artisan workshop meeting folk terracotta idol sculptors',
      'Traditional Medinipur chanachur and mishti tasting',
    ],
    registeredTravelers: [
      {
        id: 'trav_04',
        name: 'Rohan Mehra',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        phone: '+91 99031 55432',
        partySize: 4,
        specialRequest: 'Keen on capturing sunset river photographs.',
      },
      {
        id: 'trav_05',
        name: 'Sunita Das',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '+91 98310 99812',
        partySize: 2,
        specialRequest: 'Interested in buying authentic local handicrafts.',
      },
    ],
  },
  {
    id: 'tour_bishnu_silk_03',
    title: 'Bishnupur Silk Weaving & Terracotta Royal Circuit',
    category: 'Artisanal Heritage & Royal Bengal',
    duration: 'Full Day (6 Hours)',
    meetingPoint: 'Rasmancha Ticket Counter, Bishnupur',
    pricePerPerson: 1450,
    maxGroupSize: 6,
    bookedCount: 6,
    languages: ['Bengali', 'Hindi', 'English'],
    scheduleTime: 'Oct 20, 2026 • 08:30 AM IST',
    status: 'upcoming',
    highlights: [
      'Rasmancha, Jor Bangla, and Shyamrai terracotta marvels',
      'Live Baluchari silk sari master weaving loom demonstration',
      'Authentic Rarh Bengal lunch at heritage home',
      'Folk music performance by local Baul artists',
    ],
    registeredTravelers: [
      {
        id: 'trav_06',
        name: 'Kabir Varma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        phone: '+91 91672 33412',
        partySize: 2,
      },
      {
        id: 'trav_07',
        name: 'Tanvi Roy',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        phone: '+91 98200 44123',
        partySize: 4,
      },
    ],
  },
];

export const GuiderDashboard: React.FC<GuiderDashboardProps> = ({
  currentUser,
  onNavigate,
  onShowToast,
  onQuickSwitchRole,
}) => {
  const [tours, setTours] = useState<GuiderTour[]>(INITIAL_TOURS);
  const [selectedTour, setSelectedTour] = useState<GuiderTour | null>(tours[0]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState<'tours' | 'travelers' | 'earnings' | 'toolkit'>('tours');

  const guiderName = currentUser?.name || 'Subhashish Roy';
  const guiderAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';

  const totalEarnings = tours.reduce(
    (sum, t) => sum + t.pricePerPerson * t.bookedCount,
    14800
  );

  const totalBookedTravelers = tours.reduce((sum, t) => sum + t.bookedCount, 0);

  const handleStartTour = (tour: GuiderTour) => {
    setTours((prev) =>
      prev.map((t) => (t.id === tour.id ? { ...t, status: 'in_progress' } : t))
    );
    if (selectedTour?.id === tour.id) {
      setSelectedTour({ ...selectedTour, status: 'in_progress' });
    }
    onShowToast(
      'Live Tour Started 🚩',
      `You are now actively guiding "${tour.title}". Traveler group broadcast is live.`,
      'success'
    );
  };

  const handleCompleteTour = (tour: GuiderTour) => {
    setTours((prev) =>
      prev.map((t) => (t.id === tour.id ? { ...t, status: 'completed' } : t))
    );
    if (selectedTour?.id === tour.id) {
      setSelectedTour({ ...selectedTour, status: 'completed' });
    }
    onShowToast(
      'Tour Completed 🎉',
      `Tour marked complete. Escrow payout of ₹${(tour.pricePerPerson * tour.bookedCount).toLocaleString('en-IN')} released to your UPI account.`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Breadcrumb & Persona Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#eaedff] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <span className="material-symbols-outlined text-[18px]">explore</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#131b2e]">Certified Guider Command Console</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-[10px] font-bold uppercase tracking-wider">
                Guider Mode Active
              </span>
            </div>
            <p className="text-[11px] text-[#717b79]">
              Managing heritage walks, traveler groups, and Bengal railway expeditions
            </p>
          </div>
        </div>

        {/* Action Switchers */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#00685f] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-[#eaedff]"
            title="Preview regular traveler view"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Traveler Preview View</span>
          </button>
        </div>
      </div>

      {/* Hero Guider Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#075985] text-white p-6 sm:p-8 shadow-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]">flag</span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={guiderAvatar}
                alt={guiderName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
              />
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#fd761a] text-white flex items-center justify-center shadow-xs"
                title="Govt Certified Heritage Guider"
              >
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {guiderName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold text-white border border-white/20">
                  <span className="material-symbols-outlined text-[13px] text-emerald-300">verified</span>
                  <span>Govt Certified Heritage Guider</span>
                </span>
              </div>

              <p className="text-xs text-white/80 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#ffdbca]">location_on</span>
                <span>Kharagpur / Medinipur, West Bengal</span>
                <span>•</span>
                <span>Languages: Bengali, Hindi, English</span>
              </p>

              <p className="text-xs text-white/70 max-w-2xl line-clamp-2 leading-relaxed">
                "Specialized in South Eastern Railway history, Medinipur 18th-century terracotta temples, and local artisan river trails."
              </p>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col justify-between items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15">
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-white">
                {isAvailable ? 'Accepting Tour Bookings' : 'Schedule Paused'}
              </span>
              <button
                onClick={() => {
                  setIsAvailable(!isAvailable);
                  onShowToast(
                    !isAvailable ? 'Bookings Open 🟢' : 'Bookings Paused ⏸️',
                    !isAvailable ? 'Travelers can now book your guided walks.' : 'Tour bookings paused.',
                    'info'
                  );
                }}
                className="text-[11px] underline text-white/80 hover:text-white cursor-pointer ml-1"
              >
                Toggle
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-white/10">
                <div className="font-bold text-white">42</div>
                <div className="text-[10px] text-white/70">Walks Led</div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/10">
                <div className="font-bold text-white">128</div>
                <div className="text-[10px] text-white/70">Travelers</div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/10">
                <div className="font-bold text-[#ffdbca]">4.9 ★</div>
                <div className="text-[10px] text-white/70">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#eaedff]">
        <button
          onClick={() => setActiveTab('tours')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'tours'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">hiking</span>
          <span>Upcoming Guided Walks ({tours.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('travelers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'travelers'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">group</span>
          <span>Traveler Group Roster ({totalBookedTravelers})</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'earnings'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">payments</span>
          <span>Guider Earnings &amp; Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab('toolkit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'toolkit'
              ? 'bg-[#0284c7] text-white shadow-xs'
              : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">fact_check</span>
          <span>Guider Checklist &amp; Safety</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'tours' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tours List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-sm font-bold text-[#131b2e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#0284c7]">event</span>
              <span>Your Scheduled Expeditions</span>
            </h2>

            <div className="space-y-3">
              {tours.map((tour) => {
                const isSelected = selectedTour?.id === tour.id;
                return (
                  <div
                    key={tour.id}
                    onClick={() => setSelectedTour(tour)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#0284c7] ring-2 ring-[#0284c7]/20 shadow-sm'
                        : 'bg-white border-[#eaedff] hover:border-[#0284c7]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eaedff]">
                      <div>
                        <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider block">
                          {tour.category}
                        </span>
                        <h3 className="font-bold text-sm text-[#131b2e]">{tour.title}</h3>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                          tour.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : tour.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#f2f3ff] text-[#0284c7]'
                        }`}
                      >
                        {tour.status === 'in_progress'
                          ? 'Live In Progress'
                          : tour.status === 'completed'
                          ? 'Completed'
                          : tour.scheduleTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs text-[#717b79]">
                      <div>
                        <span className="text-[10px] block">Duration</span>
                        <span className="font-semibold text-[#131b2e]">{tour.duration}</span>
                      </div>
                      <div>
                        <span className="text-[10px] block">Travelers</span>
                        <span className="font-semibold text-[#131b2e]">
                          {tour.bookedCount} / {tour.maxGroupSize} booked
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] block">Fee / Person</span>
                        <span className="font-semibold text-[#131b2e]">₹{tour.pricePerPerson}</span>
                      </div>
                      <div>
                        <span className="text-[10px] block">Est. Revenue</span>
                        <span className="font-bold text-emerald-700">
                          ₹{tour.pricePerPerson * tour.bookedCount}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#eaedff] text-xs">
                      <span className="text-[11px] text-[#717b79] truncate max-w-xs">
                        📍 {tour.meetingPoint}
                      </span>
                      <span className="text-[#0284c7] font-bold text-[11px] hover:underline">
                        View Travelers ({tour.registeredTravelers.length}) &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tour Details & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedTour ? (
              <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
                  <h3 className="font-bold text-sm text-[#131b2e]">Tour Control &amp; Actions</h3>
                  <span className="text-xs font-mono bg-[#f2f3ff] text-[#0284c7] px-2 py-0.5 rounded-lg">
                    {selectedTour.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[#131b2e]">{selectedTour.title}</h4>
                  <p className="text-xs text-[#717b79] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#0284c7]">pin_drop</span>
                    <span>{selectedTour.meetingPoint}</span>
                  </p>
                </div>

                {/* Tour Highlights */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#131b2e] block">Itinerary Highlights</span>
                  <ul className="space-y-1.5 text-xs text-[#3d4947]">
                    {selectedTour.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600 mt-0.5 shrink-0">
                          check_circle
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Live Action Buttons */}
                <div className="pt-2 border-t border-[#eaedff] space-y-2">
                  {selectedTour.status === 'upcoming' && (
                    <button
                      onClick={() => handleStartTour(selectedTour)}
                      className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Start Live Tour &amp; Broadcast Check-in</span>
                    </button>
                  )}

                  {selectedTour.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteTour(selectedTour)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                      <span>Complete Tour &amp; Claim Escrow Payout</span>
                    </button>
                  )}

                  {selectedTour.status === 'completed' && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200">
                      ✓ Tour successfully concluded. Payout processed to your account.
                    </div>
                  )}

                  <button
                    onClick={() =>
                      onShowToast(
                        'Traveler Group SMS Sent 📱',
                        `Notification broadcast sent to all ${selectedTour.bookedCount} registered travelers with meeting point directions.`,
                        'info'
                      )
                    }
                    className="w-full py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#0284c7] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#eaedff]"
                  >
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                    <span>Broadcast Meeting Directions to Group</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#717b79] bg-white rounded-2xl border border-[#eaedff]">
                Select a tour from the left to view registered travelers and control live guiding.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Travelers Roster */}
      {activeTab === 'travelers' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">Registered Travelers Roster</h2>
              <p className="text-xs text-[#717b79]">Confirmed participants for upcoming walking trails</p>
            </div>
            <span className="text-xs font-bold bg-[#0284c7]/10 text-[#0284c7] px-3 py-1 rounded-full">
              {totalBookedTravelers} Total Travelers
            </span>
          </div>

          <div className="space-y-4">
            {tours.map((t) => (
              <div key={t.id} className="space-y-2">
                <div className="flex items-center justify-between bg-[#faf8ff] p-2.5 rounded-xl border border-[#eaedff]">
                  <span className="font-bold text-xs text-[#131b2e]">{t.title}</span>
                  <span className="text-xs text-[#717b79]">{t.scheduleTime}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {t.registeredTravelers.map((traveler) => (
                    <div
                      key={traveler.id}
                      className="p-3.5 rounded-xl border border-[#eaedff] bg-white space-y-2 hover:border-[#0284c7]/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={traveler.avatar}
                          alt={traveler.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-[#eaedff]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-[#131b2e] truncate">{traveler.name}</h4>
                          <span className="text-[11px] text-[#717b79] block font-mono">
                            {traveler.phone}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[#0284c7] text-[10px] font-bold">
                          {traveler.partySize} {traveler.partySize > 1 ? 'Guests' : 'Guest'}
                        </span>
                      </div>

                      {traveler.specialRequest && (
                        <p className="text-[11px] text-[#717b79] bg-[#faf8ff] p-2 rounded-lg italic">
                          "{traveler.specialRequest}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Guider Earnings */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">Guider Earnings &amp; Tour Payouts</h2>
              <p className="text-xs text-[#717b79]">Tracking payments received for Bengal walking tours</p>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold">
              Verified UPI: subhashish.guider@okaxis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-1">
              <span className="text-xs text-[#717b79]">Total Guider Revenue</span>
              <div className="text-2xl font-bold text-[#131b2e]">₹{totalEarnings.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">100% verified payouts</span>
            </div>
            <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-1">
              <span className="text-xs text-[#717b79]">Upcoming Tour Escrow</span>
              <div className="text-2xl font-bold text-[#0284c7]">₹8,450</div>
              <span className="text-[11px] text-[#717b79]">Releases immediately upon walk conclusion</span>
            </div>
            <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-1">
              <span className="text-xs text-[#717b79]">Average Hourly Earning</span>
              <div className="text-2xl font-bold text-[#131b2e]">₹950 / hr</div>
              <span className="text-[11px] text-[#717b79]">4.9 ★ traveler review bonus</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Checklist & Safety */}
      {activeTab === 'toolkit' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#131b2e]">Pre-Expedition Safety &amp; Heritage Toolkit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#0284c7]">badge</span>
              <div>
                <strong className="font-bold text-[#131b2e] block">Physical Guider Identity Badge</strong>
                <span className="text-[#717b79]">Carry your Govt Certified Heritage Guider badge for station and temple entry.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#0284c7]">medication</span>
              <div>
                <strong className="font-bold text-[#131b2e] block">First Aid &amp; Electrolyte Kit</strong>
                <span className="text-[#717b79]">Basic band-aids, ORS hydration sachets for walking tour participants.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#0284c7]">mic</span>
              <div>
                <strong className="font-bold text-[#131b2e] block">Portable Voice Amplifier / Mic</strong>
                <span className="text-[#717b79]">Ensures every traveler clearly hears the railway history stories on busy platforms.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#0284c7]">translate</span>
              <div>
                <strong className="font-bold text-[#131b2e] block">Multilingual Story Cards</strong>
                <span className="text-[#717b79]">Bengali, Hindi, and English historical context cards for terracotta motifs.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
