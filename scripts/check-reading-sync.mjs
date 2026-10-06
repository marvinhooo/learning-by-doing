// Browser regression: isolated profiles and a local fake cloud; no real accounts or network services.
// Requires Playwright; optionally set CHROME_EXECUTABLE to an installed browser.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = new URL("../", import.meta.url);
const rows = new Map();
const requests = [];
const gates = [];
const errors = [];
const copy = value => structuredClone(value);
const position = (id = "tokenization", lectureId = "l01", scrollRatio = .35, updatedAt = "2026-01-01T00:00:00.000Z") => ({
  view: "detail", detail: { type: "concept", id, lectureId }, scrollRatio, updatedAt
});
const seed = (uid, readingPosition = position(), extra = {}) => {
  const row = { state: { readingPosition, ...extra }, revision: (rows.get(uid)?.revision || 0) + 1 };
  rows.set(uid, row);return row;
};
function hold(device, op = "read") {
  let release, arrive;
  const gate = { device, op, blocked: new Promise(resolve => { release = resolve }), arrived: new Promise(resolve => { arrive = resolve }), release, arrive };
  gates.push(gate);return gate;
}
const fakeSdk = `window.supabase={createClient(){
  let session=window.testSession,listener=()=>{};
  return {auth:{getSession:async()=>({data:{session}}),onAuthStateChange(fn){listener=fn},
    async signInWithPassword({email}){session={user:{id:email,email}};listener('SIGNED_IN',session);return{data:{session}}},
    async signOut(){session=null;listener('SIGNED_OUT',null)}},
    from(){let op='read',payload=null,filters={};const query={
      select(){return query},eq(key,value){filters[key]=value;return query},
      update(value){op='update';payload=value;return query},insert(value){op='insert';payload=value;return query},
      async maybeSingle(){const response=await fetch('/test-cloud',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device:window.testDevice,op,payload,filters})});return response.json()}
    };return query}
  }
}};`;
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/test-cloud") {
      let body = "";for await (const chunk of req) body += chunk;
      const request = JSON.parse(body);requests.push(request);
      const uid = request.filters.user_id || request.payload?.user_id;
      let result;
      if (request.op === "read") result = { data: copy(rows.get(uid) || null) };
      const gateIndex = gates.findIndex(gate => gate.device === request.device && gate.op === request.op);
      if (gateIndex >= 0) { const [gate] = gates.splice(gateIndex, 1);gate.arrive();await gate.blocked }
      if (request.op !== "read") {
        const old = rows.get(uid);
        if (request.op === "insert" && old) result = { error: { code: "23505" } };
        else if (request.op === "update" && request.filters.revision !== old?.revision) result = { data: null };
        else { const row = { state: copy(request.payload.state), revision: (old?.revision || 0) + 1 };rows.set(uid, row);result = { data: { revision: row.revision } } }
      }
      res.setHeader("Content-Type", "application/json");res.end(JSON.stringify(result));return;
    }
    const files = { "/": "index.html", "/index.html": "index.html", "/i18n-en.js": "i18n-en.js", "/manifest.webmanifest": "manifest.webmanifest" };
    if (pathname === "/config.js") { res.setHeader("Content-Type", "text/javascript");res.end('window.CS336_CONFIG={supabaseUrl:"http://localhost",supabasePublishableKey:"test-only"}');return }
    if (pathname === "/vendor/supabase.js") { res.setHeader("Content-Type", "text/javascript");res.end(fakeSdk);return }
    if (!files[pathname] && !/^\/icons\/[\w.-]+$/.test(pathname)) { res.writeHead(404);res.end();return }
    res.setHeader("Content-Type", pathname.endsWith(".js") ? "text/javascript" : pathname.startsWith("/icons/") ? "image/png" : "text/html");
    res.end(await readFile(new URL(files[pathname] || pathname.slice(1), root)));
  } catch (error) { errors.push(error.message);res.writeHead(500);res.end("Test server failure") }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
async function device(name, uid, { hash = "", storage = {}, viewport = { width: 1280, height: 800 } } = {}) {
  const context = await browser.newContext({ serviceWorkers: "block", viewport, reducedMotion: "reduce" });
  await context.route("**/*", route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.addInitScript(({ name, uid, storage }) => {
    window.testDevice = name;window.testSession = uid ? { user: { id: uid, email: `${uid}@example.test` } } : null;
    for (const [key, value] of Object.entries(storage)) if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value));
  }, { name, uid, storage });
  const page = await context.newPage();page.on("pageerror", error => errors.push(`${name}: ${error.message}`));
  await page.goto(origin + "/" + hash);return page;
}
const ready = page => page.waitForFunction(() => cloud.client && !cloud.activating);
const settleScroll = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const state = page => page.evaluate(() => ({ route: routeKey(), position: user.readingPosition, displayed: displayedReadingPosition, meta: readSyncMeta(), uid: activeUserId, ratio: readingScrollRatio() }));
const check = (name, fn) => fn().then(() => console.log(`PASS ${name}`));
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_EXECUTABLE ? { executablePath: process.env.CHROME_EXECUTABLE } : {}) });
  // Resolve real IDs from the app instead of duplicating its course data.
  const guest = await device("catalog", null);await ready(guest);
  const catalog = await guest.evaluate(() => ({ first: LECTURE_GUIDES.l01.concepts[0], second: LECTURE_GUIDES.l02.concepts[0] }));
  const first = position(catalog.first), second = position(catalog.second, "l02", .6, "2026-02-01T00:00:00.000Z");
  const firstRoute = `detail/concept/${catalog.first}/l01`, secondRoute = `detail/concept/${catalog.second}/l02`;

  await check("new device restores concept, lecture context and scroll without stamping a new visit", async () => {
    seed("reader", first);
    const a = await device("desktop", "reader");await ready(a);await settleScroll(a);
    const saved = await state(a);assert.equal(saved.route, firstRoute);assert.deepEqual(saved.position, first);
    assert.ok(Math.abs(saved.ratio - first.scrollRatio) < .01);assert.equal(saved.meta.dirty, false);
    const b = await device("phone", "reader", { viewport: { width: 390, height: 844 } });await ready(b);await settleScroll(b);
    assert.equal((await state(b)).route, firstRoute);assert.ok(Math.abs((await state(b)).ratio - first.scrollRatio) < .01);
    assert.equal(await b.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await a.evaluate(({ id }) => navigate("detail", { type: "concept", id, lectureId: "l02" }), { id: catalog.second });
    await settleScroll(a);await a.evaluate(() => syncNow());
    await b.evaluate(() => refreshCloudState());await settleScroll(b);assert.equal((await state(b)).route, secondRoute);
    assert.equal((await state(b)).position.updatedAt, rows.get("reader").state.readingPosition.updatedAt);
    await a.context().close();await b.context().close();
  });
  await check("explicit deep link wins and persists on login", async () => {
    seed("linked", first);const page = await device("linked", "linked", { hash: "#" + secondRoute });await ready(page);
    assert.equal((await state(page)).route, secondRoute);await page.evaluate(() => syncNow());
    assert.equal(rows.get("linked").state.readingPosition.detail.id, catalog.second);await page.context().close();
  });
  await check("reloading an old device resumes the newer cloud page instead of restamping its old URL", async () => {
    seed("reload", first);const page = await device("reload", "reload");await ready(page);assert.equal((await state(page)).route, firstRoute);
    seed("reload", second);await page.reload();await ready(page);await settleScroll(page);
    assert.equal((await state(page)).route, secondRoute);assert.deepEqual((await state(page)).position, second);
    assert.deepEqual(rows.get("reload").state.readingPosition, second);assert.equal((await state(page)).meta.dirty, false);await page.context().close();
  });
  await check("legacy and malformed positions are safe; navigation alone creates a cloud row", async () => {
    const page = await device("empty", "empty");await ready(page);
    assert.equal(rows.has("empty"), false);assert.equal((await state(page)).position, null);
    assert.equal(await page.evaluate(() => [null, {}, { view: "detail", detail: { type: "__proto__", id: "x" }, updatedAt: "2026-01-01" }, { view: "detail", detail: { type: "lecture", id: "missing" }, updatedAt: "2026-01-01" }].every(value => normalizeReadingPosition(value) === null)), true);
    await page.evaluate(() => navigate("path"));await page.evaluate(() => syncNow());assert.equal(rows.get("empty").state.readingPosition.view, "path");
    await page.context().close();
  });
  await check("navigation while login is pending beats the incoming saved page", async () => {
    seed("slow-login", first);const gate = hold("slow-login");const page = await device("slow-login", "slow-login");await gate.arrived;
    await page.evaluate(() => navigate("labs"));gate.release();await ready(page);
    assert.equal((await state(page)).route, "labs");await page.evaluate(() => syncNow());assert.equal(rows.get("slow-login").state.readingPosition.view, "labs");await page.context().close();
  });
  await check("scroll while login is pending keeps the local reading position", async () => {
    seed("scroll-login", second);const gate = hold("scroll-login");
    const page = await device("scroll-login", "scroll-login", { storage: { "cs336-lernwerk-v2:scroll-login": { readingPosition: first } } });await gate.arrived;await settleScroll(page);
    await page.evaluate(() => { window.scrollTo({ top: (document.documentElement.scrollHeight-innerHeight)*.7, behavior: "instant" });window.dispatchEvent(new Event("scroll")) });
    gate.release();await ready(page);assert.equal((await state(page)).route, firstRoute);assert.ok((await state(page)).position.scrollRatio > .65);await page.context().close();
  });
  await check("navigation and pending scroll survive a delayed refresh", async () => {
    seed("refresh", first);const page = await device("refresh", "refresh");await ready(page);await settleScroll(page);
    seed("refresh", second);let gate = hold("refresh");await page.evaluate(() => { window.pendingRefresh = refreshCloudState() });await gate.arrived;
    await page.evaluate(() => navigate("assignments"));gate.release();await page.evaluate(() => window.pendingRefresh);
    assert.equal((await state(page)).route, "assignments");await page.evaluate(() => syncNow());
    await page.evaluate(({ id }) => navigate("detail", { type: "concept", id, lectureId: "l01" }), { id: catalog.first });await settleScroll(page);await page.evaluate(() => syncNow());
    seed("refresh", second);gate = hold("refresh");await page.evaluate(() => { window.pendingRefresh = refreshCloudState() });await gate.arrived;
    await page.evaluate(() => { window.scrollTo({ top: (document.documentElement.scrollHeight-innerHeight)*.7, behavior: "instant" });window.dispatchEvent(new Event("scroll")) });
    gate.release();await page.evaluate(() => window.pendingRefresh);assert.equal((await state(page)).route, firstRoute);assert.ok((await state(page)).position.scrollRatio > .65);
    await page.context().close();
  });
  await check("older overlapping refresh cannot roll back the newer response", async () => {
    seed("overlap", first);const page = await device("overlap", "overlap");await ready(page);
    seed("overlap", second);const gate = hold("overlap");await page.evaluate(() => { window.oldRefresh = refreshCloudState() });await gate.arrived;
    seed("overlap", { view: "labs", detail: null, scrollRatio: 0, updatedAt: "2026-03-01T00:00:00.000Z" });await page.evaluate(() => refreshCloudState());
    gate.release();await page.evaluate(() => window.oldRefresh);assert.equal((await state(page)).route, "labs");await page.context().close();
  });
  await check("offline navigation is retained and merges with remote notes on reconnect", async () => {
    seed("offline", first);const page = await device("offline", "offline");await ready(page);
    await page.context().setOffline(true);await page.evaluate(() => navigate("notes"));await page.evaluate(() => syncNow());assert.equal((await state(page)).meta.dirty, true);
    seed("offline", second, { notes: "Notes from another device" });await page.context().setOffline(false);
    await page.waitForFunction(() => !readSyncMeta().dirty && !cloud.syncing);
    assert.equal(rows.get("offline").state.readingPosition.view, "notes");assert.equal(rows.get("offline").state.notes, "Notes from another device");await page.context().close();
  });
  await check("failed revision update retries without discarding a newer remote position", async () => {
    seed("conflict", first);const page = await device("conflict", "conflict");await ready(page);
    await page.evaluate(() => { user.notes = "Local note";saveUser(true) });const gate = hold("conflict", "update");await page.evaluate(() => { window.pendingSync = syncNow() });await gate.arrived;
    seed("conflict", second, { bookmarks: ["concept:" + catalog.second] });gate.release();await page.evaluate(() => window.pendingSync);
    assert.equal(rows.get("conflict").state.readingPosition.detail.id, catalog.second);assert.equal(rows.get("conflict").state.notes, "Local note");assert.ok(rows.get("conflict").state.bookmarks.length);await page.context().close();
  });
  await check("account switch rejects a pending response from the previous session", async () => {
    seed("alice", first);seed("bob", second);const gate = hold("accounts");const page = await device("accounts", "alice");await gate.arrived;
    await page.evaluate(() => { activateGuest();window.loginBob = activateSessionUser({ user: { id: "bob" } }) });await page.evaluate(() => window.loginBob);gate.release();await ready(page);
    assert.equal((await state(page)).uid, "bob");assert.equal((await state(page)).route, secondRoute);
    await page.evaluate(() => { user.notes = "Bob local";saveUser(true) });const writeGate = hold("accounts", "update");await page.evaluate(() => { window.bobWrite = syncNow() });await writeGate.arrived;
    await page.evaluate(() => { activateGuest();window.loginAlice = activateSessionUser({ user: { id: "alice" } }) });await page.evaluate(() => window.loginAlice);writeGate.release();await page.evaluate(() => window.bobWrite);
    assert.equal((await state(page)).uid, "alice");assert.equal((await state(page)).route, firstRoute);assert.equal(await page.evaluate(() => user.notes), "");await page.context().close();
  });
  await check("login UI resumes saved reading and sign-out waits for pending changes", async () => {
    seed("login-ui", first);const page = await device("login-ui", null);await ready(page);
    await page.locator("#accountButton").click();await page.locator("#loginEmail").fill("login-ui@example.test");await page.locator("#loginPassword").fill("test-only");
    rows.set("login-ui@example.test", rows.get("login-ui"));await page.locator("#loginButton").click();await page.waitForFunction(() => activeUserId === "login-ui@example.test" && !cloud.activating);
    assert.equal((await state(page)).route, firstRoute);
    await page.evaluate(() => navigate("labs"));const gate = hold("login-ui", "update");await page.evaluate(() => { window.pendingWrite = syncNow() });await gate.arrived;
    await page.evaluate(() => navigate("notes"));await page.locator("#accountButton").click();await page.locator("#logoutButton").click();
    gate.release();await page.waitForFunction(() => activeUserId === null);await page.evaluate(() => window.pendingWrite);
    assert.equal(rows.get("login-ui@example.test").state.readingPosition.view, "notes");await page.context().close();
  });
  await check("browser history updates position and restored location stays stable", async () => {
    seed("history", first);const page = await device("history", "history");await ready(page);await settleScroll(page);
    await page.evaluate(() => navigate("labs"));await page.evaluate(() => navigate("notes"));await page.goBack();await page.waitForFunction(() => appState.view === "labs");
    assert.equal((await state(page)).position.view, "labs");await page.evaluate(() => syncNow());
    const before = (await state(page)).position.updatedAt;await page.evaluate(() => refreshCloudState());await settleScroll(page);assert.equal((await state(page)).position.updatedAt, before);
    await page.evaluate(() => setLanguage("de"));await page.evaluate(() => openAccount());assert.ok((await page.locator(".modal").innerText()).includes("Leseposition"));await page.context().close();
  });
  assert.deepEqual(errors, []);console.log(`Reading sync OK (${requests.length} local mock-cloud requests; no live credentials used)`);
} finally {
  for (const gate of gates) gate.release();
  await browser?.close();server.closeAllConnections();await new Promise(resolve => server.close(resolve));
}
