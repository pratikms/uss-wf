var alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
var base = alphabet.length;

function encode(urlId) {
    var encoded = '';
    while (urlId) {
        console.log('Number: ' + urlId);
        var remainder = urlId % base;
        console.log('Remainder: ' + urlId);
        urlId = Math.floor(urlId / base);
        console.log('Reduced number: ' + urlId);
        encoded = alphabet[remainder].toString() + encoded;
        console.log('Encoded: ' + encoded);
    }
    console.log('Final encoded: ' + encoded);
    return encoded;
}

function decode(shortenedUrl) {
    var decoded = 0;
    while (shortenedUrl) {
        console.log('Shortened URL: ' + shortenedUrl);
        var index = alphabet.indexOf(shortenedUrl[0]);
        console.log('Index: ' + index);
        var power = shortenedUrl.length - 1;
        console.log('Power: ' + power);
        decoded += index * (Math.pow(base, power));
        console.log('Decoded: ' + decoded);
        shortenedUrl = shortenedUrl.substring(1);
        console.log('Shortened URL: ' + shortenedUrl);
    }
    console.log('Decoded: ' + decoded);
    return decoded;
}

module.exports.encode = encode;
module.exports.decode = decode;