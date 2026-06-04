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
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "XXXXXXXX",
    appId: "XXXXXXXX"
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
