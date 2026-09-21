import React, { useState, useEffect } from 'react';
import { DestinationWeatherForecast } from '../types';
import { fetch7DayWeatherForecast } from '../utils/weatherService';

interface TripWeatherForecastProps {
  destination: string;
  primaryDestinationName?: string;
  tripDates?: string;
}

export const TripWeatherForecast: React.FC<TripWeatherForecastProps> = ({
  destination,
  primaryDestinationName,
  tripDates,
}) => {
  const [forecast, setForecast] = useState<DestinationWeatherForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const loadWeather = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await fetch7DayWeatherForecast(destination, primaryDestinationName);
      setForecast(data);
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [destination, primaryDestinationName]);

  const convertTemp = (tempC: number) => {
    if (tempUnit === 'F') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return tempC;
  };

  if (loading && !forecast) {
    return (
      <div className="p-3.5 rounded-xl bg-white border border-[#eaedff] animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#e2e7ff]"></div>
            <div className="h-3.5 w-36 bg-[#e2e7ff] rounded-md"></div>
          </div>
          <div className="h-4 w-16 bg-[#e2e7ff] rounded-full"></div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-[#f2f3ff] flex flex-col items-center justify-center p-1">
              <div className="w-6 h-2 bg-[#e2e7ff] rounded-sm mb-1.5"></div>
              <div className="w-4 h-4 bg-[#e2e7ff] rounded-full mb-1.5"></div>
              <div className="w-5 h-2 bg-[#e2e7ff] rounded-sm"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!forecast || !forecast.daily || forecast.daily.length === 0) {
    return null;
  }

  const selectedDay = forecast.daily[selectedDayIndex] || forecast.daily[0];

  return (
    <div className="p-3.5 rounded-xl bg-white border border-[#eaedff] shadow-2xs transition-all">
      {/* Weather Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-lg bg-[#00685f]/10 text-[#00685f] shrink-0">
            <span className="material-symbols-outlined text-[17px]">cloud</span>
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#131b2e]">
                7-Day Forecast
              </span>
              <span className="text-[10.5px] px-1.5 py-0.2 rounded-md bg-[#f2f3ff] text-[#00685f] font-semibold border border-[#eaedff]">
                {forecast.cityName}
              </span>
              {forecast.isLive && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-[#00855b] bg-[#00855b]/10 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00855b] animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#3d4947] truncate">
              {forecast.currentCondition} • Currently {convertTemp(forecast.currentTemp)}°{tempUnit}
            </p>
          </div>
        </div>

        {/* Action controls: Temp toggle, refresh, expand */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
            className="px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-[#eaedff] bg-[#f2f3ff] text-[#131b2e] hover:bg-[#e2e7ff] transition-colors cursor-pointer"
            title={`Switch to °${tempUnit === 'C' ? 'F' : 'C'}`}
          >
            °{tempUnit}
          </button>

          <button
            type="button"
            onClick={() => loadWeather(true)}
            disabled={loading}
            className="p-1 rounded-md text-[#3d4947] hover:text-[#00685f] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            title="Refresh weather data"
            aria-label="Refresh weather data"
          >
            <span className={`material-symbols-outlined text-[15px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((e) => !e)}
            className="p-1 rounded-md text-[#3d4947] hover:text-[#00685f] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse forecast details' : 'Expand forecast details'}
            aria-label={isExpanded ? 'Collapse forecast' : 'Expand forecast'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {forecast.daily.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={`${day.date}-${idx}`}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-w-0 ${
                isSelected
                  ? 'bg-[#00685f]/10 border-[#00685f] text-[#00685f] shadow-2xs ring-1 ring-[#00685f]/20'
                  : 'bg-[#faf8ff] hover:bg-[#f2f3ff] border-[#eaedff] text-[#131b2e]'
              }`}
              title={`${day.dayName} (${day.date}): ${day.condition}, High ${convertTemp(day.tempMax)}°${tempUnit}, Low ${convertTemp(day.tempMin)}°${tempUnit}`}
            >
              {/* Day Label */}
              <span className="text-[10px] font-bold block truncate w-full">
                {day.dayName}
              </span>

              {/* Date */}
              <span className="text-[8.5px] text-[#3d4947] block truncate w-full">
                {day.date.split(' ')[1]}
              </span>

              {/* Weather Icon */}
              <div className="my-1">
                <span className={`material-symbols-outlined text-[18px] ${day.iconColor}`}>
                  {day.icon}
                </span>
              </div>

              {/* High / Low Temp */}
              <div className="text-[10px] font-bold leading-tight">
                <span className="text-[#131b2e]">{convertTemp(day.tempMax)}°</span>
                <span className="text-[#64748b] text-[8.5px] block font-normal">{convertTemp(day.tempMin)}°</span>
              </div>

              {/* Rain chance pill if > 15% */}
              {day.precipitationProb >= 15 ? (
                <span className="mt-1 text-[8px] font-semibold text-[#0284c7] bg-[#0284c7]/10 px-1 rounded-sm">
                  {day.precipitationProb}%
                </span>
              ) : (
                <span className="mt-1 text-[8px] text-transparent select-none">-</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Details or Selected Day Snapshot */}
      {isExpanded ? (
        <div className="mt-3 pt-2.5 border-t border-[#eaedff] text-[11.5px] space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#faf8ff] border border-[#eaedff]">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[22px] ${selectedDay.iconColor}`}>
                {selectedDay.icon}
              </span>
              <div>
                <span className="font-bold text-[#131b2e] block">
                  {selectedDay.dayName} ({selectedDay.date}): {selectedDay.condition}
                </span>
                <span className="text-[10.5px] text-[#3d4947]">
                  High: {convertTemp(selectedDay.tempMax)}°{tempUnit} • Low: {convertTemp(selectedDay.tempMin)}°{tempUnit}
                  {selectedDay.precipitationProb > 0 && ` • Precip Probability: ${selectedDay.precipitationProb}%`}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#00685f] px-2 py-0.5 rounded-md bg-white border border-[#eaedff]">
              {convertTemp(selectedDay.tempMax)}°{tempUnit}
            </span>
          </div>

          {/* Travel Packing Advisory */}
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-[#ffdbca]/25 border border-[#ffdbca]/60 text-[11px] text-[#9d4300]">
            <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">tips_and_updates</span>
            <p className="leading-snug">
              <span className="font-bold">Destination Packing Note: </span>
              {forecast.advisory}
            </p>
          </div>
        </div>
      ) : (
        /* Subtle compact advisory note */
        <div className="mt-2 flex items-center justify-between text-[10.5px] text-[#3d4947] pt-1.5 border-t border-[#eaedff]/60">
          <span className="truncate pr-2">
            💡 {forecast.advisory}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-[#00685f] hover:underline shrink-0 font-semibold cursor-pointer"
          >
            Details
          </button>
        </div>
      )}
    </div>
  );
};
