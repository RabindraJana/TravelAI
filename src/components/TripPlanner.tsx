import React, { useState, useEffect } from 'react';
import { ScreenType, TransitionType, GeneratedTripPlan, ExpressTrainOption, TripItem } from '../types';
import { getRouteDetails, RouteInfo } from '../utils/routePlanner';
import { generateFullTripPlan, askTravelBot, checkGeminiStatus } from '../utils/geminiClient';
import { getStoredTrips, saveStoredTrips } from '../utils/tripStorage';
import { addJournalEntry } from '../utils/journalStorage';

interface TripPlannerProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  initialOrigin?: string;
  initialDestination?: string;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  onNavigate,
  initialOrigin,
  initialDestination,
  onShowToast,
}) => {
  const [origin, setOrigin] = useState(initialOrigin || 'Kharagpur (KGP)');
  const [destination, setDestination] = useState(initialDestination || 'Medinipur (MDN)');
  const [intercityMode, setIntercityMode] = useState<'flight' | 'train' | 'road'>('train');
  const [selectedTrain, setSelectedTrain] = useState<ExpressTrainOption | null>(null);
  const [duration, setDuration] = useState(2);
  const [budget, setBudget] = useState('6,000');
  const [partyType, setPartyType] = useState('solo');
  const [interests, setInterests] = useState<string[]>(['history', 'culture', 'food', 'nature']);
  const [stayStyle, setStayStyle] = useState('Budget');
  const [transitMethod, setTransitMethod] = useState('Mixed');
  const [culinaryProfile, setCulinaryProfile] = useState('Both');

  // AI Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedTripPlan | null>(null);
  const [activePlanDay, setActivePlanDay] = useState(1);
  const [isSavedToTrips, setIsSavedToTrips] = useState(false);
  const [isSavedToJournal, setIsSavedToJournal] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState<boolean | null>(null);

  // Gemini Travel Bot State
  const [botChatOpen, setBotChatOpen] = useState(true);
  const [botMessages, setBotMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; model?: string }>>([
    {
      sender: 'bot',
      text: 'Hello! I am your Travel AI Co-pilot powered by Gemini. Ask me anything about express trains (like Rupashi Bangla or Aranyak), local MEMU connections, station codes (KGP, MDN, HWH, NDLS), fares, or hidden local food spots!'
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Compute live route intelligence between Origin and Destination
  const route: RouteInfo = getRouteDetails(origin, destination);

  // Check Gemini status on mount
  useEffect(() => {
    checkGeminiStatus().then((status) => {
      setGeminiConnected(status.configured);
    });
  }, []);

  // Sync initial props
  useEffect(() => {
    if (initialOrigin) setOrigin(initialOrigin);
    if (initialDestination) setDestination(initialDestination);
  }, [initialOrigin, initialDestination]);

  // If corridor changes or is short distance, default to Express Train
  useEffect(() => {
    if (route.isShortDistance && intercityMode === 'flight') {
      setIntercityMode('train');
    }
    // Auto-select first recommended train if not set
    if (route.recommendedTrains.length > 0 && (!selectedTrain || !route.recommendedTrains.some(t => t.name === selectedTrain.name))) {
      setSelectedTrain(route.recommendedTrains[0]);
    }
  }, [origin, destination, route.isShortDistance]);

  const handleSwapRoute = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((i) => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  // Quick preset corridor setter
  const setQuickCorridor = (from: string, to: string, mode: 'flight' | 'train' | 'road' = 'train') => {
    setOrigin(from);
    setDestination(to);
    setIntercityMode(mode);
    setGeneratedPlan(null);
    setIsSavedToTrips(false);
  };

  // Cost estimates based on starting point and destination
  const numericBudget = parseInt(budget.replace(/,/g, ''), 10) || 6000;
  const transitCost =
    intercityMode === 'flight'
      ? route.flightCostRoundTrip
      : intercityMode === 'train'
      ? route.trainCostRoundTrip
      : route.busCostRoundTrip;

  const partyMultiplier = partyType === 'couple' ? 1.8 : partyType === 'family' ? 3.2 : partyType === 'friends' ? 2.5 : partyType === 'group' ? 4 : 1;
  const totalTransitCost = Math.round(transitCost * (partyType === 'solo' ? 1 : partyMultiplier * 0.9));
  const remainingBudget = Math.max(0, numericBudget - totalTransitCost);
  const dailySpend = Math.round(remainingBudget / Math.max(1, duration));

  const transitPercent = Math.min(50, Math.max(10, Math.round((totalTransitCost / numericBudget) * 100)));
  const stayPercent = Math.round((100 - transitPercent) * 0.42);
  const foodPercent = Math.round((100 - transitPercent) * 0.35);
  const miscPercent = Math.max(5, 100 - transitPercent - stayPercent - foodPercent);

  // Trigger Full AI Trip Generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    setIsSavedToTrips(false);
    setIsSavedToJournal(false);

    try {
      setGenerationStage(`Connecting to Gemini Travel AI for ${route.originCity} ➔ ${route.destinationCity}...`);
      await new Promise(r => setTimeout(r, 400));

      setGenerationStage(`Analyzing Express Train corridor & station hubs (${route.originStationCode} to ${route.destStationCode})...`);
      await new Promise(r => setTimeout(r, 400));

      setGenerationStage(`Synthesizing Day 1 to Day ${duration} itinerary with authentic local heritage & food...`);

      const result = await generateFullTripPlan({
        origin,
        destination,
        durationDays: duration,
        budget,
        transitMode: intercityMode,
        partyType,
        interests,
        stayStyle,
      });

      // Attach selected train if user picked one
      if (selectedTrain && result.plan) {
        result.plan.selectedTrain = selectedTrain;
      } else if (result.plan?.recommendedTrains?.length > 0) {
        result.plan.selectedTrain = result.plan.recommendedTrains[0];
      }

      setGeneratedPlan(result.plan);
      setActivePlanDay(1);

      if (onShowToast) {
        onShowToast(
          '✨ Trip Generated Successfully!',
          `${result.plan.title} (${route.originCity} ➔ ${route.destinationCity}) is ready.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      if (onShowToast) {
        onShowToast('Notice', 'Generated itinerary with local travel intelligence.', 'info');
      }
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  // Save Generated Plan directly to "My Trips"
  const handleSaveToMyTrips = () => {
    if (!generatedPlan) return;

    try {
      const currentTrips = getStoredTrips();
      const newTrip: TripItem = {
        id: `trip-${Date.now()}`,
        title: generatedPlan.title,
        origin: `${route.originCity} (${route.originStationCode})`,
        destination: `${route.destinationCity} (${route.destStationCode})`,
        startDate: 'Tomorrow',
        endDate: `In ${duration} Days`,
        durationDays: duration,
        status: 'upcoming',
        transitMode: intercityMode,
        bookingRef: selectedTrain ? `${selectedTrain.name} (${selectedTrain.number || 'Daily'})` : 'Confirmed Travel AI Plan',
        budgetTotal: numericBudget,
        budgetSpent: totalTransitCost,
        coverImage:
          route.destinationCity.toLowerCase().includes('medinipur') || route.destinationCity.toLowerCase().includes('midnapore')
            ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
        tags: [partyType, ...interests.slice(0, 3)],
        waypoints: generatedPlan.days.flatMap(d => d.activities.map(a => a.location)).slice(0, 5),
        checklistDone: 2,
        checklistTotal: 6,
        primaryDestination: route.destinationCity,
        customSummary: generatedPlan.tagline,
      };

      const updated = [newTrip, ...currentTrips];
      saveStoredTrips(updated);
      setIsSavedToTrips(true);

      if (onShowToast) {
        onShowToast('Saved to My Trips!', `${generatedPlan.title} is now in your active trips list.`, 'success');
      }
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  };

  // Publish / Save Generated Plan as a Living Travel Journal & Public Guide
  const handleSaveToJournal = () => {
    if (!generatedPlan) return;

    try {
      addJournalEntry({
        title: generatedPlan.title,
        destination: `${route.destinationCity} (${route.destStationCode})`,
        origin: `${route.originCity} (${route.originStationCode})`,
        phase: 'future',
        visibility: 'public',
        author: 'Aarav Patel',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        date: 'Planning for Upcoming Trip',
        story: `${generatedPlan.tagline}\n\n${generatedPlan.days
          .map((d) => `Day ${d.dayNumber} (${d.theme}): ` + d.activities.map((a) => `${a.timeSlot} - ${a.location}: ${a.description}`).join(' '))
          .join('\n\n')}`,
        transitInfo: selectedTrain
          ? `${selectedTrain.name} (${selectedTrain.number || 'Daily'})`
          : `${intercityMode.toUpperCase()} Transit Corridor`,
        recommendedTrain: selectedTrain ? `${selectedTrain.name} #${selectedTrain.number || ''}` : undefined,
        mustVisitSpots: generatedPlan.days.flatMap((d) => d.activities.map((a) => a.location)).slice(0, 5),
        localFoodRecommendations: generatedPlan.localFoodHighlights || [],
        budgetSpentOrTarget: numericBudget,
        coverImage:
          route.destinationCity.toLowerCase().includes('medinipur') || route.destinationCity.toLowerCase().includes('midnapore')
            ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
        tags: [intercityMode === 'train' ? 'Express Train' : 'Trip', partyType, route.destinationCity],
        mottoQuote: 'Life is just going on. Life is too short, so make this trip happen!',
        practicalTips: [
          `Book tickets on ${selectedTrain?.name || 'express train'} early for confirmed reservation.`,
          `Local e-rickshaws and totos are readily accessible at ${route.destStationCode} station.`,
        ],
        rating: 5,
      });

      setIsSavedToJournal(true);
      if (onShowToast) {
        onShowToast('Published to Travel Journal!', `${generatedPlan.title} is now active in your Public Travel Journal & Guides.`, 'success');
      }
    } catch (err) {
      console.error('Failed to save to journal:', err);
    }
  };

  const handleSharePlan = () => {
    const shareText = `Check out my travel plan from ${route.originCity} to ${route.destinationCity} via ${intercityMode === 'train' ? 'Express Train' : intercityMode}!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}#planner?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`
      );
      if (onShowToast) {
        onShowToast('Link Copied', shareText, 'success');
      }
    }
  };

  const handlePrintPlan = () => {
    window.print();
  };

  const handleSaveTo2027Goals = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('travel_ai_2027_goals') || '[]');
      const newGoal = {
        id: 'goal_' + Date.now(),
        title: `${duration}-Day Journey: ${route.destinationCity}`,
        destination: route.destinationCity,
        origin: route.originCity,
        targetMonth: 'Nov 2027',
        category: 'Heritage & Rail Expedition',
        targetBudget: numericBudget,
        savedBudget: Math.round(numericBudget * 0.3),
        completed: false,
        coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop&q=80',
        notes: `Express Train: ${selectedTrain?.name || 'Rupashi Bangla'}. Curated interests: ${interests.join(', ')}.`,
        milestones: [
          { text: `Book ${selectedTrain?.name || 'Express Train'} from ${route.originCity}`, done: false },
          { text: `Reserve ${stayStyle} accommodations`, done: false },
          { text: 'Finalize day-by-day itinerary', done: true },
        ],
        tags: interests.slice(0, 3),
      };
      existing.unshift(newGoal);
      localStorage.setItem('travel_ai_2027_goals', JSON.stringify(existing));
      if (onShowToast) {
        onShowToast('Saved to 2027 Goals!', `Your ${route.destinationCity} journey was added to your 2027 goals.`, 'success');
      }
      onNavigate('goals', 'none');
    } catch {
      onNavigate('goals', 'none');
    }
  };

  const handleReset = () => {
    setOrigin('Kharagpur (KGP)');
    setDestination('Medinipur (MDN)');
    setIntercityMode('train');
    setDuration(2);
    setBudget('6,000');
    setPartyType('solo');
    setInterests(['history', 'culture', 'food', 'nature']);
    setStayStyle('Budget');
    setTransitMethod('Mixed');
    setCulinaryProfile('Both');
    setGeneratedPlan(null);
    setIsSavedToTrips(false);
  };

  // Chat with Gemini Travel Bot
  const handleSendBotMessage = async (textToSend?: string) => {
    const msg = (textToSend || userChatInput).trim();
    if (!msg) return;

    setUserChatInput('');
    setBotMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setIsBotThinking(true);

    try {
      const response = await askTravelBot(msg, {
        origin,
        destination,
        transitMode: intercityMode,
      });

      setBotMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: response.reply,
          model: response.model,
        }
      ]);
    } catch (err) {
      setBotMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Rupashi Bangla Express (12883) and Howrah-Medinipur Fast EMUs run frequently between Kharagpur and Medinipur (~18 mins, ₹10-₹45). Ask me anything else about this route!',
        }
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  // Station and Village Suggestions
  const REGIONAL_STATIONS = [
    { label: 'Kharagpur Jn (KGP)', val: 'Kharagpur (KGP)', badge: 'Rail Hub' },
    { label: 'Medinipur Stn (MDN)', val: 'Medinipur (MDN)', badge: 'Heritage' },
    { label: 'Howrah / Kolkata (HWH)', val: 'Howrah (HWH)', badge: 'Major Metro' },
    { label: 'New Delhi (NDLS)', val: 'New Delhi (NDLS)', badge: 'Capital' },
    { label: 'Bishnupur (VSU)', val: 'Bishnupur (VSU)', badge: 'Terracotta' },
    { label: 'Jhargram (JGM)', val: 'Jhargram (JGM)', badge: 'Junglemahal' },
    { label: 'Varanasi (BSB)', val: 'Varanasi (BSB)', badge: 'Spiritual' },
  ];

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-4 sm:px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        <div className="relative py-6 sm:py-8 overflow-hidden">
          {/* Header & Status */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 relative z-10">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2e7ff] text-[#00685f] text-[11px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                  Gemini Travel AI • Express Rail Engine
                </div>
                {geminiConnected !== null && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      geminiConnected ? 'bg-[#e2fced] text-[#006947]' : 'bg-[#fff4e5] text-[#9d4300]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${geminiConnected ? 'bg-[#00a86b]' : 'bg-[#fd761a]'}`}></span>
                    {geminiConnected ? 'Gemini 2.5 Flash Online' : 'Smart Neural Rail Engine'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard', 'none')}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#00685f] hover:underline cursor-pointer ml-1"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Dashboard
                </button>
              </div>

              <h1 className="text-[30px] sm:text-[36px] font-bold text-[#131b2e] tracking-tight">
                AI Trip Planner &amp; Express Rail Guide
              </h1>
              <p className="text-[15px] sm:text-[16px] text-[#3d4947] leading-relaxed">
                Enter any town, village, or station (like <strong className="text-[#00685f]">Kharagpur</strong> to <strong className="text-[#9d4300]">Medinipur</strong>). Travel AI automatically discovers express trains, MEMUs, local attractions, and creates your day-by-day itinerary.
              </p>
            </div>

            {/* Quick Demo Corridor Pill */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-[#eaedff] flex items-center justify-between gap-3 self-start lg:self-auto">
              <div>
                <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider block">Highlighted Corridor</span>
                <span className="font-bold text-[13px] text-[#131b2e] block">Kharagpur ➔ Medinipur</span>
                <span className="text-[11px] text-[#00685f] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">train</span> 14 km • 18-min Express
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuickCorridor('Kharagpur (KGP)', 'Medinipur (MDN)', 'train')}
                className="px-3 py-1.5 bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Load Route
              </button>
            </div>
          </div>

          {/* Layout Grid: Left Wizard (7 Cols), Right AI Preview & Bot (5 Cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
            {/* Wizard Form Area (7 Cols) */}
            <div className="xl:col-span-7 space-y-6">
              {/* STEP 1: ROUTE & ORIGIN-DESTINATION */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#eaedff]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[12px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <div>
                      <h2 className="text-[20px] font-semibold text-[#131b2e]">Journey Route</h2>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#00685f] font-semibold flex items-center gap-1 bg-[#e2e7ff] px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">train</span>
                    {route.originStationCode} ➔ {route.destStationCode} ({route.distanceKm} km)
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Origin Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="origin-input" className="text-[13px] font-semibold text-[#131b2e] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
                        Where are you starting from? (Station, Town, or Village)
                      </label>
                      <button
                        type="button"
                        onClick={() => setOrigin('Kharagpur (KGP)')}
                        className="text-[11px] text-[#00685f] hover:underline font-semibold cursor-pointer"
                      >
                        🚆 Kharagpur Jn (KGP)
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-[#00685f] text-[20px]">trip_origin</span>
                      <input
                        id="origin-input"
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="Type any station or town (e.g., Kharagpur, New Delhi, Howrah)..."
                        className="w-full h-12 pl-12 pr-4 bg-[#f2f3ff] rounded-xl text-[14px] text-[#131b2e] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 border border-transparent focus:border-[#00685f]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="relative flex items-center justify-center my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-[#eaedff]"></div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwapRoute}
                      title="Swap Origin and Destination"
                      className="relative z-10 px-3.5 py-1 bg-white border border-[#eaedff] hover:border-[#00685f] hover:text-[#00685f] rounded-full text-[12px] font-semibold text-[#3d4947] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">swap_vert</span>
                      <span>Swap Origin &amp; Destination</span>
                    </button>
                  </div>

                  {/* Destination Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="destination-input" className="text-[13px] font-semibold text-[#131b2e] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9d4300]"></span>
                        Where do you want to go? (Station, Town, or Village)
                      </label>
                      <button
                        type="button"
                        onClick={() => setDestination('Medinipur (MDN)')}
                        className="text-[11px] text-[#9d4300] hover:underline font-semibold cursor-pointer"
                      >
                        📍 Medinipur Station (MDN)
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-[#9d4300] text-[20px]">location_on</span>
                      <input
                        id="destination-input"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Type any destination (e.g., Medinipur, Midnapore, Varanasi)..."
                        className="w-full h-12 pl-12 pr-4 bg-[#f2f3ff] rounded-xl text-[14px] text-[#131b2e] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#9d4300]/30 border border-transparent focus:border-[#9d4300]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Station and Village Quick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-[#3d4947] font-semibold mr-1">Quick Select:</span>
                    {REGIONAL_STATIONS.map((stn) => (
                      <button
                        key={stn.label}
                        type="button"
                        onClick={() => {
                          if (origin.includes(stn.label.split(' ')[0])) {
                            setDestination(stn.val);
                          } else {
                            setOrigin(stn.val);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] border border-[#eaedff] transition-colors cursor-pointer"
                      >
                        {stn.label}
                      </button>
                    ))}
                  </div>

                  {/* Short Corridor Notification Badge */}
                  {route.isShortDistance && (
                    <div className="p-3 rounded-xl bg-[#e2fced] border border-[#00a86b]/30 flex items-start gap-2 text-[12px]">
                      <span className="material-symbols-outlined text-[#006947] text-[18px] shrink-0 mt-0.5">verified</span>
                      <div>
                        <strong className="text-[#006947] block font-semibold">
                          ⚡ Short Regional Corridor ({route.distanceKm} km across Kangsabati River):
                        </strong>
                        <span className="text-[#3d4947]">
                          Express Rail is the fastest and most convenient mode. Flights are not applicable for this distance.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Inter-City Transit Options Card */}
                  <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#eaedff] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eaedff]">
                      <div className="font-bold text-[13px] text-[#131b2e] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#00685f] text-[18px]">commute</span>
                        <span>Choose Preferred Transit Mode</span>
                      </div>
                      <span className="text-[11px] text-[#3d4947]">
                        Hub: <strong>{route.departureHubTip.split('/')[0]}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Train */}
                      <button
                        type="button"
                        onClick={() => setIntercityMode('train')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          intercityMode === 'train'
                            ? 'bg-white border-[#00685f] shadow-sm ring-2 ring-[#00685f]/30'
                            : 'bg-white/70 border-[#eaedff] hover:bg-white text-[#3d4947]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[13px] text-[#131b2e] flex items-center gap-1">
                            🚆 Express Train
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e2fced] text-[#006947]">
                            {route.isShortDistance ? 'Optimal' : 'Value'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#3d4947] mt-1">{route.trainTime}</div>
                        <div className="text-[12px] font-bold text-[#00685f] mt-1">~₹{route.trainCostRoundTrip.toLocaleString()} return</div>
                      </button>

                      {/* Road */}
                      <button
                        type="button"
                        onClick={() => setIntercityMode('road')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          intercityMode === 'road'
                            ? 'bg-white border-[#00685f] shadow-sm ring-2 ring-[#00685f]/30'
                            : 'bg-white/70 border-[#eaedff] hover:bg-white text-[#3d4947]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[13px] text-[#131b2e] flex items-center gap-1">
                            🚗 Road / Cab
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#eaedff] text-[#3d4947]">Scenic</span>
                        </div>
                        <div className="text-[11px] text-[#3d4947] mt-1">{route.roadTime}</div>
                        <div className="text-[12px] font-bold text-[#3d4947] mt-1">~₹{route.busCostRoundTrip.toLocaleString()} return</div>
                      </button>

                      {/* Flight (Disabled if short distance) */}
                      <button
                        type="button"
                        disabled={route.isShortDistance}
                        onClick={() => setIntercityMode('flight')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          route.isShortDistance
                            ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed'
                            : intercityMode === 'flight'
                            ? 'bg-white border-[#00685f] shadow-sm ring-2 ring-[#00685f]/30 cursor-pointer'
                            : 'bg-white/70 border-[#eaedff] hover:bg-white text-[#3d4947] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[13px] text-[#131b2e] flex items-center gap-1">
                            ✈️ Flight
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e2e7ff] text-[#00685f]">
                            {route.isShortDistance ? 'N/A' : 'Fast'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#3d4947] mt-1">{route.flightTime}</div>
                        <div className="text-[12px] font-bold text-[#00685f] mt-1">
                          {route.isShortDistance ? 'N/A' : `~₹${route.flightCostRoundTrip.toLocaleString()} return`}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Express Trains on this Corridor Section */}
                  {route.recommendedTrains.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-[#eaedff] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#00685f] text-[20px]">train</span>
                          <span className="font-bold text-[13px] text-[#131b2e]">
                            Express Trains on this Corridor ({route.originCity} ➔ {route.destinationCity})
                          </span>
                        </div>
                        <span className="text-[11px] text-[#00685f] font-semibold bg-[#e2e7ff] px-2 py-0.5 rounded">
                          {route.recommendedTrains.length} options
                        </span>
                      </div>

                      <div className="space-y-2">
                        {route.recommendedTrains.map((train, idx) => {
                          const isPicked = selectedTrain?.name === train.name;
                          return (
                            <div
                              key={train.name + idx}
                              onClick={() => setSelectedTrain(train)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                isPicked
                                  ? 'bg-[#e2fced]/50 border-[#00a86b] shadow-xs ring-1 ring-[#00a86b]'
                                  : 'bg-[#faf8ff] border-[#eaedff] hover:bg-white'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[13px] text-[#131b2e]">{train.name}</span>
                                  {train.number && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#eaedff] text-[#3d4947]">
                                      #{train.number}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-[#e2e7ff] text-[#00685f]">
                                    {train.type}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#3d4947]">
                                  {train.duration} • Fare: <strong className="text-[#006947]">{train.fareEstimate}</strong> • {train.frequency}
                                </p>
                                {train.tips && (
                                  <p className="text-[10px] text-[#00685f] italic">
                                    Tip: {train.tips}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                                    isPicked ? 'bg-[#00a86b] text-white' : 'bg-white border border-[#eaedff] text-[#3d4947]'
                                  }`}
                                >
                                  {isPicked ? '✓ Selected' : 'Select Train'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* STEP 2 & 3: DURATION & BUDGET */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* STEP 2: DURATION */}
                <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[12px] flex items-center justify-center font-bold">
                          2
                        </span>
                        <h2 className="text-[18px] font-semibold text-[#131b2e]">Duration</h2>
                      </div>
                      <span className="px-3 py-1 bg-[#e2e7ff] text-[#00685f] font-bold text-[13px] rounded-lg">
                        {duration} {duration === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#3d4947] mb-4">Pace calibrated for {route.destinationCity} sightseeing.</p>
                  </div>

                  <div className="space-y-2">
                    <input
                      id="duration-slider"
                      type="range"
                      min="1"
                      max="14"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full accent-[#00685f] h-2 bg-[#e2e7ff] rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-[#3d4947]">
                      <span>1 Day (Day-Trip)</span>
                      <span>2-3 Days (Optimal)</span>
                      <span>14 Days (Expedition)</span>
                    </div>
                  </div>
                </section>

                {/* STEP 3: TOTAL BUDGET */}
                <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#eaedff]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[12px] flex items-center justify-center font-bold">
                        3
                      </span>
                      <h2 className="text-[18px] font-semibold text-[#131b2e]">Total Budget</h2>
                    </div>
                    <span className="text-[11px] font-bold text-[#9d4300] bg-[#ffdbca]/40 px-2 py-0.5 rounded">INR (₹)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="relative flex items-center">
                      <span className="text-[18px] text-[#131b2e] absolute left-4 select-none font-bold">₹</span>
                      <input
                        id="budget-input"
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full h-11 pl-9 pr-4 bg-[#f2f3ff] rounded-xl text-[18px] text-[#131b2e] outline-none focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 border border-transparent font-bold"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['3,000', '6,000', '12,000', '25,000'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBudget(val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] cursor-pointer transition-colors ${
                            budget === val ? 'bg-[#00685f] text-white font-bold' : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#e2e7ff]'
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* STEP 4 & 5: PARTY TYPE & INTERESTS */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#eaedff] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[12px] flex items-center justify-center font-bold">
                      4
                    </span>
                    <h2 className="text-[18px] font-semibold text-[#131b2e]">Travel Party &amp; Interests</h2>
                  </div>
                </div>

                {/* Party Type */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'solo', label: 'Solo', icon: 'person' },
                    { id: 'couple', label: 'Couple', icon: 'favorite' },
                    { id: 'friends', label: 'Friends', icon: 'group' },
                    { id: 'family', label: 'Family', icon: 'family_restroom' },
                    { id: 'group', label: 'Group', icon: 'groups_3' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPartyType(p.id)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                        partyType === p.id ? 'bg-[#00685f] text-white shadow-xs' : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#e2e7ff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                      <span className="font-semibold text-[13px]">{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Interests */}
                <div>
                  <label className="text-[12px] font-semibold text-[#3d4947] block mb-2">Curated Interests:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { tag: 'history', label: 'History & Heritage', icon: 'account_balance' },
                      { tag: 'culture', label: 'Culture & Temples', icon: 'museum' },
                      { tag: 'food', label: 'Local Cuisine & Sweets', icon: 'restaurant' },
                      { tag: 'nature', label: 'Nature & Riverbanks', icon: 'forest' },
                      { tag: 'photography', label: 'Photography', icon: 'photo_camera' },
                      { tag: 'rail', label: 'Railway Heritage', icon: 'train' },
                    ].map((item) => {
                      const isSelected = interests.includes(item.tag);
                      return (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => toggleInterest(item.tag)}
                          className={`px-3 py-1.5 rounded-full font-semibold text-[12px] flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected ? 'bg-[#00685f] text-white shadow-xs' : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#e2e7ff]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* STEP 6: PREFERENCES */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#eaedff]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[12px] flex items-center justify-center font-bold">
                    5
                  </span>
                  <h2 className="text-[18px] font-semibold text-[#131b2e]">Stay &amp; Dining Preferences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#f2f3ff] space-y-1">
                    <span className="text-[10px] font-bold text-[#3d4947] uppercase">Stay Style</span>
                    <span className="font-bold text-[13px] text-[#131b2e] block">{stayStyle}</span>
                    <div className="flex gap-1 pt-1">
                      {['Budget', 'Comfort', 'Prem.'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setStayStyle(mode)}
                          className={`flex-1 py-1 rounded text-[11px] cursor-pointer ${
                            stayStyle === mode ? 'bg-[#00685f] text-white font-bold' : 'bg-white text-[#3d4947]'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f2f3ff] space-y-1">
                    <span className="text-[10px] font-bold text-[#3d4947] uppercase">Local Transit</span>
                    <span className="font-bold text-[13px] text-[#131b2e] block">{transitMethod}</span>
                    <div className="flex gap-1 pt-1">
                      {['Mixed', 'Toto/Rickshaw', 'Private'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setTransitMethod(method)}
                          className={`flex-1 py-1 rounded text-[11px] cursor-pointer ${
                            transitMethod === method ? 'bg-[#00685f] text-white font-bold' : 'bg-white text-[#3d4947]'
                          }`}
                        >
                          {method.split('/')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f2f3ff] space-y-1">
                    <span className="text-[10px] font-bold text-[#3d4947] uppercase">Food Profile</span>
                    <span className="font-bold text-[13px] text-[#131b2e] block">{culinaryProfile}</span>
                    <div className="flex gap-1 pt-1">
                      {['Pure Veg', 'Both', 'Halal'].map((food) => (
                        <button
                          key={food}
                          type="button"
                          onClick={() => setCulinaryProfile(food)}
                          className={`flex-1 py-1 rounded text-[11px] cursor-pointer ${
                            culinaryProfile === food ? 'bg-[#00685f] text-white font-bold' : 'bg-white text-[#3d4947]'
                          }`}
                        >
                          {food}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: AI Generation Engine & Interactive Plan View (5 Cols) */}
            <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-20">
              {/* PRIMARY ACTION & SYNTHESIS CARD */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-[#eaedff] relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#131b2e] tracking-tight">Travel AI Generator</h3>
                    <p className="text-[12px] text-[#3d4947]">
                      Corridor: <strong className="text-[#00685f]">{route.originCity}</strong> ➔ <strong className="text-[#9d4300]">{route.destinationCity}</strong>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2fced] text-[#006947] text-[11px] font-bold shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#00a86b] animate-pulse"></span>
                    READY
                  </span>
                </div>

                {/* Corridor Specs Summary */}
                <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] mb-4 space-y-1 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#3d4947]">Distance:</span>
                    <strong className="text-[#131b2e]">~{route.distanceKm} km</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#3d4947]">Transit:</span>
                    <strong className="text-[#00685f]">
                      {intercityMode === 'train' ? `🚆 ${selectedTrain?.name || 'Express Train'}` : intercityMode}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#3d4947]">Round-trip Travel Cost:</span>
                    <strong className="text-[#006947]">~₹{totalTransitCost.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="space-y-2">
                  <button
                    id="generate-btn"
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      isGenerating
                        ? 'bg-[#008378] text-white opacity-90'
                        : 'bg-[#00685f] hover:bg-[#008378] text-white'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                        <span>{generationStage || 'Processing with Gemini Travel AI...'}</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                        <span>✨ Generate My Trip ({route.originCity} ➔ {route.destinationCity})</span>
                      </>
                    )}
                  </button>

                  <button
                    id="reset-btn"
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2 text-[#3d4947] hover:text-[#131b2e] text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                    <span>Reset Route &amp; Preferences</span>
                  </button>
                </div>

                {/* GENERATED TRIP PLAN DISPLAY */}
                {generatedPlan && (
                  <div className="mt-6 pt-6 border-t border-[#eaedff] space-y-4 animate-fadeIn">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#e2fced] text-[#006947] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          {generatedPlan.modelUsed === 'gemini-flash-latest' || generatedPlan.isAiGenerated
                            ? '✨ Powered by Gemini 2.5 Flash'
                            : '🧭 Travel AI Neural Engine'}
                        </span>
                        <span className="text-[11px] font-bold text-[#00685f]">
                          {generatedPlan.durationDays} Days • ₹{generatedPlan.totalBudget.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-[18px] font-bold text-[#131b2e] leading-snug">
                        {generatedPlan.title}
                      </h4>
                      <p className="text-[12px] text-[#3d4947] mt-0.5">
                        {generatedPlan.tagline}
                      </p>
                    </div>

                    {/* Selected Express Train Info */}
                    {generatedPlan.selectedTrain && (
                      <div className="p-3 rounded-xl bg-[#e2fced]/60 border border-[#00a86b]/40 space-y-1 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#006947] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">train</span>
                            {generatedPlan.selectedTrain.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded text-[#006947]">
                            {generatedPlan.selectedTrain.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#3d4947]">
                          Depart: {generatedPlan.selectedTrain.originStation} ➔ {generatedPlan.selectedTrain.destStation}
                        </p>
                        <p className="text-[11px] text-[#3d4947]">
                          Fare: <strong>{generatedPlan.selectedTrain.fareEstimate}</strong> ({generatedPlan.selectedTrain.frequency})
                        </p>
                      </div>
                    )}

                    {/* Day Tabs */}
                    {generatedPlan.days.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {generatedPlan.days.map((d) => (
                          <button
                            key={d.dayNumber}
                            type="button"
                            onClick={() => setActivePlanDay(d.dayNumber)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors shrink-0 ${
                              activePlanDay === d.dayNumber
                                ? 'bg-[#00685f] text-white shadow-xs'
                                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#e2e7ff]'
                            }`}
                          >
                            Day {d.dayNumber}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active Day Activities */}
                    {generatedPlan.days
                      .filter((d) => d.dayNumber === activePlanDay)
                      .map((day) => (
                        <div key={day.dayNumber} className="space-y-2.5">
                          <div className="text-[12px] font-bold text-[#131b2e] pb-1 border-b border-[#eaedff]">
                            {day.theme}
                          </div>

                          {day.activities.map((act, i) => (
                            <div key={i} className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] space-y-1 text-[12px]">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#131b2e] flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#00685f]">
                                    {act.timeSlot}
                                  </span>
                                  {act.title}
                                </span>
                                {act.costEstimate && (
                                  <span className="text-[11px] font-bold text-[#006947]">{act.costEstimate}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#3d4947] leading-relaxed">{act.description}</p>
                              <div className="text-[10px] text-[#00685f] flex items-center gap-1 pt-0.5">
                                <span className="material-symbols-outlined text-[13px]">place</span>
                                <span>{act.location}</span>
                              </div>
                            </div>
                          ))}

                          {day.culinaryRecommendation && (
                            <div className="p-2.5 rounded-xl bg-[#fff4e5] border border-[#ffdbca] text-[11px] text-[#9d4300]">
                              <strong>🍲 Culinary Recommendation:</strong> {day.culinaryRecommendation}
                            </div>
                          )}

                          {day.transitTip && (
                            <div className="p-2.5 rounded-xl bg-[#e2e7ff] border border-[#eaedff] text-[11px] text-[#00685f]">
                              <strong>💡 Local Transit Tip:</strong> {day.transitTip}
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Food & Hidden Gems Pills */}
                    {generatedPlan.localFoodHighlights?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-[#3d4947] block mb-1">
                          Must-Taste Local Foods:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {generatedPlan.localFoodHighlights.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#fff4e5] text-[#9d4300] text-[10px] font-semibold">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Save & Action Buttons */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleSaveToMyTrips}
                        className={`w-full py-3 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                          isSavedToTrips
                            ? 'bg-[#006947] text-white'
                            : 'bg-[#00685f] hover:bg-[#008378] text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isSavedToTrips ? 'check_circle' : 'bookmark_add'}
                        </span>
                        <span>{isSavedToTrips ? 'Trip Saved in "My Trips"!' : 'Save Trip to My Trips'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveToJournal}
                        className={`w-full py-2.5 px-4 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                          isSavedToJournal
                            ? 'bg-[#e2fced] text-[#006947] border-[#00a86b]'
                            : 'bg-white hover:bg-[#eaedff] text-[#00685f] border-[#eaedff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isSavedToJournal ? 'check_circle' : 'auto_stories'}
                        </span>
                        <span>
                          {isSavedToJournal ? 'Published in Travel Journal & Guides!' : 'Publish to Living Travel Journal & Guides'}
                        </span>
                      </button>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onNavigate('dashboard', 'none')}
                          className="py-2 px-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#00685f] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">dashboard</span>
                          <span>Dashboard</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSharePlan}
                          className="py-2 px-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">share</span>
                          <span>Share</span>
                        </button>
                        <button
                          type="button"
                          onClick={handlePrintPlan}
                          className="py-2 px-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3d4947] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">print</span>
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GEMINI TRAVEL BOT INTERACTIVE ASSISTANT CARD */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#eaedff] space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setBotChatOpen(!botChatOpen)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </span>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#131b2e]">Gemini Travel AI Co-pilot</h4>
                      <p className="text-[11px] text-[#3d4947]">Ask about express trains, stations &amp; schedules</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#3d4947] text-[20px]">
                    {botChatOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                {botChatOpen && (
                  <div className="space-y-3 pt-2">
                    {/* Quick Question Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '🚆 Express trains between KGP & MDN',
                        '🎫 Ticket fare for MEMU vs Express',
                        '🏛️ Top sights in Medinipur for 1-2 days',
                        '🍲 What sweet is Medinipur famous for?',
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendBotMessage(prompt)}
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#00685f] border border-[#eaedff] transition-colors cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Messages Container */}
                    <div className="max-h-56 overflow-y-auto space-y-2 p-2.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[12px]">
                      {botMessages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl ${
                            m.sender === 'user'
                              ? 'bg-[#00685f] text-white ml-6 text-right'
                              : 'bg-white text-[#131b2e] border border-[#eaedff] mr-4 text-left'
                          }`}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                          {m.model && (
                            <span className="text-[9px] opacity-60 block mt-1 font-mono">
                              via {m.model}
                            </span>
                          )}
                        </div>
                      ))}
                      {isBotThinking && (
                        <div className="p-2 rounded-lg bg-white border border-[#eaedff] text-[11px] text-[#00685f] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          <span>Gemini is checking railway routes...</span>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendBotMessage();
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={userChatInput}
                        onChange={(e) => setUserChatInput(e.target.value)}
                        placeholder="Ask about trains, stations, fares..."
                        className="flex-1 h-9 px-3 bg-[#f2f3ff] rounded-xl text-[12px] text-[#131b2e] outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f] border border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!userChatInput.trim() || isBotThinking}
                        className="h-9 px-3 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[12px] font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
