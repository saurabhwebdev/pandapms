import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { RootState } from '../store';
import { Patient, PatientFormData } from '../../types/patient';
import { getAuth } from 'firebase/auth';

interface PatientState {
  items: Patient[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const patientsRef = collection(db, 'clinics', user.uid, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Patient[];
  }
);

export const addPatient = createAsyncThunk(
  'patients/addPatient',
  async (data: PatientFormData) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const patientsRef = collection(db, 'clinics', user.uid, 'patients');
    const docRef = await addDoc(patientsRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Patient;
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, data }: { id: string; data: PatientFormData }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const patientRef = doc(db, 'clinics', user.uid, 'patients', id);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await updateDoc(patientRef, updateData);
    
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    } as Patient;
  }
);

export const deletePatient = createAsyncThunk(
  'patients/deletePatient',
  async (id: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const patientRef = doc(db, 'clinics', user.uid, 'patients', id);
    await deleteDoc(patientRef);
    return id;
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch patients';
      })
      .addCase(addPatient.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      });
  },
});

export const selectPatients = (state: RootState) => state.patients.items;
export const selectPatientsLoading = (state: RootState) => state.patients.loading;
export const selectPatientsError = (state: RootState) => state.patients.error;

export default patientSlice.reducer;
