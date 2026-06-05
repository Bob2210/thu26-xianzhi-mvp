'use client';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border-2 border-purple-100">
        <div className="text-center mb-3">
          <span className="text-4xl">🌸</span>
        </div>
        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center leading-relaxed">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? '处理中…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
