/* ===================================================================
   Shortkeys — Content Script
   Handles: element picker, shortcut triggers, sequence runner,
   cross-page resume, and right-click context menu integration.
   =================================================================== */

// ─── DOM Utilities (Shadow DOM support) ──────────────────────────

function querySelectorDeep(selector, root = document) {
  if (selector.startsWith("shadow:")) {
    const parts = selector.substring(7).split("|||");
    let currentRoot = root;
    let found = null;
    for (let i = 0; i < parts.length; i++) {
        found = currentRoot.querySelector(parts[i]);
        if (!found) return null;
        if (i < parts.length - 1) {
            if (!found.shadowRoot) return null;
            currentRoot = found.shadowRoot;
        }
    }
    return found;
  }

  try {
    const direct = root.querySelector(selector);
    if (direct) return direct;
  } catch(e) {}
  
  const all = root.querySelectorAll('*');
  for (let i = 0; i < all.length; i++) {
    if (all[i].shadowRoot) {
      const match = querySelectorDeep(selector, all[i].shadowRoot);
      if (match) return match;
    }
  }
  return null;
}

let isPicking = false;
let hoverOverlay = null;
let hoverLabel = null;

// ─── Element Picker ──────────────────────────────────────────────

function createOverlay() {
  if (hoverOverlay) return hoverOverlay;
  hoverOverlay = document.createElement("div");
  Object.assign(hoverOverlay.style, {
    position: "fixed", pointerEvents: "none", zIndex: "2147483647",
    border: "2px solid #9333ea", backgroundColor: "rgba(147, 51, 234, 0.15)",
    borderRadius: "3px", transition: "all 0.08s ease", display: "none"
  });
  hoverLabel = document.createElement("div");
  Object.assign(hoverLabel.style, {
    position: "fixed", pointerEvents: "none", zIndex: "2147483647",
    background: "#1e1b4b", color: "#e0e7ff", fontSize: "11px",
    fontFamily: "monospace", padding: "3px 8px", borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)", display: "none",
    maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  });
  document.documentElement.appendChild(hoverOverlay);
  document.documentElement.appendChild(hoverLabel);
  return hoverOverlay;
}

function getElementDescription(el) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string"
    ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
    : "";
  let text = "";
  if (el.getAttribute("aria-label")) text = el.getAttribute("aria-label");
  else if (el.getAttribute("placeholder")) text = el.getAttribute("placeholder");
  else if (el.getAttribute("title")) text = el.getAttribute("title");
  else if (el.getAttribute("name")) text = el.getAttribute("name");
  else if (el.textContent && el.textContent.trim().length < 40) text = el.textContent.trim();

  let label = `<${tag}${id}${cls}>`;
  if (text) label += ` "${text}"`;
  return label;
}

function getElementType(el) {
  const tag = el.tagName.toLowerCase();
  if (tag === "input") {
    const t = (el.type || "text").toLowerCase();
    if (["text","email","password","search","url","tel","number","date","datetime-local","month","week","time","color"].includes(t))
      return "input";
    if (t === "checkbox" || t === "radio") return "click";
    return "click";
  }
  if (tag === "textarea" || tag === "select" || el.isContentEditable) return "input";
  return "click";
}

function getCssSelector(el) {
  if (!(el instanceof Element)) return "";

  function testSelector(sel) {
      try { return querySelectorDeep(sel) === el; } catch(e) { return false; }
  }

  function buildPath(useClasses, ignoreIds) {
    let parts = [];
    let currentElement = el;
    while (currentElement) {
      let path = [];
      let current = currentElement;
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        let sel = current.nodeName.toLowerCase();
        let hasGoodId = !ignoreIds && current.id && !/^[0-9\-_]/.test(current.id) && !/\d/.test(current.id);

        if (hasGoodId) {
          sel += "#" + CSS.escape(current.id);
        }

        if (useClasses && !hasGoodId && current.className && typeof current.className === "string") {
          let classes = current.className.trim().split(/\s+/).filter(c => !/\d/.test(c)).slice(0, 3);
          classes.forEach(function(c) { sel += "." + CSS.escape(c); });
        }

        if (!hasGoodId) {
          let sib = current, nth = 1;
          while ((sib = sib.previousElementSibling)) {
            if (sib.nodeName.toLowerCase() === current.nodeName.toLowerCase()) nth++;
          }
          sel += ":nth-of-type(" + nth + ")";
        }

        path.unshift(sel);

        if (hasGoodId) break;
        current = current.parentNode;
      }
      parts.unshift(path.join(" > "));

      let rootNode = currentElement.getRootNode();
      if (rootNode && rootNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE && rootNode.host) {
        currentElement = rootNode.host;
      } else {
        currentElement = null;
      }
    }
    return "shadow:" + parts.join("|||");
  }

  let cand1 = buildPath(false, false);
  if (testSelector(cand1)) return cand1;

  let cand2 = buildPath(true, false);
  if (testSelector(cand2)) return cand2;

  let cand3 = buildPath(false, true); // Ultimate structural fallback (no classes, no IDs at all)
  if (testSelector(cand3)) return cand3;

  // Strategy 3: Stamp the element with a unique data attribute (transient)
  if (el.getAttribute("data-sk-id")) {
    return "[data-sk-id=\"" + CSS.escape(el.getAttribute("data-sk-id")) + "\"]";
  }
  let uid = "sk-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);
  el.setAttribute("data-sk-id", uid);
  return "[data-sk-id=\"" + CSS.escape(uid) + "\"]";
}

function getInteractiveTarget(initialTarget, e) {
  if (e.composedPath) {
    const path = e.composedPath();
    for (let i = 0; i < path.length; i++) {
      let el = path[i];
      if (el && el.nodeType === Node.ELEMENT_NODE) {
        let tag = el.nodeName.toLowerCase();
        if (tag === "body" || tag === "main" || tag === "article" || tag === "section") break;
        if (tag === "button" || tag === "a" || tag === "input" || tag === "select" || tag === "textarea" || tag.includes("button") || el.getAttribute("role") === "button" || el.getAttribute("role") === "link") {
          return el;
        }
      }
    }
  }
  return initialTarget;
}

const mouseMoveHandler = (e) => {
  if (!isPicking) return;
  let target = (e.composedPath && e.composedPath().length > 0) ? e.composedPath()[0] : document.elementFromPoint(e.clientX, e.clientY);
  target = getInteractiveTarget(target, e);
  if (!target || target === hoverOverlay || target === hoverLabel) return;

  const rect = target.getBoundingClientRect();
  const overlay = createOverlay();
  overlay.style.display = "block";
  overlay.style.top = rect.top + "px";
  overlay.style.left = rect.left + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";

  // Show element name tooltip
  hoverLabel.textContent = getElementDescription(target);
  hoverLabel.style.display = "block";
  const lblTop = rect.top - 26;
  hoverLabel.style.top = (lblTop < 4 ? rect.bottom + 4 : lblTop) + "px";
  hoverLabel.style.left = Math.max(4, Math.min(rect.left, window.innerWidth - 290)) + "px";
};

const clickHandler = async (e) => {
  if (!isPicking) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  let target = (e.composedPath && e.composedPath().length > 0) ? e.composedPath()[0] : document.elementFromPoint(e.clientX, e.clientY);
  target = getInteractiveTarget(target, e);
  if (!target || target === hoverOverlay || target === hoverLabel) return;

  const selector = getCssSelector(target);
  const elType = getElementType(target);
  const elName = getElementDescription(target);

  stopPicker();
  await browser.storage.local.set({
    __shortkeys_picker_result__: { selector, elType, elName }
  });
};

const keydownPickerHandler = (e) => {
  if (!isPicking) return;
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    stopPicker();
  }
};

function stopPicker() {
  isPicking = false;
  if (hoverOverlay) hoverOverlay.style.display = "none";
  if (hoverLabel) hoverLabel.style.display = "none";
  document.removeEventListener("mousemove", mouseMoveHandler, true);
  document.removeEventListener("click", clickHandler, true);
  document.removeEventListener("keydown", keydownPickerHandler, true);
}

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "startPicker") {
    isPicking = true;
    createOverlay();
    document.addEventListener("mousemove", mouseMoveHandler, true);
    document.addEventListener("click", clickHandler, true);
    document.addEventListener("keydown", keydownPickerHandler, true);
    return Promise.resolve({ success: true });
  }
  if (message.action === "runTestSequence") {
    runSequence({ name: message.name || "Test", trigger: "", steps: message.steps }, 0);
    return Promise.resolve({ success: true });
  }
  if (message.action === "runSingleBinding") {
    const el = querySelectorDeep(message.binding.selector);
    if (el) {
      showExecutionHUD(`Binding: ${message.binding.label || message.binding.key}`, message.binding.selector);
      simulateSolidClick(el);
    } else {
      showExecutionHUD(`Binding Failed`, `Element not found: ${message.binding.selector}`);
    }
    return Promise.resolve({ success: true });
  }
  if (message.action === "showCaptureOverlay") {
    showCaptureOverlay(message.selector, message.elName, message.hostname);
    return Promise.resolve({ success: true });
  }
});

// ─── Context Menu integration ────────────────────────────────────

document.addEventListener("contextmenu", (e) => {
  let target = (e.composedPath && e.composedPath().length > 0) ? e.composedPath()[0] : e.target;
  target = getInteractiveTarget(target, e);
  const selector = getCssSelector(target);
  const elType = getElementType(target);
  const elName = getElementDescription(target);
  browser.storage.local.set({
    __shortkeys_last_context_selector: selector,
    __shortkeys_last_context_type: elType,
    __shortkeys_last_context_name: elName
  });
});

// ─── On-Page Capture Overlay (for right-click shortcut) ──────────

let captureOverlayEl = null;

function showCaptureOverlay(selector, elName, hostname) {
  removeCaptureOverlay();

  // Highlight the target element
  const targetEl = querySelectorDeep(selector);
  if (targetEl) {
    targetEl.style.outline = "2px solid #7c3aed";
    targetEl.style.outlineOffset = "2px";
  }

  captureOverlayEl = document.createElement("div");
  Object.assign(captureOverlayEl.style, {
    position: "fixed", top: "0", left: "0", right: "0", bottom: "0",
    zIndex: "2147483647", display: "flex", alignItems: "center",
    justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)",
    fontFamily: "'Inter', -apple-system, sans-serif"
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    background: "#1a1a1f", border: "1px solid #2e2e36", borderRadius: "14px",
    padding: "30px 34px", maxWidth: "440px", width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)", color: "#eaeaed",
    textAlign: "center"
  });

  // ── Title ──
  const titleDiv = document.createElement("div");
  Object.assign(titleDiv.style, { fontSize: "24px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" });
  titleDiv.textContent = "\u2328 Shortkeys";
  card.appendChild(titleDiv);

  const subtitleDiv = document.createElement("div");
  Object.assign(subtitleDiv.style, { fontSize: "14px", color: "#5a5a65", marginBottom: "20px" });
  subtitleDiv.textContent = "Assign a shortcut to this element";
  card.appendChild(subtitleDiv);

  // ── Element info ──
  const elInfoBox = document.createElement("div");
  Object.assign(elInfoBox.style, { background: "#222228", border: "1px solid #2e2e36", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", textAlign: "left" });
  const elLabel = document.createElement("div");
  Object.assign(elLabel.style, { fontSize: "12px", color: "#5a5a65", textTransform: "uppercase", fontWeight: "600", letterSpacing: ".5px", marginBottom: "6px" });
  elLabel.textContent = "Element";
  elInfoBox.appendChild(elLabel);
  const elNameDiv = document.createElement("div");
  elNameDiv.id = "sk-cap-elname";
  Object.assign(elNameDiv.style, { fontSize: "14px", color: "#8b8b96", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
  elNameDiv.textContent = elName || selector;
  elInfoBox.appendChild(elNameDiv);
  card.appendChild(elInfoBox);

  // ── Prompt area ──
  const promptBox = document.createElement("div");
  promptBox.id = "sk-cap-prompt";
  Object.assign(promptBox.style, { background: "#16161b", border: "2px solid #7c3aed", borderRadius: "8px", padding: "22px", marginBottom: "20px", boxShadow: "0 0 0 3px rgba(124,58,237,0.25)" });
  const promptText = document.createElement("div");
  promptText.id = "sk-cap-text";
  Object.assign(promptText.style, { fontSize: "16px", color: "#8b5cf6", fontWeight: "500" });
  promptText.textContent = "Press your shortcut key\u2026";
  promptBox.appendChild(promptText);
  const badgeArea = document.createElement("div");
  badgeArea.id = "sk-cap-badge";
  Object.assign(badgeArea.style, { marginTop: "10px", display: "none" });
  promptBox.appendChild(badgeArea);
  card.appendChild(promptBox);

  // ── Buttons ──
  const btnRow = document.createElement("div");
  Object.assign(btnRow.style, { display: "flex", gap: "10px", justifyContent: "center" });
  const cancelBtn = document.createElement("button");
  cancelBtn.id = "sk-cap-cancel";
  Object.assign(cancelBtn.style, { background: "#222228", border: "1px solid #2e2e36", color: "#8b8b96", padding: "10px 22px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontFamily: "inherit" });
  cancelBtn.textContent = "Cancel";
  btnRow.appendChild(cancelBtn);
  const saveBtn = document.createElement("button");
  saveBtn.id = "sk-cap-save";
  Object.assign(saveBtn.style, { background: "#7c3aed", border: "none", color: "white", padding: "10px 26px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", fontFamily: "inherit", display: "none" });
  saveBtn.textContent = "Save Binding";
  btnRow.appendChild(saveBtn);
  card.appendChild(btnRow);

  captureOverlayEl.appendChild(card);
  document.documentElement.appendChild(captureOverlayEl);

  let capturedCombo = "";
  // promptText, badgeArea, saveBtn, cancelBtn already declared above via createElement

  const capKeyHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.key === "Escape") {
      removeCaptureOverlay();
      if (targetEl) { targetEl.style.outline = ""; targetEl.style.outlineOffset = ""; }
      document.removeEventListener("keydown", capKeyHandler, true);
      return;
    }

    let key = e.key.toLowerCase();
    if (["control", "alt", "shift", "meta"].includes(key)) return;
    let parts = [];
    if (e.ctrlKey) parts.push("ctrl");
    if (e.altKey) parts.push("alt");
    if (e.shiftKey) parts.push("shift");
    if (e.metaKey) parts.push("meta");
    parts.push(key);
    capturedCombo = parts.join("+");

    // Show captured key visually
    promptText.textContent = "Shortcut captured!";
    promptText.style.animation = "none";
    promptText.style.color = "#4ade80";
    badgeArea.style.display = "flex";
    badgeArea.style.justifyContent = "center";
    badgeArea.textContent = "";

    const formatParts = capturedCombo.split("+").map(p => {
      if (p === "ctrl") return "Ctrl";
      if (p === "alt") return "Alt";
      if (p === "shift") return "Shift";
      if (p === "meta") return "Meta";
      return p.length === 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1);
    });
    formatParts.forEach((p, idx) => {
      const span = document.createElement("span");
      Object.assign(span.style, {
        background: "linear-gradient(180deg,#3a3a42,#2a2a32)", border: "1px solid #4a4a52",
        borderRadius: "5px", padding: "4px 10px", fontSize: "15px", fontFamily: "monospace",
        fontWeight: "700", color: "#eaeaed", boxShadow: "0 2px 0 #1a1a22"
      });
      span.textContent = p;
      badgeArea.appendChild(span);
      if (idx < formatParts.length - 1) {
        const plus = document.createElement("span");
        plus.textContent = " + ";
        plus.style.color = "#5a5a65";
        plus.style.margin = "0 3px";
        plus.style.fontSize = "14px";
        badgeArea.appendChild(plus);
      }
    });

    saveBtn.style.display = "";
    document.removeEventListener("keydown", capKeyHandler, true);
  };

  document.addEventListener("keydown", capKeyHandler, true);

  cancelBtn.addEventListener("click", () => {
    removeCaptureOverlay();
    if (targetEl) { targetEl.style.outline = ""; targetEl.style.outlineOffset = ""; }
    document.removeEventListener("keydown", capKeyHandler, true);
  });

  saveBtn.addEventListener("click", async () => {
    if (!capturedCombo) return;
    // Save binding directly to storage
    try {
      const data = await browser.storage.local.get(hostname);
      const mappings = data[hostname] || [];
      mappings.push({ key: capturedCombo, selector, label: elName || "" });
      await browser.storage.local.set({ [hostname]: mappings });

      promptText.textContent = "✓ Binding saved!";
      promptText.style.color = "#4ade80";
      saveBtn.style.display = "none";
      if (targetEl) { targetEl.style.outline = ""; targetEl.style.outlineOffset = ""; }
      setTimeout(() => removeCaptureOverlay(), 1200);
    } catch (err) {
      promptText.textContent = "Error saving: " + err.message;
      promptText.style.color = "#f87171";
    }
  });
}

function removeCaptureOverlay() {
  if (captureOverlayEl && captureOverlayEl.parentNode) {
    captureOverlayEl.parentNode.removeChild(captureOverlayEl);
  }
  captureOverlayEl = null;
}

// ─── Keydown — trigger shortcuts ─────────────────────────────────

document.addEventListener("keydown", async (e) => {
  if (isPicking || captureOverlayEl) return;
  let key = e.key.toLowerCase();
  if (["control","alt","shift","meta"].includes(key)) return;

  let parts = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  if (e.metaKey) parts.push("meta");
  parts.push(key);
  const combo = parts.join("+");

  const host = window.location.hostname;

  try {
    const data = await browser.storage.local.get([host, "__shortkeys_sequences__"]);

    // Collect ALL candidates matching this combo on this host
    const candidates = [];

    // Single bindings
    const mappings = data[host] || [];
    for (const m of mappings) {
      if (m.key === combo) {
        candidates.push({
          type: "binding",
          selector: m.selector,
          timeout: m.timeout || 8000,
          binding: m
        });
      }
    }

    // Sequences
    const allSeq = data["__shortkeys_sequences__"] || {};
    const hostSeq = allSeq[host] || [];
    for (const seq of hostSeq) {
      if (seq.trigger === combo) {
        // Use the first step's selector to check availability
        const firstStepSelector = seq.steps?.[0]?.selector;
        const firstStepAction = seq.steps?.[0]?.action;
        // wait/navigate steps don't need a selector check
        const needsSelector = firstStepSelector && !["wait", "navigate"].includes(firstStepAction);
        candidates.push({
          type: "sequence",
          selector: needsSelector ? firstStepSelector : null,
          timeout: seq.timeout || 8000,
          sequence: seq
        });
      }
    }

    if (!candidates.length) return;
    e.preventDefault();
    e.stopPropagation();

    // Try to find a candidate whose element is immediately available
    let fired = false;
    for (const c of candidates) {
      if (!c.selector) {
        // No selector to check (e.g. sequence starting with wait/navigate)
        if (c.type === "sequence") runSequence(c.sequence, 0);
        fired = true;
        break;
      }
      const el = querySelectorDeep(c.selector);
      if (el) {
        if (c.type === "binding") {
          showExecutionHUD(`Binding: ${c.binding.label || c.binding.key}`, c.selector);
          simulateSolidClick(el);
        } else {
          runSequence(c.sequence, 0);
        }
        fired = true;
        break;
      }
    }

    // If nothing fired immediately, poll until one becomes available or timeout
    if (!fired) {
      const maxTimeout = Math.max(...candidates.map(c => c.timeout || 8000));
      const start = Date.now();
      const poll = setInterval(() => {
        for (const c of candidates) {
          if (!c.selector) continue;
          const el = querySelectorDeep(c.selector);
          if (el) {
            clearInterval(poll);
            if (c.type === "binding") {
              showExecutionHUD(`Binding: ${c.binding.label || c.binding.key}`, c.selector);
              simulateSolidClick(el);
            }
            else runSequence(c.sequence, 0);
            return;
          }
        }
        if (Date.now() - start > maxTimeout) {
          clearInterval(poll);
          console.warn("Shortkeys: No matching element found within timeout for combo:", combo);
        }
      }, 300);
    }
  } catch (err) {
    console.error("Shortkeys Error:", err);
  }
});

// ─── Execution Toast (HUD) & Click Simulator ──────────────────────────

function simulateSolidClick(el) {
  try {
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new MouseEvent("mouseenter", opts));
    el.dispatchEvent(new MouseEvent("mouseover", opts));
    el.dispatchEvent(new PointerEvent("pointerdown", { ...opts, pointerType: "mouse" }));
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    try { el.focus(); } catch(e){}
    el.dispatchEvent(new PointerEvent("pointerup", { ...opts, pointerType: "mouse" }));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
  } catch(e) {}
  // Follow with native click to trigger standard form submissions/links
  el.click();
}

let execToastTimer = null;
let execToastEl = null;

async function showExecutionHUD(title, subtitle, progressPercent = null) {
  try {
    const data = await browser.storage.local.get("__shortkeys_settings");
    const settings = data.__shortkeys_settings || {};
    const pos = settings.hudPosition || "tr"; // tr, tl, br, bl
    const scale = settings.hudScale || 1.0;
    
    if (!execToastEl) {
      execToastEl = document.createElement("div");
      execToastEl.id = "shortkeys-hud";
      document.documentElement.appendChild(execToastEl);
    }

    const tp = pos.includes("t") ? "20px" : "auto";
    const bt = pos.includes("b") ? "20px" : "auto";
    const lf = pos.includes("l") ? "20px" : "auto";
    const rt = pos.includes("r") ? "20px" : "auto";

    Object.assign(execToastEl.style, {
      position: "fixed", top: tp, bottom: bt, left: lf, right: rt, zIndex: "2147483647",
      background: "rgba(20, 20, 25, 0.95)", border: "1px solid #2e2e36", color: "#eaeaed",
      padding: "12px 16px", borderRadius: "8px", fontFamily: "'Inter', sans-serif",
      boxShadow: "0 10px 40px rgba(0,0,0,0.5)", transition: "opacity 0.2s ease, transform 0.2s ease",
      opacity: "1", transform: `scale(${scale})`, 
      transformOrigin: (pos.includes("l") ? "left " : "right ") + (pos.includes("t") ? "top" : "bottom"),
      pointerEvents: "none", minWidth: "220px", display: "block"
    });

    execToastEl.textContent = "";

    const toastHeader = document.createElement("div");
    Object.assign(toastHeader.style, { display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" });
    const toastIcon = document.createElement("span");
    Object.assign(toastIcon.style, { fontSize: "14px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "700" });
    toastIcon.textContent = "\u2328";
    toastHeader.appendChild(toastIcon);
    const toastTitle = document.createElement("span");
    toastTitle.id = "sk-toast-title";
    Object.assign(toastTitle.style, { fontSize: "12px", fontWeight: "600", color: "#fff" });
    toastHeader.appendChild(toastTitle);
    execToastEl.appendChild(toastHeader);

    const toastSubtitle = document.createElement("div");
    toastSubtitle.id = "sk-toast-subtitle";
    Object.assign(toastSubtitle.style, { fontSize: "11px", color: "#8b8b96", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
    execToastEl.appendChild(toastSubtitle);

    const toastPbContainer = document.createElement("div");
    toastPbContainer.id = "sk-toast-pb-container";
    execToastEl.appendChild(toastPbContainer);
    
    execToastEl.querySelector("#sk-toast-title").textContent = title;
    execToastEl.querySelector("#sk-toast-subtitle").textContent = subtitle;

    const pbContainer = execToastEl.querySelector("#sk-toast-pb-container");
    if (progressPercent !== null) {
      pbContainer.textContent = "";
      const outerBar = document.createElement("div");
      Object.assign(outerBar.style, { marginTop: "8px", background: "rgba(255,255,255,0.1)", height: "4px", borderRadius: "2px", overflow: "hidden" });
      const innerBar = document.createElement("div");
      Object.assign(innerBar.style, { width: progressPercent + "%", background: "#7c3aed", height: "100%", transition: "width 0.2s ease" });
      outerBar.appendChild(innerBar);
      pbContainer.appendChild(outerBar);
    }

    if (execToastTimer) clearTimeout(execToastTimer);
    execToastTimer = setTimeout(() => {
      if (execToastEl) execToastEl.style.opacity = "0";
    }, (progressPercent !== null && progressPercent < 100) ? 6000 : 3000);
  } catch(e) {}
}

// ─── Sequence runner (expanded actions) ──────────────────────────

async function runSequence(seq, startIndex = 0) {
  const steps = seq.steps;
  if (!steps || steps.length === 0) return;

  for (let i = startIndex; i < steps.length; i++) {
    const step = steps[i];
    const action = step.action || "click";

    showExecutionHUD(
      `Sequence: ${seq.name || "Unnamed"}`,
      `Step ${i + 1} / ${steps.length}: ${step.name || step.action}`,
      ((i + 1) / steps.length) * 100
    );

    // Report progress for cross-page resume
    try {
      await browser.runtime.sendMessage({
        action: "reportSequenceNextIndex",
        hostname: window.location.hostname,
        seqName: seq.name || "",
        seqTrigger: seq.trigger || "",
        nextIndex: i + 1
      });
    } catch(e) {}

    // Pre-execution delay
    if (step.delay && step.delay > 0) {
      await new Promise(r => setTimeout(r, step.delay));
    }

    // Actions that don't require a selector
    if (action === "wait") {
      await new Promise(r => setTimeout(r, parseInt(step.value) || 1000));
      continue;
    }
    if (action === "navigate") {
      window.location.href = step.value || "";
      return; // page will reload, background.js handles resume
    }

    // All other actions require a selector
    const el = await waitForElement(step.selector, step.timeout || 15000);
    if (!el) {
      console.warn(`Shortkeys: Step ${i + 1} failed — element not found: ${step.selector}`);
      return;
    }

    switch (action) {
      case "click":
        simulateSolidClick(el);
        break;

      case "input":
        el.focus();
        el.value = step.value || "";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        break;

      case "clear":
        el.focus();
        el.value = "";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        break;

      case "focus":
        el.focus();
        break;

      case "hover":
        el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        break;

      case "scroll":
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        break;

      case "select":
        if (el.tagName.toLowerCase() === "select") {
          el.value = step.value || "";
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
        break;

      case "keypress": {
        const keyVal = step.value || "Enter";
        el.focus();
        el.dispatchEvent(new KeyboardEvent("keydown", { key: keyVal, bubbles: true }));
        el.dispatchEvent(new KeyboardEvent("keypress", { key: keyVal, bubbles: true }));
        el.dispatchEvent(new KeyboardEvent("keyup", { key: keyVal, bubbles: true }));
        break;
      }

      case "check":
        if (el.type === "checkbox" || el.type === "radio") {
          el.checked = !el.checked;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          simulateSolidClick(el);
        }
        break;

      default:
        simulateSolidClick(el);
    }
  }
}

function waitForElement(selector, timeout) {
  return new Promise((resolve) => {
    const existing = querySelectorDeep(selector);
    if (existing) return resolve(existing);
    
    const start = Date.now();
    const poll = setInterval(() => {
      const el = querySelectorDeep(selector);
      if (el) {
        clearInterval(poll);
        resolve(el);
      } else if (Date.now() - start > timeout) {
        clearInterval(poll);
        resolve(null);
      }
    }, 150);
  });
}

// ─── Cross-page resume ───────────────────────────────────────────

async function checkForRunningSequence() {
  try {
    const activeData = await browser.runtime.sendMessage({ action: "checkRunningSequence" });
    if (activeData && activeData.nextIndex !== undefined) {
      const data = await browser.storage.local.get("__shortkeys_sequences__");
      const allSeq = data["__shortkeys_sequences__"] || {};
      const hostSeq = allSeq[activeData.hostname] || [];
      let seq = hostSeq.find(s => s.trigger === activeData.seqTrigger);
      if (!seq && hostSeq.length > 0) seq = hostSeq[0];
      if (seq) runSequence(seq, activeData.nextIndex);
    }
  } catch (e) {}
}

checkForRunningSequence();

