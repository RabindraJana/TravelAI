import React, { useState } from 'react';
import { TravelBadge, TravelLevelInfo, TripItem, ScreenType } from '../types';
import { toggleTripCompletionStatus } from '../utils/tripStorage';

interface TravelLevelsSectionProps {
  levelInfo: TravelLevelInfo;
  storedTrips: TripItem[];
  onTripStatusChanged: () => void;
  onNavigate: (screen: ScreenType) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const TravelLevelsSection: React.FC<TravelLevelsSectionProps> = ({
  levelInfo,
  storedTrips,
  onTripStatusChanged,
  onNavigate,
  onShowToast,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<TravelBadge | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [showTripsManager, setShowTripsManager] = useState(false);

  const filteredBadges = levelInfo.allBadges.filter((badge) => {
    if (activeTab === 'unlocked') return badge.unlocked;
    if (activeTab === 'locked') return !badge.unlocked;
    return true;
  });

  const getTierStyles = (tier: TravelBadge['tier'], unlocked: boolean) => {
    if (!unlocked) {
      return {
        bg: 'bg-[#f0f2fc]/70',
        border: 'border-[#d8def5]',
        badgeBg: 'bg-[#e2e7ff]',
        text: 'text-[#5a6578]',
        glow: '',
        pill: 'bg-[#e2e7ff] text-[#5a6578]',
      };
    }
    switch (tier) {
      case 'bronze':
        return {
          bg: 'bg-gradient-to-br from-[#fff7f0] to-[#fef1e5]',
          border: 'border-[#e8c09a]',
          badgeBg: 'bg-[#9d4300] text-white',
          text: 'text-[#9d4300]',
          glow: 'shadow-[0_4px_20px_rgba(157,67,0,0.15)]',
          pill: 'bg-[#ffdbca] text-[#9d4300]',
        };
      case 'silver':
        return {
          bg: 'bg-gradient-to-br from-[#f6f8fd] to-[#ebf1fc]',
          border: 'border-[#b5c7e8]',
          badgeBg: 'bg-[#00685f] text-white',
          text: 'text-[#00685f]',
          glow: 'shadow-[0_4px_20px_rgba(0,104,95,0.18)]',
          pill: 'bg-[#89f5e7]/30 text-[#00685f]',
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-[#fffdf0] to-[#fef9d9]',
          border: 'border-[#e4ce6d]',
          badgeBg: 'bg-[#d97706] text-white',
          text: 'text-[#b45309]',
          glow: 'shadow-[0_4px_20px_rgba(217,119,6,0.2)]',
          pill: 'bg-[#fef3c7] text-[#92400e]',
        };
      case 'platinum':
        return {
          bg: 'bg-gradient-to-br from-[#f4faff] to-[#e6f3fd]',
          border: 'border-[#9ec9eb]',
          badgeBg: 'bg-[#0284c7] text-white',
          text: 'text-[#0284c7]',
          glow: 'shadow-[0_4px_20px_rgba(2,132,199,0.22)]',
          pill: 'bg-[#e0f2fe] text-[#0369a1]',
        };
      case 'diamond':
        return {
          bg: 'bg-gradient-to-br from-[#f8f5ff] to-[#efeaff]',
          border: 'border-[#c7b7f7]',
          badgeBg: 'bg-[#7c3aed] text-white',
          text: 'text-[#7c3aed]',
          glow: 'shadow-[0_4px_24px_rgba(124,58,237,0.25)]',
          pill: 'bg-[#ede9fe] text-[#6d28d9]',
        };
    }
  };

  const handleToggleTrip = (trip: TripItem) => {
    const nextCompleted = trip.status !== 'completed';
    toggleTripCompletionStatus(trip.id);
    onTripStatusChanged();

    if (onShowToast) {
      if (nextCompleted) {
        onShowToast(
          'Trip Marked Completed!',
          `"${trip.title}" added to your completed expeditions. Travel Level updated!`,
          'success'
        );
      } else {
        onShowToast(
          'Trip Status Changed',
          `"${trip.title}" moved to upcoming journeys.`,
          'info'
        );
      }
    }
  };

  const completedCount = levelInfo.completedTripsCount;
  const currentTierStyles = getTierStyles('silver', true);

  return (
    <section
      id="travel-levels-section"
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#eaedff] relative overflow-hidden space-y-6"
    >
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00685f]/5 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />

      {/* Header with Title and Level summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#e6f4f2] text-[#00685f]">
              <span className="material-symbols-outlined text-[24px]">military_tech</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[22px] font-bold text-[#131b2e] tracking-tight">Travel Levels &amp; Badges</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00685f] text-white text-[12px] font-semibold">
                  Level {levelInfo.level}
                </span>
              </div>
              <p className="text-[13px] text-[#3d4947]">
                Badges automatically awarded based on completed trips stored in your account.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowTripsManager((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#eaedff] bg-[#f8f9ff] hover:bg-[#eef2ff] text-[#131b2e] text-[13px] font-semibold transition-colors cursor-pointer"
            title="Manage which trips are counted as completed"
          >
            <span className="material-symbols-outlined text-[18px] text-[#00685f]">
              {showTripsManager ? 'expand_less' : 'checklist'}
            </span>
            <span>{showTripsManager ? 'Hide Trip List' : `Manage Trips (${completedCount} Done)`}</span>
          </button>
          <button
            onClick={() => onNavigate('trips')}
            className="text-[#00685f] hover:text-[#008378] text-[13px] font-semibold flex items-center gap-1 px-3 py-2 cursor-pointer"
          >
            <span>All Trips</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Level Banner Card */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#004d46] via-[#00685f] to-[#008378] p-6 text-white shadow-md overflow-hidden">
        {/* Subtle patterned circles in background */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute top-2 right-1/4 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Current Level Rank Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[36px] text-[#89f5e7]">
                {levelInfo.badgeIcon || 'military_tech'}
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#89f5e7]">
                  {levelInfo.rankTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-medium text-white">
                  Tier Rank
                </span>
              </div>
              <h3 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                {levelInfo.title}
              </h3>
              <p className="text-[13px] text-white/80">
                You have verified <strong className="text-white font-bold">{completedCount}</strong> completed {completedCount === 1 ? 'trip' : 'trips'} stored in the app.
              </p>
            </div>
          </div>

          {/* Level Progress Stats */}
          <div className="md:min-w-[280px] bg-black/20 backdrop-blur-xs rounded-xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-white/80 font-medium">Next Milestone</span>
              <span className="text-[#89f5e7] font-bold">
                {levelInfo.tripsToNextLevel > 0
                  ? `${levelInfo.tripsToNextLevel} more ${levelInfo.tripsToNextLevel === 1 ? 'trip' : 'trips'} needed`
                  : 'Max Level Mastered!'}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#89f5e7] to-[#ffffff] h-full rounded-full transition-all duration-700"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/75 pt-0.5">
              <span>{levelInfo.completedTripsCount} completed</span>
              <span>Goal: {levelInfo.nextLevelMinTrips} trips</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Trip Completion Manager Accordion */}
      {showTripsManager && (
        <div className="bg-[#f8f9ff] rounded-xl p-5 border border-[#eaedff] space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00685f] text-[20px]">tune</span>
              <h4 className="text-[15px] font-bold text-[#131b2e]">
                Completed Trips Calculator ({completedCount} counted)
              </h4>
            </div>
            <span className="text-[12px] text-[#5a6578]">
              Toggle trips below to see badges dynamically update
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {storedTrips.map((trip) => {
              const isCompleted = trip.status === 'completed';
              return (
                <div
                  key={trip.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    isCompleted
                      ? 'bg-white border-[#00685f]/30 shadow-xs'
                      : 'bg-white/60 border-[#eaedff] opacity-80'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#131b2e] truncate">{trip.title}</p>
                    <p className="text-[11px] text-[#5a6578]">
                      {trip.destination} • {trip.startDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleTrip(trip)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-[#e6f7f2] text-[#00685f] hover:bg-[#d0f0e7]'
                        : 'bg-[#eaedff] text-[#3d4947] hover:bg-[#dae2fd]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs & Badges Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#131b2e]">Earned Badges</span>
          <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[#00685f] text-[12px] font-bold">
            {levelInfo.unlockedBadges.length} / {levelInfo.allBadges.length} Unlocked
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#f2f3ff] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-[#131b2e] shadow-xs'
                : 'text-[#5a6578] hover:text-[#131b2e]'
            }`}
          >
            All ({levelInfo.allBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
              activeTab === 'unlocked'
                ? 'bg-white text-[#00685f] shadow-xs'
                : 'text-[#5a6578] hover:text-[#131b2e]'
            }`}
          >
            Unlocked ({levelInfo.unlockedBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
              activeTab === 'locked'
                ? 'bg-white text-[#9d4300] shadow-xs'
                : 'text-[#5a6578] hover:text-[#131b2e]'
            }`}
          >
            In Progress ({levelInfo.allBadges.length - levelInfo.unlockedBadges.length})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const styles = getTierStyles(badge.tier, badge.unlocked);
          const isSelected = selectedBadge?.id === badge.id;
          const progressCount = Math.min(completedCount, badge.requiredCompletedTrips);

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
                styles.bg
              } ${styles.border} ${styles.glow} ${
                isSelected ? 'ring-2 ring-[#00685f]' : 'hover:translate-y-[-2px]'
              }`}
            >
              {/* Card top row */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${styles.badgeBg}`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {badge.unlocked ? badge.icon : 'lock'}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${styles.pill}`}>
                    {badge.tier}
                  </span>
                  {badge.unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] text-[#006947] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Earned</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#5a6578] font-medium">
                      {progressCount} / {badge.requiredCompletedTrips} trips
                    </span>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="mt-3 space-y-1">
                <h4 className="text-[16px] font-bold text-[#131b2e] leading-snug group-hover:text-[#00685f] transition-colors">
                  {badge.name}
                </h4>
                <p className="text-[12px] text-[#3d4947] line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress bar if locked */}
              {!badge.unlocked && (
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-[#dae2fd]/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00685f] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((progressCount / badge.requiredCompletedTrips) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-[#5a6578] flex items-center justify-between">
                    <span>Target: {badge.criteria}</span>
                    <span>{badge.requiredCompletedTrips - progressCount} more to unlock</span>
                  </p>
                </div>
              )}

              {/* Perk highlight */}
              {badge.unlocked && (
                <div className="mt-3 pt-2.5 border-t border-[#eaedff] flex items-center gap-1.5 text-[11px] text-[#00685f] font-medium">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span className="truncate">{badge.perk}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Badge Modal / Drawer */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[32px]">{selectedBadge.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#e2e7ff] text-[#00685f] text-[11px] font-bold uppercase">
                      {selectedBadge.tier} Tier
                    </span>
                    {selectedBadge.unlocked && (
                      <span className="text-[11px] font-semibold text-[#006947] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span> Unlocked
                      </span>
                    )}
                  </div>
                  <h3 className="text-[20px] font-bold text-[#131b2e] mt-0.5">{selectedBadge.name}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1 rounded-lg text-[#5a6578] hover:text-[#131b2e] hover:bg-[#f0f2fc] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 bg-[#f8f9ff] p-4 rounded-xl text-[13px]">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#5a6578] tracking-wider block">Description</span>
                <p className="text-[#131b2e] font-medium mt-0.5">{selectedBadge.description}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-[#5a6578] tracking-wider block">Unlock Criteria</span>
                <p className="text-[#131b2e] font-medium mt-0.5">{selectedBadge.criteria} (Currently: {completedCount} completed)</p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-[#5a6578] tracking-wider block">Explorer Perk</span>
                <p className="text-[#00685f] font-semibold mt-0.5">{selectedBadge.perk}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
