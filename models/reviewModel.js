const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
      }
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

//this is the desired behavior aka a nested route
//reviews is a child of tour
//POST /tour/234fad4/reviews post a review of this tour
//GET /tour/234fad4/reviews get all reviews of this tour
//GET /tour/234fad4/reviews/sjdfhskdfh get specific review of the tour
