import { auth, db }
from "./firebase.js";

import {

    collection,
    getDocs,
    query,
    where

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let farmers = [];
let filteredFarmers = [];

// =======================
// LOAD FARMERS
// =======================

async function loadFarmers() {

    const snapshot =
        await getDocs(

            query(

                collection(db, "farmers"),

                where(
                    "ownerId",
                    "==",
                    auth.currentUser.uid
                )

            )

        );

    farmers = [];

    snapshot.forEach(doc => {

        farmers.push({

            firestoreId: doc.id,

            ...doc.data()

        });

    });

    filteredFarmers = [...farmers];

    loadVillages();

    loadWorkTypes();

    displayTable(filteredFarmers);

}

// =======================
// TABLE
// =======================

function displayTable(data) {

    const tbody =
        document.getElementById("tableBody");

    tbody.innerHTML = "";

    if (data.length === 0) {

        tbody.innerHTML =

        `
            <tr>

                <td colspan="4"
                    style="text-align:center;">

                    दिलेल्या फिल्टरनुसार कोणतीही माहिती उपलब्ध नाही

                </td>

            </tr>
        `;

        return;

    }

    data.forEach(farmer => {

        tbody.innerHTML +=

        `
            <tr>

                <td>${farmer.farmerName || "-"}</td>

                <td>${farmer.village || "-"}</td>

                <td>${farmer.inputDate || "-"}</td>

                <td>${farmer.status || "-"}</td>

            </tr>
        `;

    });

}

// =======================
// LOAD VILLAGES
// =======================

function loadVillages() {

    const villageSelect =
        document.getElementById("village");

    villageSelect.innerHTML =
        `<option value="All">सर्व</option>`;

    const villages =
        [...new Set(

            farmers.map(f => f.village)

        )];

    villages.sort();

    villages.forEach(v => {

        villageSelect.innerHTML +=

        `
            <option value="${v}">
                ${v}
            </option>
        `;

    });

}

// =======================
// LOAD WORK TYPES
// =======================

function loadWorkTypes() {

    const workSelect =
        document.getElementById("workType");

    workSelect.innerHTML =
        `<option value="All">सर्व</option>`;

    const works =
        [...new Set(

            farmers.map(f => f.workType)

        )];

    works.sort();

    works.forEach(w => {

        workSelect.innerHTML +=

        `
            <option value="${w}">
                ${w}
            </option>
        `;

    });

}

// =======================
// APPLY FILTER
// =======================

document
.getElementById("applyFilter")
.onclick = () => {


const fromDate = fromDateInput.value;
const toDate = toDateInput.value;

    const village =
        document.getElementById("village").value;

    const workType =
        document.getElementById("workType").value;

    const status =
        document.getElementById("status").value;
        

       


    filteredFarmers =
        farmers.filter(f => {

            let ok = true;

            if (
                fromDate &&
                f.inputDate &&
                f.inputDate < fromDate
            )
                ok = false;

            if (
                toDate &&
                f.inputDate &&
                f.inputDate > toDate
            )

                ok = false;

            if (

                village !== "All" &&
                f.village !== village

            )

                ok = false;

            if (

                workType !== "All" &&
                f.workType !== workType

            )

                ok = false;

            if (

                status !== "All" &&
                f.status !== status

            )

                ok = false;

            return ok;

        });

    displayTable(filteredFarmers);

    panel.classList.remove("active");

    overlay.classList.remove("active");

};

// =======================
// RESET FILTER
// =======================

document
.getElementById("resetFilter")
.onclick = () => {

    document.getElementById("fromDate").value = "";

    document.getElementById("toDate").value = "";
    toDateInput.min = "";

    document.getElementById("village").value = "All";

    document.getElementById("workType").value = "All";

    document.getElementById("status").value = "All";

    filteredFarmers = [...farmers];

    displayTable(filteredFarmers);

};

// =======================
// FILTER PANEL
// =======================

const filterBtn =
document.getElementById("filterBtn");

const panel =
document.getElementById("filterPanel");

const overlay =
document.getElementById("overlay");

const closeBtn =
document.getElementById("closePanel");

   const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");

fromDateInput.addEventListener("change", () => {
    toDateInput.min = fromDateInput.value;
});

filterBtn.onclick = () => {

    panel.classList.add("active");

    overlay.classList.add("active");

};

closeBtn.onclick = () => {

    panel.classList.remove("active");

    overlay.classList.remove("active");

};

overlay.onclick = () => {

    panel.classList.remove("active");

    overlay.classList.remove("active");

};

// =======================
// AUTH
// =======================

auth.onAuthStateChanged(user => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }

    loadFarmers();

});