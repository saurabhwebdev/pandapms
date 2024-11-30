import { loadScript } from '@paypal/paypal-js';

let paypalLoaded = false;

export const initializePayPal = async (clientId: string) => {
  if (paypalLoaded) return;
  
  try {
    await loadScript({ 
      'client-id': clientId,
      currency: 'USD',
      intent: 'subscription',
      components: 'buttons'
    });
    paypalLoaded = true;
  } catch (error) {
    console.error('Failed to load PayPal SDK:', error);
    throw error;
  }
};

export const createSubscription = (planId: string): Promise<{ subscriptionID: string; status: string }> => {
  return new Promise((resolve, reject) => {
    if (!window.paypal) {
      reject(new Error('PayPal SDK not loaded'));
      return;
    }

    const container = document.getElementById('paypal-button-container');
    if (!container) {
      reject(new Error('PayPal button container not found'));
      return;
    }

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: (data: any, actions: any) => {
        return actions.subscription.create({
          'plan_id': planId,
          application_context: {
            shipping_preference: 'NO_SHIPPING'
          }
        });
      },
      onApprove: (data: any) => {
        resolve({
          subscriptionID: data.subscriptionID,
          status: 'APPROVED'
        });
      },
      onError: (err: any) => {
        console.error('PayPal Subscription Error:', err);
        reject(err);
      },
      onCancel: () => {
        reject(new Error('Subscription cancelled'));
      }
    }).render('#paypal-button-container')
      .catch((err: any) => {
        console.error('Failed to render PayPal buttons:', err);
        reject(err);
      });
  });
};
