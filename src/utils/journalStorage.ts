import { JournalEntry } from '../types';

const JOURNAL_STORAGE_KEY = 'travel_ai_journal_entries';

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'journal-kgp-mdn',
    title: 'Across the Kangsabati: Kharagpur to Medinipur Rail & Freedom Trail',
    destination: 'Medinipur (MDN)',
    origin: 'Kharagpur (KGP)',
    phase: 'past',
    visibility: 'public',
    author: 'Aarav Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: 'Sep 18, 2026',
    story: `I decided on a whim to cross the ancient Kangsabati River from Kharagpur to Medinipur. It was only an 18-minute journey on the Rupashi Bangla Express (12883), but stepping onto Medinipur station felt like walking into a living history book. 
    
From the historic Midnapore Collegiate School founded in 1834 to the tranquil sal forests of Gopegarh Heritage Eco-Park, the air carries stories of Rani Shiromani and the Chuar Rebellion. Sitting on the banks of the Kangsabati at Gandhi Ghat as the golden hour sun melted into the water reminded me why we travel: life just keeps going on, and waiting for the "perfect day" means missing today. Make the trip happen!`,
    transitInfo: 'Rupashi Bangla Express (12883) from Kharagpur Jn (Platform 7/8) to Medinipur (18 mins, ₹45). Return via evening Aranyak Express.',
    recommendedTrain: 'Rupashi Bangla Superfast Express #12883',
    mustVisitSpots: [
      'Gopegarh Heritage Eco-Park & Ancient Fort Vantage',
      'Vidyasagar Smriti Mandir Memorial Museum',
      'Karnagarh Mahamaya Temple (Chuar Rebellion center)',
      'Midnapore Collegiate School (1834 colonial heritage)',
      'Gandhi Ghat on the Kangsabati River'
    ],
    localFoodRecommendations: [
      'Authentic caramelized Medinipur Chhana-boda (burnt-crust paneer sweet)',
      'Traditional Babar Mishti & Khaja from Battala market',
      'Hot crisp Posto Bora (poppy seed patties) with Katla fish curry',
      'Morning singaras with roadside clay-pot chai'
    ],
    budgetSpentOrTarget: 1850,
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    tags: ['Express Rail', 'Heritage Walk', 'Kangsabati', 'Local Sweets', 'Bengal History'],
    likesCount: 142,
    isLiked: true,
    mottoQuote: 'Life is just going on. Life is too short, so make this trip happen!',
    practicalTips: [
      'Hop into an electric toto right outside Medinipur station; ₹15-₹20 covers almost any town sector.',
      'Head to Gopegarh Eco-Park by 3:30 PM to catch the sunset light through the sal tree canopies.',
      'Ask the sweet shop at Battala for warm Chhana-boda straight from the earthen oven.'
    ],
    rating: 5,
  },
  {
    id: 'journal-varanasi-live',
    title: 'Dawn Rowing Past Manikarnika & The Scent of Morning Incense',
    destination: 'Varanasi (BSB)',
    origin: 'New Delhi (DEL)',
    phase: 'present',
    visibility: 'public',
    author: 'Aarav Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: 'Currently Traveling • Today',
    story: `Currently writing this from a rooftop overlooking Dashashwamedh Ghat with a steaming cup of malai chai. Woke up at 5:00 AM while the city was still wrapped in blue mist. Our boatman, Rameshwar, pushed off from Assi Ghat as bells from morning Subah-e-Banaras aarti echoed across the water.

Watching life unfold along the river—yogis stretching, pilgrims dipping, smoke rising quietly from Manikarnika—gives you an immediate sense of scale. Life is so short, yet this river has witnessed centuries of human dreams. There is no better feeling than being here in the flesh rather than staring at photos on a phone screen.`,
    transitInfo: 'Vande Bharat Express (22436) from New Delhi to Varanasi Jn (8 hrs, CC class).',
    recommendedTrain: 'Vande Bharat Express #22436',
    mustVisitSpots: [
      'Assi Ghat morning Subah-e-Banaras music & aarti',
      'Dawn wooden boat cruise to Manikarnika Ghat',
      'Narrow silk-weaving alleyways of Madanpura',
      'Kashi Vishwanath Corridor at night under golden lights',
      'Blue Lassi corner near Manikarnika'
    ],
    localFoodRecommendations: [
      'Kachori Sabzi & Jalebi at Ram Bhandar (Thatheri Bazaar)',
      'Creamy Rabri Malaiyo (winter morning specialty)',
      'Banarasi Tamatar Chaat at Kashi Chaat Bhandar',
      'Paan with silver leaf at Godowlia Chowk'
    ],
    budgetSpentOrTarget: 6800,
    coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    tags: ['Live Expedition', 'Spiritual', 'Sunrise Boat', 'Street Food', 'Ganga'],
    likesCount: 289,
    isLiked: true,
    mottoQuote: 'Life is too short to watch life through a screen. Make this trip happen.',
    isQuickEntry: true,
    pinnedLocation: 'Assi Ghat, Varanasi',
    pinnedTime: '05:45 AM • Sunrise Aarti',
    pinnedMood: '✨ Wonder & Awe',
    currentTripId: 'trip-1',
    currentTripName: 'Varanasi Spiritual & Ghats Solo Expedition',
    practicalTips: [
      'Negotiate the wooden boat at Assi Ghat the evening before; ₹300-₹400 for 1.5 hours is fair.',
      'Wear slip-on shoes for visiting ghat shrines—you will take them off frequently.',
      'Avoid middle-men offering "silk warehouse tours" near the temple gates.'
    ],
    rating: 5,
  },
  {
    id: 'journal-darjeeling-future',
    title: 'Dream Route: Toy Train Steam Loops & Kanchenjunga Sunrise from Tiger Hill',
    destination: 'Darjeeling (DJ)',
    origin: 'Howrah (HWH)',
    phase: 'future',
    visibility: 'public',
    author: 'Aarav Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: 'Planned for Spring 2027',
    story: `This is my dream journal guide that I have been curating for over a year. The goal is to board the Vande Bharat from Howrah to New Jalpaiguri (NJP), then take the UNESCO heritage Darjeeling Himalayan Railway (DHR) toy train as it whistles through Batasia Loop.

I want to stand at Tiger Hill at 4:30 AM and watch the first ray of pink sunlight ignite the twin peaks of Mt. Kanchenjunga. After that, walk through Happy Valley Tea Estate, sip muscatel first-flush tea, and sit at Glenary’s with fresh apple pie. Life goes on whether we travel or stay put—so I am making this journey happen in 2027!`,
    transitInfo: 'Howrah to NJP via Vande Bharat (5.5 hrs), followed by DHR Steam Toy Train Joyride or shared SUV up Hill Cart Road (3 hrs).',
    recommendedTrain: 'Howrah - NJP Vande Bharat (22301) + DHR Toy Train Steam Joyride',
    mustVisitSpots: [
      'Tiger Hill sunrise viewpoint over Kanchenjunga',
      'Batasia Loop War Memorial rail curvature',
      'Happy Valley Tea Estate plantation tour',
      'Himalayan Mountaineering Institute & Zoo',
      'Historic Glenary’s Bakery & Pub on Mall Road'
    ],
    localFoodRecommendations: [
      'Hot Darjeeling Steamed Pork/Veg Momos with fiery dalle chilli chutney',
      'Warm Thukpa soup at Kunga Restaurant on Gandhi Road',
      'Glenary’s freshly baked Cinnamon rolls & First Flush Darjeeling Tea',
      'Traditional Churpi (Himalayan hard cheese snack)'
    ],
    budgetSpentOrTarget: 14500,
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
    tags: ['Dream Guide', 'Toy Train', 'Himalayas', 'Tea Trails', 'Kanchenjunga'],
    likesCount: 204,
    isLiked: false,
    mottoQuote: 'Life is just going on. Life is too short, so make this trip happen!',
    practicalTips: [
      'Book the DHR Steam Joyride at least 45 days in advance on IRCTC; seats sell out instantly.',
      'Bring layered thermals—even in April, dawn at Tiger Hill dips below 4°C.',
      'Walk the quiet Bhanu Bhakta Sarani loop around Observatory Hill for unhindered mountain views.'
    ],
    rating: 5,
  },
  {
    id: 'journal-bishnupur-rail',
    title: 'Terracotta Whispers: The Bishnupur Temple & Baluchari Silk Expedition',
    destination: 'Bishnupur (VSU)',
    origin: 'Kharagpur (KGP)',
    phase: 'past',
    visibility: 'public',
    author: 'Sunita Majumdar',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    date: 'Aug 29, 2026',
    story: `From Kharagpur Jn, Bishnupur is just an hour and twenty minutes away by express train. We boarded the early morning Aranyak Express. Bishnupur welcomes you with 17th-century terracotta temples sculpted under the Malla kings, where every brick depicts scenes from the Ramayana and Mahabharata.

Standing before the Rasmancha pyramid and the Jor Bangla temple leaves you speechless at the dedication of ancient artisans. We also sat with a master weaver watching the intricate Jacquard loom weave mythological tales into Baluchari sarees. Don’t push off travel—these timeless places are waiting right at your doorstep.`,
    transitInfo: 'Direct Express train from Kharagpur (KGP) to Bishnupur (VSU) — Aranyak Express or Rupashi Bangla (~1h 20m, ₹55).',
    recommendedTrain: 'Aranyak Express #12885',
    mustVisitSpots: [
      'Rasmancha (Unique pyramidal terracotta monument)',
      'Jor Bangla Temple with exquisite terracotta panels',
      'Shyam Rai Temple featuring 5 terracotta spires',
      'Dalmadal Cannon (Historic Malla royal artillery)',
      'Baluchari Silk Weaving Hub & Shankhari Bazaar'
    ],
    localFoodRecommendations: [
      'Authentic Bishnupuri Posto-Halwa (sweet roasted poppy seed paste dessert)',
      'Mecha Sandesh & Khaja from Shankhari Bazar',
      'Traditional Bengali lunch plate with Shukto, Machher Kalia, and Chatni'
    ],
    budgetSpentOrTarget: 2200,
    coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    tags: ['Terracotta', 'Malla Heritage', 'Express Train', 'Handloom', 'Baluchari'],
    likesCount: 167,
    isLiked: false,
    mottoQuote: 'Life goes on, so make this trip happen.',
    practicalTips: [
      'Rent a toto for half a day (₹350-₹450) to cover all 8 major terracotta monuments efficiently.',
      'Purchase Baluchari sarees directly from the Tantuja government weaver societies to avoid markups.',
      'Carry water bottles and an umbrella during afternoon temple walks.'
    ],
    rating: 5,
  },
  {
    id: 'journal-jhargram-forest',
    title: 'Whispering Sal Forests & Palace Heritage of Junglemahal',
    destination: 'Jhargram (JGM)',
    origin: 'Kharagpur (KGP)',
    phase: 'past',
    visibility: 'private',
    author: 'Aarav Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: 'Jul 12, 2026',
    story: `My personal quiet weekend escape into the red-soil heartland of Junglemahal. Just 35 minutes on the Steel Express from Kharagpur. The air smelled of damp earth and wild eucalyptus. 
    
Walked through the gardens of Jhargram Rajbari, followed the winding red dirt roads into Chilkigarh Kanak Durga temple beside the Dulung River. It was a journey of pure stillness. A reminder to slow down and listen to one’s own heartbeat.`,
    transitInfo: 'Steel Express (12813) or Ispat Express from Kharagpur to Jhargram (~35 mins, ₹35).',
    recommendedTrain: 'Steel Express #12813',
    mustVisitSpots: [
      'Jhargram Rajbari (Palace heritage grounds)',
      'Chilkigarh Sacred Grove & Kanak Durga Temple',
      'Dulung River pebble embankment',
      'Kendua Bird Sanctuary'
    ],
    localFoodRecommendations: [
      'Rustic Country Chicken curry with steaming Gobindobhog rice',
      'Sal leaf wrapped Posto Bora',
      'Mahua tea and local palm jaggery sandesh'
    ],
    budgetSpentOrTarget: 1600,
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    tags: ['Forest Trail', 'Quiet Escape', 'Red Soil', 'Personal Journal', 'Riverbank'],
    likesCount: 45,
    isLiked: false,
    mottoQuote: 'Life is too short — make this trip happen!',
    practicalTips: [
      'Best visited right after monsoon when the sal forests are vibrant green.',
      'Stay overnight in the heritage wing of Jhargram Palace for an authentic royal feel.'
    ],
    rating: 5,
  }
];

export function getStoredJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(INITIAL_JOURNAL_ENTRIES));
      return INITIAL_JOURNAL_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(INITIAL_JOURNAL_ENTRIES));
      return INITIAL_JOURNAL_ENTRIES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading journal entries from storage:', err);
    return INITIAL_JOURNAL_ENTRIES;
  }
}

export function saveStoredJournalEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('journal-updated', { detail: { entries } }));
  } catch (err) {
    console.error('Error saving journal entries:', err);
  }
}

export function addJournalEntry(newEntryData: Omit<JournalEntry, 'id' | 'likesCount' | 'isLiked'>): JournalEntry {
  const current = getStoredJournalEntries();
  const entry: JournalEntry = {
    ...newEntryData,
    id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    likesCount: 1,
    isLiked: false,
    mottoQuote: newEntryData.mottoQuote || 'Life is just going on. Life is too short, so make this trip happen!',
  };
  const updated = [entry, ...current];
  saveStoredJournalEntries(updated);
  return entry;
}

export function toggleLikeJournalEntry(id: string): JournalEntry[] {
  const current = getStoredJournalEntries();
  const updated = current.map((item) => {
    if (item.id === id) {
      const nextLiked = !item.isLiked;
      return {
        ...item,
        isLiked: nextLiked,
        likesCount: nextLiked ? item.likesCount + 1 : Math.max(0, item.likesCount - 1),
      };
    }
    return item;
  });
  saveStoredJournalEntries(updated);
  return updated;
}

export function deleteJournalEntry(id: string): JournalEntry[] {
  const current = getStoredJournalEntries();
  const updated = current.filter((item) => item.id !== id);
  saveStoredJournalEntries(updated);
  return updated;
}

export function updateJournalEntry(updatedEntry: JournalEntry): JournalEntry[] {
  const current = getStoredJournalEntries();
  const updated = current.map((item) => (item.id === updatedEntry.id ? updatedEntry : item));
  saveStoredJournalEntries(updated);
  return updated;
}

export function getJournalEntryById(id: string): JournalEntry | undefined {
  const current = getStoredJournalEntries();
  return current.find((item) => item.id === id);
}
