import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, collection, setDoc, updateDoc, getDoc } from 'firebase/firestore'


export class AuthHandler {
  constructor() {
    this.uid = undefined
    this.userCred = undefined
    this.appAuth = getAuth(window.FIREBASE_APP)
  }

  async registerUser(email, password) {
    this.userCred = createUserWithEmailAndPassword(this.appAuth, email, password)
    this.uid = this.userCred.user.uid;
    return this.uid
  }

  async signIn(email, password) {
    this.userCred = await signInWithEmailAndPassword(this.appAuth, email, password)
    this.uid = this.userCred.user.uid;
    return this.uid;
  }

  getUid() {
    return this.uid;
  }

  async signOut() {
    this.uid = undefined
    this.userCred = undefined
    return await signOut(this.appAuth)
  }

}


export class DatabaseHandler {
  constructor() {
    this.database = getFirestore(window.FIREBASE_APP);
  }

  async updateSettings(settingsConfig) {
    await updateDoc(this.database, settingsConfig);
  }

  async getSettings(userId) {
    return await getDoc(doc(this.database, "settings", userId))
  }

}
