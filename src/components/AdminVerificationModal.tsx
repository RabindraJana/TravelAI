import React, { useState } from 'react';
import { VerificationApplication } from '../types';
import {
  getVerificationApplications,
  approveVerification,
  rejectVerification,
  resetVerificationForTesting,
} from '../utils/profileStorage';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  onShowToast,
}) => {
  const [applications, setApplications] = useState<VerificationApplication[]>(() =>
    getVerificationApplications()
  );
  const [selectedApp, setSelectedApp] = useState<VerificationApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  if (!isOpen) return null;

  const reloadData = () => {
    const list = getVerificationApplications();
    setApplications([...list]);
    onUpdated();
  };

  const handleApprove = (app: VerificationApplication) => {
    approveVerification(
      app.id,
      adminNotes || `Govt ${app.idType.toUpperCase()} document inspected and authenticated by Admin. Verified host status granted.`
    );
    onShowToast(
      'Account Verified!',
      `${app.userName} has been granted the official Govt ID Verified Badge.`,
      'success'
    );
    setSelectedApp(null);
    reloadData();
  };

  const handleReject = (app: VerificationApplication) => {
    const reason = adminNotes || 'Document image was unclear or identity information could not be verified.';
    rejectVerification(app.id, reason);
    onShowToast('Verification Rejected', `Status updated for ${app.userName}.`, 'info');
    setSelectedApp(null);
    reloadData();
  };

  const handleTestReset = () => {
    resetVerificationForTesting();
    onShowToast('Status Reset', 'Your profile status has been reset to Unverified for demonstration.', 'info');
    reloadData();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#eaedff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eaedff] bg-[#131b2e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00685f] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold">Admin Verification Desk</h3>
                <span className="text-[10px] font-bold bg-[#00685f] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Access
                </span>
              </div>
              <p className="text-[12px] text-[#cbd5e1]">
                Review sensitive government ID submissions safely and award verified badges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#faf8ff]">
          {/* Quick test control banner */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#006947]">tune</span>
              <div>
                <h4 className="text-[13px] font-bold text-[#131b2e]">Developer / Admin Simulation Controls</h4>
                <p className="text-[11px] text-[#3d4947]">
                  Toggle your own account state to test the 'Get Verified' button and approved badge flow.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestReset}
                className="px-3 py-1.5 bg-white border border-[#bbf7d0] text-[#9d4300] hover:bg-[#fff7ed] rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
              >
                Reset to Unverified
              </button>
            </div>
          </div>

          {/* List of Applications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[14px] font-bold text-[#131b2e] flex items-center gap-2">
                <span>Verification Applications Queue</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#00685f]/10 text-[#00685f]">
                  {applications.length} submissions
                </span>
              </h4>
              <span className="text-[11px] text-[#3d4947]">
                Encrypted admin queue • Confidential
              </span>
            </div>

            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-[#eaedff] p-4 shadow-xs hover:border-[#00685f]/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[22px]">badge</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-[14px] font-bold text-[#131b2e]">{app.legalName}</h5>
                          <span className="text-[11px] text-[#3d4947]">(@{app.userName})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              app.status === 'verified'
                                ? 'bg-[#e2fced] text-[#006947]'
                                : app.status === 'pending'
                                ? 'bg-[#ffedd5] text-[#9d4300]'
                                : 'bg-[#fee2e2] text-[#b91c1c]'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[12px] text-[#3d4947]">
                          <div>
                            <span className="font-semibold text-[#131b2e]">Document:</span>{' '}
                            <span className="uppercase font-bold text-[#00685f]">{app.idType}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#131b2e]">Masked Number:</span>{' '}
                            <span className="font-mono text-[#131b2e]">{app.maskedIdNumber}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#131b2e]">Living State:</span>{' '}
                            <span>{app.livingState}, {app.livingCity}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#131b2e]">Submitted:</span>{' '}
                            <span>{app.submittedAt}</span>
                          </div>
                        </div>

                        {app.adminNotes && (
                          <div className="mt-2 text-[11px] p-2 rounded-xl bg-[#f2f3ff] text-[#3d4947] border border-[#eaedff]">
                            <strong className="text-[#131b2e]">Admin Note:</strong> {app.adminNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      {app.documentFrontUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[12px] font-semibold text-[#131b2e] transition-colors cursor-pointer flex items-center gap-1 w-full justify-center"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Inspect Doc</span>
                        </button>
                      )}

                      {app.status !== 'verified' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 w-full justify-center"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Approve Badge</span>
                        </button>
                      )}

                      {app.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleReject(app)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#fee2e2] text-[#b91c1c] hover:bg-[#fef2f2] text-[12px] font-semibold transition-colors cursor-pointer w-full justify-center"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Inspection Sub-modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
                <div>
                  <h4 className="font-bold text-[16px] text-[#131b2e]">
                    Government ID Inspection: {selectedApp.legalName}
                  </h4>
                  <p className="text-[12px] text-[#3d4947]">
                    Document: {selectedApp.idType.toUpperCase()} • Masked: {selectedApp.maskedIdNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1 rounded-lg text-[#3d4947] hover:bg-[#f2f3ff]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {selectedApp.documentFrontUrl && (
                <div className="border border-[#eaedff] rounded-2xl overflow-hidden bg-black/5 p-2">
                  <img
                    src={selectedApp.documentFrontUrl}
                    alt="Submitted Government ID"
                    className="w-full max-h-72 object-contain rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="text-[12px] font-bold text-[#131b2e] block mb-1">
                  Admin Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Government Aadhaar document verified with living address in West Bengal."
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-[12px] text-[#131b2e] outline-none border border-transparent focus:border-[#00685f]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => handleReject(selectedApp)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#fee2e2] text-[#b91c1c] text-[12px] font-bold hover:bg-[#fef2f2] cursor-pointer"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedApp)}
                  className="px-5 py-2 rounded-xl bg-[#00685f] hover:bg-[#00534c] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Approve &amp; Issue Verified Badge</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#eaedff] bg-white flex items-center justify-between">
          <span className="text-[11px] text-[#3d4947]">
            Travel AI Identity &amp; Community Safety Infrastructure
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#131b2e] text-white text-[12px] font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Close Desk
          </button>
        </div>
      </div>
    </div>
  );
};
