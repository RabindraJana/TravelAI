import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<UserPreferences>(preferences);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data'>('profile');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(formData);
    onShowToast('Settings Saved', 'Your travel preferences and profile were successfully updated.', 'success');
    onClose();
  };

  const handleExportData = () => {
    try {
      const data = {
        preferences: formData,
        savedGoals: JSON.parse(localStorage.getItem('travel_ai_2027_goals') || '[]'),
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onShowToast('Backup Exported', 'Your travel data has been downloaded as a JSON file.', 'info');
    } catch {
      onShowToast('Export Error', 'Unable to generate backup file.', 'warning');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all saved travel goals and preferences back to fresh defaults?')) {
      localStorage.removeItem('travel_ai_2027_goals');
      localStorage.removeItem('travel_ai_preferences');
      onShowToast('Reset Complete', 'Default itineraries and goals restored.', 'info');
      onClose();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#eaedff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eaedff] flex items-center justify-between bg-[#faf8ff]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#00685f]/10 text-[#00685f]">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </span>
            <div>
              <h3 className="text-[17px] font-bold text-[#131b2e]">Traveler Settings &amp; Preferences</h3>
              <p className="text-[12px] text-[#3d4947]">Configure your AI co-pilot, currency, and travel defaults</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#eaedff] px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-[13px] font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'border-[#00685f] text-[#00685f]'
                : 'border-transparent text-[#3d4947] hover:text-[#131b2e]'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3 text-[13px] font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'preferences'
                ? 'border-[#00685f] text-[#00685f]'
                : 'border-transparent text-[#3d4947] hover:text-[#131b2e]'
            }`}
          >
            Travel Preferences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 text-[13px] font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'data'
                ? 'border-[#00685f] text-[#00685f]'
                : 'border-transparent text-[#3d4947] hover:text-[#131b2e]'
            }`}
          >
            Data &amp; Privacy
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#f2f3ff]">
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#00685f]/30"
                />
                <div>
                  <h4 className="text-[14px] font-bold text-[#131b2e]">{formData.name}</h4>
                  <p className="text-[12px] text-[#3d4947]">Elite Explorer • Level 7 Traveler</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006947] mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">verified</span> Verified Traveler
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Home / Starting City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi, India"
                  value={formData.homeCity}
                  onChange={(e) => setFormData({ ...formData, homeCity: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30"
                />
                <span className="text-[11px] text-[#3d4947] mt-1 block">
                  Used as the default departure city for route intelligence and flight calculations.
                </span>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Display Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30 cursor-pointer"
                >
                  <option value="₹ INR">₹ Indian Rupee (INR)</option>
                  <option value="$ USD">$ US Dollar (USD)</option>
                  <option value="€ EUR">€ Euro (EUR)</option>
                  <option value="£ GBP">£ British Pound (GBP)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Travel Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced Explorer', desc: 'Mix of comfort & culture' },
                    { id: 'budget', label: 'Budget Backpacker', desc: 'Hostels, local transit, street food' },
                    { id: 'luxury', label: 'Luxury & Heritage', desc: 'Boutique palaces & private transit' },
                    { id: 'adventure', label: 'High Adventure', desc: 'Treks, wildlife & outdoor expeditions' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, travelStyle: style.id as any })}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        formData.travelStyle === style.id
                          ? 'border-[#00685f] bg-[#00685f]/5 text-[#00685f]'
                          : 'border-[#eaedff] bg-white text-[#3d4947] hover:bg-[#f2f3ff]'
                      }`}
                    >
                      <span className="text-[12px] font-bold block">{style.label}</span>
                      <span className="text-[11px] text-[#3d4947] mt-0.5 block">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Itinerary Pace</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'relaxed', label: 'Relaxed (1-2 spots/day)' },
                    { id: 'moderate', label: 'Moderate (3-4 spots/day)' },
                    { id: 'fast', label: 'Action-Packed (5+ spots/day)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, pace: p.id as any })}
                      className={`p-2.5 rounded-xl text-center text-[12px] font-semibold border transition-all cursor-pointer ${
                        formData.pace === p.id
                          ? 'border-[#00685f] bg-[#00685f] text-white'
                          : 'border-[#eaedff] bg-[#f2f3ff] text-[#3d4947] hover:bg-[#e2e7ff]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Dietary Preferences</label>
                <select
                  value={formData.dietary}
                  onChange={(e) => setFormData({ ...formData, dietary: e.target.value as any })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/30 cursor-pointer"
                >
                  <option value="all">All / No Restrictions</option>
                  <option value="veg">Vegetarian (Pure Veg options prioritized)</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal Certified</option>
                  <option value="jain">Jain / No onion &amp; garlic</option>
                </select>
                <span className="text-[11px] text-[#3d4947] mt-1 block">
                  AI food guides and street-vendor recommendations will tailor to this dietary profile.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] space-y-2">
                <h4 className="text-[13px] font-bold text-[#131b2e]">Export &amp; Offline Portability</h4>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  Download a JSON copy of your custom travel resolutions, fund balances, and personalized trip planner records.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2 bg-white hover:bg-[#eaedff] text-[#00685f] border border-[#eaedff] rounded-xl text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export Travel Data (.json)</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 space-y-2">
                <h4 className="text-[13px] font-bold text-[#ba1a1a]">Clear Local Storage &amp; Reset</h4>
                <p className="text-[12px] text-[#3d4947] leading-relaxed">
                  Reset custom milestones, savings goals, and restore original verified expedition corridors.
                </p>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Reset All Local Data</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#eaedff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold text-[#3d4947] hover:bg-[#f2f3ff] rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
