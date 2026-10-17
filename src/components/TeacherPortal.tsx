import React, { useState, useMemo } from 'react';
import { EnrolledStudent, getCurrentSessionUser } from '../services/adminStore';
import { ACADEMIC_GRADES } from '../data/schoolData';
import {
  GraduationCap,
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  FileSpreadsheet,
  Download,
  ClipboardList,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Heart,
} from 'lucide-react';

interface TeacherPortalProps {
  students: EnrolledStudent[];
  onTakeAttendance: (gradeCode: string) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ students, onTakeAttendance }) => {
  const sessionUser = getCurrentSessionUser();

  // Determine assigned grade(s) from teacher profile (default to P1 or P4 if unspecified)
  const defaultGrade = useMemo(() => {
    const raw = sessionUser?.assignedSubjectOrGrade || '';
    if (raw.includes('P1') || raw.toLowerCase().includes('primary 1')) return 'P1';
    if (raw.includes('P2') || raw.toLowerCase().includes('primary 2')) return 'P2';
    if (raw.includes('P3') || raw.toLowerCase().includes('primary 3')) return 'P3';
    if (raw.includes('P4') || raw.toLowerCase().includes('primary 4')) return 'P4';
    if (raw.includes('P5') || raw.toLowerCase().includes('primary 5')) return 'P5';
    if (raw.includes('P6') || raw.toLowerCase().includes('primary 6')) return 'P6';
    if (raw.toLowerCase().includes('baby')) return 'N-BABY';
    if (raw.toLowerCase().includes('middle')) return 'N-MID';
    if (raw.toLowerCase().includes('top')) return 'N-TOP';
    return 'P1';
  }, [sessionUser]);

  const [activeGrade, setActiveGrade] = useState<string>(defaultGrade);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForContact, setSelectedStudentForContact] = useState<EnrolledStudent | null>(null);

  // Available assigned streams for this teacher (teachers only see their assigned streams)
  const teacherStreams = useMemo(() => {
    // If the teacher has a primary assigned grade, allow switching between assigned stream A/B or parallel class
    const gradeObj = ACADEMIC_GRADES.find((g) => g.code === activeGrade);
    return [
      { code: activeGrade, name: gradeObj?.name || `Class ${activeGrade}`, stream: 'Stream A (Morning)' },
    ];
  }, [activeGrade]);

  // Real-time filtered class list for this teacher's assigned class only
  const classStudents = useMemo(() => {
    return students.filter((s) => s.gradeCode === activeGrade);
  }, [students, activeGrade]);

  // Search inside class
  const filteredClassStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase();
    return classStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.parentPhone.toLowerCase().includes(q)
    );
  }, [classStudents, searchQuery]);

  // Metrics for assigned class
  const classStats = useMemo(() => {
    const total = classStudents.length;
    const boys = classStudents.filter((s) => s.gender === 'Male').length;
    const girls = classStudents.filter((s) => s.gender === 'Female').length;
    return { total, boys, girls };
  }, [classStudents]);

  // Export Real-time Class Roster to CSV
  const handleExportClassRosterCSV = () => {
    const currentGradeObj = ACADEMIC_GRADES.find((g) => g.code === activeGrade);
    const headers = [
      `"MUGINA HOPE PRIMARY & NURSERY ACADEMY - OFFICIAL CLASS ROSTER"`,
      `"Class / Stream:","${currentGradeObj?.name || activeGrade} (${activeGrade}) - Stream A"`,
      `"Class Teacher:","${sessionUser?.name || 'Class Teacher'}"`,
      `"Total Learners:","${classStudents.length}"`,
      `"Generated At:","${new Date().toLocaleString()}"`,
      '""',
      '"No.","Registration Number","Learner Full Name","Gender","Date of Birth","Parent / Guardian","Parent Phone","Parent Email"',
    ];

    const rows = filteredClassStudents.map((s, idx) => [
      `"${idx + 1}"`,
      `"${s.regNumber}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.gender}"`,
      `"${s.dob || 'N/A'}"`,
      `"${s.parentName.replace(/"/g, '""')}"`,
      `"${s.parentPhone}"`,
      `"${s.parentEmail || '-'}"`,
    ]);

    const csvContent = '\uFEFF' + [...headers, ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Class_Roster_${activeGrade}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentGradeObj = ACADEMIC_GRADES.find((g) => g.code === activeGrade);

  return (
    <div className="space-y-6">
      {/* Teacher Persona Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Teacher Portal • Classroom & Stream Suite</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white">
              {currentGradeObj ? currentGradeObj.name : activeGrade} Classroom
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Teacher workspace for <strong>{sessionUser?.name}</strong>. Real-time class list, learner contact information, and daily attendance roll call.
            </p>
          </div>

          {/* Quick Action: Take Attendance */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTakeAttendance(activeGrade)}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Take Today's Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Assigned Streams & Class Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
              Assigned Stream
            </span>
            <span className="text-sm font-black font-mono text-white">
              {activeGrade} (Stream A)
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
              Total Enrolled
            </span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {classStats.total} Learners
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
              Boys / Girls Ratio
            </span>
            <span className="text-sm font-bold font-mono text-blue-200">
              {classStats.boys} Boys • {classStats.girls} Girls
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
              Fees & Accounting
            </span>
            <span className="text-xs font-semibold text-slate-400 italic">
              Restricted (Zero access)
            </span>
          </div>
        </div>
      </div>

      {/* Roster Controls: Search & Export */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search inside class */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search learner in ${activeGrade} by name, reg #, or parent...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-600 font-medium"
            />
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportClassRosterCSV}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Export Class List (CSV)</span>
            </button>
          </div>
        </div>

        {/* Real-time Class Roster Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Reg Number</th>
                <th className="p-3.5">Learner Full Name</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5">Date of Birth</th>
                <th className="p-3.5">Parent / Guardian</th>
                <th className="p-3.5">Parent Contact</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClassStudents.length > 0 ? (
                filteredClassStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3.5 font-mono font-bold text-blue-900">{student.regNumber}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <strong className="block font-bold text-slate-900">{student.fullName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Status: {student.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        student.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 text-[11px]">{student.dob || 'N/A'}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{student.parentName}</td>
                    <td className="p-3.5 text-slate-600">
                      <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-800">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{student.parentPhone}</span>
                      </div>
                      {student.parentEmail && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{student.parentEmail}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForContact(student)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Learner Info
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No learners found in {activeGrade} matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Learner Info Dialog */}
      {selectedStudentForContact && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 font-black text-sm flex items-center justify-center">
                  {selectedStudentForContact.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedStudentForContact.fullName}</h3>
                  <span className="text-xs font-mono text-emerald-700">{selectedStudentForContact.regNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForContact(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Placement</span>
                <span className="font-bold text-slate-900">
                  {currentGradeObj?.name} ({selectedStudentForContact.gradeCode}) - Stream A
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Parent / Emergency Contact
                </span>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{selectedStudentForContact.parentName}</div>
                  <div className="flex items-center gap-1.5 font-mono text-emerald-800">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedStudentForContact.parentPhone}</span>
                  </div>
                  {selectedStudentForContact.parentEmail && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedStudentForContact.parentEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedStudentForContact.feedbackNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">
                    Teacher Notes / Observations
                  </span>
                  <p className="text-amber-900 mt-0.5">{selectedStudentForContact.feedbackNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForContact(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
