Here is the **Git & GitHub Guide** draft based on your project structure and workflow goals:

---

### Git & GitHub Guide

> This guide defines how we use Git and GitHub for version control, collaboration, and code quality.

---

## Overview

We use **Git** for version control and **GitHub** for hosting our repository, managing branches, and reviewing code changes. Our workflow is designed to support solo development while preparing for future collaboration.

---

## Branching Strategy

We follow a simple and scalable branching model:

| Branch      | Purpose                                                 |
| ----------- | ------------------------------------------------------- |
| `main`      | Production-ready code only. Deployed to live app.       |
| `dev`       | Active development branch. Integrates all feature work. |
| `feature/*` | Individual features or fixes. Merged into `dev`.        |

**Example feature branches**:

* `feature/editor-blocks`
* `feature/oauth-login`
* `fix/sidebar-bug`

---

## Workflow

1. **Create a branch** off `dev`:

   ```bash
   git checkout dev
   git pull
   git checkout -b feature/my-feature
   ```

2. **Make changes** locally.

3. **Commit regularly**:

   * Commit when you've completed a small, meaningful chunk of work:

     * A new component
     * A bug fix
     * A completed unit of functionality (e.g. slash command works)
   * Avoid giant commits that combine unrelated changes.
   * Use clear, concise commit messages:

     * Format: `type: short description`

       * `feat:` = new feature
       * `fix:` = bug fix
       * `chore:` = cleanup/tooling
       * `docs:` = documentation only
     * Example:

       ```bash
       git commit -m "feat: add slash menu to editor blocks"
       ```

4. **Push your branch**:

   ```bash
   git push -u origin feature/my-feature
   ```

5. **Open a Pull Request**:

   * Target branch: `dev`
   * Use the PR template
   * Review your changes before submitting (self-check for clarity and scope)

6. **Merge** after review:

   * If needed, rebase to sync with `dev`:

     ```bash
     git checkout feature/my-feature
     git pull --rebase origin dev
     ```
   * Use "Squash & Merge" to combine commits into a single, clean commit

7. **Sync `main`** periodically:

   ```bash
   git checkout main
   git pull
   git merge dev
   git push
   ```

---

## Best Practices

* Keep commits small and focused — aim for 1 logical change per commit
* Sync with `dev` frequently to avoid big merge conflicts
* Use clear, consistent branch names: `feature/`, `fix/`, `chore/`
* Delete feature branches after merging to keep things tidy
* Never commit directly to `main`
* Add files to `.gitignore` to avoid committing build or sensitive files

---

## Pre-Commit Hooks (Optional)

We can use **Husky** + **lint-staged** to automate code checks before each commit:

* Format code with Prettier
* Lint with ESLint
* Optionally run tests

These checks will be configured in the `package.json` file during setup.
