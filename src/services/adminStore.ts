import { FacilityItem } from '../types';
import { FACILITIES_LIST } from '../data/schoolData';

export type UserRole = 'Admin' | 'DOS' | 'Finance' | 'Registrar' | 'Teacher' | 'DOD' | 'Student';

export interface StaffMember {
  id: string;
  name: string;
  role: 'Admin' | 'DOS' | 'Finance' | 'Registrar' | 'Teacher' | 'DOD';
  email: string;
  phone: string;
  username: string;
  password: string;
  assignedSubjectOrGrade?: string;
  enrolledAt: string;
  status: 'Active' | 'Inactive';
}

export interface EnrolledStudent {
  id: string;
  regNumber: string;
  fullName: string;
  gender: 'Male' | 'Female';
  dob: string;
  gradeCode: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentUsername: string;
  studentPassword: string;
  enrolledBy: string;
  enrolledAt: string;
  status: 'Active' | 'Awaiting Approval' | 'Suspended';
  feedbackNotes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  gradeCode: string;
  studentId: string;
  studentName: string;
  parentEmail: string;
  parentPhone: string;
  status: 'Present' | 'Absent' | 'Late';
  markedBy: string;
  notes?: string;
  emailNotified: boolean;
}

export interface AdminInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'New' | 'Replied' | 'Closed';
  emailSentStatus?: string;
}

export interface AdminApplication {
  id: string;
  refCode: string;
  studentName: string;
  gender: string;
  dob: string;
  gradeCode: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  sector: string;
  wantsLunch: boolean;
  wantsTransport: boolean;
  status: 'Pending Confirmation' | 'Confirmed & Enrolled' | 'Waitlist';
  feedbackNotes?: string;
  assignedStudentId?: string;
  createdAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface AdminTourBooking {
  id: string;
  parentName: string;
  phone: string;
  date: string;
  timeSlot: string;
  gradeInterest: string;
  guestsCount: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  badge?: string;
  isActive: boolean;
  publishedAt: string;
}

export interface RegistrationDocument {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  applicableGrades: string;
  formatHint?: string;
  order: number;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  regNumber: string;
  gradeCode: string;
  paymentType: 'Tuition Fee' | 'Uniform & Supplies' | 'Lunch Program' | 'School Transport' | 'Registration Fee' | 'Examination Fee';
  amount: number; // in RWF
  paymentMethod: 'Cash' | 'Bank Deposit (BK)' | 'Bank Transfer' | 'MTN Mobile Money' | 'Airtel Money';
  bankSlipRef?: string;
  recordedBy: string;
  recordedAt: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
  status: 'Completed' | 'Refund Requested' | 'Refund Approved' | 'Refund Rejected';
  refundReason?: string;
  refundRequestedAt?: string;
  refundRequestedBy?: string;
  refundReviewedAt?: string;
  refundReviewedBy?: string;
  refundReviewNote?: string;
}

const STORAGE_KEYS = {
  STAFF: 'mugina_staff_members_v3',
  STUDENTS: 'mugina_enrolled_students_v3',
  ATTENDANCE: 'mugina_attendance_records_v3',
  PAYMENTS: 'mugina_payment_transactions_v3',
  GALLERY: 'mugina_gallery_items_v3',
  INQUIRIES: 'mugina_inquiries_v3',
  APPLICATIONS: 'mugina_applications_v3',
  TOURS: 'mugina_tours_v3',
  ANNOUNCEMENTS: 'mugina_announcements_v3',
  ADMIN_EMAIL: 'mugina_admin_notification_email_v3',
  AUTH_USER: 'mugina_auth_current_user_v3',
  DOCUMENTS: 'mugina_registration_documents_v3',
  WEBSITE_SETTINGS: 'mugina_website_settings_v3',
};

// Website Settings interface
export interface WebsiteSettings {
  schoolName: string;
  shortName: string;
  motto: string;
  mottoKinyarwanda: string;
  landmark: string;
  fullAddress: string;
  phone: string;
  officialEmail: string;
  admissionsEmail: string;
  welcomeMessage: string;
  termDatesNotice: string;
  registrationFeeNotice: string;
  announcementBarText?: string;
  heroHeadline?: string;
  heroTagline?: string;
  nurseryTuition?: string;
  primaryTuition?: string;
  lunchFee?: string;
  transportFee?: string;
}

export const defaultWebsiteSettings: WebsiteSettings = {
  schoolName: 'Mugina Hope Primary & Nursery Academy',
  shortName: 'Mugina Hope Academy',
  motto: 'We learn for our better future',
  mottoKinyarwanda: 'Twigira ejo hacu heza',
  landmark: 'Adjacent to Mugina Police Station',
  fullAddress: 'Mugina Center, Next to Mugina Police Post, Kamonyi District, Southern Province, Rwanda',
  phone: '+250 788 258 786',
  officialEmail: 'norbertihimbazwemanzi@gmail.com',
  admissionsEmail: 'admissions@muginahopeschool.com',
  welcomeMessage: 'Welcome to Mugina Hope Primary & Nursery Academy. We nurture academic rigor, moral integrity, and Rwandan cultural values in every child.',
  termDatesNotice: 'Academic Year 2026: Term 1 underway. Term 2 registration currently open.',
  registrationFeeNotice: 'Application fee: 10,000 RWF (Registration, evaluation, student file & ID card).',
  announcementBarText: 'Term 1 2026 Admissions Open · Nursery & Primary Excellence in Kamonyi · Adjacent to Mugina Police Station',
  heroHeadline: 'Welcome to Mugina Hope Primary & Nursery Academy',
  heroTagline: 'Nurturing purposeful, confident, and compassionate young leaders in Kamonyi District since 2014.',
  nurseryTuition: '45,000 RWF / Term',
  primaryTuition: '60,000 RWF / Term',
  lunchFee: '25,000 RWF / Term (Hot balanced lunch & porridge)',
  transportFee: '30,000 RWF / Term (Kamonyi van pickup & drop-off)',
};

// Initial Seed Staff with exact requested admin & headteacher accounts
const defaultStaff: StaffMember[] = [
  {
    id: 'staff-admin-norbert',
    name: 'Norbert Ihimbazwe Manzi (School Administrator)',
    role: 'Admin',
    email: 'norbertihimbazwemanzi@gmail.com',
    phone: '+250 798 744 704',
    username: 'norbertihimbazwemanzi@gmail.com',
    password: '@0798744704',
    assignedSubjectOrGrade: 'Chief Administrator & Portal Controller',
    enrolledAt: '2026-01-01',
    status: 'Active',
  },
  {
    id: 'staff-headteacher-1',
    name: 'Headteacher / School Principal',
    role: 'Admin', // Headteacher has full admin-level access just like admin
    email: 'headteacher@muginahopeschool.com',
    phone: '+250 788 258 786',
    username: 'hopeprimaryschool',
    password: 'hopeprimary@123',
    assignedSubjectOrGrade: 'Executive School Leadership & Administration',
    enrolledAt: '2026-01-02',
    status: 'Active',
  },
  {
    id: 'staff-admin-legacy',
    name: 'School Administration Desk',
    role: 'Admin',
    email: 'admin@muginahopeschool.com',
    phone: '+250 788 258 786',
    username: 'admin',
    password: 'mugina2026',
    assignedSubjectOrGrade: 'General School Administration',
    enrolledAt: '2026-01-10',
    status: 'Active',
  },
  {
    id: 'staff-dos-1',
    name: 'Jean Damascene Murwanashyaka',
    role: 'DOS',
    email: 'dos@muginahopeschool.com',
    phone: '+250 788 345 678',
    username: 'dos.mugina',
    password: 'dos2026',
    assignedSubjectOrGrade: 'Director of Studies / Curriculum & Admissions',
    enrolledAt: '2026-01-15',
    status: 'Active',
  },
  {
    id: 'staff-finance-1',
    name: 'Eric Bizimana',
    role: 'Finance',
    email: 'finance@muginahopeschool.com',
    phone: '+250 788 444 555',
    username: 'finance.mugina',
    password: 'finance2026',
    assignedSubjectOrGrade: 'Finance Officer (Accounting & Ledger Portal)',
    enrolledAt: '2026-01-16',
    status: 'Active',
  },
  {
    id: 'staff-registrar-1',
    name: 'Chantal Mukashyaka',
    role: 'Registrar',
    email: 'registrar@muginahopeschool.com',
    phone: '+250 788 666 777',
    username: 'registrar.mugina',
    password: 'registrar2026',
    assignedSubjectOrGrade: 'Registrar (Admissions & Enrollment Suite)',
    enrolledAt: '2026-01-17',
    status: 'Active',
  },
  {
    id: 'staff-dod-1',
    name: 'Patrick Niyitegeka',
    role: 'DOD',
    email: 'dod@muginahopeschool.com',
    phone: '+250 788 567 890',
    username: 'dod.mugina',
    password: 'dod2026',
    assignedSubjectOrGrade: 'Director of Discipline / Attendance Officer',
    enrolledAt: '2026-01-18',
    status: 'Active',
  },
  {
    id: 'staff-teacher-1',
    name: 'Marie Claire Uwimana',
    role: 'Teacher',
    email: 'uwimana.m@muginahopeschool.com',
    phone: '+250 788 789 012',
    username: 'teacher.marie',
    password: 'teach2026',
    assignedSubjectOrGrade: 'Primary 4',
    enrolledAt: '2026-02-01',
    status: 'Active',
  },
  {
    id: 'staff-teacher-2',
    name: 'Jean Paul Habimana',
    role: 'Teacher',
    email: 'habimana.jp@muginahopeschool.com',
    phone: '+250 788 890 123',
    username: 'teacher.jeanpaul',
    password: 'teach2026',
    assignedSubjectOrGrade: 'Primary 1',
    enrolledAt: '2026-02-05',
    status: 'Active',
  },
];

// Initial Seed Students for Roster & Attendance
const defaultStudents: EnrolledStudent[] = [
  {
    id: 'stu-1',
    regNumber: 'MHA-2026-001',
    fullName: 'Keza Aline Manzi',
    gender: 'Female',
    dob: '2017-04-12',
    gradeCode: 'P4',
    parentName: 'Beatha Mukamana',
    parentPhone: '+250 788 111 222',
    parentEmail: 'norbertihimbazwemanzi@gmail.com', // Active test recipient
    studentUsername: 'keza.aline',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-01-20',
    status: 'Active',
  },
  {
    id: 'stu-2',
    regNumber: 'MHA-2026-002',
    fullName: 'Gasana Eric Ntwari',
    gender: 'Male',
    dob: '2017-08-20',
    gradeCode: 'P4',
    parentName: 'Jean Bosco Gasana',
    parentPhone: '+250 788 333 444',
    parentEmail: 'gasana.parent@gmail.com',
    studentUsername: 'gasana.eric',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-01-21',
    status: 'Active',
  },
  {
    id: 'stu-3',
    regNumber: 'MHA-2026-003',
    fullName: 'Ingabire Divine',
    gender: 'Female',
    dob: '2017-02-15',
    gradeCode: 'P4',
    parentName: 'Claudine Uwimana',
    parentPhone: '+250 788 555 666',
    parentEmail: 'claudine.uw@gmail.com',
    studentUsername: 'ingabire.d',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-01-22',
    status: 'Active',
  },
  {
    id: 'stu-4',
    regNumber: 'MHA-2026-004',
    fullName: 'Mugisha Christian',
    gender: 'Male',
    dob: '2017-11-05',
    gradeCode: 'P4',
    parentName: 'Emmanuel Nshimiyimana',
    parentPhone: '+250 788 777 888',
    parentEmail: 'emmanuel.n@gmail.com',
    studentUsername: 'mugisha.c',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-01-23',
    status: 'Active',
  },
  {
    id: 'stu-5',
    regNumber: 'MHA-2026-005',
    fullName: 'Umutoni Grace',
    gender: 'Female',
    dob: '2020-06-18',
    gradeCode: 'P1',
    parentName: 'Francine Nyiraneza',
    parentPhone: '+250 788 999 000',
    parentEmail: 'francine.ny@gmail.com',
    studentUsername: 'umutoni.g',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-01-25',
    status: 'Active',
  },
  {
    id: 'stu-6',
    regNumber: 'MHA-2026-118',
    fullName: 'agashami munezero honole',
    gender: 'Male',
    dob: '2015-03-10',
    gradeCode: 'P6',
    parentName: 'munezerokevin',
    parentPhone: '+250 788 444 888',
    parentEmail: 'munezerokevin@gmail.com',
    studentUsername: 'agashami.m',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-01-28',
    status: 'Active',
  },
  {
    id: 'stu-7',
    regNumber: 'MHA-2026-663',
    fullName: 'ma_nzi1 mr.nobody',
    gender: 'Male',
    dob: '2020-09-14',
    gradeCode: 'P1',
    parentName: 'ishimweshemabertarand',
    parentPhone: '+250 788 555 777',
    parentEmail: 'ishimweshemabertarand@gmail.com',
    studentUsername: 'manzi.mr',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-01-29',
    status: 'Active',
  },
  {
    id: 'stu-8',
    regNumber: 'MHA-2026-008',
    fullName: 'Ntwari Kevin',
    gender: 'Male',
    dob: '2015-07-22',
    gradeCode: 'P6',
    parentName: 'Sosthene Ntwari',
    parentPhone: '+250 788 222 333',
    parentEmail: 'sosthene.n@gmail.com',
    studentUsername: 'ntwari.k',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-02-01',
    status: 'Active',
  },
  {
    id: 'stu-9',
    regNumber: 'MHA-2026-009',
    fullName: 'Iradukunda Brian',
    gender: 'Male',
    dob: '2016-05-11',
    gradeCode: 'P5',
    parentName: 'Pelagie Mukamurenzi',
    parentPhone: '+250 788 333 999',
    parentEmail: 'pelagie.m@gmail.com',
    studentUsername: 'iradukunda.b',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-02-02',
    status: 'Active',
  },
  {
    id: 'stu-10',
    regNumber: 'MHA-2026-010',
    fullName: 'Mugisha David',
    gender: 'Male',
    dob: '2018-08-19',
    gradeCode: 'P3',
    parentName: 'Fidèle Hakizimana',
    parentPhone: '+250 788 666 111',
    parentEmail: 'fidele.h@gmail.com',
    studentUsername: 'mugisha.d',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-02-03',
    status: 'Active',
  },
  {
    id: 'stu-11',
    regNumber: 'MHA-2026-011',
    fullName: 'Shema Eric',
    gender: 'Male',
    dob: '2019-10-04',
    gradeCode: 'P2',
    parentName: 'Chantal Uwamahoro',
    parentPhone: '+250 788 444 000',
    parentEmail: 'chantal.u@gmail.com',
    studentUsername: 'shema.e',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-02-04',
    status: 'Active',
  },
  {
    id: 'stu-12',
    regNumber: 'MHA-2026-012',
    fullName: 'Kamikazi Joyeuse',
    gender: 'Female',
    dob: '2021-02-14',
    gradeCode: 'N-TOP',
    parentName: 'Valens Munyaneza',
    parentPhone: '+250 788 111 555',
    parentEmail: 'valens.m@gmail.com',
    studentUsername: 'kamikazi.j',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-02-05',
    status: 'Active',
  },
  {
    id: 'stu-13',
    regNumber: 'MHA-2026-013',
    fullName: 'Habimana Leo',
    gender: 'Male',
    dob: '2022-04-20',
    gradeCode: 'N-MID',
    parentName: 'Epiphanie Mukakarisa',
    parentPhone: '+250 788 222 777',
    parentEmail: 'epiphanie.m@gmail.com',
    studentUsername: 'habimana.l',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-02-06',
    status: 'Active',
  },
  {
    id: 'stu-14',
    regNumber: 'MHA-2026-014',
    fullName: 'Ineza Bella',
    gender: 'Female',
    dob: '2023-01-15',
    gradeCode: 'N-BABY',
    parentName: 'Aline Umutesi',
    parentPhone: '+250 788 333 888',
    parentEmail: 'aline.u@gmail.com',
    studentUsername: 'ineza.b',
    studentPassword: 'student@2026',
    enrolledBy: 'DOS',
    enrolledAt: '2026-02-07',
    status: 'Active',
  },
];

// Initial Seed Gallery
const initialGalleryWithCrest: FacilityItem[] = [
  {
    id: 'fac-crest',
    title: 'Muginahope Primary & Nursery Official Crest Emblem',
    category: 'culture',
    description: 'The official school crest symbol featuring the golden sun of enlightenment, an open book of knowledge, pencil of diligence, and our sacred motto: "We learn for our better future".',
    imageSrc: '/src/assets/images/school_logo_crest.svg',
    caption: 'Official school emblem of Mugina Hope Primary & Nursery Academy in Kamonyi.',
  },
  {
    id: 'fac-campus-showcase',
    title: 'Hope Primary Campus Grounds & Active Courtyard',
    category: 'outdoor',
    description: 'Scenic view of Mugina Hope campus in Kamonyi District with Rwandan flag, brick classrooms, and students walking to class.',
    imageSrc: '/src/assets/images/hero_mugina_hope_campus_1791823254957.jpg',
    caption: 'Campus academic wings nestled on the picturesque hills of Mugina Sector.',
  },
  ...FACILITIES_LIST,
];

// --- Staff Management ---
export const getStaffMembers = (): StaffMember[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (raw) {
      const parsed: StaffMember[] = JSON.parse(raw);
      // Ensure requested Norbert admin and Headteacher accounts are present with exact credentials
      const hasNorbert = parsed.some(
        (s) => s.username === 'norbertihimbazwemanzi@gmail.com' && s.password === '@0798744704'
      );
      const hasHeadteacher = parsed.some(
        (s) => s.username === 'hopeprimaryschool' && s.password === 'hopeprimary@123'
      );
      if (!hasNorbert || !hasHeadteacher) {
        let fixed = [...parsed];
        if (!hasNorbert) {
          fixed = fixed.filter((s) => s.username !== 'norbertihimbazwemanzi@gmail.com');
          fixed.unshift(defaultStaff[0]);
        }
        if (!hasHeadteacher) {
          fixed = fixed.filter((s) => s.username !== 'hopeprimaryschool');
          fixed.splice(1, 0, defaultStaff[1]);
        }
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(fixed));
        return fixed;
      }
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return defaultStaff;
};

// Persistent Server Database Synchronization
export const persistToServer = (endpoint: string, data: any) => {
  try {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((err) => {
      console.warn(`[Database Sync] Auto-sync to ${endpoint} failed:`, err);
    });
  } catch (err) {
    // quiet fallback
  }
};

export const saveStaffMembers = (list: StaffMember[]) => {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
  persistToServer('/api/staff', { items: list });
};

export const enrollStaffMember = (staff: Omit<StaffMember, 'id' | 'enrolledAt' | 'status'>): StaffMember => {
  const list = getStaffMembers();
  const newStaff: StaffMember = {
    ...staff,
    id: `staff-${Date.now()}`,
    enrolledAt: new Date().toISOString().split('T')[0],
    status: 'Active',
  };
  const updated = [newStaff, ...list];
  saveStaffMembers(updated);
  return newStaff;
};

export const updateStaffMember = (id: string, updates: Partial<StaffMember>): StaffMember[] => {
  const list = getStaffMembers();
  const updated = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveStaffMembers(updated);
  return updated;
};

export const deleteStaffMember = (id: string): StaffMember[] => {
  const list = getStaffMembers();
  const updated = list.filter((s) => s.id !== id);
  saveStaffMembers(updated);
  return updated;
};

// --- Student Enrollment Management (DOS, Registrar & Admin) ---
export const getEnrolledStudents = (): EnrolledStudent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed: EnrolledStudent[] = JSON.parse(raw);
      // Ensure screenshot seed students are included if missing
      const existingIds = new Set(parsed.map((s) => s.id));
      const missing = defaultStudents.filter((d) => !existingIds.has(d.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return defaultStudents;
};

export const saveEnrolledStudents = (list: EnrolledStudent[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  persistToServer('/api/students', { items: list });
};

export const enrollStudentByDOS = (student: Omit<EnrolledStudent, 'id' | 'enrolledAt'>): EnrolledStudent => {
  const list = getEnrolledStudents();
  const newStudent: EnrolledStudent = {
    ...student,
    id: `stu-${Date.now()}`,
    enrolledAt: new Date().toISOString().split('T')[0],
  };
  const updated = [newStudent, ...list];
  saveEnrolledStudents(updated);
  return newStudent;
};

export const updateEnrolledStudent = (id: string, updates: Partial<EnrolledStudent>): EnrolledStudent[] => {
  const list = getEnrolledStudents();
  const updated = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveEnrolledStudents(updated);
  return updated;
};

export const deleteEnrolledStudent = (id: string): EnrolledStudent[] => {
  const list = getEnrolledStudents();
  const updated = list.filter((s) => s.id !== id);
  saveEnrolledStudents(updated);
  return updated;
};

// --- Attendance Tracker ---
export const getAttendanceRecords = (date?: string, gradeCode?: string): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const records: AttendanceRecord[] = raw ? JSON.parse(raw) : [];
    return records.filter((r) => {
      if (date && r.date !== date) return false;
      if (gradeCode && r.gradeCode !== gradeCode) return false;
      return true;
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveAttendanceBatch = (newRecords: AttendanceRecord[]) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const existing: AttendanceRecord[] = raw ? JSON.parse(raw) : [];

    // Replace or insert records for matching student and date
    const updated = [...existing];
    newRecords.forEach((record) => {
      const idx = updated.findIndex((r) => r.studentId === record.studentId && r.date === record.date);
      if (idx >= 0) {
        updated[idx] = record;
      } else {
        updated.push(record);
      }
    });

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    persistToServer('/api/attendance', { items: updated });
  } catch (e) {
    console.error(e);
  }
};

export const clearAttendanceForDate = (date: string): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const existing: AttendanceRecord[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter((r) => r.date !== date);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    persistToServer('/api/attendance', { items: updated });
    return updated;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const deleteAttendanceRecord = (recordId: string): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const existing: AttendanceRecord[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter((r) => r.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    persistToServer('/api/attendance', { items: updated });
    return updated;
  } catch (e) {
    console.error(e);
    return [];
  }
};

// --- Website Content & Settings Management (Admin & Headteacher can edit everything) ---
export const getWebsiteSettings = (): WebsiteSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEBSITE_SETTINGS);
    if (raw) return { ...defaultWebsiteSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.error(e);
  }
  return defaultWebsiteSettings;
};

export const saveWebsiteSettings = (settings: WebsiteSettings) => {
  localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(settings));
  try {
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch((err) => console.warn('Server settings sync notice:', err));
  } catch (err) {
    console.warn('Settings sync error:', err);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mugina-settings-updated', { detail: settings }));
  }
};

export const syncServerWebsiteSettings = async (): Promise<WebsiteSettings | null> => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(data.settings));
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('Sync server settings notice:', err);
  }
  return null;
};

// --- School Gallery ---
export const getGalleryItems = (): FacilityItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return initialGalleryWithCrest;
};

export const saveGalleryItems = (items: FacilityItem[]) => {
  localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
};

export const syncServerGalleryItems = async (): Promise<FacilityItem[]> => {
  try {
    const res = await fetch('/api/gallery');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const local = getGalleryItems();
        const combined = [...data.items];
        local.forEach((l) => {
          if (!combined.some((c) => c.id === l.id)) {
            combined.push(l);
          }
        });
        saveGalleryItems(combined);
        return combined;
      }
    }
  } catch (err) {
    console.warn('Could not sync gallery with server:', err);
  }
  return getGalleryItems();
};

export const addGalleryItem = (item: Omit<FacilityItem, 'id'>): FacilityItem => {
  const current = getGalleryItems();
  const newItem: FacilityItem = {
    ...item,
    id: `fac-${Date.now()}`,
  };
  const updated = [newItem, ...current];
  saveGalleryItems(updated);

  // Sync to server so visible on all devices
  fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newItem),
  }).catch((e) => console.warn('Gallery sync error:', e));

  return newItem;
};

export const updateGalleryItem = (id: string, updates: Partial<FacilityItem>): FacilityItem[] => {
  const current = getGalleryItems();
  const updated = current.map((i) => (i.id === id ? { ...i, ...updates } : i));
  saveGalleryItems(updated);

  const target = updated.find((i) => i.id === id);
  if (target) {
    fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target),
    }).catch((e) => console.warn('Gallery sync error:', e));
  }

  return updated;
};

export const deleteGalleryItem = (id: string): FacilityItem[] => {
  const current = getGalleryItems();
  const updated = current.filter((i) => i.id !== id);
  saveGalleryItems(updated);

  // Delete from server
  fetch(`/api/gallery/${id}`, { method: 'DELETE' }).catch((e) => console.warn('Gallery delete error:', e));

  return updated;
};

// --- Inquiries ---
export const getInquiries = (): AdminInquiry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'inq-1',
      name: 'Uwera Marie',
      phone: '+250 788 123 456',
      email: 'norbertihimbazwemanzi@gmail.com',
      subject: 'Nursery Baby Class Intake',
      message: 'Hello, I live in Kamonyi and would like to register my 3-year-old in Baby Class for Term 1.',
      createdAt: '2026-10-10 14:30',
      status: 'New',
    },
  ];
};

export const addInquiry = (inquiry: Omit<AdminInquiry, 'id' | 'createdAt' | 'status'>): AdminInquiry => {
  const current = getInquiries();
  const newInq: AdminInquiry = {
    ...inquiry,
    id: `inq-${Date.now()}`,
    createdAt: new Date().toLocaleString(),
    status: 'New',
  };
  const updated = [newInq, ...current];
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
  return newInq;
};

export const updateInquiryStatus = (id: string, status: AdminInquiry['status'], note?: string) => {
  const current = getInquiries();
  const updated = current.map((i) => (i.id === id ? { ...i, status, emailSentStatus: note || i.emailSentStatus } : i));
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
  return updated;
};

// --- Admissions Applications ---
export const getApplications = (): AdminApplication[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'app-seed-1',
      refCode: 'MHA-2026-7841',
      studentName: 'Mugisha Brian',
      gender: 'Male',
      dob: '2019-05-10',
      gradeCode: 'P2',
      parentName: 'Alice Mukamugema',
      parentPhone: '+250 788 444 333',
      parentEmail: 'norbertihimbazwemanzi@gmail.com',
      sector: 'Mugina, Kamonyi',
      wantsLunch: true,
      wantsTransport: true,
      status: 'Pending Confirmation',
      createdAt: '2026-10-12 08:30',
    },
  ];
};

export const addApplication = (app: Omit<AdminApplication, 'id' | 'createdAt' | 'status'>): AdminApplication => {
  const current = getApplications();
  const newApp: AdminApplication = {
    ...app,
    id: `app-${Date.now()}`,
    createdAt: new Date().toLocaleString(),
    status: 'Pending Confirmation',
  };
  const updated = [newApp, ...current];
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
  return newApp;
};

export const confirmApplicationByDOSOrAdmin = (
  appId: string,
  feedbackNotes: string,
  confirmedBy: string,
  studentUsername: string,
  studentPassword: string
): { updatedApp: AdminApplication; student: EnrolledStudent } => {
  const apps = getApplications();
  const targetApp = apps.find((a) => a.id === appId);
  if (!targetApp) throw new Error('Application not found');

  const regNumber = `MHA-2026-${Math.floor(100 + Math.random() * 900)}`;

  // Create enrolled student
  const newStudent = enrollStudentByDOS({
    regNumber,
    fullName: targetApp.studentName,
    gender: targetApp.gender as 'Male' | 'Female',
    dob: targetApp.dob,
    gradeCode: targetApp.gradeCode,
    parentName: targetApp.parentName,
    parentPhone: targetApp.parentPhone,
    parentEmail: targetApp.parentEmail || '',
    studentUsername: studentUsername || `stu.${targetApp.studentName.toLowerCase().replace(/\s+/g, '')}`,
    studentPassword: studentPassword || 'mugina@student',
    enrolledBy: confirmedBy,
    status: 'Active',
    feedbackNotes,
  });

  // Update app status
  const updatedApps = apps.map((a) =>
    a.id === appId
      ? {
          ...a,
          status: 'Confirmed & Enrolled' as const,
          feedbackNotes,
          assignedStudentId: regNumber,
          confirmedAt: new Date().toLocaleString(),
          confirmedBy,
        }
      : a
  );
  saveApplications(updatedApps);

  return { updatedApp: updatedApps.find((a) => a.id === appId)!, student: newStudent };
};

export const saveApplications = (list: AdminApplication[]) => {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(list));
  persistToServer('/api/applications', { items: list });
};

export const deleteApplication = (id: string): AdminApplication[] => {
  const current = getApplications();
  const updated = current.filter((a) => a.id !== id);
  saveApplications(updated);
  return updated;
};
export const getTourBookings = (): AdminTourBooking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOURS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const addTourBooking = (tour: Omit<AdminTourBooking, 'id' | 'createdAt' | 'status'>): AdminTourBooking => {
  const current = getTourBookings();
  const newTour: AdminTourBooking = {
    ...tour,
    id: `tour-${Date.now()}`,
    createdAt: new Date().toLocaleString(),
    status: 'Confirmed',
  };
  const updated = [newTour, ...current];
  localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(updated));
  return newTour;
};

// --- Announcements ---
export const getAnnouncements = (): SchoolAnnouncement[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'ann-1',
      title: 'Term Enrollment Open for 2026/2027',
      content: 'Registration is actively ongoing for Nursery (Baby, Middle, Pre-Primary) and Primary (P1–P6). Online applicants will receive immediate DOS confirmation and feedback.',
      badge: 'Admissions Open',
      isActive: true,
      publishedAt: '2026-10-12',
    },
  ];
};

export const saveAnnouncements = (items: SchoolAnnouncement[]) => {
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(items));
};

export const addAnnouncement = (item: Omit<SchoolAnnouncement, 'id' | 'publishedAt'>): SchoolAnnouncement => {
  const current = getAnnouncements();
  const newAnn: SchoolAnnouncement = {
    ...item,
    id: `ann-${Date.now()}`,
    publishedAt: new Date().toISOString().split('T')[0],
  };
  const updated = [newAnn, ...current];
  saveAnnouncements(updated);
  return newAnn;
};

export const updateAnnouncement = (id: string, updates: Partial<SchoolAnnouncement>): SchoolAnnouncement[] => {
  const current = getAnnouncements();
  const updated = current.map((a) => (a.id === id ? { ...a, ...updates } : a));
  saveAnnouncements(updated);
  return updated;
};

export const deleteAnnouncement = (id: string): SchoolAnnouncement[] => {
  const current = getAnnouncements();
  const updated = current.filter((a) => a.id !== id);
  saveAnnouncements(updated);
  return updated;
};

// --- Current Auth Session & Role ---
export interface CurrentSessionUser {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  email: string;
  assignedSubjectOrGrade?: string;
}

export const getCurrentSessionUser = (): CurrentSessionUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const setCurrentSessionUser = (user: CurrentSessionUser | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }
};

export const getAdminNotificationEmail = (): string => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) || 'norbertihimbazwemanzi@gmail.com';
};

export const setAdminNotificationEmail = (email: string) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, email);
};

export const isAdminAuthenticated = (): boolean => {
  const user = getCurrentSessionUser();
  return !!user && ['Admin', 'DOS', 'Finance', 'Registrar', 'Teacher', 'DOD'].includes(user.role);
};

// --- Required Registration Documentation Management (Admin configurable) ---
export const defaultRequiredDocuments: RegistrationDocument[] = [
  {
    id: 'doc-1',
    title: "Child's Official Birth Certificate (Icyemezo cy'amavuko)",
    description: "Copy of the certificate issued by Irembo or local civil registry indicating date of birth and parentage.",
    isRequired: true,
    applicableGrades: 'All Grades (Nursery & Primary)',
    formatHint: 'Original copy or verified photocopy from Irembo/Civil Registry',
    order: 1,
  },
  {
    id: 'doc-2',
    title: 'Two (2) Recent Passport-Size Photographs',
    description: 'Clean color photos of the child with a plain white or light blue background for the school registry and student ID card.',
    isRequired: true,
    applicableGrades: 'All Grades (Nursery & Primary)',
    formatHint: 'Recent physical or digital photo within last 3 months',
    order: 2,
  },
  {
    id: 'doc-3',
    title: 'Previous School Academic Reports & Transfer Letter',
    description: 'Required for students transferring into Primary 1 through Primary 6. Shows prior competencies, terms completed, and class standing.',
    isRequired: true,
    applicableGrades: 'Primary 1 to Primary 6 (Transfer Students)',
    formatHint: 'Official stamped report booklet from previous head teacher',
    order: 3,
  },
  {
    id: 'doc-4',
    title: 'Parent / Legal Guardian National ID or Passport Copy',
    description: "Copy of the parent's Rwandan National ID card (Indangamuntu) or passport for authorized pickup registry and emergency contacts.",
    isRequired: true,
    applicableGrades: 'All Grades',
    formatHint: 'Clear photocopy of National ID (front & back)',
    order: 4,
  },
  {
    id: 'doc-5',
    title: "Child's Health & Immunization Record (Ikarita y'inkingo)",
    description: 'Standard health record showing childhood vaccinations, allergies, and special dietary/emergency instructions.',
    isRequired: false,
    applicableGrades: 'Nursery (Baby, Middle, Pre-Primary) & Lower Primary',
    formatHint: 'Health center booklet photocopy',
    order: 5,
  },
];

export const getRequiredDocuments = (): RegistrationDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return defaultRequiredDocuments;
};

export const saveRequiredDocuments = (docs: RegistrationDocument[]) => {
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  persistToServer('/api/documents', { items: docs });
};

export const addRequiredDocument = (doc: Omit<RegistrationDocument, 'id' | 'order'>): RegistrationDocument => {
  const current = getRequiredDocuments();
  const newDoc: RegistrationDocument = {
    ...doc,
    id: `doc-${Date.now()}`,
    order: current.length + 1,
  };
  const updated = [...current, newDoc];
  saveRequiredDocuments(updated);
  return newDoc;
};

export const updateRequiredDocument = (id: string, updates: Partial<RegistrationDocument>): RegistrationDocument[] => {
  const current = getRequiredDocuments();
  const updated = current.map((d) => (d.id === id ? { ...d, ...updates } : d));
  saveRequiredDocuments(updated);
  return updated;
};

export const deleteRequiredDocument = (id: string): RegistrationDocument[] => {
  const current = getRequiredDocuments();
  const updated = current.filter((d) => d.id !== id);
  saveRequiredDocuments(updated);
  return updated;
};

// --- Payment & Accounting Ledger Management (Finance Officer & Principal Queue) ---
export const defaultPaymentTransactions: PaymentTransaction[] = [
  {
    id: 'tx-2026-001',
    receiptNumber: 'MHA-RCP-2026-0001',
    studentId: 'stu-1',
    studentName: 'Keza Aline Manzi',
    regNumber: 'MHA-2026-001',
    gradeCode: 'P4',
    paymentType: 'Tuition Fee',
    amount: 45000,
    paymentMethod: 'Bank Deposit (BK)',
    bankSlipRef: 'BK-SLIP-892341',
    recordedBy: 'Eric Bizimana (Finance Officer)',
    recordedAt: '2026-01-20T08:30:00.000Z',
    term: 'Term 1',
    academicYear: '2026',
    status: 'Completed',
  },
  {
    id: 'tx-2026-002',
    receiptNumber: 'MHA-RCP-2026-0002',
    studentId: 'stu-2',
    studentName: 'Gasana Eric Ntwari',
    regNumber: 'MHA-2026-002',
    gradeCode: 'P4',
    paymentType: 'Tuition Fee',
    amount: 45000,
    paymentMethod: 'MTN Mobile Money',
    bankSlipRef: 'MOMO-788333444-991',
    recordedBy: 'Eric Bizimana (Finance Officer)',
    recordedAt: '2026-01-21T09:15:00.000Z',
    term: 'Term 1',
    academicYear: '2026',
    status: 'Completed',
  },
  {
    id: 'tx-2026-003',
    receiptNumber: 'MHA-RCP-2026-0003',
    studentId: 'stu-3',
    studentName: 'Ingabire Divine',
    regNumber: 'MHA-2026-003',
    gradeCode: 'P4',
    paymentType: 'Uniform & Supplies',
    amount: 25000,
    paymentMethod: 'Cash',
    bankSlipRef: 'CASH-OFFICE-014',
    recordedBy: 'Eric Bizimana (Finance Officer)',
    recordedAt: '2026-01-22T10:00:00.000Z',
    term: 'Term 1',
    academicYear: '2026',
    status: 'Completed',
  },
  {
    id: 'tx-2026-004',
    receiptNumber: 'MHA-RCP-2026-0004',
    studentId: 'stu-4',
    studentName: 'Mugisha Brian',
    regNumber: 'MHA-2026-004',
    gradeCode: 'P1',
    paymentType: 'Tuition Fee',
    amount: 35000,
    paymentMethod: 'Bank Deposit (BK)',
    bankSlipRef: 'BK-SLIP-772190',
    recordedBy: 'Eric Bizimana (Finance Officer)',
    recordedAt: '2026-01-25T11:20:00.000Z',
    term: 'Term 1',
    academicYear: '2026',
    status: 'Refund Requested',
    refundReason: 'Guardian overpaid by double bank deposit slip. Requesting refund of 35,000 RWF back to parent BK account.',
    refundRequestedAt: '2026-02-02T14:10:00.000Z',
    refundRequestedBy: 'Eric Bizimana (Finance Officer)',
  },
  {
    id: 'tx-2026-005',
    receiptNumber: 'MHA-RCP-2026-0005',
    studentId: 'stu-5',
    studentName: 'Umutoni Grace',
    regNumber: 'MHA-2026-005',
    gradeCode: 'P1',
    paymentType: 'Lunch Program',
    amount: 20000,
    paymentMethod: 'MTN Mobile Money',
    bankSlipRef: 'MOMO-788666777-102',
    recordedBy: 'Eric Bizimana (Finance Officer)',
    recordedAt: '2026-02-01T13:45:00.000Z',
    term: 'Term 1',
    academicYear: '2026',
    status: 'Completed',
  },
];

export const getPaymentTransactions = (): PaymentTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return defaultPaymentTransactions;
};

export const savePaymentTransactions = (txs: PaymentTransaction[]) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(txs));
  persistToServer('/api/payments', { items: txs });
};

export const recordPaymentTransaction = (
  tx: Omit<PaymentTransaction, 'id' | 'receiptNumber' | 'recordedAt' | 'status'>
): PaymentTransaction => {
  const current = getPaymentTransactions();
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const seq = (current.length + 1).toString().padStart(4, '0');
  const newTx: PaymentTransaction = {
    ...tx,
    id: `tx-${Date.now()}`,
    receiptNumber: `MHA-RCP-${dateStr}-${seq}`,
    recordedAt: new Date().toISOString(),
    status: 'Completed',
  };
  const updated = [newTx, ...current];
  savePaymentTransactions(updated);
  return newTx;
};

export const requestTransactionRefund = (
  txId: string,
  reason: string,
  requestedBy: string
): PaymentTransaction[] => {
  const current = getPaymentTransactions();
  const updated = current.map((tx) => {
    if (tx.id === txId) {
      return {
        ...tx,
        status: 'Refund Requested' as const,
        refundReason: reason,
        refundRequestedAt: new Date().toISOString(),
        refundRequestedBy: requestedBy,
      };
    }
    return tx;
  });
  savePaymentTransactions(updated);
  return updated;
};

export const reviewRefundRequest = (
  txId: string,
  action: 'Approve' | 'Reject',
  reviewedBy: string,
  reviewNote?: string
): PaymentTransaction[] => {
  const current = getPaymentTransactions();
  const updated = current.map((tx) => {
    if (tx.id === txId) {
      return {
        ...tx,
        status: action === 'Approve' ? ('Refund Approved' as const) : ('Refund Rejected' as const),
        refundReviewedAt: new Date().toISOString(),
        refundReviewedBy: reviewedBy,
        refundReviewNote: reviewNote || '',
      };
    }
    return tx;
  });
  savePaymentTransactions(updated);
  return updated;
};

// Global sync utility to pull latest database records on initial load
export const syncAllStoresWithServerDatabase = async () => {
  try {
    const endpoints = [
      { key: STORAGE_KEYS.STAFF, url: '/api/staff' },
      { key: STORAGE_KEYS.STUDENTS, url: '/api/students' },
      { key: STORAGE_KEYS.ATTENDANCE, url: '/api/attendance' },
      { key: STORAGE_KEYS.PAYMENTS, url: '/api/payments' },
      { key: STORAGE_KEYS.DOCUMENTS, url: '/api/documents' },
      { key: STORAGE_KEYS.APPLICATIONS, url: '/api/applications' },
      { key: STORAGE_KEYS.WEBSITE_SETTINGS, url: '/api/settings' },
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url);
        if (res.ok) {
          const json = await res.json();
          const items = json.items || json.settings;
          if (items && (Array.isArray(items) ? items.length > 0 : Object.keys(items).length > 0)) {
            localStorage.setItem(ep.key, JSON.stringify(items));
          }
        }
      } catch (e) {
        // quiet fallback
      }
    }
  } catch (err) {
    console.warn('[Database Sync] Global sync notice:', err);
  }
};


