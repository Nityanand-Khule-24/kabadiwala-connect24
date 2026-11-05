import { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { voiceAssistant } from '../../services/voiceAssistant';
import { generateQrDataUrl } from '../../services/qrPassport';
import { translations } from '../../utils/i18n';
import {
  MaterialLot,
  RecyclerOffer,
  LanguageCode,
  ScrapPassport,
  Material
} from '../../types';
import {
  Recycle,
  Sparkles,
  Volume2,
  VolumeX,
  PlusCircle,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Wallet,
  User,
  Home,
  Layers,
  ChevronRight,
  Search,
  Upload,
  Camera,
  X,
  FileText,
  RefreshCw,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function CollectorMobileApp() {
  const [currentStep, setCurrentStep] = useState<'splash' | 'welcome' | 'auth' | 'app'>('app');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<'home' | 'my-scrap' | 'add-scrap' | 'earnings' | 'profile'>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('mr');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Modals & subviews
  const [selectedLot, setSelectedLot] = useState<MaterialLot | null>(null);
  const [showPriceBoard, setShowPriceBoard] = useState(false);
  const [showRecyclerDiscovery, setShowRecyclerDiscovery] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState<ScrapPassport | null>(null);
  const [passportQrUrl, setPassportQrUrl] = useState<string>('');
  const [showSyncDrawer, setShowSyncDrawer] = useState(false);

  // Form states for Add Scrap
  const [scrapTitle, setScrapTitle] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [conditionInput, setConditionInput] = useState<any>('Clean / Sorted');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [pickupAddress, setPickupAddress] = useState('Ganesh Nagar, Near Timber Market');
  const [cityInput, setCityInput] = useState('Pune');
  const [pinInput, setPinInput] = useState('411042');
  const [pickupDate, setPickupDate] = useState('2026-11-06');
  const [pickupTime, setPickupTime] = useState('11:00 AM - 02:00 PM');
  const [selectedImage, setSelectedImage] = useState<string>('https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80');

  // Auth form states
  const [authIdentifier, setAuthIdentifier] = useState('ramesh.pawar@example.com');
  const [authPassword, setAuthPassword] = useState('password123');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [authError, setAuthError] = useState('');

  // Live DB state
  const [currentUser, setCurrentUser] = useState(dbStore.getCurrentUser());
  const [materials, setMaterials] = useState<Material[]>(dbStore.getMaterials());
  const [myLots, setMyLots] = useState<MaterialLot[]>([]);
  const [syncRecords, setSyncRecords] = useState(dbStore.getSyncRecords());

  const t = translations[selectedLanguage] || translations.en;

  useEffect(() => {
    const syncState = () => {
      const user = dbStore.getCurrentUser();
      setCurrentUser(user);
      if (user && user.preferred_language) {
        setSelectedLanguage(user.preferred_language);
      }
      setMaterials(dbStore.getMaterials());

      const collector = dbStore.getCollectors().find(c => c.profile_id === user?.id);
      if (collector) {
        setMyLots(dbStore.getLotsByCollector(collector.id));
      } else {
        setMyLots(dbStore.getMaterialLots().slice(0, 3));
      }
      setSyncRecords(dbStore.getSyncRecords());
    };

    syncState();
    return dbStore.subscribe(syncState);
  }, []);

  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(materials[0].id);
    }
  }, [materials, selectedMaterialId]);

  // Generate QR code when passport modal opens
  useEffect(() => {
    if (showPassportModal) {
      generateQrDataUrl(showPassportModal.qr_payload).then(url => {
        setPassportQrUrl(url);
      });
    } else {
      setPassportQrUrl('');
    }
  }, [showPassportModal]);

  // Voice assistance trigger
  const playVoicePrompt = (text: string) => {
    setIsVoiceActive(true);
    voiceAssistant.speak(text, selectedLanguage);
    setTimeout(() => setIsVoiceActive(false), 5000);
  };

  const currentCollector = dbStore.getCollectors().find(c => c.profile_id === currentUser?.id) || dbStore.getCollectors()[0];
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
  const numWeight = parseFloat(weightInput) || 0;
  const estimatedLotValue = Math.round(numWeight * (selectedMaterial?.indicative_price || 0));

  // Compute collector earnings
  const completedOrders = dbStore.getOrders().filter(o => o.collector_id === currentCollector?.id && o.order_status === 'completed');
  const totalRecordedEarnings = completedOrders.reduce((acc, curr) => acc + (curr.final_amount || (curr.agreed_price * curr.agreed_quantity)), 0);
  const pendingOrders = dbStore.getOrders().filter(o => o.collector_id === currentCollector?.id && o.order_status !== 'completed' && o.order_status !== 'cancelled');
  const pendingEarnings = pendingOrders.reduce((acc, curr) => acc + (curr.agreed_price * curr.agreed_quantity), 0);

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = dbStore.login(authIdentifier);
    if (res.success && res.user) {
      setCurrentStep('app');
    } else {
      setAuthError(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!regName || !regPhone) {
      setAuthError('Please fill in your name and phone number.');
      return;
    }
    const res = dbStore.registerCollector({
      fullName: regName,
      phone: regPhone,
      address: regAddress || 'Bhavani Peth',
      city: 'Pune',
      pinCode: '411042',
      language: selectedLanguage
    });
    if (res.success) {
      setCurrentStep('app');
    } else {
      setAuthError(res.message);
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || numWeight <= 0) {
      alert('Please select a material and enter a valid weight.');
      return;
    }

    const newLot = dbStore.createScrapLot({
      collectorId: currentCollector?.id || 'coll-1',
      materialId: selectedMaterialId,
      title: scrapTitle || `${selectedMaterial?.name} (${numWeight} kg)`,
      description: descriptionInput || `${conditionInput} scrap lot prepared for collection.`,
      weight: numWeight,
      condition: conditionInput,
      pickupAddress: pickupAddress || 'Ganesh Nagar, Timber Market',
      city: cityInput || 'Pune',
      pinCode: pinInput || '411042',
      preferredDate: pickupDate,
      preferredTime: pickupTime,
      images: [selectedImage]
    });

    confetti({ particleCount: 40, spread: 60 });
    // Reset inputs
    setScrapTitle('');
    setWeightInput('');
    setDescriptionInput('');
    setCurrentTab('my-scrap');

    // Automatically open passport modal for newly created lot
    const createdPassport = dbStore.getPassports().find(p => p.material_lot_id === newLot.id);
    if (createdPassport) {
      setShowPassportModal(createdPassport);
    }
  };

  const handleSaveDraft = () => {
    if (!selectedMaterialId || numWeight <= 0) {
      alert('Please enter at least material and weight to save draft.');
      return;
    }

    dbStore.saveOfflineDraft({
      collectorId: currentCollector?.id || 'coll-1',
      materialId: selectedMaterialId,
      title: scrapTitle || `${selectedMaterial?.name} (${numWeight} kg)`,
      description: descriptionInput,
      weight: numWeight,
      condition: conditionInput,
      pickupAddress,
      city: cityInput,
      pinCode: pinInput,
      preferredDate: pickupDate,
      preferredTime: pickupTime,
      images: [selectedImage]
    });

    alert('Draft saved locally in offline SQLite cache!');
    setShowSyncDrawer(true);
  };

  const handleAcceptOffer = (offerId: string) => {
    try {
      const order = dbStore.acceptOffer(offerId);
      confetti({ particleCount: 50, spread: 70 });
      alert(`Offer accepted! Order #${order.order_code} has been created and recycler notified.`);
      setSelectedLot(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to accept offer');
    }
  };

  // --- Render Splash Screen ---
  if (currentStep === 'splash') {
    return (
      <div className="w-full h-full min-h-[640px] bg-[#F4F9F1] flex flex-col items-center justify-between p-8 text-center select-none">
        <div className="pt-16">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-md border border-[#E2EDE0] flex items-center justify-center mx-auto mb-6">
            <Recycle className="w-14 h-14 text-[#35A853]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#15351A] tracking-tight">
            Kabadiwala Connect
          </h1>
          <p className="text-sm font-medium text-[#6B7C6B] mt-2">
            “Turning Scrap into Opportunity.”
          </p>
        </div>

        <div className="w-full max-w-xs space-y-4 pb-8">
          <div className="flex items-center justify-center gap-2 text-xs text-[#6B7C6B]">
            <span className="w-2 h-2 rounded-full bg-[#7ED957]" />
            <span>Digital Scrap Passport Network</span>
          </div>

          <button
            onClick={() => setCurrentStep('welcome')}
            className="w-full py-3.5 px-6 bg-[#35A853] hover:bg-[#2e9147] text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Get Started / सुरू करा</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- Render Welcome Screen ---
  if (currentStep === 'welcome') {
    return (
      <div className="w-full h-full min-h-[640px] bg-[#F4F9F1] flex flex-col justify-between p-6 select-none">
        <div className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl border border-[#E2EDE0] flex items-center justify-center">
                <Recycle className="w-6 h-6 text-[#35A853]" />
              </div>
              <span className="font-bold text-[#15351A] text-lg">Kabadiwala Connect</span>
            </div>

            <button
              onClick={() => playVoicePrompt(
                selectedLanguage === 'mr' 
                  ? 'कबाडीवाला कनेक्ट मध्ये आपले स्वागत आहे. पारदर्शक बाजारभाव मिळवा आणि भंगारातून संधी निर्माण करा.'
                  : selectedLanguage === 'hi'
                  ? 'कबाड़ीवाला कनेक्ट में आपका स्वागत है। सही दाम जानें और कबाड़ से कमाई बढ़ाएं।'
                  : 'Welcome to Kabadiwala Connect. Discover transparent scrap prices and connect with verified recyclers.'
              )}
              className="p-2 bg-white rounded-lg border border-[#E2EDE0] text-[#35A853] hover:bg-emerald-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Voice Guidance"
            >
              {isVoiceActive ? <VolumeX className="w-4 h-4 text-emerald-700" /> : <Volume2 className="w-4 h-4" />}
              <span>{selectedLanguage === 'mr' ? 'ऐका' : selectedLanguage === 'hi' ? 'सुनें' : 'Listen'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-xs mb-6">
            <h2 className="text-xl font-bold text-[#15351A] leading-snug">
              {t.welcomeTitle}
            </h2>
            <p className="text-xs text-[#6B7C6B] mt-2 leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* Language Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#15351A] mb-2 uppercase tracking-wider">
              {t.selectLanguage}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['mr', 'hi', 'en'] as LanguageCode[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedLanguage === lang
                      ? 'bg-[#35A853] text-white border-[#35A853] shadow-xs'
                      : 'bg-white text-[#15351A] border-[#E2EDE0] hover:bg-[#F4F9F1]'
                  }`}
                >
                  {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-6">
          <button
            onClick={() => {
              setAuthMode('login');
              setCurrentStep('auth');
            }}
            className="w-full py-3.5 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-semibold rounded-xl shadow-xs transition-colors text-center text-sm"
          >
            {t.login}
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setCurrentStep('auth');
            }}
            className="w-full py-3 px-4 bg-white hover:bg-[#F4F9F1] text-[#15351A] border border-[#E2EDE0] font-semibold rounded-xl transition-colors text-center text-sm"
          >
            {t.createAccount}
          </button>
        </div>
      </div>
    );
  }

  // --- Render Auth Screen ---
  if (currentStep === 'auth') {
    return (
      <div className="w-full h-full min-h-[640px] bg-[#F4F9F1] flex flex-col justify-between p-6 select-none">
        <div>
          <button
            onClick={() => setCurrentStep('welcome')}
            className="text-xs text-[#6B7C6B] hover:text-[#15351A] flex items-center gap-1 mb-4"
          >
            ← Back
          </button>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#15351A]">
              {authMode === 'login' ? t.login : t.createAccount}
            </h2>
            <div className="flex gap-1 bg-[#E2EDE0] p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setAuthMode('login')}
                className={`px-3 py-1 rounded-md font-semibold ${authMode === 'login' ? 'bg-white text-[#15351A] shadow-xs' : 'text-[#6B7C6B]'}`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`px-3 py-1 rounded-md font-semibold ${authMode === 'register' ? 'bg-white text-[#15351A] shadow-xs' : 'text-[#6B7C6B]'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  {t.phoneOrEmail}
                </label>
                <input
                  type="text"
                  value={authIdentifier}
                  onChange={e => setAuthIdentifier(e.target.value)}
                  placeholder="e.g. 9823144556 or ramesh@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EDE0] bg-white text-sm text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  {t.password}
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2EDE0] bg-white text-sm text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                  required
                />
              </div>

              {/* Fast Demo Account Pickers */}
              <div className="pt-2">
                <p className="text-[11px] text-[#6B7C6B] mb-2 font-medium">Quick Demo Collector Logins:</p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthIdentifier('ramesh.pawar@example.com');
                      setAuthPassword('password123');
                    }}
                    className="w-full text-left p-2 rounded-lg border border-[#E2EDE0] bg-white hover:bg-emerald-50 text-xs transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-[#15351A]">Rameshwar Pawar (Pune)</span>
                    <span className="text-[10px] text-[#6B7C6B]">मराठी</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthIdentifier('santosh.yadav@example.com');
                      setAuthPassword('password123');
                    }}
                    className="w-full text-left p-2 rounded-lg border border-[#E2EDE0] bg-white hover:bg-emerald-50 text-xs transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-[#15351A]">Santosh Yadav (Dharavi)</span>
                    <span className="text-[10px] text-[#6B7C6B]">हिंदी</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-semibold rounded-xl shadow-xs transition-colors text-sm mt-4"
              >
                {t.login}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Baburao Shelke"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  placeholder="Locality / Ward"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-semibold rounded-xl shadow-xs transition-colors text-sm mt-2"
              >
                {t.createAccount}
              </button>
            </form>
          )}
        </div>

        <div className="text-center pt-4">
          <p className="text-[11px] text-[#6B7C6B]">
            Protected by Supabase Auth &amp; Verified Collector Token
          </p>
        </div>
      </div>
    );
  }

  // --- Render Authenticated Collector App View ---
  return (
    <div className="w-full h-full flex flex-col bg-[#F4F9F1] relative">
      {/* App Header */}
      <div className="px-4 py-3 bg-white border-b border-[#E2EDE0] flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#35A853] text-white flex items-center justify-center font-bold">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#15351A] leading-tight">
              {currentUser?.full_name || 'Collector'}
            </h1>
            <p className="text-[10px] text-[#6B7C6B] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#35A853]" />
              <span>{currentCollector?.city || 'Pune'}, MH</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Assistance */}
          <button
            onClick={() => playVoicePrompt(
              selectedLanguage === 'mr'
                ? `नमस्कार ${currentUser?.full_name}, आजचे संकलन सुरू करा. नवीन भंगार जोडण्यासाठी ऍड बटन दाबा.`
                : selectedLanguage === 'hi'
                ? `नमस्ते ${currentUser?.full_name}, आज का स्क्रैप जोड़ें और अपने पैसे सीधे खाते में पाएं.`
                : `Hello ${currentUser?.full_name}. Create scrap listings and check active offers.`
            )}
            className="p-1.5 rounded-lg border border-[#E2EDE0] text-[#35A853] hover:bg-emerald-50 transition-colors"
            title="Voice guidance"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Offline Sync Status Indicator */}
          <button
            onClick={() => setShowSyncDrawer(true)}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 border ${
              syncRecords.some(r => r.sync_status === 'saved_locally')
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>{syncRecords.filter(r => r.sync_status === 'saved_locally').length > 0 ? 'Sync (1)' : 'Synced'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {/* TAB 1: HOME */}
        {currentTab === 'home' && (
          <div className="space-y-4">
            {/* Earnings KPI Bar */}
            <div className="bg-gradient-to-br from-[#15351A] to-[#254d2c] rounded-2xl p-4 text-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/80 font-medium">{t.totalEarnings}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Verified Records</span>
              </div>
              <div className="text-2xl font-extrabold tracking-tight tabular-nums">
                ₹{totalRecordedEarnings.toLocaleString('en-IN')}.00
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/70 text-[10px] block">Pending Pickup</span>
                  <span className="font-semibold tabular-nums">₹{pendingEarnings.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => setCurrentTab('earnings')}
                  className="px-2.5 py-1 bg-[#7ED957] hover:bg-[#6ecb47] text-[#15351A] rounded-lg text-xs font-bold transition-colors"
                >
                  View Ledger →
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-xs font-bold text-[#15351A] uppercase tracking-wider mb-2">
                {t.quickActions}
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCurrentTab('add-scrap')}
                  className="p-3 bg-white rounded-xl border border-[#E2EDE0] hover:border-[#35A853] text-left transition-all shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#35A853] flex items-center justify-center mb-2">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#15351A] block leading-tight">{t.addScrap}</span>
                  <span className="text-[10px] text-[#6B7C6B]">Instant quote</span>
                </button>

                <button
                  onClick={() => setShowPriceBoard(true)}
                  className="p-3 bg-white rounded-xl border border-[#E2EDE0] hover:border-[#35A853] text-left transition-all shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#35A853] flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#15351A] block leading-tight">{t.viewPrices}</span>
                  <span className="text-[10px] text-[#6B7C6B]">12 materials</span>
                </button>

                <button
                  onClick={() => setShowRecyclerDiscovery(true)}
                  className="p-3 bg-white rounded-xl border border-[#E2EDE0] hover:border-[#35A853] text-left transition-all shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#35A853] flex items-center justify-center mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#15351A] block leading-tight">{t.findRecycler}</span>
                  <span className="text-[10px] text-[#6B7C6B]">Verified mills</span>
                </button>
              </div>
            </div>

            {/* Price Preview Ticker */}
            <div className="bg-white rounded-xl p-3 border border-[#E2EDE0] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#15351A]">Today's Scrap Rates</span>
                <button
                  onClick={() => setShowPriceBoard(true)}
                  className="text-[11px] text-[#35A853] font-semibold hover:underline"
                >
                  View All Rates →
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {materials.slice(0, 4).map(mat => (
                  <div key={mat.id} className="min-w-[120px] p-2 bg-[#F4F9F1] rounded-lg border border-[#E2EDE0] shrink-0">
                    <p className="font-semibold text-[#15351A] truncate">{mat.name.split(' ')[0]}</p>
                    <p className="text-[#35A853] font-bold mt-1 tabular-nums">
                      ₹{mat.indicative_price} <span className="text-[10px] text-[#6B7C6B]">/ {mat.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Lots & Offers Alert */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-[#15351A] uppercase tracking-wider">
                  Active Scrap Lots ({myLots.length})
                </h2>
                <button
                  onClick={() => setCurrentTab('my-scrap')}
                  className="text-xs text-[#35A853] font-semibold"
                >
                  Manage All
                </button>
              </div>

              <div className="space-y-2.5">
                {myLots.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-[#E2EDE0] text-center">
                    <Recycle className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-[#6B7C6B]">No scrap lots created yet.</p>
                    <button
                      onClick={() => setCurrentTab('add-scrap')}
                      className="mt-2 px-3 py-1.5 bg-[#35A853] text-white rounded-lg text-xs font-semibold"
                    >
                      + Add First Scrap Lot
                    </button>
                  </div>
                ) : (
                  myLots.map(lot => {
                    const offers = dbStore.getOffersForLot(lot.id);
                    return (
                      <div
                        key={lot.id}
                        onClick={() => setSelectedLot(lot)}
                        className="p-3 bg-white rounded-xl border border-[#E2EDE0] hover:border-[#35A853] transition-colors cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-[#15351A] truncate">
                              {lot.title}
                            </h3>
                            <p className="text-[11px] text-[#6B7C6B] mt-0.5">
                              {lot.weight} kg · {lot.condition}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-[#35A853] tabular-nums block">
                              ₹{lot.estimated_value.toLocaleString('en-IN')}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                              lot.status === 'offer_received'
                                ? 'bg-amber-100 text-amber-800'
                                : lot.status === 'offer_accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lot.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {lot.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {offers.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#E2EDE0] flex items-center justify-between text-xs bg-emerald-50/50 -mx-3 -mb-3 p-2 px-3 rounded-b-xl">
                            <span className="font-semibold text-emerald-800 text-[11px]">
                              🎉 {offers.length} Offer{offers.length > 1 ? 's' : ''} Received
                            </span>
                            <span className="text-[11px] text-[#35A853] font-bold">
                              Review &amp; Accept →
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY SCRAP */}
        {currentTab === 'my-scrap' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#15351A]">
                {t.myScrap} ({myLots.length})
              </h2>
              <button
                onClick={() => setCurrentTab('add-scrap')}
                className="px-3 py-1.5 bg-[#35A853] text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.addScrap}</span>
              </button>
            </div>

            <div className="space-y-3">
              {myLots.map(lot => {
                const offers = dbStore.getOffersForLot(lot.id);
                const passport = dbStore.getPassports().find(p => p.material_lot_id === lot.id);

                return (
                  <div key={lot.id} className="bg-white rounded-xl p-3.5 border border-[#E2EDE0] shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#6B7C6B] font-medium block">
                          LOT #{lot.id.substring(4)} · {new Date(lot.created_at).toLocaleDateString()}
                        </span>
                        <h3 className="text-xs font-bold text-[#15351A]">{lot.title}</h3>
                      </div>
                      <span className="text-xs font-bold text-[#35A853] tabular-nums">
                        ₹{lot.estimated_value.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B7C6B] line-clamp-2">
                      {lot.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#E2EDE0]">
                      <span className="text-[#6B7C6B]">
                        Weight: <strong className="text-[#15351A]">{lot.weight} kg</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {passport && (
                          <button
                            onClick={() => setShowPassportModal(passport)}
                            className="text-[#35A853] font-semibold flex items-center gap-1 hover:underline"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Passport</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedLot(lot)}
                          className="px-2.5 py-1 bg-[#F4F9F1] hover:bg-[#E2EDE0] text-[#15351A] font-semibold rounded-md border border-[#E2EDE0]"
                        >
                          Details ({offers.length})
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ADD SCRAP */}
        {currentTab === 'add-scrap' && (
          <form onSubmit={handleCreateListing} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#15351A]">{t.addScrap}</h2>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-xs text-[#35A853] font-semibold hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.saveDraft}</span>
              </button>
            </div>

            {/* Material Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                {t.materialCategory}
              </label>
              <select
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                required
              >
                {materials.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} (Indicative: ₹{mat.indicative_price}/{mat.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Weight & Live Price Calculation */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  {t.estimatedWeight}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  Condition
                </label>
                <select
                  value={conditionInput}
                  onChange={e => setConditionInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A]"
                >
                  <option value="Clean / Sorted">Clean / Sorted</option>
                  <option value="Mixed Scrap">Mixed Scrap</option>
                  <option value="Industrial Offcut">Industrial Offcut</option>
                  <option value="Electronic Scrap">Electronic Scrap</option>
                  <option value="Baled">Baled</option>
                </select>
              </div>
            </div>

            {/* Live Calculated Scrap Value Card */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">{t.estimatedValue}</span>
                <span className="text-base font-extrabold text-[#35A853] tabular-nums">
                  ₹{estimatedLotValue.toLocaleString('en-IN')}.00
                </span>
              </div>
              <p className="text-[10px] text-emerald-800/80 mt-1 leading-snug">
                {t.indicativeNote}
              </p>
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Scrap Lot Title (Optional)
              </label>
              <input
                type="text"
                value={scrapTitle}
                onChange={e => setScrapTitle(e.target.value)}
                placeholder="e.g. 45kg Heavy Stripped Copper Wires"
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A] focus:outline-none"
              />
            </div>

            {/* Photo Upload Simulation */}
            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Scrap Photo
              </label>
              <div className="flex items-center gap-2">
                <img
                  src={selectedImage}
                  alt="Scrap preview"
                  className="w-14 h-14 rounded-xl object-cover border border-[#E2EDE0]"
                />
                <div className="flex-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleImages = [
                        'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80',
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
                        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
                        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
                      ];
                      const next = sampleImages[(sampleImages.indexOf(selectedImage) + 1) % sampleImages.length];
                      setSelectedImage(next);
                    }}
                    className="w-full py-1.5 px-3 bg-white hover:bg-gray-50 border border-[#E2EDE0] rounded-lg text-xs font-semibold text-[#15351A] flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#35A853]" />
                    <span>Take / Choose Photo</span>
                  </button>
                  <p className="text-[10px] text-[#6B7C6B]">Image attached for recycler inspection</p>
                </div>
              </div>
            </div>

            {/* Pickup Location & Schedule */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  Pickup Time
                </label>
                <select
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#E2EDE0] bg-white text-xs text-[#15351A]"
                >
                  <option value="09:00 AM - 12:00 PM">Morning (9 AM - 12 PM)</option>
                  <option value="12:00 PM - 03:00 PM">Afternoon (12 PM - 3 PM)</option>
                  <option value="03:00 PM - 06:00 PM">Evening (3 PM - 6 PM)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
              >
                {t.submitListing}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: EARNINGS */}
        {currentTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E2EDE0] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6B7C6B] font-medium">{t.totalEarnings}</span>
                <Wallet className="w-4 h-4 text-[#35A853]" />
              </div>
              <div className="text-2xl font-extrabold text-[#15351A] tabular-nums">
                ₹{totalRecordedEarnings.toLocaleString('en-IN')}.00
              </div>
              <p className="text-[11px] text-[#6B7C6B] mt-1">
                From {completedOrders.length} completed transactions
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#15351A] uppercase tracking-wider">
                Transaction History
              </h3>

              {completedOrders.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-dashed border-[#E2EDE0] text-center text-xs text-[#6B7C6B]">
                  No completed transactions yet. Accept an offer to start selling!
                </div>
              ) : (
                completedOrders.map(ord => {
                  const payment = ord.payment;
                  return (
                    <div key={ord.id} className="p-3 bg-white rounded-xl border border-[#E2EDE0] shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#15351A]">{ord.order_code}</span>
                        <span className="text-xs font-extrabold text-[#35A853] tabular-nums">
                          +₹{ord.final_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6B7C6B]">
                        <span>Weight: {ord.final_weight} kg</span>
                        <span className="font-medium text-emerald-700">Paid via {payment?.payment_method || 'UPI'}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono truncate">
                        Ref: {payment?.payment_reference || 'CONFIRMED'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {currentTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E2EDE0] shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#35A853] text-white flex items-center justify-center font-bold text-lg">
                {currentUser?.full_name?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#15351A] truncate">{currentUser?.full_name}</h3>
                <p className="text-xs text-[#6B7C6B]">{currentUser?.phone}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 mt-1">
                  Verified Collector
                </span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-white rounded-xl p-4 border border-[#E2EDE0] space-y-2">
              <label className="block text-xs font-bold text-[#15351A] uppercase tracking-wider">
                {t.selectLanguage}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['mr', 'hi', 'en'] as LanguageCode[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all ${
                      selectedLanguage === lang
                        ? 'bg-[#35A853] text-white border-[#35A853]'
                        : 'bg-white text-[#15351A] border-[#E2EDE0]'
                    }`}
                  >
                    {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setCurrentStep('welcome')}
                className="w-full py-2.5 px-4 bg-white border border-[#E2EDE0] hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-semibold text-[#15351A] transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E2EDE0] px-2 flex items-center justify-around z-20 shadow-md">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center justify-center py-1 flex-1 ${currentTab === 'home' ? 'text-[#35A853]' : 'text-[#6B7C6B]'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">{t.home}</span>
        </button>

        <button
          onClick={() => setCurrentTab('my-scrap')}
          className={`flex flex-col items-center justify-center py-1 flex-1 ${currentTab === 'my-scrap' ? 'text-[#35A853]' : 'text-[#6B7C6B]'}`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">{t.myScrap}</span>
        </button>

        <button
          onClick={() => setCurrentTab('add-scrap')}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-[#35A853] text-white flex items-center justify-center shadow-md hover:bg-[#2e9147] transition-all">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-[#15351A] mt-0.5">{t.addScrap}</span>
        </button>

        <button
          onClick={() => setCurrentTab('earnings')}
          className={`flex flex-col items-center justify-center py-1 flex-1 ${currentTab === 'earnings' ? 'text-[#35A853]' : 'text-[#6B7C6B]'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">{t.earnings}</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center py-1 flex-1 ${currentTab === 'profile' ? 'text-[#35A853]' : 'text-[#6B7C6B]'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">{t.profile}</span>
        </button>
      </div>

      {/* MODAL 1: Scrap Listing Details & Offers */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-4 space-y-4 border border-[#E2EDE0] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <h3 className="text-sm font-bold text-[#15351A]">Scrap Lot Details</h3>
              <button
                onClick={() => setSelectedLot(null)}
                className="p-1 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedLot.images?.[0] && (
              <img
                src={selectedLot.images[0]}
                alt={selectedLot.title}
                className="w-full h-36 object-cover rounded-xl border border-[#E2EDE0]"
              />
            )}

            <div>
              <h4 className="text-sm font-bold text-[#15351A]">{selectedLot.title}</h4>
              <p className="text-xs text-[#6B7C6B] mt-1">{selectedLot.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span>Weight: <strong>{selectedLot.weight} kg</strong></span>
                <span>Value: <strong className="text-[#35A853]">₹{selectedLot.estimated_value}</strong></span>
              </div>
            </div>

            {/* Offers List */}
            <div className="pt-2 border-t border-[#E2EDE0]">
              <h4 className="text-xs font-bold text-[#15351A] uppercase tracking-wider mb-2">
                Recycler Offers Received ({dbStore.getOffersForLot(selectedLot.id).length})
              </h4>

              <div className="space-y-2">
                {dbStore.getOffersForLot(selectedLot.id).length === 0 ? (
                  <p className="text-xs text-[#6B7C6B] py-3 text-center">
                    No offers received yet. Recyclers in your area are being notified.
                  </p>
                ) : (
                  dbStore.getOffersForLot(selectedLot.id).map(offer => (
                    <div key={offer.id} className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0] space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#15351A]">
                            {offer.recycler?.business_name || 'Verified Recycler'}
                          </p>
                          <p className="text-[10px] text-[#6B7C6B]">
                            {offer.pickup_proposal}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-[#35A853] tabular-nums">
                            ₹{offer.offered_price} <span className="text-[10px] text-[#6B7C6B]">/ kg</span>
                          </p>
                          <p className="text-[10px] font-semibold text-[#15351A]">
                            Total: ₹{offer.total_offered_amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {offer.status === 'pending' ? (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="flex-1 py-1.5 px-3 bg-[#35A853] hover:bg-[#2e9147] text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Accept Offer
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Status: {offer.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Digital Scrap Passport Viewer */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#35A853]" />
                <h3 className="font-bold text-[#15351A] text-sm">Digital Scrap Passport</h3>
              </div>
              <button onClick={() => setShowPassportModal(null)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Passport Certificate Card */}
            <div className="p-4 bg-gradient-to-b from-[#F4F9F1] to-white rounded-xl border border-[#E2EDE0] text-center space-y-3">
              <div className="flex items-center justify-between text-[11px] text-[#6B7C6B]">
                <span>GOVERNMENT TRACEABILITY PASSPORT</span>
                <span className="font-bold text-[#35A853]">VERIFIED</span>
              </div>

              {passportQrUrl ? (
                <div className="p-2 bg-white rounded-xl inline-block shadow-xs border border-[#E2EDE0]">
                  <img src={passportQrUrl} alt="Scrap QR code" className="w-44 h-44 mx-auto" />
                </div>
              ) : (
                <div className="w-44 h-44 bg-gray-100 rounded-xl mx-auto flex items-center justify-center text-xs text-gray-400">
                  Generating QR...
                </div>
              )}

              <div>
                <p className="text-xs font-mono font-bold text-[#15351A] tracking-wider">
                  {showPassportModal.passport_code}
                </p>
                <p className="text-[11px] text-[#6B7C6B] mt-0.5">
                  Scan to verify origin, weight, and chain of custody
                </p>
              </div>

              <div className="text-left text-xs bg-white p-3 rounded-lg border border-[#E2EDE0] space-y-1">
                <p><strong>Lot:</strong> {showPassportModal.lot?.title || 'Material Lot'}</p>
                <p><strong>Weight:</strong> {showPassportModal.lot?.weight || 0} kg</p>
                <p><strong>Status:</strong> <span className="text-[#35A853] font-bold">{showPassportModal.status.toUpperCase()}</span></p>
              </div>
            </div>

            {/* Traceability Timeline */}
            <div>
              <h4 className="text-xs font-bold text-[#15351A] uppercase tracking-wider mb-2">
                Chain of Custody Events
              </h4>
              <div className="space-y-2 text-xs">
                {(showPassportModal.events || []).map(evt => (
                  <div key={evt.id} className="flex gap-2.5 items-start">
                    <span className="w-2 h-2 rounded-full bg-[#35A853] mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-[#15351A] leading-tight">
                        {evt.event_type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-[11px] text-[#6B7C6B]">
                        By {evt.actor_name} ({evt.actor_role}) · {new Date(evt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Scrap Price Board */}
      {showPriceBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-2xl max-h-[85vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#35A853]" />
                <h3 className="font-bold text-[#15351A] text-sm">Transparent Price Board</h3>
              </div>
              <button onClick={() => setShowPriceBoard(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {materials.map(mat => (
                <div key={mat.id} className="p-2.5 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#15351A]">{mat.name}</p>
                    <p className="text-[10px] text-[#6B7C6B]">{mat.category} · {mat.subtype}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-[#35A853] tabular-nums">
                      ₹{mat.indicative_price} <span className="text-[10px] text-[#6B7C6B]">/ {mat.unit}</span>
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-800">
                      {mat.price_trend === 'up' ? '▲ Trending Up' : mat.price_trend === 'down' ? '▼ Softening' : '● Stable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Recycler Discovery */}
      {showRecyclerDiscovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-2xl max-h-[85vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#35A853]" />
                <h3 className="font-bold text-[#15351A] text-sm">Verified Recyclers Directory</h3>
              </div>
              <button onClick={() => setShowRecyclerDiscovery(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {dbStore.getRecyclers().map(rec => (
                <div key={rec.id} className="p-3 bg-white rounded-xl border border-[#E2EDE0] shadow-2xs space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#15351A] flex items-center gap-1">
                        <span>{rec.business_name}</span>
                        {rec.verification_status === 'approved' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                            ✓ Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-[#6B7C6B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#35A853]" />
                        <span>{rec.address}, {rec.city}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#6B7C6B] bg-[#F4F9F1] p-2 rounded-lg">
                    <span>Contact: {rec.owner_name} ({rec.profile?.phone || '+91 98XXX XXXXX'})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Offline Drafts & Sync Drawer */}
      {showSyncDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-2xl max-h-[85vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#35A853]" />
                <h3 className="font-bold text-[#15351A] text-sm">Offline SQLite Sync Queue</h3>
              </div>
              <button onClick={() => setShowSyncDrawer(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {syncRecords.length === 0 ? (
                <p className="text-xs text-[#6B7C6B] py-4 text-center">
                  All local operations are synchronized with Supabase PostgreSQL!
                </p>
              ) : (
                syncRecords.map(rec => (
                  <div key={rec.id} className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#15351A]">{rec.payload?.title || 'Draft Lot'}</p>
                      <p className="text-[10px] text-[#6B7C6B]">{rec.payload?.weight} kg · Status: {rec.sync_status}</p>
                    </div>
                    {rec.sync_status === 'saved_locally' ? (
                      <button
                        onClick={() => {
                          dbStore.syncPendingRecord(rec.id);
                          alert('Synchronized with shared PostgreSQL backend!');
                        }}
                        className="px-2.5 py-1 bg-[#35A853] text-white rounded-lg text-xs font-bold"
                      >
                        Push Sync
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs">✓ Synced</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
