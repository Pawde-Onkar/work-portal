// ==========================================
// GET FORM
// ==========================================

const farmerForm = document.getElementById("farmerForm");


// ==========================================
// SAVE FARMER DATA
// ==========================================

if (farmerForm) {

    farmerForm.addEventListener("submit", function (e) {

        e.preventDefault();
console.log("Form Submitted");
        // CREATE FARMER OBJECT

        const farmer = {

            id: Date.now(),

            farmerName: document.getElementById("farmerName").value,

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

        let farmers =
            JSON.parse(localStorage.getItem("farmers")) || [];

        // ADD NEW FARMER

        farmers.push(farmer);

        // SAVE TO LOCAL STORAGE

        localStorage.setItem(
            "farmers",
            JSON.stringify(farmers)
        );

        // SUCCESS MESSAGE

        alert("Farmer Data Saved Successfully!");
        window.location.href = "gpt.html";
        // RESET FORM

        farmerForm.reset();

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

function displayFarmers() {

    const tableBody =
        document.getElementById("tableBody");

    // STOP IF TABLE DOES NOT EXIST

    if (!tableBody) return;

    // GET FARMERS

    let farmers =
        JSON.parse(localStorage.getItem("farmers")) || [];

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
                        onclick="editFarmer(${farmer.id})"
                    >
                        Edit
                    </button>

                    <button 
                        class="action-btn delete-btn"
                        onclick="deleteFarmer(${farmer.id})"
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

let currentEditId = null;


// ==========================================
// OPEN EDIT MODAL
// ==========================================

function editFarmer(id) {

    let farmers =
        JSON.parse(localStorage.getItem("farmers")) || [];

    const farmer =
        farmers.find(f => f.id === id);

    currentEditId = id;

    // FILL INPUTS

    document.getElementById("editStep1").value =
        farmer.step1Date || "";

    document.getElementById("editStep2").value =
        farmer.step2Date || "";

    document.getElementById("editMutation").value =
        farmer.mutationDate || "";

    document.getElementById("editStep3").value =
        farmer.step3Date || "";

    document.getElementById("editApproved").value =
        farmer.approvedDate || "";

    // SHOW MODAL

    document.getElementById("editModal").style.display = "block";

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

function saveEdit() {

    let farmers =
        JSON.parse(localStorage.getItem("farmers")) || [];

    const farmer =
        farmers.find(f => f.id === currentEditId);

    // UPDATE VALUES

    farmer.step1Date =
        document.getElementById("editStep1").value;

    farmer.step2Date =
        document.getElementById("editStep2").value;

    farmer.mutationDate =
        document.getElementById("editMutation").value;

    farmer.step3Date =
        document.getElementById("editStep3").value;

    farmer.approvedDate =
        document.getElementById("editApproved").value;

    // UPDATE STATUS

    if (farmer.approvedDate) {

        farmer.status = "Approved";

    }

    else if (farmer.step3Date) {

        farmer.status = "Step 3 Completed";

    }

    else if (farmer.step2Date) {

        farmer.status = "Step 2 Completed";

    }

    else if (farmer.step1Date) {

        farmer.status = "Step 1 Completed";

    }

    else {

        farmer.status = "Pending";

    }

    // SAVE AGAIN

    localStorage.setItem(
        "farmers",
        JSON.stringify(farmers)
    );

    // CLOSE MODAL

    closeModal();

    // REFRESH TABLE

    displayFarmers();

}


// ==========================================
// DELETE FARMER
// ==========================================

function deleteFarmer(id) {

    const confirmDelete =
        confirm("Delete this farmer record?");

    if (!confirmDelete) return;

    let farmers =
        JSON.parse(localStorage.getItem("farmers")) || [];

    farmers =
        farmers.filter(f => f.id !== id);

    localStorage.setItem(
        "farmers",
        JSON.stringify(farmers)
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

displayFarmers();