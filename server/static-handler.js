module.exports = (request, response) => {
    let fs = require('fs');

    let path;

    switch (request.url) {
        case '/':
            path = __dirname + "/../www/index.html";
            break;

        case '/socket.io.js':
            path = __dirname + "/../node_modules/socket.io-client/dist/socket.io.js";
            break;

        default :
            path = __dirname + "/../www" + request.url;
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
