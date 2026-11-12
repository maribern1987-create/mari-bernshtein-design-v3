(() => {
  'use strict';
  const videoMeta = {
    IMG_6970: ['Понимание себя и собственных ориентиров', 'Понимание себя и личные ориентиры', 86.72],
    IMG_6972: ['Опыт обращения за поддержкой', 'Обращение за поддержкой в семейном вопросе', 23.7],
    IMG_6973: ['Сепарация и свои приоритеты', 'Сепарация и личные приоритеты', 146.12, 'Как после работы с сепарацией меняется отношение к своим приоритетам.'],
    IMG_6974: ['Ясность и личный контакт', 'Личные впечатления от контакта и работы', 51.09],
    IMG_6977: ['Учиться выражать чувства', 'Замечать и выражать чувства', 71, 'Что помогает замечать чувства и постепенно говорить о них.'],
    IMG_6978: ['Спокойствие без осуждения', 'Спокойный разговор без ожидания осуждения', 26.36],
    IMG_6979: ['Внутренний конфликт и изменения', 'Внутренний конфликт и изменения', 35.75],
    IMG_6980: ['Визуализация и работа после', 'Впечатление от визуализации и мысли после встречи', 21.03],
    'unique-20261105': ['Контроль и доверие к себе', 'Ослабить контроль и прислушаться к себе', 140.23]
  };
  const featured = ['IMG_6973', 'IMG_6977', 'IMG_6978'];
  const posterOverrides = {
    IMG_6973: 'v2-media/posters/v2-video-img_6973.webp',
    IMG_6977: 'v2-media/posters/v2-video-img_6977.webp'
  };
  const selectedText = {
    'photo_2025-03-12_20-57-15.webp': { title: 'Уверенность и свои решения', quote: 'За последние несколько дней я успела заметить, что уже могу смелее высказывать своё мнение на работе и даже решилась записаться на новые курсы.' },
    'photo_2024-12-17_16-53-44.webp': { title: 'Желания и потребности', quote: 'Мы работали над возможностью говорить, заявлять о своих желаниях и потребностях. Спустя время я заметила, что сама правда с самой собой начала проясняться.' },
    'photo_2025-01-21_16-36-25.webp': { title: 'Понимание тревоги', quote: 'Однако уже во время сессии я начала понимать, откуда берутся эти чувства, и как они влияют на мою жизнь. Ты создала настолько безопасное пространство, где я смогла открыто рассказать о своих переживаниях.' }
  };
  const fileOf = (src) => decodeURIComponent((src || '').split('?')[0].split('/').pop() || '');
  const videoId = (src) => fileOf(src).replace(/\.mp4$/i, '');
  const durationLabel = (seconds) => { const n = Math.max(0, Math.round(Number(seconds) || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let dialog, trigger, scale = 1;

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'v2-media-dialog v3-media-dialog';
    dialog.setAttribute('aria-label', 'Просмотр материала');
    dialog.innerHTML = '<div class="v3-media-dialog__top"><p class="v3-media-dialog__title" data-title></p><div class="v3-media-dialog__tools" data-zoom-tools hidden><button type="button" data-zoom="out" aria-label="Уменьшить изображение">−</button><button type="button" data-zoom="reset" aria-label="Сбросить масштаб">100%</button><button type="button" data-zoom="in" aria-label="Увеличить изображение">+</button></div><button type="button" class="v3-media-dialog__close" data-media-close aria-label="Закрыть просмотр">Закрыть</button></div><div class="v3-media-dialog__body" data-body></div>';
    document.body.append(dialog);
    dialog.addEventListener('click', e => {
      if (e.target === dialog || e.target.closest('[data-media-close]')) dialog.close();
      const z = e.target.closest('[data-zoom]'); if (!z) return;
      scale = z.dataset.zoom === 'reset' ? 1 : Math.max(.75, Math.min(3, scale + (z.dataset.zoom === 'in' ? .25 : -.25)));
      const img = dialog.querySelector('.v3-original'); if (img) img.style.setProperty('--media-scale', scale);
      dialog.querySelector('[data-zoom="reset"]').textContent = `${Math.round(scale * 100)}%`;
    });
    dialog.addEventListener('close', () => {
      dialog.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
      dialog.querySelector('[data-body]').replaceChildren();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
    return dialog;
  }
  function openImage(src, title, button) {
    const d = ensureDialog(); trigger = button; scale = 1;
    d.querySelector('[data-title]').textContent = title;
    d.querySelector('[data-zoom-tools]').hidden = false; d.querySelector('[data-zoom="reset"]').textContent = '100%';
    const body = d.querySelector('[data-body]');
    const img = document.createElement('img'); img.className = 'v3-original'; img.alt = title;
    const status = document.createElement('p'); status.className = 'v3-original-status'; status.setAttribute('role','status');
    const loading = () => { status.hidden = false; status.textContent = 'Загружаю оригинал сообщения…'; };
    loading();
    img.addEventListener('load', () => { status.hidden = true; });
    img.addEventListener('media-unavailable', () => {
      status.textContent = 'Изображение не загрузилось. ';
      const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Попробовать ещё раз';
      retry.onclick = () => { loading(); const url = new URL(src,document.baseURI); url.searchParams.set('retry',Date.now()); img.src = url.href; };
      status.append(retry);
    });
    body.replaceChildren(status,img); img.src = src;
    if (!d.open) d.showModal(); d.querySelector('[data-media-close]').focus();
  }
  function openVideo(card, button) {
    const src = card?.dataset.videoSrc; if (!src) return;
    const d = ensureDialog(); trigger = button; d.querySelector('[data-title]').textContent = `Видеоотзыв: ${card.dataset.topic}`;
    d.querySelector('[data-zoom-tools]').hidden = true;
    const v = document.createElement('video'); v.className = 'v3-dialog-video'; v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.src = src;
    const preview = card.querySelector('.v3-video-card__poster img');
    if (card.dataset.poster) v.poster = preview?.currentSrc || card.dataset.poster;
    const body = d.querySelector('[data-body]'), error = document.createElement('div');
    error.className = 'v3-media-error'; error.hidden = true; error.setAttribute('role','status'); error.setAttribute('aria-live','polite');
    error.innerHTML = 'Этот ролик не запустился в текущем просмотре. <a target="_blank" rel="noopener noreferrer">Открыть файл видео отдельно</a> или закройте окно и продолжите просмотр остальных отзывов.';
    error.querySelector('a').href = src;
    const showError = () => { if (d.open && v.isConnected) error.hidden = false; };
    let retried = false;
    function start() { v.play().catch(e => { if (e.name !== 'AbortError' && e.name !== 'NotSupportedError') showError(); }); }
    v.addEventListener('error', () => {
      if (!d.open || !v.isConnected) return;
      if (retried) { showError(); return; }
      retried = true;
      const url = new URL(src,document.baseURI); url.searchParams.set('media-retry','1');
      v.src = url.href; start();
    });
    v.addEventListener('playing', () => { error.hidden = true; });
    body.replaceChildren(v, error);
    if (!d.open) d.showModal(); start(); d.querySelector('[data-media-close]').focus();
  }
  function makeTextCard(img, index) {
    const file = fileOf(img.getAttribute('src')), item = selectedText[file];
    const card = document.createElement('article'); card.className = 'v2-review-card v2-text-card v3-text-card';
    card.dataset.reviewSource = img.getAttribute('src');
    card.innerHTML = item ? `<p class="v3-media-kicker">Отзыв в сообщении</p><h3>${escapeHtml(item.title)}</h3><blockquote>«${escapeHtml(item.quote)}»</blockquote><button type="button" class="v2-review-link" data-open-original>Открыть оригинал</button>` : `<p class="v3-media-kicker">Оригинал сообщения</p><h3>Отзыв в сообщении</h3><button type="button" class="v2-review-link" data-open-original>Открыть оригинал</button>`;
    card.setAttribute('aria-label', `Отзыв в сообщении ${index + 1}`); return card;
  }
  function mountTextReviews() {
    const section = document.querySelector('#HM07_TEXT, #HM07');
    const track = section?.querySelector('.text-review-grid'); if (!track || track.dataset.v3MediaReady) return;
    const imgs = [...track.querySelectorAll('.screenshot-slot img')];
    const unique = [...new Map(imgs.map(img => [fileOf(img.src), img])).values()];
    if (!unique.length) return;
    const byFile = new Map(unique.map(img => [fileOf(img.src), img]));
    const firstNames = Object.keys(selectedText);
    const first = firstNames.map(name => byFile.get(name)).filter(Boolean);
    const rest = unique.filter(img => !first.includes(img));
    track.replaceChildren(...first.map(makeTextCard));
    track.classList.add('v3-text-review-grid');
    track.setAttribute('aria-label', 'Три выбранные выдержки из отзывов; оригинал открывается отдельно');
    if (rest.length && !section.querySelector('.v3-review-archive')) {
      const details = document.createElement('details'); details.className = 'v3-review-archive';
      const summary = document.createElement('summary'); summary.textContent = `Все оригиналы сообщений (${rest.length} дополнительных)`;
      const grid = document.createElement('div'); grid.className = 'v3-review-archive__grid';
      grid.append(...rest.map(makeTextCard)); details.append(summary, grid); track.after(details);
    }
    track.dataset.v3MediaReady = 'true';
  }
  function makeVideoCard(old, index) {
    const video = old.querySelector('video'); if (!video) return null;
    const id = videoId(video.getAttribute('src')), meta = videoMeta[id];
    const topic = meta?.[0] || 'Видеоотзыв';
    const poster = posterOverrides[id] || video.getAttribute('poster') || '';
    const card = document.createElement('article'); card.className = 'v3-video-card'; card.dataset.videoSrc = video.getAttribute('src'); card.dataset.poster = poster; card.dataset.topic = topic;
    card.innerHTML = `<div class="v3-video-card__poster">${poster ? `<img src="${escapeHtml(poster)}" alt="Кадр видеоотзыва: ${escapeHtml(topic)}" loading="lazy">` : '<div class="v3-video-placeholder" aria-hidden="true"></div>'}<button type="button" class="v3-play" data-play aria-label="Смотреть видеоотзыв: ${escapeHtml(topic)}"><span aria-hidden="true">▶</span></button><span class="v3-duration">${durationLabel(meta?.[2] || video.duration)}</span></div><div class="v3-video-card__copy"><p class="v3-media-kicker">Видеоотзыв</p><h3>${escapeHtml(topic)}</h3>${meta?.[3] ? `<p>${escapeHtml(meta[3])}</p>` : ''}<button type="button" class="v2-review-link" data-play aria-label="Смотреть видеоотзыв: ${escapeHtml(topic)}">Смотреть отзыв <span aria-hidden="true">↗</span></button></div>`;
    card.setAttribute('role', 'group'); return card;
  }
  function mountVideoReviews() {
    const section = document.querySelector('#HM07_VIDEO');
    const track = section?.querySelector('.video-review-grid'); if (!track || track.dataset.v3MediaReady) return;
    const cards = [...track.querySelectorAll('.round-review')].map(makeVideoCard).filter(Boolean);
    if (!cards.length) return;
    cards.sort((a,b) => { const ia = featured.indexOf(videoId(a.dataset.videoSrc)), ib = featured.indexOf(videoId(b.dataset.videoSrc)); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    track.replaceChildren(...cards); track.classList.add('v3-video-track'); track.setAttribute('tabindex','0'); track.setAttribute('role','region'); track.setAttribute('aria-label','Видеоотзывы. Используйте стрелки управления или прокрутку');
    const rail = track.closest('[data-media-rail]') || track.parentElement; rail.classList.add('v3-video-rail');
    let controls = rail.querySelector('.v3-carousel-controls');
    if (!controls) { controls = document.createElement('div'); controls.className = 'v3-carousel-controls'; controls.innerHTML = '<button type="button" data-step="-1" aria-label="Предыдущие видеоотзывы">←</button><p aria-live="polite" data-position></p><button type="button" data-step="1" aria-label="Следующие видеоотзывы">→</button>'; rail.append(controls); }
    const prev = controls.querySelector('[data-step="-1"]'), next = controls.querySelector('[data-step="1"]'), position = controls.querySelector('[data-position]');
    const update = () => { const max = Math.max(0, track.scrollWidth - track.clientWidth); prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max - 2; const bounds = track.getBoundingClientRect(); const visible = cards.map((card, index) => ({ index, rect: card.getBoundingClientRect() })).filter(item => Math.min(item.rect.right, bounds.right) - Math.max(item.rect.left, bounds.left) >= Math.min(80, item.rect.width * .45)); const first = visible[0]?.index ?? 0, last = visible.at(-1)?.index ?? first; position.textContent = `${first + 1}–${last + 1} из ${cards.length}`; };
    controls.addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (!b) return; const card = track.querySelector('.v3-video-card'); const gap = parseFloat(getComputedStyle(track).gap) || 16; track.scrollBy({left:(card?.getBoundingClientRect().width || track.clientWidth) * Number(b.dataset.step) + gap * Number(b.dataset.step),behavior:'smooth'}); });
    track.addEventListener('scroll', update, {passive:true}); track.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({left:(e.key === 'ArrowRight' ? 1 : -1) * track.clientWidth,behavior:'smooth'}); } });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track); else window.addEventListener('resize', update);
    update(); track.dataset.v3MediaReady = 'true';
  }
  function mountReviewArchive() {
    const grid = document.querySelector('#app .mixed-review-grid');
    if (!grid || grid.dataset.v3MediaReady) return;
    const photos = [...new Map([...grid.querySelectorAll('.screenshot-slot img')].map(img => [fileOf(img.src), img])).values()];
    const clips = [...grid.querySelectorAll('.round-review')];
    if (!photos.length && !clips.length) return;
    const photoCards = photos.map(makeTextCard);
    const videoCards = clips.map(makeVideoCard).filter(Boolean);
    const entries = []; let p = 0, v = 0;
    while (p < photoCards.length || v < videoCards.length) {
      if (p < photoCards.length) entries.push(photoCards[p++]);
      if (v < videoCards.length && (p >= photoCards.length || v < Math.round(p * videoCards.length / Math.max(1, photoCards.length)))) entries.push(videoCards[v++]);
    }
    grid.replaceChildren(...entries); grid.classList.add('v3-review-archive-grid');
    grid.setAttribute('aria-label', 'Архив текстовых и видеоотзывов. Скриншоты и видеозаписи открываются по действию');
    grid.dataset.v3MediaReady = 'true';
  }
  function mountCredentials() {
    const section = document.querySelector('#HM_CREDENTIALS'); if (!section || section.dataset.v3MediaReady) return;
    const rail = section.querySelector('.credential-gallery .credential-rail');
    const track = rail?.querySelector('.credentials-strip');
    if (!rail || !track) return;
    const all = rail.credentialCards || [...track.querySelectorAll('.credential-preview')];
    const byId = new Map(all.map(card => [card.dataset.credentialId, card]));
    const selections = [
      ['iarpt-1155-diploma', 'Диплом «Репарационная психология и терапия» · 1155 часов · 2025'],
      ['13.png', 'Сертификат семинара «Десенсибилизация и переработка движениями глаз: стандартный и трёхкомпонентный протоколы» · 16 академических часов · 2025'],
      ['photo_5366200606152322824_y.png', 'Сертификат программы «Эриксоновская психотерапия и эриксоновский гипноз» · 26 академических часов · 2024'],
      ['iarpt-attestation', 'Решение аттестационной комиссии по репарационной психологии и терапии']
    ];
    if (selections.some(([id]) => !byId.has(id))) return;
    const featured = document.createElement('div'); featured.className = 'v3-credential-featured';
    const used = new Set();
    selections.forEach(([id, label]) => {
      const card = byId.get(id), item = document.createElement('article');
      item.className = 'v3-credential-feature';
      card.dataset.credentialGroup = '';
      const img = card.querySelector('img'); if (img) img.alt = label;
      item.append(card);
      const caption = document.createElement('p'); caption.className = 'v3-credential-caption'; caption.textContent = label; item.append(caption);
      if (id === 'iarpt-1155-diploma') {
        const appendices = document.createElement('details'); appendices.className = 'v3-credential-appendices';
        appendices.innerHTML = '<summary>Приложения к диплому</summary>';
        const appendixGrid = document.createElement('div'); appendixGrid.className = 'v3-credential-appendices__grid';
        [['iarpt-1155-appendix-1','Приложение к диплому · первая сторона'],['iarpt-1155-appendix-2','Приложение к диплому · продолжение программы']].forEach(([appendixId, title]) => {
          const appendix = byId.get(appendixId); if (!appendix) return;
          const appendixImage = appendix.querySelector('img'); if (appendixImage) appendixImage.alt = title;
          appendix.dataset.credentialGroup = '';
          const appendixCaption = document.createElement('p'); appendixCaption.className = 'v3-credential-caption'; appendixCaption.textContent = title; appendix.append(appendixCaption); appendixGrid.append(appendix); used.add(appendix);
        });
        appendices.append(appendixGrid); item.append(appendices);
      }
      featured.append(item); used.add(card);
    });
    const archive = document.createElement('details'); archive.className = 'v3-credential-archive';
    const archiveCards = all.filter(card => !used.has(card));
    const pair315 = ['iarpt-315-diploma','iarpt-315-appendix'].map(id => byId.get(id)).filter(Boolean);
    const pairSet = new Set(pair315);
    const remainder = archiveCards.filter(card => !pairSet.has(card));
    const summary = document.createElement('summary'); summary.textContent = `Остальные документы · ${archiveCards.length}`;
    archive.append(summary);
    if (pair315.length) {
      const pair = document.createElement('details'); pair.className = 'v3-credential-series';
      const pairSummary = document.createElement('summary'); pairSummary.textContent = 'Диплом и приложение · репарационная психология и терапия · 315 часов';
      const pairGrid = document.createElement('div'); pairGrid.className = 'v3-credential-series__grid';
      pair315.forEach(card => {
        card.dataset.credentialGroup = '';
        const image = card.querySelector('img');
        const captionText = card.dataset.credentialId === 'iarpt-315-diploma' ? 'Диплом «Репарационная психология и терапия» · 315 часов · 2025' : 'Приложение к диплому «Репарационная психология и терапия» · 315 часов · 2025';
        if (image) image.alt = captionText;
        const caption = document.createElement('p'); caption.className = 'v3-credential-caption'; caption.textContent = captionText;
        card.append(caption); pairGrid.append(card);
      });
      pair.append(pairSummary, pairGrid); archive.append(pair);
    }
    const remaining = document.createDocumentFragment(); remainder.forEach(card => { card.dataset.credentialGroup = ''; remaining.append(card); });
    track.replaceChildren(remaining); rail.credentialCards = remainder;
    archive.append(rail); featured.append(archive);
    const gallery = section.querySelector('.credential-gallery'); gallery.prepend(featured);
    archive.addEventListener('toggle', () => { if (archive.open) requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); });
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    section.dataset.v3MediaReady = 'true';
  }
  function mountIntroFallback() {
    document.querySelectorAll('.about-video .intro-local-frame video').forEach(video => {
      if (video.dataset.v3FallbackBound) return;
      video.dataset.v3FallbackBound = 'true';
      video.addEventListener('error', () => {
        const host = video.closest('.about-video');
        if (!host || host.querySelector('.v3-media-fallback')) return;
        const link = document.createElement('a'); link.className = 'v3-media-fallback';
        link.href = 'https://vkvideo.ru/video822555244_456239048';
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = 'Видео не удалось открыть. Посмотреть видео-знакомство во ВКонтакте';
        host.append(link);
      });
    });
    document.querySelectorAll('.session-film').forEach(frame => {
      if (frame.dataset.v3ExternalFallback) return;
      frame.dataset.v3ExternalFallback = 'true';
      const link = document.createElement('a'); link.className = 'v3-media-fallback v3-session-fallback';
      link.href = 'https://vkvideo.ru/video822555244_456239197';
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.textContent = 'Если встроенный плеер не откроется, посмотреть видео о первой сессии во ВКонтакте';
      frame.insertAdjacentElement('afterend', link);
    });
  }
  function bindEvents() {
    document.addEventListener('click', e => {
      const original = e.target.closest('[data-open-original]'); if (original) { const card = original.closest('[data-review-source]'); openImage(card.dataset.reviewSource, 'Оригинал сообщения', original); return; }
      const play = e.target.closest('[data-play]'); if (play) openVideo(play.closest('.v3-video-card'), play);
    });
  }
  function mount() { mountTextReviews(); mountVideoReviews(); mountReviewArchive(); mountCredentials(); mountIntroFallback(); }
  if (!document.documentElement.dataset.v3MediaEvents) { bindEvents(); document.documentElement.dataset.v3MediaEvents = 'true'; }
  window.mountV2Media = mount;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
  new MutationObserver(mount).observe(document.body, {childList:true,subtree:true});
})();
