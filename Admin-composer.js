/* ══════════════════════════════════════════════════
   admin-composer.js — نوشتن فصل جدید مستقیم از تو سایت
   (نسخه‌ی دوم: بدون dropdown، بر پایه‌ی «حالت» — رفع مشکل قطع‌شدن تکست‌باکس)

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

  container.querySelectorAll('p, .dialogue, .chapter, .timebreak, .highlight, .action')
    .forEach(el => el.classList.add('visible'));
}

/* ══════════════════════════════
   ۲) استایل‌ها
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
      overflow: visible;
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      direction: rtl;
    }
    .ac-panel.open { display: block; }

    .ac-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(25,167,255,0.1);
      display: flex; align-items: center; justify-content: space-between;
    }
    .ac-header h3 { color: #fff; font-size: 0.95rem; margin: 0; }
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
      max-height: 320px;
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

    /* ── ردیف دکمه‌های حالت (mode chips) ── */
    .ac-mode-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .ac-mode-btn {
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid rgba(25,167,255,0.15);
      background: rgba(25,167,255,0.04);
      color: #ddeeff;
      font-size: 0.82rem; font-weight: 600;
      cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
      transition: background .15s, border-color .15s;
    }
    .ac-mode-btn:hover { background: rgba(25,167,255,0.1); border-color: rgba(25,167,255,0.3); }
    .ac-mode-btn.active { background: rgba(25,167,255,0.18); border-color: #19a7ff; color: #9be3ff; }

    /* ── فیلدهای کمکی مخصوص هر حالت (نه absolute — همیشه در جریان عادی صفحه) ── */
    .ac-extra-fields {
      display: none;
      gap: 10px;
      margin-bottom: 10px;
      padding: 12px;
      background: rgba(25,167,255,0.04);
      border: 1px solid rgba(25,167,255,0.1);
      border-radius: 12px;
      flex-wrap: wrap;
    }
    .ac-extra-fields.visible { display: flex; }
    .ac-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 140px; }
    .ac-field label { font-size: 0.72rem; color: rgba(180,210,255,0.55); }
    .ac-field input[type="text"], .ac-field input[type="number"] {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(25,167,255,0.15);
      border-radius: 8px;
      color: #ddeeff;
      padding: 8px 10px;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 0.85rem;
    }
    .ac-toggle-row { display: flex; gap: 8px; }
    .ac-toggle-opt {
      flex: 1; text-align: center;
      padding: 7px; border-radius: 8px;
      border: 1px solid rgba(25,167,255,0.15);
      font-size: 0.78rem; cursor: pointer;
      color: rgba(180,210,255,0.6);
      white-space: nowrap;
    }
    .ac-toggle-opt.selected {
      background: rgba(25,167,255,0.15);
      border-color: #19a7ff;
      color: #9be3ff;
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
      max-height: 200px;
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
   ۳) ساخت HTML هر نوع بلاک
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

function buildChapter(number, title, isFlashback) {
  const id = 'ch-' + Date.now();
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
   ۴) تعریف حالت‌ها (modes)
   هر حالت مشخص می‌کنه:
   - چه فیلد کمکی‌ای نشون بده (extraFields)
   - آیا از تکست‌باکس اصلی استفاده می‌کنه یا نه (useMain)
   - placeholder تکست‌باکس اصلی
══════════════════════════════ */
const MODES = {
  paragraph: { label: '✏️ پاراگراف', extraFields: [], useMain: true, placeholder: 'یه پاراگراف معمولی بنویس...' },
  dialogue:  { label: '💬 دیالوگ',   extraFields: ['speaker'], useMain: true, placeholder: 'متن دیالوگ رو بنویس...' },
  chapter:   { label: '📖 فصل',      extraFields: ['chapter'], useMain: false, placeholder: '' },
  timebreak: { label: '⏳ تایم‌برک',  extraFields: [], useMain: true, placeholder: 'مثلاً: سه ماه بعد' },
  highlight: { label: '⭐ هایلایت',   extraFields: [], useMain: true, placeholder: 'متن برجسته...' },
  action:    { label: '⚡ اکشن',      extraFields: [], useMain: true, placeholder: 'مثلاً: آژیر به صدا دراومد' },
};

/* ══════════════════════════════
   ۵) ویجت ادمین
══════════════════════════════ */
export async function mountAdminComposer(containerId, storySlug) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select(ADMIN_COLUMN)
    .eq('id', session.user.id)
    .single();

  if (!profile || profile[ADMIN_COLUMN] !== true) return;

  injectStyles();

  const modeButtonsHtml = Object.entries(MODES)
    .map(([key, m]) => `<button class="ac-mode-btn${key === 'paragraph' ? ' active' : ''}" data-mode="${key}">${m.label}</button>`)
    .join('');

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
        <div class="ac-mode-row" id="acModeRow">${modeButtonsHtml}</div>

        <!-- فیلد کمکی دیالوگ -->
        <div class="ac-extra-fields" id="fieldsSpeaker">
          <div class="ac-field">
            <label>نام گوینده</label>
            <input type="text" id="acSpeakerInput" placeholder="مثلاً: شایان" />
          </div>
          <div class="ac-field">
            <label>نوع</label>
            <div class="ac-toggle-row" id="acDialogueTypeToggle">
              <div class="ac-toggle-opt selected" data-val="normal">عادی</div>
              <div class="ac-toggle-opt" data-val="inner">درونی</div>
            </div>
          </div>
        </div>

        <!-- فیلدهای فصل -->
        <div class="ac-extra-fields" id="fieldsChapter">
          <div class="ac-field">
            <label>نوع</label>
            <div class="ac-toggle-row" id="acChapterTypeToggle">
              <div class="ac-toggle-opt selected" data-val="normal">فصل جدید</div>
              <div class="ac-toggle-opt" data-val="flashback">فلش‌بک</div>
            </div>
          </div>
          <div class="ac-field" id="acChapterNumField">
            <label>شماره فصل</label>
            <input type="number" id="acChapterNum" placeholder="مثلاً: 18" />
          </div>
          <div class="ac-field">
            <label>عنوان / زیرعنوان</label>
            <input type="text" id="acChapterTitle" placeholder="مثلاً: بازگشت به خانه" />
          </div>
        </div>

        <div class="ac-input-row" id="acMainInputRow">
          <textarea class="ac-main-input" id="acMainInput" rows="2"></textarea>
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

  const draft = [];
  const preview = container.querySelector('#acPreview');
  const draftCountEl = container.querySelector('#acDraftCount');
  const publishBtn = container.querySelector('#acPublishBtn');
  const statusEl = container.querySelector('#acStatus');
  const mainInput = container.querySelector('#acMainInput');
  const mainInputRow = container.querySelector('#acMainInputRow');
  const sendBtn = container.querySelector('#acSendBtn');

  const fieldsSpeaker = container.querySelector('#fieldsSpeaker');
  const fieldsChapter = container.querySelector('#fieldsChapter');
  const chapterNumField = container.querySelector('#acChapterNumField');

  let currentMode = 'paragraph';
  let dialogueType = 'normal';
  let chapterType = 'normal';

  function addBlock(html) {
    draft.push(html);
    preview.insertAdjacentHTML('beforeend', html);
    preview.scrollTop = preview.scrollHeight;
    draftCountEl.textContent = `${draft.length} بلاک آماده‌ی انتشار`;
    publishBtn.disabled = draft.length === 0;
  }

  /* ── سوییچ حالت ── */
  function setMode(mode) {
    currentMode = mode;
    const cfg = MODES[mode];

    container.querySelectorAll('.ac-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

    fieldsSpeaker.classList.toggle('visible', cfg.extraFields.includes('speaker'));
    fieldsChapter.classList.toggle('visible', cfg.extraFields.includes('chapter'));

    mainInputRow.style.display = cfg.useMain ? 'flex' : 'none';
    mainInput.placeholder = cfg.placeholder;
    mainInput.rows = (mode === 'timebreak' || mode === 'action') ? 1 : 2;

    if (cfg.useMain) mainInput.focus();
  }

  container.querySelector('#acModeRow').addEventListener('click', (e) => {
    const btn = e.target.closest('.ac-mode-btn');
    if (!btn) return;
    setMode(btn.dataset.mode);
  });

  /* ── تاگل نوع دیالوگ ── */
  container.querySelector('#acDialogueTypeToggle').addEventListener('click', (e) => {
    const opt = e.target.closest('.ac-toggle-opt');
    if (!opt) return;
    container.querySelectorAll('#acDialogueTypeToggle .ac-toggle-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    dialogueType = opt.dataset.val;
  });

  /* ── تاگل نوع فصل ── */
  container.querySelector('#acChapterTypeToggle').addEventListener('click', (e) => {
    const opt = e.target.closest('.ac-toggle-opt');
    if (!opt) return;
    container.querySelectorAll('#acChapterTypeToggle .ac-toggle-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    chapterType = opt.dataset.val;
    chapterNumField.style.display = chapterType === 'flashback' ? 'none' : 'flex';
  });

  /* ── ارسال (دکمه‌ی واحد برای همه‌ی حالت‌ها) ── */
  function submitCurrentMode() {
    if (currentMode === 'chapter') {
      const title = container.querySelector('#acChapterTitle').value.trim();
      const number = container.querySelector('#acChapterNum').value.trim();
      if (!title) return;
      if (chapterType === 'normal' && !number) return;
      addBlock(buildChapter(number, title, chapterType === 'flashback'));
      container.querySelector('#acChapterTitle').value = '';
      container.querySelector('#acChapterNum').value = '';
      return;
    }

    const text = mainInput.value.trim();
    if (!text) return;

    switch (currentMode) {
      case 'paragraph':
        addBlock(buildParagraph(text));
        break;
      case 'dialogue': {
        const speaker = container.querySelector('#acSpeakerInput').value.trim();
        if (!speaker) return;
        addBlock(buildDialogue(speaker, text, dialogueType === 'inner'));
        break;
      }
      case 'timebreak':
        addBlock(buildTimebreak(text));
        break;
      case 'highlight':
        addBlock(buildHighlight(text));
        break;
      case 'action':
        addBlock(buildAction(text));
        break;
    }
    mainInput.value = '';
  }

  sendBtn.addEventListener('click', submitCurrentMode);

  // Enter می‌فرسته، Shift+Enter خط جدید (برای حالت‌های تک‌خطی مثل اکشن/تایم‌برک، خود Enter هم کافیه)
  mainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && (currentMode === 'timebreak' || currentMode === 'action')) {
      e.preventDefault();
      submitCurrentMode();
    }
  });

  /* ── toggle باز/بسته شدن پنل ── */
  const toggleBtn = container.querySelector('#acToggleBtn');
  const panel = container.querySelector('#acPanel');
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) setMode('paragraph');
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

  // حالت اولیه
  setMode('paragraph');
}
