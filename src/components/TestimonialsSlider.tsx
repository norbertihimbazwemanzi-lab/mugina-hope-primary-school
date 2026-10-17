import React, { useState, useEffect, useRef } from 'react';
import { TESTIMONIALS } from '../data/schoolData';
import { Testimonial } from '../types';
import {
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  GraduationCap,
  Sparkles,
  Pause,
  Play,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface TestimonialsSliderProps {
  onOpenApply?: () => void;
}

export const TestimonialsSlider: React.FC<TestimonialsSliderProps> = ({ onOpenApply }) => {
  const [filter, setFilter] = useState<'all' | 'parent' | 'student'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const filteredItems: Testimonial[] = TESTIMONIALS.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoPlaying || filteredItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, filteredItems.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const currentItem = filteredItems[currentIndex] || filteredItems[0];
  if (!currentItem) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
            <HeartHandshake className="w-4 h-4 text-amber-500" />
            <span>Community Trust & Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Voices of Mugina Hope Academy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Authentic experiences from parents trusting us with their children's formative years and students thriving in our classrooms.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Voices ({TESTIMONIALS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('parent')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filter === 'parent'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Parents ({TESTIMONIALS.filter((t) => t.type === 'parent').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('student')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filter === 'student'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
            <span>Students ({TESTIMONIALS.filter((t) => t.type === 'student').length})</span>
          </button>
        </div>
      </div>

      {/* Main Testimonial Slider Card */}
      <div
        className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50/40 rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12 transition-all"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle decorative background watermarks */}
        <Quote className="absolute top-6 right-8 w-28 h-28 text-slate-200/50 pointer-events-none select-none -rotate-12" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Author Identity Card */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:border-r lg:border-slate-200/80 lg:pr-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Initials Avatar */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl font-display shadow-sm ${
                    currentItem.type === 'student'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-900 text-white border border-blue-950'
                  }`}
                >
                  {currentItem.avatarInitials ||
                    currentItem.author
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        currentItem.type === 'student'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {currentItem.type === 'student' ? 'Pupil Perspective' : 'Parent Perspective'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display mt-1">
                    {currentItem.author}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">{currentItem.role}</p>
                </div>
              </div>

              {/* Location & Highlight */}
              <div className="pt-2 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Location:</span>
                  <span>{currentItem.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Focus:</span>
                  <span className="text-blue-800 font-medium">{currentItem.childGrade}</span>
                </div>
                {currentItem.highlight && (
                  <div className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg font-semibold text-[11px] mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{currentItem.highlight}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5-star rating */}
            <div className="flex items-center gap-1 pt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-1.5">5.0 / 5.0 Rating</span>
            </div>
          </div>

          {/* Right Column: Quote Display */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Verified Community Quote</span>
              </span>

              <blockquote className="text-base sm:text-lg lg:text-xl font-medium text-slate-800 leading-relaxed italic">
                &ldquo;{currentItem.quote}&rdquo;
              </blockquote>
            </div>

            {/* Bottom Controls Bar */}
            <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Pagination Dots & Autoplay Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {filteredItems.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 transition-all rounded-full ${
                        idx === currentIndex ? 'w-7 bg-blue-700' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <span className="text-xs font-mono font-semibold text-slate-500">
                  {currentIndex + 1} of {filteredItems.length}
                </span>

                <button
                  type="button"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                  title={isAutoPlaying ? 'Pause automatic slider' : 'Resume automatic slider'}
                  aria-label={isAutoPlaying ? 'Pause automatic slider' : 'Resume automatic slider'}
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 shadow-2xs transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 shadow-2xs transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {onOpenApply && (
                  <button
                    type="button"
                    onClick={onOpenApply}
                    className="ml-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 active:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Enroll Your Child
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
