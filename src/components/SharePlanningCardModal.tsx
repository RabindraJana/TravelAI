/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CommunityDirectoryUser, PlanningCard, PlanningCardShareRequest } from '../types';
import { DEFAULT_PLANNING_CARDS, sendPlanningCardRequest } from '../utils/communityStorage';

interface SharePlanningCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: CommunityDirectoryUser | null;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onRequestSent?: () => void;
}

export const SharePlanningCardModal: React.FC<SharePlanningCardModalProps> = ({
  isOpen,
  onClose,
  recipient,
  onShowToast,
  onRequestSent,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(DEFAULT_PLANNING_CARDS[0].id);
  const [customMessage, setCustomMessage] = useState(
    recipient?.state === 'Jharkhand'
      ? "Hi! I noticed you are a verified member of the Jharkhand Explorer Group. I'm traveling next week and would love to share my planning chart. Could you give me insider friend tips on the best local food and trusted local transport?"
      : "Hello! I saw your verified badge on Travel AI. Here is my planning chart for our upcoming trip. Could you review it and share local friend advice?"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !recipient) return null;

  const selectedCard = DEFAULT_PLANNING_CARDS.find((c) => c.id === selectedCardId) || DEFAULT_PLANNING_CARDS[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newRequest: PlanningCardShareRequest = {
      id: `req-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'Explorer (You)',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      senderCity: 'Kolkata, WB',
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientAvatar: recipient.avatar,
      recipientGroup: recipient.groups[0] || 'Community Member',
      recipientBadge: recipient.verificationBadge,
      planningCard: selectedCard,
      requestMessage: customMessage.trim(),
      status: 'pending',
      createdAt: 'Just now',
    };

    sendPlanningCardRequest(newRequest);
    setIsSubmitting(false);

    onShowToast(
      'Planning Chart Shared! 🤝',
      `Sent to ${recipient.name} (${recipient.verificationBadge}). Once accepted, you will unlock mutual friend tips!`,
      'success'
    );

    onRequestSent?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#eaedff] space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#eaedff]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={recipient.avatar}
                alt={recipient.name}
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-[#00685f]/30"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#006947] text-white p-0.5 rounded-full text-[13px] flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#131b2e]">{recipient.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#e2fced] text-[#006947] text-[10px] font-bold">
                  {recipient.verificationBadge}
                </span>
              </div>
              <p className="text-xs text-[#5f6368] flex items-center gap-1.5 mt-0.5">
                <span>{recipient.location}</span>
                <span>•</span>
                <span className="text-[#00685f] font-semibold">{recipient.groups[0]}</span>
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

        {/* Trust Banner */}
        <div className="p-3.5 rounded-2xl bg-[#00685f]/10 border border-[#00685f]/20 flex items-center gap-3 text-xs text-[#00685f]">
          <span className="material-symbols-outlined text-[22px] shrink-0 text-[#00685f]">verified_user</span>
          <div>
            <span className="font-bold block">Verified Badge Trust Guarantee</span>
            <span className="text-[#3d4947]">
              This user has passed identity verification (Trust Score {recipient.trustScore}%). When they accept your request, you can exchange private friend tips and local recommendations.
            </span>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Step 1: Select Planning Card */}
          <div>
            <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2">
              Select Planning Card to Share
            </label>
            <div className="space-y-2">
              {DEFAULT_PLANNING_CARDS.map((card) => {
                const isSelected = card.id === selectedCardId;
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#00685f] bg-[#00685f]/5 ring-1 ring-[#00685f]'
                        : 'border-[#eaedff] bg-white hover:border-[#00685f]/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#131b2e]">{card.title}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[#00685f] text-[10px] font-semibold">
                          {card.state}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5f6368] flex items-center gap-2">
                        <span>{card.corridor}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#006947]">{card.budget}</span>
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isSelected ? 'text-[#00685f]' : 'text-gray-300'
                      }`}
                    >
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Card Preview */}
          <div className="p-3.5 rounded-2xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
            <span className="text-[11px] font-bold text-[#3d4947] uppercase block">
              Attached Planning Chart Preview
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-xl border border-[#eaedff]">
                <span className="text-[10px] text-gray-400 block">Duration</span>
                <span className="font-bold text-[#131b2e]">{selectedCard.durationDays} Days</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#eaedff]">
                <span className="text-[10px] text-gray-400 block">Transit Mode</span>
                <span className="font-bold text-[#131b2e]">{selectedCard.transitMode}</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-[#eaedff] text-[11px]">
              <span className="text-[10px] text-gray-400 block mb-1">Key Stops &amp; Highlights</span>
              <div className="flex flex-wrap gap-1">
                {selectedCard.highlights.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#e2fced] text-[#006947] text-[10px] font-medium">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Message to Friend */}
          <div>
            <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1.5">
              Personal Request Message
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Ask for specific advice, local food tips, or reliable toto drivers..."
              className="w-full text-xs p-3 rounded-2xl border border-[#eaedff] focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] bg-[#faf8ff]"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#00685f] hover:bg-[#00534c] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Send Request &amp; Share Planning Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
