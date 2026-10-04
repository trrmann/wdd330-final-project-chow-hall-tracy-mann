async function loadPartial(selector, url) {
  const mountPoint = document.querySelector(selector);
  const response = await fetch(url);

  if (!mountPoint || !response.ok) {
    throw new Error(`Unable to load site partial: ${url}`);
  }

  mountPoint.outerHTML = await response.text();
}

export async function loadSiteShell(activePage) {
  await Promise.all([
    loadPartial('#site-header', '/partials/header.html'),
    loadPartial('#site-footer', '/partials/footer.html'),
  ]);

  const header = document.querySelector('.site-header');
  const navigation = header.querySelector('#site-navigation');
  const menuToggle = header.querySelector('[data-menu-toggle]');
  const openIcon = menuToggle.querySelector('[data-menu-open-icon]');
  const closeIcon = menuToggle.querySelector('[data-menu-close-icon]');

  if (activePage === 'home') {
    header.querySelector('[data-home-link]').setAttribute('aria-current', 'page');
  }

  const activeLink = navigation.querySelector(`[data-nav-page="${activePage}"]`);
  activeLink?.setAttribute('aria-current', 'page');

  function setMenuOpen(isOpen) {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', isOpen);
    openIcon.hidden = isOpen;
    closeIcon.hidden = !isOpen;
  }

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', () => setMenuOpen(false));
}
