import {getRoot} from "./utils.js";

export const Filesystem = {
    registry: {
        "searcher": {
            name: "Searcher",
            icon: "searcher.png",
            desktopName: "Searcher",
            desktopIcon: "searcher.png",
            classRef: "Searcher",
            type: "systemfile",
            width: 600,
            height: 400
        },
        "terminal": {
            name: "Terminal",
            icon: "terminal.png",
            desktopName: "Terminal",
            desktopIcon: "terminal.png",
            classRef: "Terminal",
            width: 600,
            height: 400
        },
        "navigator": {
            name: "Navigator",
            icon: "navigator.png",
            desktopName: "Navigator",
            desktopIcon: "navigator.png",
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
            desktopName: "Acrobat Reader",
            desktopIcon: "acrobat.png",
            classRef: "Acrobat",
            width: 960,
            height: 720
        },
        "steam": {
            name: "Steam",
            icon: "steam.png",
            desktopName: "Steam",
            desktopIcon: "steam.png",
            classRef: "Steam",
            width: 420,
            height: 320
        },
        "arkanoid": {
            name: "Arkanoid",
            icon: "arkanoid.png",
            desktopName: "Arkanoid",
            desktopIcon: "arkanoid.png",
            classRef: "Arkanoid",
            width: 800,
            height: 620,
            appClass: "game"
        },
        "asteroids": {
            name: "Asteroids",
            icon: "asteroids.png",
            desktopName: "Asteroids",
            desktopIcon: "asteroids.png",
            classRef: "Asteroids",
            width: 800,
            height: 620,
            appClass: "game"
        },
        "galactic": {
            name: "The Galactic Plague",
            icon: "galactic.png",
            desktopName: "The Galactic Plague",
            desktopIcon: "galactic.png",
            classRef: "Galactic",
            width: 1280,
            height: 720,
            appClass: "game"
        }
    },
    root: {
        desktopName: "Macintosh HD",
        type: "folder",
        children: [
            {
                desktopName: "System Folder",
                type: "folder",
                desktopIcon: "folder.png",
                children: [
                    {
                        type: "systemfile",
                        programId: "searcher"
                    }
                ]
            },
            {
                desktopName: "Desktop",
                type: "folder",
                desktopIcon: `folder.png`,
                children: [
                    {
                        desktopName: "Macintosh HD",
                        type: "systemfile",
                        programId: "searcher",
                        desktopIcon: "drive.png",
                        metadata: {
                            path: [],
                            isVolume: true,
                            desktopNameOverride: "Macintosh HD"
                        }
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
                            specialURL: "http://www.erpg.manininteractive.com"
                        }
                    },
                    {
                        desktopName: "Games",
                        type: "folder",
                        desktopIcon: "folder.png",
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
                                    specialURL: "http://www.erpg.manininteractive.com"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

export function getFolderContent(pathArray) {
    let current = Filesystem.root;
    if(!pathArray || pathArray.length === 0) return current;

    for(let folderdesktopName of pathArray) {
        if(current.children) {
            current = current.children.find(child => child.desktopName === folderdesktopName);
            if(!current) return null;
        }
        else return null;
    }
    return current;
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