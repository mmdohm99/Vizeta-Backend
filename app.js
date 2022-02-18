/* eslint-disable prettier/prettier */
const express = require('express');

const app = express();
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const backEndDoctorRouter = require('./routes/backend/doctorRoutes');
const frontEndDoctorRouter = require('./routes/front/doctorRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
var cors = require('cors');

// 1) Middlewares
app.use(cors());

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use((req, res, next) => {
    req.requestTime = new Date().toDateString();
    // console.log(req.headers);
    next();
});

// 2) routes
//front end routes
app.use('/api/v1/doctors', frontEndDoctorRouter);

app.use('/api/v1/admin/doctors', backEndDoctorRouter);
app.use('/api/v1/users', userRouter);
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createNewTour);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 400)); // 400 bad requrest
});
app.use(globalErrorHandler);

module.exports = app;