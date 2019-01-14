require('dotenv').config();

var mongoose = require('mongoose');
var config = require('./../config/config');
var blacklist = require('./../config/blacklist');
var categoriesToBeBlacklisted = ['porn', 'urlshortener', 'hacking'];

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

var blacklistCounterSchema = new Schema({
    present: { type: Boolean }
});

var blacklistSchema = new Schema({
    domains: { type: Array }
});

var BlacklistCounterModel = mongoose.model('BlacklistCounter', blacklistCounterSchema);

BlacklistCounterModel.countDocuments({}, function (err, count) {
    if (err) console.error(err);
    // console.log('There are %d documents in the blacklist collection', count);
    if (count == 0) {
        var blacklistDomainCount = 0;
    
        var blacklistCategories = blacklist.configureBlacklist();
        var preprocessedBlacklist = blacklist.preprocessBlacklist(blacklistCategories);

        for (var category in preprocessedBlacklist) {
            var BlacklistModel = mongoose.model('Blacklist', blacklistSchema, category);
            var blacklistModel = new BlacklistModel({
                domains: preprocessedBlacklist[category].domains
            });
            blacklistModel.save(function (modelErr) {
                if (modelErr) console.error(modelErr);
                blacklistDomainCount += preprocessedBlacklist[category].domains.length;
            });
        }

        var blacklistCounter = BlacklistCounterModel({
            present: true
        });
        blacklistCounter.save(function (counterErr) {
            if (counterErr) console.error(counterErr);
            console.log(blacklistDomainCount + ' domains saved');
        });

    } else {
        console.log('Blacklist already present in database');
    }
});

async function belongsToBlacklistedCategory(hostname) {
    console.log('Domain to be validated: ' + hostname);
    console.log('TypeOf Domain: ' + typeof(hostname));
    var blacklistedCategory = [];
    for (var i in categoriesToBeBlacklisted) {
        console.log('Collection to be investigated: ' + 'blacklist_' + categoriesToBeBlacklisted[i] + '_' + hostname.charAt(0));
        var blacklistModel = mongoose.model('Blacklist', blacklistSchema, 'blacklist_' + categoriesToBeBlacklisted[i] + '_' + hostname.charAt(0));
        var query = blacklistModel.find(
            { domains : hostname }
        );
        var result = await query.exec();
        if (result.length > 0) blacklistedCategory.push(categoriesToBeBlacklisted[i]);
        
    }
    if (blacklistedCategory.length > 0) {
        blacklistedCategory = blacklistedCategory
            .map(function (category) { 
                console.log('filter: ' + category);
                return category.charAt(0).toUpperCase() + category.slice(1); 
            })
            .join(', ');    
    }
    return blacklistedCategory;
}

module.exports.belongsToBlacklistedCategory = belongsToBlacklistedCategory;
module.exports.categoriesToBeBlacklisted = categoriesToBeBlacklisted;
module.exports.blacklistSchema = blacklistSchema;