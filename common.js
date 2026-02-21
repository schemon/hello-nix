// tiny helper: highlight current nav link
(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('nav a[href]');
  for (const a of links){
    const href = a.getAttribute('href');
    if (href === path) a.setAttribute('aria-current', 'page');
  }
})();
