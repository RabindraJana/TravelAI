import React, { useState } from 'react';
import { FullUserProfile } from '../types';
import { saveStoredUserProfile } from '../utils/profileStorage';

interface EditHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FullUserProfile;
  onSave: (updated: FullUserProfile) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const EditHostModal: React.FC<EditHostModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onShowToast,
}) => {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [livingCity, setLivingCity] = useState(profile.livingCity);
  const [livingState, setLivingState] = useState(profile.livingState);

  // Hosting offer
  const [canHost, setCanHost] = useState(profile.hosting.canHost);
  const [homeType, setHomeType] = useState(profile.hosting.homeType);
  const [maxGuests, setMaxGuests] = useState(profile.hosting.maxGuests);
  const [houseRules, setHouseRules] = useState<string[]>([...profile.hosting.houseRules]);
  const [newRule, setNewRule] = useState('');
  const [canGuideWalks, setCanGuideWalks] = useState(profile.hosting.canGuideWalks);
  const [canHelpRailways, setCanHelpRailways] = useState(profile.hosting.canHelpRailways);
  const [languagesStr, setLanguagesStr] = useState(profile.hosting.languages.join(', '));
  const [bioIntro, setBioIntro] = useState(profile.hosting.bioIntro);

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setHouseRules([...houseRules, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setHouseRules(houseRules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const languages = languagesStr
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const updated: FullUserProfile = {
      ...profile,
      name,
      bio,
      livingCity,
      livingState,
      hosting: {
        ...profile.hosting,
        canHost,
        homeType,
        maxGuests: Number(maxGuests) || 2,
        houseRules,
        canGuideWalks,
        canHelpRailways,
        languages: languages.length > 0 ? languages : profile.hosting.languages,
        bioIntro,
      },
    };

    saveStoredUserProfile(updated);
    onSave(updated);
    onShowToast(
      'Host Information Saved',
      'Your living state homestay rules, availability, and profile were updated.',
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#eaedff] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eaedff] bg-[#faf8ff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">edit_note</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#131b2e]">Host Management &amp; Settings</h2>
              <p className="text-[12px] text-[#3d4947]">
                Admin control: customize your living state homestay, house rules, and hospitality details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Identity Section */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#00685f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>Host Identity &amp; Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[#3d4947] block mb-1">
                  Host Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#f2f3ff] focus:bg-white rounded-xl text-[13px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#3d4947] block mb-1">
                  Living City / Region
                </label>
                <input
                  type="text"
                  required
                  value={livingCity}
                  onChange={(e) => setLivingCity(e.target.value)}
                  placeholder="e.g. Medinipur / Kharagpur"
                  className="w-full h-10 px-3.5 bg-[#f2f3ff] focus:bg-white rounded-xl text-[13px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3d4947] block mb-1">
                Host Bio &amp; Philosophy
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-[#f2f3ff] focus:bg-white rounded-xl text-[13px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all leading-relaxed"
                placeholder="Share your travel philosophy and message to visitors..."
              />
            </div>
          </div>

          <hr className="border-[#eaedff]" />

          {/* Homestay Offering Section */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#00685f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Living State Homestay Details</span>
            </h3>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf8ff] border border-[#eaedff]">
              <div>
                <div className="text-[13px] font-bold text-[#131b2e]">Accepting Travelers</div>
                <div className="text-[11px] text-[#717b79]">
                  Show your home as available for guest stays in West Bengal
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCanHost(!canHost)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  canHost ? 'bg-[#00685f]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    canHost ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-[#3d4947] block mb-1">
                  Accommodation Space Type
                </label>
                <input
                  type="text"
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value)}
                  placeholder="e.g. Private Guest Room & Study"
                  className="w-full h-10 px-3.5 bg-[#f2f3ff] focus:bg-white rounded-xl text-[13px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#3d4947] block mb-1">
                  Maximum Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(Number(e.target.value))}
                  className="w-full h-10 px-3.5 bg-[#f2f3ff] focus:bg-white rounded-xl text-[13px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3d4947] block mb-1">
                Homestay Intro Message to Travelers
              </label>
              <textarea
                rows={2}
                value={bioIntro}
                onChange={(e) => setBioIntro(e.target.value)}
                placeholder="Welcome message describing your neighborhood and home..."
                className="w-full p-3 bg-[#f2f3ff] focus:bg-white rounded-xl text-[13px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all"
              />
            </div>
          </div>

          <hr className="border-[#eaedff]" />

          {/* House Rules Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#00685f] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">rule</span>
                <span>House Rules &amp; Neighbor Respect</span>
              </h3>
              <span className="text-[11px] text-[#717b79]">{houseRules.length} rules active</span>
            </div>

            <div className="space-y-2">
              {houseRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff]"
                >
                  <div className="flex items-center gap-2 text-[12px] text-[#131b2e]">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">check_circle</span>
                    <span>{rule}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="p-1 rounded-lg text-[#717b79] hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                    title="Remove rule"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add new rule */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                placeholder="Add a new house guideline (e.g. Quiet hours after 10 PM)..."
                className="flex-1 h-9 px-3 bg-[#f2f3ff] focus:bg-white rounded-xl text-[12px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3.5 h-9 rounded-xl bg-[#00685f] text-white text-[12px] font-bold hover:bg-[#00534c] transition-colors cursor-pointer shrink-0"
              >
                + Add Rule
              </button>
            </div>
          </div>

          <hr className="border-[#eaedff]" />

          {/* Hospitality Offerings */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#00685f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">local_cafe</span>
              <span>Complimentary Traveler Support</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canGuideWalks}
                  onChange={(e) => setCanGuideWalks(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#00685f] rounded cursor-pointer"
                />
                <div>
                  <div className="text-[12px] font-bold text-[#131b2e]">Chai &amp; Heritage Walks</div>
                  <div className="text-[11px] text-[#717b79]">
                    Offer morning tea and heritage temple walk in Midnapore
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#faf8ff] border border-[#eaedff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canHelpRailways}
                  onChange={(e) => setCanHelpRailways(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#00685f] rounded cursor-pointer"
                />
                <div>
                  <div className="text-[12px] font-bold text-[#131b2e]">Railway &amp; Station Guide</div>
                  <div className="text-[11px] text-[#717b79]">
                    Kharagpur Jn platform transit and connecting train advice
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#3d4947] block mb-1">
                Languages Spoken (comma-separated)
              </label>
              <input
                type="text"
                value={languagesStr}
                onChange={(e) => setLanguagesStr(e.target.value)}
                placeholder="e.g. Bengali (বাংলা), Hindi (हिंदी), English"
                className="w-full h-10 px-3.5 bg-[#f2f3ff] focus:bg-white rounded-xl text-[13px] text-[#131b2e] border border-transparent focus:border-[#00685f] outline-none transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#eaedff] text-[#3d4947] font-semibold text-[13px] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white font-bold text-[13px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Host Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
