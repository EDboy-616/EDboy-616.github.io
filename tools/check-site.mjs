import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  "index.html",
  "404.html",
  "projects/finance-daily-v5.html",
  "projects/work-companion.html",
  "projects/localotp.html",
  "projects/tiny-ledger.html",
];

const expectedCanonical = new Map([
  ["index.html", "https://EDboy-616.github.io/"],
  ["projects/finance-daily-v5.html", "https://EDboy-616.github.io/projects/finance-daily-v5.html"],
  ["projects/work-companion.html", "https://EDboy-616.github.io/projects/work-companion.html"],
  ["projects/localotp.html", "https://EDboy-616.github.io/projects/localotp.html"],
  ["projects/tiny-ledger.html", "https://EDboy-616.github.io/projects/tiny-ledger.html"],
]);

const expectedNavigation = new Map([
  ["projects/finance-daily-v5.html", { prev: null, next: "localotp.html", index: true }],
  ["projects/localotp.html", { prev: "finance-daily-v5.html", next: "tiny-ledger.html", index: false }],
  ["projects/tiny-ledger.html", { prev: "localotp.html", next: "work-companion.html", index: true }],
  ["projects/work-companion.html", { prev: "tiny-ledger.html", next: null, index: true }],
]);

const errors = [];
const warnings = [];
const assetVersions = new Map();

function fail(page, message) {
  errors.push(`${page}: ${message}`);
}

function warn(page, message) {
  warnings.push(`${page}: ${message}`);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(relativePath, "文件不存在");
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function resolveLocalReference(page, reference) {
  const clean = reference.split("#")[0].split("?")[0];
  if (!clean || clean.startsWith("#")) return null;
  if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(clean)) return null;
  if (clean.startsWith("/")) return clean.slice(1);
  return path.posix.normalize(path.posix.join(path.posix.dirname(page), clean));
}

function checkLocalReferences(page, html) {
  const references = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    const resolved = resolveLocalReference(page, reference);
    if (!resolved) continue;
    if (!fs.existsSync(path.join(root, resolved))) {
      fail(page, `本地资源不存在：${reference} -> ${resolved}`);
    }
  }
}

function checkIdsAndLabels(page, html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) fail(page, `重复 ID：${[...new Set(duplicates)].join(", ")}`);

  const idSet = new Set(ids);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    if (!idSet.has(match[1])) fail(page, `页内锚点无目标：#${match[1]}`);
  }
  for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
    if (!idSet.has(match[1])) fail(page, `aria-controls 无目标：${match[1]}`);
  }
  for (const match of html.matchAll(/<label[^>]+for="([^"]+)"/g)) {
    if (!idSet.has(match[1])) fail(page, `label for 无目标：${match[1]}`);
  }
}

function checkSeo(page, html) {
  const canonical = [...html.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g)].map((match) => match[1]);
  const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html);

  if (page === "404.html") {
    if (canonical.length) fail(page, "404 不应包含 canonical");
    if (!noindex) fail(page, "404 必须保留 noindex");
    return;
  }

  const expected = expectedCanonical.get(page);
  if (!expected) fail(page, "缺少 canonical 预期规则");
  else if (canonical.length !== 1 || canonical[0] !== expected) {
    fail(page, `canonical 应为 ${expected}，实际为 ${canonical.join(", ") || "无"}`);
  }
  if (noindex) fail(page, "可索引页面不应包含 noindex");
}

function checkDocumentBasics(page, html) {
  if (!/<html[^>]+lang="zh-CN"/i.test(html)) fail(page, "缺少 lang=\"zh-CN\"");
  if (!/<meta[^>]+name="viewport"/i.test(html)) fail(page, "缺少 viewport");
  const h1Count = (html.match(/<h1\b/g) || []).length;
  if (h1Count !== 1) fail(page, `应恰好有一个 h1，实际 ${h1Count}`);
}

function checkAssetVersions(page, html) {
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+\.(?:css|js))(?:\?v=([^"]+))?"/g)) {
    const asset = match[1].replace(/^\//, "");
    const version = match[2] || "";
    if (!assetVersions.has(asset)) assetVersions.set(asset, new Map());
    const byPage = assetVersions.get(asset);
    if (!byPage.has(version)) byPage.set(version, []);
    byPage.get(version).push(page);
  }
}

function checkExternalAssets(page, html) {
  for (const match of html.matchAll(/\b(?:src|href)="(https?:\/\/[^"]+\.(?:css|js|png|jpe?g|webp|svg|woff2?))(?:\?[^"]*)?"/g)) {
    fail(page, `不应依赖外部静态资源：${match[1]}`);
  }
}

function checkDetailNavigation(page, html) {
  const expected = expectedNavigation.get(page);
  if (!expected) return;
  const nav = html.match(/<nav[^>]+class="[^"]*postnav[^"]*"[\s\S]*?<\/nav>/i)?.[0] || "";
  if (!nav) {
    fail(page, "缺少 .postnav 项目导览");
    return;
  }

  const relNext = [...nav.matchAll(/<a[^>]+rel="next"[^>]+href="([^"]+)"/g)].map((match) => match[1]);
  const relPrev = [...nav.matchAll(/<a[^>]+rel="prev"[^>]+href="([^"]+)"/g)].map((match) => match[1]);
  const hasIndex = /<a[^>]+href="\/#projects"/.test(nav);

  if (expected.next === null && relNext.length) fail(page, "不应存在 rel=\"next\"");
  if (expected.next !== null && (relNext.length !== 1 || path.posix.basename(relNext[0]) !== expected.next)) {
    fail(page, `rel=\"next\" 应指向 ${expected.next}，实际为 ${relNext.join(", ") || "无"}`);
  }
  if (expected.prev === null && relPrev.length) fail(page, "不应存在 rel=\"prev\"");
  if (expected.prev !== null && (relPrev.length !== 1 || path.posix.basename(relPrev[0]) !== expected.prev)) {
    fail(page, `rel=\"prev\" 应指向 ${expected.prev}，实际为 ${relPrev.join(", ") || "无"}`);
  }
  if (hasIndex !== expected.index) fail(page, `index 导览应为 ${expected.index}，实际为 ${hasIndex}`);
}

function checkStaleMarkup(html) {
  const stale = [
    'id="focus"',
    'href="#focus"',
    'id="stack"',
    'href="#stack"',
    'id="method"',
    'href="#method"',
    "三态配色",
    "自动 · 浅",
    "深色模式",
    "risk-list",
  ];
  for (const term of stale) {
    if (html.includes(term)) fail("HTML", `包含过期术语：${term}`);
  }
}

for (const page of pages) {
  const html = read(page);
  if (!html) continue;
  checkDocumentBasics(page, html);
  checkSeo(page, html);
  checkIdsAndLabels(page, html);
  checkLocalReferences(page, html);
  checkAssetVersions(page, html);
  checkExternalAssets(page, html);
  checkDetailNavigation(page, html);
  checkStaleMarkup(html);
}

for (const [asset, byVersion] of assetVersions) {
  if (byVersion.size > 1) {
    const detail = [...byVersion.entries()].map(([version, pageList]) => `${version || "无版本"}: ${pageList.join(", ")}`).join("；");
    fail(asset, `缓存版本不一致：${detail}`);
  }
}

const svgDir = path.join(root, "assets", "img");
const svgFiles = fs.existsSync(svgDir) ? fs.readdirSync(svgDir).filter((file) => file.endsWith(".svg")) : [];
const staleSvgTerms = ["focus", "stack", "method", "三态", "自动", "深色", "dark", "theme", "localStorage", "配色", "risk-list"];
for (const file of svgFiles) {
  const svg = fs.readFileSync(path.join(svgDir, file), "utf8");
  for (const term of staleSvgTerms) {
    if (svg.includes(term)) fail(`assets/img/${file}`, `包含过期术语：${term}`);
  }
}

const feed = read("feed.xml");
if (feed) {
  const feedContent = feed.replace(/<!--[\s\S]*?-->/g, "");
  if (!/<rss\b/i.test(feedContent) || !/<channel\b/i.test(feedContent)) fail("feed.xml", "不是有效的 RSS 结构");
  const guids = [...feedContent.matchAll(/<guid(?:\s[^>]*)?>([\s\S]*?)<\/guid>/g)].map((match) => match[1].trim());
  const duplicates = guids.filter((guid, index) => guids.indexOf(guid) !== index);
  if (duplicates.length) fail("feed.xml", `重复 GUID：${[...new Set(duplicates)].join(", ")}`);
  const itemCount = (feedContent.match(/<item\b/g) || []).length;
  if (itemCount < 6) fail("feed.xml", `RSS 条目少于 6 条：${itemCount}`);
}

for (const warning of warnings) console.log(`WARN ${warning}`);
for (const error of errors) console.log(`ERROR ${error}`);
console.log(`CHECK pages=${pages.length} svgs=${svgFiles.length} errors=${errors.length} warnings=${warnings.length}`);
process.exitCode = errors.length ? 1 : 0;
