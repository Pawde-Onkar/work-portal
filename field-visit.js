import {auth, db }
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

const loader =
    document.getElementById(
        "uploadLoader"
    );

const submitBtn =
    document.querySelector(
        "#fieldVisitForm button[type='submit']"
    );


if (form) {

    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            loader.style.display =
                "block";

            submitBtn.disabled =
                true;

            // =====================
            // GET PHOTO FILES
            // =====================

            const photoInput =
                document.getElementById(
                    "visitPhotos"
                );

            const files =
                photoInput.files;

                // Maximum 3 photos

if(files.length > 3){

    alert(
        "जास्तीत जास्त 3 फोटो अपलोड करता येतील."
    );

    loader.style.display = "none";

    submitBtn.disabled = false;

    return;

}

// Each photo max 500 KB

for(let file of files){

    if(file.size > 500 * 1024){

        alert(
            `${file.name} चा आकार 500KB पेक्षा जास्त आहे.`
        );

        loader.style.display = "none";

        submitBtn.disabled = false;

        return;

    }

}

            const photos = [];

            for (let file of files) {

                const base64 =
                    await fileToBase64(file);

                photos.push(base64);

            }

            // =====================
            // GET DOCUMENT FILES
            // =====================

            const documentInput =
                document.getElementById(
                    "visitDocuments"
                );

            const documentFiles =
                documentInput.files;
// Maximum 2 documents

if(documentFiles.length > 2){

    alert(
        "जास्तीत जास्त 2 दस्तऐवज अपलोड करता येतील."
    );

    loader.style.display = "none";

    submitBtn.disabled = false;

    return;

}

// Each document max 500 KB

for(let file of documentFiles){

    if(file.size > 500 * 1024){

        alert(
            `${file.name} चा आकार 500KB पेक्षा जास्त आहे.`
        );

        loader.style.display = "none";

        submitBtn.disabled = false;

        return;

    }

}
            const documents = [];

            for (
                let file of documentFiles
            ) {

                const documentData =
                    await fileToObject(file);

                documents.push(
                    documentData
                );

            }

            // =====================
            // CREATE VISIT OBJECT
            // =====================

            const visit = {
                userId:
                auth.currentUser.uid,
                farmerName:
                    document.getElementById(
                        "farmerName"
                    ).value,

                village:
                    document.getElementById(
                        "village"
                    ).value,

                visitDate:
                    document.getElementById(
                        "visitDate"
                    ).value,

                visitType:
                    document.getElementById(
                        "visitType"
                    ).value,

                observation:
                    document.getElementById(
                        "observation"
                    ).value,

                analysis:
                    document.getElementById(
                        "analysis"
                    ).value,

                recommendation:
                    document.getElementById(
                        "recommendation"
                    ).value,

                photos:
                    photos,

                documents:
                    documents

            };

            // =====================
            // SAVE TO FIRESTORE
            // =====================

            try {

                await addDoc(

                    collection(
                        db,
                        "fieldVisits"
                    ),

                    visit

                );

                loader.style.display =
                    "none";

                submitBtn.disabled =
                    false;

                alert(
                    "Field Visit Saved Successfully!"
                );

                window.location.href =
                    "field-visit-manager.html";

            }
            catch (error) {

                loader.style.display =
                    "none";

                submitBtn.disabled =
                    false;

                console.error(
                    error
                );

                alert(
                    error.message
                );

            }

        }
    );

}


function fileToObject(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => {

                    resolve({

                        name:
                            file.name,

                        type:
                            file.type,

                        data:
                            reader.result

                    });

                };

            reader.onerror =
                reject;

            reader.readAsDataURL(
                file
            );

        }
    );

}