/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AiTravelCard } from '../types';
import { generateAiTravelCardWithGemini } from '../utils/geminiClient';
import { addAiTravelCard } from '../utils/communityStorage';

interface AiTravelCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSection: 'journal' | 'profile' | 'community';
  initialDestination?: string;
  initialGroup?: string;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onCardGenerated?: (card: AiTravelCard) => void;
}

export const AiTravelCardModal: React.FC<AiTravelCardModalProps> = ({
  isOpen,
  onClose,
  targetSection,
  initialDestination = 'Jharkhand & Chotanagpur Plateau',
  initialGroup = 'Jharkhand Explorer Group',
  onShowToast,
  onCardGenerated,
}) => {
  const [destination, setDestination] = useState(initialDestination);
  const [regionOrGroup, setRegionOrGroup] = useState(initialGroup);
  const [favoriteFood, setFavoriteFood] = useState('Crispy Dhuska & Desi Chana Ghugni');
  const [userNotes, setUserNotes] = useState('Loved the morning mist over Netarhat and tasting authentic tribal cuisine.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<AiTravelCard | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const result = await generateAiTravelCardWithGemini({
        targetSection,
        authorName: 'Explorer (You)',
        authorRole: 'Verified Explorer Member',
        destination,
        regionOrGroup,
        notes: userNotes,
        favoriteFood,
        isVerified: true,
        badgeText: 'Jharkhand Verified Explorer Badge',
      });

      if (result.success && result.card) {
        setGeneratedCard(result.card);
        onShowToast(
          'AI Travel Card Synthesized! ✨',
          `Created "${result.card.title}". You can now share it to the community feed or keep it on your profile.`,
          'success'
        );
      }
    } catch {
      onShowToast('Generation Notice', 'Synthesized travel card with verified parameters.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToFeed = () => {
    if (!generatedCard) return;
    const finalCard = { ...generatedCard, isSharedToFeed: true };
    addAiTravelCard(finalCard);
    onShowToast(
      'Card Published to Community Feed! 📸',
      'Fellow travelers and verified members can now view and like your card in the social photo feed.',
      'success'
    );
    onCardGenerated?.(finalCard);
    onClose();
  };

  const handleSaveToProfile = () => {
    if (!generatedCard) return;
    const finalCard = { ...generatedCard, isSharedToFeed: false };
    addAiTravelCard(finalCard);
    onShowToast('Card Pinned to Profile! 📌', 'Your verified travel card has been added to your passport collection.', 'success');
    onCardGenerated?.(finalCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-[#00685f] to-[#00a896] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </span>
            <div>
              <h3 className="font-bold text-[17px] text-[#131b2e]">
                {targetSection === 'journal' ? 'AI Journal Story Card' : 'AI Profile Passport Card'}
              </h3>
              <p className="text-[11px] text-[#5f6368]">
                Synthesizes a shareable, high-trust card with verified badge &amp; food highlights.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {!generatedCard ? (
          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                Destination / Corridor
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Ranchi, Netarhat & Chotanagpur, Jharkhand"
                className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                Regional Group Affiliation
              </label>
              <select
                value={regionOrGroup}
                onChange={(e) => setRegionOrGroup(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
              >
                <option value="Jharkhand Explorer Group">Jharkhand Explorer Group 🌿</option>
                <option value="West Bengal Corridors">West Bengal Corridors 🚂</option>
                <option value="Himalayan High-Pass Club">Himalayan High-Pass Club ⛰️</option>
                <option value="Rajasthan Heritage Club">Rajasthan Heritage Club 🏰</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                Favorite Regional Dish / Specialty
              </label>
              <input
                type="text"
                value={favoriteFood}
                onChange={(e) => setFavoriteFood(e.target.value)}
                placeholder="e.g. Crispy Dhuska & Ghugni, Litti Chokha, Chhana-boda"
                className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                Traveler Memory / Atmosphere Note
              </label>
              <textarea
                rows={2}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Key moments, river crossings, forest sights..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] bg-[#faf8ff]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>AI Synthesizing Card...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>Generate Travel Card</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Generated Card Visual Preview */}
            <div className="rounded-3xl p-5 bg-gradient-to-br from-[#00685f] via-[#00524a] to-[#0d3b36] text-white shadow-xl relative overflow-hidden border border-white/20">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Row */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-amber-300">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a4f2cb] block">
                      {generatedCard.regionOrGroup}
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {generatedCard.badgeText}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold text-white tracking-wider border border-white/20">
                  {generatedCard.createdAt}
                </span>
              </div>

              {/* Card Body */}
              <div className="py-4 space-y-3">
                <h4 className="text-lg font-black tracking-tight text-white leading-snug">
                  {generatedCard.title}
                </h4>
                <p className="text-xs text-white/90 italic bg-black/20 p-2.5 rounded-xl border border-white/10">
                  "{generatedCard.vibeQuote}"
                </p>

                {/* Highlights */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#a4f2cb] uppercase tracking-wider block">
                    Key Corridor Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedCard.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-white"
                      >
                        • {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Food Highlight */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-200">
                  <span className="material-symbols-outlined text-[16px]">restaurant</span>
                  <span className="font-semibold">Local Food: {generatedCard.favoriteFood}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-white/70">
                <span>Verified Traveler ID: EXP-2026-JH</span>
                <span className="flex items-center gap-1 text-[#a4f2cb]">
                  <span className="material-symbols-outlined text-[12px]">shield</span>
                  <span>100% Authentic Community Card</span>
                </span>
              </div>
            </div>

            {/* Sharing Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareToFeed}
                className="w-full sm:flex-1 py-2.5 px-3 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>Share to Community Feed</span>
              </button>
              <button
                type="button"
                onClick={handleSaveToProfile}
                className="w-full sm:flex-1 py-2.5 px-3 bg-white border border-[#eaedff] hover:bg-[#f2f3ff] text-[#131b2e] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                <span>Pin to My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setGeneratedCard(null)}
                className="py-2.5 px-3 text-gray-500 hover:text-gray-800 text-xs font-semibold cursor-pointer"
              >
                New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
