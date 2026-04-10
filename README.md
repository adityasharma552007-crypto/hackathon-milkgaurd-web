# 🥛 MilkGuard — Safe Milk. Scanned in Seconds.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/Groq-AI_Engine-f3d03b?style=flat-square)](https://groq.com/)

**MilkGuard** is a sophisticated IoT-integrated web application designed to detect milk adulteration in seconds using NIR (Near-Infrared) spectral analysis. Built for families and food safety enthusiasts in India, it brings laboratory-grade testing to the palm of your hand.

---

## 🚀 Tech Stack

### 🎨 Frontend (Modern & Responsive)
*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router) for Server-Side Rendering and optimized performance.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) for type-safe development.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and rapid UI development.
*   **Components:** [Radix UI](https://www.radix-ui.com/) primitives (Shadcn UI pattern) for accessible, high-quality UI components.
*   **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth, premium micro-animations and transitions.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) for lightweight, performant global state handling.
*   **Icons:** [Lucide React](https://lucide.dev/) for a clean, consistent iconography system.
*   **Data Visualization:** [Recharts](https://recharts.org/) for rendering NIR spectral data and historical safety trends.
*   **Mapping:** [Leaflet](https://leafletjs.com/) for visualizing regional adulteration statistics.

### ⚡ Backend & Infrastructure
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (via Supabase) for robust data persistence.
*   **Authentication:** [Supabase Auth](https://supabase.com/auth) for secure user management and social logins.
*   **Realtime:** [Supabase Realtime](https://supabase.com/realtime) (WebSockets) for instant syncing between IoT hardware and the web dashboard.
*   **Serverless Functions:** Next.js API Routes for backend logic and AI orchestration.

### 🧠 Intelligence & Reports
*   **AI Engine:** [Groq SDK](https://groq.com/) integration providing lightning-fast LLM responses to explain adulteration results and safety scores.
*   **Validation:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) for rigorous client-side and server-side data validation.
*   **PDF Generation:** [@react-pdf/renderer](https://react-pdf.org/) for generating downloadable milk safety reports.

### 📡 IoT / Hardware Integration
*   **Device:** ESP8266 / ESP32 based **MilkGuard Pod**.
*   **Sensors:** NIR Spectral Sensors (18 wavelengths).
*   **Communication:** WebSocket-based real-time data transmission for "Scan-to-Cloud" functionality.

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js 18.x or later
*   npm or pnpm
*   A Supabase project
*   Groq AI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/milkguard-web.git
   cd milkguard-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🏥 Compliance & Standards
MilkGuard compares all detected samples against **FSSAI (Food Safety and Standards Authority of India)** 2025-26 safety limits to ensure legal and health compliance.

---

## 🔒 Security
*   Row Level Security (RLS) enabled on all Supabase tables.
*   Protected API routes with middleware-based authentication.
*   Encrypted data transmission via HTTPS/WSS.

---

Built with ❤️ for a Healthier India 🇮🇳
