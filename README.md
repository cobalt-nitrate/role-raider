<!-- logo here -->

> **Role Raider** is maintained by [cobalt-nitrate](https://github.com/cobalt-nitrate). This project is a fork of the open-source [ApplyPilot](https://github.com/Pickle-Pixel/ApplyPilot) originally created by [Pickle-Pixel](https://github.com/Pickle-Pixel) — full credit to them for the foundation. We used [Claude Code](https://claude.ai/code) to tweak, enhance, and evolve the codebase, adding a full web UI and improving usability throughout.

# Role Raider

**Applied to 1,000 jobs in 2 days. Fully autonomous. Open source.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/cobalt-nitrate/role-raider?style=social)](https://github.com/cobalt-nitrate/role-raider)

---

## What It Does

Role Raider is a 6-stage autonomous job application pipeline. It discovers jobs across 5+ boards, scores them against your resume with AI, tailors your resume per job, writes cover letters, and **submits applications for you**. It navigates forms, uploads documents, and answers screening questions — all hands-free.

---

## Getting Started

### Option A — Web UI (recommended)

The web UI lets you configure everything and run the full pipeline from your browser. No terminal required after setup.

```bash
# 1. Install
pip install -e .
pip install --no-deps python-jobspy && pip install pydantic tls-client requests markdownify regex

# 2. Start the backend
cd web/backend && uvicorn main:app --reload

# 3. Start the frontend (separate terminal)
cd web/frontend && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the Settings page walks you through everything:
- **Profile** — fill in your personal info, compensation, experience, skills, and work authorization
- **Resume** — paste your resume text directly in the browser
- **Job Searches** — configure what roles and locations to target
- **API Keys** — set your Gemini (or OpenAI/NVIDIA) key and optional CapSolver key
- **Doctor** — verify your setup is ready to run

Once configured, go to the Pipeline page and hit Run.

### Option B — CLI only

```bash
pip install role_raider
pip install --no-deps python-jobspy && pip install pydantic tls-client requests markdownify regex
role_raider init          # one-time setup wizard
role_raider doctor        # verify your setup
role_raider run           # discover > enrich > score > tailor > cover letters
role_raider apply         # autonomous browser-driven submission
```

> **Why two install commands?** `python-jobspy` pins an exact numpy version in its metadata that conflicts with pip's resolver, but works fine at runtime. The `--no-deps` flag bypasses the resolver; the second command installs jobspy's actual runtime dependencies.

---

## Two Paths

### Full Pipeline (Tier 3)
**Requires:** Python 3.11+, Node.js 18+, Gemini API key (free), Claude Code CLI, Chrome

Runs all 6 stages, from job discovery to autonomous application submission.

### Discovery + Tailoring Only (Tier 1–2)
**Requires:** Python 3.11+, Gemini API key (free)

Runs stages 1–5: discovers jobs, scores them, tailors your resume, generates cover letters. You submit manually with the AI-prepared materials.

---

## The Pipeline

| Stage | What Happens |
|-------|-------------|
| **1. Discover** | Scrapes 5 job boards (Indeed, LinkedIn, Glassdoor, ZipRecruiter, Google Jobs) + 48 Workday employer portals + 30 direct career sites |
| **2. Enrich** | Fetches full job descriptions via JSON-LD, CSS selectors, or AI-powered extraction |
| **3. Score** | AI rates every job 1–10 based on your resume and preferences. Only high-fit jobs proceed |
| **4. Tailor** | AI rewrites your resume per job: reorganizes, emphasizes relevant experience, adds keywords. Never fabricates |
| **5. Cover Letter** | AI generates a targeted cover letter per job |
| **6. Auto-Apply** | Claude Code navigates application forms, fills fields, uploads documents, answers questions, and submits |

Each stage is independent. Run them all or pick what you need.

---

## Role Raider vs The Alternatives

| Feature | Role Raider | AIHawk | Manual |
|---------|-------------|--------|--------|
| Job discovery | 5 boards + Workday + direct sites | LinkedIn only | One board at a time |
| AI scoring | 1–10 fit score per job | Basic filtering | Your gut feeling |
| Resume tailoring | Per-job AI rewrite | Template-based | Hours per application |
| Auto-apply | Full form navigation + submission | LinkedIn Easy Apply only | Click, type, repeat |
| Web UI | Full browser-based interface | No | No |
| License | AGPL-3.0 | MIT | N/A |

---

## Requirements

| Component | Required For | Details |
|-----------|-------------|---------|
| Python 3.11+ | Everything | Core runtime |
| Node.js 18+ | Web UI + Auto-apply | Needed for frontend and `npx` to run Playwright MCP |
| Gemini API key | Scoring, tailoring, cover letters | Free tier (15 RPM / 1M tokens/day) is enough |
| Chrome/Chromium | Auto-apply | Auto-detected on most systems |
| Claude Code CLI | Auto-apply | Install from [claude.ai/code](https://claude.ai/code) |

**Gemini API key is free.** Get one at [aistudio.google.com](https://aistudio.google.com). OpenAI and local models (Ollama/llama.cpp via OpenAI-compatible endpoint) are also supported.

**NVIDIA NIM** — Free OpenAI-compatible API at `https://integrate.api.nvidia.com/v1`. Get a key at [build.nvidia.com](https://build.nvidia.com), set `LLM_URL` to the NVIDIA endpoint and `LLM_MODEL` to your chosen model in Settings → API Keys.

### Optional

| Component | What It Does |
|-----------|-------------|
| CapSolver API key | Solves CAPTCHAs during auto-apply (hCaptcha, reCAPTCHA, Turnstile, FunCaptcha). Without it, CAPTCHA-blocked applications fail gracefully |

---

## Configuration

All config lives in `~/.role_raider/`. The web UI Settings page edits all of these for you.

### `profile.json`
Your personal data: contact info, work authorization, compensation, experience, skills, resume facts (preserved during tailoring), and EEO defaults. Powers scoring, tailoring, and form auto-fill.

### `searches.yaml`
Job search queries, target titles, locations, boards. Run multiple searches with different parameters.

### `.env`
API keys and runtime config: `GEMINI_API_KEY`, `LLM_MODEL`, `CAPSOLVER_API_KEY` (optional), `LLM_URL` (for OpenAI-compat or NVIDIA NIM).

### Package configs (shipped with Role Raider)
- `config/employers.yaml` — Workday employer registry (48 preconfigured)
- `config/sites.yaml` — Direct career sites (30+), blocked sites, base URLs, manual ATS domains
- `config/searches.example.yaml` — Example search configuration

---

## How Stages Work

### Discover
Queries Indeed, LinkedIn, Glassdoor, ZipRecruiter, Google Jobs via JobSpy. Scrapes 48 Workday employer portals (configurable in `employers.yaml`). Hits 30 direct career sites with custom extractors. Deduplicates by URL.

### Enrich
Visits each job URL and extracts the full description. 3-tier cascade: JSON-LD structured data → CSS selector patterns → AI-powered extraction for unknown layouts.

### Score
AI scores every job 1–10 against your profile. 9–10 = strong match, 7–8 = good, 5–6 = moderate, 1–4 = skip. Only jobs above your threshold proceed to tailoring.

### Tailor
Generates a custom resume per job: reorders experience, emphasizes relevant skills, incorporates keywords from the job description. Your `resume_facts` (companies, projects, metrics) are preserved exactly — the AI reorganizes but never fabricates.

### Cover Letter
Writes a targeted cover letter per job referencing the specific company, role, and how your experience maps to their requirements.

### Auto-Apply
Claude Code launches a Chrome instance, navigates to each application page, detects the form type, fills personal information and work history, uploads the tailored resume and cover letter, answers screening questions with AI, and submits. The Playwright MCP server is configured automatically per worker — no manual MCP setup needed.

```bash
# Utility modes (no Chrome/Claude needed)
role_raider apply --mark-applied URL    # manually mark a job as applied
role_raider apply --mark-failed URL     # manually mark a job as failed
role_raider apply --reset-failed        # reset all failed jobs for retry
role_raider apply --gen --url URL       # generate prompt file for manual debugging
```

---

## CLI Reference

```
role_raider init                         # First-time setup wizard
role_raider doctor                       # Verify setup, diagnose missing requirements
role_raider run [stages...]              # Run pipeline stages (or 'all')
role_raider run --workers 4              # Parallel discovery/enrichment
role_raider run --stream                 # Concurrent stages (streaming mode)
role_raider run --min-score 8            # Override score threshold
role_raider run --dry-run                # Preview without executing
role_raider run --validation lenient     # Relax validation (recommended for Gemini free tier)
role_raider run --validation strict      # Strictest validation (retries on any banned word)
role_raider apply                        # Launch auto-apply
role_raider apply --workers 3            # Parallel browser workers
role_raider apply --dry-run              # Fill forms without submitting
role_raider apply --continuous           # Run forever, polling for new jobs
role_raider apply --headless             # Headless browser mode
role_raider apply --url URL              # Apply to a specific job
role_raider status                       # Pipeline statistics
role_raider dashboard                    # Open HTML results dashboard
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and PR guidelines.

---

## License

Role Raider is licensed under the [GNU Affero General Public License v3.0](LICENSE).

You are free to use, modify, and distribute this software. If you deploy a modified version as a service, you must release your source code under the same license.
