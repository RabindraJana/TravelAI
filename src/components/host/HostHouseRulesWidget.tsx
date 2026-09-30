import React, { useState } from 'react';
import {
  getHostHouseRules,
  addHostHouseRule,
  updateHostHouseRule,
  deleteHostHouseRule,
  reorderHostHouseRules,
} from '../../utils/hostStorage';

interface HostHouseRulesWidgetProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const PRESET_RULES = [
  'Quiet hours: 10:30 PM to 6:00 AM for neighborhood tranquility',
  'Shoes off at the entrance / veranda; clean indoor footwear provided',
  'Warm cup of Bengal morning chai included at 7:30 AM',
  'Luggage drop-off allowed from 9:00 AM for train travelers',
  'Pure vegetarian cookware available upon prior notice',
  'No smoking or open flames inside the guest bedroom',
  'Travel stories and railway experiences warmly welcomed over meals',
  'Lock the front veranda gate after 10:00 PM for security',
];

export const HostHouseRulesWidget: React.FC<HostHouseRulesWidgetProps> = ({ onShowToast }) => {
  const [rules, setRules] = useState<string[]>(() => getHostHouseRules());
  const [newRuleInput, setNewRuleInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const refreshRules = () => {
    setRules(getHostHouseRules());
  };

  const handleAddRule = (textToAdd?: string) => {
    const text = (textToAdd !== undefined ? textToAdd : newRuleInput).trim();
    if (!text) return;

    if (rules.some((r) => r.toLowerCase() === text.toLowerCase())) {
      onShowToast('Rule Already Exists', 'This house rule is already on your active list.', 'warning');
      return;
    }

    const updated = addHostHouseRule(text);
    setRules(updated);
    setNewRuleInput('');
    onShowToast('House Rule Added ✨', `Added: "${text}"`, 'success');
  };

  const handleStartEdit = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditingText(currentText);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    const updated = updateHostHouseRule(index, editingText.trim());
    setRules(updated);
    setEditingIndex(null);
    setEditingText('');
    onShowToast('House Rule Updated', 'Changes saved to your living host profile.', 'success');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleDeleteRule = (index: number, ruleText: string) => {
    const updated = deleteHostHouseRule(index);
    setRules(updated);
    onShowToast('Rule Removed', `Removed rule from host profile.`, 'info');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = reorderHostHouseRules(index, index - 1);
    setRules(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === rules.length - 1) return;
    const updated = reorderHostHouseRules(index, index + 1);
    setRules(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eaedff] shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#fd761a]/10 text-[#9d4300] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </span>
            <h2 className="text-lg font-bold text-[#131b2e]">House Rules &amp; Living Guidelines</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#00685f] text-[11px] font-bold">
              {rules.length} Active Rules
            </span>
          </div>
          <p className="text-xs text-[#717b79] mt-1">
            Set clear expectations for travelers staying in your Medinipur guest room. Changes sync instantly to your public host profile.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 text-xs text-[#006947] bg-[#e2fced] px-3 py-1.5 rounded-xl self-start sm:self-auto font-medium">
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>Live Synchronized with Profile</span>
        </div>
      </div>

      {/* Add New Rule Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#131b2e] block">Add Custom House Rule</label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#717b79]">
              edit_note
            </span>
            <input
              type="text"
              placeholder="e.g. Quiet hours after 10:30 PM, Shoes off at veranda..."
              value={newRuleInput}
              onChange={(e) => setNewRuleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddRule();
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#faf8ff] text-xs text-[#131b2e] placeholder-[#717b79] border border-[#eaedff] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30"
            />
          </div>
          <button
            onClick={() => handleAddRule()}
            disabled={!newRuleInput.trim()}
            className="px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      {/* Preset Suggestions Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-[#717b79] uppercase tracking-wider block">
          One-Click Recommended Bengal Host Presets
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_RULES.filter((preset) => !rules.includes(preset)).slice(0, 5).map((preset) => (
            <button
              key={preset}
              onClick={() => handleAddRule(preset)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3d4947] hover:text-[#00685f] transition-all flex items-center gap-1 cursor-pointer border border-[#eaedff]"
              title="Click to add this rule"
            >
              <span className="material-symbols-outlined text-[13px] text-[#00685f]">add_circle</span>
              <span className="truncate max-w-[280px]">{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Rules List */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#131b2e]">
          <span>Current Active Rules ({rules.length})</span>
          <span className="text-[#717b79] font-normal text-[11px]">Use arrows to reorder priority</span>
        </div>

        {rules.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-[#faf8ff] border border-dashed border-[#eaedff]">
            <p className="text-xs text-[#717b79]">No house rules set yet. Add one above to guide your travelers!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule, idx) => {
              const isEditing = editingIndex === idx;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isEditing ? 'bg-[#fffaf5] border-[#fd761a]' : 'bg-[#faf8ff] border-[#eaedff] hover:border-[#00685f]/30'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 p-1.5 rounded-lg bg-white border border-[#eaedff] text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(idx)}
                        className="px-3 py-1.5 rounded-lg bg-[#00685f] text-white text-xs font-bold hover:bg-[#00534c] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1.5 rounded-lg bg-[#f2f3ff] text-[#717b79] text-xs hover:bg-[#eaedff] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-[#00685f]/10 text-[#00685f] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-[#131b2e] font-medium leading-relaxed">{rule}</p>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                        {/* Reorder Buttons */}
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-[#717b79] hover:text-[#131b2e] hover:bg-[#f2f3ff] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          title="Move up"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === rules.length - 1}
                          className="p-1 rounded-md text-[#717b79] hover:text-[#131b2e] hover:bg-[#f2f3ff] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          title="Move down"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                        </button>

                        <div className="w-[1px] h-4 bg-[#eaedff] mx-1" />

                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEdit(idx, rule)}
                          className="p-1 rounded-md text-[#717b79] hover:text-[#00685f] hover:bg-[#00685f]/10 cursor-pointer"
                          title="Edit rule"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteRule(idx, rule)}
                          className="p-1 rounded-md text-[#717b79] hover:text-[#d32f2f] hover:bg-[#fff0f0] cursor-pointer"
                          title="Delete rule"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guest Perspective Preview Box */}
      <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#00685f]">
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          <span>How Travelers See Your Homestay Guidelines:</span>
        </div>
        <p className="text-[11px] text-[#717b79]">
          Travelers must review and acknowledge these guidelines prior to requesting their stay. Your clear guidelines have contributed to your 5.0 ★ rating across all 14 hosting journeys.
        </p>
      </div>
    </div>
  );
};
