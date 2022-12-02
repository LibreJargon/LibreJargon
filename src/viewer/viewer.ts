import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import { $, debounce, calculateTextBounds } from "./utils"

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
    let prevUpper: number | null = null
    let prevLower: number | null = null

    let segments: string[] = []

    for (const item of <TextItem[]>text.items) {
        const [left, lower, right, upper] = calculateTextBounds(item, text)
        if (isNaN(left)) {
            continue
        }

        // No previous text box
        if (prevUpper == null || prevLower == null) {
            [prevUpper, prevLower] = [upper, lower]
            segments.push(item.str)
            continue
        }

        // Check for significant overlap (over 1/3)
        if (lower <= prevUpper &&
            3 * (Math.min(upper, prevUpper) - Math.max(lower, prevLower)) >
            Math.max(upper, prevUpper) - Math.min(lower, prevLower)) {
            // If found, add to segments buffer
            segments.push(item.str)
        } else {
            // Otherwise flush
            const span = document.createElement("div")
            span.innerText = segments.join(" ")
            container.appendChild(span)

            segments = [item.str]
        }
        [prevUpper, prevLower] = [upper, lower]
    }

    // Flush remaining segments
    if (segments.length != 0) {
        const span = document.createElement("div")
        span.innerText = segments.join(" ")
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
                    let [x1, y1, x2, y2] = calculateTextBounds(item, text)
                    if (isNaN(x1)) {
                        continue
                    }

                    y1 = canvas.height - y1
                    y2 = canvas.height - y2

                    ctx.beginPath()
                    ctx.moveTo(x1, y1)
                    ctx.lineTo(x1, y2)
                    ctx.lineTo(x2, y2)
                    ctx.lineTo(x2, y1)
                    ctx.lineTo(x1, y1)
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

function changeJargon(word) {
	var url = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=1200&exlimit=1&exintro&explaintext&format=json&titles=" + word
	fetch(url)
	.then((response) => response.json())
	.then((data) => parseJSONJargon(word, data))
}

function parseJSONJargon(word, json) {
	var pages = json.query.pages
	var definition
	for (var key in pages) {
		definition = pages[key].extract
	}
	
	textContainer.innerHTML = textContainer.innerHTML.replaceAll(word, "<div class=jargon><div class=jargonWord>" + word + "</div><div class=jargonDefinition>" + definition + "</div></div>")
}

function refreshDictionary() {
	//This function replaces any text in the html, so could in theory with certain words break the document
	changeJargon("algorithm")
	//bug, defines in mid definition
	changeJargon("virtualization")
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
    pagesContainer.addEventListener(
        "scroll",
        debounce(() => loadVisiblePages(pdf, pages, pagesLoaded), 100)
    )
	
	//Run any automated dictionary method
	refreshDictionary()
	
	//Here let user add own jargon via highlighting (WIP and very buggy, so commented out for now)
	textContainer.addEventListener(
		"mouseup",
		addJargon => {  
			if(window.getSelection().toString().length){
				//changeJargon(window.getSelection().toString());
			}
		}
	)
	
	$("#addJargonButton").onclick = () => {
		console.log("clicked")
        if(window.getSelection().toString().length){
			changeJargon(window.getSelection().toString());
		}
    }
}

main()
