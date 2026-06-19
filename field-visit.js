import { db }
from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.onload =
            () => resolve(reader.result);

        reader.onerror =
            error => reject(error);

        reader.readAsDataURL(file);

    });

}
const form =
    document.getElementById("fieldVisitForm");

if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        // GET PHOTO FILES

        const photoInput =
            document.getElementById("visitPhotos");

        const files =
            photoInput.files;

        const photos = [];

        // CONVERT TO BASE64

        for (let file of files) {

            const base64 =
                await fileToBase64(file);

            photos.push(base64);
        }
        
        const documentInput =
            document.getElementById(
                "visitDocuments"
            );

        const documentFiles =
            documentInput.files;

        const documents = [];

        for(let file of documentFiles){

            const documentData =
                await fileToObject(file);

            documents.push(documentData);

        }

        // CREATE VISIT OBJECT

        const visit = {

            

            farmerName:
                document.getElementById("farmerName").value,

            village:
                document.getElementById("village").value,

            visitDate:
                document.getElementById("visitDate").value,

            visitType:
                document.getElementById("visitType").value,

            observation:
                document.getElementById("observation").value,

            analysis:
                document.getElementById("analysis").value,

            recommendation:
                document.getElementById("recommendation").value,

            photos: photos,
            documents: documents,

        };

        // GET OLD DATA

      try {

    await addDoc(

        collection(
            db,
            "fieldVisits"
        ),

        visit

    );

    alert(
        "Field Visit Saved Successfully!"
    );

}
catch(error){

    console.error(error);

    alert(
        "Error saving field visit!"
    );

}


        window.location.href =
            "field-visit-manager.html";

    });

}
function fileToObject(file){

    return new Promise((resolve,reject)=>{

        const reader =
            new FileReader();

        reader.onload = () => {

            resolve({

                name: file.name,

                type: file.type,

                data: reader.result

            });

        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}