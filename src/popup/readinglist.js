import { nonce } from "./utils";

function pullReadingList() {
  if (self.user) {
    const uid = self.user.uid;
    self.dbHandler.getReadingList(uid).then((readingList) => {
      for (let i of Object.keys(readingList)) {
        renderRLItem(readingList[i].title, readingList[i].link, i);
        self.rlMap[i] = readingList[i];
      }
    });
  }
}

function addToList() {
  let title = document.getElementById("add-title").value;
  let link = document.getElementById("add-link").value;
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
  let ul = document.getElementById("reader-list");
  let li = document.createElement("li");
  li.className = "rl-li";
  let deleteBtn = document.createElement("button");
  deleteBtn.className = "icons";
  deleteBtn.textContent = "X";

  deleteBtn.addEventListener("click", () => {
    const liToDel = document.getElementById(id);
    liToDel.style.visibility = "hidden";
    liToDel.style.height = "0px";
    ul.removeAttribute(liToDel);
    self.dbHandler.rmFromList(self.user.uid, id);
  });

  let titlep = document.createElement("a");
  titlep.appendChild(document.createTextNode(title));
  titlep.title = title;
  titlep.href = link;
  li.id = id;
  li.appendChild(deleteBtn);
  li.appendChild(titlep);
  ul.appendChild(li);
}

export { addToList, pullReadingList, renderRLItem };
