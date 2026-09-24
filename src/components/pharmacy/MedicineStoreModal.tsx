import React, { useState, useMemo } from 'react';
import {
  Pill,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Phone,
  MapPin,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Wallet,
  ChevronRight,
  Info,
  X,
  Search,
  Filter,
  ArrowRight,
  Check,
  Building2,
  Calendar,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import {
  MedicineItem,
  MedicineCategory,
  DeliverySpeed,
  PaymentMethod,
  DeliveryAddress,
  CartItem,
  MedicineOrder,
} from '../../types/pharmacy';
import {
  MEDICINE_CATALOG,
  DEFAULT_DELIVERY_ADDRESSES,
} from '../../utils/pharmacyData';
import { playClickSound, playSuccessChime } from '../../utils/sound';

export const MedicineStoreModal: React.FC = () => {
  const {
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
    language,
    soundEnabled,
  } = useApp();

  const t = getTranslation(language);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory>('all');
  const [selectedMedicineForInfo, setSelectedMedicineForInfo] = useState<MedicineItem | null>(null);

  // Prescription Upload & Verification state
  const [hasPrescription, setHasPrescription] = useState<boolean>(true);
  const [prescriptionName, setPrescriptionName] = useState<string>('AIIMS_Dr_Mehra_Neuro_Rx.pdf');
  const [isUploadingRx, setIsUploadingRx] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);

  // Checkout State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>('express');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [justPlacedOrder, setJustPlacedOrder] = useState<MedicineOrder | null>(null);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  // Active tracking order
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Categories config
  const categories: { key: MedicineCategory; labelEn: string; labelHi: string; icon: string }[] = [
    { key: 'all', labelEn: 'All Medicines', labelHi: 'सभी दवाइयां', icon: '💊' },
    { key: 'cognitive', labelEn: 'Cognitive & Memory', labelHi: 'स्मृति व मानसिक', icon: '🧠' },
    { key: 'cardio', labelEn: 'BP & Heart', labelHi: 'बीपी व हृदय', icon: '❤️' },
    { key: 'vitamins', labelEn: 'Vitamins & Nerves', labelHi: 'विटामिन व नसें', icon: '🌿' },
    { key: 'geriatric', labelEn: 'Daily Geriatric', labelHi: 'दैनिक वरिष्ठ देखभाल', icon: '🦴' },
    { key: 'devices', labelEn: 'Monitors & Devices', labelHi: 'बीपी व शुगर उपकरण', icon: '🩺' },
    { key: 'sleep', labelEn: 'Sleep & Relaxation', labelHi: 'नींद व विश्राम', icon: '🌙' },
  ];

  // Filter medicines
  const filteredMedicines = useMemo(() => {
    return MEDICINE_CATALOG.filter((med) => {
      const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        med.name.toLowerCase().includes(query) ||
        med.genericName.toLowerCase().includes(query) ||
        med.descriptionEn.toLowerCase().includes(query) ||
        med.descriptionHi.includes(query) ||
        med.manufacturer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle Prescription upload simulation
  const handleSimulateRxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingRx(true);
      playClickSound(soundEnabled);
      setTimeout(() => {
        setIsUploadingRx(false);
        setHasPrescription(true);
        setPrescriptionName(file.name);
        setShowRxModal(false);
        playSuccessChime(soundEnabled);
        setOrderNotice(
          language === 'hi'
            ? `पर्चा "${file.name}" सफलतापूर्वक अपलोड व सत्यापित हो गया है!`
            : `Prescription "${file.name}" verified by AIIMS partner pharmacist!`
        );
        setTimeout(() => setOrderNotice(null), 4000);
      }, 1000);
    }
  };

  // 1-Click Refill Sharma Ji's Daily Prescriptions
  const handleRefillDailyPrescriptions = () => {
    playClickSound(soundEnabled);
    const donepezil = MEDICINE_CATALOG.find((m) => m.id === 'med-donepezil-5');
    const telmisartan = MEDICINE_CATALOG.find((m) => m.id === 'med-telmisartan-40');

    if (donepezil) addToCart(donepezil, 1);
    if (telmisartan) addToCart(telmisartan, 1);

    setPharmacyTab('cart');
    playSuccessChime(soundEnabled);
  };

  // Place Order Handler
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsPlacingOrder(true);
    playClickSound(soundEnabled);

    setTimeout(() => {
      const selectedAddress = DEFAULT_DELIVERY_ADDRESSES[selectedAddressIndex] || DEFAULT_DELIVERY_ADDRESSES[0];
      const createdOrder = placeOrder({
        items: [...cart],
        address: selectedAddress,
        speed: deliverySpeed,
        paymentMethod,
        prescriptionUploaded: hasPrescription,
        prescriptionFileName: prescriptionName,
      });

      setIsPlacingOrder(false);
      setJustPlacedOrder(createdOrder);
      setActiveTrackingOrderId(createdOrder.id);
      setPharmacyTab('orders');
      playSuccessChime(soundEnabled);
    }, 900);
  };

  // Find active tracking order
  const trackingOrder = useMemo(() => {
    if (activeTrackingOrderId) {
      return orders.find((o) => o.id === activeTrackingOrderId) || orders[0];
    }
    return orders[0];
  }, [orders, activeTrackingOrderId]);

  if (!showPharmacyModal) return null;

  // Pricing calculations for cart
  const discountAmount = Math.round(cartSubtotal * 0.1); // 10% Senior Care concession
  const deliveryCharges = deliverySpeed === 'express' ? (cartSubtotal > 600 ? 0 : 49) : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + deliveryCharges);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-3 border-emerald-300 shadow-2xl max-w-5xl w-full flex flex-col h-[94vh] max-h-[920px] overflow-hidden">
        {/* Top Navbar / Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 sm:px-6 py-4 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  {t.medicineStore}
                </h2>
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-800/60 border border-emerald-300/40 tracking-wider">
                  24x7 Verified Rx
                </span>
              </div>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                {language === 'hi'
                  ? 'शर्मा जी की दैनिक दवाएं, न्यूरो टॉनिक्स व आपातकालीन रीफिल'
                  : "Certified geriatric medications, neuro supplements & doorstep refills"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Cart Button */}
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setPharmacyTab('cart');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-sm ${
                pharmacyTab === 'cart'
                  ? 'bg-white text-emerald-950 ring-2 ring-emerald-300'
                  : 'bg-emerald-800/60 hover:bg-emerald-800 text-white border border-emerald-400/40'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden xs:inline">{language === 'hi' ? 'थैला' : 'Cart'}</span>
              <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {/* Close Modal */}
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setShowPharmacyModal(false);
              }}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pharmacy Tabs Navigation */}
        <div className="bg-emerald-50/70 border-b border-emerald-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setPharmacyTab('store');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                pharmacyTab === 'store'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>{language === 'hi' ? 'दवाइयां ब्राउज़ करें' : 'Browse Medicines'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setPharmacyTab('refill');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                pharmacyTab === 'refill'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{language === 'hi' ? '1-क्लिक रीफिल' : '1-Click Refill'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setPharmacyTab('cart');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                pharmacyTab === 'cart'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{language === 'hi' ? 'चेकआउट' : 'Cart & Checkout'}</span>
              {cartCount > 0 && (
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-950 font-black">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                playClickSound(soundEnabled);
                setPharmacyTab('orders');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                pharmacyTab === 'orders'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{language === 'hi' ? 'ऑर्डर ट्रैकिंग' : 'Track Deliveries'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </button>
          </div>

          {/* Prescription Status Chip */}
          <button
            onClick={() => setShowRxModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-emerald-900 border border-emerald-300 text-xs font-bold shadow-2xs hover:bg-emerald-100/50 transition-colors shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {hasPrescription
                ? language === 'hi'
                  ? '✓ पर्चा सत्यापित (AIIMS Neuro)'
                  : '✓ Doctor Rx on File'
                : language === 'hi'
                ? '+ पर्चा अपलोड करें'
                : '+ Upload Doctor Rx'}
            </span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {orderNotice && (
          <div className="bg-emerald-100 border-b border-emerald-300 px-4 py-2.5 flex items-center justify-between text-emerald-950 text-xs sm:text-sm font-bold animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{orderNotice}</span>
            </div>
            <button
              onClick={() => setOrderNotice(null)}
              className="text-xs px-2 py-0.5 rounded hover:bg-emerald-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Modal Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-6">
          {/* TAB 1: STORE CATALOG */}
          {pharmacyTab === 'store' && (
            <div className="space-y-6">
              {/* 1-Click Fast Refill Banner for Sharma Ji */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg border-2 border-amber-300 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider">
                    <span>⚡</span>
                    <span>
                      {language === 'hi'
                        ? 'शर्मा जी की आज की दवाएं'
                        : "Sharma Ji's Active Prescriptions"}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    {language === 'hi'
                      ? 'डोनेपेज़िल 5mg + टेल्मीसार्टन 40mg का स्टॉक रीफिल'
                      : 'Donepezil 5mg & Telmisartan 40mg 1-Click Refill'}
                  </h3>
                  <p className="text-amber-100 text-xs sm:text-sm max-w-xl font-medium">
                    {language === 'hi'
                      ? 'अनीता जी द्वारा अनुमोदित मासिक खुराक। 2 घंटे में सीधे आपके घर डिलीवरी।'
                      : 'Verified neurologist prescription with free doorstep express dispatch in 2 hours.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 z-10 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-amber-200 line-through">₹410 MRP</div>
                    <div className="text-xl font-black text-white">₹330 Total</div>
                  </div>
                  <button
                    onClick={handleRefillDailyPrescriptions}
                    className="px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-black text-sm sm:text-base shadow-lg transition-transform active:scale-95 flex items-center gap-2 border-2 border-amber-200"
                  >
                    <Zap className="w-5 h-5 text-amber-600 fill-amber-600" />
                    <span>{language === 'hi' ? 'दोनों अभी मंगाएं' : 'Refill Both Now'}</span>
                  </button>
                </div>
              </div>

              {/* Search Bar & Categories */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'दवा का नाम, साल्ट (Donepezil, Telmisartan, बीपी, स्मृति) खोजें...'
                        : 'Search by medicine name, generic formula (Donepezil, B12, BP, memory)...'
                    }
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none bg-white text-base text-slate-900 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Horizontal Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        playClickSound(soundEnabled);
                        setSelectedCategory(cat.key);
                      }}
                      className={`shrink-0 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                        selectedCategory === cat.key
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{language === 'hi' ? cat.labelHi : cat.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedicines.map((med) => {
                  const inCartItem = cart.find((c) => c.medicine.id === med.id);
                  const isUserActiveMed =
                    med.linkedMedicineName === 'Donepezil' ||
                    med.linkedMedicineName === 'Telmisartan';

                  return (
                    <div
                      key={med.id}
                      className={`rounded-3xl border-2 p-5 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                        isUserActiveMed
                          ? 'border-emerald-400/90 ring-2 ring-emerald-100'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top ribbon if active prescription */}
                      {isUserActiveMed && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl tracking-wider">
                          ⭐ {language === 'hi' ? 'शर्मा जी की खुराक' : "Sharma Ji's Rx"}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2 pt-1">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
                            {med.imageIcon}
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {med.requiresPrescription ? (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                Rx Required
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                OTC Wellness
                              </span>
                            )}

                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              <span>{language === 'hi' ? med.deliveryEstimateHi : med.deliveryEstimate}</span>
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-slate-900 leading-snug">
                            {med.name}
                          </h4>
                          <p className="text-xs font-semibold text-slate-500">
                            {med.genericName} · {med.packSize}
                          </p>
                          <p className="text-xs font-bold text-indigo-700 mt-0.5">
                            By {med.manufacturer}
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {language === 'hi' ? med.descriptionHi : med.descriptionEn}
                        </p>
                      </div>

                      {/* Pricing & Add to Cart Controls */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl font-black text-slate-900">
                              ₹{med.price}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              ₹{med.mrp}
                            </span>
                          </div>
                          <span className="text-[11px] font-extrabold text-emerald-700">
                            {med.discountPercent}% OFF
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Info Button */}
                          <button
                            onClick={() => setSelectedMedicineForInfo(med)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="View Dosage & Doctor Guidance"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {/* Cart Button or Counter */}
                          {inCartItem ? (
                            <div className="flex items-center bg-emerald-100 rounded-xl p-1 border border-emerald-300">
                              <button
                                onClick={() => updateCartQuantity(med.id, inCartItem.quantity - 1)}
                                className="w-7 h-7 rounded-lg bg-white text-emerald-950 font-black flex items-center justify-center hover:bg-emerald-50 shadow-2xs"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 font-black text-sm text-emerald-950">
                                {inCartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(med.id, inCartItem.quantity + 1)}
                                className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center hover:bg-emerald-700 shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(med, 1)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                              <span>{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REFILL PRESCRIBED MEDICINES */}
          {pharmacyTab === 'refill' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {language === 'hi' ? 'दवा रीफिल व ऑटो-डिस्पेंस' : 'Prescription Refill Hub'}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium">
                      {language === 'hi'
                        ? 'शर्मा जी की चालू दवाएं जो कभी खत्म नहीं होनी चाहिए'
                        : 'Routine neuro and blood pressure medications tracked for timely replenishment'}
                    </p>
                  </div>
                  <button
                    onClick={handleRefillDailyPrescriptions}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{language === 'hi' ? 'सभी एक साथ रीफिल करें' : 'Refill All Routine'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {MEDICINE_CATALOG.filter((m) =>
                    ['med-donepezil-5', 'med-telmisartan-40', 'med-memantine-10', 'med-neurobion-forte'].includes(m.id)
                  ).map((med) => (
                    <div
                      key={med.id}
                      className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{med.imageIcon}</span>
                          <div>
                            <h4 className="text-base font-black text-slate-900">{med.name}</h4>
                            <p className="text-xs text-slate-500">{med.packSize} · ₹{med.price}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          {med.id === 'med-donepezil-5'
                            ? language === 'hi' ? '3 दिन बचे हैं' : '3 Days Left'
                            : language === 'hi' ? '5 दिन बचे हैं' : '5 Days Left'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        👉 <strong>{language === 'hi' ? 'खुराक निर्देश:' : 'Routine:'}</strong>{' '}
                        {language === 'hi' ? med.usageHi : med.usageEn}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>2 Hours Express Available</span>
                        </span>
                        <button
                          onClick={() => {
                            addToCart(med, 1);
                            setPharmacyTab('cart');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'रीफिल जोड़ें' : 'Refill Pack'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CART & CHECKOUT */}
          {pharmacyTab === 'cart' && (
            <div className="space-y-6">
              {cart.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-slate-300 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-3xl">
                    🛍️
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {language === 'hi' ? 'आपका थैला खाली है' : 'Your Pharmacy Cart is Empty'}
                  </h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    {language === 'hi'
                      ? 'शर्मा जी की सुझाई गई दवाएं जैसे Donepezil 5mg या BP मॉनिटर जोड़ने के लिए स्टोर पर जाएं।'
                      : 'Add Sharma Ji’s prescribed medications or daily wellness supplements from the store.'}
                  </p>
                  <button
                    onClick={() => setPharmacyTab('store')}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Pill className="w-4 h-4" />
                    <span>{language === 'hi' ? 'दवाइयां चुनें' : 'Browse Medicines'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Cart Items & Prescription Check */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Cart Items List */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-emerald-600" />
                          <span>{language === 'hi' ? 'थैले में दवाएं' : 'Order Items'}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {cartCount} items
                          </span>
                        </h3>
                        <button
                          onClick={clearCart}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          {language === 'hi' ? 'खाली करें' : 'Clear All'}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.medicine.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl">{item.medicine.imageIcon}</span>
                              <div className="min-w-0">
                                <h4 className="text-sm font-black text-slate-900 truncate">
                                  {item.medicine.name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  ₹{item.medicine.price} · {item.medicine.packSize}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center bg-white rounded-xl p-1 border border-slate-300">
                                <button
                                  onClick={() => updateCartQuantity(item.medicine.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center text-xs"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2.5 font-black text-sm text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQuantity(item.medicine.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center text-xs"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="font-black text-sm text-slate-900 w-16 text-right">
                                ₹{item.medicine.price * item.quantity}
                              </span>

                              <button
                                onClick={() => removeFromCart(item.medicine.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prescription Verification Box */}
                    <div className="bg-emerald-50/90 rounded-3xl p-5 border-2 border-emerald-300 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-5 h-5 text-emerald-700" />
                          <h4 className="text-base font-black text-emerald-950">
                            {language === 'hi' ? 'डॉक्टर का पर्चा (Rx)' : 'Doctor Prescription (Rx)'}
                          </h4>
                        </div>
                        <button
                          onClick={() => setShowRxModal(true)}
                          className="text-xs font-bold text-emerald-800 underline underline-offset-2"
                        >
                          {language === 'hi' ? 'बदलें / नया अपलोड करें' : 'Change / Upload New'}
                        </button>
                      </div>

                      {hasPrescription ? (
                        <div className="bg-white rounded-2xl p-3 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold">{prescriptionName}</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold text-[10px]">
                              VERIFIED
                            </span>
                          </div>
                          <span className="text-slate-500 font-medium">Dr. Arvind Mehra, AIIMS</span>
                        </div>
                      ) : (
                        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-300 flex items-center justify-between text-xs text-amber-900">
                          <span className="font-bold">
                            ⚠️ {language === 'hi' ? 'पर्चे की आवश्यकता है' : 'Prescription required for Rx meds'}
                          </span>
                          <button
                            onClick={() => setShowRxModal(true)}
                            className="px-3 py-1 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700"
                          >
                            {language === 'hi' ? 'अपलोड करें' : 'Upload Rx'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Checkout Options & Billing */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Delivery Address Selector */}
                    <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'hi' ? 'डिलीवरी का पता' : 'Delivery Address'}</span>
                      </div>

                      <div className="space-y-2">
                        {DEFAULT_DELIVERY_ADDRESSES.map((addr, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedAddressIndex(idx)}
                            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                              selectedAddressIndex === idx
                                ? 'border-emerald-500 bg-emerald-50/50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-black text-slate-900">
                              <span>{addr.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] uppercase">
                                {addr.type === 'home' ? 'Home (Sharma Ji)' : 'Caregiver Anita'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                              {addr.addressLine}, {addr.city} - {addr.pincode}
                            </p>
                            <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
                              📞 {addr.phone}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Speed Selector */}
                    <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'hi' ? 'डिलीवरी गति' : 'Delivery Speed'}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliverySpeed('express')}
                          className={`p-3 rounded-2xl border-2 text-left transition-all ${
                            deliverySpeed === 'express'
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-900">⚡ 2-Hour Express</span>
                            <span className="text-[10px] font-extrabold text-emerald-700">FAST</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Direct from partner pharmacy</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliverySpeed('standard')}
                          className={`p-3 rounded-2xl border-2 text-left transition-all ${
                            deliverySpeed === 'standard'
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">📦 Standard Free</span>
                            <span className="text-[10px] font-extrabold text-slate-500">FREE</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Tomorrow morning delivery</p>
                        </button>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'hi' ? 'भुगतान विकल्प' : 'Payment Method'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                            paymentMethod === 'cod'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black'
                              : 'border-slate-200 text-slate-700 font-bold'
                          } text-xs`}
                        >
                          💵 Cash on Delivery
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                            paymentMethod === 'upi'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black'
                              : 'border-slate-200 text-slate-700 font-bold'
                          } text-xs`}
                        >
                          📱 UPI / GPay
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('caregiver_autopay')}
                          className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                            paymentMethod === 'caregiver_autopay'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black'
                              : 'border-slate-200 text-slate-700 font-bold'
                          } text-xs`}
                        >
                          👩‍⚕️ Anita Auto-Pay
                        </button>
                      </div>
                    </div>

                    {/* Order Summary & Pay */}
                    <div className="bg-emerald-900 text-white rounded-3xl p-5 sm:p-6 space-y-3 shadow-md">
                      <h4 className="text-base font-black border-b border-emerald-700 pb-2">
                        {language === 'hi' ? 'बिल विवरण' : 'Payment Breakdown'}
                      </h4>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-emerald-100">
                          <span>{language === 'hi' ? 'कुल सामान मूल्य' : 'Subtotal'}</span>
                          <span className="font-bold">₹{cartSubtotal}</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>{language === 'hi' ? 'वरिष्ठ नागरिक छूट (10%)' : 'Senior Concession (10%)'}</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-100">
                          <span>{language === 'hi' ? 'डिलीवरी शुल्क' : 'Delivery Charges'}</span>
                          <span>{deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}</span>
                        </div>

                        <div className="flex items-center justify-between text-base sm:text-lg font-black pt-2 border-t border-emerald-700">
                          <span>{language === 'hi' ? 'कुल देय राशि' : 'Total Amount'}</span>
                          <span className="text-amber-300">₹{grandTotal}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckoutSubmit}
                        disabled={isPlacingOrder}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer mt-2"
                      >
                        {isPlacingOrder ? (
                          <>
                            <Sparkles className="w-5 h-5 animate-spin" />
                            <span>{language === 'hi' ? 'ऑर्डर प्रोसेस हो रहा है...' : 'Processing Order...'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{language === 'hi' ? `ऑर्डर कन्फर्म करें (₹${grandTotal})` : `Place Order (₹${grandTotal})`}</span>
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-emerald-300 text-center font-medium">
                        🛡️ 100% Genuine batch verified by licensed hospital pharmacist
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIVE ORDER TRACKING & HISTORY */}
          {pharmacyTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-slate-300 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-3xl">
                    🚚
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {language === 'hi' ? 'कोई हालिया ऑर्डर नहीं है' : 'No active orders'}
                  </h3>
                  <button
                    onClick={() => setPharmacyTab('store')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm"
                  >
                    {language === 'hi' ? 'दवाइयां ब्राउज़ करें' : 'Browse Medicines'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selected Active Tracking Card */}
                  {trackingOrder && (
                    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-300 shadow-md space-y-5">
                      {/* Top Header of the Order */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl font-black text-slate-900">
                              Order #{trackingOrder.orderNumber}
                            </span>
                            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase border border-emerald-300">
                              {trackingOrder.orderStatus === 'out_for_delivery'
                                ? language === 'hi' ? '🚴 रास्ते में है' : 'Out for Delivery'
                                : trackingOrder.orderStatus === 'confirmed'
                                ? language === 'hi' ? '✓ स्वीकृत' : 'Confirmed'
                                : trackingOrder.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                            Placed {trackingOrder.createdAt} · {trackingOrder.items.length} items · Total ₹{trackingOrder.totalAmount}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playClickSound(soundEnabled);
                              const tel = trackingOrder.riderInfo?.phone || '+919876543210';
                              window.location.href = `tel:${tel}`;
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'डिलीवरी पार्टनर को कॉल' : 'Call Rider'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Estimated Delivery Countdown */}
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <Clock className="w-6 h-6 animate-pulse" />
                          <div>
                            <div className="text-xs font-bold text-emerald-100">
                              {language === 'hi' ? 'अपेक्षित सुपुर्दगी समय' : 'Estimated Doorstep Delivery'}
                            </div>
                            <div className="text-base sm:text-lg font-black">
                              {trackingOrder.estimatedDelivery}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs font-bold bg-white/20 px-3 py-1 rounded-xl">
                          {trackingOrder.deliverySpeed === 'express' ? '⚡ 2-Hour Express' : '📦 Standard'}
                        </div>
                      </div>

                      {/* Live Tracking Timeline Steps */}
                      <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-500">
                          {language === 'hi' ? 'लाइव डिलीवरी प्रगति' : 'Live Delivery Milestones'}
                        </h4>

                        <div className="space-y-3">
                          {trackingOrder.trackingSteps.map((step) => (
                            <div key={step.step} className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                                  step.completed
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : step.active
                                    ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-100 animate-pulse'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {step.completed ? '✓' : step.step}
                              </div>

                              <div className="flex-1 pt-0.5">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                  <span className={`font-bold ${step.active ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                                    {language === 'hi' ? step.titleHi : step.titleEn}
                                  </span>
                                  <span className="text-slate-400 text-xs">{step.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Boy & Partner Info Card */}
                      {trackingOrder.riderInfo && (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-lg font-black">
                              🚴
                            </div>
                            <div>
                              <div className="font-black text-sm text-slate-900">
                                {trackingOrder.riderInfo.name}
                              </div>
                              <div className="text-slate-500 font-medium">
                                {trackingOrder.riderInfo.vehicleNumber} · ⭐ {trackingOrder.riderInfo.rating}
                              </div>
                              <div className="text-emerald-700 font-bold mt-0.5">
                                📍 {trackingOrder.riderInfo.currentLocation}
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-slate-500">
                            <div><strong>Dispensed From:</strong> {trackingOrder.pharmacyPartner.name}</div>
                            <div className="text-[11px] text-slate-400">Lic: {trackingOrder.pharmacyPartner.licenseNumber}</div>
                          </div>
                        </div>
                      )}

                      {/* Order Items List */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-500 mb-2">
                          {language === 'hi' ? 'ऑर्डर में शामिल दवाएं:' : 'Medicines in this Package:'}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {trackingOrder.items.map((it, idx) => (
                            <div key={idx} className="bg-slate-50 p-2.5 rounded-xl text-xs flex items-center justify-between">
                              <span className="font-bold text-slate-800">
                                {it.medicine.name} (x{it.quantity})
                              </span>
                              <span className="font-black text-slate-900">
                                ₹{it.medicine.price * it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Past Orders List */}
                  {orders.length > 1 && (
                    <div className="space-y-3 pt-3">
                      <h4 className="text-base font-black text-slate-900">
                        {language === 'hi' ? 'पूर्व के ऑर्डर' : 'Previous Orders'}
                      </h4>

                      <div className="space-y-2">
                        {orders.map((ord) => (
                          <div
                            key={ord.id}
                            onClick={() => setActiveTrackingOrderId(ord.id)}
                            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all flex items-center justify-between ${
                              trackingOrder?.id === ord.id
                                ? 'border-emerald-500 ring-2 ring-emerald-100'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">📦</span>
                              <div>
                                <h5 className="text-sm font-black text-slate-900">
                                  #{ord.orderNumber} · ₹{ord.totalAmount}
                                </h5>
                                <p className="text-xs text-slate-500">
                                  {ord.createdAt} · {ord.items.map((i) => i.medicine.name).join(', ')}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                ord.items.forEach((it) => addToCart(it.medicine, it.quantity));
                                setPharmacyTab('cart');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300"
                            >
                              {language === 'hi' ? 'दोबारा मंगाएं' : 'Reorder'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Upload Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{language === 'hi' ? 'डॉक्टर का पर्चा (Rx)' : 'Upload Prescription (Rx)'}</span>
              </div>
              <button
                onClick={() => setShowRxModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {language === 'hi'
                ? 'सरकारी नियमों के तहत संज्ञानात्मक व बीपी दवाओं के लिए वैध पर्चा अनिवार्य है। हमारा फार्मासिस्ट 15 मिनट में इसे सत्यापित करता है।'
                : 'Government regulations mandate a valid doctor prescription for scheduled neuro & cardiovascular medicines.'}
            </p>

            <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl p-6 text-center space-y-3">
              <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <div className="text-sm font-bold text-emerald-950">
                {language === 'hi' ? 'पर्चे की फोटो या PDF यहाँ अपलोड करें' : 'Upload photo or PDF of Doctor Prescription'}
              </div>
              <p className="text-[11px] text-slate-500">Supports JPG, PNG, PDF up to 10MB</p>

              <label className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-sm transition-all">
                <span>{isUploadingRx ? 'Verifying Rx...' : 'Choose File / Camera'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleSimulateRxUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* AIIMS Saved Prescription One-Tap Apply */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-black text-slate-900">Dr. Arvind Mehra (AIIMS Neuro)</div>
                <div className="text-slate-500">Active Rx on file for Sharma Ji</div>
              </div>
              <button
                onClick={() => {
                  setHasPrescription(true);
                  setPrescriptionName('AIIMS_Dr_Mehra_Neuro_Rx.pdf');
                  setShowRxModal(false);
                  playSuccessChime(soundEnabled);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                Use Saved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Info Detail Modal */}
      {selectedMedicineForInfo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-2xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedMedicineForInfo.imageIcon}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {selectedMedicineForInfo.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {selectedMedicineForInfo.genericName} · {selectedMedicineForInfo.manufacturer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedicineForInfo(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950 font-medium">
                👉 <strong>{language === 'hi' ? 'खुराक व सेवन विधि:' : 'Usage Instructions:'}</strong>{' '}
                {language === 'hi' ? selectedMedicineForInfo.usageHi : selectedMedicineForInfo.usageEn}
              </div>

              <div>
                <h4 className="font-black text-slate-900 mb-1">
                  {language === 'hi' ? 'मुख्य लाभ व असर:' : 'Key Cognitive & Health Benefits:'}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium">
                  {(language === 'hi'
                    ? selectedMedicineForInfo.benefitsHi
                    : selectedMedicineForInfo.benefitsEn
                  ).map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="text-lg font-black text-slate-900">
                  ₹{selectedMedicineForInfo.price}{' '}
                  <span className="text-xs text-slate-400 line-through">₹{selectedMedicineForInfo.mrp}</span>
                </div>
                <button
                  onClick={() => {
                    addToCart(selectedMedicineForInfo, 1);
                    setSelectedMedicineForInfo(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-sm"
                >
                  {language === 'hi' ? 'थैले में जोड़ें' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
