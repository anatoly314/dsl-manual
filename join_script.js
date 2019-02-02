const fs = require('fs');
const indexFile = fs.readFileSync("./index.html").toString();

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

const regexPath = /href="([^href=].*.html)/gm;
const regexIndex = /<div class="calibreToc"[\s\S]*<div class="calibreEbNav">/gm;

const fileLocations = {};

var pathMatch;
do {
    pathMatch = regexPath.exec(indexFile);
    if (pathMatch) {
        fileLocations[pathMatch[1]] = undefined;
    }
} while (pathMatch);


let indexCreated = false;
let index = "";
let allPagesTogether = "";
Object.keys(fileLocations).forEach(fileLocation => {
    let regexContent = /<div id="main"[\s\S]*<div id="footer"/gm;
    let currentFile = fs.readFileSync(fileLocation).toString();
    let match = regexContent.exec(currentFile);
    if (match) {
        let content = match[0];
        content = content.replace('<div id=\"footer\"', "");
        content = content.replace('id=\"main\"', 'id="' + fileLocation.replace("content/","") + '"');
        content = content.replaceAll('name="', 'name="' + fileLocation.replace("content/","") + "#");
        content = content.replaceAll('href="', 'href="' + fileLocation.replace("content/","#"));
        allPagesTogether += content;
    }

    if(!indexCreated){
        let indexMatch = regexIndex.exec(currentFile);
        if(indexMatch){
            index = indexMatch[0];
            index = index.replace('<div class="calibreEbNav">', '');
            index = index.replaceAll('href="', 'href="#');
            indexCreated = true;
        }
    }
})

const template = fs.readFileSync("content/template.html").toString();

let result = template.replace("{{CONTENT_HERE}}", '<div id="content">' + allPagesTogether + '</div>');
result = result.replace("{{INDEX_HERE}}", index);

fs.writeFileSync("content/all_pages_together.html", result);

