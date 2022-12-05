import { AuthHandler } from "../firebase/firebaseClients"
import { closeSignInErr, closeSignUpErr, signIntoAccount, signUpForAccount } from "./auth"
import { addToList, pullReadingList } from './readinglist'
import { addJargonToList, pullJargon } from './jargon'
import { getAuth } from "firebase/auth"
import { DatabaseHandler } from "../firebase/firebaseClients"
import { renderSuggestions } from "./suggestions"

// Handle Auth
const browser = require("webextension-polyfill")
/*
      <button class="tablinks" id="rl-tab">Reading List</button>
      <button class="tablinks" id="sugg-tab">Suggestions</button>
	  <button class="tablinks" id="jarg-tab">Jargon</button>
      <button class="tablinks" id="sets-tab">Settings</button>
*/
window.authHandler = new AuthHandler()

document.getElementById('signin-btn').addEventListener('click', signIntoAccount)
document.getElementById('signup-btn').addEventListener('click', signUpForAccount)
document.getElementById('signupclosebtn').addEventListener('click', closeSignUpErr);
document.getElementById('signinclosebtn').addEventListener('click', closeSignInErr);
document.getElementById("add-rl").addEventListener('click', addToList)
document.getElementById("add-jargon-rl").addEventListener('click', addJargonToList)

getAuth().onAuthStateChanged((user) => {
  if (user) {
    self.user = user
    document.getElementById('auth-div').style.visibility = "hidden"
    document.getElementById('auth-div').style.height = "0px"
    document.getElementById('reading-list-div').style.visibility = "visible"
    document.getElementById('reading-list-div').style.height = "100%"
    self.dbHandler = new DatabaseHandler();
    pullReadingList();
	pullJargon();
    renderSuggestions();
    self.rlMap = {}


  } else {
    // No user is signed in.
    document.getElementById('auth-div').style.visibility = "visible"
    document.getElementById('reading-list-div').style.visibility = "hidden"
  }
});


function openTab(evt, id) {
  var tabcontent = document.getElementsByClassName("tabcontent");
  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  var tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(id).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementById("rl-tab").addEventListener('click', (e) => openTab(e, "rl"));
document.getElementById("sets-tab").addEventListener('click', (e) => openTab(e, "sets"));
document.getElementById("jarg-tab").addEventListener('click', (e) => openTab(e, "jarg"));
document.getElementById("sugg-tab").addEventListener('click', (e) => openTab(e, "sugg"));

document.getElementById("rl-tab").click();
