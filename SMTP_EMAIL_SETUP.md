# SMTP Email Configuration Guide

## ✅ Current Status
Your email functions are already properly configured to use Resend SMTP:
- `send-auth-email` - Authentication emails (signup/signin confirmations)
- `send-booking-confirmation` - Booking confirmations
- `send-listing-confirmation` - Listing submission confirmations

## 🔧 Required Configuration Steps

### 1. Supabase Dashboard Settings
Go to your Supabase project dashboard:

**Authentication → Settings → SMTP Settings:**
- ✅ Enable SMTP
- ✅ Set SMTP Host: `smtp.resend.com`
- ✅ Set SMTP Port: `587` (or `465` for SSL)
- ✅ Set SMTP Username: `resend`
- ✅ Set SMTP Password: Your Resend API key
- ✅ Set Sender Email: `info@nawartu.com`
- ✅ Set Sender Name: `Nawartu`

### 2. Required Environment Variables
In your Supabase project settings → Environment Variables, ensure these are set:

```bash
RESEND_API_KEY=your_resend_api_key_here
SEND_AUTH_EMAIL_HOOK_SECRET=your_webhook_secret_here
```

### 3. Auth Email Hook Configuration
In Supabase Dashboard → Authentication → Settings → Email Auth:

**Custom SMTP Settings:**
- ✅ Enable "Send custom SMTP emails"
- ✅ Set Auth Email Hook URL: `https://mbwmcjxtpuwscxdzijsz.supabase.co/functions/v1/send-auth-email`
- ✅ Set Hook Secret: Same as `SEND_AUTH_EMAIL_HOOK_SECRET` environment variable

### 4. Verify Email Templates
The current email templates include:
- ✅ Bilingual support (Arabic/English)
- ✅ Professional Nawartu branding
- ✅ Proper confirmation links
- ✅ Rich HTML formatting

## 🧪 Testing Your Email Setup

### Test Authentication Emails:
1. Try signing up with a new email address
2. Check that you receive the confirmation email
3. Verify the email format and branding look correct

### Test Booking Emails:
1. Make a test booking
2. Verify booking confirmation email is sent
3. Check that all booking details are correctly displayed

### Test Listing Emails:
1. Submit a new listing (as a host)
2. Verify listing confirmation email is sent

## 🚨 Common Issues & Solutions

### Issue: Emails not being sent
**Solution:** Check that:
- Resend API key is valid and has sending permissions
- Webhook secret matches between Supabase and environment variables
- Email domain `nawartu.com` is verified in Resend dashboard

### Issue: Authentication emails not working
**Solution:** Verify that:
- Auth hook URL is correctly set in Supabase auth settings
- Webhook secret is properly configured
- `send-auth-email` function is deployed and working

### Issue: Booking/Listing emails not working  
**Solution:** Check that:
- Functions are properly deployed: `npx supabase functions deploy`
- Environment variables are set in production
- Function logs for any error messages

## 📧 Email Function URLs
Your email functions should be accessible at:
- Auth emails: `https://mbwmcjxtpuwscxdzijsz.supabase.co/functions/v1/send-auth-email`
- Booking confirmations: `https://mbwmcjxtpuwscxdzijsz.supabase.co/functions/v1/send-booking-confirmation`
- Listing confirmations: `https://mbwmcjxtpuwscxdzijsz.supabase.co/functions/v1/send-listing-confirmation`

## ✅ Verification Checklist
- [ ] SMTP settings configured in Supabase dashboard
- [ ] Environment variables set for RESEND_API_KEY and webhook secret
- [x] Auth email hook URL and secret configured
- [ ] Domain verified in Resend dashboard
- [ ] Test emails sent successfully
- [ ] Email branding and formatting look correct

## 📞 Next Steps
If emails still aren't working after these steps, check:
1. Supabase function logs for error messages
2. Resend dashboard for sending activity and errors
3. Ensure your domain `nawartu.com` is properly verified in Resend
