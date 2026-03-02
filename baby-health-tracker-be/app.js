var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bcrypt = require('bcryptjs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var connectDB = require('./configs/MongoDBConfig');
var accountService = require('./services/accountService');

var app = express();

const ensureAdminAccount = async () => {
  const email = 'admin@example.com';
  const password = '123456';

  try {
    const existing = await accountService.findAccountByEmail(email);
    if (existing) {
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await accountService.createAccount({
      email,
      password: hashedPassword,
      role: 'admin',
      is_verified: true,
    });

    console.log('Admin account created');
  } catch (error) {
    console.error('Admin account seed error:', error.message);
  }
};

connectDB()
  .then(() => ensureAdminAccount());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

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
