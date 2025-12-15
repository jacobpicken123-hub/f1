// drivers.js
//
// Handles:
//  - driver → team assignments
//  - drivers page UI
//  - saving to localStorage
//  - exposing functions to main.js

const DRIVER_STORAGE_KEY = "f1_drivers_list";

// load drivers from localStorage
export function loadDrivers() {
  try {
    const raw = localStorage.getItem(DRIVER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {}; // { "Max Verstappen": "Red Bull", ... }
}

export function saveDrivers(drivers) {
  localStorage.setItem(DRIVER_STORAGE_KEY, JSON.stringify(drivers));
}

// Get a driver's saved team (or null)
export function getDriverTeam(drivers, name) {
  return drivers[name] || null;
}

// ------------------ DRIVER PAGE UI ------------------

export function renderDriversPage(container, drivers, onSave) {
  container.innerHTML = `
    <div class="drivers-header">
      <h2>Drivers & Teams</h2>
      <button id="driversBackBtn" class="btn">Back</button>
    </div>

    <div class="drivers-add">
      <input type="text" id="newDriverName" placeholder="Driver name" />
      <input type="text" id="newDriverTeam" placeholder="Team name" />
      <button id="addDriverBtn" class="btn primary">Add / Update</button>
    </div>

    <table class="drivers-table">
      <thead>
        <tr><th>Driver</th><th>Team</th><th>Actions</th></tr>
      </thead>
      <tbody id="driversTableBody"></tbody>
    </table>
  `;

  const tbody = container.querySelector("#driversTableBody");

  function refreshTable() {
    tbody.innerHTML = Object.entries(drivers)
      .map(([driver, team]) => `
        <tr>
          <td>${driver}</td>
          <td>${team}</td>
          <td>
            <button class="btn small edit" data-name="${driver}">Edit</button>
            <button class="btn small danger delete" data-name="${driver}">Delete</button>
          </td>
        </tr>
      `)
      .join("");
  }

  refreshTable();

  // add/update driver
  container.querySelector("#addDriverBtn").onclick = () => {
    const name = container.querySelector("#newDriverName").value.trim();
    const team = container.querySelector("#newDriverTeam").value.trim();
    if (!name || !team) return alert("Enter driver + team");

    drivers[name] = team;
    saveDrivers(drivers);
    refreshTable();

    container.querySelector("#newDriverName").value = "";
    container.querySelector("#newDriverTeam").value = "";
  };

  // edit / delete logic
  tbody.onclick = (e) => {
    const name = e.target.dataset.name;
    if (!name) return;

    if (e.target.classList.contains("edit")) {
      container.querySelector("#newDriverName").value = name;
      container.querySelector("#newDriverTeam").value = drivers[name];
    }

    if (e.target.classList.contains("delete")) {
      delete drivers[name];
      saveDrivers(drivers);
      refreshTable();
    }
  };

  // caller handles returning back
  return container.querySelector("#driversBackBtn");
}
