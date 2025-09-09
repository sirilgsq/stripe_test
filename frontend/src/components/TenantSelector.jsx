import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';

const TenantSelector = ({ userId }) => {
  const { tenantId } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchSubscription();
    }
  }, [tenantId]);

  const fetchSubscription = async () => {
    try {
      const response = await subscriptionAPI.getSubscription(tenantId);
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'canceling': return 'text-yellow-600 bg-yellow-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {subscription?.tenant?.name || 'Tenant Management'}
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Subscription Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Status</h2>
              
              {subscription?.subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.subscription.status)}`}>
                      {subscription.subscription.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Plan</span>
                    <span className="text-sm text-gray-900">{subscription.subscription.priceId}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Current Period</span>
                    <span className="text-sm text-gray-900">
                      {new Date(subscription.subscription.currentPeriodStart).toLocaleDateString()} - 
                      {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>

                  {subscription.subscription.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">
                        This subscription will be canceled at the end of the current billing period.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active subscription</p>
                  <Link
                    to={`/tenant/${tenantId}/plans`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Choose a Plan
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/tenant/${tenantId}/plans`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium block"
                >
                  View Plans
                </Link>
                
                {subscription?.subscription && (
                  <>
                    <Link
                      to={`/tenant/${tenantId}/subscription`}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium block"
                    >
                      Manage Subscription
                    </Link>
                    
                    <Link
                      to={`/tenant/${tenantId}/invoices`}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium block"
                    >
                      View Invoices
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSelector;
