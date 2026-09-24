export type MedicineCategory =
  | 'all'
  | 'cognitive'
  | 'cardio'
  | 'vitamins'
  | 'geriatric'
  | 'devices'
  | 'sleep';

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  category: MedicineCategory;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Drops' | 'Device' | 'Test Strip';
  strength: string;
  price: number;
  mrp: number;
  discountPercent: number;
  packSize: string;
  requiresPrescription: boolean;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  deliveryEstimate: string;
  deliveryEstimateHi: string;
  manufacturer: string;
  descriptionEn: string;
  descriptionHi: string;
  benefitsEn: string[];
  benefitsHi: string[];
  usageEn: string;
  usageHi: string;
  imageIcon: string;
  linkedMedicineName?: string;
}

export interface CartItem {
  medicine: MedicineItem;
  quantity: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  addressLine: string;
  landmark?: string;
  city: string;
  pincode: string;
  type: 'home' | 'caregiver' | 'emergency';
}

export type DeliverySpeed = 'express' | 'standard' | 'subscription';

export type PaymentMethod = 'cod' | 'upi' | 'caregiver_autopay' | 'card';

export interface TrackingStep {
  step: number;
  titleEn: string;
  titleHi: string;
  time: string;
  completed: boolean;
  active: boolean;
}

export interface MedicineOrder {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  deliverySpeed: DeliverySpeed;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending_cod';
  orderStatus: 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
  prescriptionUploaded: boolean;
  prescriptionFileName?: string;
  riderInfo?: {
    name: string;
    phone: string;
    rating: number;
    vehicleNumber: string;
    currentLocation: string;
  };
  pharmacyPartner: {
    name: string;
    address: string;
    licenseNumber: string;
  };
  trackingSteps: TrackingStep[];
}
