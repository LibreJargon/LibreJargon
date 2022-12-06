
// Handle sign in on click
function signIntoAccount() {
  // Get email and password from inputs
  const eml = document.getElementById("sieml").value
  const pwd = document.getElementById("sipwd").value
  // Asign error
  const errormsg = document.getElementById("signinerror");

  // Attempt sign in with auth handler
  window.authHandler.signIn(eml, pwd).then((res) => {
    if(res) {

    } else {
      errormsg.style.visibility = "visible"
    }
  })
}


// Handles Registration
function signUpForAccount() {
  // Gets input info
  const eml = document.getElementById("sueml").value
  const pwd = document.getElementById("signuppwd").value
  const copwd = document.getElementById("confirmsignuppwd").value

  const errormsg = document.getElementById("signuperror");

  // Check password for validity
  if(pwd !== copwd) {
    errormsg.style.visibility = "visible"
    return;
  }
  else {
    // Attempt Registration
    window.authHandler.registerUser(eml, pwd).then((res) => {
      if(res !== "error") {

      } else {
        errormsg.style.visibility = "visible"
      }
    })
  }
  return
}

// Set errors
function closeSignUpErr() {
  document.getElementById("signuperror").style.visibility = "hidden";
  document.getElementById("signuperror").style.height = "0px";
}

function closeSignInErr() {
  document.getElementById("signinerror").style.visibility = "hidden";
  document.getElementById("signinerror").style.height = "0px";
}


export { closeSignInErr, closeSignUpErr, signIntoAccount, signUpForAccount }
