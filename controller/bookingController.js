const Stripe = require('stripe');

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

const stripe = Stripe(
  'sk_test_51MEu3aK8VhQlFAc5ksSVx2BGgLTRH3xHPvBhENWH96NUWJ72P2LxphorX9PhElpQhzsyTDexil5VdT3DYM9o3aX800ztMQVQx6'
);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
          unit_amount: tour.price * 100,
          currency: 'usd',
        },
        quantity: 1,
      },
    ],
    client_reference_id: req.params.tourId,
    customer_email: req.user.email,
    mode: 'payment',
    payment_method_types: ['card'],

    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-booking`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  });
  // 3) Creat session as a respone
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = async (req, res, next) => {
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) return next();
//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
//   next();
// };

const endpointSecret = 'whsec_m1CgZHa4bCyznCMAYQwdHM6Y2EGtJjyZ';

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].price_data.unit_amount / 100;
  await Booking.create({ tour, user, price });
};
exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
