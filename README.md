# ⌨ Shortkeys Automation Engine

Shortkeys is a highly advanced, intelligent keyboard automation extension for Chromium and Firefox. It transforms your browser by allowing you to map complex keyboard shortcuts (combos) to specific page elements, executing sophisticated multi-step macros, and navigating cross-page workflows instantly.

## 🚀 Key Features

* **Advanced Sequence Engine:** Create macros with up to 11 distinct action types, including `click`, `input`, `hover`, `focus`, `check`, `scroll`, and `navigate`.
* **Smart Conflict Resolution:** If multiple shortcuts share the exact same keybinding on a page, the engine intelligently polls the DOM for the first available target element and executes the correct task contextually.
* **On-Page Visual Capture:** Right-click directly onto any element on any web page to instantly summon a keystroke overlay, binding that specific element without ever opening the popup.
* **Execution HUD:** A sleek, customizable Heads-Up Display injected directly into the active webpage providing real-time feedback and progress bars when a binding or multi-step sequence executes.
* **Resilient "Solid Click" Simulation:** Effortlessly bypass modern framework protections (React, Vue, Polymer, YouTube Music) using a comprehensive emulated suite of pointer-events, mousedowns, and native clicks.
* **Cross-Page Execution:** Sequences intelligently store execution state locally enabling operations to persist flawlessly across complex page navigation and refreshes.
* **AMO Compliant:** Highly secure architecture fully passing the strict Mozilla Add-ons security linter natively (Zero DOM-injecting `innerHTML` assignments, pure TextContent DOM APIs).

## 📦 Installation

This extension is built for both Chrome (Manifest V2 structure compatible) and Firefox. 

### Chrome / Brave / Edge
1. Download or clone this repository.
2. Open your browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the directory containing this repository.

### Firefox
1. Download or clone this repository.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**
4. Select the `manifest.json` file inside the repository.

## ⚙️ How to Use

1. **Mapping a Basic Shortcut:** 
   Right-click an element (like a "Like" button or search bar), and an overlay will naturally prompt you to assign a keyboard binding to it.
2. **Dynamic UI Tweaks:** 
   Go to the extension's **Settings** tab. Here you can tweak the global size of the builder UI, or change the location of your execution HUD (Top Left, Bottom Right, etc.).
3. **Sequence Building:** 
   Open the **Sequences** tab. Use the visual picker "Pick" button to seamlessly jump back to your webpage to select specific elements for each step of your macro sequence. You can configure delays directly inside each step.
4. **Data Exports:**
   Because all configurations are locked perfectly to your own machine, you can backup your workflows in the Settings tab using the Export JSON button. 

## 🛠 Tech Stack
- Vanilla HTML / JS / CSS (Zero heavy-weight web frameworks)
- Browser Storage & Runtime API

## 🔒 Privacy
The extension enforces complete, strict local privacy. It stores your customized mappings in standard local storage caches natively. It neither transmits nor collects external analytical or personal telemetrical data (`data_collection_permissions = "none"`).
