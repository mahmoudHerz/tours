const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewShcema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be embty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewShcema.index({ tour: 1, user: 1 }, { unique: true });

reviewShcema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewShcema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRatings,
  });
};

// on create new review
reviewShcema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// update and delete review
reviewShcema.post(/^findOneAnd/, async (doc) => {
  await doc.constructor.calcAverageRatings(doc.tour);
  console.log(doc);
});

const Review = mongoose.model('Review', reviewShcema);

module.exports = Review;
