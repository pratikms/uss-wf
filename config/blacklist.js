var fs = require('fs');
var targz = require('targz');
var path = require('path');
var blacklist = {};
var ignoreList = ['COPYRIGHT', 'global_usage', 'urls'];

var blacklistDir = __dirname + '/../blacklist/shallalist';

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
            blacklistCategory.push({
                category: blacklist[category].category,
                domains: blacklist[category].files[0].domains
            });    
        // }
    }
    return blacklistCategory;
}

function configureBlacklist() {
    var blacklist = walkSync(blacklistDir).pop().files;
    // console.log('configureBlacklist output: ');
    // console.log(JSON.stringify(blacklist.pop().files));
    blacklistCategory = generateBlacklistCategories(blacklist);
    // console.log(JSON.stringify(blacklistCategory));
    return blacklistCategory;
}

module.exports.configureBlacklist = configureBlacklist;
module.exports.blacklistDir = blacklistDir;