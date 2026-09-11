/* Front-end pages only. Forms confirm on screen. Nothing is stored. */
const OTP = "482916";

const areas = [
  "Central Ward",
  "Harbour Ward",
  "North Residential",
  "Market Area",
  "Riverside"
];

const departments = [
  "Public Works",
  "Water Supply",
  "Health & Sanitation",
  "Electricity",
  "Revenue & Certificates",
  "Social Welfare"
];

const ui = { view: "landing", step: 1, draft: {}, geo: null, receipt: null };
const landingNav = document.getElementById("top-nav").innerHTML;
const topbar = document.getElementById("site-top");
const navToggle = document.getElementById("nav-toggle");

function setMenuOpen(open) {
  topbar.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  const label = navToggle.querySelector(".nav-toggle-text");
  if (label) label.textContent = open ? "Close" : "Menu";
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.getElementById("toasts").appendChild(node);
  setTimeout(() => node.remove(), 3200);
}

function phone(mobile) {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length === 10) return digits.slice(0, 5) + " " + digits.slice(5);
  return mobile || "—";
}

function ref(prefix) {
  return prefix + "-" + Math.floor(10000 + Math.random() * 89999);
}

function options(list) {
  return list.map((item) => `<option>${esc(item)}</option>`).join("");
}

function setTop() {
  const nav = document.getElementById("top-nav");
  setMenuOpen(false);
  if (ui.view === "landing") {
    nav.innerHTML = landingNav;
    topbar.classList.remove("topbar-app");
    return;
  }
  nav.innerHTML = `<button class="btn btn-ghost btn-sm" type="button" data-action="home">Back to site</button>`;
  topbar.classList.add("topbar-app");
}

function page(kicker, title, body) {
  return `
    <div class="wizard">
      <header>
        <div class="kicker"><i></i> ${esc(kicker)}</div>
        <h2>${title}</h2>
      </header>
      <div class="pane">${body}</div>
    </div>`;
}

function receipt(title, lines) {
  return `
    <div class="note"><strong>${esc(title)}</strong></div>
    ${lines.map((line) => `<p class="help">${esc(line)}</p>`).join("")}
    <button class="btn btn-ink" type="button" data-action="home">Back to site</button>`;
}

function citizenHome() {
  return page("Citizen", "Start here.", `
    <p class="help">Register with a missed call, or sign in if you already have a profile. A request and a meeting are separate forms.</p>
    <div class="stack">
      <button class="btn btn-req" type="button" data-action="open-register">Register</button>
      <button class="btn btn-ghost" type="button" data-action="open-signin">Sign in</button>
      <button class="btn btn-soft" type="button" data-action="open-request">File a request</button>
      <button class="btn btn-apt" type="button" data-action="open-meeting">Request a meeting</button>
    </div>
  `);
}

function register() {
  const step = ui.step;
  if (ui.receipt) {
    return page("Citizen", "Profile noted.", receipt(ui.receipt.id, [
      ui.receipt.name + " · " + phone(ui.receipt.mobile),
      ui.receipt.area + (ui.receipt.place ? " · " + ui.receipt.place : ""),
      "A WhatsApp and SMS confirmation is sent to this mobile."
    ]));
  }
  const marks = [1, 2, 3, 4, 5].map((n) => `<span class="${step >= n ? "on" : ""}"></span>`).join("");
  const panes = {
    1: `
      <p class="help">Give a missed call on the dedicated number. A registration link is sent by WhatsApp and SMS. The call is not answered.</p>
      <div class="phone">
        <div class="help">Dedicated number</div>
        <div style="font-size:32px;font-weight:600;letter-spacing:-.03em">0484 410 2200</div>
      </div>
      <button class="btn btn-req" type="button" data-action="missed-call">Place missed call</button>`,
    2: `
      <div class="bubble">Rapid Response Services: your registration link is ready. Open it to complete your profile. This link is tied to the missed-call number.</div>
      <p class="help">Use the button below to open the form sent with that message.</p>
      <button class="btn btn-req" type="button" data-action="step" data-step="3">Open registration form</button>`,
    3: `
      <form class="form-grid" data-form="register">
        <label>Full name<input name="name" required value="${esc(ui.draft.name || "")}"></label>
        <label>Mobile<input name="mobile" required inputmode="numeric" placeholder="10-digit mobile" value="${esc(ui.draft.mobile || "")}"></label>
        <label>Email<input name="email" type="email" required value="${esc(ui.draft.email || "")}"></label>
        <label>Language
          <select name="language"><option>English</option><option>Malayalam</option><option>Hindi</option></select>
        </label>
        <label class="full">Address<textarea name="address" required>${esc(ui.draft.address || "")}</textarea></label>
        <label>Ward
          <select name="area" required>
            <option value="">Select ward</option>
            ${options(areas)}
          </select>
        </label>
        <div class="full"><button class="btn btn-req" type="submit">Send verification code</button></div>
      </form>`,
    4: `
      <div class="note">Verification code sent to your mobile: <strong>${OTP}</strong></div>
      <form class="stack" data-form="verify">
        <label>6-digit code<input name="otp" inputmode="numeric" maxlength="6" required placeholder="${OTP}"></label>
        <button class="btn btn-req" type="submit">Verify</button>
      </form>`,
    5: `
      <p class="help">Location is stored only if you allow it. The ward you chose is already enough to route the file.</p>
      <div class="note">${ui.geo ? "Location saved: " + ui.geo : "No map pin yet. You can finish with the ward you selected."}</div>
      <div class="inline">
        <button class="btn btn-req" type="button" data-action="geo">Allow location</button>
        <button class="btn btn-ink" type="button" data-action="finish-register">Submit profile</button>
      </div>`
  };
  return `
    <div class="wizard">
      <header>
        <div class="kicker"><i></i> Registration</div>
        <h2>${step === 1 ? "Call, then hang up." : step === 2 ? "Check WhatsApp or SMS." : step === 3 ? "Your details." : step === 4 ? "Verify the mobile." : "Share your place."}</h2>
      </header>
      <div class="steps-mini">${marks}</div>
      <div class="pane">${panes[step]}</div>
    </div>`;
}

function signIn() {
  if (ui.receipt) {
    return page("Citizen", "Signed in.", receipt(ui.receipt.name, [
      phone(ui.receipt.mobile),
      "File a request or ask for a meeting from the site."
    ]));
  }
  return page("Citizen", "Sign in with the code.", `
    <div class="note">Registered mobile <strong>98765 43210</strong> · code <strong>${OTP}</strong></div>
    <form class="stack" data-form="signin">
      <label>Mobile<input name="mobile" required value="9876543210"></label>
      <label>Code<input name="otp" required value="${OTP}"></label>
      <button class="btn btn-req" type="submit">Sign in</button>
    </form>
  `);
}

function requestForm() {
  if (ui.receipt) {
    return page("Request", "Request received.", receipt(ui.receipt.id, [
      ui.receipt.title,
      ui.receipt.department + " · " + ui.receipt.area,
      "The officer for that ward is notified by portal, SMS and email."
    ]));
  }
  return page("Request", "Name the issue and the place.", `
    <form class="stack" data-form="request">
      <label>Your name<input name="name" required></label>
      <label>Mobile<input name="mobile" required inputmode="numeric"></label>
      <label>Subject<input name="title" required placeholder="Leakage outside shop 14"></label>
      <label>Department
        <select name="department" required><option value="">Select</option>${options(departments)}</select>
      </label>
      <label>Ward
        <select name="area" required><option value="">Select</option>${options(areas)}</select>
      </label>
      <label>What happened<textarea name="details" required placeholder="Where it is, since when, and who is affected"></textarea></label>
      <button class="btn btn-req" type="submit">Submit request</button>
    </form>
  `);
}

function meetingForm() {
  if (ui.receipt) {
    return page("Appointment", "Meeting request received.", receipt(ui.receipt.id, [
      ui.receipt.purpose,
      "With Meera Nair, MLA, Central Constituency",
      "The office reviews this separately from a complaint, then offers a time slot."
    ]));
  }
  return page("Appointment", "A meeting, not a complaint.", `
    <p class="help">With Meera Nair, MLA, Central Constituency.</p>
    <form class="stack" data-form="meeting">
      <label>Your name<input name="name" required></label>
      <label>Mobile<input name="mobile" required inputmode="numeric"></label>
      <label>Purpose<input name="purpose" required placeholder="What you need to discuss"></label>
      <label>Details<textarea name="details" required></textarea></label>
      <button class="btn btn-apt" type="submit">Submit meeting request</button>
    </form>
  `);
}

function eventForm() {
  if (ui.receipt) {
    return page("Event", "Attendance noted.", receipt(ui.receipt.event, [
      ui.receipt.name + " · " + ui.receipt.area,
      "A reminder is sent the day before."
    ]));
  }
  return page("Event", "Confirm you will attend.", `
    <form class="stack" data-form="event">
      <label>Your name<input name="name" required></label>
      <label>Mobile<input name="mobile" required inputmode="numeric"></label>
      <label>Ward
        <select name="area" required><option value="">Select</option>${options(areas)}</select>
      </label>
      <label>Event
        <select name="event" required>
          <option value="">Select</option>
          <option>Harbour health camp</option>
          <option>Central ward evening meeting</option>
          <option>Riverside clean-up</option>
        </select>
      </label>
      <button class="btn btn-evt" type="submit">Confirm attendance</button>
    </form>
  `);
}

function login(kind) {
  const officer = kind === "officer";
  if (ui.receipt) {
    return page(officer ? "Officer" : "Admin", "Signed in.", receipt(ui.receipt.name, [
      ui.receipt.role,
      "Sign-in complete."
    ]));
  }
  return `
    <div class="login-card">
      <div class="kicker"><i></i> ${officer ? "Officer" : "Politician / Admin"}</div>
      <h2>${officer ? "Officer sign-in." : "Office sign-in."}</h2>
      <p class="help">${officer ? "Assigned cases stay with the officer after sign-in." : "Meetings, events and the full case view stay with the office after sign-in."}</p>
      <div class="note">${officer
        ? "Email <strong>rahul.menon@rapidresponse.in</strong><br>Password <strong>officer123</strong>"
        : "Email <strong>meera.nair@rapidresponse.in</strong><br>Password <strong>admin123</strong>"}</div>
      <form class="stack" data-form="${officer ? "officer-login" : "admin-login"}">
        <label>Email<input name="email" type="email" required value="${officer ? "rahul.menon@rapidresponse.in" : "meera.nair@rapidresponse.in"}"></label>
        <label>Password<input name="password" type="password" required value="${officer ? "officer123" : "admin123"}"></label>
        <button class="btn ${officer ? "btn-apt" : "btn-ink"}" type="submit">Sign in</button>
      </form>
    </div>`;
}

function render() {
  setTop();
  const landing = document.getElementById("landing");
  const app = document.getElementById("app");
  const inApp = ui.view !== "landing";
  landing.classList.toggle("hidden", inApp);
  app.classList.toggle("hidden", !inApp);
  if (!inApp) {
    app.innerHTML = "";
    return;
  }
  const views = {
    citizen: citizenHome,
    register: register,
    signin: signIn,
    request: requestForm,
    meeting: meetingForm,
    event: eventForm,
    officer: () => login("officer"),
    admin: () => login("admin")
  };
  app.innerHTML = (views[ui.view] || citizenHome)();
  window.scrollTo(0, 0);
}

function open(view, step) {
  ui.view = view;
  ui.step = step || 1;
  ui.receipt = null;
  ui.draft = {};
  ui.geo = null;
  render();
}

navToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenuOpen(!topbar.classList.contains("is-open"));
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#top-nav a, #top-nav [data-action]")) setMenuOpen(false);
  else if (!event.target.closest("#site-top")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) setMenuOpen(false);
});

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "home") {
    ui.view = "landing";
    ui.receipt = null;
    render();
  } else if (action === "open-citizen") open("citizen");
  else if (action === "open-officer") open("officer");
  else if (action === "open-admin") open("admin");
  else if (action === "open-register") open("register", 1);
  else if (action === "open-signin") open("signin");
  else if (action === "open-request") open("request");
  else if (action === "open-meeting") open("meeting");
  else if (action === "open-event") open("event");
  else if (action === "missed-call") {
    ui.step = 2;
    toast("Missed call noted. Link sent by WhatsApp and SMS.");
    render();
  } else if (action === "step") {
    ui.step = Number(el.dataset.step);
    render();
  } else if (action === "geo") {
    if (!navigator.geolocation) {
      toast("Location is not available. Continue with the ward.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        ui.geo = pos.coords.latitude.toFixed(4) + ", " + pos.coords.longitude.toFixed(4);
        toast("Location saved.");
        render();
      },
      () => toast("Location was not shared. The selected ward will be used.")
    );
  } else if (action === "finish-register") {
    if (!ui.draft.name) {
      ui.step = 3;
      toast("Complete the form first.");
      render();
      return;
    }
    ui.receipt = {
      id: ref("CTZ"),
      name: ui.draft.name,
      mobile: ui.draft.mobile,
      area: ui.draft.area,
      place: ui.geo || ""
    };
    toast("Profile submitted. " + ui.receipt.id);
    render();
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!form.dataset.form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const kind = form.dataset.form;

  if (kind === "register") {
    const mobile = String(data.mobile || "").replace(/\D/g, "");
    if (mobile.length < 10) {
      toast("Enter a 10-digit mobile number.");
      return;
    }
    ui.draft = { ...data, mobile };
    ui.step = 4;
    toast("Verification code sent to " + phone(mobile) + ".");
    render();
    return;
  }
  if (kind === "verify") {
    if (String(data.otp).trim() !== OTP) {
      toast("That code does not match. Use " + OTP + ".");
      return;
    }
    ui.step = 5;
    toast("Mobile verified.");
    render();
    return;
  }
  if (kind === "signin") {
    const mobile = String(data.mobile || "").replace(/\D/g, "");
    if (mobile !== "9876543210" || String(data.otp).trim() !== OTP) {
      toast("Check the mobile number and the verification code.");
      return;
    }
    ui.receipt = { name: "Aisha Rahman", mobile };
    toast("Signed in.");
    render();
    return;
  }
  if (kind === "request") {
    ui.receipt = { id: ref("RR"), title: data.title.trim(), department: data.department, area: data.area };
    toast("Request submitted. " + ui.receipt.id);
    render();
    return;
  }
  if (kind === "meeting") {
    ui.receipt = { id: ref("APT"), purpose: data.purpose.trim() };
    toast("Meeting request submitted. " + ui.receipt.id);
    render();
    return;
  }
  if (kind === "event") {
    ui.receipt = { event: data.event, name: data.name.trim(), area: data.area };
    toast("Attendance confirmed.");
    render();
    return;
  }
  if (kind === "officer-login") {
    if (String(data.email).trim().toLowerCase() !== "rahul.menon@rapidresponse.in" || data.password !== "officer123") {
      toast("Email or password does not match.");
      return;
    }
    ui.receipt = { name: "Rahul Menon", role: "Assistant Engineer, Water Supply, Market Area" };
    toast("Signed in.");
    render();
    return;
  }
  if (kind === "admin-login") {
    if (String(data.email).trim().toLowerCase() !== "meera.nair@rapidresponse.in" || data.password !== "admin123") {
      toast("Email or password does not match.");
      return;
    }
    ui.receipt = { name: "Meera Nair", role: "MLA, Central Constituency" };
    toast("Signed in.");
    render();
  }
});

render();
