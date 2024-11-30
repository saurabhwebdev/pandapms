export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  address: string;
  medicalHistory: string;
}

export interface Patient extends PatientFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}
