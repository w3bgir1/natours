const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

app
  .set('view engine', 'pug')
  .set('views', path.join(__dirname, 'views'))

  // 1) GLOBAL MIDDLEWARES
  // Serving static files

  .use(express.static(path.join(__dirname, 'public')))
  // Set security HTTP headers
  .use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same IP
const limitter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, try again in an hour'
});

app
  .use('/api', limitter)
  // Body parser, reading data from body into req.body
  .use(
    express.json({
      limit: '10kb'
    })
  )
  .use(cookieParser())
  .use(express.urlencoded({ extended: true, limit: '10kb' }))
  // Data sanitization against NoSQL query injection
  .use(mongoSanitize())
  // Data sanitization against XSS
  .use(xss())
  //Prevent parameter pollution
  .use(
    hpp({
      whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
      ]
    })
  )
  .use(compression())
  // Test middleware
  .use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
  })

  // Routes
  .use('/', viewRouter)
  .use('/api/v1/tours', tourRouter)
  .use('/api/v1/users', userRouter)
  .use('/api/v1/reviews', reviewRouter)
  .use('/api/v1/bookings', bookingRouter)
  .all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`));
  })
  .use(globalErrorHandler);

module.exports = app;
