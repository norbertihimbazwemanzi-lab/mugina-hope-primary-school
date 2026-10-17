import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { CampusLifePage } from './pages/CampusLifePage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { ApplicationModal } from './components/ApplicationModal';
import { CampusTourModal } from './components/CampusTourModal';
import { PrintableApplicationModal } from './components/PrintableApplicationModal';
import { ApplicantChatTrackerModal } from './components/ApplicantChatTrackerModal';
import { Sparkles, Phone, ArrowUp, Megaphone, X } from 'lucide-react';
import { SCHOOL_INFO } from './data/schoolData';
import { getAnnouncements } from './services/adminStore';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isPrintableModalOpen, setIsPrintableModalOpen] = useState(false);
  const [isChatTrackerOpen, setIsChatTrackerOpen] = useState(false);
  const [chatTrackerRefCode, setChatTrackerRefCode] = useState('');
  const [preselectedGrade, setPreselectedGrade] = useState<string>('N-BABY');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(() => {
    const list = getAnnouncements();
    return list.find((a) => a.isActive) || null;
  });
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Monitor scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenApply = (grade?: string) => {
    if (grade) {
      setPreselectedGrade(grade);
    }
    setIsApplyModalOpen(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-200 selection:text-amber-950">
      {/* Optional Top Active Announcement Bar */}
      {activeAnnouncement && !announcementDismissed && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white text-xs py-2 px-4 border-b border-blue-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-amber-300">{activeAnnouncement.badge || 'Notice'}:</span>
              <span className="truncate">{activeAnnouncement.title} — {activeAnnouncement.content}</span>
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="text-slate-300 hover:text-white p-0.5"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Header Navigation Bar */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenApply={() => handleOpenApply()}
        onOpenTour={() => setIsTourModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenApply={() => handleOpenApply()}
            onOpenTour={() => setIsTourModalOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenApply={() => handleOpenApply()}
            onOpenTour={() => setIsTourModalOpen(true)}
          />
        )}

        {currentPage === 'academics' && (
          <AcademicsPage
            onNavigate={handleNavigate}
            onOpenApplyWithGrade={(grade) => handleOpenApply(grade)}
          />
        )}

        {currentPage === 'admissions' && (
          <AdmissionsPage
            onNavigate={handleNavigate}
            onOpenApply={() => handleOpenApply()}
            onOpenPrintableForm={() => setIsPrintableModalOpen(true)}
            onOpenTour={() => setIsTourModalOpen(true)}
            onOpenChatTracker={(refCode) => {
              setChatTrackerRefCode(refCode || '');
              setIsChatTrackerOpen(true);
            }}
          />
        )}

        {currentPage === 'campus-life' && (
          <CampusLifePage
            onNavigate={handleNavigate}
            onOpenApply={() => handleOpenApply()}
            onOpenTour={() => setIsTourModalOpen(true)}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            onNavigate={handleNavigate}
            onOpenTour={() => setIsTourModalOpen(true)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage
            onNavigate={handleNavigate}
            onGalleryUpdated={() => {
              // Trigger reload of announcements or gallery
              const list = getAnnouncements();
              setActiveAnnouncement(list.find((a) => a.isActive) || null);
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenApply={() => handleOpenApply()}
        onOpenTour={() => setIsTourModalOpen(true)}
      />

      {/* Bright Floating "Apply Now" & Quick Dial Action Stack */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="p-3 bg-white text-slate-700 hover:text-slate-950 rounded-full shadow-lg border border-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* Floating Call Button */}
        <a
          href={`tel:${SCHOOL_INFO.contact.phone.replace(/\s+/g, '')}`}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md border border-slate-700 transition-all hover:scale-105"
          title="Direct Call to School"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>{SCHOOL_INFO.contact.phone}</span>
        </a>

        {/* Bright Floating "Apply Now" Button */}
        <button
          onClick={() => handleOpenApply()}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 text-slate-950 font-black text-sm tracking-wide rounded-full shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/45 ring-4 ring-amber-400/30 transition-all transform hover:-translate-y-1 active:translate-y-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>Apply Now</span>
        </button>
      </div>

      {/* Interactive Admissions Application Modal */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        preselectedGrade={preselectedGrade}
        onOpenPrintableForm={() => {
          setIsApplyModalOpen(false);
          setIsPrintableModalOpen(true);
        }}
        onOpenChatTracker={(refCode) => {
          setChatTrackerRefCode(refCode || '');
          setIsChatTrackerOpen(true);
        }}
      />

      {/* Interactive Campus Tour Modal */}
      <CampusTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
      />

      {/* Printable / Downloadable Application Form Modal */}
      <PrintableApplicationModal
        isOpen={isPrintableModalOpen}
        onClose={() => setIsPrintableModalOpen(false)}
      />

      {/* Live Applicant Status & Admin Chat Modal */}
      <ApplicantChatTrackerModal
        isOpen={isChatTrackerOpen}
        onClose={() => setIsChatTrackerOpen(false)}
        initialRefCode={chatTrackerRefCode}
      />
    </div>
  );
}
