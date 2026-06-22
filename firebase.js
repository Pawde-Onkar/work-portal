
// Firebase SDK Imports

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Firebase Config

const firebaseConfig = {

    apiKey:
    "AIzaSyBWbAbsKEw3qQf8c0h2jN2TlTeIM-tmbKc",

    authDomain:
    "talathi-work-portal.firebaseapp.com",

    projectId:
    "talathi-work-portal",

    storageBucket:
    "talathi-work-portal.firebasestorage.app",

    messagingSenderId:
    "725316961755",

    appId:
    "1:725316961755:web:7dbc55d5d71d344fad53fe",

    measurementId:
    "G-W440RF78L7"

};


// Initialize Firebase

const app =
    initializeApp(firebaseConfig);


// Firestore

const db =
    getFirestore(app);


// Auth

const auth =
    getAuth(app);


// Export

export {
    db,
    auth
};