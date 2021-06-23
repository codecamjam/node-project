const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true
    },
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
      required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true //only works on strings
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
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true }, //make virtuals part of output
    toObject: { virtuals: true }
  }
); //1st obj is schema definition, 2nd is options

//VIRTUAL PROPS ARE FIELDS WE CAN DEFINE
//ON SCHEMA BUT WONT BE PERSISTED/SAVED
//INTO THE DB. VIRTUAL PROPS MAKE SENSE FOR FIELDS
//THAT CAN BE DERIVED FROM ONE ANOTHER

//will be created each time we get some data out the db
//this is a getter
//we use a regular function to point to the current document
//CANNOT USE VIRTUAL PROPERTIES IN QUERIES!!!!!
//this is an example of business logic (keeping this out of app logic)
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
