
(() => {
  "use strict";

  const STORAGE_KEY = "lanternkeep.v1";
  const APP_VERSION = 3;

  const SECTION_INFO = {
    morning: {
      label: "Morning",
      subtitle: "Light the first little lanterns."
    },
    afternoon: {
      label: "Afternoon",
      subtitle: "The practical middle of the day."
    },
    evening: {
      label: "Evening",
      subtitle: "Set the room gently back in place."
    },
    bedtime: {
      label: "Bedtime",
      subtitle: "Nothing left to prove tonight."
    }
  };

  const STARTER_TASKS = [
    { id: uid(), name: "Morning care", section: "morning", type: "essential", resident: "reggie" },
    { id: uid(), name: "Wash face + SPF", section: "morning", type: "daily", resident: "silas" },
    { id: uid(), name: "One gratitude", section: "morning", type: "daily", resident: "silas", special: "gratitude" },

    { id: uid(), name: "Pet walk", section: "afternoon", type: "essential", resident: "daisy", sceneRole: "walk" },
    { id: uid(), name: "Daytime vitamin", section: "afternoon", type: "daily", resident: "reggie" },
    { id: uid(), name: "Afternoon care", section: "afternoon", type: "essential", resident: "reggie" },
    { id: uid(), name: "Pet care", section: "afternoon", type: "daily", resident: "silas", sceneRole: "petCare" },

    { id: uid(), name: "Tidy a little", section: "evening", type: "bonus", resident: "reggie" },
    { id: uid(), name: "Skincare", section: "evening", type: "daily", resident: "silas", sceneRole: "skincare" },

    { id: uid(), name: "Night care", section: "bedtime", type: "essential", resident: "reggie" },
    { id: uid(), name: "Braid hair", section: "bedtime", type: "bonus", resident: "silas", sceneRole: "hair" }
  ];

  const state = loadState();

  const els = {
    dateLine: byId("dateLine"),
    heroMessage: byId("heroMessage"),
    heroLantern: document.querySelector(".lantern-logo"),
    regularMode: byId("regularMode"),
    lowEnergyMode: byId("lowEnergyMode"),
    doneCount: byId("doneCount"),
    todayCount: byId("todayCount"),
    essentialLeft: byId("essentialLeft"),

    world: byId("world"),
    sceneBadge: byId("sceneBadge"),
    bigLantern: byId("bigLantern"),
    gratitudeTreeNote: byId("gratitudeTreeNote"),
    pawprints: byId("pawprints"),
    pondFill: byId("pondFill"),
    sceneBubble: byId("sceneBubble"),

    daisyScene: byId("daisyScene"),
    mallowScene: byId("mallowScene"),
    silasScene: byId("silasScene"),
    reggieScene: byId("reggieScene"),

    faceLight: byId("faceLight"),
    skinLight: byId("skinLight"),
    hairLight: byId("hairLight"),
    vanityMessage: byId("vanityMessage"),
    silasMessage: byId("silasMessage"),
    silasStamp: byId("silasStamp"),
    reggieMessage: byId("reggieMessage"),
    restStamp: byId("restStamp"),

    waterBadge: byId("waterBadge"),
    waterDrops: byId("waterDrops"),
    addWater: byId("addWater"),
    undoWater: byId("undoWater"),
    waterMessage: byId("waterMessage"),

    gratitudeInput: byId("gratitudeInput"),
    saveGratitude: byId("saveGratitude"),
    gratitudeSaved: byId("gratitudeSaved"),
    gratitudeLeafCount: byId("gratitudeLeafCount"),
    openGroveTree: byId("openGroveTree"),

    taskSections: byId("taskSections"),
    emptyRoutine: byId("emptyRoutine"),

    daisyChip: byId("daisyChip"),
    mallowChip: byId("mallowChip"),
    silasChip: byId("silasChip"),
    reggieChip: byId("reggieChip"),
    residentReactionFace: byId("residentReactionFace"),
    residentReactionName: byId("residentReactionName"),
    residentReactionText: byId("residentReactionText"),

    welcomeDialog: byId("welcomeDialog"),
    useStarter: byId("useStarter"),
    startBlank: byId("startBlank"),

    openSettings: byId("openSettings"),
    settingsDialog: byId("settingsDialog"),
    settingsTaskList: byId("settingsTaskList"),
    addTaskSettings: byId("addTaskSettings"),
    waterGoal: byId("waterGoal"),
    exportData: byId("exportData"),
    importData: byId("importData"),
    resetToday: byId("resetToday"),
    eraseEverything: byId("eraseEverything"),

    taskDialog: byId("taskDialog"),
    taskForm: byId("taskForm"),
    taskDialogTitle: byId("taskDialogTitle"),
    editingTaskId: byId("editingTaskId"),
    taskName: byId("taskName"),
    taskSection: byId("taskSection"),
    taskType: byId("taskType"),
    taskResident: byId("taskResident"),
    deleteTask: byId("deleteTask"),
    closeTaskDialog: byId("closeTaskDialog"),

    addTaskQuick: byId("addTaskQuick"),
    emptyAddTask: byId("emptyAddTask"),

    openPrivacy: byId("openPrivacy"),
    privacyDialog: byId("privacyDialog"),

    taskSectionTemplate: byId("taskSectionTemplate"),
    taskTemplate: byId("taskTemplate")
  };

  initialize();

  function initialize() {
    ensureToday();
    saveState();
    bindEvents();
    render();

    if (!state.setupComplete) {
      openDialog(els.welcomeDialog);
    }

    registerServiceWorker();
  }

  function bindEvents() {
    els.regularMode.addEventListener("click", () => setLowEnergy(false));
    els.lowEnergyMode.addEventListener("click", () => setLowEnergy(true));

    els.addWater.addEventListener("click", () => changeWater(1));
    els.undoWater.addEventListener("click", () => changeWater(-1));

    els.saveGratitude.addEventListener("click", saveGratitude);
    els.openGroveTree.addEventListener("click", () => {
      window.location.href = "./grove.html";
    });
    els.gratitudeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveGratitude();
      }
    });

    els.useStarter.addEventListener("click", () => {
      state.tasks = cloneTasks(STARTER_TASKS);
      state.setupComplete = true;
      saveState();
      closeDialog(els.welcomeDialog);
      render();
    });

    els.startBlank.addEventListener("click", () => {
      state.tasks = [];
      state.setupComplete = true;
      saveState();
      closeDialog(els.welcomeDialog);
      render();
    });

    els.openSettings.addEventListener("click", () => {
      renderSettings();
      els.waterGoal.value = String(state.settings.waterGoal);
      openDialog(els.settingsDialog);
    });

    els.addTaskQuick.addEventListener("click", () => openTaskEditor());
    els.emptyAddTask.addEventListener("click", () => openTaskEditor());
    els.addTaskSettings.addEventListener("click", () => openTaskEditor());

    els.taskForm.addEventListener("submit", saveTaskFromForm);
    els.closeTaskDialog.addEventListener("click", () => closeDialog(els.taskDialog));
    els.deleteTask.addEventListener("click", deleteEditingTask);

    els.waterGoal.addEventListener("change", () => {
      const nextGoal = clamp(Number(els.waterGoal.value), 4, 10);
      state.settings.waterGoal = nextGoal;
      state.today.water = clamp(state.today.water, 0, nextGoal);
      saveState();
      render();
    });

    els.exportData.addEventListener("click", exportBackup);
    els.importData.addEventListener("change", importBackup);
    els.resetToday.addEventListener("click", resetToday);
    els.eraseEverything.addEventListener("click", eraseEverything);

    els.openPrivacy.addEventListener("click", () => openDialog(els.privacyDialog));

    window.addEventListener("pageshow", () => {
      ensureToday();
      render();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        ensureToday();
        render();
      }
    });

    window.setInterval(() => {
      const changedDay = ensureToday();
      if (changedDay) {
        render();
      } else {
        renderDateLine();
      }
    }, 60000);
  }

  function setLowEnergy(value) {
    acknowledgeFreshDay();
    state.today.lowEnergy = value;
    saveState();
    reactResident(
      "reggie",
      value
        ? "Low-energy protection is active. Bonus lanterns have stepped aside."
        : "Regular day restored. Bonus lanterns are visible again."
    );
    render();
  }

  function changeWater(amount) {
    acknowledgeFreshDay();
    const before = state.today.water;
    state.today.water = clamp(
      state.today.water + amount,
      0,
      state.settings.waterGoal
    );

    if (state.today.water !== before) {
      saveState();
      reactResident("mallow",
        state.today.water === state.settings.waterGoal
          ? "Ceremonial splash achieved!"
          : "A droplet has been respectfully added."
      );
      render();
    }
  }

  function saveGratitude() {
    acknowledgeFreshDay();
    const value = els.gratitudeInput.value.trim();

    if (!value) {
      els.gratitudeSaved.hidden = false;
      els.gratitudeSaved.textContent = "Even one word counts.";
      return;
    }

    state.today.gratitude = value;
    upsertGratitudeLeaf(state.today.date, value);

    const gratitudeTask = state.tasks.find((task) => task.special === "gratitude");
    if (gratitudeTask) {
      state.today.done[gratitudeTask.id] = true;
    }

    saveState();
    reactResident("silas", "A quiet gratitude has reached the tree.");
    render();
  }

  function render() {
    ensureToday();
    renderModes();
    renderDateLine();
    renderProgress();
    renderWater();
    renderGratitude();
    renderTasks();
    renderScene();
    renderResidents();
  }

  function renderModes() {
    const low = state.today.lowEnergy;
    els.regularMode.classList.toggle("active", !low);
    els.lowEnergyMode.classList.toggle("active", low);
    els.world.classList.toggle("low-energy", low);
    els.sceneBadge.textContent = low ? "protected mode" : "dollhouse mode";
  }

  function renderDateLine() {
    const now = new Date();
    const hour = now.getHours();
    const daypart =
      hour < 12 ? "morning" :
      hour < 17 ? "afternoon" :
      hour < 21 ? "evening" :
      "bedtime";

    const date = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric"
    }).format(now);

    els.dateLine.textContent = `${date} · Good ${daypart}`;
  }

  function acknowledgeFreshDay() {
    if (state.today.freshGreeting) {
      state.today.freshGreeting = false;
    }
  }

  function renderProgress() {
    const active = activeTasks();
    const done = active.filter(isDone).length;
    const essentials = state.tasks.filter((task) => task.type === "essential");
    const essentialLeft = essentials.filter((task) => !isDone(task)).length;
    const percentage = active.length ? Math.round((done / active.length) * 100) : 0;

    els.doneCount.textContent = String(done);
    els.todayCount.textContent = String(active.length);
    els.essentialLeft.textContent = String(essentialLeft);

    if (state.today.freshGreeting) {
      els.heroMessage.textContent = "A new day has arrived. Nothing is overdue.";
    } else if (percentage === 0) {
      els.heroMessage.textContent = state.today.lowEnergy
        ? "Only the gentlest version of today is required."
        : "Tend what keeps you well. The rest can wait.";
    } else if (percentage < 35) {
      els.heroMessage.textContent = "The first lanterns are coming on.";
    } else if (percentage < 70) {
      els.heroMessage.textContent = "The keep is warming, one small thing at a time.";
    } else if (percentage < 100) {
      els.heroMessage.textContent = "Nearly tucked in. No heroic nonsense required.";
    } else {
      els.heroMessage.textContent =
        "The day is tended. Reggie has authorized guilt-free lounging.";
    }

    const lit = percentage > 0 || state.today.water > 0;
    els.heroLantern.classList.toggle("lit", lit);
    els.bigLantern.classList.toggle("lit", lit);

    document.querySelectorAll(".star").forEach((star, index) => {
      star.classList.toggle("on", percentage >= (index + 1) * 20);
    });
  }

  function renderWater() {
    const goal = state.settings.waterGoal;
    const amount = clamp(state.today.water, 0, goal);

    els.waterDrops.replaceChildren();

    for (let index = 0; index < goal; index += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "water-drop";
      button.textContent = "◌";
      button.classList.toggle("filled", index < amount);
      button.setAttribute(
        "aria-label",
        index < amount
          ? `Water moment ${index + 1}, completed`
          : `Water moment ${index + 1}, not completed`
      );

      button.addEventListener("click", () => {
        state.today.water = index < amount ? index : index + 1;
        saveState();
        reactResident("mallow", "Pond management is proceeding beautifully.");
        render();
      });

      els.waterDrops.appendChild(button);
    }

    els.waterBadge.textContent = `${amount} / ${goal}`;
    els.pondFill.style.height = `${Math.round((amount / goal) * 100)}%`;

    if (amount === 0) {
      els.waterMessage.textContent =
        `Mallow has arranged ${goal} official droplets.`;
    } else if (amount < Math.ceil(goal / 2)) {
      els.waterMessage.textContent = "The water lantern has started glowing.";
    } else if (amount < goal) {
      els.waterMessage.textContent =
        "Mallow is visibly encouraged by this development.";
    } else {
      els.waterMessage.textContent =
        "Water lantern full. Ceremonial splash achieved.";
    }
  }

  function renderGratitude() {
    const value = state.today.gratitude || "";
    els.gratitudeInput.value = value;
    els.gratitudeSaved.hidden = !value;
    els.gratitudeSaved.textContent = value
      ? `Kept for today: “${value}”`
      : "";

    els.gratitudeTreeNote.textContent = value;
    els.gratitudeTreeNote.classList.toggle("show", Boolean(value));

    const count = state.gratitudes.length;
    els.gratitudeLeafCount.textContent =
      `${count} ${count === 1 ? "leaf" : "leaves"}`;
    els.openGroveTree.classList.toggle("has-leaves", count > 0);
  }

  function renderTasks() {
    els.taskSections.replaceChildren();

    const visibleTasks = activeTasks();
    els.emptyRoutine.hidden = state.tasks.length > 0;

    Object.entries(SECTION_INFO).forEach(([sectionKey, info]) => {
      const allSectionTasks = state.tasks.filter(
        (task) => task.section === sectionKey
      );
      const sectionTasks = visibleTasks.filter(
        (task) => task.section === sectionKey
      );

      if (allSectionTasks.length === 0) {
        return;
      }

      const sectionNode =
        els.taskSectionTemplate.content.firstElementChild.cloneNode(true);

      sectionNode.querySelector("h3").textContent = info.label;
      sectionNode.querySelector(".time-heading p").textContent = info.subtitle;

      const doneCount = sectionTasks.filter(isDone).length;
      sectionNode.querySelector(".section-count").textContent =
        `${doneCount} / ${sectionTasks.length}`;

      const list = sectionNode.querySelector(".task-list");

      sectionTasks.forEach((task) => {
        const row = els.taskTemplate.content.firstElementChild.cloneNode(true);
        const checkbox = row.querySelector("input");
        const editButton = row.querySelector(".task-edit-button");

        checkbox.checked = isDone(task);
        row.classList.toggle("done", isDone(task));
        row.querySelector(".task-name").textContent = task.name;
        row.querySelector(".task-kind").textContent =
          task.type === "essential"
            ? "essential"
            : task.type === "bonus"
              ? "bonus"
              : "daily";

        checkbox.addEventListener("change", () => {
          setTaskDone(task, checkbox.checked);
        });

        row.addEventListener("click", (event) => {
          if (event.target.closest(".task-edit-button")) {
            return;
          }
          event.preventDefault();
          setTaskDone(task, !isDone(task));
        });

        editButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openTaskEditor(task.id);
        });

        list.appendChild(row);
      });

      els.taskSections.appendChild(sectionNode);
    });
  }

  function setTaskDone(task, done) {
    acknowledgeFreshDay();
    if (task.special === "gratitude" && done && !state.today.gratitude) {
      els.gratitudeInput.focus();
      els.gratitudeSaved.hidden = false;
      els.gratitudeSaved.textContent =
        "Add one true thing above, and this lantern will light.";
      els.gratitudeInput.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    state.today.done[task.id] = done;
    saveState();

    if (done) {
      reactResident(task.resident, reactionForTask(task));
    }

    render();
  }

  function renderScene() {
    const walkDone = state.tasks.some(
      (task) => task.sceneRole === "walk" && isDone(task)
    );
    const petCareDone = state.tasks.some(
      (task) => task.sceneRole === "petCare" && isDone(task)
    );
    const skincareDone = state.tasks.some(
      (task) => task.sceneRole === "skincare" && isDone(task)
    );
    const hairDone = state.tasks.some(
      (task) => task.sceneRole === "hair" && isDone(task)
    );

    const morningCareDone = state.tasks.some(
      (task) =>
        task.section === "morning" &&
        task.resident === "silas" &&
        task.special !== "gratitude" &&
        isDone(task)
    );

    els.pawprints.classList.toggle("show", walkDone);

    els.faceLight.classList.toggle("on", morningCareDone);
    els.skinLight.classList.toggle("on", skincareDone);
    els.hairLight.classList.toggle("on", hairDone);

    if (morningCareDone && skincareDone && hairDone) {
      els.vanityMessage.textContent = "The vanity lantern is fully awake.";
    } else if (morningCareDone || skincareDone || hairDone) {
      els.vanityMessage.textContent = "A little glow has arrived.";
    } else {
      els.vanityMessage.textContent = "Waiting for a little glow.";
    }

    els.silasStamp.classList.toggle("show", petCareDone || Boolean(state.today.gratitude));

    if (petCareDone && state.today.gratitude) {
      els.silasMessage.textContent = "Pleased, discreetly.";
    } else if (petCareDone) {
      els.silasMessage.textContent = "Household standards restored.";
    } else if (state.today.gratitude) {
      els.silasMessage.textContent = "A quiet thought has been kept.";
    } else {
      els.silasMessage.textContent = "Standards pending.";
    }

    const essentials = state.tasks.filter((task) => task.type === "essential");
    const essentialsDone = essentials.filter(isDone).length;
    const permitGranted = essentials.length > 0 && essentialsDone === essentials.length;

    els.restStamp.classList.toggle("show", permitGranted);
    els.reggieScene.classList.toggle("permit", permitGranted);

    if (essentials.length === 0) {
      els.reggieMessage.textContent = "No essential permits configured.";
    } else if (permitGranted) {
      els.reggieMessage.textContent = "Rest permit approved.";
    } else if (essentialsDone === 0) {
      els.reggieMessage.textContent = "No permit issued.";
    } else {
      els.reggieMessage.textContent =
        `${essentialsDone} of ${essentials.length} approvals filed.`;
    }
  }

  function renderResidents() {
    const residents = {
      daisy: { chip: els.daisyChip, face: "🐶", label: "Daisy" },
      mallow: { chip: els.mallowChip, face: "🐊", label: "Mallow" },
      silas: { chip: els.silasChip, face: "🐈‍⬛", label: "Silas" },
      reggie: { chip: els.reggieChip, face: "🚨", label: "Reggie" }
    };

    Object.values(residents).forEach(({ chip }) => {
      chip?.classList.remove("active");
    });

    const reaction = state.today.lastReaction;
    const resident = reaction ? residents[reaction.resident] : null;

    if (!reaction || !resident) {
      els.residentReactionFace.textContent = "💗";
      els.residentReactionName.textContent = "The residents";
      els.residentReactionText.textContent = "Everyone is keeping gentle watch.";
      return;
    }

    resident.chip?.classList.add("active");
    els.residentReactionFace.textContent = resident.face;
    els.residentReactionName.textContent = resident.label;
    els.residentReactionText.textContent = reaction.message;
  }

  function reactResident(name, message) {
    acknowledgeFreshDay();
    state.today.lastReaction = { resident: name, message };
    saveState();
    renderResidents();

    const scene = byId(`${name}Scene`);
    const chip = byId(`${name}Chip`);

    scene?.classList.remove("react");
    chip?.classList.remove("react");

    requestAnimationFrame(() => {
      scene?.classList.add("react");
      chip?.classList.add("react");
    });

    showSceneMessage(message);

    window.setTimeout(() => {
      scene?.classList.remove("react");
      chip?.classList.remove("react");
    }, 1300);
  }

  function showSceneMessage(message) {
    els.sceneBubble.textContent = message;
    els.sceneBubble.classList.add("show");

    window.clearTimeout(showSceneMessage.timeoutId);
    showSceneMessage.timeoutId = window.setTimeout(() => {
      els.sceneBubble.classList.remove("show");
    }, 2800);
  }

  function renderSettings() {
    els.settingsTaskList.replaceChildren();

    if (state.tasks.length === 0) {
      const note = document.createElement("p");
      note.className = "gentle-note";
      note.textContent = "No tasks yet. Add one small lantern whenever you’re ready.";
      els.settingsTaskList.appendChild(note);
      return;
    }

    state.tasks.forEach((task) => {
      const row = document.createElement("div");
      row.className = "settings-task";

      const copy = document.createElement("div");
      copy.className = "settings-task-copy";

      const name = document.createElement("strong");
      name.textContent = task.name;

      const meta = document.createElement("small");
      meta.textContent =
        `${SECTION_INFO[task.section]?.label || task.section} · ${task.type}`;

      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = "Edit";
      edit.addEventListener("click", () => openTaskEditor(task.id));

      copy.append(name, meta);
      row.append(copy, edit);
      els.settingsTaskList.appendChild(row);
    });
  }

  function openTaskEditor(taskId = "") {
    const task = state.tasks.find((item) => item.id === taskId);

    els.editingTaskId.value = task?.id || "";
    els.taskDialogTitle.textContent = task ? "Edit this lantern" : "Add a lantern";
    els.taskName.value = task?.name || "";
    els.taskSection.value = task?.section || "morning";
    els.taskType.value = task?.type || "daily";
    els.taskResident.value = task?.resident || "reggie";
    els.deleteTask.hidden = !task;

    openDialog(els.taskDialog);
    window.setTimeout(() => els.taskName.focus(), 80);
  }

  function saveTaskFromForm(event) {
    event.preventDefault();

    const name = els.taskName.value.trim();
    if (!name) {
      els.taskName.focus();
      return;
    }

    const taskId = els.editingTaskId.value;
    const existing = state.tasks.find((task) => task.id === taskId);

    if (existing) {
      existing.name = name;
      existing.section = els.taskSection.value;
      existing.type = els.taskType.value;
      existing.resident = els.taskResident.value;
    } else {
      state.tasks.push({
        id: uid(),
        name,
        section: els.taskSection.value,
        type: els.taskType.value,
        resident: els.taskResident.value
      });
    }

    saveState();
    closeDialog(els.taskDialog);
    render();
    renderSettings();
  }

  function deleteEditingTask() {
    const taskId = els.editingTaskId.value;
    if (!taskId) {
      return;
    }

    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const confirmed = window.confirm(`Remove “${task.name}” from Lanternkeep?`);
    if (!confirmed) {
      return;
    }

    state.tasks = state.tasks.filter((item) => item.id !== taskId);
    delete state.today.done[taskId];

    saveState();
    closeDialog(els.taskDialog);
    render();
    renderSettings();
  }

  function exportBackup() {
    const payload = {
      app: "Lanternkeep",
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      data: state
    };

    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lanternkeep-backup-${localDateKey()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const imported = payload?.data;

      if (
        !imported ||
        !Array.isArray(imported.tasks) ||
        typeof imported.settings !== "object"
      ) {
        throw new Error("That file is not a Lanternkeep backup.");
      }

      const confirmed = window.confirm(
        "Replace this device’s Lanternkeep data with the imported backup?"
      );

      if (!confirmed) {
        return;
      }

      Object.assign(state, normalizeState(imported));
      ensureToday();
      saveState();
      closeDialog(els.settingsDialog);
      render();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "The backup could not be imported.");
    }
  }

  function resetToday() {
    const confirmed = window.confirm(
      "Reset only today’s checks, water, gratitude, and energy mode?"
    );

    if (!confirmed) {
      return;
    }

    state.gratitudes = state.gratitudes.filter(
      (entry) => entry.date !== localDateKey()
    );
    state.today = freshToday();
    saveState();
    render();
  }

  function eraseEverything() {
    const confirmed = window.confirm(
      "Erase every task and all Lanternkeep data stored in this browser?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return normalizeState({});
      }
      return normalizeState(JSON.parse(saved));
    } catch {
      return normalizeState({});
    }
  }

  function normalizeState(input) {
    const today = normalizeToday(input.today);
    const gratitudes = normalizeGratitudes(input.gratitudes);

    if (today.gratitude) {
      const existing = gratitudes.find((entry) => entry.date === today.date);
      if (existing) {
        existing.text = today.gratitude;
      } else {
        gratitudes.push({
          id: `gratitude-${today.date}`,
          date: today.date,
          text: today.gratitude,
          savedAt: `${today.date}T12:00:00`
        });
      }
    }

    gratitudes.sort((a, b) => a.date.localeCompare(b.date));

    return {
      version: APP_VERSION,
      setupComplete: Boolean(input.setupComplete),
      tasks: Array.isArray(input.tasks) ? input.tasks.map(normalizeTask) : [],
      settings: {
        waterGoal: clamp(Number(input.settings?.waterGoal || 6), 4, 10)
      },
      gratitudes,
      today
    };
  }

  function normalizeTask(task) {
    return {
      id: String(task.id || uid()),
      name: String(task.name || "Untitled lantern").slice(0, 80),
      section: SECTION_INFO[task.section] ? task.section : "morning",
      type: ["essential", "daily", "bonus"].includes(task.type)
        ? task.type
        : "daily",
      resident: ["daisy", "mallow", "silas", "reggie"].includes(task.resident)
        ? task.resident
        : "reggie",
      special: task.special === "gratitude" ? "gratitude" : undefined,
      sceneRole: ["walk", "petCare", "skincare", "hair"].includes(task.sceneRole)
        ? task.sceneRole
        : undefined
    };
  }

  function normalizeGratitudes(gratitudes) {
    if (!Array.isArray(gratitudes)) {
      return [];
    }

    const byDate = new Map();

    gratitudes.forEach((entry) => {
      const date = String(entry?.date || "");
      const text = String(entry?.text || "").trim().slice(0, 160);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !text) {
        return;
      }

      byDate.set(date, {
        id: String(entry?.id || `gratitude-${date}`),
        date,
        text,
        savedAt: String(entry?.savedAt || `${date}T12:00:00`)
      });
    });

    return Array.from(byDate.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  }

  function upsertGratitudeLeaf(date, text) {
    const cleanText = String(text || "").trim().slice(0, 160);
    if (!cleanText) {
      return;
    }

    const existing = state.gratitudes.find((entry) => entry.date === date);

    if (existing) {
      existing.text = cleanText;
      existing.savedAt = new Date().toISOString();
      return;
    }

    state.gratitudes.push({
      id: `gratitude-${date}`,
      date,
      text: cleanText,
      savedAt: new Date().toISOString()
    });

    state.gratitudes.sort((a, b) => a.date.localeCompare(b.date));
  }

  function normalizeToday(today) {
    const normalized = {
      date: String(today?.date || localDateKey()),
      lowEnergy: Boolean(today?.lowEnergy),
      water: Math.max(0, Number(today?.water || 0)),
      gratitude: String(today?.gratitude || "").slice(0, 160),
      freshGreeting: today?.freshGreeting !== false,
      lastReaction:
        today?.lastReaction &&
        ["daisy", "mallow", "silas", "reggie"].includes(today.lastReaction.resident)
          ? {
              resident: today.lastReaction.resident,
              message: String(today.lastReaction.message || "").slice(0, 180)
            }
          : null,
      done: {}
    };

    if (today?.done && typeof today.done === "object") {
      Object.entries(today.done).forEach(([id, value]) => {
        normalized.done[String(id)] = Boolean(value);
      });
    }

    return normalized;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function ensureToday() {
    const key = localDateKey();

    let changedDay = false;

    if (!state.today || state.today.date !== key) {
      state.today = freshToday();
      saveState();
      changedDay = true;
    }

    state.today.water = clamp(
      state.today.water,
      0,
      state.settings.waterGoal
    );

    return changedDay;
  }

  function freshToday() {
    return {
      date: localDateKey(),
      lowEnergy: false,
      water: 0,
      gratitude: "",
      freshGreeting: true,
      lastReaction: null,
      done: {}
    };
  }

  function activeTasks() {
    if (!state.today.lowEnergy) {
      return state.tasks;
    }
    return state.tasks.filter((task) => task.type !== "bonus");
  }

  function isDone(task) {
    if (task.special === "gratitude") {
      return Boolean(state.today.gratitude);
    }
    return Boolean(state.today.done[task.id]);
  }

  function reactionForTask(task) {
    if (task.sceneRole === "walk") {
      return "Patrol complete. The neighbourhood has been professionally sniffed.";
    }

    if (task.sceneRole === "petCare") {
      return "Household standards restored.";
    }

    if (task.sceneRole === "skincare") {
      return "The vanity lantern is glowing.";
    }

    if (task.sceneRole === "hair") {
      return "Sleep configuration prepared.";
    }

    if (task.type === "essential") {
      return "An essential approval has been officially filed.";
    }

    if (task.type === "bonus") {
      return "A bonus lantern! Entirely optional, still lovely.";
    }

    return "A small lantern has been tended.";
  }

  function localDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function uid() {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function cloneTasks(tasks) {
    return tasks.map((task) => ({ ...task, id: uid() }));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // The app still works online if service-worker registration is unavailable.
      });
    });
  }
})();
