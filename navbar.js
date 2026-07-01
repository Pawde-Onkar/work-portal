const page =
    window.location.pathname
    .split("/")
    .pop();

if(page === "gpt.html"){

    document
    .getElementById("navbar-home")
    ?.classList.add("active");

}

if(page === "field-visit-manager.html"|| page === "field-visit.html"){

    document
    .getElementById("navbar-visit")
    ?.classList.add("active");

}



if(page === "account.html"){

    document
    .getElementById("navbar-account")
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
const navbarLogoutBtn =
    document.getElementById(
        "navbar-logout"
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
if(navbarLogoutBtn){

    navbarLogoutBtn.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            localStorage.clear();

            window.location.href =
                "login.html";

        }
    );

}