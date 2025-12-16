function wait(sel) {
  return new Promise((r) => {
    if (document.querySelector(sel)) return r(document.querySelector(sel));
    new MutationObserver((m, o) => {
      const el = document.querySelector(sel);
      if (el) r(el), o.disconnect();
    }).observe(document.documentElement, { childList: true, subtree: true });
  });
}

let scraipPopup = null;

document.addEventListener('mouseup', async () => {
  const selection = window.getSelection();
  const text = selection ? selection.toString() : '';
  if (text.trim() === '') return;

  const box = await wait('.shadow-long');
  box.style.flexDirection = 'column';

  if (document.querySelector('.scraiper-button')) return;

  const scraiper_button = document.createElement('button');
  scraiper_button.classList.add(
    'btn',
    'relative',
    'btn-secondary',
    'shadow-long',
    'flex',
    'rounded-xl',
    'border-none',
    'active:opacity-1',
    'scraiper-button'
  );
  scraiper_button.textContent = 'Scraip하기';
  box.appendChild(scraiper_button);

  scraiper_button.addEventListener('click', () => {
    window.getSelection().removeAllRanges();

    const encoded = encodeURIComponent(text);

    if (scraipPopup && !scraipPopup.closed) {
      scraipPopup.focus();
      return;
    }

    const w = 700;
    const h = 600;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;

    scraipPopup = window.open(
      `https://proj-scraiper.vercel.app/scraip?content=${encoded}`,
      'scraip_popup',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no`
    );
  });
});
