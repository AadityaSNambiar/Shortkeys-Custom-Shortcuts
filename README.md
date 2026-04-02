# ⌨ Shortkeys Automation Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/AadityaSNambiar/)
[![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Firefox-orange.svg)](https://github.com/AadityaSNambiar/)

Shortkeys is a high-performance browser automation engine designed to transform your web experience through intelligent keyboard orchestration. Map complex shortcuts to specific page elements, execute multi-step macros with precision, and navigate cross-page workflows effortlessly.

---

## ✨ Core Features

### 🧠 Intelligent Sequence Engine
*   **11+ Action Types:** Orchestrate macros using `click`, `input`, `hover`, `focus`, `check`, `scroll`, `wait`, and `navigate`.
*   **Contextual Awareness:** Injected logic detects element availability and handles dynamic page states.
*   **Variable Delays:** Fine-tune execution with pre-action and step-specific timing intervals.

### ⚡ Smart Conflict Resolution
*   **Multi-Candidate Logic:** Handles overlapping keybindings by polling the DOM and executing the first available target.
*   **Custom Timeouts:** Define per-shortcut "Max Search Timeouts" to ensure reliability on slow-loading elements.

### 🎮 Premium User Experience
*   **Visual HUD:** A sleek, non-intrusive Heads-Up Display provides real-time progress bars and execution status.
*   **On-Page Capture:** Right-click any element to instantly bind a key—no popup menus required.
*   **Customizable UI:** Integrated Settings tab to control HUD positioning and global UI scale (0.75x to 1.5x).

### 🚀 Advanced Interaction (SolidClick™)
*   **Framework Bypass:** Uses a comprehensive suite of pointer, mouse, and focus events to bypass protections in modern apps like **YouTube Music**, **Spotify**, and **React**-based platforms.
*   **Cross-Page Persistence:** Sequences store their execution state, allowing them to resume seamlessly even after page refreshes or navigation.

---

## 🛠 Installation

### 🌐 Google Chrome / Chromium-Based (Brave, Edge, Opera)
1. **Clone/Download** this repository to your local machine.
2. Navigate to `chrome://extensions/` in your browser.
3. Enable **Developer mode** (top right toggle).
4. Click **Load unpacked** and select the project folder.

### 🦊 Mozilla Firefox
1. **Clone/Download** this repository.
2. Navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select the `manifest.json` file in the project directory.

---

## 📖 Usage Guide

1.  **Quick Bind:** Right-click any button or input on a website and select **"Map This Element"**. Press your desired key combination to save.
2.  **Macro Sequences:** Open the popup, switch to the **Sequences** tab, and use the **"Pick"** tool to visually select elements for each step of your workflow.
3.  **Manual Execution:** Every saved shortcut and sequence features a **▶ Play** button in the list for instant, manual triggering.
4.  **Settings:** Use the **Settings** tab to adjust HUD placement (Top-Right, Bottom-Left, etc.) or export your entire configuration as a JSON backup.

---

## 🔒 Security & Privacy

Shortkeys is built with a **Privacy-First** architecture:
*   **0% Telemetry:** No data collection, no external tracking, and zero analytics.
*   **Local Storage:** All bindings and sequences reside exclusively on your local machine.
*   **AMO Compliant:** Fully refactored to pass Mozilla's rigorous security audits (uses 100% safe DOM APIs, no `innerHTML`).
*   **Data Permission:** Explicitly declares `required: ["none"]` for data collection in the manifest.

---

## 👨‍💻 Contributing & License

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for new action types or performance optimizations.

Distributed under the **MIT License**. Created with 💜 by [Aaditya Nambiar](https://github.com/AadityaSNambiar/).
