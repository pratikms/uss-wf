var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var urlModel = require('./models/url-model');
var blacklistModel = require('./models/blacklist-model');
var bodyParser = require('body-parser');
var url = require('url');
var dns = require('dns');

var app = express();

// blacklist = blacklist.configureBlacklist(blacklist.blacklistDir);
// console.log('blacklist: ');
// console.log(JSON.stringify(blacklist.pop()));

// blacklist = blacklist.configureBlacklist();

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
  dns.lookup(hostname, async function (err, address, family) {
    if (err || !hostname || !address) {
      // res.status(412).send( { 'error': 'Invalid URL' } );
      res.status(412).render('invalid', { 
        title: 'USS-WF (URL Shortening Service with Web Filtering)', 
        message: 'Invalid URL',
        messageDescription: 'Please enter a valid URL'
      });
    } else {
      belongsToBlacklistedCategory = await blacklistModel.belongsToBlacklistedCategory(hostname);
      console.log('even after aync/ await: ');
      // console.log(belongsToBlacklistedCategory);
      if (belongsToBlacklistedCategory.length > 0) {
        res.status(412).render('blacklist', {
          title: 'USS-WF (URL Shortening Service with Web Filtering)', 
          message: 'Blacklisted URL',
          messageDescription: 'This URL cannot be shortened as it is blacklisted since it belongs to ',
          blacklistCategories: belongsToBlacklistedCategory
        });
      } else {
        urlModel.shortenUrl(origUrl, res);
      }
    }
  });
});

app.get('/:shortUrl', function (req, res) {

  var shortUrl = req.params.shortUrl;
  urlModel.enlargeUrl(shortUrl, res);

});

module.exports = app;
