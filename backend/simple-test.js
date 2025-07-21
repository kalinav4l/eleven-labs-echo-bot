const express = require('express');
const app = express();

console.log('Starting server...');

app.get('/health', (req, res) => {
    console.log('Health endpoint hit');
    res.json({ status: 'ok' });
});

const server = app.listen(8081, () => {
    console.log('Server is listening on port 8081');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
