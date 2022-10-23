import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, collection, setDoc, updateDoc, getDoc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebaseSecrets'

const FIREBASE_APP = initializeApp(firebaseConfig)


export class AuthHandler {
  constructor() {
    this.uid = undefined
    this.userCred = undefined
    this.appAuth = getAuth(FIREBASE_APP)
  }

  async registerUser(email, password) {
    try {
      this.userCred = await createUserWithEmailAndPassword(this.appAuth, email, password)
    } catch (e) {
      return "error"
    }

    this.uid = this.userCred.user.uid;
    return this.uid
  }

  async signIn(email, password) {
    try {
      this.userCred = await signInWithEmailAndPassword(this.appAuth, email, password)
    } catch (e) {
      return "error"
    }

    this.uid = this.userCred.user.uid;
    return this.uid
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
    this.database = getFirestore(FIREBASE_APP);
  }

  async updateSettings(settingsConfig) {
    await updateDoc(this.database, settingsConfig);
  }

  async getSettings(userId) {
    return await getDoc(doc(this.database, "settings", userId))
  }

}
