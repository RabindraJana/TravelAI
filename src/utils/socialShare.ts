import { JournalEntry } from '../types';

export type SocialPlatform = 'whatsapp' | 'twitter' | 'instagram' | 'facebook' | 'linkedin';
export type SocialTone = 'poetic' | 'adventurous' | 'punchy' | 'foodie';

export interface SocialSummaryBundle {
  twitter: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  linkedin: string;
}

/**
 * Builds the canonical shareable URL for a travel journal entry.
 */
export function buildJournalShareUrl(entry: JournalEntry): string {
  if (typeof window === 'undefined') {
    return `https://travel-ai-studio.app/?screen=journal&entry=${entry.id}`;
  }
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?screen=journal&entry=${encodeURIComponent(entry.id)}`;
}

/**
 * Generates platform-specific social media summaries and captions for a travel journal entry.
 */
export function generateLocalSocialSummaries(
  entry: JournalEntry,
  shareUrl: string,
  tone: SocialTone = 'poetic'
): SocialSummaryBundle {
  const motto = entry.mottoQuote || 'Life is just going on. Life is too short, so make this trip happen!';
  const dest = entry.destination;
  const author = entry.author || 'Traveler';
  const firstSpot = entry.mustVisitSpots && entry.mustVisitSpots.length > 0 ? entry.mustVisitSpots[0] : dest;
  const spotHighlights = (entry.mustVisitSpots || []).slice(0, 3);
  const foodHighlights = (entry.localFoodRecommendations || []).slice(0, 2);

  // Clean tags for hashtags
  const hashtags = (entry.tags && entry.tags.length > 0 ? entry.tags : ['Travel', 'Explore', 'Wanderlust'])
    .map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`)
    .filter((t) => t.length > 1)
    .slice(0, 4)
    .join(' ');

  // Story excerpt (cleaned of extra whitespace)
  const cleanStory = (entry.story || '')
    .replace(/\s+/g, ' ')
    .trim();
  const shortStory = cleanStory.length > 180 ? `${cleanStory.slice(0, 175)}...` : cleanStory;
  const mediumStory = cleanStory.length > 320 ? `${cleanStory.slice(0, 315)}...` : cleanStory;

  // Tone variations for Twitter
  let tweetHook = `🚂 "${entry.title}"`;
  if (tone === 'adventurous') {
    tweetHook = `🎒 On the trail in ${dest}: "${entry.title}"`;
  } else if (tone === 'punchy') {
    tweetHook = `⚡ ${entry.title} | ${dest}`;
  } else if (tone === 'foodie') {
    tweetHook = `🍜 Flavors & stories of ${dest}: "${entry.title}"`;
  }

  // 1. Twitter / X (Targeting < 275 characters)
  const twitter = `${tweetHook}
📍 ${dest}

"${motto}"

Read full travel guide & story:
${shareUrl}
${hashtags} #TravelJournal`.trim();

  // 2. WhatsApp (Rich markdown, bold highlights, emojis)
  const spotsFormatted = spotHighlights.length > 0
    ? spotHighlights.map((s) => `  • ${s}`).join('\n')
    : `  • ${dest} heritage & sights`;

  const foodFormatted = foodHighlights.length > 0
    ? `\n\n🍲 *Local Food to Savor:*\n${foodHighlights.map((f) => `  • ${f}`).join('\n')}`
    : '';

  const transitFormatted = entry.transitInfo
    ? `\n\n🚆 *Transit & Route:* ${entry.transitInfo}`
    : '';

  const pinnedInfo = entry.pinnedLocation
    ? `\n📍 *Pinned Moment:* ${entry.pinnedLocation} (${entry.pinnedTime || 'Live'})`
    : '';

  const whatsapp = `📖 *${entry.title}*
📍 *Destination:* ${dest}
👤 *Shared by:* ${author}${pinnedInfo}

"${motto}"

📝 *Field Notes:*
${shortStory}

✨ *Must-Visit Spots:*
${spotsFormatted}${foodFormatted}${transitFormatted}

🔗 *Read the full interactive story on Travel AI:*
${shareUrl}`.trim();

  // 3. Instagram / Threads (Storytelling, evocative spacing, hashtags)
  const instagram = `✨ ${entry.title}

📍 ${dest}
${pinnedInfo ? `🕒 ${entry.pinnedTime || 'Live on the road'}\n` : ''}
${mediumStory}

"${motto}" 🚂🎒

Must-experience in ${dest}:
${spotHighlights.map((s) => `• ${s}`).join('\n')}
${foodHighlights.length > 0 ? `\nTaste: ${foodHighlights.join(', ')}` : ''}

🔗 Read the full journal entry & transit details at the link below:
${shareUrl}
.
.
#TravelJournal #IncredibleIndia #TravelDiaries #Wanderlust #ExploreMore #SlowTravel #Storyteller ${hashtags}`.trim();

  // 4. Facebook (Engaging community narrative)
  const facebook = `🗺️ ${entry.title} — Notes from ${dest}

${mediumStory}

"${motto}"

Whether you're planning a quick weekend rail escape or dreaming of future horizons, here are a few spots not to miss in ${dest}:
${spotHighlights.map((s) => `👉 ${s}`).join('\n')}

Check out the full story, transit breakdown, and local food guide:
${shareUrl}`.trim();

  // 5. LinkedIn (Professional / Cultural takeaway format)
  const linkedin = `Reflections from the Road: ${entry.title}

Travel always has a humbling way of resetting perspective. Spending time exploring ${dest} served as a reminder:

"${motto}"

Sometimes the most rewarding journeys aren't about rushing from milestone to milestone, but paying attention to the quiet craftsmanship, heritage, and human stories right along the route.

Key impressions and highlights from ${dest}:
${spotHighlights.map((s) => `• ${s}`).join('\n')}

You can read my complete travel journal entry and interactive field guide here:
${shareUrl}

#TravelReflections #MindfulTravel #CultureAndHeritage #Perspectives #LifesJourney`.trim();

  return {
    twitter,
    whatsapp,
    instagram,
    facebook,
    linkedin,
  };
}

/**
 * Prepares direct share intent links for social networks.
 */
export function getDirectShareUrls(params: {
  title: string;
  summary: string;
  url: string;
}) {
  const { title, summary, url } = params;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${summary}`);
  const encodedTitle = encodeURIComponent(title);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${summary}\n\n${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(summary.slice(0, 240))}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(`"${title}" - ${summary.slice(0, 180)}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${summary}\n\nRead the full journal story here:\n${url}`)}`,
  };
}

/**
 * Checks if the browser supports the native Web Share API.
 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Trigger native mobile or desktop share sheet.
 */
export async function shareViaNative(params: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (!canUseNativeShare()) return false;
  try {
    await navigator.share({
      title: params.title,
      text: params.text,
      url: params.url,
    });
    return true;
  } catch (err: any) {
    // User cancelled share or browser refused
    if (err.name !== 'AbortError') {
      console.warn('Native share failed:', err);
    }
    return false;
  }
}
