# 💊 MediVault

MediVault is a medicine-management and health-record application built with Node.js, Express, MongoDB, Mongoose, Passport.js and EJS.

## Features
- User registration, login and session-based authentication
- Medicine CRUD and medicine schedule management
- Prescription/medical record pages
- Server-rendered EJS interface

## Requirements
- Node.js 20 or 22
- MongoDB Atlas database (or another MongoDB deployment)

## Run locally
1. Clone the repository and enter the project directory.
2. Install dependencies: `npm ci`
3. Copy `.env.example` to `.env`.
4. Set `ATLASDB_URL` to your MongoDB connection string and set `SECRET` to a long random value.
5. Start the application: `npm start`
6. Open `http://localhost:3000`.

The application requires both `ATLASDB_URL` and `SECRET`. It starts listening only after the MongoDB connection succeeds.

## Deploy on Render
This repository includes a `render.yaml` Blueprint with the Node build/start commands and `/health` health-check endpoint. You can either create the service from the Blueprint or configure an existing Web Service with these settings:

- **Runtime:** Node
- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Health Check Path:** `/health`

Add these environment variables in Render (Dashboard → your service → Environment):

| Key | Value |
|---|---|
| `ATLASDB_URL` | Your MongoDB Atlas connection string |
| `SECRET` | A long, random session secret |
| `NODE_ENV` | `production` |
| `TRUST_PROXY` | `1` |
| `COOKIE_SECURE` | `1` |

In MongoDB Atlas, make sure the database user credentials are correct and the Network Access rules allow connections from Render. For initial troubleshooting, Atlas may temporarily allow `0.0.0.0/0`; restrict this when practical. Never commit `.env` or paste secrets into GitHub.

## Deployment troubleshooting
- `Missing ATLASDB_URL`: add the `ATLASDB_URL` environment variable in Render.
- `Missing SECRET`: add the `SECRET` environment variable in Render.
- `DB connection error`: verify the Atlas URI, database-user password (URL-encode special characters), and Atlas Network Access rules.
- `npm start` missing: ensure the latest commit containing this `package.json` is deployed.
- Visit `/health` after deployment; it returns HTTP 200 when the application and MongoDB connection are ready.
