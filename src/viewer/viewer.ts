import { getDocument } from "pdfjs-dist"

const url = new URL(document.location)
const pdfURL = atob(unescape(url.searchParams.get("url")))
history.replaceState(null, "", url.origin + url.pathname)

console.log(pdfURL)
