import React, { useState } from 'react';
import {
  PaymentTransaction,
  getPaymentTransactions,
  reviewRefundRequest,
  getCurrentSessionUser,
} from '../services/adminStore';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  X,
  AlertTriangle,
  Building,
  User,
} from 'lucide-react';

interface PrincipalQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionsUpdated?: () => void;
}

export const PrincipalQueueModal: React.FC<PrincipalQueueModalProps> = ({
  isOpen,
  onClose,
  onTransactionsUpdated,
}) => {
  const sessionUser = getCurrentSessionUser();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getPaymentTransactions());
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingRequests = transactions.filter((t) => t.status === 'Refund Requested');

  const handleReview = (action: 'Approve' | 'Reject') => {
    if (!selectedTx) return;

    const reviewer = `${sessionUser?.name || 'Headteacher'} (Principal)`;
    const updated = reviewRefundRequest(selectedTx.id, action, reviewer, reviewNote.trim());
    setTransactions(updated);
    setActionSuccessMsg(
      `Transaction ${selectedTx.receiptNumber} (${selectedTx.amount.toLocaleString()} RWF) has been ${
        action === 'Approve' ? 'APPROVED for refund' : 'DECLINED'
      } and saved to database.`
    );
    setSelectedTx(null);
    setReviewNote('');
    if (onTransactionsUpdated) onTransactionsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block">
                Principal & Headmaster Queue
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display">
                Pending Refund Authorizations ({pendingRequests.length})
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <h4 className="text-sm font-bold text-slate-700">Principal Queue is Clean</h4>
            <p className="text-xs">There are no pending refund requests from the Finance Officer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              The following fee refund requests were routed by the Finance Officer and require Principal approval prior to bank or cash disbursement:
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {pendingRequests.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-4 transition-all ${
                    selectedTx?.id === tx.id ? 'bg-amber-50/70 border-l-4 border-l-amber-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{tx.receiptNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                          Pending Approval
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5">
                        {tx.studentName} ({tx.regNumber} • {tx.gradeCode})
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 bg-white p-2.5 rounded-xl border border-slate-200">
                        <strong>Reason:</strong> {tx.refundReason}
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                        <span>Requested by: {tx.refundRequestedBy}</span>
                        <span>•</span>
                        <span>Date: {tx.refundRequestedAt ? new Date(tx.refundRequestedAt).toLocaleDateString() : '-'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black font-mono text-rose-700 block">
                        {tx.amount.toLocaleString()} RWF
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">{tx.paymentMethod}</span>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Review & Authorize
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedTx?.id === tx.id && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-3 bg-white p-3.5 rounded-xl">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Principal Authorization Notes (Audit Trail)
                        </label>
                        <input
                          type="text"
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="e.g. Approved per parent bank slip verification, processed back to BK account..."
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTx(null)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview('Reject')}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Decline Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview('Approve')}
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorize & Approve Refund</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Close Queue
          </button>
        </div>
      </div>
    </div>
  );
};
