import { GeneratedTripPlan } from '../types';

export interface GeminiStatus {
  configured: boolean;
  model: string;
  message?: string;
}

export interface GeminiResponse {
  text: string;
  isFallback?: boolean;
  model?: string;
}

export interface PlanTripParams {
  origin: string;
  destination: string;
  durationDays: number;
  budget: string;
  transitMode: string;
  partyType: string;
  interests: string[];
  stayStyle: string;
}

/**
 * Generate a complete, day-by-day travel plan with express trains and activities via Gemini API
 */
export async function generateFullTripPlan(params: PlanTripParams): Promise<{
  plan: GeneratedTripPlan;
  isAiGenerated: boolean;
  model: string;
}> {
  try {
    const res = await fetch('/api/gemini/plan-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (data && data.plan) {
      return {
        plan: data.plan,
        isAiGenerated: !!data.isAiGenerated,
        model: data.model || 'travel-ai-engine',
      };
    }
    throw new Error(data?.error || 'Failed to retrieve plan');
  } catch (error) {
    console.warn('generateFullTripPlan network fallback:', error);
    // Double-layer fallback ensuring client never fails
    return {
      plan: {
        id: `plan-${Date.now()}`,
        title: `${params.origin} to ${params.destination} Express Route`,
        tagline: `Curated ${params.durationDays}-day journey with Express Rail intelligence.`,
        origin: params.origin,
        destination: params.destination,
        corridor: `${params.origin} ➔ ${params.destination}`,
        distanceKm: 14,
        isShortDistance: true,
        transitMode: (params.transitMode as any) || 'train',
        recommendedTrains: [
          {
            name: 'Rupashi Bangla Express',
            number: '12883',
            type: 'Superfast Express',
            duration: '18 mins',
            fareEstimate: '₹45 (2S) / ₹115 (CC)',
            frequency: 'Daily',
            originStation: `${params.origin} Junction`,
            destStation: `${params.destination} Station`,
            tips: 'Direct express crossing over the Kangsabati bridge.'
          }
        ],
        durationDays: params.durationDays,
        totalBudget: 6000,
        dailySpend: 3000,
        partyType: params.partyType,
        interests: params.interests,
        stayStyle: params.stayStyle,
        days: [
          {
            dayNumber: 1,
            theme: 'Express Rail Arrival & Heritage Exploration',
            activities: [
              {
                timeSlot: 'Morning',
                title: `Express Train Departure from ${params.origin}`,
                description: `Board the morning express train to ${params.destination}. Enjoy the scenic countryside transition.`,
                location: `${params.origin} Railway Station`,
                costEstimate: '₹45',
                tag: 'Transit'
              },
              {
                timeSlot: 'Afternoon',
                title: `Signature Heritage Sites in ${params.destination}`,
                description: `Explore local heritage landmarks, eco-parks, and cultural monuments.`,
                location: `${params.destination} Historic Quarter`,
                costEstimate: '₹100',
                tag: 'Culture'
              },
              {
                timeSlot: 'Evening',
                title: 'Riverbank Sunset & Local Sweets',
                description: `Witness the sunset by the water and taste regional sweet delicacies.`,
                location: `${params.destination} Riverfront`,
                costEstimate: '₹120',
                tag: 'Dining'
              }
            ],
            culinaryRecommendation: 'Local burnt-chhana sweets and savory snacks.',
            transitTip: 'Electric rickshaws are available right outside the station.'
          }
        ],
        localFoodHighlights: ['Regional sweets and snacks', 'Traditional curries', 'Fresh street chaat'],
        hiddenGems: ['Historic eco-park vantage point', 'Colonial library and memorial', 'Quiet river ghats'],
        packingEssentials: ['Comfortable walking shoes', 'Daypack with water bottle', 'Power bank'],
        isAiGenerated: false,
        modelUsed: 'travel-ai-engine'
      },
      isAiGenerated: false,
      model: 'travel-ai-engine'
    };
  }
}

/**
 * Ask the Gemini Travel AI Bot about routes, train schedules, tickets, and local advice
 */
export async function askTravelBot(
  message: string,
  context?: { origin?: string; destination?: string; transitMode?: string }
): Promise<{ reply: string; isAiGenerated: boolean; model: string }> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });

    const data = await res.json();
    return {
      reply: data.reply || 'Travel AI is active and ready to assist.',
      isAiGenerated: !!data.isAiGenerated,
      model: data.model || 'travel-ai-engine',
    };
  } catch (error) {
    return {
      reply: '🚆 **Travel AI Railway Assistant:**\n\nFor regional travel between stations like Kharagpur and Medinipur, Express trains like Rupashi Bangla (12883) and Howrah-Medinipur Fast EMU locals provide frequent, low-cost transit in ~18-20 mins. Configure your GEMINI_API_KEY to activate freeform interactive Gemini chat.',
      isAiGenerated: false,
      model: 'offline'
    };
  }
}

/**
 * Check if the Gemini API key is configured on the backend server.
 */
export async function checkGeminiStatus(): Promise<GeminiStatus> {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) {
      return { configured: false, model: 'gemini-flash-latest', message: 'Unable to verify Gemini status.' };
    }
    return await res.json();
  } catch {
    return { configured: false, model: 'gemini-flash-latest', message: 'Offline or server unreachable.' };
  }
}

/**
 * Generate travel content using the server-side Gemini API.
 */
export async function generateTravelAdvice(
  prompt: string,
  systemInstruction?: string
): Promise<GeminiResponse> {
  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.fallback && data.text) {
        return { text: data.text, isFallback: true };
      }
      throw new Error(data.error || 'Failed to generate response.');
    }

    return {
      text: data.text || 'No response generated.',
      isFallback: false,
      model: data.model,
    };
  } catch (error: any) {
    console.warn('Gemini request failed, providing local travel intelligence fallback:', error);
    return {
      text: `🧭 Travel Intelligence Summary for "${prompt}":\n\n- Recommend traveling early in the morning to beat the rush.\n- Check local transit availability and book major corridor passes in advance.\n- Ensure offline maps are downloaded for remote areas.\n\n(Note: Set your GEMINI_API_KEY in the AI Studio Settings to activate full real-time Gemini generation.)`,
      isFallback: true,
    };
  }
}

/**
 * Query the specialized travel assistant endpoint.
 */
export async function askTravelAssistant(params: {
  query: string;
  destination?: string;
  durationDays?: number;
  budget?: string;
  interests?: string[];
  transitMode?: string;
}): Promise<GeminiResponse> {
  try {
    const res = await fetch('/api/gemini/travel-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.fallback && data.recommendation) {
        return {
          text: `### ${data.recommendation.title}\n\n${data.recommendation.overview}\n\n**Highlights:**\n${data.recommendation.highlights.map((h: string) => `- ${h}`).join('\n')}\n\n**Packing Essentials:**\n${data.recommendation.packingTips.map((p: string) => `- ${p}`).join('\n')}`,
          isFallback: true,
        };
      }
      throw new Error(data.error || 'Travel assistant query failed.');
    }

    return {
      text: data.text || 'No details generated.',
      isFallback: false,
      model: data.model,
    };
  } catch (error: any) {
    return {
      text: `### Expedition Advice: ${params.destination || 'Selected Corridor'}\n\nKey Recommendations:\n- Optimal Season: October through March for pleasant sightseeing.\n- Transit: Book ${params.transitMode || 'train'} tickets at least 2 weeks in advance.\n- Recommended duration: ${params.durationDays || 3} days for a balanced pace.`,
      isFallback: true,
    };
  }
}

export interface SuggestJournalTitleParams {
  location: string;
  time?: string;
  mood?: string;
  tripName?: string;
  notes?: string;
}

export interface SuggestJournalTitleResponse {
  suggestedTitle: string;
  alternativeTitles: string[];
  isAiGenerated: boolean;
  model: string;
}

/**
 * Use the Gemini API to suggest a descriptive title for a travel journal entry based on the location.
 */
export async function suggestJournalTitle(
  params: SuggestJournalTitleParams
): Promise<SuggestJournalTitleResponse> {
  try {
    const res = await fetch('/api/gemini/suggest-journal-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (data && data.suggestedTitle) {
      return {
        suggestedTitle: data.suggestedTitle,
        alternativeTitles: Array.isArray(data.alternativeTitles) ? data.alternativeTitles : [data.suggestedTitle],
        isAiGenerated: Boolean(data.isAiGenerated),
        model: data.model || 'gemini-flash-latest',
      };
    }
    throw new Error(data?.error || 'Failed to suggest title');
  } catch (error) {
    console.warn('suggestJournalTitle client fallback:', error);
    const loc = params.location.trim();
    const moodClean = (params.mood || 'Reflective').replace(/^[^\w]+/, '').trim();
    return {
      suggestedTitle: `Echoes Across the Horizon: A ${moodClean} Moment in ${loc}`,
      alternativeTitles: [
        `Echoes Across the Horizon: A ${moodClean} Moment in ${loc}`,
        `Whispers of the Road: Unfolding ${loc}`,
        `Under Open Skies: Traveler Impressions of ${loc}`,
      ],
      isAiGenerated: false,
      model: 'travel-ai-engine',
    };
  }
}

export interface GenerateSocialSummaryParams {
  title: string;
  destination: string;
  story: string;
  mustVisitSpots?: string[];
  localFoodRecommendations?: string[];
  mottoQuote?: string;
  shareUrl?: string;
  tone?: 'poetic' | 'adventurous' | 'punchy' | 'foodie';
}

export interface GenerateSocialSummaryResponse {
  success: boolean;
  headline: string;
  summaries: {
    twitter: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  isAiGenerated: boolean;
  model: string;
}

/**
 * Request Gemini to generate tailored social summaries for a public travel journal story.
 */
export async function generateSocialSummaryWithGemini(
  params: GenerateSocialSummaryParams
): Promise<GenerateSocialSummaryResponse> {
  try {
    const res = await fetch('/api/gemini/social-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (data && data.summaries) {
      return {
        success: true,
        headline: data.headline || `${params.title} — ${params.destination}`,
        summaries: data.summaries,
        isAiGenerated: Boolean(data.isAiGenerated),
        model: data.model || 'gemini-flash-latest',
      };
    }
    throw new Error(data?.error || 'Failed to generate social summary');
  } catch (error) {
    console.warn('generateSocialSummaryWithGemini client fallback:', error);
    const motto = params.mottoQuote || 'Life is just going on. Life is too short, so make this trip happen!';
    const shareUrl = params.shareUrl || 'https://travel-ai-studio.app';
    return {
      success: true,
      headline: `Field Guide: ${params.title}`,
      summaries: {
        twitter: `🚂 "${params.title}"\n📍 ${params.destination}\n\n"${motto}"\n\nRead full story & guide:\n${shareUrl}\n#Travel #IncredibleIndia`,
        whatsapp: `📖 *${params.title}*\n📍 *Destination:* ${params.destination}\n\n"${motto}"\n\n🔗 *Read full story on Travel AI:*\n${shareUrl}`,
        instagram: `✨ ${params.title}\n📍 ${params.destination}\n\n"${motto}" 🎒🚂\n\nTap link to read the full guide:\n${shareUrl}\n#TravelJournal #Wanderlust`,
        facebook: `🗺️ ${params.title} — Notes from ${params.destination}\n\n"${motto}"\n\nRead more:\n${shareUrl}`,
        linkedin: `Reflections from the Road: ${params.title}\n\n"${motto}"\n\n${shareUrl}`,
      },
      isAiGenerated: false,
      model: 'travel-ai-engine',
    };
  }
}

export interface GenerateAiCardParams {
  targetSection: 'journal' | 'profile' | 'community';
  authorName?: string;
  authorRole?: string;
  destination?: string;
  regionOrGroup?: string;
  notes?: string;
  favoriteFood?: string;
  isVerified?: boolean;
  badgeText?: string;
}

export async function generateAiTravelCardWithGemini(
  params: GenerateAiCardParams
): Promise<{ success: boolean; card: any; isAiGenerated: boolean; model: string }> {
  try {
    const res = await fetch('/api/gemini/generate-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data && data.card) {
      return {
        success: true,
        card: data.card,
        isAiGenerated: Boolean(data.isAiGenerated),
        model: data.model || 'gemini-flash-latest',
      };
    }
    throw new Error(data?.error || 'Failed to generate card');
  } catch (err) {
    console.warn('generateAiTravelCardWithGemini client fallback:', err);
    const dest = params.destination || 'Jharkhand Plateau';
    const isJh = dest.toLowerCase().includes('jharkhand') || dest.toLowerCase().includes('ranchi');
    return {
      success: true,
      card: {
        id: `ai-card-${Date.now()}`,
        title: isJh ? 'Jharkhand Heritage & Sal Forest Passport' : `${dest} Explorer Card`,
        category: params.targetSection === 'journal' ? 'journal_summary' : 'profile_passport',
        targetSection: params.targetSection,
        authorName: params.authorName || 'Explorer',
        authorRole: params.authorRole || 'Verified Member',
        destination: dest,
        regionOrGroup: params.regionOrGroup || 'Jharkhand Explorer Group',
        vibeQuote: isJh
          ? 'Across the sal forests and roaring cascades of Chotanagpur, authentic hospitality and steaming Dhuska welcome the traveler.'
          : `Walking through authentic paths and discovering timeless traditions in ${dest}.`,
        highlights: isJh
          ? ['Koel View Sunrise Point', 'Upper Bazaar Hot Dhuska', 'Dassam Falls Trek', 'Vande Bharat Mountain Views']
          : ['Historic Routes', 'Local Street Foods', 'Sunset Vantage Points'],
        favoriteFood: params.favoriteFood || (isJh ? 'Crispy Dhuska with spicy Chana Ghugni' : 'Local regional thali'),
        verifiedStamp: true,
        badgeText: params.badgeText || 'Verified Explorer Member',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isSharedToFeed: true,
      },
      isAiGenerated: false,
      model: 'travel-ai-engine',
    };
  }
}

