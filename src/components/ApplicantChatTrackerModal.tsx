import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  Sparkles,
  School,
  Mail,
  User,
  GraduationCap,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { getApplications, AdminApplication } from '../services/adminStore';

interface ApplicantChatTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRefCode?: string;
}

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

export const ApplicantChatTrackerModal: React.FC<ApplicantChatTrackerModalProps> = ({
  isOpen,
  onClose,
  initialRefCode = '',
}) => {
  const [searchInput, setSearchInput] = useState(initialRefCode);
  const [activeRefCode, setActiveRefCode] = useState(initialRefCode);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [localApp, setLocalApp] = useState<AdminApplication | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Sync initialRefCode if prop changes
  useEffect(() => {
    if (initialRefCode) {
      setSearchInput(initialRefCode);
      setActiveRefCode(initialRefCode);
    }
  }, [initialRefCode]);

  // Load thread from backend API and local store
  const fetchThreadData = async (ref: string) => {
    if (!ref.trim()) return;
    setIsLoading(true);
    setSearchError('');

    const cleanRef = ref.trim().toUpperCase();

    // Check local applications store
    const apps = getApplications();
    const foundLocal = apps.find(
      (a) => a.refCode.toUpperCase() === cleanRef || (a.parentEmail && a.parentEmail.toLowerCase() === ref.trim().toLowerCase())
    );
    if (foundLocal) {
      setLocalApp(foundLocal);
    }

    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(cleanRef)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.thread) {
          setThread(data.thread);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // API fallback
    }

    // Fallback synthesis if found in local storage
    if (foundLocal) {
      setThread({
        refCode: foundLocal.refCode,
        studentName: foundLocal.studentName,
        parentName: foundLocal.parentName,
        parentEmail: foundLocal.parentEmail,
        parentPhone: foundLocal.parentPhone,
        gradeCode: foundLocal.gradeCode,
        status: foundLocal.status,
        messages: [
          {
            id: 'init-1',
            sender: 'system',
            senderName: 'Mugina Hope Administration Desk',
            text: `Application ${foundLocal.refCode} for ${foundLocal.studentName} is ${
              foundLocal.status === 'Confirmed & Enrolled' ? 'CONFIRMED' : 'under administrative review'
            }. Send any questions to Administrator Norbert Ihimbazwe Manzi below.`,
            createdAt: foundLocal.createdAt,
          },
        ],
        updatedAt: foundLocal.createdAt,
      });
    } else {
      setSearchError('No application found with that reference code or email. Please check your reference code.');
      setThread(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && activeRefCode) {
      fetchThreadData(activeRefCode);
    }
  }, [isOpen, activeRefCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveRefCode(searchInput.trim());
    fetchThreadData(searchInput.trim());
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !thread) return;

    setIsSending(true);
    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(thread.refCode)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'parent',
          senderName: thread.parentName || 'Applicant Parent',
          text: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setThread((prev) => (prev ? { ...prev, messages: [...prev.messages, data.message] } : null));
        }
      }
    } catch {
      // Local optimistic append
      const optMsg: ChatMessage = {
        id: `opt-${Date.now()}`,
        sender: 'parent',
        senderName: thread.parentName || 'Applicant Parent',
        text: textToSend,
        createdAt: new Date().toISOString(),
      };
      setThread((prev) => (prev ? { ...prev, messages: [...prev.messages, optMsg] } : null));
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-white">
                  Application Status & Admin Chat
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  Direct Line to Admin Norbert
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Track verification progress & communicate in real time with school administration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar / Reference Code Finder */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Application Ref Code (e.g. MHA-2026-7841) or Parent Gmail..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Find Application'}
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{searchError}</span>
            </p>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {thread ? (
            <>
              {/* Application Status Banner */}
              <div
                className={`p-4 rounded-2xl border ${
                  thread.status === 'Confirmed & Enrolled'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                } space-y-2`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {thread.status === 'Confirmed & Enrolled' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {thread.status === 'Confirmed & Enrolled'
                          ? 'Registration Approved & Enrolled'
                          : 'Status: Pending Administrator Confirmation'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Learner: <strong>{thread.studentName}</strong> · Class: <strong>{thread.gradeCode}</strong> · Ref: <code>{thread.refCode}</code>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      thread.status === 'Confirmed & Enrolled'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {thread.status}
                  </span>
                </div>

                {/* If Confirmed, Show Assigned Credentials */}
                {thread.status === 'Confirmed & Enrolled' && (
                  <div className="mt-3 p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs space-y-1 text-slate-800">
                    <p className="font-bold text-emerald-900">
                      🎉 Student Portal Credentials Generated:
                    </p>
                    <p>
                      <strong>Registration ID:</strong> <code>{localApp?.assignedStudentId || 'MHA-STU-2026'}</code> · <strong>Student User:</strong> <code>stu.{thread.studentName.toLowerCase().replace(/\s+/g, '')}</code>
                    </p>
                    {localApp?.feedbackNotes && (
                      <p className="text-slate-600 italic mt-1">
                        &ldquo;{localApp.feedbackNotes}&rdquo; — Norbert Ihimbazwe Manzi
                      </p>
                    )}
                  </div>
                )}

                {/* If Pending, Show Reassurance & Timeline */}
                {thread.status !== 'Confirmed & Enrolled' && (
                  <div className="text-xs text-amber-800 space-y-1 bg-white/70 p-3 rounded-xl border border-amber-200/70">
                    <p className="font-semibold">
                      Your application has been safely logged with School Administrator Norbert Ihimbazwe Manzi.
                    </p>
                    <p className="text-[11px] text-amber-700">
                      When confirmed, an official email notification with student credentials will arrive at <strong>{thread.parentEmail || 'your email'}</strong>. You can ask any questions directly below.
                    </p>
                  </div>
                )}
              </div>

              {/* Chat Thread Messages */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>Conversation with Administration Desk</span>
                  <span>{thread.messages.length} message(s)</span>
                </div>

                <div className="space-y-3">
                  {thread.messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div
                          key={msg.id}
                          className="bg-slate-100/90 text-slate-600 border border-slate-200 text-xs rounded-xl p-3 text-center space-y-1"
                        >
                          <p className="font-semibold">{msg.text}</p>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        {isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            NM
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 shadow-2xs ${
                            isAdmin
                              ? 'bg-slate-100 text-slate-900 border border-slate-200'
                              : 'bg-blue-900 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
                            <span className="font-bold">{msg.senderName}</span>
                            <span className="font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        </div>

                        {!isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {thread.parentName ? thread.parentName[0] : 'P'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-3 text-slate-500">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Check Your Application Status</h4>
              <p className="text-xs max-w-sm mx-auto text-slate-500 leading-relaxed">
                Enter the reference code you received when registering (e.g., <code>MHA-2026-7841</code>) or your registered Gmail to see live status and chat with Admin Norbert.
              </p>
            </div>
          )}
        </div>

        {/* Message Input Footer (when thread is loaded) */}
        {thread && (
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message or question to Administrator Norbert..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Mail className="w-3 h-3 text-blue-600" />
              <span>
                New messages alert Administrator Norbert at <code>norbertihimbazwemanzi@gmail.com</code>.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
