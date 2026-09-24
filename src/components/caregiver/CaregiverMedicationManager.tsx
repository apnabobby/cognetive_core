import React, { useState } from 'react';
import {
  Pill,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Calendar,
  Info,
  ShoppingBag,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { Reminder } from '../../types';

const COMMON_MEDICATIONS = [
  { name: 'Donepezil', dosage: '5mg', timing: 'After Dinner', instructionsEn: 'Take with warm water after dinner for cognitive support.', instructionsHi: 'रात के खाने के बाद आधे गिलास गुनगुने पानी के साथ लें।' },
  { name: 'Telmisartan', dosage: '40mg', timing: 'Morning with breakfast', instructionsEn: 'Take morning after breakfast for BP control.', instructionsHi: 'सुबह नाश्ते के बाद रक्तचाप नियंत्रण हेतु लें।' },
  { name: 'Memantine', dosage: '10mg', timing: 'Morning & Evening', instructionsEn: 'Take with water for memory and focus.', instructionsHi: 'स्मृति और एकाग्रता हेतु पानी के साथ लें।' },
  { name: 'Neurobion Forte', dosage: '1 tablet', timing: 'After Lunch', instructionsEn: 'Multivitamin for nerve health.', instructionsHi: 'तंत्रिका स्वास्थ्य के लिए मल्टीविटामिन।' },
  { name: 'Calcium + Vit D3', dosage: '500mg', timing: 'Bedtime', instructionsEn: 'Take before sleep with warm water or milk.', instructionsHi: 'सोने से पहले गुनगुने पानी या दूध के साथ लें।' },
];

export const CaregiverMedicationManager: React.FC = () => {
  const {
    language,
    reminders,
    addReminder,
    deleteReminder,
    markReminderTaken,
    snoozeReminder,
    toggleReminder,
    setShowPharmacyModal,
    setPharmacyTab,
    orders,
  } = useApp();

  const t = getTranslation(language);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('5mg · 1 tablet');
  const [time, setTime] = useState('8:30 PM');
  const [timing, setTiming] = useState('After Dinner');
  const [instructionsEn, setInstructionsEn] = useState('Take with warm water after meal.');
  const [instructionsHi, setInstructionsHi] = useState('भोजन के बाद गुनगुने पानी के साथ लें।');
  const [importance, setImportance] = useState<'critical' | 'routine'>('critical');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const medicationReminders = reminders.filter((r) => r.type === 'medication');
  const totalMeds = medicationReminders.length;
  const takenMeds = medicationReminders.filter((r) => r.completed).length;
  const adherencePercent = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSelectPreset = (preset: typeof COMMON_MEDICATIONS[0]) => {
    setName(preset.name);
    setDosage(preset.dosage);
    setTiming(preset.timing);
    setInstructionsEn(preset.instructionsEn);
    setInstructionsHi(preset.instructionsHi);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const titleEn = `${name.trim()} ${dosage.trim()} (${timing})`;
    const titleHi = `${name.trim()} ${dosage.trim()} (${timing})`;

    addReminder({
      titleEn,
      titleHi,
      time,
      completed: false,
      type: 'medication',
      medicineName: name.trim(),
      dosage: dosage.trim(),
      timing,
      instructionsEn,
      instructionsHi,
      status: 'pending',
      importance,
    });

    setName('');
    setShowAddModal(false);
    showNotice(
      language === 'hi'
        ? `दवा '${name.trim()}' जोड़ी गई और शर्मा जी की होम स्क्रीन पर सक्रिय है।`
        : `Medication '${name.trim()}' scheduled and visible on Sharma Ji's home screen.`
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Pill className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {language === 'hi' ? 'दवा समय-सारिणी व निगरानी' : 'Medication Schedule & Adherence'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'hi'
              ? 'शर्मा जी की होम स्क्रीन पर अलर्ट प्रदर्शित होते हैं जहां वे "Taken" या "Snooze" चुन सकते हैं'
              : "Reminders appear directly on Sharma Ji's home screen with 'Taken' and 'Snooze' options"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Adherence Badge */}
          <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Today's Adherence
            </div>
            <div className="text-sm font-black text-indigo-700">
              {takenMeds}/{totalMeds} ({adherencePercent}%)
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'दवा जोड़ें' : 'Add Medication'}</span>
          </button>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Pharmacy & Doorstep Refill Hub Banner for Caregiver */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 rounded-2xl p-4 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
            🛍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm text-slate-900">
                {language === 'hi' ? 'ऑनलाइन दवा स्टोर व होम डिलीवरी' : 'Doorstep Pharmacy & Auto-Refills'}
              </h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-emerald-200 text-emerald-900">
                2-Hour Express
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {orders.length > 0 && orders[0].orderStatus === 'out_for_delivery' ? (
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Order #{orders[0].orderNumber} is out for delivery with {orders[0].riderInfo?.name.split(' ')[0]} (~25 mins)
                </span>
              ) : (
                'Order verified Donepezil, BP meds & monitor kits with 1-click doorstep delivery.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setPharmacyTab('store');
              setShowPharmacyModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'दवा स्टोर खोलें' : 'Open Store'}</span>
          </button>

          <button
            onClick={() => {
              setPharmacyTab('orders');
              setShowPharmacyModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-black text-xs shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'ट्रैकिंग' : 'Track Deliveries'}</span>
          </button>
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        {medicationReminders.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Pill className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm">No medication reminders scheduled yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              + Add Sharma Ji's first medication
            </button>
          </div>
        ) : (
          medicationReminders.map((med) => {
            const isTaken = med.completed;
            const isSnoozed = !isTaken && med.status === 'snoozed';

            return (
              <div
                key={med.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isTaken
                    ? 'bg-slate-50/80 border-slate-200'
                    : isSnoozed
                    ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                    : 'bg-white border-indigo-200 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900">
                        {language === 'hi' ? med.titleHi : med.titleEn}
                      </span>

                      {/* Status Badges */}
                      {isTaken ? (
                        <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Taken {med.takenAt ? `at ${med.takenAt}` : ''}</span>
                        </span>
                      ) : isSnoozed ? (
                        <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Snoozed ({med.snoozedUntil || '15m'})</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Scheduled · Due
                        </span>
                      )}

                      {med.importance === 'critical' && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                          Essential
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      ⏱ Scheduled: <span className="font-bold text-slate-700">{med.time}</span> ·{' '}
                      <span>{med.timing || 'Daily Dose'}</span>
                      {med.dosage ? ` · ${med.dosage}` : ''}
                    </p>

                    <p className="text-xs text-slate-600 italic">
                      "{language === 'hi' ? med.instructionsHi : med.instructionsEn}"
                    </p>
                  </div>

                  {/* Actions for Caregiver */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
                    {!isTaken ? (
                      <>
                        <button
                          onClick={() => {
                            markReminderTaken(med.id);
                            showNotice(`Marked ${med.medicineName || 'dose'} as taken.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-2xs"
                          title="Mark taken on behalf of patient"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Taken</span>
                        </button>

                        <button
                          onClick={() => {
                            snoozeReminder(med.id, 15);
                            showNotice(`Snoozed ${med.medicineName || 'dose'} for 15 minutes.`);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1"
                          title="Snooze reminder by 15 mins"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Snooze 15m</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          toggleReminder(med.id);
                          showNotice(`Reset ${med.medicineName || 'dose'} to pending.`);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                        title="Reset back to pending"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>Reset</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        deleteReminder(med.id);
                        showNotice(`Removed ${med.medicineName || 'reminder'}.`);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl">
                  💊
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {language === 'hi' ? 'नया दवा अनुस्मारक जोड़ें' : 'Set Medication Reminder'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Will trigger alerts with 'Taken' and 'Snooze' for Sharma Ji
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Quick Select Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_MEDICATIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-colors"
                  >
                    + {preset.name} ({preset.dosage})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Donepezil, Telmisartan, Ashwagandha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 5mg, 1 tablet"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 8:30 PM, 8:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Timing / Meal Relation
                  </label>
                  <select
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Morning with breakfast">Morning with breakfast</option>
                    <option value="After Lunch">After Lunch</option>
                    <option value="Evening Snack">Evening Snack</option>
                    <option value="After Dinner">After Dinner</option>
                    <option value="Before Bedtime">Before Bedtime</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Critical Level
                  </label>
                  <select
                    value={importance}
                    onChange={(e) => setImportance(e.target.value as 'critical' | 'routine')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="critical">Essential / Prescribed</option>
                    <option value="routine">Routine Supplement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Instructions for Patient (English)
                </label>
                <input
                  type="text"
                  value={instructionsEn}
                  onChange={(e) => setInstructionsEn(e.target.value)}
                  placeholder="e.g. Take with half a glass of warm water"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Instructions for Patient (Hindi)
                </label>
                <input
                  type="text"
                  value={instructionsHi}
                  onChange={(e) => setInstructionsHi(e.target.value)}
                  placeholder="e.g. गुनगुने पानी के साथ भोजन के बाद लें"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Set Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
