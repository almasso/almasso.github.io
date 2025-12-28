import ProcessManager from "./processmanager.js";
import WindowManager from "./windows/windowmanager.js";
import LocalizationManager from "./localizationmanager.js";
import Icon from "./icon.js";
import {clamp, getRoot, shuffle} from "./utils.js";
import {Filesystem, getFullPath} from "./filesystem.js";

const debugVar = false;

document.addEventListener("DOMContentLoaded", () => {
    OS.getInstance().init();
});

export default class OS extends EventTarget {

    /**
     * Singleton instance
     */
    static #Instance = null;

    #baseFinder = null;

    constructor() {
        super();

        // Initialize the localization manager and subscribe to change UI strings
        LocalizationManager.getInstance().subscribeToLocaleChangeEvent(() => {
            this.#languageFlags();
            this.#setOSUIStrings();
            this.#setButtons();
        });

        WindowManager.getInstance().subscribeToCloseWindowEvent((e) => {
            this.#setCurrentApp(this.#baseFinder);
            Icon.onProcessClosed(e.detail.window.program.instanceData);
        });

        WindowManager.getInstance().subscribeToFocusWindowEvent((e) => {
            this.#setCurrentApp(e.detail.window.program);
            this.#setButtons();
            Icon.selectIcon(e.detail.window.program.instanceData);
        });

        if(!debugVar) {
            this.barWidth = 0;
            this.#loadExtensions();
            this.#waitUntilUserClicks();
        }
        else {
            this.#afterLoad();
        }

        this.currentApp = null;
        this.showTime = true;
        this.currentAppResumed = false;

        document.getElementById("topbar-slider").addEventListener("click", () => {
            this.currentAppResumed = !this.currentAppResumed;
            this.#setCurrentAppTopbarButton();
        });

        document.getElementById("desktop").addEventListener("click", (e) => {
            if(e.target === e.currentTarget) {
                WindowManager.getInstance().unfocusAllWindows();
                Icon.unclickAllIcons();
                this.#setCurrentApp(this.#baseFinder);
            }
        });

        setInterval(this.updateTime.bind(this), 100);
        this.updateTime();

        const timeDiv = document.getElementById("time-div");
        timeDiv.addEventListener("click", () => {
            this.showTime = !this.showTime;
        });
    }

// #region Singleton
    static initInstance() {
        if(!OS.#Instance) OS.#Instance = new OS();
        else return;
    }

    static getInstance() {
        if(!OS.#Instance) OS.initInstance();
        return OS.#Instance;
    }
// #endregion

// #region Bootup anim
    #loadExtensions() {
        this.extensions = shuffle([
            `${getRoot()}assets/icons/system/extensions/blender.png`,
            `${getRoot()}assets/icons/system/extensions/emscripten.png`,
            `${getRoot()}assets/icons/system/extensions/guide.png`,
            `${getRoot()}assets/icons/system/extensions/html.png`,
            `${getRoot()}assets/icons/system/extensions/opengl.png`,
            `${getRoot()}assets/icons/system/extensions/quicktime.png`,
            `${getRoot()}assets/icons/system/extensions/sdl.png`,
            `${getRoot()}assets/icons/system/extensions/sound_manager.png`,
            `${getRoot()}assets/icons/system/extensions/unity.png`,
            `${getRoot()}assets/icons/system/extensions/url_access.png`
        ])

        let container = document.getElementById("extensions");
        this.extensions.forEach(src => {
            const el = document.createElement("img");
            el.src = src;
            el.className = "ext";
            container.appendChild(el);
        });
    }

    #waitUntilUserClicks() {
        document.getElementById("bootup-screen").addEventListener("click", () => {
            let diskette = document.getElementById("load-diskette");
            diskette.classList.remove("flicker");
            diskette.classList.add("invisible");
            this.#bootupAnim();
        }, {once : true});
    }
    
    #bootupAnim() {
        let bootupScreen = document.getElementById("bootup-screen");
        bootupScreen.classList.remove("checkered");
        let macIcon = document.getElementById("bootup-macicon");
        let welcomeScreen = document.getElementById("welcome");
        const bootupSound = new Audio(`${getRoot()}assets/sounds/startup.m4a`);
        bootupSound.volume = 0.3;
        bootupSound.play();
        setTimeout(() => {
            bootupScreen.classList.add("afterChime");
            setTimeout(() => {
                macIcon.classList.remove("invisible");
                setTimeout(() => {
                    const winkSound = new Audio(`${getRoot()}assets/sounds/Temple.wav`);
                    winkSound.volume = 0.3;
                    winkSound.play();
                    macIcon.src = `${getRoot()}assets/icons/system/macs/wink.png`;
                    setTimeout(() => {
                        macIcon.classList.add("invisible");
                        document.getElementById("loading-text").textContent = LocalizationManager.getInstance().getStringsFromId("os")["boot"]["welcome"];
                        welcomeScreen.classList.remove("invisible");
                        requestAnimationFrame(() => {
                            welcomeScreen.classList.add("showing");
                        });
                        document.getElementById("extensions").classList.remove("invisible");
                        setTimeout(() => {
                            this.#loadAnim();
                        }, 4000);
                    }, 4000);
                }, 3000);
            }, 4000);
        }, 5000);
    }

    #changeCursor(route) {
        const allElements = document.querySelectorAll("*");
            allElements.forEach(el => {
            el.style.cursor = `${route}`;
        });
    }

    #loadAnim() {
        let bootupScreen = document.getElementById("bootup-screen");
        bootupScreen.style.backgroundColor = "black";
        bootupScreen.style.transition = "none";
        bootupScreen.style.backgroundImage = `url('${getRoot()}assets/bgs/defbg.png')`;
        bootupScreen.style.backgroundSize = "cover";
        document.getElementById("loading-text").textContent = LocalizationManager.getInstance().getStringsFromId("os")["boot"]["starting"];
        document.getElementById("loading-container").classList.remove("invisible");
        this.#fillBar();
    }

    #fillBar() {
        let container = document.getElementById("extensions");
        let loadingBar =  document.getElementById("loading-bar");
        if(this.barWidth < 100) {
            this.barWidth++;
            this.#changeCursor(`url('${getRoot()}assets/icons/system/spinningwheel/frame${(this.barWidth % 4) + 1}.png') 1 1, auto`);
            if(this.barWidth % 10 === 0) container.children[(this.barWidth / 10) - 1].classList.add("active");
            loadingBar.style.width = this.barWidth + '%';
            setTimeout(() => this.#fillBar(), Math.random() * 290 + 10);
        }
        else this.#afterLoad();
    }

    #afterLoad() {
        setTimeout(() => {
            document.getElementById("bootup-screen").classList.add("invisible");
            document.getElementById("extensions").classList.add("invisible");
            document.getElementById("topbar").classList.remove("invisible");
            document.getElementById("desktop").classList.remove("invisible");
            this.#changeCursor(`url('${getRoot()}assets/icons/system/cursor.png') 1 1, auto`);
        }, debugVar ? 0 : 3000);
    }
// #endregion

    async init() {
        this.#initControlStrip();
        await this.#loadFinder();
        this.#loadDesktop();
        this.#setCurrentApp(this.#baseFinder);
    }

// #region UI text management

    /**
     * Manages the language flags on the topbar
     */
    #languageFlags() {
        document.getElementById("lang-flag").innerHTML = `
            <button id="lang-button"><img src="assets/icons/system/flags/${LocalizationManager.getInstance().locale}.png" /></button>
            <div id="lang-selector" class="dropdown hidden">
                <div class="dropdown-option" data-key="de_DE"><img src="assets/icons/system/flags/de_DE.png" /></div>
                <div class="dropdown-option" data-key="en_US"><img src="assets/icons/system/flags/en_US.png" /></div>
                <div class="dropdown-option" data-key="es_ES"><img src="assets/icons/system/flags/es_ES.png" /></div>
            </div>
        `;

        const but = document.getElementById("lang-button");
        const menu = document.getElementById("lang-selector");
        const options = menu.querySelectorAll('.dropdown-option');

        but.addEventListener("click", () => {
            menu.classList.toggle("hidden");
            const rect = but.getBoundingClientRect();
            menu.style.top = `${rect.bottom + window.scrollY}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const key = option.dataset.key;
                LocalizationManager.getInstance().setLocale(key);
                menu.classList.add('hidden');
            });
        });

        document.addEventListener("click", (e) => {
            if(!but.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add("hidden");
            }
        });
    }

    /**
     * Sets the OS' UI strings in the correspondant language
     */
    #setOSUIStrings() {
        /**
         * Control strip - Monitor color settings
         */
        let mcm = document.getElementById("monitor-color-menu");
        mcm.querySelector("button:nth-child(1)").innerHTML = `${LocalizationManager.getInstance().getStringsFromId("os")["controlStrip"]["colors"]["256-g"]}`;
        mcm.querySelector("button:nth-child(2)").innerHTML = `${LocalizationManager.getInstance().getStringsFromId("os")["controlStrip"]["colors"]["normal"]}`;
    }

// #endregion

// #region Desktop logic
    /**
     * Loads all files/programs/folders in desktop and generates a functional icon for them
     */
    #loadDesktop() {
        const desktopNode = Filesystem.root.children.find(c => c.desktopName === "Desktop");
        if(desktopNode && desktopNode.children) {
            const rootName = Filesystem.root.desktopName;
            const desktopName = desktopNode.desktopName;
            const desktopPath = `/${rootName}/${desktopName}`;
            desktopNode.children.forEach(ch => {
                let itemData = {...ch};
                if(ch.type === "folder" || ch.type === "link") {
                    const itemName = ch.desktopName || ch.name;
                    itemData.route = `${desktopPath}/${itemName}`;
                }
                else itemData.route = desktopPath;
                new Icon(itemData, "desktop");
            });
        }
    }

    async #loadFinder() {
        const finderData = {...Filesystem.registry.finder, programId: "finder"};
        this.#baseFinder = await ProcessManager.getInstance().createProcess("finder", finderData);
    }

    #setCurrentApp(app) {
        this.currentApp = app;
        this.#setCurrentAppTopbarButton();
        this.#setButtons();
    }

    #setCurrentAppTopbarButton() {
        const currentAppBut = document.querySelector(".app-button-content");
        currentAppBut.innerHTML = `
            <img src="assets/icons/${(this.currentApp.instanceData.type === "systemfile" || this.currentApp.instanceData.type === "folder" || this.currentApp.instanceData.type === "link") ? 
                "system" : "programs"
                }/${this.currentApp.icon}" />
            ${this.currentAppResumed ? ``: `<span>${this.currentApp.name}</span>`}
        `;
    }

    #setButtons() {
        const buttons = document.getElementById("buttons");
        let buttonsHtml = "";
        for(const key in this.currentApp.getButtons()) {
            buttonsHtml += `
                <div id="${key}-button">
                    <div id="${key}-text">
                        <button>${this.currentApp.getButtons()[key]["text"]}</button>
                    </div>

                </div>
            `;
        }

        let idx = 0;
        let macOptions = LocalizationManager.getInstance().getStringsFromId("os")["buttons"]["apple"]["options"];
        buttons.innerHTML = `
            <div id="mac-button">
                <div id="mac-icon">
                    <button><img src="assets/icons/system/apple.png" /></button>
                </div>
                <div id="mac-settings" class="topbar-button-menu">
                    ${macOptions.map(option => `
                        <button data-action="${option.function}">${option.text}</button>
                    `).join("")}
                </div>
            </div>
            ${buttonsHtml}
        `;

        this.#setTopbarButtonsListeners();
    }

    #setTopbarButtonsListeners() {
        document.querySelectorAll("#topbar > div").forEach(container => {
            const button = container.querySelector("button");
            const menu = container.querySelector(".topbar-button-menu");
            if(!button || !menu) return;

            const closeAllMenus = () => {
                document.querySelectorAll('.topbar-button-menu.visible').forEach(m => m.classList.remove("visible"));
                document.querySelectorAll('#topbar button').forEach(b => b.classList.remove("btn-selected"));
            }

            button.addEventListener("click", (e) => {
                e.stopPropagation();

                const isOpen = menu.classList.contains("visible");
                closeAllMenus();
                if(!isOpen) {
                    button.classList.add("btn-selected");
                    menu.classList.add("visible");
                }
            });

            menu.querySelectorAll("button").forEach(menuBtn => {
                menuBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const action = menuBtn.dataset.action;
                    this.#baseFinder.functionMap[action]?.();
                    closeAllMenus();
                });
            });

            document.addEventListener("click", closeAllMenus);
        });
    }

    #initControlStrip() {
        const controlStrip = document.getElementById("control-strip");
        const closeButton = document.getElementById("ctrl-close");
        const mainArrow = document.getElementById("ctrl-arrow-main");
        const stripContainer = document.getElementById("control-non-movable");
        const controlsContainer = document.getElementById("control-strip-controls");
        const leftArrow = document.getElementById("ctrl-arrow-left");
        const rightArrow = document.getElementById("ctrl-arrow-right");
        const controlsArray = Array.from(controlsContainer.children);

        const SAFETY_MARGIN = 2; 

        const getIconWidth = () => {
            const img = controlsContainer.querySelector('img');
            if (img && img.offsetWidth > 0) {
                const style = getComputedStyle(img);
                return img.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            }
            return 48;
        };
        
        const REAL_ICON_WIDTH = getIconWidth();
        const MAX_ICONS = controlsContainer.children.length;
        let showedIcons = MAX_ICONS;
        let scrollOffset = 0;

        const getBaseWidth = () => {
            const closeW = closeButton.offsetWidth || 22.5;
            const leftW = leftArrow.offsetWidth || 22.5;
            const rightW = rightArrow.offsetWidth || 22.5;
            const containerMargins = -2; 
            return closeW + leftW + rightW + containerMargins;
        };

        const baseWidth = getBaseWidth();
        const minOpenWidth = baseWidth + REAL_ICON_WIDTH;
        const fullWidth = baseWidth + (MAX_ICONS * REAL_ICON_WIDTH);
        const dragLimit = fullWidth + 100;

        let isResizing = false;
        let didDrag = false;
        let startX = 0;
        let startWidth = 0;
        let lastOpenWidth = fullWidth;

        const updateCarouselState = () => {
            const maxOffset = Math.max(0, MAX_ICONS - showedIcons);
            scrollOffset = Math.max(0, Math.min(scrollOffset, maxOffset));

            const firstIcon = controlsContainer.firstElementChild;
            if(firstIcon) {
                firstIcon.style.marginLeft = `-${scrollOffset * REAL_ICON_WIDTH}px`;
                firstIcon.style.transition = 'margin-left 0.2s ease-out';
            }

            if (scrollOffset > 0) {
                leftArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow_left_enabled.png`; 
                leftArrow.style.cursor = 'pointer';
            } else {
                leftArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow_left.png`;
                leftArrow.style.cursor = 'default';
            }

            if (scrollOffset < maxOffset) {
                rightArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow_right_enabled.png`;
                rightArrow.style.cursor = 'pointer';
            } else {
                rightArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow_right.png`;
                rightArrow.style.cursor = 'default';
            }
        };

        leftArrow.addEventListener("mousedown", () => {
            if(scrollOffset > 0) leftArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow_left_pressed.png`;
        });
        leftArrow.addEventListener("click", () => {
            if(scrollOffset > 0) {
                scrollOffset--;
                updateCarouselState();
            }
        });

        rightArrow.addEventListener("mousedown", () => {
            const maxOffset = Math.max(0, MAX_ICONS - showedIcons);
            if(scrollOffset < maxOffset) rightArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow_right_pressed.png`;
        });
        rightArrow.addEventListener("click", () => {
            const maxOffset = Math.max(0, MAX_ICONS - showedIcons);
            if(scrollOffset < maxOffset) {
                scrollOffset++;
                updateCarouselState();
            }
        });

        const setStripWidth = (width) => {
            if (width < baseWidth / 2) {
                stripContainer.style.width = '0px';
                stripContainer.classList.add('closed');
                stripContainer.style.border = 'none';
            }
            else {
                const visibleWidth = Math.max(baseWidth, Math.min(width, dragLimit));
                stripContainer.style.width = `${visibleWidth}px`;
                stripContainer.classList.remove('closed');
                stripContainer.style.removeProperty('border');
                stripContainer.style.borderRight = 'none';
            }
        };

        const toggleCollapse = () => {
            if (didDrag) { 
                didDrag = false; 
                return; 
            }
            
            const currentWidth = stripContainer.getBoundingClientRect().width;
            if (currentWidth > 10) {
                const availableSpace = Math.max(0, currentWidth - baseWidth);
                const icons = Math.round(availableSpace / REAL_ICON_WIDTH);
                lastOpenWidth = baseWidth + (Math.max(1, Math.min(icons, MAX_ICONS)) * REAL_ICON_WIDTH);
                
                setStripWidth(0);
            }
            else {
                const targetWidth = lastOpenWidth < minOpenWidth ? fullWidth : lastOpenWidth;
                setStripWidth(targetWidth + SAFETY_MARGIN);

                const availableSpace = Math.max(0, targetWidth - baseWidth);
                showedIcons = Math.round(availableSpace / REAL_ICON_WIDTH);
                showedIcons = Math.max(1, Math.min(showedIcons, MAX_ICONS));
                updateCarouselState();
            }
        };

        closeButton.addEventListener("click", () => setStripWidth(0));
        closeButton.addEventListener("mousedown", () => closeButton.src = `${getRoot()}assets/icons/system/control_strip/close_button_pressed.png`);
        closeButton.addEventListener("mouseup", () => closeButton.src = `${getRoot()}assets/icons/system/control_strip/close_button.png`);

        mainArrow.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isResizing = true;
            didDrag = false;
            mainArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow_pressed.png`;
            startX = e.clientX;
            startWidth = stripContainer.getBoundingClientRect().width;
            document.body.style.cursor = 'w-resize';
            stripContainer.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const delta = (e.clientX - startX); 
            if (Math.abs(delta) > 3) didDrag = true;
            setStripWidth(startWidth + delta);
        });

        document.addEventListener("mouseup", () => {
            mainArrow.src = `${getRoot()}assets/icons/system/control_strip/arrow.png`;
                
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
                stripContainer.style.transition = 'width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';

                const currentWidth = stripContainer.getBoundingClientRect().width;

                if (currentWidth < baseWidth + (REAL_ICON_WIDTH * 0.5)) {
                    setStripWidth(0);
                    return;
                }

                const availableSpace = currentWidth - baseWidth;
                let iconsToShow = Math.round(availableSpace / REAL_ICON_WIDTH);
                
                iconsToShow = Math.max(1, Math.min(iconsToShow, MAX_ICONS));
                showedIcons = iconsToShow;

                const finalWidth = baseWidth + (iconsToShow * REAL_ICON_WIDTH) + SAFETY_MARGIN;

                if(didDrag) lastOpenWidth = finalWidth;
                
                stripContainer.style.width = `${finalWidth}px`;
                stripContainer.classList.remove('closed');
                updateCarouselState();
            }
        });

        document.addEventListener("click", (e) => {
            document.querySelectorAll(".control-strip-menu").forEach(menu => {
                if(!menu.contains(e.target) && !controlsContainer.contains(e.target)) menu.classList.remove("visible");
                controlsArray.forEach(ctrl => {
                    if(ctrl.querySelector("img").src.includes('_pressed.png')) ctrl.querySelector("img").src = ctrl.querySelector("img").src.replace('_pressed.png', '') + '.png';
                });
            });
        });

        controlsArray.forEach(ctrl => {
            let ctrlImg = ctrl.querySelector("img");
            ctrl.addEventListener("mousedown", () => {
                if(!ctrlImg.src.includes('_pressed.png')) ctrlImg.src = ctrlImg.src.replace('.png', '') + '_pressed.png';
            });
            ctrl.addEventListener("mouseup", () => {
                if(ctrlImg.src.includes('_pressed.png')) ctrlImg.src = ctrlImg.src.replace('_pressed.png', '') + '.png';
            });
            ctrl.addEventListener("click", (e) => {
                const menuId = e.currentTarget.id.replace('-div', '') + '-menu';
                const menu = document.getElementById(menuId);
                document.querySelectorAll('.control-strip-menu').forEach(m => {
                    if(m !== menu) {
                        m.classList.remove('visible');
                    }
                });
                if(!menu) return;

                if(menu.parentElement !== document.getElementById("desktop")) {
                    document.getElementById("desktop").appendChild(menu);
                }

                ctrlImg.src = menu.classList.toggle('visible') ? 
                    (ctrlImg.src.includes('_pressed.png') ? ctrlImg.src : ctrlImg.src.replace('.png', '') + '_pressed.png') : 
                    (ctrlImg.src.includes('_pressed.png') ? ctrlImg.src.replace('_pressed.png', '') + '.png' : ctrlImg.src);

                if(menu.classList.contains('visible')) {
                    const controlRect = e.currentTarget.getBoundingClientRect();

                    menu.style.left = `${controlRect.left - 8}px`;
                    const menuHeight = menu.offsetHeight;
                    menu.style.top = `${controlRect.top - menuHeight - 40}px`;
                }
                e.stopPropagation();
            });
        });

        document.querySelectorAll('.control-strip-menu input').forEach(slider => {
            slider.addEventListener('mouseup', (e) => {
                const menu = slider.closest('.control-strip-menu');

                if(menu.id.includes("sound-slider")) this.#changeVolume(slider.value);

                menu.classList.remove('visible');
                controlsArray.forEach(ctrl => {
                    if(ctrl.querySelector("img").src.includes('_pressed.png')) ctrl.querySelector("img").src = ctrl.querySelector("img").src.replace('_pressed.png', '') + '.png';
                });
            });
        });

        document.querySelectorAll('.control-strip-menu button').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const menu = btn.closest('.control-strip-menu');
                const action = btn.dataset.action;

                menu.querySelectorAll('button.btn-selected').forEach(selectedBtn => selectedBtn.classList.remove('btn-selected'));
                btn.classList.add('btn-selected');

                if(menu.id.includes("monitor-color")) this.#applyMonitorFilter(action);

                menu.classList.remove('visible');
                controlsArray.forEach(ctrl => {
                    if(ctrl.querySelector("img").src.includes('_pressed.png')) ctrl.querySelector("img").src = ctrl.querySelector("img").src.replace('_pressed.png', '') + '.png';
                });
            });
        });

        mainArrow.addEventListener("click", toggleCollapse);
    }

    #applyMonitorFilter(filter) {
        const monitor = document.getElementById("monitor");
        monitor.classList.remove("mode-256-gray", "mode-normal");
        monitor.classList.add("mode-" + filter);
    }

    #changeVolume(volume) {
        const vol = clamp(volume / 100, 0 , 1);

        window.ALMASSO_AUDIO.volume = vol;

        window.ALMASSO_AUDIO.contexts.forEach(ctx => {
            if(ctx.state !== 'closed' && ctx.osMasterGainNode) ctx.osMasterGainNode.gain.setTargetAtTime(vol, ctx.currentTime, 0.05);
        });

        window.ALMASSO_AUDIO.elements.forEach(audio => {
            audio.volume = vol;
        });

        document.querySelectorAll("video, audio").forEach(el => el.volume = vol);
    }

    updateTime() {
        const now = new Date();
        if(this.showTime) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('time-text').textContent = `${hours}:${minutes}`;
        }
        else {
            const day = now.getDate().toString().padStart(2, '0');
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const year = now.getFullYear().toString();
            document.getElementById('time-text').textContent = `${day}/${month}/${year}`;
        }
    }

// #endregion

}
