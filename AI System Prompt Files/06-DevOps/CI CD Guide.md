# CI/CD Guide

> This guide explains how Continuous Integration (CI) and Continuous Deployment (CD) are set up and used in the project. It ensures code quality and enables fast, safe deployment.

---

## Overview

We use **GitHub Actions** for our CI/CD pipeline. Every pull request runs automated checks, and successful merges to `main` can trigger deployment.

---

## What Happens on Each Push or PR

For every push or pull request:

- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests (Jest)
- End-to-end tests (Cypress)

These steps run automatically via GitHub Actions.

---

## Test Environments

We maintain two environments:

- **Development** (branch: `dev`) – used for staging and testing
- **Production** (branch: `main`) – stable and deployed to users

Merging to `main` represents a production-ready build.

---

## Deployment Targets

- **Frontend** and **Backend** are hosted on **Vercel**
- Vercel automatically deploys from branches or PRs for preview

---

## GitHub Actions Setup

GitHub Actions config lives in `.github/workflows/` and includes jobs for:

- Checking out code
- Installing dependencies
- Running linter, tests, and build
- Optionally deploying if branch = `main`

---

## Best Practices

- Keep `main` clean and always deployable
- Use `dev` for integrating feature branches
- Run all tests locally before pushing if possible
- Don’t bypass checks or force merges
