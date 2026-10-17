import React, { useState } from 'react';
import { ACADEMIC_GRADES, SCHOOL_INFO } from '../data/schoolData';
import { AgeCalculator } from '../components/AgeCalculator';
import { PageId, AcademicGrade } from '../types';
import {
  BookOpen,
  Laptop,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Baby,
  Languages
} from 'lucide-react';

interface AcademicsPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApplyWithGrade: (gradeCode: string) => void;
}

export const AcademicsPage: React.FC<AcademicsPageProps> = ({
  onNavigate,
  onOpenApplyWithGrade,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'nursery' | 'primary'>('all');
  const [selectedGrade, setSelectedGrade] = useState<AcademicGrade | null>(ACADEMIC_GRADES[0]);

  const filteredGrades = ACADEMIC_GRADES.filter((grade) => {
    if (activeTab === 'nursery') return grade.level === 'Nursery';
    if (activeTab === 'primary') return grade.level === 'Primary';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header & Curriculum Vision */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Academic Excellence
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display">
          Rwanda National Curriculum with Modern ICT & English Fluency
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Compliant with Rwanda Basic Education Board (REB) standards, enriched with practical digital literacy, STEM inquiry, trilingual fluency, and individualized learning tracks.
        </p>
      </div>

      {/* 2. Interactive Age Calculator Widget */}
      <section id="age-calculator-section" className="scroll-mt-24">
        <AgeCalculator onSelectGradeForApplication={onOpenApplyWithGrade} />
      </section>

      {/* 3. Curriculum Highlights Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            REB National Standards
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Full compliance with Rwanda’s competence-based curriculum, preparing students for critical thinking and national Primary Leaving Examinations (PLE).
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Laptop className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            Modern ICT & Smart Learning
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dedicated computer lab sessions starting from Lower Primary. Pupils learn keyboarding, educational software, digital research, and basic logic.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Languages className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            Trilingual Foundations
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            English medium instruction reinforced with French language introduction and rich Kinyarwanda cultural grammar and proverbs.
          </p>
        </div>
      </div>

      {/* 4. Detailed Program Breakdown: Nursery vs Primary */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Grade By Grade
            </span>
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Comprehensive Class Levels & Learning Outcomes
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Grades (9)
            </button>
            <button
              onClick={() => setActiveTab('nursery')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'nursery'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nursery (Baby to Top)
            </button>
            <button
              onClick={() => setActiveTab('primary')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'primary'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Primary (P1 to P6)
            </button>
          </div>
        </div>

        {/* Grades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGrades.map((grade) => {
            const isNursery = grade.level === 'Nursery';
            return (
              <div
                key={grade.code}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        isNursery
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {grade.level} · {grade.ageRange}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {grade.code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 font-display group-hover:text-blue-700 transition-colors">
                    {grade.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {grade.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Core Subjects:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {grade.keySubjects.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Learning Milestones:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {grade.learningGoals.map((goal, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {grade.schedule}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenApplyWithGrade(grade.code)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Academic Year Calendar / Term Dates */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                Academic Year Term Schedule
              </h3>
              <p className="text-xs text-slate-400">Aligned with Ministry of Education (MINEDUC) Calendar</p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400">
            Official 3-Term Academic Structure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-2">
            <div className="flex justify-between font-bold text-amber-300">
              <span>Term 1</span>
              <span>Jan – Apr</span>
            </div>
            <p className="text-slate-300">
              New learner orientation, diagnostic phonics & arithmetic assessments, inter-house sports commencement.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-2">
            <div className="flex justify-between font-bold text-amber-300">
              <span>Term 2</span>
              <span>May – Jul</span>
            </div>
            <p className="text-slate-300">
              Mid-year assessments, STEM science fair, Itorero traditional cultural dance festival, and reading week.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-2">
            <div className="flex justify-between font-bold text-amber-300">
              <span>Term 3</span>
              <span>Sep – Nov</span>
            </div>
            <p className="text-slate-300">
              National Examination (PLE) revision camps for P6, promotion assessments, and Annual Graduation Celebration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
