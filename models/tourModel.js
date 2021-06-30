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
      //schema type options
      type: Boolean,
      default: false
    },
    startLocation: {
      //THIS IS AN EMBEDDED OBJECT
      /* 
      IN ORDER TO SPECIFY GEOSPATIAL DATA WITH MONGODB, WE NEED TO CREATE A NEW OBJECT
      AND IT NEEDS TO HAVE AT LEAST 2 FIELD NAMES: COORDINATESS AND TYPE OF TYPE STRING WITH A GEOMETRY (POINT IN THIS CASE)
      */
      //this is an embedded object, not schema type options
      //dataformat geoJSON to specify geospatial data
      //need type and coordinate properties
      //both these subfields get their own schema type options
      type: {
        type: String,
        default: 'Point', //default geometry is point but theres also polygons, lines, etc
        enum: ['Point'] //this makes it the only option
      },
      coordinates: [Number], //coordinates of the point with longitude first
      // and latitude 2nd (usually other way around, like on google maps for example)
      //thats just how geojson works
      address: String,
      description: String
    },
    locations: [
      //by specifiying array of object, this will create new documents inside parent document
      //to create new documents and embed them in another doc, we created an array
      {
        //this specifies the object schema type options
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number //this is day of tour when people visit this location
      }
    ]
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
