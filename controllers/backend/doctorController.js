/* eslint-disable prettier/prettier */
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

exports.createDoctor = catchAsync(async(req, res, next) => {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
        // means data created successfully
        status: 'success',
        data: {
            doctor
        }
    });
});

exports.updateDoctor = catchAsync(async(req, res, next) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // send the newly updated doctor to client
        runValidators: true
    });
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
exports.deleteDoctor = catchAsync(async(req, res, next) => {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
        return next(new AppError('No Doctor Found With That id', 404));
    }
    res.status(200).json({
        // 204 record deleted
        status: 'success',
        data: null
    });
});