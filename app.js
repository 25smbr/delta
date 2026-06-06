import { initializeApp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    getDocs,
    writeBatch,
    query,
    where,
    updateDoc,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// ─── FIREBASE ───────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyDUTJ3Nz8tY7ZN52tY7ZN52h3oA582qpw44wrCwac",
    authDomain:        "delta-29dec.firebaseapp.com",
    projectId:         "delta-29dec",
    storageBucket:     "delta-29dec.firebasestorage.app",
    messagingSenderId: "441849295640",
    appId:             "1:441849295640:web:2c2c7c7fb416a514e4646d",
    measurementId:     "G-8ZCT1SJGGT"
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const markersCollection  = collection(db, "markers");
const drawingsCollection = collection(db, "drawings");
// ─── MAP ─────────────────────────────────────────────────────────────────────
// FIX #5: correct image dimensions — width 1204, height 1290
const imageWidth  = 1204;
const imageHeight = 1290;
const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 2,
    zoomControl: false,
    attributionControl: false
});
const bounds = [[0, 0], [imageHeight, imageWidth]];
L.imageOverlay("map.png", bounds).addTo(map);
map.fitBounds(bounds);
map.setMaxBounds(bounds);
map.setView([imageHeight / 2, imageWidth / 2], 0);
// ─── CLOCK (UTC+2) ──────────────────────────────────────────────────────────
function updateClock() {
    const now = new Date();
    const z = (n) => String(n).padStart(2, "0");
    const utcPlus2 = new Date(now.getTime() + 7200000);
    document.getElementById("clock").textContent =
        `${z(utcPlus2.getUTCHours())}:${z(utcPlus2.getUTCMinutes())}:${z(utcPlus2.getUTCSeconds())}`;
}
updateClock();
setInterval(updateClock, 1000);
// ─── SYMBOL DEFINITIONS ──────────────────────────────────────────────────────
const symbolGroups = {
    infantry:  ["infantry_alive",  "infantry_wounded",  "infantry_dead"],
    tank:      ["tank_alive",      "tank_damaged",      "tank_destroyed"],
    artillery: ["artillery_alive", "artillery_damaged", "artillery_destroyed"],
    helicopter:["helicopter_alive","helicopter_damaged","helicopter_destroyed"],
    position:  ["position_alive",                       "position_destroyed"],
    humvee:    ["humvee_alive",    "humvee_damaged",    "humvee_destroyed"],
    truck:     ["truck_alive",     "truck_damaged",     "truck_destroyed"]
};
const statusColors = {
    alive:     "#4fa3ff",
    wounded:   "#ffcc00",
    damaged:   "#ff8800",
    dead:      "#ff4444",
    destroyed: "#ff4444"
};
let selectedSymbol = "infantry_alive";
// ════════════════════════════════════════════════════════════════════
// ALL STATE VARIABLES
// ════════════════════════════════════════════════════════════════════
const undoStack = [];
// ─── DRAWING STATE ───────────────────────────────────────────────────────────
let drawMode    = false;
let activeTool  = "pen";
let penColor    = "#ff4444";
let penWidth    = 3;
let isDrawing   = false;
let startCanvasX = 0, startCanvasY = 0;
let startMapLL   = null;
// strokes is the live local copy, synced from Firestore via incremental updates
let strokes       = [];
let currentStroke = null;
// ─── RULER STATE ─────────────────────────────────────────────────────────────
// FIX #5: scale calibrated to correct image dimensions
// The scale constant remains the same (142px = 250m at zoom 0) — keep original calibration
const PIXELS_PER_METER = 142 / 250;
let rulerMode   = false;
let rulerPoints = [];
// ════════════════════════════════════════════════════════════════════
// SVG BUILDER
// ════════════════════════════════════════════════════════════════════
function symbolSVG(type = "infantry_alive", forMap = false) {
    const parts  = type.split("_");
    const status = parts[parts.length - 1];
    const unit   = parts.slice(0, -1).join("_");
    const size   = forMap ? 46 : 46;
    const borderColor = statusColors[status] || "#4fa3ff";
    // Interior symbol stroke: a light neutral that reads on dark bg.
    // In light mode CSS will override this to #2d3a4a via attribute selector.
    const strokeColor = "#d0d8e8";
    let center = "";
    switch (unit) {
        case "infantry":
            // Stick figure — top-down person
            center = `
              <circle cx="23" cy="13" r="4.5" stroke="${strokeColor}" stroke-width="2.2" fill="none"/>
              <line x1="23" y1="18" x2="23" y2="30" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round"/>
              <line x1="14" y1="23" x2="32" y2="23" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round"/>
              <line x1="23" y1="30" x2="16" y2="40" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round"/>
              <line x1="23" y1="30" x2="30" y2="40" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round"/>`;
            break;
        case "tank":
            // Top-down hull + turret circle + barrel
            center = `
              <rect x="10" y="17" width="26" height="16" rx="3" stroke="${strokeColor}" stroke-width="2.2" fill="none"/>
              <circle cx="23" cy="25" r="5" stroke="${strokeColor}" stroke-width="2" fill="none"/>
              <line x1="23" y1="20" x2="23" y2="7" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>`;
            break;
        case "artillery":
            // Two wheels + axle + angled barrel
            center = `
              <circle cx="14" cy="33" r="5" stroke="${strokeColor}" stroke-width="2" fill="none"/>
              <circle cx="32" cy="33" r="5" stroke="${strokeColor}" stroke-width="2" fill="none"/>
              <line x1="9" y1="33" x2="37" y2="33" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round"/>
              <line x1="23" y1="33" x2="31" y2="11" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>`;
            break;
        case "helicopter":
            // Rotor cross + centre body
            center = `
              <circle cx="23" cy="23" r="4.5" stroke="${strokeColor}" stroke-width="2" fill="none"/>
              <line x1="23" y1="6" x2="23" y2="18" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="23" y1="28" x2="23" y2="40" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="6" y1="23" x2="18" y2="23" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="28" y1="23" x2="40" y2="23" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>`;
            break;
        case "position":
            // Diamond with inner dot — observation post
            center = `
              <path d="M23 7 L39 23 L23 39 L7 23 Z" stroke="${strokeColor}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
              <circle cx="23" cy="23" r="3" stroke="${strokeColor}" stroke-width="1.8" fill="none"/>`;
            break;
        case "humvee":
            // Top-down 4×4: body + 4 wheel blocks
            center = `
              <rect x="13" y="14" width="20" height="20" rx="2" stroke="${strokeColor}" stroke-width="2.2" fill="none"/>
              <line x1="13" y1="21" x2="33" y2="21" stroke="${strokeColor}" stroke-width="1.5"/>
              <rect x="8"  y="13" width="5" height="7" rx="1.5" stroke="${strokeColor}" stroke-width="1.8" fill="none"/>
              <rect x="33" y="13" width="5" height="7" rx="1.5" stroke="${strokeColor}" stroke-width="1.8" fill="none"/>
              <rect x="8"  y="28" width="5" height="7" rx="1.5" stroke="${strokeColor}" stroke-width="1.8" fill="none"/>
              <rect x="33" y="28" width="5" height="7" rx="1.5" stroke="${strokeColor}" stroke-width="1.8" fill="none"/>`;
            break;
        case "truck":
            // Cargo bed + smaller cab + 4 wheels
            center = `
              <rect x="7"  y="16" width="18" height="16" rx="1.5" stroke="${strokeColor}" stroke-width="2.2" fill="none"/>
              <rect x="25" y="19" width="12" height="10" rx="2"   stroke="${strokeColor}" stroke-width="2.2" fill="none"/>
              <rect x="5"  y="14" width="4"  height="6"  rx="1.5" stroke="${strokeColor}" stroke-width="1.5" fill="none"/>
              <rect x="19" y="14" width="4"  height="6"  rx="1.5" stroke="${strokeColor}" stroke-width="1.5" fill="none"/>
              <rect x="5"  y="28" width="4"  height="6"  rx="1.5" stroke="${strokeColor}" stroke-width="1.5" fill="none"/>
              <rect x="19" y="28" width="4"  height="6"  rx="1.5" stroke="${strokeColor}" stroke-width="1.5" fill="none"/>`;
            break;
    }
    let overlay = "";
    if (status === "wounded") {
        overlay = `<text x="23" y="52" text-anchor="middle"
                     font-size="12" fill="#ffcc00" font-weight="bold">!</text>`;
    }
    if (status === "damaged") {
        overlay = `
          <line x1="10" y1="36" x2="36" y2="10"
                stroke="#ff8800" stroke-width="3" stroke-linecap="round"/>`;
    }
    if (status === "dead" || status === "destroyed") {
        overlay = `
          <line x1="8" y1="8"  x2="38" y2="38"
                stroke="#ff4444" stroke-width="3" stroke-linecap="round"/>
          <line x1="38" y1="8" x2="8"  y2="38"
                stroke="#ff4444" stroke-width="3" stroke-linecap="round"/>`;
    }
    const fillOpacity = status === "alive" ? "0.08" : "0.05";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 46 46">
      <rect x="3" y="3" width="40" height="40" rx="2"
            fill="${borderColor}" fill-opacity="${fillOpacity}"
            stroke="${borderColor}" stroke-width="2"/>
      ${center}
      ${overlay}
    </svg>`;
}
// ─── POPULATE SYMBOL ROWS ─────────────────────────────────────────────────────
Object.entries(symbolGroups).forEach(([group, types]) => {
    const row = document.getElementById(`row-${group}`);
    if (!row) return;
    types.forEach((type) => {
        const btn = document.createElement("button");
        btn.className  = "symbolBtn";
        btn.title      = type.replace(/_/g, " ").toUpperCase();
        btn.innerHTML  = symbolSVG(type);
        btn.addEventListener("click", () => {
            selectedSymbol = type;
            document.querySelectorAll(".symbolBtn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
        row.appendChild(btn);
    });
});
// Activate first button
document.querySelector(".symbolBtn")?.classList.add("active");
// ─── MAP CONTROLS ─────────────────────────────────────────────────────────────
document.getElementById("zoomInBtn").addEventListener("click",  () => map.zoomIn());
document.getElementById("zoomOutBtn").addEventListener("click", () => map.zoomOut());
document.getElementById("fitBtn").addEventListener("click",     () => map.fitBounds(bounds));
document.getElementById("undoBtn").addEventListener("click",    undoLast);
async function undoLast() {
    if (undoStack.length === 0) return;
    const last = undoStack.pop();
    if (last.type === "marker") {
        await deleteDoc(doc(db, "markers", last.id));
    } else if (last.type === "drawing") {
        strokes = strokes.filter(s => s.firestoreId !== last.id);
        redrawAll();
        try {
            await deleteDoc(doc(db, "drawings", last.id));
        } catch (err) {
            console.error("Failed to delete drawing from Firestore:", err);
        }
    }
}
// ─── CLEAR MARKERS ────────────────────────────────────────────────────────────
document.getElementById("clearMarkersBtn").addEventListener("click", async () => {
    if (!confirm("Delete ALL markers? This cannot be undone.")) return;
    const snapshot = await getDocs(markersCollection);
    const batch    = writeBatch(db);
    snapshot.forEach(d => batch.delete(d.ref));
    await batch.commit();
    for (let i = undoStack.length - 1; i >= 0; i--) {
        if (undoStack[i].type === "marker") undoStack.splice(i, 1);
    }
});
// ─── CLEAR DRAWINGS ──────────────────────────────────────────────────────────
document.getElementById("clearDrawingsBtn").addEventListener("click", async () => {
    if (!confirm("Delete ALL drawings? This cannot be undone.")) return;
    strokes = [];
    redrawAll();
    for (let i = undoStack.length - 1; i >= 0; i--) {
        if (undoStack[i].type === "drawing") undoStack.splice(i, 1);
    }
    try {
        const snapshot = await getDocs(drawingsCollection);
        if (!snapshot.empty) {
            const batch = writeBatch(db);
            snapshot.forEach(d => batch.delete(d.ref));
            await batch.commit();
        }
    } catch (err) {
        console.error("Failed to clear drawings from Firestore:", err);
    }
});
// ─── FIRESTORE REALTIME — MARKERS ────────────────────────────────────────────
const displayedMarkers = {};
function createIcon(type) {
    return L.divIcon({
        html: symbolSVG(type, true),
        className: "",
        iconSize: [46, 46],
        iconAnchor: [23, 23]
    });
}
onSnapshot(markersCollection, (snapshot) => {
    const current = new Set();
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id   = docSnap.id;
        current.add(id);
        if (!displayedMarkers[id]) {
            const marker = L.marker([data.y, data.x], {
                icon: createIcon(data.type || "infantry_alive")
            }).addTo(map);
            marker.on("contextmenu", async () => {
                if (confirm("Delete this marker?")) {
                    await deleteDoc(doc(db, "markers", id));
                    const idx = undoStack.findIndex(e => e.type === "marker" && e.id === id);
                    if (idx !== -1) undoStack.splice(idx, 1);
                }
            });
            displayedMarkers[id] = marker;
        }
    });
    Object.keys(displayedMarkers).forEach((id) => {
        if (!current.has(id)) {
            map.removeLayer(displayedMarkers[id]);
            delete displayedMarkers[id];
        }
    });
    document.getElementById("markerCount").textContent =
        `MARKERS: ${Object.keys(displayedMarkers).length}`;
});
// ─── FIRESTORE REALTIME — DRAWINGS ───────────────────────────────────────────
onSnapshot(drawingsCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const id   = change.doc.id;
        const data = change.doc.data();
        if (change.type === "added") {
            if (!strokes.some(s => s.firestoreId === id)) {
                strokes.push({ ...data, firestoreId: id });
            }
        } else if (change.type === "modified") {
            const idx = strokes.findIndex(s => s.firestoreId === id);
            if (idx !== -1) {
                strokes[idx] = { ...data, firestoreId: id };
            }
        } else if (change.type === "removed") {
            strokes = strokes.filter(s => s.firestoreId !== id);
        }
    });
    redrawAll();
}, (error) => {
    console.error("Drawings sync error:", error);
});
// ─── ADD MARKERS ─────────────────────────────────────────────────────────────
map.on("click", async (e) => {
    if (drawMode || rulerMode) return;
    const docRef = await addDoc(markersCollection, {
        x:       e.latlng.lng,
        y:       e.latlng.lat,
        type:    selectedSymbol,
        created: Date.now()
    });
    undoStack.push({ type: "marker", id: docRef.id });
});
// ─── RIGHT-CLICK COORDINATE POPUP ────────────────────────────────────────────
const coordPopup = document.getElementById("coordPopup");
const popupBoth  = document.getElementById("popupBoth");
map.on("contextmenu", (e) => {
    if (drawMode || rulerMode) return;
    e.originalEvent.preventDefault();
    const x = parseFloat(e.latlng.lng.toFixed(4));
    const y = parseFloat(e.latlng.lat.toFixed(4));
    popupBoth.textContent = `X: ${x.toFixed(4)}, Y: ${y.toFixed(4)}`;
    const wrapper = document.getElementById("mapWrapper");
    const wRect   = wrapper.getBoundingClientRect();
    const eX      = e.originalEvent.clientX - wRect.left;
    const eY      = e.originalEvent.clientY - wRect.top;
    let left = eX + 8;
    let top  = eY + 8;
    const popW = 220, popH = 80;
    if (left + popW > wrapper.clientWidth)  left = eX - popW - 8;
    if (top  + popH > wrapper.clientHeight) top  = eY - popH - 8;
    coordPopup.style.left    = left + "px";
    coordPopup.style.top     = top  + "px";
    coordPopup.style.display = "block";
});
document.getElementById("coordPopupClose").addEventListener("click", () => {
    coordPopup.style.display = "none";
});
map.on("click", () => { coordPopup.style.display = "none"; });
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = "✓";
        btn.style.color = "#44ff88";
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ""; }, 1200);
    });
}
document.getElementById("copyBoth").addEventListener("click", () => copyToClipboard(popupBoth.textContent, document.getElementById("copyBoth")));
// ─── COORDINATE SEARCH ────────────────────────────────────────────────────────
const coordSearchInput = document.getElementById("coordSearchInput");
const coordSearchBtn   = document.getElementById("coordSearchBtn");
const coordSearchError = document.getElementById("coordSearchError");
function goToCoords() {
    const val = coordSearchInput.value.trim();
    coordSearchError.textContent = "";
    const clean = val.replace(/[XxYy:\s]/g, " ").trim();
    const parts = clean.split(/[\s,]+/).filter(Boolean);
    if (parts.length < 2) {
        coordSearchError.textContent = "Need X and Y values.";
        return;
    }
    const upperVal = val.toUpperCase();
    const xIdx = upperVal.indexOf("X");
    const yIdx = upperVal.indexOf("Y");
    let x, y;
    if (xIdx !== -1 && yIdx !== -1) {
        if (xIdx < yIdx) {
            x = parseFloat(parts[0]);
            y = parseFloat(parts[1]);
        } else {
            y = parseFloat(parts[0]);
            x = parseFloat(parts[1]);
        }
    } else {
        x = parseFloat(parts[0]);
        y = parseFloat(parts[1]);
    }
    if (isNaN(y) || isNaN(x)) {
        coordSearchError.textContent = "Invalid numbers.";
        return;
    }
    if (x < 0 || x > imageWidth || y < 0 || y > imageHeight) {
        coordSearchError.textContent = "Coordinates out of bounds.";
        return;
    }
    map.setView([y, x], 1);
    const flash = L.circleMarker([y, x], {
        radius: 12, color: "#4fa3ff", weight: 2,
        fillColor: "rgba(79,163,255,0.2)", fillOpacity: 1
    }).addTo(map);
    setTimeout(() => map.removeLayer(flash), 2000);
}
coordSearchBtn.addEventListener("click", goToCoords);
coordSearchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") goToCoords(); });
// ════════════════════════════════════════════════════════════════════
// DRAWING SYSTEM
// ════════════════════════════════════════════════════════════════════
const canvas = document.getElementById("drawCanvas");
const ctx    = canvas.getContext("2d");
// ─── CANVAS SIZING ───────────────────────────────────────────────────────────
function resizeCanvas() {
    const wrapper = document.getElementById("mapWrapper");
    canvas.width  = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    redrawAll();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
map.on("resize", resizeCanvas);
map.on("move zoom moveend zoomend", redrawAll);
// ─── COORDINATE HELPERS ──────────────────────────────────────────────────────
// FIX #4: ruler/canvas offset when panel collapsed.
// map.latLngToContainerPoint returns pixel coords relative to the map container element,
// which IS the mapWrapper div. The canvas is also sized to mapWrapper, so these already
// match — no correction needed there. The bug was that ruler mousemove used
// e.latlng (from map event) which is already correct, and llToCanvas uses
// map.latLngToContainerPoint which is relative to the map container. This should be
// consistent. However, if the panel collapses AFTER map init, the map container resizes
// and Leaflet needs to be told. We call map.invalidateSize() on panel transition.
function llToCanvas(lat, lng) {
    const pt = map.latLngToContainerPoint(L.latLng(lat, lng));
    return [pt.x, pt.y];
}
function canvasToLL(x, y) {
    return map.containerPointToLatLng(L.point(x, y));
}
// ─── POINT FORMAT HELPER ─────────────────────────────────────────────────────
function getPointCoords(pt) {
    if (Array.isArray(pt)) return { lat: pt[0], lng: pt[1] };
    return pt;
}
// ─── TOOL SELECTION ───────────────────────────────────────────────────────────
document.querySelectorAll(".drawToolBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
        activeTool = btn.dataset.tool;
        document.querySelectorAll(".drawToolBtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        canvas.dataset.tool = activeTool;
    });
});
document.querySelector('[data-tool="pen"]')?.classList.add("active");
// ─── DRAW MODE TOGGLE ─────────────────────────────────────────────────────────
const toggleBtn = document.getElementById("toggleDrawMode");
toggleBtn.addEventListener("click", () => {
    drawMode = !drawMode;
    if (drawMode && rulerMode) toggleRuler();
    toggleBtn.textContent = drawMode ? "ON" : "OFF";
    toggleBtn.classList.toggle("on", drawMode);
    canvas.classList.toggle("active", drawMode);
    map.dragging[drawMode ? "disable" : "enable"]();
    map.scrollWheelZoom[drawMode ? "disable" : "enable"]();
    document.getElementById("drawModeStatus").textContent = `DRAW: ${drawMode ? "ON" : "OFF"}`;
});
// ─── COLOR SWATCHES ───────────────────────────────────────────────────────────
document.querySelectorAll(".swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
        penColor = sw.dataset.color;
        document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
        sw.classList.add("active");
    });
});
// ─── PEN WIDTH SLIDER ─────────────────────────────────────────────────────────
const widthSlider = document.getElementById("penWidth");
const widthVal    = document.getElementById("penWidthVal");
widthSlider.addEventListener("input", () => {
    penWidth = parseInt(widthSlider.value);
    widthVal.textContent = penWidth;
});
// ─── REDRAW ALL STROKES ───────────────────────────────────────────────────────
function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(s => drawStroke(s));
    if (currentStroke) drawStroke(currentStroke);
    if (rulerMode && rulerPoints.length > 0) drawRulerOverlay();
}
function drawStroke(s) {
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.lineWidth   = s.width;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    if (s.tool === "pen") {
        ctx.beginPath();
        s.points.forEach((pt, i) => {
            const { lat, lng } = getPointCoords(pt);
            const [cx, cy] = llToCanvas(lat, lng);
            i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
        });
        ctx.stroke();
    } else if (s.tool === "line") {
        const [x1, y1] = llToCanvas(s.ll1.lat, s.ll1.lng);
        const [x2, y2] = llToCanvas(s.ll2.lat, s.ll2.lng);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    } else if (s.tool === "arrow") {
        const [x1, y1] = llToCanvas(s.ll1.lat, s.ll1.lng);
        const [x2, y2] = llToCanvas(s.ll2.lat, s.ll2.lng);
        drawArrow(ctx, x1, y1, x2, y2, s.color, s.width);
    } else if (s.tool === "circle") {
        const [x1, y1] = llToCanvas(s.ll1.lat, s.ll1.lng);
        const [x2, y2] = llToCanvas(s.ll2.lat, s.ll2.lng);
        const rx = Math.abs(x2 - x1) / 2;
        const ry = Math.abs(y2 - y1) / 2;
        const cx = x1 + (x2 - x1) / 2;
        const cy = y1 + (y2 - y1) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (s.tool === "rect") {
        const [x1, y1] = llToCanvas(s.ll1.lat, s.ll1.lng);
        const [x2, y2] = llToCanvas(s.ll2.lat, s.ll2.lng);
        ctx.beginPath();
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (s.tool === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = s.width * 5;
        ctx.beginPath();
        s.points.forEach((pt, i) => {
            const { lat, lng } = getPointCoords(pt);
            const [cx, cy] = llToCanvas(lat, lng);
            i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
        });
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
}
function drawArrow(ctx, x1, y1, x2, y2, color, width) {
    const headLen = Math.max(12, width * 4);
    const angle   = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - headLen * Math.cos(angle - Math.PI / 6),
        y2 - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        x2 - headLen * Math.cos(angle + Math.PI / 6),
        y2 - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}
// ─── SHAPE PREVIEW ───────────────────────────────────────────────────────────
function drawPreview(curX, curY) {
    redrawAll();
    ctx.save();
    ctx.strokeStyle = penColor;
    ctx.fillStyle   = penColor;
    ctx.lineWidth   = penWidth;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(startCanvasX, startCanvasY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
    } else if (activeTool === "arrow") {
        drawArrow(ctx, startCanvasX, startCanvasY, curX, curY, penColor, penWidth);
    } else if (activeTool === "circle") {
        const rx = Math.abs(curX - startCanvasX) / 2;
        const ry = Math.abs(curY - startCanvasY) / 2;
        const cx = startCanvasX + (curX - startCanvasX) / 2;
        const cy = startCanvasY + (curY - startCanvasY) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (activeTool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(startCanvasX, startCanvasY, curX - startCanvasX, curY - startCanvasY);
    }
    ctx.restore();
}
// ─── MOUSE EVENTS ────────────────────────────────────────────────────────────
canvas.addEventListener("mousedown", (e) => {
    if (!drawMode) return;
    isDrawing = true;
    const { offsetX: x, offsetY: y } = e;
    startCanvasX = x;
    startCanvasY = y;
    startMapLL   = canvasToLL(x, y);
    if (activeTool === "pen" || activeTool === "eraser") {
        const ll = canvasToLL(x, y);
        currentStroke = {
            tool:   activeTool,
            color:  penColor,
            width:  penWidth,
            points: [{ lat: ll.lat, lng: ll.lng }]
        };
    }
});
canvas.addEventListener("mousemove", (e) => {
    if (!drawMode || !isDrawing) return;
    const { offsetX: x, offsetY: y } = e;
    if (activeTool === "pen" || activeTool === "eraser") {
        const ll = canvasToLL(x, y);
        currentStroke.points.push({ lat: ll.lat, lng: ll.lng });
        redrawAll();
    } else {
        drawPreview(x, y);
    }
});
canvas.addEventListener("mouseup", async (e) => {
    if (!drawMode || !isDrawing) return;
    isDrawing = false;
    const { offsetX: x, offsetY: y } = e;
    if (activeTool === "pen" || activeTool === "eraser") {
        const strokeData = {
            tool:    currentStroke.tool,
            color:   currentStroke.color,
            width:   currentStroke.width,
            points:  currentStroke.points,
            created: Date.now()
        };
        currentStroke = null;
        try {
            const docRef = await addDoc(drawingsCollection, strokeData);
            undoStack.push({ type: "drawing", id: docRef.id });
        } catch (err) {
            console.error("Failed to save drawing:", err);
            const localId = "_local_" + Date.now() + "_" + Math.random();
            strokes.push({ ...strokeData, firestoreId: localId });
            undoStack.push({ type: "drawing", id: localId });
            redrawAll();
        }
    } else {
        const endLL = canvasToLL(x, y);
        const stroke = {
            tool:  activeTool,
            color: penColor,
            width: penWidth,
            ll1:   { lat: startMapLL.lat, lng: startMapLL.lng },
            ll2:   { lat: endLL.lat,      lng: endLL.lng },
            created: Date.now()
        };
        try {
            const docRef = await addDoc(drawingsCollection, stroke);
            undoStack.push({ type: "drawing", id: docRef.id });
        } catch (err) {
            console.error("Failed to save drawing:", err);
            const localId = "_local_" + Date.now() + "_" + Math.random();
            strokes.push({ ...stroke, firestoreId: localId });
            undoStack.push({ type: "drawing", id: localId });
            redrawAll();
        }
    }
});
canvas.addEventListener("mouseleave", async () => {
    if (isDrawing && currentStroke) {
        const strokeData = {
            tool:    currentStroke.tool,
            color:   currentStroke.color,
            width:   currentStroke.width,
            points:  currentStroke.points,
            created: Date.now()
        };
        currentStroke = null;
        isDrawing = false;
        try {
            const docRef = await addDoc(drawingsCollection, strokeData);
            undoStack.push({ type: "drawing", id: docRef.id });
        } catch (err) {
            console.error("Failed to save drawing:", err);
            const localId = "_local_" + Date.now() + "_" + Math.random();
            strokes.push({ ...strokeData, firestoreId: localId });
            undoStack.push({ type: "drawing", id: localId });
            redrawAll();
        }
    }
});
// ─── TOUCH SUPPORT ───────────────────────────────────────────────────────────
function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    return {
        offsetX: t.clientX - rect.left,
        offsetY: t.clientY - rect.top
    };
}
canvas.addEventListener("touchstart", (e) => {
    if (!drawMode) return;
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent("mousedown", getTouchPos(e)));
}, { passive: false });
canvas.addEventListener("touchmove", (e) => {
    if (!drawMode) return;
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent("mousemove", getTouchPos(e)));
}, { passive: false });
canvas.addEventListener("touchend", (e) => {
    if (!drawMode) return;
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent("mouseup", {
        offsetX: startCanvasX, offsetY: startCanvasY
    }));
}, { passive: false });
// ════════════════════════════════════════════════════════════════════
// RULER SYSTEM
// Scale: 142 pixels = 250 meters (at zoom 0)
// ════════════════════════════════════════════════════════════════════
const rulerBtn     = document.getElementById("rulerBtn");
const rulerTooltip = document.getElementById("rulerTooltip");
const rulerStatus  = document.getElementById("rulerStatus");
const rulerReadout = document.getElementById("rulerReadout");
function toggleRuler() {
    rulerMode = !rulerMode;
    if (rulerMode && drawMode) {
        drawMode = false;
        document.getElementById("toggleDrawMode").textContent = "OFF";
        document.getElementById("toggleDrawMode").classList.remove("on");
        canvas.classList.remove("active");
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        document.getElementById("drawModeStatus").textContent = "DRAW: OFF";
    }
    rulerBtn.classList.toggle("active", rulerMode);
    rulerStatus.textContent = `RULER: ${rulerMode ? "ON" : "OFF"}`;
    if (!rulerMode) {
        rulerPoints = [];
        rulerTooltip.style.display = "none";
        rulerReadout.textContent   = "";
        redrawAll();
    }
}
rulerBtn.addEventListener("click", toggleRuler);
function mapDistancePixels(ll1, ll2) {
    const p1 = map.latLngToContainerPoint(ll1);
    const p2 = map.latLngToContainerPoint(ll2);
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
function pixelsToMeters(pixelDist) {
    const zoom  = map.getZoom();
    const scale = Math.pow(2, zoom);
    const pxAt0 = pixelDist / scale;
    return pxAt0 / PIXELS_PER_METER;
}
function rulerTotalMeters() {
    let total = 0;
    for (let i = 1; i < rulerPoints.length; i++) {
        const px = mapDistancePixels(
            L.latLng(rulerPoints[i-1].lat, rulerPoints[i-1].lng),
            L.latLng(rulerPoints[i].lat,   rulerPoints[i].lng)
        );
        total += pixelsToMeters(px);
    }
    return total;
}
function formatDistance(meters) {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km  (${Math.round(meters)} m)`;
    }
    return `${Math.round(meters)} m`;
}
map.on("click", (e) => {
    if (!rulerMode) return;
    rulerPoints.push({ lat: e.latlng.lat, lng: e.latlng.lng });
    redrawAll();
    updateRulerReadout(e.latlng);
});
map.on("dblclick", (e) => {
    if (!rulerMode) return;
    L.DomEvent.stop(e);
    if (rulerPoints.length > 1) {
        const m = rulerTotalMeters();
        rulerReadout.textContent = `TOTAL: ${formatDistance(m)}`;
    }
    rulerPoints = [];
    redrawAll();
    rulerTooltip.style.display = "none";
});
// FIX #4: ruler mousemove — use map.latLngToContainerPoint for canvas coords,
// which is relative to the map container (= mapWrapper). The rulerTooltip is also
// inside mapWrapper, so positioning via containerPoint is correct regardless of
// whether the left panel is open or collapsed.
map.on("mousemove", (e) => {
    if (!rulerMode || rulerPoints.length === 0) return;
    redrawAll();
    const last = rulerPoints[rulerPoints.length - 1];
    const [lx, ly] = llToCanvas(last.lat, last.lng);
    // cur is in map-container-relative coords (same space as canvas)
    const cur = map.latLngToContainerPoint(e.latlng);
    ctx.save();
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(cur.x, cur.y);
    ctx.stroke();
    ctx.restore();
    const pxDist = Math.sqrt((cur.x - lx) ** 2 + (cur.y - ly) ** 2);
    const meters = pixelsToMeters(pxDist);
    rulerTooltip.textContent   = formatDistance(meters);
    rulerTooltip.style.display = "block";
    rulerTooltip.style.left    = (cur.x + 12) + "px";
    rulerTooltip.style.top     = (cur.y - 24) + "px";
});
function updateRulerReadout(latlng) {
    if (rulerPoints.length < 2) {
        rulerReadout.textContent = "Click to add points — double-click to finish";
        return;
    }
    const m = rulerTotalMeters();
    rulerReadout.textContent = `TOTAL: ${formatDistance(m)}`;
}
function drawRulerOverlay() {
    if (rulerPoints.length === 0) return;
    ctx.save();
    ctx.strokeStyle = "#ffcc00";
    ctx.fillStyle   = "#ffcc00";
    ctx.lineWidth   = 2;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    if (rulerPoints.length > 1) {
        ctx.beginPath();
        rulerPoints.forEach((pt, i) => {
            const [cx, cy] = llToCanvas(pt.lat, pt.lng);
            i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
        });
        ctx.stroke();
    }
    rulerPoints.forEach((pt, i) => {
        const [cx, cy] = llToCanvas(pt.lat, pt.lng);
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        if (i > 0) {
            let cumPx = 0;
            for (let j = 1; j <= i; j++) {
                cumPx += mapDistancePixels(
                    L.latLng(rulerPoints[j-1].lat, rulerPoints[j-1].lng),
                    L.latLng(rulerPoints[j].lat,   rulerPoints[j].lng)
                );
            }
            const meters = pixelsToMeters(cumPx);
            const label  = formatDistance(meters);
            ctx.font      = "bold 11px 'Share Tech Mono', monospace";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillText(label, cx + 8, cy - 5);
            ctx.fillStyle = "#ffcc00";
            ctx.fillText(label, cx + 7, cy - 6);
        }
    });
    ctx.restore();
}
// ─── LEFT PANEL COLLAPSE ─────────────────────────────────────────────────────
const collapseBtn  = document.getElementById("collapseLeftBtn");
const leftPanel    = document.getElementById("leftPanel");
let panelCollapsed = false;
collapseBtn.addEventListener("click", () => {
    panelCollapsed = !panelCollapsed;
    leftPanel.classList.toggle("collapsed", panelCollapsed);
    collapseBtn.classList.toggle("flipped", panelCollapsed);
    // FIX #4: tell Leaflet the map container changed size so all coordinate
    // transforms (latLngToContainerPoint etc.) recalculate correctly.
    // We wait for the CSS transition to finish (250ms) then invalidate.
    setTimeout(() => {
        map.invalidateSize({ animate: false });
        resizeCanvas();
        redrawAll();
    }, 260);
});
// ─── PER-SECTION COLLAPSE ────────────────────────────────────────────────────
document.querySelectorAll(".section-collapse-btn").forEach((btn) => {
    const targetId = btn.dataset.target;
    const body = document.getElementById(targetId);
    if (!body) return;
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isCollapsed = body.classList.toggle("collapsed");
        btn.classList.toggle("collapsed", isCollapsed);
        // If the symbols section is being expanded/collapsed, allow the
        // scrollable area to relayout
        if (targetId === "symbols-body") {
            // Force a reflow so the flex layout recalculates
            requestAnimationFrame(() => resizeCanvas());
        }
    });
});
// ════════════════════════════════════════════════════════════════════
// VEZHA — LIVE STREAMING SYSTEM
// ════════════════════════════════════════════════════════════════════
const vezha_sessions = collection(db, "vezha_sessions");
const vezha_signals  = collection(db, "vezha_signals");
const vezha_chat     = collection(db, "vezha_chat");

const myPeerId   = "peer_" + Math.random().toString(36).substr(2, 9);
const myShortId  = myPeerId.slice(-6).toUpperCase();
let vezhaActive    = false;
let localStream    = null;
let mySessionRef   = null;
let vezhaUnsubs    = [];
let chatUnsub      = null;
let processedSigs  = new Set();
const peers        = {};
let vezhaEnterTime = 0;
let heartbeatTimer = null;

const ICE_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
    ]
};

// Best-effort cleanup on tab close
window.addEventListener("beforeunload", () => {
    if (mySessionRef) deleteDoc(mySessionRef);
});

// ─── VIEW SWITCHING ───────────────────────────────────────────────────────────
const mapViewBtn   = document.getElementById("mapViewBtn");
const vezhaViewBtn = document.getElementById("vezhaViewBtn");
const brandModule  = document.getElementById("brandModule");

mapViewBtn.addEventListener("click",   () => { if (vezhaActive)  exitVezha(); });
vezhaViewBtn.addEventListener("click", () => { if (!vezhaActive) enterVezha(); });

async function enterVezha() {
    vezhaActive    = true;
    vezhaEnterTime = Date.now();

    document.getElementById("appBody").style.display = "none";
    document.getElementById("vezhaView").classList.add("active");
    brandModule.textContent = "VEZHA";
    mapViewBtn.classList.remove("active");
    vezhaViewBtn.classList.add("active");

    // ── Purge stale sessions (no heartbeat for >60 s) ──
    try {
        const all = await getDocs(vezha_sessions);
        const b   = writeBatch(db);
        let dirty = false;
        all.forEach(d => {
            const ls = d.data().lastSeen || d.data().created || 0;
            if (Date.now() - ls > 60000) { b.delete(d.ref); dirty = true; }
        });
        if (dirty) await b.commit();
    } catch (e) { /* non-fatal */ }

    // ── Register presence ──
    mySessionRef = await addDoc(vezha_sessions, {
        userId: myPeerId, lastSeen: Date.now(), created: Date.now()
    });

    // ── Heartbeat every 15 s ──
    heartbeatTimer = setInterval(async () => {
        if (mySessionRef) {
            try { await updateDoc(mySessionRef, { lastSeen: Date.now() }); } catch (_) {}
        }
    }, 15000);

    // ── Listen for WebRTC signals directed to me ──
    const unsubSig = onSnapshot(
        query(vezha_signals, where("to", "==", myPeerId)),
        snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added" && !processedSigs.has(change.doc.id)) {
                    const sig = change.doc.data();
                    if (sig.created >= vezhaEnterTime - 5000) {
                        processedSigs.add(change.doc.id);
                        handleSignal(sig, change.doc.id);
                    }
                }
            });
        }
    );
    vezhaUnsubs.push(unsubSig);

    // ── Listen for peer sessions ──
    const unsubSess = onSnapshot(vezha_sessions, snapshot => {
        snapshot.docChanges().forEach(change => {
            const uid = change.doc.data().userId;
            if (uid === myPeerId) return;
            if (change.type === "added"   && localStream) createOffer(uid);
            if (change.type === "removed") removePeer(uid);
        });
        // Count only peers with a recent heartbeat
        const now = Date.now();
        let count = 0;
        snapshot.forEach(d => {
            const data = d.data();
            if (data.userId !== myPeerId) {
                const ls = data.lastSeen || data.created || 0;
                if (now - ls < 45000) count++;
            }
        });
        document.getElementById("vezhaStatus").textContent = `OPERATORS: ${count} ONLINE`;
    });
    vezhaUnsubs.push(unsubSess);

    // ── Subscribe to chat ──
    document.getElementById("vezhaChatMessages").innerHTML = "";
    chatUnsub = onSnapshot(
        query(vezha_chat, orderBy("created", "asc")),
        snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") renderChatMessage(change.doc.data());
            });
        }
    );

    updateTileLayout();
}

function exitVezha() {
    stopSharing();
    vezhaActive = false;

    clearInterval(heartbeatTimer); heartbeatTimer = null;
    if (mySessionRef) { deleteDoc(mySessionRef); mySessionRef = null; }
    vezhaUnsubs.forEach(u => u()); vezhaUnsubs = [];
    if (chatUnsub) { chatUnsub(); chatUnsub = null; }
    processedSigs.clear();
    Object.keys(peers).forEach(removePeer);

    document.getElementById("vezhaView").classList.remove("active");
    document.getElementById("appBody").style.display = "flex";
    brandModule.textContent = "MONITOR";
    vezhaViewBtn.classList.remove("active");
    mapViewBtn.classList.add("active");
}

// ─── SCREEN SHARING ───────────────────────────────────────────────────────────
document.getElementById("shareScreenBtn").addEventListener("click", shareScreen);
document.getElementById("stopSharingBtn").addEventListener("click", stopSharing);

async function shareScreen() {
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" }, audio: true
        });
        localStream.getVideoTracks()[0].addEventListener("ended", stopSharing);
        addVideoTile("self", localStream, "YOU  ·  BROADCASTING");
        document.getElementById("shareScreenBtn").style.display = "none";
        document.getElementById("stopSharingBtn").style.display = "flex";
        const snap = await getDocs(vezha_sessions);
        snap.forEach(d => {
            if (d.data().userId !== myPeerId) createOffer(d.data().userId);
        });
    } catch (err) {
        if (err.name !== "NotAllowedError") console.error("Screen share error:", err);
    }
}

function stopSharing() {
    if (!localStream) return;
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
    removeTile("self");
    document.getElementById("shareScreenBtn").style.display = "flex";
    document.getElementById("stopSharingBtn").style.display  = "none";
}

// ─── PEER CONNECTION ──────────────────────────────────────────────────────────
function getOrCreatePeer(userId) {
    if (peers[userId]) return peers[userId].pc;
    const pc = new RTCPeerConnection(ICE_CONFIG);
    peers[userId] = { pc };
    pc.addEventListener("icecandidate", e => {
        if (e.candidate) {
            addDoc(vezha_signals, { from: myPeerId, to: userId, type: "ice", data: e.candidate.toJSON(), created: Date.now() });
        }
    });
    pc.addEventListener("track", e => {
        addVideoTile(userId, e.streams[0], "OP · " + userId.slice(-6).toUpperCase());
    });
    pc.addEventListener("connectionstatechange", () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) removePeer(userId);
    });
    return pc;
}

async function createOffer(userId) {
    const pc = getOrCreatePeer(userId);
    if (localStream) localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    addDoc(vezha_signals, { from: myPeerId, to: userId, type: "offer", data: { sdp: offer.sdp, type: offer.type }, created: Date.now() });
}

async function handleSignal(sig, docId) {
    const { from, type, data } = sig;
    try {
        if (type === "offer") {
            const pc = getOrCreatePeer(from);
            if (localStream) localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
            await pc.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            addDoc(vezha_signals, { from: myPeerId, to: from, type: "answer", data: { sdp: answer.sdp, type: answer.type }, created: Date.now() });
        } else if (type === "answer") {
            const pc = peers[from]?.pc;
            if (pc && pc.signalingState !== "stable") await pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (type === "ice") {
            const pc = peers[from]?.pc;
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(data));
        }
    } catch (err) { console.error("Signal handling error:", err); }
    try { await deleteDoc(doc(db, "vezha_signals", docId)); } catch (_) {}
}

function removePeer(userId) {
    if (!peers[userId]) return;
    peers[userId].pc.close();
    delete peers[userId];
    removeTile(userId);
}

// ─── VIDEO TILES ──────────────────────────────────────────────────────────────
function addVideoTile(id, stream, label) {
    removeTile(id);
    const grid = document.getElementById("vezhaGrid");
    const tile = document.createElement("div");
    tile.className = "vezha-tile" + (id === "self" ? " vezha-tile-self" : "");
    tile.id = "tile-" + id;
    const video = document.createElement("video");
    video.autoplay = true; video.muted = (id === "self"); video.playsInline = true;
    video.srcObject = stream;
    const lbl = document.createElement("div");
    lbl.className = "vezha-tile-label mono"; lbl.textContent = label;
    tile.appendChild(video); tile.appendChild(lbl);
    grid.appendChild(tile);
    updateTileLayout();
}

function removeTile(id) {
    document.getElementById("tile-" + id)?.remove();
    updateTileLayout();
}

function updateTileLayout() {
    const grid  = document.getElementById("vezhaGrid");
    const count = grid.querySelectorAll(".vezha-tile").length;
    grid.setAttribute("data-count", String(count));
    const empty = document.getElementById("vezhaEmpty");
    if (empty) empty.style.display = count === 0 ? "flex" : "none";
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
document.getElementById("vezhaChatSend").addEventListener("click", sendChat);
document.getElementById("vezhaChatInput").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
});

async function sendChat() {
    const input = document.getElementById("vezhaChatInput");
    const text  = input.value.trim();
    if (!text || !vezhaActive) return;
    input.value = "";
    try {
        await addDoc(vezha_chat, { userId: myPeerId, shortId: myShortId, text, created: Date.now() });
    } catch (err) { console.error("Chat error:", err); }
}

function renderChatMessage(data) {
    const isMine = data.userId === myPeerId;
    const msgs   = document.getElementById("vezhaChatMessages");
    const el     = document.createElement("div");
    el.className = "chat-msg" + (isMine ? " chat-msg-mine" : "");
    const d   = new Date(data.created);
    const hh  = String(d.getHours()).padStart(2, "0");
    const mm  = String(d.getMinutes()).padStart(2, "0");
    el.innerHTML = `
      <div class="chat-msg-meta">
        <span class="chat-msg-author">${isMine ? "YOU" : (data.shortId || data.userId.slice(-6).toUpperCase())}</span>
        <span class="chat-msg-time mono">${hh}:${mm}</span>
      </div>
      <div class="chat-msg-text">${escHtml(data.text)}</div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
}

function escHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─── THEME TOGGLE ────────────────────────────────────────────────────────────
const themeToggleBtn = document.getElementById("themeToggleBtn");
let isLightTheme = false;
themeToggleBtn.addEventListener("click", () => {
    isLightTheme = !isLightTheme;
    document.body.classList.toggle("light-theme", isLightTheme);
    themeToggleBtn.title = isLightTheme ? "Switch to dark theme" : "Switch to light theme";
    themeToggleBtn.classList.toggle("active", isLightTheme);
    const themeIcon = document.getElementById("themeIcon");
    if (isLightTheme) {
        themeIcon.innerHTML = `
            <path d="M13 9a5 5 0 1 1-5.93-4.93A7 7 0 0 0 13 9z"
                  stroke="currentColor" stroke-width="1.3" fill="none"
                  stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
        themeIcon.innerHTML = `
            <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3" fill="none"/>
            <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="2.9" y1="2.9" x2="4.3" y2="4.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="11.7" y1="11.7" x2="13.1" y2="13.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="11.7" y1="4.3" x2="13.1" y2="2.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="2.9" y1="13.1" x2="4.3" y2="11.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`;
    }
});
