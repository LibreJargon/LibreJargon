
function signIntoAccount() {
  const eml = document.getElementById("sieml").value
  const pwd = document.getElementById("sipwd").value
  const errormsg = document.getElementById("signinerror");
  window.authHandler.signIn(eml, pwd).then((res) => {
    if(res) {

    } else {
      errormsg.style.visibility = "visible"
    }
  })
}

function signUpForAccount() {
  const eml = document.getElementById("sueml").value
  const pwd = document.getElementById("signuppwd").value
  const copwd = document.getElementById("confirmsignuppwd").value

  const errormsg = document.getElementById("signuperror");

  if(pwd !== copwd) {
    errormsg.style.visibility = "visible"
    return;
  }
  else {
    window.authHandler.registerUser(eml, pwd).then((res) => {
      if(res !== "error") {

      } else {
        errormsg.style.visibility = "visible"
      }
    })
  }
  return
}

function closeSignUpErr() {
  document.getElementById("signuperror").style.visibility = "hidden";
  document.getElementById("signuperror").style.height = "0px";
}

function closeSignInErr() {
  document.getElementById("signinerror").style.visibility = "hidden";
  document.getElementById("signinerror").style.height = "0px";
}


export { closeSignInErr, closeSignUpErr, signIntoAccount, signUpForAccount }
