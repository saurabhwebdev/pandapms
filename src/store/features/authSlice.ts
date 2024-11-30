import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  clinicId: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  clinicId: null,
  email: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ clinicId: string; email: string }>) => {
      state.clinicId = action.payload.clinicId;
      state.email = action.payload.email;
    },
    clearUser: (state) => {
      state.clinicId = null;
      state.email = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
