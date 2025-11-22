import Program from "../program.js";
import {getRoot} from "../utils.js";

export default class Acrobat extends Program {
    static icon = "acrobat.png";
    static id = "acrobat";
    static name = "Acrobat Reader";
    static unique = false;
    static width = 960;
    static height = 720;
    static appClass = "program";

    constructor(os) {
        super(os, Acrobat.name, Acrobat.id, Acrobat.icon, "desktop");

        this.container = null;
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.0;
        this.canvas = null;
        this.ctx = null;
        this.url = `${getRoot()}assets/pdf/TFG.pdf`;

        this.addEventListener("localeSet", (e) => {
            this.setLanguage(os.locale);
            this.getProgramData();
        });

        this.addEventListener("langChanged", () => {
            const navDiv = document.getElementById(this.instanceID).querySelector("#acrobat");
        });
    }

    async getProgramData() {
        await this.langReady();
        const programData = this.searchForProgramInData();
        if(programData) {
            this.strings = programData["texts"]["buttons"];
            this.interfaceTexts = programData["texts"]["interface"];
        } else {
            console.warn("No data found for program", this.id);
            this.strings = {};
        }
        this.os.dispatchEvent(new CustomEvent("langLoaded", {}));
        this.dispatchEvent(new CustomEvent("langChanged", {}));
    }

    gainedFocus() {
        if (this.canvas) return;

        requestAnimationFrame(() => {
            const win = document.getElementById(this.instanceID);
            if (!win) return;

            this.canvas = win.querySelector('#pdf-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            win.querySelector('#prev').addEventListener('click', () => this.onPrevPage());
            win.querySelector('#next').addEventListener('click', () => this.onNextPage());
            win.querySelector('#zoom_in').addEventListener('click', () => { this.scale += 0.2; this.queueRenderPage(this.pageNum); });
            win.querySelector('#zoom_out').addEventListener('click', () => { if(this.scale > 0.4) this.scale -= 0.2; this.queueRenderPage(this.pageNum); });

            if (typeof pdfjsLib === 'undefined') {
                this.loadPDFLibrary();
            } else {
                this.loadDocument();
            }
        });
    }

    loadPDFLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            this.loadDocument();
        };
        script.onerror = () => {
            console.error("Error at loading PDF.js")
        };
        document.head.appendChild(script);
    }

    loadDocument() {
        pdfjsLib.getDocument(this.url).promise.then((pdfDoc_) => {
            this.pdfDoc = pdfDoc_;
            
            const win = document.getElementById(this.instanceID);
            if(win) win.querySelector('#page_count').textContent = this.pdfDoc.numPages;

            this.renderPage(this.pageNum);
        }).catch(err => {
            console.error("Error cargando PDF:", err);
        });
    }

    renderPage(num) {
        this.pageRendering = true;
        
        this.pdfDoc.getPage(num).then((page) => {
            const viewport = page.getViewport({scale: this.scale});
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;

            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                this.pageRendering = false;
                
                if (this.pageNumPending !== null) {
                    this.renderPage(this.pageNumPending);
                    this.pageNumPending = null;
                }
            });
        });

        const win = document.getElementById(this.instanceID);
        if(win) win.querySelector('#page_num').textContent = num;
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    onPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }

    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }

    setFile(url) {
        this.url = url;
        if (this.pdfDoc) {
            this.loadDocument();
        }
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/acrobat.html`);
        return await response.text();
    }

    static getIcons() {
        return [{route : "desktop", isAlias : false}];
    }

    getButtons() {
        return this.strings;
    }
}