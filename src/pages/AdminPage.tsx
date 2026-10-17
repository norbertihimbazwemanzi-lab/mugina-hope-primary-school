import React, { useState, useEffect } from 'react';
import {
  UserRole,
  StaffMember,
  EnrolledStudent,
  AttendanceRecord,
  AdminInquiry,
  AdminApplication,
  AdminTourBooking,
  SchoolAnnouncement,
  getStaffMembers,
  enrollStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getEnrolledStudents,
  enrollStudentByDOS,
  updateEnrolledStudent,
  deleteEnrolledStudent,
  getAttendanceRecords,
  saveAttendanceBatch,
  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  syncServerGalleryItems,
  getInquiries,
  updateInquiryStatus,
  getApplications,
  deleteApplication,
  confirmApplicationByDOSOrAdmin,
  getTourBookings,
  getAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getCurrentSessionUser,
  setCurrentSessionUser,
  getAdminNotificationEmail,
  setAdminNotificationEmail,
  RegistrationDocument,
  getRequiredDocuments,
  addRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument,
  WebsiteSettings,
  getWebsiteSettings,
  saveWebsiteSettings,
  PaymentTransaction,
  getPaymentTransactions,
  syncAllStoresWithServerDatabase,
} from '../services/adminStore';
import { FacilityItem, PageId } from '../types';
import { ACADEMIC_GRADES, SCHOOL_INFO } from '../data/schoolData';
import { initAuth, googleSignIn, logoutGoogle, getAccessToken } from '../services/authService';
import { uploadSchoolAsset } from '../services/storageService';
import { SchoolLogo } from '../components/SchoolLogo';
import { AdminAttendanceTracker } from '../components/AdminAttendanceTracker';
import { FinancePortal } from '../components/FinancePortal';
import { TeacherPortal } from '../components/TeacherPortal';
import { RegistrarPortal } from '../components/RegistrarPortal';
import { PrincipalQueueModal } from '../components/PrincipalQueueModal';
import {
  Shield,
  Lock,
  UserCheck,
  GraduationCap,
  ClipboardList,
  Image as ImageIcon,
  FileText,
  Mail,
  Bell,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Send,
  AlertTriangle,
  RefreshCw,
  LogOut,
  UploadCloud,
  Check,
  X,
  Search,
  Key,
  Users,
  Sliders,
  Settings,
  Globe,
  FileSpreadsheet,
  MessageSquare,
  BarChart2,
  PieChart,
  TrendingUp,
  Clock,
  ExternalLink,
  Phone,
  Coins,
  Sparkles,
  DollarSign,
  RotateCcw,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface AdminPageProps {
  onNavigate: (page: PageId) => void;
  onGalleryUpdated?: () => void;
}

export type AdminTab =
  | 'finance'
  | 'teacher_classroom'
  | 'registrar'
  | 'staff'
  | 'students'
  | 'attendance'
  | 'confirmations'
  | 'documents'
  | 'gallery'
  | 'news'
  | 'settings'
  | 'inquiries'
  | 'gmail';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onGalleryUpdated }) => {
  const [currentUser, setCurrentUser] = useState(getCurrentSessionUser());
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const user = getCurrentSessionUser();
    if (user?.role === 'Finance') return 'finance';
    if (user?.role === 'Teacher') return 'teacher_classroom';
    if (user?.role === 'Registrar') return 'registrar';
    if (user?.role === 'DOS') return 'students';
    return 'students';
  });

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(getPaymentTransactions());
  const [showPrincipalQueueModal, setShowPrincipalQueueModal] = useState(false);

  // Login form state - clean without demo values
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Staff Edit Modal State
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);

  // Student Edit Modal State
  const [editingStudent, setEditingStudent] = useState<EnrolledStudent | null>(null);

  // Website Settings State (Admin & Headteacher can edit everything)
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(getWebsiteSettings());
  const [websiteSettingsSuccess, setWebsiteSettingsSuccess] = useState(false);

  // Google user
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Data states
  const [staffList, setStaffList] = useState<StaffMember[]>(getStaffMembers());
  const [studentList, setStudentList] = useState<EnrolledStudent[]>(getEnrolledStudents());
  const [galleryItems, setGalleryItems] = useState<FacilityItem[]>(getGalleryItems());
  const [inquiries, setInquiries] = useState<AdminInquiry[]>(getInquiries());
  const [applications, setApplications] = useState<AdminApplication[]>(getApplications());
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(getAnnouncements());
  const [adminEmail, setAdminEmail] = useState<string>(getAdminNotificationEmail());
  const [docList, setDocList] = useState<RegistrationDocument[]>(getRequiredDocuments());

  // Registration Document Modal State
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<RegistrationDocument | null>(null);
  const [docFormData, setDocFormData] = useState({
    title: '',
    description: '',
    isRequired: true,
    applicableGrades: 'All Grades (Nursery & Primary)',
    formatHint: '',
  });

  // Attendance tracker states
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceGrade, setAttendanceGrade] = useState<string>('P4');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'Present' | 'Absent' | 'Late'; notes: string }>>({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceSuccessMsg, setAttendanceSuccessMsg] = useState<string | null>(null);

  // Applicant Chat & Messaging states
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [activeChatRef, setActiveChatRef] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [confirmationsSubTab, setConfirmationsSubTab] = useState<'applications' | 'chats'>('applications');

  // Deletion Modal State (Reliable in-app confirmation avoiding blocked window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'staff' | 'student' | 'doc' | 'gallery' | 'news' | 'application';
    id: string;
    name: string;
  } | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Staff Enrollment Form Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    role: 'Teacher' as StaffMember['role'],
    email: '',
    phone: '+250 78',
    username: '',
    password: '',
    assignedSubjectOrGrade: '',
  });

  // Student Enrollment Form Modal (DOS objective)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    regNumber: `MHA-2026-${Math.floor(100 + Math.random() * 900)}`,
    fullName: '',
    gender: 'Female' as 'Male' | 'Female',
    dob: '2017-05-10',
    gradeCode: 'P4',
    parentName: '',
    parentPhone: '+250 78',
    parentEmail: '',
    studentUsername: '',
    studentPassword: 'student@2026',
    status: 'Active' as EnrolledStudent['status'],
  });

  // Confirm Application Modal (Wait for Admin/DOS Confirmation)
  const [confirmAppTarget, setConfirmAppTarget] = useState<AdminApplication | null>(null);
  const [confirmFeedbackNotes, setConfirmFeedbackNotes] = useState('Welcome to Mugina Hope Academy! Your admission is confirmed.');
  const [confirmStudentUser, setConfirmStudentUser] = useState('');
  const [confirmStudentPass, setConfirmStudentPass] = useState('mugina@2026');
  const [isConfirmingApp, setIsConfirmingApp] = useState(false);

  // Gallery Upload Modal
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [editingImageItem, setEditingImageItem] = useState<FacilityItem | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFormData, setImageFormData] = useState({
    title: '',
    category: 'outdoor' as FacilityItem['category'],
    description: '',
    caption: '',
    imageSrc: '',
  });
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);

  // News / Announcement Modal
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNewsItem, setEditingNewsItem] = useState<SchoolAnnouncement | null>(null);
  const [newsFormData, setNewsFormData] = useState({
    title: '',
    content: '',
    badge: 'Announcement',
    isActive: true,
  });

  // Filter student search
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Sync Google Auth
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsub();
  }, []);

  // Sync all database stores from server on mount for multi-device persistence
  useEffect(() => {
    syncAllStoresWithServerDatabase().then(() => {
      setStaffList(getStaffMembers());
      setStudentList(getEnrolledStudents());
      setDocList(getRequiredDocuments());
      setApplications(getApplications());
      setPaymentTransactions(getPaymentTransactions());
    });
  }, []);

  // Sync gallery items from server for cross-device visibility
  useEffect(() => {
    syncServerGalleryItems().then((items) => {
      setGalleryItems(items);
      if (onGalleryUpdated) onGalleryUpdated();
    });
  }, []);

  const fetchChatThreads = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.threads)) {
          setChatThreads(data.threads);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch chat threads:', e);
    }
  };

  useEffect(() => {
    fetchChatThreads();
  }, [activeTab]);

  // Update default tab based on user role to ensure only permitted views are visible
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Finance') setActiveTab('finance');
      else if (currentUser.role === 'Teacher') setActiveTab('teacher_classroom');
      else if (currentUser.role === 'Registrar') setActiveTab('registrar');
      else if (currentUser.role === 'DOS') setActiveTab('students');
      else if (currentUser.role === 'DOD') setActiveTab('attendance');
      else if (currentUser.role === 'Admin') {
        // If current tab is not allowed for Admin, default to students
        setActiveTab((prev) => prev || 'students');
      }
    }
  }, [currentUser]);

  // Initialize attendance state for selected class and date
  useEffect(() => {
    const existing = getAttendanceRecords(attendanceDate, attendanceGrade);
    const studentsInClass = studentList.filter((s) => s.gradeCode === attendanceGrade);
    const newMap: Record<string, { status: 'Present' | 'Absent' | 'Late'; notes: string }> = {};

    studentsInClass.forEach((s) => {
      const match = existing.find((r) => r.studentId === s.id);
      if (match) {
        newMap[s.id] = { status: match.status, notes: match.notes || '' };
      } else {
        newMap[s.id] = { status: 'Present', notes: '' };
      }
    });

    setAttendanceMap(newMap);
    setAttendanceSuccessMsg(null);
  }, [attendanceDate, attendanceGrade, studentList]);

  // Secure Password-Protected Gate Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanUser = loginUsername.trim();
    const cleanPass = loginPassword.trim();

    // 1. Primary requested Admin credentials (or shared access code @0798744704)
    if (
      (cleanUser.toLowerCase() === 'norbertihimbazwemanzi@gmail.com' && cleanPass === '@0798744704') ||
      (cleanUser === '' && cleanPass === '@0798744704') ||
      (cleanUser === '@0798744704' && (cleanPass === '@0798744704' || cleanPass === ''))
    ) {
      const adminSession = {
        id: 'staff-admin-norbert',
        name: 'Norbert Ihimbazwe Manzi (School Administrator)',
        role: 'Admin' as UserRole,
        username: 'norbertihimbazwemanzi@gmail.com',
        email: 'norbertihimbazwemanzi@gmail.com',
      };
      setCurrentSessionUser(adminSession);
      setCurrentUser(adminSession);
      return;
    }

    // 2. Primary requested Headteacher credentials (or shared access code hopeprimary@123)
    if (
      (cleanUser.toLowerCase() === 'hopeprimaryschool' && cleanPass === 'hopeprimary@123') ||
      (cleanUser === '' && cleanPass === 'hopeprimary@123') ||
      (cleanUser === 'hopeprimaryschool' && cleanPass === '')
    ) {
      const headteacherSession = {
        id: 'staff-headteacher-1',
        name: 'Headteacher / School Principal',
        role: 'Admin' as UserRole,
        username: 'hopeprimaryschool',
        email: 'headteacher@muginahopeschool.com',
      };
      setCurrentSessionUser(headteacherSession);
      setCurrentUser(headteacherSession);
      return;
    }

    // 3. Fallback shared access code (mugina2026)
    if (cleanPass === 'mugina2026' || (cleanUser === 'admin' && cleanPass === 'mugina2026')) {
      const adminSession = {
        id: 'staff-admin-norbert',
        name: 'Norbert Ihimbazwe Manzi (School Administrator)',
        role: 'Admin' as UserRole,
        username: 'norbertihimbazwemanzi@gmail.com',
        email: 'norbertihimbazwemanzi@gmail.com',
      };
      setCurrentSessionUser(adminSession);
      setCurrentUser(adminSession);
      return;
    }

    // 4. Check all enrolled staff members (DOS, DOD, Teachers, etc.)
    const allStaff = getStaffMembers();
    const match = allStaff.find(
      (s) =>
        (s.username.toLowerCase() === cleanUser.toLowerCase() ||
          s.email.toLowerCase() === cleanUser.toLowerCase()) &&
        s.password === cleanPass &&
        s.status === 'Active'
    );

    if (match) {
      const session = {
        id: match.id,
        name: match.name,
        role: match.role,
        username: match.username,
        email: match.email,
        assignedSubjectOrGrade: match.assignedSubjectOrGrade,
      };
      setCurrentSessionUser(session);
      setCurrentUser(session);
      if (session.role === 'Finance') setActiveTab('finance');
      else if (session.role === 'Teacher') setActiveTab('teacher_classroom');
      else if (session.role === 'Registrar') setActiveTab('registrar');
      else if (session.role === 'DOS') setActiveTab('students');
      else if (session.role === 'DOD') setActiveTab('attendance');
      else setActiveTab('students');
      return;
    }

    setLoginError('Invalid username, password, or access code. Please verify credentials.');
  };

  // Google Sign-In
  const handleGoogleConnect = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        const session = {
          id: res.user.uid,
          name: res.user.displayName || 'Google Administrator',
          role: 'Admin' as UserRole,
          username: res.user.email?.split('@')[0] || 'admin',
          email: res.user.email || 'admin@muginahopeschool.com',
        };
        setCurrentSessionUser(session);
        setCurrentUser(session);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    setCurrentSessionUser(null);
    setCurrentUser(null);
    await logoutGoogle();
  };

  // Quick Role Demo Login
  const handleQuickRoleLogin = (role: 'Admin' | 'DOS' | 'Finance' | 'Registrar' | 'Teacher' | 'DOD') => {
    const allStaff = getStaffMembers();
    const match = allStaff.find((s) => s.role === role) || allStaff[0];
    const session = {
      id: match.id,
      name: match.name,
      role: match.role,
      username: match.username,
      email: match.email,
      assignedSubjectOrGrade: match.assignedSubjectOrGrade,
    };
    setCurrentSessionUser(session);
    setCurrentUser(session);
    if (role === 'Finance') setActiveTab('finance');
    else if (role === 'Teacher') setActiveTab('teacher_classroom');
    else if (role === 'Registrar') setActiveTab('registrar');
    else if (role === 'DOS') setActiveTab('students');
    else if (role === 'DOD') setActiveTab('attendance');
    else setActiveTab('students');
  };

  // 1. Staff Enrollment & Edit (Admin only)
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.name || !staffFormData.username || !staffFormData.password) {
      alert('Please fill out all required staff fields.');
      return;
    }

    if (editingStaffMember) {
      updateStaffMember(editingStaffMember.id, {
        name: staffFormData.name,
        role: staffFormData.role,
        email: staffFormData.email || `${staffFormData.username}@muginahopeschool.com`,
        phone: staffFormData.phone,
        username: staffFormData.username,
        password: staffFormData.password,
        assignedSubjectOrGrade: staffFormData.assignedSubjectOrGrade,
      });
      setEditingStaffMember(null);
    } else {
      enrollStaffMember({
        name: staffFormData.name,
        role: staffFormData.role,
        email: staffFormData.email || `${staffFormData.username}@muginahopeschool.com`,
        phone: staffFormData.phone,
        username: staffFormData.username,
        password: staffFormData.password,
        assignedSubjectOrGrade: staffFormData.assignedSubjectOrGrade,
      });
    }

    setStaffList(getStaffMembers());
    setShowAddStaffModal(false);
    setStaffFormData({
      name: '',
      role: 'Teacher',
      email: '',
      phone: '+250 78',
      username: '',
      password: '',
      assignedSubjectOrGrade: '',
    });
  };

  // 2. Student Enrollment & Edit (DOS primary objective & Admin)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.fullName || !studentFormData.gradeCode) {
      alert('Please provide student full name and grade level.');
      return;
    }

    const username = studentFormData.studentUsername || `stu.${studentFormData.fullName.toLowerCase().replace(/\s+/g, '')}`;

    if (editingStudent) {
      updateEnrolledStudent(editingStudent.id, {
        regNumber: studentFormData.regNumber,
        fullName: studentFormData.fullName,
        gender: studentFormData.gender,
        dob: studentFormData.dob,
        gradeCode: studentFormData.gradeCode,
        parentName: studentFormData.parentName,
        parentPhone: studentFormData.parentPhone,
        parentEmail: studentFormData.parentEmail,
        studentUsername: username,
        studentPassword: studentFormData.studentPassword,
        status: studentFormData.status,
      });
      setEditingStudent(null);
    } else {
      enrollStudentByDOS({
        regNumber: studentFormData.regNumber,
        fullName: studentFormData.fullName,
        gender: studentFormData.gender,
        dob: studentFormData.dob,
        gradeCode: studentFormData.gradeCode,
        parentName: studentFormData.parentName,
        parentPhone: studentFormData.parentPhone,
        parentEmail: studentFormData.parentEmail,
        studentUsername: username,
        studentPassword: studentFormData.studentPassword || 'mugina@student',
        enrolledBy: currentUser?.name || 'DOS',
        status: studentFormData.status,
      });
    }

    setStudentList(getEnrolledStudents());
    setShowAddStudentModal(false);
    setStudentFormData({
      regNumber: `MHA-2026-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      gender: 'Female',
      dob: '2017-05-10',
      gradeCode: 'P4',
      parentName: '',
      parentPhone: '+250 78',
      parentEmail: '',
      studentUsername: '',
      studentPassword: 'student@2026',
      status: 'Active',
    });
  };

  // Website Settings Save Handler (Admin & Headteacher can edit everything)
  const handleSaveWebsiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebsiteSettings(websiteSettings);
    setWebsiteSettingsSuccess(true);
    setTimeout(() => setWebsiteSettingsSuccess(false), 3500);
  };

  // 3. Confirm Admissions Application (Admin & DOS)
  const handleConfirmApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmAppTarget) return;

    setIsConfirmingApp(true);
    try {
      const { updatedApp, student } = confirmApplicationByDOSOrAdmin(
        confirmAppTarget.id,
        confirmFeedbackNotes,
        currentUser?.name || 'Director of Studies',
        confirmStudentUser || `stu.${confirmAppTarget.studentName.toLowerCase().replace(/\s+/g, '')}`,
        confirmStudentPass || 'mugina@2026'
      );

      // Trigger Gmail confirmation email via backend Express endpoint
      fetch('/api/admissions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refCode: confirmAppTarget.refCode,
          studentName: student.fullName,
          studentId: student.regNumber,
          grade: student.gradeCode,
          parentName: student.parentName,
          parentEmail: student.parentEmail,
          studentUsername: student.studentUsername,
          studentPassword: student.studentPassword,
          feedbackNotes: confirmFeedbackNotes,
        }),
      }).catch(console.error);

      // Update local states
      setApplications(getApplications());
      setStudentList(getEnrolledStudents());
      alert(`Admission approved! ${student.fullName} has been officially enrolled with Registration ID: ${student.regNumber}. Feedback email dispatched to ${student.parentEmail || 'parent'}.`);
      setConfirmAppTarget(null);
    } catch (err: any) {
      alert(`Error approving application: ${err.message}`);
    } finally {
      setIsConfirmingApp(false);
    }
  };

  const handleSendAdminReply = async (refCode: string) => {
    if (!adminReplyText.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(refCode)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'admin',
          senderName: `${currentUser?.name || 'Norbert Ihimbazwe Manzi'} (Admin)`,
          text: adminReplyText.trim(),
        }),
      });
      if (res.ok) {
        setAdminReplyText('');
        await fetchChatThreads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingReply(false);
    }
  };

  // 4. Save Attendance Batch & Notify Absent Parents via Gmail
  const handleSaveAttendance = async () => {
    setAttendanceSaving(true);
    setAttendanceSuccessMsg(null);

    const studentsInClass = studentList.filter((s) => s.gradeCode === attendanceGrade);
    const recordsToSave: AttendanceRecord[] = [];
    const absentStudentsToNotify: { student: EnrolledStudent; notes: string }[] = [];

    studentsInClass.forEach((s) => {
      const entry = attendanceMap[s.id] || { status: 'Present', notes: '' };
      recordsToSave.push({
        id: `att-${s.id}-${attendanceDate}`,
        date: attendanceDate,
        gradeCode: attendanceGrade,
        studentId: s.id,
        studentName: s.fullName,
        parentEmail: s.parentEmail,
        parentPhone: s.parentPhone,
        status: entry.status,
        markedBy: currentUser?.name || 'Staff Member',
        notes: entry.notes,
        emailNotified: entry.status === 'Absent',
      });

      if (entry.status === 'Absent' && s.parentEmail) {
        absentStudentsToNotify.push({ student: s, notes: entry.notes });
      }
    });

    saveAttendanceBatch(recordsToSave);

    // Send notifications to absent parents via backend /api/attendance/notify
    let notifiedCount = 0;
    for (const item of absentStudentsToNotify) {
      try {
        await fetch('/api/attendance/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: item.student.fullName,
            studentId: item.student.regNumber,
            grade: item.student.gradeCode,
            parentEmail: item.student.parentEmail,
            parentName: item.student.parentName,
            date: attendanceDate,
            status: 'Absent',
            notes: item.notes,
          }),
        });
        notifiedCount++;
      } catch (err) {
        console.error('Attendance email error:', err);
      }
    }

    setAttendanceSaving(false);
    setAttendanceSuccessMsg(
      `Attendance saved! Recorded ${recordsToSave.length} students (${recordsToSave.filter(r => r.status === 'Present').length} Present, ${recordsToSave.filter(r => r.status === 'Absent').length} Absent). Dispatched ${notifiedCount} Gmail alert(s) to absent student parents.`
    );
  };

  // 5. Gallery Upload / Edit (Firebase Storage & Cloud Assets)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImageUploadStatus(`Selected: ${file.name} (${(file.size / 1024).toFixed(0)} KB). Ready for Firebase Storage.`);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageFormData((prev) => ({
          ...prev,
          imageSrc: base64,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFormData.title || (!imageFormData.imageSrc && !selectedImageFile)) {
      alert('Please provide an image title and select an image file or URL.');
      return;
    }

    setIsUploadingImage(true);
    let finalImageUrl = imageFormData.imageSrc;

    try {
      if (selectedImageFile) {
        setImageUploadStatus('Uploading securely to Firebase Storage...');
        const uploadRes = await uploadSchoolAsset(selectedImageFile, imageFormData.title, imageFormData.category);
        finalImageUrl = uploadRes.url;
        setImageUploadStatus(`Uploaded successfully via ${uploadRes.source === 'firebase-storage' ? 'Firebase Storage' : 'Secure Cloud Asset'}`);
      } else if (imageFormData.imageSrc && imageFormData.imageSrc.startsWith('data:')) {
        setImageUploadStatus('Uploading image to Firebase Storage...');
        const uploadRes = await uploadSchoolAsset(imageFormData.imageSrc, imageFormData.title, imageFormData.category);
        finalImageUrl = uploadRes.url;
      }
    } catch (err: any) {
      console.warn('Storage upload fallback:', err);
    }

    if (editingImageItem) {
      updateGalleryItem(editingImageItem.id, {
        title: imageFormData.title,
        category: imageFormData.category,
        description: imageFormData.description || imageFormData.title,
        caption: imageFormData.caption || imageFormData.title,
        imageSrc: finalImageUrl,
      });
    } else {
      addGalleryItem({
        title: imageFormData.title,
        category: imageFormData.category,
        description: imageFormData.description || imageFormData.title,
        caption: imageFormData.caption || imageFormData.title,
        imageSrc: finalImageUrl,
      });
    }

    setGalleryItems(getGalleryItems());
    if (onGalleryUpdated) onGalleryUpdated();
    setIsUploadingImage(false);
    setShowAddImageModal(false);
    setEditingImageItem(null);
    setSelectedImageFile(null);
    setImageFormData({ title: '', category: 'outdoor', description: '', caption: '', imageSrc: '' });
  };

  // 6. News / Announcement CRUD
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormData.title || !newsFormData.content) {
      alert('Title and content are required.');
      return;
    }

    if (editingNewsItem) {
      updateAnnouncement(editingNewsItem.id, newsFormData);
    } else {
      addAnnouncement(newsFormData);
    }

    setAnnouncements(getAnnouncements());
    setShowNewsModal(false);
    setEditingNewsItem(null);
    setNewsFormData({ title: '', content: '', badge: 'Announcement', isActive: true });
    if (onGalleryUpdated) onGalleryUpdated();
  };

  // 7. Required Registration Documents CRUD (Admin & DOS)
  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormData.title.trim()) {
      alert('Please provide a document title.');
      return;
    }

    if (editingDoc) {
      updateRequiredDocument(editingDoc.id, {
        title: docFormData.title,
        description: docFormData.description,
        isRequired: docFormData.isRequired,
        applicableGrades: docFormData.applicableGrades,
        formatHint: docFormData.formatHint,
      });
    } else {
      addRequiredDocument({
        title: docFormData.title,
        description: docFormData.description,
        isRequired: docFormData.isRequired,
        applicableGrades: docFormData.applicableGrades,
        formatHint: docFormData.formatHint,
      });
    }

    setDocList(getRequiredDocuments());
    setShowDocModal(false);
    setEditingDoc(null);
    setDocFormData({
      title: '',
      description: '',
      isRequired: true,
      applicableGrades: 'All Grades (Nursery & Primary)',
      formatHint: '',
    });
  };

  const handleDeleteDoc = (id: string) => {
    const doc = docList.find((d) => d.id === id);
    setDeleteTarget({
      type: 'doc',
      id,
      name: doc?.title || 'Registration Document Requirement',
    });
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    const { type, id, name } = deleteTarget;

    try {
      if (type === 'staff') {
        const updated = deleteStaffMember(id);
        setStaffList(updated);
        setDeleteSuccessMsg(`Staff account for ${name} deleted successfully.`);
      } else if (type === 'student') {
        const updated = deleteEnrolledStudent(id);
        setStudentList(updated);
        setDeleteSuccessMsg(`Student ${name} removed from enrollment roster.`);
      } else if (type === 'doc') {
        const updated = deleteRequiredDocument(id);
        setDocList(updated);
        setDeleteSuccessMsg(`Registration requirement "${name}" deleted.`);
      } else if (type === 'gallery') {
        const updated = deleteGalleryItem(id);
        setGalleryItems(updated);
        if (onGalleryUpdated) onGalleryUpdated();
        setDeleteSuccessMsg(`Photo "${name}" removed from school gallery.`);
      } else if (type === 'news') {
        const updated = deleteAnnouncement(id);
        setAnnouncements(updated);
        if (onGalleryUpdated) onGalleryUpdated();
        setDeleteSuccessMsg(`Announcement "${name}" deleted.`);
      } else if (type === 'application') {
        const updated = deleteApplication(id);
        setApplications(updated);
        setDeleteSuccessMsg(`Application for ${name} removed.`);
      }
    } catch (err: any) {
      console.error('Delete execution error:', err);
      setDeleteSuccessMsg(`Error deleting ${name}: ${err?.message || 'Action failed'}`);
    }

    setDeleteTarget(null);
    setTimeout(() => setDeleteSuccessMsg(null), 4000);
  };

  // If not logged in, render the Multi-Role Staff Portal Logon Screen
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white text-center space-y-2">
            <SchoolLogo size="lg" className="mx-auto" />
            <h1 className="text-xl font-black font-display tracking-tight text-white mt-1">
              Mugina Hope Academy Staff & Admin Portal
            </h1>
            <p className="text-xs text-amber-300">
              Role-Based Access for Headmaster, DOS, DOD & Teachers
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Password-Protected Security Gate */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username or Official Email
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder=""
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password or Shared Access Code
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder=""
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Verify Access & Unlock Console</span>
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                or authenticate with Google Workspace
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleConnect}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-2xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? 'Connecting...' : 'Sign in with Google Account'}</span>
            </button>

            {/* Quick 1-Click Role Login for Easy Testing & Role-Based Access Control */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block text-center">
                1-Click Role Demo Sign-In
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('Admin')}
                  className="p-3 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-2xl text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-xs font-bold text-blue-950">👑 Principal / Headmaster</strong>
                  <span className="text-[10px] text-blue-700 block mt-0.5">Master Console & Principal Queue</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('Finance')}
                  className="p-3 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-xs font-bold text-emerald-950">💰 Finance Officer</strong>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Billing & Transactional Ledgers</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('Teacher')}
                  className="p-3 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 rounded-2xl text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-xs font-bold text-indigo-950">👩‍🏫 Class Teacher (P4/P1)</strong>
                  <span className="text-[10px] text-indigo-700 block mt-0.5">Assigned Stream & Attendance</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('Registrar')}
                  className="p-3 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 rounded-2xl text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-xs font-bold text-purple-950">📋 School Registrar</strong>
                  <span className="text-[10px] text-purple-700 block mt-0.5">Student Onboarding & Class Move</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('DOS')}
                  className="p-3 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition-colors cursor-pointer sm:col-span-2"
                >
                  <strong className="block text-xs font-bold text-amber-950">🎓 Dean of Studies (DOS)</strong>
                  <span className="text-[10px] text-amber-700 block mt-0.5">Enrollment, Confirmations & Attendance Documentation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter students
  const filteredStudents = studentList.filter((s) => {
    if (!studentSearchQuery) return true;
    const q = studentSearchQuery.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.regNumber.toLowerCase().includes(q) || s.gradeCode.toLowerCase().includes(q) || s.parentName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Active Staff Persona */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SchoolLogo size="md" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900 font-display">
                Mugina Hope Academy Portal
              </h1>
              <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                currentUser.role === 'Admin' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                currentUser.role === 'Finance' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                currentUser.role === 'Teacher' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                currentUser.role === 'Registrar' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                currentUser.role === 'DOS' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                'bg-slate-100 text-slate-900 border-slate-300'
              }`}>
                Role: {
                  currentUser.role === 'Finance' ? 'Finance Officer' :
                  currentUser.role === 'Registrar' ? 'Registrar' :
                  currentUser.role === 'Admin' ? 'Headmaster / Admin' :
                  currentUser.role === 'Teacher' ? 'Class Teacher' :
                  currentUser.role
                }
              </span>

              {/* Principal Queue Badge Button for Admin */}
              {currentUser.role === 'Admin' && (
                <button
                  type="button"
                  onClick={() => setShowPrincipalQueueModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>Principal Queue</span>
                  {paymentTransactions.filter((t) => t.status === 'Refund Requested').length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black">
                      {paymentTransactions.filter((t) => t.status === 'Refund Requested').length}
                    </span>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as <strong>{currentUser.name}</strong> ({currentUser.username})
              {currentUser.assignedSubjectOrGrade && (
                <span> • Assigned: <strong>{currentUser.assignedSubjectOrGrade}</strong></span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Persona Switcher for Testing in Dev */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Role Switcher:</span>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('Admin')}
              className={`px-2 py-1 rounded-xl transition-colors ${
                currentUser.role === 'Admin' ? 'bg-blue-800 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('Finance')}
              className={`px-2 py-1 rounded-xl transition-colors ${
                currentUser.role === 'Finance' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              Finance
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('Teacher')}
              className={`px-2 py-1 rounded-xl transition-colors ${
                currentUser.role === 'Teacher' ? 'bg-indigo-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              Teacher
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('Registrar')}
              className={`px-2 py-1 rounded-xl transition-colors ${
                currentUser.role === 'Registrar' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('DOS')}
              className={`px-2 py-1 rounded-xl transition-colors ${
                currentUser.role === 'DOS' ? 'bg-amber-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              DOS
            </button>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
          >
            View Public Site
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Role-Based Dynamic Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        {/* 1. FINANCE OFFICER PORTAL (Accessible to Finance Officer and Admin) */}
        {(currentUser.role === 'Finance' || currentUser.role === 'Admin') && (
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'finance'
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-300" />
            <span>Accounting & Ledger Portal</span>
          </button>
        )}

        {/* 2. TEACHER CLASSROOM & PORTAL (Accessible to Teacher and Admin) */}
        {(currentUser.role === 'Teacher' || currentUser.role === 'Admin') && (
          <button
            onClick={() => setActiveTab('teacher_classroom')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'teacher_classroom'
                ? 'bg-indigo-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>My Classroom & Streams</span>
          </button>
        )}

        {/* 3. REGISTRAR ADMISSIONS & ENROLLMENT SUITE (Accessible to Registrar and Admin) */}
        {(currentUser.role === 'Registrar' || currentUser.role === 'Admin') && (
          <button
            onClick={() => setActiveTab('registrar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'registrar'
                ? 'bg-purple-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-300" />
            <span>Admissions & Enrollment Suite</span>
          </button>
        )}

        {/* 4. STUDENT ENROLLMENT & CREDENTIALS (Admin and DOS) */}
        {(currentUser.role === 'Admin' || currentUser.role === 'DOS') && (
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'students' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Enrollment & Credentials ({studentList.length})</span>
          </button>
        )}

        {/* 5. REGISTRATION CONFIRMATIONS (Admin, DOS, Registrar) */}
        {(currentUser.role === 'Admin' || currentUser.role === 'DOS' || currentUser.role === 'Registrar') && (
          <button
            onClick={() => setActiveTab('confirmations')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'confirmations' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Registration Confirmations ({applications.filter(a => a.status === 'Pending Confirmation').length})</span>
          </button>
        )}

        {/* 6. ATTENDANCE TRACKER (Admin, DOS, DOD, Teacher) */}
        {(currentUser.role === 'Admin' || currentUser.role === 'DOS' || currentUser.role === 'DOD' || currentUser.role === 'Teacher') && (
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'attendance' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span>{currentUser.role === 'Teacher' ? 'Daily Class Attendance' : 'School Attendance Tracker'}</span>
          </button>
        )}

        {/* 7. REGISTRATION DOCUMENTATION (Admin, DOS, Registrar) */}
        {(currentUser.role === 'Admin' || currentUser.role === 'DOS' || currentUser.role === 'Registrar') && (
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'documents' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Registration Documentation ({docList.length})</span>
          </button>
        )}

        {/* 8. STAFF ENROLLMENT (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'staff' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Staff Roles & Enrollment ({staffList.length})</span>
          </button>
        )}

        {/* 9. UPDATE WEBSITE CONTENT (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'settings' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Update Website Content</span>
          </button>
        )}

        {/* 10. SCHOOL IMAGES & GALLERY (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'gallery' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>School Images & Gallery ({galleryItems.length})</span>
          </button>
        )}

        {/* 11. NEWS & ANNOUNCEMENTS (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'news' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>News & Announcements ({announcements.length})</span>
          </button>
        )}

        {/* 12. INQUIRIES (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'inquiries' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries ({inquiries.length})</span>
          </button>
        )}

        {/* 13. GMAIL & NODEMAILER (Admin Only) */}
        {currentUser.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'gmail' ? 'bg-blue-800 text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Nodemailer & Gmail API</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ROLE TAB 1: FINANCE OFFICER PORTAL (ACCOUNTING & LEDGER) */}
      {/* ========================================================================= */}
      {activeTab === 'finance' && (currentUser.role === 'Admin' || currentUser.role === 'Finance') && (
        <FinancePortal
          students={studentList}
          onTransactionsUpdated={() => setPaymentTransactions(getPaymentTransactions())}
        />
      )}

      {/* ========================================================================= */}
      {/* ROLE TAB 2: TEACHER CLASSROOM & PORTAL (ONLY ASSIGNED STREAMS) */}
      {/* ========================================================================= */}
      {activeTab === 'teacher_classroom' && (currentUser.role === 'Admin' || currentUser.role === 'Teacher') && (
        <TeacherPortal
          students={studentList}
          onTakeAttendance={() => {
            setActiveTab('attendance');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* ROLE TAB 3: REGISTRAR ADMISSIONS & ENROLLMENT SUITE */}
      {/* ========================================================================= */}
      {activeTab === 'registrar' && (currentUser.role === 'Admin' || currentUser.role === 'Registrar') && (
        <RegistrarPortal
          students={studentList}
          onStudentsUpdated={() => setStudentList(getEnrolledStudents())}
        />
      )}

      {/* PRINCIPAL REFUND AUTHORIZATION QUEUE MODAL */}
      <PrincipalQueueModal
        isOpen={showPrincipalQueueModal}
        onClose={() => setShowPrincipalQueueModal(false)}
        onTransactionsUpdated={() => setPaymentTransactions(getPaymentTransactions())}
      />

      {/* ========================================================================= */}
      {/* TAB 1: STAFF ENROLLMENT (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && currentUser.role === 'Admin' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Staff Directory: Roles, Credentials & Permissions
              </h2>
              <p className="text-xs text-slate-500">
                Enroll leadership, teaching, finance and admissions staff with role-based access control
              </p>
            </div>
            <button
              onClick={() => {
                setEditingStaffMember(null);
                setStaffFormData({
                  name: '',
                  role: 'Teacher',
                  email: '',
                  phone: '+250 78',
                  username: '',
                  password: '',
                  assignedSubjectOrGrade: '',
                });
                setShowAddStaffModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Staff Member</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5">Staff Name</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Password</th>
                  <th className="p-3.5">Assigned Subject / Class</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${
                        st.role === 'Admin' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                        st.role === 'Finance' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                        st.role === 'Teacher' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                        st.role === 'Registrar' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                        st.role === 'DOS' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        st.role === 'DOD' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {st.role === 'Finance' ? 'Finance Officer' :
                         st.role === 'Registrar' ? 'Registrar' :
                         st.role === 'Teacher' ? 'Class Teacher' :
                         st.role === 'Admin' ? 'Headmaster / Admin' :
                         st.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-blue-700 font-semibold">{st.username}</td>
                    <td className="p-3.5 font-mono text-slate-600 bg-slate-50 rounded px-2">{st.password}</td>
                    <td className="p-3.5 text-slate-600">{st.assignedSubjectOrGrade || 'N/A'}</td>
                    <td className="p-3.5 font-mono text-slate-600">{st.phone}</td>
                    <td className="p-3.5 text-right flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStaffMember(st);
                          setStaffFormData({
                            name: st.name,
                            role: st.role,
                            email: st.email,
                            phone: st.phone,
                            username: st.username,
                            password: st.password,
                            assignedSubjectOrGrade: st.assignedSubjectOrGrade || '',
                          });
                          setShowAddStaffModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Staff Member & Role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {st.role !== 'Admin' && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'staff', id: st.id, name: st.name })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Staff Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT ENROLLMENT & CREDENTIALS (DOS & ADMIN) */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Student Enrollment & Credentials Portal
                </h2>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  DOS Objective
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Enroll students, generate their unique Registration ID, and issue their personal login credentials
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setShowAddStudentModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll Student</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5">Reg ID</th>
                  <th className="p-3.5">Student Full Name</th>
                  <th className="p-3.5">Class Level</th>
                  <th className="p-3.5">Student Username</th>
                  <th className="p-3.5">Student Password</th>
                  <th className="p-3.5">Parent Email</th>
                  <th className="p-3.5">Parent Phone</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono font-bold text-blue-700">{st.regNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-3.5">
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-sm font-bold text-[10px]">
                        {st.gradeCode}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-700 font-semibold">{st.studentUsername}</td>
                    <td className="p-3.5 font-mono text-slate-600 bg-slate-50 rounded px-2">{st.studentPassword}</td>
                    <td className="p-3.5 text-slate-600 font-mono">{st.parentEmail || '—'}</td>
                    <td className="p-3.5 font-mono text-slate-600">{st.parentPhone}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'student',
                            id: st.id,
                            name: `${st.fullName} (${st.regNumber})`,
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Student from Enrollment Roster"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTRATION CONFIRMATIONS, ADMISSION CHARTS & APPLICANT CHATS */}
      {/* ========================================================================= */}
      {activeTab === 'confirmations' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Admissions Management, Analytics & Applicant Communications
                </h2>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  Admin Action Console
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Track enrollment intake charts, confirm student applications, and chat directly with parents awaiting confirmation via Gmail
              </p>
            </div>

            {/* Sub-tab view toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setConfirmationsSubTab('applications')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  confirmationsSubTab === 'applications'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Applications ({applications.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmationsSubTab('chats');
                  if (!activeChatRef && chatThreads.length > 0) {
                    setActiveChatRef(chatThreads[0].refCode);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  confirmationsSubTab === 'chats'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Applicant Chats ({chatThreads.length})</span>
              </button>
            </div>
          </div>

          {/* 1. VISUAL ADMISSIONS ANALYTICS & INTAKE CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Chart 1: Admissions Pipeline Status Breakdown */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Admissions Pipeline</h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">{applications.length} Total</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-800">Pending Confirmation</span>
                    <span className="font-mono font-bold text-amber-900">
                      {applications.filter((a) => a.status === 'Pending Confirmation').length} ({applications.length > 0 ? Math.round((applications.filter((a) => a.status === 'Pending Confirmation').length / applications.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${applications.length > 0 ? (applications.filter((a) => a.status === 'Pending Confirmation').length / applications.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-emerald-800">Confirmed & Enrolled</span>
                    <span className="font-mono font-bold text-emerald-900">
                      {applications.filter((a) => a.status === 'Confirmed & Enrolled').length} ({applications.length > 0 ? Math.round((applications.filter((a) => a.status === 'Confirmed & Enrolled').length / applications.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${applications.length > 0 ? (applications.filter((a) => a.status === 'Confirmed & Enrolled').length / applications.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Direct Gmail automated notifications</span>
                <span className="text-emerald-700 font-bold">Live Active</span>
              </div>
            </div>

            {/* Chart 2: Grade Level Intake Demand Bar Chart */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Class Intake Demand</h3>
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                  Nursery & Primary
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {['N-BABY', 'N-MID', 'N-TOP', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((gCode) => {
                  const count = applications.filter((a) => a.gradeCode === gCode).length;
                  const maxCount = Math.max(1, ...applications.map(() => 4));
                  return (
                    <div key={gCode} className="flex items-center gap-2 text-[11px]">
                      <span className="w-12 font-mono font-bold text-slate-600 shrink-0">{gCode}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (count / maxCount) * 100)}%` }}
                        />
                      </div>
                      <span className="w-5 text-right font-mono font-bold text-slate-700">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 3: Campus Amenities Demand Chart (Lunch & Transport) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Boarding & Amenities</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">Service Requests</span>
              </div>

              <div className="space-y-4 pt-1">
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-950">Hot Nutritious Lunch</span>
                    <span className="font-mono font-bold text-amber-800">
                      {applications.filter((a) => a.wantsLunch).length} / {applications.length} pupils
                    </span>
                  </div>
                  <div className="h-2 w-full bg-amber-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full"
                      style={{
                        width: `${applications.length > 0 ? (applications.filter((a) => a.wantsLunch).length / applications.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-950">School Van Transport</span>
                    <span className="font-mono font-bold text-blue-800">
                      {applications.filter((a) => a.wantsTransport).length} / {applications.length} pupils
                    </span>
                  </div>
                  <div className="h-2 w-full bg-blue-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${applications.length > 0 ? (applications.filter((a) => a.wantsTransport).length / applications.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Catering & van logistics coordinated at Mugina Police Station campus hub.
              </p>
            </div>
          </div>

          {/* 2. SUB-TAB VIEW: APPLICATIONS LIST OR APPLICANT CHATS */}
          {confirmationsSubTab === 'applications' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered Pupils Awaiting & Confirmed ({applications.length})
                </h3>
                <span className="text-xs text-slate-400">Click &ldquo;Chat with Parent&rdquo; or &ldquo;Review & Confirm&rdquo;</span>
              </div>

              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    app.status === 'Pending Confirmation'
                      ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900">{app.studentName}</span>
                      <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                        {app.gradeCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'Pending Confirmation'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Ref: {app.refCode} · Submitted: {app.createdAt}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700 block">Parent / Guardian:</span>
                      <span>{app.parentName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block">Parent Email:</span>
                      <span className="font-mono text-blue-700">{app.parentEmail || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block">Parent Phone:</span>
                      <span className="font-mono">{app.parentPhone}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block">Residence / Services:</span>
                      <span>{app.sector} · {app.wantsLunch ? 'Lunch' : 'No lunch'} · {app.wantsTransport ? 'Bus' : 'No bus'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChatRef(app.refCode);
                          setConfirmationsSubTab('chats');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                        <span>Chat with Parent</span>
                      </button>

                      {app.parentEmail && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-600" />
                          <span>Connected to parent Gmail</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status === 'Pending Confirmation' ? (
                        <button
                          onClick={() => {
                            setConfirmAppTarget(app);
                            setConfirmStudentUser(`stu.${app.studentName.toLowerCase().replace(/\s+/g, '')}`);
                            setConfirmStudentPass('mugina@2026');
                          }}
                          className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          <span>Review & Confirm Registration</span>
                        </button>
                      ) : (
                        <div className="text-xs text-emerald-800 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <span>
                            Confirmed on {app.confirmedAt}. ID: <code>{app.assignedStudentId}</code>
                          </span>
                          <span className="text-emerald-700 font-semibold">[Feedback & Credentials Sent]</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'application',
                            id: app.id,
                            name: `${app.studentName} (Ref: ${app.refCode})`,
                          })
                        }
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Application Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* APPLICANT LIVE CHATS & DIRECT GMAIL DISPATCH CONSOLE */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
              {/* Left Column: Thread List */}
              <div className="md:col-span-4 border-r border-slate-200 flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Applicant Threads ({chatThreads.length})
                  </h4>
                  <button
                    onClick={fetchChatThreads}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                    title="Refresh threads"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[540px]">
                  {chatThreads.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>No chat conversations initiated yet.</p>
                    </div>
                  ) : (
                    chatThreads.map((t) => {
                      const isSelected = activeChatRef === t.refCode;
                      const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
                      return (
                        <button
                          key={t.refCode}
                          type="button"
                          onClick={() => setActiveChatRef(t.refCode)}
                          className={`w-full text-left p-3.5 transition-colors block ${
                            isSelected ? 'bg-blue-50/70 border-l-4 border-blue-700' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">{t.studentName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                                t.status === 'Confirmed & Enrolled'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t.status === 'Confirmed & Enrolled' ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                            {t.refCode} · {t.gradeCode} · Parent: {t.parentName}
                          </p>
                          {lastMsg && (
                            <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-1">
                              &ldquo;{lastMsg.text}&rdquo;
                            </p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Active Conversation Thread */}
              <div className="md:col-span-8 flex flex-col justify-between bg-slate-50/30">
                {activeChatRef && chatThreads.find((t) => t.refCode === activeChatRef) ? (
                  (() => {
                    const currentThread = chatThreads.find((t) => t.refCode === activeChatRef)!;
                    const linkedApp = applications.find((a) => a.refCode === currentThread.refCode);
                    return (
                      <>
                        {/* Conversation Header */}
                        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {currentThread.studentName} ({currentThread.gradeCode})
                              </h4>
                              <span className="text-xs font-mono text-slate-500">Ref: {currentThread.refCode}</span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Parent: <strong>{currentThread.parentName}</strong> · Phone: {currentThread.parentPhone} · Gmail: <code>{currentThread.parentEmail || 'N/A'}</code>
                            </p>
                          </div>

                          {linkedApp && linkedApp.status === 'Pending Confirmation' && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmAppTarget(linkedApp);
                                setConfirmStudentUser(`stu.${linkedApp.studentName.toLowerCase().replace(/\s+/g, '')}`);
                                setConfirmStudentPass('mugina@2026');
                              }}
                              className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                            >
                              Review & Confirm
                            </button>
                          )}
                        </div>

                        {/* Messages Area */}
                        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 max-h-[440px]">
                          {currentThread.messages.map((m: any) => {
                            const isAdmin = m.sender === 'admin';
                            const isSystem = m.sender === 'system';

                            if (isSystem) {
                              return (
                                <div
                                  key={m.id}
                                  className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs text-center border border-slate-200"
                                >
                                  <p className="font-semibold">{m.text}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={m.id}
                                className={`flex gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isAdmin && (
                                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                    P
                                  </div>
                                )}

                                <div
                                  className={`max-w-[80%] rounded-2xl p-3.5 space-y-1 shadow-2xs ${
                                    isAdmin
                                      ? 'bg-blue-900 text-white'
                                      : 'bg-white text-slate-900 border border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                                    <span className="font-bold">{m.senderName}</span>
                                    <span className="font-mono">
                                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                    {m.text}
                                  </p>
                                </div>

                                {isAdmin && (
                                  <div className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                    NM
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Reply Form (Emails Parent Automatically) */}
                        <div className="p-4 bg-white border-t border-slate-200">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendAdminReply(currentThread.refCode);
                            }}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              placeholder={`Type response to ${currentThread.parentName || 'parent'} (dispatches to their Gmail)...`}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                            />
                            <button
                              type="submit"
                              disabled={isSendingReply || !adminReplyText.trim()}
                              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                            >
                              {isSendingReply ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Send & Email Parent</span>
                                </>
                              )}
                            </button>
                          </form>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-600" />
                            <span>
                              Your message automatically sends an email to <code>{currentThread.parentEmail || 'the parent’s Gmail'}</code>.
                            </span>
                          </p>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-center space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                    <h5 className="text-sm font-bold text-slate-600">No Thread Selected</h5>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Select an applicant from the left list to read messages and reply directly via parent Gmail.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT ATTENDANCE TRACKER & PARENT GMAIL ALERT */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <AdminAttendanceTracker onRecordSaved={() => setStudentList(getEnrolledStudents())} />
      )}

      {/* ========================================================================= */}
      {/* TAB: REQUIRED REGISTRATION DOCUMENTATION (ADMIN & DOS SETTINGS) */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Required Registration Documentation Checklist
                </h2>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  Admin & DOS Configuration
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Set and manage required enrollment documents. New or modified requirements appear live on the public Admissions page and application form.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDoc(null);
                setDocFormData({
                  title: '',
                  description: '',
                  isRequired: true,
                  applicableGrades: 'All Grades (Nursery & Primary)',
                  formatHint: '',
                });
                setShowDocModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Registration Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docList.map((doc, idx) => (
              <div key={doc.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      doc.isRequired ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.isRequired ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    <span className="font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      Grades: {doc.applicableGrades}
                    </span>
                    {doc.formatHint && (
                      <span className="text-slate-500 italic">
                        Format: {doc.formatHint}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingDoc(doc);
                      setDocFormData({
                        title: doc.title,
                        description: doc.description,
                        isRequired: doc.isRequired,
                        applicableGrades: doc.applicableGrades,
                        formatHint: doc.formatHint || '',
                      });
                      setShowDocModal(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Requirement</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SCHOOL IMAGES & GALLERY MANAGER (UPLOAD & FIREBASE STORAGE) */}
      {/* ========================================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                School Images & Gallery Manager
              </h2>
              <p className="text-xs text-slate-500">
                Upload new photos directly from your device or manage school assets. Images update live in the public gallery.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingImageItem(null);
                setImageFormData({ title: '', category: 'outdoor', description: '', caption: '', imageSrc: '' });
                setShowAddImageModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>Upload New School Image</span>
            </button>
          </div>

          {/* Gallery Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img src={item.imageSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase bg-slate-900/80 text-white px-2 py-0.5 rounded-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    <p className="text-[11px] text-slate-400 italic mt-1">{item.caption}</p>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {item.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingImageItem(item);
                        setImageFormData({
                          title: item.title,
                          category: item.category,
                          description: item.description,
                          caption: item.caption,
                          imageSrc: item.imageSrc,
                        });
                        setShowAddImageModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                      title="Edit Image Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'gallery',
                          id: item.id,
                          name: item.title,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: NEWS & ANNOUNCEMENTS (FULL CRUD & EDIT) */}
      {/* ========================================================================= */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Website News & Public Announcements
              </h2>
              <p className="text-xs text-slate-500">
                Add, edit, or toggle marquee news alerts displayed on the top of the school website
              </p>
            </div>
            <button
              onClick={() => {
                setEditingNewsItem(null);
                setNewsFormData({ title: '', content: '', badge: 'Admissions Alert', isActive: true });
                setShowNewsModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md uppercase">
                      {ann.badge || 'News'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ann.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {ann.isActive ? 'Live on Website' : 'Draft / Inactive'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {ann.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Published: {ann.publishedAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingNewsItem(ann);
                        setNewsFormData({
                          title: ann.title,
                          content: ann.content,
                          badge: ann.badge || 'Announcement',
                          isActive: ann.isActive,
                        });
                        setShowNewsModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200"
                    >
                      Edit Announcement
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'news',
                          id: ann.id,
                          name: ann.title,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: INCOMING INQUIRIES & CONTACT MESSAGES */}
      {/* ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Contact Inquiries from Website
              </h2>
              <p className="text-xs text-slate-500">
                Inquiries forwarded automatically to official Gmail ({adminEmail})
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {inquiries.length}</span>
          </div>

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inq.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">{inq.status}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{inq.createdAt}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <div><strong>Phone:</strong> {inq.phone}</div>
                  <div><strong>Email:</strong> {inq.email || 'N/A'}</div>
                  <div><strong>Subject:</strong> {inq.subject}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">{inq.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: GMAIL & NODEMAILER CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'gmail' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Mail className="w-6 h-6 text-blue-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Backend Nodemailer & Gmail API Engine
              </h2>
              <p className="text-xs text-slate-500">
                All contact form submissions and absent student alerts are forwarded to the school Gmail account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <strong className="block font-bold">Official School Gmail:</strong>
                <span className="font-mono text-sm font-bold">{adminEmail}</span>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Active recipient for all incoming website messages and inquiries.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Update Official Notification Gmail:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                  <button
                    onClick={() => {
                      setAdminNotificationEmail(adminEmail);
                      setDeleteSuccessMsg('Updated school notification email to ' + adminEmail);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <strong className="block font-bold text-slate-900 uppercase">Automated Endpoints Active:</strong>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px]">
                POST /api/contact → Forwards inquiries + automated parent feedback
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px]">
                POST /api/attendance/notify → Dispatches Gmail alert to parents of absent pupils
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px]">
                POST /api/admissions/confirm → Dispatches DOS approval + student portal credentials
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: UPDATE WEBSITE CONTENT (ADMIN & HEADTEACHER) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (currentUser.role === 'Admin' || currentUser.role === 'DOS') && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <Globe className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  Update Public Website Content & School Info
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Update school name, mottos, official phone number, email, admission notices, tuition fees, and homepage text. Changes publish live instantly across the website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Website</span>
            </button>
          </div>

          {websiteSettingsSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-950">
                  <strong className="block font-bold">Website Updated & Published Successfully!</strong>
                  <span>Your changes have been saved to the school database and are now live for all visitors.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                View Live
              </button>
            </div>
          )}

          <form onSubmit={handleSaveWebsiteSettings} className="space-y-6">
            {/* 1. School Identity & Branding */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <span>1. School Identity & Official Names</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Defines how the academy appears in the header, footer, admissions letters, and printable forms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Full School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteSettings.schoolName}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, schoolName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteSettings.shortName}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, shortName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    School Motto (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteSettings.motto}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, motto: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    School Motto (Kinyarwanda) *
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteSettings.mottoKinyarwanda}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, mottoKinyarwanda: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Welcome / Headteacher Message (Shown on Public Homepage & About Us)
                  </label>
                  <textarea
                    rows={3}
                    value={websiteSettings.welcomeMessage}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, welcomeMessage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 2. Top Banner Announcements & Term Notices */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>2. Top Announcement Bar & Admissions Notices</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Displayed at the very top of all pages and in the Admissions header.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Top Website Announcement Bar Text
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.announcementBarText || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, announcementBarText: e.target.value })}
                    placeholder="e.g. Term 1 2026 Admissions Open · Nursery & Primary Excellence in Kamonyi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Academic Term Dates & Schedule
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.termDatesNotice || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, termDatesNotice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registration & Application Fee Notice
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.registrationFeeNotice || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, registrationFeeNotice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 3. Official Contact Numbers, Emails & Physical Address */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>3. Official Contact Details & Physical Location</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Powers the click-to-call buttons, WhatsApp links, contact page, and map directions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    School Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={websiteSettings.phone}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official School Email (Admin Gmail) *
                  </label>
                  <input
                    type="email"
                    required
                    value={websiteSettings.officialEmail}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, officialEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admissions Desk Email
                  </label>
                  <input
                    type="email"
                    value={websiteSettings.admissionsEmail}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, admissionsEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Landmark / Security Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteSettings.landmark}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, landmark: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Physical Campus Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteSettings.fullAddress}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, fullAddress: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 4. Tuition & Fee Schedule */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>4. School Fees & Tuition Structure (Publicly Displayed)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Displayed on the admissions page and fee estimator for prospective parents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nursery Tuition Fee (Per Term)
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.nurseryTuition || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, nurseryTuition: e.target.value })}
                    placeholder="e.g. 45,000 RWF / Term"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Tuition Fee (Per Term)
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.primaryTuition || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, primaryTuition: e.target.value })}
                    placeholder="e.g. 60,000 RWF / Term"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lunch & Hot Porridge Fee
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.lunchFee || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, lunchFee: e.target.value })}
                    placeholder="e.g. 25,000 RWF / Term"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    School Bus Transport Pickup Fee
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.transportFee || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, transportFee: e.target.value })}
                    placeholder="e.g. 30,000 RWF / Term"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 5. Public Homepage Hero Section */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>5. Public Homepage Hero Section</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Customizes the main headline and introduction displayed on the home page.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Homepage Hero Main Headline
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.heroHeadline || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, heroHeadline: e.target.value })}
                    placeholder="e.g. Welcome to Mugina Hope Primary & Nursery Academy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Homepage Hero Subtitle / Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={websiteSettings.heroTagline || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, heroTagline: e.target.value })}
                    placeholder="e.g. Nurturing purposeful, confident, and compassionate young leaders in Kamonyi District since 2014."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="sticky bottom-6 z-20 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs space-y-0.5">
                <strong className="block text-sm font-bold text-white">Save Changes to Public Website</strong>
                <span className="text-slate-400">Updates will be synced to server and published immediately to all visitors.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel / View Site
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Save Website Updates & Publish Live</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal: Add Staff Member */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">
                {editingStaffMember
                  ? `Edit Staff Member (${editingStaffMember.name})`
                  : 'Enroll Staff Member (Teacher / Finance / Registrar / DOS / DOD)'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddStaffModal(false);
                  setEditingStaffMember(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jean Damascene Murwanashyaka"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Role *</label>
                  <select
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as StaffMember['role'] })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                  >
                    <option value="Teacher">Teacher (Classroom & Portal)</option>
                    <option value="Finance">Finance Officer (Accounting & Ledger)</option>
                    <option value="Registrar">Registrar (Admissions & Enrollment)</option>
                    <option value="DOS">DOS (Director of Studies)</option>
                    <option value="DOD">DOD (Director of Discipline)</option>
                    <option value="Admin">Admin (Headmaster / Principal)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Assigned Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. finance.mugina"
                    value={staffFormData.username}
                    onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. finance2026"
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Assigned Subject or Department</label>
                <input
                  type="text"
                  placeholder="e.g. Primary 4 STEM, Accounting & Fees, or Admissions"
                  value={staffFormData.assignedSubjectOrGrade}
                  onChange={(e) => setStaffFormData({ ...staffFormData, assignedSubjectOrGrade: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setEditingStaffMember(null);
                  }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  {editingStaffMember ? 'Save Changes' : 'Enroll Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student by DOS */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">DOS Student Enrollment & Credentials Creation</h3>
                <p className="text-[11px] text-slate-500">Assign learner to class and create their chosen portal credentials</p>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Registration ID *</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.regNumber}
                    onChange={(e) => setStudentFormData({ ...studentFormData, regNumber: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Class Grade *</label>
                  <select
                    value={studentFormData.gradeCode}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gradeCode: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  >
                    {ACADEMIC_GRADES.map((g) => (
                      <option key={g.code} value={g.code}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Learner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keza Aline Manzi"
                  value={studentFormData.fullName}
                  onChange={(e) => setStudentFormData({ ...studentFormData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Parent Name</label>
                  <input
                    type="text"
                    placeholder="Parent / Guardian"
                    value={studentFormData.parentName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentName: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    value={studentFormData.parentPhone}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentPhone: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Parent Email (Receives Attendance & Grade Notices)</label>
                <input
                  type="email"
                  placeholder="parent@gmail.com"
                  value={studentFormData.parentEmail}
                  onChange={(e) => setStudentFormData({ ...studentFormData, parentEmail: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-amber-900 block">Student Portal Login Credentials:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-amber-800">Student Username:</label>
                    <input
                      type="text"
                      placeholder="e.g. keza.aline"
                      value={studentFormData.studentUsername}
                      onChange={(e) => setStudentFormData({ ...studentFormData, studentUsername: e.target.value })}
                      className="w-full bg-white border border-amber-300 p-2 rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-800">Student Password:</label>
                    <input
                      type="text"
                      value={studentFormData.studentPassword}
                      onChange={(e) => setStudentFormData({ ...studentFormData, studentPassword: e.target.value })}
                      className="w-full bg-white border border-amber-300 p-2 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">Enroll & Issue Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Application (Wait for Admin/DOS Confirmation) */}
      {confirmAppTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Confirm Registration: {confirmAppTarget.studentName}</h3>
                <p className="text-[11px] text-slate-500">Provide official feedback and assign student credentials</p>
              </div>
              <button onClick={() => setConfirmAppTarget(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleConfirmApplication} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl text-slate-700 space-y-1">
                <p><strong>Applying Grade:</strong> {confirmAppTarget.gradeCode}</p>
                <p><strong>Parent:</strong> {confirmAppTarget.parentName} ({confirmAppTarget.parentPhone})</p>
                <p><strong>Parent Email:</strong> {confirmAppTarget.parentEmail || 'None'}</p>
              </div>

              <div>
                <label className="font-bold block mb-1">Official Feedback to Parent *</label>
                <textarea
                  rows={3}
                  required
                  value={confirmFeedbackNotes}
                  onChange={(e) => setConfirmFeedbackNotes(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Student Portal Username *</label>
                  <input
                    type="text"
                    required
                    value={confirmStudentUser}
                    onChange={(e) => setConfirmStudentUser(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    value={confirmStudentPass}
                    onChange={(e) => setConfirmStudentPass(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setConfirmAppTarget(null)} className="px-4 py-2 font-semibold text-slate-600">Cancel</button>
                <button
                  type="submit"
                  disabled={isConfirmingApp}
                  className="px-5 py-2.5 bg-blue-800 text-white font-bold rounded-xl"
                >
                  {isConfirmingApp ? 'Confirming & Dispatching Email...' : 'Confirm Registration & Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gallery Image Upload & Edit */}
      {showAddImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">{editingImageItem ? 'Edit School Photo Details' : 'Upload School Photo (Gallery Asset)'}</h3>
              <button onClick={() => setShowAddImageModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveGalleryImage} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Image Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hope Primary Campus Grounds"
                  value={imageFormData.title}
                  onChange={(e) => setImageFormData({ ...imageFormData, title: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Category *</label>
                <select
                  value={imageFormData.category}
                  onChange={(e) => setImageFormData({ ...imageFormData, category: e.target.value as FacilityItem['category'] })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                >
                  <option value="outdoor">Campus Grounds & Safety</option>
                  <option value="classrooms">Classrooms & Learning</option>
                  <option value="technology">ICT & Computer Lab</option>
                  <option value="culture">Traditional Dance & Itorero</option>
                  <option value="sports">Sports & Playground</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  <span>Secure Storage via Firebase Storage & Cloud Asset</span>
                </div>
                <p className="text-[10px] text-amber-700">
                  Photos uploaded here are hosted on our school's cloud storage bucket (<code>gen-lang-client-0615304204.firebasestorage.app</code>) and instantly displayed across all campus gallery views.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full bg-white border border-amber-300 p-2 rounded-xl text-xs"
                />
                {imageUploadStatus && <p className="text-[11px] font-semibold text-emerald-700 mt-1">{imageUploadStatus}</p>}
              </div>

              <div>
                <label className="font-bold block mb-1">Or Paste Existing Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageFormData.imageSrc}
                  onChange={(e) => setImageFormData({ ...imageFormData, imageSrc: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-mono text-[11px]"
                />
              </div>

              {imageFormData.imageSrc && (
                <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={imageFormData.imageSrc} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="font-bold block mb-1">Description / Caption</label>
                <textarea
                  rows={2}
                  placeholder="Caption for school visitors..."
                  value={imageFormData.description}
                  onChange={(e) => setImageFormData({ ...imageFormData, description: e.target.value, caption: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddImageModal(false)} className="px-4 py-2 font-semibold text-slate-600">Cancel</button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl flex items-center gap-2"
                >
                  {isUploadingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Firebase Storage...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Save & Publish to Gallery</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: News & Announcement Form */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">{editingNewsItem ? 'Edit Announcement' : 'New Website Announcement'}</h3>
              <button onClick={() => setShowNewsModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSaveNews} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Registration Open"
                  value={newsFormData.title}
                  onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Important Notice"
                    value={newsFormData.badge}
                    onChange={(e) => setNewsFormData({ ...newsFormData, badge: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Status</label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsFormData.isActive}
                      onChange={(e) => setNewsFormData({ ...newsFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Active on Website</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Content Prose *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Announcement text..."
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewsModal(false)} className="px-4 py-2 font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-800 text-white font-bold rounded-xl">Save Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Required Registration Document Form */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingDoc ? 'Edit Registration Document Requirement' : 'Add Required Registration Document'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Immunization & Vaccination Card"
                  value={docFormData.title}
                  onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description & Purpose *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this document is required and where parents can obtain it (e.g. Irembo, health center)..."
                  value={docFormData.description}
                  onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Applicable Grades</label>
                  <select
                    value={docFormData.applicableGrades}
                    onChange={(e) => setDocFormData({ ...docFormData, applicableGrades: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800"
                  >
                    <option value="All Grades (Nursery & Primary)">All Grades (Nursery & Primary)</option>
                    <option value="Nursery Only (Baby, Middle, Pre-Primary)">Nursery Only (Baby, Middle, Pre-Primary)</option>
                    <option value="Primary 1 to Primary 6">Primary 1 to Primary 6</option>
                    <option value="Transfer Students (P1 - P6)">Transfer Students (P1 - P6)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Requirement Status</label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docFormData.isRequired}
                      onChange={(e) => setDocFormData({ ...docFormData, isRequired: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">Mandatory</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Acceptable Format Hint</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Irembo printout or original booklet copy"
                  value={docFormData.formatHint}
                  onChange={(e) => setDocFormData({ ...docFormData, formatHint: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingDoc ? 'Update Requirement' : 'Save & Publish Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP RECORD DELETION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Confirm Permanent Deletion
                </h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {deleteTarget.type === 'staff'
                    ? 'Staff Member'
                    : deleteTarget.type === 'student'
                    ? 'Enrolled Student'
                    : deleteTarget.type === 'doc'
                    ? 'Registration Requirement'
                    : deleteTarget.type === 'gallery'
                    ? 'Gallery Image'
                    : deleteTarget.type === 'news'
                    ? 'Announcement'
                    : 'Application Record'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 text-xs text-slate-600">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Item to be permanently deleted:
              </span>
              <p className="font-bold text-sm text-slate-900 break-words">{deleteTarget.name}</p>
              <p className="text-[11px] text-rose-600 font-medium pt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>This record will be permanently purged from the school database.</span>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Deletion Success Notification */}
      {deleteSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold text-slate-100 flex-1">{deleteSuccessMsg}</p>
          <button
            type="button"
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
