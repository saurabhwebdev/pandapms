import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { auth } from '../../services/firebase/config';
import { Prescription, PrescriptionFormData } from '../../types/prescription';
import { RootState } from '../store';

interface PrescriptionState {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  prescriptions: [],
  loading: false,
  error: null,
};

export const fetchPrescriptions = createAsyncThunk(
  'prescriptions/fetchPrescriptions',
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const prescriptionsRef = collection(db, 'prescriptions');
      const q = query(
        prescriptionsRef,
        where('clinicId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prescription[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPrescription = createAsyncThunk(
  'prescriptions/addPrescription',
  async (data: PrescriptionFormData, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const now = Timestamp.now().toDate().toISOString();
      const prescriptionData = {
        ...data,
        clinicId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
      return { id: docRef.id, ...prescriptionData } as Prescription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePrescription = createAsyncThunk(
  'prescriptions/updatePrescription',
  async ({ id, data }: { id: string; data: PrescriptionFormData }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const prescriptionRef = doc(db, 'prescriptions', id);
      const updatedData = {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      await updateDoc(prescriptionRef, updatedData);
      return { id, ...updatedData } as Prescription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePrescription = createAsyncThunk(
  'prescriptions/deletePrescription',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const prescriptionRef = doc(db, 'prescriptions', id);
      await deleteDoc(prescriptionRef);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch prescriptions
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.prescriptions = action.payload;
        state.loading = false;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add prescription
      .addCase(addPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        state.prescriptions.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update prescription
      .addCase(updatePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        const index = state.prescriptions.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.prescriptions[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updatePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete prescription
      .addCase(deletePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.prescriptions = state.prescriptions.filter(p => p.id !== action.payload);
        state.loading = false;
      })
      .addCase(deletePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectPrescriptions = (state: RootState) => state.prescriptions.prescriptions;
export const selectPrescriptionsLoading = (state: RootState) => state.prescriptions.loading;
export const selectPrescriptionsError = (state: RootState) => state.prescriptions.error;

export default prescriptionSlice.reducer;
