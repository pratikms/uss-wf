var os = require('os');
var config = {};

var hostname = os.hostname();
config.webhost = hostname + ':3000/';

module.exports = config;