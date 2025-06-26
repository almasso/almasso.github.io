import Window from "./window.js"
import Arkanoid from "./programs/arkanoid.js";
import Searcher from "./programs/searcher.js";

/* LOADING OS */
document.addEventListener("DOMContentLoaded", () => {
  
  var os = new OS();

  /* TIME */
  setInterval(updateTime, 1000);
  updateTime();

});

export default class OS extends EventTarget {
  constructor() {
    super();
    this.#getLocale();
    this.#loadPrograms();
    this.currentApp = null;
    this.setCurrentApp(this.apps.get("searcher"));
    this.windows = new Array();
    this.windowID = 0;

    this.addEventListener("focusChanged", () => {
      this.#setButtons();
    });

    this.addEventListener("langLoaded", () => {
      this.#setButtons();
    });

    this.addEventListener("focusWindow", (e) => {
      this.setCurrentApp(e.detail.app);
      this.#focusWindow(e.detail.windowID);
    });
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
      <button id="lang-button"><img src="/assets/icons/system/flags/${this.locale}.png" /></button>
      <div id="lang-selector" class="dropdown hidden">
        <div class="dropdown-option" data-key="de_DE"><img src="/assets/icons/system/flags/de_DE.png" /></div>
        <div class="dropdown-option" data-key="en_US"><img src="/assets/icons/system/flags/en_US.png" /></div>
        <div class="dropdown-option" data-key="es_ES"><img src="/assets/icons/system/flags/es_ES.png" /></div>
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

    if(this.apps != null) {
      this.apps.forEach(app => {
        app.dispatchEvent(new CustomEvent("localeSet", {
          detail: {langcode : this.locale}
      }))});
    }
    else this.addEventListener("appsLoaded", () => {
      this.apps.forEach(app => {
        app.dispatchEvent(new CustomEvent("localeSet", {
          detail: {langcode : this.locale}
      }))});
    })
  }

  /**
   * Loads all programs
   */
  #loadPrograms() {
    this.apps = new Map();
    this.apps.set("searcher", new Searcher(this));
    this.apps.set("arkanoid", new Arkanoid(this));
    this.dispatchEvent(new CustomEvent("appsLoaded", {}));
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

  /**
   * Opens an instance of a program (window)
   * @param {string} app Program identifier
   */
  openWindow(app) {
    const win = new Window(this, app, this.windowID++);
    win.open();
    this.windows.push(win);
  }

  /**
   * Closes a certain window or instance of a program
   * @param {number} id 
   */
  closeWindow(id) {
  }

  /**
   * Sets current app on the topbar
   * @param {string} app 
   */
  setCurrentApp(app) {
    this.currentApp = app;
    const currentAppBut = document.querySelector(".app-button-content");
    currentAppBut.innerHTML = `
      <img src="/assets/icons/programs/${this.currentApp.icon}" />
      <span>${this.currentApp.name}</span>
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
}

/* TIME FUNCTIONS */
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('time-text').textContent = `${hours}:${minutes}`;
}