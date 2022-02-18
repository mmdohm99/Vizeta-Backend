const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour Must Have a Name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A Tour name must be less or equal characters'],
        minLength: [10, 'A Tour name must be greater or equal characters']
            // validate: [
            //     validator.isAlpha,
            //     'Tour Name Must Only Contain Characters'
            // ]
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour Must Have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a Group Size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['difficult', 'easy', 'medium'],
            message: 'Difficulty is either difficult, easy , or medium'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4,
        min: [1, 'Rating Must be Greater than or equal to 1'],
        max: [5, 'Rating Must be Less than or equal to 5']
    },
    ratingsQuantitiy: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour Must Have a Price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            message: 'Discount Price ({VALUE}) Cannot Be Greater than price',
            validator: function(value) {
                // this only points to current doc on new document creation not update!!!
                return value < this.price;
            }
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour Must Have a Summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour Must Have a Cover Image']
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
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});
// mongoose Middleware types: 1) document 2)query 3)aggregate 4) model

/********* 1) Document MiddleWare runs before .save() .create() *********/
tourSchema.pre('save', function(next) {
    /* This Refer to current Document */
    this.slug = slugify(this.name, { lower: true });
    next();
});
// tourSchema.pre('save', function(next) {
//     console.log(this);
//     next();
// });
// tourSchema.post('save', function(doc, next) {
//     this.slug = slugify(this.name, { lower: true });
//     console.log(doc);
//     next();
// });

/******************  2) Query Middleware ****************/
tourSchema.pre(/^find/, function(next) {
    //^find > any query that has find (find, findOne,findOneAndUpdate....)
    /* This Refer to current Query */
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});
tourSchema.post(/^find/, function(docs, next) {
    //^find > any query that has find (find, findOne,findOneAndUpdate....)
    console.log(`Query Took ${Date.now() - this.start} milliSeconds`);
    // console.log(docs);
    next();
});

/******************  3) Aggregation Middleware ****************/
tourSchema.pre('aggregate', function(next) {
    /* This Refer to current document that has pipeline */
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

    next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;