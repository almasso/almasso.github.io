import { getRoot } from "./utils.js";

export default class LocalizationManager extends EventTarget {
    static #Instance = null;
    #strings = null;
    #locale = null;

    constructor() {
        super();
        this.#getLocaleFromNavigator();
    }

// #region Singleton instance
    static initInstance() {
        if(!LocalizationManager.#Instance) LocalizationManager.#Instance = new LocalizationManager();
        return;
    }

    static getInstance() {
        if(!LocalizationManager.#Instance) LocalizationManager.initInstance();
        return LocalizationManager.#Instance;
    }
// #endregion

    /**
     * Checks if the locale is valid and returns the internal locale used on this website
     * @param {String} code 
     * @returns Internal locale
     */
    #checkForCustomLocale(code) {
        if(code.includes("es")) return "es_ES";
        else if(code.includes("de")) return "de_DE";
        else return "en_US";
    }

    /**
     * Retrieves locale from user's navigator and generates a custom one
     */
    async #getLocaleFromNavigator() {
        const locale = navigator.language || navigator.userLanguage;
        let webLocale = this.#checkForCustomLocale(locale);
        await this.#setLocalePriv(webLocale);
    }

    /**
     * Sets the custom web locale code
     * @param {String} code Locale code from this.#getLocale()
     */
    async #setLocalePriv(code) {
        this.#locale = code;
        await this.#fetchStrings();
        this.#fireLocaleChanges();
    }

    /**
     * Sets the custom web locale code
     * @param {String} code 
     */
    setLocale(code) {
        this.#checkForCustomLocale(code);
        this.#setLocalePriv(code);
    }

    /**
     * Fetches the lang JSON with all texts in a specific language
     */
    async #fetchStrings() {
        await fetch(`${getRoot()}assets/texts/${this.#locale}.json`).then(response => {
            if(!response.ok) throw new Error("HTTP error at fetching strings: " + response.status);
            return response.json();
        }).then(data => {
            this.#strings = data;
        }).catch(error => {
            console.error("Error fetching strings: ", error);
            throw error;
        });        
    }

    /**
     * Fires the event in case of a locale change
     */
    #fireLocaleChanges() {
        this.dispatchEvent(new CustomEvent("locale:changed", {
            detail: {langcode: this.#locale}
        }));
    }

    /**
     * Subscribes to a locale change event
     * @param {Function} fn Function to execute
     */
    subscribeToLocaleChangeEvent(fn) {
        this.addEventListener("locale:changed", fn);
    }

    get strings() {
        return this.#strings;
    }

    get locale() {
        return this.#locale;
    }

    getStringsFromId(id) {
        return this.#strings.find(e => e.id === id);
    }
}