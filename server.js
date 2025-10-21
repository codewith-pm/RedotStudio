const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3000;
const INDEX_FILE = 'index.html';

// MIME type mapping for serving assets
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

/**
 * Handles incoming HTTP requests.
 */
const requestListener = (req, res) => {
    // Determine the file path. Default to index.html for the root path.
    let filePath = req.url === '/' ? INDEX_FILE : req.url.substring(1);
    
    // Safety check to prevent directory traversal attacks
    filePath = path.normalize(filePath);
    if (filePath.startsWith('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden: Invalid path.');
        return;
    }

    // Determine the MIME type
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Read the file from the local file system
    fs.readFile(filePath, (err, content) => {
        if (err) {
            // File not found (404)
            if (err.code === 'ENOENT') {
                // For simplicity, always serve index.html for any sub-path not found
                // This simulates routing in single-page applications (SPAs)
                if (req.url !== '/' && path.extname(req.url) === '') {
                    fs.readFile(INDEX_FILE, (error, indexContent) => {
                        if (error) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end(`Server Error: Could not read ${INDEX_FILE}`);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(indexContent, 'utf-8');
                        }
                    });
                    return;
                }
                
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`404 Not Found: ${req.url}`);

            } else {
                // Server error (500)
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success (200)
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
    console.log(`\n-----------------------------------------------------`);
    console.log(`✅ Node.js Live Server is running!`);
    console.log(`🌐 Open your browser to: http://localhost:${PORT}`);
    console.log(`-----------------------------------------------------\n`);
});
