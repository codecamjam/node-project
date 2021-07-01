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

//STATIC METHOD CALLED ON THE MODEL
//Review.calcAverageRatings
//tourId is tour for which the current review belongs to
reviewSchema.statics.calcAverageRatings = async function(
  tourId
) {
  // console.log(tourId);
  //in a static method, THIS points to current model
  const stats = await this.aggregate([
    //select all reviews that belong to the current tour
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        //current field that all documents have in common
        //so group by tour
        _id: '$tour',
        //sum up the number of ratings so if theres 5 reviews for the current tour, nratings = 5
        nRating: { $sum: 1 },
        //calculate average from the rating field
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // console.log(stats); //then update tour document with these stats
  //[ { _id: [ 60ddee3ca397552cfe26964d ], nRating: 1, avgRating: 3 } ]
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
};

/* THIS SHOULD HAVE BEEN A POST BECAUSE
AT PRE SAVE, THE CURRENT REVIEW ISNT IN THE COLLECTION
SO WHEN WE DID THE MATCH IN THE CALCAVERAGERATINGS FUNCTION,
IT SHOULDNT BE ABLE TO APPEAR IN THE OUTPUT BC AT THAT POINT IN
TIME, ITS NOT SAVED INTO THE COLLECTION. HENCE USE POST BC
THEN IT WOULD HAVE BEEN SAVED IN THE DATABASE SO THE CALCULATION WOULD WORK
TO STORE THAT RESULT ON THE TOUR
//use mw each time a new review is created
reviewSchema.pre('save', function(next) {
  //THIS points to current document (current review)

  //need to do Review.calcAverageRatings(this.tour) but this wouldnt work so
  //to call this function, remember this function is available on the model
  // THIS points to current document and the CONSTRUCTOR is basically the model who
  //created that document 
  this.constructor.calcAverageRatings(this.tour);

  next();
});
*/

//remember post document middleware doesnt have next
reviewSchema.post('save', function() {
  //THIS points to current document (current review)

  //need to do Review.calcAverageRatings(this.tour) but this wouldnt work so
  //to call this function, remember this function is available on the model
  // THIS points to current document and the CONSTRUCTOR is basically the model who
  //created that document
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
