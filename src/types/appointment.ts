export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface AppointmentFormData {
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  notes: string;
  status: AppointmentStatus;
  treatmentType?: string;
  duration?: number; // in minutes
}

export interface Appointment extends AppointmentFormData {
  id: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}
