var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var urlModel = require('./models/url-model');
var bodyParser = require('body-parser');
var url = require('url');
var dns = require('dns');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(bodyParser.urlencoded({
  extended: false
}));

// shorten URL
app.post('/api/shorten', function (req, res, next) {
  var origUrl = req.body.url;
  var hostname = url.parse(origUrl).hostname;
  var validUrl = true;
  dns.lookup(hostname, function (err, address, family) {
    if (err || !hostname || !address) {
      validUrl = false;
      res.status(412).send( { 'error': 'Invalid URL' } );
    } else {
      urlModel.shortenUrl(origUrl, res);
    }
  });
});

app.get('/:shortUrl', function (req, res) {

  var shortUrl = req.params.shortUrl;
  urlModel.enlargeUrl(shortUrl, res);

});

module.exports = app;
