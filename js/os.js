import Window from "./window.js"
import Arkanoid from "./programs/arkanoid.js";
import Searcher from "./programs/searcher.js";
import Terminal from "./programs/terminal.js";
import Navigator from "./programs/navigator.js";
import Icon from "./icon.js";
import {getRoot, shuffle} from "./utils.js"

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


    this.currentApp = null;
    this.windows = new Array();
    this.windowID = 0;
    this.showTime = true;
    this.currentAppResumed = false;

    this.addEventListener("focusChanged", () => this.#setButtons());

    this.addEventListener("langLoaded", () => this.#setButtons());

    this.addEventListener("focusWindow", (e) => {
      this.setCurrentApp(e.detail.app);
      e.detail.app.gainedFocus();
      this.#focusWindow(e.detail.windowID);
    });

    this.addEventListener("unfocusWindow", (e) => e.detail.app.lostFocus());

    this.addEventListener("closeWindow", (e) => {
      this.setCurrentApp(this.appInstances.get(0));
      this.#setButtons();
      this.closeWindow(e.detail.windowId);
    });

    document.getElementById("topbar-slider").addEventListener("click", () => {
        this.currentAppResumed = !this.currentAppResumed;
        this.setCurrentApp(this.currentApp);
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
  #setLocale(code) {
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
  }

  /**
   * Loads all programs
   */
  async #loadPrograms() {
    this.appRegistered.set(Searcher.id, Searcher);
    this.appRegistered.set(Arkanoid.id, Arkanoid);
    this.appRegistered.set(Terminal.id, Terminal);
    this.appRegistered.set(Navigator.id, Navigator);
    let instance = new Searcher(this);
    await instance.ready();
    this.appInstances.set(0, instance);
  
    this.dispatchEvent(new CustomEvent("appsLoaded", {}));
  }

  #loadIcons() {
    this.appRegistered.forEach((val, key) => {
      let locs = val.getIcons();
      locs.forEach(loc => {
        new Icon(this, val, loc.isAlias, loc.route);
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

  /**
   * Opens an instance of a program (window)
   * @param {string} app Program identifier
   */
  async openWindow(app) {
    let searchedInstance = [...this.appInstances.values()].find(
      a => a instanceof app
    );

    if(app.unique && searchedInstance) {
      this.focusWindow(searchedInstance);
    }
    else {
      let instance = new app(this);
      await instance.ready();
      this.appInstances.set(instance.instanceID, instance);
      this.dispatchEvent(new CustomEvent("appsLoaded", {}));

      const win = new Window(this, instance, this.windowID++, app.width, app.height, app.width, app.height);
      await win.open();
      this.windows.push(win);
    }
  }

  /**
   * Closes a certain window and instance of a program
   * @param {number} id 
   */
  closeWindow(id) {
    this.appInstances.delete(this.windows.find(w => w.id === id).program.instanceID);
    this.windows = this.windows.filter(win => win.id !== id);
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

//TODO:
// Que las aplicaciones puedan mostrar contenido
// Que los botones de la topbar funcionen
// Fijar el botón de mac, file y edit para que sean intocables y como mucho desactivables