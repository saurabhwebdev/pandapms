import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import patientReducer from './features/patientSlice';
import appointmentReducer from './features/appointmentSlice';
import prescriptionReducer from './features/prescriptionSlice';
import invoiceReducer from './features/invoiceSlice';
import inventoryReducer from './features/inventorySlice';
import settingsReducer from './features/settingsSlice';

export const store = configureStore({
  reducer: {
    patients: patientReducer,
    appointments: appointmentReducer,
    prescriptions: prescriptionReducer,
    invoices: invoiceReducer,
    inventory: inventoryReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
