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
    output = output.replace(/{%CATEGORY%}/g, product.category || 'fullstack');
    output = output.replace(/{%URL%}/g, product.url || '/project');
    return output;
}

const templateOverview = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
const templateStyle = fs.readFileSync(`${__dirname}/css/style.css`, 'utf-8');
const templateProject = fs.readFileSync(`${__dirname}/project.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/project-card.template`, 'utf-8');
const templateResume = fs.readFileSync(`${__dirname}/resume.html`, 'utf-8');
const templateBlog = fs.readFileSync(`${__dirname}/blog.html`, 'utf-8');
const templateArticle = fs.readFileSync(`${__dirname}/article.template`, 'utf-8');
const sharedNavigation = fs.readFileSync(`${__dirname}/shared-navigation.html`, 'utf-8');
const clientScript = fs.readFileSync(`${__dirname}/app.js`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const articles = {
    'resilient-interfaces': {
        title: 'Building interfaces that still feel good when the data gets messy',
        category: 'Engineering',
        readTime: '8 min read',
        description: 'Good interfaces are not designed only for the perfect screenshot. They are designed for reality.',
        image: '/img/gal-10.jpeg',
        imageAlt: 'Laptop on a workspace',
        body: `<p class="article__lead">The fastest way to expose a fragile interface is to replace its neat sample content with real data. Names wrap. Images disappear. Requests fail. Useful design begins where the ideal state ends.</p>
        <h2>Start with uncomfortable content</h2><p>Before polishing a component, test it with the longest believable title, no description, a broken image, and an empty response. These cases reveal structural decisions while they are still cheap to change.</p>
        <blockquote>Resilience is not an edge-case feature. It is part of the everyday experience.</blockquote>
        <h2>Make failure useful</h2><p>An error message should explain what happened in plain language and offer a sensible next step. Preserve the person’s input, keep navigation available, and avoid turning a temporary server problem into a dead end.</p>
        <h2>Build a rhythm, not a screenshot</h2><p>Reusable spacing, type scales, and layout rules let unfamiliar content land naturally. The goal is to create a system that keeps its character as content changes.</p>`
    },
    'smaller-slices': {
        title: 'Why smaller slices make better software',
        category: 'Process',
        readTime: '5 min read',
        description: 'A practical way to reduce risk, learn sooner, and keep useful momentum throughout a project.',
        image: '/img/gal-11.jpeg',
        imageAlt: 'Developer planning software work',
        body: `<p class="article__lead">Large features feel efficient because they promise one complete delivery. In practice, they hide assumptions for too long. Smaller slices make progress visible and feedback useful.</p>
        <h2>A slice should be usable</h2><p>A good slice is not simply one technical layer. It connects enough of the interface, behavior, and data to let someone experience a real outcome—even if the outcome is intentionally narrow.</p>
        <h2>Feedback becomes cheaper</h2><p>When a team can review working behavior early, corrections are small. Waiting until every part is complete turns the same correction into a redesign across several connected systems.</p>
        <blockquote>Progress is easier to trust when people can see and use it.</blockquote>
        <h2>Keep the next step obvious</h2><p>Finish each slice with a clear understanding of what it taught you. That knowledge should shape the next piece of work instead of forcing the team to follow an outdated plan.</p>`
    },
    'css-details': {
        title: 'The quiet CSS details that make a site feel finished',
        category: 'Frontend',
        readTime: '6 min read',
        description: 'Spacing rhythm, readable line lengths, focus states, and the small decisions people feel immediately.',
        image: '/img/gal-12.jpeg',
        imageAlt: 'Code and interface design workspace',
        body: `<p class="article__lead">A polished interface is rarely the result of one dramatic effect. It comes from many small rules behaving consistently across every screen and state.</p>
        <h2>Start with a spacing rhythm</h2><p>Choose a small set of spacing values and reuse them. Consistent relationships between headings, paragraphs, cards, and sections make a page feel intentional before any decoration is added.</p>
        <h2>Protect readability</h2><p>Long lines slow readers down. Give paragraphs a sensible maximum width, use comfortable line height, and ensure text contrast remains strong over images and tinted surfaces.</p>
        <blockquote>The best visual details support the content instead of competing with it.</blockquote>
        <h2>Design every interaction state</h2><p>Hover is only one state. Keyboard focus, disabled controls, loading feedback, and touch targets deserve the same attention. These details turn attractive pages into dependable interfaces.</p>`
    },
    'learning-in-public': {
        title: 'Learning in public without performing',
        category: 'Career',
        readTime: '4 min read',
        description: 'A grounded approach to sharing progress while keeping the real work and learning at the center.',
        image: '/img/gal-13.jpeg',
        imageAlt: 'Creative desk used for learning and writing',
        body: `<p class="article__lead">Sharing what you learn can create accountability and help other people. It becomes less useful when the appearance of progress begins to replace the difficult work of making progress.</p>
        <h2>Share evidence, not an identity</h2><p>Post the small thing you built, the bug you understood, or the decision you changed. Concrete lessons are more helpful than trying to present yourself as someone who already knows everything.</p>
        <h2>Keep unfinished work honest</h2><p>Say what is experimental and what remains uncertain. Clear context makes a rough idea valuable without making it sound like a final answer.</p>
        <blockquote>You do not need to be an expert to explain what yesterday taught you.</blockquote>
        <h2>Protect time for quiet practice</h2><p>Not every lesson needs to become content. Some understanding needs repetition before it becomes clear enough to share. The work remains more important than the post.</p>`
    },
    'api-errors': {
        title: 'API errors are part of the user interface',
        category: 'Backend',
        readTime: '7 min read',
        description: 'Clear server responses lead to calmer debugging and more useful product experiences.',
        image: '/img/gal-14.jpeg',
        imageAlt: 'Developer working with application data',
        body: `<p class="article__lead">An API error may begin on the server, but its final audience is often a person trying to complete a task. The quality of that response shapes what the interface can explain and recover from.</p>
        <h2>Return useful distinctions</h2><p>Validation problems, missing records, expired sessions, and unavailable services should not all look identical. Stable status codes and error identifiers help the client choose the right response.</p>
        <h2>Write messages for the next reader</h2><p>Logs need technical context; users need clear language and a next step. Keep those responsibilities separate so internal details are not leaked and public messages remain understandable.</p>
        <blockquote>A useful error answers two questions: what happened, and what can I do now?</blockquote>
        <h2>Preserve recovery paths</h2><p>Where possible, keep form data, offer a retry, and return enough structured detail to highlight the exact field that needs attention. Failure should interrupt the task as little as possible.</p>`
    }
};

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
    } else if (pathName === '/blog' || pathName === '/blog.html') {
        res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        res.end(withSharedNavigation(templateBlog));
    } else if (pathName.startsWith('/blog/')) {
        const slug = pathName.slice('/blog/'.length);
        const article = articles[slug];
        if (!article) {
            res.writeHead(404, {'content-type': 'text/html; charset=utf-8'});
            return res.end('<h1>Article not found</h1>');
        }
        let articleHtml = templateArticle
            .replace(/{%SHARED_NAVIGATION%}/g, sharedNavigation)
            .replace(/{%ARTICLE_TITLE%}/g, article.title)
            .replace(/{%ARTICLE_CATEGORY%}/g, article.category)
            .replace(/{%ARTICLE_READ_TIME%}/g, article.readTime)
            .replace(/{%ARTICLE_DESCRIPTION%}/g, article.description)
            .replace(/{%ARTICLE_IMAGE%}/g, article.image)
            .replace(/{%ARTICLE_IMAGE_ALT%}/g, article.imageAlt)
            .replace(/{%ARTICLE_BODY%}/g, article.body);
        res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
        res.end(articleHtml);

    // Project Page
    } else if (pathName === '/project' || pathName === '/project.html') {
        res.writeHead(200, {'content-type': 'text/html'});
        const cardsHtml = dataObj.map(el => replaceTemplate(templateCard, el)).join('');
        const projectOutput = templateProject.replace(
            /<!-- PROJECT_CARDS_START -->[\s\S]*?<!-- PROJECT_CARDS_END -->/,
            `<!-- PROJECT_CARDS_START -->${cardsHtml}<!-- PROJECT_CARDS_END -->`
        );
        res.end(withSharedNavigation(projectOutput));

    // Static article files used by GitHub Pages
    } else if (/^\/blog-[a-z0-9-]+\.html$/.test(pathName)) {
        const filePath = path.join(__dirname, pathName);
        fs.readFile(filePath, 'utf8', (err, html) => {
            if (err) {
                res.writeHead(404, {'content-type': 'text/html; charset=utf-8'});
                return res.end('<h1>Article not found</h1>');
            }
            res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
            res.end(html);
        });

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

module.exports = { articles };
