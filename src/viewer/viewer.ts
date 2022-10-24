import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import { $, debounce } from "./utils"

GlobalWorkerOptions.workerPort = new Worker(
    new URL("/node_modules/pdfjs-dist/build/pdf.worker.js", import.meta.url),
    {type: "module"}
)

const pagesContainer = $("#pages-container")
async function initPageContainers(pdf: PDFDocumentProxy): Promise<HTMLElement[]> {
    let pages: HTMLElement[] = []
    for (let i = 1; i <= pdf.numPages; ++i) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({scale: 1})

        const div = document.createElement("div")
        div.id = `page-container-${i}`
        div.style.width = `${Math.floor(viewport.width)}px`
        div.style.height = `${Math.floor(viewport.height)}px`

        pagesContainer.appendChild(div)
        pages.push(div)
    }
    return pages
}

async function loadVisiblePages(pdf: PDFDocumentProxy,
                                pages: HTMLElement[],
                                pagesLoaded: Set<number>): Promise<Set<number>> {
    // Binary search for first page to load
    let left = 0
    let right = pages.length - 1

    while (left != right) {
        const idx = Math.floor((left + right) / 2)
        const bottom = pages[idx].getBoundingClientRect().bottom
        if (bottom < 0) {
            left = idx + 1
        } else {
            right = idx
        }
    }

    // Linear search for last page to load
    const newPagesLoaded: Set<number> = new Set()
    do {
        newPagesLoaded.add(left)
    } while (++left < pages.length && pages[left].getBoundingClientRect().top <= window.innerHeight)

    // Loop through unloaded pages
    for (const pageIdx of newPagesLoaded) {
        if (!pagesLoaded.has(pageIdx)) {
            const page = await pdf.getPage(pageIdx + 1)
            const viewport = page.getViewport({scale: 1})

            const canvas = document.createElement("canvas")
            canvas.width = Math.floor(viewport.width)
            canvas.height = Math.floor(viewport.height)

            const div = pages[pageIdx]
            canvas.style.width = div.style.width
            canvas.style.height = div.style.height

            page.render({
                canvasContext: canvas.getContext("2d")!,
                viewport: viewport
            })

            div.appendChild(canvas)
        }
    }

    // Unload unneeded pages
    for (const pageIdx of pagesLoaded) {
        if (!newPagesLoaded.has(pageIdx)) {
            pages[pageIdx].replaceChildren()
        }
    }

    return newPagesLoaded
}

// Handle invalid URLs and allow entering a new one
function showUrlError(message: string) {
    $("#url-error-message").innerText = message
    $("#url-error-container").style.display = "block"

    $("#url-error-input-submit").onclick = () => {
        const newUrlInput = $<HTMLInputElement>("input#url-error-input")
        document.location = `${document.location.origin}${document.location.pathname}?url=${newUrlInput.value}`
    }
}

async function main() {
    // Get URL
    const urlParam = (new URL(document.location.href)).searchParams.get("url")

    if (urlParam == null) {
        return showUrlError("No PDF provided")
    }

    // Load PDF
    const pdf = await getDocument(unescape(urlParam)).promise
    const pages = await initPageContainers(pdf)
    let pagesLoaded = await loadVisiblePages(pdf, pages, new Set())
    window.addEventListener("scroll", debounce(async () => {
        pagesLoaded = await loadVisiblePages(pdf, pages, pagesLoaded)
    }, 100))
}

main()
