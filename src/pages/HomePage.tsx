import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { SCHOOL_INFO } from '../data/schoolData';
import { DualPathGateway } from '../components/DualPathGateway';
import { DailyTimeline } from '../components/DailyTimeline';
import { TestimonialsSlider } from '../components/TestimonialsSlider';
import {
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Award,
  Users,
  Compass,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenApply: () => void;
  onOpenTour: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenApply,
  onOpenTour,
}) => {
  // Hero slides
  const slides = [
    {
      image: SCHOOL_INFO.images.hero,
      kicker: 'Kamonyi District · Southern Province',
      title: 'Welcome to Mugina Hope Primary & Nursery Academy',
      tagline: 'Nurturing purposeful, confident, and God-fearing learners since 2014.',
      highlight: 'Excellence in early childhood and primary education',
    },
    {
      image: SCHOOL_INFO.images.primaryStem,
      kicker: 'Rwanda National Curriculum & ICT Literacy',
      title: 'Academic Excellence from P1 to Primary 6',
      tagline: 'Hands-on computer labs, science discovery, and rigorous examination preparation.',
      highlight: '100% Primary Leaving Examination (PLE) Division I & II focus',
    },
    {
      image: SCHOOL_INFO.images.nursery,
      kicker: 'Early Childhood Development (Ages 3–5)',
      title: 'Joyful Play-Based Nursery Academy',
      tagline: 'Warm childcare, phonics, storytelling, and foundational motor development.',
      highlight: 'Baby, Middle, and Pre-Primary school readiness tracks',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides gently
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="space-y-16">
      {/* 1. Hero Section & Visual Slider */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 border border-slate-800 shadow-xl">
        {/* Background Image Carousel */}
        <div className="relative h-[540px] sm:h-[600px] lg:h-[640px] w-full overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
              />
              {/* Cinematic Scrim for AA contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />
            </div>
          ))}

          {/* Slide Content Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-4xl">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 key={currentSlide}">
              {/* Hero Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight font-display text-balance">
                {slides[currentSlide].title}
              </h1>

              {/* Tagline / Subtitle */}
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
                {slides[currentSlide].tagline}
              </p>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate('academics')}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <span>Explore Our Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onOpenTour}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-sm rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Book a Campus Tour</span>
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Arrows */}
          <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition-colors"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-xs font-mono font-bold text-slate-300 px-2">
              0{currentSlide + 1} / 0{slides.length}
            </div>
            <button
              onClick={nextSlide}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition-colors"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Quick Facts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Fact 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Year Established
              </span>
              <Calendar className="w-5 h-5 text-blue-700" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">
              {SCHOOL_INFO.establishedYear}
            </div>
            <p className="text-xs text-slate-600">
              Over 12 years of steadfast academic and moral foundation in the Southern Province.
            </p>
          </div>

          {/* Fact 2: Safe Location */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-2 bg-gradient-to-br from-emerald-50/40 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Maximum Security
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-display">
              Near Police Station
            </div>
            <p className="text-xs text-slate-600">
              Situated right beside Mugina Police Station, offering 24/7 peace of mind for every family.
            </p>
          </div>

          {/* Fact 3: Levels */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Grade Levels
              </span>
              <GraduationCap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">
              Nursery to P6
            </div>
            <p className="text-xs text-slate-600">
              Baby, Middle, Pre-Primary, through Primary 6 with national REB curriculum excellence.
            </p>
          </div>

          {/* Fact 4: Student Focused */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Mentorship Ratio
              </span>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">
              18 : 1 Ratio
            </div>
            <p className="text-xs text-slate-600">
              Intimate classroom sizes ensuring every child receives individualized attention and guidance.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The Dual-Path Gateway */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DualPathGateway
          onNavigate={onNavigate}
          onOpenApply={onOpenApply}
        />
      </section>

      {/* 4. "Day in the Life" Interactive Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Daily Campus Rhythm
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              A Day in the Life of a Mugina Hope Pupil
            </h2>
            <p className="text-sm text-slate-600">
              From arrival through guarded security gates at 7:00 AM to afternoon creative arts, each hour is thoughtfully balanced with academics, nutrition, and joy.
            </p>
          </div>

          <DailyTimeline />
        </div>
      </section>

      {/* 5. Testimonial Slider Featuring Parents & Students */}
      <TestimonialsSlider onOpenApply={onOpenApply} />

      {/* 6. Bottom Banner / CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-800 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" />
              Admissions Open for 2026 / 2027
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
              Give Your Child the Foundation They Deserve
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Limited slots available across Baby Class, Middle Class, Pre-Primary, and Primary 1 through 6. Register online or visit our admissions office today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenTour}
              className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
            >
              Book Campus Tour
            </button>
            <button
              type="button"
              onClick={onOpenApply}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-colors"
            >
              Apply Online Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
