function changeJargon(word) {
	var url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word
	fetch(url)
	.then((response) => response.json())
	.then((data) => document.body.innerHTML = document.body.innerHTML.replace(word, "<div class=jargon><div class=jargonWord>" + word + "</div><div class=jargonDefinition>" + data[0].meanings[0].definitions[0].definition + "</div></div>")
	);
}
//This function replaces any text in the html, so could in theory with certain words break the document
changeJargon("algorithm")
changeJargon("computer")
