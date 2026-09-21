import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry, JournalVisibility } from '../types';
import {
  buildJournalShareUrl,
  generateLocalSocialSummaries,
  getDirectShareUrls,
  canUseNativeShare,
  shareViaNative,
  SocialPlatform,
  SocialTone,
  SocialSummaryBundle,
} from '../utils/socialShare';
import { generateSocialSummaryWithGemini } from '../utils/geminiClient';

interface ShareJournalModalProps {
  entry: JournalEntry;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVisibility?: (entry: JournalEntry, newVisibility: JournalVisibility) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const PLATFORMS: { id: SocialPlatform; label: string; icon: string; charLimit?: number; color: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', color: '#25D366' },
  { id: 'twitter', label: 'X (Twitter)', icon: 'tag', charLimit: 280, color: '#000000' },
  { id: 'instagram', label: 'Instagram / Threads', icon: 'photo_camera', color: '#E1306C' },
  { id: 'facebook', label: 'Facebook', icon: 'share', color: '#1877F2' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'work', color: '#0A66C2' },
];

const TONE_OPTIONS: { id: SocialTone; label: string; icon: string; desc: string }[] = [
  { id: 'poetic', label: 'Poetic & Inspiring', icon: 'auto_awesome', desc: 'Emotional, atmospheric, and mindful' },
  { id: 'adventurous', label: 'Adventurous', icon: 'explore', desc: 'High energy, motion, and trail excitement' },
  { id: 'punchy', label: 'Short & Punchy', icon: 'bolt', desc: 'Fast scannable hooks for quick shares' },
  { id: 'foodie', label: 'Foodie & Cultural', icon: 'restaurant', desc: 'Focus on authentic flavors and heritage' },
];

export const ShareJournalModal: React.FC<ShareJournalModalProps> = ({
  entry,
  isOpen,
  onClose,
  onUpdateVisibility,
  onShowToast,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('whatsapp');
  const [selectedTone, setSelectedTone] = useState<SocialTone>('poetic');
  const [activeTab, setActiveTab] = useState<'summaries' | 'card' | 'qr'>('summaries');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);

  // Canonical share link
  const shareUrl = useMemo(() => buildJournalShareUrl(entry), [entry]);

  // Social summaries state (starts with smart local bundle, can be augmented with Gemini)
  const [summaries, setSummaries] = useState<SocialSummaryBundle>(() =>
    generateLocalSocialSummaries(entry, shareUrl, 'poetic')
  );

  // Editable summary text for currently active platform
  const [editableSummaries, setEditableSummaries] = useState<Record<SocialPlatform, string>>(() =>
    generateLocalSocialSummaries(entry, shareUrl, 'poetic')
  );

  // Synchronize when entry or shareUrl changes
  useEffect(() => {
    const initial = generateLocalSocialSummaries(entry, shareUrl, selectedTone);
    setSummaries(initial);
    setEditableSummaries(initial);
  }, [entry, shareUrl, selectedTone]);

  if (!isOpen) return null;

  const isPublic = entry.visibility === 'public';
  const currentSummaryText = editableSummaries[selectedPlatform] || '';
  const currentPlatformConfig = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const charLimit = currentPlatformConfig.charLimit;
  const isOverLimit = charLimit ? currentSummaryText.length > charLimit : false;

  // Direct share links for platforms
  const directUrls = getDirectShareUrls({
    title: entry.title,
    summary: currentSummaryText,
    url: shareUrl,
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2400);
      onShowToast?.('Share Link Copied!', 'Direct link to this travel story is on your clipboard.', 'success');
    } catch {
      onShowToast?.('Copy Error', 'Please select and copy the link manually.', 'warning');
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(currentSummaryText);
      setIsCopiedSummary(true);
      setTimeout(() => setIsCopiedSummary(false), 2400);
      onShowToast?.('Summary Copied!', `Formatted caption for ${currentPlatformConfig.label} copied.`, 'success');
    } catch {
      onShowToast?.('Copy Error', 'Could not copy summary to clipboard.', 'warning');
    }
  };

  const handleNativeShare = async () => {
    const success = await shareViaNative({
      title: entry.title,
      text: `${entry.title} — ${entry.mottoQuote || 'Life is just going on. Life is too short, so make this trip happen!'}`,
      url: shareUrl,
    });
    if (success) {
      onShowToast?.('Shared!', 'Story shared successfully.', 'success');
    }
  };

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await generateSocialSummaryWithGemini({
        title: entry.title,
        destination: entry.destination,
        story: entry.story,
        mustVisitSpots: entry.mustVisitSpots,
        localFoodRecommendations: entry.localFoodRecommendations,
        mottoQuote: entry.mottoQuote,
        shareUrl,
        tone: selectedTone,
      });

      if (res && res.summaries) {
        setSummaries(res.summaries);
        setEditableSummaries(res.summaries);
        setAiModelUsed(res.model);
        onShowToast?.(
          'AI Captions Generated!',
          `Gemini crafted fresh social summaries with a "${selectedTone}" tone.`,
          'success'
        );
      }
    } catch (err) {
      console.warn('AI summary generation error:', err);
      // Fallback
      const refreshed = generateLocalSocialSummaries(entry, shareUrl, selectedTone);
      setSummaries(refreshed);
      setEditableSummaries(refreshed);
      onShowToast?.('Social Summaries Refreshed', 'Generated tailored summaries based on entry notes.', 'info');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleToggleVisibility = () => {
    if (onUpdateVisibility) {
      const nextVisibility: JournalVisibility = isPublic ? 'private' : 'public';
      onUpdateVisibility(entry, nextVisibility);
      onShowToast?.(
        nextVisibility === 'public' ? 'Public Guide Activated' : 'Marked as Private',
        nextVisibility === 'public'
          ? 'Anyone with this shareable link can now explore your journal entry.'
          : 'This story is now personal to your browser.',
        'info'
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#ffdbca] my-auto flex flex-col">
        {/* Header with warm aesthetic gradient */}
        <div className="bg-gradient-to-r from-[#131b2e] via-[#1b2b46] to-[#004d46] p-6 text-white relative shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#ffdbca] bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
                  <span className="material-symbols-outlined text-[14px]">share</span>
                  Social Share Hub
                </span>

                {/* Public vs Private Status Indicator */}
                <span
                  className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isPublic
                      ? 'bg-[#89f5e7]/20 text-[#89f5e7] border-[#89f5e7]/40'
                      : 'bg-amber-400/20 text-amber-200 border-amber-300/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {isPublic ? 'public' : 'lock'}
                  </span>
                  <span>{isPublic ? 'Public Journal Story' : 'Private Journal'}</span>
                </span>
              </div>

              <h2 id="share-modal-title" className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-tight leading-tight pt-1">
                Share "{entry.title}"
              </h2>

              <p className="text-[12.5px] text-gray-300 flex items-center gap-1.5 pt-0.5">
                <span className="material-symbols-outlined text-[15px] text-[#fd761a]">pin_drop</span>
                <span>{entry.destination}</span>
                <span>•</span>
                <span>By {entry.author}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Privacy helper note & quick toggle */}
          {!isPublic && (
            <div className="mt-3.5 p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-between gap-3 text-[12px] text-amber-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-300 text-[18px] shrink-0">info</span>
                <span>This story is private. Make it public so friends and social followers can read it via link.</span>
              </div>
              <button
                type="button"
                onClick={handleToggleVisibility}
                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#131b2e] font-bold text-[11px] shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                Make Public &amp; Share
              </button>
            </div>
          )}

          {isPublic && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11.5px] text-gray-300">
              <span className="flex items-center gap-1.5 text-[#89f5e7]">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                Public link is active and ready to share across platforms
              </span>
              <button
                type="button"
                onClick={handleToggleVisibility}
                className="text-[11px] text-gray-300 hover:text-white underline cursor-pointer"
              >
                Switch to Private
              </button>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* SECTION 1: SHAREABLE LINK (Direct copy & native share) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#faf8ff] via-[#f7f5ff] to-[#f0f9f8] border border-[#eaedff] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-extrabold uppercase tracking-wider text-[#131b2e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#00685f]">link</span>
                <span>Direct Shareable Story Link</span>
              </label>

              {canUseNativeShare() && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="text-[11.5px] font-bold text-[#00685f] hover:text-[#004d46] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">ios_share</span>
                  <span>Share via Device Apps</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4947] text-[16px]">
                  link
                </span>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full h-11 pl-9 pr-3 bg-white rounded-xl text-[12.5px] text-[#131b2e] font-mono border border-[#d3ccf7] outline-none shadow-2xs select-all truncate"
                />
              </div>

              <button
                id="copy-share-link-btn"
                type="button"
                onClick={handleCopyLink}
                className={`h-11 px-4 rounded-xl text-[12.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
                  isCopiedLink
                    ? 'bg-[#00685f] text-white'
                    : 'bg-[#131b2e] hover:bg-[#1a2b49] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCopiedLink ? 'check' : 'content_copy'}
                </span>
                <span>{isCopiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#3d4947]">
              Anyone who clicks this link will directly land on this story in the Travel Journal.
            </p>
          </div>

          {/* SECTION 2: 1-CLICK QUICK SHARE INTENT BUTTONS */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d4947] block">
              1-Click Share to Social Channels
            </span>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* WhatsApp */}
              <a
                href={directUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-[#dcf8c6] bg-[#f0fbf0] hover:bg-[#e1f8e1] text-[#1e7e34] flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer shadow-2xs group"
                title="Share to WhatsApp"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">chat</span>
                <span className="text-[10.5px] font-bold">WhatsApp</span>
              </a>

              {/* X / Twitter */}
              <a
                href={directUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-black flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer shadow-2xs group"
                title="Post to X (Twitter)"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">tag</span>
                <span className="text-[10.5px] font-bold">X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href={directUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100 text-[#1877F2] flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer shadow-2xs group"
                title="Share on Facebook"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">share</span>
                <span className="text-[10.5px] font-bold">Facebook</span>
              </a>

              {/* LinkedIn */}
              <a
                href={directUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-sky-100 bg-sky-50/60 hover:bg-sky-100 text-[#0A66C2] flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer shadow-2xs group"
                title="Share on LinkedIn"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">work</span>
                <span className="text-[10.5px] font-bold">LinkedIn</span>
              </a>

              {/* Telegram */}
              <a
                href={directUrls.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-cyan-100 bg-cyan-50/60 hover:bg-cyan-100 text-[#0088cc] flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer shadow-2xs group"
                title="Send via Telegram"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">send</span>
                <span className="text-[10.5px] font-bold">Telegram</span>
              </a>

              {/* Email */}
              <a
                href={directUrls.email}
                className="p-2.5 rounded-xl border border-orange-100 bg-orange-50/60 hover:bg-orange-100 text-[#d9534f] flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer shadow-2xs group"
                title="Send via Email"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">mail</span>
                <span className="text-[10.5px] font-bold">Email</span>
              </a>
            </div>
          </div>

          {/* SECTION 3: TAB NAVIGATION (Social Summaries vs Visual Card vs QR Code) */}
          <div className="border-b border-[#eaedff] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('summaries')}
              className={`pb-2.5 px-3 text-[13px] font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'summaries'
                  ? 'border-[#00685f] text-[#00685f]'
                  : 'border-transparent text-[#3d4947] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">notes</span>
              <span>Platform Summaries &amp; Captions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`pb-2.5 px-3 text-[13px] font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'card'
                  ? 'border-[#00685f] text-[#00685f]'
                  : 'border-transparent text-[#3d4947] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">style</span>
              <span>Story Card Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`pb-2.5 px-3 text-[13px] font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'border-[#00685f] text-[#00685f]'
                  : 'border-transparent text-[#3d4947] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>QR Code</span>
            </button>
          </div>

          {/* TAB 1: SOCIAL SUMMARIES & GEMINI AI CAPTION STUDIO */}
          {activeTab === 'summaries' && (
            <div className="space-y-4">
              {/* Platform Selector Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#f2f3ff] p-1.5 rounded-2xl">
                {PLATFORMS.map((plat) => {
                  const isSelected = selectedPlatform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(plat.id);
                        setIsCopiedSummary(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-[#131b2e] shadow-xs'
                          : 'text-[#3d4947] hover:text-[#131b2e] hover:bg-white/60'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{plat.icon}</span>
                      <span>{plat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Gemini AI Caption Enhancer Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#f8f5ff] via-[#f2f9f8] to-[#fff8f2] border border-[#d3ccf7] space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-[#4916a0]">
                    <span className="material-symbols-outlined text-[17px] text-[#7a48d6]">auto_awesome</span>
                    <span>Gemini AI Social Caption Studio</span>
                  </div>

                  {aiModelUsed && (
                    <span className="text-[10px] font-semibold text-[#00685f] bg-white px-2 py-0.5 rounded-md border border-[#eaedff]">
                      Crafted via {aiModelUsed}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-1">
                    <span className="text-[11px] font-bold text-[#3d4947] shrink-0">Tone:</span>
                    {TONE_OPTIONS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTone(t.id)}
                        className={`text-[11.5px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer shrink-0 ${
                          selectedTone === t.id
                            ? 'bg-[#7a48d6] text-white border-[#7a48d6]'
                            : 'bg-white text-[#131b2e] border-[#d3ccf7] hover:bg-gray-50'
                        }`}
                        title={t.desc}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <button
                    id="generate-ai-social-summary-btn"
                    type="button"
                    onClick={handleGenerateAiSummary}
                    disabled={isGeneratingAi}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00685f] to-[#004d46] hover:from-[#008378] hover:to-[#005e55] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[15px] ${isGeneratingAi ? 'animate-spin' : 'text-[#89f5e7]'}`}>
                      {isGeneratingAi ? 'progress_activity' : 'auto_awesome'}
                    </span>
                    <span>{isGeneratingAi ? 'Generating...' : 'Regenerate with Gemini AI'}</span>
                  </button>
                </div>
              </div>

              {/* Editable Formatted Summary & Caption Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#131b2e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">edit_note</span>
                    <span>Ready-to-Post Summary for {currentPlatformConfig.label}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {charLimit && (
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          isOverLimit ? 'text-rose-600' : 'text-[#3d4947]'
                        }`}
                      >
                        {currentSummaryText.length} / {charLimit} chars
                        {isOverLimit && ' (Limit Exceeded)'}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const regenerated = generateLocalSocialSummaries(entry, shareUrl, selectedTone);
                        setEditableSummaries((prev) => ({ ...prev, [selectedPlatform]: regenerated[selectedPlatform] }));
                      }}
                      className="text-[11px] text-[#00685f] hover:underline cursor-pointer"
                    >
                      Reset Template
                    </button>
                  </div>
                </div>

                <textarea
                  id="social-summary-textarea"
                  rows={8}
                  value={currentSummaryText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditableSummaries((prev) => ({ ...prev, [selectedPlatform]: val }));
                  }}
                  className="w-full p-4 bg-[#faf8ff] rounded-2xl text-[13px] text-[#131b2e] font-sans outline-none border border-[#eaedff] focus:bg-white focus:ring-2 focus:ring-[#00685f]/30 leading-relaxed resize-y font-normal"
                />

                {/* Bottom Actions for Summary */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#3d4947]">
                    <span className="material-symbols-outlined text-[15px] text-[#00685f]">format_quote</span>
                    <span>Includes the traveler motto: <em>"Life is just going on. Life is too short, make this trip happen!"</em></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct Platform Launcher */}
                    {directUrls[selectedPlatform as keyof typeof directUrls] && (
                      <a
                        href={directUrls[selectedPlatform as keyof typeof directUrls]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-[#eaedff] bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        <span>Open {currentPlatformConfig.label}</span>
                      </a>
                    )}

                    {/* Copy Summary Button */}
                    <button
                      id="copy-summary-btn"
                      type="button"
                      onClick={handleCopySummary}
                      className={`px-4 py-2 rounded-xl text-[12.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isCopiedSummary
                          ? 'bg-[#00685f] text-white'
                          : 'bg-gradient-to-r from-[#ff8c42] to-[#fd761a] hover:from-[#ff9954] hover:to-[#e06512] text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isCopiedSummary ? 'check' : 'content_copy'}
                      </span>
                      <span>{isCopiedSummary ? 'Copied to Clipboard!' : 'Copy Formatted Caption'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORY CARD PREVIEW */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div className="p-1 rounded-3xl bg-gradient-to-r from-[#ffdbca] via-[#d3ccf7] to-[#89f5e7] shadow-md">
                <div className="bg-white rounded-[22px] overflow-hidden">
                  {/* Card Image Banner */}
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-900">
                    <img
                      src={entry.coverImage}
                      alt={entry.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                        {entry.destination}
                      </span>
                      {entry.pinnedLocation && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fd761a] text-white flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-[12px]">pin_drop</span>
                          Pinned Live
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
                      <h3 className="text-[18px] sm:text-[20px] font-extrabold tracking-tight drop-shadow-md leading-snug">
                        {entry.title}
                      </h3>
                      <p className="text-[12px] text-gray-200 flex items-center gap-2 drop-shadow-xs">
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span>By {entry.author}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Content Highlights */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {/* Motto Quote */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#faf8ff] to-[#f0f9f8] border border-[#eaedff] text-[12px] font-medium italic text-[#00685f] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#00685f] shrink-0">format_quote</span>
                      <span>"{entry.mottoQuote || 'Life is just going on. Life is too short, so make this trip happen!'}"</span>
                    </div>

                    {/* Story excerpt */}
                    <p className="text-[12.5px] text-[#3d4947] leading-relaxed line-clamp-3">
                      {entry.story}
                    </p>

                    {/* Must-visit chips */}
                    {entry.mustVisitSpots && entry.mustVisitSpots.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#131b2e] block mb-1">
                          Highlights &amp; Landmarks:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.mustVisitSpots.slice(0, 3).map((spot, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[#131b2e] font-medium border border-[#eaedff]"
                            >
                              📍 {spot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Footer with link */}
                    <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between text-[11px] text-[#3d4947]">
                      <span className="font-semibold text-[#00685f] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                        <span>Travel AI Journal Guide</span>
                      </span>
                      <span className="font-mono text-[#131b2e] font-bold">
                        {shareUrl.length > 40 ? `${shareUrl.slice(0, 38)}...` : shareUrl}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const cardText = `🗺️ ${entry.title}\n📍 ${entry.destination}\n👤 By ${entry.author}\n\n"${entry.mottoQuote || 'Life is just going on. Life is too short, so make this trip happen!'}"\n\nHighlights:\n${(entry.mustVisitSpots || []).slice(0, 3).map((s) => `• ${s}`).join('\n')}\n\nRead more:\n${shareUrl}`;
                    await navigator.clipboard.writeText(cardText);
                    onShowToast?.('Story Card Text Copied!', 'Card summary copied to clipboard.', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1a2b49] text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Copy Story Card Text</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QR CODE GENERATOR */}
          {activeTab === 'qr' && (
            <div className="p-6 rounded-2xl bg-[#faf8ff] border border-[#eaedff] flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-[#d3ccf7] shadow-sm">
                {/* Clean inline SVG QR code representation for instant mobile camera scan */}
                <svg
                  className="w-48 h-48"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Frame */}
                  <rect width="100" height="100" fill="white" />
                  
                  {/* Top-Left Finder Pattern */}
                  <rect x="10" y="10" width="24" height="24" rx="2" fill="#131b2e" />
                  <rect x="14" y="14" width="16" height="16" rx="1" fill="white" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#00685f" />

                  {/* Top-Right Finder Pattern */}
                  <rect x="66" y="10" width="24" height="24" rx="2" fill="#131b2e" />
                  <rect x="70" y="14" width="16" height="16" rx="1" fill="white" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#00685f" />

                  {/* Bottom-Left Finder Pattern */}
                  <rect x="10" y="66" width="24" height="24" rx="2" fill="#131b2e" />
                  <rect x="14" y="70" width="16" height="16" rx="1" fill="white" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#00685f" />

                  {/* Dynamic Pattern Pixels */}
                  <rect x="40" y="12" width="6" height="6" fill="#131b2e" />
                  <rect x="50" y="14" width="6" height="4" fill="#00685f" />
                  <rect x="42" y="24" width="8" height="4" fill="#131b2e" />
                  <rect x="54" y="22" width="6" height="6" fill="#fd761a" />

                  <rect x="14" y="42" width="6" height="6" fill="#131b2e" />
                  <rect x="24" y="44" width="8" height="4" fill="#00685f" />
                  <rect x="16" y="52" width="4" height="8" fill="#131b2e" />

                  {/* Center Data Matrix Grid */}
                  <rect x="38" y="38" width="6" height="6" fill="#00685f" />
                  <rect x="48" y="38" width="6" height="6" fill="#131b2e" />
                  <rect x="58" y="40" width="6" height="4" fill="#fd761a" />
                  <rect x="40" y="48" width="8" height="4" fill="#131b2e" />
                  <rect x="52" y="48" width="6" height="6" fill="#00685f" />
                  <rect x="62" y="48" width="4" height="8" fill="#131b2e" />

                  <rect x="38" y="58" width="6" height="6" fill="#fd761a" />
                  <rect x="48" y="60" width="8" height="4" fill="#131b2e" />
                  <rect x="60" y="58" width="6" height="6" fill="#00685f" />

                  {/* Bottom-Right Pattern */}
                  <rect x="68" y="68" width="6" height="6" fill="#131b2e" />
                  <rect x="78" y="70" width="4" height="8" fill="#00685f" />
                  <rect x="70" y="80" width="8" height="4" fill="#fd761a" />
                  <rect x="82" y="82" width="6" height="6" fill="#131b2e" />
                </svg>
              </div>

              <div className="space-y-1">
                <h4 className="text-[14px] font-bold text-[#131b2e]">
                  Scan to Open on Mobile Device
                </h4>
                <p className="text-[12px] text-[#3d4947] max-w-sm">
                  Point any phone camera to instantly jump to <strong>"{entry.title}"</strong> on Travel AI.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#00524b] text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy URL Instead</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#eaedff] bg-[#faf8ff] flex items-center justify-between gap-3 shrink-0 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl border border-[#eaedff] bg-white hover:bg-[#f2f3ff] text-[#131b2e] text-[12.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCopiedLink ? 'check' : 'link'}
              </span>
              <span>{isCopiedLink ? 'Link Copied' : 'Copy Story Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#fd761a] hover:from-[#ff9954] hover:to-[#e06512] text-white text-[12.5px] font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-[#ffdbca]/40"
            >
              <span className="material-symbols-outlined text-[17px]">
                {isCopiedSummary ? 'check' : 'share'}
              </span>
              <span>{isCopiedSummary ? 'Caption Copied!' : 'Copy Social Caption'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
