# syncmarx-api

## What it does

This repo contains the Node.js backend API service required by the [syncmarx web extension](https://github.com/Cleod9/syncmarx-webext).

The production environment currently resides at [syncmarx.gregmcleod.com](https://syncmarx.gregmcleod.com). The API also has a front-end interface located under the `public/` folder that is shown at this domain.

## How to Run

First install latest version of [Node.js](https://nodejs.org/en/). Then run the following via command-line:

```bash
npm install
npm run start
```

This will start a simple HTTP server listening for incoming requests based on the settings you provide in the `config/default.yaml` (or `config/[NODE_ENV].yaml` if you supply a custom `NODE_ENV` environment variable).

The syncmarx extension utilizes this API in order to make the initial handshake require to obtain an API token for the desired third party service (Dropbox, Google Drive, Box, etc.).

When using in a production environment, make sure to place the app behind a secure HTTPS layer using a proxy.
