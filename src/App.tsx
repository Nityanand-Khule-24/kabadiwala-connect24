import { useState, useEffect } from 'react';
import { dbStore } from './services/dbStore';
import { CollectorMobileApp } from './components/collector/CollectorMobileApp';
import { RecyclerWebDashboard } from './components/recycler/RecyclerWebDashboard';
import { AdminWebDashboard } from './components/admin/AdminWebDashboard';
import { PassportVerifier } from './components/passport/PassportVerifier';
import { SpecsExplorer } from './components/specs/SpecsExplorer';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import {
  Recycle,
  Smartphone,
  Factory,
  ShieldAlert,
  QrCode,
  FileCode,
  Bell,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [activePortal, setActivePortal] = useState<'collector' | 'recycler' | 'admin' | 'passport' | 'specs'>('collector');
  const [mobileFrame, setMobileFrame] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const [currentUser, setCurrentUser] = useState(dbStore.getCurrentUser());
  const [notificationsCount, setNotificationsCount] = useState(dbStore.getNotifications().length);

  useEffect(() => {
    const sync = () => {
      setCurrentUser(dbStore.getCurrentUser());
      setNotificationsCount(dbStore.getNotifications().length);
    };
    sync();
    return dbStore.subscribe(sync);
  }, []);

  const demoAccounts = [
    { id: 'prof-coll-1', name: 'Rameshwar Pawar', role: 'collector', label: 'Collector (Pune - Marathi)' },
    { id: 'prof-coll-2', name: 'Santosh Yadav', role: 'collector', label: 'Collector (Dharavi - Hindi)' },
    { id: 'prof-rec-1', name: 'Vikramaditya Singhania', role: 'recycler', label: 'Recycler (GreenEarth Smelters)' },
    { id: 'prof-rec-4', name: 'Farhan Sheikh', role: 'recycler', label: 'Recycler (Apex E-Waste Hub)' },
    { id: 'prof-admin-1', name: 'Dr. Anand Kulkarni', role: 'admin', label: 'Admin (Master Governance)' },
  ];

  const handleSelectAccount = (acc: typeof demoAccounts[0]) => {
    dbStore.switchDemoAccount(acc.id);
    setShowAccountDropdown(false);
    if (acc.role === 'collector') setActivePortal('collector');
    else if (acc.role === 'recycler') setActivePortal('recycler');
    else if (acc.role === 'admin') setActivePortal('admin');
  };

  const handleResetSeed = () => {
    if (confirm('Reset database to clean initial demonstration dataset?')) {
      dbStore.resetToDefaultSeed();
      alert('Database reset to initial state with 5 collectors, 5 recyclers, 12 materials, and demo lots.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9F1] text-[#15351A] flex flex-col font-sans">
      {/* Universal Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2EDE0] px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xs">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#35A853] text-white flex items-center justify-center shadow-xs">
            <Recycle className="w-5 h-5" />
          </div>
          <div className="cursor-pointer" onClick={() => setActivePortal('collector')}>
            <span className="text-base font-extrabold tracking-tight text-[#15351A] block leading-tight">
              Kabadiwala Connect
            </span>
            <span className="text-[10px] text-[#6B7C6B] block">Digital Scrap Passport Network</span>
          </div>
        </div>

        {/* Portal Switcher Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#F4F9F1] p-1 rounded-2xl border border-[#E2EDE0] text-xs font-semibold">
          <button
            onClick={() => setActivePortal('collector')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activePortal === 'collector'
                ? 'bg-white text-[#15351A] shadow-xs font-bold'
                : 'text-[#6B7C6B] hover:text-[#15351A]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#35A853]" />
            <span>Collector Mobile</span>
          </button>

          <button
            onClick={() => setActivePortal('recycler')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activePortal === 'recycler'
                ? 'bg-white text-[#15351A] shadow-xs font-bold'
                : 'text-[#6B7C6B] hover:text-[#15351A]'
            }`}
          >
            <Factory className="w-4 h-4 text-[#35A853]" />
            <span>Recycler Portal</span>
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activePortal === 'admin'
                ? 'bg-white text-[#15351A] shadow-xs font-bold'
                : 'text-[#6B7C6B] hover:text-[#15351A]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#35A853]" />
            <span>Admin Console</span>
          </button>

          <button
            onClick={() => setActivePortal('passport')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activePortal === 'passport'
                ? 'bg-white text-[#15351A] shadow-xs font-bold'
                : 'text-[#6B7C6B] hover:text-[#15351A]'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#35A853]" />
            <span>QR Passport</span>
          </button>

          <button
            onClick={() => setActivePortal('specs')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activePortal === 'specs'
                ? 'bg-white text-[#15351A] shadow-xs font-bold'
                : 'text-[#6B7C6B] hover:text-[#15351A]'
            }`}
          >
            <FileCode className="w-4 h-4 text-[#35A853]" />
            <span>Architecture</span>
          </button>
        </nav>

        {/* Right Actions: Demo User Switcher & Notifications */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Account Fast Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="px-3 py-1.5 bg-[#F4F9F1] hover:bg-[#E2EDE0] border border-[#E2EDE0] rounded-xl text-xs font-semibold text-[#15351A] flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#35A853]" />
              <span className="hidden sm:inline font-bold">{currentUser?.full_name?.split(' ')[0] || 'Switch Demo'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2EDE0] p-2 z-50 text-xs space-y-1">
                <p className="px-2 py-1 text-[10px] uppercase font-bold text-[#6B7C6B]">
                  Switch Role / Persona:
                </p>
                {demoAccounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between ${
                      currentUser?.id === acc.id ? 'bg-[#F4F9F1] font-bold text-[#15351A]' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-[#15351A]">{acc.name}</p>
                      <p className="text-[10px] text-[#6B7C6B]">{acc.label}</p>
                    </div>
                    {currentUser?.id === acc.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#35A853]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Seed Button */}
          <button
            onClick={handleResetSeed}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-[#F4F9F1] rounded-xl transition-colors"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(true)}
            className="p-2 relative text-gray-700 hover:text-gray-900 hover:bg-[#F4F9F1] rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#15351A]" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#7ED957] ring-2 ring-white" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation bar for small screens */}
      <div className="md:hidden flex items-center justify-around bg-white border-b border-[#E2EDE0] p-2 text-xs font-semibold">
        <button
          onClick={() => setActivePortal('collector')}
          className={`px-2 py-1 rounded-lg ${activePortal === 'collector' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B]'}`}
        >
          Collector
        </button>
        <button
          onClick={() => setActivePortal('recycler')}
          className={`px-2 py-1 rounded-lg ${activePortal === 'recycler' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B]'}`}
        >
          Recycler
        </button>
        <button
          onClick={() => setActivePortal('admin')}
          className={`px-2 py-1 rounded-lg ${activePortal === 'admin' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B]'}`}
        >
          Admin
        </button>
        <button
          onClick={() => setActivePortal('passport')}
          className={`px-2 py-1 rounded-lg ${activePortal === 'passport' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B]'}`}
        >
          Passport
        </button>
        <button
          onClick={() => setActivePortal('specs')}
          className={`px-2 py-1 rounded-lg ${activePortal === 'specs' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B]'}`}
        >
          Docs
        </button>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6">
        {activePortal === 'collector' && (
          <div className="w-full flex flex-col items-center">
            {/* View Mode Toolbar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-[#6B7C6B]">
                Scrap Collector Mobile Experience (Expo Go Compatible)
              </span>
              <button
                onClick={() => setMobileFrame(!mobileFrame)}
                className="text-xs text-[#35A853] font-bold hover:underline"
              >
                {mobileFrame ? 'Expand Full View' : 'Show Phone Shell'}
              </button>
            </div>

            {/* Mobile Device Shell or Full Width */}
            <div
              className={`w-full transition-all duration-300 ${
                mobileFrame
                  ? 'max-w-[420px] h-[780px] bg-white rounded-[36px] shadow-2xl border-[8px] border-[#15351A] overflow-hidden flex flex-col relative ring-1 ring-black/10'
                  : 'max-w-2xl h-[780px] bg-white rounded-3xl shadow-md border border-[#E2EDE0] overflow-hidden flex flex-col'
              }`}
            >
              {/* Phone Speaker Notch */}
              {mobileFrame && (
                <div className="w-full bg-[#15351A] py-1 flex justify-center items-center shrink-0">
                  <div className="w-20 h-3 bg-black/40 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-neutral-700 mr-2" />
                    <div className="w-8 h-1 bg-neutral-700 rounded-full" />
                  </div>
                </div>
              )}

              {/* Mobile App Component */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <CollectorMobileApp />
              </div>
            </div>
          </div>
        )}

        {activePortal === 'recycler' && (
          <div className="w-full max-w-7xl bg-white rounded-3xl shadow-sm border border-[#E2EDE0] overflow-hidden">
            <RecyclerWebDashboard />
          </div>
        )}

        {activePortal === 'admin' && (
          <div className="w-full max-w-7xl bg-white rounded-3xl shadow-sm border border-[#E2EDE0] overflow-hidden">
            <AdminWebDashboard />
          </div>
        )}

        {activePortal === 'passport' && (
          <div className="w-full max-w-5xl">
            <PassportVerifier />
          </div>
        )}

        {activePortal === 'specs' && (
          <div className="w-full max-w-5xl">
            <SpecsExplorer />
          </div>
        )}
      </div>

      {/* Global Real-time Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userId={currentUser?.id}
      />
    </div>
  );
}
