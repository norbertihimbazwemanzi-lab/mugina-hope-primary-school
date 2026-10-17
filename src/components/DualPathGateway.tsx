import React from 'react';
import { SCHOOL_INFO } from '../data/schoolData';
import { PageId } from '../types';
import { Baby, BookOpen, Sparkles, Check, ArrowRight } from 'lucide-react';

interface DualPathGatewayProps {
  onNavigate: (page: PageId) => void;
  onOpenApply: () => void;
}

export const DualPathGateway: React.FC<DualPathGatewayProps> = ({ onNavigate, onOpenApply }) => {
  return (
    <section className="py-12">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Our Dual-Path Educational Foundation
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
          Choose the Right Educational Journey for Your Child
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          From nurturing first steps in early childhood development to rigorous primary academic excellence, Mugina Hope Academy provides dedicated learning tracks under one secure campus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Pathway 1: Nursery Academy */}
        <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
          <div className="relative h-64 overflow-hidden bg-amber-100">
            <img
              src={SCHOOL_INFO.images.nursery}
              alt="Mugina Hope Nursery classroom with happy children learning through play in Rwanda"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent flex items-end p-6">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5" />
                  Ages 3 to 5 Years
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                  Nursery Academy Path
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A warm, safe and stimulating sanctuary focused on early cognitive development, childcare, and playful discovery. We cultivate curiosity, bilingual language introduction, and emotional well-being.
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Three progressive levels:</strong> Baby Class (3y), Middle Class (4y), and Pre-Primary Top Class (5y).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Play-based learning & Montessori blocks:</strong> Sensorial discovery, physical coordination, and early phonics.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Loving childcare & nutrition:</strong> Certified caregivers, mid-morning milk/porridge, and quiet nap facilities.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('academics')}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                <span>Explore Nursery Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onOpenApply}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Enroll in Nursery
              </button>
            </div>
          </div>
        </div>

        {/* Pathway 2: Primary School */}
        <div className="bg-white rounded-2xl border border-blue-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
          <div className="relative h-64 overflow-hidden bg-blue-100">
            <img
              src={SCHOOL_INFO.images.primaryStem}
              alt="Mugina Hope Primary students in computer lab learning ICT in Kamonyi Rwanda"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent flex items-end p-6">
              <div>
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Primary 1 through Primary 6
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                  Primary School Path
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Rigorous academic excellence aligned with the Rwanda National Curriculum (REB). We empower pupils with English fluency, advanced mathematics, science experimentation, and computer literacy.
              </p>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rwanda National Standards:</strong> Full coverage of P1–P6 curricula with high Primary Leaving Exam (PLE) performance.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Modern Computer Literacy & STEM:</strong> Dedicated workstation practice, digital skills, and science labs.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Trilingual Fluency:</strong> English as medium of instruction, enriched with French classes and Kinyarwanda heritage.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('academics')}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <span>View P1–P6 Programs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onOpenApply}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Enroll in Primary
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
