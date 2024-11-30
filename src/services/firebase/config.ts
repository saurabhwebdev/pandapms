import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBt6brrINsoo4918hyJuH_bRudi0TLOpz4",
  authDomain: "panda-patientmanagementsystem.firebaseapp.com",
  projectId: "panda-patientmanagementsystem",
  storageBucket: "panda-patientmanagementsystem.firebasestorage.app",
  messagingSenderId: "1066949798002",
  appId: "1:1066949798002:web:66e9813c90ee3b36a93aeb",
  measurementId: "G-CJ74YB295H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable CORS for localhost during development
if (window.location.hostname === 'localhost') {
  storage.maxUploadRetryTime = 30000; // Increase timeout for uploads
}

export const analytics = getAnalytics(app);

export default app;
