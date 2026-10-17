import React, { useState, useMemo } from 'react';
import {
  PaymentTransaction,
  EnrolledStudent,
  getPaymentTransactions,
  recordPaymentTransaction,
  requestTransactionRefund,
  getCurrentSessionUser,
} from '../services/adminStore';
import { ACADEMIC_GRADES, SCHOOL_INFO } from '../data/schoolData';
import {
  DollarSign,
  Search,
  Plus,
  FileText,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Filter,
  ArrowRight,
  ShieldAlert,
  Users,
  RotateCcw,
  Sparkles,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface FinancePortalProps {
  students: EnrolledStudent[];
  onTransactionsUpdated?: () => void;
}

export const FinancePortal: React.FC<FinancePortalProps> = ({ students, onTransactionsUpdated }) => {
  const sessionUser = getCurrentSessionUser();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getPaymentTransactions());
  const [activeSubTab, setActiveSubTab] = useState<'billing' | 'ledger' | 'refunds'>('billing');

  // Search & Selection for Billing Form
  const [learnerSearch, setLearnerSearch] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState<EnrolledStudent | null>(
    students.length > 0 ? students[0] : null
  );

  // Billing Form Fields
  const [paymentType, setPaymentType] = useState<PaymentTransaction['paymentType']>('Tuition Fee');
  const [amount, setAmount] = useState<number>(45000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('Bank Deposit (BK)');
  const [bankSlipRef, setBankSlipRef] = useState('');
  const [term, setTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const [academicYear, setAcademicYear] = useState('2026');
  const [successReceipt, setSuccessReceipt] = useState<PaymentTransaction | null>(null);

  // Ledger Filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerGradeFilter, setLedgerGradeFilter] = useState('ALL');
  const [ledgerMethodFilter, setLedgerMethodFilter] = useState('ALL');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('ALL');

  // Refund Request Modal State
  const [refundTargetTx, setRefundTargetTx] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

  // Filter students for Billing Search
  const filteredLearners = useMemo(() => {
    return students.filter((s) => {
      if (selectedGradeFilter !== 'ALL' && s.gradeCode !== selectedGradeFilter) return false;
      if (!learnerSearch.trim()) return true;
      const q = learnerSearch.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q)
      );
    });
  }, [students, learnerSearch, selectedGradeFilter]);

  // Filter transactions for Ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (ledgerGradeFilter !== 'ALL' && tx.gradeCode !== ledgerGradeFilter) return false;
      if (ledgerMethodFilter !== 'ALL' && tx.paymentMethod !== ledgerMethodFilter) return false;
      if (ledgerStatusFilter !== 'ALL' && tx.status !== ledgerStatusFilter) return false;
      if (!ledgerSearch.trim()) return true;
      const q = ledgerSearch.toLowerCase();
      return (
        tx.studentName.toLowerCase().includes(q) ||
        tx.regNumber.toLowerCase().includes(q) ||
        tx.receiptNumber.toLowerCase().includes(q) ||
        (tx.bankSlipRef && tx.bankSlipRef.toLowerCase().includes(q))
      );
    });
  }, [transactions, ledgerGradeFilter, ledgerMethodFilter, ledgerStatusFilter, ledgerSearch]);

  // Financial Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let cashTotal = 0;
    let bankTotal = 0;
    let momoTotal = 0;
    let pendingRefunds = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'Completed' || tx.status === 'Refund Requested') {
        totalRevenue += tx.amount;
        if (tx.paymentMethod === 'Cash') cashTotal += tx.amount;
        else if (tx.paymentMethod.includes('Bank')) bankTotal += tx.amount;
        else if (tx.paymentMethod.includes('Money')) momoTotal += tx.amount;
      }
      if (tx.status === 'Refund Requested') {
        pendingRefunds++;
      }
    });

    return { totalRevenue, cashTotal, bankTotal, momoTotal, pendingRefunds };
  }, [transactions]);

  // Handle Submit Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const recordedBy = `${sessionUser?.name || 'Eric Bizimana'} (Finance Officer)`;
    const newTx = recordPaymentTransaction({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      regNumber: selectedStudent.regNumber,
      gradeCode: selectedStudent.gradeCode,
      paymentType,
      amount: Number(amount),
      paymentMethod,
      bankSlipRef: bankSlipRef.trim() || undefined,
      recordedBy,
      term,
      academicYear,
    });

    setTransactions(getPaymentTransactions());
    setSuccessReceipt(newTx);
    setBankSlipRef('');
    if (onTransactionsUpdated) onTransactionsUpdated();
  };

  // Handle Request Refund
  const handleOpenRefundModal = (tx: PaymentTransaction) => {
    setRefundTargetTx(tx);
    setRefundReason('');
  };

  const handleConfirmRefundRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTargetTx || !refundReason.trim()) return;

    const requestedBy = `${sessionUser?.name || 'Eric Bizimana'} (Finance Officer)`;
    const updated = requestTransactionRefund(refundTargetTx.id, refundReason.trim(), requestedBy);
    setTransactions(updated);
    setRefundSuccessMsg(
      `Refund request for Receipt ${refundTargetTx.receiptNumber} (${refundTargetTx.amount.toLocaleString()} RWF) has been routed to the Principal's Queue for approval.`
    );
    setRefundTargetTx(null);
    setRefundReason('');
    if (onTransactionsUpdated) onTransactionsUpdated();
  };

  // Export Ledger to CSV
  const handleExportLedgerCSV = () => {
    const headers = [
      '"MUGINA HOPE PRIMARY & NURSERY ACADEMY - OFFICIAL ACCOUNTING & TRANSACTION LEDGER"',
      `"Export Date:","${new Date().toISOString()}"`,
      `"Exported By:","${sessionUser?.name || 'Finance Officer'}"`,
      `"Total Transactions:","${filteredTransactions.length}"`,
      `"Total Collected (RWF):","${metrics.totalRevenue.toLocaleString()}"`,
      '""',
      '"Receipt No","Date & Time","Learner Name","Reg Number","Class","Fee Category","Amount (RWF)","Payment Method","Slip / Ref","Recorded By","Status"',
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.receiptNumber}"`,
      `"${new Date(tx.recordedAt).toLocaleString()}"`,
      `"${tx.studentName.replace(/"/g, '""')}"`,
      `"${tx.regNumber}"`,
      `"${tx.gradeCode}"`,
      `"${tx.paymentType}"`,
      `"${tx.amount}"`,
      `"${tx.paymentMethod}"`,
      `"${(tx.bankSlipRef || '-').replace(/"/g, '""')}"`,
      `"${tx.recordedBy.replace(/"/g, '""')}"`,
      `"${tx.status}"`,
    ]);

    const csvContent = '\uFEFF' + [...headers, ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mugina_Hope_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Finance Officer Portal • Accounting & Ledger Suite</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white">
              Learner Billing & Financial Management
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Key in student fee payments via cash or bank deposit, view detailed transactional ledgers, and route refund requests to the Principal's approval queue.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3 text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 block font-semibold">Total Revenue</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {metrics.totalRevenue.toLocaleString()} RWF
              </span>
            </div>
            {metrics.pendingRefunds > 0 && (
              <div className="bg-amber-500/20 border border-amber-400/30 rounded-2xl p-3 text-right">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 block font-semibold">Principal Queue</span>
                <span className="text-lg font-black font-mono text-amber-400">
                  {metrics.pendingRefunds} Refund{metrics.pendingRefunds > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'billing'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>1. Learner Billing Interface</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'ledger'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Transactional Ledgers & History ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('refunds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'refunds'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>3. Routed Refund Tracker</span>
            {metrics.pendingRefunds > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                {metrics.pendingRefunds}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Refund Success Alert Banner */}
      {refundSuccessMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong className="block font-bold">Refund Request Routed to Principal Queue</strong>
              <span>{refundSuccessMsg}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRefundSuccessMsg(null)}
            className="text-amber-500 hover:text-amber-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: DEDICATED BILLING INTERFACE */}
      {/* ========================================================================= */}
      {activeSubTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Search & Select Learner (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Search Learner</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{filteredLearners.length} found</span>
            </div>

            {/* Filter by Grade */}
            <div className="flex items-center gap-2">
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="ALL">All Grades / Classes</option>
                {ACADEMIC_GRADES.map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.name} ({g.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by learner name, reg number..."
                value={learnerSearch}
                onChange={(e) => setLearnerSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Learners List */}
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {filteredLearners.map((learner) => {
                const isSelected = selectedStudent?.id === learner.id;
                return (
                  <div
                    key={learner.id}
                    onClick={() => setSelectedStudent(learner)}
                    className={`pt-2 p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                        : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">{learner.fullName}</h4>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                          <span className="font-semibold text-emerald-800">{learner.regNumber}</span>
                          <span>•</span>
                          <span>{learner.gradeCode}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {learner.gender}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Parent: {learner.parentName}</span>
                      <span>{learner.parentPhone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Billing Form for Selected Learner (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            {selectedStudent ? (
              <form onSubmit={handleRecordPayment} className="space-y-5">
                {/* Selected Learner Card Header */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Active Billing Target
                    </span>
                    <h3 className="text-base font-black text-slate-900 font-display">
                      {selectedStudent.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600 mt-0.5">
                      <span className="font-bold text-emerald-800">{selectedStudent.regNumber}</span>
                      <span>•</span>
                      <span>Class: {selectedStudent.gradeCode}</span>
                      <span>•</span>
                      <span>Parent: {selectedStudent.parentName}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 shrink-0">
                    Active Learner
                  </span>
                </div>

                {/* Form Row 1: Fee Category */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fee Category / Payment Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { type: 'Tuition Fee', defaultAmount: 45000 },
                      { type: 'Uniform & Supplies', defaultAmount: 25000 },
                      { type: 'Lunch Program', defaultAmount: 20000 },
                      { type: 'School Transport', defaultAmount: 15000 },
                      { type: 'Registration Fee', defaultAmount: 10000 },
                      { type: 'Examination Fee', defaultAmount: 5000 },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setPaymentType(item.type as PaymentTransaction['paymentType']);
                          setAmount(item.defaultAmount);
                        }}
                        className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                          paymentType === item.type
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="block">{item.type}</span>
                        <span
                          className={`text-[10px] font-mono mt-0.5 block ${
                            paymentType === item.type ? 'text-emerald-300' : 'text-slate-400'
                          }`}
                        >
                          Std: {item.defaultAmount.toLocaleString()} RWF
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Row 2: Amount in RWF */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Amount to Key In (RWF) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-lg font-black font-mono text-slate-900 px-4 py-2.5 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                    <span className="absolute right-4 top-3 text-xs font-bold text-slate-400 uppercase font-mono">
                      RWF
                    </span>
                  </div>
                </div>

                {/* Form Row 3: Payment Method & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="Cash">Cash (Handed to Bursar Office)</option>
                      <option value="Bank Deposit (BK)">Bank Deposit (Bank of Kigali - BK)</option>
                      <option value="Bank Transfer">Bank Transfer (Direct EFT)</option>
                      <option value="MTN Mobile Money">MTN Mobile Money (MoMo Pay)</option>
                      <option value="Airtel Money">Airtel Money</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Bank Slip / Transaction Ref
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BK-SLIP-98214 or MoMo Ref"
                      value={bankSlipRef}
                      onChange={(e) => setBankSlipRef(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-mono rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Form Row 4: Term & Academic Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Academic Term
                    </label>
                    <select
                      value={term}
                      onChange={(e) => setTerm(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-bold font-mono rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Submit Payment Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-5 h-5 text-amber-300" />
                  <span>Record Payment & Issue Official Receipt</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Select a learner from the list on the left to start billing.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DETAILED TRANSACTIONAL LEDGERS & FILTERED REPORTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">
                Transactional Ledgers & Payment History
              </h3>
              <p className="text-xs text-slate-500">
                Audit trail of all tuition, uniform, and school fee collections. Click "Request Refund" to route transactions to the Principal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportLedgerCSV}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Export Ledger CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search receipt #, learner..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-8 pr-3 py-1.5 text-xs rounded-xl focus:outline-hidden"
              />
            </div>

            {/* Grade Filter */}
            <select
              value={ledgerGradeFilter}
              onChange={(e) => setLedgerGradeFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              <option value="ALL">All Classes / Grades</option>
              {ACADEMIC_GRADES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Method Filter */}
            <select
              value={ledgerMethodFilter}
              onChange={(e) => setLedgerMethodFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Deposit (BK)">Bank Deposit (BK)</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
            </select>

            {/* Status Filter */}
            <select
              value={ledgerStatusFilter}
              onChange={(e) => setLedgerStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Refund Requested">Refund Requested</option>
              <option value="Refund Approved">Refund Approved</option>
              <option value="Refund Rejected">Refund Rejected</option>
            </select>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Receipt #</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Learner & Reg</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Amount (RWF)</th>
                  <th className="p-3.5">Method & Ref</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{tx.receiptNumber}</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.recordedAt).toLocaleDateString()} {new Date(tx.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5">
                      <strong className="block font-bold text-slate-900">{tx.studentName}</strong>
                      <span className="text-[11px] font-mono text-emerald-800">{tx.regNumber}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-700">{tx.gradeCode}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{tx.paymentType}</td>
                    <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div className="font-semibold text-slate-800">{tx.paymentMethod}</div>
                      {tx.bankSlipRef && (
                        <div className="text-[10px] font-mono text-slate-400">Ref: {tx.bankSlipRef}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      {tx.status === 'Completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Completed
                        </span>
                      )}
                      {tx.status === 'Refund Requested' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3 text-amber-600" />
                          In Principal Queue
                        </span>
                      )}
                      {tx.status === 'Refund Approved' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Refund Approved
                        </span>
                      )}
                      {tx.status === 'Refund Rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          Refund Declined
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {tx.status === 'Completed' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenRefundModal(tx)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Route transaction to Principal's Queue for refund authorization"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Request Refund</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSuccessReceipt(tx)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View & Print Official Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: ROUTED REFUND TRACKER */}
      {/* ========================================================================= */}
      {activeSubTab === 'refunds' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">
                Principal Refund Authorization Queue Status
              </h3>
              <p className="text-xs text-slate-500">
                Track status of refund requests submitted to the Principal/Headmaster queue.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              {transactions.filter((t) => t.status !== 'Completed').length} active requests
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {transactions
              .filter((t) => t.status !== 'Completed')
              .map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{tx.receiptNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        tx.status === 'Refund Requested'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : tx.status === 'Refund Approved'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {tx.studentName} ({tx.regNumber} • {tx.gradeCode})
                    </h4>
                    <p className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/50 p-2 rounded-xl mt-1">
                      <strong>Reason for Refund:</strong> {tx.refundReason}
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                      <span>Requested by: {tx.refundRequestedBy}</span>
                      <span>•</span>
                      <span>Requested at: {tx.refundRequestedAt ? new Date(tx.refundRequestedAt).toLocaleString() : '-'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black font-mono text-slate-900 block">
                      {tx.amount.toLocaleString()} RWF
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{tx.paymentMethod}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST REFUND MODAL */}
      {/* ========================================================================= */}
      {refundTargetTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 block">
                  Action Menu • Finance Portal
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Request Transaction Refund
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRefundTargetTx(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-900">{refundTargetTx.receiptNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Learner Name:</span>
                <span className="font-bold text-slate-900">{refundTargetTx.studentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Amount to Refund:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {refundTargetTx.amount.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-700">{refundTargetTx.paymentMethod}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmRefundRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reason for Refund (Forwarded to Principal) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Duplicate bank slip provided by parent, learner relocated to another sector, overpayment of term fees..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:bg-white focus:outline-hidden focus:border-rose-600"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  This will route the transaction directly to the <strong>Principal's Queue</strong>. Only the Headmaster or Principal can authorize disbursement.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundTargetTx(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Route to Principal's Queue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL PAYMENT RECEIPT POPUP */}
      {/* ========================================================================= */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            {/* Printable Receipt Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50/50 space-y-5">
              <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                <h3 className="text-base font-black tracking-tight text-slate-900 font-display">
                  {SCHOOL_INFO.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {SCHOOL_INFO.location.landmark} • Tel: {SCHOOL_INFO.contact.phone}
                </p>
                <span className="inline-block mt-1 font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md">
                  OFFICIAL FEE RECEIPT • {successReceipt.receiptNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Learner Name</span>
                  <span className="font-bold text-slate-900">{successReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration No</span>
                  <span className="font-bold font-mono text-slate-900">{successReceipt.regNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Class / Grade</span>
                  <span className="font-bold text-slate-900">{successReceipt.gradeCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Term / Year</span>
                  <span className="font-bold text-slate-900">
                    {successReceipt.term} ({successReceipt.academicYear})
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fee Description</span>
                  <span className="font-bold text-slate-900">{successReceipt.paymentType}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-900 text-white rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Amount Paid</span>
                <span className="text-lg font-black font-mono">
                  {successReceipt.amount.toLocaleString()} RWF
                </span>
              </div>

              <div className="text-[10px] text-slate-500 space-y-1">
                <div>
                  <strong>Method:</strong> {successReceipt.paymentMethod}{' '}
                  {successReceipt.bankSlipRef && `(Ref: ${successReceipt.bankSlipRef})`}
                </div>
                <div>
                  <strong>Issued By:</strong> {successReceipt.recordedBy}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(successReceipt.recordedAt).toLocaleString()}
                </div>
              </div>

              <div className="text-center pt-3 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Official School Finance Stamp Verified
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSuccessReceipt(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
