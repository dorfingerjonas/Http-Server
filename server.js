const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((req, res) => {

    const q = url.parse(req.url, true);

    if (q.pathname === '/') {

        sendResponse(res, 'public/html/index.html', 404, 'text/html');

    } else if (q.pathname === '/css/main.css') {
        sendResponse(res, 'public/css/main.css', 200, 'text/css');
    } else if (q.pathname === '/404.css') {

        sendResponse(res, 'public/css/404.css', 200, 'text/css');

    } else if (q.pathname === '/favicon.ico') {

        sendResponse(res, 'public/img/favicon.ico', 200, 'image/x-icon');

    } else if (q.pathname === '/chat') {

        let page = fs.readFileSync('public/html/chat.html', 'utf8');
        let chat = fs.readFileSync('public/data/chat.csv', 'utf8');
        let chatHtml = '';

        for (let line of chat.split('\n')) {
            if (line) {
                line = line.split(';');

                chatHtml += `<div><h3>${line[0]}</h3><p>${line[1]}</p></div>`;
            }
        }

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page.replace('<!--placeholder-->', chatHtml));
        res.end();

    } else if (q.pathname === '/chat_upload') {

        if (q.query.name && q.query.message) {
            let line = `${q.query.name};${q.query.message}\n`;
            fs.appendFile('public/data/chat.csv', line, 'utf8', (err) => {
                if (err) throw err;
                console.log('@file chat.csv: new data added.');

                fs.readFile(`public/html/chat_confirm.html`, 'utf8', (err, data) => {
                    if (err) throw err;

                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(data);
                    res.end();
                });
            });

        } else {

            fs.readFile(`public/html/chat_error.html`, 'utf8', (err, data) => {
                if (err) throw err;

                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            });
        }

    } else {

        fs.readFile(`public/html${q.pathname}.html`, 'utf8', (err, data) => {
            if (err) {
                sendResponse(res, 'public/html/404.html', 404, 'text/html');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            }
        });

    }
});

server.listen(3000);

console.log('Server started, listen @ port 3000');

function sendResponse(res, filepath, status, type) {

    fs.readFile(filepath, (err, data) => {
        res.writeHead(status, {'Content-Type': type});
        res.write(data);
        res.end();
    })

}