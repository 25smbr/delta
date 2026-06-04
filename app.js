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

const bounds = [[0,0],[H,W]];

L.imageOverlay("map.png", bounds).addTo(map);
map.fitBounds(bounds);
map.setMaxBounds(bounds);

// ---------------- STATE ----------------

const markersCollection = collection(db, "markers");
const drawingsCollection = collection(db, "drawings");

const markers = {};
const polylines = {};

let drawMode = false;
let drawPoints = [];

let selectedSymbol = "friendly_infantry_alive";

// ---------------- ICON ----------------

function symbolSVG(type) {

    const [faction, unit, status] = type.split("_");

    let center = "";

    switch(unit) {
        case "infantry":
            center = `<line x1="10" y1="10" x2="50" y2="50" stroke="black" stroke-width="3"/>
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

    const color = faction === "enemy" ? "#ff4d4d" : "#4da3ff";

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
        <rect x="5" y="5" width="50" height="50"
              fill="#111"
              stroke="${color}"
              stroke-width="2"/>
        ${center}
        ${overlay}
    </svg>`;
}

function createIcon(type) {
    return L.divIcon({
        html: symbolSVG(type),
        className: "",
        iconSize: [60,60],
        iconAnchor: [30,30]
    });
}

// ---------------- UI ----------------

const panel = document.getElementById("panel");

const structure = {
    friendly: {
        infantry: ["alive","wounded","dead"],
        tank: ["alive","damaged","destroyed"],
        humvee: ["alive","damaged","destroyed"],
        truck: ["alive","damaged","destroyed"],
        position: ["alive","destroyed"]
    },
    enemy: {
        infantry: ["alive","wounded","dead"],
        tank: ["alive","damaged","destroyed"],
        humvee: ["alive","damaged","destroyed"],
        truck: ["alive","damaged","destroyed"],
        position: ["alive","destroyed"]
    }
};

function addBtn(type) {

    const btn = document.createElement("button");
    btn.className = "unitBtn";
    btn.innerHTML = symbolSVG(type);

    btn.onclick = () => {
        selectedSymbol = type;
        document.querySelectorAll(".unitBtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    };

    panel.appendChild(btn);
}

for (const faction in structure) {

    const title = document.createElement("div");
    title.className = "factionTitle";
    title.textContent = faction.toUpperCase();
    panel.appendChild(title);

    for (const unit in structure[faction]) {

        const label = document.createElement("div");
        label.className = "unitLabel";
        label.textContent = unit.toUpperCase();
        panel.appendChild(label);

        structure[faction][unit].forEach(status => {
            addBtn(`${faction}_${unit}_${status}`);
        });
    }
}

// ---------------- CONTROLS ----------------

document.getElementById("undoBtn").onclick = async () => {
    location.reload(); // simple safe undo reset (stable for realtime ops)
};

document.getElementById("clearBtn").onclick = async () => {
    if (!confirm("CLEAR ALL MARKERS?")) return;

    const snap = await getDocs(markersCollection);
    const batch = writeBatch(db);

    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
};

document.getElementById("drawBtn").onclick = () => {
    drawMode = !drawMode;
    drawPoints = [];
    alert(drawMode ? "DRAW MODE ON" : "DRAW MODE OFF");
};

// ---------------- MARKERS ----------------

onSnapshot(markersCollection, snap => {

    const alive = new Set();

    snap.forEach(d => {

        const data = d.data();
        const id = d.id;

        alive.add(id);

        if (!markers[id]) {

            const marker = L.marker([data.y, data.x], {
                icon: createIcon(data.type),
                draggable: true
            }).addTo(map);

            // DELETE (fixed confirmation)
            marker.on("contextmenu", async () => {
                if (!confirm("Delete this unit?")) return;
                await deleteDoc(doc(db,"markers",id));
            });

            // REPOSITION
            marker.on("dragend", async e => {
                const p = e.target.getLatLng();

                await setDoc(doc(db,"markers",id), {
                    ...data,
                    x: p.lng,
                    y: p.lat
                });
            });

            markers[id] = marker;
        }
    });

    Object.keys(markers).forEach(id => {
        if (!alive.has(id)) {
            map.removeLayer(markers[id]);
            delete markers[id];
        }
    });
});

// ---------------- ADD MARKER / DRAW ----------------

map.on("click", async e => {

    if (drawMode) {
        drawPoints.push([e.latlng.lat, e.latlng.lng]);

        if (drawPoints.length > 1) {
            if (window.tempLine) map.removeLayer(window.tempLine);

            window.tempLine = L.polyline(drawPoints, {
                color: "#4fa3ff",
                weight: 2
            }).addTo(map);
        }

        return;
    }

    await addDoc(markersCollection, {
        x: e.latlng.lng,
        y: e.latlng.lat,
        type: selectedSymbol,
        created: Date.now()
    });
});

// FINISH DRAW (right click)
map.on("contextmenu", async () => {

    if (!drawMode || drawPoints.length < 2) return;

    await addDoc(drawingsCollection, {
        points: drawPoints,
        created: Date.now()
    });

    drawPoints = [];
});
