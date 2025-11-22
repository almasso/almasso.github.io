export async function sha256(string) {
    const msgBuffer = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function getRoot() {
    return window.location.pathname.includes("almasso") ? "/almasso/" : "/";
}

export function shuffle(array) {
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function isPromise(promise) {
    return !!promise && typeof promise.then === 'function';
}

export function clamp(value, min, max) {
    if(value < min) return min;
    else if(value > max) return max;
    return value;
}

export function rndNext(min, max) {
    if(max === undefined) return Math.floor(Math.random() * min);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function formatString(template, replacements) {
    let result = template;
    for(const key in replacements) {
        const regex = new RegExp(`{${key}}`, 'g');
        result = result.replace(regex, replacements[key]);
    }
    return result;
}