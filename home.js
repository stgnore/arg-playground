(() => {
  "use strict";

  // ARG-only front-end gate; this is not a replacement for server authentication.
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

  const homeClock = document.getElementById("home-clock");
  const sessionId = document.getElementById("session-id");
  const logoutButton = document.getElementById("logout-button");
  const recordModal = document.getElementById("record-modal");
  const recordCode = document.getElementById("record-code");
  const recordTitle = document.getElementById("record-title");
  const recordBody = document.getElementById("record-body");
  const closeRecord = document.getElementById("close-record");
  const fragmentCopy = document.getElementById("fragment-copy");
  const revealFragment = document.getElementById("reveal-fragment");

  sessionId.textContent = sessionStorage.getItem("sk-arg-session-id") || "SESSION—0001";

  function updateClock() {
    const date = new Date();
    const local = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((n) => String(n).padStart(2, "0")).join(":");
    homeClock.textContent = `${local} LOCAL TIME`;
  }

  const records = {
    protocol: {
      code: "DOC—001 / REV. 04",
      title: "Протокол зеркала",
      body: "ПРАВИЛО 01\nНе называй отражение своим именем.\n\nПРАВИЛО 02\nЕсли зеркало показывает пустую комнату, не входи в неё.\n\nПРАВИЛО 03\nНикогда не отвечай на вопрос, заданный твоим голосом из-за закрытой двери.\n\nСтатус документа: утверждено. Автор: не указан."
    },
    shift: {
      code: "DOC—002 / UNSIGNED",
      title: "Смена дежурства",
      body: "Запись найдена в терминале восточного крыла.\n\n«Я принял смену в 02:13. Мониторы показывали пустой коридор, но датчик движения сообщал о двух присутствующих. Я был один.\n\nВ 02:14 на экране появился я. Он стоял за моей спиной. Я не стал оборачиваться».\n\nФайл заканчивается здесь. Время создания: завтра."
    },
    locked: {
      code: "DOC—003 / ENCRYPTED",
      title: "Комната без двери",
      body: "Часть архива недоступна.\n\nВ повреждённом поле сохранилась строка:\n\nS H E  I S  N O T  I N  T H E  M I R R O R\n\nОна находится по другую сторону.\n\n[ ДЛЯ ПРОДОЛЖЕНИЯ ТРЕБУЕТСЯ ВНЕШНИЙ КЛЮЧ ]"
    }
  };

  function openRecord(key) {
    const record = records[key];
    if (!record) return;
    recordCode.textContent = record.code;
    recordTitle.textContent = record.title;
    recordBody.textContent = record.body;
    recordModal.hidden = false;
    closeRecord.focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-record]").forEach((button) => {
    button.addEventListener("click", () => openRecord(button.dataset.record));
  });

  function closeModal() {
    recordModal.hidden = true;
  }
  closeRecord.addEventListener("click", closeModal);
  recordModal.addEventListener("click", (event) => {
    if (event.target === recordModal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !recordModal.hidden) closeModal();
  });

  let fragmentStage = 0;
  const fragments = [
    "Последний наблюдатель оставил одну строку: «Не доверяй тому, что помнит твоё имя».",
    "Вторая строка добавлена позднее: «У комнаты без двери есть окно. Оно находится внутри тебя»."
  ];
  revealFragment.addEventListener("click", () => {
    fragmentStage = (fragmentStage + 1) % fragments.length;
    fragmentCopy.textContent = fragments[fragmentStage];
    revealFragment.innerHTML = fragmentStage === 0
      ? 'ПОКАЗАТЬ СЛЕДУЮЩУЮ СТРОКУ <span>↗</span>'
      : 'ВЕРНУТЬСЯ К ПЕРВОЙ СТРОКЕ <span>↗</span>';
  });

  logoutButton.addEventListener("click", () => {
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
