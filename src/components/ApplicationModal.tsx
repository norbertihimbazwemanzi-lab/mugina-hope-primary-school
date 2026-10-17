import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ACADEMIC_GRADES, SCHOOL_INFO } from '../data/schoolData';
import { addApplication, getAdminNotificationEmail, getRequiredDocuments } from '../services/adminStore';
import { sendGmailMessage } from '../services/gmailService';
import {
  X,
  CheckCircle,
  CheckCircle2,
  ShieldCheck,
  Download,
  Sparkles,
  Send,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Mail,
  HelpCircle,
} from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedGrade?: string;
  onOpenPrintableForm: () => void;
  onOpenChatTracker?: (refCode: string) => void;
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  isGmail?: boolean;
}

export function validateParentEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Parent email address is required so you receive official admin confirmation and student credentials.',
    };
  }

  if (/\s/.test(trimmed)) {
    return { isValid: false, error: 'Email address cannot contain spaces.' };
  }

  if (!trimmed.includes('@')) {
    return { isValid: false, error: "Missing '@' symbol. Please enter a complete address (e.g., yourname@gmail.com)." };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: "Email cannot contain more than one '@' symbol." };
  }

  const [localPart, domainPart] = parts;

  if (!localPart) {
    return { isValid: false, error: "Please enter your name/username before the '@' symbol." };
  }

  if (!domainPart) {
    return { isValid: false, error: "Please complete the domain after '@' (e.g. gmail.com)." };
  }

  // Common typo detections (e.g. gmil, gmial, gamil, etc.)
  const lowerDomain = domainPart.toLowerCase();
  const gmailTypos: Record<string, string> = {
    'gmil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmailcom': 'gmail.com',
    'gmaildotcom': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmaii.com': 'gmail.com',
    'gmaile.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
  };

  if (gmailTypos[lowerDomain]) {
    const suggestedDomain = gmailTypos[lowerDomain];
    return {
      isValid: false,
      error: `Detected domain typo in "@${domainPart}". Did you mean "@${suggestedDomain}"?`,
      suggestion: `${localPart}@${suggestedDomain}`,
    };
  }

  if (!domainPart.includes('.')) {
    return { isValid: false, error: "Domain must include a dot and extension like '.com' or '.rw'." };
  }

  const domainPieces = domainPart.split('.');
  const tld = domainPieces[domainPieces.length - 1];
  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Domain extension must be at least 2 letters (e.g. '.com', '.rw', '.org')." };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g. parent@gmail.com).' };
  }

  // Gmail specific strict rules
  if (lowerDomain === 'gmail.com') {
    if (localPart.length < 6) {
      return {
        isValid: false,
        error: 'Gmail usernames must be at least 6 characters before the @gmail.com.',
        isGmail: true,
      };
    }
    if (localPart.length > 30) {
      return {
        isValid: false,
        error: 'Gmail usernames cannot be more than 30 characters long.',
        isGmail: true,
      };
    }
    if (!/^[a-zA-Z0-9.]+$/.test(localPart)) {
      return {
        isValid: false,
        error: 'Gmail usernames may only contain letters, numbers, and periods (.).',
        isGmail: true,
      };
    }
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return {
        isValid: false,
        error: 'Gmail username cannot start or end with a period (.).',
        isGmail: true,
      };
    }
    if (localPart.includes('..')) {
      return {
        isValid: false,
        error: 'Gmail username cannot have consecutive periods (..).',
        isGmail: true,
      };
    }
    return { isValid: true, isGmail: true };
  }

  return { isValid: true, isGmail: false };
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  preselectedGrade,
  onOpenPrintableForm,
  onOpenChatTracker,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appId, setAppId] = useState('');

  // Persisted email preference
  const savedParentEmail = typeof window !== 'undefined' ? localStorage.getItem('mugina_parent_email_saved') || '' : '';
  const [rememberEmail, setRememberEmail] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    studentFullName: '',
    gender: 'Female',
    dateOfBirth: '2020-05-15',
    gradeCode: preselectedGrade || 'N-BABY',
    previousSchool: '',
    parentFullName: '',
    relationship: 'Mother',
    parentPhone: '+250 78',
    parentEmail: savedParentEmail,
    sectorAddress: 'Mugina, Kamonyi',
    wantsLunch: true,
    wantsTransport: false,
    medicalNotes: '',
    hasBirthCert: true,
    hasPhotos: true,
    hasReports: true,
  });

  // Calculate live email validation status
  const emailValidation = validateParentEmail(formData.parentEmail);

  // Sync remembered email on open
  useEffect(() => {
    if (isOpen && !formData.parentEmail) {
      const stored = localStorage.getItem('mugina_parent_email_saved');
      if (stored) {
        setFormData((prev) => ({ ...prev, parentEmail: stored }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValidation.isValid) {
      setStep(2);
      setStep2Attempted(true);
      setEmailTouched(true);
      return;
    }

    if (rememberEmail && formData.parentEmail.trim()) {
      localStorage.setItem('mugina_parent_email_saved', formData.parentEmail.trim());
    }

    const generatedId = `MHA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setAppId(generatedId);

    // Save in Admin Store
    addApplication({
      refCode: generatedId,
      studentName: formData.studentFullName,
      gender: formData.gender,
      dob: formData.dateOfBirth,
      gradeCode: formData.gradeCode,
      parentName: formData.parentFullName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      sector: formData.sectorAddress,
      wantsLunch: formData.wantsLunch,
      wantsTransport: formData.wantsTransport,
    });

    // Dispatch notification to backend Nodemailer API (/api/admissions/register)
    try {
      fetch('/api/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refCode: generatedId,
          studentName: formData.studentFullName,
          gender: formData.gender,
          dob: formData.dateOfBirth,
          gradeCode: formData.gradeCode,
          parentName: formData.parentFullName,
          parentPhone: formData.parentPhone,
          parentEmail: formData.parentEmail,
          sector: formData.sectorAddress,
          wantsLunch: formData.wantsLunch,
          wantsTransport: formData.wantsTransport,
          previousSchool: formData.previousSchool,
          notes: formData.medicalNotes,
        }),
      }).catch((e) => console.warn('Admission notification notice:', e));
    } catch {
      // ignore
    }

    // Notify via Gmail if email configured
    const adminEmail = getAdminNotificationEmail();
    sendGmailMessage({
      to: adminEmail,
      subject: `[Mugina Hope Academy] New Admission Application: ${formData.studentFullName} (${formData.gradeCode})`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">New Pupil Admission Application Received</h2>
          <p><strong>Ref Code:</strong> ${generatedId}</p>
          <p><strong>Student Name:</strong> ${formData.studentFullName}</p>
          <p><strong>Grade Level:</strong> ${formData.gradeCode}</p>
          <p><strong>Parent Name:</strong> ${formData.parentFullName} (${formData.parentPhone})</p>
          <p><strong>Sector:</strong> ${formData.sectorAddress}</p>
          <p style="color: #d97706; font-weight: bold;">Status: Awaiting Admin / DOS Confirmation & Feedback</p>
        </div>
      `,
    }).catch(console.error);

    if (formData.parentEmail && formData.parentEmail.includes('@')) {
      sendGmailMessage({
        to: formData.parentEmail,
        subject: `Mugina Hope Academy - Admission Application ${generatedId} Received (Awaiting Confirmation)`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a;">Muraho ${formData.parentFullName},</h2>
            <p>Thank you for submitting an admission registration for <strong>${formData.studentFullName}</strong> to <strong>Mugina Hope Primary & Nursery Academy</strong>.</p>
            <p>Your application reference code is: <strong>${generatedId}</strong>.</p>
            <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; margin: 15px 0;">
              <strong style="color: #92400e;">Status: Awaiting Admin & DOS Confirmation</strong>
              <p style="margin: 4px 0 0 0; color: #78350f; font-size: 13px;">Our Director of Studies (DOS) and Administration Board will review your application and send you official confirmation feedback along with student credentials.</p>
            </div>
            <p>Our admissions desk located adjacent to Mugina Police Station in Kamonyi will also follow up at ${formData.parentPhone}.</p>
            <p style="color: #64748b; font-size: 13px;">School Motto: "We learn for our better future"</p>
          </div>
        `,
      }).catch(console.error);
    }

    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  const selectedGradeObj = ACADEMIC_GRADES.find(g => g.code === formData.gradeCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
              MH
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Online Admissions Application
              </h3>
              <p className="text-xs text-slate-500">
                Mugina Hope Primary & Nursery Academy · 2026 Intake
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Stepper Progress */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}
                >
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px]">1</span>
                  <span>Student Information</span>
                </button>
                <span className="text-slate-300">→</span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-1.5 ${step === 2 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}
                >
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px]">2</span>
                  <span>Parent / Guardian</span>
                </button>
                <span className="text-slate-300">→</span>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`flex items-center gap-1.5 ${step === 3 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}
                >
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px]">3</span>
                  <span>Documents & Services</span>
                </button>
              </div>

              {/* Step 1: Student Information */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Learner Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Keza Aline Manzi"
                      value={formData.studentFullName}
                      onChange={(e) => setFormData({ ...formData, studentFullName: e.target.value })}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Applying for Grade Level *
                    </label>
                    <select
                      value={formData.gradeCode}
                      onChange={(e) => setFormData({ ...formData, gradeCode: e.target.value })}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    >
                      <optgroup label="Nursery Academy">
                        <option value="N-BABY">Baby Class (3 Years)</option>
                        <option value="N-MID">Middle Class (4 Years)</option>
                        <option value="N-TOP">Pre-Primary Top Class (5 Years)</option>
                      </optgroup>
                      <optgroup label="Primary School">
                        <option value="P1">Primary 1 (P1 - 6 Years)</option>
                        <option value="P2">Primary 2 (P2 - 7 Years)</option>
                        <option value="P3">Primary 3 (P3 - 8 Years)</option>
                        <option value="P4">Primary 4 (P4 - 9 Years)</option>
                        <option value="P5">Primary 5 (P5 - 10 Years)</option>
                        <option value="P6">Primary 6 (P6 - 11–12 Years)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Previous School / Daycare (If applicable)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Home or Previous Nursery in Kamonyi"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      <span>Continue to Parent Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Parent / Guardian Information */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Parent / Guardian Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Jean-Claude Habimana"
                      value={formData.parentFullName}
                      onChange={(e) => setFormData({ ...formData, parentFullName: e.target.value })}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Relationship to Child *
                      </label>
                      <select
                        value={formData.relationship}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      >
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                        <option value="Other Relative">Other Relative</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Active Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+250 788 000 000"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Parent Gmail / Email Address *
                        </label>
                        {formData.parentEmail && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              emailValidation.isValid
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {emailValidation.isValid
                              ? emailValidation.isGmail
                                ? '✓ Valid Gmail'
                                : '✓ Valid Email'
                              : '✕ Invalid Format'}
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail
                            className={`w-4 h-4 ${
                              (emailTouched || step2Attempted) && !emailValidation.isValid
                                ? 'text-rose-400'
                                : emailValidation.isValid && formData.parentEmail
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="e.g. norbertihimbazwemanzi@gmail.com"
                          value={formData.parentEmail}
                          onFocus={() => setEmailTouched(true)}
                          onBlur={() => setEmailTouched(true)}
                          onChange={(e) => {
                            setFormData({ ...formData, parentEmail: e.target.value });
                            setEmailTouched(true);
                          }}
                          className={`w-full text-sm pl-9 pr-9 py-2.5 rounded-lg border transition-all focus:outline-hidden ${
                            (emailTouched || step2Attempted) && !emailValidation.isValid
                              ? 'bg-rose-50/30 border-rose-400 text-slate-900 focus:ring-2 focus:ring-rose-200'
                              : formData.parentEmail && emailValidation.isValid
                              ? 'bg-emerald-50/20 border-emerald-500 text-slate-900 focus:ring-2 focus:ring-emerald-200'
                              : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-600'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {formData.parentEmail && (
                            <>
                              {emailValidation.isValid ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Error & Warning Message */}
                      {(emailTouched || step2Attempted) && !emailValidation.isValid && (
                        <div className="mt-1.5 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs animate-in fade-in duration-150">
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-semibold text-rose-900">{emailValidation.error}</p>
                              {emailValidation.suggestion && (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, parentEmail: emailValidation.suggestion! });
                                      setEmailTouched(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-950 text-xs rounded-md font-bold transition-colors cursor-pointer shadow-2xs"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                                    <span>Click to apply fix: <strong>{emailValidation.suggestion}</strong></span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success / Verified Indicator */}
                      {formData.parentEmail && emailValidation.isValid && (
                        <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Verified {emailValidation.isGmail ? 'Gmail' : 'Email'} address — admin acceptance notice and student credentials will be delivered directly here.
                          </span>
                        </p>
                      )}

                      {/* Remember Email Checkbox */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
                          <input
                            type="checkbox"
                            checked={rememberEmail}
                            onChange={(e) => setRememberEmail(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded-sm"
                          />
                          <span>Remember my email on this device for future admissions & chat tracking</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Residential Sector & Cell *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Mugina Sector, Kamonyi"
                        value={formData.sectorAddress}
                        onChange={(e) => setFormData({ ...formData, sectorAddress: e.target.value })}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep2Attempted(true);
                        setEmailTouched(true);
                        if (!formData.parentFullName.trim()) {
                          return;
                        }
                        if (!formData.parentPhone.trim()) {
                          return;
                        }
                        if (!formData.sectorAddress.trim()) {
                          return;
                        }
                        if (!emailValidation.isValid) {
                          return;
                        }
                        if (rememberEmail && formData.parentEmail.trim()) {
                          localStorage.setItem('mugina_parent_email_saved', formData.parentEmail.trim());
                        }
                        setStep(3);
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Continue to Services</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Services & Documentation */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Requested School Services:
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wantsLunch}
                        onChange={(e) => setFormData({ ...formData, wantsLunch: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded-sm"
                      />
                      <span>Enroll in hot nutritious lunch & mid-morning porridge program</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wantsTransport}
                        onChange={(e) => setFormData({ ...formData, wantsTransport: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded-sm"
                      />
                      <span>Request school bus pickup / drop-off service in Kamonyi</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Special Medical or Dietary Needs
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any allergies, asthma, dietary preferences, or health observations..."
                      value={formData.medicalNotes}
                      onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Document Confirmation Checklist */}
                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                        Required Registration Documents:
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full">
                        Admin Checklist
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mb-2">
                      Please confirm you have or can bring the following original/copies upon enrollment:
                    </p>
                    <div className="space-y-2 text-xs text-amber-900">
                      {getRequiredDocuments().map((doc) => (
                        <label key={doc.id} className="flex items-start gap-2.5 cursor-pointer bg-white/70 p-2 rounded-lg border border-amber-200/60 hover:bg-white transition-colors">
                          <input
                            type="checkbox"
                            defaultChecked={doc.isRequired}
                            className="w-4 h-4 text-amber-600 rounded-xs mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="font-bold block">{doc.title}</span>
                            <span className="text-[11px] text-slate-600 block">{doc.description}</span>
                            {doc.formatHint && (
                              <span className="text-[10px] text-amber-800 italic block mt-0.5">Note: {doc.formatHint}</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Application Received Successfully
                </span>
                <h3 className="text-2xl font-bold text-slate-900 font-display mt-1">
                  Murakoze! Welcome to Mugina Hope Academy
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  We have logged the preliminary registration for <strong>{formData.studentFullName || 'your child'}</strong> into{' '}
                  <strong>{selectedGradeObj?.name}</strong>.
                </p>

                {/* Awaiting Admin Confirmation Notice */}
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs max-w-md mx-auto text-amber-900 text-left">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Status: Awaiting Admin & DOS Confirmation</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Please wait for confirmation feedback from school administration. Once verified by the Director of Studies (DOS), your student portal credentials and official admission acceptance will be sent to your email.
                  </p>
                </div>
              </div>

              {/* Reference ID Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-center space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Application Reference Number
                </span>
                <div className="text-xl font-mono font-black text-blue-700 tracking-wider">
                  {appId}
                </div>
                <p className="text-[11px] text-slate-500">
                  Save this number for admissions desk follow-up.
                </p>
              </div>

              {/* Next steps notice */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-xs text-left max-w-lg mx-auto space-y-2 text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Next Steps for Enrollment:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                  <li>Our admissions secretary will call <strong>{formData.parentPhone}</strong> within 24 hours.</li>
                  <li>Bring your child for a friendly campus visit and brief reading/numeracy placement check.</li>
                  <li>Submit copies of birth certificate and passport photos at our secure campus near Mugina Police Station.</li>
                </ol>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onOpenChatTracker && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChatTracker(appId);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Track Status & Chat with Admin</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenPrintableForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Registration Form</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
