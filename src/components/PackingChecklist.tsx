import React, { useState, useEffect } from 'react';
import { TripItem, PackingItem, TripPackingList } from '../types';
import {
  getTripPackingList,
  saveTripPackingList,
  detectDestinationClimate,
  detectTripType,
} from '../utils/packingSuggestions';
import { generateTravelAdvice } from '../utils/geminiClient';

interface PackingChecklistProps {
  trip: TripItem;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onProgressUpdate?: (done: number, total: number) => void;
  initiallyOpen?: boolean;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({
  trip,
  onShowToast,
  onProgressUpdate,
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [packingData, setPackingData] = useState<TripPackingList>(() => getTripPackingList(trip));
  const [activeCategory, setActiveCategory] = useState<'all' | 'weather' | 'trip-type' | 'essentials'>('all');
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const climate = detectDestinationClimate(trip.destination, trip.tags);
  const tripType = detectTripType(trip.tags, trip.title);

  // Sync when trip changes
  useEffect(() => {
    const data = getTripPackingList(trip);
    setPackingData(data);
    if (onProgressUpdate) {
      onProgressUpdate(data.packedItems, data.totalItems);
    }
  }, [trip.id]);

  const handleToggle = (itemId: string) => {
    const updatedItems = packingData.items.map((it) => {
      if (it.id === itemId) {
        return { ...it, packed: !it.packed };
      }
      return it;
    });

    saveTripPackingList(trip.id, updatedItems);
    const packed = updatedItems.filter((i) => i.packed).length;
    const total = updatedItems.length;
    const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

    setPackingData({
      ...packingData,
      items: updatedItems,
      packedItems: packed,
      totalItems: total,
      percentage: pct,
    });

    if (onProgressUpdate) {
      onProgressUpdate(packed, total);
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: PackingItem = {
      id: `${trip.id}-custom-${Date.now()}`,
      text: newItemText.trim(),
      category: activeCategory === 'all' ? 'essentials' : activeCategory,
      packed: false,
      reason: 'Custom traveler item',
      icon: 'check_circle',
    };

    const updatedItems = [...packingData.items, newItem];
    saveTripPackingList(trip.id, updatedItems);

    const packed = updatedItems.filter((i) => i.packed).length;
    const total = updatedItems.length;
    const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

    setPackingData({
      ...packingData,
      items: updatedItems,
      packedItems: packed,
      totalItems: total,
      percentage: pct,
    });

    setNewItemText('');
    setIsAddingItem(false);

    if (onShowToast) {
      onShowToast('Item Added', `"${newItem.text}" added to packing checklist.`, 'info');
    }
    if (onProgressUpdate) {
      onProgressUpdate(packed, total);
    }
  };

  const handleRemoveItem = (itemId: string, itemText: string) => {
    const updatedItems = packingData.items.filter((i) => i.id !== itemId);
    saveTripPackingList(trip.id, updatedItems);

    const packed = updatedItems.filter((i) => i.packed).length;
    const total = updatedItems.length;
    const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

    setPackingData({
      ...packingData,
      items: updatedItems,
      packedItems: packed,
      totalItems: total,
      percentage: pct,
    });

    if (onShowToast) {
      onShowToast('Item Removed', `"${itemText}" removed from checklist.`, 'info');
    }
    if (onProgressUpdate) {
      onProgressUpdate(packed, total);
    }
  };

  const handleAskAiForItems = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Give me exactly 3 ultra-practical, uncommon items to pack for a ${tripType} trip to ${trip.destination} considering its ${climate.label} climate. Format as 3 short bullet items only, 5 to 8 words each.`;
      const res = await generateTravelAdvice(prompt);
      // Parse 3 lines
      const lines = res.text
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter((l) => l.length > 3 && l.length < 80)
        .slice(0, 3);

      setAiSuggestions(lines.length > 0 ? lines : ['Insulated thermal flask', 'Universal dry laundry sheet', 'Offline emergency medical card']);
      if (onShowToast) {
        onShowToast('Gemini Suggestions Ready', 'Tap any suggestion to add it to your packing list.', 'success');
      }
    } catch (e) {
      console.error(e);
      setAiSuggestions(['Compact microfiber neck gaiter', 'Electrolyte hydration sticks', 'Travel laundry soap sheets']);
    } finally {
      setIsAiLoading(false);
    }
  };

  const addAiSuggestion = (text: string) => {
    const newItem: PackingItem = {
      id: `${trip.id}-ai-${Date.now()}`,
      text,
      category: 'weather',
      packed: false,
      reason: `AI suggested for ${climate.label}`,
      icon: 'auto_awesome',
    };

    const updatedItems = [...packingData.items, newItem];
    saveTripPackingList(trip.id, updatedItems);

    const packed = updatedItems.filter((i) => i.packed).length;
    const total = updatedItems.length;
    const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

    setPackingData({
      ...packingData,
      items: updatedItems,
      packedItems: packed,
      totalItems: total,
      percentage: pct,
    });

    setAiSuggestions((prev) => prev.filter((s) => s !== text));
    if (onShowToast) {
      onShowToast('Added AI Item', `Added "${text}" to your checklist.`, 'success');
    }
  };

  const filteredItems = packingData.items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="rounded-xl border border-[#eaedff] bg-white overflow-hidden transition-all duration-300">
      {/* Toggle Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#faf8ff] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#00685f]/10 text-[#00685f] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">backpack</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#131b2e]">Packing Checklist</span>
              <span className="text-[11px] font-semibold text-[#00685f] bg-[#00685f]/10 px-2 py-0.5 rounded-full">
                {packingData.packedItems}/{packingData.totalItems} packed
              </span>
            </div>
            <p className="text-[11px] text-[#5a6578] truncate mt-0.5">
              Suggested for {climate.label} • {tripType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Circular or Mini Progress Meter */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-16 h-2 bg-[#eaedff] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00685f] rounded-full transition-all duration-500"
                style={{ width: `${packingData.percentage}%` }}
              ></div>
            </div>
            <span className="text-[11px] font-bold text-[#131b2e] w-8 text-right">
              {packingData.percentage}%
            </span>
          </div>

          <span
            className={`material-symbols-outlined text-[#3d4947] transition-transform duration-300 text-[20px] ${
              isOpen ? 'rotate-180 text-[#00685f]' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded Checklist Body */}
      {isOpen && (
        <div className="p-4 pt-1 border-t border-[#eaedff] space-y-3 bg-[#faf8ff]/50 animate-fadeIn">
          {/* Smart Weather & Trip Type Context Banner */}
          <div className="p-2.5 rounded-xl bg-white border border-[#eaedff] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e6f4f2] text-[#00685f] font-semibold">
                <span className="material-symbols-outlined text-[13px]">{climate.icon}</span>
                <span>Weather: {climate.label}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ffdbca]/60 text-[#9d4300] font-semibold">
                <span className="material-symbols-outlined text-[13px]">category</span>
                <span>Trip: {tripType}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleAskAiForItems}
              disabled={isAiLoading}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00685f] hover:text-[#008378] cursor-pointer hover:underline disabled:opacity-50"
              title="Get context-aware suggestions from Gemini"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isAiLoading ? 'sync' : 'auto_awesome'}
              </span>
              <span>{isAiLoading ? 'Analyzing...' : 'Ask AI for More'}</span>
            </button>
          </div>

          {/* AI Suggestions Dropdown Pill */}
          {aiSuggestions.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-[#eef9f6] to-[#f4f3ff] rounded-xl border border-[#b2e2d8] space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#00685f] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                  Gemini Suggested Items (Click to add)
                </span>
                <button
                  type="button"
                  onClick={() => setAiSuggestions([])}
                  className="text-[#5a6578] hover:text-[#131b2e] text-[10px]"
                >
                  Dismiss
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aiSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addAiSuggestion(sug)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#b2e2d8] hover:border-[#00685f] text-[11.5px] font-medium text-[#131b2e] flex items-center gap-1 shadow-2xs hover:bg-[#00685f] hover:text-white transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 border-b border-[#eaedff] pb-2 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#00685f] text-white'
                  : 'text-[#5a6578] hover:bg-[#eaedff]'
              }`}
            >
              All ({packingData.items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('weather')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeCategory === 'weather'
                  ? 'bg-[#00685f] text-white'
                  : 'text-[#5a6578] hover:bg-[#eaedff]'
              }`}
            >
              Weather ({packingData.items.filter((i) => i.category === 'weather').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('trip-type')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeCategory === 'trip-type'
                  ? 'bg-[#00685f] text-white'
                  : 'text-[#5a6578] hover:bg-[#eaedff]'
              }`}
            >
              Trip Style ({packingData.items.filter((i) => i.category === 'trip-type').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('essentials')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                activeCategory === 'essentials'
                  ? 'bg-[#00685f] text-white'
                  : 'text-[#5a6578] hover:bg-[#eaedff]'
              }`}
            >
              Essentials ({packingData.items.filter((i) => i.category === 'essentials').length})
            </button>
          </div>

          {/* Checkbox List */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`flex items-start justify-between gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  item.packed
                    ? 'bg-[#f8f9fc] border-[#eaedff] opacity-75'
                    : 'bg-white border-[#eaedff] hover:border-[#00685f]/40 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      item.packed
                        ? 'bg-[#00685f] border-[#00685f] text-white'
                        : 'border-[#929db2] bg-white hover:border-[#00685f]'
                    }`}
                  >
                    {item.packed && (
                      <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-[12.5px] leading-snug font-medium transition-all ${
                        item.packed ? 'line-through text-[#6f7c94]' : 'text-[#131b2e]'
                      }`}
                    >
                      {item.text}
                    </p>
                    {item.reason && (
                      <p className="text-[10.5px] text-[#5a6578] mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px] text-[#00685f]">
                          {item.category === 'weather'
                            ? climate.icon
                            : item.category === 'trip-type'
                            ? 'explore'
                            : 'shield'}
                        </span>
                        <span>{item.reason}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item.id, item.text);
                  }}
                  className="text-[#929db2] hover:text-[#d32f2f] p-1 rounded-md hover:bg-[#fce8e6] transition-colors shrink-0"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="p-4 text-center text-[#5a6578] text-[12px] bg-white rounded-xl border border-dashed border-[#eaedff]">
                No items in this category. Use "+ Add Custom Item" below.
              </div>
            )}
          </div>

          {/* Add New Item Row */}
          {isAddingItem ? (
            <form onSubmit={handleAddNewItem} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="e.g. Extra camera memory card, warm socks..."
                autoFocus
                className="flex-1 px-3 py-1.5 text-[12px] rounded-lg border border-[#00685f] focus:outline-none bg-white text-[#131b2e]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#00685f] hover:bg-[#008378] text-white rounded-lg text-[12px] font-semibold cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemText('');
                }}
                className="px-2 py-1.5 text-[#5a6578] hover:text-[#131b2e] rounded-lg text-[12px] cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setIsAddingItem(true)}
                className="flex items-center gap-1 font-semibold text-[#00685f] hover:text-[#008378] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span>
                <span>Add Custom Item</span>
              </button>

              <span className="text-[#5a6578]">
                Auto-saved for offline access
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
