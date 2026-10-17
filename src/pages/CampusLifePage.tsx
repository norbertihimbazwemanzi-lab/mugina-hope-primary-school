import React, { useState, useEffect } from 'react';
import { SCHOOL_INFO } from '../data/schoolData';
import { FacilityItem, PageId } from '../types';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { getGalleryItems } from '../services/adminStore';
import {
  Sparkles,
  Trophy,
  Music,
  Heart,
  Palette,
  Laptop,
  Flame,
  Maximize2,
  ShieldCheck,
  Check
} from 'lucide-react';

interface CampusLifePageProps {
  onNavigate: (page: PageId) => void;
  onOpenApply: () => void;
  onOpenTour: () => void;
}

export const CampusLifePage: React.FC<CampusLifePageProps> = ({
  onNavigate,
  onOpenApply,
  onOpenTour,
}) => {
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [facilities, setFacilities] = useState<FacilityItem[]>(getGalleryItems());

  useEffect(() => {
    setFacilities(getGalleryItems());
  }, []);

  const extracurricularClubs = [
    {
      title: 'Traditional Rwandan Dance & Itorero (Umuco)',
      category: 'Culture',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      desc: 'Pupils learn traditional Rwandan dance (Intore & Umushayayo), drumming, and patriotic poems celebrating Rwandan identity and values.',
      schedule: 'Tuesdays & Thursdays, 3:45 PM',
      featured: true,
    },
    {
      title: 'ICT & Coding Explorers Club',
      category: 'Technology',
      icon: <Laptop className="w-5 h-5 text-blue-600" />,
      desc: 'Interactive computer problem solving, typing competitions, digital art, and logic games in our dedicated laboratory.',
      schedule: 'Wednesdays, 3:30 PM',
      featured: false,
    },
    {
      title: 'Junior Football & Athletics Squad',
      category: 'Sports',
      icon: <Trophy className="w-5 h-5 text-emerald-600" />,
      desc: 'Physical endurance, sportsmanship, and inter-school friendly matches across Kamonyi District. Boys and girls teams.',
      schedule: 'Fridays, 3:30 PM & Saturday morning',
      featured: false,
    },
    {
      title: 'Music, Choir & Drama Club',
      category: 'Performing Arts',
      icon: <Music className="w-5 h-5 text-purple-600" />,
      desc: 'Vocal coaching, church and assembly hymns, theatrical sketches, and confidence-building performance.',
      schedule: 'Mondays, 3:45 PM',
      featured: false,
    },
    {
      title: 'English & Kinyarwanda Debate Guild',
      category: 'Academics',
      icon: <Palette className="w-5 h-5 text-indigo-600" />,
      desc: 'Public speaking, articulate argument building, vocabulary enrichment, and storytelling for Upper Primary learners.',
      schedule: 'Thursdays, 4:00 PM',
      featured: false,
    },
    {
      title: 'Environmental Care & Gardening (Umuganda)',
      category: 'Nature & Civics',
      icon: <Heart className="w-5 h-5 text-teal-600" />,
      desc: 'Hands-on planting of fruit trees, flower gardens, and vegetables teaching environmental conservation and stewardship.',
      schedule: 'Alternate Fridays',
      featured: false,
    },
  ];

  const filteredFacilities = facilities.filter((fac) => {
    if (activeCategory === 'all') return true;
    return fac.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Campus & Student Life
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display">
          Vibrant Days Filled with Learning, Culture & Joy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Education at Mugina Hope Academy extends far beyond textbooks. We nurture well-rounded, expressive children through sports, music, traditional Rwandan heritage, and safe outdoor play.
        </p>
      </div>

      {/* 2. Traditional Rwandan Culture & Itorero Spotlight */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl overflow-hidden border border-amber-800/80 shadow-xl grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              Rwandan Cultural Heritage (Umuco w&apos;u Rwanda)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              Itorero ry&apos;Abato: Traditional Dance & Drumming
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Every pupil at Mugina Hope Academy is immersed in Rwanda’s rich cultural tradition. Through traditional Intore warrior dance, graceful Umushayayo, and rhythmic drumming, children develop poise, national pride, and teamwork.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Authentic traditional costumes and traditional drums (Ingoma)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Regular performances during national days and Kamonyi festivals</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instilling core values: Ubutwari, Ubupfura, and Gukunda Igihugu</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-amber-800/60 flex items-center justify-between text-xs text-amber-300 font-medium">
            <span>Open to both Nursery & Primary learners</span>
            <button
              onClick={onOpenTour}
              className="text-white bg-amber-600 hover:bg-amber-500 font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Experience a Session
            </button>
          </div>
        </div>

        <div className="relative min-h-[300px] lg:min-h-full">
          <img
            src={SCHOOL_INFO.images.culturalDance}
            alt="Mugina Hope Academy children performing traditional Rwandan cultural dance"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. Extracurricular Clubs & Activities Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Student Enrichment
          </span>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Clubs & Extracurricular Activities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Discovering hidden talents and building lifelong friendships after academic hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {extracurricularClubs.map((club, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    {club.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {club.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-display">
                  {club.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {club.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-500">
                  {club.schedule}
                </span>
                <span className="text-[11px] font-bold text-blue-700">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Facilities Gallery & Lightbox */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Campus Spaces
            </span>
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Facilities & Learning Environment Gallery
            </h2>
            <p className="text-xs text-slate-500">
              Click any photo for high-resolution details and location notes
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Spaces
            </button>
            <button
              onClick={() => setActiveCategory('classrooms')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategory === 'classrooms'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Classrooms
            </button>
            <button
              onClick={() => setActiveCategory('technology')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategory === 'technology'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ICT Lab
            </button>
            <button
              onClick={() => setActiveCategory('culture')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategory === 'culture'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Culture Field
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              onClick={() => setSelectedFacility(fac)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img
                  src={fac.imageSrc}
                  alt={fac.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                  <span className="text-xs text-white font-medium flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" /> View Photo
                  </span>
                  <span className="text-[11px] text-amber-300 capitalize font-mono">
                    {fac.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display group-hover:text-blue-700 transition-colors">
                    {fac.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {fac.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Mugina Campus, Kamonyi</span>
                  <span className="text-blue-700 font-semibold">Inspect →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <GalleryLightbox
        item={selectedFacility}
        onClose={() => setSelectedFacility(null)}
      />

      {/* 5. Bottom Invitation */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900 font-display">
          Want to see our students and classrooms in person?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          We invite you and your child for a scheduled campus tour. Experience our nurturing atmosphere, meet teachers, and tour our computer lab.
        </p>
        <button
          onClick={onOpenTour}
          className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors"
        >
          Book a Campus Tour
        </button>
      </div>
    </div>
  );
};
