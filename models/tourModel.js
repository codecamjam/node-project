const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less or equal than 40 characters'
      ],
      minLength: [
        10,
        'A tour name must have more or equal than 10 characters'
      ]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty is either easy, medium, or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        }
      },
      message:
        'Discount price ({VALUE}) should be below regular price'
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        //the expected type of each of the elements in the guides array to be a mongodb ID
        type: mongoose.Schema.ObjectId,
        ref: 'User' //this is how we establish references between different data sets in mongoose
      }
    ]
    /*  the idea is that tours and users will always remain separate entities in our db
      so all we save in our tours document is user ids. then when we query the tour 
      we want to automatically get access to tour guides but without the user docs being stored
      in the tour document itself so we use referencing instead
    */
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//THIS WAS FOR EMBEDDING USER DOCUMENTS INTO TOURS DOCUMENT
//but theres drawbacks in this situation so we are going to reference instead
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(
//     async id => await User.findById(id)
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(
    `Query took ${Date.now() - this.start} milliseconds`
  );
  next();
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } }
  });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
