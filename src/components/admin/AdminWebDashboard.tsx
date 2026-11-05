import { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import {
  Collector,
  Recycler,
  Material,
  MaterialLot,
  Order,
  Complaint,
  AuditLog
} from '../../types';
import {
  ShieldAlert,
  Users,
  Factory,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  History,
  Search,
  Eye,
  Check,
  X,
  Edit,
  ShieldCheck,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function AdminWebDashboard() {
  const [activeTab, setActiveTab] = useState<'kpis' | 'verifications' | 'collectors' | 'materials' | 'transactions' | 'complaints' | 'audit'>('kpis');

  // DB State
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lots, setLots] = useState<MaterialLot[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Verification modal
  const [selectedRecyclerForReview, setSelectedRecyclerForReview] = useState<Recycler | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Material price edit modal
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newIndicativePrice, setNewIndicativePrice] = useState<number>(0);

  // Complaint modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintNotes, setComplaintNotes] = useState('');
  const [complaintStatus, setComplaintStatus] = useState<any>('Resolved');

  useEffect(() => {
    const update = () => {
      setCollectors(dbStore.getCollectors());
      setRecyclers(dbStore.getRecyclers());
      setMaterials(dbStore.getMaterials());
      setLots(dbStore.getMaterialLots());
      setOrders(dbStore.getOrders());
      setComplaints(dbStore.getComplaints());
      setAuditLogs(dbStore.getAuditLogs());
    };

    update();
    return dbStore.subscribe(update);
  }, []);

  // Compute platform aggregate statistics
  const verifiedRecyclersCount = recyclers.filter(r => r.verification_status === 'approved').length;
  const pendingVerificationsCount = recyclers.filter(r => r.verification_status === 'pending' || r.verification_status === 'requires_info').length;
  const completedOrders = orders.filter(o => o.order_status === 'completed');
  const totalRecordedGMV = completedOrders.reduce((acc, curr) => acc + (curr.final_amount || 0), 0);
  const totalWeightRecycledKg = completedOrders.reduce((acc, curr) => acc + (curr.final_weight || curr.agreed_quantity), 0);

  const handleVerifyRecycler = (status: 'approved' | 'rejected' | 'requires_info') => {
    if (!selectedRecyclerForReview) return;

    dbStore.adminVerifyRecycler(selectedRecyclerForReview.id, status, verificationNotes || `Document review status updated to ${status}.`);
    confetti({ particleCount: 30, spread: 50 });
    alert(`Recycler ${selectedRecyclerForReview.business_name} verification status set to ${status.toUpperCase()}.`);
    setSelectedRecyclerForReview(null);
    setVerificationNotes('');
  };

  const handleSaveMaterialPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    dbStore.adminUpdateMaterialPrice(editingMaterial.id, newIndicativePrice);
    alert(`Baseline price for ${editingMaterial.name} updated to ₹${newIndicativePrice}. Recorded in price history log.`);
    setEditingMaterial(null);
  };

  const handleUpdateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    dbStore.adminUpdateComplaint(selectedComplaint.id, complaintStatus, complaintNotes);
    alert('Complaint status updated.');
    setSelectedComplaint(null);
  };

  return (
    <div className="w-full min-h-[700px] flex bg-[#F4F9F1]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E2EDE0] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#15351A] text-[#7ED957] flex items-center justify-center font-bold shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#15351A] leading-tight">Admin Console</h2>
              <span className="text-[10px] text-[#6B7C6B]">Platform Governance</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('kpis')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'kpis' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Platform KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('verifications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'verifications' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Factory className="w-4 h-4" />
                <span>KYC Verifications</span>
              </div>
              {pendingVerificationsCount > 0 && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {pendingVerificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('collectors')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'collectors' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Collectors Registry</span>
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'materials' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Price Board Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'transactions' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Scrap Ledger &amp; Passports</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'complaints' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Complaints &amp; Disputes</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">{complaints.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'audit' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail Logs</span>
            </button>
          </nav>
        </div>

        <div className="p-3 bg-[#15351A] text-white rounded-xl text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7ED957]" />
            <span>Dr. Anand Kulkarni</span>
          </p>
          <p className="text-[10px] text-white/70">Master Administrator</p>
          <p className="text-[9px] text-[#7ED957] font-mono mt-1">RBAC: FULL_GOVERNANCE</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* VIEW 1: KPIS */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-extrabold text-[#15351A]">Platform Executive Overview</h1>
              <p className="text-xs text-[#6B7C6B]">
                Macro telemetry across informal scrap collectors, verified recyclers, and traceability passports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Total Registered Collectors</span>
                <div className="text-2xl font-extrabold text-[#15351A] mt-1 tabular-nums">
                  {collectors.length}
                </div>
                <span className="text-[11px] text-[#35A853] font-semibold mt-1 inline-block">
                  Informal network digitised
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Verified Recyclers</span>
                <div className="text-2xl font-extrabold text-[#35A853] mt-1 tabular-nums">
                  {verifiedRecyclersCount} / {recyclers.length}
                </div>
                <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">
                  {pendingVerificationsCount} pending review
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Total Recorded GMV</span>
                <div className="text-2xl font-extrabold text-[#15351A] mt-1 tabular-nums">
                  ₹{totalRecordedGMV.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-[#6B7C6B] mt-1 inline-block">
                  Via direct UPI / transparent bank
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Certified Recycled Tons</span>
                <div className="text-2xl font-extrabold text-[#15351A] mt-1 tabular-nums">
                  {(totalWeightRecycledKg / 1000).toFixed(2)} <span className="text-xs font-normal">Tons</span>
                </div>
                <span className="text-[11px] text-[#35A853] font-semibold mt-1 inline-block">
                  Passport verified custody
                </span>
              </div>
            </div>

            {/* Quick Status Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#15351A]">
                  Pending Recycler Verifications ({pendingVerificationsCount})
                </h3>
                <div className="space-y-2">
                  {recyclers.filter(r => r.verification_status !== 'approved').map(rec => (
                    <div key={rec.id} className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#15351A]">{rec.business_name}</p>
                        <p className="text-[10px] text-[#6B7C6B]">{rec.owner_name} · {rec.city}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRecyclerForReview(rec);
                          setActiveTab('verifications');
                        }}
                        className="px-3 py-1 bg-[#35A853] text-white rounded-lg font-bold"
                      >
                        Review KYC →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#15351A]">
                  Latest Audit Trail Events
                </h3>
                <div className="space-y-2">
                  {auditLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="p-2.5 bg-white rounded-xl border border-[#E2EDE0] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#15351A] font-mono">{log.action}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7C6B] mt-0.5">
                        Actor: {log.actor_name} ({log.actor_role})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: KYC VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#15351A]">Recycler Verification Desk</h1>
              <p className="text-xs text-[#6B7C6B]">
                Verify GST certificates, state pollution board consent-to-operate licenses, and physical yard locations.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2EDE0] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F9F1] border-b border-[#E2EDE0] text-[#15351A] font-bold">
                  <tr>
                    <th className="p-3.5">Business Name</th>
                    <th className="p-3.5">Proprietor</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">GST / Registration</th>
                    <th className="p-3.5">Documents</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EDE0]">
                  {recyclers.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50/50">
                      <td className="p-3.5 font-bold text-[#15351A]">{rec.business_name}</td>
                      <td className="p-3.5 text-[#6B7C6B]">{rec.owner_name}</td>
                      <td className="p-3.5 text-[#6B7C6B]">{rec.city}, MH</td>
                      <td className="p-3.5 font-mono text-xs">{rec.gst_number || 'N/A'}</td>
                      <td className="p-3.5 text-[#6B7C6B]">{rec.documents?.length || 0} uploaded</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.verification_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.verification_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.verification_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedRecyclerForReview(rec);
                            setVerificationNotes('');
                          }}
                          className="px-3 py-1.5 bg-[#F4F9F1] hover:bg-[#E2EDE0] text-[#15351A] font-bold rounded-lg border border-[#E2EDE0]"
                        >
                          Review &amp; Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: COLLECTORS REGISTRY */}
        {activeTab === 'collectors' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#15351A]">Collectors Registry</h1>
              <p className="text-xs text-[#6B7C6B]">
                Registered informal scrap collectors with digital profiles, location wards, and language preferences.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2EDE0] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F9F1] border-b border-[#E2EDE0] text-[#15351A] font-bold">
                  <tr>
                    <th className="p-3.5">Collector Name</th>
                    <th className="p-3.5">Mobile Phone</th>
                    <th className="p-3.5">Address / Ward</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">PIN Code</th>
                    <th className="p-3.5">Language</th>
                    <th className="p-3.5">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EDE0]">
                  {collectors.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="p-3.5 font-bold text-[#15351A]">{c.profile?.full_name}</td>
                      <td className="p-3.5 text-[#6B7C6B]">{c.profile?.phone}</td>
                      <td className="p-3.5 text-[#6B7C6B]">{c.address}</td>
                      <td className="p-3.5 text-[#15351A] font-medium">{c.city}</td>
                      <td className="p-3.5 font-mono text-xs">{c.pin_code}</td>
                      <td className="p-3.5 font-semibold text-[#35A853]">
                        {c.profile?.preferred_language === 'mr' ? 'मराठी' : c.profile?.preferred_language === 'hi' ? 'हिंदी' : 'English'}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: MATERIAL & PRICE BOARD MANAGER */}
        {activeTab === 'materials' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#15351A]">Material Categories &amp; Baseline Prices</h1>
              <p className="text-xs text-[#6B7C6B]">
                Publish official transparent benchmark prices (₹/unit). These drive the live scrap value estimator for collectors.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2EDE0] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F9F1] border-b border-[#E2EDE0] text-[#15351A] font-bold">
                  <tr>
                    <th className="p-3.5">Material Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Subtype</th>
                    <th className="p-3.5">Indicative Benchmark Price</th>
                    <th className="p-3.5">Market Trend</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EDE0]">
                  {materials.map(mat => (
                    <tr key={mat.id} className="hover:bg-gray-50/50">
                      <td className="p-3.5 font-bold text-[#15351A]">{mat.name}</td>
                      <td className="p-3.5 text-[#6B7C6B]">{mat.category}</td>
                      <td className="p-3.5 text-[#6B7C6B]">{mat.subtype}</td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-[#35A853] text-sm tabular-nums">
                          ₹{mat.indicative_price} / {mat.unit}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-xs">
                        {mat.price_trend === 'up' ? '▲ Up' : mat.price_trend === 'down' ? '▼ Down' : '● Stable'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingMaterial(mat);
                            setNewIndicativePrice(mat.indicative_price);
                          }}
                          className="px-3 py-1.5 bg-[#F4F9F1] hover:bg-[#E2EDE0] text-[#15351A] font-bold rounded-lg border border-[#E2EDE0]"
                        >
                          Update Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 5: SCRAP LEDGER & PASSPORTS */}
        {activeTab === 'transactions' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#15351A]">Scrap Ledger &amp; Digital Passports</h1>
              <p className="text-xs text-[#6B7C6B]">
                Complete record of orders, weigh-ins, payouts, and immutable traceability events.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2EDE0] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F9F1] border-b border-[#E2EDE0] text-[#15351A] font-bold">
                  <tr>
                    <th className="p-3.5">Order Code</th>
                    <th className="p-3.5">Material &amp; Lot</th>
                    <th className="p-3.5">Collector</th>
                    <th className="p-3.5">Recycler</th>
                    <th className="p-3.5">Final Weight</th>
                    <th className="p-3.5">Total Settlement</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Passport Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EDE0]">
                  {orders.map(order => {
                    const passport = dbStore.getPassports().find(p => p.material_lot_id === order.material_lot_id);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="p-3.5 font-mono font-bold text-[#35A853]">{order.order_code}</td>
                        <td className="p-3.5 font-bold text-[#15351A]">{order.lot?.title}</td>
                        <td className="p-3.5 text-[#6B7C6B]">{order.collector?.profile?.full_name}</td>
                        <td className="p-3.5 text-[#6B7C6B]">{order.recycler?.business_name}</td>
                        <td className="p-3.5 text-[#15351A] font-bold">{order.final_weight || order.agreed_quantity} kg</td>
                        <td className="p-3.5 font-extrabold text-[#15351A] tabular-nums">
                          ₹{(order.final_amount || (order.agreed_price * order.agreed_quantity)).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.order_status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.order_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-[#35A853]">
                          {passport?.passport_code || 'MINTED'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 6: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#15351A]">Complaints &amp; Grievance Redressal</h1>
              <p className="text-xs text-[#6B7C6B]">
                Review user grievances regarding moisture deductions, scale discrepancies, or pickup delays.
              </p>
            </div>

            <div className="space-y-3">
              {complaints.map(comp => (
                <div key={comp.id} className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#15351A]">{comp.complaint_code}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {comp.category}
                      </span>
                      <span className="text-xs text-[#6B7C6B]">
                        Raised by {comp.user_name} ({comp.user_role})
                      </span>
                    </div>
                    <p className="text-xs text-[#15351A]">{comp.description}</p>
                    {comp.resolution_notes && (
                      <p className="text-[11px] text-[#35A853] bg-emerald-50 p-2 rounded-lg mt-2">
                        <strong>Admin Notes:</strong> {comp.resolution_notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full block mb-2 ${
                      comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {comp.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedComplaint(comp);
                        setComplaintNotes(comp.resolution_notes || '');
                      }}
                      className="px-3 py-1 bg-[#F4F9F1] hover:bg-[#E2EDE0] text-[#15351A] font-bold rounded-lg text-xs border border-[#E2EDE0]"
                    >
                      Resolve Grievance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#15351A]">Platform Append-Only Audit Trail</h1>
              <p className="text-xs text-[#6B7C6B]">
                Cryptographically verifiable timestamped audit log of all financial settlements, KYC decisions, and status transitions.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2EDE0] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#15351A] text-white">
                  <tr>
                    <th className="p-3">Timestamp (UTC)</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EDE0]">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="p-3 text-[#6B7C6B]">{new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-3 font-bold text-[#15351A]">{log.actor_name}</td>
                      <td className="p-3 font-semibold text-[#35A853]">{log.actor_role}</td>
                      <td className="p-3 font-bold text-gray-900">{log.action}</td>
                      <td className="p-3 text-[#6B7C6B]">{log.entity_type}#{log.entity_id.substring(0, 8)}</td>
                      <td className="p-3 text-[10px] text-gray-500 max-w-xs truncate">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Review Recycler Verification */}
      {selectedRecyclerForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-[#E2EDE0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <h3 className="text-sm font-bold text-[#15351A]">
                Recycler KYC Review: {selectedRecyclerForReview.business_name}
              </h3>
              <button onClick={() => setSelectedRecyclerForReview(null)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F4F9F1] p-3 rounded-xl">
              <div>
                <span className="text-[#6B7C6B] block">Proprietor:</span>
                <strong>{selectedRecyclerForReview.owner_name}</strong>
              </div>
              <div>
                <span className="text-[#6B7C6B] block">Location:</span>
                <strong>{selectedRecyclerForReview.city}, Maharashtra</strong>
              </div>
              <div>
                <span className="text-[#6B7C6B] block">GST Number:</span>
                <span className="font-mono">{selectedRecyclerForReview.gst_number || '27AABCG1234F1Z8'}</span>
              </div>
              <div>
                <span className="text-[#6B7C6B] block">Current Status:</span>
                <span className="font-bold text-[#35A853]">{selectedRecyclerForReview.verification_status.toUpperCase()}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#15351A] uppercase tracking-wider mb-2">
                Submitted Documents ({selectedRecyclerForReview.documents?.length || 0})
              </h4>
              <div className="space-y-2">
                {(selectedRecyclerForReview.documents || []).map(doc => (
                  <div key={doc.id} className="p-2.5 bg-white border border-[#E2EDE0] rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#15351A]">{doc.file_name}</p>
                      <p className="text-[10px] text-[#6B7C6B]">{doc.document_type}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Verified Authenticated PDF
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Admin Audit Notes / Verification Rationale
              </label>
              <textarea
                value={verificationNotes}
                onChange={e => setVerificationNotes(e.target.value)}
                rows={2}
                placeholder="Checked CPCB EPR registration database and active GST profile."
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleVerifyRecycler('approved')}
                className="flex-1 py-2 px-3 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Approve Recycler</span>
              </button>

              <button
                onClick={() => handleVerifyRecycler('requires_info')}
                className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs"
              >
                Request Info
              </button>

              <button
                onClick={() => handleVerifyRecycler('rejected')}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Update Indicative Price */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveMaterialPrice}
            className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <h3 className="text-sm font-bold text-[#15351A]">
                Update Benchmark Rate: {editingMaterial.name}
              </h3>
              <button type="button" onClick={() => setEditingMaterial(null)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                New Benchmark Price (₹ / {editingMaterial.unit})
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={newIndicativePrice}
                onChange={e => setNewIndicativePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-sm font-bold text-[#35A853]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs"
            >
              Publish to Network &amp; Audit Log
            </button>
          </form>
        </div>
      )}

      {/* MODAL: Resolve Complaint */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleUpdateComplaint}
            className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <h3 className="text-sm font-bold text-[#15351A]">
                Resolve Grievance: {selectedComplaint.complaint_code}
              </h3>
              <button type="button" onClick={() => setSelectedComplaint(null)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B7C6B]">{selectedComplaint.description}</p>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">Resolution Status</label>
              <select
                value={complaintStatus}
                onChange={e => setComplaintStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">Resolution Summary Notes</label>
              <textarea
                value={complaintNotes}
                onChange={e => setComplaintNotes(e.target.value)}
                rows={3}
                placeholder="Details of mediation or compensation recorded."
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs"
            >
              Update Resolution
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
