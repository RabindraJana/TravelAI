import React, { useState } from 'react';
import { ScreenType, TransitionType, Achievement } from '../types';

interface AchievementsProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
}

const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Himalayan Vanguard',
    category: 'adventure',
    symbol: 'mountain',
    badgeColor: '#00685f',
    rarity: 'Legendary',
    description: 'Ascended and traversed high passes above 5,000m including Khardung La & Chang La in Ladakh.',
    dateUnlocked: 'Oct 14, 2025',
    progress: 100,
    currentCount: 5,
    targetCount: 5,
    unlocked: true,
    rewardXp: 2500,
  },
  {
    id: 'ach-2',
    title: 'Ghat Mystic & Chronicler',
    category: 'culture',
    symbol: 'water',
    badgeColor: '#9d4300',
    rarity: 'Epic',
    description: 'Documented, mapped, and walked 20+ historic riverfront ghats in Varanasi and Haridwar at dawn.',
    dateUnlocked: 'Dec 08, 2025',
    progress: 100,
    currentCount: 24,
    targetCount: 20,
    unlocked: true,
    rewardXp: 1800,
  },
  {
    id: 'ach-3',
    title: 'Iron Tracks Pioneer',
    category: 'transit',
    symbol: 'train',
    badgeColor: '#006947',
    rarity: 'Epic',
    description: 'Logged over 2,500 kilometers on Indian Railways, including scenic Vande Bharat & Konkan corridors.',
    dateUnlocked: 'Jan 22, 2026',
    progress: 100,
    currentCount: 3200,
    targetCount: 2500,
    unlocked: true,
    rewardXp: 1600,
  },
  {
    id: 'ach-4',
    title: 'Taste of India Gourmet',
    category: 'food',
    symbol: 'restaurant',
    badgeColor: '#ba1a1a',
    rarity: 'Rare',
    description: 'Sampled signature regional cuisines and street dishes across 8 distinct states.',
    dateUnlocked: 'Aug 19, 2025',
    progress: 100,
    currentCount: 8,
    targetCount: 8,
    unlocked: true,
    rewardXp: 1200,
  },
  {
    id: 'ach-5',
    title: 'Ultralight Nomad',
    category: 'adventure',
    symbol: 'backpack',
    badgeColor: '#535f70',
    rarity: 'Rare',
    description: 'Completed a 5-day solo expedition across three destinations carrying under 7kg backpack.',
    dateUnlocked: 'Nov 04, 2025',
    progress: 100,
    currentCount: 5,
    targetCount: 5,
    unlocked: true,
    rewardXp: 1100,
  },
  {
    id: 'ach-6',
    title: 'Golden Hour Chronicler',
    category: 'photography',
    symbol: 'photo_camera',
    badgeColor: '#705d00',
    rarity: 'Epic',
    description: 'Captured and geotagged 500+ verified architectural and landscape photos during sunrise and golden hour.',
    dateUnlocked: 'Feb 11, 2026',
    progress: 100,
    currentCount: 540,
    targetCount: 500,
    unlocked: true,
    rewardXp: 1750,
  },
  {
    id: 'ach-7',
    title: 'Backwater Navigator',
    category: 'culture',
    symbol: 'sailing',
    badgeColor: '#00685f',
    rarity: 'Common',
    description: 'Paddled and cruised through the canal networks of Vembanad Lake and Alleppey backwaters.',
    dateUnlocked: 'Mar 03, 2026',
    progress: 100,
    currentCount: 1,
    targetCount: 1,
    unlocked: true,
    rewardXp: 800,
  },
  {
    id: 'ach-8',
    title: 'UNESCO Heritage Custodian',
    category: 'culture',
    symbol: 'account_balance',
    badgeColor: '#9d4300',
    rarity: 'Legendary',
    description: 'Visit 12 UNESCO World Heritage Sites across India (9 explored: Amber, Hampi, Qutb Minar, etc.).',
    progress: 75,
    currentCount: 9,
    targetCount: 12,
    unlocked: false,
    rewardXp: 3000,
  },
  {
    id: 'ach-9',
    title: 'Sub-Zero Trailblazer',
    category: 'adventure',
    symbol: 'ac_unit',
    badgeColor: '#00685f',
    rarity: 'Legendary',
    description: 'Endure negative 15°C conditions on winter expeditions (Spiti Valley or Chadar Frozen River).',
    progress: 50,
    currentCount: 1,
    targetCount: 2,
    unlocked: false,
    rewardXp: 3500,
  },
  {
    id: 'ach-10',
    title: 'Trans-India Corridor Master',
    category: 'transit',
    symbol: 'explore',
    badgeColor: '#006947',
    rarity: 'Legendary',
    description: 'Complete continuous overland transit connecting the northern Himalayas to Kanyakumari.',
    progress: 65,
    currentCount: 2400,
    targetCount: 3700,
    unlocked: false,
    rewardXp: 4000,
  },
];

export const Achievements: React.FC<AchievementsProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked' | 'adventure' | 'culture'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const totalEarned = ACHIEVEMENTS_DATA.filter((a) => a.unlocked).length;
  const totalXp = ACHIEVEMENTS_DATA.filter((a) => a.unlocked).reduce((acc, a) => acc + a.rewardXp, 0);

  const filtered = ACHIEVEMENTS_DATA.filter((a) => {
    if (activeFilter === 'unlocked') return a.unlocked;
    if (activeFilter === 'locked') return !a.unlocked;
    if (activeFilter === 'adventure') return a.category === 'adventure';
    if (activeFilter === 'culture') return a.category === 'culture';
    return true;
  });

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        {/* Header Profile & XP Hero */}
        <div className="py-6 border-b border-[#eaedff] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Aarav Patel"
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[#00685f]/20 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#00685f] text-white p-1 rounded-lg text-[10px] font-bold shadow-xs">
                Lv.18
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[24px] font-bold text-[#131b2e] tracking-tight">Aarav Patel’s Achievements</h1>
                <span className="material-symbols-outlined text-[#00685f] text-[20px]">verified</span>
              </div>
              <p className="text-[13px] text-[#3d4947]">
                Grand Trailmaster • {totalEarned} of {ACHIEVEMENTS_DATA.length} Medals Unlocked
              </p>
            </div>
          </div>

          {/* XP Level Card */}
          <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-xs flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Traveler XP Score</span>
              <div className="text-[22px] font-bold text-[#00685f] mt-0.5">{totalXp.toLocaleString()} XP</div>
              <span className="text-[11px] text-[#006947] font-semibold">Tier: Grand Trailmaster</span>
            </div>
            <div className="w-32">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#3d4947] mb-1">
                <span>Rank XP</span>
                <span>82%</span>
              </div>
              <div className="w-full bg-[#e2e7ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#00685f] h-full rounded-full w-[82%]"></div>
              </div>
              <span className="text-[10px] text-[#3d4947] block mt-1">3,150 XP to Level 19</span>
            </div>
          </div>
        </div>

        {/* Overview Badges Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#3d4947]">States Traversed</span>
            <div className="text-[24px] font-bold text-[#131b2e] mt-1">14 / 28</div>
            <span className="text-[12px] text-[#00685f] font-medium">50% of India covered</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#3d4947]">Tracked Distance</span>
            <div className="text-[24px] font-bold text-[#131b2e] mt-1">9,420 km</div>
            <span className="text-[12px] text-[#006947] font-medium">Rail, Road &amp; Air</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#3d4947]">UNESCO Heritage</span>
            <div className="text-[24px] font-bold text-[#9d4300] mt-1">9 Sites</div>
            <span className="text-[12px] text-[#9d4300] font-medium">3 remaining for badge</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#3d4947]">High Passes (&gt;4,500m)</span>
            <div className="text-[24px] font-bold text-[#131b2e] mt-1">6 Passes</div>
            <span className="text-[12px] text-[#00685f] font-medium">Ladakh &amp; HP Passes</span>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'all', label: `All Achievements (${ACHIEVEMENTS_DATA.length})` },
            { key: 'unlocked', label: `Unlocked (${totalEarned})` },
            { key: 'locked', label: `In Progress (${ACHIEVEMENTS_DATA.length - totalEarned})` },
            { key: 'adventure', label: 'Adventure' },
            { key: 'culture', label: 'Culture & Heritage' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-[#00685f] text-white shadow-xs'
                  : 'bg-white text-[#3d4947] border border-[#eaedff] hover:bg-[#f2f3ff]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ach) => (
            <div
              key={ach.id}
              onClick={() => setSelectedAchievement(ach)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                ach.unlocked
                  ? 'bg-white border-[#eaedff] shadow-xs hover:shadow-md hover:border-[#00685f]/40'
                  : 'bg-[#f8f9ff]/70 border-dashed border-[#eaedff] hover:bg-white'
              }`}
            >
              {/* Badge Icon & Rarity Header */}
              <div className="flex items-start justify-between">
                {/* Symbolic Badge Emblem */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: ach.unlocked ? ach.badgeColor : '#bcc9c6',
                  }}
                >
                  <span className="material-symbols-outlined text-[28px]">{ach.symbol}</span>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ach.rarity === 'Legendary'
                        ? 'bg-[#ffea9f] text-[#705d00]'
                        : ach.rarity === 'Epic'
                        ? 'bg-[#ffdbca] text-[#9d4300]'
                        : ach.rarity === 'Rare'
                        ? 'bg-[#e2e7ff] text-[#00685f]'
                        : 'bg-[#f2f3ff] text-[#3d4947]'
                    }`}
                  >
                    {ach.rarity}
                  </span>
                  <span className="text-[11px] font-bold text-[#006947] mt-1">+{ach.rewardXp} XP</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-[16px] font-bold text-[#131b2e] group-hover:text-[#00685f] transition-colors flex items-center gap-1.5">
                  <span>{ach.title}</span>
                  {ach.unlocked && (
                    <span className="material-symbols-outlined text-[#006947] text-[18px]">verified</span>
                  )}
                </h3>
                <p className="text-[12px] text-[#3d4947] mt-1 leading-relaxed">{ach.description}</p>
              </div>

              {/* Progress or Unlock Date */}
              <div className="pt-2 border-t border-[#eaedff]">
                {ach.unlocked ? (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#006947] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Earned {ach.dateUnlocked}
                    </span>
                    <span className="text-[#3d4947]">View Medal</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#3d4947] mb-1">
                      <span>Progress</span>
                      <span>
                        {ach.currentCount}/{ach.targetCount} ({ach.progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00685f] h-full rounded-full transition-all"
                        style={{ width: `${ach.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#eaedff] p-6 shadow-2xl space-y-4 animate-fadeIn text-center">
            {/* Medallion Display */}
            <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg my-2"
                 style={{ backgroundColor: selectedAchievement.badgeColor }}>
              <span className="material-symbols-outlined text-[40px]">{selectedAchievement.symbol}</span>
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#e2e7ff] text-[#00685f]">
              {selectedAchievement.rarity} Traveler Medal
            </span>

            <h3 className="text-[22px] font-bold text-[#131b2e] mt-1">{selectedAchievement.title}</h3>
            <p className="text-[13px] text-[#3d4947] leading-relaxed">{selectedAchievement.description}</p>

            <div className="p-3 bg-[#f2f3ff] rounded-xl flex items-center justify-around text-[12px]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#3d4947] block">XP Awarded</span>
                <span className="font-bold text-[#006947]">+{selectedAchievement.rewardXp} XP</span>
              </div>
              <div className="border-l border-[#eaedff] h-8"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Status</span>
                <span className="font-bold text-[#00685f]">
                  {selectedAchievement.unlocked ? `Earned ${selectedAchievement.dateUnlocked}` : 'In Progress'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-2.5 bg-[#00685f] hover:bg-[#008378] text-white font-semibold rounded-xl text-[13px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
