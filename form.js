// =============================================
// IMPORTS
// =============================================

import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =============================================
// AUTHENTICATION
// =============================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

});


// =============================================
// LOGOUT
// =============================================

const logoutBtn = document.getElementById("navbar-logout");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        const confirmLogout =
            confirm("तुम्हाला खात्री आहे का?");

        if (!confirmLogout) return;

        try {

            await signOut(auth);

            window.location.href = "login.html";

        }
        catch (error) {

            console.error(error);

            alert("Logout Failed.");

        }

    });

}


// =============================================
// GET STATUS
// =============================================

function getStatus() {

    const approvedDate =
        document.getElementById("approvedDate").value;

    if (approvedDate) {

        return "मंजूर";

    }

    return "प्रलंबित";

}


// =============================================
// SAVE FARMER DATA
// =============================================

const farmerForm =
    document.getElementById("farmerForm");

if (farmerForm) {

    farmerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        // Date validation
        if (!validateDateOrder()) {
            return;
        }

        try {

            const farmer = {

                ownerId:
                    auth.currentUser.uid,

                ownerEmail:
                    auth.currentUser.email,

                farmerName:
                    document.getElementById("farmerName").value.trim(),

                phone:
                    document.getElementById("phone").value.trim(),

                village:
                    document.getElementById("village").value,

                workType:
                    document.getElementById("workType").value,

                inputDate:
                    document.getElementById("inputDate").value,

                step1Date:
                    document.getElementById("step1Date").value,

                step2Date:
                    document.getElementById("step2Date").value,

                step3Date:
                    document.getElementById("step3Date").value,

                approvedDate:
                    document.getElementById("approvedDate").value,

                completionDate:
                    document.getElementById("completionDate").value,

                remarks:
                    document.getElementById("remarks").value.trim(),

                status:
                    getStatus(),

                createdAt:
                    new Date().toISOString()

            };

            await addDoc(
                collection(db, "farmers"),
                farmer
            );

            alert("शेतकऱ्याची माहिती यशस्वीरित्या सेव्ह झाली.");

            farmerForm.reset();

            window.location.href = "gpt.html";

        }
        catch (error) {

            console.error(error);

            alert("डेटा सेव्ह करताना त्रुटी आली.");

        }

    });

}
// =============================================
// DATE VALIDATION
// =============================================

function validateDateOrder() {
    const workType = document.getElementById("workType").value;

    const inputDate =
        document.getElementById("inputDate").value;

    const step1Date =
        document.getElementById("step1Date").value;

    const step2Date =
        document.getElementById("step2Date").value;

    const step3Date =
        document.getElementById("step3Date").value;

    const approvedDate =
        document.getElementById("approvedDate").value;

    const completionDate =
        document.getElementById("completionDate").value;


    if (workType === "फेरफार") {

    if (step1Date && new Date(step1Date) < new Date(inputDate)) {
        alert("फेरफार नोंद दिनांक प्राप्त दिनांकापेक्षा आधी असू शकत नाही.");
        return false;
    }

    if (step2Date && new Date(step2Date) < new Date(step1Date)) {
        alert("नोटीस तामील दिनांक फेरफार नोंद दिनांकापेक्षा आधी असू शकत नाही.");
        return false;
    }

    if (step3Date && new Date(step3Date) < new Date(step2Date)) {
        alert("मंजुरीसाठी सादर केलेला दिनांक नोटीस तामील दिनांकापेक्षा आधी असू शकत नाही.");
        return false;
    }

    if (approvedDate && new Date(approvedDate) < new Date(step3Date)) {
        alert("मंजूर दिनांक मंजुरीसाठी सादर केलेल्या दिनांकापेक्षा आधी असू शकत नाही.");
        return false;
    }

} else {

    if (approvedDate && new Date(approvedDate) < new Date(inputDate)) {
        alert("मंजूर दिनांक प्राप्त दिनांकापेक्षा आधी असू शकत नाही.");
        return false;
    }
      

}
 return true;
}



// =============================================
// DATE RESTRICTIONS
// =============================================

const inputDate =
    document.getElementById("inputDate");

const step1Date =
    document.getElementById("step1Date");

const step2Date =
    document.getElementById("step2Date");

const step3Date =
    document.getElementById("step3Date");

const approvedDate =
    document.getElementById("approvedDate");

const completionDate =
    document.getElementById("completionDate");


// Today's date

const today =
    new Date().toISOString().split("T")[0];

[
    inputDate,
    step1Date,
    step2Date,
    step3Date,
    approvedDate,
    completionDate
].forEach(dateInput => {

    if (dateInput) {

        dateInput.max = today;

    }

});


// Date chain

if (inputDate) {

    inputDate.addEventListener("change", () => {

        step1Date.min =
            inputDate.value;

    });

}

if (step1Date) {

    step1Date.addEventListener("change", () => {

        step2Date.min =
            step1Date.value;

    });

}

if (step2Date) {

    step2Date.addEventListener("change", () => {

        step3Date.min =
            step2Date.value;

    });

}

if (step3Date) {

    step3Date.addEventListener("change", () => {

        approvedDate.min =
            step3Date.value;

    });

}

if (approvedDate) {

    approvedDate.addEventListener("change", () => {

        completionDate.min =
            approvedDate.value;

    });

}



// =============================================
// PHONE VALIDATION
// =============================================

const phone =
    document.getElementById("phone");

if (phone) {

    phone.addEventListener("input", () => {

        phone.value =
            phone.value.replace(/\D/g, "");

    });

}



// =============================================
// NAME VALIDATION
// =============================================

const farmerName =
    document.getElementById("farmerName");

if (farmerName) {

    farmerName.addEventListener("input", () => {

        farmerName.value =
            farmerName.value.replace(/\s{2,}/g, " ");

    });

}



// =============================================
// PAGE LOADED
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Farmer Form Ready");

});

const workTypeSelect = document.getElementById("workType");
const ferfarFields = document.getElementById("ferfarFields");

function toggleFerfarFields() {

    if (!workTypeSelect || !ferfarFields) return;

    const isFerfar = workTypeSelect.value === "फेरफार";

    if (isFerfar) {

        ferfarFields.style.display = "contents";

    } else {

        ferfarFields.style.display = "none";

        document.getElementById("step1Date").value = "";
        document.getElementById("step2Date").value = "";
        document.getElementById("step3Date").value = "";

    }

}

workTypeSelect.addEventListener("change", toggleFerfarFields);

toggleFerfarFields();