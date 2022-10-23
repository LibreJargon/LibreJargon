import { AuthHandler } from "../firebase/firebaseClients"

window.authHandler = AuthHandler()

function signIntoAccount() {
  const eml = document.getElementById("sieml").value
  const pwd = document.getElementById("sipwd").value
  window.authHandler.signIn().then((res) => {
    //TODO: if valid auth credential, fetch and switch to settings page
    // else, throw error
  })
}
