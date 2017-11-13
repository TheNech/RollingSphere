const http = require("http");
const fs = require("fs");
const port = 8080;

http.createServer((req, res) => {
    let url = req.url;
    if (url == "/") {
        url = "/index.html";
    }

    fs.readFile("www" + url, (error, data) => {
        if (error) {
            res.statusCode = 404;
            res.end("Not Found");
        } else {
            res.end(data);
        }
    });
}).listen(port);

console.log("Server started. Listening port " + port);
