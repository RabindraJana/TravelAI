import React, { useState } from 'react';

export type TimeframeFilter = 'all' | 'future' | 'past' | 'draft';

export interface TripFilterState {
  searchQuery: string;
  timeframe: TimeframeFilter;
  destination: string;
  monthYear: string;
  startDate: string;
  endDate: string;
}

interface TripSearchFilterBarProps {
  filters: TripFilterState;
  onChangeFilters: (filters: TripFilterState) => void;
  onResetFilters: () => void;
  totalTripsCount: number;
  filteredCount: number;
  destinationsList: { key: string; label: string }[];
}

export const TripSearchFilterBar: React.FC<TripSearchFilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalTripsCount,
  filteredCount,
  destinationsList,
}) => {
  const [showAdvancedDate, setShowAdvancedDate] = useState(false);

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.timeframe !== 'all' ||
    filters.destination !== 'all' ||
    filters.monthYear !== 'all' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  const handleSearchChange = (val: string) => {
    onChangeFilters({ ...filters, searchQuery: val });
  };

  const handleTimeframeChange = (timeframe: TimeframeFilter) => {
    onChangeFilters({ ...filters, timeframe });
  };

  const handleDestinationChange = (destination: string) => {
    onChangeFilters({ ...filters, destination });
  };

  const handleMonthYearChange = (monthYear: string) => {
    onChangeFilters({ ...filters, monthYear, startDate: '', endDate: '' });
  };

  const handleStartDateChange = (startDate: string) => {
    onChangeFilters({ ...filters, startDate, monthYear: 'all' });
  };

  const handleEndDateChange = (endDate: string) => {
    onChangeFilters({ ...filters, endDate, monthYear: 'all' });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eaedff] shadow-xs p-4 sm:p-5 mb-6 space-y-4">
      {/* Top Main Bar: Search + Timeframe + Destination + Date */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input (Col 5) */}
        <div className="md:col-span-5 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[20px] text-[#3d4947]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by destination, trip title, stops, or route..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-9 bg-[#faf8ff] hover:bg-white focus:bg-white border border-[#eaedff] rounded-xl text-[13px] text-[#131b2e] placeholder-[#3d4947]/70 focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-2.5 text-[#3d4947] hover:text-[#131b2e] cursor-pointer"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Timeframe Selector: Past / Future / Draft (Col 3) */}
        <div className="md:col-span-3 relative">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#00685f] pointer-events-none">
              schedule
            </span>
            <select
              value={filters.timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value as TimeframeFilter)}
              className="w-full h-11 pl-9 pr-8 bg-[#faf8ff] hover:bg-white border border-[#eaedff] rounded-xl text-[13px] font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 cursor-pointer appearance-none transition-colors"
            >
              <option value="all">🌐 All Horizons (Past &amp; Future)</option>
              <option value="future">🛫 Future Trips (Upcoming)</option>
              <option value="past">🏛️ Past Trips (Completed)</option>
              <option value="draft">📝 Draft Expeditions</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-[#3d4947] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Destination Filter (Col 2) */}
        <div className="md:col-span-2 relative">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#00685f] pointer-events-none">
              location_on
            </span>
            <select
              value={filters.destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full h-11 pl-9 pr-7 bg-[#faf8ff] hover:bg-white border border-[#eaedff] rounded-xl text-[13px] font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 cursor-pointer appearance-none transition-colors truncate"
            >
              <option value="all">📍 All Destinations</option>
              {destinationsList.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-[18px] text-[#3d4947] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Date / Month Filter (Col 2) */}
        <div className="md:col-span-2 relative">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#00685f] pointer-events-none">
              calendar_month
            </span>
            <select
              value={filters.monthYear}
              onChange={(e) => handleMonthYearChange(e.target.value)}
              className="w-full h-11 pl-9 pr-7 bg-[#faf8ff] hover:bg-white border border-[#eaedff] rounded-xl text-[13px] font-semibold text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 cursor-pointer appearance-none transition-colors truncate"
            >
              <option value="all">🗓️ Any Date</option>
              <option value="Oct 2026">Oct 2026 (Varanasi)</option>
              <option value="Nov 2026">Nov 2026 (Kolkata)</option>
              <option value="Dec 2026">Dec 2026 (Jaipur)</option>
              <option value="Jul 2026">Jul 2026 (Leh)</option>
              <option value="Jan 2026">Jan 2026 (Goa)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-[18px] text-[#3d4947] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Date Range & Quick Preset Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#eaedff]/70 text-[12px]">
        {/* Quick Filter Preset Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#3d4947] font-bold text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>Presets:</span>
          </span>

          <button
            type="button"
            onClick={() =>
              onChangeFilters({
                ...filters,
                timeframe: 'future',
                destination: 'all',
                monthYear: 'all',
              })
            }
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors border ${
              filters.timeframe === 'future' && filters.destination === 'all'
                ? 'bg-[#00685f] text-white border-[#00685f]'
                : 'bg-[#faf8ff] hover:bg-[#eaedff] text-[#131b2e] border-[#eaedff]'
            }`}
          >
            Future Journeys
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeFilters({
                ...filters,
                timeframe: 'past',
                destination: 'all',
                monthYear: 'all',
              })
            }
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors border ${
              filters.timeframe === 'past' && filters.destination === 'all'
                ? 'bg-[#131b2e] text-white border-[#131b2e]'
                : 'bg-[#faf8ff] hover:bg-[#eaedff] text-[#131b2e] border-[#eaedff]'
            }`}
          >
            Past Journeys
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeFilters({
                ...filters,
                destination: 'Varanasi',
                monthYear: 'all',
              })
            }
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors border ${
              filters.destination === 'Varanasi'
                ? 'bg-[#00685f] text-white border-[#00685f]'
                : 'bg-[#faf8ff] hover:bg-[#eaedff] text-[#131b2e] border-[#eaedff]'
            }`}
          >
            📍 Varanasi
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeFilters({
                ...filters,
                destination: 'Goa',
                monthYear: 'all',
              })
            }
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors border ${
              filters.destination === 'Goa'
                ? 'bg-[#00685f] text-white border-[#00685f]'
                : 'bg-[#faf8ff] hover:bg-[#eaedff] text-[#131b2e] border-[#eaedff]'
            }`}
          >
            🏖️ Goa
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeFilters({
                ...filters,
                destination: 'Leh Ladakh',
                monthYear: 'all',
              })
            }
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors border ${
              filters.destination === 'Leh Ladakh'
                ? 'bg-[#00685f] text-white border-[#00685f]'
                : 'bg-[#faf8ff] hover:bg-[#eaedff] text-[#131b2e] border-[#eaedff]'
            }`}
          >
            🏔️ Leh Ladakh
          </button>

          {/* Toggle Custom Date Range Picker */}
          <button
            type="button"
            onClick={() => setShowAdvancedDate(!showAdvancedDate)}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors border flex items-center gap-1 ${
              showAdvancedDate || filters.startDate || filters.endDate
                ? 'bg-[#00685f]/10 text-[#00685f] border-[#00685f]/30'
                : 'bg-[#faf8ff] hover:bg-[#eaedff] text-[#3d4947] border-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">date_range</span>
            <span>{showAdvancedDate ? 'Hide Date Range' : 'Custom Date Range'}</span>
          </button>
        </div>

        {/* Results Count & Clear Button */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[12px] text-[#3d4947]">
            Showing <strong className="text-[#131b2e] font-bold">{filteredCount}</strong> of{' '}
            {totalTripsCount} trips
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-2.5 py-1 rounded-lg bg-[#ffdbca]/50 hover:bg-[#ffdbca] text-[#9d4300] font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Custom Date Range Inputs (collapsible) */}
      {showAdvancedDate && (
        <div className="p-3 bg-[#faf8ff] rounded-xl border border-[#eaedff] flex flex-wrap items-center gap-3 animate-fadeIn text-[12px]">
          <span className="text-[#131b2e] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">event</span>
            <span>Filter Trips Between:</span>
          </span>

          <div className="flex items-center gap-2">
            <label className="text-[#3d4947]">From:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#eaedff] rounded-lg text-[12px] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[#3d4947]">To:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#eaedff] rounded-lg text-[12px] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30"
            />
          </div>

          {(filters.startDate || filters.endDate) && (
            <button
              type="button"
              onClick={() => onChangeFilters({ ...filters, startDate: '', endDate: '' })}
              className="text-[#9d4300] hover:underline font-semibold text-[11px] cursor-pointer ml-auto"
            >
              Clear dates
            </button>
          )}
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-[#3d4947] font-medium mr-1">Active filters:</span>

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] text-[11px]">
              <span>Keyword: &quot;{filters.searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="hover:text-[#ba1a1a] cursor-pointer"
              >
                ×
              </button>
            </span>
          )}

          {filters.timeframe !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00685f]/10 border border-[#00685f]/20 text-[#00685f] text-[11px] font-semibold">
              <span>
                Horizon:{' '}
                {filters.timeframe === 'future'
                  ? 'Future (Upcoming)'
                  : filters.timeframe === 'past'
                  ? 'Past (Completed)'
                  : 'Drafts'}
              </span>
              <button
                type="button"
                onClick={() => handleTimeframeChange('all')}
                className="hover:text-[#ba1a1a] cursor-pointer"
              >
                ×
              </button>
            </span>
          )}

          {filters.destination !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] text-[11px] font-semibold">
              <span>Destination: {filters.destination}</span>
              <button
                type="button"
                onClick={() => handleDestinationChange('all')}
                className="hover:text-[#ba1a1a] cursor-pointer"
              >
                ×
              </button>
            </span>
          )}

          {filters.monthYear !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] text-[11px] font-semibold">
              <span>Month: {filters.monthYear}</span>
              <button
                type="button"
                onClick={() => handleMonthYearChange('all')}
                className="hover:text-[#ba1a1a] cursor-pointer"
              >
                ×
              </button>
            </span>
          )}

          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] text-[11px] font-semibold">
              <span>
                Range: {filters.startDate || 'Start'} ➔ {filters.endDate || 'End'}
              </span>
              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, startDate: '', endDate: '' })}
                className="hover:text-[#ba1a1a] cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
