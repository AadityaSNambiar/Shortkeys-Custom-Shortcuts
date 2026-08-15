/* ===================================================================
  Shortkeys — Background Script
  Handles: context menu, sequence cross-page state, cross-page shortcut execution
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

// ─── Wait for tab to reach complete status ──────────────────────────
function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    const checkIfLoaded = () => {
      browser.tabs.get(tabId).then((tab) => {
        if (tab.status === "complete") {
          resolve();
        } else {
          setTimeout(checkIfLoaded, 100);
        }
      }).catch(() => {
        // Tab might have been closed, reject
        resolve(); // resolve to avoid blocking
      });
    };
    checkIfLoaded();
  });
}

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
        let parsedUrl = new URL(tab.url);
        let h = parsedUrl.hostname || 'local';
        browser.tabs.sendMessage(tab.id, {
          action: "showCaptureOverlay",
          selector: data.__shortkeys_last_context_selector,
          elName: data.__shortkeys_last_context_name || "",
          hostname: h
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

  if (message.action === "navigateTab") {
    if (sender.tab && sender.tab.id) {
      browser.tabs.update(sender.tab.id, { url: message.url });
    }
    return Promise.resolve(true);
  }

  // ─── Cross-Page Shortcut Execution ───────────────────────────────

  if (message.action === "executeShortcutCrossPage") {
    const combo = message.combo;
    const senderTabId = sender.tab && sender.tab.id;

    // Search for the combo in storage
    return browser.storage.local.get(null).then((allData) => {
      let targetHostname = null;
      let mapping = null;
      let mappingType = null; // 'binding' or 'sequence'

      // Check bindings: for each hostname in allData, if the hostname is not the special keys, then it's a hostname
      for (const key in allData) {
        if (key === "__shortkeys_sequences__" || key.startsWith("_")) continue; // skip special keys
        const mappings = allData[key] || [];
        for (const m of mappings) {
          if (m.key === combo) {
            targetHostname = key;
            mapping = m;
            mappingType = "binding";
            break;
          }
        }
        if (targetHostname) break;
      }

      // If not found in bindings, check sequences
      if (!targetHostname) {
        const seqData = allData["__shortkeys_sequences__"] || {};
        for (const host in seqData) {
          const sequences = seqData[host] || [];
          for (const seq of sequences) {
            if (seq.trigger === combo) {
              targetHostname = host;
              mapping = seq;
              mappingType = "sequence";
              break;
            }
          }
          if (targetHostname) break;
        }
      }

      if (!targetHostname || !mapping) {
        console.warn(`Shortkeys: No mapping found for combo "${combo}"`);
        return Promise.resolve({ success: false, error: "Mapping not found" });
      }

      // Find or create a tab for the target hostname
      return browser.tabs.query({}).then((tabs) => {
        let targetTab = null;
        for (const tab of tabs) {
          try {
            const url = new URL(tab.url || "");
            if (url.hostname === targetHostname) {
              targetTab = tab;
              break;
            }
          } catch (e) {
            // ignore invalid URLs
          }
        }

        if (targetTab) {
          // Focus the existing tab
          browser.tabs.update(targetTab.id, { active: true });
          // Wait for the tab to be updated and then check if it's loaded?
          // We will wait for the onUpdated event for this tab to be complete.
          return waitForTabLoad(targetTab.id).then(() => {
            // Now, send a message to the content script in this tab to execute the shortcut
            return browser.tabs.sendMessage(targetTab.id, {
              action: "executeShortcutFromBackground",
              mapping: mapping,
              mappingType: mappingType
            }).catch((err) => {
              console.error(`Shortkeys: Failed to send message to target tab ${targetTab.id}:`, err);
              return Promise.resolve({ success: false, error: "Failed to send message to target tab" });
            });
          });
        } else {
          // Create a new tab
          let url = `https://${targetHostname}`;
          // We should also try http if https fails? We'll keep it simple for now.
          return browser.tabs.create({ url: url, active: true }).then((newTab) => {
            return waitForTabLoad(newTab.id).then(() => {
              return browser.tabs.sendMessage(newTab.id, {
                action: "executeShortcutFromBackground",
                mapping: mapping,
                mappingType: mappingType
              }).catch((err) => {
                console.error(`Shortkeys: Failed to send message to new tab ${newTab.id}:`, err);
                return Promise.resolve({ success: false, error: "Failed to send message to new tab" });
              });
            });
          });
        }
      });
    });
  }
});
