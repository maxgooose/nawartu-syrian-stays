#!/bin/bash

# Deploy Translation Edge Function to Supabase

echo "Deploying Translation Edge Function..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI is not installed. Please install it first."
    echo "Visit: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/functions/translate-text/index.ts" ]; then
    echo "Error: Translation function not found. Are you in the project root?"
    exit 1
fi

# Deploy the function
echo "Deploying translate-text function..."
supabase functions deploy translate-text --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✓ Translation function deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run the database migration to add translation metadata fields"
    echo "2. Test the translation by creating a listing with content in one language"
    echo "3. Run the batch translation script for existing listings (optional)"
else
    echo "✗ Deployment failed. Please check your Supabase configuration."
    exit 1
fi