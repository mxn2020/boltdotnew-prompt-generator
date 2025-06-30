import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

export const STRIPE_PRICE_IDS = {
  pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID,
  pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID,
  max_monthly: import.meta.env.VITE_STRIPE_MAX_MONTHLY_PRICE_ID,
  max_yearly: import.meta.env.VITE_STRIPE_MAX_YEARLY_PRICE_ID,
} as const;

export type PlanId = keyof typeof STRIPE_PRICE_IDS;
