import React from 'react';
import { SCHOOL_INFO } from '../data/schoolData';
import { Printer, Download, X } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface PrintableApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableApplicationModal: React.FC<PrintableApplicationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Top Actions */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-200 flex items-center justify-between z-10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Official Admission Packet
            </span>
            <span className="text-xs text-slate-400">· Ready to Print or Save as PDF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 text-slate-900 font-sans space-y-6 print:p-0 print:m-0" id="printable-admission-form">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center space-y-1">
            <div className="flex items-center justify-center gap-4">
              <SchoolLogo size="lg" />
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 font-display">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  Mugina Sector, Kamonyi District, Southern Province, Rwanda
                </p>
              </div>
            </div>
            <div className="pt-2 text-xs font-bold italic text-slate-800">
              Motto: &ldquo;{SCHOOL_INFO.motto}&rdquo; ({SCHOOL_INFO.mottoKinyarwanda}) · Est. {SCHOOL_INFO.establishedYear}
            </div>
            <div className="text-[11px] text-slate-600">
              Tel: {SCHOOL_INFO.contact.phone} · Web: {SCHOOL_INFO.contact.website} · Location: Adjacent to Mugina Police Station
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-black uppercase tracking-wider bg-slate-100 py-1.5 px-4 inline-block rounded-sm border border-slate-300">
              Official Learner Enrollment & Registration Form (2026 / 2027)
            </h2>
          </div>

          {/* Section 1: Learner Particulars */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Section 1: Learner Particulars (Umwirondoro w&apos;Umunyeshuri)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Full Legal Names:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Gender (M/F):</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Date of Birth (DD/MM/YYYY):</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Nationality & District:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Class Applying For (Nursery / P1–P6):</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Previous School Attended:</span>
              </div>
            </div>
          </div>

          {/* Section 2: Parent / Guardian Particulars */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Section 2: Parent / Guardian Details (Umubyeyi cyangwa Umurera)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Father / Mother / Guardian Name:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">National ID / Passport Number:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Primary Telephone (Mobile):</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Secondary / WhatsApp Phone:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Residential District, Sector & Cell:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Occupation / Employer:</span>
              </div>
            </div>
          </div>

          {/* Section 3: Health & Logistics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Section 3: Health & Transportation Preferences
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Allergies or Medical Notes:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Emergency Contact Person:</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">Hot Lunch Program Required? [ ] Yes  [ ] No</span>
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-semibold text-slate-600">School Van Transport? [ ] Yes  [ ] No (Pickup Point: _______)</span>
              </div>
            </div>
          </div>

          {/* Section 4: Required Documentation Checklist */}
          <div className="bg-slate-50 p-3 rounded-md border border-slate-300 text-xs space-y-1.5">
            <div className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
              Document Checklist for Admissions Officer:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div>[ ] 1 Copy of Official Birth Certificate (Icyemezo cy&apos;amavuko)</div>
              <div>[ ] 2 Recent Passport-size Photos</div>
              <div>[ ] Previous Academic Reports / School Transfer Card</div>
              <div>[ ] 1 Copy of Parent/Guardian National ID</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs border-t border-slate-300">
            <div>
              <p className="font-semibold text-slate-800">Parent / Guardian Signature:</p>
              <div className="h-10 border-b border-slate-400 mt-2" />
              <p className="text-[10px] text-slate-500 mt-1">Date: ________________________</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Admissions Officer (Mugina Hope Academy):</p>
              <div className="h-10 border-b border-slate-400 mt-2" />
              <p className="text-[10px] text-slate-500 mt-1">Approved Grade: _________ Date: _________ Stamp:</p>
            </div>
          </div>
        </div>

        {/* Footer info in modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between print:hidden">
          <span>You can submit this completed form directly at Mugina Hope Academy gate.</span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
