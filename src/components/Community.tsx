import React, { useState } from 'react';
import { ScreenType, TransitionType } from '../types';

interface CommunityProps {
  onNavigate: (screen: ScreenType, transition?: TransitionType) => void;
  onPlanTripTo?: (origin: string, destination: string) => void;
}

interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  location: string;
  timeAgo: string;
  title: string;
  content: string;
  image?: string;
  category: 'Story' | 'Local Tip' | 'Route Review' | 'Solo Travel';
  likes: number;
  liked: boolean;
  commentsCount: number;
  tags: string[];
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Priya Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    location: 'Varanasi, Uttar Pradesh',
    timeAgo: '3 hours ago',
    title: 'Secret vantage point for Dashashwamedh Aarti without the tourist crush',
    content: 'Most tourists crowd the stairs right in front of the priests. If you hire a small wooden rowing boat 45 minutes before 6:30 PM and position on the river near Rajendra Prasad Ghat, you get an uninterrupted, serene angle with incense smoke drifting across the reflection on the Ganga. Paid ₹300 for 1.5 hours.',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
    category: 'Local Tip',
    likes: 84,
    liked: false,
    commentsCount: 19,
    tags: ['Ghats', 'BoatRide', 'BudgetTip'],
  },
  {
    id: 'post-2',
    author: 'Rohan Mehta',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Leh Ladakh',
    timeAgo: '1 day ago',
    title: 'Crossing Khardung La on a Royal Enfield — what they don’t tell you',
    content: 'Acclimatization in Leh for 48 hours is non-negotiable! Drink garlic soup and at least 4 liters of water. The descent toward Nubra Valley has black ice patches near North Pullu before 10 AM. Carry extra fuel canisters because the last petrol pump is in Karu.',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&auto=format&fit=crop&q=80',
    category: 'Route Review',
    likes: 142,
    liked: true,
    commentsCount: 34,
    tags: ['Ladakh', 'MotorcycleExpedition', 'SafetyFirst'],
  },
  {
    id: 'post-3',
    author: 'Ananya Roy',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Kolkata, West Bengal',
    timeAgo: '2 days ago',
    title: 'A morning heritage walk: Indian Coffee House to Kumartuli sculptors',
    content: 'Took the early morning tram #24 from Esplanade to College Street. Had infused black coffee with chicken kobiraji at the historic 1942 Coffee House, then walked down to the clay artisan alley of Kumartuli where idol makers work with Ganga silt. The light at 7:30 AM is pure magic for photography.',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop&q=80',
    category: 'Story',
    likes: 96,
    liked: false,
    commentsCount: 15,
    tags: ['HeritageWalk', 'KolkataTrams', 'StreetPhotography'],
  },
  {
    id: 'post-4',
    author: 'Vikram Sengupta',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Fontainhas, Goa',
    timeAgo: '4 days ago',
    title: 'Why staying in Panaji’s Latin Quarter beats North Goa beach resorts',
    content: 'Waking up to Portuguese church bells, pastel yellow bakeries serving fresh warm poi bread, and jazz drifting from small taverns in the evening. Rent an electric bicycle to ride along the Mandovi river promenade.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    category: 'Solo Travel',
    likes: 118,
    liked: false,
    commentsCount: 22,
    tags: ['GoaHeritage', 'SlowTravel', 'Architecture'],
  },
];

export const Community: React.FC<CommunityProps> = ({ onNavigate, onPlanTripTo }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Story' | 'Local Tip' | 'Route Review' | 'Solo Travel'>('All');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Story' | 'Local Tip' | 'Route Review' | 'Solo Travel'>('Local Tip');
  const [newTags, setNewTags] = useState('TravelTip, Explore');

  const handleLike = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      author: 'Aarav Patel (You)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      location: newLocation || 'India',
      timeAgo: 'Just now',
      title: newTitle,
      content: newContent,
      category: newCategory,
      likes: 1,
      liked: true,
      commentsCount: 0,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    setPosts([post, ...posts]);
    setShowNewPostModal(false);
    setNewTitle('');
    setNewLocation('');
    setNewContent('');
  };

  const filteredPosts = posts.filter((p) => activeFilter === 'All' || p.category === activeFilter);

  return (
    <main className="w-full pt-16 bg-[#faf8ff] px-6 min-h-screen">
      <div className="flex flex-col w-full max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="py-6 border-b border-[#eaedff] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00685f]/10 text-[#00685f]">
                <span className="material-symbols-outlined text-[24px]">group</span>
              </span>
              <h1 className="text-[28px] font-bold text-[#131b2e] tracking-tight">Traveler Community</h1>
            </div>
            <p className="text-[14px] text-[#3d4947] mt-1">
              Field-tested routes, local vantage hacks, and real-time tips from fellow explorers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewPostModal(true)}
              className="px-4 py-2.5 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Share a Tip or Story</span>
            </button>
          </div>
        </div>

        {/* Travel Buddies Broadcast Card */}
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-[#00685f]/10 via-[#e2e7ff] to-[#faf8ff] border border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">diversity_3</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#131b2e]">Looking for a Travel Buddy?</h3>
              <p className="text-[12px] text-[#3d4947]">
                Connect with verified solo travelers planning Varanasi, Ladakh, or Spiti in 2026/2027.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveFilter('Solo Travel');
            }}
            className="px-3.5 py-1.5 bg-white border border-[#eaedff] hover:border-[#00685f] text-[#00685f] text-[12px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Explore Solo Groups
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {(['All', 'Local Tip', 'Story', 'Route Review', 'Solo Travel'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#00685f] text-white shadow-xs'
                  : 'bg-white text-[#3d4947] border border-[#eaedff] hover:bg-[#f2f3ff]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Author Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#eaedff]"
                  />
                  <div>
                    <div className="font-bold text-[14px] text-[#131b2e] flex items-center gap-1">
                      {post.author}
                      <span className="material-symbols-outlined text-[#00685f] text-[14px]">verified</span>
                    </div>
                    <div className="text-[11px] text-[#3d4947] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      {post.location} • {post.timeAgo}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e2e7ff] text-[#00685f] uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-[17px] font-bold text-[#131b2e] mb-1.5 leading-snug">{post.title}</h3>
                <p className="text-[13px] text-[#3d4947] leading-relaxed line-clamp-4">{post.content}</p>
              </div>

              {/* Attached Image */}
              {post.image && (
                <div className="h-44 rounded-xl overflow-hidden bg-[#e2e7ff]">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[11px] text-[#00685f] bg-[#00685f]/10 px-2 py-0.5 rounded-md font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Social Actions & Plan Button */}
              <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 text-[12px] font-semibold transition-colors cursor-pointer ${
                      post.liked ? 'text-[#ba1a1a]' : 'text-[#3d4947] hover:text-[#ba1a1a]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {post.liked ? 'favorite' : 'favorite_border'}
                    </span>
                    <span>{post.likes}</span>
                  </button>

                  <div className="flex items-center gap-1 text-[12px] text-[#3d4947]">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span>{post.commentsCount}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onPlanTripTo) {
                      onPlanTripTo('New Delhi, India', post.location);
                    }
                    onNavigate('planner', 'none');
                  }}
                  className="px-3 py-1.5 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#00685f] rounded-lg text-[12px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span>Plan for {post.location.split(',')[0]}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePost}
            className="bg-white rounded-3xl max-w-lg w-full border border-[#eaedff] p-6 shadow-2xl space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <h3 className="text-[18px] font-bold text-[#131b2e]">Share a Travel Experience or Tip</h3>
              <button
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="p-1 rounded-full hover:bg-[#f2f3ff] text-[#3d4947] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Best chai spot at sunrise near Assi Ghat..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Varanasi, UP"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                >
                  <option value="Local Tip">Local Tip</option>
                  <option value="Story">Story</option>
                  <option value="Route Review">Route Review</option>
                  <option value="Solo Travel">Solo Travel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Content</label>
              <textarea
                required
                rows={4}
                placeholder="Describe the route, prices, timing, or practical advice..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Ghats, Budget, Photography"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[#3d4947] hover:bg-[#f2f3ff] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                Publish Story
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};
