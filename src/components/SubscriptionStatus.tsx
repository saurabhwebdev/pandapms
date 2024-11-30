import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionPlans } from '../services/subscription/plans';
import { fetchSubscriptionStatus } from '../store/features/subscriptionSlice';
import { format } from 'date-fns';

export default function SubscriptionStatus() {
  const dispatch = useDispatch();
  const { currentPlan, status, currentPeriodEnd, trialEndsAt } = useSelector(
    (state: any) => state.subscription
  );
  const { clinicId } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (clinicId) {
      dispatch(fetchSubscriptionStatus(clinicId));
    }
  }, [dispatch, clinicId]);

  const plan = currentPlan ? Object.values(subscriptionPlans).find(p => p.id === currentPlan) : null;

  if (!status || status === 'none') {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Subscription Status
          </h3>
          <div className="mt-1">
            {status === 'trialing' ? (
              <>
                <span className="text-primary-600 font-medium">Trial Period</span>
                <p className="text-sm text-gray-500">
                  Trial ends on {format(new Date(trialEndsAt), 'PPP')}
                </p>
              </>
            ) : status === 'active' ? (
              <>
                <span className="text-green-600 font-medium">
                  {plan?.name || 'Active Subscription'}
                </span>
                {currentPeriodEnd && (
                  <p className="text-sm text-gray-500">
                    Next billing date: {format(new Date(currentPeriodEnd), 'PPP')}
                  </p>
                )}
              </>
            ) : status === 'cancelled' ? (
              <span className="text-red-600 font-medium">Subscription Cancelled</span>
            ) : status === 'past_due' ? (
              <span className="text-yellow-600 font-medium">Payment Past Due</span>
            ) : null}
          </div>
        </div>
        {status === 'active' && (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
            {plan && (
              <span className="text-sm text-gray-500">
                ₹{plan.price}/{plan.interval}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
