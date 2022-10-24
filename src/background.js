const browser = require("webextension-polyfill")

browser.browserAction.onClicked.addListener(tab => {
    browser.tabs.update(
        tab.id,
        {url: browser.runtime.getURL("viewer/viewer.html")}
    )
})