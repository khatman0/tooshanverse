/* ══════════════════════════════════════════════════
   admin-composer.js — نوشتن فصل جدید مستقیم از تو سایت
   نحوه‌ی استفاده (تو صفحه‌ی هر داستان، جایی که "ادامه دارد" هست):

   <div id="story-dynamic-content"></div>
   <div id="admin-composer"></div>
   <script type="module">
     import { loadStoryContinuation, mountAdminComposer } from './admin-composer.js';
     loadStoryContinuation('story-dynamic-content', 'electropulse');
     mountAdminComposer('admin-composer', 'electropulse');
   </script>

   ⚠️ اگه ستون تشخیص ادمین تو تیبل profiles اسمش is_admin نیست،
   فقط همین یه خط رو پایین‌تر پیدا کن و عوض کن:
   const ADMIN_COLUMN = 'is_admin';
══════════════════════════════════════════════════ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ADMIN_COLUMN = 'is_admin'; // ← اگه اسم ستونت فرق داره، همینو عوض کن

const STYLE_ID = 'ac-styles';

/* ══════════════════════════════
   ۱) لود کردن ادامه‌ی داستان — برای همه
══════════════════════════════ */
export async function loadStoryContinuation(containerId, storySlug) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { data, error } = await supabase
    .from('story_content')
    .select('content_html')
    .eq('story_slug', storySlug)
    .maybeSingle();

  if (error || !data || !data.content_html) return;
  container.innerHTML = data.content_html;

  // اسکرول ریویل رو برای بلاک‌های تازه هم فعال کن (اگه صفحه از قبل observer داشت)
  container.querySelectorAll('p, .dialogue, .chapter, .timebreak, .highlight, .action')
    .forEach(el => el.classList.add('visible'));
}

/* ══════════════════════════════
   ۲) استایل‌های ویجت ادمین
══════════════════════════════ */
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .ac-toggle-btn {
      display: flex; align-items: center; gap: 8px;
      margin: 40px auto 0;
      padding: 12px 24px;
      border-radius: 30px;
      border: 1px dashed rgba(25,167,255,0.35);
      background: rgba(25,167,255,0.05);
      color: #19a7ff;
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      width: fit-content;
    }
    .ac-toggle-btn:hover { background: rgba(25,167,255,0.1); }

    .ac-panel {
      display: none;
      margin: 24px auto 60px;
      max-width: 720px;
      background: rgba(8,14,28,0.85);
      border: 1px solid rgba(25,167,255,0.15);
      border-radius: 20px;
      backdrop-filter: blur(20px);
      overflow: hidden;
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      direction: rtl;
    }
    .ac-panel.open { display: block; }

    .ac-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(25,167,255,0.1);
      display: flex; align-items: center; justify-content: space-between;
    }
    .ac-header h3 { color: #fff; font-size: 0.95rem; }
    .ac-header-actions { display: flex; gap: 8px; }
    .ac-header-actions button {
      background: none; border: 1px solid rgba(25,167,255,0.2);
      color: rgba(180,210,255,0.6);
      border-radius: 8px; padding: 6px 12px;
      font-size: 0.75rem; cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
    }
    .ac-header-actions button:hover { color: #9be3ff; border-color: rgba(25,167,255,0.4); }

    .ac-preview {
      max-height: 400px;
      overflow-y: auto;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(25,167,255,0.1);
    }
    .ac-preview:empty::before {
      content: 'هنوز چیزی اضافه نکردی — از پایین شروع کن';
      color: rgba(180,210,255,0.35);
      font-size: 0.85rem;
    }
    .ac-preview p, .ac-preview .dialogue, .ac-preview .chapter,
    .ac-preview .timebreak, .ac-preview .highlight, .ac-preview .action {
      opacity: 1 !important; transform: none !important;
    }

    .ac-composer { padding: 16px 20px 20px; }
    .ac-toolbar { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; position: relative; }
    .ac-tool-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid rgba(25,167,255,0.15);
      background: rgba(25,167,255,0.04);
      color: #ddeeff;
      font-size: 0.82rem; font-weight: 600;
      cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
    }
    .ac-tool-btn:hover { background: rgba(25,167,255,0.1); border-color: rgba(25,167,255,0.3); }
    .ac-tool-btn.active { background: rgba(25,167,255,0.15); border-color: #19a7ff; color: #9be3ff; }

   .ac-dropdown {
  position: absolute;
  top: calc(100% + 6px); right: 0;
  background: #0a1020;
  border: 1px solid rgba(25,167,255,0.25);
  border-radius: 14px;
  padding: 16px;
  width: 300px;
  max-width: 90vw;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 20;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  display: none;
}
    .ac-dropdown.open { display: block; }
    .ac-dropdown label {
      display: block; font-size: 0.75rem; color: rgba(180,210,255,0.55);
      margin-bottom: 5px; margin-top: 12px;
    }
    .ac-dropdown label:first-child { margin-top: 0; }
    .ac-dropdown input[type="text"], .ac-dropdown input[type="number"], .ac-dropdown textarea {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(25,167,255,0.15);
      border-radius: 8px;
      color: #ddeeff;
      padding: 8px 10px;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 0.85rem;
      resize: vertical;
    }
    .ac-toggle-row {
      display: flex; gap: 8px; margin-top: 12px;
    }
    .ac-toggle-opt {
      flex: 1; text-align: center;
      padding: 8px; border-radius: 8px;
      border: 1px solid rgba(25,167,255,0.15);
      font-size: 0.8rem; cursor: pointer;
      color: rgba(180,210,255,0.6);
    }
    .ac-toggle-opt.selected {
      background: rgba(25,167,255,0.15);
      border-color: #19a7ff;
      color: #9be3ff;
    }
    .ac-dropdown-submit {
      margin-top: 14px; width: 100%;
      padding: 10px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #19a7ff, #1fb6ff);
      color: #001828; font-weight: 700; cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
    }

    .ac-input-row { display: flex; gap: 10px; align-items: flex-end; }
    .ac-main-input {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(25,167,255,0.15);
      border-radius: 12px;
      color: #ddeeff;
      padding: 12px 14px;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 0.9rem;
      min-height: 46px;
      max-height: 160px;
      resize: vertical;
    }
    .ac-send-btn {
      flex-shrink: 0;
      padding: 12px 22px;
      border-radius: 12px; border: none;
      background: linear-gradient(135deg, #19a7ff, #1fb6ff);
      color: #001828; font-weight: 700;
      cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
    }
    .ac-send-btn:disabled { opacity: .5; cursor: not-allowed; }

    .ac-publish-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 14px; padding-top: 14px;
      border-top: 1px solid rgba(25,167,255,0.08);
    }
    .ac-draft-count { font-size: 0.78rem; color: rgba(180,210,255,0.5); }
    .ac-publish-btn {
      padding: 10px 20px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #f0c060, #ffd97a);
      color: #2a1c00; font-weight: 700; cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
    }
    .ac-publish-btn:disabled { opacity: .5; cursor: not-allowed; }
    .ac-status { font-size: 0.8rem; margin-top: 10px; min-height: 1.2em; }
    .ac-status.ac-ok { color: #9be3ff; }
    .ac-status.ac-err { color: #ff8fa3; }
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════
   ۳) ساخت HTML هر نوع بلاک — دقیقاً همون کلاس‌های خود سایت
══════════════════════════════ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildParagraph(text) {
  return `<p class="visible">${escapeHtml(text)}</p>`;
}

function buildDialogue(speaker, text, isInner) {
  const innerClass = isInner ? ' inner' : '';
  return `<div class="dialogue${innerClass} visible">
    <span class="speaker">${escapeHtml(speaker)}</span>
    ${escapeHtml(text)}
  </div>`;
}

function buildChapter(number, title, isFlashback, customId) {
  const id = customId || ('ch-' + Date.now());
  const chapterNum = isFlashback ? 'فلش‌بک' : `فصل ${String(number).padStart(2, '0')}`;
  return `<div class="chapter visible" id="${id}">
    <span class="chapter-num">${chapterNum}</span>
    <span class="chapter-line"></span>
    <span class="chapter-title">${escapeHtml(title)}</span>
  </div>`;
}

function buildTimebreak(label) {
  return `<div class="timebreak visible">
    <span class="tl"></span>
    <span>${escapeHtml(label)}</span>
    <span class="tl"></span>
  </div>`;
}

function buildHighlight(text) {
  const html = escapeHtml(text).split(/\n{2,}/).join('<br><br>').split(/\n/).join('<br>');
  return `<div class="highlight visible">${html}</div>`;
}

function buildAction(text) {
  return `<div class="action visible">${escapeHtml(text)}</div>`;
}

/* ══════════════════════════════
   ۴) ویجت ادمین
══════════════════════════════ */
export async function mountAdminComposer(containerId, storySlug) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // مهمون - هیچی نشون نده

  const { data: profile } = await supabase
    .from('profiles')
    .select(ADMIN_COLUMN)
    .eq('id', session.user.id)
    .single();

  if (!profile || profile[ADMIN_COLUMN] !== true) return; // ادمین نیست

  injectStyles();

  container.innerHTML = `
    <button class="ac-toggle-btn" id="acToggleBtn">✍️ نوشتن فصل جدید</button>
    <div class="ac-panel" id="acPanel">
      <div class="ac-header">
        <h3>ویرایشگر فصل</h3>
        <div class="ac-header-actions">
          <button id="acUndoBtn">حذف آخرین</button>
          <button id="acClearBtn">پاک‌کردن همه</button>
        </div>
      </div>
      <div class="ac-preview" id="acPreview"></div>
      <div class="ac-composer">
        <div class="ac-toolbar">
          <button class="ac-tool-btn" id="acDialogueBtn">💬 دیالوگ</button>
          <div class="ac-dropdown" id="acDialogueDropdown">
            <label>نوع دیالوگ</label>
            <div class="ac-toggle-row" id="acDialogueTypeToggle">
              <div class="ac-toggle-opt selected" data-val="normal">عادی</div>
              <div class="ac-toggle-opt" data-val="inner">درونی (تو ذهنش)</div>
            </div>
            <label>نام گوینده</label>
            <input type="text" id="acSpeakerInput" placeholder="مثلاً: شایان" />
            <label>متن دیالوگ</label>
            <textarea id="acDialogueText" rows="3" placeholder="متن رو اینجا بنویس..."></textarea>
            <button class="ac-dropdown-submit" id="acDialogueSubmit">افزودن دیالوگ</button>
          </div>

          <button class="ac-tool-btn" id="acChapterBtn">📖 فصل</button>
          <div class="ac-dropdown" id="acChapterDropdown">
            <label>نوع</label>
            <div class="ac-toggle-row" id="acChapterTypeToggle">
              <div class="ac-toggle-opt selected" data-val="normal">فصل جدید</div>
              <div class="ac-toggle-opt" data-val="flashback">فلش‌بک</div>
            </div>
            <label id="acChapterNumLabel">شماره فصل</label>
            <input type="number" id="acChapterNum" placeholder="مثلاً: 18" />
            <label>عنوان / زیرعنوان</label>
            <input type="text" id="acChapterTitle" placeholder="مثلاً: بازگشت به خانه" />
            <button class="ac-dropdown-submit" id="acChapterSubmit">افزودن فصل</button>
          </div>

          <button class="ac-tool-btn" id="acMoreBtn">➕ بیشتر</button>
          <div class="ac-dropdown" id="acMoreDropdown">
            <label>تایم‌برک (گذر زمان)</label>
            <input type="text" id="acTimebreakInput" placeholder="مثلاً: سه ماه بعد" />
            <button class="ac-dropdown-submit" id="acTimebreakSubmit">افزودن تایم‌برک</button>

            <label>هایلایت (باکس برجسته)</label>
            <textarea id="acHighlightInput" rows="3" placeholder="متن برجسته..."></textarea>
            <button class="ac-dropdown-submit" id="acHighlightSubmit">افزودن هایلایت</button>

            <label>اکشن (متن هشدار وسط صفحه)</label>
            <input type="text" id="acActionInput" placeholder="مثلاً: آژیر به صدا دراومد" />
            <button class="ac-dropdown-submit" id="acActionSubmit">افزودن اکشن</button>
          </div>
        </div>

        <div class="ac-input-row">
          <textarea class="ac-main-input" id="acMainInput" rows="2" placeholder="یه پاراگراف معمولی بنویس..."></textarea>
          <button class="ac-send-btn" id="acSendBtn">ارسال</button>
        </div>

        <div class="ac-publish-row">
          <span class="ac-draft-count" id="acDraftCount">۰ بلاک آماده‌ی انتشار</span>
          <button class="ac-publish-btn" id="acPublishBtn" disabled>🚀 انتشار در سایت</button>
        </div>
        <div class="ac-status" id="acStatus"></div>
      </div>
    </div>
  `;

  const draft = []; // آرایه‌ی بلاک‌های html که هنوز منتشر نشدن
  const preview = container.querySelector('#acPreview');
  const draftCountEl = container.querySelector('#acDraftCount');
  const publishBtn = container.querySelector('#acPublishBtn');
  const statusEl = container.querySelector('#acStatus');

  function addBlock(html) {
    draft.push(html);
    preview.insertAdjacentHTML('beforeend', html);
    preview.scrollTop = preview.scrollHeight;
    draftCountEl.textContent = `${draft.length} بلاک آماده‌ی انتشار`;
    publishBtn.disabled = draft.length === 0;
  }

  function closeAllDropdowns() {
    container.querySelectorAll('.ac-dropdown').forEach(d => d.classList.remove('open'));
    container.querySelectorAll('.ac-tool-btn').forEach(b => b.classList.remove('active'));
  }

  function toggleDropdown(btnId, dropdownId) {
    const btn = container.querySelector('#' + btnId);
    const dropdown = container.querySelector('#' + dropdownId);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !dropdown.classList.contains('open');
      closeAllDropdowns();
      if (willOpen) { dropdown.classList.add('open'); btn.classList.add('active'); }
    });
    dropdown.addEventListener('click', e => e.stopPropagation());
  }

  document.addEventListener('click', closeAllDropdowns);

  /* ── toggle باز/بسته شدن پنل ── */
  const toggleBtn = container.querySelector('#acToggleBtn');
  const panel = container.querySelector('#acPanel');
  toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));

  /* ── دکمه‌ی ارسال معمولی (پاراگراف) ── */
  container.querySelector('#acSendBtn').addEventListener('click', () => {
    const input = container.querySelector('#acMainInput');
    const text = input.value.trim();
    if (!text) return;
    addBlock(buildParagraph(text));
    input.value = '';
  });

  /* ── دیالوگ ── */
  toggleDropdown('acDialogueBtn', 'acDialogueDropdown');
  let dialogueType = 'normal';
  container.querySelector('#acDialogueTypeToggle').addEventListener('click', (e) => {
    const opt = e.target.closest('.ac-toggle-opt');
    if (!opt) return;
    container.querySelectorAll('#acDialogueTypeToggle .ac-toggle-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    dialogueType = opt.dataset.val;
  });
  container.querySelector('#acDialogueSubmit').addEventListener('click', () => {
    const speaker = container.querySelector('#acSpeakerInput').value.trim();
    const text = container.querySelector('#acDialogueText').value.trim();
    if (!speaker || !text) return;
    addBlock(buildDialogue(speaker, text, dialogueType === 'inner'));
    container.querySelector('#acSpeakerInput').value = '';
    container.querySelector('#acDialogueText').value = '';
    closeAllDropdowns();
  });

  /* ── فصل ── */
  toggleDropdown('acChapterBtn', 'acChapterDropdown');
  let chapterType = 'normal';
  container.querySelector('#acChapterTypeToggle').addEventListener('click', (e) => {
    const opt = e.target.closest('.ac-toggle-opt');
    if (!opt) return;
    container.querySelectorAll('#acChapterTypeToggle .ac-toggle-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    chapterType = opt.dataset.val;
    const numRow = container.querySelector('#acChapterNum');
    const numLabel = container.querySelector('#acChapterNumLabel');
    if (chapterType === 'flashback') {
      numRow.style.display = 'none';
      numLabel.style.display = 'none';
    } else {
      numRow.style.display = '';
      numLabel.style.display = '';
    }
  });
  container.querySelector('#acChapterSubmit').addEventListener('click', () => {
    const title = container.querySelector('#acChapterTitle').value.trim();
    const number = container.querySelector('#acChapterNum').value.trim();
    if (!title) return;
    if (chapterType === 'normal' && !number) return;
    addBlock(buildChapter(number, title, chapterType === 'flashback'));
    container.querySelector('#acChapterTitle').value = '';
    container.querySelector('#acChapterNum').value = '';
    closeAllDropdowns();
  });

  /* ── بیشتر: تایم‌برک / هایلایت / اکشن ── */
  toggleDropdown('acMoreBtn', 'acMoreDropdown');
  container.querySelector('#acTimebreakSubmit').addEventListener('click', () => {
    const val = container.querySelector('#acTimebreakInput').value.trim();
    if (!val) return;
    addBlock(buildTimebreak(val));
    container.querySelector('#acTimebreakInput').value = '';
    closeAllDropdowns();
  });
  container.querySelector('#acHighlightSubmit').addEventListener('click', () => {
    const val = container.querySelector('#acHighlightInput').value.trim();
    if (!val) return;
    addBlock(buildHighlight(val));
    container.querySelector('#acHighlightInput').value = '';
    closeAllDropdowns();
  });
  container.querySelector('#acActionSubmit').addEventListener('click', () => {
    const val = container.querySelector('#acActionInput').value.trim();
    if (!val) return;
    addBlock(buildAction(val));
    container.querySelector('#acActionInput').value = '';
    closeAllDropdowns();
  });

  /* ── حذف آخرین / پاک‌کردن همه ── */
  container.querySelector('#acUndoBtn').addEventListener('click', () => {
    if (draft.length === 0) return;
    draft.pop();
    preview.innerHTML = draft.join('');
    draftCountEl.textContent = `${draft.length} بلاک آماده‌ی انتشار`;
    publishBtn.disabled = draft.length === 0;
  });
  container.querySelector('#acClearBtn').addEventListener('click', () => {
    draft.length = 0;
    preview.innerHTML = '';
    draftCountEl.textContent = '۰ بلاک آماده‌ی انتشار';
    publishBtn.disabled = true;
  });

  /* ── انتشار در سایت ── */
  publishBtn.addEventListener('click', async () => {
    if (draft.length === 0) return;
    publishBtn.disabled = true;
    statusEl.textContent = 'در حال انتشار...';
    statusEl.className = 'ac-status';

    const { data: existing } = await supabase
      .from('story_content')
      .select('content_html')
      .eq('story_slug', storySlug)
      .maybeSingle();

    const newHtml = (existing?.content_html || '') + draft.join('\n');

    const { error } = await supabase
      .from('story_content')
      .upsert({ story_slug: storySlug, content_html: newHtml, updated_at: new Date().toISOString() });

    if (error) {
      statusEl.textContent = 'خطا در انتشار: ' + error.message;
      statusEl.className = 'ac-status ac-err';
      publishBtn.disabled = false;
      return;
    }

    // بلافاصله رو خود صفحه هم نشون بده (بدون رفرش)
    const dynamicContainer = document.getElementById('story-dynamic-content');
    if (dynamicContainer) {
      dynamicContainer.insertAdjacentHTML('beforeend', draft.join('\n'));
    }

    statusEl.textContent = 'با موفقیت منتشر شد ✅';
    statusEl.className = 'ac-status ac-ok';
    draft.length = 0;
    preview.innerHTML = '';
    draftCountEl.textContent = '۰ بلاک آماده‌ی انتشار';
  });
}
