/* ══════════════════════════════════════════════════
   phase-admin.js — رندر داینامیک فازها + مدیریت از تو سایت

   نحوه‌ی استفاده تو phase.html:
   ۱) تگ <div class="timeline-wrap">...</div> رو خالی کن:
      <div class="timeline-wrap" id="timelineWrap"></div>
   ۲) این اسکریپت رو اضافه کن:
      <script type="module">
        import { renderTimeline } from './phase-admin.js';
        renderTimeline('timelineWrap');
      </script>

   ⚠️ اگه ستون تشخیص ادمین اسمش is_admin نیست، پایین‌تر عوضش کن.
══════════════════════════════════════════════════ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ADMIN_COLUMN = 'is_admin';

const STYLE_ID = 'pa-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .pa-admin-bar {
      display: flex; justify-content: center; margin-bottom: 30px;
    }
    .pa-add-phase-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 22px;
      border-radius: 30px;
      border: 1px dashed rgba(25,167,255,0.35);
      background: rgba(25,167,255,0.05);
      color: #19a7ff;
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      font-size: 0.85rem; font-weight: 700;
      cursor: none;
    }
    .pa-add-phase-btn:hover { background: rgba(25,167,255,0.1); }

    .pa-phase-admin-row {
      display: flex; gap: 8px; padding: 10px 26px 4px;
    }
    .pa-mini-btn {
      font-size: 0.72rem; font-weight: 700;
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid rgba(25,167,255,0.15);
      background: rgba(25,167,255,0.04);
      color: rgba(180,210,255,0.7);
      cursor: none;
      font-family: 'Vazirmatn', sans-serif;
    }
    .pa-mini-btn:hover { color: #9be3ff; border-color: rgba(25,167,255,0.35); }
    .pa-mini-btn.pa-danger:hover { color: #ff8fa3; border-color: rgba(255,64,96,0.4); }

    .pa-story-delete {
      flex-shrink: 0;
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px;
      border: 1px solid rgba(255,64,96,0.2);
      background: rgba(255,64,96,0.05);
      color: #ff8fa3;
      cursor: none;
      font-size: 0.8rem;
    }
    .pa-story-delete:hover { background: rgba(255,64,96,0.15); }

    .pa-overlay {
      position: fixed; inset: 0; z-index: 300;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .pa-modal {
      width: 100%; max-width: 420px;
      background: linear-gradient(180deg, #0a1020, #04060e);
      border: 1px solid rgba(25,167,255,0.2);
      border-radius: 18px;
      padding: 28px;
      direction: rtl;
      font-family: 'Vazirmatn', Tahoma, sans-serif;
    }
    .pa-modal h3 { color: #fff; font-size: 1rem; margin-bottom: 18px; }
    .pa-modal label {
      display: block; font-size: 0.78rem; color: rgba(180,210,255,0.55);
      margin-bottom: 5px; margin-top: 12px;
    }
    .pa-modal label:first-of-type { margin-top: 0; }
    .pa-modal input, .pa-modal textarea {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(25,167,255,0.15);
      border-radius: 8px;
      color: #ddeeff;
      padding: 9px 12px;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 0.85rem;
    }
    .pa-modal-actions {
      display: flex; gap: 10px; margin-top: 20px;
    }
    .pa-modal-actions button {
      flex: 1; padding: 10px; border-radius: 10px; border: none;
      font-family: 'Vazirmatn', sans-serif; font-weight: 700; cursor: none;
    }
    .pa-modal-save {
      background: linear-gradient(135deg, #19a7ff, #1fb6ff); color: #001828;
    }
    .pa-modal-cancel {
      background: rgba(255,255,255,0.06); color: rgba(180,210,255,0.7);
    }
  `;
  document.head.appendChild(style);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

async function checkAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select(ADMIN_COLUMN)
    .eq('id', session.user.id)
    .single();
  return !!(profile && profile[ADMIN_COLUMN] === true);
}

function openModal(title, fields, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'pa-overlay';
  overlay.innerHTML = `
    <div class="pa-modal">
      <h3>${title}</h3>
      ${fields.map(f => `
        <label>${f.label}</label>
        ${f.type === 'textarea'
          ? `<textarea id="pa_${f.key}" rows="3" placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>`
          : `<input type="${f.type || 'text'}" id="pa_${f.key}" placeholder="${f.placeholder || ''}" value="${f.value || ''}" />`
        }
      `).join('')}
      <div class="pa-modal-actions">
        <button class="pa-modal-cancel" id="paCancel">انصراف</button>
        <button class="pa-modal-save" id="paSave">ذخیره</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#paCancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#paSave').addEventListener('click', () => {
    const values = {};
    fields.forEach(f => { values[f.key] = overlay.querySelector('#pa_' + f.key).value.trim(); });
    onSave(values, overlay);
  });
}

/* ══════════════════════════════
   رندر اصلی تایم‌لاین
══════════════════════════════ */
export async function renderTimeline(containerId) {
  injectStyles();
  const container = document.getElementById(containerId);
  if (!container) return;

  const isAdmin = await checkAdmin();

  const { data: phases } = await supabase
    .from('phases')
    .select('*')
    .order('order_index', { ascending: true });

  const { data: stories } = await supabase
    .from('phase_stories')
    .select('*')
    .order('order_index', { ascending: true });

  container.innerHTML = '';

  if (isAdmin) {
    const bar = document.createElement('div');
    bar.className = 'pa-admin-bar';
    bar.innerHTML = `<button class="pa-add-phase-btn" id="paAddPhaseBtn">➕ افزودن فاز جدید</button>`;
    container.appendChild(bar);
    bar.querySelector('#paAddPhaseBtn').addEventListener('click', () => {
      openModal('فاز جدید', [
        { key: 'phase_number', label: 'شماره فاز', type: 'number', placeholder: 'مثلاً 3' },
        { key: 'title', label: 'عنوان فاز', placeholder: 'مثلاً: سایه‌های پنهان' },
      ], async (values, overlay) => {
        if (!values.phase_number || !values.title) return;
        await supabase.from('phases').insert({
          phase_number: parseInt(values.phase_number, 10),
          title: values.title,
          order_index: (phases?.length || 0) + 1,
          is_coming_soon: true,
        });
        overlay.remove();
        renderTimeline(containerId);
      });
    });
  }

  (phases || []).forEach(phase => {
    const phaseStories = (stories || []).filter(s => s.phase_id === phase.id);

    const block = document.createElement('div');
    block.className = 'phase-block reveal in';
    block.id = 'phase-' + phase.phase_number;

    const storiesHtml = phaseStories.length
      ? phaseStories.map((s, idx) => `
          <div class="phase-content" style="max-height:1200px;">
            <div class="phase-inner" style="display:flex; align-items:center; gap:10px;">
              <a href="${s.link}" class="story-card" style="flex:1;">
                <span class="story-index">${String(idx + 1).padStart(2, '0')}</span>
                <div class="story-info">
                  <h4>${escapeHtml(s.title)}</h4>
                  <p>${escapeHtml(s.description)}</p>
                </div>
                <span class="story-arrow">◀</span>
              </a>
              ${isAdmin ? `<button class="pa-story-delete" data-story-id="${s.id}">✕</button>` : ''}
            </div>
          </div>
        `).join('')
      : `<div class="phase-content" style="max-height:1200px;"><div class="phase-inner">
          <div class="coming-soon">⏳ &nbsp; به زودی معرفی می‌شود</div>
        </div></div>`;

    block.innerHTML = `
      <div class="phase-card">
        <div class="phase-header" onclick="this.closest('.phase-block').classList.toggle('open')">
          <div>
            <div class="phase-num">PHASE ${String(phase.phase_number).padStart(2, '0')}</div>
            <div class="phase-title">${escapeHtml(phase.title)}</div>
          </div>
          <div class="phase-arrow">▶</div>
        </div>
        ${storiesHtml}
        ${isAdmin ? `
          <div class="pa-phase-admin-row">
            <button class="pa-mini-btn" data-add-story-phase="${phase.id}">➕ افزودن داستان</button>
            <button class="pa-mini-btn pa-danger" data-delete-phase="${phase.id}">حذف فاز</button>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(block);
  });

  if (!isAdmin) return;

  /* ── حذف داستان ── */
  container.querySelectorAll('[data-story-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!confirm('مطمئنی می‌خوای این داستان رو حذف کنی؟')) return;
      await supabase.from('phase_stories').delete().eq('id', btn.dataset.storyId);
      renderTimeline(containerId);
    });
  });

  /* ── افزودن داستان به فاز ── */
  container.querySelectorAll('[data-add-story-phase]').forEach(btn => {
    btn.addEventListener('click', () => {
      const phaseId = btn.dataset.addStoryPhase;
      openModal('داستان جدید', [
        { key: 'title', label: 'عنوان داستان', placeholder: 'مثلاً: الکتروپالس' },
        { key: 'description', label: 'توضیح کوتاه', type: 'textarea', placeholder: 'یه خط توضیح...' },
        { key: 'link', label: 'آدرس صفحه', placeholder: '/story/story3.html' },
        { key: 'story_slug', label: 'اسلاگ (برای سیستم امتیازدهی/نوشتن)', placeholder: 'مثلاً: story-three' },
      ], async (values, overlay) => {
        if (!values.title || !values.link) return;
        const currentCount = (stories || []).filter(s => s.phase_id === phaseId).length;
        await supabase.from('phase_stories').insert({
          phase_id: phaseId,
          title: values.title,
          description: values.description || '',
          link: values.link,
          story_slug: values.story_slug || null,
          order_index: currentCount + 1,
        });
        overlay.remove();
        renderTimeline(containerId);
      });
    });
  });

  /* ── حذف فاز ── */
  container.querySelectorAll('[data-delete-phase]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('حذف کل فاز و داستان‌های توش؟ این کار برگشت‌ناپذیره.')) return;
      await supabase.from('phases').delete().eq('id', btn.dataset.deletePhase);
      renderTimeline(containerId);
    });
  });
}
