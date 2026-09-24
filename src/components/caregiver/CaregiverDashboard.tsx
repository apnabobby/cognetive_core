import React, { useState } from 'react';
import {
  Brain,
  Clock,
  CheckCircle2,
  Smile,
  Bell,
  Sparkles,
  TrendingUp,
  Calendar,
  AlertCircle,
  Plus,
  FileText,
  User,
  Phone,
  Play,
  RotateCcw,
  Check,
  Mic,
  MessageSquareQuote,
  Volume2,
  Navigation,
  MapPin,
  Building2,
  ShieldAlert,
  Stethoscope,
  ExternalLink,
  Pill,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { WEEKLY_CHART_DATA } from '../../utils/demoData';
import { HOSPITALS_DATA, NEURO_SURGEONS_DATA } from '../../utils/medicalData';
import { CaregiverMedicationManager } from './CaregiverMedicationManager';
import { ReminderType } from '../../types';
import { unlockAudioContext } from '../../utils/voiceCompanion';

export const CaregiverDashboard: React.FC = () => {
  const {
    language,
    userProfile,
    activityHistory,
    reminders,
    toggleReminder,
    addReminder,
    deleteReminder,
    markReminderTaken,
    snoozeReminder,
    recommendation,
    currentMood,
    startActivity,
    setRole,
    voiceLogs,
    setShowVoiceModal,
    setShowMedicalModal,
    setMedicalModalTab,
  } = useApp();
  const t = getTranslation(language);

  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('6:00 PM');
  const [newReminderType, setNewReminderType] = useState<ReminderType>('cognitive');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [remindLaterNotice, setRemindLaterNotice] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [caregiverNotes, setCaregiverNotes] = useState<string[]>([
    'Sharma Ji was in cheerful spirits during the morning memory match. He recalled tea and clock immediately.',
    'Listened to nostalgic Kishore Kumar songs before lunch; visibly calmer.',
  ]);

  // Calculations for Today's Summary
  const todaysActivities = activityHistory.filter((a) => a.dateKey === '2026-09-23' || a.timestamp.includes('Today'));
  const completedCount = todaysActivities.length;
  const totalSeconds = todaysActivities.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
  const totalMinutes = Math.round(totalSeconds / 60) || (completedCount > 0 ? 18 : 0);

  const handleRemindLater = (id: string, time: string) => {
    snoozeReminder(id, 15);
    setRemindLaterNotice(`Reminder snoozed for 15 minutes (Next alert at ${time})`);
    setTimeout(() => setRemindLaterNotice(null), 4000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setCaregiverNotes((prev) => [newNote.trim(), ...prev]);
    setNewNote('');
  };

  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    addReminder({
      titleEn: newReminderTitle.trim(),
      titleHi: newReminderTitle.trim(),
      time: newReminderTime,
      completed: false,
      type: newReminderType,
      medicineName: newReminderType === 'medication' ? newReminderTitle.trim() : undefined,
    });
    setNewReminderTitle('');
    setShowAddReminderModal(false);
  };

  // Domain score breakdowns
  const domainScores = [
    {
      nameEn: 'Memory Association',
      nameHi: 'स्मृति जुड़ाव',
      score: 84,
      trend: '+6%',
      color: 'bg-amber-500',
      textColor: 'text-amber-800',
    },
    {
      nameEn: 'Visual Recall',
      nameHi: 'दृश्य स्मरण',
      score: 78,
      trend: '+4%',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-800',
    },
    {
      nameEn: 'Pattern Recognition',
      nameHi: 'पैटर्न व तर्क',
      score: 90,
      trend: '+8%',
      color: 'bg-violet-500',
      textColor: 'text-violet-800',
    },
    {
      nameEn: 'Attention & Focus',
      nameHi: 'एकाग्रता व ध्यान',
      score: 88,
      trend: '+5%',
      color: 'bg-sky-500',
      textColor: 'text-sky-800',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner / Disclaimer */}
      <div className="bg-amber-50/90 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3 shadow-2xs">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-amber-900 leading-relaxed">
          <span className="font-bold block text-amber-950 mb-0.5">
            {t.disclaimerTitle} · {t.activityProgress}
          </span>
          {t.disclaimerText}
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shrink-0">
            👴
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {userProfile.name}
              </h1>
              <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {userProfile.age} yrs · {userProfile.relation}
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              Caregiver: <span className="font-bold text-slate-800">{userProfile.caregiverName}</span> ({userProfile.caregiverPhone})
            </p>
            <div className="text-xs text-slate-500 mt-0.5">
              Focus: <span className="font-medium text-emerald-800">{userProfile.primaryCondition}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRole('elderly');
              startActivity(recommendation.gameId);
            }}
            className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm md:text-base shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Activity with Senior</span>
          </button>
        </div>
      </div>

      {/* Today's Summary 4-Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-3">{t.todaysSummary}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Card 1: Completed Activities */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t.gamesCompleted}</span>
              <Brain className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {completedCount > 0 ? completedCount : 4}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Target: 4 sessions / day
              </span>
            </div>
          </div>

          {/* Card 2: Total Time */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t.totalTime}</span>
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {totalMinutes > 0 ? totalMinutes : 18}
                </span>
                <span className="text-base font-semibold text-slate-600">{t.minutes}</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold block mt-1">
                Goal: 20 min (90% reached)
              </span>
            </div>
          </div>

          {/* Card 3: Participation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t.participation}</span>
              <CheckCircle2 className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-800">
                {t.participationGood}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Responsive & engaged
              </span>
            </div>
          </div>

          {/* Card 4: Mood Check-in */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t.moodCheckin}</span>
              <Smile className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">
                  {currentMood === 'happy'
                    ? '😊'
                    : currentMood === 'okay'
                    ? '🙂'
                    : currentMood === 'neutral'
                    ? '😐'
                    : currentMood === 'sad'
                    ? '😔'
                    : '😟'}
                </span>
                <span className="text-xl font-bold text-slate-800">
                  {currentMood === 'happy'
                    ? t.happy
                    : currentMood === 'okay'
                    ? t.okay
                    : currentMood === 'neutral'
                    ? t.neutral
                    : currentMood === 'sad'
                    ? t.sad
                    : t.worried}
                </span>
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                Logged during afternoon session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Section */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 rounded-3xl p-6 border-2 border-amber-300 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Activity Recommendation Engine (Rule-Based Heuristic)</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Updated based on recent history
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧩</span>
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'hi' ? recommendation.titleHi : recommendation.titleEn}
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {recommendation.difficulty === 'easy' ? 'Easy Level' : 'Medium Level'}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pt-1">
              <span className="font-semibold text-slate-900">Why recommended: </span>
              {language === 'hi' ? recommendation.reasonHi : recommendation.reasonEn}
            </p>
            <div className="text-xs text-slate-500 pt-1">
              Estimated Duration: <strong>{recommendation.estimatedMinutes} minutes</strong> · Target: Working Visual & Associative Memory
            </div>
          </div>

          <button
            onClick={() => {
              setRole('elderly');
              startActivity(recommendation.gameId);
            }}
            className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-md flex items-center justify-center gap-2 shrink-0 self-start md:self-auto transition-transform active:scale-95"
          >
            <span>{t.startRecommended}</span>
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Nearest Emergency Hospitals & Neurosurgeons On-Duty Card */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-red-50/50 rounded-3xl p-6 border-2 border-rose-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-xl shadow-xs">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {language === 'hi'
                    ? 'नजदीकी इमरजेंसी अस्पताल व ऑन-ड्यूटी न्यूरोसर्जन'
                    : 'Nearest Emergency Hospitals & On-Duty Neurosurgeons'}
                </h3>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                  Active Triage
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                {language === 'hi'
                  ? 'शर्मा जी के लिए 24x7 न्यूरो ट्रॉमा आईसीयू, विशेषज्ञ उपलब्धता और 1-टैप कॉल/नेविगेशन'
                  : 'Real-time specialist availability, drive times, and emergency hotline for Sharma Ji'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setMedicalModalTab('sos');
                setShowMedicalModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs transition-transform active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOS & Profile</span>
            </button>

            <button
              onClick={() => {
                setMedicalModalTab('hospitals');
                setShowMedicalModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-950 font-bold text-xs border border-rose-300 shadow-2xs transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
              <span>View Directory</span>
            </button>
          </div>
        </div>

        {/* 3 Nearest Top Tertiary Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {HOSPITALS_DATA.slice(0, 3).map((hosp) => (
            <div
              key={hosp.id}
              className="bg-white rounded-2xl p-4 border border-rose-200 hover:border-rose-400 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                    {hosp.type.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-black text-rose-900 bg-rose-50 px-2 py-0.5 rounded-md">
                    <Navigation className="w-3 h-3 text-rose-600" />
                    <span>{hosp.distanceKm} km · ~{hosp.driveTimeMin}m</span>
                  </div>
                </div>

                <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                  {language === 'hi' ? hosp.nameHi : hosp.name}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-1">
                  📍 {hosp.address}
                </p>

                <div className="bg-slate-50 p-2 rounded-lg text-[11px] border border-slate-100 space-y-1">
                  <div className="text-emerald-950 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>On-Duty: {hosp.currentNeuroSurgeonOnDuty.split('(')[0]}</span>
                  </div>
                  <div className="text-slate-500">
                    ICU Beds: <span className="font-bold text-slate-700">{hosp.neuroICUBeds}</span> · 24x7 ER Active
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${hosp.emergencyPhone}`}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs text-center flex items-center justify-center gap-1"
                >
                  <Phone className="w-3 h-3 fill-current" />
                  <span>Call ER</span>
                </a>

                <a
                  href={hosp.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1"
                  title="Open in Google Maps"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Map</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Available Neurosurgeons Summary Banner */}
        <div className="bg-white/80 p-3 rounded-2xl border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Stethoscope className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-slate-900">
                Top Rated Neurosurgeons on Duty:
              </span>{' '}
              <span className="text-slate-700">
                Dr. Ashok Kumar (AIIMS, M.Ch - On Call) · Dr. Rajesh Verma (Max, DM - Available)
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setMedicalModalTab('surgeons');
              setShowMedicalModal(true);
            }}
            className="text-xs font-black text-rose-800 hover:text-rose-900 bg-rose-100/70 hover:bg-rose-100 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto transition-colors"
          >
            {language === 'hi' ? 'सभी न्यूरोसर्जन देखें →' : 'View All 5 Neurosurgeons →'}
          </button>
        </div>
      </div>

      {/* Medication Schedule & Adherence Feature for Caregivers */}
      <CaregiverMedicationManager />

      {/* Two Column Layout: Activity Progress & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cognitive Activity Trends (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Domain Breakdown Bars */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t.activityProgress}
                </h3>
                <p className="text-xs text-slate-500">
                  Engagement & participation levels across cognitive modalities
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                Past 14 Days
              </span>
            </div>

            <div className="space-y-4">
              {domainScores.map((domain) => (
                <div key={domain.nameEn} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-800">
                      {language === 'hi' ? domain.nameHi : domain.nameEn}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700">
                        {domain.trend}
                      </span>
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {domain.score}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${domain.color} transition-all duration-500`}
                      style={{ width: `${domain.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
              * Activity scores reflect consistency of participation and completed exercise sessions, not medical diagnostics.
            </div>
          </div>

          {/* Weekly Trend Bar Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>{t.weeklyTrend}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Daily active minutes engaged in cognitive stimulation
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600">
                Avg: 18 min / day
              </span>
            </div>

            {/* SVG / Bar Chart Representation */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 border-b border-slate-200">
              {WEEKLY_CHART_DATA.map((item) => {
                const heightPercent = (item.minutes / 30) * 100;
                const isToday = item.day.includes('Today');

                return (
                  <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-bold text-slate-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.minutes}m
                    </span>
                    <div
                      className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${
                        isToday
                          ? 'bg-amber-500 ring-2 ring-amber-300'
                          : 'bg-emerald-600/80 hover:bg-emerald-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[11px] font-semibold truncate ${isToday ? 'text-amber-900 font-bold' : 'text-slate-500'}`}>
                      {language === 'hi' ? item.dayHi : item.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Reminders & Notes */}
        <div className="space-y-6">
          {/* Reminders Manager */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>{t.remindersTitle}</span>
              </h3>
              <button
                onClick={() => setShowAddReminderModal(true)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {remindLaterNotice && (
              <div className="p-3 mb-3 bg-sky-50 border border-sky-200 text-sky-900 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>{remindLaterNotice}</span>
              </div>
            )}

            <div className="space-y-3">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    rem.completed
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">
                          {rem.type === 'medication' ? '💊' : rem.type === 'walk' ? '🚶' : rem.type === 'hydration' ? '💧' : '🧠'}
                        </span>
                        <h4 className={`text-sm font-bold ${rem.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {language === 'hi' ? rem.titleHi : rem.titleEn}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {rem.time}
                        </span>
                        {rem.status === 'snoozed' && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Snoozed ({rem.snoozedUntil || '15m'})
                          </span>
                        )}
                        {rem.takenAt && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Taken ({rem.takenAt})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleReminder(rem.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          rem.completed
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {rem.completed ? 'Completed' : t.done}
                      </button>

                      {!rem.completed && (
                        <button
                          onClick={() => handleRemindLater(rem.id, rem.time)}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 bg-slate-100"
                        >
                          Later
                        </button>
                      )}

                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caregiver Observation Notes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>{t.caregiverNotes}</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2 mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Note behavior, memory cues, or mood observation..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={2}
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs"
              >
                {t.addNote}
              </button>
            </form>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {caregiverNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed"
                >
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Entry #{idx + 1} · {idx === 0 ? 'Today 11:30 AM' : 'Today 1:15 PM'}
                  </span>
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Voice Interactions & Emotional Signals */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Mic className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t.voiceLogs}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.voiceLogSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              🎙️ {voiceLogs.length} Voice Logs Recorded
            </span>
            <button
              onClick={() => {
                unlockAudioContext();
                setShowVoiceModal(true);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'साथी टेस्ट करें' : 'Test Saathi'}</span>
            </button>
          </div>
        </div>

        {voiceLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No voice conversations recorded yet. Tap "Test Saathi" above to start.
          </div>
        ) : (
          <div className="space-y-3.5">
            {voiceLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2.5 transition-all hover:bg-amber-50/70"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-md">
                      📌 {log.topic || 'General Topic'}
                    </span>
                    <span className="text-slate-600 font-medium">{log.timestamp}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white border border-amber-300 text-amber-900 shadow-2xs">
                    Emotion: {log.detectedMood}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm">
                  {/* Sharma Ji utterance */}
                  <div className="flex items-start gap-2 text-slate-800 bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                    <span className="font-bold text-slate-600 shrink-0">👴 Sharma Ji:</span>
                    <span className="font-medium italic">"{log.userQuery}"</span>
                  </div>

                  {/* Saathi response */}
                  <div className="flex items-start gap-2 text-amber-950 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="font-bold text-amber-800 shrink-0">🌸 Saathi:</span>
                    <span className="font-medium">{log.saathiResponse}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>AI model: Gemini 3.8 Flash & Gemini Flash-Lite TTS</span>
          <span className="text-emerald-700 font-semibold">Reminiscence and cognitive reassurance active</span>
        </div>
      </div>

      {/* Activity History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {t.activityHistory}
            </h3>
            <p className="text-xs text-slate-500">
              Verified record of completed cognitive sessions
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total records: {activityHistory.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">{t.activityName}</th>
                <th className="py-3 px-4 font-bold">{t.dateAndTime}</th>
                <th className="py-3 px-4 font-bold">{t.timeSpent}</th>
                <th className="py-3 px-4 font-bold">{t.score}</th>
                <th className="py-3 px-4 font-bold">Recorded Mood</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activityHistory.slice(0, 7).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">
                      {item.gameId === 'memory-match'
                        ? '🧩'
                        : item.gameId === 'picture-recall'
                        ? '🖼️'
                        : item.gameId === 'number-match'
                        ? '🔢'
                        : item.gameId === 'color-pattern'
                        ? '🎨'
                        : item.gameId === 'music-memory'
                        ? '🎵'
                        : '🧠'}
                    </span>
                    <span>{item.gameTitle}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{item.timestamp}</td>
                  <td className="py-3 px-4 text-slate-700 tabular-nums">
                    {Math.round(item.timeSpentSeconds / 60)} {t.minutes}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-800 tabular-nums">
                    {item.score} / {item.maxScore}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                    {item.mood ? (
                      <span className="capitalize">
                        {item.mood === 'happy' ? '😊 Happy' : item.mood === 'okay' ? '🙂 Okay' : item.mood}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              Create New Caregiver Reminder
            </h3>
            <form onSubmit={handleAddReminderSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Reminder Type
                </label>
                <select
                  value={newReminderType}
                  onChange={(e) => setNewReminderType(e.target.value as ReminderType)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="cognitive">🧠 Cognitive Stimulation Activity</option>
                  <option value="medication">💊 Medication Reminder</option>
                  <option value="walk">🚶 Walk / Gentle Stretching</option>
                  <option value="hydration">💧 Hydration / Warm Water</option>
                  <option value="music">🎶 Music / Reminiscence</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="e.g. Cognitive activity at 5:00 PM"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  placeholder="e.g. 5:00 PM"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md"
                >
                  Save Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
