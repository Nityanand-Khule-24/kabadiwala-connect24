import { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { generateQrDataUrl } from '../../services/qrPassport';
import { ScrapPassport } from '../../types';
import {
  QrCode,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Printer,
  Sparkles
} from 'lucide-react';

export function PassportVerifier() {
  const [passports, setPassports] = useState<ScrapPassport[]>([]);
  const [searchCode, setSearchCode] = useState('KC-PASSPORT-2026-90412');
  const [selectedPassport, setSelectedPassport] = useState<ScrapPassport | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const list = dbStore.getPassports();
      setPassports(list);
      if (!selectedPassport && list.length > 0) {
        setSelectedPassport(list[0]);
        setSearchCode(list[0].passport_code);
      }
    };
    update();
    return dbStore.subscribe(update);
  }, [selectedPassport]);

  useEffect(() => {
    if (selectedPassport) {
      generateQrDataUrl(selectedPassport.qr_payload).then(url => setQrUrl(url));
    }
  }, [selectedPassport]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = dbStore.getPassportByCode(searchCode.trim());
    if (found) {
      setSelectedPassport(found);
    } else {
      alert(`No passport record found for code "${searchCode}". Check demo list below.`);
    }
  };

  return (
    <div className="w-full min-h-[700px] p-6 bg-[#F4F9F1] flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#35A853]" />
            <span>Cryptographic Traceability Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#15351A]">
            Digital Scrap Passport Verifier
          </h1>
          <p className="text-xs text-[#6B7C6B] max-w-md mx-auto">
            Scan or enter any Digital Scrap Passport identifier to verify origin collector, certified weight, buyer recycler, and audited recycling steps.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 bg-white p-2 rounded-2xl border border-[#E2EDE0] shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              placeholder="e.g. KC-PASSPORT-2026-90412"
              className="w-full pl-10 pr-3 py-2 text-xs font-mono font-bold text-[#15351A] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs transition-colors shrink-0"
          >
            Verify Passport
          </button>
        </form>

        {/* Quick Demo Passport Selector */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-[#6B7C6B] text-[11px] shrink-0 font-medium">Demo Passports:</span>
          {passports.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPassport(p);
                setSearchCode(p.passport_code);
              }}
              className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] transition-colors shrink-0 ${
                selectedPassport?.id === p.id
                  ? 'bg-[#15351A] text-white border-[#15351A]'
                  : 'bg-white text-[#15351A] border-[#E2EDE0] hover:bg-[#F4F9F1]'
              }`}
            >
              {p.passport_code}
            </button>
          ))}
        </div>

        {/* Verified Passport Card */}
        {selectedPassport && (
          <div className="bg-white rounded-3xl border border-[#E2EDE0] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E2EDE0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#15351A]">
                    {selectedPassport.passport_code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    STATUS: {selectedPassport.status.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#15351A] mt-1">
                  {selectedPassport.lot?.title || 'Material Lot'}
                </h2>
                <p className="text-xs text-[#6B7C6B]">
                  Issued on {new Date(selectedPassport.created_at).toLocaleDateString()} · Registered under Kabadiwala Connect
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#F4F9F1] hover:bg-[#E2EDE0] text-[#15351A] font-bold rounded-xl text-xs border border-[#E2EDE0] flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>

            {/* Middle Grid: QR code and Verified Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="p-4 bg-[#F4F9F1] rounded-2xl border border-[#E2EDE0] text-center">
                {qrUrl ? (
                  <div className="p-2 bg-white rounded-xl inline-block shadow-2xs border border-[#E2EDE0]">
                    <img src={qrUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-white rounded-xl mx-auto flex items-center justify-center text-xs text-gray-400">
                    Generating QR...
                  </div>
                )}
                <p className="text-[10px] font-mono text-[#6B7C6B] mt-2 truncate">
                  {selectedPassport.qr_payload}
                </p>
              </div>

              <div className="md:col-span-2 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0]">
                    <span className="text-[#6B7C6B] block text-[10px] uppercase font-bold">Material Grade</span>
                    <span className="font-bold text-[#15351A] text-sm">{selectedPassport.lot?.material?.name || 'Recyclable Scrap'}</span>
                  </div>

                  <div className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0]">
                    <span className="text-[#6B7C6B] block text-[10px] uppercase font-bold">Verified Weight</span>
                    <span className="font-extrabold text-[#35A853] text-sm tabular-nums">
                      {selectedPassport.lot?.weight || 0} kg
                    </span>
                  </div>

                  <div className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0]">
                    <span className="text-[#6B7C6B] block text-[10px] uppercase font-bold">Origin Collector</span>
                    <span className="font-bold text-[#15351A]">
                      {selectedPassport.lot?.collector?.profile?.full_name || 'Rameshwar Pawar'}
                    </span>
                    <span className="text-[10px] text-[#6B7C6B] block">{selectedPassport.lot?.city}, MH</span>
                  </div>

                  <div className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0]">
                    <span className="text-[#6B7C6B] block text-[10px] uppercase font-bold">Assigned Recycler</span>
                    <span className="font-bold text-[#15351A]">
                      Apex Circular / GreenEarth Smelters
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">✓ CPCB EPR Authorized</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Events Timeline */}
            <div className="pt-4 border-t border-[#E2EDE0]">
              <h3 className="text-xs font-bold text-[#15351A] uppercase tracking-wider mb-4">
                Immutable Custody Timeline ({selectedPassport.events?.length || 0} Events)
              </h3>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2EDE0]">
                {(selectedPassport.events || []).map((evt, idx) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#35A853] text-white flex items-center justify-center text-[9px] font-bold ring-4 ring-white">
                      {idx + 1}
                    </div>
                    <div className="bg-[#F4F9F1] p-3 rounded-xl border border-[#E2EDE0] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#15351A] text-xs">
                          {evt.event_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#6B7C6B]">
                          {new Date(evt.created_at).toLocaleDateString()} · {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7C6B] mt-0.5">
                        Actor: <strong>{evt.actor_name}</strong> ({evt.actor_role}) · Location: {evt.location}
                      </p>
                      {evt.metadata && (
                        <div className="mt-1 pt-1 border-t border-dashed border-[#E2EDE0] text-[10px] text-gray-500 font-mono">
                          {Object.entries(evt.metadata).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
