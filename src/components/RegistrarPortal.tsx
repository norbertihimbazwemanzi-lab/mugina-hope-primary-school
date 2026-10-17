import React, { useState, useMemo } from 'react';
import {
  EnrolledStudent,
  getEnrolledStudents,
  enrollStudentByDOS,
  updateEnrolledStudent,
  deleteEnrolledStudent,
  getCurrentSessionUser,
} from '../services/adminStore';
import { ACADEMIC_GRADES } from '../data/schoolData';
import {
  UserCheck,
  Plus,
  Search,
  Edit3,
  ArrowRightLeft,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Users,
  ShieldCheck,
  Building,
  GraduationCap,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface RegistrarPortalProps {
  students: EnrolledStudent[];
  onStudentsUpdated: () => void;
}

export const RegistrarPortal: React.FC<RegistrarPortalProps> = ({ students, onStudentsUpdated }) => {
  const sessionUser = getCurrentSessionUser();

  // Search and Grade filter
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Modal 1: Onboard New Student Web Form
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    fullName: '',
    gender: 'Female' as 'Male' | 'Female',
    dob: '2018-05-15',
    gradeCode: 'P1',
    parentName: '',
    parentPhone: '+250 78',
    parentEmail: '',
    feedbackNotes: '',
  });

  // Modal 2: Edit Profile & Fix Typos
  const [editingStudent, setEditingStudent] = useState<EnrolledStudent | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    gender: 'Female' as 'Male' | 'Female',
    dob: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    status: 'Active' as EnrolledStudent['status'],
    feedbackNotes: '',
  });

  // Modal 3: Dropdown Assignment Menu (Place / Move Learner into Respective Class)
  const [movingStudent, setMovingStudent] = useState<EnrolledStudent | null>(null);
  const [targetGradeCode, setTargetGradeCode] = useState<string>('P1');
  const [moveReason, setMoveReason] = useState<string>('Standard academic stream placement');

  // Feedback banner
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (gradeFilter !== 'ALL' && s.gradeCode !== gradeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.parentPhone.toLowerCase().includes(q)
      );
    });
  }, [students, gradeFilter, searchQuery]);

  // Handle Onboard New Student
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.fullName || !onboardForm.parentName) {
      alert('Please enter student name and parent name.');
      return;
    }

    const regSeq = Math.floor(100 + Math.random() * 900);
    const regNumber = `MHA-2026-${regSeq}`;
    const cleanName = onboardForm.fullName.toLowerCase().replace(/\s+/g, '.');

    enrollStudentByDOS({
      regNumber,
      fullName: onboardForm.fullName.trim(),
      gender: onboardForm.gender,
      dob: onboardForm.dob,
      gradeCode: onboardForm.gradeCode,
      parentName: onboardForm.parentName.trim(),
      parentPhone: onboardForm.parentPhone.trim(),
      parentEmail: onboardForm.parentEmail.trim() || `${cleanName}.parent@gmail.com`,
      studentUsername: cleanName,
      studentPassword: 'student@2026',
      enrolledBy: `${sessionUser?.name || 'Chantal Mukashyaka'} (Registrar)`,
      status: 'Active',
      feedbackNotes: onboardForm.feedbackNotes.trim() || undefined,
    });

    setSuccessMsg(
      `Learner ${onboardForm.fullName} successfully enrolled into ${onboardForm.gradeCode} with Registration Number ${regNumber} and saved to database.`
    );
    setShowOnboardModal(false);
    setOnboardForm({
      fullName: '',
      gender: 'Female',
      dob: '2018-05-15',
      gradeCode: 'P1',
      parentName: '',
      parentPhone: '+250 78',
      parentEmail: '',
      feedbackNotes: '',
    });
    onStudentsUpdated();
  };

  // Open Edit Profile
  const handleOpenEdit = (student: EnrolledStudent) => {
    setEditingStudent(student);
    setEditForm({
      fullName: student.fullName,
      gender: student.gender,
      dob: student.dob || '',
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      status: student.status,
      feedbackNotes: student.feedbackNotes || '',
    });
  };

  // Save Edit Profile
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    updateEnrolledStudent(editingStudent.id, {
      fullName: editForm.fullName.trim(),
      gender: editForm.gender,
      dob: editForm.dob,
      parentName: editForm.parentName.trim(),
      parentPhone: editForm.parentPhone.trim(),
      parentEmail: editForm.parentEmail.trim(),
      status: editForm.status,
      feedbackNotes: editForm.feedbackNotes.trim() || undefined,
    });

    setSuccessMsg(`Learner profile for ${editForm.fullName} updated and synced with database.`);
    setEditingStudent(null);
    onStudentsUpdated();
  };

  // Open Move Class Assignment
  const handleOpenMove = (student: EnrolledStudent) => {
    setMovingStudent(student);
    setTargetGradeCode(student.gradeCode);
    setMoveReason('Stream reallocation based on academic evaluation');
  };

  // Save Class Assignment Move
  const handleSaveMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingStudent) return;

    const prevGrade = movingStudent.gradeCode;
    updateEnrolledStudent(movingStudent.id, {
      gradeCode: targetGradeCode,
      feedbackNotes: `${movingStudent.feedbackNotes ? movingStudent.feedbackNotes + ' | ' : ''}Reassigned from ${prevGrade} to ${targetGradeCode} by Registrar (${moveReason})`,
    });

    setSuccessMsg(
      `Learner ${movingStudent.fullName} moved from ${prevGrade} to ${targetGradeCode} successfully and saved to database.`
    );
    setMovingStudent(null);
    onStudentsUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Registrar Portal • Admissions & Enrollment Suite</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white">
              Student Admissions & Class Assignment Suite
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Onboard new applicants, edit learner profiles and parent contacts to fix typos, and utilize the dropdown assignment menu to place or move learners into their classes.
            </p>
          </div>

          {/* Action: Onboard New Student */}
          <button
            type="button"
            onClick={() => setShowOnboardModal(true)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Onboard New Student</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">Total Learners</span>
            <span className="text-xl font-black font-mono text-purple-300">{students.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">Active Enrolled</span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {students.filter((s) => s.status === 'Active').length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">Primary Classes</span>
            <span className="text-sm font-black font-mono text-white">P1 - P6 (6 Grades)</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">Nursery Classes</span>
            <span className="text-sm font-black font-mono text-white">Baby, Mid, Top</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-xs text-emerald-900 font-semibold">{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search learner by name, reg #, parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:bg-white focus:outline-hidden focus:border-purple-600 font-medium"
            />
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Classes ({students.length})</option>
              {ACADEMIC_GRADES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.name} ({students.filter((s) => s.gradeCode === g.code).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Learner Profiles Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Reg Number</th>
                <th className="p-3.5">Learner Profile</th>
                <th className="p-3.5">Gender & DOB</th>
                <th className="p-3.5">Current Class</th>
                <th className="p-3.5">Parent / Contact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Action Menus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-900">{s.regNumber}</td>
                  <td className="p-3.5">
                    <strong className="block font-bold text-slate-900">{s.fullName}</strong>
                    <span className="text-[10px] font-mono text-slate-400">User: {s.studentUsername}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      s.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {s.gender}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{s.dob || 'N/A'}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-purple-50 text-purple-900 border border-purple-200">
                      {s.gradeCode}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <strong className="block font-semibold text-slate-800">{s.parentName}</strong>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{s.parentPhone}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Action 1: Edit Profile & Fix Typos */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Edit learner profile, fix typos in name, or update contact info"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {/* Action 2: Dropdown Assignment Menu (Place / Move Learner) */}
                      <button
                        type="button"
                        onClick={() => handleOpenMove(s)}
                        className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Move learner into another class stream"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Move Class</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ONBOARD NEW STUDENT WEB FORM */}
      {/* ========================================================================= */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 block">
                  Registrar Suite • Core Web Form
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Onboard New Student / Applicant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mugisha Christian"
                    value={onboardForm.fullName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:border-purple-600 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Gender *
                  </label>
                  <select
                    value={onboardForm.gender}
                    onChange={(e) => setOnboardForm({ ...onboardForm, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={onboardForm.dob}
                    onChange={(e) => setOnboardForm({ ...onboardForm, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-hidden"
                  />
                </div>

                {/* Class Placement Dropdown */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Initial Class Placement (Dropdown Menu) *
                  </label>
                  <select
                    value={onboardForm.gradeCode}
                    onChange={(e) => setOnboardForm({ ...onboardForm, gradeCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-purple-600"
                  >
                    {ACADEMIC_GRADES.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.name} ({g.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jean Pierre Nshimiyimana"
                    value={onboardForm.parentName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, parentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+250 788 000 000"
                    value={onboardForm.parentPhone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, parentPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent Email (for attendance alerts)
                  </label>
                  <input
                    type="email"
                    placeholder="parent@gmail.com"
                    value={onboardForm.parentEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, parentEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Admissions Notes / Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any health allergies, previous school transfer remarks..."
                    value={onboardForm.feedbackNotes}
                    onChange={(e) => setOnboardForm({ ...onboardForm, feedbackNotes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Onboard & Assign Reg Number</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT PROFILE & FIX TYPOS */}
      {/* ========================================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block">
                  Action Menu • Registrar
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Edit Profile & Fix Contact Details
                </h3>
                <p className="text-xs font-mono text-slate-400">Reg: {editingStudent.regNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Learner Full Name (Correct Spelling) *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-bold focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.parentName}
                  onChange={(e) => setEditForm({ ...editForm, parentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.parentPhone}
                    onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono rounded-xl px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    value={editForm.parentEmail}
                    onChange={(e) => setEditForm({ ...editForm, parentEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enrollment Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Awaiting Approval">Awaiting Approval</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DROPDOWN ASSIGNMENT MENU (PLACE OR MOVE LEARNER INTO CLASS) */}
      {/* ========================================================================= */}
      {movingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 block">
                  Dropdown Assignment Menu
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Move Learner into Respective Class
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMovingStudent(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Learner</span>
              <strong className="block text-slate-900 text-sm">{movingStudent.fullName}</strong>
              <div className="flex items-center gap-2 font-mono text-slate-600">
                <span>{movingStudent.regNumber}</span>
                <span>•</span>
                <span>Current Class: <strong>{movingStudent.gradeCode}</strong></span>
              </div>
            </div>

            <form onSubmit={handleSaveMove} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select New Target Class (Placement Menu) *
                </label>
                <select
                  value={targetGradeCode}
                  onChange={(e) => setTargetGradeCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:border-purple-600"
                >
                  {ACADEMIC_GRADES.map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transfer / Reassignment Reason
                </label>
                <input
                  type="text"
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  placeholder="e.g. End of term promotion, academic reassessment..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setMovingStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Class Move</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
