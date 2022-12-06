import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { $, debounce, calculateTextBounds } from "./utils";
const browser = require("webextension-polyfill");
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

import { AuthHandler, DatabaseHandler } from "../firebase/firebaseClients";
import { getAuth } from "firebase/auth";
import { settings } from "../popup/settings";

window.authHandler = new AuthHandler();

self.settings = settings;
self.jargonList = [];

getAuth().onAuthStateChanged((user) => {
  //TODO: Race Condition Here where code assumes that text container is filled before auth state changes, may fail for large pdfs
  //For now, program runs twice, but due to current implementation may double highlight words, moreso problem with TODO in how we highlight words
  if (user) {
    self.user = user;
    self.dbHandler = new DatabaseHandler();

    //Get Settings List
    self.dbHandler.getSettings(user.uid).then((settingsList) => {
      let counter = 0;
      for (const i of Object.keys(settingsList)) {
        if (settingsList[i].name == self.settings[counter][0]) {
          self.settings[counter][1] = settingsList[i].value;
        }
        counter++;
      }
    });

    //Define All Jargon from Jargon List in Firebase
    self.dbHandler.getJargon(user.uid).then((jargon) => {
      const newJargonList = {};
      for (let i of Object.keys(jargon)) {
        changeJargon(jargon[i].word);
        newJargonList[i] = jargon[i].word;
      }
      self.jargonList = newJargonList;
    });
  } else {
    self.settings = settings;
    self.jargonList = [];
  }
});

browser.tabs.getCurrent().then((tab: any) => {
  browser.browserAction.setPopup({
    popup: "/popup/popup.html",
    tabId: tab.id,
  });
});

GlobalWorkerOptions.workerPort = new Worker(
  new URL("/node_modules/pdfjs-dist/build/pdf.worker.js", import.meta.url),
  { type: "module" }
);

const pagesContainer = $("#pages-container");
const textContainer = $("#text-container");

async function initPageContainers(
  pdf: PDFDocumentProxy
): Promise<HTMLElement[]> {
  let pages: HTMLElement[] = [];
  for (let i = 1; i <= pdf.numPages; ++i) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });

    const div = document.createElement("div");
    div.id = `page-container-${i}`;
    div.style.width = `${Math.floor(viewport.width)}px`;
    div.style.height = `${Math.floor(viewport.height)}px`;

    pagesContainer.appendChild(div);
    pages.push(div);

    const textDiv = document.createElement("div");
    textContainer.appendChild(textDiv);
    loadTextContainer(page, textDiv);
  }
  prepareDictionary();
  return pages;
}

async function loadTextContainer(page: PDFPageProxy, container: HTMLElement) {
  const text = await page.getTextContent();
  let prevUpper: number | null = null;
  let prevLower: number | null = null;

  let segments: string[] = [];

  for (const item of <TextItem[]>text.items) {
    const [left, lower, upper] = calculateTextBounds(item, text);
    if (isNaN(left)) {
      continue;
    }

    // No previous text box
    if (prevUpper == null || prevLower == null) {
      [prevUpper, prevLower] = [upper, lower];
      segments.push(item.str);
      continue;
    }

    // Check for significant overlap (over 1/3)
    if (
      lower <= prevUpper &&
      3 * (Math.min(upper, prevUpper) - Math.max(lower, prevLower)) >
        Math.max(upper, prevUpper) - Math.min(lower, prevLower)
    ) {
      // If found, add to segments buffer
      segments.push(item.str);
    } else {
      // Otherwise flush
      const span = document.createElement("div");
      span.innerText = segments.join(" ");
      container.appendChild(span);

      segments = [item.str];
    }
    [prevUpper, prevLower] = [upper, lower];
  }

  // Flush remaining segments
  if (segments.length != 0) {
    const span = document.createElement("div");
    span.innerText = segments.join(" ");
    container.appendChild(span);
  }
}

async function loadVisiblePages(
  pdf: PDFDocumentProxy,
  pages: HTMLElement[],
  pagesLoaded: Map<number, boolean>
) {
  // Binary search for first page to load
  let left = 0;
  let right = pages.length - 1;

  while (left != right) {
    const idx = Math.floor((left + right) / 2);
    const bottom =
      pages[idx].getBoundingClientRect().bottom + window.innerHeight;
    if (bottom < 0) {
      left = idx + 1;
    } else {
      right = idx;
    }
  }

  // Linear search for last page to load
  const pagesToLoad: Set<number> = new Set();
  do {
    pagesToLoad.add(left);
  } while (
    ++left < pages.length &&
    pages[left].getBoundingClientRect().top <= 2 * window.innerHeight
  );

  // Unload unneeded pages
  for (const pageIdx of pagesLoaded.keys()) {
    if (!pagesToLoad.has(pageIdx)) {
      pagesLoaded.delete(pageIdx);
      pages[pageIdx].replaceChildren();
    }
  }

  // Loop through unloaded pages
  for (const pageIdx of pagesToLoad) {
    if (!pagesLoaded.has(pageIdx)) {
      pdf.getPage(pageIdx + 1).then(async (page) => {
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const div = pages[pageIdx];
        canvas.style.width = div.style.width;
        canvas.style.height = div.style.height;
        const ctx = canvas.getContext("2d")!;

        div.appendChild(canvas);

        const [_, text] = await Promise.all([
          page.render({ canvasContext: ctx, viewport: viewport }).promise,
          page.getTextContent(),
        ]);

        for (const item of <TextItem[]>text.items) {
          let [x1, y1, x2, y2] = calculateTextBounds(item, text);
          if (isNaN(x1)) {
            continue;
          }

          y1 = canvas.height - y1;
          y2 = canvas.height - y2;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1, y2);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x2, y1);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        pagesLoaded.set(pageIdx, true);
      });

      pagesLoaded.set(pageIdx, false);
    }
  }
}

// Handle invalid URLs and allow entering a new one
function showUrlError(message: string) {
  $("#url-error-message").innerText = message;
  $("#url-error-container").style.display = "block";

  $("#url-error-input-submit").onclick = () => {
    const newUrlInput = $<HTMLInputElement>("input#url-error-input");
    document.location = `${document.location.origin}${document.location.pathname}?url=${newUrlInput.value}`;
  };
}

//Find the definition for a word and insert it
function changeJargon(word) {
  if (word.split()[0].length != 0) {
    word = word.split()[0];
  } else if (word.split().size() < 2) {
    return;
  } else {
    word = word.split()[1];
  }
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exchars=1200&exlimit=1&exintro&explaintext&format=json&titles=" +
    word;
  fetch(url)
    .then((response) => response.json())
    .then((data) => parseJSONJargon(word, data));
}

//Process the json definition and insert it
function parseJSONJargon(word, json) {
  const pages = json.query.pages;
  let definition;
  for (const key in pages) {
    definition = pages[key].extract;
    break;
  }

  insertJargon(word, definition);
}

//Insert the Jargon into the HTML for UI
function insertJargon(word, definition) {
  //TODO: This will break if jargon is in tags and is buggy, replace with method: https://stackoverflow.com/questions/8644428/how-to-highlight-text-using-javascript
  //TODO: probably shouldn't hard code this for settings
  if (self.settings[0][1]) {
    textContainer.innerHTML = textContainer.innerHTML.replaceAll(
      word,
      "<div class=jargon><div class=jargonWord>" +
        word +
        "</div><div class=jargonDefinition>" +
        definition +
        "</div></div>"
    );
  } else {
    textContainer.innerHTML = textContainer.innerHTML.replace(
      word,
      "<div class=jargon><div class=jargonWord>" +
        word +
        "</div><div class=jargonDefinition>" +
        definition +
        "</div></div>"
    );
  }
}

//Function to Start Dictionary When Ready
function prepareDictionary() {
  //Enable Jargon Button
  $("#addJargonButton").onclick = () => {
    if (window.getSelection().toString().length) {
      changeJargon(window.getSelection().toString());
    }
  };

  for (const i in self.jargonList) {
    changeJargon(self.jargonList[i]);
  }
}

async function main() {
  // Get URL
  const urlParam = new URL(document.location.href).searchParams.get("url");

  //Check that a PDF was passed in with Regex
  if (!/^.*:\/\/.*\/.*.pdf$/.test(urlParam)) {
    return showUrlError("No PDF provided");
  }

  try {
    new URL(urlParam);
  } catch (exception) {
    return showUrlError(`Invalid url: ${urlParam}`);
  }

  // Load PDF
  const pdf = await getDocument(decodeURI(urlParam)).promise;
  const pages = await initPageContainers(pdf);
  const pagesLoaded = new Map();
  await loadVisiblePages(pdf, pages, pagesLoaded);
  pagesContainer.addEventListener(
    "scroll",
    debounce(() => loadVisiblePages(pdf, pages, pagesLoaded), 100)
  );
}

main();
