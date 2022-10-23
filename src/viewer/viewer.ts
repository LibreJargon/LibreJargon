import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import { debounce } from "./utils"

GlobalWorkerOptions.workerPort = new Worker(
    new URL("/node_modules/pdfjs-dist/build/pdf.worker.js", import.meta.url),
    {type: "module"}
)

let pdf = null
let pages = []
let pagesLoaded: Set<number> = new Set()

const pagesContainer = document.getElementById("pages-container")
async function initPageContainers() {
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
}

async function loadVisiblePages() {
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
                canvasContext: canvas.getContext("2d"),
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

    pagesLoaded = newPagesLoaded // Update loaded pages
}

async function main() {
    // Get URL
    const url = new URL(document.location.href)
    const pdfURL = atob(unescape(url.searchParams.get("url")))
    history.replaceState(null, "", url.origin + url.pathname);

    // Load PDF
    pdf = await getDocument(pdfURL).promise
    await initPageContainers()
    await loadVisiblePages()
    window.addEventListener("scroll", debounce(loadVisiblePages, 100))
}

main()
