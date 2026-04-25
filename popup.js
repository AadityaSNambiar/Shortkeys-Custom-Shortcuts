document.addEventListener("DOMContentLoaded", () => {
  const ICONS = {
    play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    export: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    up: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    down: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>',
    copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    pick: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
  };

  // Safe SVG icon injector — avoids innerHTML by using DOMParser
  const _svgParser = new DOMParser();
  function setIcon(el, svgStr) {
    const doc = _svgParser.parseFromString(svgStr, "image/svg+xml");
    const svg = doc.documentElement;
    el.textContent = "";
    el.appendChild(document.importNode(svg, true));
  }
  function setIconWithText(el, svgStr, text) {
    setIcon(el, svgStr);
    el.appendChild(document.createTextNode(" " + text));
  }

  // ═══════════════════════════════════════════════════════════════
  //  DOM REFS
  // ═══════════════════════════════════════════════════════════════
  const mappingsListDiv = document.getElementById("mappings-list");
  const exportButton = document.getElementById("export-button");
  const importFileElement = document.getElementById("import-file");
  const importStatus = document.getElementById("import-status");

  const seqNewBtn = document.getElementById("seq-new-btn");
  const seqBuilder = document.getElementById("seq-builder");
  const seqBuilderTitle = document.getElementById("seq-builder-title");
  const seqBuilderClose = document.getElementById("seq-builder-close");
  const seqNameInput = document.getElementById("seq-name-input");
  const seqHostnameInput = document.getElementById("seq-hostname-input");
  const seqTriggerDisplay = document.getElementById("seq-trigger-display");
  const seqCaptureTrigger = document.getElementById("seq-capture-trigger");
  const seqClearTrigger = document.getElementById("seq-clear-trigger");
  const seqStepsList = document.getElementById("seq-steps-list");
  const seqSaveBtn = document.getElementById("seq-save-btn");
  const seqTestBtn = document.getElementById("seq-test-btn");
  const seqList = document.getElementById("seq-list");
  const seqImportBtnUI = document.getElementById("seq-import-btn-ui");
  const seqTimeoutInput = document.getElementById("seq-timeout-input");
  
  const settingsHudPos = document.getElementById("settings-hud-pos");
  const settingsScale = document.getElementById("settings-scale");
  const settingsScaleVal = document.getElementById("settings-scale-val");
  const settingsFontScale = document.getElementById("settings-font-scale");
  const settingsFontScaleVal = document.getElementById("settings-font-scale-val");
  const settingsIconScale = document.getElementById("settings-icon-scale");
  const settingsIconScaleVal = document.getElementById("settings-icon-scale-val");

  const bindNewBtn = document.getElementById("bind-new-btn");
  const bindBuilder = document.getElementById("bind-builder");
  const bindBuilderTitle = document.getElementById("bind-builder-title");
  const bindBuilderClose = document.getElementById("bind-builder-close");
  const bindHostnameInput = document.getElementById("bind-hostname-input");
  const bindTriggerDisplay = document.getElementById("bind-trigger-display");
  const bindCaptureTrigger = document.getElementById("bind-capture-trigger");
  const bindClearTrigger = document.getElementById("bind-clear-trigger");
  const bindSelectorInput = document.getElementById("bind-selector-input");
  const bindPickBtn = document.getElementById("bind-pick-btn");
  const bindLabelInput = document.getElementById("bind-label-input");
  const bindSaveBtn = document.getElementById("bind-save-btn");
  const bindTimeoutInput = document.getElementById("bind-timeout-input");

  // ═══════════════════════════════════════════════════════════════
  //  CONSTANTS & STATE
  // ═══════════════════════════════════════════════════════════════
  const SEQ_STORAGE_KEY = "__shortkeys_sequences__";
  const PICKER_STORAGE_KEY = "__shortkeys_picker_result__";
  const BUILDER_STATE_KEY = "__shortkeys_builder_state__";
  const BIND_BUILDER_STATE_KEY = "__shortkeys_bind_builder_state__";
  const CONTEXT_PENDING_KEY = "__shortkeys_context_pending__";

  let allMappings = {};
  let allSequences = {};

  // Bind builder state
  let bindEditingHostname = null;
  let bindEditingIndex = null;
  let bindCurrentTrigger = "";
  let isBindCapturing = false;

  // Seq builder state
  let editingSeqHostname = null;
  let editingSeqIndex = null;
  let currentTrigger = "";
  let builderSteps = [];
  let isSeqCapturing = false;

  // ═══════════════════════════════════════════════════════════════
  //  TABS
  // ═══════════════════════════════════════════════════════════════
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  function switchToTab(name) {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
    if (btn) btn.classList.add("active");
    const el = document.getElementById(`tab-${name}`);
    if (el) el.classList.add("active");
  }
  tabButtons.forEach(btn => btn.addEventListener("click", () => switchToTab(btn.dataset.tab)));

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("tab")) switchToTab(urlParams.get("tab"));

  // ═══════════════════════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════════════════════
  function showNotification(msg, type = "success") {
    const c = document.getElementById("notification-container");
    const el = document.createElement("div");
    el.className = `notification ${type}`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 3000);
  }

  function formatCombo(combo) {
    return combo.split("+").map(p => {
      if (p === "ctrl") return "Ctrl";
      if (p === "alt") return "Alt";
      if (p === "shift") return "Shift";
      if (p === "meta") return "Meta";
      if (p === " ") return "Space";
      if (p === "arrowup") return "↑";
      if (p === "arrowdown") return "↓";
      if (p === "arrowleft") return "←";
      if (p === "arrowright") return "→";
      if (p === "enter") return "⏎";
      if (p === "backspace") return "⌫";
      if (p === "delete") return "Del";
      if (p === "tab") return "Tab";
      if (p === "escape") return "Esc";
      return p.length === 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1);
    });
  }

  function comboBadge(comboStr) {
    const parts = formatCombo(comboStr);
    const d = document.createElement("div");
    d.className = "combo-badge";
    parts.forEach((p, i) => {
      const s = document.createElement("span");
      s.className = "key-badge";
      s.textContent = p;
      d.appendChild(s);
      if (i < parts.length - 1) {
        const pl = document.createElement("span");
        pl.className = "combo-plus";
        pl.textContent = "+";
        d.appendChild(pl);
      }
    });
    return d;
  }

  function parseKeyEvent(e) {
    let key = e.key.toLowerCase();
    if (["control", "alt", "shift", "meta"].includes(key)) return null;
    let parts = [];
    if (e.ctrlKey) parts.push("ctrl");
    if (e.altKey) parts.push("alt");
    if (e.shiftKey) parts.push("shift");
    if (e.metaKey) parts.push("meta");
    parts.push(key);
    return parts.join("+");
  }

  function showBuilder(builder, listEl, barSelector) {
    builder.style.display = "flex";
    if (listEl) listEl.style.display = "none";
    const bar = document.querySelector(barSelector);
    if (bar) bar.style.display = "none";
  }

  function hideBuilder(builder, listEl, barSelector) {
    builder.style.display = "none";
    if (listEl) listEl.style.display = "";
    const bar = document.querySelector(barSelector);
    if (bar) bar.style.display = "";
  }

  // ═══════════════════════════════════════════════════════════════
  //  GLOBAL KEYDOWN — shared by both capture modes
  // ═══════════════════════════════════════════════════════════════
  window.addEventListener("keydown", (e) => {
    if (isBindCapturing) {
      e.preventDefault(); e.stopPropagation();
      if (e.key === "Escape") { isBindCapturing = false; renderBindTrigger(); return; }
      const combo = parseKeyEvent(e);
      if (!combo) return;
      bindCurrentTrigger = combo;
      isBindCapturing = false;
      renderBindTrigger();
    } else if (isSeqCapturing) {
      e.preventDefault(); e.stopPropagation();
      if (e.key === "Escape") { isSeqCapturing = false; renderSeqTrigger(); return; }
      const combo = parseKeyEvent(e);
      if (!combo) return;
      currentTrigger = combo;
      isSeqCapturing = false;
      renderSeqTrigger();
    }
  }, true);

  // ═══════════════════════════════════════════════════════════════
  //  BINDING BUILDER
  // ═══════════════════════════════════════════════════════════════
  function renderBindTrigger() {
    bindTriggerDisplay.textContent = "";
    if (isBindCapturing) {
      const span = document.createElement("span");
      span.className = "capture-pulse";
      span.textContent = "Press key combo…";
      bindTriggerDisplay.appendChild(span);
      bindTriggerDisplay.classList.add("capturing");
      bindCaptureTrigger.style.display = "none";
      bindClearTrigger.textContent = "Cancel";
      bindClearTrigger.style.display = "";
    } else if (bindCurrentTrigger) {
      bindTriggerDisplay.appendChild(comboBadge(bindCurrentTrigger));
      bindTriggerDisplay.classList.remove("capturing");
      bindCaptureTrigger.textContent = "Re-capture";
      bindCaptureTrigger.style.display = "";
      bindClearTrigger.textContent = "Clear";
      bindClearTrigger.style.display = "";
    } else {
      const span = document.createElement("span");
      span.className = "placeholder-text";
      span.textContent = "Click Capture to set…";
      bindTriggerDisplay.appendChild(span);
      bindTriggerDisplay.classList.remove("capturing");
      bindCaptureTrigger.textContent = "Capture";
      bindCaptureTrigger.style.display = "";
      bindClearTrigger.style.display = "none";
    }
  }

  function getBindState() {
    return {
      hostname: bindHostnameInput.value,
      trigger: bindCurrentTrigger,
      selector: bindSelectorInput.value,
      label: bindLabelInput.value,
      timeout: parseInt(bindTimeoutInput.value) || 8000,
      editingHostname: bindEditingHostname,
      editingIndex: bindEditingIndex
    };
  }

  function restoreBindState(s) {
    bindEditingHostname = s.editingHostname || null;
    bindEditingIndex = s.editingIndex != null ? s.editingIndex : null;
    bindHostnameInput.value = s.hostname || "";
    bindCurrentTrigger = s.trigger || "";
    bindSelectorInput.value = s.selector || "";
    bindLabelInput.value = s.label || "";
    bindTimeoutInput.value = s.timeout || 8000;
    bindBuilderTitle.textContent = bindEditingHostname != null ? "Edit Binding" : "New Binding";
    renderBindTrigger();
    showBuilder(bindBuilder, mappingsListDiv, "#tab-mappings .section-bar");
  }

  function openBindBuilder(hostname = "", trigger = "", selector = "", label = "", timeout = 8000, editHost = null, editIdx = null) {
    bindEditingHostname = editHost;
    bindEditingIndex = editIdx;
    bindCurrentTrigger = trigger;
    bindHostnameInput.value = hostname;
    bindSelectorInput.value = selector;
    bindLabelInput.value = label;
    bindTimeoutInput.value = timeout;
    bindBuilderTitle.textContent = editHost != null ? "Edit Binding" : "New Binding";
    renderBindTrigger();
    showBuilder(bindBuilder, mappingsListDiv, "#tab-mappings .section-bar");
  }

  bindNewBtn.addEventListener("click", async () => {
    let host = "";
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.url) {
        let u = new URL(tabs[0].url);
        host = u.hostname || 'local';
      }
    } catch (e) {}
    openBindBuilder(host);
  });

  bindBuilderClose.addEventListener("click", () => {
    hideBuilder(bindBuilder, mappingsListDiv, "#tab-mappings .section-bar");
  });

  bindCaptureTrigger.addEventListener("click", () => { isBindCapturing = true; renderBindTrigger(); });
  bindClearTrigger.addEventListener("click", () => { isBindCapturing = false; bindCurrentTrigger = ""; renderBindTrigger(); });

  bindPickBtn.addEventListener("click", async () => {
    await browser.storage.local.set({ [BIND_BUILDER_STATE_KEY]: getBindState() });
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await browser.tabs.sendMessage(tabs[0].id, { action: "startPicker", stepIndex: -1 });
        window.close();
      }
    } catch (err) { showNotification("Picker failed: " + err.message, "error"); }
  });

  bindSaveBtn.addEventListener("click", async () => {
    const hostname = bindHostnameInput.value.trim();
    const selector = bindSelectorInput.value.trim();
    if (!hostname) return showNotification("Hostname required", "error");
    if (!bindCurrentTrigger) return showNotification("Trigger key required", "error");
    if (!selector) return showNotification("CSS selector required", "error");

    if (!allMappings[hostname]) allMappings[hostname] = [];
    const m = { 
      key: bindCurrentTrigger, 
      selector, 
      label: bindLabelInput.value.trim(),
      timeout: parseInt(bindTimeoutInput.value) || 8000
    };

    if (bindEditingHostname != null && bindEditingIndex != null) {
      if (bindEditingHostname !== hostname) {
        allMappings[bindEditingHostname].splice(bindEditingIndex, 1);
        if (!allMappings[bindEditingHostname].length) {
          delete allMappings[bindEditingHostname];
          await browser.storage.local.remove(bindEditingHostname);
        } else {
          await browser.storage.local.set({ [bindEditingHostname]: allMappings[bindEditingHostname] });
        }
        allMappings[hostname].push(m);
      } else {
        allMappings[hostname][bindEditingIndex] = m;
      }
    } else {
      allMappings[hostname].push(m);
    }
    await browser.storage.local.set({ [hostname]: allMappings[hostname] });

    showNotification("Binding saved!");
    hideBuilder(bindBuilder, mappingsListDiv, "#tab-mappings .section-bar");
    loadMappings();
  });

  // ═══════════════════════════════════════════════════════════════
  //  MAPPINGS RENDERING
  // ═══════════════════════════════════════════════════════════════
  function renderMappings() {
    mappingsListDiv.textContent = "";
    const hosts = Object.keys(allMappings).sort();

    if (!hosts.length) {
      const emptyStateText = document.createElement("div");
      emptyStateText.className = "empty-state";
      const emptyTitle = document.createElement("p");
      emptyTitle.className = "empty-title";
      emptyTitle.textContent = "No bindings yet";
      const emptyHint = document.createElement("p");
      emptyHint.className = "empty-hint";
      emptyHint.textContent = "Click + New above or right-click any element on a page.";
      emptyStateText.appendChild(emptyTitle);
      emptyStateText.appendChild(emptyHint);
      mappingsListDiv.appendChild(emptyStateText);
      return;
    }

    hosts.forEach(host => {
      const maps = allMappings[host] || [];
      if (!maps.length) return;

      const card = document.createElement("div");
      card.className = "site-card";

      const header = document.createElement("div");
      header.className = "site-card-header";
      const h = document.createElement("span");
      h.className = "site-hostname";
      h.textContent = host;
      const cnt = document.createElement("span");
      cnt.className = "site-count";
      cnt.textContent = maps.length;
      header.appendChild(h);
      header.appendChild(cnt);
      card.appendChild(header);

      const items = document.createElement("div");
      items.className = "mapping-items";

      maps.forEach((m, idx) => {
        const row = document.createElement("div");
        row.className = "mapping-item";
        row.appendChild(comboBadge(m.key));

        const content = document.createElement("div");
        content.className = "mapping-content";
        const lbl = document.createElement("input");
        lbl.type = "text";
        lbl.className = "mapping-label" + (m.label ? "" : " dim");
        lbl.value = m.label || "";
        lbl.placeholder = "No label";
        lbl.style.border = "none";
        lbl.style.background = "transparent";
        lbl.style.fontFamily = "inherit";
        lbl.style.fontSize = "inherit";
        lbl.style.fontWeight = "inherit";
        lbl.style.color = "inherit";
        lbl.style.width = "100%";
        lbl.style.outline = "none";
        lbl.addEventListener("change", async (e) => {
          m.label = e.target.value.trim();
          await browser.storage.local.set({ [host]: allMappings[host] });
          if (m.label) lbl.classList.remove("dim");
          else lbl.classList.add("dim");
        });
        content.appendChild(lbl);
        const sel = document.createElement("div");
        sel.className = "mapping-selector";
        sel.textContent = m.selector;
        content.appendChild(sel);
        row.appendChild(content);

        const actions = document.createElement("div");
        actions.className = "mapping-actions";

        const playBtn = document.createElement("button");
        playBtn.className = "btn-icon";
        playBtn.title = "Play";
        setIcon(playBtn, ICONS.play);
        playBtn.style.color = "var(--purple)";
        playBtn.addEventListener("click", async () => {
          try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
              await browser.tabs.sendMessage(tabs[0].id, {
                action: "runSingleBinding",
                binding: m
              });
            }
          } catch (err) { showNotification("Play failed", "error"); }
        });
        actions.appendChild(playBtn);

        const exportBtn = document.createElement("button");
        exportBtn.className = "btn-icon"; exportBtn.title = "Export"; setIcon(exportBtn, ICONS.export);
        exportBtn.addEventListener("click", () => {
          const blob = new Blob([JSON.stringify({ [host]: [m] }, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `shortkeys-mapping-${host}-${(m.label || "mapping").replace(/\s+/g, "-")}.json`;
          a.click(); URL.revokeObjectURL(url);
        });
        actions.appendChild(exportBtn);

        const editBtn = document.createElement("button");
        editBtn.className = "btn-icon";
        editBtn.title = "Edit";
        setIcon(editBtn, ICONS.edit);
        editBtn.addEventListener("click", () => {
          openBindBuilder(host, m.key, m.selector, m.label || "", m.timeout || 8000, host, idx);
        });
        actions.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-icon";
        delBtn.title = "Delete";
        setIcon(delBtn, ICONS.trash);
        delBtn.style.color = "var(--red)";
        delBtn.addEventListener("click", async () => {
          allMappings[host].splice(idx, 1);
          if (!allMappings[host].length) {
            delete allMappings[host];
            await browser.storage.local.remove(host);
          } else {
            await browser.storage.local.set({ [host]: allMappings[host] });
          }
          loadMappings();
        });
        actions.appendChild(delBtn);

        row.appendChild(actions);
        items.appendChild(row);
      });

      card.appendChild(items);
      mappingsListDiv.appendChild(card);
    });
  }

  async function loadMappings() {
    try {
      const result = await browser.storage.local.get(null);
      allMappings = {};
      for (const key of Object.keys(result || {})) {
        if (key.startsWith("__shortkeys_")) continue;
        if (Array.isArray(result[key])) allMappings[key] = result[key];
      }
      renderMappings();
    } catch (err) { console.error(err); }
  }

  // ═══════════════════════════════════════════════════════════════
  //  SEQUENCE BUILDER
  // ═══════════════════════════════════════════════════════════════
  function renderSeqTrigger() {
    seqTriggerDisplay.textContent = "";
    if (isSeqCapturing) {
      const span = document.createElement("span");
      span.className = "capture-pulse";
      span.textContent = "Press key combo…";
      seqTriggerDisplay.appendChild(span);
      seqTriggerDisplay.classList.add("capturing");
      seqCaptureTrigger.style.display = "none";
      seqClearTrigger.textContent = "Cancel";
      seqClearTrigger.style.display = "";
    } else if (currentTrigger) {
      seqTriggerDisplay.appendChild(comboBadge(currentTrigger));
      seqTriggerDisplay.classList.remove("capturing");
      seqCaptureTrigger.textContent = "Re-capture";
      seqCaptureTrigger.style.display = "";
      seqClearTrigger.textContent = "Clear";
      seqClearTrigger.style.display = "";
    } else {
      const span = document.createElement("span");
      span.className = "placeholder-text";
      span.textContent = "Click Capture to set…";
      seqTriggerDisplay.appendChild(span);
      seqTriggerDisplay.classList.remove("capturing");
      seqCaptureTrigger.textContent = "Capture";
      seqCaptureTrigger.style.display = "";
      seqClearTrigger.style.display = "none";
    }
  }

  seqCaptureTrigger.addEventListener("click", () => { isSeqCapturing = true; renderSeqTrigger(); });
  seqClearTrigger.addEventListener("click", () => { isSeqCapturing = false; currentTrigger = ""; renderSeqTrigger(); });

  const ACTION_TYPES = [
    { id: "click",    label: "Click",         needsSelector: true,  needsValue: false, valHint: "" },
    { id: "input",    label: "Type Text",     needsSelector: true,  needsValue: true,  valHint: "Text to type…" },
    { id: "clear",    label: "Clear Field",   needsSelector: true,  needsValue: false, valHint: "" },
    { id: "focus",    label: "Focus",         needsSelector: true,  needsValue: false, valHint: "" },
    { id: "hover",    label: "Hover",         needsSelector: true,  needsValue: false, valHint: "" },
    { id: "scroll",   label: "Scroll To",     needsSelector: true,  needsValue: false, valHint: "" },
    { id: "select",   label: "Select Option", needsSelector: true,  needsValue: true,  valHint: "Option value…" },
    { id: "keypress", label: "Key Press",     needsSelector: true,  needsValue: true,  valHint: "e.g. Enter, Tab, a" },
    { id: "check",    label: "Toggle Check",  needsSelector: true,  needsValue: false, valHint: "" },
    { id: "wait",     label: "Wait (ms)",     needsSelector: false, needsValue: true,  valHint: "e.g. 1000" },
    { id: "navigate", label: "Navigate URL",  needsSelector: false, needsValue: true,  valHint: "https://…" },
  ];

  function syncStepInputs() {
    seqStepsList.querySelectorAll("[data-field]").forEach(el => {
      const i = parseInt(el.dataset.i);
      const field = el.dataset.field;
      if (!builderSteps[i]) return;
      if (field === "name") builderSteps[i].name = el.value;
      else if (field === "selector") builderSteps[i].selector = el.value;
      else if (field === "value") builderSteps[i].value = el.value;
      else if (field === "delay") builderSteps[i].delay = parseInt(el.value) || 0;
      else if (field === "action") builderSteps[i].action = el.value;
    });
  }

  function createAddStepButton(index, isLast = false) {
    const btnContainer = document.createElement("div");
    btnContainer.className = "add-step-divider" + (isLast ? " permanent" : "");
    const btn = document.createElement("button");
    btn.className = "btn-icon add-step-btn";
    btn.innerHTML = "+ Add Step";
    btn.addEventListener("click", () => {
      syncStepInputs();
      builderSteps.splice(index, 0, { name: "", selector: "", value: "", action: "click", delay: 0 });
      renderBuilderSteps();
    });
    
    const line = document.createElement("div");
    line.className = "add-step-line";
    
    btnContainer.appendChild(line);
    btnContainer.appendChild(btn);
    return btnContainer;
  }

  function renderBuilderSteps() {
    seqStepsList.textContent = "";

    seqStepsList.appendChild(createAddStepButton(0, builderSteps.length === 0));

    builderSteps.forEach((st, i) => {
      const actionDef = ACTION_TYPES.find(a => a.id === (st.action || "click")) || ACTION_TYPES[0];
      const card = document.createElement("div");
      card.className = "step-card" + (!st.selector && actionDef.needsSelector ? " empty-step" : "");

      // ── Header ──
      const header = document.createElement("div");
      header.className = "step-header";

      const title = document.createElement("div");
      title.className = "step-title";
      const num = document.createElement("span");
      num.className = "step-number";
      num.textContent = i + 1;
      title.appendChild(num);
      const nameInp = document.createElement("input");
      nameInp.type = "text";
      nameInp.className = "step-name-input";
      nameInp.placeholder = `Step ${i + 1}`;
      nameInp.value = st.name || "";
      nameInp.dataset.i = i;
      nameInp.dataset.field = "name";
      title.appendChild(nameInp);
      header.appendChild(title);

      // ── Actions toolbar ──
      const actions = document.createElement("div");
      actions.className = "step-actions";

      // Position dropdown
      const posSelect = document.createElement("select");
      posSelect.className = "step-pos-select";
      posSelect.title = "Move to position";
      for (let p = 1; p <= builderSteps.length; p++) {
        const opt = document.createElement("option");
        opt.value = p - 1;
        opt.textContent = p;
        if (p - 1 === i) opt.selected = true;
        posSelect.appendChild(opt);
      }
      posSelect.addEventListener("change", () => {
        syncStepInputs();
        const target = parseInt(posSelect.value);
        if (target === i) return;
        const [item] = builderSteps.splice(i, 1);
        builderSteps.splice(target, 0, item);
        renderBuilderSteps();
      });
      actions.appendChild(posSelect);

      if (i > 0) {
        const upBtn = document.createElement("button");
        upBtn.className = "btn-icon"; upBtn.title = "Move up"; setIcon(upBtn, ICONS.up);
        upBtn.addEventListener("click", () => { syncStepInputs(); [builderSteps[i - 1], builderSteps[i]] = [builderSteps[i], builderSteps[i - 1]]; renderBuilderSteps(); });
        actions.appendChild(upBtn);
      }
      if (i < builderSteps.length - 1) {
        const downBtn = document.createElement("button");
        downBtn.className = "btn-icon"; downBtn.title = "Move down"; setIcon(downBtn, ICONS.down);
        downBtn.addEventListener("click", () => { syncStepInputs(); [builderSteps[i], builderSteps[i + 1]] = [builderSteps[i + 1], builderSteps[i]]; renderBuilderSteps(); });
        actions.appendChild(downBtn);
      }
      const dupBtn = document.createElement("button");
      dupBtn.className = "btn-icon"; dupBtn.title = "Duplicate"; setIcon(dupBtn, ICONS.copy);
      dupBtn.addEventListener("click", () => { syncStepInputs(); builderSteps.splice(i + 1, 0, JSON.parse(JSON.stringify(builderSteps[i]))); renderBuilderSteps(); });
      actions.appendChild(dupBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn-icon"; delBtn.title = "Delete"; setIcon(delBtn, ICONS.trash);
      delBtn.style.color = "var(--red)";
      delBtn.addEventListener("click", () => { syncStepInputs(); builderSteps.splice(i, 1); renderBuilderSteps(); });
      actions.appendChild(delBtn);

      header.appendChild(actions);
      card.appendChild(header);

      // ── Body ──
      const body = document.createElement("div");
      body.className = "step-body";

      // Action type row
      const actionRow = document.createElement("div");
      actionRow.className = "step-row";
      const actionLabel = document.createElement("span");
      actionLabel.className = "step-row-label"; actionLabel.textContent = "Action";
      actionRow.appendChild(actionLabel);
      const actionSelect = document.createElement("select");
      actionSelect.className = "field-input";
      actionSelect.style.flex = "1";
      actionSelect.dataset.i = i;
      actionSelect.dataset.field = "action";
      ACTION_TYPES.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.label;
        if (a.id === (st.action || "click")) opt.selected = true;
        actionSelect.appendChild(opt);
      });
      actionSelect.addEventListener("change", () => {
        syncStepInputs();
        renderBuilderSteps();
      });
      actionRow.appendChild(actionSelect);
      body.appendChild(actionRow);

      // Selector row (hide for wait/navigate)
      if (actionDef.needsSelector) {
        const selRow = document.createElement("div");
        selRow.className = "step-row";
        const selLabel = document.createElement("span");
        selLabel.className = "step-row-label"; selLabel.textContent = "Target";
        selRow.appendChild(selLabel);
        const selInput = document.createElement("input");
        selInput.type = "text"; selInput.className = "field-input";
        selInput.style.flex = "1"; selInput.placeholder = "CSS selector";
        selInput.value = st.selector || "";
        selInput.dataset.i = i; selInput.dataset.field = "selector";
        selRow.appendChild(selInput);
        const pickBtn = document.createElement("button");
        pickBtn.className = "btn btn-secondary btn-xs";
        setIconWithText(pickBtn, ICONS.pick, "Pick");
        pickBtn.addEventListener("click", async () => {
          syncStepInputs();
          const state = getSeqBuilderState();
          state.pickerStepIndex = i;
          await browser.storage.local.set({ [BUILDER_STATE_KEY]: state });
          try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
              await browser.tabs.sendMessage(tabs[0].id, { action: "startPicker", stepIndex: i });
              window.close();
            }
          } catch (err) { showNotification("Picker failed", "error"); }
        });
        selRow.appendChild(pickBtn);
        body.appendChild(selRow);
      }

      // Value row (show for actions that need it)
      if (actionDef.needsValue) {
        const valRow = document.createElement("div");
        valRow.className = "step-row";
        const valLabel = document.createElement("span");
        valLabel.className = "step-row-label";
        valLabel.textContent = actionDef.id === "navigate" ? "URL" : actionDef.id === "wait" ? "Time" : "Value";
        valRow.appendChild(valLabel);
        const valInput = document.createElement("input");
        valInput.type = "text"; valInput.className = "field-input";
        valInput.style.flex = "1";
        valInput.placeholder = actionDef.valHint;
        valInput.value = st.value || "";
        valInput.dataset.i = i; valInput.dataset.field = "value";
        valRow.appendChild(valInput);
        body.appendChild(valRow);
      }

      // Delay row (hide for wait action since it's delay itself)
      if (actionDef.id !== "wait") {
        const delayRow = document.createElement("div");
        delayRow.className = "step-row";
        const delayLabel = document.createElement("span");
        delayLabel.className = "step-row-label"; delayLabel.textContent = "Delay";
        delayRow.appendChild(delayLabel);
        const delayInput = document.createElement("input");
        delayInput.type = "number"; delayInput.className = "field-input";
        delayInput.style.width = "calc(70px * var(--scale) * var(--font-scale, 1))"; delayInput.placeholder = "ms";
        delayInput.value = st.delay || "";
        delayInput.dataset.i = i; delayInput.dataset.field = "delay";
        delayRow.appendChild(delayInput);
        const delayHint = document.createElement("span");
        delayHint.style.fontSize = "calc(10px * var(--scale) * var(--font-scale, 1))"; delayHint.style.color = "var(--text-dim)";
        delayHint.textContent = "ms before action";
        delayRow.appendChild(delayHint);
        body.appendChild(delayRow);
      }

      card.appendChild(body);
      seqStepsList.appendChild(card);
      seqStepsList.appendChild(createAddStepButton(i + 1, i === builderSteps.length - 1));
    });
  }

  function getSeqBuilderState() {
    return {
      name: seqNameInput.value,
      hostname: seqHostnameInput.value,
      trigger: currentTrigger,
      timeout: parseInt(seqTimeoutInput.value) || 8000,
      steps: JSON.parse(JSON.stringify(builderSteps)),
      editingSeqHostname,
      editingSeqIndex
    };
  }

  function restoreSeqBuilderState(state) {
    editingSeqHostname = state.editingSeqHostname || null;
    editingSeqIndex = state.editingSeqIndex != null ? state.editingSeqIndex : null;
    seqNameInput.value = state.name || "";
    seqHostnameInput.value = state.hostname || "";
    currentTrigger = state.trigger || "";
    seqTimeoutInput.value = state.timeout || 8000;
    builderSteps = state.steps || [];
    seqBuilderTitle.textContent = editingSeqHostname != null ? "Edit Sequence" : "New Sequence";
    renderSeqTrigger();
    renderBuilderSteps();
    showBuilder(seqBuilder, seqList, "#tab-sequences .section-bar");
  }

  function openSeqBuilder(host = null, idx = null) {
    editingSeqHostname = host;
    editingSeqIndex = idx;
    if (host && idx != null && allSequences[host]?.[idx]) {
      const s = allSequences[host][idx];
      seqNameInput.value = s.name || "";
      seqHostnameInput.value = host;
      currentTrigger = s.trigger || "";
      seqTimeoutInput.value = s.timeout || 8000;
      builderSteps = JSON.parse(JSON.stringify(s.steps || []));
      seqBuilderTitle.textContent = "Edit Sequence";
    } else {
      seqNameInput.value = "";
      seqHostnameInput.value = "";
      currentTrigger = "";
      seqTimeoutInput.value = 8000;
      builderSteps = [{ name: "", selector: "", value: "", action: "click", delay: 0 }];
      seqBuilderTitle.textContent = "New Sequence";
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0]?.url) try {
          let u = new URL(tabs[0].url);
          seqHostnameInput.value = u.hostname || 'local';
        } catch (e) {}
      });
    }
    renderSeqTrigger();
    renderBuilderSteps();
    showBuilder(seqBuilder, seqList, "#tab-sequences .section-bar");
  }

  seqNewBtn.addEventListener("click", () => openSeqBuilder());
  seqBuilderClose.addEventListener("click", () => hideBuilder(seqBuilder, seqList, "#tab-sequences .section-bar"));

  seqSaveBtn.addEventListener("click", async () => {
    syncStepInputs();
    // Remove empty steps (keep wait/navigate which don't need selectors)
    const NO_SELECTOR_ACTIONS = ["wait", "navigate"];
    builderSteps = builderSteps.filter(s =>
      NO_SELECTOR_ACTIONS.includes(s.action) || (s.selector && s.selector.trim())
    );
    if (!builderSteps.length) return showNotification("Add at least one valid step", "error");
    const h = seqHostnameInput.value.trim();
    if (!h) return showNotification("Hostname required", "error");
    if (!currentTrigger) return showNotification("Trigger shortcut required", "error");

    // Auto-name empty steps
    builderSteps.forEach((s, i) => { if (!s.name) s.name = `Step ${i + 1}`; });

    if (!allSequences[h]) allSequences[h] = [];
    const obj = { 
        name: seqNameInput.value || "Unnamed", 
        trigger: currentTrigger, 
        timeout: parseInt(seqTimeoutInput.value) || 8000,
        steps: builderSteps 
    };

    if (editingSeqHostname === h && editingSeqIndex != null) {
      allSequences[h][editingSeqIndex] = obj;
    } else if (editingSeqHostname && editingSeqHostname !== h && editingSeqIndex != null) {
      allSequences[editingSeqHostname].splice(editingSeqIndex, 1);
      if (!allSequences[editingSeqHostname].length) delete allSequences[editingSeqHostname];
      allSequences[h].push(obj);
    } else {
      allSequences[h].push(obj);
    }

    await browser.storage.local.set({ [SEQ_STORAGE_KEY]: allSequences });
    showNotification("Sequence saved!");
    hideBuilder(seqBuilder, seqList, "#tab-sequences .section-bar");
    renderSeqList();
  });

  seqTestBtn.addEventListener("click", async () => {
    syncStepInputs();
    const testSteps = builderSteps.filter(s => s.selector && s.selector.trim());
    if (!testSteps.length) return showNotification("No steps to test", "error");

    // Save state so we return to builder
    const state = getSeqBuilderState();
    await browser.storage.local.set({ [BUILDER_STATE_KEY]: state });

    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await browser.tabs.sendMessage(tabs[0].id, {
          action: "runTestSequence",
          steps: testSteps
        });
        // Don't close — let user see it
      }
    } catch (err) { showNotification("Test failed: " + err.message, "error"); }
  });

  // ═══════════════════════════════════════════════════════════════
  //  SEQUENCE LIST
  // ═══════════════════════════════════════════════════════════════
  async function loadSequences() {
    try {
      const data = await browser.storage.local.get(SEQ_STORAGE_KEY);
      allSequences = data[SEQ_STORAGE_KEY] || {};
      renderSeqList();
    } catch (err) {}
  }

  function renderSeqList() {
    seqList.textContent = "";
    const hosts = Object.keys(allSequences);
    if (!hosts.length) {
      const emptyStateText = document.createElement("div");
      emptyStateText.className = "empty-state";
      const emptyTitle = document.createElement("p");
      emptyTitle.className = "empty-title";
      emptyTitle.textContent = "No sequences yet";
      const emptyHint = document.createElement("p");
      emptyHint.className = "empty-hint";
      emptyHint.textContent = "Click + New to create one.";
      emptyStateText.appendChild(emptyTitle);
      emptyStateText.appendChild(emptyHint);
      seqList.appendChild(emptyStateText);
      return;
    }

    hosts.forEach(host => {
      (allSequences[host] || []).forEach((seq, idx) => {
        const card = document.createElement("div");
        card.className = "seq-card";

        const info = document.createElement("div");
        info.className = "seq-card-info";
        const name = document.createElement("input");
        name.type = "text";
        name.className = "seq-card-name";
        name.value = seq.name || "";
        name.placeholder = "Unnamed";
        name.style.border = "none";
        name.style.background = "transparent";
        name.style.fontFamily = "inherit";
        name.style.fontSize = "inherit";
        name.style.fontWeight = "inherit";
        name.style.color = "inherit";
        name.style.width = "100%";
        name.style.outline = "none";
        name.addEventListener("change", async (e) => {
          seq.name = e.target.value.trim();
          await browser.storage.local.set({ [SEQ_STORAGE_KEY]: allSequences });
        });
        info.appendChild(name);
        const meta = document.createElement("div");
        meta.className = "seq-card-meta";
        meta.textContent = `${host} • ${seq.steps?.length || 0} steps`;
        info.appendChild(meta);
        if (seq.trigger) {
          const trig = document.createElement("div");
          trig.style.marginTop = "calc(4px * var(--scale))";
          trig.appendChild(comboBadge(seq.trigger));
          info.appendChild(trig);
        }
        card.appendChild(info);

        const actions = document.createElement("div");
        actions.className = "seq-card-actions";

        const playBtn = document.createElement("button");
        playBtn.className = "btn-icon";
        playBtn.title = "Play";
        setIcon(playBtn, ICONS.play);
        playBtn.style.color = "var(--purple)";
        playBtn.addEventListener("click", async () => {
          try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
              await browser.tabs.sendMessage(tabs[0].id, {
                action: "runTestSequence",
                steps: seq.steps,
                name: seq.name
              });
            }
          } catch (err) { showNotification("Play failed", "error"); }
        });
        actions.appendChild(playBtn);

        const exportBtn = document.createElement("button");
        exportBtn.className = "btn-icon"; exportBtn.title = "Export"; setIcon(exportBtn, ICONS.export);
        exportBtn.addEventListener("click", () => {
          const blob = new Blob([JSON.stringify({ [host]: [seq] }, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `shortkeys-seq-${host}-${(seq.name || "seq").replace(/\s+/g, "-")}.json`;
          a.click(); URL.revokeObjectURL(url);
        });
        actions.appendChild(exportBtn);

        const editBtn = document.createElement("button");
        editBtn.className = "btn-icon"; editBtn.title = "Edit"; setIcon(editBtn, ICONS.edit);
        editBtn.addEventListener("click", () => openSeqBuilder(host, idx));
        actions.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-icon"; delBtn.title = "Delete"; setIcon(delBtn, ICONS.trash);
        delBtn.style.color = "var(--red)";
        delBtn.addEventListener("click", async () => {
          allSequences[host].splice(idx, 1);
          if (!allSequences[host].length) delete allSequences[host];
          await browser.storage.local.set({ [SEQ_STORAGE_KEY]: allSequences });
          renderSeqList();
        });
        actions.appendChild(delBtn);

        card.appendChild(actions);
        seqList.appendChild(card);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  PICKER RESULT HANDLER (resumes after picker round-trip)
  // ═══════════════════════════════════════════════════════════════
  async function checkForPickerResult() {
    try {
      const data = await browser.storage.local.get([PICKER_STORAGE_KEY, BUILDER_STATE_KEY, BIND_BUILDER_STATE_KEY]);
      const result = data[PICKER_STORAGE_KEY];
      const seqState = data[BUILDER_STATE_KEY];
      const bindState = data[BIND_BUILDER_STATE_KEY];

      if (seqState) {
        switchToTab("sequences");
        // Deep-copy steps from saved state to prevent reference issues
        if (seqState.steps) {
          seqState.steps = JSON.parse(JSON.stringify(seqState.steps));
        }
        restoreSeqBuilderState(seqState);
        if (result && result.selector && !result.cancelled) {
          const idx = seqState.pickerStepIndex;
          if (idx >= 0 && idx < builderSteps.length) {
            builderSteps[idx].selector = result.selector;
            
            // Only auto-change action if it was left as the default "click"
            if (!builderSteps[idx].action || builderSteps[idx].action === "click") {
              builderSteps[idx].action = result.elType || "click";
            }
            
            // Only auto-name if they haven't explicitly named it something else
            const currentName = builderSteps[idx].name || "";
            if (result.elName && (!currentName || currentName.match(/^Step \d+$/))) {
              builderSteps[idx].name = result.elName.substring(0, 30);
            }
            
            showNotification(`Selector picked for step ${idx + 1}`);
          }
          // Auto-add a new empty step only if the last step already has a selector
          const lastStep = builderSteps[builderSteps.length - 1];
          if (lastStep && lastStep.selector && lastStep.selector.trim()) {
            builderSteps.push({ name: "", selector: "", value: "", action: "click", delay: 0 });
          }
          renderBuilderSteps();
        } else {
          // No picker result (user cancelled or escaped) — still render the restored state
          renderBuilderSteps();
        }
        await browser.storage.local.remove([PICKER_STORAGE_KEY, BUILDER_STATE_KEY]);
        return true;
      }

      if (bindState) {
        switchToTab("mappings");
        restoreBindState(bindState);
        if (result && result.selector && !result.cancelled) {
          bindSelectorInput.value = result.selector;
          if (result.elName && !bindLabelInput.value) bindLabelInput.value = result.elName;
          showNotification("Selector picked!");
        }
        await browser.storage.local.remove([PICKER_STORAGE_KEY, BIND_BUILDER_STATE_KEY]);
        return true;
      }
    } catch (err) { console.error(err); }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════
  //  CONTEXT MENU (right-click to add shortcut) — feature #11
  // ═══════════════════════════════════════════════════════════════
  async function checkContextPending() {
    try {
      const data = await browser.storage.local.get(CONTEXT_PENDING_KEY);
      const pending = data[CONTEXT_PENDING_KEY];
      if (pending && pending.selector) {
        switchToTab("mappings");
        openBindBuilder(
          pending.hostname || "",
          "",
          pending.selector,
          pending.elName || ""
        );
        await browser.storage.local.remove(CONTEXT_PENDING_KEY);
      }
    } catch (e) {}
  }

  // ═══════════════════════════════════════════════════════════════
  //  IMPORT / EXPORT
  // ═══════════════════════════════════════════════════════════════
  const importFileUI = document.getElementById("import-file-ui");
  if (importFileUI) {
    importFileUI.addEventListener("click", () => {
      if (window.innerWidth < 800) {
        browser.tabs.create({ url: browser.runtime.getURL("popup.html?tab=import-export") });
        window.close();
      } else {
        importFileElement.click();
      }
    });
  }

  if (importFileElement) {
    importFileElement.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          
          if (data[SEQ_STORAGE_KEY]) {
            for (const host in data[SEQ_STORAGE_KEY]) {
              if (!allSequences[host]) allSequences[host] = [];
              allSequences[host] = allSequences[host].concat(data[SEQ_STORAGE_KEY][host]);
            }
            await browser.storage.local.set({ [SEQ_STORAGE_KEY]: allSequences });
            delete data[SEQ_STORAGE_KEY];
          }
          
          for (const key in data) {
            if (key.startsWith("__shortkeys_")) {
              await browser.storage.local.set({ [key]: data[key] });
              continue;
            }
            const existing = await browser.storage.local.get(key);
            let merged = existing[key] || [];
            if (Array.isArray(data[key])) {
              merged = merged.concat(data[key]);
            }
            await browser.storage.local.set({ [key]: merged });
          }
          
          importStatus.textContent = "Import successful!";
          importStatus.style.color = "var(--green)";
          loadMappings();
          loadSequences();
        } catch (err) {
          importStatus.textContent = "Invalid JSON file.";
          importStatus.style.color = "var(--red)";
        }
        importFileElement.value = "";
      };
      reader.readAsText(file);
    });
  }

  if (exportButton) {
    exportButton.addEventListener("click", async () => {
      const result = await browser.storage.local.get(null);
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shortkeys-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification("Backup exported!");
    });
  }

  // Seq import
  const seqImportFile = document.getElementById("seq-import-file");
  if (seqImportBtnUI) {
    seqImportBtnUI.addEventListener("click", () => {
      if (window.innerWidth < 800) {
        browser.tabs.create({ url: browser.runtime.getURL("popup.html?tab=sequences") });
        window.close();
      } else {
        seqImportFile.click();
      }
    });
  }
  if (seqImportFile) {
    seqImportFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          for (const host in data) {
            if (!allSequences[host]) allSequences[host] = [];
            allSequences[host] = allSequences[host].concat(data[host]);
          }
          await browser.storage.local.set({ [SEQ_STORAGE_KEY]: allSequences });
          showNotification("Sequences imported!");
          renderSeqList();
        } catch (err) { showNotification("Invalid file", "error"); }
        seqImportFile.value = "";
      };
      reader.readAsText(file);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  SETTINGS & BOOT
  // ═══════════════════════════════════════════════════════════════
  async function loadSettings() {
    const data = await browser.storage.local.get("__shortkeys_settings");
    const settings = data.__shortkeys_settings || {};
    if (settings.hudPosition && settingsHudPos) {
      settingsHudPos.value = settings.hudPosition;
    }
    if (settings.hudScale && settingsScale) {
      settingsScale.value = settings.hudScale;
      settingsScaleVal.textContent = parseFloat(settings.hudScale).toFixed(1) + "x";
    }
    if (settings.fontScale && settingsFontScale) {
      settingsFontScale.value = settings.fontScale;
      settingsFontScaleVal.textContent = parseFloat(settings.fontScale).toFixed(1) + "x";
    }
    if (settings.iconScale && settingsIconScale) {
      settingsIconScale.value = settings.iconScale;
      settingsIconScaleVal.textContent = parseFloat(settings.iconScale).toFixed(1) + "x";
    }
    applyScale(settings.hudScale || 1.0, settings.fontScale || 1.0, settings.iconScale || 1.0);
  }

  function applyScale(scale, fontScale = 1.0, iconScale = 1.0) {
    document.documentElement.style.setProperty('--scale', scale);
    document.documentElement.style.setProperty('--font-scale', fontScale);
    document.documentElement.style.setProperty('--icon-scale', iconScale);
  }

  async function saveSettings() {
    const s = {
      hudPosition: settingsHudPos.value,
      hudScale: parseFloat(settingsScale.value),
      fontScale: parseFloat(settingsFontScale.value),
      iconScale: parseFloat(settingsIconScale.value)
    };
    await browser.storage.local.set({ "__shortkeys_settings": s });
  }

  if (settingsHudPos) settingsHudPos.addEventListener("change", saveSettings);
  function updateScales() {
    applyScale(
      parseFloat(settingsScale.value),
      parseFloat(settingsFontScale.value),
      parseFloat(settingsIconScale.value)
    );
  }

  if (settingsScale) {
    settingsScale.addEventListener("input", (e) => {
      settingsScaleVal.textContent = parseFloat(e.target.value).toFixed(1) + "x";
      updateScales();
    });
    settingsScale.addEventListener("change", saveSettings);
    
    const scaleReset = document.getElementById("settings-scale-reset");
    if (scaleReset) scaleReset.addEventListener("click", () => {
      settingsScale.value = 1.0; settingsScaleVal.textContent = "1.0x";
      updateScales(); saveSettings();
    });
  }

  if (settingsFontScale) {
    settingsFontScale.addEventListener("input", (e) => {
      settingsFontScaleVal.textContent = parseFloat(e.target.value).toFixed(1) + "x";
      updateScales();
    });
    settingsFontScale.addEventListener("change", saveSettings);
    
    const fontReset = document.getElementById("settings-font-scale-reset");
    if (fontReset) fontReset.addEventListener("click", () => {
      settingsFontScale.value = 1.0; settingsFontScaleVal.textContent = "1.0x";
      updateScales(); saveSettings();
    });
  }

  if (settingsIconScale) {
    settingsIconScale.addEventListener("input", (e) => {
      settingsIconScaleVal.textContent = parseFloat(e.target.value).toFixed(1) + "x";
      updateScales();
    });
    settingsIconScale.addEventListener("change", saveSettings);
    
    const iconReset = document.getElementById("settings-icon-scale-reset");
    if (iconReset) iconReset.addEventListener("click", () => {
      settingsIconScale.value = 1.0; settingsIconScaleVal.textContent = "1.0x";
      updateScales(); saveSettings();
    });
  }

  async function boot() {
    await loadSettings();
    await loadMappings();
    await loadSequences();
    const pickerHandled = await checkForPickerResult();
    if (!pickerHandled) await checkContextPending();
  }
  boot();
});
