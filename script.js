(() => {
  "use strict";

  /* =============================================================
     ACCESS SETTINGS
     Change these two values when you customize your ARG.
     This is a FRONT-END DEMO only; client-side credentials are not secure.
     ============================================================= */
  const ACCESS_CREDENTIALS = {
    username: "ADAM-1",
    password: "Sephiroth"
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INTRO_DURATION = reducedMotion ? 700 : 5300;
  const REVEAL_END = 0.69;
  const SCAN_END = 0.94;
  const screens = {
    boot: document.getElementById("boot-screen"),
    login: document.getElementById("login-screen")
  };
  const gateCanvas = document.getElementById("gate-canvas");
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

  const gateContext = gateCanvas.getContext("2d", { alpha: true, desynchronized: true });
  const artworkCanvas = document.createElement("canvas");
  const artworkContext = artworkCanvas.getContext("2d", { alpha: true });
  const captions = [
    { at: 0, text: "ПОИСК СИГНАЛА" },
    { at: 0.17, text: "ОБНАРУЖЕНА ЛИНИЯ ГРАНИЦЫ" },
    { at: 0.39, text: "СБОРКА КОНСТРУКЦИИ" },
    { at: 0.63, text: "СИНХРОНИЗАЦИЯ ОТРАЖЕНИЯ" },
    { at: 0.88, text: "КАНАЛ ОТКРЫТ" }
  ];

  const ART_COLS = 91;
  const ART_ROWS = 31;
  let artGrid = null;
  let artLayout = null;
  let animationFrame = 0;
  let introStartedAt = 0;
  let currentProgress = 0;
  let activeScreen = "boot";
  let lastProgressNumber = -1;

  function makeGateGrid() {
    const grid = Array.from({ length: ART_ROWS }, () => Array(ART_COLS).fill(" "));
    const put = (row, col, text) => {
      if (row < 0 || row >= ART_ROWS) return;
      [...text].forEach((char, index) => {
        const x = col + index;
        if (x >= 0 && x < ART_COLS) grid[row][x] = char;
      });
    };
    const centered = (row, text) => put(row, Math.floor((ART_COLS - text.length) / 2), text);
    const line = (row, left, right, char) => {
      for (let col = left; col <= right; col += 1) grid[row][col] = char;
    };

    // Kasagi: the broad, slightly upswept top lintel that makes the torii silhouette identifiable.
    centered(1, "__..---" + "=".repeat(54) + "---..__");
    centered(2, "_..--'" + "=".repeat(54) + "'--.._");
    centered(3, "_.-'" + "=".repeat(56) + "'-._");
    centered(4, "/" + "_".repeat(62) + "\\");
    centered(5, `|${"=".repeat(61)}|`);
    centered(6, `|${"_".repeat(61)}|`);

    // Two stout posts. The nuki crosses through them and projects beyond both sides.
    const leftPost = 28;
    const rightPost = 61;
    for (let row = 7; row <= 19; row += 1) {
      put(row, leftPost, "||");
      put(row, rightPost, "||");
    }
    line(8, 13, 77, "=");
    line(9, 14, 76, "_");
    for (const row of [8, 9]) {
      put(row, leftPost, "##");
      put(row, rightPost, "##");
    }

    // Slightly flared feet anchor the gate instead of leaving it floating.
    put(20, 27, "||||");
    put(20, 60, "||||");
    put(21, 26, "/||||\\");
    put(21, 59, "/||||\\");

    // A quiet dotted path gives the gate depth without becoming a second, confusing shape.
    for (let step = 0; step < 9; step += 1) {
      const row = 22 + step;
      const left = 35 - step * 3;
      const right = 55 + step * 3;
      grid[row][left] = "/";
      grid[row][right] = "\\";
      if ([2, 5, 8].includes(step)) {
        for (let col = left + 2; col < right - 1; col += 3) {
          if (grid[row][col] === " ") grid[row][col] = ".";
        }
      }
    }
    return grid;
  }

  function setCanvasSize() {
    const rect = gateFrame.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    gateCanvas.width = Math.round(width * dpr);
    gateCanvas.height = Math.round(height * dpr);
    artworkCanvas.width = Math.round(width * dpr);
    artworkCanvas.height = Math.round(height * dpr);
    gateContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    artworkContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    let firstColumn = ART_COLS;
    let lastColumn = 0;
    artGrid.forEach((row) => row.forEach((char, column) => {
      if (char !== " ") {
        firstColumn = Math.min(firstColumn, column);
        lastColumn = Math.max(lastColumn, column);
      }
    }));
    const visibleColumns = Math.max(1, lastColumn - firstColumn + 1);
    const cellWidthRatio = 0.78; // a little tracking makes the gate broader than a square block of text
    const maxFontByWidth = (width - 20) / (visibleColumns * cellWidthRatio);
    const maxFontByHeight = (height - 12) / (ART_ROWS * 1.24);
    const fontSize = Math.max(3.5, Math.min(17, maxFontByWidth, maxFontByHeight));
    const fontFamily = '"IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace';
    artworkContext.font = `500 ${fontSize}px ${fontFamily}`;
    artworkContext.textBaseline = "top";
    artworkContext.textAlign = "left";
    const cellWidth = fontSize * cellWidthRatio;
    const lineHeight = fontSize * 1.24;
    const artWidth = cellWidth * visibleColumns;
    const artHeight = lineHeight * ART_ROWS;
    const x = Math.max(0, (width - artWidth) / 2);
    const y = Math.max(0, (height - artHeight) / 2);

    artworkContext.clearRect(0, 0, width, height);
    artGrid.forEach((row, index) => {
      if (index >= 22) artworkContext.fillStyle = "#a6a6a6";
      else if (index <= 6) artworkContext.fillStyle = "#111111";
      else artworkContext.fillStyle = "#252525";
      const visibleRow = row.slice(firstColumn, lastColumn + 1);
      visibleRow.forEach((char, column) => {
        if (char !== " ") artworkContext.fillText(char, x + column * cellWidth, y + index * lineHeight);
      });
    });

    artLayout = { width, height, dpr, x, y, artWidth, artHeight };
    drawGate(currentProgress, performance.now());
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - Math.min(1, Math.max(0, value)), 3);
  }

  function drawGate(progress, now) {
    if (!artLayout) return;
    const { width, height } = artLayout;
    gateContext.clearRect(0, 0, width, height);

    const revealProgress = easeOutCubic(progress / REVEAL_END);
    const revealY = Math.max(1, Math.min(height, height * revealProgress));
    gateContext.save();
    if (progress < REVEAL_END) {
      gateContext.beginPath();
      gateContext.rect(0, 0, width, revealY);
      gateContext.clip();
    }
    gateContext.drawImage(artworkCanvas, 0, 0, width, height);
    gateContext.restore();

    // A single thin scanner follows the construction line; the expensive text is never rebuilt per frame.
    let scannerY = revealY;
    let scannerAlpha = 0.8;
    if (progress >= REVEAL_END && progress < SCAN_END) {
      scannerY = height * ((progress - REVEAL_END) / (SCAN_END - REVEAL_END));
      scannerAlpha = Math.sin(Math.PI * (progress - REVEAL_END) / (SCAN_END - REVEAL_END)) * 0.7;
    } else if (progress >= SCAN_END) {
      scannerAlpha = 0;
    }
    if (!reducedMotion && scannerAlpha > 0.01) {
      const jitter = progress > 0.51 && progress < 0.57 && Math.sin(now / 27) > 0.2 ? 2 : 0;
      gateContext.save();
      gateContext.globalAlpha = scannerAlpha;
      gateContext.strokeStyle = "#111111";
      gateContext.lineWidth = 1;
      gateContext.beginPath();
      gateContext.moveTo(Math.max(0, width * 0.08 - jitter), scannerY + 0.5);
      gateContext.lineTo(Math.min(width, width * 0.92 + jitter), scannerY + 0.5);
      gateContext.stroke();
      gateContext.restore();
    }
  }

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
    if (activeScreen !== "boot") return;
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    currentProgress = 1;
    drawGate(1, performance.now());
    bootPercent.textContent = "100";
    bootProgress.style.width = "100%";
    bootCaption.textContent = "КАНАЛ ОТКРЫТ";
    gateFrame.classList.add("scanning");
    showScreen("login");
  }

  function animateIntro(now) {
    if (!introStartedAt) introStartedAt = now;
    const elapsed = now - introStartedAt;
    currentProgress = Math.min(1, elapsed / INTRO_DURATION);
    drawGate(currentProgress, now);

    const percent = Math.floor(currentProgress * 100);
    if (percent !== lastProgressNumber) {
      lastProgressNumber = percent;
      bootPercent.textContent = String(percent).padStart(2, "0");
      bootProgress.style.width = `${percent}%`;
      let caption = captions[0].text;
      captions.forEach((step) => { if (currentProgress >= step.at) caption = step.text; });
      bootCaption.textContent = caption;
    }

    // Leave the completed gate on screen for a short beat before moving to login.
    if (currentProgress >= 1 && elapsed >= INTRO_DURATION + 850) {
      finishIntro();
      return;
    }
    animationFrame = window.requestAnimationFrame(animateIntro);
  }

  function updateClock() {
    const date = new Date();
    const local = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((n) => String(n).padStart(2, "0")).join(":");
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

    if (username === ACCESS_CREDENTIALS.username && password === ACCESS_CREDENTIALS.password) {
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

  artGrid = makeGateGrid();
  setCanvasSize();
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => setCanvasSize()).observe(gateFrame);
  } else {
    window.addEventListener("resize", setCanvasSize, { passive: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setCanvasSize).catch(() => {});
  updateClock();
  window.setInterval(updateClock, 1000);

  if (window.location.hash === "#login") {
    drawGate(1, performance.now());
    bootPercent.textContent = "100";
    bootProgress.style.width = "100%";
    bootCaption.textContent = "КАНАЛ ОТКРЫТ";
    showScreen("login");
  } else {
    introStartedAt = 0;
    animationFrame = window.requestAnimationFrame(animateIntro);
  }
})();
