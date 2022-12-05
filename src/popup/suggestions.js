// import { nonce } from "./utils"

// const arxiv = require('arxiv-api');
const axios = require('axios');
function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};


function renderSuggestions() {
  const searchQuery = 'climete';
  const start = 0
  const maxResults = 5;
//   arxiv.search(search).then((res) => {
//   // for(var paper of res) {
//   //   renderRLItem(paper.title, paper.id, nonce(10))
//   // }
//   console.log(res)
// }).catch((e) => {
//   console.log(e)
// })

  axios.get(`http://export.arxiv.org/api/query?search_query=${searchQuery}&start=${start}&max_results=${maxResults}`)
    .then((xml) => console.log(xmlToJson(xml)));
}

function renderRLItem(title, link, id) {
  var ul = document.getElementById("suggestion-list");
  var li = document.createElement("li");
  li.className = "rl-li"
  var addBtn = document.createElement("button")
  addBtn.className = "icons";
  addBtn.textContent = "+"

  addBtn.addEventListener('click', () => {
    const liToDel = document.getElementById(id);
    liToDel.style.visibility = "hidden";
    liToDel.style.height = "0px";
    ul.removeAttribute(liToDel)
    self.dbHandler.addToReadingList({
      title: title,
      link:link
    },self.user.uid, id)

  });

  var titlep = document.createElement("a");
  titlep.appendChild(document.createTextNode(title))
  titlep.title = title;
  titlep.href = link;
  li.id = id;
  li.appendChild(addBtn)
  li.appendChild(titlep)
  ul.appendChild(li);
}

renderSuggestions()


// export { renderSuggestions }
