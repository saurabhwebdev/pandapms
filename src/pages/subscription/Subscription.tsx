import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { subscriptionPlans } from '../../services/subscription/plans';
import { loadRazorpayScript, createPayment } from '../../services/subscription/razorpay';
import { addToast } from '../../store/features/toastSlice';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const { clinicId, email } = auth;

  useEffect(() => {
    // Preload Razorpay script
    loadRazorpayScript().catch(console.error);
  }, []);

  const handlePayment = async (plan: any) => {
    try {
      setLoading(true);
      
      console.log('Selected plan:', plan);
      console.log('Auth state:', auth);
      
      if (!clinicId) {
        dispatch(addToast({
          message: 'Please log in to continue',
          type: 'error'
        }));
        return;
      }

      await createPayment(plan.id, clinicId, {
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        interval: plan.interval
      });

    } catch (error) {
      console.error('Payment error:', error);
      dispatch(addToast({
        message: 'Failed to process payment',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderPlan = (plan: any) => {
    const isMonthly = plan.interval === 'month';
    const priceDisplay = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(plan.price);

    // Get subscription status from Redux store
    const { status, currentPlan, currentPeriodEnd } = useSelector((state: RootState) => state.subscription);

    // Calculate if subscription is near expiry (within 7 days)
    const isNearExpiry = currentPeriodEnd ? 
      (new Date(currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 
      : false;

    // Determine if button should be disabled
    const isButtonDisabled = loading || !clinicId || plan.id === 'FREE_TRIAL' || 
      (status === 'active' && currentPlan === plan.id && !isNearExpiry);

    // Get button text based on conditions
    const getButtonText = () => {
      if (plan.id === 'FREE_TRIAL') return 'Current Plan';
      if (!clinicId) return 'Please Log In';
      if (loading) return 'Processing...';
      if (status === 'active' && currentPlan === plan.id) {
        return isNearExpiry ? 'Renew Now' : 'Current Plan';
      }
      return 'Purchase Now';
    };

    return (
      <div key={plan.id} className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
        
        <div className="mt-8">
          <div className="flex items-baseline text-6xl font-extrabold">
            {priceDisplay}
            <span className="ml-1 text-2xl font-medium text-gray-500">
              /{isMonthly ? 'mo' : 'yr'}
            </span>
          </div>
          {plan.billingText && (
            <p className="mt-1 text-sm text-gray-500">{plan.billingText}</p>
          )}
        </div>

        <ul className="mt-6 space-y-4">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex">
              <span className="text-indigo-500">✓</span>
              <span className="ml-3 text-gray-500">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handlePayment(plan)}
          disabled={isButtonDisabled}
          className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-center ${
            isButtonDisabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Select the perfect plan for your dental practice
            </p>
          </div>

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
            {Object.values(subscriptionPlans).map(renderPlan)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
