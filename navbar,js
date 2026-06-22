const page =
    window.location.pathname
    .split("/")
    .pop();

if(page === "gpt.html"){

    document
    .getElementById("nav-home")
    ?.classList.add("active");

}

if(page === "field-visit-manager.html"){

    document
    .getElementById("nav-visit")
    ?.classList.add("active");

}

if(page === "notifications.html"){

    document
    .getElementById("nav-notification")
    ?.classList.add("active");

}

if(page === "account.html"){

    document
    .getElementById("nav-account")
    ?.classList.add("active");

}
import {
    auth
}
from "./firebase.js";

import {
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if(logoutBtn){

    logoutBtn.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            localStorage.clear();

            window.location.href =
                "login.html";

        }
    );

}