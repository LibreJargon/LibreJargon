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
	document.body.innerHTML = document.body.innerHTML.replace(word, "<div class=jargon><div class=jargonWord>" + word + "</div><div class=jargonDefinition>" + definition + "</div></div>")
}

//This function replaces any text in the html, so could in theory with certain words break the document
changeJargon("algorithm")
//bug, defines in mid definition
changeJargon("virtualization")