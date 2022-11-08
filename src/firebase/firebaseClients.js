

import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, collection, setDoc, updateDoc, getDoc, addDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebaseSecrets'
import { renderRLItem } from '../authentication/readinglist'

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
      return undefined
    }
    this.uid = this.userCred.user.uid;
    return this.uid
  }

  async signIn(email, password) {
    try {
      this.userCred = await signInWithEmailAndPassword(this.appAuth, email, password)
    } catch (e) {
      return undefined
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
    if(!this.database) {return undefined;}
    return await updateDoc(this.database, settingsConfig);
  }

  async getSettings(userId) {
    if(!this.database){ return undefined;}
    return await getDoc(doc(this.database, "settings", userId))
  }

  async getReadingList(userId) {
    if(!this.database) {return undefined;}
    const docs = await getDocs(collection(this.database, "users", userId, "readinglist"));
    const fileMap = {}
    docs.forEach((el) => {
      fileMap[el.id] = el.data();
    })

    return fileMap
  }

  async addToReadingList(listItemObj, userId, nonce) {
    if(!this.database) {return undefined;}
    const docInfo = await setDoc(doc(this.database, "users", userId, "readinglist", nonce), listItemObj)
    renderRLItem(listItemObj.title, listItemObj.link, nonce)

    return docInfo;
  }

  async rmFromList(userId, nonce) {
    if(!this.database) {return undefined;}
    return await deleteDoc(doc(this.database, "users", userId, "readinglist", nonce));
  }

}
