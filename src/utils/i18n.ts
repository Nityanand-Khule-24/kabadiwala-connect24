import { LanguageCode } from '../types';

export interface TranslationDict {
  appName: string;
  tagline: string;
  selectLanguage: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  login: string;
  register: string;
  createAccount: string;
  phoneOrEmail: string;
  phoneNumber: string;
  email: string;
  password: string;
  fullName: string;
  address: string;
  city: string;
  pincode: string;
  todayEarnings: string;
  totalEarnings: string;
  activeListings: string;
  pendingOffers: string;
  quickActions: string;
  addScrap: string;
  viewPrices: string;
  findRecycler: string;
  myScrap: string;
  earnings: string;
  profile: string;
  home: string;
  materialCategory: string;
  estimatedWeight: string;
  estimatedValue: string;
  indicativeNote: string;
  submitListing: string;
  saveDraft: string;
  offlineDrafts: string;
  myPassport: string;
  traceabilityChain: string;
  voiceGuide: string;
  listenInMarathi: string;
  listenInHindi: string;
  listenInEnglish: string;
  offersReceived: string;
  acceptOffer: string;
  rejectOffer: string;
  pickupScheduled: string;
  handoverConfirm: string;
  paymentStatus: string;
  logout: string;
}

export const translations: Record<LanguageCode, TranslationDict> = {
  en: {
    appName: 'Kabadiwala Connect',
    tagline: 'Turning Scrap into Opportunity.',
    selectLanguage: 'Choose Your Language',
    welcomeTitle: 'Direct Market Access for Informal Scrap Collectors',
    welcomeSubtitle: 'Discover fair scrap rates, connect with verified recyclers, and build your digital transaction passport.',
    login: 'Login',
    register: 'Sign Up',
    createAccount: 'Create Collector Account',
    phoneOrEmail: 'Phone Number or Email',
    phoneNumber: '10-digit Mobile Number',
    email: 'Email (Optional)',
    password: 'Password',
    fullName: 'Full Name',
    address: 'Collection / Home Address',
    city: 'City',
    pincode: 'PIN Code',
    todayEarnings: "Today's Earnings",
    totalEarnings: 'Total Recorded Earnings',
    activeListings: 'Active Scrap Lots',
    pendingOffers: 'Offers Received',
    quickActions: 'Quick Actions',
    addScrap: 'Add Scrap Lot',
    viewPrices: 'Scrap Price Board',
    findRecycler: 'Verified Recyclers',
    myScrap: 'My Scrap',
    earnings: 'Earnings',
    profile: 'Profile',
    home: 'Home',
    materialCategory: 'Material Type',
    estimatedWeight: 'Estimated Weight (kg)',
    estimatedValue: 'Estimated Market Value',
    indicativeNote: 'Calculated using today\'s transparent baseline price. Actual payment confirmed at weigh-in.',
    submitListing: 'Publish Scrap Lot',
    saveDraft: 'Save Offline Draft',
    offlineDrafts: 'Offline Drafts & Sync',
    myPassport: 'Digital Scrap Passport',
    traceabilityChain: 'Recycling Traceability Chain',
    voiceGuide: 'Voice Guidance',
    listenInMarathi: 'मराठीत ऐका',
    listenInHindi: 'हिंदी में सुनें',
    listenInEnglish: 'Listen in English',
    offersReceived: 'Recycler Offers',
    acceptOffer: 'Accept Offer',
    rejectOffer: 'Decline',
    pickupScheduled: 'Pickup Scheduled',
    handoverConfirm: 'Confirm Handover',
    paymentStatus: 'Payment Status',
    logout: 'Log Out',
  },
  hi: {
    appName: 'कबाड़ीवाला कनेक्ट',
    tagline: 'कबाड़ से अवसर का निर्माण।',
    selectLanguage: 'अपनी भाषा चुनें',
    welcomeTitle: 'कबाड़ संग्राहकों के लिए सीधा और पारदर्शी बाजार',
    welcomeSubtitle: 'सटीक दाम जानें, सत्यापित रीसायकलर से जुड़ें और अपना डिजिटल स्क्रैप पासपोर्ट बनाएं।',
    login: 'लॉग इन करें',
    register: 'पंजीकरण करें',
    createAccount: 'कलेक्टर खाता बनाएं',
    phoneOrEmail: 'मोबाइल नंबर या ईमेल',
    phoneNumber: '10 अंकों का मोबाइल नंबर',
    email: 'ईमेल (वैकल्पिक)',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    address: 'पता / कबाड़ स्थान',
    city: 'शहर',
    pincode: 'पिन कोड',
    todayEarnings: 'आज की कमाई',
    totalEarnings: 'कुल दर्ज कमाई',
    activeListings: 'सक्रिय कबाड़ लॉट',
    pendingOffers: 'प्राप्त ऑफर',
    quickActions: 'त्वरित कार्य',
    addScrap: 'कबाड़ जोड़ें',
    viewPrices: 'दाम सूची',
    findRecycler: 'रीसायकलर खोजें',
    myScrap: 'मेरा कबाड़',
    earnings: 'कमाई',
    profile: 'प्रोफ़ाइल',
    home: 'होम',
    materialCategory: 'सामग्री का प्रकार',
    estimatedWeight: 'अनुमानित वजन (किलो)',
    estimatedValue: 'अनुमानित बाजार मूल्य',
    indicativeNote: 'आज के पारदर्शी बेस मूल्य के अनुसार गणना। अंतिम भुगतान तौल के बाद तय होगा।',
    submitListing: 'कबाड़ लॉट प्रकाशित करें',
    saveDraft: 'ऑफ़लाइन ड्राफ्ट सहेजें',
    offlineDrafts: 'ऑफ़लाइन ड्राफ्ट और सिंक',
    myPassport: 'डिजिटल स्क्रैप पासपोर्ट',
    traceabilityChain: 'रीसाइक्लिंग ट्रैसेबिलिटी चेन',
    voiceGuide: 'ध्वनि मार्गदर्शन',
    listenInMarathi: 'मराठीत ऐका',
    listenInHindi: 'हिंदी में सुनें',
    listenInEnglish: 'Listen in English',
    offersReceived: 'रीसायकलर ऑफ़र',
    acceptOffer: 'ऑफ़र स्वीकार करें',
    rejectOffer: 'अस्वीकार करें',
    pickupScheduled: 'पिकअप निर्धारित',
    handoverConfirm: 'हैंडओवर पुष्टि करें',
    paymentStatus: 'भुगतान स्थिति',
    logout: 'लॉग आउट',
  },
  mr: {
    appName: 'कबाडीवाला कनेक्ट',
    tagline: 'भंगारातून संधीची निर्मिती.',
    selectLanguage: 'तुमची भाषा निवडा',
    welcomeTitle: 'भंगार संकलकांसाठी थेट आणि पारदर्शक बाजारपेठ',
    welcomeSubtitle: 'योग्य बाजारभाव मिळवा, पडताळणी केलेल्या रिसायकलरशी जोडा आणि तुमचा डिजिटल पासपोर्ट बनवा.',
    login: 'लॉगिन करा',
    register: 'नोंदणी करा',
    createAccount: 'संकलक खाते तयार करा',
    phoneOrEmail: 'फोन नंबर किंवा ईमेल',
    phoneNumber: '१० अंकी मोबाईल नंबर',
    email: 'ईमेल (ऐच्छिक)',
    password: 'पासवर्ड',
    fullName: 'पूर्ण नाव',
    address: 'पत्ता / भंगार संकलन ठिकाण',
    city: 'शहर',
    pincode: 'पिन कोड',
    todayEarnings: 'आजची कमाई',
    totalEarnings: 'एकूण नोंदवलेली कमाई',
    activeListings: 'सक्रिय भंगार लॉट',
    pendingOffers: 'आलेले ऑफर्स',
    quickActions: 'द्रुत कृती',
    addScrap: 'भंगार जोडा',
    viewPrices: 'भाव तक्ता',
    findRecycler: 'रिसायकलर शोधा',
    myScrap: 'माझे भंगार',
    earnings: 'कमाई',
    profile: 'प्रोफाइल',
    home: 'मुख्यपृष्ठ',
    materialCategory: 'साहित्याचा प्रकार',
    estimatedWeight: 'अंदाजे वजन (किलो)',
    estimatedValue: 'अंदाजे बाजारभाव',
    indicativeNote: 'आजच्या पारदर्शक मूळ भावावर आधारित. अंतिम रक्कम वजनानंतर निश्चित होईल.',
    submitListing: 'भंगार लॉट प्रसिद्ध करा',
    saveDraft: 'ऑफलाईन मसुदा जतन करा',
    offlineDrafts: 'ऑफलाईन ड्राफ्ट व सिंक',
    myPassport: 'डिजिटल स्क्रॅप पासपोर्ट',
    traceabilityChain: 'पुनर्वापर साखळी मागोवा',
    voiceGuide: 'व्हॉइस मार्गदर्शन',
    listenInMarathi: 'मराठीत ऐका',
    listenInHindi: 'हिंदी में सुनें',
    listenInEnglish: 'Listen in English',
    offersReceived: 'रिसायकलर ऑफर्स',
    acceptOffer: 'ऑफर स्वीकारा',
    rejectOffer: 'नाकारा',
    pickupScheduled: 'पिकअप नियोजित',
    handoverConfirm: 'हस्तांतरण निश्चित करा',
    paymentStatus: 'पेमेंट स्थिती',
    logout: 'बाहेर पडा',
  },
};
