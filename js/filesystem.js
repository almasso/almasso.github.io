import {getRoot} from "./utils.js";

export const Filesystem = {
    registry: {
        "finder": {
            name: "Finder",
            icon: "searcher.png",
            classRef: "Finder",
            type: "systemfile",
            width: 600,
            height: 400,
            maxWidth: 800,
            maxHeight: 620,
            availableStorage: "13.2 GB"
        },
        "terminal": {
            name: "Shell",
            icon: "terminal.png",
            classRef: "Terminal",
            width: 600,
            height: 400,
            maxWidth: 800,
            maxHeight: 620
        },
        "navigator": {
            name: "Navigator",
            icon: "navigator.png",
            classRef: "Navigator",
            width: 600,
            height: 400,
            maxWidth: 800,
            maxHeight: 620,
            metadata: {
                specialURL: "http://home.mcom.com/home/welcome.html"
            }
        },
        "acrobat": {
            name: "Acrobat Reader",
            icon: "acrobat.png",
            classRef: "Acrobat",
            width: 960,
            height: 720,
            maxWidth: 960,
            maxHeight: 720
        },
        "steam": {
            name: "Steam",
            icon: "steam.png",
            classRef: "Steam",
            width: 420,
            height: 320
        },
        "arkanoid": {
            name: "Arkanoid",
            icon: "arkanoid.png",
            classRef: "Arkanoid",
            width: 800,
            height: 620,
            maxWidth: 800,
            maxHeight: 620,
            appClass: "game"
        },
        "asteroids": {
            name: "Asteroids",
            icon: "asteroids.png",
            classRef: "Asteroids",
            width: 800,
            height: 620,
            maxWidth: 800,
            maxHeight: 620,
            appClass: "game"
        },
        "galactic": {
            name: "The Galactic Plague",
            icon: "galactic.png",
            classRef: "Galactic",
            width: 1280,
            height: 720,
            maxWidth: 1280,
            maxHeight: 720,
            appClass: "game"
        }
    },
    root: {
        nodeId: "root",
        desktopName: "Macintosh HD",
        desktopIcon: "drive.png",
        availableStorage: "13.2 GB",
        type: "folder",
        children: [
            {
                desktopName: "System Folder",
                type: "folder",
                desktopIcon: "folder.png",
                availableStorage: "13.2 GB",
                children: [
                    {
                        type: "systemfile",
                        programId: "finder"
                    }
                ]
            },
            {
                desktopName: "Desktop",
                type: "folder",
                desktopIcon: `folder.png`,
                availableStorage: "13.2 GB",
                children: [
                    {
                        desktopName: "Macintosh HD",
                        desktopIcon: "drive.png",
                        type: "link",
                        targetId: "root"
                    },
                    {
                        type: "systemfile",
                        programId: "terminal"
                    },
                    {
                        type: "file",
                        programId: "navigator"
                    },
                    {
                        type: "file",
                        programId: "acrobat"
                    },
                    {
                        type: "file",
                        programId: "steam",
                        metadata: {
                            unique: true
                        }
                    },
                    {
                        desktopName: "Games",
                        type: "folder",
                        desktopIcon: "folder.png",
                        availableStorage: "13.2 GB",
                        children: [
                            {
                                type: "file",
                                programId: "arkanoid",
                                metadata: {
                                    unique: true,
                                    isAlias: true
                                }
                            },
                            {
                                type: "file",
                                programId: "asteroids",
                                metadata: {
                                    isAlias: true,
                                    unique: true
                                }
                            },
                            {
                                type: "file",
                                programId: "galactic",
                                metadata: {
                                    isAlias: true,
                                    unique: true
                                }
                            },
                            {
                                desktopName: "ÑRPG",
                                desktopIcon: "erpg.png",
                                appClass: "webgame",
                                type: "file",
                                programId: "navigator",
                                metadata: {
                                    isAlias: true,
                                    specialURL: "http://www.erpg.manininteractive.com",
                                    unique: true
                                }
                            }
                        ]
                    },
                    {
                        desktopName: "UNI",
                        type: "folder",
                        desktopIcon: "folder.png",
                        availableStorage: "13.2 GB",
                        children: [
                            {
                                desktopName: "TFG",
                                type: "file",
                                programId : "acrobat",
                                desktopIcon: "pdf.png",
                                metadata : {
                                    pdf: "TFG"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

function findNodeById(targetId, currentNode = Filesystem.root) {
    if(currentNode.nodeId === targetId) return currentNode;
    if(currentNode.children) {
        for(const child of currentNode.children) {
            const result = findNodeById(targetId, child);
            if(result) return result;
        }
    }
    return null;
}

export function getFolderContent(pathArray) {
    let currentNode = Filesystem.root;
    
    if (!pathArray || pathArray.length === 0) return currentNode;

    for (let folderName of pathArray) {
        if (!currentNode.children) return null;
        
        const childNode = currentNode.children.find(c => (c.desktopName || c.name) === folderName);

        if (!childNode) return null;

        if (childNode.type === "link") {
            const targetNode = findNodeById(childNode.targetId);
            currentNode = targetNode;
        } else currentNode = childNode;
    }
    return currentNode;
}

function findPath(node, targetName, currentPath = []) {
    const name = node.desktopName ?? null;

    const newPath = name ? [...currentPath, name] : currentPath;

    if(node.type === "folder" && name === targetName) return newPath;

    if(!node.children) return null;

    for(const child of node.children) {
        const result = findPath(child, targetName, newPath);
        if(result) return result;
    }

    return null;
}

export function getFullPath(folder) {
    return "/" + findPath(Filesystem.root, folder).join("/");
}

export function findNodeByProgramId(programId, currentNode = Filesystem.root, currentPath = []) {
    const folderName = currentNode.desktopName || currentNode.name;
    const myPath = folderName ? [...currentPath, folderName] : currentPath;
    if(currentNode.programId === programId) {
        return {node: currentNode, path: "/" + myPath.join("/")};
    }
    if(currentNode.children) {
        for(const child of currentNode.children) {
            const result = findNodeByProgramId(programId, child, myPath);
            if(result) return result;
        }
    }
    return null;
}

export function findAllNodesByProgramId(programId, currentNode = Filesystem.root, currentPath = []) {
    let matches = [];
    const folderName = currentNode.desktop || currentNode.name;
    const myPath = folderName ? [...currentPath, folderName] : currentPath;
    if(currentNode.programId === programId) {
        matches.push({node: currentNode, path: "/" + myPath.join("/")});
    }
    if(currentNode.children) {
        for(const child of currentNode.children) {
            const childMatches = findAllNodesByProgramId(programId, child, myPath);
            matches = matches.concat(childMatches);
        }
    }
    return matches;
}