import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plansAPI, subscriptionAPI } from '../services/api';

const Plans = () => {
  const { tenantId } = useParams();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        plansAPI.getPlans(),
        subscriptionAPI.getSubscription(tenantId)
      ]);
      
      setPlans(plansResponse.data);
      setCurrentSubscription(subscriptionResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount, interval) => {
    const price = (amount / 100).toFixed(2);
    return `$${price}/${interval}`;
  };

  const isCurrentPlan = (priceId) => {
    return currentSubscription?.subscription?.priceId === priceId;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link to={`/tenant/${tenantId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Tenant
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.priceId}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                isCurrentPlan(plan.priceId) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {isCurrentPlan(plan.priceId) && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.amount, plan.interval)}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Full access to all features</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">24/7 customer support</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Cancel anytime</span>
                  </div>
                </div>

                {isCurrentPlan(plan.priceId) ? (
                  <div className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg">
                    Current Plan
                  </div>
                ) : (
                  <Link
                    to={`/tenant/${tenantId}/checkout?priceId=${plan.priceId}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 block"
                  >
                    {currentSubscription?.subscription ? 'Switch Plan' : 'Get Started'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {currentSubscription?.subscription && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Need to manage your current subscription?
            </p>
            <Link
              to={`/tenant/${tenantId}/subscription`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Subscription Management →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
