# 🚆 Travel AI Bharat — Travelers Helping Travelers

<div align="center">

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19.0.1-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Powered_by-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Platform](https://img.shields.io/badge/Platform-Indian_Railways_&_Scenic_Corridors-00685f)](https://indianrail.gov.in)

**A decentralized, peer-to-peer travel community with zero commercial markups — anchored by Government ID verification, AI mediation, and scenic Indian Railways corridors.**

[Explore Live Demo](https://ais-pre-3lb3yiicfzpycdxvnjzs5i-576993278087.asia-southeast1.run.app) · [Report Bug](mailto:askrabindrajana@gmail.com) · [Request Feature](mailto:askrabindrajana@gmail.com)

</div>

---

## 📖 Table of Contents

- [Vision & Ethos](#-vision--ethos)
- [How It Works (Application Flow)](#-how-it-works-application-flow)
- [Key Features](#-key-features)
- [Scenic Corridors Spotlight](#-scenic-corridors-spotlight)
- [Demo Accounts](#-demo-accounts)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [API Reference](#-api-reference)
- [Security & UIDAI Privacy Commitment](#-security--uidai-privacy-commitment)
- [Author & Administrator](#-author--administrator)
- [License](#-license)

---

## 🌟 Vision & Ethos

**Travel AI Bharat** was built to dismantle the commercial tour operator model where travelers pay heavy markups for generic tourist traps. 

### Core Tenets:
1. **Travelers Helping Travelers**: Explorers connect directly with local hosts and fellow rail commuters for genuine, on-the-ground intelligence.
2. **Mutual Trust Anchored by Government IDs**: Users can upload official Indian credentials (Aadhaar, Passport, Voter ID, Driving License) to earn verified trust badges.
3. **AI as a Neutral Mediator**: Google Gemini AI parses train timings, local fare benchmarks, seasonal weather patterns, and custom budgets to construct optimal, day-by-day transit itineraries.
4. **No Middleman Markups**: ₹0 commissions. Homestays, train tickets, and guide tips are transacted peer-to-peer with total transparency.

---

## 🔄 How It Works (Application Flow)

```
┌────────────────────────────────────────────────────────┐
│                   Visitor Enters App                   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  PAGE 1: Hero Landing Page (First Fold)                │
│  · Peer travel philosophy & trust score                │
│  · Interactive live Planning Card preview              │
│  · Action CTAs: Log In, Sign Up, How It Works, Guest  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  PAGE 2: How It Works & Architecture (Second Fold)     │
│  · 4-Step mutual trust model                          │
│  · Scenic Indian Railways Corridors (Betla, Netarhat,  │
│    Kharagpur ➔ Medinipur)                             │
│  · Government ID Verification Badge system             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  PAGE 3: Dedicated Login & Password Sign-Up Section    │
│  · Email & Password Authentication                     │
│  · Password Strength Meter & Visibility Toggles        │
│  · 1-Click Demo Accounts (Admin Host & Traveler)       │
│  · 1-Click Google Sign-in / Guest Mode                │
└───────────────────────────┬────────────────────────────┘
                            │ (Successful Authentication)
                            ▼
┌────────────────────────────────────────────────────────┐
│  COMPREHENSIVE FOOTER & LOCKED APP ACCESS UNLOCKED!    │
│  ====================================================  │
│  🎒 Traveler Dashboard        🚆 AI Trip Planner       │
│  📖 Living Travel Journal     🤝 Mutual Planning Cards │
│  🗺️ Interactive Route Map     🏡 Rabindra Homestay Hub │
│  🎯 Goals 2027 & Badges       ⚙️ User Profile & Roles  │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. 🔐 Robust Authentication & Role-Based Access
- **Password Log In & Sign Up**: Full credential-based login with instant client validation, password confirmation, and password strength evaluation.
- **Password Visibility Toggles**: Inspect or conceal password strings securely.
- **Forgot Password Helper**: Integrated reset drawer with instant local credential updates.
- **Unified Traveler Account**: One account architecture with dynamic role switching between **Traveler (Explorer)**, **Certified Guider**, and **Administrator / Host**.
- **Session Persistence**: Persistent local authentication state across page reloads and browser sessions, with a clean log-out mechanism.

### 2. 🛡️ Government ID Verification System
- Supports 4 official Indian identification types:
  - **Aadhaar Card** (with first 8 digits masked for UIDAI compliance)
  - **Indian Passport** (Photo and authority page)
  - **Voter ID Card** (Permanent EPIC number)
  - **Driving License** (State Transport Authority)
- Admin verification queue reviewed directly by platform admin Rabindra Jana (`askrabindrajana@gmail.com`).

### 3. 🚆 AI Trip Planner (Powered by Google Gemini AI)
- Generates custom, day-by-day itineraries based on:
  - Origin & Destination
  - Duration (1 to 14 days)
  - Budget (in ₹ INR, $ USD, € EUR)
  - Transit preference (Express Rail, Local EMU/MEMU, Scenic Highway)
  - Travel party (Solo, Duo, Family, Rail Fans)
- Built-in timetable and fare estimations for major trains like **Rupashi Bangla Express (12883)**, **Aranyak Express (12885)**, and **Howrah-Medinipur Fast EMU**.
- **One-Click PDF Export**: Download formatted itineraries instantly with `jsPDF`.
- **Dynamic Packing Checklist**: Destination and weather-aware packing suggestions.

### 4. 📖 Living Travel Journal
- Record multi-day expeditions with photos, timestamps, transit routes, and expenditure logs.
- Share journal entries publicly or privately via unique shareable deep-links.
- "Verified Friend Tips" callout boxes for insider station advice.

### 5. 🤝 Mutual Community & Planning Cards
- Real-time exchange of trip planning cards between travelers.
- Inspect trust ratings, verification status, and recent corridor logs before meeting up.
- Community discussion board with zero spam and moderated comments.

### 6. 🗺️ Interactive Travel Map & Live Weather
- Visual SVG route map of Indian railway junctions, hill station loops, and forest reserves.
- Multi-day weather forecasts with humidity, precipitation, and optimal photography times.

### 7. 🏡 Local Host Homestay Portal
- Dedicated host profile for **Rabindra Jana** in Medinipur, West Bengal (10 mins from MDN railway station).
- View room availability, authentic Bengali homestyle meals, house rules, and local heritage guidance.

---

## 🛤️ Scenic Corridors Spotlight

| Corridor | Key Stations | Highlights | Recommended Train |
| :--- | :--- | :--- | :--- |
| **Cross-Kangsabati Corridor** | Kharagpur Jn (KGP) ➔ Medinipur (MDN) | 1,072m KGP rail platform, Kangsabati bridge crossing, Gopegarh Eco-Park, Battala Chhana-boda | Rupashi Bangla Express (12883) / Fast EMU |
| **Queen of Chotanagpur** | Ranchi Jn (RNC) ➔ Netarhat | Sunrise at Koel View Point, Upper Bazar Dhuska, pine forest canopy trails | Ranchi-Lohardaga Passenger + Hill Road |
| **Betla & Palamu Corridor** | Daltonganj (DTO) ➔ Betla National Park | Sal forest safari, 16th-century Chero dynasty Palamu Forts, wild elephant corridor | Shaktipunj Express (11448) |
| **Junglemahal Heritage Loop** | Medinipur ➔ Jhargram ➔ Belpahari | Royal Jhargram palace, Kanak Durga shrine, Dokra metalcraft artisans | Howrah-Ranchi Intercity Express |

---

## 🔑 Demo Accounts

Use these pre-configured credentials to test the platform instantly:

| Role | Email | Password | Name & Location | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Admin & Host** | `askrabindrajana@gmail.com` | `password123` | Rabindra Jana (Medinipur, WB) | ✅ **100% Govt ID Verified Host** |
| **Traveler** | `priya.traveler@gmail.com` | `password123` | Priya Sharma (New Delhi) | 🎒 Explorer Community Member |
| **Heritage Guider** | `subhashish.guider@travelai.in` | `password123` | Subhashish Roy (Kharagpur, WB) | 🏛️ Certified Heritage Guider |

> *Tip: On both the Landing Page and the Login Modal, click the **Demo Accounts** chips to autofill credentials with 1 tap.*

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (SPA with Vite 8)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict typing)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion (Framer Motion)](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/) & [Google Material Symbols Outlined](https://fonts.google.com/icons)
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF)

### Backend
- **Server**: [Express 4](https://expressjs.com/) on [Node.js](https://nodejs.org/)
- **Compiler/Dev Runner**: [tsx](https://github.com/privatenumber/tsx) & [esbuild](https://esbuild.github.io/)
- **Vite Integration**: Vite dev server mounted as middleware during local development

### AI & Intelligence
- **SDK**: [`@google/genai`](https://www.npmjs.com/package/@google/genai)
- **Model**: `gemini-flash-latest`
- **Fallback Engine**: Local procedural travel generation engine for zero-downtime offline execution

---

## 📂 Project Directory Structure

```
├── .env.example              # Environment variables template
├── metadata.json             # AI Studio applet capabilities & metadata
├── package.json              # Dependencies and build scripts
├── server.ts                 # Full-stack Express server & Gemini API endpoints
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite 8 configuration with Tailwind CSS v4
├── public/                   # Static assets & icons
└── src/
    ├── App.tsx               # Root component (Auth gating & route controller)
    ├── main.tsx              # React entry point
    ├── index.css             # Tailwind CSS v4 root stylesheet
    ├── types.ts              # Core domain TypeScript models & schemas
    ├── components/
    │   ├── LandingPage.tsx   # Comprehensive multi-fold Landing Page
    │   ├── AuthModal.tsx     # Dual-tab Password Login & Sign Up modal
    │   ├── Header.tsx        # Top navigation & user controls
    │   ├── Sidebar.tsx       # Responsive drawer navigation
    │   ├── TravelerDashboard.tsx # Primary traveler hub
    │   ├── TripPlanner.tsx   # Gemini AI Trip Planner & PDF export
    │   ├── MyTrips.tsx       # Saved itineraries & progress
    │   ├── TravelJournal.tsx # Living expedition log & photo archive
    │   ├── Community.tsx     # Mutual trust planning cards & forum
    │   ├── TravelMap.tsx     # Interactive Indian corridor map
    │   ├── HostDashboard.tsx # Rabindra Jana local homestay dashboard
    │   ├── GuiderDashboard.tsx # Certified tour guide dispatch hub
    │   ├── Achievements.tsx  # Gamified badges & distance miles
    │   ├── Goals2027.tsx     # 2027 travel milestones tracker
    │   ├── UserProfile.tsx   # Profile editor & verification manager
    │   ├── VerificationModal.tsx      # ID submission modal
    │   ├── AdminVerificationModal.tsx # Admin document audit queue
    │   └── Toast.tsx         # Notification alerts
    └── utils/
        ├── authStorage.ts    # User accounts, auth state, and seed data
        └── ...
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**
- *(Optional)* A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/travel-ai-bharat.git
cd travel-ai-bharat
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to configure your Gemini API Key (optional — offline local itinerary engine will function even without a key):
```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

### 6. Lint & Type Check
```bash
npm run lint
```

---

## ⚙️ Configuration & Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | API key for Gemini 1.5/2.0 Flash itinerary synthesis. If omitted, the app falls back to local high-precision corridor algorithms. |
| `APP_URL` | Optional | Base URL of the deployment (defaults to `http://localhost:3000`). |
| `PORT` | Optional | Server port (defaults to `3000`). |

---

## 📡 API Reference

The backend Express server (`server.ts`) exposes the following endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, server uptime, and Gemini AI status. |
| `GET` | `/api/gemini/status` | Verifies whether the `GEMINI_API_KEY` is loaded and active. |
| `POST` | `/api/generate-trip` | Generates a complete transit schedule, activities, and budget using Gemini AI or local corridor heuristics. |
| `POST` | `/api/chat` | AI travel advisor chatbot for scenic Indian corridors. |
| `GET` | `/api/weather` | Live weather condition simulation for regional railway hubs. |

---

## 🔒 Security & UIDAI Privacy Commitment

- **UIDAI Privacy Standard**: When users upload Aadhaar cards for identity verification, the first 8 digits are required to be masked, exposing only the last 4 digits.
- **Client-Side Safe Encryption**: Documents submitted for verification are stored locally in the traveler's sandbox storage and audited exclusively through the administrator desk.
- **Zero Third-Party Trackers**: No third-party data analytics, advertising SDKs, or data brokers are integrated into this platform.

---

## 👤 Author & Administrator

- **Founder & Administrator**: **Rabindra Jana**
- **Location**: Medinipur & Kharagpur, West Bengal, India
- **Email**: [askrabindrajana@gmail.com](mailto:askrabindrajana@gmail.com)
- **Role**: Platform Administrator & Verified Local Host Homestay Coordinator

---

## 📄 License

This project is licensed under the **Apache-2.0 License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Made with ❤️ for authentic Indian rail journeys and community trust.</sub>
</div>
