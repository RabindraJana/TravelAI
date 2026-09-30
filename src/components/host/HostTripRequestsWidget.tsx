import React, { useState } from 'react';
import { HostTripRequest, HostServiceType } from '../../types';

interface HostTripRequestsWidgetProps {
  requests: HostTripRequest[];
  onUpdateRequestStatus: (
    requestId: string,
    status: 'accepted' | 'declined' | 'completed',
    note?: string
  ) => void;
  onAddNewRequest: (req: Partial<HostTripRequest>) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const SERVICE_META: Record<HostServiceType, { label: string; icon: string; color: string }> = {
  homestay: { label: 'Homestay Guest Room', icon: 'bed', color: 'bg-[#00685f]/10 text-[#00685f]' },
  guided_walk: { label: 'Heritage Guided Walk', icon: 'hiking', color: 'bg-[#fd761a]/10 text-[#9d4300]' },
  bengal_meals: { label: 'Authentic Bengal Meals', icon: 'restaurant', color: 'bg-[#0284c7]/10 text-[#0284c7]' },
  station_transfer: { label: 'KGP Station Guide', icon: 'train', color: 'bg-[#8b5cf6]/10 text-[#8b5cf6]' },
};

export const HostTripRequestsWidget: React.FC<HostTripRequestsWidgetProps> = ({
  requests,
  onUpdateRequestStatus,
  onAddNewRequest,
  onShowToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<HostTripRequest | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'decline' | 'message' | 'transit_guide' | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Counters
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    if (activeFilter !== 'all' && req.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.travelerName.toLowerCase().includes(q);
      const matchCity = req.travelerCity.toLowerCase().includes(q);
      const matchPurpose = req.purpose.toLowerCase().includes(q);
      return matchName || matchCity || matchPurpose;
    }
    return true;
  });

  const handleOpenActionModal = (
    req: HostTripRequest,
    type: 'accept' | 'decline' | 'message' | 'transit_guide'
  ) => {
    setSelectedRequestForAction(req);
    setActionType(type);
    if (type === 'accept') {
      setActionNote(`Namaskar ${req.travelerName.split(' ')[0]}! Delighted to host you in Medinipur/Kharagpur. Your room is prepared and Bengal morning chai is on us.`);
    } else if (type === 'decline') {
      setActionNote('Regretfully, I have a prior travel commitment on these dates. Wishing you safe travels through Eastern India!');
    } else if (type === 'transit_guide') {
      setActionNote(
        `Hi ${req.travelerName.split(' ')[0]}! For Kharagpur Junction (the legendary 1,072m platform): exit from Platform 1 side towards Medinipur bus stand. Call me once your train crosses Midnapore bridge and I will receive you!`
      );
    } else {
      setActionNote('');
    }
  };

  const handleConfirmAction = () => {
    if (!selectedRequestForAction || !actionType) return;

    if (actionType === 'accept') {
      onUpdateRequestStatus(selectedRequestForAction.id, 'accepted', actionNote);
      onShowToast(
        'Trip Request Accepted! 🎉',
        `Confirmed booking for ${selectedRequestForAction.travelerName}. Total payout of ₹${selectedRequestForAction.totalAmount.toLocaleString('en-IN')} secured in escrow.`,
        'success'
      );
    } else if (actionType === 'decline') {
      onUpdateRequestStatus(selectedRequestForAction.id, 'declined', actionNote);
      onShowToast(
        'Request Safely Declined',
        `Traveler ${selectedRequestForAction.travelerName} has been informed respectfully. Escrow amount refunded.`,
        'info'
      );
    } else if (actionType === 'message' || actionType === 'transit_guide') {
      onShowToast(
        'Message Dispatched to Traveler ✉️',
        `Host guidance sent to ${selectedRequestForAction.travelerEmail}: "${actionNote.slice(0, 75)}..."`,
        'success'
      );
    }

    setSelectedRequestForAction(null);
    setActionType(null);
    setActionNote('');
  };

  const handleSimulateNewRequest = (presetType: 'solo' | 'culture' | 'transit') => {
    if (presetType === 'solo') {
      onAddNewRequest({
        travelerName: 'Sarah Lindberg',
        travelerCity: 'Munich, Germany',
        travelerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        travelerEmail: 'sarah.lindberg.travel@gmail.com',
        checkInDate: '2026-11-18',
        checkOutDate: '2026-11-20',
        durationNights: 2,
        guestsCount: 1,
        purpose: 'Solo backpacking along Eastern Railway and local handicraft study',
        servicesRequested: ['homestay', 'bengal_meals'],
        nightlyRate: 1500,
        totalAmount: 3000,
        requestNote:
          'Hello Rabindra! I read your community stories about authentic Bengal village life. I would love to stay 2 nights and explore the local markets.',
        isVerified: true,
        verifiedBadgeTitle: 'Passport & Identity Verified',
      });
      onShowToast('New Incoming Trip Request! 🔔', 'Received stay inquiry from Sarah Lindberg (Munich, Germany).', 'info');
    } else if (presetType === 'culture') {
      onAddNewRequest({
        travelerName: 'Devendra Patil',
        travelerCity: 'Pune, Maharashtra',
        travelerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        travelerEmail: 'devendra.heritage@gmail.com',
        checkInDate: '2026-12-02',
        checkOutDate: '2026-12-05',
        durationNights: 3,
        guestsCount: 2,
        purpose: 'Terracotta temples documentation and Bengal rural artisan trail',
        servicesRequested: ['homestay', 'guided_walk', 'bengal_meals'],
        nightlyRate: 1800,
        totalAmount: 5400,
        requestNote:
          'Namaskar Rabindra Ji! We are two photographers visiting for the annual terracotta fair. Would be privileged to join your guided walk along the Kansabati trail.',
        isVerified: true,
        verifiedBadgeTitle: 'Govt ID Verified Explorer',
      });
      onShowToast('New Incoming Trip Request! 🔔', 'Received heritage stay inquiry from Devendra Patil (Pune).', 'info');
    } else {
      onAddNewRequest({
        travelerName: 'Rohit & Swati Sen',
        travelerCity: 'Kolkata, West Bengal',
        travelerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        travelerEmail: 'rohit.sen.wb@gmail.com',
        checkInDate: '2026-11-26',
        checkOutDate: '2026-11-27',
        durationNights: 1,
        guestsCount: 2,
        purpose: 'Late night train connection via Kharagpur Jn and morning MEMU to Jhargram',
        servicesRequested: ['homestay', 'station_transfer'],
        nightlyRate: 1400,
        totalAmount: 1800,
        requestNote:
          'Dada, our train arrives at 11:45 PM. Need safe homestay overnight before boarding the morning train. Appreciate your station guidance!',
        isVerified: true,
        verifiedBadgeTitle: 'Aadhaar Verified Explorer',
      });
      onShowToast('New Incoming Trip Request! 🔔', 'Received station transit inquiry from Rohit & Swati Sen (Kolkata).', 'info');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eaedff] shadow-xs p-5 sm:p-6 space-y-6">
      {/* Widget Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">inbox</span>
            </span>
            <h2 className="text-lg font-bold text-[#131b2e]">Incoming Trip &amp; Stay Requests</h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#fd761a] text-white text-[11px] font-bold animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-[#717b79] mt-1">
            Review guest bookings for your Medinipur homestay, guided heritage walks, and Kharagpur Junction transit assistance.
          </p>
        </div>

        {/* Quick Simulation Generator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#00685f] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-[#eaedff]">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Test New Request</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-[#eaedff] py-1 z-30 hidden group-hover:block hover:block">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#717b79] tracking-wider border-b border-[#eaedff]">
                Simulate Guest Booking
              </div>
              <button
                onClick={() => handleSimulateNewRequest('solo')}
                className="w-full text-left px-3 py-2 text-xs text-[#131b2e] hover:bg-[#f2f3ff] flex items-center gap-2 cursor-pointer"
              >
                <span>🎒</span>
                <div>
                  <div className="font-semibold">Sarah (Munich)</div>
                  <div className="text-[10px] text-[#717b79]">Solo traveler • 2 nights</div>
                </div>
              </button>
              <button
                onClick={() => handleSimulateNewRequest('culture')}
                className="w-full text-left px-3 py-2 text-xs text-[#131b2e] hover:bg-[#f2f3ff] flex items-center gap-2 cursor-pointer"
              >
                <span>🏛️</span>
                <div>
                  <div className="font-semibold">Devendra (Pune)</div>
                  <div className="text-[10px] text-[#717b79]">Terracotta walk • 3 nights</div>
                </div>
              </button>
              <button
                onClick={() => handleSimulateNewRequest('transit')}
                className="w-full text-left px-3 py-2 text-xs text-[#131b2e] hover:bg-[#f2f3ff] flex items-center gap-2 cursor-pointer"
              >
                <span>🚆</span>
                <div>
                  <div className="font-semibold">Rohit Sen (Kolkata)</div>
                  <div className="text-[10px] text-[#717b79]">KGP midnight transit • 1 night</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
              activeFilter === 'pending'
                ? 'bg-[#fd761a] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            <span>Action Required</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeFilter === 'pending' ? 'bg-white text-[#fd761a]' : 'bg-[#fd761a] text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 ${
              activeFilter === 'accepted'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            Confirmed Upcoming ({acceptedCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 ${
              activeFilter === 'completed'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            Completed Stays ({completedCount})
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[16px] text-[#717b79]">
            search
          </span>
          <input
            type="text"
            placeholder="Search traveler, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] placeholder-[#717b79] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 transition-all border border-transparent focus:border-[#eaedff]"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#faf8ff] border border-dashed border-[#eaedff]">
            <span className="material-symbols-outlined text-[36px] text-[#717b79] mb-2 block">
              filter_none
            </span>
            <p className="text-sm font-semibold text-[#131b2e]">No trip requests match this filter</p>
            <p className="text-xs text-[#717b79] mt-1 max-w-sm mx-auto">
              {activeFilter === 'pending'
                ? 'All incoming inquiries are up to date! Great job on quick host responses.'
                : 'Try adjusting your search query or reset filter to view all stays.'}
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-[#00685f] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isAccepted = req.status === 'accepted';
            const isCompleted = req.status === 'completed';

            return (
              <div
                key={req.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'border-[#fd761a]/40 bg-[#fffaf5] shadow-xs'
                    : isAccepted
                    ? 'border-[#00685f]/30 bg-white'
                    : 'border-[#eaedff] bg-white opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Guest snapshot and stay info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={req.travelerAvatar}
                        alt={req.travelerName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-[15px] text-[#131b2e]">{req.travelerName}</h3>
                          {req.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00685f]/10 text-[#00685f]" title={req.verifiedBadgeTitle}>
                              <span className="material-symbols-outlined text-[12px]">verified</span>
                              <span>{req.verifiedBadgeTitle || 'ID Verified'}</span>
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isPending
                                ? 'bg-[#fd761a] text-white'
                                : isAccepted
                                ? 'bg-[#00685f] text-white'
                                : 'bg-[#e2fced] text-[#006947]'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#717b79] mt-0.5">
                          From {req.travelerCity} • <span className="font-mono text-[11px]">{req.travelerEmail}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stay Dates, Duration & Guest count pill row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f2f3ff] text-[#131b2e] font-medium">
                        <span className="material-symbols-outlined text-[15px] text-[#00685f]">calendar_month</span>
                        <span>{req.checkInDate} → {req.checkOutDate}</span>
                        <span className="text-[#717b79]">({req.durationNights} {req.durationNights === 1 ? 'night' : 'nights'})</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f2f3ff] text-[#131b2e] font-medium">
                        <span className="material-symbols-outlined text-[15px] text-[#00685f]">group</span>
                        <span>{req.guestsCount} {req.guestsCount === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e2fced] text-[#006947] font-semibold">
                        <span className="material-symbols-outlined text-[15px]">verified_user</span>
                        <span>₹{req.totalAmount.toLocaleString('en-IN')} Escrow Protected</span>
                      </div>
                    </div>

                    {/* Purpose and requested services */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#131b2e] font-semibold">
                        Purpose: <span className="font-normal text-[#3d4947]">{req.purpose}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {req.servicesRequested.map((srv) => {
                          const meta = SERVICE_META[srv] || { label: srv, icon: 'check', color: 'bg-gray-100 text-gray-700' };
                          return (
                            <span
                              key={srv}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${meta.color}`}
                            >
                              <span className="material-symbols-outlined text-[13px]">{meta.icon}</span>
                              <span>{meta.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Guest Note & Host Response Note */}
                    <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[#00685f] font-semibold text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>Guest Note:</span>
                      </div>
                      <p className="text-[#3d4947] italic">"{req.requestNote}"</p>
                      {req.hostResponseNote && (
                        <div className="pt-2 border-t border-[#eaedff] mt-2">
                          <span className="font-semibold text-[#131b2e]">Your Host Note: </span>
                          <span className="text-[#717b79]">{req.hostResponseNote}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Financial & Host Action Buttons */}
                  <div className="flex flex-col justify-between items-start lg:items-end gap-3 shrink-0 lg:w-52 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#eaedff]">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-[#717b79] block">Host Payout</span>
                      <div className="text-xl font-bold text-[#131b2e]">
                        ₹{req.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-[#717b79]">
                        (₹{req.nightlyRate}/night + services)
                      </span>
                    </div>

                    {/* Action Buttons depending on status */}
                    <div className="w-full flex flex-col gap-1.5">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleOpenActionModal(req, 'accept')}
                            className="w-full px-3 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Accept Request</span>
                          </button>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => handleOpenActionModal(req, 'decline')}
                              className="px-2.5 py-1.5 rounded-xl bg-[#fff0f0] hover:bg-[#ffe2e2] text-[#d32f2f] text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">cancel</span>
                              <span>Decline</span>
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(req, 'message')}
                              className="px-2.5 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">mail</span>
                              <span>Message</span>
                            </button>
                          </div>
                        </>
                      )}

                      {isAccepted && (
                        <>
                          <button
                            onClick={() => handleOpenActionModal(req, 'transit_guide')}
                            className="w-full px-3 py-2 rounded-xl bg-[#00685f]/10 hover:bg-[#00685f]/20 text-[#00685f] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#00685f]/20"
                          >
                            <span className="material-symbols-outlined text-[16px]">directions_transit</span>
                            <span>Send Transit Guide</span>
                          </button>
                          <button
                            onClick={() => {
                              onUpdateRequestStatus(req.id, 'completed');
                              onShowToast('Stay Marked Completed! ⭐', `Stay for ${req.travelerName} completed. Payout released from escrow.`, 'success');
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3d4947] hover:text-[#131b2e] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">done_all</span>
                            <span>Mark Completed</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <div className="w-full p-2 rounded-xl bg-[#e2fced] text-[#006947] text-center text-xs font-bold flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">stars</span>
                          <span>Payout Released</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Dialog / Modal */}
      {selectedRequestForAction && actionType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    {actionType === 'accept'
                      ? 'verified'
                      : actionType === 'decline'
                      ? 'warning'
                      : 'contact_support'}
                  </span>
                </span>
                <h3 className="font-bold text-base text-[#131b2e]">
                  {actionType === 'accept'
                    ? 'Confirm & Accept Guest Stay'
                    : actionType === 'decline'
                    ? 'Decline Trip Request'
                    : actionType === 'transit_guide'
                    ? 'Send Railway & Transit Instructions'
                    : 'Message Traveler'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRequestForAction(null);
                  setActionType(null);
                }}
                className="p-1 rounded-lg hover:bg-[#f2f3ff] text-[#717b79] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#f2f3ff] text-xs flex items-center gap-3">
              <img
                src={selectedRequestForAction.travelerAvatar}
                alt={selectedRequestForAction.travelerName}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="font-bold text-[#131b2e]">{selectedRequestForAction.travelerName}</p>
                <p className="text-[#717b79]">
                  {selectedRequestForAction.checkInDate} to {selectedRequestForAction.checkOutDate} • ₹{selectedRequestForAction.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#131b2e] block">
                {actionType === 'accept'
                  ? 'Warm Welcome Note for Traveler (Included in booking confirmation):'
                  : actionType === 'decline'
                  ? 'Reason for Declining (Sent respectfully to traveler):'
                  : 'Message Content:'}
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 resize-none"
                placeholder="Type your message..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedRequestForAction(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-xs font-semibold text-[#3d4947] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 ${
                  actionType === 'decline' ? 'bg-[#d32f2f] hover:bg-[#b71c1c]' : 'bg-[#00685f] hover:bg-[#00534c]'
                }`}
              >
                <span>
                  {actionType === 'accept'
                    ? 'Confirm Booking & Lock Escrow'
                    : actionType === 'decline'
                    ? 'Confirm Decline'
                    : 'Send Message'}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
