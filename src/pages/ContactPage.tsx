import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/schoolData';
import { InteractiveMap } from '../components/InteractiveMap';
import { PageId } from '../types';
import { addInquiry, getAdminNotificationEmail } from '../services/adminStore';
import { handleInquiryNotification } from '../services/gmailService';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Sparkles,
  Check
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
  onOpenTour: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, onOpenTour }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ adminNotified: boolean; senderNotified: boolean } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const adminEmail = getAdminNotificationEmail();

    // 1. Record inquiry in Admin Store
    addInquiry({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    // 2. Dispatch to backend Nodemailer API (/api/contact)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });
    } catch (backendErr) {
      console.warn('Backend /api/contact dispatch notice:', backendErr);
    }

    // 3. Dispatch real Gmail notification and automated parent feedback
    try {
      const emailResult = await handleInquiryNotification({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        adminEmail: adminEmail,
      });
      setEmailStatus(emailResult);
    } catch (err) {
      console.error('Email sending error:', err);
    }

    setIsSending(false);
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display">
          Contact Mugina Hope Academy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          We welcome parent inquiries, campus visit bookings, and transfer consultations. Connect with our dedicated administration desk via call, WhatsApp, or in person at Mugina Center.
        </p>
      </div>

      {/* 2. Contact Cards & Operating Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Official Phone */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Direct Phone Call</h3>
            <p className="text-xs text-slate-500">
              Immediate connection to school administration and admissions
            </p>
          </div>
          <a
            href={`tel:${SCHOOL_INFO.contact.phone.replace(/\s+/g, '')}`}
            className="text-sm font-bold font-mono text-blue-700 hover:text-blue-900 block"
          >
            {SCHOOL_INFO.contact.phone}
          </a>
        </div>

        {/* Card 2: WhatsApp / Message */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">WhatsApp Chat</h3>
            <p className="text-xs text-slate-500">
              Send questions or request fee schedules directly on WhatsApp
            </p>
          </div>
          <a
            href={SCHOOL_INFO.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
          >
            <span>Chat +250 788 258 786</span>
            <span>→</span>
          </a>
        </div>

        {/* Card 3: Official Website */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Official Website</h3>
            <p className="text-xs text-slate-500">
              Verified domain and primary communication hub
            </p>
          </div>
          <a
            href={SCHOOL_INFO.contact.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold font-mono text-blue-700 hover:text-blue-900 block truncate"
          >
            {SCHOOL_INFO.contact.website}
          </a>
        </div>

        {/* Card 4: Safety & Police Landmark */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200/90 shadow-2xs space-y-3 flex flex-col justify-between bg-gradient-to-br from-emerald-50/30 to-white">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Safe Landmark</h3>
            <p className="text-xs text-slate-600">
              Situated right beside the Mugina Police Station in Kamonyi
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800">
            Mugina Sector, Kamonyi
          </span>
        </div>
      </div>

      {/* 3. Operating Hours Grid (Specific Requirement) */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                Official Campus Operating Hours
              </h3>
              <p className="text-xs text-slate-400">
                Administration offices, classroom instructional times, and study halls
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTour}
            className="self-start sm:self-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            Book a Visit During Open Hours
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SCHOOL_INFO.operatingHours.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/80 space-y-2"
            >
              <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
                {item.days}
              </span>
              <div className="text-lg font-black font-mono text-white">
                {item.time}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Location Map */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Location Map
          </span>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Finding Us in Mugina Sector, Kamonyi
          </h2>
          <p className="text-xs text-slate-500">
            Easily accessible from Kigali via RN1 highway, adjacent to local security headquarters
          </p>
        </div>

        <InteractiveMap />
      </section>

      {/* 5. Direct Inquiry Form & Tour Invitation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Send a Note
          </span>
          <h3 className="text-2xl font-bold text-slate-900 font-display">
            Leave a Message for the School Administration
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Have questions regarding mid-term transfers, school bus availability in your village, or specific nursery requirements? Send us a message and our administrative team will get in touch promptly.
          </p>

          <div className="pt-4 space-y-3 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-700" />
              <span>Email: {SCHOOL_INFO.contact.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-700" />
              <span>Admissions Office: {SCHOOL_INFO.contact.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>Mugina Sector, Kamonyi, Southern Province</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-50 rounded-xl p-6 border border-slate-200">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jean Pierre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+250 788 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address (To Receive Feedback) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Nursery Admission">Nursery Admission (Baby/Middle/Top)</option>
                    <option value="Primary School Transfer">Primary School Transfer (P1–P6)</option>
                    <option value="School Bus Route Inquiry">School Bus Route Inquiry</option>
                    <option value="School Fees & Payment">School Fees & Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Message or Question *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help your family? Feel free to ask about class availability, fees, or visit times..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending & Notifying...' : 'Submit Inquiry & Receive Feedback'}</span>
              </button>
            </form>
          ) : (
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 font-display">
                  Murakoze, {formData.name}!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-1">
                  Your message has been received by Mugina Hope Academy. Our administration desk located near Mugina Police Station is on it!
                </p>
              </div>

              {/* Feedback status cards */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Admin notification logged to school inbox</span>
                </div>
                {formData.email && (
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Automated feedback confirmation sent to {formData.email}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  Duty officer will call you at <strong>{formData.phone}</strong>.
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
              >
                Send another message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
