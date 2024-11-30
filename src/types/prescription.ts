export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionFormData {
  patientId: string;
  patientName: string;
  date: string;
  medicines: Medicine[];
  notes?: string;
}

export interface Prescription extends PrescriptionFormData {
  id: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}
