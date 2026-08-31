# Safa (◎) — Cognitive Restoration & Digital Detox Engine

![Offline First](https://img.shields.io/badge/Architecture-Offline_First-success?style=for-the-badge)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Stack-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🧠 The Psychological & Economic Context
The modern "attention economy" is driven by short-form content designed for immediate gratification. Emerging research highlights that this continuous consumption leads to measurable declines in working memory, sustained attention, and impulse control—creating cognitive deficits often colloquially termed "brain rot." 

**Safa** is a standalone, client-side web application designed to counter this. Based on a 14-day digital detox protocol published in *PNAS Nexus*, this engine provides clinical-grade psychological testing to establish a baseline focus score, encouraging users to gradually reduce screen time and empirically measure their cognitive recovery.

---

## 🛠️ Technical Architecture
Safa is engineered to function entirely independent of external servers, ensuring 100% data privacy and offline accessibility.

* **Frontend Environment:** Built with Vanilla JavaScript and TypeScript definitions, bundled via **Vite** for optimized HMR and lightning-fast production builds.
* **Storage:** Utilizes robust `LocalStorage` structures for state management, tracking 14-day historical data, SART scores, and gaming metrics.
* **Progressive Web App (PWA):** Fully installable on Desktop and Mobile devices via a custom `manifest.json` and a caching `Service Worker`.
* **Algorithmic Engine:** Features a custom-built, local **AI Chess Engine** utilizing the Minimax algorithm with Alpha-Beta pruning to test decision-tree logic and strategic foresight.
* **Accessibility (a11y):** Integrated visually inclusive design systems, including structural support for colorblind modes.

---

## 🔬 Scientific Paradigms Implemented
The application translates complex clinical psychology methodologies into an interactive software suite:

1. **SART (Sustained Attention to Response Task):**
   Measures moment-to-moment "attention lapses" by calculating commission errors, omission errors, and reaction time coefficient of variation (CV).
2. **N-Back Task (Working Memory):**
   A continuous performance task measuring fluid intelligence and working memory capacity (Kirchner, 1958).
3. **Stroop Effect Test (Cognitive Control):**
   Analyzes reaction time interference during semantic processing tasks to measure inhibitory control (Stroop, 1935).
4. **Corsi Block-Tapping (Visuospatial Memory):**
   Evaluates the capacity of the visuospatial sketchpad through an increasingly complex sequence imitation (Corsi, 1972).

---

## 🚀 Getting Started (Development)

To run this project locally, ensure you have Node.js installed, then execute the following commands in your terminal:

```bash
# Clone the repository
git clone [https://github.com/ouss227T7EE/Safa.git](https://github.com/ouss227T7EE/Safa.git)

# Navigate into the project directory
cd Safa

# Install dependencies (Vite)
npm install

# Start the local development server
npm run dev
