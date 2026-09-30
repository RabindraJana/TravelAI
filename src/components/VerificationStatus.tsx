import React from 'react';
import { VerificationStatusType } from '../types';

interface VerificationStatusProps {
  status?: VerificationStatusType;
  verifiedAt?: string;
  badgeTitle?: string;
  idType?: string;
  onGetVerified?: () => void;
  onOpenAdminReview?: () => void;
  showAdminAction?: boolean;
  variant?: 'compact' | 'full' | 'inline' | 'banner';
  className?: string;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status = 'unverified',
  verifiedAt,
  badgeTitle = 'Govt ID Verified Host & Explorer',
  idType,
  onGetVerified,
  onOpenAdminReview,
  showAdminAction = false,
  variant = 'compact',
  className = '',
}) => {
  // 1. Verified User state: Badge icon with registration/verification date
  if (status === 'verified') {
    if (variant === 'compact') {
      return (
        <div
          className={`inline-flex items-center gap-2 bg-[#e2fced] text-[#006947] border border-[#a4f2cb] px-3 py-1.5 rounded-xl ${className}`}
          title={`Verified by Government ID on ${verifiedAt || 'Official Record'}`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#006947]">verified</span>
          <div className="flex flex-col text-left">
            <span className="text-[12px] font-bold tracking-tight leading-tight">
              {badgeTitle}
            </span>
            {verifiedAt && (
              <span className="text-[10px] text-[#006947]/80 leading-tight">
                Verified on {verifiedAt}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (variant === 'inline') {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold text-[#006947] bg-[#e2fced] px-2 py-0.5 rounded-full border border-[#a4f2cb] ${className}`}
        >
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>Verified • {verifiedAt || 'Govt ID'}</span>
        </span>
      );
    }

    // Full / Banner variant for rich profile headers & settings
    return (
      <div
        className={`bg-gradient-to-r from-[#e2fced]/90 via-[#f0fdf4] to-white border border-[#a4f2cb] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006947] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-[14px] font-bold text-[#131b2e]">{badgeTitle}</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#006947] text-white px-2 py-0.5 rounded-full">
                Authentic
              </span>
            </div>
            <p className="text-[12px] text-[#3d4947] mt-0.5">
              Government credentials inspected &amp; approved by platform administrator. Safe for local hosting &amp; travel meetups.
            </p>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-[#006947] font-semibold flex-wrap">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                Registration Date: {verifiedAt || 'Verified Active'}
              </span>
              {idType && (
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">badge</span>
                  Document: {idType.toUpperCase()}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[#00685f]">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                Sensitive ID masked &amp; private
              </span>
            </div>
          </div>
        </div>

        {showAdminAction && onOpenAdminReview && (
          <button
            type="button"
            onClick={onOpenAdminReview}
            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white border border-[#eaedff] text-[11px] font-bold text-[#131b2e] hover:bg-[#f2f3ff] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[14px] text-[#00685f]">admin_panel_settings</span>
            <span>Admin Review Desk</span>
          </button>
        )}
      </div>
    );
  }

  // 2. Pending Admin Review state
  if (status === 'pending') {
    return (
      <div
        className={`bg-[#fff7ed] border border-[#ffedd5] rounded-2xl p-3.5 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fd761a]/15 text-[#9d4300] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px] animate-pulse">hourglass_top</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#9d4300]">Govt ID Verification Pending</span>
              <span className="text-[10px] font-bold bg-[#ffedd5] text-[#9d4300] px-2 py-0.5 rounded-full">
                Under Admin Review
              </span>
            </div>
            <p className="text-[11px] text-[#3d4947] mt-0.5">
              Your government ID was securely transmitted to the Admin. Verification badge will activate upon approval.
            </p>
          </div>
        </div>

        {showAdminAction && onOpenAdminReview && (
          <button
            type="button"
            onClick={onOpenAdminReview}
            className="px-3 py-1.5 rounded-xl bg-[#fd761a] text-white text-[11px] font-bold hover:bg-[#e05e07] transition-colors cursor-pointer shrink-0"
          >
            Review as Admin
          </button>
        )}
      </div>
    );
  }

  // 3. Rejected state with option to re-apply
  if (status === 'rejected') {
    return (
      <div
        className={`bg-[#fef2f2] border border-[#fee2e2] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ef4444]/15 text-[#b91c1c] flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">error_outline</span>
          </div>
          <div>
            <span className="text-[13px] font-bold text-[#b91c1c]">Verification Incomplete</span>
            <p className="text-[11px] text-[#3d4947] mt-0.5">
              The submitted document could not be authenticated. Please submit a clearer image or valid government ID.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGetVerified}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#b91c1c] text-white text-[12px] font-bold hover:bg-[#991b1b] transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          <span>Re-apply for Badge</span>
        </button>
      </div>
    );
  }

  // 4. Default Unverified User state: displays "Get Verified" button
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onGetVerified}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold transition-all shadow-xs hover:shadow-md cursor-pointer ${className}`}
        title="Submit government ID to get verified by admin"
      >
        <span className="material-symbols-outlined text-[16px]">verified_user</span>
        <span>Get Verified</span>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onGetVerified}
        className={`inline-flex items-center gap-1 text-[11px] font-bold text-[#9d4300] bg-[#ffdbca]/60 hover:bg-[#ffdbca] px-2.5 py-1 rounded-full transition-colors cursor-pointer ${className}`}
      >
        <span className="material-symbols-outlined text-[14px]">shield</span>
        <span>Get Verified</span>
      </button>
    );
  }

  // Full / Banner variant for Unverified user
  return (
    <div
      className={`bg-[#faf8ff] border border-[#eaedff] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">shield_person</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-[14px] font-bold text-[#131b2e]">Verify Your Traveler Profile</h4>
            <span className="text-[10px] font-bold bg-[#eaedff] text-[#3d4947] px-2 py-0.5 rounded-full">
              Community Trust
            </span>
          </div>
          <p className="text-[12px] text-[#3d4947] mt-0.5 leading-relaxed">
            Submit your Government ID (Aadhaar, Passport, or Voter ID) directly to the Admin. Sensitive details remain private and are never shown publicly.
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#00685f] font-semibold flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">home</span>
              Enables Living State Host status
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">handshake</span>
              Builds genuine traveler trust
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onGetVerified}
        className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[13px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">verified_user</span>
        <span>Get Verified</span>
      </button>
    </div>
  );
};
