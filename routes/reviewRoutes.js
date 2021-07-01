const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//to get tourId from tours/:tourId/reviews'
//POST /tour/234fad4/reviews
//GET /tour/234fad4/reviews
//GET /tour/234fad4/reviews
/*by default each router only has access to parameters of their own route
but here in this route: /  there is no tour id but we still need access from
the other router tours/:tourId/reviews' so we need to merge params  
*/
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
