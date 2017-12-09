const fs = require('fs'),
    path = require('path');

const nfCode = 404, // eslint-disable-line one-var
    okCode = 200,
    path2nm = path.join(__dirname, '..', 'node_modules');

module.exports = (request, response) => {
    let fpath = null;

    if (request.url.split('/')[1] === 'bootstrap') {
        fpath = request.url.replace('/bootstrap',
            path.join(path2nm, 'bootstrap', 'dist'));

        fs.readFile(fpath, (error, data) => {
            if (error) {
                response.writeHead(nfCode);
                response.end('Not found');

                return;
            }

            response.writeHead(okCode);
            response.end(data);
        });

        return;
    }

    switch (request.url) {
        case '/':
            fpath = path.join(__dirname, '..', 'www', 'index.html');
            break;

        case '/lib/jquery.min.js':
            fpath = path.join(path2nm, 'jquery', 'dist', 'jquery.min.js');
            break;

        case '/lib/socket.io.js':
            fpath = path.join(path2nm, 'socket.io-client', 'dist',
                'socket.io.js');
            break;

        case '/lib/three.min.js':
            fpath = path.join(path2nm, 'three', 'build', 'three.min.js');
            break;

        case '/lib/OrbitControls.js':
            fpath = path.join(path2nm, 'three', 'examples', 'js', 'controls',
                'OrbitControls.js');
            break;

        default:
            fpath = path.join(__dirname, '..', 'www', request.url);
            break;
    }

    fs.readFile(fpath, (error, data) => {
        if (error) {
            response.writeHead(nfCode);
            response.end('Not found');

            return;
        }

        response.writeHead(okCode);
        response.end(data);
    });
};
