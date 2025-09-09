require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  getTenants,
  getTenantsByUserId,
  getTenantById,
  createTenant,
  updateTenant,
  getSubscriptions,
  getSubscriptionsByTenantId,
  getSubscriptionById,
  createSubscription,
  updateSubscription
} = require('./dataHelpers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Webhook endpoint must be before bodyParser.json() to get raw body
app.post('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const tenantId = session.metadata.tenantId;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const subscriptionItem = subscription.items.data[0];
          
          createSubscription({
            tenantId,
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionItemId: subscriptionItem.id,
            priceId: subscriptionItem.price.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          });
        }
        break;
        
      case 'customer.subscription.updated':
        const updatedSub = event.data.object;
        const localSub = getSubscriptions().find(sub => sub.stripeSubscriptionId === updatedSub.id);
        
        if (localSub) {
          updateSubscription(localSub.id, {
            status: updatedSub.status,
            currentPeriodStart: new Date(updatedSub.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(updatedSub.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: updatedSub.cancel_at_period_end
          });
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        const localDeletedSub = getSubscriptions().find(sub => sub.stripeSubscriptionId === deletedSub.id);
        
        if (localDeletedSub) {
          updateSubscription(localDeletedSub.id, {
            status: 'canceled',
            canceledAt: new Date().toISOString()
          });
        }
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Now add JSON parsing for other routes
app.use(bodyParser.json());

// Stripe configuration
const STRIPE_PLANS = [
  {
    name: "Basic Plan",
    priceId: "price_1S52JpJyajMjNrNVo5rHPOvE",
    amount: 999, // $9.99 in cents
    currency: "usd",
    interval: "month"
  },
  {
    name: "Pro Plan", 
    priceId: "price_1S52OZJyajMjNrNV9OJHqFfY",
    amount: 9999, // $99.99 in cents
    currency: "usd",
    interval: "year"
  }
];

// Authentication middleware (simple local auth)
const authenticateUser = (req, res, next) => {
  const userId = req.headers.userId || req.params.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  
  const user = getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }
  
  req.user = user;
  next();
};

// Routes

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

// User routes
app.get('/api/user/:userId/tenants', authenticateUser, (req, res) => {
  const { userId } = req.params;
  const tenants = getTenantsByUserId(userId);
  res.json(tenants);
});

app.post('/api/user/:userId/tenants', authenticateUser, (req, res) => {
  const { userId } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Tenant name required' });
  }
  
  const tenant = createTenant({ name, userId });
  res.json(tenant);
});

// Subscription routes
app.get('/api/tenant/:tenantId/subscription', (req, res) => {
  const { tenantId } = req.params;
  const tenant = getTenantById(tenantId);
  
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  
  const subscriptions = getSubscriptionsByTenantId(tenantId);
  const activeSubscription = subscriptions.find(sub => sub.status === 'active');
  
  res.json({
    tenant,
    subscription: activeSubscription || null,
    status: activeSubscription ? activeSubscription.status : 'inactive'
  });
});

app.post('/api/tenant/:tenantId/subscription', async (req, res) => {
  const { tenantId } = req.params;
  const { priceId } = req.body;
  
  const tenant = getTenantById(tenantId);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  
  try {
    // Create or get Stripe customer
    let customer;
    if (tenant.stripeCustomerId) {
      customer = await stripe.customers.retrieve(tenant.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        name: tenant.name,
        metadata: { tenantId }
      });
      updateTenant(tenantId, { stripeCustomerId: customer.id });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
      metadata: { tenantId }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

app.put('/api/tenant/:tenantId/subscription/:subscriptionId', async (req, res) => {
  const { tenantId, subscriptionId } = req.params;
  const { action, newPriceId } = req.body;
  
  const subscription = getSubscriptionById(subscriptionId);
  if (!subscription || subscription.tenantId !== tenantId) {
    return res.status(404).json({ error: 'Subscription not found' });
  }
  
  try {
    let updatedSubscription;
    
    switch (action) {
      case 'cancel':
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
        updatedSubscription = updateSubscription(subscriptionId, { 
          status: 'canceling',
          cancelAtPeriodEnd: true 
        });
        break;
        
      case 'reactivate':
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false
        });
        updatedSubscription = updateSubscription(subscriptionId, { 
          status: 'active',
          cancelAtPeriodEnd: false 
        });
        break;
        
      case 'upgrade':
      case 'downgrade':
        if (!newPriceId) {
          return res.status(400).json({ error: 'New price ID required for upgrade/downgrade' });
        }
        
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          items: [{
            id: subscription.stripeSubscriptionItemId,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations'
        });
        
        updatedSubscription = updateSubscription(subscriptionId, { 
          priceId: newPriceId,
          updatedAt: new Date().toISOString()
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Plans route
app.get('/api/plans', (req, res) => {
  res.json(STRIPE_PLANS);
});

// Invoices route
app.get('/api/tenant/:tenantId/invoices', async (req, res) => {
  const { tenantId } = req.params;
  const tenant = getTenantById(tenantId);
  
  if (!tenant || !tenant.stripeCustomerId) {
    return res.json([]);
  }
  
  try {
    const invoices = await stripe.invoices.list({
      customer: tenant.stripeCustomerId,
      limit: 50
    });
    
    res.json(invoices.data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Stripe webhook endpoint: http://localhost:${PORT}/api/webhooks/stripe`);
});
