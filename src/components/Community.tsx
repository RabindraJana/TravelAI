/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ScreenType, TransitionType, SocialPhotoPost, CommunityDirectoryUser, PlanningCardShareRequest, AiTravelCard } from '../types';
import {
  getStoredSocialPosts,
  saveStoredSocialPosts,
  addSocialPost,
  toggleLikeSocialPost,
  addCommentToSocialPost,
  getStoredCommunityUsers,
  toggleFollowUser,
  getStoredPlanningRequests,
  respondToPlanningRequest,
  getStoredAiCards,
} from '../utils/communityStorage';
import { SharePlanningCardModal } from './SharePlanningCardModal';
import { AiTravelCardModal } from './AiTravelCardModal';

interface CommunityProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

type CommunityMainTab = 'feed' | 'directory' | 'jharkhand' | 'requests' | 'ai-cards';

export const Community: React.FC<CommunityProps> = ({ onNavigate, onPlanTripTo, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<CommunityMainTab>('feed');
  const [posts, setPosts] = useState<SocialPhotoPost[]>(() => getStoredSocialPosts());
  const [users, setUsers] = useState<CommunityDirectoryUser[]>(() => getStoredCommunityUsers());
  const [requests, setRequests] = useState<PlanningCardShareRequest[]>(() => getStoredPlanningRequests());
  const [aiCards, setAiCards] = useState<AiTravelCard[]>(() => getStoredAiCards());

  // Feed Filter States
  const [feedCategory, setFeedCategory] = useState<'all' | 'food' | 'scenic' | 'heritage' | 'following'>('all');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Directory Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All');
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);

  // Modals State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<CommunityDirectoryUser | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // New Post Form State
  const [newCaption, setNewCaption] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [newLocation, setNewLocation] = useState('Ranchi, Jharkhand');
  const [newPhotoUrl, setNewPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
  );
  const [newPostType, setNewPostType] = useState<'food' | 'scenic' | 'heritage'>('food');
  const [newGroupAffiliation, setNewGroupAffiliation] = useState('Jharkhand Explorer Group');

  // Request response friend tip modal
  const [activeRespondingReq, setActiveRespondingReq] = useState<PlanningCardShareRequest | null>(null);
  const [responseFriendTips, setResponseFriendTips] = useState('');

  // Reload data when component mounts or tab changes
  const refreshData = () => {
    setPosts(getStoredSocialPosts());
    setUsers(getStoredCommunityUsers());
    setRequests(getStoredPlanningRequests());
    setAiCards(getStoredAiCards());
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  // Handle Like
  const handleLike = (postId: string) => {
    const updated = toggleLikeSocialPost(postId);
    setPosts(updated);
  };

  // Handle Add Comment
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const updated = addCommentToSocialPost(postId, text);
    setPosts(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    onShowToast('Comment Added', 'Your note has been posted to the photo feed.', 'info');
  };

  // Handle Follow / Unfollow User
  const handleToggleFollow = (userId: string, userName: string) => {
    const { users: updatedUsers, isFollowing } = toggleFollowUser(userId);
    setUsers(updatedUsers);
    onShowToast(
      isFollowing ? `Following ${userName} ⭐` : `Unfollowed ${userName}`,
      isFollowing
        ? `You will now see ${userName}'s photo and food posts in your Following feed.`
        : `Removed from your following circle.`,
      'info'
    );
  };

  // Open Share Planning Modal for a given user
  const handleOpenSharePlanning = (user: CommunityDirectoryUser) => {
    setSelectedRecipient(user);
    setIsShareModalOpen(true);
  };

  // Create new Photo/Food Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    const newPost: SocialPhotoPost = {
      id: `post-${Date.now()}`,
      authorId: 'current-user',
      authorName: 'Explorer (You)',
      authorHandle: '@explorer',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      authorBadge: 'Verified Explorer Member',
      isVerified: true,
      groupAffiliation: newGroupAffiliation,
      stateTag: newGroupAffiliation.includes('Jharkhand') ? 'Jharkhand' : 'West Bengal',
      photoUrl: newPhotoUrl,
      caption: newCaption.trim(),
      foodOrDishName: newDishName.trim() || undefined,
      location: newLocation.trim(),
      type: newPostType,
      likesCount: 1,
      liked: true,
      comments: [],
      timestamp: 'Just now',
      tags: [newGroupAffiliation.replace(/\s+/g, ''), newPostType === 'food' ? 'FoodieEats' : 'TravelVibes'],
    };

    const nextPosts = addSocialPost(newPost);
    setPosts(nextPosts);
    setIsCreatePostModalOpen(false);
    setNewCaption('');
    setNewDishName('');
    onShowToast('Photo & Food Post Live! 📸', 'Your moment has been shared with the traveler community.', 'success');
  };

  // Handle Accept / Decline Friend Request
  const handleConfirmAcceptRequest = () => {
    if (!activeRespondingReq) return;

    const friendInfo = {
      acceptedAt: 'Just now',
      tips: [
        responseFriendTips.trim() ||
          'Welcome to our region! Recommended food: Local Dhuska or Chhana-boda. Always check train schedules on NTES.',
      ],
      localContactPhone: '+91 98350-XXXXX (Verified Direct Contact)',
      secretSpot: 'Hidden forest viewpoint accessible via toto rickshaw before noon.',
      foodRecommendation: 'Local heritage canteen near the central clock tower.',
      transitGuidance: 'Use express trains for intercity connections; avoid unmetered highway cabs.',
    };

    const nextReqs = respondToPlanningRequest(activeRespondingReq.id, 'accepted', friendInfo);
    setRequests(nextReqs);
    setActiveRespondingReq(null);
    setResponseFriendTips('');

    onShowToast(
      'Request Accepted as Verified Friend! 🤝',
      `You are now connected with ${activeRespondingReq.senderName}. Your insider friend tips have been shared.`,
      'success'
    );
  };

  // Filtered Posts for Feed
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (feedCategory === 'following') {
      const followingUserIds = users.filter((u) => u.isFollowing).map((u) => u.id);
      list = list.filter((p) => followingUserIds.includes(p.authorId) || p.authorId === 'current-user');
    } else if (feedCategory !== 'all') {
      list = list.filter((p) => p.type === feedCategory);
    }
    return list;
  }, [posts, feedCategory, users]);

  // Filtered Users for Directory
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.groups.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGroup =
        selectedGroupFilter === 'All' || u.groups.some((g) => g.toLowerCase().includes(selectedGroupFilter.toLowerCase()));

      const matchesVerified = !verifiedOnlyFilter || u.isVerified;

      return matchesSearch && matchesGroup && matchesVerified;
    });
  }, [users, searchQuery, selectedGroupFilter, verifiedOnlyFilter]);

  // Jharkhand Group Members
  const jharkhandMembers = useMemo(() => {
    return users.filter((u) => u.state === 'Jharkhand' || u.groups.some((g) => g.includes('Jharkhand')));
  }, [users]);

  // Pending incoming requests count
  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-4 sm:px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-20 space-y-6">
        {/* Top Header Bar */}
        <div className="pt-6 pb-4 border-b border-[#eaedff] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">groups_3</span>
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#131b2e] tracking-tight">
                  Traveler Community &amp; Verified Groups
                </h1>
                <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
                  Three Main Pillars: Instagram Photo/Food Feed • Public User Directory • Verified Friend &amp; Planning Exchange
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="px-4 py-2.5 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">photo_camera</span>
              <span>Post Photo / Food</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-3.5 py-2.5 bg-gradient-to-r from-[#00685f] to-[#008378] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>AI Travel Card</span>
            </button>
          </div>
        </div>

        {/* Featured Jharkhand Explorer Quick Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#00685f]/15 via-[#e2fced]/40 to-[#faf8ff] border border-[#a4f2cb] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">forest</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-[#131b2e]">
                  Heading to Jharkhand? Connect with Verified Local Friends
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#006947] text-white text-[10px] font-bold">
                  Featured Regional Section
                </span>
              </div>
              <p className="text-xs text-[#3d4947] mt-0.5 max-w-2xl leading-relaxed">
                Search verified members of the <strong className="text-[#00685f]">Jharkhand Explorer Group</strong>. Share your planning chart with trusted travelers like Priya Kumari or Birsa Soren. When they accept, unlock insider friend tips on Ranchi Dhuska, Netarhat sunsets, and safe station transit!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => {
                setActiveTab('jharkhand');
              }}
              className="px-4 py-2 bg-[#00685f] hover:bg-[#00534c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">explore</span>
              <span>Explore Jharkhand Section</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#eaedff] pb-2 overflow-x-auto scrollbar-none">
          {[
            { key: 'feed', label: '📸 Photo & Food Feed', icon: 'photo_library' },
            { key: 'directory', label: `👥 Public User Directory (${users.length})`, icon: 'person_search' },
            { key: 'jharkhand', label: '🌿 Jharkhand Section', icon: 'forest' },
            {
              key: 'requests',
              label: `🤝 Friend & Planning Requests ${
                pendingRequestsCount > 0 ? `(${pendingRequestsCount} Pending)` : `(${requests.length})`
              }`,
              icon: 'handshake',
            },
            { key: 'ai-cards', label: `✨ AI Cards & Passports (${aiCards.length})`, icon: 'auto_awesome' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as CommunityMainTab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#00685f] text-white shadow-xs'
                  : 'bg-white text-[#3d4947] border border-[#eaedff] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: INSTAGRAM-STYLE SOCIAL PHOTO & FOOD FEED                   */}
        {/* ================================================================= */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Feed Filter Chips */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Photos & Moments', icon: 'grid_view' },
                  { id: 'food', label: '🍛 Regional Food & Delicacies', icon: 'restaurant' },
                  { id: 'scenic', label: '🌄 Scenic Vistas & Waterfalls', icon: 'landscape' },
                  { id: 'heritage', label: '🏛️ Heritage Trails', icon: 'temple_buddhist' },
                  { id: 'following', label: '⭐ Following Only', icon: 'star' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setFeedCategory(chip.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      feedCategory === chip.id
                        ? 'bg-[#00685f] text-white shadow-xs'
                        : 'bg-white text-[#5f6368] border border-[#eaedff] hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#5f6368] font-medium">
                Showing {filteredPosts.length} posts
              </span>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl border border-[#eaedff] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Author Header */}
                  <div className="p-4 sm:p-4.5 flex items-center justify-between border-b border-[#eaedff]">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#00685f]/20"
                        />
                        {post.isVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-[#006947] text-white p-0.5 rounded-full text-[11px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-[#131b2e]">
                            {post.authorName}
                          </span>
                          <span className="text-[11px] text-[#5f6368]">{post.authorHandle}</span>
                          {post.authorBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-[#e2fced] text-[#006947] text-[10px] font-bold">
                              {post.authorBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#5f6368] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-[#00685f]">location_on</span>
                          <span>{post.location}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#00685f]">{post.groupAffiliation}</span>
                        </p>
                      </div>
                    </div>

                    {/* Follow Toggle Button */}
                    {post.authorId !== 'current-user' && (
                      <button
                        onClick={() => handleToggleFollow(post.authorId, post.authorName)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border border-[#eaedff] hover:border-[#00685f] text-[#00685f] bg-[#faf8ff] hover:bg-[#00685f] hover:text-white"
                      >
                        {users.find((u) => u.id === post.authorId)?.isFollowing ? 'Following' : '+ Follow'}
                      </button>
                    )}
                  </div>

                  {/* Main Instagram Photo */}
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden group">
                    <img
                      src={post.photoUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Food Specialty Badge if present */}
                    {post.foodOrDishName && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[15px] text-amber-300">restaurant</span>
                        <span>{post.foodOrDishName}</span>
                      </div>
                    )}

                    <span className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-lg">
                      {post.timestamp}
                    </span>
                  </div>

                  {/* Interactions Row */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1 text-xs font-bold text-[#131b2e] hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <span
                            className={`material-symbols-outlined text-[22px] transition-transform active:scale-125 ${
                              post.liked ? 'text-rose-500 fill-1 font-variation-fill' : 'text-gray-500'
                            }`}
                          >
                            favorite
                          </span>
                          <span>{post.likesCount}</span>
                        </button>

                        <button className="flex items-center gap-1 text-xs font-bold text-[#5f6368] cursor-pointer">
                          <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                          <span>{post.comments.length}</span>
                        </button>
                      </div>

                      {/* Share Planning Card Button from post */}
                      {post.authorId !== 'current-user' && (
                        <button
                          onClick={() => {
                            const matched = users.find((u) => u.id === post.authorId);
                            if (matched) handleOpenSharePlanning(matched);
                          }}
                          className="px-3 py-1.5 bg-[#00685f]/10 hover:bg-[#00685f] text-[#00685f] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">send</span>
                          <span>Share Planning Chart</span>
                        </button>
                      )}
                    </div>

                    {/* Caption */}
                    <p className="text-xs text-[#3d4947] leading-relaxed">
                      <span className="font-bold text-[#131b2e] mr-1.5">{post.authorName}</span>
                      {post.caption}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#faf8ff] border border-[#eaedff] text-[10px] font-semibold text-[#00685f]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Comments List */}
                    {post.comments.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-[#eaedff] max-h-24 overflow-y-auto pr-1">
                        {post.comments.map((c) => (
                          <div key={c.id} className="text-[11px] text-[#3d4947] flex items-start gap-1.5">
                            <span className="font-bold text-[#131b2e] shrink-0">{c.author}:</span>
                            <span className="flex-1">{c.text}</span>
                            <span className="text-[10px] text-gray-400 shrink-0">{c.timeAgo}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <form
                      onSubmit={(e) => handleAddComment(post.id, e)}
                      className="flex items-center gap-2 pt-2 border-t border-[#eaedff]"
                    >
                      <input
                        type="text"
                        placeholder="Add a comment, food note, or question..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        className="flex-1 text-xs py-1.5 px-3 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#00685f] text-white rounded-xl text-xs font-bold hover:bg-[#00534c] transition-colors cursor-pointer"
                      >
                        Post
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: PUBLIC USER DIRECTORY & SEARCH                             */}
        {/* ================================================================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-3xl p-5 border border-[#eaedff] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name, handle, city, or group (e.g. 'Jharkhand', 'Birsa', 'Ranchi')..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#eaedff] text-xs sm:text-sm focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">clear</span>
                    </button>
                  )}
                </div>

                {/* Verified Only Toggle */}
                <button
                  onClick={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                    verifiedOnlyFilter
                      ? 'bg-[#e2fced] text-[#006947] border-[#a4f2cb]'
                      : 'bg-[#faf8ff] text-[#5f6368] border-[#eaedff] hover:bg-gray-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-[#006947]">verified</span>
                  <span>Verified Badges Only (95%+ Trust)</span>
                </button>
              </div>

              {/* Group Affiliation Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="font-bold text-[#131b2e] shrink-0 mr-1">Filter by Group:</span>
                {[
                  'All',
                  'Jharkhand Explorer Group',
                  'West Bengal Corridors',
                  'Chotanagpur',
                  'Himalayan High-Pass',
                  'Rajasthan Heritage',
                ].map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroupFilter(grp)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedGroupFilter === grp
                        ? 'bg-[#00685f] text-white shadow-xs'
                        : 'bg-[#faf8ff] text-[#5f6368] border border-[#eaedff] hover:bg-gray-100'
                    }`}
                  >
                    {grp === 'Jharkhand Explorer Group' ? '🌿 Jharkhand Explorer Group' : grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-3xl p-5 border border-[#eaedff] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* User Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#00685f]/30"
                        />
                        {user.isVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-[#006947] text-white p-0.5 rounded-full text-[12px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-[#131b2e]">{user.name}</h3>
                          <span className="text-[11px] text-gray-500">{user.handle}</span>
                        </div>

                        {/* Verified Badge */}
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#e2fced] text-[#006947] text-[10px] font-extrabold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            <span>{user.verificationBadge}</span>
                          </span>
                          <span className="text-[10px] font-bold text-[#00685f]">
                            {user.trustScore}% Trust
                          </span>
                        </div>

                        <p className="text-[11px] text-[#5f6368] flex items-center gap-1 pt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-[#00685f]">location_on</span>
                          <span>{user.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Follow Toggle */}
                    <button
                      onClick={() => handleToggleFollow(user.id, user.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                        user.isFollowing
                          ? 'bg-[#00685f] text-white border-[#00685f]'
                          : 'bg-[#faf8ff] text-[#00685f] border-[#eaedff] hover:bg-[#00685f] hover:text-white'
                      }`}
                    >
                      {user.isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#3d4947] leading-relaxed line-clamp-2">
                    "{user.bio}"
                  </p>

                  {/* Group Memberships */}
                  <div className="space-y-1.5 bg-[#faf8ff] p-3 rounded-2xl border border-[#eaedff]">
                    <span className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider block">
                      Community Group Memberships:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {user.groups.map((grp, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            grp.includes('Jharkhand')
                              ? 'bg-[#e2fced] text-[#006947] border border-[#a4f2cb]'
                              : 'bg-white text-[#00685f] border border-[#eaedff]'
                          }`}
                        >
                          {grp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1 text-[11px]">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">
                      Local Specialties &amp; Secrets:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {user.specialties.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-700">
                          • {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats & Planning Request CTA */}
                  <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between gap-2">
                    <div className="text-[11px] text-[#5f6368]">
                      <strong className="text-[#131b2e]">{user.followersCount}</strong> Followers
                    </div>

                    <button
                      onClick={() => handleOpenSharePlanning(user)}
                      className="px-3.5 py-2 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Share Planning Chart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DEDICATED JHARKHAND SECTION                                */}
        {/* ================================================================= */}
        {activeTab === 'jharkhand' && (
          <div className="space-y-6">
            {/* Hero Cover Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#004d46] via-[#00685f] to-[#0d3b36] text-white shadow-xl relative overflow-hidden space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-[#a4f2cb] text-xs font-bold uppercase tracking-wider inline-block">
                    🌿 State Focus: Jharkhand Explorer Group
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    The Land of Forests, Waterfalls &amp; Authentic Flavors
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
                    Connect with verified residents and certified guides across Ranchi, Netarhat, Betla, and Deoghar. Exchange planning charts, discover where to eat piping hot Dhuska, and organize safe travel.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onPlanTripTo?.('Kolkata', 'Ranchi');
                      onNavigate('planner');
                    }}
                    className="px-4 py-2.5 bg-white text-[#00685f] hover:bg-[#faf8ff] rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[17px]">route</span>
                    <span>Plan Ranchi / Netarhat Trip</span>
                  </button>

                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="px-4 py-2.5 bg-[#a4f2cb] text-[#004d46] hover:bg-emerald-300 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                    <span>Generate Jharkhand Passport Card</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Food Spotlight: Jharkhand Culinary Essentials */}
            <div className="bg-white rounded-3xl p-6 border border-[#eaedff] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
                <div>
                  <h3 className="font-extrabold text-lg text-[#131b2e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00685f]">restaurant</span>
                    <span>Must-Try Jharkhand Regional Specialties</span>
                  </h3>
                  <p className="text-xs text-[#5f6368]">
                    Verified local members recommend tasting these authentic dishes during your journey.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: 'Crispy Dhuska with Ghugni',
                    desc: 'Deep-fried fermented rice & chana dal batter served with spicy black gram curry.',
                    where: 'Upper Bazaar & Lalpur, Ranchi',
                    cost: '₹25 for 2 pcs',
                    img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Charcoal Roasted Litti Chokha',
                    desc: 'Sattu-stuffed dough balls roasted over wood charcoal, bathed in pure desi ghee.',
                    where: 'Highway Dhabas & Deoghar',
                    cost: '₹60 per plate',
                    img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Indigenous Rugra Curry',
                    desc: 'Rare wild mushroom with hard exterior and juicy earthy center, cooked in mustard paste.',
                    where: 'Tribal Haats & Rural Ranchi',
                    cost: 'Seasonal delicacy',
                    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Steamed Rice Pitha & Chilka',
                    desc: 'Traditional rice flour dumplings stuffed with sweetened chana or spiced lentils.',
                    where: 'Local Village Homestays',
                    cost: 'Traditional snack',
                    img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2 hover:border-[#00685f]/40 transition-all"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <h4 className="font-bold text-xs sm:text-sm text-[#131b2e]">{item.name}</h4>
                    <p className="text-[11px] text-[#5f6368] leading-relaxed">{item.desc}</p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-[#00685f] font-semibold">
                      <span>{item.where}</span>
                      <span>{item.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Jharkhand Group Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-[#131b2e]">
                    Verified Jharkhand Community Members
                  </h3>
                  <p className="text-xs text-[#5f6368]">
                    Send a friend request and share your planning chart with these verified members.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {jharkhandMembers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-3xl p-5 border border-[#eaedff] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-[#00685f]/30"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-[#006947] text-white p-0.5 rounded-full text-[11px]">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#131b2e]">{user.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-[#e2fced] text-[#006947] text-[10px] font-bold">
                          {user.verificationBadge}
                        </span>
                        <p className="text-[11px] text-[#5f6368] mt-0.5">{user.location}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#3d4947] leading-relaxed">"{user.bio}"</p>

                    <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[11px] space-y-1">
                      <span className="text-[10px] font-bold text-[#00685f] uppercase block">
                        Secret Friend Tip Preview:
                      </span>
                      <p className="text-[#3d4947] italic">
                        {user.friendInfoTip
                          ? `${user.friendInfoTip.slice(0, 110)}... (unlocks upon acceptance)`
                          : 'Provides private transport and food spots upon connection.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between">
                      <button
                        onClick={() => handleToggleFollow(user.id, user.name)}
                        className="text-xs font-bold text-[#00685f] hover:underline cursor-pointer"
                      >
                        {user.isFollowing ? 'Following ⭐' : '+ Follow'}
                      </button>

                      <button
                        onClick={() => handleOpenSharePlanning(user)}
                        className="px-3.5 py-2 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">send</span>
                        <span>Share Planning Chart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: FRIEND & PLANNING REQUESTS INBOX (ACCEPT & EXCHANGE TIPS)  */}
        {/* ================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-[#eaedff] shadow-xs">
              <h2 className="font-extrabold text-lg text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f]">handshake</span>
                <span>Verified Friend &amp; Planning Card Requests</span>
              </h2>
              <p className="text-xs text-[#5f6368] mt-1">
                When you share a planning chart with a verified badge user (or receive one), accepting the request unlocks private mutual friend information and insider local guidance.
              </p>
            </div>

            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs space-y-4 ${
                    req.status === 'accepted' ? 'border-[#a4f2cb] ring-1 ring-[#a4f2cb]/50' : 'border-[#eaedff]'
                  }`}
                >
                  {/* Request Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#eaedff] gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.senderAvatar}
                        alt={req.senderName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#00685f]/30"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-[#131b2e]">{req.senderName}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#00685f] text-[10px] font-bold">
                            {req.senderCity}
                          </span>
                          <span className="text-[11px] text-gray-400">• Sent {req.createdAt}</span>
                        </div>
                        <p className="text-xs text-[#5f6368] mt-0.5">
                          Recipient:{' '}
                          <strong className="text-[#131b2e]">{req.recipientName}</strong> (
                          {req.recipientGroup})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                          req.status === 'accepted'
                            ? 'bg-[#e2fced] text-[#006947]'
                            : req.status === 'declined'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {req.status === 'accepted' ? 'check_circle' : 'schedule'}
                        </span>
                        <span>
                          {req.status === 'accepted'
                            ? 'Connected as Verified Friends 🤝'
                            : req.status === 'declined'
                            ? 'Declined'
                            : 'Pending Response'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-[#faf8ff] p-3.5 rounded-2xl border border-[#eaedff] text-xs text-[#3d4947]">
                    <span className="font-bold text-[#131b2e] block mb-1">Attached Note / Inquiry:</span>
                    <p className="italic leading-relaxed">"{req.requestMessage}"</p>
                  </div>

                  {/* Attached Planning Card Details */}
                  <div className="p-4 rounded-2xl bg-white border border-[#00685f]/30 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#00685f]">map</span>
                        <h4 className="font-bold text-xs sm:text-sm text-[#131b2e]">
                          {req.planningCard.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#e2fced] text-[#006947] text-[11px] font-bold">
                        {req.planningCard.state} • {req.planningCard.durationDays} Days • {req.planningCard.budget}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#5f6368] flex items-center gap-2">
                      <span>Corridor: {req.planningCard.corridor}</span>
                      <span>•</span>
                      <span>Mode: {req.planningCard.transitMode}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {req.planningCard.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#f2f3ff] text-[#00685f] text-[10px] font-semibold"
                        >
                          • {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* UNLOCKED FRIEND INFORMATION & LOCAL SECRETS (If accepted!) */}
                  {req.status === 'accepted' && req.friendInformationReply && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#e2fced]/60 to-[#faf8ff] border border-[#a4f2cb] space-y-3">
                      <div className="flex items-center gap-2 text-[#006947]">
                        <span className="material-symbols-outlined text-[20px]">lock_open</span>
                        <h4 className="font-extrabold text-xs sm:text-sm">
                          Unlocked Verified Friend Information &amp; Local Secrets
                        </h4>
                      </div>

                      <div className="space-y-2 text-xs text-[#131b2e]">
                        {req.friendInformationReply.localContactPhone && (
                          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#a4f2cb]">
                            <span className="material-symbols-outlined text-[16px] text-[#006947]">call</span>
                            <span>
                              <strong>Trusted Friend Contact:</strong> {req.friendInformationReply.localContactPhone}
                            </span>
                          </div>
                        )}

                        <div className="bg-white p-3 rounded-xl border border-[#a4f2cb] space-y-1">
                          <span className="font-bold text-[11px] text-[#006947] block">
                            Direct Insider Guidance:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-[#3d4947] text-[11px]">
                            {req.friendInformationReply.tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>

                        {req.friendInformationReply.secretSpot && (
                          <div className="flex items-start gap-2 text-[11px] text-[#3d4947]">
                            <span className="material-symbols-outlined text-[15px] text-[#00685f] shrink-0">
                              visibility
                            </span>
                            <span>
                              <strong>Secret Vantage:</strong> {req.friendInformationReply.secretSpot}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons if Pending */}
                  {req.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          respondToPlanningRequest(req.id, 'declined');
                          setRequests(getStoredPlanningRequests());
                          onShowToast('Request Declined', 'Notification updated.', 'info');
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => setActiveRespondingReq(req)}
                        className="px-4 py-2 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Accept &amp; Share Friend Information</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: AI TRAVEL CARDS & PASSPORTS                                */}
        {/* ================================================================= */}
        {activeTab === 'ai-cards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-[#eaedff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-lg text-[#131b2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f]">auto_awesome</span>
                  <span>AI Synthesized Travel Cards &amp; Passports</span>
                </h2>
                <p className="text-xs text-[#5f6368] mt-1">
                  Generated directly by Gemini AI for both the Journaling section and your My Profile section.
                </p>
              </div>

              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2.5 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[17px]">add_circle</span>
                <span>Generate New Travel Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-3xl p-6 bg-gradient-to-br from-[#004d46] via-[#00685f] to-[#0d3b36] text-white shadow-xl relative overflow-hidden space-y-4 border border-white/20"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
                        <span className="material-symbols-outlined text-[20px]">verified</span>
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#a4f2cb] block">
                          {card.regionOrGroup}
                        </span>
                        <span className="text-xs font-extrabold text-white">{card.badgeText}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white border border-white/20">
                      {card.createdAt}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="text-lg font-black tracking-tight text-white">{card.title}</h3>
                    <p className="text-xs text-white/90 italic bg-black/25 p-3 rounded-xl border border-white/10">
                      "{card.vibeQuote}"
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#a4f2cb] uppercase tracking-wider block">
                        Verified Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {card.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-medium text-white"
                          >
                            • {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-amber-200 pt-1">
                      <span className="material-symbols-outlined text-[16px]">restaurant</span>
                      <span className="font-semibold">Local Food: {card.favoriteFood}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-white/70">Target: {card.targetSection}</span>
                    <button
                      onClick={() => {
                        onShowToast('Passport Card Ready! 📲', 'Card image formatted for social sharing.', 'success');
                      }}
                      className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Export Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Planning Card Modal */}
      <SharePlanningCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        recipient={selectedRecipient}
        onShowToast={onShowToast}
        onRequestSent={() => {
          setRequests(getStoredPlanningRequests());
        }}
      />

      {/* AI Travel Card Synthesizer Modal */}
      <AiTravelCardModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        targetSection="community"
        onShowToast={onShowToast}
        onCardGenerated={(card) => {
          setAiCards(getStoredAiCards());
          setPosts(getStoredSocialPosts());
        }}
      />

      {/* Create New Photo/Food Post Modal */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#00685f]/10 text-[#00685f]">
                  <span className="material-symbols-outlined text-[22px]">photo_camera</span>
                </span>
                <h3 className="font-bold text-base text-[#131b2e]">Share Photo or Local Food</h3>
              </div>
              <button
                onClick={() => setIsCreatePostModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                  Photo Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'food', label: '🍛 Food Specialty' },
                    { id: 'scenic', label: '🌄 Scenic Landscape' },
                    { id: 'heritage', label: '🏛️ Heritage & Rail' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewPostType(t.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                        newPostType === t.id
                          ? 'bg-[#00685f] text-white border-[#00685f]'
                          : 'bg-[#faf8ff] text-gray-700 border-[#eaedff]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {newPostType === 'food' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                    Dish / Food Specialty Name
                  </label>
                  <input
                    type="text"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="e.g. Ranchi Dhuska with Chana Ghugni, Medinipur Chhana-boda"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Upper Bazaar, Ranchi, Jharkhand"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                  Group Affiliation
                </label>
                <select
                  value={newGroupAffiliation}
                  onChange={(e) => setNewGroupAffiliation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                >
                  <option value="Jharkhand Explorer Group">Jharkhand Explorer Group 🌿</option>
                  <option value="West Bengal Corridors">West Bengal Corridors 🚂</option>
                  <option value="Himalayan High-Pass Club">Himalayan High-Pass Club ⛰️</option>
                  <option value="Rajasthan Heritage Club">Rajasthan Heritage Club 🏰</option>
                </select>
              </div>

              {/* Photo Preset Library */}
              <div>
                <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                  Select High-Res Photo Preset or Custom URL
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { label: 'Dhuska', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
                    { label: 'Litti Chokha', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80' },
                    { label: 'Chhana-boda', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
                    { label: 'Netarhat Vista', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setNewPhotoUrl(p.url)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                        newPhotoUrl === p.url ? 'border-[#00685f] scale-102' : 'border-transparent'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-14 object-cover" />
                      <span className="text-[10px] text-center block bg-gray-50 py-0.5 truncate">{p.label}</span>
                    </div>
                  ))}
                </div>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                  Caption / Tasting Notes / Story
                </label>
                <textarea
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Share how it tastes, how to reach it, or local memories..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">publish</span>
                  <span>Publish to Community Feed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response to Friend Request Modal (Giving Insider Friend Tips) */}
      {activeRespondingReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#00685f]/10 text-[#00685f]">
                  <span className="material-symbols-outlined text-[20px]">handshake</span>
                </span>
                <h3 className="font-bold text-base text-[#131b2e]">Accept as Verified Friend</h3>
              </div>
              <button
                onClick={() => setActiveRespondingReq(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#5f6368] leading-relaxed">
              You are accepting the planning chart shared by{' '}
              <strong className="text-[#131b2e]">{activeRespondingReq.senderName}</strong> for{' '}
              <strong>{activeRespondingReq.planningCard.title}</strong>. As their verified friend, provide your insider recommendations below:
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider">
                Your Private Friend Insider Guidance:
              </label>
              <textarea
                rows={4}
                value={responseFriendTips}
                onChange={(e) => setResponseFriendTips(e.target.value)}
                placeholder="e.g. 1. Visit Upper Bazaar for morning Dhuska. 2. Hire Ramesh (+91 98351-XXXXX) for safe transport to Dassam Falls. 3. Avoid afternoon traffic near station..."
                className="w-full text-xs p-3 rounded-2xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setActiveRespondingReq(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcceptRequest}
                className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Send Tips &amp; Connect as Friend</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
