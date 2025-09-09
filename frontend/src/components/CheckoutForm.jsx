import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { subscriptionAPI, plansAPI } from '../services/api';

const CheckoutForm = () => {
  const { tenantId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);

  const priceId = searchParams.get('priceId');

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (priceId && plans.length > 0) {
      const plan = plans.find(p => p.priceId === priceId);
      setSelectedPlan(plan);
    }
  }, [priceId, plans]);

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getPlans();
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await subscriptionAPI.createSubscription(tenantId, selectedPlan.priceId);
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here');
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (error) {
        setError(error.message);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount, interval) => {
    const price = (amount / 100).toFixed(2);
    return `$${price}/${interval}`;
  };

  if (!selectedPlan && plans.length > 0) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link to={`/tenant/${tenantId}/plans`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← Back to Plans
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Select a Plan</h1>
            <p className="text-gray-600 mb-8">Please select a plan to continue with checkout.</p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.priceId}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 cursor-pointer"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatPrice(plan.amount, plan.interval)}
                  </div>
                  <p className="text-sm text-gray-500">Click to select this plan</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link to={`/tenant/${tenantId}/plans`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Plans
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Purchase</h1>
            
            {selectedPlan && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Selected Plan</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedPlan.name}</h3>
                    <p className="text-gray-600">Billed {selectedPlan.interval}ly</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedPlan.amount, selectedPlan.interval)}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Secure payment processing by Stripe</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Instant access to all features</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleCheckout}
                disabled={loading || !selectedPlan}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition duration-200"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By proceeding, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
