// ======================================================
// FIREBASE IMPORTS
// ======================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// AUTH CHECK
// ======================================================




// ======================================================
// FORM
// ======================================================

const farmerForm =
    document.getElementById("farmerForm");


// ======================================================
// FORMAT DATE (MARATHI)
// ======================================================

function formatDate(dateString) {

    if (!dateString)
        return "-";

    return new Date(dateString)
        .toLocaleDateString(
            "mr-IN"
        );

}


// ======================================================
// CALCULATE TOTAL DAYS
// ======================================================

function calculateDuration(startDate, endDate) {

    if (!startDate || !endDate)
        return "-";

    const start =
        new Date(startDate);

    const end =
        new Date(endDate);

    const diff =
        Math.ceil(
            (end - start) /
            (1000 * 60 * 60 * 24)
        );

    return diff + " दिवस";

}


// ======================================================
// STATUS
// ======================================================

function getStatus(completionDate) {

    if (completionDate)
        return "मंजूर";

    return "प्रलंबित";

}


// ======================================================
// SAVE FARMER
// ======================================================

if (farmerForm) {

farmerForm.addEventListener(
"submit",
async (e) => {

e.preventDefault();

if (!validateDateOrder())
return;

const workType =
document.getElementById("workType").value;


// ====================================
// FERFAR DATES
// ====================================

let step1Date = "";
let step2Date = "";
let step3Date = "";

if (workType === "फेरफार") {

step1Date =
document.getElementById("step1Date").value;

step2Date =
document.getElementById("step2Date").value;

step3Date =
document.getElementById("step3Date").value;

}


// ====================================
// FARMER OBJECT
// ====================================

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
workType,

inputDate:
document.getElementById("inputDate").value,

step1Date:
step1Date,

step2Date:
step2Date,

step3Date:
step3Date,

approvedDate:
document.getElementById("approvedDate").value,

completionDate:
document.getElementById("completionDate").value,

remarks:
document.getElementById("remarks").value.trim(),

status:
getStatus(
document.getElementById("completionDate").value
)

};


// ====================================
// SAVE
// ====================================

try {

await addDoc(

collection(
db,
"farmers"
),

farmer

);

alert(
"शेतकऱ्याची माहिती यशस्वीरित्या सेव्ह झाली."
);

window.location.href =
"gpt.html";

}

catch (error) {

console.error(error);

alert(
"माहिती सेव्ह करताना त्रुटी आली."
);

}

});

}
// ==========================================
// DISPLAY FARMERS
// ==========================================

async function displayFarmers() {

    const tableBody =
        document.getElementById("tableBody");

    if (!tableBody) return;

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

    // -----------------------
    // SEARCH
    // -----------------------

    const searchValue =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    // -----------------------
    // STATUS FILTER
    // -----------------------

    const statusValue =
        document
        .getElementById("statusFilter")
        .value;

    farmers = farmers.filter(farmer => {

        const searchMatch =

            (farmer.farmerName || "")
.toLowerCase()
            .includes(searchValue);

        const statusMatch =

            statusValue === "All" ||

            farmer.status === statusValue;

        return searchMatch && statusMatch;

    });

    tableBody.innerHTML = "";

    if (farmers.length === 0) {

        tableBody.innerHTML = `

        <tr>

            <td colspan="13"
                style="text-align:center">

                कोणतीही नोंद उपलब्ध नाही.

            </td>

        </tr>

        `;

        return;

    }

    farmers.forEach(farmer => {

        //--------------------------------------------------
        // STATUS COLOR
        //--------------------------------------------------

        let statusClass =
            farmer.status === "मंजूर"
            ? "approved"
            : "pending";

        //--------------------------------------------------
        // DURATION
        //--------------------------------------------------

       let duration = calculateDuration(
    farmer.inputDate,
    farmer.completionDate
);


        //--------------------------------------------------
        // FERFAR CHECK
        //--------------------------------------------------

        const isFerfar =
            farmer.workType === "फेरफार";

        const step1 =
            isFerfar
            ? formatDate(farmer.step1Date)
            : "-";

        const step2 =
            isFerfar
            ? formatDate(farmer.step2Date)
            : "-";

        const step3 =
            isFerfar
            ? formatDate(farmer.step3Date)
            : "-";

        //--------------------------------------------------
        // TABLE
        //--------------------------------------------------

        tableBody.innerHTML += `

        <tr>

            <td>${farmer.farmerName}</td>

            <td>${farmer.phone}</td>

            <td>${farmer.village}</td>

            <td>${farmer.workType}</td>

            <td>${formatDate(farmer.inputDate)}</td>

            <td>${step1}</td>

            <td>${step2}</td>

            <td>${step3}</td>

            <td>${formatDate(farmer.approvedDate)}</td>

            <td>${formatDate(farmer.completionDate)}</td>

            <td>${duration}</td>

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

//
// ==========================================
// SEARCH
// ==========================================
//

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener(

        "input",

        displayFarmers

    );

}

//
// ==========================================
// STATUS FILTER
// ==========================================
//

const statusFilter =
    document.getElementById("statusFilter");

if (statusFilter) {

    statusFilter.addEventListener(

        "change",

        displayFarmers

    );

}
// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentEditId = null;
let currentFarmer = null;


// ==========================================
// EDIT FARMER
// ==========================================

async function editFarmer(id) {

    const docRef =
        doc(db, "farmers", id);

    const docSnap =
        await getDoc(docRef);

    if (!docSnap.exists()) {

        alert("Record not found.");
        return;

    }

    currentEditId = id;

    currentFarmer = {

        firestoreId: docSnap.id,

        ...docSnap.data()

    };

    //-------------------------------------------------
    // Fill Dates
    //-------------------------------------------------

    document.getElementById("editStep1").value =
        currentFarmer.step1Date || "";

    document.getElementById("editStep2").value =
        currentFarmer.step2Date || "";

    document.getElementById("editStep3").value =
        currentFarmer.step3Date || "";

    document.getElementById("editApproved").value =
        currentFarmer.approvedDate || "";

    const completionInput =
        document.getElementById("editCompletionDate");

    if (completionInput) {

        completionInput.value =
            currentFarmer.completionDate || "";

    }


    //-------------------------------------------------
    // Set Min Dates
    editStep2.min =
currentFarmer.step1Date || "";

editStep3.min =
currentFarmer.step2Date || "";

editApproved.min =
currentFarmer.step3Date || "";

if(editCompletion){

editCompletion.min =
currentFarmer.approvedDate || "";

}

    //-------------------------------------------------
    // Show / Hide Ferfar Steps
    //-------------------------------------------------

    const isFerfar =
        currentFarmer.workType === "फेरफार";

    const step1Group =
        document.getElementById("editStep1")
        .closest(".modal-group");

    const step2Group =
        document.getElementById("editStep2")
        .closest(".modal-group");

    const step3Group =
        document.getElementById("editStep3")
        .closest(".modal-group");

    if (isFerfar) {

        step1Group.style.display = "";
        step2Group.style.display = "";
        step3Group.style.display = "";

    }
    else {

        step1Group.style.display = "none";
        step2Group.style.display = "none";
        step3Group.style.display = "none";

    }

    document.getElementById("editModal").style.display =
        "block";

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    document.getElementById("editModal").style.display =
        "none";

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

        step3Date:
            document.getElementById("editStep3").value,

        approvedDate:
            document.getElementById("editApproved").value,

        completionDate:
            document.getElementById("editCompletionDate")
            ? document.getElementById("editCompletionDate").value
            : ""

    };

    //-------------------------------------------------
    // Non-Ferfar
    //-------------------------------------------------

    if (currentFarmer.workType !== "फेरफार") {

        updatedData.step1Date = "";
        updatedData.step2Date = "";
        updatedData.step3Date = "";

    }

    //-------------------------------------------------
    // Status
    //-------------------------------------------------

    updatedData.status =
        calculateStatus(updatedData);

    //-------------------------------------------------

    try {

    await updateDoc(
        doc(db, "farmers", currentEditId),
        updatedData
    );

    alert("माहिती अपडेट झाली.");

    closeModal();

} catch (e) {

    alert("Update failed.");

}

}


// ==========================================
// DELETE FARMER
// ==========================================

async function deleteFarmer(id) {

    const confirmDelete =

        confirm(

            "ही नोंद हटवायची आहे का?"

        );

    if (!confirmDelete) {

        return;

    }

try{

await deleteDoc( doc(db, "farmers", id));

alert("Deleted");

}

catch(e){

alert("Delete failed");

}
    displayFarmers();

}
// ==========================================
// EDIT DATE VALIDATION
// ==========================================

function validateEditDates() {

    const step1 =
        document.getElementById("editStep1").value;

    const step2 =
        document.getElementById("editStep2").value;

    const step3 =
        document.getElementById("editStep3").value;

    const approved =
        document.getElementById("editApproved").value;

    const completion =
        document.getElementById("editCompletionDate")
            ? document.getElementById("editCompletionDate").value
            : "";

    //--------------------------------------------------
    // Only Ferfar requires step validation
    //--------------------------------------------------

    if (currentFarmer.workType === "फेरफार") {

        if (
            step1 &&
            step2 &&
            new Date(step2) < new Date(step1)
        ) {

            alert("नोटीस तामील दिनांक फेरफार नोंद दिनांकापेक्षा कमी असू शकत नाही.");

            return false;

        }

        if (
            step2 &&
            step3 &&
            new Date(step3) < new Date(step2)
        ) {

            alert("मंजुरीसाठी सादर दिनांक नोटीस तामील दिनांकापेक्षा कमी असू शकत नाही.");

            return false;

        }

        if (
            step3 &&
            approved &&
            new Date(approved) < new Date(step3)
        ) {

            alert("मंजूर दिनांक मंजुरीसाठी सादर दिनांकापेक्षा कमी असू शकत नाही.");

            return false;

        }

    }

    //--------------------------------------------------
    // Completion Date
    //--------------------------------------------------

    if (
        approved &&
        completion &&
        new Date(completion) < new Date(approved)
    ) {

        alert("काम पूर्ण दिनांक मंजूर दिनांकापेक्षा कमी असू शकत नाही.");

        return false;

    }

    return true;

}


// ==========================================
// EDIT MODAL DATE RESTRICTIONS
// ==========================================

const editStep1 =
    document.getElementById("editStep1");

const editStep2 =
    document.getElementById("editStep2");

const editStep3 =
    document.getElementById("editStep3");

const editApproved =
    document.getElementById("editApproved");

const editCompletion =
    document.getElementById("editCompletionDate");

if (editStep1) {

    editStep1.addEventListener("change", () => {

        editStep2.min =
            editStep1.value;

    });

}

if (editStep2) {

    editStep2.addEventListener("change", () => {

        editStep3.min =
            editStep2.value;

    });

}

if (editStep3) {

    editStep3.addEventListener("change", () => {

        editApproved.min =
            editStep3.value;

    });

}

if (editApproved && editCompletion) {

    editApproved.addEventListener("change", () => {

        editCompletion.min =
            editApproved.value;

    });

}


// ==========================================
// NOTIFICATIONS
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

    const snapshot =
        await getDocs(q);

    snapshot.forEach(docSnap => {

        const farmer =
            docSnap.data();

        //--------------------------------------------------
        // Pending Approval
        //--------------------------------------------------

        if (
            !farmer.approvedDate
        ) {

            container.innerHTML += `

                <div class="notification-card">

                    <strong>
                        ${farmer.farmerName}
                    </strong>

                    यांचे काम मंजुरीसाठी प्रलंबित आहे.

                </div>

            `;

        }

        //--------------------------------------------------
        // Approved but not Completed
        //--------------------------------------------------

        else if (
            !farmer.completionDate
        ) {

            container.innerHTML += `

                <div class="notification-card">

                    <strong>
                        ${farmer.farmerName}
                    </strong>

                    यांचे काम पूर्ण करणे बाकी आहे.

                </div>

            `;

        }

    });

}


// ==========================================
// REALTIME LISTENER
// ==========================================

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


// ==========================================
// SEARCH EVENT
// ==========================================



if (searchInput) {

    searchInput.addEventListener(

        "input",

        displayFarmers

    );

}


// ==========================================
// FILTER EVENT
// ==========================================



if (statusFilter) {

    statusFilter.addEventListener(

        "change",

        displayFarmers

    );

}




// ==========================================
// INITIAL LOAD
// ==========================================

onAuthStateChanged(

    auth,

    user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        displayFarmers();

        checkNotifications();

        startRealtimeListener();

    }

);

function calculateStatus(data){

    return data.completionDate
        ? "मंजूर"
        : "प्रलंबित";

}
function validateDateOrder() {

    const workType =
        document.getElementById("workType").value;

    const step1 =
        document.getElementById("step1Date")?.value;

    const step2 =
        document.getElementById("step2Date")?.value;

    const step3 =
        document.getElementById("step3Date")?.value;

    const approved =
        document.getElementById("approvedDate").value;

    const completion =
        document.getElementById("completionDate").value;

    if (workType === "फेरफार") {

        if (step1 && step2 && step2 < step1) {
            alert("Step 2 cannot be before Step 1.");
            return false;
        }

        if (step2 && step3 && step3 < step2) {
            alert("Step 3 cannot be before Step 2.");
            return false;
        }

        if (step3 && approved && approved < step3) {
            alert("Approved Date cannot be before Step 3.");
            return false;
        }

    }

    if (approved && completion && completion < approved) {

        alert("Completion Date cannot be before Approved Date.");

        return false;

    }

    return true;
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

window.editFarmer = editFarmer;
window.closeModal = closeModal;
window.saveEdit = saveEdit;
window.deleteFarmer = deleteFarmer;