const fs = require('fs');
const crypto = require('crypto');

function calculateHash(filePath) {

    const file = fs.readFileSync(filePath);

    const hash = crypto
        .createHash('sha256')
        .update(file)
        .digest('hex');

    return hash;
}

module.exports = calculateHash;