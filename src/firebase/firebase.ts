// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8ZCBkhoAmYYtiToWwiR7VDCILICEe3Dk",
  authDomain: "faculty-ranker-272aa.firebaseapp.com",
  projectId: "faculty-ranker-272aa",
  storageBucket: "faculty-ranker-272aa.firebasestorage.app",
  messagingSenderId: "590510772123",
  appId: "1:590510772123:web:40750c143d2e0c4842db3e",
  measurementId: "G-K5EY4DE1VX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// import firestore 