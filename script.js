import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, user => {

    if (!user) {

        window.location.href =
            "login.html";

    }

});

import { db, auth }
from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// ==========================================
// GET FORM
// ==========================================

const farmerForm = document.getElementById("farmerForm");


// ==========================================
// SAVE FARMER DATA
// ==========================================

if (farmerForm) {

    farmerForm.addEventListener("submit", async function (e) {

        e.preventDefault();
        if (!validateDateOrder()) {
    return;
}
console.log("Form Submitted");
        // CREATE FARMER OBJECT

        const farmer = {

            id: Date.now(),

            ownerId:
                auth.currentUser.uid,

            ownerEmail:
                auth.currentUser.email,

            farmerName:
                document.getElementById("farmerName").value,

            phone: document.getElementById("phone").value,

            village: document.getElementById("village").value,

            workType: document.getElementById("workType").value,

            inputDate: document.getElementById("inputDate").value,

            step1Date: document.getElementById("step1Date").value,

            step2Date: document.getElementById("step2Date").value,

            mutationDate: document.getElementById("mutationDate").value,

            step3Date: document.getElementById("step3Date").value,

            approvedDate: document.getElementById("approvedDate").value,

            remarks: document.getElementById("remarks").value,

            status: getStatus()

        };

        // GET OLD DATA

      try {

    await addDoc(
        collection(db, "farmers"),
        farmer
    );

    alert("Farmer Data Saved Successfully!");

    window.location.href = "gpt.html";

}
catch(error){

    console.error(error);

    alert("Error saving farmer data!");

}

    });

}


// ==========================================
// AUTO STATUS LOGIC
// ==========================================

function getStatus() {

    const approvedDate =
        document.getElementById("approvedDate").value;

    const step3Date =
        document.getElementById("step3Date").value;

    const step2Date =
        document.getElementById("step2Date").value;

    const step1Date =
        document.getElementById("step1Date").value;

    if (approvedDate) {

        return "Approved";

    }

    else if (step3Date) {

        return "Step 3 Completed";

    }

    else if (step2Date) {

        return "Step 2 Completed";

    }

    else if (step1Date) {

        return "Step 1 Completed";

    }

    else {

        return "Pending";

    }
}


// ==========================================
// DISPLAY FARMERS
// ==========================================

async function displayFarmers() {

    const tableBody =
        document.getElementById("tableBody");

    // STOP IF TABLE DOES NOT EXIST

    if (!tableBody) return;

    // GET FARMERS

  const q = query(

    collection(db, "farmers"),

    where(
        "ownerId",
        "==",
        auth.currentUser.uid
    )

);

const snapshot =
    await getDocs(q);

let farmers = [];

snapshot.forEach(doc => {

    farmers.push({

        firestoreId: doc.id,

        ...doc.data()

    });

});

    // SEARCH VALUE

    const searchInput =
        document.getElementById("searchInput");

    const searchValue =
        searchInput ?
        searchInput.value.toLowerCase() :
        "";

    // STATUS FILTER

    const statusFilter =
        document.getElementById("statusFilter");

    const statusValue =
        statusFilter ?
        statusFilter.value :
        "All";

    // FILTER LOGIC

    farmers = farmers.filter(farmer => {

        const matchSearch =
            farmer.farmerName
            .toLowerCase()
            .includes(searchValue);

        const matchStatus =
            statusValue === "All" ||
            farmer.status === statusValue;

        return matchSearch && matchStatus;

    });

    // CLEAR TABLE

    tableBody.innerHTML = "";

    // NO DATA

    if (farmers.length === 0) {

        tableBody.innerHTML = `

            <tr>
                <td colspan="12" style="text-align:center;">
                    No Farmer Records Found
                </td>
            </tr>

        `;

        return;
    }

    // SHOW DATA

    farmers.forEach(farmer => {

        let statusClass = "pending";

        if (farmer.status === "Approved") {

            statusClass = "approved";

        }

        else if (
            farmer.status === "Step 1 Completed" ||
            farmer.status === "Step 2 Completed" ||
            farmer.status === "Step 3 Completed"
        ) {

            statusClass = "progress";

        }

        tableBody.innerHTML += `

            <tr>

                <td>${farmer.farmerName}</td>

                <td>${farmer.phone}</td>

                <td>${farmer.village}</td>

                <td>${farmer.workType}</td>

                <td>${farmer.inputDate || "-"}</td>

                <td>${farmer.step1Date || "-"}</td>

                <td>${farmer.step2Date || "-"}</td>

                <td>${farmer.mutationDate || "-"}</td>

                <td>${farmer.step3Date || "-"}</td>

                <td>${farmer.approvedDate || "-"}</td>

                <td>
                    <span class="status ${statusClass}">
                        ${farmer.status}
                    </span>
                </td>

                <td>

                    <button 
                        class="action-btn edit-btn"
                       onclick="editFarmer('${farmer.firestoreId}')"
                    >
                        Edit
                    </button>

                    <button 
                        class="action-btn delete-btn"
                        onclick="deleteFarmer('${farmer.firestoreId}')"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;
    });

}


// ==========================================
// GLOBAL EDIT ID
// ==========================================




// ==========================================
// OPEN EDIT MODAL
// ==========================================

let currentFarmer = null;
let currentEditId = null;

async function editFarmer(id) {

    const docRef =
        doc(db, "farmers", id);

    const docSnap =
        await getDoc(docRef);

    if (!docSnap.exists()) {

        alert("Farmer not found!");

        return;

    }

    currentFarmer = {

        firestoreId: docSnap.id,

        ...docSnap.data()

    };

    currentEditId = id;

    document.getElementById("editStep1").value =
        currentFarmer.step1Date || "";

    document.getElementById("editStep2").value =
        currentFarmer.step2Date || "";

    document.getElementById("editMutation").value =
        currentFarmer.mutationDate || "";

    document.getElementById("editStep3").value =
        currentFarmer.step3Date || "";

    document.getElementById("editApproved").value =
        currentFarmer.approvedDate || "";

    document.getElementById("editModal").style.display =
        "block";

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    document.getElementById("editModal").style.display = "none";

}


// ==========================================
// SAVE EDIT
// ==========================================
async function saveEdit() {

    if (!validateEditDates()) {
        return;
    }

    const updatedData = {

        step1Date:
            document.getElementById("editStep1").value,

        step2Date:
            document.getElementById("editStep2").value,

        mutationDate:
            document.getElementById("editMutation").value,

        step3Date:
            document.getElementById("editStep3").value,

        approvedDate:
            document.getElementById("editApproved").value

    };

    if (updatedData.approvedDate) {

        updatedData.status = "Approved";

    }

    else if (updatedData.step3Date) {

        updatedData.status = "Step 3 Completed";

    }

    else if (updatedData.step2Date) {

        updatedData.status = "Step 2 Completed";

    }

    else if (updatedData.step1Date) {

        updatedData.status = "Step 1 Completed";

    }

    else {

        updatedData.status = "Pending";

    }

    await updateDoc(

        doc(db, "farmers", currentEditId),

        updatedData

    );

    closeModal();

    displayFarmers();
}


// ==========================================
// DELETE FARMER
// ==========================================

async function deleteFarmer(id) {

    const confirmDelete =
        confirm("Delete this farmer record?");

    if (!confirmDelete) return;

    await deleteDoc(
        doc(db, "farmers", id)
    );

    displayFarmers();
}


// ==========================================
// SEARCH EVENT
// ==========================================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayFarmers
    );

}


// ==========================================
// FILTER EVENT
// ==========================================

const statusFilter =
    document.getElementById("statusFilter");

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        displayFarmers
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================


// ==========================================
// EXPORT CSV / EXCEL
// ==========================================

async function exportCSV() {

    const snapshot =
        await getDocs(
            collection(db, "farmers")
        );

    let farmers = [];

    snapshot.forEach(doc => {

        farmers.push({

            firestoreId: doc.id,

            ...doc.data()

        });

    });

    // NO DATA

    if (farmers.length === 0) {

        alert("No farmer data available!");

        return;
    }

    // CSV HEADERS

    let csv =
        "Farmer Name,Phone,Village,Work Type,Input Date,Step1 Date,Step2 Date,Mutation Date,Step3 Date,Approved Date,Status,Remarks\n";

    // ADD FARMER DATA

    farmers.forEach(farmer => {

        csv +=
            `"${farmer.farmerName || ""}",` +
            `"${farmer.phone || ""}",` +
            `"${farmer.village || ""}",` +
            `"${farmer.workType || ""}",` +
            `"${farmer.inputDate || ""}",` +
            `"${farmer.step1Date || ""}",` +
            `"${farmer.step2Date || ""}",` +
            `"${farmer.mutationDate || ""}",` +
            `"${farmer.step3Date || ""}",` +
            `"${farmer.approvedDate || ""}",` +
            `"${farmer.status || ""}",` +
            `"${farmer.remarks || ""}"\n`;

    });

    // CREATE FILE

    const blob =
        new Blob(
            [csv],
            { type: "text/csv" }
        );

    const url =
        window.URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "Farmer_Records.csv";

    a.click();

    window.URL.revokeObjectURL(url);

}
// ==========================================
// PRINT / PDF DOWNLOAD
// ==========================================

function printPDF() {

    window.print();

}
// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

const delays = {

    step1: 0,
    step2: 0,
    mutation: 0,
    step3: 0

};


// ==========================================
// CHECK NOTIFICATIONS
// ==========================================
async function checkNotifications() {

    const container =
        document.getElementById(
            "notificationContainer"
        );

    if (!container) return;

    container.innerHTML = "";

   const q = query(
    collection(db, "farmers"),
    where(
        "ownerId",
        "==",
        auth.currentUser.uid
    )
);

const snapshot = await getDocs(q);

    let farmers = [];

    snapshot.forEach(doc => {

        farmers.push({

            firestoreId: doc.id,

            ...doc.data()

        });

    });

    const today =
        new Date();

    farmers.forEach(farmer => {

        // STEP 1 → STEP 2

        if (
            farmer.step1Date &&
            !farmer.step2Date
        ) {

            const step1 =
                new Date(
                    farmer.step1Date
                );

            const diffDays =
                (today - step1) /
                (1000 * 60 * 60 * 24);

            if (
                diffDays >= delays.step1
            ) {

                container.innerHTML += `

                    <div class="notification-card">

                        <strong>
                            ${farmer.farmerName}
                        </strong>

                        is ready for Step 2 Process.

                    </div>

                `;
            }
        }

        // STEP 2 → MUTATION

        if (
            farmer.step2Date &&
            !farmer.mutationDate
        ) {

            const step2 =
                new Date(
                    farmer.step2Date
                );

            const diffDays =
                (today - step2) /
                (1000 * 60 * 60 * 24);

            if (
                diffDays >= delays.step2
            ) {

                container.innerHTML += `

                    <div class="notification-card">

                        <strong>
                            ${farmer.farmerName}
                        </strong>

                        is ready for Mutation Process.

                    </div>

                `;
            }
        }

        // MUTATION → STEP 3

        if (
            farmer.mutationDate &&
            !farmer.step3Date
        ) {

            const mutation =
                new Date(
                    farmer.mutationDate
                );

            const diffDays =
                (today - mutation) /
                (1000 * 60 * 60 * 24);

            if (
                diffDays >= delays.mutation
            ) {

                container.innerHTML += `

                    <div class="notification-card">

                        <strong>
                            ${farmer.farmerName}
                        </strong>

                        is ready for Step 3 Process.

                    </div>

                `;
            }
        }
        // STEP 3 → APPROVAL

if (
    farmer.step3Date &&
    !farmer.approvedDate
) {

    const step3 =
        new Date(
            farmer.step3Date
        );

    const diffDays =
        (today - step3) /
        (1000 * 60 * 60 * 24);

    if (
        diffDays >= delays.step3
    ) {

        container.innerHTML += `

            <div class="notification-card">

                <strong>
                    ${farmer.farmerName}
                </strong>

                is ready for Approval Process.

            </div>

        `;
    }
}

    });

}
// ==========================================
// ==========================================
// DATE ORDER VALIDATION
// ==========================================

function validateDateOrder() {

    const inputDate =
        document.getElementById("inputDate").value;

    const step1Date =
        document.getElementById("step1Date").value;

    const step2Date =
        document.getElementById("step2Date").value;

    const mutationDate =
        document.getElementById("mutationDate").value;

    const step3Date =
        document.getElementById("step3Date").value;

    const approvedDate =
        document.getElementById("approvedDate").value;


    if (
        step1Date &&
        new Date(step1Date) < new Date(inputDate)
    ) {
        alert("Step 1 Date cannot be before Input Date.");
        return false;
    }

    if (
        step2Date &&
        new Date(step2Date) < new Date(step1Date)
    ) {
        alert("Step 2 Date cannot be before Step 1 Date.");
        return false;
    }

    if (
        mutationDate &&
        new Date(mutationDate) < new Date(step2Date)
    ) {
        alert("Mutation Date cannot be before Step 2 Date.");
        return false;
    }

    if (
        step3Date &&
        new Date(step3Date) < new Date(mutationDate)
    ) {
        alert("Step 3 Date cannot be before Mutation Date.");
        return false;
    }

    if (
        approvedDate &&
        new Date(approvedDate) < new Date(step3Date)
    ) {
        alert("Approved Date cannot be before Step 3 Date.");
        return false;
    }

    return true;
}
// ==========================================
// EDIT DATE VALIDATION
// ==========================================

function validateEditDates() {

    const step1 =
        document.getElementById("editStep1").value;

    const step2 =
        document.getElementById("editStep2").value;

    const mutation =
        document.getElementById("editMutation").value;

    const step3 =
        document.getElementById("editStep3").value;

    const approved =
        document.getElementById("editApproved").value;

    if (
        step1 &&
        step2 &&
        new Date(step2) < new Date(step1)
    ) {
        alert("Step 2 Date cannot be before Step 1 Date.");
        return false;
    }

    if (
        step2 &&
        mutation &&
        new Date(mutation) < new Date(step2)
    ) {
        alert("Mutation Date cannot be before Step 2 Date.");
        return false;
    }

    if (
        mutation &&
        step3 &&
        new Date(step3) < new Date(mutation)
    ) {
        alert("Step 3 Date cannot be before Mutation Date.");
        return false;
    }

    if (
        step3 &&
        approved &&
        new Date(approved) < new Date(step3)
    ) {
        alert("Approved Date cannot be before Step 3 Date.");
        return false;
    }

    return true;
}
// ==========================================
// EDIT MODAL DATE CHAIN
// ==========================================

const editStep1 =
    document.getElementById("editStep1");

const editStep2 =
    document.getElementById("editStep2");

const editMutation =
    document.getElementById("editMutation");

const editStep3 =
    document.getElementById("editStep3");

const editApproved =
    document.getElementById("editApproved");

if (editStep1) {

    editStep1.addEventListener("change", () => {

        editStep2.min = editStep1.value;

    });

    editStep2.addEventListener("change", () => {

        editMutation.min = editStep2.value;

    });

    editMutation.addEventListener("change", () => {

        editStep3.min = editMutation.value;

    });

    editStep3.addEventListener("change", () => {

        editApproved.min = editStep3.value;

    });

}
// ==========================================
// ADD FARMER DATE CHAIN
// ==========================================

const inputDate = document.getElementById("inputDate");
const step1Date = document.getElementById("step1Date");
const step2Date = document.getElementById("step2Date");
const mutationDate = document.getElementById("mutationDate");
const step3Date = document.getElementById("step3Date");
const approvedDate = document.getElementById("approvedDate");

if (inputDate) {

    inputDate.addEventListener("change", () => {
        step1Date.min = inputDate.value;
    });

    step1Date.addEventListener("change", () => {
        step2Date.min = step1Date.value;
    });

    step2Date.addEventListener("change", () => {
        mutationDate.min = step2Date.value;
    });

    mutationDate.addEventListener("change", () => {
        step3Date.min = mutationDate.value;
    });

    step3Date.addEventListener("change", () => {
        approvedDate.min = step3Date.value;
    });

}
// ==========================================
// BACKUP DATA
// ==========================================

async function backupData() {

    const snapshot =
        await getDocs(
            collection(db, "farmers")
        );

    let farmers = [];

    snapshot.forEach(doc => {

        farmers.push({

            ...doc.data()

        });

    });

    if (farmers.length === 0) {

        alert("No data available for backup!");

        return;

    }

    const jsonData =
        JSON.stringify(
            farmers,
            null,
            2
        );

    const blob =
        new Blob(
            [jsonData],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    a.download =
        `farmers_backup_${today}.json`;

    a.click();

    URL.revokeObjectURL(url);

}// ==========================================
// RESTORE DATA
// ==========================================

const restoreFile =
    document.getElementById("restoreFile");

if (restoreFile) {

    restoreFile.addEventListener("change", restoreData);

}


function restoreData(event) {

    const file =
        event.target.files[0];

    // NO FILE

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = async function(e) {

    try {

        const farmers =
            JSON.parse(
                e.target.result
            );

        if (
            !Array.isArray(
                farmers
            )
        ) {

            alert(
                "Invalid backup file!"
            );

            return;

        }

        const confirmRestore =
            confirm(
                "Restore backup data?"
            );

        if (!confirmRestore)
            return;

        for (
            const farmer
            of farmers
        ) {

            await addDoc(

                collection(
                    db,
                    "farmers"
                ),

                farmer

            );

        }

        alert(
            "Backup Restored Successfully!"
        );

        location.reload();

    }

    catch(error) {

        console.error(
            error
        );

        alert(
            "Invalid backup file!"
        );

    }

};

    reader.readAsText(file);

}
function startRealtimeListener() {

    const q = query(
        collection(db, "farmers"),
        where(
            "ownerId",
            "==",
            auth.currentUser.uid
        )
    );

    onSnapshot(q, () => {

        displayFarmers();
        checkNotifications();

    });

}


window.editFarmer = editFarmer;
window.deleteFarmer = deleteFarmer;
window.saveEdit = saveEdit;
window.closeModal = closeModal;
window.exportCSV = exportCSV;
window.backupData = backupData;
window.restoreData = restoreData;
window.printPDF = printPDF;
onAuthStateChanged(auth, user => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    displayFarmers();
    checkNotifications();
    startRealtimeListener();

});