import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const visitId = params.get("id");
let visit = null;

async function loadVisit() {
    const details = document.getElementById("visitDetails");
    if (!details) return;

    if (!visitId) {
        details.innerHTML = "<div class='no-data-card'><h3>क्षेत्र भेट आयडी आढळला नाही.</h3></div>";
        return;
    }

    try {
        const docRef = doc(db, "fieldVisits", visitId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            details.innerHTML = "<div class='no-data-card'><h3>क्षेत्रभेटीची माहिती आढळली नाही.</h3></div>";
            return;
        }

        visit = docSnap.data();

        if (visit.userId !== auth.currentUser.uid) {
            details.innerHTML = "<div class='no-data-card'><h3>या माहितीचा ॲक्सेस नाकारला गेला.</h3></div>";
            return;
        }

        renderDetailsUI();
    } catch (error) {
        console.error("Error loading visit details:", error);
        details.innerHTML = "<div class='no-data-card'><h3>माहिती लोड करताना त्रुटी आली.</h3></div>";
    }
}

function renderDetailsUI() {
    const details = document.getElementById("visitDetails");

    let photosHtml = "";
    if (visit.photos && visit.photos.length > 0) {
        photosHtml = `
        <div style="margin-top: 25px;">
            <h3 style="font-size:16px; margin-bottom:12px; color:#1e293b; display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-camera" style="color:#8b5cf6;"></i> भेट फोटो (${visit.photos.length})
            </h3>
            <div class="photo-grid">
                ${visit.photos.map((photo, idx) => `
                    <img src="${photo}" class="visit-photo" alt="Photo ${idx + 1}" onclick="openLightbox('${photo}')">
                `).join("")}
            </div>
        </div>
        `;
    }

    let documentsHtml = "";
    if (visit.documents && visit.documents.length > 0) {
        documentsHtml = `
        <div style="margin-top: 25px;">
            <h3 style="font-size:16px; margin-bottom:12px; color:#1e293b; display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i> जोडलेली कागदपत्रे (${visit.documents.length})
            </h3>
            <div style="display:flex; flex-wrap:wrap; gap:12px;">
                ${visit.documents.map(doc => `
                    <a href="${doc.data}" download="${doc.name}" style="text-decoration:none; background:#f1f5f9; border:1px solid #cbd5e1; padding:10px 16px; border-radius:10px; color:#334155; font-size:13.5px; font-weight:600; display:inline-flex; align-items:center; gap:8px; transition:all 0.2s ease;">
                        <i class="fa-solid fa-download" style="color:#2563eb;"></i> ${doc.name}
                    </a>
                `).join("")}
            </div>
        </div>
        `;
    }

    details.innerHTML = `
    <div class="details-card">
        <div class="details-header">
            <h2 style="font-size:22px; color:#1e3a5f; margin-bottom:4px;">
                <i class="fa-solid fa-user" style="color:#ff7b00;"></i> ${escapeHtml(visit.farmerName)}
            </h2>
            <p style="color:#64748b; font-size:13px;">नोंदणी आयडी: ${visitId}</p>
        </div>

        <div class="details-grid">
            <div class="detail-item">
                <span>गाव</span>
                <strong><i class="fa-solid fa-location-dot" style="color:#ff7b00; margin-right:4px;"></i> ${escapeHtml(visit.village)}</strong>
            </div>

            <div class="detail-item">
                <span>भेट दिनांक</span>
                <strong><i class="fa-regular fa-calendar-days" style="color:#3b82f6; margin-right:4px;"></i> ${formatDate(visit.visitDate)}</strong>
            </div>

            <div class="detail-item">
                <span>एकूण फोटो</span>
                <strong>${visit.photos ? visit.photos.length : 0} फोटो</strong>
            </div>

            <div class="detail-item">
                <span>एकूण फाईली</span>
                <strong>${visit.documents ? visit.documents.length : 0} फाईली</strong>
            </div>
        </div>

        <div style="background:#f8fafc; padding:18px; border-radius:12px; border-left:4px solid #ff7b00; margin-bottom:20px;">
            <h3 style="font-size:15px; color:#334155; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-pen-to-square" style="color:#ff7b00;"></i> भेटीचा संक्षिप्त तपशील / निरीक्षणे:
            </h3>
            <p style="color:#475569; font-size:14.5px; line-height:1.6; white-space:pre-line;">
                ${escapeHtml(visit.observation || "कोणतीही निरीक्षणे नोंदवलेली नाहीत.")}
            </p>
        </div>

        ${photosHtml}
        ${documentsHtml}
    </div>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
        const parts = dateStr.split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    } catch {
        return dateStr;
    }
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function openLightbox(photoUrl) {
    const w = window.open("");
    w.document.write(`<img src="${photoUrl}" style="max-width:100%; height:auto; margin:auto; display:block;">`);
}

async function generatePDFReport() {
    if (!visit) {
        alert("माहिती उपलब्ध नाही.");
        return;
    }

    const printArea = document.createElement("div");
    printArea.style.position = "absolute";
    printArea.style.left = "-9999px";
    printArea.style.top = "0";
    printArea.style.width = "800px";
    printArea.style.padding = "30px";
    printArea.style.backgroundColor = "#ffffff";
    printArea.style.fontFamily = "'Segoe UI', Roboto, 'Noto Sans Devanagari', sans-serif";

    printArea.innerHTML = `
        <div style="border-bottom: 2px solid #ff7b00; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
            <h1 style="color:#1e3a5f; font-size:24px; margin-bottom:5px;">क्षेत्र भेट अहवाल</h1>
            <p style="color:#64748b; font-size:13px;">ग्राम महसूल अधिकारी निळा</p>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:14px;">
            <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f8fafc; font-weight:bold; width:30%;">शेतकऱ्याचे नाव:</td>
                <td style="padding:8px; border:1px solid #ddd;">${escapeHtml(visit.farmerName)}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f8fafc; font-weight:bold;">गाव:</td>
                <td style="padding:8px; border:1px solid #ddd;">${escapeHtml(visit.village)}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f8fafc; font-weight:bold;">भेट दिनांक:</td>
                <td style="padding:8px; border:1px solid #ddd;">${formatDate(visit.visitDate)}</td>
            </tr>
        </table>

        <div style="margin-bottom:20px;">
            <h3 style="font-size:16px; color:#1e3a5f; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:10px;">निरीक्षणे / तपशील:</h3>
            <p style="font-size:14px; color:#334155; line-height:1.6; white-space:pre-line;">
                ${escapeHtml(visit.observation || "-")}
            </p>
        </div>
    `;

    if (visit.photos && visit.photos.length > 0) {
        let photosBlock = `<div style="margin-top:20px;"><h3 style="font-size:16px; color:#1e3a5f; margin-bottom:10px;">क्षेत्र भेट फोटो:</h3><div style="display:flex; flex-wrap:wrap; gap:10px;">`;
        visit.photos.forEach(p => {
            photosBlock += `<img src="${p}" style="width:230px; height:160px; object-fit:cover; border-radius:8px; border:1px solid #ccc;">`;
        });
        photosBlock += `</div></div>`;
        printArea.innerHTML += photosBlock;
    }

    document.body.appendChild(printArea);

    try {
        const canvas = await html2canvas(printArea, { scale: 2, backgroundColor: "#ffffff" });
        document.body.removeChild(printArea);

        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save(`${visit.farmerName}_क्षेत्र_भेट.pdf`);
    } catch (err) {
        console.error("PDF generation error:", err);
        if (printArea.parentNode) document.body.removeChild(printArea);
        alert("PDF तयार करताना त्रुटी आली.");
    }
}

function base64ToUint8Array(base64) {
    const binaryString = atob(base64.split(",")[1]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function generateWordReport() {
    if (!visit) {
        alert("माहिती उपलब्ध नाही.");
        return;
    }

    const { Document, Paragraph, HeadingLevel, Packer, ImageRun } = window.docx;
    const photoParagraphs = [];

    if (visit.photos && visit.photos.length > 0) {
        photoParagraphs.push(new Paragraph({ text: "Photos", heading: HeadingLevel.HEADING_1 }));
        visit.photos.forEach(photo => {
            try {
                photoParagraphs.push(
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: base64ToUint8Array(photo),
                                transformation: { width: 300, height: 200 }
                            })
                        ]
                    })
                );
            } catch (e) {
                console.error("Error adding photo to docx:", e);
            }
        });
    }

    const docx = new Document({
        sections: [{
            children: [
                new Paragraph({ text: "क्षेत्र भेट अहवाल", heading: HeadingLevel.TITLE }),
                new Paragraph(`Farmer Name: ${visit.farmerName}`),
                new Paragraph(`Village: ${visit.village}`),
                new Paragraph(`Visit Date: ${visit.visitDate}`),
                new Paragraph(""),
                new Paragraph({ text: "भेटीचा संक्षिप्त तपशील", heading: HeadingLevel.HEADING_1 }),
                new Paragraph(visit.observation || "-"),
                ...photoParagraphs
            ]
        }]
    });

    const blob = await Packer.toBlob(docx);
    saveAs(blob, `${visit.farmerName}_Field_Visit.docx`);
}

onAuthStateChanged(auth, user => {
    if (user) {
        loadVisit();
    } else {
        window.location.href = "login.html";
    }
});

// Bind window global handlers
window.generatePDFReport = generatePDFReport;
window.generateWordReport = generateWordReport;
window.openLightbox = openLightbox;