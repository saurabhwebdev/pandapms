import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { store } from './store/store'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PayPalScriptProvider options={{ 
        "client-id": "test", // Replace with your PayPal client ID
        currency: "INR"
      }}>
        <App />
      </PayPalScriptProvider>
    </Provider>
  </React.StrictMode>,
)
