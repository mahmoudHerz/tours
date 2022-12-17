/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51MEu3aK8VhQlFAc5lkZMXv1EZenTLbOZs5pYr7e4AnCPlvmlJpzAu75H6inA49Gy4JHiJ77WsKVNf7qa4015J34Q0074y0sFxA'
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
