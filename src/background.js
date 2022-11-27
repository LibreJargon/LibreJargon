const browser = require("webextension-polyfill")

browser.browserAction.onClicked.addListener(tab => {
    const encodedURL = escape(tab.url)
    browser.tabs.update(tab.id, {url: `viewer/viewer.html?url=${encodedURL}`})
    browser.browserAction.setPopup({
      popup: "/authentication/auth.html"
    })
})
