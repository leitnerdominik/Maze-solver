const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 8000);
const root = process.cwd();
const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
};

function resolveRequestPath(url) {
    const requestPath = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
    const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath);
    const relativeToRoot = path.relative(root, filePath);

    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        return null;
    }

    return filePath;
}

const server = http.createServer((request, response) => {
    const filePath = resolveRequestPath(request.url);

    if (!filePath) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(404);
            response.end('Not found');
            return;
        }

        response.writeHead(200, {
            'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
        });
        response.end(content);
    });
});

server.listen(port, () => {
    console.log(`Maze Solver dev server running at http://localhost:${port}`);
});
