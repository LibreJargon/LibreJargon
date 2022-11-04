import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import { $, debounce, calculateFontAscent } from "./utils"

import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist"
import type { TextItem } from "pdfjs-dist/types/src/display/api"

GlobalWorkerOptions.workerPort = new Worker(
    new URL("/node_modules/pdfjs-dist/build/pdf.worker.js", import.meta.url),
    {type: "module"}
)

const pagesContainer = $("#pages-container")
const textContainer = $("#text-container")
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

        const textDiv = document.createElement("div")
        textContainer.appendChild(textDiv)
        loadTextContainer(page, textDiv)
    }
    return pages
}

async function loadTextContainer(page: PDFPageProxy, container: HTMLElement) {
    const text = await page.getTextContent()

    for (const item of <TextItem[]>text.items) {
        const span = document.createElement("div")
        span.innerText = item.str
        container.appendChild(span)
    }
}

async function loadVisiblePages(pdf: PDFDocumentProxy,
                                pages: HTMLElement[],
                                pagesLoaded: Map<number, boolean>) {
    // Binary search for first page to load
    let left = 0
    let right = pages.length - 1

    while (left != right) {
        const idx = Math.floor((left + right) / 2)
        const bottom = pages[idx].getBoundingClientRect().bottom + window.innerHeight
        if (bottom < 0) {
            left = idx + 1
        } else {
            right = idx
        }
    }

    // Linear search for last page to load
    const pagesToLoad: Set<number> = new Set()
    do {
        pagesToLoad.add(left)
    } while (++left < pages.length && pages[left].getBoundingClientRect().top <= 2 * window.innerHeight)

    // Unload unneeded pages
    for (const pageIdx of pagesLoaded.keys()) {
        if (!pagesToLoad.has(pageIdx) && pagesLoaded.get(pageIdx) === true) {
            pagesLoaded.delete(pageIdx)
            pages[pageIdx].replaceChildren()
        }
    }

    // Loop through unloaded pages
    for (const pageIdx of pagesToLoad) {
        if (!pagesLoaded.has(pageIdx)) {
            const promise = pdf.getPage(pageIdx + 1).then(async page => {
                const viewport = page.getViewport({scale: 1})

                const canvas = document.createElement("canvas")
                canvas.width = Math.floor(viewport.width)
                canvas.height = Math.floor(viewport.height)

                const div = pages[pageIdx]
                canvas.style.width = div.style.width
                canvas.style.height = div.style.height
                const ctx = canvas.getContext("2d")!

                div.appendChild(canvas)

                const [_, text] = await Promise.all([
                    page.render({canvasContext: ctx, viewport: viewport}).promise,
                    page.getTextContent()
                ])

                for (const item of <TextItem[]>text.items) {
                    let [a, b, c, d, e, f] = item.transform

                    const fontAscent = calculateFontAscent(text.styles[item.fontName].fontFamily)

                    const x1 = item.width / item.height
                    const y1 = fontAscent

                    let g = a * x1 + c * y1 + e
                    let h = b * x1 + d * y1 + f

                    e -= c * (1 - fontAscent)
                    f -= d * (1 - fontAscent)

                    f = canvas.height - f
                    h = canvas.height - h

                    ctx.beginPath()
                    ctx.moveTo(e, f)
                    ctx.lineTo(e, h)
                    ctx.lineTo(g, h)
                    ctx.lineTo(g, f)
                    ctx.lineTo(e, f)
                    ctx.stroke()
                }
                pagesLoaded.set(pageIdx, true)
            })

            pagesLoaded.set(pageIdx, false)
        }
    }
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

    if (!urlParam) {
        return showUrlError("No PDF provided")
    }

    try {
        new URL(urlParam)
    } catch (exception) {
        return showUrlError(`Invalid url: ${urlParam}`)
    }

    // Load PDF
    const pdf = await getDocument(unescape(urlParam)).promise
    const pages = await initPageContainers(pdf)
    const pagesLoaded = new Map()
    await loadVisiblePages(pdf, pages, pagesLoaded)
    window.addEventListener("scroll", debounce(() => loadVisiblePages(pdf, pages, pagesLoaded), 100))
}

main()
