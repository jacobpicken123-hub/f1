
// src/main.js — CLEAN + FULL (Seasons Save / View / Load fixed)
import './style.css';
import { initialRaces } from './sampleData.js';

const STORAGE_KEY = 'f1_demo_races_v7';
const DRIVERS_KEY = 'f1_demo_drivers_v1';
const TEAMS_KEY = 'f1_demo_teams_v1';
const RECORDS_KEY = 'f1_records_v1';
const SEASONS_KEY = 'f1_saved_seasons_v1';

const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// ----------------- tiny helpers -----------------
const db = window.db; // Firebase database reference

// Save to Firebase
function save(key, val) {
  if (!db) {
    console.error('Firebase not initialized');
    return Promise.resolve();
  }
  return db.ref(key).set(val).catch(err => {
    console.error('Save error:', err);
  });
}

// Load from Firebase once
async function load(key) {
  if (!db) {
    console.error('Firebase not initialized');
    return null;
  }
  try {
    const snapshot = await db.ref(key).once('value');
    return snapshot.val();
  } catch (err) {
    console.error('Load error:', err);
    return null;
  }
}

// Listen for real-time changes
function listen(key, callback) {
  if (!db) return;
  db.ref(key).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
}
function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fileToDataUrl(file) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); }); }
function deepClone(o) { try { return structuredClone(o); } catch (e) { return JSON.parse(JSON.stringify(o)); } }

// ----------------- initial state -----------------
let races = initialRaces.map(r => ({
  ...r,
  results: r.results.map(x => ({ ...x })),
  pole: { driver: "", points: 1 },
  fl: { driver: "", points: 1 },
  flag: r.flag || null,
  country: r.country || null
}));

let driverProfiles = {};
let teamProfiles = {};
let savedSeasons = [];
let records = { driverWins: {}, driverTitles: {}, teamWins: {}, teamTitles: {} };
// ADD THIS NEW FUNCTION (after state initialization):

async function loadInitialData() {
  console.log('🔥 Loading data from Firebase...');
  
  // Load all data from Firebase
  const loadedRaces = await load(STORAGE_KEY);
  const loadedDrivers = await load(DRIVERS_KEY);
  const loadedTeams = await load(TEAMS_KEY);
  const loadedSeasons = await load(SEASONS_KEY);
  const loadedRecords = await load(RECORDS_KEY);
  
  // Update state with loaded data
  if (loadedRaces) {
    races = loadedRaces;
    console.log('✅ Races loaded');
  }
  
  if (loadedDrivers) {
    driverProfiles = loadedDrivers;
    console.log('✅ Drivers loaded');
  }
  
  if (loadedTeams) {
    teamProfiles = loadedTeams;
    // Ensure all teams have color
    Object.keys(teamProfiles).forEach(k => {
      if (!teamProfiles[k].color) teamProfiles[k].color = '#e10600';
    });
    console.log('✅ Teams loaded');
  }
  
  if (loadedSeasons) {
    savedSeasons = loadedSeasons;
    console.log('✅ Seasons loaded');
  }
  
  if (loadedRecords) {
    records = loadedRecords;
    console.log('✅ Records loaded');
  }
  
  console.log('✅ All data loaded from Firebase');
  
  // Render the UI
  updateUI();
  
  // Set up real-time sync
  setupRealtimeSync();
}

// ===============================
// STEP 4: ADD REAL-TIME SYNC
// ===============================

// ADD THIS NEW FUNCTION (after loadInitialData):

function setupRealtimeSync() {
  console.log('🔥 Setting up real-time sync...');
  
  // Listen for race changes
  listen(STORAGE_KEY, (data) => {
    console.log('🔄 Races updated from Firebase');
    races = data;
    renderCalendarMenu();
    if (view === 'race') renderRaceResults();
    if (view === 'standings') renderStandingsMatrix();
    if (view === 'constructors') renderConstructors();
  });
  
  // Listen for driver profile changes
  listen(DRIVERS_KEY, (data) => {
    console.log('🔄 Drivers updated from Firebase');
    driverProfiles = data;
    if (view === 'drivers') renderDriversUI();
    if (view === 'race') renderRaceResults();
    if (view === 'driverStats') renderDriverStats();
  });
  
  // Listen for team profile changes
  listen(TEAMS_KEY, (data) => {
    console.log('🔄 Teams updated from Firebase');
    teamProfiles = data;
    if (view === 'drivers') renderDriversUI();
    if (view === 'race') renderRaceResults();
    if (view === 'constructors') renderConstructors();
  });
  
  // Listen for season changes
  listen(SEASONS_KEY, (data) => {
    console.log('🔄 Seasons updated from Firebase');
    savedSeasons = data || [];
    if (view === 'seasons') renderSeasonsPage();
  });
  
  // Listen for records changes
  listen(RECORDS_KEY, (data) => {
    console.log('🔄 Records updated from Firebase');
    records = data || { driverWins: {}, driverTitles: {}, teamWins: {}, teamTitles: {} };
    if (view === 'records') renderRecords();
  });
  
  console.log('✅ Real-time sync active');
}


let activeIndex = 0;
let view = 'race';

// ----------------- render DOM -----------------
const app = document.getElementById('app');
app.innerHTML = `
  <div class="container">
  <header class="topbar">
  <div class="brand">
    <div class="logo">F1</div>
    <div class="title">F1 — Race Results (Demo)</div>
  </div>
  <div class="actions">
    <!-- Calendar Dropdown -->
    <div class="dropdown">
      <button id="calendarBtn" class="btn calendar-btn">Race Calendar</button>
      <div id="calendarMenu" class="dropdown-menu"></div>
    </div>

    <!-- Standings & Championships -->
  

    <!-- Stats Dropdown ✅ NEW -->
    <div class="dropdown stats-dropdown">
      <button id="statsBtn" class="btn">Stats ▾</button>
      <div id="statsDropdownMenu" class="dropdown-menu"></div>
    </div>
<div class="dropdown tables-dropdown">
       <button id="tablesBtn" class="btn">Tables ▾</button>
       <div id="tablesDropdownMenu" class="dropdown-menu"></div>
     </div>
    <!-- Qualifying Dropdown -->
    <div class="dropdown qualifying-dropdown">
      <button id="qualifyingBtn" class="btn">Qualifying ▾</button>
      <div id="qualifyingDropdownMenu" class="dropdown-menu"></div>
    </div>

    <div class="dropdown season-dropdown">
       <button id="seasonManagementBtn" class="btn primary">Season ▾</button>
       <div id="seasonDropdownMenu" class="dropdown-menu"></div>
     </div>

    <!-- Management -->
    <button id="driversBtn" class="btn">Drivers</button>
    <button id="calendarManageBtn" class="btn">Calendar Manager</button>
    <button id="recordsBtn" class="btn">Records</button>

    <!-- Season Management -->
   
   

    <!-- Danger Zone -->
   
  </div>
</header
<button id="saveSeasonBtn" style="display:none;"></button>
     <button id="seasonsBtn" style="display:none;"></button>
     <button id="resetBtn" style="display:none;"></button>
     <button id="clearStorageBtn" style="display:none;"></button>
    <main class="main-area">
    <!-- Driver Stats Page -->
<section id="driverStatsView" class="panel" style="display:none;">
  <div class="standings-header">
    <h2>Driver Statistics</h2>
    <button id="backFromDriverStats" class="btn">Back</button>
  </div>
<div class="dropdown season-dropdown">
       <button id="seasonManagementBtn" class="btn primary">Season ▾</button>
       <div id="seasonDropdownMenu" class="dropdown-menu"></div>
     </div>
  <div id="driverStatsGrid" class="driver-stats-grid" 
       style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
       gap:20px;padding:20px;">
  </div>
</section>
<!-- Teammate Head-to-Head Comparison -->
<section id="teammatesView" class="panel" style="display:none;">
  <div class="teammate-header">
    <h2>Teammate Head-to-Head</h2>
    <div class="team-selector">
      <label>Select Team: </label>
      <select id="teammateTeamSelect"></select>
    </div>
    <button id="backFromTeammates" class="btn">Back</button>
  </div>
  <div id="teammateComparison" class="teammate-comparison"></div>
</section>
      <!-- Race view -->
      <section id="raceView" class="panel">
        <h2 id="raceTitle" class="race-title">Race</h2>
        <div class="table-wrap">
          <table class="standings-table"><thead><tr><th>#</th><th>Driver</th><th>Team</th><th>Points</th></tr></thead>
            <tbody id="resultsBody"></tbody>
          </table>
        </div>
        
        
        <div class="extras-section" id="extrasSection" style="display:none;">
          <div class="extra-row"><strong>Pole Position:</strong><input class="driver-edit pole-input" placeholder="Driver who got pole" /><span class="points-badge">+1</span></div>
          <div class="extra-row"><strong>Fastest Lap:</strong><input class="driver-edit fl-input" placeholder="Driver with fastest lap (must finish top 10)" /><span class="points-badge">+1</span></div>
        </div>

        <div class="add-form-wrap">
          <h3>Add driver to next empty slot</h3>
          <form id="addForm" class="add-form">
            <input id="nameInput" type="text" placeholder="Driver name" required />
            <select id="teamSelect"><option value="">— pick / auto —</option></select>
            <button class="btn primary" type="submit">Add</button>
          </form>
        </div>
      </section>
      <!-- Qualifying Results -->
      <section id="qualifyingView" class="panel" style="display:none;">
        <div class="standings-header">
          <h2 id="qualifyingTitle">Qualifying Results</h2>
          <button id="backFromQualifying" class="btn">Back</button>
        </div>
        <div class="qualifying-layout" style="display:flex;gap:20px;align-items:flex-start;">
          <div id="qualifyingRaceList" style="width:260px;background:#111;border:1px solid #333;border-radius:12px;padding:12px;max-height:75vh;overflow-y:auto;"></div>
          <div id="qualifyingRaceResults" style="flex:1;">
            <div class="qualifying-table-container" style="background:#0a0a0a;border-radius:8px;overflow:hidden;border:1px solid #222;">
              <table class="qualifying-table" style="width:100%;border-collapse:collapse;">
                <thead style="background:#1a1a1a;border-bottom:2px solid #e10600;">
                  <tr>
                    <th style="padding:15px;text-align:center;font-weight:600;color:#e10600;text-transform:uppercase;font-size:13px;letter-spacing:1px;width:80px;">Position</th>
                    <th style="padding:15px;text-align:left;font-weight:600;color:#e10600;text-transform:uppercase;font-size:13px;letter-spacing:1px;width:40%;">Driver</th>
                    <th style="padding:15px;text-align:center;font-weight:600;color:#e10600;text-transform:uppercase;font-size:13px;letter-spacing:1px;width:25%;">Team</th>
                    <th style="padding:15px;text-align:center;font-weight:600;color:#e10600;text-transform:uppercase;font-size:13px;letter-spacing:1px;width:200px;">Time</th>
                  </tr>
                </thead>
                <tbody id="qualifyingBody">
                  <tr>
                    <td colspan="4" style="text-align:center;padding:40px;color:#666;">
                      Please select a race from the dropdown above
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <!-- Records -->
      <section id="recordsView" class="panel" style="display:none;">
      <div class="records-hero">
      <div class="records-header">
  <h1 class="records-title">All-Time Records</h1>
  <div class="records-header-buttons">
      <button id="backFromRecords" class="btn back-btn">Back</button>
      <button id="editRecordsBtn" class="btn primary" style="display:none;">Edit Records</button>
  </div>
</div>
<!-- Teammate Head-to-Head Comparison -->
<section id="teammatesView" class="panel" style="display:none;">
  <div class="teammate-header">
    <div class="teammate-header">
    <h2>Teammate Head-to-Head</h2>
    <div class="team-selector">
      <label>Select Team: </label>
      <select id="teammateTeamSelect"></select>
    </div>
  </div>

  <div id="teammateComparison" class="teammate-comparison">
    <!-- Content injected by JS -->
  </div>
</section>

    
        <div class="records-grid">
          <!-- Driver Race Wins -->
          <div class="record-card">
            <div class="record-header">
              <h2>Most Race Wins — Drivers</h2>
            </div>
            <div class="record-body" id="driverWinsBody"></div>
          </div>
    
          <!-- Driver Championships -->
          <div class="record-card champion-card">
            <div class="record-header">
              <h2>World Championships — Drivers</h2>
            </div>
            <div class="record-body champion-body" id="driverTitlesBody"></div>
          </div>
    
          <!-- Team Race Wins -->
          <div class="record-card">
            <div class="record-header">
              <h2>Most Race Wins — Teams</h2>
            </div>
            <div class="record-body" id="teamWinsBody"></div>
          </div>
    
          <!-- Constructors Championships -->
          <div class="record-card champion-card">
            <div class="record-header">
              <h2>Constructors' Championships</h2>
            </div>
            <div class="record-body champion-body" id="teamTitlesBody"></div>
          </div>
        </div>
      </div>
    </section>
    <!-- RECORD DATA EDITOR PAGE -->
    <section id="recordDataView" class="panel" style="display:none;">
      <div class="page-header">
        <h1 class="page-title">Edit All-Time Records</h1>
        <button id="backFromRecordData" class="btn back-btn">Back</button>
      </div>
    
      <div class="record-data-container">
        <div class="record-form-card">
          <h2>Add / Update Record</h2>
          <form id="recordForm">
            <select id="recordType" required>
              <option value="">— Select Type —</option>
              <option value="driverWins">Driver Race Wins</option>
              <option value="driverTitles">Driver Championships</option>
              <option value="teamWins">Team Race Wins</option>
              <option value="teamTitles">Team Championships</option>
            </select>
    
            <input type="text" id="recordName" placeholder="Driver or Team Name" required />
            <input type="number" id="recordCount" placeholder="Number" min="0" required />
    
            <div class="form-actions">
              <button type="submit" class="btn primary">Save Record</button>
              <button type="button" id="clearRecordForm" class="btn">Clear</button>
            </div>
          </form>
        </div>
    
        <div class="record-list-editor">
          <h2>Current Records</h2>
          <div id="currentRecordsList"></div>
        </div>
      </div>
    </section>
      <!-- Seasons list -->
      <section id="seasonsView" class="panel" style="display:none;">
        <div class="standings-header"><h2>Previous Seasons</h2><button id="backFromSeasons" class="btn">Back</button></div>
        <div id="seasonsList" class="seasons-grid"></div>
      </section>

      <!-- Season results -->
      <section id="seasonResultsView" class="panel" style="display:none;">
        <div class="standings-header"><h2 id="seasonResultsTitle">Season Results</h2><button id="backFromSeasonResults" class="btn">Back</button></div>
        <div class="season-results-layout" style="display:flex;gap:20px;align-items:flex-start;">
          <div id="seasonRaceList" style="width:260px;background:#111;border:1px solid #333;border-radius:12px;padding:12px;max-height:75vh;overflow-y:auto;"></div>
          <div id="seasonRaceResults" style="flex:1;"></div>
        </div>
      </section>

      <!-- Standings -->
      <section id="standingsView" class="panel" style="display:none;">
        <div class="standings-header"><h2>Driver Standings</h2><div class="standings-controls"><button id="backBtn" class="btn">Back</button></div></div>
        <div class="standings-wrap"><table class="matrix-table"><thead id="matrixHead"></thead><tbody id="matrixBody"></tbody></table></div>
      </section>

      <!-- Constructors -->
      <section id="constructorsView" class="panel" style="display:none;">
        <div class="standings-header"><h2>Constructors Championship</h2><div class="standings-controls"><button id="backFromConstructors" class="btn">Back</button></div></div>
        <div class="standings-wrap"><table class="matrix-table"><thead id="constructorsHead"></thead><tbody id="constructorsBody"></tbody></table></div>
      </section>

      <!-- Calendar Manager -->
      <section id="calendarView" class="panel" style="display:none;">
        <div class="calendar-header"><h2>Edit Calendar</h2><div class="calendar-controls"><button id="saveCalendarBtn" class="btn primary">Save</button><button id="resetCalendarBtn" class="btn">Reset</button><button id="backFromCalendarBtn" class="btn">Back</button></div></div>
        <div class="calendar-wrap"><p class="muted">Drag to reorder • Click name to edit • Click flag to change</p><ul id="calendarList" class="calendar-list"></ul></div>
      </section>


      <!-- Drivers & Teams -->
      <section id="driversView" class="panel" style="display:none;">
        <div class="drivers-header"><h2>Drivers & Teams</h2><div class="drivers-controls"><button id="backFromDriversBtn" class="btn">Back</button></div></div>
        <div class="drivers-grid">
          <div class="drivers-column">
            <h3>Driver Profiles</h3>
            <form id="driverForm" class="driver-form">
              <input id="drvName" type="text" placeholder="Driver name" required />
              <select id="drvTeamSelect"><option value="">— team —</option></select>
              <label>Photo: <input id="drvPhoto" type="file" accept="image/*" /></label>
              <button class="btn" type="submit">Save Driver</button>
            </form>
            <ul id="driversList" class="profile-list"></ul>
          </div>
          <div class="teams-column">
            <h3>Team Profiles</h3>
            <form id="teamForm" class="team-form">
  <input id="teamName" type="text" placeholder="Team name" required />

  <label><label>Logo: <input id="teamLogo" type="file" accept="image/*" /></label>
  <label style="display:block;margin-top:8px;">Team Colour: <input id="teamColor" type="color" value="#e10600" /></label>
  <button class="btn" type="submit">Save Team</button>
  
  </label>
  

  <!-- ✅ ADD THIS HERE -->
  <label>Team Colour:
    <input id="teamColor" type="color" value="#e10600" />
  </label>
  <!-- ✅ END OF NEW FIELD -->

  <button class="btn" type="submit">Save Team</button>
</form>

            <ul id="teamsList" class="profile-list"></ul>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">F1 Fantasy • Flags • Constructors • Pole + FL • 100% Offline</footer>
  </div>
`;

// ----------------- refs -----------------
const calendarBtn = document.getElementById('calendarBtn'), calendarMenu = document.getElementById('calendarMenu');
const standingsBtn = document.getElementById('standingsBtn'), constructorsBtn = document.getElementById('constructorsBtn'), driversBtn = document.getElementById('driversBtn'), calendarManageBtn = document.getElementById('calendarManageBtn');
const resetBtn = document.getElementById('resetBtn'), clearStorageBtn = document.getElementById('clearStorageBtn');
const resultsBody = document.getElementById('resultsBody'), raceTitle = document.getElementById('raceTitle');
const extrasSection = document.getElementById('extrasSection');
const addForm = document.getElementById('addForm'), nameInput = document.getElementById('nameInput'), teamSelect = document.getElementById('teamSelect');
const raceView = document.getElementById('raceView'), standingsView = document.getElementById('standingsView'), constructorsView = document.getElementById('constructorsView'), calendarView = document.getElementById('calendarView'), driversView = document.getElementById('driversView');
const backBtn = document.getElementById('backBtn'), backFromConstructors = document.getElementById('backFromConstructors'), backFromCalendarBtn = document.getElementById('backFromCalendarBtn'), backFromDriversBtn = document.getElementById('backFromDriversBtn');
const matrixHead = document.getElementById('matrixHead'), matrixBody = document.getElementById('matrixBody');
const constructorsHead = document.getElementById('constructorsHead'), constructorsBody = document.getElementById('constructorsBody');
const calendarList = document.getElementById('calendarList'), saveCalendarBtn = document.getElementById('saveCalendarBtn'), resetCalendarBtn = document.getElementById('resetCalendarBtn');
const driverForm = document.getElementById('driverForm'), drvName = document.getElementById('drvName'), drvTeamSelect = document.getElementById('drvTeamSelect'), drvPhoto = document.getElementById('drvPhoto'), driversList = document.getElementById('driversList');
const teamForm = document.getElementById('teamForm'), teamName = document.getElementById('teamName'), teamLogo = document.getElementById('teamLogo'), teamsList = document.getElementById('teamsList');
const saveSeasonBtn = document.getElementById('saveSeasonBtn'), seasonsBtn = document.getElementById('seasonsBtn');

const seasonsView = document.getElementById('seasonsView'), seasonsList = document.getElementById('seasonsList'), backFromSeasons = document.getElementById('backFromSeasons');
const seasonManagementBtn = document.getElementById('seasonManagementBtn');
    const seasonDropdownMenu = document.getElementById('seasonDropdownMenu');
    const tablesBtn = document.getElementById('tablesBtn');
    const tablesDropdownMenu = document.getElementById('tablesDropdownMenu');

const seasonResultsView = document.getElementById('seasonResultsView'), seasonResultsTitle = document.getElementById('seasonResultsTitle'), seasonRaceList = document.getElementById('seasonRaceList'), seasonRaceResults = document.getElementById('seasonRaceResults'), backFromSeasonResults = document.getElementById('backFromSeasonResults');
const qualifyingView = document.getElementById('qualifyingView'), backFromQualifying = document.getElementById('backFromQualifying');


const recordsBtn = document.getElementById('recordsBtn'), recordsView = document.getElementById('recordsView'), backFromRecords = document.getElementById('backFromRecords');
const driverWinsBody = document.getElementById('driverWinsBody'), driverTitlesBody = document.getElementById('driverTitlesBody'), teamWinsBody = document.getElementById('teamWinsBody'), teamTitlesBody = document.getElementById('teamTitlesBody');

// ----------------- render helpers -----------------
function driverCellHtml(name){
  const prof = driverProfiles[name];
  if (!prof) return escapeHtml(name || '');

  const team = prof.team || '';
  const teamColor = teamProfiles[team]?.color || '#e10600';
  if (prof.photoDataUrl) {
    // inline style sets the CSS variable used by CSS rule to color the ring
    return `<img class="thumb driver-colored" src="${prof.photoDataUrl}" style="--team-color:${teamColor}" alt="" /> ${escapeHtml(name)}`;
  }
  return escapeHtml(name);
}



function teamCellHtml(name) {
  if (!name) return '-';

  const key = Object.keys(teamProfiles).find(
    t => t.toLowerCase() === (name || '').toLowerCase()
  );
  const t = key ? teamProfiles[key] : null;

  if (t?.logoDataUrl) {
    return `
      <span class="team-cell">
        <img class="team-logo" src="${t.logoDataUrl}" />
        ${escapeHtml(t.name)}
      </span>
    `;
  }

  return escapeHtml(name);
}


// ----------------- calendar menu & race render -----------------
function renderCalendarMenu() {
  calendarMenu.innerHTML = races.map((r, i) => `<div class="calendar-item" data-i="${i}">${escapeHtml(r.name)}</div>`).join('');
  calendarMenu.querySelectorAll('.calendar-item').forEach(el => el.onclick = () => { activeIndex = Number(el.dataset.i); calendarMenu.classList.remove('open'); showView('race'); updateUI(); });
}

function renderRaceResults() {
  const race = races[activeIndex] || { results: [] };
  raceTitle.textContent = race.name || `Race ${activeIndex + 1}`;

  const wrap = document.querySelector('.table-wrap');
  if (!wrap) {
    console.error('renderRaceResults: .table-wrap not found');
    return;
  }

  // Helper: big podium-style card (used for P1–P3, Pole, FL)
  const buildPodiumCard = (positionIndex, driverName = '', isExtra = false) => {
    const isPole = isExtra === 'pole';
    const isFL   = isExtra === 'fl';

    const name = (driverName || '').trim();
    const profile = driverProfiles[name] || {};
    const teamName = profile.team || '';
    const teamColor = teamProfiles[teamName]?.color || '#e10600';

    const photo = profile.photoDataUrl
      ? `<img src="${profile.photoDataUrl}" class="stat-thumb pod-thumb" style="--team-color:${teamColor}" alt="${escapeHtml(name)}" />`
      : `<div class="stat-thumb placeholder pod-thumb" style="--team-color:${teamColor}">?</div>`;

    let title, accentColor, icon;
    if (isPole) { title = 'Pole Position';  accentColor = '#FFD700'; icon = '[Pole]'; }
    else if (isFL) { title = 'Fastest Lap';     accentColor = '#B300E0';  icon = '[FL]'; }
    else { title = `#${positionIndex + 1}`;     accentColor = '#e10600'; icon = ''; }

    const pointsDisplay = isPole || isFL ? '+1' : (race.results[positionIndex]?.points ?? 0);

    return `
      <div class="podium-card ${isExtra ? 'extra-' + isExtra : 'pod-' + (positionIndex + 1)}"
           style="--accent-color:${accentColor}">
        <div class="pod-top" style="background:${accentColor}">
          <div class="pod-pos">${icon}${title}</div>
        </div>
        <div class="pod-body">
          <div class="pod-photo">${photo}</div>
          <div class="pod-text">
            <div class="pod-name">${escapeHtml(name || (isExtra ? '—' : 'Waiting...'))}</div>
            <div class="pod-team">${escapeHtml(teamName)}</div>
          </div>
          <div class="pod-points" style="color:${accentColor}">${pointsDisplay}</div>
        </div>
        <div class="pod-edit">
          ${isExtra
            ? `<input class="driver-edit ${isExtra}-input" type="text"
                      placeholder="${isPole ? 'Driver who got pole' : 'Driver with fastest lap'}"
                      value="${escapeHtml(name)}" />`
            : `<input class="driver-edit" data-index="${positionIndex}" type="text"
                      placeholder="Driver name..." value="${escapeHtml(name)}" />`
          }
        </div>
      </div>
    `;
  };

  // P1 – P3
  const podiumCards = [0, 1, 2]
    .map(i => buildPodiumCard(i, race.results[i]?.name || ''))
    .join('');

  // Pole + Fastest Lap cards
  const poleCard = buildPodiumCard(0, race.pole?.driver, 'pole');
  const flCard   = buildPodiumCard(0, race.fl?.driver,   'fl');

  // Middle list: positions 4 and below
  const middleRows = race.results
    .filter((_, i) => i >= 3)
    .map(slot => {
      const index = race.results.indexOf(slot);
      const name = (slot.name || '').trim();
      const profile = driverProfiles[name] || {};
      const teamName = slot.team || profile.team || '';
      const teamColor = teamProfiles[teamName]?.color || '#e10600';

      const photo = profile.photoDataUrl
        ? `<img src="${profile.photoDataUrl}" class="list-thumb" style="--team-color:${teamColor}" />`
        : `<div class="list-thumb placeholder" style="--team-color:${teamColor}">?</div>`;

      const teamLogo = teamProfiles[teamName]?.logoDataUrl
        ? `<img src="${teamProfiles[teamName].logoDataUrl}" class="team-logo" style="width:32px;height:32px;object-fit:contain;margin-left:8px;" />`
        : '';

      return `
        <div class="race-row">
          <div class="race-pos">${slot.pos || index + 1}</div>
          <div class="race-driver">
            ${photo}
            <div class="race-meta">
              <input class="driver-edit" data-index="${index}" value="${escapeHtml(name)}" placeholder="Driver..." />
            </div>
          </div>
          <div class="race-team-text">
            ${escapeHtml(teamName)}${teamLogo}
          </div>
          <div class="race-points">${slot.points ?? 0}</div>
        </div>
      `;
    }).join('');

  // Final HTML layout
  wrap.innerHTML = `
    <div class="race-layout-threecol" style="display:grid; gap:20px; max-width:1100px; margin:0 auto;">
      <!-- Left: Podium + Pole + FL -->
      <aside class="left-col" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:16px;">
        ${podiumCards}
        ${poleCard}
        ${flCard}
      </aside>

      <!-- Center: Rest of the field -->
      <main class="middle-col">
        <div class="middle-header">
          <div>#</div>
          <div>Driver</div>
          <div>Team</div>
          <div>Pts</div>
        </div>
        <div class="middle-list">
          ${middleRows || '<div class="muted">No more finishers</div>'}
        </div>
      </main>
    </div>
  `;

  // Hide old tiny inputs
  extrasSection.style.display = 'none';

  // Re-attach all edit handlers
  attachDriverEditHandlers();
  attachPoleFLHandlers();
}





function attachDriverEditHandlers() {
  document.querySelectorAll('.driver-edit:not(.pole-input):not(.fl-input)').forEach(input => {
    input.onchange = () => {
      const i = Number(input.dataset.index);
      const name = input.value.trim();
      races[activeIndex].results[i].name = name;
      if (driverProfiles[name]?.team) races[activeIndex].results[i].team = driverProfiles[name].team;
      const pos = races[activeIndex].results[i].pos - 1;
      races[activeIndex].results[i].points = F1_POINTS[pos] ?? 0;
      saveAndRefresh();
    };
  });
}

function attachPoleFLHandlers() {
  const poleInput = document.querySelector('.pole-input');
  const flInput = document.querySelector('.fl-input');
  if (poleInput) poleInput.onchange = () => { races[activeIndex].pole.driver = poleInput.value.trim(); saveAndRefresh(); };
  if (flInput) flInput.onchange = () => {
    const driver = flInput.value.trim();
    const pos = races[activeIndex].results.findIndex(r => (r.name || '').trim() === driver);
    if (driver && (pos === -1 || pos >= 10)) { alert("Fastest lap point only awarded if driver finished in top 10!"); flInput.value = races[activeIndex].fl.driver || ''; return; }
    races[activeIndex].fl.driver = driver;
    saveAndRefresh();
  };
}

// ----------------- standings matrix -----------------
function buildDrivers() {
  const map = new Map();
  races.forEach((race, rIndex) => {
    race.results.forEach(entry => {
      if (!entry.name?.trim()) return;
      const profile = driverProfiles[entry.name];
      const team = entry.team || profile?.team || '';
      if (!map.has(entry.name)) map.set(entry.name, { name: entry.name, team, points: 0, perRace: Array(races.length).fill(null) });
      const d = map.get(entry.name);
      d.perRace[rIndex] = entry.pos;
      d.points += entry.points || 0;
      if (race.pole?.driver?.trim() === entry.name) d.points += 1;
      if (race.fl?.driver?.trim() === entry.name && entry.pos <= 10) d.points += 1;
      if (!d.team && team) d.team = team;
    });
  });
  Object.values(driverProfiles).forEach(dp => { if (!map.has(dp.name)) map.set(dp.name, { name: dp.name, team: dp.team || '', points: 0, perRace: Array(races.length).fill(null) }); });
  return [...map.values()].sort((a, b) => b.points - a.points);
}

function renderStandingsMatrix() {
  const drivers = buildDrivers();
  const raceHeaders = races.map((r, i) => {
    const flagUrl = r.flag || `https://flagcdn.com/w40/${r.country || 'un'}.png`;
    const raceCode = (r.name || '').slice(0, 3).toUpperCase() || (i + 1);
    return `<th class="race-col" data-i="${i}" style="text-align:center;"><img src="${flagUrl}" alt="${raceCode}" class="race-flag" onerror="this.style.display='none'"><div style="margin-top:4px;font-size:10px;font-weight:600;">${escapeHtml(raceCode)}</div></th>`;
  }).join('');
  matrixHead.innerHTML = `<tr><th>#</th><th>Driver</th><th>Team</th><th>Pts</th>${raceHeaders}</tr>`;

  matrixBody.innerHTML = drivers.map((d, i) => {
    const rowCells = d.perRace.map((pos, raceIdx) => {
      if (!pos) return `<td class="empty">·</td>`;
      const race = races[raceIdx];
      const driverName = d.name.trim();
      const gotPole = race.pole?.driver?.trim() === driverName;
      const gotFastestLap = race.fl?.driver?.trim() === driverName;
      let style = "text-align:center;";
      if (gotPole && gotFastestLap) style += "color:#B300E0;font-weight:900;text-shadow:0 0 10px #B300E0,0 0 20px #FFD700;border:2px solid #FFD700;border-radius:4px;";
      else if (gotPole) style += "font-weight:800; color:#b8860b;";
      else if (gotFastestLap) style += "font-weight:800; color:#8a2be2;";
      return `<td style="${style}">${pos}</td>`;
    }).join('');
    return `<tr><td style="font-weight:bold;">${i + 1}</td><td>${driverCellHtml(d.name)}</td><td>${teamCellHtml(d.team)}</td><td style="font-weight:bold;font-size:18px;">${d.points}</td>${rowCells}</tr>`;
  }).join('');
}

// ----------------- constructors -----------------
function buildConstructors() {
  const teamMap = new Map();
  races.forEach((race, raceIndex) => {
    const teamPoints = new Map();
    race.results.forEach(e => { if (!e.team?.trim()) return; const tn = e.team.trim(); teamPoints.set(tn, (teamPoints.get(tn) || 0) + (e.points || 0)); });
    if (race.pole?.driver?.trim()) { const poleTeam = race.results.find(e => e.name?.trim() === race.pole.driver.trim())?.team?.trim(); if (poleTeam) teamPoints.set(poleTeam, (teamPoints.get(poleTeam) || 0) + 1); }
    if (race.fl?.driver?.trim()) { const flEntry = race.results.find(e => e.name?.trim() === race.fl.driver.trim()); if (flEntry && flEntry.pos <= 10) { const ft = flEntry.team?.trim(); if (ft) teamPoints.set(ft, (teamPoints.get(ft) || 0) + 1); } }
    teamPoints.forEach((pts, tn) => {
      if (!teamMap.has(tn)) teamMap.set(tn, { name: tn, points: 0, perRace: Array(races.length).fill(null) });
      const t = teamMap.get(tn); t.points += pts; t.perRace[raceIndex] = pts > 0 ? pts : null;
    });
  });
  Object.keys(teamProfiles).forEach(n => { if (!teamMap.has(n)) teamMap.set(n, { name: n, points: 0, perRace: Array(races.length).fill(null) }); });
  return [...teamMap.values()].sort((a, b) => b.points - a.points);
}

function renderConstructors() {
  const teams = buildConstructors();
  const raceHeaders = races.map((r, i) => {
    const flagUrl = r.flag || `https://flagcdn.com/w40/${r.country || 'un'}.png`;
    const raceCode = (r.name || '').slice(0, 3).toUpperCase() || (i + 1);
    return `<th class="race-col" data-i="${i}" style="text-align:center;"><img src="${flagUrl}" alt="${raceCode}" class="race-flag" onerror="this.style.display='none'"><div style="margin-top:4px;font-size:10px;font-weight:600;">${escapeHtml(raceCode)}</div></th>`;
  }).join('');
  constructorsHead.innerHTML = `<tr><th>#</th><th>Team</th><th>Pts</th>${raceHeaders}</tr>`;

  constructorsBody.innerHTML = teams.map((team, i) => {
    const p = teamProfiles[team.name] || {};
    const logo = p.logoDataUrl ? `<img src="${p.logoDataUrl}" class="team-logo-big" alt="">` : `<div style="width:48px;height:48px;background:#333;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#888;font-size:22px;font-weight:bold;">${escapeHtml(team.name[0] || '?')}</div>`;
    const cells = team.perRace.map(x => x !== null ? `<td style="text-align:center;font-weight:bold;">${x}</td>` : `<td class="empty">·</td>`).join('');
    return `<tr><td style="text-align:center;font-weight:bold;">${i + 1}</td><td style="display:flex;align-items:center;gap:14px;font-weight:600;">${logo}<span>${escapeHtml(team.name)}</span></td><td style="text-align:right;font-size:22px;font-weight:bold;color:#e10600;">${team.points}</td>${cells}</tr>`;
  }).join('');
}

// ----------------- calendar manager -----------------
function renderCalendarManager() {
  calendarList.innerHTML = races.map((r, i) => {
    const flagUrl = r.flag || `https://flagcdn.com/w160/${r.country || 'un'}.png`;
    return `<li class="calendar-item-draggable" draggable="true" data-i="${i}"><div class="drag-handle">Drag</div><img src="${flagUrl}" class="flag" alt="flag" onerror="this.src='https://flagcdn.com/w160/un.png'"><div class="track-name editable" data-i="${i}">${escapeHtml(r.name)}</div><button class="flag-picker" title="Change flag">Flag</button><div class="track-controls"><button class="btn small up">Up</button><button class="btn small down">Down</button></div></li>`;
  }).join('');

  calendarList.querySelectorAll('.track-name').forEach(el => {
    el.onclick = () => {
      const idx = Number(el.dataset.i);
      const input = document.createElement('input'); input.type = 'text'; input.value = races[idx].name;
      input.style.cssText = 'background:#000;color:white;border:1px solid #e10600;border-radius:6px;padding:6px;width:100%';
      el.replaceWith(input); input.focus();
      const finish = () => { races[idx].name = input.value.trim() || 'Grand Prix'; saveAndRefresh(); };
      input.onblur = finish; input.onkeydown = e => { if (e.key === 'Enter') finish(); };
    };
  });

  calendarList.querySelectorAll('.flag-picker').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const li = e.target.closest('li'); const idx = Number(li.dataset.i);
      const code = prompt("Country code (e.g. gb, it, jp, au, br, mc, ae):", races[idx].country || "gb");
      if (!code) return;
      const c = code.trim().toLowerCase();
      races[idx].flag = `https://flagcdn.com/w160/${c}.png`; races[idx].country = c; saveAndRefresh();
    };
  });

  // drag & drop simple
  let dragSrc = null;
  calendarList.querySelectorAll('li').forEach(item => {
    item.addEventListener('dragstart', () => { dragSrc = item; item.classList.add('dragging'); });
    item.addEventListener('dragend', () => { if (dragSrc) dragSrc.classList.remove('dragging'); dragSrc = null; });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      if (dragSrc && dragSrc !== item) {
        const nodes = [...calendarList.children];
        const s = nodes.indexOf(dragSrc), t = nodes.indexOf(item);
        if (s < t) calendarList.insertBefore(dragSrc, item.nextSibling); else calendarList.insertBefore(dragSrc, item);
      }
    });
  });

  calendarList.querySelectorAll('.up').forEach(b => b.onclick = e => { const li = e.target.closest('li'); const prev = li.previousElementSibling; if (prev) calendarList.insertBefore(li, prev); });
  calendarList.querySelectorAll('.down').forEach(b => b.onclick = e => { const li = e.target.closest('li'); const next = li.nextElementSibling; if (next) calendarList.insertBefore(next, li); });
}

function saveCalendarOrder() {
  const items = [...calendarList.children];
  races = items.map(li => {
    const idx = Number(li.dataset.i);
    const old = races[idx];
    const nameEl = li.querySelector('.track-name') || li.querySelector('input');
    const name = nameEl?.value || nameEl?.textContent || old.name;
    return { ...old, name: name.trim() };
  });
  save(STORAGE_KEY, races);
  renderCalendarMenu(); renderRaceResults(); if (view === 'standings') renderStandingsMatrix(); if (view === 'constructors') renderConstructors();
  alert('Calendar saved with flags!');
}

// ----------------- drivers & teams UI -----------------
function renderDriversUI() {
  const teams = Object.keys(teamProfiles || {});
  drvTeamSelect.innerHTML = `<option value=''>— team —</option>${teams.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}`;
  teamSelect.innerHTML = `<option value=''>— pick / auto —</option>${teams.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}`;

  driversList.innerHTML = Object.keys(driverProfiles).length === 0 ? `<li class="muted">No drivers saved</li>` :
    Object.values(driverProfiles).map(d => `<li class="profile-item" data-name="${escapeHtml(d.name)}"><div class="profile-photo">${d.photoDataUrl ? `<img src="${d.photoDataUrl}" class="thumb" />` : `<div class="no-thumb">?</div>`}</div><div class="profile-info"><div class="name">${escapeHtml(d.name)}</div><div class="team">${escapeHtml(d.team || '—')}</div></div><div class="profile-actions"><button class="btn small edit">Edit</button><button class="btn small danger delete">Delete</button></div></li>`).join('');

    teamsList.innerHTML = teams.length === 0
    ? `<li class="muted">No teams saved</li>`
    : Object.values(teamProfiles).map(t => `
        <li class="profile-item" data-name="${escapeHtml(t.name)}">
          <div class="profile-photo">
            ${
              t.logoDataUrl 
                ? `<img src="${t.logoDataUrl}" class="thumb" />`
                : `<div class="no-thumb">T</div>`
            }
          </div>
  
          <div class="profile-info">
            <div class="name">${escapeHtml(t.name)}</div>
          </div>
  
          <div class="profile-actions">
            <button class="btn small edit-team">Edit</button>
            <button class="btn small danger delete-team">Delete</button>
          </div>
        </li>
      `).join('');
  
  

  driversList.querySelectorAll('.edit').forEach(b => b.onclick = e => { const li = e.target.closest('li'), name = li.dataset.name, dp = driverProfiles[name]; if (dp) { drvName.value = dp.name; drvTeamSelect.value = dp.team || ''; } });
  driversList.querySelectorAll('.delete').forEach(b => b.onclick = e => { const name = e.target.closest('li').dataset.name; if (confirm(`Delete driver "${name}"?`)) { delete driverProfiles[name]; save(DRIVERS_KEY, driverProfiles); renderDriversUI(); } });

  teamsList.querySelectorAll('.edit-team').forEach(b => b.onclick = e => {
    const name = e.target.closest('li').dataset.name;
    teamName.value = name;
    // set color input to saved value (or default)
    const colorInput = document.getElementById('teamColor');
    if (colorInput) colorInput.value = teamProfiles[name]?.color || '#e10600';
  });
  
  teamsList.querySelectorAll('.delete-team').forEach(b => b.onclick = e => { const name = e.target.closest('li').dataset.name; if (confirm(`Delete team "${name}"?`)) { delete teamProfiles[name]; save(TEAMS_KEY, teamProfiles); renderDriversUI(); renderRaceResults(); } });
}

// ----------------- view switching -----------------
// ----------------- view switching (single, robust implementation) -----------------
function setupPanelButton(panelId) {
  const btn = document.getElementById(panelId.replace("panel-", "") + "Btn");
  const panel = document.getElementById(panelId);

  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    document.querySelectorAll(".panel").forEach(p => p.style.display = 'none');
    panel.style.display = "block";
  });
}

function showView(v) {
  // set current view
  view = v;

  // hide all main panels (safe if any are undefined)
  [
    raceView,
    standingsView,
    constructorsView,
    calendarView,
    driversView,
    recordsView,
    seasonsView,
    seasonResultsView,
    recordDataView,
    qualifyingView  // ✅ ADDED
  ].forEach(p => { if (p) p.style.display = 'none'; });

  // default: nothing visible, then show what we want
  if (v === 'race') {
    if (raceView) raceView.style.display = 'block';
  }

  if (v === 'standings') {
    if (standingsView) {
      standingsView.style.display = 'block';
      renderStandingsMatrix();
    }
  }

  if (v === 'constructors') {
    if (constructorsView) {
      constructorsView.style.display = 'block';
      renderConstructors();
    }
  }

  if (v === 'calendar') {
    if (calendarView) {
      calendarView.style.display = 'block';
      renderCalendarManager();
    }
  }

  if (v === 'drivers') {
    if (driversView) {
      driversView.style.display = 'block';
      renderDriversUI();
    }
  }

  if (v === 'records') {
    if (recordsView) {
      recordsView.style.display = 'block';
      renderRecords();
    }
  }

  if (v === 'seasons') {
    if (seasonsView) {
      seasonsView.style.display = 'block';
      renderSeasonsPage();
    }
  }

  if (v === 'seasonResults') {
    if (seasonResultsView) seasonResultsView.style.display = 'block';
  }

  // ✅ ADDED - Qualifying view
  if (v === 'qualifying') {
    if (qualifyingView) {
      qualifyingView.style.display = 'block';
      renderQualifying();
    }
  }

  // Record data editor view is special: show editor not the normal records panel
  if (v === 'recordData') {
    if (recordDataView) recordDataView.style.display = 'block';
    if (recordsView) recordsView.style.display = 'none';
  }

  // --------- Edit Records button visibility control ----------
  // hide by default (safe-check for existence)
  if (typeof editRecordsBtn !== 'undefined' && editRecordsBtn) editRecordsBtn.style.display = 'none';

  // only show the button on the Records page
  if (v === 'records') {
    if (typeof editRecordsBtn !== 'undefined' && editRecordsBtn) editRecordsBtn.style.display = 'inline-block';
  }
}

// ----------------- records -----------------
function renderRecords() {
  // auto wins/titles from current races
  const auto = { driverWins: {}, driverTitles: {}, teamWins: {}, teamTitles: {} };
  races.forEach(r => {
    if (!r.results[0]?.name?.trim()) return;
    const w = r.results[0].name.trim();
    const t = r.results[0].team?.trim() || 'Unknown';
    auto.driverWins[w] = (auto.driverWins[w] || 0) + 1;
    if (t !== 'Unknown') auto.teamWins[t] = (auto.teamWins[t] || 0) + 1;
  });

  // compute driver/ team points for titles (only if you want)
  const driverPts = {}, teamPts = {};
  races.forEach(r => r.results.forEach(e => {
    if (!e.name?.trim()) return;
    driverPts[e.name] = (driverPts[e.name] || 0) + (e.points || 0);
    if (e.team?.trim()) teamPts[e.team] = (teamPts[e.team] || 0) + (e.points || 0);
    if (r.pole?.driver?.trim() === e.name) driverPts[e.name] += 1;
    if (r.fl?.driver?.trim() === e.name && e.pos <= 10) driverPts[e.name] += 1;
  }));

  // Merge display values: auto (from race data) + manual records stored in `records`
  function combinedMap(autoMap, manualMap) {
    const out = {};
    const keys = new Set([...Object.keys(autoMap || {}), ...Object.keys(manualMap || {})]);
    keys.forEach(k => out[k] = (autoMap[k] || 0) + (manualMap[k] || 0));
    return out;
  }

  const displayDriverWins = combinedMap(auto.driverWins, records.driverWins || {});
  const displayTeamWins = combinedMap(auto.teamWins, records.teamWins || {});

  // utility to render top N list
  function renderList(mapObj, containerEl, opts = { top: 3, isChampion: false, label: 'wins' }) {
    if (!containerEl) return;
  
    const entries = Object.entries(mapObj);
    if (!entries.length) {
      containerEl.innerHTML = `<div class="muted">No records</div>`;
      return;
    }
  
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const top = entries.slice(0, opts.top);
  
    containerEl.innerHTML = top.map(([name, val]) => {
      let thumb = "";
  
      // ----------------------------
      // FIXED IMAGE LOOKUP
      // ----------------------------
      if (
        containerEl.id === "driverWinsBody" ||
        containerEl.id === "driverTitlesBody"
      ) {
        // DRIVER (wins or championships)
        const p = driverProfiles[name];
        if (p?.photoDataUrl) thumb = p.photoDataUrl;
      }
  
      if (
        containerEl.id === "teamWinsBody" ||
        containerEl.id === "teamTitlesBody"
      ) {
        // TEAM (wins or championships)
        const t = teamProfiles[name];
        if (t?.logoDataUrl) thumb = t.logoDataUrl;
      }
  
      // fallback placeholder
      if (!thumb) thumb = "/default-logo.png"; // optional fallback image
  
      const sub = "";

  
      return `
        <div class="record-item ${opts.isChampion ? 'champion' : ''}">
          <div class="rec-thumb"><img src="${thumb}" /></div>
          <div class="rec-text">
            <div class="rec-name">${escapeHtml(name)}</div>
            <div class="rec-sub">${escapeHtml(sub)}</div>
          </div>
          <div class="rec-number">${val}</div>
        </div>
      `;
    }).join('');
  }
  
  // render top 3 drivers and top 3 teams
  renderList(displayDriverWins, driverWinsBody, { top: 3, isChampion: false, label: 'wins' });
  renderList(displayTeamWins, teamWinsBody, { top: 3, isChampion: false, label: 'wins' });

  // Titles (championship counts) - use the stored manual records (records.driverTitles / records.teamTitles)
  // show top 3 champions (if present)
  const driverTitlesDisplay = records.driverTitles || {};
  const teamTitlesDisplay = records.teamTitles || {};
  // sort and show top 3 (render as champion style)
  renderList(driverTitlesDisplay, driverTitlesBody, { top: 3, isChampion: true, label: 'champion' });
  renderList(teamTitlesDisplay, teamTitlesBody, { top: 3, isChampion: true, label: 'champion' });

  // persist manual records only (don't overwrite)
  save(RECORDS_KEY, records);
}


// ----------------- seasons: save / list / view / load -----------------
function getChampionName() {
  const pts = {};
  races.forEach(r => r.results.forEach(e => {
    if (!e.name?.trim()) return;
    let p = (e.points || 0);
    if (r.pole?.driver === e.name) p += 1;
    if (r.fl?.driver === e.name && e.pos <= 10) p += 1;
    pts[e.name] = (pts[e.name] || 0) + p;
  }));
  return Object.entries(pts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}
function getConstructorsChampionName() {
  let teamPoints = {};

  races.forEach(r => {
    r.results.forEach(slot => {
      if (!slot.team) return;
      teamPoints[slot.team] = (teamPoints[slot.team] || 0) + slot.points;
    });
  });

  const top = Object.entries(teamPoints).sort((a,b)=>b[1]-a[1])[0];
  return top ? top[0] : null;
}

// Save current season (keeps driver/team profiles — clears names & points for a fresh season)
saveSeasonBtn?.addEventListener('click', () => {
  if (!confirm('Save current season and start a new one?')) return;

  // -----------------------------
  // ⭐ 1. Capture this season’s AUTO wins before resetting races
  // -----------------------------
  const seasonAuto = { driverWins: {}, teamWins: {} };

  races.forEach(r => {
    if (!r.results[0]?.name?.trim()) return;

    const winner = r.results[0].name.trim();
    const team = r.results[0].team?.trim();

    seasonAuto.driverWins[winner] = (seasonAuto.driverWins[winner] || 0) + 1;
    if (team) {
      seasonAuto.teamWins[team] = (seasonAuto.teamWins[team] || 0) + 1;
    }
  });

  // -----------------------------
  // ⭐ 2. Add these wins permanently to manual records
  // -----------------------------
  Object.entries(seasonAuto.driverWins).forEach(([name, count]) => {
    records.driverWins[name] = (records.driverWins[name] || 0) + count;
  });

  Object.entries(seasonAuto.teamWins).forEach(([team, count]) => {
    records.teamWins[team] = (records.teamWins[team] || 0) + count;
  });

  // -----------------------------
  // ⭐ 3. Calculate & record titles
  // -----------------------------
  const champion = getChampionName();
  const championTeam = getConstructorsChampionName();

  if (champion) {
    records.driverTitles[champion] = (records.driverTitles[champion] || 0) + 1;
  }

  if (championTeam) {
    records.teamTitles[championTeam] = (records.teamTitles[championTeam] || 0) + 1;
  }

  save(RECORDS_KEY, records);

  // -----------------------------
  // ⭐ 4. Save the season snapshot
  // -----------------------------
  const seasonObj = {
    name: champion ? `${new Date().getFullYear()} — Champion: ${champion}` : `${new Date().getFullYear()} Season`,
    date: new Date().toLocaleDateString('en-GB'),
    races: deepClone(races),
    driverProfiles: deepClone(driverProfiles),
    teamProfiles: deepClone(teamProfiles),
    records: deepClone(records)
  };

  savedSeasons.unshift(seasonObj);
  save(SEASONS_KEY, savedSeasons);

  // -----------------------------
  // ⭐ 5. Reset races (new season)
  // -----------------------------
  races = races.map(r => ({
    ...r,
    results: r.results.map(slot => ({
      pos: slot.pos,
      name: "",
      team: "",
      points: F1_POINTS[(slot.pos || 1) - 1] ?? 0
    })),
    pole: { driver: "" },
    fl: { driver: "" }
  }));
  activeIndex = 0;
  save(STORAGE_KEY, races);

  alert(`Season saved!\nNew season started.`);
  updateUI();
});
;

// Load saved season (confirmation)
function loadSavedSeason(season) {
  if (!confirm(`Load season:\n"${season.name}"\nSaved on ${season.date}?`)) return;
  races = deepClone(season.races);
  driverProfiles = deepClone(season.driverProfiles || {});
  teamProfiles = deepClone(season.teamProfiles || {});
  records = deepClone(season.records || { driverWins: {}, driverTitles: {}, teamWins: {}, teamTitles: {} });

  save(STORAGE_KEY, races);
  save(DRIVERS_KEY, driverProfiles);
  save(TEAMS_KEY, teamProfiles);
  save(RECORDS_KEY, records);

  activeIndex = 0;
  alert(`Season loaded: ${season.name}`);
  showView('race');
  updateUI();
}
function removeSeasonFromRecords(season) {
  if (!season) return;

  // ----------------------------------------
  // REMOVE DRIVER WINS FROM THIS SEASON ONLY
  // ----------------------------------------
  season.races.forEach(r => {
    if (!r.results || !r.results[0]?.name?.trim()) return;

    const winner = r.results[0].name.trim();
    if (records.driverWins[winner] != null) {
      records.driverWins[winner] -= 1;
      if (records.driverWins[winner] <= 0) delete records.driverWins[winner];
    }

    const team = r.results[0].team?.trim();
    if (team && records.teamWins[team] != null) {
      records.teamWins[team] -= 1;
      if (records.teamWins[team] <= 0) delete records.teamWins[team];
    }
  });

  // ------------------------------------------------
  // RE-CALCULATE WHO THE CHAMPION WAS FOR THAT SEASON
  // ------------------------------------------------
  const seasonDriverPoints = {};
  const seasonTeamPoints = {};

  season.races.forEach(r => {
    r.results.forEach(e => {
      if (!e.name?.trim()) return;

      let pts = e.points || 0;
      if (r.pole?.driver === e.name) pts += 1;
      if (r.fl?.driver === e.name && e.pos <= 10) pts += 1;

      seasonDriverPoints[e.name] = (seasonDriverPoints[e.name] || 0) + pts;

      if (e.team) {
        seasonTeamPoints[e.team] = (seasonTeamPoints[e.team] || 0) + pts;
      }
    });
  });

  // driver champion
  const driverChampion = Object.entries(seasonDriverPoints).sort((a,b)=>b[1]-a[1])[0]?.[0];
  if (driverChampion && records.driverTitles[driverChampion] != null) {
    records.driverTitles[driverChampion] -= 1;
    if (records.driverTitles[driverChampion] <= 0) delete records.driverTitles[driverChampion];
  }

  // constructor champion
  const teamChampion = Object.entries(seasonTeamPoints).sort((a,b)=>b[1]-a[1])[0]?.[0];
  if (teamChampion && records.teamTitles[teamChampion] != null) {
    records.teamTitles[teamChampion] -= 1;
    if (records.teamTitles[teamChampion] <= 0) delete records.teamTitles[teamChampion];
  }

  save(RECORDS_KEY, records);
}


// Render seasons list with Load + View buttons wired
function renderSeasonsPage() {
  if (!seasonsList) return;
  if (!savedSeasons || savedSeasons.length === 0) {
    seasonsList.innerHTML = `<p style="text-align:center;color:#888;margin:60px 0">No saved seasons yet</p>`;
    return;
  }
  seasonsList.innerHTML = savedSeasons.map((s, i) => `
    <div class="season-card" data-index="${i}">
      <div class="season-info"><strong>${escapeHtml(s.name)}</strong><div class="season-date">Saved: ${s.date} • ${s.races.length} races</div></div>
      <div style="margin-top:8px;">
      <button class="btn primary small load-season-btn" data-i="${i}">Load</button>
      <button class="btn small view-season-btn" data-i="${i}">View</button>
      <button class="btn danger small delete-season-btn" data-i="${i}">Delete</button>
    </div>
    
    </div>
  `).join('');

  seasonsList.querySelectorAll('.load-season-btn').forEach(btn => btn.onclick = () => loadSavedSeason(savedSeasons[Number(btn.dataset.i)]));
  seasonsList.querySelectorAll('.view-season-btn').forEach(btn => btn.onclick = () => showSeasonResults(savedSeasons[Number(btn.dataset.i)]));
  // Delete season
// Delete season
seasonsList.querySelectorAll('.delete-season-btn').forEach(btn => {
  btn.onclick = () => {
    const i = Number(btn.dataset.i);
    const s = savedSeasons[i];

    if (!confirm(`Delete saved season:\n"${s.name}"?\n\nThis will also remove any wins or championships this season added to the records.`))
      return;

    // ⭐ Remove wins/titles this season added
    removeSeasonFromRecords(s);

    // Remove season
    savedSeasons.splice(i, 1);
    save(SEASONS_KEY, savedSeasons);

    // Refresh UI
    renderSeasonsPage();
    renderRecords();
  };
});
};



// Show a saved season's races and results (left list + right details)
function showSeasonResults(season) {
  if (!season) return;
  seasonResultsTitle.textContent = season.name;
  seasonRaceList.innerHTML = '';
  seasonRaceResults.innerHTML = '';

  season.races.forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'race-list-item';
    div.style.padding = '8px';
    div.style.cursor = 'pointer';
    div.dataset.i = idx;
    div.textContent = `${idx + 1}. ${r.name || `Race ${idx + 1}`}`;
    div.onclick = () => {
      renderSavedRace(r);
      seasonRaceList.querySelectorAll('.race-list-item').forEach(x => x.style.background = '');
      div.style.background = '#222';
    };
    seasonRaceList.appendChild(div);
  });

  if (season.races.length) seasonRaceList.querySelector('.race-list-item')?.click();
  else seasonRaceResults.innerHTML = `<p class="muted">No races in this season.</p>`;

  showView('seasonResults');
}

function addTitleToRecords(championDriver, championTeam) {
  // Driver world titles
  if (championDriver) {
    records.driverTitles[championDriver] =
      (records.driverTitles[championDriver] || 0) + 1;
  }

  // Constructors titles
  if (championTeam) {
    records.teamTitles[championTeam] =
      (records.teamTitles[championTeam] || 0) + 1;
  }

  save("f1_records", records);
}

function renderSavedRace(race) {
  if (!race) { seasonRaceResults.innerHTML = ''; return; }
  seasonRaceResults.innerHTML = `
    <h3 style="margin-top:0">${escapeHtml(race.name)}</h3>
    <table class="standings-table" style="width:100%;border-collapse:collapse">
      <thead><tr><th>#</th><th>Driver</th><th>Team</th><th>Pts</th></tr></thead>
      <tbody>
        ${race.results.map(rs => `<tr><td>${rs.pos}</td><td>${escapeHtml(rs.name)}</td><td>${escapeHtml(rs.team || '')}</td><td>${rs.points ?? 0}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}

// ----------------- small helpers -----------------
function saveAndRefresh() {
  save(STORAGE_KEY, races);
  renderCalendarMenu();
  renderRaceResults();
  if (view === 'standings') renderStandingsMatrix();
  if (view === 'constructors') renderConstructors();
  if (view === 'records') renderRecords();
}
function updateUI() {
  renderCalendarMenu();
  renderRaceResults();
  renderDriversUI();
  renderConstructors();
  renderRecords();
  renderSeasonsPage();
}

// ----------------- event wiring -----------------
calendarBtn.addEventListener('click', () => calendarMenu.classList.toggle('open'));
document.addEventListener('click', e => { if (!calendarMenu.contains(e.target) && !calendarBtn.contains(e.target)) calendarMenu.classList.remove('open'); });


driversBtn.onclick = () => showView('drivers');
calendarManageBtn.onclick = () => showView('calendar');
recordsBtn.onclick = () => showView('records');
seasonsBtn.onclick = () => { renderSeasonsPage(); showView('seasons'); };

backFromRecords?.addEventListener('click', () => showView('race'));
backFromQualifying?.addEventListener('click', () => showView('race'));
backBtn.onclick = backFromCalendarBtn.onclick = backFromDriversBtn.onclick = backFromConstructors.onclick = () => showView('race');

resetBtn.onclick = () => { if (confirm('Reset all race data?')) { localStorage.removeItem(STORAGE_KEY); location.reload(); } };
clearStorageBtn.onclick = () => { if (confirm('Delete ALL saved data?')) { localStorage.clear(); location.reload(); } };

saveCalendarBtn.onclick = saveCalendarOrder;
resetCalendarBtn.onclick = () => { races = initialRaces.map(r => ({ ...r, results: r.results.map(x => ({ ...x })), pole: { driver: "" }, fl: { driver: "" } })); save(STORAGE_KEY, races); renderCalendarManager(); renderCalendarMenu(); };

matrixHead.onclick = e => { const cell = e.target.closest('th.race-col'); if (cell) { activeIndex = Number(cell.dataset.i); showView('race'); } };

addForm.onsubmit = e => {
  e.preventDefault();
  const name = nameInput.value.trim(), forcedTeam = teamSelect.value;
  if (!name) return alert('Enter driver name');
  const race = races[activeIndex];
  const empty = race.results.findIndex(r => !r.name.trim());
  if (empty === -1) return alert('All slots filled');
  const profile = driverProfiles[name];
  race.results[empty].name = name;
  race.results[empty].team = profile?.team || forcedTeam || '';
  race.results[empty].points = F1_POINTS[empty] ?? 0;
  saveAndRefresh();
  nameInput.value = ''; teamSelect.value = '';
};

// driver/team save forms
driverForm.onsubmit = async e => {
  e.preventDefault();
  const name = drvName.value.trim(), team = drvTeamSelect.value;
  if (!name) return alert('Name required');
  let photo = driverProfiles[name]?.photoDataUrl || null;
  if (drvPhoto.files[0]) photo = await fileToDataUrl(drvPhoto.files[0]);
  driverProfiles[name] = { name, team, photoDataUrl: photo };
  save(DRIVERS_KEY, driverProfiles);
  if (team && !teamProfiles[team]) teamProfiles[team] = { name: team };
  save(TEAMS_KEY, teamProfiles);
  renderDriversUI(); renderRaceResults();
  drvName.value = ''; drvTeamSelect.value = ''; drvPhoto.value = '';
};

teamForm.onsubmit = async e => {
  e.preventDefault();
  const name = teamName.value.trim();
  if (!name) return alert('Team name required');

  // load previous logo/color if present
  let logo = teamProfiles[name]?.logoDataUrl || null;
  let color = teamProfiles[name]?.color || '#e10600';

  if (teamLogo.files[0]) {
    logo = await fileToDataUrl(teamLogo.files[0]);
  }
  // read color input
  const colorInput = document.getElementById('teamColor');
  if (colorInput && colorInput.value) color = colorInput.value;

  teamProfiles[name] = { name, logoDataUrl: logo, color };
  save(TEAMS_KEY, teamProfiles);
  renderDriversUI(); renderRaceResults(); renderDriversUI(); // refresh
  // clear form
  teamName.value = ''; teamLogo.value = ''; if (colorInput) colorInput.value = '#e10600';
};


// record small buttons (if present in markup)
document.getElementById('addDriverWin')?.addEventListener('click', () => {
  const n = document.getElementById('recordDriverName')?.value?.trim();
  if (n) { records.driverWins[n] = (records.driverWins[n] || 0) + 1; save(RECORDS_KEY, records); renderRecords(); document.getElementById('recordDriverName').value = ''; }
});
document.getElementById('addDriverTitle')?.addEventListener('click', () => {
  const n = document.getElementById('recordDriverChampName')?.value?.trim();
  if (n) { records.driverTitles[n] = (records.driverTitles[n] || 0) + 1; save(RECORDS_KEY, records); renderRecords(); document.getElementById('recordDriverChampName').value = ''; }
});
document.getElementById('addTeamWin')?.addEventListener('click', () => {
  const n = document.getElementById('recordTeamName')?.value?.trim();
  if (n) { records.teamWins[n] = (records.teamWins[n] || 0) + 1; save(RECORDS_KEY, records); renderRecords(); document.getElementById('recordTeamName').value = ''; }
});
document.getElementById('addTeamTitle')?.addEventListener('click', () => {
  const n = document.getElementById('recordTeamChampName')?.value?.trim();
  if (n) { records.teamTitles[n] = (records.teamTitles[n] || 0) + 1; save(RECORDS_KEY, records); renderRecords(); document.getElementById('recordTeamChampName').value = ''; }
});



// ----------------- RECORD DATA EDITOR LOGIC -----------------

const recordDataView = document.getElementById("recordDataView");
const backFromRecordData = document.getElementById("backFromRecordData");
const recordForm = document.getElementById("recordForm");
const recordType = document.getElementById("recordType");
const recordName = document.getElementById("recordName");
const recordCount = document.getElementById("recordCount");
const clearRecordForm = document.getElementById("clearRecordForm");
const currentRecordsList = document.getElementById("currentRecordsList");

// Create a button to access editor inside records page
const editRecordsBtn = document.getElementById("editRecordsBtn");


editRecordsBtn.onclick = () => {
  showView("recordData");
  renderRecordEditorList();
};

// Show the editor view
function showViewRecordEditor() {
  showView("recordData");
  renderRecordEditorList();
}

// Render current records in editor
function renderRecordEditorList() {
  const sections = [
    ["Driver Race Wins", "driverWins"],
    ["Driver Championships", "driverTitles"],
    ["Team Race Wins", "teamWins"],
    ["Team Championships", "teamTitles"]
  ];

  currentRecordsList.innerHTML = sections.map(([label, key]) => {
    const entries = Object.entries(records[key] || {});
    return `
      <div class="record-edit-block">
        <h3>${label}</h3>
        ${
          entries.length
            ? entries
                .map(
                  ([name, count]) => `
          <div class="record-edit-row">
            <span class="rec-name">${escapeHtml(name)}</span>
            <span class="rec-count">${count}</span>
            <button class="btn small" onclick="editRecord('${key}','${escapeHtml(
                    name
                  )}', ${count})">Edit</button>
            <button class="btn small danger" onclick="deleteRecord('${key}','${escapeHtml(
                    name
                  )}')">Delete</button>
          </div>`
                )
                .join("")
            : `<p class="muted">None</p>`
        }
      </div>
    `;
  }).join("");
}

// Expose functions globally (for inline onclick)
window.editRecord = function (key, name, count) {
  recordType.value = key;
  recordName.value = name;
  recordCount.value = count;
  showView("recordData");
};

window.deleteRecord = function (key, name) {
  if (!confirm(`Delete record for "${name}"?`)) return;

  delete records[key][name];
  save(RECORDS_KEY, records);
  renderRecordEditorList();
  renderRecords();
};

// Submit save/update
recordForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = recordType.value;
  const name = recordName.value.trim();
  const num = Number(recordCount.value);

  if (!type || !name || isNaN(num)) return alert("Fill all fields");

  records[type][name] = num;

  save(RECORDS_KEY, records);
  renderRecordEditorList();
  renderRecords();

  recordType.value = "";
  recordName.value = "";
  recordCount.value = "";
});

// Clear form
clearRecordForm.onclick = () => {
  recordType.value = "";
  recordName.value = "";
  recordCount.value = "";
};

// back button
backFromRecordData.onclick = () => showView("records");

// Extend view controller
const oldShowView = showView;
showView = function (v) {
  oldShowView(v);
  if (v === "recordData") {
    recordDataView.style.display = "block";
    recordsView.style.display = "none";
  }
};

// seasons/back buttons
seasonsBtn?.addEventListener('click', () => { renderSeasonsPage(); showView('seasons'); });
backFromSeasonResults?.addEventListener('click', () => showView('seasons'));
backFromSeasons?.addEventListener('click', () => showView('race'));


// ----------------- DRIVER STATS VIEW -----------------
// Refs for driver stats view + button
const driverStatsBtn = document.getElementById('driverStatsBtn');
const driverStatsView = document.getElementById('driverStatsView');
const driverStatsGrid = document.getElementById('driverStatsGrid');
const backFromDriverStats = document.getElementById('backFromDriverStats');
statsBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  
  if (!statsDropdownMenu) {
    console.error('statsDropdownMenu not found');
    return;
  }
  
  const isOpen = statsDropdownMenu.classList.contains('open');
  
  // Close all other dropdowns first
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('open');
  });
  
  if (!isOpen) {
    statsDropdownMenu.classList.add('open');
    renderStatsDropdownMenu();
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.stats-dropdown');
  if (!dropdown?.contains(e.target)) {
    statsDropdownMenu?.classList.remove('open');
  }
});

// Render stats dropdown menu
function renderStatsDropdownMenu() {
  if (!statsDropdownMenu) return;
  
  const items = [
    { label: '📊 Driver Statistics', view: 'driverStats', icon: '📊' },
    { label: '🤝 Teammate Head-to-Head', view: 'teammates', icon: '🤝' },
    // Add more stats options here in the future
    // { label: '📈 Season Progress', view: 'seasonProgress', icon: '📈' },
  ];
  
  statsDropdownMenu.innerHTML = items.map(item => `
    <div class="stats-dropdown-item" data-view="${item.view}" 
         style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px;transition:background 0.2s;">
      <span style="font-size:20px;">${item.icon}</span>
      <span>${escapeHtml(item.label)}</span>
    </div>
  `).join('');
  
  // Attach click handlers
  statsDropdownMenu.querySelectorAll('.stats-dropdown-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.background = '#222';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
    
    item.onclick = (e) => {
      e.stopPropagation();
      const viewName = item.dataset.view;
      statsDropdownMenu.classList.remove('open');
      
      if (viewName === 'driverStats') {
        showView('driverStats');
        renderDriverStats();
      } else if (viewName === 'teammates') {
        showView('teammates');
        renderTeammateSelector();
      }
    };
  });
}
// compute summary stats for each driver (from current races)
function computeDriverStats() {
  const map = new Map();

  races.forEach((race, raceIdx) => {
    // pole / fastest lap ropes
    const poleDriver = (race.pole?.driver || '').trim();
    const flDriver = (race.fl?.driver || '').trim();

    race.results.forEach(slot => {
      const name = (slot.name || '').trim();
      if (!name) return;

      if (!map.has(name)) {
        map.set(name, {
          name,
          team: slot.team || driverProfiles[name]?.team || '',
          wins: 0,
          podiums: 0,
          top10: 0,
          poles: 0,
          fastestLaps: 0,
          pointsTotal: 0,
          racesCount: 0,
          finishSum: 0,   // sum of positional finishes for avg finish
        });
      }

      const d = map.get(name);
      d.racesCount += 1;
      const pos = Number(slot.pos) || null;
      if (pos === 1) d.wins += 1;
      if (pos && pos <= 3) d.podiums += 1;
      if (pos && pos <= 10) d.top10 += 1;
      if (typeof slot.points === 'number') d.pointsTotal += slot.points;
      if (pos) d.finishSum += pos;
    });

    // award pole / fastest lap to drivers if they exist in map
    if (poleDriver) {
      const d = map.get(poleDriver) || null;
      if (d) d.poles += 1;
    }
    if (flDriver) {
      const d = map.get(flDriver) || null;
      if (d) d.fastestLaps += 1;
    }
  });

  // convert to array and compute averages
  const arr = [...map.values()].map(d => {
    return {
      ...d,
      avgPoints: d.racesCount ? d.pointsTotal / d.racesCount : 0,
      avgFinish: d.racesCount ? d.finishSum / d.racesCount : Infinity
    };
  });

  return arr;
}

// pick top performer for metric (returns object or null)
function pickTop(arr, metric, desc = true) {
  if (!arr || arr.length === 0) return null;
  const sorted = arr.slice().sort((a,b) => {
    if (a[metric] === b[metric]) return a.name.localeCompare(b.name);
    return desc ? b[metric] - a[metric] : a[metric] - b[metric];
  });
  return sorted[0] || null;
}

// render the full driver stats view
function renderDriverStats() {
  const drivers = computeDriverStats();

  // metrics
  const mostWins = pickTop(drivers, 'wins', true);
  const mostPodiums = pickTop(drivers, 'podiums', true);
  const mostTop10 = pickTop(drivers, 'top10', true);
  const mostFastestLaps = pickTop(drivers, 'fastestLaps', true);
  const mostPoles = pickTop(drivers, 'poles', true);
  const highestAvgPoints = pickTop(drivers, 'avgPoints', true);
  const bestAvgFinish = pickTop(drivers, 'avgFinish', false); // lower better

  // small helper to create a card
  function statCard(title, driverObj, valueLabel, valueText, accentColor) {
    if (!driverObj) {
      return `<div class="stat-card empty"><div class="stat-card-inner"><div class="stat-title">${escapeHtml(title)}</div><div class="stat-empty">No data</div></div></div>`;
    }
    const prof = driverProfiles[driverObj.name] || {};
    const teamName = driverObj.team || prof.team || '';
    const teamColor = teamProfiles[teamName]?.color || '#e10600';
    const photo = prof.photoDataUrl ? `<img src="${prof.photoDataUrl}" class="stat-thumb" style="--team-color:${teamColor}" />` : `<div class="stat-thumb placeholder" style="--team-color:${teamColor}">?</div>`;
    return `
      <div class="stat-card">
        <div class="stat-card-inner" style="--accent:${accentColor};">
          <div class="stat-left">
            ${photo}
            <div class="stat-info">
              <div class="stat-title">${escapeHtml(title)}</div>
              <div class="stat-name">${escapeHtml(driverObj.name)}</div>
              <div class="stat-team">${escapeHtml(teamName || (prof.team || '-'))}</div>
            </div>
          </div>
          <div class="stat-value">
            <div class="stat-value-label">${escapeHtml(valueLabel)}</div>
            <div class="stat-value-number">${valueText}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Build the grid with accent colours
  const cards = [
    statCard(
      'Most Wins',
      mostWins || {name:'—', team:'—'},
      'Wins',
      mostWins ? mostWins.wins : '0',
      '#b30000'
    ),
    statCard(
      'Most Podiums',
      mostPodiums || {name:'—', team:'—'},
      'Podiums',
      mostPodiums ? mostPodiums.podiums : '0',
      '#d94800'
    ),
    statCard(
      'Most Top 10',
      mostTop10 || {name:'—', team:'—'},
      'Top 10s',
      mostTop10 ? mostTop10.top10 : '0',
      '#c13a8a'
    ),
    statCard(
      'Most Fastest Laps',
      mostFastestLaps || {name:'—', team:'—'},
      'Fastest Laps',
      mostFastestLaps ? mostFastestLaps.fastestLaps : '0',
      '#8a2be2'
    ),
    statCard(
      'Most Poles',
      mostPoles || {name:'—', team:'—'},
      'Poles',
      mostPoles ? mostPoles.poles : '0',
      '#ffd700'
    ),
    statCard(
      'Highest Avg Points',
      highestAvgPoints || {name:'—', team:'—'},
      'Avg Points',
      highestAvgPoints ? highestAvgPoints.avgPoints.toFixed(2) : '0.00',
      '#e10600'
    ),
    statCard(
      'Best Avg Finish',
      bestAvgFinish || {name:'—', team:'—'},
      'Avg Finish',
      bestAvgFinish ? bestAvgFinish.avgFinish.toFixed(2) : '—',
      '#00bfa5'
    )
  ];
  

  driverStatsGrid.innerHTML = `<div class="stat-grid">${cards.join('')}</div>`;
}

// wiring: show view
driverStatsBtn?.addEventListener('click', () => { showView('driverStats'); renderDriverStats(); });
backFromDriverStats?.addEventListener('click', () => showView('race'));

// extend showView to handle driverStats
const _oldShowView = showView;
showView = function (v) {
  _oldShowView(v);
  if (v === 'driverStats') {
    if (driverStatsView) { driverStatsView.style.display = 'block'; renderDriverStats(); }
  } else {
    if (driverStatsView) driverStatsView.style.display = 'none';
  }
};

// ensure driver stats are updated with the rest of the UI
const _oldUpdateUI = updateUI;
updateUI = function() {
  _oldUpdateUI();
  // recalc driver stats if the view is driverStats (or pre-render to keep cache)
  if (view === 'driverStats') renderDriverStats();
};

// ----------------- initial render -----------------
loadInitialData();
// ============================================
// ADD THIS TO THE END OF YOUR src/main.js FILE
// ============================================

// ----------------- TEAMMATE COMPARISON -----------------
const teammatesBtn = document.getElementById('teammatesBtn');
const teammatesView = document.getElementById('teammatesView');
const teammateTeamSelect = document.getElementById('teammateTeamSelect');
const teammateComparison = document.getElementById('teammateComparison');
const backFromTeammates = document.getElementById('backFromTeammates');

// Button to open teammates view
teammatesBtn?.addEventListener('click', () => {
  showView('teammates');
  renderTeammateSelector();
});

backFromTeammates?.addEventListener('click', () => showView('race'));

function renderTeammateSelector() {
  // Get all teams that have at least 2 drivers
  const teamDrivers = {};
  
  races.forEach(race => {
    race.results.forEach(slot => {
      if (!slot.name?.trim() || !slot.team?.trim()) return;
      const team = slot.team.trim();
      if (!teamDrivers[team]) teamDrivers[team] = new Set();
      teamDrivers[team].add(slot.name.trim());
    });
  });

  // Filter teams with 2+ drivers
  const validTeams = Object.entries(teamDrivers)
    .filter(([_, drivers]) => drivers.size >= 2)
    .map(([team]) => team);

  if (validTeams.length === 0) {
    teammateComparison.innerHTML = '<p class="muted" style="text-align:center;margin-top:40px;">No teams with multiple drivers found.</p>';
    return;
  }

  teammateTeamSelect.innerHTML = validTeams
    .map(team => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`)
    .join('');

  teammateTeamSelect.onchange = () => renderTeammateComparison(teammateTeamSelect.value);
  
  // Render first team by default
  renderTeammateComparison(validTeams[0]);
}

function computeTeammateStats(driverName) {
  let races_count = 0;
  let qualifying_positions = [];
  let race_positions = [];
  let points = 0;
  let wins = 0;
  let podiums = 0;
  let top10s = 0;
  let dnfs = 0;
  let poles = 0;
  let best_race_finish = Infinity;
  let best_grid_position = Infinity;

  races.forEach(race => {
    // ✅ RACE RESULTS
    const slot = race.results.find(r => r.name?.trim() === driverName);
    if (slot) {
      races_count++;
      const pos = slot.pos || Infinity;
      
      race_positions.push(pos);
      points += slot.points || 0;
      
      if (pos === 1) wins++;
      if (pos <= 3) podiums++;
      if (pos <= 10) top10s++;
      if (pos > 20 || slot.dnf) dnfs++;
      if (pos < best_race_finish) best_race_finish = pos;
    }
    
    // ✅ QUALIFYING RESULTS
    if (race.qualifying && Array.isArray(race.qualifying)) {
      const qualiSlot = race.qualifying.find(q => q.name?.trim() === driverName);
      if (qualiSlot && qualiSlot.pos) {
        const gridPos = qualiSlot.pos;
        qualifying_positions.push(gridPos);
        if (gridPos < best_grid_position) best_grid_position = gridPos;
        if (gridPos === 1) poles++;
      }
    }
    
    // ✅ POLE POSITION (fallback if not in qualifying data)
    if (race.pole?.driver?.trim() === driverName && !qualifying_positions.includes(1)) {
      poles++;
      qualifying_positions.push(1);
      best_grid_position = 1;
    }
  });

  const avg_race_finish = race_positions.length 
    ? race_positions.reduce((a,b) => a+b, 0) / race_positions.length 
    : Infinity;
  
  const avg_grid = qualifying_positions.length
    ? qualifying_positions.reduce((a,b) => a+b, 0) / qualifying_positions.length
    : Infinity;

  return {
    races_count,
    points,
    wins,
    podiums,
    top10s,
    dnfs,
    poles,
    best_race_finish: best_race_finish === Infinity ? null : best_race_finish,
    best_grid_position: best_grid_position === Infinity ? null : best_grid_position,
    avg_race_finish,
    avg_grid,
    qualifying_wins: qualifying_positions.length // ✅ ADDED: how many qualifying sessions they participated in
  };
}

function renderTeammateComparison(teamName) {
  // Find drivers in this team
  const driverSet = new Set();
  races.forEach(race => {
    race.results.forEach(slot => {
      if (slot.team?.trim() === teamName && slot.name?.trim()) {
        driverSet.add(slot.name.trim());
      }
    });
  });

  const drivers = [...driverSet];
  if (drivers.length < 2) {
    teammateComparison.innerHTML = '<p class="muted">Not enough drivers in this team.</p>';
    return;
  }

  // Take first two drivers
  const d1_name = drivers[0];
  const d2_name = drivers[1];

  const d1 = computeTeammateStats(d1_name);
  const d2 = computeTeammateStats(d2_name);

  // ✅ UPDATED: Calculate qualifying head-to-head
  let d1_quali_wins = 0;
  let d2_quali_wins = 0;
  
  races.forEach(race => {
    if (!race.qualifying) return;
    
    const d1_quali = race.qualifying.find(q => q.name?.trim() === d1_name);
    const d2_quali = race.qualifying.find(q => q.name?.trim() === d2_name);
    
    if (d1_quali && d2_quali) {
      const d1_pos = d1_quali.pos || Infinity;
      const d2_pos = d2_quali.pos || Infinity;
      
      if (d1_pos < d2_pos) d1_quali_wins++;
      else if (d2_pos < d1_pos) d2_quali_wins++;
    }
  });

  // Determine leader across metrics
  const metrics = [
    { key: 'races', label: 'RACE', v1: d1.races_count, v2: d2.races_count, reverse: false },
    { key: 'qualifying', label: 'QUALIFYING', v1: d1_quali_wins, v2: d2_quali_wins, reverse: false }, // ✅ CHANGED
    { key: 'points', label: 'POINTS', v1: d1.points, v2: d2.points, reverse: false },
    { key: 'wins', label: 'WINS', v1: d1.wins, v2: d2.wins, reverse: false },
    { key: 'podiums', label: 'PODIUMS', v1: d1.podiums, v2: d2.podiums, reverse: false },
    { key: 'top10', label: 'TOP 10', v1: d1.top10s, v2: d2.top10s, reverse: false },
    { key: 'dnf', label: 'DNF', v1: d2.dnfs, v2: d1.dnfs, reverse: false }
  ];

  let d1_lead = 0, d2_lead = 0;
  metrics.forEach(m => {
    if (m.v1 > m.v2) d1_lead++;
    if (m.v2 > m.v1) d2_lead++;
  });

  const leader = d1_lead > d2_lead ? d1_name : d2_name;
  const leaderCount = Math.max(d1_lead, d2_lead);
  const totalMetrics = metrics.length;

  // Helper to create comparison bar
  function compBar(label, v1, v2, reverse = false) {
    const total = v1 + v2 || 1;
    const pct1 = (v1 / total) * 100;
    const pct2 = (v2 / total) * 100;

    const winner = reverse ? (v1 < v2 ? 'left' : 'right') : (v1 > v2 ? 'left' : 'right');

    // ✅ FORMATTING: Don't show decimals for qualifying wins (whole numbers)
    const format = (val, isQuali) => {
      if (isQuali) return val; // whole number
      return typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : val;
    };

    const isQuali = label === 'QUALIFYING';

    return `
      <div class="tm-metric">
        <div class="tm-values">
          <span class="tm-val ${winner === 'left' ? 'winner' : ''}">${format(v1, isQuali)}</span>
          <span class="tm-label">${label}</span>
          <span class="tm-val ${winner === 'right' ? 'winner' : ''}">${format(v2, isQuali)}</span>
        </div>
        <div class="tm-bar">
          <div class="tm-bar-left ${winner === 'left' ? 'winning' : ''}" style="width:${pct1}%"></div>
          <div class="tm-bar-right ${winner === 'right' ? 'winning' : ''}" style="width:${pct2}%"></div>
        </div>
      </div>
    `;
  }

  // Get driver profiles
  const prof1 = driverProfiles[d1_name] || {};
  const prof2 = driverProfiles[d2_name] || {};
  const teamColor = teamProfiles[teamName]?.color || '#e10600';

  const photo1 = prof1.photoDataUrl 
    ? `<img src="${prof1.photoDataUrl}" class="tm-photo" style="--team-color:${teamColor}" />`
    : `<div class="tm-photo placeholder" style="--team-color:${teamColor}">?</div>`;

  const photo2 = prof2.photoDataUrl 
    ? `<img src="${prof2.photoDataUrl}" class="tm-photo" style="--team-color:${teamColor}" />`
    : `<div class="tm-photo placeholder" style="--team-color:${teamColor}">?</div>`;

  // Build HTML
  teammateComparison.innerHTML = `
    <div class="tm-container">
      <div class="tm-summary">
        <div class="tm-summary-inner">
          <h3>Head-to-Head Summary</h3>
          <div class="tm-leader">
            ${leader === d1_name ? photo1 : photo2}
            <div class="tm-leader-text">
              <span class="tm-leader-name">${escapeHtml(leader)}</span> leads
              <div class="tm-leader-sub">Superior in ${leaderCount} of ${totalMetrics} metrics</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tm-grid">
        <div class="tm-side left">
          ${photo1}
          <div class="tm-driver-name">${escapeHtml(d1_name)}</div>
          <div class="tm-position">P${d1.best_race_finish || '—'}</div>
        </div>

        <div class="tm-middle">
          ${compBar('RACE', d1.races_count, d2.races_count)}
          ${compBar('QUALIFYING', d1_quali_wins, d2_quali_wins)}
          ${compBar('POINTS', d1.points, d2.points)}
          ${compBar('WINS', d1.wins, d2.wins)}
          ${compBar('PODIUMS', d1.podiums, d2.podiums)}
          ${compBar('TOP 10', d1.top10s, d2.top10s)}
          ${compBar('DNF', d2.dnfs, d1.dnfs)}
          
          <div class="tm-divider"></div>

          ${compBar('BEST RACE FINISH', d1.best_race_finish || 99, d2.best_race_finish || 99, true)}
          ${compBar('BEST GRID POSITION', d1.best_grid_position || 99, d2.best_grid_position || 99, true)}
          ${compBar('POLES', d1.poles, d2.poles)}
        </div>

        <div class="tm-side right">
          ${photo2}
          <div class="tm-driver-name">${escapeHtml(d2_name)}</div>
          <div class="tm-position">P${d2.best_race_finish || '—'}</div>
        </div>
      </div>
    </div>
  `;
}
// Update showView to handle teammates
const _originalShowView = showView;
showView = function(v) {
  _originalShowView(v);
  
  // Hide teammates view when showing other views
  if (v !== 'teammates' && teammatesView) {
    teammatesView.style.display = 'none';
  }
  
  // Show teammates view
  if (v === 'teammates' && teammatesView) {
    teammatesView.style.display = 'block';
  }
};
// ============================================
// QUALIFYING DROPDOWN - ADD TO END OF main.js
// ============================================

// Track which qualifying session we're viewing
let activeQualifyingRaceIndex = 0;

// Get references
const qualifyingBtnElement = document.getElementById('qualifyingBtn');
const qualifyingDropdownMenu = document.getElementById('qualifyingDropdownMenu');

// Toggle dropdown when clicking the button
qualifyingBtnElement?.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('Qualifying button clicked');
  
  if (!qualifyingDropdownMenu) {
    console.error('qualifyingDropdownMenu not found');
    return;
  }
  
  // Toggle the dropdown
  const isOpen = qualifyingDropdownMenu.classList.contains('open');
  
  // Close all other dropdowns first
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('open');
  });
  
  if (!isOpen) {
    qualifyingDropdownMenu.classList.add('open');
    renderQualifyingDropdownMenu();
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.qualifying-dropdown');
  if (!dropdown?.contains(e.target)) {
    qualifyingDropdownMenu?.classList.remove('open');
  }
});

// Render dropdown menu with all races
function renderQualifyingDropdownMenu() {
  if (!qualifyingDropdownMenu) {
    console.error('qualifyingDropdownMenu element not found');
    return;
  }
  
  console.log('Rendering qualifying dropdown with', races.length, 'races');
  
  qualifyingDropdownMenu.innerHTML = races.map((r, i) => {
    const flagUrl = r.flag || `https://flagcdn.com/w40/${r.country || 'un'}.png`;
    return `
      <div class="quali-dropdown-item" data-race-index="${i}" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #222;display:flex;align-items:center;gap:8px;">
        <img src="${flagUrl}" style="width:24px;height:16px;border-radius:3px;object-fit:cover;" onerror="this.style.display='none'" />
        <span>${escapeHtml(r.name || `Race ${i + 1}`)}</span>
      </div>
    `;
  }).join('');
  
  // Attach click handlers to each item
  qualifyingDropdownMenu.querySelectorAll('.quali-dropdown-item').forEach(item => {
    item.onclick = (e) => {
      e.stopPropagation();
      const raceIndex = Number(item.dataset.raceIndex);
      console.log('Selected race index:', raceIndex);
      
      activeQualifyingRaceIndex = raceIndex;
      qualifyingDropdownMenu.classList.remove('open');
      
      // Show qualifying view
      showView('qualifying');
      
      // Small delay to ensure DOM is ready
      setTimeout(() => renderQualifying(), 50);
    };
  });
}

// Render qualifying page for selected race
function renderQualifying() {
  console.log('renderQualifying called for race index:', activeQualifyingRaceIndex);
  
  // Try to find qualifyingBody - check multiple possible selectors
  const qualifyingBody = document.getElementById('qualifyingBody') || 
                         document.querySelector('#qualifyingBody') ||
                         document.querySelector('.qualifying-body') ||
                         document.querySelector('tbody');
  
  const qualifyingTitle = document.getElementById('qualifyingTitle') ||
                          document.querySelector('#qualifyingTitle') ||
                          document.querySelector('.qualifying-title');
  
  console.log('qualifyingBody found:', !!qualifyingBody);
  console.log('qualifyingTitle found:', !!qualifyingTitle);
  
  const race = races[activeQualifyingRaceIndex];
  
  // Handle case where race doesn't exist
  if (!race) {
    console.error('No race found at index:', activeQualifyingRaceIndex);
    if (qualifyingBody) {
      qualifyingBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#666;">Race not found. Please select a race from the dropdown.</td></tr>';
    }
    if (qualifyingTitle) {
      qualifyingTitle.textContent = 'Qualifying';
    }
    return;
  }

  console.log('Rendering qualifying for race:', race.name);
  
  // Update title
  if (qualifyingTitle) {
    qualifyingTitle.textContent = `Qualifying — ${race.name || `Race ${activeQualifyingRaceIndex + 1}`}`;
  }

  // ALWAYS initialize qualifying data with 24 positions
  if (!race.qualifying || !Array.isArray(race.qualifying)) {
    console.log('Initializing qualifying array for race:', race.name);
    race.qualifying = [];
  }
  
  // Fill up to 24 positions with empty slots
  while (race.qualifying.length < 24) {
    const i = race.qualifying.length;
    race.qualifying.push({
      pos: i + 1,
      name: '',
      team: '',
      time: ''
    });
  }
  
  // Ensure all existing slots have the required properties
  race.qualifying = race.qualifying.map((slot, i) => ({
    pos: slot?.pos || i + 1,
    name: slot?.name || '',
    team: slot?.team || '',
    time: slot?.time || ''
  }));
  
  // Save the initialized data
  if (typeof save === 'function' && typeof STORAGE_KEY !== 'undefined') {
    save(STORAGE_KEY, races);
  }

  // Check if qualifyingBody exists
  if (!qualifyingBody) {
    console.error('qualifyingBody element not found - cannot render table');
    console.error('Available elements:', {
      byId: document.getElementById('qualifyingBody'),
      byQuery: document.querySelector('#qualifyingBody'),
      allTbody: document.querySelectorAll('tbody').length
    });
    return;
  }

  // Build table HTML - ALWAYS show all 24 rows with empty input fields
  const tableHTML = race.qualifying.slice(0, 24).map((slot, i) => {
    const name = (slot.name || '').trim();
    const teamName = (slot.team || '').trim();
    
    // Get profile data safely
    const profile = name && typeof driverProfiles !== 'undefined' ? (driverProfiles[name] || {}) : {};
    const actualTeam = teamName || profile.team || '';
    
    // Get team color safely
    let teamColor = '#555';
    if (actualTeam && typeof teamProfiles !== 'undefined' && teamProfiles[actualTeam]) {
      teamColor = teamProfiles[actualTeam].color || '#e10600';
    }

    // Photo placeholder or actual photo
    const photo = profile.photoDataUrl
      ? `<img src="${profile.photoDataUrl}" style="border:2px solid ${teamColor};width:40px;height:40px;border-radius:50%;object-fit:cover;" />`
      : `<div style="width:40px;height:40px;border-radius:50%;background:#222;display:flex;align-items:center;justify-content:center;color:#666;font-size:16px;border:2px solid ${teamColor};">?</div>`;

    // Team logo if available
    let teamLogo = '';
    if (actualTeam && typeof teamProfiles !== 'undefined' && teamProfiles[actualTeam]?.logoDataUrl) {
      teamLogo = `<img src="${teamProfiles[actualTeam].logoDataUrl}" style="width:28px;height:28px;object-fit:contain;margin-left:8px;" />`;
    }

    return `
      <tr style="background:#111;border-bottom:1px solid #222;">
        <td style="text-align:center;font-weight:bold;color:#e10600;padding:12px;">${slot.pos}</td>
        <td style="padding:12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${photo}
            <input class="quali-driver-edit" data-index="${i}" value="${escapeHtml(name)}" placeholder="Enter driver name..." style="background:#000;color:white;border:1px solid #333;border-radius:4px;padding:8px;flex:1;font-size:14px;" />
          </div>
        </td>
        <td style="text-align:center;padding:12px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
            <span style="color:${actualTeam ? '#aaa' : '#555'};">${escapeHtml(actualTeam || '—')}</span>
            ${teamLogo}
          </div>
        </td>
        <td style="text-align:center;padding:12px;">
          <input class="quali-time-edit" data-index="${i}" value="${escapeHtml(slot.time || '')}" placeholder="1:23.456" style="background:#000;color:white;border:1px solid #333;border-radius:4px;padding:8px;width:140px;text-align:center;font-size:14px;font-family:monospace;" />
        </td>
      </tr>
    `;
  }).join('');

  // Always render the table, even if all slots are empty
  qualifyingBody.innerHTML = tableHTML;
  console.log('✅ Qualifying table rendered successfully with 24 positions');

  // Attach input handlers
  attachQualiEditHandlers();
}

// Attach input handlers
function attachQualiEditHandlers() {
  // Driver name inputs
  document.querySelectorAll('.quali-driver-edit').forEach(input => {
    input.onchange = () => {
      const i = Number(input.dataset.index);
      const name = input.value.trim();
      
      // Update driver name
      if (races[activeQualifyingRaceIndex] && races[activeQualifyingRaceIndex].qualifying[i]) {
        races[activeQualifyingRaceIndex].qualifying[i].name = name;
        
        // Auto-fill team if driver exists in profiles
        if (name && typeof driverProfiles !== 'undefined' && driverProfiles[name]?.team) {
          races[activeQualifyingRaceIndex].qualifying[i].team = driverProfiles[name].team;
        }
        
        if (typeof save === 'function' && typeof STORAGE_KEY !== 'undefined') {
          save(STORAGE_KEY, races);
        }
        renderQualifying(); // Re-render to show updated photo/team
      }
    };
  });

  // Qualifying time inputs
  document.querySelectorAll('.quali-time-edit').forEach(input => {
    input.onchange = () => {
      const i = Number(input.dataset.index);
      if (races[activeQualifyingRaceIndex] && races[activeQualifyingRaceIndex].qualifying[i]) {
        races[activeQualifyingRaceIndex].qualifying[i].time = input.value.trim();
        if (typeof save === 'function' && typeof STORAGE_KEY !== 'undefined') {
          save(STORAGE_KEY, races);
        }
      }
    };
  });
}

// Helper function for escaping HTML (add if not already present)
if (typeof escapeHtml === 'undefined') {
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

console.log('✅ Qualifying dropdown code loaded');
(function() {
  console.log('🔄 Initializing Season Management Dropdown...');
  
  const btn = document.getElementById('seasonManagementBtn');
  const menu = document.getElementById('seasonDropdownMenu');
  
  if (!btn || !menu) {
    console.error('❌ Season dropdown elements not found!');
    console.error('Button:', btn);
    console.error('Menu:', menu);
    return;
  }
  
  console.log('✅ Season dropdown elements found');
  
  // Toggle dropdown on button click
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log('🖱️ Season button clicked');
    
    const isOpen = menu.classList.contains('open');
    
    // Close all dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(function(m) {
      m.classList.remove('open');
    });
    
    // Toggle this dropdown
    if (!isOpen) {
      menu.classList.add('open');
      renderSeasonMenu();
      console.log('✅ Season dropdown opened');
    }
  });
  
  // Close when clicking outside
  document.addEventListener('click', function(e) {
    const dropdown = btn.closest('.dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
  
  // Render menu items
  function renderSeasonMenu() {
    console.log('📝 Rendering season menu...');
    
    const items = [
      { 
        icon: '💾',
        label: 'Save Current Season',
        action: 'save',
        style: 'color:#4CAF50;font-weight:600;'
      },
      { 
        icon: '📚',
        label: 'View Saved Seasons',
        action: 'view',
        style: ''
      },
      { 
        icon: '🔄',
        label: 'Reset Current Season',
        action: 'reset',
        style: 'border-top:1px solid #333;margin-top:8px;padding-top:12px;'
      },
      { 
        icon: '🗑️',
        label: 'Clear All Data',
        action: 'clear',
        style: 'color:#ff4444;'
      }
    ];
    
    menu.innerHTML = items.map(function(item) {
      return `
        <div class="season-dropdown-item" data-action="${item.action}" style="${item.style}">
          <span style="font-size:20px;">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `;
    }).join('');
    
    console.log('✅ Menu rendered with', items.length, 'items');
    
    // Attach click handlers
    menu.querySelectorAll('.season-dropdown-item').forEach(function(item) {
      // Hover effects
      item.addEventListener('mouseenter', function() {
        this.style.background = '#222';
      });
      
      item.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
      });
      
      // Click handler
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = this.getAttribute('data-action');
        console.log('🖱️ Menu item clicked:', action);
        
        menu.classList.remove('open');
        handleSeasonAction(action);
      });
    });
  }
  
  // Handle menu actions
  function handleSeasonAction(action) {
    const saveBtn = document.getElementById('saveSeasonBtn');
    const seasonsBtn = document.getElementById('seasonsBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearBtn = document.getElementById('clearStorageBtn');
    
    if (action === 'save') {
      console.log('💾 Triggering save season...');
      if (saveBtn) saveBtn.click();
      else console.error('❌ saveSeasonBtn not found');
    } 
    else if (action === 'view') {
      console.log('📚 Viewing saved seasons...');
      if (typeof renderSeasonsPage === 'function') {
        renderSeasonsPage();
      }
      if (typeof showView === 'function') {
        showView('seasons');
      }
    } 
    else if (action === 'reset') {
      console.log('🔄 Resetting season...');
      if (confirm('Reset all race data for the current season?')) {
        if (typeof STORAGE_KEY !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.removeItem('f1_demo_races_v7');
        }
        location.reload();
      }
    } 
    else if (action === 'clear') {
      console.log('🗑️ Clearing all data...');
      if (confirm('Delete ALL saved data? This cannot be undone!')) {
        localStorage.clear();
        location.reload();
      }
    }
  }
  
  console.log('✅ Season Management Dropdown initialized successfully');
})();
// ============================================
// TABLES DROPDOWN JAVASCRIPT
// LOCATION: At the end of main.js (after Season dropdown code)
// ============================================

// Tables Dropdown (Standings & Constructors)
(function() {
  console.log('📊 Initializing Tables Dropdown...');
  
  const btn = document.getElementById('tablesBtn');
  const menu = document.getElementById('tablesDropdownMenu');
  
  if (!btn || !menu) {
    console.error('❌ Tables dropdown elements not found!');
    console.error('Button:', btn);
    console.error('Menu:', menu);
    return;
  }
  
  console.log('✅ Tables dropdown elements found');
  
  // Toggle dropdown on button click
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log('🖱️ Tables button clicked');
    
    const isOpen = menu.classList.contains('open');
    
    // Close all dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(function(m) {
      m.classList.remove('open');
    });
    
    // Toggle this dropdown
    if (!isOpen) {
      menu.classList.add('open');
      renderTablesMenu();
      console.log('✅ Tables dropdown opened');
    }
  });
  
  // Close when clicking outside
  document.addEventListener('click', function(e) {
    const dropdown = btn.closest('.dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
  
  // Render menu items
  function renderTablesMenu() {
    console.log('📝 Rendering tables menu...');
    
    const items = [
      { 
        icon: '🏆',
        label: 'Driver Standings',
        action: 'standings',
        style: ''
      },
      { 
        icon: '🏁',
        label: 'Constructors Championship',
        action: 'constructors',
        style: ''
      }
    ];
    
    menu.innerHTML = items.map(function(item) {
      return `
        <div class="tables-dropdown-item" data-action="${item.action}" style="${item.style}">
          <span style="font-size:20px;">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `;
    }).join('');
    
    console.log('✅ Tables menu rendered with', items.length, 'items');
    
    // Attach click handlers
    menu.querySelectorAll('.tables-dropdown-item').forEach(function(item) {
      // Hover effects
      item.addEventListener('mouseenter', function() {
        this.style.background = '#222';
      });
      
      item.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
      });
      
      // Click handler
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = this.getAttribute('data-action');
        console.log('🖱️ Tables menu item clicked:', action);
        
        menu.classList.remove('open');
        handleTablesAction(action);
      });
    });
  }
  
  // Handle menu actions
  function handleTablesAction(action) {
    if (action === 'standings') {
      console.log('🏆 Opening Driver Standings...');
      if (typeof showView === 'function') {
        showView('standings');
      } else {
        console.error('❌ showView function not found');
      }
    } 
    else if (action === 'constructors') {
      console.log('🏁 Opening Constructors Championship...');
      if (typeof showView === 'function') {
        showView('constructors');
      } else {
        console.error('❌ showView function not found');
      }
    }
  }
  
  console.log('✅ Tables Dropdown initialized successfully');
})();



