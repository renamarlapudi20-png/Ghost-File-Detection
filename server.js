
const express = require('express');
const path = require('path');
const fs = require('fs');

const startMonitoring = require('./monitor');

const app = express();
const PORT = 3000;

let events = [];

const dataFolder = path.join(__dirname, 'data');
const logFile = path.join(dataFolder, 'logs.json');

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

if (fs.existsSync(logFile)) {
    try {
        events = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (error) {
        console.log('Invalid log file. Starting fresh.');
        events = [];
    }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Start file monitoring
const folder = path.join(__dirname, 'test-folder');

startMonitoring(folder, (result) => {

    events.unshift(result);

    events = events.slice(0, 100);

    try {
        fs.writeFileSync(
            logFile,
            JSON.stringify(events, null, 2)
        );
    } catch (error) {
        console.log('Error saving logs:', error.message);
    }

});

// Server status API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Running',
        project: 'Ghost File Detection'
    });
});

// File events API
app.get('/api/events', (req, res) => {
    res.json(events);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
