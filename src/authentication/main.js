import { AuthHandler } from "../firebase/firebaseClients"
const browser = require("webextension-polyfill")
window.authHandler = new AuthHandler()

document.getElementById('signin-btn').addEventListener('click', signIntoAccount)
document.getElementById('signup-btn').addEventListener('click', signUpForAccount)
document.getElementById('signupclosebtn').addEventListener('click', closeSignUpErr);
document.getElementById('signinclosebtn').addEventListener('click', closeSignInErr);
