// ========================================================
// RESCUE4PAWS TRANSPORT NETWORK — TYPE DEFINITIONS
// ========================================================

export type ShipmentType = 'self' | 'send_to_other';

export type ShipmentCategory =
  | 'pets'
  | 'pet_supplies'
  | 'documents'
  | 'electronics'
  | 'furniture'
  | 'household_goods'
  | 'medical_equipment'
  | 'machinery'
  | 'clothing'
  | 'fragile'
  | 'artwork_antiques'
  | 'business_cargo'
  | 'other_valuables';

export type ShippingMethod = 'land' | 'air';

export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'PAID' | 'REJECTED';

export type TrackingStatus =
  | 'SHIPMENT_CREATED'
  | 'SHIPMENT_RECEIVED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_SORTING_CENTER'
  | 'CUSTOMS_CLEARANCE'
  | 'CUSTOMS_HOLD'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'RETURNED_TO_SENDER';

export const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  SHIPMENT_CREATED: 'Shipment Created',
  SHIPMENT_RECEIVED: 'Shipment Received',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  ARRIVED_AT_SORTING_CENTER: 'Arrived at Sorting Center',
  CUSTOMS_CLEARANCE: 'Customs Clearance',
  CUSTOMS_HOLD: 'Customs Hold',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  DELAYED: 'Delayed',
  RETURNED_TO_SENDER: 'Returned to Sender',
};

export const CATEGORY_LABELS: Record<ShipmentCategory, string> = {
  pets: 'Pets',
  pet_supplies: 'Pet Supplies & Accessories',
  documents: 'Documents',
  electronics: 'Electronics',
  furniture: 'Furniture',
  household_goods: 'Household Goods',
  medical_equipment: 'Medical Equipment',
  machinery: 'Machinery',
  clothing: 'Clothing & Personal Items',
  fragile: 'Fragile Items',
  artwork_antiques: 'Artwork & Antiques',
  business_cargo: 'Business Cargo',
  other_valuables: 'Other Valuables',
};

export const PET_CRATE_SIZES = [
  'XS — Up to 10 lbs (Toy breeds)',
  'S — 11–25 lbs (Small breeds)',
  'M — 26–40 lbs (Medium breeds)',
  'L — 41–70 lbs (Large breeds)',
  'XL — 71–90 lbs (Extra-large breeds)',
  'XXL — 90+ lbs (Giant breeds)',
];

export interface ShipmentPricingTier {
  id: string;
  name: string;
  shipping_method: ShippingMethod;
  min_distance_km: number;
  max_distance_km: number | null;
  base_fee: number;
  per_km_rate: number;
  per_kg_rate: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Shipment {
  id: string;

  // Intent
  shipment_type: ShipmentType;
  shipment_category: ShipmentCategory;
  shipping_method: ShippingMethod;

  // Sender
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;

  // Recipient
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;

  // Locations
  pickup_address: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  destination_address: string;
  destination_latitude: number | null;
  destination_longitude: number | null;
  distance_km: number | null;

  // Package
  package_description: string | null;
  weight_kg: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  num_packages: number;
  declared_value: number | null;
  special_handling: string | null;
  preferred_delivery_date: string | null;

  // Pet details
  pet_name: string | null;
  pet_species: string | null;
  pet_breed: string | null;
  pet_age: string | null;
  pet_weight_kg: number | null;
  pet_crate_size: string | null;
  pet_health_status: string | null;
  pet_special_care: string | null;

  // Pricing
  pricing_tier_id: string | null;
  transport_fee_amount: number | null;
  transport_fee_currency: string;
  security_deposit_amount: number | null;
  security_deposit_currency: string;

  // Transport fee payment
  transport_fee_status: PaymentStatus;
  transport_fee_proof_url: string | null;
  transport_fee_bank_id: string | null;
  transport_fee_amount_claimed: number | null;
  transport_fee_reference: string | null;
  transport_fee_rejection_reason: string | null;
  transport_fee_reviewed_at: string | null;

  // Security deposit payment
  security_deposit_status: PaymentStatus;
  security_deposit_proof_url: string | null;
  security_deposit_bank_id: string | null;
  security_deposit_amount_claimed: number | null;
  security_deposit_reference: string | null;
  security_deposit_rejection_reason: string | null;
  security_deposit_reviewed_at: string | null;

  // Tracking
  tracking_number: string | null;
  current_status: TrackingStatus;
  current_location: string | null;
  estimated_delivery_date: string | null;
  admin_notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface ShipmentTrackingEvent {
  id: string;
  shipment_id: string;
  status: TrackingStatus;
  location: string | null;
  notes: string | null;
  event_time: string;
  posted_by: string | null;
  created_at: string;
}

// Bank account type re-used from main site
export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string | null;
  routing_number: string | null;
  account_type: 'checking' | 'savings' | null;
  swift_code: string | null;
  currency: string;
  is_active: boolean;
  notes: string | null;
  logo_url: string | null;
  method_type: string;
  handle: string | null;
  display_label: string | null;
}

// Utility: calculate transport fee from a tier + inputs
export function calculateFee(
  tier: ShipmentPricingTier,
  distanceKm: number,
  weightKg: number,
): number {
  return tier.base_fee + (distanceKm * tier.per_km_rate) + (weightKg * tier.per_kg_rate);
}

// Utility: Haversine distance in km
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Utility: generate tracking number SHP-YYYY-XXXX
export function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SHP-${year}-${rand}`;
}
