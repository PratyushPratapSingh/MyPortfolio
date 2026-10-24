# DevOps Resume Portfolio

A responsive, project-first portfolio for Pratyush Pratap Singh. It presents a concise professional introduction, AI agent development, the tools listed in the existing profile, and practical DevOps projects. Project cards show whether work is planned or in progress.

## Preview locally

This is a static HTML, CSS, and JavaScript site. No package installation, database, backend, or build step is required.

```bash
cd /home/github/MyPortfolio
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`.

## Portfolio sections

- **Introduction:** role, cloud infrastructure, CI/CD automation, observability, AI agent development, and links to GitHub.
- **Identity:** circular profile photo beside the name in the header and a self-contained circular monogram favicon.
- **About:** a short professional summary and LinkedIn link.
- **Toolkit:** profile-listed skills and separate technologies intended for portfolio projects.
- **LeetCode:** live problem totals by difficulty and the latest public attempt, with its problem link, status, attempted date, and a manual refresh.
- **Projects:** five cards covering CI/CD, cloud IaC, Kubernetes GitOps, observability, and AI agent development. The four DevOps cards link to their GitHub repositories; AI agent development is marked in progress.
- **Contact:** direct LinkedIn and GitHub links; no form or exposed contact-service key.

## Technology

- Semantic HTML5
- CSS with responsive layouts and reduced-motion support
- Vanilla JavaScript for the accessible mobile menu, current year, and LeetCode stats
- GitHub, LinkedIn, and LeetCode profile links
- LeetCode public profile stats via a community API (no credentials)

The current implementation deliberately has no server-side API, database, login, MCP connection, or third-party form integration. The LeetCode stats panel does make a public browser request to a community API; see [13.integrations.md](./13.integrations.md) for details. See [4.database.md](./4.database.md), [5.api.md](./5.api.md), [11.authentication-and-security.md](./11.authentication-and-security.md), and [12.mcp-connection.md](./12.mcp-connection.md) before adding other capabilities.

`assets/scss/styles.scss` is a legacy, uncompiled stylesheet; `assets/css/styles.css` is the stylesheet served by the page.

## Project documents

| # | Document | Purpose |
|---|---|---|
| 1 | [1.prd.md](./1.prd.md) | Product requirements |
| 2 | [2.design.md](./2.design.md) | Design system and responsive behavior |
| 3 | [3.architecture.md](./3.architecture.md) | Current system structure and boundaries |
| 4 | [4.database.md](./4.database.md) | Data needs and future persistence decision |
| 5 | [5.api.md](./5.api.md) | Current API surface and future guidance |
| 6 | [6.agents.md](./6.agents.md) | Contributor and AI-agent working guide |
| 7 | [README.md](./README.md) | Overview and local setup |
| 8 | [8.project-implementation.md](./8.project-implementation.md) | Implemented site features |
| 9 | [9.setup.md](./9.setup.md) | Development and publishing setup |
| 10 | [10.feature-development.md](./10.feature-development.md) | Prioritized feature roadmap |
| 11 | [11.authentication-and-security.md](./11.authentication-and-security.md) | Security boundaries and future auth |
| 12 | [12.mcp-connection.md](./12.mcp-connection.md) | MCP scope and safe future integration |
| 13 | [13.integrations.md](./13.integrations.md) | Current links and integration guidance |
| 14 | [14.testing-and-qa.md](./14.testing-and-qa.md) | Verification checklist |
| 15 | [15.debugging.md](./15.debugging.md) | Troubleshooting guide |

## Updating the portfolio

1. Replace the draft biography and skill list with verified resume details.
2. Add a project only after its implementation exists; include repository/demo links, your contribution, architecture, and evidence.
3. Add a resume PDF only after placing a reviewed, public-safe copy under `assets/`.
4. Keep credentials, private contact details, and unverified employer/project claims out of the repository.
5. Follow [10.feature-development.md](./10.feature-development.md) and verify changes using [14.testing-and-qa.md](./14.testing-and-qa.md).
