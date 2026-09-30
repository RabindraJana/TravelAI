import React, { useState } from 'react';
import { GovernmentIdType } from '../types';
import { submitVerificationApplication } from '../utils/profileStorage';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  defaultLivingState?: string;
  defaultLivingCity?: string;
  onSubmitted: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  defaultLivingState = 'West Bengal',
  defaultLivingCity = 'Medinipur / Kharagpur',
  onSubmitted,
  onShowToast,
}) => {
  const [legalName, setLegalName] = useState(userName || '');
  const [idType, setIdType] = useState<GovernmentIdType>('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [livingState, setLivingState] = useState(defaultLivingState);
  const [livingCity, setLivingCity] = useState(defaultLivingCity);
  const [documentPreview, setDocumentPreview] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  );
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      onShowToast('Missing ID Number', 'Please enter your government document number.', 'warning');
      return;
    }
    if (!hasAgreed) {
      onShowToast('Declaration Required', 'Please check the confidentiality and accuracy declaration.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitVerificationApplication({
        userId,
        userName,
        legalName: legalName.trim(),
        idType,
        rawIdNumber: idNumber.trim(),
        livingState: livingState.trim(),
        livingCity: livingCity.trim(),
        documentFrontUrl: documentPreview,
      });

      setIsSubmitting(false);
      onShowToast(
        'Application Submitted',
        'Your government ID has been securely transmitted to the Admin. It will never be displayed publicly.',
        'success'
      );
      onSubmitted();
      onClose();
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocumentPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#eaedff] shadow-2xl overflow-hidden my-8 animate-fadeIn flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eaedff] bg-gradient-to-r from-[#00685f]/10 via-[#faf8ff] to-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#131b2e]">Get Verified Traveler Badge</h3>
              <p className="text-[12px] text-[#3d4947]">Authentic identity verification for safe hosting &amp; travel trust</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#3d4947] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Privacy Highlight Banner */}
        <div className="bg-[#eef2ff] border-b border-[#c7d2fe] px-6 py-3 flex items-start gap-2.5 text-[#1e1b4b]">
          <span className="material-symbols-outlined text-[18px] text-[#4338ca] shrink-0 mt-0.5">lock</span>
          <div className="text-[11px] leading-relaxed">
            <strong className="font-bold text-[#312e81]">Strict Privacy Guarantee: </strong>
            Your sensitive government ID document and identification number are stored confidentially for administrator verification only.
            <strong className="underline decoration-[#4338ca] ml-1">They are NEVER displayed publicly on your profile.</strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
              Legal Full Name (as printed on your Government ID)
            </label>
            <input
              type="text"
              required
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="e.g. Rabindra Nath Jana"
              className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Government ID Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as GovernmentIdType)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40 cursor-pointer"
              >
                <option value="aadhaar">Aadhaar Card (India)</option>
                <option value="passport">Passport (Indian / International)</option>
                <option value="voter_id">Voter ID Card (EPIC)</option>
                <option value="driving_license">Driver's License</option>
                <option value="national_id">National ID Card</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                Document Number (Auto-masked for safety)
              </label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={idType === 'aadhaar' ? 'e.g. 5412 8721 4829' : 'e.g. T4819284'}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40 font-mono"
              />
              <span className="text-[10px] text-[#3d4947] mt-0.5 block">
                Stored as masked <span className="font-bold text-[#00685f]">XXXX-XXXX-****</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Living State / Region</label>
              <input
                type="text"
                required
                value={livingState}
                onChange={(e) => setLivingState(e.target.value)}
                placeholder="e.g. West Bengal"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#131b2e] block mb-1">Living City / Corridor</label>
              <input
                type="text"
                required
                value={livingCity}
                onChange={(e) => setLivingCity(e.target.value)}
                placeholder="e.g. Medinipur / Kharagpur"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-[13px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40"
              />
            </div>
          </div>

          {/* Document Upload Area */}
          <div>
            <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
              Upload Front of Government ID Document
            </label>
            <div className="border-2 border-dashed border-[#eaedff] hover:border-[#00685f]/40 transition-colors rounded-2xl p-4 text-center bg-[#faf8ff]">
              {documentPreview ? (
                <div className="relative inline-block">
                  <img
                    src={documentPreview}
                    alt="Document preview"
                    className="max-h-36 rounded-xl mx-auto shadow-xs border border-[#eaedff] object-cover"
                  />
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <label className="text-[11px] font-semibold text-[#00685f] hover:underline cursor-pointer">
                      <span>Replace Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <span className="material-symbols-outlined text-[32px] text-[#00685f]">upload_file</span>
                  <p className="text-[12px] font-semibold text-[#131b2e] mt-1">Click or drag &amp; drop to upload ID image</p>
                  <p className="text-[10px] text-[#3d4947]">JPEG, PNG, or PDF screenshot (Max 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Declaration Checkbox */}
          <div className="p-3.5 rounded-2xl bg-[#f2f3ff] flex items-start gap-2.5">
            <input
              id="agree-declaration"
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded text-[#00685f] focus:ring-[#00685f] cursor-pointer"
            />
            <label htmlFor="agree-declaration" className="text-[11px] text-[#3d4947] leading-relaxed cursor-pointer">
              I certify that this government-issued identification document is genuine and belongs to me. I acknowledge that this sensitive file is solely reviewed by the Administrator to issue my <strong>Govt ID Verified Badge</strong> and is never made public.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold text-[#3d4947] hover:text-[#131b2e] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasAgreed}
              className={`px-5 py-2.5 rounded-xl font-bold text-[13px] text-white flex items-center gap-1.5 transition-all shadow-sm ${
                isSubmitting || !hasAgreed
                  ? 'bg-[#3d4947]/40 cursor-not-allowed'
                  : 'bg-[#00685f] hover:bg-[#00534c] cursor-pointer shadow-md'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit to Admin for Verification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
