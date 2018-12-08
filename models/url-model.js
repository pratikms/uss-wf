require('dotenv').config();

var mongoose = require('mongoose');
var config = require('./../config/config');
var base58 = require('./../config/base58');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    reconnectTries: Number.MAX_VALUE,
    autoReconnect: true,
    reconnectInterval: 300,
    poolSize: 10,
    connectTimeoutMS: 12000,
    socketTimeoutMS: 540000
}, function (err, db) {
    if (err) throw err;
});

var Schema = mongoose.Schema;

var counterSchema = new Schema({
    data: { type: String, required: true },
    seq: { type: Number, default: 1 }
});

var Counter = mongoose.model('Counter', counterSchema);

Counter.countDocuments({}, function (err, count) {
    // console.log('There are %d documents in the collection', count);
    if (count == 0) {
        var counter = new Counter({
            data: 'url_count',
            seq: 10000
        });
        counter.save(function (err) {
            if (err) console.log(err);
            console.log('Counter document saved');
        });
    }
});

var urlSchema = new Schema({
    url_id: { type: Number, index: true },
    orig_url: String,
    created_at: Date
});

urlSchema.pre('save', function (next) {
    var doc = this;
    Counter.findOneAndUpdate(
        { data: 'url_count' },
        { $inc: { seq: 1 } },
        function (error, count) {
            if (error) return next(error);
            console.log(count);
            doc.created_at = new Date();
            doc.url_id = count.seq;
            next();
        }
    );
});

var url = mongoose.model('url', urlSchema);

function shortenUrl(origUrl, res) {
    var shortUrl = '';
    console.log('Original URL: ', origUrl);
    module.exports.urlModel.findOne(
        { orig_url: origUrl },
        function (err, doc) {
            if (doc) {
                console.log('URL ID: ', doc.url_id);
                shortUrl = config.webhost + base58.encode(doc.url_id);
                res.render('shortened', { 
                    title: 'USS-WF (URL Shortening Service with Web Filtering)', 
                    originalUrl: origUrl, 
                    shortenedUrl: shortUrl 
                });
            } else {
                var newUrl = module.exports.urlModel({
                    orig_url: origUrl
                });
                newUrl.save(function (err) {
                    if (err) console.log(err);
                    shortUrl = config.webhost + base58.encode(newUrl.url_id);
                    res.render('shortened', { 
                        title: 'USS-WF (URL Shortening Service with Web Filtering)', 
                        originalUrl: origUrl, 
                        shortenedUrl: shortUrl 
                    });
                });
            }
            console.log('short URL: ' + shortUrl);
        }
    );
}

function enlargeUrl(shortUrl, res) {

    var urlId = base58.decode(shortUrl);
    module.exports.urlModel.findOne(
        { url_id: urlId },
        function (err, doc) {
            if (doc) res.redirect(doc.orig_url);
            else res.redirect(config.webhost);
        }
    );

}

module.exports.urlModel = url;
module.exports.shortenUrl = shortenUrl;
module.exports.enlargeUrl = enlargeUrl;