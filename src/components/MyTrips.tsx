import React, { useState, useMemo, useEffect } from 'react';
import { ScreenType, TransitionType, TripItem, TripSummary } from '../types';
import { TripSummaryCard } from './TripSummaryCard';
import {
  generateAllTripSummaries,
  generateTripSummary,
  SummaryStyle,
  copyTripSummaryToClipboard,
} from '../utils/tripSummaryGenerator';
import { generateTripItineraryPdf } from '../utils/pdfGenerator';
import { TripWeatherForecast } from './TripWeatherForecast';
import {
  TripSearchFilterBar,
  TripFilterState,
} from './TripSearchFilterBar';
import { getStoredTrips } from '../utils/tripStorage';

interface MyTripsProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const INITIAL_TRIPS: TripItem[] = [
  {
    id: 'trip-1',
    title: 'Varanasi Spiritual & Ghats Solo Expedition',
    origin: 'New Delhi (DEL)',
    destination: 'Varanasi (BSB)',
    startDate: 'Oct 14, 2026',
    endDate: 'Oct 18, 2026',
    durationDays: 4,
    status: 'upcoming',
    transitMode: 'train',
    bookingRef: 'IRCTC-PNR 241984210',
    budgetTotal: 8500,
    budgetSpent: 3200,
    coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    tags: ['Solo', 'Spiritual', 'Heritage', 'Photography'],
    waypoints: ['Assi Ghat', 'Dashashwamedh Aarti', 'Kashi Vishwanath', 'Sarnath Stupa', 'Manikarnika Ghat'],
    checklistDone: 6,
    checklistTotal: 8,
  },
  {
    id: 'trip-2',
    title: 'Kolkata Colonial Architecture & Cultural Trail',
    origin: 'New Delhi (DEL)',
    destination: 'Kolkata (CCU)',
    startDate: 'Nov 04, 2026',
    endDate: 'Nov 08, 2026',
    durationDays: 4,
    status: 'upcoming',
    transitMode: 'flight',
    bookingRef: '6E-482 / AI-701',
    budgetTotal: 14000,
    budgetSpent: 5600,
    coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    tags: ['Culture', 'Culinary', 'Architecture', 'Art'],
    waypoints: ['Victoria Memorial', 'Howrah Bridge', 'College Street Boi Para', 'Prinsep Ghat sunset', 'Flurys Park St'],
    checklistDone: 4,
    checklistTotal: 7,
  },
  {
    id: 'trip-3',
    title: 'Leh Ladakh High Passes & Pangong Lake',
    origin: 'Mumbai (BOM)',
    destination: 'Leh Ladakh (IXL)',
    startDate: 'Jul 10, 2026',
    endDate: 'Jul 18, 2026',
    durationDays: 8,
    status: 'completed',
    transitMode: 'flight',
    bookingRef: 'G8-192 (Completed)',
    budgetTotal: 38000,
    budgetSpent: 36400,
    coverImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80',
    tags: ['High Altitude', 'Trek', 'Lakes', 'Monasteries'],
    waypoints: ['Shanti Stupa', 'Khardung La (5,359m)', 'Nubra Valley', 'Pangong Tso', 'Hemis Monastery'],
    checklistDone: 12,
    checklistTotal: 12,
  },
  {
    id: 'trip-4',
    title: 'Goa Coastal Backroads & Portuguese Quarters',
    origin: 'Bengaluru (BLR)',
    destination: 'North & South Goa (GOI)',
    startDate: 'Jan 15, 2026',
    endDate: 'Jan 20, 2026',
    durationDays: 5,
    status: 'completed',
    transitMode: 'train',
    bookingRef: 'Vande Bharat 20641',
    budgetTotal: 16500,
    budgetSpent: 15800,
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    tags: ['Beach', 'Cafes', 'Scooter Trail', 'Churches'],
    waypoints: ['Fontainhas Latin Quarter', 'Aguada Fort', 'Palolem Beach', 'Divar Island ferry', 'Anjuna Flea Market'],
    checklistDone: 9,
    checklistTotal: 9,
  },
  {
    id: 'trip-5',
    title: 'Jaipur Pink City & Amber Fortress Walk',
    origin: 'New Delhi (NDLS)',
    destination: 'Jaipur (JP)',
    startDate: 'Dec 02, 2026',
    endDate: 'Dec 05, 2026',
    durationDays: 3,
    status: 'draft',
    transitMode: 'road',
    bookingRef: 'Self-Drive Express Highway',
    budgetTotal: 9500,
    budgetSpent: 0,
    coverImage: 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?w=800&auto=format&fit=crop&q=80',
    tags: ['Road Trip', 'Royal Forts', 'Bazaars'],
    waypoints: ['Hawa Mahal dawn', 'Amber Fort elephant path', 'Nahargarh sunset', 'Johari Bazaar'],
    checklistDone: 1,
    checklistTotal: 6,
  },
];

export const MyTrips: React.FC<MyTripsProps> = ({ onNavigate, onPlanTripTo, onShowToast }) => {
  const [filters, setFilters] = useState<TripFilterState>({
    searchQuery: '',
    timeframe: 'all',
    destination: 'all',
    monthYear: 'all',
    startDate: '',
    endDate: '',
  });
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>('concise');
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [sharedTripId, setSharedTripId] = useState<string | null>(null);
  const [downloadingTripId, setDownloadingTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripItem[]>(() => getStoredTrips());
  const [summaries, setSummaries] = useState<Record<string, TripSummary>>(() =>
    generateAllTripSummaries(getStoredTrips(), 'concise')
  );

  useEffect(() => {
    const handleTripsUpdated = (e: any) => {
      const updated = e.detail?.trips || getStoredTrips();
      setTrips(updated);
      setSummaries(generateAllTripSummaries(updated, summaryStyle));
    };

    window.addEventListener('trips-updated', handleTripsUpdated);
    return () => window.removeEventListener('trips-updated', handleTripsUpdated);
  }, [summaryStyle]);

  const handleShareTrip = async (trip: TripItem) => {
    const summary = summaries[trip.id] || generateTripSummary(trip, summaryStyle);
    const success = await copyTripSummaryToClipboard(trip, summary);
    if (success) {
      setSharedTripId(trip.id);
      setTimeout(() => setSharedTripId(null), 2500);
      if (onShowToast) {
        onShowToast(
          'Trip Summary Copied',
          `Summary for "${trip.title}" copied to clipboard! Ready to share.`,
          'success'
        );
      }
    }
  };

  const handleDownloadPdf = async (trip: TripItem) => {
    setDownloadingTripId(trip.id);
    try {
      const summary = summaries[trip.id] || generateTripSummary(trip, summaryStyle);
      const success = await generateTripItineraryPdf(trip, summary);
      if (success && onShowToast) {
        onShowToast(
          'Offline PDF Downloaded',
          `Formatted PDF itinerary for "${trip.title}" downloaded for offline travel access!`,
          'success'
        );
      }
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloadingTripId(null);
    }
  };

  const destinationsList = useMemo(
    () => [
      { key: 'Varanasi', label: '📍 Varanasi (BSB)' },
      { key: 'Kolkata', label: '📍 Kolkata (CCU)' },
      { key: 'Leh Ladakh', label: '📍 Leh Ladakh (IXL)' },
      { key: 'Goa', label: '📍 Goa Coast (GOI)' },
      { key: 'Jaipur', label: '📍 Jaipur (JP)' },
    ],
    []
  );

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      timeframe: 'all',
      destination: 'all',
      monthYear: 'all',
      startDate: '',
      endDate: '',
    });
    if (onShowToast) {
      onShowToast('Filters Cleared', 'Displaying all past, future, and draft expeditions.', 'info');
    }
  };

  const handleAutoGenerateAll = () => {
    setIsAutoGenerating(true);
    setTimeout(() => {
      const updated = generateAllTripSummaries(trips, summaryStyle);
      setSummaries(updated);
      setIsAutoGenerating(false);
      if (onShowToast) {
        onShowToast(
          'Trip Summaries Generated',
          `Auto-generated concise summary cards with key dates & primary destinations for all ${trips.length} trips.`,
          'success'
        );
      }
    }, 400);
  };

  const handleRegenerateStyle = (tripId: string, style: SummaryStyle) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      const updatedSummary = generateTripSummary(trip, style);
      setSummaries((prev) => ({ ...prev, [tripId]: updatedSummary }));
    }
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // 1. Timeframe Filter: Past vs Future vs Draft vs All
      if (filters.timeframe === 'future' && trip.status !== 'upcoming') return false;
      if (filters.timeframe === 'past' && trip.status !== 'completed') return false;
      if (filters.timeframe === 'draft' && trip.status !== 'draft') return false;

      // 2. Destination Filter
      if (filters.destination !== 'all') {
        const destLower = filters.destination.toLowerCase();
        const matchesDest =
          trip.destination.toLowerCase().includes(destLower) ||
          trip.title.toLowerCase().includes(destLower);
        if (!matchesDest) return false;
      }

      // 3. Month & Year Filter
      if (filters.monthYear !== 'all') {
        const [targetMonth, targetYear] = filters.monthYear.split(' ');
        const matchesStart =
          trip.startDate.includes(targetMonth) &&
          (!targetYear || trip.startDate.includes(targetYear));
        const matchesEnd =
          trip.endDate.includes(targetMonth) &&
          (!targetYear || trip.endDate.includes(targetYear));
        if (!matchesStart && !matchesEnd) return false;
      }

      // 4. Custom Date Range
      if (filters.startDate) {
        const rangeStart = new Date(filters.startDate);
        const tripEnd = new Date(trip.endDate);
        if (!isNaN(rangeStart.getTime()) && !isNaN(tripEnd.getTime())) {
          if (tripEnd < rangeStart) return false;
        }
      }
      if (filters.endDate) {
        const rangeEnd = new Date(filters.endDate);
        rangeEnd.setHours(23, 59, 59, 999);
        const tripStart = new Date(trip.startDate);
        if (!isNaN(rangeEnd.getTime()) && !isNaN(tripStart.getTime())) {
          if (tripStart > rangeEnd) return false;
        }
      }

      // 5. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matches =
          trip.destination.toLowerCase().includes(q) ||
          trip.title.toLowerCase().includes(q) ||
          trip.origin.toLowerCase().includes(q) ||
          trip.startDate.toLowerCase().includes(q) ||
          trip.endDate.toLowerCase().includes(q) ||
          trip.bookingRef.toLowerCase().includes(q) ||
          trip.tags.some((t) => t.toLowerCase().includes(q)) ||
          trip.waypoints.some((w) => w.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [filters, trips]);

  const totalCompleted = trips.filter((t) => t.status === 'completed').length;
  const totalUpcoming = trips.filter((t) => t.status === 'upcoming').length;
  const totalDraft = trips.filter((t) => t.status === 'draft').length;

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-4 sm:px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eaedff]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00685f]/10 text-[#00685f]">
                <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
              </span>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#131b2e] tracking-tight">
                My Trips &amp; Expeditions
              </h1>
            </div>
            <p className="text-[13px] sm:text-[14px] text-[#3d4947] mt-1">
              Manage your corridors with auto-generated concise summary cards, key dates, and primary destination intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleAutoGenerateAll}
              disabled={isAutoGenerating}
              className={`px-3.5 py-2 rounded-xl text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isAutoGenerating
                  ? 'bg-[#ffdbca] text-[#9d4300] border-[#ffdbca]'
                  : 'bg-white hover:bg-[#faf8ff] text-[#9d4300] border-[#ffdbca] shadow-2xs'
              }`}
              title="Automatically generate concise summaries for all trips using mock data"
            >
              <span className="material-symbols-outlined text-[16px] animate-spin-once">
                auto_awesome
              </span>
              <span>{isAutoGenerating ? 'Generating...' : 'Auto-Generate Summaries'}</span>
            </button>

            <button
              onClick={() => onNavigate('planner', 'none')}
              className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Plan New Trip with AI</span>
            </button>
          </div>
        </div>

        {/* AI Summary Highlights Banner */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-[#00685f]/8 via-[#f2f3ff] to-[#ffdbca]/30 border border-[#00685f]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-[14px] font-bold text-[#131b2e]">
                  Auto-Generated Trip Summaries Active
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#00685f]/15 text-[#00685f] text-[10px] font-bold uppercase">
                  Mock Intelligence
                </span>
              </div>
              <p className="text-[12px] text-[#3d4947] mt-0.5">
                Every journey is distilled into a concise summary card highlighting primary destinations, key dates, transit corridors, and readiness metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-[#3d4947]">View Mode:</span>
            <div className="inline-flex p-0.5 bg-white rounded-xl border border-[#eaedff] shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'summary'
                    ? 'bg-[#00685f] text-white shadow-2xs'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">space_dashboard</span>
                <span>Summary Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'detailed'
                    ? 'bg-[#00685f] text-white shadow-2xs'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">view_agenda</span>
                <span>Detailed Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row (Interactive quick timeframe toggles) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <button
            type="button"
            onClick={() =>
              setFilters((f) => ({
                ...f,
                timeframe: f.timeframe === 'future' ? 'all' : 'future',
              }))
            }
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filters.timeframe === 'future'
                ? 'bg-[#00685f]/10 border-[#00685f] shadow-xs ring-2 ring-[#00685f]/20'
                : 'bg-white border-[#eaedff] hover:border-[#00685f]/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                Future Journeys
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                flight_takeoff
              </span>
            </div>
            <div className="text-[24px] sm:text-[26px] font-bold text-[#00685f] mt-1">
              {totalUpcoming}
            </div>
            <span className="text-[12px] text-[#006947] font-medium">Upcoming expeditions</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters((f) => ({
                ...f,
                timeframe: f.timeframe === 'past' ? 'all' : 'past',
              }))
            }
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filters.timeframe === 'past'
                ? 'bg-[#131b2e]/10 border-[#131b2e] shadow-xs ring-2 ring-[#131b2e]/20'
                : 'bg-white border-[#eaedff] hover:border-[#131b2e]/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                Past Journeys
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#131b2e]">
                history
              </span>
            </div>
            <div className="text-[24px] sm:text-[26px] font-bold text-[#131b2e] mt-1">
              {totalCompleted}
            </div>
            <span className="text-[12px] text-[#3d4947] font-medium">Completed &amp; archived</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters((f) => ({
                ...f,
                timeframe: f.timeframe === 'draft' ? 'all' : 'draft',
              }))
            }
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filters.timeframe === 'draft'
                ? 'bg-[#ffdbca]/50 border-[#9d4300] shadow-xs ring-2 ring-[#9d4300]/20'
                : 'bg-white border-[#eaedff] hover:border-[#9d4300]/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                Draft Plans
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#9d4300]">
                edit_note
              </span>
            </div>
            <div className="text-[24px] sm:text-[26px] font-bold text-[#9d4300] mt-1">
              {totalDraft}
            </div>
            <span className="text-[12px] text-[#9d4300] font-medium">In AI pipeline</span>
          </button>

          <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                Active Budget
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#3d4947]">
                account_balance_wallet
              </span>
            </div>
            <div className="text-[24px] sm:text-[26px] font-bold text-[#131b2e] mt-1">₹22,500</div>
            <span className="text-[12px] text-[#3d4947]">Allocated for 2026</span>
          </div>
        </div>

        {/* Search and Filter Bar: Past/Future, Destination, Date & Keywords */}
        <TripSearchFilterBar
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
          totalTripsCount={INITIAL_TRIPS.length}
          filteredCount={filteredTrips.length}
          destinationsList={destinationsList}
        />

        {/* Trips Rendering: Switch between Summary Cards & Detailed Grid */}
        {viewMode === 'summary' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredTrips.map((trip) => {
              const summary = summaries[trip.id] || generateTripSummary(trip, summaryStyle);
              return (
                <TripSummaryCard
                  key={trip.id}
                  trip={trip}
                  summary={summary}
                  onViewItinerary={(t) => setSelectedTrip(t)}
                  onPlanTrip={(orig, dest) => {
                    if (onPlanTripTo) onPlanTripTo(orig, dest);
                    onNavigate('planner', 'none');
                  }}
                  onShowToast={onShowToast}
                  onRegenerateStyle={handleRegenerateStyle}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredTrips.map((trip) => {
              const summary = summaries[trip.id] || generateTripSummary(trip, summaryStyle);
              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl border border-[#eaedff] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Cover Image & Status Badge */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#e2e7ff]">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          trip.status === 'upcoming'
                            ? 'bg-[#00685f]/90 text-white'
                            : trip.status === 'completed'
                            ? 'bg-[#131b2e]/90 text-white'
                            : 'bg-[#9d4300]/90 text-white'
                        }`}
                      >
                        {trip.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-white/90 text-[#131b2e] flex items-center gap-1 backdrop-blur-md">
                        {trip.transitMode === 'flight' && '✈️ Flight'}
                        {trip.transitMode === 'train' && '🚆 Train'}
                        {trip.transitMode === 'road' && '🚗 Road'}
                      </span>
                    </div>

                    {/* Quick Share Icon on Image */}
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareTrip(trip);
                        }}
                        className={`p-1.5 rounded-full border backdrop-blur-md transition-all cursor-pointer shadow-sm flex items-center justify-center ${
                          sharedTripId === trip.id
                            ? 'bg-[#00855b] text-white border-[#00855b]'
                            : 'bg-black/50 hover:bg-black/75 text-white border-white/20'
                        }`}
                        title="Share trip summary to clipboard"
                        aria-label="Share trip details"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {sharedTripId === trip.id ? 'check' : 'share'}
                        </span>
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[12px] font-medium opacity-90">
                        {trip.startDate} - {trip.endDate} ({trip.durationDays} Days)
                      </div>
                      <h3 className="text-[16px] font-bold leading-tight line-clamp-1">{trip.title}</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Primary Destination & Key Dates Banner */}
                    <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#00685f] block">
                          Primary Destination
                        </span>
                        <span className="text-[12px] font-bold text-[#131b2e]">
                          {summary.primaryDestination.split(',')[0]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#3d4947] block">
                          Duration
                        </span>
                        <span className="text-[12px] font-semibold text-[#00685f]">
                          {summary.durationText}
                        </span>
                      </div>
                    </div>

                    {/* Route Corridor */}
                    <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
                      <div className="flex items-center justify-between text-[12px]">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-[#3d4947]">Origin</span>
                          <span className="font-bold text-[#131b2e]">{trip.origin}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#00685f]">
                          <span className="w-8 border-t border-dashed border-[#00685f]"></span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase font-bold text-[#3d4947]">Destination</span>
                          <span className="font-bold text-[#131b2e]">{trip.destination}</span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Generated Summary Snippet */}
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11.5px] text-[#131b2e]">
                      <span className="text-[10px] font-bold text-[#9d4300] uppercase block mb-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                        <span>Concise Summary</span>
                      </span>
                      <p className="line-clamp-2 leading-relaxed text-[#3d4947]">
                        {summary.conciseSummary}
                      </p>
                    </div>

                    {/* Waypoint highlights */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947] block mb-1.5">
                        Waypoints ({trip.waypoints.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {trip.waypoints.slice(0, 3).map((wp) => (
                          <span key={wp} className="px-2 py-0.5 rounded-md bg-[#e2e7ff] text-[#131b2e] text-[11px] font-medium">
                            {wp}
                          </span>
                        ))}
                        {trip.waypoints.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[#3d4947] text-[11px] font-medium">
                            +{trip.waypoints.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 7-Day Destination Weather Forecast */}
                    <TripWeatherForecast
                      destination={trip.destination}
                      primaryDestinationName={trip.primaryDestination}
                      tripDates={trip.startDate}
                    />

                    {/* Budget & Booking info */}
                    <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between text-[12px]">
                      <div>
                        <span className="text-[#3d4947] block text-[11px]">Budget Plan</span>
                        <span className="font-bold text-[#131b2e]">₹{trip.budgetTotal.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#3d4947] block text-[11px]">Checklist</span>
                        <span className="font-semibold text-[#00685f]">
                          {trip.checklistDone}/{trip.checklistTotal} Packed
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleShareTrip(trip)}
                        className={`py-2 px-2.5 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          sharedTripId === trip.id
                            ? 'bg-[#00855b] text-white border-[#00855b]'
                            : 'bg-white hover:bg-[#f2f3ff] text-[#131b2e] border-[#eaedff]'
                        }`}
                        title="Share trip summary to clipboard"
                        aria-label="Share trip summary"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {sharedTripId === trip.id ? 'check' : 'share'}
                        </span>
                        <span className="hidden sm:inline">{sharedTripId === trip.id ? 'Copied!' : 'Share'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(trip)}
                        disabled={downloadingTripId === trip.id}
                        className="py-2 px-2.5 rounded-xl border border-[#eaedff] bg-white hover:bg-[#f2f3ff] text-[#00685f] text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                        title="Download formatted PDF version of itinerary for offline access"
                        aria-label="Download offline PDF itinerary"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {downloadingTripId === trip.id ? 'hourglass_top' : 'picture_as_pdf'}
                        </span>
                        <span>{downloadingTripId === trip.id ? 'Saving...' : 'PDF'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedTrip(trip)}
                        className="flex-1 py-2 px-2.5 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] font-semibold rounded-xl text-[12px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Itinerary</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onPlanTripTo) {
                            onPlanTripTo(trip.origin, trip.destination);
                          }
                          onNavigate('planner', 'none');
                        }}
                        className="py-2 px-3 bg-[#00685f] hover:bg-[#008378] text-white font-semibold rounded-xl text-[12px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Optimize with AI"
                      >
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        <span>AI Sync</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State if search yields no results */}
        {filteredTrips.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#eaedff] my-6 max-w-lg mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#f2f3ff] text-[#00685f] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[32px]">travel_explore</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#131b2e]">No trips match your criteria</h3>
            <p className="text-[13px] text-[#3d4947] mt-1.5 leading-relaxed">
              No expeditions found for{' '}
              {filters.destination !== 'all' ? (
                <strong className="text-[#131b2e]">destination &ldquo;{filters.destination}&rdquo;</strong>
              ) : (
                'the selected criteria'
              )}
              {filters.monthYear !== 'all' ? ` in ${filters.monthYear}` : ''}
              {filters.timeframe !== 'all' ? ` (${filters.timeframe} trips)` : ''}
              {filters.searchQuery ? ` matching &ldquo;${filters.searchQuery}&rdquo;` : ''}.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5 flex-wrap">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] rounded-xl text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset All Filters</span>
              </button>
              <button
                onClick={() => onNavigate('planner', 'none')}
                className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Plan Trip with AI</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#eaedff] p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#00685f]">
                  Expedition Details
                </span>
                <h3 className="text-[20px] font-bold text-[#131b2e]">{selectedTrip.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-1.5 rounded-full hover:bg-[#f2f3ff] text-[#3d4947] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="h-40 rounded-2xl overflow-hidden relative">
              <img src={selectedTrip.coverImage} alt={selectedTrip.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 text-white text-[12px] font-semibold rounded-lg backdrop-blur-md">
                Ref: {selectedTrip.bookingRef}
              </div>
            </div>

            {/* Auto-Generated Summary in Modal */}
            <div className="p-3.5 bg-gradient-to-r from-[#00685f]/10 to-[#ffdbca]/20 rounded-2xl border border-[#00685f]/20">
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#00685f] uppercase">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>Concise AI Summary</span>
              </div>
              <p className="text-[13px] text-[#131b2e] leading-relaxed">
                {(summaries[selectedTrip.id] || generateTripSummary(selectedTrip)).conciseSummary}
              </p>
            </div>

            {/* Corridor Card */}
            <div className="p-3 bg-[#f2f3ff] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#3d4947]">From</span>
                <div className="font-bold text-[14px] text-[#131b2e]">{selectedTrip.origin}</div>
              </div>
              <div className="text-center px-4">
                <span className="text-[11px] font-bold text-[#00685f]">
                  {selectedTrip.transitMode === 'flight' ? '✈️ Direct Flight' : selectedTrip.transitMode === 'train' ? '🚆 Express Train' : '🚗 Road Corridor'}
                </span>
                <div className="w-24 border-t border-dashed border-[#00685f] my-1"></div>
                <span className="text-[10px] text-[#3d4947]">{selectedTrip.durationDays} Days</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#3d4947]">To (Primary)</span>
                <div className="font-bold text-[14px] text-[#131b2e]">{selectedTrip.destination}</div>
              </div>
            </div>

            {/* 7-Day Destination Weather Forecast */}
            <TripWeatherForecast
              destination={selectedTrip.destination}
              primaryDestinationName={selectedTrip.primaryDestination}
              tripDates={selectedTrip.startDate}
            />

            {/* Waypoints List */}
            <div>
              <h4 className="font-bold text-[14px] text-[#131b2e] mb-2">Planned Waypoints</h4>
              <div className="space-y-1.5">
                {selectedTrip.waypoints.map((wp, idx) => (
                  <div key={wp} className="flex items-center gap-2 p-2 rounded-lg bg-[#faf8ff] border border-[#eaedff]">
                    <span className="w-5 h-5 rounded-full bg-[#00685f]/15 text-[#00685f] text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] text-[#131b2e] font-medium">{wp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Packing Checklist Preview */}
            <div className="p-3.5 rounded-xl border border-[#eaedff] bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[13px] text-[#131b2e]">Packing &amp; Gear Checklist</span>
                <span className="text-[11px] font-bold text-[#00685f]">
                  {selectedTrip.checklistDone} of {selectedTrip.checklistTotal} completed
                </span>
              </div>
              <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00685f] h-full rounded-full transition-all"
                  style={{ width: `${(selectedTrip.checklistDone / selectedTrip.checklistTotal) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-2.5 pt-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handleShareTrip(selectedTrip)}
                className={`py-2.5 px-3.5 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  sharedTripId === selectedTrip.id
                    ? 'bg-[#00855b] text-white border-[#00855b]'
                    : 'bg-white hover:bg-[#f2f3ff] text-[#131b2e] border-[#eaedff]'
                }`}
                title="Share trip summary to clipboard"
                aria-label="Share trip details"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {sharedTripId === selectedTrip.id ? 'check' : 'share'}
                </span>
                <span>{sharedTripId === selectedTrip.id ? 'Copied!' : 'Share'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedTrip)}
                disabled={downloadingTripId === selectedTrip.id}
                className="py-2.5 px-3.5 rounded-xl border border-[#eaedff] bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#00685f] text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                title="Download formatted PDF version of itinerary for offline access while traveling"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {downloadingTripId === selectedTrip.id ? 'hourglass_top' : 'picture_as_pdf'}
                </span>
                <span>{downloadingTripId === selectedTrip.id ? 'Generating...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTrip(null);
                  if (onPlanTripTo) onPlanTripTo(selectedTrip.origin, selectedTrip.destination);
                  onNavigate('planner', 'none');
                }}
                className="flex-1 py-2.5 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Open in AI Trip Planner</span>
              </button>
              <button
                onClick={() => setSelectedTrip(null)}
                className="py-2.5 px-4 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] rounded-xl text-[13px] font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

