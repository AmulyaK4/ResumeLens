# ResumeLens — AI-Powered Resume Enhancer

A sleek, editorial-inspired resume enhancer that delivers expert-level, ATS-optimized feedback powered by **Groq's ultra-fast Llama 3 70B** model. Built with Next.js 14, Tailwind CSS, and deployed on Vercel.

---

## ✦ Features

| Feature | Status |
|---|---|
| Paste resume text for instant analysis | ✅ |
| PDF upload with automatic text extraction | ✅ |
| ATS compatibility score (0–100) | ✅ |
| Section-by-section breakdown with scores | ✅ |
| Missing keyword detection | ✅ |
| Quick wins (highest-impact changes) | ✅ |
| Formatting notes | ✅ |
| Rewrite examples per section | ✅ |
| Download analysis as .txt | ✅ |
| Responsive — mobile & desktop | ✅ |
| Loading states & error handling | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/resume-enhancer.git
cd resume-enhancer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your Groq API key:
# GROQ_API_KEY=gsk_your_key_here

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Key Setup

1. Visit [console.groq.com](https://console.groq.com)
2. Create a free account
3. Navigate to **API Keys** → **Create new key**
4. Copy the key into your `.env.local` file as `GROQ_API_KEY`

> ⚠️ **Never commit your API key.** The `.env.local` file is in `.gitignore` by default.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 |
| AI Model | Groq — Llama 3 70B (`llama3-70b-8192`) |
| AI SDK | `groq-sdk` |
| PDF Parsing | `pdf-parse` |
| File Upload | `react-dropzone` |
| Deployment | Vercel |
| Language | TypeScript |

---

## 📁 Project Structure

```
resume-enhancer/
├── app/
│   ├── api/
│   │   └── enhance/
│   │       └── route.ts       # Groq API integration + PDF parsing
│   ├── globals.css             # Editorial design system
│   ├── layout.tsx
│   └── page.tsx               # Main UI
├── components/
│   ├── ATSScoreRing.tsx        # Animated SVG score ring
│   └── ResultsPanel.tsx        # Analysis results display
├── lib/
│   └── types.ts               # TypeScript interfaces
├── .env.local.example
└── README.md
```

---

## 🎨 Design Decisions

**Editorial / Newspaper Aesthetic:** Inspired by broadsheet newspapers — Playfair Display for headlines, Libre Baskerville for body copy, DM Mono for data and labels. The paper-toned background (`#f5f2eb`) and gold accents create a premium, trustworthy feel appropriate for a career tool.

**No Generic AI Look:** Deliberately avoids the typical purple-gradient-on-white SaaS aesthetic. The design feels editorial and authoritative — fitting for a tool that's reviewing important professional documents.

**Structured JSON Prompting:** The AI is prompted to return strict JSON, enabling a rich tabbed UI that separates section scores, keyword gaps, and quick wins into digestible views — rather than dumping a wall of text.

**Groq for Speed:** Groq's inference is ~10× faster than OpenAI for equivalent models, which dramatically improves perceived quality. Users get results in under 10 seconds on average.

---

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# GROQ_API_KEY = your_key
```

Or connect your GitHub repo to Vercel and it will auto-deploy on every push.

---

## 📄 License

MIT — free to use, modify, and deploy.
