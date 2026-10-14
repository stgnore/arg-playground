(() => {
  "use strict";

  /* =============================================================
     TEST ACCESS SETTINGS
     Change these two values when you customize your ARG.
     This is a FRONT-END DEMO only; client-side credentials are not secure.
     ============================================================= */
  const TEST_CREDENTIALS = {
    username: "admin",
    password: "admin"
  };

  const INTRO_DURATION = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1250 : 6100;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const screens = {
    boot: document.getElementById("boot-screen"),
    login: document.getElementById("login-screen")
  };
  const gate = document.getElementById("ascii-gate");
  const gateFrame = document.getElementById("gate-frame");
  const bootClock = document.getElementById("boot-clock");
  const bootPercent = document.getElementById("boot-percent");
  const bootProgress = document.getElementById("boot-progress");
  const bootCaption = document.getElementById("boot-caption");
  const skipIntro = document.getElementById("skip-intro");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("toggle-password");
  const loginResponse = document.getElementById("login-response");

  const gateLines = [
    "              __..--------------------------------------------..__              ",
    "          _.-'===================================================='-._          ",
    "      .'________________________________________________________________'.      ",
    "     /____________________________________________________________________\\     ",
    "=================|============================================|=================",
    "_________________|____________________________________________|_________________",
    "                 |                                            |                 ",
    "                 |                                            |                 ",
    "                 |                                            |                 ",
    "                 |                                            |                 ",
    "                 |                                            |                 ",
    "                 |                                            |                 ",
    "                 |                                            |                 ",
    "                _|_                                          _|_                ",
    "                               \\                /                               ",
    "                            \\                      /                            ",
    "                         \\                            /                         ",
    "                      \\                                  /                      ",
    "                   \\                                        /                   ",
    "                \\                                              /                ",
    "             \\                                                    /             ",
    "          \\                                                          /          ",
    "       \\                                                                /       ",
    "    \\                                                                      /    "
  ];

  const captions = [
    { at: 0, text: "ПОИСК СИГНАЛА" },
    { at: 16, text: "ОБНАРУЖЕНА ГРАНИЦА" },
    { at: 35, text: "ПОСТРОЕНИЕ ВРАТ" },
    { at: 58, text: "СИНХРОНИЗАЦИЯ ЗЕРКАЛА" },
    { at: 86, text: "КАНАЛ ОТКРЫТ" }
  ];

  function buildGate() {
    gate.replaceChildren();
    gateLines.forEach((line, rowIndex) => {
      const row = document.createElement("span");
      row.className = "gate-line";
      row.setAttribute("aria-hidden", "true");
      row.style.setProperty("--row-delay", `${rowIndex * (reducedMotion ? 0 : 0.105)}s`);
      [...line].forEach((character, characterIndex) => {
        const char = document.createElement("span");
        char.className = "gate-char";
        if ("/=\\_|.-".includes(character) && character !== " ") char.classList.add("is-accent");
        char.style.setProperty("--char-delay", `${characterIndex * (reducedMotion ? 0 : 0.0018)}s`);
        char.textContent = character;
        row.appendChild(char);
      });
      gate.appendChild(row);
    });
  }

  let introTimer = null;
  let progressFrame = null;
  let activeScreen = "boot";

  function showScreen(name) {
    if (!screens[name]) return;
    activeScreen = name;
    Object.entries(screens).forEach(([screenName, screen]) => {
      const isTarget = screenName === name;
      screen.classList.toggle("is-active", isTarget);
      screen.classList.remove("is-leaving");
      screen.setAttribute("aria-hidden", String(!isTarget));
      if (isTarget) screen.removeAttribute("inert");
      else screen.setAttribute("inert", "");
      if (isTarget) screen.scrollTop = 0;
    });
    if (name === "login") window.setTimeout(() => usernameInput.focus({ preventScroll: true }), reducedMotion ? 0 : 350);
  }

  function finishIntro() {
    if (introTimer) window.clearTimeout(introTimer);
    if (progressFrame) window.cancelAnimationFrame(progressFrame);
    bootPercent.textContent = "100";
    bootProgress.style.width = "100%";
    bootCaption.textContent = "КАНАЛ ОТКРЫТ";
    gateFrame.classList.add("scanning");
    showScreen("login");
  }

  function animateIntro() {
    buildGate();
    const start = performance.now();
    const animateProgress = (now) => {
      const elapsed = now - start;
      const progress = Math.min(100, (elapsed / INTRO_DURATION) * 100);
      bootPercent.textContent = String(Math.floor(progress)).padStart(2, "0");
      bootProgress.style.width = `${progress}%`;
      let caption = captions[0].text;
      captions.forEach((step) => { if (progress >= step.at) caption = step.text; });
      bootCaption.textContent = caption;
      if (progress < 100 && activeScreen === "boot") progressFrame = window.requestAnimationFrame(animateProgress);
    };
    progressFrame = window.requestAnimationFrame(animateProgress);
    introTimer = window.setTimeout(finishIntro, INTRO_DURATION);
  }

  function updateClock() {
    const date = new Date();
    const local = [date.getHours(), date.getMinutes(), date.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
    bootClock.textContent = local;
  }

  function resetLogin() {
    loginForm.reset();
    passwordInput.type = "password";
    togglePassword.textContent = "ПОКАЗАТЬ";
    togglePassword.setAttribute("aria-label", "Показать пароль");
    togglePassword.setAttribute("aria-pressed", "false");
    loginResponse.hidden = true;
    loginResponse.textContent = "";
    loginResponse.className = "form-response";
  }

  skipIntro.addEventListener("click", finishIntro);

  togglePassword.addEventListener("click", () => {
    const makeVisible = passwordInput.type === "password";
    passwordInput.type = makeVisible ? "text" : "password";
    togglePassword.textContent = makeVisible ? "СКРЫТЬ" : "ПОКАЗАТЬ";
    togglePassword.setAttribute("aria-label", makeVisible ? "Скрыть пароль" : "Показать пароль");
    togglePassword.setAttribute("aria-pressed", String(makeVisible));
    passwordInput.focus({ preventScroll: true });
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    loginResponse.hidden = false;

    if (username === TEST_CREDENTIALS.username && password === TEST_CREDENTIALS.password) {
      loginResponse.className = "form-response is-success";
      loginResponse.textContent = "ИДЕНТИФИКАЦИЯ ПОДТВЕРЖДЕНА.\nОТКРЫВАЮ ВНУТРЕННИЙ АРХИВ…";
      try {
        sessionStorage.setItem("sk-arg-authenticated", "1");
        sessionStorage.setItem("sk-arg-session-id", `SESSION—${Math.floor(1000 + Math.random() * 9000)}`);
      } catch (error) {
        loginResponse.className = "form-response is-error";
        loginResponse.textContent = "ОШИБКА СЕАНСА: ХРАНИЛИЩЕ БРАУЗЕРА НЕДОСТУПНО.\nОТКРОЙ САЙТ ЧЕРЕЗ ВЕБ-СЕРВЕР И ПОВТОРИ ПОПЫТКУ.";
        return;
      }
      passwordInput.value = "";
      window.setTimeout(() => { window.location.href = "home.html"; }, reducedMotion ? 100 : 800);
      return;
    }

    loginResponse.className = "form-response is-error";
    loginResponse.textContent = "ОТКАЗ: СОВПАДЕНИЕ НЕ ПОДТВЕРЖДЕНО.\nКОД: KGM-401 / ИМЯ И КЛЮЧ НЕ ОБРАЗУЮТ ОТРАЖЕНИЕ.";
    passwordInput.value = "";
    passwordInput.focus({ preventScroll: true });
  });

  updateClock();
  window.setInterval(updateClock, 1000);
  if (window.location.hash === "#login") {
    buildGate();
    showScreen("login");
  } else {
    animateIntro();
  }
})();
