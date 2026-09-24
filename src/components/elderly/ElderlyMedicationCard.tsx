import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { Reminder } from '../../types';

export const ElderlyMedicationCard: React.FC = () => {
  const {
    language,
    reminders,
    markReminderTaken,
    snoozeReminder,
    speak,
    stopVoice,
    isSpeaking,
    setShowPharmacyModal,
    setPharmacyTab,
    addToCart,
  } = useApp();

  const t = getTranslation(language);
  const [showAllMeds, setShowAllMeds] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filter medication reminders
  const medicationReminders = reminders.filter((r) => r.type === 'medication');

  // Find currently active / due medication (first uncompleted or snoozed, else first one)
  const activeMed: Reminder | undefined =
    medicationReminders.find((r) => !r.completed) ||
    medicationReminders[0];

  const handleTaken = (med: Reminder) => {
    markReminderTaken(med.id);
    const medName = med.medicineName || (language === 'hi' ? med.titleHi : med.titleEn);
    const msg =
      language === 'hi'
        ? `शाबाश शर्मा जी! ${medName} ले ली गई है।`
        : `Well done Sharma Ji! ${medName} marked as taken.`;
    setFeedbackMessage(msg);
    speak(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleSnooze = (med: Reminder) => {
    snoozeReminder(med.id, 15);
    const medName = med.medicineName || (language === 'hi' ? med.titleHi : med.titleEn);
    const msg =
      language === 'hi'
        ? `${medName} के लिए 15 मिनट बाद दोबारा याद दिलाया जाएगा।`
        : `Reminder for ${medName} snoozed for 15 minutes.`;
    setFeedbackMessage(msg);
    speak(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleReadAloud = (med: Reminder) => {
    if (isSpeaking) {
      stopVoice();
      return;
    }
    const medName = med.medicineName || (language === 'hi' ? med.titleHi : med.titleEn);
    const dosage = med.dosage ? `${med.dosage}. ` : '';
    const timing = med.timing ? `${med.timing}. ` : '';
    const instructions =
      language === 'hi'
        ? med.instructionsHi || 'कृपया समय पर दवा लें।'
        : med.instructionsEn || 'Please take your medication with water.';

    const textToSpeak =
      language === 'hi'
        ? `शर्मा जी, आपकी दवा का समय है: ${medName}, खुराक ${dosage}${timing}${instructions}`
        : `Sharma Ji, it is time for your medication: ${medName}, dosage ${dosage}${timing}${instructions}`;

    speak(textToSpeak);
  };

  if (medicationReminders.length === 0) {
    return null;
  }

  const allTaken = medicationReminders.every((r) => r.completed);

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/50 p-5 sm:p-6 shadow-md transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
            💊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {language === 'hi' ? 'दवा का समय' : 'Medication Reminder'}
              </h3>
              {activeMed && !activeMed.completed && (
                <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  {activeMed.status === 'snoozed'
                    ? language === 'hi'
                      ? 'टाली गई (Snoozed)'
                      : 'Snoozed'
                    : language === 'hi'
                    ? 'लेने का समय'
                    : 'Due Now'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {language === 'hi'
                ? 'डॉक्टर और अनीता द्वारा निर्धारित दैनिक दवाएं'
                : 'Prescribed daily doses monitored by caregiver Anita'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Order Medicine Online Button */}
          <button
            onClick={() => {
              setPharmacyTab('store');
              setShowPharmacyModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs transition-all active:scale-95"
            title="Order Medicines Online"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'दवाइयां मंगाएं' : 'Order Medicine'}</span>
          </button>

          {/* View all toggle */}
          <button
            onClick={() => setShowAllMeds((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-xs border border-indigo-200 shadow-2xs transition-colors"
          >
            <span>
              {showAllMeds
                ? language === 'hi'
                  ? 'संक्षेप में देखें'
                  : 'Show Active Only'
                : language === 'hi'
                ? `सभी दवाएं (${medicationReminders.length})`
                : `View All (${medicationReminders.length})`}
            </span>
            {showAllMeds ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Instant Feedback Toast */}
      {feedbackMessage && (
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-sm animate-fade-in">
          <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Focus: Due Medication Card or Celebration */}
      {allTaken ? (
        <div className="py-6 text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl">
            ✨
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'hi'
              ? 'शाबाश शर्मा जी! आज की सभी दवाएं पूरी हो चुकी हैं।'
              : 'Wonderful, Sharma Ji! All medications for today have been taken.'}
          </h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {language === 'hi'
              ? 'आपकी देखभालकर्ता अनीता को सूचित कर दिया गया है। अपना ख्याल रखें और मुस्कुराते रहें!'
              : 'Your caregiver Anita has been updated. Keep up your healthy daily routine!'}
          </p>
        </div>
      ) : activeMed ? (
        <div className="mt-4 bg-white rounded-2xl p-5 sm:p-6 border-2 border-indigo-300 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-950 font-black text-xs uppercase tracking-wide">
                  {activeMed.timing || 'Scheduled Dose'}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeMed.time}</span>
                </span>
                {activeMed.dosage && (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {activeMed.dosage}
                  </span>
                )}
              </div>

              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
                {language === 'hi' ? activeMed.titleHi : activeMed.titleEn}
              </h4>

              <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                👉{' '}
                {language === 'hi'
                  ? activeMed.instructionsHi || 'गुनगुने पानी के साथ भोजन के बाद लें।'
                  : activeMed.instructionsEn || 'Take after meal with warm water.'}
              </p>

              {activeMed.status === 'snoozed' && activeMed.snoozedUntil && (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>
                    {language === 'hi'
                      ? `15 मिनट के लिए टाला गया · अगला अलर्ट: ${activeMed.snoozedUntil}`
                      : `Snoozed for 15 minutes · Next reminder at: ${activeMed.snoozedUntil}`}
                  </span>
                </div>
              )}
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={() => handleReadAloud(activeMed)}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-300 transition-colors"
              title="Listen to medicine instructions"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-600" />
                  <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'hi' ? 'बोलकर सुनाएं' : 'Listen'}</span>
                </>
              )}
            </button>
          </div>

          {/* Big Accessible Action Buttons: Taken & Snooze */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Taken Button */}
            <button
              onClick={() => handleTaken(activeMed)}
              className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg sm:text-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-3 border-2 border-emerald-500"
            >
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              <span>{language === 'hi' ? 'खा ली / ले ली (Taken)' : 'Taken (Mark Complete)'}</span>
            </button>

            {/* Snooze Button */}
            <button
              onClick={() => handleSnooze(activeMed)}
              className="py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg sm:text-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-3 border-2 border-amber-400"
            >
              <Clock className="w-6 h-6 stroke-[2.5]" />
              <span>{language === 'hi' ? '15 मिनट बाद (Snooze)' : 'Snooze (15 Mins)'}</span>
            </button>
          </div>

          {/* Quick 1-Click Refill Prompt */}
          <div className="pt-1 flex items-center justify-between text-xs bg-white/70 p-3 rounded-2xl border border-indigo-100">
            <span className="text-slate-600 font-bold flex items-center gap-1.5">
              <span>⚡</span>
              <span>
                {language === 'hi'
                  ? 'दवा खत्म होने वाली है? 2 घंटे में घर डिलीवरी'
                  : 'Running low on doses? 2-Hour doorstep delivery'}
              </span>
            </span>
            <button
              onClick={() => {
                setPharmacyTab('refill');
                setShowPharmacyModal(true);
              }}
              className="px-3 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'hi' ? 'रीफिल ऑर्डर करें' : 'Order Refill'}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Expanded List of all today's medications */}
      {showAllMeds && (
        <div className="mt-4 pt-4 border-t border-indigo-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>{language === 'hi' ? 'आज की दवाएं' : "Today's Medication Schedule"}</span>
            <span>
              {medicationReminders.filter((r) => r.completed).length} /{' '}
              {medicationReminders.length} {language === 'hi' ? 'ली गईं' : 'Taken'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {medicationReminders.map((med) => (
              <div
                key={med.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  med.completed
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : med.status === 'snoozed'
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base ${
                      med.completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {med.completed ? '✓' : '💊'}
                  </div>
                  <div className="min-w-0">
                    <h5
                      className={`text-sm font-bold truncate ${
                        med.completed ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {language === 'hi' ? med.titleHi : med.titleEn}
                    </h5>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>{med.time}</span>
                      <span>·</span>
                      <span className="truncate">{med.dosage || med.timing}</span>
                      {med.takenAt && (
                        <span className="text-emerald-700 font-bold">
                          (at {med.takenAt})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!med.completed ? (
                    <>
                      <button
                        onClick={() => handleTaken(med)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs"
                      >
                        {t.taken}
                      </button>
                      <button
                        onClick={() => handleSnooze(med)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs"
                      >
                        {t.snooze}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      ✓ {language === 'hi' ? 'ली जा चुकी' : 'Taken'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
