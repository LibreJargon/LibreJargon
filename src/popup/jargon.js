import { DatabaseHandler } from "../firebase/firebaseClients"
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { nonce } from './utils'


function pullJargon() {
  if(self.user) {
    const uid = self.user.uid;
    self.dbHandler.getJargon(uid).then(
      (jargon) => {
        for(var i of Object.keys(jargon)) {
          renderJargonRLItem(jargon[i].word, i)
          self.rlMap[i] = jargon[i];
        }
      })
  }
}


function addJargonToList() {
  var word = document.getElementById("modify-jargon").value
  // TODO send to firestore at /users/{id}/userlist
  document.getElementById("modify-jargon").value = ""

  const nonceId = nonce(10);
  const file = {
    word: word
  }

  if(self.user) {
    self.dbHandler.addToJargonList(file,self.user.uid, nonceId)

    self.rlMap[nonceId] = file;
  }
}


function renderJargonRLItem(title, id) {
  var ul = document.getElementById("jargon-list");
  var li = document.createElement("li");
  li.className = "rl-li"
  var deleteBtn = document.createElement("button")
  deleteBtn.className = "icons";
  deleteBtn.textContent = "X"

  deleteBtn.addEventListener('click', () => {
    const liToDel = document.getElementById(id);
    liToDel.style.visibility = "hidden";
    liToDel.style.height = "0px";
    ul.removeAttribute(liToDel)
    self.dbHandler.rmJargonFromList(self.user.uid, id)

  });

  var titlep = document.createElement("a");
  titlep.appendChild(document.createTextNode(title))
  titlep.title = title;
  li.id = id;
  li.appendChild(deleteBtn)
  li.appendChild(titlep)
  ul.appendChild(li);
}

export { addJargonToList, pullJargon, renderJargonRLItem }
