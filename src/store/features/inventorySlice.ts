import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { auth } from '../../services/firebase/config';
import { InventoryItem, Supplier, PurchaseOrder, InventoryFormData, SupplierFormData, PurchaseOrderFormData } from '../../types/inventory';
import { RootState } from '../store';

interface InventoryState {
  items: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  suppliers: [],
  purchaseOrders: [],
  loading: false,
  error: null,
};

// Helper function to generate PO number
const generatePONumber = (latestNumber: number = 0): string => {
  const prefix = 'PO';
  const year = new Date().getFullYear().toString().slice(-2);
  const number = (latestNumber + 1).toString().padStart(4, '0');
  return `${prefix}${year}${number}`;
};

// Fetch inventory items
export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const itemsRef = collection(db, 'inventory');
      const q = query(
        itemsRef,
        where('clinicId', '==', user.uid),
        orderBy('name', 'asc')
      );

      try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InventoryItem[];
      } catch (error: any) {
        console.error('Firebase Query Error:', error);
        if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
          console.log('Firebase Index Creation URL:', error?.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]);
          return rejectWithValue('Missing required index. Check console for index creation link.');
        }
        throw error;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Add inventory item
export const addInventoryItem = createAsyncThunk(
  'inventory/addItem',
  async (data: InventoryFormData, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const now = new Date().toISOString();
      const itemData = {
        ...data,
        clinicId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'inventory'), itemData);
      return { id: docRef.id, ...itemData } as InventoryItem;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update inventory item
export const updateInventoryItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, data }: { id: string; data: Partial<InventoryFormData> }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const itemRef = doc(db, 'inventory', id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(itemRef, updateData);
      return { id, ...updateData } as InventoryItem;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete inventory item
export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const itemRef = doc(db, 'inventory', id);
      await deleteDoc(itemRef);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch suppliers
export const fetchSuppliers = createAsyncThunk(
  'inventory/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const suppliersRef = collection(db, 'suppliers');
      const q = query(
        suppliersRef,
        where('clinicId', '==', user.uid),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supplier[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Add supplier
export const addSupplier = createAsyncThunk(
  'inventory/addSupplier',
  async (data: SupplierFormData, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const now = new Date().toISOString();
      const supplierData = {
        ...data,
        clinicId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'suppliers'), supplierData);
      return { id: docRef.id, ...supplierData } as Supplier;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create purchase order
export const createPurchaseOrder = createAsyncThunk(
  'inventory/createPO',
  async (data: PurchaseOrderFormData, { getState, rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const state = getState() as RootState;
      const currentPOs = state.inventory.purchaseOrders;
      const latestPONumber = currentPOs.length > 0
        ? parseInt(currentPOs[0].poNumber.slice(-4))
        : 0;

      const now = new Date().toISOString();
      const poData = {
        ...data,
        clinicId: user.uid,
        poNumber: generatePONumber(latestPONumber),
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'purchaseOrders'), poData);
      return { id: docRef.id, ...poData } as PurchaseOrder;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add item
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update item
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Delete item
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
        state.loading = false;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add supplier
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.suppliers.unshift(action.payload);
      })
      // Create purchase order
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders.unshift(action.payload);
      });
  },
});

export const selectInventoryItems = (state: RootState) => state.inventory.items;
export const selectSuppliers = (state: RootState) => state.inventory.suppliers;
export const selectPurchaseOrders = (state: RootState) => state.inventory.purchaseOrders;
export const selectInventoryLoading = (state: RootState) => state.inventory.loading;
export const selectInventoryError = (state: RootState) => state.inventory.error;

export default inventorySlice.reducer;
