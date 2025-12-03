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
            navDiv.querySelector("#page").innerText = this.interfaceTexts["page"];
            navDiv.querySelector("#of").innerText = this.interfaceTexts["of"];
            this.updateZoomUI();
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
            const acrbt = win.querySelector("#acrobat");
            this.ctx = this.canvas.getContext('2d');

            this.pageOnly = acrbt.querySelector("#view-group div:nth-child(1) button");
            this.bookmarks = acrbt.querySelector("#view-group div:nth-child(2) button");
            this.thumbnails = acrbt.querySelector("#view-group div:nth-child(3) button");
            this.zoomIn = acrbt.querySelector("#controls div:nth-child(1) button");
            this.zoomOut = acrbt.querySelector("#controls div:nth-child(2) button");
            this.first = acrbt.querySelector("#page-controls div:nth-child(1) button");
            this.prev = acrbt.querySelector("#page-controls div:nth-child(2) button");
            this.next = acrbt.querySelector("#page-controls div:nth-child(3) button");
            this.last = acrbt.querySelector("#page-controls div:nth-child(4) button");
            this.actualSize = acrbt.querySelector("#zoom-options div:nth-child(1) button");
            this.fitWidth = acrbt.querySelector("#zoom-options div:nth-child(2) button");
            this.fitVisible = acrbt.querySelector("#zoom-options div:nth-child(3) button");

            acrbt.querySelector("#page-footer img").src = `${getRoot()}assets/icons/programs/acrobat/page.png`;
            acrbt.querySelector("#zoom-percentage img").src = `${getRoot()}assets/icons/programs/acrobat/zoom.png`;
            acrbt.querySelector("#document-dimensions img").src = `${getRoot()}assets/icons/programs/acrobat/dims.png`;

            this.pageOnly.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/page-only.png`;
            this.bookmarks.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/bookmarks.png`;
            this.thumbnails.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/thumbnails.png`;
            this.zoomIn.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/zoom-in.png`;
            this.zoomOut.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/zoom-out.png`;
            this.first.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/first.png`;
            this.prev.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/previous.png`;
            this.next.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/next.png`;
            this.last.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/last.png`;
            this.actualSize.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/actual-size.png`;
            this.fitWidth.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/fit-width.png`;
            this.fitVisible.querySelector("img").src = `${getRoot()}assets/icons/programs/acrobat/fit-visible.png`;

            this.pageOnly.addEventListener("click", () => {
                acrbt.querySelector("#view-group .button-selected").classList.remove("button-selected");
                this.pageOnly.classList.add("button-selected");
            });
            this.bookmarks.addEventListener("click", () => {
                acrbt.querySelector("#view-group .button-selected").classList.remove("button-selected");
                this.bookmarks.classList.add("button-selected");
            });
            this.thumbnails.addEventListener("click", () => {
                acrbt.querySelector("#view-group .button-selected").classList.remove("button-selected");
                this.thumbnails.classList.add("button-selected");
            });
            this.zoomIn.addEventListener('click', () => { 
                this.scale += 0.2;
                this.updateZoomUI();
                this.queueRenderPage(this.pageNum);
            });
            this.zoomOut.addEventListener('click', () => { 
                if(this.scale > 0.4) this.scale -= 0.2;
                this.updateZoomUI();
                this.queueRenderPage(this.pageNum);
            });
            this.first.addEventListener("click", () => this.goToFirstPage());
            this.prev.addEventListener('click', () => this.onPrevPage());
            this.next.addEventListener('click', () => this.onNextPage());
            this.last.addEventListener("click", () => this.goToLastPage());
            this.actualSize.addEventListener("click", () => {
                acrbt.querySelector("#zoom-options .button-selected").classList.remove("button-selected");
                this.actualSize.classList.add("button-selected");

                this.scale = 1.0;
                this.updateZoomUI();
                this.queueRenderPage(this.pageNum);
            });
            this.fitWidth.addEventListener("click", async () => {
                acrbt.querySelector("#zoom-options .button-selected").classList.remove("button-selected");
                this.fitWidth.classList.add("button-selected");

                const page = await this.pdfDoc.getPage(this.pageNum);
                const viewport = page.getViewport({ scale: 1.0 });
                const container = this.canvas.parentElement;
                const scaleW = (container.clientWidth - 20) / viewport.width;
                const scaleH = (container.clientHeight - 10) / viewport.height;
                this.scale = Math.min(scaleW, scaleH);
                this.updateZoomUI();
                this.queueRenderPage(this.pageNum);
            });
            this.fitVisible.addEventListener("click", async () => {
                acrbt.querySelector("#zoom-options .button-selected").classList.remove("button-selected");
                this.fitVisible.classList.add("button-selected");

                const page = await this.pdfDoc.getPage(this.pageNum);
                const viewport = page.getViewport({scale: 1.0});
                const container = this.canvas.parentElement;
                const availableWidth = container.clientWidth - 20;
                this.scale = availableWidth / viewport.width;
                this.updateZoomUI();
                this.queueRenderPage(this.pageNum);
            });

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
            this.canvas.style.width = `${viewport.width}px`;
            this.canvas.style.height = `${viewport.height}px`;

            const widthIn = (viewport.width / this.scale) / 72;
            const heightIn = (viewport.height / this.scale) / 72;
            win.querySelector("#document-dimensions span").innerText = `${widthIn.toFixed(2)} x ${heightIn.toFixed(2)} in`

            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);

            this.setupAnnotations(page, viewport);

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

    setupAnnotations(page, viewport) {
        const canvasContainer = this.canvas.parentElement;
        
        const oldLayer = canvasContainer.querySelector(".annotation-layer");
        if(oldLayer) oldLayer.remove();

        const layerDiv = document.createElement("div");
        layerDiv.className = "annotation-layer";
        layerDiv.style.position = "absolute";
        layerDiv.style.left = `${this.canvas.offsetLeft}px`;
        layerDiv.style.top = `${this.canvas.offsetTop}px`;
        layerDiv.style.width = `${viewport.width}px`;
        layerDiv.style.height = `${viewport.height}px`;
        layerDiv.style.pointerEvents = "none";
        layerDiv.style.border = this.canvas.style.border;

        canvasContainer.appendChild(layerDiv);

        page.getAnnotations().then(annotations => {
            annotations.forEach(annotation => {
                if (annotation.subtype === 'Link') {
                    const link = document.createElement('a');
                
                    link.style.position = 'absolute';
                    link.style.cursor = 'pointer';
                    link.style.pointerEvents = 'auto';
                    
                    const rect = viewport.convertToViewportRectangle(annotation.rect);
                    
                    const x = Math.min(rect[0], rect[2]);
                    const y = Math.min(rect[1], rect[3]);
                    const width = Math.abs(rect[0] - rect[2]);
                    const height = Math.abs(rect[1] - rect[3]);

                    link.style.left = `${x}px`;
                    link.style.top = `${y}px`;
                    link.style.width = `${width}px`;
                    link.style.height = `${height}px`;

                    if(annotation.url) {
                        link.href = annotation.url;
                        link.target = "_blank";
                    } else if(annotation.dest) {
                        link.href = "#";
                        link.addEventListener("click", (e) => {
                            e.preventDefault();
                            this.goToDestination(annotation.dest);
                        });
                    }

                    if(annotation.url || annotation.dest) layerDiv.appendChild(link);
                }
            });
        });
    }

    async goToDestination(dest) {
        try {
            let destinationArray = dest;
            
            if(typeof dest === 'string') {
                destinationArray = await this.pdfDoc.getDestination(dest);
            }

            const pageRef = destinationArray[0];
            const pageIndex = await this.pdfDoc.getPageIndex(pageRef);
            const pageNum = pageIndex + 1;
            
            if(pageNum > 0 && pageNum <= this.pdfDoc.numPages) {
                this.pageNum = pageNum;
                this.queueRenderPage(pageNum);
            }
        } catch {
            console.error("Error at going to internal destination: ", error);
        }
    }

    updateZoomUI() {
        const win = document.getElementById(this.instanceID);
        if(!win) return;

        const percentage = Math.round(this.scale * 100);
        win.querySelector("#acrobat #zoom-percentage span").innerText = `${percentage}%`;
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    goToFirstPage() {
        this.pageNum = 1;
        this.next.disabled = false;
        this.last.disabled = false;
        this.first.disabled = true;
        this.prev.disabled = true;
        this.queueRenderPage(this.pageNum);
    }

    goToLastPage() {
        this.pageNum = this.pdfDoc.numPages;
        this.next.disabled = true;
        this.last.disabled = true;
        this.first.disabled = false;
        this.prev.disabled = false;
        this.queueRenderPage(this.pageNum);
    }

    onPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.next.disabled = false;
        this.last.disabled = false;
        if (this.pageNum <= 1) {
            this.first.disabled = true;
            this.prev.disabled = true;
        }
        this.queueRenderPage(this.pageNum);
    }

    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.first.disabled = false;
        this.prev.disabled = false;
        if(this.pageNum >= this.pdfDoc.numPages) {
            this.next.disabled = true;
            this.last.disabled = true;
        }
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