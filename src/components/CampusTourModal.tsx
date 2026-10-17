import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/schoolData';
import { addTourBooking } from '../services/adminStore';
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, User } from 'lucide-react';

interface CampusTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusTourModal: React.FC<CampusTourModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    phone: '+250 78',
    date: '2026-10-20',
    timeSlot: '9:30 AM – Morning Session',
    gradeInterest: 'Nursery & Primary',
    guestsCount: '2',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTourBooking({
      parentName: formData.parentName,
      phone: formData.phone,
      date: formData.date,
      timeSlot: formData.timeSlot,
      gradeInterest: formData.gradeInterest,
      guestsCount: formData.guestsCount,
    });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold font-display">Book a Campus Tour</h3>
              <p className="text-xs text-slate-300">Experience Mugina Hope Academy in Person</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Guaranteed Peaceful Visit:</span> Our campus is right adjacent to the Mugina Police Station with verified visitor entry.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent / Guardian Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number for Confirmation (WhatsApp / Call) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+250 788 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preferred Visit Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Window *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="9:30 AM – Morning Session">9:30 AM (Classrooms in Action)</option>
                    <option value="11:30 AM – Midday Discovery">11:30 AM (Snack & STEM Lab)</option>
                    <option value="2:30 PM – Afternoon Arts">2:30 PM (Cultural Arts & Sports)</option>
                    <option value="Saturday 9:00 AM">Saturday 9:00 AM (Weekend Consultation)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grade Interested In
                  </label>
                  <select
                    value={formData.gradeInterest}
                    onChange={(e) => setFormData({ ...formData, gradeInterest: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="Nursery (Ages 3–5)">Nursery (Ages 3–5)</option>
                    <option value="Lower Primary (P1–P3)">Lower Primary (P1–P3)</option>
                    <option value="Upper Primary (P4–P6)">Upper Primary (P4–P6)</option>
                    <option value="Both Nursery & Primary">Both Nursery & Primary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Number of Visitors
                  </label>
                  <select
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="1">1 Person (Parent)</option>
                    <option value="2">2 Persons (Parent + Child)</option>
                    <option value="3+">Family Group (3+)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Confirm Campus Tour Appointment</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 font-display">
                Campus Tour Booked!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                We look forward to welcoming you, <strong>{formData.parentName}</strong>, on{' '}
                <strong>{formData.date}</strong> at <strong>{formData.timeSlot}</strong>.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-200">
                Location: {SCHOOL_INFO.location.landmark}, Mugina Sector, Kamonyi.
                Our administration desk has recorded your visit under phone {formData.phone}.
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
