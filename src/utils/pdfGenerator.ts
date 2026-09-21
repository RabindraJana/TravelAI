import { jsPDF } from 'jspdf';
import { TripItem, TripSummary } from '../types';
import { generateTripSummary } from './tripSummaryGenerator';

export interface GeneratePdfOptions {
  includePackingList?: boolean;
  includeEmergencyInfo?: boolean;
}

/**
 * Generates a clean, formatted PDF itinerary document for offline travel access
 */
export async function generateTripItineraryPdf(
  trip: TripItem,
  summary?: TripSummary,
  options: GeneratePdfOptions = {}
): Promise<boolean> {
  try {
    const sum = summary || generateTripSummary(trip);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = 16;

    // --- HEADER BANNER ---
    // Background Header
    doc.setFillColor(0, 104, 95); // Deep Teal #00685f
    doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

    // Header Title & Logo Tag
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('VOYAGE AI  |  OFFLINE TRAVEL PASS & ITINERARY', margin + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 240, 235);
    doc.text(
      `Verified Offline Document  •  Issued: ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`,
      margin + 6,
      y + 16
    );

    // Booking Reference Badge on Right
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - margin - 52, y + 5, 46, 15, 2, 2, 'F');
    doc.setTextColor(0, 104, 95);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('BOOKING REF', pageWidth - margin - 49, y + 10);
    doc.setFontSize(10);
    doc.setTextColor(19, 27, 46);
    doc.text(trip.bookingRef || 'VAI-2026-CONF', pageWidth - margin - 49, y + 16);

    y += 32;

    // --- EXPEDITION TITLE & DESTINATION BLOCK ---
    doc.setTextColor(19, 27, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const titleLines = doc.splitTextToSize(trip.title, contentWidth - 40);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7 + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(61, 73, 71);
    doc.text(`Primary Destination: ${sum.primaryDestination} (${sum.destinationTagline})`, margin, y);
    y += 6;

    // Status Pill
    const statusText = trip.status.toUpperCase();
    doc.setFillColor(242, 243, 255);
    doc.roundedRect(margin, y, 32, 6, 1.5, 1.5, 'F');
    doc.setTextColor(0, 104, 95);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`STATUS: ${statusText}`, margin + 3, y + 4.2);

    y += 10;

    // --- KEY LOGISTICS & CORRIDOR GRID ---
    doc.setFillColor(248, 249, 255);
    doc.setDrawColor(234, 237, 255);
    doc.roundedRect(margin, y, contentWidth, 26, 2.5, 2.5, 'FD');

    const colWidth = contentWidth / 4;

    // Column 1: Dates & Duration
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 105, 120);
    doc.text('TRAVEL DATES', margin + 4, y + 6);
    doc.setFontSize(9.5);
    doc.setTextColor(19, 27, 46);
    doc.text(sum.keyDates, margin + 4, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 104, 95);
    doc.text(`${trip.durationDays} Days (${sum.relativeTimeText})`, margin + 4, y + 18);

    // Column 2: Route Corridor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 105, 120);
    doc.text('CORRIDOR & ROUTE', margin + colWidth + 4, y + 6);
    doc.setFontSize(9.5);
    doc.setTextColor(19, 27, 46);
    doc.text(`${trip.origin} -> ${trip.destination}`, margin + colWidth + 4, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(61, 73, 71);
    doc.text(
      trip.transitMode === 'flight'
        ? 'Direct Flight Transit'
        : trip.transitMode === 'train'
        ? 'Express Rail Corridor'
        : 'Scenic Highway Transit',
      margin + colWidth + 4,
      y + 18
    );

    // Column 3: Budget
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 105, 120);
    doc.text('BUDGET ALLOCATION', margin + colWidth * 2 + 4, y + 6);
    doc.setFontSize(9.5);
    doc.setTextColor(19, 27, 46);
    doc.text(`INR ${trip.budgetTotal.toLocaleString('en-IN')}`, margin + colWidth * 2 + 4, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(61, 73, 71);
    doc.text(`Spent: INR ${trip.budgetSpent.toLocaleString('en-IN')}`, margin + colWidth * 2 + 4, y + 18);

    // Column 4: Readiness
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 105, 120);
    doc.text('GEAR READINESS', margin + colWidth * 3 + 4, y + 6);
    doc.setFontSize(9.5);
    doc.setTextColor(0, 104, 95);
    doc.text(`${sum.readinessPercentage}% Prepared`, margin + colWidth * 3 + 4, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(61, 73, 71);
    doc.text(`${trip.checklistDone} of ${trip.checklistTotal} items checked`, margin + colWidth * 3 + 4, y + 18);

    y += 32;

    // --- AI CONCISE NARRATIVE & EXECUTIVE SUMMARY ---
    doc.setFillColor(254, 252, 248);
    doc.setDrawColor(255, 219, 202);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(157, 67, 0); // #9d4300 Warm Terracotta
    doc.text('AI TRIP OVERVIEW & HIGHLIGHTS', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(19, 27, 46);
    const summaryLines = doc.splitTextToSize(sum.conciseSummary, contentWidth - 8);
    doc.text(summaryLines, margin + 4, y + 12);

    y += 30;

    // --- PLANNED WAYPOINTS & STOPS ITINERARY ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(19, 27, 46);
    doc.text('PLANNED WAYPOINTS & SCHEDULED STOPS', margin, y);
    y += 4;

    doc.setDrawColor(234, 237, 255);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;

    const waypoints = trip.waypoints && trip.waypoints.length > 0 ? trip.waypoints : sum.highlights;

    waypoints.forEach((wp, index) => {
      // Check if we need a page break
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;
      }

      // Waypoint row box
      doc.setFillColor(250, 248, 255);
      doc.setDrawColor(234, 237, 255);
      doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'FD');

      // Stop badge
      doc.setFillColor(0, 104, 95);
      doc.roundedRect(margin + 3, y + 2.5, 7, 8, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${index + 1}`, margin + 5.2, y + 8);

      // Stop title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(19, 27, 46);
      doc.text(wp, margin + 13, y + 6);

      // Estimated Time / Notes
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(90, 105, 120);
      const estTime = `Day ${Math.min(index + 1, trip.durationDays)} • Suggested window: Morning/Afternoon • Offline map landmark`;
      doc.text(estTime, margin + 13, y + 10.5);

      y += 15.5;
    });

    y += 4;

    // --- PACKING & OFFLINE READINESS CHECKLIST ---
    if (y > pageHeight - 55) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(19, 27, 46);
    doc.text('OFFLINE TRAVEL ESSENTIALS & VERIFICATION', margin, y);
    y += 4;
    doc.setDrawColor(234, 237, 255);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    // Checklist Box & Emergency Info Box (2 columns)
    const boxWidth = (contentWidth - 6) / 2;
    const boxHeight = 42;

    // Left Box: Packing & Offline Cache
    doc.setFillColor(248, 249, 255);
    doc.setDrawColor(234, 237, 255);
    doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 104, 95);
    doc.text('PRE-DEPARTURE GEAR CHECK', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(61, 73, 71);
    const checks = [
      `[X] Government ID & Offline Travel Pass (${trip.bookingRef})`,
      `[X] Downloaded Offline Maps for ${trip.destination}`,
      `[ ] Power bank (10,000mAh+) & universal adapter`,
      `[ ] Weather layer & destination-specific footwear`,
      `[ ] Local currency cash & emergency reserve card`,
    ];
    let checkY = y + 12;
    checks.forEach((item) => {
      doc.text(item, margin + 4, checkY);
      checkY += 5.5;
    });

    // Right Box: Emergency Contacts & Quick Dial
    doc.setFillColor(254, 250, 250);
    doc.setDrawColor(255, 220, 220);
    doc.roundedRect(margin + boxWidth + 6, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 40, 40);
    doc.text('OFFLINE EMERGENCY CONTACTS', margin + boxWidth + 10, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(61, 73, 71);
    const emergencyInfo = [
      'National Emergency Response: 112',
      'Police Helpline: 100 / 112',
      'Medical Ambulance: 102 / 108',
      'Ministry of Tourism 24x7 Helpline: 1363',
      'VoyageAI Smart Support: support@voyageai.travel',
    ];
    let emY = y + 12;
    emergencyInfo.forEach((info) => {
      doc.text(info, margin + boxWidth + 10, emY);
      emY += 5.5;
    });

    y += boxHeight + 8;

    // --- FOOTER NOTE ---
    doc.setDrawColor(220, 225, 235);
    doc.line(margin, pageHeight - 14, margin + contentWidth, pageHeight - 14);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 140, 150);
    doc.text(
      `Generated by VoyageAI Travel Planner • Trip #${trip.id} • Keep this PDF saved on your device for offline reference in remote transit zones.`,
      margin,
      pageHeight - 9
    );

    // Save PDF
    const cleanTitle = trip.title.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${cleanTitle}_Itinerary_Pass.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
}
