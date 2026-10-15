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

  const chatLog = document.getElementById("chat-log");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatTyping = document.getElementById("chat-typing");
  const typingLabel = document.getElementById("typing-label");
  const packetState = document.getElementById("chat-packet-state");
  const channelTitle = document.getElementById("active-channel-title");
  const channelSubtitle = document.getElementById("active-channel-subtitle");
  const chatRoster = document.getElementById("chat-roster");
  const rosterCount = document.getElementById("roster-count");
  const onlineAgentCount = document.getElementById("online-agent-count");
  const channelButtons = [...document.querySelectorAll("[data-channel]")];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      body: `Запись найдена в терминале восточного крыла.

«Я принял смену в 02:13. Мониторы показывали пустой коридор, но датчик движения сообщал о двух присутствующих. Я был один.

В 02:14 на экране появился я. Он стоял за моей спиной. Я не стал оборачиваться».

Файл заканчивается здесь. Время создания: завтра.`
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

  // Mirror clue: the visible strings are intentionally reversed for the ARG.
  const mirrorTrigger = document.getElementById("mirror-trigger");
  const mirrorEtch = document.getElementById("mirror-etch");
  const mirrorInstruction = document.getElementById("mirror-instruction");
  const mirrorState = document.getElementById("mirror-state");
  const mirrorRevelation = document.getElementById("mirror-revelation");
  const mirrorReset = document.getElementById("mirror-reset");
  let mirrorRevealTimer = 0;
  let mirrorTextTimer = 0;

  function activateMirror() {
    if (mirrorTrigger.classList.contains("is-awake")) return;
    mirrorTrigger.classList.add("is-awake");
    mirrorTrigger.setAttribute("aria-expanded", "true");
    mirrorState.textContent = "REFLECTION DETECTED";
    mirrorInstruction.textContent = "ОТРАЖЕНИЕ ОБНАРУЖЕНО";
    mirrorRevealTimer = window.setTimeout(() => {
      mirrorEtch.classList.add("is-visible");
      mirrorEtch.setAttribute("aria-hidden", "false");
      mirrorTextTimer = window.setTimeout(() => {
        mirrorRevelation.hidden = false;
      }, prefersReducedMotion ? 40 : 620);
    }, prefersReducedMotion ? 0 : 1020);
  }

  mirrorTrigger.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") activateMirror();
  });
  mirrorTrigger.addEventListener("focus", activateMirror);
  mirrorTrigger.addEventListener("click", activateMirror);
  mirrorReset.addEventListener("click", () => {
    window.clearTimeout(mirrorRevealTimer);
    window.clearTimeout(mirrorTextTimer);
    mirrorTrigger.classList.remove("is-awake");
    mirrorTrigger.setAttribute("aria-expanded", "false");
    mirrorEtch.classList.remove("is-visible");
    mirrorEtch.setAttribute("aria-hidden", "true");
    mirrorRevelation.hidden = true;
    mirrorState.textContent = "SURFACE IDLE";
    mirrorInstruction.textContent = "ПОДНЕСИТЕ КУРСОР К ПОВЕРХНОСТИ";
    mirrorReset.focus({ preventScroll: true });
  });

  /* The intercom is a local ARG simulation: it does not impersonate or contact real people. */
  const channels = {
    kagami: {
      title: "#kagami-7",
      subtitle: "Сектор наблюдения · пакетный канал",
      roster: [
        { id: "ARCH-0", rank: "АРХИВАРИУС", online: true },
        { id: "K-09", rank: "СТАРШИЙ КУРАТОР", online: true },
        { id: "MIZU-03", rank: "АГЕНТ ПОЛЯ", online: true },
        { id: "N-14", rank: "МЛАДШИЙ НАБЛЮДАТЕЛЬ", online: true },
        { id: "OP-6", rank: "ОПЕРАТОР СВЯЗИ", online: true },
        { id: "SABLE", rank: "СМОТРИТЕЛЬ", online: false }
      ],
      seed: [
        { agent: "MIZU-03", rank: "АГЕНТ ПОЛЯ", text: "Кто вернул лестницу на этаж, которого нет?", age: 392000 },
        { agent: "ARCH-0", rank: "АРХИВАРИУС", text: "Она не возвращалась. Её просто перестали считать.", age: 348000 },
        { agent: "N-14", rank: "МЛАДШИЙ НАБЛЮДАТЕЛЬ", text: "В журнале теперь 12:12 три раза подряд.", age: 294000 },
        { agent: "K-09", rank: "СТАРШИЙ КУРАТОР", text: "Не трогайте третье время.", age: 247000 },
        { agent: "MIZU-03", rank: "АГЕНТ ПОЛЯ", text: "Понял. Какое из трёх третье?", age: 206000 },
        { agent: "ARCH-0", rank: "АРХИВАРИУС", text: "То, после которого звонит пустой телефон.", age: 162000 }
      ],
      feed: [
        { agent: "OP-6", rank: "ОПЕРАТОР СВЯЗИ", text: "Линия отвечает до вызова. Повторяю: до." },
        { agent: "N-14", rank: "МЛАДШИЙ НАБЛЮДАТЕЛЬ", text: "Кто поставил мне статус «отсутствует», пока я писал это?" },
        { agent: "K-09", rank: "СТАРШИЙ КУРАТОР", text: "Сверяйтесь не с часами, а с паузой между ними." },
        { agent: "MIZU-03", rank: "АГЕНТ ПОЛЯ", text: "На схеме четыре человека. В комнате пять стульев." },
        { agent: "ARCH-0", rank: "АРХИВАРИУС", text: "Стул не является подтверждением присутствия." },
        { agent: "SABLE", rank: "СМОТРИТЕЛЬ", text: "Кто сегодня дежурит у западного окна?" },
        { agent: "OP-6", rank: "ОПЕРАТОР СВЯЗИ", text: "Западное окно отключено с прошлого четверга." },
        { agent: "SABLE", rank: "СМОТРИТЕЛЬ", text: "Тогда кто машет?" },
        { agent: "N-14", rank: "МЛАДШИЙ НАБЛЮДАТЕЛЬ", text: "Я нашёл отметку: «не включать при дневном свете»." },
        { agent: "K-09", rank: "СТАРШИЙ КУРАТОР", text: "Свет не является аргументом." },
        { agent: "MIZU-03", rank: "АГЕНТ ПОЛЯ", text: "У кого-нибудь есть лишнее вчера? Моё закончилось." },
        { agent: "ARCH-0", rank: "АРХИВАРИУС", text: "Верните его в папку, из которой взяли." }
      ]
    },
    mirror: {
      title: "#mirror-test",
      subtitle: "Контроль отражения · испытательный буфер",
      roster: [
        { id: "K-09", rank: "СТАРШИЙ КУРАТОР", online: true },
        { id: "RIN-2", rank: "ИНЖЕНЕР ПРОТОКОЛА", online: true },
        { id: "ARCH-0", rank: "АРХИВАРИУС", online: true },
        { id: "N-14", rank: "МЛАДШИЙ НАБЛЮДАТЕЛЬ", online: true },
        { id: "YU-11", rank: "ТЕХНИК КЛАССА C", online: false }
      ],
      seed: [
        { agent: "RIN-2", rank: "ИНЖЕНЕР ПРОТОКОЛА", text: "Стекло запотело с обратной стороны.", age: 318000 },
        { agent: "K-09", rank: "СТАРШИЙ КУРАТОР", text: "У комнаты нет обратной стороны.", age: 266000 },
        { agent: "RIN-2", rank: "ИНЖЕНЕР ПРОТОКОЛА", text: "Тогда почему следы пальцев внутри?", age: 219000 },
        { agent: "ARCH-0", rank: "АРХИВАРИУС", text: "Внесено в категорию «погодные явления». Закрыто.", age: 171000 }
      ],
      feed: [
        { agent: "YU-11", rank: "ТЕХНИК КЛАССА C", text: "Я выключил свет. Отражение продолжило работать." },
        { agent: "N-14", rank: "МЛАДШИЙ НАБЛЮДАТЕЛЬ", text: "Оно смотрит на меня или на то, что за мной?" },
        { agent: "K-09", rank: "СТАРШИЙ КУРАТОР", text: "Слово «за» не допускается в отчётах." },
        { agent: "RIN-2", rank: "ИНЖЕНЕР ПРОТОКОЛА", text: "Температура поверхности: комнатная. Комната: отсутствует." },
        { agent: "ARCH-0", rank: "АРХИВАРИУС", text: "В предыдущем протоколе комната присутствует." },
        { agent: "YU-11", rank: "ТЕХНИК КЛАССА C", text: "Проверил предыдущий протокол. Там моё имя." },
        { agent: "K-09", rank: "СТАРШИЙ КУРАТОР", text: "Не проверяйте предыдущий протокол." },
        { agent: "RIN-2", rank: "ИНЖЕНЕР ПРОТОКОЛА", text: "Нужен номер образца. На всех образцах написано «последний»." }
      ]
    },
    east: {
      title: "#ops-east",
      subtitle: "Восточный сектор · оперативный контур",
      roster: [
        { id: "SABLE", rank: "СМОТРИТЕЛЬ", online: true },
        { id: "MIZU-03", rank: "АГЕНТ ПОЛЯ", online: true },
        { id: "T-4", rank: "КООРДИНАТОР СМЕНЫ", online: true },
        { id: "OP-6", rank: "ОПЕРАТОР СВЯЗИ", online: true },
        { id: "GATE-0", rank: "ПРИГРАНИЧНЫЙ УЗЕЛ", online: false }
      ],
      seed: [
        { agent: "T-4", rank: "КООРДИНАТОР СМЕНЫ", text: "Доставка прибыла до того, как её отправили.", age: 355000 },
        { agent: "MIZU-03", rank: "АГЕНТ ПОЛЯ", text: "Подпись получателя совпадает с моей. Я на месте.", age: 309000 },
        { agent: "OP-6", rank: "ОПЕРАТОР СВЯЗИ", text: "Система отмечает два места.", age: 264000 },
        { agent: "SABLE", rank: "СМОТРИТЕЛЬ", text: "Оставьте одно пустым. Так и было задумано.", age: 217000 }
      ],
      feed: [
        { agent: "GATE-0", rank: "ПРИГРАНИЧНЫЙ УЗЕЛ", text: "Восток подтверждён. Направление не подтверждено." },
        { agent: "T-4", rank: "КООРДИНАТОР СМЕНЫ", text: "Курьер спрашивает, какой из адресов настоящий." },
        { agent: "SABLE", rank: "СМОТРИТЕЛЬ", text: "Ответьте: тот, куда он не приедет." },
        { agent: "MIZU-03", rank: "АГЕНТ ПОЛЯ", text: "У двери нет ручки с этой стороны." },
        { agent: "OP-6", rank: "ОПЕРАТОР СВЯЗИ", text: "Поступил сигнал об открытой двери. Источник: внутри помещения." },
        { agent: "GATE-0", rank: "ПРИГРАНИЧНЫЙ УЗЕЛ", text: "Пожалуйста, не указывайте на источник." },
        { agent: "T-4", rank: "КООРДИНАТОР СМЕНЫ", text: "В форме отчёта нет поля для этого." },
        { agent: "SABLE", rank: "СМОТРИТЕЛЬ", text: "Поэтому поле и пустое." }
      ]
    }
  };

  const channelCursors = { kagami: 0, mirror: 0, east: 0 };
  let activeChannelKey = "kagami";
  let feedTimer = 0;
  let typingTimer = 0;
  let statusTimer = 0;

  function randomBetween(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  function timeStamp(date = new Date()) {
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((part) => String(part).padStart(2, "0")).join(":");
  }

  function clearChatTimers() {
    window.clearTimeout(feedTimer);
    window.clearTimeout(typingTimer);
    window.clearTimeout(statusTimer);
    feedTimer = 0;
    typingTimer = 0;
    statusTimer = 0;
    chatTyping.hidden = true;
  }

  function createMessage(message, options = {}) {
    const element = document.createElement("article");
    element.className = `chat-message${message.local ? " is-local" : ""}${options.animate ? " is-entering" : ""}`;

    const avatar = document.createElement("span");
    avatar.className = "chat-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = message.local ? "YOU" : message.agent.replace(/[^A-Z0-9]/gi, "").slice(0, 2).toUpperCase();

    const content = document.createElement("div");
    content.className = "chat-message-content";
    const heading = document.createElement("div");
    heading.className = "chat-message-heading";
    const identity = document.createElement("div");
    identity.className = "chat-identity";
    const agent = document.createElement("strong");
    agent.textContent = message.agent;
    const rank = document.createElement("span");
    rank.className = "chat-rank";
    rank.textContent = message.rank;
    const time = document.createElement("time");
    time.className = "chat-time";
    const created = message.age ? new Date(Date.now() - message.age) : new Date();
    time.dateTime = created.toISOString();
    time.textContent = message.time || timeStamp(created);
    identity.append(agent, rank);
    heading.append(identity, time);
    const text = document.createElement("p");
    text.className = "chat-message-text";
    text.textContent = message.text;
    content.append(heading, text);
    element.append(avatar, content);
    return element;
  }

  function appendMessage(message, animate = true) {
    chatLog.appendChild(createMessage(message, { animate }));
    while (chatLog.children.length > 32) chatLog.removeChild(chatLog.firstElementChild);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function renderRoster(roster) {
    chatRoster.replaceChildren();
    roster.forEach((member) => {
      const item = document.createElement("li");
      const dot = document.createElement("span");
      dot.className = `roster-indicator${member.online ? " is-online" : ""}`;
      dot.setAttribute("aria-hidden", "true");
      const identity = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = member.id;
      const rank = document.createElement("small");
      rank.textContent = member.rank;
      identity.append(name, rank);
      const state = document.createElement("span");
      state.className = `roster-state${member.online ? " is-online" : ""}`;
      state.textContent = member.online ? "●" : "○";
      state.setAttribute("aria-label", member.online ? "в сети" : "не в сети");
      item.append(dot, identity, state);
      chatRoster.appendChild(item);
    });
    const active = roster.filter((member) => member.online).length;
    rosterCount.textContent = String(roster.length).padStart(2, "0");
    onlineAgentCount.textContent = String(active + randomBetween(2, 4)).padStart(2, "0");
  }

  function renderChannel(key) {
    const channel = channels[key];
    if (!channel) return;
    activeChannelKey = key;
    clearChatTimers();
    channelTitle.textContent = channel.title;
    channelSubtitle.textContent = channel.subtitle;
    channelButtons.forEach((button) => {
      const selected = button.dataset.channel === key;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    renderRoster(channel.roster);
    chatLog.replaceChildren();
    channel.seed.forEach((message) => appendMessage(message, false));
    packetState.textContent = "PACKET BUFFER / CHANNEL OPEN";
    scheduleAgentMessage();
  }

  function showTyping(agent) {
    typingLabel.textContent = `${agent} ПЕЧАТАЕТ`;
    chatTyping.hidden = false;
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function scheduleAgentMessage() {
    window.clearTimeout(feedTimer);
    if (document.visibilityState === "hidden" || !chatLog) return;
    feedTimer = window.setTimeout(() => {
      const key = activeChannelKey;
      const channel = channels[key];
      const pool = channel.feed;
      const cursor = channelCursors[key] % pool.length;
      const message = pool[cursor];
      channelCursors[key] += 1;
      showTyping(message.agent);
      typingTimer = window.setTimeout(() => {
        if (key !== activeChannelKey) return;
        chatTyping.hidden = true;
        appendMessage(message, true);
        packetState.textContent = `PACKET RECEIVED / ${timeStamp()}`;
        statusTimer = window.setTimeout(() => {
          packetState.textContent = "PACKET BUFFER / READY";
        }, 2200);
        scheduleAgentMessage();
      }, prefersReducedMotion ? 250 : randomBetween(850, 1750));
    }, prefersReducedMotion ? 6800 : randomBetween(3600, 8200));
  }

  function sendLocalMessage(text) {
    appendMessage({
      agent: "EXTERNAL-01",
      rank: "НЕПОДТВЕРЖДЁННЫЙ УЗЕЛ",
      text,
      local: true
    }, true);
    packetState.textContent = "OUTBOUND PACKET / LOCAL ONLY";

    window.clearTimeout(feedTimer);
    window.clearTimeout(typingTimer);
    const key = activeChannelKey;
    const pool = channels[key].feed;
    const reply = pool[randomBetween(0, pool.length - 1)];
    showTyping(reply.agent);
    typingTimer = window.setTimeout(() => {
      if (key !== activeChannelKey) return;
      chatTyping.hidden = true;
      appendMessage(reply, true);
      packetState.textContent = `PACKET RECEIVED / ${timeStamp()}`;
      scheduleAgentMessage();
    }, prefersReducedMotion ? 300 : randomBetween(1000, 2100));
  }

  channelButtons.forEach((button) => {
    button.addEventListener("click", () => renderChannel(button.dataset.channel));
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = chatInput.value.trim();
    if (!value) {
      chatInput.focus();
      return;
    }
    sendLocalMessage(value.slice(0, 160));
    chatInput.value = "";
    chatInput.focus();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      clearChatTimers();
    } else {
      scheduleAgentMessage();
    }
  });

  logoutButton.addEventListener("click", () => {
    clearChatTimers();
    try {
      sessionStorage.removeItem("sk-arg-authenticated");
      sessionStorage.removeItem("sk-arg-session-id");
    } finally {
      window.location.href = "index.html#login";
    }
  });

  renderChannel(activeChannelKey);
  updateClock();
  window.setInterval(updateClock, 1000);
})();
