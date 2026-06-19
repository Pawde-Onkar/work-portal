import { db }
from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
async function displayVisits(){

    const container =
        document.getElementById("visitContainer");

   const snapshot =
    await getDocs(
        collection(db, "fieldVisits")
    );

let visits = [];

snapshot.forEach(docSnap => {

    visits.push({

        firestoreId: docSnap.id,

        ...docSnap.data()

    });

});

    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    visits = visits.filter(v =>
        v.farmerName
        .toLowerCase()
        .includes(search)
    );

    container.innerHTML = "";

    visits.forEach(visit => {

        container.innerHTML += `

        <div class="visit-card">

            <h3>
                ${visit.farmerName}
            </h3>

            <p>
                <strong>Village:</strong>
                ${visit.village}
            </p>

            <p>
                <strong>Date:</strong>
                ${visit.visitDate}
            </p>

            <p>
                <strong>Type:</strong>
                ${visit.visitType}
            </p>

          <div class="card-buttons">

    <button
        class="view-btn"
        onclick="
        window.location.href='field-visit-details.html?id=${visit.firestoreId}'
        "
    >
        View
    </button>

    <button
        class="delete-btn"
        onclick="deleteVisit('${visit.firestoreId}')"
    >
        Delete
    </button>

</div>

        </div>

        `;
    });

}



async function deleteVisit(id){

    if(
        !confirm(
            "Delete this visit?"
        )
    ) return;

    await deleteDoc(

        doc(
            db,
            "fieldVisits",
            id
        )

    );

    displayVisits();

}

document
.getElementById("searchInput")
.addEventListener(
    "input",
    displayVisits
);

displayVisits();
window.deleteVisit =
    deleteVisit;