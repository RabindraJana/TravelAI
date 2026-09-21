import React, { useState } from 'react';
import { TripItem, TripSummary } from '../types';
import {
  SummaryStyle,
  copyTripSummaryToClipboard,
} from '../utils/tripSummaryGenerator';
import { generateTripItineraryPdf } from '../utils/pdfGenerator';
import { TripWeatherForecast } from './TripWeatherForecast';
import { PackingChecklist } from './PackingChecklist';

interface TripSummaryCardProps {
  trip: TripItem;
  summary: TripSummary;
  onViewItinerary: (trip: TripItem) => void;
  onPlanTrip: (origin: string, destination: string) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onRegenerateStyle?: (tripId: string, style: SummaryStyle) => void;
}

export const TripSummaryCard: React.FC<TripSummaryCardProps> = ({
  trip,
  summary,
  onViewItinerary,
  onPlanTrip,
  onShowToast,
  onRegenerateStyle,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<SummaryStyle>('concise');
  const [readiness, setReadiness] = useState(summary.readinessPercentage);

  const handleProgressUpdate = (done: number, total: number) => {
    if (total > 0) {
      setReadiness(Math.round((done / total) * 100));
    }
  };

  const handleShare = async () => {
    const success = await copyTripSummaryToClipboard(trip, summary);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onShowToast) {
        onShowToast(
          'Trip Summary Copied',
          `Summary for ${summary.primaryDestination.split(',')[0]} copied to clipboard! Ready to share.`,
          'success'
        );
      }
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const success = await generateTripItineraryPdf(trip, summary);
      if (success) {
        setPdfDownloaded(true);
        setTimeout(() => setPdfDownloaded(false), 3000);
        if (onShowToast) {
          onShowToast(
            'Offline PDF Downloaded',
            `Formatted PDF itinerary for ${trip.title} saved to downloads!`,
            'success'
          );
        }
      }
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleStyleSwitch = (style: SummaryStyle) => {
    setCurrentStyle(style);
    if (onRegenerateStyle) {
      onRegenerateStyle(trip.id, style);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eaedff] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner with Image thumbnail, Destination & Dates */}
      <div className="p-5 pb-4 border-b border-[#eaedff]/70 bg-gradient-to-br from-[#faf8ff] to-white">
        <div className="flex items-start justify-between gap-3">
          {/* Destination & Title */}
          <div className="flex-1 min-w-0">
            {/* Primary Destination Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00685f]/10 text-[#00685f] text-[11px] font-bold tracking-wide uppercase mb-2">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span className="truncate">Primary Destination</span>
            </div>

            <h3 className="text-[17px] font-bold text-[#131b2e] leading-snug truncate group-hover:text-[#00685f] transition-colors">
              {summary.primaryDestination}
            </h3>
            <p className="text-[12px] text-[#3d4947] mt-0.5 line-clamp-1 italic">
              {summary.destinationTagline}
            </p>
          </div>

          {/* Status Badge, PDF Download, Share Action & Image Avatar */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className={`p-1 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                  pdfDownloaded
                    ? 'bg-[#00855b] text-white border-[#00855b]'
                    : 'bg-white/90 hover:bg-[#eaedff] text-[#3d4947] hover:text-[#00685f] border-[#eaedff]'
                }`}
                title="Download formatted PDF version of itinerary for offline access"
                aria-label="Download offline PDF itinerary"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {downloadingPdf ? 'hourglass_top' : pdfDownloaded ? 'check' : 'picture_as_pdf'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className={`p-1 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                  copied
                    ? 'bg-[#00855b] text-white border-[#00855b]'
                    : 'bg-white/90 hover:bg-[#eaedff] text-[#3d4947] hover:text-[#00685f] border-[#eaedff]'
                }`}
                title="Share trip summary to clipboard"
                aria-label="Share trip summary"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'share'}
                </span>
              </button>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  trip.status === 'upcoming'
                    ? 'bg-[#00685f]/15 text-[#00685f]'
                    : trip.status === 'completed'
                    ? 'bg-[#131b2e]/10 text-[#131b2e]'
                    : 'bg-[#9d4300]/15 text-[#9d4300]'
                }`}
              >
                {trip.status}
              </span>
            </div>
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs"
            />
          </div>
        </div>

        {/* Key Dates Highlight Box */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-white border border-[#eaedff] flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-[#00685f]/10 text-[#00685f] shrink-0">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3d4947] block">
                Key Dates &amp; Duration
              </span>
              <span className="text-[12px] font-bold text-[#131b2e] block truncate">
                {summary.keyDates}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-medium text-[#00685f] bg-[#00685f]/5 px-2 py-0.5 rounded-md shrink-0 border border-[#00685f]/15">
            {summary.durationText}
          </span>
        </div>
      </div>

      {/* Auto-Generated Concise Summary Narrative */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#9d4300]">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>AI Summary (Auto-Generated)</span>
            </span>

            {/* Summary Style Switcher */}
            <div className="inline-flex rounded-lg bg-[#f2f3ff] p-0.5 border border-[#eaedff] text-[10px]">
              {(
                [
                  { id: 'concise', label: 'Brief' },
                  { id: 'highlights', label: 'Stops' },
                  { id: 'executive', label: 'Logistics' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStyleSwitch(s.id)}
                  className={`px-1.5 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                    currentStyle === s.id
                      ? 'bg-white text-[#00685f] shadow-2xs'
                      : 'text-[#3d4947] hover:text-[#131b2e]'
                  }`}
                  title={`Switch to ${s.label} view`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[12.5px] text-[#131b2e] leading-relaxed relative">
            <p>{summary.conciseSummary}</p>
          </div>
        </div>

        {/* Quick Highlights / Waypoints chips */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#3d4947] block mb-1.5">
            Key Landmarks &amp; Corridors
          </span>
          <div className="flex flex-wrap gap-1.5">
            {summary.highlights.map((wp) => (
              <span
                key={wp}
                className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[#131b2e] text-[11px] font-medium border border-[#eaedff]"
              >
                📍 {wp}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-md bg-[#ffdbca]/40 text-[#9d4300] text-[11px] font-medium border border-[#ffdbca]">
              {summary.transitSummary.split('via ')[1] || 'Transit'}
            </span>
          </div>
        </div>

        {/* 7-Day Destination Weather Forecast */}
        <TripWeatherForecast
          destination={trip.destination}
          primaryDestinationName={trip.primaryDestination || summary.primaryDestination}
          tripDates={summary.keyDates}
        />

        {/* Smart Weather & Trip-Type Packing Checklist */}
        <PackingChecklist
          trip={trip}
          onShowToast={onShowToast}
          onProgressUpdate={handleProgressUpdate}
        />

        {/* Status Metrics Bar (Readiness & Budget) */}
        <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between text-[11.5px]">
          <div>
            <span className="text-[#3d4947] text-[10px] block uppercase font-bold">Allocated Budget</span>
            <span className="font-bold text-[#131b2e]">{summary.budgetSummary}</span>
          </div>
          <div className="text-right">
            <span className="text-[#3d4947] text-[10px] block uppercase font-bold">Gear Readiness</span>
            <span className="font-bold text-[#00685f]">{readiness}% Prepared</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className={`py-2 px-2.5 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              copied
                ? 'bg-[#00855b] text-white border-[#00855b]'
                : 'bg-white hover:bg-[#f2f3ff] text-[#131b2e] border-[#eaedff]'
            }`}
            title="Share trip summary to clipboard"
            aria-label="Share trip summary"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'share'}
            </span>
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className={`py-2 px-2.5 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              pdfDownloaded
                ? 'bg-[#00855b] text-white border-[#00855b]'
                : 'bg-white hover:bg-[#f2f3ff] text-[#00685f] border-[#eaedff]'
            }`}
            title="Download formatted PDF version of itinerary for offline access while traveling"
            aria-label="Download offline PDF itinerary"
          >
            <span className="material-symbols-outlined text-[15px]">
              {downloadingPdf ? 'hourglass_top' : pdfDownloaded ? 'check' : 'picture_as_pdf'}
            </span>
            <span>{downloadingPdf ? 'Saving...' : pdfDownloaded ? 'Saved!' : 'PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => onViewItinerary(trip)}
            className="flex-1 py-2 px-2.5 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] font-semibold rounded-xl text-[12px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            <span>Details</span>
          </button>

          <button
            type="button"
            onClick={() => onPlanTrip(trip.origin, trip.destination)}
            className="py-2 px-3 bg-[#00685f] hover:bg-[#008378] text-white font-semibold rounded-xl text-[12px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Optimize in AI Planner"
          >
            <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            <span>Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
