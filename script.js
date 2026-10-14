(() => {
  "use strict";

  const gate = document.getElementById("ascii-gate");
  const progressValue = document.getElementById("progress-value");
  const progressBar = document.getElementById("progress-bar");
  const gateCaption = document.getElementById("gate-caption");
  const clock = document.getElementById("local-clock");
  const form = document.getElementById("access-form");
  const loginInput = document.getElementById("login");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("toggle-password");
  const responseMessage = document.getElementById("response-message");

  // Each frame draws a little more of the torii gate using ordinary ASCII characters.
  const gateFrames = [
`\n\n\n\n\n                         .\n                      .     .\n\n\n\n`,
`\n\n\n             ______________________\n        ____/______________________\\____\n\n\n\n`,
`\n\n             ______________________\n        ____/______________________\\____\n           |                       |\n   ________|_______________________|________\n\n\n`,
`\n             ______________________\n        ____/______________________\\____\n           |                       |\n   ________|_______________________|________\n   |       |                       |       |\n   |       |                       |       |\n   |       |                       |       |\n`,
`\n             ______________________\n        ____/______________________\\____\n           |                       |\n   ________|_______________________|________\n   |       |                       |       |\n   |       |                       |       |\n   |       |                       |       |\n   |_______|_______________________|_______|\n           |                       |\n           |                       |\n           |_______________________|\n`
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const captions = ["ПОИСК ОТРАЖЕНИЯ", "СБОРКА ВРАТ", "СВЯЗЬ УСТАНОВЛЕНА", "СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА"];

  function renderProgress(value) {
    const safeValue = Math.max(0, Math.min(100, Math.round(value)));
    progressValue.textContent = String(safeValue).padStart(2, "0");
    progressBar.style.width = `${safeValue}%`;
  }

  function animateGate() {
    gate.classList.add("is-building");
    if (reducedMotion) {
      gate.textContent = gateFrames[gateFrames.length - 1];
      gateCaption.textContent = captions[captions.length - 1];
      renderProgress(100);
      return;
    }

    const duration = 2900;
    const startedAt = performance.now();
    let lastFrame = -1;

    function tick(now) {
      const ratio = Math.min(1, (now - startedAt) / duration);
      const frameIndex = Math.min(gateFrames.length - 1, Math.floor(ratio * gateFrames.length));
      if (frameIndex !== lastFrame) {
        gate.textContent = gateFrames[frameIndex];
        lastFrame = frameIndex;
      }
      const captionIndex = Math.min(captions.length - 1, Math.floor(ratio * captions.length));
      gateCaption.textContent = captions[captionIndex];
      renderProgress(ratio * 100);
      if (ratio < 1) window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  }

  function updateClock() {
    const now = new Date();
    clock.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((part) => String(part).padStart(2, "0")).join(":");
  }

  togglePassword.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    togglePassword.textContent = shouldShow ? "СКРЫТЬ" : "ПОКАЗАТЬ";
    togglePassword.setAttribute("aria-label", shouldShow ? "Скрыть пароль" : "Показать пароль");
    togglePassword.setAttribute("aria-pressed", String(shouldShow));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const login = loginInput.value.trim();
    const keyLength = passwordInput.value.length;

    // ARG-only simulation. No network request is made and nothing is stored.
    responseMessage.hidden = false;
    responseMessage.textContent = `ЗАПРОС ${new Date().toISOString().replace("T", " ").slice(0, 19)}Z\nИДЕНТИФИКАТОР: ${login || "[ПУСТО]"}\nДЛИНА КЛЮЧА: ${keyLength}\n\nОТКАЗ: ЗЕРКАЛО НЕ ПОДТВЕРЖДАЕТ ЛИЧНОСТЬ.\nКОД: KGM-0${String((login.length + keyLength) % 9 + 1)}\n\n«ТЫ ИЩЕШЬ ДВЕРЬ. НАЧНИ С ТЕНИ, КОТОРУЮ ОНА ОТБРАСЫВАЕТ.»`;
    passwordInput.value = "";
    passwordInput.type = "password";
    togglePassword.textContent = "ПОКАЗАТЬ";
    togglePassword.setAttribute("aria-label", "Показать пароль");
    togglePassword.setAttribute("aria-pressed", "false");
    responseMessage.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
  });

  animateGate();
  updateClock();
  window.setInterval(updateClock, 1000);
})();
