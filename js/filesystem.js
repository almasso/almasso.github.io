import {getRoot} from "./utils.js";

export const Filesystem = {
    registry: {},
    root: {}
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

export async function loadFilesystem(locale) {
    try {
        const path = `${getRoot()}assets/filesystem/${locale}.json`;
        const response = await fetch(path);
        if(!response.ok) throw new Error("Could not load filesystem");
        const data = await response.json();

        Filesystem.registry = data.registry;
        Filesystem.root = data.root;
    } catch(error) {
        console.error("Critical error at loading filesystem:", error);
        if(locale !== "en_US") await loadFilesystem("en_US");
    }
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