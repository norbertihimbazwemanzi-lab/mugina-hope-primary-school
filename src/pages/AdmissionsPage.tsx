import React, { useState } from 'react';
import { FeeEstimator } from '../components/FeeEstimator';
import { PageId } from '../types';
import {
  ClipboardCheck,
  FileText,
  Download,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SCHOOL_INFO, FAQS } from '../data/schoolData';
import { getRequiredDocuments, RegistrationDocument } from '../services/adminStore';

interface AdmissionsPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApply: () => void;
  onOpenPrintableForm: () => void;
  onOpenTour: () => void;
  onOpenChatTracker?: (refCode?: string) => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({
  onNavigate,
  onOpenApply,
  onOpenPrintableForm,
  onOpenTour,
  onOpenChatTracker,
}) => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [requiredDocs] = useState<RegistrationDocument[]>(getRequiredDocuments());

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  const steps = [
    {
      num: '01',
      title: 'Inquire & Campus Tour',
      desc: 'Book a campus tour to walk through our safe learning facilities next to Mugina Police Station and meet teachers.',
      cta: 'Book Tour',
      action: onOpenTour,
    },
    {
      num: '02',
      title: 'Complete Application',
      desc: 'Fill out our quick online application or download and complete the official registration PDF packet.',
      cta: 'Apply Online',
      action: onOpenApply,
    },
    {
      num: '03',
      title: 'Document Submission & Placement',
      desc: 'Submit required documents (Birth certificate, photos, previous records). A brief friendly placement check is conducted.',
      cta: 'View Checklist',
      action: () => {
        const el = document.getElementById('documentation-checklist');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      num: '04',
      title: 'Acceptance & Enrollment',
      desc: 'Receive your formal acceptance letter, obtain the school uniform kit, and welcome your child to Mugina Hope Academy!',
      cta: 'Calculate Fees',
      action: () => {
        const el = document.getElementById('fee-estimator-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Admissions & Enrollment
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display">
          Join the Mugina Hope Academy Family
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          We welcome applications year-round for Nursery (Baby, Middle, Pre-Primary) and Primary (P1 to P6). Learn about our transparent admissions process, required documentation, and tuition fees below.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenApply}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
          >
            Start Online Application
          </button>
          {onOpenChatTracker && (
            <button
              onClick={() => onOpenChatTracker()}
              className="px-5 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Track Application & Chat with Admin</span>
            </button>
          )}
          <button
            onClick={onOpenPrintableForm}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Application PDF</span>
          </button>
        </div>

        {/* Live Admin Confirmation & Chat Reassurance Banner */}
        {onOpenChatTracker && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 via-slate-50 to-amber-50 rounded-2xl border border-blue-200/80 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Waiting for Administrator Confirmation?
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter your reference code to view live status or message Administrator Norbert Ihimbazwe Manzi directly while awaiting verification.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChatTracker()}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-blue-900 font-bold text-xs rounded-xl shadow-2xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
              <span>Open Chat</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Step-by-Step Registration Checklist */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Admissions Journey
          </span>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Four Simple Steps to Register Your Child
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div
              key={st.num}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-2xl font-black text-blue-700 font-mono">
                  {st.num}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={st.action}
                className="self-start text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                <span>{st.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Required Documentation Checklist & Downloadable Forms */}
      <div id="documentation-checklist" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Required Checklist */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Required Registration Documentation
              </h3>
              <p className="text-xs text-slate-500">
                Official documents required by Rwanda Ministry of Education (MINEDUC) standards
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            {requiredDocs.map((doc, index) => (
              <div key={doc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 transition-all hover:bg-white hover:shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs font-mono">
                  {index + 1}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-slate-900 font-display text-sm block">
                      {doc.title}
                    </strong>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      doc.isRequired
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.isRequired ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700">
                      Scope: {doc.applicableGrades}
                    </span>
                    {doc.formatHint && (
                      <span className="italic text-slate-500">
                        ({doc.formatHint})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Downloadable Forms Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md border border-slate-800">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Downloadable Forms & Packets
            </span>
            <h3 className="text-xl font-bold font-display text-white">
              Official Application Documents
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prefer to fill out physical paperwork? Download and print the complete Mugina Hope Academy admission packet instantly.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white">
                  Learner Registration Packet (2026/2027)
                </div>
                <div className="text-[11px] text-slate-400">
                  Format: Printable PDF · Includes Medical & Terms
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenPrintableForm}
                className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors font-bold text-xs"
                title="Download / Print PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white">
                  Tuition Schedule & Bank Account Details
                </div>
                <div className="text-[11px] text-slate-400">
                  BK & MoMo Pay reference codes for Kamonyi
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('fee-estimator-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                title="View fee details"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Need assistance? Call admissions desk at {SCHOOL_INFO.contact.phone}</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Fee Estimator Widget */}
      <section id="fee-estimator-section" className="scroll-mt-24">
        <FeeEstimator onOpenApply={onOpenApply} />
      </section>

      {/* 5. Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Admissions FAQ
          </span>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Common Questions from Prospective Parents
          </h2>
        </div>

        <div className="divide-y divide-slate-100 max-w-3xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left flex items-center justify-between gap-4 group"
                >
                  <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {faq.question}
                  </span>
                  <span className="text-slate-400 text-lg font-mono">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
