import React, { useState } from 'react';
import { TUITION_STRUCTURE } from '../data/schoolData';
import { Coins, Check, FileDown, ArrowRight } from 'lucide-react';

interface FeeEstimatorProps {
  onOpenApply: () => void;
}

export const FeeEstimator: React.FC<FeeEstimatorProps> = ({ onOpenApply }) => {
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    lunch: true,
    transport_local: false,
    transport_extended: false,
    uniform_pack: true,
  });

  const currentLevel = TUITION_STRUCTURE.levels[selectedLevelIdx];

  const handleToggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = { ...prev };
      if (id === 'transport_local' && !prev[id]) {
        next.transport_local = true;
        next.transport_extended = false;
      } else if (id === 'transport_extended' && !prev[id]) {
        next.transport_extended = true;
        next.transport_local = false;
      } else {
        next[id] = !prev[id];
      }
      return next;
    });
  };

  // Calculations
  const termTuition = currentLevel.tuitionPerTerm;
  const termMaterials = currentLevel.materialsFee;

  let termAddonsTotal = 0;
  let oneTimeUniformFee = 0;

  TUITION_STRUCTURE.optionalAddons.forEach((addon) => {
    if (selectedAddons[addon.id]) {
      if (addon.id === 'uniform_pack') {
        oneTimeUniformFee += addon.feePerTerm;
      } else {
        termAddonsTotal += addon.feePerTerm;
      }
    }
  });

  const totalPerTerm = termTuition + termMaterials + termAddonsTotal;
  const estimatedAnnualTotal = (totalPerTerm * TUITION_STRUCTURE.termsPerYear) + oneTimeUniformFee;

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(val).replace('RWF', 'RWF ');
  };

  const handlePrintQuotation = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Transparent Tuition & Fee Estimator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Calculate official term and annual fees with lunch and bus options in Rwandan Francs (RWF).
            </p>
          </div>
        </div>
        <button
          onClick={handlePrintQuotation}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Print / Save Estimate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Level and options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Level Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Choose Grade Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TUITION_STRUCTURE.levels.map((lvl, idx) => {
                const isSelected = selectedLevelIdx === idx;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setSelectedLevelIdx(idx)}
                    className={`p-3 text-left rounded-xl transition-all border ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/70 text-blue-950 ring-2 ring-blue-700/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{lvl.level}</div>
                    <div className="text-xs font-mono font-semibold text-blue-700 mt-1">
                      {formatRwf(lvl.tuitionPerTerm)} / term
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {currentLevel.description}
            </p>
          </div>

          {/* Optional Services & Add-ons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              2. Optional School Services & Programs
            </label>
            <div className="space-y-2">
              {TUITION_STRUCTURE.optionalAddons.map((addon) => {
                const isChecked = !!selectedAddons[addon.id];
                return (
                  <label
                    key={addon.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-amber-400 bg-amber-50/40 text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleAddon(addon.id)}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{addon.name}</span>
                        <span className="text-xs font-mono font-semibold text-slate-700">
                          {formatRwf(addon.feePerTerm)} {addon.id === 'uniform_pack' ? '(one-time)' : '/ term'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{addon.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Fee Breakdown Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-amber-400 tracking-wide uppercase">
              Tuition Summary
            </h4>
            <span className="text-xs text-slate-400 font-mono">Academic Year 2026</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Tuition ({currentLevel.level}):</span>
              <span className="font-mono text-white font-semibold">{formatRwf(termTuition)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Learning Materials & Stationery:</span>
              <span className="font-mono text-white font-semibold">{formatRwf(termMaterials)}</span>
            </div>

            {selectedAddons.lunch && (
              <div className="flex justify-between text-amber-300">
                <span>Hot Lunch & Milk Program:</span>
                <span className="font-mono font-semibold">
                  {formatRwf(TUITION_STRUCTURE.optionalAddons.find(a => a.id === 'lunch')?.feePerTerm || 0)}
                </span>
              </div>
            )}

            {selectedAddons.transport_local && (
              <div className="flex justify-between text-amber-300">
                <span>School Van (Mugina Zone):</span>
                <span className="font-mono font-semibold">
                  {formatRwf(TUITION_STRUCTURE.optionalAddons.find(a => a.id === 'transport_local')?.feePerTerm || 0)}
                </span>
              </div>
            )}

            {selectedAddons.transport_extended && (
              <div className="flex justify-between text-amber-300">
                <span>School Van (Kamonyi Extended):</span>
                <span className="font-mono font-semibold">
                  {formatRwf(TUITION_STRUCTURE.optionalAddons.find(a => a.id === 'transport_extended')?.feePerTerm || 0)}
                </span>
              </div>
            )}

            {selectedAddons.uniform_pack && (
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span>Uniform Pack (One-time):</span>
                <span className="font-mono text-white font-semibold">{formatRwf(oneTimeUniformFee)}</span>
              </div>
            )}
          </div>

          {/* Grand Totals */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Total Per Term (x3 terms):</span>
              <span className="text-lg font-bold font-mono text-white">
                {formatRwf(totalPerTerm)}
              </span>
            </div>

            <div className="flex items-baseline justify-between bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div>
                <span className="text-xs font-bold text-amber-400 block">Estimated Annual Total:</span>
                <span className="text-[10px] text-slate-400">(Includes 3 terms + selected items)</span>
              </div>
              <span className="text-xl font-black font-mono text-amber-400">
                {formatRwf(estimatedAnnualTotal)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Installment payment plans available upon request</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Official bank slip payments via BK or MoMo Pay</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenApply}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            <span>Proceed to Admissions Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
