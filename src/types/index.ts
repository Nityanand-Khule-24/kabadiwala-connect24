export type UserRole = 'collector' | 'recycler' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  preferred_language: LanguageCode;
  account_status: 'active' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface Collector {
  id: string;
  profile_id: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  // joined fields
  profile?: Profile;
}

export interface Recycler {
  id: string;
  profile_id: string;
  business_name: string;
  owner_name: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  latitude: number;
  longitude: number;
  verification_status: 'pending' | 'approved' | 'rejected' | 'requires_info';
  gst_number?: string;
  registration_number?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  documents?: RecyclerDocument[];
  rates?: RecyclerMaterialRate[];
}

export interface RecyclerDocument {
  id: string;
  recycler_id: string;
  document_type: 'gst_certificate' | 'business_license' | 'pollution_board_noc' | 'id_proof';
  storage_path: string;
  file_name: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  category: 'Metals' | 'Plastics' | 'Paper & Cardboard' | 'Glass' | 'E-Waste' | 'Batteries' | 'Other';
  subtype: string;
  unit: 'kg' | 'ton' | 'pieces';
  description: string;
  indicative_price: number; // INR per unit
  price_trend: 'up' | 'down' | 'stable';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ListingStatus = 
  | 'draft' 
  | 'available' 
  | 'offer_received' 
  | 'offer_accepted' 
  | 'pickup_scheduled' 
  | 'completed' 
  | 'cancelled';

export interface MaterialLot {
  id: string;
  collector_id: string;
  material_id: string;
  title: string;
  description: string;
  quantity: number;
  weight: number;
  weight_unit: 'kg' | 'ton';
  estimated_value: number;
  condition: 'Clean / Sorted' | 'Mixed Scrap' | 'Industrial Offcut' | 'Electronic Scrap' | 'Baled';
  pickup_address: string;
  city: string;
  pin_code: string;
  latitude: number;
  longitude: number;
  preferred_pickup_date: string;
  preferred_pickup_time: string;
  status: ListingStatus;
  images: string[];
  created_at: string;
  updated_at: string;
  // relations
  collector?: Collector;
  material?: Material;
  offers_count?: number;
  accepted_offer_id?: string;
}

export interface RecyclerMaterialRate {
  id: string;
  recycler_id: string;
  material_id: string;
  rate: number; // INR per unit
  unit: string;
  minimum_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  material?: Material;
}

export interface PriceHistory {
  id: string;
  material_id: string;
  price: number;
  unit: string;
  source: string;
  effective_date: string;
  created_at: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';

export interface RecyclerOffer {
  id: string;
  material_lot_id: string;
  recycler_id: string;
  offered_price: number; // per unit
  offered_quantity: number;
  total_offered_amount: number;
  pickup_proposal: string;
  valid_until: string;
  message: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  recycler?: Recycler;
  lot?: MaterialLot;
}

export type OrderStatus = 
  | 'accepted' 
  | 'pickup_scheduled' 
  | 'handover_pending' 
  | 'handed_over' 
  | 'payment_pending' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

export interface Order {
  id: string;
  order_code: string;
  material_lot_id: string;
  accepted_offer_id: string;
  collector_id: string;
  recycler_id: string;
  agreed_price: number;
  agreed_quantity: number;
  final_weight?: number;
  final_amount?: number;
  pickup_date: string;
  pickup_time: string;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
  lot?: MaterialLot;
  collector?: Collector;
  recycler?: Recycler;
  payment?: Payment;
  passport?: ScrapPassport;
}

export interface HandoverRecord {
  id: string;
  order_id: string;
  collector_confirmation: boolean;
  recycler_confirmation: boolean;
  handover_date: string;
  final_weight: number;
  notes: string;
  created_at: string;
}

export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer' | 'Other';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapPassport {
  id: string;
  material_lot_id: string;
  passport_code: string;
  qr_payload: string;
  status: 'active' | 'transferred' | 'recycled' | 'revoked';
  qr_image_url?: string;
  created_at: string;
  updated_at: string;
  lot?: MaterialLot;
  events?: TraceabilityEvent[];
}

export interface TraceabilityEvent {
  id: string;
  passport_id: string;
  event_type: 'created' | 'verified' | 'offer_accepted' | 'pickup_scheduled' | 'handed_over' | 'payment_settled' | 'recycled';
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  location: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'offer_new' | 'offer_accepted' | 'pickup_scheduled' | 'payment_received' | 'verification' | 'system';
  related_entity_type?: string;
  related_entity_id?: string;
  read_at?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  order_id?: string;
  category: 'Price Discrepancy' | 'Pickup Delay' | 'Weight Mismatch' | 'Payment Issue' | 'Behavior / Conduct' | 'Other';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_admin?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncRecord {
  id: string;
  user_id: string;
  client_operation_id: string;
  operation_type: 'create_listing' | 'accept_offer' | 'confirm_handover';
  entity_type: string;
  entity_id: string;
  sync_status: 'saved_locally' | 'syncing' | 'synced' | 'failed';
  error_message?: string;
  payload: any;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}
