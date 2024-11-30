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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const { clinicId } = auth;

  useEffect(() => {
    loadRazorpayScript().catch(console.error);
  }, []);

  const handlePayment = async (plan: any) => {
    try {
      setLoading(true);
      
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

    const { status, currentPlan, currentPeriodEnd } = useSelector((state: RootState) => state.subscription);
    const isNearExpiry = currentPeriodEnd ? 
      (new Date(currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 
      : false;

    const isButtonDisabled = loading || !clinicId || plan.id === 'FREE_TRIAL' || 
      (status === 'active' && currentPlan === plan.id && !isNearExpiry);

    const getButtonText = () => {
      if (plan.id === 'FREE_TRIAL') return 'Current Plan';
      if (!clinicId) return 'Please Log In';
      if (loading) return 'Processing...';
      if (status === 'active' && currentPlan === plan.id) {
        return isNearExpiry ? 'Renew Now' : 'Current Plan';
      }
      return 'Purchase Now';
    };

    const isSelected = selectedPlan === plan.id;
    const isPremium = plan.id === 'PREMIUM';

    return (
      <div 
        key={plan.id}
        className={`relative transform transition-all duration-300 hover:scale-105 ${
          isSelected ? 'scale-105' : ''
        }`}
        onMouseEnter={() => setSelectedPlan(plan.id)}
        onMouseLeave={() => setSelectedPlan(null)}
      >
        {isPremium && (
          <div className="absolute top-0 right-0 -mr-1 -mt-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
              Most Popular
            </span>
          </div>
        )}
        
        <div className={`h-full p-8 bg-white rounded-2xl shadow-xl border-2 ${
          isPremium ? 'border-purple-500' : 'border-transparent'
        } ${isSelected ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}`}>
          <div className="relative">
            <h3 className={`text-2xl font-bold ${isPremium ? 'text-purple-600' : 'text-gray-900'}`}>
              {plan.name}
            </h3>
            
            <div className="mt-4 flex items-baseline">
              <span className={`text-5xl font-extrabold tracking-tight ${isPremium ? 'text-purple-600' : 'text-gray-900'}`}>
                {priceDisplay}
              </span>
              <span className="ml-1 text-xl font-medium text-gray-500">
                /{isMonthly ? 'mo' : 'yr'}
              </span>
            </div>
            
            {plan.billingText && (
              <p className="mt-2 text-sm text-gray-500">{plan.billingText}</p>
            )}
          </div>

          <ul className="mt-6 space-y-4">
            {plan.features.map((feature: string) => (
              <li key={feature} className="flex items-start">
                <div className={`flex-shrink-0 p-1 ${isPremium ? 'text-purple-500' : 'text-green-500'}`}>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePayment(plan)}
            disabled={isButtonDisabled}
            className={`mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition-all duration-200 ${
              isButtonDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : isPremium
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:-translate-y-1'
                : 'bg-gray-900 hover:bg-gray-800 text-white transform hover:-translate-y-1'
            }`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-purple-600 tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Choose Your Perfect Plan
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Select the ideal plan for your dental practice and start managing your clinic efficiently
            </p>
          </div>

          <div className="mt-16 space-y-4 sm:mt-24 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 xl:gap-8">
            {Object.values(subscriptionPlans).map(renderPlan)}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base text-gray-500">
              All plans include 24/7 support and regular updates.{' '}
              <span className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">
                Contact us
              </span>{' '}
              for custom enterprise solutions.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
