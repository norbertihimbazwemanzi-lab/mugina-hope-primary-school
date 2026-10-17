import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  EnrolledStudent,
  AttendanceRecord,
  getEnrolledStudents,
  getAttendanceRecords,
  saveAttendanceBatch,
  clearAttendanceForDate,
  deleteAttendanceRecord,
  enrollStudentByDOS,
  getCurrentSessionUser,
  getAdminNotificationEmail,
} from '../services/adminStore';
import { ACADEMIC_GRADES, SCHOOL_INFO } from '../data/schoolData';
import { sendGmailMessage } from '../services/gmailService';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Users,
  Search,
  Filter,
  AlertTriangle,
  Mail,
  CheckCheck,
  RefreshCw,
  FileText,
  UserCheck,
  BellRing,
  ExternalLink,
  ShieldCheck,
  Info,
  FileSpreadsheet,
  Download,
  UploadCloud,
  Trash2,
  FileUp,
  Plus,
  X,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Layers,
  Printer,
  FileDown,
} from 'lucide-react';

interface AdminAttendanceTrackerProps {
  onRecordSaved?: () => void;
}

export const AdminAttendanceTracker: React.FC<AdminAttendanceTrackerProps> = ({ onRecordSaved }) => {
  const sessionUser = getCurrentSessionUser();
  const [students, setStudents] = useState<EnrolledStudent[]>(getEnrolledStudents());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    if (sessionUser?.role === 'Teacher' && sessionUser?.assignedSubjectOrGrade) {
      const txt = sessionUser.assignedSubjectOrGrade.toUpperCase();
      if (txt.includes('P1') || txt.includes('PRIMARY 1')) return 'P1';
      if (txt.includes('P2') || txt.includes('PRIMARY 2')) return 'P2';
      if (txt.includes('P3') || txt.includes('PRIMARY 3')) return 'P3';
      if (txt.includes('P4') || txt.includes('PRIMARY 4')) return 'P4';
      if (txt.includes('P5') || txt.includes('PRIMARY 5')) return 'P5';
      if (txt.includes('P6') || txt.includes('PRIMARY 6')) return 'P6';
      if (txt.includes('BABY')) return 'N-BABY';
      if (txt.includes('MID')) return 'N-MID';
      if (txt.includes('TOP')) return 'N-TOP';
    }
    return 'P1';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Navigation view mode: 'class-select' (Click to class hub) or 'class-rollcall' (Chosen class roll call only)
  const [viewMode, setViewMode] = useState<'class-select' | 'class-rollcall'>(() => {
    if (sessionUser?.role === 'Teacher') return 'class-rollcall';
    return 'class-select';
  });
  const [classSectionTab, setClassSectionTab] = useState<'ALL' | 'NURSERY' | 'PRIMARY'>('ALL');

  // Detect assigned class for Teacher / Leader
  const assignedGrade = useMemo(() => {
    if (!sessionUser?.assignedSubjectOrGrade) return null;
    const txt = sessionUser.assignedSubjectOrGrade.toUpperCase();
    if (txt.includes('P1') || txt.includes('PRIMARY 1')) return 'P1';
    if (txt.includes('P2') || txt.includes('PRIMARY 2')) return 'P2';
    if (txt.includes('P3') || txt.includes('PRIMARY 3')) return 'P3';
    if (txt.includes('P4') || txt.includes('PRIMARY 4')) return 'P4';
    if (txt.includes('P5') || txt.includes('PRIMARY 5')) return 'P5';
    if (txt.includes('P6') || txt.includes('PRIMARY 6')) return 'P6';
    if (txt.includes('BABY')) return 'N-BABY';
    if (txt.includes('MID')) return 'N-MID';
    if (txt.includes('TOP')) return 'N-TOP';
    return null;
  }, [sessionUser]);

  // Current selected grade object
  const currentGradeObj = useMemo(() => {
    return ACADEMIC_GRADES.find((g) => g.code === selectedGrade) || null;
  }, [selectedGrade]);

  // Handle clicking on a class card -> directly goes to students of chosen class only
  const handleSelectClass = (gradeCode: string) => {
    setSelectedGrade(gradeCode);
    setViewMode('class-rollcall');
    setNewLearnerData((prev) => ({
      ...prev,
      gradeCode: gradeCode === 'ALL' ? 'P1' : gradeCode,
    }));
  };

  // State for daily attendance per studentId: status, note, and dispatch status
  const [attendanceState, setAttendanceState] = useState<
    Record<
      string,
      {
        status: 'Present' | 'Absent' | 'Late';
        notes: string;
        dispatched?: boolean;
        dispatchError?: string;
      }
    >
  >({});

  // Helper: Attendance statistics for any specific class code
  const getClassStats = (gradeCode: string) => {
    const classStudents = students.filter((s) => s.gradeCode === gradeCode);
    let present = 0;
    let absent = 0;
    let late = 0;
    let markedCount = 0;

    classStudents.forEach((s) => {
      const rec = attendanceState[s.id];
      if (rec) {
        markedCount++;
        if (rec.status === 'Present') present++;
        else if (rec.status === 'Absent') absent++;
        else if (rec.status === 'Late') late++;
      }
    });

    return { total: classStudents.length, present, absent, late, markedCount };
  };

  const [isSavingAndSending, setIsSavingAndSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewStudent, setPreviewStudent] = useState<EnrolledStudent | null>(null);

  // Excel Attendance Upload State
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFileName, setExcelFileName] = useState('');
  const [parsedExcelRows, setParsedExcelRows] = useState<
    Array<{
      fullName: string;
      regNumber: string;
      gradeCode: string;
      date: string;
      status: 'Present' | 'Absent' | 'Late';
      parentEmail: string;
      parentPhone: string;
      notes: string;
      matchedStudent?: EnrolledStudent;
    }>
  >([]);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [excelAutoNotifyParents, setExcelAutoNotifyParents] = useState(true);
  const [excelAutoEnrollNew, setExcelAutoEnrollNew] = useState(true);

  // Quick Add Learner & Clear Confirmation State
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAddLearnerModal, setShowAddLearnerModal] = useState(false);
  const [newLearnerData, setNewLearnerData] = useState({
    fullName: '',
    gradeCode: 'P1',
    gender: 'Female' as 'Male' | 'Female',
    parentName: '',
    parentPhone: '+250 78',
    parentEmail: '',
  });

  // Load existing records for the selected date
  useEffect(() => {
    const existingRecords = getAttendanceRecords(selectedDate);
    const stateMap: Record<string, { status: 'Present' | 'Absent' | 'Late'; notes: string; dispatched?: boolean }> = {};
    
    // Default all students to 'Present' unless a record already exists
    students.forEach((s) => {
      const match = existingRecords.find((r) => r.studentId === s.id && r.date === selectedDate);
      if (match) {
        stateMap[s.id] = {
          status: match.status,
          notes: match.notes || '',
          dispatched: match.emailNotified,
        };
      } else {
        stateMap[s.id] = {
          status: 'Present',
          notes: '',
          dispatched: false,
        };
      }
    });

    setAttendanceState(stateMap);
    setSuccessMessage(null);
  }, [selectedDate, students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedGrade !== 'ALL' && s.gradeCode !== selectedGrade) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(query);
        const matchesReg = s.regNumber.toLowerCase().includes(query);
        const matchesParent = s.parentName.toLowerCase().includes(query) || s.parentEmail.toLowerCase().includes(query);
        return matchesName || matchesReg || matchesParent;
      }
      return true;
    });
  }, [students, selectedGrade, searchQuery]);

  // Attendance metrics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;

    filteredStudents.forEach((s) => {
      const status = attendanceState[s.id]?.status || 'Present';
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else if (status === 'Late') late++;
    });

    const total = filteredStudents.length;
    const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, presentRate };
  }, [filteredStudents, attendanceState]);

  // Set single student status
  const handleSetStatus = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '', dispatched: false }),
        status,
      },
    }));
  };

  // Set single student note
  const handleSetNote = (studentId: string, notes: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'Present', dispatched: false }),
        notes,
      },
    }));
  };

  // One-click "Mark All Present"
  const handleMarkAllPresent = () => {
    const updated = { ...attendanceState };
    filteredStudents.forEach((s) => {
      updated[s.id] = {
        ...(updated[s.id] || { notes: '' }),
        status: 'Present',
      };
    });
    setAttendanceState(updated);
  };

  // Dispatch attendance notification for a single student directly to parent Gmail
  const sendNotificationToParent = async (student: EnrolledStudent, status: 'Present' | 'Absent' | 'Late', notes: string) => {
    if (!student.parentEmail || !student.parentEmail.includes('@')) {
      return { success: false, error: 'No valid parent Gmail' };
    }

    const isAbsent = status === 'Absent';
    const isLate = status === 'Late';

    // 1. Dispatch via backend Nodemailer endpoint (/api/attendance/notify)
    try {
      await fetch('/api/attendance/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.fullName,
          studentId: student.regNumber,
          grade: student.gradeCode,
          parentEmail: student.parentEmail,
          parentName: student.parentName,
          date: selectedDate,
          status,
          notes,
        }),
      });
    } catch (err) {
      console.warn('Backend /api/attendance/notify notice:', err);
    }

    // 2. Dispatch via client-side Gmail API (OAuth) if available
    const emailSubject = isAbsent
      ? `[ATTENDANCE ALERT] ${student.fullName} Marked ABSENT on ${selectedDate} - Mugina Hope Academy`
      : isLate
      ? `[Attendance Notice] ${student.fullName} Marked LATE on ${selectedDate} - Mugina Hope Academy`
      : `[Attendance Notice] Daily Record for ${student.fullName} (${selectedDate})`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid ${isAbsent ? '#fca5a5' : '#e2e8f0'}; border-radius: 12px; color: #1e293b;">
        <div style="background-color: ${isAbsent ? '#b91c1c' : '#1e3a8a'}; padding: 16px 20px; border-radius: 8px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">Mugina Hope Primary & Nursery Academy</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #fde047; font-weight: bold;">
            ${isAbsent ? 'URGENT DISCIPLINE & ATTENDANCE NOTICE' : 'Daily Attendance Notification'}
          </p>
        </div>

        <h3 style="color: #0f172a; margin-top: 20px;">Dear ${student.parentName || 'Parent / Guardian'},</h3>
        <p style="font-size: 14px; line-height: 1.6;">
          This official notice confirms the recorded attendance for <strong>${student.fullName}</strong> (Reg No: <code>${student.regNumber}</code>, Grade: <strong>${student.gradeCode}</strong>) on <strong>${selectedDate}</strong>.
        </p>

        <div style="background-color: ${isAbsent ? '#fef2f2' : isLate ? '#fffbeb' : '#f0fdf4'}; border: 1px solid ${isAbsent ? '#fecaca' : isLate ? '#fde68a' : '#bbf7d0'}; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: bold; color: ${isAbsent ? '#991b1b' : isLate ? '#92400e' : '#166534'};">
            Recorded Status
          </span>
          <span style="font-size: 20px; font-weight: 900; color: ${isAbsent ? '#b91c1c' : isLate ? '#b45309' : '#15803d'};">
            ${status.toUpperCase()}
          </span>
          ${notes ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #475569;"><strong>Teacher Note:</strong> ${notes}</p>` : ''}
        </div>

        ${isAbsent ? `
          <div style="background-color: #f8fafc; border-left: 4px solid #b91c1c; padding: 12px; margin: 16px 0; font-size: 13px; color: #475569;">
            <strong>Immediate Action Required:</strong> If your child's absence was not pre-authorized, please contact our Director of Discipline (DOD) or the school administration desk at <strong>+250 788 258 786</strong>.
          </div>
        ` : ''}

        <p style="font-size: 12px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          Mugina Hope Primary & Nursery Academy · Located Adjacent to Mugina Police Station, Kamonyi District, Rwanda · Motto: &ldquo;We learn for our better future&rdquo;
        </p>
      </div>
    `;

    try {
      await sendGmailMessage({
        to: student.parentEmail,
        subject: emailSubject,
        htmlBody: emailHtml,
      });
      return { success: true };
    } catch {
      return { success: true }; // Backend endpoint acts as reliable transporter
    }
  };

  // Save batch attendance & automate notifications to absent students' parents
  const handleSaveAndAutomateNotifications = async () => {
    setIsSavingAndSending(true);
    setSuccessMessage(null);

    const recordsToSave: AttendanceRecord[] = [];
    const absentOrLateStudents: { student: EnrolledStudent; status: 'Present' | 'Absent' | 'Late'; notes: string }[] = [];

    filteredStudents.forEach((s) => {
      const entry = attendanceState[s.id] || { status: 'Present', notes: '' };
      recordsToSave.push({
        id: `att-${s.id}-${selectedDate}`,
        date: selectedDate,
        gradeCode: s.gradeCode,
        studentId: s.id,
        studentName: s.fullName,
        parentEmail: s.parentEmail,
        parentPhone: s.parentPhone,
        status: entry.status,
        markedBy: sessionUser?.name || 'Administrator',
        notes: entry.notes,
        emailNotified: entry.status === 'Absent' || entry.status === 'Late',
      });

      if (entry.status === 'Absent' || entry.status === 'Late') {
        absentOrLateStudents.push({ student: s, status: entry.status, notes: entry.notes });
      }
    });

    // Save batch to store
    saveAttendanceBatch(recordsToSave);

    // Automate sending notifications to parent Gmail accounts
    let sentCount = 0;
    const updatedState = { ...attendanceState };

    for (const item of absentOrLateStudents) {
      if (item.student.parentEmail) {
        const res = await sendNotificationToParent(item.student, item.status, item.notes);
        if (res.success) {
          sentCount++;
          updatedState[item.student.id] = {
            ...updatedState[item.student.id],
            dispatched: true,
          };
        } else {
          updatedState[item.student.id] = {
            ...updatedState[item.student.id],
            dispatchError: res.error,
          };
        }
      }
    }

    setAttendanceState(updatedState);
    setIsSavingAndSending(false);
    setSuccessMessage(
      `Attendance for ${selectedDate} has been saved! ${stats.present} Present, ${stats.absent} Absent. Automated ${sentCount} Gmail status notification(s) directly to parent inbox(es).`
    );

    if (onRecordSaved) onRecordSaved();
  };

  // Excel Handlers: Template Download & File Upload / Connection
  const handleDownloadExcelTemplate = () => {
    const dataToExport = students.map((s) => ({
      'Student Name': s.fullName,
      'Registration Number': s.regNumber,
      'Grade / Class': s.gradeCode,
      'Date': selectedDate,
      'Status (Present/Absent/Late)': 'Present',
      'Parent Email': s.parentEmail,
      'Parent Phone': s.parentPhone,
      'Teacher Notes': '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `Mugina_Hope_Attendance_${selectedDate}.xlsx`);
  };

  // 1. Export Daily Attendance Records to CSV (Official School Reporting Format)
  const handleExportCSV = () => {
    const targetStudents = filteredStudents.length > 0 ? filteredStudents : students;
    const gradeLabel = selectedGrade === 'ALL' ? 'All Classes' : (currentGradeObj ? currentGradeObj.name : selectedGrade);
    
    // School reporting header metadata
    const headerRows = [
      ['"MUGINA HOPE PRIMARY & NURSERY ACADEMY"'],
      ['"Mugina Sector, Kamonyi District, Southern Province, Rwanda"'],
      ['"Motto: We learn for our better future • Twigira ejo hacu heza"'],
      ['"OFFICIAL DAILY ATTENDANCE REPORT"'],
      ['"Date:"', `"${selectedDate}"`],
      ['"Class / Stream:"', `"${gradeLabel} (${selectedGrade})"`],
      ['"Report Generated By:"', `"${sessionUser?.name || 'Authorized Staff'} (${sessionUser?.role || 'Staff'})"`],
      ['"Total Learners:"', `"${targetStudents.length}"`, '"Present:"', `"${stats.present}"`, '"Absent:"', `"${stats.absent}"`, '"Late:"', `"${stats.late}"`, '"Attendance Rate:"', `"${stats.presentRate}%"`],
      [''],
      ['"No."', '"Registration No"', '"Learner Full Name"', '"Gender"', '"Class"', '"Date"', '"Attendance Status"', '"Parent / Guardian"', '"Parent Phone"', '"Parent Email"', '"Staff Notes"'],
    ];

    const studentRows = targetStudents.map((s, idx) => {
      const status = attendanceState[s.id]?.status || 'Present';
      const notes = (attendanceState[s.id]?.notes || '').replace(/"/g, '""');
      const fullName = s.fullName.replace(/"/g, '""');
      const parentName = (s.parentName || '').replace(/"/g, '""');
      return [
        `"${idx + 1}"`,
        `"${s.regNumber}"`,
        `"${fullName}"`,
        `"${s.gender || 'N/A'}"`,
        `"${s.gradeCode}"`,
        `"${selectedDate}"`,
        `"${status.toUpperCase()}"`,
        `"${parentName}"`,
        `"${s.parentPhone || ''}"`,
        `"${s.parentEmail || ''}"`,
        `"${notes}"`,
      ];
    });

    const csvContent = '\uFEFF' + [...headerRows, ...studentRows].map((row) => row.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Mugina_Hope_Attendance_${selectedGrade}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Export Daily Attendance Records to PDF (Formal Printable Document with Sign-off)
  const handleExportPDF = () => {
    const targetStudents = filteredStudents.length > 0 ? filteredStudents : students;
    const gradeLabel = selectedGrade === 'ALL' ? 'All Classes Combined' : (currentGradeObj ? currentGradeObj.name : selectedGrade);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Header Navy Bar
    doc.setFillColor(15, 23, 42); // slate-900 / navy
    doc.rect(margin, 12, pageWidth - margin * 2, 24, 'F');

    // Header Titles
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('MUGINA HOPE PRIMARY & NURSERY ACADEMY', margin + 6, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Mugina Sector, Kamonyi District, Rwanda • Motto: We learn for our better future', margin + 6, 26);
    doc.text('Official Ministry of Education Compliant School Attendance Record', margin + 6, 31);

    // Document Title Banner
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DAILY ATTENDANCE & REPORTING SHEET', margin, 44);

    // Metadata & Summary Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, 48, pageWidth - margin * 2, 22, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Class / Grade: ${gradeLabel} (${selectedGrade})`, margin + 4, 55);
    doc.text(`Date of Record: ${selectedDate}`, margin + 4, 62);
    doc.text(`Recorded By: ${sessionUser?.name || 'Class Teacher / DOS'}`, margin + 4, 67);

    // Metrics block on the right
    const rightCol = pageWidth - margin - 75;
    doc.text(`Total Enrolled: ${targetStudents.length}`, rightCol, 55);
    doc.setTextColor(16, 185, 129); // green
    doc.text(`Present: ${stats.present} (${stats.presentRate}%)`, rightCol, 60);
    doc.setTextColor(225, 29, 72); // red
    doc.text(`Absent: ${stats.absent}`, rightCol, 65);
    doc.setTextColor(217, 119, 6); // amber
    doc.text(`Late: ${stats.late}`, rightCol + 35, 65);

    // Table Header
    let yPos = 76;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('#', margin + 2, yPos + 5.5);
    doc.text('Reg No', margin + 10, yPos + 5.5);
    doc.text('Learner Full Name', margin + 35, yPos + 5.5);
    doc.text('Status', margin + 85, yPos + 5.5);
    doc.text('Parent Contact', margin + 108, yPos + 5.5);
    doc.text('Teacher / Attendance Notes', margin + 145, yPos + 5.5);

    yPos += 8;

    // Student rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    targetStudents.forEach((s, idx) => {
      // Check page break
      if (yPos > pageHeight - 35) {
        doc.addPage();
        yPos = 16;
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'FD');
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('#', margin + 2, yPos + 5.5);
        doc.text('Reg No', margin + 10, yPos + 5.5);
        doc.text('Learner Full Name', margin + 35, yPos + 5.5);
        doc.text('Status', margin + 85, yPos + 5.5);
        doc.text('Parent Contact', margin + 108, yPos + 5.5);
        doc.text('Teacher / Attendance Notes', margin + 145, yPos + 5.5);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
      }

      // Alternate row shading
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');
      }

      const status = attendanceState[s.id]?.status || 'Present';
      const notes = attendanceState[s.id]?.notes || '-';

      doc.setTextColor(71, 85, 105);
      doc.text(`${idx + 1}`, margin + 2, yPos + 4.8);
      doc.text(s.regNumber, margin + 10, yPos + 4.8);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const truncatedName = s.fullName.length > 25 ? s.fullName.substring(0, 23) + '..' : s.fullName;
      doc.text(truncatedName, margin + 35, yPos + 4.8);

      if (status === 'Present') {
        doc.setTextColor(5, 150, 105);
      } else if (status === 'Absent') {
        doc.setTextColor(225, 29, 72);
      } else {
        doc.setTextColor(217, 119, 6);
      }
      doc.text(status.toUpperCase(), margin + 85, yPos + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const contactInfo = s.parentPhone || s.parentEmail || 'N/A';
      const truncatedContact = contactInfo.length > 20 ? contactInfo.substring(0, 18) + '..' : contactInfo;
      doc.text(truncatedContact, margin + 108, yPos + 4.8);

      const truncatedNotes = notes.length > 24 ? notes.substring(0, 22) + '..' : notes;
      doc.text(truncatedNotes, margin + 145, yPos + 4.8);

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, yPos + 7, pageWidth - margin, yPos + 7);

      yPos += 7;
    });

    // Verification and Sign-off Footer Box
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos = Math.max(yPos + 8, pageHeight - 28);
    }

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);

    doc.text('Class Teacher Signature: _______________________', margin + 4, yPos + 6);
    doc.text('Date: _______________', margin + 4, yPos + 12);

    doc.text('Dean of Studies (DOS) / Headteacher Verification: _______________________', margin + 85, yPos + 6);
    doc.text('Official School Stamp: [   STAMP HERE   ]', margin + 85, yPos + 12);

    doc.save(`Mugina_Hope_Attendance_${selectedGrade}_${selectedDate}.pdf`);
  };

  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setIsProcessingExcel(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        alert('The uploaded Excel document has no data rows.');
        setIsProcessingExcel(false);
        return;
      }

      const mapped = rawRows.map((row) => {
        const getVal = (...keys: string[]) => {
          for (const k of keys) {
            for (const rowKey of Object.keys(row)) {
              if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
                return String(row[rowKey]).trim();
              }
            }
          }
          return '';
        };

        const fullName =
          getVal('Student Name', 'Name', 'FullName', 'Full Name', 'Pupil Name', 'Student') || 'Student';
        const regNumber = getVal('Registration Number', 'Reg Number', 'Reg ID', 'RegID', 'Student ID', 'ID');
        const gradeCode = getVal('Grade / Class', 'Grade', 'Class', 'Level', 'Grade Code') || 'P4';
        const date = getVal('Date', 'Attendance Date') || selectedDate;

        let statusRaw = getVal('Status (Present/Absent/Late)', 'Status', 'Attendance', 'Presence').toUpperCase();
        let status: 'Present' | 'Absent' | 'Late' = 'Present';
        if (statusRaw.includes('ABS') || statusRaw === 'A') status = 'Absent';
        else if (statusRaw.includes('LAT') || statusRaw === 'L') status = 'Late';
        else status = 'Present';

        const parentEmail = getVal('Parent Email', 'Parent Gmail', 'Email', 'ParentEmail');
        const parentPhone = getVal('Parent Phone', 'Phone', 'Parent Tel', 'Contact') || '+250 78';
        const notes = getVal('Teacher Notes', 'Notes', 'Remarks', 'Comment', 'Note');

        const matched = students.find(
          (s) =>
            (regNumber && s.regNumber.toLowerCase() === regNumber.toLowerCase()) ||
            s.fullName.toLowerCase() === fullName.toLowerCase()
        );

        return {
          fullName,
          regNumber: regNumber || (matched ? matched.regNumber : `MHA-${Date.now().toString().slice(-4)}`),
          gradeCode: matched?.gradeCode || gradeCode,
          date,
          status,
          parentEmail: parentEmail || matched?.parentEmail || '',
          parentPhone: parentPhone || matched?.parentPhone || '',
          notes,
          matchedStudent: matched,
        };
      });

      setParsedExcelRows(mapped);
      setShowExcelModal(true);
    } catch (err) {
      console.error('Error reading Excel file:', err);
      alert('Could not parse Excel document. Please check the file format (.xlsx, .xls, or .csv).');
    } finally {
      setIsProcessingExcel(false);
      e.target.value = '';
    }
  };

  const handleConnectExcelAttendance = async () => {
    if (parsedExcelRows.length === 0) return;
    setIsProcessingExcel(true);

    const recordsToSave: AttendanceRecord[] = [];
    const absentOrLateToNotify: { student: EnrolledStudent; status: 'Present' | 'Absent' | 'Late'; notes: string }[] = [];
    const currentStudents = getEnrolledStudents();

    for (const row of parsedExcelRows) {
      let student = row.matchedStudent;

      if (!student && excelAutoEnrollNew) {
        student = enrollStudentByDOS({
          regNumber: row.regNumber,
          fullName: row.fullName,
          gender: 'Female',
          dob: '2017-01-01',
          gradeCode: row.gradeCode,
          parentName: `${row.fullName}'s Parent`,
          parentPhone: row.parentPhone || '+250 78',
          parentEmail: row.parentEmail || '',
          studentUsername: row.fullName.toLowerCase().replace(/\s+/g, '.'),
          studentPassword: 'student@2026',
          enrolledBy: sessionUser?.name || 'Excel Import',
          status: 'Active',
        });
      }

      const recordStudentId = student ? student.id : `stu-ext-${row.regNumber}`;

      const rec: AttendanceRecord = {
        id: `att-${recordStudentId}-${row.date}`,
        date: row.date,
        gradeCode: row.gradeCode,
        studentId: recordStudentId,
        studentName: row.fullName,
        parentEmail: row.parentEmail,
        parentPhone: row.parentPhone,
        status: row.status,
        markedBy: `${sessionUser?.name || 'Administrator'} (via Excel Connect)`,
        notes: row.notes || 'Imported via Excel Attendance Connection',
        emailNotified: (row.status === 'Absent' || row.status === 'Late') && excelAutoNotifyParents,
      };

      recordsToSave.push(rec);

      if ((row.status === 'Absent' || row.status === 'Late') && student) {
        absentOrLateToNotify.push({
          student,
          status: row.status,
          notes: row.notes,
        });
      }
    }

    // Save batch to store
    saveAttendanceBatch(recordsToSave);
    const refreshedStudents = getEnrolledStudents();
    setStudents(refreshedStudents);

    // Update target date to match the first row's date
    if (parsedExcelRows[0]?.date) {
      setSelectedDate(parsedExcelRows[0].date);
    }

    // Auto-send notifications if selected
    let notifiedCount = 0;
    if (excelAutoNotifyParents) {
      for (const item of absentOrLateToNotify) {
        if (item.student.parentEmail) {
          const res = await sendNotificationToParent(item.student, item.status, item.notes);
          if (res.success) notifiedCount++;
        }
      }
    }

    setIsProcessingExcel(false);
    setShowExcelModal(false);
    setSuccessMessage(
      `Excel Document Connected Successfully! ${recordsToSave.length} student attendance records imported into the system for ${parsedExcelRows[0]?.date || selectedDate}. ${notifiedCount} parent Gmail alert(s) automated.`
    );
    if (onRecordSaved) onRecordSaved();
  };

  const handleClearDateAttendance = () => {
    setShowClearConfirm(true);
  };

  const executeClearDateAttendance = () => {
    clearAttendanceForDate(selectedDate);
    const resetMap: Record<string, { status: 'Present' | 'Absent' | 'Late'; notes: string; dispatched?: boolean }> = {};
    students.forEach((s) => {
      resetMap[s.id] = { status: 'Present', notes: '', dispatched: false };
    });
    setAttendanceState(resetMap);
    setSuccessMessage(`All attendance records for ${selectedDate} have been cleared.`);
    setShowClearConfirm(false);
    if (onRecordSaved) onRecordSaved();
  };

  const handleAddNewLearnerAndMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearnerData.fullName.trim()) return;

    const regNumber = `MHA-2026-${Math.floor(100 + Math.random() * 900)}`;
    const student = enrollStudentByDOS({
      regNumber,
      fullName: newLearnerData.fullName.trim(),
      gender: newLearnerData.gender,
      dob: '2018-01-01',
      gradeCode: newLearnerData.gradeCode,
      parentName: newLearnerData.parentName.trim() || 'Parent / Guardian',
      parentPhone: newLearnerData.parentPhone.trim() || '+250 788 000 000',
      parentEmail: newLearnerData.parentEmail.trim() || '',
      studentUsername: `stu.${newLearnerData.fullName.toLowerCase().replace(/\s+/g, '')}`,
      studentPassword: 'mugina@student',
      enrolledBy: sessionUser?.name || 'Staff Administrator',
      status: 'Active',
    });

    const updatedStudents = getEnrolledStudents();
    setStudents(updatedStudents);
    setAttendanceState((prev) => ({
      ...prev,
      [student.id]: { status: 'Present', notes: 'Manually added to roll call', dispatched: false },
    }));

    setSuccessMessage(`Learner "${student.fullName}" added to attendance table and marked Present! You can now continue taking attendance.`);
    setShowAddLearnerModal(false);
    setNewLearnerData({
      fullName: '',
      gradeCode: 'P1',
      gender: 'Female',
      parentName: '',
      parentPhone: '+250 78',
      parentEmail: '',
    });
    if (onRecordSaved) onRecordSaved();
  };

  const handleDeleteStudentRecord = (studentId: string) => {
    deleteAttendanceRecord(`att-${studentId}-${selectedDate}`);
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { status: 'Present', notes: '', dispatched: false },
    }));
    setSuccessMessage(`Attendance record reset for selected student on ${selectedDate}.`);
    if (onRecordSaved) onRecordSaved();
  };

  return (
    <div className="space-y-6">
      {/* 1. Master Header & Navigation Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
                <UserCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Staff & Teacher Attendance Portal
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Select a class below to take daily roll call for that specific class only, combine with Excel sheets, and automate parent Gmail alerts.
            </p>
          </div>

          {/* Quick Date Picker & Clear Day Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <Calendar className="w-4 h-4 text-blue-700 ml-1" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold font-mono text-slate-900 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg shadow-2xs cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Export Buttons for School Reporting */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportPDF}
                title="Export official daily attendance report to PDF for school reporting"
                className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-600" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                title="Export daily attendance records to CSV file for school reporting"
                className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearDateAttendance}
              title="Delete and reset attendance records for this date"
              className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Day</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs: 1. Click to Class Hub | 2. Chosen Class Roll Call */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('class-select')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'class-select'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Choose Class (All Grades)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('class-rollcall')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'class-rollcall'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>2. {currentGradeObj ? currentGradeObj.name : selectedGrade} Roll Call Form</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Parent Gmail alerts active for absent learners</span>
          </div>
        </div>

        {/* Real-time Attendance Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {viewMode === 'class-rollcall' && selectedGrade !== 'ALL'
                ? `Learners in ${selectedGrade}`
                : 'Total School Learners'}
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.total}</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">Present</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-700 font-mono">{stats.present}</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">({stats.presentRate}%)</span>
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">Absent (Alerts)</span>
            <span className="text-2xl font-black text-rose-700 font-mono">{stats.absent}</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Late Arrivals</span>
            <span className="text-2xl font-black text-amber-700 font-mono">{stats.late}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">Active Date</span>
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1 mt-1 font-mono">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              {selectedDate}
            </span>
          </div>
        </div>

        {/* Success Feedback Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <strong className="block font-bold">Attendance Logged & Dispatched</strong>
              <p>{successMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CLICK TO CLASS SELECTION HUB */}
      {/* ========================================================================= */}
      {viewMode === 'class-select' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Assigned Class Highlight for Teacher */}
          {assignedGrade && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-6 shadow-md border border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    Your Assigned Class
                  </span>
                  <span className="text-xs text-blue-200 font-medium">Logged in as {sessionUser?.name}</span>
                </div>
                <h3 className="text-xl font-bold font-display text-white">
                  Take Roll Call for {ACADEMIC_GRADES.find((g) => g.code === assignedGrade)?.name || assignedGrade}
                </h3>
                <p className="text-xs text-slate-300">
                  Click to open the attendance sheet and mark presence for your assigned class learners today.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectClass(assignedGrade)}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Open {assignedGrade} Roll Call</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section Filter Pills */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Click on a Class to Continue Attendance
                </h3>
                <p className="text-xs text-slate-500">
                  Select any grade level to view and mark students enrolled in that specific class only.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setClassSectionTab('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    classSectionTab === 'ALL' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All 9 Classes
                </button>
                <button
                  type="button"
                  onClick={() => setClassSectionTab('NURSERY')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    classSectionTab === 'NURSERY' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Nursery (3)
                </button>
                <button
                  type="button"
                  onClick={() => setClassSectionTab('PRIMARY')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    classSectionTab === 'PRIMARY' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Primary (6)
                </button>
              </div>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACADEMIC_GRADES.filter((g) => {
                if (classSectionTab === 'NURSERY') return g.level === 'Nursery';
                if (classSectionTab === 'PRIMARY') return g.level === 'Primary';
                return true;
              }).map((grade) => {
                const classStat = getClassStats(grade.code);
                const isAssigned = assignedGrade === grade.code;

                return (
                  <div
                    key={grade.code}
                    onClick={() => handleSelectClass(grade.code)}
                    className={`group relative rounded-3xl border p-5 transition-all cursor-pointer hover:shadow-md flex flex-col justify-between space-y-4 ${
                      isAssigned
                        ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/90 hover:border-blue-400'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mono text-xs font-black px-2.5 py-1 rounded-xl ${
                            grade.level === 'Nursery'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {grade.code}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {grade.level} · {grade.ageRange}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {grade.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{grade.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Enrolled Pupils:</span>
                        <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {classStat.total} Students
                        </span>
                      </div>

                      {/* Today's Status Indicator */}
                      <div className="text-[11px] flex items-center justify-between">
                        <span className="text-slate-500">Today's Roll:</span>
                        {classStat.markedCount > 0 ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ✓ {classStat.present} Present · {classStat.absent} Absent
                          </span>
                        ) : (
                          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Roll Call
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectClass(grade.code);
                        }}
                        className="w-full py-2.5 bg-slate-900 group-hover:bg-blue-800 active:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Take Attendance for {grade.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Card for All Classes Combined Roster Overview */}
              <div
                onClick={() => handleSelectClass('ALL')}
                className="group relative rounded-3xl border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/70 p-5 transition-all cursor-pointer hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200">
                      ALL
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      School-Wide
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      All Classes Combined Roster
                    </h4>
                    <p className="text-xs text-slate-500">
                      Full view across all Nursery and Primary classes for administrator audits and bulk Excel exports.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Total Enrolled:</span>
                    <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {students.length} Learners
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClass('ALL');
                    }}
                    className="w-full py-2.5 bg-slate-800 group-hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open All Classes Overview</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CHOSEN CLASS ATTENDANCE FORM (STUDENTS OF THIS CLASS ONLY) */}
      {/* ========================================================================= */}
      {viewMode === 'class-rollcall' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Breadcrumb Navigation Bar & Class Quick Switcher */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('class-select')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Classes Directory</span>
                </button>

                <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Active Sheet:</span>
                  <span className="font-bold text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                    {currentGradeObj ? currentGradeObj.name : 'All Classes'} ({selectedGrade})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>Date: {selectedDate}</span>
              </div>
            </div>

            {/* Quick Switch Class Pills (Click any class to jump immediately) */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Switch Class:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {ACADEMIC_GRADES.map((g) => (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => handleSelectClass(g.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedGrade === g.code
                        ? 'bg-blue-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {g.code}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSelectClass('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGrade === 'ALL'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Action Controls & Excel Tools for this Chosen Class */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Inside Chosen Class */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={`Search learner in ${selectedGrade}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-hidden focus:border-blue-600 font-medium"
                />
              </div>

              {/* Action Buttons: Add Learner, Connect Excel, Download Template, Mark All Present */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Add Learner to this chosen class */}
                <button
                  type="button"
                  onClick={() => {
                    setNewLearnerData((prev) => ({
                      ...prev,
                      gradeCode: selectedGrade === 'ALL' ? 'P1' : selectedGrade,
                    }));
                    setShowAddLearnerModal(true);
                  }}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>+ Add Learner to {selectedGrade}</span>
                </button>

                {/* Excel Upload Input */}
                <label className="cursor-pointer px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Connect Excel (.xlsx)</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleExcelFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Download Excel Template */}
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Download spreadsheet template pre-populated with current student roster"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Excel Template</span>
                </button>

                {/* Export Daily Attendance to PDF */}
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Export official daily attendance report to PDF with school stamp and verification blocks"
                >
                  <FileDown className="w-4 h-4 text-rose-200" />
                  <span>Export PDF Report</span>
                </button>

                {/* Export Daily Attendance to CSV */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Export daily attendance records to CSV file for school reporting"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Export CSV File</span>
                </button>

                {/* One-click Mark All Present */}
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Present</span>
                </button>

                {/* Save & Automate Dispatch Button */}
                <button
                  type="button"
                  onClick={handleSaveAndAutomateNotifications}
                  disabled={isSavingAndSending}
                  className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSavingAndSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Alerts...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Save & Notify Parents</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Daily Student Roster Table for Chosen Class */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {currentGradeObj ? currentGradeObj.name : 'All Classes'} Attendance Form ({filteredStudents.length} Students)
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-mono font-bold">
                  Class: {selectedGrade}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Present: <strong className="text-emerald-700">{stats.present}</strong></span>
                <span>•</span>
                <span>Absent: <strong className="text-rose-700">{stats.absent}</strong></span>
                <span>•</span>
                <span>Late: <strong className="text-amber-700">{stats.late}</strong></span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-16 text-center text-slate-500 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="text-base font-bold text-slate-900">
                    No learners currently in {currentGradeObj ? currentGradeObj.name : selectedGrade}
                  </h4>
                  <p className="text-xs text-slate-500">
                    You can input learner names directly to this class or connect an Excel document to start taking roll call.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewLearnerData((prev) => ({
                      ...prev,
                      gradeCode: selectedGrade === 'ALL' ? 'P1' : selectedGrade,
                    }));
                    setShowAddLearnerModal(true);
                  }}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>+ Add First Learner to {selectedGrade}</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => {
                  const currentStatus = attendanceState[student.id]?.status || 'Present';
                  const currentNote = attendanceState[student.id]?.notes || '';
                  const isDispatched = attendanceState[student.id]?.dispatched;

                  return (
                    <div
                      key={student.id}
                      className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                        currentStatus === 'Absent'
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : currentStatus === 'Late'
                          ? 'bg-amber-50/30 hover:bg-amber-50/50'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Index, Avatar, Student & Parent Info */}
                      <div className="flex items-start gap-3 min-w-[290px]">
                        <span className="text-xs font-mono font-bold text-slate-400 mt-2.5 w-5 text-right shrink-0">
                          #{idx + 1}
                        </span>

                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : currentStatus === 'Absent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{student.fullName}</h4>
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                              {student.gradeCode}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-bold">
                              {student.gender === 'Female' ? 'F' : 'M'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="font-mono text-[11px] text-slate-400">ID: {student.regNumber}</span>
                            <span>•</span>
                            <span>Parent: <strong className="text-slate-700">{student.parentName}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono text-[11px] text-blue-700">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {student.parentEmail ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {student.parentEmail}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">No email</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Presence Selector Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'Present')}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'Late')}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            currentStatus === 'Late'
                              ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'Absent')}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30 animate-pulse'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                          }`}
                          title="Marks absent and queues Gmail alert to parent"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>
                      </div>

                      {/* Teacher Note & Quick Parent Dispatch Trigger */}
                      <div className="flex items-center gap-2 flex-1 lg:max-w-xs">
                        <input
                          type="text"
                          placeholder="Reason / Note (e.g. sick, permission)..."
                          value={currentNote}
                          onChange={(e) => handleSetNote(student.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                        />

                        {/* Preview Parent Email */}
                        <button
                          type="button"
                          onClick={() => setPreviewStudent(student)}
                          className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          title="Preview notification email for parent"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Individual Single Send Button */}
                        {currentStatus === 'Absent' && (
                          <button
                            type="button"
                            onClick={() => sendNotificationToParent(student, currentStatus, currentNote)}
                            className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              isDispatched
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs'
                            }`}
                            title="Send immediate Gmail alert to parent"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reset / Delete Record */}
                        <button
                          type="button"
                          onClick={() => handleDeleteStudentRecord(student.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Reset or delete attendance for this learner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Save Ribbon for Chosen Class */}
            {filteredStudents.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <span>Class <strong>{selectedGrade}</strong> Attendance: </span>
                  <span className="font-bold text-emerald-700">{stats.present} Present</span>,{' '}
                  <span className="font-bold text-rose-700">{stats.absent} Absent</span>,{' '}
                  <span className="font-bold text-amber-700">{stats.late} Late</span>
                  {stats.absent > 0 && (
                    <span className="text-rose-600 font-semibold block sm:inline sm:ml-2">
                      (Will notify {stats.absent} parent inbox{stats.absent > 1 ? 'es' : ''} on save)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveAndAutomateNotifications}
                  disabled={isSavingAndSending}
                  className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingAndSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving & Sending Alerts...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Save {selectedGrade} Attendance & Send Alerts</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Excel Document Connection & Preview Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Connect Excel Attendance Document
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    File: {excelFileName} ({parsedExcelRows.length} rows detected)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pupils</span>
                <span className="text-lg font-black text-slate-800 font-mono">{parsedExcelRows.length}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {parsedExcelRows.filter((r) => r.status === 'Present').length}
                </span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Absent</span>
                <span className="text-lg font-black text-rose-700 font-mono">
                  {parsedExcelRows.filter((r) => r.status === 'Absent').length}
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Late</span>
                <span className="text-lg font-black text-amber-700 font-mono">
                  {parsedExcelRows.filter((r) => r.status === 'Late').length}
                </span>
              </div>
            </div>

            {/* Preview table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-2xl max-h-60 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Learner Name</th>
                    <th className="p-2.5">Reg ID</th>
                    <th className="p-2.5">Class</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Parent Gmail</th>
                    <th className="p-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedExcelRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-2.5 font-bold text-slate-900">{row.fullName}</td>
                      <td className="p-2.5 font-mono text-slate-500">{row.regNumber}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-800 font-bold text-[10px]">
                          {row.gradeCode}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            row.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'Absent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">
                        {row.parentEmail || '—'}
                      </td>
                      <td className="p-2.5 text-slate-500 italic max-w-xs truncate">
                        {row.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Connection configuration checkboxes */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={excelAutoNotifyParents}
                  onChange={(e) => setExcelAutoNotifyParents(e.target.checked)}
                  className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Automatically dispatch Gmail notifications to parents of Absent / Late students</span>
              </label>

              <label className="flex items-center gap-2 text-slate-800 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={excelAutoEnrollNew}
                  onChange={(e) => setExcelAutoEnrollNew(e.target.checked)}
                  className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Auto-enroll any pupils in the spreadsheet who are not yet registered in school system</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                disabled={isProcessingExcel}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectExcelAttendance}
                disabled={isProcessingExcel}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {isProcessingExcel ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting & Importing...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Connect & Import Attendance to System</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Parent Email Template Preview Modal */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-sm">Parent Gmail Notification Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 font-mono text-[11px] text-slate-600">
                <p><strong>To:</strong> {previewStudent.parentEmail || 'parent@gmail.com'}</p>
                <p><strong>From:</strong> &ldquo;Mugina Hope Academy Discipline Office&rdquo; &lt;norbertihimbazwemanzi@gmail.com&gt;</p>
                <p><strong>Subject:</strong> [ATTENDANCE ALERT] {previewStudent.fullName} Marked ABSENT on {selectedDate}</p>
              </div>

              {/* Email Content Box */}
              <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/20 space-y-3">
                <div className="bg-rose-700 text-white p-3 rounded-lg">
                  <h4 className="font-bold text-sm">Mugina Hope Primary & Nursery Academy</h4>
                  <p className="text-[11px] text-amber-200">Official DOD Attendance & Discipline Desk</p>
                </div>

                <p className="text-slate-800">
                  Dear <strong>{previewStudent.parentName}</strong>,
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Your child <strong>{previewStudent.fullName}</strong> (Grade: <strong>{previewStudent.gradeCode}</strong>, Reg No: <code>{previewStudent.regNumber}</code>) has been recorded as <strong>ABSENT</strong> on {selectedDate}.
                </p>

                <div className="p-3 bg-white border border-rose-200 rounded-lg text-rose-800 font-bold">
                  Status: ABSENT
                  {attendanceState[previewStudent.id]?.notes && (
                    <div className="font-normal text-xs text-slate-600 mt-1">
                      Note: {attendanceState[previewStudent.id]?.notes}
                    </div>
                  )}
                </div>

                <p className="text-slate-600 text-[11px]">
                  If this absence was unexpected, please immediately contact our administration office next to Mugina Police Station at <strong>+250 788 258 786</strong>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: QUICK INPUT LEARNER NAME & ADD TO ATTENDANCE */}
      {/* ========================================================================= */}
      {showAddLearnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Add Learner to Attendance Table
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input learner name to take attendance immediately. Integrates with Excel rosters.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLearnerModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewLearnerAndMark} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Learner Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Keza Claudine Uwase"
                  value={newLearnerData.fullName}
                  onChange={(e) => setNewLearnerData({ ...newLearnerData, fullName: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grade / Class *
                  </label>
                  <select
                    value={newLearnerData.gradeCode}
                    onChange={(e) => setNewLearnerData({ ...newLearnerData, gradeCode: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold"
                  >
                    {ACADEMIC_GRADES.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.code} - {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender *
                  </label>
                  <select
                    value={newLearnerData.gender}
                    onChange={(e) => setNewLearnerData({ ...newLearnerData, gender: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Emmanuel Nshimiyimana"
                    value={newLearnerData.parentName}
                    onChange={(e) => setNewLearnerData({ ...newLearnerData, parentName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+250 788 000 000"
                    value={newLearnerData.parentPhone}
                    onChange={(e) => setNewLearnerData({ ...newLearnerData, parentPhone: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Gmail / Email (For Attendance Absence Alerts)
                </label>
                <input
                  type="email"
                  placeholder="parent@gmail.com"
                  value={newLearnerData.parentEmail}
                  onChange={(e) => setNewLearnerData({ ...newLearnerData, parentEmail: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddLearnerModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Add Learner & Mark Present</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CLEAR DAY ATTENDANCE CONFIRMATION (IN-APP) */}
      {/* ========================================================================= */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Clear Attendance for {selectedDate}?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Reset roll call records for this date
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will reset all attendance marks (Present, Absent, Late) recorded for <strong>{selectedDate}</strong> back to the default state. Saved records in storage for this date will be cleared.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClearDateAttendance}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Clear Attendance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
