import React from 'react';
import { Sparkles, X, Play, Brain, Heart, TrendingUp, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SIHDemoTourModal: React.FC = () => {
  const {
    showDemoTourModal,
    setShowDemoTourModal,
    loadDemoData,
    resetAllData,
    setRole,
    startActivity,
    setActiveScreen,
    setLanguage,
  } = useApp();

  if (!showDemoTourModal) return null;

  const demoSteps = [
    {
      num: 1,
      title: 'Problem & Senior Accessibility',
      desc: 'Elderly mode designed for cognitive decline: large touch targets, high contrast, Hindi/English, and Web Speech read-aloud.',
      actionLabel: 'Open Elderly Dashboard',
      onRun: () => {
        setRole('elderly');
        setActiveScreen('home');
        setShowDemoTourModal(false);
      },
    },
    {
      num: 2,
      title: 'Cognitive Mini-Games (5+ Playable)',
      desc: 'Play Memory Match or Music Memory. Real-time feedback, celebratory confetti, gentle non-punitive retry audio.',
      actionLabel: 'Launch Memory Match',
      onRun: () => {
        setRole('elderly');
        startActivity('memory-match');
        setShowDemoTourModal(false);
      },
    },
    {
      num: 3,
      title: 'Mood & Emotional Observation',
      desc: 'Captures daily emotional states (Happy, Okay, Neutral, Sad, Worried) to adapt stimulation and notify caregivers.',
      actionLabel: 'Open Mood Check-in',
      onRun: () => {
        setRole('elderly');
        setActiveScreen('mood');
        setShowDemoTourModal(false);
      },
    },
    {
      num: 4,
      title: 'Caregiver Dashboard & Activity Trends',
      desc: 'Weekly engagement trends, domain breakdown (Memory, Attention, Pattern, Recall), reminders, and medical disclaimer.',
      actionLabel: 'View Caregiver Dashboard',
      onRun: () => {
        setRole('caregiver');
        setActiveScreen('home');
        setShowDemoTourModal(false);
      },
    },
    {
      num: 5,
      title: 'AI Activity Recommendation Engine',
      desc: 'Rule-based heuristic advisor analyzes accuracy and mood to dynamically adapt difficulty and suggest gentle activities.',
      actionLabel: 'Inspect AI Recommendation',
      onRun: () => {
        setRole('caregiver');
        setActiveScreen('home');
        setShowDemoTourModal(false);
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border-2 border-amber-300 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                SIH Hackathon Presentation Journey
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                2–3 Minute Evaluation Flow for Judges
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDemoTourModal(false)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIH Storyline Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Problem → Solution Architecture:</span>
          </div>
          <p className="text-slate-700">
            India is home to over 8.8 million older adults facing dementia & cognitive decline. Manas Saathi connects senior cognitive stimulation with actionable caregiver peace of mind through inclusive design and activity trend tracking.
          </p>
        </div>

        {/* Demo Steps Grid */}
        <div className="space-y-3">
          {demoSteps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all bg-white hover:bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.num}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  {step.desc}
                </p>
              </div>

              <button
                onClick={step.onRun}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
              >
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Quick controls row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadDemoData();
                setShowDemoTourModal(false);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Load Full SIH Demo Data</span>
            </button>

            <button
              onClick={() => {
                resetAllData();
                setShowDemoTourModal(false);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>

          <button
            onClick={() => setShowDemoTourModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold"
          >
            Close Tour
          </button>
        </div>
      </div>
    </div>
  );
};
