var fs = require('fs');
var targz = require('targz');
var readline = require('readline');
var async = require('async');
var blacklist = {};

var blacklistDir = __dirname + '/../blacklist/shallalist';

async function extractBlacklist() {
    targz.decompress({
        src: blacklistDir + '.tar.gz',
        dest: blacklistDir + '/'
    }, await function (err) {
        if (err) console.log(err);
        else console.log('Extracted');
    });
}

// // var preprocessData = new Promise(function (preprocessDir = blacklistDir + '/BL/') {
// async function preprocessData(preprocessDir = blacklistDir + '/BL/') {
//     fs.readdir(preprocessDir, function (err, categories) {
//         if (err) {
//             console.log('Not a directory. ' + err.message);
//             return false;
//         }
//         categories.forEach(category => {
//             var categoryDir = preprocessDir + category;
//             console.log('categoryDir: ' + categoryDir);
//             fs.lstat(categoryDir, function(statErr, stats) {
//                 if (statErr) {
//                     console.log('Error stating file: ' + statErr.message); 
//                     return false;
//                 }
//                 if (stats.isDirectory()) {
//                     console.log('Blah blah: ' + category);
//                     blacklist[category] = [];
//                     await preprocessData(categoryDir + '/');    
//                 } else if (stats.isFile()) {
//                     console.log('domains present in ' + category);
//                     blacklist[category] = 'Present';    
//                 }
//             });            
//         });

//         // for (let i = 0; i < categories.length; i++) {
//         //     let categoryDir = preprocessDir + categories[i];
//         //     console.log('categoryDir: ' + categoryDir);
//         //     fs.lstat(categoryDir, function(statErr, stats) {
//         //         if (statErr) {
//         //             console.log('Error stating file: ' + statErr.message); 
//         //             return false;
//         //         }
//         //         if (stats.isDirectory()) {
//         //             console.log(categories[i]);
//         //             blacklist[categories[i]] = [];
//         //             preprocessData(categoryDir + '/');    
//         //         } else if (stats.isFile()) {
//         //             console.log('domains present');
//         //             blacklist[categories[i]]['domains'] = 'Present';    
//         //         }
//         //     });

//         //     // if (fs.lstat(categoryDir).isDirectory()) {
//         //     //     console.log(categories[i]);
//         //     //     blacklist.categories[i] = {};
//         //     //     preprocessData(categoryDir + '/');
//         //     // } else if (fs.lstat(categoryDir).isFile) {
//         //     //     console.log('domains present');
//         //     //     blacklist.categories[i].domains = 'Present';
//         //     // }
//         // }
//     });
// });

/*
function preprocessData(preprocessDir = blacklistDir + '/BL/') {
    console.log('preprocessDir: ' + preprocessDir);
    fs.readdir(preprocessDir, function (err, categories) {
        if (err) {
            console.log('Not a directory');
            return false;
        }
        console.log('Categories: ');
        console.log(categories);
        for (var i = 0; i < categories.length; i++) {
            var categoryDir = preprocessDir + categories[i];
            console.log('categoryDir1: ' + categoryDir);
            if (fs.lstatSync(categoryDir).isDirectory()) {
                console.log('isDirectory');
                preprocessData(categoryDir + '/');
            } else if (fs.lstatSync(categoryDir).isFile() && categories[i] == 'domains') {
                console.log('isFile: ' + categoryDir);
                var lineReader = readline.createInterface({
                    input: fs.createReadStream(categoryDir)
                });
                lineReader.on('line', function (line) {
                    //console.log('Line from file ' + categoryDir + ': ' + line);
                });
            }
        }
    });
}


function blacklist() {
    if (fs.existsSync(blacklistDir)) {
        console.log('shallalist file exists');
    } else {
        console.log('shallalist file does not exist');
        extractBlacklist();
    }
    preprocessData();
}
*/

// function configureBlacklist() {
//     fs.open(blacklistDir, 'r', function (err, stats) {
//         if (err) {
//             console.log('File does not exist. ' + err.message);
//             extractBlacklist();
//         }
//         // console.log('File exists')
//         // (preprocessData(), function () {
//         //     console.log('BL: ');
//         //     console.log(blacklist);
//         // });
        
//         // await preprocessData
//         // .then(function () {
//         //     console.log('BLCB: ');
//         //     console.log(blacklist);
//         });

//         finalJSON = preprocessData();
//     });
// }

// async function configureBlacklist() {
//     fs.open(blacklistDir, 'r', async function (err, stats) {
//         if (err) {
//             console.log('File does not exists. ' + err.message);
//             await extractBlacklist();
//         }
//         console.log('File exists.');
//     });
// }

function createBlacklistDirIfNotExists() {
    fs.open(blacklistDir, 'r', function (err, stats) {
        if (err) {
            console.log('File does not exists. ' + err.message);
            extractBlacklist();
        }
        console.log('File exists from here');
    });
}

function outputIfExists() {
    console.log(__filename);
    fs.open(blacklistDir, 'r', function (err, stats) {
        if (err) console.log('Still error');
        console.log('File exists');
    });

}

function configureBlacklist() {
    async.waterfall([
        createBlacklistDirIfNotExists,
        outputIfExists,
    ], function (waterfallErr, result) {
        if (waterfallErr) console.log('HEEEEREE: ' + waterfallErr);
        console.log('RESULT: ' + result);
    });
}

// module.exports.blacklist = blacklist;
module.exports.configureBlacklist = configureBlacklist;