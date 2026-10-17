import React from 'react';
import { SCHOOL_INFO } from '../data/schoolData';
import { PageId } from '../types';
import {
  ShieldCheck,
  Target,
  Eye,
  Heart,
  Award,
  Sparkles,
  BookOpen,
  MapPin,
  Clock,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApply: () => void;
  onOpenTour: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onOpenApply,
  onOpenTour,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          About Our Institution
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display">
          Nurturing Rwandan Leaders for a Better Future
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Founded in 2014 in Mugina Sector, Kamonyi District, Mugina Hope Primary & Nursery Academy is dedicated to providing high-quality, morally anchored, and technologically driven foundational education.
        </p>
      </div>

      {/* 2. Safety & Security Spotlight (Explicit Highlight near Police Station) */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-800/60 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Absolute Peace of Mind for Parents
              </span>
              <h2 className="text-2xl font-bold font-display text-white">
                Safety & Security: Located Beside Mugina Police Station
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono bg-emerald-900/60 text-emerald-200 px-3 py-1.5 rounded-full border border-emerald-700/50">
            24/7 Monitored Campus Zone
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-300">
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-base">Direct Security Neighbor</h3>
            <p className="text-slate-400 leading-relaxed">
              Our campus shares its immediate boundary with the local Mugina Police Post in Kamonyi District. This unique geographic advantage guarantees immediate protection and a peaceful neighborhood.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-base">Guarded Perimeter Walls</h3>
            <p className="text-slate-400 leading-relaxed">
              The entire academy grounds are enclosed with high masonry perimeter walls and secure checkpoints managed by trained security guards. Visitors must present valid national identification.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-white text-base">Verified Dismissal Protocol</h3>
            <p className="text-slate-400 leading-relaxed">
              No learner is released from campus without an authorized parent or guardian presenting their verified student ID badge, ensuring total accountability during school release hours.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Our Story & Heritage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Our Story (Amateka Yacu)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Established in 2014 to Elevate Southern Province Education
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              In 2014, visionary educators and community leaders in Mugina Sector recognized the critical need for a high-standard private primary and nursery school that could combine strong English literacy, computer competency, and Rwandan cultural identity.
            </p>
            <p>
              Starting with a modest intake of enthusiastic nursery toddlers, Mugina Hope Academy steadily expanded brick-by-brick to establish a complete primary wing spanning Primary 1 to Primary 6.
            </p>
            <p>
              Today, our pupils consistently perform among the highest in regional examinations, while remaining deeply rooted in the virtues of <strong>Agaciro (Self-Worth)</strong>, <strong>Umurava (Diligence)</strong>, and <strong>Ubunyangamugayo (Integrity)</strong>.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-6 text-xs text-slate-600">
            <div>
              <span className="block text-2xl font-black text-blue-700 font-display">2014</span>
              <span>Year Founded</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="block text-2xl font-black text-blue-700 font-display">600+</span>
              <span>Graduates Mentored</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="block text-2xl font-black text-blue-700 font-display">100%</span>
              <span>REB Examination Success</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
          <img
            src={SCHOOL_INFO.images.hero}
            alt="Mugina Hope Primary Campus in Kamonyi District"
            referrerPolicy="no-referrer"
            className="w-full h-80 sm:h-96 object-cover"
          />
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Modern campus brick wings against the scenic hills of Mugina</span>
            <span className="font-semibold text-blue-700">Kamonyi, Rwanda</span>
          </div>
        </div>
      </div>

      {/* 4. Mission, Vision & Core Motto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Mission */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">Our Mission</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To provide holistic, high-quality education that empowers every child to unlock their intellectual, spiritual, and physical potential, preparing them to thrive in secondary education and serve society with integrity.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">Our Vision</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To be the premier primary and nursery academy of choice in Rwanda’s Southern Province, celebrated for academic distinction, modern technology, and exemplary character formation.
          </p>
        </div>

        {/* Motto & Core Philosophy */}
        <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-2xs space-y-3 bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">Our School Motto</h3>
          <p className="text-base font-bold italic text-blue-900">
            &ldquo;{SCHOOL_INFO.motto}&rdquo;
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            In Kinyarwanda: <em>&ldquo;{SCHOOL_INFO.mottoKinyarwanda}&rdquo;</em>. We instill in our students that every lesson, book, and arithmetic problem mastered today is the bedrock of their glorious tomorrow.
          </p>
        </div>
      </div>

      {/* 5. Core Values (Indangagaciro zacu) */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Our Core Values
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            The Pillars That Guide Mugina Hope Academy
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-bold text-slate-900">1. Diligence (Umurava)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cultivating hard work, focus, and resilience across academics, sports, and daily chores.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-bold text-slate-900">2. Integrity (Ubunyangamugayo)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Living truthfully, respecting teachers and peers, and upholding moral courage.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-bold text-slate-900">3. Cultural Pride (Agaciro)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Embracing Rwandan cultural heritage, language, Itorero traditions, and national patriotism.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-bold text-slate-900">4. Curiosity & Innovation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Encouraging questions, scientific experimentation, and computer literacy from an early age.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Message from School Leadership */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center shrink-0 shadow-lg text-3xl font-black font-display">
          MHA
        </div>
        <div className="space-y-3 flex-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Leadership Statement
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            A Warm Welcome from the Head of School
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
            &ldquo;When a parent entrusts their child to Mugina Hope Academy, they are placing their most precious treasure in our hands. Located in peaceful Mugina right beside the local police station, we take that trust with utmost seriousness. Our certified teachers teach with both mind and heart, ensuring each child leaves our gates well-equipped to excel anywhere in Rwanda and the world.&rdquo;
          </p>
          <div className="pt-1 text-xs font-bold text-slate-800">
            Head Teacher & Administration Board · Mugina Hope Primary & Nursery Academy
          </div>
        </div>
      </div>

      {/* 7. CTA */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate('academics')}
          className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors"
        >
          View Academics & Grade Levels
        </button>
        <button
          type="button"
          onClick={onOpenTour}
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors"
        >
          Schedule a School Visit
        </button>
      </div>
    </div>
  );
};
