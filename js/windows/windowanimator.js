export default class WindowAnimator {

    static animateOpen(iconElement, windowElement, onComplete) {
        if (!iconElement || !windowElement) {
            if (onComplete) onComplete();
            return;
        }

        let iconRect = null;
        if(iconElement.getElementsByClassName("indiv-icon")[0] === undefined) {
            iconRect = iconElement.getElementsByClassName("icon-stack")[0].getBoundingClientRect();
        }
        else {
            iconRect = iconElement.getElementsByClassName("indiv-icon")[0].getBoundingClientRect();
        }

        const originalVisibility = windowElement.style.visibility;
        const originalDisplay = windowElement.style.display;
        
        windowElement.style.display = 'block';
        windowElement.style.visibility = 'hidden';
        
        const winRect = windowElement.getBoundingClientRect();

        windowElement.style.visibility = originalVisibility; 

        const ghost = this.#createGhost(iconRect);
        document.body.appendChild(ghost);

        ghost.getBoundingClientRect();

        this.#applyRect(ghost, winRect);

        ghost.addEventListener('transitionend', () => {
            ghost.remove();
            windowElement.style.visibility = 'visible';
            windowElement.style.display = originalDisplay;
            windowElement.style.opacity = '1';
            
            if (onComplete) onComplete();
        }, { once: true });
    }

    static animateClose(iconElement, windowElement, onComplete) {
        if (!iconElement || !windowElement) {
            if (onComplete) onComplete();
            return;
        }

        let iconRect = null;
        if(iconElement.getElementsByClassName("indiv-icon")[0] === undefined) {
            iconRect = iconElement.getElementsByClassName("icon-stack")[0].getBoundingClientRect();
        }
        else {
            iconRect = iconElement.getElementsByClassName("indiv-icon")[0].getBoundingClientRect();
        }
        const winRect = windowElement.getBoundingClientRect();

        windowElement.style.visibility = 'hidden';

        const ghost = this.#createGhost(winRect);
        document.body.appendChild(ghost);

        ghost.getBoundingClientRect();

        this.#applyRect(ghost, iconRect);

        ghost.addEventListener('transitionend', () => {
            ghost.remove();
            if (onComplete) onComplete();
        }, { once: true });
    }

    static #createGhost(rect) {
        const ghost = document.createElement('div');
        ghost.classList.add('window-ghost');
        this.#applyRect(ghost, rect);
        return ghost;
    }

    static #applyRect(element, rect) {
        element.style.top = `${rect.top}px`;
        element.style.left = `${rect.left}px`;
        element.style.width = `${rect.width}px`;
        element.style.height = `${rect.height}px`;
    }
}