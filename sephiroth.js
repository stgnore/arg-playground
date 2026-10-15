(() => {
  "use strict";

  // ARG trail: deliberately discoverable in DevTools, not on the visible page.
  // The cipher string also appears in the final element's data-imgur-cipher attribute.
  console.log("千本鏡会 / СЛУЖЕБНЫЙ ЖУРНАЛ");
  console.log("eqqmp://fjdro.zlj/dxiibov/KmXwYLr1");
  console.log("Когда-то давно один диктатор использовал такое шифрование.");

  let hasSession = false;
  try {
    hasSession = sessionStorage.getItem("sk-arg-authenticated") === "1";
  } catch (error) {
    hasSession = false;
  }
  if (!hasSession) {
    window.location.replace("index.html#login");
    return;
  }

  const clues = {
    keter: {
      code: "SPHERE—01 / CROWN", name: "Кетер", hebrew: "כתר", roman: "KETER · CORONA",
      fragment: "Начало не является источником.\nОно лишь первая точка регистрации."
    },
    chokmah: {
      code: "SPHERE—02 / WISDOM", name: "Хокма", hebrew: "חכמה", roman: "CHOKMAH · WISDOM",
      fragment: "Тот, кто наблюдает,\nменяет то, что наблюдает."
    },
    binah: {
      code: "SPHERE—03 / UNDERSTANDING", name: "Бина", hebrew: "בינה", roman: "BINAH · UNDERSTANDING",
      fragment: "Граница создана не чтобы удерживать тебя.\nОна отмечает то, что уже прошло."
    },
    chesed: {
      code: "SPHERE—04 / MERCY", name: "Хесед", hebrew: "חסד", roman: "CHESED · MERCY",
      fragment: "Система называет ошибку исключением,\nесли она повторяется достаточно долго."
    },
    geburah: {
      code: "SPHERE—05 / SEVERITY", name: "Гвура", hebrew: "גבורה", roman: "GEBURAH · SEVERITY",
      fragment: "Удалённый объект продолжает занимать место\nв журнале присутствия."
    },
    tiphereth: {
      code: "SPHERE—06 / BEAUTY", name: "Тиферет", hebrew: "תפארת", roman: "TIPHERETH · BEAUTY",
      fragment: "Центр смещается, когда на него смотрят.\nНе измеряй его второй раз."
    },
    netzach: {
      code: "SPHERE—07 / ETERNITY", name: "Нецах", hebrew: "נצח", roman: "NETZACH · ETERNITY",
      fragment: "Повторение — не доказательство истинности.\nИногда это лишь способ удержать дверь."
    },
    hod: {
      code: "SPHERE—08 / SPLENDOR", name: "Ход", hebrew: "הוד", roman: "HOD · SPLENDOR",
      fragment: "Имя — это разрешение, выданное пустоте.\nНе называй то, что ещё не вошло."
    },
    yesod: {
      code: "SPHERE—09 / FOUNDATION", name: "Йесод", hebrew: "יסוד", roman: "YESOD · FOUNDATION",
      fragment: "Основание записано позже здания.\nПроверь время создания исходного файла."
    },
    malkuth: {
      code: "SPHERE—10 / KINGDOM", name: "Малкут", hebrew: "מלכות", roman: "MALKUTH · KINGDOM",
      fragment: "Материальный мир — последняя копия.\nОригинал не найден в этом измерении."
    }
  };

  const nodes = [...document.querySelectorAll(".tree-node")];
  const clock = document.getElementById("tree-clock");
  const count = document.getElementById("tree-open-count");
  const progressFill = document.getElementById("tree-progress-fill");
  const detailCode = document.getElementById("tree-detail-code");
  const detailName = document.getElementById("tree-detail-name");
  const detailHebrew = document.getElementById("tree-detail-hebrew");
  const detailReading = document.getElementById("tree-detail-reading");
  const fragment = document.getElementById("tree-fragment");
  const fragmentStatus = document.getElementById("tree-fragment-status");
  const currentNode = document.getElementById("tree-current-node");
  const chamber = document.getElementById("tree-chamber");
  const keyForm = document.getElementById("tree-key-form");
  const keyInput = document.getElementById("tree-key-input");
  const keyMessage = document.getElementById("tree-key-message");
  const successRecord = document.getElementById("tree-success-record");
  const adamRecord = document.getElementById("adam-record");
  const logout = document.getElementById("tree-logout");
  const visited = new Set();

  function updateClock() {
    const now = new Date();
    clock.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((part) => String(part).padStart(2, "0")).join(":") + " LOCAL";
  }

  function openNode(node) {
    const key = node.dataset.sephirah;
    const clue = clues[key];
    if (!clue) return;

    nodes.forEach((item) => {
      const active = item === node;
      item.classList.toggle("is-selected", active);
      item.setAttribute("aria-pressed", String(active));
    });
    node.classList.add("is-visited");
    visited.add(key);

    detailCode.textContent = clue.code;
    detailName.textContent = clue.name;
    detailHebrew.textContent = clue.hebrew;
    detailReading.textContent = clue.roman;
    fragment.textContent = clue.fragment;
    fragmentStatus.textContent = "RECORD OPEN";
    currentNode.textContent = `${String(Object.keys(clues).indexOf(key) + 1).padStart(2, "0")} / 10`;
    count.textContent = String(visited.size).padStart(2, "0");
    progressFill.style.width = `${visited.size / nodes.length * 100}%`;

    if (visited.size === nodes.length) {
      chamber.hidden = false;
      if (!chamber.dataset.announced) {
        chamber.dataset.announced = "true";
        chamber.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      }
    }
  }

  nodes.forEach((node) => {
    node.addEventListener("click", () => openNode(node));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openNode(node);
      }
    });
  });

  keyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const key = keyInput.value.trim().toLocaleLowerCase().replace(/[^a-z]/g, "");
    if (visited.size !== nodes.length) {
      keyMessage.textContent = "ОТКАЗ: НЕ ВСЕ УЗЛЫ ПРОЧИТАНЫ.";
      keyMessage.classList.remove("is-success");
      return;
    }
    if (key === "daat") {
      keyMessage.textContent = "ИМЯ ПРИНЯТО. ЖУРНАЛ ДОПОЛНЕН.";
      keyMessage.classList.add("is-success");
      successRecord.hidden = false;
      if (adamRecord) {
        adamRecord.hidden = false;
        // A slight stagger keeps the first transcript lines readable while signal interference starts.
        adamRecord.querySelectorAll(".adam-line-text").forEach((line, index) => {
          line.style.animationDelay = `-${(index * 1.73) % 9}s`;
        });
        window.setTimeout(() => {
          adamRecord.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
          });
        }, 120);
      }
      keyInput.setAttribute("readonly", "readonly");
      keyForm.querySelector("button").disabled = true;
      keyForm.querySelector("button").textContent = "ПОДТВЕРЖДЕНО";
    } else {
      keyMessage.textContent = "ИМЯ НЕ СОПОСТАВЛЕНО. ПРОВЕРЬ НЕ НАЗВАННОЕ, А ОТСУТСТВУЮЩЕЕ.";
      keyMessage.classList.remove("is-success");
    }
  });

  logout.addEventListener("click", () => {
    try {
      sessionStorage.removeItem("sk-arg-authenticated");
      sessionStorage.removeItem("sk-arg-session-id");
    } finally {
      window.location.href = "index.html#login";
    }
  });

  updateClock();
  window.setInterval(updateClock, 1000);
})();
