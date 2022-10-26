export function debounce(func: () => void, timeout: number) {
    let lastCall = 0
    let timer: number | undefined = undefined

    return () => {
        let time = Date.now()
        if (time - lastCall > timeout) {
            clearTimeout(timer)
            lastCall = time
            func()
        } else {
            clearTimeout(timer)
            timer = window.setTimeout(() => {
                func()
            }, timeout)
        }
    }
}

export const $: <E extends HTMLElement>(selector: string) => E
    = selector => document.querySelector(selector)!


const DEFAULT_FONT_SIZE = 30
const DEFAULT_FONT_ASCENT = 0.8

const ascentCache = new Map()

const ascentCanvas = document.createElement("canvas")
ascentCanvas.width = ascentCanvas.height = DEFAULT_FONT_SIZE
const ascentCtx = ascentCanvas.getContext("2d")!
ascentCtx.strokeStyle = "red"

export function calculateFontAscent(fontFamily: string) {
    const cachedAscent = ascentCache.get(fontFamily)
    if (cachedAscent) {
        return cachedAscent
    }

    ascentCtx.font = `${DEFAULT_FONT_SIZE}px ${fontFamily}`

    ascentCtx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE)
    ascentCtx.strokeText("g", 0, 0)
    let pixels = ascentCtx.getImageData(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE).data
    let descent = 0
    for (let i = pixels.length - 4; i >= 0; i -= 4) {
        if (pixels[i] > 0) {
            descent = Math.ceil(i / 4 / DEFAULT_FONT_SIZE)
            break
        }
    }

    ascentCtx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE)
    ascentCtx.strokeText("A", 0, DEFAULT_FONT_SIZE)
    pixels = ascentCtx.getImageData(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE).data
    let ascent = 0
    for (let i = 0, ii = pixels.length; i < ii; i += 4) {
        if (pixels[i] > 0) {
            ascent = DEFAULT_FONT_SIZE - Math.ceil(i / 4 / DEFAULT_FONT_SIZE)
            break
        }
    }

    if (ascent) {
        const ratio = ascent / (ascent + descent)
        ascentCache.set(fontFamily, ratio)
        return ratio
    }

    ascentCache.set(fontFamily, DEFAULT_FONT_ASCENT)
    return DEFAULT_FONT_ASCENT
}
