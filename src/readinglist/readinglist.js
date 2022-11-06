

import { DatabaseHandler } from "../firebase/firebaseClients"
import { getAuth, onAuthStateChanged } from 'firebase/auth'

console.log("IN READING LIST")
const rlMap = {}


self.dbHandler = new DatabaseHandler();

// browser.tabs.getCurrent().then((tab) => {
//   const encodedURL = escape(tab.url)
//   browser.tabs.update(tab.id, {url: `viewer/viewer.html?url=${encodedURL}`})
// })

getAuth().onAuthStateChanged(function(user) {
  if (user) {
    self.user = user
    pullReadingList();
  } else {
    // No user is signed in.
  }
});

function nonce(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


function pullReadingList() {
  console.log("pulling list")
  if(self.user) {
    const uid = self.user.uid;
    console.log("pulling list", uid)
    self.dbHandler.getReadingList(uid).then(
      (readingList) => {
        console.log(readingList)
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
  const nonceId = nonce(10);
  const file = {
    title: title,
    link: link
  }

  if(self.user) {
    self.dbHandler.addToReadingList(file,self.user.uid, nonceId)
  }

  renderRLItem(title, link)
}

document.getElementById("add-rl").addEventListener('click', addToList)

function renderRLItem(title, link) {
  var ul = document.getElementById("reader-list");
  var li = document.createElement("li");
  var titlep = document.createElement("p");
  var linkp = document.createElement("p");
  titlep.appendChild(document.createTextNode(title))
  linkp.appendChild(document.createTextNode(link))
  li.appendChild(titlep)
  li.appendChild(linkp)
  ul.appendChild(li);
}
