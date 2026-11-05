import { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import {
  Recycler,
  MaterialLot,
  RecyclerOffer,
  Order,
  Material,
  RecyclerMaterialRate
} from '../../types';
import {
  Factory,
  Package,
  FileCheck,
  TrendingUp,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Building,
  ShieldCheck,
  X,
  FileText,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function RecyclerWebDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'rates' | 'orders' | 'analytics' | 'profile'>('overview');

  // Recycler session & DB state
  const [currentRecycler, setCurrentRecycler] = useState<Recycler | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [availableLots, setAvailableLots] = useState<MaterialLot[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [myOffers, setMyOffers] = useState<RecyclerOffer[]>([]);
  const [recyclerRates, setRecyclerRates] = useState<RecyclerMaterialRate[]>([]);

  // Marketplace filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  // Modals
  const [makingOfferLot, setMakingOfferLot] = useState<MaterialLot | null>(null);
  const [offeredPrice, setOfferedPrice] = useState<number>(0);
  const [pickupProposal, setPickupProposal] = useState('Pickup via our electric loader vehicle with certified scale.');
  const [offerMessage, setOfferMessage] = useState('Authorized recycler ready for immediate pickup and UPI settlement.');

  const [handoverOrder, setHandoverOrder] = useState<Order | null>(null);
  const [finalWeightInput, setFinalWeightInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

  const [editingRateMaterial, setEditingRateMaterial] = useState<Material | null>(null);
  const [newRateValue, setNewRateValue] = useState<number>(0);
  const [newRateMinQty, setNewRateMinQty] = useState<number>(25);

  useEffect(() => {
    const update = () => {
      const user = dbStore.getCurrentUser();
      const recyclers = dbStore.getRecyclers();
      const matched = recyclers.find(r => r.profile_id === user?.id) || recyclers[0];
      setCurrentRecycler(matched);

      setMaterials(dbStore.getMaterials());
      setAvailableLots(dbStore.getAvailableLots());
      setMyOrders(dbStore.getOrders().filter(o => o.recycler_id === matched?.id));
      setMyOffers(dbStore.getOffersForLot('all').filter(o => o.recycler_id === matched?.id));

      if (matched) {
        setRecyclerRates(dbStore.getRecyclers().find(r => r.id === matched.id)?.rates || []);
      }
    };

    update();
    return dbStore.subscribe(update);
  }, []);

  const isVerified = currentRecycler?.verification_status === 'approved';

  // Metrics
  const totalPurchasesVolume = myOrders
    .filter(o => o.order_status === 'completed')
    .reduce((acc, curr) => acc + (curr.final_weight || curr.agreed_quantity), 0);

  const totalSpent = myOrders
    .filter(o => o.order_status === 'completed')
    .reduce((acc, curr) => acc + (curr.final_amount || (curr.agreed_price * curr.agreed_quantity)), 0);

  const activeOrdersCount = myOrders.filter(o => o.order_status !== 'completed' && o.order_status !== 'cancelled').length;

  // Filtered Marketplace Lots
  const filteredLots = availableLots.filter(lot => {
    const matchesSearch = lot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lot.pickup_address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || lot.material?.category === categoryFilter;
    const matchesCity = cityFilter === 'All' || lot.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCat && matchesCity;
  });

  const handleOpenOfferModal = (lot: MaterialLot) => {
    if (!isVerified) {
      alert('Your account verification is pending administrator approval. Only verified recyclers can make offers.');
      return;
    }
    setMakingOfferLot(lot);
    // Default to lot's estimated rate or slightly higher
    const baseRate = lot.material?.indicative_price || 40;
    setOfferedPrice(Math.round(baseRate * 1.02));
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!makingOfferLot || !currentRecycler) return;

    try {
      dbStore.makeOffer({
        lotId: makingOfferLot.id,
        recyclerId: currentRecycler.id,
        offeredPrice,
        offeredQuantity: makingOfferLot.weight,
        pickupProposal,
        message: offerMessage,
        validDays: 3
      });

      confetti({ particleCount: 40, spread: 60 });
      alert('Offer submitted successfully! Collector has been notified on their mobile app.');
      setMakingOfferLot(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit offer');
    }
  };

  const handleOpenHandoverModal = (order: Order) => {
    setHandoverOrder(order);
    setFinalWeightInput(order.agreed_quantity);
    setPaymentRefInput(`UPI/${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}/SETTLEMENT`);
  };

  const handleCompleteHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverOrder) return;

    try {
      dbStore.confirmHandoverAndPay({
        orderId: handoverOrder.id,
        finalWeight: finalWeightInput,
        finalPricePerKg: handoverOrder.agreed_price,
        paymentMethod,
        paymentReference: paymentRefInput,
        notes: handoverNotes
      });

      confetti({ particleCount: 50, spread: 70 });
      alert(`Handover recorded! ₹${Math.round(finalWeightInput * handoverOrder.agreed_price).toLocaleString('en-IN')} payment logged and Scrap Passport minted.`);
      setHandoverOrder(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to complete handover');
    }
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRateMaterial || !currentRecycler) return;

    dbStore.updateRecyclerRate(currentRecycler.id, editingRateMaterial.id, newRateValue, newRateMinQty);
    setEditingRateMaterial(null);
    alert(`Buying rate for ${editingRateMaterial.name} updated.`);
  };

  return (
    <div className="w-full min-h-[700px] flex bg-[#F4F9F1]">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E2EDE0] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#35A853] text-white flex items-center justify-center shadow-xs">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#15351A] leading-tight">
                {currentRecycler?.business_name || 'Recycler Portal'}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full inline-block mt-0.5 ${
                isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isVerified ? '✓ Verified Partner' : '⏳ Verification Pending'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'marketplace' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Scrap Marketplace</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'marketplace' ? 'bg-white text-[#35A853]' : 'bg-[#7ED957]/30 text-[#15351A]'
              }`}>
                {availableLots.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rates')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'rates' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Buying Rates</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'orders' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4" />
                <span>Orders &amp; Pickups</span>
              </div>
              {activeOrdersCount > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'profile' ? 'bg-[#35A853] text-white' : 'text-[#6B7C6B] hover:bg-[#F4F9F1] hover:text-[#15351A]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>KYC &amp; Verification</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0] text-xs">
          <p className="font-semibold text-[#15351A]">{currentRecycler?.owner_name}</p>
          <p className="text-[10px] text-[#6B7C6B] mt-0.5">{currentRecycler?.city}, Maharashtra</p>
          <p className="text-[9px] text-[#6B7C6B] mt-1 font-mono">GST: {currentRecycler?.gst_number || 'PENDING'}</p>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Verification Warning Banner if not approved */}
        {!isVerified && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Account Verification Under Review</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Platform administrators are verifying your business documents. You can browse listings and set rates. Making offers requires approved verification.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              View Documents →
            </button>
          </div>
        )}

        {/* VIEW 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-[#15351A]">
                  Welcome back, {currentRecycler?.owner_name}
                </h1>
                <p className="text-xs text-[#6B7C6B] mt-0.5">
                  Industrial recycling performance and real-time scrap supply stream.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                <span>Explore Scrap Lots</span>
              </button>
            </div>

            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Total Sourced Volume</span>
                <div className="text-2xl font-extrabold text-[#15351A] mt-1 tabular-nums">
                  {totalPurchasesVolume.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#6B7C6B]">kg</span>
                </div>
                <span className="text-[11px] text-[#35A853] font-semibold mt-2 inline-block">
                  Verified recycled scrap
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Total Sourcing Spend</span>
                <div className="text-2xl font-extrabold text-[#15351A] mt-1 tabular-nums">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-[#6B7C6B] mt-2 inline-block">
                  Direct collector payouts
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Active Pickups</span>
                <div className="text-2xl font-extrabold text-[#35A853] mt-1 tabular-nums">
                  {activeOrdersCount}
                </div>
                <span className="text-[11px] text-[#6B7C6B] mt-2 inline-block">
                  Scheduled / In Transit
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs">
                <span className="text-xs text-[#6B7C6B] font-medium block">Live Marketplace Lots</span>
                <div className="text-2xl font-extrabold text-[#15351A] mt-1 tabular-nums">
                  {availableLots.length}
                </div>
                <span className="text-[11px] text-[#35A853] font-semibold mt-2 inline-block">
                  Available in region
                </span>
              </div>
            </div>

            {/* Recent Marketplace Feed & Active Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fresh Marketplace Lots */}
              <div className="bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#15351A]">
                    Fresh Scrap Supply Nearby
                  </h3>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="text-xs text-[#35A853] font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {availableLots.slice(0, 3).map(lot => (
                    <div
                      key={lot.id}
                      className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#15351A] truncate">{lot.title}</h4>
                        <p className="text-[11px] text-[#6B7C6B] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#35A853]" />
                          <span>{lot.city} · {lot.weight} kg · {lot.condition}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenOfferModal(lot)}
                        className="px-3 py-1.5 bg-[#35A853] hover:bg-[#2e9147] text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                      >
                        Make Offer
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Orders & Handover Queue */}
              <div className="bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#15351A]">
                    Active Pickup &amp; Settlement Queue
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#35A853] font-semibold hover:underline"
                  >
                    Manage Orders →
                  </button>
                </div>

                <div className="space-y-3">
                  {myOrders.length === 0 ? (
                    <p className="text-xs text-[#6B7C6B] py-6 text-center">
                      No active orders. Make offers on marketplace listings to begin purchasing.
                    </p>
                  ) : (
                    myOrders.slice(0, 3).map(order => (
                      <div
                        key={order.id}
                        className="p-3 bg-white rounded-xl border border-[#E2EDE0] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <span className="text-[10px] text-[#6B7C6B] font-mono">{order.order_code}</span>
                          <h4 className="text-xs font-bold text-[#15351A]">{order.lot?.title}</h4>
                          <p className="text-[11px] text-[#35A853] font-semibold">
                            ₹{order.agreed_price}/kg · {order.agreed_quantity} kg
                          </p>
                        </div>
                        {order.order_status !== 'completed' ? (
                          <button
                            onClick={() => handleOpenHandoverModal(order)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
                          >
                            Weigh &amp; Pay
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MARKETPLACE */}
        {activeTab === 'marketplace' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-[#15351A]">
                  Scrap Supply Marketplace
                </h1>
                <p className="text-xs text-[#6B7C6B]">
                  Live scrap listings published by verified informal collectors across Maharashtra.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search material, city..."
                    className="pl-9 pr-3 py-2 bg-white rounded-xl border border-[#E2EDE0] text-xs text-[#15351A] focus:outline-none focus:ring-2 focus:ring-[#35A853]"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-[#E2EDE0] text-xs text-[#15351A]"
                >
                  <option value="All">All Categories</option>
                  <option value="Metals">Metals</option>
                  <option value="Plastics">Plastics</option>
                  <option value="E-Waste">E-Waste</option>
                  <option value="Paper & Cardboard">Paper &amp; Cardboard</option>
                </select>

                <select
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-[#E2EDE0] text-xs text-[#15351A]"
                >
                  <option value="All">All Cities</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Thane">Thane</option>
                  <option value="Nagpur">Nagpur</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLots.map(lot => {
                const offers = dbStore.getOffersForLot(lot.id);
                return (
                  <div
                    key={lot.id}
                    className="bg-white rounded-2xl border border-[#E2EDE0] p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      {lot.images?.[0] && (
                        <img
                          src={lot.images[0]}
                          alt={lot.title}
                          className="w-full h-36 object-cover rounded-xl border border-[#E2EDE0]"
                        />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-[#6B7C6B] uppercase font-bold tracking-wider">
                            {lot.material?.category} · {lot.city}
                          </span>
                          <h3 className="text-sm font-bold text-[#15351A] leading-snug">
                            {lot.title}
                          </h3>
                        </div>
                        <span className="text-xs font-extrabold text-[#35A853] tabular-nums whitespace-nowrap">
                          ₹{lot.estimated_value.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B7C6B] line-clamp-2">
                        {lot.description}
                      </p>

                      <div className="p-2.5 bg-[#F4F9F1] rounded-xl text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#6B7C6B]">Weight:</span>
                          <strong className="text-[#15351A]">{lot.weight} kg</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7C6B]">Condition:</span>
                          <span className="text-[#15351A]">{lot.condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B7C6B]">Pickup Address:</span>
                          <span className="text-[#15351A] truncate max-w-[160px]">{lot.pickup_address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E2EDE0] flex items-center justify-between">
                      <span className="text-[11px] text-[#6B7C6B]">
                        {offers.length} offer{offers.length !== 1 ? 's' : ''} made
                      </span>

                      <button
                        onClick={() => handleOpenOfferModal(lot)}
                        className="px-4 py-2 bg-[#35A853] hover:bg-[#2e9147] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        Make Offer →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: BUYING RATES */}
        {activeTab === 'rates' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-[#15351A]">
                  Material Buying Rates Manager
                </h1>
                <p className="text-xs text-[#6B7C6B]">
                  Set your published buying price per kg. Collectors in your catchment area will discover your rates.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2EDE0] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F9F1] border-b border-[#E2EDE0] text-[#15351A] font-bold">
                  <tr>
                    <th className="p-3.5">Material</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Market Indicative Price</th>
                    <th className="p-3.5">Your Published Buying Rate</th>
                    <th className="p-3.5">Min Qty</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EDE0]">
                  {materials.map(mat => {
                    const existingRate = recyclerRates.find(r => r.material_id === mat.id);
                    return (
                      <tr key={mat.id} className="hover:bg-gray-50/50">
                        <td className="p-3.5 font-bold text-[#15351A]">{mat.name}</td>
                        <td className="p-3.5 text-[#6B7C6B]">{mat.category}</td>
                        <td className="p-3.5 tabular-nums text-[#6B7C6B]">
                          ₹{mat.indicative_price} / {mat.unit}
                        </td>
                        <td className="p-3.5">
                          {existingRate ? (
                            <span className="font-extrabold text-[#35A853] text-sm tabular-nums">
                              ₹{existingRate.rate} / {existingRate.unit}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Not Published</span>
                          )}
                        </td>
                        <td className="p-3.5 text-[#6B7C6B]">
                          {existingRate?.minimum_quantity || 20} kg
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setEditingRateMaterial(mat);
                              setNewRateValue(existingRate ? existingRate.rate : mat.indicative_price);
                              setNewRateMinQty(existingRate ? existingRate.minimum_quantity : 25);
                            }}
                            className="px-3 py-1.5 bg-[#F4F9F1] hover:bg-[#E2EDE0] text-[#15351A] font-bold rounded-lg border border-[#E2EDE0]"
                          >
                            {existingRate ? 'Edit Rate' : '+ Set Rate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: ORDERS & PICKUPS */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-[#15351A]">
                  Order &amp; Pickup Management
                </h1>
                <p className="text-xs text-[#6B7C6B]">
                  Coordinate pickup dates, digital scale handovers, and instant settlements.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {myOrders.length === 0 ? (
                <div className="p-12 bg-white rounded-2xl border border-dashed border-[#E2EDE0] text-center text-xs text-[#6B7C6B]">
                  No orders yet. Submit offers to collectors in the marketplace.
                </div>
              ) : (
                myOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-2xl border border-[#E2EDE0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#35A853]">{order.order_code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.order_status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.order_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#15351A]">{order.lot?.title}</h3>
                      <p className="text-xs text-[#6B7C6B]">
                        Collector: <strong>{order.collector?.profile?.full_name}</strong> ({order.collector?.city}) · Agreed: ₹{order.agreed_price}/kg ({order.agreed_quantity} kg)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-[#6B7C6B] block">Total Order Value</span>
                        <span className="text-base font-extrabold text-[#15351A] tabular-nums">
                          ₹{(order.final_amount || (order.agreed_price * order.agreed_quantity)).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {order.order_status !== 'completed' ? (
                        <button
                          onClick={() => handleOpenHandoverModal(order)}
                          className="px-4 py-2 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Weigh &amp; Record Payment</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Paid &amp; Transferred</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: PROFILE & KYC */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-xl font-extrabold text-[#15351A]">
              Recycler KYC &amp; Verification
            </h1>

            <div className="bg-white rounded-2xl p-6 border border-[#E2EDE0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2EDE0]">
                <div>
                  <h3 className="text-base font-bold text-[#15351A]">
                    {currentRecycler?.business_name}
                  </h3>
                  <p className="text-xs text-[#6B7C6B]">{currentRecycler?.address}, {currentRecycler?.city}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Status: {currentRecycler?.verification_status?.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#6B7C6B] block">Proprietor / Managing Director</span>
                  <span className="font-bold text-[#15351A]">{currentRecycler?.owner_name}</span>
                </div>
                <div>
                  <span className="text-[#6B7C6B] block">GST Number</span>
                  <span className="font-bold text-[#15351A] font-mono">{currentRecycler?.gst_number || '27AABCG1234F1Z8'}</span>
                </div>
                <div>
                  <span className="text-[#6B7C6B] block">Registered Phone</span>
                  <span className="font-bold text-[#15351A]">{currentRecycler?.profile?.phone}</span>
                </div>
                <div>
                  <span className="text-[#6B7C6B] block">Registered Email</span>
                  <span className="font-bold text-[#15351A]">{currentRecycler?.profile?.email}</span>
                </div>
              </div>

              {/* Submitted Documents Table */}
              <div className="pt-4 border-t border-[#E2EDE0]">
                <h4 className="text-xs font-bold text-[#15351A] uppercase tracking-wider mb-2">
                  Submitted Compliance Documents
                </h4>
                <div className="space-y-2">
                  {(currentRecycler?.documents || []).map(doc => (
                    <div key={doc.id} className="p-3 bg-[#F4F9F1] rounded-xl border border-[#E2EDE0] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#35A853]" />
                        <div>
                          <p className="font-bold text-[#15351A]">{doc.file_name}</p>
                          <p className="text-[10px] text-[#6B7C6B]">Type: {doc.document_type.replace('_', ' ').toUpperCase()}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {doc.verification_status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Make Offer */}
      {makingOfferLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmitOffer}
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E2EDE0] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <h3 className="text-sm font-bold text-[#15351A]">
                Submit Buying Offer
              </h3>
              <button
                type="button"
                onClick={() => setMakingOfferLot(null)}
                className="p-1 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F4F9F1] rounded-xl text-xs space-y-1">
              <p><strong>Lot:</strong> {makingOfferLot.title}</p>
              <p><strong>Weight:</strong> {makingOfferLot.weight} kg</p>
              <p><strong>Indicative Baseline:</strong> ₹{makingOfferLot.material?.indicative_price}/kg</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Offered Price per kg (₹)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={offeredPrice}
                onChange={e => setOfferedPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-sm font-bold text-[#35A853]"
                required
              />
              <p className="text-[11px] text-[#6B7C6B] mt-1">
                Total payout to collector: <strong className="text-[#15351A]">₹{Math.round(offeredPrice * makingOfferLot.weight).toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Pickup Proposal / Logistics
              </label>
              <input
                type="text"
                value={pickupProposal}
                onChange={e => setPickupProposal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Note to Collector
              </label>
              <textarea
                value={offerMessage}
                onChange={e => setOfferMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs transition-colors"
            >
              Confirm &amp; Send Offer
            </button>
          </form>
        </div>
      )}

      {/* MODAL: Handover & Payment Settlement */}
      {handoverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCompleteHandover}
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E2EDE0] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <h3 className="text-sm font-bold text-[#15351A]">
                Record Handover &amp; Settle Payment
              </h3>
              <button
                type="button"
                onClick={() => setHandoverOrder(null)}
                className="p-1 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F4F9F1] rounded-xl text-xs space-y-1">
              <p><strong>Order:</strong> {handoverOrder.order_code}</p>
              <p><strong>Material:</strong> {handoverOrder.lot?.title}</p>
              <p><strong>Agreed Rate:</strong> ₹{handoverOrder.agreed_price}/kg</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Confirmed Digital Scale Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={finalWeightInput}
                onChange={e => setFinalWeightInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-sm font-bold text-[#15351A]"
                required
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-900">Total Settlement Amount</span>
                <span className="text-base font-extrabold text-[#35A853] tabular-nums">
                  ₹{Math.round(finalWeightInput * handoverOrder.agreed_price).toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
                >
                  <option value="UPI">UPI Instant Transfer</option>
                  <option value="Cash">Cash Handover</option>
                  <option value="Bank Transfer">NEFT / RTGS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#15351A] mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={paymentRefInput}
                  onChange={e => setPaymentRefInput(e.target.value)}
                  placeholder="UPI/UTR Reference"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Handover Notes / Scale Details
              </label>
              <input
                type="text"
                value={handoverNotes}
                onChange={e => setHandoverNotes(e.target.value)}
                placeholder="Scale verified, scrap clean and sorted."
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs transition-colors"
            >
              Complete Order &amp; Mint Passport Event
            </button>
          </form>
        </div>
      )}

      {/* MODAL: Edit Buying Rate */}
      {editingRateMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveRate}
            className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E2EDE0] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2EDE0]">
              <h3 className="text-sm font-bold text-[#15351A]">
                Set Buying Rate: {editingRateMaterial.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRateMaterial(null)}
                className="p-1 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Your Buying Price (₹/kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={newRateValue}
                onChange={e => setNewRateValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-sm font-bold text-[#35A853]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15351A] mb-1">
                Minimum Quantity (kg)
              </label>
              <input
                type="number"
                value={newRateMinQty}
                onChange={e => setNewRateMinQty(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2EDE0] text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#35A853] hover:bg-[#2e9147] text-white font-bold rounded-xl text-xs transition-colors"
            >
              Publish Rate
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
