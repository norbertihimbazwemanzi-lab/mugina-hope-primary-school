import React, { useState, useMemo } from 'react';
import { ACADEMIC_GRADES } from '../data/schoolData';
import { AcademicGrade } from '../types';
import { Calculator, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AgeCalculatorProps {
  onSelectGradeForApplication: (gradeCode: string) => void;
}

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ onSelectGradeForApplication }) => {
  // Current reference year: 2026
  const currentYear = 2026;
  const [birthYear, setBirthYear] = useState<number>(2020);
  const [birthMonth, setBirthMonth] = useState<number>(1);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate age as of January of academic year
  const calculatedAge = useMemo(() => {
    return Math.max(0, currentYear - birthYear);
  }, [birthYear, currentYear]);

  // Determine recommended grade
  const recommendation = useMemo<{
    grade: AcademicGrade | null;
    status: 'nursery' | 'primary' | 'too-young' | 'secondary-ready';
    message: string;
  }>(() => {
    if (calculatedAge < 3) {
      return {
        grade: null,
        status: 'too-young',
        message: 'Your child is under 3 years old. Our early nursery intake starts at age 3 for Baby Class. We welcome early inquiries and daycare consultations!'
      };
    }
    if (calculatedAge === 3) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'N-BABY') || null,
        status: 'nursery',
        message: 'Ideal age for Baby Class! Focused on playful socialization, gentle vocabulary, and joyful discovery.'
      };
    }
    if (calculatedAge === 4) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'N-MID') || null,
        status: 'nursery',
        message: 'Ideal age for Middle Class! Developing early phonics, counting 1–20, and structured cooperative play.'
      };
    }
    if (calculatedAge === 5) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'N-TOP') || null,
        status: 'nursery',
        message: 'Ideal age for Pre-Primary (Top Class)! Complete school-readiness program preparing your child for Primary 1.'
      };
    }
    if (calculatedAge === 6) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'P1') || null,
        status: 'primary',
        message: 'Eligible for Primary 1 (P1). Official commencement of primary education under Rwanda National Curriculum (REB).'
      };
    }
    if (calculatedAge === 7) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'P2') || null,
        status: 'primary',
        message: 'Eligible for Primary 2 (P2). Solidifying reading comprehension, mathematics, and introductory digital skills.'
      };
    }
    if (calculatedAge === 8) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'P3') || null,
        status: 'primary',
        message: 'Eligible for Primary 3 (P3). Transition to full English instruction and advanced problem-solving.'
      };
    }
    if (calculatedAge === 9) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'P4') || null,
        status: 'primary',
        message: 'Eligible for Primary 4 (P4). Upper primary curriculum with specialized science and French basics.'
      };
    }
    if (calculatedAge === 10) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'P5') || null,
        status: 'primary',
        message: 'Eligible for Primary 5 (P5). Academic rigor and preliminary national examination training.'
      };
    }
    if (calculatedAge === 11 || calculatedAge === 12) {
      return {
        grade: ACADEMIC_GRADES.find(g => g.code === 'P6') || null,
        status: 'primary',
        message: 'Eligible for Primary 6 (P6) candidate class. Intensive PLE examination revision and high secondary placement.'
      };
    }

    return {
      grade: null,
      status: 'secondary-ready',
      message: 'At age 13+, learners have usually completed primary school. Contact our admissions desk for placement advice or transfer evaluation.'
    };
  }, [calculatedAge]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-display">
            Interactive Grade & Class Placement Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Select your child&apos;s birth year to instantly view the recommended Rwanda National Curriculum class.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Selector Panel */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/70 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Child&apos;s Birth Year
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014].map((year) => {
                const isSelected = birthYear === year;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setBirthYear(year)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-sm ring-2 ring-blue-700/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Birth Month
            </label>
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(Number(e.target.value))}
              className="w-full text-xs sm:text-sm font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              {months.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>Calculated Age:</span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              ~ {calculatedAge} {calculatedAge === 1 ? 'Year' : 'Years'} Old
            </span>
          </div>
        </div>

        {/* Output & Recommendation Card */}
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 rounded-xl p-6 border border-blue-100/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Enrollment Placement
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Academic Year 2026/2027
            </span>
          </div>

          {recommendation.grade ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-slate-900 font-display">
                    {recommendation.grade.name}
                  </h4>
                  <span className="text-xs font-semibold text-blue-700">
                    ({recommendation.grade.level})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {recommendation.message}
                </p>
              </div>

              {/* Key Milestones */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Key Curriculum Focus:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {recommendation.grade.keySubjects.map((subj) => (
                    <span
                      key={subj}
                      className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Schedule */}
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Class Timetable: </span>
                <span className="font-mono text-slate-700">{recommendation.grade.schedule}</span>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSelectGradeForApplication(recommendation.grade!.code)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all"
                >
                  <span>Apply for {recommendation.grade.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              {recommendation.status === 'too-young' ? (
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
              )}
              <h4 className="text-lg font-bold text-slate-900">
                {recommendation.status === 'too-young' ? 'Under Kindergarten Age' : 'Primary Graduate'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {recommendation.message}
              </p>
              <button
                type="button"
                onClick={() => onSelectGradeForApplication('N-BABY')}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
              >
                Inquire about early nursery reservation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
