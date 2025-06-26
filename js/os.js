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
    this.buttons = null;
    this.setCurrentApp(this.apps.get("searcher"));
    this.windows = new Array();
    this.windowID = 0;
  }

  #getLocale() {
    const locale = navigator.language || navigator.userLanguage;
    if(locale === "es-ES") this.locale = "es_ES";
    else if(locale === "de-DE") this.locale = "de_DE";
    else if(locale === "en-GB") this.locale = "en_US";
    else this.locale = "en_US";

    this.#setLocale(this.locale);
  }

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

  #loadPrograms() {
    this.apps = new Map();
    this.apps.set("searcher", new Searcher(this));
    this.apps.set("arkanoid", new Arkanoid(this));
    this.dispatchEvent(new CustomEvent("appsLoaded", {}));
  }

  #focusWindow(id) {
    this.windows.forEach(w => {
      if(w.id != id) w.unfocus();
    });
  }

  openWindow(app) {
    const win = new Window(this, app, this.windowID++);
    win.addEventListener("focusWindow", (e) => this.#focusWindow(e.detail.windowID));
    win.open();
    this.windows.push(win);
  }

  closeWindow(id) {
  }

  setCurrentApp(app) {
    this.currentApp = app;
    const currentAppBut = document.querySelector(".app-button-content");
    currentAppBut.innerHTML = `
      <img src="/assets/icons/programs/${this.currentApp.icon}" />
      <span>${this.currentApp.name}</span>
    `;
    this.addEventListener("langLoaded", () => {
      this.buttons = app.getButtons();
      this.#setButtons();
    });
  }

  #setButtons() {
    const buttons = document.getElementById("buttons");
    let buttonsHtml = "";
    for(const key in this.buttons) {
      buttonsHtml += `
        <div id="${key}-button">
          <button>${this.buttons[key]}</button>
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