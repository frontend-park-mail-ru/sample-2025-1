const http = require('http');
const fs = require('fs');
const is = require('is-thirteen');

const port = 8001;

const server = http.createServer((req, res) => {

    const {url} = req;

    console.log(is(13).thirteen());

    const fileName = url === '/' ? '/index.html' : url;
    let file;
    try {
        file = fs.readFileSync(`./public${fileName}`);
    } catch (error) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('not okay');
        return;
    }

    res.writeHead(200);
    res.end(file);
});

console.log(`LISTENING ON ${port}`);

server.listen(port);
