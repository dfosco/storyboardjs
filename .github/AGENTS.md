## General instructions

- Before running any other instruction, evaluate if the user prompt contains a trigger for one or more skills in ${skills-folder}.

- 
---

## Skills

- **Playwright CLI** (`skills/playwright-cli/playwright-cli.md`) — Uses Playwright to open a real browser, let the user handle authentication, and capture a page's HTML. The captured HTML is simplified and returned as structural context to help identify components and page layout. Invoke with: a URL alongside a "build this" request, "capture this page", "open this URL", "get the HTML from this page".

- **Vitest** (`skills/vitest/SKILL.md`) — Vitest testing framework reference with Jest-compatible API. Use when writing tests, mocking, configuring coverage, or working with test filtering and fixtures. Includes detailed references in `skills/vitest/references/`.

- **Shadow Clone** (`skills/shadow-clone/SKILL.md`) — Analyzes a source repository and generates planning documents for re-implementation in any language or stack. Invoke with: "shadow clone", "clone the architecture of", "re-implement", "port", or "replicate".

- **Architecture Scanner** (`skills/architecture-scanner/architecture-scanner.md`) — Scans the codebase and generates architecture documentation in `.github/architecture/`. Invoke with: "scan the codebase architecture", "update the architecture", "update arch".

- **Worktree** (`skills/worktree/worktree.md`) — Creates a git worktree in `.worktrees/<branch-name>` and switches into it. Invoke with: "create worktree", "worktree for X", or just "worktree X".

- **Changeset** (`skills/changeset/changeset.md`) — Guides through the changesets versioning workflow using `@changesets/cli` — from creating a changeset file to bumping the version, updating the changelog, creating a git tag, committing, and optionally publishing to npm. Invoke with: "bump version", "create changeset", "release a new version", "changeset", "publish".

- **Lateral Thinking** (`skills/lateral-thinking/SKILL.md`) — Contextual skill that activates automatically when a debugging session shows signs of tunnel vision (3+ rounds without resolution, repeated failed attempts, frustration cues). Pauses the deep-dive and systematically checks layers that haven't been examined: environment/system settings, tooling/config, framework/runtime, then code. **No manual trigger — fires on recognition patterns.**

- **Storyboard Data** (`skills/storyboard/SKILL.md`) — Guides creation of data objects, scene files, and record collections for storyboard pages. Determines what data should be externalized into the Storyboard data system vs. hardcoded in the component. Invoke with: "create scene data", "set up storyboard data", "create new page", "create new route".

- **Update Storyboard** (`skills/update-storyboard/SKILL.md`) — Updates all `@dfosco/storyboard-*` packages (`core`, `react`, `react-primer`, `react-reshaped`) together to the same version. Invoke with: `npm run update:storyboard`.