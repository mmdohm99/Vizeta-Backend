/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Provide Your Name!']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please Provide Your Email!'],
        validate: [validator.isEmail, 'invalid email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please Provide Password!'],
        minLength: 8,
        select: false // to prevent the return of password in any response
    },
    passwordConfirmation: {
        type: String,
        required: [true, 'Please Provide Password Confirmation!'],
        //putting it to required means it's required input not to be required inside database
        minLength: 8,
        validate: {
            // this only works on save or create not findOneAndUpdate
            validator: function(el) {
                return el === this.password;
            }
        }
    },
    passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
    //only run this password i fthe password is modified
    if (!this.isModified('password')) return next();
    //we hash the password with cost of 12 (salt Round)
    this.password = await bcrypt.hash(this.password, 10);
    // delete password confirmation field
    this.passwordConfirmation = undefined;
    next();
});

userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return jwtTimestamp < changedTimeStamp;
    }
    return false;
};
const User = mongoose.model('User', userSchema);
module.exports = User;