import Program from "../program.js";
import {getRoot} from "../utils.js";
import LocalizationManager from "../localizationmanager.js";
import Subwindow from "../windows/subwindow.js";
import WindowManager from "../windows/windowmanager.js";

export default class Acrobat extends Program {
    static #info = null;

    constructor(processId, instanceData) {
        super(processId, instanceData);

        this.container = null;
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.0;
        this.canvas = null;
        this.ctx = null;
        this.url = `${getRoot()}assets/pdf/${this.instanceData.metadata ? this.instanceData.metadata.pdf : "Acrobat"}.pdf`;

        this.functionMap = {
            showInfo : () => this.#showAboutInfo(),
        };
    }

    async #showAboutInfo() {
            if(!Acrobat.#info) {
                Acrobat.#info = WindowManager.getInstance().createWindow(Subwindow, this, 650, 350, 650, 350, 
                    {name: LocalizationManager.getInstance().getStringsFromId("acrobat").buttons.help.options[0].text, contentRoute: `${getRoot()}html/programs/acrobat/about.html`});
                Acrobat.#info = await Acrobat.#info;
                this.changeLang();
            }
        }

    changeLang() {
        const navDiv = document.getElementById(this.instanceID).querySelector("#acrobat");
        navDiv.querySelector("#page").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["page"];
        navDiv.querySelector("#of").innerText = LocalizationManager.getInstance().getStringsFromId(this.id)["texts"]["interface"]["of"];
        this.updateZoomUI();

        if(Acrobat.#info) {
            Acrobat.#info.changeWindowName(LocalizationManager.getInstance().getStringsFromId("acrobat").buttons.help.options[0].text);
            Acrobat.#info.win.querySelector("#acrobat-texts").innerHTML = `
                <p>${LocalizationManager.getInstance().getStringsFromId("acrobat").buttons.help.options[0].adobe}</p>
                <p>${LocalizationManager.getInstance().getStringsFromId("acrobat").buttons.help.options[0].expl}</p>
                <p>${LocalizationManager.getInstance().getStringsFromId("acrobat").buttons.help.options[0].aff}</p>
                <hr>
                <small><b>Myriad</b> - <a href="https://fonts.adobe.com/fonts/myriad" target="_blank">https://fonts.adobe.com/fonts/myriad</a></small>
            `;
        }
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
                this.switchLayout("none");
            });
            this.bookmarks.addEventListener("click", () => {
                acrbt.querySelector("#view-group .button-selected").classList.remove("button-selected");
                this.bookmarks.classList.add("button-selected");
                this.switchLayout("bookmarks");
            });
            this.thumbnails.addEventListener("click", () => {
                acrbt.querySelector("#view-group .button-selected").classList.remove("button-selected");
                this.thumbnails.classList.add("button-selected");
                this.switchLayout("thumbnails");
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
                console.log(container);
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
            this.changeLang();
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
        layerDiv.style.left = `${this.canvas.offsetLeft}px`;
        layerDiv.style.top = `${this.canvas.offsetTop}px`;
        layerDiv.style.width = `${viewport.width}px`;
        layerDiv.style.height = `${viewport.height}px`;
        layerDiv.style.border = this.canvas.style.border;

        canvasContainer.appendChild(layerDiv);

        page.getAnnotations().then(annotations => {
            annotations.forEach(annotation => {
                if (annotation.subtype === 'Link') {
                    const link = document.createElement('a');
                
                    link.className = "annotation-link";
                    
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
                this.manageControlButtons();
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

    switchLayout(mode) {
        const win = document.getElementById(this.instanceID);
        const sidebar = win.querySelector("#sidebar");

        sidebar.innerHTML = "";

        if(mode === "none") {
            sidebar.style.display = "none";
        }
        else {
            sidebar.style.display = "block";
            sidebar.style.padding = "5px";
            if(mode === "bookmarks") this.renderBookmarks(sidebar);
            else if(mode === "thumbnails") this.renderThumbnails(sidebar);
        }
    }

    async renderBookmarks(sidebar) {
        sidebar.style.background = "#e0e0e0";

        const outline = await this.pdfDoc.getOutline();

        if(!outline || outline.length === 0) {
            sidebar.innerText = this.interfaceTexts["bookmarks"];
            return;
        }

        const createList = (items) => {
            const ul = document.createElement("ul");
            ul.className = "bookmark-list";

            items.forEach(item => {
                const li = document.createElement("li");
                li.className = "bookmark-element";

                const icon = document.createElement("img");
                icon.src = `${getRoot()}assets/icons/programs/acrobat/page.png`;

                const text = document.createElement("span");
                text.innerText = item.title;

                li.appendChild(icon);
                li.appendChild(text);

                li.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if(item.dest) this.goToDestination(item.dest);
                    else if(item.url) window.open(item.url, '_blank');

                    sidebar.querySelectorAll("span").forEach(s => s.style.fontWeight = "normal");
                    text.style.fontWeight = "bold";
                });

                ul.appendChild(li);

                if(item.items && item.items.length > 0) {
                    ul.appendChild(createList(item.items));
                }
            });
            return ul;
        };

        sidebar.appendChild(createList(outline))
    }

    async renderThumbnails(sidebar) {
        sidebar.style.background = "transparent";

        sidebar.style.display = "flex";
        sidebar.style.flexDirection = "column";
        sidebar.style.alignItems = "center";
        sidebar.style.gap = "10px";

        const numPages = this.pdfDoc.numPages;

        for(let i = 1; i <= numPages; i++) {
            const thumbDiv = document.createElement("div");
            thumbDiv.className = "thumbnail";

            const canvas = document.createElement("canvas");
            canvas.style.border = "1px solid black";
            canvas.style.background = "white";

            const label = document.createElement("div");
            label.innerText = i;
            label.className = "thumbnail-label";

            thumbDiv.appendChild(canvas);
            thumbDiv.appendChild(label);
            sidebar.appendChild(thumbDiv);

            thumbDiv.addEventListener("click", () => {
                this.pageNum = i;
                this.manageControlButtons();
                this.queueRenderPage(this.pageNum);
                
                sidebar.querySelectorAll(".thumbnail-active").forEach(th => th.classList.remove("thumbnail-active"));
                sidebar.querySelectorAll(".thumbnail-canvas-active").forEach(th => th.classList.remove("thumbnail-canvas-active"));
                canvas.classList.add("thumbnail-canvas-active");
                label.classList.add("thumbnail-active");
            });

            this.pdfDoc.getPage(i).then(page => {
                const viewport = page.getViewport({scale: 0.15});
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const ctx = canvas.getContext("2d");
                page.render({
                    canvasContext: ctx,
                    viewport: viewport
                });
            });
        }
    }

    manageControlButtons() {
        if(this.pageNum === 1) {
            this.next.disabled = false;
            this.last.disabled = false;
            this.first.disabled = true;
            this.prev.disabled = true;
        }
        else if(this.pageNum === this.pdfDoc.numPages) {
            this.next.disabled = true;
            this.last.disabled = true;
            this.first.disabled = false;
            this.prev.disabled = false;
        }
        else {
            this.next.disabled = false;
            this.last.disabled = false;
            this.first.disabled = false;
            this.prev.disabled = false;
        }
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
        this.manageControlButtons();
        this.queueRenderPage(this.pageNum);
    }

    goToLastPage() {
        this.pageNum = this.pdfDoc.numPages;
        this.manageControlButtons();
        this.queueRenderPage(this.pageNum);
    }

    onPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.manageControlButtons();
        this.queueRenderPage(this.pageNum);
    }

    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.manageControlButtons();
        this.queueRenderPage(this.pageNum);
    }

    setFile(url) {
        this.url = url;
        if (this.pdfDoc) {
            this.loadDocument();
        }
    }

    async onClose() {
        this.closeSubwindow(Acrobat.#info);
    }

    async getBodyHTML() {
        const response = await fetch(`${getRoot()}html/programs/acrobat/acrobat.html`);
        return await response.text();
    }

    closeSubwindow(sw) {
        if(sw !== null) {
            if(sw === Acrobat.#info) Acrobat.#info = null;
            WindowManager.getInstance().remove(sw.id);
        }
    }
}