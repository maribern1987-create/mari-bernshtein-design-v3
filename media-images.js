(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const inflight = new Map();
  const attempts = new WeakMap();
  function keyFor(src) {
    const url = new URL(src, base);
    return url.origin === base.origin && url.pathname.startsWith(base.pathname)
      ? url.pathname.slice(base.pathname.length) : '';
  }
  function unavailable(img) {
    img.dataset.mediaUnavailable = 'true';
    img.dispatchEvent(new Event('media-unavailable'));
  }
  function pack(name) {
    if (!inflight.has(name)) {
      const url = new URL('media-images/' + name, base);
      inflight.set(name, fetch(url, {credentials:'same-origin'}).then(response => {
        if (!response.ok) throw Error('Media ' + response.status);
        return response.json();
      }).catch(error => { inflight.delete(name); throw error; }));
    }
    return inflight.get(name);
  }
  function recover(img) {
    if (!(img instanceof HTMLImageElement)) return;
    const src = img.getAttribute('src');
    if (!src) return;
    if (src.startsWith('data:')) { if (img.dataset.mediaOriginal) unavailable(img); return; }
    const key = keyFor(src), name = window.mariImagePacks?.[key];
    if (!name || attempts.get(img) === src) return;
    attempts.set(img,src);
    img.dataset.mediaOriginal = src;
    delete img.dataset.mediaUnavailable;
    pack(name).then(images => {
      if (img.getAttribute('src') !== src) return;
      if (!images[key]) throw Error('Missing image');
      img.src = 'data:image/webp;base64,' + images[key];
    }).catch(() => { if (img.getAttribute('src') === src) unavailable(img); })
      .finally(() => { if (attempts.get(img) === src) attempts.delete(img); });
  }
  document.addEventListener('error', event => recover(event.target), true);
  document.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) delete event.target.dataset.mediaUnavailable;
  },true);
  for (const img of document.images) if (img.complete && !img.naturalWidth) recover(img);
})();
