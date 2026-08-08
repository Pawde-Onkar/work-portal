import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./firebase.js";
import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

const visitDate = document.getElementById("visitDate");
if (visitDate) {
    const today = new Date().toISOString().split("T")[0];
    visitDate.max = today;
    visitDate.value = today;
}

// Live photo preview listener
const photoInput = document.getElementById("visitPhotos");
const photoPreviewGrid = document.getElementById("photoPreviewGrid");
if (photoInput && photoPreviewGrid) {
    photoInput.addEventListener("change", (e) => {
        photoPreviewGrid.innerHTML = "";
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert("जास्तीत जास्त 3 फोटो निवडता येतील.");
            photoInput.value = "";
            return;
        }
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = document.createElement("img");
                img.src = evt.target.result;
                img.className = "preview-thumb";
                photoPreviewGrid.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });
}

// Live document list preview listener
const docInput = document.getElementById("visitDocuments");
const docPreviewList = document.getElementById("docPreviewList");
if (docInput && docPreviewList) {
    docInput.addEventListener("change", (e) => {
        docPreviewList.innerHTML = "";
        const files = Array.from(e.target.files);
        if (files.length > 2) {
            alert("जास्तीत जास्त 2 दस्तऐवज निवडता येतील.");
            docInput.value = "";
            return;
        }
        files.forEach(file => {
            const p = document.createElement("div");
            p.style.padding = "4px 8px";
            p.style.background = "#f1f5f9";
            p.style.borderRadius = "6px";
            p.style.marginBottom = "4px";
            p.innerHTML = `<i class="fa-solid fa-paperclip"></i> ${file.name} (${Math.round(file.size / 1024)} KB)`;
            docPreviewList.appendChild(p);
        });
    });
}

const form = document.getElementById("fieldVisitForm");
const loader = document.getElementById("uploadLoader");
const submitBtn = document.querySelector("#fieldVisitForm button[type='submit']");

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!auth.currentUser) {
            alert("कृपया प्रथम लॉग इन करा.");
            window.location.href = "login.html";
            return;
        }

        loader.style.display = "block";
        submitBtn.disabled = true;

        const files = photoInput ? photoInput.files : [];
        if (files.length > 3) {
            alert("जास्तीत जास्त 3 फोटो अपलोड करता येतील.");
            loader.style.display = "none";
            submitBtn.disabled = false;
            return;
        }

        for (let file of files) {
            if (file.size > 5000 * 1024) {
                alert(`${file.name} चा आकार 5MB पेक्षा जास्त आहे.`);
                loader.style.display = "none";
                submitBtn.disabled = false;
                return;
            }
        }

        const photos = [];
        for (let file of files) {
            const compressed = await compressImage(file);
            const base64 = await fileToBase64(compressed);
            photos.push(base64);
        }

        const documentFiles = docInput ? docInput.files : [];
        if (documentFiles.length > 2) {
            alert("जास्तीत जास्त 2 दस्तऐवज अपलोड करता येतील.");
            loader.style.display = "none";
            submitBtn.disabled = false;
            return;
        }

        for (let file of documentFiles) {
            if (file.size > 500 * 1024) {
                alert(`${file.name} चा आकार 500KB पेक्षा जास्त आहे.`);
                loader.style.display = "none";
                submitBtn.disabled = false;
                return;
            }
        }

        const documents = [];
        for (let file of documentFiles) {
            const documentData = await fileToObject(file);
            documents.push(documentData);
        }

        const visit = {
            userId: auth.currentUser.uid,
            farmerName: document.getElementById("farmerName").value.trim(),
            village: document.getElementById("village").value.trim(),
            visitDate: document.getElementById("visitDate").value,
            observation: document.getElementById("observation").value.trim(),
            photos: photos,
            documents: documents,
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "fieldVisits"), visit);
            loader.style.display = "none";
            submitBtn.disabled = false;
            alert("क्षेत्रभेटीची माहिती यशस्वीरित्या सेव्ह झाली!");
            window.location.href = "field-visit-manager.html";
        } catch (error) {
            loader.style.display = "none";
            submitBtn.disabled = false;
            console.error("Save error:", error);
            alert("माहिती सेव्ह करताना त्रुटी आली. " + error.message);
        }
    });
}

function fileToObject(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
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

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement("canvas");
                const maxWidth = 1280;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    blob => resolve(blob),
                    "image/jpeg",
                    0.6
                );
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "login.html";
    }
});