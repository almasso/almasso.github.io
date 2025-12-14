import Window from "./windows/window.js"
import SteamWindow from "./windows/steamwindow.js";
import Subwindow from "./windows/subwindow.js";
import SteamSubwindow from "./windows/steamsubwindow.js";
import Arkanoid from "./programs/arkanoid.js";
import Asteroids from "./programs/asteroids.js";
import Galactic from "./programs/galactic.js";
import Searcher from "./programs/searcher.js";
import Terminal from "./programs/terminal.js";
import Navigator from "./programs/navigator.js";
import Acrobat from "./programs/acrobat.js";
import Steam from "./programs/steam.js";
import ERPG from "./programs/erpg.js";
import Icon from "./icon.js";
import {clamp, getRoot, shuffle} from "./utils.js";

const debugVar = false;

/* LOADING OS */
document.addEventListener("DOMContentLoaded", () => {
  
  var os = new OS();
  os.init();

});

export default class OS extends EventTarget {
  constructor() {
    super();

    if(!debugVar) {
      this.barWidth = 0;
      this.#loadExtensions();
      this.#waitUntilUserClicks();
    }
    else {
      this.#afterLoad();
    }

    this.appInstances = new Map();
    this.appRegistered = new Map();
    this.icons = new Array();

    this.currentApp = null;
    this.windows = new Array();
    this.windowID = 0;
    this.showTime = true;
    this.currentAppResumed = false;

    this.addEventListener("focusChanged", () => this.#setButtons());

    this.addEventListener("langLoaded", () => this.#setButtons());

    this.addEventListener("localeSet", () => this.#setOSLangStrings());

    this.addEventListener("focusWindow", (e) => {
      this.setCurrentApp(e.detail.app);
      e.detail.app.gainedFocus();
      this.#focusWindow(e.detail.windowId);
      this.deselectIcons(e.detail.app);
      this.#selectIcon(e.detail.app);
    });

    this.addEventListener("unfocusWindow", (e) => e.detail.app.lostFocus());

    this.addEventListener("closeWindow", (e) => {
      this.setCurrentApp(this.appInstances.get(0));
      this.#setButtons();
      this.closeWindow(e.detail.windowId);
    });

    this.addEventListener("closeSubwindow", (e) => {
      this.setCurrentApp(this.appInstances.get(0));
      this.#setButtons();
      this.closeSubwindow(e.detail.windowId);
    });

    this.addEventListener("iconSelected", (e) => {
      this.deselectIcons(e.detail.program);
    });

    document.getElementById("topbar-slider").addEventListener("click", () => {
      this.currentAppResumed = !this.currentAppResumed;
      this.setCurrentApp(this.currentApp);
    });

    document.getElementById("desktop").addEventListener("click", (e) => {
      if(e.target === e.currentTarget) {
        this.setCurrentApp(this.appInstances.get(0));
        this.#unfocusWindows();
        this.#deselectIcons();
      }
    });

    setInterval(this.updateTime.bind(this), 100);
    this.updateTime();

    const timeDiv = document.getElementById("time-div");
    timeDiv.addEventListener("click", () => {
      this.showTime = !this.showTime;
    })
  }

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
            document.getElementById("loading-text").textContent = this.locale === "es_ES" ? 
            "Bienvenid@ a almasso OS" : this.locale === "de_DE" ? "Willkommen in almasso OS" : "Welcome to almasso OS";
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
     })
  }

  #loadAnim() {
    let bootupScreen = document.getElementById("bootup-screen");
    bootupScreen.style.backgroundColor = "black";
    bootupScreen.style.transition = "none";
    bootupScreen.style.backgroundImage = `url('${getRoot()}assets/bgs/defbg.png')`;
    bootupScreen.style.backgroundSize = "cover";
    document.getElementById("loading-text").textContent = this.locale === "es_ES" ? 
    "Arrancando..." : this.locale === "de_DE" ? "Hochfahren Gerade..." : "Starting Up...";
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

  async init() {
    this.#initControlStrip();
    this.#getLocale();
    await this.#loadPrograms();
    this.#loadIcons();
    this.setCurrentApp(this.appInstances.get(0));
  }

  /**
   * Returns default locale from user's browser
   */
  #getLocale() {
    const locale = navigator.language || navigator.userLanguage;
    if(locale === "es-ES") this.locale = "es_ES";
    else if(locale === "de-DE") this.locale = "de_DE";
    else if(locale === "en-GB") this.locale = "en_US";
    else this.locale = "en_US";

    this.#setLocale(this.locale);
  }

  /**
   * Sets a certain locale
   * @param {string} code Locale code (de_DE, en_US, es_ES)
   */
  async #setLocale(code) {
    this.locale = code;
    document.getElementById("lang-flag").innerHTML = `
      <button id="lang-button"><img src="assets/icons/system/flags/${this.locale}.png" /></button>
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
        this.#setLocale(key);
        menu.classList.add('hidden');
      });
    });

    document.addEventListener("click", (e) => {
      if(!but.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });

    if(this.appInstances != null) {
      this.appInstances.forEach(app => {
        app.dispatchEvent(new CustomEvent("localeSet", {
          detail: {langcode : this.locale}
      }))});
    }
    
    this.addEventListener("appsLoaded", () => {
      this.appInstances.forEach(app => {
        app.dispatchEvent(new CustomEvent("localeSet", {
          detail: {langcode : this.locale}
      }))});
    });

    await fetch(`${getRoot()}assets/texts/${this.locale}.json`).then(response => {
      if(!response.ok) throw new Error("HTTP error" + response.status);
      return response.json();
    }).then(data => {
      this.osStrings = data?.find(e => e.id === "os") || null;
    }).catch(error => {
      console.error("Error fetching strings: ", error);
      throw error;
    });

    this.dispatchEvent(new CustomEvent("localeSet", {}));
  }

  #setOSLangStrings() {
    let mcm = document.getElementById("monitor-color-menu");
    mcm.querySelector("button:nth-child(1)").innerHTML = `${this.osStrings["controlStrip"]["colors"]["256-g"]}`;
    mcm.querySelector("button:nth-child(2)").innerHTML = `${this.osStrings["controlStrip"]["colors"]["normal"]}`;
  }

  /**
   * Loads all programs
   */
  async #loadPrograms() {
    this.appRegistered.set(Searcher.id, Searcher);
    this.appRegistered.set(Terminal.id, Terminal);
    this.appRegistered.set(Navigator.id, Navigator);
    this.appRegistered.set(Acrobat.id, Acrobat);
    this.appRegistered.set(Steam.id, Steam);
    this.appRegistered.set(Arkanoid.id, Arkanoid);
    this.appRegistered.set(Asteroids.id, Asteroids);
    this.appRegistered.set(Galactic.id, Galactic);
    this.appRegistered.set(ERPG.id, ERPG);
    let instance = new Searcher(this);
    await instance.ready();
    this.appInstances.set(0, instance);
  
    this.dispatchEvent(new CustomEvent("appsLoaded", {}));
  }

  #loadIcons() {
    this.appRegistered.forEach((val, key) => {
      let locs = val.getIcons();
      locs.forEach(loc => {
        this.icons.push(new Icon(this, val, loc.isAlias, loc.route));
      });
    });
  }

  /**
   * Sets a window in front
   * @param {number} id Window ID to set in front
   */
  #focusWindow(id) {
    this.windows.forEach(w => {
      if(w.id != id) w.unfocus();
    });
    this.dispatchEvent(new CustomEvent("focusChanged", {}));
  }

  focusWindow(app) {
    this.windows.forEach(w => {
      if(w.program === app) w.focus();
    });
  }

  #unfocusWindows() {
    this.windows.forEach(w => {
      w.unfocus();
    });
    this.dispatchEvent(new CustomEvent("focusChanged", {}));
  }

  #deselectIcons() {
    this.icons.forEach(ic => {
      ic.dispatchEvent(new CustomEvent("unclicked", {}));
    });
  }

  #selectIcon(iconProgram) {
    this.icons.forEach(ic => {
      if(ic.program === iconProgram) ic.dispatchEvent(new CustomEvent("selected", {}));
    });
  }

  deselectIcons(iconProgram) {
    this.icons.forEach(ic => {
      if(ic.program != iconProgram) ic.dispatchEvent(new CustomEvent("unclicked", {}));
    });
  }

  /**
   * Opens an instance of a program (window)
   * @param {string} app Program identifier
   */
  async openWindow(app, userCalled = true) {
    let searchedInstance = [...this.appInstances.values()].find(
      a => a instanceof app
    );

    if(app.unique && searchedInstance) {
      this.focusWindow(searchedInstance);
    }
    else {
      if(app.appClass === "game" && userCalled) {
        let steamInstance = new Steam(this, Steam.name, true);
        await steamInstance.ready();
        this.appInstances.set(steamInstance.instanceID, steamInstance);
        this.dispatchEvent(new CustomEvent("appsLoaded", {}));
        
        steamInstance.initGame(app);

        this.appInstances.delete(steamInstance.instanceID);
        steamInstance = null;
      }
      else if(app.appClass === "webgame" && userCalled) {
        let steamInstance = new Steam(this);
        await steamInstance.ready();
        this.appInstances.set(steamInstance.instanceID, steamInstance);
        this.dispatchEvent(new CustomEvent("appsLoaded", {}));
        
        steamInstance.initWebgame(app);

        this.appInstances.delete(steamInstance.instanceID);
        steamInstance = null;
      }
      else {
        let instance = new app(this);
        await instance.ready();
        this.appInstances.set(instance.instanceID, instance);

        const win = app.id === Steam.id ? new SteamWindow(this, instance, this.windowID++, app.width, app.height, app.width, app.height) : 
          new Window(this, instance, this.windowID++, app.width, app.height, app.width, app.height);
        await win.open();
        this.dispatchEvent(new CustomEvent("appsLoaded", {}));
        this.windows.push(win);
        return win;
      }
    }
  }

  /**
   * Allows an instance of a program to open another window associated with the program
   * @param {*} appInstance Program instance
   * @param {*} winID Window identifier given by the program
   */
  async openSubwindow(appInstance, name, contentRoute, width, height, maxWidth, maxHeight) {
    const win = appInstance.id === Steam.id ? new SteamSubwindow(this, appInstance, this.windowID++, name, contentRoute, width, height, maxWidth, maxHeight) :
      new Subwindow(this, appInstance, this.windowID++, name, width, height, maxWidth, maxHeight);
    await win.open();
    this.windows.push(win);
    return win;
  }

  closeSubwindow(id) {
    this.windows = this.windows.filter(win => win.id !== id);
  }

  /**
   * Closes a certain window and instance of a program
   * @param {number} id 
   */
  closeWindow(id) {
    this.appInstances.delete(this.windows.find(w => w.id === id).program.instanceID);
    this.windows = this.windows.filter(win => win.id !== id);

    this.icons.forEach(ic => {
      if(this.windows.filter(win => win.program instanceof ic.program).length === 0) ic.dispatchEvent(new CustomEvent("programClosed", {}));
    });
  }

  /**
   * Sets current app on the topbar
   * @param {string} app 
   */
  setCurrentApp(app) {
    this.currentApp = app;
    const currentAppBut = document.querySelector(".app-button-content");
    currentAppBut.innerHTML = `
      <img src="assets/icons/programs/${this.currentApp.icon}" />
      ${this.currentAppResumed ? ``: `<span>${this.currentApp.name}</span>`}
    `;
  }

  /**
   * Sets function buttons like on MacOS
   */
  #setButtons() {
    const buttons = document.getElementById("buttons");
    let buttonsHtml = "";
    for(const key in this.currentApp.getButtons()) {
      buttonsHtml += `
        <div id="${key}-button">
          <button>${this.currentApp.getButtons()[key]}</button>
        </div>
      `;
    }

    buttons.innerHTML = `
      <div id="mac-icon">
        <button><img src="assets/icons/system/macs/happy.png" /></button>
      </div>
      ${buttonsHtml}
    `;
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
    })
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
      if (didDrag) { didDrag = false; return; }
      
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
}