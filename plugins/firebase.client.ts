// Firebase client-side configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin(() => {
  // Your Firebase config from Firebase Console
  const firebaseConfig = {
    apiKey: "AIzaSyC1KRpvlqZqihbOmf5R828SGui0WdF1ssE",
    authDomain: "bigmachine.firebaseapp.com",
    databaseURL: "https://bigmachine.firebaseio.com",
    projectId: "project-8588976765518720764",
    storageBucket: "project-8588976765518720764.appspot.com",
    messagingSenderId: "153018044002",
    appId: "1:153018044002:web:a80d87e2f146fdfe90cb3b"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const firestore = getFirestore(app)
  const storage = getStorage(app)

  return {
    provide: {
      firebaseApp: app,
      auth,
      firestore,
      storage
    }
  }
})