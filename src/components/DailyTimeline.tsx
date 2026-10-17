import React, { useState } from 'react';
import { DAILY_TIMELINE } from '../data/schoolData';
import { Clock, Sun, BookOpen, Apple, Laptop, Utensils, Palette, Home, Sparkles } from 'lucide-react';

export const DailyTimeline: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<'both' | 'nursery' | 'primary'>('both');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'arrival':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'academic':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'nutrition':
        return <Apple className="w-4 h-4 text-emerald-500" />;
      case 'arts':
        return <Palette className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Interactive Track Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Track Routine:
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTrack('both')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTrack === 'both'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Full Campus Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTrack('nursery')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTrack === 'nursery'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nursery Academy (Ages 3–5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTrack('primary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTrack === 'primary'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Primary School (P1–P6)
          </button>
        </div>
      </div>

      {/* Visual Timeline Cards */}
      <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
        {DAILY_TIMELINE.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              {getCategoryIcon(item.category)}
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-mono font-bold text-blue-700">
                  {item.time}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Phase 0{idx + 1}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 font-display">
                {item.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Conditional track breakdown */}
              {(activeTrack === 'both' || activeTrack === 'nursery') && item.nurseryDetail && (
                <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm shrink-0">
                    Nursery Focus:
                  </span>
                  <span className="text-xs text-slate-600">{item.nurseryDetail}</span>
                </div>
              )}

              {(activeTrack === 'both' || activeTrack === 'primary') && item.primaryDetail && (
                <div className="pt-1.5 flex items-start gap-2">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm shrink-0">
                    Primary Focus:
                  </span>
                  <span className="text-xs text-slate-600">{item.primaryDetail}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
