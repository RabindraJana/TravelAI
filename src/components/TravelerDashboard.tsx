import React, { useState, useEffect } from 'react';
import { ScreenType, TransitionType, TripItem } from '../types';
import { generateTripItineraryPdf } from '../utils/pdfGenerator';
import { getStoredTrips } from '../utils/tripStorage';
import { calculateTravelLevelInfo } from '../utils/travelLevels';
import { TravelLevelsSection } from './TravelLevelsSection';
import { PackingChecklist } from './PackingChecklist';
import {
  generateTravelAdvice,
  checkGeminiStatus,
  GeminiResponse,
  GeminiStatus,
} from '../utils/geminiClient';

interface TravelerDashboardProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  aiPrompt?: string;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const VARANASI_HERO_TRIP: TripItem = {
  id: 'varanasi-hero',
  title: 'Varanasi Cultural & Ghats Expedition',
  origin: 'New Delhi (DEL)',
  destination: 'Varanasi (BSB)',
  startDate: 'Oct 18, 2026',
  endDate: 'Oct 22, 2026',
  durationDays: 5,
  status: 'upcoming',
  transitMode: 'train',
  bookingRef: 'VAI-BSB-2026-88',
  budgetTotal: 12400,
  budgetSpent: 4200,
  coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
  tags: ['Culture', 'Photography', 'Heritage', 'Ghats'],
  waypoints: [
    'Assi Ghat Sunrise Subah-e-Banaras Aarti',
    'Manikarnika Ghat Heritage Boat Corridor',
    'Kashi Vishwanath Corridor & Old Town Temples',
    'Ancient Silk Weaving Quarters (Madanpura)',
    'Dashashwamedh Evening Maha Aarti',
  ],
  checklistDone: 7,
  checklistTotal: 10,
  primaryDestination: 'Varanasi, Uttar Pradesh',
  customSummary:
    'Deep sunrise boat rides along Manikarnika Ghat, ancient silk weaving quarters, evening Ganga Aarti ceremonies, and heritage culinary tastings.',
};

export const TravelerDashboard: React.FC<TravelerDashboardProps> = ({
  onNavigate,
  aiPrompt,
  onShowToast,
}) => {
  const [promptText, setPromptText] = useState(aiPrompt || '');
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
  const [promptSuccessMessage, setPromptSuccessMessage] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [activeBarHover, setActiveBarHover] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedTripId, setCopiedTripId] = useState<string | null>(null);

  // Stored trips and dynamically evaluated travel levels
  const [storedTrips, setStoredTrips] = useState<TripItem[]>(() => getStoredTrips());
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus | null>(null);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<GeminiResponse | null>(null);

  const levelInfo = calculateTravelLevelInfo(storedTrips);

  useEffect(() => {
    checkGeminiStatus().then((status) => setGeminiStatus(status));

    const handleTripsUpdated = (e: any) => {
      if (e.detail?.trips) {
        setStoredTrips(e.detail.trips);
      } else {
        setStoredTrips(getStoredTrips());
      }
    };

    window.addEventListener('trips-updated', handleTripsUpdated);
    return () => window.removeEventListener('trips-updated', handleTripsUpdated);
  }, []);

  useEffect(() => {
    if (aiPrompt) {
      setPromptText(aiPrompt);
    }
  }, [aiPrompt]);

  const refreshTrips = () => {
    setStoredTrips(getStoredTrips());
  };

  const handleDownloadHeroPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const success = await generateTripItineraryPdf(VARANASI_HERO_TRIP);
      if (success) {
        if (onShowToast) {
          onShowToast(
            'Offline PDF Downloaded',
            'Varanasi Cultural & Ghats Expedition itinerary PDF saved for offline travel access.',
            'success'
          );
        }
        setShowPdfModal(false);
      }
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const copyTripText = async (id: string, title: string, text: string) => {
    let success = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch {
        // Fallback
      }
    }
    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        // Ignore
      }
    }

    if (success) {
      setCopiedTripId(id);
      setTimeout(() => setCopiedTripId(null), 2500);
      if (onShowToast) {
        onShowToast('Trip Summary Copied', `Summary for "${title}" copied to clipboard!`, 'success');
      }
    }
  };

  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    setIsSubmittingPrompt(true);
    setPromptSuccessMessage(null);
    setAiGeneratedResult(null);

    try {
      const res = await generateTravelAdvice(
        promptText,
        'You are Travel AI Co-pilot. Provide inspiring, concise, and structured travel recommendations, transit advice, hidden gems, and budget insights.'
      );
      setAiGeneratedResult(res);
      if (onShowToast) {
        onShowToast(
          res.isFallback ? 'AI Recommendation Ready' : 'Gemini AI Briefing Ready',
          `Generated recommendations for: "${promptText.slice(0, 35)}..."`,
          'success'
        );
      }
    } catch (error: any) {
      console.error('Gemini error:', error);
      setPromptSuccessMessage(
        'Unable to complete AI request. Check your network or verify API settings.'
      );
    } finally {
      setIsSubmittingPrompt(false);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setPromptText('Plan a 3-day budget trip to Kolkata with cultural heritage stops');
      setIsListening(false);
    }, 1200);
  };

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-6 min-h-screen">
      <div className="flex flex-col w-full pb-12 space-y-8 max-w-7xl mx-auto">
        {/* Top Greeting & Action Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[36px] font-bold text-[#131b2e] tracking-tight">Good morning, Aarav</span>
              <span className="text-[28px] animate-pulse">👋</span>
            </div>
            <p className="text-[16px] text-[#3d4947] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fd761a] animate-ping"></span>
              You have an upcoming solo journey to <span className="font-semibold text-[#00685f]">Varanasi</span> in 14 days.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => onNavigate('planner', 'push')}
              className="flex items-center gap-2 px-6 py-3 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl font-semibold text-[14px] shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Plan a New Trip</span>
              <span className="material-symbols-outlined text-[#89f5e7] text-[18px]">arrow_back_ios_new</span>
            </button>
          </div>
        </div>

        {/* Traveler Motto & Living Journal Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#131b2e] via-[#1c2842] to-[#004d46] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-[#eaedff]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#89f5e7] flex items-center justify-center shrink-0 backdrop-blur-md">
              <span className="material-symbols-outlined text-[22px]">auto_stories</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#89f5e7] bg-white/10 px-2 py-0.5 rounded-full">
                  Traveler Motto
                </span>
                <span className="text-[11px] text-gray-300">Wherever &amp; Whenever You Go</span>
              </div>
              <p className="text-[14px] sm:text-[15px] font-bold text-white italic mt-0.5">
                “Life goes on. Life is too short, so make this trip happen!”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('journal', 'none')}
              className="px-4 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Explore Travel Journal &amp; Guides</span>
            </button>
          </div>
        </div>

        {/* AI Natural Language Prompt Bar */}
        <div className="relative w-full rounded-2xl bg-white p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9d4300] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="text-[12px] font-bold text-[#131b2e]">Gemini Travel Co-pilot</span>
            </div>
            <div>
              {geminiStatus?.configured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e6f4f2] text-[#00685f] text-[11px] font-semibold border border-[#00685f]/20">
                  <span className="w-2 h-2 rounded-full bg-[#006947] animate-pulse"></span>
                  <span>Gemini Connected (gemini-flash-latest)</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f2f3ff] text-[#5a6578] text-[11px] font-medium border border-[#eaedff]"
                  title="Configure GEMINI_API_KEY in Settings to enable real-time Gemini generation"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9d4300]"></span>
                  <span>AI Co-pilot Ready</span>
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={handleAiSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 bg-[#f2f3ff]/60 rounded-xl p-1 sm:px-4 sm:py-2"
          >
            <input
              id="ai-quick-input"
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={isSubmittingPrompt}
              placeholder='✨ Ask Gemini: "Plan a 3-day budget trip to Kolkata" or "Best sunset viewpoints in Varanasi"...'
              className="w-full bg-transparent text-[14px] text-[#131b2e] placeholder-[#3d4947]/70 focus:outline-none px-2"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="ai-voice-btn"
                type="button"
                onClick={handleVoiceInput}
                title="Voice dictation sample prompt"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isListening ? 'bg-[#fd761a] text-white animate-pulse' : 'text-[#3d4947] hover:text-[#00685f]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
              <button
                id="ai-submit-btn"
                type="submit"
                disabled={isSubmittingPrompt || !promptText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#9d4300] hover:bg-[#5c2400] text-white rounded-lg font-semibold text-[14px] transition-transform active:scale-95 cursor-pointer disabled:opacity-60 shrink-0"
              >
                {isSubmittingPrompt ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    <span>Consulting Gemini...</span>
                  </>
                ) : (
                  <>
                    <span>Ask Gemini</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live AI Generated Response Card */}
          {aiGeneratedResult && (
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#f8f9ff] to-[#f0f4ff] border border-[#d8def5] shadow-sm space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[#00685f]">
                  <div className="w-8 h-8 rounded-lg bg-[#00685f] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#131b2e]">
                      Gemini Travel Intelligence
                    </h4>
                    <span className="text-[11px] text-[#5a6578]">
                      {aiGeneratedResult.model || 'gemini-flash-latest'} {aiGeneratedResult.isFallback && '• demo advice mode'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(aiGeneratedResult.text);
                        if (onShowToast) onShowToast('Copied to Clipboard', 'AI travel advice copied!', 'success');
                      }
                    }}
                    className="p-1.5 rounded-lg text-[#5a6578] hover:text-[#131b2e] hover:bg-white/80 cursor-pointer"
                    title="Copy advice"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                  <button
                    onClick={() => setAiGeneratedResult(null)}
                    className="p-1.5 rounded-lg text-[#5a6578] hover:text-[#131b2e] hover:bg-white/80 cursor-pointer"
                    title="Dismiss"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              <div className="text-[13.5px] text-[#131b2e] leading-relaxed whitespace-pre-line bg-white/70 p-3.5 rounded-lg border border-[#eaedff]">
                {aiGeneratedResult.text}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-[#5a6578]">
                  Want to customize this into a full day-by-day plan?
                </span>
                <button
                  onClick={() => onNavigate('planner', 'push')}
                  className="px-3.5 py-1.5 bg-[#00685f] hover:bg-[#008378] text-white rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open in Trip Planner</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {promptSuccessMessage && (
            <div className="p-3 bg-[#00855b] text-white text-[13px] rounded-xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{promptSuccessMessage}</span>
              </div>
              <button
                onClick={() => onNavigate('planner', 'push')}
                className="underline font-bold text-white hover:text-[#89f5e7] text-[12px] cursor-pointer"
              >
                Open in Planner →
              </button>
            </div>
          )}
        </div>

        {/* Top 4 Metrics Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Stat 1: Trips Completed & Travel Level */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider">Trips Completed</span>
              <span className="p-2 rounded-xl bg-[#eaedff] text-[#00685f]">
                <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-[48px] font-bold text-[#131b2e] tracking-tight">
                {levelInfo.completedTripsCount}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00685f] text-white text-[11px] font-bold">
                Level {levelInfo.level} • {levelInfo.title}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#3d4947] text-[12px]">
              <span className="material-symbols-outlined text-[16px] text-[#006947]">military_tech</span>
              <span>{levelInfo.rankTitle} • {levelInfo.unlockedBadges.length} badges earned</span>
            </div>
          </div>

          {/* Stat 2: Cities Visited */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider">Cities Visited</span>
              <span className="p-2 rounded-xl bg-[#eaedff] text-[#9d4300]">
                <span className="material-symbols-outlined text-[20px]">location_city</span>
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-[48px] font-bold text-[#131b2e] tracking-tight">12</span>
              <div className="flex items-center gap-1 ml-auto">
                <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[12px] font-medium" title="India">
                  🇮🇳 IN
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[12px] font-medium" title="Nepal">
                  🇳🇵 NP
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[12px] font-medium" title="Bhutan">
                  🇧🇹 BT
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#3d4947] text-[12px]">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">explore</span>
              <span>Across 3 countries</span>
            </div>
          </div>

          {/* Stat 3: Total Distance */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider">Total Distance</span>
              <span className="p-2 rounded-xl bg-[#eaedff] text-[#006947]">
                <span className="material-symbols-outlined text-[20px]">route</span>
              </span>
            </div>
            <div className="my-2 flex items-end justify-between">
              <div>
                <span className="text-[48px] font-bold text-[#131b2e] tracking-tight">3,420</span>
                <span className="font-semibold text-[#3d4947] ml-1 text-[14px]">km</span>
              </div>
              {/* Sparkline SVG */}
              <div className="w-24 h-10">
                <svg className="w-full h-full text-[#00685f]" fill="none" viewBox="0 0 96 40">
                  <path d="M 0 32 Q 16 10, 32 25 T 64 8 T 96 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                  <path d="M 0 32 Q 16 10, 32 25 T 64 8 T 96 18 L 96 40 L 0 40 Z" fill="currentColor" fillOpacity="0.08" />
                  <circle className="fill-[#00685f] animate-pulse" cx="96" cy="18" r="3.5" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#3d4947] text-[12px]">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">trending_up</span>
              <span>Top expedition: 940 km Manali</span>
            </div>
          </div>

          {/* Stat 4: Average Budget */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3d4947] uppercase tracking-wider">Average Budget</span>
              <span className="p-2 rounded-xl bg-[#eaedff] text-[#008378]">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-1">
              <span className="text-[48px] font-bold text-[#131b2e] tracking-tight">₹1,850</span>
              <span className="text-[14px] text-[#3d4947]">/ day</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#006947]"></div>
                <span className="text-[12px] text-[#006947] font-semibold">Healthy (92% target)</span>
              </div>
              <span className="text-[12px] text-[#3d4947] font-medium">Low Tier</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Left 8 Cols, Right 4 Cols */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* Upcoming Journey Hero Card */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-semibold text-[#131b2e]">Upcoming Expedition</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffdbca] text-[#341100] text-[11px] font-bold uppercase">
                    Solo Tour
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('planner', 'push')}
                  className="text-[#00685f] hover:text-[#008378] text-[12px] font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  Full Itinerary <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row border border-[#eaedff]">
                {/* Image */}
                <div className="md:w-5/12 h-64 md:h-auto relative overflow-hidden group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[220px]"
                    alt="Sun rising over the ancient riverbanks of the Ganges in Varanasi with traditional wooden boats"
                    src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/80 via-transparent to-transparent md:hidden"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] text-[#006947] font-bold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">verified</span> Confirmed
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✈️ VoyageAI Trip Summary: Varanasi Cultural & Ghats Expedition
📍 Destination: Varanasi, Uttar Pradesh, India (Ghats & Spiritual Heritage Corridor)
🗓️ Key Dates: Oct 18 - 22, 2026 (5 Days) [Upcoming departure]
🚀 Transit Corridor: New Delhi (DEL) ➔ Varanasi (BSB) via 🚆 Vande Bharat
📍 Key Waypoints: Assi Ghat Morning Aarti • Manikarnika Sunset Boat • Silk Weaving Quarters
🎒 Gear Readiness: 70% Prepared (Stay booked at Assi Ghat)
💰 Budget Plan: ₹12,400 allocated
🔖 Booking Ref: VAI-BSB-2026-88

📝 Overview:
Deep sunrise boat rides along Manikarnika Ghat, ancient silk weaving quarters, evening Ganga Aarti ceremonies, and heritage culinary tastings.

Shared via VoyageAI Smart Travel Dashboard`;
                        copyTripText('varanasi-hero', 'Varanasi Cultural & Ghats Expedition', text);
                      }}
                      className={`p-1.5 rounded-full border backdrop-blur-md transition-all cursor-pointer shadow-sm flex items-center justify-center ${
                        copiedTripId === 'varanasi-hero'
                          ? 'bg-[#00855b] text-white border-[#00855b]'
                          : 'bg-black/50 hover:bg-black/75 text-white border-white/20'
                      }`}
                      title="Share trip summary to clipboard"
                      aria-label="Share trip details"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedTripId === 'varanasi-hero' ? 'check' : 'share'}
                      </span>
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 md:hidden text-white">
                    <span className="text-[20px] font-bold">Varanasi Cultural &amp; Ghats Expedition</span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="md:w-7/12 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="hidden md:flex items-center justify-between">
                      <span className="text-[11px] text-[#9d4300] font-bold tracking-wider uppercase">In 14 Days</span>
                      <span className="text-[12px] text-[#3d4947] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">event</span> Oct 18 - 22, 2026
                      </span>
                    </div>
                    <h3 className="hidden md:block text-[24px] font-semibold text-[#131b2e] mt-1 leading-snug">
                      Varanasi Cultural &amp; Ghats Expedition
                    </h3>
                    <p className="text-[14px] text-[#3d4947] mt-1 line-clamp-2">
                      Deep sunrise boat rides along Manikarnika Ghat, ancient silk weaving quarters, evening Ganga Aarti ceremonies, and heritage culinary tastings.
                    </p>
                  </div>

                  {/* Booking Progress */}
                  <div className="space-y-1.5 bg-[#f2f3ff] p-4 rounded-xl">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#3d4947]">Booking Checklist Progress</span>
                      <span className="font-semibold text-[#00685f]">70% Completed</span>
                    </div>
                    <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#00685f] h-full rounded-full transition-all duration-1000 w-[70%]"></div>
                    </div>
                    <div className="flex items-center justify-between text-[#3d4947] text-[12px] pt-1">
                      <span>✓ Stay booked (Assi Ghat)</span>
                      <span>✓ Train confirmed</span>
                      <span className="text-[#9d4300] font-semibold">1 Task Pending</span>
                    </div>
                  </div>

                  {/* Financials & Buttons */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[12px] text-[#3d4947] block">Total Budget Allocation</span>
                      <span className="text-[20px] text-[#131b2e] font-bold">₹12,400</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = `✈️ VoyageAI Trip Summary: Varanasi Cultural & Ghats Expedition
📍 Destination: Varanasi, Uttar Pradesh, India (Ghats & Spiritual Heritage Corridor)
🗓️ Key Dates: Oct 18 - 22, 2026 (5 Days) [Upcoming departure]
🚀 Transit Corridor: New Delhi (DEL) ➔ Varanasi (BSB) via 🚆 Vande Bharat
📍 Key Waypoints: Assi Ghat Morning Aarti • Manikarnika Sunset Boat • Silk Weaving Quarters
🎒 Gear Readiness: 70% Prepared (Stay booked at Assi Ghat)
💰 Budget Plan: ₹12,400 allocated
🔖 Booking Ref: VAI-BSB-2026-88

📝 Overview:
Deep sunrise boat rides along Manikarnika Ghat, ancient silk weaving quarters, evening Ganga Aarti ceremonies, and heritage culinary tastings.

Shared via VoyageAI Smart Travel Dashboard`;
                          copyTripText('varanasi-hero', 'Varanasi Cultural & Ghats Expedition', text);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-[13px] transition-all flex items-center gap-1 cursor-pointer border ${
                          copiedTripId === 'varanasi-hero'
                            ? 'bg-[#00855b] text-white border-[#00855b]'
                            : 'bg-white hover:bg-[#eaedff] text-[#131b2e] border-[#eaedff]'
                        }`}
                        title="Share trip summary to clipboard"
                        aria-label="Share trip details"
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {copiedTripId === 'varanasi-hero' ? 'check' : 'share'}
                        </span>
                        <span>{copiedTripId === 'varanasi-hero' ? 'Copied!' : 'Share'}</span>
                      </button>
                      <button
                        onClick={handleDownloadHeroPdf}
                        disabled={isDownloadingPdf}
                        className="px-3 py-1.5 bg-[#eaedff] text-[#00685f] hover:bg-[#dae2fd] rounded-xl font-semibold text-[13px] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Download formatted PDF version of itinerary for offline access while traveling"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isDownloadingPdf ? 'hourglass_top' : 'picture_as_pdf'}
                        </span>
                        <span className="hidden sm:inline">{isDownloadingPdf ? 'Saving...' : 'PDF'}</span>
                      </button>
                      <button
                        onClick={() => onNavigate('planner', 'push')}
                        className="px-3 py-1.5 bg-[#eaedff] text-[#131b2e] hover:bg-[#dae2fd] rounded-xl font-semibold text-[13px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onNavigate('planner', 'push')}
                        className="px-4 py-1.5 bg-[#00685f] text-white hover:bg-[#008378] rounded-xl font-semibold text-[13px] transition-all shadow-sm cursor-pointer"
                      >
                        View Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Smart Packing Checklist for Upcoming Expedition */}
              <div className="p-4 pt-0 border-t border-[#eaedff]">
                <PackingChecklist trip={VARANASI_HERO_TRIP} onShowToast={onShowToast} />
              </div>
            </div>

            {/* Travel Levels & Badges Achievement System */}
            <TravelLevelsSection
              levelInfo={levelInfo}
              storedTrips={storedTrips}
              onTripStatusChanged={refreshTrips}
              onNavigate={onNavigate}
            />

            {/* Recent Trips Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-semibold text-[#131b2e]">Recent Trips</h3>
                <button
                  onClick={() => onNavigate('trips', 'none')}
                  className="text-[#00685f] hover:text-[#008378] text-[12px] font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  View All My Trips <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Kolkata */}
                <div className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-[#eaedff]">
                  <div className="relative h-36 rounded-xl overflow-hidden mb-2">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Warm yellow heritage ambassador taxi driving past colonial architecture in Kolkata"
                      src="https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop&q=80"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 text-[11px] text-[#006947] font-bold backdrop-blur-xs">
                      Completed
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✈️ VoyageAI Trip Summary: Kolkata Heritage Trail
📍 Primary Destination: Kolkata, West Bengal, India
🗓️ Key Dates: Sept 12 - 15, 2026 (3 Days) [Completed]
🚀 Transit Corridor: Netaji Subhash Chandra Bose Intl (CCU)
📍 Key Waypoints: Victoria Memorial • Howrah Bridge • Kumartuli Potters Colony • College Street Coffee House
💰 Budget: ₹5,550
⭐ Traveler Rating: 4.9/5

📝 Overview:
Immersive photography expedition through Kolkata's colonial architecture, clay idol workshops in Kumartuli, and vintage tram rides.

Shared via VoyageAI Smart Travel Dashboard`;
                        copyTripText('kolkata-recent', 'Kolkata Heritage Trail', text);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-xs border ${
                        copiedTripId === 'kolkata-recent'
                          ? 'bg-[#00855b] text-white border-[#00855b]'
                          : 'bg-black/50 hover:bg-black/75 text-white border-white/20'
                      }`}
                      title="Share trip summary"
                      aria-label="Share Kolkata trip"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedTripId === 'kolkata-recent' ? 'check' : 'share'}
                      </span>
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#283044]/85 text-white text-[11px] font-medium">
                      3 Days
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-[#131b2e] truncate">Kolkata Heritage Trail</span>
                      <span className="text-[12px] text-[#9d4300] font-bold flex items-center">
                        ★ 4.9
                      </span>
                    </div>
                    <p className="text-[12px] text-[#3d4947]">Sept 2026 • Street Photography</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#eaedff] flex items-center justify-between">
                    <span className="font-semibold text-[14px] text-[#131b2e]">₹5,550</span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✈️ VoyageAI Trip Summary: Kolkata Heritage Trail
📍 Primary Destination: Kolkata, West Bengal, India
🗓️ Key Dates: Sept 12 - 15, 2026 (3 Days) [Completed]
🚀 Transit Corridor: Netaji Subhash Chandra Bose Intl (CCU)
📍 Key Waypoints: Victoria Memorial • Howrah Bridge • Kumartuli Potters Colony • College Street Coffee House
💰 Budget: ₹5,550
⭐ Traveler Rating: 4.9/5

📝 Overview:
Immersive photography expedition through Kolkata's colonial architecture, clay idol workshops in Kumartuli, and vintage tram rides.

Shared via VoyageAI Smart Travel Dashboard`;
                        copyTripText('kolkata-recent', 'Kolkata Heritage Trail', text);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1 cursor-pointer transition-colors border ${
                        copiedTripId === 'kolkata-recent'
                          ? 'bg-[#00855b] text-white border-[#00855b]'
                          : 'text-[#00685f] hover:bg-[#e2e7ff] border-[#eaedff]'
                      }`}
                      title="Share trip details to clipboard"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedTripId === 'kolkata-recent' ? 'check' : 'share'}
                      </span>
                      <span>{copiedTripId === 'kolkata-recent' ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Manali */}
                <div className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-[#eaedff]">
                  <div className="relative h-36 rounded-xl overflow-hidden mb-2">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Snow-capped Himalayan mountain ridges near Manali"
                      src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 text-[11px] text-[#006947] font-bold backdrop-blur-xs">
                      Completed
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✈️ VoyageAI Trip Summary: Manali High Pass Trek
📍 Primary Destination: Manali, Himachal Pradesh, India
🗓️ Key Dates: July 20 - 25, 2026 (5 Days) [Completed]
🚀 Transit Corridor: Kullu Manali (KUU) via Mountain Road
📍 Key Waypoints: Rohtang Pass • Solang Valley • Beas Kund Trail • Old Manali Cafes
💰 Budget: ₹14,200
⭐ Traveler Rating: 5.0/5

📝 Overview:
Alpine ridge trekking, high-altitude camping near Beas Kund, and scenic pine forest expeditions.

Shared via VoyageAI Smart Travel Dashboard`;
                        copyTripText('manali-recent', 'Manali High Pass Trek', text);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-xs border ${
                        copiedTripId === 'manali-recent'
                          ? 'bg-[#00855b] text-white border-[#00855b]'
                          : 'bg-black/50 hover:bg-black/75 text-white border-white/20'
                      }`}
                      title="Share trip summary"
                      aria-label="Share Manali trip"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedTripId === 'manali-recent' ? 'check' : 'share'}
                      </span>
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#283044]/85 text-white text-[11px] font-medium">
                      5 Days
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-[#131b2e] truncate">Manali High Pass Trek</span>
                      <span className="text-[12px] text-[#9d4300] font-bold flex items-center">
                        ★ 5.0
                      </span>
                    </div>
                    <p className="text-[12px] text-[#3d4947]">July 2026 • Trek &amp; Camping</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#eaedff] flex items-center justify-between">
                    <span className="font-semibold text-[14px] text-[#131b2e]">₹14,200</span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✈️ VoyageAI Trip Summary: Manali High Pass Trek
📍 Primary Destination: Manali, Himachal Pradesh, India
🗓️ Key Dates: July 20 - 25, 2026 (5 Days) [Completed]
🚀 Transit Corridor: Kullu Manali (KUU) via Mountain Road
📍 Key Waypoints: Rohtang Pass • Solang Valley • Beas Kund Trail • Old Manali Cafes
💰 Budget: ₹14,200
⭐ Traveler Rating: 5.0/5

📝 Overview:
Alpine ridge trekking, high-altitude camping near Beas Kund, and scenic pine forest expeditions.

Shared via VoyageAI Smart Travel Dashboard`;
                        copyTripText('manali-recent', 'Manali High Pass Trek', text);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1 cursor-pointer transition-colors border ${
                        copiedTripId === 'manali-recent'
                          ? 'bg-[#00855b] text-white border-[#00855b]'
                          : 'text-[#00685f] hover:bg-[#e2e7ff] border-[#eaedff]'
                      }`}
                      title="Share trip details to clipboard"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedTripId === 'manali-recent' ? 'check' : 'share'}
                      </span>
                      <span>{copiedTripId === 'manali-recent' ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                {/* Card 3: Jaipur */}
                <div className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-[#eaedff]">
                  <div className="relative h-36 rounded-xl overflow-hidden mb-2">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Terracotta pink facade of Hawa Mahal in Jaipur Rajasthan"
                      src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 text-[11px] text-[#006947] font-bold backdrop-blur-xs">
                      Completed
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✈️ VoyageAI Trip Summary: Jaipur Royal Palace Tour
📍 Primary Destination: Jaipur, Rajasthan, India
🗓️ Key Dates: May 5 - 9, 2026 (4 Days) [Completed]
🚀 Transit Corridor: Jaipur International (JAI)
📍 Key Waypoints: Hawa Mahal • Amber Fort • City Palace • Johari Bazaar
💰 Budget: ₹8,900
⭐ Traveler Rating: 4.8/5

📝 Overview:
Exploration of Mughal-Rajput palaces, artisan block-printing workshops in Sanganer, and royal heritage dining.

Shared via VoyageAI Smart Travel Dashboard`;
                        copyTripText('jaipur-recent', 'Jaipur Royal Palace Tour', text);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition-all cursor-pointer shadow-xs border ${
                        copiedTripId === 'jaipur-recent'
                          ? 'bg-[#00855b] text-white border-[#00855b]'
                          : 'bg-black/50 hover:bg-black/75 text-white border-white/20'
                      }`}
                      title="Share trip summary"
                      aria-label="Share Jaipur trip"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedTripId === 'jaipur-recent' ? 'check' : 'share'}
                      </span>
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#283044]/85 text-white text-[11px] font-medium">
                      4 Days
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-[#131b2e] truncate">Jaipur Royal Palace Tour</span>
                      <span className="text-[12px] text-[#9d4300] font-bold flex items-center">
                        ★ 4.8
                      </span>
                    </div>
                    <p className="text-[12px] text-[#3d4947]">May 2026 • Architecture &amp; Food</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#eaedff] flex items-center justify-between">
                    <span className="font-semibold text-[14px] text-[#131b2e]">₹8,900</span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✈️ VoyageAI Trip Summary: Jaipur Royal Palace Tour
📍 Primary Destination: Jaipur, Rajasthan, India
🗓️ Key Dates: May 5 - 9, 2026 (4 Days) [Completed]
🚀 Transit Corridor: Jaipur International (JAI)
📍 Key Waypoints: Hawa Mahal • Amber Fort • City Palace • Johari Bazaar
💰 Budget: ₹8,900
⭐ Traveler Rating: 4.8/5

📝 Overview:
Exploration of Mughal-Rajput palaces, artisan block-printing workshops in Sanganer, and royal heritage dining.

Shared via VoyageAI Smart Travel Dashboard`;
                        copyTripText('jaipur-recent', 'Jaipur Royal Palace Tour', text);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1 cursor-pointer transition-colors border ${
                        copiedTripId === 'jaipur-recent'
                          ? 'bg-[#00855b] text-white border-[#00855b]'
                          : 'text-[#00685f] hover:bg-[#e2e7ff] border-[#eaedff]'
                      }`}
                      title="Share trip details to clipboard"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedTripId === 'jaipur-recent' ? 'check' : 'share'}
                      </span>
                      <span>{copiedTripId === 'jaipur-recent' ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Spending & Velocity Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-[20px] font-semibold text-[#131b2e]">Travel Spending &amp; Velocity</h3>
                  <p className="text-[12px] text-[#3d4947]">Monthly spending trends across transit, accommodation &amp; dining</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#eaedff] text-[#3d4947] text-[12px] font-medium">
                    2026 View
                  </span>
                  <div className="flex items-center gap-3 pl-2">
                    <span className="flex items-center gap-1 text-[12px] text-[#3d4947]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#00685f]"></span> Stays
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[#3d4947]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#fd761a]"></span> Food
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-[#3d4947]">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#dae2fd]"></span> Transit
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom SVG Stacked Bar Chart */}
              <div className="w-full h-44 pt-2 relative">
                {activeBarHover && (
                  <div className="absolute top-0 right-4 px-3 py-1 bg-[#131b2e] text-white text-[11px] rounded-lg shadow-md animate-fadeIn pointer-events-none">
                    {activeBarHover}
                  </div>
                )}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 160">
                  {/* Gridlines */}
                  <line className="text-[#e2e7ff]" stroke="currentColor" strokeDasharray="3 3" x1="40" x2="680" y1="20" y2="20" />
                  <line className="text-[#e2e7ff]" stroke="currentColor" strokeDasharray="3 3" x1="40" x2="680" y1="65" y2="65" />
                  <line className="text-[#e2e7ff]" stroke="currentColor" strokeDasharray="3 3" x1="40" x2="680" y1="110" y2="110" />
                  <line className="text-[#dae2fd]" stroke="currentColor" x1="40" x2="680" y1="140" y2="140" />

                  {/* Y Axis labels */}
                  <text className="fill-[#3d4947] text-[10px] font-mono" x="5" y="24">₹16k</text>
                  <text className="fill-[#3d4947] text-[10px] font-mono" x="5" y="69">₹10k</text>
                  <text className="fill-[#3d4947] text-[10px] font-mono" x="12" y="114">₹5k</text>

                  {/* Month 1: May (Jaipur) */}
                  <g
                    className="cursor-pointer group"
                    transform="translate(80, 0)"
                    onMouseEnter={() => setActiveBarHover('May: ₹8,900 (Jaipur Palace Tour)')}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    <rect className="fill-[#dae2fd] transition-opacity group-hover:opacity-80" height="55" rx="4" width="28" x="0" y="85" />
                    <rect className="fill-[#fd761a] transition-opacity group-hover:opacity-80" height="30" rx="4" width="28" x="0" y="55" />
                    <rect className="fill-[#00685f] transition-opacity group-hover:opacity-80" height="27" rx="4" width="28" x="0" y="28" />
                    <text className="fill-[#3d4947] text-[11px] font-medium" textAnchor="middle" x="14" y="156">May</text>
                  </g>

                  {/* Month 2: Jun */}
                  <g
                    className="cursor-pointer group"
                    transform="translate(180, 0)"
                    onMouseEnter={() => setActiveBarHover('June: ₹3,100 (Local Weekend Hikes)')}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    <rect className="fill-[#dae2fd] transition-opacity group-hover:opacity-80" height="25" rx="4" width="28" x="0" y="115" />
                    <rect className="fill-[#fd761a] transition-opacity group-hover:opacity-80" height="15" rx="4" width="28" x="0" y="100" />
                    <rect className="fill-[#00685f] transition-opacity group-hover:opacity-80" height="20" rx="4" width="28" x="0" y="80" />
                    <text className="fill-[#3d4947] text-[11px] font-medium" textAnchor="middle" x="14" y="156">Jun</text>
                  </g>

                  {/* Month 3: Jul (Manali) */}
                  <g
                    className="cursor-pointer group"
                    transform="translate(280, 0)"
                    onMouseEnter={() => setActiveBarHover('July: ₹14,200 (Manali High Pass Trek)')}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    <rect className="fill-[#dae2fd] transition-opacity group-hover:opacity-80" height="50" rx="4" width="28" x="0" y="90" />
                    <rect className="fill-[#fd761a] transition-opacity group-hover:opacity-80" height="30" rx="4" width="28" x="0" y="60" />
                    <rect className="fill-[#00685f] transition-opacity group-hover:opacity-80" height="45" rx="4" width="28" x="0" y="15" />
                    <text className="fill-[#131b2e] text-[11px] font-bold" textAnchor="middle" x="14" y="156">Jul</text>
                  </g>

                  {/* Month 4: Aug */}
                  <g
                    className="cursor-pointer group"
                    transform="translate(380, 0)"
                    onMouseEnter={() => setActiveBarHover('August: ₹2,800 (Monsoon Staycation)')}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    <rect className="fill-[#dae2fd] transition-opacity group-hover:opacity-80" height="15" rx="4" width="28" x="0" y="125" />
                    <rect className="fill-[#fd761a] transition-opacity group-hover:opacity-80" height="15" rx="4" width="28" x="0" y="110" />
                    <rect className="fill-[#00685f] transition-opacity group-hover:opacity-80" height="15" rx="4" width="28" x="0" y="95" />
                    <text className="fill-[#3d4947] text-[11px] font-medium" textAnchor="middle" x="14" y="156">Aug</text>
                  </g>

                  {/* Month 5: Sep (Kolkata) */}
                  <g
                    className="cursor-pointer group"
                    transform="translate(480, 0)"
                    onMouseEnter={() => setActiveBarHover('September: ₹5,550 (Kolkata Heritage Trail)')}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    <rect className="fill-[#dae2fd] transition-opacity group-hover:opacity-80" height="35" rx="4" width="28" x="0" y="105" />
                    <rect className="fill-[#fd761a] transition-opacity group-hover:opacity-80" height="30" rx="4" width="28" x="0" y="75" />
                    <rect className="fill-[#00685f] transition-opacity group-hover:opacity-80" height="20" rx="4" width="28" x="0" y="55" />
                    <text className="fill-[#3d4947] text-[11px] font-medium" textAnchor="middle" x="14" y="156">Sep</text>
                  </g>

                  {/* Month 6: Oct (Varanasi - Forecast) */}
                  <g
                    className="cursor-pointer group"
                    transform="translate(580, 0)"
                    onMouseEnter={() => setActiveBarHover('October (est): ₹12,400 (Varanasi Expedition)')}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    <rect className="fill-[#dae2fd]/70 stroke-dashed transition-opacity group-hover:opacity-80" height="45" rx="4" width="28" x="0" y="95" />
                    <rect className="fill-[#fd761a]/80 transition-opacity group-hover:opacity-80" height="30" rx="4" width="28" x="0" y="65" />
                    <rect className="fill-[#00685f]/80 transition-opacity group-hover:opacity-80" height="35" rx="4" width="28" x="0" y="30" />
                    <text className="fill-[#00685f] text-[11px] font-bold" textAnchor="middle" x="14" y="156">Oct (est)</text>
                  </g>
                </svg>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-3 py-1 rounded-full bg-[#eaedff] text-[11px] font-bold uppercase text-[#3d4947]">
                  Top Category: Accommodation (44%)
                </span>
                <span className="px-3 py-1 rounded-full bg-[#eaedff] text-[11px] font-bold uppercase text-[#3d4947]">
                  Lowest Expense: Transit in Kolkata (₹920)
                </span>
                <span className="px-3 py-1 rounded-full bg-[#eaedff] text-[11px] font-bold uppercase text-[#006947]">
                  18% under national traveler benchmark
                </span>
              </div>
            </div>

            {/* Travel Journal & Public Guides Showcase */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#e2fced] text-[#006947]">
                      <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                    </span>
                    <h3 className="text-[20px] font-bold text-[#131b2e]">Travel Journal &amp; Public Guider</h3>
                  </div>
                  <p className="text-[12.5px] text-[#3d4947] mt-0.5">
                    Collect memories wherever you went, log live travels, and discover public guides to make your next trip happen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('journal', 'push')}
                  className="px-4 py-1.5 bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                >
                  <span>View All Guides</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>

              {/* 2 Featured Journal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Guide 1: Kharagpur to Medinipur */}
                <div className="rounded-2xl border border-[#eaedff] bg-[#faf8ff] p-4 flex flex-col justify-between hover:shadow-md transition-all group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-[#131b2e] text-white text-[10px] font-bold uppercase tracking-wider">
                        🕰️ Past Journey
                      </span>
                      <span className="text-[11px] font-semibold text-[#00685f] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">train</span>
                        Rupashi Bangla (12883)
                      </span>
                    </div>

                    <h4
                      onClick={() => onNavigate('journal', 'push')}
                      className="font-bold text-[15px] text-[#131b2e] group-hover:text-[#00685f] transition-colors cursor-pointer line-clamp-1"
                    >
                      Kharagpur to Medinipur Rail &amp; Freedom Trail
                    </h4>

                    <p className="text-[12.5px] text-[#3d4947] line-clamp-2">
                      18-minute scenic rail crossing across the Kangsabati river, Gopegarh Eco-Park fort ruins, and warm Chhana-boda.
                    </p>

                    <div className="text-[11.5px] text-[#9d4300] font-semibold flex items-center gap-1">
                      <span>🍴 Must Eat: Authentic Medinipur Chhana-boda</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#eaedff] flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#006947]">₹1,850 Spent</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('journal', 'push')}
                      className="text-[12px] font-bold text-[#00685f] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Guide 2: Varanasi Dawn */}
                <div className="rounded-2xl border border-[#eaedff] bg-[#faf8ff] p-4 flex flex-col justify-between hover:shadow-md transition-all group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-[#00a86b] text-white text-[10px] font-bold uppercase tracking-wider">
                        ⚡ Live Log
                      </span>
                      <span className="text-[11px] font-semibold text-[#00685f] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">sailing</span>
                        Assi Ghat Sunrise
                      </span>
                    </div>

                    <h4
                      onClick={() => onNavigate('journal', 'push')}
                      className="font-bold text-[15px] text-[#131b2e] group-hover:text-[#00685f] transition-colors cursor-pointer line-clamp-1"
                    >
                      Dawn Rowing Past Manikarnika &amp; Morning Aarti
                    </h4>

                    <p className="text-[12.5px] text-[#3d4947] line-clamp-2">
                      Rowing into the blue mist on the sacred Ganga at 5:00 AM while temple bells resonate and incense drifts.
                    </p>

                    <div className="text-[11.5px] text-[#9d4300] font-semibold flex items-center gap-1">
                      <span>🍴 Must Eat: Kachori Sabzi &amp; Jalebi at Ram Bhandar</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#eaedff] flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#006947]">Live Log • Today</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('journal', 'push')}
                      className="text-[12px] font-bold text-[#00685f] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Traveler Motto Callout */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#131b2e] to-[#004d46] text-white flex items-center justify-between gap-3 text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#89f5e7] text-[18px]">format_quote</span>
                  <span className="font-semibold italic">
                    “Life goes on. Life is too short, so make this trip happen!”
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('journal', 'push')}
                  className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11.5px] transition-colors cursor-pointer shrink-0"
                >
                  Write Your Entry →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8 min-w-0">
            {/* AI Recommendation of the Day */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#008378] to-[#00685f] p-6 text-white shadow-md">
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-[#89f5e7]/20 backdrop-blur-xs text-[#89f5e7] text-[11px] font-bold uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">auto_awesome</span> AI Recommendation
                  </span>
                  <span className="text-[12px] text-white/80">Updated today</span>
                </div>
                <div>
                  <h4 className="text-[20px] font-bold text-white">Gokarna Sunset Cliffs</h4>
                  <p className="text-[14px] text-[#89f5e7] mt-1">
                    "Less crowded than Goa with pristine coastal trails, sacred beach walks, and direct night sleeper train access."
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white/90 text-[12px]">
                    <span className="material-symbols-outlined text-[16px]">thermostat</span>
                    <span>28°C Optimal</span>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('planner', 'push');
                    }}
                    className="px-4 py-1.5 bg-white text-[#00685f] hover:bg-[#e2e7ff] rounded-xl font-semibold text-[13px] transition-transform active:scale-95 cursor-pointer shadow-xs"
                  >
                    Explore Route
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-[#89f5e7]/20 blur-2xl pointer-events-none"></div>
            </div>

            {/* Annual Goals 2027 Tracker Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9d4300] text-[22px]">flag</span>
                  <h4 className="text-[20px] font-semibold text-[#131b2e]">2027 Goals</h4>
                </div>
                <button
                  onClick={() => onNavigate('goals', 'none')}
                  className="text-[#00685f] hover:text-[#008378] text-[12px] font-semibold cursor-pointer"
                >
                  View All Goals →
                </button>
              </div>

              <div className="space-y-4">
                {/* Goal 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#131b2e] font-medium">Trips Planned</span>
                    <span className="text-[#00685f] font-bold">3 / 5 completed</span>
                  </div>
                  <div className="w-full bg-[#f2f3ff] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#00685f] h-full rounded-full w-[60%]"></div>
                  </div>
                </div>

                {/* Goal 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#131b2e] font-medium">Travel Fund Saved</span>
                    <span className="text-[#006947] font-bold">₹15,000 / ₹25,000</span>
                  </div>
                  <div className="w-full bg-[#f2f3ff] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#006947] h-full rounded-full w-[60%]"></div>
                  </div>
                </div>

                {/* Goal 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#131b2e] font-medium">Solo Expeditions Target</span>
                    <span className="text-[#9d4300] font-bold">1 accomplished</span>
                  </div>
                  <div className="w-full bg-[#f2f3ff] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#fd761a] h-full rounded-full w-[50%]"></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-xl flex items-center justify-between text-[#3d4947] text-[12px]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#006947] text-[16px]">celebration</span>
                  <span>Next milestone: Varanasi solo badge!</span>
                </span>
              </div>
            </div>

            {/* Recent Community Requests */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f] text-[22px]">forum</span>
                  <h4 className="text-[20px] font-semibold text-[#131b2e]">Community Feed</h4>
                </div>
                <button
                  onClick={() => onNavigate('community', 'none')}
                  className="text-[#00685f] hover:text-[#008378] text-[12px] font-semibold cursor-pointer"
                >
                  Explore Feed →
                </button>
              </div>

              {/* Request Item 1 */}
              <div className="p-4 rounded-xl bg-[#f2f3ff]/70 space-y-2 border border-[#eaedff]/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] uppercase text-[#9d4300] font-bold">Live Request</span>
                    <span className="w-1 h-1 rounded-full bg-[#bcc9c6]"></span>
                    <span className="text-[12px] text-[#3d4947]">2 mins ago</span>
                  </div>
                </div>
                <p className="text-[14px] text-[#131b2e] font-medium leading-snug">
                  "Need local street food guide &amp; secret kathi roll spots in North Kolkata!"
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[#3d4947] text-[12px]">
                    <span className="material-symbols-outlined text-[15px]">person</span>
                    <span>Priya S. (Traveler)</span>
                  </div>
                  <button
                    onClick={() => alert('Reply sent to Priya S.: "Check out Nizam Heritage and Kusum Rolls near Park Street!"')}
                    className="px-3 py-1 bg-[#eaedff] text-[#00685f] hover:bg-[#00685f] hover:text-white rounded-lg font-semibold text-[12px] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Help Explorer</span>
                    <span className="material-symbols-outlined text-[14px]">send</span>
                  </button>
                </div>
              </div>

              {/* Request Item 2 */}
              <div className="p-4 rounded-xl bg-[#f2f3ff]/70 space-y-2 border border-[#eaedff]/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] uppercase text-[#3d4947] font-semibold">Discussion</span>
                    <span className="w-1 h-1 rounded-full bg-[#bcc9c6]"></span>
                    <span className="text-[12px] text-[#3d4947]">42 mins ago</span>
                  </div>
                </div>
                <p className="text-[14px] text-[#131b2e] leading-snug">
                  "Is the Hampta Pass trek passable with medium snow in early November?"
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[#3d4947] text-[12px]">
                    <span className="material-symbols-outlined text-[15px]">forum</span>
                    <span>6 responses</span>
                  </div>
                  <button
                    onClick={() => alert('Discussion Thread: 4 guides report moderate snow; microspikes recommended.')}
                    className="text-[#00685f] text-[12px] font-semibold cursor-pointer hover:underline"
                  >
                    Read thread
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Badges Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fd761a] text-[22px]">military_tech</span>
                  <h4 className="text-[20px] font-semibold text-[#131b2e]">Recent Badges</h4>
                </div>
                <button
                  onClick={() => onNavigate('achievements', 'none')}
                  className="text-[#00685f] hover:text-[#008378] text-[12px] font-semibold cursor-pointer"
                >
                  All Badges →
                </button>
              </div>

              <div className="space-y-3">
                {/* Achievement 1: Budget Master */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f2f3ff]/60 hover:bg-[#f2f3ff] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#00855b]/20 text-[#006947] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">savings</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-[#131b2e] truncate">Budget Master</span>
                      <span className="text-[12px] text-[#006947] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">check</span> Unlocked
                      </span>
                    </div>
                    <p className="text-[12px] text-[#3d4947] truncate">Kept 3 consecutive trips under budget limit</p>
                  </div>
                </div>

                {/* Achievement 2: Heritage Seeker */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f2f3ff]/60 hover:bg-[#f2f3ff] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdbca]/60 text-[#9d4300] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">temple_hindu</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-[#131b2e] truncate">Heritage Seeker</span>
                      <span className="text-[12px] text-[#9d4300] font-bold">3 / 4 visits</span>
                    </div>
                    <p className="text-[12px] text-[#3d4947] truncate">Explore 4 UNESCO heritage monuments</p>
                    <div className="w-full bg-[#e2e7ff] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-[#fd761a] h-full rounded-full w-[75%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00685f]">
                <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                <h3 className="font-bold text-[18px]">Offline Travel Pass (PDF)</h3>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-[#3d4947] hover:text-[#131b2e] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-4 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] space-y-1">
              <p className="font-semibold">Varanasi Cultural &amp; Ghats Expedition</p>
              <p className="text-[#3d4947]">Includes offline QR codes for Assi Ghat boat booking, train PNR, emergency emergency contacts, and daily offline walking maps.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 rounded-xl text-[#3d4947] hover:bg-[#f2f3ff] text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadHeroPdf}
                disabled={isDownloadingPdf}
                className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isDownloadingPdf ? 'hourglass_top' : 'picture_as_pdf'}
                </span>
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Formatted PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
