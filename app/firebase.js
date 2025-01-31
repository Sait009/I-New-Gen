import { getDatabase, ref, remove } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyA_cQ8V_AcobfEUqCC4GZhJHzbKrgT3koU",
    authDomain: "inewgenweb.firebaseapp.com",
    databaseURL: "https://inewgenweb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "inewgenweb",
    storageBucket: "inewgenweb.firebasestorage.app",
    messagingSenderId: "367428928627",
    appId: "1:367428928627:web:2c0dad766e8f7918145606",
    measurementId: "G-C9H5D17Y7T"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, remove };