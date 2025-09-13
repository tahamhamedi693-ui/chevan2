/*
  # Update payment methods table for Stripe integration

  1. Changes
    - Add stripe_payment_method_id column
    - Add stripe_customer_id column
    - Update existing constraints and indexes

  2. Security
    - Maintain existing RLS policies
    - Add indexes for Stripe IDs for performance
*/

-- Add Stripe-specific columns
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add indexes for Stripe IDs
CREATE INDEX IF NOT EXISTS payment_methods_stripe_payment_method_id_idx 
ON payment_methods (stripe_payment_method_id);

CREATE INDEX IF NOT EXISTS payment_methods_stripe_customer_id_idx 
ON payment_methods (stripe_customer_id);

-- Add unique constraint for Stripe payment method ID
ALTER TABLE payment_methods 
ADD CONSTRAINT IF NOT EXISTS payment_methods_stripe_payment_method_id_unique 
UNIQUE (stripe_payment_method_id);