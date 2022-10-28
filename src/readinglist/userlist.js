import { DatabaseHandler } from "../firebase/firebaseClients"

window.dbHandler = new DatabaseHandler()


function addToList() {
  var title = document.getElementById("add-title").value
  var link = document.getElementById("add-link").value
  // TODO send to firestore at /users/{id}/userlist

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


function getPrevAdditions() {

}
