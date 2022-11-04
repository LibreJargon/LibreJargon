

import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, collection, setDoc, updateDoc, getDoc, addDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebaseSecrets'

const FIREBASE_APP = initializeApp(firebaseConfig)
window.database = undefined;

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
      return undefined
    }
    window.database = getFirestore(FIREBASE_APP);
    this.uid = this.userCred.user.uid;
    return this.uid
  }

  async signIn(email, password) {
    try {
      this.userCred = await signInWithEmailAndPassword(this.appAuth, email, password)
    } catch (e) {
      return undefined
    }
    window.database = getFirestore(FIREBASE_APP);
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
  constructor() {}

  async updateSettings(settingsConfig) {
    if(!window.database) return undefined;
    return await updateDoc(window.database, settingsConfig);
  }

  async getSettings(userId) {
    if(!window.database) return undefined;
    return await getDoc(doc(window.database, "settings", userId))
  }

  async getReadingList(userId) {
    if(!window.database) return undefined;
    const docs = await getDocs(collection(window.database, "users", userId, "readinglist"));
    const fileMap = {}
    docs.forEach((el) => {
      fileMap[el.id] = el.data;
    })

    return fileMap
  }

  async addToReadingList(listItemObj, userId, nonce) {
    if(!window.database) return undefined;
    return await setDoc(doc(window.database, "users", userId, "readinglist", nonce), listItemObj)
  }

  async rmFromList(userId, nonce) {
    if(!window.database) return undefined;
    return await deleteDoc(doc(window.database, "users", userId, "readinglist", nonce));
  }

}
