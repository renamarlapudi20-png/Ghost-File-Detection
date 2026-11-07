const path = require('path');

// Check hidden files
function isHidden(filePath) {
    const name = path.basename(filePath);

    return name.startsWith('.');
}

// Check suspicious extensions
function isSuspicious(filePath) {
    const extensions = [
        '.exe',
        '.bat',
        '.ps1',
        '.vbs',
        '.scr'
    ];

    return extensions.includes(
        path.extname(filePath).toLowerCase()
    );
}

// Analyze file activity
function detectThreat(event, filePath) {
    let alerts = [];

    if (isHidden(filePath)) {
        alerts.push('Hidden File Detected');
    }

    if (isSuspicious(filePath)) {
        alerts.push('Suspicious File Extension');
    }

    if (event === 'unlink') {
        alerts.push('File Deleted');
    }

    return {
        file: path.basename(filePath),
        event: event,
        alerts: alerts,
        status: alerts.length ? 'Suspicious' : 'Normal',
        time: new Date().toLocaleString()
    };
}

module.exports = {
    isHidden,
    isSuspicious,
    detectThreat
};