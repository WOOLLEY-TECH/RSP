#!/usr/bin/env node
/**
 * One-time helper: get a Gmail OAuth refresh token for the RSVP sender account.
 *
 * Usage:  node scripts/get-gmail-token.mjs
 *
 * Reads GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_USER from .env.local,
 * prints a consent URL to open in your browser, waits for the callback on
 * http://localhost:8788, then writes the refresh token back to .env.local.
 */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function saveEnv(path, entries) {
  const existing = existsSync(path) ? readFileSync(path, "utf8").split(/\r?\n/) : [];
  const seen = new Set();
  const lines = [];
  for (const line of existing) {
    const key = line.match(/^\s*([A-Z0-9_]+)/i)?.[1];
    if (key && entries[key]) {
      lines.push(`${key}=${entries[key]}`);
      seen.add(key);
      delete entries[key];
    } else {
      lines.push(line);
    }
  }
  for (const [key, value] of Object.entries(entries)) {
    lines.push(`${key}=${value}`);
  }
  writeFileSync(path, lines.join("\n") + "\n");
}

const env = loadEnv(envPath);
const clientId = process.env.GMAIL_CLIENT_ID || env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET || env.GMAIL_CLIENT_SECRET;
const user = process.env.GMAIL_USER || env.GMAIL_USER;

if (!clientId || !clientSecret || !user) {
  console.error(
    "Missing GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET or GMAIL_USER (set them in .env.local first).",
  );
  process.exit(1);
}

const PORT = 8788;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = "https://www.googleapis.com/auth/gmail.send";

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

console.log("");
console.log("1. Open this URL in your browser:");
console.log(authUrl);
console.log("");
console.log(`2. Sign in as ${user}, approve access, and wait here.`);
console.log("");

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

  if (url.pathname !== "/") {
    res.end("Unexpected path. Close this tab and re-run the script.");
    return;
  }

  const error = url.searchParams.get("error");
  if (error) {
    res.end(`<h1>Authorization failed</h1><p>${error}</p>Close this tab and try again.`);
    server.close();
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.end("<h1>Missing auth code. Close this tab and re-run the script.</h1>");
    server.close();
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokenJson = await tokenRes.json();

    if (!tokenJson.refresh_token) {
      res.end(
        "<h1>No refresh token returned</h1><p>" +
          (tokenJson.error_description ?? JSON.stringify(tokenJson)) +
          "</p><p>Close and run the script again.</p>",
      );
      console.error("Token response:", tokenJson);
      server.close();
      return;
    }

    saveEnv(envPath, {
      GMAIL_USER: user,
      GMAIL_CLIENT_ID: clientId,
      GMAIL_CLIENT_SECRET: clientSecret,
      GMAIL_REFRESH_TOKEN: tokenJson.refresh_token,
    });

    console.log("");
    console.log("Refresh token saved to .env.local:");
    console.log("GMAIL_REFRESH_TOKEN=" + tokenJson.refresh_token);
    console.log("");
    console.log(
      "Next: add GMAIL_USER / GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN to your Vercel project (Settings > Environment Variables).",
    );

    res.end("<h1>Success!</h1><p>Refresh token saved to .env.local.</p>You can close this tab.");
    server.close();
  } catch (err) {
    console.error("Token exchange failed:", err);
    res.end("<h1>Token exchange failed</h1><p>See the terminal for details.</p>");
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`Waiting for the browser callback on ${REDIRECT_URI} ...`);
});