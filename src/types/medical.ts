export interface HospitalInfo {
  id: string;
  name: string;
  nameHi: string;
  address: string;
  city: string;
  distanceKm: number;
  driveTimeMin: number;
  emergencyAvailable24x7: boolean;
  neuroDepartment: string;
  neuroICUBeds: number;
  phone: string;
  emergencyPhone: string;
  rating: number;
  reviewsCount: number;
  type: 'Premier Tertiary' | 'Super Speciality' | 'Government AIIMS' | 'Private Super Speciality';
  availableNeuroSurgeonNow: boolean;
  currentNeuroSurgeonOnDuty: string;
  mapsUrl: string;
  lat: number;
  lng: number;
  facilities: string[];
}

export type AvailabilityStatus = 'available_now' | 'on_call_emergency' | 'in_opd' | 'available_tomorrow';

export interface NeuroSurgeon {
  id: string;
  name: string;
  degrees: string;
  designation: string;
  hospital: string;
  hospitalId: string;
  experienceYears: number;
  specialties: string[];
  specialtiesHi: string[];
  availabilityStatus: AvailabilityStatus;
  currentShift: string;
  currentShiftHi: string;
  nextSlot: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  consultationFee: string;
  languages: string[];
  emergencyOnCall: boolean;
}

export interface PatientEmergencyCard {
  patientName: string;
  age: number;
  bloodGroup: string;
  condition: string;
  allergies: string;
  currentMedications: string[];
  primaryCaregiver: string;
  primaryCaregiverPhone: string;
  emergencyContact: string;
  treatingNeurologist?: string;
}
