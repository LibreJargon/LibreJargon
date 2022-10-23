const browser = require("webextension-polyfill")

browser.browserAction.onClicked.addListener(tab => {
    const encodedURL = escape(btoa(tab.url))
    browser.tabs.update(tab.id, {url: `viewer/viewer.html?url=${encodedURL}`})
})
