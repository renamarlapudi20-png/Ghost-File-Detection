
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const { detectThreat } = require('./detector');
const calculateHash = require('./hash');

const previousHashes = new Map();

// Load existing file hashes
function loadBaseline(folder) {

    const files = fs.readdirSync(folder, {
        withFileTypes: true
    });

    files.forEach(item => {

        const filePath = path.resolve(folder, item.name);

        if (item.isDirectory()) {

            loadBaseline(filePath);

        } else {

            previousHashes.set(
                filePath,
                calculateHash(filePath)
            );
        }
    });
}

// Start file monitoring
function startMonitoring(folderPath, onEvent) {

    const absoluteFolder = path.resolve(folderPath);

    // Save initial hashes
    loadBaseline(absoluteFolder);

    const watcher = chokidar.watch(absoluteFolder, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100
        }
    });

    watcher.on('all', (event, filePath) => {

        if (!['add', 'change', 'unlink'].includes(event)) {
            return;
        }

        const absolutePath = path.resolve(filePath);

        const result = detectThreat(event, absolutePath);

        if (event !== 'unlink' && fs.existsSync(absolutePath)) {

            const currentHash = calculateHash(absolutePath);
            const oldHash = previousHashes.get(absolutePath);

            result.hash = currentHash;

            // Check file integrity
            if (
                event === 'change' &&
                oldHash &&
                oldHash !== currentHash
            ) {

                result.alerts.push('File Integrity Changed');
                result.status = 'Suspicious';

                console.log('WARNING: File integrity changed!');
            }

            previousHashes.set(absolutePath, currentHash);

        } else {

            result.hash = null;
            previousHashes.delete(absolutePath);
        }

        console.log('File Activity:', result);

        if (onEvent) {
            onEvent(result);
        }
    });
    console.log('Monitoring:', absoluteFolder);
    return watcher;
}
module.exports = startMonitoring;