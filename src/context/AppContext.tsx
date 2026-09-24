import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ActivityRecord,
  AIRecommendation,
  GameDifficulty,
  GameId,
  Language,
  MoodType,
  Reminder,
  TextSize,
  UserProfile,
  UserRole,
  VoiceInteractionLog,
  VoiceMessage,
  VoiceSuggestedAction,
  MedicineItem,
  CartItem,
  MedicineOrder,
  DeliveryAddress,
  DeliverySpeed,
  PaymentMethod,
} from '../types';
import { getAIActivityRecommendation } from '../utils/aiAdvisor';
import { DEMO_USER, INITIAL_REMINDERS, SAMPLE_ACTIVITY_HISTORY, SAMPLE_VOICE_LOGS } from '../utils/demoData';
import { INITIAL_ORDERS, MEDICINE_CATALOG } from '../utils/pharmacyData';
import { playClickSound, speakText, stopSpeaking } from '../utils/sound';

interface LastResult {
  gameId: GameId;
  score: number;
  maxScore: number;
  duration: number;
  difficulty: GameDifficulty;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  activeScreen: 'home' | 'game' | 'result' | 'mood';
  setActiveScreen: (screen: 'home' | 'game' | 'result' | 'mood') => void;
  activeGameId: GameId | null;
  lastResult: LastResult | null;
  activityHistory: ActivityRecord[];
  currentMood: MoodType | null;
  setCurrentMood: (mood: MoodType | null) => void;
  reminders: Reminder[];
  userProfile: UserProfile;
  recommendation: AIRecommendation;
  isSpeaking: boolean;
  showCallModal: boolean;
  setShowCallModal: (val: boolean) => void;
  showVoiceModal: boolean;
  setShowVoiceModal: (val: boolean) => void;
  showMedicalModal: boolean;
  setShowMedicalModal: (val: boolean) => void;
  medicalModalTab: 'hospitals' | 'surgeons' | 'sos';
  setMedicalModalTab: (tab: 'hospitals' | 'surgeons' | 'sos') => void;
  showPharmacyModal: boolean;
  setShowPharmacyModal: (val: boolean) => void;
  pharmacyTab: 'store' | 'cart' | 'orders' | 'refill';
  setPharmacyTab: (tab: 'store' | 'cart' | 'orders' | 'refill') => void;
  selectedMedicineForRefill: string | null;
  setSelectedMedicineForRefill: (name: string | null) => void;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (medicine: MedicineItem, quantity?: number) => void;
  removeFromCart: (medicineId: string) => void;
  updateCartQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  orders: MedicineOrder[];
  placeOrder: (orderData: {
    items: CartItem[];
    address: DeliveryAddress;
    speed: DeliverySpeed;
    paymentMethod: PaymentMethod;
    prescriptionUploaded: boolean;
    prescriptionFileName?: string;
  }) => MedicineOrder;
  openPharmacyWithMedicine: (nameOrId: string) => void;
  voiceMessages: VoiceMessage[];
  setVoiceMessages: React.Dispatch<React.SetStateAction<VoiceMessage[]>>;
  voiceLogs: VoiceInteractionLog[];
  addVoiceLog: (log: VoiceInteractionLog) => void;
  autoSpeakCompanion: boolean;
  setAutoSpeakCompanion: (val: boolean) => void;
  isCompanionSpeaking: boolean;
  setIsCompanionSpeaking: (val: boolean) => void;
  triggerSuggestedAction: (action: VoiceSuggestedAction) => void;
  showAccessibilityModal: boolean;
  setShowAccessibilityModal: (val: boolean) => void;
  showDemoTourModal: boolean;
  setShowDemoTourModal: (val: boolean) => void;
  hasSeenOnboarding: boolean;
  completeOnboarding: (selectedRole: UserRole, selectedLang: Language) => void;
  startActivity: (gameId: GameId) => void;
  finishActivity: (score: number, maxScore: number, durationSeconds: number, difficulty: GameDifficulty) => void;
  recordMoodAndProceed: (mood: MoodType) => void;
  returnHome: () => void;
  toggleReminder: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
  markReminderTaken: (id: string) => void;
  snoozeReminder: (id: string, minutes?: number) => void;
  speak: (text: string) => void;
  stopVoice: () => void;
  loadDemoData: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'manas_saathi_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('elderly');
  const [language, setLanguageState] = useState<Language>('en');
  const [textSize, setTextSizeState] = useState<TextSize>('large'); // default Large for elderly accessibility
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [activeScreen, setActiveScreen] = useState<'home' | 'game' | 'result' | 'mood'>('home');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [currentMood, setCurrentMood] = useState<MoodType | null>('happy');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showMedicalModal, setShowMedicalModal] = useState<boolean>(false);
  const [medicalModalTab, setMedicalModalTab] = useState<'hospitals' | 'surgeons' | 'sos'>('hospitals');
  const [autoSpeakCompanion, setAutoSpeakCompanion] = useState<boolean>(true);
  const [isCompanionSpeaking, setIsCompanionSpeaking] = useState<boolean>(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState<boolean>(false);
  const [showDemoTourModal, setShowDemoTourModal] = useState<boolean>(false);

  // Pharmacy & Online Medicine Ordering State
  const [showPharmacyModal, setShowPharmacyModal] = useState<boolean>(false);
  const [pharmacyTab, setPharmacyTab] = useState<'store' | 'cart' | 'orders' | 'refill'>('store');
  const [selectedMedicineForRefill, setSelectedMedicineForRefill] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cart`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [orders, setOrders] = useState<MedicineOrder[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  // Persist cart & orders
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}cart`, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
    }
  }, [orders]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.medicine.price * item.quantity, 0);
  }, [cart]);

  const addToCart = (medicine: MedicineItem, quantity = 1) => {
    playClickSound(soundEnabled);
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { medicine, quantity }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    playClickSound(soundEnabled);
    setCart((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const updateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (orderData: {
    items: CartItem[];
    address: DeliveryAddress;
    speed: DeliverySpeed;
    paymentMethod: PaymentMethod;
    prescriptionUploaded: boolean;
    prescriptionFileName?: string;
  }): MedicineOrder => {
    const subtotal = orderData.items.reduce(
      (acc, curr) => acc + curr.medicine.price * curr.quantity,
      0
    );
    const discount = Math.round(subtotal * 0.1); // 10% Senior Care wellness concession
    const deliveryFee = orderData.speed === 'express' ? (subtotal > 600 ? 0 : 49) : 0;
    const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${randomNum}`;

    const newOrder: MedicineOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: orderData.items,
      subtotal,
      discount,
      deliveryFee,
      totalAmount,
      deliveryAddress: orderData.address,
      deliverySpeed: orderData.speed,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending_cod' : 'paid',
      orderStatus: 'confirmed',
      createdAt: 'Just now',
      estimatedDelivery:
        orderData.speed === 'express'
          ? 'Today within 2 hours'
          : orderData.speed === 'subscription'
          ? 'Recurring: 1st of every month (First pack today)'
          : 'Tomorrow by 11:00 AM',
      prescriptionUploaded: orderData.prescriptionUploaded,
      prescriptionFileName: orderData.prescriptionFileName || 'Verified_Doctor_Rx.pdf',
      riderInfo: {
        name: 'Sunil Verma (सुनील वर्मा)',
        phone: '+91 98188 54321',
        rating: 4.9,
        vehicleNumber: 'DL 4S BR 3190',
        currentLocation: 'Assigned to nearest Apollo/MedPlus pharmacy',
      },
      pharmacyPartner: {
        name: 'Apollo 24|7 Partner Neuro Pharmacy',
        address: 'Shop 14, Main Market, South Extension II, New Delhi',
        licenseNumber: 'DL-PH-2024-99812A',
      },
      trackingSteps: [
        {
          step: 1,
          titleEn: 'Order Confirmed & Pharmacist Reviewing Rx',
          titleHi: 'ऑर्डर कन्फर्म हुआ व फार्मासिस्ट पर्चा जांच रहे हैं',
          time: 'Just now',
          completed: true,
          active: false,
        },
        {
          step: 2,
          titleEn: 'Dispensing & Safety Packaging',
          titleHi: 'दवाइयां सुरक्षा पैकिंग में तैयार की जा रही हैं',
          time: 'In progress',
          completed: false,
          active: true,
        },
        {
          step: 3,
          titleEn: 'Rider Pickup for Express Dispatch',
          titleHi: 'डिलीवरी पार्टनर को सुपुर्दगी',
          time: 'Est. 20 mins',
          completed: false,
          active: false,
        },
        {
          step: 4,
          titleEn: 'Delivered at Doorstep to Sharma Ji',
          titleHi: 'शर्मा जी को घर पर सुरक्षित डिलीवरी',
          time: orderData.speed === 'express' ? 'Within 2 hours' : 'Tomorrow',
          completed: false,
          active: false,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const openPharmacyWithMedicine = (nameOrId: string) => {
    setSelectedMedicineForRefill(nameOrId);
    setPharmacyTab('refill');
    setShowPharmacyModal(true);
  };

  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>(() => [
    {
      id: 'init-1',
      role: 'saathi',
      text: 'Namaste Sharma Ji! I am Saathi, your friendly companion. You can speak to me anytime by tapping the microphone below.',
      timestamp: 'Just now',
      sentiment: 'warm',
      quickFollowUps: [
        'Namaste! What should I do today?',
        'Tell me a nostalgic memory',
        'Play some gentle music',
      ],
    },
  ]);

  const [voiceLogs, setVoiceLogs] = useState<VoiceInteractionLog[]>(() => {
    if (typeof window === 'undefined') return SAMPLE_VOICE_LOGS;
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}voice_logs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SAMPLE_VOICE_LOGS;
      }
    }
    return SAMPLE_VOICE_LOGS;
  });

  const addVoiceLog = (log: VoiceInteractionLog) => {
    setVoiceLogs((prev) => [log, ...prev]);
  };

  // Persist voice logs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}voice_logs`, JSON.stringify(voiceLogs));
    }
  }, [voiceLogs]);

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}onboarded`) === 'true';
  });

  const [activityHistory, setActivityHistory] = useState<ActivityRecord[]>(() => {
    if (typeof window === 'undefined') return SAMPLE_ACTIVITY_HISTORY;
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}history`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SAMPLE_ACTIVITY_HISTORY;
      }
    }
    return SAMPLE_ACTIVITY_HISTORY;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REMINDERS;
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reminders`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_REMINDERS;
      }
    }
    return INITIAL_REMINDERS;
  });

  const [userProfile] = useState<UserProfile>(DEMO_USER);

  // Apply text size to root HTML element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-text-size', textSize);
    }
  }, [textSize]);

  // Persist history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}history`, JSON.stringify(activityHistory));
    }
  }, [activityHistory]);

  // Persist reminders
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}reminders`, JSON.stringify(reminders));
    }
  }, [reminders]);

  const recommendation = useMemo(() => {
    return getAIActivityRecommendation(activityHistory, currentMood);
  }, [activityHistory, currentMood]);

  const setRole = (newRole: UserRole) => {
    stopSpeaking();
    setIsSpeaking(false);
    playClickSound(soundEnabled);
    setRoleState(newRole);
    setActiveScreen('home');
    setActiveGameId(null);
  };

  const setLanguage = (lang: Language) => {
    stopSpeaking();
    setIsSpeaking(false);
    playClickSound(soundEnabled);
    setLanguageState(lang);
  };

  const setTextSize = (size: TextSize) => {
    playClickSound(soundEnabled);
    setTextSizeState(size);
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
  };

  const completeOnboarding = (selectedRole: UserRole, selectedLang: Language) => {
    setRoleState(selectedRole);
    setLanguageState(selectedLang);
    setHasSeenOnboarding(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarded`, 'true');
    }
  };

  const startActivity = (gameId: GameId) => {
    stopSpeaking();
    setIsSpeaking(false);
    playClickSound(soundEnabled);
    setActiveGameId(gameId);
    setActiveScreen('game');
  };

  const finishActivity = (
    score: number,
    maxScore: number,
    durationSeconds: number,
    difficulty: GameDifficulty
  ) => {
    stopSpeaking();
    setIsSpeaking(false);
    if (!activeGameId) return;

    const gameNames: Record<GameId, string> = {
      'memory-match': 'Memory Match',
      'picture-recall': 'Picture Recall',
      'number-match': 'Number Match',
      'color-pattern': 'Color & Pattern',
      'music-memory': 'Music Memory',
      'simple-quiz': 'Simple Quiz',
    };

    const newRecord: ActivityRecord = {
      id: `act-${Date.now()}`,
      gameId: activeGameId,
      gameTitle: gameNames[activeGameId],
      score,
      maxScore,
      timeSpentSeconds: durationSeconds,
      timestamp: 'Just now',
      mood: currentMood || undefined,
      difficulty,
      dateKey: new Date().toISOString().split('T')[0],
    };

    setActivityHistory((prev) => [newRecord, ...prev]);
    setLastResult({
      gameId: activeGameId,
      score,
      maxScore,
      duration: durationSeconds,
      difficulty,
    });
    setActiveScreen('result');
  };

  const recordMoodAndProceed = (mood: MoodType) => {
    playClickSound(soundEnabled);
    setCurrentMood(mood);
    // Update the latest activity's mood if present
    setActivityHistory((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], mood };
      return updated;
    });
    setActiveScreen('home');
    setActiveGameId(null);
  };

  const returnHome = () => {
    stopSpeaking();
    setIsSpeaking(false);
    playClickSound(soundEnabled);
    setActiveScreen('home');
    setActiveGameId(null);
  };

  const toggleReminder = (id: string) => {
    playClickSound(soundEnabled);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const willBeCompleted = !r.completed;
        return {
          ...r,
          completed: willBeCompleted,
          status: willBeCompleted ? 'taken' : 'pending',
          takenAt: willBeCompleted ? timeStr : undefined,
          snoozedUntil: undefined,
        };
      })
    );
  };

  const addReminder = (newRem: Omit<Reminder, 'id'>) => {
    playClickSound(soundEnabled);
    const id = `rem-${Date.now()}`;
    const reminder: Reminder = {
      ...newRem,
      id,
      status: newRem.status || (newRem.completed ? 'taken' : 'pending'),
    };
    setReminders((prev) => [reminder, ...prev]);
  };

  const deleteReminder = (id: string) => {
    playClickSound(soundEnabled);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const markReminderTaken = (id: string) => {
    playClickSound(soundEnabled);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          completed: true,
          status: 'taken',
          takenAt: timeStr,
          snoozedUntil: undefined,
        };
      })
    );
  };

  const snoozeReminder = (id: string, minutes = 15) => {
    playClickSound(soundEnabled);
    const now = new Date(Date.now() + minutes * 60 * 1000);
    const snoozedUntilStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          completed: false,
          status: 'snoozed',
          snoozedUntil: snoozedUntilStr,
          snoozeCount: (r.snoozeCount || 0) + 1,
        };
      })
    );
  };

  const speak = (text: string) => {
    if (!soundEnabled) return;
    setIsSpeaking(true);
    speakText(
      text,
      language,
      0.82,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const stopVoice = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const loadDemoData = () => {
    playClickSound(soundEnabled);
    setActivityHistory(SAMPLE_ACTIVITY_HISTORY);
    setReminders(INITIAL_REMINDERS);
    setCurrentMood('happy');
    setRoleState('caregiver'); // switch to caregiver to highlight SIH analytics
  };

  const triggerSuggestedAction = (action: VoiceSuggestedAction) => {
    playClickSound(soundEnabled);
    if (action.type === 'start_game' && action.gameId) {
      setShowVoiceModal(false);
      startActivity(action.gameId);
    } else if (action.type === 'call_caregiver') {
      setShowVoiceModal(false);
      setShowCallModal(true);
    } else if (action.type === 'play_music') {
      setShowVoiceModal(false);
      startActivity('music-memory');
    } else if (action.type === 'show_medical') {
      setShowVoiceModal(false);
      setMedicalModalTab('hospitals');
      setShowMedicalModal(true);
    } else if (action.type === 'mark_medicine') {
      // Find first pending medication reminder and mark it taken
      const pendingMed = reminders.find((r) => !r.completed && r.type === 'medication') || reminders.find((r) => !r.completed);
      if (pendingMed) {
        markReminderTaken(pendingMed.id);
      }
    } else if (action.type === 'show_caregiver') {
      setShowVoiceModal(false);
      setRoleState('caregiver');
    } else if (action.type === 'switch_language' && action.targetLang) {
      setLanguageState(action.targetLang);
    } else if (action.type === 'log_mood' && action.targetMood) {
      setCurrentMood(action.targetMood);
    } else if (action.type === 'open_pharmacy') {
      setShowVoiceModal(false);
      setShowPharmacyModal(true);
    }
  };

  const resetAllData = () => {
    playClickSound(soundEnabled);
    setActivityHistory([]);
    setReminders(INITIAL_REMINDERS.map((r) => ({ ...r, completed: false })));
    setCurrentMood(null);
    setVoiceMessages([]);
    setVoiceLogs([]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        textSize,
        setTextSize,
        soundEnabled,
        setSoundEnabled,
        activeScreen,
        setActiveScreen,
        activeGameId,
        lastResult,
        activityHistory,
        currentMood,
        setCurrentMood,
        reminders,
        userProfile,
        recommendation,
        isSpeaking,
        showCallModal,
        setShowCallModal,
        showVoiceModal,
        setShowVoiceModal,
        showMedicalModal,
        setShowMedicalModal,
        medicalModalTab,
        setMedicalModalTab,
        showPharmacyModal,
        setShowPharmacyModal,
        pharmacyTab,
        setPharmacyTab,
        selectedMedicineForRefill,
        setSelectedMedicineForRefill,
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orders,
        placeOrder,
        openPharmacyWithMedicine,
        voiceMessages,
        setVoiceMessages,
        voiceLogs,
        addVoiceLog,
        autoSpeakCompanion,
        setAutoSpeakCompanion,
        isCompanionSpeaking,
        setIsCompanionSpeaking,
        triggerSuggestedAction,
        showAccessibilityModal,
        setShowAccessibilityModal,
        showDemoTourModal,
        setShowDemoTourModal,
        hasSeenOnboarding,
        completeOnboarding,
        startActivity,
        finishActivity,
        recordMoodAndProceed,
        returnHome,
        toggleReminder,
        addReminder,
        deleteReminder,
        markReminderTaken,
        snoozeReminder,
        speak,
        stopVoice,
        loadDemoData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
