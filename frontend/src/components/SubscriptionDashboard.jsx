import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscriptionAPI, plansAPI } from '../services/api';

const SubscriptionDashboard = () => {
  const { tenantId } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    try {
      const [subscriptionResponse, plansResponse] = await Promise.all([
        subscriptionAPI.getSubscription(tenantId),
        plansAPI.getPlans()
      ]);
      
      setSubscription(subscriptionResponse.data);
      setPlans(plansResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action, newPriceId = null) => {
    if (!subscription?.subscription) return;

    setActionLoading(action);
    
    try {
      await subscriptionAPI.updateSubscription(
        tenantId,
        subscription.subscription.id,
        action,
        newPriceId
      );
      
      // Refresh subscription data
      await fetchData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'canceling': return 'text-yellow-600 bg-yellow-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCurrentPlan = () => {
    if (!subscription?.subscription) return null;
    return plans.find(plan => plan.priceId === subscription.subscription.priceId);
  };

  const getOtherPlans = () => {
    const currentPlan = getCurrentPlan();
    return plans.filter(plan => plan.priceId !== subscription?.subscription?.priceId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!subscription?.subscription) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link to={`/tenant/${tenantId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← Back to Tenant
            </Link>
          </div>
          
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h1>
            <p className="text-gray-600 mb-8">You don't have an active subscription for this tenant.</p>
            <Link
              to={`/tenant/${tenantId}/plans`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Choose a Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const otherPlans = getOtherPlans();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link to={`/tenant/${tenantId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Tenant
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Management</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Current Subscription Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Subscription</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Plan</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {currentPlan?.name || subscription.subscription.priceId}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(subscription.subscription.status)}`}>
                    {subscription.subscription.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Current Period</span>
                  <span className="text-sm text-gray-900">
                    {new Date(subscription.subscription.currentPeriodStart).toLocaleDateString()} - 
                    {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>

                {currentPlan && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Price</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${(currentPlan.amount / 100).toFixed(2)}/{currentPlan.interval}
                    </span>
                  </div>
                )}

                {subscription.subscription.cancelAtPeriodEnd && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Subscription Ending</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          This subscription will be canceled at the end of the current billing period on{' '}
                          {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {/* Subscription Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Actions</h3>
              <div className="space-y-3">
                {subscription.subscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={() => handleSubscriptionAction('reactivate')}
                    disabled={actionLoading === 'reactivate'}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {actionLoading === 'reactivate' ? 'Processing...' : 'Reactivate Subscription'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscriptionAction('cancel')}
                    disabled={actionLoading === 'cancel'}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {actionLoading === 'cancel' ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            </div>

            {/* Plan Changes */}
            {otherPlans.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Plan</h3>
                <div className="space-y-3">
                  {otherPlans.map((plan) => (
                    <button
                      key={plan.priceId}
                      onClick={() => handleSubscriptionAction('upgrade', plan.priceId)}
                      disabled={actionLoading === 'upgrade'}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {actionLoading === 'upgrade' ? 'Processing...' : `Switch to ${plan.name}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  to={`/tenant/${tenantId}/invoices`}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium block"
                >
                  View Invoices
                </Link>
                <Link
                  to={`/tenant/${tenantId}/plans`}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium block"
                >
                  View All Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;
