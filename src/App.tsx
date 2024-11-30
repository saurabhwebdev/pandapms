import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase/config'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useAuth } from './hooks/useAuth';
import Loading from './components/common/Loading';

// Lazy load components
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Patients = lazy(() => import('./pages/patients/Patients'))
const Appointments = lazy(() => import('./pages/appointments/Appointments'))
const Prescriptions = lazy(() => import('./pages/prescriptions/Prescriptions'))
const Invoices = lazy(() => import('./pages/invoices/Invoices'))
const Inventory = lazy(() => import('./pages/inventory/Inventory'))
const Settings = lazy(() => import('./pages/settings/Settings'))

function App() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {!user ? <Login /> : <Navigate to="/dashboard" />}
            </Suspense>
          } 
        />
        <Route 
          path="/register" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {!user ? <Register /> : <Navigate to="/dashboard" />}
            </Suspense>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {user ? <Dashboard /> : <Navigate to="/login" />}
            </Suspense>
          } 
        />
        <Route 
          path="/patients" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {user ? <Patients /> : <Navigate to="/login" />}
            </Suspense>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {user ? <Appointments /> : <Navigate to="/login" />}
            </Suspense>
          } 
        />
        <Route 
          path="/prescriptions" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {user ? <Prescriptions /> : <Navigate to="/login" />}
            </Suspense>
          } 
        />
        <Route 
          path="/invoices" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {user ? <Invoices /> : <Navigate to="/login" />}
            </Suspense>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {user ? <Inventory /> : <Navigate to="/login" />}
            </Suspense>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {user ? <Settings /> : <Navigate to="/login" />}
            </Suspense>
          } 
        />
        
        {/* Redirect root to dashboard or login */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  )
}

export default App
