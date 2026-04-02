/* ===================================================================
   Shortkeys — Background Script
   Handles: context menu, sequence cross-page state, message routing
   =================================================================== */

let activeSequences = {};

// Clean up expired sequences (2 min timeout)
setInterval(() => {
  const now = Date.now();
  for (const tabId in activeSequences) {
    if (now - activeSequences[tabId].timestamp > 120000) {
      delete activeSequences[tabId];
    }
  }
}, 5000);

// ─── Context Menu ────────────────────────────────────────────────

browser.contextMenus.create({
  id: "shortkeys-map-element",
  title: "Shortkeys: Map This Element",
  contexts: ["all"]
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "shortkeys-map-element" && tab && tab.id) {
    const data = await browser.storage.local.get([
      "__shortkeys_last_context_selector",
      "__shortkeys_last_context_type",
      "__shortkeys_last_context_name"
    ]);
    if (data.__shortkeys_last_context_selector) {
      // Show the on-page capture overlay directly
      browser.tabs.sendMessage(tab.id, {
        action: "showCaptureOverlay",
        selector: data.__shortkeys_last_context_selector,
        elName: data.__shortkeys_last_context_name || "",
        hostname: new URL(tab.url).hostname
      });
    }
  }
});

// ─── Message Handler ─────────────────────────────────────────────

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "reportSequenceNextIndex") {
    if (sender.tab && sender.tab.id) {
      activeSequences[sender.tab.id] = {
        hostname: message.hostname,
        seqName: message.seqName || "",
        seqTrigger: message.seqTrigger || "",
        nextIndex: message.nextIndex,
        timestamp: Date.now()
      };
    }
    return Promise.resolve(true);
  }

  if (message.action === "checkRunningSequence") {
    if (sender.tab && sender.tab.id) {
      const active = activeSequences[sender.tab.id];
      if (active) {
        const toReturn = { ...active };
        delete activeSequences[sender.tab.id];
        return Promise.resolve(toReturn);
      }
    }
    return Promise.resolve(null);
  }
});
