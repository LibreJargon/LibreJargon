const browser = require("webextension-polyfill")

browser.browserAction.onClicked.addListener(tab => {
    browser.tabs.update(
        tab.id,
        {url: browser.runtime.getURL("viewer/viewer.html")}
    )
	var request = new XMLHttpRequest();
	request.open("GET", "https://api.dictionaryapi.dev/api/v2/entries/en/cringe", true);
	request.onreadystatechange = () => {
		if (request.readyState === 4) {
			console.log(request.response);
		}
	}
	request.send()
})
