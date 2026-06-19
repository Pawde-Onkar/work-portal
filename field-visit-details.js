import { db }
from "./firebase.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log(window.docx);
// GET ID FROM URL

const params =
    new URLSearchParams(
        window.location.search
    );

const visitId =
    params.get("id");

let visit = null;

// SHOW DATA

const details =
    document.getElementById(
        "visitDetails"
    );

async function loadVisit() {

    const details =
        document.getElementById(
            "visitDetails"
        );

    const docRef =
        doc(
            db,
            "fieldVisits",
            visitId
        );

    const docSnap =
        await getDoc(docRef);

    if (!docSnap.exists()) {

        details.innerHTML =
            "<h2>Visit Not Found</h2>";

        return;
    }

    visit = docSnap.data();

    let photosHtml = "";

    if (
        visit.photos &&
        visit.photos.length > 0
    ) {

        photosHtml += `
            <h3>Photos</h3>

            <div class="photo-grid">
        `;

        visit.photos.forEach(photo => {

            photosHtml += `

                <img
                    src="${photo}"
                    class="visit-photo"
                >

            `;

        });

        photosHtml += `
            </div>
        `;
    }

    let documentsHtml = "";

    if (
        visit.documents &&
        visit.documents.length > 0
    ) {

        documentsHtml += `
            <h3>Documents</h3>
            <ul>
        `;

        visit.documents.forEach(doc => {

            documentsHtml += `

                <li>

                    <a
                        href="${doc.data}"
                        download="${doc.name}"
                    >
                        ${doc.name}
                    </a>

                </li>

            `;

        });

        documentsHtml += `
            </ul>
        `;
    }

    details.innerHTML = `

        <h2>${visit.farmerName}</h2>

        <p>
            <strong>Village:</strong>
            ${visit.village}
        </p>

        <p>
            <strong>Visit Date:</strong>
            ${visit.visitDate}
        </p>

        <p>
            <strong>Visit Type:</strong>
            ${visit.visitType}
        </p>

        <hr>

        <h3>Observation</h3>

        <p>
            ${visit.observation}
        </p>

        <hr>

        <h3>Analysis</h3>

        <p>
            ${visit.analysis}
        </p>

        <hr>

        <h3>Recommendation</h3>

        <p>
            ${visit.recommendation}
        </p>

        ${photosHtml}

        ${documentsHtml}

    `;
}
async function generateWordReport() {

    const {
        Document,
        Paragraph,
        HeadingLevel,
        Packer
    } = docx;

    const doc = new Document({

        sections: [

            {

                properties: {},

                children: [

                    new Paragraph({

                        text: "FIELD VISIT REPORT",

                        heading:
                            HeadingLevel.TITLE

                    }),

                    new Paragraph(""),

                    new Paragraph(
                        `Farmer Name: ${visit.farmerName}`
                    ),

                    new Paragraph(
                        `Village: ${visit.village}`
                    ),

                    new Paragraph(
                        `Visit Date: ${visit.visitDate}`
                    ),

                    new Paragraph(
                        `Visit Type: ${visit.visitType}`
                    ),

                    new Paragraph(""),

                    new Paragraph({

                        text: "Observation",

                        heading:
                            HeadingLevel.HEADING_1

                    }),

                    new Paragraph(
                        visit.observation
                    ),

                    new Paragraph(""),

                    new Paragraph({

                        text: "Analysis",

                        heading:
                            HeadingLevel.HEADING_1

                    }),

                    new Paragraph(
                        visit.analysis
                    ),

                    new Paragraph(""),

                    new Paragraph({

                        text: "Recommendation",

                        heading:
                            HeadingLevel.HEADING_1

                    }),

                    new Paragraph(
                        visit.recommendation
                    )

                ]

            }

        ]

    });

    const blob =
        await Packer.toBlob(doc);

    saveAs(
        blob,
        `${visit.farmerName}_Field_Visit.docx`
    );

}
async function generatePDFReport() {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    let y = 20;

    pdf.setFontSize(18);
    pdf.text("FIELD VISIT REPORT", 20, y);

    y += 15;

    pdf.setFontSize(12);

    pdf.text(
        `Farmer Name: ${visit.farmerName}`,
        20,
        y
    );

    y += 10;

    pdf.text(
        `Village: ${visit.village}`,
        20,
        y
    );

    y += 10;

    pdf.text(
        `Visit Date: ${visit.visitDate}`,
        20,
        y
    );

    y += 10;

    pdf.text(
        `Visit Type: ${visit.visitType}`,
        20,
        y
    );

    y += 15;

    pdf.text("Observation:", 20, y);

    y += 8;

    const observation =
        pdf.splitTextToSize(
            visit.observation || "",
            170
        );

    pdf.text(observation, 20, y);

    y += observation.length * 7 + 10;

    pdf.text("Analysis:", 20, y);

    y += 8;

    const analysis =
        pdf.splitTextToSize(
            visit.analysis || "",
            170
        );

    pdf.text(analysis, 20, y);

    y += analysis.length * 7 + 10;

    pdf.text("Recommendation:", 20, y);

    y += 8;

    const recommendation =
        pdf.splitTextToSize(
            visit.recommendation || "",
            170
        );

    pdf.text(recommendation, 20, y);

    y += recommendation.length * 7 + 15;

    // ==========================
    // PHOTOS
    // ==========================

    if (
        visit.photos &&
        visit.photos.length > 0
    ) {

        pdf.addPage();

        y = 20;

        pdf.setFontSize(16);

        pdf.text(
            "FIELD VISIT PHOTOS",
            20,
            y
        );

        y += 15;

        for (
            let i = 0;
            i < visit.photos.length;
            i++
        ) {

            try {

                if (y > 220) {

                    pdf.addPage();

                    y = 20;

                }

                pdf.addImage(
                    visit.photos[i],
                    "JPEG",
                    20,
                    y,
                    80,
                    60
                );

                y += 70;

            } catch (error) {

                console.log(
                    "Photo Error:",
                    error
                );

            }

        }

    }

    // ==========================
    // DOCUMENTS
    // ==========================

    if (
        visit.documents &&
        visit.documents.length > 0
    ) {

        pdf.addPage();

        y = 20;

        pdf.setFontSize(16);

        pdf.text(
            "ATTACHED DOCUMENTS",
            20,
            y
        );

        y += 15;

        pdf.setFontSize(12);

        visit.documents.forEach(doc => {

            pdf.text(
                `• ${doc.name}`,
                20,
                y
            );

            y += 10;

        });

    }

    // ==========================
    // FOOTER
    // ==========================

    pdf.setPage(
        pdf.getNumberOfPages()
    );

    pdf.text(
        `Generated On: ${new Date().toLocaleDateString()}`,
        20,
        280
    );

    pdf.save(
        `${visit.farmerName}_Field_Visit.pdf`
    );

}
loadVisit();
window.generateWordReport =
    generateWordReport;

window.generatePDFReport =
    generatePDFReport;