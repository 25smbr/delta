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
    orderBy,
    limit,
    limitToLast,
    startAfter
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
        roleDrone: "DRONE PILOT", roleCrewman: "CREWMAN",
        roleIntel: "INTEL",
        errPassNum: "Password must contain at least 1 number.",
        errPassSym: "Password must contain at least 1 symbol (!@#$…)",
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
        roleDrone: "ПИЛОТ БПЛА", roleCrewman: "ЭКИПАЖ",
        roleIntel: "РАЗВЕДКА",
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
        roleDrone: "ПІЛОТ БПЛА", roleCrewman: "ЕКІПАЖ",
        roleIntel: "РОЗВІДКА",
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
// ─── MAP CONFIGURATIONS ──────────────────────────────────────────────────────
// Map image files are served from the same directory as the app (or update
// the `file` paths to raw GitHub URLs once you confirm the repo).
// Width/height are the PNG pixel dimensions — update them once you know each
// image's actual size.  ppm (pixels-per-metre) will be calibrated later.
// ppm (pixels-per-metre) for new maps: to be calibrated — placeholder kept from Dustbowl 2
const MAPS = [
    { id: "map1",  name: "Dustbowl 2",       file: "map.png",              width: 1204, height: 1290, ppm: 142/250  },
    { id: "map2",  name: "Sokolovka",         file: "sokolovka.png",        width:  628, height:  629, ppm: 65/200   },
    { id: "map3",  name: "Arctic Airbase",    file: "arctic_airbase.png",   width:  627, height:  631, ppm: 65/162   },
    { id: "map4",  name: "Muddy Fields",      file: "muddy_fields.png",     width:  625, height:  633, ppm: 65/240   },
    { id: "map5",  name: "Fulvia Gap",        file: "fulvia_gap.png",       width:  617, height:  628, ppm: 65/320   },
    { id: "map6",  name: "Snowy Fields",      file: "snowy_fields.png",     width:  629, height:  626, ppm: 65/240   },
    { id: "map7",  name: "Rohkstov",          file: "rohkstov.png",         width:  628, height:  635, ppm: 65/600   },
    { id: "map8",  name: "Rohkshort",         file: "rohkshort.png",        width:  615, height:  622, ppm: 65/369   },
    { id: "map9",  name: "Roinburg",          file: "roinburg.png",         width:  620, height:  628, ppm: 65/142   },
    { id: "map10", name: "Zone 11",           file: "zone_11.png",          width:  626, height:  631, ppm: 65/324   },
    { id: "map11", name: "Normandy Bocage",   file: "normandy_bocage.png",  width:  629, height:  634, ppm: 65/239   },
    { id: "map12", name: "Villers Sommeil",   file: "villers_sommeil.png",  width:  618, height:  631, ppm: 65/120   },
    { id: "map13", name: "KP",               file: "kp.png",               width: 1280, height:  934, ppm: 1        },
];
let currentMapIdx = parseInt(localStorage.getItem("currentMapIdx") || "0");
if (currentMapIdx >= MAPS.length) currentMapIdx = 0;
let imageWidth  = MAPS[currentMapIdx].width;
let imageHeight = MAPS[currentMapIdx].height;
let PIXELS_PER_METER_DYNAMIC = MAPS[currentMapIdx].ppm;

// ─── MAP ─────────────────────────────────────────────────────────────────────
const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 4,
    zoomControl: false,
    attributionControl: false
});
let _mapImageOverlay = null;
function loadMapConfig(idx) {
    currentMapIdx = Math.max(0, Math.min(MAPS.length - 1, idx));
    localStorage.setItem("currentMapIdx", currentMapIdx);
    const cfg = MAPS[currentMapIdx];
    imageWidth  = cfg.width;
    imageHeight = cfg.height;
    PIXELS_PER_METER_DYNAMIC = cfg.ppm;
    if (typeof updateArtyScale === "function") updateArtyScale();
    const b = [[0, 0], [imageHeight, imageWidth]];
    if (_mapImageOverlay) map.removeLayer(_mapImageOverlay);
    _mapImageOverlay = L.imageOverlay(cfg.file, b).addTo(map);
    map.fitBounds(b);
    map.setMaxBounds(b);
    map.setView([imageHeight / 2, imageWidth / 2], 0);
    // Update map selector label
    const lbl = document.getElementById("mapSelLabel");
    if (lbl) lbl.textContent = cfg.name;
    buildMapSelectorDropdown();
    if (typeof resizeCanvas === "function") setTimeout(resizeCanvas, 50);
    // Re-subscribe to map-scoped markers and drawings
    subscribeToMap(cfg.id);
    // Update arty map image if arty calc is already initialised
    if (typeof reloadArtyMapImage === "function") reloadArtyMapImage();
}
const bounds = [[0, 0], [imageHeight, imageWidth]];
_mapImageOverlay = L.imageOverlay(MAPS[currentMapIdx].file, bounds).addTo(map);
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
    uav:       ["uav_alive",       "uav_damaged",       "uav_destroyed",      "uav_unknown"],
    info:      ["info_note"]   // single-state info marker
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
const redoStack = [];
let isLightTheme = false;

// ─── ROLE CONSTANTS (needed early by updateModalState / applyCurrentUser) ──────
const ROLE_COLORS = {
    owner:      "#f59e0b",   // gold — admin
    operator:   "#4fa3ff",
    commander:  "#ff6b6b",
    drone:      "#a78bfa",
    crewman:    "#fb923c",
    intel:      "#22d3ee"
};
const OWNER_CALLSIGN = "PLAYFRA";
// ─── DRAWING STATE ───────────────────────────────────────────────────────────
let drawMode    = false;
let activeTool  = null;
let penColor    = "#ff4444";
let penWidth    = 3;
let isDrawing   = false;
let startCanvasX = 0, startCanvasY = 0;
let startMapLL   = null;
// strokes is the live local copy, synced from Firestore via incremental updates
let strokes       = [];
let currentStroke = null;
let map3DState    = null;   // active 3D instance for the monitor map
let arty3DState   = null;   // active 3D instance for the arty calculator
let selBox          = null;   // { x1,y1,x2,y2 } for ctrl+lmb selection
let _selBoxActive   = false;
let _selBoxConsumed = false;  // blocks Leaflet click after selection completes
// ─── RULER STATE ─────────────────────────────────────────────────────────────
// FIX #5: scale calibrated to correct image dimensions
// The scale constant remains the same (142px = 250m at zoom 0) — keep original calibration
// PIXELS_PER_METER is now dynamic — use PIXELS_PER_METER_DYNAMIC (set from MAPS config)
// The const alias below allows all existing code that references PIXELS_PER_METER to keep working.
// For live ruler calculations, pixelsToMeters() uses PIXELS_PER_METER_DYNAMIC directly.
const PIXELS_PER_METER = 142 / 250; // fallback / arty default
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
        case "info":
            // Special rendering — return a NATO-style info marker (blue circle with "i")
            return `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="57" viewBox="0 0 46 57">
              <circle cx="23" cy="23" r="19" fill="#3b82f6" fill-opacity="0.9"/>
              <circle cx="23" cy="23" r="19" fill="none" stroke="${d}" stroke-width="2"/>
              <text x="23" y="30" text-anchor="middle" font-family="serif" font-size="22"
                    font-weight="700" fill="#fff">i</text>
            </svg>`;
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
      <!-- NATO hostile frame: plain red fill + black outline, NO background X -->
      <path d="M23 3 L43 23 L23 43 L3 23 Z" fill="#e3716a" fill-opacity="0.9"/>
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
        // ─ Info: same circle style regardless of side ─────────────────
        case "info":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="57" viewBox="0 0 46 57">
              <circle cx="23" cy="23" r="19" fill="#3b82f6" fill-opacity="0.9"/>
              <circle cx="23" cy="23" r="19" fill="none" stroke="${d}" stroke-width="2"/>
              <text x="23" y="30" text-anchor="middle" font-family="serif" font-size="22"
                    font-weight="700" fill="#fff">i</text>
            </svg>`;
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

// ─── GROUP INFO TOOLTIPS ──────────────────────────────────────────────────────
{
    const tip = document.getElementById("groupInfoTooltip");
    document.querySelectorAll(".group-info-btn").forEach(btn => {
        btn.addEventListener("mouseenter", e => {
            tip.textContent = btn.dataset.tip;
            tip.style.display = "block";
        });
        btn.addEventListener("mousemove", e => {
            let x = e.clientX + 12, y = e.clientY + 8;
            if (x + 210 > window.innerWidth)  x = e.clientX - 218;
            if (y + 80  > window.innerHeight) y = e.clientY - 88;
            tip.style.left = x + "px";
            tip.style.top  = y + "px";
        });
        btn.addEventListener("mouseleave", () => { tip.style.display = "none"; });
        // Mobile: tap to toggle tooltip
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const showing = tip.style.display === "block";
            tip.style.display = showing ? "none" : "block";
            if (!showing) {
                tip.textContent = btn.dataset.tip;
                const r = btn.getBoundingClientRect();
                tip.style.left = (r.right + 6) + "px";
                tip.style.top  = r.top + "px";
            }
        });
    });
    document.addEventListener("click", () => { tip.style.display = "none"; });
}

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
document.getElementById("undoBtn").addEventListener("click", undoLast);
async function undoLast() {
    if (undoStack.length === 0) return;
    const last = undoStack.pop();
    if (last.type === "marker") {
        // Use cached data if available; fall back to Firestore only if not
        if (last.data) {
            redoStack.push({ type: "marker", data: last.data });
            await deleteDoc(doc(db, "markers", last.id));
        } else {
            const snap = await getDoc(doc(db, "markers", last.id));
            if (snap.exists()) redoStack.push({ type: "marker", data: snap.data() });
            await deleteDoc(doc(db, "markers", last.id));
        }
    } else if (last.type === "drawing") {
        const stroke = strokes.find(s => s.firestoreId === last.id);
        if (stroke) redoStack.push({ type: "drawing", stroke: { ...stroke } });
        strokes = strokes.filter(s => s.firestoreId !== last.id);
        redrawAll();
        try { await deleteDoc(doc(db, "drawings", last.id)); }
        catch (err) { console.error("Undo drawing delete failed:", err); }
    }
}
async function redoLast() {
    if (redoStack.length === 0) return;
    const last = redoStack.pop();
    if (last.type === "marker") {
        const newRef = doc(markersCollection);
        await setDoc(newRef, last.data);
        undoStack.push({ type: "marker", id: newRef.id });
    } else if (last.type === "drawing") {
        try {
            const { firestoreId, ...strokeData } = last.stroke;
            const docRef = await addDrawing(strokeData);
            undoStack.push({ type: "drawing", id: docRef.id });
        } catch (err) { console.error("Redo drawing failed:", err); }
    }
}
// ─── CLEAR MARKERS ────────────────────────────────────────────────────────────
document.getElementById("clearMarkersBtn").addEventListener("click", async () => {
    if (!confirm("Delete ALL markers? This cannot be undone.")) return;
    const snapshot = await getDocs(query(markersCollection, where("mapId", "==", MAPS[currentMapIdx].id)));
    const batch    = writeBatch(db);
    snapshot.forEach(d => batch.delete(d.ref));
    await batch.commit();
    for (let i = undoStack.length - 1; i >= 0; i--) {
        if (undoStack[i].type === "marker") undoStack.splice(i, 1);
    }
});
// ─── HELPER: save a drawing tagged to the current map ────────────────────────
function addDrawing(data) {
    return addDoc(drawingsCollection, { ...data, mapId: MAPS[currentMapIdx].id });
}
// ─── CLEAR DRAWINGS ──────────────────────────────────────────────────────────
document.getElementById("clearDrawingsBtn").addEventListener("click", async () => {
    if (!confirm("Delete ALL drawings? This cannot be undone.")) return;
    strokes = [];
    redrawAll();
    for (let i = undoStack.length - 1; i >= 0; i--) {
        if (undoStack[i].type === "drawing") undoStack.splice(i, 1);
    }
    try {
        const snapshot = await getDocs(query(drawingsCollection, where("mapId", "==", MAPS[currentMapIdx].id)));
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
let filterVisualConf = false;    // when true, show ONLY markers that have a clip URL
let filterMaxAge = null;         // null = show all; otherwise max age in milliseconds

const TIME_FILTERS = [
    { label: "1D",  ms: 1  * 24 * 3600 * 1000 },
    { label: "2D",  ms: 2  * 24 * 3600 * 1000 },
    { label: "3D",  ms: 3  * 24 * 3600 * 1000 },
    { label: "1W",  ms: 7  * 24 * 3600 * 1000 },
];

function applyFilter() {
    const now = Date.now();
    Object.entries(displayedMarkers).forEach(([, {marker, data}]) => {
        const unit = (data.type || "infantry_alive").split("_").slice(0, -1).join("_");
        const el   = marker.getElement();
        if (!el) return;
        const hiddenByUnit = hiddenUnits.has(unit);
        const hiddenByConf = filterVisualConf && !data.clip;
        const hiddenByAge  = filterMaxAge !== null &&
                             (typeof data.created !== "number" || (now - data.created) > filterMaxAge);
        el.style.display = (hiddenByUnit || hiddenByConf || hiddenByAge) ? "none" : "";
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
    // Visual Confirmation filter chip (special — not a unit type)
    const vcChip = document.createElement("button");
    vcChip.className = "filter-chip filter-chip-vc";
    vcChip.id        = "filterVCBtn";
    vcChip.title     = "Show only markers with confirmed footage";
    vcChip.textContent = "VISUAL CONF.";
    vcChip.addEventListener("click", () => {
        filterVisualConf = !filterVisualConf;
        vcChip.classList.toggle("vc-on", filterVisualConf);
        applyFilter();
    });
    container.appendChild(vcChip);

    // ── Time-range filter chips ──────────────────────────────────────────────
    const timeGroup = document.createElement("div");
    timeGroup.className = "filter-time-group";

    const allChip = document.createElement("button");
    allChip.className = "filter-chip filter-chip-time active";
    allChip.dataset.ms = "";
    allChip.textContent = "ALL";
    timeGroup.appendChild(allChip);

    TIME_FILTERS.forEach(({ label, ms }) => {
        const chip = document.createElement("button");
        chip.className = "filter-chip filter-chip-time";
        chip.dataset.ms = String(ms);
        chip.textContent = label;
        timeGroup.appendChild(chip);
    });

    timeGroup.querySelectorAll(".filter-chip-time").forEach(chip => {
        chip.addEventListener("click", () => {
            timeGroup.querySelectorAll(".filter-chip-time").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            filterMaxAge = chip.dataset.ms ? Number(chip.dataset.ms) : null;
            applyFilter();
        });
    });

    container.appendChild(timeGroup);
}
initFilterUI();

// ─── FIRESTORE REALTIME — MARKERS ────────────────────────────────────────────
const displayedMarkers = {};        // id → { marker, data }
let pendingEditMarkerId = null;     // auto-open popup for freshly placed marker

function createIcon(type, data = {}, markerId = "") {
    const svg    = (data.side === "friendly") ? symbolSVGFriendly(type) : symbolSVG(type);
    const date   = escHtml(data.date   || "");
    const amount = escHtml(String(data.amount || ""));
    const info   = escHtml(data.info   || "");
    const source = escHtml(data.source || "");
    const author = escHtml(data.author || "");
    // data-mid is used by the DOM-delegation handler below for click/contextmenu
    const html = `<div class="mkr-wrap" data-mid="${escHtml(markerId)}">
      <div class="ml ml-tl">${date}</div>
      <div class="ml ml-tc">${amount}</div>
      <div class="ml ml-tr">${info}</div>
      <div class="mkr-icon">${svg}</div>
      <div class="ml ml-bl">${author}</div>
      <div class="ml ml-br">${source}</div>
    </div>`;
    return L.divIcon({
        html,
        className:  "mkr-outer",   // pointer-events:none set in CSS
        iconSize:   [140, 140],
        iconAnchor: [70, 67]
    });
}
// ─── FIRESTORE REALTIME — MAP-SCOPED MARKERS & DRAWINGS ─────────────────────
let _unsubMarkers  = null;
let _unsubDrawings = null;

function subscribeToMap(mapId) {
    // Unsubscribe previous listeners
    if (_unsubMarkers)  { _unsubMarkers();  _unsubMarkers  = null; }
    if (_unsubDrawings) { _unsubDrawings(); _unsubDrawings = null; }

    // Clear all displayed markers from Leaflet and 3D scenes
    Object.entries(displayedMarkers).forEach(([, { marker }]) => map.removeLayer(marker));
    for (const k in displayedMarkers) delete displayedMarkers[k];
    if (map3DState)  { try { map3DState.clearAllMarkers3D();  } catch (_) {} }
    if (arty3DState) { try { arty3DState.clearAllMarkers3D(); } catch (_) {} }

    // Clear all drawings
    strokes = [];
    if (map3DState) { try { map3DState.clearAllStrokes3D(); } catch (_) {} }
    redrawAll();

    // Subscribe to markers for this map
    _unsubMarkers = onSnapshot(
        query(markersCollection, where("mapId", "==", mapId)),
        (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const id   = change.doc.id;
                const data = change.doc.data();
                if (change.type === "added") {
                    const marker = L.marker([data.y, data.x], {
                        icon:        createIcon(data.type || "infantry_alive", data, id),
                        interactive: false
                    }).addTo(map);
                    displayedMarkers[id] = { marker, data };
                    if (pendingEditMarkerId === id) pendingEditMarkerId = null;
                    if (map3DState)  map3DState.addMarker3D(id, data);
                    if (arty3DState) arty3DState.addMarker3D(id, data);
                } else if (change.type === "modified") {
                    if (displayedMarkers[id]) {
                        displayedMarkers[id].marker.setIcon(
                            createIcon(data.type || "infantry_alive", data, id)
                        );
                        displayedMarkers[id].data = data;
                    }
                    if (map3DState)  map3DState.addMarker3D(id, data);
                    if (arty3DState) arty3DState.addMarker3D(id, data);
                } else if (change.type === "removed") {
                    if (displayedMarkers[id]) {
                        map.removeLayer(displayedMarkers[id].marker);
                        delete displayedMarkers[id];
                    }
                    if (map3DState)  map3DState.removeMarker3D(id);
                    if (arty3DState) arty3DState.removeMarker3D(id);
                }
            });
            document.getElementById("markerCount").textContent =
                t("markers", Object.keys(displayedMarkers).length);
            applyFilter();
        },
        (err) => console.error("Markers sync error:", err)
    );

    // Subscribe to drawings for this map
    _unsubDrawings = onSnapshot(
        query(drawingsCollection, where("mapId", "==", mapId)),
        (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const id   = change.doc.id;
                const data = change.doc.data();
                if (change.type === "added") {
                    if (!strokes.some(s => s.firestoreId === id)) {
                        strokes.push({ ...data, firestoreId: id });
                    }
                    if (map3DState) map3DState.addStroke3D(id, data);
                } else if (change.type === "modified") {
                    const idx = strokes.findIndex(s => s.firestoreId === id);
                    if (idx !== -1) strokes[idx] = { ...data, firestoreId: id };
                    if (map3DState) map3DState.addStroke3D(id, data);
                } else if (change.type === "removed") {
                    strokes = strokes.filter(s => s.firestoreId !== id);
                    if (map3DState) map3DState.removeStroke3D(id);
                }
            });
            redrawAll();
        },
        (error) => console.error("Drawings sync error:", error)
    );
}
// (initial subscribeToMap call is deferred to after ctx is ready — see below)
// ─── ADD MARKERS — shared handler (called by Leaflet click AND 3D canvas) ────
async function handleMapClickLatLng(lat, lng) {
    if (drawMode || rulerMode) return;
    const now  = new Date(Date.now() + 2 * 3600 * 1000);
    const p    = n => String(n).padStart(2, "0");
    const dateStr = `${p(now.getUTCDate())}/${p(now.getUTCMonth()+1)}/${String(now.getUTCFullYear()).slice(-2)} ${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}`;
    const newRef  = doc(markersCollection);
    const mkrData = {
        x: lng, y: lat,
        type:    selectedSymbol,
        side:    placingSide,
        mapId:   MAPS[currentMapIdx].id,
        created: Date.now(),
        date:    dateStr,
        amount:  "",
        info:    "",
        source:  "",
        author:  getCallsign()
    };
    pendingEditMarkerId = newRef.id;
    await setDoc(newRef, mkrData);
    undoStack.push({ type: "marker", id: newRef.id, data: mkrData });
}

// ─── ADD MARKERS — LMB (mobile: long-tap, see below) ─────────────────────────
map.on("click", async (e) => {
    // Block click if a Ctrl+selection was just completed
    if (_selBoxConsumed) { _selBoxConsumed = false; return; }
    if (e.latlng.lng < 0 || e.latlng.lng > imageWidth ||
        e.latlng.lat < 0 || e.latlng.lat > imageHeight) return;
    await handleMapClickLatLng(e.latlng.lat, e.latlng.lng);
});

// ─── MARKER CLICK / CONTEXTMENU — DOM DELEGATION ─────────────────────────────
// Markers use interactive:false so their 140×140 div is transparent to pointer
// events except the .mkr-icon element (pointer-events:auto in CSS).
// We delegate from the map container so clicking outside the icon still places
// a new marker, and clicking the icon opens the edit popup.
// Capture phase (true) so our handler fires BEFORE Leaflet's internal listeners
// on the same element — stopPropagation then prevents the map click/contextmenu
// handlers from firing when the user clicked the marker icon.
document.getElementById("map").addEventListener("click", e => {
    const iconEl = e.target.closest(".mkr-icon");
    if (!iconEl) return;
    const wrap = iconEl.closest("[data-mid]");
    if (!wrap) return;
    const id = wrap.dataset.mid;
    if (id && displayedMarkers[id]) {
        openMarkerEditPopup(id, displayedMarkers[id].marker, displayedMarkers[id].data);
    }
    // Stop the event in capture phase so Leaflet never sees it → no new marker placed
    e.stopPropagation();
}, true);  // ← capture phase
// ─── MARKER DRAG (LMB) ───────────────────────────────────────────────────────
// Hold LMB on a marker icon and drag to reposition it; releases save to Firestore.
{
    let _dragId     = null;   // markerId being dragged
    let _dragMarker = null;   // L.Marker reference
    let _dragMoved  = false;  // did mouse actually move enough to count as drag?
    let _dragOrigin = null;   // { x, y } mousedown screen pos

    document.getElementById("map").addEventListener("mousedown", e => {
        if (e.button !== 0 || drawMode || rulerMode) return;
        const iconEl = e.target.closest(".mkr-icon");
        if (!iconEl) return;
        const wrap = iconEl.closest("[data-mid]");
        if (!wrap) return;
        const id = wrap.dataset.mid;
        if (!id || !displayedMarkers[id]) return;
        _dragId     = id;
        _dragMarker = displayedMarkers[id].marker;
        _dragMoved  = false;
        _dragOrigin = { x: e.clientX, y: e.clientY };
        e.stopPropagation();  // prevent Leaflet from panning
        map.dragging.disable();
    }, true);

    document.addEventListener("mousemove", e => {
        if (!_dragId) return;
        const dx = e.clientX - _dragOrigin.x, dy = e.clientY - _dragOrigin.y;
        if (!_dragMoved && Math.hypot(dx, dy) < 5) return;
        _dragMoved = true;
        const mapEl  = document.getElementById("map");
        const rect   = mapEl.getBoundingClientRect();
        const pt     = map.containerPointToLatLng(L.point(e.clientX - rect.left, e.clientY - rect.top));
        _dragMarker.setLatLng([pt.lat, pt.lng]);
    });

    document.addEventListener("mouseup", async e => {
        if (!_dragId) return;
        const id = _dragId;
        _dragId = null;
        if (!drawMode) map.dragging.enable();
        if (!_dragMoved) return;   // short click — let the click handler open popup
        const ll = _dragMarker.getLatLng();
        displayedMarkers[id].data.x = ll.lng;
        displayedMarkers[id].data.y = ll.lat;
        try { await updateDoc(doc(db, "markers", id), { x: ll.lng, y: ll.lat }); } catch (_) {}
    });
}

// Block the BROWSER context menu across the entire map wrapper — always.
// We do NOT stopPropagation so the marker contextmenu handler below can still fire.
// In 3D mode the canvas handler also calls stopPropagation so nothing leaks there.
document.getElementById("mapWrapper").addEventListener("contextmenu", (e) => {
    e.preventDefault();
}, true);

document.getElementById("map").addEventListener("contextmenu", async e => {
    const iconEl = e.target.closest(".mkr-icon");
    if (!iconEl) return;
    const wrap = iconEl.closest("[data-mid]");
    if (!wrap) return;
    const id = wrap.dataset.mid;
    if (id && displayedMarkers[id]) {
        e.preventDefault();
        // Stop propagation in capture phase so the coord popup never shows
        e.stopPropagation();
        if (await showConfirm("DELETE THIS MARKER?")) {
            map.closePopup();
            document.getElementById("_mep3d")?.remove();
            await deleteDoc(doc(db, "markers", id));
            const idx = undoStack.findIndex(u => u.type === "marker" && u.id === id);
            if (idx !== -1) undoStack.splice(idx, 1);
        }
    }
}, true);  // ← capture phase

// ─── DELTA VIDEO PLAYER ──────────────────────────────────────────────────────
function _fmtTime(s) {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2,"0")}`;
}
function _videoPlayerHtml(src, last3 = false) {
    const safe = escHtml(src);
    const l3 = last3 ? ' data-last3="1"' : '';
    return `
    <div class="dp">
      <video class="dp-video" src="${safe}" preload="metadata" playsinline${l3}></video>
      <div class="dp-controls">
        <button class="dp-btn" data-dp="playpause" title="Play / Pause">
          <svg viewBox="0 0 16 16"><polygon points="3,1 13,8 3,15" fill="currentColor"/></svg>
        </button>
        <span class="dp-time" data-dp-time>0:00 / 0:00</span>
        <input class="dp-seek dp-range" type="range" min="0" max="1000" value="0" step="1" data-dp="seek" title="Seek">
        <svg class="dp-vol-icon" viewBox="0 0 16 16"><path d="M2 5h3l4-3v12l-4-3H2z" fill="currentColor"/><path d="M11 5a4 4 0 0 1 0 6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>
        <input class="dp-vol dp-range" type="range" min="0" max="1" value="1" step="0.02" data-dp="vol" title="Volume">
        <button class="dp-btn" data-dp="fs" title="Fullscreen">
          <svg viewBox="0 0 16 16"><path d="M1 1h5M1 1v5M15 1h-5M15 1v5M1 15h5M1 15v-5M15 15h-5M15 15v-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>`;
}

// Delegated player events — work for any .dp inserted anywhere in the DOM
document.addEventListener("click", e => {
    const btn = e.target.closest("[data-dp]");
    if (!btn) return;
    const dp    = btn.closest(".dp");
    const video = dp?.querySelector(".dp-video");
    if (!video) return;
    const action = btn.dataset.dp;
    if (action === "playpause") { video.paused ? video.play() : video.pause(); }
    if (action === "fs") {
        if (document.fullscreenElement) document.exitFullscreen();
        else (dp.requestFullscreen || dp.webkitRequestFullscreen).call(dp);
    }
}, true);
document.addEventListener("input", e => {
    const el = e.target.closest("[data-dp]");
    if (!el) return;
    const dp    = el.closest(".dp");
    const video = dp?.querySelector(".dp-video");
    if (!video) return;
    if (el.dataset.dp === "seek" && isFinite(video.duration))
        video.currentTime = (el.value / 1000) * video.duration;
    if (el.dataset.dp === "vol") video.volume = el.value;
}, true);
document.addEventListener("loadedmetadata", e => {
    if (e.target.tagName !== "VIDEO" || !e.target.dataset.last3) return;
    const v = e.target;
    v.currentTime = Math.max(0, v.duration - 5);
    v.play().catch(() => {});
}, true);
document.addEventListener("timeupdate", e => {
    if (e.target.tagName !== "VIDEO") return;
    const dp = e.target.closest(".dp"); if (!dp) return;
    const seek = dp.querySelector("[data-dp='seek']");
    const time = dp.querySelector("[data-dp-time]");
    const v = e.target;
    if (seek && isFinite(v.duration)) seek.value = (v.currentTime / v.duration) * 1000;
    if (time) time.textContent = `${_fmtTime(v.currentTime)} / ${_fmtTime(v.duration)}`;
    // last-3 loop: when near end, jump back to 3 s before end
    if (v.dataset.last3 && isFinite(v.duration) && v.currentTime >= v.duration - 0.15) {
        v.currentTime = Math.max(0, v.duration - 5);
    }
}, true);
document.addEventListener("play", e => {
    if (e.target.tagName !== "VIDEO") return;
    const btn = e.target.closest(".dp")?.querySelector("[data-dp='playpause']");
    if (btn) btn.innerHTML = `<svg viewBox="0 0 16 16"><rect x="2" y="1" width="4" height="14" fill="currentColor"/><rect x="10" y="1" width="4" height="14" fill="currentColor"/></svg>`;
}, true);
document.addEventListener("pause", e => {
    if (e.target.tagName !== "VIDEO") return;
    const btn = e.target.closest(".dp")?.querySelector("[data-dp='playpause']");
    if (btn) btn.innerHTML = `<svg viewBox="0 0 16 16"><polygon points="3,1 13,8 3,15" fill="currentColor"/></svg>`;
}, true);

// Delegated handler for .clip-card clicks — opens a small popup window
document.addEventListener("click", e => {
    const card = e.target.closest(".clip-card");
    if (!card) return;
    const url = card.dataset.clipUrl;
    if (url) window.open(url, "delta_clip",
        "width=960,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes");
});

function _clipCardInner(url) {
    const label = url.length > 46 ? url.slice(0, 44) + "…" : url;
    return `
      <svg class="clip-card-play" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
        <polygon points="25,17 49,32 25,47" fill="rgba(255,255,255,.9)"/>
      </svg>
      <div class="clip-card-label">${escHtml(label)}</div>
      <div class="clip-card-hint">CLICK TO OPEN IN POPUP</div>`;
}

function _clipPreviewHtml(url) {
    if (!url) return "";
    const safe = escHtml(url);
    if (/\.(jpe?g|png|gif|webp)(\?|$)/i.test(url))
        return `<img src="${safe}" alt="preview" style="width:100%;height:100%;object-fit:contain;display:block;"/>`;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url))
        return _videoPlayerHtml(url, true);  // preview: loop last 3 s
    return `<div class="clip-card" data-clip-url="${safe}">${_clipCardInner(url)}</div>`;
}
function _clipEmbedHtml(url) {
    if (!url) return "";
    if (/\.(jpe?g|png|gif|webp)(\?|$)/i.test(url))
        return `<img src="${escHtml(url)}" alt="clip" style="width:100%;height:100%;object-fit:contain;"/>`;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url))
        return `<div style="width:100%;height:100%;">${_videoPlayerHtml(url)}</div>`;
    return `
      <div class="clip-card" data-clip-url="${escHtml(url)}" style="position:absolute;inset:0;border-radius:0;">
        ${_clipCardInner(url)}
      </div>`;
}
function _openClipOverlay(url, label) {
    const overlay = document.getElementById("clipOverlay");
    const body    = document.getElementById("clipOverlayBody");
    const title   = document.getElementById("clipOverlayTitle");
    if (!overlay || !body) return;
    body.innerHTML    = _clipEmbedHtml(url);
    title.textContent = label ? `CLIP — ${label}` : "CLIP";
    overlay.style.display = "flex";
}
document.getElementById("clipOverlayClose")?.addEventListener("click", () => {
    const overlay = document.getElementById("clipOverlay");
    overlay.style.display = "none";
    document.getElementById("clipOverlayBody").innerHTML = "";
});
document.getElementById("clipOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        e.currentTarget.style.display = "none";
        document.getElementById("clipOverlayBody").innerHTML = "";
    }
});

function openMarkerEditPopup(markerId, markerLeaflet, data) {
    const isInfo = (data.type || "").startsWith("info");
    const clipVal = escHtml(data.clip || "");
    const previewHtml = data.clip ? _clipPreviewHtml(data.clip) : "";
    const previewSection = `
        <div class="mep-clip-preview" id="mep-clip-preview" style="${data.clip ? "" : "display:none"}">
          ${previewHtml}
        </div>`;
    const clipRow = `
        <div class="mep-row">
          <label class="mep-label" for="mep-clip">CLIP</label>
          <input class="mep-inp" id="mep-clip" type="text"
                 value="${clipVal}" placeholder="medal.tv/clips/…"/>
          <button class="mep-clip-btn" id="mep-clip-view">▶</button>
        </div>
        ${previewSection}`;
    const amtRow = isInfo ? "" : `
        <div class="mep-row">
          <label class="mep-label" for="mep-amt">AMT</label>
          <input class="mep-inp" id="mep-amt" type="text"
                 value="${escHtml(String(data.amount || ""))}"/>
        </div>`;
    const srcRow = isInfo ? "" : `
        <div class="mep-row">
          <label class="mep-label" for="mep-src">SRC</label>
          <input class="mep-inp" id="mep-src" type="text"
                 value="${escHtml(data.source || "")}"/>
        </div>`;
    const popupContent = `
      <div class="mep-popup">
        <div class="mep-row">
          <span class="mep-label">DATE</span>
          <span class="mep-date">${escHtml(data.date || "")}</span>
        </div>
        <div class="mep-row">
          <span class="mep-label">BY</span>
          <span class="mep-date">${escHtml(data.author || "—")}</span>
        </div>
        ${amtRow}
        <div class="mep-row">
          <label class="mep-label" for="mep-inf">INFO</label>
          <input class="mep-inp" id="mep-inf" type="text"
                 value="${escHtml(data.info || "")}"
                 placeholder="${isInfo ? "Enter information…" : ""}"/>
        </div>
        ${srcRow}
        ${clipRow}
        <button class="mep-save" id="mep-save">SAVE</button>
      </div>`;

    // In 3D mode Leaflet popups are hidden under the canvas — use a fixed panel instead
    if (map3DState) {
        _show3DMarkerPanel(markerId, isInfo, data);
        return;
    }

    // IMPORTANT: register popupopen handler BEFORE openOn() — Leaflet fires it synchronously
    map.once("popupopen", () => {
        document.getElementById("mep-clip-view")?.addEventListener("click", () => {
            const url = document.getElementById("mep-clip")?.value.trim();
            if (!url) return;
            // Refresh inline preview with current input value
            const preview = document.getElementById("mep-clip-preview");
            if (preview) { preview.innerHTML = _clipPreviewHtml(url); preview.style.display = ""; }
        });
        document.getElementById("mep-save")?.addEventListener("click", async () => {
            const amt  = document.getElementById("mep-amt")?.value  ?? "";
            const inf  = document.getElementById("mep-inf")?.value  ?? "";
            const src  = document.getElementById("mep-src")?.value  ?? "";
            const clip = document.getElementById("mep-clip")?.value.trim() || null;
            const update = isInfo
                ? { info: inf, ...(clip !== null && { clip }) }
                : { amount: amt, info: inf, source: src, ...(clip !== null && { clip }) };
            await updateDoc(doc(db, "markers", markerId), update);
            map.closePopup();
        });
    });

    // Close any previously opened popup, then open a fresh standalone one
    map.closePopup();
    L.popup({ className: "mep-outer", maxWidth: 260, minWidth: 220, autoPan: true, offset: L.point(160, 40) })
        .setLatLng(markerLeaflet.getLatLng())
        .setContent(popupContent)
        .openOn(map);
}

// ── Fixed-position marker editor for 3D mode ─────────────────────────────────
function _show3DMarkerPanel(markerId, isInfo, data) {
    document.getElementById("_mep3d")?.remove();
    const panel = document.createElement("div");
    panel.id = "_mep3d";
    panel.className = "mep-popup mep-popup-3d";
    const amtRow = isInfo ? "" : `
      <div class="mep-row">
        <label class="mep-label" for="mep3d-amt">AMT</label>
        <input class="mep-inp" id="mep3d-amt" type="text" value="${escHtml(String(data.amount||""))}"/>
      </div>`;
    const srcRow = isInfo ? "" : `
      <div class="mep-row">
        <label class="mep-label" for="mep3d-src">SRC</label>
        <input class="mep-inp" id="mep3d-src" type="text" value="${escHtml(data.source||"")}"/>
      </div>`;
    const preview3d = data.clip
        ? `<div class="mep-clip-preview">${_clipPreviewHtml(data.clip)}</div>` : "";
    const clipRow = `
      <div class="mep-row">
        <label class="mep-label" for="mep3d-clip">CLIP</label>
        <input class="mep-inp" id="mep3d-clip" type="text"
               value="${escHtml(data.clip||"")}" placeholder="medal.tv/clips/…"/>
        <button class="mep-clip-btn" id="mep3d-clip-view">▶</button>
      </div>
      <div class="mep-clip-preview" id="mep3d-clip-preview" style="${data.clip ? "" : "display:none"}">
        ${_clipPreviewHtml(data.clip||"")}
      </div>`;
    panel.innerHTML = `
      <button class="mep-close3d" id="_mep3dX">✕</button>
      <div class="mep-row">
        <span class="mep-label">DATE</span>
        <span class="mep-date">${escHtml(data.date||"")}</span>
      </div>
      <div class="mep-row">
        <span class="mep-label">BY</span>
        <span class="mep-date">${escHtml(data.author||"—")}</span>
      </div>
      ${amtRow}
      <div class="mep-row">
        <label class="mep-label" for="mep3d-inf">INFO</label>
        <input class="mep-inp" id="mep3d-inf" type="text" value="${escHtml(data.info||"")}"
               placeholder="${isInfo ? "Enter information…" : ""}"/>
      </div>
      ${srcRow}
      ${clipRow}
      <button class="mep-save" id="_mep3dSave">SAVE</button>`;
    document.body.appendChild(panel);

    const close = () => panel.remove();
    document.getElementById("_mep3dX").addEventListener("click", close);
    document.getElementById("mep3d-clip-view")?.addEventListener("click", () => {
        const url = document.getElementById("mep3d-clip")?.value.trim();
        if (!url) return;
        const preview = document.getElementById("mep3d-clip-preview");
        if (preview) { preview.innerHTML = _clipPreviewHtml(url); preview.style.display = ""; }
    });
    document.getElementById("_mep3dSave").addEventListener("click", async () => {
        const amt  = document.getElementById("mep3d-amt")?.value  ?? "";
        const inf  = document.getElementById("mep3d-inf")?.value  ?? "";
        const src  = document.getElementById("mep3d-src")?.value  ?? "";
        const clip = document.getElementById("mep3d-clip")?.value.trim() || null;
        const update = isInfo
            ? { info: inf, ...(clip !== null && { clip }) }
            : { amount: amt, info: inf, source: src, ...(clip !== null && { clip }) };
        await updateDoc(doc(db, "markers", markerId), update);
        close();
    });
    // Click outside to close
    setTimeout(() => {
        const onOut = (e) => {
            if (!panel.contains(e.target) && !document.getElementById("clipOverlay")?.contains(e.target)) {
                close(); document.removeEventListener("pointerdown", onOut, true);
            }
        };
        document.addEventListener("pointerdown", onOut, true);
    }, 150);
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
    if (map3DState) map3DState.flyTo(y, x);
}
coordSearchBtn.addEventListener("click", goToCoords);
coordSearchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") goToCoords(); });
// ════════════════════════════════════════════════════════════════════
// DRAWING SYSTEM
// ════════════════════════════════════════════════════════════════════
const canvas = document.getElementById("drawCanvas");
const ctx    = canvas.getContext("2d");
// Initial subscription — must come after ctx is declared (subscribeToMap calls redrawAll)
subscribeToMap(MAPS[currentMapIdx].id);
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
        if (activeTool === btn.dataset.tool) {
            // Clicking the active tool deselects it
            activeTool = null;
            document.querySelectorAll(".drawToolBtn").forEach(b => b.classList.remove("active"));
            canvas.dataset.tool = "";
        } else {
            activeTool = btn.dataset.tool;
            document.querySelectorAll(".drawToolBtn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            canvas.dataset.tool = activeTool;
        }
        updateCanvasActive();
    });
});
// No tool selected by default
// ─── DRAW MODE TOGGLE ─────────────────────────────────────────────────────────
const toggleBtn = document.getElementById("toggleDrawMode");
function applyDrawMode() {
    if (drawMode && rulerMode) toggleRuler();
    toggleBtn.textContent = drawMode ? "ON" : "OFF";
    toggleBtn.classList.toggle("on", drawMode);
    document.getElementById("mapWrapper")?.classList.toggle("draw-mode-3d", drawMode);
    map.dragging[drawMode ? "disable" : "enable"]();
    // Scroll-wheel zoom stays enabled in draw mode so users can zoom while drawing
    document.getElementById("drawModeStatus").textContent = t(drawMode ? "drawOn" : "drawOff");
    updateCanvasActive();
}
// Canvas captures pointer events (crosshair) only when draw mode is on AND a tool is selected
function updateCanvasActive() {
    canvas.classList.toggle("active", drawMode && activeTool !== null);
}
toggleBtn.addEventListener("click", () => {
    drawMode = !drawMode;
    applyDrawMode();
});
// Forward wheel events from canvas to map so zoom works during drawing
canvas.addEventListener("wheel", (e) => {
    if (!drawMode) return;
    map.getContainer().dispatchEvent(new WheelEvent("wheel", {
        bubbles: true, cancelable: true,
        deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ,
        deltaMode: e.deltaMode,
        clientX: e.clientX, clientY: e.clientY,
        ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey
    }));
    e.preventDefault();
}, { passive: false });

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
    if (window.__artyRedrawHook) window.__artyRedrawHook();
    // Draw selection box if active
    if (selBox) drawSelectionBox(ctx, selBox.x1, selBox.y1, selBox.x2, selBox.y2);
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
    } else if (s.tool === "label") {
        const [cx, cy] = llToCanvas(s.ll1.lat, s.ll1.lng);
        const fs = Math.max(10, Math.min(s.width * 4, 32));
        ctx.font = `700 ${fs}px 'Share Tech Mono', monospace`;
        ctx.fillStyle = s.color;
        // subtle shadow for readability on any background
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur  = 4;
        ctx.fillText(s.labelText || "", cx, cy);
        ctx.shadowBlur = 0;
    } else if (s.tool === "zone") {
        const [x1, y1] = llToCanvas(s.ll1.lat, s.ll1.lng);
        const [x2, y2] = llToCanvas(s.ll2.lat, s.ll2.lng);
        const rx = Math.min(x1, x2), ry = Math.min(y1, y2);
        const rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1);
        // Filled semi-transparent rect
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = s.color;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.globalAlpha = 1;
        // Dashed border
        ctx.strokeStyle = s.color;
        ctx.lineWidth = Math.max(1, s.width || 2);
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);
        // Name label centered
        if (s.zoneName) {
            const cx2 = rx + rw / 2, cy2 = ry + rh / 2;
            const fs2 = Math.max(10, Math.min(rh * 0.18, 22));
            ctx.font = `700 ${fs2}px 'Share Tech Mono', monospace`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            const tw = ctx.measureText(s.zoneName).width;
            ctx.fillStyle = "rgba(6,12,22,0.72)";
            ctx.fillRect(cx2 - tw / 2 - 6, cy2 - fs2 / 2 - 3, tw + 12, fs2 + 6);
            ctx.fillStyle = s.color;
            ctx.fillText(s.zoneName, cx2, cy2);
            ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        }
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
    } else if (activeTool === "zone") {
        const rw = curX - startCanvasX, rh = curY - startCanvasY;
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = penColor;
        ctx.fillRect(startCanvasX, startCanvasY, rw, rh);
        ctx.globalAlpha = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(startCanvasX, startCanvasY, rw, rh);
        ctx.setLineDash([]);
    }
    ctx.restore();
}
// ─── MOUSE EVENTS ────────────────────────────────────────────────────────────
// ─── CTRL+LMB SELECTION BOX ──────────────────────────────────────────────────
function drawSelectionBox(ctx, x1, y1, x2, y2) {
    const rx = Math.min(x1,x2), ry = Math.min(y1,y2);
    const rw = Math.abs(x2-x1), rh = Math.abs(y2-y1);
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#4fa3ff";
    ctx.fillRect(rx, ry, rw, rh);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#4fa3ff";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.setLineDash([]);
    ctx.restore();
}

canvas.addEventListener("mousedown", (e) => {
    // Ctrl+LMB: selection box (works regardless of drawMode)
    if (e.ctrlKey && e.button === 0) {
        e.preventDefault();
        e.stopPropagation();
        _selBoxActive = true;
        _selBoxConsumed = false;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        selBox = { x1: x, y1: y, x2: x, y2: y };
        return;
    }
    // Block new drawing while zone-name or label popup is open
    const _znw = document.getElementById("zoneNameWrap");
    const _lbw = document.getElementById("labelInputWrap");
    if ((_znw && _znw.style.display !== "none") ||
        (_lbw && _lbw.style.display !== "none")) return;
    if (!drawMode || !activeTool) return;
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
// Document-level handlers for selection box (work even outside canvas)
document.addEventListener("mousemove", (e) => {
    if (!_selBoxActive || !selBox) return;
    const rect = canvas.getBoundingClientRect();
    selBox.x2 = e.clientX - rect.left;
    selBox.y2 = e.clientY - rect.top;
    redrawAll();
});

canvas.addEventListener("mousemove", (e) => {
    if (_selBoxActive) return; // handled by document listener
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
// Document-level mouseup handles selection box completion
document.addEventListener("mouseup", async (e) => {
    if (!_selBoxActive || !selBox) return;
    _selBoxActive = false;
    _selBoxConsumed = true;
    _drawCanvas?.classList.remove("ctrl-select");
    if (!drawMode) map.dragging.enable();

    const { x1, y1, x2, y2 } = selBox;
    const rx1 = Math.min(x1, x2), ry1 = Math.min(y1, y2);
    const rx2 = Math.max(x1, x2), ry2 = Math.max(y1, y2);
    selBox = null;
    redrawAll();

    if (rx2 - rx1 < 8 || ry2 - ry1 < 8) return; // tiny accidental box

    // Find markers inside box
    const selectedIds = Object.entries(displayedMarkers).filter(([, { marker }]) => {
        const pt = map.latLngToContainerPoint(marker.getLatLng());
        const mapRect = document.getElementById("map").getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const cx = pt.x + (mapRect.left - canvasRect.left);
        const cy = pt.y + (mapRect.top  - canvasRect.top);
        return cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2;
    }).map(([id]) => id);

    // Find strokes/shapes/text/AOIs inside box
    const selectedStrokes = strokes.filter(s => {
        // Freehand pen/eraser: check if any point is inside box
        if (s.points?.length) {
            return s.points.some(({ lat, lng }) => {
                const [cx, cy] = llToCanvas(lat, lng);
                return cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2;
            });
        }
        // Shapes (line, rect, circle, arrow, zone) and text: use ll1/ll2 bounding box
        if (s.ll1 && s.ll2) {
            const [ax1, ay1] = llToCanvas(s.ll1.lat, s.ll1.lng);
            const [ax2, ay2] = llToCanvas(s.ll2.lat, s.ll2.lng);
            const sMinX = Math.min(ax1, ax2), sMaxX = Math.max(ax1, ax2);
            const sMinY = Math.min(ay1, ay2), sMaxY = Math.max(ay1, ay2);
            // Intersect: selection box overlaps shape bounding box
            return sMinX <= rx2 && sMaxX >= rx1 && sMinY <= ry2 && sMaxY >= ry1;
        }
        // Label with single point (ll1 only)
        if (s.ll1) {
            const [cx, cy] = llToCanvas(s.ll1.lat, s.ll1.lng);
            return cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2;
        }
        return false;
    });

    const totalCount = selectedIds.length + selectedStrokes.length;
    if (totalCount === 0) return;

    const ok = await showConfirm(`Delete ${totalCount} selected item${totalCount > 1 ? "s" : ""}?`, "DELETE");
    if (!ok) return;

    for (const id of selectedIds) {
        try { await deleteDoc(doc(db, "markers", id)); } catch (_) {}
    }
    for (const s of selectedStrokes) {
        if (s.firestoreId) try { await deleteDoc(doc(db, "drawings", s.firestoreId)); } catch (_) {}
    }
});

canvas.addEventListener("mouseup", async (e) => {
    if (_selBoxActive) return; // handled by document listener
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
            const docRef = await addDrawing(strokeData);
            undoStack.push({ type: "drawing", id: docRef.id });
        } catch (err) {
            console.error("Failed to save drawing:", err);
            const localId = "_local_" + Date.now() + "_" + Math.random();
            strokes.push({ ...strokeData, firestoreId: localId });
            undoStack.push({ type: "drawing", id: localId });
            redrawAll();
        }
    } else if (activeTool === "zone") {
        const endLL = canvasToLL(x, y);
        // Show zone name input at center of drawn zone
        const cxPx = (startCanvasX + x) / 2;
        const cyPx = (startCanvasY + y) / 2;
        const zWrap = document.getElementById("zoneNameWrap");
        const zField = document.getElementById("zoneNameField");
        if (zWrap && zField) {
            zWrap.style.display = "block";
            zWrap.style.left = (cxPx - 60) + "px";
            zWrap.style.top  = (cyPx - 16) + "px";
            zField.value = ""; zField.focus();
            let _zoneCommitted = false;
            const commitZone = async () => {
                if (_zoneCommitted) return;
                _zoneCommitted = true;
                zWrap.style.display = "none";
                zField.removeEventListener("keydown", onKey);
                zField.removeEventListener("blur", commitZone);
                const stroke = {
                    tool:     "zone",
                    color:    penColor,
                    width:    penWidth,
                    ll1:      { lat: startMapLL.lat, lng: startMapLL.lng },
                    ll2:      { lat: endLL.lat,      lng: endLL.lng },
                    zoneName: (zField.value.trim().toUpperCase() || "AOI"),
                    created:  Date.now()
                };
                redrawAll();
                try {
                    const docRef = await addDrawing(stroke);
                    undoStack.push({ type: "drawing", id: docRef.id });
                } catch (err) {
                    console.error("Failed to save zone:", err);
                    const localId = "_local_" + Date.now() + "_" + Math.random();
                    strokes.push({ ...stroke, firestoreId: localId });
                    undoStack.push({ type: "drawing", id: localId });
                    redrawAll();
                }
            };
            const onKey = (e) => {
                if (e.key === "Enter") { commitZone(); }
                if (e.key === "Escape") {
                    _zoneCommitted = true; // prevent blur from committing
                    zWrap.style.display = "none";
                    zField.removeEventListener("keydown", onKey);
                    zField.removeEventListener("blur", commitZone);
                    redrawAll();
                }
            };
            zField.addEventListener("keydown", onKey);
            zField.addEventListener("blur", commitZone);
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
            const docRef = await addDrawing(stroke);
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
            const docRef = await addDrawing(strokeData);
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
// ─── LABEL TOOL — click to place floating input, Enter to commit ─────────────
{
    const labelWrap  = document.getElementById("labelInputWrap");
    const labelField = document.getElementById("labelInputField");
    let   labelLL    = null;   // map latlng where the label will be anchored

    canvas.addEventListener("click", (e) => {
        if (!drawMode || activeTool !== "label") return;
        const { offsetX: x, offsetY: y } = e;
        labelLL = canvasToLL(x, y);
        // Position the floating input near the click point
        labelWrap.style.left = (x + 4) + "px";
        labelWrap.style.top  = (y - 20) + "px";
        labelField.value = "";
        labelWrap.style.display = "block";
        labelField.focus();
    });

    async function commitLabel() {
        const text = labelField.value.trim();
        labelWrap.style.display = "none";
        if (!text || !labelLL) return;
        const stroke = {
            tool:      "label",
            labelText: text,
            color:     penColor,
            width:     penWidth,
            ll1:       { lat: labelLL.lat, lng: labelLL.lng },
            created:   Date.now()
        };
        try {
            const docRef = await addDrawing(stroke);
            undoStack.push({ type: "drawing", id: docRef.id });
        } catch (err) {
            console.error("Label save failed:", err);
            strokes.push({ ...stroke, firestoreId: "_local_" + Date.now() });
            redrawAll();
        }
    }

    labelField.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  { e.preventDefault(); commitLabel(); }
        if (e.key === "Escape") { labelWrap.style.display = "none"; }
    });
    labelField.addEventListener("blur", () => {
        // Small delay so click-to-commit doesn't race
        setTimeout(() => { if (labelWrap.style.display !== "none") commitLabel(); }, 150);
    });
}
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
        map3DState?.clearRuler3D();
        arty3DState?.clearRuler3D();
    }
}
rulerBtn.addEventListener("click", toggleRuler);


// ─── 3D VIEW ──────────────────────────────────────────────────────────────────
// Uses Three.js (loaded on demand) to render the map as a flat textured plane.
// Controls: scroll = zoom, middle-drag = orbit, right-drag = pan.

// map3DState and arty3DState declared at top of file

async function create3DScene(container, { withMarkers = false, isArty = false } = {}) {
    const THREE = await import("three");
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
    const { CSS2DRenderer, CSS2DObject } = await import("three/addons/renderers/CSS2DRenderer.js");

    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 600;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    const canvas = renderer.domElement;
    canvas.className = "view-3d-canvas";
    container.appendChild(canvas);

    // ── CSS2D label overlay (for marker text labels in 3D) ─────────────────────
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(W, H);
    labelRenderer.domElement.style.cssText =
        "position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;z-index:521;";

    // ── Watermark overlay canvas ──────────────────────────────────────────────
    const wmCanvas = document.createElement("canvas");
    wmCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:522;";
    wmCanvas.width  = W;
    wmCanvas.height = H;
    container.appendChild(wmCanvas);
    function draw3DWatermark() {
        const userId = getCurrentUser()?.userId || null;
        if (!userId) { wmCanvas.getContext("2d").clearRect(0,0,wmCanvas.width,wmCanvas.height); return; }
        _paintWatermark(wmCanvas.getContext("2d"), wmCanvas.width, wmCanvas.height, userId);
    }
    draw3DWatermark();

    // ── Scene / camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x060c16);
    const camera = new THREE.PerspectiveCamera(50, W / H, 1, 8000);
    camera.position.set(0, 900, 650);

    // ── Map plane ─────────────────────────────────────────────────────────────
    const PW = imageWidth;    // 1204
    const PH = imageHeight;   // 1290
    const texture = await new Promise((res, rej) =>
        new THREE.TextureLoader().load(MAPS[currentMapIdx].file, res, undefined, rej)
    );
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;

    const geo  = new THREE.PlaneGeometry(PW, PH);
    const mat  = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    const borderGeo = new THREE.EdgesGeometry(geo);
    const borderMat = new THREE.LineBasicMaterial({ color: 0x4fa3ff, transparent: true, opacity: 0.35 });
    const border = new THREE.LineSegments(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = 1;
    scene.add(border);

    // ── OrbitControls ─────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping      = true;
    controls.dampingFactor      = 0.06;
    controls.screenSpacePanning = true;
    controls.minDistance        = 60;
    controls.maxDistance        = 4000;
    controls.maxPolarAngle      = Math.PI / 2 - 0.01;
    controls.mouseButtons = {
        LEFT:   THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT:  null   // right-click does nothing; zoom via scroll wheel only
    };
    controls.enableZoom = true;   // scroll wheel zoom stays on
    controls.target.set(0, 0, 0);
    controls.update();

    // Attach label renderer after OrbitControls so it doesn't capture events
    container.appendChild(labelRenderer.domElement);

    // ── Render loop ───────────────────────────────────────────────────────────
    let animId;
    const animate = () => {
        animId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    };
    animate();

    // ── Resize observer ───────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
        const w = container.clientWidth, h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        labelRenderer.setSize(w, h);
    });
    ro.observe(container);

    // ── Coordinate helpers ────────────────────────────────────────────────────
    // Leaflet (lat=y, lng=x) ↔ Three.js world XZ
    function l2t(lat, lng) { return { x: lng - PW / 2, z: PH / 2 - lat }; }

    // ── Raycaster ─────────────────────────────────────────────────────────────
    const raycaster  = new THREE.Raycaster();
    const _mouseNDC  = new THREE.Vector2();
    function getHitOnPlane(clientX, clientY) {
        const r = canvas.getBoundingClientRect();
        _mouseNDC.set(
            ((clientX - r.left) / r.width)  *  2 - 1,
            -((clientY - r.top)  / r.height) *  2 + 1
        );
        raycaster.setFromCamera(_mouseNDC, camera);
        const hits = raycaster.intersectObject(mesh);
        return hits.length ? hits[0].point : null;
    }

    // ── Pointer interaction (capture phase — runs before OrbitControls) ────────
    let _ptrStart  = null;   // for click-to-place-marker detection
    let _draw3D    = false;
    let _drawStroke3D = null;
    let _drawStartLL  = null;

    canvas.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        if (drawMode && activeTool) {
            e.stopPropagation();   // block OrbitControls while drawing
            _draw3D = true;
            const pt = getHitOnPlane(e.clientX, e.clientY);
            if (!pt) return;
            const ll = { lat: PH / 2 - pt.z, lng: pt.x + PW / 2 };
            _drawStartLL = ll;
            if (activeTool === "pen" || activeTool === "eraser") {
                _drawStroke3D = { tool: activeTool, color: penColor, width: penWidth, points: [ll] };
            }
        } else {
            _ptrStart = { x: e.clientX, y: e.clientY };
        }
    }, true);

    canvas.addEventListener("pointermove", (e) => {
        if (!_draw3D || !drawMode || !activeTool) return;
        e.stopPropagation();
        const pt = getHitOnPlane(e.clientX, e.clientY);
        if (!pt) return;
        const ll = { lat: PH / 2 - pt.z, lng: pt.x + PW / 2 };
        if (_drawStroke3D) {
            _drawStroke3D.points.push(ll);
            _updatePreview3D(_drawStroke3D.points);
        }
    }, true);

    canvas.addEventListener("pointerup", async (e) => {
        if (e.button !== 0) return;
        if (drawMode && _draw3D) {
            e.stopPropagation();
            _draw3D = false;
            const pt = getHitOnPlane(e.clientX, e.clientY);
            const endLL = pt ? { lat: PH / 2 - pt.z, lng: pt.x + PW / 2 } : _drawStartLL;
            _clearPreview3D();
            if (_drawStroke3D) {
                const sd = { tool: _drawStroke3D.tool, color: _drawStroke3D.color,
                             width: _drawStroke3D.width, points: _drawStroke3D.points,
                             created: Date.now() };
                _drawStroke3D = null;
                if (sd.points.length >= 2) {
                    try {
                        const ref = await addDrawing(sd);
                        undoStack.push({ type: "drawing", id: ref.id });
                    } catch (err) { console.error("3D drawing save:", err); }
                }
            } else if (_drawStartLL && endLL) {
                const sd = { tool: activeTool, color: penColor, width: penWidth,
                             ll1: _drawStartLL, ll2: endLL, created: Date.now() };
                _drawStartLL = null;
                try {
                    const ref = await addDrawing(sd);
                    undoStack.push({ type: "drawing", id: ref.id });
                } catch (err) { console.error("3D drawing save:", err); }
            }
            _drawStartLL = null;
        } else if (!drawMode && rulerMode && _ptrStart) {
            // Ruler in 3D: click to place ruler points
            const dx = e.clientX - _ptrStart.x, dy = e.clientY - _ptrStart.y;
            _ptrStart = null;
            if (Math.hypot(dx, dy) < 5) {
                const pt = getHitOnPlane(e.clientX, e.clientY);
                if (pt) {
                    const lat = PH / 2 - pt.z, lng = pt.x + PW / 2;
                    rulerPoints.push(L.latLng(lat, lng));
                    if (rulerPoints.length >= 2) {
                        const last = rulerPoints[rulerPoints.length - 1];
                        const prev = rulerPoints[rulerPoints.length - 2];
                        // Compute TOTAL ruler distance (all segments), using direct px→m conversion
                        // (bypasses map zoom scaling since 3D coords are already in zoom-0 pixels)
                        let totalM = 0;
                        for (let ri = 1; ri < rulerPoints.length; ri++) {
                            const a = rulerPoints[ri - 1], b = rulerPoints[ri];
                            const rawPx = Math.hypot(b.lat - a.lat, b.lng - a.lng);
                            totalM += (rawPx / PIXELS_PER_METER_DYNAMIC) * DIST_CORRECTION;
                        }
                        const distStr = formatDistance(totalM);
                        if (rulerReadout) rulerReadout.textContent = `TOTAL: ${distStr}`;
                        if (rulerTooltip) {
                            rulerTooltip.style.display = "block";
                            rulerTooltip.style.left = e.clientX + "px";
                            rulerTooltip.style.top  = (e.clientY - 28) + "px";
                            rulerTooltip.textContent = distStr;
                        }
                        // Draw ruler line in 3D
                        update3DRuler();
                    }
                }
            }
        } else if (!drawMode && !rulerMode && _ptrStart) {
            const dx = e.clientX - _ptrStart.x, dy = e.clientY - _ptrStart.y;
            _ptrStart = null;
            if (Math.hypot(dx, dy) < 5) {
                if (isArty) {
                    // LMB in arty 3D → place gun
                    const pt = getHitOnPlane(e.clientX, e.clientY);
                    if (pt) {
                        const lat = PH / 2 - pt.z, lng = pt.x + PW / 2;
                        artyGunPx = { lat, lng };
                        const sx = Math.round(lng * ARTY_PX_TO_STUD);
                        const sy = Math.round(lat * ARTY_PX_TO_STUD);
                        const gxi = document.getElementById("artyGunX"); if (gxi) gxi.value = sx;
                        const gyi = document.getElementById("artyGunY"); if (gyi) gyi.value = sy;
                        addSimple("_gun", lat, lng, "G", "#4ade80");
                        triggerArtyCalc();
                    }
                } else {
                    // Check sprite (marker icon) hit first — opens edit popup
                    const hitId = hitSprite(e.clientX, e.clientY);
                    if (hitId && displayedMarkers[hitId]) {
                        openMarkerEditPopup(hitId, displayedMarkers[hitId].marker, displayedMarkers[hitId].data);
                    } else {
                        const pt = getHitOnPlane(e.clientX, e.clientY);
                        if (pt) {
                            const lat = PH / 2 - pt.z, lng = pt.x + PW / 2;
                            if (lat >= 0 && lat <= PH && lng >= 0 && lng <= PW) {
                                await handleMapClickLatLng(lat, lng);
                            }
                        }
                    }
                }
            }
        } else {
            _ptrStart = null;
        }
    }, true);

    // ── RMB click on sprite → delete marker (monitor) / set target (arty) ───────
    let _rmbStart = null;
    canvas.addEventListener("pointerdown", (e) => {
        if (e.button === 2) _rmbStart = { x: e.clientX, y: e.clientY };
    }, true);
    // Suppress browser context menu on the 3D canvas so RMB actions work cleanly
    canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); e.stopPropagation(); }, true);
    canvas.addEventListener("pointerup", async (e) => {
        if (e.button !== 2 || !_rmbStart) return;
        const dx = e.clientX - _rmbStart.x, dy = e.clientY - _rmbStart.y;
        _rmbStart = null;
        if (Math.hypot(dx, dy) >= 5) return;
        if (isArty) {
            // RMB in arty 3D → place target
            const pt = getHitOnPlane(e.clientX, e.clientY);
            if (!pt) return;
            const lat = PH / 2 - pt.z, lng = pt.x + PW / 2;
            e.preventDefault(); e.stopPropagation();
            artyTgtPx = { lat, lng };
            const sx = Math.round(lng * ARTY_PX_TO_STUD);
            const sy = Math.round(lat * ARTY_PX_TO_STUD);
            const txi = document.getElementById("artyTgtX"); if (txi) txi.value = sx;
            const tyi = document.getElementById("artyTgtY"); if (tyi) tyi.value = sy;
            addSimple("_tgt", lat, lng, "T", "#f87171");
            triggerArtyCalc();
            return;
        }
        const hitId = hitSprite(e.clientX, e.clientY);
        if (!hitId || !displayedMarkers[hitId]) return;
        e.preventDefault(); e.stopPropagation();
        if (await showConfirm("DELETE THIS MARKER?")) {
            await deleteDoc(doc(db, "markers", hitId));
            const idx = undoStack.findIndex(u => u.type === "marker" && u.id === hitId);
            if (idx !== -1) undoStack.splice(idx, 1);
        }
    }, true);

    // ── Live pen-stroke preview ────────────────────────────────────────────────
    let _previewLine = null;
    function _updatePreview3D(points) {
        _clearPreview3D();
        if (points.length < 2) return;
        const verts = points.map(p => { const { x, z } = l2t(p.lat, p.lng); return new THREE.Vector3(x, 1.5, z); });
        const g = new THREE.BufferGeometry().setFromPoints(verts);
        const m = new THREE.LineBasicMaterial({ color: new THREE.Color(penColor), transparent: true, opacity: 0.9 });
        _previewLine = new THREE.Line(g, m);
        scene.add(_previewLine);
    }
    function _clearPreview3D() {
        if (!_previewLine) return;
        scene.remove(_previewLine);
        _previewLine.geometry.dispose();
        _previewLine.material.dispose();
        _previewLine = null;
    }

    // ── 3D Markers ─────────────────────────────────────────────────────────────
    const markers3D  = {};
    const spriteToId = new Map();   // reverse lookup: Sprite → markerId

    function svgToTex(svgStr) {
        return new Promise(resolve => {
            const SX = 2, CW = 46 * SX, CH = 57 * SX;
            const cv = document.createElement("canvas");
            cv.width = CW; cv.height = CH;
            const ctx = cv.getContext("2d");
            const url = URL.createObjectURL(new Blob([svgStr], { type: "image/svg+xml" }));
            const img = new Image(CW, CH);
            const done = () => {
                URL.revokeObjectURL(url);
                const t = new THREE.CanvasTexture(cv);
                if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
                t.needsUpdate = true;
                resolve(t);
            };
            img.onload = () => { ctx.drawImage(img, 0, 0, CW, CH); done(); };
            img.onerror = () => {
                ctx.fillStyle = "#e3716a";
                ctx.beginPath();
                ctx.moveTo(CW/2,4); ctx.lineTo(CW-4,CH/2); ctx.lineTo(CW/2,CH-4); ctx.lineTo(4,CH/2);
                ctx.closePath(); ctx.fill();
                done();
            };
            img.src = url;
        });
    }

    async function addMarker3D(id, data) {
        removeMarker3D(id);
        if (!withMarkers) return;
        const { x: mx, z: mz } = l2t(data.y, data.x);
        const POLE = 65;
        const pts = new Float32Array([mx, 2, mz, mx, POLE, mz]);
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
        const lineMat = new THREE.LineBasicMaterial({ color: 0xbcccdd, transparent: true, opacity: 0.85 });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        markers3D[id] = { line, lineGeo, lineMat };

        const type = data.type || "infantry_alive";
        const svgStr = (data.side === "friendly") ? symbolSVGFriendly(type) : symbolSVG(type);
        const tex = await svgToTex(svgStr);
        if (!markers3D[id]) { tex.dispose(); return; }

        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.renderOrder = 1;  // placed markers render above G/T markers
        sprite.position.set(mx, POLE + 24, mz);
        sprite.scale.set(42, 52, 1);
        scene.add(sprite);
        spriteToId.set(sprite, id);

        // ── CSS2D label (same floating boxes as 2D mode) ───────────────────
        const labelDiv = document.createElement("div");
        labelDiv.style.cssText = "position:relative;width:140px;height:140px;pointer-events:none;";
        const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        labelDiv.innerHTML =
            `<div class="ml ml-tl">${esc(data.date)}</div>` +
            `<div class="ml ml-tc">${esc(data.amount)}</div>` +
            `<div class="ml ml-tr">${esc(data.info)}</div>` +
            `<div class="ml ml-bl">${esc(data.author)}</div>` +
            `<div class="ml ml-br">${esc(data.source)}</div>`;
        const labelObj = new CSS2DObject(labelDiv);
        labelObj.position.set(mx, POLE + 24, mz);
        scene.add(labelObj);

        Object.assign(markers3D[id], { sprite, tex, spriteMat, labelObj, labelDiv });
    }

    function removeMarker3D(id) {
        const m = markers3D[id]; if (!m) return;
        scene.remove(m.line);   m.lineGeo?.dispose(); m.lineMat?.dispose();
        if (m.sprite) { spriteToId.delete(m.sprite); scene.remove(m.sprite); m.tex?.dispose(); m.spriteMat?.dispose(); }
        if (m.labelObj) { scene.remove(m.labelObj); m.labelDiv?.remove(); }
        delete markers3D[id];
    }

    // ── Raycast sprites → marker hit (returns markerId or null) ───────────────
    function hitSprite(clientX, clientY) {
        const r = canvas.getBoundingClientRect();
        _mouseNDC.set(
            ((clientX - r.left) / r.width)  *  2 - 1,
            -((clientY - r.top)  / r.height) *  2 + 1
        );
        raycaster.setFromCamera(_mouseNDC, camera);
        const sprites = [...spriteToId.keys()];
        if (!sprites.length) return null;
        const hits = raycaster.intersectObjects(sprites);
        if (!hits.length) return null;
        return spriteToId.get(hits[0].object) || null;
    }

    // ── 3D Drawings ────────────────────────────────────────────────────────────
    const strokes3D = {};   // firestoreId → { line, geo, mat }
    const DRAW_Y = 1.5;     // height above plane

    function _strokeVerts(data) {
        if (data.points?.length >= 2) {
            return data.points.map(p => { const { x, z } = l2t(p.lat, p.lng); return new THREE.Vector3(x, DRAW_Y, z); });
        }
        if (data.ll1 && data.ll2) {
            const a = l2t(data.ll1.lat, data.ll1.lng);
            const b = l2t(data.ll2.lat, data.ll2.lng);
            if (data.tool === "circle") {
                const cx = (a.x+b.x)/2, cz = (a.z+b.z)/2;
                const rx = Math.abs(b.x-a.x)/2, rz = Math.abs(b.z-a.z)/2;
                return Array.from({ length: 65 }, (_, i) => {
                    const t = (i / 64) * Math.PI * 2;
                    return new THREE.Vector3(cx + rx * Math.cos(t), DRAW_Y, cz + rz * Math.sin(t));
                });
            }
            if (data.tool === "rect" || data.tool === "zone") {
                return [
                    new THREE.Vector3(a.x, DRAW_Y, a.z), new THREE.Vector3(b.x, DRAW_Y, a.z),
                    new THREE.Vector3(b.x, DRAW_Y, b.z), new THREE.Vector3(a.x, DRAW_Y, b.z),
                    new THREE.Vector3(a.x, DRAW_Y, a.z)
                ];
            }
            return [new THREE.Vector3(a.x, DRAW_Y, a.z), new THREE.Vector3(b.x, DRAW_Y, b.z)];
        }
        return null;
    }

    function addStroke3D(id, data) {
        removeStroke3D(id);
        if (data.tool === "eraser") return;
        const color3 = new THREE.Color(data.color || "#ff4444");
        const objs = [];   // THREE.Object3D to add/remove from scene
        const disp = [];   // BufferGeometry / Material to dispose

        function addObj(o) { scene.add(o); objs.push(o); }

        if (data.tool === "arrow" && data.ll1 && data.ll2) {
            // ── Shaft ───────────────────────────────────────────────────────
            const a = l2t(data.ll1.lat, data.ll1.lng);
            const b = l2t(data.ll2.lat, data.ll2.lng);
            const shaftGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(a.x, DRAW_Y, a.z),
                new THREE.Vector3(b.x, DRAW_Y, b.z)
            ]);
            const shaftMat = new THREE.LineBasicMaterial({ color: color3, depthTest: false });
            const shaft    = new THREE.Line(shaftGeo, shaftMat);
            shaft.renderOrder = 1;
            addObj(shaft); disp.push(shaftGeo, shaftMat);

            // ── Arrowhead (filled triangle in XZ plane) ─────────────────────
            const angle   = Math.atan2(b.z - a.z, b.x - a.x);
            const headLen = 15;
            // Build shape in (scene_x, scene_z) as (shape.x, shape.y);
            // rotation.x = +π/2 maps shape (x,y) → world (x, 0, y)
            const shape = new THREE.Shape();
            shape.moveTo(b.x,  b.z);
            shape.lineTo(b.x - headLen * Math.cos(angle - Math.PI / 6),
                         b.z - headLen * Math.sin(angle - Math.PI / 6));
            shape.lineTo(b.x - headLen * Math.cos(angle + Math.PI / 6),
                         b.z - headLen * Math.sin(angle + Math.PI / 6));
            shape.closePath();
            const headGeo  = new THREE.ShapeGeometry(shape);
            const headMat  = new THREE.MeshBasicMaterial({ color: color3, side: THREE.DoubleSide, depthTest: false });
            const headMesh = new THREE.Mesh(headGeo, headMat);
            headMesh.rotation.x  = Math.PI / 2;  // XY shape → XZ plane
            headMesh.position.y  = DRAW_Y;
            headMesh.renderOrder = 1;
            addObj(headMesh); disp.push(headGeo, headMat);

        } else if (data.tool === "zone" && data.ll1 && data.ll2) {
            const a = l2t(data.ll1.lat, data.ll1.lng);
            const b = l2t(data.ll2.lat, data.ll2.lng);
            const xmin = Math.min(a.x, b.x), xmax = Math.max(a.x, b.x);
            const zmin = Math.min(a.z, b.z), zmax = Math.max(a.z, b.z);
            const cx   = (xmin + xmax) / 2, cz = (zmin + zmax) / 2;
            const pw   = xmax - xmin,       ph = zmax - zmin;

            // ── Semi-transparent fill ───────────────────────────────────────
            const fillGeo  = new THREE.PlaneGeometry(pw, ph);
            const fillMat  = new THREE.MeshBasicMaterial({
                color: color3, transparent: true, opacity: 0.18,
                side: THREE.DoubleSide, depthTest: false
            });
            const fillMesh = new THREE.Mesh(fillGeo, fillMat);
            fillMesh.rotation.x  = -Math.PI / 2;
            fillMesh.position.set(cx, DRAW_Y, cz);
            fillMesh.renderOrder = 1;
            addObj(fillMesh); disp.push(fillGeo, fillMat);

            // ── Dashed border ───────────────────────────────────────────────
            const borderVerts = [
                new THREE.Vector3(a.x, DRAW_Y, a.z), new THREE.Vector3(b.x, DRAW_Y, a.z),
                new THREE.Vector3(b.x, DRAW_Y, b.z), new THREE.Vector3(a.x, DRAW_Y, b.z),
                new THREE.Vector3(a.x, DRAW_Y, a.z)
            ];
            const borderGeo = new THREE.BufferGeometry().setFromPoints(borderVerts);
            const borderMat = new THREE.LineDashedMaterial({
                color: color3, dashSize: 6, gapSize: 4, depthTest: false
            });
            const border = new THREE.Line(borderGeo, borderMat);
            border.computeLineDistances();
            border.renderOrder = 1;
            addObj(border); disp.push(borderGeo, borderMat);

            // ── Zone name label (CSS2DObject) ───────────────────────────────
            if (data.zoneName) {
                const labelDiv = document.createElement("div");
                labelDiv.style.cssText =
                    "background:rgba(6,12,22,0.72);color:" + (data.color || "#ff4444") +
                    ";font:700 11px monospace;padding:2px 6px;border-radius:3px;" +
                    "pointer-events:none;white-space:nowrap;";
                labelDiv.textContent = data.zoneName;
                const labelObj = new CSS2DObject(labelDiv);
                labelObj.position.set(cx, DRAW_Y + 2, cz);
                addObj(labelObj);
            }

        } else {
            // ── Default: pen / line / rect / circle / label ─────────────────
            const verts = _strokeVerts(data);
            if (!verts || verts.length < 2) return;
            const g = new THREE.BufferGeometry().setFromPoints(verts);
            const m = new THREE.LineBasicMaterial({ color: color3, depthTest: false });
            const line = new THREE.Line(g, m);
            line.renderOrder = 1;
            addObj(line); disp.push(g, m);
        }

        strokes3D[id] = { objs, disp };
    }

    function removeStroke3D(id) {
        const s = strokes3D[id]; if (!s) return;
        // Support both old { line, g, m } and new { objs, disp } structures
        if (s.objs) { s.objs.forEach(o => scene.remove(o)); s.disp.forEach(d => d?.dispose()); }
        else { scene.remove(s.line); s.g?.dispose(); s.m?.dispose(); }
        delete strokes3D[id];
    }

    // ── Fly-to animation (for coordinate search) ─────────────────────────────
    function flyTo(lat, lng) {
        const { x, z } = l2t(lat, lng);
        const from = controls.target.clone();
        const to   = new THREE.Vector3(x, 0, z);
        const t0   = performance.now();
        const dur  = 600;
        (function step() {
            const t = Math.min((performance.now() - t0) / dur, 1);
            const e = t < .5 ? 2*t*t : -1 + (4 - 2*t)*t;
            controls.target.lerpVectors(from, to, e);
            controls.update();
            if (t < 1) requestAnimationFrame(step);
        })();
    }

    // ── Simple colored circle sprite (used for G/T arty markers) ──────────────
    async function addSimple(id, lat, lng, label, hexColor) {
        if (markers3D[id]) removeMarker3D(id);
        const { x: mx, z: mz } = l2t(lat, lng);

        // Pole line: ground to sprite
        const GT_POLE = 55;
        const poleGeo = new THREE.BufferGeometry();
        poleGeo.setAttribute("position", new THREE.BufferAttribute(
            new Float32Array([mx, 2, mz, mx, GT_POLE, mz]), 3));
        const poleMat = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.8, transparent: true });
        const poleObj = new THREE.Line(poleGeo, poleMat);
        scene.add(poleObj);

        const cv = document.createElement("canvas"); cv.width = 64; cv.height = 64;
        const tc = cv.getContext("2d");
        tc.beginPath(); tc.arc(32, 32, 28, 0, Math.PI * 2);
        tc.fillStyle = hexColor; tc.fill();
        tc.strokeStyle = "rgba(0,0,0,0.8)"; tc.lineWidth = 4; tc.stroke();
        tc.font = "bold 24px monospace"; tc.fillStyle = "#111";
        tc.textAlign = "center"; tc.textBaseline = "middle";
        tc.fillText(label, 32, 33);
        const tex = new THREE.CanvasTexture(cv);
        if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.renderOrder = 0;  // G/T render below placed markers
        sprite.position.set(mx, GT_POLE + 18, mz);
        sprite.scale.set(38, 38, 1);
        scene.add(sprite);
        // Store poleGeo/poleMat as lineGeo/lineMat so removeMarker3D disposes them
        markers3D[id] = { sprite, spriteMat, tex, line: poleObj, lineGeo: poleGeo, lineMat: poleMat };
    }

    // ── 3D Ruler ─────────────────────────────────────────────────────────────
    let _rulerLine3D   = null;
    let _rulerDots3D   = [];    // SphereGeometry meshes at each point
    let _rulerLabels3D = [];    // CSS2DObjects with distance text

    function _clearRuler3DObjects() {
        if (_rulerLine3D) { scene.remove(_rulerLine3D); _rulerLine3D.geometry.dispose(); _rulerLine3D.material.dispose(); _rulerLine3D = null; }
        _rulerDots3D.forEach(o => { scene.remove(o); o.geometry.dispose(); o.material.dispose(); });
        _rulerDots3D = [];
        _rulerLabels3D.forEach(o => scene.remove(o));
        _rulerLabels3D = [];
    }

    function update3DRuler() {
        _clearRuler3DObjects();
        if (rulerPoints.length < 1) return;

        // Convert all ruler points to 3D scene coords
        const pts3D = rulerPoints.map(pt => {
            const { x, z } = l2t(pt.lat, pt.lng);
            return { x, z, lat: pt.lat, lng: pt.lng };
        });

        // ── Solid yellow line (matches 2D style) ──────────────────────────
        if (pts3D.length >= 2) {
            const positions = [];
            pts3D.forEach(p => positions.push(p.x, DRAW_Y + 0.5, p.z));
            const geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            const mat = new THREE.LineBasicMaterial({
                color: 0xffcc00, transparent: true, opacity: 0.95, depthTest: false
            });
            _rulerLine3D = new THREE.Line(geo, mat);
            _rulerLine3D.renderOrder = 2;
            scene.add(_rulerLine3D);
        }

        // ── Dot + cumulative distance label at each point ─────────────────
        pts3D.forEach((p, i) => {
            // Yellow sphere dot (radius 3 — matches 2D circle radius ~4 px)
            const dotGeo = new THREE.SphereGeometry(3, 8, 8);
            const dotMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, depthTest: false });
            const dot    = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(p.x, DRAW_Y + 0.5, p.z);
            dot.renderOrder = 3;
            scene.add(dot);
            _rulerDots3D.push(dot);

            // Distance label — shown at every point except the first
            if (i > 0) {
                let totalM = 0;
                for (let ri = 1; ri <= i; ri++) {
                    const a = rulerPoints[ri - 1], b = rulerPoints[ri];
                    const rawPx = Math.hypot(b.lat - a.lat, b.lng - a.lng);
                    totalM += (rawPx / PIXELS_PER_METER_DYNAMIC) * DIST_CORRECTION;
                }
                const labelDiv = document.createElement("div");
                // Matches 2D style: dark bg, yellow text, monospace bold
                labelDiv.style.cssText =
                    "background:rgba(0,0,0,0.6);color:#ffcc00;" +
                    "font:bold 11px 'Share Tech Mono',monospace;" +
                    "padding:1px 5px;border-radius:2px;pointer-events:none;" +
                    "white-space:nowrap;margin-left:8px;margin-top:-16px;";
                labelDiv.textContent = formatDistance(totalM);
                const labelObj = new CSS2DObject(labelDiv);
                labelObj.position.set(p.x, DRAW_Y + 2, p.z);
                labelObj.renderOrder = 3;
                scene.add(labelObj);
                _rulerLabels3D.push(labelObj);
            }
        });
    }

    function clearRuler3D() { _clearRuler3DObjects(); }

    // ── Ballistic trajectory ──────────────────────────────────────────────────
    let _trajLine = null;
    let _trajAnimId = null;
    let _trajDot = null;

    function updateTrajectory(calc) {
        // Remove old trajectory
        if (_trajLine) { scene.remove(_trajLine); _trajLine.geometry.dispose(); _trajLine.material.dispose(); _trajLine = null; }
        if (_trajDot)  { scene.remove(_trajDot);  _trajDot.geometry.dispose();  _trajDot.material.dispose();  _trajDot  = null; }
        if (_trajAnimId) { cancelAnimationFrame(_trajAnimId); _trajAnimId = null; }

        if (!calc || calc.gLat == null || calc.tLat == null) return;

        const { distM, v, elevDeg, tof, gLat, gLng, tLat, tLng, heightM = 0 } = calc;
        const g = l2t(gLat, gLng);
        const tgt = l2t(tLat, tLng);

        // Build arc points using projectile kinematics
        const N = 80;
        const elevRad = elevDeg * Math.PI / 180;
        // Visual parabola: start and end at ground (Y=2), peak height proportional to elevation
        // distIn3D = horizontal distance in world units (pixels)
        const distIn3D = Math.hypot(tgt.x - g.x, tgt.z - g.z);
        // Visual max height: scales with elevation angle, capped for aesthetics
        const H_visual = Math.max(20, distIn3D * Math.tan(elevRad) * 0.35);
        const positions = [];

        for (let i = 0; i <= N; i++) {
            const progress = i / N;
            // Interpolate X/Z from gun to target along the ground
            const wx = g.x + (tgt.x - g.x) * progress;
            const wz = g.z + (tgt.z - g.z) * progress;
            // Parabolic height: 0 at start, peak at midpoint, 0 at end
            const wy = 2 + 4 * H_visual * progress * (1 - progress);
            positions.push(wx, wy, wz);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.75, depthTest: false });
        _trajLine = new THREE.Line(geo, mat);
        _trajLine.renderOrder = 2;
        scene.add(_trajLine);

        // Animated dot along arc
        const dotGeo = new THREE.SphereGeometry(4, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, depthTest: false });
        _trajDot = new THREE.Mesh(dotGeo, dotMat);
        _trajDot.renderOrder = 3;
        scene.add(_trajDot);

        let startTime = null;
        // Duration matches real time-of-flight: 1 real second = 1 simulated second
        const ANIM_DURATION = tof * 1000; // ms — accurate to calculated ToF

        function animStep(ts) {
            if (!startTime) startTime = ts;
            const elapsed = ts - startTime;
            const progress = (elapsed % ANIM_DURATION) / ANIM_DURATION;
            const idx = Math.min(Math.floor(progress * N), N) * 3;
            _trajDot.position.set(positions[idx], positions[idx + 1], positions[idx + 2]);
            _trajAnimId = requestAnimationFrame(animStep);
        }
        _trajAnimId = requestAnimationFrame(animStep);
    }

    // ── Expose ────────────────────────────────────────────────────────────────
    return {
        addMarker3D,
        removeMarker3D,
        addSimple,
        addStroke3D,
        removeStroke3D,
        flyTo,
        updateTrajectory,
        update3DRuler,
        clearRuler3D,
        /** Render one frame, draw onto oc at W×H, including projected marker labels */
        drawCapture(oc, W, H) {
            renderer.render(scene, camera);
            oc.drawImage(renderer.domElement, 0, 0, W, H);
            if (!withMarkers) return;
            oc.save();
            oc.font = "bold 9px 'Share Tech Mono',monospace";
            oc.textBaseline = "middle";
            Object.entries(markers3D).forEach(([id, m]) => {
                if (!m.sprite) return;
                const data = displayedMarkers[id]?.data;
                if (!data) return;
                const ndc = m.sprite.position.clone().project(camera);
                if (ndc.z > 1) return; // behind camera
                const sx = (ndc.x *  0.5 + 0.5) * W;
                const sy = (ndc.y * -0.5 + 0.5) * H;
                const rows = [
                    { t: data.date   || "",         x: sx - 23, y: sy - 24, a: "right"  },
                    { t: String(data.amount || ""), x: sx,      y: sy - 28, a: "center" },
                    { t: data.info   || "",         x: sx + 23, y: sy - 24, a: "left"   },
                    { t: data.author || "",         x: sx - 23, y: sy + 36, a: "right"  },
                    { t: data.source || "",         x: sx + 23, y: sy + 36, a: "left"   },
                ];
                rows.forEach(({ t, x, y, a }) => {
                    if (!t) return;
                    oc.textAlign = a;
                    const tw = oc.measureText(t).width;
                    const bx = a === "right" ? x - tw - 8 : a === "center" ? x - tw / 2 - 4 : x;
                    oc.fillStyle = "rgba(6,12,22,0.85)";
                    oc.fillRect(bx - 2, y - 8, tw + 12, 15);
                    oc.strokeStyle = "rgba(160,185,220,0.35)";
                    oc.lineWidth = 0.5;
                    oc.strokeRect(bx - 2, y - 8, tw + 12, 15);
                    oc.fillStyle = "#d8e4f0";
                    oc.fillText(t, x, y);
                });
            });
            oc.restore();
            // Paint watermark on top of the exported frame
            const userId = getCurrentUser()?.userId || null;
            if (userId) _paintWatermark(oc, W, H, userId, true);
        },
        clearAllMarkers3D() { Object.keys(markers3D).forEach(removeMarker3D); },
        clearAllStrokes3D() { Object.keys(strokes3D).forEach(removeStroke3D); },
        refreshWatermark() { draw3DWatermark(); },
        dispose() {
            Object.keys(markers3D).forEach(removeMarker3D);
            Object.keys(strokes3D).forEach(removeStroke3D);
            spriteToId.clear();
            _clearPreview3D();
            cancelAnimationFrame(animId);
            if (_trajAnimId) cancelAnimationFrame(_trajAnimId);
            if (_trajLine)   { scene.remove(_trajLine); _trajLine.geometry.dispose(); _trajLine.material.dispose(); }
            if (_trajDot)    { scene.remove(_trajDot);  _trajDot.geometry.dispose();  _trajDot.material.dispose();  }
            if (_rulerLine3D){ scene.remove(_rulerLine3D); _rulerLine3D.geometry.dispose(); _rulerLine3D.material.dispose(); }
            ro.disconnect();
            controls.dispose();
            texture.dispose(); mat.dispose(); geo.dispose();
            borderGeo.dispose(); borderMat.dispose();
            renderer.dispose();
            canvas.remove();
            labelRenderer.domElement.remove();
            wmCanvas.remove();
        }
    };
}

// ── Monitor map 2D/3D toggle (single button) ──────────────────────────────────
document.getElementById("mapDimToggle")?.addEventListener("click", async () => {
    const btn = document.getElementById("mapDimToggle");
    if (map3DState) {
        // Switch to 2D
        map3DState.dispose(); map3DState = null;
        btn.textContent = "3D";
        btn.title = "Switch to 3D view";
        btn.classList.remove("active");
        map.invalidateSize({ animate: false });
        resizeCanvas();
        drawWatermarkCanvas(getCurrentUser()?.userId || null);
    } else {
        // Switch to 3D
        btn.disabled = true; btn.textContent = "…";
        try {
            map3DState = await create3DScene(document.getElementById("mapWrapper"), { withMarkers: true });
            btn.textContent = "2D";
            btn.title = "Switch to 2D view";
            btn.classList.add("active");
            Object.entries(displayedMarkers).forEach(([id, { data }]) => map3DState.addMarker3D(id, data));
            strokes.forEach(s => { if (s.firestoreId) map3DState.addStroke3D(s.firestoreId, s); });
        } catch (e) {
            console.error("3D init error:", e);
            btn.textContent = "3D";
        }
        btn.disabled = false;
    }
});

// ── Arty calculator 2D/3D toggle (single button) ──────────────────────────────
document.getElementById("artyDimToggle")?.addEventListener("click", async () => {
    const btn = document.getElementById("artyDimToggle");
    if (arty3DState) {
        // Switch to 2D
        arty3DState.dispose(); arty3DState = null;
        btn.textContent = "3D";
        btn.title = "Switch to 3D view";
        btn.classList.remove("active");
        if (artyMapInstance) artyMapInstance.invalidateSize({ animate: false });
    } else {
        // Switch to 3D
        btn.disabled = true; btn.textContent = "…";
        try {
            arty3DState = await create3DScene(document.querySelector(".arty-map-wrap"), { withMarkers: true, isArty: true });
            // Sync existing displayedMarkers into arty 3D
            Object.entries(displayedMarkers).forEach(([id, { data }]) => arty3DState.addMarker3D(id, data));
            // Sync existing strokes/drawings
            strokes.forEach(s => { if (s.firestoreId) arty3DState.addStroke3D(s.firestoreId, s); });
            // Sync G/T positions if already placed
            if (artyGunPx) arty3DState.addSimple("_gun", artyGunPx.lat, artyGunPx.lng, "G", "#4ade80");
            if (artyTgtPx) arty3DState.addSimple("_tgt", artyTgtPx.lat, artyTgtPx.lng, "T", "#f87171");
            if (lastArtyCalc) arty3DState.updateTrajectory(lastArtyCalc);
            btn.textContent = "2D";
            btn.title = "Switch to 2D view";
            btn.classList.add("active");
        } catch (e) {
            console.error("3D arty init error:", e);
            btn.textContent = "3D";
        }
        btn.disabled = false;
    }
});

// Clean up 3D scenes when navigating away
function cleanup3D() {
    if (map3DState) {
        map3DState.dispose(); map3DState = null;
        const b = document.getElementById("mapDimToggle");
        if (b) { b.textContent = "3D"; b.title = "Switch to 3D view"; b.classList.remove("active"); }
        map.invalidateSize({ animate: false }); resizeCanvas();
    }
    if (arty3DState) {
        arty3DState.dispose(); arty3DState = null;
        const b = document.getElementById("artyDimToggle");
        if (b) { b.textContent = "3D"; b.title = "Switch to 3D view"; b.classList.remove("active"); }
        if (artyMapInstance) artyMapInstance.invalidateSize({ animate: false });
    }
}

// ─── MAP EXPORT (PNG) ─────────────────────────────────────────────────────────
document.getElementById("exportBtn")?.addEventListener("click", async () => {
    const now = new Date();
    const ts  = `DELTA MONITOR  ${now.toISOString().slice(0,16).replace("T"," ")} UTC`;
    const fname = `delta_monitor_${now.toISOString().slice(0,19).replace(/:/g,"-")}.png`;
    const exportUserId = getCurrentUser()?.userId || null;

    function finishExport(out) {
        const oc = out.getContext("2d");
        const W = out.width, H = out.height;
        if (exportUserId) _paintWatermark(oc, W, H, exportUserId, true);
        oc.font = "bold 11px 'Share Tech Mono', monospace";
        oc.fillStyle = "rgba(90,150,220,0.9)";
        oc.shadowColor = "rgba(0,0,0,0.8)"; oc.shadowBlur = 3;
        oc.fillText(ts, 10, H - 10);
        oc.shadowBlur = 0;
        const link = document.createElement("a");
        link.download = fname; link.href = out.toDataURL("image/png"); link.click();
    }

    if (map3DState) {
        // ── 3D export: WebGL frame + projected marker labels ─────────────────
        const wrapper = document.getElementById("mapWrapper");
        const W = wrapper.clientWidth || 800, H = wrapper.clientHeight || 600;
        const out = document.createElement("canvas");
        out.width = W; out.height = H;
        map3DState.drawCapture(out.getContext("2d"), W, H);
        finishExport(out);
        return;
    }

    // ── 2D export: map.png + drawings + marker icons ──────────────────────────
    const mapEl = document.getElementById("map");
    const W = mapEl.clientWidth || 800, H = mapEl.clientHeight || 600;
    const out = document.createElement("canvas");
    out.width = W; out.height = H;
    const oc = out.getContext("2d");

    // 1. Draw base map
    await new Promise(res => {
        const baseImg = new Image();
        baseImg.crossOrigin = "anonymous";
        baseImg.onload = () => {
            try {
                const tl = map.latLngToContainerPoint([imageHeight, 0]);
                const br = map.latLngToContainerPoint([0, imageWidth]);
                oc.drawImage(baseImg, tl.x, tl.y, br.x - tl.x, br.y - tl.y);
            } catch (_) { oc.drawImage(baseImg, 0, 0, W, H); }
            res();
        };
        baseImg.onerror = () => res();
        baseImg.src = MAPS[currentMapIdx].file;
    });

    // 2. Draw strokes overlay
    const drawCanvas = document.getElementById("drawCanvas");
    if (drawCanvas) oc.drawImage(drawCanvas, 0, 0);

    // 3. Draw each marker SVG at its map screen position + data labels
    //    iconAnchor=[70,67] − mkr-icon offset=[47,44] → net offset [23,23]
    await Promise.all(Object.entries(displayedMarkers).map(([, { marker, data }]) =>
        new Promise(res => {
            const pt  = map.latLngToContainerPoint(marker.getLatLng());
            const sx = pt.x, sy = pt.y;
            const svg = data.side === "friendly"
                ? symbolSVGFriendly(data.type || "infantry_alive")
                : symbolSVG(data.type || "infantry_alive");
            // Use data: URL instead of blob URL — avoids cross-origin canvas taint issues
            const img = new Image(46, 57);
            img.onload  = () => {
                oc.drawImage(img, sx - 23, sy - 23, 46, 57);

                // Draw marker label boxes (mirrors CSS .ml layout)
                const labels = [
                    { text: data.date,   x: sx - 25, y: sy - 30, align: "right"  },
                    { text: data.amount, x: sx,       y: sy - 34, align: "center" },
                    { text: data.info,   x: sx + 25,  y: sy - 30, align: "left"   },
                    { text: data.author, x: sx - 25,  y: sy + 40, align: "right"  },
                    { text: data.source, x: sx + 25,  y: sy + 40, align: "left"   },
                ];
                oc.save();
                oc.font = "bold 9px monospace";
                labels.forEach(({ text, x, y, align }) => {
                    if (!text) return;
                    const str = String(text);
                    oc.textAlign = align;
                    oc.textBaseline = "middle";
                    const metrics = oc.measureText(str);
                    const tw = metrics.width + 6;
                    const th = 12;
                    const bx = align === "right" ? x - tw : align === "center" ? x - tw / 2 : x;
                    oc.fillStyle = "rgba(12,15,20,0.82)";
                    oc.fillRect(bx, y - th / 2, tw, th);
                    oc.strokeStyle = "rgba(150,180,220,0.35)";
                    oc.lineWidth = 0.5;
                    oc.strokeRect(bx, y - th / 2, tw, th);
                    oc.fillStyle = "#c8d8ee";
                    oc.fillText(str, x, y);
                });
                oc.restore();
                res();
            };
            img.onerror = () => res();
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
        })
    ));

    // 4. Draw ruler if active
    if (rulerMode && rulerPoints.length >= 2) {
        oc.save();
        oc.strokeStyle = "#22d3ee";
        oc.lineWidth = 2;
        oc.setLineDash([6, 4]);
        oc.beginPath();
        rulerPoints.forEach((ll, i) => {
            const pt = map.latLngToContainerPoint(ll);
            i === 0 ? oc.moveTo(pt.x, pt.y) : oc.lineTo(pt.x, pt.y);
            // Circle at each point
            oc.save();
            oc.beginPath(); oc.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            oc.fillStyle = "#22d3ee"; oc.fill(); oc.restore();
        });
        oc.stroke();
        // Distance label at midpoint between last two points
        const last = rulerPoints[rulerPoints.length - 1];
        const prev = rulerPoints[rulerPoints.length - 2];
        const distPx = Math.hypot(last.lat - prev.lat, last.lng - prev.lng);
        const distM  = pixelsToMeters(distPx);
        const settings = JSON.parse(localStorage.getItem("deltaSettings") || "{}");
        const distStr  = settings.rulerUnits === "km" ? (distM / 1000).toFixed(2) + " km" : Math.round(distM) + " m";
        const lpt = map.latLngToContainerPoint(last);
        const ppt = map.latLngToContainerPoint(prev);
        const mx  = (lpt.x + ppt.x) / 2, my = (lpt.y + ppt.y) / 2;
        oc.setLineDash([]);
        oc.font = "bold 10px monospace";
        const tw = oc.measureText(distStr).width + 8;
        oc.fillStyle = "rgba(12,15,20,0.82)";
        oc.fillRect(mx - tw / 2, my - 9, tw, 16);
        oc.fillStyle = "#22d3ee";
        oc.textAlign = "center"; oc.textBaseline = "middle";
        oc.fillText(distStr, mx, my);
        oc.restore();
    }

    finishExport(out);
});
function mapDistancePixels(ll1, ll2) {
    const p1 = map.latLngToContainerPoint(ll1);
    const p2 = map.latLngToContainerPoint(ll2);
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
function pixelsToMeters(pixelDist) {
    const zoom  = map.getZoom();
    const scale = Math.pow(2, zoom);
    const pxAt0 = pixelDist / scale;
    return (pxAt0 / PIXELS_PER_METER_DYNAMIC) * DIST_CORRECTION;
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
        saveUserState();
    }
    // FIX #4: tell Leaflet the map container changed size so all coordinate
    // transforms (latLngToContainerPoint etc.) recalculate correctly.
    setTimeout(() => {
        map.invalidateSize({ animate: false });
        resizeCanvas();
        redrawAll();
    }, 260);
});
// ─── MOBILE SWIPE TO OPEN LEFT PANEL ─────────────────────────────────────────
{
    let swipeStartX = 0, swipeStartY = 0;
    const SWIPE_THRESHOLD = 50;   // px to the right = open
    const CLOSE_THRESHOLD = 40;   // px to the left  = close

    document.addEventListener("touchstart", e => {
        if (!isMobileLayout()) return;
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener("touchend", e => {
        if (!isMobileLayout()) return;
        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = e.changedTouches[0].clientY - swipeStartY;
        if (Math.abs(dy) > Math.abs(dx)) return;  // vertical swipe — ignore
        const isOpen = leftPanel.classList.contains("mobile-open");
        // Swipe right from left edge → open
        if (dx > SWIPE_THRESHOLD && swipeStartX < 60 && !isOpen) {
            leftPanel.classList.add("mobile-open");
            setTimeout(() => { map.invalidateSize({ animate: false }); }, 260);
        }
        // Swipe left anywhere when panel is open → close
        if (dx < -CLOSE_THRESHOLD && isOpen) {
            leftPanel.classList.remove("mobile-open");
            setTimeout(() => { map.invalidateSize({ animate: false }); }, 260);
        }
    }, { passive: true });
}
// ─── MOBILE LONG-TAP TO PLACE MARKER ─────────────────────────────────────────
{
    let longTapTimer   = null;
    let longTapMoved   = false;
    const LONG_TAP_MS  = 600;

    // Prevent native "select all" on long-press via CSS in JS
    document.body.style.webkitUserSelect = "none";
    document.body.style.userSelect       = "none";

    const mapEl = document.getElementById("map");
    mapEl.addEventListener("touchstart", e => {
        if (drawMode || rulerMode) return;
        if (e.touches.length !== 1) return;
        longTapMoved = false;
        const touch = e.touches[0];
        longTapTimer = setTimeout(async () => {
            if (longTapMoved) return;
            // Convert touch position to Leaflet latlng
            const rect = mapEl.getBoundingClientRect();
            const pt   = map.containerPointToLatLng(
                L.point(touch.clientX - rect.left, touch.clientY - rect.top)
            );
            if (pt.lng < 0 || pt.lng > imageWidth || pt.lat < 0 || pt.lat > imageHeight) return;
            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(30);
            const now    = new Date(Date.now() + 2 * 3600 * 1000);
            const pad    = n => String(n).padStart(2, "0");
            const dateStr = `${pad(now.getUTCDate())}/${pad(now.getUTCMonth()+1)}/${String(now.getUTCFullYear()).slice(-2)} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
            const newRef = doc(markersCollection);
            await setDoc(newRef, {
                x: pt.lng, y: pt.lat,
                type: selectedSymbol, side: placingSide,
                mapId: MAPS[currentMapIdx].id,
                created: Date.now(), date: dateStr,
                amount: "", info: "", source: "",
                author: getCallsign()
            });
            undoStack.push({ type: "marker", id: newRef.id });
        }, LONG_TAP_MS);
    }, { passive: true });

    mapEl.addEventListener("touchmove",  () => { longTapMoved = true; clearTimeout(longTapTimer); }, { passive: true });
    mapEl.addEventListener("touchend",   () => clearTimeout(longTapTimer), { passive: true });
    mapEl.addEventListener("touchcancel",() => clearTimeout(longTapTimer), { passive: true });
}
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
const vezha_sessions  = collection(db, "vezha_sessions");
const vezha_signals   = collection(db, "vezha_signals");
const vezha_chat      = collection(db, "vezha_chat");
const vezha_rooms_col = collection(db, "vezha_rooms");
let roomsData     = {};   // roomId → { id, name, order }
let sessionsCache = {};   // userId → { callsign, role, room, docId, userId }
let myCurrentRoom  = null; // own current room ID
let currentChannel = "general"; // active chat channel: "general" | "room_1" … "room_10"
const channelDrafts = {}; // draft text per channel, preserved across switches
const chatMsgCache  = []; // local cache of all received chat messages { id, data }

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

// ─── USER ID GENERATION ────────────────────────────────────────────────────────
function generateUserId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

// ─── USER STATE PERSISTENCE (per account, stored in localStorage) ──────────────
function saveUserState() {
    const user = getCurrentUser();
    if (!user) return;
    const state = {
        theme:               document.body.classList.contains("light-theme") ? "light" : "dark",
        leftPanelCollapsed:  document.getElementById("leftPanel")?.classList.contains("collapsed") || false,
        monitorChatCollapsed:document.getElementById("monitorChat")?.classList.contains("collapsed") || false,
    };
    localStorage.setItem(`deltaState_${user.username}`, JSON.stringify(state));
}

function restoreUserState(username) {
    try {
        const raw = localStorage.getItem(`deltaState_${username}`);
        if (!raw) return;
        const state = JSON.parse(raw);
        // Theme
        if (state.theme === "light" && !isLightTheme) {
            isLightTheme = true;
            document.body.classList.add("light-theme");
            document.getElementById("themeToggleBtn")?.classList.add("active");
            const logoImg = document.querySelector(".brand-shield img");
            if (logoImg) logoImg.src = "logo_light.png";
            const themeIcon = document.getElementById("themeIcon");
            if (themeIcon) themeIcon.innerHTML = `<path d="M13 9a5 5 0 1 1-5.93-4.93A7 7 0 0 0 13 9z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        // Left panel
        if (state.leftPanelCollapsed) {
            const lp = document.getElementById("leftPanel");
            const cb = document.getElementById("collapseLeftBtn");
            if (lp) { lp.classList.add("collapsed"); panelCollapsed = true; }
            if (cb) cb.classList.add("flipped");
            setTimeout(() => { map.invalidateSize({ animate: false }); resizeCanvas(); redrawAll(); }, 50);
        }
        // Monitor chat — intentionally NOT restoring collapsed state: always open on load
    } catch (_) {}
}

// ─── WATERMARK ─────────────────────────────────────────────────────────────────
// Core watermark painter — called once dimensions are known.
// skipClear: pass true when painting ON TOP of existing content (e.g. export canvas).
function _paintWatermark(ctx, W, H, userId, skipClear = false) {
    if (!skipClear) ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.11;   // 11% — clearly visible, not distracting
    ctx.fillStyle   = document.body.classList.contains("light-theme") ? "#1a2050" : "#9ab4ff";
    ctx.font        = "bold 14px 'Share Tech Mono', monospace";
    ctx.textBaseline = "middle";
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-30 * Math.PI / 180);
    // ~6 IDs per row: colStep = W/6 clamped to sensible range
    const colStep = 190, rowStep = 60;
    const span = Math.max(W, H) * 1.8;
    const cols = Math.ceil(span / colStep) + 2;
    const rows = Math.ceil(span / rowStep) + 2;
    for (let r = -rows; r <= rows; r++) {
        for (let c = -cols; c <= cols; c++) {
            ctx.fillText(userId, c * colStep + (r % 2 === 0 ? 0 : colStep / 2), r * rowStep);
        }
    }
    ctx.restore();
}

function drawWatermarkCanvas(userId) {
    // Also refresh 3D watermarks if active
    map3DState?.refreshWatermark();
    arty3DState?.refreshWatermark();
    const canvas = document.getElementById("watermarkCanvas");
    if (!canvas) return;
    const draw = () => {
        // getBoundingClientRect forces a layout flush — always returns real pixels
        const rect = canvas.getBoundingClientRect();
        const W = rect.width  || canvas.parentElement?.getBoundingClientRect().width  || 800;
        const H = rect.height || canvas.parentElement?.getBoundingClientRect().height || 600;
        canvas.width  = W;
        canvas.height = H;
        if (!userId) return;
        _paintWatermark(canvas.getContext("2d"), W, H, userId);
    };
    // Defer one frame so the flex layout has resolved before we measure
    requestAnimationFrame(draw);
    // Always refresh arty canvas too — drawArtyWatermark is a no-op if not visible
    drawArtyWatermark(userId);
}

function drawArtyWatermark(userId) {
    const canvas = document.getElementById("artyWatermarkCanvas");
    if (!canvas) return;
    const draw = () => {
        const rect = canvas.getBoundingClientRect();
        const W = rect.width  || canvas.parentElement?.getBoundingClientRect().width  || 800;
        const H = rect.height || canvas.parentElement?.getBoundingClientRect().height || 600;
        canvas.width  = W;
        canvas.height = H;
        if (!userId) return;
        _paintWatermark(canvas.getContext("2d"), W, H, userId);
    };
    requestAnimationFrame(draw);
}

function drawTileWatermark(canvas, userId) {
    if (!canvas || !userId) return;
    const draw = () => {
        const rect = canvas.getBoundingClientRect();
        const W = canvas.width  = rect.width  || canvas.parentElement?.clientWidth  || 640;
        const H = canvas.height = rect.height || canvas.parentElement?.clientHeight || 360;
        _paintWatermark(canvas.getContext("2d"), W, H, userId);
    };
    requestAnimationFrame(draw);
}

// Redraw watermark on map resize
map.on("resize", () => { drawWatermarkCanvas(getCurrentUser()?.userId || null); });

// ─── PRESENCE ──────────────────────────────────────────────────────────────────
const presenceCollection = collection(db, "presence");
let presenceInterval = null;

async function updatePresence() {
    const user = getCurrentUser();
    if (!user) return;
    try {
        await setDoc(doc(db, "presence", user.username), {
            username: user.username,
            role:     user.role,
            userId:   user.userId || "",
            lastSeen: Date.now()
        });
    } catch (_) {}
}

async function clearPresence() {
    const user = getCurrentUser();
    if (!user) return;
    try { await deleteDoc(doc(db, "presence", user.username)); } catch (_) {}
}

// ─── AUTH SCREEN HELPERS ────────────────────────────────────────────────────────
function showAuthScreen() {
    const el = document.getElementById("authScreen");
    if (el) el.style.display = "flex";
    showAuthPanel("login");
}
function hideAuthScreen() {
    const el = document.getElementById("authScreen");
    if (el) el.style.display = "none";
}
function showAuthPanel(panel) {
    document.getElementById("authLoginPanel").style.display   = panel === "login"   ? "flex" : "none";
    document.getElementById("authRegPanel").style.display     = panel === "register" ? "flex" : "none";
    document.getElementById("authPendingPanel").style.display = panel === "pending"  ? "flex" : "none";
    document.getElementById("authTabLogin").classList.toggle("active",    panel === "login");
    document.getElementById("authTabRegister").classList.toggle("active", panel === "register");
}

// ─── ADMIN PANEL LOGIC ─────────────────────────────────────────────────────────
let adminUnsubs = [];

function stopAdminListeners() {
    adminUnsubs.forEach(u => u());
    adminUnsubs = [];
}

function startAdminListeners() {
    stopAdminListeners();
    const accountsCol = collection(db, "accounts");
    const presenceCol = collection(db, "presence");

    // Track online users
    let onlineUsers = new Set();

    const unsubPresence = onSnapshot(presenceCol, snap => {
        const now = Date.now();
        onlineUsers = new Set(
            snap.docs
                .filter(d => (now - (d.data().lastSeen || 0)) < 90000)
                .map(d => d.id)
        );
        renderAccountsList();
    });

    // All accounts
    let allAccounts = [];
    const unsubAccounts = onSnapshot(accountsCol, snap => {
        allAccounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderPendingList();
        renderAccountsList();
    });

    function renderPendingList() {
        const el = document.getElementById("adminPendingList");
        if (!el) return;
        const pending = allAccounts.filter(a => a.status === "pending");
        if (pending.length === 0) {
            el.innerHTML = `<span class="admin-empty">No pending requests</span>`;
            return;
        }
        el.innerHTML = "";
        pending.forEach(acct => {
            const row = document.createElement("div");
            row.className = "admin-row";
            row.innerHTML = `
              <span class="admin-row-name">${escHtml(acct.username)}</span>
              <span class="admin-row-role">${escHtml((acct.role||"operator").toUpperCase())}</span>
              <button class="admin-btn admin-btn-approve" data-id="${escHtml(acct.username)}">✓ APPROVE</button>
              <button class="admin-btn admin-btn-deny"    data-id="${escHtml(acct.username)}">✕ DENY</button>`;
            row.querySelector(".admin-btn-approve").addEventListener("click", async () => {
                await updateDoc(doc(db, "accounts", acct.username), { status: "approved" });
            });
            row.querySelector(".admin-btn-deny").addEventListener("click", async () => {
                if (confirm(`Deny and delete account "${acct.username}"?`)) {
                    await deleteDoc(doc(db, "accounts", acct.username));
                }
            });
            el.appendChild(row);
        });
    }

    const CHANGEABLE_ROLES = ["operator","commander","drone","crewman","intel"];
    function renderAccountsList() {
        const el = document.getElementById("adminAccountsList");
        if (!el) return;
        const approved = allAccounts.filter(a => a.status !== "pending");
        el.innerHTML = "";
        approved.sort((a, b) => a.username.localeCompare(b.username)).forEach(acct => {
            const online    = onlineUsers.has(acct.username);
            const isOwner   = acct.role === "owner" || acct.username === OWNER_CALLSIGN;
            const roleLabel = isOwner ? "ADMIN" : (acct.role || "operator").toUpperCase();
            const row = document.createElement("div");
            row.className = "admin-row";
            if (isOwner) {
                row.innerHTML = `
                  <span class="presence-dot ${online ? "online" : "offline"}"></span>
                  <span class="admin-row-name">${escHtml(acct.username)}</span>
                  <span class="admin-row-role">${roleLabel}</span>`;
            } else {
                const opts = CHANGEABLE_ROLES.map(r =>
                    `<option value="${r}" ${acct.role===r?"selected":""}>${r.toUpperCase()}</option>`
                ).join("");
                const callsign = acct.callsign || acct.username;
                row.innerHTML = `
                  <span class="presence-dot ${online ? "online" : "offline"}"></span>
                  <span class="admin-row-name">${escHtml(acct.username)}</span>
                  <span class="admin-row-callsign" title="Callsign / nickname">${escHtml(callsign)}</span>
                  <select class="admin-role-select" data-user="${escHtml(acct.username)}">${opts}</select>
                  <button class="admin-btn admin-btn-neutral admin-btn-rename" title="Rename callsign">✎</button>
                  <button class="admin-btn admin-btn-deny admin-btn-kick"
                          data-id="${escHtml(acct.username)}">KICK</button>`;
                row.querySelector(".admin-role-select").addEventListener("change", async (e) => {
                    await updateDoc(doc(db, "accounts", acct.username), { role: e.target.value });
                });
                row.querySelector(".admin-btn-rename").addEventListener("click", async () => {
                    const cur = acct.callsign || acct.username;
                    const next = window.prompt(`Rename callsign for "${acct.username}":`, cur);
                    if (!next || next.trim() === "" || next.trim() === cur) return;
                    const trimmed = next.trim();
                    await updateDoc(doc(db, "accounts", acct.username), { callsign: trimmed });
                });
                row.querySelector(".admin-btn-kick").addEventListener("click", async () => {
                    if (confirm(`Kick "${acct.username}"? This deletes their account.`)) {
                        await deleteDoc(doc(db, "accounts", acct.username));
                    }
                });
            }
            el.appendChild(row);
        });
    }

    // ── DB usage counter ─────────────────────────────────────────────────────
    async function refreshDbUsage() {
        const el = document.getElementById("adminDbUsage");
        if (!el) return;
        el.textContent = "Counting…";
        try {
            // Count documents across main collections
            const [markersSnap, drawingsSnap, accountsSnap, chatSnap] = await Promise.all([
                getDocs(collection(db, "markers")),
                getDocs(collection(db, "drawings")),
                getDocs(collection(db, "accounts")),
                getDocs(collection(db, "chat")).catch(() => ({ size: 0, docs: [] })),
            ]);
            const counts = {
                markers:  markersSnap.size,
                drawings: drawingsSnap.size,
                accounts: accountsSnap.size,
                chat:     chatSnap.size,
            };
            const total = Object.values(counts).reduce((s, v) => s + v, 0);
            // Firestore Spark free tier: 1 GiB stored, 50k reads/day, 20k writes/day
            // We can only estimate by doc count (no byte API in client SDK)
            // Rough heuristic: ~1 KB per doc average
            const estKB   = total * 1;
            const limitKB = 1024 * 1024; // 1 GiB in KB
            const pct     = Math.min(100, (estKB / limitKB * 100)).toFixed(2);
            el.innerHTML =
                `<span class="db-usage-row"><b>DOCUMENTS</b> — ${total.toLocaleString()} total</span>` +
                `<span class="db-usage-row">markers: ${counts.markers} &nbsp;|&nbsp; drawings: ${counts.drawings} &nbsp;|&nbsp; accounts: ${counts.accounts} &nbsp;|&nbsp; chat: ${counts.chat}</span>` +
                `<span class="db-usage-row"><b>EST. SIZE</b> ~${estKB < 1024 ? estKB + " KB" : (estKB/1024).toFixed(1) + " MB"} / 1 GiB &nbsp;(${pct}% of Spark limit)</span>` +
                `<span class="db-usage-bar-wrap"><span class="db-usage-bar" style="width:${pct}%"></span></span>` +
                `<span class="db-usage-note">* Spark plan: 1 GiB storage · 50k reads/day · 20k writes/day · 1k daily free deletes</span>`;
        } catch (err) {
            el.textContent = "Error: " + err.message;
        }
    }
    document.getElementById("adminDbRefreshBtn")?.addEventListener("click", refreshDbUsage);
    refreshDbUsage();

    function renderDebugPanel() {
        const el = document.getElementById("debugPanelContent");
        if (!el) return;
        const u = getCurrentUser();
        const lines = [
            `── USER ──────────────────────────`,
            `Username : ${u?.username || "—"}`,
            `Role     : ${u?.role || "—"}`,
            `Callsign : ${u?.callsign || "—"}`,
            `UserId   : ${u?.userId || "—"}`,
            `── APP STATE ─────────────────────`,
            `Markers  : ${Object.keys(displayedMarkers).length}`,
            `Strokes  : ${strokes.length}`,
            `3D active: ${!!map3DState}`,
            `Arty 3D  : ${!!arty3DState}`,
            `Vezha    : ${typeof vezhaActive !== "undefined" ? vezhaActive : "—"}`,
            `── FIREBASE ──────────────────────`,
            `Accounts : ${allAccounts.length}`,
            `Online   : ${onlineUsers.size}`,
            `── RUNTIME ───────────────────────`,
            `UA       : ${navigator.userAgent.slice(0,60)}`,
            `Time     : ${new Date().toISOString()}`,
        ];
        el.textContent = lines.join("\n");
    }

    adminUnsubs.push(unsubPresence, unsubAccounts);

    // Debug panel refresh
    document.getElementById("debugRefreshBtn")?.addEventListener("click", renderDebugPanel);
    document.getElementById("debugCopyBtn")?.addEventListener("click", () => {
        const txt = document.getElementById("debugPanelContent")?.textContent || "";
        navigator.clipboard?.writeText(txt).catch(() => {});
    });
    renderDebugPanel();
}

// ─── ACCOUNT MODAL — AUTH (Firestore-backed, cross-device) ───────────────────
// Accounts live in Firestore "accounts/{USERNAME}" so any device can log in.
// Current session is cached in localStorage for instant page-load restore.

let _unsubKickWatcher = null;
function _watchAccountKick(username) {
    if (_unsubKickWatcher) { _unsubKickWatcher(); _unsubKickWatcher = null; }
    if (!username || username === OWNER_CALLSIGN) return; // owner can't be kicked
    _unsubKickWatcher = onSnapshot(doc(db, "accounts", username), snap => {
        if (!snap.exists()) {
            // Account was deleted — force logout
            alert("Your account has been removed by an administrator.");
            applyCurrentUser(null);
        }
    });
}

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem("deltaCurrentUser") || "null"); } catch { return null; }
}
// Legacy hash (base64) — only kept to migrate old accounts on first login
function _legacyHash(pw) { return btoa(encodeURIComponent(pw)); }

// Real SHA-256 via Web Crypto API → hex string
async function hashPass(pw) {
    const enc  = new TextEncoder();
    const buf  = await crypto.subtle.digest("SHA-256", enc.encode(pw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function applyCurrentUser(user) {
    if (user) {
        localStorage.setItem("deltaCurrentUser", JSON.stringify(user));
        const callsign = user.callsign || user.username;
        localStorage.setItem("vezhaCallsign", callsign);
        localStorage.setItem("vezhaRole", user.role);
        const callEl = document.getElementById("callsignInput");
        if (callEl) callEl.value = callsign;
        const roleEl = document.getElementById("roleSelect");
        if (roleEl) roleEl.value = user.role;
        enforceOwnerRole();  // lock/unlock owner role dropdown
        // Restore UI state saved for this account
        restoreUserState(user.username);
        // Draw the ID watermark on the map
        drawWatermarkCanvas(user.userId || null);
        // Start presence heartbeat
        updatePresence();
        if (presenceInterval) clearInterval(presenceInterval);
        presenceInterval = setInterval(updatePresence, 30000);
        // Start admin listeners if admin
        if (user.role === "owner") startAdminListeners();
        // Watch for account deletion (kick) — auto-logout immediately
        _watchAccountKick(user.username);
        hideAuthScreen();
        setTimeout(maybeShowTutorial, 600); // slight delay so UI settles first
    } else {
        // Logout: clear presence, stop heartbeat, stop admin listeners
        clearPresence();
        if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
        stopAdminListeners();
        localStorage.removeItem("deltaCurrentUser");
        drawWatermarkCanvas(null);
        showAuthScreen();
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
        const roleLabel = user.role === "owner" ? "ADMIN" : (user.role || "OPERATOR").toUpperCase();
        const roleEl = document.getElementById("loggedInRole");
        if (roleEl) roleEl.textContent = roleLabel;
        const prev = document.getElementById("accountRolePreview");
        if (prev) prev.style.background = ROLE_COLORS[user.role] || ROLE_COLORS.operator;
        const idEl = document.getElementById("loggedInId");
        if (idEl) idEl.textContent = user.userId || "——";
        // Pre-fill settings callsign field
        const csInp = document.getElementById("settingsCallsign");
        if (csInp) csInp.value = user.callsign || user.username;
        // Show/hide admin panel
        const adminWrap = document.getElementById("adminPanelWrap");
        if (adminWrap) adminWrap.style.display = user.role === "owner" ? "block" : "none";
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

// Shared login logic (used by modal loginBtn AND auth screen authLoginBtn)
async function doLogin(username, pw, errEl, busyBtnId) {
    errEl.textContent = "";
    if (!username || !pw) { errEl.textContent = t("errFillAll"); return; }
    setAuthBusy(busyBtnId, true);
    try {
        const snap = await getDoc(doc(db, "accounts", username));
        if (!snap.exists()) { errEl.textContent = t("errBadCreds"); setAuthBusy(busyBtnId, false); return; }
        const storedHash = snap.data().passHash;
        const sha256hash  = await hashPass(pw);
        const legacyHash  = _legacyHash(pw);
        const hashMatch   = (storedHash === sha256hash) || (storedHash === legacyHash);
        if (!hashMatch) { errEl.textContent = t("errBadCreds"); setAuthBusy(busyBtnId, false); return; }
        // Auto-upgrade legacy hash to SHA-256 on successful login
        if (storedHash === legacyHash) {
            try { await updateDoc(doc(db, "accounts", username), { passHash: sha256hash }); } catch (_) {}
        }
        const acct = snap.data();
        // PLAYFRA bypass: always allowed regardless of status field
        if (username !== OWNER_CALLSIGN && acct.status === "pending") {
            errEl.textContent = "Your account is awaiting admin approval.";
            setAuthBusy(busyBtnId, false);
            return;
        }
        const resolvedRole   = (username === OWNER_CALLSIGN) ? "owner" : acct.role;
        // Ensure the account has a userId; generate and save if missing.
        // The updateDoc is best-effort — if rules block it (e.g. read-only accounts
        // collection) we still log the user in with a locally-generated ID.
        let userId = acct.userId;
        if (!userId) {
            userId = generateUserId();
            try { await updateDoc(doc(db, "accounts", username), { userId }); } catch (_) {}
        }
        applyCurrentUser({
            username, role: resolvedRole,
            callsign: acct.callsign || username,
            userId
        });
    } catch (e) {
        console.error("Login error:", e);
        errEl.textContent = t("errNetwork");
    }
    setAuthBusy(busyBtnId, false);
}

// Shared register logic (used by modal registerBtn AND auth screen authRegBtn)
async function doRegister(username, pw, confirm, role, errEl, busyBtnId, onPending) {
    errEl.textContent = "";
    if (!username || !pw || !confirm) { errEl.textContent = t("errFillAll"); return; }
    if (!/^[A-Z0-9_]+$/.test(username)) {
        errEl.textContent = "USERNAME MAY ONLY CONTAIN LATIN LETTERS, DIGITS AND UNDERSCORES."; return;
    }
    if (pw.length < 8)        { errEl.textContent = t("errPassLen"); return; }
    if (!/[0-9]/.test(pw))    { errEl.textContent = t("errPassNum"); return; }
    if (!/[^a-zA-Z0-9]/.test(pw)) { errEl.textContent = t("errPassSym"); return; }
    if (pw !== confirm)        { errEl.textContent = t("errPassMatch"); return; }
    setAuthBusy(busyBtnId, true);
    try {
        const ref  = doc(db, "accounts", username);
        const snap = await getDoc(ref);
        if (snap.exists()) { errEl.textContent = t("errUserExists"); setAuthBusy(busyBtnId, false); return; }
        const userId = generateUserId();
        const isOwner = (username === OWNER_CALLSIGN);
        await setDoc(ref, {
            username, passHash: await hashPass(pw),
            role:     isOwner ? "owner" : role,
            status:   isOwner ? "approved" : "pending",
            userId,   callsign: username
        });
        if (isOwner) {
            applyCurrentUser({ username, role: "owner", callsign: username, userId });
        } else {
            onPending();
        }
    } catch (e) {
        console.error("Register error:", e);
        errEl.textContent = t("errNetwork");
    }
    setAuthBusy(busyBtnId, false);
}

// LOGIN modal button (secondary — modal is mainly for settings/admin when logged in)
document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("loginUsername").value.trim().toUpperCase();
    const pw       = document.getElementById("loginPassword").value;
    const errEl    = document.getElementById("loginError");
    document.getElementById("loginPassword").value = "";
    await doLogin(username, pw, errEl, "loginBtn");
});

// REGISTER modal button
document.getElementById("registerBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("regUsername").value.trim().toUpperCase();
    const pw       = document.getElementById("regPassword").value;
    const confirm  = document.getElementById("regConfirm").value;
    const role     = document.getElementById("regRole").value;
    const errEl    = document.getElementById("regError");
    document.getElementById("regPassword").value = "";
    document.getElementById("regConfirm").value  = "";
    await doRegister(username, pw, confirm, role, errEl, "registerBtn", () => {
        errEl.style.color = "#34d399";
        errEl.textContent = "Request submitted — awaiting admin approval.";
    });
});

// LOGOUT
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    applyCurrentUser(null);
});

// Open modal
document.getElementById("accountBtn")?.addEventListener("click", () => {
    updateModalState();
    document.getElementById("accountModal").style.display = "flex";
    // Auto-expand admin panel for owner so it's immediately visible
    const u = getCurrentUser();
    if (u?.role === "owner") {
        const body = document.getElementById("adminPanel");
        const chevron = document.querySelector("#adminToggle .modal-collapsible-chevron");
        if (body) body.style.display = "flex";
        if (chevron) chevron.textContent = "▴";
    }
});
document.getElementById("accountModalClose")?.addEventListener("click", () => {
    document.getElementById("accountModal").style.display = "none";
});
document.getElementById("accountModal")?.addEventListener("click", e => {
    if (e.target.id === "accountModal")
        document.getElementById("accountModal").style.display = "none";
});

// Restore logged-in user on page load
// Always validate the cached session against Firestore to catch:
//  - accounts deleted by admin
//  - accounts that are still pending (pre-approval-feature sessions)
//  - stale sessions from before the auth screen was added
{
    const user = getCurrentUser();
    if (user) {
        // Validate against Firestore before restoring
        getDoc(doc(db, "accounts", user.username)).then(async snap => {
            // Account deleted or pending → force logout and show auth screen
            if (!snap.exists() || (snap.data().status === "pending")) {
                localStorage.removeItem("deltaCurrentUser");
                showAuthScreen();
                return;
            }
            // Account valid — restore session
            const acctData = snap.data();
            // OWNER_CALLSIGN always gets role "owner" regardless of what Firestore
            // stores (the account may have been registered before the owner-role fix).
            const resolvedRole = (user.username === OWNER_CALLSIGN)
                ? "owner"
                : (acctData.role || user.role);
            const resolvedCallsign = acctData.callsign || user.callsign || user.username;
            // Sync any server-side changes (role, callsign, userId)
            const syncedUser = {
                ...user,
                role:     resolvedRole,
                callsign: resolvedCallsign,
                userId:   acctData.userId || user.userId || null,
            };
            // Generate userId if still missing
            if (!syncedUser.userId) {
                syncedUser.userId = generateUserId();
                try { await updateDoc(doc(db, "accounts", user.username), { userId: syncedUser.userId }); } catch (_) {}
            }
            // One-time: regenerate PLAYFRA's userId to clear any legacy value
            if (user.username === OWNER_CALLSIGN && !localStorage.getItem("_ownerIdRegen1")) {
                syncedUser.userId = generateUserId();
                try {
                    await updateDoc(doc(db, "accounts", OWNER_CALLSIGN), { userId: syncedUser.userId });
                    localStorage.setItem("_ownerIdRegen1", "1");
                } catch (_) {}
            }
            localStorage.setItem("deltaCurrentUser", JSON.stringify(syncedUser));

            // Update DOM inputs — must happen before enforceOwnerRole()
            const callEl = document.getElementById("callsignInput");
            if (callEl) callEl.value = resolvedCallsign;
            const roleEl = document.getElementById("roleSelect");
            if (roleEl) roleEl.value = resolvedRole;

            // Keep vezha identity keys in sync so getCallsign()/getRole() are
            // never stale after a page refresh (fixes "B2X4IS / OP" in Vezha)
            localStorage.setItem("vezhaCallsign", resolvedCallsign);
            localStorage.setItem("vezhaRole",     resolvedRole);
            enforceOwnerRole();

            updatePresence();
            presenceInterval = setInterval(updatePresence, 30000);
            if (resolvedRole === "owner") startAdminListeners();
            restoreUserState(syncedUser.username);
            updateModalState();
            drawWatermarkCanvas(syncedUser.userId);

            const idEl = document.getElementById("loggedInId");
            if (idEl) idEl.textContent = syncedUser.userId || "——";
        }).catch(() => {
            // Firestore unreachable — restore from cache optimistically
            const cachedRole     = (user.username === OWNER_CALLSIGN) ? "owner" : user.role;
            const cachedCallsign = user.callsign || user.username;
            const callEl = document.getElementById("callsignInput");
            if (callEl) callEl.value = cachedCallsign;
            const roleEl = document.getElementById("roleSelect");
            if (roleEl) roleEl.value = cachedRole;
            localStorage.setItem("vezhaCallsign", cachedCallsign);
            localStorage.setItem("vezhaRole",     cachedRole);
            enforceOwnerRole();
            updatePresence();
            presenceInterval = setInterval(updatePresence, 30000);
            if (cachedRole === "owner") startAdminListeners();
            restoreUserState(user.username);
            updateModalState();
            drawWatermarkCanvas(user.userId || null);
        });
    } else {
        showAuthScreen();
    }
}

// ─── AUTH SCREEN BUTTONS ──────────────────────────────────────────────────────
document.getElementById("authTabLogin")?.addEventListener("click", () => showAuthPanel("login"));
document.getElementById("authTabRegister")?.addEventListener("click", () => showAuthPanel("register"));
document.getElementById("authPendingBack")?.addEventListener("click", () => showAuthPanel("login"));

document.getElementById("authLoginBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("authLoginUser").value.trim().toUpperCase();
    const pw       = document.getElementById("authLoginPass").value;
    const errEl    = document.getElementById("authLoginError");
    document.getElementById("authLoginPass").value = "";
    await doLogin(username, pw, errEl, "authLoginBtn");
});
document.getElementById("authLoginUser")?.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("authLoginBtn")?.click();
});
document.getElementById("authLoginPass")?.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("authLoginBtn")?.click();
});

// Strip non-latin characters from username fields in real-time
["authRegUser", "authLoginUser"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", function() {
        const cur = this.value;
        const clean = cur.replace(/[^A-Za-z0-9_]/g, "");
        if (clean !== cur) { const s = this.selectionStart - (cur.length - clean.length); this.value = clean; this.setSelectionRange(s, s); }
    });
});

document.getElementById("authRegBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("authRegUser").value.trim().toUpperCase();
    const pw       = document.getElementById("authRegPass").value;
    const confirm  = document.getElementById("authRegConfirm").value;
    const role     = document.getElementById("authRegRole").value;
    const errEl    = document.getElementById("authRegError");
    document.getElementById("authRegPass").value    = "";
    document.getElementById("authRegConfirm").value = "";
    await doRegister(username, pw, confirm, role, errEl, "authRegBtn", () => {
        showAuthPanel("pending");
    });
});

// ─── SETTINGS PANEL ────────────────────────────────────────────────────────────
document.getElementById("settingsToggle")?.addEventListener("click", () => {
    const panel = document.getElementById("settingsPanel");
    const open  = panel.style.display === "none" || panel.style.display === "";
    panel.style.display = open ? "flex" : "none";
    document.querySelector("#settingsToggle .modal-collapsible-chevron").textContent = open ? "▴" : "▾";
});
document.getElementById("settingsSaveBtn")?.addEventListener("click", async () => {
    const errEl    = document.getElementById("settingsError");
    const user     = getCurrentUser();
    if (!user) return;
    errEl.textContent = "";
    errEl.style.color = "";
    const newCallsign = document.getElementById("settingsCallsign").value.trim().toUpperCase();
    const newPass     = document.getElementById("settingsPass").value;
    const newPassConf = document.getElementById("settingsPassConfirm").value;
    const updates = {};
    if (newCallsign && newCallsign !== (user.callsign || user.username)) {
        updates.callsign = newCallsign;
    }
    if (newPass) {
        if (newPass.length < 8) { errEl.textContent = t("errPassLen"); return; }
        if (newPass !== newPassConf) { errEl.textContent = t("errPassMatch"); return; }
        updates.passHash = await hashPass(newPass);
    }
    if (Object.keys(updates).length === 0) { errEl.textContent = "Nothing to change."; return; }
    try {
        await updateDoc(doc(db, "accounts", user.username), updates);
        const newUser = { ...user, ...updates };
        delete newUser.passHash;   // don't store hash in localStorage
        if (updates.callsign) {
            newUser.callsign = updates.callsign;
            localStorage.setItem("vezhaCallsign", updates.callsign);
            const callEl = document.getElementById("callsignInput");
            if (callEl) callEl.value = updates.callsign;
        }
        localStorage.setItem("deltaCurrentUser", JSON.stringify(newUser));
        document.getElementById("settingsPass").value     = "";
        document.getElementById("settingsPassConfirm").value = "";
        errEl.style.color = "#34d399";
        errEl.textContent = "Saved ✓";
        setTimeout(() => { errEl.textContent = ""; errEl.style.color = ""; }, 2000);
    } catch (e) {
        console.error("Settings save error:", e);
        errEl.textContent = t("errNetwork");
    }
});

// ─── ADMIN PANEL TOGGLE ────────────────────────────────────────────────────────
document.getElementById("adminToggle")?.addEventListener("click", () => {
    const panel = document.getElementById("adminPanel");
    const open  = panel.style.display === "none" || panel.style.display === "";
    panel.style.display = open ? "flex" : "none";
    document.querySelector("#adminToggle .modal-collapsible-chevron").textContent = open ? "▴" : "▾";
});

// ─── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────────
const _drawCanvas = document.getElementById("drawCanvas");
document.addEventListener("keydown", async (e) => {
    // Enable canvas pointer-events for Ctrl+drag selection (only when NOT already in draw mode)
    if (e.key === "Control" && !drawMode) {
        map.dragging.disable();
        // Add a temporary CSS class instead of inline style, so drawMode's .active class still works
        _drawCanvas?.classList.add("ctrl-select");
    }

    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (artilleryActive) return;
    if (e.ctrlKey || e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === "z" && !e.shiftKey) { e.preventDefault(); await undoLast(); }
        if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); await redoLast(); }
    }
});
document.addEventListener("keyup", (e) => {
    if (e.key === "Control") {
        _drawCanvas?.classList.remove("ctrl-select");
        if (!drawMode) map.dragging.enable();
        if (_selBoxActive) {
            _selBoxActive = false;
            selBox = null;
            redrawAll();
        }
    }
});

let localStream    = null;
let mySessionRef   = null;   // legacy (kept for beforeunload fallback)
let vezhaUnsubs    = [];     // legacy (unused by v2 but some old code may push here)
let chatUnsub      = null;   // legacy alias — v2ChatUnsub is the real one
let processedSigs  = new Set(); // legacy
// peers / peerMeta — legacy aliases; real state is v2Peers / v2Meta
const peerMeta     = {};

const ICE_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
    ]
};

// Best-effort cleanup on tab close
window.addEventListener("beforeunload", () => {
    if (v2SessionRef) deleteDoc(v2SessionRef); else if (mySessionRef) deleteDoc(mySessionRef);
    clearPresence();
});

// ─── VIEW SWITCHING ───────────────────────────────────────────────────────────
const mapViewBtn   = document.getElementById("mapViewBtn");
const vezhaViewBtn = document.getElementById("vezhaViewBtn");
const brandModule  = document.getElementById("brandModule");

mapViewBtn.addEventListener("click",   () => { if (vezhaActive)  exitVezha(); });
vezhaViewBtn.addEventListener("click", () => { if (!vezhaActive) enterVezha(); });

// ─── VEZHA ROOMS (stub kept for imports that still reference symbols) ─────────
async function initVezhaRooms() {
    roomsData = {};
    try {
        const snap = await getDocs(vezha_rooms_col);
        snap.forEach(d => { roomsData[d.id] = { id: d.id, ...d.data() }; });
        const b = writeBatch(db); let dirty = false;
        for (let i = 1; i <= 10; i++) {
            const rid = `room_${i}`;
            if (!roomsData[rid]) {
                b.set(doc(db, "vezha_rooms", rid), { name: `ROOM ${i}`, order: i });
                roomsData[rid] = { id: rid, name: `ROOM ${i}`, order: i };
                dirty = true;
            }
        }
        if (dirty) await b.commit();
    } catch (e) { console.error("initVezhaRooms:", e); }
}

async function joinRoom(roomId) {
    if (!mySessionRef) return;
    const next = myCurrentRoom === roomId ? null : roomId;
    myCurrentRoom = next;
    try { await updateDoc(mySessionRef, { room: next }); } catch (e) { console.error("joinRoom:", e); }
    renderRoomsPanel();
    // Refresh stream visibility: remove tiles from users not in our room, keep our own
    const grid = document.getElementById("vezhaGrid");
    if (grid) {
        grid.querySelectorAll(".vezha-tile:not(.vezha-tile-self)").forEach(tile => {
            const uid = tile.id.replace("tile-", "");
            const theirRoom = sessionsCache[uid]?.room;
            if (next && theirRoom && theirRoom !== next) tile.remove();
        });
        if (typeof updateTileLayout === "function") updateTileLayout();
    }
}

async function renameRoom(roomId, newName) {
    const n = (newName || "").trim().toUpperCase().slice(0, 20) || `ROOM ${roomId.split("_")[1] || "?"}`;
    try { await updateDoc(doc(db, "vezha_rooms", roomId), { name: n }); } catch (e) { console.error("renameRoom:", e); }
}

async function adminMoveUser(docId, targetRoomId) {
    try { await updateDoc(doc(db, "vezha_sessions", docId), { room: targetRoomId }); } catch (e) { console.error("adminMoveUser:", e); }
}

function renderRoomsPanel() {
    const list = document.getElementById("vezhaRoomsList");
    if (!list) return;

    // v2: no rooms — just show who's online
    const online = Object.entries(v2Meta);
    list.innerHTML = "";

    // "ONLINE" header
    const hdr = document.createElement("div");
    hdr.className = "vr-item";
    hdr.innerHTML =
        `<div class="vr-hdr">` +
        `<span class="vr-name" style="opacity:.55;font-size:9px;letter-spacing:1px">ONLINE</span>` +
        (online.length ? `<span class="vr-cnt">${online.length}</span>` : "") +
        `</div>`;
    list.appendChild(hdr);

    online.forEach(([uid, meta]) => {
        const rc  = ROLE_COLORS[meta.role] || "#64697e";
        const row = document.createElement("div");
        row.className = "vr-item";
        row.innerHTML =
            `<div class="vr-hdr" style="cursor:default">` +
            `<span class="vr-dot" style="background:${rc};width:6px;height:6px;border-radius:50%;flex-shrink:0"></span>` +
            `<span class="vr-name">${escHtml(meta.callsign)}</span>` +
            `</div>`;
        list.appendChild(row);
    });
}

// ════════════════════════════════════════════════════════════════════
// VEZHA v2 — simple, no rooms, fully reliable WebRTC screen share
// ════════════════════════════════════════════════════════════════════

// Each PC is keyed by remote peerId.
// We use a single RTCPeerConnection per pair, replacing it cleanly on renegotiation.
// Tracks are added before createOffer to avoid mid-negotiation surprises.

const VEZHA_ICE = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302"  },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ]
};

// State
const v2Peers      = {};          // peerId → { pc, makingOffer }
const v2Meta       = {};          // peerId → { callsign, role }
let   v2SessionRef = null;
let   v2Unsubs     = [];
let   v2ChatUnsub  = null;
let   v2HB         = null;
let   v2EnterTime  = 0;
const v2Processed  = new Set();

function _v2Send(to, type, data = {}) {
    return addDoc(vezha_signals, { from: myPeerId, to, type, data, created: Date.now() }).catch(() => {});
}

function _v2Label(uid) {
    const m = v2Meta[uid] || {};
    const cs   = m.callsign || uid.slice(-6).toUpperCase();
    const role = (m.role === "owner" ? "ADMIN" : (m.role || "OPERATOR")).toUpperCase();
    return `${role} · ${cs}`;
}

// ── Peer connection factory ──────────────────────────────────────────────────
function v2GetOrCreate(uid) {
    if (v2Peers[uid]) return v2Peers[uid];
    const entry = { pc: null, makingOffer: false };
    const pc = new RTCPeerConnection(VEZHA_ICE);
    entry.pc = pc;
    v2Peers[uid] = entry;

    pc.onicecandidate = e => {
        if (e.candidate) _v2Send(uid, "ice", e.candidate.toJSON());
    };

    // Collect all incoming tracks into one MediaStream per sender
    const incomingStreams = {};
    pc.ontrack = e => {
        const sid = e.streams[0]?.id || e.track.id;
        if (!incomingStreams[sid]) incomingStreams[sid] = new MediaStream();
        incomingStreams[sid].addTrack(e.track);
        // Show tile once we have a video track
        if (e.track.kind === "video") {
            addVideoTile(uid, incomingStreams[sid], _v2Label(uid));
        }
    };

    pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
            v2RemovePeer(uid);
        }
    };

    // Perfect negotiation — polite/impolite based on lexicographic peer id comparison
    const polite = myPeerId < uid;
    pc.onnegotiationneeded = async () => {
        try {
            entry.makingOffer = true;
            await pc.setLocalDescription();
            _v2Send(uid, "offer", { sdp: pc.localDescription.sdp, type: pc.localDescription.type });
        } catch (e) { console.warn("v2 negotiation:", e); }
        finally { entry.makingOffer = false; }
    };

    return entry;
}

function v2AddLocalTracks(pc) {
    // Add current screen stream tracks
    if (localStream) {
        localStream.getTracks().forEach(t => {
            if (!pc.getSenders().find(s => s.track === t)) pc.addTrack(t, localStream);
        });
    }
    // Add mic track
    if (micStream) {
        micStream.getAudioTracks().forEach(t => {
            if (!pc.getSenders().find(s => s.track === t)) {
                try { pc.addTrack(t, micStream); } catch (_) {}
            }
        });
    }
}

function v2RemovePeer(uid) {
    if (v2Peers[uid]) { try { v2Peers[uid].pc.close(); } catch (_) {} delete v2Peers[uid]; }
    delete v2Meta[uid];
    removeTile(uid);
}

// ── Signal handler ──────────────────────────────────────────────────────────
async function v2HandleSignal(sig) {
    const { from, type, data } = sig;
    try {
        if (type === "offer") {
            const entry  = v2GetOrCreate(from);
            const pc     = entry.pc;
            const polite = myPeerId < from;
            const offerCollision = entry.makingOffer || pc.signalingState !== "stable";
            if (!polite && offerCollision) return;  // impolite: ignore colliding offer
            if (polite && offerCollision) {
                await Promise.all([
                    pc.setLocalDescription({ type: "rollback" }),
                    pc.setRemoteDescription(new RTCSessionDescription(data))
                ]);
            } else {
                await pc.setRemoteDescription(new RTCSessionDescription(data));
            }
            v2AddLocalTracks(pc);
            await pc.setLocalDescription();
            _v2Send(from, "answer", { sdp: pc.localDescription.sdp, type: pc.localDescription.type });

        } else if (type === "answer") {
            const pc = v2Peers[from]?.pc;
            if (pc && pc.signalingState !== "stable") {
                await pc.setRemoteDescription(new RTCSessionDescription(data));
            }

        } else if (type === "ice") {
            const pc = v2Peers[from]?.pc;
            if (pc) {
                try { await pc.addIceCandidate(new RTCIceCandidate(data)); } catch (_) {}
            }

        } else if (type === "hello") {
            // New peer announced themselves — create connection and add tracks
            const entry = v2GetOrCreate(from);
            v2AddLocalTracks(entry.pc);
            // Trigger negotiation if we have something to send, else just be ready
            if (localStream || micStream) {
                // onnegotiationneeded will fire automatically after addTrack
            }

        } else if (type === "stop-stream") {
            removeTile(from);
        }
    } catch (err) { console.error("v2 signal error:", err, sig); }
    // Clean up the signal doc from Firestore
    try { await deleteDoc(doc(db, "vezha_signals", sig._docId)); } catch (_) {}
}

// ── enterVezha / exitVezha ───────────────────────────────────────────────────
async function enterVezha() {
    if (typeof artilleryActive !== "undefined" && artilleryActive) exitArtillery();
    if (map3DState) {
        map3DState.dispose(); map3DState = null;
        const b = document.getElementById("mapDimToggle");
        if (b) { b.textContent = "3D"; b.title = "Switch to 3D view"; b.classList.remove("active"); }
    }
    vezhaActive = true;
    v2EnterTime = Date.now();
    document.body.classList.add("in-vezha"); document.body.classList.remove("in-arty");
    document.getElementById("appBody").style.display = "none";
    document.getElementById("vezhaView").classList.add("active");
    brandModule.textContent = "VEZHA";
    mapViewBtn.classList.remove("active");
    vezhaViewBtn.classList.add("active");

    // Purge stale sessions (> 60 s without heartbeat)
    try {
        const all = await getDocs(vezha_sessions);
        const b   = writeBatch(db); let dirty = false;
        all.forEach(d => {
            if (Date.now() - (d.data().lastSeen || 0) > 60000) { b.delete(d.ref); dirty = true; }
        });
        if (dirty) await b.commit();
    } catch (_) {}

    // Register my session
    v2SessionRef = await addDoc(vezha_sessions, {
        userId:   myPeerId,
        callsign: getCallsign(),
        role:     getRole(),
        lastSeen: Date.now(),
        created:  Date.now()
    });

    // Heartbeat
    v2HB = setInterval(() => {
        if (v2SessionRef) updateDoc(v2SessionRef, { lastSeen: Date.now() }).catch(() => {});
    }, 15000);

    // Listen for signals addressed to me
    const unsubSig = onSnapshot(
        query(vezha_signals, where("to", "==", myPeerId)),
        snap => {
            snap.docChanges().forEach(ch => {
                if (ch.type !== "added") return;
                if (v2Processed.has(ch.doc.id)) return;
                const sig = ch.doc.data();
                if (sig.created < v2EnterTime - 5000) return; // skip old
                v2Processed.add(ch.doc.id);
                v2HandleSignal({ ...sig, _docId: ch.doc.id });
            });
        }
    );
    v2Unsubs.push(unsubSig);

    // Listen for peer sessions — track who's online, auto-connect
    const unsubSess = onSnapshot(vezha_sessions, snap => {
        snap.docChanges().forEach(ch => {
            const d   = ch.doc.data();
            const uid = d.userId;
            if (!uid || uid === myPeerId) return;
            if (ch.type === "added" || ch.type === "modified") {
                v2Meta[uid] = { callsign: d.callsign || uid.slice(-6).toUpperCase(), role: d.role || "operator" };
            }
            if (ch.type === "added") {
                // New peer arrived — announce ourselves so they connect back
                _v2Send(uid, "hello");
                // If WE have a stream, kick off an offer to them
                if (localStream) {
                    const entry = v2GetOrCreate(uid);
                    v2AddLocalTracks(entry.pc);
                }
            }
            if (ch.type === "removed") v2RemovePeer(uid);
        });
        // Update operator count
        let count = 0;
        snap.forEach(d => {
            if (d.data().userId !== myPeerId && Date.now() - (d.data().lastSeen || 0) < 45000) count++;
        });
        document.getElementById("vezhaStatus").textContent = t("operators", count);
        renderRoomsPanel();
    });
    v2Unsubs.push(unsubSess);

    // Load chat (last 60 messages)
    document.getElementById("vezhaChatMessages").innerHTML = "";
    chatMsgCache.length = 0;
    renderChannelTabs();
    v2ChatUnsub = onSnapshot(
        query(vezha_chat, orderBy("created", "asc"), limitToLast(60)),
        snap => {
            snap.docChanges().forEach(ch => {
                if (ch.type !== "added") return;
                const data = ch.doc.data();
                if (!chatMsgCache.find(m => m.id === ch.doc.id)) chatMsgCache.push({ id: ch.doc.id, data });
                const fp = _chatFP(data);
                if (_chatOptimisticFPs.has(fp)) { _chatOptimisticFPs.delete(fp); return; }
                renderChatMessage(data);
            });
            const msgsEl = document.getElementById("vezhaChatMessages");
            if (msgsEl) requestAnimationFrame(() => { msgsEl.scrollTop = msgsEl.scrollHeight; });
        }
    );

    updateTileLayout();
    initMic();

    // Announce to all existing peers that we're here (so they send us their streams)
    try {
        const existing = await getDocs(vezha_sessions);
        existing.forEach(d => {
            if (d.data().userId !== myPeerId) _v2Send(d.data().userId, "hello");
        });
    } catch (_) {}
}

async function exitVezha() {
    await stopSharing();
    stopMic();
    vezhaActive = false;
    clearInterval(v2HB); v2HB = null;
    if (v2SessionRef) { deleteDoc(v2SessionRef).catch(() => {}); v2SessionRef = null; }
    v2Unsubs.forEach(u => u()); v2Unsubs = [];
    if (v2ChatUnsub) { v2ChatUnsub(); v2ChatUnsub = null; }
    v2Processed.clear();
    Object.keys(v2Peers).forEach(v2RemovePeer);
    Object.keys(v2Meta).forEach(k => delete v2Meta[k]);
    chatMsgCache.length = 0;
    _chatOptimisticFPs.clear();
    sessionsCache = {};

    document.body.classList.remove("in-vezha");
    document.getElementById("vezhaView").classList.remove("active");
    document.getElementById("appBody").style.display = "flex";
    brandModule.textContent = "MONITOR";
    vezhaViewBtn.classList.remove("active");
    mapViewBtn.classList.add("active");
    setTimeout(() => {
        map.invalidateSize({ animate: false });
        resizeCanvas(); redrawAll();
        drawWatermarkCanvas(getCurrentUser()?.userId || null);
    }, 50);
}

// ── Screen sharing ───────────────────────────────────────────────────────────
document.getElementById("shareScreenBtn").addEventListener("click", shareScreen);
document.getElementById("stopSharingBtn").addEventListener("click", stopSharing);

async function shareScreen() {
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });
        localStream.getVideoTracks()[0].addEventListener("ended", stopSharing);
        addVideoTile("self", localStream, "YOU  ·  BROADCASTING");
        document.getElementById("shareScreenBtn").style.display = "none";
        document.getElementById("stopSharingBtn").style.display = "flex";
        // Add tracks to all existing peer connections — onnegotiationneeded will trigger offers
        Object.values(v2Peers).forEach(({ pc }) => {
            localStream.getTracks().forEach(t => {
                if (!pc.getSenders().find(s => s.track === t)) pc.addTrack(t, localStream);
            });
        });
        // Also connect to any peer we don't have a connection with yet
        try {
            const snap = await getDocs(vezha_sessions);
            snap.forEach(d => {
                const uid = d.data().userId;
                if (uid !== myPeerId && !v2Peers[uid]) {
                    const entry = v2GetOrCreate(uid);
                    v2AddLocalTracks(entry.pc);
                }
            });
        } catch (_) {}
    } catch (err) {
        if (err.name !== "NotAllowedError") console.error("Screen share error:", err);
    }
}

async function stopSharing() {
    if (!localStream) return;
    // Notify all peers first
    const uids = Object.keys(v2Peers);
    await Promise.allSettled(uids.map(uid => _v2Send(uid, "stop-stream")));
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
    removeTile("self");
    document.getElementById("shareScreenBtn").style.display = "flex";
    document.getElementById("stopSharingBtn").style.display  = "none";
    // Close all peer connections — we'll reconnect when someone needs us again
    uids.forEach(uid => { try { v2Peers[uid]?.pc.close(); } catch (_) {} delete v2Peers[uid]; });
}

// Legacy alias
function removePeer(uid) { v2RemovePeer(uid); }

// ─── VIDEO TILES ──────────────────────────────────────────────────────────────
function addVideoTile(id, stream, label) {
    removeTile(id);
    const grid = document.getElementById("vezhaGrid");
    const tile = document.createElement("div");
    tile.className = "vezha-tile" + (id === "self" ? " vezha-tile-self" : "");
    tile.id = "tile-" + id;
    const video = document.createElement("video");
    video.autoplay   = true;
    video.playsInline = true;
    // All tiles start muted — browsers block autoplay of unmuted video.
    // Remote tiles can be unmuted by clicking them after playback starts.
    video.muted = true;
    video.srcObject = stream;
    // Call play() immediately (autoplay=true alone can be suppressed by the browser).
    // Retry every 500 ms in case the track hasn't started flowing yet.
    const tryPlay = () => video.play().catch(() => setTimeout(tryPlay, 500));
    tryPlay();
    // Allow click-to-unmute on remote tiles
    if (id !== "self") {
        video.title = "Click to unmute";
        video.style.cursor = "pointer";
        video.addEventListener("click", () => {
            video.muted = !video.muted;
            video.title = video.muted ? "Click to unmute" : "Click to mute";
        });
    }
    const lbl = document.createElement("div");
    lbl.className = "vezha-tile-label mono"; lbl.textContent = label;
    // Watermark overlay
    const wmCanvas = document.createElement("canvas");
    wmCanvas.className = "tile-watermark";
    tile.appendChild(video); tile.appendChild(lbl); tile.appendChild(wmCanvas);
    grid.appendChild(tile);
    // Draw after the tile is in DOM and has dimensions
    const userId = getCurrentUser()?.userId || null;
    if (userId) {
        requestAnimationFrame(() => {
            wmCanvas.width  = tile.clientWidth  || 640;
            wmCanvas.height = tile.clientHeight || 360;
            drawTileWatermark(wmCanvas, userId);
        });
    }
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

// ─── CHANNELS COLLAPSE ───────────────────────────────────────────────────────
document.getElementById("channelsCollapseBtn")?.addEventListener("click", () => {
    const panel = document.getElementById("vezhaRoomsPanel");
    const btn   = document.getElementById("channelsCollapseBtn");
    if (!panel) return;
    const collapsed = panel.classList.toggle("channels-collapsed");
    btn.textContent = collapsed ? "‹" : "›";
});

// ─── CHAT ─────────────────────────────────────────────────────────────────────
document.getElementById("vezhaChatSend").addEventListener("click", sendChat);
document.getElementById("vezhaChatInput").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
});
// Save draft on every keystroke so renderChannelTabs rebuild never loses it
document.getElementById("vezhaChatInput").addEventListener("input", e => {
    channelDrafts[currentChannel] = e.target.value;
});

// ─── SCROLL-TO-BOTTOM ARROWS ──────────────────────────────────────────────────
function setupScrollArrow(msgsEl) {
    if (!msgsEl || msgsEl._scrollArrow) return;
    const arrow = document.createElement("button");
    arrow.className = "scroll-to-bottom";
    arrow.title = "Scroll to latest";
    arrow.innerHTML = "&#8595;";
    const parent = msgsEl.parentElement;
    if (parent) { parent.style.position = "relative"; parent.appendChild(arrow); }
    const check = () => {
        const atBottom = msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 40;
        arrow.classList.toggle("visible", !atBottom);
    };
    msgsEl.addEventListener("scroll", check);
    arrow.addEventListener("click", () => { msgsEl.scrollTop = msgsEl.scrollHeight; });
    msgsEl._scrollArrow = arrow;
}
setupScrollArrow(document.getElementById("vezhaChatMessages"));
setupScrollArrow(document.getElementById("monitorChatMessages"));

// ─── CHAT SEARCH ─────────────────────────────────────────────────────────────
{
    const toggle    = document.getElementById("chatSearchToggle");
    const searchBar = document.getElementById("chatSearchBar");
    const searchInp = document.getElementById("chatSearchInput");
    const msgsEl    = document.getElementById("vezhaChatMessages");

    toggle?.addEventListener("click", () => {
        const open = searchBar.style.display === "none";
        searchBar.style.display = open ? "block" : "none";
        if (open) { searchInp.value = ""; searchInp.focus(); filterChat(""); }
        else filterChat("");
    });

    function filterChat(term) {
        const q = term.trim().toLowerCase();
        msgsEl?.querySelectorAll(".chat-msg").forEach(el => {
            const text = el.textContent.toLowerCase();
            el.style.display = (!q || text.includes(q)) ? "" : "none";
        });
    }

    searchInp?.addEventListener("input", e => filterChat(e.target.value));
}

// ─── CALLSIGN / ROLE (persisted in localStorage) ─────────────────────────────
// ROLE_COLORS and OWNER_CALLSIGN are declared at the top of the file.
function isOwner() { return getCallsign().toUpperCase() === OWNER_CALLSIGN; }

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

// ─── MONITOR CHAT ─────────────────────────────────────────────────────────────
{
    const monitorChat   = document.getElementById("monitorChat");
    const monitorMsgs   = document.getElementById("monitorChatMessages");
    const monitorInput  = document.getElementById("monitorChatInput");
    const monitorSend   = document.getElementById("monitorChatSend");
    const monitorToggle = document.getElementById("monitorChatToggle");
    const monitorChevron= document.getElementById("monitorChatChevron");

    // Toggle collapse
    monitorToggle?.addEventListener("click", () => {
        monitorChat.classList.toggle("collapsed");
        saveUserState();
        const up = !monitorChat.classList.contains("collapsed");
        monitorChevron.innerHTML = up
            ? `<polyline points="2,7 5,3 8,7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
            : `<polyline points="2,3 5,7 8,3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });

    // Render a message into the monitor chat panel (reuses renderChatMessage styles)
    function renderMonitorMsg(data) {
        if (!monitorMsgs) return;
        const isMine = data.userId === myPeerId;
        const el = document.createElement("div");
        el.className = "chat-msg" + (isMine ? " chat-msg-mine" : "");
        const d  = new Date(data.created);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const name      = escHtml(data.callsign || data.shortId || "?");
        const role      = data.role || "operator";
        const roleColor = ROLE_COLORS[role] || ROLE_COLORS.operator;
        const roleLabel = role === "owner" ? "ADMIN" : role.toUpperCase();
        el.innerHTML = `
          <div class="chat-msg-meta">
            <span class="chat-msg-author" style="color:${roleColor}">${name}</span>
            <span class="chat-msg-role" style="color:${roleColor}">[${roleLabel}]</span>
            <span class="chat-msg-time mono">${hh}:${mm}</span>
          </div>
          <div class="chat-msg-text">${escHtml(data.text)}</div>`;
        monitorMsgs.appendChild(el);
        monitorMsgs.scrollTop = monitorMsgs.scrollHeight;
    }

    // Send from monitor chat (same Firestore collection as Vezha chat)
    const _monitorOptimisticFPs = new Set();
    function _monitorFP(d) { return `${d.userId}|${d.created}|${d.text}`; }
    async function sendMonitorChat() {
        const text = monitorInput?.value.trim();
        if (!text) return;
        monitorInput.value = "";
        const msgData = {
            userId: myPeerId, shortId: myShortId,
            callsign: getCallsign(), role: getRole(),
            text, created: Date.now()
        };
        // Register fingerprint BEFORE addDoc so the optimistic snapshot skips it
        _monitorOptimisticFPs.add(_monitorFP(msgData));
        renderMonitorMsg(msgData);
        try {
            await addDoc(vezha_chat, msgData);
        } catch (err) { console.error("Monitor chat error:", err); }
    }

    monitorSend?.addEventListener("click", sendMonitorChat);
    monitorInput?.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMonitorChat(); }
    });

    // Mirror the shared vezha_chat stream into the monitor panel.
    // This listener runs immediately on page load regardless of Vezha state.
    window.__monitorRenderHook = renderMonitorMsg;
    let _monitorInitialLoad = true;
    onSnapshot(
        query(vezha_chat, orderBy("created", "asc"), limitToLast(60)),
        snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const _mdata = change.doc.data();
                    const _mfp = _monitorFP(_mdata);
                    if (_monitorOptimisticFPs.has(_mfp)) { _monitorOptimisticFPs.delete(_mfp); return; }
                    renderMonitorMsg(_mdata);
                }
            });
            // After each batch (especially the initial load), scroll to bottom
            if (monitorMsgs) {
                requestAnimationFrame(() => { monitorMsgs.scrollTop = monitorMsgs.scrollHeight; });
            }
        }
    );
}

function enforceOwnerRole() {
    const cs       = getCallsign();
    const roleEl   = document.getElementById("roleSelect");
    if (!roleEl) return;
    const ownerOpt = roleEl.querySelector('option[value="owner"]');
    if (cs === OWNER_CALLSIGN) {
        // Force owner role and lock the select
        roleEl.value    = "owner";
        roleEl.disabled = true;
        if (ownerOpt) ownerOpt.style.display = "";
        localStorage.setItem("vezhaRole", "owner");
    } else {
        roleEl.disabled = false;
        // Hide owner option for non-owners
        if (ownerOpt) ownerOpt.style.display = "none";
        // Only reset if role is "owner" AND we're sure callsign is fully typed (not mid-input)
        // Do NOT write to localStorage here — let the change event handle that
        if (roleEl.value === "owner") { roleEl.value = "operator"; }
    }
}
document.getElementById("callsignInput")?.addEventListener("input", e => {
    localStorage.setItem("vezhaCallsign", e.target.value.trim());
    // Only run owner enforcement; role is preserved — enforceOwnerRole no longer writes operator to localStorage
    enforceOwnerRole();
});
// Persist role on blur (after user finishes typing callsign)
document.getElementById("callsignInput")?.addEventListener("blur", () => {
    const roleEl = document.getElementById("roleSelect");
    if (roleEl && roleEl.value !== "owner") {
        localStorage.setItem("vezhaRole", roleEl.value);
    }
});
document.getElementById("roleSelect")?.addEventListener("change", e => {
    if (e.target.value === "owner" && getCallsign() !== OWNER_CALLSIGN) {
        e.target.value = "operator";   // non-owners can't select owner
    }
    localStorage.setItem("vezhaRole", e.target.value);
});
enforceOwnerRole();

// Fingerprint-based dedup: keyed on userId|created|text, set BEFORE addDoc so
// the optimistic Firestore snapshot (which fires before await resolves) is caught.
const _chatOptimisticFPs = new Set();

function _chatFP(data) { return `${data.userId}|${data.created}|${data.text}`; }

async function sendChat() {
    const input    = document.getElementById("vezhaChatInput");
    const text     = input.value.trim();
    if (!text || !vezhaActive) return;
    input.value = "";
    channelDrafts[currentChannel] = "";
    const callsign = getCallsign();
    const role     = getRole();
    const msgData  = {
        userId: myPeerId, shortId: myShortId,
        callsign, role, text, created: Date.now(),
        channel: currentChannel
    };
    // Register fingerprint BEFORE addDoc so the optimistic snapshot skips it
    _chatOptimisticFPs.add(_chatFP(msgData));
    // Render immediately
    renderChatMessage(msgData);
    try {
        const ref = await addDoc(vezha_chat, msgData);
        chatMsgCache.push({ id: ref.id, data: msgData });
    } catch (err) { console.error("Chat error:", err); }
}

function renderChatMessage(data) {
    // Filter by current channel — legacy messages without channel go to "general"
    const msgChannel = data.channel || "general";
    if (msgChannel !== currentChannel) return;
    const isMine   = data.userId === myPeerId;
    const msgs     = document.getElementById("vezhaChatMessages");
    const el       = document.createElement("div");
    el.className   = "chat-msg" + (isMine ? " chat-msg-mine" : "");
    el.dataset.channel = msgChannel;
    const d   = new Date(data.created);
    const hh  = String(d.getHours()).padStart(2, "0");
    const mm  = String(d.getMinutes()).padStart(2, "0");
    const name = escHtml(data.callsign || data.shortId || data.userId.slice(-6).toUpperCase());
    const role = data.role || "operator";
    const roleColor = ROLE_COLORS[role] || ROLE_COLORS.operator;
    const roleLabel = role === "owner" ? "ADMIN" : role.toUpperCase();
    el.innerHTML = `
      <div class="chat-msg-meta">
        <span class="chat-msg-author" style="color:${roleColor}">${name}</span>
        <span class="chat-msg-role" style="color:${roleColor}">[${roleLabel}]</span>
        <span class="chat-msg-time mono">${hh}:${mm}</span>
      </div>
      <div class="chat-msg-text">${escHtml(data.text)}</div>`;
    msgs.appendChild(el);
    requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
}

function escHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─── TUTORIAL ────────────────────────────────────────────────────────────────
const TUT_STEPS = {
  en: [
    {
        icon: "🛡",
        title: "WELCOME TO DELTA",
        body:  "DELTA is a real-time tactical coordination system for the <b>25th Brigade</b> in <b>Roblox MTC4</b>. It is <b>private</b> — please don't share any content, screenshots, or data from this site with anyone outside the brigade or publish it online without admin approval."
    },
    {
        icon: "🗺️",
        title: "THE THREE VIEWS",
        body:  "DELTA has three views: <b>MONITOR</b> (tactical map with markers &amp; drawings), <b>VEZHA</b> (voice/video comms and chat), and <b>ARTY</b> (artillery firing calculator). Switch between them using the icons in the top-left bar."
    },
    {
        icon: "📍",
        title: "PLACING MARKERS",
        body:  "Make sure draw mode is <b>OFF</b>, then <b>left-click</b> anywhere on the map to place a tactical marker. Select the unit type and side from the left panel first. <b>Click</b> a marker to edit its details (info, source, Medal clip…). <b>Right-click</b> a marker to delete it."
    },
    {
        icon: "✏️",
        title: "DRAW TOOLS",
        body:  "Toggle <b>DRAW ON</b> in the left panel to annotate the map. Select a tool: pen, line, arrow, circle, rectangle, AOI (zone), or text label. Choose colour and stroke width. <b>Ctrl + drag</b> a selection box to delete multiple drawings at once."
    },
    {
        icon: "📏",
        title: "RULER",
        body:  "Click the ruler icon (right toolbar) to measure distances. Click the map to add points — the running total appears in the top-right. <b>Double-click</b> or click the ruler button again to finish. Works in both 2D and 3D."
    },
    {
        icon: "📡",
        title: "VEZHA — COMMS",
        body:  "VEZHA is the communications hub. Create or join a <b>room</b> to start a voice/video call with your team. The chat panel is shared with the Monitor comms window. You can attach a <b>Medal.tv clip link</b> to any marker using the CLIP field in the edit popup."
    },
    {
        icon: "🎯",
        title: "ARTY CALCULATOR",
        body:  "Switch to the <b>ARTY</b> view for firing solutions. <b>Left-click</b> the map to place your gun, <b>right-click</b> to place the target. Results show azimuth, elevation, and time-of-flight for each shell type. The 3D panel shows the ballistic trajectory."
    }
  ],
  ru: [
    {
        icon: "🛡",
        title: "ДОБРО ПОЖАЛОВАТЬ В DELTA",
        body:  "DELTA — система тактической координации в реальном времени для <b>25-й Бригады</b> в <b>Roblox MTC4</b>. Система <b>приватная</b> — пожалуйста, не делитесь материалами, скриншотами или данными этого сайта с кем-либо вне бригады и не публикуйте их в сети без разрешения администратора."
    },
    {
        icon: "🗺️",
        title: "ТРИ РЕЖИМА",
        body:  "DELTA имеет три режима: <b>МОНИТОР</b> (тактическая карта с метками и рисунками), <b>ВЕЖА</b> (голос/видео и чат) и <b>АРТА</b> (калькулятор артиллерийского огня). Переключайтесь между ними через иконки в левой части верхней панели."
    },
    {
        icon: "📍",
        title: "РАЗМЕЩЕНИЕ МЕТОК",
        body:  "Убедитесь, что режим рисования <b>ВЫКЛЮЧЕН</b>, затем <b>кликните левой кнопкой</b> по карте, чтобы поставить метку. Сначала выберите тип и сторону в левой панели. <b>Клик</b> по метке открывает редактирование. <b>Правый клик</b> — удаление."
    },
    {
        icon: "✏️",
        title: "ИНСТРУМЕНТЫ РИСОВАНИЯ",
        body:  "Включите <b>РИСОВАНИЕ</b> в левой панели для аннотирования карты. Доступны: перо, линия, стрелка, круг, прямоугольник, AOI (зона) и текстовая метка. <b>Ctrl + выделение</b> — удаление нескольких рисунков сразу."
    },
    {
        icon: "📏",
        title: "ЛИНЕЙКА",
        body:  "Нажмите иконку линейки (правая панель), чтобы измерить расстояния. Кликайте по карте для добавления точек — итог отображается справа вверху. <b>Двойной клик</b> или повторное нажатие завершает замер. Работает в 2D и 3D."
    },
    {
        icon: "📡",
        title: "ВЕЖА — СВЯЗЬ",
        body:  "ВЕЖА — центр связи. Создайте или подключитесь к <b>комнате</b> для голосового/видео вызова с командой. Чат общий с окном связи Монитора. К любой метке можно прикрепить <b>ссылку Medal.tv</b> через поле КЛИП в окне редактирования."
    },
    {
        icon: "🎯",
        title: "КАЛЬКУЛЯТОР АРТЫ",
        body:  "В режиме <b>АРТА</b> рассчитываются параметры огня. <b>Левый клик</b> — позиция орудия, <b>правый клик</b> — цель. Результаты: азимут, угол возвышения и время полёта для каждого типа снаряда. 3D-панель показывает баллистическую траекторию."
    }
  ],
  ua: [
    {
        icon: "🛡",
        title: "ЛАСКАВО ПРОСИМО ДО DELTA",
        body:  "DELTA — система тактичної координації в реальному часі для <b>25-ї Бригади</b> в <b>Roblox MTC4</b>. Система <b>приватна</b> — будь ласка, не діліться матеріалами, скриншотами або даними цього сайту з кимось поза бригадою і не публікуйте їх в мережі без дозволу адміністратора."
    },
    {
        icon: "🗺️",
        title: "ТРИ РЕЖИМИ",
        body:  "DELTA має три режими: <b>МОНІТОР</b> (тактична карта з мітками та малюнками), <b>ВЕЖА</b> (голос/відео та чат) і <b>АРТА</b> (калькулятор артилерійського вогню). Перемикайтеся між ними через іконки у лівій частині верхньої панелі."
    },
    {
        icon: "📍",
        title: "РОЗМІЩЕННЯ МІТОК",
        body:  "Переконайтеся, що режим малювання <b>ВИМКНЕНО</b>, потім <b>клікніть лівою кнопкою</b> по карті, щоб поставити мітку. Спочатку виберіть тип і сторону в лівій панелі. <b>Клік</b> по мітці відкриває редагування. <b>Правий клік</b> — видалення."
    },
    {
        icon: "✏️",
        title: "ІНСТРУМЕНТИ МАЛЮВАННЯ",
        body:  "Увімкніть <b>МАЛЮВАННЯ</b> в лівій панелі для анотування карти. Доступні: перо, лінія, стрілка, коло, прямокутник, AOI (зона) та текстова мітка. <b>Ctrl + виділення</b> — видалення кількох малюнків одразу."
    },
    {
        icon: "📏",
        title: "ЛІНІЙКА",
        body:  "Натисніть іконку лінійки (права панель), щоб виміряти відстані. Клікайте по карті для додавання точок — підсумок відображається праворуч угорі. <b>Подвійний клік</b> або повторне натискання завершує вимір. Працює в 2D та 3D."
    },
    {
        icon: "📡",
        title: "ВЕЖА — ЗВ'ЯЗОК",
        body:  "ВЕЖА — центр зв'язку. Створіть або приєднайтеся до <b>кімнати</b> для голосового/відео виклику з командою. Чат спільний з вікном зв'язку Монітора. До будь-якої мітки можна прикріпити <b>посилання Medal.tv</b> через поле КЛІП у вікні редагування."
    },
    {
        icon: "🎯",
        title: "КАЛЬКУЛЯТОР АРТИ",
        body:  "В режимі <b>АРТА</b> розраховуються параметри вогню. <b>Лівий клік</b> — позиція гармати, <b>правий клік</b> — ціль. Результати: азимут, кут підвищення та час польоту для кожного типу снаряду. 3D-панель показує балістичну траєкторію."
    }
  ]
};

let _tutLang = "en";
let _tutStep = 0;

function _tutSteps() { return TUT_STEPS[_tutLang] || TUT_STEPS.en; }

function _tutRender() {
    const steps = _tutSteps();
    const step  = steps[_tutStep];
    const total = steps.length;
    document.getElementById("tutStepLabel").textContent = `STEP ${_tutStep + 1} / ${total}`;
    document.getElementById("tutIcon").textContent  = step.icon;
    document.getElementById("tutTitle").textContent = step.title;
    document.getElementById("tutBody").innerHTML    = step.body;
    document.getElementById("tutPrev").disabled     = _tutStep === 0;
    document.getElementById("tutNext").textContent  = _tutStep === total - 1 ? "FINISH ✓" : "NEXT →";
    // Dots
    const dots = document.getElementById("tutDots");
    dots.innerHTML = "";
    for (let i = 0; i < total; i++) {
        const d = document.createElement("span");
        d.className = "tut-dot" + (i === _tutStep ? " tut-dot-active" : "");
        dots.appendChild(d);
    }
    // Lang buttons
    document.querySelectorAll(".tut-lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === _tutLang);
    });
}

function startTutorial() {
    _tutStep = 0;
    _tutRender();
    document.getElementById("tutorialOverlay").style.display = "flex";
}

function closeTutorial() {
    document.getElementById("tutorialOverlay").style.display = "none";
    localStorage.setItem("deltaTutorialDone", "1");
}

document.getElementById("tutNext")?.addEventListener("click", () => {
    if (_tutStep < _tutSteps().length - 1) { _tutStep++; _tutRender(); }
    else closeTutorial();
});
document.getElementById("tutPrev")?.addEventListener("click", () => {
    if (_tutStep > 0) { _tutStep--; _tutRender(); }
});
document.getElementById("tutSkip")?.addEventListener("click", closeTutorial);
document.getElementById("tutorialBtn")?.addEventListener("click", startTutorial);

// Tutorial language switcher
document.querySelectorAll(".tut-lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        _tutLang = btn.dataset.lang;
        // Keep step in range if new lang has fewer steps
        const steps = _tutSteps();
        if (_tutStep >= steps.length) _tutStep = steps.length - 1;
        _tutRender();
    });
});

// Show tutorial automatically for first-time users (after auth)
function maybeShowTutorial() {
    if (!localStorage.getItem("deltaTutorialDone")) startTutorial();
}

// ─── THEME TOGGLE ────────────────────────────────────────────────────────────

const themeToggleBtn = document.getElementById("themeToggleBtn");
themeToggleBtn.addEventListener("click", () => {
    isLightTheme = !isLightTheme;
    document.body.classList.toggle("light-theme", isLightTheme);
    themeToggleBtn.title = isLightTheme ? "Switch to dark theme" : "Switch to light theme";
    themeToggleBtn.classList.toggle("active", isLightTheme);
    saveUserState();
    // Re-draw watermark with updated colour scheme
    drawWatermarkCanvas(getCurrentUser()?.userId || null);
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

    // Store for trajectory animation
    lastArtyCalc = {
        distM, v, elevDeg: lowElev, tof: tofLow,
        gLat: artyGunPx?.lat, gLng: artyGunPx?.lng,
        tLat: artyTgtPx?.lat, tLng: artyTgtPx?.lng,
        heightM
    };
    if (arty3DState?.updateTrajectory) arty3DState.updateTrajectory(lastArtyCalc);

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
        <span class="arty-result-val">${fmt1(lowElev)}<span class="arty-result-unit">°</span></span>
      </div>
      <div class="arty-result-row">
        <span class="arty-result-label">${t("artyTof")} (LOW)</span>
        <span class="arty-result-val">${fmt1(tofLow)}<span class="arty-result-unit"> s</span></span>
      </div>
      <div class="arty-result-row">
        <span class="arty-result-label">${t("artyHighArc")}</span>
        <span class="arty-result-val ${highElev === null ? "dim" : ""}">${highElev !== null ? fmt1(highElev) + "°" : "N/A"}</span>
      </div>${tofHigh !== null ? `
      <div class="arty-result-row">
        <span class="arty-result-label">${t("artyTof")} (HIGH)</span>
        <span class="arty-result-val">${fmt1(tofHigh)}<span class="arty-result-unit"> s</span></span>
      </div>` : ""}
      <div class="arty-result-row muted-row">
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-dim);line-height:1.5">
          ${escHtml(gun.name)}<br>${escHtml(proj.name)} · ${v} m/s · Δh: ${hd > 0 ? "+" : ""}${hd} m
        </span>
      </div>`;
    if (noResult) noResult.style.display = "none";
});

// ─── Artillery Map (Leaflet instance inside ARTY view) ───────────────────────
// These are recomputed whenever the map changes (loadMapConfig calls updateArtyScale).
// Using PIXELS_PER_METER_DYNAMIC so each map's calibration ppm is respected.
let ARTY_PX_TO_STUD = (1 / PIXELS_PER_METER_DYNAMIC) * DIST_CORRECTION;
let ARTY_STUD_TO_PX = 1 / ARTY_PX_TO_STUD;
function updateArtyScale() {
    ARTY_PX_TO_STUD = (1 / PIXELS_PER_METER_DYNAMIC) * DIST_CORRECTION;
    ARTY_STUD_TO_PX = 1 / ARTY_PX_TO_STUD;
}

let artyMapInstance = null;
let artyGunMarker   = null;
let artyTgtMarker   = null;
let artyLine        = null;
// Raw Leaflet pixel coords of last gun/target placement (for the line and markers)
let artyGunPx       = null;   // { lat, lng } in Leaflet map coords (px)
let artyTgtPx       = null;
// Latest calc result for trajectory animation
let lastArtyCalc    = null;  // { distM, v, elevDeg, tof, gLat, gLng, tLat, tLng }

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

let _artyImageOverlay = null;

function reloadArtyMapImage() {
    if (!artyMapInstance) return;
    const cfg = MAPS[currentMapIdx];
    const newBounds = [[0, 0], [cfg.height, cfg.width]];
    if (_artyImageOverlay) { artyMapInstance.removeLayer(_artyImageOverlay); _artyImageOverlay = null; }
    _artyImageOverlay = L.imageOverlay(cfg.file, newBounds).addTo(artyMapInstance);
    artyMapInstance.setMaxBounds(newBounds);
    artyMapInstance.fitBounds(newBounds);
    // Clear gun/target markers since their pixel coords are map-specific
    if (artyGunMarker) { artyGunMarker.remove(); artyGunMarker = null; }
    if (artyTgtMarker) { artyTgtMarker.remove(); artyTgtMarker = null; }
    if (artyLine)      { artyLine.remove();      artyLine      = null; }
    artyGunPx = null; artyTgtPx = null;
    _savedArtyGunPx = null; _savedArtyTgtPx = null;  // clear saved positions on map change
    document.getElementById("artyGunX").value = "";
    document.getElementById("artyGunY").value = "";
    document.getElementById("artyTgtX").value = "";
    document.getElementById("artyTgtY").value = "";
}

function initArtyMap() {
    const el = document.getElementById("artyMapEl");
    if (!el) return;
    if (artyMapInstance) {
        // Already created — reload image for current map and resize
        reloadArtyMapImage();
        setTimeout(() => {
            artyMapInstance.invalidateSize();
            artyMapInstance.fitBounds([[0, 0], [imageHeight, imageWidth]]);
        }, 80);
        return;
    }
    artyMapInstance = L.map("artyMapEl", {
        crs: L.CRS.Simple, minZoom: -3, maxZoom: 4,
        zoomControl: true, attributionControl: false
    });
    const artBounds = [[0, 0], [imageHeight, imageWidth]];
    _artyImageOverlay = L.imageOverlay(MAPS[currentMapIdx].file, artBounds).addTo(artyMapInstance);
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
        if (arty3DState) arty3DState.addSimple("_gun", artyGunPx.lat, artyGunPx.lng, "G", "#4ade80");
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
        if (arty3DState) arty3DState.addSimple("_tgt", artyTgtPx.lat, artyTgtPx.lng, "T", "#f87171");
        updateArtyLine();
        triggerArtyCalc();
    });

    // ── Mirror monitor markers onto arty map (read-only, auto-updates) ─────────
    // displayedMarkers is the live map keyed by Firestore id
    const artyMarkerLayer = {};
    function syncArtyMarkers() {
        // Add/update
        Object.entries(displayedMarkers).forEach(([id, { marker, data }]) => {
            if (artyMarkerLayer[id]) return;
            const ll = marker.getLatLng();
            const m  = L.marker([ll.lat, ll.lng], {
                icon: createIcon(data.type || "infantry_alive", data),
                interactive: false
            }).addTo(artyMapInstance);
            artyMarkerLayer[id] = m;
        });
        // Remove deleted
        Object.keys(artyMarkerLayer).forEach(id => {
            if (!displayedMarkers[id]) {
                artyMarkerLayer[id].remove();
                delete artyMarkerLayer[id];
            }
        });
    }
    syncArtyMarkers();
    // Re-sync whenever monitor markers change (onSnapshot already updates displayedMarkers)
    const _origSnap = window.__artyMarkerSyncInterval;
    window.__artyMarkerSyncInterval = setInterval(syncArtyMarkers, 3000);

    // ── Mirror drawings onto arty map via a canvas overlay ───────────────────
    // Canvas is appended directly to the map container (NOT inside a Leaflet pane)
    // so it doesn't get CSS-transformed during pan/zoom. We listen to "move" for
    // continuous redraws so drawings stay locked to map coordinates.
    const ArtyDrawLayer = L.Layer.extend({
        onAdd(map) {
            this._map = map;
            this._canvas = document.createElement("canvas");
            this._canvas.className = "arty-draw-canvas";
            // Insert canvas as a direct child of the Leaflet container div
            map.getContainer().appendChild(this._canvas);
            map.on("move zoom viewreset moveend zoomend", this._redraw, this);
            this._redraw();
        },
        onRemove(map) {
            this._canvas.remove();
            map.off("move zoom viewreset moveend zoomend", this._redraw, this);
        },
        update() { this._redraw(); },
        _redraw() {
            const size = this._map.getSize();
            this._canvas.width  = size.x;
            this._canvas.height = size.y;
            Object.assign(this._canvas.style, {
                position: "absolute", top: "0", left: "0",
                width: size.x + "px", height: size.y + "px",
                pointerEvents: "none", zIndex: "400"
            });
            const gc = this._canvas.getContext("2d");
            gc.clearRect(0, 0, size.x, size.y);
            strokes.forEach(s => this._drawStroke(gc, s));
        },
        _drawStroke(gc, s) {
            const llToP = ll => this._map.latLngToContainerPoint(L.latLng(ll.lat, ll.lng));
            gc.save();
            gc.strokeStyle = s.color; gc.lineWidth = s.width;
            gc.lineCap = "round"; gc.lineJoin = "round";
            if (s.tool === "pen" || s.tool === "eraser") {
                if (s.tool === "eraser") { gc.globalCompositeOperation = "destination-out"; gc.lineWidth = s.width * 5; }
                gc.beginPath();
                (s.points || []).forEach((pt, i) => {
                    const p = llToP(pt);
                    i === 0 ? gc.moveTo(p.x, p.y) : gc.lineTo(p.x, p.y);
                });
                gc.stroke();
            } else if (s.tool === "line" || s.tool === "arrow") {
                const p1 = llToP(s.ll1), p2 = llToP(s.ll2);
                gc.beginPath(); gc.moveTo(p1.x, p1.y); gc.lineTo(p2.x, p2.y); gc.stroke();
                if (s.tool === "arrow") {
                    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                    const hl  = Math.max(10, s.width * 4);
                    gc.fillStyle = s.color; gc.beginPath();
                    gc.moveTo(p2.x, p2.y);
                    gc.lineTo(p2.x - hl * Math.cos(ang - Math.PI/6), p2.y - hl * Math.sin(ang - Math.PI/6));
                    gc.lineTo(p2.x - hl * Math.cos(ang + Math.PI/6), p2.y - hl * Math.sin(ang + Math.PI/6));
                    gc.closePath(); gc.fill();
                }
            } else if (s.tool === "circle") {
                const p1 = llToP(s.ll1), p2 = llToP(s.ll2);
                gc.beginPath();
                gc.ellipse((p1.x+p2.x)/2, (p1.y+p2.y)/2, Math.abs(p2.x-p1.x)/2, Math.abs(p2.y-p1.y)/2, 0, 0, Math.PI*2);
                gc.stroke();
            } else if (s.tool === "rect") {
                const p1 = llToP(s.ll1), p2 = llToP(s.ll2);
                gc.beginPath(); gc.strokeRect(p1.x, p1.y, p2.x-p1.x, p2.y-p1.y);
            } else if (s.tool === "label") {
                const p = llToP(s.ll1);
                const fs = Math.max(9, Math.min(s.width * 4, 28));
                gc.font = `700 ${fs}px 'Share Tech Mono', monospace`;
                gc.fillStyle = s.color;
                gc.shadowColor = "rgba(0,0,0,0.8)"; gc.shadowBlur = 4;
                gc.fillText(s.labelText || "", p.x, p.y);
                gc.shadowBlur = 0;
            } else if (s.tool === "zone") {
                const p1 = llToP(s.ll1), p2 = llToP(s.ll2);
                const rx = Math.min(p1.x, p2.x), ry = Math.min(p1.y, p2.y);
                const rw = Math.abs(p2.x-p1.x), rh = Math.abs(p2.y-p1.y);
                gc.globalAlpha = 0.16; gc.fillStyle = s.color; gc.fillRect(rx, ry, rw, rh); gc.globalAlpha = 1;
                gc.setLineDash([5,4]); gc.strokeRect(rx, ry, rw, rh); gc.setLineDash([]);
                if (s.zoneName) {
                    const cx2 = rx+rw/2, cy2 = ry+rh/2;
                    const fs2 = Math.max(9, Math.min(rh*0.18, 18));
                    gc.font = `700 ${fs2}px 'Share Tech Mono', monospace`;
                    gc.textAlign = "center"; gc.textBaseline = "middle";
                    const tw = gc.measureText(s.zoneName).width;
                    gc.fillStyle = "rgba(6,12,22,0.72)"; gc.fillRect(cx2-tw/2-5, cy2-fs2/2-2, tw+10, fs2+5);
                    gc.fillStyle = s.color; gc.fillText(s.zoneName, cx2, cy2);
                    gc.textAlign = "left"; gc.textBaseline = "alphabetic";
                }
            }
            gc.restore();
        }
    });
    const artyDrawLayer = new ArtyDrawLayer();
    artyDrawLayer.addTo(artyMapInstance);
    window.__artyDrawLayer = artyDrawLayer;
    // Hook into redrawAll so arty map redraws when strokes change
    const _origRedrawAll = redrawAll;
    window.__artyRedrawHook = () => { if (artyMapInstance) artyDrawLayer.update(); };
}

// ─── Artillery view switching ─────────────────────────────────────────────────
let artilleryActive = false;
const artilleryViewBtn = document.getElementById("artilleryViewBtn");

// Saved G/T positions survive view switches (cleared only on map change)
let _savedArtyGunPx = null;
let _savedArtyTgtPx = null;

function enterArtillery() {
    if (vezhaActive) exitVezha();
    artilleryActive = true;
    document.body.classList.add("in-arty"); document.body.classList.remove("in-vezha");
    document.getElementById("appBody").style.display = "none";
    document.getElementById("vezhaView").classList.remove("active");
    document.getElementById("artilleryView").classList.add("active");
    brandModule.textContent = "ARTY";
    mapViewBtn.classList.remove("active");
    vezhaViewBtn.classList.remove("active");
    artilleryViewBtn.classList.add("active");
    setTimeout(() => {
        // Snapshot saved positions BEFORE initArtyMap/reloadArtyMapImage clears them
        const restoreGun = _savedArtyGunPx ? { ..._savedArtyGunPx } : null;
        const restoreTgt = _savedArtyTgtPx ? { ..._savedArtyTgtPx } : null;
        initArtyMap();
        drawArtyWatermark(getCurrentUser()?.userId || null);
        // Restore G/T after the Leaflet map has had time to initialise
        if (restoreGun || restoreTgt) {
            setTimeout(() => {
                if (!artyMapInstance) return;
                const ppm = MAPS[currentMapIdx].ppm;
                const STUD = ppm > 0 ? 1 / ppm : 1;
                if (restoreGun) {
                    artyGunPx = restoreGun;
                    if (artyGunMarker) artyGunMarker.remove();
                    artyGunMarker = L.marker([restoreGun.lat, restoreGun.lng], {
                        icon: L.divIcon({ className: "", html: `<div style="background:#4ade80;color:#000;font-family:monospace;font-size:10px;font-weight:700;padding:2px 5px;border-radius:3px;white-space:nowrap;">G</div>`, iconAnchor: [10, 10] })
                    }).addTo(artyMapInstance);
                    document.getElementById("artyGunX").value = Math.round(restoreGun.lng * STUD);
                    document.getElementById("artyGunY").value = Math.round(restoreGun.lat * STUD);
                }
                if (restoreTgt) {
                    artyTgtPx = restoreTgt;
                    if (artyTgtMarker) artyTgtMarker.remove();
                    artyTgtMarker = L.marker([restoreTgt.lat, restoreTgt.lng], {
                        icon: L.divIcon({ className: "", html: `<div style="background:#f87171;color:#000;font-family:monospace;font-size:10px;font-weight:700;padding:2px 5px;border-radius:3px;white-space:nowrap;">T</div>`, iconAnchor: [8, 10] })
                    }).addTo(artyMapInstance);
                    document.getElementById("artyTgtX").value = Math.round(restoreTgt.lng * STUD);
                    document.getElementById("artyTgtY").value = Math.round(restoreTgt.lat * STUD);
                }
                if (artyGunPx && artyTgtPx) triggerArtyCalc();
            }, 200);
        }
    }, 50);
}

function exitArtillery() {
    // Save current G/T positions before leaving
    _savedArtyGunPx = artyGunPx ? { ...artyGunPx } : null;
    _savedArtyTgtPx = artyTgtPx ? { ...artyTgtPx } : null;
    // Clean up arty 3D scene if active
    if (arty3DState) {
        arty3DState.dispose(); arty3DState = null;
        const b = document.getElementById("artyDimToggle");
        if (b) { b.textContent = "3D"; b.title = "Switch to 3D view"; b.classList.remove("active"); }
    }
    artilleryActive = false;
    document.body.classList.remove("in-arty");
    document.getElementById("artilleryView").classList.remove("active");
    document.getElementById("appBody").style.display = "flex";
    brandModule.textContent = "MONITOR";
    artilleryViewBtn.classList.remove("active");
    mapViewBtn.classList.add("active");
    setTimeout(() => {
        map.invalidateSize({ animate: false });
        resizeCanvas();
        redrawAll();
        drawWatermarkCanvas(getCurrentUser()?.userId || null);
    }, 50);
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

// ════════════════════════════════════════════════════════════════════
// CUSTOM CONFIRM POPUP
// ════════════════════════════════════════════════════════════════════
function showConfirm(msg, okLabel = "DELETE") {
    return new Promise(resolve => {
        const overlay = document.getElementById("confirmPopup");
        if (!overlay) { resolve(window.confirm(msg)); return; }
        document.getElementById("confirmPopupMsg").textContent = msg;
        document.getElementById("confirmPopupOk").textContent  = okLabel;
        overlay.hidden = false;
        const okBtn     = document.getElementById("confirmPopupOk");
        const cancelBtn = document.getElementById("confirmPopupCancel");
        function done(result) {
            overlay.hidden = true;
            okBtn.removeEventListener("click", onOk);
            cancelBtn.removeEventListener("click", onCancel);
            overlay.removeEventListener("click", onOverlay);
            resolve(result);
        }
        function onOk()      { done(true);  }
        function onCancel()  { done(false); }
        function onOverlay(e){ if (e.target === overlay) done(false); }
        okBtn.addEventListener("click",     onOk);
        cancelBtn.addEventListener("click", onCancel);
        overlay.addEventListener("click",   onOverlay);
    });
}

// ════════════════════════════════════════════════════════════════════
// MARKER SIZE CONTROL
// ════════════════════════════════════════════════════════════════════
let markerScale = parseFloat(localStorage.getItem("mkrScale") || "1");
function setMarkerScale(s) {
    markerScale = Math.max(0.25, Math.min(3, parseFloat(s.toFixed(2))));
    document.documentElement.style.setProperty("--mkr-scale", markerScale);
    localStorage.setItem("mkrScale", markerScale);
}
setMarkerScale(markerScale); // apply stored value on load
document.getElementById("mkrSizeUp"  )?.addEventListener("click", () => setMarkerScale(markerScale + 0.15));
document.getElementById("mkrSizeDown")?.addEventListener("click", () => setMarkerScale(markerScale - 0.15));

// ════════════════════════════════════════════════════════════════════
// MAP SELECTOR
// ════════════════════════════════════════════════════════════════════
function buildMapSelectorDropdown() {
    const drop = document.getElementById("mapSelDropdown");
    if (!drop) return;

    // ── Search box ────────────────────────────────────────────────────────────
    drop.innerHTML =
        `<div class="map-sel-search-wrap">
           <input id="mapSelSearch" class="map-sel-search" type="text"
                  placeholder="Search maps…" autocomplete="off" spellcheck="false"/>
         </div>
         <div id="mapSelList"></div>`;

    const searchInput = drop.querySelector("#mapSelSearch");
    const listEl      = drop.querySelector("#mapSelList");

    function renderMapList(filter) {
        const q = (filter || "").trim().toLowerCase();
        listEl.innerHTML = MAPS
            .map((m, i) => ({ m, i }))
            .filter(({ m }) => !q || m.name.toLowerCase().includes(q))
            .map(({ m, i }) =>
                `<div class="map-sel-opt${i === currentMapIdx ? " active" : ""}" data-idx="${i}">
                   ${m.name}
                   <span class="map-sel-scale">${Math.round(1 / m.ppm)}m/px</span>
                 </div>`)
            .join("") || `<div class="map-sel-empty">No maps found</div>`;

        listEl.querySelectorAll(".map-sel-opt").forEach(opt => {
            opt.addEventListener("click", () => {
                const idx = parseInt(opt.dataset.idx);
                drop.classList.remove("open");
                searchInput.value = "";
                renderMapList("");
                if (idx !== currentMapIdx) loadMapConfig(idx);
            });
        });
    }

    renderMapList("");
    searchInput.addEventListener("input", () => renderMapList(searchInput.value));
    // Stop click inside search from closing the dropdown
    searchInput.addEventListener("click", e => e.stopPropagation());
    // Re-render & focus search whenever dropdown opens
    drop._refreshSearch = () => { searchInput.value = ""; renderMapList(""); searchInput.focus(); };
}
buildMapSelectorDropdown();
// Set initial label
{
    const lbl = document.getElementById("mapSelLabel");
    if (lbl) lbl.textContent = MAPS[currentMapIdx].name;
}
document.getElementById("mapSelBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    const drop = document.getElementById("mapSelDropdown");
    const wasOpen = drop?.classList.contains("open");
    drop?.classList.toggle("open");
    if (!wasOpen && drop?._refreshSearch) drop._refreshSearch();
});
document.addEventListener("click", () => {
    document.getElementById("mapSelDropdown")?.classList.remove("open");
});

// ════════════════════════════════════════════════════════════════════
// TEXT CHANNELS (Vezha chat)
// ════════════════════════════════════════════════════════════════════
function renderChannelTabs() {
    const container = document.getElementById("vcChannelTabs");
    if (!container) return;
    // v2: single general channel only (rooms removed)
    const channels = [{ id: "general", label: "# GENERAL" }];

    container.innerHTML = "";
    channels.forEach(ch => {
        const tab = document.createElement("button");
        tab.className = "vc-channel-tab" + (ch.id === currentChannel ? " active" : "");
        tab.textContent = ch.label;
        tab.addEventListener("click", () => {
            // Save current draft before switching
            const inputEl = document.getElementById("vezhaChatInput");
            if (inputEl) channelDrafts[currentChannel] = inputEl.value;

            currentChannel = ch.id;
            // Clear and re-render messages for the new channel from cache
            const msgsEl = document.getElementById("vezhaChatMessages");
            if (msgsEl) {
                msgsEl.innerHTML = "";
                chatMsgCache
                    .filter(m => (m.data.channel || "general") === currentChannel)
                    .forEach(m => renderChatMessage(m.data));
                requestAnimationFrame(() => { msgsEl.scrollTop = msgsEl.scrollHeight; });
            }
            container.querySelectorAll(".vc-channel-tab").forEach((t, i) => {
                t.classList.toggle("active", channels[i].id === currentChannel);
            });
            // Restore draft for the new channel
            if (inputEl) inputEl.value = channelDrafts[currentChannel] || "";
        });
        container.appendChild(tab);
    });
}

// ════════════════════════════════════════════════════════════════════
// VEZHA STATUS SYNC (muted / deafened / streaming)
// ════════════════════════════════════════════════════════════════════
let _isMicMuted   = false;
let _isDeafened   = false;
let _isStreaming  = false;

async function updateMyVezhaStatus() {
    const ref = v2SessionRef || mySessionRef;
    if (!ref) return;
    try {
        await updateDoc(ref, {
            muted:     _isMicMuted,
            deafened:  _isDeafened,
            streaming: _isStreaming,
        });
    } catch (_) {}
}

// Patch shareScreen and stopSharing to update streaming status
const _origShareScreen = shareScreen;
const _origStopSharing = stopSharing;
// (We hook at call sites instead since they're async functions defined earlier)
document.getElementById("shareScreenBtn")?.addEventListener("click", async () => {
    _isStreaming = true;
    await updateMyVezhaStatus();
}, true); // capture — runs before the existing listener
document.getElementById("stopSharingBtn")?.addEventListener("click", async () => {
    _isStreaming = false;
    await updateMyVezhaStatus();
}, true);

// Patch mic/deafen toggles (search for existing listeners)
document.getElementById("micBtn")?.addEventListener("click", () => {
    // Toggle is determined by class — read state after a tick
    setTimeout(async () => {
        const btn = document.getElementById("micBtn");
        _isMicMuted = btn?.classList.contains("active") === false; // active = unmuted
        await updateMyVezhaStatus();
    }, 50);
});
document.getElementById("deafBtn")?.addEventListener("click", () => {
    setTimeout(async () => {
        const btn = document.getElementById("deafBtn");
        _isDeafened = btn?.classList.contains("active") === true;
        await updateMyVezhaStatus();
    }, 50);
});

// ─── ARTY EXPORT ──────────────────────────────────────────────────────────────
document.getElementById("artyExportBtn")?.addEventListener("click", async () => {
    // If 3D is active, export 3D view
    if (arty3DState) {
        try {
            const artyEl = document.getElementById("arty3DContainer") || document.querySelector(".arty-map-wrap");
            const W = artyEl?.clientWidth  || 900;
            const H = artyEl?.clientHeight || 600;
            const out = document.createElement("canvas");
            out.width = W; out.height = H;
            const oc = out.getContext("2d");
            arty3DState.drawCapture(oc, W, H);
            const link = document.createElement("a");
            link.download = `arty_3d_${Date.now()}.png`;
            link.href = out.toDataURL("image/png");
            link.click();
        } catch (err) { console.error("Arty 3D export failed", err); }
        return;
    }

    // 2D arty map export
    if (!artyMapInstance) return;
    const mapEl = document.getElementById("artyMapEl");
    const W = mapEl?.clientWidth  || 800;
    const H = mapEl?.clientHeight || 600;
    const out = document.createElement("canvas");
    out.width = W; out.height = H;
    const oc = out.getContext("2d");

    // 1. Base map
    await new Promise(res => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const tl = artyMapInstance.latLngToContainerPoint([imageHeight, 0]);
                const br = artyMapInstance.latLngToContainerPoint([0, imageWidth]);
                oc.drawImage(img, tl.x, tl.y, br.x - tl.x, br.y - tl.y);
            } catch (_) { oc.drawImage(img, 0, 0, W, H); }
            res();
        };
        img.onerror = () => res();
        img.src = MAPS[currentMapIdx].file;
    });

    // 2. G marker
    if (artyGunPx) {
        const pt = artyMapInstance.latLngToContainerPoint([artyGunPx.lat, artyGunPx.lng]);
        oc.beginPath(); oc.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
        oc.fillStyle = "#4ade80"; oc.fill();
        oc.strokeStyle = "rgba(0,0,0,0.7)"; oc.lineWidth = 2; oc.stroke();
        oc.font = "bold 11px monospace"; oc.fillStyle = "#111";
        oc.textAlign = "center"; oc.textBaseline = "middle";
        oc.fillText("G", pt.x, pt.y);
    }

    // 3. T marker
    if (artyTgtPx) {
        const pt = artyMapInstance.latLngToContainerPoint([artyTgtPx.lat, artyTgtPx.lng]);
        oc.beginPath(); oc.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
        oc.fillStyle = "#f87171"; oc.fill();
        oc.strokeStyle = "rgba(0,0,0,0.7)"; oc.lineWidth = 2; oc.stroke();
        oc.font = "bold 11px monospace"; oc.fillStyle = "#111";
        oc.textAlign = "center"; oc.textBaseline = "middle";
        oc.fillText("T", pt.x, pt.y);
    }

    // 4. Line G→T
    if (artyGunPx && artyTgtPx) {
        const g = artyMapInstance.latLngToContainerPoint([artyGunPx.lat, artyGunPx.lng]);
        const t = artyMapInstance.latLngToContainerPoint([artyTgtPx.lat, artyTgtPx.lng]);
        oc.beginPath(); oc.moveTo(g.x, g.y); oc.lineTo(t.x, t.y);
        oc.strokeStyle = "rgba(200,200,255,0.55)"; oc.lineWidth = 1.5;
        oc.setLineDash([5, 3]); oc.stroke(); oc.setLineDash([]);
    }

    const link = document.createElement("a");
    link.download = `arty_2d_${Date.now()}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
});
