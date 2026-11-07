const calculateHash = require('./hash');

const file = './test-folder/notes.txt';

console.log('SHA-256 Hash:');
console.log(calculateHash(file));