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
    setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------------- FIREBASE ----------------

const firebaseConfig = {
  apiKey: "AIzaSyDUTJ3Nz8tY7ZN52tY7ZN52h3oA582qpw44wrCwac",
  authDomain: "delta-29dec.firebaseapp.com",
  projectId: "delta-29dec",
  storageBucket: "delta-29dec.firebasestorage.app",
  messagingSenderId: "441849295640",
  appId: "1:441849295640:web:2c2c7c7fb416a514e4646d",
  measurementId: "G-8ZCT1SJGGT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------- MAP ----------------

const W = 1204;
const H = 1090;

const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 3,
    zoomControl: false
});

L.imageOverlay("map.png", [[0,0],[H,W]]).addTo(map);
map.fitBounds([[0,0],[H,W]]);
map.setMaxBounds([[0,0],[H,W]]);

// ---------------- STATE ----------------

const markersCol = collection(db, "markers");
const drawingsCol = collection(db, "drawings");

const markers = {};
const drawings = {};

const undoStack = [];

// ---------------- ICON COLOR RESTORED ----------------

function symbolSVG(type) {

    const [faction, unit, status] = type.split("_");

    let color = faction === "enemy" ? "#ff4d4d" : "#4fa3ff";

    let center = "";

    switch(unit) {

        case "infantry":
            center = `
                <line x1="10" y1="10" x2="50" y2="50" stroke="black" stroke-width="3"/>
                <line x1="50" y1="10" x2="10" y2="50" stroke="black" stroke-width="3"/>`;
            break;

        case "tank":
            center = `<rect x="15" y="22" width="30" height="16" fill="none" stroke="black" stroke-width="3"/>`;
            break;

        case "humvee":
            center = `<rect x="18" y="22" width="24" height="14" fill="none" stroke="black" stroke-width="3"/>`;
            break;

        case "truck":
            center = `<rect x="15" y="20" width="20" height="16" fill="none" stroke="black" stroke-width="3"/>
                      <rect x="35" y="24" width="10" height="12" fill="none" stroke="black" stroke-width="3"/>`;
            break;

        case "position":
            center = `<circle cx="30" cy="30" r="10" fill="none" stroke="black" stroke-width="3"/>`;
            break;
    }

    let overlay = "";

    if(status === "wounded") overlay = `<text x="30" y="58" text-anchor="middle" font-size="16" fill="orange">!</text>`;
    if(status === "damaged") overlay = `<line x1="12" y1="48" x2="48" y2="12" stroke="orange" stroke-width="4"/>`;
    if(status === "dead" || status === "destroyed")
        overlay = `<line x1="10" y1="10" x2="50" y2="50" stroke="red" stroke-width="4"/>
                   <line x1="50" y1="10" x2="10" y2="50" stroke="red" stroke-width="4"/>`;

    return `
    <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="50" height="50"
              fill="#111"
              stroke="${color}"
              stroke-width="2"/>
        ${center}
        ${overlay}
    </svg>`;
}

function icon(type) {
    return L.divIcon({
        html: symbolSVG(type),
        className: "",
        iconSize: [60,60],
        iconAnchor: [30,30]
    });
}

// ---------------- UI ----------------

const panel = document.getElementById("panel");

// ---------------- MARKERS ----------------

let selectedSymbol = "friendly_infantry_alive";

function pushUndo(action) {
    undoStack.push(action);
}

document.getElementById("undoBtn").onclick = async () => {

    const last = undoStack.pop();
    if (!last) return;

    if (last.type === "add") {
        await deleteDoc(doc(db,"markers",last.id));
    }

    if (last.type === "delete") {
        await setDoc(doc(db,"markers",last.id), last.data);
    }

    if (last.type === "move") {
        await setDoc(doc(db,"markers",last.id), last.from);
    }
};

// FIXED CLEAR (markers only)
document.getElementById("clearBtn").onclick = async () => {
    if (!confirm("Clear ALL markers?")) return;

    const snap = await getDocs(markersCol);
    const batch = writeBatch(db);

    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
};

// ---------------- DRAWING TOOL SYSTEM ----------------

let drawMode = false;
let tool = "pen";
let color = "#4fa3ff";
let width = 2;

let tempShape = null;
let startPoint = null;

// UI controls
document.getElementById("drawBtn").onclick = () => {
    drawMode = !drawMode;
};

document.getElementById("clearDrawBtn").onclick = async () => {
    const snap = await getDocs(drawingsCol);
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
};

// ---------------- MARKERS ----------------

onSnapshot(markersCol, snap => {

    const alive = new Set();

    snap.forEach(d => {

        const data = d.data();
        const id = d.id;

        alive.add(id);

        if (!markers[id]) {

            const m = L.marker([data.y, data.x], {
                icon: icon(data.type),
                draggable: true
            }).addTo(map);

            // DELETE FIXED
            m.on("contextmenu", async () => {
                if (!confirm("Delete unit?")) return;

                pushUndo({
                    type: "delete",
                    id,
                    data
                });

                await deleteDoc(doc(db,"markers",id));
            });

            // MOVE FIXED
            m.on("dragend", async e => {

                const p = e.target.getLatLng();

                const old = { ...data };

                pushUndo({
                    type: "move",
                    id,
                    from: old
                });

                await setDoc(doc(db,"markers",id), {
                    ...data,
                    x: p.lng,
                    y: p.lat
                });
            });

            markers[id] = m;
        }
    });

    Object.keys(markers).forEach(id => {
        if (!alive.has(id)) {
            map.removeLayer(markers[id]);
            delete markers[id];
        }
    });
});

// ---------------- DRAWING ----------------

map.on("mousedown", e => {
    if (!drawMode) return;

    startPoint = e.latlng;

    if (tool === "pen") {
        tempShape = L.polyline([startPoint], { color, weight: width }).addTo(map);
    }
});

map.on("mousemove", e => {
    if (!drawMode || !startPoint) return;

    if (tool === "pen" && tempShape) {
        tempShape.addLatLng(e.latlng);
    }
});

map.on("mouseup", async e => {

    if (!drawMode) return;

    const end = e.latlng;

    let shape = null;

    if (tool === "line") {
        shape = L.polyline([startPoint, end], { color, weight: width }).addTo(map);
    }

    if (tool === "circle") {
        shape = L.circle(startPoint, {
            radius: startPoint.distanceTo(end),
            color,
            weight: width
        }).addTo(map);
    }

    if (tool === "rect") {
        const b = L.latLngBounds(startPoint, end);
        shape = L.rectangle(b, { color, weight: width }).addTo(map);
    }

    if (tool === "arrow") {
        shape = L.polyline([startPoint, end], {
            color,
            weight: width
        }).addTo(map);
    }

    if (shape) {
        const ref = await addDoc(drawingsCol, {
            tool,
            color,
            width,
            points: [startPoint, end],
            created: Date.now()
        });

        shape._id = ref.id;
    }

    tempShape = null;
    startPoint = null;
});
