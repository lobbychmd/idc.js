var a = 'donguo';
var hasher = require('crypto').createHash('sha1');
hasher.update(a);

console.log(hasher.digest('hex'));
