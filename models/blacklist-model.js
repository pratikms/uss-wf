require('dotenv').config();

var mongoose = require('mongoose');
var config = require('./../config/config');
var blacklist = require('./../config/blacklist');

mongoose.connect(process.env.MONGO_URI, function (err, db) {
    if (err) throw err;
});

var Schema = mongoose.Schema;

var blacklistSchema = new Schema({
    category: { type: String },
    domains: { type: Array }
});

var BlacklistModel = mongoose.model('Blacklist', blacklistSchema);

BlacklistModel.countDocuments({}, function (err, count) {
    console.log('There are %d documents in the blacklist collection', count);
    if (count == 0) {
        var blacklistCategories = blacklist.configureBlacklist();
        var bulkInsertOps = [];
        blacklistCategories.forEach(function (doc) {
            bulkInsertOps.push({ 'insertOne': { 'document': doc }});
            if (bulkInsertOps.length === 1000) {
                BlacklistModel.collection.bulkWrite(bulkInsertOps).then(function (r) {
                    console.log('Bulk inserted 1000 objects');
                });
                bulkInsertOps = [];
            }
        });
        if (bulkInsertOps.length > 0) {
            BlacklistModel.collection.bulkWrite(bulkInsertOps).then(function (r) {
                console.log('Bulk inserted 1000 objects');
            });
        }
        // BlacklistModel.collection.insertMany(blacklistCategories, function (err, docs) {
        //     if (err) console.log(err);
        //     else console.info('%d categories stored successfully', docs.length);
        // });
    }
});

module.exports.blacklistModel = BlacklistModel;