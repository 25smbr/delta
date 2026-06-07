import { initializeApp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    deleteDoc,
    doc,
    getDoc,
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

// ─── i18n (must be before initFilterUI) ──────────────────────────────────────
const i18n = {
    en: {
        filter: "FILTER", unitSymbols: "UNIT SYMBOLS",
        drawings: "DRAW TOOLS", coordinates: "GO TO COORDINATES",
        infantry: "INFANTRY", tank: "ARMOR", artillery: "ARTILLERY",
        helicopter: "HELICOPTER", position: "POSITION",
        humvee: "HUMVEE", truck: "TRUCK", uav: "UAV",
        width: "WIDTH", color: "COLOR",
        clearAll: "CLEAR ALL MARKERS", clearDrawings: "CLEAR DRAWINGS",
        markers: n => `MARKERS: ${n}`,
        drawOff: "DRAW: OFF", drawOn: "DRAW: ON",
        rulerOff: "RULER: OFF", rulerOn: "RULER: ON",
        coordsLabel: "COORDS",
        shareScreen: "SHARE SCREEN", stopSharing: "STOP SHARING",
        noStreams: "NO ACTIVE STREAMS",
        streamHint: "Click SHARE SCREEN to broadcast your display to all connected operators",
        operators: n => `OPERATORS: ${n} ONLINE`,
        unmute: "UNMUTE", mute: "MUTE", deafen: "DEAFEN", undeafen: "UNDEAFEN",
        comms: "COMMS", typeMessage: "TYPE MESSAGE...", callsign: "CALLSIGN",
        roleOperator: "OPERATOR", roleCommander: "COMMANDER",
        roleDrone: "DRONE PILOT", roleSniper: "SNIPER",
        roleMedic: "MEDIC", roleIntel: "INTEL",
        accountTitle: "ACCOUNT",
        login: "LOGIN", register: "REGISTER",
        username: "USERNAME", password: "PASSWORD", confirmPassword: "CONFIRM PASSWORD",
        role: "ROLE",
        loginBtn: "LOG IN", registerBtn: "CREATE ACCOUNT",
        logout: "LOG OUT", loggedInAs: "LOGGED IN AS",
        errPassMatch: "Passwords do not match",
        errUserExists: "Username already taken",
        errBadCreds: "Invalid username or password",
        errFillAll: "Please fill in all fields",
        errPassLen: "Password must be at least 8 characters",
        errNetwork: "Network error — please try again",
        artyCalcTitle: "ARTILLERY CALCULATOR",
        artyConfig: "CONFIGURATION",
        artyGun: "GUN", artyProjectile: "PROJECTILE",
        artyGunPos: "GUN POSITION", artyTgtPos: "TARGET POSITION",
        artyHeightLabel: "HEIGHT DIFF (m)",
        artyCalcBtn: "CALCULATE",
        artyAzimuth: "AZIMUTH", artyDistance: "DISTANCE",
        artyLowArc: "LOW ARC", artyHighArc: "HIGH ARC", artyTof: "TOF",
        artyMapHint: "LMB = GUN  ·  RMB = TARGET",
        artyEnterCoords: "CLICK MAP OR ENTER COORDINATES TO CALCULATE",
        enemy: "ENEMY", friendly: "FRIENDLY",
    },
    ru: {
        filter: "ФИЛЬТР", unitSymbols: "СИМВОЛЫ ЕДИНИЦ",
        drawings: "РИСУНКИ", coordinates: "ПЕРЕЙТИ К КООРДИНАТАМ",
        infantry: "ПЕХОТА", tank: "БРОНЯ", artillery: "АРТИЛЛЕРИЯ",
        helicopter: "ВЕРТОЛЁТ", position: "ПОЗИЦИЯ",
        humvee: "ХАМВИ", truck: "ГРУЗОВИК", uav: "БПЛА",
        width: "ШИРИНА", color: "ЦВЕТ",
        clearAll: "УДАЛИТЬ ВСЕ МАРКЕРЫ", clearDrawings: "УДАЛИТЬ РИСУНКИ",
        markers: n => `МАРКЕРЫ: ${n}`,
        drawOff: "РИСУНОК: ВЫКЛ", drawOn: "РИСУНОК: ВКЛ",
        rulerOff: "ЛИНЕЙКА: ВЫКЛ", rulerOn: "ЛИНЕЙКА: ВКЛ",
        coordsLabel: "КООРДИНАТЫ",
        shareScreen: "ТРАНСЛЯЦИЯ", stopSharing: "СТОП",
        noStreams: "НЕТ АКТИВНЫХ ТРАНСЛЯЦИЙ",
        streamHint: "Нажмите ТРАНСЛЯЦИЯ чтобы транслировать экран всем операторам",
        operators: n => `ОПЕРАТОРОВ: ${n} В СЕТИ`,
        unmute: "ВКЛ МИК", mute: "ОТКЛ МИК", deafen: "ЗАГЛУШИТЬ", undeafen: "ЗВУК ВКЛ",
        comms: "СВЯЗЬ", typeMessage: "СООБЩЕНИЕ...", callsign: "ПОЗЫВНОЙ",
        roleOperator: "ОПЕРАТОР", roleCommander: "КОМАНДИР",
        roleDrone: "ПИЛОТ БПЛА", roleSniper: "СНАЙПЕР",
        roleMedic: "МЕДИК", roleIntel: "РАЗВЕДКА",
        accountTitle: "АККАУНТ",
        login: "ВОЙТИ", register: "РЕГИСТРАЦИЯ",
        username: "ЛОГИН", password: "ПАРОЛЬ", confirmPassword: "ПОВТОР ПАРОЛЯ",
        role: "РОЛЬ",
        loginBtn: "ВОЙТИ", registerBtn: "СОЗДАТЬ АККАУНТ",
        logout: "ВЫЙТИ", loggedInAs: "ВЫ ВОШЛИ КАК",
        errPassMatch: "Пароли не совпадают",
        errUserExists: "Это имя уже занято",
        errBadCreds: "Неверный логин или пароль",
        errFillAll: "Заполните все поля",
        errPassLen: "Пароль должен содержать минимум 8 символов",
        errNetwork: "Ошибка сети — попробуйте снова",
        artyCalcTitle: "АРТКАЛЬКУЛЯТОР",
        artyConfig: "КОНФИГУРАЦИЯ",
        artyGun: "ОРУДИЕ", artyProjectile: "СНАРЯД",
        artyGunPos: "ПОЗИЦИЯ ОРУДИЯ", artyTgtPos: "ПОЗИЦИЯ ЦЕЛИ",
        artyHeightLabel: "РАЗН. ВЫСОТ (м)",
        artyCalcBtn: "РАССЧИТАТЬ",
        artyAzimuth: "АЗИМУТ", artyDistance: "ДАЛЬНОСТЬ",
        artyLowArc: "НАСТИЛЬНАЯ", artyHighArc: "НАВЕСНАЯ", artyTof: "ВРЕМЯ ПОЛЁТА",
        artyMapHint: "ЛКМ = ОРУДИЕ  ·  ПКМ = ЦЕЛЬ",
        artyEnterCoords: "КЛИКНИТЕ НА КАРТУ ИЛИ ВВЕДИТЕ КООРДИНАТЫ",
        enemy: "ПРОТИВНИК", friendly: "СВОИ",
    },
    ua: {
        filter: "ФІЛЬТР", unitSymbols: "СИМВОЛИ ОДИНИЦЬ",
        drawings: "МАЛЮНКИ", coordinates: "ПЕРЕЙТИ ДО КООРДИНАТ",
        infantry: "ПІХОТА", tank: "БРОНЯ", artillery: "АРТИЛЕРІЯ",
        helicopter: "ВЕРТОЛІТ", position: "ПОЗИЦІЯ",
        humvee: "ХАМВІ", truck: "ВАНТАЖІВКА", uav: "БПЛА",
        width: "ШИРИНА", color: "КОЛІР",
        clearAll: "ВИДАЛИТИ ВСІ МАРКЕРИ", clearDrawings: "ВИДАЛИТИ МАЛЮНКИ",
        markers: n => `МАРКЕРИ: ${n}`,
        drawOff: "МАЛЮНОК: ВИМК", drawOn: "МАЛЮНОК: УВ.",
        rulerOff: "ЛІНІЙКА: ВИМК", rulerOn: "ЛІНІЙКА: УВ.",
        coordsLabel: "КООРДИНАТИ",
        shareScreen: "ТРАНСЛЯЦІЯ", stopSharing: "ЗУПИНИТИ",
        noStreams: "НЕМАЄ АКТИВНИХ ТРАНСЛЯЦІЙ",
        streamHint: "Натисніть ТРАНСЛЯЦІЯ щоб транслювати екран усім операторам",
        operators: n => `ОПЕРАТОРІВ: ${n} ОНЛАЙН`,
        unmute: "УВІМК МІК", mute: "ВИМК МІК", deafen: "ЗАГЛУШИТИ", undeafen: "ЗВУК УВ.",
        comms: "ЗВ'ЯЗОК", typeMessage: "ПОВІДОМЛЕННЯ...", callsign: "ПОЗИВНИЙ",
        roleOperator: "ОПЕРАТОР", roleCommander: "КОМАНДИР",
        roleDrone: "ПІЛОТ БПЛА", roleSniper: "СНАЙПЕР",
        roleMedic: "МЕДИК", roleIntel: "РОЗВІДКА",
        accountTitle: "АККАУНТ",
        login: "УВІЙТИ", register: "РЕЄСТРАЦІЯ",
        username: "ЛОГІН", password: "ПАРОЛЬ", confirmPassword: "ПІДТВЕРДИТИ ПАРОЛЬ",
        role: "РОЛЬ",
        loginBtn: "УВІЙТИ", registerBtn: "СТВОРИТИ АККАУНТ",
        logout: "ВИЙТИ", loggedInAs: "ВИ УВІЙШЛИ ЯК",
        errPassMatch: "Паролі не збігаються",
        errUserExists: "Це ім'я вже зайнято",
        errBadCreds: "Невірний логін або пароль",
        errFillAll: "Заповніть усі поля",
        errPassLen: "Пароль має містити щонайменше 8 символів",
        errNetwork: "Помилка мережі — спробуйте знову",
        artyCalcTitle: "АРТКАЛЬКУЛЯТОР",
        artyConfig: "КОНФІГУРАЦІЯ",
        artyGun: "ГАРМАТА", artyProjectile: "СНАРЯД",
        artyGunPos: "ПОЗИЦІЯ ГАРМАТИ", artyTgtPos: "ПОЗИЦІЯ ЦІЛІ",
        artyHeightLabel: "РІЗН. ВИСОТ (м)",
        artyCalcBtn: "РОЗРАХУВАТИ",
        artyAzimuth: "АЗИМУТ", artyDistance: "ДАЛЬНІСТЬ",
        artyLowArc: "НАСТИЛЬНА", artyHighArc: "НАВІСНА", artyTof: "ЧАС ПОЛЬОТУ",
        artyMapHint: "ЛКМ = ГАРМАТА  ·  ПКМ = ЦІЛЬ",
        artyEnterCoords: "НАТИСНІТЬ НА КАРТУ АБО ВВЕДІТЬ КООРДИНАТИ",
        enemy: "ВОРОГ", friendly: "СВОЇ",
    }
};
let currentLang = localStorage.getItem("vezhaLang") || "en";
function t(key, ...args) {
    const v = (i18n[currentLang] || i18n.en)[key];
    return (typeof v === "function") ? v(...args) : (v !== undefined ? v : key);
}
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
    infantry:  ["infantry_alive",  "infantry_wounded",  "infantry_dead",      "infantry_unknown"],
    tank:      ["tank_alive",      "tank_damaged",      "tank_destroyed",     "tank_unknown"],
    artillery: ["artillery_alive", "artillery_damaged", "artillery_destroyed","artillery_unknown"],
    helicopter:["helicopter_alive","helicopter_damaged","helicopter_destroyed","helicopter_unknown"],
    position:  ["position_alive",  "position_wounded",  "position_destroyed", "position_unknown"],
    humvee:    ["humvee_alive",    "humvee_damaged",    "humvee_destroyed",   "humvee_unknown"],
    truck:     ["truck_alive",     "truck_damaged",     "truck_destroyed",    "truck_unknown"],
    uav:       ["uav_alive",       "uav_damaged",       "uav_destroyed",      "uav_unknown"]
};
// Status bar color below the NATO diamond. null = no bar (unknown).
const statusColors = {
    alive:     "#00cc55",   // green
    wounded:   "#ffcc00",   // yellow
    damaged:   "#ff8800",   // orange
    dead:      "#ff4444",   // red
    destroyed: "#ff4444",   // red
    unknown:   null         // no bar
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
// Calibration correction factor (measured vs. real-world ground truth)
const DIST_CORRECTION = 1.01346;
let rulerMode   = false;
let rulerPoints = [];
// ════════════════════════════════════════════════════════════════════
// SVG BUILDER  (NATO APP-6 hostile diamond)
// ════════════════════════════════════════════════════════════════════
// Diamond sits in 46×46 space; status bar adds 11 px below → total height 57.
// The diamond occupies y = 3..43 (centre 23,23).
// X-cross lines connect midpoints of adjacent sides:
//   (13,13)↔(33,33)  and  (33,13)↔(13,33)
let _svgId = 0;
function symbolSVG(type = "infantry_alive") {
    const parts    = type.split("_");
    const status   = parts[parts.length - 1];
    const unit     = parts.slice(0, -1).join("_");
    const barColor = statusColors[status] ?? null;   // null → unknown, no bar
    const d        = "#111";   // designator / stroke color
    const cid      = `sc${++_svgId}`;

    // ── NATO unit designators ─────────────────────────────────────────
    // Diamond interior: top(23,3) right(43,23) bottom(23,43) left(3,23)
    let interior = "";
    switch (unit) {
        // ─ Infantry: two horizontal bars ─────────────────────────────
        case "infantry":
            interior = `
              <line x1="11" y1="19" x2="35" y2="19" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
              <line x1="11" y1="27" x2="35" y2="27" stroke="${d}" stroke-width="3" stroke-linecap="round"/>`;
            break;

        // ─ Armor / Tank: filled ellipse ───────────────────────────────
        case "tank":
            interior = `<ellipse cx="23" cy="23" rx="11" ry="6.5" fill="${d}"/>`;
            break;

        // ─ Artillery: pill (stadium) + centre dot ─────────────────────
        // ref: user picture 1
        case "artillery":
            interior = `
              <rect x="9" y="17" width="28" height="12" rx="6"
                    fill="none" stroke="${d}" stroke-width="2.5"/>
              <circle cx="23" cy="23" r="4.5" fill="${d}"/>`;
            break;

        // ─ Helicopter: bowtie (two inward-pointing filled triangles) ──
        // ref: user picture 2
        case "helicopter":
            interior = `
              <path d="M10 14 L23 23 L10 32 Z" fill="${d}"/>
              <path d="M36 14 L23 23 L36 32 Z" fill="${d}"/>`;
            break;

        // ─ Observation / position: small filled diamond ───────────────
        case "position":
            interior = `<path d="M23 13 L32 23 L23 33 L14 23 Z" fill="${d}"/>`;
            break;

        // ─ Humvee: 3 fan lines from top apex (picture 3 style) ────────
        case "humvee":
            interior = `
              <line x1="23" y1="4" x2="10" y2="39" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="23" y1="4" x2="23" y2="43" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="23" y1="4" x2="36" y2="39" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>`;
            break;

        // ─ Truck: 4 fan lines from top apex (picture 3 style, denser) ─
        case "truck":
            interior = `
              <line x1="23" y1="4" x2="6"  y2="32" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="23" y1="4" x2="16" y2="42" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="23" y1="4" x2="30" y2="42" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="23" y1="4" x2="40" y2="32" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>`;
            break;

        // ─ UAV: swept-wing V chevron (top-down view) ─────────────────
        case "uav":
            interior = `<path d="M4 10 L23 34 L42 10 L38 10 L23 26 L8 10 Z" fill="${d}"/>`;
            break;
    }

    // ── Status bar sits below the diamond (y 47–54) ──────────────────
    const bar = barColor
        ? `<rect x="5" y="47" width="36" height="7" fill="${barColor}" rx="1.5"/>`
        : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="57" viewBox="0 0 46 57">
      <defs>
        <clipPath id="${cid}">
          <path d="M23 3 L43 23 L23 43 L3 23 Z"/>
        </clipPath>
      </defs>
      <!-- NATO hostile frame: plain salmon fill + black outline, NO background X -->
      <path d="M23 3 L43 23 L23 43 L3 23 Z" fill="#f87171" fill-opacity="0.9"/>
      <path d="M23 3 L43 23 L23 43 L3 23 Z"
            fill="none" stroke="${d}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Unit type designator (clipped to diamond) -->
      <g clip-path="url(#${cid})">${interior}</g>
      <!-- Status bar -->
      ${bar}
    </svg>`;
}
// ════════════════════════════════════════════════════════════════════
// SVG BUILDER — NATO APP-6 FRIENDLY (blue rectangle frame)
// ════════════════════════════════════════════════════════════════════
function symbolSVGFriendly(type = "infantry_alive") {
    const parts    = type.split("_");
    const status   = parts[parts.length - 1];
    const unit     = parts.slice(0, -1).join("_");
    const barColor = statusColors[status] ?? null;
    const d        = "#111";
    const fill     = "#88c4f0";   // NATO friendly light-blue

    let interior = "";
    switch (unit) {
        // ─ Infantry: X cross ─────────────────────────────────────────
        case "infantry":
            interior = `
              <line x1="9" y1="9" x2="37" y2="37" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
              <line x1="37" y1="9" x2="9" y2="37" stroke="${d}" stroke-width="2" stroke-linecap="round"/>`;
            break;
        // ─ Armor: rounded-rect outline ───────────────────────────────
        case "tank":
            interior = `<rect x="10" y="16" width="26" height="14" rx="5" stroke="${d}" stroke-width="2" fill="none"/>`;
            break;
        // ─ Artillery: pill + centre dot ──────────────────────────────
        case "artillery":
            interior = `
              <rect x="10" y="16" width="26" height="14" rx="7" stroke="${d}" stroke-width="2" fill="none"/>
              <circle cx="23" cy="23" r="4" fill="${d}"/>`;
            break;
        // ─ Helicopter: bowtie ─────────────────────────────────────────
        case "helicopter":
            interior = `
              <path d="M9 13 L23 23 L9 33 Z" fill="${d}"/>
              <path d="M37 13 L23 23 L37 33 Z" fill="${d}"/>`;
            break;
        // ─ Humvee: tent/triangle with centre divider (NATO wheeled) ──
        case "humvee":
            interior = `
              <polyline points="7,37 23,9 39,37" stroke="${d}" stroke-width="2.5" stroke-linejoin="round" fill="none" stroke-linecap="round"/>
              <line x1="23" y1="9" x2="23" y2="37" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>`;
            break;
        // ─ Truck: 4 fan lines from apex (denser transport) ────────────
        case "truck":
            interior = `
              <line x1="23" y1="9" x2="8"  y2="37" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
              <line x1="23" y1="9" x2="16" y2="37" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
              <line x1="23" y1="9" x2="30" y2="37" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
              <line x1="23" y1="9" x2="38" y2="37" stroke="${d}" stroke-width="2" stroke-linecap="round"/>`;
            break;
        // ─ UAV: swept-wing V chevron ──────────────────────────────────
        case "uav":
            interior = `<path d="M4 12 L23 34 L42 12 L38 12 L23 28 L8 12 Z" fill="${d}"/>`;
            break;
        // ─ Position: small diamond ────────────────────────────────────
        case "position":
            interior = `<path d="M23 14 L32 23 L23 32 L14 23 Z" fill="${d}"/>`;
            break;
    }

    const bar = barColor
        ? `<rect x="5" y="47" width="36" height="7" fill="${barColor}" rx="1.5"/>`
        : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="57" viewBox="0 0 46 57">
      <!-- NATO friendly frame: blue rectangle -->
      <rect x="3" y="3" width="40" height="40" fill="${fill}" stroke="${d}" stroke-width="2"/>
      <!-- Unit designator -->
      ${interior}
      <!-- Status bar -->
      ${bar}
    </svg>`;
}
// ─── SYMBOL PANEL (enemy / friendly toggle) ───────────────────────────────────
let placingSide = "enemy";   // "enemy" | "friendly"

function rebuildSymbolPanel() {
    const isFriendly = placingSide === "friendly";
    Object.entries(symbolGroups).forEach(([group, types]) => {
        const row = document.getElementById(`row-${group}`);
        if (!row) return;
        row.innerHTML = "";
        types.forEach((type) => {
            const btn = document.createElement("button");
            btn.className    = "symbolBtn";
            btn.dataset.type = type;
            btn.title        = type.replace(/_/g, " ").toUpperCase();
            btn.innerHTML    = isFriendly ? symbolSVGFriendly(type) : symbolSVG(type);
            btn.addEventListener("click", () => {
                selectedSymbol = type;
                document.querySelectorAll(".symbolBtn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
            row.appendChild(btn);
        });
    });
    // Restore active state for currently selected symbol
    let matched = false;
    document.querySelectorAll(".symbolBtn").forEach(b => {
        b.classList.remove("active");
        if (b.dataset.type === selectedSymbol) { b.classList.add("active"); matched = true; }
    });
    if (!matched) document.querySelector(".symbolBtn")?.classList.add("active");
}
rebuildSymbolPanel();

// Side-toggle buttons
document.querySelectorAll(".side-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        placingSide = btn.dataset.side;
        document.querySelectorAll(".side-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        rebuildSymbolPanel();
    });
});
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
// ─── FILTER ───────────────────────────────────────────────────────────────────
const hiddenUnits = new Set();   // unit type strings that are currently hidden

function applyFilter() {
    Object.entries(displayedMarkers).forEach(([, {marker, data}]) => {
        const unit = (data.type || "infantry_alive").split("_").slice(0, -1).join("_");
        const el   = marker.getElement();
        if (el) el.style.display = hiddenUnits.has(unit) ? "none" : "";
    });
}

// Populate filter chips (called once after page load)
function initFilterUI() {
    const container = document.getElementById("filterChips");
    if (!container) return;
    Object.keys(symbolGroups).forEach(unit => {
        const chip = document.createElement("button");
        chip.className      = "filter-chip active";
        chip.dataset.unit   = unit;
        chip.textContent    = unit.toUpperCase(); // applyLang() will translate on load
        chip.addEventListener("click", () => {
            if (hiddenUnits.has(unit)) {
                hiddenUnits.delete(unit);
                chip.classList.add("active");
            } else {
                hiddenUnits.add(unit);
                chip.classList.remove("active");
            }
            applyFilter();
        });
        container.appendChild(chip);
    });
}
initFilterUI();

// ─── FIRESTORE REALTIME — MARKERS ────────────────────────────────────────────
const displayedMarkers = {};        // id → { marker, data }
let pendingEditMarkerId = null;     // auto-open popup for freshly placed marker

function createIcon(type, data = {}) {
    const svg    = (data.side === "friendly") ? symbolSVGFriendly(type) : symbolSVG(type);
    const date   = escHtml(data.date   || "");
    const amount = escHtml(String(data.amount || ""));
    const info   = escHtml(data.info   || "");
    const source = escHtml(data.source || "");
    const html = `<div class="mkr-wrap">
      <div class="ml ml-tl">${date}</div>
      <div class="ml ml-tc">${amount}</div>
      <div class="ml ml-tr">${info}</div>
      <div class="mkr-icon">${svg}</div>
      <div class="ml ml-br">${source}</div>
    </div>`;
    return L.divIcon({
        html,
        className:  "",
        iconSize:   [140, 140],
        iconAnchor: [70, 67]   // 47(left) + 23(diamond centre) = 70 x; 44(top) + 23 = 67 y
    });
}
onSnapshot(markersCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const id   = change.doc.id;
        const data = change.doc.data();
        if (change.type === "added") {
            const marker = L.marker([data.y, data.x], {
                icon: createIcon(data.type || "infantry_alive", data)
            }).addTo(map);
            marker.on("click", () => {
                openMarkerEditPopup(id, marker, displayedMarkers[id]?.data || data);
            });
            marker.on("contextmenu", async () => {
                if (confirm("Delete this marker?")) {
                    await deleteDoc(doc(db, "markers", id));
                    const idx = undoStack.findIndex(e => e.type === "marker" && e.id === id);
                    if (idx !== -1) undoStack.splice(idx, 1);
                }
            });
            displayedMarkers[id] = { marker, data };
            // Auto-open edit popup for the marker just placed by this client
            if (pendingEditMarkerId === id) {
                pendingEditMarkerId = null;
                openMarkerEditPopup(id, marker, data);
            }
        } else if (change.type === "modified") {
            if (displayedMarkers[id]) {
                displayedMarkers[id].marker.setIcon(
                    createIcon(data.type || "infantry_alive", data)
                );
                displayedMarkers[id].data = data;
            }
        } else if (change.type === "removed") {
            if (displayedMarkers[id]) {
                map.removeLayer(displayedMarkers[id].marker);
                delete displayedMarkers[id];
            }
        }
    });
    document.getElementById("markerCount").textContent =
        t("markers", Object.keys(displayedMarkers).length);
    applyFilter();
}, (err) => console.error("Markers sync error:", err));
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
    // UTC+2 timestamp (matches the HUD clock)
    const now  = new Date(Date.now() + 2 * 3600 * 1000);
    const p    = n => String(n).padStart(2, "0");
    const dateStr = `${p(now.getUTCDate())}/${p(now.getUTCMonth()+1)}/${String(now.getUTCFullYear()).slice(-2)} ${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}`;
    // Pre-generate the ref ID synchronously so pendingEditMarkerId is set
    // BEFORE Firestore fires the onSnapshot for the local-cache write.
    const newRef = doc(markersCollection);
    pendingEditMarkerId = newRef.id;
    await setDoc(newRef, {
        x:       e.latlng.lng,
        y:       e.latlng.lat,
        type:    selectedSymbol,
        side:    placingSide,
        created: Date.now(),
        date:    dateStr,
        amount:  "",
        info:    "",
        source:  ""
    });
    undoStack.push({ type: "marker", id: newRef.id });
});

// ─── MARKER EDIT POPUP ───────────────────────────────────────────────────────
// Uses a standalone L.popup (not bound to marker) so it can be reopened anytime.
function openMarkerEditPopup(markerId, markerLeaflet, data) {
    const popupContent = `
      <div class="mep-popup">
        <div class="mep-row">
          <span class="mep-label">DATE</span>
          <span class="mep-date">${escHtml(data.date || "")}</span>
        </div>
        <div class="mep-row">
          <label class="mep-label" for="mep-amt">AMT</label>
          <input class="mep-inp" id="mep-amt" type="text" maxlength="20"
                 value="${escHtml(String(data.amount || ""))}"/>
        </div>
        <div class="mep-row">
          <label class="mep-label" for="mep-inf">INFO</label>
          <input class="mep-inp" id="mep-inf" type="text" maxlength="60"
                 value="${escHtml(data.info || "")}"/>
        </div>
        <div class="mep-row">
          <label class="mep-label" for="mep-src">SRC</label>
          <input class="mep-inp" id="mep-src" type="text" maxlength="60"
                 value="${escHtml(data.source || "")}"/>
        </div>
        <button class="mep-save" id="mep-save">SAVE</button>
      </div>`;

    // Close any previously opened popup, then open a fresh standalone one
    map.closePopup();
    const popup = L.popup({ className: "mep-outer", maxWidth: 230, minWidth: 200, autoPan: true, offset: L.point(160, 40) })
        .setLatLng(markerLeaflet.getLatLng())
        .setContent(popupContent)
        .openOn(map);

    // Wait one animation frame for Leaflet to insert the DOM, then wire the button
    requestAnimationFrame(() => {
        document.getElementById("mep-save")?.addEventListener("click", async () => {
            const amt = document.getElementById("mep-amt")?.value || "";
            const inf = document.getElementById("mep-inf")?.value || "";
            const src = document.getElementById("mep-src")?.value || "";
            await updateDoc(doc(db, "markers", markerId), { amount: amt, info: inf, source: src });
            map.closePopup();
        });
    });
}
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
    document.getElementById("drawModeStatus").textContent = t(drawMode ? "drawOn" : "drawOff");
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
        document.getElementById("drawModeStatus").textContent = t("drawOff");
    }
    rulerBtn.classList.toggle("active", rulerMode);
    rulerStatus.textContent = t(rulerMode ? "rulerOn" : "rulerOff");
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
    return (pxAt0 / PIXELS_PER_METER) * DIST_CORRECTION;
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

function isMobileLayout() { return window.innerWidth <= 600; }

collapseBtn.addEventListener("click", () => {
    if (isMobileLayout()) {
        // Mobile: toggle overlay open/close
        leftPanel.classList.toggle("mobile-open");
    } else {
        // Desktop: normal collapse
        panelCollapsed = !panelCollapsed;
        leftPanel.classList.toggle("collapsed", panelCollapsed);
        collapseBtn.classList.toggle("flipped", panelCollapsed);
    }
    // FIX #4: tell Leaflet the map container changed size so all coordinate
    // transforms (latLngToContainerPoint etc.) recalculate correctly.
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
// ─── i18n helpers (object + t() declared near top of file) ───────────────────
function applyLang() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const v = t(el.dataset.i18n);
        if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
        const v = t(el.dataset.i18nPh);
        if (v) el.placeholder = v;
    });
    document.querySelectorAll("[data-i18n-opt]").forEach(el => {
        const v = t(el.dataset.i18nOpt);
        if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const v = t(el.dataset.i18nTitle);
        if (v) el.title = v;
    });
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
    // Refresh filter chip labels
    document.querySelectorAll(".filter-chip[data-unit]").forEach(chip => {
        chip.textContent = t(chip.dataset.unit);
    });
    // Refresh dynamic status bar
    const mc = document.getElementById("markerCount");
    if (mc) mc.textContent = t("markers", Object.keys(displayedMarkers || {}).length);
    const drawSt = document.getElementById("drawModeStatus");
    if (drawSt) drawSt.textContent = t(typeof drawMode !== "undefined" && drawMode ? "drawOn" : "drawOff");
    const rulerSt = document.getElementById("rulerStatus");
    if (rulerSt) rulerSt.textContent = t(typeof rulerMode !== "undefined" && rulerMode ? "rulerOn" : "rulerOff");
    // Sync body class for font-size compensation
    document.body.classList.remove("lang-en", "lang-ru", "lang-ua");
    document.body.classList.add("lang-" + currentLang);
    updateMicBtn();
    updateDeafenBtn();
}
document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        currentLang = btn.dataset.lang;
        localStorage.setItem("vezhaLang", currentLang);
        applyLang();
    });
});

// ─── MIC / DEAFEN ─────────────────────────────────────────────────────────────
let micStream    = null;
let isMicMuted   = true;   // start muted
let isDeafened   = false;  // start not deafened

async function initMic() {
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.getAudioTracks().forEach(t => { t.enabled = false; }); // start muted
        // Add to any already-existing peer connections
        Object.values(peers).forEach(({ pc }) => {
            micStream.getAudioTracks().forEach(track => {
                try { pc.addTrack(track, micStream); } catch (_) {}
            });
        });
    } catch (e) { console.warn("Mic unavailable:", e); }
    updateMicBtn();
}

function stopMic() {
    if (micStream) { micStream.getTracks().forEach(tr => tr.stop()); micStream = null; }
    isMicMuted = true; isDeafened = false;
    updateMicBtn(); updateDeafenBtn();
}

function toggleMic() {
    isMicMuted = !isMicMuted;
    if (micStream) micStream.getAudioTracks().forEach(tr => { tr.enabled = !isMicMuted; });
    updateMicBtn();
}

function toggleDeafen() {
    isDeafened = !isDeafened;
    document.querySelectorAll(".vezha-tile:not(.vezha-tile-self) video").forEach(v => {
        v.muted = isDeafened;
    });
    updateDeafenBtn();
}

function updateMicBtn() {
    const btn = document.getElementById("micBtn");
    const lbl = document.getElementById("micLabel");
    if (!btn || !lbl) return;
    if (isMicMuted) {
        btn.classList.add("vezha-danger-btn");
        btn.title = t("unmute") + " microphone";
        lbl.textContent = t("unmute");
    } else {
        btn.classList.remove("vezha-danger-btn");
        btn.title = t("mute") + " microphone";
        lbl.textContent = t("mute");
    }
}

function updateDeafenBtn() {
    const btn = document.getElementById("deafenBtn");
    const lbl = document.getElementById("deafenLabel");
    if (!btn || !lbl) return;
    if (isDeafened) {
        btn.classList.add("vezha-danger-btn");
        btn.title = t("undeafen");
        lbl.textContent = t("undeafen");
    } else {
        btn.classList.remove("vezha-danger-btn");
        btn.title = t("deafen");
        lbl.textContent = t("deafen");
    }
}

document.getElementById("micBtn")?.addEventListener("click", toggleMic);
document.getElementById("deafenBtn")?.addEventListener("click", toggleDeafen);

// ─── ACCOUNT MODAL — AUTH (Firestore-backed, cross-device) ───────────────────
// Accounts live in Firestore "accounts/{USERNAME}" so any device can log in.
// Current session is cached in localStorage for instant page-load restore.

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem("deltaCurrentUser") || "null"); } catch { return null; }
}
function hashPass(pw) { return btoa(encodeURIComponent(pw)); }

function applyCurrentUser(user) {
    if (user) {
        localStorage.setItem("deltaCurrentUser", JSON.stringify(user));
        localStorage.setItem("vezhaCallsign", user.username);
        localStorage.setItem("vezhaRole", user.role);
        const callEl = document.getElementById("callsignInput");
        if (callEl) callEl.value = user.username;
        const roleEl = document.getElementById("roleSelect");
        if (roleEl) roleEl.value = user.role;
    } else {
        localStorage.removeItem("deltaCurrentUser");
    }
    updateModalState();
}

function updateModalState() {
    const user = getCurrentUser();
    const loginPanel    = document.getElementById("loginPanel");
    const registerPanel = document.getElementById("registerPanel");
    const loggedInPanel = document.getElementById("loggedInPanel");
    const tabs          = document.querySelector(".modal-tabs");
    if (user) {
        loginPanel?.style && (loginPanel.style.display = "none");
        registerPanel?.style && (registerPanel.style.display = "none");
        loggedInPanel?.style && (loggedInPanel.style.display = "flex");
        if (tabs) tabs.style.display = "none";
        const nameEl = document.getElementById("loggedInName");
        if (nameEl) nameEl.textContent = user.username;
        const roleEl = document.getElementById("loggedInRole");
        if (roleEl) roleEl.textContent = user.role.toUpperCase();
        const prev = document.getElementById("accountRolePreview");
        if (prev) prev.style.background = ROLE_COLORS[user.role] || ROLE_COLORS.operator;
    } else {
        loginPanel?.style && (loginPanel.style.display = "flex");
        registerPanel?.style && (registerPanel.style.display = "none");
        loggedInPanel?.style && (loggedInPanel.style.display = "none");
        if (tabs) tabs.style.display = "flex";
        document.getElementById("tabLogin")?.classList.add("active");
        document.getElementById("tabRegister")?.classList.remove("active");
    }
}

// Tab switching
document.getElementById("tabLogin")?.addEventListener("click", () => {
    document.getElementById("loginPanel").style.display = "flex";
    document.getElementById("registerPanel").style.display = "none";
    document.getElementById("tabLogin").classList.add("active");
    document.getElementById("tabRegister").classList.remove("active");
    document.getElementById("loginError").textContent = "";
});
document.getElementById("tabRegister")?.addEventListener("click", () => {
    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("registerPanel").style.display = "flex";
    document.getElementById("tabRegister").classList.add("active");
    document.getElementById("tabLogin").classList.remove("active");
    document.getElementById("regError").textContent = "";
});

// Helper: disable/enable a button + show spinner text while async op runs
function setAuthBusy(btnId, busy) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = busy;
    btn.style.opacity = busy ? "0.6" : "";
}

// LOGIN — Firestore lookup
document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("loginUsername").value.trim().toUpperCase();
    const pw       = document.getElementById("loginPassword").value;
    const errEl    = document.getElementById("loginError");
    errEl.textContent = "";
    if (!username || !pw) { errEl.textContent = t("errFillAll"); return; }
    setAuthBusy("loginBtn", true);
    try {
        const snap = await getDoc(doc(db, "accounts", username));
        if (!snap.exists() || snap.data().passHash !== hashPass(pw)) {
            errEl.textContent = t("errBadCreds");
            setAuthBusy("loginBtn", false);
            return;
        }
        const acct = snap.data();
        document.getElementById("loginPassword").value = "";
        applyCurrentUser({ username: acct.username, role: acct.role });
    } catch (e) {
        console.error("Login error:", e);
        errEl.textContent = t("errNetwork");
    }
    setAuthBusy("loginBtn", false);
});

// REGISTER — Firestore write, cross-device
document.getElementById("registerBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("regUsername").value.trim().toUpperCase();
    const pw       = document.getElementById("regPassword").value;
    const confirm  = document.getElementById("regConfirm").value;
    const role     = document.getElementById("regRole").value;
    const errEl    = document.getElementById("regError");
    errEl.textContent = "";
    if (!username || !pw || !confirm) { errEl.textContent = t("errFillAll"); return; }
    if (pw.length < 8) { errEl.textContent = t("errPassLen"); return; }
    if (pw !== confirm) { errEl.textContent = t("errPassMatch"); return; }
    setAuthBusy("registerBtn", true);
    try {
        const ref  = doc(db, "accounts", username);
        const snap = await getDoc(ref);
        if (snap.exists()) { errEl.textContent = t("errUserExists"); setAuthBusy("registerBtn", false); return; }
        await setDoc(ref, { username, passHash: hashPass(pw), role });
        document.getElementById("regPassword").value = "";
        document.getElementById("regConfirm").value = "";
        applyCurrentUser({ username, role });
    } catch (e) {
        console.error("Register error:", e);
        errEl.textContent = t("errNetwork");
    }
    setAuthBusy("registerBtn", false);
});

// LOGOUT
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    applyCurrentUser(null);
});

// Open modal
document.getElementById("accountBtn")?.addEventListener("click", () => {
    updateModalState();
    document.getElementById("accountModal").style.display = "flex";
});
document.getElementById("accountModalClose")?.addEventListener("click", () => {
    document.getElementById("accountModal").style.display = "none";
});
document.getElementById("accountModal")?.addEventListener("click", e => {
    if (e.target.id === "accountModal")
        document.getElementById("accountModal").style.display = "none";
});

// Restore logged-in user on page load
{
    const user = getCurrentUser();
    if (user) {
        const callEl = document.getElementById("callsignInput");
        if (callEl) callEl.value = user.username;
        const roleEl = document.getElementById("roleSelect");
        if (roleEl) roleEl.value = user.role;
    }
}

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
    if (typeof artilleryActive !== "undefined" && artilleryActive) exitArtillery();
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
        document.getElementById("vezhaStatus").textContent = t("operators", count);
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
    initMic();
}

function exitVezha() {
    stopSharing();
    stopMic();
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
    if (micStream) micStream.getAudioTracks().forEach(t => { try { pc.addTrack(t, micStream); } catch (_) {} });
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
            if (micStream) micStream.getAudioTracks().forEach(t => { try { pc.addTrack(t, micStream); } catch (_) {} });
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

// ─── CHAT COLLAPSE ───────────────────────────────────────────────────────────
document.getElementById("chatCollapseBtn")?.addEventListener("click", () => {
    const sidebar = document.querySelector(".vezha-chat-sidebar");
    const btn     = document.getElementById("chatCollapseBtn");
    if (!sidebar) return;
    const collapsed = sidebar.classList.toggle("collapsed");
    btn.textContent = collapsed ? "›" : "‹";
});

// ─── CHAT ─────────────────────────────────────────────────────────────────────
document.getElementById("vezhaChatSend").addEventListener("click", sendChat);
document.getElementById("vezhaChatInput").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
});

// ─── CALLSIGN / ROLE (persisted in localStorage) ─────────────────────────────
const ROLE_COLORS = {
    operator:   "#4fa3ff",
    commander:  "#ff6b6b",
    drone:      "#a78bfa",
    sniper:     "#34d399",
    medic:      "#fbbf24",
    intel:      "#22d3ee"
};

function getCallsign() {
    return (document.getElementById("callsignInput")?.value.trim() ||
            localStorage.getItem("vezhaCallsign") || "").toUpperCase() || myShortId;
}
function getRole() {
    return document.getElementById("roleSelect")?.value ||
           localStorage.getItem("vezhaRole") || "operator";
}

// Restore identity from localStorage (module runs after DOM is parsed)
{
    const cs = localStorage.getItem("vezhaCallsign");
    const rl = localStorage.getItem("vezhaRole");
    if (cs) { const el = document.getElementById("callsignInput"); if (el) el.value = cs; }
    if (rl) { const el = document.getElementById("roleSelect");    if (el) el.value = rl; }
}
// Apply language on load
applyLang();

document.getElementById("callsignInput")?.addEventListener("input", e => {
    localStorage.setItem("vezhaCallsign", e.target.value.trim());
});
document.getElementById("roleSelect")?.addEventListener("change", e => {
    localStorage.setItem("vezhaRole", e.target.value);
});

async function sendChat() {
    const input    = document.getElementById("vezhaChatInput");
    const text     = input.value.trim();
    if (!text || !vezhaActive) return;
    input.value = "";
    const callsign = getCallsign();
    const role     = getRole();
    try {
        await addDoc(vezha_chat, {
            userId: myPeerId, shortId: myShortId,
            callsign, role, text, created: Date.now()
        });
    } catch (err) { console.error("Chat error:", err); }
}

function renderChatMessage(data) {
    const isMine   = data.userId === myPeerId;
    const msgs     = document.getElementById("vezhaChatMessages");
    const el       = document.createElement("div");
    el.className   = "chat-msg" + (isMine ? " chat-msg-mine" : "");
    const d   = new Date(data.created);
    const hh  = String(d.getHours()).padStart(2, "0");
    const mm  = String(d.getMinutes()).padStart(2, "0");
    const name = escHtml(data.callsign || data.shortId || data.userId.slice(-6).toUpperCase());
    const role = data.role || "operator";
    const roleColor = ROLE_COLORS[role] || ROLE_COLORS.operator;
    const roleLabel = role.toUpperCase();
    el.innerHTML = `
      <div class="chat-msg-meta">
        <span class="chat-msg-author" style="color:${roleColor}">${name}</span>
        <span class="chat-msg-role" style="color:${roleColor}">[${roleLabel}]</span>
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
    const logoImg = document.querySelector(".brand-shield img");
    if (logoImg) logoImg.src = isLightTheme ? "logo_light.png" : "logo.png";
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

// ═══════════════════════════════════════════════════════════════════════════════
// ARTILLERY CALCULATOR  —  based on grand-hawk/artillery-calculator (MIT)
// Math ported from packages/mtc-artillery/src/utils/math.ts
// Gun data from packages/mtc-artillery/src/config/guns.ts + importedGuns.json
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Physics constants (MTC game values, 1 stud = 1 m) ───────────────────────
const ARTY_G = 9.8 * 1.8;     // in-game gravity (Roblox = 1.8× Earth) m/s²
// 1:1 stud = meter — no conversion needed
function studsToMeters(s) { return s; }   // identity: coordinates ARE in metres

function artyCalcLowElev(d, v, h = 0) {
    const disc = v ** 4 - ARTY_G * (ARTY_G * d * d + 2 * h * v * v);
    if (disc < 0) return null;
    return Math.atan((v * v - Math.sqrt(disc)) / (ARTY_G * d)) * (180 / Math.PI);
}
function artyCalcHighElev(d, v, h = 0) {
    const disc = v ** 4 - ARTY_G * (ARTY_G * d * d + 2 * h * v * v);
    if (disc < 0) return null;
    return Math.atan((v * v + Math.sqrt(disc)) / (ARTY_G * d)) * (180 / Math.PI);
}
function artyCalcToF(elevDeg, v, d) {
    const rad = elevDeg * Math.PI / 180;
    return d / (v * Math.cos(rad));
}
// Azimuth: 0° = North (target directly north of gun), 90° = East, etc.
// Leaflet CRS.Simple: lat increases upward (north), lng increases rightward (east)
function artyCalcAzimuth(x1, y1, x2, y2) {
    const rad = Math.atan2(y2 - y1, x2 - x1);
    return (90 - (rad * 180 / Math.PI) + 360) % 360;
}
function artyCalcDist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── Gun database (importedGuns.json + custom guns from guns.ts) ──────────────
const ARTY_GUNS = [
    // ── Custom guns (from guns.ts — exact repo data) ──
    { name: "Mortar", projectiles: [
        { name: "Low Charge",    velocity: 125 },
        { name: "Medium Charge", velocity: 172 },
        { name: "High Charge",   velocity: 225 },
    ]},
    { name: "AGS-17", projectiles: [
        { name: "VOG-17M", velocity: 185 },
    ]},
    { name: "122mm D-30", projectiles: [
        { name: "3BK-10",               velocity: 726 },
        { name: "3OF56 Low Charge",     velocity: 175 },
        { name: "3OF56 Medium Charge",  velocity: 350 },
        { name: "3OF56 High Charge",    velocity: 690 },
    ]},
    { name: "82mm 2B9 Vasilek", projectiles: [
        { name: "Low Charge",    velocity: 75  },
        { name: "Medium Charge", velocity: 175 },
        { name: "High Charge",   velocity: 255 },
    ]},
    { name: "Hell Cannon", projectiles: [
        { name: "Propane", velocity: 130 },
    ]},
    { name: "UB-32", projectiles: [
        { name: "S-5K1", velocity: 650 },
    ]},
    { name: "12-Pounder Cannon", projectiles: [
        { name: "Roundshot", velocity: 480 },
        { name: "Grapeshot", velocity: 365 },
    ]},
    // ── Imported guns (importedGuns.json) ──
    { name: "2S19 Msta-S", projectiles: [
        { name: "3VO28 Low Charge",        velocity: 207 },
        { name: "3VOF91 Low Charge",       velocity: 216 },
        { name: "OF-72 Low Charge",        velocity: 216 },
        { name: "3VO28 Medium Charge",     velocity: 414 },
        { name: "3VOF91 Medium Charge",    velocity: 432 },
        { name: "OF-72 Medium Charge",     velocity: 432 },
        { name: "3VO28 High Charge",       velocity: 828 },
        { name: "3VOF91 High Charge",      velocity: 864 },
        { name: "OF-72 High Charge",       velocity: 864 },
    ]},
    { name: "2S43", projectiles: [
        { name: "3VO28 Low Charge",        velocity: 207 },
        { name: "3VOF91 Low Charge",       velocity: 216 },
        { name: "3VO28 Medium Charge",     velocity: 414 },
        { name: "3VOF91 Medium Charge",    velocity: 432 },
        { name: "3VO28 High Charge",       velocity: 828 },
        { name: "3VOF91 High Charge",      velocity: 864 },
    ]},
    { name: "2S7 Pion", projectiles: [
        { name: "3VO15 Low Charge",        velocity: 194 },
        { name: "3VOF34 Low Charge",       velocity: 194 },
        { name: "3VO15 Medium Charge",     velocity: 388 },
        { name: "3VOF34 Medium Charge",    velocity: 388 },
        { name: "3VO15 High Charge",       velocity: 775 },
        { name: "3VOF34 High Charge",      velocity: 775 },
        { name: "2VG11",                   velocity: 864 },
    ]},
    { name: "9K720 Iskander", projectiles: [
        { name: "SS-26 HE-frag Low",       velocity: 500  },
        { name: "SS-26 HE-frag Medium",    velocity: 1000 },
        { name: "SS-26 HE-frag High",      velocity: 2000 },
    ]},
    { name: "BM-21 Grad",    projectiles: [{ name: "9M22/M21 HE-Frag",          velocity: 180 }]},
    { name: "BMP-1TS",       projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "BMP-2M",        projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "BMP-30M",       projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "BMPT Terminator",projectiles:[{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "BTR-4",         projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "BTR-90",        projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "Centurion Mk.5 AVRE", projectiles: [{ name: "L33A1",              velocity: 259 }]},
    { name: "Cheonma-2",     projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "Churchill AVRE",projectiles: [{ name: "L33A1",                     velocity: 259 }]},
    { name: "CV 9040C",      projectiles: [
        { name: "M383",   velocity: 241 },
        { name: "M430A1", velocity: 241 },
    ]},
    { name: "GAZ Tigr M",    projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "Humvee",        projectiles: [
        { name: "M383",   velocity: 241 },
        { name: "M430A1", velocity: 241 },
    ]},
    { name: "Karl-Gerät",    projectiles: [{ name: "Schwere Betongranate",      velocity: 150 }]},
    { name: "LUAZ-672",      projectiles: [{ name: "9M22/M21 HE-Frag",          velocity: 180 }]},
    { name: "M1117 ASV",     projectiles: [
        { name: "M383",   velocity: 241 },
        { name: "M430A1", velocity: 241 },
    ]},
    { name: "M109",          projectiles: [
        { name: "M107 Low Charge",    velocity: 171 },
        { name: "M107 Medium Charge", velocity: 342 },
        { name: "M107 High Charge",   velocity: 684 },
        { name: "M110 Low Charge",    velocity: 171 },
        { name: "M110 Medium Charge", velocity: 342 },
        { name: "M110 High Charge",   velocity: 684 },
    ]},
    { name: "M109A6",        projectiles: [
        { name: "M107 Low Charge",    velocity: 171 },
        { name: "M107 Medium Charge", velocity: 342 },
        { name: "M107 High Charge",   velocity: 684 },
    ]},
    { name: "M17 Whizbang",  projectiles: [{ name: "7.2 in T37",               velocity: 49  }]},
    { name: "M26 T99",       projectiles: [{ name: "HE Rockets",                velocity: 260 }]},
    { name: "M270 MLRS",     projectiles: [
        { name: "M26A1 Low Charge",    velocity: 180 },
        { name: "M31A2 Low Charge",    velocity: 180 },
        { name: "M26A1 Medium Charge", velocity: 300 },
        { name: "M31A2 Medium Charge", velocity: 300 },
        { name: "M26A1 High Charge",   velocity: 420 },
        { name: "M31A2 High Charge",   velocity: 420 },
    ]},
    { name: "M7 Priest",     projectiles: [
        { name: "M67 shot", velocity: 381 },
        { name: "M1 shell", velocity: 472 },
    ]},
    { name: "Merkava Mk.1B", projectiles: [
        { name: "Blast-frag Low Charge",  velocity: 30  },
        { name: "Blast-frag Med Charge",  velocity: 80  },
        { name: "Blast-frag High Charge", velocity: 150 },
        { name: "Smoke",                  velocity: 30  },
    ]},
    { name: "Merkava Mk.4M", projectiles: [
        { name: "Blast-frag Low Charge",  velocity: 30  },
        { name: "Blast-frag Med Charge",  velocity: 80  },
        { name: "Blast-frag High Charge", velocity: 150 },
        { name: "Smoke",                  velocity: 30  },
    ]},
    { name: "Namer 30",      projectiles: [
        { name: "Blast-frag Low Charge",  velocity: 30  },
        { name: "Blast-frag Med Charge",  velocity: 80  },
        { name: "Blast-frag High Charge", velocity: 150 },
    ]},
    { name: "Object 781",    projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "PzH 2000",      projectiles: [
        { name: "DM121 Low Charge",     velocity: 254  },
        { name: "DM121 Medium Charge",  velocity: 506  },
        { name: "DM121 High Charge",    velocity: 1015 },
        { name: "DM702A1 Low Charge",   velocity: 254  },
        { name: "DM702A1 Medium Charge",velocity: 506  },
        { name: "DM702A1 High Charge",  velocity: 1015 },
    ]},
    { name: "Pz.W.42",       projectiles: [{ name: "15 cm Wurfgranate 41",      velocity: 340 }]},
    { name: "RBT-5",         projectiles: [{ name: "TT-250 Rocket",             velocity: 135 }]},
    { name: "RBU-6000 MT-LB",projectiles: [{ name: "RGB-60",                    velocity: 400 }]},
    { name: "RSZO-1",        projectiles: [{ name: "HE Rockets",                 velocity: 150 }]},
    { name: "RSZO-2",        projectiles: [{ name: "HE Rockets",                 velocity: 150 }]},
    { name: "SAU-2",         projectiles: [
        { name: "3OF25 Low Charge",    velocity: 200 },
        { name: "3OF25 Medium Charge", velocity: 400 },
        { name: "3OF25 High Charge",   velocity: 665 },
        { name: "BR-540B",             velocity: 600 },
        { name: "3VO28",               velocity: 200 },
        { name: "Smoke Shell",         velocity: 200 },
    ]},
    { name: "Sturmtiger",    projectiles: [{ name: "38 cm R Spgr.4581",         velocity: 150 }]},
    { name: "T-62 Berezhok", projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "T-64E",         projectiles: [{ name: "VOG-17M",                   velocity: 185 }]},
    { name: "T34 Calliope",  projectiles: [{ name: "HE Rockets",                velocity: 260 }]},
    { name: "TOS-1A BM-1",  projectiles: [
        { name: "Blast fragmentation", velocity: 180 },
        { name: "Incendiary",          velocity: 180 },
        { name: "Thermobaric",         velocity: 180 },
    ]},
].sort((a, b) => a.name.localeCompare(b.name));

// ─── Populate gun/projectile selects ─────────────────────────────────────────
{
    const gunSel  = document.getElementById("artyGunSelect");
    const projSel = document.getElementById("artyProjectileSelect");
    if (gunSel && projSel) {
        ARTY_GUNS.forEach((gun, i) => {
            const opt = document.createElement("option");
            opt.value = i; opt.textContent = gun.name;
            gunSel.appendChild(opt);
        });
        function populateProjectiles() {
            projSel.innerHTML = "";
            const gun = ARTY_GUNS[+gunSel.value];
            if (!gun) return;
            gun.projectiles.forEach((p, i) => {
                const opt = document.createElement("option");
                opt.value = i; opt.textContent = `${p.name}  (v=${p.velocity} m/s)`;
                projSel.appendChild(opt);
            });
        }
        gunSel.addEventListener("change", populateProjectiles);
        populateProjectiles();
    }
}

// ─── Calculate ────────────────────────────────────────────────────────────────
document.getElementById("artyCalcBtn")?.addEventListener("click", () => {
    const gunSel  = document.getElementById("artyGunSelect");
    const projSel = document.getElementById("artyProjectileSelect");
    const gx = parseFloat(document.getElementById("artyGunX").value);
    const gy = parseFloat(document.getElementById("artyGunY").value);
    const tx = parseFloat(document.getElementById("artyTgtX").value);
    const ty = parseFloat(document.getElementById("artyTgtY").value);
    const hd = parseFloat(document.getElementById("artyHeightDiff").value) || 0;
    const results = document.getElementById("artyResults");
    const noResult= document.getElementById("artyNoResult");

    if (isNaN(gx)||isNaN(gy)||isNaN(tx)||isNaN(ty)) {
        results.innerHTML = `<div class="arty-error-row">${t("artyEnterCoords")}</div>`;
        return;
    }
    const gun  = ARTY_GUNS[+gunSel.value];
    const proj = gun?.projectiles[+projSel.value];
    if (!proj) return;

    const distStuds = artyCalcDist(gx, gy, tx, ty);
    const distM     = studsToMeters(distStuds);
    const heightM   = studsToMeters(hd);
    const azimuth   = artyCalcAzimuth(gx, gy, tx, ty);
    const v         = proj.velocity;

    const lowElev  = artyCalcLowElev(distM, v, heightM);
    const highElev = artyCalcHighElev(distM, v, heightM);

    if (lowElev === null) {
        results.innerHTML = `<div class="arty-error-row">OUT OF RANGE — ${escHtml(proj.name)} (v=${v} m/s)</div>`;
        return;
    }

    const tofLow  = artyCalcToF(lowElev,  v, distM);
    const tofHigh = (highElev !== null) ? artyCalcToF(highElev, v, distM) : null;

    // 2 decimal places; omit decimals when the value is a whole number
    const fmt2 = n => {
        if (n === null) return "---";
        const r = Math.round(n * 100) / 100;
        return Number.isInteger(r) ? r.toString() : r.toFixed(2);
    };
    const fmt1 = fmt2;   // alias — all arty values now use fmt2
    const fmt0 = fmt2;

    results.innerHTML = `
      <div class="arty-result-row accent-result">
        <span class="arty-result-label">${t("artyAzimuth")}</span>
        <span class="arty-result-val large">${fmt1(azimuth)}<span class="arty-result-unit">°</span></span>
      </div>
      <div class="arty-result-row">
        <span class="arty-result-label">${t("artyDistance")}</span>
        <span class="arty-result-val">${fmt0(distM)}<span class="arty-result-unit"> m</span></span>
      </div>
      <div class="arty-result-row">
        <span class="arty-result-label">${t("artyLowArc")}</span>
        <span class="arty-result-val">${fmt1(lowElev)}<span class="arty-result-unit">°</span>
          <span class="arty-result-sub"> · ${t("artyTof")}: ${fmt1(tofLow)} s</span></span>
      </div>
      <div class="arty-result-row">
        <span class="arty-result-label">${t("artyHighArc")}</span>
        <span class="arty-result-val ${highElev === null ? "dim" : ""}">${highElev !== null ? fmt1(highElev) + "°" : "N/A"}
          <span class="arty-result-sub">${tofHigh !== null ? " · " + t("artyTof") + ": " + fmt1(tofHigh) + " s" : ""}</span></span>
      </div>
      <div class="arty-result-row muted-row">
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim);line-height:1.5">
          ${escHtml(gun.name)}<br>${escHtml(proj.name)} · ${v} m/s · Δh: ${hd > 0 ? "+" : ""}${hd} m
        </span>
      </div>`;
    if (noResult) noResult.style.display = "none";
});

// ─── Artillery Map (Leaflet instance inside ARTY view) ───────────────────────
// 1 stud = 1 m; 1 pixel = (1/PIXELS_PER_METER) metres × calibration correction
const ARTY_PX_TO_STUD = (1 / PIXELS_PER_METER) * DIST_CORRECTION;  // ≈ 1.785 m/px
const ARTY_STUD_TO_PX = 1 / ARTY_PX_TO_STUD;

let artyMapInstance = null;
let artyGunMarker   = null;
let artyTgtMarker   = null;
let artyLine        = null;
// Raw Leaflet pixel coords of last gun/target placement (for the line and markers)
let artyGunPx       = null;   // { lat, lng } in Leaflet map coords (px)
let artyTgtPx       = null;

function makeArtyIcon(label, color) {
    return L.divIcon({
        html: `<div style="
            width:30px;height:30px;background:${color};border:2.5px solid #111;
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            font-family:monospace;font-size:13px;font-weight:900;color:#111;line-height:1;
            box-shadow:0 2px 6px rgba(0,0,0,.5);">${label}</div>`,
        className: "", iconSize: [30, 30], iconAnchor: [15, 15]
    });
}

function updateArtyLine() {
    if (artyLine) { artyLine.remove(); artyLine = null; }
    if (artyGunPx && artyTgtPx && artyMapInstance) {
        artyLine = L.polyline(
            [[artyGunPx.lat, artyGunPx.lng], [artyTgtPx.lat, artyTgtPx.lng]],
            { color: "#facc15", weight: 2, dashArray: "6 4", opacity: 0.85 }
        ).addTo(artyMapInstance);
    }
}

function triggerArtyCalc() {
    const gx = parseFloat(document.getElementById("artyGunX")?.value);
    const gy = parseFloat(document.getElementById("artyGunY")?.value);
    const tx = parseFloat(document.getElementById("artyTgtX")?.value);
    const ty = parseFloat(document.getElementById("artyTgtY")?.value);
    if (!isNaN(gx) && !isNaN(gy) && !isNaN(tx) && !isNaN(ty)) {
        document.getElementById("artyCalcBtn")?.click();
    }
}

function initArtyMap() {
    const el = document.getElementById("artyMapEl");
    if (!el) return;
    if (artyMapInstance) {
        // Already created — just resize to the newly visible container
        setTimeout(() => {
            artyMapInstance.invalidateSize();
            artyMapInstance.fitBounds([[0, 0], [imageHeight, imageWidth]]);
        }, 80);
        return;
    }
    artyMapInstance = L.map("artyMapEl", {
        crs: L.CRS.Simple, minZoom: -3, maxZoom: 2,
        zoomControl: true, attributionControl: false
    });
    const artBounds = [[0, 0], [imageHeight, imageWidth]];
    L.imageOverlay("map.png", artBounds).addTo(artyMapInstance);
    artyMapInstance.fitBounds(artBounds);
    // Force a second layout pass after the flex container finishes sizing
    setTimeout(() => {
        artyMapInstance.invalidateSize();
        artyMapInstance.fitBounds(artBounds);
    }, 120);

    artyMapInstance.on("click", (e) => {
        // Convert Leaflet pixel coords → game studs for the input fields
        const stud_x = Math.round(e.latlng.lng * ARTY_PX_TO_STUD);
        const stud_y = Math.round(e.latlng.lat * ARTY_PX_TO_STUD);
        document.getElementById("artyGunX").value = stud_x;
        document.getElementById("artyGunY").value = stud_y;
        artyGunPx = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (artyGunMarker) artyGunMarker.remove();
        artyGunMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: makeArtyIcon("G", "#4ade80")
        }).addTo(artyMapInstance);
        updateArtyLine();
        triggerArtyCalc();
    });

    artyMapInstance.on("contextmenu", (e) => {
        const stud_x = Math.round(e.latlng.lng * ARTY_PX_TO_STUD);
        const stud_y = Math.round(e.latlng.lat * ARTY_PX_TO_STUD);
        document.getElementById("artyTgtX").value = stud_x;
        document.getElementById("artyTgtY").value = stud_y;
        artyTgtPx = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (artyTgtMarker) artyTgtMarker.remove();
        artyTgtMarker = L.marker([e.latlng.lat, e.latlng.lng], {
            icon: makeArtyIcon("T", "#f87171")
        }).addTo(artyMapInstance);
        updateArtyLine();
        triggerArtyCalc();
    });
}

// ─── Artillery view switching ─────────────────────────────────────────────────
let artilleryActive = false;
const artilleryViewBtn = document.getElementById("artilleryViewBtn");

function enterArtillery() {
    if (vezhaActive) exitVezha();
    artilleryActive = true;
    document.getElementById("appBody").style.display = "none";
    document.getElementById("vezhaView").classList.remove("active");
    document.getElementById("artilleryView").classList.add("active");
    brandModule.textContent = "ARTY";
    mapViewBtn.classList.remove("active");
    vezhaViewBtn.classList.remove("active");
    artilleryViewBtn.classList.add("active");
    setTimeout(() => initArtyMap(), 50);
}

function exitArtillery() {
    artilleryActive = false;
    document.getElementById("artilleryView").classList.remove("active");
    document.getElementById("appBody").style.display = "flex";
    brandModule.textContent = "MONITOR";
    artilleryViewBtn.classList.remove("active");
    mapViewBtn.classList.add("active");
}

artilleryViewBtn?.addEventListener("click", () => {
    if (!artilleryActive) enterArtillery();
});

// Patch mapViewBtn and vezhaViewBtn to also exit artillery
const _origMapClick  = mapViewBtn.onclick;
const _origVezhaClick = vezhaViewBtn.onclick;
mapViewBtn.addEventListener("click",  () => { if (artilleryActive) exitArtillery(); });
vezhaViewBtn.addEventListener("click",() => { if (artilleryActive) exitArtillery(); });

// ─── Kill browser autofill in coordinate search box ──────────────────────────
setTimeout(() => {
    const csi = document.getElementById("coordSearchInput");
    if (csi) { csi.value = ""; csi.setAttribute("readonly", ""); setTimeout(() => csi.removeAttribute("readonly"), 100); }
}, 250);
