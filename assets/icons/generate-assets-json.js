const fs = require('fs');
const path = require('path');

const direc = '.';
let filesList = [];

function readFolder(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const route = path.join(dir, file);
        if(fs.statSync(route).isDirectory()) {
            readFolder(route);
        }
        else {
            if(file.endsWith(".png") || file.endsWith(".svg") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".bmp"))
                filesList.push(route.replace(/\\/g, '/'));
        }
    });
}

readFolder(direc);
fs.writeFileSync("assets.json", JSON.stringify(filesList, null, " "));