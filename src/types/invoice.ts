export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'netbanking' | 'other';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tax?: number;
}

export interface InvoiceFormData {
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  currency: string;
}

export interface Invoice extends InvoiceFormData {
  id: string;
  invoiceNumber: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  paidAmount?: number;
  paidDate?: string;
}
