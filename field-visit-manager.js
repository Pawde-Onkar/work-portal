import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth, db } from "./firebase.js";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Global cache to avoid repeated Firestore network calls on search
let allVisitsCache = [];
let isLoaded = false;

// Render skeleton loaders for fast perceived load time
function renderSkeletons() {
    const container = document.getElementById("visitContainer");
    if (!container) return;

    let html = "";
    for (let i = 0; i < 6; i++) {
        html += `
        <div class="skeleton-card">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-text"></div>
            <div class="skeleton-line skeleton-text"></div>
            <div class="skeleton-line skeleton-box"></div>
        </div>
        `;
    }
    container.innerHTML = html;
}

async function fetchVisitsFromFirestore() {
    if (!auth.currentUser) return;
    
    renderSkeletons();

    try {
        const q = query(
            collection(db, "fieldVisits"),
            where("userId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        allVisitsCache = [];
        snapshot.forEach(docSnap => {
            allVisitsCache.push({
                firestoreId: docSnap.id,
                ...docSnap.data()
            });
        });

        // Sort by visit date descending (newest first)
        allVisitsCache.sort((a, b) => {
            if (!a.visitDate) return 1;
            if (!b.visitDate) return -1;
            return new Date(b.visitDate) - new Date(a.visitDate);
        });

        isLoaded = true;
        updateHeaderStats();
        renderVisits();
    } catch (error) {
        console.error("Error loading visits:", error);
        const container = document.getElementById("visitContainer");
        if (container) {
            container.innerHTML = `
            <div class="no-data-card">
                <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i>
                <h3>माहिती लोड करताना त्रुटी आली</h3>
                <p style="color:#94a3b8; font-size:13px; margin-top:6px;">कृपया पुन्हा प्रयत्न करा.</p>
            </div>
            `;
        }
    }
}

function updateHeaderStats() {
    const statEl = document.getElementById("totalVisitCount");
    if (statEl) {
        statEl.textContent = `एकूण भेटी: ${allVisitsCache.length}`;
    }
}

function renderVisits() {
    const container = document.getElementById("visitContainer");
    if (!container) return;

    const searchInput = document.getElementById("searchInput");
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const filtered = allVisitsCache.filter(visit => {
        const name = (visit.farmerName || "").toLowerCase();
        const village = (visit.village || "").toLowerCase();
        const obs = (visit.observation || "").toLowerCase();
        return name.includes(searchTerm) || village.includes(searchTerm) || obs.includes(searchTerm);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
        <div class="no-data-card">
            <i class="fa-solid fa-folder-open"></i>
            <h3>कोणतीही क्षेत्र भेट सापडली नाही</h3>
            <p style="color:#94a3b8; font-size:13px; margin-top:6px;">
                ${searchTerm ? "शोधात कोणतीही नोंद आढळली नाही." : "+ नवीन क्षेत्र भेट बटनावर क्लिक करून नोंद जोडा."}
            </p>
        </div>
        `;
        return;
    }

    let html = "";
    filtered.forEach(visit => {
        const photosCount = (visit.photos && visit.photos.length) || 0;
        const docsCount = (visit.documents && visit.documents.length) || 0;
        const obsText = visit.observation ? visit.observation : "तपशील उपलब्ध नाही";

        html += `
        <div class="visit-card">
            <div>
                <div class="visit-card-header">
                    <h3>${escapeHtml(visit.farmerName || "अज्ञात शेतकरी")}</h3>
                    ${photosCount > 0 ? `<span class="visit-badge"><i class="fa-solid fa-camera"></i> ${photosCount} फोटो</span>` : ""}
                </div>

                <div class="visit-card-body">
                    <div class="visit-info-row">
                        <i class="fa-solid fa-location-dot" style="color:#ff7b00; width:16px;"></i>
                        <span><strong>गाव:</strong> ${escapeHtml(visit.village || "-")}</span>
                    </div>

                    <div class="visit-info-row">
                        <i class="fa-regular fa-calendar-days" style="color:#3b82f6; width:16px;"></i>
                        <span><strong>भेट दिनांक:</strong> ${formatDate(visit.visitDate)}</span>
                    </div>

                    ${docsCount > 0 ? `
                    <div class="visit-info-row">
                        <i class="fa-solid fa-file-pdf" style="color:#ef4444; width:16px;"></i>
                        <span><strong>कागदपत्रे:</strong> ${docsCount} फाईल</span>
                    </div>` : ""}

                    <div class="observation-snippet" title="${escapeHtml(obsText)}">
                        <i class="fa-solid fa-quote-left" style="font-size:10px; color:#cbd5e1; margin-right:4px;"></i>
                        ${escapeHtml(obsText)}
                    </div>
                </div>
            </div>

            <div class="card-buttons">
                <button class="view-btn" onclick="window.location.href='field-visit-details.html?id=${visit.firestoreId}'">
                    <i class="fa-solid fa-eye"></i> पहा
                </button>
                <button class="delete-btn" onclick="deleteVisit('${visit.firestoreId}')">
                    <i class="fa-solid fa-trash-can"></i> हटवा
                </button>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function deleteVisit(id) {
    if (!confirm("तुम्हाला नक्की ही क्षेत्र भेट हटवायची आहे का?")) return;

    try {
        await deleteDoc(doc(db, "fieldVisits", id));
        // Remove from cache locally without re-querying Firestore
        allVisitsCache = allVisitsCache.filter(v => v.firestoreId !== id);
        updateHeaderStats();
        renderVisits();
    } catch (error) {
        console.error("Delete error:", error);
        alert("हटवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    }
}

// Instant client-side search filtering (0ms latency, no extra Firestore calls)
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        if (isLoaded) renderVisits();
    });
}

onAuthStateChanged(auth, user => {
    if (user) {
        fetchVisitsFromFirestore();
    } else {
        window.location.href = "login.html";
    }
});

window.deleteVisit = deleteVisit;