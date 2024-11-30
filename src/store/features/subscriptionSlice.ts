import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { db } from '../../services/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Helper function to convert Firebase timestamps to ISO strings
const serializeSubscriptionData = (data: any) => {
  if (!data) return null;
  return {
    ...data,
    trialEndsAt: data.trialEndsAt?.toDate?.()?.toISOString() || data.trialEndsAt,
    currentPeriodStart: data.currentPeriodStart?.toDate?.()?.toISOString() || data.currentPeriodStart,
    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
  };
};

export interface SubscriptionState {
  currentPlan: string | null;
  status: 'none' | 'active' | 'trialing' | 'expired' | 'cancelled' | null;
  loading: boolean;
  error: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  razorpaySubscriptionId: string | null;
}

export interface UpdateSubscriptionStatusPayload {
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
}

const initialState: SubscriptionState = {
  currentPlan: null,
  status: 'none',
  loading: false,
  error: null,
  trialEndsAt: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  razorpaySubscriptionId: null
};

export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async (clinicId: string) => {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      const clinicDoc = await getDoc(clinicRef);

      if (!clinicDoc.exists()) {
        throw new Error('Clinic not found');
      }

      const data = clinicDoc.data();
      const subscription = data.subscription || { status: 'none' };
      
      return {
        currentPlan: subscription.currentPlan || null,
        status: subscription.status || 'none',
        trialEndsAt: subscription.trialEndsAt?.toDate?.()?.toISOString() || null,
        currentPeriodStart: subscription.currentPeriodStart?.toDate?.()?.toISOString() || null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toDate?.()?.toISOString() || null,
        razorpaySubscriptionId: subscription.razorpaySubscriptionId || null
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }
);

export const startTrial = createAsyncThunk(
  'subscription/startTrial',
  async (clinicId: string) => {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

      const subscriptionData = {
        currentPlan: 'FREE_TRIAL',
        status: 'trialing',
        trialEndsAt: trialEndDate.toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: trialEndDate.toISOString(),
        updatedAt: new Date().toISOString()
      };

      const clinicRef = doc(db, 'clinics', clinicId);
      await updateDoc(clinicRef, {
        subscription: {
          ...subscriptionData,
          trialEndsAt: new Date(subscriptionData.trialEndsAt),
          currentPeriodStart: new Date(subscriptionData.currentPeriodStart),
          currentPeriodEnd: new Date(subscriptionData.currentPeriodEnd),
          updatedAt: new Date(subscriptionData.updatedAt)
        }
      });

      return subscriptionData;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/update',
  async ({ clinicId, subscriptionData }: { clinicId: string; subscriptionData: any }) => {
    try {
      const clinicRef = doc(db, 'clinics', clinicId);
      await updateDoc(clinicRef, {
        subscription: subscriptionData
      });
      return subscriptionData;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    updateSubscriptionStatus: (state, action: PayloadAction<UpdateSubscriptionStatusPayload>) => {
      const { planId, status, startDate, endDate } = action.payload;
      state.currentPlan = planId;
      state.status = status as SubscriptionState['status'];
      state.currentPeriodStart = startDate;
      state.currentPeriodEnd = endDate;
    },
    clearSubscriptionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        Object.assign(state, action.payload);
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscription status';
      })
      .addCase(startTrial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTrial.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        Object.assign(state, action.payload);
      })
      .addCase(startTrial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start trial';
      })
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        Object.assign(state, action.payload);
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update subscription';
      });
  }
});

export const { updateSubscriptionStatus, clearSubscriptionError } = subscriptionSlice.actions;

// Selectors
export const selectSubscriptionStatus = (state: { subscription: SubscriptionState }) => state.subscription.status;
export const selectTrialEndsAt = (state: { subscription: SubscriptionState }) => state.subscription.trialEndsAt;
export const selectCurrentPlan = (state: { subscription: SubscriptionState }) => state.subscription.currentPlan;
export const selectCurrentPeriodEnd = (state: { subscription: SubscriptionState }) => state.subscription.currentPeriodEnd;
export const selectSubscriptionLoading = (state: { subscription: SubscriptionState }) => state.subscription.loading;
export const selectSubscriptionError = (state: { subscription: SubscriptionState }) => state.subscription.error;

export default subscriptionSlice.reducer;
