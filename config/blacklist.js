var fs = require('fs');
var targz = require('targz');
var path = require('path');
var blacklist = {};
var ignoreList = ['COPYRIGHT', 'domains'];

var blacklistDir = __dirname + '/../blacklist/shallalist';

var walkSync = function (dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignoreList.indexOf(file) < 0) {
            const dirFile = path.join(dir, file);
            const dirent = fs.statSync(dirFile);
            if (dirent.isDirectory()) {
                console.log('directory: ', path.join(dir, file));
                var odir = {
                    file: dirFile,
                    files: []
                }
                odir.files = walkSync(dirFile, dir.files);
                fileList.push(odir);
            } else {
                fileList.push({
                    file: dirFile
                });
            }
        }
    }
    return fileList;
}

module.exports.configureBlacklist = walkSync;
module.exports.blacklistDir = blacklistDir;