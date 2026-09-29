# IPO Prospectus Evaluator - Analytics & Risk Intelligence

An institutional fund manager platform for automated IPO prospectus evaluation, financial metrics extraction, industry benchmark comparisons, AI sentiment & regulatory red flag analysis, and downloadable PDF reports.

---

## 🚀 Features

- **Multimodal Document OCR & Extraction**: Intelligent parser for diverse IPO prospectus layouts (Bursa Malaysia, US SEC Form S-1, HKEX, SGX), multi-column tables, and financial disclosures.
- **Financial Metrics & Benchmarks**: Real-time evaluation of Revenue CAGR, Gross Profit & PAT Margins, Current Ratio, Gearing, and Cash Conversion Cycle (CCC).
- **Regulatory Red Flag & Risk Audit**: Automated detection of customer concentration, promoter moratorium covenants, litigation, and IPO proceeds utilisation.
- **AI Sentiment & Hedging Ratio**: Multi-section linguistic sentiment analysis across Prospectus Risk Factors and MD&A.
- **Institutional PDF Report Generation**: One-click generation of audit-ready executive committee memoranda.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, jsPDF
- **Backend**: Express, Multer, Node.js Serverless runtime
- **AI / Multimodal OCR**: `@google/genai` (Gemini 3.8 Flash & failover pool)
- **Deployment**: Readily configured for Vercel and GitHub Actions

---

## 📦 Quick Start & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional for local mock/heuristic mode)
cp .env.example .env
# Set GEMINI_API_KEY="your-gemini-api-key"

# 3. Start development server (Port 3000)
npm run dev

# 4. Lint and verify types
npm run lint

# 5. Build for production
npm run build
```

---

## 🚢 Deploying to Vercel

This repository includes native Vercel configuration (`vercel.json`) and a serverless entrypoint (`api/index.ts`).

### Option A: Direct Git Integration (Recommended)
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your repository.
4. Set the Environment Variable:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
5. Click **Deploy**. Vercel will automatically build the static assets from `dist` and route `/api/*` requests to the serverless function.

### Option B: Deploy via GitHub Actions
A workflow is already configured in `.github/workflows/deploy-vercel.yml`.
To enable automatic deployments on push:
1. Add the following repository secrets under **Settings > Secrets and variables > Actions**:
   - `VERCEL_TOKEN`: Your Vercel Personal Access Token
   - `VERCEL_ORG_ID`: Your Vercel Organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel Project ID
2. Pushing to `main` will automatically build and deploy to Vercel production.

---

## 🤖 GitHub Actions CI

Continuous integration is pre-configured in `.github/workflows/ci.yml`:
- Runs typecheck and linting (`npm run lint`) across Node 20.x and 22.x
- Builds the Vite application (`npm run build`)
- Verifies build output (`dist/index.html`) on every push and pull request.

---

## 👤 Author & Credits

- **Author & Credits**: Ammar Thaqif (`ammarthaqif.ar@gmail.com`)
- **Application**: IPO Prospectus Evaluator - Analytics & Risk Intelligence

---

## ⚖️ Regulatory Disclosures & Compliance

- **Statutory Alignment**: Evaluated prospectuses follow listing standards established under Bursa Malaysia Listing Requirements and US SEC Form S-1 frameworks.
- **Institutional Disclaimer**: For accredited institutional investment committee review and financial research purposes only. Does not constitute an offer, solicitation, or personal investment advice.

