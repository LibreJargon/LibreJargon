import { AuthHandler } from "../firebase/firebaseClients"

console.log("Running Script")

window.authHandler = new AuthHandler()

function signIntoAccount() {
  console.log("signing in")
  const eml = document.getElementById("sieml").value
  const pwd = document.getElementById("sipwd").value
  const errormsg = document.getElementById("signinerror");
  window.authHandler.signIn(eml, pwd).then((res) => {
    if(res !== "error") {
      window.location.href = "../settings/settings.html";
    } else {
      errormsg.style.visibility = "visible"
    }
  })
}


function signUpForAccount() {
  console.log("signing Up")
  const eml = document.getElementById("sueml").value
  const pwd = document.getElementById("signuppwd").value
  const copwd = document.getElementById("confirmsignuppwd").value

  const errormsg = document.getElementById("signuperror");

  if(pwd !== copwd) {
    console.log("Pushing Error")
    errormsg.style.visibility = "visible"
    return;
  }
  else {
    window.authHandler.registerUser(eml, pwd).then((res) => {
      if(res !== "error") {
        window.location.href = "../settings/settings.html";
      } else {
        errormsg.style.visibility = "visible"
      }
    })
  }
  return
}

function closeSignUpErr() {
  document.getElementById("signuperror").style.visibility = "hidden";
}

function closeSignInErr() {
  document.getElementById("signinerror").style.visibility = "hidden";
}

document.getElementById('signin-btn').addEventListener('click', signIntoAccount)
document.getElementById('signup-btn').addEventListener('click', signUpForAccount)
document.getElementById('signupclosebtn').addEventListener('click', closeSignUpErr);
document.getElementById('signinclosebtn').addEventListener('click', closeSignUpErr);
