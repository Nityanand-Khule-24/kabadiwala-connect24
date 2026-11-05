import {
  Profile,
  Collector,
  Recycler,
  Material,
  MaterialLot,
  RecyclerMaterialRate,
  PriceHistory,
  RecyclerOffer,
  Order,
  HandoverRecord,
  Payment,
  ScrapPassport,
  TraceabilityEvent,
  Notification,
  Complaint,
  AuditLog,
  SyncRecord,
  UserRole
} from '../types';
import {
  SEED_PROFILES,
  SEED_COLLECTORS,
  SEED_RECYCLERS,
  SEED_MATERIALS,
  SEED_PRICE_HISTORIES,
  SEED_RECYCLER_RATES,
  SEED_MATERIAL_LOTS,
  SEED_OFFERS,
  SEED_ORDERS,
  SEED_PAYMENTS,
  SEED_HANDOVERS,
  SEED_PASSPORTS,
  SEED_NOTIFICATIONS,
  SEED_COMPLAINTS,
  SEED_AUDIT_LOGS
} from '../data/seedData';

const STORAGE_KEY = 'kabadiwala_connect_db_v1';
const SESSION_KEY = 'kabadiwala_connect_session_v1';

export interface DatabaseState {
  profiles: Profile[];
  collectors: Collector[];
  recyclers: Recycler[];
  materials: Material[];
  priceHistories: PriceHistory[];
  recyclerRates: RecyclerMaterialRate[];
  lots: MaterialLot[];
  offers: RecyclerOffer[];
  orders: Order[];
  payments: Payment[];
  handovers: HandoverRecord[];
  passports: ScrapPassport[];
  notifications: Notification[];
  complaints: Complaint[];
  auditLogs: AuditLog[];
  syncRecords: SyncRecord[];
}

type Listener = () => void;

class DBStoreService {
  private state: DatabaseState;
  private listeners: Set<Listener> = new Set();
  private currentUser: Profile | null = null;
  private authToken: string | null = null;

  constructor() {
    this.state = this.loadInitialState();
    this.loadSession();
  }

  private loadInitialState(): DatabaseState {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load DB state from localStorage', e);
      }
    }

    return {
      profiles: [...SEED_PROFILES],
      collectors: [...SEED_COLLECTORS],
      recyclers: [...SEED_RECYCLERS],
      materials: [...SEED_MATERIALS],
      priceHistories: [...SEED_PRICE_HISTORIES],
      recyclerRates: [...SEED_RECYCLER_RATES],
      lots: [...SEED_MATERIAL_LOTS],
      offers: [...SEED_OFFERS],
      orders: [...SEED_ORDERS],
      payments: [...SEED_PAYMENTS],
      handovers: [...SEED_HANDOVERS],
      passports: [...SEED_PASSPORTS],
      notifications: [...SEED_NOTIFICATIONS],
      complaints: [...SEED_COMPLAINTS],
      auditLogs: [...SEED_AUDIT_LOGS],
      syncRecords: [],
    };
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to persist DB state to localStorage', e);
      }
    }
    this.notify();
  }

  private loadSession() {
    if (typeof window !== 'undefined') {
      try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
          const parsed = JSON.parse(session);
          const found = this.state.profiles.find(p => p.id === parsed.userId);
          if (found) {
            this.currentUser = found;
            this.authToken = parsed.token;
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load session', e);
      }
    }
    // Default demo session: Collector 1
    const defaultCollector = this.state.profiles.find(p => p.id === 'prof-coll-1');
    if (defaultCollector) {
      this.currentUser = defaultCollector;
      this.authToken = 'mock_jwt_token_coll_1';
    }
  }

  private saveSession(profile: Profile | null, token: string | null) {
    this.currentUser = profile;
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (profile && token) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: profile.id, token }));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Session & Auth APIs ---

  public getCurrentUser(): Profile | null {
    return this.currentUser;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public login(identifier: string, role?: UserRole): { success: boolean; message: string; user?: Profile } {
    // Look up by email or phone
    const user = this.state.profiles.find(
      p => (p.email.toLowerCase() === identifier.toLowerCase() || p.phone.includes(identifier)) &&
           (!role || p.role === role)
    );

    if (!user) {
      return { success: false, message: 'Invalid credentials or user not registered.' };
    }

    if (user.account_status === 'suspended') {
      return { success: false, message: 'Your account is suspended. Contact administration.' };
    }

    const token = `mock_jwt_supabase_${user.id}_${Date.now()}`;
    this.saveSession(user, token);

    this.addAuditLog(user.id, user.full_name, user.role, 'USER_LOGIN', 'profile', user.id, {
      method: 'identifier_auth',
      timestamp: new Date().toISOString()
    });

    return { success: true, message: 'Logged in successfully.', user };
  }

  public switchDemoAccount(profileId: string) {
    const user = this.state.profiles.find(p => p.id === profileId);
    if (user) {
      const token = `mock_jwt_supabase_${user.id}_${Date.now()}`;
      this.saveSession(user, token);
    }
  }

  public logout() {
    if (this.currentUser) {
      this.addAuditLog(this.currentUser.id, this.currentUser.full_name, this.currentUser.role, 'USER_LOGOUT', 'profile', this.currentUser.id, {});
    }
    this.saveSession(null, null);
  }

  public registerCollector(data: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pinCode: string;
    language: 'en' | 'hi' | 'mr';
  }): { success: boolean; user?: Profile; message: string } {
    const existing = this.state.profiles.find(p => p.phone === data.phone || (data.email && p.email === data.email));
    if (existing) {
      return { success: false, message: 'An account with this phone number or email already exists.' };
    }

    const profileId = `prof-coll-${Date.now()}`;
    const newProfile: Profile = {
      id: profileId,
      auth_user_id: `auth-${Date.now()}`,
      full_name: data.fullName,
      email: data.email || `${data.phone.replace(/\D/g, '')}@kabadiwalaconnect.org`,
      phone: data.phone,
      role: 'collector',
      preferred_language: data.language,
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newCollector: Collector = {
      id: `coll-${Date.now()}`,
      profile_id: profileId,
      address: data.address,
      city: data.city,
      state: 'Maharashtra',
      pin_code: data.pinCode,
      latitude: 18.5204 + (Math.random() - 0.5) * 0.1,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.profiles.push(newProfile);
    this.state.collectors.push(newCollector);

    this.addAuditLog(newProfile.id, newProfile.full_name, 'collector', 'COLLECTOR_REGISTERED', 'collector', newCollector.id, {
      city: data.city,
      phone: data.phone
    });

    const token = `mock_jwt_supabase_${newProfile.id}_${Date.now()}`;
    this.saveSession(newProfile, token);
    this.saveState();

    return { success: true, user: newProfile, message: 'Collector registered successfully!' };
  }

  public registerRecycler(data: {
    ownerName: string;
    businessName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    pinCode: string;
    gstNumber?: string;
    registrationNumber?: string;
  }): { success: boolean; user?: Profile; message: string } {
    const existing = this.state.profiles.find(p => p.phone === data.phone || p.email === data.email);
    if (existing) {
      return { success: false, message: 'An account with this phone or email already exists.' };
    }

    const profileId = `prof-rec-${Date.now()}`;
    const newProfile: Profile = {
      id: profileId,
      auth_user_id: `auth-${Date.now()}`,
      full_name: data.ownerName,
      email: data.email,
      phone: data.phone,
      role: 'recycler',
      preferred_language: 'en',
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const recyclerId = `rec-${Date.now()}`;
    const newRecycler: Recycler = {
      id: recyclerId,
      profile_id: profileId,
      business_name: data.businessName,
      owner_name: data.ownerName,
      address: data.address,
      city: data.city,
      state: 'Maharashtra',
      pin_code: data.pinCode,
      latitude: 18.5204 + (Math.random() - 0.5) * 0.1,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.1,
      verification_status: 'pending',
      gst_number: data.gstNumber,
      registration_number: data.registrationNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents: [
        {
          id: `doc-${Date.now()}`,
          recycler_id: recyclerId,
          document_type: 'gst_certificate',
          storage_path: `/storage/recyclers/${recyclerId}/gst_proof.pdf`,
          file_name: 'GST_Proof.pdf',
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    };

    this.state.profiles.push(newProfile);
    this.state.recyclers.push(newRecycler);

    this.addAuditLog(newProfile.id, data.ownerName, 'recycler', 'RECYCLER_REGISTERED', 'recycler', recyclerId, {
      business: data.businessName,
      gst: data.gstNumber
    });

    const token = `mock_jwt_supabase_${newProfile.id}_${Date.now()}`;
    this.saveSession(newProfile, token);
    this.saveState();

    return { success: true, user: newProfile, message: 'Recycler registered. Verification documents submitted.' };
  }

  // --- Entity Accessors ---

  public getCollectors(): Collector[] {
    return this.state.collectors.map(c => ({
      ...c,
      profile: this.state.profiles.find(p => p.id === c.profile_id)
    }));
  }

  public getRecyclers(): Recycler[] {
    return this.state.recyclers.map(r => ({
      ...r,
      profile: this.state.profiles.find(p => p.id === r.profile_id),
      rates: this.state.recyclerRates.filter(rate => rate.recycler_id === r.id)
    }));
  }

  public getMaterials(): Material[] {
    return this.state.materials;
  }

  public getMaterialById(id: string): Material | undefined {
    return this.state.materials.find(m => m.id === id);
  }

  public getMaterialLots(): MaterialLot[] {
    return this.state.lots.map(lot => {
      const collector = this.state.collectors.find(c => c.id === lot.collector_id);
      const collectorProfile = collector ? this.state.profiles.find(p => p.id === collector.profile_id) : undefined;
      const material = this.state.materials.find(m => m.id === lot.material_id);
      const offersCount = this.state.offers.filter(o => o.material_lot_id === lot.id).length;

      return {
        ...lot,
        collector: collector ? { ...collector, profile: collectorProfile } : undefined,
        material,
        offers_count: offersCount
      };
    });
  }

  public getLotsByCollector(collectorId: string): MaterialLot[] {
    return this.getMaterialLots().filter(l => l.collector_id === collectorId);
  }

  public getAvailableLots(): MaterialLot[] {
    return this.getMaterialLots().filter(l => l.status === 'available' || l.status === 'offer_received');
  }

  public getOffersForLot(lotId: string): RecyclerOffer[] {
    return this.state.offers
      .filter(o => o.material_lot_id === lotId)
      .map(o => ({
        ...o,
        recycler: this.getRecyclers().find(r => r.id === o.recycler_id),
      }));
  }

  public getOrders(): Order[] {
    return this.state.orders.map(ord => {
      const lot = this.getMaterialLots().find(l => l.id === ord.material_lot_id);
      const collector = this.getCollectors().find(c => c.id === ord.collector_id);
      const recycler = this.getRecyclers().find(r => r.id === ord.recycler_id);
      const payment = this.state.payments.find(p => p.order_id === ord.id);
      const passport = this.state.passports.find(p => p.material_lot_id === ord.material_lot_id);

      return {
        ...ord,
        lot,
        collector,
        recycler,
        payment,
        passport
      };
    });
  }

  public getPassports(): ScrapPassport[] {
    return this.state.passports.map(p => ({
      ...p,
      lot: this.getMaterialLots().find(l => l.id === p.material_lot_id)
    }));
  }

  public getPassportByCode(code: string): ScrapPassport | undefined {
    const passport = this.state.passports.find(p => p.passport_code === code || p.id === code);
    if (!passport) return undefined;

    return {
      ...passport,
      lot: this.getMaterialLots().find(l => l.id === passport.material_lot_id),
    };
  }

  public getNotifications(userId?: string): Notification[] {
    if (!userId) return this.state.notifications;
    return this.state.notifications.filter(n => n.user_id === userId);
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getComplaints(): Complaint[] {
    return this.state.complaints;
  }

  public getSyncRecords(): SyncRecord[] {
    return this.state.syncRecords;
  }

  // --- Core Business Workflows ---

  public createScrapLot(data: {
    collectorId: string;
    materialId: string;
    title: string;
    description: string;
    weight: number;
    weightUnit?: 'kg' | 'ton';
    condition: any;
    pickupAddress: string;
    city: string;
    pinCode: string;
    preferredDate: string;
    preferredTime: string;
    images?: string[];
  }): MaterialLot {
    const material = this.getMaterialById(data.materialId);
    const unitPrice = material ? material.indicative_price : 40.0;
    const estimatedValue = Math.round(data.weight * unitPrice);

    const lotId = `lot-${Date.now()}`;
    const newLot: MaterialLot = {
      id: lotId,
      collector_id: data.collectorId,
      material_id: data.materialId,
      title: data.title,
      description: data.description,
      quantity: 1,
      weight: data.weight,
      weight_unit: data.weightUnit || 'kg',
      estimated_value: estimatedValue,
      condition: data.condition,
      pickup_address: data.pickupAddress,
      city: data.city,
      pin_code: data.pinCode,
      latitude: 18.5204,
      longitude: 73.8567,
      preferred_pickup_date: data.preferredDate,
      preferred_pickup_time: data.preferredTime,
      status: 'available',
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80'
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.lots.unshift(newLot);

    // Automatically mint active initial Scrap Passport
    const passportCode = `KC-PASSPORT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPassport: ScrapPassport = {
      id: `pass-${Date.now()}`,
      material_lot_id: lotId,
      passport_code: passportCode,
      qr_payload: `https://kabadiwalaconnect.org/verify/${passportCode}?mat=${material?.category || 'Scrap'}&w=${data.weight}&col=${data.collectorId}`,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      events: [
        {
          id: `evt-${Date.now()}`,
          passport_id: `pass-${Date.now()}`,
          event_type: 'created',
          actor_id: data.collectorId,
          actor_name: this.currentUser?.full_name || 'Collector',
          actor_role: 'collector',
          location: `${data.city}, MH`,
          metadata: { initial_weight: data.weight, material: material?.name },
          created_at: new Date().toISOString(),
        }
      ]
    };
    this.state.passports.push(newPassport);

    // Notify registered recyclers in the area
    this.state.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: 'prof-rec-1',
      title: 'New Scrap Lot Available! 📦',
      message: `${data.title} (${data.weight} kg) listed in ${data.city}.`,
      notification_type: 'system',
      related_entity_type: 'lot',
      related_entity_id: lotId,
      created_at: new Date().toISOString(),
    });

    this.addAuditLog(data.collectorId, this.currentUser?.full_name || 'Collector', 'collector', 'SCRAP_LOT_CREATED', 'material_lot', lotId, {
      material: material?.name,
      weight: data.weight,
      estimated_value: estimatedValue
    });

    this.saveState();
    return newLot;
  }

  public saveOfflineDraft(data: any): SyncRecord {
    const syncId = `sync-${Date.now()}`;
    const record: SyncRecord = {
      id: syncId,
      user_id: this.currentUser?.id || 'anonymous',
      client_operation_id: `op-${Math.random().toString(36).substring(2, 9)}`,
      operation_type: 'create_listing',
      entity_type: 'material_lot_draft',
      entity_id: `draft-${Date.now()}`,
      sync_status: 'saved_locally',
      payload: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.syncRecords.unshift(record);
    this.saveState();
    return record;
  }

  public syncPendingRecord(syncId: string): boolean {
    const record = this.state.syncRecords.find(r => r.id === syncId);
    if (!record) return false;

    record.sync_status = 'syncing';
    this.saveState();

    try {
      if (record.operation_type === 'create_listing') {
        this.createScrapLot(record.payload);
        record.sync_status = 'synced';
        record.updated_at = new Date().toISOString();
        this.saveState();
        return true;
      }
    } catch (e: any) {
      record.sync_status = 'failed';
      record.error_message = e?.message || 'Sync failed';
      this.saveState();
      return false;
    }
    return false;
  }

  public makeOffer(data: {
    lotId: string;
    recyclerId: string;
    offeredPrice: number;
    offeredQuantity: number;
    pickupProposal: string;
    message: string;
    validDays?: number;
  }): RecyclerOffer {
    const lot = this.state.lots.find(l => l.id === data.lotId);
    if (!lot) throw new Error('Listing not found');

    const offerId = `off-${Date.now()}`;
    const totalAmount = Math.round(data.offeredPrice * data.offeredQuantity);
    const validUntil = new Date(Date.now() + (data.validDays || 3) * 86400000).toISOString();

    const recycler = this.getRecyclers().find(r => r.id === data.recyclerId);

    const newOffer: RecyclerOffer = {
      id: offerId,
      material_lot_id: data.lotId,
      recycler_id: data.recyclerId,
      offered_price: data.offeredPrice,
      offered_quantity: data.offeredQuantity,
      total_offered_amount: totalAmount,
      pickup_proposal: data.pickupProposal,
      valid_until: validUntil,
      message: data.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recycler
    };

    this.state.offers.push(newOffer);

    // Update lot status if it was available
    if (lot.status === 'available') {
      lot.status = 'offer_received';
      lot.updated_at = new Date().toISOString();
    }

    // Notify collector
    const collector = this.state.collectors.find(c => c.id === lot.collector_id);
    if (collector) {
      this.state.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: collector.profile_id,
        title: 'New Offer Received! 🎉',
        message: `${recycler?.business_name || 'A recycler'} offered ₹${data.offeredPrice}/kg (Total ₹${totalAmount.toLocaleString('en-IN')}) for "${lot.title}".`,
        notification_type: 'offer_new',
        related_entity_type: 'offer',
        related_entity_id: offerId,
        created_at: new Date().toISOString(),
      });
    }

    this.addAuditLog(data.recyclerId, recycler?.business_name || 'Recycler', 'recycler', 'OFFER_MADE', 'recycler_offer', offerId, {
      lot_id: data.lotId,
      price: data.offeredPrice,
      quantity: data.offeredQuantity
    });

    this.saveState();
    return newOffer;
  }

  public acceptOffer(offerId: string): Order {
    const offer = this.state.offers.find(o => o.id === offerId);
    if (!offer) throw new Error('Offer not found');

    const lot = this.state.lots.find(l => l.id === offer.material_lot_id);
    if (!lot) throw new Error('Associated scrap lot not found');

    // Database transaction simulation:
    // 1. Mark this offer as accepted
    offer.status = 'accepted';
    offer.updated_at = new Date().toISOString();

    // 2. Reject/expire other pending offers for this lot
    this.state.offers
      .filter(o => o.material_lot_id === lot.id && o.id !== offerId)
      .forEach(other => {
        other.status = 'rejected';
        other.updated_at = new Date().toISOString();
      });

    // 3. Update lot status
    lot.status = 'offer_accepted';
    lot.accepted_offer_id = offerId;
    lot.updated_at = new Date().toISOString();

    // 4. Create new Order
    const orderId = `ord-${Date.now()}`;
    const orderCode = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      order_code: orderCode,
      material_lot_id: lot.id,
      accepted_offer_id: offerId,
      collector_id: lot.collector_id,
      recycler_id: offer.recycler_id,
      agreed_price: offer.offered_price,
      agreed_quantity: offer.offered_quantity,
      pickup_date: lot.preferred_pickup_date,
      pickup_time: lot.preferred_pickup_time,
      order_status: 'accepted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.orders.unshift(newOrder);

    // 5. Append traceability event to Passport
    const passport = this.state.passports.find(p => p.material_lot_id === lot.id);
    const recycler = this.getRecyclers().find(r => r.id === offer.recycler_id);
    if (passport) {
      if (!passport.events) passport.events = [];
      passport.events.push({
        id: `evt-${Date.now()}`,
        passport_id: passport.id,
        event_type: 'offer_accepted',
        actor_id: lot.collector_id,
        actor_name: this.currentUser?.full_name || 'Collector',
        actor_role: 'collector',
        location: `${lot.city}, MH`,
        metadata: {
          order_code: orderCode,
          recycler_name: recycler?.business_name,
          agreed_rate: `₹${offer.offered_price}/kg`
        },
        created_at: new Date().toISOString(),
      });
      passport.updated_at = new Date().toISOString();
    }

    // 6. Notify recycler
    if (recycler) {
      this.state.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: recycler.profile_id,
        title: 'Offer Accepted! 🤝',
        message: `Collector accepted your offer of ₹${offer.offered_price}/kg for lot "${lot.title}". Order ${orderCode} created.`,
        notification_type: 'offer_accepted',
        related_entity_type: 'order',
        related_entity_id: orderId,
        created_at: new Date().toISOString(),
      });
    }

    this.addAuditLog(lot.collector_id, this.currentUser?.full_name || 'Collector', 'collector', 'OFFER_ACCEPTED', 'order', orderId, {
      offer_id: offerId,
      order_code: orderCode,
      agreed_rate: offer.offered_price
    });

    this.saveState();
    return newOrder;
  }

  public schedulePickup(orderId: string, date: string, time: string): Order {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.pickup_date = date;
    order.pickup_time = time;
    order.order_status = 'pickup_scheduled';
    order.updated_at = new Date().toISOString();

    const lot = this.state.lots.find(l => l.id === order.material_lot_id);
    if (lot) {
      lot.status = 'pickup_scheduled';
      lot.updated_at = new Date().toISOString();
    }

    const passport = this.state.passports.find(p => p.material_lot_id === order.material_lot_id);
    if (passport) {
      if (!passport.events) passport.events = [];
      passport.events.push({
        id: `evt-${Date.now()}`,
        passport_id: passport.id,
        event_type: 'pickup_scheduled',
        actor_id: order.recycler_id,
        actor_name: 'Verified Recycler',
        actor_role: 'recycler',
        location: lot?.city || 'Pune',
        metadata: { date, time },
        created_at: new Date().toISOString(),
      });
    }

    this.saveState();
    return order;
  }

  public confirmHandoverAndPay(params: {
    orderId: string;
    finalWeight: number;
    finalPricePerKg: number;
    paymentMethod: 'UPI' | 'Cash' | 'Bank Transfer' | 'Other';
    paymentReference: string;
    notes?: string;
  }): { order: Order; payment: Payment } {
    const order = this.state.orders.find(o => o.id === params.orderId);
    if (!order) throw new Error('Order not found');

    const totalAmount = Math.round(params.finalWeight * params.finalPricePerKg);

    // Update order
    order.final_weight = params.finalWeight;
    order.final_amount = totalAmount;
    order.order_status = 'completed';
    order.updated_at = new Date().toISOString();

    // Update lot
    const lot = this.state.lots.find(l => l.id === order.material_lot_id);
    if (lot) {
      lot.status = 'completed';
      lot.weight = params.finalWeight;
      lot.updated_at = new Date().toISOString();
    }

    // Create Handover record
    const handover: HandoverRecord = {
      id: `hand-${Date.now()}`,
      order_id: order.id,
      collector_confirmation: true,
      recycler_confirmation: true,
      handover_date: new Date().toISOString(),
      final_weight: params.finalWeight,
      notes: params.notes || 'Handover inspection verified and complete.',
      created_at: new Date().toISOString(),
    };
    this.state.handovers.push(handover);

    // Create Payment record
    const paymentId = `pay-${Date.now()}`;
    const payment: Payment = {
      id: paymentId,
      order_id: order.id,
      amount: totalAmount,
      payment_method: params.paymentMethod,
      payment_status: 'paid',
      payment_reference: params.paymentReference || `UPI/${Date.now()}/KABADIWALA_SETTLEMENT`,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.payments.push(payment);

    // Update Passport status & add traceability events
    const passport = this.state.passports.find(p => p.material_lot_id === order.material_lot_id);
    if (passport) {
      passport.status = 'recycled';
      passport.updated_at = new Date().toISOString();
      if (!passport.events) passport.events = [];

      passport.events.push({
        id: `evt-${Date.now()}-1`,
        passport_id: passport.id,
        event_type: 'handed_over',
        actor_id: order.recycler_id,
        actor_name: 'Verified Recycler',
        actor_role: 'recycler',
        location: lot?.city || 'Pune',
        metadata: { final_weight: `${params.finalWeight} kg`, notes: params.notes },
        created_at: new Date().toISOString(),
      });

      passport.events.push({
        id: `evt-${Date.now()}-2`,
        passport_id: passport.id,
        event_type: 'payment_settled',
        actor_id: order.recycler_id,
        actor_name: 'Verified Recycler',
        actor_role: 'recycler',
        location: lot?.city || 'Pune',
        metadata: {
          amount: `₹${totalAmount.toLocaleString('en-IN')}`,
          method: params.paymentMethod,
          ref: params.paymentReference
        },
        created_at: new Date().toISOString(),
      });
    }

    // Notify Collector
    const collector = this.state.collectors.find(c => c.id === order.collector_id);
    if (collector) {
      this.state.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: collector.profile_id,
        title: 'Payment Received! 💰',
        message: `₹${totalAmount.toLocaleString('en-IN')} received for Order ${order.order_code} via ${params.paymentMethod}.`,
        notification_type: 'payment_received',
        related_entity_type: 'payment',
        related_entity_id: paymentId,
        created_at: new Date().toISOString(),
      });
    }

    this.addAuditLog(order.recycler_id, 'Recycler', 'recycler', 'HANDOVER_AND_PAYMENT_RECORDED', 'payment', paymentId, {
      order_id: order.id,
      amount: totalAmount,
      method: params.paymentMethod
    });

    this.saveState();
    return { order, payment };
  }

  // --- Recycler Rate Management ---

  public updateRecyclerRate(recyclerId: string, materialId: string, rate: number, minQty: number = 20) {
    const existing = this.state.recyclerRates.find(r => r.recycler_id === recyclerId && r.material_id === materialId);
    if (existing) {
      existing.rate = rate;
      existing.minimum_quantity = minQty;
      existing.updated_at = new Date().toISOString();
    } else {
      const newRate: RecyclerMaterialRate = {
        id: `rate-${Date.now()}`,
        recycler_id: recyclerId,
        material_id: materialId,
        rate,
        unit: 'kg',
        minimum_quantity: minQty,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.state.recyclerRates.push(newRate);
    }
    this.saveState();
  }

  // --- Admin Operations ---

  public adminVerifyRecycler(recyclerId: string, status: 'approved' | 'rejected' | 'requires_info', notes: string) {
    const recycler = this.state.recyclers.find(r => r.id === recyclerId);
    if (!recycler) throw new Error('Recycler not found');

    recycler.verification_status = status;
    recycler.updated_at = new Date().toISOString();

    if (recycler.documents) {
      recycler.documents.forEach(doc => {
        doc.verification_status = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';
        doc.review_notes = notes;
        doc.reviewed_by = this.currentUser?.full_name || 'Admin';
        doc.updated_at = new Date().toISOString();
      });
    }

    this.state.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: recycler.profile_id,
      title: `Verification Status: ${status.toUpperCase()} 🛡️`,
      message: `Your recycler account verification was updated: "${notes}"`,
      notification_type: 'verification',
      related_entity_type: 'recycler',
      related_entity_id: recyclerId,
      created_at: new Date().toISOString(),
    });

    this.addAuditLog(this.currentUser?.id || 'admin-1', this.currentUser?.full_name || 'Admin', 'admin', 'RECYCLER_VERIFICATION_UPDATED', 'recycler', recyclerId, {
      status,
      notes
    });

    this.saveState();
  }

  public adminUpdateMaterialPrice(materialId: string, newPrice: number) {
    const material = this.state.materials.find(m => m.id === materialId);
    if (!material) throw new Error('Material not found');

    const oldPrice = material.indicative_price;
    material.indicative_price = newPrice;
    material.price_trend = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'stable';
    material.updated_at = new Date().toISOString();

    // Record price history
    this.state.priceHistories.unshift({
      id: `ph-${Date.now()}`,
      material_id: materialId,
      price: newPrice,
      unit: material.unit,
      source: 'Admin Board Review',
      effective_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    });

    this.addAuditLog(this.currentUser?.id || 'admin', this.currentUser?.full_name || 'Admin', 'admin', 'MATERIAL_PRICE_UPDATED', 'material', materialId, {
      material: material.name,
      oldPrice,
      newPrice
    });

    this.saveState();
  }

  public adminUpdateComplaint(complaintId: string, status: any, notes: string) {
    const comp = this.state.complaints.find(c => c.id === complaintId);
    if (!comp) return;

    comp.status = status;
    comp.resolution_notes = notes;
    comp.updated_at = new Date().toISOString();

    this.addAuditLog(this.currentUser?.id || 'admin', this.currentUser?.full_name || 'Admin', 'admin', 'COMPLAINT_UPDATED', 'complaint', complaintId, {
      status,
      notes
    });

    this.saveState();
  }

  // --- Audit Log Helper ---

  private addAuditLog(
    actorId: string,
    actorName: string,
    actorRole: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, any>
  ) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor_id: actorId,
      actor_name: actorName,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
  }

  public resetToDefaultSeed() {
    this.state = {
      profiles: [...SEED_PROFILES],
      collectors: [...SEED_COLLECTORS],
      recyclers: [...SEED_RECYCLERS],
      materials: [...SEED_MATERIALS],
      priceHistories: [...SEED_PRICE_HISTORIES],
      recyclerRates: [...SEED_RECYCLER_RATES],
      lots: [...SEED_MATERIAL_LOTS],
      offers: [...SEED_OFFERS],
      orders: [...SEED_ORDERS],
      payments: [...SEED_PAYMENTS],
      handovers: [...SEED_HANDOVERS],
      passports: [...SEED_PASSPORTS],
      notifications: [...SEED_NOTIFICATIONS],
      complaints: [...SEED_COMPLAINTS],
      auditLogs: [...SEED_AUDIT_LOGS],
      syncRecords: [],
    };
    this.saveState();
    this.loadSession();
  }
}

export const dbStore = new DBStoreService();
