/* eslint-disable prettier/prettier */
const app = require('../../app');
const Doctor = require('../../models/doctorModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
// param middle ware

exports.getAllDoctors = catchAsync(async(req, res, next) => {
    const doctors = await Doctor.find();
    //send response
    res.status(200).json({
        status: 'success',
        results: doctors.length,
        data: {
            doctors
        }
    });
});
exports.getDoctor = catchAsync(async(req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
        return next(new AppError('No Doctor Found With That id', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            doctor
        }
    });
});