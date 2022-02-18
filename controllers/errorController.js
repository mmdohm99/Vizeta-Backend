/* eslint-disable prettier/prettier */
const AppError = require('./../utils/appError');
const handleCastErrorDB = (err) => {
    const message = `invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400); // 400 bad requrest
};

const handleDuplicateFieldDB = (err) => {
    const message = `duplicate field value ${
        err.keyValue.name || ''
    }, please use another value`;
    return new AppError(message, 400); // 400 bad requrest
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid Input Data. ${errors.join(', ')}`;
    return new AppError(message, 400); // 400 bad requrest
};

const handleJWTError = () =>
    new AppError('Invalid token, please login again!', 401); //401 unauthorized
const handleJWTExpiredError = () =>
    new AppError('Your Token Has Expired, please login again!', 401); //401 unauthorized
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    //operational error,trusted error : send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        //unknown error,trusted error : we don't want to leak error to the client
    } else {
        //1) log error
        console.log('Error 🔥', err);

        //2) send generic message to the client
        res.status(500).json({
            status: 'error',
            message: 'something went wrong'
        });
    }
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        console.log(err);
        console.log(err.name);
        let error = Object.assign({}, err);
        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
        if (err.code === 11000) error = handleDuplicateFieldDB(error);
        sendErrorProd(error, res);
    }
};