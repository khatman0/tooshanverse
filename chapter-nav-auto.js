/* ══════════════════════════════════════════════════
   chapter-nav-auto.js — ساخت خودکار سایدبار و پنل موبایل فصل‌ها

   دیگه لازم نیست دستی <a class="chapter-nav-item">... رو تو HTML
   اضافه کنی. این اسکریپت خودش، بعد از این‌که محتوای داینامیک از
   Supabase لود شد، تمام <div class="chapter" id="..."> های صفحه رو
   (چه اونایی که تو HTML اصلی هاردکد شدن، چه اونایی که composer
   ساخته) پیدا می‌کنه و از روشون سایدبار + پنل موبایل رو می‌سازه.

   نحوه‌ی استفاده:
   تو انتهای صفحه‌ی داستان، دقیقاً بعد از اینکه loadStoryContinuation
   تموم شد، این تابع رو صدا بزن:

     import { buildChapterNav } from './chapter-nav-auto.js';
     await loadStoryContinuation('story-dynamic-content', 'electropulse');
     buildChapterNav();

   نکته: چون این تابع کل سایدبار/پنل رو از نو می‌سازه، دیگه
   لازم نیست هیچ <a> ای رو دستی تو HTML بنویسی — کافیه فقط
   ظرف‌های خالی زیر رو تو صفحه داشته باشی:

     <nav class="chapter-nav" id="chapterNav"></nav>
     <div class="chapter-panel" id="chapterPanel">
       <div class="chapter-panel-title">فهرست فصل‌ها</div>
     </div>

   (اگه فعلاً پر از <a> دستی هستن، مشکلی نیست — این اسکریپت
   محتواشون رو کامل پاک و بازسازی می‌کنه.)
══════════════════════════════════════════════════ */

export function buildChapterNav() {
  const chapterEls = Array.from(document.querySelectorAll('.chapter[id]'));

  const nav = document.getElementById('chapterNav');
  const panel = document.getElementById('chapterPanel');
  if (!nav && !panel) return;

  // برچسب هر فصل رو از خود span.chapter-title می‌گیریم
  const items = chapterEls.map(ch => {
    const titleEl = ch.querySelector('.chapter-title');
    const label = titleEl ? titleEl.textContent.trim() : ch.id;
    return { id: ch.id, label };
  });

  /* ── سایدبار دسکتاپ ── */
  if (nav) {
    nav.innerHTML = items.map(it => `
      <a class="chapter-nav-item" href="#${it.id}">
        <span class="chapter-nav-dot"></span>
        <span class="chapter-nav-label">${it.label}</span>
      </a>
    `).join('');
  }

  /* ── پنل موبایل (تیتر «فهرست فصل‌ها» رو نگه می‌داریم) ── */
  if (panel) {
    const titleHtml = '<div class="chapter-panel-title">فهرست فصل‌ها</div>';
    panel.innerHTML = titleHtml + items.map(it => `
      <a class="chapter-panel-item" href="#${it.id}">
        <span class="dot"></span>
        ${it.label}
      </a>
    `).join('');
  }

  /* ── وصل کردن رفتارها (چون innerHTML عوض شد، باید دوباره bind بشن) ── */

  // بستن پنل موبایل با کلیک روی هر آیتم
  const chOverlay = document.getElementById('chapterOverlay');
  panel?.querySelectorAll('.chapter-panel-item').forEach(item => {
    item.addEventListener('click', () => {
      panel.classList.remove('open');
      chOverlay?.classList.remove('open');
    });
  });

  // هایلایت‌شدن فصل فعال حین اسکرول (سایدبار)
  const navItems = nav ? Array.from(nav.querySelectorAll('.chapter-nav-item')) : [];
  if (navItems.length) {
    const chapterObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });

    chapterEls.forEach(ch => chapterObserver.observe(ch));
  }
}
