const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

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

reviewSchema.statics.calcAverageRatings = async function(
  tourId
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  //[ { _id: [ 60ddee3ca397552cfe26964d ], nRating: 1, avgRating: 3 } ]
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate //shorthand for findoneandupdate with current id
//findByIdAndDelete //shorthand same with delete
//we only have query mw for these 2 hooks
reviewSchema.pre(/^findOneAnd/, async function(next) {
  //goal is to get access to current review document
  // but THIS is current query
  //so we execute the query and that will give us current processed document
  //so now this.r is the current Review document!!!
  this.r = await this.findOne(); //r for review
  //but in pre it didnt persist to the db so the updated rating wasnt displayed
  //doesnt matter bc all we are interested in is the tour ID
  //WE CANT CHANGE PRE TO POST BECAUSE WE WONT HAVE ACCES TO QUERY, HENCE THE
  //REV DOCUMENT, AND IT WOULDNT WORK! SO SOLUTION IS USE A POST AFTER AND PASS
  // variable r to post query mw
  // console.log(this.r);

  next();
});

//after query has finished and review has been updated
reviewSchema.post(/^findOneAnd/, async function() {
  //await this.findOne() DOES NOT WORK HERE BC QUERY HAS ALREADY EXECUTED
  //this.r is the current review document
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
