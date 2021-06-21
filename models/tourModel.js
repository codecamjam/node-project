const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'], //validator
    unique: true //cant have 2 tour docs with the same name
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: String,
    required: [true, 'A tour must have a price']
  }
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;