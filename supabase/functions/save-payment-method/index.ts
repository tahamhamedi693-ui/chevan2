import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { token, user_id } = await req.json()

    // Initialize Stripe (you'll need to add your Stripe secret key to Supabase secrets)
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Create or retrieve Stripe customer
    const stripeResponse = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: user.email || '',
        metadata: JSON.stringify({ user_id: user.id }),
      }),
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text()
      throw new Error(`Stripe customer creation failed: ${error}`)
    }

    const customer = await stripeResponse.json()

    // Create payment method from token
    const paymentMethodResponse = await fetch('https://api.stripe.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        type: 'card',
        'card[token]': token,
      }),
    })

    if (!paymentMethodResponse.ok) {
      const error = await paymentMethodResponse.text()
      throw new Error(`Stripe payment method creation failed: ${error}`)
    }

    const paymentMethod = await paymentMethodResponse.json()

    // Attach payment method to customer
    await fetch(`https://api.stripe.com/v1/payment_methods/${paymentMethod.id}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customer.id,
      }),
    })

    // Save payment method info to database
    const { error: dbError } = await supabaseClient
      .from('payment_methods')
      .insert({
        user_id: user.id,
        stripe_payment_method_id: paymentMethod.id,
        stripe_customer_id: customer.id,
        type: 'card',
        card_last_four: paymentMethod.card.last4,
        card_brand: paymentMethod.card.brand,
        is_default: false,
        is_active: true,
      })

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_method_id: paymentMethod.id,
        customer_id: customer.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})