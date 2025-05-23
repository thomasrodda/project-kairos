# Backend API Guide

> This guide explains how the backend API is structured and how to add or modify serverless functions in the project.

---

## Overview

The backend is built using **serverless functions** deployed on **Vercel**. Each function is modular, fast, and isolated. Functions live under `apps/api/` and follow a one-file-per-route structure.

---

## Folder Structure

```
apps/api/
├── hello.ts              # Example endpoint
├── auth/
│   └── login.ts          # /auth/login route
└── vercel.json           # Route configuration
```

Each `.ts` file is an individual HTTP endpoint. Folders represent route paths.

---

## How to Add a New Endpoint

1. Create a `.ts` file in `apps/api/`
2. Export a default function that handles the request and response
3. Name the file to match the route (e.g. `getUser.ts` = `/getUser`)
4. Use only minimal dependencies to reduce cold-start time

---

## Authentication

We use **Firebase Authentication** on the frontend. After logging in, the client sends the Firebase ID token to the backend.

On each API call:

- The backend receives the token in the `Authorization` header
- Verifies it using the Firebase Admin SDK
- Proceeds only if the token is valid

This protects all secure routes.

---

## Route Configuration

`vercel.json` can be used to configure routes, rewrites, or middleware if needed. For most basic cases, folder/file naming is sufficient.

---

## Testing API Routes

- Use tools like Postman or curl for manual testing
- Use integration tests to simulate requests and validate responses
- Keep tests simple, fast, and scoped to logic

---

## Best Practices

- Keep each function small and focused
- Validate request inputs before processing
- Return meaningful HTTP status codes and error messages
- Avoid unnecessary external dependencies
- Prefer JSON responses over HTML or plain text
