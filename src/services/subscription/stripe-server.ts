import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = async (priceId: string, customerId?: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: `${process.env.FRONTEND_URL}/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription`,
    });

    return session;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

export const createPortalSession = async (customerId: string) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/subscription`,
    });

    return session;
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    throw new Error(error.message || 'Failed to create portal session');
  }
};

export const handleWebhook = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        // Update your database with the subscription status
        await updateSubscriptionInDatabase(subscription);
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        await handleSuccessfulPayment(invoice);
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        await handleFailedPayment(failedInvoice);
        break;
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

async function updateSubscriptionInDatabase(subscription: Stripe.Subscription) {
  // Update your database with the subscription status
  // This is where you'll update your Firebase document
  const status = subscription.status;
  const customerId = subscription.customer as string;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  // Update your database here
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  // Handle successful payment
  // You might want to send a confirmation email or update your database
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  // Handle failed payment
  // You might want to send a notification email or update your database
}
