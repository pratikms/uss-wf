var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'USS-WF (URL Shortening Service with Web Filtering)' });
});

module.exports = router;
