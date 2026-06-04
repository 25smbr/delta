import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDUTJ3Nz8tY7ZN52h3oA582qpw44wrCwac",
  authDomain: "delta-29dec.firebaseapp.com",
  projectId: "delta-29dec",
  storageBucket: "delta-29dec.firebasestorage.app",
  messagingSenderId: "441849295640",
  appId: "1:441849295640:web:2c2c7c7fb416a514e4646d",
  measurementId: "G-8ZCT1SJGGT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// IMAGE SIZE
const imageWidth = 4000;
const imageHeight = 2500;


// LEAFLET SIMPLE MAP
const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -3
});

const bounds = [
    [0, 0],
    [imageHeight, imageWidth]
];

L.imageOverlay("map.png", bounds).addTo(map);

map.fitBounds(bounds);


// MARKER STORAGE
const markersCollection = collection(db, "markers");

const displayedMarkers = {};


// REALTIME LISTENER
onSnapshot(markersCollection, (snapshot) => {

    const currentIds = new Set();

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();
        const id = docSnap.id;

        currentIds.add(id);

        if (!displayedMarkers[id]) {

            const marker = L.marker([
                data.y,
                data.x
            ]).addTo(map);

            marker.on("click", async () => {

                await deleteDoc(
                    doc(db, "markers", id)
                );

            });

            displayedMarkers[id] = marker;
        }
    });

    Object.keys(displayedMarkers).forEach(id => {

        if (!currentIds.has(id)) {

            map.removeLayer(displayedMarkers[id]);

            delete displayedMarkers[id];
        }
    });
});


// ADD MARKER ON CLICK
map.on("click", async (e) => {

    await addDoc(markersCollection, {
        x: e.latlng.lng,
        y: e.latlng.lat,
        created: Date.now()
    });

});