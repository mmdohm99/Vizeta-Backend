/* eslint-disable prettier/prettier */
const app = require('../app');
const Tour = require('../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
// param middle ware
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary';
    next();
};

exports.getAllTours = catchAsync(async(req, res, next) => {
    // Build The Query
    // //1A) filtering
    // const queryObj = {...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((field) => delete queryObj[field]);
    // // const query = await Tour.find()
    // //     .where('difficulty')
    // //     .equals('easy')
    // //     .where('duration')
    // //     .equals(5);

    // // 1B) advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(
    //     /\b(gte|gt|lte|lt)\b/g,
    //     (match) => `$${match}`
    // );
    // let query = Tour.find(JSON.parse(queryStr));

    //2) Sorting
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     query = query.sort(sortBy);
    // } else {
    //     query = query.sort('-price');
    // }
    //3) Field Limiting
    // if (req.query.fields) {
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields);
    // } else {
    //     query = query.select('-__v');
    // }

    //4) paginations
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //     const numTours = await Tour.countDocuments();
    //     if (skip >= numTours) throw new Error('This Page Does not exist');
    // }
    // excute the query object
    const features = new ApiFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;
    //send response
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});
exports.getTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    // if (!tour) {
    //     return next(new AppError('No Tour Found With That id', 404));
    // }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.createTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.create(req.body);
    res.status(201).json({
        // means data created successfully
        status: 'success',
        data: {
            tour
        }
    });
});

exports.updateTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // send the newly updated tour to client
        runValidators: true
    });
    if (!tour) {
        return next(new AppError('No Tour Found With That id', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});
exports.deleteTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppError('No Tour Found With That id', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getTourStats = catchAsync(async(req, res, next) => {
    const stats = await Tour.aggregate([{
            $match: { ratingsAverage: { $gte: 2 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsAverage' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([{
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStart: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStart: -1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});