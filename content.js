function wait(sel) {
  return new Promise((r) => {
    if (document.querySelector(sel)) return r(document.querySelector(sel));
    new MutationObserver((m, o) => {
      const el = document.querySelector(sel);
      if (el) r(el), o.disconnect();
    }).observe(document.documentElement, { childList: true, subtree: true });
  });
}

document.addEventListener('mouseup', async () => {
  const selection = window.getSelection();
  const text = selection ? selection.toString() : '';
  if (text.trim() !== '') {
    const box = await wait('.shadow-long');
    box.style.flexDirection = 'column';

    const old_scraiper_buttons = document.querySelectorAll('.scraiper-button');
    if (old_scraiper_buttons.length !== 0) {
      return;
    }

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
      console.log(text);
      window.getSelection().removeAllRanges();
      const url = chrome.runtime.getURL('popup.html');
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.position = 'fixed';
      iframe.style.right = '20px';
      iframe.style.top = '20px';
      iframe.style.width = '300px';
      iframe.style.height = '400px';
      iframe.style.zIndex = '999999';
      document.body.appendChild(iframe);
    });
  }
});
