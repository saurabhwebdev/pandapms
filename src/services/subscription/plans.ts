export const subscriptionPlans = {
  FREE_TRIAL: {
    id: 'FREE_TRIAL',
    name: 'Free Trial',
    price: 0,
    amount: 0,
    currency: 'INR',
    interval: '7 days',
    features: [
      'Full access to all features',
      'Patient management',
      'Appointment scheduling',
      'Billing and invoicing',
      'Reports and analytics'
    ]
  },
  MONTHLY: {
    id: 'MONTHLY',
    name: 'Professional Monthly',
    price: 1499,
    amount: 149900, // Amount in paise (₹1,499 = 149900 paise)
    currency: 'INR',
    interval: 'month',
    billingText: 'One-time payment for 1 month access',
    features: [
      'All Free Trial features',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access'
    ]
  },
  ANNUAL: {
    id: 'ANNUAL',
    name: 'Professional Annual',
    price: 14388,
    amount: 1438800, // Amount in paise (₹14,388 = 1438800 paise)
    currency: 'INR',
    interval: 'year',
    billingText: 'One-time payment for 1 year access (Save 20%)',
    features: [
      'All Monthly features',
      'Two months free',
      'Dedicated account manager',
      'Premium support',
      'Early access to new features'
    ]
  }
};
