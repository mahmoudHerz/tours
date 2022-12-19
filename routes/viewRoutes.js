const express = require('express');

const viewsController = require('../controller/viewsController');
const authController = require('../controller/authController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-booking',
  authController.protect,
  viewsController.getMyBookings
);

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

module.exports = router;
