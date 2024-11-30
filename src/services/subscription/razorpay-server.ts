import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createSubscriptionOrder = async (
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
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // For annual plans
      notes: {
        customerId: customerId,
      },
    });

    return subscription;
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    throw new Error(error.message || 'Failed to create subscription');
  }
};

export const verifyPayment = (
  razorpay_payment_id: string,
  razorpay_subscription_id: string,
  razorpay_signature: string
) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(`${razorpay_payment_id}|${razorpay_subscription_id}`);
  const generated_signature = hmac.digest('hex');

  return razorpay_signature === generated_signature;
};

export const handleWebhook = async (event: any) => {
  try {
    switch (event.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription);
        break;
      
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.payment);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription);
        break;
      
      case 'subscription.pending':
        await handleSubscriptionPending(event.payload.subscription);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment);
        break;
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

async function handleSubscriptionActivated(subscription: any) {
  // Update your database with active subscription
  const customerId = subscription.notes.customerId;
  // Update Firebase document
}

async function handleSubscriptionCharged(payment: any) {
  // Handle successful payment
  // You might want to send a confirmation email
}

async function handleSubscriptionCancelled(subscription: any) {
  // Update your database with cancelled subscription
  const customerId = subscription.notes.customerId;
  // Update Firebase document
}

async function handleSubscriptionPending(subscription: any) {
  // Handle pending subscription
  // You might want to send a reminder email
}

async function handlePaymentFailed(payment: any) {
  // Handle failed payment
  // You might want to send a notification email
}
