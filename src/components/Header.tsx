import React, { useState } from 'react';
import { PageId } from '../types';
import { Menu, X, Shield, Lock, LogOut } from 'lucide-react';
import { isAdminAuthenticated, setCurrentSessionUser, getCurrentSessionUser } from '../services/adminStore';
import { SchoolLogo } from './SchoolLogo';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenApply: () => void;
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenApply,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sessionUser = getCurrentSessionUser();
  const isAdmin = isAdminAuthenticated();

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'campus-life', label: 'Campus Life' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    setCurrentSessionUser(null);
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark with Official School Crest Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-hidden group shrink-0"
          >
            <SchoolLogo size="md" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-display group-hover:text-blue-700 transition-colors">
                Mugina Hope Academy
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-normal">
                Primary & Nursery · Kamonyi
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-800 ${
                    isActive ? 'text-blue-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Admin Portal + Apply Now) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Role-Based Portal Button */}
            {sessionUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors border ${
                    currentPage === 'admin'
                      ? 'bg-blue-900 text-white border-blue-800'
                      : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                  }`}
                  title={`${sessionUser.role} Dashboard`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>{sessionUser.role} Portal</span>
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('admin')}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  currentPage === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Staff & Admin Portal"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Staff Portal</span>
                <span className="sm:hidden">Staff</span>
              </button>
            )}

            {/* Bright, Floating/Prominent Apply Now Button */}
            <button
              onClick={onOpenApply}
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-lg shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shrink-0 border border-amber-400"
            >
              Apply Now
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-150">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('admin')}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentPage === 'admin'
                  ? 'bg-blue-900 text-white font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-500" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Admin Login'}</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApply();
              }}
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm"
            >
              Apply for Admission
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
