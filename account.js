import { auth, db }
from "./firebase.js";

import {
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadAccount() {

    const user =
        auth.currentUser;

    if(!user){

        window.location.href =
            "login.html";

        return;
    }

    const userDoc =
        await getDoc(
            doc(
                db,
                "users",
                user.uid
            )
        );

    if(userDoc.exists()){

        const data =
            userDoc.data();

        document.getElementById(
            "userName"
        ).textContent =
            data.name || "Talathi";

        document.getElementById(
            "userEmail"
        ).textContent =
            data.email;

        document.getElementById(
            "userRole"
        ).textContent =
            data.role;
    }

    // Farmer Count

    const farmerQuery =
        query(
            collection(
                db,
                "farmers"
            ),
            where(
                "createdBy",
                "==",
                user.uid
            )
        );

    const farmerSnapshot =
        await getDocs(
            farmerQuery
        );

    document.getElementById(
        "farmerCount"
    ).textContent =
        farmerSnapshot.size;

    // Field Visit Count
    // currently total visits

    const visitSnapshot =
        await getDocs(
            collection(
                db,
                "fieldVisits"
            )
        );

    document.getElementById(
        "visitCount"
    ).textContent =
        visitSnapshot.size;
}

auth.onAuthStateChanged(
    user => {

        if(user){

            loadAccount();

        }

    }
);

document
.getElementById(
    "logoutBtn"
)
.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.href =
            "login.html";

    }
);
document
.getElementById(
    "backBtn"
)
.addEventListener(
    "click",
    () => {
        window.location.href = "gpt.html";
    }
);
