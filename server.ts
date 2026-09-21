import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// 1. Health check & Gemini status
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    model: 'gemini-flash-latest',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/gemini/status', (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const configured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0);
  res.json({
    configured,
    model: 'gemini-flash-latest',
    message: configured
      ? 'Gemini API is configured and ready.'
      : 'GEMINI_API_KEY environment variable is not configured. Set it in Settings to enable live AI responses.',
  });
});

// Helper to generate a robust local itinerary when offline or Gemini API is not yet configured
function generateLocalTripPlan(params: {
  origin: string;
  destination: string;
  durationDays: number;
  budget: string;
  transitMode: string;
  partyType: string;
  interests: string[];
  stayStyle: string;
}) {
  const { origin, destination, durationDays, budget, transitMode, partyType, interests, stayStyle } = params;
  const originClean = origin.split(',')[0].trim();
  const destClean = destination.split(',')[0].trim();
  const lowerOrig = origin.toLowerCase();
  const lowerDest = destination.toLowerCase();

  const isKgpMdn =
    (lowerOrig.includes('kharagpur') && (lowerDest.includes('medinipur') || lowerDest.includes('midnapore'))) ||
    ((lowerOrig.includes('medinipur') || lowerOrig.includes('midnapore')) && lowerDest.includes('kharagpur'));

  const parsedBudget = parseInt(budget.replace(/[^0-9]/g, ''), 10) || 6000;
  const dailySpend = Math.round(parsedBudget / Math.max(1, durationDays));

  if (isKgpMdn) {
    const days = [
      {
        dayNumber: 1,
        theme: 'Cross-Kangsabati Rail Journey & Historic Medinipur Arrival',
        activities: [
          {
            timeSlot: 'Morning' as const,
            title: 'Board Express Train from Kharagpur Jn (KGP)',
            description: 'Board Rupashi Bangla Express (12883) or the Howrah-Medinipur Fast EMU from Kharagpur Platform 7/8. Experience the breezy 18-minute scenic rail crossing over the Kangsabati (Kasai) river bridge.',
            location: 'Kharagpur Junction ➔ Medinipur Station (MDN)',
            costEstimate: '₹15 - ₹45',
            tag: 'Express Rail'
          },
          {
            timeSlot: 'Afternoon' as const,
            title: 'Gopegarh Heritage Eco-Park & Fort Ruins',
            description: 'Explore the historic Gopegarh Eco-Park, set amidst lush sal forests and remnants of Raja Gope’s ancient fort, offering panoramic vantage points over the river valley.',
            location: 'Gopegarh Ecopark, Medinipur outskirts',
            costEstimate: '₹40 entry',
            tag: 'Heritage & Nature'
          },
          {
            timeSlot: 'Evening' as const,
            title: 'Vidyasagar Smriti Mandir & Traditional Mishti Trail',
            description: 'Visit the memorial museum dedicated to educator Ishwar Chandra Vidyasagar, followed by tasting celebrated authentic Medinipur Chhana-boda and Babar Mishti in Battala bazaar.',
            location: 'Midnapore Town Center & Battala',
            costEstimate: '₹120',
            tag: 'Culinary & Culture'
          }
        ],
        culinaryRecommendation: 'Famous Medinipur Chhana-boda (burnt-crust paneer sweet) and hot singaras.',
        transitTip: 'Frequent battery toto-rickshaws (₹15-₹20) connect Medinipur station to all central heritage quarters.'
      }
    ];

    if (durationDays >= 2) {
      days.push({
        dayNumber: 2,
        theme: 'Temple Heritage, Revolutionary Sites & Riverfront Sunset',
        activities: [
          {
            timeSlot: 'Morning' as const,
            title: 'Khargeswar Shiva & Karnagarh Mahamaya Temples',
            description: 'Early morning visit to the centuries-old Khargeswar Temple and Karnagarh, the epicenter of the historic Chuar Rebellion led by Rani Shiromani.',
            location: 'Karnagarh & Khargeswar, North Medinipur',
            costEstimate: '₹150 toto share',
            tag: 'Historic Pilgrimage'
          },
          {
            timeSlot: 'Afternoon' as const,
            title: 'Historic Midnapore Collegiate School & Craft Walk',
            description: 'Walk through the 1834 colonial heritage campus of Midnapore Collegiate School and observe local bell-metal and bamboo handicraft artisans.',
            location: 'Collegiate Quarters, Medinipur',
            costEstimate: 'Free entry',
            tag: 'Architecture'
          },
          {
            timeSlot: 'Evening' as const,
            title: 'Kangsabati Riverside Sunset & Return Express Transit',
            description: 'Catch golden hour reflections over the Kangsabati River at Gandhi Ghat, then board the evening Aranyak Express (12886) back across the bridge to Kharagpur.',
            location: 'Gandhi Ghat / MDN Station',
            costEstimate: '₹35 rail fare',
            tag: 'Golden Hour'
          }
        ],
        culinaryRecommendation: 'Posto Bora (poppy seed fritters) with authentic Katla Machher Jhol at a heritage dining canteen.',
        transitTip: 'Aranyak Express departs MDN around 06:20 PM, arriving back at KGP in under 20 minutes.'
      });
    }

    if (durationDays >= 3) {
      for (let d = 3; d <= durationDays; d++) {
        days.push({
          dayNumber: d,
          theme: `Medinipur & Junglemahal Exploration (Day ${d})`,
          activities: [
            {
              timeSlot: 'Morning' as const,
              title: 'Excursion to Jhargram Royal Palace & Kanak Durga',
              description: 'Short 35-min connecting train ride into neighboring Jhargram sal forest belt to explore the royal palace estate and Kanak Durga temple.',
              location: 'Jhargram corridor',
              costEstimate: '₹60 rail fare',
              tag: 'Forest Heritage'
            },
            {
              timeSlot: 'Afternoon' as const,
              title: 'Local Tribal Art & Dokra Metalcraft Workshops',
              description: 'Interact with local tribal artisan cooperatives crafting brass Dokra sculptures and traditional Madur grass mats.',
              location: 'Regional Craft Center',
              costEstimate: '₹200 souvenir',
              tag: 'Folk Crafts'
            },
            {
              timeSlot: 'Evening' as const,
              title: 'Kharagpur Railway Heritage Museum & Platform Stroll',
              description: 'Conclude your journey visiting Kharagpur Junction’s open-air steam locomotive museum and the world-famous 1,072-meter platform.',
              location: 'Kharagpur Junction Rail Museum',
              costEstimate: '₹30 entry',
              tag: 'Rail Heritage'
            }
          ],
          culinaryRecommendation: 'Fresh gur roshogolla and Bengali luchi alur dom.',
          transitTip: 'Use regional MEMU locals for inexpensive same-day junglemahal excursions.'
        });
      }
    }

    return {
      title: `${originClean} to ${destClean} Heritage & Rail Corridor`,
      tagline: 'A seamless 14 km cross-Kangsabati rail journey connecting the Kharagpur junction to Medinipur’s freedom-movement roots.',
      corridor: `${originClean} (KGP) ➔ ${destClean} (MDN)`,
      distanceKm: 14,
      isShortDistance: true,
      transitSummary: 'Superfast & Local Express Rail: Rupashi Bangla (12883), Aranyak Express (12885), and frequent Howrah-Medinipur EMU locals (15-20 mins, ₹10-₹45). Road takes ~25 mins via Kangsabati bridge.',
      recommendedTrains: [
        {
          name: 'Rupashi Bangla Express',
          number: '12883',
          type: 'Superfast Express',
          duration: '18 mins',
          fareEstimate: '₹45 (2S) / ₹115 (CC)',
          frequency: 'Daily (Morning & Evening)',
          originStation: 'Kharagpur Junction (KGP)',
          destStation: 'Medinipur (MDN)',
          tips: 'Punctual chair car connection across Kangsabati bridge.'
        },
        {
          name: 'Aranyak Express',
          number: '12885',
          type: 'Superfast Express',
          duration: '18 mins',
          fareEstimate: '₹45 (2S) / ₹115 (CC)',
          frequency: 'Daily (Morning & Evening)',
          originStation: 'Kharagpur Junction (KGP)',
          destStation: 'Medinipur (MDN)',
          tips: 'Ideal morning express with smooth connectivity.'
        },
        {
          name: 'Howrah - Medinipur Fast EMU Local',
          number: '38811',
          type: 'Express',
          duration: '20 mins',
          fareEstimate: '₹10 - ₹15',
          frequency: '18+ daily trains',
          originStation: 'Kharagpur Jn Platform 7/8',
          destStation: 'Medinipur Station',
          tips: 'Frequent unreserved suburban local, tickets directly at station UTS counters.'
        },
        {
          name: 'Kharagpur - Medinipur MEMU Passenger',
          number: '68001',
          type: 'MEMU / Passenger',
          duration: '15 mins',
          fareEstimate: '₹10',
          frequency: 'Runs every 30-45 mins',
          originStation: 'Kharagpur Junction',
          destStation: 'Medinipur',
          tips: 'Direct district shuttle train.'
        }
      ],
      durationDays,
      totalBudget: parsedBudget,
      dailySpend,
      partyType,
      interests,
      stayStyle,
      days,
      localFoodHighlights: [
        'Medinipur Chhana-boda (Caramelized burnt-cottage-cheese sweet)',
        'Authentic Babar Mishti & Khaja from Battala',
        'Posto Bora (crisp poppy seed patties)',
        'Local Kangsabati river Katla Machher Jhol'
      ],
      hiddenGems: [
        'Gopegarh Heritage Eco-Park high above the river valley',
        'Karnagarh Mahamaya Temple and Rani Shiromani ruins',
        '1834 historic Midnapore Collegiate School archive',
        'Kharagpur Platform 1-12 historic rail display'
      ],
      packingEssentials: [
        'Comfortable cotton walking attire for town walks',
        'Small daypack with water bottle for eco-park trails',
        'Light footwear suitable for temple visits',
        'Camera or smartphone for Kangsabati river sunset'
      ]
    };
  }

  // Generic dynamic generator for any city, village, or station
  const days = [];
  for (let d = 1; d <= durationDays; d++) {
    days.push({
      dayNumber: d,
      theme: d === 1
        ? `Departure from ${originClean} & Arrival in ${destClean}`
        : d === durationDays
        ? `Heritage Markets & Return Transit to ${originClean}`
        : `Immersive Exploration of ${destClean} (Day ${d})`,
      activities: [
        {
          timeSlot: 'Morning' as const,
          title: d === 1 ? `Morning Express Transit from ${originClean}` : `Signature Sightseeing in ${destClean}`,
          description: d === 1
            ? `Board your scheduled ${transitMode === 'flight' ? 'flight' : 'Express Train'} from ${originClean}. Transfer upon arrival in ${destClean} to your ${stayStyle.toLowerCase()} accommodation.`
            : `Morning walking tour covering celebrated cultural landmarks, gardens, and heritage monuments across ${destClean}.`,
          location: d === 1 ? `${originClean} Central Hub ➔ ${destClean}` : `${destClean} Historic District`,
          costEstimate: `₹${Math.round(dailySpend * 0.35)}`,
          tag: d === 1 ? 'Transit' : 'Sightseeing'
        },
        {
          timeSlot: 'Afternoon' as const,
          title: `Artisans, Museums & Local Cuisine`,
          description: `Experience the authentic culinary scene of ${destClean} followed by visiting local artisan markets and cultural exhibitions.`,
          location: `${destClean} Bazaar & Cultural Quarter`,
          costEstimate: `₹${Math.round(dailySpend * 0.3)}`,
          tag: 'Culinary & Culture'
        },
        {
          timeSlot: 'Evening' as const,
          title: d === durationDays ? `Farewell Sunset & Transit Prep` : `Scenic Sunset Point & Street Food Stroll`,
          description: d === durationDays
            ? `Last-minute souvenir shopping in the local market before boarding return transit back home to ${originClean}.`
            : `Relaxing sunset viewpoint or promenade walk followed by an authentic regional dinner curated for ${partyType} travelers.`,
          location: `${destClean} Scenic Promenade`,
          costEstimate: `₹${Math.round(dailySpend * 0.25)}`,
          tag: 'Sunset & Dinner'
        }
      ],
      culinaryRecommendation: `Local specialty street food and celebrated dessert of ${destClean}.`,
      transitTip: `Use regional ${transitMode === 'train' ? 'train connections and local e-rickshaws' : 'local cabs'} for convenient transport.`
    });
  }

  return {
    title: `${originClean} to ${destClean} Expedition`,
    tagline: `A tailor-made ${durationDays}-day journey calibrated for ${partyType} travel with ${stayStyle} stays.`,
    corridor: `${originClean} ➔ ${destClean}`,
    distanceKm: 250,
    isShortDistance: false,
    transitSummary: `Recommended transit via Express Train / ${transitMode}.`,
    recommendedTrains: [
      {
        name: `${originClean} - ${destClean} Superfast Express`,
        number: '12801',
        type: 'Superfast Express',
        duration: '4h 15m',
        fareEstimate: '₹220 (2S) / ₹680 (3AC)',
        frequency: 'Daily',
        originStation: `${originClean} Junction`,
        destStation: `${destClean} Station`,
        tips: 'Book tickets 10-14 days in advance via IRCTC.'
      },
      {
        name: `${originClean} - ${destClean} Vande Bharat Express`,
        number: '20815',
        type: 'Vande Bharat',
        duration: '3h 10m',
        fareEstimate: '₹850 (Chair Car)',
        frequency: '6 days a week',
        originStation: `${originClean} Central`,
        destStation: `${destClean} Terminal`,
        tips: 'Fastest daytime connection with included catering.'
      }
    ],
    durationDays,
    totalBudget: parsedBudget,
    dailySpend,
    partyType,
    interests,
    stayStyle,
    days,
    localFoodHighlights: [
      `Signature regional curries and breads of ${destClean}`,
      'Traditional heritage sweets and street chaat',
      'Fresh local seasonal fruits and artisan beverages'
    ],
    hiddenGems: [
      `Quiet colonial courtyard or heritage library in ${destClean}`,
      'Lesser-known sunset ridge overlooking the valley',
      'Traditional weaver or artisan quarter'
    ],
    packingEssentials: [
      'Comfortable walking shoes with traction',
      'Power bank and offline maps',
      'Universal adapter and personal medication kit',
      'Light weather-appropriate layers'
    ]
  };
}

// 2. Universal Gemini Content Generation
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, systemInstruction } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A valid text prompt is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
        text: `🧭 Travel AI Co-pilot Advice for "${prompt}":\n\n- Punctuality: For train travel, arrive at your departure station 20 minutes prior to departure.\n- Route Selection: Use Express Trains (like Rupashi Bangla, Aranyak, or Vande Bharat) for fast city-to-town transit.\n- Local Transit: Totot/e-rickshaws are the most cost-effective way to get around regional towns and stations.\n- Offline Access: Download local route maps in advance for seamless navigation in rural or village areas.\n\n*(Gemini Live Mode activates automatically when GEMINI_API_KEY is configured in Settings.)*`,
        model: 'travel-ai-engine'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction:
              typeof systemInstruction === 'string'
                ? systemInstruction
                : 'You are Travel AI, an expert travel consultant specializing in itinerary planning, Indian Railways express trains, local hidden gems, transit options, and packing advice. Provide structured, concise, and inspiring answers.',
          }
        : {
            systemInstruction:
              'You are Travel AI, an expert travel companion. Provide practical, high-value advice with specific landmarks, budget considerations, and local tips.',
          },
    });

    const text = response.text || 'No response generated.';
    return res.json({ text, model: 'gemini-flash-latest', isFallback: false });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Return resilient 200 with fallback so user is never disconnected
    return res.json({
      fallback: true,
      text: `🧭 Travel AI Co-pilot Advice for "${req.body?.prompt || 'your journey'}":\n\n- Check live train running status via Indian Railways / NTES.\n- Ensure tickets are confirmed in advance for popular corridors.\n- In regional towns, battery auto-rickshaws provide smooth last-mile connectivity from stations.`,
      model: 'travel-ai-engine'
    });
  }
});

// 3. New Dedicated End-to-End Gemini Trip Planner Endpoint
app.post('/api/gemini/plan-trip', async (req: Request, res: Response) => {
  try {
    const {
      origin = 'Kharagpur',
      destination = 'Medinipur',
      durationDays = 2,
      budget = '6,000',
      transitMode = 'train',
      partyType = 'solo',
      interests = ['history', 'culture'],
      stayStyle = 'Budget'
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `
You are Travel AI, an elite travel consultant and expert on global destinations and Indian Railways networks (train names, express trains, local EMUs, MEMUs, station codes like KGP, MDN, HWH, NDLS, BSB).

Generate a complete, realistic, structured travel plan for:
- Origin: "${origin}"
- Destination: "${destination}"
- Duration: ${durationDays} days
- Total Budget: INR ₹${budget}
- Preferred Transit: ${transitMode}
- Travel Party: ${partyType}
- Interests: ${Array.isArray(interests) ? interests.join(', ') : interests}
- Stay Style: ${stayStyle}

CRITICAL ROUTING INSTRUCTIONS:
1. If the origin and destination are nearby regional stations/towns (e.g. Kharagpur and Medinipur/Midnapore, which are twin towns in West Bengal ~14 km apart across the Kangsabati River):
   - Acknowledge the exact short distance (~14 km) and quick travel time (~18-25 mins).
   - Recommend real express and local trains: Rupashi Bangla Express (12883), Aranyak Express (12885), Howrah-Medinipur Fast EMU, or Kharagpur-Medinipur MEMU.
   - For Medinipur, include real places: Gopegarh Heritage Eco-Park, Vidyasagar Smriti Mandir, Karnagarh Temple, Khargeswar Temple, Kangsabati riverbank (Gandhi Ghat), and historic Midnapore Collegiate School.
   - For Medinipur foods: mention Chhana-boda, Babar Mishti, and Posto Bora.
2. If between any other cities, villages, or stations, specify real train names (Express, Superfast, Mail, Vande Bharat, Rajdhani, or MEMU) and real local places.

Respond with ONLY a valid, parseable JSON object matching this schema (no code blocks, no backticks, no markdown):
{
  "title": "String title",
  "tagline": "Inspiring tagline",
  "corridor": "${origin} ➔ ${destination}",
  "distanceKm": number,
  "isShortDistance": boolean,
  "transitSummary": "Summary of transit options, highlighting ${transitMode}",
  "recommendedTrains": [
    {
      "name": "Train Name",
      "number": "Train Number",
      "type": "Superfast Express | Express | MEMU / Passenger | Vande Bharat",
      "duration": "e.g. 18 mins or 4h 30m",
      "fareEstimate": "e.g. ₹15 - ₹45",
      "frequency": "Daily / Hourly / Frequent",
      "originStation": "Origin Station Code & Name",
      "destStation": "Destination Station Code & Name",
      "tips": "Platform or booking tip"
    }
  ],
  "days": [
    {
      "dayNumber": 1,
      "theme": "Theme title",
      "activities": [
        {
          "timeSlot": "Morning",
          "title": "Activity name",
          "description": "Realistic details",
          "location": "Location name",
          "costEstimate": "₹XXX",
          "tag": "Transit / Heritage / Food / Nature"
        },
        {
          "timeSlot": "Afternoon",
          "title": "Activity name",
          "description": "Realistic details",
          "location": "Location name",
          "costEstimate": "₹XXX",
          "tag": "Culture / Museum / Market"
        },
        {
          "timeSlot": "Evening",
          "title": "Activity name",
          "description": "Realistic details",
          "location": "Location name",
          "costEstimate": "₹XXX",
          "tag": "Sunset / Dining / Walk"
        }
      ],
      "culinaryRecommendation": "Specific local food",
      "transitTip": "Specific local transit tip"
    }
  ],
  "localFoodHighlights": ["Dish 1", "Dish 2", "Dish 3"],
  "hiddenGems": ["Gem 1", "Gem 2", "Gem 3"],
  "packingEssentials": ["Item 1", "Item 2", "Item 3", "Item 4"]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
        });

        const rawText = response.text || '';
        const cleanedJson = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(cleanedJson);
        const parsedBudget = parseInt(String(budget).replace(/[^0-9]/g, ''), 10) || 6000;
        const dailySpend = Math.round(parsedBudget / Math.max(1, durationDays));

        return res.json({
          success: true,
          isAiGenerated: true,
          model: 'gemini-flash-latest',
          plan: {
            id: `plan-${Date.now()}`,
            ...parsed,
            durationDays,
            totalBudget: parsedBudget,
            dailySpend,
            partyType,
            interests,
            stayStyle,
          }
        });
      } catch (geminiError) {
        console.warn('Gemini parsing or request failed, providing smart travel engine fallback:', geminiError);
      }
    }

    // High-intelligence fallback (never returns error, avoids any disconnect)
    const localPlan = generateLocalTripPlan({
      origin,
      destination,
      durationDays,
      budget,
      transitMode,
      partyType,
      interests,
      stayStyle
    });

    return res.json({
      success: true,
      isAiGenerated: false,
      model: 'travel-ai-engine',
      plan: {
        id: `plan-${Date.now()}`,
        ...localPlan
      }
    });
  } catch (error: any) {
    console.error('Plan Trip Error:', error);
    const fallbackPlan = generateLocalTripPlan({
      origin: req.body?.origin || 'Kharagpur',
      destination: req.body?.destination || 'Medinipur',
      durationDays: req.body?.durationDays || 2,
      budget: req.body?.budget || '6,000',
      transitMode: req.body?.transitMode || 'train',
      partyType: req.body?.partyType || 'solo',
      interests: req.body?.interests || ['history'],
      stayStyle: req.body?.stayStyle || 'Budget'
    });
    return res.json({
      success: true,
      isAiGenerated: false,
      model: 'travel-ai-engine',
      plan: { id: `plan-${Date.now()}`, ...fallbackPlan }
    });
  }
});

// 4. Interactive Gemini Travel Bot Chat Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const ai = getGeminiClient();
    const origin = context?.origin || 'Kharagpur';
    const destination = context?.destination || 'Medinipur';
    const transitMode = context?.transitMode || 'train';

    if (ai) {
      try {
        const chatPrompt = `
You are the Gemini Travel AI Bot inside a trip planning app.
Current Journey Context:
- Origin: ${origin}
- Destination: ${destination}
- Selected Transit Mode: ${transitMode}

User Question: "${message}"

Provide a concise, extremely helpful, accurate response (1-2 paragraphs max or bullet points). If the user asks about train schedules, fares, express trains, or stations between Kharagpur (KGP) and Medinipur (MDN), mention the Rupashi Bangla Express (12883), Aranyak Express (12885), or Howrah-Medinipur Fast EMUs (takes ~18-20 mins, ₹10-₹45). Be friendly and direct.
`;
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: chatPrompt,
        });

        return res.json({
          reply: response.text || 'I am ready to help you plan your journey.',
          model: 'gemini-flash-latest',
          isAiGenerated: true
        });
      } catch (err) {
        console.warn('Gemini chat error:', err);
      }
    }

    // Smart contextual response if Gemini API key is not configured or disconnected
    const lower = message.toLowerCase();
    let reply = `Here is key travel advice for ${origin} ➔ ${destination}:`;

    if (lower.includes('train') || lower.includes('express') || lower.includes('rail') || lower.includes('memu')) {
      if (origin.toLowerCase().includes('kharagpur') || destination.toLowerCase().includes('medinipur')) {
        reply = `🚆 **Kharagpur (KGP) to Medinipur (MDN) Express Trains:**\n\n` +
          `• **Rupashi Bangla Express (12883):** Departs KGP at 08:32 AM, arrives MDN at 08:50 AM (~18 mins). Fare: ₹45 (2S) / ₹115 (CC).\n` +
          `• **Aranyak Express (12885):** Departs KGP at 09:40 AM & 06:20 PM (~18 mins). Fare: ₹45.\n` +
          `• **Howrah - Medinipur Fast EMU:** Runs every 30-45 mins from Platform 7/8 at KGP (~20 mins, ₹10-₹15 fare, unreserved).\n` +
          `• **Kharagpur - Medinipur MEMU:** Direct shuttle across Kangsabati bridge (~15 mins, ₹10).`;
      } else {
        reply = `🚆 **Express Train Intelligence for ${origin} ➔ ${destination}:**\n\n` +
          `• Daily Superfast and Intercity Express trains run this corridor.\n` +
          `• Check IRCTC or NTES for confirmed berth availability in Sleeper or 3AC.\n` +
          `• Tatkal booking opens at 10:00 AM (AC) and 11:00 AM (Non-AC) one day prior to departure.`;
      }
    } else if (lower.includes('food') || lower.includes('eat') || lower.includes('sweet')) {
      reply = `🍲 **Culinary Highlights in ${destination}:**\n\n` +
        `• Must-try: Authentic Chhana-boda (burnt cottage cheese sweet) and Babar Mishti in Battala bazaar.\n` +
        `• Savory: Hot crisp Posto Bora (poppy seed patties) with steamed rice and Katla machher jhol.\n` +
        `• Street bites: Evening singara (samosa) and phuchka near town market.`;
    } else if (lower.includes('place') || lower.includes('sight') || lower.includes('see') || lower.includes('attraction')) {
      reply = `🏛️ **Top Sights to Explore in ${destination}:**\n\n` +
        `1. **Gopegarh Heritage Eco-Park:** Scenic sal tree forest and fort ruins overlooking Kangsabati gorge.\n` +
        `2. **Vidyasagar Smriti Mandir:** Museum honoring legendary educator Ishwar Chandra Vidyasagar.\n` +
        `3. **Khargeswar & Karnagarh Temples:** Historic terracotta and stone temples linked to the Chuar movement.\n` +
        `4. **Kangsabati River Embankment:** Peaceful sunset views along Gandhi Ghat.`;
    } else {
      reply = `🧭 **Travel Advisory for ${origin} ➔ ${destination}:**\n\n` +
        `The ${origin} to ${destination} journey is best experienced via Express Rail. For local sightseeing, electric toto-rickshaws cost ₹15-₹30 per trip. Early mornings and late afternoons offer the best weather for walking tours.`;
    }

    return res.json({
      reply,
      model: 'travel-ai-engine',
      isAiGenerated: false
    });
  } catch (error: any) {
    return res.json({
      reply: 'Travel AI is active and ready to help you plan routes, stations, and express trains.',
      model: 'travel-ai-engine',
      isAiGenerated: false
    });
  }
});

// 5. Specialized Travel Assistant Endpoint
app.post('/api/gemini/travel-assistant', async (req: Request, res: Response) => {
  const { query, destination, durationDays, budget, interests, transitMode } = req.body || {};
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
        text: `### Smart Plan for ${destination || 'your destination'}\n\nBased on your travel request, here is a curated route focused on ${interests?.join(', ') || 'local heritage and rail travel'}:\n\n- **Transit:** Board an Express Train or MEMU local for prompt connectivity.\n- **Sights:** Visit major landmark sites during early morning hours to avoid afternoon heat.\n- **Dining:** Sample regional culinary specialties at historic town bazaars.\n\n*(Connect your GEMINI_API_KEY in Settings to enable live neural agent briefings.)*`,
        recommendation: {
          title: `Smart Plan for ${destination || 'your destination'}`,
          overview: `Curated route focused on ${interests?.join(', ') || 'local culture'}.`,
          highlights: [
            'Visit iconic heritage landmarks in early morning hours',
            'Sample celebrated local cuisine at historic neighborhood eateries',
            'Experience sunset from scenic viewpoints or riverside ghats',
          ],
          packingTips: ['Comfortable walking shoes', 'Layered clothing', 'Reusable water bottle'],
        },
      });
    }

    const contextPrompt = `
You are an expert travel assistant. Provide a structured, inspiring travel recommendation for:
- User Question: ${query || 'Plan a trip'}
- Destination: ${destination || 'Not specified'}
- Duration: ${durationDays ? `${durationDays} days` : 'Flexible'}
- Budget Level: ${budget || 'Moderate'}
- Preferred Transit: ${transitMode || 'Flexible'}
- Interests: ${Array.isArray(interests) ? interests.join(', ') : interests || 'Heritage, Culture, Food'}

Format your answer with clear markdown headings, bullet points, and actionable tips. Keep it concise, engaging, and realistic.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: contextPrompt,
    });

    return res.json({
      text: response.text,
      model: 'gemini-flash-latest',
      isFallback: false
    });
  } catch (error: any) {
    console.error('Gemini Travel Assistant Error:', error);
    return res.json({
      fallback: true,
      text: `### Travel Briefing for ${destination || 'Destination'}\n\n- **Transit:** Book express trains or verified transport in advance.\n- **Duration:** ${durationDays || 2} days provides a balanced pace for culture and leisure.\n- **Tips:** Keep cash handy for station toto-rickshaws and street sweet shops.`,
      model: 'travel-ai-engine'
    });
  }
});

// 6. Gemini Journal Title Suggestion Endpoint
app.post('/api/gemini/suggest-journal-title', async (req: Request, res: Response) => {
  try {
    const { location, time, mood, tripName, notes } = req.body || {};

    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ error: 'A location name is required to suggest a descriptive title.' });
    }

    const cleanLoc = location.trim();
    const cleanTime = (time && typeof time === 'string') ? time.trim() : 'Current Moment';
    const cleanMood = (mood && typeof mood === 'string') ? mood.trim() : 'Wonder & Awe';
    const cleanTrip = (tripName && typeof tripName === 'string') ? tripName.trim() : '';
    const cleanNotes = (notes && typeof notes === 'string') ? notes.trim() : '';

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are an evocative travel writer and poet for an authentic Indian and Global Travel Journal.
A traveler is pinning a live quick entry to their current trip.
Details of the pinned moment:
- Location: "${cleanLoc}"
- Pinned Time: "${cleanTime}"
- Traveler Mood: "${cleanMood}"
${cleanTrip ? `- Current Trip: "${cleanTrip}"` : ''}
${cleanNotes ? `- Traveler's Note: "${cleanNotes}"` : ''}

Task:
Generate 3 distinct, evocative, highly descriptive, and poetic titles for this travel journal entry based primarily on the location (its unique character, geography, history, vistas, sounds, or cultural spirit).

Rules:
- Each title must be 4 to 10 words long.
- Evoke real atmosphere and sensory depth (e.g. river mists, ancient stone, whistles of express trains, terracotta warmth, mountain silence).
- Avoid cheesy generic clichés like "A Day to Remember", "My Amazing Trip", or "Awesome Adventure".
- Respond with ONLY a strict JSON object with NO markdown formatting, like this:
{
  "suggestedTitle": "Primary most poetic and descriptive title",
  "alternativeTitles": [
    "Primary most poetic and descriptive title",
    "Second evocative option with distinct atmosphere",
    "Third poetic option capturing time or emotion"
  ]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
        });

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed && parsed.suggestedTitle) {
          const alternatives = Array.isArray(parsed.alternativeTitles) && parsed.alternativeTitles.length > 0
            ? parsed.alternativeTitles
            : [parsed.suggestedTitle];

          return res.json({
            success: true,
            suggestedTitle: parsed.suggestedTitle,
            alternativeTitles: alternatives,
            isAiGenerated: true,
            model: 'gemini-flash-latest',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini title suggestion parse/request failed, using dynamic local engine:', geminiError);
      }
    }

    // High-intelligence localized fallback generator
    const locLower = cleanLoc.toLowerCase();
    let suggestedTitle = `Impressions of ${cleanLoc}`;
    let alternativeTitles: string[] = [];

    if (locLower.includes('gopegarh') || locLower.includes('medinipur') || locLower.includes('midnapore')) {
      suggestedTitle = `Echoes Across Kangsabati: Morning at Gopegarh Fort`;
      alternativeTitles = [
        `Echoes Across Kangsabati: Morning at Gopegarh Fort`,
        `Where Ancient Sal Forests Whisper Over Medinipur`,
        `Rambling Historic Ramparts: A Quiet Moment in Medinipur`,
      ];
    } else if (locLower.includes('kharagpur') || locLower.includes('kgp')) {
      suggestedTitle = `Rhythm of the Rails: A Transit Stop at Kharagpur`;
      alternativeTitles = [
        `Rhythm of the Rails: A Transit Stop at Kharagpur`,
        `Longest Platforms & Distant Train Whistles at KGP`,
        `Between Departures: Station Chai and Open Tracks`,
      ];
    } else if (locLower.includes('varanasi') || locLower.includes('assi') || locLower.includes('ghat') || locLower.includes('kashi')) {
      suggestedTitle = `Sacred Mists & River Chants: Dawn at ${cleanLoc}`;
      alternativeTitles = [
        `Sacred Mists & River Chants: Dawn at ${cleanLoc}`,
        `Drifting Past Manikarnika: The Timeless Pulse of Kashi`,
        `Where Incense Meets the Ganges at ${cleanLoc}`,
      ];
    } else if (locLower.includes('kolkata') || locLower.includes('howrah') || locLower.includes('victoria')) {
      suggestedTitle = `Colonial Shadows & River Mist: Reflections at ${cleanLoc}`;
      alternativeTitles = [
        `Colonial Shadows & River Mist: Reflections at ${cleanLoc}`,
        `Vintage Trams and Earthen Cups: Wandering ${cleanLoc}`,
        `The Cultural Heartbeat: An Evening around ${cleanLoc}`,
      ];
    } else if (locLower.includes('jaipur') || locLower.includes('hawa mahal') || locLower.includes('amber')) {
      suggestedTitle = `Pink Sandstone & Royal Breezes: Exploring ${cleanLoc}`;
      alternativeTitles = [
        `Pink Sandstone & Royal Breezes: Exploring ${cleanLoc}`,
        `Echoes of Courtyards: A Golden Afternoon at ${cleanLoc}`,
        `Desert Radiance: Wandering the Archways of ${cleanLoc}`,
      ];
    } else if (locLower.includes('leh') || locLower.includes('ladakh') || locLower.includes('pangong')) {
      suggestedTitle = `High Pass Solitude: Mountain Light Over ${cleanLoc}`;
      alternativeTitles = [
        `High Pass Solitude: Mountain Light Over ${cleanLoc}`,
        `Where Azure Waters Kiss Mountain Giants: ${cleanLoc}`,
        `Prayer Flags in the Wind: A Quiet Pause at ${cleanLoc}`,
      ];
    } else if (locLower.includes('manali') || locLower.includes('shimla') || locLower.includes('himalaya')) {
      suggestedTitle = `Pine Fragrance & Crisp Mountain Air at ${cleanLoc}`;
      alternativeTitles = [
        `Pine Fragrance & Crisp Mountain Air at ${cleanLoc}`,
        `Valley Whispers: Finding Peace in ${cleanLoc}`,
        `Snow-Capped Horizons: Standing Tall at ${cleanLoc}`,
      ];
    } else if (locLower.includes('goa') || locLower.includes('beach') || locLower.includes('palolem')) {
      suggestedTitle = `Salty Breezes & Golden Shallows: A Moment at ${cleanLoc}`;
      alternativeTitles = [
        `Salty Breezes & Golden Shallows: A Moment at ${cleanLoc}`,
        `Pastel Latin Quarters and Ocean Tides: ${cleanLoc}`,
        `Sun-Drenched Coastal Wandering at ${cleanLoc}`,
      ];
    } else {
      suggestedTitle = `Unfolding Horizons: A ${cleanMood.replace(/^[^\w]+/, '')} Moment at ${cleanLoc}`;
      alternativeTitles = [
        `Unfolding Horizons: A ${cleanMood.replace(/^[^\w]+/, '')} Moment at ${cleanLoc}`,
        `Whispers of the Road: Discovering ${cleanLoc}`,
        `Under Open Skies: Traveler Impressions of ${cleanLoc}`,
      ];
    }

    return res.json({
      success: true,
      suggestedTitle,
      alternativeTitles,
      isAiGenerated: false,
      model: 'travel-ai-engine',
    });
  } catch (error: any) {
    console.error('Suggest title error:', error);
    const loc = req.body?.location || 'New Journey';
    return res.json({
      success: true,
      suggestedTitle: `Travel Notes from ${loc}`,
      alternativeTitles: [
        `Travel Notes from ${loc}`,
        `On the Trail at ${loc}`,
        `Quiet Reflections in ${loc}`,
      ],
      isAiGenerated: false,
      model: 'travel-ai-engine',
    });
  }
});

// Endpoint: Generate tailored social media summary and captions for a travel journal entry via Gemini
app.post('/api/gemini/social-summary', async (req: Request, res: Response) => {
  try {
    const {
      title = 'Travel Journal Story',
      destination = 'Unexplored Horizons',
      story = '',
      mustVisitSpots = [],
      localFoodRecommendations = [],
      mottoQuote = 'Life is just going on. Life is too short, so make this trip happen!',
      shareUrl = 'https://travel-ai-studio.app',
      tone = 'poetic',
    } = req.body;

    const cleanTitle = String(title).trim();
    const cleanDest = String(destination).trim();
    const cleanStory = String(story).trim().slice(0, 800);
    const cleanSpots = Array.isArray(mustVisitSpots) ? mustVisitSpots.slice(0, 4) : [];
    const cleanFoods = Array.isArray(localFoodRecommendations) ? localFoodRecommendations.slice(0, 3) : [];
    const cleanMotto = String(mottoQuote).trim();
    const cleanUrl = String(shareUrl).trim();
    const cleanTone = String(tone).trim();

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a world-class travel writer and social media creator.
A traveler is sharing their public travel journal story to inspire fellow travelers.

Journal Details:
- Title: "${cleanTitle}"
- Destination: "${cleanDest}"
- Story Excerpt: "${cleanStory}"
- Must-Visit Spots: ${cleanSpots.join(', ') || cleanDest}
- Local Food Highlights: ${cleanFoods.join(', ') || 'Local street specialties'}
- Core Motto: "${cleanMotto}"
- Shareable Story Link: "${cleanUrl}"
- Desired Tone: "${cleanTone}" (e.g., poetic & inspiring, adventurous & energetic, punchy & viral, or foodie & cultural heritage)

Task:
Generate tailored, high-engagement social media summaries and captions for 5 major platforms:
1. "twitter": Engaging tweet with hook, destination, the motto quote, link, and 2-3 hashtags. Strict rule: MUST be under 260 characters total so it fits Twitter character limits.
2. "whatsapp": Clean, formatted WhatsApp message using *bolding*, emojis, bullet points for top spots/food, the motto, and the link to read more.
3. "instagram": Captivating aesthetic caption with sensory storytelling, quote, call to action, and 6-8 relevant travel hashtags.
4. "facebook": Warm, personal story post sharing impressions of the journey, why people should visit, and the link.
5. "linkedin": Thoughtful reflection on cultural exploration, life perspective ("${cleanMotto}"), and travel insights with link.
6. "headline": One punchy, irresistible headline for this social share card.

Rules:
- Include the exact URL "${cleanUrl}" in each social post.
- Emphasize the core travel philosophy: "${cleanMotto}".
- Return ONLY a strict JSON object with NO surrounding markdown or extra text:
{
  "headline": "...",
  "twitter": "...",
  "whatsapp": "...",
  "instagram": "...",
  "facebook": "...",
  "linkedin": "..."
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
        });

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed && (parsed.twitter || parsed.whatsapp)) {
          return res.json({
            success: true,
            isAiGenerated: true,
            model: 'gemini-flash-latest',
            headline: parsed.headline || `${cleanTitle} — ${cleanDest}`,
            summaries: {
              twitter: parsed.twitter || `🚂 "${cleanTitle}" at ${cleanDest}. "${cleanMotto}"\n\nRead more: ${cleanUrl}\n#Travel`,
              whatsapp: parsed.whatsapp || `📖 *${cleanTitle}*\n📍 *Destination:* ${cleanDest}\n\n"${cleanMotto}"\n\n🔗 *Read the full story:*\n${cleanUrl}`,
              instagram: parsed.instagram || `✨ ${cleanTitle}\n📍 ${cleanDest}\n\n"${cleanMotto}"\n\n🔗 ${cleanUrl}\n#TravelDiary`,
              facebook: parsed.facebook || `🗺️ ${cleanTitle}\n\nNotes from ${cleanDest}. "${cleanMotto}"\n\n${cleanUrl}`,
              linkedin: parsed.linkedin || `Reflections from ${cleanDest}: ${cleanTitle}\n\n"${cleanMotto}"\n\n${cleanUrl}`,
            },
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini social summary generation failed, using dynamic local engine:', geminiErr);
      }
    }

    // High-quality local fallback generator
    const spotsText = cleanSpots.length > 0 ? cleanSpots.map((s) => `  • ${s}`).join('\n') : `  • Exploring ${cleanDest}`;
    const foodText = cleanFoods.length > 0 ? `\n🍲 *Local Flavors:*\n${cleanFoods.map((f) => `  • ${f}`).join('\n')}` : '';

    return res.json({
      success: true,
      isAiGenerated: false,
      model: 'travel-ai-engine',
      headline: `Journey Notes: ${cleanTitle} in ${cleanDest}`,
      summaries: {
        twitter: `🚂 "${cleanTitle}"\n📍 ${cleanDest}\n\n"${cleanMotto}"\n\nRead full story & field guide:\n${cleanUrl}\n#Travel #IncredibleIndia`,
        whatsapp: `📖 *${cleanTitle}*\n📍 *Destination:* ${cleanDest}\n\n"${cleanMotto}"\n\n✨ *Key Highlights:*\n${spotsText}${foodText}\n\n🔗 *Read the full interactive story on Travel AI:*\n${cleanUrl}`,
        instagram: `✨ ${cleanTitle}\n\n📍 ${cleanDest}\n\n"${cleanMotto}" 🎒🚂\n\nWhether wandering through historic alleyways or taking the early morning rail, life is too short to wait for the "right time". Make this trip happen!\n\nMust-visit:\n${cleanSpots.join(' • ')}\n\nRead the full guide and transit details at:\n${cleanUrl}\n.\n#TravelJournal #Wanderlust #ExploreMore #SlowTravel #IncredibleIndia`,
        facebook: `🗺️ ${cleanTitle} — Notes from ${cleanDest}\n\n"${cleanMotto}"\n\nJust published my public travel journal entry covering local heritage, must-visit spots, and transit advice for ${cleanDest}.\n\nCheck out the full story here:\n${cleanUrl}`,
        linkedin: `Reflections from the Road: ${cleanTitle}\n\nTravel always has a way of resetting perspective. Exploring ${cleanDest} served as a reminder:\n\n"${cleanMotto}"\n\nSometimes the most rewarding journeys aren't about rushing from point to point, but discovering the quiet craft and heritage along the way.\n\nRead the complete field guide:\n${cleanUrl}\n\n#TravelReflections #MindfulTravel #CultureAndHeritage`,
      },
    });
  } catch (error: any) {
    console.error('Social summary endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate social summary',
    });
  }
});

// 4. Vite middleware (Dev) or Static Assets (Prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Travel AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
