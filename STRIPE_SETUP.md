# Stripe Integration Setup

## Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Getting Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or sign in
3. Go to **Developers** → **API Keys**
4. Copy your **Publishable key** (starts with `pk_test_`) and **Secret key** (starts with `sk_test_`)

## Test Mode vs Live Mode

- **Test keys** start with `pk_test_` and `sk_test_`
- **Live keys** start with `pk_live_` and `sk_live_`

Use test keys for development and live keys for production.

## Test Card Numbers

For testing payments, use these card numbers:

- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444  
- **American Express**: 3782 822463 10005
- **Declined Card**: 4000 0000 0000 0002

Use any future expiry date and any 3-digit CVC.

## Features Implemented

✅ **Stripe Elements** - Secure card input fields  
✅ **Modern Airbnb-style UI** - Beautiful, responsive design  
✅ **Real-time validation** - Instant feedback on card input  
✅ **Smooth animations** - Framer Motion powered transitions  
✅ **Multi-language support** - Arabic/English  
✅ **Mobile responsive** - Works perfectly on all devices  
✅ **Security indicators** - SSL and Stripe branding  
✅ **Error handling** - Comprehensive error states  
✅ **Loading states** - Smooth processing feedback  

## Backend Integration

The payment form integrates with your existing Supabase function:
- `create-stripe-checkout` - Creates payment intent
- Updates booking status on successful payment
- Sends confirmation emails
