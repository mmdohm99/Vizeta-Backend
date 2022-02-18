/* eslint-disable prettier/prettier */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
exports.signup = catchAsync(async(req, res, next) => {
    console.log(req.body);
    const { name, email, password, passwordConfirmation } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirmation
    });

    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    // 1) check if email or password exist
    if (!email || !password) {
        return next(new AppError('please provide email and password!', 400)); // 400 bad requrest
    }
    //2) check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('InCorrect Email or Password!', 401)); // 401 not authorized
    }
    const token = signToken(user._id);
    //3) if everything is ok , we send the token back to the client
    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync(async(req, res, next) => {
    //1) Getting Token and check if it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please Login to get access',
                401
            ) //401 un authorized
        );
    }
    //2) verification of token  the token( verify)
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET, {}
    );
    //3) check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token no longer exists.',
                401
            )
        );
    }

    //4)check if user changed the password after the jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        //iat > issued At
        return next(
            new AppError(
                'User Recently Changed the Password, Please Login Again',
                401 // unauthorized
            )
        );
    }
    // grant access to the protected route
    req.user = currentUser;
    next();
});