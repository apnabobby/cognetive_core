import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Navigation,
  Clock,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  UserCheck,
  Star,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Stethoscope,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { HOSPITALS_DATA, NEURO_SURGEONS_DATA, PATIENT_EMERGENCY_PROFILE } from '../../utils/medicalData';
import { HospitalInfo, NeuroSurgeon } from '../../types/medical';
import { playClickSound } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'hospitals' | 'surgeons' | 'sos';
}

export const NearestHospitalsModal: React.FC<Props> = ({ isOpen, onClose, defaultTab = 'hospitals' }) => {
  const { language, soundEnabled } = useApp();
  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<'hospitals' | 'surgeons' | 'sos'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailableNowOnly, setFilterAvailableNowOnly] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalInfo | null>(null);

  if (!isOpen) return null;

  // Filter hospitals
  const filteredHospitals = HOSPITALS_DATA.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.neuroDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailable = !filterAvailableNowOnly || h.availableNeuroSurgeonNow;
    return matchesSearch && matchesAvailable;
  });

  // Filter neurosurgeons
  const filteredSurgeons = NEURO_SURGEONS_DATA.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.specialties.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAvailable =
      !filterAvailableNowOnly ||
      s.availabilityStatus === 'available_now' ||
      s.availabilityStatus === 'on_call_emergency';
    return matchesSearch && matchesAvailable;
  });

  const handleCopyEmergencyCard = () => {
    playClickSound(soundEnabled);
    const cardText = `🚨 EMERGENCY MEDICAL CARD - MANAS SAATHI
Patient: ${PATIENT_EMERGENCY_PROFILE.patientName} (${PATIENT_EMERGENCY_PROFILE.age} yrs)
Blood Group: ${PATIENT_EMERGENCY_PROFILE.bloodGroup}
Primary Condition: ${PATIENT_EMERGENCY_PROFILE.condition}
Allergies: ${PATIENT_EMERGENCY_PROFILE.allergies}
Current Medications:
${PATIENT_EMERGENCY_PROFILE.currentMedications.map((m) => `• ${m}`).join('\n')}
Primary Caregiver: ${PATIENT_EMERGENCY_PROFILE.primaryCaregiver} (${PATIENT_EMERGENCY_PROFILE.primaryCaregiverPhone})
Treating Neurologist: ${PATIENT_EMERGENCY_PROFILE.treatingNeurologist}`;

    navigator.clipboard?.writeText(cardText);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-3 border-rose-300 shadow-2xl max-w-4xl w-full flex flex-col h-[92vh] max-h-[820px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-5 sm:px-6 py-4 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  {language === 'hi'
                    ? 'नजदीकी अस्पताल व सर्वश्रेष्ठ न्यूरोसर्जन'
                    : 'Nearest Hospitals & Available Neurosurgeons'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 tracking-wider">
                  Live Status
                </span>
              </div>
              <p className="text-rose-100 text-xs sm:text-sm font-medium">
                {language === 'hi'
                  ? 'शर्मा जी के लिए 24x7 इमरजेंसी न्यूरोलॉजी और ऑन-कॉल विशेषज्ञ'
                  : 'Emergency 24x7 Neuro Care, Real-Time Specialist Availability & Directions'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound(soundEnabled);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar & Quick Emergency SOS Hotline */}
        <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setActiveTab('hospitals');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'नजदीकी अस्पताल (5)' : 'Nearest Hospitals (5)'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setActiveTab('surgeons');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'surgeons'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{language === 'hi' ? 'न्यूरोसर्जन ऑन-कॉल (5)' : 'Neurosurgeons On-Call (5)'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setActiveTab('sos');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'sos'
                  ? 'bg-red-700 text-white shadow-xs animate-pulse'
                  : 'bg-red-100 text-red-900 hover:bg-red-200 border border-red-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{language === 'hi' ? '🚨 आपातकालीन SOS' : '🚨 Emergency SOS'}</span>
            </button>
          </div>

          {/* Quick ambulance dial button */}
          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Ambulance 108</span>
            </a>
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Emergency 112</span>
            </a>
          </div>
        </div>

        {/* Search & Quick Filters (for Hospitals & Surgeons) */}
        {activeTab !== 'sos' && (
          <div className="px-5 sm:px-6 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'hospitals'
                    ? language === 'hi' ? 'अस्पताल खोजें...' : 'Search hospital or area...'
                    : language === 'hi' ? 'डॉक्टर या विशेषज्ञता खोजें...' : 'Search doctor or specialty...'
                }
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => {
                  playClickSound(soundEnabled);
                  setFilterAvailableNowOnly(!filterAvailableNowOnly);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  filterAvailableNowOnly
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{language === 'hi' ? 'केवल अभी उपलब्ध' : 'Available Right Now Only'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60">
          {/* TAB 1: NEAREST HOSPITALS */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>
                  Showing {filteredHospitals.length} hospitals nearest to current location (South/Central Delhi NCR)
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  All 5 equipped with 24x7 Neuro Trauma ICU
                </span>
              </div>

              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-rose-300 transition-all shadow-xs hover:shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                          {language === 'hi' ? hospital.nameHi : hospital.name}
                        </h3>
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                          {hospital.type}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{hospital.rating}</span>
                          <span className="text-slate-400">({hospital.reviewsCount})</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{hospital.address}</span>
                      </p>

                      <p className="text-xs font-semibold text-indigo-900 pt-0.5">
                        🧠 {hospital.neuroDepartment}
                      </p>
                    </div>

                    {/* Distance & Drive ETA Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                      <div className="flex items-center gap-1 text-sm font-extrabold text-rose-950">
                        <Navigation className="w-4 h-4 text-rose-600" />
                        <span>{hospital.distanceKm} km away</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>~{hospital.driveTimeMin} mins drive</span>
                      </div>
                    </div>
                  </div>

                  {/* Facilities and on-duty surgeon */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Available Neurosurgeon on Duty:</span>
                        <span className="text-emerald-950 font-black">{hospital.currentNeuroSurgeonOnDuty}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-slate-600">
                        <span className="font-semibold text-slate-700">ICU Beds: {hospital.neuroICUBeds} ·</span>
                        {hospital.facilities.slice(0, 3).map((f, i) => (
                          <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="text-emerald-800 font-extrabold bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0 self-start md:self-auto">
                      24/7 ER Active
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${hospital.emergencyPhone}`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
                      >
                        <Phone className="w-4 h-4 fill-current" />
                        <span>Call Emergency: {hospital.emergencyPhone}</span>
                      </a>

                      <a
                        href={`tel:${hospital.phone}`}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                      >
                        <span>Reception: {hospital.phone}</span>
                      </a>
                    </div>

                    <a
                      href={hospital.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{language === 'hi' ? 'गूगल मैप्स नेविगेशन' : 'Google Maps Directions'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: BEST NEUROSURGEONS & NEUROLOGISTS */}
          {activeTab === 'surgeons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>
                  Showing {filteredSurgeons.length} accredited neurosurgeons and geriatric cognitive specialists
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live duty and on-call availability verified
                </span>
              </div>

              {filteredSurgeons.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-amber-300 transition-all shadow-xs hover:shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                          {doc.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">({doc.degrees})</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{doc.rating}</span>
                          <span className="text-slate-400">({doc.reviewsCount} reviews)</span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-slate-700">
                        {doc.designation} · <span className="text-rose-900">{doc.hospital}</span>
                      </p>

                      <p className="text-xs text-slate-500">
                        Experience: <span className="font-bold text-slate-800">{doc.experienceYears}+ Years</span> ·
                        Languages: {doc.languages.join(', ')} · OPD Fee: {doc.consultationFee}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black tracking-wide ${
                          doc.availabilityStatus === 'available_now'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : doc.availabilityStatus === 'on_call_emergency'
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-sky-100 text-sky-950 border border-sky-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>{language === 'hi' ? doc.currentShiftHi : doc.currentShift}</span>
                      </span>
                    </div>
                  </div>

                  {/* Specialties Pills */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {language === 'hi' ? 'विशेषज्ञता:' : 'Key Specialties:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(language === 'hi' ? doc.specialtiesHi : doc.specialties).map((spec, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timing & Consultation Footer */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-600">
                      <span className="font-bold text-slate-800">Next Slot: </span>
                      <span>{doc.nextSlot}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${doc.phone}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold shadow-xs transition-transform active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                        <span>Call Doctor / OPD: {doc.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: EMERGENCY SOS PROTOCOL & PATIENT CARD */}
          {activeTab === 'sos' && (
            <div className="space-y-5">
              {/* High Urgency Alert Banner */}
              <div className="bg-red-500 text-white p-5 rounded-2xl shadow-md flex items-start gap-4">
                <ShieldAlert className="w-8 h-8 shrink-0 text-white animate-pulse mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight">
                    {language === 'hi' ? 'आपातकालीन न्यूरोलॉजी प्रोटोकॉल' : 'Emergency Neurology & Stroke SOS Protocol'}
                  </h3>
                  <p className="text-red-100 text-xs sm:text-sm font-medium leading-relaxed">
                    {language === 'hi'
                      ? 'यदि शर्मा जी को अचानक अत्यधिक भ्रम, बोलने में असमर्थता, चेहरे का झुकाव, या संतुलन खोने (स्ट्रोक / बी-फास्ट लक्षण) के संकेत दिखें, तो तुरंत 108 या एम्स इमरजेंसी को कॉल करें।'
                      : 'If Sharma Ji shows sudden severe confusion, facial asymmetry, arm weakness, speech difficulty, or balance loss (B.E.F.A.S.T. stroke signs), call 108 Ambulance or AIIMS ER immediately.'}
                  </p>
                </div>
              </div>

              {/* Instant Emergency Dial Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="tel:108"
                  className="p-4 rounded-2xl bg-white border-2 border-red-300 hover:border-red-500 shadow-xs flex items-center gap-3 transition-transform active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl shrink-0 font-black">
                    🚑
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 leading-tight">Ambulance 108</div>
                    <div className="text-xs text-red-600 font-bold">Free National Emergency</div>
                  </div>
                </a>

                <a
                  href="tel:112"
                  className="p-4 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-500 shadow-xs flex items-center gap-3 transition-transform active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shrink-0 font-black">
                    🚨
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 leading-tight">Emergency 112</div>
                    <div className="text-xs text-slate-600 font-bold">All-in-One Police / Medical</div>
                  </div>
                </a>

                <a
                  href="tel:14567"
                  className="p-4 rounded-2xl bg-white border-2 border-amber-300 hover:border-amber-500 shadow-xs flex items-center gap-3 transition-transform active:scale-98"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xl shrink-0 font-black">
                    👴
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 leading-tight">Elder Line 14567</div>
                    <div className="text-xs text-amber-700 font-bold">National Senior Helpline</div>
                  </div>
                </a>
              </div>

              {/* Patient Emergency Card for Paramedics & Doctors */}
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                      <HeartPulse className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {language === 'hi' ? 'रोगी इमरजेंसी कार्ड (शर्मा जी)' : "Sharma Ji's Emergency Medical Profile"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Present this instantly to attending ER doctors, paramedics, or neuro-specialists
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyEmergencyCard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors self-start sm:self-auto"
                  >
                    {copiedCard ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    <span>{copiedCard ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Patient Name & Age</span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {PATIENT_EMERGENCY_PROFILE.patientName} ({PATIENT_EMERGENCY_PROFILE.age} yrs)
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-rose-700 block font-semibold">Blood Group</span>
                    <span className="font-black text-sm text-rose-950">
                      {PATIENT_EMERGENCY_PROFILE.bloodGroup}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Primary Condition</span>
                    <span className="font-extrabold text-slate-900">
                      {PATIENT_EMERGENCY_PROFILE.condition}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 sm:col-span-2">
                    <span className="text-amber-800 block font-semibold">Current Medications</span>
                    <ul className="mt-1 space-y-0.5 font-medium text-slate-800">
                      {PATIENT_EMERGENCY_PROFILE.currentMedications.map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Allergies</span>
                    <span className="font-bold text-red-700">
                      {PATIENT_EMERGENCY_PROFILE.allergies}
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 sm:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-emerald-800 block font-semibold">Primary Caregiver Contact</span>
                      <span className="font-black text-sm text-emerald-950">
                        {PATIENT_EMERGENCY_PROFILE.primaryCaregiver} ({PATIENT_EMERGENCY_PROFILE.primaryCaregiverPhone})
                      </span>
                    </div>

                    <a
                      href={`tel:${PATIENT_EMERGENCY_PROFILE.emergencyContact}`}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>Call Anita Sharma</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>AI & Geo Grounded · Verified Emergency Helplines & Neuro Centers</span>
          <button
            onClick={() => {
              playClickSound(soundEnabled);
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
