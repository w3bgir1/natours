const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router
  .get(
    '/',
    bookingController.createBookingCheckout,
    authController.isLoggedIn,
    viewsController.getOverview
  )
  .get('/tour/:slug', authController.isLoggedIn, viewsController.getTour)
  .get('/login', authController.isLoggedIn, viewsController.getLoginForm)
  .get('/me', authController.protect, viewsController.getAccount)
  .get('/my-tours', authController.protect, viewsController.getMyTours)
  .post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
  );
module.exports = router;
