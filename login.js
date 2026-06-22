import { auth, db }
from "./firebase.js";

import {
    signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function login(expectedRole){

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const uid =
            userCredential.user.uid;

        const userDoc =
            await getDoc(
                doc(db, "users", uid)
            );

        if(!userDoc.exists()){

            alert(
                "User record not found"
            );

            return;

        }

        const userData =
            userDoc.data();

        if(
            userData.role !==
            expectedRole
        ){

            alert(
                "Invalid login type"
            );

            return;

        }

        localStorage.setItem(
            "userRole",
            userData.role
        );

        localStorage.setItem(
            "userEmail",
            userData.email
        );

        if(
            userData.role ===
            "admin"
        ){

            window.location.href =
                "admin-dashboard.html";

        }
        else{

            window.location.href =
                "gpt.html";

        }

    }
    catch(error){

        console.error(error);

        alert(error.message);

    }

}

document
.getElementById(
    "talathiLoginBtn"
)
.addEventListener(
    "click",
    () => login("talathi")
);

document
.getElementById(
    "adminLoginBtn"
)
.addEventListener(
    "click",
    () => login("admin")
);