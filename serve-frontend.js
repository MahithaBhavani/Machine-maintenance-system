/**
 * serve-frontend.js
 * Simple Node.js static file server for the frontend.
 * Run: node serve-frontend.js
 * Opens at: http://localhost:5000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const FRONTEND = path.join(__dirname, 'frontend');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
    // Strip query string
    const urlPath = req.url.split('?')[0];
    // Default to index.html
    const filePath = path.join(FRONTEND, urlPath === '/' ? 'index.html' : urlPath);

    // Security: block path traversal
    if (!filePath.startsWith(FRONTEND)) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Fall back to index.html for SPA-style routing
            fs.readFile(path.join(FRONTEND, 'index.html'), (e2, d2) => {
                if (e2) { res.writeHead(404); res.end('Not found'); return; }
                res.writeHead(200, { 'Content-Type': MIME['.html'] });
                res.end(d2);
            });
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const type = MIME[ext] || 'text/plain';
        res.writeHead(200, {
            'Content-Type': type,
            'Cache-Control': 'no-cache',
        });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log('');
    console.log('✅ Frontend server running!');
    console.log(`   Open in browser: http://localhost:${PORT}`);
    console.log('');
});
