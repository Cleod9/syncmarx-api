# syncmarx-api

## What it does

This repo contains the Node.js backend API service required by the [syncmarx web extension](https://github.com/Cleod9/syncmarx-webext).

The production environment currently resides at [syncmarx.com](https://syncmarx.com). The API also has a front-end interface located under the `public/` folder that is shown at this domain.

## How to Run

### Running with Node.js:

First install latest version of [Node.js](https://nodejs.org/en/). Then run the following via command-line:

```bash
npm install
npm run start
```

### Running with Docker:

Install [Docker](https://www.docker.com/), then build and run:

```bash
docker compose build
docker compose up -d
```

The above will start a simple HTTP server listening for incoming requests based on the settings you provide in the `.env` file.

The syncmarx web extension utilizes this API in order to make the initial handshake required to obtain an API token for the desired third party service (Dropbox, Google Drive, Box, etc.).

When using in a production environment, make sure to place the app behind a secure HTTPS layer.
