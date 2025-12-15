(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const tt=[{id:1,name:"India GP"},{id:2,name:"Saudi Arabia GP"},{id:3,name:"Australia GP"},{id:4,name:"Japan GP"},{id:5,name:"Canada GP"},{id:6,name:"Monaco GP"},{id:7,name:"Spain GP"},{id:8,name:"Austria GP"},{id:9,name:"Belgium GP"},{id:10,name:"Italy GP"},{id:11,name:"Singapore GP"},{id:12,name:"Russia GP"},{id:13,name:"USA GP"},{id:14,name:"Mexico GP"},{id:15,name:"Brazil GP"},{id:16,name:"France GP"},{id:17,name:"Germany GP"},{id:18,name:"Hungary GP"},{id:19,name:"Netherlands GP"},{id:20,name:"Portugal GP"},{id:21,name:"China GP"},{id:22,name:"Austria Sprint"},{id:23,name:"Japan Sprint"},{id:24,name:"Abu Dhabi GP"}],nt=[25,18,15,12,10,8,6,4,2,1],Ve=tt.map(e=>({...e,results:Array.from({length:20},(t,n)=>({pos:n+1,name:"",team:"",points:nt[n]??0})),fl:{driver:"",points:0},pole:{driver:"",points:0}})),D="f1_demo_races_v7",oe="f1_demo_drivers_v1",Z="f1_demo_teams_v1",P="f1_records_v1",he="f1_saved_seasons_v1",Ae=[25,18,15,12,10,8,6,4,2,1],Y=window.db;function b(e,t){return Y?Y.ref(e).set(t).catch(n=>{console.error("Save error:",n)}):(console.error("Firebase not initialized"),Promise.resolve())}async function ne(e){if(!Y)return console.error("Firebase not initialized"),null;try{return(await Y.ref(e).once("value")).val()}catch(t){return console.error("Load error:",t),null}}function se(e,t){Y&&Y.ref(e).on("value",n=>{const s=n.val();s&&t(s)})}function u(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Ge(e){return new Promise((t,n)=>{const s=new FileReader;s.onload=()=>t(s.result),s.onerror=n,s.readAsDataURL(e)})}function _(e){try{return structuredClone(e)}catch{return JSON.parse(JSON.stringify(e))}}let r=Ve.map(e=>({...e,results:e.results.map(t=>({...t})),pole:{driver:"",points:1},fl:{driver:"",points:1},flag:e.flag||null,country:e.country||null})),h={},f={},R=[],c={driverWins:{},driverTitles:{},teamWins:{},teamTitles:{}};async function st(){console.log("🔥 Loading data from Firebase...");const e=await ne(D),t=await ne(oe),n=await ne(Z),s=await ne(he),o=await ne(P);e&&(r=e,console.log("✅ Races loaded")),t&&(h=t,console.log("✅ Drivers loaded")),n&&(f=n,Object.keys(f).forEach(a=>{f[a].color||(f[a].color="#e10600")}),console.log("✅ Teams loaded")),s&&(R=s,console.log("✅ Seasons loaded")),o&&(c=o,console.log("✅ Records loaded")),console.log("✅ All data loaded from Firebase"),X(),ot()}function ot(){console.log("🔥 Setting up real-time sync..."),se(D,e=>{console.log("🔄 Races updated from Firebase"),r=e,ae(),S==="race"&&M(),S==="standings"&&be(),S==="constructors"&&K()}),se(oe,e=>{console.log("🔄 Drivers updated from Firebase"),h=e,S==="drivers"&&A(),S==="race"&&M(),S==="driverStats"&&ie()}),se(Z,e=>{console.log("🔄 Teams updated from Firebase"),f=e,S==="drivers"&&A(),S==="race"&&M(),S==="constructors"&&K()}),se(he,e=>{console.log("🔄 Seasons updated from Firebase"),R=e||[],S==="seasons"&&U()}),se(P,e=>{console.log("🔄 Records updated from Firebase"),c=e||{driverWins:{},driverTitles:{},teamWins:{},teamTitles:{}},S==="records"&&F()}),console.log("✅ Real-time sync active")}let k=0,S="race";const at=document.getElementById("app");at.innerHTML=`
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
`;const ze=document.getElementById("calendarBtn"),Q=document.getElementById("calendarMenu");document.getElementById("standingsBtn");document.getElementById("constructorsBtn");const it=document.getElementById("driversBtn"),rt=document.getElementById("calendarManageBtn"),lt=document.getElementById("resetBtn"),dt=document.getElementById("clearStorageBtn");document.getElementById("resultsBody");const ct=document.getElementById("raceTitle"),mt=document.getElementById("extrasSection"),ut=document.getElementById("addForm"),Ue=document.getElementById("nameInput"),qe=document.getElementById("teamSelect"),we=document.getElementById("raceView"),Ee=document.getElementById("standingsView"),Be=document.getElementById("constructorsView"),$e=document.getElementById("calendarView"),xe=document.getElementById("driversView"),pt=document.getElementById("backBtn"),ft=document.getElementById("backFromConstructors"),vt=document.getElementById("backFromCalendarBtn"),gt=document.getElementById("backFromDriversBtn"),Qe=document.getElementById("matrixHead"),yt=document.getElementById("matrixBody"),ht=document.getElementById("constructorsHead"),bt=document.getElementById("constructorsBody"),C=document.getElementById("calendarList"),wt=document.getElementById("saveCalendarBtn"),Et=document.getElementById("resetCalendarBtn"),Bt=document.getElementById("driverForm"),Pe=document.getElementById("drvName"),pe=document.getElementById("drvTeamSelect"),Se=document.getElementById("drvPhoto"),Te=document.getElementById("driversList"),$t=document.getElementById("teamForm"),Fe=document.getElementById("teamName"),De=document.getElementById("teamLogo"),ke=document.getElementById("teamsList"),xt=document.getElementById("saveSeasonBtn"),Ye=document.getElementById("seasonsBtn"),Ie=document.getElementById("seasonsView"),G=document.getElementById("seasonsList"),St=document.getElementById("backFromSeasons");document.getElementById("seasonManagementBtn");document.getElementById("seasonDropdownMenu");document.getElementById("tablesBtn");document.getElementById("tablesDropdownMenu");const Le=document.getElementById("seasonResultsView"),Tt=document.getElementById("seasonResultsTitle"),de=document.getElementById("seasonRaceList"),fe=document.getElementById("seasonRaceResults"),Dt=document.getElementById("backFromSeasonResults"),Ce=document.getElementById("qualifyingView"),kt=document.getElementById("backFromQualifying"),It=document.getElementById("recordsBtn"),z=document.getElementById("recordsView"),Lt=document.getElementById("backFromRecords"),Ct=document.getElementById("driverWinsBody"),Rt=document.getElementById("driverTitlesBody"),qt=document.getElementById("teamWinsBody"),Pt=document.getElementById("teamTitlesBody");function Ft(e){const t=h[e];if(!t)return u(e||"");const n=t.team||"",s=f[n]?.color||"#e10600";return t.photoDataUrl?`<img class="thumb driver-colored" src="${t.photoDataUrl}" style="--team-color:${s}" alt="" /> ${u(e)}`:u(e)}function Mt(e){if(!e)return"-";const t=Object.keys(f).find(s=>s.toLowerCase()===(e||"").toLowerCase()),n=t?f[t]:null;return n?.logoDataUrl?`
      <span class="team-cell">
        <img class="team-logo" src="${n.logoDataUrl}" />
        ${u(n.name)}
      </span>
    `:u(e)}function ae(){Q.innerHTML=r.map((e,t)=>`<div class="calendar-item" data-i="${t}">${u(e.name)}</div>`).join(""),Q.querySelectorAll(".calendar-item").forEach(e=>e.onclick=()=>{k=Number(e.dataset.i),Q.classList.remove("open"),g("race"),X()})}function M(){const e=r[k]||{results:[]};ct.textContent=e.name||`Race ${k+1}`;const t=document.querySelector(".table-wrap");if(!t){console.error("renderRaceResults: .table-wrap not found");return}const n=(l,v="",m=!1)=>{const d=m==="pole",p=m==="fl",B=(v||"").trim(),T=h[B]||{},E=T.team||"",y=f[E]?.color||"#e10600",w=T.photoDataUrl?`<img src="${T.photoDataUrl}" class="stat-thumb pod-thumb" style="--team-color:${y}" alt="${u(B)}" />`:`<div class="stat-thumb placeholder pod-thumb" style="--team-color:${y}">?</div>`;let x,$,j;d?(x="Pole Position",$="#FFD700",j="[Pole]"):p?(x="Fastest Lap",$="#B300E0",j="[FL]"):(x=`#${l+1}`,$="#e10600",j="");const re=d||p?"+1":e.results[l]?.points??0;return`
      <div class="podium-card ${m?"extra-"+m:"pod-"+(l+1)}"
           style="--accent-color:${$}">
        <div class="pod-top" style="background:${$}">
          <div class="pod-pos">${j}${x}</div>
        </div>
        <div class="pod-body">
          <div class="pod-photo">${w}</div>
          <div class="pod-text">
            <div class="pod-name">${u(B||(m?"—":"Waiting..."))}</div>
            <div class="pod-team">${u(E)}</div>
          </div>
          <div class="pod-points" style="color:${$}">${re}</div>
        </div>
        <div class="pod-edit">
          ${m?`<input class="driver-edit ${m}-input" type="text"
                      placeholder="${d?"Driver who got pole":"Driver with fastest lap"}"
                      value="${u(B)}" />`:`<input class="driver-edit" data-index="${l}" type="text"
                      placeholder="Driver name..." value="${u(B)}" />`}
        </div>
      </div>
    `},s=[0,1,2].map(l=>n(l,e.results[l]?.name||"")).join(""),o=n(0,e.pole?.driver,"pole"),a=n(0,e.fl?.driver,"fl"),i=e.results.filter((l,v)=>v>=3).map(l=>{const v=e.results.indexOf(l),m=(l.name||"").trim(),d=h[m]||{},p=l.team||d.team||"",B=f[p]?.color||"#e10600",T=d.photoDataUrl?`<img src="${d.photoDataUrl}" class="list-thumb" style="--team-color:${B}" />`:`<div class="list-thumb placeholder" style="--team-color:${B}">?</div>`,E=f[p]?.logoDataUrl?`<img src="${f[p].logoDataUrl}" class="team-logo" style="width:32px;height:32px;object-fit:contain;margin-left:8px;" />`:"";return`
        <div class="race-row">
          <div class="race-pos">${l.pos||v+1}</div>
          <div class="race-driver">
            ${T}
            <div class="race-meta">
              <input class="driver-edit" data-index="${v}" value="${u(m)}" placeholder="Driver..." />
            </div>
          </div>
          <div class="race-team-text">
            ${u(p)}${E}
          </div>
          <div class="race-points">${l.points??0}</div>
        </div>
      `}).join("");t.innerHTML=`
    <div class="race-layout-threecol" style="display:grid; gap:20px; max-width:1100px; margin:0 auto;">
      <!-- Left: Podium + Pole + FL -->
      <aside class="left-col" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:16px;">
        ${s}
        ${o}
        ${a}
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
          ${i||'<div class="muted">No more finishers</div>'}
        </div>
      </main>
    </div>
  `,mt.style.display="none",At(),Nt()}function At(){document.querySelectorAll(".driver-edit:not(.pole-input):not(.fl-input)").forEach(e=>{e.onchange=()=>{const t=Number(e.dataset.index),n=e.value.trim();r[k].results[t].name=n,h[n]?.team&&(r[k].results[t].team=h[n].team);const s=r[k].results[t].pos-1;r[k].results[t].points=Ae[s]??0,J()}})}function Nt(){const e=document.querySelector(".pole-input"),t=document.querySelector(".fl-input");e&&(e.onchange=()=>{r[k].pole.driver=e.value.trim(),J()}),t&&(t.onchange=()=>{const n=t.value.trim(),s=r[k].results.findIndex(o=>(o.name||"").trim()===n);if(n&&(s===-1||s>=10)){alert("Fastest lap point only awarded if driver finished in top 10!"),t.value=r[k].fl.driver||"";return}r[k].fl.driver=n,J()})}function Wt(){const e=new Map;return r.forEach((t,n)=>{t.results.forEach(s=>{if(!s.name?.trim())return;const o=h[s.name],a=s.team||o?.team||"";e.has(s.name)||e.set(s.name,{name:s.name,team:a,points:0,perRace:Array(r.length).fill(null)});const i=e.get(s.name);i.perRace[n]=s.pos,i.points+=s.points||0,t.pole?.driver?.trim()===s.name&&(i.points+=1),t.fl?.driver?.trim()===s.name&&s.pos<=10&&(i.points+=1),!i.team&&a&&(i.team=a)})}),Object.values(h).forEach(t=>{e.has(t.name)||e.set(t.name,{name:t.name,team:t.team||"",points:0,perRace:Array(r.length).fill(null)})}),[...e.values()].sort((t,n)=>n.points-t.points)}function be(){const e=Wt(),t=r.map((n,s)=>{const o=n.flag||`https://flagcdn.com/w40/${n.country||"un"}.png`,a=(n.name||"").slice(0,3).toUpperCase()||s+1;return`<th class="race-col" data-i="${s}" style="text-align:center;"><img src="${o}" alt="${a}" class="race-flag" onerror="this.style.display='none'"><div style="margin-top:4px;font-size:10px;font-weight:600;">${u(a)}</div></th>`}).join("");Qe.innerHTML=`<tr><th>#</th><th>Driver</th><th>Team</th><th>Pts</th>${t}</tr>`,yt.innerHTML=e.map((n,s)=>{const o=n.perRace.map((a,i)=>{if(!a)return'<td class="empty">·</td>';const l=r[i],v=n.name.trim(),m=l.pole?.driver?.trim()===v,d=l.fl?.driver?.trim()===v;let p="text-align:center;";return m&&d?p+="color:#B300E0;font-weight:900;text-shadow:0 0 10px #B300E0,0 0 20px #FFD700;border:2px solid #FFD700;border-radius:4px;":m?p+="font-weight:800; color:#b8860b;":d&&(p+="font-weight:800; color:#8a2be2;"),`<td style="${p}">${a}</td>`}).join("");return`<tr><td style="font-weight:bold;">${s+1}</td><td>${Ft(n.name)}</td><td>${Mt(n.team)}</td><td style="font-weight:bold;font-size:18px;">${n.points}</td>${o}</tr>`}).join("")}function _t(){const e=new Map;return r.forEach((t,n)=>{const s=new Map;if(t.results.forEach(o=>{if(!o.team?.trim())return;const a=o.team.trim();s.set(a,(s.get(a)||0)+(o.points||0))}),t.pole?.driver?.trim()){const o=t.results.find(a=>a.name?.trim()===t.pole.driver.trim())?.team?.trim();o&&s.set(o,(s.get(o)||0)+1)}if(t.fl?.driver?.trim()){const o=t.results.find(a=>a.name?.trim()===t.fl.driver.trim());if(o&&o.pos<=10){const a=o.team?.trim();a&&s.set(a,(s.get(a)||0)+1)}}s.forEach((o,a)=>{e.has(a)||e.set(a,{name:a,points:0,perRace:Array(r.length).fill(null)});const i=e.get(a);i.points+=o,i.perRace[n]=o>0?o:null})}),Object.keys(f).forEach(t=>{e.has(t)||e.set(t,{name:t,points:0,perRace:Array(r.length).fill(null)})}),[...e.values()].sort((t,n)=>n.points-t.points)}function K(){const e=_t(),t=r.map((n,s)=>{const o=n.flag||`https://flagcdn.com/w40/${n.country||"un"}.png`,a=(n.name||"").slice(0,3).toUpperCase()||s+1;return`<th class="race-col" data-i="${s}" style="text-align:center;"><img src="${o}" alt="${a}" class="race-flag" onerror="this.style.display='none'"><div style="margin-top:4px;font-size:10px;font-weight:600;">${u(a)}</div></th>`}).join("");ht.innerHTML=`<tr><th>#</th><th>Team</th><th>Pts</th>${t}</tr>`,bt.innerHTML=e.map((n,s)=>{const o=f[n.name]||{},a=o.logoDataUrl?`<img src="${o.logoDataUrl}" class="team-logo-big" alt="">`:`<div style="width:48px;height:48px;background:#333;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#888;font-size:22px;font-weight:bold;">${u(n.name[0]||"?")}</div>`,i=n.perRace.map(l=>l!==null?`<td style="text-align:center;font-weight:bold;">${l}</td>`:'<td class="empty">·</td>').join("");return`<tr><td style="text-align:center;font-weight:bold;">${s+1}</td><td style="display:flex;align-items:center;gap:14px;font-weight:600;">${a}<span>${u(n.name)}</span></td><td style="text-align:right;font-size:22px;font-weight:bold;color:#e10600;">${n.points}</td>${i}</tr>`}).join("")}function Ke(){C.innerHTML=r.map((t,n)=>{const s=t.flag||`https://flagcdn.com/w160/${t.country||"un"}.png`;return`<li class="calendar-item-draggable" draggable="true" data-i="${n}"><div class="drag-handle">Drag</div><img src="${s}" class="flag" alt="flag" onerror="this.src='https://flagcdn.com/w160/un.png'"><div class="track-name editable" data-i="${n}">${u(t.name)}</div><button class="flag-picker" title="Change flag">Flag</button><div class="track-controls"><button class="btn small up">Up</button><button class="btn small down">Down</button></div></li>`}).join(""),C.querySelectorAll(".track-name").forEach(t=>{t.onclick=()=>{const n=Number(t.dataset.i),s=document.createElement("input");s.type="text",s.value=r[n].name,s.style.cssText="background:#000;color:white;border:1px solid #e10600;border-radius:6px;padding:6px;width:100%",t.replaceWith(s),s.focus();const o=()=>{r[n].name=s.value.trim()||"Grand Prix",J()};s.onblur=o,s.onkeydown=a=>{a.key==="Enter"&&o()}}}),C.querySelectorAll(".flag-picker").forEach(t=>{t.onclick=n=>{n.stopPropagation();const s=n.target.closest("li"),o=Number(s.dataset.i),a=prompt("Country code (e.g. gb, it, jp, au, br, mc, ae):",r[o].country||"gb");if(!a)return;const i=a.trim().toLowerCase();r[o].flag=`https://flagcdn.com/w160/${i}.png`,r[o].country=i,J()}});let e=null;C.querySelectorAll("li").forEach(t=>{t.addEventListener("dragstart",()=>{e=t,t.classList.add("dragging")}),t.addEventListener("dragend",()=>{e&&e.classList.remove("dragging"),e=null}),t.addEventListener("dragover",n=>{if(n.preventDefault(),e&&e!==t){const s=[...C.children],o=s.indexOf(e),a=s.indexOf(t);o<a?C.insertBefore(e,t.nextSibling):C.insertBefore(e,t)}})}),C.querySelectorAll(".up").forEach(t=>t.onclick=n=>{const s=n.target.closest("li"),o=s.previousElementSibling;o&&C.insertBefore(s,o)}),C.querySelectorAll(".down").forEach(t=>t.onclick=n=>{const s=n.target.closest("li"),o=s.nextElementSibling;o&&C.insertBefore(o,s)})}function Ht(){r=[...C.children].map(t=>{const n=Number(t.dataset.i),s=r[n],o=t.querySelector(".track-name")||t.querySelector("input"),a=o?.value||o?.textContent||s.name;return{...s,name:a.trim()}}),b(D,r),ae(),M(),S==="standings"&&be(),S==="constructors"&&K(),alert("Calendar saved with flags!")}function A(){const e=Object.keys(f||{});pe.innerHTML=`<option value=''>— team —</option>${e.map(t=>`<option value="${u(t)}">${u(t)}</option>`).join("")}`,qe.innerHTML=`<option value=''>— pick / auto —</option>${e.map(t=>`<option value="${u(t)}">${u(t)}</option>`).join("")}`,Te.innerHTML=Object.keys(h).length===0?'<li class="muted">No drivers saved</li>':Object.values(h).map(t=>`<li class="profile-item" data-name="${u(t.name)}"><div class="profile-photo">${t.photoDataUrl?`<img src="${t.photoDataUrl}" class="thumb" />`:'<div class="no-thumb">?</div>'}</div><div class="profile-info"><div class="name">${u(t.name)}</div><div class="team">${u(t.team||"—")}</div></div><div class="profile-actions"><button class="btn small edit">Edit</button><button class="btn small danger delete">Delete</button></div></li>`).join(""),ke.innerHTML=e.length===0?'<li class="muted">No teams saved</li>':Object.values(f).map(t=>`
        <li class="profile-item" data-name="${u(t.name)}">
          <div class="profile-photo">
            ${t.logoDataUrl?`<img src="${t.logoDataUrl}" class="thumb" />`:'<div class="no-thumb">T</div>'}
          </div>
  
          <div class="profile-info">
            <div class="name">${u(t.name)}</div>
          </div>
  
          <div class="profile-actions">
            <button class="btn small edit-team">Edit</button>
            <button class="btn small danger delete-team">Delete</button>
          </div>
        </li>
      `).join(""),Te.querySelectorAll(".edit").forEach(t=>t.onclick=n=>{const s=n.target.closest("li"),o=s.dataset.name,a=h[o];a&&(Pe.value=a.name,pe.value=a.team||"")}),Te.querySelectorAll(".delete").forEach(t=>t.onclick=n=>{const s=n.target.closest("li").dataset.name;confirm(`Delete driver "${s}"?`)&&(delete h[s],b(oe,h),A())}),ke.querySelectorAll(".edit-team").forEach(t=>t.onclick=n=>{const s=n.target.closest("li").dataset.name;Fe.value=s;const o=document.getElementById("teamColor");o&&(o.value=f[s]?.color||"#e10600")}),ke.querySelectorAll(".delete-team").forEach(t=>t.onclick=n=>{const s=n.target.closest("li").dataset.name;confirm(`Delete team "${s}"?`)&&(delete f[s],b(Z,f),A(),M())})}function g(e){S=e,[we,Ee,Be,$e,xe,z,Ie,Le,ue,Ce].forEach(t=>{t&&(t.style.display="none")}),e==="race"&&we&&(we.style.display="block"),e==="standings"&&Ee&&(Ee.style.display="block",be()),e==="constructors"&&Be&&(Be.style.display="block",K()),e==="calendar"&&$e&&($e.style.display="block",Ke()),e==="drivers"&&xe&&(xe.style.display="block",A()),e==="records"&&z&&(z.style.display="block",F()),e==="seasons"&&Ie&&(Ie.style.display="block",U()),e==="seasonResults"&&Le&&(Le.style.display="block"),e==="qualifying"&&Ce&&(Ce.style.display="block",We()),e==="recordData"&&(ue&&(ue.style.display="block"),z&&(z.style.display="none")),typeof V<"u"&&V&&(V.style.display="none"),e==="records"&&typeof V<"u"&&V&&(V.style.display="inline-block")}function F(){const e={driverWins:{},teamWins:{}};r.forEach(m=>{if(!m.results[0]?.name?.trim())return;const d=m.results[0].name.trim(),p=m.results[0].team?.trim()||"Unknown";e.driverWins[d]=(e.driverWins[d]||0)+1,p!=="Unknown"&&(e.teamWins[p]=(e.teamWins[p]||0)+1)});const t={},n={};r.forEach(m=>m.results.forEach(d=>{d.name?.trim()&&(t[d.name]=(t[d.name]||0)+(d.points||0),d.team?.trim()&&(n[d.team]=(n[d.team]||0)+(d.points||0)),m.pole?.driver?.trim()===d.name&&(t[d.name]+=1),m.fl?.driver?.trim()===d.name&&d.pos<=10&&(t[d.name]+=1))}));function s(m,d){const p={};return new Set([...Object.keys(m||{}),...Object.keys(d||{})]).forEach(T=>p[T]=(m[T]||0)+(d[T]||0)),p}const o=s(e.driverWins,c.driverWins||{}),a=s(e.teamWins,c.teamWins||{});function i(m,d,p={top:3,isChampion:!1,label:"wins"}){if(!d)return;const B=Object.entries(m);if(!B.length){d.innerHTML='<div class="muted">No records</div>';return}B.sort((E,y)=>y[1]-E[1]||E[0].localeCompare(y[0]));const T=B.slice(0,p.top);d.innerHTML=T.map(([E,y])=>{let w="";if(d.id==="driverWinsBody"||d.id==="driverTitlesBody"){const $=h[E];$?.photoDataUrl&&(w=$.photoDataUrl)}if(d.id==="teamWinsBody"||d.id==="teamTitlesBody"){const $=f[E];$?.logoDataUrl&&(w=$.logoDataUrl)}return w||(w="/default-logo.png"),`
        <div class="record-item ${p.isChampion?"champion":""}">
          <div class="rec-thumb"><img src="${w}" /></div>
          <div class="rec-text">
            <div class="rec-name">${u(E)}</div>
            <div class="rec-sub">${u("")}</div>
          </div>
          <div class="rec-number">${y}</div>
        </div>
      `}).join("")}i(o,Ct,{top:3,isChampion:!1}),i(a,qt,{top:3,isChampion:!1});const l=c.driverTitles||{},v=c.teamTitles||{};i(l,Rt,{top:3,isChampion:!0}),i(v,Pt,{top:3,isChampion:!0}),b(P,c)}function Ut(){const e={};return r.forEach(t=>t.results.forEach(n=>{if(!n.name?.trim())return;let s=n.points||0;t.pole?.driver===n.name&&(s+=1),t.fl?.driver===n.name&&n.pos<=10&&(s+=1),e[n.name]=(e[n.name]||0)+s})),Object.entries(e).sort((t,n)=>n[1]-t[1])[0]?.[0]||null}function jt(){let e={};r.forEach(n=>{n.results.forEach(s=>{s.team&&(e[s.team]=(e[s.team]||0)+s.points)})});const t=Object.entries(e).sort((n,s)=>s[1]-n[1])[0];return t?t[0]:null}xt?.addEventListener("click",()=>{if(!confirm("Save current season and start a new one?"))return;const e={driverWins:{},teamWins:{}};r.forEach(o=>{if(!o.results[0]?.name?.trim())return;const a=o.results[0].name.trim(),i=o.results[0].team?.trim();e.driverWins[a]=(e.driverWins[a]||0)+1,i&&(e.teamWins[i]=(e.teamWins[i]||0)+1)}),Object.entries(e.driverWins).forEach(([o,a])=>{c.driverWins[o]=(c.driverWins[o]||0)+a}),Object.entries(e.teamWins).forEach(([o,a])=>{c.teamWins[o]=(c.teamWins[o]||0)+a});const t=Ut(),n=jt();t&&(c.driverTitles[t]=(c.driverTitles[t]||0)+1),n&&(c.teamTitles[n]=(c.teamTitles[n]||0)+1),b(P,c);const s={name:t?`${new Date().getFullYear()} — Champion: ${t}`:`${new Date().getFullYear()} Season`,date:new Date().toLocaleDateString("en-GB"),races:_(r),driverProfiles:_(h),teamProfiles:_(f),records:_(c)};R.unshift(s),b(he,R),r=r.map(o=>({...o,results:o.results.map(a=>({pos:a.pos,name:"",team:"",points:Ae[(a.pos||1)-1]??0})),pole:{driver:""},fl:{driver:""}})),k=0,b(D,r),alert(`Season saved!
New season started.`),X()});function Ot(e){confirm(`Load season:
"${e.name}"
Saved on ${e.date}?`)&&(r=_(e.races),h=_(e.driverProfiles||{}),f=_(e.teamProfiles||{}),c=_(e.records||{driverWins:{},driverTitles:{},teamWins:{},teamTitles:{}}),b(D,r),b(oe,h),b(Z,f),b(P,c),k=0,alert(`Season loaded: ${e.name}`),g("race"),X())}function Vt(e){if(!e)return;e.races.forEach(a=>{if(!a.results||!a.results[0]?.name?.trim())return;const i=a.results[0].name.trim();c.driverWins[i]!=null&&(c.driverWins[i]-=1,c.driverWins[i]<=0&&delete c.driverWins[i]);const l=a.results[0].team?.trim();l&&c.teamWins[l]!=null&&(c.teamWins[l]-=1,c.teamWins[l]<=0&&delete c.teamWins[l])});const t={},n={};e.races.forEach(a=>{a.results.forEach(i=>{if(!i.name?.trim())return;let l=i.points||0;a.pole?.driver===i.name&&(l+=1),a.fl?.driver===i.name&&i.pos<=10&&(l+=1),t[i.name]=(t[i.name]||0)+l,i.team&&(n[i.team]=(n[i.team]||0)+l)})});const s=Object.entries(t).sort((a,i)=>i[1]-a[1])[0]?.[0];s&&c.driverTitles[s]!=null&&(c.driverTitles[s]-=1,c.driverTitles[s]<=0&&delete c.driverTitles[s]);const o=Object.entries(n).sort((a,i)=>i[1]-a[1])[0]?.[0];o&&c.teamTitles[o]!=null&&(c.teamTitles[o]-=1,c.teamTitles[o]<=0&&delete c.teamTitles[o]),b(P,c)}function U(){if(G){if(!R||R.length===0){G.innerHTML='<p style="text-align:center;color:#888;margin:60px 0">No saved seasons yet</p>';return}G.innerHTML=R.map((e,t)=>`
    <div class="season-card" data-index="${t}">
      <div class="season-info"><strong>${u(e.name)}</strong><div class="season-date">Saved: ${e.date} • ${e.races.length} races</div></div>
      <div style="margin-top:8px;">
      <button class="btn primary small load-season-btn" data-i="${t}">Load</button>
      <button class="btn small view-season-btn" data-i="${t}">View</button>
      <button class="btn danger small delete-season-btn" data-i="${t}">Delete</button>
    </div>
    
    </div>
  `).join(""),G.querySelectorAll(".load-season-btn").forEach(e=>e.onclick=()=>Ot(R[Number(e.dataset.i)])),G.querySelectorAll(".view-season-btn").forEach(e=>e.onclick=()=>Gt(R[Number(e.dataset.i)])),G.querySelectorAll(".delete-season-btn").forEach(e=>{e.onclick=()=>{const t=Number(e.dataset.i),n=R[t];confirm(`Delete saved season:
"${n.name}"?

This will also remove any wins or championships this season added to the records.`)&&(Vt(n),R.splice(t,1),b(he,R),U(),F())}})}}function Gt(e){e&&(Tt.textContent=e.name,de.innerHTML="",fe.innerHTML="",e.races.forEach((t,n)=>{const s=document.createElement("div");s.className="race-list-item",s.style.padding="8px",s.style.cursor="pointer",s.dataset.i=n,s.textContent=`${n+1}. ${t.name||`Race ${n+1}`}`,s.onclick=()=>{zt(t),de.querySelectorAll(".race-list-item").forEach(o=>o.style.background=""),s.style.background="#222"},de.appendChild(s)}),e.races.length?de.querySelector(".race-list-item")?.click():fe.innerHTML='<p class="muted">No races in this season.</p>',g("seasonResults"))}function zt(e){if(!e){fe.innerHTML="";return}fe.innerHTML=`
    <h3 style="margin-top:0">${u(e.name)}</h3>
    <table class="standings-table" style="width:100%;border-collapse:collapse">
      <thead><tr><th>#</th><th>Driver</th><th>Team</th><th>Pts</th></tr></thead>
      <tbody>
        ${e.results.map(t=>`<tr><td>${t.pos}</td><td>${u(t.name)}</td><td>${u(t.team||"")}</td><td>${t.points??0}</td></tr>`).join("")}
      </tbody>
    </table>
  `}function J(){b(D,r),ae(),M(),S==="standings"&&be(),S==="constructors"&&K(),S==="records"&&F()}function X(){ae(),M(),A(),K(),F(),U()}ze.addEventListener("click",()=>Q.classList.toggle("open"));document.addEventListener("click",e=>{!Q.contains(e.target)&&!ze.contains(e.target)&&Q.classList.remove("open")});it.onclick=()=>g("drivers");rt.onclick=()=>g("calendar");It.onclick=()=>g("records");Ye.onclick=()=>{U(),g("seasons")};Lt?.addEventListener("click",()=>g("race"));kt?.addEventListener("click",()=>g("race"));pt.onclick=vt.onclick=gt.onclick=ft.onclick=()=>g("race");lt.onclick=()=>{confirm("Reset all race data?")&&(localStorage.removeItem(D),location.reload())};dt.onclick=()=>{confirm("Delete ALL saved data?")&&(localStorage.clear(),location.reload())};wt.onclick=Ht;Et.onclick=()=>{r=Ve.map(e=>({...e,results:e.results.map(t=>({...t})),pole:{driver:""},fl:{driver:""}})),b(D,r),Ke(),ae()};Qe.onclick=e=>{const t=e.target.closest("th.race-col");t&&(k=Number(t.dataset.i),g("race"))};ut.onsubmit=e=>{e.preventDefault();const t=Ue.value.trim(),n=qe.value;if(!t)return alert("Enter driver name");const s=r[k],o=s.results.findIndex(i=>!i.name.trim());if(o===-1)return alert("All slots filled");const a=h[t];s.results[o].name=t,s.results[o].team=a?.team||n||"",s.results[o].points=Ae[o]??0,J(),Ue.value="",qe.value=""};Bt.onsubmit=async e=>{e.preventDefault();const t=Pe.value.trim(),n=pe.value;if(!t)return alert("Name required");let s=h[t]?.photoDataUrl||null;Se.files[0]&&(s=await Ge(Se.files[0])),h[t]={name:t,team:n,photoDataUrl:s},b(oe,h),n&&!f[n]&&(f[n]={name:n}),b(Z,f),A(),M(),Pe.value="",pe.value="",Se.value=""};$t.onsubmit=async e=>{e.preventDefault();const t=Fe.value.trim();if(!t)return alert("Team name required");let n=f[t]?.logoDataUrl||null,s=f[t]?.color||"#e10600";De.files[0]&&(n=await Ge(De.files[0]));const o=document.getElementById("teamColor");o&&o.value&&(s=o.value),f[t]={name:t,logoDataUrl:n,color:s},b(Z,f),A(),M(),A(),Fe.value="",De.value="",o&&(o.value="#e10600")};document.getElementById("addDriverWin")?.addEventListener("click",()=>{const e=document.getElementById("recordDriverName")?.value?.trim();e&&(c.driverWins[e]=(c.driverWins[e]||0)+1,b(P,c),F(),document.getElementById("recordDriverName").value="")});document.getElementById("addDriverTitle")?.addEventListener("click",()=>{const e=document.getElementById("recordDriverChampName")?.value?.trim();e&&(c.driverTitles[e]=(c.driverTitles[e]||0)+1,b(P,c),F(),document.getElementById("recordDriverChampName").value="")});document.getElementById("addTeamWin")?.addEventListener("click",()=>{const e=document.getElementById("recordTeamName")?.value?.trim();e&&(c.teamWins[e]=(c.teamWins[e]||0)+1,b(P,c),F(),document.getElementById("recordTeamName").value="")});document.getElementById("addTeamTitle")?.addEventListener("click",()=>{const e=document.getElementById("recordTeamChampName")?.value?.trim();e&&(c.teamTitles[e]=(c.teamTitles[e]||0)+1,b(P,c),F(),document.getElementById("recordTeamChampName").value="")});const ue=document.getElementById("recordDataView"),Qt=document.getElementById("backFromRecordData"),Yt=document.getElementById("recordForm"),ve=document.getElementById("recordType"),ge=document.getElementById("recordName"),ye=document.getElementById("recordCount"),Kt=document.getElementById("clearRecordForm"),Jt=document.getElementById("currentRecordsList"),V=document.getElementById("editRecordsBtn");V.onclick=()=>{g("recordData"),Ne()};function Ne(){const e=[["Driver Race Wins","driverWins"],["Driver Championships","driverTitles"],["Team Race Wins","teamWins"],["Team Championships","teamTitles"]];Jt.innerHTML=e.map(([t,n])=>{const s=Object.entries(c[n]||{});return`
      <div class="record-edit-block">
        <h3>${t}</h3>
        ${s.length?s.map(([o,a])=>`
          <div class="record-edit-row">
            <span class="rec-name">${u(o)}</span>
            <span class="rec-count">${a}</span>
            <button class="btn small" onclick="editRecord('${n}','${u(o)}', ${a})">Edit</button>
            <button class="btn small danger" onclick="deleteRecord('${n}','${u(o)}')">Delete</button>
          </div>`).join(""):'<p class="muted">None</p>'}
      </div>
    `}).join("")}window.editRecord=function(e,t,n){ve.value=e,ge.value=t,ye.value=n,g("recordData")};window.deleteRecord=function(e,t){confirm(`Delete record for "${t}"?`)&&(delete c[e][t],b(P,c),Ne(),F())};Yt.addEventListener("submit",e=>{e.preventDefault();const t=ve.value,n=ge.value.trim(),s=Number(ye.value);if(!t||!n||isNaN(s))return alert("Fill all fields");c[t][n]=s,b(P,c),Ne(),F(),ve.value="",ge.value="",ye.value=""});Kt.onclick=()=>{ve.value="",ge.value="",ye.value=""};Qt.onclick=()=>g("records");const Zt=g;g=function(e){Zt(e),e==="recordData"&&(ue.style.display="block",z.style.display="none")};Ye?.addEventListener("click",()=>{U(),g("seasons")});Dt?.addEventListener("click",()=>g("seasons"));St?.addEventListener("click",()=>g("race"));const Xt=document.getElementById("driverStatsBtn"),ce=document.getElementById("driverStatsView"),en=document.getElementById("driverStatsGrid"),tn=document.getElementById("backFromDriverStats");statsBtn?.addEventListener("click",e=>{if(e.stopPropagation(),!statsDropdownMenu){console.error("statsDropdownMenu not found");return}const t=statsDropdownMenu.classList.contains("open");document.querySelectorAll(".dropdown-menu").forEach(n=>{n.classList.remove("open")}),t||(statsDropdownMenu.classList.add("open"),nn())});document.addEventListener("click",e=>{document.querySelector(".stats-dropdown")?.contains(e.target)||statsDropdownMenu?.classList.remove("open")});function nn(){if(!statsDropdownMenu)return;const e=[{label:"📊 Driver Statistics",view:"driverStats",icon:"📊"},{label:"🤝 Teammate Head-to-Head",view:"teammates",icon:"🤝"}];statsDropdownMenu.innerHTML=e.map(t=>`
    <div class="stats-dropdown-item" data-view="${t.view}" 
         style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px;transition:background 0.2s;">
      <span style="font-size:20px;">${t.icon}</span>
      <span>${u(t.label)}</span>
    </div>
  `).join(""),statsDropdownMenu.querySelectorAll(".stats-dropdown-item").forEach(t=>{t.addEventListener("mouseenter",()=>{t.style.background="#222"}),t.addEventListener("mouseleave",()=>{t.style.background="transparent"}),t.onclick=n=>{n.stopPropagation();const s=t.dataset.view;statsDropdownMenu.classList.remove("open"),s==="driverStats"?(g("driverStats"),ie()):s==="teammates"&&(g("teammates"),Je())}})}function sn(){const e=new Map;return r.forEach((n,s)=>{const o=(n.pole?.driver||"").trim(),a=(n.fl?.driver||"").trim();if(n.results.forEach(i=>{const l=(i.name||"").trim();if(!l)return;e.has(l)||e.set(l,{name:l,team:i.team||h[l]?.team||"",wins:0,podiums:0,top10:0,poles:0,fastestLaps:0,pointsTotal:0,racesCount:0,finishSum:0});const v=e.get(l);v.racesCount+=1;const m=Number(i.pos)||null;m===1&&(v.wins+=1),m&&m<=3&&(v.podiums+=1),m&&m<=10&&(v.top10+=1),typeof i.points=="number"&&(v.pointsTotal+=i.points),m&&(v.finishSum+=m)}),o){const i=e.get(o)||null;i&&(i.poles+=1)}if(a){const i=e.get(a)||null;i&&(i.fastestLaps+=1)}}),[...e.values()].map(n=>({...n,avgPoints:n.racesCount?n.pointsTotal/n.racesCount:0,avgFinish:n.racesCount?n.finishSum/n.racesCount:1/0}))}function O(e,t,n=!0){return!e||e.length===0?null:e.slice().sort((o,a)=>o[t]===a[t]?o.name.localeCompare(a.name):n?a[t]-o[t]:o[t]-a[t])[0]||null}function ie(){const e=sn(),t=O(e,"wins",!0),n=O(e,"podiums",!0),s=O(e,"top10",!0),o=O(e,"fastestLaps",!0),a=O(e,"poles",!0),i=O(e,"avgPoints",!0),l=O(e,"avgFinish",!1);function v(d,p,B,T,E){if(!p)return`<div class="stat-card empty"><div class="stat-card-inner"><div class="stat-title">${u(d)}</div><div class="stat-empty">No data</div></div></div>`;const y=h[p.name]||{},w=p.team||y.team||"",x=f[w]?.color||"#e10600",$=y.photoDataUrl?`<img src="${y.photoDataUrl}" class="stat-thumb" style="--team-color:${x}" />`:`<div class="stat-thumb placeholder" style="--team-color:${x}">?</div>`;return`
      <div class="stat-card">
        <div class="stat-card-inner" style="--accent:${E};">
          <div class="stat-left">
            ${$}
            <div class="stat-info">
              <div class="stat-title">${u(d)}</div>
              <div class="stat-name">${u(p.name)}</div>
              <div class="stat-team">${u(w||y.team||"-")}</div>
            </div>
          </div>
          <div class="stat-value">
            <div class="stat-value-label">${u(B)}</div>
            <div class="stat-value-number">${T}</div>
          </div>
        </div>
      </div>
    `}const m=[v("Most Wins",t||{name:"—",team:"—"},"Wins",t?t.wins:"0","#b30000"),v("Most Podiums",n||{name:"—",team:"—"},"Podiums",n?n.podiums:"0","#d94800"),v("Most Top 10",s||{name:"—",team:"—"},"Top 10s",s?s.top10:"0","#c13a8a"),v("Most Fastest Laps",o||{name:"—",team:"—"},"Fastest Laps",o?o.fastestLaps:"0","#8a2be2"),v("Most Poles",a||{name:"—",team:"—"},"Poles",a?a.poles:"0","#ffd700"),v("Highest Avg Points",i||{name:"—",team:"—"},"Avg Points",i?i.avgPoints.toFixed(2):"0.00","#e10600"),v("Best Avg Finish",l||{name:"—",team:"—"},"Avg Finish",l?l.avgFinish.toFixed(2):"—","#00bfa5")];en.innerHTML=`<div class="stat-grid">${m.join("")}</div>`}Xt?.addEventListener("click",()=>{g("driverStats"),ie()});tn?.addEventListener("click",()=>g("race"));const on=g;g=function(e){on(e),e==="driverStats"?ce&&(ce.style.display="block",ie()):ce&&(ce.style.display="none")};const an=X;X=function(){an(),S==="driverStats"&&ie()};st();const rn=document.getElementById("teammatesBtn"),me=document.getElementById("teammatesView"),Re=document.getElementById("teammateTeamSelect"),Me=document.getElementById("teammateComparison"),ln=document.getElementById("backFromTeammates");rn?.addEventListener("click",()=>{g("teammates"),Je()});ln?.addEventListener("click",()=>g("race"));function Je(){const e={};r.forEach(n=>{n.results.forEach(s=>{if(!s.name?.trim()||!s.team?.trim())return;const o=s.team.trim();e[o]||(e[o]=new Set),e[o].add(s.name.trim())})});const t=Object.entries(e).filter(([n,s])=>s.size>=2).map(([n])=>n);if(t.length===0){Me.innerHTML='<p class="muted" style="text-align:center;margin-top:40px;">No teams with multiple drivers found.</p>';return}Re.innerHTML=t.map(n=>`<option value="${u(n)}">${u(n)}</option>`).join(""),Re.onchange=()=>Oe(Re.value),Oe(t[0])}function je(e){let t=0,n=[],s=[],o=0,a=0,i=0,l=0,v=0,m=0,d=1/0,p=1/0;r.forEach(E=>{const y=E.results.find(w=>w.name?.trim()===e);if(y){t++;const w=y.pos||1/0;s.push(w),o+=y.points||0,w===1&&a++,w<=3&&i++,w<=10&&l++,(w>20||y.dnf)&&v++,w<d&&(d=w)}if(E.qualifying&&Array.isArray(E.qualifying)){const w=E.qualifying.find(x=>x.name?.trim()===e);if(w&&w.pos){const x=w.pos;n.push(x),x<p&&(p=x),x===1&&m++}}E.pole?.driver?.trim()===e&&!n.includes(1)&&(m++,n.push(1),p=1)});const B=s.length?s.reduce((E,y)=>E+y,0)/s.length:1/0,T=n.length?n.reduce((E,y)=>E+y,0)/n.length:1/0;return{races_count:t,points:o,wins:a,podiums:i,top10s:l,dnfs:v,poles:m,best_race_finish:d===1/0?null:d,best_grid_position:p===1/0?null:p,avg_race_finish:B,avg_grid:T,qualifying_wins:n.length}}function Oe(e){const t=new Set;r.forEach(I=>{I.results.forEach(L=>{L.team?.trim()===e&&L.name?.trim()&&t.add(L.name.trim())})});const n=[...t];if(n.length<2){Me.innerHTML='<p class="muted">Not enough drivers in this team.</p>';return}const s=n[0],o=n[1],a=je(s),i=je(o);let l=0,v=0;r.forEach(I=>{if(!I.qualifying)return;const L=I.qualifying.find(W=>W.name?.trim()===s),N=I.qualifying.find(W=>W.name?.trim()===o);if(L&&N){const W=L.pos||1/0,ee=N.pos||1/0;W<ee?l++:ee<W&&v++}});const m=[{key:"races",label:"RACE",v1:a.races_count,v2:i.races_count,reverse:!1},{key:"qualifying",label:"QUALIFYING",v1:l,v2:v,reverse:!1},{key:"points",label:"POINTS",v1:a.points,v2:i.points,reverse:!1},{key:"wins",label:"WINS",v1:a.wins,v2:i.wins,reverse:!1},{key:"podiums",label:"PODIUMS",v1:a.podiums,v2:i.podiums,reverse:!1},{key:"top10",label:"TOP 10",v1:a.top10s,v2:i.top10s,reverse:!1},{key:"dnf",label:"DNF",v1:i.dnfs,v2:a.dnfs,reverse:!1}];let d=0,p=0;m.forEach(I=>{I.v1>I.v2&&d++,I.v2>I.v1&&p++});const B=d>p?s:o,T=Math.max(d,p),E=m.length;function y(I,L,N,W=!1){const ee=L+N||1,Ze=L/ee*100,Xe=N/ee*100,le=W?L<N?"left":"right":L>N?"left":"right",_e=(te,et)=>et?te:typeof te=="number"&&!Number.isInteger(te)?te.toFixed(2):te,He=I==="QUALIFYING";return`
      <div class="tm-metric">
        <div class="tm-values">
          <span class="tm-val ${le==="left"?"winner":""}">${_e(L,He)}</span>
          <span class="tm-label">${I}</span>
          <span class="tm-val ${le==="right"?"winner":""}">${_e(N,He)}</span>
        </div>
        <div class="tm-bar">
          <div class="tm-bar-left ${le==="left"?"winning":""}" style="width:${Ze}%"></div>
          <div class="tm-bar-right ${le==="right"?"winning":""}" style="width:${Xe}%"></div>
        </div>
      </div>
    `}const w=h[s]||{},x=h[o]||{},$=f[e]?.color||"#e10600",j=w.photoDataUrl?`<img src="${w.photoDataUrl}" class="tm-photo" style="--team-color:${$}" />`:`<div class="tm-photo placeholder" style="--team-color:${$}">?</div>`,re=x.photoDataUrl?`<img src="${x.photoDataUrl}" class="tm-photo" style="--team-color:${$}" />`:`<div class="tm-photo placeholder" style="--team-color:${$}">?</div>`;Me.innerHTML=`
    <div class="tm-container">
      <div class="tm-summary">
        <div class="tm-summary-inner">
          <h3>Head-to-Head Summary</h3>
          <div class="tm-leader">
            ${B===s?j:re}
            <div class="tm-leader-text">
              <span class="tm-leader-name">${u(B)}</span> leads
              <div class="tm-leader-sub">Superior in ${T} of ${E} metrics</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tm-grid">
        <div class="tm-side left">
          ${j}
          <div class="tm-driver-name">${u(s)}</div>
          <div class="tm-position">P${a.best_race_finish||"—"}</div>
        </div>

        <div class="tm-middle">
          ${y("RACE",a.races_count,i.races_count)}
          ${y("QUALIFYING",l,v)}
          ${y("POINTS",a.points,i.points)}
          ${y("WINS",a.wins,i.wins)}
          ${y("PODIUMS",a.podiums,i.podiums)}
          ${y("TOP 10",a.top10s,i.top10s)}
          ${y("DNF",i.dnfs,a.dnfs)}
          
          <div class="tm-divider"></div>

          ${y("BEST RACE FINISH",a.best_race_finish||99,i.best_race_finish||99,!0)}
          ${y("BEST GRID POSITION",a.best_grid_position||99,i.best_grid_position||99,!0)}
          ${y("POLES",a.poles,i.poles)}
        </div>

        <div class="tm-side right">
          ${re}
          <div class="tm-driver-name">${u(o)}</div>
          <div class="tm-position">P${i.best_race_finish||"—"}</div>
        </div>
      </div>
    </div>
  `}const dn=g;g=function(e){dn(e),e!=="teammates"&&me&&(me.style.display="none"),e==="teammates"&&me&&(me.style.display="block")};let q=0;const cn=document.getElementById("qualifyingBtn"),H=document.getElementById("qualifyingDropdownMenu");cn?.addEventListener("click",e=>{if(e.stopPropagation(),console.log("Qualifying button clicked"),!H){console.error("qualifyingDropdownMenu not found");return}const t=H.classList.contains("open");document.querySelectorAll(".dropdown-menu").forEach(n=>{n.classList.remove("open")}),t||(H.classList.add("open"),mn())});document.addEventListener("click",e=>{document.querySelector(".qualifying-dropdown")?.contains(e.target)||H?.classList.remove("open")});function mn(){if(!H){console.error("qualifyingDropdownMenu element not found");return}console.log("Rendering qualifying dropdown with",r.length,"races"),H.innerHTML=r.map((e,t)=>{const n=e.flag||`https://flagcdn.com/w40/${e.country||"un"}.png`;return`
      <div class="quali-dropdown-item" data-race-index="${t}" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid #222;display:flex;align-items:center;gap:8px;">
        <img src="${n}" style="width:24px;height:16px;border-radius:3px;object-fit:cover;" onerror="this.style.display='none'" />
        <span>${u(e.name||`Race ${t+1}`)}</span>
      </div>
    `}).join(""),H.querySelectorAll(".quali-dropdown-item").forEach(e=>{e.onclick=t=>{t.stopPropagation();const n=Number(e.dataset.raceIndex);console.log("Selected race index:",n),q=n,H.classList.remove("open"),g("qualifying"),setTimeout(()=>We(),50)}})}function We(){console.log("renderQualifying called for race index:",q);const e=document.getElementById("qualifyingBody")||document.querySelector("#qualifyingBody")||document.querySelector(".qualifying-body")||document.querySelector("tbody"),t=document.getElementById("qualifyingTitle")||document.querySelector("#qualifyingTitle")||document.querySelector(".qualifying-title");console.log("qualifyingBody found:",!!e),console.log("qualifyingTitle found:",!!t);const n=r[q];if(!n){console.error("No race found at index:",q),e&&(e.innerHTML='<tr><td colspan="4" style="text-align:center;padding:40px;color:#666;">Race not found. Please select a race from the dropdown.</td></tr>'),t&&(t.textContent="Qualifying");return}for(console.log("Rendering qualifying for race:",n.name),t&&(t.textContent=`Qualifying — ${n.name||`Race ${q+1}`}`),(!n.qualifying||!Array.isArray(n.qualifying))&&(console.log("Initializing qualifying array for race:",n.name),n.qualifying=[]);n.qualifying.length<24;){const o=n.qualifying.length;n.qualifying.push({pos:o+1,name:"",team:"",time:""})}if(n.qualifying=n.qualifying.map((o,a)=>({pos:o?.pos||a+1,name:o?.name||"",team:o?.team||"",time:o?.time||""})),typeof b=="function"&&typeof D<"u"&&b(D,r),!e){console.error("qualifyingBody element not found - cannot render table"),console.error("Available elements:",{byId:document.getElementById("qualifyingBody"),byQuery:document.querySelector("#qualifyingBody"),allTbody:document.querySelectorAll("tbody").length});return}const s=n.qualifying.slice(0,24).map((o,a)=>{const i=(o.name||"").trim(),l=(o.team||"").trim(),v=i&&typeof h<"u"?h[i]||{}:{},m=l||v.team||"";let d="#555";m&&typeof f<"u"&&f[m]&&(d=f[m].color||"#e10600");const p=v.photoDataUrl?`<img src="${v.photoDataUrl}" style="border:2px solid ${d};width:40px;height:40px;border-radius:50%;object-fit:cover;" />`:`<div style="width:40px;height:40px;border-radius:50%;background:#222;display:flex;align-items:center;justify-content:center;color:#666;font-size:16px;border:2px solid ${d};">?</div>`;let B="";return m&&typeof f<"u"&&f[m]?.logoDataUrl&&(B=`<img src="${f[m].logoDataUrl}" style="width:28px;height:28px;object-fit:contain;margin-left:8px;" />`),`
      <tr style="background:#111;border-bottom:1px solid #222;">
        <td style="text-align:center;font-weight:bold;color:#e10600;padding:12px;">${o.pos}</td>
        <td style="padding:12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${p}
            <input class="quali-driver-edit" data-index="${a}" value="${u(i)}" placeholder="Enter driver name..." style="background:#000;color:white;border:1px solid #333;border-radius:4px;padding:8px;flex:1;font-size:14px;" />
          </div>
        </td>
        <td style="text-align:center;padding:12px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
            <span style="color:${m?"#aaa":"#555"};">${u(m||"—")}</span>
            ${B}
          </div>
        </td>
        <td style="text-align:center;padding:12px;">
          <input class="quali-time-edit" data-index="${a}" value="${u(o.time||"")}" placeholder="1:23.456" style="background:#000;color:white;border:1px solid #333;border-radius:4px;padding:8px;width:140px;text-align:center;font-size:14px;font-family:monospace;" />
        </td>
      </tr>
    `}).join("");e.innerHTML=s,console.log("✅ Qualifying table rendered successfully with 24 positions"),un()}function un(){document.querySelectorAll(".quali-driver-edit").forEach(e=>{e.onchange=()=>{const t=Number(e.dataset.index),n=e.value.trim();r[q]&&r[q].qualifying[t]&&(r[q].qualifying[t].name=n,n&&typeof h<"u"&&h[n]?.team&&(r[q].qualifying[t].team=h[n].team),typeof b=="function"&&typeof D<"u"&&b(D,r),We())}}),document.querySelectorAll(".quali-time-edit").forEach(e=>{e.onchange=()=>{const t=Number(e.dataset.index);r[q]&&r[q].qualifying[t]&&(r[q].qualifying[t].time=e.value.trim(),typeof b=="function"&&typeof D<"u"&&b(D,r))}})}console.log("✅ Qualifying dropdown code loaded");(function(){console.log("🔄 Initializing Season Management Dropdown...");const e=document.getElementById("seasonManagementBtn"),t=document.getElementById("seasonDropdownMenu");if(!e||!t){console.error("❌ Season dropdown elements not found!"),console.error("Button:",e),console.error("Menu:",t);return}console.log("✅ Season dropdown elements found"),e.addEventListener("click",function(o){o.stopPropagation(),console.log("🖱️ Season button clicked");const a=t.classList.contains("open");document.querySelectorAll(".dropdown-menu").forEach(function(i){i.classList.remove("open")}),a||(t.classList.add("open"),n(),console.log("✅ Season dropdown opened"))}),document.addEventListener("click",function(o){const a=e.closest(".dropdown");a&&!a.contains(o.target)&&t.classList.remove("open")});function n(){console.log("📝 Rendering season menu...");const o=[{icon:"💾",label:"Save Current Season",action:"save",style:"color:#4CAF50;font-weight:600;"},{icon:"📚",label:"View Saved Seasons",action:"view",style:""},{icon:"🔄",label:"Reset Current Season",action:"reset",style:"border-top:1px solid #333;margin-top:8px;padding-top:12px;"},{icon:"🗑️",label:"Clear All Data",action:"clear",style:"color:#ff4444;"}];t.innerHTML=o.map(function(a){return`
        <div class="season-dropdown-item" data-action="${a.action}" style="${a.style}">
          <span style="font-size:20px;">${a.icon}</span>
          <span>${a.label}</span>
        </div>
      `}).join(""),console.log("✅ Menu rendered with",o.length,"items"),t.querySelectorAll(".season-dropdown-item").forEach(function(a){a.addEventListener("mouseenter",function(){this.style.background="#222"}),a.addEventListener("mouseleave",function(){this.style.background="transparent"}),a.addEventListener("click",function(i){i.stopPropagation();const l=this.getAttribute("data-action");console.log("🖱️ Menu item clicked:",l),t.classList.remove("open"),s(l)})})}function s(o){const a=document.getElementById("saveSeasonBtn");document.getElementById("seasonsBtn"),document.getElementById("resetBtn"),document.getElementById("clearStorageBtn"),o==="save"?(console.log("💾 Triggering save season..."),a?a.click():console.error("❌ saveSeasonBtn not found")):o==="view"?(console.log("📚 Viewing saved seasons..."),typeof U=="function"&&U(),typeof g=="function"&&g("seasons")):o==="reset"?(console.log("🔄 Resetting season..."),confirm("Reset all race data for the current season?")&&(localStorage.removeItem(D),location.reload())):o==="clear"&&(console.log("🗑️ Clearing all data..."),confirm("Delete ALL saved data? This cannot be undone!")&&(localStorage.clear(),location.reload()))}console.log("✅ Season Management Dropdown initialized successfully")})();(function(){console.log("📊 Initializing Tables Dropdown...");const e=document.getElementById("tablesBtn"),t=document.getElementById("tablesDropdownMenu");if(!e||!t){console.error("❌ Tables dropdown elements not found!"),console.error("Button:",e),console.error("Menu:",t);return}console.log("✅ Tables dropdown elements found"),e.addEventListener("click",function(o){o.stopPropagation(),console.log("🖱️ Tables button clicked");const a=t.classList.contains("open");document.querySelectorAll(".dropdown-menu").forEach(function(i){i.classList.remove("open")}),a||(t.classList.add("open"),n(),console.log("✅ Tables dropdown opened"))}),document.addEventListener("click",function(o){const a=e.closest(".dropdown");a&&!a.contains(o.target)&&t.classList.remove("open")});function n(){console.log("📝 Rendering tables menu...");const o=[{icon:"🏆",label:"Driver Standings",action:"standings",style:""},{icon:"🏁",label:"Constructors Championship",action:"constructors",style:""}];t.innerHTML=o.map(function(a){return`
        <div class="tables-dropdown-item" data-action="${a.action}" style="${a.style}">
          <span style="font-size:20px;">${a.icon}</span>
          <span>${a.label}</span>
        </div>
      `}).join(""),console.log("✅ Tables menu rendered with",o.length,"items"),t.querySelectorAll(".tables-dropdown-item").forEach(function(a){a.addEventListener("mouseenter",function(){this.style.background="#222"}),a.addEventListener("mouseleave",function(){this.style.background="transparent"}),a.addEventListener("click",function(i){i.stopPropagation();const l=this.getAttribute("data-action");console.log("🖱️ Tables menu item clicked:",l),t.classList.remove("open"),s(l)})})}function s(o){o==="standings"?(console.log("🏆 Opening Driver Standings..."),typeof g=="function"?g("standings"):console.error("❌ showView function not found")):o==="constructors"&&(console.log("🏁 Opening Constructors Championship..."),typeof g=="function"?g("constructors"):console.error("❌ showView function not found"))}console.log("✅ Tables Dropdown initialized successfully")})();
