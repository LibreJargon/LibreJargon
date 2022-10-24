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
