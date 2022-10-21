import "webextension-polyfill"

browser.pageAction.onClicked.addListener((tab, data) => {
    browser.tabs.update(
        tab.id,
        {url: browser.runtime.getURL("viewer/viewer.html")}
    )
})
