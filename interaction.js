(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  const seen = new WeakSet();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!reduced.matches) entry.target.classList.add(
        entry.target.matches('.route-finish') ? 'is-visible' : 'revision-arrive'
      );
    }
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  const topics = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      topics.unobserve(target);
      if (!reduced.matches) target.classList.add('topic-arrive');
    }
  }, {threshold: .18});
  const credentialImages = new WeakSet();
  const credentialCards = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      credentialCards.unobserve(target);
      const image = target.querySelector('img');
      if (!image) continue;
      image.loading = 'eager';
      image.decoding = 'async';
      if ('fetchPriority' in image) image.fetchPriority = 'high';
    }
  }, {rootMargin: '260px 0px', threshold: 0});

  function bindCredentialCards(root = document) {
    root.querySelectorAll('.credential-gallery .credential-preview').forEach(card => {
      const image = card.querySelector('img');
      if (!image || credentialImages.has(image)) return;
      credentialImages.add(image);
      credentialCards.observe(card);
    });
  }

  function bindDocumentViewer() {
    const dialog = document.querySelector('dialog.v2-document-dialog');
    if (!dialog || dialog.dataset.credentialStatusBound) return;
    const stage = dialog.querySelector('[data-view-stage]');
    const image = dialog.querySelector('[data-view-image]');
    if (!stage || !image) return;
    dialog.dataset.credentialStatusBound = 'true';

    const status = document.createElement('p');
    status.className = 'v3-credential-view-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.hidden = true;
    status.style.cssText = 'position:absolute;inset:0;z-index:2;place-items:center;margin:0;padding:24px;background:rgba(33,28,33,.92);color:#fff;text-align:center;font:600 16px/1.55 Manrope,Arial,sans-serif;';
    stage.style.position = 'relative';
    stage.append(status);

    const setStatus = (message) => {
      status.textContent = message;
      status.hidden = !message;
      status.style.display = message ? 'grid' : 'none';
      image.style.visibility = message ? 'hidden' : '';
    };
    const finishError = () => setStatus('Не удалось загрузить этот документ. Закройте просмотр и попробуйте ещё раз позже.');
    const loadingMessage = () => {
      const usingFallback = image.dataset.mediaOriginal || image.src.startsWith('data:');
      setStatus(usingFallback ? 'Загружается резервное изображение документа…' : 'Загружается документ…');
    };
    const refresh = () => {
      if (!image.getAttribute('src')) { setStatus(''); return; }
      if (image.dataset.mediaUnavailable === 'true') { finishError(); return; }
      if (image.complete && image.naturalWidth > 0) { setStatus(''); return; }
      loadingMessage();
    };
    image.addEventListener('load', refresh);
    image.addEventListener('error', loadingMessage);
    image.addEventListener('media-unavailable', finishError);
    new MutationObserver(refresh).observe(image, {attributes:true, attributeFilter:['src','data-media-original','data-media-unavailable']});
    refresh();
  }

  function bindMediaUi() {
    bindCredentialCards();
    bindDocumentViewer();
  }
  function bind() {
    document.querySelectorAll('#HM02 .topic-card').forEach((card,index) => {
      if (seen.has(card)) return;
      seen.add(card);
      card.style.setProperty('--topic-delay', (index % 3) * 65 + 'ms');
      topics.observe(card);
    });
    for (const section of document.querySelectorAll('#main .section, #HM04 .route-finish')) {
      if (seen.has(section)) continue;
      seen.add(section); observer.observe(section);
    }
    bindCredentialCards(document);
  }
  bind();
  const app = document.getElementById('app');
  if (app) new MutationObserver(bind).observe(app, {childList:true});
  const mediaUiObserver = new MutationObserver(bindMediaUi);
  mediaUiObserver.observe(document.body, {childList:true, subtree:true});
  bindMediaUi();
})();
