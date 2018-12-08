var fs = require('fs');
// var targz = require('targz');
var tar = require('tar');
var path = require('path');
var blacklist = {};
var ignoreList = ['COPYRIGHT', 'global_usage', 'urls'];

var blacklistDir = __dirname + '/../blacklist/shallalist';

function extractBlacklist() {
    // targz.decompress({
    //     src: blacklistDir + '.tar.gz',
    //     dest: blacklistDir + '/'
    // }, function (err) {
    //     if (err) console.log(err);
    //     else console.log('Extracted');
    // });

    tar.x({
        file: blacklistDir + '.tar.gz',
        cwd: blacklistDir + '/',
        sync: true
    })
    // .then(function () {
    //     console.log('Extracted');
    // })
    ;
}

var walkSync = function (dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignoreList.indexOf(file) < 0) {
            const dirFile = path.join(dir, file);
            const dirent = fs.statSync(dirFile);
            if (dirent.isDirectory()) {
                var odir = {
                    file: dirFile,
                    category: file,
                    files: []
                }
                odir.files = walkSync(dirFile, dir.files);
                fileList.push(odir);
            } else {
                var domains = fs.readFileSync(dirFile, 'utf8').toString().split(String.fromCharCode(10));
                // fileList.push();
                
                // fileList.push({
                //     file: dirFile
                // });

                fileList.push({
                    file: dirFile,
                    domains: domains
                });
            }
        }
    }
    return fileList;
}

function generateBlacklistCategories(blacklist /*, blacklistCategory = [] */) {
    var blacklistCategory = [];
    for (var category in blacklist) {
        // if (blacklist[category].files[0].hasOwnProperty('category')) {
        //     blacklistCategory = generateBlacklistCategories(blacklist[category].files[0], blacklistCategory);
        // } else {
            // TODO: Handle nested directories
            if (blacklist[category].files[0].hasOwnProperty('domains')) {
            blacklistCategory.push({
                category: blacklist[category].category,
                domains: blacklist[category].files[0].domains
            });    
        }
        // }
    }
    return blacklistCategory;
}

function configureBlacklist() {
    if (fs.existsSync(blacklistDir + '/BL')) {
        console.log('shallalist file exists');
    } else {
        console.log('shallalist file does not exist');
        extractBlacklist();
    }
    var blacklist = walkSync(blacklistDir).pop().files;
    // console.log('configureBlacklist output: ');
    // console.log(JSON.stringify(blacklist.pop().files));
    blacklistCategory = generateBlacklistCategories(blacklist);
    // console.log(JSON.stringify(blacklistCategory));
    return blacklistCategory;
}

function preprocessBlacklist(blacklistCategories) {
    var preprocessedBlacklist = [];
    blacklistCategories.forEach(function (blacklist) {
        // console.log(blacklist.category);
        var category = blacklist.category;
        var collection = 'blacklist_' + category;
        // if (collection == 'anonvpn' || collection == 'automobile') console.log(JSON.stringify(blacklist));
        // console.log('-------------------- ' + blacklist.category + ' --------------------');
        // console.log(blacklist.domains);
        var domains = blacklist.domains.filter(Boolean);
        // blacklist.domains
        domains
        // .filter(function (element) {
            //     return element != null;
            // })
            .forEach(function (domain) {
                var modelledCollection = collection;
                modelledCollection += '_' + (
                    // for handling special case of .tumblr.com in porn
                    domain.toLowerCase().charAt(0) == '.' ?
                    domain.toLowerCase().charAt(1) : 
                    domain.toLowerCase().charAt(0)
                );
                if (!(modelledCollection in preprocessedBlacklist)) {
                    preprocessedBlacklist[modelledCollection] = {
                        domains: []
                    };
                }
                preprocessedBlacklist[modelledCollection].domains.push(domain.toLowerCase());
            });
    });
    return preprocessedBlacklist;
}

module.exports.configureBlacklist = configureBlacklist;
module.exports.preprocessBlacklist = preprocessBlacklist;