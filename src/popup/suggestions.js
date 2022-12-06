import { nonce } from "./utils"

// const arxiv = require('arxiv-api');


function renderSuggestions() {
  arxiv.search({
    searchQueryParams: [
        {
            include: [{name: 'Climate'}, {name: 'Deep learning'}],
        }
    ],
    start: 0,
    maxResults: 5,
}).then((res) => {
  for(var paper of res) {
    renderRLItem(paper.title, paper.id, nonce(10))
  }
}).catch((e) => {
  console.log(e)
})
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


export { renderSuggestions }
