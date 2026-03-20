# Changelog

All notable changes to Role Raider will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-03-20

### Added
- **Web frontend** — React + Vite + Tailwind dark-theme UI with five pages: Dashboard,
  Jobs, Pipeline, Auto-Apply, Settings
- **FastAPI backend** — REST API wrapping the CLI; endpoints for stats, jobs, pipeline
  control, apply control, and settings management
- **Live log streaming** — SSE endpoint streams real-time output from pipeline and
  apply subprocesses to the browser with color-coded log viewer
- **Dashboard** — stat cards, score distribution bar chart, jobs-by-source breakdown;
  auto-refreshes only while a task is actively running (no idle polling)
- **Jobs table** — filterable by pipeline stage, min score slider, and search; click any
  row for a full detail panel with score reasoning, apply error, and direct apply link
- **Pipeline runner UI** — stage selector, workers/min-score/validation controls,
  dry-run toggle, Run/Stop buttons with live log output
- **Auto-Apply UI** — all apply options exposed (limit, workers, model, headless,
  dry-run, continuous, target URL); dry-run on by default for safety
- **Settings page** — API key manager (Gemini, OpenAI, NVIDIA NIM, CapSolver),
  searches.yaml editor, Doctor health check panel
- **NVIDIA NIM support hint** — Settings page documents using NVIDIA's free
  OpenAI-compatible API (`integrate.api.nvidia.com/v1`) as an alternative to Gemini
- **Task manager** — in-process subprocess registry with log buffering, SSE replay
  from any offset, and automatic eviction after 10 minutes
- **One-task-at-a-time enforcement** — backend returns 409 if pipeline or apply is
  already running

### Changed
- **Project renamed** from ApplyPilot to Role Raider throughout — all imports, module
  paths, CLI entry point (`role-raider`), env vars (`ROLE_RAIDER_DIR`), data directory
  (`~/.role_raider/`), and display strings updated
- **Attribution updated** — README credits cobalt-nitrate as maintainer, acknowledges
  Pickle-Pixel's original ApplyPilot as the upstream open-source foundation
- **Stats polling** — Dashboard only polls `/stats` while a pipeline/apply task is
  running; reverts to a single fetch on idle

### Fixed
- **CORS** — backend now allows both port 5173 and 5174 (Vite picks whichever is free)

## [0.2.0] - 2026-02-17

### Added
- **Parallel workers for discovery/enrichment** - `role_raider run --workers N` enables
  ThreadPoolExecutor-based parallelism for Workday scraping, smart extract, and detail
  enrichment. Default is sequential (1); power users can scale up.
- **Apply utility modes** - `--gen` (generate prompt for manual debugging), `--mark-applied`,
  `--mark-failed`, `--reset-failed` flags on `role_raider apply`
- **Dry-run mode** - `role_raider apply --dry-run` fills forms without clicking Submit
- **5 new tracking columns** - `agent_id`, `last_attempted_at`, `apply_duration_ms`,
  `apply_task_id`, `verification_confidence` for better apply-stage observability
- **Manual ATS detection** - `manual_ats` list in `config/sites.yaml` skips sites with
  unsolvable CAPTCHAs (e.g. TCS iBegin)
- **Qwen3 `/no_think` optimization** - automatically saves tokens when using Qwen models
- **`config.DEFAULTS`** - centralized dict for magic numbers (`min_score`, `max_apply_attempts`,
  `poll_interval`, `apply_timeout`, `viewport`)

### Fixed
- **Config YAML not found after install** - moved `config/` into the package at
  `src/role_raider/config/` so YAML files (employers, sites, searches) ship with `pip install`
- **Search config format mismatch** - wizard wrote `searches:` key but discovery code
  expected `queries:` with tier support. Aligned wizard output and example config
- **JobSpy install isolation** - removed python-jobspy from package dependencies due to
  broken numpy==1.26.3 exact pin in jobspy metadata. Installed separately with `--no-deps`
- **Scoring batch limit** - default limit of 50 silently left jobs unscored across runs.
  Changed to no limit (scores all pending jobs in one pass)
- **Missing logging output** - added `logging.basicConfig(INFO)` so per-job progress for
  scoring, tailoring, and cover letters is visible during pipeline runs

### Changed
- **Blocked sites externalized** - moved from hardcoded sets in launcher.py to
  `config/sites.yaml` under `blocked:` key
- **Site base URLs externalized** - moved from hardcoded dict in detail.py to
  `config/sites.yaml` under `base_urls:` key
- **SSO domains externalized** - moved from hardcoded list in prompt.py to
  `config/sites.yaml` under `blocked_sso:` key
- **Prompt improvements** - screening context uses `target_role` from profile,
  salary section includes `currency_conversion_note` and dynamic hourly rate examples
- **`acquire_job()` fixed** - writes `agent_id` and `last_attempted_at` to proper columns
  instead of misusing `apply_error`
- **`profile.example.json`** - added `currency_conversion_note` and `target_role` fields

## [0.1.0] - 2026-02-17

### Added
- 6-stage pipeline: discover, enrich, score, tailor, cover letter, apply
- Multi-source job discovery: Indeed, LinkedIn, Glassdoor, ZipRecruiter, Google Jobs
- Workday employer portal support (46 preconfigured employers)
- Direct career site scraping (28 preconfigured sites)
- 3-tier job description extraction cascade (JSON-LD, CSS selectors, AI fallback)
- AI-powered job scoring (1-10 fit scale with rationale)
- Resume tailoring with factual preservation (no fabrication)
- Cover letter generation per job
- Autonomous browser-based application submission via Playwright
- Interactive setup wizard (`role_raider init`)
- Cross-platform Chrome/Chromium detection (Windows, macOS, Linux)
- Multi-provider LLM support (Gemini, OpenAI, local models via OpenAI-compatible endpoints)
- Pipeline stats and HTML results dashboard
- YAML-based configuration for employers, career sites, and search queries
- Job deduplication across sources
- Configurable score threshold filtering
- Safety limits for maximum applications per run
- Detailed application results logging
