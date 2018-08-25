require('dotenv').config();

var mongoose = require('mongoose');
var config = require('./../config/config');
var base58 = require('./../config/base58');

mongoose.connect(process.env.MONGO_URI, function (err, db) {
    if (err) throw err;
});

var Schema = mongoose.Schema;

var counterSchema = new Schema({
    data: { type: String, required: true },
    seq: { type: Number, default: 1 }
});

var Counter = mongoose.model('Counter', counterSchema);

Counter.countDocuments({}, function (err, count) {
    console.log('There are %d documents in the collection', count);
    if (count == 0) {
        var counter = new Counter({
            data: 'url_count',
            seq: 1
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

// function findUrlQuery(url) {
//     console.log('In findUrlQuery()');
//     return module.exports.urlModel.findOne( { orig_url: url } );
// }

// TODO
function shortenUrl(origUrl, res) {
    var shortUrl = '';
    console.log('Original URL: ', origUrl);
    // var query = await findUrlQuery(origUrl);
    // query
    //     .then(function (doc) {
    //         console.log('Doc: ', doc);
    //     });
        // .error(function (err) {
        //     console.log(err);
        // });

    // query.exec(function (err, doc) {
    //     if (err) console.log(err);
    //     if (doc) {
    //         console.log('URL ID: ', doc.url_id);
    //         shortUrl = config.webhost + base58.encode(doc.url_id);
    //     } else {
    //         var newUrl = module.exports.urlModel({
    //             orig_url: origUrl
    //         });
    //         newUrl.save(function (err) {
    //             if (err) console.log(err);
    //         });
    //         shortUrl = config.webhost = base58.encode(newUrl.url_id);
    //     }
    //     console.log('short URL: ' + shortUrl);
    //     return shortUrl;
    // });

    module.exports.urlModel.findOne(
        { orig_url: origUrl },
        function (err, doc) {
            if (doc) {
                console.log('URL ID: ', doc.url_id);
                shortUrl = config.webhost + base58.encode(doc.url_id);
                res.send({
                    'original_url': origUrl,
                    'short_url': shortUrl
                });
            } else {
                var newUrl = module.exports.urlModel({
                    orig_url: origUrl
                });
                newUrl.save(function (err) {
                    if (err) console.log(err);
                    shortUrl = config.webhost + base58.encode(newUrl.url_id);
                    res.send({
                        'original_url': origUrl,
                        'short_url': shortUrl
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