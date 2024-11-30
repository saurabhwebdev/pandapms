import { db } from '../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export const handleRazorpayWebhook = async (event: any) => {
  try {
    const { payload, event: eventType } = event;
    const { subscription, payment } = payload;

    // Get subscription ID from either subscription or payment object
    const subscriptionId = subscription?.id || payment?.subscription_id;
    if (!subscriptionId) {
      console.error('No subscription ID found in webhook payload');
      return;
    }

    // Get subscription details from Razorpay if needed
    const subscriptionDetails = subscription || await fetchSubscriptionFromRazorpay(subscriptionId);
    
    // Extract customer ID from notes
    const customerId = subscriptionDetails.notes?.customerId;
    if (!customerId) {
      console.error('No customer ID found in subscription notes');
      return;
    }

    // Get the clinic document
    const clinicRef = doc(db, 'clinics', customerId);
    const clinicDoc = await getDoc(clinicRef);

    if (!clinicDoc.exists()) {
      console.error('Clinic not found:', customerId);
      return;
    }

    let subscriptionData;

    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged':
        subscriptionData = {
          razorpaySubscriptionId: subscriptionId,
          currentPlan: subscriptionDetails.plan_id,
          status: 'active',
          currentPeriodStart: new Date(subscriptionDetails.current_start * 1000),
          currentPeriodEnd: new Date(subscriptionDetails.current_end * 1000),
          updatedAt: new Date(),
        };
        break;

      case 'subscription.cancelled':
        subscriptionData = {
          ...clinicDoc.data().subscription,
          status: 'cancelled',
          updatedAt: new Date(),
        };
        break;

      case 'subscription.pending':
        subscriptionData = {
          ...clinicDoc.data().subscription,
          status: 'pending',
          updatedAt: new Date(),
        };
        break;

      case 'payment.failed':
        subscriptionData = {
          ...clinicDoc.data().subscription,
          status: 'past_due',
          updatedAt: new Date(),
        };
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
        return;
    }

    // Update clinic document with subscription data
    await updateDoc(clinicRef, {
      subscription: subscriptionData
    });

    console.log('Subscription status updated for clinic:', customerId);
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

async function fetchSubscriptionFromRazorpay(subscriptionId: string) {
  // Implement this function to fetch subscription details from Razorpay API
  // You'll need to use your Razorpay server-side SDK here
  return null;
}
