# Tenant-Based Subscription Management System

A full-stack application for managing tenant-based subscriptions with Stripe integration. Built with React (Vite + TailwindCSS) frontend and Node.js/Express backend.

## Features

### Frontend
- **Login System**: Simple local authentication (demo credentials: demo@example.com / demo123)
- **Tenant Management**: Create and manage multiple tenants per user
- **Subscription Dashboard**: View current subscription status and details
- **Plans Page**: Browse available subscription plans
- **Checkout Flow**: Secure payment processing with Stripe Elements
- **Subscription Management**: Cancel, reactivate, upgrade, or downgrade subscriptions
- **Invoice History**: View and download past invoices
- **Payment History**: Track all payment transactions

### Backend
- **Tenant-Aware APIs**: All subscription operations are tenant-specific
- **Stripe Integration**: Full integration with Stripe for payments and subscriptions
- **Webhook Handling**: Automatic subscription status updates via Stripe webhooks
- **Local JSON Storage**: Simple file-based data persistence
- **RESTful APIs**: Clean API endpoints for all operations

## Project Structure

```
stripe_demo/
├── frontend/                 # React (Vite) frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   └── App.jsx          # Main application component
│   ├── package.json
│   └── .env                 # Frontend environment variables
├── backend/                  # Node.js/Express backend
│   ├── data/                # JSON data files
│   │   ├── users.json
│   │   ├── tenants.json
│   │   └── subscriptions.json
│   ├── server.js            # Main server file
│   ├── dataHelpers.js       # Data management utilities
│   ├── package.json
│   └── .env                 # Backend environment variables
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Stripe account with API keys

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 3. Stripe Setup

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Get API Keys**: 
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy your Publishable Key and Secret Key
   - Update the `.env` files with your keys
3. **Create Products and Prices**:
   - Go to Stripe Dashboard → Products
   - Create products for "Basic Plan" and "Pro Plan"
   - Create prices for each product (monthly/yearly)
   - Update the `STRIPE_PLANS` array in `backend/server.js` with your actual price IDs
4. **Setup Webhooks**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `http://localhost:3001/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook secret and update your backend `.env` file

### 3.1. Stripe CLI Setup (Recommended for Local Development)

For local webhook testing, install the Stripe CLI:

#### Install Stripe CLI on Linux:
```bash
# Download the latest version (replace with current version)
wget https://github.com/stripe/stripe-cli/releases/download/v1.30.0/stripe_1.30.0_linux_x86_64.tar.gz

# Extract the archive
tar -xvf stripe_1.30.0_linux_x86_64.tar.gz

# Move the stripe binary into your system's executable path
sudo mv stripe /usr/local/bin/

# Verify the installation
stripe --version
```

#### Login to Stripe CLI:
```bash
# Login with your API key
stripe login --api-key sk_test_51S50J**************x00vgEEaec1

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

The CLI will provide you with a webhook signing secret that starts with `whsec_`. Use this in your backend `.env` file instead of the one from the Dashboard.

### 3.2. Test Cards for Development

Use these test card numbers for testing payments. **Never use real card details in test mode.**

| Card Brand | Number | CVC | Expiry | Description |
|------------|--------|-----|--------|-------------|
| **Visa** | 4242424242424242 | Any 3 digits | Any future date | Successful payment |
| **Visa (debit)** | 4000056655665556 | Any 3 digits | Any future date | Successful debit payment |
| **Mastercard** | 5555555555554444 | Any 3 digits | Any future date | Successful payment |
| **American Express** | 378282246310005 | Any 4 digits | Any future date | Successful payment |
| **Discover** | 6011111111111117 | Any 3 digits | Any future date | Successful payment |

#### Test Card for Declined Payments:
| Card Brand | Number | CVC | Expiry | Description |
|------------|--------|-----|--------|-------------|
| **Declined** | 4000000000000002 | Any 3 digits | Any future date | Card declined |

#### Test Card for Insufficient Funds:
| Card Brand | Number | CVC | Expiry | Description |
|------------|--------|-----|--------|-------------|
| **Insufficient Funds** | 4000000000009995 | Any 3 digits | Any future date | Insufficient funds |

**Important Notes:**
- Always use test API keys when testing
- Use any valid future expiry date (e.g., 12/34)
- Use any 3-digit CVC (4 digits for Amex)
- Never use real card details in test mode

For more test cards and scenarios, visit: [Stripe Testing Documentation](https://docs.stripe.com/testing?testing-method=card-numbers#visa)

### 4. Run the Application

#### Start Backend Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:3001
```

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### 5. Access the Application

1. Open your browser and go to `http://localhost:5173`
2. Login with demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123`
3. Create a tenant and start managing subscriptions!

## 🧪 Testing the Application

### Test Payment Flow:
1. **Login** with the demo credentials above
2. **Create a tenant** or select an existing one
3. **Choose a plan** from the plans page
4. **Use test cards** from the table above:
   - Use `4242424242424242` for successful payments
   - Use `4000000000000002` to test declined payments
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC (4 digits for Amex)
5. **Complete the checkout** process
6. **Verify subscription** appears in the dashboard

### Test Webhook Events:
If using Stripe CLI, you'll see webhook events in real-time:
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Watch for these events:
- `checkout.session.completed` - When payment succeeds
- `customer.subscription.updated` - When subscription changes
- `customer.subscription.deleted` - When subscription is canceled

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Tenants
- `GET /api/user/:userId/tenants` - Get user's tenants
- `POST /api/user/:userId/tenants` - Create new tenant

### Subscriptions
- `GET /api/tenant/:tenantId/subscription` - Get tenant's subscription
- `POST /api/tenant/:tenantId/subscription` - Create new subscription
- `PUT /api/tenant/:tenantId/subscription/:subscriptionId` - Update subscription

### Plans
- `GET /api/plans` - Get available subscription plans

### Invoices
- `GET /api/tenant/:tenantId/invoices` - Get tenant's invoices

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Data Models

### User
```json
{
  "id": "user_1",
  "email": "demo@example.com",
  "password": "demo123",
  "name": "Demo User",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Tenant
```json
{
  "id": "tenant_1",
  "name": "Demo Company",
  "userId": "user_1",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "stripeCustomerId": "cus_xxxxx"
}
```

### Subscription
```json
{
  "id": "sub_1",
  "tenantId": "tenant_1",
  "stripeSubscriptionId": "sub_xxxxx",
  "stripeSubscriptionItemId": "si_xxxxx",
  "priceId": "price_xxxxx",
  "status": "active",
  "currentPeriodStart": "2024-01-01T00:00:00.000Z",
  "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Development Notes

- **Local Storage**: The application uses JSON files for data persistence (suitable for development/demo)
- **Authentication**: Simple local authentication without external services
- **Stripe Test Mode**: Uses Stripe test keys for safe development
- **Webhook Testing**: Use Stripe CLI or ngrok for local webhook testing
- **Error Handling**: Basic error handling implemented throughout the application

## Production Considerations

For production deployment, consider:
- Replace JSON file storage with a proper database (PostgreSQL, MongoDB)
- Implement proper authentication (JWT, OAuth)
- Add input validation and sanitization
- Implement proper error logging
- Add rate limiting and security headers
- Use environment-specific configuration
- Set up proper monitoring and alerting

## Troubleshooting

### Common Issues

1. **Stripe Keys Not Working**: Ensure you're using test keys and they're correctly set in `.env` files
2. **Webhook Not Receiving Events**: Check webhook URL and ensure it's accessible from Stripe
3. **CORS Errors**: Ensure backend is running on the correct port and CORS is properly configured
4. **Build Errors**: Make sure all dependencies are installed and Node.js version is compatible

### Support

For issues and questions:
1. Check the console logs for error messages
2. Verify environment variables are set correctly
3. Ensure Stripe webhook is properly configured
4. Check that both frontend and backend servers are running

## License

MIT License - feel free to use this project for learning and development purposes.
