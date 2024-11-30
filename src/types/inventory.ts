export type SupplierContact = {
  name: string;
  email: string;
  phone: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: SupplierContact;
  address: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  price: number;
  supplierId: string;
  location?: string;
  expiryDate?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';

export type PurchaseOrderItem = {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryFormData = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;
export type SupplierFormData = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
export type PurchaseOrderFormData = Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>;

export interface InventoryState {
  items: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
}
