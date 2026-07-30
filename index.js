const fs = require('fs');
const http = require('http');
const path = require('path');

const replaceTemplate = (temp, product) => {
    let output = temp.replace(/{%IMAGE_HEAD%}/g, product.image_head);
    output = output.replace(/{%TEXT%}/g, product.text);
    output = output.replace(/{%TITLE%}/g, product.title);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%CATEGORY%}/g, product.category || 'fullstack');
    output = output.replace(/{%URL%}/g, product.url || '/project');
    return output;
}

const templateOverview = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
const templateStyle = fs.readFileSync(`${__dirname}/css/style.css`, 'utf-8');
const templateProject = fs.readFileSync(`${__dirname}/project.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/project-card.template`, 'utf-8');
const templateResume = fs.readFileSync(`${__dirname}/resume.html`, 'utf-8');
const sharedNavigation = fs.readFileSync(`${__dirname}/shared-navigation.html`, 'utf-8');
const clientScript = fs.readFileSync(`${__dirname}/app.js`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const withSharedNavigation = (html) => html.replace(
    /<(?:header|section) class="section__header">[\s\S]*?<\/(?:header|section)>/,
    sharedNavigation
);

const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const pathName = urlObj.pathname;
    const showAll = urlObj.searchParams.get('all') === 'true' || urlObj.searchParams.get('all') === '1';

    // Serve CSS
    if (pathName === '/css/style.css') {
        res.writeHead(200, {'content-type': 'text/css'});
        return res.end(templateStyle);
    }

    if (pathName === '/app.js') {
        res.writeHead(200, {'content-type': 'text/javascript; charset=utf-8'});
        return res.end(clientScript);
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
    if (pathName === '/' || pathName === '/overview' || pathName === '/index.html') {
        res.writeHead(200, {'content-type': 'text/html'});
        // Show up to 6 items on the overview. Items that have an `overview` flag
        // use that; otherwise default the first 6 items in the data to overview.
        const overviewItems = dataObj.filter((item, idx) => {
            if (Object.prototype.hasOwnProperty.call(item, 'overview')) return Boolean(item.overview);
            return idx < 6;
        }).slice(0, 6);

        const cardsHtml = overviewItems.map(el => replaceTemplate(templateCard, el)).join('');
        const templateOverviewFinal = templateOverview.replace(
            /<!-- PROJECT_CARDS_START -->[\s\S]*?<!-- PROJECT_CARDS_END -->/,
            `<!-- PROJECT_CARDS_START -->${cardsHtml}<!-- PROJECT_CARDS_END -->`
        );
        res.end(withSharedNavigation(templateOverviewFinal));

    // Resume and writing
    } else if (pathName === '/resume' || pathName === '/resume.html') {
        res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        res.end(withSharedNavigation(templateResume));
    // Project Page
    } else if (pathName === '/project' || pathName === '/project.html') {
        res.writeHead(200, {'content-type': 'text/html'});
        const cardsHtml = dataObj.map(el => replaceTemplate(templateCard, el)).join('');
        const projectOutput = templateProject.replace(
            /<!-- PROJECT_CARDS_START -->[\s\S]*?<!-- PROJECT_CARDS_END -->/,
            `<!-- PROJECT_CARDS_START -->${cardsHtml}<!-- PROJECT_CARDS_END -->`
        );
        res.end(withSharedNavigation(projectOutput));

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
if (require.main === module) {
    server.listen(8080, '127.0.0.1', () => {
        console.log('Listening to request on port 8080');
    });
}
