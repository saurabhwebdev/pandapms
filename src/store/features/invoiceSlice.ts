import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { auth } from '../../services/firebase/config';
import { Invoice, InvoiceFormData } from '../../types/invoice';
import { RootState } from '../store';

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
};

// Helper function to generate invoice number
function generateInvoiceNumber(latestNumber: number = 0): string {
  const nextNumber = latestNumber + 1;
  return `INV${nextNumber.toString().padStart(4, '0')}`;
}

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const invoicesRef = collection(db, 'clinics', user.uid, 'invoices');
      const q = query(
        invoicesRef,
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
    } catch (error: any) {
      console.error('Fetch Invoices Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addInvoice = createAsyncThunk(
  'invoices/addInvoice',
  async (data: InvoiceFormData, { getState, rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get current invoices to generate next invoice number
      const state = getState() as RootState;
      const currentInvoices = state.invoices.invoices;
      const latestInvoiceNumber = currentInvoices.length > 0
        ? parseInt(currentInvoices[0].invoiceNumber.slice(-4))
        : 0;

      const now = Timestamp.now().toDate().toISOString();
      const invoiceData = {
        ...data,
        clinicId: user.uid,
        invoiceNumber: generateInvoiceNumber(latestInvoiceNumber),
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'clinics', user.uid, 'invoices'), invoiceData);
      return { id: docRef.id, ...invoiceData } as Invoice;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, data }: { id: string; data: Partial<InvoiceFormData> }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const invoiceRef = doc(db, 'clinics', user.uid, 'invoices', id);
      const updatedData = {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      await updateDoc(invoiceRef, updatedData);
      return { id, ...updatedData } as Invoice;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const invoiceRef = doc(db, 'clinics', user.uid, 'invoices', id);
      await deleteDoc(invoiceRef);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markInvoiceAsPaid = createAsyncThunk(
  'invoices/markAsPaid',
  async ({ id, amount, paymentMethod }: { id: string; amount: number; paymentMethod: string }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const invoiceRef = doc(db, 'clinics', user.uid, 'invoices', id);
      const paidData = {
        status: 'paid',
        paidAmount: amount,
        paidDate: Timestamp.now().toDate().toISOString(),
        paymentMethod,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      await updateDoc(invoiceRef, paidData);
      return { id, ...paidData };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
        state.loading = false;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add invoice
      .addCase(addInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = { ...state.invoices[index], ...action.payload };
        }
        state.loading = false;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter(i => i.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark as paid
      .addCase(markInvoiceAsPaid.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = { ...state.invoices[index], ...action.payload };
        }
      });
  }
});

export const selectInvoices = (state: RootState) => state.invoices.invoices;
export const selectInvoicesLoading = (state: RootState) => state.invoices.loading;
export const selectInvoicesError = (state: RootState) => state.invoices.error;

export default invoiceSlice.reducer;
