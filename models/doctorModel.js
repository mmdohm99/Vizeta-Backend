const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Doctor Must Have a Name'],
        trim: true,
        maxLength: [
            40,
            'A Doctor name must be less or equal 40 characters'
        ],
        minLength: [
            4,
            'A Doctor name must be greater or equal 4 characters'
        ]
    },
    email: {
        type: String,
        required: [true, 'Please Provide Your Email!'],
        validate: [validator.isEmail, 'invalid email']
    },
    phone: {
        type: String,
        required: [true, 'A Doctor Must Have Phone']
    },
    address: {
        type: String,
        required: [true, 'A Doctor Must Have Address']
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'A Doctor Must Have Specialization']
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
    fees: {
        type: Number,
        required: [true, 'A Doctor must have fees']
    },
    // priceDiscount: {
    //     type: Number,
    //     validate: {
    //         message: 'Discount Price ({VALUE}) Cannot Be Greater than price',
    //         validator: function(value) {
    //             // this only points to current doc on new document creation not update!!!
    //             return value < this.price;
    //         }
    //     }
    // },
    image: {
        type: String,
        default: 'male.jpg',
        required: [true, 'A tour Must Have a Profile Image']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    available: {
        type: Boolean,
        default: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// doctorSchema.virtual('availableTimes').get(function() {
//     return this.available;
// });
// mongoose Middleware types: 1) document 2)query 3)aggregate 4) model

/********* 1) Document MiddleWare runs before .save() .create() *********/
doctorSchema.pre('save', function(next) {
    /* This Refer to current Document */
    this.slug = slugify(this.name, { lower: true });
    next();
});
// doctorSchema.pre('save', function(next) {
//     console.log(this);
//     next();
// });
// doctorSchema.post('save', function(doc, next) {
//     this.slug = slugify(this.name, { lower: true });
//     console.log(doc);
//     next();
// });

/******************  2) Query Middleware ****************/
// doctorSchema.pre(/^find/, function(next) {
//     //^find > any query that has find (find, findOne,findOneAndUpdate....)
//     /* This Refer to current Query */
//     this.find({ secretTour: { $ne: true } });
//     this.start = Date.now();
//     next();
// });
// doctorSchema.post(/^find/, function(docs, next) {
//     //^find > any query that has find (find, findOne,findOneAndUpdate....)
//     console.log(`Query Took ${Date.now() - this.start} milliSeconds`);
//     // console.log(docs);
//     next();
// });

/******************  3) Aggregation Middleware ****************/
// doctorSchema.pre('aggregate', function(next) {
//     /* This Refer to current document that has pipeline */
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//     next();
// });
const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;