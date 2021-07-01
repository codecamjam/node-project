const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

//this is the desired behavior aka a nested route
//reviews is a child of tour
//POST /tour/234fad4/reviews post a review of this tour
//GET /tour/234fad4/reviews get all reviews of this tour
//GET /tour/234fad4/reviews/sjdfhskdfh get specific review of the tour
//Even though it is confusing that we have a review route in the tour router file,
//we have to do this since the route starts with tour
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

/* 
router itself is just mw so we can use the use method and 
say for this specific route we should use reviewRouter instead
this is just mounting the router again

but we need to give reviewRouter access to tourId param
*/
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
