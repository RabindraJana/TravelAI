import React, { useState, useEffect } from 'react';
import { ScreenType, TransitionType, TravelGoal2027, BucketListDestination } from '../types';
import { BucketListSection } from './BucketListSection';

interface Goals2027Props {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const DEFAULT_2027_GOALS: TravelGoal2027[] = [
  {
    id: 'goal-1',
    title: 'Spiti Valley Winter Whiteout Expedition',
    destination: 'Spiti Valley, Himachal Pradesh',
    origin: 'New Delhi, India',
    targetMonth: 'January 2027',
    category: 'High Altitude Winter',
    targetBudget: 35000,
    savedBudget: 24500,
    completed: false,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    notes: 'Witness Key Monastery surrounded by frozen white snowscapes, traverse Chicham bridge at -20°C, and stay in heated mud homestays.',
    milestones: [
      { text: 'Thermal down jacket rated to -25°C', done: true },
      { text: 'Book 4x4 snow vehicle from Shimla', done: true },
      { text: 'Acclimatization stopover in Kalpa', done: false },
      { text: 'Homestay booking in Kaza & Kibber', done: false },
    ],
    tags: ['Snow', 'WinterTrek', 'Monasteries'],
  },
  {
    id: 'goal-2',
    title: 'Meghalaya Bio-Living Root Bridges & Caving',
    destination: 'Cherrapunji & Dawki, Meghalaya',
    origin: 'Kolkata, West Bengal',
    targetMonth: 'April 2027',
    category: 'Eco Adventure & Rainforest',
    targetBudget: 28000,
    savedBudget: 15000,
    completed: false,
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
    notes: 'Hike down 3,500 stone stairs to Nongriat Double Decker Living Root Bridge, explore Krem Mawmluh limestone caves, and kayak on crystal Dawki.',
    milestones: [
      { text: 'Flight to Guwahati Airport (GAU)', done: true },
      { text: 'Hire local Khasi trekking guide', done: false },
      { text: 'Homestay in Nongriat village', done: false },
    ],
    tags: ['Rainforest', 'LivingBridges', 'Caving'],
  },
  {
    id: 'goal-3',
    title: 'PADI Open Water Scuba Diving in Andamans',
    destination: 'Havelock & Neil Island, Andaman',
    origin: 'Chennai, Tamil Nadu',
    targetMonth: 'November 2027',
    category: 'Marine & Islands',
    targetBudget: 52000,
    savedBudget: 42000,
    completed: false,
    coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    notes: 'Complete 4-day PADI certification at Elephant Beach and dive Dixon’s Pinnacle with manta rays and vibrant coral reefs.',
    milestones: [
      { text: 'PADI e-Learning course modules', done: true },
      { text: 'Flight to Port Blair (IXZ)', done: true },
      { text: 'Inter-island catamaran tickets', done: true },
      { text: 'Dive resort booking', done: false },
    ],
    tags: ['Scuba', 'Ocean', 'Islands'],
  },
  {
    id: 'goal-4',
    title: 'White Desert Full Moon at Rann of Kutch',
    destination: 'Dhordo, Rann of Kutch, Gujarat',
    origin: 'Mumbai, Maharashtra',
    targetMonth: 'December 2027',
    category: 'Desert & Cultural Fest',
    targetBudget: 22000,
    savedBudget: 9000,
    completed: false,
    coverImage: 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?w=800&auto=format&fit=crop&q=80',
    notes: 'Experience endless shimmering white salt flats under the winter full moon, Rogan art demonstrations, and Kutchi folk concerts.',
    milestones: [
      { text: 'Full moon date reservation', done: true },
      { text: 'Tent city or Bhunga stay', done: false },
      { text: 'Kutch border permit', done: false },
    ],
    tags: ['WhiteDesert', 'FullMoon', 'Handicrafts'],
  },
];

export const Goals2027: React.FC<Goals2027Props> = ({ onNavigate, onPlanTripTo, onShowToast }) => {
  const [goals, setGoals] = useState<TravelGoal2027[]>(() => {
    try {
      const saved = localStorage.getItem('travel_ai_2027_goals');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_2027_GOALS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // New Goal Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('New Delhi, India');
  const [targetMonth, setTargetMonth] = useState('June 2027');
  const [category, setCategory] = useState('Mountain Adventure');
  const [targetBudget, setTargetBudget] = useState('30000');
  const [initialSaved, setInitialSaved] = useState('5000');
  const [notes, setNotes] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('Research route, Book tickets, Arrange gear');

  // Save to localStorage whenever goals change
  useEffect(() => {
    try {
      localStorage.setItem('travel_ai_2027_goals', JSON.stringify(goals));
    } catch {
      // ignore
    }
  }, [goals]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) return;

    const milestonesList = milestonesInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((text) => ({ text, done: false }));

    const newGoal: TravelGoal2027 = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      destination: destination.trim(),
      origin: origin.trim(),
      targetMonth,
      category,
      targetBudget: parseInt(targetBudget, 10) || 25000,
      savedBudget: parseInt(initialSaved, 10) || 0,
      completed: false,
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      notes: notes.trim() || `Exciting 2027 expedition to ${destination}.`,
      milestones: milestonesList.length > 0 ? milestonesList : [{ text: 'Finalize itinerary', done: false }],
      tags: ['2027Goal', category.split(' ')[0]],
    };

    setGoals([newGoal, ...goals]);
    setShowAddModal(false);

    // Reset Form
    setTitle('');
    setDestination('');
    setNotes('');
  };

  const handleDepositSavings = (goalId: string, amount: number) => {
    setGoals(
      goals.map((g) => {
        if (g.id === goalId) {
          const newSaved = Math.min(g.targetBudget, g.savedBudget + amount);
          return {
            ...g,
            savedBudget: newSaved,
            completed: newSaved >= g.targetBudget,
          };
        }
        return g;
      })
    );
  };

  const handleToggleMilestone = (goalId: string, index: number) => {
    setGoals(
      goals.map((g) => {
        if (g.id === goalId) {
          const updatedMilestones = [...g.milestones];
          updatedMilestones[index].done = !updatedMilestones[index].done;
          return { ...g, milestones: updatedMilestones };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
  };

  const handlePromoteBucketListToGoal = (dest: BucketListDestination) => {
    const newGoal: TravelGoal2027 = {
      id: `goal-bl-${Date.now()}`,
      title: `${dest.destination} Expedition`,
      destination: `${dest.destination}, ${dest.country}`,
      origin: 'New Delhi, India',
      targetMonth: 'September 2027',
      category: dest.category,
      targetBudget: dest.estimatedBudget,
      savedBudget: 0,
      completed: false,
      coverImage: dest.coverImage,
      notes: dest.description + (dest.notes ? ` Note: ${dest.notes}` : ''),
      milestones: [
        { text: 'Reserve flights and intercity transfers', done: false },
        { text: 'Finalize lodging and permits', done: false },
        { text: 'Gear packing and weather check', done: false },
      ],
      tags: ['2027Goal', ...dest.tags],
    };

    setGoals([newGoal, ...goals]);
    if (onShowToast) {
      onShowToast(
        'Promoted to 2027 Goals',
        `"${dest.destination}" added to your active 2027 Travel Goals!`,
        'success'
      );
    }
  };

  const totalTargetBudget = goals.reduce((acc, g) => acc + g.targetBudget, 0);
  const totalSavedBudget = goals.reduce((acc, g) => acc + g.savedBudget, 0);
  const overallProgress = totalTargetBudget > 0 ? Math.round((totalSavedBudget / totalTargetBudget) * 100) : 0;

  const filteredGoals = goals.filter((g) => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Ready to Book') return g.savedBudget >= g.targetBudget * 0.75;
    return g.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="py-6 border-b border-[#eaedff] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00685f]/10 text-[#00685f]">
                <span className="material-symbols-outlined text-[24px]">flag</span>
              </span>
              <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">2027 Travel Goals &amp; Resolutions</h1>
            </div>
            <p className="text-[14px] text-[#3d4947] mt-1">
              Create, save, and track your long-term dream expeditions and dedicated travel fund.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Add New 2027 Goal</span>
          </button>
        </div>

        {/* 2027 Goals Progress Dashboard Bar */}
        <div className="my-6 p-6 rounded-2xl bg-white border border-[#eaedff] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947]">
                2027 Expedition Fund Progress
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[28px] font-bold text-[#00685f]">₹{totalSavedBudget.toLocaleString()}</span>
                <span className="text-[14px] text-[#3d4947]">saved of ₹{totalTargetBudget.toLocaleString()} target</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[11px] uppercase font-bold text-[#3d4947] block">Active Goals</span>
                <span className="text-[20px] font-bold text-[#131b2e]">{goals.length} Expeditions</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-[#3d4947] block">Fund Readiness</span>
                <span className="text-[20px] font-bold text-[#006947]">{overallProgress}%</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#e2e7ff] h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#00685f] h-full rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Ready to Book', 'High Altitude', 'Eco Adventure', 'Marine', 'Desert'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#00685f] text-white shadow-xs'
                  : 'bg-white text-[#3d4947] border border-[#eaedff] hover:bg-[#f2f3ff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.savedBudget / goal.targetBudget) * 100));
            const remaining = Math.max(0, goal.targetBudget - goal.savedBudget);

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Header & Target Month */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e2e7ff] text-[#00685f]">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {goal.targetMonth}
                    </span>
                    <h3 className="text-[18px] font-bold text-[#131b2e] mt-1.5 leading-snug">{goal.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    title="Remove Goal"
                    className="text-[#bcc9c6] hover:text-[#ba1a1a] p-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                {/* Corridor info */}
                <div className="p-2.5 rounded-xl bg-[#f2f3ff] flex items-center justify-between text-[12px]">
                  <span className="text-[#3d4947]">
                    Starting: <strong className="text-[#131b2e]">{goal.origin.split(',')[0]}</strong>
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-[#00685f]">east</span>
                  <span className="text-[#3d4947]">
                    Destination: <strong className="text-[#00685f]">{goal.destination.split(',')[0]}</strong>
                  </span>
                </div>

                {/* Description */}
                <p className="text-[12px] text-[#3d4947] leading-relaxed line-clamp-2">{goal.notes}</p>

                {/* Milestones Checklist */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947] block mb-1.5">
                    Pre-Trip Milestones
                  </span>
                  <div className="space-y-1.5">
                    {goal.milestones.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggleMilestone(goal.id, idx)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f2f3ff] text-left transition-colors cursor-pointer"
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[12px] shrink-0 ${
                            m.done ? 'bg-[#00685f] border-[#00685f] text-white' : 'border-[#bcc9c6] bg-white'
                          }`}
                        >
                          {m.done && '✓'}
                        </span>
                        <span
                          className={`text-[12px] ${
                            m.done ? 'line-through text-[#bcc9c6]' : 'text-[#131b2e] font-medium'
                          }`}
                        >
                          {m.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Savings Progress */}
                <div className="pt-2 border-t border-[#eaedff] space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#3d4947]">
                      Saved: <strong className="text-[#00685f]">₹{goal.savedBudget.toLocaleString()}</strong> of ₹
                      {goal.targetBudget.toLocaleString()}
                    </span>
                    <span className="font-bold text-[#131b2e]">{progress}%</span>
                  </div>

                  <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00685f] h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {remaining > 0 ? (
                    <div className="flex items-center justify-between text-[11px] text-[#3d4947]">
                      <span>₹{remaining.toLocaleString()} remaining to save</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDepositSavings(goal.id, 1000)}
                          className="px-2 py-0.5 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#00685f] rounded font-bold cursor-pointer"
                        >
                          +₹1k
                        </button>
                        <button
                          onClick={() => handleDepositSavings(goal.id, 5000)}
                          className="px-2 py-0.5 bg-[#00685f] hover:bg-[#008378] text-white rounded font-bold cursor-pointer"
                        >
                          +₹5k
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-[#006947] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Fully Funded for 2027!
                    </div>
                  )}
                </div>

                {/* Action button: AI Plan */}
                <button
                  onClick={() => {
                    if (onPlanTripTo) {
                      onPlanTripTo(goal.origin, goal.destination);
                    }
                    onNavigate('planner', 'none');
                  }}
                  className="w-full py-2.5 bg-[#f2f3ff] hover:bg-[#00685f] hover:text-white text-[#00685f] rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Synthesize 2027 Itinerary with AI</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bucket List Destinations Section (Stores in Local Storage) */}
        <BucketListSection
          onPlanTripTo={onPlanTripTo}
          onPromoteToGoal={handlePromoteBucketListToGoal}
          onShowToast={onShowToast}
        />
      </div>

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddGoal}
            className="bg-white rounded-3xl max-w-lg w-full border border-[#eaedff] p-6 shadow-2xl space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[22px]">flag</span>
                <h3 className="text-[18px] font-bold text-[#131b2e]">Create Your 2027 Travel Goal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-[#f2f3ff] text-[#3d4947] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                Goal Title (What do you want to achieve?)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chadar Frozen River Trek / North East 7 Sisters Road Trip..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Departure City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi, India"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zanskar, Ladakh"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Target Month in 2027</label>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                >
                  <option value="January 2027">January 2027</option>
                  <option value="February 2027">February 2027</option>
                  <option value="March 2027">March 2027</option>
                  <option value="April 2027">April 2027</option>
                  <option value="May 2027">May 2027</option>
                  <option value="June 2027">June 2027</option>
                  <option value="July 2027">July 2027</option>
                  <option value="August 2027">August 2027</option>
                  <option value="September 2027">September 2027</option>
                  <option value="October 2027">October 2027</option>
                  <option value="November 2027">November 2027</option>
                  <option value="December 2027">December 2027</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. High Altitude / Coastal"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Target Budget (₹)</label>
                <input
                  type="number"
                  required
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Initial Saved (₹)</label>
                <input
                  type="number"
                  value={initialSaved}
                  onChange={(e) => setInitialSaved(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Notes &amp; Aspirations</label>
              <textarea
                rows={2}
                placeholder="Why do you want to do this trip? What sights are essential?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                Milestones / Checklist (comma separated)
              </label>
              <input
                type="text"
                value={milestonesInput}
                onChange={(e) => setMilestonesInput(e.target.value)}
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
                className="px-5 py-2 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                Save 2027 Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};
