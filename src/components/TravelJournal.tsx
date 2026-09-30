import React, { useState, useEffect, useMemo } from 'react';
import { ScreenType, TransitionType, JournalEntry, JournalPhase, JournalVisibility, TripItem } from '../types';
import {
  getStoredJournalEntries,
  addJournalEntry,
  toggleLikeJournalEntry,
  deleteJournalEntry,
  updateJournalEntry,
} from '../utils/journalStorage';
import { getStoredTrips } from '../utils/tripStorage';
import { suggestJournalTitle } from '../utils/geminiClient';
import { ShareJournalModal } from './ShareJournalModal';
import { AiTravelCardModal } from './AiTravelCardModal';

interface TravelJournalProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  initialEntryId?: string | null;
}

const PRESET_PHOTO_OPTIONS = [
  { label: 'Kharagpur / Bengal Riverbank', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80' },
  { label: 'Varanasi Ancient Ghats', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80' },
  { label: 'Himalayan Mountain Vista', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' },
  { label: 'Heritage Terracotta Temples', url: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80' },
  { label: 'Coastal Palm Promenade', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80' },
  { label: 'Railway Corridor & Express', url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80' },
];

export const QUICK_MOOD_OPTIONS = [
  { id: 'adventurous', label: '🚂 Adventurous & On The Move', badgeColor: 'text-amber-800 bg-amber-50 border-amber-200' },
  { id: 'wonder', label: '✨ Wonder & Awe', badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  { id: 'reflective', label: '☕ Calm & Reflective', badgeColor: 'text-blue-800 bg-blue-50 border-blue-200' },
  { id: 'foodie', label: '😋 Craving Local Eats & Sweets', badgeColor: 'text-orange-800 bg-orange-50 border-orange-200' },
  { id: 'free', label: '🔥 Nostalgic & Free', badgeColor: 'text-rose-800 bg-rose-50 border-rose-200' },
  { id: 'spontaneous', label: '🎒 Spontaneous Wanderer', badgeColor: 'text-purple-800 bg-purple-50 border-purple-200' },
  { id: 'peaceful', label: '🌿 Peaceful & Mindful', badgeColor: 'text-teal-800 bg-teal-50 border-teal-200' },
  { id: 'thrilled', label: '⚡ High Energy & Thrilled', badgeColor: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
];

export const QUICK_TIME_PRESETS = [
  '🌅 Sunrise Dawn',
  '🚂 Morning Express Rail',
  '☀️ Midday Walk',
  '🌇 Golden Hour Sunset',
  '🌙 Nightfall & Aarti',
];

function getFormattedLiveTime(): string {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${timeStr} • Today, ${dateStr}`;
}

export const TravelJournal: React.FC<TravelJournalProps> = ({
  onNavigate,
  onPlanTripTo,
  onShowToast,
  initialEntryId,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => getStoredJournalEntries());
  const [phaseFilter, setPhaseFilter] = useState<'all' | 'pinned' | JournalPhase>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | JournalVisibility>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [sharingEntry, setSharingEntry] = useState<JournalEntry | null>(null);
  const [showAiCardModal, setShowAiCardModal] = useState(false);

  // Deep-link auto opening of shared journal entry
  useEffect(() => {
    if (initialEntryId && entries.length > 0) {
      const matched = entries.find((e) => e.id === initialEntryId);
      if (matched) {
        setSelectedEntry(matched);
        onShowToast?.(
          'Public Story Opened',
          `Viewing "${matched.title}" from shared link.`,
          'info'
        );
      }
    }
  }, [initialEntryId, entries]);

  const handleUpdateEntryVisibility = (targetEntry: JournalEntry, newVisibility: JournalVisibility) => {
    const updatedEntry: JournalEntry = { ...targetEntry, visibility: newVisibility };
    const nextEntries = updateJournalEntry(updatedEntry);
    setEntries(nextEntries);
    if (selectedEntry?.id === targetEntry.id) {
      setSelectedEntry(updatedEntry);
    }
    if (sharingEntry?.id === targetEntry.id) {
      setSharingEntry(updatedEntry);
    }
  };

  // New Journal Entry Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formOrigin, setFormOrigin] = useState('Kharagpur (KGP)');
  const [formPhase, setFormPhase] = useState<JournalPhase>('past');
  const [formVisibility, setFormVisibility] = useState<JournalVisibility>('public');
  const [formStory, setFormStory] = useState('');
  const [formTransitInfo, setFormTransitInfo] = useState('');
  const [formSpots, setFormSpots] = useState('');
  const [formFood, setFormFood] = useState('');
  const [formBudget, setFormBudget] = useState('2,500');
  const [formCoverImage, setFormCoverImage] = useState(PRESET_PHOTO_OPTIONS[0].url);
  const [formTags, setFormTags] = useState('Express Rail, Heritage, Local Food');
  const [formMotto, setFormMotto] = useState('Life is just going on. Life is too short, so make this trip happen!');

  // Quick Entry Modal State
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [trips, setTrips] = useState<TripItem[]>(() => getStoredTrips());
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [customTripName, setCustomTripName] = useState('');
  const [pinnedLocation, setPinnedLocation] = useState('');
  const [pinnedTime, setPinnedTime] = useState(getFormattedLiveTime());
  const [pinnedMood, setPinnedMood] = useState(QUICK_MOOD_OPTIONS[0].label);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickStory, setQuickStory] = useState('');
  const [quickVisibility, setQuickVisibility] = useState<JournalVisibility>('public');
  const [quickCoverImage, setQuickCoverImage] = useState(PRESET_PHOTO_OPTIONS[0].url);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Gemini AI Title Suggestion State
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [suggestedAlternatives, setSuggestedAlternatives] = useState<string[]>([]);
  const [aiTitleModel, setAiTitleModel] = useState<string>('');
  const [hasAiSuggestedTitle, setHasAiSuggestedTitle] = useState(false);

  // Listen to storage sync events
  useEffect(() => {
    const handleJournalUpdated = (e: any) => {
      if (e.detail?.entries) {
        setEntries(e.detail.entries);
      } else {
        setEntries(getStoredJournalEntries());
      }
    };
    window.addEventListener('journal-updated', handleJournalUpdated);
    return () => window.removeEventListener('journal-updated', handleJournalUpdated);
  }, []);

  // Filtered and searched entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Phase / Pinned match
      if (phaseFilter === 'pinned') {
        if (!entry.isQuickEntry && !entry.pinnedLocation) return false;
      } else if (phaseFilter !== 'all' && entry.phase !== phaseFilter) {
        return false;
      }

      // Visibility match
      if (visibilityFilter !== 'all' && entry.visibility !== visibilityFilter) return false;
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = entry.title.toLowerCase().includes(q);
        const inDest = entry.destination.toLowerCase().includes(q);
        const inOrigin = (entry.origin || '').toLowerCase().includes(q);
        const inStory = entry.story.toLowerCase().includes(q);
        const inTags = entry.tags.some((t) => t.toLowerCase().includes(q));
        const inSpots = entry.mustVisitSpots.some((s) => s.toLowerCase().includes(q));
        const inFood = entry.localFoodRecommendations.some((f) => f.toLowerCase().includes(q));
        const inPinLoc = (entry.pinnedLocation || '').toLowerCase().includes(q);
        const inTrip = (entry.currentTripName || '').toLowerCase().includes(q);
        if (!inTitle && !inDest && !inOrigin && !inStory && !inTags && !inSpots && !inFood && !inPinLoc && !inTrip) {
          return false;
        }
      }
      return true;
    });
  }, [entries, phaseFilter, visibilityFilter, searchQuery]);

  // Statistics calculation
  const totalCount = entries.length;
  const pinnedCount = entries.filter((e) => e.isQuickEntry || Boolean(e.pinnedLocation)).length;
  const publicCount = entries.filter((e) => e.visibility === 'public').length;
  const pastCount = entries.filter((e) => e.phase === 'past').length;
  const futureCount = entries.filter((e) => e.phase === 'future').length;

  const handleLike = (id: string) => {
    const updated = toggleLikeJournalEntry(id);
    setEntries(updated);
    if (selectedEntry && selectedEntry.id === id) {
      const match = updated.find((e) => e.id === id);
      if (match) setSelectedEntry(match);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      const updated = deleteJournalEntry(id);
      setEntries(updated);
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
      if (onShowToast) {
        onShowToast('Entry Removed', 'The journal entry was deleted.', 'info');
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDestination.trim() || !formStory.trim()) {
      if (onShowToast) {
        onShowToast('Missing Fields', 'Please provide a title, destination, and journal story.', 'warning');
      }
      return;
    }

    const cleanSpots = formSpots
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanFood = formFood
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const cleanTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const numericBudget = parseInt(formBudget.replace(/,/g, ''), 10) || 2500;

    const newEntry = addJournalEntry({
      title: formTitle.trim(),
      destination: formDestination.trim(),
      origin: formOrigin.trim() || 'Kharagpur (KGP)',
      phase: formPhase,
      visibility: formVisibility,
      author: 'Aarav Patel',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      date: formPhase === 'present' ? 'Currently Traveling • Today' : formPhase === 'future' ? 'Planned Journey' : 'Recently Logged',
      story: formStory.trim(),
      transitInfo: formTransitInfo.trim() || undefined,
      recommendedTrain: formTransitInfo.includes('Express') ? formTransitInfo : undefined,
      mustVisitSpots: cleanSpots.length > 0 ? cleanSpots : [formDestination.trim() + ' Town Center'],
      localFoodRecommendations: cleanFood.length > 0 ? cleanFood : ['Local authentic cuisine & street specialties'],
      budgetSpentOrTarget: numericBudget,
      coverImage: formCoverImage,
      tags: cleanTags.length > 0 ? cleanTags : ['Travel Guide', 'Expedition'],
      mottoQuote: formMotto.trim() || 'Life is just going on. Life is too short, so make this trip happen!',
      practicalTips: [
        'Research trains or buses at least a week before departure.',
        'Carry local cash for station stalls and battery totos.',
      ],
      rating: 5,
    });

    setShowAddModal(false);
    // Reset form
    setFormTitle('');
    setFormDestination('');
    setFormStory('');
    setFormTransitInfo('');
    setFormSpots('');
    setFormFood('');

    if (onShowToast) {
      onShowToast(
        formVisibility === 'public' ? 'Public Guide Published!' : 'Saved to Personal Journal!',
        `"${newEntry.title}" is now recorded in your travel timeline.`,
        'success'
      );
    }
  };

  const handlePlanFromGuide = (entry: JournalEntry) => {
    if (onPlanTripTo) {
      onPlanTripTo(entry.origin || 'Kharagpur (KGP)', entry.destination);
    } else {
      onNavigate('planner', 'push');
    }
    if (onShowToast) {
      onShowToast(
        'Loaded in AI Trip Planner',
        `Route loaded: ${entry.origin || 'Kharagpur (KGP)'} ➔ ${entry.destination}. Make this trip happen!`,
        'success'
      );
    }
  };

  // Open Quick Entry Modal
  const handleOpenQuickEntry = (defaultLoc?: string) => {
    const currentTrips = getStoredTrips();
    setTrips(currentTrips);
    if (currentTrips.length > 0 && (!selectedTripId || !currentTrips.some((t) => t.id === selectedTripId))) {
      const activeTrip = currentTrips.find((t) => t.status === 'upcoming' || t.status === 'draft') || currentTrips[0];
      setSelectedTripId(activeTrip.id);
    }
    setPinnedTime(getFormattedLiveTime());
    if (defaultLoc) {
      setPinnedLocation(defaultLoc);
    }
    setShowQuickModal(true);
  };

  const activeSelectedTrip = useMemo(() => {
    if (!selectedTripId || selectedTripId === 'custom') return null;
    return trips.find((t) => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  const resolvedTripName = useMemo(() => {
    if (selectedTripId === 'custom') {
      return customTripName.trim() || 'Custom Expedition';
    }
    return activeSelectedTrip?.title || 'Current Trip';
  }, [selectedTripId, customTripName, activeSelectedTrip]);

  // Dynamic location chips based on active trip waypoints or iconic stops
  const locationSuggestions = useMemo(() => {
    if (activeSelectedTrip && activeSelectedTrip.waypoints && activeSelectedTrip.waypoints.length > 0) {
      return activeSelectedTrip.waypoints;
    }
    return [
      'Gopegarh Heritage Eco-Park, Medinipur',
      'Medinipur Station (MDN)',
      'Platform 7/8 Kharagpur Jn',
      'Assi Ghat, Varanasi',
      'Howrah Bridge & Station',
      'Kashi Vishwanath Corridor',
    ];
  }, [activeSelectedTrip]);

  // Pin Current GPS Location
  const handlePinCurrentGPS = () => {
    if (!navigator.geolocation) {
      if (onShowToast) {
        onShowToast('Geolocation Not Supported', 'Browser does not support GPS location.', 'warning');
      }
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setPinnedCoords({ lat: latitude, lng: longitude });
        const geoString = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
        if (!pinnedLocation.trim()) {
          setPinnedLocation(`Pinned GPS: ${geoString}`);
          handleSuggestTitleWithGemini(`Pinned GPS (${geoString})`);
        }
        if (onShowToast) {
          onShowToast('GPS Coordinates Captured', `Pinned at ${geoString}`, 'info');
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS location error:', err);
        if (onShowToast) {
          onShowToast('GPS Unavailable', 'Please type the location name manually.', 'info');
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  // Gemini API Title Suggestion Handler
  const handleSuggestTitleWithGemini = async (targetLoc?: string) => {
    const loc = (targetLoc || pinnedLocation).trim();
    if (!loc) {
      if (onShowToast) {
        onShowToast('Location Required', 'Please enter or select a location first to suggest a descriptive title.', 'warning');
      }
      return;
    }

    setIsSuggestingTitle(true);
    try {
      const res = await suggestJournalTitle({
        location: loc,
        time: pinnedTime,
        mood: pinnedMood,
        tripName: resolvedTripName,
        notes: quickStory,
      });

      setQuickTitle(res.suggestedTitle);
      setSuggestedAlternatives(res.alternativeTitles);
      setAiTitleModel(res.model);
      setHasAiSuggestedTitle(true);

      if (onShowToast) {
        onShowToast(
          'Gemini Title Suggested',
          `"${res.suggestedTitle}"`,
          'success'
        );
      }
    } catch (err) {
      console.error('Error suggesting title with Gemini:', err);
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  // Submit Quick Entry
  const handleQuickEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = pinnedLocation.trim();
    if (!loc) {
      if (onShowToast) {
        onShowToast('Location Required', 'Please pin a location for your quick journal entry.', 'warning');
      }
      return;
    }

    const title = quickTitle.trim() || `Pinned Moment at ${loc}`;
    const story = quickStory.trim() || `Pinned a live moment at ${loc} during our ${resolvedTripName} journey. Mood: ${pinnedMood}. Captured at ${pinnedTime}. Life goes on. Life is too short, so make this trip happen!`;

    const newEntry = addJournalEntry({
      title,
      destination: loc,
      origin: activeSelectedTrip?.origin || 'In-Transit',
      phase: 'present',
      visibility: quickVisibility,
      author: 'Aarav Patel',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      date: pinnedTime,
      story,
      transitInfo: activeSelectedTrip ? `Pinned during trip: ${resolvedTripName}` : 'Live Rail Corridor',
      mustVisitSpots: [loc],
      localFoodRecommendations: pinnedMood.includes('Eats') ? ['Local roadside chai & sweets'] : [],
      coverImage: quickCoverImage,
      tags: ['Quick Entry', 'Pinned Moment', pinnedMood.split(' ')[1] || 'Traveler', loc.split(',')[0].trim()],
      mottoQuote: 'Life is just going on. Life is too short, so make this trip happen!',
      practicalTips: [
        `Pinned at ${pinnedTime}`,
        `Spot: ${loc}`,
      ],
      rating: 5,
      // Quick Entry specific metadata
      isQuickEntry: true,
      pinnedLocation: loc,
      pinnedTime,
      pinnedMood,
      currentTripId: activeSelectedTrip?.id || undefined,
      currentTripName: resolvedTripName,
      coordinates: pinnedCoords || undefined,
    });

    setShowQuickModal(false);
    setPinnedLocation('');
    setQuickTitle('');
    setQuickStory('');
    setHasAiSuggestedTitle(false);
    setSuggestedAlternatives([]);

    if (onShowToast) {
      onShowToast(
        'Moment Pinned to Trip!',
        `"${newEntry.title}" has been added to your Living Travel Journal.`,
        'success'
      );
    }
  };

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-4 sm:px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        {/* HERO MOTTO & TRAVEL GUIDER BANNER */}
        <section
          id="journal-hero-banner"
          className="relative mt-4 mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-[#131b2e] via-[#1a253c] to-[#004d46] text-white p-6 sm:p-10 shadow-lg border border-[#eaedff]/20"
        >
          {/* Subtle geometric background overlay */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#00685f]/20 blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-[#fd761a]/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#89f5e7] text-[12px] font-bold uppercase tracking-wider border border-white/10">
              <span className="material-symbols-outlined text-[16px]">auto_stories</span>
              Travel Journal &amp; Public Travel Guider
            </div>

            {/* The user's motto */}
            <h1 className="text-[28px] sm:text-[40px] font-extrabold tracking-tight leading-tight text-white">
              “Life goes on. Life is too short, so make this trip happen!”
            </h1>

            <p className="text-[14px] sm:text-[16px] text-gray-200 leading-relaxed max-w-2xl font-normal">
              Your living journal of everywhere you want to go, whenever you were going, and whenever you are on the road. Collect rail itineraries, street food secrets, and publish public travel guides to inspire travelers around the world.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="open-quick-entry-hero-btn"
                type="button"
                onClick={() => handleOpenQuickEntry()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#fd761a] hover:from-[#ff9954] hover:to-[#e06512] text-white text-[13px] sm:text-[14px] font-extrabold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer ring-2 ring-[#ffdbca]/50 transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[19px] animate-pulse">add_location_alt</span>
                <span>Quick Entry (Pin Moment)</span>
              </button>

              <button
                id="open-add-journal-btn"
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-5 py-3 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-[13px] sm:text-[14px] font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Write New Journal / Public Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAiCardModal(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00685f] to-[#00a896] hover:from-[#00534c] hover:to-[#008378] text-white text-[13px] sm:text-[14px] font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-[#a4f2cb]/50"
              >
                <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
                <span>✨ AI Travel Card Synthesizer</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('planner', 'none')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13px] sm:text-[14px] font-semibold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer border border-white/15"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>Launch AI Trip Planner</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <div>
              <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider block">Total Guides &amp; Logs</span>
              <span className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight">{totalCount}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider block">📍 Pinned Quick Moments</span>
              <span className="text-[24px] sm:text-[28px] font-bold text-[#ffdbca] tracking-tight">{pinnedCount}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider block">Public Community Guides</span>
              <span className="text-[24px] sm:text-[28px] font-bold text-[#89f5e7] tracking-tight">{publicCount}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider block">Past &amp; Future Journeys</span>
              <span className="text-[24px] sm:text-[28px] font-bold text-[#e2e7ff] tracking-tight">{pastCount + futureCount}</span>
            </div>
          </div>
        </section>

        {/* SEARCH, FILTER PILLS & MODE SELECTOR */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#eaedff] mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input & Quick Entry Launcher */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4947] text-[19px]">
                  search
                </span>
                <input
                  id="journal-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by destination, station (KGP, MDN, BSB), pinned moment, or memories..."
                  className="w-full h-11 pl-11 pr-4 bg-[#f2f3ff] rounded-xl text-[14px] text-[#131b2e] placeholder-[#3d4947]/70 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 border border-transparent focus:border-[#00685f]/30 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4947] hover:text-[#131b2e] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <button
                id="open-quick-entry-toolbar-btn"
                type="button"
                onClick={() => handleOpenQuickEntry()}
                className="h-11 px-4 rounded-xl bg-[#ffdbca] hover:bg-[#ffcca8] text-[#9d4300] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-[#ffb885]/40 shadow-xs"
                title="Pin location, time, and mood to current trip"
              >
                <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
                <span className="hidden sm:inline">Quick Entry</span>
              </button>
            </div>

            {/* Visibility Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#f2f3ff] p-1 rounded-xl self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setVisibilityFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                  visibilityFilter === 'all'
                    ? 'bg-white text-[#131b2e] shadow-xs'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                All Views
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter('public')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  visibilityFilter === 'public'
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">public</span>
                Public Guides
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter('private')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  visibilityFilter === 'private'
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">lock</span>
                My Personal
              </button>
            </div>
          </div>

          {/* Temporal Phase Filters ("Wherever / Whenever / Pinned") */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#eaedff]">
            <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider mr-1">Timeline Phase:</span>
            {[
              { id: 'all', label: 'Everything' },
              { id: 'pinned', label: `📍 Pinned Moments (${pinnedCount})`, icon: 'push_pin' },
              { id: 'past', label: '🕰️ Whenever I Was Going (Past Journeys)', icon: 'history' },
              { id: 'present', label: '⚡ Whenever I Am Going (Live In-Transit)', icon: 'flight_takeoff' },
              { id: 'future', label: '✨ Wherever I Want To Go (Future Dream Guides)', icon: 'explore' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPhaseFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  phaseFilter === tab.id
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#e2e7ff] hover:text-[#131b2e]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GUIDES & JOURNAL ENTRIES GRID */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#eaedff] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f2f3ff] text-[#00685f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">auto_stories</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#131b2e]">No journal entries found</h3>
              <p className="text-[14px] text-[#3d4947] mt-1 max-w-md mx-auto">
                No guides match your current filter. Start writing your travel notes, past journeys, or dream plans!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
            >
              Write First Entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => {
              const isPast = entry.phase === 'past';
              const isPresent = entry.phase === 'present';
              const isFuture = entry.phase === 'future';

              return (
                <article
                  key={entry.id}
                  id={`journal-card-${entry.id}`}
                  className="bg-white rounded-2xl border border-[#eaedff] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={entry.coverImage}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Phase, Visibility & Pinned Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {(entry.isQuickEntry || entry.pinnedLocation) && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md bg-[#fd761a] text-white flex items-center gap-1 shadow-xs ring-1 ring-white/30">
                          <span className="material-symbols-outlined text-[13px]">add_location_alt</span>
                          <span>Pinned Moment</span>
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md ${
                          isPresent
                            ? 'bg-[#00a86b] text-white'
                            : isPast
                            ? 'bg-[#131b2e]/80 text-white'
                            : 'bg-[#9d4300] text-white'
                        }`}
                      >
                        {isPresent ? '⚡ Live In-Transit' : isPast ? '🕰️ Past Journey' : '✨ Dream Plan'}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-md ${
                          entry.visibility === 'public'
                            ? 'bg-[#00685f]/90 text-white'
                            : 'bg-black/60 text-gray-200'
                        }`}
                      >
                        {entry.visibility === 'public' ? 'Public Guide' : 'Personal'}
                      </span>

                      {/* Quick Share Icon on Image Top Right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharingEntry(entry);
                        }}
                        className="w-7 h-7 rounded-full bg-black/40 hover:bg-[#fd761a] text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer shadow-xs ml-auto"
                        title="Share this public story & social media captions"
                      >
                        <span className="material-symbols-outlined text-[15px]">share</span>
                      </button>
                    </div>

                    {/* Corridor Pill at bottom of image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[12px]">
                      <div className="font-semibold flex items-center gap-1 drop-shadow-sm">
                        <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">location_on</span>
                        <span>
                          {entry.origin ? `${entry.origin} ➔ ` : ''}
                          {entry.destination}
                        </span>
                      </div>
                      <span className="text-[11px] opacity-90 drop-shadow-sm">{entry.date}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h2
                        onClick={() => setSelectedEntry(entry)}
                        className="text-[18px] font-bold text-[#131b2e] group-hover:text-[#00685f] transition-colors line-clamp-2 cursor-pointer leading-snug"
                      >
                        {entry.title}
                      </h2>

                      {/* Quick Entry Pinned Moment Pill */}
                      {(entry.isQuickEntry || entry.pinnedLocation) && (
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#fff4e5] via-[#faf8ff] to-[#f2f3ff] border border-[#ffdbca] text-[12px] space-y-1">
                          <div className="flex items-center justify-between text-[#9d4300] font-bold text-[10.5px] uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                              <span className="truncate max-w-[170px]">{entry.currentTripName || 'Current Trip'}</span>
                            </span>
                            {entry.pinnedMood && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#ffdbca] font-semibold text-[#131b2e] truncate max-w-[130px]">
                                {entry.pinnedMood}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[#131b2e] font-semibold text-[12px] pt-0.5">
                            <span className="truncate pr-1">{entry.pinnedLocation || entry.destination}</span>
                            <span className="text-[11px] text-[#3d4947] shrink-0 font-normal">{entry.pinnedTime || entry.date}</span>
                          </div>
                        </div>
                      )}

                      {/* Motto Quote Pill */}
                      {entry.mottoQuote && (
                        <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[11.5px] text-[#00685f] font-semibold italic flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">format_quote</span>
                          <span>{entry.mottoQuote}</span>
                        </div>
                      )}

                      <p className="text-[13px] text-[#3d4947] line-clamp-3 leading-relaxed">
                        {entry.story}
                      </p>

                      {/* Express Rail & Transit Highlight */}
                      {entry.transitInfo && (
                        <div className="flex items-center gap-1.5 text-[11.5px] text-[#131b2e] bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg">
                          <span className="material-symbols-outlined text-[#00685f] text-[15px]">train</span>
                          <span className="truncate font-medium">{entry.transitInfo}</span>
                        </div>
                      )}

                      {/* Must-Visit Spots Preview */}
                      {entry.mustVisitSpots.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider block">
                            Key Landmarks &amp; Notes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {entry.mustVisitSpots.slice(0, 3).map((spot, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#131b2e] font-medium truncate max-w-[200px]"
                              >
                                • {spot}
                              </span>
                            ))}
                            {entry.mustVisitSpots.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-[#3d4947] font-semibold">
                                +{entry.mustVisitSpots.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Local Sweets / Food */}
                      {entry.localFoodRecommendations.length > 0 && (
                        <div className="text-[11.5px] text-[#9d4300] flex items-center gap-1 pt-0.5">
                          <span className="material-symbols-outlined text-[14px]">restaurant</span>
                          <span className="font-semibold truncate">{entry.localFoodRecommendations[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar & Plan Trip Button */}
                    <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLike(entry.id)}
                          className={`flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            entry.isLiked
                              ? 'text-[#fd761a] bg-[#ffdbca]/40'
                              : 'text-[#3d4947] hover:bg-[#f2f3ff]'
                          }`}
                          title="Like this guide"
                        >
                          <span className={`material-symbols-outlined text-[16px] ${entry.isLiked ? 'fill-current' : ''}`}>
                            favorite
                          </span>
                          <span>{entry.likesCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedEntry(entry)}
                          className="text-[12px] font-semibold text-[#00685f] hover:underline cursor-pointer"
                        >
                          Read Guide
                        </button>

                        <button
                          type="button"
                          onClick={() => setSharingEntry(entry)}
                          className="flex items-center gap-1 text-[12px] font-semibold text-[#131b2e] hover:text-[#00685f] px-2 py-1 rounded-lg hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                          title="Generate shareable link & social media summaries"
                        >
                          <span className="material-symbols-outlined text-[15px] text-[#fd761a]">
                            share
                          </span>
                          <span>Share</span>
                        </button>
                      </div>

                      {/* The "Plan Trip From This Guide" (Plan Maker) */}
                      <button
                        type="button"
                        onClick={() => handlePlanFromGuide(entry)}
                        className="px-3 py-1.5 bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        title="Plan this trip using AI Trip Planner"
                      >
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        <span>Plan This Trip</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* FULL JOURNAL ENTRY DETAIL MODAL */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#eaedff] my-8 animate-fadeIn">
              {/* Cover Header */}
              <div className="relative h-60 w-full overflow-hidden bg-gray-200">
                <img
                  src={selectedEntry.coverImage}
                  alt={selectedEntry.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <button
                  type="button"
                  onClick={() => setSharingEntry(selectedEntry)}
                  className="absolute top-4 right-15 h-9 px-3 rounded-full bg-white/20 hover:bg-[#fd761a] text-white text-[12px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer border border-white/20 shadow-xs"
                  title="Share story & social media captions"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  <span>Share Story</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00685f] text-white text-[11px] font-bold uppercase tracking-wider">
                      {selectedEntry.phase === 'past'
                        ? 'Past Memories'
                        : selectedEntry.phase === 'present'
                        ? 'Live Travel Log'
                        : 'Future Dream Guide'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium text-white">
                      {selectedEntry.visibility === 'public' ? 'Public Guide' : 'Private Diary'}
                    </span>
                  </div>
                  <h2 className="text-[22px] sm:text-[26px] font-extrabold leading-tight text-white">
                    {selectedEntry.title}
                  </h2>
                  <p className="text-[13px] text-gray-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">location_on</span>
                    <span>{selectedEntry.origin ? `${selectedEntry.origin} ➔ ` : ''}{selectedEntry.destination}</span>
                    <span>•</span>
                    <span>{selectedEntry.date}</span>
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Pinned Moment Box if Quick Entry */}
                {(selectedEntry.isQuickEntry || selectedEntry.pinnedLocation) && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fff4e5] via-[#faf8ff] to-[#f2f3ff] border border-[#ffdbca] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#9d4300] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
                        <span>Pinned Live Moment</span>
                      </span>
                      {selectedEntry.currentTripName && (
                        <span className="text-[12px] font-bold text-[#00685f] bg-white px-3 py-1 rounded-full border border-[#eaedff] shadow-2xs">
                          Current Trip: {selectedEntry.currentTripName}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-[#eaedff] shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Pinned Location</span>
                        <span className="text-[13.5px] font-bold text-[#131b2e] flex items-center gap-1.5 mt-0.5">
                          <span className="material-symbols-outlined text-[16px] text-[#fd761a]">pin_drop</span>
                          <span className="truncate">{selectedEntry.pinnedLocation || selectedEntry.destination}</span>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#eaedff] shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Pinned Time</span>
                        <span className="text-[13.5px] font-bold text-[#131b2e] flex items-center gap-1.5 mt-0.5">
                          <span className="material-symbols-outlined text-[16px] text-[#00685f]">schedule</span>
                          <span className="truncate">{selectedEntry.pinnedTime || selectedEntry.date}</span>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#eaedff] shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Traveler Mood</span>
                        <span className="text-[13.5px] font-bold text-[#9d4300] flex items-center gap-1.5 mt-0.5">
                          <span className="truncate">{selectedEntry.pinnedMood || '✨ Wonder & Awe'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Author & Motto Quote */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#faf8ff] border border-[#eaedff]">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedEntry.authorAvatar}
                      alt={selectedEntry.author}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00685f]/30"
                    />
                    <div>
                      <span className="font-bold text-[14px] text-[#131b2e] block">{selectedEntry.author}</span>
                      <span className="text-[12px] text-[#3d4947]">Curated Travel Contributor</span>
                    </div>
                  </div>

                  {selectedEntry.budgetSpentOrTarget && (
                    <div className="text-right self-end sm:self-auto">
                      <span className="text-[10px] uppercase font-bold text-[#3d4947] block">
                        {selectedEntry.phase === 'past' ? 'Actual Cost Spent' : 'Target Budget'}
                      </span>
                      <span className="text-[16px] font-extrabold text-[#006947]">
                        ₹{selectedEntry.budgetSpentOrTarget.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Motto */}
                {selectedEntry.mottoQuote && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#e2fced]/60 to-[#f2f3ff] border border-[#00a86b]/20 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#006947] text-[24px] shrink-0 mt-0.5">
                      format_quote
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#006947] block">
                        Traveler Philosophy
                      </span>
                      <p className="text-[14px] font-semibold text-[#131b2e] italic">
                        "{selectedEntry.mottoQuote}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Full Journal Story */}
                <div className="space-y-2">
                  <h4 className="text-[13px] font-bold text-[#3d4947] uppercase tracking-wider">
                    Travel Journal &amp; Notes:
                  </h4>
                  <div className="text-[14.5px] text-[#131b2e] leading-relaxed whitespace-pre-line bg-[#fbfbfe] p-4 rounded-xl border border-[#eaedff]">
                    {selectedEntry.story}
                  </div>
                </div>

                {/* Transit & Train Information */}
                {selectedEntry.transitInfo && (
                  <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[13px] text-[#00685f]">
                      <span className="material-symbols-outlined text-[18px]">train</span>
                      <span>Express Train &amp; Transit Corridor</span>
                    </div>
                    <p className="text-[13px] text-[#131b2e]">{selectedEntry.transitInfo}</p>
                  </div>
                )}

                {/* Collected Information: Must-Visit Landmarks */}
                {selectedEntry.mustVisitSpots.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[13px] font-bold text-[#3d4947] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#00685f] text-[18px]">verified</span>
                      <span>Collected Must-Visit Landmarks &amp; Sights</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedEntry.mustVisitSpots.map((spot, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[12.5px] text-[#131b2e] font-medium flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#00685f] text-white text-[11px] flex items-center justify-center font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span>{spot}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authentic Local Food Recommendations */}
                {selectedEntry.localFoodRecommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[13px] font-bold text-[#3d4947] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#9d4300] text-[18px]">restaurant</span>
                      <span>Authentic Regional Food &amp; Sweets</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.localFoodRecommendations.map((food, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-[#fff4e5] border border-[#ffdbca] text-[#9d4300] text-[12.5px] font-semibold flex items-center gap-1"
                        >
                          <span>🍴</span>
                          <span>{food}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Tips */}
                {selectedEntry.practicalTips && selectedEntry.practicalTips.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#e2e7ff]/40 border border-[#eaedff] space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00685f] block">
                      Practical Travel Guider Tips:
                    </span>
                    <ul className="list-disc list-inside text-[13px] text-[#131b2e] space-y-1">
                      {selectedEntry.practicalTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-[#eaedff] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLike(selectedEntry.id)}
                      className={`px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        selectedEntry.isLiked
                          ? 'bg-[#ffdbca] text-[#9d4300]'
                          : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#e2e7ff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                      <span>{selectedEntry.likesCount} Likes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharingEntry(selectedEntry)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ffdbca] to-[#ffe5d9] hover:from-[#ffd2bd] hover:to-[#ffdcc9] text-[#9d4300] text-[12px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-[#ffb690]"
                      title="Share link & social media captions"
                    >
                      <span className="material-symbols-outlined text-[16px]">share</span>
                      <span>Share Story</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(
                            `Travel Guide: ${selectedEntry.title} (${selectedEntry.origin || ''} ➔ ${selectedEntry.destination})\n\n${selectedEntry.story}`
                          );
                          if (onShowToast) onShowToast('Copied to Clipboard', 'Guide copied!', 'success');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#3d4947] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      <span>Copy Guide</span>
                    </button>

                    {selectedEntry.author === 'Aarav Patel' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedEntry.id)}
                        className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  {/* Primary CTA: Make This Trip Happen! */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEntry(null);
                      handlePlanFromGuide(selectedEntry);
                    }}
                    className="px-5 py-2.5 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>Make This Trip Happen (Plan Now)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE NEW JOURNAL ENTRY / PUBLIC GUIDE MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#eaedff] my-6 animate-fadeIn">
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#eaedff] pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00685f] bg-[#e2e7ff] px-2.5 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">edit_note</span>
                      New Journal &amp; Guider Entry
                    </div>
                    <h2 className="text-[22px] font-extrabold text-[#131b2e] tracking-tight">
                      Capture Your Journey &amp; Guide Others
                    </h2>
                    <p className="text-[13px] text-[#3d4947]">
                      Record where you went, where you are now, or where you dream of going.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-xl text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-5">
                  {/* Phase & Visibility Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Timeline Phase (When?)
                      </label>
                      <select
                        value={formPhase}
                        onChange={(e) => setFormPhase(e.target.value as JournalPhase)}
                        className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-[13.5px] font-semibold text-[#131b2e] outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 cursor-pointer"
                      >
                        <option value="past">🕰️ Past Journey (Memories &amp; Reflections)</option>
                        <option value="present">⚡ Live In-Transit (Currently Traveling)</option>
                        <option value="future">✨ Future Dream (Wishlist Guide)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Visibility Mode
                      </label>
                      <select
                        value={formVisibility}
                        onChange={(e) => setFormVisibility(e.target.value as JournalVisibility)}
                        className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-[13.5px] font-semibold text-[#131b2e] outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 cursor-pointer"
                      >
                        <option value="public">🌍 Public Guide (Help others plan their trips)</option>
                        <option value="private">🔒 Personal Private Journal (Only for me)</option>
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="new-entry-title" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                      Journal / Guide Title *
                    </label>
                    <input
                      id="new-entry-title"
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Sunrise Across Kangsabati River &amp; Medinipur Old Town..."
                      className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[14px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                    />
                  </div>

                  {/* Origin & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-entry-origin" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Starting Origin / Station (Optional)
                      </label>
                      <input
                        id="new-entry-origin"
                        type="text"
                        value={formOrigin}
                        onChange={(e) => setFormOrigin(e.target.value)}
                        placeholder="e.g. Kharagpur Jn (KGP)"
                        className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                      />
                    </div>

                    <div>
                      <label htmlFor="new-entry-dest" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Destination (City, Village, or Station) *
                      </label>
                      <input
                        id="new-entry-dest"
                        type="text"
                        required
                        value={formDestination}
                        onChange={(e) => setFormDestination(e.target.value)}
                        placeholder="e.g. Medinipur (MDN), Varanasi, Darjeeling..."
                        className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                      />
                    </div>
                  </div>

                  {/* Story / Experience */}
                  <div>
                    <label htmlFor="new-entry-story" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                      Travel Story &amp; Experience *
                    </label>
                    <textarea
                      id="new-entry-story"
                      required
                      rows={4}
                      value={formStory}
                      onChange={(e) => setFormStory(e.target.value)}
                      placeholder="Write your impressions, train journey moments, quiet riverbank reflections, or what made this place unforgettable..."
                      className="w-full p-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 leading-relaxed"
                    />
                  </div>

                  {/* Transit & Train Info */}
                  <div>
                    <label htmlFor="new-entry-transit" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                      Transit &amp; Train Details (For Guider)
                    </label>
                    <input
                      id="new-entry-transit"
                      type="text"
                      value={formTransitInfo}
                      onChange={(e) => setFormTransitInfo(e.target.value)}
                      placeholder="e.g. Rupashi Bangla Express (12883) from KGP Platform 7/8 (~18 mins, ₹45)"
                      className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                    />
                  </div>

                  {/* Must-Visit Spots & Food */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-entry-spots" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Must-Visit Spots (Comma-separated)
                      </label>
                      <input
                        id="new-entry-spots"
                        type="text"
                        value={formSpots}
                        onChange={(e) => setFormSpots(e.target.value)}
                        placeholder="Gopegarh Eco-Park, Vidyasagar Mandir, Gandhi Ghat"
                        className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                      />
                    </div>

                    <div>
                      <label htmlFor="new-entry-food" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Local Food &amp; Sweets (Comma-separated)
                      </label>
                      <input
                        id="new-entry-food"
                        type="text"
                        value={formFood}
                        onChange={(e) => setFormFood(e.target.value)}
                        placeholder="Chhana-boda, Babar Mishti, Posto Bora"
                        className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                      />
                    </div>
                  </div>

                  {/* Budget & Motto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-entry-budget" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Estimated / Spent Budget (₹ INR)
                      </label>
                      <input
                        id="new-entry-budget"
                        type="text"
                        value={formBudget}
                        onChange={(e) => setFormBudget(e.target.value)}
                        placeholder="2,500"
                        className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                      />
                    </div>

                    <div>
                      <label htmlFor="new-entry-motto" className="text-[12px] font-bold text-[#131b2e] block mb-1">
                        Motto / Personal Quote
                      </label>
                      <input
                        id="new-entry-motto"
                        type="text"
                        value={formMotto}
                        onChange={(e) => setFormMotto(e.target.value)}
                        placeholder="Life is just going on. Life is too short, so make this trip happen!"
                        className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                      />
                    </div>
                  </div>

                  {/* Preset Cover Photo Picker */}
                  <div>
                    <label className="text-[12px] font-bold text-[#131b2e] block mb-1.5">
                      Select Cover Photo
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_PHOTO_OPTIONS.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormCoverImage(photo.url)}
                          className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            formCoverImage === photo.url
                              ? 'border-[#00685f] ring-2 ring-[#00685f]/30 scale-95'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                          {formCoverImage === photo.url && (
                            <span className="absolute inset-0 bg-[#00685f]/40 flex items-center justify-center text-white">
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-4 border-t border-[#eaedff] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Save &amp; Publish Entry</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* QUICK ENTRY MODAL (PIN LOCATION, TIME, MOOD WITH GEMINI TITLE SUGGESTION) */}
        {showQuickModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#ffdbca] my-6 animate-fadeIn">
              {/* Header with warm twilight gradient */}
              <div className="bg-gradient-to-r from-[#131b2e] via-[#1a2b49] to-[#004d46] p-6 text-white relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ffdbca] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                      <span className="material-symbols-outlined text-[15px] animate-pulse">add_location_alt</span>
                      Quick Entry • Pin Live Moment
                    </div>
                    <h2 className="text-[22px] sm:text-[24px] font-extrabold text-white tracking-tight">
                      Pin Moment to Current Trip
                    </h2>
                    <p className="text-[13px] text-gray-200">
                      Capture where you are, whenever you are on the road. Powered by Gemini AI for evocative titles.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuickModal(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* Live Motto reminder */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[12px] text-[#89f5e7] italic font-medium">
                  <span className="material-symbols-outlined text-[15px]">format_quote</span>
                  <span>Life goes on. Life is too short, so make this trip happen!</span>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleQuickEntrySubmit} className="p-6 sm:p-8 space-y-6">
                {/* 1. Current Trip Selector */}
                <div className="space-y-1.5">
                  <label htmlFor="quick-trip-select" className="text-[12px] font-bold text-[#131b2e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">luggage</span>
                    <span>Which trip are you on right now? *</span>
                  </label>

                  {trips.length > 0 ? (
                    <select
                      id="quick-trip-select"
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-semibold outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 cursor-pointer"
                    >
                      {trips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.origin || 'Trip'} ➔ {t.destination}) • {t.status.toUpperCase()}
                        </option>
                      ))}
                      <option value="custom">+ Other / Custom Expedition</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customTripName}
                      onChange={(e) => setCustomTripName(e.target.value)}
                      placeholder="e.g. Kharagpur to Medinipur Weekend Trail"
                      className="w-full h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-semibold outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                    />
                  )}

                  {selectedTripId === 'custom' && trips.length > 0 && (
                    <input
                      type="text"
                      value={customTripName}
                      onChange={(e) => setCustomTripName(e.target.value)}
                      placeholder="Enter custom trip or journey name..."
                      className="w-full h-11 px-4 mt-2 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                    />
                  )}
                </div>

                {/* 2. Pinned Location with Gemini Suggestion & GPS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="quick-location-input" className="text-[12px] font-bold text-[#131b2e] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#fd761a]">pin_drop</span>
                      <span>Pinned Location *</span>
                    </label>

                    {pinnedCoords && (
                      <span className="text-[11px] text-[#00685f] font-mono font-medium">
                        GPS: {pinnedCoords.lat.toFixed(3)}°N, {pinnedCoords.lng.toFixed(3)}°E
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d4947] text-[18px]">
                        location_on
                      </span>
                      <input
                        id="quick-location-input"
                        type="text"
                        value={pinnedLocation}
                        onChange={(e) => setPinnedLocation(e.target.value)}
                        placeholder="e.g. Gopegarh Heritage Eco-Park, Medinipur"
                        className="w-full h-11 pl-10 pr-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* GPS Button */}
                      <button
                        type="button"
                        onClick={handlePinCurrentGPS}
                        disabled={isLocating}
                        className="h-11 px-3.5 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] rounded-xl text-[12px] font-semibold flex items-center gap-1.5 border border-[#eaedff] transition-colors cursor-pointer disabled:opacity-50"
                        title="Use device GPS location"
                      >
                        <span className={`material-symbols-outlined text-[16px] text-[#00685f] ${isLocating ? 'animate-spin' : ''}`}>
                          {isLocating ? 'progress_activity' : 'my_location'}
                        </span>
                        <span>{isLocating ? 'Locating...' : 'GPS Pin'}</span>
                      </button>

                      {/* Gemini Title Generator Button */}
                      <button
                        id="suggest-title-gemini-btn"
                        type="button"
                        onClick={() => handleSuggestTitleWithGemini()}
                        disabled={isSuggestingTitle || !pinnedLocation.trim()}
                        className="h-11 px-4 bg-gradient-to-r from-[#00685f] to-[#004d46] hover:from-[#008378] hover:to-[#005e55] text-white rounded-xl text-[12.5px] font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Use Gemini AI to suggest a descriptive title based on this location"
                      >
                        <span className={`material-symbols-outlined text-[16px] text-[#89f5e7] ${isSuggestingTitle ? 'animate-spin' : ''}`}>
                          {isSuggestingTitle ? 'hourglass_top' : 'auto_awesome'}
                        </span>
                        <span>{isSuggestingTitle ? 'Generating...' : 'Suggest Title with Gemini'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Waypoint suggestions chips for current trip */}
                  {locationSuggestions.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider block mb-1">
                        Quick Stops &amp; Waypoints for this Trip:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {locationSuggestions.map((spot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPinnedLocation(spot);
                              handleSuggestTitleWithGemini(spot);
                            }}
                            className="text-[11.5px] px-2.5 py-1 rounded-lg bg-[#faf8ff] hover:bg-[#ffdbca]/40 text-[#131b2e] hover:text-[#9d4300] border border-[#eaedff] font-medium transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px] text-[#fd761a]">near_me</span>
                            <span>{spot}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Gemini AI Descriptive Title Showcase & Input */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f7f5ff] via-[#f0f9f8] to-[#fff8f2] border border-[#d3ccf7] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#7a48d6] text-[18px]">auto_awesome</span>
                      <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#4916a0]">
                        Gemini AI Descriptive Title
                      </span>
                      {hasAiSuggestedTitle && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8deff] text-[#4916a0] border border-[#d3ccf7]">
                          ✨ AI Crafted
                        </span>
                      )}
                    </div>

                    {aiTitleModel && (
                      <span className="text-[10.5px] font-medium text-[#3d4947] bg-white px-2 py-0.5 rounded-md border border-[#eaedff]">
                        Model: {aiTitleModel}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      id="quick-entry-title"
                      type="text"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder={
                        isSuggestingTitle
                          ? 'Gemini is weaving a poetic title for this location...'
                          : 'Enter or let Gemini suggest an evocative title...'
                      }
                      className="w-full h-11 px-4 bg-white rounded-xl text-[14px] text-[#131b2e] font-bold outline-none border border-[#d3ccf7] focus:ring-2 focus:ring-[#7a48d6]/30 shadow-2xs"
                    />
                    <span className="text-[11px] text-[#3d4947] block pl-1">
                      Tip: Type any location above and click "Suggest Title with Gemini" to generate evocative titles.
                    </span>
                  </div>

                  {/* Alternative suggestions from Gemini */}
                  {suggestedAlternatives.length > 0 && (
                    <div className="pt-2 border-t border-[#d3ccf7]/40 space-y-1.5">
                      <span className="text-[11px] font-bold text-[#4916a0] uppercase tracking-wider block">
                        Or click an alternative atmospheric title:
                      </span>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-1.5">
                        {suggestedAlternatives.map((alt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setQuickTitle(alt)}
                            className={`text-[12px] text-left px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                              quickTitle === alt
                                ? 'bg-[#7a48d6] text-white border-[#7a48d6] font-bold shadow-xs'
                                : 'bg-white hover:bg-[#f7f5ff] text-[#131b2e] border-[#d3ccf7] font-medium'
                            }`}
                          >
                            <span>"{alt}"</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Pinned Time & Atmosphere */}
                <div className="space-y-2">
                  <label htmlFor="quick-time-input" className="text-[12px] font-bold text-[#131b2e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">schedule</span>
                    <span>Pinned Time &amp; Atmosphere *</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      id="quick-time-input"
                      type="text"
                      value={pinnedTime}
                      onChange={(e) => setPinnedTime(e.target.value)}
                      placeholder="e.g. 05:45 AM • Dawn at Riverbank"
                      className="w-full sm:flex-1 h-11 px-4 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-semibold outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30"
                    />

                    <button
                      type="button"
                      onClick={() => setPinnedTime(getFormattedLiveTime())}
                      className="h-11 px-3 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] text-[12px] font-medium shrink-0 border border-[#eaedff] cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">refresh</span>
                      <span>Now</span>
                    </button>
                  </div>

                  {/* Preset Time of day chips */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {QUICK_TIME_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
                          setPinnedTime(`${preset} • Today, ${dateStr}`);
                        }}
                        className="text-[11.5px] px-2.5 py-1 rounded-lg bg-[#faf8ff] hover:bg-[#e2e7ff] text-[#3d4947] hover:text-[#131b2e] border border-[#eaedff] font-medium transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Traveler Mood & Spirit */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#131b2e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#9d4300]">sentiment_very_satisfied</span>
                    <span>Traveler Mood &amp; Spirit *</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUICK_MOOD_OPTIONS.map((mood) => {
                      const isSelected = pinnedMood === mood.label;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setPinnedMood(mood.label)}
                          className={`p-2.5 rounded-xl border text-[12px] font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#00685f] bg-[#00685f] text-white shadow-xs'
                              : 'border-[#eaedff] bg-[#faf8ff] hover:bg-[#f2f3ff] text-[#131b2e]'
                          }`}
                        >
                          <span className="truncate">{mood.label}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[15px] shrink-0">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Quick Reflection Note */}
                <div className="space-y-1.5">
                  <label htmlFor="quick-story-input" className="text-[12px] font-bold text-[#131b2e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">notes</span>
                    <span>Quick Impression / Field Notes (Optional)</span>
                  </label>
                  <textarea
                    id="quick-story-input"
                    rows={3}
                    value={quickStory}
                    onChange={(e) => setQuickStory(e.target.value)}
                    placeholder="What are you seeing, hearing, or feeling right now? (e.g., sound of the diesel locomotive crossing the Kangsabati River, morning fog, sweet chai aroma...)"
                    className="w-full p-3.5 bg-[#f2f3ff] rounded-xl text-[13.5px] text-[#131b2e] font-medium outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 resize-none leading-relaxed"
                  />
                </div>

                {/* 7. Cover Image & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                      Cover Atmosphere
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRESET_PHOTO_OPTIONS.slice(0, 3).map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuickCoverImage(photo.url)}
                          className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            quickCoverImage === photo.url
                              ? 'border-[#00685f] ring-2 ring-[#00685f]/30'
                              : 'border-transparent hover:border-gray-300 opacity-80'
                          }`}
                        >
                          <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                      Visibility Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 h-14 items-center">
                      <button
                        type="button"
                        onClick={() => setQuickVisibility('public')}
                        className={`h-11 px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          quickVisibility === 'public'
                            ? 'bg-[#00685f] text-white border-[#00685f]'
                            : 'bg-[#f2f3ff] text-[#3d4947] border-[#eaedff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">public</span>
                        <span>Public Guide</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickVisibility('private')}
                        className={`h-11 px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          quickVisibility === 'private'
                            ? 'bg-[#00685f] text-white border-[#00685f]'
                            : 'bg-[#f2f3ff] text-[#3d4947] border-[#eaedff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">lock</span>
                        <span>Personal</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 8. Action Buttons */}
                <div className="pt-4 border-t border-[#eaedff] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQuickModal(false)}
                    className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    id="submit-quick-entry-btn"
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#fd761a] hover:from-[#ff9954] hover:to-[#e06512] text-white text-[13.5px] font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 ring-2 ring-[#ffdbca]/40"
                  >
                    <span className="material-symbols-outlined text-[19px]">add_location_alt</span>
                    <span>Pin to Current Trip &amp; Save</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SHARE JOURNAL MODAL */}
        {sharingEntry && (
          <ShareJournalModal
            entry={sharingEntry}
            isOpen={Boolean(sharingEntry)}
            onClose={() => setSharingEntry(null)}
            onUpdateVisibility={handleUpdateEntryVisibility}
            onShowToast={onShowToast}
          />
        )}

        {/* AI TRAVEL CARD MODAL */}
        <AiTravelCardModal
          isOpen={showAiCardModal}
          onClose={() => setShowAiCardModal(false)}
          targetSection="journal"
          onShowToast={onShowToast || (() => {})}
        />
      </div>
    </main>
  );
};
