import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'check_circle';
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'warning':
        return 'border-[#ffdbca] bg-white text-[#9d4300] shadow-md';
      case 'info':
        return 'border-[#eaedff] bg-white text-[#00685f] shadow-md';
      default:
        return 'border-[#b2f2d9] bg-white text-[#006947] shadow-md';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${getColorClasses()} transition-all duration-300 animate-fadeIn`}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#131b2e] leading-snug">{toast.title}</p>
        {toast.message && <p className="text-[12px] text-[#3d4947] mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#bcc9c6] hover:text-[#131b2e] p-0.5 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
