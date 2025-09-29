# VibeLoop Claude Code Permissions Configuration

## Overview

This project uses a **balanced permission model** that allows Claude to work
autonomously on code while requiring approval for potentially dangerous
operations.

## Permission Philosophy

**Autonomous Development Zone**: Claude can freely work within `src/`, `tests/`,
and `claudedocs/` directories.

**Safety Guardrails**: Critical operations require explicit approval to prevent
accidents.

## What's Allowed Without Approval

### ✅ File Operations

- **Read**: Any file in the project
- **Edit/Write**: Source code in `src/**` and `tests/**`
- **Search**: Glob and Grep throughout the project
- **Documentation**: Write analysis docs to `claudedocs/**`

### ✅ Development Commands

- `npm run lint` - Check code quality
- `npm run build` - Build the project
- `npm run test` - Run tests
- `npm run dev` - Start dev server
- `git status`, `git diff`, `git log`, `git branch` - Git inspection
- `git add`, `git commit` - Local git operations
- `git push` - Push to feature branches (main/master blocked by hook)

### ✅ GitHub CLI Commands

- `gh repo view` - View repository information
- `gh pr create` - Create pull requests
- `gh pr list` - List pull requests
- `gh pr view` - View pull request details
- `gh pr status` - Check PR status
- `gh pr checks` - View PR check status
- `gh issue list` - List issues
- `gh issue view` - View issue details
- `gh api repos/:owner/:repo/branches/:branch/protection` - View branch
  protection
- `gh api repos/:owner/:repo/rules/branches/:branch` - View repository rules

### ✅ Intelligent Tools

- **Task agent delegation** - Complex multi-step operations
- **TodoWrite** - Task tracking
- **WebSearch/WebFetch** - Documentation lookup
- **Playwright** - Browser automation (localhost only, 2min timeout)
- **MCP Servers**: Serena (code analysis), Context7 (docs), Sequential
  (reasoning), Magic (UI generation)

## What Requires Approval

### ⚠️ Risky Operations (Require Approval)

- `git merge`, `git rebase`, `git reset` - History modifications
- `npm install/uninstall` - Dependency changes (supply chain risk)
- Any command with `sudo`, `rm -rf`, `chmod`, `chown`
- Slash commands (`/sc:*`)

### 🚫 Explicitly Denied

- **Files**: `.env*`, `*secret*`, `*key*` files
- **Config Files**: `package.json`, `package-lock.json`, `tsconfig.json` (npm
  operations require approval)
- **Dangerous Commands**: `git push --force`, `git push -f`, direct push to
  main/master, `npm publish`, system-level operations

## Hooks & Validation

### Pre-Commit Hook

Before every `git commit`, automatically runs:

```bash
npm run lint
```

**Blocks commit if linting fails** - ensures code quality standards.

### Pre-Push Hook (Main Branch Protection)

Before every `git push`, automatically checks:

```bash
# Blocks if on main/master branch
git branch --show-current | grep -qE '^(main|master)$'
```

**Blocks push to main/master** - enforces feature branch workflow.

### Post-Install Hook

After `npm install/uninstall` (if approved), logs changes:

```bash
git diff package.json package-lock.json > /tmp/npm-changes.log
```

**Tracks dependency changes** - enables review of what was modified.

### Bash Command Logging

Every bash command shows:

```
🔍 Running: [command]
```

Provides visibility into what's being executed.

## Safety Limits

- **Max 50 files per operation** - Prevents accidental bulk operations
- **Max 1000 characters per bash command** - Prevents command injection
- **Bulk delete protection** - Requires approval for mass deletions

## Configuration Files

- **Project Settings**: `/Users/josh/projects/vibeloop/.claude/settings.json`
- **Global Settings**: `/Users/josh/.claude/settings.json`
- **Priority**: Project settings override global settings

## Usage Modes

### Default Mode (Current)

```bash
claude # Start with configured permissions
```

- Balanced autonomy with safety checks
- Prompts for risky operations
- Ideal for normal development

### Plan Mode (Read-Only)

```bash
claude --mode plan
```

- Analysis and planning only
- No file modifications
- Safe for exploration

### Bypass Mode (Use Cautiously)

```bash
claude --dangerously-skip-permissions
```

- No permission checks
- **Use only when necessary**
- Full trust mode

## Customization

### Allow More Commands

Edit `.claude/settings.json` and add to `Bash.allowedCommands`:

```json
"allowedCommands": [
  "npm run lint",
  "your-custom-command"
]
```

### Restrict More Paths

Add to `Write.deniedPaths`:

```json
"deniedPaths": [
  "/Users/josh/projects/vibeloop/critical-config.js"
]
```

### Change MCP Server Permissions

Modify `mcpServers` section:

```json
"playwright": {
  "rule": "Allow",  // Change from "Ask" to "Allow"
  "comment": "Browser automation allowed"
}
```

## Security Best Practices

1. **Review git commits** before pushing to remote
2. **Check bash commands** in the approval prompt
3. **Monitor file changes** with `git diff` regularly
4. **Keep secrets in .env** files (automatically protected)
5. **Use feature branches** for experimental work
6. **Test permission changes** in safe environments first

## Troubleshooting

### Claude asks for permission too often

- Increase allowed commands in `Bash.allowedCommands`
- Change specific tool rule from "Ask" to "Allow"

### Claude can't edit a file

- Check `Write.deniedPaths` and `Edit.deniedPaths`
- Verify file is within allowed paths
- Ensure file isn't in gitignore or protected

### Hook blocks all commits

- Review pre-commit hook in `hooks.beforeGitCommit`
- Fix linting errors: `npm run lint`
- Temporarily disable: set `enabled: false`

## Monitoring & Auditing

### Check What Claude Can Do

```bash
cat .claude/settings.json | grep -A 5 "rule"
```

### Review Recent Operations

```bash
git log --oneline -10  # Recent commits
git diff HEAD~1        # Last changes
```

### Test Permission Configuration

```bash
# Try a restricted command - should ask for approval
claude "run git push"

# Try an allowed command - should execute
claude "run npm run lint"
```

## Emergency Procedures

### Revoke All Permissions

```bash
rm .claude/settings.json
claude  # Will use default conservative permissions
```

### Restore Safe Defaults

```bash
git checkout .claude/settings.json
```

### Audit All Changes

```bash
git log --stat --oneline  # See all file changes
git diff origin/main      # Compare with remote
```

## Why npm install/uninstall Still Requires Approval

Despite enabling autonomous git push and browser automation, **npm operations
remain restricted** due to supply chain security risks:

### 🔴 Supply Chain Attack Risk

```
Scenario: Claude sees "Need date formatting"
  ↓
Searches npm, finds "moment-js"
  ↓
Accidentally types: npm install momment-js
  ↓
Typosquatted malicious package installed
  ↓
Postinstall script steals .env, git credentials, AWS keys
```

### Real Attack Vectors

1. **Typosquatting** - `reaktt`, `loadsh`, `momment-js` (intentional
   misspellings)
2. **Compromised maintainers** - Legitimate packages taken over
3. **Dependency confusion** - Internal package names hijacked
4. **Malicious updates** - Version bumps with embedded malware

### Additional Risks

- **Version conflicts** - Breaking changes in dependencies
- **License violations** - GPL code in proprietary project
- **Bundle bloat** - Unnecessary packages increasing size
- **Lock file conflicts** - Team sync issues with package-lock.json

### Mitigation

Requiring approval means:

- You review package name spelling
- You verify package legitimacy on npmjs.com
- You check download counts and maintenance status
- You approve license compatibility
- **5 seconds of review prevents hours of incident response**

### Alternative: If You Enable Auto-Approval

If you decide to allow npm operations without approval, consider:

1. Set up `npm audit` in pre-commit hook
2. Use `--package-lock-only` first to review changes
3. Enable Snyk or Socket.dev for supply chain monitoring
4. Review all package.json changes carefully in git diff
5. Use `npm ci` instead of `npm install` when possible

## Philosophy Notes

This configuration follows the principle of **least privilege with development
efficiency**:

- Allow common development operations
- Block potentially destructive actions
- Require approval for supply chain operations (npm)
- Protect sensitive files and configurations
- Enable autonomous work within safe boundaries

The goal: **Claude can develop effectively while you maintain control over
critical decisions.**
