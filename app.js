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
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const imageWidth = 1204;
const imageHeight = 1090;

const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 2,
    zoomControl: false
});

const bounds = [
    [0, 0],
    [imageHeight, imageWidth]
];

L.imageOverlay("map.png", bounds).addTo(map);

map.fitBounds(bounds);
map.setMaxBounds(bounds);
map.setView([imageHeight / 2, imageWidth / 2], 0);

// -------------------- ICON SYSTEM --------------------

const symbolTypes = [
    "infantry_alive",
    "infantry_wounded",
    "infantry_dead",

    "tank_alive",
    "tank_damaged",
    "tank_destroyed",

    "position_alive",
    "position_destroyed",

    "humvee_alive",
    "humvee_damaged",
    "humvee_destroyed",

    "truck_alive",
    "truck_damaged",
    "truck_destroyed"
];

let selectedSymbol = symbolTypes[0];

// -------------------- UI --------------------

const symbolGrid = document.getElementById("symbolGrid");

symbolTypes.forEach(type => {
    const btn = document.createElement("button");
    btn.className = "symbolBtn";
    btn.innerHTML = symbolSVG(type);

    btn.addEventListener("click", () => {
        selectedSymbol = type;

        document.querySelectorAll(".symbolBtn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
    });

    symbolGrid.appendChild(btn);
});

symbolGrid.firstChild.classList.add("active");

// Clear all button
const clearBtn = document.getElementById("clearMarkersBtn");

clearBtn.addEventListener("click", async () => {
    const ok = confirm("Delete ALL markers? This cannot be undone.");
    if (!ok) return;

    const snapshot = await getDocs(markersCollection);
    const batch = writeBatch(db);

    snapshot.forEach(d => {
        batch.delete(d.ref);
    });

    await batch.commit();
});

// -------------------- FIRESTORE --------------------

const markersCollection = collection(db, "markers");
const displayedMarkers = {};

function symbolSVG(type = "infantry_alive") {

    const status = type.split("_").pop();
    const unit = type.replace(`_${status}`, "");

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

        case "position":
            center =
                `<circle cx="30" cy="30" r="10" fill="none" stroke="black" stroke-width="3"/>`;
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
    }

    let overlay = "";

    if(status === "wounded") {
        overlay =
            `<text x="30" y="58"
             text-anchor="middle"
             font-size="16"
             fill="orange">!</text>`;
    }

    if(status === "damaged") {
        overlay =
            `<line x1="12" y1="48"
                   x2="48" y2="12"
                   stroke="orange"
                   stroke-width="4"/>`;
    }

    if(status === "dead" || status === "destroyed") {
        overlay =
            `<line x1="10" y1="10"
                   x2="50" y2="50"
                   stroke="red"
                   stroke-width="4"/>
             <line x1="50" y1="10"
                   x2="10" y2="50"
                   stroke="red"
                   stroke-width="4"/>`;
    }

    return `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="60"
         height="60">

        <rect x="5" y="5"
              width="50"
              height="50"
              fill="white"
              stroke="blue"
              stroke-width="3"/>

        ${center}
        ${overlay}

    </svg>`;
}

function createIcon(type) {
    return L.divIcon({
        html: symbolSVG(type),
        className: "",
        iconSize: [60, 60],
        iconAnchor: [30, 30]
    });
}

// -------------------- REALTIME --------------------

onSnapshot(markersCollection, snapshot => {

    const current = new Set();

    snapshot.forEach(docSnap => {

        const data = docSnap.data();
        const id = docSnap.id;

        current.add(id);

        if (!displayedMarkers[id]) {

            const marker = L.marker(
                [data.y, data.x],
                {
                    icon: createIcon(data.type || "infantry_alive")
                }
            ).addTo(map);

            marker.on("contextmenu", async () => {
                if (confirm("Delete marker?")) {
                    await deleteDoc(doc(db, "markers", id));
                }
            });

            displayedMarkers[id] = marker;
        }
    });

    Object.keys(displayedMarkers).forEach(id => {
        if (!current.has(id)) {
            map.removeLayer(displayedMarkers[id]);
            delete displayedMarkers[id];
        }
    });
});

// -------------------- ADD MARKERS --------------------

map.on("click", async e => {
    await addDoc(markersCollection, {
        x: e.latlng.lng,
        y: e.latlng.lat,
        type: selectedSymbol,
        created: Date.now()
    });
});
