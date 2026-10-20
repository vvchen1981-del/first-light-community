const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const KEY = "first-light-community-v1";
const blank = () => ({
  version: 1,
  lang: "zh-Hans",
  bookmarks: [],
  art: [],
  completed: [],
  progress: {},
  lastRead: { book: "JHN", chapter: 1 },
  speed: 0.8,
  voice: "",
});
let state = blank();
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && saved.version === 1) state = { ...state, ...saved };
} catch {}
if (!["zh-Hans", "en"].includes(state.lang)) state.lang = "zh-Hans";
for (const k of ["bookmarks", "art", "completed"]) if (!Array.isArray(state[k])) state[k] = [];
if (!state.progress || typeof state.progress !== "object") state.progress = {};
let catalog = [],
  arts = [],
  lessons = [],
  verseRanges = {},
  cache = new Map(),
  renderId = 0,
  activeChapter = null,
  toastTimer;
let speechGeneration = 0,
  speakingIndex = -1,
  speechList = [],
  speechPaused = false,
  speechActive = false,
  speechPending = false,
  currentUtterance = null,
  speechStartTimer = null;
const synth = window.speechSynthesis;
const t = (zh, en) => (state.lang === "en" ? en : zh);
const loc = (v) =>
  typeof v === "object" && v !== null
    ? (v[state.lang] ?? v["zh-Hans"] ?? v.en ?? "")
    : String(v ?? "");
const bookName = (id) => loc(catalog.find((b) => b.id === id)?.name) || id;
const refText = (r) => `${bookName(r.book)} ${r.chapter}${r.verse ? ":" + r.verse : ""}`;
const readURL = (r) =>
  `#read/${encodeURIComponent(r.book)}/${r.chapter}${r.verse ? "/" + r.verse : ""}`;
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    notify(
      t(
        "设备存储不可用，本次记录可能无法保留。",
        "Device storage is unavailable; changes may not persist.",
      ),
    );
  }
}
function notify(msg) {
  $("#status").textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#status").textContent = ""), 4200);
}
async function json(path) {
  const r = await fetch(path);
  if (!r.ok) throw Error(`${r.status}: ${path}`);
  return r.json();
}
async function getBook(id) {
  const key = state.lang + "/" + id;
  if (!cache.has(key)) cache.set(key, await json(`data/bible/${key}.json`));
  return cache.get(key);
}
const icons = {
  home: '<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/>',
  read: '<path d="M12 5v16M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2z"/>',
  learn: '<path d="m2 8 10-5 10 5-10 5zM6 10v7c4 3 8 3 12 0v-7M22 8v9"/>',
  art: '<rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8" cy="8" r="1.5"/><path d="m3 18 6-6 4 4 4-6 4 8"/>',
  mine: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
};
function chrome(tab) {
  document.documentElement.lang = state.lang;
  document.title = t("初见 · First Light Community", "First Light Community");
  $("#language").textContent = state.lang === "en" ? "中文 / EN" : "EN / 中文";
  $("#navigation").innerHTML = [
    ["home", "今日", "Today"],
    ["read", "阅读", "Read"],
    ["learn", "学习", "Learn"],
    ["art", "艺术", "Art"],
    ["mine", "我的", "Mine"],
  ]
    .map(
      ([id, zh, en]) =>
        `<a href="#${id}" ${tab === id ? 'class="active" aria-current="page"' : ""}><svg viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg><span>${t(zh, en)}</span></a>`,
    )
    .join("");
  $("#navigation").setAttribute("aria-label", t("主导航", "Main navigation"));
  $("#footer").innerHTML =
    `<span>FIRST LIGHT COMMUNITY · ${t("在字句之间，留一点光。", "Make room for a little light.")}</span><br><a href="PRIVACY.md">${t("隐私与本地数据", "Privacy & local data")}</a><a href="THIRD_PARTY_NOTICES.md">${t("来源与许可", "Sources & licenses")}</a>`;
}
function progressCount() {
  return Object.keys(state.progress).filter((k) => state.progress[k] === true).length;
}
async function home() {
  const dailyBook = await getBook("JHN");
  const dailyVerse = dailyBook.chapters
    .find((c) => c.number === 1)
    .verses.find((v) => v.n <= 5 && (v.end || v.n) >= 5);
  const a = arts[0];
  const r =
    state.lastRead && catalog.some((b) => b.id === state.lastRead.book)
      ? state.lastRead
      : { book: "JHN", chapter: 1 };
  return `<section class="hero"><div><div class="eyebrow">A quiet beginning</div><h1>${t("从一束光开始，<br>读懂字句与生活。", "A little light.<br>A deeper reading.")}</h1><p>${t("打开圣经，慢慢读，也听一听。让画作带你观察，让一个问题陪你思考。", "Read slowly. Listen closely. Explore a painting, follow a question, and make space to reflect.")}</p><div class="actions"><a class="button primary" href="${readURL(r)}">${t("继续阅读", "Continue reading")} →</a><a class="button" href="#learn">${t("开始学习", "Explore lessons")}</a></div><p class="caption">${t("中文 · English　／　阅读、聆听、艺术", "中文 · English / Reading, listening, art")}</p></div>${a ? `<div class="hero-image"><a href="#art/${esc(a.id)}"><img src="${esc(a.image)}" alt="${esc(loc(a.title))}"></a><p class="caption">${esc(loc(a.title))} · ${esc(loc(a.artist))}</p></div>` : ""}</section><section><div class="section-heading"><h2>${t("今天，留一点时间", "A moment for today")}</h2><span class="eyebrow">READ · NOTICE · REFLECT</span></div><div class="grid"><a class="card card-link" href="#read/JHN/1/5"><span class="card-number">01 / READ</span><h3>${t("光照在黑暗里", "Light in the darkness")}</h3><p>${t("从约翰福音第一章开始，读一段关于生命与光的文字。", "Begin with John 1, a passage about life and light.")}</p><span class="text-link">${t("打开经文", "Open passage")} →</span></a><a class="card card-link" href="#learn"><span class="card-number">02 / LEARN</span><h3>${t("带着问题阅读", "Read with a question")}</h3><p>${t("五个简短主题，结合经文、背景和理解练习。", "Five short lessons connect passages, context, and reflection.")}</p><span class="text-link">${t("浏览课程", "Explore lessons")} →</span></a><a class="card card-link" href="#art"><span class="card-number">03 / LOOK</span><h3>${t("在画面中停留", "Stay with a painting")}</h3><p>${t("从光线、手势与细节，进入艺术家描绘的圣经故事。", "Notice light, gesture, and detail in paintings of biblical stories.")}</p><span class="text-link">${t("进入画廊", "Visit gallery")} →</span></a></div></section><section class="quote">${esc(dailyVerse?.text || "")}<div class="caption">${t("约翰福音 1:5 · 和合本", "John 1:5 · World English Bible")}</div></section>`;
}
function artGallery() {
  return `<div class="page-head"><div class="eyebrow">The art of looking</div><h1>${t("让画作，打开故事。", "A story, seen anew.")}</h1><p>${t("观看原作，了解出处，再回到经文。画作解读是一种观察视角，不能替代原文。", "Look at the artwork, explore its context, and return to the passage. Interpretations offer a perspective on the painting.")}</p></div><div class="art-grid">${arts.map((a) => `<a class="art-card" href="#art/${esc(a.id)}"><img loading="lazy" src="${esc(a.image)}" alt="${esc(loc(a.title))}"><h2>${esc(loc(a.title))}</h2><p>${esc(loc(a.artist))} · ${esc(loc(a.date))}</p></a>`).join("")}</div>`;
}
function artDetail(a) {
  return `<a class="back" href="#art">← ${t("返回画廊", "Back to gallery")}</a><div class="page-head"><div class="eyebrow">Art & scripture</div><h1>${esc(loc(a.title))}</h1><p>${esc(loc(a.artist))} · ${esc(loc(a.date))}</p></div><img class="detail-image" src="${esc(a.image)}" alt="${esc(loc(a.title))}"><div class="detail-grid"><article class="prose"><h2>${t("先看见", "Look closely")}</h2><p>${esc(loc(a.description))}</p><h2>${t("停留与观察", "Pause and notice")}</h2><p>${esc(loc(a.observe))}</p><h2>${t("故事与背景", "Story and context")}</h2><p>${esc(loc(a.context))}</p><a class="button primary" href="${readURL(a.reference)}">${esc(refText(a.reference))} →</a></article><aside class="metadata"><button id="save-art" class="button" data-id="${esc(a.id)}">${state.art.includes(a.id) ? t("已收藏 · 取消收藏", "Saved · Remove") : t("收藏画作", "Save artwork")}</button><dl><dt>${t("艺术家", "Artist")}</dt><dd>${esc(loc(a.artist))}</dd><dt>${t("年代", "Date")}</dt><dd>${esc(loc(a.date))}</dd><dt>${t("收藏机构", "Collection")}</dt><dd>${esc(loc(a.institution))}</dd><dt>${t("图像与来源", "Image & source")}</dt><dd>${esc(loc(a.creditLine))}</dd></dl><p><a href="${esc(a.source)}" target="_blank" rel="noopener noreferrer">${t("查看机构原始页面", "View source record")} ↗</a></p>${a.licenseURL ? `<p><a href="${esc(a.licenseURL)}" target="_blank" rel="noopener noreferrer">${t("图像许可说明", "Image license")} ↗</a></p>` : ""}</aside></div>`;
}
function lessonList() {
  return `<div class="page-head"><div class="eyebrow">Read · understand · reflect</div><h1>${t("一次，理解一点。", "One thought at a time.")}</h1><p>${t("每一课从一段经文开始。阅读背景，做一道理解练习，再带着问题回到生活。", "Start with a passage. Explore its context, try a question, and carry a thought into your day.")}</p></div><div class="lesson-list">${lessons.map((l, i) => `<a class="card card-link" href="#learn/${esc(l.id)}"><span class="card-number">${String(i + 1).padStart(2, "0")}</span><div><h2>${esc(loc(l.title))}</h2><p>${esc(loc(l.intro))}</p><small>${state.completed.includes(l.id) ? t("已完成", "Completed") : t("阅读与理解", "Read & reflect")} · ${esc(refText(l.reference))}</small></div></a>`).join("")}</div>`;
}
function lessonDetail(l) {
  return `<article class="lesson"><a class="back" href="#learn">← ${t("返回课程", "Back to lessons")}</a><div class="eyebrow">A closer reading</div><h1>${esc(loc(l.title))}</h1><p class="muted">${esc(loc(l.intro))}</p><a class="button" href="${readURL(l.reference)}">${t("先读经文", "Read passage")} · ${esc(refText(l.reference))} →</a><div class="prose" style="margin-top:28px"><p>${esc(loc(l.body))}</p></div><section class="question"><h2>${t("读后想一想", "A question to consider")}</h2><p>${esc(loc(l.question))}</p><div id="choices">${l.choices.map((c, i) => `<button class="choice" data-choice="${i}">${esc(loc(c.text))}</button>`).join("")}</div><div id="feedback" aria-live="polite"></div></section></article>`;
}
function mine() {
  return `<div class="page-head"><div class="eyebrow">Your quiet corner</div><h1>${t("把触动，留在这里。", "Keep what stays with you.")}</h1><p>${t("收藏与进度保存在当前浏览器中。无需账号；更换浏览器或清理数据前，请先导出备份。", "Your saved items and progress stay in this browser. Export a backup before clearing data or moving to another browser.")}</p></div><div class="stats"><div class="stat"><strong>${progressCount()}</strong>${t("已读章节", "Chapters read")}</div><div class="stat"><strong>${state.completed.length} / ${lessons.length}</strong>${t("已完成课程", "Lessons complete")}</div><div class="stat"><strong>${state.bookmarks.length}</strong>${t("收藏经文", "Saved verses")}</div></div><h2>${t("收藏的经文", "Saved verses")}</h2>${state.bookmarks.length ? state.bookmarks.map((r) => `<div class="saved-item"><a href="${readURL(r)}">${esc(refText(r))}<small> →</small></a><button data-remove-verse="${esc(r.book + "/" + r.chapter + "/" + r.verse)}">${t("移除", "Remove")}</button></div>`).join("") : `<p class="empty">${t("阅读时，点按经文旁的 ☆ 即可收藏。", "Select ☆ beside a verse to save it here.")}</p>`}<h2 style="margin-top:30px">${t("收藏的画作", "Saved artworks")}</h2>${
    state.art.length
      ? state.art
          .map((id) => {
            const a = arts.find((a) => a.id === id);
            return a
              ? `<div class="saved-item"><a href="#art/${esc(a.id)}">${esc(loc(a.title))} →</a><button data-remove-art="${esc(a.id)}">${t("移除", "Remove")}</button></div>`
              : "";
          })
          .join("")
      : `<p class="empty">${t("在画作详情页，收藏想再次观看的作品。", "Save a work from its detail page to return to it later.")}</p>`
  }<section class="settings"><h2>${t("数据与备份", "Data & backup")}</h2><p class="muted">${t("导出的 JSON 包含本机收藏、阅读进度及设置，不含账号信息。导入前会校验格式；导入将替换本机记录。", "The JSON backup contains saved items, progress, and preferences. Imports are validated and replace current records.")}</p><div class="actions"><button id="export">${t("导出备份", "Export backup")}</button><button id="import">${t("导入备份", "Import backup")}</button><input class="hidden" type="file" accept="application/json,.json" id="import-file"><button id="clear">${t("清除本机记录", "Clear local records")}</button></div><p class="caption">${t("没有在线账户、云端同步或分析追踪。设备语音是否需要联网，由浏览器与系统语音服务决定。", "No online accounts, cloud sync, or analytics. Device speech may use network services depending on your browser and operating system.")}</p></section>`;
}
function verseKey(r) {
  return r.book + "/" + r.chapter + "/" + r.verse;
}
function isSaved(r) {
  return state.bookmarks.some((b) => verseKey(b) === verseKey(r));
}
function toggleVerse(r) {
  const k = verseKey(r);
  state.bookmarks = isSaved(r)
    ? state.bookmarks.filter((b) => verseKey(b) !== k)
    : [...state.bookmarks, r];
  save();
  const el = $(`[data-verse="${r.verse}"]`);
  if (el) {
    el.classList.toggle("saved", isSaved(r));
    const b = $(".save", el);
    b.textContent = isSaved(r) ? "★" : "☆";
    b.setAttribute("aria-pressed", String(isSaved(r)));
  }
  notify(isSaved(r) ? t("经文已收藏", "Verse saved") : t("已取消收藏", "Verse removed"));
}
async function reader(bookId, chapterNum, focusVerse, token) {
  let book = catalog.find((b) => b.id === bookId);
  if (!book) book = catalog.find((b) => b.id === "JHN") || catalog[0];
  const data = await getBook(book.id);
  if (token !== renderId) return;
  const chapters = data.chapters || [];
  let chapter = chapters.find((c) => c.number === Number(chapterNum)) || chapters[0];
  if (!chapter) throw Error("No chapter");
  activeChapter = { book: book.id, chapter: chapter.number, verses: chapter.verses };
  state.lastRead = { book: book.id, chapter: chapter.number };
  save();
  const testament = book.testament;
  const available = catalog.filter((b) => b.testament === testament);
  $("#main").innerHTML =
    `<div class="reader-layout"><aside class="reader-tools" aria-label="${t("阅读设置", "Reading controls")}"><label class="field">${t("经约", "Testament")}<select id="testament">${[...new Set(catalog.map((b) => b.testament))].map((v) => `<option value="${esc(v)}" ${v === testament ? "selected" : ""}>${isOT(v) ? t("旧约", "Old Testament") : t("新约", "New Testament")}</option>`).join("")}</select></label><label class="field">${t("书卷", "Book")}<select id="book">${available.map((b) => `<option value="${esc(b.id)}" ${b.id === book.id ? "selected" : ""}>${esc(loc(b.name))}</option>`).join("")}</select></label><label class="field">${t("章节", "Chapter")}<select id="chapter">${chapters.map((c) => `<option value="${c.number}" ${c.number === chapter.number ? "selected" : ""}>${t("第 " + c.number + " 章", "Chapter " + c.number)}</option>`).join("")}</select></label><label class="field search-field">${t("在本章查找", "Find in chapter")}<input type="search" id="verse-search" placeholder="${t("输入文字…", "Type a word…")}" autocomplete="off"></label><details class="audio-panel" ${window.matchMedia("(min-width: 761px)").matches ? "open" : ""}><summary>${t("聆听本章 · 语音设置", "Listen · voice settings")}</summary><label class="field">${t("设备语音", "Device voice")}<select id="voice"></select></label><label class="field speed">${t("语速", "Speed")} <input id="speed" type="range" min="0.5" max="1.5" step="0.1" value="${Number(state.speed) || 0.8}"><output id="speed-value">${Number(state.speed) || 0.8}×</output></label><div class="audio-buttons"><button id="play">${t("播放", "Play")}</button><button id="pause" disabled>${t("暂停", "Pause")}</button><button id="stop" disabled>${t("停止", "Stop")}</button></div><p id="audio-status" class="audio-note" aria-live="polite"></p><p class="audio-note">${t("使用系统语音朗读；可用语音与音质由当前设备提供。点按经文旁的 ▶ 可从该节开始。", "Read by your device. Voices and quality vary. Select ▶ beside a verse to begin there.")}</p></details></aside><article><div class="reader-title"><div><div class="eyebrow">${state.lang === "en" ? "WORLD ENGLISH BIBLE" : "和合本"}</div><h1>${esc(loc(book.name))} ${chapter.number}</h1></div><div class="chapter-nav"><button id="prev" aria-label="${t("上一章", "Previous chapter")}">←</button><button id="next" aria-label="${t("下一章", "Next chapter")}">→</button></div></div><p id="search-count" class="caption" aria-live="polite"></p><div id="verses">${chapter.verses
      .map((v, i) => {
        const r = { book: book.id, chapter: chapter.number, verse: v.n },
          saved = isSaved(r);
        return `<section id="v${v.n}" data-verse="${v.n}" class="verse${saved ? " saved" : ""}${Number(focusVerse) >= v.n && Number(focusVerse) <= (v.end || v.n) ? " focused" : ""}"><span class="number">${esc(v.label || v.n)}</span><p>${esc(v.text)}${v.notes?.length ? `<small class="verse-note">${t("版次注释：", "Edition note: ")} ${esc(Array.isArray(v.notes) ? v.notes.join(" ") : v.notes)}</small>` : ""}</p><div class="verse-tools"><button class="save" data-save="${v.n}" aria-label="${t("收藏经文", "Save verse")} ${v.n}" aria-pressed="${saved}">${saved ? "★" : "☆"}</button><button data-speak="${i}" aria-label="${t("从本节朗读", "Read from verse")} ${v.n}">▶</button><button data-share="${v.n}" aria-label="${t("分享经文链接", "Share verse link")} ${v.n}">↗</button></div></section>`;
      })
      .join(
        "",
      )}</div><div class="actions" style="margin-top:28px"><button id="mark-read" class="primary">${state.progress[book.id + "/" + chapter.number] ? t("本章已读 ✓", "Chapter read ✓") : t("标记本章已读", "Mark chapter as read")}</button><button id="bottom-next">${t("下一章", "Next chapter")} →</button></div></article></div>`;
  $("#testament").onchange = (e) => {
    const b = catalog.find((b) => b.testament === e.target.value);
    location.hash = readURL({ book: b.id, chapter: 1 });
  };
  $("#book").onchange = (e) => (location.hash = readURL({ book: e.target.value, chapter: 1 }));
  $("#chapter").onchange = (e) =>
    (location.hash = readURL({ book: book.id, chapter: +e.target.value }));
  const move = (direction) => {
    const n = chapter.number + direction;
    if (n >= 1 && n <= chapters.length) {
      location.hash = readURL({ book: book.id, chapter: n });
      return;
    }
    const bi = catalog.indexOf(book) + direction;
    const target = catalog[bi];
    if (target)
      location.hash = readURL({
        book: target.id,
        chapter: direction > 0 ? 1 : Number(target.chapters) || 1,
      });
  };
  $("#prev").onclick = () => move(-1);
  $("#next").onclick = $("#bottom-next").onclick = () => move(1);
  $("#prev").disabled = catalog.indexOf(book) === 0 && chapter.number === 1;
  $("#next").disabled = $("#bottom-next").disabled =
    catalog.indexOf(book) === catalog.length - 1 && chapter.number === chapters.length;
  $("#mark-read").onclick = () => {
    state.progress[book.id + "/" + chapter.number] = true;
    save();
    $("#mark-read").textContent = t("本章已读 ✓", "Chapter read ✓");
    notify(t("阅读进度已保存", "Reading progress saved"));
  };
  $("#verse-search").oninput = (e) => {
    const q = e.target.value.trim().toLocaleLowerCase();
    let count = 0;
    $$(".verse").forEach((el, i) => {
      const show = !q || chapter.verses[i].text.toLocaleLowerCase().includes(q);
      el.hidden = !show;
      if (show) count++;
    });
    $("#search-count").textContent = q ? t(`找到 ${count} 节经文`, `Found ${count} verses`) : "";
  };
  $$("[data-save]").forEach(
    (el) =>
      (el.onclick = () =>
        toggleVerse({ book: book.id, chapter: chapter.number, verse: +el.dataset.save })),
  );
  $$("[data-speak]").forEach((el) => (el.onclick = () => startSpeech(+el.dataset.speak)));
  $$("[data-share]").forEach(
    (el) =>
      (el.onclick = () =>
        share({ book: book.id, chapter: chapter.number, verse: +el.dataset.share })),
  );
  $("#play").onclick = () => startSpeech(0);
  $("#pause").onclick = () => {
    if (!synth || !speechActive) return;
    if (speechPaused) {
      synth.resume();
      speechPaused = false;
    } else {
      synth.pause();
      speechPaused = true;
    }
    updateSpeechControls();
  };
  $("#stop").onclick = () => stopSpeech(true);
  $("#speed").oninput = (e) => {
    state.speed = +e.target.value;
    $("#speed-value").textContent = state.speed + "×";
    save();
  };
  $("#voice").onchange = (e) => {
    state.voice = e.target.value;
    save();
    if (speechActive) stopSpeech(true);
  };
  loadVoices();
  if (focusVerse)
    requestAnimationFrame(() => {
      if (token === renderId)
        $(
          "#v" +
            (chapter.verses.find(
              (v) => v.n <= Number(focusVerse) && (v.end || v.n) >= Number(focusVerse),
            )?.n || Number(focusVerse)),
        )?.scrollIntoView({ block: "center", behavior: "instant" });
    });
}
function isOT(value) {
  return /^(OT|old|旧)/i.test(String(value));
}
function matchingVoices() {
  return synth
    ? synth
        .getVoices()
        .filter((v) =>
          state.lang === "en"
            ? v.lang.toLowerCase().startsWith("en")
            : v.lang.toLowerCase().startsWith("zh"),
        )
    : [];
}
function loadVoices() {
  if (!$("#voice")) return;
  const voices = matchingVoices();
  $("#voice").innerHTML = voices.length
    ? voices
        .map(
          (v) =>
            `<option value="${esc(v.voiceURI)}" ${v.voiceURI === state.voice ? "selected" : ""}>${esc(v.name)} (${esc(v.lang)})${v.localService ? t(" · 本机", " · local") : ""}</option>`,
        )
        .join("")
    : `<option value="">${t("没有可用的匹配语音", "No matching voice available")}</option>`;
  $("#play").disabled = !voices.length;
  $$("[data-speak]").forEach(
    (b) => (b.disabled = !voices.length || !activeChapter?.verses[+b.dataset.speak]?.text.trim()),
  );
  $("#voice").disabled = !voices.length;
  $("#audio-status").textContent = !synth
    ? t("此浏览器不支持设备朗读。", "This browser does not support device speech.")
    : !voices.length
      ? t(
          "尚未找到当前语言的语音。系统加载语音后会自动更新；也可在设备设置中添加语音。",
          "No voice for this language is available. This list updates when voices load; you can also add voices in device settings.",
        )
      : t("准备就绪。", "Ready.");
  if (speechActive) updateSpeechControls();
}
if (synth) synth.addEventListener("voiceschanged", loadVoices);
function updateSpeechControls() {
  if (!$("#pause")) return;
  $("#pause").disabled = !speechActive || speechPending;
  $("#stop").disabled = !speechActive;
  $("#pause").textContent = speechPaused ? t("继续", "Resume") : t("暂停", "Pause");
  $("#audio-status").textContent = speechActive
    ? speechPending
      ? t("正在启动设备语音…", "Starting device speech…")
      : speechPaused
        ? t("已暂停", "Paused")
        : t("正在朗读…", "Reading…")
    : t("朗读已停止。", "Reading stopped.");
}
function stopSpeech(show = false) {
  speechGeneration++;
  clearTimeout(speechStartTimer);
  speechStartTimer = null;
  speechActive = false;
  speechPaused = false;
  speechPending = false;
  currentUtterance = null;
  speakingIndex = -1;
  if (synth) synth.cancel();
  $$(".speaking").forEach((el) => el.classList.remove("speaking"));
  if (show) updateSpeechControls();
}
function startSpeech(index) {
  if (!activeChapter || !synth) return;
  if ($(".audio-panel")) $(".audio-panel").open = true;
  const voices = matchingVoices();
  const selected = $("#voice")?.value;
  const voice = voices.find((v) => v.voiceURI === selected) || voices[0];
  if (!voice) {
    notify(t("当前语言没有可用语音。", "No voice available for this language."));
    return;
  }
  stopSpeech();
  speechActive = true;
  speechPending = true;
  speechList = activeChapter.verses;
  const generation = speechGeneration;
  updateSpeechControls();
  const speakNext = (i) => {
    if (generation !== speechGeneration || !speechActive) return;
    if (i >= speechList.length) {
      clearTimeout(speechStartTimer);
      speechStartTimer = null;
      speechActive = false;
      speechPending = false;
      currentUtterance = null;
      $$(".speaking").forEach((e) => e.classList.remove("speaking"));
      updateSpeechControls();
      if ($("#audio-status"))
        $("#audio-status").textContent = t("本章朗读完毕。", "Chapter finished.");
      return;
    }
    const verse = speechList[i];
    if (!verse.text.trim()) {
      speakNext(i + 1);
      return;
    }
    const u = new SpeechSynthesisUtterance(verse.text);
    currentUtterance = u;
    speechPending = true;
    updateSpeechControls();
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = Math.min(1.5, Math.max(0.5, Number(state.speed) || 0.8));
    u.onstart = () => {
      if (generation !== speechGeneration || currentUtterance !== u) return;
      clearTimeout(speechStartTimer);
      speechStartTimer = null;
      speechPending = false;
      speakingIndex = i;
      updateSpeechControls();
      $$(".speaking").forEach((e) => e.classList.remove("speaking"));
      const el = $("#v" + verse.n);
      if (el) {
        el.classList.add("speaking");
        el.scrollIntoView({
          block: "center",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      }
    };
    u.onend = () => {
      if (generation !== speechGeneration || currentUtterance !== u) return;
      clearTimeout(speechStartTimer);
      speechStartTimer = null;
      currentUtterance = null;
      $$(".speaking").forEach((el) => el.classList.remove("speaking"));
      speakNext(i + 1);
    };
    u.onerror = (e) => {
      if (generation !== speechGeneration || currentUtterance !== u) return;
      stopSpeech(true);
      if ($("#audio-status"))
        $("#audio-status").textContent = t(
          "朗读未能完成，请检查设备语音后重试。",
          "Speech could not finish. Check your device voice and try again.",
        );
    };
    speechStartTimer = setTimeout(() => {
      if (generation !== speechGeneration || currentUtterance !== u || !speechPending) return;
      stopSpeech(true);
      if ($("#audio-status"))
        $("#audio-status").textContent = t(
          "设备语音未能启动。请检查系统语音设置后重试。",
          "Device speech did not start. Check your system voice settings and try again.",
        );
    }, 15000);
    try {
      synth.speak(u);
    } catch {
      u.onerror();
    }
  };
  speakNext(index);
}
async function share(r) {
  const url = new URL(location.href);
  url.hash = readURL(r);
  try {
    if (navigator.share) {
      await navigator.share({ title: refText(r), url: url.href });
    } else if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url.href);
      notify(t("经文链接已复制", "Verse link copied"));
    } else {
      window.prompt(t("复制经文链接", "Copy verse link"), url.href);
    }
  } catch (e) {
    if (e.name !== "AbortError")
      notify(
        t(
          "无法分享，可复制地址栏中的链接。",
          "Sharing is unavailable. Copy the URL from the address bar.",
        ),
      );
  }
}
function validatedImport(input) {
  if (!input || input.version !== 1 || !["zh-Hans", "en"].includes(input.lang))
    throw Error("format");
  const next = blank();
  next.lang = input.lang;
  const validRef = (r) =>
    r &&
    typeof r.book === "string" &&
    catalog.some((b) => b.id === r.book) &&
    Number.isInteger(r.chapter) &&
    r.chapter >= 1 &&
    r.chapter <= Number(catalog.find((b) => b.id === r.book).chapters) &&
    Number.isInteger(r.verse) &&
    r.verse >= 1 &&
    Array.isArray(verseRanges[r.book]?.[r.chapter]) &&
    verseRanges[r.book][r.chapter].some(([start, end]) => r.verse >= start && r.verse <= end);
  if (
    !Array.isArray(input.bookmarks) ||
    input.bookmarks.length > 10000 ||
    !input.bookmarks.every(validRef)
  )
    throw Error("bookmarks");
  next.bookmarks = input.bookmarks.map((r) => ({
    book: r.book,
    chapter: r.chapter,
    verse: r.verse,
  }));
  if (new Set(next.bookmarks.map(verseKey)).size !== next.bookmarks.length)
    throw Error("duplicate bookmarks");
  for (const [key, allowed] of [
    ["art", arts.map((a) => a.id)],
    ["completed", lessons.map((l) => l.id)],
  ]) {
    if (
      !Array.isArray(input[key]) ||
      input[key].length > allowed.length ||
      !input[key].every((id) => allowed.includes(id)) ||
      new Set(input[key]).size !== input[key].length
    )
      throw Error(key);
    next[key] = input[key];
  }
  if (
    !input.progress ||
    Array.isArray(input.progress) ||
    typeof input.progress !== "object" ||
    Object.keys(input.progress).length > 2000
  )
    throw Error("progress");
  for (const [key, value] of Object.entries(input.progress)) {
    const [id, c, ...extra] = key.split("/");
    const book = catalog.find((b) => b.id === id);
    if (
      extra.length ||
      !book ||
      !/^[1-9]\d*$/.test(c) ||
      +c > Number(book.chapters) ||
      value !== true
    )
      throw Error("progress");
    next.progress[key] = true;
  }
  if (input.lastRead) {
    const r = input.lastRead,
      b = catalog.find((b) => b.id === r.book);
    if (!b || !Number.isInteger(r.chapter) || r.chapter < 1 || r.chapter > Number(b.chapters))
      throw Error("lastRead");
    next.lastRead = { book: r.book, chapter: r.chapter };
  }
  if (typeof input.speed === "number" && input.speed >= 0.5 && input.speed <= 1.5)
    next.speed = input.speed;
  else if (input.speed !== undefined) throw Error("speed");
  if (typeof input.voice === "string" && input.voice.length < 1000) next.voice = input.voice;
  return next;
}
function mineEvents() {
  $("#export").onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "first-light-community-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(t("备份文件已生成，请妥善保存。", "Backup generated. Keep it somewhere safe."));
  };
  $("#import").onclick = () => $("#import-file").click();
  $("#import-file").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000) throw Error("size");
      const next = validatedImport(JSON.parse(await file.text()));
      if (
        !window.confirm(
          t(
            `备份包含 ${next.bookmarks.length} 条经文收藏、${next.art.length} 幅画作和 ${Object.keys(next.progress).length} 章进度。确定替换当前记录吗？`,
            `This backup contains ${next.bookmarks.length} verses, ${next.art.length} artworks and ${Object.keys(next.progress).length} chapters. Replace current records?`,
          ),
        )
      )
        return;
      state = next;
      save();
      await route();
      notify(t("备份已导入。", "Backup imported."));
    } catch {
      notify(
        t(
          "未导入：文件格式或记录不符合本应用备份要求。",
          "Not imported: the file is not a valid backup for this app.",
        ),
      );
    } finally {
      if ($("#import-file")) $("#import-file").value = "";
    }
  };
  $("#clear").onclick = () => {
    if (
      !window.confirm(
        t(
          "确定清除本机全部收藏、阅读进度和设置吗？建议先导出备份。此操作无法撤销。",
          "Clear all saved items, progress and preferences? Export a backup first. This cannot be undone.",
        ),
      )
    )
      return;
    state = blank();
    save();
    route();
    notify(t("本机记录已清除。", "Local records cleared."));
  };
  $$("[data-remove-verse]").forEach(
    (el) =>
      (el.onclick = () => {
        state.bookmarks = state.bookmarks.filter((r) => verseKey(r) !== el.dataset.removeVerse);
        save();
        route();
      }),
  );
  $$("[data-remove-art]").forEach(
    (el) =>
      (el.onclick = () => {
        state.art = state.art.filter((id) => id !== el.dataset.removeArt);
        save();
        route();
      }),
  );
}
async function route() {
  const token = ++renderId;
  stopSpeech();
  activeChapter = null;
  const parts = location.hash
    .slice(1)
    .split("/")
    .map((p) => {
      try {
        return decodeURIComponent(p);
      } catch {
        return "";
      }
    });
  const tab = ["home", "read", "learn", "art", "mine"].includes(parts[0]) ? parts[0] : "home";
  chrome(tab);
  $("#main").innerHTML = `<div class="loading">${t("正在打开书页…", "Opening the pages…")}</div>`;
  window.scrollTo(0, 0);
  try {
    if (tab === "read") {
      await reader(
        parts[1] || state.lastRead.book,
        parts[2] || state.lastRead.chapter,
        parts[3],
        token,
      );
      return;
    }
    if (tab === "home") {
      const content = await home();
      if (token !== renderId) return;
      $("#main").innerHTML = content;
    }
    if (tab === "art") {
      const a = arts.find((a) => a.id === parts[1]);
      $("#main").innerHTML = a ? artDetail(a) : artGallery();
      if (a)
        $("#save-art").onclick = () => {
          state.art = state.art.includes(a.id)
            ? state.art.filter((id) => id !== a.id)
            : [...state.art, a.id];
          save();
          $("#save-art").textContent = state.art.includes(a.id)
            ? t("已收藏 · 取消收藏", "Saved · Remove")
            : t("收藏画作", "Save artwork");
        };
    }
    if (tab === "learn") {
      const lesson = lessons.find((l) => l.id === parts[1]);
      $("#main").innerHTML = lesson ? lessonDetail(lesson) : lessonList();
      if (lesson)
        $$("[data-choice]").forEach(
          (el) =>
            (el.onclick = () => {
              const c = lesson.choices[+el.dataset.choice];
              $$("[data-choice]").forEach((b) => {
                b.classList.toggle("selected", b === el);
                b.setAttribute("aria-pressed", String(b === el));
              });
              if (c.correct && !state.completed.includes(lesson.id)) {
                state.completed.push(lesson.id);
                save();
              }
              $("#feedback").innerHTML =
                `<div class="feedback"><strong>${c.correct ? t("理解正确 ✓", "That’s right ✓") : t("再想一想", "Consider it again")}</strong><p>${esc(loc(c.feedback))}</p>${c.correct ? `<small>${t("本课已完成并保存。", "Lesson completed and saved.")}</small>` : ""}</div>`;
            }),
        );
    }
    if (tab === "mine") {
      $("#main").innerHTML = mine();
      mineEvents();
    }
  } catch (error) {
    if (token !== renderId) return;
    $("#main").innerHTML =
      `<div class="error"><h1>${t("这一页暂时没有打开。", "This page could not open.")}</h1><p>${t("请检查网络或本地文件，再重新尝试。已保存的个人记录不受影响。", "Check your connection or local files and try again. Saved records remain on this device.")}</p><button id="retry">${t("重新加载", "Try again")}</button><p><a href="#home">${t("返回首页", "Return home")}</a></p></div>`;
    $("#retry").onclick = () => route();
  }
}
$("#language").onclick = () => {
  stopSpeech();
  state.lang = state.lang === "en" ? "zh-Hans" : "en";
  save();
  route();
};
$(".skip").onclick = (event) => {
  event.preventDefault();
  $("#main").focus({ preventScroll: true });
  $("#main").scrollIntoView({ block: "start" });
};
window.addEventListener("hashchange", route);
window.addEventListener("pagehide", () => stopSpeech());
async function init() {
  try {
    [catalog, arts, lessons, verseRanges] = await Promise.all([
      json("data/bible/catalog.json"),
      json("data/art.json"),
      json("data/lessons.json"),
      json("data/verse-ranges.json"),
    ]);
    if (
      !Array.isArray(catalog) ||
      !catalog.length ||
      !Array.isArray(arts) ||
      !Array.isArray(lessons) ||
      !verseRanges ||
      typeof verseRanges !== "object" ||
      Array.isArray(verseRanges)
    )
      throw Error("Invalid data");
    try {
      state = validatedImport(state);
    } catch {
      state = blank();
    }
    await route();
  } catch {
    chrome("home");
    $("#main").innerHTML =
      `<div class="error"><h1>${t("暂时无法打开内容。", "Content is unavailable.")}</h1><p>${t("请检查网络连接，或确认应用文件已完整发布。", "Check your connection or confirm the app files were published completely.")}</p><button id="retry">${t("重新尝试", "Try again")}</button><p><a href="#mine" id="offline-mine">${t("查看本机记录", "View local records")}</a></p></div>`;
    $("#retry").onclick = init;
    $("#offline-mine").onclick = (e) => {
      e.preventDefault();
      chrome("mine");
      $("#main").innerHTML = mine();
      mineEvents();
    };
  }
}
init();
