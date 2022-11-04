

import { DatabaseHandler } from "../firebase/firebaseClients"
import { getAuth } from 'firebase/auth'

const rlMap = {}

self.dbHandler = new DatabaseHandler();

browser.tabs.getCurrent().then((tab) => {
  const encodedURL = escape(tab.url)
  browser.tabs.update(tab.id, {url: `viewer/viewer.html?url=${encodedURL}`})
})


function pullReadingList() {
  const currentUser = getAuth().currentUser;
  if(currentUser) {
    self.dbHandler.getReadingList(currentUser.uid).then(
      (readingList) => {
        for(var i of Object.keys(readingList)) {
          renderRLItem(readingList[i].title, readingList[i].link)
          rlMap[i] = readingList[i];
        }
      })
  }
}

function addToList() {
  console.log('Adding!')
  var title = document.getElementById("add-title").value
  var link = document.getElementById("add-link").value
  // TODO send to firestore at /users/{id}/userlist
  const nonce = nonce(10);
  const file = {
    title: title,
    link: link
  }
  const currentUser = getAuth().currentUser;
  if(currentUser) {
    self.dbHandler.addToReadingList(file, currentUser.uid, )
  }

  renderRLItem(titleP, rlMap[i].link)
}

document.getElementById("add-rl").addEventListener('click', addToList)

function renderRLItem(title, link) {
  var ul = document.getElementById("reader-list");
  var li = document.createElement("li");
  var titlep = document.createElement("p");
  var linkp = document.createElement("p");
  titlep.appendChild(document.createTextNode(title))
  linkp.appendChild(document.createTextNode(link))
  li.appendChild(title)
  li.appendChild(link)
  ul.appendChild(li);
}

function nonce(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
