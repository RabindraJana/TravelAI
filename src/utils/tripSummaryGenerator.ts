import { TripItem, TripSummary } from '../types';

export type SummaryStyle = 'concise' | 'highlights' | 'executive';

/**
 * Extracts a clean primary destination string from the trip's destination field
 */
export function getPrimaryDestination(destination: string): { name: string; region: string } {
  const clean = destination.replace(/\s*\([A-Z]{3,4}\)\s*/g, '').trim();

  const destinationMap: Record<string, { name: string; region: string }> = {
    Varanasi: { name: 'Varanasi', region: 'Uttar Pradesh, India' },
    Kolkata: { name: 'Kolkata', region: 'West Bengal, India' },
    'Leh Ladakh': { name: 'Leh Ladakh', region: 'Ladakh (Himalayas), India' },
    'North & South Goa': { name: 'Goa', region: 'Konkan Coast, India' },
    Goa: { name: 'Goa', region: 'Konkan Coast, India' },
    Jaipur: { name: 'Jaipur', region: 'Rajasthan, India' },
  };

  for (const [key, val] of Object.entries(destinationMap)) {
    if (clean.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }

  return { name: clean, region: 'Expedition Destination' };
}

/**
 * Generates relative timeline text from dates
 */
function getRelativeTimeText(startDate: string, status: TripItem['status']): string {
  if (status === 'completed') {
    return 'Journey completed & archived';
  }
  if (status === 'draft') {
    return 'Drafting corridor & budget';
  }
  return 'Upcoming departure • Ready to travel';
}

/**
 * Generates an automated, concise mock summary for a given trip
 */
export function generateTripSummary(trip: TripItem, style: SummaryStyle = 'concise'): TripSummary {
  const dest = getPrimaryDestination(trip.destination);
  const originClean = trip.origin.replace(/\s*\([A-Z]{3,4}\)\s*/g, '').trim();

  const transitDescription =
    trip.transitMode === 'flight'
      ? 'direct scheduled flight'
      : trip.transitMode === 'train'
      ? 'scenic railway express'
      : 'scenic self-drive road corridor';

  const readiness =
    trip.checklistTotal > 0 ? Math.round((trip.checklistDone / trip.checklistTotal) * 100) : 100;

  const topWaypoints = trip.waypoints.slice(0, 3).join(', ');

  let conciseSummary = '';

  if (style === 'concise') {
    conciseSummary = `${trip.durationDays}-day ${trip.tags[0]?.toLowerCase() || 'travel'} expedition to ${dest.name} from ${originClean} via ${transitDescription}. Highlights include ${topWaypoints || 'key regional landmarks'}, with ${readiness}% packing readiness and ₹${trip.budgetTotal.toLocaleString()} planned budget.`;
  } else if (style === 'highlights') {
    conciseSummary = `Key highlights in ${dest.name}: ${trip.waypoints.slice(0, 4).join(' • ')}. Logged via ${trip.bookingRef} with ${readiness}% packing gear verified.`;
  } else {
    // executive
    conciseSummary = `Expedition corridor ${originClean} ➔ ${dest.name} (${trip.durationDays} days). Transit: ${trip.transitMode.toUpperCase()} (${trip.bookingRef}). Budget utilization: ₹${trip.budgetSpent.toLocaleString()} of ₹${trip.budgetTotal.toLocaleString()} (${Math.round((trip.budgetSpent / (trip.budgetTotal || 1)) * 100)}% committed).`;
  }

  // Pre-crafted mock destination taglines
  const taglines: Record<string, string> = {
    Varanasi: 'Sacred Ganges ghats, dawn boat rituals & ancient spirituality',
    Kolkata: 'Colonial heritage palaces, intellectual lanes & Bengali cuisine',
    'Leh Ladakh': 'High-altitude mountain passes, azure lakes & Tibetan monasteries',
    Goa: 'Sun-drenched coastal palm trails, Portuguese quarters & ocean sunsets',
    Jaipur: 'Royal terracotta architecture, Rajput forts & artisan textile bazaars',
  };

  const destinationTagline = taglines[dest.name] || `${dest.name} exploration corridor`;

  return {
    tripId: trip.id,
    title: trip.title,
    primaryDestination: `${dest.name}, ${dest.region}`,
    destinationTagline,
    keyDates: `${trip.startDate} – ${trip.endDate} (${trip.durationDays} Days)`,
    departureDate: trip.startDate,
    returnDate: trip.endDate,
    durationText: `${trip.durationDays} Days`,
    relativeTimeText: getRelativeTimeText(trip.startDate, trip.status),
    conciseSummary,
    transitSummary: `${originClean} ➔ ${dest.name} via ${trip.transitMode === 'flight' ? '✈️ Flight' : trip.transitMode === 'train' ? '🚆 Train' : '🚗 Road'}`,
    highlights: trip.waypoints.slice(0, 3),
    readinessPercentage: readiness,
    budgetSummary: `₹${trip.budgetTotal.toLocaleString()} (${trip.budgetSpent > 0 ? `₹${trip.budgetSpent.toLocaleString()} spent` : 'unallocated'})`,
    status: trip.status,
    coverImage: trip.coverImage,
    tags: trip.tags,
  };
}

/**
 * Auto-generates summaries for an array of trips
 */
export function generateAllTripSummaries(
  trips: TripItem[],
  style: SummaryStyle = 'concise'
): Record<string, TripSummary> {
  const record: Record<string, TripSummary> = {};
  trips.forEach((trip) => {
    record[trip.id] = generateTripSummary(trip, style);
  });
  return record;
}

/**
 * Formats a clean, readable text summary of a trip suitable for sharing via clipboard or messaging
 */
export function formatTripShareText(trip: TripItem, summary?: TripSummary): string {
  const sum = summary || generateTripSummary(trip);
  return `✈️ VoyageAI Trip Summary: ${trip.title}
📍 Primary Destination: ${sum.primaryDestination} (${sum.destinationTagline})
🗓️ Key Dates: ${sum.keyDates} [${sum.relativeTimeText}]
🚀 Transit Corridor: ${sum.transitSummary}
📍 Key Waypoints: ${sum.highlights.join(' • ')}
🎒 Gear Readiness: ${sum.readinessPercentage}% Prepared
💰 Budget Plan: ${sum.budgetSummary}
🔖 Booking Ref: ${trip.bookingRef}

📝 Overview:
${sum.conciseSummary}

Shared via VoyageAI Smart Travel Dashboard`;
}

/**
 * Robustly copies trip summary text to the clipboard, with fallback for restricted iframes
 */
export async function copyTripSummaryToClipboard(
  trip: TripItem,
  summary?: TripSummary
): Promise<boolean> {
  const text = formatTripShareText(trip, summary);

  // Try modern navigator.clipboard first
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback if blocked by permissions/iframe policy
    }
  }

  // Fallback: document.execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}

