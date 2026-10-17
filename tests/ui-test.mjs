import { chromium } from "/tmp/claude-0/pw/node_modules/playwright-core/index.mjs";
import fs from "fs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
const mock = `<script>const fake=async(i,o)=>{const t="Lời cuối (AI).";if(o&&o.onText)o.onText({text:t,delta:t});return{text:t,truncated:false}};fake.json=async(i)=>({title:"AI: Một chuyện",text:"...",concept:null,npc:null,choices:[{label:"A",fx:{happy:1}},{label:"B",fx:{happy:-1}}],def:0});fake.limits=async()=>({});window.claude={use:async n=>n==="sample"?fake:null};</script>`;
const html = "<!doctype html><html><head><meta charset=utf-8>"+mock+"</head><body>" + fs.readFileSync("/home/claude/doi-nguoi/index.html","utf8") + "</body></html>";
await page.setContent(html, { waitUntil: "load" }); await page.waitForTimeout(500);
await page.click("#born"); await page.waitForTimeout(300); await page.click("#go"); await page.waitForTimeout(200); await page.click('#speed [data-s="16"]');
let doorSeen=0, tunnel=0, timer=0, castRows=0, storyScenes=0, aiScenes=0, memLines=0, shot=false;
for (let i=0;i<700;i++){ await page.waitForTimeout(200);
  if (await page.$("body.tunnel")) tunnel++; if (await page.$("#timerbar")) timer++;
  const dec = await page.textContent("#dec").catch(()=>""); if (dec.includes("Một quyết định")) { storyScenes++; if (dec.includes("do AI viết")) aiScenes++; if (/vẫn chưa quên|còn nhớ|Vì năm/.test(dec)) memLines++; if (dec.includes("đóng cửa:")) doorSeen++; if (!shot && (await page.$("body.tunnel"))) { await page.screenshot({ path: "/tmp/claude-0/tunnel.png" }); shot = true; } }
  castRows = Math.max(castRows, (await page.$$("#cast .p")).length);
  const btns = await page.$$('#dec [data-i]:not([disabled])'); if (btns.length) await btns[0].click();
  if (!(await page.$("#age"))) break; }
await page.waitForTimeout(600);
const end = await page.textContent("#app");
console.log({ doorSeen, tunnelTicks: tunnel, timerTicks: timer, castRows, storyScenes, aiScenes, memLines, hasCF: end.includes("Cuộc đời suýt có"), hasCausal: end.includes("Bản đồ nhân quả"), hasMeta: end.includes("Tiền kiếp"), hasEulogy: end.includes("Văn bia"), hasTopology: end.includes("Địa hình cuộc đời"), epilogue: (await page.textContent("#epilogue").catch(()=>"")).slice(0,30) });
console.log("errors:", errors.length ? errors.join("\n") : "none");
await browser.close();
