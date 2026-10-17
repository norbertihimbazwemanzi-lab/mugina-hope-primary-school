import React from 'react';
import { PageId } from '../types';
import { SCHOOL_INFO } from '../data/schoolData';
import { ShieldCheck, Phone, Mail, Globe, MapPin, Clock } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenApply: () => void;
  onOpenTour: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenApply, onOpenTour }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Upper Highlight Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe & Secure Learning Environment</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              Securely Located Next to Mugina Police Station
            </h3>
            <p className="text-sm text-slate-400 max-w-2xl">
              Parents enjoy absolute peace of mind knowing our learners study in a guarded, peaceful environment in Kamonyi District.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenTour}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              Book a Tour
            </button>
            <button
              onClick={onOpenApply}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-colors"
            >
              Enroll Your Child
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: School Identity with Crest */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SchoolLogo size="lg" />
              <div>
                <h4 className="text-base font-bold text-white font-display">
                  Mugina Hope Academy
                </h4>
                <p className="text-xs text-slate-400">Primary & Nursery</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-amber-400 font-semibold">School Motto:</p>
              <p className="text-sm italic text-slate-200 mt-0.5">
                &ldquo;{SCHOOL_INFO.motto}&rdquo;
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Kinyarwanda: &ldquo;{SCHOOL_INFO.mottoKinyarwanda}&rdquo;
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Founded in {SCHOOL_INFO.establishedYear} to deliver high-quality early childhood and primary education in the Southern Province, fully adhering to Rwanda Basic Education Board (REB) standards.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  About Our School & Safety
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('academics')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Curriculum & Age Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admissions')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Admissions Checklist & Fees
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('campus-life')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Campus Life & Traditional Dance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Contact & Campus Location
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Operating Hours Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white tracking-wide uppercase">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Operating Hours</span>
            </div>
            <div className="space-y-2 text-xs divide-y divide-slate-800">
              {SCHOOL_INFO.operatingHours.map((sched, idx) => (
                <div key={idx} className="pt-2 first:pt-0">
                  <div className="flex justify-between font-medium text-slate-200">
                    <span>{sched.days}</span>
                    <span className="text-amber-300 font-mono">{sched.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sched.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
              Contact & Location
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {SCHOOL_INFO.location.landmark}, {SCHOOL_INFO.location.sector}, {SCHOOL_INFO.location.district}, Southern Province, Rwanda
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${SCHOOL_INFO.contact.phone.replace(/\s+/g, '')}`}
                  className="hover:text-white font-mono text-slate-200"
                >
                  {SCHOOL_INFO.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`mailto:${SCHOOL_INFO.contact.email}`}
                  className="hover:text-white"
                >
                  {SCHOOL_INFO.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-mono text-slate-200">{SCHOOL_INFO.contact.website}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Mugina Hope Primary & Nursery Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Kamonyi District · Southern Province</span>
            <span aria-hidden="true">·</span>
            <span>Rwanda National Curriculum (REB)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
