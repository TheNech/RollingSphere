module.exports = (request, response) => {
    let fs = require('fs');

    let path;

    if (request.url.split('/')[1] === 'bootstrap') {
        
        path = __dirname +  request.url.replace("/bootstrap", '/../node_modules/bootstrap/dist');

        fs.readFile(path, (error, data) => {
            if (error) {
                response.writeHead(404);
                response.end('Not found');

                return;
            }

            response.writeHead(200);
            response.end(data);
        });

        return;
    }

    switch (request.url) {
        case '/':
            path = __dirname + '/../www/index.html';
            break;

        case '/lib/jquery.min.js':
            path = __dirname + '/../node_modules/jquery/dist/jquery.min.js';
            break;

        case '/lib/socket.io.js':
            path = __dirname + '/../node_modules/socket.io-client/dist/socket.io.js';
            break;

        case '/lib/three.min.js':
            path = __dirname + '/../node_modules/three/build/three.min.js';
            break;

        case '/lib/OrbitControls.js':
            path = __dirname + '/../node_modules/three/examples/js/controls/OrbitControls.js';
            break;

        default :
            path = __dirname + '/../www' + request.url;
            break;
    }

    fs.readFile(path, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.end('Not found');

            return;
        }

        response.writeHead(200);
        response.end(data);
    });
};
