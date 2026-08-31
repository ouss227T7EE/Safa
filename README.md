# <img src="https://api.iconify.design/octicon/cpu-24.svg?color=%2358a6ff" width="28" height="28" alt="Project Icon" align="center"> Safa (◎) — Cognitive Restoration & Digital Detox Engine

![Offline First](https://img.shields.io/badge/Architecture-Offline_First-success?style=for-the-badge)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Cross Platform](https://img.shields.io/badge/Platform-Win_%7C_Mac_%7C_Linux-lightgrey?style=for-the-badge)

## <img src="https://api.iconify.design/octicon/book-24.svg?color=%2358a6ff" width="22" height="22" alt="Context Icon"> The Psychological & Economic Context
The modern "attention economy" is driven by short-form content designed for immediate gratification. Emerging research highlights that this continuous consumption leads to measurable declines in working memory, sustained attention, and impulse control—creating cognitive deficits that impact both individual productivity and broader economic capital. 

**Safa** is a standalone, cross-platform engine designed to counter this. Based on a 14-day digital detox protocol published in *PNAS Nexus*, this software provides clinical-grade psychological testing to establish a baseline focus score, encouraging users to gradually reduce screen time and empirically measure their cognitive recovery.

---

## <img src="https://api.iconify.design/octicon/server-24.svg?color=%2358a6ff" width="22" height="22" alt="Architecture Icon"> Technical Architecture
Safa is engineered to function entirely independent of external servers, ensuring 100% data privacy and offline accessibility across all platforms.

* **Frontend Environment:** Built with Vanilla JavaScript and TypeScript definitions, bundled via Vite.
* **Storage:** Utilizes robust client-side structures (LocalStorage) for state management.
* **Desktop Wrapper:** Integrated with Electron.js to package the web engine into standalone, lightweight native desktop applications.
* **Progressive Web App (PWA):** Fully installable via modern web browsers using a custom manifest and a caching Service Worker.
* **Algorithmic Engine:** Features a custom-built AI Chess Engine utilizing the Minimax algorithm with Alpha-Beta pruning.

---

## <img src="https://api.iconify.design/octicon/beaker-24.svg?color=%2358a6ff" width="22" height="22" alt="Science Icon"> Scientific Paradigms Implemented
1. **SART (Sustained Attention to Response Task):** Measures moment-to-moment "attention lapses" by calculating commission errors, omission errors, and reaction time variability.
2. **N-Back Task (Working Memory):** A continuous performance task measuring fluid intelligence.
3. **Stroop Effect Test (Cognitive Control):** Analyzes reaction time interference during semantic processing tasks.
4. **Corsi Block-Tapping (Visuospatial Memory):** Evaluates the capacity of the visuospatial sketchpad through sequence imitation.

---

## <img src="https://api.iconify.design/octicon/graph-24.svg?color=%2358a6ff" width="22" height="22" alt="Data Icon"> Data Correlation Engine
Safa goes beyond standard measurement by correlating user behavior with cognitive output. The built-in Analytics & Correlation Engine continuously cross-references the user's self-reported daily screen time against their active SART scores. 

By applying localized statistical analysis, the engine provides mathematical insights directly to the dashboard, merging behavioral economics with software engineering.

---

## <img src="https://api.iconify.design/octicon/check-circle-24.svg?color=%2358a6ff" width="22" height="22" alt="Prerequisites Icon"> Prerequisites
Before downloading or building the project from the source, ensure you have the following installed on your system:
* **Git:** For cloning the repository.
* **Node.js:** (Version 16.0.0 or higher) - Includes npm required for package management and building the desktop apps.

---

## <img src="https://api.iconify.design/octicon/download-24.svg?color=%2358a6ff" width="22" height="22" alt="Download Icon"> Cross-Platform Installation & Downloads

### 1. Web Version (Development Mode)
To run the engine strictly as a web application via the terminal:

    git clone https://github.com/ouss227T7EE/Safa.git
    cd Safa
    npm install
    npm run dev

### 2. Windows Installation (.exe)
To compile the project into a standalone executable program for Windows:

    npm run build:win

*The generated setup file will be located in the dist/releases folder. Double-click the .exe to install.*

### 3. Arch Linux / Ubuntu Build (.AppImage / .pacman)
To compile for Linux environments directly from the terminal:

    npm run build:linux

*Can be executed directly from the terminal or GUI without heavy dependencies.*

### 4. macOS Build (.dmg)
To compile the project for Apple environments:

    npm run build:mac

*Drag and drop the generated .dmg file into your Applications folder.*

---

## <img src="https://api.iconify.design/octicon/person-24.svg?color=%2358a6ff" width="22" height="22" alt="Author Icon"> Author
**Independent Researcher & Software Engineer**  
*Showcasing proficiency in decision-tree logic, client-side state management, cognitive psychology integrations, and cross-platform architecture.*

---
**My Contribution**
*Designed the original project concept and user experience*
*Defined the application's requirements and workflow*
*Planned the system structure and features*
*Directed the AI-assisted development process*
*Tested, evaluated, and refined the final application*

---
**AI-Assisted Development**

AI tools were used as development assistance during implementation. The concept, requirements, system design, feature selection, testing, and final integration were directed and evaluated by me
---

## <img src="https://api.iconify.design/octicon/law-24.svg?color=%2358a6ff" width="22" height="22" alt="License Icon"> License
This project is licensed under the **MIT License**. You are free to use, modify, and distribute the software, provided that proper credit is maintained. See the LICENSE file for more details.

