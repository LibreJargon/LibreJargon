import { DatabaseHandler } from "../firebase/firebaseClients";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { nonce } from "./utils";

function pullReadingList() {
  if (self.user) {
    const uid = self.user.uid;
    self.dbHandler.getReadingList(uid).then((readingList) => {
      for (var i of Object.keys(readingList)) {
        renderRLItem(readingList[i].title, readingList[i].link, i);
        self.rlMap[i] = readingList[i];
      }
    });
  }
}

function addToList() {
  var title = document.getElementById("add-title").value;
  var link = document.getElementById("add-link").value;
  // TODO send to firestore at /users/{id}/userlist
  document.getElementById("add-link").value = "";
  document.getElementById("add-title").value = "";

  const nonceId = nonce(10);
  const file = {
    title: title,
    link: link,
  };

  if (self.user) {
    self.dbHandler.addToReadingList(file, self.user.uid, nonceId);

    self.rlMap[nonceId] = file;
  }
}

function renderRLItem(title, link, id) {
  var ul = document.getElementById("reader-list");
  var li = document.createElement("li");
  li.className = "rl-li";
  var deleteBtn = document.createElement("button");
  deleteBtn.className = "icons";
  deleteBtn.textContent = "X";

  deleteBtn.addEventListener("click", () => {
    const liToDel = document.getElementById(id);
    liToDel.style.visibility = "hidden";
    liToDel.style.height = "0px";
    ul.removeAttribute(liToDel);
    self.dbHandler.rmFromList(self.user.uid, id);
  });

  var titlep = document.createElement("a");
  titlep.appendChild(document.createTextNode(title));
  titlep.title = title;
  titlep.href = link;
  li.id = id;
  li.appendChild(deleteBtn);
  li.appendChild(titlep);
  ul.appendChild(li);
}

export { addToList, pullReadingList, renderRLItem };
