import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Send,
  Play,
  RotateCcw,
  Heart,
  Wind,
  PhoneCall,
  CheckCircle2,
  Globe,
  Building2,
  Radio,
  Zap,
  Sliders,
  Check,
  Pill,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import {
  askVoiceCompanion,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  playCompanionVoice,
  SpeechRecognitionInstance,
  stopAnyVoicePlayback,
  unlockAudioContext,
} from '../../utils/voiceCompanion';
import { playClickSound, playSuccessChime } from '../../utils/sound';
import { VoiceMessage, VoiceSuggestedAction, Language } from '../../types';

export const AIVoiceCompanionModal: React.FC = () => {
  const {
    showVoiceModal,
    setShowVoiceModal,
    language,
    setLanguage,
    currentMood,
    voiceMessages,
    setVoiceMessages,
    addVoiceLog,
    autoSpeakCompanion,
    setAutoSpeakCompanion,
    isCompanionSpeaking,
    setIsCompanionSpeaking,
    triggerSuggestedAction,
    soundEnabled,
  } = useApp();

  const t = getTranslation(language);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [supportSpeech, setSupportSpeech] = useState(true);
  const [currentlyPlayingMsgId, setCurrentlyPlayingMsgId] = useState<string | null>(null);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  // Conversational Voice-to-Voice mode & Voice tuning
  const [voiceToVoiceMode, setVoiceToVoiceMode] = useState<boolean>(true);
  const [voicePersona, setVoicePersona] = useState<'Kore' | 'Puck'>('Kore');
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.85);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [autoActionNotice, setAutoActionNotice] = useState<{
    label: string;
    action: VoiceSuggestedAction;
  } | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<string>('');
  const hasDispatchedRef = useRef<boolean>(false);
  const voiceToVoiceModeRef = useRef<boolean>(true);
  const autoActionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref with state
  useEffect(() => {
    voiceToVoiceModeRef.current = voiceToVoiceMode;
  }, [voiceToVoiceMode]);

  useEffect(() => {
    setSupportSpeech(isSpeechRecognitionSupported());
  }, []);

  // Pre-unlock audio when modal opens
  useEffect(() => {
    if (showVoiceModal) {
      unlockAudioContext();
    }
  }, [showVoiceModal]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (showVoiceModal) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [voiceMessages, showVoiceModal, isLoading, isListening]);

  // Breathing exercise timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive) {
      const cycle = () => {
        setBreathPhase('in');
        timer = setTimeout(() => {
          setBreathPhase('hold');
          timer = setTimeout(() => {
            setBreathPhase('out');
            timer = setTimeout(() => {
              if (breathingActive) cycle();
            }, 4000);
          }, 3000);
        }, 4000);
      };
      cycle();
    }
    return () => clearTimeout(timer);
  }, [breathingActive]);

  // Clean up audio & recognition when modal closes
  useEffect(() => {
    if (!showVoiceModal) {
      stopAnyVoicePlayback();
      setIsCompanionSpeaking(false);
      setCurrentlyPlayingMsgId(null);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        setIsListening(false);
      }
      setBreathingActive(false);
      setAutoActionNotice(null);
      if (autoActionTimerRef.current) {
        clearTimeout(autoActionTimerRef.current);
      }
    }
  }, [showVoiceModal, setIsCompanionSpeaking]);

  // Forward declarations for speech recognition control
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const commitAndSend = useCallback(() => {
    const textToSend = transcriptRef.current.trim();
    if (textToSend && !hasDispatchedRef.current) {
      hasDispatchedRef.current = true;
      transcriptRef.current = '';
      setTranscript('');
      handleSendMessage(textToSend);
    }
  }, []);

  const startListening = useCallback(() => {
    stopAnyVoicePlayback();
    unlockAudioContext();
    setIsCompanionSpeaking(false);
    setCurrentlyPlayingMsgId(null);
    setMicNotice(null);

    if (!supportSpeech) {
      setMicNotice(
        language === 'hi'
          ? 'इस डिवाइस में आवाज़ पहचान सीधे समर्थित नहीं है। आप नीचे दिए गए सुझाव बटन दबा सकते हैं या टाइप कर सकते हैं।'
          : 'Microphone voice recognition is not supported in this browser. You can tap suggestion prompts or type your message.'
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    transcriptRef.current = '';
    hasDispatchedRef.current = false;
    setTranscript('');

    const recognizer = createSpeechRecognizer(
      language,
      (text, isFinal) => {
        transcriptRef.current = text;
        setTranscript(text);
        if (isFinal) {
          setIsListening(false);
          commitAndSend();
        }
      },
      () => {
        setIsListening(true);
        setMicNotice(null);
      },
      () => {
        setIsListening(false);
        commitAndSend();
      },
      (error) => {
        setIsListening(false);
        if (error === 'not-allowed') {
          setVoiceToVoiceMode(false);
          voiceToVoiceModeRef.current = false;
          setMicNotice(
            language === 'hi'
              ? 'माइक की अनुमति बंद है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें या नीचे सुझाव बटन दबाएं।'
              : 'Microphone permission was blocked. Please allow microphone access or use suggestion buttons.'
          );
        } else if (error === 'no-speech') {
          // In voice-to-voice mode, don't show alarming error; just remain ready
        }
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
      } catch (err) {
        console.error('Failed to start recognizer:', err);
        setIsListening(false);
      }
    }
  }, [language, supportSpeech, commitAndSend]);

  // Handle user speech or text submission
  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    playClickSound(soundEnabled);
    stopAnyVoicePlayback();
    setIsCompanionSpeaking(false);
    stopListening();
    setAutoActionNotice(null);

    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setVoiceMessages((prev) => [...prev, userMsg]);
    setTranscript('');
    setTypedInput('');
    setIsLoading(true);

    try {
      const response = await askVoiceCompanion(text, language, [...voiceMessages, userMsg], currentMood || undefined);

      const saathiMsg: VoiceMessage = {
        id: `saathi-${Date.now()}`,
        role: 'saathi',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: response.sentiment,
        suggestedAction: response.suggestedAction,
        quickFollowUps: response.quickFollowUps,
      };

      setVoiceMessages((prev) => [...prev, saathiMsg]);

      // Record to caregiver wellbeing log
      addVoiceLog({
        id: `vlog-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        userQuery: text,
        saathiResponse: response.reply,
        detectedMood: response.sentiment ? response.sentiment.toUpperCase() : 'CALM',
        topic: response.topic || 'General Wellbeing',
      });

      // Handle in-modal immediate actions
      if (response.suggestedAction?.type === 'deep_breath') {
        setBreathingActive(true);
      }

      // Handle immediate non-navigational actions
      if (response.suggestedAction) {
        if (
          response.suggestedAction.type === 'mark_medicine' ||
          response.suggestedAction.type === 'switch_language' ||
          response.suggestedAction.type === 'log_mood'
        ) {
          triggerSuggestedAction(response.suggestedAction);
          playSuccessChime(soundEnabled);
        }
      }

      // Auto-Execute Action Handler for navigation actions
      if (
        response.suggestedAction?.autoExecute &&
        (response.suggestedAction.type === 'start_game' ||
          response.suggestedAction.type === 'call_caregiver' ||
          response.suggestedAction.type === 'show_medical' ||
          response.suggestedAction.type === 'open_pharmacy' ||
          response.suggestedAction.type === 'play_music' ||
          response.suggestedAction.type === 'show_caregiver')
      ) {
        const actionLabel =
          language === 'hi' ? response.suggestedAction.labelHi : response.suggestedAction.labelEn;
        setAutoActionNotice({
          label: actionLabel,
          action: response.suggestedAction,
        });

        // Set delayed auto-execution so Sharma Ji hears the voice response first
        autoActionTimerRef.current = setTimeout(() => {
          if (response.suggestedAction) {
            triggerSuggestedAction(response.suggestedAction);
          }
        }, 4000);
      }

      // Auto-speak response if enabled
      if (autoSpeakCompanion) {
        setCurrentlyPlayingMsgId(saathiMsg.id);
        setIsCompanionSpeaking(true);
        playCompanionVoice(
          response.reply,
          language,
          () => setIsCompanionSpeaking(true),
          () => {
            setIsCompanionSpeaking(false);
            setCurrentlyPlayingMsgId(null);

            // In continuous Voice-to-Voice mode, start listening again automatically!
            if (voiceToVoiceModeRef.current) {
              setTimeout(() => {
                startListening();
              }, 450);
            }
          },
          voicePersona,
          speechSpeed
        );
      } else if (voiceToVoiceModeRef.current) {
        // If voice output is muted, still listen back in voice-to-voice mode
        setTimeout(() => {
          startListening();
        }, 450);
      }
    } catch (err) {
      console.error('Failed to get companion response:', err);
      const fallbackText =
        language === 'hi'
          ? 'शर्मा जी, मैं हमेशा आपके साथ हूँ। आइए एक गहरी सांस लेते हैं और आराम से विचार करते हैं।'
          : 'Sharma Ji, I am right here by your side. Let us take a slow deep breath together and stay relaxed.';

      const fallbackMsg: VoiceMessage = {
        id: `saathi-${Date.now()}`,
        role: 'saathi',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: 'calm',
        quickFollowUps: ['What activity should I do?', 'Play some music', 'Call Anita'],
      };
      setVoiceMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Speech Recognition via Mic button
  const toggleSpeechRecognition = () => {
    playClickSound(soundEnabled);
    if (isListening) {
      stopListening();
      commitAndSend();
    } else {
      startListening();
    }
  };

  // Replay a specific message's voice
  const handlePlayVoice = (msg: VoiceMessage) => {
    playClickSound(soundEnabled);
    if (currentlyPlayingMsgId === msg.id && isCompanionSpeaking) {
      stopAnyVoicePlayback();
      setIsCompanionSpeaking(false);
      setCurrentlyPlayingMsgId(null);
      return;
    }

    stopAnyVoicePlayback();
    unlockAudioContext();
    setCurrentlyPlayingMsgId(msg.id);
    setIsCompanionSpeaking(true);

    playCompanionVoice(
      msg.text,
      language,
      () => setIsCompanionSpeaking(true),
      () => {
        setIsCompanionSpeaking(false);
        setCurrentlyPlayingMsgId(null);
      },
      voicePersona,
      speechSpeed
    );
  };

  // Quick sound & voice output test for user reassurance
  const handleTestVoice = () => {
    playClickSound(soundEnabled);
    stopAnyVoicePlayback();
    unlockAudioContext();
    setIsCompanionSpeaking(true);
    const testText =
      language === 'hi'
        ? 'नमस्ते शर्मा जी! मैं आपका साथी हूँ। मेरी आवाज़ बिल्कुल साफ़ और स्पष्ट आ रही है। आप मुझसे कोई भी खेल खेलने, दवा जांचने या बात करने के लिए कह सकते हैं।'
        : 'Namaste Sharma Ji! I am Saathi. My voice is clean, clear, and ready. You can ask me to play games, check medicines, or simply talk.';
    playCompanionVoice(
      testText,
      language,
      () => setIsCompanionSpeaking(true),
      () => setIsCompanionSpeaking(false),
      voicePersona,
      speechSpeed
    );
  };

  const samplePrompts =
    language === 'hi'
      ? [
          'नमस्ते! आज क्या नया है?',
          'मेरी दवाओं का समय बताओ',
          'मुझे स्मृति खेल खेलना है',
          'अनीता को कॉल लगाओ',
          'पुराने मधुर गीत सुनाओ',
          'चलो गहरी सांस लेते हैं',
          'नजदीकी अस्पताल व डॉक्टर',
        ]
      : [
          'Namaste! What should I do today?',
          'Check my medication schedule',
          'Play Memory Match activity',
          'Call Anita Sharma',
          'Play nostalgic classic melodies',
          'Let us do a slow breathing exercise',
          'Nearest hospitals & emergency care',
        ];

  const featureShortcuts = [
    {
      icon: '🧩',
      title: language === 'hi' ? 'स्मृति खेल' : 'Memory Match',
      command: language === 'hi' ? 'मुझे स्मृति खेल खेलना है' : 'Play Memory Match game',
    },
    {
      icon: '💊',
      title: language === 'hi' ? 'दवा जांचें' : 'Check Medicine',
      command: language === 'hi' ? 'मेरी दवा की स्थिति बताओ' : 'Check my medication schedule',
    },
    {
      icon: '📞',
      title: language === 'hi' ? 'अनीता को कॉल' : 'Call Anita',
      command: language === 'hi' ? 'अनीता को कॉल लगाओ' : 'Call Anita Sharma',
    },
    {
      icon: '🏥',
      title: language === 'hi' ? 'अस्पताल व डॉक्टर' : 'Hospitals',
      command: language === 'hi' ? 'नजदीकी अस्पताल और डॉक्टर दिखाओ' : 'Show nearby hospitals and doctors',
    },
    {
      icon: '🎵',
      title: language === 'hi' ? 'पुराने गीत' : 'Melodies',
      command: language === 'hi' ? 'मुझे पुराने गीत सुनाओ' : 'Play classic music memory',
    },
    {
      icon: '🌬️',
      title: language === 'hi' ? 'गहरी सांस' : 'Deep Breath',
      command: language === 'hi' ? 'चलो गहरी सांस लेते हैं' : 'Let us take a slow deep breath',
    },
  ];

  if (!showVoiceModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-3 border-amber-300 shadow-2xl max-w-2xl w-full flex flex-col h-[92vh] max-h-[820px] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-4 sm:px-5 py-3.5 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl sm:text-2xl border border-white/30 shadow-inner">
              🌸
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                  {t.voiceCompanion}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 tracking-wider">
                  AI Voice
                </span>
              </div>
              <p className="text-amber-100 text-xs sm:text-sm font-medium">
                {language === 'hi' ? 'शर्मा जी का अपना आवाज़ साथी' : "Sharma Ji's Loving Voice Companion"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Two-Way Voice-to-Voice Toggle */}
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                const nextVal = !voiceToVoiceMode;
                setVoiceToVoiceMode(nextVal);
                voiceToVoiceModeRef.current = nextVal;
                if (nextVal && !isListening && !isCompanionSpeaking) {
                  startListening();
                } else if (!nextVal && isListening) {
                  stopListening();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                voiceToVoiceMode
                  ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={
                language === 'hi'
                  ? 'बातचीत मोड: साथी के बोलने के बाद अपने आप सुनेगा'
                  : 'Voice-to-Voice: Automatically listens after speaking'
              }
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {voiceToVoiceMode
                  ? language === 'hi' ? 'बातचीत मोड चालू' : 'Voice-to-Voice ON'
                  : language === 'hi' ? 'बातचीत मोड' : 'Voice-to-Voice'}
              </span>
            </button>

            {/* Voice Settings Popover Trigger */}
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setShowVoiceSettings(!showVoiceSettings);
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                showVoiceSettings ? 'bg-white text-amber-900 shadow-xs' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={language === 'hi' ? 'आवाज़ सेटिंग्स' : 'Voice Settings'}
              aria-label="Voice settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Test Voice Audio Output */}
            <button
              onClick={handleTestVoice}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
              title={language === 'hi' ? 'आवाज़ की जांच करें' : 'Test voice audio output'}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'hi' ? 'जांचें' : 'Test'}
              </span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setLanguage(language === 'en' ? 'hi' : 'en');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिंदी' : 'Eng'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setShowVoiceModal(false);
              }}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors ml-0.5"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Persona & Tuning Panel (when toggled) */}
        {showVoiceSettings && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-950">
                {language === 'hi' ? 'आवाज़ स्वरूप:' : 'Voice Tone:'}
              </span>
              <button
                onClick={() => setVoicePersona('Kore')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  voicePersona === 'Kore'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-950 border border-amber-300'
                }`}
              >
                {language === 'hi' ? '🌸 सौम्य व मधुर (Kore)' : '🌸 Warm & Gentle (Kore)'}
              </button>
              <button
                onClick={() => setVoicePersona('Puck')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  voicePersona === 'Puck'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-950 border border-amber-300'
                }`}
              >
                {language === 'hi' ? '⚡ स्पष्ट व ऊर्जावान (Puck)' : '⚡ Crisp & Clear (Puck)'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-950">
                {language === 'hi' ? 'गति:' : 'Speed:'}
              </span>
              <button
                onClick={() => setSpeechSpeed(0.85)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  speechSpeed === 0.85
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-950 border border-amber-300'
                }`}
              >
                {language === 'hi' ? 'आराम से (0.85x)' : 'Gentle (0.85x)'}
              </button>
              <button
                onClick={() => setSpeechSpeed(1.0)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  speechSpeed === 1.0
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-950 border border-amber-300'
                }`}
              >
                {language === 'hi' ? 'सामान्य (1.0x)' : 'Normal (1.0x)'}
              </button>
            </div>
          </div>
        )}

        {/* Guided Breathing Overlay (when active) */}
        {breathingActive && (
          <div className="bg-gradient-to-b from-teal-50 to-emerald-50 p-4 border-b border-teal-200 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full border-4 border-teal-500 flex items-center justify-center text-teal-800 transition-transform duration-1000 ${
                  breathPhase === 'in'
                    ? 'scale-125 bg-teal-200'
                    : breathPhase === 'hold'
                    ? 'scale-110 bg-teal-100'
                    : 'scale-90 bg-teal-50'
                }`}
              >
                <Wind className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-base font-extrabold text-teal-950">
                  {breathPhase === 'in'
                    ? language === 'hi' ? 'धीरे से सांस अंदर लें... (4s)' : 'Breathe In Slowly... (4s)'
                    : breathPhase === 'hold'
                    ? language === 'hi' ? 'आराम से रोकें... (3s)' : 'Hold Gently... (3s)'
                    : language === 'hi' ? 'धीरे से सांस बाहर छोड़ें... (4s)' : 'Exhale Slowly... (4s)'}
                </div>
                <div className="text-xs text-teal-700 font-medium">
                  {language === 'hi'
                    ? 'मन को शांत और तरोताजा महसूस कराएं'
                    : 'Calming the body and gently focusing the mind'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setBreathingActive(false)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-900 font-bold hover:bg-teal-100"
            >
              {language === 'hi' ? 'समाप्त करें' : 'Done'}
            </button>
          </div>
        )}

        {/* Auto Action Pending Notification Banner */}
        {autoActionNotice && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between animate-in slide-in-from-top duration-200 border-b border-emerald-400/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
              <span className="font-black text-sm">
                ⚡ {language === 'hi' ? 'ऐप सुविधा खुल रही है:' : 'Opening App Feature:'}{' '}
                <span className="underline underline-offset-2">{autoActionNotice.label}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (autoActionTimerRef.current) clearTimeout(autoActionTimerRef.current);
                  triggerSuggestedAction(autoActionNotice.action);
                  setAutoActionNotice(null);
                }}
                className="bg-white text-emerald-950 font-black text-xs px-3 py-1 rounded-xl shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
              >
                {language === 'hi' ? 'तुरंत खोलें' : 'Open Now'}
              </button>
              <button
                onClick={() => {
                  if (autoActionTimerRef.current) clearTimeout(autoActionTimerRef.current);
                  setAutoActionNotice(null);
                }}
                className="text-xs text-white/80 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-amber-50/30">
          {voiceMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`rounded-3xl p-4 sm:p-5 max-w-[88%] shadow-xs transition-all ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-xs'
                    : 'bg-white border-2 border-amber-200/90 text-slate-900 rounded-bl-xs'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-800">
                    {msg.role === 'user' ? (
                      <span className="text-slate-300">👴 Sharma Ji</span>
                    ) : (
                      <>
                        <span>🌸 Saathi</span>
                        {msg.sentiment && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                            {msg.sentiment}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                  <span className={`text-[10px] ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-base sm:text-lg font-medium leading-relaxed">
                  {msg.text}
                </p>

                {/* Action Button if Saathi suggested or executed one */}
                {msg.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-amber-100">
                    <button
                      onClick={() => triggerSuggestedAction(msg.suggestedAction!)}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
                    >
                      {msg.suggestedAction.type === 'start_game' && <Play className="w-4 h-4 fill-current" />}
                      {msg.suggestedAction.type === 'call_caregiver' && <PhoneCall className="w-4 h-4" />}
                      {msg.suggestedAction.type === 'deep_breath' && <Wind className="w-4 h-4" />}
                      {msg.suggestedAction.type === 'show_medical' && <Building2 className="w-4 h-4" />}
                      {msg.suggestedAction.type === 'mark_medicine' && <CheckCircle2 className="w-4 h-4" />}
                      {msg.suggestedAction.type === 'play_music' && <Play className="w-4 h-4 fill-current" />}
                      {msg.suggestedAction.type === 'show_caregiver' && <Heart className="w-4 h-4" />}
                      {msg.suggestedAction.type === 'open_pharmacy' && <Pill className="w-4 h-4" />}
                      {msg.suggestedAction.type === 'switch_language' && <Globe className="w-4 h-4" />}
                      <span>
                        {language === 'hi' ? msg.suggestedAction.labelHi : msg.suggestedAction.labelEn}
                      </span>
                    </button>
                  </div>
                )}

                {/* Audio Replay for Saathi */}
                {msg.role === 'saathi' && (
                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => handlePlayVoice(msg)}
                      className="flex items-center gap-1 text-amber-900 hover:text-amber-700 font-bold py-1 px-2 rounded-lg hover:bg-amber-100/60 transition-colors"
                      title={currentlyPlayingMsgId === msg.id && isCompanionSpeaking ? t.stopVoice : t.replayAudio}
                    >
                      {currentlyPlayingMsgId === msg.id && isCompanionSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-amber-600" />
                          <span>{t.stopVoice}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-amber-600" />
                          <span>{t.replayAudio}</span>
                        </>
                      )}
                    </button>

                    {currentlyPlayingMsgId === msg.id && isCompanionSpeaking && (
                      <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="w-1.5 h-4 bg-emerald-600 rounded-full animate-pulse delay-75" />
                        <span className="w-1.5 h-2 bg-emerald-500 rounded-full animate-pulse delay-150" />
                        <span className="text-[11px] ml-1">{t.speaking}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick follow-ups */}
              {msg.role === 'saathi' && msg.quickFollowUps && msg.quickFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                  {msg.quickFollowUps.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs bg-white hover:bg-amber-100 text-amber-950 font-bold py-1.5 px-3 rounded-full border border-amber-300 shadow-2xs transition-colors text-left"
                    >
                      💬 {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-4 rounded-3xl bg-white border border-amber-200 max-w-[70%] text-slate-700 animate-pulse">
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
              <span className="text-sm font-bold text-amber-950">
                {t.thinking}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Real-Time Speech Feedback Banner (when active) */}
        {isListening && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3.5 sm:p-4 rounded-2xl mx-4 mb-2 shadow-lg border border-emerald-400/40 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-black text-sm tracking-wide">
                  {language === 'hi' ? 'आप बोलिए, मैं सुन रहा हूँ...' : 'Listening to you... speak freely'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Real-time sound wave bars */}
                <div className="flex items-end gap-1 h-5 px-2 bg-emerald-800/40 rounded-lg">
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-3" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-5" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-4" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:75ms] h-2" />
                </div>

                <button
                  onClick={stopListening}
                  className="text-xs font-black bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors"
                >
                  {language === 'hi' ? 'रोकें' : 'Stop'}
                </button>
              </div>
            </div>

            {/* Real-time transcript text streaming live */}
            <div className="bg-black/20 rounded-xl p-2.5 text-base sm:text-lg font-semibold tracking-wide text-white min-h-[46px] flex items-center">
              {transcript ? (
                <span className="flex items-center gap-1 flex-wrap">
                  <span className="text-emerald-100 font-bold">"{transcript}"</span>
                  <span className="w-1.5 h-4 bg-white inline-block animate-pulse ml-0.5" />
                </span>
              ) : (
                <span className="text-emerald-200 text-sm italic">
                  {language === 'hi'
                    ? 'बोलना शुरू करें (जैसे: "मुझे खेल खेलना है", "दवा खा ली", "अनीता को कॉल लगाओ")'
                    : 'Start speaking (e.g. "Play Memory Match", "I took my medicine", "Call Anita")'}
                </span>
              )}
            </div>

            {transcript.trim() && (
              <div className="flex justify-end gap-2 pt-0.5">
                <button
                  onClick={() => {
                    stopListening();
                    commitAndSend();
                  }}
                  className="text-xs font-extrabold bg-white text-emerald-950 px-3.5 py-1.5 rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'तुरंत भेजें' : 'Send Now'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Saathi Speaking Banner */}
        {isCompanionSpeaking && !isListening && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 mx-4 mb-2 rounded-2xl shadow-md flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="flex items-end gap-1 h-4">
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-2.5" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:120ms] h-4" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:240ms] h-3" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:360ms] h-4.5" />
              </div>
              <span className="text-sm font-extrabold">
                {language === 'hi' ? 'साथी बोल रहा है...' : 'Saathi is speaking...'}
              </span>
            </div>
            <button
              onClick={() => {
                stopAnyVoicePlayback();
                setIsCompanionSpeaking(false);
                setCurrentlyPlayingMsgId(null);
                if (voiceToVoiceModeRef.current) {
                  setTimeout(startListening, 300);
                }
              }}
              className="text-xs font-black bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'रोकें व बोलें' : 'Interrupt & Speak'}</span>
            </button>
          </div>
        )}

        {/* Notice if mic is blocked or unsupported */}
        {micNotice && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 flex items-center justify-between text-amber-900 text-xs sm:text-sm animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <span>💡</span>
              <span>{micNotice}</span>
            </div>
            <button
              onClick={() => setMicNotice(null)}
              className="font-bold text-amber-800 hover:text-amber-950 ml-2 px-2 py-0.5 rounded-md hover:bg-amber-100 shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* App Feature Access Quick Voice Chips */}
        <div className="px-4 pb-2 pt-1 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-amber-100 bg-amber-50/50 shrink-0">
          <span className="text-[11px] font-black uppercase text-amber-900 shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'hi' ? 'सुविधाएं:' : 'Actions:'}</span>
          </span>
          {featureShortcuts.map((feat, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(feat.command)}
              className="shrink-0 text-xs font-bold py-1 px-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{feat.icon}</span>
              <span>{feat.title}</span>
            </button>
          ))}
        </div>

        {/* Bottom Interactive Voice Controls Area */}
        <div className="bg-white border-t-2 border-amber-200 p-3 sm:p-4 flex flex-col gap-2.5 shrink-0">
          {/* Voice Mic Hero Button & Text Input Row */}
          <div className="flex items-center gap-3">
            {/* Big Accessible Mic Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all active:scale-95 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
              }`}
              aria-label={isListening ? t.tapToStopListening : t.tapToSpeak}
              title={isListening ? t.tapToStopListening : t.tapToSpeak}
            >
              {isListening ? (
                <MicOff className="w-7 h-7 sm:w-8 sm:h-8" />
              ) : (
                <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
              )}
            </button>

            {/* Input field for typing or review */}
            <div className="flex-1 flex items-center gap-2 border-2 border-slate-200 focus-within:border-amber-500 rounded-2xl px-4 py-2.5 bg-slate-50">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(typedInput);
                  }
                }}
                placeholder={
                  isListening
                    ? language === 'hi' ? 'बोलिए, सुन रहे हैं...' : 'Speaking now...'
                    : language === 'hi' ? 'माइक दबाएं या यहाँ लिखें...' : 'Tap mic to speak or type here...'
                }
                className="w-full bg-transparent text-base text-slate-800 placeholder-slate-400 focus:outline-none"
              />

              <button
                onClick={() => handleSendMessage(typedInput)}
                disabled={!typedInput.trim() || isLoading}
                className={`p-2 rounded-xl transition-all ${
                  typedInput.trim() && !isLoading
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                aria-label="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span>
              {voiceToVoiceMode
                ? language === 'hi'
                  ? '🎙️ दोतरफा बातचीत मोड सक्रिय है · खुलकर बात करें'
                  : '🎙️ Two-way voice-to-voice conversation active'
                : language === 'hi'
                ? 'माइक दबाकर बोलें या नीचे दिए गए सुझाव चुनें'
                : 'Tap the mic to talk or choose any prompt below'}
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सुरक्षित व सम्मानजनक संवाद' : 'Private & Gentle Care'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
