import Stripe from 'stripe';

// Bez STRIPE_SECRET_KEY (lokální vývoj / demo nasazení bez účtu) checkout
// route spadne zpátky do demo režimu - stejný vzor jako dřív u ComGate.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
