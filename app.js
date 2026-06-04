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
    writeBatch
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
const markersCollection = collection(db, "markers");

// ─── MAP ─────────────────────────────────────────────────────────────────────
const imageWidth  = 1204;
const imageHeight = 1090;

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

// ─── CLOCK ───────────────────────────────────────────────────────────────────
function updateClock() {
    const now = new Date();
    const z = (n) => String(n).padStart(2, "0");
    document.getElementById("clock").textContent =
        `${z(now.getUTCHours())}:${z(now.getUTCMinutes())}:${z(now.getUTCSeconds())}Z`;
}
updateClock();
setInterval(updateClock, 1000);

// ─── STATUS BAR ──────────────────────────────────────────────────────────────
map.on("mousemove", (e) => {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);
    document.getElementById("statusCoords").textContent = `Y: ${lat}  X: ${lng}`;
    document.getElementById("coordDisplay").textContent  = `Y: ${lat}, X: ${lng}`;
});

map.on("zoomend", () => {
    document.getElementById("zoomLevel").textContent = `Z: ${map.getZoom()}`;
});

// ─── SYMBOL DEFINITIONS ──────────────────────────────────────────────────────
const symbolGroups = {
    infantry: ["infantry_alive", "infantry_wounded", "infantry_dead"],
    tank:     ["tank_alive",     "tank_damaged",     "tank_destroyed"],
    position: ["position_alive",                     "position_destroyed"],
    humvee:   ["humvee_alive",   "humvee_damaged",   "humvee_destroyed"],
    truck:    ["truck_alive",    "truck_damaged",    "truck_destroyed"]
};

const statusColors = {
    alive:     "#4fa3ff",
    wounded:   "#ffcc00",
    damaged:   "#ff8800",
    dead:      "#ff4444",
    destroyed: "#ff4444"
};

let selectedSymbol = "infantry_alive";

// ─── SVG BUILDER ─────────────────────────────────────────────────────────────
function symbolSVG(type = "infantry_alive", forMap = false) {
    const parts  = type.split("_");
    const status = parts[parts.length - 1];
    const unit   = parts.slice(0, -1).join("_");
    const size   = forMap ? 46 : 46;

    const borderColor = statusColors[status] || "#4fa3ff";

    let center = "";
    switch (unit) {
        case "infantry":
            center = `
              <line x1="10" y1="10" x2="36" y2="36" stroke="#0a0c10" stroke-width="2.8"/>
              <line x1="36" y1="10" x2="10" y2="36" stroke="#0a0c10" stroke-width="2.8"/>`;
            break;
        case "tank":
            center = `<rect x="10" y="17" width="26" height="12" rx="1"
                        fill="none" stroke="#0a0c10" stroke-width="2.5"/>`;
            break;
        case "position":
            center = `<circle cx="23" cy="23" r="8"
                        fill="none" stroke="#0a0c10" stroke-width="2.5"/>`;
            break;
        case "humvee":
            center = `<rect x="12" y="17" width="22" height="12" rx="1"
                        fill="none" stroke="#0a0c10" stroke-width="2.5"/>`;
            break;
        case "truck":
            center = `
              <rect x="9" y="16" width="18" height="12" rx="1"
                fill="none" stroke="#0a0c10" stroke-width="2.5"/>
              <rect x="27" y="19" width="10" height="9" rx="1"
                fill="none" stroke="#0a0c10" stroke-width="2.5"/>`;
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
document.getElementById("undoBtn").addEventListener("click",    undoLastMarker);

// ─── MARKER UNDO ─────────────────────────────────────────────────────────────
const markerHistory = [];

async function undoLastMarker() {
    const last = markerHistory.pop();
    if (last) await deleteDoc(doc(db, "markers", last));
}

// ─── CLEAR MARKERS ────────────────────────────────────────────────────────────
document.getElementById("clearMarkersBtn").addEventListener("click", async () => {
    if (!confirm("Delete ALL markers? This cannot be undone.")) return;
    const snapshot = await getDocs(markersCollection);
    const batch    = writeBatch(db);
    snapshot.forEach(d => batch.delete(d.ref));
    await batch.commit();
    markerHistory.length = 0;
});

// ─── FIRESTORE REALTIME ───────────────────────────────────────────────────────
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
                    const idx = markerHistory.indexOf(id);
                    if (idx !== -1) markerHistory.splice(idx, 1);
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

// ─── ADD MARKERS ─────────────────────────────────────────────────────────────
map.on("click", async (e) => {
    if (drawMode) return;   // don't place markers while drawing
    const docRef = await addDoc(markersCollection, {
        x:       e.latlng.lng,
        y:       e.latlng.lat,
        type:    selectedSymbol,
        created: Date.now()
    });
    markerHistory.push(docRef.id);
});

// ════════════════════════════════════════════════════════════════════
// DRAWING SYSTEM
// ════════════════════════════════════════════════════════════════════
const canvas = document.getElementById("drawCanvas");
const ctx    = canvas.getContext("2d");

let drawMode    = false;
let activeTool  = "pen";
let penColor    = "#ff4444";
let penWidth    = 3;
let isDrawing   = false;
let startX = 0, startY = 0;

// Persistent strokes (so we can redraw under shapes-in-progress)
let strokes = [];         // array of stroke objects
let currentStroke = null; // path points for freehand

function resizeCanvas() {
    const wrapper = document.getElementById("mapWrapper");
    canvas.width  = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    redrawAll();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
map.on("resize", resizeCanvas);

// ─── TOOL SELECTION ───
document.querySelectorAll(".drawToolBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
        activeTool = btn.dataset.tool;
        document.querySelectorAll(".drawToolBtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        canvas.dataset.tool = activeTool;
    });
});
// Activate pen by default
document.querySelector('[data-tool="pen"]')?.classList.add("active");

// ─── DRAW MODE TOGGLE ───
const toggleBtn = document.getElementById("toggleDrawMode");
toggleBtn.addEventListener("click", () => {
    drawMode = !drawMode;
    toggleBtn.textContent = drawMode ? "ON" : "OFF";
    toggleBtn.classList.toggle("on", drawMode);
    canvas.classList.toggle("active", drawMode);
    map.dragging[drawMode ? "disable" : "enable"]();
    map.scrollWheelZoom[drawMode ? "disable" : "enable"]();
    document.getElementById("drawModeStatus").textContent = `DRAW: ${drawMode ? "ON" : "OFF"}`;
});

// ─── COLOR SWATCHES ───
document.querySelectorAll(".swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
        penColor = sw.dataset.color;
        document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
        sw.classList.add("active");
    });
});

// ─── PEN WIDTH SLIDER ───
const widthSlider = document.getElementById("penWidth");
const widthVal    = document.getElementById("penWidthVal");
widthSlider.addEventListener("input", () => {
    penWidth = parseInt(widthSlider.value);
    widthVal.textContent = penWidth;
});

// ─── CLEAR DRAWINGS ───
document.getElementById("clearDrawingsBtn").addEventListener("click", () => {
    strokes = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// ─── REDRAW ALL STROKES ───
function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(drawStroke);
}

function drawStroke(s) {
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.lineWidth   = s.width;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    if (s.tool === "pen") {
        ctx.beginPath();
        s.points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.stroke();

    } else if (s.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();

    } else if (s.tool === "arrow") {
        drawArrow(ctx, s.x1, s.y1, s.x2, s.y2, s.color, s.width);

    } else if (s.tool === "circle") {
        const rx = Math.abs(s.x2 - s.x1) / 2;
        const ry = Math.abs(s.y2 - s.y1) / 2;
        const cx = s.x1 + (s.x2 - s.x1) / 2;
        const cy = s.y1 + (s.y2 - s.y1) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

    } else if (s.tool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);

    } else if (s.tool === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = s.width * 5;
        ctx.beginPath();
        s.points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color, width) {
    const headLen  = Math.max(12, width * 4);
    const angle    = Math.atan2(y2 - y1, x2 - x1);

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

// ─── PREVIEW LAYER (shapes-in-progress) ───
function drawPreview(x2, y2) {
    redrawAll();
    ctx.save();
    ctx.strokeStyle = penColor;
    ctx.fillStyle   = penColor;
    ctx.lineWidth   = penWidth;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x2, y2);
        ctx.stroke();

    } else if (activeTool === "arrow") {
        drawArrow(ctx, startX, startY, x2, y2, penColor, penWidth);

    } else if (activeTool === "circle") {
        const rx = Math.abs(x2 - startX) / 2;
        const ry = Math.abs(y2 - startY) / 2;
        const cx = startX + (x2 - startX) / 2;
        const cy = startY + (y2 - startY) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

    } else if (activeTool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(startX, startY, x2 - startX, y2 - startY);
    }

    ctx.restore();
}

// ─── MOUSE EVENTS ───────────────────────────────────────────────────────────
canvas.addEventListener("mousedown", (e) => {
    if (!drawMode) return;
    isDrawing = true;
    const { offsetX: x, offsetY: y } = e;
    startX = x; startY = y;

    if (activeTool === "pen" || activeTool === "eraser") {
        currentStroke = {
            tool:   activeTool,
            color:  penColor,
            width:  penWidth,
            points: [[x, y]]
        };
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawMode || !isDrawing) return;
    const { offsetX: x, offsetY: y } = e;

    if (activeTool === "pen" || activeTool === "eraser") {
        currentStroke.points.push([x, y]);
        redrawAll();
        drawStroke(currentStroke);

    } else {
        drawPreview(x, y);
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (!drawMode || !isDrawing) return;
    isDrawing = false;
    const { offsetX: x, offsetY: y } = e;

    if (activeTool === "pen" || activeTool === "eraser") {
        strokes.push(currentStroke);
        currentStroke = null;
        redrawAll();

    } else {
        strokes.push({
            tool:  activeTool,
            color: penColor,
            width: penWidth,
            x1: startX, y1: startY,
            x2: x,      y2: y
        });
        redrawAll();
    }
});

canvas.addEventListener("mouseleave", () => {
    if (isDrawing && currentStroke) {
        strokes.push(currentStroke);
        currentStroke = null;
        isDrawing = false;
        redrawAll();
    }
});

// ─── TOUCH SUPPORT ──────────────────────────────────────────────────────────
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
        offsetX: startX, offsetY: startY
    }));
}, { passive: false });
