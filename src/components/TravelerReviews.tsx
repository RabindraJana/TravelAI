import React, { useState, useMemo } from 'react';
import { TravelerVouch } from '../types';
import { toggleReviewHelpful, addHostReplyToReview } from '../utils/profileStorage';

export interface TravelerReviewsProps {
  profileId?: string;
  profileName: string;
  livingState: string;
  livingCity: string;
  vouches: TravelerVouch[];
  onAddReview?: (review: TravelerVouch) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onNavigateToTrip?: (destination: string) => void;
  isAdmin?: boolean;
}

const PRESET_AVATARS = [
  { label: 'Traveler 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { label: 'Traveler 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { label: 'Traveler 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' },
  { label: 'Traveler 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  { label: 'Traveler 5', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80' },
  { label: 'Traveler 6', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80' },
];

const AVAILABLE_ASPECTS = [
  'Clean Private Room',
  'Authentic Home-Cooked Meals',
  'Safe for Solo Travelers',
  'Punctual Railway Help',
  'Terracotta & Heritage Knowledge',
  'Transparent & Respectful Host',
  'Evening Chai & Local Tales',
  'Station Platform Navigation',
];

export const TravelerReviews: React.FC<TravelerReviewsProps> = ({
  profileName,
  livingState,
  livingCity,
  vouches = [],
  onAddReview,
  onShowToast,
  onNavigateToTrip,
}) => {
  // Filter & Search State
  const [activeFilter, setActiveFilter] = useState<'all' | 'hosted_me' | 'station_guide' | 'local_meetup' | 'traveled_together'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');

  // Modal State for Leaving a Review
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [relationship, setRelationship] = useState<TravelerVouch['relationship']>('hosted_me');
  const [verifiedTrip, setVerifiedTrip] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedAspects, setSelectedAspects] = useState<string[]>([
    'Clean Private Room',
    'Safe for Solo Travelers',
  ]);
  const [comment, setComment] = useState('');
  const [confirmedAuthentic, setConfirmedAuthentic] = useState(false);

  // Host Reply Inline State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Local reaction state to update helpful counts immediately in UI
  const [localHelpfulOverrides, setLocalHelpfulOverrides] = useState<Record<string, number>>({});
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  // Statistics calculation
  const stats = useMemo(() => {
    const total = vouches.length;
    if (total === 0) {
      return { total: 0, avgRating: 5.0, hostedCount: 0, stationCount: 0, meetupCount: 0, corridorCount: 0, fiveStarPct: 100 };
    }
    const sumRatings = vouches.reduce((acc, v) => acc + (v.rating || 5), 0);
    const avgRating = (sumRatings / total).toFixed(1);
    const fiveStarCount = vouches.filter((v) => (v.rating || 5) === 5).length;
    const fiveStarPct = Math.round((fiveStarCount / total) * 100);

    const hostedCount = vouches.filter((v) => v.relationship === 'hosted_me').length;
    const stationCount = vouches.filter((v) => v.relationship === 'station_guide').length;
    const meetupCount = vouches.filter((v) => v.relationship === 'local_meetup').length;
    const corridorCount = vouches.filter((v) => v.relationship === 'traveled_together').length;

    return {
      total,
      avgRating,
      hostedCount,
      stationCount,
      meetupCount,
      corridorCount,
      fiveStarPct,
    };
  }, [vouches]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return vouches
      .filter((vouch) => {
        // Category filter
        if (activeFilter !== 'all' && vouch.relationship !== activeFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = vouch.authorName.toLowerCase().includes(q);
          const matchLoc = vouch.authorLocation.toLowerCase().includes(q);
          const matchComment = vouch.comment.toLowerCase().includes(q);
          const matchTrip = (vouch.verifiedTrip || '').toLowerCase().includes(q);
          const matchAspects = (vouch.aspects || []).some((a) => a.toLowerCase().includes(q));
          return matchName || matchLoc || matchComment || matchTrip || matchAspects;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.rating || 5) - (a.rating || 5);
        }
        if (sortBy === 'helpful') {
          const aCount = localHelpfulOverrides[a.id] ?? (a.helpfulCount || 0);
          const bCount = localHelpfulOverrides[b.id] ?? (b.helpfulCount || 0);
          return bCount - aCount;
        }
        // default recent: preserves order or timestamp
        return 0;
      });
  }, [vouches, activeFilter, searchQuery, sortBy, localHelpfulOverrides]);

  // Toggle Aspect Tag in Modal
  const handleToggleAspect = (aspect: string) => {
    if (selectedAspects.includes(aspect)) {
      setSelectedAspects(selectedAspects.filter((item) => item !== aspect));
    } else {
      setSelectedAspects([...selectedAspects, aspect]);
    }
  };

  // Submit Review Form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      onShowToast('Missing Name', 'Please enter your name as the traveler.', 'warning');
      return;
    }
    if (!comment.trim() || comment.trim().length < 20) {
      onShowToast('Detailed Review Required', 'Please write at least 20 characters describing your experience.', 'warning');
      return;
    }
    if (!confirmedAuthentic) {
      onShowToast('Confirmation Required', 'Please check the box confirming your authentic travel interaction.', 'warning');
      return;
    }

    const newReview: TravelerVouch = {
      id: 'vouch-' + Date.now(),
      authorName: authorName.trim(),
      authorAvatar: selectedAvatar,
      authorLocation: authorLocation.trim() || 'Fellow Explorer',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      relationship,
      comment: comment.trim(),
      verifiedTrip: verifiedTrip.trim() || `${livingCity} - Community Stay`,
      rating,
      aspects: selectedAspects,
      helpfulCount: 0,
    };

    if (onAddReview) {
      onAddReview(newReview);
    }
    onShowToast('Testimonial Published', `Thank you! Your verified testimonial for ${profileName}'s living state has been posted.`, 'success');

    // Reset and close
    setAuthorName('');
    setAuthorLocation('');
    setComment('');
    setVerifiedTrip('');
    setConfirmedAuthentic(false);
    setSelectedAspects(['Clean Private Room', 'Safe for Solo Travelers']);
    setIsAddModalOpen(false);
  };

  // Handle Helpful Reaction
  const handleHelpfulClick = (reviewId: string) => {
    if (votedReviews.has(reviewId)) {
      onShowToast('Already Noted', 'You have already marked this review as helpful.', 'info');
      return;
    }

    toggleReviewHelpful(reviewId);
    setVotedReviews((prev) => new Set(prev).add(reviewId));
    setLocalHelpfulOverrides((prev) => {
      const current = prev[reviewId] ?? (vouches.find((v) => v.id === reviewId)?.helpfulCount || 0);
      return { ...prev, [reviewId]: current + 1 };
    });
    onShowToast('Feedback Noted', 'Marked this testimonial as helpful for community travelers.', 'success');
  };

  // Handle Host Reply
  const handleSendHostReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addHostReplyToReview(reviewId, replyText.trim());
    onShowToast('Reply Posted', 'Your reply as host has been added to this testimonial.', 'success');
    setReplyingToId(null);
    setReplyText('');
  };

  return (
    <div id="traveler-reviews-container" className="space-y-6">
      {/* Living State Trust & Social Proof Header */}
      <div
        id="traveler-reviews-trust-header"
        className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#00685f]/10 via-[#e2fced]/30 to-white border border-[#a4f2cb] shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006947] text-white text-[11px] font-bold shadow-xs">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Living State Verified Host</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#a4f2cb] text-[#00685f] text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{livingState} ({livingCity})</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#131b2e] tracking-tight">
              Traveler Testimonials &amp; Social Proof
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#3d4947] leading-relaxed">
              Authentic endorsements from real backpackers, solo travelers, and railway passengers who stayed at {profileName}&apos;s homestay in {livingState}, navigated transit junctions, or shared travel trails.
            </p>
          </div>

          {/* Aggregate Trust Numbers */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white border border-[#eaedff] shadow-xs text-center min-w-[90px]">
              <div className="flex items-center justify-center gap-1 text-[#fd761a] font-black text-lg">
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span>{stats.avgRating}</span>
              </div>
              <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider block mt-0.5">
                Avg Rating
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white border border-[#eaedff] shadow-xs text-center min-w-[90px]">
              <span className="text-lg font-black text-[#006947] block">
                {stats.fiveStarPct}%
              </span>
              <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider block mt-0.5">
                5-Star Trust
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white border border-[#eaedff] shadow-xs text-center min-w-[90px]">
              <span className="text-lg font-black text-[#131b2e] block">
                {stats.total}
              </span>
              <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider block mt-0.5">
                Testimonials
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown of Living State Interaction Types */}
        <div className="mt-5 pt-4 border-t border-[#00685f]/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
          <div className="flex items-center gap-2 text-[#131b2e] font-semibold bg-white/70 px-3 py-2 rounded-xl border border-white">
            <span className="text-base">🏡</span>
            <div>
              <span className="block text-[11px] text-[#3d4947]">Homestays Hosted</span>
              <span className="font-bold text-[#00685f]">{stats.hostedCount} Travelers</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#131b2e] font-semibold bg-white/70 px-3 py-2 rounded-xl border border-white">
            <span className="text-base">🚆</span>
            <div>
              <span className="block text-[11px] text-[#3d4947]">Station / Transit Help</span>
              <span className="font-bold text-[#00685f]">{stats.stationCount} Guides</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#131b2e] font-semibold bg-white/70 px-3 py-2 rounded-xl border border-white">
            <span className="text-base">☕</span>
            <div>
              <span className="block text-[11px] text-[#3d4947]">Chai &amp; Local Walks</span>
              <span className="font-bold text-[#00685f]">{stats.meetupCount} Meetups</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#131b2e] font-semibold bg-white/70 px-3 py-2 rounded-xl border border-white">
            <span className="text-base">🗺️</span>
            <div>
              <span className="block text-[11px] text-[#3d4947]">Corridors Traveled</span>
              <span className="font-bold text-[#00685f]">{stats.corridorCount} Journeys</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs, Search & Action */}
      <div className="bg-white rounded-2xl p-4 border border-[#eaedff] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-[12px]">
          <button
            id="filter-all-reviews"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            All Reviews ({stats.total})
          </button>
          <button
            id="filter-homestay-reviews"
            onClick={() => setActiveFilter('hosted_me')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeFilter === 'hosted_me'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            <span>🏡</span>
            <span>Homestays ({stats.hostedCount})</span>
          </button>
          <button
            id="filter-station-reviews"
            onClick={() => setActiveFilter('station_guide')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeFilter === 'station_guide'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            <span>🚆</span>
            <span>Station &amp; Transit ({stats.stationCount})</span>
          </button>
          <button
            id="filter-meetup-reviews"
            onClick={() => setActiveFilter('local_meetup')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeFilter === 'local_meetup'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            <span>☕</span>
            <span>Chai &amp; Walks ({stats.meetupCount})</span>
          </button>
          <button
            id="filter-corridor-reviews"
            onClick={() => setActiveFilter('traveled_together')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeFilter === 'traveled_together'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#3d4947] hover:bg-[#eaedff]'
            }`}
          >
            <span>🗺️</span>
            <span>Corridors ({stats.corridorCount})</span>
          </button>
        </div>

        {/* Right side search & Write Review Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#717b79]">
              search
            </span>
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[12px] text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717b79] hover:text-[#131b2e] text-[12px]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[12px] font-bold text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00685f] cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <button
            id="open-leave-review-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">rate_review</span>
            <span>Leave Testimonial</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div id="reviews-list-wrapper" className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#eaedff] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#f2f3ff] text-[#00685f] mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">chat_bubble_outline</span>
            </div>
            <h3 className="text-base font-bold text-[#131b2e]">No Testimonials Found</h3>
            <p className="text-[13px] text-[#3d4947] max-w-md mx-auto">
              {searchQuery
                ? `No reviews match "${searchQuery}". Try clearing search keywords.`
                : 'No reviews found in this category yet. Be the first traveler to share your experience!'}
            </p>
            <div className="pt-2">
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#00685f] text-white text-[12px] font-bold hover:bg-[#00534c] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#00685f] text-white text-[12px] font-bold hover:bg-[#00534c] transition-colors cursor-pointer"
                >
                  Leave First Testimonial
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const helpfulCount = localHelpfulOverrides[review.id] ?? (review.helpfulCount || 0);
            const hasVoted = votedReviews.has(review.id);

            return (
              <div
                key={review.id}
                id={`review-card-${review.id}`}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-[#eaedff] shadow-xs hover:border-[#00685f]/30 transition-all space-y-4"
              >
                {/* Header: Author info, Relationship, Rating, Date */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.authorAvatar}
                      alt={review.authorName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00685f]/20 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[15px] text-[#131b2e]">
                          {review.authorName}
                        </h4>
                        <span className="text-[12px] text-[#717b79]">
                          • {review.authorLocation}
                        </span>
                      </div>

                      {/* Relationship Pill */}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f2f3ff] text-[#00685f]">
                          {review.relationship === 'hosted_me' && (
                            <>
                              <span>🏡</span>
                              <span>Stayed at Living State Homestay</span>
                            </>
                          )}
                          {review.relationship === 'station_guide' && (
                            <>
                              <span>🚆</span>
                              <span>Railway &amp; Transit Guidance</span>
                            </>
                          )}
                          {review.relationship === 'local_meetup' && (
                            <>
                              <span>☕</span>
                              <span>Local Meetup &amp; Chai Walk</span>
                            </>
                          )}
                          {review.relationship === 'traveled_together' && (
                            <>
                              <span>🗺️</span>
                              <span>Traveled Travel Corridor</span>
                            </>
                          )}
                        </span>

                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#006947] bg-[#e2fced] px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[13px]">verified_user</span>
                          <span>Verified Traveler</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1 text-[12px] text-[#717b79]">
                    <div className="flex items-center text-[#fd761a] text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]">
                          {i < (review.rating || 5) ? 'star' : 'star_border'}
                        </span>
                      ))}
                    </div>
                    <span>{review.date}</span>
                  </div>
                </div>

                {/* Experience Highlights / Aspect Badges */}
                {review.aspects && review.aspects.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {review.aspects.map((aspect, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-[#faf8ff] border border-[#eaedff] text-[11px] font-medium text-[#3d4947]"
                      >
                        ✓ {aspect}
                      </span>
                    ))}
                  </div>
                )}

                {/* Testimonial Quote */}
                <p className="text-[13.5px] text-[#3d4947] leading-relaxed italic pl-3.5 border-l-2 border-[#00685f]/40">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Verified Journey Tag */}
                {review.verifiedTrip && (
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[12px] pt-1">
                    <div className="flex items-center gap-1.5 text-[#006947] font-semibold bg-[#e2fced]/60 px-2.5 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[15px]">route</span>
                      <span>Corridor: {review.verifiedTrip}</span>
                    </div>

                    {onNavigateToTrip && (
                      <button
                        onClick={() => onNavigateToTrip(review.verifiedTrip || '')}
                        className="text-[11px] text-[#00685f] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Explore Route</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Host Response (if any) */}
                {review.hostReply && (
                  <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-2 mt-2">
                    <div className="flex items-center justify-between text-[11px] text-[#717b79]">
                      <div className="flex items-center gap-1.5 font-bold text-[#00685f]">
                        <span className="material-symbols-outlined text-[15px]">reply</span>
                        <span>Response from {profileName} (Host)</span>
                      </div>
                      {review.hostReplyDate && <span>{review.hostReplyDate}</span>}
                    </div>
                    <p className="text-[12.5px] text-[#3d4947] leading-relaxed">
                      {review.hostReply}
                    </p>
                  </div>
                )}

                {/* Inline Host Reply Form (if replying) */}
                {replyingToId === review.id && (
                  <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#00685f]/30 space-y-2">
                    <div className="flex items-center justify-between text-[12px] font-bold text-[#131b2e]">
                      <span>Reply to {review.authorName} as Host:</span>
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="text-[#717b79] hover:text-[#131b2e] text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a warm note of thanks or travel follow-up..."
                      className="w-full p-2 rounded-lg bg-white border border-[#eaedff] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSendHostReply(review.id)}
                        className="px-3 py-1 rounded-lg bg-[#00685f] text-white text-[11px] font-bold hover:bg-[#00534c] cursor-pointer"
                      >
                        Post Host Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Reactions / Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#eaedff] text-[12px] text-[#717b79]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleHelpfulClick(review.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        hasVoted
                          ? 'bg-[#e2fced] text-[#006947] border-[#a4f2cb] font-bold'
                          : 'bg-[#faf8ff] text-[#3d4947] border-[#eaedff] hover:border-[#00685f]/30'
                      }`}
                      title="Mark as helpful review"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {hasVoted ? 'thumb_up' : 'thumb_up_off_alt'}
                      </span>
                      <span>Helpful ({helpfulCount})</span>
                    </button>

                    <span className="text-[11px] text-[#717b79]">
                      Verified by Travel AI Living State Network
                    </span>
                  </div>

                  {!review.hostReply && replyingToId !== review.id && (
                    <button
                      onClick={() => {
                        setReplyingToId(review.id);
                        setReplyText('');
                      }}
                      className="text-[11px] text-[#00685f] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">reply</span>
                      <span>Reply as Host</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Leave a Testimonial */}
      {isAddModalOpen && (
        <div
          id="leave-review-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div
            id="leave-review-modal-card"
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-[#eaedff] space-y-5"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00685f] block">
                  Living State Social Proof
                </span>
                <h3 className="text-xl font-bold text-[#131b2e]">
                  Vouch for {profileName}&apos;s Living State
                </h3>
                <p className="text-[12px] text-[#3d4947] mt-0.5">
                  Share your genuine experience staying in {livingState}, station assistance, or traveling together.
                </p>
              </div>
              <button
                id="close-leave-review-modal-btn"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#f2f3ff] text-[#717b79] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Traveler Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#131b2e]">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Arindam Bose"
                    className="w-full px-3 py-2 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[13px] text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#131b2e]">Your Home City / Country</label>
                  <input
                    type="text"
                    value={authorLocation}
                    onChange={(e) => setAuthorLocation(e.target.value)}
                    placeholder="e.g. Kolkata / Solo Explorer"
                    className="w-full px-3 py-2 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[13px] text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#131b2e] block">
                  Choose Your Profile Avatar
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={`p-0.5 rounded-full transition-all cursor-pointer ${
                        selectedAvatar === avatar.url
                          ? 'ring-3 ring-[#00685f] scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.label}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Interaction Type (Living State focus) */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#131b2e] block">
                  How did you interact with {profileName}? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                  <button
                    type="button"
                    onClick={() => setRelationship('hosted_me')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'hosted_me'
                        ? 'border-[#00685f] bg-[#00685f]/10 font-bold text-[#00685f]'
                        : 'border-[#eaedff] bg-[#faf8ff] text-[#3d4947] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🏡</span>
                      <span>Stayed at Living State Home</span>
                    </div>
                    <span className="text-[10px] text-[#717b79] font-normal block mt-0.5">
                      Homestay in Medinipur / Kharagpur
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRelationship('station_guide')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'station_guide'
                        ? 'border-[#00685f] bg-[#00685f]/10 font-bold text-[#00685f]'
                        : 'border-[#eaedff] bg-[#faf8ff] text-[#3d4947] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🚆</span>
                      <span>Railway / Transit Help</span>
                    </div>
                    <span className="text-[10px] text-[#717b79] font-normal block mt-0.5">
                      KGP Junction, trains, or coach transit
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRelationship('local_meetup')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'local_meetup'
                        ? 'border-[#00685f] bg-[#00685f]/10 font-bold text-[#00685f]'
                        : 'border-[#eaedff] bg-[#faf8ff] text-[#3d4947] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">☕</span>
                      <span>Chai &amp; Local Heritage Walk</span>
                    </div>
                    <span className="text-[10px] text-[#717b79] font-normal block mt-0.5">
                      Terracotta temples, riverbanks, or food
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRelationship('traveled_together')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'traveled_together'
                        ? 'border-[#00685f] bg-[#00685f]/10 font-bold text-[#00685f]'
                        : 'border-[#eaedff] bg-[#faf8ff] text-[#3d4947] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🗺️</span>
                      <span>Traveled Corridor Together</span>
                    </div>
                    <span className="text-[10px] text-[#717b79] font-normal block mt-0.5">
                      Shared train journey or exploration trail
                    </span>
                  </button>
                </div>
              </div>

              {/* Route / Trip Name */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#131b2e]">
                  Corridor or Route (Optional)
                </label>
                <input
                  type="text"
                  value={verifiedTrip}
                  onChange={(e) => setVerifiedTrip(e.target.value)}
                  placeholder="e.g. Howrah - Kharagpur MEMU or Midnapore Terracotta Trail"
                  className="w-full px-3 py-2 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[13px] text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                />
              </div>

              {/* Star Rating */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#131b2e]">
                  Overall Rating: {rating} / 5 Stars
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-[#fd761a] cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {star <= rating ? 'star' : 'star_border'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-[#006947] bg-[#e2fced] px-2 py-0.5 rounded-full">
                    {rating === 5 && 'Outstanding Hospitality'}
                    {rating === 4 && 'Very Good Experience'}
                    {rating === 3 && 'Decent Interaction'}
                    {rating < 3 && 'Room for Improvement'}
                  </span>
                </div>
              </div>

              {/* Experience Highlights / Aspects */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#131b2e] block">
                  Select Experience Highlights (Tags)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVAILABLE_ASPECTS.map((aspect, idx) => {
                    const isSelected = selectedAspects.includes(aspect);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleAspect(aspect)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00685f] text-white'
                            : 'bg-[#faf8ff] text-[#3d4947] border border-[#eaedff] hover:bg-[#eaedff]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {aspect}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Testimonial Comment */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#131b2e]">
                  Your Testimonial *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the stay, the atmosphere, neighborhood safety, tea conversations, or how Rabindra helped your travel..."
                  className="w-full px-3 py-2 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[13px] text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                />
                <div className="flex justify-between text-[10px] text-[#717b79]">
                  <span>Minimum 20 characters</span>
                  <span>{comment.length} chars</span>
                </div>
              </div>

              {/* Authenticity Checkbox */}
              <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-start gap-2.5">
                <input
                  id="confirm-authentic-checkbox"
                  type="checkbox"
                  required
                  checked={confirmedAuthentic}
                  onChange={(e) => setConfirmedAuthentic(e.target.checked)}
                  className="mt-0.5 rounded text-[#00685f] focus:ring-[#00685f] cursor-pointer"
                />
                <label htmlFor="confirm-authentic-checkbox" className="text-[11px] text-[#3d4947] cursor-pointer">
                  <strong>Traveler Authenticity Pledge:</strong> I declare that this testimonial is based on a genuine first-hand travel interaction or stay with {profileName} in {livingState}.
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-[12px] font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-review-form-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Publish Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TravelerReviews;
