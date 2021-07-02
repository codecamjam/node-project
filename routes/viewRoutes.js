const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

//this was the overview route but by default, we'll have it sent from /
router.get('/', viewsController.getOverview);
router.get(
  '/tour/:slug',
  authController.protect,
  viewsController.getTour
);
router.get('/login', viewsController.getLoginForm);

module.exports = router;
