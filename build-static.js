const fs = require('fs');
const path = require('path');

const root = __dirname;
const projects = JSON.parse(fs.readFileSync(path.join(root, 'dev-data/data.json'), 'utf8'));
const cardTemplate = fs.readFileSync(path.join(root, 'project-card.template'), 'utf8');
const navigation = fs.readFileSync(path.join(root, 'shared-navigation.html'), 'utf8');

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
    '/resume': './resume.html'
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

['resume.html'].forEach((file) => {
    const filePath = path.join(root, file);
    fs.writeFileSync(filePath, staticize(fs.readFileSync(filePath, 'utf8')));
});

console.log(`Static GitHub Pages build complete: ${projects.length} projects.`);
