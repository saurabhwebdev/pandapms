import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { RootState } from '../store';
import { getAuth } from 'firebase/auth';

interface ClinicProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

interface InvoiceSettings {
  taxRate: number;
  termsAndConditions: string;
  template: 'default' | 'professional' | 'minimal';
}

interface SettingsState {
  clinicProfile: ClinicProfile;
  currency: string;
  invoiceSettings: InvoiceSettings;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  clinicProfile: {
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  },
  currency: 'INR',
  invoiceSettings: {
    taxRate: 18,
    termsAndConditions: '',
    template: 'default',
  },
  loading: false,
  error: null,
};

// Helper function to get current user ID
const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'settings', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Initialize settings document if it doesn't exist
      await setDoc(docRef, initialState);
      return initialState;
    }
    
    return docSnap.data() as SettingsState;
  }
);

export const updateClinicProfile = createAsyncThunk(
  'settings/updateClinicProfile',
  async (profile: ClinicProfile) => {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'settings', userId);
    
    await updateDoc(docRef, {
      clinicProfile: profile,
    });
    
    return profile;
  }
);

export const updateInvoiceSettings = createAsyncThunk(
  'settings/updateInvoiceSettings',
  async (settings: InvoiceSettings) => {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'settings', userId);
    
    await updateDoc(docRef, {
      invoiceSettings: settings,
    });
    
    return settings;
  }
);

export const updateCurrency = createAsyncThunk(
  'settings/updateCurrency',
  async (currency: string) => {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'settings', userId);
    
    await updateDoc(docRef, {
      currency,
    });
    
    return currency;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.clinicProfile = action.payload.clinicProfile;
        state.invoiceSettings = action.payload.invoiceSettings;
        state.currency = action.payload.currency;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      // Update Clinic Profile
      .addCase(updateClinicProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClinicProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.clinicProfile = action.payload;
      })
      .addCase(updateClinicProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update clinic profile';
      })
      // Update Invoice Settings
      .addCase(updateInvoiceSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoiceSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.invoiceSettings = action.payload;
      })
      .addCase(updateInvoiceSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update invoice settings';
      })
      // Update Currency
      .addCase(updateCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.currency = action.payload;
      })
      .addCase(updateCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update currency';
      });
  },
});

export const selectSettings = (state: RootState) => state.settings;

export default settingsSlice.reducer;
