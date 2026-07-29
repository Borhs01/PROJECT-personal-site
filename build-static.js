const fs = require('fs');
const path = require('path');
const { articles } = require('./index');

const root = __dirname;
const projects = JSON.parse(fs.readFileSync(path.join(root, 'dev-data/data.json'), 'utf8'));
const cardTemplate = fs.readFileSync(path.join(root, 'project-card.template'), 'utf8');
const navigation = fs.readFileSync(path.join(root, 'shared-navigation.html'), 'utf8');
const articleTemplate = fs.readFileSync(path.join(root, 'article.template'), 'utf8');

const fillCard = (project) => cardTemplate
    .replace(/{%IMAGE_HEAD%}/g, project.image_head)
    .replace(/{%TEXT%}/g, project.text)
    .replace(/{%TITLE%}/g, project.title)
    .replace(/{%DESCRIPTION%}/g, project.description)
    .replace(/{%CATEGORY%}/g, project.category)
    .replace(/{%URL%}/g, project.url);

const routeMap = {
    '/overview': './index.html',
    '/project': './project.html',
    '/resume': './resume.html',
    '/blog': './blog.html'
};

const staticize = (html) => {
    let output = html.replace(
        /<(?:header|section) class="section__header">[\s\S]*?<\/(?:header|section)>/,
        navigation
    );
    Object.entries(routeMap).forEach(([route, file]) => {
        output = output.replace(new RegExp(`href="${route}"`, 'g'), `href="${file}"`);
    });
    output = output
        .replace(/href="\/blog\/([^"]+)"/g, 'href="./blog-$1.html"')
        .replace(/href="\/css\//g, 'href="./css/')
        .replace(/href="\/img\//g, 'href="./img/')
        .replace(/src="\/img\//g, 'src="./img/')
        .replace(/src="\/app\.js"/g, 'src="./app.js"');
    return output;
};

const cards = projects.map(fillCard).join('');
['index.html', 'project.html'].forEach((file) => {
    const filePath = path.join(root, file);
    const source = fs.readFileSync(filePath, 'utf8');
    const rendered = source.replace(
        /<!-- PROJECT_CARDS_START -->[\s\S]*?<!-- PROJECT_CARDS_END -->/,
        `<!-- PROJECT_CARDS_START -->${cards}<!-- PROJECT_CARDS_END -->`
    );
    fs.writeFileSync(filePath, staticize(rendered));
});

['resume.html', 'blog.html'].forEach((file) => {
    const filePath = path.join(root, file);
    fs.writeFileSync(filePath, staticize(fs.readFileSync(filePath, 'utf8')));
});

Object.entries(articles).forEach(([slug, article]) => {
    const rendered = articleTemplate
        .replace(/{%SHARED_NAVIGATION%}/g, navigation)
        .replace(/{%ARTICLE_TITLE%}/g, article.title)
        .replace(/{%ARTICLE_CATEGORY%}/g, article.category)
        .replace(/{%ARTICLE_READ_TIME%}/g, article.readTime)
        .replace(/{%ARTICLE_DESCRIPTION%}/g, article.description)
        .replace(/{%ARTICLE_IMAGE%}/g, article.image)
        .replace(/{%ARTICLE_IMAGE_ALT%}/g, article.imageAlt)
        .replace(/{%ARTICLE_BODY%}/g, article.body);
    fs.writeFileSync(path.join(root, `blog-${slug}.html`), staticize(rendered));
});

console.log(`Static GitHub Pages build complete: ${projects.length} projects and ${Object.keys(articles).length} articles.`);
