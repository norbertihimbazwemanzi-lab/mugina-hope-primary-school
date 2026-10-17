import express from 'express';
import nodemailer, { type Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared public uploads directory for cross-device image visibility
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Persistent server-side gallery store
const galleryStoreFile = path.resolve(__dirname, 'gallery_store.json');
function loadServerGallery(): any[] {
  try {
    if (fs.existsSync(galleryStoreFile)) {
      return JSON.parse(fs.readFileSync(galleryStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading gallery_store.json:', err);
  }
  return [];
}

function saveServerGallery(items: any[]) {
  try {
    fs.writeFileSync(galleryStoreFile, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving gallery_store.json:', err);
  }
}

// Persistent server-side website settings store (Admin updates)
const settingsStoreFile = path.resolve(__dirname, 'website_settings_store.json');
function loadServerSettings(): any {
  try {
    if (fs.existsSync(settingsStoreFile)) {
      return JSON.parse(fs.readFileSync(settingsStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading website_settings_store.json:', err);
  }
  return null;
}

function saveServerSettings(settings: any) {
  try {
    fs.writeFileSync(settingsStoreFile, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving website_settings_store.json:', err);
  }
}

// Persistent database stores on disk for all entities
const staffStoreFile = path.resolve(__dirname, 'staff_store.json');
function loadServerStaff(): any[] | null {
  try {
    if (fs.existsSync(staffStoreFile)) {
      return JSON.parse(fs.readFileSync(staffStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading staff_store.json:', err);
  }
  return null;
}
function saveServerStaff(items: any[]) {
  try {
    fs.writeFileSync(staffStoreFile, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving staff_store.json:', err);
  }
}

const studentsStoreFile = path.resolve(__dirname, 'students_store.json');
function loadServerStudents(): any[] | null {
  try {
    if (fs.existsSync(studentsStoreFile)) {
      return JSON.parse(fs.readFileSync(studentsStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading students_store.json:', err);
  }
  return null;
}
function saveServerStudents(items: any[]) {
  try {
    fs.writeFileSync(studentsStoreFile, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving students_store.json:', err);
  }
}

const attendanceStoreFile = path.resolve(__dirname, 'attendance_store.json');
function loadServerAttendance(): any[] | null {
  try {
    if (fs.existsSync(attendanceStoreFile)) {
      return JSON.parse(fs.readFileSync(attendanceStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading attendance_store.json:', err);
  }
  return null;
}
function saveServerAttendance(items: any[]) {
  try {
    fs.writeFileSync(attendanceStoreFile, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving attendance_store.json:', err);
  }
}

const paymentsStoreFile = path.resolve(__dirname, 'payments_store.json');
function loadServerPayments(): any[] | null {
  try {
    if (fs.existsSync(paymentsStoreFile)) {
      return JSON.parse(fs.readFileSync(paymentsStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading payments_store.json:', err);
  }
  return null;
}
function saveServerPayments(items: any[]) {
  try {
    fs.writeFileSync(paymentsStoreFile, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving payments_store.json:', err);
  }
}

const documentsStoreFile = path.resolve(__dirname, 'documents_store.json');
function loadServerDocuments(): any[] | null {
  try {
    if (fs.existsSync(documentsStoreFile)) {
      return JSON.parse(fs.readFileSync(documentsStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading documents_store.json:', err);
  }
  return null;
}
function saveServerDocuments(items: any[]) {
  try {
    fs.writeFileSync(documentsStoreFile, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving documents_store.json:', err);
  }
}

const applicationsStoreFile = path.resolve(__dirname, 'applications_store.json');
function loadServerApplications(): any[] | null {
  try {
    if (fs.existsSync(applicationsStoreFile)) {
      return JSON.parse(fs.readFileSync(applicationsStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading applications_store.json:', err);
  }
  return null;
}
function saveServerApplications(items: any[]) {
  try {
    fs.writeFileSync(applicationsStoreFile, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving applications_store.json:', err);
  }
}

// Persistent server-side chats & messaging store between applicants and admin
interface ChatMessage {
  id: string;
  sender: 'parent' | 'admin' | 'system';
  senderName: string;
  text: string;
  createdAt: string;
}

interface ChatThread {
  refCode: string;
  studentName: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  gradeCode: string;
  status: 'Pending Confirmation' | 'Confirmed & Enrolled' | 'Waitlist';
  messages: ChatMessage[];
  updatedAt: string;
}

const chatsStoreFile = path.resolve(__dirname, 'chats_store.json');
function loadServerChats(): ChatThread[] {
  try {
    if (fs.existsSync(chatsStoreFile)) {
      return JSON.parse(fs.readFileSync(chatsStoreFile, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading chats_store.json:', err);
  }
  return [];
}

function saveServerChats(threads: ChatThread[]) {
  try {
    fs.writeFileSync(chatsStoreFile, JSON.stringify(threads, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving chats_store.json:', err);
  }
}

// In-memory or simulated Nodemailer transporter
let transporter: Transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // Transporter fallback (simulates delivery and logs to console/memory)
  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });
}

const SCHOOL_OFFICIAL_EMAIL = process.env.SCHOOL_GMAIL || 'norbertihimbazwemanzi@gmail.com';

// 1. API Endpoint: Forward Contact Form Submissions
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Missing required fields (name, phone, message)' });
    }

    // Email to School Official Gmail
    const adminMailOptions = {
      from: `"Mugina Hope Academy Web" <${SCHOOL_OFFICIAL_EMAIL}>`,
      to: SCHOOL_OFFICIAL_EMAIL,
      replyTo: email || undefined,
      subject: `[Website Inquiry] ${subject || 'New Contact'} from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">Mugina Hope Primary & Nursery Academy</h2>
          <h3 style="color: #0f172a;">New Message from Contact Form</h3>
          <p><strong>Sender Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          <p><strong>Email:</strong> ${email || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">Campus Location: Adjacent to Mugina Police Station, Kamonyi, Rwanda</p>
        </div>
      `,
    };

    // Automated Feedback Email to Parent / Sender
    let feedbackSent = false;
    if (email && email.includes('@')) {
      const feedbackMailOptions = {
        from: `"Mugina Hope Academy" <${SCHOOL_OFFICIAL_EMAIL}>`,
        to: email,
        subject: `Thank you for contacting Mugina Hope Academy - We received your inquiry`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #1e3a8a; padding: 12px 16px; border-radius: 6px; color: white;">
              <h2 style="margin: 0; font-size: 18px;">Mugina Hope Primary & Nursery Academy</h2>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #fde047; font-style: italic;">&ldquo;We learn for our better future&rdquo;</p>
            </div>
            <h3 style="color: #0f172a; margin-top: 20px;">Muraho, ${name}!</h3>
            <p>Thank you for getting in touch with our school regarding <strong>&ldquo;${subject || 'General Inquiry'}&rdquo;</strong>.</p>
            <p>We have safely logged your message. Our administration desk, located right next to the Mugina Police Station in Kamonyi District, will follow up with you at <strong>${phone}</strong> shortly.</p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; margin: 16px 0; font-size: 13px; color: #166534;">
              For urgent admissions questions, call or WhatsApp our official line: <strong>+250 788 258 786</strong>.
            </div>
            <p style="font-size: 12px; color: #64748b;">Mugina Sector, Kamonyi District, Southern Province, Rwanda · muginahopeschool.com</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(feedbackMailOptions);
        feedbackSent = true;
      } catch (err) {
        console.warn('Feedback email dispatch notice:', err);
      }
    }

    const adminInfo = await transporter.sendMail(adminMailOptions);

    return res.json({
      success: true,
      message: 'Inquiry forwarded to official school Gmail successfully',
      feedbackSent,
      info: adminInfo?.messageId || 'Delivered',
    });
  } catch (error: any) {
    console.error('Nodemailer Contact Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

// 2. API Endpoint: Student Attendance Notification to Parent's Gmail
app.post('/api/attendance/notify', async (req, res) => {
  try {
    const { studentName, studentId, grade, parentEmail, parentName, date, status, notes } = req.body;

    if (!studentName || !parentEmail || !status) {
      return res.status(400).json({ error: 'Missing required attendance fields' });
    }

    const isAbsent = status === 'Absent';
    const subject = isAbsent
      ? `[ATTENDANCE ALERT] ${studentName} was marked ABSENT on ${date}`
      : `[Attendance Notice] ${studentName} Attendance Record (${status}) on ${date}`;

    const mailOptions = {
      from: `"Mugina Hope Academy Discipline Office" <${SCHOOL_OFFICIAL_EMAIL}>`,
      to: parentEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid ${isAbsent ? '#fca5a5' : '#e2e8f0'}; border-radius: 8px;">
          <div style="background-color: ${isAbsent ? '#b91c1c' : '#1e3a8a'}; padding: 12px 16px; border-radius: 6px; color: white;">
            <h2 style="margin: 0; font-size: 18px;">Mugina Hope Primary & Nursery Academy</h2>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #fde047;">Director of Discipline (DOD) Notification</p>
          </div>
          <h3 style="color: #0f172a; margin-top: 18px;">Dear Parent / Guardian of ${studentName},</h3>
          <p style="font-size: 14px; line-height: 1.5;">
            This is an official attendance notice for <strong>${studentName}</strong> (ID: <code>${studentId || 'N/A'}</code>, Class: <strong>${grade}</strong>) for date: <strong>${date}</strong>.
          </p>
          <div style="background-color: ${isAbsent ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${isAbsent ? '#fecaca' : '#bbf7d0'}; border-radius: 6px; padding: 14px; margin: 16px 0;">
            <p style="margin: 0; font-size: 15px; font-weight: bold; color: ${isAbsent ? '#991b1b' : '#166534'};">
              Status Recorded: ${status.toUpperCase()}
            </p>
            ${notes ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;">Teacher Notes: ${notes}</p>` : ''}
          </div>
          ${isAbsent ? `
            <p style="font-size: 13px; color: #b91c1c; font-weight: bold;">
              If this absence was unexpected, please immediately contact our Director of Discipline (DOD) or administration desk at +250 788 258 786.
            </p>
          ` : `
            <p style="font-size: 13px; color: #475569;">Thank you for your active partnership in ensuring consistent learning.</p>
          `}
          <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            Mugina Hope Academy · Kamonyi District · Southern Province, Rwanda
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Forward absence alert directly to school official Gmail as well
    if (isAbsent) {
      try {
        await transporter.sendMail({
          from: `"Mugina Hope Attendance Alert" <${SCHOOL_OFFICIAL_EMAIL}>`,
          to: SCHOOL_OFFICIAL_EMAIL,
          subject: `[ATTENDANCE ALERT] ${studentName} (${grade}) Recorded ABSENT on ${date}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fca5a5; border-radius: 8px;">
              <div style="background-color: #b91c1c; padding: 12px 16px; border-radius: 6px; color: white;">
                <h2 style="margin: 0; font-size: 18px;">Mugina Hope Primary & Nursery Academy</h2>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #fde047;">Official Discipline & Absence Alert</p>
              </div>
              <h3 style="color: #0f172a; margin-top: 16px;">Student Absence Logged</h3>
              <p><strong>Student Name:</strong> ${studentName}</p>
              <p><strong>Registration ID:</strong> <code>${studentId || 'N/A'}</code></p>
              <p><strong>Class:</strong> ${grade}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Parent Name:</strong> ${parentName || 'Parent'}</p>
              <p><strong>Parent Gmail:</strong> ${parentEmail}</p>
              ${notes ? `<p><strong>Discipline Notes:</strong> ${notes}</p>` : ''}
              <p style="font-size: 12px; color: #64748b; margin-top: 16px;">Automated attendance status dispatch to official school inbox.</p>
            </div>
          `,
        });
      } catch (adminErr) {
        console.warn('Notice sending copy to official school gmail:', adminErr);
      }
    }

    return res.json({ success: true, message: `Attendance email dispatched to ${parentEmail} and school Gmail` });
  } catch (error: any) {
    console.error('Attendance Notify Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to dispatch attendance notice' });
  }
});

// 2b. API Endpoint: Full Daily Attendance Status Report to School Official Gmail
app.post('/api/attendance/report', async (req, res) => {
  try {
    const { date, grade, total, present, absent, late, absentList, senderName } = req.body;

    const subject = `[Daily Attendance Report] Mugina Hope Academy - ${date} (${grade || 'All Classes'})`;
    const mailOptions = {
      from: `"Mugina Hope Attendance Desk" <${SCHOOL_OFFICIAL_EMAIL}>`,
      to: SCHOOL_OFFICIAL_EMAIL,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #1e3a8a; padding: 14px 18px; border-radius: 6px; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Mugina Hope Primary & Nursery Academy</h2>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #fde047;">Official Daily Attendance Status Report</p>
          </div>
          <h3 style="color: #0f172a; margin-top: 18px;">Attendance Summary for ${date}</h3>
          <p>Class / Level: <strong>${grade || 'All Classes'}</strong> · Logged by: <strong>${senderName || 'Staff Administrator'}</strong></p>
          <div style="display: flex; gap: 10px; margin: 16px 0;">
            <div style="background-color: #f1f5f9; padding: 10px; border-radius: 6px; flex: 1; text-align: center;">
              <span style="font-size: 11px; color: #475569; display: block;">Total Learners</span>
              <strong style="font-size: 18px; color: #0f172a;">${total || 0}</strong>
            </div>
            <div style="background-color: #f0fdf4; padding: 10px; border-radius: 6px; flex: 1; text-align: center;">
              <span style="font-size: 11px; color: #166534; display: block;">Present</span>
              <strong style="font-size: 18px; color: #15803d;">${present || 0}</strong>
            </div>
            <div style="background-color: #fef2f2; padding: 10px; border-radius: 6px; flex: 1; text-align: center;">
              <span style="font-size: 11px; color: #991b1b; display: block;">Absent</span>
              <strong style="font-size: 18px; color: #b91c1c;">${absent || 0}</strong>
            </div>
            <div style="background-color: #fffbeb; padding: 10px; border-radius: 6px; flex: 1; text-align: center;">
              <span style="font-size: 11px; color: #92400e; display: block;">Late</span>
              <strong style="font-size: 18px; color: #b45309;">${late || 0}</strong>
            </div>
          </div>
          ${absentList && absentList.length > 0 ? `
            <div style="margin-top: 16px;">
              <h4 style="color: #b91c1c; margin-bottom: 8px;">Absent Students:</h4>
              <ul style="padding-left: 20px; font-size: 13px; color: #334155;">
                ${absentList.map((a: any) => `<li><strong>${a.name}</strong> (${a.grade || grade}) - Parent: ${a.parentEmail || a.parentPhone || 'N/A'}</li>`).join('')}
              </ul>
            </div>
          ` : '<p style="color: #15803d; font-size: 13px;">No absent students recorded.</p>'}
          <p style="font-size: 11px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Mugina Hope Primary & Nursery Academy · Located Adjacent to Mugina Police Station, Kamonyi, Rwanda
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Daily attendance status report sent to official school Gmail' });
  } catch (error: any) {
    console.error('Attendance Report Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send attendance report' });
  }
});

// 3a. API Endpoint: New Student Admission Registration
app.post('/api/admissions/register', async (req, res) => {
  try {
    const {
      refCode,
      studentName,
      gender,
      dob,
      gradeCode,
      parentName,
      parentPhone,
      parentEmail,
      sector,
      wantsLunch,
      wantsTransport,
      previousSchool,
      notes,
    } = req.body;

    if (!studentName || !parentPhone || !gradeCode) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const applicationRef = refCode || `MHA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Mandatory Email Notification to School Admin (norbertihimbazwemanzi@gmail.com)
    const adminAlertOptions = {
      from: `"Mugina Hope Admissions Desk" <${SCHOOL_OFFICIAL_EMAIL}>`,
      to: SCHOOL_OFFICIAL_EMAIL,
      replyTo: parentEmail || undefined,
      subject: `[NEW REGISTRATION ALERT] Pupil ${studentName} applied for ${gradeCode} (Ref: ${applicationRef})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; padding: 22px; border: 1px solid #cbd5e1; border-radius: 10px; background-color: #ffffff;">
          <div style="background-color: #1e3a8a; padding: 14px 18px; border-radius: 8px; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Mugina Hope Primary & Nursery Academy</h2>
            <p style="margin: 3px 0 0 0; font-size: 13px; color: #fde047; font-weight: bold;">
              New Online Student Admission Registered
            </p>
          </div>

          <div style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a;">
              A new student registration has been submitted and is <strong>waiting for administrator confirmation</strong> in the Staff Portal.
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
              <p style="margin: 4px 0; font-size: 14px;"><strong>Application Ref Code:</strong> <code style="background-color: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0369a1;">${applicationRef}</code></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Learner Name:</strong> ${studentName}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Target Class / Grade:</strong> <strong>${gradeCode}</strong></p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Gender / DOB:</strong> ${gender || 'N/A'} · ${dob || 'N/A'}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Parent / Guardian:</strong> ${parentName} (${parentPhone})</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Parent Gmail:</strong> ${parentEmail || 'Not provided'}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Residential Location:</strong> ${sector || 'Mugina, Kamonyi'}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Hot Lunch Service:</strong> ${wantsLunch ? 'Yes (Requested)' : 'No'}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>School Van Pick-up:</strong> ${wantsTransport ? 'Yes (Requested)' : 'No'}</p>
              ${previousSchool ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Previous School:</strong> ${previousSchool}</p>` : ''}
              ${notes ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
          </div>

          <div style="padding: 16px 0;">
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #b45309; font-weight: bold;">
              Action Required: Please log in to the Admin Portal to review, verify required documentation, and confirm this registration.
            </p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Upon your confirmation, an automated acceptance notice and student portal credentials will be dispatched to the parent.
            </p>
          </div>

          <div style="margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8;">
            Mugina Hope Academy · Adjacent to Mugina Police Station, Kamonyi, Southern Province, Rwanda
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(adminAlertOptions);
    } catch (adminErr) {
      console.warn('Admin registration notification dispatch note:', adminErr);
    }

    // 2. Automated Confirmation Receipt to Parent's Gmail
    let parentReceiptSent = false;
    if (parentEmail && parentEmail.includes('@')) {
      const parentMailOptions = {
        from: `"Mugina Hope Primary & Nursery Academy" <${SCHOOL_OFFICIAL_EMAIL}>`,
        to: parentEmail,
        subject: `[Mugina Hope Academy] Registration Received for ${studentName} - Ref: ${applicationRef}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 22px; border: 1px solid #cbd5e1; border-radius: 10px; background-color: #ffffff;">
            <div style="background-color: #1e3a8a; padding: 14px 18px; border-radius: 8px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">Mugina Hope Primary & Nursery Academy</h2>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: #fde047; font-style: italic;">&ldquo;We learn for our better future&rdquo;</p>
            </div>

            <div style="padding: 18px 0; border-bottom: 1px solid #e2e8f0;">
              <h3 style="color: #0f172a; margin: 0 0 12px 0;">Muraho, ${parentName}!</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 14px 0;">
                Thank you for applying to enroll <strong>${studentName}</strong> into <strong>${gradeCode}</strong> at Mugina Hope Academy.
              </p>
              
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin: 14px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #92400e;">
                  Current Status: PENDING ADMINISTRATOR CONFIRMATION
                </p>
                <p style="margin: 0; font-size: 13px; color: #78350f;">
                  Your application has been safely registered and forwarded directly to School Administrator Norbert Ihimbazwe Manzi for verification.
                </p>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
                <p style="margin: 4px 0; font-size: 13px;"><strong>Your Application Reference Code:</strong> <code style="font-size: 15px; font-weight: bold; color: #1e3a8a;">${applicationRef}</code></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Target Class:</strong> ${gradeCode}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Registered Contact:</strong> ${parentPhone}</p>
              </div>
            </div>

            <div style="padding: 16px 0;">
              <h4 style="color: #1e3a8a; margin: 0 0 8px 0;">What Happens Next?</h4>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                <li>Administrator review will be completed within 24–48 hours.</li>
                <li>Once confirmed, you will receive an official approval email with your child's assigned Student ID & Portal credentials right here at <strong>${parentEmail}</strong>.</li>
                <li>You can also visit our website anytime to track your live status and <strong>chat directly with the school administration</strong> using your reference code: <code>${applicationRef}</code>.</li>
              </ol>
            </div>

            <div style="margin-top: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; font-size: 12px; color: #166534;">
              Campus Location: Mugina Sector, Kamonyi District (Adjacent to Mugina Police Station) · Helpline: +250 788 258 786
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(parentMailOptions);
        parentReceiptSent = true;
      } catch (parentErr) {
        console.warn('Parent registration receipt dispatch note:', parentErr);
      }
    }

    // 3. Initialize Chat Thread in Server Store
    const threads = loadServerChats();
    const existingIdx = threads.findIndex((t) => t.refCode === applicationRef);
    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'system',
      senderName: 'Mugina Hope Administration Desk',
      text: `Registration received for ${studentName} (${gradeCode}). Application is currently under review by School Administrator Norbert Ihimbazwe Manzi.`,
      createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      threads[existingIdx].status = 'Pending Confirmation';
      threads[existingIdx].updatedAt = new Date().toISOString();
      threads[existingIdx].messages.push(initialMsg);
    } else {
      threads.unshift({
        refCode: applicationRef,
        studentName,
        parentName,
        parentEmail,
        parentPhone,
        gradeCode,
        status: 'Pending Confirmation',
        messages: [initialMsg],
        updatedAt: new Date().toISOString(),
      });
    }
    saveServerChats(threads);

    return res.json({
      success: true,
      refCode: applicationRef,
      message: 'Registration submitted successfully. Admin notified at official school Gmail.',
      parentReceiptSent,
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit registration' });
  }
});

// 3b. API Endpoint: Admissions Confirmation & Student Credentials Feedback
app.post('/api/admissions/confirm', async (req, res) => {
  try {
    const { studentName, studentId, grade, parentName, parentEmail, studentUsername, studentPassword, feedbackNotes, refCode } = req.body;

    if (!parentEmail || !studentName) {
      return res.status(400).json({ error: 'Missing required admission fields' });
    }

    const mailOptions = {
      from: `"Mugina Hope Academy - Administration" <${SCHOOL_OFFICIAL_EMAIL}>`,
      to: parentEmail,
      subject: `Official Admission Confirmation & Student Portal Credentials: ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #93c5fd; border-radius: 8px;">
          <div style="background-color: #1e3a8a; padding: 14px 18px; border-radius: 6px; color: white;">
            <h2 style="margin: 0; font-size: 20px;">Mugina Hope Primary & Nursery Academy</h2>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #fde047;">Official Acceptance & Enrollment Notification</p>
          </div>
          <h3 style="color: #0f172a; margin-top: 20px;">Congratulations, ${parentName || 'Parent / Guardian'}!</h3>
          <p style="font-size: 14px; line-height: 1.6;">
            We are pleased to inform you that the registration for <strong>${studentName}</strong> into <strong>${grade}</strong> has been <strong>OFFICIALLY CONFIRMED & APPROVED</strong> by School Administrator Norbert Ihimbazwe Manzi and the Board of Studies.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 18px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 14px;">Student Portal Credentials:</h4>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Student Registration ID:</strong> <code>${studentId || 'MHA-STU-2026'}</code></p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Username / Code:</strong> <code>${studentUsername || studentId}</code></p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Temporary Password:</strong> <code>${studentPassword || 'mugina@student'}</code></p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">(Keep these credentials safe for viewing attendance and school reports)</p>
          </div>

          ${feedbackNotes ? `
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; font-size: 13px; color: #1e3a8a;">
              <strong>Administration Feedback:</strong> ${feedbackNotes}
            </div>
          ` : ''}

          <div style="font-size: 13px; color: #334155; line-height: 1.5;">
            <p><strong>Next Steps:</strong></p>
            <ol style="padding-left: 20px;">
              <li>Visit the bursar's office next to Mugina Police Station to collect the uniform pack.</li>
              <li>Attend new learner orientation with class teacher.</li>
            </ol>
          </div>

          <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            Mugina Hope Primary & Nursery Academy · Kamonyi District · Tel: +250 788 258 786
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Send copy to School Official Gmail (norbertihimbazwemanzi@gmail.com)
    try {
      await transporter.sendMail({
        from: `"Mugina Hope Admissions Confirmations" <${SCHOOL_OFFICIAL_EMAIL}>`,
        to: SCHOOL_OFFICIAL_EMAIL,
        subject: `[CONFIRMATION DISPATCHED] ${studentName} (${grade}) Confirmed - ID: ${studentId}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #1e3a8a;">Registration Confirmed & Dispatched</h3>
            <p><strong>Student:</strong> ${studentName} (${grade})</p>
            <p><strong>Assigned ID:</strong> <code>${studentId}</code></p>
            <p><strong>Parent Gmail:</strong> ${parentEmail}</p>
            <p><strong>Parent Name:</strong> ${parentName}</p>
            <p><strong>Feedback:</strong> ${feedbackNotes || 'None'}</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn('Copy to admin notice:', e);
    }

    // Update Chat Thread to Confirmed & add system message
    const threads = loadServerChats();
    const targetThread = threads.find(
      (t) => (refCode && t.refCode === refCode) || (t.studentName.toLowerCase() === studentName.toLowerCase())
    );
    if (targetThread) {
      targetThread.status = 'Confirmed & Enrolled';
      targetThread.updatedAt = new Date().toISOString();
      targetThread.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'system',
        senderName: 'Mugina Hope Administration Desk',
        text: `🎉 Registration confirmed! ${studentName} has been officially approved and enrolled. Assigned Student Registration ID: ${studentId}. Welcome to Mugina Hope Academy!`,
        createdAt: new Date().toISOString(),
      });
      saveServerChats(threads);
    }

    return res.json({ success: true, message: `Admission approval email dispatched to ${parentEmail} and admin notified` });
  } catch (error: any) {
    console.error('Admission Confirmation Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to dispatch admission confirmation' });
  }
});

// 3c. API Endpoints: Applicant & Admin Live Chat Threads
app.get('/api/chats', (req, res) => {
  const threads = loadServerChats();
  res.json({ success: true, threads });
});

app.get('/api/chats/:refCode', (req, res) => {
  const { refCode } = req.params;
  const threads = loadServerChats();
  const search = refCode.trim().toLowerCase();
  const match = threads.find(
    (t) => t.refCode.toLowerCase() === search || (t.parentEmail && t.parentEmail.toLowerCase() === search)
  );

  if (!match) {
    return res.status(404).json({ error: 'Chat thread not found for reference code' });
  }
  return res.json({ success: true, thread: match });
});

app.post('/api/chats/:refCode/messages', async (req, res) => {
  try {
    const { refCode } = req.params;
    const { sender, senderName, text } = req.body;

    if (!text || !sender) {
      return res.status(400).json({ error: 'Message text and sender are required' });
    }

    const threads = loadServerChats();
    let thread = threads.find((t) => t.refCode.toLowerCase() === refCode.trim().toLowerCase());

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: sender as 'parent' | 'admin',
      senderName: senderName || (sender === 'admin' ? 'Norbert Ihimbazwe Manzi (Admin)' : 'Parent'),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!thread) {
      thread = {
        refCode,
        studentName: 'Applicant',
        parentName: senderName || 'Parent',
        gradeCode: 'General Inquiry',
        status: 'Pending Confirmation',
        messages: [newMessage],
        updatedAt: new Date().toISOString(),
      };
      threads.unshift(thread);
    } else {
      thread.messages.push(newMessage);
      thread.updatedAt = new Date().toISOString();
    }

    saveServerChats(threads);

    // If Parent sent message -> Notify Admin via Gmail
    if (sender === 'parent') {
      try {
        await transporter.sendMail({
          from: `"Mugina Hope Applicant Chat" <${SCHOOL_OFFICIAL_EMAIL}>`,
          to: SCHOOL_OFFICIAL_EMAIL,
          subject: `[New Parent Message] Ref: ${refCode} from ${senderName || 'Parent'}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 18px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="color: #1e3a8a; margin-top: 0;">New Message from Applicant Parent</h3>
              <p><strong>Ref Code:</strong> <code>${refCode}</code></p>
              <p><strong>Sender:</strong> ${senderName || 'Parent'}</p>
              <p><strong>Student:</strong> ${thread.studentName} (${thread.gradeCode})</p>
              <div style="background-color: #f1f5f9; padding: 12px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 12px 0;">
                <p style="margin: 0; font-size: 14px;">${text}</p>
              </div>
              <p style="font-size: 12px; color: #64748b;">Reply directly in the Admin Portal Applicant Chat tab.</p>
            </div>
          `,
        });
      } catch (err) {
        console.warn('Parent message notification note:', err);
      }
    }

    // If Admin sent message -> Notify Parent via Gmail
    if (sender === 'admin' && thread.parentEmail && thread.parentEmail.includes('@')) {
      try {
        await transporter.sendMail({
          from: `"Mugina Hope Academy Administration" <${SCHOOL_OFFICIAL_EMAIL}>`,
          to: thread.parentEmail,
          subject: `[Mugina Hope Academy] Message from Administrator Norbert Ihimbazwe Manzi regarding ${thread.studentName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
              <h3 style="color: #1e3a8a; margin-top: 0;">Message from School Administration</h3>
              <p>Dear ${thread.parentName || 'Parent'},</p>
              <p>School Administrator Norbert Ihimbazwe Manzi sent a message regarding application <strong>${refCode}</strong> for <strong>${thread.studentName}</strong>:</p>
              <div style="background-color: #eff6ff; padding: 14px; border-left: 4px solid #2563eb; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #1e3a8a; font-weight: 500;">${text}</p>
              </div>
              <p style="font-size: 13px; color: #475569;">You can reply to this message anytime directly in the Applicant Chat console on our school website.</p>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                Mugina Hope Primary & Nursery Academy · Kamonyi District, Rwanda
              </p>
            </div>
          `,
        });
      } catch (err) {
        console.warn('Admin message dispatch note to parent:', err);
      }
    }

    return res.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Chat message error:', error);
    return res.status(500).json({ error: error.message || 'Failed to post message' });
  }
});

// 4. API Endpoint: File / Asset Upload handler (Cross-Device Shared Storage)
app.post('/api/upload', (req, res) => {
  try {
    const { fileData, fileName, category, title, description, caption } = req.body;
    if (!fileData || !title) {
      return res.status(400).json({ error: 'fileData and title are required' });
    }

    let publicUrl = fileData;

    // If fileData is base64 data, persist it to disk in uploads directory so all devices can view it
    if (typeof fileData === 'string' && fileData.startsWith('data:image/')) {
      try {
        const matches = fileData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace('+xml', '');
          const base64Content = matches[2];
          const buffer = Buffer.from(base64Content, 'base64');
          const cleanName = (fileName || title || 'asset').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
          const savedFileName = `${Date.now()}_${cleanName}.${ext}`;
          const filePath = path.join(uploadsDir, savedFileName);

          fs.writeFileSync(filePath, buffer);
          publicUrl = `/uploads/${savedFileName}`;
        }
      } catch (writeErr) {
        console.warn('Error saving image buffer to uploads dir:', writeErr);
      }
    }

    // Returns formatted asset object ready for gallery consumption
    const newAsset = {
      id: `asset-${Date.now()}`,
      title,
      category: category || 'classrooms',
      description: description || title,
      caption: caption || title,
      imageSrc: publicUrl,
      createdAt: new Date().toISOString(),
    };

    // Persist into server gallery store
    const currentItems = loadServerGallery();
    const updatedItems = [newAsset, ...currentItems.filter((i: any) => i.id !== newAsset.id)];
    saveServerGallery(updatedItems);

    return res.json({ success: true, asset: newAsset });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// 5. API Endpoints: Shared Cross-Device School Gallery
app.get('/api/gallery', (req, res) => {
  const items = loadServerGallery();
  res.json({ success: true, items });
});

app.post('/api/gallery', (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.title) {
      return res.status(400).json({ error: 'Item data with title is required' });
    }
    const currentItems = loadServerGallery();
    const itemWithId = {
      ...item,
      id: item.id || `fac-${Date.now()}`,
    };
    const updated = [itemWithId, ...currentItems.filter((i: any) => i.id !== itemWithId.id)];
    saveServerGallery(updated);
    return res.json({ success: true, item: itemWithId, items: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save gallery item' });
  }
});

app.delete('/api/gallery/:id', (req, res) => {
  try {
    const { id } = req.params;
    const currentItems = loadServerGallery();
    const updated = currentItems.filter((i: any) => i.id !== id);
    saveServerGallery(updated);
    return res.json({ success: true, items: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete gallery item' });
  }
});

// Website settings endpoint for admin web updates
app.get('/api/settings', (req, res) => {
  const settings = loadServerSettings();
  res.json({ success: true, settings });
});

app.post('/api/settings', (req, res) => {
  try {
    const settings = req.body;
    saveServerSettings(settings);
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save settings' });
  }
});

// Database REST API Endpoints (All changes saved to persistent disk database)
// 1. Staff Members
app.get('/api/staff', (req, res) => {
  const items = loadServerStaff();
  res.json({ success: true, items });
});
app.post('/api/staff', (req, res) => {
  try {
    const items = req.body.items || req.body;
    saveServerStaff(items);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save staff database' });
  }
});

// 2. Enrolled Students
app.get('/api/students', (req, res) => {
  const items = loadServerStudents();
  res.json({ success: true, items });
});
app.post('/api/students', (req, res) => {
  try {
    const items = req.body.items || req.body;
    saveServerStudents(items);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save students database' });
  }
});

// 3. Attendance Records
app.get('/api/attendance', (req, res) => {
  const items = loadServerAttendance();
  res.json({ success: true, items });
});
app.post('/api/attendance', (req, res) => {
  try {
    const items = req.body.items || req.body;
    saveServerAttendance(items);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save attendance database' });
  }
});

// 4. Payment Transactions & Accounting Ledger
app.get('/api/payments', (req, res) => {
  const items = loadServerPayments();
  res.json({ success: true, items });
});
app.post('/api/payments', (req, res) => {
  try {
    const items = req.body.items || req.body;
    saveServerPayments(items);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save payments database' });
  }
});

// 5. Registration Documents
app.get('/api/documents', (req, res) => {
  const items = loadServerDocuments();
  res.json({ success: true, items });
});
app.post('/api/documents', (req, res) => {
  try {
    const items = req.body.items || req.body;
    saveServerDocuments(items);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save documents database' });
  }
});

// 6. Applications & Confirmations
app.get('/api/applications', (req, res) => {
  const items = loadServerApplications();
  res.json({ success: true, items });
});
app.post('/api/applications', (req, res) => {
  try {
    const items = req.body.items || req.body;
    saveServerApplications(items);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save applications database' });
  }
});

// Server health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), school: 'Mugina Hope Academy' });
});

// Mount Vite middleware in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mugina Hope Academy Server running on http://localhost:${PORT}`);
  });
}

startServer();
