const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//4 types of mongoose middlware
//document, query, aggregate, and model
//document mw - can act on the currently processed document

//this is for premiddlware which runs before an event
//(in this case before a save event)
//so before a doc is saved to the db
//DOC MW: runs before .save() and .create() but not on .insertMany()
//so only save and create this func will run
tourSchema.pre('save', function(next) {
  //this keyword points to currently processed document
  //add a slug to the document
  this.slug = slugify(this.name, { lower: true });
  next(); //add this or you get stuck!
});

tourSchema.pre('save', function(next) {
  console.log('will save doc');
  next();
});
//can have multiple pre/post middlwares for the same hook
//'save' is an example of a pre save hook

//executed after all pre middlwares are executed
//so now we have the finished doc
tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});

/* 
THIS IS WHAT THE DOC LOOKS LIKE BEFORE ITS SAVED TO DB
THEREFORE WE CAN ACT ON THIS DATA BEFORE ITS SAVED TO THE DATABASE
WE GONNA CREATE A SLUG - a string we can put on the url
{
  ratingsAverage: 4.5,
  ratingsQuantity: 0,
  images: [],
  createdAt: 2021-06-23T02:16:43.168Z,
  startDates: [],
  _id: 60d29a2855214a23accba751,
  name: 'The Test Tour',
  duration: 4,
  maxGroupSize: 10,
  difficulty: 'difficult',
  price: 997,
  summary: 'Test TOur',
  imageCover: 'tour-3-cover.jpg',
  durationWeeks: 0.5714285714285714,
  id: '60d29a2855214a23accba751'
}
*/

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
