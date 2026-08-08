// ======================================================
// FIREBASE IMPORTS
// ======================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let allFarmers = [];

let filteredFarmers = [];

let currentView = "farmer";


// ======================================================
// DOM ELEMENTS
// ======================================================
// ==========================================
// CURRENT REPORT
// ==========================================

let currentReport = "farmers";

const tabButtons =
document.querySelectorAll(".tab-btn");

const tableBody =
    document.getElementById("tableBody");

const villageSelect =
    document.getElementById("village");

const workTypeSelect =
    document.getElementById("workType");

const statusSelect =
    document.getElementById("status");

const fromDate =
    document.getElementById("fromDate");

const toDate =
    document.getElementById("toDate");


// Dashboard

const totalWorks =
document.getElementById("totalFarmers");

const pendingWorks =
document.getElementById("pendingCount");

const completedWorks =
document.getElementById("completedCount");

const ferfarWorks =
document.getElementById("ferfarCount");

const otherWorks =
document.getElementById("otherCount");

const villagesCount =
document.getElementById("villageCount");

// ======================================================
// AUTH CHECK
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    await loadFarmers(user.uid);

});
// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date){

    if(!date) return "-";

    return new Date(date)
        .toLocaleDateString("mr-IN");

}

fromDate.addEventListener("change", () => {

    // User cannot select an earlier end date
    toDate.min = fromDate.value;

    // If end date is already smaller, clear it
    if (toDate.value && toDate.value < fromDate.value) {
        toDate.value = "";
    }

});

// ======================================================
// DURATION
// ======================================================

function calculateDuration(start,end){

    if(!start || !end) return "-";

    const diff =
        Math.ceil(

            (new Date(end)-new Date(start))

            /(1000*60*60*24)

        );

    return diff+" दिवस";

}
// ======================================================
// LOAD ALL FARMERS
// ======================================================

async function loadFarmers(uid){

    const q = query(

        collection(db,"farmers"),

        where("ownerId","==",uid)

    );

    const snapshot = await getDocs(q);

    allFarmers = [];

    snapshot.forEach(doc=>{

        allFarmers.push({

            firestoreId:doc.id,

            ...doc.data()

        });

    });

 
    filteredFarmers = [...allFarmers];

    updateDashboard();

    

    renderCurrentView();

}

  // ======================================================
// UPDATE DASHBOARD
// ======================================================

function updateDashboard() {
    if (otherWorks)
    otherWorks.textContent =
        allFarmers.filter(f =>
            f.workType !== "फेरफार"
        ).length;

    if (totalWorks)
        totalWorks.textContent = allFarmers.length;

    if (pendingWorks)
        pendingWorks.textContent =
            allFarmers.filter(f =>
                f.status === "प्रलंबित"
            ).length;

    if (completedWorks)
        completedWorks.textContent =
            allFarmers.filter(f =>
                f.status === "मंजूर"
            ).length;

    if (ferfarWorks)
        ferfarWorks.textContent =
            allFarmers.filter(f =>
                f.workType === "फेरफार"
            ).length;

    if (villagesCount) {

        const villages = new Set();

        allFarmers.forEach(f => {

            if (f.village)
                villages.add(f.village);

        });

        villagesCount.textContent =
            villages.size;

    }

}

const cardAll =
document.getElementById("cardAll");

const cardPending =
document.getElementById("cardPending");

const cardApproved =
document.getElementById("cardApproved");

const cardFerfar =
document.getElementById("cardFerfar");

const cardOther =
document.getElementById("cardOther");

const cardVillage =
document.getElementById("cardVillage");


cardAll.addEventListener("click",()=>{

    filteredFarmers=[...allFarmers];

    currentReport="farmers";

    document.querySelector('[data-report="farmers"]')
        .click();

});

cardPending.addEventListener("click",()=>{

    filteredFarmers=

    allFarmers.filter(f=>

        f.status==="प्रलंबित"

    );

    document.querySelector('[data-report="farmers"]')
        .click();

});

cardApproved.addEventListener("click",()=>{

    filteredFarmers=

    allFarmers.filter(f=>

        f.status==="मंजूर"

    );

    document.querySelector('[data-report="farmers"]')
        .click();

});

cardFerfar.addEventListener("click",()=>{

    filteredFarmers=

    allFarmers.filter(f=>

        f.workType==="फेरफार"

    );

    document.querySelector('[data-report="farmers"]')
        .click();

});

cardOther.addEventListener("click",()=>{

    filteredFarmers=

    allFarmers.filter(f=>

        f.workType!=="फेरफार"

    );

    document.querySelector('[data-report="farmers"]')
        .click();

});

cardVillage.addEventListener("click",()=>{

    filteredFarmers=[...allFarmers];

    document.querySelector('[data-report="villages"]')
        .click();

});
// ======================================================
// POPULATE FILTERS
// ======================================================


// ======================================================
// FILTER POPUP
// ======================================================

const overlay =
    document.getElementById("overlay");

const filterPanel =
    document.getElementById("filterPanel");

const filterBtn =
    document.getElementById("filterBtn");

const closePanel =
    document.getElementById("closePanel");

if(filterBtn){

    filterBtn.addEventListener("click",()=>{

        overlay.style.display="block";

        filterPanel.classList.add("show");

    });

}

if(closePanel){

    closePanel.addEventListener("click",closeFilter);

}

if(overlay){

    overlay.addEventListener("click",closeFilter);

}

function closeFilter(){

    overlay.style.display="none";

    filterPanel.classList.remove("show");

}
// ======================================================
// APPLY FILTER
// ======================================================

const applyFilter =
    document.getElementById("applyFilter");

if(applyFilter){

    applyFilter.addEventListener(

        "click",

        applyFilters

    );

}

function applyFilters(){

    filteredFarmers=[...allFarmers];

    //---------------------------------------------------
    // Date
    //---------------------------------------------------

    const from=fromDate.value;

    const to=toDate.value;

    if(from){

        filteredFarmers=

        filteredFarmers.filter(f=>

            f.inputDate>=from

        );

    }

    if(to){

        filteredFarmers=

        filteredFarmers.filter(f=>

            f.inputDate<=to

        );

    }

    //---------------------------------------------------
    // Status
    //---------------------------------------------------

    if(statusSelect.value!="All"){

        filteredFarmers=

        filteredFarmers.filter(f=>

            f.status===statusSelect.value

        );

    }

    //---------------------------------------------------
    // Village
    //---------------------------------------------------

    if(villageSelect.value!="All"){

        filteredFarmers=

        filteredFarmers.filter(f=>

            f.village===villageSelect.value

        );

    }

    //---------------------------------------------------
    // Work Type
    //---------------------------------------------------

    if(workTypeSelect.value!="All"){

        filteredFarmers=

        filteredFarmers.filter(f=>

            f.workType===workTypeSelect.value

        );

    }

    closeFilter();

    renderCurrentView();

}
// ======================================================
// RESET FILTER
// ======================================================

const resetFilter=
document.getElementById("resetFilter");

if(resetFilter){

    resetFilter.addEventListener(

        "click",

        ()=>{

            fromDate.value="";

            toDate.value="";

            villageSelect.value="All";

            workTypeSelect.value="All";

            statusSelect.value="All";

            filteredFarmers=[...allFarmers];

            renderCurrentView();

            closeFilter();

        }

    );

}
// ======================================================
// CURRENT VIEW
// ======================================================

// ==========================================
// RENDER CURRENT VIEW
// ==========================================

function renderCurrentView(){

    switch(currentReport){

        case "farmers":

            displayFarmerTable();

            break;

        case "villages":

            displayVillageSummary();

            break;

        case "worktypes":

            displayWorkTypeSummary();

            break;

    }

}
 
// ======================================================
// FARMER REPORT TABLE
// ======================================================

function displayFarmerTable() {

    if (!tableBody) return;
    document.getElementById("tableHead").innerHTML = `

<tr>

<th>अ. क्र.</th>

<th>शेतकरी</th>

<th>गाव</th>

<th>कामाचा प्रकार</th>

<th>अर्ज दिनांक</th>

<th>मंजूर दिनांक</th>

<th>पूर्ण दिनांक</th>

<th>कालावधी</th>

<th>स्थिती</th>

<th>टिप्पणी</th>

</tr>

`;

    tableBody.innerHTML = "";

    //--------------------------------------------------
    // No Records
    //--------------------------------------------------

    if (filteredFarmers.length === 0) {

       let html = "";

filteredFarmers.forEach(farmer => {

    html += `
    <tr>
        ...
    </tr>
    `;

});

tableBody.innerHTML = html;

        return;

    }

    //--------------------------------------------------
    // Rows
    //--------------------------------------------------

    filteredFarmers.forEach((farmer, index) => {

        const duration =
            calculateDuration(
                farmer.inputDate,
                farmer.completionDate
            );

        const statusClass =

            farmer.status === "मंजूर"

                ? "approved"

                : "pending";

        tableBody.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${farmer.farmerName}</td>

            <td>${farmer.village}</td>

            <td>${farmer.workType}</td>

            <td>${formatDate(farmer.inputDate)}</td>

            <td>${formatDate(farmer.approvedDate)}</td>

            <td>${formatDate(farmer.completionDate)}</td>

            <td>${duration}</td>

            <td>

                <span class="status ${statusClass}">

                    ${farmer.status}

                </span>

            </td>

            <td>${farmer.remarks || "-"}</td>

        </tr>

        `;

    });

}

// ==========================================
// VILLAGE SUMMARY
// ==========================================

function displayVillageSummary() {

    document.getElementById("tableHead").innerHTML = `

    <tr>

        <th>अ. क्र.</th>

        <th>गाव</th>

        <th>एकूण प्रकरणे</th>

        <th>मंजूर</th>

        <th>प्रलंबित</th>

        <th>फेरफार</th>

        <th>इतर</th>

    </tr>

    `;

    tableBody.innerHTML = "";

    const villageMap = {};

    filteredFarmers.forEach(farmer => {

        const village = farmer.village || "अज्ञात";

        if (!villageMap[village]) {

            villageMap[village] = {

                total: 0,

                approved: 0,

                pending: 0,

                ferfar: 0,

                other: 0

            };

        }

        villageMap[village].total++;

        if (farmer.status === "मंजूर")
            villageMap[village].approved++;
        else
            villageMap[village].pending++;

        if (farmer.workType === "फेरफार")
            villageMap[village].ferfar++;
        else
            villageMap[village].other++;

    });

    Object.keys(villageMap)
        .sort()
        .forEach((village, index) => {

            const v = villageMap[village];

            tableBody.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${village}</td>

                <td>${v.total}</td>

                <td>${v.approved}</td>

                <td>${v.pending}</td>

                <td>${v.ferfar}</td>

                <td>${v.other}</td>

            </tr>

            `;

        });

}

// ==========================================
// WORK TYPE SUMMARY
// ==========================================

function displayWorkTypeSummary() {

    document.getElementById("tableHead").innerHTML = `

    <tr>

        <th>अ. क्र.</th>

        <th>कामाचा प्रकार</th>

        <th>एकूण प्रकरणे</th>

        <th>मंजूर</th>

        <th>प्रलंबित</th>

        <th>सरासरी कालावधी</th>

    </tr>

    `;

    tableBody.innerHTML = "";

    const workMap = {};

    filteredFarmers.forEach(farmer => {

        const type = farmer.workType || "इतर";

        if (!workMap[type]) {

            workMap[type] = {

                total: 0,

                approved: 0,

                pending: 0,

                totalDays: 0,

                completedCount: 0

            };

        }

        workMap[type].total++;

        if (farmer.status === "मंजूर") {

            workMap[type].approved++;

        } else {

            workMap[type].pending++;

        }

        //--------------------------------------------------
        // Average Duration
        //--------------------------------------------------

        if (farmer.inputDate && farmer.completionDate) {

            const days = Math.ceil(

                (new Date(farmer.completionDate) -
                 new Date(farmer.inputDate))

                / (1000 * 60 * 60 * 24)

            );

            if (days >= 0) {

                workMap[type].totalDays += days;

                workMap[type].completedCount++;

            }

        }

    });

    Object.keys(workMap)
        .sort()
        .forEach((type, index) => {

            const w = workMap[type];

            const avg =

                w.completedCount === 0

                ? "-"

                : Math.round(

                    w.totalDays /

                    w.completedCount

                  ) + " दिवस";

            tableBody.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${type}</td>

                <td>${w.total}</td>

                <td>${w.approved}</td>

                <td>${w.pending}</td>

                <td>${avg}</td>

            </tr>

            `;

        });

}
// ==========================================
// TAB SWITCHING
// ==========================================

tabButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        //------------------------------------------------

        tabButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        //------------------------------------------------

        button.classList.add("active");

        //------------------------------------------------

        currentReport =
        button.dataset.report;

        //------------------------------------------------

        renderCurrentView();

    });

});

const downloadBtn =
document.getElementById("downloadBtn");

const downloadModal =
document.getElementById("downloadModal");

const closeDownload =
document.getElementById("closeDownload");

if(downloadBtn){

    downloadBtn.addEventListener("click",()=>{

        downloadModal.style.display="flex";

    });

}

if(closeDownload){

    closeDownload.addEventListener("click",()=>{

        downloadModal.style.display="none";

    });

}
const excelBtn =
document.getElementById("excelBtn");

if(excelBtn){

    excelBtn.addEventListener(

        "click",

        exportExcel

    );

}
const pdfBtn =
document.getElementById("pdfBtn");

if(pdfBtn){

    pdfBtn.addEventListener(

        "click",

        exportPDF

    );

}
function getCurrentTableData(){

    switch(currentReport){

        case "farmers":

            return filteredFarmers.map((f, index)=>({

                "अ. क्र.": index + 1,

                "शेतकरी":f.farmerName,

                "गाव":f.village,

                "काम":f.workType,

                "अर्ज":formatDate(f.inputDate),

                "मंजूर":formatDate(f.approvedDate),

                "पूर्ण":formatDate(f.completionDate),

                "कालावधी":calculateDuration(

                    f.inputDate,

                    f.completionDate

                ),

                "स्थिती":f.status,

                "टिप्पणी":f.remarks || "-"

            }));


        case "villages":{

            const data=[];

            const villageMap={};

            filteredFarmers.forEach(f=>{

                if(!villageMap[f.village]){

                    villageMap[f.village]={

                        total:0,

                        approved:0,

                        pending:0

                    };

                }

                villageMap[f.village].total++;

                if(f.status==="मंजूर")

                    villageMap[f.village].approved++;

                else

                    villageMap[f.village].pending++;

            });

            Object.keys(villageMap).sort().forEach((v, index)=>{

                data.push({

                    "अ. क्र.": index + 1,

                    "गाव":v,

                    "एकूण":villageMap[v].total,

                    "मंजूर":villageMap[v].approved,

                    "प्रलंबित":villageMap[v].pending

                });

            });

            return data;

        }


        case "worktypes":{

            const data=[];

            const workMap={};

            filteredFarmers.forEach(f=>{

                if(!workMap[f.workType]){

                    workMap[f.workType]={

                        total:0,

                        approved:0,

                        pending:0

                    };

                }

                workMap[f.workType].total++;

                if(f.status==="मंजूर")

                    workMap[f.workType].approved++;

                else

                    workMap[f.workType].pending++;

            });

            Object.keys(workMap).sort().forEach((w, index)=>{

                data.push({

                    "अ. क्र.": index + 1,

                    "काम":w,

                    "एकूण":workMap[w].total,

                    "मंजूर":workMap[w].approved,

                    "प्रलंबित":workMap[w].pending

                });

            });

            return data;

        }

    }

}

// ==========================================
// EXPORT EXCEL
// ==========================================

function exportExcel() {

    const data = getCurrentTableData();

    if (data.length === 0) {

        alert("डाउनलोड करण्यासाठी माहिती उपलब्ध नाही.");

        return;

    }

    const worksheet =
        XLSX.utils.json_to_sheet(data);

    const workbook =
        XLSX.utils.book_new();

    let sheetName = "Report";

    if (currentReport === "farmers")
        sheetName = "शेतकरी";

    if (currentReport === "villages")
        sheetName = "गावनिहाय";

    if (currentReport === "worktypes")
        sheetName = "कार्यप्रकार";

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        sheetName

    );

    XLSX.writeFile(

        workbook,

        `${sheetName}_Report.xlsx`

    );

    downloadModal.style.display = "none";

}

// ==========================================
// EXPORT PDF
// ==========================================

async function exportPDF() {

    const data = getCurrentTableData();

    if (data.length === 0) {

        alert("डाउनलोड करण्यासाठी माहिती उपलब्ध नाही.");

        return;

    }

    downloadModal.style.display = "none";

    let title = "अहवाल";

    if (currentReport === "farmers")
        title = "शेतकरी अहवाल";

    if (currentReport === "villages")
        title = "गावनिहाय अहवाल";

    if (currentReport === "worktypes")
        title = "कामाच्या प्रकारानुसार अहवाल";

    const originalTable = document.getElementById("reportTable");
    const headerHTML = originalTable.querySelector("thead").innerHTML;
    const bodyRows = Array.from(originalTable.querySelectorAll("tbody tr"));

    // Number of rows per page to guarantee clean page breaks without row splitting
    const rowsPerPage = 12;
    const totalPages = Math.ceil(bodyRows.length / rowsPerPage) || 1;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const imgWidth = pageWidth - (margin * 2);

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const startRow = pageIdx * rowsPerPage;
        const pageRows = bodyRows.slice(startRow, startRow + rowsPerPage);

        // Offscreen page container with exact A4 landscape aspect scale
        const pageDiv = document.createElement("div");
        pageDiv.style.position = "absolute";
        pageDiv.style.left = "-9999px";
        pageDiv.style.top = "0";
        pageDiv.style.width = "1100px";
        pageDiv.style.padding = "25px";
        pageDiv.style.backgroundColor = "#ffffff";
        pageDiv.style.boxSizing = "border-box";
        pageDiv.style.fontFamily = "'Segoe UI', Roboto, 'Noto Sans Devanagari', sans-serif";

        // Title
        const titleEl = document.createElement("h2");
        titleEl.textContent = `${title} (पान ${pageIdx + 1} पैकी ${totalPages})`;
        titleEl.style.textAlign = "center";
        titleEl.style.color = "#1e3a5f";
        titleEl.style.marginBottom = "16px";
        titleEl.style.fontSize = "22px";
        pageDiv.appendChild(titleEl);

        // Table
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = "13px";

        const thead = document.createElement("thead");
        thead.innerHTML = headerHTML;
        thead.querySelectorAll("th").forEach(th => {
            th.style.background = "#ff7b00";
            th.style.color = "#ffffff";
            th.style.padding = "10px 8px";
            th.style.border = "1px solid #cccccc";
            th.style.textAlign = "center";
            th.style.fontSize = "13px";
        });
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        pageRows.forEach(tr => {
            const trClone = tr.cloneNode(true);
            trClone.querySelectorAll("td").forEach(td => {
                td.style.padding = "8px 6px";
                td.style.border = "1px solid #cccccc";
                td.style.color = "#333333";
                td.style.textAlign = "center";
                td.style.fontSize = "12px";
            });
            tbody.appendChild(trClone);
        });
        table.appendChild(tbody);
        pageDiv.appendChild(table);

        document.body.appendChild(pageDiv);

        try {
            const canvas = await html2canvas(pageDiv, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            });

            document.body.removeChild(pageDiv);

            const imgData = canvas.toDataURL("image/png");
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (pageIdx > 0) {
                pdf.addPage();
            }

            pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        } catch (error) {
            console.error("PDF generation error:", error);
            if (pageDiv.parentNode) {
                document.body.removeChild(pageDiv);
            }
            alert("PDF तयार करताना त्रुटी आली.");
            return;
        }
    }

    pdf.save(`${title}.pdf`);

}
