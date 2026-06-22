import { auth, db }
from "./firebase.js";

import {
    createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document
.getElementById("signupBtn")
.addEventListener(
    "click",
    async () => {
        const name =
    document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            await setDoc(

                doc(
                    db,
                    "users",
                    userCredential.user.uid
                ),
                {
                    name: name,

                    email: email,

                    role: "talathi",

                    createdAt:
                        new Date().toISOString()
                }

            );

            alert(
                "Account Created Successfully"
            );

            window.location.href =
                "login.html";

        }
        catch(error){

            console.error(error);

            alert(error.message);

        }

    }
);