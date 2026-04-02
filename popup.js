document.addEventListener("DOMContentLoaded", () => {
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
  const seqAddStep = document.getElementById("seq-add-step");
  const seqStepsList = document.getElementById("seq-steps-list");
  const seqSaveBtn = document.getElementById("seq-save-btn");
  const seqTestBtn = document.getElementById("seq-test-btn");
  const seqList = document.getElementById("seq-list");
  const seqImportBtnUI = document.getElementById("seq-import-btn-ui");
  const seqTimeoutInput = document.getElementById("seq-timeout-input");
  
  const settingsHudPos = document.getElementById("settings-hud-pos");
  const settingsScale = document.getElementById("settings-scale");
  const settingsScaleVal = document.getElementById("settings-scale-val");

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
      if (tabs[0]?.url) host = new URL(tabs[0].url).hostname;
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
      emptyStateText.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12"/></svg><p class="empty-title">No bindings yet</p><p class="empty-hint">Click <strong>+ New</strong> above or right-click<br/>any element on a page.</p>`;
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
        const lbl = document.createElement("div");
        lbl.className = "mapping-label" + (m.label ? "" : " dim");
        lbl.textContent = m.label || "No label";
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
        playBtn.textContent = "▶";
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

        const editBtn = document.createElement("button");
        editBtn.className = "btn-icon";
        editBtn.title = "Edit";
        editBtn.textContent = "✎";
        editBtn.addEventListener("click", () => {
          openBindBuilder(host, m.key, m.selector, m.label || "", m.timeout || 8000, host, idx);
        });
        actions.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-icon";
        delBtn.title = "Delete";
        delBtn.textContent = "✕";
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

  function renderBuilderSteps() {
    seqStepsList.textContent = "";
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
        upBtn.className = "btn-icon"; upBtn.title = "Move up"; upBtn.textContent = "↑";
        upBtn.addEventListener("click", () => { syncStepInputs(); [builderSteps[i - 1], builderSteps[i]] = [builderSteps[i], builderSteps[i - 1]]; renderBuilderSteps(); });
        actions.appendChild(upBtn);
      }
      if (i < builderSteps.length - 1) {
        const downBtn = document.createElement("button");
        downBtn.className = "btn-icon"; downBtn.title = "Move down"; downBtn.textContent = "↓";
        downBtn.addEventListener("click", () => { syncStepInputs(); [builderSteps[i], builderSteps[i + 1]] = [builderSteps[i + 1], builderSteps[i]]; renderBuilderSteps(); });
        actions.appendChild(downBtn);
      }
      const dupBtn = document.createElement("button");
      dupBtn.className = "btn-icon"; dupBtn.title = "Duplicate"; dupBtn.textContent = "⧉";
      dupBtn.addEventListener("click", () => { syncStepInputs(); builderSteps.splice(i + 1, 0, JSON.parse(JSON.stringify(builderSteps[i]))); renderBuilderSteps(); });
      actions.appendChild(dupBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn-icon"; delBtn.title = "Delete"; delBtn.textContent = "✕";
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
        pickBtn.textContent = "⊕ Pick";
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
        delayInput.style.width = "70px"; delayInput.placeholder = "ms";
        delayInput.value = st.delay || "";
        delayInput.dataset.i = i; delayInput.dataset.field = "delay";
        delayRow.appendChild(delayInput);
        const delayHint = document.createElement("span");
        delayHint.style.fontSize = "10px"; delayHint.style.color = "var(--text-dim)";
        delayHint.textContent = "ms before action";
        delayRow.appendChild(delayHint);
        body.appendChild(delayRow);
      }

      card.appendChild(body);
      seqStepsList.appendChild(card);
    });
  }

  function getSeqBuilderState() {
    return {
      name: seqNameInput.value,
      hostname: seqHostnameInput.value,
      trigger: currentTrigger,
      timeout: parseInt(seqTimeoutInput.value) || 8000,
      steps: builderSteps,
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
        if (tabs[0]?.url) try { seqHostnameInput.value = new URL(tabs[0].url).hostname; } catch (e) {}
      });
    }
    renderSeqTrigger();
    renderBuilderSteps();
    showBuilder(seqBuilder, seqList, "#tab-sequences .section-bar");
  }

  seqNewBtn.addEventListener("click", () => openSeqBuilder());
  seqBuilderClose.addEventListener("click", () => hideBuilder(seqBuilder, seqList, "#tab-sequences .section-bar"));
  seqAddStep.addEventListener("click", () => {
    syncStepInputs();
    builderSteps.push({ name: "", selector: "", value: "", action: "click", delay: 0 });
    renderBuilderSteps();
  });

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
      emptyStateText.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h10M4 18h6"/></svg><p class="empty-title">No sequences yet</p><p class="empty-hint">Click <strong>+ New</strong> to create one.</p>`;
      seqList.appendChild(emptyStateText);
      return;
    }

    hosts.forEach(host => {
      (allSequences[host] || []).forEach((seq, idx) => {
        const card = document.createElement("div");
        card.className = "seq-card";

        const info = document.createElement("div");
        info.className = "seq-card-info";
        const name = document.createElement("div");
        name.className = "seq-card-name";
        name.textContent = seq.name || "Unnamed";
        info.appendChild(name);
        const meta = document.createElement("div");
        meta.className = "seq-card-meta";
        meta.textContent = `${host} • ${seq.steps?.length || 0} steps`;
        info.appendChild(meta);
        if (seq.trigger) {
          const trig = document.createElement("div");
          trig.style.marginTop = "4px";
          trig.appendChild(comboBadge(seq.trigger));
          info.appendChild(trig);
        }
        card.appendChild(info);

        const actions = document.createElement("div");
        actions.className = "seq-card-actions";

        const playBtn = document.createElement("button");
        playBtn.className = "btn-icon";
        playBtn.title = "Play";
        playBtn.textContent = "▶";
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
        exportBtn.className = "btn-icon"; exportBtn.title = "Export"; exportBtn.textContent = "↓";
        exportBtn.addEventListener("click", () => {
          const blob = new Blob([JSON.stringify({ [host]: [seq] }, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `shortkeys-seq-${host}-${(seq.name || "seq").replace(/\s+/g, "-")}.json`;
          a.click(); URL.revokeObjectURL(url);
        });
        actions.appendChild(exportBtn);

        const editBtn = document.createElement("button");
        editBtn.className = "btn-icon"; editBtn.title = "Edit"; editBtn.textContent = "✎";
        editBtn.addEventListener("click", () => openSeqBuilder(host, idx));
        actions.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-icon"; delBtn.title = "Delete"; delBtn.textContent = "✕";
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
            
            renderBuilderSteps();
            showNotification(`Selector picked for step ${idx + 1}`);
          }
          // Auto-add new empty step after picking
          builderSteps.push({ name: "", selector: "", value: "", action: "click", delay: 0 });
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
          await browser.storage.local.set(data);
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
    applyScale(settings.hudScale || 1.0);
  }

  function applyScale(scale) {
    // We scale the html tag directly using CSS custom property or font-size.
    document.documentElement.style.fontSize = Math.round(13 * scale) + "px";
  }

  async function saveSettings() {
    const s = {
      hudPosition: settingsHudPos.value,
      hudScale: parseFloat(settingsScale.value)
    };
    await browser.storage.local.set({ "__shortkeys_settings": s });
  }

  if (settingsHudPos) settingsHudPos.addEventListener("change", saveSettings);
  if (settingsScale) {
    settingsScale.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      settingsScaleVal.textContent = v.toFixed(1) + "x";
      applyScale(v);
    });
    settingsScale.addEventListener("change", saveSettings);
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
