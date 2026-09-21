import React, { useState, useEffect, useMemo } from 'react';
import { BucketListDestination, TravelGoal2027 } from '../types';

interface BucketListSectionProps {
  onPlanTripTo?: (origin: string, destination: string) => void;
  onPromoteToGoal?: (dest: BucketListDestination) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const STORAGE_KEY = 'travel_ai_bucket_list';

const INITIAL_BUCKET_LIST: BucketListDestination[] = [
  {
    id: 'bl-1',
    destination: 'Kyoto & Arashiyama',
    country: 'Japan',
    category: 'Heritage & Culture',
    bestSeason: 'Spring (Mar - Apr)',
    estimatedBudget: 85000,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
    description: 'Walk through thousands of vermilion Torii gates at Fushimi Inari, bamboo groves, and golden Zen temples during cherry blossom bloom.',
    savedForLater: true,
    savedAt: 'Sep 15, 2026',
    priority: 'High',
    notes: 'Book traditional Ryokan with Onsen in Gion district.',
    tags: ['CherryBlossom', 'ZenTemples', 'Shinkansen'],
  },
  {
    id: 'bl-2',
    destination: 'Reykjavik & Southern Fjords',
    country: 'Iceland',
    category: 'Alpine & Nature',
    bestSeason: 'Autumn / Winter (Oct - Feb)',
    estimatedBudget: 110000,
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    description: 'Chase the Aurora Borealis across black sand beaches, glacial lagoons at Jökulsárlón, and soak in geothermal volcanic hot springs.',
    savedForLater: false,
    priority: 'High',
    notes: 'Rent 4x4 camper for the southern Ring Road corridor.',
    tags: ['NorthernLights', 'Glaciers', 'Volcanic'],
  },
  {
    id: 'bl-3',
    destination: 'Pangong Tso & Nubra Valley',
    country: 'Ladakh, India',
    category: 'Alpine & Mountain',
    bestSeason: 'Summer (Jun - Sep)',
    estimatedBudget: 32000,
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    description: 'Cross the world’s highest motorable passes to witness the ever-changing shades of blue at 14,000ft Pangong Lake and Hunder sand dunes.',
    savedForLater: true,
    savedAt: 'Sep 18, 2026',
    priority: 'High',
    notes: 'Carry portable oxygen cannister and high-SPF glacier sunglasses.',
    tags: ['HighAltitude', 'Passes', 'Stargazing'],
  },
  {
    id: 'bl-4',
    destination: 'Banff & Moraine Lake',
    country: 'Canada',
    category: 'Alpine & Nature',
    bestSeason: 'Summer (Jul - Aug)',
    estimatedBudget: 95000,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    description: 'Canoe across radiant turquoise glacial waters nestled under the Valley of the Ten Peaks in the Canadian Rocky Mountains.',
    savedForLater: false,
    priority: 'Medium',
    notes: 'Reserve Lake Louise and Moraine Lake park shuttles early.',
    tags: ['Rockies', 'GlacialLakes', 'Hiking'],
  },
  {
    id: 'bl-5',
    destination: 'Cappadocia Fairy Chimneys',
    country: 'Turkey',
    category: 'Heritage & Wonders',
    bestSeason: 'Spring / Autumn (Apr - Oct)',
    estimatedBudget: 62000,
    coverImage: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80',
    description: 'Drift at sunrise in a hot air balloon above honeycombed rock valleys, underground cities, and stay in cave suites carved into cliffs.',
    savedForLater: false,
    priority: 'Medium',
    notes: 'Reserve sunrise balloon launch with 2 backup flight days for weather.',
    tags: ['HotAirBalloon', 'CaveHotel', 'Valleys'],
  },
  {
    id: 'bl-6',
    destination: 'Munnar & Alleppey Backwaters',
    country: 'Kerala, India',
    category: 'Coastal & Tropical',
    bestSeason: 'Winter (Nov - Feb)',
    estimatedBudget: 22000,
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
    description: 'Misty green tea estate carpets in the Western Ghats followed by slow serene cruising on an eco-friendly wooden houseboat in Vembanad Lake.',
    savedForLater: true,
    savedAt: 'Sep 10, 2026',
    priority: 'Someday',
    notes: 'Opt for quiet palm-fringed canals away from the main boat dock.',
    tags: ['TeaGardens', 'Houseboat', 'Backwaters'],
  },
  {
    id: 'bl-7',
    destination: 'Zermatt & Matterhorn Crest',
    country: 'Switzerland',
    category: 'Alpine & Nature',
    bestSeason: 'Winter Ski or Summer Alpine',
    estimatedBudget: 125000,
    coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80',
    description: 'Admire the majestic pyramid of the Matterhorn, ride the Gornergrat cogwheel train, and journey across the Swiss Alps on the Glacier Express.',
    savedForLater: false,
    priority: 'Someday',
    notes: 'Get Swiss Travel Pass for unlimited scenic rail journeys.',
    tags: ['Matterhorn', 'GlacierExpress', 'SwissAlps'],
  },
  {
    id: 'bl-8',
    destination: 'Ancient Petra & Wadi Rum',
    country: 'Jordan',
    category: 'Heritage & Wonders',
    bestSeason: 'Spring or Autumn (Mar - May, Sep - Nov)',
    estimatedBudget: 78000,
    coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    description: 'Walk through the dramatic 1.2km Siq canyon to the rose-red Treasury, followed by glamping beneath billion-star skies in Martian desert domes.',
    savedForLater: false,
    priority: 'Medium',
    notes: 'Attend Petra by Night candlelit ceremony at the Treasury.',
    tags: ['SevenWonders', 'BedouinCamp', 'Desert'],
  },
];

export const BucketListSection: React.FC<BucketListSectionProps> = ({
  onPlanTripTo,
  onPromoteToGoal,
  onShowToast,
}) => {
  const [destinations, setDestinations] = useState<BucketListDestination[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to read bucket list from local storage:', e);
    }
    return INITIAL_BUCKET_LIST;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'alpine' | 'heritage' | 'tropical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Custom Destination Form
  const [customDestination, setCustomDestination] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [customCategory, setCustomCategory] = useState('Alpine & Nature');
  const [customSeason, setCustomSeason] = useState('Autumn / Winter');
  const [customBudget, setCustomBudget] = useState('45000');
  const [customNotes, setCustomNotes] = useState('');
  const [customTags, setCustomTags] = useState('Scenic, BucketList');
  const [customPriority, setCustomPriority] = useState<'High' | 'Medium' | 'Someday'>('High');

  // Persist to localStorage whenever destinations change
  const persistDestinations = (updated: BucketListDestination[]) => {
    setDestinations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save bucket list to local storage:', e);
    }
  };

  const handleToggleSaveForLater = (destId: string) => {
    const target = destinations.find((d) => d.id === destId);
    if (!target) return;

    const willBeSaved = !target.savedForLater;
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const updated = destinations.map((d) => {
      if (d.id === destId) {
        return {
          ...d,
          savedForLater: willBeSaved,
          savedAt: willBeSaved ? now : undefined,
        };
      }
      return d;
    });

    persistDestinations(updated);

    if (onShowToast) {
      if (willBeSaved) {
        onShowToast(
          'Saved to Bucket List',
          `"${target.destination}" is now stored in local storage for later planning.`,
          'success'
        );
      } else {
        onShowToast(
          'Removed from Saved',
          `"${target.destination}" removed from your saved list.`,
          'info'
        );
      }
    }
  };

  const handleSaveCustomDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDestination.trim() || !customCountry.trim()) return;

    const tagsList = customTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newDest: BucketListDestination = {
      id: `bl-custom-${Date.now()}`,
      destination: customDestination.trim(),
      country: customCountry.trim(),
      category: customCategory,
      bestSeason: customSeason,
      estimatedBudget: parseInt(customBudget, 10) || 30000,
      coverImage:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      description: customNotes.trim() || `Exciting dream expedition to ${customDestination}, ${customCountry}.`,
      savedForLater: true, // Automatically saved for later!
      savedAt: now,
      priority: customPriority,
      notes: customNotes.trim(),
      tags: tagsList.length > 0 ? tagsList : ['DreamTrip', 'BucketList'],
    };

    const updated = [newDest, ...destinations];
    persistDestinations(updated);
    setShowAddModal(false);

    // Reset Form
    setCustomDestination('');
    setCustomCountry('');
    setCustomNotes('');

    if (onShowToast) {
      onShowToast(
        'Saved for Later',
        `"${newDest.destination}" was added to your Bucket List and saved in local storage.`,
        'success'
      );
    }
  };

  const handleDeleteDestination = (destId: string) => {
    const updated = destinations.filter((d) => d.id !== destId);
    persistDestinations(updated);
    if (onShowToast) {
      onShowToast('Destination Removed', 'Destination removed from your bucket list.', 'info');
    }
  };

  const savedCount = destinations.filter((d) => d.savedForLater).length;

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // 1. Filter Tab
      if (activeFilter === 'saved' && !dest.savedForLater) return false;
      if (activeFilter === 'alpine' && !dest.category.toLowerCase().includes('alpine')) return false;
      if (activeFilter === 'heritage' && !dest.category.toLowerCase().includes('heritage')) return false;
      if (activeFilter === 'tropical' && !dest.category.toLowerCase().includes('tropical') && !dest.category.toLowerCase().includes('coastal')) return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          dest.destination.toLowerCase().includes(q) ||
          dest.country.toLowerCase().includes(q) ||
          dest.category.toLowerCase().includes(q) ||
          dest.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [destinations, activeFilter, searchQuery]);

  return (
    <section className="mt-12 pt-8 border-t border-[#eaedff]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#9d4300]/10 text-[#9d4300]">
              <span className="material-symbols-outlined text-[24px]">bookmark_heart</span>
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#131b2e] tracking-tight">
                Bucket List Destinations
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00685f]/10 text-[#00685f] border border-[#00685f]/20">
                {savedCount} Saved in Local Storage
              </span>
            </div>
          </div>
          <p className="text-[13px] text-[#3d4947] mt-1">
            Curate and bookmark dream destinations to explore in 2027 and beyond with persistent offline access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px]">add_location_alt</span>
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Category & Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeFilter === 'all'
                ? 'bg-[#131b2e] text-white shadow-2xs'
                : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
            }`}
          >
            All Inspirations ({destinations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('saved')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
              activeFilter === 'saved'
                ? 'bg-[#00685f] text-white shadow-2xs'
                : 'bg-white text-[#00685f] hover:bg-[#f2f3ff] border border-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">bookmark</span>
            <span>Saved for Later ({savedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('alpine')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeFilter === 'alpine'
                ? 'bg-[#131b2e] text-white shadow-2xs'
                : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
            }`}
          >
            Alpine &amp; Mountain
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('heritage')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeFilter === 'heritage'
                ? 'bg-[#131b2e] text-white shadow-2xs'
                : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
            }`}
          >
            Heritage &amp; Wonders
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('tropical')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeFilter === 'tropical'
                ? 'bg-[#131b2e] text-white shadow-2xs'
                : 'bg-white text-[#3d4947] hover:bg-[#f2f3ff] border border-[#eaedff]'
            }`}
          >
            Coastal &amp; Tropical
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[200px] sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#3d4947] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search bucket list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#eaedff] text-[12.5px] text-[#131b2e] placeholder-[#64748b] outline-none focus:border-[#00685f]/40 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[#3d4947] hover:text-[#131b2e]"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-[#eaedff] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f2f3ff] text-[#00685f] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">bookmark_border</span>
          </div>
          <h3 className="font-bold text-[16px] text-[#131b2e]">No bucket list destinations found</h3>
          <p className="text-[13px] text-[#3d4947] max-w-md mx-auto">
            {activeFilter === 'saved'
              ? 'You have not saved any bucket list destinations yet. Click "Save for later" on any card to store them in your local storage.'
              : 'Try adjusting your search query or category filters.'}
          </p>
          {activeFilter === 'saved' && (
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 bg-[#00685f] text-white rounded-xl text-[12.5px] font-semibold cursor-pointer"
            >
              Explore All Bucket List Inspirations
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDestinations.map((item) => {
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-sm ${
                  item.savedForLater
                    ? 'bg-white border-[#00685f]/30 ring-1 ring-[#00685f]/15'
                    : 'bg-white border-[#eaedff]'
                }`}
              >
                {/* Image and Header Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-[#e2e7ff]">
                  <img
                    src={item.coverImage}
                    alt={item.destination}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white/90 backdrop-blur-xs text-[#131b2e] shadow-2xs">
                      {item.category}
                    </span>

                    {/* Quick Bookmark Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSaveForLater(item.id)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                        item.savedForLater
                          ? 'bg-[#00855b] text-white'
                          : 'bg-white/80 text-[#131b2e] hover:bg-white hover:text-[#00685f]'
                      }`}
                      title={item.savedForLater ? 'Saved for later (Click to unshelf)' : 'Save for later'}
                      aria-label="Save for later toggle"
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {item.savedForLater ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>

                  {/* Bottom Image Overlay text */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="font-bold text-[17px] leading-tight drop-shadow-xs">
                        {item.destination}
                      </h3>
                      <span className="text-[12px] opacity-90 drop-shadow-xs">
                        • {item.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#c8f0eb] mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                      <span>Best: {item.bestSeason}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  <p className="text-[12.5px] text-[#3d4947] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[#131b2e] text-[10.5px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Logistics bar: Est budget & saved timestamp */}
                  <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between text-[11.5px]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#3d4947] block">
                        Estimated Budget
                      </span>
                      <span className="font-bold text-[#131b2e]">
                        ₹{item.estimatedBudget.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {item.savedForLater && item.savedAt && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#00685f] block">
                          Saved in Storage
                        </span>
                        <span className="text-[11px] text-[#3d4947]">
                          {item.savedAt}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="pt-1 flex items-center gap-2">
                    {/* The requested 'Save for later' button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSaveForLater(item.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                        item.savedForLater
                          ? 'bg-[#00855b] hover:bg-[#00704d] text-white border border-[#00855b]'
                          : 'bg-white hover:bg-[#f2f3ff] text-[#00685f] border border-[#00685f]/40 hover:border-[#00685f]'
                      }`}
                      title={
                        item.savedForLater
                          ? 'Stored in local storage. Click to remove.'
                          : 'Save this destination to local storage for later'
                      }
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {item.savedForLater ? 'bookmark_check' : 'bookmark_add'}
                      </span>
                      <span>{item.savedForLater ? 'Saved for Later' : 'Save for later'}</span>
                    </button>

                    {/* Plan in AI Trip Planner */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onPlanTripTo) {
                          onPlanTripTo('New Delhi, India', `${item.destination}, ${item.country}`);
                        }
                      }}
                      className="py-2 px-3 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Open in AI Planner"
                    >
                      <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                      <span>Plan</span>
                    </button>

                    {/* Promote to 2027 Goals */}
                    {onPromoteToGoal && (
                      <button
                        type="button"
                        onClick={() => onPromoteToGoal(item)}
                        className="p-2 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#3d4947] hover:text-[#00685f] rounded-xl transition-colors cursor-pointer"
                        title="Add to active 2027 Goals"
                        aria-label="Add to 2027 Goals"
                      >
                        <span className="material-symbols-outlined text-[16px]">flag</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Bucket List Destination Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomDestination}
            className="bg-white rounded-3xl max-w-lg w-full border border-[#eaedff] p-6 shadow-2xl space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[22px]">
                  bookmark_add
                </span>
                <h3 className="text-[18px] font-bold text-[#131b2e]">
                  Add Destination to Bucket List
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-[#f2f3ff] text-[#3d4947] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Destination Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tromsø / Bali / Zanskar"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Country / Region
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Norway / Indonesia / India"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                >
                  <option value="Alpine & Nature">Alpine &amp; Nature</option>
                  <option value="Heritage & Culture">Heritage &amp; Culture</option>
                  <option value="Coastal & Tropical">Coastal &amp; Tropical</option>
                  <option value="Heritage & Wonders">Heritage &amp; Wonders</option>
                  <option value="Adventure & Road Trips">Adventure &amp; Road Trips</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Best Travel Season
                </label>
                <input
                  type="text"
                  placeholder="e.g. Winter / Oct - Feb"
                  value={customSeason}
                  onChange={(e) => setCustomSeason(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Estimated Budget (₹)
                </label>
                <input
                  type="number"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Priority
                </label>
                <select
                  value={customPriority}
                  onChange={(e) => setCustomPriority(e.target.value as 'High' | 'Medium' | 'Someday')}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                >
                  <option value="High">High (2027 Priority)</option>
                  <option value="Medium">Medium</option>
                  <option value="Someday">Someday Wishlist</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                Aspirations / Why It's on Your Bucket List
              </label>
              <textarea
                rows={2}
                placeholder="What iconic experiences do you want to achieve there?"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[#3d4947] hover:bg-[#f2f3ff] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                <span>Save for later</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
