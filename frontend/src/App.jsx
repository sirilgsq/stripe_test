import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TenantSelector from './components/TenantSelector';
import SubscriptionDashboard from './components/SubscriptionDashboard';
import Plans from './components/Plans';
import CheckoutForm from './components/CheckoutForm';
import InvoiceHistory from './components/InvoiceHistory';
import { authAPI } from './services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here');

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    
    if (savedUser && userId) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const userData = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData.id);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Elements stripe={stripePromise}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Subscription Manager
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Dashboard userId={user.id} />} />
            <Route path="/tenant/:tenantId" element={<TenantSelector userId={user.id} />} />
            <Route path="/tenant/:tenantId/subscription" element={<SubscriptionDashboard />} />
            <Route path="/tenant/:tenantId/plans" element={<Plans />} />
            <Route path="/tenant/:tenantId/checkout" element={<CheckoutForm />} />
            <Route path="/tenant/:tenantId/invoices" element={<InvoiceHistory />} />
            <Route path="/success" element={<div className="p-8 text-center"><h2 className="text-2xl text-green-600">Payment Successful!</h2></div>} />
            <Route path="/cancel" element={<div className="p-8 text-center"><h2 className="text-2xl text-red-600">Payment Cancelled</h2></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Elements>
  );
}

export default App;