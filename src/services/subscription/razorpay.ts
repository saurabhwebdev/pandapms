import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addToast } from '../../store/features/toastSlice';
import { store } from '../../store/store';
import { updateSubscriptionStatus } from '../../store/features/subscriptionSlice';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = 'rzp_test_tPmy91dvF8bFXh';

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
  });
};

const updateSubscriptionInFirebase = async (
  customerId: string,
  subscriptionData: {
    planId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    paymentId?: string;
    orderId?: string;
  }
) => {
  try {
    const userDocRef = doc(db, 'users', customerId);
    const clinicRef = doc(db, 'clinics', customerId);
    
    // First check if the documents exist
    const [userDocSnap, clinicDocSnap] = await Promise.all([
      getDoc(userDocRef),
      getDoc(clinicRef)
    ]);
    
    const subscriptionUpdate = {
      subscription: {
        currentPlan: subscriptionData.planId,
        status: 'active',
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        updatedAt: new Date(),
        paymentId: subscriptionData.paymentId
      }
    };

    // Update user document
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        ...subscriptionUpdate,
        createdAt: new Date(),
        userId: customerId
      });
    } else {
      await updateDoc(userDocRef, subscriptionUpdate);
    }

    // Update clinic document
    if (!clinicDocSnap.exists()) {
      await setDoc(clinicRef, {
        ...subscriptionUpdate,
        createdAt: new Date(),
        clinicId: customerId
      });
    } else {
      await updateDoc(clinicRef, subscriptionUpdate);
    }

    // Update Redux store
    store.dispatch(updateSubscriptionStatus({
      planId: subscriptionData.planId,
      status: 'active',
      startDate: subscriptionData.startDate.toISOString(),
      endDate: subscriptionData.endDate.toISOString()
    }));

    store.dispatch(addToast({
      message: 'Payment successful! Your plan is now active.',
      type: 'success'
    }));

  } catch (error) {
    console.error('Error updating subscription in Firebase:', error);
    store.dispatch(addToast({
      message: 'Failed to update subscription status',
      type: 'error'
    }));
    throw error;
  }
};

export const createPayment = async (
  planId: string,
  customerId: string,
  planDetails: {
    name: string;
    amount: number;
    currency: string;
    interval: string;
  }
) => {
  try {
    if (!RAZORPAY_KEY) {
      throw new Error('Razorpay key not found');
    }

    // Calculate plan dates
    const startDate = new Date();
    const endDate = new Date();
    if (planId === 'ANNUAL') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create a button element for Razorpay
    const button = document.createElement('button');
    button.className = 'razorpay-payment-button';
    button.setAttribute('data-key', RAZORPAY_KEY);
    button.setAttribute('data-amount', planDetails.amount.toString());
    button.setAttribute('data-currency', planDetails.currency);
    button.setAttribute('data-name', 'Panda Dentist');
    button.setAttribute('data-description', `${planDetails.name} (${planDetails.interval})`);
    button.setAttribute('data-image', 'https://your-logo-url.com/logo.png');
    button.setAttribute('data-prefill.name', 'Customer');
    button.setAttribute('data-prefill.email', 'customer@example.com');
    button.setAttribute('data-theme.color', '#6366F1');

    // Add button to body temporarily
    document.body.appendChild(button);

    // Create payment handler
    const options = {
      key: RAZORPAY_KEY,
      amount: planDetails.amount,
      currency: planDetails.currency,
      name: 'Panda Dentist',
      description: `${planDetails.name} (${planDetails.interval})`,
      image: 'https://your-logo-url.com/logo.png',
      handler: async function(response: any) {
        // Remove the button after payment
        button.remove();
        
        console.log('Payment successful:', response);
        await updateSubscriptionInFirebase(customerId, {
          planId,
          status: 'active',
          startDate,
          endDate,
          paymentId: response.razorpay_payment_id
        });

        // Force reload the page to update subscription status
        window.location.reload();
      },
      modal: {
        ondismiss: function() {
          // Remove the button if modal is dismissed
          button.remove();
        }
      },
      theme: {
        color: '#6366F1'
      }
    };

    // Initialize Razorpay
    const razorpay = new window.Razorpay(options);

    // Trigger payment on button click
    button.onclick = (e) => {
      e.preventDefault();
      razorpay.open();
    };

    // Automatically trigger the click
    button.click();

    return {
      status: 'pending',
      message: 'Please complete the payment process'
    };

  } catch (error) {
    console.error('Error creating payment:', error);
    store.dispatch(addToast({
      message: 'Failed to initialize payment. Please try again.',
      type: 'error'
    }));
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to cancel subscription');
    }

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};
