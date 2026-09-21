import React, { useState } from 'react';
import { ScreenType, TransitionType } from '../types';

interface ExploreDestinationsProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
}

interface DestinationCard {
  id: string;
  name: string;
  state: string;
  category: 'Spiritual' | 'Mountain' | 'Heritage' | 'Coastal' | 'Nature' | 'Food';
  rating: number;
  reviewsCount: number;
  bestSeason: string;
  avgTemp: string;
  estBudgetPerDay: number;
  estDays: number;
  image: string;
  description: string;
  highlights: string[];
}

const DESTINATIONS: DestinationCard[] = [
  {
    id: 'dest-1',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Spiritual',
    rating: 4.9,
    reviewsCount: 1420,
    bestSeason: 'Oct - Mar',
    avgTemp: '22°C',
    estBudgetPerDay: 1800,
    estDays: 4,
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    description: 'The spiritual heart of India on the sacred Ganga, famed for timeless sunrise boat rides, silk weavers, and the evening Maha Aarti.',
    highlights: ['Dashashwamedh Aarti', 'Sunrise Boat Ride', 'Kashi Vishwanath Corridor', 'Blue Lassi & Malaiyo'],
  },
  {
    id: 'dest-2',
    name: 'Leh & Ladakh',
    state: 'Ladakh UT',
    category: 'Mountain',
    rating: 4.95,
    reviewsCount: 980,
    bestSeason: 'May - Sep',
    avgTemp: '16°C',
    estBudgetPerDay: 3500,
    estDays: 7,
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80',
    description: 'High-altitude desert wonderland featuring turquoise glacial lakes, ancient Buddhist gompas, and dramatic mountain passes over 5,000m.',
    highlights: ['Pangong Tso Lake', 'Khardung La Pass', 'Nubra Valley Sand Dunes', 'Thiksey Monastery'],
  },
  {
    id: 'dest-3',
    name: 'Jaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    rating: 4.8,
    reviewsCount: 2150,
    bestSeason: 'Oct - Mar',
    avgTemp: '24°C',
    estBudgetPerDay: 2400,
    estDays: 3,
    image: 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?w=800&auto=format&fit=crop&q=80',
    description: 'The Pink City of Maharajas, adorned with sandstone palaces, intricate honeycomb facades, astronomical observatories, and artisan bazaars.',
    highlights: ['Amber Palace', 'Hawa Mahal Dawn', 'Nahargarh Fort Sunset', 'Block Printing Workshops'],
  },
  {
    id: 'dest-4',
    name: 'South & North Goa',
    state: 'Goa',
    category: 'Coastal',
    rating: 4.75,
    reviewsCount: 3200,
    bestSeason: 'Nov - Feb',
    avgTemp: '28°C',
    estBudgetPerDay: 2800,
    estDays: 5,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    description: 'Golden palm-fringed coastlines, Latin Quarter heritage in Fontainhas, spice plantations, and breezy beachside shacks with coastal cuisine.',
    highlights: ['Fontainhas Latin Walk', 'Palolem Kayaking', 'Divar Island Ferry', 'Saturday Night Market'],
  },
  {
    id: 'dest-5',
    name: 'Alleppey & Kochi',
    state: 'Kerala',
    category: 'Nature',
    rating: 4.88,
    reviewsCount: 1640,
    bestSeason: 'Sep - Mar',
    avgTemp: '27°C',
    estBudgetPerDay: 2600,
    estDays: 5,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
    description: 'God’s Own Country backwater networks, traditional kettuvallam houseboats, fragrant spice gardens, and historic Fort Kochi colonial streets.',
    highlights: ['Backwater Canoe Cruise', 'Fort Kochi Chinese Nets', 'Kathakali Performance', 'Ayurvedic Wellness'],
  },
  {
    id: 'dest-6',
    name: 'Kolkata',
    state: 'West Bengal',
    category: 'Food',
    rating: 4.82,
    reviewsCount: 1890,
    bestSeason: 'Oct - Feb',
    avgTemp: '23°C',
    estBudgetPerDay: 1600,
    estDays: 4,
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    description: 'The City of Joy and cultural capital of India, renowned for grand colonial monuments, tram lines, literary cafes, and legendary sweets.',
    highlights: ['Victoria Memorial Hall', 'Howrah Bridge Viewpoint', 'College Street Boi Para', 'Kolkata Biryani & Rosogolla'],
  },
  {
    id: 'dest-7',
    name: 'Hampi Ruins',
    state: 'Karnataka',
    category: 'Heritage',
    rating: 4.92,
    reviewsCount: 1120,
    bestSeason: 'Nov - Feb',
    avgTemp: '26°C',
    estBudgetPerDay: 1900,
    estDays: 3,
    image: 'https://images.unsplash.com/photo-1600100397608-f010e42e5b74?w=800&auto=format&fit=crop&q=80',
    description: 'UNESCO boulder-strewn landscape of the ancient Vijayanagara Empire with monolithic stone chariots, musical pillars, and Tungabhadra sunsets.',
    highlights: ['Virupaksha Temple', 'Stone Chariot', 'Matanga Hill Sunrise', 'Sanapur Lake Coracle Ride'],
  },
  {
    id: 'dest-8',
    name: 'Meghalaya & Cherrapunji',
    state: 'Meghalaya',
    category: 'Nature',
    rating: 4.91,
    reviewsCount: 890,
    bestSeason: 'Oct - Apr',
    avgTemp: '19°C',
    estBudgetPerDay: 2500,
    estDays: 6,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    description: 'Abode of the Clouds featuring bio-engineered Double Decker Living Root Bridges, crystal clear Umngot River at Dawki, and plunging waterfalls.',
    highlights: ['Double Decker Root Bridge', 'Dawki Crystal Waters', 'Nohkalikai Falls', 'Mawsmai Limestone Caves'],
  },
];

export const ExploreDestinations: React.FC<ExploreDestinationsProps> = ({ onNavigate, onPlanTripTo }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [myStartingPoint, setMyStartingPoint] = useState('New Delhi, India');

  const categories = ['All', 'Spiritual', 'Mountain', 'Heritage', 'Coastal', 'Nature', 'Food'];

  const filtered = DESTINATIONS.filter((dest) => {
    if (selectedCategory !== 'All' && dest.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        dest.name.toLowerCase().includes(q) ||
        dest.state.toLowerCase().includes(q) ||
        dest.description.toLowerCase().includes(q) ||
        dest.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStartPlan = (destinationName: string) => {
    if (onPlanTripTo) {
      onPlanTripTo(myStartingPoint, destinationName);
    }
    onNavigate('planner', 'none');
  };

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        {/* Header with Origin Selector */}
        <div className="py-6 border-b border-[#eaedff] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00685f]/10 text-[#00685f]">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </span>
              <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">Explore Destinations</h1>
            </div>
            <p className="text-[14px] text-[#3d4947] mt-1">
              Handcrafted expeditions calibrated with weather insights, cultural highlights, and transit routes.
            </p>
          </div>

          {/* Starting Location Quick Selector */}
          <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-[#eaedff] shadow-xs">
            <span className="material-symbols-outlined text-[#00685f] text-[20px] ml-1">trip_origin</span>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-[#3d4947] block">Your Departure City</span>
              <select
                value={myStartingPoint}
                onChange={(e) => setMyStartingPoint(e.target.value)}
                className="text-[13px] font-bold text-[#131b2e] bg-transparent outline-none cursor-pointer pr-2"
              >
                <option value="New Delhi, India">New Delhi (DEL)</option>
                <option value="Mumbai, Maharashtra">Mumbai (BOM)</option>
                <option value="Bengaluru, Karnataka">Bengaluru (BLR)</option>
                <option value="Kolkata, West Bengal">Kolkata (CCU)</option>
                <option value="Chennai, Tamil Nadu">Chennai (MAA)</option>
                <option value="Hyderabad, Telangana">Hyderabad (HYD)</option>
                <option value="Pune, Maharashtra">Pune (PNQ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 my-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'bg-white text-[#3d4947] border border-[#eaedff] hover:bg-[#f2f3ff]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#3d4947]">
              search
            </span>
            <input
              type="text"
              placeholder="Search mountains, forts, lakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#eaedff] rounded-xl text-[13px] text-[#131b2e] placeholder-[#3d4947]/70 focus:outline-none focus:ring-2 focus:ring-[#00685f]/30"
            />
          </div>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-[#eaedff] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image & Tags */}
              <div className="relative h-48 w-full overflow-hidden bg-[#e2e7ff]">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#131b2e] backdrop-blur-md">
                    {dest.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdbca] text-[#9d4300] backdrop-blur-md">
                    ★ {dest.rating}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] text-[#e2e7ff] font-medium">{dest.state}</span>
                  <h3 className="text-[20px] font-bold leading-tight">{dest.name}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-[12px] text-[#3d4947] line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>

                {/* Season & Weather badges */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#f2f3ff] text-[11px]">
                  <div>
                    <span className="text-[#3d4947] block text-[10px] uppercase font-semibold">Best Window</span>
                    <span className="font-bold text-[#131b2e]">{dest.bestSeason}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#3d4947] block text-[10px] uppercase font-semibold">Avg Temp</span>
                    <span className="font-bold text-[#00685f]">{dest.avgTemp}</span>
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#3d4947]">Top Experiences</span>
                  <div className="flex flex-wrap gap-1">
                    {dest.highlights.slice(0, 2).map((h) => (
                      <span key={h} className="text-[11px] px-2 py-0.5 rounded-md bg-[#e2e7ff] text-[#131b2e]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Budget estimate */}
                <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#3d4947] block">Est. Daily Budget</span>
                    <span className="text-[13px] font-bold text-[#131b2e]">₹{dest.estBudgetPerDay.toLocaleString()}/day</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#00685f] bg-[#e2e7ff] px-2 py-0.5 rounded-full">
                    {dest.estDays} Days Ideal
                  </span>
                </div>

                {/* Action: Plan from my starting location */}
                <button
                  onClick={() => handleStartPlan(`${dest.name}, ${dest.state}`)}
                  className="w-full py-2.5 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Plan from {myStartingPoint.split(',')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
