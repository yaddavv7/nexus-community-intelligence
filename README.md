# NEXUS
### AI-Powered Community Intelligence & Predictive Problem Management Network

> **Tagline:** *"Detect Problems. Connect Communities. Predict Risks. Create Impact."*

---

## 1. Project Overview & Vision

**NEXUS** is a next-generation civic intelligence, community problem reporting, hazard correlation, and predictive management platform.

Rather than acting as a passive complaint drop-box, NEXUS connects citizens, community organizations, field volunteers, and municipal administrators into a single **central intelligence system**.

The platform is designed around answering five critical civic questions:
1. **What problems are happening in a community?** (Multimodal text, voice, and photo categorization)
2. **Where are these problems concentrated?** (Geospatial clustering and heatmap analysis on OpenStreetMap)
3. **Which problems require immediate attention?** (Explainable multi-factor priority scoring)
4. **What risks could emerge based on available evidence?** (Correlating open drainage with real-time/simulated precipitation)
5. **What actions should be prioritized?** (Actionable municipal inspection and field team dispatch checklists)

**Initial Demonstration Scenario:** Greater Kochi & Periyar River Basin Wards, Kerala, India (Aluva, Kalamassery, Kakkanad, Fort Kochi, Vyttila, Edappally). Fully adaptable to any global municipality or smart city.

---

## 2. Technology Stack

### Frontend:
- **Framework:** React 19 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS with deep smart-city palette, glassmorphism, and responsive layouts
- **Icons & Motion:** Lucide Icons & Framer Motion
- **Interactive Geospatial Mapping:** Leaflet & OpenStreetMap (`react-leaflet`) with custom category and priority-coded SVG markers
- **Data Visualizations:** Recharts (Category distributions, weekly trends, resolution velocity)
- **State Management & Bilingual Engine:** React Context API + TanStack Query + Malayalam & English bilingual dictionary

### Backend:
- **Framework:** Python 3.12 + FastAPI (High-performance REST API architecture)
- **Server:** Uvicorn ASGI with CORS middleware
- **Data Validation & Schemas:** Pydantic v2
- **Database Engine:** SQLAlchemy with SQLite async local fallback + Production Supabase PostgreSQL RLS schema
- **AI Triage Engine:** Google Gemini API integration (`google-genai`) + explainable NLP & heuristic rules fallback
- **Weather Intelligence:** Open-Meteo live API integration for Kerala coordinates (`lat=9.9816, lon=76.2999`) + simulated monsoon scenario trigger

---

## 3. Core Architecture & Features

### A. Citizen Problem Reporting & NEXUS VOICE
- **Multilingual Submission:** Report in **English** or **Malayalam (മലയാളം)** with bidirectional keyword semantic mapping.
- **NEXUS VOICE:** Web Speech API voice assistant that transcribes speech, extracts location landmarks, tags category, and generates an editable draft. *Never submits without explicit user confirmation.*
- **Interactive Map Location Picker:** Drop coordinate pins with instant visual feedback and geolocation support.
- **Cryptographic Incident IDs:** Generates unique tracking codes (e.g. `NX-2026-KL-0001`).
- **Privacy First:** Masks citizen phone numbers and personal contact details in public views.

### B. AI Intelligence Modules
1. **Multimodal Problem Classification:** Identifies category, severity level (1–5), urgency tier, supporting observations, and responsible Kerala departments (PWD, KSEB, KWA, Irrigation).
2. **Geospatial & Semantic Duplicate Detection:** Uses Haversine distance (&lt; 400m) and Jaccard description token overlap to detect redundant reports, offering one-click administrator merge.
3. **Explainable Priority Engine:** Calculates transparent score (0–100) using:
   $$\text{Priority} = (0.25 \times \text{Severity}) + (0.25 \times \text{Urgency}) + (0.20 \times \text{Community Confirmations}) + (0.15 \times \text{Stagnation}) + (0.15 \times \text{Weather Hazard})$$
   *Full factor breakdown is visibly audited on every ticket.*
4. **Community Risk Timeline:** Correlates open drainage complaints with precipitation spikes to predict localized flash floods and culvert backflows.
5. **AI Community Summary:** Automated daily and weekly executive briefings highlighting regional pressure points.

### C. Administrator Command Centre & Volunteer Dispatch
- **Executive KPI Dashboard:** Real-time metrics on incoming stream, verified pipeline, resolution rates, and turnaround hours.
- **Visual Analytics:** Interactive Recharts category bars and weekly resolution line graphs.
- **Master Incident Triage Table:** Searchable, filterable by ward, category, and priority.
- **Volunteer Response Workflow:** Field teams view assigned coordinates, upload post-remediation completion photos, and mark tickets resolved.
- **One-Click CSV & Printable Brief:** Export official council reports in seconds.

---

## 4. 19 Implemented Application Views

1. **Landing Page (`/`):** Hero section, 5 civic questions, autonomous pipeline, impact stats, live demo launch.
2. **Citizen Registration:** Sign up with name, email, locality, and ward selection.
3. **Portal Login:** Authenticate with email/password + 1-click Quick Demo Credentials for judges.
4. **Citizen Dashboard:** Active ward incidents, personal impact tracker, and quick report submission.
5. **Submit New Report:** Photo evidence upload, map location picker, AI title suggestion, severity slider.
6. **Community Intelligence Map:** Full-screen Leaflet map, category filters, density circles, floating incident drawer.
7. **Incident Details Dossier:** Full lifecycle timeline, before & after photos, explainable formula breakdown, community confirmations upvote.
8. **My Reports:** Citizen tracking feed with live ticket status progression.
9. **Community Insights:** Transparency metrics (no unverified rumors presented as facts), participation scores.
10. **Community Risk Timeline:** Temporal hazard development, monsoon storm triggers, predictive flood warnings.
11. **NEXUS VOICE Assistant:** Spoken voice interface in Malayalam and English with speech-to-text.
12. **Notification Centre:** Real-time in-app alerts, unread badges, mark-all-read controls.
13. **Volunteer Dashboard:** Field response roster, completion photo upload, site inspection verification.
14. **Admin Command Centre:** Full municipal operations room with charts, triage roster, and daily AI summary.
15. **Incident Management:** Master registry table, duplicate cluster resolution, export to CSV.
16. **User Management:** Role-Based Access Control (RBAC) stakeholder directory.
17. **Analytics & Reports:** Official council printable executive briefing with charts and directives.
18. **Platform Settings:** Optional Google Gemini and Supabase API key inputs, demonstration mode toggles.
19. **About NEXUS:** Architecture documentation, Kerala testbed context, and explainable AI disclosure.

---

## 5. Live Demonstration Mode (Hackathon Showcase)

For hackathon judging, NEXUS includes a dedicated **"RUN LIVE INTELLIGENCE DEMO"** workflow:

Click the **"Live Demo"** button on the navbar or landing page to trigger the 9-step end-to-end showcase:
- **Step 1:** Loads baseline of 25+ realistic Kerala civic reports across 9 infrastructure categories.
- **Step 2:** AI classifies descriptions, translates Malayalam tokens, and estimates severity.
- **Step 3:** Discovers duplicate clusters within 400m radius using Haversine and Jaccard similarity.
- **Step 4:** Calculates transparent multi-factor priority scores with visible breakdown weights.
- **Step 5:** Plots incidents on OpenStreetMap with category-specific pins and priority color coding.
- **Step 6:** Triggers an 86.5 mm/hr Southwest Monsoon storm surge scenario.
- **Step 7:** Recalculates compound risk estimates, escalating flood warnings along Periyar Riverbank.
- **Step 8:** Generates an automated AI executive community summary.
- **Step 9:** Produces prioritized municipal inspection checklists and field team dispatch orders.

---

## 6. How to Run Locally

### Prerequisites:
- **Node.js** (v18+ recommended; tested on v26)
- **Python** (3.11 or 3.12; tested on Python 3.12.10)

### 1. Start FastAPI Backend:
```bash
cd backend
# Optional: create and activate virtual environment
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at: `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)*

### 2. Start React Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://127.0.0.1:5173` (or `http://127.0.0.1:5174` if port 5173 is busy)*

---

## 7. Demo Login Credentials (1-Click Switcher Available in UI)

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@nexus.gov.in` | `nexus2026` | Command Centre, Incident Triage, Duplicate Merge, Audit Logs |
| **Field Volunteer** | `volunteer@nexus.gov.in` | `nexus2026` | Task Roster, Remediation Completion Photo Upload, Mark Resolved |
| **Citizen** | `citizen@nexus.gov.in` | `nexus2026` | Problem Reporting, Voice Assistant, Upvote Confirmations, Track Reports |

*(Tip: You can switch roles instantly in the top navigation bar dropdown at any time without logging out!)*

---

## 8. Responsible AI & Data Disclosure
- All simulated weather events and demo scenarios are **visibly labelled** with badges.
- Predictive flood alerts are presented as **evidence-based risk estimates** with supporting observations, never subjective claims of certainty.
- Public citizen reports do not expose private phone numbers or personal email addresses.

---

*Developed for the National / Global Hackathon Circuit — NEXUS Civic Intelligence Network.*
