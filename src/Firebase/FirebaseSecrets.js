// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgwD1jsL-nnq3n7aC3IaveRJGVUVqF4ys",
  authDomain: "jargonlibre.firebaseapp.com",
  projectId: "jargonlibre",
  storageBucket: "jargonlibre.appspot.com",
  messagingSenderId: "1034819114150",
  appId: "1:1034819114150:web:61aed4acc72e7d02f55067",
  measurementId: "G-B5GGQKYC98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
