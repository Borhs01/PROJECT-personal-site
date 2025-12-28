const fs = require('fs');
const http = require('http');
const path = require('path');
///////////////// Files

// Blocking / Synchronous
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut = `This what we know about Avocados: ${textIn}. \nCreated ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File Written!');

// Non-Blocking / Asynchrnous 
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    //if (err) return console.log('ERROR');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);
//             fs.writeFile('./txt/final.txt', `${data2} \n ${data3} \n ${Date.call()} \n ${data1}`, 'utf-8', err => {
//                 console.log('your file has been written!');
//             })
//         });
//     });
// });
// console.log('this should comes first...');
///////////////// Server
const replaceTemplate = (temp, product) => {
    let output = temp.replace(/{%IMAGE_HEAD%}/g, product.image_head);
    output = output.replace(/{%TEXT%}/g, product.text);
    output = output.replace(/{%TITLE%}/g, product.title);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    return output;
}

const templateOverview = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
const templateStyle = fs.readFileSync(`${__dirname}/css/style.css`, 'utf-8');
const templateProject = fs.readFileSync(`${__dirname}/project.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/project_card.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
    const pathName = new URL(req.url, `http://${req.headers.host}`).pathname;

    // Serve CSS
    if (pathName === '/css/style.css') {
        res.writeHead(200, {'content-type': 'text/css'});
        return res.end(templateStyle);
    }

    // Serve images and other static assets under /img or /SVG
    if (pathName.startsWith('/img/') || pathName.startsWith('/SVG/')) {
        const filePath = path.join(__dirname, pathName);
        return fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, {'content-type': 'text/plain'});
                return res.end('Not found');
            }
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.avif': 'image/avif',
                '.webp': 'image/webp',
            };
            res.writeHead(200, {'content-type': mimeTypes[ext] || 'application/octet-stream'});
            res.end(data);
        });
    }

    // Overview Page
    if (pathName === '/' || pathName === '/overview') {
        res.writeHead(200, {'content-type': 'text/html'});
        const cardsHtml = dataObj.map(el => replaceTemplate(templateCard, el)).join('');
        const templateOverviewFinal = templateOverview.replace('{%PROJECT_CARDS%}', cardsHtml);
        res.end(templateOverviewFinal);

    // Project Page
    } else if (pathName === '/project') {
        res.writeHead(200, {'content-type': 'text/html'});
        const cardsHtml = dataObj.map(el => replaceTemplate(templateCard, el)).join('');
        const output = templateProject.replace('{%PROJECT_CARDS%}', cardsHtml);
        res.end(output);

    // API Page
    } else if (pathName === '/api') {
        res.writeHead(200, {'content-type': 'application/json'})
        res.end(data);

    // Not Found
    } else {
        res.writeHead(404, {
            'content-type': 'text/html'
        })
        res.end('<h1>Page not found</h1>')
    }
})
server.listen(8080, '127.0.0.1', () => {
    console.log('Listening to request on port 8080');
});