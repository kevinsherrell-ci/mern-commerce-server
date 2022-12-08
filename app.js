const cors = require('cors');
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const profileRouter = require('./routes/profiles');
const orderRouter = require('./routes/orders');

const {mongoConnect} = require("./Mongo");
mongoConnect();

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['set-cookies']
}

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI +  process.env.MONGO_DATABASE
})

app.use(session({
    secret: process.env.JWT_SECRET_KEY,
    saveUninitialized:false,
    resave:false,
    store: store,
    cookie: {
        httpOnly: true,
        path: '/',
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}))
app.use(cors(corsOptions));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users',  usersRouter);
app.use('/profiles', profileRouter);
app.use('/orders', orderRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
