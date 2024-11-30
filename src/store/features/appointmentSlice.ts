import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { RootState } from '../store';
import { Appointment, AppointmentFormData } from '../../types/appointment';
import { getAuth } from 'firebase/auth';

interface AppointmentState {
  items: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const appointmentsRef = collection(db, 'clinics', user.uid, 'appointments');
    const q = query(appointmentsRef, orderBy('date', 'desc'), orderBy('time', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  }
);

export const addAppointment = createAsyncThunk(
  'appointments/addAppointment',
  async (data: AppointmentFormData) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const appointmentsRef = collection(db, 'clinics', user.uid, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
      ...data,
      clinicId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return {
      id: docRef.id,
      clinicId: user.uid,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Appointment;
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, data }: { id: string; data: AppointmentFormData }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const appointmentRef = doc(db, 'clinics', user.uid, 'appointments', id);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await updateDoc(appointmentRef, updateData);
    
    return {
      id,
      clinicId: user.uid,
      ...data,
      updatedAt: new Date().toISOString(),
    } as Appointment;
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const appointmentRef = doc(db, 'clinics', user.uid, 'appointments', id);
    await deleteDoc(appointmentRef);
    return id;
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch appointments';
      })
      .addCase(addAppointment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload);
      });
  },
});

export const selectAppointments = (state: RootState) => state.appointments.items;
export const selectAppointmentsLoading = (state: RootState) => state.appointments.loading;
export const selectAppointmentsError = (state: RootState) => state.appointments.error;

export default appointmentSlice.reducer;
