import {
  loadPartial,
  getQueryParam,
  persistQueryParameter
} from './utils.js';
import {
  SiteData,
  siteData
} from './modules/site-data.js'

const menuListClass = '.site-nav';
const menuItemTemplateId = 'menu-item-template';

export function updateHeaderWeekParameters(newWeekValue) {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const brandAnchor = header.querySelector('a.site-brand');
  if (brandAnchor) {
    brandAnchor.href = persistQueryParameter(brandAnchor.href, 'week', newWeekValue);
  }
  const menuLinks = header.querySelectorAll('.site-nav-link');
  menuLinks.forEach((anchor) => {
    anchor.href = persistQueryParameter(anchor.href, 'week', newWeekValue);
  });
}
export async function loadSiteShell(activePage) {
  await siteData.initialize();
  await Promise.all([
    loadPartial('#site-header', '/partials/header.html'),
    loadPartial('#site-footer', '/partials/footer.html'),
  ]);

  const header = document.querySelector('.site-header');
  const brandAnchor = header.querySelector('a.site-brand');
  const navigation = header.querySelector('#site-navigation');
  const menuToggle = header.querySelector('[data-menu-toggle]');
  const openIcon = menuToggle.querySelector('[data-menu-open-icon]');
  const closeIcon = menuToggle.querySelector('[data-menu-close-icon]');
  const parms = {};
  parms.week = getQueryParam('week', 'current');
  brandAnchor.href = persistQueryParameter(brandAnchor.href, 'week', parms.week);
  const menuList = document.querySelector(menuListClass);
  const menuItemTemplate = document.getElementById(menuItemTemplateId);
  SiteData.shellMenuItems.forEach(item => {
    const clone = menuItemTemplate.content.cloneNode(true);
    const anchor = clone.querySelector('a');
    anchor.href = persistQueryParameter(item.href, 'week', parms.week);
    anchor.dataset.navPage = item.dataNavPage;
    anchor.textContent = item.display;
    anchor.className = item.class;
    menuList.appendChild(clone);
  });

  if (activePage === 'home') {
    header.querySelector('[data-home-link]').setAttribute('aria-current', 'page');
  }

  const activeLink = navigation.querySelector(`[data-nav-page="${activePage}"]`);
  activeLink?.setAttribute('aria-current', 'page');

  function setMenuOpen(isOpen) {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', isOpen);

    // FIX: Force clean addition/removal of the native 'hidden' HTML attribute 
    if (isOpen) {
      openIcon.setAttribute('hidden', '');
      closeIcon.removeAttribute('hidden');
    } else {
      openIcon.removeAttribute('hidden');
      closeIcon.setAttribute('hidden', '');
    }
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
  return parms;
}
