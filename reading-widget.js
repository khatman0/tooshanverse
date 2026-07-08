/* ══════════════════════════════════════════════════
   ویجت «خوندمش» — توشان‌ورس
   نحوه‌ی استفاده: توی هر صفحه‌ی فصل/کمیک، این کد رو اضافه کن:

   <div id="reading-widget" data-slug="SLUG-همون-فصل"></div>
   <script type="module">
     import { mountReadingWidget } from './reading-widget.js';
     mountReadingWidget('reading-widget');
   </script>

   SLUG باید دقیقاً همون slugی باشه که توی جدول content_items
   برای اون فصل ثبت کردی.
══════════════════════════════════════════════════ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STYLE_ID = 'trw-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .trw-box {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      max-width: 640px;
      margin: 40px auto;
      background: rgba(8,14,28,0.7);
      border: 1px solid rgba(25,167,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(20px);
      padding: 28px 32px;
      text-align: center;
      direction: rtl;
    }
    .trw-title {
      font-family: 'Orbitron', sans-serif;
      color: #fff;
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .trw-sub {
      color: rgba(180,210,255,0.55);
      font-size: 0.85rem;
      margin-bottom: 18px;
    }
    .trw-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.92rem;
      border: none;
      cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
      background: linear-gradient(135deg, #19a7ff, #1fb6ff);
      color: #001828;
      box-shadow: 0 8px 30px rgba(25,167,255,0.25);
      transition: transform .2s ease;
    }
    .trw-btn:hover { transform: translateY(-2px); }
    .trw-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .trw-status {
      margin-top: 14px;
      font-size: 0.88rem;
      line-height: 1.8;
      display: none;
    }
    .trw-status.trw-ok { color: #9be3ff; display: block; }
    .trw-status.trw-warn { color: #f0c060; display: block; }
    .trw-status.trw-err { color: #ff8fa3; display: block; }

    .trw-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      z-index: 9995;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .trw-modal {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      direction: rtl;
      width: 100%; max-width: 460px;
      background: linear-gradient(180deg, #0a1020, #04060e);
      border: 1px solid rgba(25,167,255,0.2);
      border-radius: 20px;
      padding: 32px;
      text-align: right;
    }
    .trw-modal-eyebrow {
      font-size: 0.65rem; font-weight: 700; letter-spacing: 3px;
      text-transform: uppercase; color: #f0c060;
      margin-bottom: 10px;
    }
    .trw-modal-q {
      font-size: 1rem; font-weight: 700; color: #fff;
      line-height: 1.8; margin-bottom: 22px;
    }
    .trw-choice {
      display: block; width: 100%;
      text-align: right;
      padding: 13px 16px;
      margin-bottom: 10px;
      background: rgba(25,167,255,0.04);
      border: 1px solid rgba(25,167,255,0.12);
      border-radius: 10px;
      color: #ddeeff;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all .2s ease;
    }
    .trw-choice:hover:not(:disabled) {
      background: rgba(25,167,255,0.1);
      border-color: rgba(25,167,255,0.35);
    }
    .trw-choice:disabled { opacity: .5; cursor: not-allowed; }
    .trw-modal-close {
      margin-top: 8px;
      background: none; border: none;
      color: rgba(180,210,255,0.5);
      font-size: 0.82rem;
      cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
    }
    .trw-modal-close:hover { color: #9be3ff; }
    .trw-modal-result {
      text-align: center;
      padding: 10px 0 4px;
      font-size: 0.95rem;
      line-height: 1.9;
    }
  `;
  document.head.appendChild(style);
}

export async function mountReadingWidget(containerId) {
  injectStyles();
  const container = document.getElementById(containerId);
  if (!container) return;
  const slug = container.dataset.slug;
  if (!slug) {
    console.warn('reading-widget: data-slug تنظیم نشده');
    return;
  }

  container.innerHTML = `
    <div class="trw-box">
      <div class="trw-title">این فصل رو خوندی؟</div>
      <div class="trw-sub">با جواب دادن به یه سؤال کوتاه، امتیازتو ثبت کن</div>
      <button class="trw-btn" id="trwMainBtn">✅ خوندمش</button>
      <div class="trw-status" id="trwStatus"></div>
    </div>
  `;

  const btn = document.getElementById('trwMainBtn');
  const status = document.getElementById('trwStatus');

  function setStatus(text, type) {
    status.textContent = text;
    status.className = 'trw-status trw-' + type;
  }

  // پیدا کردن content_item بر اساس slug
  const { data: item, error: itemErr } = await supabase
    .from('content_items')
    .select('id')
    .eq('slug', slug)
    .single();

  if (itemErr || !item) {
    btn.disabled = true;
    setStatus('این فصل هنوز توی سیستم امتیازی ثبت نشده.', 'warn');
    return;
  }

  const contentItemId = item.id;

  // اگه از قبل تکمیل شده، نشون بده
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: existing } = await supabase
      .from('reading_progress')
      .select('points_earned')
      .eq('user_id', session.user.id)
      .eq('content_item_id', contentItemId)
      .maybeSingle();

    if (existing) {
      btn.disabled = true;
      btn.textContent = '✅ قبلاً ثبت شده';
      setStatus(`قبلاً ${existing.points_earned} امتیاز برای این فصل گرفتی.`, 'ok');
    }
  }

  btn.addEventListener('click', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus('اول باید وارد حسابت بشی.', 'err');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      return;
    }
    openQuestionModal(contentItemId, btn, setStatus);
  });
}

async function openQuestionModal(contentItemId, btn, setStatus) {
  const { data: q, error } = await supabase.rpc('get_random_reading_question', {
    p_content_item_id: contentItemId
  });

  const question = Array.isArray(q) ? q[0] : q;

  if (error || !question) {
    setStatus('سؤالی برای این فصل ثبت نشده.', 'warn');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'trw-overlay';
  overlay.innerHTML = `
    <div class="trw-modal">
      <div class="trw-modal-eyebrow">سؤال تأیید مطالعه</div>
      <div class="trw-modal-q">${question.question_text}</div>
      <div id="trwChoices"></div>
      <div class="trw-modal-result" id="trwResult"></div>
      <button class="trw-modal-close" id="trwCloseModal">بستن</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const choicesBox = overlay.querySelector('#trwChoices');
  const resultBox = overlay.querySelector('#trwResult');
  question.choices.forEach((choiceText, idx) => {
    const b = document.createElement('button');
    b.className = 'trw-choice';
    b.textContent = choiceText;
    b.addEventListener('click', async () => {
      overlay.querySelectorAll('.trw-choice').forEach(c => c.disabled = true);
      const { data: result, error: submitErr } = await supabase.rpc('submit_reading_answer', {
        p_question_id: question.question_id,
        p_chosen_index: idx
      });

      if (submitErr || !result) {
        resultBox.textContent = 'خطا در ثبت جواب. دوباره امتحان کن.';
        return;
      }

      if (result.correct) {
        if (result.already_completed) {
          resultBox.textContent = 'درست بود، ولی قبلاً امتیازشو گرفته بودی.';
        } else {
          resultBox.textContent = `آفرین! درست بود 🎉 (+${result.points} امتیاز)`;
          btn.disabled = true;
          btn.textContent = '✅ قبلاً ثبت شده';
          setStatus(`${result.points} امتیاز برای این فصل گرفتی.`, 'ok');
        }
        setTimeout(() => overlay.remove(), 1800);
      } else {
        resultBox.textContent = 'جواب اشتباه بود. یه سؤال دیگه امتحان کن:';
        setTimeout(() => {
          overlay.remove();
          openQuestionModal(contentItemId, btn, setStatus);
        }, 1400);
      }
    });
    choicesBox.appendChild(b);
  });

  overlay.querySelector('#trwCloseModal').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
