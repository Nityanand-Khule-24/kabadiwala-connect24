import { useState } from 'react';
import { Database, Server, Terminal, Code2, Copy, Check } from 'lucide-react';

export function SpecsExplorer() {
  const [activeTab, setActiveTab] = useState<'schema' | 'api' | 'setup'>('schema');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-[700px] p-6 bg-[#F4F9F1] flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-[#15351A]">
            Technical Architecture &amp; Database Specs
          </h1>
          <p className="text-xs text-[#6B7C6B] max-w-lg mx-auto">
            Supabase PostgreSQL primary database schema, FastAPI v1 REST specification, and local development instructions.
          </p>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'schema' ? 'bg-[#35A853] text-white' : 'bg-white text-[#15351A] border border-[#E2EDE0]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>19 Supabase Tables &amp; RLS</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'api' ? 'bg-[#35A853] text-white' : 'bg-white text-[#15351A] border border-[#E2EDE0]'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>FastAPI Endpoints (/api/v1)</span>
            </button>

            <button
              onClick={() => setActiveTab('setup')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'setup' ? 'bg-[#35A853] text-white' : 'bg-white text-[#15351A] border border-[#E2EDE0]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Local Dev &amp; Windows Setup</span>
            </button>
          </div>
        </div>

        {activeTab === 'schema' && (
          <div className="bg-white rounded-3xl border border-[#E2EDE0] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EDE0]">
              <div>
                <h3 className="text-sm font-bold text-[#15351A]">
                  Supabase PostgreSQL Unified Schema (19 Tables)
                </h3>
                <p className="text-xs text-[#6B7C6B]">
                  Shared single primary database with UUID primary keys and Row Level Security.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { name: '1. profiles', desc: 'Central authenticated user identity, phone, email, role (collector, recycler, admin), language.' },
                { name: '2. collectors', desc: 'Informal scrap collector geolocations, ward address, PIN code, verification status.' },
                { name: '3. recyclers', desc: 'Recycler enterprise entity, owner, GST number, registration, KYC status (approved/pending).' },
                { name: '4. recycler_documents', desc: 'Uploaded GST, MPCB pollution board consent certificates, audit review notes.' },
                { name: '5. materials', desc: '12 standard material categories (Iron, Steel, Copper, Brass, HDPE, PET, E-waste, PCBs, etc.).' },
                { name: '6. material_lots', desc: 'Scrap listings published by collectors: weight, condition, estimated value, pickup window.' },
                { name: '7. material_lot_images', desc: 'High-res photos uploaded for physical inspection before recycler offer submission.' },
                { name: '8. recycler_material_rates', desc: 'Buying rates published per material by each recycler with minimum lot quantity.' },
                { name: '9. price_history', desc: 'Audited historical indicative market prices for trend chart visualization.' },
                { name: '10. recycler_offers', desc: 'Offers made on scrap lots with offered price, quantity, pickup proposal, validity.' },
                { name: '11. orders', desc: 'Agreed transactions created on offer acceptance. Tracks pickup scheduling and weigh-ins.' },
                { name: '12. handover_records', desc: 'Mutual confirmation between collector and recycler with digital certified scale readings.' },
                { name: '13. payments', desc: 'Financial transaction ledger: amount, method (UPI, Cash, Bank), payment ref, paid_at.' },
                { name: '14. scrap_passports', desc: 'Digital QR Scrap Passports with cryptographic verification payload and status.' },
                { name: '15. traceability_events', desc: 'Immutable chain of custody events from initial creation to final smelting/recycling.' },
                { name: '16. notifications', desc: 'Real-time alert events for new offers, acceptances, pickup reminders, and payouts.' },
                { name: '17. complaints', desc: 'Grievance desk records for price discrepancies, moisture deductions, and scale audits.' },
                { name: '18. sync_records', desc: 'Offline SQLite sync queue records with client operation IDs and retry status.' },
                { name: '19. audit_logs', desc: 'Append-only tamper-evident compliance audit trail for administrative operations.' },
              ].map(t => (
                <div key={t.name} className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0]">
                  <span className="font-bold text-[#15351A] block">{t.name}</span>
                  <span className="text-[#6B7C6B] text-[11px] mt-0.5 block">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="bg-white rounded-3xl border border-[#E2EDE0] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#15351A]">
              FastAPI v1 REST Endpoints Specification
            </h3>
            <div className="space-y-2 text-xs font-mono">
              {[
                { method: 'GET', path: '/api/v1/auth/me', desc: 'Validate JWT & retrieve profile' },
                { method: 'GET', path: '/api/v1/materials', desc: 'List active materials & benchmark rates' },
                { method: 'POST', path: '/api/v1/listings', desc: 'Create scrap lot & mint digital passport' },
                { method: 'GET', path: '/api/v1/marketplace/listings', desc: 'Recycler discovery with geo & material filters' },
                { method: 'POST', path: '/api/v1/offers', desc: 'Submit buying offer from verified recycler' },
                { method: 'POST', path: '/api/v1/offers/{id}/accept', desc: 'Collector accepts offer, creates order' },
                { method: 'POST', path: '/api/v1/orders/{id}/confirm-handover', desc: 'Digital scale weigh-in & mutual confirm' },
                { method: 'POST', path: '/api/v1/orders/{id}/payments', desc: 'Record UPI/Cash settlement' },
                { method: 'GET', path: '/api/v1/passports/{code}', desc: 'Public traceability passport & timeline' },
                { method: 'POST', path: '/api/v1/admin/recyclers/{id}/approve', desc: 'Admin verify recycler & log audit' },
              ].map((ep, i) => (
                <div key={i} className="p-2.5 bg-[#F4F9F1] rounded-lg border border-[#E2EDE0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ep.method === 'POST' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {ep.method}
                    </span>
                    <span className="font-bold text-[#15351A]">{ep.path}</span>
                  </div>
                  <span className="text-[11px] text-[#6B7C6B]">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="bg-white rounded-3xl border border-[#E2EDE0] p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[#15351A]">
              Windows PowerShell &amp; Local Environment Setup Guide
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs space-y-1">
                <p className="text-gray-400"># 1. Backend Setup (FastAPI &amp; PostgreSQL)</p>
                <p>cd backend</p>
                <p>python -m venv venv</p>
                <p>.\venv\Scripts\Activate.ps1</p>
                <p>pip install -r requirements.txt</p>
                <p>uvicorn app.main:app --reload --port 8000</p>
              </div>

              <div className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs space-y-1">
                <p className="text-gray-400"># 2. Collector Mobile App (Expo Go on Android/iOS)</p>
                <p>cd mobile-app</p>
                <p>npm install</p>
                <p>npx expo start</p>
                <p className="text-gray-400"># Scan QR with Expo Go app on your phone</p>
              </div>

              <div className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs space-y-1">
                <p className="text-gray-400"># 3. Web Dashboard (Recycler &amp; Admin)</p>
                <p>npm install</p>
                <p>npm run dev</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
