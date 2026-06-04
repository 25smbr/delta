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

const imageWidth = 1204;
const imageHeight = 1090;

const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 3,
    zoomControl: false
});

const bounds = [[0,0],[imageHeight,imageWidth]];

L.imageOverlay("map.png", bounds).addTo(map);

map.fitBounds(bounds);
map.setMaxBounds(bounds);

// ---------------- STATE ----------------

const markersCollection = collection(db, "markers");
const drawingsCollection = collection(db, "drawings");

const displayedMarkers = {};
const displayedDrawings = {};

const undoStack = [];

// drawing mode
let drawMode = false;
let currentLine = [];

// ---------------- UI ELEMENTS ----------------

const selectedLabel = document.getElementById("selectedLabel");

// ---------------- UNIT DEFINITIONS ----------------

const structure = {
    friendly: {
        infantry: ["alive", "wounded", "dead"],
        tank: ["alive", "damaged", "destroyed"],
        humvee: ["alive", "damaged", "destroyed"],
        truck: ["alive", "damaged", "destroyed"],
        position: ["alive", "destroyed"]
    },
    enemy: {
        infantry: ["alive", "wounded", "dead"],
        tank: ["alive", "damaged", "destroyed"],
        humvee: ["alive", "damaged", "destroyed"],
        truck: ["alive", "damaged", "destroyed"],
        position: ["alive", "destroyed"]
    }
};

let selectedSymbol = "friendly_infantry_alive";

// ---------------- SYMBOL SVG ----------------

function symbolSVG(type = "friendly_infantry_alive") {

    const parts = type.split("_");
    const faction = parts[0];
    const unit = parts[1];
    const status = parts[2];

    let center = "";

    switch(unit) {

        case "infantry":
            center =
                `<line x1="10" y1="10" x2="50" y2="50" stroke="black" stroke-width="3"/>
                 <line x1="50" y1="10" x2="10" y2="50" stroke="black" stroke-width="3"/>`;
            break;

        case "tank":
            center =
                `<rect x="15" y="22" width="30" height="16" fill="none" stroke="black" stroke-width="3"/>`;
            break;

        case "humvee":
            center =
                `<rect x="18" y="22" width="24" height="14" fill="none" stroke="black" stroke-width="3"/>`;
            break;

        case "truck":
            center =
                `<rect x="15" y="20" width="20" height="16" fill="none" stroke="black" stroke-width="3"/>
                 <rect x="35" y="24" width="10" height="12" fill="none" stroke="black" stroke-width="3"/>`;
            break;

        case "position":
            center =
                `<circle cx="30" cy="30" r="10" fill="none" stroke="black" stroke-width="3"/>`;
            break;
    }

    let overlay = "";

    if(status === "wounded") overlay = `<text x="30" y="58" text-anchor="middle" font-size="16" fill="orange">!</text>`;
    if(status === "damaged") overlay = `<line x1="12" y1="48" x2="48" y2="12" stroke="orange" stroke-width="4"/>`;
    if(status === "dead" || status === "destroyed")
        overlay = `<line x1="10" y1="10" x2="50" y2="50" stroke="red" stroke-width="4"/>
                   <line x1="50" y1="10" x2="10" y2="50" stroke="red" stroke-width="4"/>`;

    const color = faction === "enemy" ? "red" : "blue";

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
        <rect x="5" y="5" width="50" height="50" fill="white" stroke="${color}" stroke-width="3"/>
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

// ---------------- UI BUILDER ----------------

const panel = document.getElementById("panel");

function addButton(type) {
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

function buildUI() {

    for (const faction in structure) {

        const title = document.createElement("div");
        title.className = "factionTitle";
        title.innerText = faction.toUpperCase();
        panel.appendChild(title);

        for (const unit in structure[faction]) {

            const label = document.createElement("div");
            label.className = "unitLabel";
            label.innerText = unit;
            panel.appendChild(label);

            structure[faction][unit].forEach(status => {
                addButton(`${faction}_${unit}_${status}`);
            });
        }
    }
}

buildUI();

// ---------------- UNDO ----------------

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
};

// ---------------- CLEAR ----------------

document.getElementById("clearBtn").onclick = async () => {
    if (!confirm("Clear ALL markers?")) return;

    const snap = await getDocs(markersCollection);
    const batch = writeBatch(db);

    snap.forEach(d => batch.delete(d.ref));

    await batch.commit();
};

// ---------------- DRAW MODE ----------------

document.getElementById("drawBtn").onclick = () => {
    drawMode = !drawMode;
    currentLine = [];
};

// ---------------- SNAPSHOT MARKERS ----------------

onSnapshot(markersCollection, snapshot => {

    const current = new Set();

    snapshot.forEach(d => {

        const data = d.data();
        const id = d.id;

        current.add(id);

        if (!displayedMarkers[id]) {

            const marker = L.marker(
                [data.y, data.x],
                { icon: createIcon(data.type || "friendly_infantry_alive") }
            ).addTo(map);

            marker.on("contextmenu", async () => {

                const dataCopy = data;

                pushUndo({
                    type: "delete",
                    id,
                    data: dataCopy
                });

                await deleteDoc(doc(db,"markers",id));
            });

            displayedMarkers[id] = marker;

            pushUndo({ type: "add", id });
        }
    });

    Object.keys(displayedMarkers).forEach(id => {
        if (!current.has(id)) {
            map.removeLayer(displayedMarkers[id]);
            delete displayedMarkers[id];
        }
    });
});

// ---------------- ADD MARKERS ----------------

map.on("click", async e => {

    if (drawMode) {
        currentLine.push([e.latlng.lat, e.latlng.lng]);
        return;
    }

    const docRef = await addDoc(markersCollection, {
        x: e.latlng.lng,
        y: e.latlng.lat,
        type: selectedSymbol,
        created: Date.now()
    });

    pushUndo({ type: "add", id: docRef.id });
});

// finish drawing with right click
map.on("contextmenu", async () => {

    if (!drawMode || currentLine.length < 2) return;

    await addDoc(drawingsCollection, {
        points: currentLine,
        created: Date.now()
    });

    currentLine = [];
});
