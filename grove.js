(() => {
  "use strict";

  const STORAGE_KEY = "lanternkeep.v1";
  const state = loadState();

  const els = {
    groveTotalBadge: byId("groveTotalBadge"),
    branchCountBadge: byId("branchCountBadge"),
    monthBranches: byId("monthBranches"),
    groveEmpty: byId("groveEmpty"),
    groveContent: byId("groveContent"),
    selectedMonthTitle: byId("selectedMonthTitle"),
    selectedMonthCount: byId("selectedMonthCount"),
    leafCanopy: byId("leafCanopy"),
    memoryDate: byId("memoryDate"),
    memoryTitle: byId("memoryTitle"),
    memoryText: byId("memoryText")
  };

  let selectedMonth = latestMonthKey();
  let selectedLeafDate = latestLeaf()?.date || "";

  migrateCurrentGratitude();
  render();
  registerServiceWorker();

  window.addEventListener("pageshow", () => {
    const refreshed = loadState();
    Object.assign(state, refreshed);
    migrateCurrentGratitude();
    selectedMonth = validSelectedMonth(selectedMonth);
    selectedLeafDate = validSelectedLeaf(selectedLeafDate);
    render();
  });

  function render() {
    const gratitudes = sortedGratitudes();
    const groups = groupByMonth(gratitudes);
    const monthKeys = Array.from(groups.keys()).sort().reverse();

    els.groveTotalBadge.textContent = leafLabel(gratitudes.length);
    els.branchCountBadge.textContent = branchLabel(monthKeys.length);
    els.groveEmpty.hidden = gratitudes.length > 0;
    els.groveContent.hidden = gratitudes.length === 0;

    renderMonthBranches(monthKeys, groups);

    if (gratitudes.length === 0) {
      return;
    }

    selectedMonth = validSelectedMonth(selectedMonth);
    const leaves = groups.get(selectedMonth) || [];
    selectedLeafDate = validSelectedLeaf(selectedLeafDate, leaves);

    els.selectedMonthTitle.textContent = formatMonth(selectedMonth);
    els.selectedMonthCount.textContent = leafLabel(leaves.length);
    renderLeaves(leaves);
    renderMemory(leaves.find((leaf) => leaf.date === selectedLeafDate) || leaves.at(-1));
  }

  function renderMonthBranches(monthKeys, groups) {
    els.monthBranches.replaceChildren();

    monthKeys.forEach((monthKey) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "month-branch-button";
      button.classList.toggle("active", monthKey === selectedMonth);
      button.setAttribute("aria-pressed", String(monthKey === selectedMonth));

      const month = document.createElement("strong");
      month.textContent = formatMonth(monthKey, true);

      const count = document.createElement("small");
      count.textContent = leafLabel(groups.get(monthKey)?.length || 0);

      button.append(month, count);
      button.addEventListener("click", () => {
        selectedMonth = monthKey;
        const monthLeaves = groups.get(monthKey) || [];
        selectedLeafDate = monthLeaves.at(-1)?.date || "";
        render();
      });

      els.monthBranches.appendChild(button);
    });
  }

  function renderLeaves(leaves) {
    els.leafCanopy.replaceChildren();

    leaves.forEach((leaf, index) => {
      const date = parseLocalDate(leaf.date);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "grove-leaf-button";
      button.classList.toggle("active", leaf.date === selectedLeafDate);
      button.classList.toggle("today", leaf.date === localDateKey());
      button.style.setProperty("--leaf-turn", `${leafTurn(index)}deg`);
      button.setAttribute("aria-pressed", String(leaf.date === selectedLeafDate));
      button.setAttribute("aria-label", `${formatFullDate(leaf.date)}: ${leaf.text}`);

      const dayNumber = document.createElement("strong");
      dayNumber.textContent = String(date.getDate());

      const weekday = document.createElement("small");
      weekday.textContent = new Intl.DateTimeFormat(undefined, {
        weekday: "short"
      }).format(date);

      button.append(dayNumber, weekday);
      button.addEventListener("click", () => {
        selectedLeafDate = leaf.date;
        renderLeaves(leaves);
        renderMemory(leaf);
      });

      els.leafCanopy.appendChild(button);
    });
  }

  function renderMemory(leaf) {
    if (!leaf) {
      els.memoryDate.textContent = "Tap a leaf";
      els.memoryTitle.textContent = "Every leaf holds one true thing.";
      els.memoryText.textContent = "There are no empty leaves for days you missed.";
      return;
    }

    els.memoryDate.textContent = formatFullDate(leaf.date);
    els.memoryTitle.textContent = leaf.date === localDateKey()
      ? "Today’s leaf"
      : "A leaf from this day";
    els.memoryText.textContent = `“${leaf.text}”`;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        ...parsed,
        gratitudes: normalizeGratitudes(parsed.gratitudes),
        today: parsed.today && typeof parsed.today === "object"
          ? parsed.today
          : { date: localDateKey(), gratitude: "" }
      };
    } catch {
      return {
        gratitudes: [],
        today: { date: localDateKey(), gratitude: "" }
      };
    }
  }

  function migrateCurrentGratitude() {
    const date = String(state.today?.date || "");
    const text = String(state.today?.gratitude || "").trim().slice(0, 160);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !text) {
      return;
    }

    const existing = state.gratitudes.find((entry) => entry.date === date);
    if (existing) {
      existing.text = text;
    } else {
      state.gratitudes.push({
        id: `gratitude-${date}`,
        date,
        text,
        savedAt: new Date().toISOString()
      });
    }

    state.gratitudes.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  function sortedGratitudes() {
    return [...state.gratitudes].sort((a, b) => a.date.localeCompare(b.date));
  }

  function groupByMonth(gratitudes) {
    const groups = new Map();

    gratitudes.forEach((leaf) => {
      const key = leaf.date.slice(0, 7);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(leaf);
    });

    return groups;
  }

  function latestLeaf() {
    return sortedGratitudes().at(-1) || null;
  }

  function latestMonthKey() {
    return latestLeaf()?.date.slice(0, 7) || localDateKey().slice(0, 7);
  }

  function validSelectedMonth(monthKey) {
    const keys = Array.from(groupByMonth(sortedGratitudes()).keys());
    return keys.includes(monthKey) ? monthKey : latestMonthKey();
  }

  function validSelectedLeaf(date, leaves = null) {
    const source = leaves || sortedGratitudes();
    return source.some((leaf) => leaf.date === date)
      ? date
      : source.at(-1)?.date || "";
  }

  function formatMonth(monthKey, compact = false) {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat(undefined, compact
      ? { month: "short", year: "numeric" }
      : { month: "long", year: "numeric" }
    ).format(date);
  }

  function formatFullDate(dateKey) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(parseLocalDate(dateKey));
  }

  function parseLocalDate(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function leafTurn(index) {
    return [-8, 5, -3, 8, -6, 3, -10, 6][index % 8];
  }

  function leafLabel(count) {
    return `${count} ${count === 1 ? "leaf" : "leaves"}`;
  }

  function branchLabel(count) {
    return `${count} ${count === 1 ? "branch" : "branches"}`;
  }

  function localDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // The Grove still works online if offline support is unavailable.
      });
    });
  }
})();
